---
title: "MC Manifesto — The Definitive Mission Control v2 Decision Document"
created: "2026-04-12"
status: LOCKED
synthesized_from:
  - 00-CATALOGUE-EXPLORATION.md (35+ catalogue entries)
  - 01-CURRENT-STATE-ANALYSIS.md (4 Notion hubs, 17-table schema, 5-phase plan)
  - 02-PAIN-POINTS-AND-NEEDS.md (behavioral diagnosis, 50-day sprint)
  - VISION.md (v2 spec)
  - MEMORY.md (project decisions)
  - notion-sources.md (4 hubs + 11 Finance sub-DBs)
  - SYNTHESIS-2026-04-12.md (v1 cross-chat synthesis, superseded)
  - Research catalogue (530+ entries, Karpathy/gbrain/Harrison Chase/Steph Ango convergence)
purpose: "Every open question answered. Every decision locked. No more debate."
---

# MC Manifesto

## Section 1: Executive Summary

Mission Control is a **local-first personal command center** for a solo developer running multiple businesses, built on Next.js 16 + SQLite + Claude Code headless. It aggregates data from Notion (read-only, forever) and surfaces it through four interfaces ordered by priority: Claude Code native, `mc` CLI, a daily Nag Agent briefing, and a reduced-scope web UI.

MC is NOT a Notion replacement. It is NOT a product for sale. It is NOT a second brain. It is a **forcing function** that makes Burak confront his obligations every morning instead of building another system to avoid them.

**One-sentence thesis**: Mission Control succeeds only if it becomes the thing Burak opens first and closes last -- and it does that by nagging, not by dashboarding.

---

## Section 2: The Diagnosis

### The Build-vs-Use Pattern

The evidence is unambiguous. Across 8 repos, 4 Notion hubs, and 3 agent systems, the same pattern repeats:

1. Feel overwhelmed by scattered obligations
2. Build a system to organize them (feels productive, reduces anxiety)
3. System works well enough to surface the actual obligations
4. The obligations are uncomfortable (send overdue letters, call clients, file taxes)
5. Drift away from the system. Start thinking about a better system
6. Return to step 1

**Evidence trail**: Finance-Agent built in February, last ran February 18. Obsidian vault built April 4, has 1 journal entry. Mission Control skeleton built April 12, has no `.env.local` -- Notion sync was never attempted. ContentOS has a 1,051-line strategy document and zero published videos.

### The 70% Abandonment Probability

Based on the pattern above, Mission Control has approximately a **70% chance of being abandoned within 3 weeks** unless specific countermeasures are in place. Four organizational systems already exist (Notion, Obsidian, Finance-Agent, MC). None are used consistently. Adding a fifth layer of abstraction will not solve the problem unless MC is fundamentally different from everything that came before it.

### What Must Be True for MC to Survive Past Week 3

| Condition | Why It Matters | How to Verify |
|---|---|---|
| MC shows real data on first launch | Demo data is not motivating. Notion sync must work Day 1. | `.env.local` exists, `syncLabProjects()` returns rows |
| MC takes less than 10 seconds to open | If it's slower than opening Notion, it loses. | `time npm run dev` < 10s cold start |
| MC nags Burak without him opening it | The Nag Agent runs on cron, delivers briefing to terminal. No app-open required. | `launchd` plist active, `mc briefing` runs at 08:00 |
| MC is useful from Claude Code directly | Burak lives in the terminal. If he has to switch to a browser, he won't. | `mc overdue` returns data from CLI |
| MC does NOT become a building project | No new features for 30 days after MVP. Use it or kill it. | Feature freeze enforced in this manifesto |

---

## Section 3: Architecture Decisions (LOCKED)

Every technical decision is final. No reopening these debates.

| Decision | Choice | Alternatives Rejected | Rationale | Source |
|---|---|---|---|---|
| Database | **better-sqlite3** via Drizzle ORM | PGLite, LibSQL, Turso, Supabase | Zero-config, synchronous, fastest for single-user. PGLite has WASM overhead. No server needed. SQLite is the industry consensus for local-first personal tools (gbrain, agentOS, Obsidian). | Explorer 00 |
| Notion sync | **Read-only mirror, forever** | Two-way sync, Notion retirement, SQLite-primary skip | Notion retirement is a trap that adds years of migration work for a single user. The Finance Agent writes to Notion daily -- competing with it causes data collisions. Notion stays as source of truth for structured data. MC reads and enriches locally. | Explorer 01, 02 |
| Sync strategy | **Scheduled ETL + Last-Write-Wins** | CRDTs, Automerge, Y.js, real-time sync | Single-user, single-device. CRDTs solve multi-writer problems that do not exist here. 30-minute cron + manual button is sufficient. LWW with `last_edited_time` from Notion API. | Explorer 00 |
| Agent memory | **3-layer: CLAUDE.md + wiki/ dir + agent_memories table** | Vector DB, embeddings, PGLite+pgvector | At MC's scale (hundreds of rows, not millions), SQL queries are deterministic and debuggable. Vector search is premature. Karpathy: "You don't need a vector database. You need a wiki." | Explorer 00 |
| UI framework | **Next.js 16** + shadcn/ui + Tailwind v4 | Angular (v1 rejected), Tauri, Electron | Already built. Burak knows it. No rewrite. | VISION.md |
| Agent runtime | **Claude Code headless** (`claude -p`) | Direct Anthropic API, LangChain, custom agent | Claude Max $200/mo covers it. Headless mode inherits all skills and CLAUDE.md. No API key management. | VISION.md |
| Notion client | **@notionhq/client** (official SDK) | MCP, REST direct, third-party wrappers | Official, typed, maintained. 3 req/sec rate limit is acceptable for read-only mirror at 30-min intervals. | Explorer 01 |
| Finance Agent coordination | **No coordination. Separate systems.** | Shared SQLite, Finance Agent rewrite, message queue | The Finance Agent writes to Notion. MC reads from Notion. They never touch the same store directly. This eliminates the collision risk entirely. If Finance Agent stops using Notion, revisit. | Explorer 01 |
| Multi-device sync | **Not supported. Laptop-only.** | PowerSync, Replicache, LiveBlocks | Single user, single device. If phone access is needed later, a read-only web view via Tailscale is simpler than sync infrastructure. | Explorer 00 |
| Notion migration phase | **Phase 1 (Mirror) forever in 2026** | 5-phase retirement plan from VISION.md | The 5-phase plan was aspirational. Notion retirement is not happening this year. Lock Phase 1 as the permanent state. Reassess in 2027 only if MC has been used daily for 6+ months. | Explorer 02 |

---

## Section 4: Interface Hierarchy

Ordered by priority. Higher priority = built first, used most.

| Priority | Interface | Build Time | Status | Description |
|---|---|---|---|---|
| **1** | Claude Code native | 0 days | ALREADY WORKS | Burak already lives in Claude Code. MC's SQLite is readable from any Claude Code session via `sqlite3` or Drizzle. CLAUDE.md briefing exists. This is the primary interface, not the web UI. |
| **2** | `mc` CLI | 2-3 days | TO BUILD | A thin Node.js CLI wrapping Drizzle queries. Commands: `mc overdue`, `mc projects`, `mc finance`, `mc today`, `mc search <term>`. JSON output for agent consumption. Human-readable default. Installed globally via `npm link`. |
| **3** | Nag Agent daily briefing | 3.5-5.5 hours | TO BUILD | The differentiator. A cron job (launchd, 08:00 daily) that runs Claude Code headless, scans SQLite for overdue items and approaching deadlines, and writes a markdown briefing to `~/.mc/briefing-YYYY-MM-DD.md`. Also prints a summary to stdout. This runs whether or not Burak opens anything. |
| **4** | Web UI | Already built | REDUCE SCOPE | localhost:3000. Keep only 3 modules: Uebersicht (transformed), Projekte Kanban, Finanzen dashboard. Kill Content Kanban and Agent Chat modules. The web UI is for visual tasks that genuinely need a GUI (Kanban drag-drop, financial charts). |

---

## Section 5: Module Decisions

| Module | Verdict | Rationale |
|---|---|---|
| **Uebersicht** | TRANSFORM | The current Sunsama-style prompt page is decorative. Transform into: (1) Delta since yesterday -- what changed, (2) Daily Plan -- 3 focus items, (3) Warning Panel -- overdue deadlines with countdown, (4) Days remaining to May 31 in large type. Remove everything else. |
| **Projekte Kanban** | KEEP | Visual task management genuinely needs a GUI. Drag-and-drop status changes are faster than CLI. Keep the Kanban board as-is. This is the primary reason the web UI exists. |
| **Finanzen** | KEEP | Financial dashboards need charts and tables. The creditor list, deadline timeline, and subscription overview are visual by nature. Keep the dashboard. Add a "days to next critical deadline" widget. |
| **Content-Planer (Kanban)** | KILL the Kanban. TRANSFORM to Publish Log. | A content Kanban with zero published items is procrastination infrastructure. Replace with a flat, append-only Publish Log: Date, Title, Platform, URL. No stages, no pipeline, no drag-and-drop. You either published it or you didn't. The content strategy is "document don't create" -- press Record, then log it here after. |
| **Agent-Chat** | KILL | Superseded by Claude Code native (Priority 1 interface). Burak already has Claude Code open all day. Building a second chat interface inside a web app adds zero value and costs build time. The mock runtime confirms this -- it was never connected to real Claude Code. Kill the module, reclaim the sidebar slot. |

### Post-Decision Module Layout

The web UI sidebar has 3 items:

```
Uebersicht    (Daily Plan + Delta + Warnings)
Projekte      (Kanban board)
Finanzen      (Dashboard + Deadlines)
```

The Command Palette (Cmd+K) remains. It gains a "Publish Log" entry to quick-add content publications without navigating to a separate page.

---

## Section 6: The Nag Agent Blueprint

This is MC's differentiator. Not a dashboard. A nag.

### Architecture

```
launchd (08:00 daily)
    |
    v
mc-nag (Node.js script)
    |
    +-- Read SQLite: overdue deadlines, stale projects, upcoming Fristen
    +-- Read SQLite: days until 2026-05-31 (Einstiegsgeld deadline)
    +-- Read SQLite: content publish log (days since last publish)
    +-- Read SQLite: finance agent last sync (staleness check)
    |
    v
Claude Code headless (`claude -p "<structured context>"`)
    |
    +-- Generate natural-language briefing in German (du-Form)
    +-- Include specific action items, not vague summaries
    +-- Example: "Du hast 3 ueberfaellige Fristen. Kalte Aktiv wartet seit April 2025.
    |            Noch 49 Tage bis Einstiegsgeld endet. Heute: Email an Kalte Aktiv senden."
    |
    v
Output:
    +-- Write to ~/.mc/briefings/YYYY-MM-DD.md
    +-- Print summary to stdout (visible in tmux window)
    +-- Optional: desktop notification via osascript
```

### Build Estimate

| Component | Time |
|---|---|
| `mc-nag` script (SQLite queries + prompt assembly) | 1.5 hours |
| Claude Code headless integration (spawn + parse) | 1 hour |
| launchd plist + install script | 30 minutes |
| Briefing template + German prompt engineering | 30 minutes |
| **Total** | **3.5 hours** |

With desktop notifications and optional Discord webhook: add 2 hours. Total: **5.5 hours**.

### Nag Agent Rules

1. ALWAYS runs at 08:00. No skip days. No "quiet weekends."
2. Briefing MUST include the Einstiegsgeld countdown until 2026-05-31.
3. Briefing MUST include days since last content publish.
4. Briefing MUST list overdue Fristen by name and amount.
5. Briefing MUST suggest ONE specific action for today (not three, not five -- one).
6. If nothing is overdue: say "Nichts ueberfaellig. Guter Tag." and stop.

---

## Section 7: The 48-Day Sprint Plan

**Hard deadline**: 2026-05-31. Einstiegsgeld expires. Kooperationsplan demands "erste Vertraege mit Kunden."

### Priority 0 Actions (Monday Morning, Before Any Code)

These are not code tasks. These are life tasks. They take priority over MC development.

| Action | Time Required | Why It Cannot Wait |
|---|---|---|
| Check Jobcenter.digital for Mitwirkungsschreiben status (16.12.2025, Frist 02.01.2026) | 30 minutes | Potentially 2K+ EUR saved. Status unknown for 4 months. |
| Send email to Kalte Aktiv Team GmbH | 15 minutes | Hottest lead. 25K EUR Projektplan exists since April 2025. Zero contact made. |
| File USt-Voranmeldung Q1 via ELSTER | 2 hours | Due 2026-05-10. Non-negotiable legal deadline. |
| Reactivate Finance Agent launchd | 10 minutes | Last ran Feb 18. Daily 08:00 check needs to resume. |

### The Two-Hour Rule

Every day for the next 48 days, the FIRST two hours are reserved for **revenue-generating activities**: client emails, invoices, proposals, content publishing. No code. No architecture. No research. MC development happens AFTER the two-hour block.

### Week-by-Week Plan

| Week | Dates | MC Work | Business Work |
|---|---|---|---|
| **Week 1** | Apr 14-18 | Priority 0 actions (Mon). Set up `.env.local` + Notion sync (Tue-Wed, 4h). Build `mc` CLI basics (Thu, 3h). Build Nag Agent (Fri, 4h). | Email Kalte Aktiv. Check Jobcenter. File USt-VA Q1. Record Video 1 ("Mission Control Tag 1"). |
| **Week 2** | Apr 21-25 | Transform Uebersicht module (4h). Kill Agent-Chat + Content Kanban modules (1h). Publish Log in Command Palette (2h). | Follow up Kalte Aktiv. Publish Video 1. Draft Kalte Aktiv Angebot if interest. Contact 2 more leads from Airtable top-5. |
| **Week 3** | Apr 28 - May 2 | FEATURE FREEZE. Use MC daily. Fix bugs only. | Record Video 2. Invoice if Kalte Aktiv signs. Contact remaining Airtable leads. |
| **Week 4** | May 5-9 | Bug fixes only. Nag Agent tuning based on 2 weeks of daily use. | USt-VA Q1 deadline May 10. Publish Video 2. Follow up all open leads. |
| **Week 5** | May 12-16 | No MC work unless critical bug. | Revenue focus. Invoice at least one client. Record Video 3. |
| **Week 6** | May 19-23 | No MC work. | Revenue focus. Prepare Einstiegsgeld proof (contracts, invoices, content). |
| **Week 7** | May 26-31 | No MC work. | Einstiegsgeld deadline. Submit proof to Jobcenter. All deliverables due. |

### Total MC Build Budget: 18 hours across Weeks 1-2. Then stop.

---

## Section 8: Content Strategy

### Kill the Kanban

The content Kanban board with stages (Idea / Draft / Recording / Editing / Published / Archived) is a procrastination pipeline. Six stages for zero published items. Kill it.

### The Publish Log

Replace with a flat table:

| Column | Type |
|---|---|
| `date` | DATE |
| `title` | TEXT |
| `platform` | TEXT (YouTube / X / LinkedIn / TikTok / Blog) |
| `url` | TEXT (nullable until published) |
| `project_id` | FK (nullable, links to a project) |

No stages. No workflow. You either published something or you did not.

### The 4-Step Content Workflow

1. **Record** -- Press record before building. Screen + voice. No script. No plan.
2. **Trim** -- Cut to under 15 minutes. Remove dead air. Done.
3. **Upload** -- YouTube or platform of choice. Write a 2-sentence description.
4. **Log** -- Add one row to the Publish Log. `mc publish "Title" --platform youtube --url "..."`

Total post-production: under 1 hour per video. If it takes longer, you are overproducing.

### "Document Don't Create" = The Only Strategy

The content strategy was locked on April 12: German, Agentic Engineering, no-face, document-don't-create. The USP is locked: "Ich baue echte Produkte mit AI Agent-Teams und zeige euch die Tools, Workflows und Fehler, die ich dabei entdecke."

No more strategy documents. No more content calendars. Press record. Build something. Upload. Log. Repeat.

---

## Section 9: What NOT To Build

These are OFF THE TABLE until after May 31, 2026, or until their specific trigger condition is met.

| Item | Why Not | Trigger to Reconsider |
|---|---|---|
| Notion two-way sync | Collision risk with Finance Agent, unnecessary complexity | Finance Agent stops using Notion (unlikely in 2026) |
| Notion retirement (Phases 3-5) | 70% chance MC itself gets abandoned. Don't retire Notion for a tool that might not survive. | MC used daily for 6+ consecutive months |
| Airtable integration | No active use case. Dormant data. | Kalte Aktiv signs a contract and pipeline tracking becomes necessary |
| Agent Chat module in web UI | Claude Code native is the interface. No second chat. | Never. This decision is permanent. |
| Content Kanban | Replaced by Publish Log. No stages for content. | Never. If you need a Kanban for content, you are overproducing. |
| Mobile app / PWA | Single device (laptop). No mobile use case. | Daily mobile need demonstrated for 30 days |
| Obsidian vault integration | Vault has 1 entry. Not a real data source. | Vault reaches 50+ entries organically |
| Multi-device sync (CRDTs, etc.) | Single user, single laptop. | Second device becomes daily driver |
| Vector search / embeddings | SQL is sufficient at MC's scale (hundreds of rows). | Dataset exceeds 10,000 queryable rows |
| Real-time Notion webhooks | Notion does not support real-time webhooks. Polling at 30-min is fine. | Notion ships webhook API (not announced) |
| MAYTT integration | Separate project for Cousin Ali. Different lifecycle. | MAYTT reaches production and content pipeline needs automation |
| Dark mode QA | Functional, not aesthetic. Ship light mode. | MC is used daily for 30 days and dark mode is requested |
| Second-brain / wiki layer | The Karpathy pattern is interesting but not urgent. MC is a command center, not a knowledge base. | MC data exceeds what SQL can surface efficiently |
| Finance Agent rewrite to SQLite | The Finance Agent works (when running). Don't break what works. | Finance Agent Notion integration becomes unmaintainable |
| Notifications system (P1-P4) | The Nag Agent daily briefing replaces push notifications. One briefing per day is enough. | MC is used daily and Burak requests real-time alerts |

---

## Section 10: Success Metrics

MC is alive or dead at Day 30 (May 14, 2026). These metrics determine which.

| Metric | Alive Threshold | Dead Signal |
|---|---|---|
| **Daily opens** | MC (web or CLI) used 20+ of 30 days | Used fewer than 10 of 30 days |
| **Nag Agent runs** | Briefing generated 25+ of 30 mornings | Fewer than 15 briefings generated (launchd disabled or broken) |
| **Notion sync active** | `.env.local` exists, sync ran within last 24h, real data visible | No `.env.local` exists, or sync has not run in 7+ days |
| **Content published** | 2+ videos/posts published and logged in Publish Log | Zero items in Publish Log |
| **Revenue action taken** | At least 1 client email sent, 1 proposal drafted, or 1 invoice issued | Zero revenue-generating actions tracked |

If 3 or more metrics show "Dead Signal" at Day 30: **kill MC**. Stay in Notion. Build revenue instead of tools. The honest answer from Explorer 02 applies: "Burak's pain is not that his data lives in too many places -- it's that building organizational systems has become a substitute for the uncomfortable actions those systems were designed to trigger."

MC is the last chance to break that pattern. If it fails, the lesson is not "build a better MC." The lesson is "stop building and start doing."

---

## Appendix A: Data Architecture Quick Reference

### SQLite Schema (Keep from Phase 1)

| Table | Keep/Kill | Notes |
|---|---|---|
| `data_sources` | KEEP | Source tracking lookup |
| `projects` | KEEP | Mirror from Notion + in-app |
| `project_enrichment` | KEEP | MC-local tags, notes, focus |
| `tasks` | KEEP | Mirror from Notion + in-app |
| `goals` | KEEP | Mirror from Notion |
| `creditors` | KEEP | Mirror from Finance Agent Notion DBs |
| `deadlines` | KEEP | Mirror from Finance Agent Notion DBs |
| `subscriptions` | KEEP | Mirror from Finance Agent Notion DBs |
| `financial_snapshots` | KEEP | Mirror from Finance Agent Notion DBs |
| `wishlist_items` | KEEP | Low priority but no cost to keep |
| `shopping_list_items` | KEEP | Low priority but no cost to keep |
| `notes` | KEEP | Quick notes, MC-native |
| `agent_runs` | KEEP | Append-only log of Claude Code headless runs |
| `sync_state` | KEEP | Notion sync tracking |
| `app_settings` | KEEP | UI state |
| `content_series` | KILL | No content Kanban. No series tracking. |
| `content_items` | TRANSFORM | Strip Kanban columns. Keep as flat Publish Log: date, title, platform, url, project_id. |

### Sync Architecture

```
Notion (4 hubs)
    |
    | @notionhq/client (read-only, 30-min cron + manual button)
    |
    v
SQLite (better-sqlite3 via Drizzle)
    |
    +-- mc CLI (Node.js, global install)
    +-- Nag Agent (launchd 08:00, Claude Code headless)
    +-- Web UI (Next.js, localhost:3000, 3 modules)
    +-- Claude Code native (direct SQLite read from any session)
```

### Finance Agent Coexistence

```
Finance Agent --> writes --> Notion Finance DBs
                                |
MC Sync Job --> reads ---------> Notion Finance DBs
                                |
MC SQLite <-- mirrors ----------+

No collision. Finance Agent and MC never write to the same store.
```

---

## Appendix B: CLI Commands (mc)

```
mc today          Show daily briefing (same as Nag Agent output)
mc overdue        List all overdue deadlines
mc projects       List active projects with status
mc finance        Show financial summary (creditors, upcoming deadlines)
mc search <term>  Full-text search across all tables
mc publish        Log a published content item
mc sync           Trigger Notion sync manually
mc status         Show sync state, last briefing, DB stats
```

All commands output human-readable text by default. Add `--json` for machine-readable output (agent consumption).

---

*This manifesto was synthesized from 3 explorer reports, 35+ catalogue entries, the MC VISION.md, CLAUDE.md, SYNTHESIS-2026-04-12.md, notion-sources.md, and the project MEMORY.md. Every decision is final until the conditions in Section 9 trigger a reassessment.*

*Written 2026-04-12. No amendments until Day 30 review on 2026-05-14.*
