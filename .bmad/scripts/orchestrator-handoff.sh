#!/bin/bash
# Orchestrator Pre-Compact Handoff Script
# Called by PreCompact hook to spawn a fresh Claude session before compaction
#
# This script:
# 1. Gets the current orchestrator pane ID
# 2. Saves it to state file for the new session to close
# 3. Spawns a new terminal with Claude
# 4. Starts /orchestrator in the new session
#
# The old session will compact, but the new one takes over with fresh context.

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_FILE="$PROJECT_DIR/.bmad/orchestrator-state.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get the current terminal panes
PANES=$(conduit pane-list -t terminal 2>/dev/null || echo "[]")

# Find the orchestrator pane (the one running Claude Code)
# We look for panes with "Claude" in the title
OLD_PANE_ID=$(echo "$PANES" | jq -r '.[] | select(.title | contains("Claude")) | .id' | head -1)

if [ -z "$OLD_PANE_ID" ] || [ "$OLD_PANE_ID" = "null" ]; then
    echo "Warning: Could not identify orchestrator pane"
    OLD_PANE_ID=""
fi

# Read current state
CURRENT_STATE=$(cat "$STATE_FILE" 2>/dev/null || echo '{}')

# Update state with handoff info
UPDATED_STATE=$(echo "$CURRENT_STATE" | jq --arg pane "$OLD_PANE_ID" --arg ts "$TIMESTAMP" '
  .handoff = {
    "old_pane_id": $pane,
    "handoff_started": $ts,
    "reason": "pre_compact"
  } |
  .last_updated = $ts
')

echo "$UPDATED_STATE" > "$STATE_FILE"

# Spawn new terminal
NEW_PANE_ID=$(conduit pane-split right -t terminal | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$NEW_PANE_ID" ]; then
    echo "Error: Failed to spawn new terminal pane"
    exit 1
fi

# Wait for pane to be ready
sleep 1

# Start Claude with dangerous skip permissions in the new pane
conduit terminal-write -p "$NEW_PANE_ID" -e "cd $PROJECT_DIR && claude --dangerously-skip-permissions"

# Wait for Claude to start
conduit terminal-wait -p "$NEW_PANE_ID" -t 15

# Invoke orchestrator
conduit terminal-write -p "$NEW_PANE_ID" -e "/orchestrator"

# Brief wait then tell it to start
sleep 2
conduit terminal-write -p "$NEW_PANE_ID" -e "start"

echo "Handoff complete. New orchestrator pane: $NEW_PANE_ID"
echo "Old pane ($OLD_PANE_ID) will be closed by new orchestrator."

# Exit with 0 so compaction proceeds (we can't stop it anyway)
exit 0
