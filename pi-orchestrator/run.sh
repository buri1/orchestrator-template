#!/bin/bash
# ============================================================================
# L-Thread Pi Orchestrator — Launch Script
# ============================================================================
# Two modes:
#   ORCHESTRATOR: Pi IS the orchestrator (uses tmux tools directly)
#   SUPERVISOR:   Pi WATCHES the orchestrator (deterministic harness)
#
# Usage:
#   ./run.sh                          # Supervisor mode (default, recommended)
#   ./run.sh --mode orchestrator      # Pi is the orchestrator
#   ./run.sh --mode supervisor        # Explicit supervisor mode
#   ./run.sh --auto                   # Auto-mode (no user prompts)
#   ./run.sh --model opus             # Use Opus for Pi's LLM
#   ./run.sh --model haiku            # Use Haiku (cheapest supervisor)
#
# Prerequisites:
#   - Pi Agent: npm install -g @mariozechner/pi-coding-agent
#   - tmux: brew install tmux
#   - Claude Code: npm install -g @anthropic-ai/claude-code
# ============================================================================

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Parse args
MODEL="sonnet"
AUTO_MODE="DISABLED"
MODE="supervisor"

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
        --mode)
            MODE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./run.sh [--mode supervisor|orchestrator] [--auto] [--model <model>]"
            exit 1
            ;;
    esac
done

# Set AUTO_MODE
mkdir -p _bmad .bmad
echo "$AUTO_MODE" > .bmad/AUTO_MODE

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
echo "  Mode:      $MODE"
echo "  Model:     $MODEL"
echo "  Auto-Mode: $AUTO_MODE"
echo "  Workers:   $(tmux list-sessions 2>/dev/null | wc -l | tr -d ' ') tmux sessions"
echo ""

if [ "$MODE" = "supervisor" ]; then
    echo "  SUPERVISOR MODE"
    echo "  Pi watches the orchestrator. Deterministic heartbeat."
    echo "  The orchestrator is Claude Opus in a tmux session."
    echo ""
    echo "  Extensions:"
    echo "    - supervisor (heartbeat, nudge, restart, state machine)"
    echo "    - orchestrator-dashboard (TUI footer)"
    echo ""
    echo "================================================"
    echo ""

    exec pi \
        --model "$MODEL" \
        -e extensions/supervisor.ts

elif [ "$MODE" = "orchestrator" ]; then
    echo "  ORCHESTRATOR MODE"
    echo "  Pi IS the orchestrator. Uses tmux tools directly."
    echo ""
    echo "  Extensions:"
    echo "    - orchestrator-discipline (code write blocker)"
    echo "    - orchestrator-agents (tmux worker lifecycle)"
    echo "    - orchestrator-state (persistence + devlog)"
    echo "    - orchestrator-dashboard (TUI footer)"
    echo ""
    echo "================================================"
    echo ""

    exec pi \
        --model "$MODEL" \
        -e extensions/orchestrator-discipline.ts \
        -e extensions/orchestrator-agents.ts \
        -e extensions/orchestrator-state.ts \
        -e extensions/orchestrator-dashboard.ts
else
    echo "ERROR: Unknown mode '$MODE'. Use 'supervisor' or 'orchestrator'."
    exit 1
fi
