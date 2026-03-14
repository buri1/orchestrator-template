# L-Thread Orchestrator -- tmux Mode (v3)

> Launcher for the tmux-based orchestrator. Core rules live in `.claude/agents/orchestrator.md`.

## STARTUP SEQUENCE

### 1. DETECT TMUX
```bash
tmux display-message -p '#{session_name}' 2>/dev/null || echo "NOT IN TMUX"
```
If "NOT IN TMUX": stop. Print: `ERROR: Not inside tmux. Launch via ./run-tmux.sh <project-dir>`

### 2. DETECT TARGET PROJECT
```bash
echo "${TARGET_DIR:-}"
```
If empty, ask the user for the project path. Then verify:
```bash
cd "$TARGET_DIR" && git rev-parse --show-toplevel && gh repo view --json nameWithOwner -q .nameWithOwner
```
If not a git repo or `gh repo view` fails: stop with error.

### 3. CHECK AUTO_MODE
```bash
cat "$TARGET_DIR/.bmad/AUTO_MODE" 2>/dev/null
```
If "ENABLED": set `AUTO_MODE = true`. Never pause for user input. Roadblocks: skip + log + continue.

### 4. LOAD OR INITIALIZE STATE
Read `_bmad/orchestrator-state.json`. If missing, copy from template:
```bash
cp _bmad/orchestrator-state.template.json _bmad/orchestrator-state.json
```
Populate `project.name`, `project.dir`, `project.repo`, and `auto_mode` from detected values.

### 5. RESUME OR START FRESH
**If `phase != "idle"`**: Resume from persisted phase.
- Verify workers exist: `tmux has-session -t <name> 2>/dev/null`
- Dead workers: remove from state, log to history
- Active workers: resume monitoring via `tmux capture-pane`

**If `phase == "idle"`**: Start fresh from the next story.

### 6. LOAD AGENT PERSONA
Read `.claude/agents/orchestrator.md` NOW. It contains Absolute Rules, Mode Detection, Roadblock Recovery, and the full loop. All rules in that file govern your behavior.

**Mode: TMUX** -- Spawn workers via `tmux new-session`. Do NOT use Conduit CLI or Task tools.

### 7. DISPLAY STATUS AND BEGIN
```
L-Thread Orchestrator v3 (tmux Mode)
Target:    <project-name> (<repo>)
Directory: <target-dir>
AUTO_MODE: <ENABLED|DISABLED>
Progress:  <X done, Y skipped>
Phase:     <current phase>

[RESUMING]: Worker <name> active, phase: <phase>
[FRESH]:    Next story: <story-id> - <title>
```
If AUTO_MODE: begin immediately. Otherwise: wait for "start".

---

## QUICK REFERENCE

| Action | Command |
|--------|---------|
| Spawn worker | `tmux new-session -d -s <name> -c <dir>` |
| Start Claude | `tmux send-keys -t <name> 'unset CLAUDECODE && claude --dangerously-skip-permissions' Enter` |
| Send task | `tmux send-keys -t <name> '<prompt>' Enter` |
| Read output | `tmux capture-pane -t <name> -p -S -50` |
| Check alive | `tmux list-panes -t <name> -F '#{pane_current_command}'` |
| Kill worker | `tmux send-keys -t <name> '/exit' Enter; sleep 3; tmux kill-session -t <name>` |
| State file | `_bmad/orchestrator-state.json` |
| Agent rules | `.claude/agents/orchestrator.md` |
