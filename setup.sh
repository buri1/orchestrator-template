#!/bin/bash
# L-Thread Orchestrator -- Global Installation Script
#
# Installs the orchestrator agent, commands, and hooks to ~/.claude/
# so they are available in ALL projects (not just this repo).
#
# Usage:
#   ./setup.sh           # Install with symlinks (auto-update)
#   ./setup.sh --copy    # Install with copies (static)
#   ./setup.sh --remove  # Uninstall
#
# What gets installed:
#   ~/.claude/agents/orchestrator.md        (Custom Agent)
#   ~/.claude/commands/orchestrator.md      (Conduit Mode command)
#   ~/.claude/commands/orchestrator-teams.md (Teams Mode command)
#   ~/.claude/commands/roadblock-recovery.md (Roadblock Recovery command)
#
# What does NOT get installed (project-specific):
#   .bmad/scripts/*      (Hooks -- configure per project)
#   _bmad/*              (State, briefings -- project-specific)
#   BMAD commands         (Separate product)

set -e

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
BACKUP_DIR="$CLAUDE_DIR/.orchestrator-backup"
INSTALL_MODE="symlink"  # default

# === Parse arguments ===
for arg in "$@"; do
    case $arg in
        --copy)
            INSTALL_MODE="copy"
            ;;
        --remove|--uninstall)
            INSTALL_MODE="remove"
            ;;
        --help|-h)
            echo "L-Thread Orchestrator -- Global Installation"
            echo ""
            echo "Usage:"
            echo "  ./setup.sh           Install with symlinks (recommended, auto-update)"
            echo "  ./setup.sh --copy    Install with file copies (static)"
            echo "  ./setup.sh --remove  Uninstall orchestrator files"
            echo ""
            echo "Installed files:"
            echo "  ~/.claude/agents/orchestrator.md"
            echo "  ~/.claude/commands/orchestrator.md"
            echo "  ~/.claude/commands/orchestrator-teams.md"
            echo "  ~/.claude/commands/roadblock-recovery.md"
            exit 0
            ;;
        *)
            echo "Unknown argument: $arg"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# === File mapping: source -> destination ===
declare -a FILES=(
    ".claude/agents/orchestrator.md:agents/orchestrator.md"
    ".claude/commands/orchestrator.md:commands/orchestrator.md"
    ".claude/commands/orchestrator-teams.md:commands/orchestrator-teams.md"
    ".claude/commands/roadblock-recovery.md:commands/roadblock-recovery.md"
    ".claude/commands/tmux-recovery.md:commands/tmux-recovery.md"
)

# === Uninstall ===
if [ "$INSTALL_MODE" = "remove" ]; then
    echo "=== L-Thread Orchestrator -- Uninstall ==="
    echo ""

    for file_pair in "${FILES[@]}"; do
        DEST="$CLAUDE_DIR/${file_pair#*:}"
        if [ -f "$DEST" ] || [ -L "$DEST" ]; then
            rm -f "$DEST"
            echo "  Removed: $DEST"
        fi
    done

    # Restore backups if they exist
    if [ -d "$BACKUP_DIR" ]; then
        echo ""
        echo "Restoring backups from $BACKUP_DIR..."
        for file_pair in "${FILES[@]}"; do
            DEST_REL="${file_pair#*:}"
            BACKUP="$BACKUP_DIR/$DEST_REL"
            DEST="$CLAUDE_DIR/$DEST_REL"
            if [ -f "$BACKUP" ]; then
                cp "$BACKUP" "$DEST"
                echo "  Restored: $DEST"
            fi
        done
        rm -rf "$BACKUP_DIR"
    fi

    echo ""
    echo "Orchestrator uninstalled."
    exit 0
fi

# === Install ===
echo "=== L-Thread Orchestrator v2.0 -- Global Installation ==="
echo ""
echo "Mode: $INSTALL_MODE"
echo "Source: $SCRIPT_DIR"
echo "Target: $CLAUDE_DIR"
echo ""

# Create directories
echo "[1/4] Creating directories..."
mkdir -p "$CLAUDE_DIR/agents"
mkdir -p "$CLAUDE_DIR/commands"
echo "  OK"

# Backup existing files
echo ""
echo "[2/4] Checking for existing files..."
BACKUP_NEEDED=false
for file_pair in "${FILES[@]}"; do
    DEST="$CLAUDE_DIR/${file_pair#*:}"
    if [ -f "$DEST" ] && [ ! -L "$DEST" ]; then
        BACKUP_NEEDED=true
        break
    fi
done

if [ "$BACKUP_NEEDED" = true ]; then
    echo "  Backing up existing files to $BACKUP_DIR/"
    mkdir -p "$BACKUP_DIR/agents"
    mkdir -p "$BACKUP_DIR/commands"
    for file_pair in "${FILES[@]}"; do
        DEST_REL="${file_pair#*:}"
        DEST="$CLAUDE_DIR/$DEST_REL"
        if [ -f "$DEST" ] && [ ! -L "$DEST" ]; then
            cp "$DEST" "$BACKUP_DIR/$DEST_REL"
            echo "    Backed up: $DEST_REL"
        fi
    done
else
    echo "  No existing files to backup"
fi

# Install files
echo ""
echo "[3/4] Installing files..."
for file_pair in "${FILES[@]}"; do
    SRC="$SCRIPT_DIR/${file_pair%%:*}"
    DEST_REL="${file_pair#*:}"
    DEST="$CLAUDE_DIR/$DEST_REL"

    if [ ! -f "$SRC" ]; then
        echo "  WARNING: Source not found: $SRC"
        continue
    fi

    # Remove existing (file or symlink)
    rm -f "$DEST"

    if [ "$INSTALL_MODE" = "symlink" ]; then
        ln -s "$SRC" "$DEST"
        echo "  Linked: $DEST_REL -> $SRC"
    else
        cp "$SRC" "$DEST"
        echo "  Copied: $DEST_REL"
    fi
done

# Verify installation
echo ""
echo "[4/4] Verifying installation..."
ALL_OK=true
for file_pair in "${FILES[@]}"; do
    DEST="$CLAUDE_DIR/${file_pair#*:}"
    if [ -f "$DEST" ] || [ -L "$DEST" ]; then
        echo "  OK: ${file_pair#*:}"
    else
        echo "  MISSING: ${file_pair#*:}"
        ALL_OK=false
    fi
done

echo ""
if [ "$ALL_OK" = true ]; then
    echo "=== Installation Complete ==="
else
    echo "=== Installation completed with warnings ==="
fi

echo ""
echo "Next steps:"
echo "  1. In your project, create runtime files:"
echo "     mkdir -p .bmad _bmad"
echo "     echo 'ENABLED' > .bmad/AUTO_MODE"
echo "     cp _bmad/orchestrator-state.template.json _bmad/orchestrator-state.json"
echo ""
echo "  2. Configure hooks in .claude/settings.local.json:"
echo '     "hooks": {'
echo '       "SessionStart": [{"hooks": [{"type": "command",'
echo '         "command": "bash \"$CLAUDE_PROJECT_DIR/.bmad/scripts/orchestrator-session-start.sh\""}]}],'
echo '       "PreCompact": [{"hooks": [{"type": "command",'
echo '         "command": "bash \"$CLAUDE_PROJECT_DIR/.bmad/scripts/orchestrator-handoff.sh\""}]}]'
echo '     }'
echo ""
echo "  3. Start orchestrating:"
echo "     Conduit Mode: /orchestrator"
echo "     Teams Mode:   /orchestrator-teams"
echo ""
if [ "$INSTALL_MODE" = "symlink" ]; then
    echo "  Symlink mode: Changes to $SCRIPT_DIR will be reflected automatically."
fi
