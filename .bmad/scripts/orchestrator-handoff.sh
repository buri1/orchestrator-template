#!/bin/bash
# Orchestrator PreCompact Hook (Simplified v2)
# Called BEFORE context compaction
#
# OLD behavior: Spawned a new agent (complex, error-prone)
# NEW behavior: Just persist state - SessionStart hook handles restoration
#
# The SessionStart hook will:
# 1. Read the saved state
# 2. Inject the absolute rules + state via additionalContext
# 3. The agent continues with full context - no new agent needed

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_FILE="$PROJECT_DIR/_bmad/orchestrator-state.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# === Ensure state directory exists ===
mkdir -p "$(dirname "$STATE_FILE")"

# === Read current state or create default ===
if [ -f "$STATE_FILE" ]; then
    CURRENT_STATE=$(cat "$STATE_FILE")
else
    CURRENT_STATE='{
      "current_session": {"phase": "idle"},
      "progress": {"stories_completed": 0}
    }'
fi

# === Update timestamp and add compaction marker ===
UPDATED_STATE=$(echo "$CURRENT_STATE" | jq --arg ts "$TIMESTAMP" '
  .last_compaction = $ts |
  .last_updated = $ts |
  .compaction_count = ((.compaction_count // 0) + 1)
')

# === Write updated state ===
echo "$UPDATED_STATE" > "$STATE_FILE"

# === Log to devlog if it exists ===
DEVLOG="$PROJECT_DIR/.bmad/devlog.md"
if [ -f "$DEVLOG" ]; then
    {
        echo ""
        echo "### [$TIMESTAMP] Context Compaction"
        echo "- State preserved to orchestrator-state.json"
        echo "- Compaction #$(echo "$UPDATED_STATE" | jq -r '.compaction_count')"
        echo "- SessionStart hook will restore context"
    } >> "$DEVLOG"
fi

echo "PreCompact: State saved at $TIMESTAMP"
exit 0
