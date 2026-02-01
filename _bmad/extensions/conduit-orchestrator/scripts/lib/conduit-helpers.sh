#!/bin/bash
#
# Conduit CLI Helper Functions
# Source this file in other scripts: source ./lib/conduit-helpers.sh
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Check if running inside Conduit
check_conduit() {
    if ! command -v conduit &> /dev/null; then
        log_error "Conduit CLI not found. Are you running inside Conduit?"
        return 1
    fi
    return 0
}

# Check if gh CLI is authenticated
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI not authenticated. Run: gh auth login"
        return 1
    fi
    return 0
}

# Spawn a new terminal pane
# Usage: spawn_terminal [direction]
# Returns: pane_id
spawn_terminal() {
    local direction=${1:-right}

    conduit pane-split "$direction" -t terminal
    sleep 0.5

    # Get the new pane ID (last in list)
    local pane_id=$(conduit pane-list --json 2>/dev/null | jq -r '.[-1].id // empty')

    if [ -z "$pane_id" ]; then
        log_error "Failed to get pane ID"
        return 1
    fi

    echo "$pane_id"
}

# Send command to terminal and wait
# Usage: send_command <pane_id> <command> [timeout]
send_command() {
    local pane_id=$1
    local command=$2
    local timeout=${3:-10}

    conduit terminal-write -p "$pane_id" -e "$command"
    conduit terminal-wait -p "$pane_id" -t "$timeout"
}

# Wait for PR to be created
# Usage: wait_for_pr <branch_name> [timeout_seconds]
wait_for_pr() {
    local branch=$1
    local timeout=${2:-1800}
    local interval=30
    local elapsed=0

    log_info "Watching for PR on branch: $branch"

    while [ $elapsed -lt $timeout ]; do
        local pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)

        if [ -n "$pr_number" ] && [ "$pr_number" != "null" ]; then
            log_success "PR #$pr_number created!"
            conduit notify "PR #$pr_number erstellt für $branch"
            echo "$pr_number"
            return 0
        fi

        sleep $interval
        elapsed=$((elapsed + interval))
        log_info "Still waiting... ($elapsed/$timeout seconds)"
    done

    log_warn "Timeout waiting for PR"
    return 1
}

# Get latest commit SHA from PR
# Usage: get_latest_commit <pr_number>
get_latest_commit() {
    local pr_number=$1
    gh pr view "$pr_number" --json commits --jq '.commits[-1].oid'
}

# Get PR comments for specific commit only
# Usage: get_commit_comments <pr_number> <commit_sha>
get_commit_comments() {
    local pr_number=$1
    local commit_sha=$2
    local repo=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')

    gh api "repos/$repo/pulls/$pr_number/comments" \
        --jq "[.[] | select(.original_commit_id == \"$commit_sha\")]"
}

# Watch for new reviews
# Usage: watch_for_review <pr_number> [interval]
watch_for_review() {
    local pr_number=$1
    local interval=${2:-60}
    local last_count=0

    log_info "Watching PR #$pr_number for reviews..."

    while true; do
        local review_count=$(gh pr view "$pr_number" --json reviews --jq '.reviews | length')
        local comment_count=$(gh api "repos/$(gh repo view --json nameWithOwner -q '.nameWithOwner')/pulls/$pr_number/comments" --jq 'length' 2>/dev/null || echo "0")

        local total=$((review_count + comment_count))

        if [ "$total" -gt "$last_count" ]; then
            log_success "New review activity detected!"
            conduit notify "Review-Aktivität auf PR #$pr_number"
            last_count=$total
            return 0
        fi

        sleep $interval
    done
}

# Close a pane
# Usage: close_pane <pane_id>
close_pane() {
    local pane_id=$1
    conduit pane-close -p "$pane_id"
}

# Notify user
# Usage: notify <message>
notify() {
    conduit notify "$@"
}
