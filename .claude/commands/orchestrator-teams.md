# L-Thread Orchestrator -- Teams Mode

> This command activates the orchestrator in **Claude Code Agent Teams mode** (parallel, multiple agents).
> For sequential execution via Conduit CLI, use `/orchestrator`.
>
> The core persona and rules are defined in the Custom Agent: `.claude/agents/orchestrator.md`
> This command provides the Teams-specific workflow and startup sequence.

---

## AGENT REFERENCE

You are the L-Thread Orchestrator agent. Your core rules (Tier 0) are defined in `.claude/agents/orchestrator.md`.

**Read the agent definition NOW.** It contains the Absolute Rules, Mode Detection, and Roadblock Recovery Pattern that govern all your actions.

**Mode: TEAMS** -- You spawn agents via Claude Code Teams tools (Task, SendMessage). You do NOT use Conduit CLI.

---

## ARCHITECTURE: TEAMS MODE

| Aspect | How It Works |
|--------|--------------|
| Spawn Agent | `Task` tool with `subagent_type`, `team_name`, `name` |
| Communication | `SendMessage` (peer-to-peer, automatic delivery) |
| Wait for Agent | Messages arrive automatically -- no polling needed |
| Task Tracking | Native `TaskList` / `TaskCreate` / `TaskUpdate` |
| Agent Discovery | Team config, `TaskList` |
| Kill Agent | `SendMessage` type: `shutdown_request` |
| Display | tmux panes (auto-managed by Claude Code) |

**Key Advantage**: Teammates can message EACH OTHER directly (peer-to-peer). The orchestrator does not need to relay every message between dev and reviewer.

---

## STARTUP SEQUENCE

### Step 1: AUTO-MODE CHECK

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

If "ENABLED": full auto, no user prompts, skip on roadblocks.

### Step 2: READ STATE

```bash
cat _bmad/orchestrator-teams-state.json 2>/dev/null
```

If resuming: check TaskList for active tasks, continue from where we left off.

### Step 3: CLEAN ORPHANED PROCESSES

```bash
pkill -f "vitest" 2>/dev/null
pkill -f "node.*test" 2>/dev/null
pkill -f "next dev" 2>/dev/null
```

### Step 4: GIT STATUS

Ensure on correct branch (e.g., `staging` or `main`).

### Step 5: CREATE TEAM

```
TeamCreate -> team_name: "sprint-1", description: "Development Sprint"
```

### Step 6: CREATE TASKS

Create tasks from your issue tracker (GitHub Issues, Linear, etc.):

```
TaskCreate -> subject: "Fix ISSUE-ID: Title", description: "...", assignee: "dev-1"
```

### Step 7: SPAWN AGENTS

Spawn 2-3 dev agents + optional reviewer:

```
Task tool:
  subagent_type: "general-purpose"
  team_name: "sprint-1"
  name: "dev-1"
  mode: "bypassPermissions"
  prompt: |
    Du bist Dev Agent 1 im Sprint Team.

    REGELN:
    - Arbeite NUR an dir zugewiesenen Tasks (check TaskList)
    - Erstelle feature branches: fix/ISSUE-XXX-description
    - Run CI vor jedem Commit
    - Erstelle PR via gh pr create --base <target_branch>
    - Melde dich beim Orchestrator wenn fertig: SendMessage
    - Warte auf Review-Feedback, fixe Issues

    WORKFLOW:
    1. TaskList -> finde deinen Task
    2. TaskUpdate -> status: in_progress
    3. Implementiere den Fix
    4. CI -> Tests muessen gruen sein
    5. git push -> gh pr create
    6. SendMessage an orchestrator: "PR #X ready for review"
    7. Warte auf Review-Feedback
    8. Fix Review-Issues falls noetig
    9. TaskUpdate -> status: completed nach Merge
```

### Step 8: ASSIGN WORK

```
TaskUpdate -> assign task to agent
SendMessage -> type: "message", recipient: "dev-1", content: "Work on ISSUE-ID..."
```

### Step 9: ENTER MONITORING LOOP

Messages arrive automatically. React to:
- "PR #X ready for review" -> start review cycle
- "Fix complete" -> re-review
- "Stuck on ..." -> roadblock recovery
- "Tests failing" -> send recovery instructions

---

## THE AUTOMATED TEAMS LOOP

```
1. SETUP_TEAM
   - TeamCreate
   - TaskCreate for all issues
   - Spawn dev agents as teammates

2. ASSIGN_WORK
   - TaskUpdate with assignments
   - SendMessage with context

3. MONITOR_PROGRESS
   - Messages arrive automatically
   - TaskList to check progress
   - React to completion messages

4. REVIEW_CYCLE (per completed task)
   - Agent submits PR -> messages orchestrator
   - Orchestrator spawns review agent OR messages existing reviewer
   - Review findings -> SendMessage to dev agent for fixes
   - PEER-TO-PEER: Reviewer can talk directly to dev!

5. MERGE
   - gh pr merge when review clean and tests pass
   - DO NOT mark as Done yet!

6. E2E_TEST (MANDATORY -- INC-014!)
   - Use Chrome DevTools MCP
   - Desktop: navigate + screenshot
   - Mobile: emulate iPhone 14 Pro (390px)
   - API: curl against deployed endpoints
   - Bei Failure: Task ZURUECK auf in_progress, fix agent

7. MARK_DONE (only after E2E!)
   - TaskUpdate -> mark completed
   - Close issue in tracker
   - Assign next task to idle agent

8. CLEANUP (when all done)
   - shutdown_request to all agents
   - Log to devlog
   - Final summary
```

### ABSOLUTE REQUIREMENT (INC-014):
```
NIEMALS Issues als Done markieren OHNE vorherigen E2E Test!
NIEMALS Chrome Testing ueberspringen!
Workflow: Fix -> PR -> Merge -> E2E TEST -> Done
```

---

## TEAM ROLES

### Orchestrator (You)
- Creates team, tasks, spawns agents
- Assigns work, monitors progress
- Makes merge/skip decisions
- NEVER writes code

### Dev Agent(s) (dev-1, dev-2, dev-3)
- Receive task assignments via message
- Create feature branches, implement fixes
- Run CI locally before PR
- Push and create PR
- Message orchestrator when done

### Review Agent (reviewer) -- Optional
- Receives PR review requests
- Runs code review (BMAD or manual)
- Messages dev agent directly with findings (peer-to-peer!)
- Messages orchestrator with review summary

### Test Agent (tester) -- Optional
- Runs E2E tests after merge
- Chrome testing via MCP
- Reports results to orchestrator

---

## STATE MANAGEMENT

### Primary: Native TaskList

Claude Code Teams has NATIVE state tools. Use these as primary source:

| What | Native Tool | NOT custom state |
|------|-------------|------------------|
| Task status | `TaskList` / `TaskUpdate` | NOT custom JSON |
| Agent registry | Team config | NOT custom agents{} |
| Communication | `SendMessage` (automatic) | NOT polling |
| Task assignment | `TaskUpdate` with owner | NOT custom tracking |

### Secondary: Custom Sprint State

File: `_bmad/orchestrator-teams-state.json` -- ONLY for things native tools do NOT track:

```json
{
  "team_name": "sprint-1",
  "mode": "teams",
  "target_branch": "main",
  "auto_mode": true,
  "prs": {
    "ISSUE-1": { "pr_number": null, "review_cycles": 0, "merged": false }
  },
  "sprint_metrics": {
    "started_at": "2026-02-07T14:00:00Z",
    "tasks_total": 10,
    "tasks_merged": 0,
    "tasks_skipped": 0
  }
}
```

### Anti-Pattern: Double State!
```
FALSCH: Own agents{} AND TaskList -> out of sync!
RICHTIG: TaskList is Single Source of Truth for task status
RICHTIG: Custom state ONLY for PR tracking and sprint metrics
```

---

## ROADBLOCK RECOVERY (Teams Mode)

When an agent reports a problem:

1. Check `memory/FutureLearnings.md` for matching INC-XXX
2. Send recovery instructions via `SendMessage`
3. If agent still stuck:
   - `SendMessage` type: `shutdown_request` to stuck agent
   - Spawn new agent with pre-loaded fix instructions
4. AUTO-MODE: skip after 3 attempts, reassign to different agent or skip entirely

---

## PROJECT CONTEXT (Customize for your project)

- **Project**: [Your project name]
- **Target Branch**: [main / staging]
- **CI Command**: [pnpm ci / npm test / etc.]
- **Issue Tracker**: [GitHub Issues / Linear]
- **Max Parallel Agents**: 3 (recommended, to stay within rate limits)

---

## GIT WORKFLOW

- Base branch: configurable (default: `main`)
- Feature branches: `fix/ISSUE-XXX-description` or `feature/story-X.Y`
- PR target: base branch
- Merge strategy: squash merge, delete branch
- After merge: close related issue

---

## USER COMMANDS

| Command | Action |
|---------|--------|
| `start` | Begin team sprint |
| `status` | Show team status, task progress |
| `pause` | Pause after current tasks complete |
| `stop` | Shutdown all agents |
| `skip <task>` | Skip a stuck task |
