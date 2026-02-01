#!/bin/bash
# Quick Setup for L-Thread Orchestrator
# Run this after cloning the template

set -e

echo "=== L-Thread Orchestrator Setup ==="
echo ""

# Create runtime directories
echo "[1/4] Creating directories..."
mkdir -p .bmad

# Enable Auto-Mode (ask user)
echo ""
echo "[2/4] Auto-Mode Configuration"
echo "Auto-Mode runs the orchestrator fully autonomously without user prompts."
read -p "Enable Auto-Mode? (y/n) [y]: " AUTO_MODE
AUTO_MODE=${AUTO_MODE:-y}

if [[ "$AUTO_MODE" =~ ^[Yy]$ ]]; then
    echo "ENABLED" > .bmad/AUTO_MODE
    echo "  -> Auto-Mode ENABLED"
else
    rm -f .bmad/AUTO_MODE
    echo "  -> Auto-Mode DISABLED (manual confirmations)"
fi

# Copy state template
echo ""
echo "[3/4] Initializing state..."
if [ -f "_bmad/orchestrator-state.json" ]; then
    echo "  -> State file already exists, skipping"
else
    cp _bmad/orchestrator-state.template.json _bmad/orchestrator-state.json
    echo "  -> Created orchestrator-state.json"
fi

# Create devlog
echo ""
echo "[4/4] Creating devlog..."
if [ -f ".bmad/devlog.md" ]; then
    echo "  -> Devlog already exists, skipping"
else
    cat > .bmad/devlog.md << 'EOF'
# Orchestrator Devlog

## Session Start

EOF
    echo "  -> Created devlog.md"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Open a Conduit terminal: conduit"
echo "  2. Start Claude: claude"
echo "  3. Invoke orchestrator: /orchestrator"
echo "  4. Say 'start' to begin the loop"
echo ""
echo "For configuration, edit:"
echo "  - .claude/commands/orchestrator.md (main logic)"
echo "  - .claude/settings.local.json (permissions)"
echo ""
