# Deterministic Harness Design: Concrete Implementation Blueprints

**Date:** 2026-03-06
**Scope:** Implementable scripts, configurations, and file formats for the deterministic layer (70%) of the L-Thread Orchestrator
**Prerequisites:** Phase 1 analysis (`research/2026-03-06_analysis-deterministic-llm-boundary.md`) established the 70/30 boundary. This document provides the concrete implementation.
**Evidence Base:** 7 web research sessions, existing codebase analysis (Finance-agent scheduler, tmux-helpers, orchestrator hooks), Praetorian MANIFEST pattern, Stripe deterministic blueprints, coderabbitai/git-worktree-runner, Dicklesworthstone/claude_code_agent_farm, StateFlow FSM paper, ccusage token analytics

---

## Table of Contents

1. [Shell Script Harness: check-agents.sh](#1-shell-script-harness-check-agentssh)
2. [State Machine for Task Routing](#2-state-machine-for-task-routing)
3. [LaunchAgent / Cron Architecture](#3-launchagent--cron-architecture)
4. [Git Worktree Management Scripts](#4-git-worktree-management-scripts)
5. [Notification Layer Design](#5-notification-layer-design)
6. [Token Budget Enforcement](#6-token-budget-enforcement)
7. [Health Monitoring Dashboard](#7-health-monitoring-dashboard)
8. [File Format Specifications](#8-file-format-specifications)
9. [Implementation Sequence](#9-implementation-sequence)

---

## 1. Shell Script Harness: check-agents.sh

### 1.1 Design Rationale

The "Elvis Sun pattern" (and its implementations in Dicklesworthstone's claude_code_agent_farm and Composio's agent-orchestrator) follows a single principle: a 100% deterministic shell script that inspects external state (tmux sessions, git branches, CI status, PR state) and takes deterministic actions (respawn, notify, escalate). No LLM is involved.

The existing `tmux-helpers.sh` in `.bmad/scripts/` provides the primitives. This script composes them into a full agent supervision loop.

### 1.2 Script: `.bmad/scripts/check-agents.sh`

```bash
#!/bin/bash
# check-agents.sh -- Deterministic Agent Health Check & Auto-Recovery
# 100% shell script. Zero LLM involvement.
#
# Designed to be called by LaunchAgent every 10 minutes or manually.
# Reads expected state from _bmad/orchestrator-tmux-state.json
# Probes tmux sessions, checks PRs, checks CI, auto-respawns.
#
# Exit codes:
#   0 = all healthy
#   1 = recovery performed (check logs)
#   2 = unrecoverable failure (needs human)

set -euo pipefail

# === Configuration ===
ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
STATE_FILE="$ORCHESTRATOR_ROOT/_bmad/orchestrator-tmux-state.json"
METRICS_FILE="$ORCHESTRATOR_ROOT/_bmad/metrics.json"
LOG_DIR="$ORCHESTRATOR_ROOT/_bmad/logs"
NOTIFY_SCRIPT="$ORCHESTRATOR_ROOT/.bmad/scripts/notify.sh"
MAX_RESPAWN_ATTEMPTS=3
STALE_THRESHOLD_MINUTES=60

# === Ensure directories ===
mkdir -p "$LOG_DIR"

# === Logging ===
LOG_FILE="$LOG_DIR/check-agents_$(date +%Y%m%d_%H%M%S).log"
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# === Guard: State file must exist ===
if [ ! -f "$STATE_FILE" ]; then
    log "FATAL: No state file at $STATE_FILE"
    exit 2
fi

log "=== Agent Health Check Started ==="

# === Read expected sessions ===
SESSIONS=$(jq -r '.sessions | keys[]' "$STATE_FILE")
RECOVERY_COUNT=0
HEALTHY_COUNT=0
DEAD_COUNT=0
RESULTS=()

for SESSION in $SESSIONS; do
    PROJECT=$(jq -r ".sessions[\"$SESSION\"].project" "$STATE_FILE")
    WORKDIR=$(jq -r ".sessions[\"$SESSION\"].working_directory" "$STATE_FILE")
    FLAGS=$(jq -r ".sessions[\"$SESSION\"].claude_flags // \"--dangerously-skip-permissions\"" "$STATE_FILE")
    RESPAWN_COUNT=$(jq -r ".sessions[\"$SESSION\"].respawn_count // 0" "$STATE_FILE")

    log "--- Checking: $SESSION ($PROJECT) ---"

    # Step 1: Is tmux session alive?
    if tmux has-session -t "$SESSION" 2>/dev/null; then
        ALIVE="true"
    else
        ALIVE="false"
    fi

    # Step 2: Is claude running in the session?
    CLAUDE_RUNNING="false"
    if [ "$ALIVE" = "true" ]; then
        CMD=$(tmux list-panes -t "$SESSION" -F '#{pane_current_command}' 2>/dev/null | head -1)
        if [ "$CMD" = "claude" ]; then
            CLAUDE_RUNNING="true"
        fi
    fi

    # Step 3: Check for stale sessions (alive but idle too long)
    STALE="false"
    if [ "$ALIVE" = "true" ] && [ "$CLAUDE_RUNNING" = "true" ]; then
        # Capture last 5 lines of output to detect stuck state
        LAST_OUTPUT=$(tmux capture-pane -t "$SESSION" -p -S -5 2>/dev/null || echo "")
        LAST_SEEN=$(jq -r ".sessions[\"$SESSION\"].last_seen_alive // \"\"" "$STATE_FILE")
        if [ -n "$LAST_SEEN" ]; then
            LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_SEEN" +%s 2>/dev/null || echo "0")
            NOW_EPOCH=$(date +%s)
            DIFF_MIN=$(( (NOW_EPOCH - LAST_EPOCH) / 60 ))
            if [ "$DIFF_MIN" -gt "$STALE_THRESHOLD_MINUTES" ]; then
                STALE="true"
                log "  WARNING: Session $SESSION stale for ${DIFF_MIN}m"
            fi
        fi
    fi

    # Step 4: Check git/PR status for the project
    PR_STATUS="none"
    CI_STATUS="none"
    if [ -d "$WORKDIR/.git" ] || [ -d "$WORKDIR/../.git" ]; then
        CURRENT_BRANCH=$(cd "$WORKDIR" && git branch --show-current 2>/dev/null || echo "unknown")
        # Check for open PRs on this branch
        OPEN_PR=$(cd "$WORKDIR" && gh pr list --head "$CURRENT_BRANCH" --state open --json number,title,statusCheckRollup --limit 1 2>/dev/null || echo "[]")
        if [ "$OPEN_PR" != "[]" ] && [ -n "$OPEN_PR" ]; then
            PR_NUMBER=$(echo "$OPEN_PR" | jq -r '.[0].number // "none"')
            PR_STATUS="open:#$PR_NUMBER"
            # Check CI status
            CI_STATE=$(echo "$OPEN_PR" | jq -r '.[0].statusCheckRollup[0].state // "UNKNOWN"' 2>/dev/null || echo "UNKNOWN")
            CI_STATUS="$CI_STATE"
            log "  PR: #$PR_NUMBER, CI: $CI_STATE"
        fi
    fi

    # Step 5: Decide action
    ACTION="none"
    if [ "$ALIVE" = "false" ]; then
        if [ "$RESPAWN_COUNT" -lt "$MAX_RESPAWN_ATTEMPTS" ]; then
            ACTION="respawn"
        else
            ACTION="escalate"
        fi
    elif [ "$CLAUDE_RUNNING" = "false" ] && [ "$ALIVE" = "true" ]; then
        # Session exists but claude exited (task complete or crash)
        if [ "$CI_STATUS" = "FAILURE" ] && [ "$RESPAWN_COUNT" -lt "$MAX_RESPAWN_ATTEMPTS" ]; then
            ACTION="restart-claude-for-ci-fix"
        else
            ACTION="idle-ok"
        fi
    elif [ "$STALE" = "true" ]; then
        ACTION="notify-stale"
    else
        ACTION="healthy"
    fi

    # Step 6: Execute action
    case "$ACTION" in
        respawn)
            log "  ACTION: Respawning tmux session $SESSION"
            tmux new-session -d -s "$SESSION" -c "$WORKDIR" 2>/dev/null || true
            tmux send-keys -t "$SESSION" "unset CLAUDECODE && claude $FLAGS" Enter
            RESPAWN_COUNT=$((RESPAWN_COUNT + 1))
            RECOVERY_COUNT=$((RECOVERY_COUNT + 1))

            # Update state
            UPDATED=$(jq \
                --arg s "$SESSION" \
                --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                --argjson rc "$RESPAWN_COUNT" \
                '.sessions[$s].claude_running = true | .sessions[$s].last_seen_alive = $ts | .sessions[$s].respawn_count = $rc' \
                "$STATE_FILE")
            echo "$UPDATED" > "$STATE_FILE"
            ;;

        restart-claude-for-ci-fix)
            log "  ACTION: Restarting claude in $SESSION for CI fix"
            tmux send-keys -t "$SESSION" "unset CLAUDECODE && claude $FLAGS -p 'CI is failing. Run the tests, diagnose the failure, and fix it.'" Enter
            RESPAWN_COUNT=$((RESPAWN_COUNT + 1))
            RECOVERY_COUNT=$((RECOVERY_COUNT + 1))

            UPDATED=$(jq \
                --arg s "$SESSION" \
                --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                --argjson rc "$RESPAWN_COUNT" \
                '.sessions[$s].claude_running = true | .sessions[$s].last_seen_alive = $ts | .sessions[$s].respawn_count = $rc' \
                "$STATE_FILE")
            echo "$UPDATED" > "$STATE_FILE"
            ;;

        escalate)
            log "  ESCALATE: $SESSION exceeded max respawn attempts ($MAX_RESPAWN_ATTEMPTS)"
            DEAD_COUNT=$((DEAD_COUNT + 1))
            if [ -x "$NOTIFY_SCRIPT" ]; then
                "$NOTIFY_SCRIPT" "critical" "Agent $SESSION ($PROJECT) failed after $MAX_RESPAWN_ATTEMPTS respawn attempts. Manual intervention required."
            fi
            ;;

        notify-stale)
            log "  STALE: $SESSION has been idle for ${DIFF_MIN}m"
            if [ -x "$NOTIFY_SCRIPT" ]; then
                "$NOTIFY_SCRIPT" "warning" "Agent $SESSION ($PROJECT) appears stale (${DIFF_MIN}m idle)."
            fi
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))
            ;;

        idle-ok)
            log "  OK: $SESSION tmux alive, claude exited (task likely complete)"
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))

            UPDATED=$(jq \
                --arg s "$SESSION" \
                --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                '.sessions[$s].claude_running = false | .sessions[$s].last_seen_alive = $ts' \
                "$STATE_FILE")
            echo "$UPDATED" > "$STATE_FILE"
            ;;

        healthy)
            log "  HEALTHY: $SESSION running normally"
            HEALTHY_COUNT=$((HEALTHY_COUNT + 1))

            UPDATED=$(jq \
                --arg s "$SESSION" \
                --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
                '.sessions[$s].claude_running = true | .sessions[$s].last_seen_alive = $ts | .sessions[$s].respawn_count = 0' \
                "$STATE_FILE")
            echo "$UPDATED" > "$STATE_FILE"
            ;;
    esac

    RESULTS+=("$SESSION:$ACTION")
done

# === Update global metrics ===
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
if [ -f "$METRICS_FILE" ]; then
    UPDATED_METRICS=$(jq \
        --arg ts "$TIMESTAMP" \
        --argjson healthy "$HEALTHY_COUNT" \
        --argjson recovered "$RECOVERY_COUNT" \
        --argjson dead "$DEAD_COUNT" \
        '.last_health_check = $ts | .agents_healthy = $healthy | .agents_recovered_today = ((.agents_recovered_today // 0) + $recovered) | .agents_dead = $dead' \
        "$METRICS_FILE")
    echo "$UPDATED_METRICS" > "$METRICS_FILE"
fi

# === Summary ===
log "=== Health Check Complete ==="
log "Healthy: $HEALTHY_COUNT | Recovered: $RECOVERY_COUNT | Dead: $DEAD_COUNT"
for R in "${RESULTS[@]}"; do
    log "  $R"
done

# === Clean old logs (>7 days) ===
find "$LOG_DIR" -name "check-agents_*.log" -mtime +7 -delete 2>/dev/null || true

# === Exit code ===
if [ "$DEAD_COUNT" -gt 0 ]; then
    exit 2
elif [ "$RECOVERY_COUNT" -gt 0 ]; then
    exit 1
else
    exit 0
fi
```

### 1.3 Circuit Breaker Extension

To prevent respawn thrashing (agent crashes, respawns, crashes again in a loop), add a circuit breaker to the state file:

```json
{
  "sessions": {
    "autarkis1": {
      "circuit_breaker": {
        "state": "CLOSED",
        "consecutive_failures": 0,
        "last_failure": null,
        "cooldown_until": null
      }
    }
  }
}
```

States: `CLOSED` (normal operation) -> `OPEN` (3 consecutive failures, stop respawning for 30 minutes) -> `HALF_OPEN` (try one respawn after cooldown).

Add to check-agents.sh before the respawn action:

```bash
# Circuit breaker check
CB_STATE=$(jq -r ".sessions[\"$SESSION\"].circuit_breaker.state // \"CLOSED\"" "$STATE_FILE")
CB_COOLDOWN=$(jq -r ".sessions[\"$SESSION\"].circuit_breaker.cooldown_until // \"\"" "$STATE_FILE")

if [ "$CB_STATE" = "OPEN" ]; then
    if [ -n "$CB_COOLDOWN" ]; then
        COOLDOWN_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$CB_COOLDOWN" +%s 2>/dev/null || echo "0")
        NOW_EPOCH=$(date +%s)
        if [ "$NOW_EPOCH" -lt "$COOLDOWN_EPOCH" ]; then
            log "  CIRCUIT BREAKER OPEN: Skipping respawn until $CB_COOLDOWN"
            ACTION="circuit-breaker-open"
        else
            log "  CIRCUIT BREAKER HALF-OPEN: Attempting single respawn"
            # Update to HALF_OPEN
            UPDATED=$(jq --arg s "$SESSION" '.sessions[$s].circuit_breaker.state = "HALF_OPEN"' "$STATE_FILE")
            echo "$UPDATED" > "$STATE_FILE"
        fi
    fi
fi
```

---

## 2. State Machine for Task Routing

### 2.1 Design Rationale

From StateFlow (EMNLP 2024): "Using FSMs to model the task-solving process achieves 13% and 28% higher success rates compared to ReAct, with 5x and 3x less cost." From DeepMind arXiv 2512.08296: extra agents help most when base model accuracy is below ~45%. Above that threshold, single-agent is sufficient.

The router is a pure lookup table. Zero LLM involvement. The routing decision is: given a task type, what agent configuration should handle it?

### 2.2 Configuration: `_bmad/task-router.json`

```json
{
  "version": "1.0.0",
  "last_updated": "2026-03-06T00:00:00Z",

  "routing_rules": {
    "lint-fix": {
      "agent_type": "single",
      "model_tier": "fast",
      "max_retries": 2,
      "timeout_minutes": 15,
      "tools": ["bash", "read", "edit", "grep"],
      "context_tier": "minimal",
      "priority": "low",
      "estimated_tokens": 10000,
      "description": "Deterministic lint/type errors. Fast model, minimal context."
    },
    "bug-fix": {
      "agent_type": "single",
      "model_tier": "standard",
      "max_retries": 2,
      "timeout_minutes": 30,
      "tools": ["bash", "read", "edit", "grep", "glob", "write"],
      "context_tier": "standard",
      "priority": "medium",
      "estimated_tokens": 50000,
      "description": "Known bug with reproduction steps. Standard agent."
    },
    "feature-small": {
      "agent_type": "single",
      "model_tier": "standard",
      "max_retries": 1,
      "timeout_minutes": 60,
      "tools": ["bash", "read", "edit", "grep", "glob", "write", "web-search"],
      "context_tier": "full",
      "priority": "medium",
      "estimated_tokens": 100000,
      "description": "Small feature. Single file or small scope. One agent."
    },
    "feature-large": {
      "agent_type": "multi",
      "agent_count": 2,
      "model_tier": "powerful",
      "max_retries": 1,
      "timeout_minutes": 120,
      "tools": ["bash", "read", "edit", "grep", "glob", "write", "web-search", "mcp"],
      "context_tier": "full",
      "priority": "high",
      "estimated_tokens": 200000,
      "description": "Multi-file feature. May need planning + execution agents."
    },
    "e2e-test": {
      "agent_type": "single",
      "model_tier": "standard",
      "max_retries": 2,
      "timeout_minutes": 45,
      "tools": ["bash", "read", "edit", "write", "chrome-devtools"],
      "context_tier": "standard",
      "priority": "high",
      "description": "E2E test creation/fixing. Chrome DevTools MCP required."
    },
    "ci-fix": {
      "agent_type": "single",
      "model_tier": "fast",
      "max_retries": 2,
      "timeout_minutes": 15,
      "tools": ["bash", "read", "edit", "grep"],
      "context_tier": "minimal",
      "priority": "critical",
      "estimated_tokens": 15000,
      "description": "CI failing. Urgent. Fast fix. Stripe pattern: max 2 rounds."
    },
    "refactor": {
      "agent_type": "single",
      "model_tier": "powerful",
      "max_retries": 1,
      "timeout_minutes": 90,
      "tools": ["bash", "read", "edit", "grep", "glob", "write"],
      "context_tier": "full",
      "priority": "low",
      "estimated_tokens": 150000,
      "description": "Code restructuring. Needs full codebase context."
    },
    "research": {
      "agent_type": "multi",
      "agent_count": 3,
      "model_tier": "standard",
      "max_retries": 0,
      "timeout_minutes": 60,
      "tools": ["bash", "read", "web-search", "write"],
      "context_tier": "minimal",
      "priority": "low",
      "estimated_tokens": 80000,
      "description": "Web research task. Parallelizable. No retries (idempotent)."
    },
    "documentation": {
      "agent_type": "single",
      "model_tier": "fast",
      "max_retries": 1,
      "timeout_minutes": 30,
      "tools": ["bash", "read", "write", "glob"],
      "context_tier": "standard",
      "priority": "low",
      "estimated_tokens": 30000,
      "description": "Documentation updates. Fast model sufficient."
    }
  },

  "business_lines": {
    "autarkis": {
      "project_root": "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim",
      "daily_token_budget": 500000,
      "priority_boost": 1.0
    },
    "cityhub": {
      "project_root": "/Users/buraksmac/Desktop/code2/CityHub",
      "daily_token_budget": 300000,
      "priority_boost": 0.8
    },
    "contentos": {
      "project_root": "/Users/buraksmac/Desktop/code2/ContentOS",
      "daily_token_budget": 200000,
      "priority_boost": 0.6
    },
    "finance": {
      "project_root": "/Users/buraksmac/Desktop/code2/Finance-agent",
      "daily_token_budget": 100000,
      "priority_boost": 0.5
    },
    "orchestrator": {
      "project_root": "/Users/buraksmac/Desktop/code2/orchestrator",
      "daily_token_budget": 200000,
      "priority_boost": 1.2
    }
  },

  "difficulty_routing": {
    "description": "DeepMind 45% rule: if historical single-agent success rate > 45% for this task type, route to single agent. Below 45%, consider multi-agent.",
    "thresholds": {
      "single_agent_sufficient": 0.45,
      "multi_agent_recommended": 0.30,
      "human_required": 0.15
    }
  },

  "priority_order": ["critical", "high", "medium", "low"],

  "context_tiers": {
    "minimal": {
      "includes": ["CLAUDE.md", "error-output"],
      "max_tokens": 20000,
      "description": "Task-specific context only. For lint/CI fixes."
    },
    "standard": {
      "includes": ["CLAUDE.md", "relevant-files", "error-output", "recent-commits"],
      "max_tokens": 80000,
      "description": "Standard development context."
    },
    "full": {
      "includes": ["CLAUDE.md", "architecture-docs", "relevant-files", "error-output", "recent-commits", "related-prs"],
      "max_tokens": 180000,
      "description": "Full project context. For features and refactors."
    }
  }
}
```

### 2.3 Router Script: `.bmad/scripts/route-task.sh`

```bash
#!/bin/bash
# route-task.sh -- Deterministic Task Router
# Input: task type, business line, (optional) difficulty score
# Output: JSON agent configuration
#
# Usage: ./route-task.sh <task_type> <business_line> [difficulty_score]
# Example: ./route-task.sh bug-fix autarkis 0.7

set -euo pipefail

ROUTER_CONFIG="/Users/buraksmac/Desktop/code2/orchestrator/_bmad/task-router.json"
TASK_TYPE="${1:?Usage: route-task.sh <task_type> <business_line> [difficulty]}"
BUSINESS_LINE="${2:?Usage: route-task.sh <task_type> <business_line> [difficulty]}"
DIFFICULTY="${3:-0.5}"

# Validate task type exists
if ! jq -e ".routing_rules[\"$TASK_TYPE\"]" "$ROUTER_CONFIG" >/dev/null 2>&1; then
    echo "{\"error\": \"Unknown task type: $TASK_TYPE\", \"valid_types\": $(jq '[.routing_rules | keys[]]' "$ROUTER_CONFIG")}" >&2
    exit 1
fi

# Validate business line exists
if ! jq -e ".business_lines[\"$BUSINESS_LINE\"]" "$ROUTER_CONFIG" >/dev/null 2>&1; then
    echo "{\"error\": \"Unknown business line: $BUSINESS_LINE\", \"valid_lines\": $(jq '[.business_lines | keys[]]' "$ROUTER_CONFIG")}" >&2
    exit 1
fi

# Get routing rule
RULE=$(jq ".routing_rules[\"$TASK_TYPE\"]" "$ROUTER_CONFIG")

# Get business line config
BIZ=$(jq ".business_lines[\"$BUSINESS_LINE\"]" "$ROUTER_CONFIG")

# Apply DeepMind 45% rule: override agent_type based on difficulty
SINGLE_THRESHOLD=$(jq -r '.difficulty_routing.thresholds.single_agent_sufficient' "$ROUTER_CONFIG")
MULTI_THRESHOLD=$(jq -r '.difficulty_routing.thresholds.multi_agent_recommended' "$ROUTER_CONFIG")
HUMAN_THRESHOLD=$(jq -r '.difficulty_routing.thresholds.human_required' "$ROUTER_CONFIG")

EFFECTIVE_AGENT_TYPE=$(echo "$RULE" | jq -r '.agent_type')
ROUTE_REASON="default"

# If difficulty score provided, apply thresholds
if (( $(echo "$DIFFICULTY > $SINGLE_THRESHOLD" | bc -l) )); then
    EFFECTIVE_AGENT_TYPE="single"
    ROUTE_REASON="difficulty=$DIFFICULTY > threshold=$SINGLE_THRESHOLD (single agent sufficient)"
elif (( $(echo "$DIFFICULTY < $HUMAN_THRESHOLD" | bc -l) )); then
    EFFECTIVE_AGENT_TYPE="human"
    ROUTE_REASON="difficulty=$DIFFICULTY < threshold=$HUMAN_THRESHOLD (human intervention required)"
fi

# Build output
jq -n \
    --arg task_type "$TASK_TYPE" \
    --arg business_line "$BUSINESS_LINE" \
    --arg difficulty "$DIFFICULTY" \
    --arg effective_agent_type "$EFFECTIVE_AGENT_TYPE" \
    --arg route_reason "$ROUTE_REASON" \
    --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson rule "$RULE" \
    --argjson biz "$BIZ" \
    '{
        routing_decision: {
            task_type: $task_type,
            business_line: $business_line,
            difficulty_score: ($difficulty | tonumber),
            effective_agent_type: $effective_agent_type,
            route_reason: $route_reason,
            timestamp: $timestamp
        },
        agent_config: $rule,
        business_config: $biz
    }'
```

### 2.4 Task Queue: `_bmad/task-queue.json`

```json
{
  "version": "1.0.0",
  "queue": [
    {
      "id": "TASK-001",
      "type": "bug-fix",
      "business_line": "autarkis",
      "title": "Fix login redirect loop on mobile Safari",
      "status": "queued",
      "priority": "high",
      "created_at": "2026-03-06T08:00:00Z",
      "assigned_session": null,
      "retry_count": 0,
      "max_retries": 2,
      "pr_number": null,
      "ci_status": null,
      "difficulty_score": 0.6,
      "routed_at": null,
      "completed_at": null,
      "tokens_used": 0
    }
  ],
  "completed": [],
  "failed": []
}
```

### 2.5 Dispatch Script: `.bmad/scripts/dispatch-task.sh`

```bash
#!/bin/bash
# dispatch-task.sh -- Pop next task from queue, route it, assign to session
#
# Usage: ./dispatch-task.sh
# Idempotent: only dispatches if a session is available and a task is queued.

set -euo pipefail

ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
QUEUE_FILE="$ORCHESTRATOR_ROOT/_bmad/task-queue.json"
STATE_FILE="$ORCHESTRATOR_ROOT/_bmad/orchestrator-tmux-state.json"
ROUTER_SCRIPT="$ORCHESTRATOR_ROOT/.bmad/scripts/route-task.sh"

# Find next queued task (highest priority first)
NEXT_TASK=$(jq -r '
    .queue
    | map(select(.status == "queued"))
    | sort_by(
        if .priority == "critical" then 0
        elif .priority == "high" then 1
        elif .priority == "medium" then 2
        else 3 end
    )
    | first
    | .id // empty
' "$QUEUE_FILE")

if [ -z "$NEXT_TASK" ]; then
    echo "No queued tasks."
    exit 0
fi

# Get task details
TASK_TYPE=$(jq -r ".queue[] | select(.id == \"$NEXT_TASK\") | .type" "$QUEUE_FILE")
BIZ_LINE=$(jq -r ".queue[] | select(.id == \"$NEXT_TASK\") | .business_line" "$QUEUE_FILE")
DIFFICULTY=$(jq -r ".queue[] | select(.id == \"$NEXT_TASK\") | .difficulty_score // 0.5" "$QUEUE_FILE")

# Route the task
ROUTING=$("$ROUTER_SCRIPT" "$TASK_TYPE" "$BIZ_LINE" "$DIFFICULTY")
AGENT_TYPE=$(echo "$ROUTING" | jq -r '.routing_decision.effective_agent_type')

if [ "$AGENT_TYPE" = "human" ]; then
    # Update task status to needs-human
    UPDATED=$(jq --arg id "$NEXT_TASK" '
        .queue |= map(if .id == $id then .status = "needs-human" else . end)
    ' "$QUEUE_FILE")
    echo "$UPDATED" > "$QUEUE_FILE"
    echo "Task $NEXT_TASK routed to human (difficulty too low for agent success)."
    exit 0
fi

# Find available session for this business line
AVAILABLE_SESSION=$(jq -r --arg biz "$BIZ_LINE" '
    .sessions | to_entries[]
    | select(.value.project | ascii_downcase | contains($biz))
    | select(.value.claude_running == false)
    | .key
' "$STATE_FILE" | head -1)

if [ -z "$AVAILABLE_SESSION" ]; then
    echo "No available session for $BIZ_LINE. Task $NEXT_TASK remains queued."
    exit 0
fi

# Assign task to session
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Update queue
UPDATED_QUEUE=$(jq --arg id "$NEXT_TASK" --arg session "$AVAILABLE_SESSION" --arg ts "$TIMESTAMP" '
    .queue |= map(
        if .id == $id then
            .status = "assigned" | .assigned_session = $session | .routed_at = $ts
        else . end
    )
' "$QUEUE_FILE")
echo "$UPDATED_QUEUE" > "$QUEUE_FILE"

# Update tmux state
UPDATED_STATE=$(jq --arg s "$AVAILABLE_SESSION" --arg ts "$TIMESTAMP" --arg task "$NEXT_TASK" '
    .sessions[$s].claude_running = true | .sessions[$s].current_task = $task | .sessions[$s].last_seen_alive = $ts
' "$STATE_FILE")
echo "$UPDATED_STATE" > "$STATE_FILE"

# Get task title for the prompt
TASK_TITLE=$(jq -r ".queue[] | select(.id == \"$NEXT_TASK\") | .title" "$QUEUE_FILE")
WORKDIR=$(jq -r ".sessions[\"$AVAILABLE_SESSION\"].working_directory" "$STATE_FILE")
FLAGS=$(jq -r ".sessions[\"$AVAILABLE_SESSION\"].claude_flags // \"--dangerously-skip-permissions\"" "$STATE_FILE")

# Start claude with the task
tmux send-keys -t "$AVAILABLE_SESSION" "cd '$WORKDIR' && unset CLAUDECODE && claude $FLAGS -p '$TASK_TITLE'" Enter

echo "Dispatched: $NEXT_TASK -> $AVAILABLE_SESSION ($TASK_TYPE, $BIZ_LINE)"
```

---

## 3. LaunchAgent / Cron Architecture

### 3.1 Design Rationale

The existing Finance-agent scheduler (`scheduler/manage.sh` + plist files) is the proven pattern. launchd is the correct choice for macOS: it handles sleep/wake correctly (unlike cron), logs failures, and survives reboots. The design scales this pattern to cover all orchestrator scheduling needs.

### 3.2 Schedule Overview

| Schedule | Label | Script | What It Does |
|----------|-------|--------|-------------|
| Every 10 min | `com.burak.orchestrator-health` | `check-agents.sh` | Probe tmux sessions, check PR/CI, auto-respawn |
| Daily 07:30 | `com.burak.orchestrator-morning` | `morning-scan.sh` | Scan Sentry, email, Notion for new tasks |
| Daily 23:00 | `com.burak.orchestrator-cleanup` | `daily-cleanup.sh` | Clean orphaned worktrees, stale state, old logs |
| Weekly Mon 06:00 | `com.burak.orchestrator-weekly` | `weekly-maintenance.sh` | Knowledge compaction, metrics rollup, dependency updates |
| Every 5 hours | `com.burak.orchestrator-tokens` | `token-snapshot.sh` | Token usage snapshot (aligned with Claude's billing windows) |

### 3.3 Plist Templates

#### Health Check (every 10 minutes)

File: `scheduler/com.burak.orchestrator-health.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.burak.orchestrator-health</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/.bmad/scripts/check-agents.sh</string>
    </array>

    <key>StartInterval</key>
    <integer>600</integer>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/Users/buraksmac</string>
    </dict>

    <key>WorkingDirectory</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator</string>

    <key>StandardOutPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-health-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-health-stderr.log</string>

    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
```

#### Morning Scan (daily 07:30)

File: `scheduler/com.burak.orchestrator-morning.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.burak.orchestrator-morning</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/.bmad/scripts/morning-scan.sh</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>7</integer>
        <key>Minute</key>
        <integer>30</integer>
    </dict>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/Users/buraksmac</string>
    </dict>

    <key>WorkingDirectory</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator</string>

    <key>StandardOutPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-morning-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-morning-stderr.log</string>

    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
```

#### Daily Cleanup (23:00)

File: `scheduler/com.burak.orchestrator-cleanup.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.burak.orchestrator-cleanup</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/.bmad/scripts/daily-cleanup.sh</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>23</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/Users/buraksmac</string>
    </dict>

    <key>WorkingDirectory</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator</string>

    <key>StandardOutPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-cleanup-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-cleanup-stderr.log</string>

    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
```

#### Weekly Maintenance (Monday 06:00)

File: `scheduler/com.burak.orchestrator-weekly.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.burak.orchestrator-weekly</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/.bmad/scripts/weekly-maintenance.sh</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>6</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>HOME</key>
        <string>/Users/buraksmac</string>
    </dict>

    <key>WorkingDirectory</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator</string>

    <key>StandardOutPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-weekly-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs/launchd-weekly-stderr.log</string>

    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
```

### 3.4 Morning Scan Script: `.bmad/scripts/morning-scan.sh`

```bash
#!/bin/bash
# morning-scan.sh -- Daily Morning Intelligence Gathering
# 100% deterministic: scans external sources, creates task-queue entries
#
# Sources checked:
#   1. GitHub: open PRs needing review, failing CI
#   2. Open issues assigned to agent-compatible labels
#   3. Stale branches (no commits in 3+ days)
#
# Future extensions (require API keys):
#   - Sentry: new unresolved errors
#   - Notion: tasks in "Ready for Agent" status
#   - Email: parse for actionable items (would need LLM = hybrid)

set -euo pipefail

ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
QUEUE_FILE="$ORCHESTRATOR_ROOT/_bmad/task-queue.json"
LOG_DIR="$ORCHESTRATOR_ROOT/_bmad/logs"
NOTIFY_SCRIPT="$ORCHESTRATOR_ROOT/.bmad/scripts/notify.sh"

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/morning-scan_$(date +%Y%m%d_%H%M%S).log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== Morning Scan Started ==="

TASKS_FOUND=0

# Define project directories to scan
PROJECTS=(
    "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim:autarkis"
    "/Users/buraksmac/Desktop/code2/CityHub:cityhub"
    "/Users/buraksmac/Desktop/code2/ContentOS:contentos"
    "/Users/buraksmac/Desktop/code2/Finance-agent:finance"
)

for ENTRY in "${PROJECTS[@]}"; do
    IFS=':' read -r PROJECT_DIR BIZ_LINE <<< "$ENTRY"

    if [ ! -d "$PROJECT_DIR" ]; then
        log "SKIP: $PROJECT_DIR does not exist"
        continue
    fi

    log "--- Scanning: $BIZ_LINE ($PROJECT_DIR) ---"

    # 1. Check for PRs with failing CI
    FAILING_PRS=$(cd "$PROJECT_DIR" && gh pr list --state open --json number,title,headRefName,statusCheckRollup 2>/dev/null | \
        jq -r '[.[] | select(.statusCheckRollup[]?.state == "FAILURE")] | .[] | "\(.number)|\(.title)|\(.headRefName)"' 2>/dev/null || echo "")

    if [ -n "$FAILING_PRS" ]; then
        while IFS='|' read -r PR_NUM PR_TITLE PR_BRANCH; do
            TASK_ID="CI-FIX-${BIZ_LINE}-${PR_NUM}-$(date +%Y%m%d)"
            # Check if task already exists
            EXISTS=$(jq -r --arg id "$TASK_ID" '.queue[] | select(.id == $id) | .id' "$QUEUE_FILE" 2>/dev/null || echo "")
            if [ -z "$EXISTS" ]; then
                log "  FOUND: Failing CI on PR #$PR_NUM: $PR_TITLE"
                UPDATED=$(jq --arg id "$TASK_ID" --arg title "Fix failing CI on PR #$PR_NUM: $PR_TITLE" --arg biz "$BIZ_LINE" --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
                    .queue += [{
                        id: $id,
                        type: "ci-fix",
                        business_line: $biz,
                        title: $title,
                        status: "queued",
                        priority: "critical",
                        created_at: $ts,
                        assigned_session: null,
                        retry_count: 0,
                        max_retries: 2,
                        pr_number: null,
                        ci_status: "FAILURE",
                        difficulty_score: 0.6,
                        routed_at: null,
                        completed_at: null,
                        tokens_used: 0
                    }]
                ' "$QUEUE_FILE")
                echo "$UPDATED" > "$QUEUE_FILE"
                TASKS_FOUND=$((TASKS_FOUND + 1))
            fi
        done <<< "$FAILING_PRS"
    fi

    # 2. Check for stale branches (no commits in 3+ days, has open PR)
    STALE_PRS=$(cd "$PROJECT_DIR" && gh pr list --state open --json number,title,updatedAt 2>/dev/null | \
        jq -r --arg cutoff "$(date -v-3d -u +%Y-%m-%dT%H:%M:%SZ)" '[.[] | select(.updatedAt < $cutoff)] | .[] | "\(.number)|\(.title)"' 2>/dev/null || echo "")

    if [ -n "$STALE_PRS" ]; then
        while IFS='|' read -r PR_NUM PR_TITLE; do
            [ -z "$PR_NUM" ] && continue
            log "  STALE: PR #$PR_NUM: $PR_TITLE (no updates in 3+ days)"
        done <<< "$STALE_PRS"
    fi

done

log "=== Morning Scan Complete: $TASKS_FOUND new tasks found ==="

# Notify if tasks were found
if [ "$TASKS_FOUND" -gt 0 ] && [ -x "$NOTIFY_SCRIPT" ]; then
    "$NOTIFY_SCRIPT" "info" "Morning scan: $TASKS_FOUND new tasks queued. Run dispatch to assign."
fi

# Clean old logs
find "$LOG_DIR" -name "morning-scan_*.log" -mtime +7 -delete 2>/dev/null || true

exit 0
```

### 3.5 Daily Cleanup Script: `.bmad/scripts/daily-cleanup.sh`

```bash
#!/bin/bash
# daily-cleanup.sh -- Nightly Maintenance
# Cleans orphaned worktrees, stale state entries, old logs, temp files

set -euo pipefail

ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
LOG_DIR="$ORCHESTRATOR_ROOT/_bmad/logs"
LOG_FILE="$LOG_DIR/daily-cleanup_$(date +%Y%m%d).log"

mkdir -p "$LOG_DIR"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=== Daily Cleanup Started ==="

# 1. Clean orphaned git worktrees across all projects
PROJECTS=(
    "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim"
    "/Users/buraksmac/Desktop/code2/CityHub"
    "/Users/buraksmac/Desktop/code2/ContentOS"
    "/Users/buraksmac/Desktop/code2/Finance-agent"
    "/Users/buraksmac/Desktop/code2/orchestrator"
)

for PROJECT in "${PROJECTS[@]}"; do
    if [ -d "$PROJECT/.git" ]; then
        log "Pruning worktrees: $PROJECT"
        cd "$PROJECT"
        git worktree prune 2>/dev/null || true
        # List remaining worktrees
        WORKTREE_COUNT=$(git worktree list 2>/dev/null | wc -l | tr -d ' ')
        log "  Active worktrees: $WORKTREE_COUNT"
    fi
done

# 2. Clean old log files (>30 days)
OLD_LOGS=$(find "$LOG_DIR" -name "*.log" -mtime +30 2>/dev/null | wc -l | tr -d ' ')
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
log "Cleaned $OLD_LOGS old log files"

# 3. Reset respawn counters in tmux state (daily reset)
STATE_FILE="$ORCHESTRATOR_ROOT/_bmad/orchestrator-tmux-state.json"
if [ -f "$STATE_FILE" ]; then
    UPDATED=$(jq '.sessions |= with_entries(.value.respawn_count = 0)' "$STATE_FILE")
    echo "$UPDATED" > "$STATE_FILE"
    log "Reset all respawn counters"
fi

# 4. Archive completed tasks from queue
QUEUE_FILE="$ORCHESTRATOR_ROOT/_bmad/task-queue.json"
if [ -f "$QUEUE_FILE" ]; then
    COMPLETED_COUNT=$(jq '.completed | length' "$QUEUE_FILE")
    if [ "$COMPLETED_COUNT" -gt 100 ]; then
        # Archive old completed tasks
        ARCHIVE_FILE="$ORCHESTRATOR_ROOT/_bmad/archives/tasks-$(date +%Y%m%d).json"
        mkdir -p "$ORCHESTRATOR_ROOT/_bmad/archives"
        jq '.completed' "$QUEUE_FILE" > "$ARCHIVE_FILE"
        UPDATED=$(jq '.completed = []' "$QUEUE_FILE")
        echo "$UPDATED" > "$QUEUE_FILE"
        log "Archived $COMPLETED_COUNT completed tasks to $ARCHIVE_FILE"
    fi
fi

# 5. Clean Claude temp files
find /tmp -name "claude-*" -mtime +1 -delete 2>/dev/null || true
log "Cleaned stale Claude temp files"

# 6. Verify disk space
DISK_USAGE=$(df -h "$HOME" | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 90 ]; then
    log "WARNING: Disk usage at ${DISK_USAGE}%"
    "$ORCHESTRATOR_ROOT/.bmad/scripts/notify.sh" "warning" "Disk usage at ${DISK_USAGE}%. Consider cleanup." 2>/dev/null || true
fi

log "=== Daily Cleanup Complete ==="
exit 0
```

### 3.6 Scheduler Manager: `scheduler/manage.sh`

```bash
#!/bin/bash
# Orchestrator Scheduler Management
# Usage: ./manage.sh {install|uninstall|status|test}
#
# Modeled on Finance-agent/scheduler/manage.sh (proven pattern)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PLIST_DIR="$HOME/Library/LaunchAgents"

AGENTS=(
    "com.burak.orchestrator-health"
    "com.burak.orchestrator-morning"
    "com.burak.orchestrator-cleanup"
    "com.burak.orchestrator-weekly"
)

case "${1:-help}" in
    install)
        echo "Installing Orchestrator Scheduler..."
        echo ""

        # Ensure scripts are executable
        chmod +x "$PROJECT_ROOT/.bmad/scripts/"*.sh

        # Ensure log directory exists
        mkdir -p "$PROJECT_ROOT/_bmad/logs"

        for AGENT in "${AGENTS[@]}"; do
            SRC="$SCRIPT_DIR/${AGENT}.plist"
            DEST="$PLIST_DIR/${AGENT}.plist"

            if [ -f "$SRC" ]; then
                cp "$SRC" "$DEST"
                launchctl load "$DEST"
                echo "  Loaded: $AGENT"
            else
                echo "  SKIP: $SRC not found"
            fi
        done

        echo ""
        echo "Schedule:"
        echo "  Health check:      Every 10 minutes"
        echo "  Morning scan:      Daily 07:30"
        echo "  Daily cleanup:     Daily 23:00"
        echo "  Weekly maintenance: Monday 06:00"
        echo ""
        echo "Logs: $PROJECT_ROOT/_bmad/logs/"
        ;;

    uninstall)
        echo "Uninstalling Orchestrator Scheduler..."
        for AGENT in "${AGENTS[@]}"; do
            DEST="$PLIST_DIR/${AGENT}.plist"
            launchctl unload "$DEST" 2>/dev/null || true
            rm -f "$DEST"
            echo "  Removed: $AGENT"
        done
        echo "Done."
        ;;

    status)
        echo "======================================="
        echo "  Orchestrator Scheduler Status"
        echo "======================================="
        echo ""

        for AGENT in "${AGENTS[@]}"; do
            if launchctl list 2>/dev/null | grep -q "$AGENT"; then
                echo "  [ACTIVE]  $AGENT"
            else
                echo "  [INACTIVE] $AGENT"
            fi
        done

        echo ""
        echo "  Recent logs:"
        ls -lt "$PROJECT_ROOT/_bmad/logs/"*.log 2>/dev/null | head -5 | while read -r line; do
            echo "    $line"
        done
        echo ""
        ;;

    test)
        SCRIPT="${2:-check-agents}"
        echo "Running: .bmad/scripts/${SCRIPT}.sh"
        "$PROJECT_ROOT/.bmad/scripts/${SCRIPT}.sh"
        ;;

    *)
        echo "Usage: $0 {install|uninstall|status|test [script-name]}"
        ;;
esac
```

---

## 4. Git Worktree Management Scripts

### 4.1 Design Rationale

From coderabbitai/git-worktree-runner: worktrees share a single `.git` directory, making them lightweight. From Nx blog and multiple AI development guides: each agent gets its own worktree, eliminating file conflicts entirely. From OpenAI Codex: worktrees are the standard for parallel agent execution.

Key operations: create worktree with branch, clean up after merge, handle conflicts deterministically, list active worktrees across projects.

### 4.2 Script: `.bmad/scripts/worktree.sh`

```bash
#!/bin/bash
# worktree.sh -- Git Worktree Management for Agent Isolation
#
# Usage:
#   worktree.sh create <project_dir> <branch_name> [base_branch]
#   worktree.sh cleanup <project_dir> <branch_name>
#   worktree.sh list [project_dir]
#   worktree.sh prune-all
#   worktree.sh status

set -euo pipefail

ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
WORKTREE_BASE="/Users/buraksmac/Desktop/code2/.worktrees"
LOG_DIR="$ORCHESTRATOR_ROOT/_bmad/logs"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] worktree: $*"
}

case "${1:-help}" in
    create)
        PROJECT_DIR="${2:?Usage: worktree.sh create <project_dir> <branch_name> [base_branch]}"
        BRANCH_NAME="${3:?Usage: worktree.sh create <project_dir> <branch_name> [base_branch]}"
        BASE_BRANCH="${4:-main}"

        # Derive worktree directory
        PROJECT_NAME=$(basename "$PROJECT_DIR")
        WORKTREE_DIR="$WORKTREE_BASE/${PROJECT_NAME}--${BRANCH_NAME}"

        if [ -d "$WORKTREE_DIR" ]; then
            log "Worktree already exists: $WORKTREE_DIR"
            echo "$WORKTREE_DIR"
            exit 0
        fi

        # Ensure base is up to date
        cd "$PROJECT_DIR"
        git fetch origin "$BASE_BRANCH" 2>/dev/null || true

        # Create worktree
        mkdir -p "$WORKTREE_BASE"
        git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "origin/$BASE_BRANCH" 2>/dev/null || \
            git worktree add "$WORKTREE_DIR" "$BRANCH_NAME" 2>/dev/null || {
                log "ERROR: Failed to create worktree for $BRANCH_NAME"
                exit 1
            }

        # Copy necessary config files that are gitignored
        for CONFIG_FILE in .env .env.local .env.development.local; do
            if [ -f "$PROJECT_DIR/$CONFIG_FILE" ]; then
                cp "$PROJECT_DIR/$CONFIG_FILE" "$WORKTREE_DIR/$CONFIG_FILE"
                log "Copied $CONFIG_FILE to worktree"
            fi
        done

        # Copy CLAUDE.md if it exists (ensures agent context)
        if [ -f "$PROJECT_DIR/CLAUDE.md" ]; then
            # CLAUDE.md should be in git, but ensure it's available
            log "CLAUDE.md present in worktree"
        fi

        # Install dependencies if package.json exists
        if [ -f "$WORKTREE_DIR/package.json" ]; then
            cd "$WORKTREE_DIR"
            if [ -f "package-lock.json" ]; then
                npm ci --silent 2>/dev/null || npm install --silent 2>/dev/null || true
            elif [ -f "pnpm-lock.yaml" ]; then
                pnpm install --frozen-lockfile 2>/dev/null || true
            fi
            log "Dependencies installed"
        fi

        log "Created: $WORKTREE_DIR (branch: $BRANCH_NAME, base: $BASE_BRANCH)"
        echo "$WORKTREE_DIR"
        ;;

    cleanup)
        PROJECT_DIR="${2:?Usage: worktree.sh cleanup <project_dir> <branch_name>}"
        BRANCH_NAME="${3:?Usage: worktree.sh cleanup <project_dir> <branch_name>}"

        PROJECT_NAME=$(basename "$PROJECT_DIR")
        WORKTREE_DIR="$WORKTREE_BASE/${PROJECT_NAME}--${BRANCH_NAME}"

        if [ ! -d "$WORKTREE_DIR" ]; then
            log "Worktree does not exist: $WORKTREE_DIR"
            exit 0
        fi

        # Check if branch was merged
        cd "$PROJECT_DIR"
        MERGED=$(git branch --merged main 2>/dev/null | grep -c "$BRANCH_NAME" || echo "0")

        if [ "$MERGED" -gt 0 ]; then
            log "Branch $BRANCH_NAME is merged. Cleaning up."
            git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || rm -rf "$WORKTREE_DIR"
            git branch -d "$BRANCH_NAME" 2>/dev/null || true
            log "Removed worktree and branch: $BRANCH_NAME"
        else
            log "WARNING: Branch $BRANCH_NAME not yet merged. Worktree preserved."
            log "  To force cleanup: rm -rf $WORKTREE_DIR && git worktree prune"
        fi
        ;;

    list)
        PROJECT_DIR="${2:-}"

        if [ -n "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR" ]; then
            cd "$PROJECT_DIR"
            echo "=== Worktrees: $(basename "$PROJECT_DIR") ==="
            git worktree list
        else
            echo "=== All Worktrees ==="
            if [ -d "$WORKTREE_BASE" ]; then
                ls -la "$WORKTREE_BASE/" 2>/dev/null || echo "  No worktrees found"
            fi
            echo ""
            # Also check each known project
            for DIR in "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim" \
                       "/Users/buraksmac/Desktop/code2/CityHub" \
                       "/Users/buraksmac/Desktop/code2/ContentOS" \
                       "/Users/buraksmac/Desktop/code2/Finance-agent"; do
                if [ -d "$DIR/.git" ]; then
                    echo "--- $(basename "$DIR") ---"
                    cd "$DIR" && git worktree list 2>/dev/null
                    echo ""
                fi
            done
        fi
        ;;

    prune-all)
        log "Pruning all worktrees across projects..."
        for DIR in "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim" \
                   "/Users/buraksmac/Desktop/code2/CityHub" \
                   "/Users/buraksmac/Desktop/code2/ContentOS" \
                   "/Users/buraksmac/Desktop/code2/Finance-agent" \
                   "/Users/buraksmac/Desktop/code2/orchestrator"; do
            if [ -d "$DIR/.git" ]; then
                cd "$DIR"
                BEFORE=$(git worktree list | wc -l | tr -d ' ')
                git worktree prune 2>/dev/null || true
                AFTER=$(git worktree list | wc -l | tr -d ' ')
                PRUNED=$((BEFORE - AFTER))
                if [ "$PRUNED" -gt 0 ]; then
                    log "Pruned $PRUNED worktrees from $(basename "$DIR")"
                fi
            fi
        done
        log "Prune complete."
        ;;

    status)
        echo "======================================="
        echo "  Git Worktree Status"
        echo "======================================="

        TOTAL=0
        for DIR in "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim" \
                   "/Users/buraksmac/Desktop/code2/CityHub" \
                   "/Users/buraksmac/Desktop/code2/ContentOS" \
                   "/Users/buraksmac/Desktop/code2/Finance-agent" \
                   "/Users/buraksmac/Desktop/code2/orchestrator"; do
            if [ -d "$DIR/.git" ]; then
                COUNT=$(cd "$DIR" && git worktree list 2>/dev/null | wc -l | tr -d ' ')
                TOTAL=$((TOTAL + COUNT))
                printf "  %-25s %d worktrees\n" "$(basename "$DIR")" "$COUNT"
            fi
        done
        echo "  ---"
        echo "  Total: $TOTAL"
        ;;

    *)
        echo "Usage: worktree.sh {create|cleanup|list|prune-all|status}"
        echo ""
        echo "Commands:"
        echo "  create <project_dir> <branch_name> [base_branch]"
        echo "  cleanup <project_dir> <branch_name>"
        echo "  list [project_dir]"
        echo "  prune-all"
        echo "  status"
        ;;
esac
```

---

## 5. Notification Layer Design

### 5.1 Design Rationale

Three channels, one dispatcher. Urgency-based routing:
- **Critical** (agent death, CI failure on production, budget exceeded): Telegram + macOS notification
- **Warning** (stale agent, budget 80%, disk space): macOS notification
- **Info** (morning scan results, task dispatched, cleanup complete): Notion inbox (or log only)

### 5.2 Unified Notification Script: `.bmad/scripts/notify.sh`

```bash
#!/bin/bash
# notify.sh -- Unified Notification Dispatcher
#
# Usage: notify.sh <urgency> <message>
#   urgency: critical | warning | info
#
# Channels:
#   critical -> Telegram + macOS notification (sound: Basso)
#   warning  -> macOS notification (sound: Ping)
#   info     -> macOS notification (sound: Glass) + log only

set -euo pipefail

URGENCY="${1:?Usage: notify.sh <critical|warning|info> <message>}"
MESSAGE="${2:?Usage: notify.sh <critical|warning|info> <message>}"
TIMESTAMP=$(date +'%Y-%m-%d %H:%M:%S')

# === Telegram Configuration ===
# Set these as environment variables or in .bmad/secrets/telegram.env
TELEGRAM_ENV="/Users/buraksmac/Desktop/code2/orchestrator/.bmad/secrets/telegram.env"
if [ -f "$TELEGRAM_ENV" ]; then
    source "$TELEGRAM_ENV"
fi
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

# === Notification Log ===
LOG_DIR="/Users/buraksmac/Desktop/code2/orchestrator/_bmad/logs"
mkdir -p "$LOG_DIR"
NOTIFICATION_LOG="$LOG_DIR/notifications.log"

# Always log
echo "[$TIMESTAMP] [$URGENCY] $MESSAGE" >> "$NOTIFICATION_LOG"

# === Urgency-based routing ===
case "$URGENCY" in
    critical)
        SOUND="Basso"
        TITLE="ORCHESTRATOR CRITICAL"
        EMOJI="[!!!]"

        # macOS notification
        osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"$SOUND\"" 2>/dev/null || true

        # Telegram (if configured)
        if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
            TELEGRAM_MSG="$EMOJI $TITLE%0A%0A$MESSAGE%0A%0A$TIMESTAMP"
            curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                -d "chat_id=${TELEGRAM_CHAT_ID}" \
                -d "text=${TELEGRAM_MSG}" \
                -d "parse_mode=HTML" \
                >/dev/null 2>&1 || true
        fi
        ;;

    warning)
        SOUND="Ping"
        TITLE="Orchestrator Warning"

        # macOS notification only
        osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"$SOUND\"" 2>/dev/null || true
        ;;

    info)
        SOUND="Glass"
        TITLE="Orchestrator"

        # Silent macOS notification (no sound for info)
        osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\"" 2>/dev/null || true
        ;;

    *)
        echo "Unknown urgency: $URGENCY (expected: critical|warning|info)" >&2
        exit 1
        ;;
esac

exit 0
```

### 5.3 Telegram Setup Instructions

```bash
# 1. Create bot via @BotFather on Telegram
#    Send: /newbot
#    Name: "Orchestrator Burak"
#    Username: burak_orchestrator_bot
#    Save the bot token

# 2. Get your chat ID via @myidbot
#    Send: /getid
#    Save the chat ID

# 3. Create secrets file (gitignored)
mkdir -p /Users/buraksmac/Desktop/code2/orchestrator/.bmad/secrets
cat > /Users/buraksmac/Desktop/code2/orchestrator/.bmad/secrets/telegram.env << 'EOF'
TELEGRAM_BOT_TOKEN="your-bot-token-here"
TELEGRAM_CHAT_ID="your-chat-id-here"
EOF

# 4. Ensure .gitignore excludes secrets
echo ".bmad/secrets/" >> /Users/buraksmac/Desktop/code2/orchestrator/.gitignore

# 5. Test
/Users/buraksmac/Desktop/code2/orchestrator/.bmad/scripts/notify.sh critical "Test notification from orchestrator"
```

### 5.4 Future: Notion Inbox Integration

For non-urgent items, a future extension would create Notion database entries via the Notion API. The pattern:

```bash
# Would require NOTION_API_KEY and a database ID
# Creates a new page in the "Agent Inbox" database
curl -X POST "https://api.notion.com/v1/pages" \
    -H "Authorization: Bearer ${NOTION_API_KEY}" \
    -H "Content-Type: application/json" \
    -H "Notion-Version: 2022-06-28" \
    -d '{
        "parent": {"database_id": "'${NOTION_DB_ID}'"},
        "properties": {
            "Title": {"title": [{"text": {"content": "'"$MESSAGE"'"}}]},
            "Status": {"select": {"name": "New"}},
            "Urgency": {"select": {"name": "'"$URGENCY"'"}},
            "Source": {"select": {"name": "Orchestrator"}},
            "Created": {"date": {"start": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}}
        }
    }'
```

---

## 6. Token Budget Enforcement

### 6.1 Design Rationale

Claude Max ($200/month) provides a fixed token allocation that resets every 5 hours. The LLM cannot reliably count its own tokens. Budget enforcement must be deterministic and external to the LLM. From Phase 1 analysis: "LLMs cannot count their own tokens reliably" and "Budget enforcement must be exact."

Key tools discovered:
- **ccusage** (ryoppippi/ccusage): CLI that reads `~/.claude/projects/<project>/<conversation>.jsonl` files natively
- **Claude-Code-Usage-Monitor** (Maciek-roboblog): Real-time terminal monitor with predictions
- **Claude-Usage-Tracker**: Native macOS menu bar app

### 6.2 Token Tracking Script: `.bmad/scripts/token-snapshot.sh`

```bash
#!/bin/bash
# token-snapshot.sh -- Capture token usage snapshot
# Reads Claude Code's local JSONL files to track per-project usage
# Designed to run every 5 hours (aligned with Claude's billing windows)

set -euo pipefail

ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
METRICS_FILE="$ORCHESTRATOR_ROOT/_bmad/metrics.json"
BUDGET_FILE="$ORCHESTRATOR_ROOT/_bmad/token-budgets.json"
NOTIFY_SCRIPT="$ORCHESTRATOR_ROOT/.bmad/scripts/notify.sh"
CLAUDE_DATA_DIR="$HOME/.claude/projects"

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TODAY=$(date +%Y-%m-%d)

# === Initialize budget file if missing ===
if [ ! -f "$BUDGET_FILE" ]; then
    cat > "$BUDGET_FILE" << 'BUDGET_EOF'
{
  "version": "1.0.0",
  "billing_window_hours": 5,
  "daily_limits": {
    "autarkis": 500000,
    "cityhub": 300000,
    "contentos": 200000,
    "finance": 100000,
    "orchestrator": 200000,
    "total": 1300000
  },
  "alert_thresholds": {
    "warning_percent": 80,
    "critical_percent": 95
  },
  "usage_today": {},
  "usage_history": []
}
BUDGET_EOF
fi

# === Count tokens from JSONL files ===
count_project_tokens() {
    local project_path="$1"
    local total=0

    if [ ! -d "$CLAUDE_DATA_DIR" ]; then
        echo "0"
        return
    fi

    # Find JSONL files modified today for this project
    # Claude stores conversations in: ~/.claude/projects/<encoded-path>/<uuid>.jsonl
    for jsonl in "$CLAUDE_DATA_DIR"/*/*.jsonl; do
        [ -f "$jsonl" ] || continue

        # Check if file was modified today
        FILE_DATE=$(date -r "$jsonl" +%Y-%m-%d 2>/dev/null || echo "")
        if [ "$FILE_DATE" = "$TODAY" ]; then
            # Check if this JSONL relates to our project
            # The directory name is an encoded version of the project path
            DIR_NAME=$(basename "$(dirname "$jsonl")")

            # Simple heuristic: check if project name appears in the encoded path
            PROJECT_NAME=$(basename "$project_path" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
            if echo "$DIR_NAME" | grep -qi "$PROJECT_NAME" 2>/dev/null; then
                # Sum up token counts from the JSONL
                # Each line has usage data with input_tokens and output_tokens
                FILE_TOKENS=$(grep -o '"input_tokens":[0-9]*' "$jsonl" 2>/dev/null | \
                    awk -F: '{sum += $2} END {print sum+0}')
                FILE_OUTPUT=$(grep -o '"output_tokens":[0-9]*' "$jsonl" 2>/dev/null | \
                    awk -F: '{sum += $2} END {print sum+0}')
                total=$((total + FILE_TOKENS + FILE_OUTPUT))
            fi
        fi
    done

    echo "$total"
}

# === Gather usage per business line ===
declare -A USAGE
PROJECTS=(
    "autarkis:/Users/buraksmac/Desktop/code/Lagerlink Hildesheim"
    "cityhub:/Users/buraksmac/Desktop/code2/CityHub"
    "contentos:/Users/buraksmac/Desktop/code2/ContentOS"
    "finance:/Users/buraksmac/Desktop/code2/Finance-agent"
    "orchestrator:/Users/buraksmac/Desktop/code2/orchestrator"
)

TOTAL_USAGE=0
USAGE_JSON="{}"

for ENTRY in "${PROJECTS[@]}"; do
    IFS=':' read -r BIZ_NAME PROJECT_PATH <<< "$ENTRY"
    TOKENS=$(count_project_tokens "$PROJECT_PATH")
    TOTAL_USAGE=$((TOTAL_USAGE + TOKENS))
    USAGE_JSON=$(echo "$USAGE_JSON" | jq --arg k "$BIZ_NAME" --argjson v "$TOKENS" '. + {($k): $v}')
done

# === Update budget file ===
UPDATED=$(jq \
    --arg ts "$TIMESTAMP" \
    --arg today "$TODAY" \
    --argjson usage "$USAGE_JSON" \
    --argjson total "$TOTAL_USAGE" \
    '.usage_today = $usage | .usage_today.total = $total | .usage_today.timestamp = $ts | .usage_today.date = $today' \
    "$BUDGET_FILE")
echo "$UPDATED" > "$BUDGET_FILE"

# === Check thresholds and alert ===
WARNING_PCT=$(jq -r '.alert_thresholds.warning_percent' "$BUDGET_FILE")
CRITICAL_PCT=$(jq -r '.alert_thresholds.critical_percent' "$BUDGET_FILE")
TOTAL_LIMIT=$(jq -r '.daily_limits.total' "$BUDGET_FILE")

if [ "$TOTAL_LIMIT" -gt 0 ]; then
    USAGE_PCT=$(( (TOTAL_USAGE * 100) / TOTAL_LIMIT ))

    if [ "$USAGE_PCT" -ge "$CRITICAL_PCT" ]; then
        if [ -x "$NOTIFY_SCRIPT" ]; then
            "$NOTIFY_SCRIPT" "critical" "Token budget at ${USAGE_PCT}% ($TOTAL_USAGE / $TOTAL_LIMIT). Throttle agents immediately."
        fi
    elif [ "$USAGE_PCT" -ge "$WARNING_PCT" ]; then
        if [ -x "$NOTIFY_SCRIPT" ]; then
            "$NOTIFY_SCRIPT" "warning" "Token budget at ${USAGE_PCT}% ($TOTAL_USAGE / $TOTAL_LIMIT). Consider reducing agent activity."
        fi
    fi
fi

# === Update metrics file ===
if [ -f "$METRICS_FILE" ]; then
    UPDATED_METRICS=$(jq \
        --arg ts "$TIMESTAMP" \
        --argjson total "$TOTAL_USAGE" \
        --argjson usage "$USAGE_JSON" \
        '.last_token_snapshot = $ts | .tokens_today = $total | .tokens_by_project = $usage' \
        "$METRICS_FILE")
    echo "$UPDATED_METRICS" > "$METRICS_FILE"
fi

echo "Token snapshot at $TIMESTAMP: $TOTAL_USAGE total tokens today"
exit 0
```

### 6.3 Rate Limit Protection: Pre-Dispatch Budget Check

Add to `dispatch-task.sh` before dispatching:

```bash
# === Budget gate: check before dispatch ===
check_budget() {
    local biz_line="$1"
    local estimated_tokens="$2"
    local budget_file="$ORCHESTRATOR_ROOT/_bmad/token-budgets.json"

    if [ ! -f "$budget_file" ]; then
        return 0  # No budget file = no limit enforced
    fi

    local used=$(jq -r ".usage_today[\"$biz_line\"] // 0" "$budget_file")
    local limit=$(jq -r ".daily_limits[\"$biz_line\"] // 999999999" "$budget_file")
    local remaining=$((limit - used))

    if [ "$remaining" -lt "$estimated_tokens" ]; then
        echo "BUDGET_EXCEEDED: $biz_line used $used / $limit (need $estimated_tokens, have $remaining)"
        return 1
    fi

    return 0
}

ESTIMATED=$(echo "$ROUTING" | jq -r '.agent_config.estimated_tokens // 50000')
if ! check_budget "$BIZ_LINE" "$ESTIMATED"; then
    # Move task to deferred status
    UPDATED=$(jq --arg id "$NEXT_TASK" '
        .queue |= map(if .id == $id then .status = "budget-deferred" else . end)
    ' "$QUEUE_FILE")
    echo "$UPDATED" > "$QUEUE_FILE"
    echo "Task $NEXT_TASK deferred: budget exceeded for $BIZ_LINE"
    exit 0
fi
```

### 6.4 External Tool Integration

For more accurate tracking than JSONL parsing, integrate `ccusage`:

```bash
# Install ccusage (one-time)
npm install -g ccusage

# Get daily usage in JSON format
ccusage daily --json --since "$(date +%Y-%m-%d)" 2>/dev/null

# Get 5-hour block usage (aligned with Claude billing)
ccusage blocks --json 2>/dev/null

# Integration in token-snapshot.sh:
# Replace the count_project_tokens function with:
CCUSAGE_OUTPUT=$(npx ccusage daily --json --since "$TODAY" 2>/dev/null || echo "{}")
```

---

## 7. Health Monitoring Dashboard

### 7.1 Design Rationale

A JSON-based metrics file serves as the single source of truth. It is updated by every script (check-agents, morning-scan, token-snapshot, cleanup). A simple viewer script renders the dashboard to the terminal. Future: push metrics to Notion database for a GUI view.

### 7.2 Metrics File: `_bmad/metrics.json`

```json
{
  "version": "1.0.0",
  "last_updated": "2026-03-06T00:00:00Z",

  "agents": {
    "total_sessions": 6,
    "agents_healthy": 0,
    "agents_dead": 0,
    "agents_recovered_today": 0,
    "last_health_check": null
  },

  "tasks": {
    "queued": 0,
    "assigned": 0,
    "completed_today": 0,
    "failed_today": 0,
    "completion_rate_7d": 0.0,
    "avg_completion_time_minutes": 0
  },

  "tokens": {
    "tokens_today": 0,
    "tokens_by_project": {},
    "last_token_snapshot": null,
    "budget_utilization_percent": 0
  },

  "ci": {
    "builds_today": 0,
    "pass_rate_today": 0.0,
    "last_failure": null
  },

  "git": {
    "commits_today": 0,
    "prs_opened_today": 0,
    "prs_merged_today": 0,
    "active_worktrees": 0
  },

  "system": {
    "disk_usage_percent": 0,
    "uptime_hours": 0,
    "last_cleanup": null,
    "last_morning_scan": null
  },

  "alerts": {
    "critical_count": 0,
    "warning_count": 0,
    "last_critical": null,
    "last_warning": null
  },

  "history": []
}
```

### 7.3 Dashboard Script: `.bmad/scripts/dashboard.sh`

```bash
#!/bin/bash
# dashboard.sh -- Terminal Health Dashboard
# Renders current metrics to stdout
# Usage: dashboard.sh [--watch]

set -euo pipefail

ORCHESTRATOR_ROOT="/Users/buraksmac/Desktop/code2/orchestrator"
METRICS_FILE="$ORCHESTRATOR_ROOT/_bmad/metrics.json"
STATE_FILE="$ORCHESTRATOR_ROOT/_bmad/orchestrator-tmux-state.json"
BUDGET_FILE="$ORCHESTRATOR_ROOT/_bmad/token-budgets.json"
QUEUE_FILE="$ORCHESTRATOR_ROOT/_bmad/task-queue.json"

render() {
    clear

    echo "================================================================="
    echo "  L-Thread Orchestrator Dashboard"
    echo "  $(date +'%Y-%m-%d %H:%M:%S')"
    echo "================================================================="
    echo ""

    # === Agent Status ===
    echo "  AGENTS"
    echo "  -------"
    if [ -f "$STATE_FILE" ]; then
        for SESSION in $(jq -r '.sessions | keys[]' "$STATE_FILE"); do
            PROJECT=$(jq -r ".sessions[\"$SESSION\"].project" "$STATE_FILE")
            CLAUDE=$(jq -r ".sessions[\"$SESSION\"].claude_running" "$STATE_FILE")
            LAST_SEEN=$(jq -r ".sessions[\"$SESSION\"].last_seen_alive // \"never\"" "$STATE_FILE")
            RESPAWNS=$(jq -r ".sessions[\"$SESSION\"].respawn_count // 0" "$STATE_FILE")

            # Check live status
            if tmux has-session -t "$SESSION" 2>/dev/null; then
                LIVE="ALIVE"
                CMD=$(tmux list-panes -t "$SESSION" -F '#{pane_current_command}' 2>/dev/null | head -1)
                if [ "$CMD" = "claude" ]; then
                    STATUS="[RUNNING]"
                else
                    STATUS="[IDLE   ]"
                fi
            else
                LIVE="DEAD"
                STATUS="[DOWN   ]"
            fi

            printf "  %s %-12s %-20s respawns:%s  last:%s\n" "$STATUS" "$SESSION" "$PROJECT" "$RESPAWNS" "$LAST_SEEN"
        done
    fi

    echo ""

    # === Task Queue ===
    echo "  TASKS"
    echo "  ------"
    if [ -f "$QUEUE_FILE" ]; then
        QUEUED=$(jq '[.queue[] | select(.status == "queued")] | length' "$QUEUE_FILE")
        ASSIGNED=$(jq '[.queue[] | select(.status == "assigned")] | length' "$QUEUE_FILE")
        COMPLETED=$(jq '.completed | length' "$QUEUE_FILE")
        FAILED=$(jq '.failed | length' "$QUEUE_FILE")
        printf "  Queued: %-5s  Assigned: %-5s  Completed: %-5s  Failed: %-5s\n" "$QUEUED" "$ASSIGNED" "$COMPLETED" "$FAILED"

        # Show next 3 queued tasks
        NEXT_TASKS=$(jq -r '.queue[] | select(.status == "queued") | "  > [\(.priority)] \(.business_line)/\(.type): \(.title)"' "$QUEUE_FILE" | head -3)
        if [ -n "$NEXT_TASKS" ]; then
            echo "$NEXT_TASKS"
        fi
    fi

    echo ""

    # === Token Budget ===
    echo "  TOKENS"
    echo "  -------"
    if [ -f "$BUDGET_FILE" ]; then
        TOTAL_USED=$(jq -r '.usage_today.total // 0' "$BUDGET_FILE")
        TOTAL_LIMIT=$(jq -r '.daily_limits.total // 0' "$BUDGET_FILE")
        if [ "$TOTAL_LIMIT" -gt 0 ]; then
            PCT=$(( (TOTAL_USED * 100) / TOTAL_LIMIT ))
            # Visual bar
            BAR_WIDTH=30
            FILLED=$(( (PCT * BAR_WIDTH) / 100 ))
            EMPTY=$((BAR_WIDTH - FILLED))
            BAR=$(printf '%*s' "$FILLED" '' | tr ' ' '#')$(printf '%*s' "$EMPTY" '' | tr ' ' '-')
            printf "  Total: [%s] %d%% (%d / %d)\n" "$BAR" "$PCT" "$TOTAL_USED" "$TOTAL_LIMIT"
        fi

        # Per-project
        for BIZ in autarkis cityhub contentos finance orchestrator; do
            USED=$(jq -r ".usage_today[\"$BIZ\"] // 0" "$BUDGET_FILE")
            LIMIT=$(jq -r ".daily_limits[\"$BIZ\"] // 0" "$BUDGET_FILE")
            if [ "$LIMIT" -gt 0 ] && [ "$USED" -gt 0 ]; then
                BIZ_PCT=$(( (USED * 100) / LIMIT ))
                printf "    %-14s %6d / %6d (%d%%)\n" "$BIZ" "$USED" "$LIMIT" "$BIZ_PCT"
            fi
        done
    fi

    echo ""

    # === System ===
    echo "  SYSTEM"
    echo "  -------"
    DISK=$(df -h "$HOME" | tail -1 | awk '{print $5}')
    TMUX_SESSIONS=$(tmux list-sessions 2>/dev/null | wc -l | tr -d ' ')
    printf "  Disk: %s  Tmux sessions: %s\n" "$DISK" "$TMUX_SESSIONS"

    if [ -f "$METRICS_FILE" ]; then
        LAST_HEALTH=$(jq -r '.agents.last_health_check // "never"' "$METRICS_FILE" 2>/dev/null || echo "never")
        LAST_SCAN=$(jq -r '.system.last_morning_scan // "never"' "$METRICS_FILE" 2>/dev/null || echo "never")
        printf "  Last health check: %s\n" "$LAST_HEALTH"
        printf "  Last morning scan: %s\n" "$LAST_SCAN"
    fi

    echo ""
    echo "  Notifications log (last 5):"
    tail -5 "$ORCHESTRATOR_ROOT/_bmad/logs/notifications.log" 2>/dev/null | while read -r line; do
        echo "    $line"
    done

    echo ""
    echo "================================================================="
    echo "  Refresh: $(date +'%H:%M:%S') | Press Ctrl+C to exit"
    echo "================================================================="
}

if [ "${1:-}" = "--watch" ]; then
    while true; do
        render
        sleep 10
    done
else
    render
fi
```

### 7.4 Alert Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Agent dead | 1 agent | 2+ agents | Auto-respawn (check-agents.sh) |
| Token budget | 80% daily | 95% daily | Warning notification / Throttle dispatch |
| CI failures | 2 consecutive | 3 consecutive | Pause task, notify |
| Disk usage | 85% | 95% | Cleanup, notify |
| Stale agent | 60 min idle | 120 min idle | Notify / kill session |
| Respawn count | 2 | 3 (max) | Escalate to human |
| Queue depth | 10 tasks | 20 tasks | Notify (capacity concern) |

---

## 8. File Format Specifications

### 8.1 State Files Summary

| File | Purpose | Updated By |
|------|---------|-----------|
| `_bmad/orchestrator-tmux-state.json` | Tmux session tracking | check-agents.sh, session-start hook, handoff hook |
| `_bmad/orchestrator-state.json` | Conduit mode orchestrator state | Orchestrator agent |
| `_bmad/task-queue.json` | Task queue for dispatch | morning-scan.sh, dispatch-task.sh, check-agents.sh |
| `_bmad/task-router.json` | Routing rules (config, rarely changes) | Human/orchestrator |
| `_bmad/token-budgets.json` | Token usage tracking | token-snapshot.sh |
| `_bmad/metrics.json` | Aggregated health metrics | All scripts |
| `_bmad/logs/notifications.log` | Notification audit trail | notify.sh |
| `_bmad/logs/*.log` | Per-script execution logs | Each script |

### 8.2 Enhanced Tmux State Schema

The existing `orchestrator-tmux-state.json` should be extended with these fields per session:

```json
{
  "sessions": {
    "autarkis1": {
      "tmux_session": "autarkis1",
      "working_directory": "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim",
      "project": "Lagerlink Hildesheim",
      "business_line": "autarkis",
      "claude_running": false,
      "claude_flags": "--dangerously-skip-permissions",
      "last_seen_alive": "2026-03-06T10:00:00Z",
      "purpose": "Primary dev session for Autarkis/Lagerlink",
      "current_task": null,
      "respawn_count": 0,
      "circuit_breaker": {
        "state": "CLOSED",
        "consecutive_failures": 0,
        "last_failure": null,
        "cooldown_until": null
      },
      "tokens_session": 0
    }
  }
}
```

### 8.3 Directory Structure

```
orchestrator/
  .bmad/
    scripts/
      check-agents.sh        # Health check & auto-recovery
      route-task.sh           # Deterministic task router
      dispatch-task.sh        # Task queue dispatcher
      morning-scan.sh         # Daily morning intelligence scan
      daily-cleanup.sh        # Nightly maintenance
      weekly-maintenance.sh   # Weekly compaction & rollup
      token-snapshot.sh       # Token usage tracking
      notify.sh               # Unified notification dispatcher
      worktree.sh             # Git worktree management
      dashboard.sh            # Terminal health dashboard
      tmux-helpers.sh         # (existing) Tmux helper functions
      orchestrator-session-start.sh  # (existing) SessionStart hook
      orchestrator-handoff.sh        # (existing) PreCompact hook
    secrets/
      telegram.env            # Telegram bot credentials (gitignored)
    AUTO_MODE                 # (existing) ENABLED/DISABLED flag
  _bmad/
    orchestrator-tmux-state.json     # (existing, extended)
    orchestrator-state.json          # (existing)
    task-queue.json                  # Task queue
    task-router.json                 # Routing configuration
    token-budgets.json               # Token budget tracking
    metrics.json                     # Aggregated health metrics
    logs/                            # All script logs
      check-agents_*.log
      morning-scan_*.log
      daily-cleanup_*.log
      notifications.log
      launchd-*.log
    archives/                        # Archived completed tasks
      tasks-*.json
  scheduler/
    manage.sh                        # LaunchAgent manager
    com.burak.orchestrator-health.plist
    com.burak.orchestrator-morning.plist
    com.burak.orchestrator-cleanup.plist
    com.burak.orchestrator-weekly.plist
```

---

## 9. Implementation Sequence

### Phase 1: Foundation (Day 1)

1. Create `_bmad/metrics.json` (empty template)
2. Create `_bmad/task-queue.json` (empty queue)
3. Create `_bmad/token-budgets.json` (with daily limits)
4. Create `.bmad/scripts/notify.sh` (macOS notifications only, skip Telegram for now)
5. Create `.bmad/scripts/check-agents.sh` (basic version without circuit breaker)
6. Test: run `check-agents.sh` manually, verify it probes all sessions correctly

### Phase 2: Scheduling (Day 1-2)

7. Create LaunchAgent plist for health check (every 10 min)
8. Create `.bmad/scripts/daily-cleanup.sh`
9. Create LaunchAgent plist for cleanup (daily 23:00)
10. Create `scheduler/manage.sh`
11. Run `scheduler/manage.sh install`
12. Verify: check `launchctl list | grep orchestrator`

### Phase 3: Task Routing (Day 2-3)

13. Create `_bmad/task-router.json` (full routing config)
14. Create `.bmad/scripts/route-task.sh`
15. Create `.bmad/scripts/dispatch-task.sh`
16. Test: `route-task.sh bug-fix autarkis 0.7` should return single-agent config
17. Test: `route-task.sh feature-large cityhub 0.2` should return human-required

### Phase 4: Worktrees & Tokens (Day 3-4)

18. Create `.bmad/scripts/worktree.sh`
19. Test: create and cleanup a test worktree
20. Create `.bmad/scripts/token-snapshot.sh`
21. Add budget check to dispatch-task.sh
22. Add token LaunchAgent plist

### Phase 5: Morning Scan & Dashboard (Day 4-5)

23. Create `.bmad/scripts/morning-scan.sh`
24. Create LaunchAgent for morning scan (daily 07:30)
25. Create `.bmad/scripts/dashboard.sh`
26. Test: `dashboard.sh --watch` shows live view

### Phase 6: Notifications & Polish (Day 5)

27. Set up Telegram bot (optional)
28. Update `notify.sh` with Telegram support
29. Add circuit breaker to check-agents.sh
30. Extend tmux state schema with new fields
31. Create weekly maintenance script
32. Full integration test: queue a task, dispatch it, monitor health, receive notification on completion

---

## Sources

### Shell Script Agent Harness
- [AgentFS: Just Bash - Turso](https://turso.tech/blog/agentfs-just-bash)
- [BASH Is All You Need - The New Stack](https://thenewstack.io/the-key-to-agentic-success-let-unix-bash-lead-the-way/)
- [AI Agents: Skills, Hooks, & Tool Standards - Towards AI](https://pub.towardsai.net/ai-agents-skills-hooks-tool-standards-acdda0510a68)
- [Harness Engineering - OpenAI](https://openai.com/index/harness-engineering/)

### State Machine & Task Routing
- [Deterministic Core, Agentic Shell - Dave Mo](https://blog.davemo.com/posts/2026-02-14-deterministic-core-agentic-shell.html)
- [StateFlow: Enhancing LLM Task-Solving - arXiv](https://arxiv.org/html/2403.11322v1)
- [MetaAgent: FSM-Based Multi-Agent Systems - arXiv](https://arxiv.org/html/2507.22606)
- [LangGraph State Machines - DEV Community](https://dev.to/jamesli/langgraph-state-machines-managing-complex-agent-task-flows-in-production-36f4)

### LaunchAgent Scheduling
- [Scheduling Recurring Tasks on macOS Using Launchd - Serghei's Blog](https://blog.serghei.pl/posts/scheduling-recurring-tasks-on-macos-using-launchd/)
- [A launchd Tutorial - launchd.info](https://www.launchd.info/)
- [Schedule Jobs Using Launchd - Nathan Grigg](https://nathangrigg.com/2012/07/schedule-jobs-using-launchd/)

### Git Worktree Management
- [coderabbitai/git-worktree-runner - GitHub](https://github.com/coderabbitai/git-worktree-runner)
- [How Git Worktrees Changed My AI Agent Workflow - Nx Blog](https://nx.dev/blog/git-worktrees-ai-agents)
- [nielsgroen/claude-tmux - GitHub](https://github.com/nielsgroen/claude-tmux)
- [workmux: git worktrees + tmux - Raine Virta](https://raine.dev/blog/introduction-to-workmux/)

### Notification Integration
- [Helias/Notify-me (Telegram) - GitHub](https://github.com/Helias/Notify-me)
- [Bash + Telegram: Server Monitoring - DEV Community](https://dev.to/_2974322d72d5f53d8c2c/bash-telegram-server-monitoring-and-instant-notifications-1ibn)
- [russellgrapes/telegram-bash-notification - GitHub](https://github.com/russellgrapes/telegram-bash-notification)

### Token Budget Management
- [Manage Costs Effectively - Claude Code Docs](https://code.claude.com/docs/en/costs)
- [ryoppippi/ccusage - GitHub](https://github.com/ryoppippi/ccusage)
- [Maciek-roboblog/Claude-Code-Usage-Monitor - GitHub](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor)
- [hamed-elfayome/Claude-Usage-Tracker - GitHub](https://github.com/hamed-elfayome/Claude-Usage-Tracker)
- [Track Cost and Usage - Claude Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/cost-tracking)

### Multi-Agent Orchestration
- [Dicklesworthstone/claude_code_agent_farm - GitHub](https://github.com/Dicklesworthstone/claude_code_agent_farm)
- [Deterministic AI Orchestration - Praetorian](https://www.praetorian.com/blog/deterministic-ai-orchestration-a-platform-architecture-for-autonomous-development/)
- [Towards a Science of Scaling Agent Systems - DeepMind](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)
- [hallucinogen/agent-viewer (Kanban for tmux agents) - GitHub](https://github.com/hallucinogen/agent-viewer)

### Deterministic Architecture Theory
- [Deterministic Core, Agentic Shell - Dave Mo](https://blog.davemo.com/posts/2026-02-14-deterministic-core-agentic-shell.html)
- [Why Agentic AI Requires Determinism-First Architecture - Volt Active Data](https://www.voltactivedata.com/blog/2026/02/agentic-ai-determinism-first-architecture)
- [Agentic Design Patterns 2026 - SitePoint](https://www.sitepoint.com/the-definitive-guide-to-agentic-design-patterns-in-2026/)

---

*Research based on 7 web search sessions, analysis of 6 existing codebase files, and synthesis of Phase 1 deterministic-LLM boundary analysis. All scripts designed for macOS (Darwin) with zsh/bash, tmux, jq, and gh CLI as dependencies. March 6, 2026.*
