# Venture Spine Effectiveness Metrics Framework

> **Version**: 1.0.0
> **Created**: 2026-03-25
> **Purpose**: Prove (or disprove) that the meta-orchestration layer justifies its maintenance cost within 30 days.

---

## Design Philosophy

Every metric must satisfy three constraints:

1. **Zero manual input** -- if it requires a human to type something, it will be abandoned under pressure (exactly when measurement matters most)
2. **Actionable threshold** -- green/yellow/red bands that trigger specific responses, not just "interesting numbers"
3. **Causal link** -- a clear theory of WHY this metric reflects Venture Spine effectiveness, not just correlation

Metrics are grouped into three tiers:

- **Tier 1 (North Star)**: If these improve, the Venture Spine is working. Period.
- **Tier 2 (Operational)**: Explain HOW the improvement happens (or diagnose WHY it does not).
- **Tier 3 (Strategic)**: Monthly/quarterly indicators that validate the venture studio model itself.

---

## Tier 1: North Star Metrics

### M1: Founder Deep-Work Hours per Day

| Field | Value |
|-------|-------|
| **What it measures** | Hours of uninterrupted single-project focus per day |
| **Why it matters** | This is the single scarcest resource. The entire meta-layer exists to increase this number. Cognitive science research shows elite performers cap at 3-4 hours; the Venture Spine should push effective deep work from ~85 min/day (baseline without meta-layer) toward ~200+ min/day. |
| **Collection method** | Automated via git commit timestamps. A "deep work block" = consecutive commits to the SAME repo within a session, with no commits to other repos in between. Sum the time spans of all such blocks per day. |
| **Green** | >= 3 hours/day (averaged weekly) |
| **Yellow** | 1.5 - 3 hours/day |
| **Red** | < 1.5 hours/day |

**Collection script:**

```bash
#!/bin/bash
# M1: deep-work-hours.sh
# Calculates deep-work blocks from git commit timestamps across all registered projects.
# A deep-work block = consecutive commits to the same repo with no interleaving commits
# to other repos. Minimum block duration: 15 minutes (to exclude drive-by fixes).

DATE="${1:-$(date +%Y-%m-%d)}"
PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"
MIN_BLOCK_MINUTES=15

# Collect all commits across all projects with timestamps and repo name
collect_commits() {
  jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.dir)"' "$PROJECTS_JSON" | \
  while read -r name dir; do
    git -C "$dir" log --all --after="${DATE}T00:00:00" --before="${DATE}T23:59:59" \
      --format="%aI ${name}" --author="$(git -C "$dir" config user.name)" 2>/dev/null
  done | sort
}

# Parse into blocks: consecutive commits to same repo
calculate_blocks() {
  local prev_repo="" prev_time="" block_start="" total_minutes=0
  while IFS=' ' read -r timestamp repo; do
    epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$timestamp" "+%s" 2>/dev/null || date -d "$timestamp" "+%s" 2>/dev/null)
    if [ "$repo" = "$prev_repo" ] && [ -n "$block_start" ]; then
      # Continue current block
      prev_time=$epoch
    else
      # Close previous block if it existed
      if [ -n "$block_start" ] && [ -n "$prev_time" ]; then
        block_minutes=$(( (prev_time - block_start) / 60 ))
        if [ $block_minutes -ge $MIN_BLOCK_MINUTES ]; then
          total_minutes=$((total_minutes + block_minutes))
        fi
      fi
      # Start new block
      block_start=$epoch
      prev_time=$epoch
      prev_repo=$repo
    fi
  done
  # Close final block
  if [ -n "$block_start" ] && [ -n "$prev_time" ]; then
    block_minutes=$(( (prev_time - block_start) / 60 ))
    if [ $block_minutes -ge $MIN_BLOCK_MINUTES ]; then
      total_minutes=$((total_minutes + block_minutes))
    fi
  fi
  echo "$total_minutes"
}

minutes=$(collect_commits | calculate_blocks)
hours=$(echo "scale=1; $minutes / 60" | bc)

if (( $(echo "$hours >= 3.0" | bc -l) )); then status="GREEN"
elif (( $(echo "$hours >= 1.5" | bc -l) )); then status="YELLOW"
else status="RED"
fi

echo "{\"metric\":\"M1_deep_work_hours\",\"date\":\"$DATE\",\"value\":$hours,\"unit\":\"hours\",\"status\":\"$status\"}"
```

### M2: Context-Switch Count per Day

| Field | Value |
|-------|-------|
| **What it measures** | Number of times the founder switches between different project repos in a single day |
| **Why it matters** | Each switch costs 20-25 min recovery (Gloria Mark, UC Irvine). The Venture Spine's day theming and morning triage should reduce switches from 5+/day to 1-2/day. Fewer switches = more deep work = M1 improves. |
| **Collection method** | Count distinct "project transitions" in the chronologically sorted commit log across all repos. A transition = commit to Repo B after the most recent commit was to Repo A. |
| **Green** | <= 2 switches/day (averaged weekly) |
| **Yellow** | 3-4 switches/day |
| **Red** | >= 5 switches/day |

**Collection script:**

```bash
#!/bin/bash
# M2: context-switches.sh
# Counts project transitions in daily commit history.

DATE="${1:-$(date +%Y-%m-%d)}"
PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"

# Collect all commits across all projects, sorted by time
jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.dir)"' "$PROJECTS_JSON" | \
while read -r name dir; do
  git -C "$dir" log --all --after="${DATE}T00:00:00" --before="${DATE}T23:59:59" \
    --format="%aI ${name}" --author="$(git -C "$dir" config user.name)" 2>/dev/null
done | sort | awk '{print $2}' | uniq | wc -l | read -r unique_repos

# Transitions = unique_repos - 1 (first repo is not a switch)
switches=$((unique_repos > 0 ? unique_repos - 1 : 0))

if [ $switches -le 2 ]; then status="GREEN"
elif [ $switches -le 4 ]; then status="YELLOW"
else status="RED"
fi

echo "{\"metric\":\"M2_context_switches\",\"date\":\"$DATE\",\"value\":$switches,\"unit\":\"switches\",\"status\":\"$status\"}"
```

### M3: Time-to-First-Commit per Project Session

| Field | Value |
|-------|-------|
| **What it measures** | Minutes between a project's first Claude Code session start and its first commit, per work session |
| **Why it matters** | This is the "warmup cost" -- how long before productive output begins after switching into a project. The Venture Spine's Project DNA and briefing documents should compress this from 20-30 min (manual context reconstruction) to <5 min (read briefing, start working). |
| **Collection method** | Compare the first commit timestamp of the day per project with the project's Claude session start time (from ccusage session data or tmux window creation time). |
| **Green** | < 10 minutes (median across sessions) |
| **Yellow** | 10 - 25 minutes |
| **Red** | > 25 minutes |

**Collection script:**

```bash
#!/bin/bash
# M3: time-to-first-commit.sh
# Measures warmup time: session start -> first commit per project per day.
# Uses git reflog for session start approximation (first git operation of the day).

DATE="${1:-$(date +%Y-%m-%d)}"
PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"

jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.dir)"' "$PROJECTS_JSON" | \
while read -r name dir; do
  # First commit of the day
  first_commit=$(git -C "$dir" log --all --after="${DATE}T00:00:00" --before="${DATE}T23:59:59" \
    --format="%aI" --reverse --author="$(git -C "$dir" config user.name)" 2>/dev/null | head -1)

  if [ -z "$first_commit" ]; then continue; fi

  # Approximate session start: first reflog entry of the day (any ref activity)
  session_start=$(git -C "$dir" reflog --date=iso --all 2>/dev/null | \
    grep "$DATE" | tail -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}' | head -1)

  if [ -z "$session_start" ]; then continue; fi

  commit_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$first_commit" "+%s" 2>/dev/null || date -d "$first_commit" "+%s" 2>/dev/null)
  start_epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$session_start" "+%s" 2>/dev/null || date -d "$session_start" "+%s" 2>/dev/null)

  if [ -n "$commit_epoch" ] && [ -n "$start_epoch" ]; then
    minutes=$(( (commit_epoch - start_epoch) / 60 ))
    if [ $minutes -ge 0 ] && [ $minutes -le 480 ]; then  # Sanity: 0-8 hours
      if [ $minutes -lt 10 ]; then status="GREEN"
      elif [ $minutes -lt 25 ]; then status="YELLOW"
      else status="RED"
      fi
      echo "{\"metric\":\"M3_time_to_first_commit\",\"date\":\"$DATE\",\"project\":\"$name\",\"value\":$minutes,\"unit\":\"minutes\",\"status\":\"$status\"}"
    fi
  fi
done
```

---

## Tier 2: Operational Metrics

### M4: PR Merge Rate and Cycle Time

| Field | Value |
|-------|-------|
| **What it measures** | (a) Percentage of opened PRs that get merged. (b) Hours from PR open to PR merge. |
| **Why it matters** | Low merge rate = agents producing low-quality work or the review loop is broken. Long cycle time = bottleneck in review/fix/merge pipeline. The Venture Spine should improve both by routing founder attention to the right PRs at the right time. |
| **Collection method** | `gh` CLI queries across all registered repos. |
| **Green** | Merge rate >= 80%, cycle time < 4 hours |
| **Yellow** | Merge rate 60-80%, cycle time 4-24 hours |
| **Red** | Merge rate < 60%, cycle time > 24 hours |

**Collection script:**

```bash
#!/bin/bash
# M4: pr-metrics.sh
# Collects PR merge rate and cycle time across all registered projects.

SINCE="${1:-$(date -v-7d +%Y-%m-%d)}"  # Default: last 7 days
PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"

jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.repo)"' "$PROJECTS_JSON" | \
while read -r name repo; do
  if [ -z "$repo" ] || [ "$repo" = "null" ]; then continue; fi

  # Get all PRs created since date
  total=$(gh pr list --repo "$repo" --state all --search "created:>=${SINCE}" --json number --jq 'length' 2>/dev/null || echo 0)
  merged=$(gh pr list --repo "$repo" --state merged --search "created:>=${SINCE}" --json number --jq 'length' 2>/dev/null || echo 0)
  closed_unmerged=$(gh pr list --repo "$repo" --state closed --search "created:>=${SINCE}" --json mergedAt --jq '[.[] | select(.mergedAt == null)] | length' 2>/dev/null || echo 0)

  # Merge rate
  if [ "$total" -gt 0 ]; then
    merge_rate=$(echo "scale=0; $merged * 100 / $total" | bc)
  else
    merge_rate=100  # No PRs = no problem
  fi

  # Average cycle time (hours) for merged PRs
  avg_hours=$(gh pr list --repo "$repo" --state merged --search "created:>=${SINCE}" \
    --json createdAt,mergedAt \
    --jq '[.[] | (((.mergedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 3600)] | if length > 0 then (add / length | floor) else 0 end' 2>/dev/null || echo 0)

  # Status
  if [ "$merge_rate" -ge 80 ] && [ "$avg_hours" -lt 4 ]; then status="GREEN"
  elif [ "$merge_rate" -ge 60 ] && [ "$avg_hours" -lt 24 ]; then status="YELLOW"
  else status="RED"
  fi

  echo "{\"metric\":\"M4_pr_metrics\",\"project\":\"$name\",\"total_prs\":$total,\"merged\":$merged,\"abandoned\":$closed_unmerged,\"merge_rate_pct\":$merge_rate,\"avg_cycle_hours\":$avg_hours,\"status\":\"$status\"}"
done
```

### M5: Agent Stuck Duration

| Field | Value |
|-------|-------|
| **What it measures** | How long agents run without producing output (no new commits, no PR activity, no tmux output changes) |
| **Why it matters** | Stuck agents burn tokens without producing value. The Venture Spine's health monitoring should detect stuck agents within 30 min and trigger recovery. Without the meta-layer, stuck agents can run for hours unnoticed. |
| **Collection method** | Compare tmux pane content hashes at intervals. If the content hash has not changed in N minutes and no git activity detected, the agent is stuck. |
| **Green** | No agent stuck > 30 min in the last 24 hours |
| **Yellow** | 1-2 agents stuck 30-60 min |
| **Red** | Any agent stuck > 60 min, OR 3+ agents stuck > 30 min |

**Collection script:**

```bash
#!/bin/bash
# M5: agent-stuck-detector.sh
# Designed to run on a cron interval (every 5 minutes).
# Checks tmux panes for activity staleness.

STATE_DIR="${VENTURE_SPINE:-$(dirname "$0")}/.agent-hashes"
STUCK_LOG="${VENTURE_SPINE:-$(dirname "$0")}/.stuck-log.jsonl"
STUCK_THRESHOLD_MIN=30

mkdir -p "$STATE_DIR"

# Get all tmux sessions/windows
tmux list-panes -a -F '#{session_name}:#{window_name} #{pane_current_command}' 2>/dev/null | \
while read -r target cmd; do
  # Only check panes running claude
  if ! echo "$cmd" | grep -qi "claude\|node"; then continue; fi

  # Capture current pane content hash
  current_hash=$(tmux capture-pane -t "$target" -p -S -100 2>/dev/null | md5 -q 2>/dev/null || echo "none")
  hash_file="$STATE_DIR/$(echo "$target" | tr ':/' '_').hash"
  time_file="$STATE_DIR/$(echo "$target" | tr ':/' '_').time"

  if [ -f "$hash_file" ]; then
    prev_hash=$(cat "$hash_file")
    if [ "$current_hash" = "$prev_hash" ]; then
      # Content unchanged -- check how long
      if [ -f "$time_file" ]; then
        stuck_since=$(cat "$time_file")
        now=$(date +%s)
        stuck_min=$(( (now - stuck_since) / 60 ))
        if [ $stuck_min -ge $STUCK_THRESHOLD_MIN ]; then
          echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"target\":\"$target\",\"stuck_minutes\":$stuck_min,\"status\":\"STUCK\"}" >> "$STUCK_LOG"
        fi
      fi
    else
      # Content changed -- reset timer
      date +%s > "$time_file"
    fi
  else
    # First observation
    date +%s > "$time_file"
  fi
  echo "$current_hash" > "$hash_file"
done

# Summarize today's stuck events
today=$(date +%Y-%m-%d)
stuck_count=$(grep "$today" "$STUCK_LOG" 2>/dev/null | jq -s '[.[] | select(.stuck_minutes >= 30)] | length' 2>/dev/null || echo 0)
max_stuck=$(grep "$today" "$STUCK_LOG" 2>/dev/null | jq -s '[.[] | .stuck_minutes] | max // 0' 2>/dev/null || echo 0)

if [ "$stuck_count" -eq 0 ]; then status="GREEN"
elif [ "$stuck_count" -le 2 ] && [ "$max_stuck" -le 60 ]; then status="YELLOW"
else status="RED"
fi

echo "{\"metric\":\"M5_agent_stuck\",\"date\":\"$today\",\"stuck_events_30m\":$stuck_count,\"max_stuck_minutes\":$max_stuck,\"status\":\"$status\"}"
```

### M6: Token Spend per Merged PR

| Field | Value |
|-------|-------|
| **What it measures** | Total tokens consumed (via ccusage) divided by number of PRs merged, over a rolling 7-day window |
| **Why it matters** | This is the core efficiency metric. If the meta-layer is routing work well (right tasks to right agents, good prompts, avoiding rework), token spend per PR should decrease over time. High values indicate wasted cycles: agents getting stuck, rework loops, or poor task scoping. |
| **Collection method** | `ccusage daily --json` for token costs; `gh pr list --state merged` for PR counts. |
| **Green** | < $5 per merged PR (on Claude Max equivalent cost basis) |
| **Yellow** | $5 - $15 per merged PR |
| **Red** | > $15 per merged PR |

**Collection script:**

```bash
#!/bin/bash
# M6: tokens-per-pr.sh
# Token efficiency: equivalent API cost per merged PR over last 7 days.

SINCE=$(date -v-7d +%Y%m%d 2>/dev/null || date -d '7 days ago' +%Y%m%d)
UNTIL=$(date +%Y%m%d)
PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"

# Total token cost (API-equivalent) over the period
total_cost=$(npx ccusage@latest daily --since "$SINCE" --until "$UNTIL" --json 2>/dev/null | \
  jq '.totals.totalCost // 0')

# Total merged PRs across all active projects
total_merged=0
while read -r name repo; do
  if [ -z "$repo" ] || [ "$repo" = "null" ]; then continue; fi
  since_date=$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)
  count=$(gh pr list --repo "$repo" --state merged --search "merged:>=${since_date}" --json number --jq 'length' 2>/dev/null || echo 0)
  total_merged=$((total_merged + count))
done < <(jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.repo)"' "$PROJECTS_JSON")

# Calculate cost per PR
if [ "$total_merged" -gt 0 ]; then
  cost_per_pr=$(echo "scale=2; $total_cost / $total_merged" | bc)
else
  cost_per_pr="0"  # No PRs merged = no denominator (not red, just no data)
fi

if (( $(echo "$cost_per_pr < 5" | bc -l) )); then status="GREEN"
elif (( $(echo "$cost_per_pr < 15" | bc -l) )); then status="YELLOW"
else status="RED"
fi

echo "{\"metric\":\"M6_tokens_per_pr\",\"period\":\"${SINCE}-${UNTIL}\",\"total_cost_usd\":$total_cost,\"merged_prs\":$total_merged,\"cost_per_pr\":$cost_per_pr,\"status\":\"$status\"}"
```

### M7: Project DNA Staleness

| Field | Value |
|-------|-------|
| **What it measures** | Days since each project's `_bmad/project-dna.yaml` was last modified |
| **Why it matters** | Stale DNA means the briefing system is broken. If DNA is outdated, the founder reads wrong context on project entry, which INCREASES warmup cost instead of reducing it. Fresh DNA is the atomic unit of the Venture Spine -- if this metric is red, nothing else works. |
| **Collection method** | File modification timestamps via `stat`. |
| **Green** | All Tier 1 projects: DNA updated within 2 days. Tier 2: within 7 days. |
| **Yellow** | Any Tier 1 DNA older than 3 days, or any Tier 2 older than 14 days |
| **Red** | Any Tier 1 DNA older than 7 days, or any DNA file missing entirely |

**Collection script:**

```bash
#!/bin/bash
# M7: dna-staleness.sh
# Checks freshness of project-dna.yaml per project.

PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"
NOW=$(date +%s)
overall_status="GREEN"

jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.dir) \(.value.tier)"' "$PROJECTS_JSON" | \
while read -r name dir tier; do
  dna_file="$dir/_bmad/project-dna.yaml"
  if [ ! -f "$dna_file" ]; then
    echo "{\"metric\":\"M7_dna_staleness\",\"project\":\"$name\",\"tier\":$tier,\"stale_days\":\"MISSING\",\"status\":\"RED\"}"
    continue
  fi

  # Get file modification time
  mod_time=$(stat -f %m "$dna_file" 2>/dev/null || stat -c %Y "$dna_file" 2>/dev/null)
  stale_days=$(( (NOW - mod_time) / 86400 ))

  # Threshold depends on tier
  if [ "$tier" -le 1 ]; then
    if [ $stale_days -le 2 ]; then status="GREEN"
    elif [ $stale_days -le 6 ]; then status="YELLOW"
    else status="RED"
    fi
  else
    if [ $stale_days -le 7 ]; then status="GREEN"
    elif [ $stale_days -le 14 ]; then status="YELLOW"
    else status="RED"
    fi
  fi

  echo "{\"metric\":\"M7_dna_staleness\",\"project\":\"$name\",\"tier\":$tier,\"stale_days\":$stale_days,\"status\":\"$status\"}"
done
```

---

## Tier 3: Strategic Metrics

### M8: Portfolio Health Trend

| Field | Value |
|-------|-------|
| **What it measures** | Aggregate project health across the portfolio over time: the ratio of green/yellow/red projects week-over-week |
| **Why it matters** | A single snapshot of portfolio health is useful; the TREND is transformative. Improving trend = the system is working. Degrading trend = something structural is wrong (too many projects, wrong priorities, stale processes). |
| **Collection method** | Aggregates M4 (PR metrics), M5 (agent stuck), M7 (DNA staleness), plus CI status from `gh run list`. Computed weekly. |
| **Green** | >= 80% of active projects are green, trend stable or improving |
| **Yellow** | 50-80% green, or trend degrading for 2+ weeks |
| **Red** | < 50% green, or any Tier 1 project red for 2+ weeks |

**Collection script:**

```bash
#!/bin/bash
# M8: portfolio-health.sh
# Aggregates health signals across all projects into a portfolio score.

PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"
HEALTH_LOG="${VENTURE_SPINE:-$(dirname "$0")}/.health-history.jsonl"
DATE=$(date +%Y-%m-%d)

green=0; yellow=0; red=0; total=0

jq -r '.projects | to_entries[] | select(.value.active == true) | "\(.key) \(.value.repo) \(.value.dir) \(.value.tier)"' "$PROJECTS_JSON" | \
while read -r name repo dir tier; do
  total=$((total + 1))
  project_status="GREEN"

  # Signal 1: CI status (last workflow run)
  if [ -n "$repo" ] && [ "$repo" != "null" ]; then
    ci_conclusion=$(gh run list --repo "$repo" --limit 1 --json conclusion --jq '.[0].conclusion' 2>/dev/null)
    if [ "$ci_conclusion" = "failure" ]; then project_status="RED"; fi
  fi

  # Signal 2: Days since last commit
  last_commit_epoch=$(git -C "$dir" log -1 --format="%at" 2>/dev/null || echo 0)
  now=$(date +%s)
  days_since_commit=$(( (now - last_commit_epoch) / 86400 ))
  if [ "$tier" -le 1 ] && [ $days_since_commit -gt 7 ]; then project_status="RED"
  elif [ $days_since_commit -gt 14 ]; then project_status="YELLOW"
  fi

  # Signal 3: Open PR count (too many = review bottleneck)
  if [ -n "$repo" ] && [ "$repo" != "null" ]; then
    open_prs=$(gh pr list --repo "$repo" --state open --json number --jq 'length' 2>/dev/null || echo 0)
    if [ "$open_prs" -gt 5 ]; then project_status="RED"
    elif [ "$open_prs" -gt 3 ]; then
      [ "$project_status" = "GREEN" ] && project_status="YELLOW"
    fi
  fi

  echo "{\"project\":\"$name\",\"tier\":$tier,\"health\":\"$project_status\",\"days_since_commit\":$days_since_commit,\"open_prs\":${open_prs:-0}}"
done | jq -s '.' | tee /dev/stderr | \
jq '{
  date: "'"$DATE"'",
  metric: "M8_portfolio_health",
  green: [.[] | select(.health == "GREEN")] | length,
  yellow: [.[] | select(.health == "YELLOW")] | length,
  red: [.[] | select(.health == "RED")] | length,
  total: length,
  green_pct: (([.[] | select(.health == "GREEN")] | length) * 100 / (length | if . == 0 then 1 else . end))
}' >> "$HEALTH_LOG"
```

### M9: Token Budget Utilization

| Field | Value |
|-------|-------|
| **What it measures** | Daily/weekly token spend (API-equivalent cost) vs. Claude Max subscription value, broken down by project |
| **Why it matters** | Claude Max at $200/mo provides $1,000-3,600+ equivalent API value. Tracking utilization shows whether the subscription is being fully leveraged, and whether any single project is consuming a disproportionate share (violating budget allocations in projects.json). |
| **Collection method** | `ccusage daily --json --breakdown` provides exact per-model token counts. Cross-reference session IDs with project paths. |
| **Green** | Total weekly spend $100-800 equivalent (healthy utilization), no project exceeds 2x its budget_share |
| **Yellow** | Weekly spend < $50 (underutilization) or one project exceeds 2x share |
| **Red** | One project consumes > 60% of total (crowding out others) |

**Collection script:**

```bash
#!/bin/bash
# M9: token-budget.sh
# Tracks token spend per project using ccusage session data.

SINCE=$(date -v-7d +%Y%m%d 2>/dev/null || date -d '7 days ago' +%Y%m%d)
UNTIL=$(date +%Y%m%d)
PROJECTS_JSON="${VENTURE_SPINE:-$(dirname "$0")}/projects.json"

# Get session-level costs
session_data=$(npx ccusage@latest session --since "$SINCE" --until "$UNTIL" --json 2>/dev/null)

# Map session IDs to projects and sum costs
echo "$session_data" | jq --slurpfile projects "$PROJECTS_JSON" '
  .sessions | map({
    sessionId: .sessionId,
    cost: .totalCost,
    tokens: .totalTokens
  }) | group_by(
    # Match session IDs to project names from registry
    .sessionId as $sid |
    ($projects[0].projects | to_entries[] |
      select($sid | test(.key; "i")) | .key) // "unmatched"
  ) | map({
    project: .[0].sessionId,
    total_cost: (map(.cost) | add),
    total_tokens: (map(.tokens) | add)
  }) | sort_by(-.total_cost)
'

# Overall summary
total=$(echo "$session_data" | jq '.sessions | map(.totalCost) | add // 0')
echo "{\"metric\":\"M9_token_budget\",\"period\":\"${SINCE}-${UNTIL}\",\"total_equivalent_cost\":$total}"
```

### M10: Revenue per Project per Month

| Field | Value |
|-------|-------|
| **What it measures** | Monthly revenue generated by each project in the portfolio |
| **Why it matters** | The ultimate validation of the venture studio model. Revenue is the only metric that cannot be gamed. Combined with token cost (M6/M9), this gives ROI per project. |
| **Collection method** | This is the ONE metric that requires manual input (monthly). Stored in `portfolio-state.yaml` under each project. Future: Stripe MCP integration for automated collection. |
| **Green** | Tier 1 projects generating revenue >= 10x their token cost |
| **Yellow** | Tier 1 projects generating revenue but < 10x token cost |
| **Red** | Tier 1 projects generating zero revenue after month 2 |

**Collection script:**

```bash
#!/bin/bash
# M10: revenue.sh
# Reads revenue data from portfolio-state.yaml (manual input monthly).
# Future: integrate with Stripe MCP for automated collection.

PORTFOLIO_STATE="${HOME}/.claude/portfolio/portfolio-state.yaml"

# Requires yq (brew install yq)
if ! command -v yq &>/dev/null; then
  echo '{"metric":"M10_revenue","error":"yq not installed. brew install yq"}'
  exit 1
fi

yq -o=json '.projects | to_entries | map({
  "project": .key,
  "revenue_monthly": (.value.revenue_monthly // 0),
  "token_cost_monthly": (.value.token_cost_monthly // 0),
  "roi_multiplier": (if (.value.token_cost_monthly // 0) > 0 then (.value.revenue_monthly // 0) / .value.token_cost_monthly else 0 end)
})' "$PORTFOLIO_STATE" 2>/dev/null || echo '{"metric":"M10_revenue","error":"portfolio-state.yaml not found or malformed"}'
```

---

## Collection Orchestration

All metrics should be collected by a single entry point that runs on a cron schedule and aggregates results.

### Daily Collection (06:00 via launchd/cron)

```bash
#!/bin/bash
# collect-daily.sh
# Runs all daily metrics and writes to a single JSONL file.

VENTURE_SPINE="$(cd "$(dirname "$0")" && pwd)"
export VENTURE_SPINE
DATE=$(date +%Y-%m-%d)
OUTPUT="$VENTURE_SPINE/.metrics/${DATE}.jsonl"
mkdir -p "$VENTURE_SPINE/.metrics"

echo "--- Venture Spine Daily Metrics: $DATE ---"

"$VENTURE_SPINE/scripts/deep-work-hours.sh" "$DATE"       >> "$OUTPUT"
"$VENTURE_SPINE/scripts/context-switches.sh" "$DATE"       >> "$OUTPUT"
"$VENTURE_SPINE/scripts/time-to-first-commit.sh" "$DATE"   >> "$OUTPUT"
"$VENTURE_SPINE/scripts/pr-metrics.sh"                     >> "$OUTPUT"
"$VENTURE_SPINE/scripts/tokens-per-pr.sh"                  >> "$OUTPUT"
"$VENTURE_SPINE/scripts/dna-staleness.sh"                  >> "$OUTPUT"
"$VENTURE_SPINE/scripts/portfolio-health.sh"               >> "$OUTPUT"
"$VENTURE_SPINE/scripts/token-budget.sh"                   >> "$OUTPUT"

echo "Metrics written to $OUTPUT"
```

### Agent Stuck Detection (every 5 minutes via cron)

```crontab
*/5 * * * * /path/to/venture-spine/scripts/agent-stuck-detector.sh >> /dev/null 2>&1
```

### Cron Setup (launchd plist for macOS)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.venturespine.daily-metrics</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/venture-spine/collect-daily.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>6</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/venture-spine-metrics.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/venture-spine-metrics.err</string>
</dict>
</plist>
```

---

## Success Criteria: Is the Venture Spine Worth Maintaining After 1 Month?

The Venture Spine is justified if AND ONLY IF these conditions are met after 30 days of operation:

### Must-Pass (ALL required)

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| **Deep work increased** | M1 weekly average >= 2.5 hours (vs. ~1.4 hour baseline) | Compare week 4 average to week 1 average |
| **Context switches decreased** | M2 weekly average <= 2/day (vs. 4-5 baseline) | Compare week 4 average to week 1 average |
| **Morning triage works** | Triage script runs automatically >= 25 of 30 days | Check `ls .metrics/*.jsonl | wc -l` |
| **Project DNA stays fresh** | M7 shows zero RED for Tier 1 projects in weeks 3-4 | Check M7 history |

### Should-Pass (3 of 4 required)

| Criterion | Target | How to Measure |
|-----------|--------|----------------|
| **PR efficiency improved** | M4 merge rate >= 80% AND cycle time < 8 hours | Week 4 M4 values |
| **Agent stuck time reduced** | M5 max stuck duration < 45 min (vs. hours without monitoring) | M5 history |
| **Token efficiency stable or improving** | M6 cost-per-PR not increasing week-over-week | Compare week 1-2 vs. week 3-4 |
| **Portfolio health trend positive** | M8 green_pct >= 70% in week 4 | M8 history |

### Kill Criteria (ANY triggers shutdown)

| Criterion | Action |
|-----------|--------|
| The metrics collection scripts themselves require > 30 min/week of maintenance | The meta-layer costs more than it saves. Simplify or kill. |
| M1 (deep work) does NOT improve from week 1 to week 4 | The core value proposition is falsified. Kill the Venture Spine. |
| The founder stops reading the morning triage output for > 5 consecutive days | The output is not useful. Redesign or kill. |
| Any metric requires manual data entry more than once per month (except M10 revenue) | Violates the zero-effort collection constraint. Automate or drop the metric. |

### The One-Number Summary

If forced to reduce all metrics to a single number:

```
Venture Spine Score = (M1_deep_work_hours / 4.0) * 100

Interpretation:
  >= 75  = The Venture Spine is working. Keep and improve.
  50-74  = Marginal. Review what is not working and fix.
  < 50   = Not working. Simplify drastically or kill.
```

The denominator is 4.0 (maximum deep work hours per day, per Ericsson). The score represents what percentage of theoretical maximum deep work capacity the founder is achieving. The Venture Spine's job is to push this number as high as possible.

---

## Metric Evolution

These metrics are the v1 set. After month 1, some will prove useless and should be dropped. Others will reveal gaps. The review process:

1. **Week 2 check**: Are all collection scripts running? Fix any that broke.
2. **Week 4 review**: Which metrics did you actually LOOK at? Drop any you never checked.
3. **Month 2**: Add cross-project learning reuse rate (count of patterns from project A applied in project B).
4. **Quarter 1**: Add revenue ROI per project (M10 / M9 per project) once Stripe integration exists.

The goal is convergence toward 3-5 metrics that matter, not perpetual expansion of a dashboard nobody reads.
