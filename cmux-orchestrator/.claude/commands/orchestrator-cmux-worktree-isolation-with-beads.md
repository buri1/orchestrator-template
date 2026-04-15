# L-Thread Orchestrator — cmux + Worktree + Beads (v4.2)

> Each worker gets its own git worktree + cmux workspace. Beads tracks all work.
> Core rules: `.claude/agents/orchestrator-worktree.md`
> Research: `research/SYNTHESIS-REPORT.md` | Patterns: `research/catalogue/ADOPTABLE-PATTERNS.md`

## WHAT'S NEW IN v4.2

| Feature | v4.1 (Worktree) | v4.2 (Worktree + Beads) |
|---------|-----------------|------------------------|
| Task tracking | `orchestrator-state.json` only | **Beads** (`bd ready`) + state JSON |
| Work discovery | Manual GitHub issue query | **`bd ready`** — automatic dependency resolution |
| Task claiming | None (race conditions possible) | **`bd update --claim`** — atomic locking |
| Sub-task tracking | None | Workers create sub-tasks with **`bd create`** |
| Session persistence | State JSON (flat) | Beads JSONL (dependency graph + semantic compaction) |
| Worker prompts | Basic instructions | **TDD-first** + PreCompletionChecklist |
| Safety | Prompt-based only | **DCG** (Destructive Command Guard) + prompts |
| Token tracking | None | **ccusage** baseline after each sprint |
| Crash forensics | Pane vanishes | **remain-on-exit** keeps pane for inspection |

---

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

### 3. VERIFY BEADS

```bash
# Check if bd CLI is installed
command -v bd &>/dev/null && echo "BEADS OK: $(bd --version)" || echo "BEADS NOT INSTALLED"

# Check if project has .beads/
[ -d "$TARGET_DIR/.beads" ] && echo "BEADS INITIALIZED" || echo "BEADS NOT INITIALIZED"
```

If Beads is NOT installed:
```bash
echo "Install Beads: go install github.com/steveyegge/beads/cmd/bd@latest"
```
If installed but not initialized:
```bash
cd "$TARGET_DIR" && bd init
```

### 4. INSTALL STOP HOOK IN TARGET PROJECT

```bash
ORCHESTRATOR_DIR="${ORCHESTRATOR_DIR:-$(pwd)}"
STOP_HOOK_SOURCE="$ORCHESTRATOR_DIR/scripts/cmux-stop-hook.sh"
TARGET_SCRIPTS="$TARGET_DIR/_bmad/scripts"
TARGET_SETTINGS="$TARGET_DIR/.claude/settings.local.json"

mkdir -p "$TARGET_SCRIPTS" "$TARGET_DIR/.claude"
cp "$STOP_HOOK_SOURCE" "$TARGET_SCRIPTS/cmux-stop-hook.sh"
chmod +x "$TARGET_SCRIPTS/cmux-stop-hook.sh"
```

Then check/merge the Stop hook into `$TARGET_SETTINGS` (same as v4.1).

### 5. PREPARE WORKTREE DIRECTORY

```bash
WORKTREE_BASE="$HOME/.cmux/worktrees/$(basename $TARGET_DIR)"
mkdir -p "$WORKTREE_BASE"
```

Verify git worktree support:
```bash
cd "$TARGET_DIR" && git worktree list
```

### 6. CAPTURE WORKSPACE ID & SET UP SIDEBAR

**Critical**: Capture `ORCH_WORKSPACE` immediately. ALL sidebar commands MUST use `--workspace "$ORCH_WORKSPACE"`.

```bash
ORCH_WORKSPACE="${CMUX_WORKSPACE_ID}"
echo "ORCH_WORKSPACE=$ORCH_WORKSPACE"
PROJECT_NAME=$(basename "$TARGET_DIR")
cmux rename-workspace --workspace "$ORCH_WORKSPACE" "Orch: $PROJECT_NAME"
cmux set-status "mode" "cmux-v4.2-beads" --icon terminal --color "#8b5cf6" --workspace "$ORCH_WORKSPACE"
cmux set-status "target" "$PROJECT_NAME" --icon folder --workspace "$ORCH_WORKSPACE"
cmux set-progress 0.0 --label "Initializing..." --workspace "$ORCH_WORKSPACE"
cmux log --source orchestrator "Orchestrator v4.2 (worktree + beads) starting" --workspace "$ORCH_WORKSPACE"
```

### 7. CHECK AUTO_MODE

```bash
cat "$TARGET_DIR/.bmad/AUTO_MODE" 2>/dev/null
```

### 8. LOAD OR INITIALIZE STATE

Read `$TARGET_DIR/_bmad/orchestrator-state.json`. If missing, create with `"version": "4.2"` and `"mode": "cmux-worktree-beads"`.

### 9. CLEANUP ORPHAN WORKTREES

```bash
cd "$TARGET_DIR"
git worktree list
git worktree prune
```

Compare `git worktree list` against `workers` in state file. Remove orphans.

### 10. LOAD BEADS STATUS

```bash
cd "$TARGET_DIR"
bd ready --json 2>/dev/null  # Show unblocked, unclaimed tasks
bd list --json 2>/dev/null    # Full task overview
```

Display summary: total tasks, ready tasks, in-progress tasks, done tasks.

### 11. LOAD AGENT PERSONA

Read `.claude/agents/orchestrator-worktree.md` NOW. All rules govern behavior.

**Mode: CMUX-WORKTREE-BEADS** — Workers get `git worktree add` + `cmux new-workspace`. Task tracking via Beads.

### 12. DISPLAY STATUS AND BEGIN

```
L-Thread Orchestrator v4.2 (cmux + Worktree + Beads)
Target:      <project-name> (<repo>)
Directory:   <target-dir>
Worktrees:   <worktree-base>
AUTO_MODE:   <ENABLED|DISABLED>
Beads:       <N ready> / <N total> tasks
Progress:    <X done, Y skipped>
Phase:       <current phase>
Workers:     <N active>

[BEADS READY]: <list of unblocked tasks from bd ready>
```

If AUTO_MODE: begin immediately. Otherwise: wait for "start".

---

## THE CORE LOOP (Beads-Enhanced)

```
 1. GET_NEXT_TASK     — `bd ready` → pick highest priority unblocked task
 2. CLAIM_TASK        — `bd update <id> --claim` → atomic lock
 3. CREATE_SPEC       — Generate spec if none exists, attach to bead
 4. SPAWN_DEV         — git worktree add + cmux new-workspace + claude
 5. WAIT_FOR_DONE     — cmux wait-for "agent-<name>-done" --timeout 1800
 6. CHECK_PR          — gh pr list for PR
 7. CLOSE_DEV         — cmux close-workspace + git worktree remove
 8. REVIEW_PR         — gh pr diff, or spawn review worker
 9. FIX_IF_NEEDED     — Spawn fix worker IN EXISTING WORKTREE (max 3 cycles)
10. MERGE             — gh pr merge --merge --delete-branch
11. CLEANUP_WORKTREE  — git worktree remove (if not already removed)
12. E2E_TEST          — MANDATORY — cmux browser screenshots
13. MARK_DONE         — `bd update <id> --status done` + update state
14. DEVLOG            — Append to _bmad/devlog.md
15. COST_CHECK        — `npx ccusage@latest --json` (every 5th task or end of sprint)
16. CONTINUE          — Loop to step 1
```

### Step 1: GET_NEXT_TASK (Beads-Powered)

```bash
cd "$TARGET_DIR"

# Get unblocked, unclaimed tasks sorted by priority
NEXT_TASK=$(bd ready --json 2>/dev/null | jq -r '.[0]')

if [ "$NEXT_TASK" = "null" ] || [ -z "$NEXT_TASK" ]; then
    # No tasks ready — check if all done or all blocked
    TOTAL=$(bd list --json 2>/dev/null | jq 'length')
    DONE=$(bd list --json --status done 2>/dev/null | jq 'length')

    if [ "$DONE" = "$TOTAL" ]; then
        echo "ALL TASKS COMPLETE"
        # Sprint done — run ccusage final report
    else
        echo "ALL REMAINING TASKS BLOCKED"
        # Log to devlog, notify, wait or skip
    fi
fi

TASK_ID=$(echo "$NEXT_TASK" | jq -r '.id')
TASK_TITLE=$(echo "$NEXT_TASK" | jq -r '.title')
```

### Step 2: CLAIM_TASK

```bash
bd update "$TASK_ID" --claim
# If claim fails (another agent claimed it), loop back to step 1
```

### Steps 3-12: Same as v4.1

See `orchestrator-cmux-worktree-isolation.md` for worktree CRUD details.

### Step 13: MARK_DONE (Beads + State)

```bash
# Update Beads
bd update "$TASK_ID" --status done

# Update orchestrator state JSON (for phase tracking)
# ... standard state update ...

# Update sidebar
cmux set-status "$WORKER_NAME" "done ✓" --icon checkmark --color "#22c55e" --workspace "$ORCH_WORKSPACE"
```

### Step 15: COST_CHECK

```bash
# Run ccusage to track token usage (every 5th task or end of sprint)
npx ccusage@latest --json 2>/dev/null | jq '{
  total_tokens: .total_tokens,
  total_cost_estimate: .total_cost_estimate,
  sessions: (.sessions | length)
}'
```

---

## WORKER TASK PROMPT TEMPLATE (v4.2 — TDD-First)

Workers are in their isolated worktree. The prompt enforces TDD and quality gates:

```
You are a dev worker. Your task:

**Story**: [ID] — [Title]
**Bead**: [bd-XXXX]
**Spec**: [path to spec file or inline spec content]

You are already on branch feature/[story-id]-[slug] in an isolated git worktree.

Instructions:
1. First run the existing tests: `pnpm test`
2. Write a FAILING test for the new behavior (red)
3. Implement the feature to make the test pass (green)
4. Run: pnpm typecheck && pnpm build && pnpm test — fix ALL errors
5. Run: pnpm lint — fix ALL warnings

Pre-completion checklist (MANDATORY before PR):
- [ ] All tests pass (including your new ones)
- [ ] No lint errors or warnings
- [ ] `git status` shows only your changes (no untracked junk)
- [ ] Branch is up to date with main

6. git add <changed-files> && git commit -m "feat: Story [ID] — [Title]"
7. git push -u origin feature/[story-id]-[slug]
8. gh pr create --base main --title "feat: Story [ID] — [Title]" --body "[summary]"
9. Do NOT merge the PR — the orchestrator handles merging
10. When done, output the PR URL clearly, then type /exit

IMPORTANT: You are the developer. Write clean, working code. Follow existing patterns.
NOTE: You are in a git worktree. Do NOT checkout other branches.
NOTE: If you are stuck after 3 attempts on the same error, output "STATUS: blocked <reason>" and /exit.
```

For fix workers:
```
You are a fix worker. Review feedback needs to be addressed.

**PR**: #[N] on branch feature/[story-id]-[slug]
**Bead**: [bd-XXXX]
**Feedback**: [specific issues from review]

You are already on the correct branch in an isolated git worktree.

Instructions:
1. git pull (get latest changes)
2. First run the existing tests to confirm current state
3. Address each feedback item
4. Run: pnpm typecheck && pnpm build && pnpm test && pnpm lint
5. Verify pre-completion checklist (all tests pass, no lint errors, clean git status)
6. git add <files> && git commit -m "fix: address review feedback for Story [ID]"
7. git push
8. When done, type /exit

NOTE: Do NOT checkout other branches. Work only on this branch.
```

---

## BEADS TASK CREATION

When converting GitHub issues or epic stories to Beads tasks:

```bash
# Create an epic
bd create "HiArbeit Portal Complete" -p 0 --epic

# Create tasks under the epic
bd create "Stellenmarkt sub-page" -p 1 --parent bd-XXXX
bd create "Fix 404 sub-pages" -p 0 --parent bd-XXXX
bd create "Playfair Display font integration" -p 2 --parent bd-XXXX

# Set dependencies
bd dep add bd-YYYY bd-ZZZZ  # bd-YYYY is blocked by bd-ZZZZ

# Workers can create sub-tasks during implementation
# (included in worker prompt as optional)
```

---

## QUICK REFERENCE

| Action | Command |
|--------|---------|
| **Beads: ready tasks** | `bd ready` |
| **Beads: claim task** | `bd update <id> --claim` |
| **Beads: mark done** | `bd update <id> --status done` |
| **Beads: create task** | `bd create "Title" -p <priority>` |
| **Beads: show task** | `bd show <id>` |
| **Beads: add dependency** | `bd dep add <child> <parent>` |
| **Cost tracking** | `npx ccusage@latest` |
| Create worktree | `git worktree add <path> -b <branch>` |
| Create workspace | `cmux new-workspace --cwd <worktree-path>` |
| Rename workspace | `cmux rename-workspace --workspace <ref> "W: name"` |
| Start Claude | `cmux send --workspace <ref> "ORCHY_SIGNAL=... claude --dangerously-skip-permissions\n"` |
| Wait for done | `cmux wait-for "agent-<name>-done" --timeout 1800` |
| Read output | `cmux read-screen --workspace <ref> --scrollback --lines 100` |
| Close workspace | `cmux close-workspace --workspace <ref>` |
| Remove worktree | `git worktree remove <path> --force` |
| Prune stale | `git worktree prune` |
| State file | `$TARGET_DIR/_bmad/orchestrator-state.json` |
| Beads file | `$TARGET_DIR/.beads/beads.jsonl` |
| Agent rules | `.claude/agents/orchestrator-worktree.md` |

## KEY DIFFERENCES FROM v4.1

| v4.1 (Worktree) | v4.2 (Worktree + Beads) |
|--|--|
| `gh issue list` for task discovery | `bd ready` — dependency-aware, automatic |
| No task locking | `bd update --claim` — atomic |
| Basic worker prompt | TDD-first + PreCompletionChecklist |
| No cost tracking | ccusage after every sprint |
| No crash forensics | remain-on-exit on every pane |
| No destructive command protection | DCG installed on all agents |
| Workers can't signal "blocked" | `STATUS: blocked <reason>` pattern |
| Flat task list | Dependency graph (bd-XXXX.1.1) |

## IMMEDIATE SETUP CHECKLIST

Before first run, verify these are installed/configured:

- [ ] `bd --version` — Beads CLI installed
- [ ] `bd init` — Beads initialized in target project
- [ ] `npx ccusage@latest` — works (no install needed)
- [ ] DCG installed — `claude hook list` shows destructive-command-guard
- [ ] `remain-on-exit` added to worker spawn in agent file
- [ ] Worker prompt includes TDD instructions
- [ ] Worker prompt includes PreCompletionChecklist
- [ ] `_bmad/failure-domains.jsonl` exists (empty file, append-only)
