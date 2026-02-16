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
TMUX_STATE="$PROJECT_DIR/_bmad/orchestrator-tmux-state.json"

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

# === Tmux state: probe sessions before saving ===
if [ -f "$TMUX_STATE" ]; then
    for session in $(cat "$TMUX_STATE" | jq -r '.sessions | keys[]' 2>/dev/null); do
        if tmux has-session -t "$session" 2>/dev/null; then
            cmd=$(tmux list-panes -t "$session" -F '#{pane_current_command}' 2>/dev/null | head -1)
            is_claude="false"
            [ "$cmd" = "claude" ] && is_claude="true"

            UPDATED=$(cat "$TMUX_STATE" | jq \
                --arg s "$session" \
                --arg ts "$TIMESTAMP" \
                --argjson cr "$is_claude" \
                '.sessions[$s].claude_running = $cr | .sessions[$s].last_seen_alive = $ts')
            echo "$UPDATED" > "$TMUX_STATE"
        fi
    done
    update_state_file "$TMUX_STATE"
fi

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
