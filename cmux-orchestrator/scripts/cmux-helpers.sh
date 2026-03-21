#!/bin/bash
#
# cmux Orchestrator Helper Functions
# Source this file: source ./scripts/cmux-helpers.sh
#
# CRUD for Agents — the core abstraction:
#   CREATE: spawn_worker
#   READ:   wait_for_worker / read_worker_output
#   UPDATE: send_to_worker
#   DELETE: close_worker

# --- Config ---
MAX_WORKERS=${MAX_WORKERS:-8}
DEFAULT_TIMEOUT=${DEFAULT_TIMEOUT:-1800}  # 30 min

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# --- Logging ---
log_info()    { echo -e "${BLUE}[orch]${NC} $1"; cmux log --level info --source orchestrator -- "$1" 2>/dev/null; }
log_success() { echo -e "${GREEN}[orch]${NC} $1"; cmux log --level info --source orchestrator -- "$1" 2>/dev/null; }
log_warn()    { echo -e "${YELLOW}[orch]${NC} $1"; cmux log --level warn --source orchestrator -- "$1" 2>/dev/null; }
log_error()   { echo -e "${RED}[orch]${NC} $1"; cmux log --level error --source orchestrator -- "$1" 2>/dev/null; }

# --- Checks ---

check_cmux() {
    if ! cmux ping &>/dev/null; then
        log_error "cmux not responding. Are you running inside cmux?"
        return 1
    fi
    return 0
}

check_gh_auth() {
    if ! gh auth status &>/dev/null; then
        log_error "GitHub CLI not authenticated. Run: gh auth login"
        return 1
    fi
    return 0
}

# --- CREATE: Spawn a Worker ---
# Usage: spawn_worker <worker_name> <project_dir> [direction]
# Sets:  LAST_SURFACE_REF, LAST_SIGNAL
spawn_worker() {
    local worker_name=$1
    local project_dir=$2
    local direction=${3:-right}

    local signal="agent-${worker_name}-done"

    # Split a new visible pane (use --json for reliable parsing)
    local result
    result=$(cmux new-split "$direction" --json 2>&1)
    if [ $? -ne 0 ]; then
        log_error "Failed to split pane: $result"
        return 1
    fi

    # Parse surface ref from JSON output
    local surface_ref
    surface_ref=$(echo "$result" | jq -r '.surface_ref // .surface_id // empty' 2>/dev/null)

    if [ -z "$surface_ref" ]; then
        # Fallback: try plain text parsing
        surface_ref=$(echo "$result" | grep -oE 'surface:[0-9]+' | head -1)
    fi

    if [ -z "$surface_ref" ]; then
        # Last resort: get the latest surface from the workspace
        surface_ref=$(cmux tree --json 2>/dev/null | jq -r '.. | .surface_ref? // empty' | tail -1)
    fi

    if [ -z "$surface_ref" ]; then
        log_error "Could not determine surface ref after split"
        return 1
    fi

    # Rename the tab for visibility
    cmux rename-tab --surface "$surface_ref" "$worker_name" 2>/dev/null

    # Start Claude Code with the signal env var
    cmux send --surface "$surface_ref" "cd ${project_dir} && ORCHY_SIGNAL=${signal} claude --dangerously-skip-permissions\n"

    # Update sidebar
    cmux set-status "$worker_name" "starting" --icon hammer --color "#ff9500" 2>/dev/null

    log_info "Spawned $worker_name in $surface_ref (signal: $signal)"

    # Export for caller
    LAST_SURFACE_REF="$surface_ref"
    LAST_SIGNAL="$signal"

    return 0
}

# --- Send to Worker ---
# Usage: send_to_worker <surface_ref> <text>
send_to_worker() {
    local surface_ref=$1
    local text=$2
    cmux send --surface "$surface_ref" "${text}\n"
}

# --- READ: Wait for Worker (EVENT-DRIVEN) ---
# Usage: wait_for_worker <signal> [timeout_seconds]
# Blocks until the worker's Claude Code Stop hook signals completion.
wait_for_worker() {
    local signal=$1
    local timeout=${2:-$DEFAULT_TIMEOUT}

    log_info "Waiting for signal: $signal (timeout: ${timeout}s)"
    cmux wait-for "$signal" --timeout "$timeout"
    local exit_code=$?

    if [ $exit_code -ne 0 ]; then
        log_warn "wait-for timed out or failed for: $signal"
        return 1
    fi

    log_success "Signal received: $signal"
    return 0
}

# --- Wait for ANY of N workers ---
# Usage: wait_for_any <signal1> <signal2> ...
# Returns the signal name that fired first
wait_for_any() {
    local signals=("$@")

    while true; do
        for signal in "${signals[@]}"; do
            if cmux wait-for "$signal" --timeout 3 2>/dev/null; then
                echo "$signal"
                return 0
            fi
        done
    done
}

# --- Wait for ALL workers ---
# Usage: wait_for_all <timeout> <signal1> <signal2> ...
wait_for_all() {
    local timeout=$1
    shift
    local signals=("$@")

    for signal in "${signals[@]}"; do
        wait_for_worker "$signal" "$timeout"
    done
}

# --- Read Worker Output ---
# Usage: read_worker_output <surface_ref> [lines]
read_worker_output() {
    local surface_ref=$1
    local lines=${2:-100}
    cmux read-screen --surface "$surface_ref" --scrollback --lines "$lines"
}

# --- DELETE: Close Worker ---
# Usage: close_worker <surface_ref> <worker_name>
close_worker() {
    local surface_ref=$1
    local worker_name=$2

    # Graceful: try /exit first
    cmux send --surface "$surface_ref" "/exit\n" 2>/dev/null
    sleep 2

    # Force close the surface
    cmux close-surface --surface "$surface_ref" 2>/dev/null

    # Clean sidebar
    cmux clear-status "$worker_name" 2>/dev/null

    log_info "Closed worker: $worker_name ($surface_ref)"
}

# --- PR Helpers ---

# Wait for PR on a branch (uses gh pr checks --watch for CI)
# Usage: wait_for_pr <branch_name> [timeout]
wait_for_pr() {
    local branch=$1
    local timeout=${2:-600}
    local interval=15
    local elapsed=0

    log_info "Watching for PR on branch: $branch"

    while [ $elapsed -lt $timeout ]; do
        local pr_number
        pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)

        if [ -n "$pr_number" ] && [ "$pr_number" != "null" ]; then
            log_success "PR #$pr_number created on $branch"
            cmux notify --title "PR Created" --body "PR #$pr_number for $branch"
            echo "$pr_number"
            return 0
        fi

        sleep $interval
        elapsed=$((elapsed + interval))
    done

    log_warn "Timeout waiting for PR on $branch"
    return 1
}

# Watch CI status (event-driven via gh --watch)
# Usage: wait_for_ci <pr_number>
wait_for_ci() {
    local pr_number=$1
    log_info "Watching CI for PR #$pr_number..."
    gh pr checks "$pr_number" --watch --fail-fast 2>/dev/null
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        log_success "CI passed for PR #$pr_number"
    else
        log_warn "CI failed for PR #$pr_number"
    fi
    return $exit_code
}

# --- Notification Helper ---
notify() {
    local title=$1
    local body=${2:-""}
    cmux notify --title "$title" --body "$body" 2>/dev/null
}

# --- Progress Helper ---
# Usage: update_progress <completed> <total> [label]
update_progress() {
    local completed=$1
    local total=$2
    local label=${3:-"${completed}/${total} stories"}

    if [ "$total" -gt 0 ]; then
        local ratio
        ratio=$(echo "scale=2; $completed / $total" | bc)
        cmux set-progress "$ratio" --label "$label" 2>/dev/null
    fi
}
