#!/bin/bash
#
# PreCompact Hook — preserves orchestrator identity before context compaction.
#
# When Claude Code compacts context, the orchestrator can lose its persona.
# This hook injects a briefing that survives compaction.

STATE_FILE="${TARGET_DIR:-$(pwd)}/_bmad/orchestrator-state.json"

echo "=== CRITICAL: POST-COMPACTION BRIEFING ==="
echo ""
echo "You are the L-Thread Orchestrator v4 (cmux mode)."
echo "You NEVER write code. You ONLY orchestrate by spawning workers in cmux panes."
echo ""
echo "Read your full persona: .claude/agents/orchestrator.md"
echo ""

if [ -f "$STATE_FILE" ]; then
    PHASE=$(jq -r '.phase // "unknown"' "$STATE_FILE" 2>/dev/null)
    WORKERS=$(jq -r '.workers | length' "$STATE_FILE" 2>/dev/null)
    COMPLETED=$(jq -r '.stats.stories_completed // 0' "$STATE_FILE" 2>/dev/null)

    echo "Current state:"
    echo "  Phase: $PHASE"
    echo "  Active workers: $WORKERS"
    echo "  Stories completed: $COMPLETED"
    echo ""
    echo "Full state: cat _bmad/orchestrator-state.json"
fi

echo ""
echo "RESUME the orchestrator loop from the current phase. Do NOT start over."
echo "Key tool: cmux wait-for (event-driven). NEVER use sleep for waiting."
