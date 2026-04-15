#!/usr/bin/env bash
# ============================================================================
# Venture Spine -- Notion Portfolio Sync
# ============================================================================
#
# Syncs portfolio-state.yaml + per-project data to the Notion Portfolio Database.
# This script is the "write" side of the CQRS bridge: files -> Notion.
#
# Usage:
#   ./sync-to-notion.sh                  # Sync all projects
#   ./sync-to-notion.sh omniport-hh      # Sync one project
#   ./sync-to-notion.sh --dry-run        # Show what would change
#
# Prerequisites:
#   - Claude Code with Notion MCP connected
#   - projects.json in venture-spine/
#   - portfolio-state.yaml in venture-spine/ or ~/.claude/portfolio/
#   - gh CLI authenticated
#
# Design: This script generates a Claude Code prompt that uses Notion MCP tools
# to perform the actual updates. It does NOT call the Notion API directly.
# This keeps the dependency chain minimal (bash + jq + gh + claude).
#
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_JSON="${SCRIPT_DIR}/projects.json"
PORTFOLIO_STATE="${SCRIPT_DIR}/portfolio-state.yaml"
NOTION_IDS="${SCRIPT_DIR}/notion-page-ids.json"
DRY_RUN=false
SINGLE_PROJECT=""

# -- Notion constants (from notion-schema.md) --------------------------------
NOTION_DB_ID="8142fb34ee8b40b68dae77a4a1505e39"
NOTION_DS_ID="6be88ce0-8de5-4519-8f56-883cf31e4bac"

# -- Parse args ---------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true; shift ;;
        *) SINGLE_PROJECT="$1"; shift ;;
    esac
done

# -- Helpers ------------------------------------------------------------------

log() { echo "[sync-to-notion] $(date +%H:%M:%S) $*"; }
err() { echo "[sync-to-notion] ERROR: $*" >&2; }

# Read a field from projects.json
project_field() {
    local project="$1" field="$2"
    jq -r ".projects[\"${project}\"].${field} // empty" "$PROJECTS_JSON"
}

# Count open issues for a repo
count_open_issues() {
    local repo="$1"
    gh issue list --repo "$repo" --state open --json id --jq '. | length' 2>/dev/null || echo "0"
}

# Count open PRs for a repo
count_open_prs() {
    local repo="$1"
    gh pr list --repo "$repo" --state open --json id --jq '. | length' 2>/dev/null || echo "0"
}

# Days since last commit
days_since_last_commit() {
    local dir="$1"
    if [[ -d "$dir/.git" ]]; then
        local last_commit
        last_commit=$(git -C "$dir" log -1 --format=%ct 2>/dev/null || echo "0")
        if [[ "$last_commit" -gt 0 ]]; then
            local now
            now=$(date +%s)
            echo $(( (now - last_commit) / 86400 ))
        else
            echo "999"
        fi
    else
        echo "999"
    fi
}

# Last commit date (ISO-8601)
last_commit_date() {
    local dir="$1"
    if [[ -d "$dir/.git" ]]; then
        git -C "$dir" log -1 --format=%ci 2>/dev/null | cut -d' ' -f1
    else
        echo ""
    fi
}

# Count active tmux workers for a project
count_active_workers() {
    local project="$1"
    local state_file
    state_file="$(project_field "$project" "dir")/_bmad/orchestrator-tmux-state.json"
    if [[ -f "$state_file" ]]; then
        jq '[.sessions[] | select(.claude_running == true)] | length' "$state_file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Determine health from stale days and blockers
compute_health() {
    local stale_days="$1" tier="$2"
    case "$tier" in
        1)
            if [[ "$stale_days" -gt 3 ]]; then echo "Red"
            elif [[ "$stale_days" -gt 1 ]]; then echo "Yellow"
            else echo "Green"; fi
            ;;
        2)
            if [[ "$stale_days" -gt 7 ]]; then echo "Red"
            elif [[ "$stale_days" -gt 3 ]]; then echo "Yellow"
            else echo "Green"; fi
            ;;
        *)
            if [[ "$stale_days" -gt 30 ]]; then echo "Red"
            elif [[ "$stale_days" -gt 14 ]]; then echo "Yellow"
            else echo "Green"; fi
            ;;
    esac
}

# -- Main: Collect data per project -------------------------------------------

collect_project_data() {
    local project="$1"
    local dir repo tier budget_share

    dir=$(project_field "$project" "dir")
    repo=$(project_field "$project" "repo")
    tier=$(project_field "$project" "tier")
    budget_share=$(project_field "$project" "budget_share")

    # Gather live data
    local open_issues open_prs stale_days last_activity active_workers health
    open_issues=$(count_open_issues "$repo")
    open_prs=$(count_open_prs "$repo")
    stale_days=$(days_since_last_commit "$dir")
    last_activity=$(last_commit_date "$dir")
    active_workers=$(count_active_workers "$project")
    health=$(compute_health "$stale_days" "$tier")

    # Read project-dna.yaml if it exists
    local dna_file="${dir}/_bmad/project-dna.yaml"
    local next_action="" blockers="" lifecycle="" description=""
    if [[ -f "$dna_file" ]]; then
        # Simple YAML parsing (no yq dependency)
        next_action=$(grep '^current_focus:' "$dna_file" 2>/dev/null | sed 's/^current_focus: *//' | tr -d '"' || true)
        blockers=$(grep '^blocking_issues:' "$dna_file" 2>/dev/null | sed 's/^blocking_issues: *//' | tr -d '"[]' || true)
        lifecycle=$(grep '^phase:' "$dna_file" 2>/dev/null | sed 's/^phase: *//' | tr -d '"' || true)
        description=$(grep '^identity:' "$dna_file" 2>/dev/null | sed 's/^identity: *//' | tr -d '"' || true)
    fi

    # Map phase to Notion lifecycle values
    case "$lifecycle" in
        ideation) lifecycle="Ideation" ;;
        research) lifecycle="Research" ;;
        architecture) lifecycle="Architecture" ;;
        active-dev|active_dev) lifecycle="Active Dev" ;;
        maintenance) lifecycle="Maintenance" ;;
        revenue) lifecycle="Revenue" ;;
        sunset) lifecycle="Sunset" ;;
        *) lifecycle="" ;; # leave unchanged if unknown
    esac

    # Map tier number to Notion select value
    local tier_label
    case "$tier" in
        1) tier_label="1 - Revenue" ;;
        2) tier_label="2 - Strategic" ;;
        3) tier_label="3 - Growth" ;;
        4) tier_label="4 - Hibernated" ;;
        *) tier_label="" ;;
    esac

    # Budget share: convert decimal (0.4) to percentage (40)
    local budget_pct
    budget_pct=$(echo "$budget_share" | awk '{printf "%.0f", $1 * 100}')

    # Output JSON for this project
    cat <<EOJSON
{
    "project": "$project",
    "notion_page_id": "$(jq -r ".\"$project\" // empty" "$NOTION_IDS" 2>/dev/null || true)",
    "properties": {
        "Tier": "$tier_label",
        "Health": "$health",
        "Open Issues": $open_issues,
        "Open PRs": $open_prs,
        "Stale Days": $stale_days,
        "Active Workers": $active_workers,
        "Budget Share": $budget_pct,
        "date:Last Activity:start": "$last_activity",
        "date:Last Activity:is_datetime": 0
$([ -n "$lifecycle" ] && echo "        ,\"Lifecycle\": \"$lifecycle\"")
$([ -n "$next_action" ] && echo "        ,\"Next Action\": \"$next_action\"")
$([ -n "$blockers" ] && echo "        ,\"Blockers\": \"$blockers\"")
$([ -n "$description" ] && echo "        ,\"Description\": \"$description\"")
    }
}
EOJSON
}

# -- Main loop ----------------------------------------------------------------

main() {
    if [[ ! -f "$PROJECTS_JSON" ]]; then
        err "projects.json not found at $PROJECTS_JSON"
        err "Create it first (see venture-spine/notion-schema.md)"
        exit 1
    fi

    log "Starting Notion sync..."

    # Get list of projects
    local projects
    if [[ -n "$SINGLE_PROJECT" ]]; then
        projects="$SINGLE_PROJECT"
    else
        projects=$(jq -r '.projects | keys[]' "$PROJECTS_JSON")
    fi

    local updates=()
    for project in $projects; do
        log "Collecting data for: $project"
        local data
        data=$(collect_project_data "$project")

        local page_id
        page_id=$(echo "$data" | jq -r '.notion_page_id')

        if [[ -z "$page_id" || "$page_id" == "null" ]]; then
            log "  WARNING: No Notion page ID for '$project'. Will need to create page."
            log "  Add it to notion-page-ids.json after creation."
            continue
        fi

        if $DRY_RUN; then
            log "  [DRY RUN] Would update page $page_id:"
            echo "$data" | jq '.properties'
        else
            # Generate the MCP update command
            # In practice, this would be called via Claude Code's Notion MCP:
            #   notion-update-page page_id="$page_id" command="update_properties" properties={...}
            #
            # For now, output the command that the orchestrator loop should execute:
            local props
            props=$(echo "$data" | jq -c '.properties')
            echo "NOTION_UPDATE|$page_id|$props" >> "${SCRIPT_DIR}/.notion-sync-queue"
            log "  Queued update for $project (page: $page_id)"
        fi
    done

    if ! $DRY_RUN && [[ -f "${SCRIPT_DIR}/.notion-sync-queue" ]]; then
        local count
        count=$(wc -l < "${SCRIPT_DIR}/.notion-sync-queue" | tr -d ' ')
        log "Queued $count updates in .notion-sync-queue"
        log "The orchestrator loop will process these via Notion MCP."
    fi

    log "Sync complete."
}

# -- Notion page ID management ------------------------------------------------

# Initialize notion-page-ids.json from notion-schema.md if it doesn't exist
init_page_ids() {
    if [[ ! -f "$NOTION_IDS" ]]; then
        log "Creating notion-page-ids.json from schema..."
        cat > "$NOTION_IDS" <<'EOJSON'
{
  "omniport-hh": "32e74ccd-7c69-816d-95ad-c9c07a761de1",
  "orchestrator": "32e74ccd-7c69-81de-a825-e2afa830be4f",
  "cityhub": "32e74ccd-7c69-8176-8afc-f7c7c661bfb5",
  "contentos": "32e74ccd-7c69-81d3-bf62-d6644a1053dc",
  "finance-agent": "32e74ccd-7c69-81cc-be47-c145549ae6a0",
  "wifi-csi": "32e74ccd-7c69-8101-ba60-c3580259d915",
  "craftcode-ai": "32e74ccd-7c69-81c0-8cd6-e66020ccefa5",
  "evergabe": "32e74ccd-7c69-815f-a2e4-fa2e6c4a2445"
}
EOJSON
        log "Created with 8 initial project mappings."
    fi
}

# -- Entry point --------------------------------------------------------------

init_page_ids
main
