# L-Thread Orchestrator Template v2.0

> Autonomous Multi-Agent Orchestration System for Claude Code.
> Supports both Conduit CLI (sequential) and Claude Code Teams (parallel) modes.

## What Is This?

The L-Thread Orchestrator is an autonomous agent management system that can run unattended for hours. It spawns and manages Dev Agents, handles code review cycles, and automates the merge/fix workflow -- all without writing a single line of code itself.

**The orchestrator is the conductor, not the musician.** It delegates all development work to sub-agents and focuses entirely on coordination, quality gates, and progress tracking.

### Key Capabilities

| Capability | Description |
|-----------|-------------|
| **Triple Mode** | Conduit CLI (sequential), Claude Code Teams (parallel), or Tmux (crash-protected) |
| **Autonomous Loop** | Picks up tasks, spawns agents, reviews, merges, continues |
| **Roadblock Recovery** | Checks documented incidents, provides targeted fix instructions |
| **E2E Gate** | Chrome DevTools MCP testing required before marking tasks done |
| **Context Preservation** | State persists across compaction via hooks |
| **Auto-Mode** | Fully autonomous with roadblock skip-and-continue |

## Architecture

```
+------------------------------------------+
|        L-THREAD ORCHESTRATOR             |
|     (Custom Agent + Command)             |
|                                          |
|  Tier 0: Absolute Rules, Mode Detection  |
|  Tier 1: Session State (injected)        |
|  Tier 2: FutureLearnings (on-demand)     |
+------------------------------------------+
         |                    |
    Conduit Mode         Teams Mode
         |                    |
   +----------+      +-----------------+
   | Conduit  |      | Claude Code     |
   | CLI      |      | Agent Teams     |
   +----------+      +-----------------+
         |                    |
   Sequential:           Parallel:
   1 agent at a time     2-3 agents + reviewer
```

### Custom Agent vs Commands

The **Custom Agent** (`.claude/agents/orchestrator.md`) defines the core persona, rules, and patterns:
- Absolute Rules (never write code, E2E gate, auto-mode, state management)
- Mode Detection (auto-detect Conduit vs Teams)
- Roadblock Recovery Pattern
- State Management schemas
- Orchestrator Loop (both modes)

The **Commands** provide mode-specific workflows:
- `/orchestrator` -- Conduit CLI mode with sequential execution
- `/orchestrator-teams` -- Teams mode with parallel execution
- `/roadblock-recovery` -- Incident lookup and fix instructions

### Tiered Context System

Not all context needs to be loaded at all times. The orchestrator uses three tiers:

| Tier | When Loaded | Contents |
|------|-------------|----------|
| **Tier 0** | Always | Absolute Rules, Mode Detection, Core Loop |
| **Tier 1** | SessionStart hook | Current state, environment, AUTO_MODE, branch info |
| **Tier 2** | On-demand | FutureLearnings (roadblocks), Sprint Briefings (new sprint) |

This reduces context consumption and keeps the orchestrator focused.

### Roadblock Recovery

When an agent hits a problem, the orchestrator:

1. Loads `memory/FutureLearnings.md` (documented incidents)
2. Matches the error to known INC-XXX entries
3. Sends targeted fix instructions to the agent
4. If still stuck: spawns a fresh recovery agent
5. In Auto-Mode: skips after 3 failed attempts

Common incident patterns (from production use):
- **INC-001**: Database connections hanging (add `prepare: false`)
- **INC-002**: Validation schema mismatch (update Zod enum)
- **INC-013**: Chrome DevTools instability (retry 3x, file-based prompts)
- **INC-014**: E2E testing skipped (E2E is gate before Done)

## Prerequisites

- **Claude Code** CLI installed (`claude`)
- **GitHub CLI** authenticated (`gh`)
- **jq** JSON processor
- **tmux** (for Tmux Mode -- crash-protected sessions)
- **Conduit** (for Conduit Mode) or **Claude Code Teams** (for Teams Mode)

## Installation

### Global Installation (Recommended)

Install the orchestrator globally so it is available in all your projects:

```bash
git clone https://github.com/buri1/orchestrator-template.git
cd orchestrator-template

# Install with symlinks (auto-update when you pull)
./setup.sh

# Or install with copies (static)
./setup.sh --copy

# Uninstall
./setup.sh --remove
```

This installs to `~/.claude/`:
- `agents/orchestrator.md` -- Custom Agent definition
- `commands/orchestrator.md` -- Conduit Mode command
- `commands/orchestrator-teams.md` -- Teams Mode command
- `commands/roadblock-recovery.md` -- Roadblock Recovery command

### Per-Project Setup

After global installation, set up each project:

```bash
cd your-project

# 1. Create runtime directories
mkdir -p .bmad/scripts _bmad

# 2. Copy hook scripts
cp /path/to/orchestrator-template/.bmad/scripts/orchestrator-session-start.sh .bmad/scripts/
cp /path/to/orchestrator-template/.bmad/scripts/orchestrator-handoff.sh .bmad/scripts/
cp /path/to/orchestrator-template/.bmad/scripts/tmux-helpers.sh .bmad/scripts/
chmod +x .bmad/scripts/*.sh

# 3. Initialize state (pick your mode)
# Conduit mode:
cp /path/to/orchestrator-template/_bmad/orchestrator-state.template.json _bmad/orchestrator-state.json
# Tmux mode (crash-protected sessions):
cp /path/to/orchestrator-template/_bmad/orchestrator-tmux-state.template.json _bmad/orchestrator-tmux-state.template.json
cp /path/to/orchestrator-template/_bmad/orchestrator-tmux-state.template.json _bmad/orchestrator-tmux-state.json
# Edit _bmad/orchestrator-tmux-state.json to match your tmux sessions

# 4. Enable Auto-Mode (optional)
echo "ENABLED" > .bmad/AUTO_MODE

# 5. Create devlog
echo -e "# Orchestrator Devlog\n\n## Session Start" > .bmad/devlog.md

# 6. Configure hooks in .claude/settings.local.json (see below)
```

Add hooks to your project's `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(tmux:*)",
      "Bash(conduit:*)"
    ]
  },
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR/.bmad/scripts/orchestrator-session-start.sh\""
      }]
    }],
    "PreCompact": [{
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR/.bmad/scripts/orchestrator-handoff.sh\""
      }]
    }]
  }
}
```

## Usage

### Conduit Mode (Sequential)

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

The orchestrator will:
1. Pick the next open issue
2. Spawn a Dev Agent in a new Conduit pane
3. Wait for PR creation
4. Run review-fix cycles (max 3)
5. Auto-merge, E2E test, mark done
6. Continue to next issue

### Teams Mode (Parallel)

```bash
# Start Claude (no Conduit needed)
claude

# Invoke orchestrator
/orchestrator-teams

# Begin the sprint
> start
```

The orchestrator will:
1. Create a team and tasks from your issue tracker
2. Spawn 2-3 dev agents as teammates
3. Assign work and monitor via messages
4. Review, merge, E2E test in parallel
5. Continue until all tasks complete

### Tmux Mode (Crash-Protected)

Tmux mode adds crash protection to your sessions. If Conduit crashes, all Claude Code sessions inside tmux survive.

```bash
# 1. Create tmux sessions for your projects
tmux new-session -d -s myproject -c /path/to/project

# 2. Start claude inside the tmux session
tmux send-keys -t myproject 'unset CLAUDECODE && claude --dangerously-skip-permissions' Enter

# 3. Attach from any terminal (Conduit, Ghostty, iTerm, etc.)
tmux attach -t myproject

# 4. If Conduit crashes: reopen, re-attach, everything is still running
tmux attach -t myproject
```

Tmux mode coexists with Conduit -- use Conduit for the workspace UI (browser, editor, tabs) and tmux as the crash-protection layer underneath.

Recovery after a crash or system restart:
```bash
/tmux-recovery
```

This probes all expected sessions, recreates dead ones, restarts Claude, and reports status.

### Roadblock Recovery

When stuck:
```bash
/roadblock-recovery
# Describe the error/problem
```

Or the orchestrator invokes it automatically when it detects agent failures.

## Directory Structure

```
.
+-- .claude/
|   +-- agents/
|   |   +-- orchestrator.md              # Custom Agent (core persona + rules)
|   +-- commands/
|   |   +-- orchestrator.md              # Conduit Mode command
|   |   +-- orchestrator-teams.md        # Teams Mode command
|   |   +-- roadblock-recovery.md        # Roadblock Recovery command
|   |   +-- tmux-recovery.md             # Tmux session recovery command
|   +-- settings.local.json              # Permissions & hooks
+-- .bmad/
|   +-- scripts/
|       +-- orchestrator-session-start.sh # SessionStart hook (mode-agnostic)
|       +-- orchestrator-handoff.sh       # PreCompact hook (mode-agnostic)
|       +-- tmux-helpers.sh              # Tmux helper functions
+-- _bmad/
|   +-- orchestrator-state.template.json  # State file template
|   +-- extensions/                       # Extension docs and drafts
+-- setup.sh                              # Global installation script
+-- setup/
|   +-- quick-setup.sh                    # Legacy per-project setup
+-- docs/                                 # Additional documentation
+-- CHANGELOG.md                          # Version history
```

### Runtime Files (gitignored, created per session)

```
.bmad/
+-- AUTO_MODE                    # "ENABLED" for autonomous operation
+-- devlog.md                    # Session log

_bmad/
+-- orchestrator-state.json       # Conduit mode state (persists across compaction)
+-- orchestrator-teams-state.json # Teams mode state
+-- orchestrator-tmux-state.json  # Tmux mode state (session tracking)
```

## Customization

### Add Project-Specific Issue Labels

Edit the GitHub issue query in `/orchestrator` Step 5:

```bash
gh issue list --label "your-label" --state open ...
```

### Configure Target Branch

Set in your state file or briefing. Default: `main`.

### Adjust Agent Prompts

When spawning agents in Teams Mode, customize the prompt in `/orchestrator-teams` Step 7 with your project's tech stack, conventions, and CI commands.

### Add FutureLearnings

Create `memory/FutureLearnings.md` in your project with the incident template from `/roadblock-recovery`. Each documented incident helps future agents avoid the same mistakes.

## Auto-Mode

When `.bmad/AUTO_MODE` contains "ENABLED":
- No user prompts or confirmations
- All decisions made autonomously
- Roadblocks logged and skipped after 3 attempts
- Loop continues until all tasks complete or user says `stop`

### User Commands

| Command | Action |
|---------|--------|
| `start` | Begin automated loop |
| `status` | Show current state and progress |
| `pause` | Pause after current task completes |
| `stop` | Stop immediately, shutdown all agents |
| `skip` | Skip current task, continue to next |
| `reset` | Clear state, start fresh |

## Credits

- Architecture inspired by [IndyDevDan's Orchestrator Pattern](https://www.youtube.com/@indydevdan)
- Built with [Claude Code](https://claude.ai/claude-code) and [BMAD Framework](https://github.com/bmad-method/bmad)
