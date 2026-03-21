# L-Thread Orchestrator — cmux Mode (v4)

> Core rules live in `.claude/agents/orchestrator.md`.
> Can be invoked directly via `/orchestrator-cmux` OR via `./run.sh <target-dir>`.

## STARTUP SEQUENCE

### 1. DETECT CMUX

```bash
cmux ping 2>/dev/null && echo "CMUX OK" || echo "NOT IN CMUX"
echo "WORKSPACE: ${CMUX_WORKSPACE_ID:-none}"
echo "SURFACE: ${CMUX_SURFACE_ID:-none}"
```

If not in cmux: STOP. Print: `ERROR: Not inside cmux. Open a cmux terminal first.`

### 2. DETECT TARGET PROJECT

```bash
echo "${TARGET_DIR:-}"
```

If `TARGET_DIR` is NOT set (skill invocation without run.sh), **ASK the user**:

> "Which project should I orchestrate? Provide the full path (e.g. `~/Desktop/code/Lagerlink Hildesheim`)"

Then resolve and verify:
```bash
TARGET_DIR="<user-provided-path>"
cd "$TARGET_DIR" && git rev-parse --show-toplevel && gh repo view --json nameWithOwner -q .nameWithOwner
```

If not a git repo or `gh repo view` fails: stop with error.

### 3. INSTALL STOP HOOK IN TARGET PROJECT

**This is critical for the event-driven signal chain.**

Workers run `claude` from the TARGET project dir, so they use the target's `.claude/settings.local.json`. The Stop hook must exist there for `cmux wait-for` to work.

```bash
# Determine paths
ORCHESTRATOR_DIR="${ORCHESTRATOR_DIR:-$(pwd)}"
STOP_HOOK_SOURCE="$ORCHESTRATOR_DIR/scripts/cmux-stop-hook.sh"
TARGET_SCRIPTS="$TARGET_DIR/_bmad/scripts"
TARGET_SETTINGS="$TARGET_DIR/.claude/settings.local.json"

# Create directories
mkdir -p "$TARGET_SCRIPTS"
mkdir -p "$TARGET_DIR/.claude"

# Copy stop hook script
cp "$STOP_HOOK_SOURCE" "$TARGET_SCRIPTS/cmux-stop-hook.sh"
chmod +x "$TARGET_SCRIPTS/cmux-stop-hook.sh"
```

Then check if the Stop hook is already configured in the target's settings:
```bash
jq 'has("hooks") and (.hooks | has("Stop"))' "$TARGET_SETTINGS" 2>/dev/null
```

- If `false` or file doesn't exist: **merge/create the Stop hook config** using jq:
  ```bash
  # If file exists, merge:
  jq --arg script "bash \"$TARGET_SCRIPTS/cmux-stop-hook.sh\"" \
     '.hooks = (.hooks // {}) | .hooks.Stop = [{"hooks": [{"type": "command", "command": $script}]}]' \
     "$TARGET_SETTINGS" > "${TARGET_SETTINGS}.tmp" && mv "${TARGET_SETTINGS}.tmp" "$TARGET_SETTINGS"

  # If file doesn't exist, create minimal settings:
  echo '{"hooks":{"Stop":[{"hooks":[{"type":"command","command":"bash \"'"$TARGET_SCRIPTS"'/cmux-stop-hook.sh\""}]}]}}' | jq . > "$TARGET_SETTINGS"
  ```
- If `true`: Stop hook already configured, skip.

Log result:
```bash
cmux log --source orchestrator "Stop hook installed in target project"
```

### 4. CAPTURE WORKSPACE ID & SET UP SIDEBAR

**Critical**: Capture `ORCH_WORKSPACE` immediately. ALL sidebar commands MUST use `--workspace "$ORCH_WORKSPACE"` to avoid leaking status into the wrong workspace.

```bash
ORCH_WORKSPACE="${CMUX_WORKSPACE_ID}"
echo "ORCH_WORKSPACE=$ORCH_WORKSPACE"
PROJECT_NAME=$(basename "$TARGET_DIR")
cmux rename-workspace --workspace "$ORCH_WORKSPACE" "Orch: $PROJECT_NAME"
cmux set-status "mode" "cmux-v4" --icon terminal --color "#8b5cf6" --workspace "$ORCH_WORKSPACE"
cmux set-status "target" "$PROJECT_NAME" --icon folder --workspace "$ORCH_WORKSPACE"
cmux set-progress 0.0 --label "Initializing..." --workspace "$ORCH_WORKSPACE"
cmux log --source orchestrator "Starting L-Thread Orchestrator v4 (cmux mode)" --workspace "$ORCH_WORKSPACE"
```

**Store `ORCH_WORKSPACE` in state** so it survives compaction. Use it for ALL subsequent `set-status`, `set-progress`, `log`, `notify` calls.

### 5. CHECK AUTO_MODE

```bash
cat "$TARGET_DIR/.bmad/AUTO_MODE" 2>/dev/null
```

If "ENABLED": set `AUTO_MODE = true`. Never pause for user input.

### 6. LOAD OR INITIALIZE STATE

Read `$TARGET_DIR/_bmad/orchestrator-state.json`. If missing, create it:

```json
{
  "version": "4.0",
  "mode": "cmux",
  "project": {
    "name": "<project-name>",
    "dir": "<absolute-path>",
    "repo": "<owner/repo>"
  },
  "current_epic": null,
  "current_story": null,
  "phase": "idle",
  "workers": [],
  "history": [],
  "stats": {
    "stories_completed": 0,
    "stories_skipped": 0,
    "prs_merged": 0,
    "review_cycles_total": 0,
    "started_at": null,
    "last_updated": null
  }
}
```

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

Update sidebar (always with `--workspace`):
```bash
cmux set-progress <ratio> --label "<X>/<total> stories" --workspace "$ORCH_WORKSPACE"
cmux notify --title "Orchestrator Ready" --body "Target: <project-name>"
```

If AUTO_MODE: begin immediately. Otherwise: **wait for user to say "start"** or give instructions.

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
| State file | `$TARGET_DIR/_bmad/orchestrator-state.json` |
| Agent rules | `.claude/agents/orchestrator.md` |
| Sidebar status | `cmux set-status <key> "value" --workspace "$ORCH_WORKSPACE"` |
| Progress | `cmux set-progress <0.0-1.0> --label "text" --workspace "$ORCH_WORKSPACE"` |
