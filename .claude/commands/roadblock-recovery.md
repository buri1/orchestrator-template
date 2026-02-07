# Roadblock Recovery

> Invoked when an agent hits a roadblock. This command loads the FutureLearnings
> incident database and provides targeted fix instructions.
>
> Can be invoked by the orchestrator or directly by a dev agent that is stuck.

---

## USAGE

When you encounter a recurring error, deployment failure, or mysterious bug:

1. Describe the problem (error message, symptoms, what was tried)
2. This command searches FutureLearnings for matching incidents
3. Returns specific fix instructions based on documented root causes

---

## STEP 1: LOAD INCIDENT DATABASE

Read the incident documentation:

```
Read file: memory/FutureLearnings.md
```

If the file does not exist, check alternative locations:
```
Read file: _bmad/_memory/FutureLearnings.md
Read file: docs/FutureLearnings.md
```

If no FutureLearnings file exists, skip to Step 3 (general troubleshooting).

---

## STEP 2: SEARCH FOR MATCHING INCIDENTS

Search the loaded incidents for patterns matching the current problem:

### Common Pattern Matches

| Symptom | Likely Incident | Key Fix |
|---------|----------------|---------|
| DB connections hanging/timing out | INC-001 | Add `prepare: false` to postgres.js config |
| `SyntaxError: Bad escaped character` in JSON | INC-001 | Use heredoc for curl: `curl -d @- <<'EOF'` |
| Validation error "invalid value, allowed: ..." | INC-002 | Update Zod schema to match TypeScript type |
| N+1 query performance issues | INC-009 | Use JOIN queries instead of loops |
| Pagination returning all results | INC-011 | Use SQL LIMIT/OFFSET, not .slice() |
| XSS in markdown rendering | INC-007 | Add `rehype-sanitize` alongside `rehype-raw` |
| Tests pass locally but fail on deploy | INC-004 | Test against deployed URL, not localhost |
| Chrome DevTools MCP instability | INC-013 | Retry 3x, use file-based prompts for long text |
| Prompt too long for terminal-write | INC-013 | Write prompt to /tmp/file, send via cat/xargs |
| E2E tests skipped accidentally | INC-014 | E2E is GATE before Done -- never skip |
| Issues marked Done without testing | INC-015 | Workflow: Fix -> PR -> Merge -> E2E -> Done |

### Search Strategy

1. Match error messages against incident Symptoms
2. Match affected components against incident Components
3. Match the general category (DB, auth, validation, testing, deployment)
4. If multiple matches: prioritize by severity (P0 > P1 > P2 > P3)

---

## STEP 3: GENERATE FIX INSTRUCTIONS

Based on the matching incident, extract:

1. **Root Cause** -- What is actually wrong (not just symptoms)
2. **Fix Steps** -- Exact changes needed (from the incident's Fix section)
3. **Prevention Checklist** -- How to avoid this in the future
4. **Verification** -- How to confirm the fix worked

Format the response as actionable instructions:

```
ROADBLOCK RECOVERY -- [INC-XXX: Incident Title]

ROOT CAUSE:
[One paragraph explaining why this happens]

FIX:
1. [Specific step 1]
2. [Specific step 2]
3. [Specific step 3]

VERIFY:
- [How to confirm the fix worked]

PREVENTION:
- [Checklist item for the future]
```

---

## STEP 4: NO MATCHING INCIDENT

If no incident matches the current problem:

### General Troubleshooting Steps

1. **Isolate the problem**: Is it a build error, runtime error, or test failure?
2. **Check error details**: Read the full stack trace, not just the summary
3. **Reproduce minimally**: Can you trigger the error with a single command?
4. **Check recent changes**: `git diff HEAD~3` -- did a recent change introduce this?
5. **Check environment**: Are env vars set? Is the DB reachable? Is the service deployed?

### Escalation

If the troubleshooting does not resolve the issue:

1. **Log detailed error info** to `.bmad/devlog.md`
2. **If AUTO-MODE**: SKIP the task, log reason, continue to next
3. **If manual mode**: Report to user with full error details and what was tried
4. **Create new INC-XXX entry** in FutureLearnings (if the problem is novel and resolved)

---

## STEP 5: DOCUMENT NEW INCIDENTS

If this roadblock is NEW and you found a resolution, create a new incident:

```markdown
### INC-XXX: [Short Title]

**Datum:** YYYY-MM-DD
**Zeitaufwand Debugging:** ~Xh Xmin
**Schweregrad:** P0|P1|P2|P3
**Betroffene Komponenten:** [list]

#### Symptom
[What was observed]

#### Eigentliche Ursache (Root Cause)
[What was actually wrong]

#### Fix
[What was changed]

#### Praevention
- [ ] [How to prevent in the future]

#### Lessons Learned
- [Key takeaway]
```

Append this to `memory/FutureLearnings.md` so future agents benefit.

---

## INTEGRATION WITH ORCHESTRATOR

The orchestrator uses this command as part of its Roadblock Recovery Pattern:

### Conduit Mode
```bash
# Orchestrator spawns a recovery agent
conduit pane-split right -t terminal
pane_id=$(conduit pane-list | jq -r '.[-1].id')
conduit terminal-write -p $pane_id -e "cd $PWD && claude --dangerously-skip-permissions"
conduit terminal-wait -p $pane_id -t 15
conduit terminal-write -p $pane_id -e "/roadblock-recovery"
conduit terminal-wait -p $pane_id -t 5
conduit terminal-write -p $pane_id -e "<error description>"
```

### Teams Mode
```
SendMessage -> type: "message", recipient: "dev-1"
content: "ROADBLOCK RECOVERY: Check /roadblock-recovery with this error: <error>"
```

Or the dev agent itself can invoke `/roadblock-recovery` directly.
