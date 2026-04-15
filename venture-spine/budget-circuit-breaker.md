# Budget Circuit Breaker — Design Document

> **Date**: 2026-03-25
> **Status**: Prototype
> **Implements**: Wave 2 Grand Synthesis, Section 2.2 — Budget Circuit Breaker
> **Dependencies**: `ccusage` (v18+), `projects.json`, `jq`

---

## 1. Problem Statement

Claude Max provides a **5-hour rolling billing window** — not a daily or monthly budget. The constraint is temporal: usage within any sliding 5-hour block determines whether rate limits trigger. When one runaway project (or a stuck agent spinning in a loop) consumes a disproportionate share of a window, other projects starve.

The circuit breaker prevents this by:
1. Reading real-time billing window data from `ccusage blocks`
2. Comparing per-project consumption against allocations from `projects.json`
3. Returning exit codes and structured JSON that the orchestrator acts on

---

## 2. How the 5-Hour Rolling Window Works

From observed `ccusage blocks --active --json` output:

```json
{
  "blocks": [{
    "id": "2026-03-25T09:00:00.000Z",
    "startTime": "2026-03-25T09:00:00.000Z",
    "endTime": "2026-03-25T14:00:00.000Z",
    "isActive": true,
    "entries": 905,
    "totalTokens": 46294140,
    "costUSD": 43.32,
    "burnRate": {
      "tokensPerMinute": 339120,
      "costPerHour": 19.04
    },
    "projection": {
      "totalTokens": 93338952,
      "totalCost": 87.34,
      "remainingMinutes": 139
    }
  }]
}
```

Key observations from actual usage data (2026-03-20 through 2026-03-25):
- **Peak day**: 2026-03-21 — 208M total tokens, $161.63 equivalent cost
- **Heavy session**: Lagerlink Hildesheim subagents — 295M tokens in one session cluster
- **Typical daily range**: $30-$160 equivalent (varies by active agent count)
- **Per-project split today**: orchestrator 68%, Lagerlink 32%

The window is **not** a hard token cap — it is a rate-limiting trigger. Once you exceed the window's implicit ceiling, Claude Max throttles response speed and may queue requests. The circuit breaker treats the projected window consumption as the budget to manage.

---

## 3. Allocation Model

### 3.1 Priority-Weighted with Demand-Based Flex

Each project has a `budget_share` in `projects.json` (already defined):

| Project | Tier | budget_share | Effective Window Share |
|---------|------|-------------|----------------------|
| omniport-hh | 1 | 0.40 | 40% |
| cityhub | 1 | 0.25 | 25% |
| adwo-2 | 2 | 0.15 | 15% |
| orchestrator | 1 | 0.10 | 10% |
| finance-agent | 2 | 0.05 | 5% |
| vaseo | 3 | 0.05 | 5% |

**Reserve**: Any unallocated share (from paused projects with `budget_share: 0.00`) is redistributed proportionally to active projects.

### 3.2 Demand-Based Flex Rules

- If a project is idle (no active agents), its share is **temporarily available** to other projects
- Flex allocation is first-come-first-served but respects tier priority
- When the idle project wakes up, the flex allocation is reclaimed within one poll cycle
- This prevents waste: if only one project is running, it gets the full window

### 3.3 Mapping ccusage Project Keys to projects.json

ccusage uses path-based keys with dashes replacing slashes:
```
ccusage key:    -Users-buraksmac-Desktop-code2-orchestrator
projects.json:  /Users/buraksmac/Desktop/code2/orchestrator
```

Conversion: replace leading `-` with `/`, then replace remaining `-` only at path boundaries. The script handles this by reading `path` from `projects.json` and converting it to the ccusage format.

---

## 4. Threshold Levels

### Level GREEN (exit code 0)
- All projects within allocation
- Total window projection < 70% of comfortable ceiling
- **Action**: Continue normal operations

### Level YELLOW (exit code 0, warning in output)
- Any single project at **>80%** of its allocation
- OR total window burn rate projects to **>80%** of ceiling
- **Action**: Log warning. Orchestrator may reduce parallelism for the hot project.

### Level ORANGE (exit code 1)
- Any single project at **>100%** of its allocation
- OR total window projection exceeds **90%** of ceiling
- **Action**: Throttle the over-budget project:
  - Pause lowest-priority workers first
  - Switch remaining workers from Opus to Sonnet (3x more messages per window)
  - Queue new tasks for next window

### Level RED (exit code 2)
- Total window usage at **>95%** of ceiling
- OR burn rate is unsustainable (projected to hit ceiling in <30 minutes)
- **Action**: Hard pause ALL non-Tier-1 projects. Alert founder.
  - Only Tier 1 projects keep running
  - All Tier 2/3 workers killed immediately
  - New spawns blocked until next window

---

## 5. Response Actions Matrix

| Level | Per-Project Action | Global Action | Notification |
|-------|-------------------|---------------|-------------|
| GREEN | None | None | None |
| YELLOW | Log warning to state file | None | JSON status in stdout |
| ORANGE | Pause workers for over-budget project | Reduce max parallel workers from 6 to 3 | JSON + stderr warning |
| RED | Kill all non-Tier-1 workers | Block new spawns | JSON + stderr + touch alert file |

### 5.1 Model Degradation Ladder

When throttling, the circuit breaker recommends (does not enforce) a model degradation:

```
Opus 4.6 → Sonnet 4.6 → Haiku 4.5
   1x          ~3x           ~10x messages per window
```

The orchestrator reads the recommendation from the JSON output and passes `--model` flags to spawned agents.

### 5.2 Founder Alert Mechanism

On RED, the script touches `~/.claude/portfolio/BUDGET_ALERT`:
```
BUDGET_ALERT: RED
TIME: 2026-03-25T14:23:00Z
REMAINING_MINUTES: 28
BURN_RATE: 450000 tokens/min
MESSAGE: Window ceiling imminent. Non-Tier-1 projects paused.
```

The morning triage script checks for this file. A launchd agent could also watch it for push notifications.

---

## 6. Implementation: budget-check.sh

The prototype is ~100 lines of shell script in `venture-spine/budget-check.sh`.

### 6.1 Interface

```bash
# Basic check — returns exit code + JSON to stdout
./budget-check.sh

# Verbose mode — includes per-project breakdown
./budget-check.sh --verbose

# JSON-only mode — for programmatic consumption
./budget-check.sh --json
```

### 6.2 Exit Codes

| Code | Level | Meaning |
|------|-------|---------|
| 0 | GREEN/YELLOW | Safe to continue (yellow includes warning in JSON) |
| 1 | ORANGE | Throttle recommended |
| 2 | RED | Hard pause required |

### 6.3 JSON Output Schema

```json
{
  "timestamp": "2026-03-25T14:23:00Z",
  "level": "YELLOW",
  "window": {
    "start": "2026-03-25T09:00:00Z",
    "end": "2026-03-25T14:00:00Z",
    "remaining_minutes": 139,
    "total_tokens": 46294140,
    "projected_tokens": 93338952,
    "burn_rate_tpm": 339120,
    "cost_usd": 43.32,
    "projected_cost_usd": 87.34
  },
  "projects": {
    "orchestrator": {
      "tokens_used": 37097783,
      "budget_share": 0.10,
      "allocated_tokens": 9333895,
      "utilization_pct": 397,
      "status": "OVER_BUDGET"
    },
    "lagerlink": {
      "tokens_used": 9157966,
      "budget_share": 0.40,
      "allocated_tokens": 37335580,
      "utilization_pct": 24,
      "status": "OK"
    }
  },
  "actions": {
    "throttle_projects": ["orchestrator"],
    "recommended_model": "sonnet-4-6",
    "pause_workers": false,
    "block_spawns": false
  }
}
```

---

## 7. Integration Points

### 7.1 Orchestrator Loop (run-tmux.sh)

Before spawning any new worker:
```bash
budget_status=$(./venture-spine/budget-check.sh --json)
exit_code=$?

if [ $exit_code -eq 2 ]; then
  # RED: do not spawn, log, alert
  echo "BUDGET RED: skipping spawn" >> devlog.md
  exit 1
elif [ $exit_code -eq 1 ]; then
  # ORANGE: spawn with Sonnet instead of Opus
  model_flag="--model sonnet-4-6"
fi
```

### 7.2 Morning Triage (triage.sh)

Include budget status in the daily temperature check:
```bash
budget_json=$(./venture-spine/budget-check.sh --json)
echo "## Budget Status" >> daily-temperature.md
echo "$budget_json" | jq -r '.level' >> daily-temperature.md
```

### 7.3 Continuous Polling

The orchestrator's main loop already polls `tmux capture-pane` at intervals. Add budget check to the same polling cycle:
```bash
# Every poll cycle (already ~30s interval)
budget_check_result=$(./venture-spine/budget-check.sh)
budget_exit=$?
```

---

## 8. Calibration Notes

### 8.1 What We Know About the Ceiling

Claude Max does not publish explicit token-per-window limits. From observation:
- The `blocks` output shows 5-hour windows
- Rate limiting manifests as slower responses, not hard errors
- The practical ceiling appears to be around **100M-200M tokens per window** before significant throttling
- The `--token-limit` flag in ccusage blocks accepts a custom limit for warnings

### 8.2 Initial Ceiling Configuration

The script uses a configurable `TOKEN_CEILING` variable, defaulting to **150M tokens per 5-hour window**. This should be tuned based on:
- Actual throttling observations over the first 2 weeks
- Whether the ceiling varies by time of day (likely — less contention at night)
- ccusage's `--token-limit max` mode once Claude Max publishes official limits

### 8.3 Cache Token Accounting

From actual data, cache read tokens dominate (419M cache reads vs 1M input in a 5-day period). The circuit breaker tracks **total tokens** (including cache) because Claude Max rate limits apply to all token types, but the `cost_usd` metric from ccusage is the better proxy for actual resource consumption since cache reads are cheaper.

The script uses both:
- **Token-based thresholds** for the raw rate limit concern
- **Cost-based thresholds** for the economic allocation concern

---

## 9. Future Enhancements

1. **ccusage MCP integration**: Replace shell-exec with MCP server queries for lower latency
2. **Historical learning**: Track which projects tend to spike and pre-emptively throttle
3. **Night mode**: During overnight autonomous runs, relax thresholds (no human competing for the window)
4. **Multi-machine awareness**: If budget-check.sh runs on multiple machines, aggregate via a shared state file
5. **Grafana/dashboard integration**: Push metrics to the meta-dash.mjs dashboard for visual monitoring
