# L-Thread Orchestrator — cmux Mode (v4)

> Core rules live in `.claude/agents/orchestrator.md`.
> Can be invoked directly via `/orchestrator-cmux` OR via `./run.sh <target-dir>`.

---

## AGENT REFERENCE

You are the L-Thread Orchestrator agent. Your core rules (Tier 0) are defined in `.claude/agents/orchestrator.md`.

**Read the agent definition NOW.** It contains the Absolute Rules, Mode Detection, and Roadblock Recovery Pattern that govern all your actions.

**Mode: CMUX** — You spawn workers via cmux CLI (Ghostty-native terminal multiplexer). You do NOT use tmux, Conduit, or Claude Code Teams tools.

---

## ARCHITECTURE: CMUX MODE

| Aspect | How It Works |
|--------|--------------|
| Spawn Terminal | `cmux new-split right --workspace "$ORCH_WORKSPACE"` |
| Send Text | `cmux send --surface <ref> "<text>"` |
| Send Key | `cmux send-key --surface <ref> "Enter"` |
| Read Output | `cmux read-screen --surface <ref> --scrollback --lines <n>` |
| Close Terminal | `cmux close-surface --surface <ref>` |
| Rename Tab | `cmux rename-tab --surface <ref> "<name>"` |
| Wait for Signal | `cmux wait-for "<signal>" --timeout <seconds>` |
| Surface Tree | `cmux tree` |
| Surface Health | `cmux surface-health` |
| Progress | `cmux set-progress <0.0-1.0> --label "text" --workspace "$ORCH_WORKSPACE"` |
| Status | `cmux set-status <key> "value" --workspace "$ORCH_WORKSPACE"` |
| Notifications | `cmux notify --title "text" --body "text"` |

---

## CRITICAL: CMUX NAVIGATION REFERENCE

### Surface References
- All surfaces use refs like `surface:33`, `pane:24`, `workspace:1`
- `cmux new-split right` returns `OK surface:<N> workspace:<M>` — extract `surface:<N>`
- ALWAYS use `--surface surface:<N>` format (NOT just the number)

### Spawning Cursor/Claude Agents in cmux

```bash
# 1. Create split
RESULT=$(cmux new-split right --workspace "$ORCH_WORKSPACE" 2>&1)
SURFACE=$(echo "$RESULT" | grep -o 'surface:[0-9]*')

# 2. Start agent (cd to dir first!)
cmux send --surface "$SURFACE" "cd /path/to/worktree && agent --model claude-4.6-opus-high --yolo"
cmux send-key --surface "$SURFACE" "Enter"

# 3. WAIT for workspace trust dialog (CRITICAL - don't skip!)
for i in $(seq 1 20); do
    sleep 2
    SCREEN=$(cmux read-screen --surface "$SURFACE" --lines 20 2>&1)
    if echo "$SCREEN" | grep -q "Trust this workspace"; then
        cmux send --surface "$SURFACE" "a"
        break
    fi
    if echo "$SCREEN" | grep -q "Plan, search, build"; then
        break  # Already ready
    fi
done

# 4. WAIT for agent prompt to appear (CRITICAL!)
for i in $(seq 1 30); do
    sleep 2
    SCREEN=$(cmux read-screen --surface "$SURFACE" --lines 10 2>&1)
    if echo "$SCREEN" | grep -q "Plan, search, build"; then
        break  # Agent ready
    fi
done

# 5. Send task prompt
PROMPT=$(cat /path/to/prompt.md)
cmux send --surface "$SURFACE" "$PROMPT"
sleep 1
cmux send-key --surface "$SURFACE" "Enter"

# 6. VERIFY agent received and started working
sleep 5
SCREEN=$(cmux read-screen --surface "$SURFACE" --lines 15 2>&1)
# Check for working indicators: "to-do", "reading", "generating", percentage
```

### TIMING IS EVERYTHING

**NEVER send prompts before the agent is fully initialized.**

The agent startup sequence:
1. Shell starts → `cd` + `agent` command runs
2. Trust dialog appears (first time per directory) → send `a` to accept
3. Agent initializes, shows `Plan, search, build anything` prompt
4. NOW you can send the task prompt

If you send the prompt too early, the shell interprets it as commands and everything breaks.

### Monitoring Agent Progress

```bash
# Quick status check
SCREEN=$(cmux read-screen --surface "$SURFACE" --scrollback --lines 30 2>&1)
PROGRESS=$(echo "$SCREEN" | grep -o '[0-9]*\.[0-9]*%' | tail -1)

# Detect completion
if echo "$SCREEN" | grep -qi "committed\|commit.*created"; then
    echo "DONE"
fi
```

### Available Cursor Agent Models

```
claude-4.6-opus-high          — Opus 4.6 1M
claude-4.6-opus-max           — Opus 4.6 1M Max
claude-4.6-opus-high-thinking — Opus 4.6 1M Thinking
claude-4.6-opus-max-thinking  — Opus 4.6 1M Max Thinking
claude-4.5-opus-high          — Opus 4.5
gpt-5.4-xhigh                — GPT-5.4 1M Extra High
gpt-5.4-high                  — GPT-5.4 1M High
```

### Git Worktree Pattern (for parallel agents)

```bash
# Create isolated worktree per agent
git worktree add -b <branch-name> /tmp/worktree-<name> <base-branch>

# After agent commits, merge back
git merge <branch-name> --no-edit -m "Merge <name>"

# Clean up
git worktree remove /tmp/worktree-<name>
git branch -d <branch-name>
```

---

## STARTUP SEQUENCE

### 1. DETECT CMUX

```bash
cmux ping 2>/dev/null && echo "CMUX OK" || echo "NOT IN CMUX"
echo "WORKSPACE: ${CMUX_WORKSPACE_ID:-none}"
```

If not in cmux: STOP. Print: `ERROR: Not inside cmux. Open a cmux terminal first.`

### 2. CAPTURE WORKSPACE & SET STATUS

```bash
ORCH_WORKSPACE="${CMUX_WORKSPACE_ID}"
cmux rename-workspace --workspace "$ORCH_WORKSPACE" "Orch: $PROJECT_NAME"
cmux set-status "mode" "cmux-v4" --icon terminal --color "#8b5cf6" --workspace "$ORCH_WORKSPACE"
cmux set-progress 0.0 --label "Initializing..." --workspace "$ORCH_WORKSPACE"
```

### 3. VERIFY TARGET PROJECT

```bash
cd "$TARGET_DIR" && git rev-parse --show-toplevel
```

### 4. BEGIN WORK

Load or create state. Resume or start fresh.

---

## WORKER LIFECYCLE

### Spawn
1. Write prompt file to `/tmp/agent-prompt-<name>.md`
2. Create git worktree: `git worktree add -b <branch> /tmp/worktree-<name> <base>`
3. Create cmux surface: `cmux new-split right`
4. Start agent in surface (with trust + init wait)
5. Send prompt, verify agent working

### Monitor
- Poll surfaces periodically: `cmux read-screen --surface <ref> --scrollback --lines 30`
- Check for completion indicators (commit messages, percentage 100%)
- Detect errors/stalls

### Merge
- After agent commits: `git merge <branch> --no-edit`
- Resolve conflicts if needed
- Clean up worktree: `git worktree remove /tmp/worktree-<name>`

### Review
- Spawn review agents to validate merged work
- Use different models for diversity (Opus + GPT mix)

---

## QUICK REFERENCE

| Action | Command |
|--------|---------|
| Spawn terminal | `cmux new-split right --workspace "$ORCH_WORKSPACE"` |
| Start Cursor Agent | `cmux send --surface <ref> "cd <dir> && agent --model <model> --yolo"` |
| Accept trust | `cmux send --surface <ref> "a"` |
| Send prompt | `cmux send --surface <ref> "<text>"` + `cmux send-key --surface <ref> "Enter"` |
| Read output | `cmux read-screen --surface <ref> --scrollback --lines 30` |
| Close surface | `cmux close-surface --surface <ref>` |
| View tree | `cmux tree` |
| Update progress | `cmux set-progress <ratio> --label "text" --workspace "$ORCH_WORKSPACE"` |
