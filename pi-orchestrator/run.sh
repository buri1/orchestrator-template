#!/bin/bash
# ============================================================================
# L-Thread Pi Orchestrator — Launch Script
# ============================================================================
# Starts the Pi orchestrator with all extensions loaded.
#
# Usage:
#   ./run.sh                    # Interactive mode
#   ./run.sh --auto             # Auto-mode (no user prompts)
#   ./run.sh --model opus       # Use Opus instead of Sonnet
#
# Prerequisites:
#   - Pi Agent installed: npm install -g @mariozechner/pi-coding-agent
#   - tmux installed: brew install tmux
#   - Claude Code installed: npm install -g @anthropic-ai/claude-code
#   - Notification hooks installed: see ../docs/ghostty-notification-setup.md
# ============================================================================

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Parse args
MODEL="sonnet"
AUTO_MODE="DISABLED"

while [[ $# -gt 0 ]]; do
    case $1 in
        --auto)
            AUTO_MODE="ENABLED"
            shift
            ;;
        --model)
            MODEL="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./run.sh [--auto] [--model <model>]"
            exit 1
            ;;
    esac
done

# Set AUTO_MODE
echo "$AUTO_MODE" > .bmad/AUTO_MODE

# Ensure _bmad exists
mkdir -p _bmad .bmad

# Check prerequisites
if ! command -v pi &>/dev/null; then
    echo "ERROR: Pi Agent not installed. Run: npm install -g @mariozechner/pi-coding-agent"
    exit 1
fi

if ! command -v tmux &>/dev/null; then
    echo "ERROR: tmux not installed. Run: brew install tmux"
    exit 1
fi

echo "================================================"
echo "  L-THREAD PI ORCHESTRATOR"
echo "================================================"
echo ""
echo "  Model:     $MODEL"
echo "  Auto-Mode: $AUTO_MODE"
echo "  Workers:   $(tmux list-sessions 2>/dev/null | wc -l | tr -d ' ') tmux sessions"
echo ""
echo "  Extensions:"
echo "    - orchestrator-discipline (code write blocker)"
echo "    - orchestrator-agents (tmux worker lifecycle)"
echo "    - orchestrator-state (persistence + devlog)"
echo "    - orchestrator-dashboard (TUI footer)"
echo ""
echo "================================================"
echo ""

# Launch Pi with all extensions
exec pi \
    --model "$MODEL" \
    -e extensions/orchestrator-discipline.ts \
    -e extensions/orchestrator-agents.ts \
    -e extensions/orchestrator-state.ts \
    -e extensions/orchestrator-dashboard.ts
