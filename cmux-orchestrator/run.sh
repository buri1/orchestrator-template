#!/bin/bash
#
# L-Thread Orchestrator v4 — cmux Launcher
#
# Usage: ./run.sh <target-project-dir>
#
# This script:
# 1. Verifies cmux is running
# 2. Creates a new workspace for the orchestrator
# 3. Sets up the sidebar metadata
# 4. Launches Claude Code with the orchestrator agent

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${1:-}"

# --- Validation ---

if [ -z "$TARGET_DIR" ]; then
    echo "Usage: ./run.sh <target-project-dir>"
    echo ""
    echo "Example: ./run.sh ~/Desktop/code/Lagerlink\\ Hildesheim"
    exit 1
fi

# Validate and resolve to absolute path
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory not found: $TARGET_DIR"
    exit 1
fi
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

if ! cmux ping &>/dev/null; then
    echo "Error: cmux is not running. Please start cmux first."
    exit 1
fi

if ! gh auth status &>/dev/null; then
    echo "Error: GitHub CLI not authenticated. Run: gh auth login"
    exit 1
fi

# --- Setup ---

PROJECT_NAME=$(basename "$TARGET_DIR")
echo "L-Thread Orchestrator v4 (cmux)"
echo "Target:    $PROJECT_NAME"
echo "Directory: $TARGET_DIR"
echo ""

# Create a workspace for the orchestrator
cmux new-workspace --cwd "$SCRIPT_DIR" 2>/dev/null || true
sleep 1

# Rename workspace
cmux rename-workspace "Orch: $PROJECT_NAME" 2>/dev/null || true

# Set initial sidebar metadata
cmux set-status "mode" "cmux-v4" --icon terminal --color "#8b5cf6" 2>/dev/null || true
cmux set-status "target" "$PROJECT_NAME" --icon folder 2>/dev/null || true
cmux set-progress 0.0 --label "Starting..." 2>/dev/null || true
cmux log --source orchestrator -- "Orchestrator starting for $PROJECT_NAME" 2>/dev/null || true

# Ensure state directory exists in target project
mkdir -p "$TARGET_DIR/_bmad"

# Create state file from template if it doesn't exist
if [ ! -f "$TARGET_DIR/_bmad/orchestrator-state.json" ]; then
    REPO=$(cd "$TARGET_DIR" && gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown/unknown")
    cat > "$TARGET_DIR/_bmad/orchestrator-state.json" <<EOF
{
  "version": "4.0",
  "mode": "cmux",
  "project": {
    "name": "$PROJECT_NAME",
    "dir": "$TARGET_DIR",
    "repo": "$REPO"
  },
  "current_epic": null,
  "current_story": null,
  "phase": "idle",
  "workers": [],
  "history": [],
  "stats": {
    "stories_completed": 0,
    "stories_skipped": 0,
    "prs_merged": 0,
    "review_cycles_total": 0,
    "started_at": null,
    "last_updated": null
  }
}
EOF
    echo "Created state file: $TARGET_DIR/_bmad/orchestrator-state.json"
fi

# Make scripts executable
chmod +x "$SCRIPT_DIR/scripts/"*.sh

# --- Install Stop Hook in Target Project ---
#
# Workers run `cd <target-dir> && claude`, so they use the TARGET project's
# .claude/settings.local.json for hooks. The cmux-stop-hook.sh must be
# available in the target project for the signal chain to work:
#   Worker finishes → Stop hook → cmux wait-for -S → orchestrator unblocks
#
# We copy the stop hook script and merge the Stop hook config into the
# target project's settings.local.json (preserving existing settings).

STOP_HOOK_SCRIPT="$SCRIPT_DIR/scripts/cmux-stop-hook.sh"
TARGET_SETTINGS="$TARGET_DIR/.claude/settings.local.json"
TARGET_SCRIPTS="$TARGET_DIR/_bmad/scripts"

mkdir -p "$TARGET_SCRIPTS"
mkdir -p "$TARGET_DIR/.claude"

# Copy stop hook script to target project
cp "$STOP_HOOK_SCRIPT" "$TARGET_SCRIPTS/cmux-stop-hook.sh"
chmod +x "$TARGET_SCRIPTS/cmux-stop-hook.sh"

# Merge Stop hook into target project's settings.local.json
if [ -f "$TARGET_SETTINGS" ]; then
    # Check if Stop hook already exists
    HAS_STOP=$(jq 'has("hooks") and (.hooks | has("Stop"))' "$TARGET_SETTINGS" 2>/dev/null || echo "false")
    if [ "$HAS_STOP" = "false" ]; then
        # Add Stop hook to existing settings
        jq --arg script "bash \"$TARGET_SCRIPTS/cmux-stop-hook.sh\"" \
           '.hooks = (.hooks // {}) | .hooks.Stop = [{"hooks": [{"type": "command", "command": $script}]}]' \
           "$TARGET_SETTINGS" > "${TARGET_SETTINGS}.tmp" && mv "${TARGET_SETTINGS}.tmp" "$TARGET_SETTINGS"
        echo "Added Stop hook to target project settings: $TARGET_SETTINGS"
    else
        echo "Stop hook already configured in target project."
    fi
else
    # Create minimal settings with Stop hook
    cat > "$TARGET_SETTINGS" <<HOOK_EOF
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$TARGET_SCRIPTS/cmux-stop-hook.sh\""
          }
        ]
      }
    ]
  }
}
HOOK_EOF
    echo "Created target project settings with Stop hook: $TARGET_SETTINGS"
fi

# --- Launch Claude Code ---

echo ""
echo "Launching Claude Code orchestrator..."
echo "Target project will be passed via TARGET_DIR env var."
echo ""

# Export target dir and script dir so hooks and Claude can access them
export TARGET_DIR
export ORCHESTRATOR_DIR="$SCRIPT_DIR"

# Launch Claude Code from the orchestrator project dir so it picks up
# .claude/settings.local.json, .claude/agents/orchestrator.md, and hooks.
cd "$SCRIPT_DIR"
exec claude --dangerously-skip-permissions
