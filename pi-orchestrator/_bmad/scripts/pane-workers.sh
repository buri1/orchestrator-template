#!/bin/bash
# ============================================================================
# Pane Worker Helpers — for the Opus Orchestrator (cmux)
# ============================================================================
# Source this in the orchestrator pane to get worker CRUD functions.
# These manage workers as cmux surfaces in the right half of the workspace.
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
        echo "Worker '$name' already exists in surface $existing_pane"
        return 1
    fi

    local count
    count=$(_worker_count)
    local workers_base_pane
    workers_base_pane=$(_read_layout_field "workersPaneId")

    if [ "$count" = "0" ]; then
        # First worker: use the existing workers surface
        local pane_id="$workers_base_pane"
        cmux send --surface "$pane_id" "cd '$directory' && export ORCHY_SESSION_NAME=$name && unset CLAUDECODE && claude $flags" 2>/dev/null
        cmux rename-tab --surface "$pane_id" "$name" 2>/dev/null || true
        _add_worker_to_layout "$name" "$pane_id" "$directory"
        echo "Worker '$name' started in surface $pane_id (first worker, right side)"
    else
        # Subsequent workers: split above the last worker
        local last_pane
        last_pane=$(python3 -c "
import json
d = json.load(open('$_LAYOUT_FILE'))
wp = d.get('workerPanes', [])
print(wp[-1]['paneId'] if wp else '')
" 2>/dev/null)

        local new_pane
        new_pane=$(cmux new-split up --surface "$last_pane" 2>/dev/null)

        if [ -z "$new_pane" ]; then
            echo "ERROR: Failed to split surface for worker '$name'"
            return 1
        fi

        cmux send --surface "$new_pane" "cd '$directory' && export ORCHY_SESSION_NAME=$name && unset CLAUDECODE && claude $flags" 2>/dev/null
        cmux rename-tab --surface "$new_pane" "$name" 2>/dev/null || true
        _add_worker_to_layout "$name" "$new_pane" "$directory"
        echo "Worker '$name' started in surface $new_pane (worker #$((count + 1)), top of right side)"
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

    # cmux send takes raw text — no shell escaping gymnastics
    cmux send --surface "$pane_id" "$prompt" 2>/dev/null
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

    cmux read-screen --surface "$pane_id" --lines "$lines" 2>/dev/null
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

    # Graceful exit: send interrupt sequence
    cmux send-key --surface "$pane_id" "escape" 2>/dev/null || true
    cmux send-key --surface "$pane_id" "ctrl+c" 2>/dev/null || true
    cmux send-key --surface "$pane_id" "ctrl+c" 2>/dev/null || true
    cmux send-key --surface "$pane_id" "ctrl+c" 2>/dev/null || true
    sleep 2
    cmux close-surface --surface "$pane_id" 2>/dev/null || true

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
            cmd = subprocess.run(['cmux', 'read-screen', '--surface', w['paneId'], '--lines', '1'], capture_output=True, text=True, timeout=5)
            status = 'active' if cmd.returncode == 0 else 'DEAD'
        except:
            status = 'DEAD'
        print(f\"  {w['name']:20s} {w['paneId']:12s} {status:12s} {w['directory']}\")
" 2>/dev/null
}

wait_worker() {
    local name="$1"
    local timeout="${2:-1800}"

    if [ -z "$name" ]; then
        echo "Usage: wait_worker <name> [timeout_seconds]"
        return 1
    fi

    local latch="/tmp/orchy-${name}.latch"

    # Fast path: latch already exists
    if [ -f "$latch" ]; then
        echo "Worker '$name' already completed (latch found)"
        cat "$latch"
        return 0
    fi

    # Poll-based wait (cmux wait-for not yet implemented)
    echo "Waiting for '$name' (timeout: ${timeout}s, polling every 5s)..."
    local elapsed=0
    while [ $elapsed -lt "$timeout" ]; do
        # Check if latch appeared
        if [ -f "$latch" ]; then
            echo "Worker '$name' completed!"
            cat "$latch"
            return 0
        fi

        # Check if surface is still alive
        local pane_id
        pane_id=$(_read_worker_pane "$name")
        if [ -n "$pane_id" ]; then
            local screen
            screen=$(cmux read-screen --surface "$pane_id" --lines 3 2>/dev/null || echo "")
            if [ -z "$screen" ]; then
                echo "Worker '$name' surface died"
                return 1
            fi
        fi

        sleep 5
        elapsed=$((elapsed + 5))
    done

    echo "TIMEOUT: Worker '$name' did not complete within ${timeout}s"
    return 1
}

# ── Auto-source notice ───────────────────────────

echo "Pane worker helpers loaded (cmux). Commands: spawn_worker, dispatch_worker, capture_worker, close_worker, list_workers, wait_worker"
