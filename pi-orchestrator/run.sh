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
#   ./run.sh                          # Start supervisor (default)
#   ./run.sh --model sonnet           # Override model
#   ./run.sh --auto                   # Auto-mode (no user prompts)
#   ./run.sh --session myname         # Custom session name
#   ./run.sh --orch-dir /path/to/dir  # Orchestrator working directory
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
            echo "Usage: ./run.sh [--model <model>] [--auto] [--session <name>] [--orch-dir <path>]"
            exit 1
            ;;
    esac
done

# ── Pre-flight checks ──────────────────────────────────
if ! command -v pi &>/dev/null; then
    echo "ERROR: Pi Agent not installed. Run: npm install -g @mariozechner/pi-coding-agent"
    exit 1
fi

if ! command -v tmux &>/dev/null; then
    echo "ERROR: tmux not installed. Run: brew install tmux"
    exit 1
fi

# ── Setup state dirs ───────────────────────────────────
mkdir -p "$DIR/_bmad" "$DIR/.bmad"
echo "$AUTO_MODE" > "$DIR/.bmad/AUTO_MODE"

# ── Kill existing session ──────────────────────────────
if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "Killing existing session '$SESSION'..."
    tmux kill-session -t "$SESSION"
fi

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

# ── Display welcome in workers pane ────────────────────
tmux send-keys -t "$WORKERS_PANE" "echo '── Workers will appear here ──'" Enter

# ── Display welcome in orchestrator pane ───────────────
tmux send-keys -t "$ORCHESTRATOR_PANE" "echo '── Orchestrator will start here ──'" Enter

# ── Start Pi in supervisor pane ────────────────────────
tmux send-keys -t "$SUPERVISOR_PANE" "pi --model $MODEL -e extensions/telemetry.ts -e extensions/supervisor.ts" Enter

# ── Focus supervisor pane ──────────────────────────────
tmux select-pane -t "$SUPERVISOR_PANE"

# ── Print info and attach ──────────────────────────────
echo ""
echo "================================================"
echo "  L-THREAD SUPERVISOR"
echo "================================================"
echo ""
echo "  Session:     $SESSION"
echo "  Model:       $MODEL"
echo "  Auto-Mode:   $AUTO_MODE"
echo "  Orch Dir:    $ORCH_DIR"
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
echo "  Attaching to session..."
echo ""

exec tmux attach -t "$SESSION"
