# Pi Orchestrator Incident Logger

> Log an incident encountered during Pi orchestrator operation. Fast, structured, append-only.
> Use IMMEDIATELY when something breaks, stalls, or behaves unexpectedly during orchestrator runs.

## Usage

```
/pi-incident <short title>
```

Examples:
- `/pi-incident Pi tried azure-openai instead of openai-codex`
- `/pi-incident GPT-5.4 read docs instead of calling supervisor_start`
- `/pi-incident Orchestrator pane stuck — Claude Code not launched`

## Instructions

### Step 1: Gather Context Automatically

Read these files to understand current state (do NOT ask the user):
- `pi-orchestrator/_bmad/pane-layout.json` — current pane state
- Check telemetry: `cat pi-orchestrator/_bmad/telemetry/$(date +%Y-%m-%d).jsonl | tail -20`
- `tmux capture-pane -t %0 -p -S -30` — last 30 lines of supervisor pane
- `tmux capture-pane -t %2 -p -S -30` — last 30 lines of orchestrator pane

### Step 2: Create or Append Incident

**File:** `pi-orchestrator/_bmad/incidents.md`

If the file doesn't exist, create it with this header:
```markdown
# Pi Orchestrator — Incident Log

> Auto-generated during testing. Each incident = one learning for making the system more deterministic.
> Format optimized for quick logging, pattern detection, and reducer/hook improvements.
```

Append a new incident using the next INC number:

```markdown
---

### INC-XXX: [Title from user or auto-detected]

**When:** YYYY-MM-DD HH:MM (use current time)
**Phase:** [supervisor phase from telemetry: stopped|starting|running|silent|nudging|stalled|crashed]
**Model:** [which model was running — e.g., gpt-5.4, claude-opus-4-6]
**Component:** [supervisor.ts | orchestrator-agents.ts | telemetry.ts | run.sh | pane-workers.sh | Pi Agent | auth | tmux]

#### What Happened
[1-3 sentences: what went wrong, observed behavior]

#### Expected Behavior
[1-2 sentences: what SHOULD have happened]

#### Root Cause
[1-2 sentences: why it happened. If unknown yet, write "TBD — investigating"]

#### Fix Applied
[What was done to resolve it. Include commands/edits if applicable]

#### Determinism Opportunity
[How can we prevent this with hooks, reducer logic, or config? This is the KEY field — every incident should produce a concrete improvement idea]

Categories:
- **HOOK**: Add/modify a Pi extension hook to detect/prevent this
- **REDUCER**: Add a new event type or effect to the stateless reducer
- **CONFIG**: Add a config guard/default/validation
- **PROMPT**: Improve agent instructions (CLAUDE.md, supervisor.md)
- **GUARD**: Add a pre-flight check or assertion
```

### Step 3: Also log to telemetry

Run this to append to today's telemetry JSONL:
```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","epoch":'$(date +%s000)',"session":"manual","type":"incident","subtype":"INC-XXX","data":{"title":"...","component":"...","determinism":"..."}}' >> pi-orchestrator/_bmad/telemetry/$(date +%Y-%m-%d).jsonl
```

### Step 4: Confirm to User

Output a brief summary:
```
Logged INC-XXX: [title]
Determinism opportunity: [HOOK|REDUCER|CONFIG|PROMPT|GUARD] — [one-line description]
```

## Rules

- NEVER ask clarifying questions — log what you know, mark unknowns as TBD
- ALWAYS fill the "Determinism Opportunity" field — this is the whole point
- Keep it SHORT — this is a rapid log, not a post-mortem
- Read telemetry and pane output automatically — don't make the user describe what happened
- If multiple incidents happen in sequence, log them ALL separately
- Increment INC numbers from the last one in the file
