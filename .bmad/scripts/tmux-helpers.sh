#!/bin/bash
# Tmux Session Helper Functions for Orchestrator (v2 -- Event-Driven)
# Source this file: source .bmad/scripts/tmux-helpers.sh
#
# v2 changes (Ghostty 1.3 / tmux wait-for):
#   - wait-for based event-driven waiting (replaces polling)
#   - Latch files for signal-before-waiter edge case
#   - wait_any / wait_all multi-agent patterns
#   - Silence-based fallback detection
#   - Bell propagation helpers

# =====================================================================
# CONSTANTS
# =====================================================================
ORCHY_CHANNEL_PREFIX="orchy"
ORCHY_LATCH_DIR="/tmp"
ORCHY_DEFAULT_SILENCE_TIMEOUT=120

# =====================================================================
# CORE: Session Management (v1 API preserved)
# =====================================================================

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
    # Set ORCHY_SESSION_NAME so the Stop hook knows which channel to signal
    tmux send-keys -t "$session" "export ORCHY_SESSION_NAME=$session && unset CLAUDECODE && claude $flags" Enter
}

# Capture recent output from a tmux session
tmux_capture_output() {
    local session="$1"
    local lines="${2:-50}"
    tmux capture-pane -t "$session" -p -S "-$lines"
}

# =====================================================================
# EVENT-DRIVEN: Latch Management
# =====================================================================

# Get the channel name for a session
_orchy_channel() {
    local session="$1"
    echo "${ORCHY_CHANNEL_PREFIX}-${session}-done"
}

# Get the latch file path for a session
_orchy_latch() {
    local session="$1"
    echo "${ORCHY_LATCH_DIR}/${ORCHY_CHANNEL_PREFIX}-${session}.latch"
}

# Clear the latch for a session (call BEFORE dispatching work)
tmux_clear_latch() {
    local session="$1"
    rm -f "$(_orchy_latch "$session")"
}

# Check if a latch file exists (signal already fired)
tmux_latch_exists() {
    local session="$1"
    [ -f "$(_orchy_latch "$session")" ]
}

# Read latch data as JSON
tmux_read_latch() {
    local session="$1"
    local latch_file="$(_orchy_latch "$session")"
    if [ -f "$latch_file" ]; then
        cat "$latch_file"
    else
        echo '{"error": "no latch file"}'
        return 1
    fi
}

# =====================================================================
# EVENT-DRIVEN: Wait Functions
# =====================================================================

# Wait for a single session to signal completion.
# Handles the signal-before-waiter edge case via latch files.
#
# Usage: tmux_wait_for_session <session_name> [timeout_seconds]
# Returns: 0 on signal, 1 on timeout, 2 on dead session
tmux_wait_for_session() {
    local session="$1"
    local timeout="${2:-0}"
    local channel="$(_orchy_channel "$session")"
    local latch_file="$(_orchy_latch "$session")"

    # Session doesn't exist
    if ! tmux has-session -t "$session" 2>/dev/null; then
        echo "WARN: Session '$session' does not exist" >&2
        return 2
    fi

    # Fast path: latch already exists (signal fired before we started waiting)
    if [ -f "$latch_file" ]; then
        return 0
    fi

    # Claude not running — may have stopped between latch clear and now
    if ! tmux_claude_running "$session"; then
        if [ -f "$latch_file" ]; then
            return 0
        fi
        echo "WARN: Claude not running in '$session' and no latch found" >&2
        return 2
    fi

    if [ "$timeout" -gt 0 ] 2>/dev/null; then
        # Wait with timeout
        local timeout_channel="${channel}-timeout-$$"
        (
            sleep "$timeout"
            tmux wait-for -S "$timeout_channel" 2>/dev/null || true
        ) &
        local timeout_pid=$!

        tmux wait-for "$channel" 2>/dev/null &
        local wait_pid=$!

        tmux wait-for "$timeout_channel" 2>/dev/null &
        local twait_pid=$!

        wait -n "$wait_pid" "$twait_pid" 2>/dev/null

        kill "$timeout_pid" 2>/dev/null || true
        kill "$wait_pid" 2>/dev/null || true
        kill "$twait_pid" 2>/dev/null || true
        tmux wait-for -S "$channel" 2>/dev/null || true
        tmux wait-for -S "$timeout_channel" 2>/dev/null || true

        if [ -f "$latch_file" ]; then
            return 0
        else
            return 1
        fi
    else
        # No timeout — block indefinitely
        tmux wait-for "$channel" 2>/dev/null
        return 0
    fi
}

# Wait for ANY of N sessions to signal completion.
# Returns the name of the session that completed first.
#
# Usage: WINNER=$(tmux_wait_any session1 session2 session3)
tmux_wait_any() {
    local sessions=("$@")

    # Fast path: check all latches
    for session in "${sessions[@]}"; do
        if tmux_latch_exists "$session"; then
            echo "$session"
            return 0
        fi
    done

    # Fast path: check for dead sessions
    for session in "${sessions[@]}"; do
        if ! tmux has-session -t "$session" 2>/dev/null; then
            echo "$session"
            return 0
        fi
        if ! tmux_claude_running "$session"; then
            echo "$session"
            return 0
        fi
    done

    # Block on the global "any agent done" channel
    tmux wait-for "${ORCHY_CHANNEL_PREFIX}-any-done" 2>/dev/null

    # Determine which session(s) completed
    for session in "${sessions[@]}"; do
        if tmux_latch_exists "$session"; then
            echo "$session"
            return 0
        fi
    done

    for session in "${sessions[@]}"; do
        if ! tmux_claude_running "$session"; then
            echo "$session"
            return 0
        fi
    done

    # Signal was for a session not in our list — re-wait
    tmux_wait_any "${sessions[@]}"
}

# Wait for ALL N sessions to signal completion.
#
# Usage: tmux_wait_all session1 session2 session3
tmux_wait_all() {
    local sessions=("$@")
    local remaining=()

    for session in "${sessions[@]}"; do
        if tmux_latch_exists "$session"; then
            continue
        fi
        if ! tmux has-session -t "$session" 2>/dev/null; then
            continue
        fi
        if ! tmux_claude_running "$session"; then
            continue
        fi
        remaining+=("$session")
    done

    if [ ${#remaining[@]} -eq 0 ]; then
        return 0
    fi

    local finished
    finished=$(tmux_wait_any "${remaining[@]}")

    local still_remaining=()
    for session in "${remaining[@]}"; do
        if [ "$session" != "$finished" ]; then
            still_remaining+=("$session")
        fi
    done

    if [ ${#still_remaining[@]} -gt 0 ]; then
        tmux_wait_all "${still_remaining[@]}"
    fi

    return 0
}

# =====================================================================
# DISPATCH: Send work + arm trigger
# =====================================================================

# Dispatch a task to an agent session and prepare for event-driven wait.
#
# Usage: tmux_dispatch <session_name> <prompt>
tmux_dispatch() {
    local session="$1"
    local prompt="$2"

    if ! tmux has-session -t "$session" 2>/dev/null; then
        echo "ERROR: Session '$session' does not exist" >&2
        return 1
    fi

    tmux_clear_latch "$session"
    tmux send-keys -t "$session" "$prompt" Enter
    echo "Dispatched to '$session', channel: $(_orchy_channel "$session")"
}

# Full lifecycle: create session, start Claude, dispatch, wait.
#
# Usage: tmux_spawn_and_dispatch <session_name> <directory> <prompt> [timeout]
tmux_spawn_and_dispatch() {
    local session="$1"
    local directory="$2"
    local prompt="$3"
    local timeout="${4:-0}"

    if ! tmux has-session -t "$session" 2>/dev/null; then
        tmux new-session -d -s "$session" -c "$directory"
    fi

    if ! tmux_claude_running "$session"; then
        tmux_start_claude "$session"
        sleep 8  # wait for Claude init (the one acceptable sleep)
    fi

    tmux_dispatch "$session" "$prompt"
    tmux_wait_for_session "$session" "$timeout"
}

# =====================================================================
# FALLBACK: Silence Detection
# =====================================================================

# Check if a session appears silent/hung
tmux_check_silence() {
    local session="$1"

    if ! tmux has-session -t "$session" 2>/dev/null; then
        return 0
    fi

    local flags=$(tmux list-windows -t "$session" -F '#{window_flags}' 2>/dev/null)
    if echo "$flags" | grep -q '~'; then
        return 0  # silence alert flag set
    fi

    return 1
}

# =====================================================================
# BELL / NOTIFICATION HELPERS
# =====================================================================

# Send a bell to a specific tmux session (triggers Ghostty notification)
tmux_bell() {
    local session="$1"
    tmux send-keys -t "$session" "printf '\\a'" Enter 2>/dev/null || true
}

# Send a bell from the orchestrator session itself
orchy_bell() {
    printf '\a'
}

# =====================================================================
# CLEANUP
# =====================================================================

# Clean up all latch files
tmux_cleanup_latches() {
    rm -f ${ORCHY_LATCH_DIR}/${ORCHY_CHANNEL_PREFIX}-*.latch
    echo "Cleaned up all orchestrator latch files"
}

# Clean up for a specific session
tmux_cleanup_session() {
    local session="$1"
    rm -f "$(_orchy_latch "$session")"
    tmux wait-for -S "$(_orchy_channel "$session")" 2>/dev/null || true
}
