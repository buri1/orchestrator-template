# Getting Started with L-Thread Orchestrator

This guide walks you through setting up and running your first orchestrated development session.

## What is the L-Thread Orchestrator?

The L-Thread Orchestrator is an autonomous agent that manages other Claude agents to implement features from GitHub Issues. It runs continuously, spawning Dev Agents for each story, monitoring their progress, running code reviews, and handling the merge process.

**Key benefits:**
- Unattended operation for hours
- Sequential story implementation
- Automated code review cycles
- Context preservation across compactions

## Prerequisites

### Required Tools

1. **Conduit CLI** - Terminal multiplexer for agent management
   ```bash
   # Check if installed
   conduit --version
   ```

2. **Claude Code CLI** - The AI assistant
   ```bash
   # Check if installed
   claude --version
   ```

3. **GitHub CLI** - For issue and PR management
   ```bash
   # Check if authenticated
   gh auth status
   ```

4. **jq** - JSON processor
   ```bash
   # Install on macOS
   brew install jq
   ```

## Project Setup

### 1. Clone the Template

```bash
git clone <your-repo> my-awesome-project
cd my-awesome-project
```

### 2. Run Setup

```bash
./setup/quick-setup.sh
```

This will:
- Create runtime directories (`.bmad/`)
- Ask about Auto-Mode configuration
- Initialize the state file
- Create the devlog

### 3. Configure for Your Project

Edit `.claude/commands/orchestrator.md` to customize:

**GitHub Issue Labels** (Step 1):
```bash
# Change from:
gh issue list --label "phase:1" --state open ...

# To your labels:
gh issue list --label "sprint:current" --state open ...
```

**Story Branch Pattern**:
```bash
# Default pattern
gh pr list --head "feature/story-X.Y" ...

# Your pattern
gh pr list --head "feat/issue-$ISSUE_NUMBER" ...
```

## Running the Orchestrator

### 1. Open Conduit

```bash
conduit
```

Conduit provides terminal pane management that the orchestrator uses to spawn agents.

### 2. Start Claude

```bash
claude
```

Or with auto-permissions (for unattended use):
```bash
claude --dangerously-skip-permissions
```

### 3. Invoke Orchestrator

```
/orchestrator
```

You'll see:
```
L-Thread Orchestrator Ready

Progress: 0/X stories complete
Next: #1 - [Story Title]

Say "start" to begin automated loop.
```

### 4. Start the Loop

```
> start
```

The orchestrator will:
1. Spawn a Dev Agent for the first story
2. Wait for PR creation
3. Run code review
4. Handle fixes if needed
5. Auto-merge when ready
6. Continue to next story

## Auto-Mode vs Manual Mode

### Auto-Mode (Recommended for overnight runs)

Enable:
```bash
echo "ENABLED" > .bmad/AUTO_MODE
```

Behavior:
- No user prompts
- Roadblocks are skipped and logged
- Loop never stops for input

### Manual Mode

Disable:
```bash
rm .bmad/AUTO_MODE
```

Behavior:
- User confirmations at key points
- Pause on errors
- More control over the process

## Monitoring Progress

### Devlog

The orchestrator logs all activity to `.bmad/devlog.md`:

```markdown
### [10:15] Story 0.1 - Project Bootstrap
- Issue: #15
- PR: #42
- Duration: 45 minutes
- Status: Merged
```

### Terminal Visibility

Agents run in visible Conduit panes, so you can watch their work in real-time.

### Status Command

While the orchestrator runs:
```
> status
```

## Troubleshooting

### "Conduit not available"

Make sure you're running inside a Conduit terminal:
```bash
conduit pane-list
```

### Agent Stuck

If an agent seems stuck:
1. Check the agent's terminal pane
2. Read output: `conduit terminal-read -p <pane-id>`
3. Kill if needed: `conduit pane-close -p <pane-id>`

### Context Compaction

When Claude's context fills up, the PreCompact hook automatically:
1. Spawns a new Claude session
2. Starts `/orchestrator` in the new session
3. Closes the old pane

Your orchestrator continues with fresh context.

## Next Steps

- Read the [Architecture Decisions](../_bmad/extensions/conduit-orchestrator/decisions.md)
- Customize the [Main Orchestrator](../.claude/commands/orchestrator.md)
- Check the [State Machine](../_bmad/extensions/conduit-orchestrator/concept/state-machine.md)
