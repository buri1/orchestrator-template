#!/usr/bin/env bash
#
# Venture Spine — Morning Triage
#
# Reads projects.json, polls GitHub + git for each registered project,
# and outputs daily-temperature.md with traffic-light health indicators.
#
# Usage: ./triage.sh [--json] [--quiet]
#   --json   Also emit daily-temperature.json alongside the markdown
#   --quiet  Suppress stdout progress messages

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_FILE="$SCRIPT_DIR/projects.json"
OUTPUT_DIR="$SCRIPT_DIR"
OUTPUT_MD="$OUTPUT_DIR/daily-temperature.md"
OUTPUT_JSON="$OUTPUT_DIR/daily-temperature.json"
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TODAY=$(date +"%Y-%m-%d")
# Force English day names regardless of locale
DAY_OF_WEEK=$(LC_ALL=C date +"%A" | tr '[:upper:]' '[:lower:]')
DAY_DISPLAY=$(date +"%A")

# Parse flags
EMIT_JSON=false
QUIET=false
for arg in "$@"; do
  case "$arg" in
    --json)  EMIT_JSON=true ;;
    --quiet) QUIET=true ;;
  esac
done

log() {
  if [ "$QUIET" = false ]; then
    echo "$@"
  fi
}

# Verify dependencies
for cmd in jq gh git; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: Required command '$cmd' not found. Install it first." >&2
    exit 1
  fi
done

if [ ! -f "$PROJECTS_FILE" ]; then
  echo "ERROR: projects.json not found at $PROJECTS_FILE" >&2
  exit 1
fi

# Read project slugs into array
SLUGS=()
while IFS= read -r slug; do
  SLUGS+=("$slug")
done < <(jq -r '.projects | keys[]' "$PROJECTS_FILE")

# Temp directory for per-project data
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

# Collect data per project
for slug in "${SLUGS[@]}"; do
  log "  Scanning $slug..."
  mkdir -p "$TMPDIR/$slug"

  p_name=$(jq -r ".projects[\"$slug\"].name" "$PROJECTS_FILE")
  p_path=$(jq -r ".projects[\"$slug\"].path" "$PROJECTS_FILE")
  p_repo=$(jq -r ".projects[\"$slug\"].repo" "$PROJECTS_FILE")
  p_tier=$(jq -r ".projects[\"$slug\"].tier" "$PROJECTS_FILE")
  p_lifecycle=$(jq -r ".projects[\"$slug\"].lifecycle" "$PROJECTS_FILE")
  p_budget=$(jq -r ".projects[\"$slug\"].budget_share" "$PROJECTS_FILE")
  p_daytheme=$(jq -r ".projects[\"$slug\"].day_theme" "$PROJECTS_FILE")

  # Save to files
  echo "$p_name" > "$TMPDIR/$slug/name"
  echo "$p_path" > "$TMPDIR/$slug/path"
  echo "$p_repo" > "$TMPDIR/$slug/repo"
  echo "$p_tier" > "$TMPDIR/$slug/tier"
  echo "$p_lifecycle" > "$TMPDIR/$slug/lifecycle"
  echo "$p_budget" > "$TMPDIR/$slug/budget"
  echo "$p_daytheme" > "$TMPDIR/$slug/daytheme"

  # Git data
  if [ -d "$p_path/.git" ]; then
    last_commit=$(cd "$p_path" && git log --oneline -1 2>/dev/null || echo "none")
    last_epoch=$(cd "$p_path" && git log -1 --format='%ct' 2>/dev/null || echo "0")
    if [ "$last_epoch" != "0" ]; then
      last_date=$(cd "$p_path" && git log -1 --format='%ci' 2>/dev/null | cut -d' ' -f1)
      now_epoch=$(date +%s)
      days_stale=$(( (now_epoch - last_epoch) / 86400 ))
    else
      last_date="unknown"
      days_stale=999
    fi
  else
    last_commit="not a git repo"
    last_date="n/a"
    days_stale=999
  fi
  echo "$last_commit" > "$TMPDIR/$slug/last_commit"
  echo "$last_date" > "$TMPDIR/$slug/last_date"
  echo "$days_stale" > "$TMPDIR/$slug/days_stale"

  # GitHub data
  if [ "$p_repo" != "null" ] && [ -n "$p_repo" ]; then
    issues=$(gh issue list --repo "$p_repo" --state open --limit 100 --json number 2>/dev/null | jq 'length' 2>/dev/null || echo "?")
    prs=$(gh pr list --repo "$p_repo" --state open --limit 100 --json number 2>/dev/null | jq 'length' 2>/dev/null || echo "?")
    ci_status=$(gh api "repos/$p_repo/commits/HEAD/check-runs" --jq '.check_runs[0].conclusion // "none"' 2>/dev/null || echo "unknown")
  else
    issues="?"
    prs="?"
    ci_status="n/a"
  fi
  echo "$issues" > "$TMPDIR/$slug/issues"
  echo "$prs" > "$TMPDIR/$slug/prs"
  echo "$ci_status" > "$TMPDIR/$slug/ci"

  # Read pause context if present
  p_pause_reason=$(jq -r ".projects[\"$slug\"].pause_context.reason // empty" "$PROJECTS_FILE")
  p_pause_unblock=$(jq -r ".projects[\"$slug\"].pause_context.unblock_condition // empty" "$PROJECTS_FILE")
  echo "${p_pause_reason:-}" > "$TMPDIR/$slug/pause_reason"
  echo "${p_pause_unblock:-}" > "$TMPDIR/$slug/pause_unblock"

  # Compute health: green/yellow/red
  # Paused/waiting/hibernated/ideation projects are never RED from staleness
  health="green"

  if [ "$p_lifecycle" = "active-dev" ] || [ "$p_lifecycle" = "maintenance" ]; then
    if [ "$p_tier" = "1" ] && [ "$days_stale" -gt 7 ]; then
      health="red"
    elif [ "$p_tier" = "1" ] && [ "$days_stale" -gt 3 ]; then
      health="yellow"
    elif [ "$p_tier" = "2" ] && [ "$days_stale" -gt 14 ]; then
      health="red"
    elif [ "$p_tier" = "2" ] && [ "$days_stale" -gt 7 ]; then
      health="yellow"
    fi
  fi
  # waiting/paused/hibernated/ideation: staleness is expected, don't flag

  # CI failure is always flagged regardless of lifecycle
  if [ "$ci_status" = "failure" ]; then
    if [ "$p_lifecycle" = "active-dev" ] || [ "$p_lifecycle" = "maintenance" ]; then
      health="red"
    else
      health="yellow"  # CI failing on paused project is a warning, not critical
    fi
  fi

  if [ "$issues" != "?" ] && [ "$issues" -gt 20 ] 2>/dev/null; then
    if [ "$health" = "green" ]; then
      health="yellow"
    fi
  fi

  echo "$health" > "$TMPDIR/$slug/health"
done

# Count health statuses
red_count=0
yellow_count=0
green_count=0
for slug in "${SLUGS[@]}"; do
  h=$(cat "$TMPDIR/$slug/health")
  case "$h" in
    red)    red_count=$((red_count + 1)) ;;
    yellow) yellow_count=$((yellow_count + 1)) ;;
    green)  green_count=$((green_count + 1)) ;;
  esac
done

# Determine today's focus project based on day theme
focus_project=""
for slug in "${SLUGS[@]}"; do
  dt=$(cat "$TMPDIR/$slug/daytheme")
  if [ "$dt" = "$DAY_OF_WEEK" ]; then
    focus_project="$slug"
    break
  fi
done

# Generate markdown output
{
  echo "# Daily Temperature -- $TODAY"
  echo ""
  echo "> Generated: $NOW"
  echo "> Day: $DAY_DISPLAY | Focus: ${focus_project:-"no theme today"}"
  echo ""
  echo "## Portfolio Health"
  echo ""
  printf "| %-4s | %-22s | %-4s | %-10s | %-6s | %-4s | %-4s | %-8s |\n" \
    "Hlth" "Project" "Tier" "Lifecycle" "Stale" "Iss" "PRs" "CI"
  printf "|------|------------------------|------|------------|--------|------|------|----------|\n"

  # Sort: red first, then yellow, then green
  for health_level in red yellow green; do
    for slug in "${SLUGS[@]}"; do
      h=$(cat "$TMPDIR/$slug/health")
      if [ "$h" = "$health_level" ]; then
        case "$health_level" in
          red)    indicator="RED " ;;
          yellow) indicator="WARN" ;;
          green)  indicator="OK  " ;;
        esac

        p_name=$(cat "$TMPDIR/$slug/name")
        p_tier=$(cat "$TMPDIR/$slug/tier")
        p_lifecycle=$(cat "$TMPDIR/$slug/lifecycle")
        days_stale=$(cat "$TMPDIR/$slug/days_stale")
        issues=$(cat "$TMPDIR/$slug/issues")
        prs=$(cat "$TMPDIR/$slug/prs")
        ci=$(cat "$TMPDIR/$slug/ci")

        stale_str="${days_stale}d"
        if [ "$days_stale" = "999" ]; then
          stale_str="n/a"
        fi

        case "$ci" in
          success) ci_str="pass" ;;
          failure) ci_str="FAIL" ;;
          none)    ci_str="-" ;;
          unknown) ci_str="?" ;;
          *)       ci_str="$ci" ;;
        esac

        # Truncate name to 22 chars
        display_name="${p_name:0:22}"

        printf "| %-4s | %-22s | T%-3s | %-10s | %-6s | %-4s | %-4s | %-8s |\n" \
          "$indicator" \
          "$display_name" \
          "$p_tier" \
          "${p_lifecycle:0:10}" \
          "$stale_str" \
          "$issues" \
          "$prs" \
          "$ci_str"
      fi
    done
  done

  total=${#SLUGS[@]}
  echo ""
  echo "**Summary**: $red_count red, $yellow_count yellow, $green_count green out of $total projects"
  echo ""

  # Alerts section
  if [ "$red_count" -gt 0 ] || [ "$yellow_count" -gt 0 ]; then
    echo "## Alerts"
    echo ""
    for slug in "${SLUGS[@]}"; do
      h=$(cat "$TMPDIR/$slug/health")
      if [ "$h" = "red" ] || [ "$h" = "yellow" ]; then
        p_name=$(cat "$TMPDIR/$slug/name")
        p_tier=$(cat "$TMPDIR/$slug/tier")
        p_lifecycle=$(cat "$TMPDIR/$slug/lifecycle")
        days_stale=$(cat "$TMPDIR/$slug/days_stale")
        ci=$(cat "$TMPDIR/$slug/ci")
        issues=$(cat "$TMPDIR/$slug/issues")

        reasons=""
        if [ "$p_lifecycle" = "active-dev" ]; then
          if [ "$p_tier" = "1" ] && [ "$days_stale" -gt 7 ]; then
            reasons="Tier-1 stale ${days_stale}d (threshold: 7d)"
          elif [ "$p_tier" = "1" ] && [ "$days_stale" -gt 3 ]; then
            reasons="Tier-1 aging ${days_stale}d (threshold: 3d)"
          elif [ "$p_tier" = "2" ] && [ "$days_stale" -gt 14 ]; then
            reasons="Tier-2 stale ${days_stale}d (threshold: 14d)"
          elif [ "$p_tier" = "2" ] && [ "$days_stale" -gt 7 ]; then
            reasons="Tier-2 aging ${days_stale}d (threshold: 7d)"
          fi
        fi

        if [ "$ci" = "failure" ]; then
          reasons="${reasons:+$reasons; }CI failing"
        fi

        if [ "$issues" != "?" ] && [ "$issues" -gt 20 ] 2>/dev/null; then
          reasons="${reasons:+$reasons; }High issue count ($issues)"
        fi

        h_upper=$(echo "$h" | tr '[:lower:]' '[:upper:]')
        echo "- **${p_name}** [$h_upper]: $reasons"
      fi
    done
    echo ""
  fi

  # Waiting / Paused section
  has_waiting=false
  for slug in "${SLUGS[@]}"; do
    lc=$(cat "$TMPDIR/$slug/lifecycle")
    if [ "$lc" = "waiting" ] || [ "$lc" = "paused" ] || [ "$lc" = "hibernated" ]; then
      has_waiting=true
      break
    fi
  done
  if [ "$has_waiting" = true ]; then
    echo "## Waiting / Paused"
    echo ""
    for slug in "${SLUGS[@]}"; do
      lc=$(cat "$TMPDIR/$slug/lifecycle")
      if [ "$lc" = "waiting" ] || [ "$lc" = "paused" ] || [ "$lc" = "hibernated" ]; then
        p_name=$(cat "$TMPDIR/$slug/name")
        pause_reason=$(cat "$TMPDIR/$slug/pause_reason")
        pause_unblock=$(cat "$TMPDIR/$slug/pause_unblock")
        lc_upper=$(echo "$lc" | tr '[:lower:]' '[:upper:]')
        if [ -n "$pause_reason" ]; then
          echo "- **${p_name}** [$lc_upper]: $pause_reason → _unblocks on: ${pause_unblock:-unknown}_"
        else
          echo "- **${p_name}** [$lc_upper]"
        fi
      fi
    done
    echo ""
  fi

  # Today's focus section
  if [ -n "$focus_project" ]; then
    focus_name=$(cat "$TMPDIR/$focus_project/name")
    focus_path=$(cat "$TMPDIR/$focus_project/path")
    focus_issues=$(cat "$TMPDIR/$focus_project/issues")
    focus_prs=$(cat "$TMPDIR/$focus_project/prs")
    focus_stale=$(cat "$TMPDIR/$focus_project/days_stale")

    echo "## Today's Focus: $focus_name"
    echo ""
    if [ -d "$focus_path/.git" ]; then
      echo "### Recent Commits"
      echo '```'
      cd "$focus_path" && git log --oneline -5 2>/dev/null || echo "(no commits)"
      echo '```'
      echo ""
    fi
    echo "- Open issues: $focus_issues"
    echo "- Open PRs: $focus_prs"
    echo "- Days since last commit: $focus_stale"
    echo ""
  fi

  # Recent activity across all projects (last 7 days)
  echo "## Recent Activity (Last 7 Days)"
  echo ""
  has_recent=false
  for slug in "${SLUGS[@]}"; do
    p_path=$(cat "$TMPDIR/$slug/path")
    days_stale=$(cat "$TMPDIR/$slug/days_stale")
    p_name=$(cat "$TMPDIR/$slug/name")
    if [ -d "$p_path/.git" ] && [ "$days_stale" -le 7 ]; then
      has_recent=true
      echo "### $p_name"
      echo '```'
      (cd "$p_path" && git log --oneline --since="7 days ago" -5 2>/dev/null) || echo "(no recent commits)"
      echo '```'
      echo ""
    fi
  done
  if [ "$has_recent" = false ]; then
    echo "_No projects had commits in the last 7 days._"
    echo ""
  fi

} > "$OUTPUT_MD"

log ""
log "Triage complete. Output: $OUTPUT_MD"

# Optionally emit JSON
if [ "$EMIT_JSON" = true ]; then
  # Build JSON using jq
  json_projects="[]"
  for slug in "${SLUGS[@]}"; do
    p_name=$(cat "$TMPDIR/$slug/name")
    h=$(cat "$TMPDIR/$slug/health")
    p_tier=$(cat "$TMPDIR/$slug/tier")
    p_lifecycle=$(cat "$TMPDIR/$slug/lifecycle")
    days_stale=$(cat "$TMPDIR/$slug/days_stale")
    issues=$(cat "$TMPDIR/$slug/issues")
    prs=$(cat "$TMPDIR/$slug/prs")
    ci=$(cat "$TMPDIR/$slug/ci")

    json_projects=$(echo "$json_projects" | jq \
      --arg slug "$slug" \
      --arg name "$p_name" \
      --arg health "$h" \
      --argjson tier "$p_tier" \
      --arg lifecycle "$p_lifecycle" \
      --argjson stale "$days_stale" \
      --arg issues "$issues" \
      --arg prs "$prs" \
      --arg ci "$ci" \
      '. + [{
        slug: $slug,
        name: $name,
        health: $health,
        tier: $tier,
        lifecycle: $lifecycle,
        days_stale: $stale,
        open_issues: $issues,
        open_prs: $prs,
        ci: $ci
      }]')
  done

  jq -n \
    --arg ts "$NOW" \
    --arg today "$TODAY" \
    --arg focus "$focus_project" \
    --argjson red "$red_count" \
    --argjson yellow "$yellow_count" \
    --argjson green "$green_count" \
    --argjson projects "$json_projects" \
    '{
      generated: $ts,
      date: $today,
      focus_project: $focus,
      summary: { red: $red, yellow: $yellow, green: $green },
      projects: $projects
    }' > "$OUTPUT_JSON"

  log "JSON output: $OUTPUT_JSON"
fi
