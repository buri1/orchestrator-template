#!/bin/bash
set -euo pipefail

# ── Configuration ──────────────────────────────
SESSION="orchestrator"
ORCH_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${1:-}"

if [ -z "$TARGET_DIR" ]; then
    echo "Usage: ./run-tmux.sh <target-project-dir>"
    echo "  Example: ./run-tmux.sh /Users/buraksmac/Desktop/code2/omniport-hh"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "ERROR: Target directory does not exist: $TARGET_DIR"
    exit 1
fi

# ── Session Setup ──────────────────────────────

# Check if session already exists
if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "Session '$SESSION' already exists. Attaching..."
    tmux attach -t "$SESSION"
    exit 0
fi

# Create new session
echo "Creating tmux session: $SESSION"
tmux new-session -d -s "$SESSION" -n orchestrator -c "$ORCH_DIR"

# Set environment variables in the session
tmux set-environment -t "$SESSION" ORCHESTRATOR_DIR "$ORCH_DIR"
tmux set-environment -t "$SESSION" TARGET_DIR "$TARGET_DIR"
tmux set-environment -t "$SESSION" TARGET_REPO "$(cd "$TARGET_DIR" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo 'unknown')"

# Banner
tmux send-keys -t "$SESSION:orchestrator" "clear && echo '
╔══════════════════════════════════════════════════════════╗
║  L-Thread Orchestrator v3 — tmux Mode                    ║
║  Target: $TARGET_DIR                                     ║
║  Session: $SESSION                                       ║
║                                                          ║
║  Commands:                                               ║
║    /orchestrator  — Start the orchestrator loop          ║
║    /debug         — Debug current state                  ║
║    /tmux-nav      — tmux navigation reference            ║
║                                                          ║
║  Windows: orchestrator | worker-1..N | devserver         ║
╚══════════════════════════════════════════════════════════╝
'" Enter

# Start Claude Code with orchestrator agent
tmux send-keys -t "$SESSION:orchestrator" "cd $ORCH_DIR && unset CLAUDECODE && claude --dangerously-skip-permissions" Enter

# Attach
echo "Attaching to session..."
sleep 1
tmux attach -t "$SESSION"
