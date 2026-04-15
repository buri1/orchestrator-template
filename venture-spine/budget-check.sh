#!/usr/bin/env bash
# budget-check.sh — Budget circuit breaker for Venture Spine
# Reads ccusage billing window data, compares against projects.json allocations,
# returns exit codes for the orchestrator to act on.
#
# Exit codes:
#   0 = GREEN/YELLOW (safe to continue; check JSON for warnings)
#   1 = ORANGE (throttle recommended)
#   2 = RED (hard pause non-Tier-1)
#
# Usage:
#   ./budget-check.sh              # Standard check
#   ./budget-check.sh --verbose    # Per-project breakdown to stderr
#   ./budget-check.sh --json       # JSON-only output (for piping)

set -euo pipefail

# Force C locale for consistent numeric formatting (decimal points, not commas)
export LC_NUMERIC=C

# --- Configuration ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECTS_JSON="$SCRIPT_DIR/projects.json"
ALERT_FILE="$HOME/.claude/portfolio/BUDGET_ALERT"

# Token ceiling per 5-hour window (tune based on observed throttling)
# Start conservative; increase if no throttling observed at higher levels.
TOKEN_CEILING="${BUDGET_TOKEN_CEILING:-150000000}"

# Thresholds (percentage of ceiling or allocation)
YELLOW_PROJECT_PCT=80    # project at 80% of its allocation
ORANGE_PROJECT_PCT=100   # project at 100% of its allocation
YELLOW_GLOBAL_PCT=70     # total window at 70% of ceiling
ORANGE_GLOBAL_PCT=85     # total window at 85% of ceiling
RED_GLOBAL_PCT=95        # total window at 95% of ceiling
RED_MINUTES_LEFT=30      # hard pause if <30 min remain at current burn rate

# --- Parse args ---
VERBOSE=false
JSON_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --verbose) VERBOSE=true ;;
    --json) JSON_ONLY=true ;;
    --help|-h)
      echo "Usage: budget-check.sh [--verbose] [--json]"
      echo "  --verbose  Show per-project breakdown on stderr"
      echo "  --json     Output only JSON (for programmatic use)"
      exit 0
      ;;
  esac
done

# --- Dependency checks ---
if ! command -v jq &>/dev/null; then
  echo '{"error":"jq not found. Install with: brew install jq"}' >&2
  exit 3
fi

if [ ! -f "$PROJECTS_JSON" ]; then
  echo "{\"error\":\"projects.json not found at $PROJECTS_JSON\"}" >&2
  exit 3
fi

# --- Fetch active billing window from ccusage ---
BLOCKS_JSON=$(npx ccusage@latest blocks --active --json --offline 2>/dev/null || true)

if [ -z "$BLOCKS_JSON" ] || ! echo "$BLOCKS_JSON" | jq -e '.blocks[0]' &>/dev/null; then
  # No active block — either no usage or ccusage error
  echo '{"level":"GREEN","message":"No active billing window found","window":null,"projects":{},"actions":{}}'
  exit 0
fi

BLOCK=$(echo "$BLOCKS_JSON" | jq '.blocks[0]')

# Extract window metrics
WINDOW_START=$(echo "$BLOCK" | jq -r '.startTime')
WINDOW_END=$(echo "$BLOCK" | jq -r '.endTime')
WINDOW_TOKENS=$(echo "$BLOCK" | jq -r '.totalTokens')
WINDOW_COST=$(echo "$BLOCK" | jq -r '.costUSD')
BURN_RATE_TPM=$(echo "$BLOCK" | jq -r '.burnRate.tokensPerMinute')
COST_PER_HOUR=$(echo "$BLOCK" | jq -r '.burnRate.costPerHour // 0')
REMAINING_MIN=$(echo "$BLOCK" | jq -r '.projection.remainingMinutes // 0')
PROJECTED_TOKENS=$(echo "$BLOCK" | jq -r '.projection.totalTokens // 0')
PROJECTED_COST=$(echo "$BLOCK" | jq -r '.projection.totalCost // 0')

# --- Fetch per-project usage for today ---
TODAY=$(date +%Y%m%d)
INSTANCE_JSON=$(npx ccusage@latest daily --instances --json --since "$TODAY" --offline 2>/dev/null || echo '{"projects":{}}')

# --- Build project-path-to-ccusage-key mapping ---
# ccusage keys: "-Users-buraksmac-Desktop-code2-orchestrator"
# projects.json paths: "/Users/buraksmac/Desktop/code2/orchestrator"
# Conversion: replace / with - and strip leading -

build_project_status() {
  local project_statuses="{}"
  local throttle_projects="[]"
  local any_over_budget=false

  # Read each project from projects.json
  while IFS= read -r proj_key; do
    local proj_path budget_share tier lifecycle
    proj_path=$(jq -r ".projects[\"$proj_key\"].path" "$PROJECTS_JSON")
    budget_share=$(jq -r ".projects[\"$proj_key\"].budget_share" "$PROJECTS_JSON")
    tier=$(jq -r ".projects[\"$proj_key\"].tier" "$PROJECTS_JSON")
    lifecycle=$(jq -r ".projects[\"$proj_key\"].lifecycle // \"unknown\"" "$PROJECTS_JSON")

    # Convert path to ccusage key: /Users/foo/bar -> -Users-foo-bar
    local ccusage_key
    ccusage_key=$(echo "$proj_path" | sed 's|/|-|g')

    # Look up tokens in ccusage instance data
    local proj_tokens=0
    proj_tokens=$(echo "$INSTANCE_JSON" | jq -r ".projects[\"$ccusage_key\"] | if . then [.[].totalTokens] | add else 0 end" 2>/dev/null || echo 0)
    [ "$proj_tokens" = "null" ] && proj_tokens=0

    # Calculate allocation based on projected window total
    local allocated_tokens
    allocated_tokens=$(awk "BEGIN{v=$PROJECTED_TOKENS * $budget_share; printf \"%.0f\", (v>0?v:1)}")

    # Calculate utilization percentage
    local util_pct
    util_pct=$(awk "BEGIN{if($allocated_tokens>0) printf \"%.0f\", ($proj_tokens/$allocated_tokens)*100; else print 0}")

    # Determine per-project status
    local status="OK"
    if [ "$util_pct" -ge "$ORANGE_PROJECT_PCT" ]; then
      status="OVER_BUDGET"
      any_over_budget=true
      throttle_projects=$(echo "$throttle_projects" | jq --arg k "$proj_key" '. + [$k]')
    elif [ "$util_pct" -ge "$YELLOW_PROJECT_PCT" ]; then
      status="WARNING"
    fi

    # Only include projects with non-zero usage or non-zero allocation
    local has_share
    has_share=$(awk "BEGIN{print ($budget_share > 0) ? 1 : 0}")
    if [ "$proj_tokens" -gt 0 ] || [ "$has_share" = "1" ]; then
      project_statuses=$(echo "$project_statuses" | jq \
        --arg k "$proj_key" \
        --argjson tokens "$proj_tokens" \
        --argjson share "$budget_share" \
        --argjson alloc "$allocated_tokens" \
        --argjson util "$util_pct" \
        --argjson t "$tier" \
        --arg s "$status" \
        '.[$k] = {tokens_used: $tokens, budget_share: $share, allocated_tokens: $alloc, utilization_pct: $util, tier: $t, status: $s}')
    fi

    if $VERBOSE; then
      local share_pct
      share_pct=$(awk "BEGIN{printf \"%.0f\", $budget_share * 100}")
      printf "  %-20s tier=%s  share=%s%%  tokens=%s  alloc=%s  util=%s%%  [%s]\n" \
        "$proj_key" "$tier" "$share_pct" \
        "$proj_tokens" "$allocated_tokens" "$util_pct" "$status" >&2
    fi
  done < <(jq -r '.projects | keys[]' "$PROJECTS_JSON")

  # Compact JSON to single lines for reliable delimiter parsing
  echo "$project_statuses" | jq -c '.'
  echo "---DELIM---"
  echo "$throttle_projects" | jq -c '.'
  echo "---DELIM---"
  echo "$any_over_budget"
}

# --- Compute global level ---
compute_global_level() {
  local level="GREEN"
  local global_pct
  global_pct=$(echo "$PROJECTED_TOKENS $TOKEN_CEILING" | awk '{if($2>0) printf "%.0f", ($1/$2)*100; else print 0}')

  local remaining_int
  remaining_int=$(printf "%.0f" "$REMAINING_MIN" 2>/dev/null || echo 999)

  if [ "$global_pct" -ge "$RED_GLOBAL_PCT" ] || [ "$remaining_int" -le "$RED_MINUTES_LEFT" ]; then
    level="RED"
  elif [ "$global_pct" -ge "$ORANGE_GLOBAL_PCT" ] || [ "$1" = "true" ]; then
    level="ORANGE"
  elif [ "$global_pct" -ge "$YELLOW_GLOBAL_PCT" ]; then
    level="YELLOW"
  fi

  echo "$level"
  echo "$global_pct"
}

# --- Main ---
if $VERBOSE; then
  echo "=== Budget Circuit Breaker ===" >&2
  echo "Window: $WINDOW_START -> $WINDOW_END ($REMAINING_MIN min remaining)" >&2
  echo "Tokens: $WINDOW_TOKENS (projected: $PROJECTED_TOKENS)" >&2
  echo "Ceiling: $TOKEN_CEILING" >&2
  echo "Burn rate: $BURN_RATE_TPM tokens/min | \$$COST_PER_HOUR/hr" >&2
  echo "---" >&2
fi

# Build per-project status (output separated by ---DELIM---)
_build_output=$(build_project_status)
project_statuses=$(echo "$_build_output" | awk '/^---DELIM---$/{exit} {print}')
throttle_projects=$(echo "$_build_output" | awk '/^---DELIM---$/{n++;next} n==1{print;exit}')
any_over_budget=$(echo "$_build_output" | awk '/^---DELIM---$/{n++;next} n==2{print;exit}')

# Compute global level
_level_output=$(compute_global_level "$any_over_budget")
level=$(echo "$_level_output" | head -1)
global_pct=$(echo "$_level_output" | tail -1)

# Determine actions
pause_workers=false
block_spawns=false
recommended_model="opus-4-6"

if [ "$level" = "RED" ]; then
  pause_workers=true
  block_spawns=true
  recommended_model="haiku-4-5"
elif [ "$level" = "ORANGE" ]; then
  recommended_model="sonnet-4-6"
fi

# Build output JSON using jq for safe construction
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Sanitize numeric values (ccusage may return floats where we want ints)
REMAINING_MIN_INT=$(printf "%.0f" "$REMAINING_MIN" 2>/dev/null || echo 0)
BURN_RATE_INT=$(printf "%.0f" "$BURN_RATE_TPM" 2>/dev/null || echo 0)
WINDOW_COST_NUM=$(printf "%.2f" "$WINDOW_COST" 2>/dev/null || echo 0)
PROJECTED_COST_NUM=$(printf "%.2f" "$PROJECTED_COST" 2>/dev/null || echo 0)
COST_PER_HOUR_NUM=$(printf "%.2f" "$COST_PER_HOUR" 2>/dev/null || echo 0)

OUTPUT=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg level "$level" \
  --argjson global_pct "$global_pct" \
  --arg w_start "$WINDOW_START" \
  --arg w_end "$WINDOW_END" \
  --argjson remaining "$REMAINING_MIN_INT" \
  --argjson w_tokens "$WINDOW_TOKENS" \
  --argjson proj_tokens "$PROJECTED_TOKENS" \
  --argjson burn_rate "$BURN_RATE_INT" \
  --argjson w_cost "$WINDOW_COST_NUM" \
  --argjson proj_cost "$PROJECTED_COST_NUM" \
  --argjson ceiling "$TOKEN_CEILING" \
  --argjson projects "$project_statuses" \
  --argjson throttle "$throttle_projects" \
  --arg model "$recommended_model" \
  --argjson pause "$pause_workers" \
  --argjson block "$block_spawns" \
  '{
    timestamp: $ts,
    level: $level,
    global_utilization_pct: $global_pct,
    window: {
      start: $w_start,
      end: $w_end,
      remaining_minutes: $remaining,
      total_tokens: $w_tokens,
      projected_tokens: $proj_tokens,
      burn_rate_tpm: $burn_rate,
      cost_usd: $w_cost,
      projected_cost_usd: $proj_cost,
      ceiling_tokens: $ceiling
    },
    projects: $projects,
    actions: {
      throttle_projects: $throttle,
      recommended_model: $model,
      pause_workers: $pause,
      block_spawns: $block
    }
  }')

echo "$OUTPUT"

# --- Write alert file on RED ---
if [ "$level" = "RED" ]; then
  mkdir -p "$(dirname "$ALERT_FILE")"
  cat > "$ALERT_FILE" <<EOF
BUDGET_ALERT: RED
TIME: $TIMESTAMP
REMAINING_MINUTES: $REMAINING_MIN
BURN_RATE_TPM: $BURN_RATE_TPM
PROJECTED_TOKENS: $PROJECTED_TOKENS
CEILING: $TOKEN_CEILING
MESSAGE: Window ceiling imminent. Non-Tier-1 projects paused.
EOF
  if ! $JSON_ONLY; then
    echo "!!! RED ALERT: Budget ceiling imminent. Alert written to $ALERT_FILE" >&2
  fi
elif [ -f "$ALERT_FILE" ]; then
  # Clear stale alert
  rm -f "$ALERT_FILE"
fi

# --- Verbose summary ---
if $VERBOSE && ! $JSON_ONLY; then
  echo "---" >&2
  echo "Level: $level (global utilization: ${global_pct}% of ceiling)" >&2
  if [ "$level" != "GREEN" ]; then
    echo "Recommended model: $recommended_model" >&2
    echo "Throttle projects: $(echo "$throttle_projects" | jq -r 'join(", ")')" >&2
  fi
fi

# --- Exit code ---
case "$level" in
  GREEN|YELLOW) exit 0 ;;
  ORANGE)       exit 1 ;;
  RED)          exit 2 ;;
  *)            exit 0 ;;
esac
