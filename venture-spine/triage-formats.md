# Morning Triage Output Formats -- Venture Spine

> **Task**: Design the single most-read artifact the Venture Spine produces.
> **Constraint**: Parseable in 30 seconds. Terminal-native. Scales to 10 projects.
> **Date**: 2026-03-25

---

## Design Principles (from Wave 1 Research)

Before evaluating formats, the cognitive science imposes hard constraints:

1. **4-item working memory limit** -- the triage must not ask the reader to hold more than 4 things at once
2. **30-second parse time** -- matches the briefing-document pattern from Leroy's Ready-to-Resume research
3. **Exception-based, not exhaustive** -- "don't tell me things are fine, tell me when they're not" (Cognitive Science, Section 6)
4. **Graduated depth** -- glance (1s), scan (30s), deep dive (5min) must all be supported
5. **Reduce decisions, don't add them** -- every line must either inform or recommend, never just display data
6. **Write-free for the founder** -- fully auto-generated from git/gh/ccusage signals

---

## Format A: "News Anchor"

Narrative summary with embedded recommendations. Mimics a news anchor who curates, prioritizes, and narrates rather than showing raw feeds.

```
================================================================
  VENTURE SPINE -- MORNING TRIAGE
  Tuesday, 2026-03-25 06:00
  Portfolio: 5 active / 2 hibernated
================================================================

Good morning. Your portfolio is mostly healthy. Two items need
your attention today.

PRIORITY 1 -- OmniPort-HH (Tier 1, Revenue)
  The 4 missing sub-pages (Stellenmarkt, Stadt.Herz,
  Unternehmenslandschaft, Profil) still return 404. Customer
  meeting feedback from March 17 flagged these. No agent has
  worked on this since March 17 (8 days stale).
  --> Recommended: Spawn agent to scaffold the 4 sub-pages.
      This is the highest-WSJF item (client deadline proximity).

PRIORITY 2 -- Orchestrator (Tier 2, Infrastructure)
  Wave 3 meta-research is in progress. 7 of 8 tasks complete.
  Worker in tmux window "wave3-task5" finished 14 minutes ago.
  No blockers.
  --> Recommended: Review completed research, then proceed
      to Venture Spine implementation (Day 0 roadmap).

ALL CLEAR:
  ContentOS     -- agents merged 2 PRs overnight, CI green
  Finance-Agent -- no activity (maintenance tier, expected)
  Research      -- catalogue ingestion running, 12 new entries

TOKEN BUDGET: 23% of daily allocation used (overnight agents).
              77% available for today's focused work.

================================================================
  TODAY'S PLAN (auto-generated):
  1. OmniPort-HH: sub-page scaffolding (spawn 2 agents)
  2. Orchestrator: review Wave 3 output + begin Day 0
  3. ContentOS: no action needed (agents autonomous)
================================================================
```

---

## Format B: "Traffic Light Grid"

One line per project. Maximum information density. Designed for the 1-second glance and 10-second scan.

```
================================================================
  VENTURE SPINE -- MORNING TRIAGE
  2026-03-25 06:00 | 5 active | tokens: 23% used
================================================================

PROJECT            TIER  HEALTH  STALE  PRs  CI   ALERT
-----------        ----  ------  -----  ---  ---  -----
omniport-hh         T1   [!!]    8d     0   pass  4 sub-pages 404
orchestrator        T2   [ok]    0d     0   pass  --
contentos           T2   [ok]    0d     2   pass  2 PRs merged overnight
finance-agent       T3   [ok]   12d     0   pass  -- (maintenance)
research            T3   [ok]    0d     0    --   12 new catalogue entries

LEGEND: [!!] = needs attention  [ok] = healthy  [XX] = broken

----------------------------------------------------------------
NEEDS YOUR DECISION (1 item):
  omniport-hh: 4 sub-pages still 404. Spawn agents? (Y = default)

AGENTS OVERNIGHT:
  contentos/worker-1   -- PR #31 merged (blog template)
  contentos/worker-2   -- PR #32 merged (SEO metadata)
  research/librarian   -- 12 entries ingested, 0 duplicates

TODAY'S RECOMMENDED FOCUS: omniport-hh (highest WSJF)
================================================================
```

---

## Format C: "Exception Report"

Only shows projects that need attention. Healthy projects are collapsed to a single line. Designed for the founder who wants to know "is anything on fire?" in under 5 seconds.

```
================================================================
  VENTURE SPINE -- MORNING TRIAGE
  2026-03-25 06:00
================================================================

NEEDS ATTENTION (1 of 5 projects):

  omniport-hh [T1, Revenue]
    Issue:    4 sub-pages return 404 (8 days unresolved)
    Impact:   Customer-facing. Flagged in March 17 meeting.
    Agents:   None running. Last commit 8 days ago.
    Action:   Spawn 2 agents for sub-page scaffolding.
              Estimated: 2-3 hours agent time.

ALL CLEAR (4 of 5):
  orchestrator ... T2, 0d stale, research wave finishing
  contentos ...... T2, 0d stale, 2 PRs merged overnight
  finance-agent .. T3, maintenance mode, no action needed
  research ....... T3, 12 new catalogue entries ingested

HIBERNATED (not monitored): CityHub, adwo-2

----------------------------------------------------------------
OVERNIGHT AGENT LOG:
  2 PRs merged  |  0 failures  |  23% token budget used

TODAY: Focus on omniport-hh. Everything else is autonomous.
================================================================
```

---

## Project-Switch Briefing Template

Triggered automatically when the founder context-switches from one project to another. Replaces the 20-30 minute "where was I?" warmup with a 30-second read.

```
================================================================
  SWITCHING TO: OmniPort-HH
  Last touched: 8 days ago (2026-03-17)
================================================================

SINCE YOU LEFT:
  Commits:    0 (no agent or human activity)
  PRs:        0 open, 0 merged
  Issues:     3 open (unchanged)
  CI:         All passing
  Deploy:     https://omniport-hh.vercel.app (live, current)

CURRENT STATE:
  Phase:      Active development
  Focus:      HiArbeit portal cards + sub-page scaffolding
  Blockers:   Google Imagen API key invalid (workaround: Unsplash)

OPEN THREADS (what you were working on):
  1. 4 sub-pages return 404 (Stellenmarkt, Stadt.Herz,
     Unternehmenslandschaft, Profil)
  2. Jobportal HAZ API wrapper (external integration)
  3. Font: body text still IBM Plex Sans, not Ysabeau
  4. HiWissen has no dedicated circle logo

KEY CONTEXT (chunk loader):
  Tech:       Next.js 16 + Supabase + shadcn/ui + TypeScript
  Colors:     HiArbeit=#CE6715, HiEngagement=#8BBF9E,
              HiGruendung=#0998C1, HiErleben=#008580
  Design law: Pixel-match customer PDF. No creative liberty.
  Last meeting: March 17 (notes in MEETING-NOTES-17-03.md)

UPCOMING:
  No scheduled meetings or deadlines in the next 7 days.

RECOMMENDED FIRST ACTION:
  Spawn agent for sub-page scaffolding (highest WSJF).
  Start with Stellenmarkt -- it has the most customer visibility.
================================================================
```

---

## Evaluation Matrix

| Criterion                     | Format A (News Anchor) | Format B (Traffic Light) | Format C (Exception Report) |
|-------------------------------|:----------------------:|:------------------------:|:---------------------------:|
| **Time to parse (seconds)**   | 25-40s                 | 8-15s                    | 5-12s                       |
| **Actionability**             | High -- actions inline | Medium -- grid then reco | High -- action per exception|
| **Information density**       | Low -- narrative padds | High -- max data/line    | Medium -- focused on deltas |
| **Works in terminal**         | Yes (plain text)       | Yes (columnar)           | Yes (plain text)            |
| **Scales to 10 projects**     | Poorly -- gets verbose | Well -- one line each    | Well -- only exceptions     |
| **Glance mode (1s)**          | No -- must read prose  | Yes -- scan the grid     | Yes -- count exceptions     |
| **Scan mode (30s)**           | Yes -- full narrative  | Yes -- grid + decisions  | Yes -- full report          |
| **Reduces decisions**         | Yes -- plan included   | Partial -- asks Y/N      | Yes -- actions prescribed   |
| **Cognitive load**            | Medium -- must parse   | Low -- pattern match     | Lowest -- exceptions only   |
| **Overnight agent awareness** | Inline in narrative    | Separate section         | Separate section            |

### Scoring (1-5 scale, 5 = best)

| Criterion              | Weight | A (Anchor) | B (Traffic) | C (Exception) |
|------------------------|--------|------------|-------------|----------------|
| Parse time             | 25%    | 2          | 4           | 5              |
| Actionability          | 25%    | 5          | 3           | 5              |
| Information density    | 15%    | 2          | 5           | 3              |
| Terminal-native        | 10%    | 4          | 5           | 5              |
| Scales to 10 projects  | 15%    | 1          | 5           | 5              |
| Reduces decisions      | 10%    | 5          | 3           | 5              |
| **WEIGHTED TOTAL**     |        | **3.00**   | **4.10**    | **4.70**       |

---

## Recommendation: Hybrid C+B

**Primary format: Exception Report (Format C)** with a Traffic Light Grid header.

The cognitive science is unambiguous: the founder's scarcest resource is attention, not information. Format C respects this by showing ONLY what requires human judgment and collapsing everything else. The Exception Report pattern directly implements the research findings:

- **"Don't tell me things are fine, tell me when they're not"** (Ambient Awareness, Section 6)
- **4-item working memory limit** -- exceptions are typically 0-2 items, well within capacity
- **Ready-to-Resume plan** -- each exception includes the recommended action, not just the problem
- **Temporal batching** -- one read per morning, not continuous monitoring

However, Format B's grid provides something C lacks: a fast visual confirmation that the "ALL CLEAR" projects really are clear. The human brain pattern-matches columnar data faster than prose. Adding a compact grid at the top gives the founder the "ambient pulse" without reading prose.

### The Recommended Hybrid Format

```
================================================================
  VENTURE SPINE -- MORNING TRIAGE
  2026-03-25 06:00 | 5 active | tokens: 23% used
================================================================

  omniport-hh    T1  [!!]  8d stale   0 PRs   CI pass
  orchestrator   T2  [ok]  0d stale   0 PRs   CI pass
  contentos      T2  [ok]  0d stale   0 PRs   CI pass
  finance-agent  T3  [ok]  maintenance
  research       T3  [ok]  0d stale

----------------------------------------------------------------
NEEDS ATTENTION (1 of 5):

  omniport-hh [T1, Revenue]
    4 sub-pages return 404. 8 days unresolved.
    Customer-facing issue from March 17 meeting.
    --> Spawn 2 agents for sub-page scaffolding.

OVERNIGHT:
  2 PRs merged (contentos) | 12 catalogue entries (research)
  0 failures | 0 stuck agents

TODAY: OmniPort-HH sub-pages. Everything else is autonomous.
================================================================
```

This hybrid parses in under 10 seconds:
- **1 second**: Glance at grid -- one `[!!]`, rest `[ok]`. System is mostly fine.
- **5 seconds**: Read the one exception. Understand the problem and recommended action.
- **3 seconds**: Scan overnight summary and today's focus.

The founder makes exactly one decision: "Do I agree with the recommended action?" Everything else is handled.

### Implementation Notes

1. **Generator**: Shell script (`triage.sh`) that reads `projects.json`, queries `gh` and `git` per project, computes staleness/health, and renders the template. No LLM needed for the standard output.
2. **LLM fallback**: If an anomaly is detected that the deterministic rules cannot classify (e.g., unusually high token spend with no corresponding PRs), invoke a cheap model (Haiku/Flash) for a one-sentence interpretation.
3. **Output location**: `venture-spine/daily-triage.md` -- overwritten each morning by cron at 06:00.
4. **Project-switch briefing**: Generated on-demand by reading `project-dna.yaml` + `gh` signals. Could be triggered by a `/switch <project>` Claude Code command or automatically when `run-tmux.sh` targets a different project.
5. **Notification**: If any `[!!]` or `[XX]` items exist, optionally send a one-line push notification (macOS `osascript` or Telegram bot) so the founder sees it without opening a terminal.
