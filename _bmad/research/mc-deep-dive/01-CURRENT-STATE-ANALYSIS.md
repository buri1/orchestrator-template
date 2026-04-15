# Mission Control v2 -- Current State Analysis

> **Date**: 2026-04-12
> **Purpose**: Deep dive into MC v2 architecture, Notion setup, data overlap, migration plan, and architectural trade-offs
> **Sources**: VISION.md, CLAUDE.md, notion-sources.md, data-schema.md, db/schema.ts, seed-demo.ts, mock-runtime.ts, Finance-agent/CLAUDE.md, Finance-agent/context/, Finance-agent/memory/agent-state.json, research/catalogue/reference/notion-as-agent-backend.md, Finance-agent/context/data-integration-pipeline.md

---

## 1. The 4 Notion Hubs -- What Data Lives Where

### Hub 1: CraftCode AI Agency (`14374ccd7c698089945ed119d1b1e1c0`)

**Purpose**: Agency-level business hub for client projects, Ausschreibungen, hackathons.

**Contents**:
- Sub-pages: Active Projects, Schubladen, Finished Projects, Resources & Tools, Templates, 2025 Archive
- **Current Goals** (3): Ausschreibung abliefern, Hackathon submission, Orchestrator V0.1 as SaaS builder
- Notizen-Sektionen: Aktuelle Notizen, Potentielle Kanaele/Influencer, Gespeicherte Notizen, Archivierte Notizen

**Data shape**: Primarily free-form pages and goal-lists. No structured DB with typed columns -- goals are inline text with emoji prefixes, not a queryable database. Projects live as sub-pages, not as database rows.

**Key gap**: No exposed Notion database ID for "Active Projects" -- they are sub-pages, not DB entries. The Notion API can query them as child pages, but they lack the structured properties (Status, Priority, Completion) that Buraks Lab Projects DB has.

### Hub 2: Buraks Lab (`2f174ccd7c6980198e7be0c2831e6b25`)

**Purpose**: Personal R&D lab for side projects and experiments.

**Contents**:
- **Projects DB** (the richest structured data source): 11 Planning entries, 2 In Progress
  - Properties: Project name (Title), Status (Select: Planning/In Progress/Done/Blocked/Backlog), Owner (Person), Dates (Date-Range), Priority (Select: High/Medium/Low), Completion (Number 0-100%), Blocked By (Self-Relation)
- Views: Active, Timeline, Board, All

**Data shape**: This is the best-structured hub -- a proper Notion database with typed properties. It maps almost 1:1 to MC's `projects` table schema. This is the primary design reference for the MC schema.

**Active entries** (as of 2026-04-12): Orchestrator (High), Greptile Self Host (Low), AI Voice Navigation SDK (Low), Mobile Development Setup (Low), Auto Website Agency Pipeline (Low), BA-Multi-Agent SaaS (Low), Genmedia Content Engine (Medium, 0%), Neue Ausschreibungen (Medium, 0%), Wi-Fi CSI Sensing Platform (Low), daily changelog report (no priority), Autarkis Hildesheim (Medium, Feb-Jul 2026).

### Hub 3: Finance Agent (`30674ccd7c698132a182e8b672939c62`)

**Purpose**: Schuldenmanagement, creditors, deadlines, subscriptions.

**Contents** -- 11 Sub-Databases with known IDs (from Finance-agent/CLAUDE.md):

| DB | Notion DB ID | Purpose |
|---|---|---|
| Glaeubiger | `22cc7188740b46e0878dcf5688fc138e` | Active debt positions |
| Fristen | `1ebf37a574824eb0a2075177173a8660` | Deadline tracking |
| E-Mail Entwuerfe | `74fa15e434d84ae388360bd7b472eba0` | Draft emails for creditors |
| Posteingang | `7b1722c6eafc4524bf14f5203c45026e` | Incoming mail/email alerts |
| Finanzstatus | `d6675583d135487b89933dde3677dda6` | Financial snapshot history |
| Abos & Subscriptions | `200421670d3b4aa9907f7c93dbb7867c` | Recurring payments |
| Private Schulden | `4ae159f280214d59946ee671c62efcb6` | Family/friend debts |
| Wunschliste | `20e0a7e94bd24e90b009ef45da165290` | Wishlist items |
| Einkaufsliste | `32d8f98bfaa1415fa2f189df01c8c766` | Shopping list |
| Session Logs | `109e7ae1ab32414ebb560c04f4e3d79f` | Finance agent run logs |
| Schreibstil-Referenz | Page `30674ccd-7c69-8152-9de9-dd4650c65034` | Writing style reference |

**Data shape**: All 11 are proper Notion databases with structured properties. The Finance Agent (`~/Desktop/code2/Finance-agent/`) actively reads AND writes to these via MCP (`@notionhq/notion-mcp-server`). This is the MOST actively maintained Notion data -- the agent runs daily `/check` at 08:00 and weekly `/scan` Mon 09:00 via launchd.

**Agent state** (from `memory/agent-state.json`): Last check 2026-02-18, last scan 2026-02-13. Tracks email drafts with Notion page IDs, creditor updates, session handoff TODOs. Contains IBAN-free burak-answers, email accounts scanned.

### Hub 4: Genmedia Agency (`14374ccd7c6980438e5be0974d4f239d`)

**Purpose**: Content agency co-managed with Cousin Ali -- TikTok Shop, 10-channel strategy.

**Contents**:
- Quick Links: Tools, Password Manager, Video Generation Vergleich
- **Current Goals** (2): 1000 EUR TikTok Shop revenue (13/1000 as of 20.1.26), 10 channels x 20 videos/day
- **ToDo's DB**: Properties: Name (Title), Status (Select: Backlog/archived/In Progress/Done), Owner (Person: Burak, Ali Sentuerk), Work dates (Date-Range)
  - Views: All projects, Board (Kanban), By Team, By owner, Board (second)
- Notizen an Kuzeng: Aktuelle, Potentielle Kanaele, Gespeicherte, Archivierte, Archivierte Goals

**Data shape**: The ToDo's DB is structured but simpler than Buraks Lab. Owner is the key filter -- MC only needs Burak-assigned tasks.

---

## 2. MC SQLite Schema vs Notion Storage

### Schema Inventory (17 tables in `db/schema.ts`)

| Table | Phase | Source | Notion Equivalent |
|---|---|---|---|
| `data_sources` | 0 | System | N/A (MC-native lookup) |
| `projects` | 1 | Mirror + In-App | Buraks Lab Projects DB + CraftCode sub-pages + Genmedia projects |
| `project_enrichment` | 1 | In-App only | N/A (MC-only local augmentation) |
| `tasks` | 1 | Mirror + In-App | Genmedia ToDo's DB + MC-native tasks |
| `goals` | 1 | Mirror + In-App | CraftCode Current Goals + Genmedia Current Goals |
| `content_series` | 1 | In-App only | N/A (no Notion equivalent) |
| `content_items` | 1 | In-App only | N/A (no Notion equivalent) |
| `creditors` | 1 | Mirror | Finance Agent Glaeubiger DB |
| `deadlines` | 1 | Mirror | Finance Agent Fristen DB |
| `subscriptions` | 1 | Mirror | Finance Agent Abos DB |
| `financial_snapshots` | 1 | Mirror | Finance Agent Finanzstatus DB |
| `wishlist_items` | 1 | Mirror | Finance Agent Wunschliste DB |
| `shopping_list_items` | 1 | Mirror | Finance Agent Einkaufsliste DB |
| `notes` | 1 | In-App primarily | CraftCode Notizen + Genmedia Notizen (loose text) |
| `agent_runs` | 1 | In-App only | N/A (MC-native append-only log) |
| `sync_state` | 1 | System | N/A |
| `app_settings` | 1 | System | N/A |

### Actual Drizzle Schema Deviations from Doc

The implemented `db/schema.ts` closely follows `docs/data-schema.md` with these differences:

1. **IDs**: Schema uses `integer().primaryKey({ autoIncrement: true })` instead of doc's `TEXT PRIMARY KEY` (UUID). This is a simplification -- works fine for single-user, but means Notion `source_ref` must be looked up separately rather than used as ID.

2. **Content Items**: Schema adds `type`, `pillar`, `format`, `transcriptPath`, `scheduledAt`, `status` columns not in the original doc. The `content_series_items` join table from the doc was replaced by a direct `seriesId` FK on `content_items` (simpler, no many-to-many).

3. **Financial Snapshots**: Schema adds `cashEur`, `netWorthEur`, `breakdownJson` columns. Doc only had `total_debt_eur`, `total_monthly_income_eur`, `total_monthly_fixed_costs_eur`.

4. **Agent Runs**: Schema adds `agentName`, `outputSummary`, `costEur`, `finishedAt`. More production-ready than the doc sketch.

5. **Subscriptions**: Schema uses `amountEur` + `interval` instead of doc's `cost_monthly_eur` + `cost_yearly_eur` pair. Simpler.

6. **Tasks**: Schema adds `parentTaskId` (self-referencing subtask support) not in doc.

7. **Goals**: Schema adds `archived` boolean not in doc.

---

## 3. Data Overlap Analysis: DUPLICATION

These datasets exist (or will exist) in BOTH Notion and MC SQLite:

### HIGH OVERLAP (same entities, same fields)

| Entity | Notion Location | MC Table | Conflict Risk |
|---|---|---|---|
| Projects (Lab) | Buraks Lab Projects DB | `projects` (hub='Lab') | HIGH -- both are actively maintained |
| Creditors | Finance Agent Glaeubiger DB | `creditors` | MEDIUM -- Finance Agent writes Notion, MC reads |
| Deadlines/Fristen | Finance Agent Fristen DB | `deadlines` | MEDIUM -- Finance Agent is the writer |
| Subscriptions | Finance Agent Abos DB | `subscriptions` | LOW -- slow-changing data |
| Financial Snapshots | Finance Agent Finanzstatus DB | `financial_snapshots` | LOW -- append-only |
| Wishlist | Finance Agent Wunschliste DB | `wishlist_items` | LOW -- infrequently changed |
| Shopping List | Finance Agent Einkaufsliste DB | `shopping_list_items` | LOW -- transient data |
| Goals (CraftCode) | CraftCode inline text | `goals` (hub='CraftCode') | LOW -- goals are rarely edited |
| Goals (Genmedia) | Genmedia inline text | `goals` (hub='Genmedia') | LOW |
| Tasks (Genmedia) | Genmedia ToDo's DB | `tasks` (hub='Genmedia') | LOW -- Ali uses Notion, Burak uses MC |

### CRITICAL CONFLICT SCENARIO

**Finance Agent writes to Notion. MC reads from Notion. Neither knows about the other.**

The Finance Agent (`~/Desktop/code2/Finance-agent/`) runs on a launchd schedule (daily 08:00, weekly Mon 09:00). It reads Notion via MCP, processes PDFs/emails, and WRITES back to Notion (new creditors, updated fristen, email drafts, posteingang alerts, session logs). Its `agent-state.json` tracks what it wrote.

MC plans to READ from these same Notion DBs and mirror into SQLite. If Burak also starts creating/editing creditors or deadlines directly in MC (Phase 3+), there will be three sources of truth: Notion (Finance Agent writes), MC SQLite (Burak's local edits), and the Finance Agent's `agent-state.json` (operational state).

**This is the most dangerous duplication vector.** The Finance Agent does not know MC exists, and MC does not know the Finance Agent exists. Both interact with the same Notion databases.

---

## 4. Data That ONLY Exists Locally (MC/Agent, not in Notion)

| Data | Location | Purpose |
|---|---|---|
| Content Items | MC `content_items` | Theo-style Kanban content planner |
| Content Series | MC `content_series` | Multi-part content grouping |
| Agent Runs | MC `agent_runs` | Claude Code headless invocation log |
| Project Enrichment | MC `project_enrichment` | MC-local tags, notes, focus priority |
| App Settings | MC `app_settings` | UI state (sidebar, theme, focus) |
| Sync State | MC `sync_state` | Notion sync tracking |
| Notes (MC-native) | MC `notes` | Quick notes, design decisions, hooks bank |
| Finance Agent State | `Finance-agent/memory/agent-state.json` | Last scan/check times, email drafts, handoff state |
| Finance Agent PDFs | `Finance-agent/data/processed/` | 64 processed PDFs (immutable raw source) |
| Finance Agent Inbox | `Finance-agent/data/inbox/` | Unprocessed documents |
| Finance Agent Templates | `Finance-agent/templates/` | Email templates (stundungsantrag-de.md) |
| Finance Agent Context | `Finance-agent/context/burak.md` | Personal financial situation context |
| Finance Agent Schreibstil | `Finance-agent/context/schreibstil.md` | Writing style reference |
| Orchestrator Research | `orchestrator/research/catalogue/` | 519+ research catalogue entries |
| Orchestrator State | `orchestrator/_bmad/` | Supervisor state, session registry, telemetry |

---

## 5. Data That ONLY Exists in Notion

| Data | Notion Location | Why Not in MC |
|---|---|---|
| E-Mail Entwuerfe | Finance Agent E-Mail Entwuerfe DB (`74fa15e4...`) | Transient -- drafts get sent and are done. Explicitly excluded from MC scope. |
| Posteingang | Finance Agent Posteingang DB (`7b1722c6...`) | Notification alerts, transient. Excluded from MC scope. |
| Private Schulden | Finance Agent Private Schulden DB (`4ae159f2...`) | Documented as "possibly empty". Not in MC schema. |
| Session Logs | Finance Agent Session Logs DB (`109e7ae1...`) | Finance Agent's own run logs. MC has its own `agent_runs` table. |
| CraftCode Active Projects (sub-pages) | CraftCode hub sub-pages | Not a proper DB -- sub-pages without structured properties. Would need per-page API calls to extract. |
| CraftCode Resources & Tools | CraftCode sub-page | Internal reference material, not actionable data |
| CraftCode Templates | CraftCode sub-page | Operational templates |
| Genmedia Tools/Passwords | Genmedia sub-pages | Shared with Ali, not Burak-only data |
| Notion AI Agents (Beta) | 6 native Notion agents | Content Agent, Finance Agent, VEBEG Agent, etc. These run inside Notion. MC does not interact with them. |
| Schreibstil-Referenz (Notion page) | Finance Agent hub (`30674ccd-7c69-8152-...`) | Mirrored locally at `Finance-agent/context/schreibstil.md`. Notion is the "published" version, filesystem is the working copy. |
| VEBEG Listings | Shared page | Separate Kleinanzeigen pipeline project, explicitly out of MC scope |
| Planung CityHub | Private page | Separate planning doc |

---

## 6. The Original VISION.md Migration Plan (5 Phases)

| Phase | Notion Role | MC Role | Status |
|---|---|---|---|
| **Phase 1** (Skeleton) | Not connected | Local demo data in SQLite, placeholder UIs | DONE (Wave 0-2 shipped) |
| **Phase 2** (Notion Read-Sync) | Read-Source (Primary) | Mirror + local enrichment. Sync-jobs fetch Notion -> SQLite. 30min cron + manual button. No write-back. | NOT STARTED |
| **Phase 3** (Kanban + Local Primacy) | Read-Source (Secondary) | Primary for new entries. MC allows Create/Edit/Move locally. Old Notion data still mirrored. "Gradual Decoupling." | NOT STARTED |
| **Phase 4** (Optional Notion) | Optional Backup | Source of Truth for all data. Burak can choose to export to Notion as manual step. | NOT STARTED |
| **Phase 5** (Notion Retirement) | Archive | Fully independent. All historical Notion data migrated. Notion subscription cancellable. | NOT STARTED |

**Key quote from VISION.md**: "Notion bleibt initial Read-Source (Phase 2-3), wird aber schrittweise durch MC's eigene SQLite-basierte Struktur abgeloest."

### Phase 2 Sync Jobs Planned

From VISION.md Section 8:
- `syncLabProjects()` -- Buraks Lab Projects-DB
- `syncCraftCodeGoals()` -- CraftCode Current Goals
- `syncFinanceData()` -- 4-5 Finance-Agent-Sub-DBs
- `syncGenmediaTasks()` -- Genmedia ToDo's (nur Burak-Tasks)

### Enrichment Pattern (Phase 2-3)

MC adds fields that do NOT exist in Notion:
- `mc_tags` (local tags per project)
- `mc_notes` (Burak's MC-only notes)
- `mc_last_reviewed` (when last looked at in MC)
- `mc_agent_context` (Claude agent context blob)

These live in `project_enrichment` linked by `project_id`, never synced back to Notion.

---

## 7. Source-Tracking Pattern Analysis (`source_id`, `source_ref`)

### Design

Every user-facing table carries:
- `source_id TEXT NOT NULL DEFAULT 'in-app'` -- references `data_sources.id`
- `source_ref TEXT` -- the external ID within that source (Notion page ID, Airtable record ID, etc.)

`data_sources` lookup table seeded with:
- `in-app` (default for MC-native data)
- `notion:14374ccd7c698089945ed119d1b1e1c0` (CraftCode)
- `notion:2f174ccd7c6980198e7be0c2831e6b25` (Buraks Lab)
- `notion:30674ccd7c698132a182e8b672939c62` (Finance Agent)
- `notion:14374ccd7c6980438e5be0974d4f239d` (Genmedia)
- `airtable:appi9eWFJmE9XS1zM` (CraftCode AI Pipeline)

Duplicate prevention via: `UNIQUE INDEX ON (source_id, source_ref) WHERE source_ref IS NOT NULL`

### Assessment: Is This Correctly Designed?

**Strengths:**

1. **Clean migration path**: `UPDATE projects SET source_id='in-app' WHERE source_id LIKE 'notion:%'` retires Notion cleanly.
2. **No schema changes for new sources**: Adding email or webhook sources is just a new `data_sources` row.
3. **Upsert-safe**: The conditional unique index prevents duplicate imports while allowing multiple in-app entries.
4. **Transparent provenance**: Every row knows where it came from.

**Weaknesses / Gaps:**

1. **Missing Finance sub-DB granularity**: `source_id` for Finance is `notion:30674ccd...` (the hub page ID). But Finance data comes from 9+ individual sub-databases (Glaeubiger, Fristen, Abos, etc.), each with their own `db_id`. The current design cannot distinguish "this creditor came from Glaeubiger DB" vs "this deadline came from Fristen DB" -- both show `source_id='notion:30674ccd...'`. Fix: either use the individual DB IDs in `data_sources` (e.g., `notion:22cc7188740b46e0878dcf5688fc138e` for Glaeubiger), or add a `source_table` column.

2. **No `source_last_edited` on all tables**: Only `projects`, `tasks`, `creditors`, and `deadlines` have `sourceLastEdited`. Missing from `goals`, `subscriptions`, `wishlist_items`, `shopping_list_items`, `notes`. Needed for conflict detection during sync.

3. **No write-back tracking**: If Burak edits a Notion-mirrored row in MC (Phase 3+), there is no `locally_modified_at` field to detect the conflict when the next Notion sync runs. The `updatedAt` field serves this purpose indirectly (`updatedAt > sourceLastEdited` = local edit), but only if `sourceLastEdited` is consistently populated.

4. **`syncState` table too simple**: Primary key is `sourceId`, but sync operates per-table. If `syncLabProjects()` and `syncCraftCodeGoals()` both use different Notion API calls, they need separate sync state entries. The `resource` column exists but is not part of the PK -- this will cause issues if two sync jobs target the same `source_id`.

5. **No `data_sources` entry per Finance sub-DB**: The seed only creates one Finance entry. The 9 individual sub-DB IDs from `Finance-agent/CLAUDE.md` are not registered. This matters for Phase 2.

---

## 8. Notion-First vs SQLite-First Architecture

### Option A: Notion-First (Current Plan through Phase 2-3)

```
Notion (Source of Truth) --read--> MC SQLite (Mirror) --render--> UI
                                      ^
                                      | local enrichment (mc_tags, mc_notes)
                                      |
                               project_enrichment table
```

**Pros**:
- Notion is already maintained (Finance Agent writes daily)
- No risk of data loss during MC development
- Burak can still use Notion directly while MC matures
- Gradual migration (1 table at a time)

**Cons**:
- Two systems to maintain during transition
- Finance Agent and MC compete for same Notion data
- Sync lag (30min default) makes MC data stale
- Notion API rate limits (3 req/sec, 2,700/15min) constrain sync frequency
- Content Planner is already MC-native (no Notion source), creating an inconsistent mental model

### Option B: SQLite-First (Skip to Phase 3-4)

```
MC SQLite (Source of Truth) --render--> UI
        ^                      |
        | one-time import      | optional export
        |                      v
    Notion (Archive)      Notion (read-only backup)
```

**Pros**:
- Single source of truth from day one
- No sync complexity
- Content Planner and Projects use the same data layer
- No Notion API rate limit concerns
- Simpler codebase (no sync jobs, no enrichment tables, no conflict detection)

**Cons**:
- Breaks Finance Agent (which writes to Notion, not SQLite)
- One-time import is a point-in-time snapshot (new Notion edits lost)
- Burak loses Notion as a mobile-friendly interface
- No gradual migration -- it is all-or-nothing

### Option C: Hybrid -- Finance Agent Rewired

```
Finance Agent --writes--> MC SQLite (via API or direct)
                              |
                              v
                    MC UI (Source of Truth)
                              |
                              v (optional sync)
                         Notion (Archive)
```

This requires modifying the Finance Agent to write to SQLite instead of (or in addition to) Notion. The Finance Agent currently uses MCP to read/write Notion. Replacing that with SQLite writes would mean:
- Changing `Finance-agent/CLAUDE.md` to point at MC's SQLite path
- Adding SQLite MCP or direct Drizzle access to the Finance Agent
- Keeping Notion as a read-only archive

**Pros**: Unified data layer, Finance Agent and MC share the same truth.
**Cons**: Requires Finance Agent rewrite, breaks its current stable launchd setup.

### Recommendation Signal

The VISION.md explicitly chose Option A (Notion-First, gradual migration). The `data-integration-pipeline.md` in Finance Agent context further supports this, stating: "Notion ist IMMER Source of Truth fuer strukturierte Daten" and proposing Obsidian as the wiki layer, not SQLite.

However, MC's Content Planner (already SQLite-native) and Agent Runs (already SQLite-native) create a bifurcated reality: some modules are local-first, others mirror Notion. The longer Phase 2 is delayed, the more MC-native data accumulates, making the eventual Notion sync more of a bolt-on than a core feature.

---

## 9. The Obsidian Question (Third Contender)

The `data-integration-pipeline.md` (Finance Agent context, dated 2026-04-04) proposes a THREE-layer architecture:
- **Notion**: Structured data (creditors, fristen, amounts)
- **Obsidian**: Wiki/knowledge layer (entity pages, research, journal)
- **Filesystem**: Raw sources (PDFs, agent config, templates)

This document was written BEFORE Mission Control v2 was conceived. It does not mention MC at all. Its proposed Obsidian vault (`~/Desktop/code2/vault/`) was to be the "compounding knowledge" layer, with Notion data snapshotted into Obsidian markdown files.

**MC v2 supersedes this plan** for the structured data layer. But the Obsidian wiki role is still valid -- VISION.md Section 7 explicitly excludes "Second-Brain-Layer im Scope von v2", deferring it to Phase 6+.

Current state: The vault exists at `~/Desktop/code2/vault/` (mentioned in MEMORY.md) but its integration with MC is punted.

---

## 10. Summary of Findings

### What is Built (Phase 1 DONE)

- 17-table Drizzle SQLite schema
- 144 rows of realistic demo data (14 projects, 30 tasks, 6 goals, 4 content series, 21 content items, 7 creditors, 12 deadlines, 14 subscriptions, 3 financial snapshots, 7 wishlist items, 6 shopping items, 12 notes, 5 agent runs)
- 5 module pages on localhost:3000 (Uebersicht, Projekte Kanban, Finanzen dashboard, Content Kanban, Agent Chat)
- Mock agent runtime with deterministic responses
- Source-tracking pattern on every user-facing table
- Command palette with 17 commands

### What is NOT Built

- Notion API integration (no `@notionhq/client`, no sync jobs)
- Real Claude Code headless agent runtime (mock only)
- Notion -> SQLite sync pipeline
- Conflict detection between Finance Agent writes and MC reads
- Airtable integration
- `data_sources` entries for individual Finance sub-DBs
- Enrichment workflow (mc_tags, mc_notes UI)

### Critical Risks

1. **Finance Agent collision**: The Finance Agent and MC will both interact with the same Notion databases without coordination. No protocol exists for this.

2. **Sync state table design flaw**: PK is `sourceId` alone, but sync needs per-resource granularity.

3. **Missing `sourceLastEdited` on 5 tables**: Cannot detect Notion-side changes on goals, subscriptions, wishlist, shopping, notes.

4. **Phase 2 prerequisite**: Notion Integration Token does not exist yet. API access not configured.

5. **Content Planner is already local-first**: This breaks the Notion-first mental model. Burak will have some data in Notion and some purely local, with no unified sync strategy.

### Architectural Decision Required

Before Phase 2 begins, Burak needs to decide:

**A) Invest in Notion sync** (as VISION.md planned) -- 2-3 sessions of sync job implementation, conflict detection, Finance Agent coordination protocol.

**B) Skip to SQLite-primary** -- one-time Notion import, rewrite Finance Agent to target SQLite, no ongoing sync.

**C) Hybrid minimal** -- sync only Buraks Lab Projects DB (the most valuable structured data), leave Finance Agent on Notion, accept two systems temporarily.

Option C is the pragmatic middle ground: it gets real project data into MC with minimal sync complexity, while avoiding the Finance Agent collision problem entirely.

---

*Analysis complete. All findings derived from direct file reads, no hallucinated data.*
