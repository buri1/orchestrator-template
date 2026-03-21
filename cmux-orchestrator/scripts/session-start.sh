#!/bin/bash
#
# SessionStart Hook — injects orchestrator context at session start.
#
# This runs when a Claude Code session starts (or resumes after crash).
# It outputs state information that gets injected into the conversation.

STATE_FILE="${TARGET_DIR:-$(pwd)}/_bmad/orchestrator-state.json"

echo "=== L-Thread Orchestrator v4 (cmux Mode) ==="
echo ""

# Check cmux
if cmux ping &>/dev/null; then
    echo "cmux: CONNECTED"
    echo "workspace: ${CMUX_WORKSPACE_ID:-unknown}"
    echo "surface: ${CMUX_SURFACE_ID:-unknown}"
else
    echo "cmux: NOT DETECTED — orchestrator features limited"
fi

# Check state
if [ -f "$STATE_FILE" ]; then
    echo ""
    echo "=== Persisted State ==="
    cat "$STATE_FILE"
    echo ""
    echo "=== Resume from persisted phase ==="
else
    echo ""
    echo "No persisted state found. Starting fresh."
fi

# Check AUTO_MODE
AUTO_MODE=$(cat "${TARGET_DIR:-$(pwd)}/.bmad/AUTO_MODE" 2>/dev/null)
if [ "$AUTO_MODE" = "ENABLED" ]; then
    echo ""
    echo "AUTO_MODE: ENABLED — do not wait for user input"
fi

# Check for orphan latch files (workers that finished during a crash)
LATCH_DIR="/tmp/orchy-latches"
if [ -d "$LATCH_DIR" ] && [ "$(ls -A $LATCH_DIR 2>/dev/null)" ]; then
    echo ""
    echo "=== Orphan Latch Files (workers finished during downtime) ==="
    for latch in "$LATCH_DIR"/*.latch; do
        echo "  $(basename "$latch"): $(cat "$latch")"
    done
fi

echo ""
echo "Load your persona from .claude/agents/orchestrator.md and begin."
