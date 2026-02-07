#!/bin/bash
# Orchestrator PreCompact Hook v3 (Mode-Agnostic)
# Called BEFORE context compaction.
#
# Behavior: Persist state so SessionStart hook can restore it.
# Works with both Conduit and Teams state files.
#
# The SessionStart hook will:
# 1. Read the saved state
# 2. Inject the absolute rules + state via additionalContext
# 3. The agent continues with full context -- no new agent needed

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# === Find and update ALL state files ===
CONDUIT_STATE="$PROJECT_DIR/_bmad/orchestrator-state.json"
TEAMS_STATE="$PROJECT_DIR/_bmad/orchestrator-teams-state.json"

update_state_file() {
    local STATE_FILE="$1"

    if [ ! -f "$STATE_FILE" ]; then
        return
    fi

    CURRENT_STATE=$(cat "$STATE_FILE")

    # Update timestamp and add compaction marker
    UPDATED_STATE=$(echo "$CURRENT_STATE" | jq --arg ts "$TIMESTAMP" '
      .last_compaction = $ts |
      .last_updated = $ts |
      .compaction_count = ((.compaction_count // 0) + 1)
    ')

    echo "$UPDATED_STATE" > "$STATE_FILE"

    echo "PreCompact: Updated $STATE_FILE at $TIMESTAMP (compaction #$(echo "$UPDATED_STATE" | jq -r '.compaction_count'))"
}

# === Ensure state directory exists ===
mkdir -p "$PROJECT_DIR/_bmad"

# === Update whichever state files exist ===
update_state_file "$CONDUIT_STATE"
update_state_file "$TEAMS_STATE"

# === Log to devlog if it exists ===
DEVLOG="$PROJECT_DIR/.bmad/devlog.md"
if [ -f "$DEVLOG" ]; then
    {
        echo ""
        echo "### [$TIMESTAMP] Context Compaction"
        echo "- State preserved (mode-agnostic)"
        echo "- SessionStart hook will restore context"
    } >> "$DEVLOG"
fi

echo "PreCompact: State saved at $TIMESTAMP"
exit 0
