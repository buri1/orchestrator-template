# L-Thread Orchestrator Template

> Autonomous Agent Orchestrator for Claude Code using Conduit CLI

## Overview

The L-Thread Orchestrator is an autonomous agent management system that can run unattended for hours, spawning and managing Dev Agents to implement stories sequentially. Based on IndyDevDan's orchestrator patterns.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **L-Thread** | Long-running orchestrator loop |
| **Conduit CLI** | Terminal management for real Claude sessions |
| **Event-Driven** | No polling - uses `terminal-wait` for instant response |
| **CRUD for Agents** | Create/Read/Delete agents via Conduit |
| **Auto-Mode** | Fully autonomous operation with roadblock handling |

## Architecture

```
+----------------------------------+
|        L-THREAD ORCHESTRATOR     |
|        (main terminal)           |
+----------------------------------+
              |
              | conduit pane-split
              v
+----------------------------------+
|          DEV AGENT               |
|  (real terminal, visible)        |
|  - Full Claude session           |
|  - Implements story end-to-end   |
|  - Creates PR                    |
+----------------------------------+
```

## Prerequisites

- **Conduit**: Must run inside Conduit terminal
- **Claude Code**: `claude` CLI installed
- **GitHub CLI**: `gh` authenticated
- **jq**: JSON processor

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo> my-project
cd my-project

# Run setup
./setup/quick-setup.sh
```

### 2. Manual Setup (Alternative)

```bash
# Create runtime directories
mkdir -p .bmad

# Enable Auto-Mode (optional)
echo "ENABLED" > .bmad/AUTO_MODE

# Copy state template
cp _bmad/orchestrator-state.template.json _bmad/orchestrator-state.json

# Create devlog
echo -e "# Orchestrator Devlog\n\n## Session Start" > .bmad/devlog.md
```

### 3. Start Orchestrator

```bash
# Open Conduit terminal
conduit

# Start Claude
claude

# Invoke orchestrator
/orchestrator

# Begin the loop
> start
```

## Directory Structure

```
.
+-- .claude/
|   +-- commands/
|   |   +-- orchestrator.md         # Main orchestrator skill
|   +-- settings.local.json         # Permissions & hooks
+-- .bmad/
|   +-- scripts/
|       +-- orchestrator-handoff.sh # Pre-compact handoff
+-- _bmad/
|   +-- extensions/
|   |   +-- conduit-orchestrator/
|   |       +-- README.md           # Extension docs
|   |       +-- decisions.md        # Architecture decisions
|   |       +-- concept/            # State machine, diagrams
|   |       +-- scripts/            # Helper scripts
|   |       +-- skill/              # Skill drafts
|   +-- orchestrator-post-compaction-briefing.md
|   +-- orchestrator-state.template.json
+-- docs/
    +-- getting-started.md
```

## User Commands

| Command | Action |
|---------|--------|
| `start` | Begin automated L-Thread loop |
| `status` | Show current state |
| `pause` | Pause after current story |
| `stop` | Stop immediately, close agent |
| `skip` | Skip current story |

## Auto-Mode

When `.bmad/AUTO_MODE` contains "ENABLED":
- No user prompts or confirmations
- Roadblocks are logged and skipped
- Loop continues until all stories complete

### Roadblock Handling (Auto-Mode)

| Roadblock | Action |
|-----------|--------|
| Tests fail 3x | Skip story, continue |
| Merge conflict | Skip story, continue |
| Agent timeout | Close pane, skip, continue |
| No PR created | Close pane, skip, continue |

## Key Features

### Event-Driven (No Polling)

```bash
# WRONG - wastes time
sleep 60 && gh pr list...

# RIGHT - instant response
conduit terminal-wait -p <pane-id> -t 1800
```

### Context Preservation

PreCompact hook spawns fresh session before compaction, preserving orchestrator continuity.

### State Persistence

`_bmad/orchestrator-state.json` survives context compaction and allows recovery.

## Customization

### Add Project-Specific Labels

Edit `.claude/commands/orchestrator.md` Step 1 to change GitHub issue filters:

```bash
gh issue list --label "your-label" --state open ...
```

### Modify Review Agent

The orchestrator spawns `/bmad_bmm_code-review` by default. Change this in Step 5 of the orchestrator.

### Adjust Permissions

Edit `.claude/settings.local.json` to add/remove allowed commands.

## Credits

- Architecture based on [IndyDevDan's Orchestrator Pattern](https://www.youtube.com/@indydevdan)
- Built with [Claude Code](https://claude.ai/claude-code) and [BMAD Framework](https://github.com/bmad-method/bmad)
