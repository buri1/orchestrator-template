#!/bin/bash
#
# Claude Code Stop Hook — signals cmux wait-for when an agent finishes.
#
# This hook is triggered by Claude Code's "Stop" lifecycle event.
# It reads the ORCHY_SIGNAL environment variable and signals it,
# allowing the orchestrator to unblock from `cmux wait-for`.
#
# The orchestrator sets ORCHY_SIGNAL when spawning each worker:
#   ORCHY_SIGNAL=agent-worker-1.3-done claude --dangerously-skip-permissions
#
# When the worker's Claude session ends (Stop event), this hook fires:
#   cmux wait-for -S "agent-worker-1.3-done"
#
# The orchestrator, which is blocking on:
#   cmux wait-for "agent-worker-1.3-done" --timeout 1800
# ...immediately unblocks and continues.

SIGNAL="${ORCHY_SIGNAL:-}"

if [ -z "$SIGNAL" ]; then
    # Not an orchestrated worker — no signal to send
    exit 0
fi

# Signal the orchestrator that this worker is done
cmux wait-for -S "$SIGNAL" 2>/dev/null

# Also update sidebar status
WORKER_NAME=$(echo "$SIGNAL" | sed 's/^agent-//; s/-done$//')
cmux set-status "$WORKER_NAME" "done" --icon checkmark --color "#34c759" 2>/dev/null

# Desktop notification
cmux notify --title "Agent Complete" --body "$WORKER_NAME finished" 2>/dev/null

# Write latch file as fallback (for crash recovery)
LATCH_DIR="/tmp/orchy-latches"
mkdir -p "$LATCH_DIR"
echo "{\"signal\":\"$SIGNAL\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "${LATCH_DIR}/${SIGNAL}.latch"

exit 0
