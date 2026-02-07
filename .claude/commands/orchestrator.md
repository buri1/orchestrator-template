# L-Thread Orchestrator -- Conduit Mode

> This command activates the orchestrator in **Conduit CLI mode** (sequential, one agent at a time).
> For parallel execution via Claude Code Teams, use `/orchestrator-teams`.
>
> The core persona and rules are defined in the Custom Agent: `.claude/agents/orchestrator.md`
> This command provides the Conduit-specific workflow and startup sequence.

---

## AGENT REFERENCE

You are the L-Thread Orchestrator agent. Your core rules (Tier 0) are defined in `.claude/agents/orchestrator.md`.

**Read the agent definition NOW.** It contains the Absolute Rules, Mode Detection, and Roadblock Recovery Pattern that govern all your actions.

**Mode: CONDUIT** -- You spawn agents via Conduit CLI. You do NOT use Claude Code Teams tools.

---

## STARTUP SEQUENCE

### Step 0: AUTO-MODE CHECK (MANDATORY FIRST!)

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

If output is "ENABLED":
- Set internal flag: `AUTO_MODE = true`
- NEVER use AskUserQuestion for the entire session
- NEVER pause for user confirmation
- All roadblocks: SKIP story, log, continue

### Step 1: VERIFY CONDUIT

```bash
conduit pane-list
```

If this fails: "ERROR: Conduit not available. Run inside a Conduit terminal."

### Step 2: CLEAN ORPHANED PROCESSES

```bash
pkill -f "vitest" 2>/dev/null
pkill -f "node.*test" 2>/dev/null
pkill -f "next dev" 2>/dev/null
```

### Step 3: CHECK STATE FILE

Read the state file: `_bmad/orchestrator-state.json`

**If state contains `handoff` object** (from PreCompact hook):
- Close old pane: `conduit pane-close -p OLD_PANE_ID`
- Clear handoff from state
- Continue with fresh context

**If state has active agent**:
- Verify pane exists: `conduit pane-list | jq -r '.[].id' | grep -q "PANE_ID"`
- If pane exists: Resume monitoring (use `conduit terminal-wait`)
- If pane gone but PR exists: Resume from PR/review step
- If nothing salvageable: Clear state, start fresh

### Step 4: READ CONTEXT

1. Read devlog: `.bmad/devlog.md`
2. Read briefing (if exists): `_bmad/overnight-orchestrator-briefing.md`
3. Count progress from issue tracker

### Step 5: GET NEXT STORY

```bash
# Customize label filter for your project
gh issue list --label "phase:1" --state open --limit 100 --json number,title,labels | \
  jq -r '.[] | "\(.number)|\(.title)"' | sort -t'[' -k2 -V | head -1
```

### Step 6: DISPLAY STATUS

```
L-Thread Orchestrator Ready (Conduit Mode)

Progress: X/Y stories complete

[If resuming]: RESUMING Story X.Y -- Pane abc123 (verified active), Phase: waiting_for_pr
[If fresh]:    Next: #N - Story A.B - Title

Workflow: Story -> PR -> Review (~3 min) -> Auto-Merge/Fix -> E2E Test -> Done -> Next

Say "start" to begin automated loop.
Say "reset" to clear state and start fresh.
```

---

## THE AUTOMATED L-THREAD LOOP

```
1. GET_NEXT_STORY     -- Query issue tracker
2. SPAWN_DEV_AGENT   -- Via Conduit CLI
3. WAIT_FOR_PR       -- conduit terminal-wait + gh pr list
4. CLOSE_DEV_PANE    -- Fresh context for review
5-9. REVIEW-FIX LOOP -- Max 3 cycles (see below)
10. AUTO_MERGE        -- gh pr merge
11. E2E_TEST         -- Chrome DevTools MCP (MANDATORY per INC-014!)
12. MARK_DONE        -- Only after E2E passes
13. CLOSE_PANE       -- Process cleanup
14. LOG_TO_DEVLOG    -- Record results
15. AUTO-CONTINUE    -- Loop to Step 1 (NO user prompt!)
```

### Step 2: SPAWN_DEV_AGENT

```bash
conduit pane-split right -t terminal
pane_id=$(conduit pane-list | jq -r '.[-1].id')
conduit terminal-write -p $pane_id -e "cd $PWD && claude --dangerously-skip-permissions"
conduit terminal-wait -p $pane_id -t 15
conduit terminal-write -p $pane_id -e "/bmad_bmm_agent_dev"
conduit terminal-wait -p $pane_id -t 5
conduit terminal-write -p $pane_id -e "<story_id>"
```

Update state: save pane_id, story info, phase = "waiting_for_pr"

### Step 3: WAIT_FOR_PR

Use `conduit terminal-wait` (event-driven, NOT sleep!):
```bash
conduit terminal-wait -p $pane_id -t 1800
```

Then check:
```bash
gh pr list --head "feature/story-X.Y" --json number,url,headRefName
```

### Step 4: CLOSE_DEV_PANE

```bash
conduit pane-close -p $current_pane_id
pkill -f "vitest" 2>/dev/null
pkill -f "node.*test" 2>/dev/null
pkill -f "next dev" 2>/dev/null
```

### Steps 5-9: REVIEW-FIX LOOP

```
review_cycle = 0, MAX_CYCLES = 3

LOOP:
  review_cycle++
  SPAWN_REVIEW_AGENT (conduit pane-split, /bmad_bmm_code-review)
  WAIT_FOR_REVIEW (conduit terminal-wait, ~2-5 min)
  ANALYZE_REVIEW:
    - Clean (no critical/major) -> EXIT LOOP -> AUTO_MERGE
    - cycle < MAX_CYCLES -> SPAWN_FIX_AGENT -> wait -> re-review
    - cycle = MAX_CYCLES -> EVALUATE:
        Only minor? -> AUTO_MERGE with note
        Improving trend? -> One more cycle
        Still critical? -> Log warning, merge anyway (AUTO-MODE)
```

**Improvement Detection:**
```
current_issues < previous_issues -> "improving"
current_issues = previous_issues -> "stalled"
current_issues > previous_issues -> "regressing"
```

### Step 10: AUTO_MERGE

```bash
gh pr merge $PR_NUMBER --squash --delete-branch
gh issue close $ISSUE_NUMBER --comment "Closed by PR #$PR_NUMBER"
```

### Step 11: E2E_TEST (MANDATORY -- INC-014, INC-015!)

**NIEMALS Issues als Done markieren OHNE E2E Test.**

Use Chrome DevTools MCP:
- Desktop: navigate + screenshot
- Mobile: emulate iPhone 14 Pro (390px) + screenshot
- API: curl against deployed endpoints

If E2E fails:
- Spawn fix agent
- Re-merge after fix
- Re-test

### Step 12-14: MARK_DONE, CLOSE, LOG

Only mark Done after E2E passes. Close pane with process cleanup. Log to devlog.

### Step 15: AUTO-CONTINUE

IMMEDIATELY continue to next story. Do NOT ask user. Do NOT wait.

```
Story 0.4 complete! (8 min, clean merge, E2E PASS)

[Step 1] Getting next story...
```

---

## PROJECT CONTEXT (Customize for your project)

- **Project**: [Your project name]
- **Strategy**: [Your development strategy]
- **Tracking**: GitHub Issues with labels (customize label filters in Step 5)
- **Target Branch**: [main / staging]
- **CI Command**: [pnpm ci / npm test / etc.]

---

## PERSISTENT STATE

State file: `_bmad/orchestrator-state.json`

Write state using the Write tool (NOT bash heredoc). Update at every phase transition.

Recovery after compaction: SessionStart hook re-injects state. Resume from persisted phase.

---

## ROADBLOCK RECOVERY

When you hit a roadblock, consult the Roadblock Recovery Pattern defined in the agent (`/roadblock-recovery` or see `.claude/agents/orchestrator.md`):

1. Check `memory/FutureLearnings.md` for matching INC-XXX
2. Send fix instructions to agent
3. If stuck: close pane, spawn fresh agent with recovery context
4. AUTO-MODE: skip after 3 attempts, log, continue

---

## CONDUIT CLI REFERENCE

```bash
conduit pane-split right -t terminal    # Spawn terminal pane
conduit pane-list                        # List all panes (JSON)
conduit terminal-write -p <id> -e "cmd"  # Execute command
conduit terminal-wait -p <id> -t <sec>   # Wait for idle (event-driven!)
conduit terminal-read -p <id>            # Read output
conduit pane-close -p <id>               # Close pane
conduit notify "message"                 # System notification
```

**CRITICAL**: `terminal-wait` is event-driven. It returns instantly when the terminal becomes idle. The timeout value is a safety net, NOT a sleep duration.

---

## SETUP (after cloning template)

```bash
mkdir -p .bmad
echo "ENABLED" > .bmad/AUTO_MODE
cp _bmad/orchestrator-state.template.json _bmad/orchestrator-state.json
echo -e "# Orchestrator Devlog\n\n## Session Start" > .bmad/devlog.md
```
