# L-Thread Orchestrator — cmux Mode (v4)

> Launcher for the cmux-based orchestrator. Core rules live in `.claude/agents/orchestrator.md`.

## STARTUP SEQUENCE

### 1. DETECT CMUX

```bash
cmux ping 2>/dev/null && echo "CMUX OK" || echo "NOT IN CMUX"
```

Also check environment:
```bash
echo "WORKSPACE: ${CMUX_WORKSPACE_ID:-none}"
echo "SURFACE: ${CMUX_SURFACE_ID:-none}"
```

If not in cmux: stop. Print: `ERROR: Not inside cmux. Launch via ./run.sh <project-dir>`

### 2. DETECT TARGET PROJECT

```bash
echo "${TARGET_DIR:-}"
```

If empty, ask the user for the project path. Then verify:
```bash
cd "$TARGET_DIR" && git rev-parse --show-toplevel && gh repo view --json nameWithOwner -q .nameWithOwner
```

If not a git repo or `gh repo view` fails: stop with error.

### 3. SET UP SIDEBAR

```bash
cmux rename-workspace "Orchestrator"
cmux set-status "mode" "cmux-v4" --icon terminal --color "#8b5cf6"
cmux set-status "target" "$(basename $TARGET_DIR)" --icon folder
cmux set-progress 0.0 --label "Initializing..."
cmux log --source orchestrator "Starting L-Thread Orchestrator v4 (cmux mode)"
```

### 4. VERIFY STOP HOOK

Check that the Claude Code Stop hook is configured for agent completion signaling:
```bash
cat "$CLAUDE_PROJECT_DIR/.claude/settings.local.json" | jq '.hooks.Stop'
```

If missing, warn: the orchestrator will fall back to polling `read-screen` instead of event-driven `wait-for`.

### 5. CHECK AUTO_MODE

```bash
cat "$TARGET_DIR/.bmad/AUTO_MODE" 2>/dev/null
```

If "ENABLED": set `AUTO_MODE = true`. Never pause for user input.

### 6. LOAD OR INITIALIZE STATE

Read `_bmad/orchestrator-state.json` from the TARGET project. If missing, create from template.

### 7. RESUME OR START FRESH

**If `phase != "idle"`**: Resume from persisted phase.
- Check surfaces still exist: `cmux surface-health`
- Dead workers: remove from state, log to history
- Active workers: resume waiting via `cmux wait-for`

**If `phase == "idle"`**: Start fresh from the next story.

### 8. LOAD AGENT PERSONA

Read `.claude/agents/orchestrator.md` NOW. It contains Absolute Rules, CRUD lifecycle, the full loop. All rules in that file govern your behavior.

**Mode: CMUX** — Spawn workers via `cmux new-split`. Do NOT use tmux or Task tools.

### 9. DISPLAY STATUS AND BEGIN

```
L-Thread Orchestrator v4 (cmux Mode)
Target:    <project-name> (<repo>)
Directory: <target-dir>
AUTO_MODE: <ENABLED|DISABLED>
Progress:  <X done, Y skipped>
Phase:     <current phase>

[RESUMING]: Worker <name> active in surface:<ref>, phase: <phase>
[FRESH]:    Next story: <story-id> - <title>
```

Update sidebar:
```bash
cmux set-progress <ratio> --label "<X>/<total> stories"
cmux notify --title "Orchestrator Ready" --body "Target: <project-name>"
```

If AUTO_MODE: begin immediately. Otherwise: wait for "start".

---

## QUICK REFERENCE

| Action | Command |
|--------|---------|
| Spawn worker | `cmux new-split right --json` |
| Start Claude | `cmux send --surface <ref> "ORCHY_SIGNAL=... claude --dangerously-skip-permissions\n"` |
| Send task | `cmux send --surface <ref> "<prompt>\n"` |
| Wait for done | `cmux wait-for "agent-<name>-done" --timeout 1800` |
| Read output | `cmux read-screen --surface <ref> --scrollback --lines 100` |
| Close worker | `cmux close-surface --surface <ref>` |
| State file | `_bmad/orchestrator-state.json` |
| Agent rules | `.claude/agents/orchestrator.md` |
| Sidebar status | `cmux set-status <key> "value"` |
| Progress | `cmux set-progress <0.0-1.0> --label "text"` |
