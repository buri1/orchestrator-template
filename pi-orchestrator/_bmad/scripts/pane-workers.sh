#!/bin/bash
# ============================================================================
# Pane Worker Helpers — for the Opus Orchestrator
# ============================================================================
# Source this in the orchestrator pane to get worker CRUD functions.
# These manage workers as tmux panes in the right half of the lthread session.
#
# Layout convention:
#   Left half:  Supervisor (top) + Orchestrator (bottom)
#   Right half: Workers stacked vertically (newest on top, first at bottom)
#
# Usage:
#   source /path/to/_bmad/scripts/pane-workers.sh
#   spawn_worker "lagerlink" "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim"
#   dispatch_worker "lagerlink" "Fix the login bug in /src/auth.ts"
#   capture_worker "lagerlink" 50
#   close_worker "lagerlink"
#   list_workers
# ============================================================================

# Auto-detect script directory and layout file
_PANE_HELPERS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_LAYOUT_FILE="$(dirname "$_PANE_HELPERS_DIR")/pane-layout.json"

# ── Internal helpers ──────────────────────────────

_read_layout_field() {
    local field="$1"
    if [ -f "$_LAYOUT_FILE" ]; then
        python3 -c "import json; d=json.load(open('$_LAYOUT_FILE')); print(d.get('$field',''))" 2>/dev/null
    fi
}

_read_worker_pane() {
    local name="$1"
    if [ -f "$_LAYOUT_FILE" ]; then
        python3 -c "
import json
d = json.load(open('$_LAYOUT_FILE'))
for w in d.get('workerPanes', []):
    if w['name'] == '$name':
        print(w['paneId'])
        break
" 2>/dev/null
    fi
}

_add_worker_to_layout() {
    local name="$1"
    local pane_id="$2"
    local directory="$3"
    if [ -f "$_LAYOUT_FILE" ]; then
        python3 -c "
import json
d = json.load(open('$_LAYOUT_FILE'))
d.setdefault('workerPanes', []).append({'name': '$name', 'paneId': '$pane_id', 'directory': '$directory'})
json.dump(d, open('$_LAYOUT_FILE', 'w'), indent=2)
" 2>/dev/null
    fi
}

_remove_worker_from_layout() {
    local name="$1"
    if [ -f "$_LAYOUT_FILE" ]; then
        python3 -c "
import json
d = json.load(open('$_LAYOUT_FILE'))
d['workerPanes'] = [w for w in d.get('workerPanes', []) if w['name'] != '$name']
json.dump(d, open('$_LAYOUT_FILE', 'w'), indent=2)
" 2>/dev/null
    fi
}

_worker_count() {
    if [ -f "$_LAYOUT_FILE" ]; then
        python3 -c "
import json
d = json.load(open('$_LAYOUT_FILE'))
print(len(d.get('workerPanes', [])))
" 2>/dev/null
    else
        echo "0"
    fi
}

# ── Public API ────────────────────────────────────

spawn_worker() {
    local name="$1"
    local directory="$2"
    local flags="${3:---dangerously-skip-permissions}"

    if [ -z "$name" ] || [ -z "$directory" ]; then
        echo "Usage: spawn_worker <name> <directory> [claude-flags]"
        return 1
    fi

    # Check if worker already exists
    local existing_pane
    existing_pane=$(_read_worker_pane "$name")
    if [ -n "$existing_pane" ]; then
        echo "Worker '$name' already exists in pane $existing_pane"
        return 1
    fi

    local count
    count=$(_worker_count)
    local workers_base_pane
    workers_base_pane=$(_read_layout_field "workersPaneId")

    if [ "$count" = "0" ]; then
        # First worker: use the existing workers pane
        local pane_id="$workers_base_pane"
        tmux send-keys -t "$pane_id" "cd '$directory' && export ORCHY_SESSION_NAME=$name && unset CLAUDECODE && claude $flags" Enter
        tmux select-pane -t "$pane_id" -T "$name"
        _add_worker_to_layout "$name" "$pane_id" "$directory"
        echo "Worker '$name' started in pane $pane_id (first worker, right side)"
    else
        # Subsequent workers: split above the last worker
        # Get the pane ID of the most recently added worker (topmost)
        local last_pane
        last_pane=$(python3 -c "
import json
d = json.load(open('$_LAYOUT_FILE'))
wp = d.get('workerPanes', [])
print(wp[-1]['paneId'] if wp else '')
" 2>/dev/null)

        local total=$((count + 1))
        local split_pct=$((100 / total))

        local new_pane
        new_pane=$(tmux split-window -v -b -t "$last_pane" -c "$directory" -l "${split_pct}%" -P -F '#{pane_id}')

        if [ -z "$new_pane" ]; then
            echo "ERROR: Failed to split pane for worker '$name'"
            return 1
        fi

        tmux send-keys -t "$new_pane" "export ORCHY_SESSION_NAME=$name && unset CLAUDECODE && claude $flags" Enter
        tmux select-pane -t "$new_pane" -T "$name"
        _add_worker_to_layout "$name" "$new_pane" "$directory"
        echo "Worker '$name' started in pane $new_pane (worker #$total, top of right side)"
    fi
}

dispatch_worker() {
    local name="$1"
    local prompt="$2"

    if [ -z "$name" ] || [ -z "$prompt" ]; then
        echo "Usage: dispatch_worker <name> <prompt>"
        return 1
    fi

    local pane_id
    pane_id=$(_read_worker_pane "$name")
    if [ -z "$pane_id" ]; then
        echo "Worker '$name' not found"
        return 1
    fi

    # Clear latch before dispatching
    rm -f "/tmp/orchy-${name}.latch" 2>/dev/null

    # Escape single quotes for tmux
    local escaped="${prompt//\'/\'\\\'\'}"
    tmux send-keys -t "$pane_id" "$escaped" Enter
    echo "Dispatched to '$name' ($pane_id)"
}

capture_worker() {
    local name="$1"
    local lines="${2:-50}"

    if [ -z "$name" ]; then
        echo "Usage: capture_worker <name> [lines]"
        return 1
    fi

    local pane_id
    pane_id=$(_read_worker_pane "$name")
    if [ -z "$pane_id" ]; then
        echo "Worker '$name' not found"
        return 1
    fi

    tmux capture-pane -t "$pane_id" -p -S "-${lines}"
}

close_worker() {
    local name="$1"

    if [ -z "$name" ]; then
        echo "Usage: close_worker <name>"
        return 1
    fi

    local pane_id
    pane_id=$(_read_worker_pane "$name")
    if [ -z "$pane_id" ]; then
        echo "Worker '$name' not found"
        return 1
    fi

    # Graceful exit
    tmux send-keys -t "$pane_id" Escape
    tmux send-keys -t "$pane_id" C-c C-c C-c
    sleep 2
    tmux kill-pane -t "$pane_id" 2>/dev/null

    # Cleanup
    rm -f "/tmp/orchy-${name}.latch" 2>/dev/null
    _remove_worker_from_layout "$name"
    echo "Worker '$name' closed"
}

list_workers() {
    if [ ! -f "$_LAYOUT_FILE" ]; then
        echo "No layout file found"
        return 1
    fi

    python3 -c "
import json, subprocess
d = json.load(open('$_LAYOUT_FILE'))
workers = d.get('workerPanes', [])
if not workers:
    print('No workers')
else:
    for w in workers:
        try:
            cmd = subprocess.run(['tmux', 'display-message', '-t', w['paneId'], '-p', '#{pane_current_command}'], capture_output=True, text=True, timeout=5)
            process = cmd.stdout.strip() or 'unknown'
        except:
            process = 'DEAD'
        print(f\"  {w['name']:20s} {w['paneId']:6s} {process:12s} {w['directory']}\")
" 2>/dev/null
}

wait_worker() {
    local name="$1"
    local timeout="${2:-1800}"

    if [ -z "$name" ]; then
        echo "Usage: wait_worker <name> [timeout_seconds]"
        return 1
    fi

    local channel="orchy-${name}-done"
    local latch="/tmp/orchy-${name}.latch"

    # Fast path: latch already exists
    if [ -f "$latch" ]; then
        echo "Worker '$name' already completed (latch found)"
        cat "$latch"
        return 0
    fi

    echo "Waiting for '$name' (timeout: ${timeout}s)..."
    timeout "$timeout" tmux wait-for "$channel"
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "Worker '$name' completed!"
        [ -f "$latch" ] && cat "$latch"
    elif [ $exit_code -eq 124 ]; then
        echo "TIMEOUT: Worker '$name' did not complete within ${timeout}s"
        return 1
    else
        echo "ERROR waiting for '$name'"
        return 1
    fi
}

# ── Auto-source notice ───────────────────────────

echo "Pane worker helpers loaded. Commands: spawn_worker, dispatch_worker, capture_worker, close_worker, list_workers, wait_worker"
