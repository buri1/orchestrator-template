#!/bin/bash
# ============================================================================
# L-Thread Pi Supervisor — Launch Script
# ============================================================================
# Creates a single tmux session with deterministic pane layout:
#
#   +──────────────────────────+──────────────────────────+
#   │ Pi Supervisor            │ Worker N (newest, top)   │
#   │ (top-left, this pane)    ├──────────────────────────┤
#   ├──────────────────────────┤ Worker 2                 │
#   │ Opus Orchestrator        ├──────────────────────────┤
#   │ (bottom-left)            │ Worker 1 (first, bottom) │
#   +──────────────────────────+──────────────────────────+
#
# Pi runs in the top-left pane. The supervisor extension manages the
# orchestrator pane (bottom-left) and spawns workers (right side).
#
# Usage:
#   ./run.sh                                  # Start supervisor (default)
#   ./run.sh --model gemini-3-flash           # Override model
#   ./run.sh --provider antigravity           # Override provider
#   ./run.sh --auto                           # Auto-mode (no user prompts)
#   ./run.sh --session myname                 # Custom session name
#   ./run.sh --orch-dir /path/to/dir          # Orchestrator working directory
#
# Prerequisites:
#   - Pi Agent: npm install -g @mariozechner/pi-coding-agent
#   - tmux: brew install tmux
#   - Claude Code: npm install -g @anthropic-ai/claude-code
# ============================================================================

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# ── Parse args ──────────────────────────────────────────
MODEL="opus"
PROVIDER=""
AUTO_MODE="DISABLED"
SESSION="lthread"
ORCH_DIR="$(dirname "$DIR")"  # Default: parent dir (orchestrator repo root)

while [[ $# -gt 0 ]]; do
    case $1 in
        --auto)
            AUTO_MODE="ENABLED"
            shift
            ;;
        --model)
            MODEL="$2"
            shift 2
            ;;
        --provider)
            PROVIDER="$2"
            shift 2
            ;;
        --session)
            SESSION="$2"
            shift 2
            ;;
        --orch-dir)
            ORCH_DIR="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./run.sh [--model <model>] [--provider <name>] [--auto] [--session <name>] [--orch-dir <path>]"
            exit 1
            ;;
    esac
done

# ── Build Pi command ──────────────────────────────────
PI_CMD="pi"
[[ -n "$PROVIDER" ]] && PI_CMD="$PI_CMD --provider $PROVIDER"
PI_CMD="$PI_CMD --model $MODEL -e extensions/telemetry.ts -e extensions/supervisor.ts"

# ── Pre-flight checks ──────────────────────────────────
if ! command -v pi &>/dev/null; then
    echo "ERROR: Pi Agent not installed. Run: npm install -g @mariozechner/pi-coding-agent"
    exit 1
fi

if ! command -v tmux &>/dev/null; then
    echo "ERROR: tmux not installed. Run: brew install tmux"
    exit 1
fi

# Check Pi version
PI_VERSION=$(pi --version 2>/dev/null || echo "unknown")
echo "Pi Agent version: $PI_VERSION"

# Check model availability (INC-004 guard)
if ! pi --list-models "$MODEL" 2>&1 | grep -q "$MODEL"; then
    echo "ERROR: Model '$MODEL' not found in Pi Agent."
    echo "Available models:"
    pi --list-models 2>&1 | head -20
    exit 1
fi

# ── Setup state dirs ───────────────────────────────────
mkdir -p "$DIR/_bmad" "$DIR/.bmad"
echo "$AUTO_MODE" > "$DIR/.bmad/AUTO_MODE"

# ── Check for existing active session (INC-008 guard) ──
REGISTRY_FILE="$DIR/_bmad/session-registry.json"
if [[ -f "$REGISTRY_FILE" ]]; then
    EXISTING_STATUS=$(python3 -c "
import json, sys
try:
    r = json.load(open('$REGISTRY_FILE'))
    s = r.get('session')
    if s and s.get('status') in ('active', 'paused'):
        print(f\"{s['status']}:{s['id']}:{s.get('task','')[:60]}\")
    else:
        print('none')
except:
    print('none')
" 2>/dev/null || echo "none")

    if [[ "$EXISTING_STATUS" != "none" ]]; then
        IFS=: read -r STATUS SID TASK <<< "$EXISTING_STATUS"
        echo ""
        echo "WARNING: Active session found!"
        echo "  Session: $SID"
        echo "  Status:  $STATUS"
        echo "  Task:    $TASK"
        echo ""

        # Check if tmux session actually exists
        if tmux has-session -t "$SESSION" 2>/dev/null; then
            echo "  tmux session '$SESSION' is alive."
            echo ""
            read -p "  Kill existing and start fresh? [y/N] " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Aborted. Use 'tmux attach -t $SESSION' to reconnect."
                exit 0
            fi
        else
            echo "  tmux session '$SESSION' is dead (stale registry). Cleaning up."
        fi
    fi
fi

# ── Kill existing session ──────────────────────────────
if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "Killing existing session '$SESSION'..."
    tmux kill-session -t "$SESSION"
fi

# ── Generate session ID ───────────────────────────────
SESSION_ID="${SESSION}-$(date +%s)"

# ── Create tmux session with 3-pane layout ─────────────
echo "Creating tmux session '$SESSION' with 3-pane layout..."

# Pane 0: top-left (Pi supervisor)
tmux new-session -d -s "$SESSION" -c "$DIR"
SUPERVISOR_PANE=$(tmux display-message -t "$SESSION" -p '#{pane_id}')

# Split right: workers area (50% width)
WORKERS_PANE=$(tmux split-window -h -t "$SUPERVISOR_PANE" -c "$DIR" -l 50% -P -F '#{pane_id}')

# Split supervisor pane down: orchestrator (50% of left half)
ORCHESTRATOR_PANE=$(tmux split-window -v -t "$SUPERVISOR_PANE" -c "$ORCH_DIR" -l 50% -P -F '#{pane_id}')

# ── Label panes ────────────────────────────────────────
tmux select-pane -t "$SUPERVISOR_PANE" -T "Pi Supervisor"
tmux select-pane -t "$WORKERS_PANE" -T "Workers"
tmux select-pane -t "$ORCHESTRATOR_PANE" -T "Orchestrator"

# Show pane titles in borders
tmux set-option -t "$SESSION" pane-border-status top
tmux set-option -t "$SESSION" pane-border-format " #{pane_title} "
tmux set-option -t "$SESSION" pane-border-lines heavy

# ── Write pane layout for supervisor extension ─────────
cat > "$DIR/_bmad/pane-layout.json" << EOF
{
  "session": "$SESSION",
  "supervisorPaneId": "$SUPERVISOR_PANE",
  "orchestratorPaneId": "$ORCHESTRATOR_PANE",
  "workersPaneId": "$WORKERS_PANE",
  "orchestratorDir": "$ORCH_DIR",
  "workerPanes": []
}
EOF

# ── Write initial session registry ────────────────────
SUPERVISOR_PID=$(tmux display-message -t "$SUPERVISOR_PANE" -p '#{pane_pid}')
ORCHESTRATOR_PID=$(tmux display-message -t "$ORCHESTRATOR_PANE" -p '#{pane_pid}')
WORKERS_PID=$(tmux display-message -t "$WORKERS_PANE" -p '#{pane_pid}')

cat > "$REGISTRY_FILE" << EOF
{
  "version": 1,
  "session": {
    "id": "$SESSION_ID",
    "tmux_session": "$SESSION",
    "launched_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "active",
    "task": null,
    "panes": {
      "supervisor": { "pane_id": "$SUPERVISOR_PANE", "pid": $SUPERVISOR_PID },
      "orchestrator": { "pane_id": "$ORCHESTRATOR_PANE", "pid": $ORCHESTRATOR_PID },
      "workers_base": { "pane_id": "$WORKERS_PANE", "pid": $WORKERS_PID }
    },
    "agents": [
      {
        "role": "supervisor",
        "pane_id": "$SUPERVISOR_PANE",
        "model": "$MODEL",
        "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "stopped_at": null,
        "status": "running"
      }
    ]
  },
  "history": []
}
EOF

# ── Write initial activity log entry ──────────────────
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"epoch\":$(date +%s)000,\"session\":\"$SESSION\",\"session_id\":\"$SESSION_ID\",\"event\":\"session_created\",\"phase\":\"stopped\",\"task\":null,\"model\":\"$MODEL\",\"provider\":\"${PROVIDER:-auto}\",\"panes\":{\"supervisor\":\"$SUPERVISOR_PANE\",\"orchestrator\":\"$ORCHESTRATOR_PANE\",\"workers\":\"$WORKERS_PANE\"}}" >> "$DIR/_bmad/agent-activity.jsonl"

# ── Display welcome in workers pane ────────────────────
tmux send-keys -t "$WORKERS_PANE" "echo '── Workers will appear here ──'" Enter

# ── Display welcome in orchestrator pane ───────────────
tmux send-keys -t "$ORCHESTRATOR_PANE" "echo '── Orchestrator will start here ──'" Enter

# ── Start Pi in supervisor pane ────────────────────────
tmux send-keys -t "$SUPERVISOR_PANE" "$PI_CMD" Enter

# ── Focus supervisor pane ──────────────────────────────
tmux select-pane -t "$SUPERVISOR_PANE"

# ── Print info and attach ──────────────────────────────
echo ""
echo "================================================"
echo "  L-THREAD SUPERVISOR"
echo "================================================"
echo ""
echo "  Session:     $SESSION ($SESSION_ID)"
echo "  Model:       $MODEL"
echo "  Provider:    ${PROVIDER:-auto}"
echo "  Auto-Mode:   $AUTO_MODE"
echo "  Orch Dir:    $ORCH_DIR"
echo "  Pi Version:  $PI_VERSION"
echo ""
echo "  Pane IDs:"
echo "    Supervisor:   $SUPERVISOR_PANE"
echo "    Orchestrator: $ORCHESTRATOR_PANE"
echo "    Workers:      $WORKERS_PANE"
echo ""
echo "  +──────────────────────+──────────────────────+"
echo "  │ Pi Supervisor        │ Workers              │"
echo "  │ $SUPERVISOR_PANE              │ $WORKERS_PANE              │"
echo "  ├──────────────────────┤                      │"
echo "  │ Orchestrator         │                      │"
echo "  │ $ORCHESTRATOR_PANE              │                      │"
echo "  +──────────────────────+──────────────────────+"
echo ""
echo "  Registry:    $REGISTRY_FILE"
echo "  Activity:    $DIR/_bmad/agent-activity.jsonl"
echo ""
echo "  Attaching to session..."
echo ""

exec tmux attach -t "$SESSION"
