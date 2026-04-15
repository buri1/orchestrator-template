#!/usr/bin/env bash
#
# Venture Spine — Project DNA Generator
#
# Generates a ~500-token "Project DNA" summary for each registered project.
# The DNA is the atomic unit of the Venture Spine: a compressed project state
# that enables 30-second context loading instead of 20-minute warmup.
#
# Usage:
#   ./generate-dna.sh                  # Generate DNA for ALL projects
#   ./generate-dna.sh omniport-hh      # Generate DNA for a single project
#   ./generate-dna.sh --output-dir /tmp # Write DNA files to custom directory

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_FILE="$SCRIPT_DIR/projects.json"
OUTPUT_DIR=""  # Default: write to each project's _bmad/ directory
TARGET_SLUG=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: generate-dna.sh [slug] [--output-dir DIR]"
      echo "  slug          Generate DNA for a single project (default: all)"
      echo "  --output-dir  Write all DNA files to DIR instead of per-project _bmad/"
      exit 0
      ;;
    *)
      TARGET_SLUG="$1"
      shift
      ;;
  esac
done

# Verify dependencies
for cmd in jq gh git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: Required command '$cmd' not found." >&2
    exit 1
  fi
done

if [ ! -f "$PROJECTS_FILE" ]; then
  echo "ERROR: projects.json not found at $PROJECTS_FILE" >&2
  exit 1
fi

# Determine which slugs to process
if [ -n "$TARGET_SLUG" ]; then
  # Verify slug exists
  exists=$(jq -r ".projects[\"$TARGET_SLUG\"] // \"null\"" "$PROJECTS_FILE")
  if [ "$exists" = "null" ]; then
    echo "ERROR: Project '$TARGET_SLUG' not found in projects.json" >&2
    echo "Available: $(jq -r '.projects | keys[]' "$PROJECTS_FILE" | tr '\n' ' ')" >&2
    exit 1
  fi
  SLUGS=("$TARGET_SLUG")
else
  SLUGS=()
  while IFS= read -r slug; do
    SLUGS+=("$slug")
  done < <(jq -r '.projects | keys[]' "$PROJECTS_FILE")
fi

generate_dna() {
  local slug="$1"

  local p_name p_path p_repo p_tier p_lifecycle p_stack p_desc p_budget p_daytheme
  p_name=$(jq -r ".projects[\"$slug\"].name" "$PROJECTS_FILE")
  p_path=$(jq -r ".projects[\"$slug\"].path" "$PROJECTS_FILE")
  p_repo=$(jq -r ".projects[\"$slug\"].repo" "$PROJECTS_FILE")
  p_tier=$(jq -r ".projects[\"$slug\"].tier" "$PROJECTS_FILE")
  p_lifecycle=$(jq -r ".projects[\"$slug\"].lifecycle" "$PROJECTS_FILE")
  p_stack=$(jq -r ".projects[\"$slug\"].stack | join(\", \")" "$PROJECTS_FILE")
  p_desc=$(jq -r ".projects[\"$slug\"].description" "$PROJECTS_FILE")
  p_budget=$(jq -r ".projects[\"$slug\"].budget_share" "$PROJECTS_FILE")
  p_daytheme=$(jq -r ".projects[\"$slug\"].day_theme" "$PROJECTS_FILE")

  # Git data
  local last_5_commits="" days_since_commit=999 current_branch="unknown"
  if [ -d "$p_path/.git" ]; then
    last_5_commits=$(cd "$p_path" && git log --oneline -5 2>/dev/null || echo "  (no commits)")
    current_branch=$(cd "$p_path" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    local last_epoch
    last_epoch=$(cd "$p_path" && git log -1 --format='%ct' 2>/dev/null || echo "0")
    if [ "$last_epoch" != "0" ]; then
      local now_epoch
      now_epoch=$(date +%s)
      days_since_commit=$(( (now_epoch - last_epoch) / 86400 ))
    fi
  fi

  # GitHub data
  local open_issues=0 open_prs=0 issue_labels=""
  if [ -n "$p_repo" ] && [ "$p_repo" != "null" ]; then
    open_issues=$(gh issue list --repo "$p_repo" --state open --limit 100 --json number 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
    open_prs=$(gh pr list --repo "$p_repo" --state open --limit 100 --json number 2>/dev/null | jq 'length' 2>/dev/null || echo "0")

    # Get top issue titles (up to 5)
    issue_labels=$(gh issue list --repo "$p_repo" --state open --limit 5 --json title,number 2>/dev/null | \
      jq -r '.[] | "  - #\(.number): \(.title)"' 2>/dev/null || echo "  (none)")
  fi

  # CLAUDE.md excerpt (first 10 non-empty lines after the title)
  local claude_excerpt="(no CLAUDE.md found)"
  if [ -f "$p_path/CLAUDE.md" ]; then
    claude_excerpt=$(head -20 "$p_path/CLAUDE.md" 2>/dev/null | grep -v '^$' | head -5 || echo "(empty)")
  fi

  # Compute health
  local health="green"
  if [ "$p_lifecycle" = "active-dev" ]; then
    if [ "$p_tier" = "1" ] && [ "$days_since_commit" -gt 7 ]; then
      health="red"
    elif [ "$p_tier" = "1" ] && [ "$days_since_commit" -gt 3 ]; then
      health="yellow"
    elif [ "$p_tier" = "2" ] && [ "$days_since_commit" -gt 14 ]; then
      health="red"
    elif [ "$p_tier" = "2" ] && [ "$days_since_commit" -gt 7 ]; then
      health="yellow"
    fi
  fi

  # Determine blockers
  local blockers="none"
  if [ "$days_since_commit" -gt 30 ] && [ "$p_lifecycle" = "active-dev" ]; then
    blockers="Stale ${days_since_commit}d — needs attention or lifecycle change"
  fi

  # Determine output path
  local dna_path
  if [ -n "$OUTPUT_DIR" ]; then
    mkdir -p "$OUTPUT_DIR"
    dna_path="$OUTPUT_DIR/${slug}-dna.yaml"
  else
    mkdir -p "$p_path/_bmad" 2>/dev/null || true
    dna_path="$p_path/_bmad/project-dna.yaml"
  fi

  # Write the DNA file
  local now_ts
  now_ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  cat > "$dna_path" <<YAML
# Project DNA -- Auto-generated by Venture Spine
# Generated: $now_ts
# DO NOT EDIT MANUALLY -- regenerate with: generate-dna.sh $slug

project: $slug
name: "$p_name"
health: $health
tier: $p_tier
lifecycle: $p_lifecycle
budget_share: $p_budget
day_theme: $p_daytheme

identity: "$p_desc"
stack: "$p_stack"
branch: $current_branch
repo: $p_repo

current_metrics:
  days_since_last_commit: $days_since_commit
  open_issues: $open_issues
  open_prs: $open_prs

recent_commits:
$(echo "$last_5_commits" | sed 's/^/  - /')

open_issue_titles:
$issue_labels

claude_md_excerpt: |
$(echo "$claude_excerpt" | sed 's/^/  /')

blockers:
  - "$blockers"
YAML

  echo "  Generated: $dna_path"
}

echo "Generating Project DNA..."
echo ""

for slug in "${SLUGS[@]}"; do
  echo "  Processing $slug..."
  generate_dna "$slug"
done

echo ""
echo "DNA generation complete."
