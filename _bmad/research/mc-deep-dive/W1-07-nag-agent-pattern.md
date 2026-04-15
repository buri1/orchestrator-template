# W1-07: The "Nag Agent" Pattern -- Proactive AI That Surfaces Obligations (2026)

## Metadata
| Field | Value |
|-------|-------|
| **Type** | Deep Research / Technology Evaluation |
| **Date** | 2026-04-12 |
| **Explorer** | Explorer 3 (Tech Evaluator) |
| **Scope** | Proactive agent architecture for Mission Control |
| **Sources** | Finance-Agent codebase, research catalogue (15+ entries), AIE Europe 2026, practitioner patterns |
| **Verdict** | **High-confidence recommendation: cron + Claude Code headless + SQLite scanner + markdown briefing** |

---

## 1. Executive Summary

Mission Control's real differentiator is not the dashboard -- it is an agent that proactively surfaces overdue obligations, deadlines, and next actions. This report evaluates the "nag agent" pattern: an autonomous agent that runs on a schedule, scans structured data, classifies urgency, and writes a daily briefing file -- without the user ever asking.

The research finds strong convergence across the 2026 practitioner ecosystem on this exact pattern. Burak already has a working prototype in the Finance-Agent codebase. The recommendation is to generalize that architecture into a multi-domain nag agent that scans ALL Mission Control tables, not just finance.

**Key thesis**: The nag agent is a prospective memory system. Most AI memory research focuses on the past (what happened). The nag agent's value is future memory -- what SHOULD happen.

---

## 2. Landscape: Existing Implementations of Proactive Agents

### 2.1 What Exists Today (Not Chatbots -- Agents That Ping YOU)

| Implementation | Author | Pattern | Proactive Mechanism | Relevance |
|---------------|--------|---------|---------------------|-----------|
| **Finance-Agent** | Burak (our codebase) | Scan-Classify-Escalate-Report | Cron/daemon + Notion poll + tiered briefing | 10/10 |
| **PI CEO Agent** | IndyDevDan | CEO-loop: Read State -> Decide -> Delegate | Always-on Raspberry Pi + Claude Code + state file | 10/10 |
| **gbrain** | Garry Tan | Temporal decay + proactive surfacing | PGLite + scheduled digest + staleness alerts | 9/10 |
| **Helena** | seijinjung | Autonomous marketing agent | Scheduled execution + metric-driven iteration | 6/10 |
| **HermesAgent Dashboard** | outsource | Heartbeat monitoring + alerting | Periodic agent check-in + stale detection | 7/10 |
| **Production Debugging Agent** | vincent_hus | Log scan -> classify -> escalate -> report | Scheduled scan + LLM severity classification | 7/10 |
| **Hermes-Wiki Daily Log** | cclank | Append-only narrative + morning briefing gen | Daily log as input for briefing generation | 7/10 |

### 2.2 Conference Validation (AIE Europe 2026)

Three separate AIE Europe speakers validated the proactive agent pattern:

**Vincent Kottsch** (Dark Factories talk):
> "The best agents are the ones that tell you what you need to know before you ask."

- Agents run on schedules (cron-like), not just on demand
- Output is structured alerts/reports, not conversational responses
- Escalation tiers determine notification urgency
- The human's attention is a scarce resource -- agents should protect it

**Sunil Pai** (Code Mode talk):
> "Headless Claude Code is the cron job of the AI age."

- `claude --headless --prompt "..."` for one-shot tasks
- Combined with cron/launchd for scheduled execution
- Output to files, not stdout
- Cost model: Claude Max subscription makes per-run cost effectively zero

**Pawel Huryn** (Orchestration Over Autonomy, discovered post):
- The most valuable AI pattern is not "do everything" but "surface the right thing at the right time and let the human decide"
- Orchestration (structured delegation with checkpoints) beats full autonomy

### 2.3 The "Daily Standup With Your AI" Pattern

This pattern emerges across multiple practitioners, though none name it consistently:

1. **IndyDevDan's CEO Agent**: "The CEO agent wakes up, reads the room, and decides what needs to happen. You don't tell it -- it tells you."
2. **gbrain's Calendar Awareness**: Before a meeting, surface all related notes and context.
3. **Hermes-Wiki's Morning Briefing**: Daily log from yesterday becomes input for today's briefing.
4. **Finance-Agent's Daily Briefing**: Tier-sorted markdown file optimized for scannability.

The convergent pattern:
```
Agent runs at 06:00 (or on first terminal open)
  -> Scans all data sources
  -> Classifies urgency using temporal rules
  -> Generates a briefing file
  -> Human reads it with coffee
  -> Decides what to act on today
```

This is NOT a chatbot interaction. It is a **push** model: the agent writes, the human reads. No conversation required.

---

## 3. Finance-Agent Architecture Analysis

### 3.1 What Already Exists

The Finance-Agent at `/Users/buraksmac/Desktop/code2/Finance-agent/` is a clean, working prototype of the nag agent pattern. Its architecture is exactly right:

```
Core Loop (src/index.ts)
  1. SCAN      -- DeadlineMonitor polls Notion databases
  2. CLASSIFY  -- EscalationEngine assigns urgency tiers
  3. REPORT    -- ReportGenerator writes daily briefing markdown
  4. LOG       -- Append to escalation-log.jsonl
```

### 3.2 Escalation Engine (The Heart of the Nag Agent)

The escalation-engine.ts implements a pure-function classifier:

| Tier | Trigger | Days Delta |
|------|---------|------------|
| Info | > 7 days until due | +8 or more |
| Warning | 3-7 days until due | +3 to +7 |
| Urgent | 1-3 days until due | +1 to +3 |
| Overdue | 0-7 days past due | 0 to -7 |
| Critical | > 7 days past due | -8 or worse |

Key design decisions:
- **Time-based, not amount-based**: A EUR 5 invoice 30 days overdue is more urgent than a EUR 5,000 invoice due in 14 days
- **Pure function**: `classifyItem(item, today)` -- no side effects, fully testable
- **Sort by urgency**: Most urgent first, always
- **Human-readable labels**: "3 days until due", "14 days overdue"

### 3.3 Report Generator (The Output)

The report-generator.ts produces markdown files optimized for scannability:
- Summary block with tier counts at top
- Grouped by tier (critical first)
- Each item shows: title, amount, tier label, due date, Notion link
- Action items section for critical/overdue items with checkboxes
- Generated timestamp for freshness tracking

### 3.4 What the Finance-Agent Gets Right

1. **Stateless**: Re-scans everything on each run. No stale cache.
2. **File-first output**: Daily briefing is a markdown file, not a notification.
3. **Read-only**: Never modifies source data. Safe to run repeatedly.
4. **Daemon mode**: `--daemon` flag for always-on operation with 6-hour interval.
5. **JSONL escalation log**: Machine-readable history of alert states over time.

### 3.5 What the Finance-Agent Is Missing (For Generalization)

1. **Single domain**: Only scans Notion finance databases. Needs to scan ALL MC tables.
2. **No decay detection**: Only checks dates. Doesn't detect "stale" projects (no activity in X days).
3. **No cross-domain connections**: Can't surface "this invoice relates to that project."
4. **No suppression/snooze**: No way to say "I know about this, stop nagging."
5. **No priority weighting**: All items in the same tier are treated equally.
6. **Notion-coupled**: Hardcoded to Notion API. Needs to work with SQLite.

---

## 4. Nag Agent Trigger Taxonomy

### 4.1 Trigger Types (from Icarus Memory Protocol + our analysis)

The Icarus Memory Protocol identifies four trigger types for prospective memory. Applied to Mission Control:

#### Time-Triggered (Deadline Proximity)
These fire based on calendar dates:

| Trigger | Source Table | Example |
|---------|-------------|--------|
| Hard deadline approaching | `deadlines` | Einstiegsgeld deadline 2026-05-31 (49 days) |
| Task due date approaching | `tasks` | PR review due tomorrow |
| Invoice payment due | `creditors` | Rent due on the 1st |
| Subscription renewal | `subscriptions` | Claude Max renews April 20 |
| Project milestone due | `projects` | OmniPort-HH delivery date |
| Content scheduled date | `content_items` | Video 1 publish date April 14 |
| Goal target date | `goals` | "First customer invoice" by May 31 |

#### Decay-Triggered (Staleness Detection)
These fire when something has NOT been touched:

| Trigger | Detection Rule | Example |
|---------|---------------|--------|
| Stale project | `projects.updated_at` > 14 days ago, status = 'active' | MAYTT paused but not marked paused |
| Abandoned task | `tasks.updated_at` > 7 days, status = 'in_progress' | Task stuck in progress |
| Stale content idea | `content_items.updated_at` > 30 days, status = 'idea' | Content idea never executed |
| Goal without progress | `goals.metric_current` unchanged > 14 days | Revenue goal stagnant |
| No financial snapshot | `financial_snapshots` missing for current month | Forgot to record monthly numbers |

#### Condition-Triggered (Threshold Violations)
These fire when a computed value crosses a threshold:

| Trigger | Condition | Example |
|---------|-----------|--------|
| Runway low | `financial_snapshots.runway_months` < 3 | Cash running out |
| Too many overdue items | Overdue count > 5 | System is being ignored |
| Task backlog growing | Open tasks > 2x completed in last 7 days | More work piling up than getting done |
| No revenue this month | Revenue = 0 for current month | Need to send invoices |
| Blocked tasks accumulating | Tasks with status 'blocked' > 3 | Something systemic is wrong |

#### Event-Triggered (State Transitions)
These fire when something specific happens:

| Trigger | Event | Example |
|---------|-------|--------|
| Agent run failed | `agent_runs.status` = 'failed' | Nag agent itself broke |
| Sync failed | `sync_state.status` = 'error' | Notion sync is down |
| Project completed | `projects.status` -> 'completed' | Celebrate + invoice |
| Content published | `content_items.status` -> 'published' | Update metrics |

### 4.2 Mission Control's Specific Nag Triggers (Burak's Reality)

Based on the MEMORY.md context and current situation:

| Priority | Trigger | Current State | Why It Matters |
|----------|---------|---------------|----------------|
| P0 | Einstiegsgeld deadline | 49 days left (2026-05-31) | Government requirement: "erste Vertraege mit Kunden" |
| P0 | Content Week 1 | Video 1 due Mo April 13, 08:00 | Content strategy locked, must execute |
| P0 | Kaelte Aktiv outreach | No invoice sent yet | Hottest candidate for first revenue |
| P1 | Mitwirkungsschreiben | Status unknown in Jobcenter.digital | Potentially 2K+ EUR at risk |
| P1 | Claude Max renewal | ~$200/mo recurring | Track ROI vs. spend |
| P2 | OmniPort-HH known issues | 4 sub-pages 404, Talentpool wrong | Client work with open items |
| P2 | MAYTT paused | All docs complete, sprint ready | Should be marked paused explicitly |
| P3 | ColdyAI 95% done | Voice AI pivot to vertical | Needs final push or explicit park |

---

## 5. The "Useful Nag" Balance -- Avoiding Notification Fatigue

### 5.1 The Problem: Alert Fatigue

Brianroemmele's insight is crucial:
> "The key to useful AI agents is strategic forgetting -- knowing what NOT to surface. Without forgetting, agents become noise machines."

Matt Shumer (OpenClaw/Hermes) adds the tiered decay model:
- Short-term (current session): everything visible
- Medium-term (this week): only warning+ items
- Long-term (persistent): only critical/overdue

The anti-pattern is the "notification waterfall" -- an agent that surfaces 47 items every morning. The human learns to ignore it, and the agent becomes useless.

### 5.2 Design Principles for the Useful Nag

#### Principle 1: Escalation Tiers Gate Visibility
Not all items appear in every briefing:

| Tier | Daily Briefing | Weekly Summary | First Appearance |
|------|---------------|----------------|------------------|
| Critical | ALWAYS (top) | ALWAYS | Immediately |
| Overdue | ALWAYS | ALWAYS | Day item becomes overdue |
| Urgent | ALWAYS | Summary count | 3 days before due |
| Warning | Count only | Detailed list | 7 days before due |
| Info | Omitted | Summary count | Never in daily |

#### Principle 2: Snooze and Acknowledge
The nag agent must support suppression:

```json
// snooze-rules.json
{
  "snoozed": [
    { "item_id": "abc123", "until": "2026-04-20", "reason": "Waiting for client response" },
    { "item_id": "def456", "until": "forever", "reason": "Intentionally paused" }
  ]
}
```

Items snoozed until a date reappear automatically when the snooze expires. Items snoozed "forever" only appear in monthly audits.

#### Principle 3: The "Top 3" Rule
The daily briefing opens with exactly 3 items. Not 1, not 7 -- three. This is the "if you do nothing else today, do these" section.

Algorithm:
1. All critical items (skip snooze check for critical)
2. Then overdue items sorted by days overdue (most overdue first)
3. Then urgent items sorted by days until due (soonest first)
4. Cap at 3. If more than 3 critical/overdue, show them all but visually group.

#### Principle 4: Progressive Disclosure
The briefing is scannable in 10 seconds but drillable:

```markdown
# Daily Briefing -- 2026-04-12

## Do Today (3 items)
- [!!] Einstiegsgeld: erste Vertraege -- 49 days left
- [!!] Video 1 recording -- scheduled Mo 08:00  
- [!]  Kaelte Aktiv: send proposal email

## Also On Your Radar (5 items)
> 2 overdue | 3 upcoming this week
> [expand for details]

## Stale Items (2 items)
> MAYTT: no activity 14 days | ColdyAI: no activity 21 days
> [expand for details]

## System Health
> All syncs OK | Last nag run: 06:00 | Next: 12:00
```

#### Principle 5: Frequency Matters
- **Daily briefing**: Generated at 06:00, regenerated at 12:00 and 18:00
- **Weekly summary**: Monday morning, includes trend data
- **Monthly audit**: Surfaces ALL items including snoozed, for review
- The user is NEVER interrupted. They read the file when ready.

#### Principle 6: Celebrate Completions
Not just nags -- the agent should also surface wins:
- "Project X completed yesterday"
- "3 tasks closed this week (up from 1 last week)"
- "Revenue this month: EUR X (first invoice!)"

This prevents the briefing from becoming a pure anxiety list.

---

## 6. Implementation Architecture

### 6.1 Technology Evaluation

#### Option A: Cron + Claude Code Headless (RECOMMENDED)

```
launchd/cron
  -> /bin/bash nag-agent.sh
    -> claude --headless --prompt "Scan MC database, generate daily briefing"
      -> Reads SQLite directly
      -> Writes briefing to output/daily-briefing-YYYY-MM-DD.md
      -> Writes log to output/nag-log.jsonl
```

| Criterion | Score | Notes |
|-----------|-------|-------|
| Fit for purpose | 9/10 | Exact match for scheduled scan + report |
| Maturity | 8/10 | Claude Code headless is production-proven |
| Cost | 10/10 | Claude Max subscription = zero marginal cost |
| Complexity | 9/10 | Shell script + CLAUDE.md prompt = minimal code |
| Maintenance | 9/10 | No dependencies, no server, no deployment |
| Flexibility | 8/10 | LLM can reason about items, not just threshold-check |
| Risk | Low | Worst case: briefing file is empty or late |

**Total: 63/70**

#### Option B: TypeScript Scanner (Finance-Agent Port)

```
launchd/cron
  -> npx tsx src/nag-agent.ts
    -> Opens SQLite with better-sqlite3
    -> Runs queries for each trigger type
    -> Classifies with escalation engine
    -> Writes briefing markdown
```

| Criterion | Score | Notes |
|-----------|-------|-------|
| Fit for purpose | 9/10 | Direct port of working Finance-Agent |
| Maturity | 9/10 | All deps are stable (better-sqlite3, tsx) |
| Cost | 10/10 | No API calls, no LLM tokens |
| Complexity | 7/10 | More code to write and maintain |
| Maintenance | 7/10 | TypeScript deps, build chain |
| Flexibility | 5/10 | Fixed logic, can't reason about nuance |
| Risk | Low | Deterministic, testable |

**Total: 57/70**

#### Option C: Hybrid (TypeScript Scanner + Claude Code for Synthesis)

```
launchd/cron
  -> npx tsx src/nag-scanner.ts
    -> Scans SQLite, produces raw-scan.json
  -> claude --headless --prompt "Read raw-scan.json, write today's briefing"
    -> LLM synthesizes, prioritizes, writes natural language briefing
```

| Criterion | Score | Notes |
|-----------|-------|-------|
| Fit for purpose | 10/10 | Best of both worlds |
| Maturity | 8/10 | Two-stage pipeline, both parts proven |
| Cost | 9/10 | One Claude Code call per run |
| Complexity | 6/10 | Two systems to coordinate |
| Maintenance | 6/10 | TS scanner + prompt engineering |
| Flexibility | 10/10 | LLM handles nuance, scanner handles data |
| Risk | Medium | Two failure points |

**Total: 59/70**

#### Option D: MC Dashboard Built-In (Next.js API Route)

```
Mission Control app
  -> /api/nag-scan (API route)
    -> Queries SQLite via Drizzle
    -> Returns JSON with classified items
  -> Uebersicht page renders "Do Today" widget
  -> Optional: file export for terminal reading
```

| Criterion | Score | Notes |
|-----------|-------|-------|
| Fit for purpose | 7/10 | Integrated but requires MC to be running |
| Maturity | 8/10 | Standard Next.js patterns |
| Cost | 10/10 | No external calls |
| Complexity | 7/10 | Part of the app, tested with app |
| Maintenance | 8/10 | Same codebase, same deploy |
| Flexibility | 4/10 | Fixed logic in API route |
| Risk | Medium | Coupled to MC being up and running |

**Total: 54/70**

### 6.2 Comparison Matrix

| Criterion | A: Claude Headless | B: TS Scanner | C: Hybrid | D: MC Built-In |
|-----------|-------------------|---------------|-----------|----------------|
| Fit for purpose | 9 | 9 | 10 | 7 |
| Maturity | 8 | 9 | 8 | 8 |
| Cost | 10 | 10 | 9 | 10 |
| Complexity | 9 | 7 | 6 | 7 |
| Maintenance | 9 | 7 | 6 | 8 |
| Flexibility | 8 | 5 | 10 | 4 |
| Risk | Low | Low | Medium | Medium |
| **Total** | **63** | **57** | **59** | **54** |

### 6.3 Primary Recommendation: Option A (Cron + Claude Code Headless)

**Rationale**:

1. **Simplicity wins**: One shell script, one CLAUDE.md prompt file, one cron entry. No build chain, no dependencies, no deployment.

2. **LLM reasoning is the differentiator**: A fixed TypeScript scanner can only check thresholds. Claude Code headless can REASON about items: "Einstiegsgeld deadline is in 49 days AND you have zero revenue AND the Kaelte Aktiv proposal exists but hasn't been sent -- this is your #1 priority today."

3. **Zero marginal cost**: Claude Max $200/mo makes each nag agent run essentially free. There is no API bill to worry about.

4. **Matches our stack philosophy**: "Simplicity over ego" (from MEMORY.md). tmux + Claude Code + prompts. No complex infrastructure.

5. **Fastest to implement**: Estimated 2-3 hours to working prototype.

6. **Already proven**: The Finance-Agent exists and works. This is the same pattern, generalized.

**Fallback**: If Claude Code headless proves unreliable for scheduled runs (cold start latency, rate limits, etc.), fall back to Option B (TypeScript scanner) which is deterministic and testable.

---

## 7. Implementation Blueprint

### 7.1 File Structure

```
missioncontrole/
  agents/
    nag-agent/
      CLAUDE.md              # Agent personality + scanning instructions
      run.sh                  # Entry point for cron
      snooze-rules.json       # User-managed suppression
      output/
        daily-briefing-YYYY-MM-DD.md
        nag-log.jsonl
        weekly-summary-YYYY-WNN.md
```

### 7.2 CLAUDE.md for the Nag Agent

```markdown
# Nag Agent -- Mission Control Daily Scanner

## Purpose
You are a proactive obligation scanner. You run on a schedule, read the
Mission Control SQLite database, and generate a daily briefing file.
You surface what needs attention. You protect the human's attention
by being selective.

## Database Location
/Users/buraksmac/Desktop/code2/missioncontrole/data/mission-control.db

## Scanning Rules

### Time-Triggered Scans
1. Query `deadlines` WHERE status = 'pending' ORDER BY due_date ASC
2. Query `tasks` WHERE status IN ('todo','in_progress','blocked') AND due_date IS NOT NULL
3. Query `creditors` WHERE next_due_date IS NOT NULL
4. Query `subscriptions` WHERE next_renewal_date IS NOT NULL
5. Query `goals` WHERE status = 'active' AND target_date IS NOT NULL
6. Query `content_items` WHERE status NOT IN ('published') AND scheduled_date IS NOT NULL

### Decay Scans
7. Query `projects` WHERE status = 'active' AND updated_at < date('now', '-14 days')
8. Query `tasks` WHERE status = 'in_progress' AND updated_at < date('now', '-7 days')
9. Query `content_items` WHERE status = 'idea' AND updated_at < date('now', '-30 days')

### Condition Scans
10. Count tasks WHERE status = 'blocked'
11. Count overdue items across all tables
12. Check financial_snapshots for current month existence

## Classification
Use the Finance-Agent escalation tiers:
- Info: > 7 days until due
- Warning: 3-7 days
- Urgent: 1-3 days
- Overdue: 0-7 days past
- Critical: > 7 days past

## Snooze Rules
Read snooze-rules.json. Skip items listed with unexpired snooze.
Critical items IGNORE snooze (safety override).

## Output Format
Write to: output/daily-briefing-YYYY-MM-DD.md

Format:
1. "Do Today" section: Top 3 items (critical > overdue > urgent)
2. "On Your Radar" section: Warning items, counts only
3. "Stale Items" section: Decay-triggered items
4. "Wins" section: Recently completed items (last 7 days)
5. "System Health" section: Agent run status, sync status

Be concise. The human should scan this in 10 seconds.

## Hard-Coded Context
- Einstiegsgeld deadline: 2026-05-31 (CRITICAL -- government requirement)
- Content Video 1: 2026-04-13 08:00
- Claude Max: ~$200/mo renewal
```

### 7.3 run.sh

```bash
#!/bin/bash
# Nag Agent -- scheduled runner
# Add to crontab: 0 6,12,18 * * * /path/to/run.sh

cd /Users/buraksmac/Desktop/code2/missioncontrole/agents/nag-agent

# Run Claude Code headless with the nag agent prompt
claude --headless \
  --prompt "Read your CLAUDE.md instructions. Scan the Mission Control database. Generate today's daily briefing. Write it to output/daily-briefing-$(date +%Y-%m-%d).md. Also append a one-line JSON log entry to output/nag-log.jsonl with timestamp, item counts by tier, and run duration." \
  2>> output/nag-errors.log

# Verify output was created
if [ -f "output/daily-briefing-$(date +%Y-%m-%d).md" ]; then
  echo "[$(date -Iseconds)] Nag agent completed successfully" >> output/nag-log.txt
else
  echo "[$(date -Iseconds)] WARNING: No briefing generated" >> output/nag-log.txt
fi
```

### 7.4 launchd Plist (macOS Native Scheduling)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.burak.nag-agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/buraksmac/Desktop/code2/missioncontrole/agents/nag-agent/run.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>18</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>StandardOutPath</key>
  <string>/Users/buraksmac/Desktop/code2/missioncontrole/agents/nag-agent/output/launchd-stdout.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/buraksmac/Desktop/code2/missioncontrole/agents/nag-agent/output/launchd-stderr.log</string>
  <key>WorkingDirectory</key>
  <string>/Users/buraksmac/Desktop/code2/missioncontrole/agents/nag-agent</string>
</dict>
</plist>
```

Install: `cp com.burak.nag-agent.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/com.burak.nag-agent.plist`

### 7.5 MC Dashboard Integration (Phase 2)

Once the nag agent is running and producing briefing files:

1. **Uebersicht page widget**: Read `output/daily-briefing-*.md` and render the "Do Today" section as a card
2. **Command palette action**: `Cmd+K -> "Show today's briefing"` opens the markdown file in a side panel
3. **Agent panel integration**: The nag agent appears in `agent_runs` table, visible in the Agent-Chat module
4. **Snooze from UI**: Click a nag item -> "Snooze for 7 days" -> updates snooze-rules.json

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Claude Code headless not available on schedule (rate limit, network) | Medium | Low | Fall back to TypeScript scanner for next run; keep last briefing visible |
| Briefing becomes noise (too many items) | Medium | High | Strict tier gating + snooze + Top 3 rule |
| User ignores briefing file (doesn't read it) | Medium | High | Integrate into MC dashboard Uebersicht page; make it the first thing visible |
| SQLite database empty (no data seeded yet) | High (Phase 1) | Low | Agent detects empty DB, writes "No data yet -- seed your Mission Control first" |
| Stale briefing (agent fails silently) | Low | Medium | launchd logs + "System Health" section shows last run time |
| Over-reliance on hard-coded context | Medium | Low | Gradually move hard-coded items (Einstiegsgeld) into `deadlines` table |
| LLM hallucination in briefing | Low | Medium | Agent reads real data from SQLite; cross-reference briefing with raw query results |

---

## 9. Effort Estimates

| Phase | Work | Estimate | Dependencies |
|-------|------|----------|--------------|
| **Phase 0: Prototype** | Create agents/nag-agent/ directory, CLAUDE.md, run.sh | 1-2 hours | MC SQLite DB with seed data |
| **Phase 1: Manual Runs** | Test with `./run.sh`, iterate on CLAUDE.md prompt | 2-3 hours | Phase 0 |
| **Phase 2: Schedule** | Create launchd plist, install, verify | 30 minutes | Phase 1 |
| **Phase 3: Snooze** | Create snooze-rules.json, update CLAUDE.md | 1 hour | Phase 1 |
| **Phase 4: Dashboard** | Uebersicht widget reads briefing file | 2-3 hours | MC Phase 1 shipped |
| **Phase 5: UI Snooze** | Snooze button in dashboard | 2-3 hours | Phase 4 |
| **Total MVP (Phases 0-2)** | | **3.5-5.5 hours** | |
| **Total Complete** | | **9-12 hours** | |

---

## 10. Relationship to Existing Patterns

### 10.1 Adoptable Patterns Applied

| Pattern ID | Pattern | How It Applies |
|------------|---------|----------------|
| AP-01 | Thin harness, fat skills | run.sh is thin; CLAUDE.md skill is fat |
| AP-02 | File-first communication | Briefing file is the output, not a notification |
| AP-05 | CEO-not-developer | Nag agent reads and reports, never modifies data |
| AP-06 | Wiki-structured memory | Briefing files form a chronological wiki |
| AP-33 | Temporal-aware scheduling | launchd triggers at 06:00/12:00/18:00 |
| AP-34 | Escalation-tier classification | Finance-Agent's 5-tier system generalized |
| AP-35 | Proactive surfacing via decay | Stale project/task detection |
| AP-36 | Prospective memory layer | Future obligations as the core function |
| AP-37 | Daily briefing as primary output | "Do Today" section optimized for 10-second scan |
| AP-39 | Strategic forgetting | Snooze rules + tier gating = noise reduction |

### 10.2 Convergence with Ecosystem

This implementation sits at the intersection of five practitioner streams:

1. **IndyDevDan's CEO Agent**: Proactive scanning + state-driven decisions
2. **Garry Tan's gbrain**: Temporal decay + proactive surfacing
3. **Icarus Protocol**: Prospective memory (future obligations)
4. **Brianroemmele's Forgetting Strategy**: Noise reduction through strategic suppression
5. **AIE Europe Consensus**: "Agent proposes, human disposes" + "cron job of the AI age"

---

## 11. Alternative Approaches and Fallbacks

### If Claude Code Headless Proves Unreliable

Fall back to **Option B** (TypeScript scanner). Port the Finance-Agent's escalation engine to work with SQLite instead of Notion. This is deterministic, testable, and has zero external dependencies.

Estimated additional effort: 4-6 hours to port and generalize.

### If the Briefing File Goes Unread

Add a **terminal hook** that prints the Top 3 when opening a new terminal:

```bash
# In .zshrc or cmux startup
NAG_FILE="$HOME/Desktop/code2/missioncontrole/agents/nag-agent/output/daily-briefing-$(date +%Y-%m-%d).md"
if [ -f "$NAG_FILE" ]; then
  head -15 "$NAG_FILE"
  echo "\n--- Full briefing: cmux markdown open ~/Desktop/code2/missioncontrole/agents/nag-agent/output/daily-briefing-$(date +%Y-%m-%d).md ---"
fi
```

This makes the nag inescapable without being annoying.

### If the Database Is Empty

Before MC has real data, the nag agent can scan:
- Git repos for stale branches
- GitHub issues/PRs for staleness
- File system for recently modified project directories
- Calendar files (.ics) for upcoming events

This makes the nag agent useful even before Mission Control is fully populated.

### Long-Term Evolution: Multi-Agent Nag Network

As MC matures:
1. **Finance Nag**: Scans financial tables (already exists as Finance-Agent)
2. **Content Nag**: Scans content pipeline, flags missed publish dates
3. **Project Nag**: Scans projects/tasks, flags staleness
4. **Health Nag**: Scans agent_runs, flags failed agents

Each writes its own section to the briefing. The master nag agent merges them.

---

## 12. Final Verdict

### Primary Recommendation

**Cron + Claude Code headless + SQLite direct read + markdown briefing file**

This is the simplest possible implementation that delivers the full value proposition. It:
- Runs three times daily via launchd
- Reads MC's SQLite database directly
- Classifies items using the Finance-Agent's proven escalation tiers
- Writes a scannable daily briefing optimized for 10-second reading
- Supports snooze/suppression to prevent notification fatigue
- Costs nothing beyond the existing Claude Max subscription
- Takes 3.5-5.5 hours to reach working MVP

### Why This Is MC's Differentiator

Every dashboard shows you what you have. The nag agent tells you what you should DO. This is the difference between a data display and a decision support system.

The daily briefing file is not a feature of Mission Control. It IS Mission Control. The dashboard is just the visual wrapper around the nag agent's output.

### Implementation Priority

This should be built in **MC Wave 2**, immediately after the Notion sync integration. The nag agent needs data to scan, and Notion sync provides the initial data load.

Alternatively, it can be prototyped NOW against the seed data to validate the CLAUDE.md prompt and briefing format. A 2-hour prototype against seed data, followed by real data integration when Notion sync ships.

---

## Appendix A: Catalogue Sources Referenced

| Entry | Path |
|-------|------|
| IndyDevDan PI CEO Agents | `research/catalogue/talks/2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md` |
| gbrain (Garry Tan) | `research/catalogue/agent-memory/garrytan-gbrain.md` |
| Hermes-Wiki | `research/catalogue/agent-harnesses/hermes-wiki.md` |
| Icarus Memory Protocol | `research/catalogue/posts/2026-04-03_icarus-memory-protocol-self-training.md` |
| Karpathy LLM Wiki | `research/catalogue/posts/2026-04/karpathy-llm-wiki-knowledge-bases.md` |
| Noah Zweben Scheduling | `research/catalogue/posts/2026-03/noahzweben-schedule-cloud-jobs.md` |
| Brendan Falk Unbounded Skills | `research/catalogue/posts/2026-03/brendanfalk-unbounded-agent-skills.md` |
| Harness Convergence Synthesis | `research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md` |
| AIE Europe Synthesis | `research/catalogue/conference-reports/aie-europe-2026-synthesis.md` |
| Vincent Kottsch Dark Factories | `research/catalogue/talks/2026-04/aie-europe-2026-vincent-kottsch-dark-factories.md` |
| Sunil Pai Code Mode | `research/catalogue/talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md` |

## Appendix B: Discovery Sources Referenced (Not Yet Catalogued)

| Entry | Path |
|-------|------|
| Helena Autonomous Marketer | `_bmad/ingest-discoveries/seijinjung-helena-autonomous-ai-marketer.json` |
| HermesAgent Dashboard | `_bmad/ingest-discoveries/outsource-hermesagent-workspace-dashboard.json` |
| Brianroemmele Forgetting | `_bmad/ingest-discoveries/brianroemmele-memory-forgetting-strategy-agents.json` |
| MemFactory | `_bmad/ingest-discoveries/omarsar0-memfactory-agent-memory-framework.json` |
| Matt Shumer Memory Systems | `_bmad/ingest-discoveries/mattshumer-memory-systems-openclaw-hermes.json` |
| Pawel Huryn Orchestration | `_bmad/ingest-discoveries/pawelhuryn-orchestration-over-autonomy.json` |
| Production Debugging Agent | `_bmad/ingest-discoveries/vincent-hus-production-debugging-agent.json` |
| Personal KB Agents Obsidian | `_bmad/ingest-discoveries/omarsar0-personal-knowledge-base-agents-obsidian.json` |

## Appendix C: Finance-Agent Code Analyzed

| File | Role |
|------|------|
| `/Users/buraksmac/Desktop/code2/Finance-agent/CLAUDE.md` | Agent configuration with 5-tier escalation spec |
| `/Users/buraksmac/Desktop/code2/Finance-agent/src/index.ts` | Core loop: scan -> classify -> report -> log |
| `/Users/buraksmac/Desktop/code2/Finance-agent/src/services/escalation-engine.ts` | Pure-function urgency classifier (the heart) |
| `/Users/buraksmac/Desktop/code2/Finance-agent/src/services/deadline-monitor.ts` | Notion DB scanner with schema normalization |
| `/Users/buraksmac/Desktop/code2/Finance-agent/src/services/report-generator.ts` | Markdown briefing and weekly summary generator |
| `/Users/buraksmac/Desktop/code2/Finance-agent/src/types.ts` | Type definitions for FinanceItem and EscalatedItem |
