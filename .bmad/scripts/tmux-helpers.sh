#!/bin/bash
# Tmux Session Helper Functions for Orchestrator
# Source this file: source .bmad/scripts/tmux-helpers.sh

# Probe all known sessions and return JSON status
tmux_probe_sessions() {
    local STATE_FILE="${1:-_bmad/orchestrator-tmux-state.json}"

    if [ ! -f "$STATE_FILE" ]; then
        echo '{"error": "no state file"}'
        return 1
    fi

    local sessions=$(cat "$STATE_FILE" | jq -r '.sessions | keys[]')
    local result="{}"

    for session in $sessions; do
        local alive="false"
        local claude_running="false"
        local cwd=""

        if tmux has-session -t "$session" 2>/dev/null; then
            alive="true"
            cwd=$(tmux display-message -p -t "$session" '#{pane_current_path}' 2>/dev/null)
            local cmd=$(tmux list-panes -t "$session" -F '#{pane_current_command}' 2>/dev/null | head -1)
            if [ "$cmd" = "claude" ]; then
                claude_running="true"
            fi
        fi

        result=$(echo "$result" | jq \
            --arg s "$session" \
            --arg a "$alive" \
            --arg c "$claude_running" \
            --arg d "$cwd" \
            '.[$s] = {"alive": ($a == "true"), "claude_running": ($c == "true"), "cwd": $d}')
    done

    echo "$result"
}

# Check if a specific session exists
tmux_session_exists() {
    tmux has-session -t "$1" 2>/dev/null
}

# Check if claude is running in a session
tmux_claude_running() {
    local cmd=$(tmux list-panes -t "$1" -F '#{pane_current_command}' 2>/dev/null | head -1)
    [ "$cmd" = "claude" ]
}

# Send keys to a tmux session
tmux_send() {
    local session="$1"
    local keys="$2"
    tmux send-keys -t "$session" "$keys" Enter
}

# Create a new tmux session (detached)
tmux_create_session() {
    local session="$1"
    local directory="$2"
    tmux new-session -d -s "$session" -c "$directory"
}

# Start claude in a tmux session
tmux_start_claude() {
    local session="$1"
    local flags="${2:---dangerously-skip-permissions}"
    tmux send-keys -t "$session" "unset CLAUDECODE && claude $flags" Enter
}

# Capture recent output from a tmux session
tmux_capture_output() {
    local session="$1"
    local lines="${2:-50}"
    tmux capture-pane -t "$session" -p -S "-$lines"
}
