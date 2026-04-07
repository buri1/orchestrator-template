# L-Thread Orchestrator — cmux + Worktree Isolation (v4.1)

> Each worker gets its own git worktree + cmux workspace. True parallel isolation.
> Core rules: `.claude/agents/orchestrator-worktree.md`

## STARTUP SEQUENCE

### 1. DETECT CMUX

```bash
cmux ping 2>/dev/null && echo "CMUX OK" || echo "NOT IN CMUX"
echo "WORKSPACE: ${CMUX_WORKSPACE_ID:-none}"
```

If not in cmux: STOP.

### 2. DETECT TARGET PROJECT

```bash
echo "${TARGET_DIR:-}"
```

If `TARGET_DIR` is NOT set, **ASK the user**:

> "Which project should I orchestrate? Provide the full path."

Then resolve and verify:
```bash
TARGET_DIR="<user-provided-path>"
cd "$TARGET_DIR" && git rev-parse --show-toplevel && gh repo view --json nameWithOwner -q .nameWithOwner
```

### 3. INSTALL STOP HOOK IN TARGET PROJECT

```bash
ORCHESTRATOR_DIR="${ORCHESTRATOR_DIR:-$(pwd)}"
STOP_HOOK_SOURCE="$ORCHESTRATOR_DIR/scripts/cmux-stop-hook.sh"
TARGET_SCRIPTS="$TARGET_DIR/_bmad/scripts"
TARGET_SETTINGS="$TARGET_DIR/.claude/settings.local.json"

mkdir -p "$TARGET_SCRIPTS" "$TARGET_DIR/.claude"
cp "$STOP_HOOK_SOURCE" "$TARGET_SCRIPTS/cmux-stop-hook.sh"
chmod +x "$TARGET_SCRIPTS/cmux-stop-hook.sh"
```

Then check/merge the Stop hook into `$TARGET_SETTINGS` (same as v4.0).

### 4. PREPARE WORKTREE DIRECTORY

```bash
WORKTREE_BASE="$HOME/.cmux/worktrees/$(basename $TARGET_DIR)"
mkdir -p "$WORKTREE_BASE"
```

Verify git worktree support:
```bash
cd "$TARGET_DIR" && git worktree list
```

### 5. CAPTURE WORKSPACE ID & SET UP SIDEBAR

**Critical**: Capture `ORCH_WORKSPACE` immediately. ALL sidebar commands MUST use `--workspace "$ORCH_WORKSPACE"` to avoid leaking status into the wrong workspace.

```bash
ORCH_WORKSPACE="${CMUX_WORKSPACE_ID}"
echo "ORCH_WORKSPACE=$ORCH_WORKSPACE"
PROJECT_NAME=$(basename "$TARGET_DIR")
cmux rename-workspace --workspace "$ORCH_WORKSPACE" "Orch: $PROJECT_NAME"
cmux set-status "mode" "cmux-v4.1-worktree" --icon terminal --color "#8b5cf6" --workspace "$ORCH_WORKSPACE"
cmux set-status "target" "$PROJECT_NAME" --icon folder --workspace "$ORCH_WORKSPACE"
cmux set-progress 0.0 --label "Initializing..." --workspace "$ORCH_WORKSPACE"
cmux log --source orchestrator "Orchestrator v4.1 (worktree isolation) starting" --workspace "$ORCH_WORKSPACE"
```

**Store `ORCH_WORKSPACE` in state** so it survives compaction. Use it for ALL subsequent `set-status`, `set-progress`, `log`, `notify` calls.

### 6. CHECK AUTO_MODE

```bash
cat "$TARGET_DIR/.bmad/AUTO_MODE" 2>/dev/null
```

### 7. LOAD OR INITIALIZE STATE

Read `$TARGET_DIR/_bmad/orchestrator-state.json`. If missing, create it with `"version": "4.1"` and `"mode": "cmux-worktree"`.

### 8. CLEANUP ORPHAN WORKTREES

On startup, check for stale worktrees from previous runs:
```bash
cd "$TARGET_DIR"
git worktree list
git worktree prune
```

Compare `git worktree list` output against `workers` in state file. Remove any worktrees not in the state.

### 9. RESUME OR START FRESH

**If `phase != "idle"`**: Resume from persisted phase.
- Check which worktrees still exist: `git worktree list`
- Check which workspaces still exist: `cmux list-workspaces`
- Dead workers (worktree gone): remove from state, log
- Alive workers (worktree exists): recreate workspace if needed, resume waiting

**If `phase == "idle"`**: Start fresh.

### 10. LOAD AGENT PERSONA

Read `.claude/agents/orchestrator-worktree.md` NOW. All rules in that file govern your behavior.

**Mode: CMUX-WORKTREE** — Each worker gets `git worktree add` + `cmux new-workspace`. NOT split panes.

### 11. DISPLAY STATUS AND BEGIN

```
L-Thread Orchestrator v4.1 (cmux + Worktree Isolation)
Target:      <project-name> (<repo>)
Directory:   <target-dir>
Worktrees:   <worktree-base>
AUTO_MODE:   <ENABLED|DISABLED>
Progress:    <X done, Y skipped>
Phase:       <current phase>
Worktrees:   <N active>

[RESUMING]: Worker <name> in worktree <path>, phase: <phase>
[FRESH]:    Next story: <story-id> - <title>
```

If AUTO_MODE: begin immediately. Otherwise: wait for "start".

---

## QUICK REFERENCE

| Action | Command |
|--------|---------|
| Create worktree | `git worktree add <path> -b <branch>` |
| Create workspace | `cmux new-workspace --cwd <worktree-path>` |
| Rename workspace | `cmux rename-workspace --workspace <ref> "W: name"` |
| Start Claude | `cmux send --workspace <ref> "ORCHY_SIGNAL=... claude --dangerously-skip-permissions\n"` |
| Wait for done | `cmux wait-for "agent-<name>-done" --timeout 1800` |
| Read output | `cmux read-screen --workspace <ref> --scrollback --lines 100` |
| Close workspace | `cmux close-workspace --workspace <ref>` |
| Remove worktree | `git worktree remove <path> --force` |
| List worktrees | `git worktree list` |
| Prune stale | `git worktree prune` |
| State file | `$TARGET_DIR/_bmad/orchestrator-state.json` |
| Agent rules | `.claude/agents/orchestrator-worktree.md` |

## KEY DIFFERENCE FROM v4.0

| v4.0 (Split Panes) | v4.1 (Worktree Isolation) |
|--|--|
| `cmux new-split right` | `git worktree add` + `cmux new-workspace` |
| All workers share one directory | Each worker has its own filesystem |
| Branch checkout conflicts possible | Impossible — worktree IS the branch |
| Workers as panes in one workspace | Workers as separate workspaces in sidebar |
| ~3 practical parallel limit | 8+ without conflicts |
| Cleanup: close pane | Cleanup: close workspace + `git worktree remove` |
