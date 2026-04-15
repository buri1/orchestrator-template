# W1-03: Local-First Sync Patterns for Personal Tools (2026)

**Deep Research for Mission Control v2**
**Date**: 2026-04-12
**Scope**: CRDTs, sync engines, polling ETL, event sourcing -- what fits a single-user localhost dashboard?

---

## 1. Executive Summary & Recommendation

**CRDT complexity is NOT justified for Mission Control.** The entire local-first/CRDT ecosystem solves a problem Burak does not have: multi-device, multi-user, real-time collaborative editing with conflict resolution. Mission Control is a single-user, single-machine, localhost-only dashboard backed by SQLite. The correct pattern is **Scheduled ETL (cron-style polling) with last-write-wins**, optionally graduating to event sourcing if audit trails become valuable.

| Pattern | Complexity | Fits MC? | Why / Why Not |
|---------|-----------|----------|---------------|
| CRDTs (Automerge, Yjs) | Very High | **No** | Solves multi-writer conflicts MC will never have |
| ElectricSQL | High | **No** | Postgres-based sync; MC uses SQLite, no server |
| Replicache | High | **No** | Client-server sync; MC has no server |
| PowerSync | Medium-High | **No** | Postgres-to-SQLite sync; requires cloud Postgres |
| cr-sqlite | Medium | **Marginal** | SQLite CRDT extension; interesting but no second replica exists |
| Scheduled ETL + LWW | Low | **Yes** | Exactly right for Notion/Airtable read-only ingestion |
| Event Sourcing (light) | Low-Medium | **Future maybe** | Useful if undo/audit trail needed later |

**Recommended architecture for MC Phase 2:**
```
[Notion API] --poll--> [ETL worker (Node cron)] --upsert--> [SQLite via Drizzle]
[Airtable API] --poll--> [ETL worker (Node cron)] --upsert--> [SQLite via Drizzle]
                                                                     |
                                                              [Next.js reads]
```

No sync engine. No CRDT. No WebSocket. Just a `setInterval` or `node-cron` job that runs every 5-15 minutes, fetches changes from Notion/Airtable, and upserts into SQLite with `ON CONFLICT (source_id, source_ref) DO UPDATE`.

---

## 2. The Local-First Manifesto (Ink & Switch) -- What It Actually Says

The "Local-First Software" paper by Martin Kleppmann, Adam Wiggins, Peter van Hardenberg, and Mark McGranaghan (Ink & Switch, 2019) defines seven ideals:

1. **No spinners** -- data is on-device, reads are instant
2. **Your work is not trapped on one device** -- sync across laptop, phone, tablet
3. **The network is optional** -- full functionality offline
4. **Seamless collaboration** -- real-time multi-user editing
5. **The Long Now** -- data outlives the service
6. **Security and privacy by default** -- E2E encryption
7. **You retain ultimate ownership and control** -- data is yours

**MC already satisfies ideals 1, 3, 5, 6, and 7 by being a localhost SQLite app.** There is no server to go down. There is no cloud service to sunset. The data is a file on disk that Burak owns.

Ideals 2 (multi-device) and 4 (collaboration) are explicitly out of scope. MC runs on one machine. Burak is the only user.

The manifesto is prescient and important, but its technology recommendations (CRDTs, Automerge) are engineered for the hardest case: multiple writers on multiple devices editing the same document simultaneously. That is not this use case.

### Steph Ango's "File Over App" (2024-2025)

Obsidian CEO Steph Ango's "File Over App" philosophy extends the local-first ethos: your data should be in open, portable file formats (Markdown, SQLite, plain text) that outlive any application. MC already aligns perfectly:

- SQLite is the most deployed file format on earth
- Drizzle ORM produces standard SQL
- No proprietary sync protocol locks data in

**Verdict: MC is already more "local-first" than 95% of apps. Adding CRDT machinery would be over-engineering.**

---

## 3. Technology Landscape -- Deep Evaluation

### 3.1 Automerge (v2.x, 2024-2026)

**What it is**: A CRDT library for building collaborative applications. Documents are JSON-like data structures that can be edited concurrently by multiple peers, with automatic conflict-free merging.

**Architecture**: Each peer maintains a full copy of the document. Changes are encoded as operations and synced peer-to-peer or via a relay server. The merge function is mathematically guaranteed to converge.

**Maturity**: Stable since Automerge 2.0 (late 2023). Active development by Ink & Switch. Rust core with JS/WASM bindings. Used in production by Muse (now sunset), Peritext, and several research prototypes.

| Criterion | Score (1-10) | Notes |
|-----------|-------------|-------|
| Fit for MC | 2/10 | Solves multi-writer problem MC doesn't have |
| Maturity | 7/10 | v2 stable, but ecosystem is still research-flavored |
| Community | 5/10 | Small but passionate; Ink & Switch papers are excellent |
| Performance | 6/10 | Good for documents; overhead per-operation for simple key-value |
| SQLite compat | 3/10 | Not designed for relational data; document-oriented |
| Complexity cost | High | ~15-20KB WASM, new mental model, custom storage layer |
| MC verdict | **SKIP** | Would add 2-4 weeks of work for zero user-visible benefit |

**When Automerge IS right**: Building a collaborative text editor, a shared whiteboard, a multiplayer design tool, or any app where two humans edit the same data simultaneously.

### 3.2 Yjs (v13.x, 2024-2026)

**What it is**: Another CRDT framework, optimized for text editing. Powers the real-time collaboration in Notion, Hocuspocus, BlockSuite (AFFiNE), and many rich-text editors.

**Key difference from Automerge**: Yjs is more performance-optimized and has a richer provider ecosystem (WebSocket, WebRTC, IndexedDB, Redis). It's the de facto standard for adding real-time collaboration to text editors.

| Criterion | Score (1-10) | Notes |
|-----------|-------------|-------|
| Fit for MC | 2/10 | Text-editing CRDT; MC is a dashboard, not an editor |
| Maturity | 9/10 | Battle-tested in Notion, AFFiNE, many editors |
| Community | 8/10 | Large, active, many providers and bindings |
| Performance | 9/10 | Extremely optimized for text; overkill for structured data |
| SQLite compat | 2/10 | Designed for document/text, not relational tables |
| Complexity cost | Medium-High | Provider setup, awareness protocol, Y.Doc lifecycle |
| MC verdict | **SKIP** | Even less relevant than Automerge for dashboard use case |

### 3.3 ElectricSQL (v0.13+, 2025-2026)

**What it is**: A sync layer that replicates Postgres data to client-side SQLite. Uses a "Shape" subscription model where clients declare what subset of Postgres they want, and Electric streams changes in real-time.

**Architecture**: Requires a Postgres database as source of truth. Electric runs as a sidecar service. Clients use a sync library that maintains a local SQLite replica. Writes go through Postgres; conflicts use LWW or custom resolvers.

**2025-2026 status**: Electric went through a major rewrite ("Electric Next") in late 2024, dropping the CRDT-based approach for a simpler Shape-based sync. The new version is more practical but still requires Postgres infrastructure.

| Criterion | Score (1-10) | Notes |
|-----------|-------------|-------|
| Fit for MC | 3/10 | MC has no Postgres. Adding Postgres to sync to SQLite is circular. |
| Maturity | 6/10 | Major rewrite completed; still early for production |
| Community | 6/10 | Growing, well-funded (HiddenLayer), good docs |
| Performance | 7/10 | Shape subscriptions are efficient |
| SQLite compat | 8/10 | First-class SQLite client support |
| Complexity cost | High | Requires Postgres + Electric sidecar + sync client |
| MC verdict | **SKIP** | MC is SQLite-native. Adding Postgres to use Electric defeats the purpose. |

**When Electric IS right**: Building a multi-user web app where Postgres is already the backend and you want instant-feeling reads with offline support on the client.

### 3.4 Replicache (v14+, 2025-2026)

**What it is**: A client-side sync framework by Rocicorp. Provides a transactional key-value store on the client that syncs with any backend via "push" and "pull" endpoints. Uses a "Replicache License" (source-available, not OSS for commercial use >$1M ARR).

**Architecture**: Client writes to Replicache (optimistic mutations). Replicache periodically pushes mutations to the server. Server applies them and returns a new "cookie" (version vector). Client pulls confirmed state. Conflicts resolved by server authority.

| Criterion | Score (1-10) | Notes |
|-----------|-------------|-------|
| Fit for MC | 2/10 | Client-server sync; MC has no server |
| Maturity | 8/10 | Well-engineered, used in Linear, Figma internal tools |
| Community | 5/10 | Small but high-quality; Rocicorp team is responsive |
| Performance | 9/10 | Extremely fast optimistic updates |
| SQLite compat | 4/10 | Uses its own IDB-based store, not SQLite |
| Complexity cost | High | Requires server push/pull endpoints, mutation definitions |
| MC verdict | **SKIP** | Needs a server. MC is serverless localhost. |

**2026 update**: Rocicorp pivoted to "Zero" (their next-gen sync product) which is a hosted sync service. Even further from MC's architecture.

### 3.5 PowerSync (v1.x, 2025-2026)

**What it is**: Postgres-to-SQLite sync for mobile and web apps. Similar vision to ElectricSQL but more production-ready and commercially backed (JourneyApps).

**Architecture**: PowerSync Cloud or self-hosted service connects to your Postgres, streams changes to client-side SQLite. Supports offline writes with conflict resolution.

| Criterion | Score (1-10) | Notes |
|-----------|-------------|-------|
| Fit for MC | 3/10 | Same problem as Electric: requires Postgres |
| Maturity | 7/10 | Production-ready, used in several mobile apps |
| Community | 5/10 | Smaller than Electric, but commercial support |
| Performance | 7/10 | Good sync performance, bucket-based subscriptions |
| SQLite compat | 9/10 | SQLite-native on client side |
| Complexity cost | High | Requires Postgres + PowerSync service |
| MC verdict | **SKIP** | MC has no Postgres and doesn't need one |

### 3.6 cr-sqlite (v0.16+, 2025-2026)

**What it is**: A SQLite extension by Matt Wonlaw that adds CRDT semantics to regular SQLite tables. You load the extension, mark tables as "conflict-free replicated," and then merge databases from different peers automatically.

**Architecture**: Each SQLite database tracks changes as CRDT operations. When two databases diverge (e.g., on two devices), you merge them and conflicts resolve automatically using causal ordering. No server needed.

**This is the closest match to MC's architecture** because it's SQLite-native and peer-to-peer. However...

| Criterion | Score (1-10) | Notes |
|-----------|-------------|-------|
| Fit for MC | 4/10 | There is no second replica to merge with |
| Maturity | 5/10 | Experimental; Matt Wonlaw is now at Electric, focus shifted |
| Community | 3/10 | Small, research-oriented |
| Performance | 6/10 | Adds overhead to every write (CRDT metadata) |
| SQLite compat | 10/10 | IS a SQLite extension |
| Complexity cost | Medium | Extension loading, schema constraints, merge protocol |
| MC verdict | **SKIP for now** | Interesting if MC ever needs multi-device sync. Not today. |

**When cr-sqlite IS right**: Two SQLite databases on different devices that need to merge without a server. The dream scenario is: laptop SQLite and phone SQLite sync via a dumb file-relay (Dropbox, iCloud). MC doesn't need this.

**2026 status note**: Matt Wonlaw joined the ElectricSQL team in 2025. cr-sqlite development has slowed. The project is not abandoned but is in maintenance mode.

---

## 4. What "Offline-First" Means for a Localhost-Only Tool

There is a conceptual category error in applying "offline-first" thinking to Mission Control:

**Offline-first** assumes there is an "online" state where the canonical data lives (a server, a cloud database). The app must work when that connection breaks. CRDTs and sync engines exist to reconcile the gap between local state and remote state.

**MC is localhost-only.** There is no remote state. The SQLite file IS the canonical data. The only "remote" systems are Notion and Airtable, which are READ-ONLY data sources being ingested one-way.

```
Traditional offline-first:
  Client <--bidirectional sync--> Server
  Problem: conflicts when both sides write

MC's actual architecture:
  [Notion] --read-only poll--> [SQLite]  <--read/write--> [Next.js UI]
  [Airtable] --read-only poll--> [SQLite]
  Problem: there are no conflicts. Ever.
```

The only "sync" MC needs is:
1. **Inbound**: Periodically fetch new/updated items from Notion and Airtable
2. **Outbound**: None initially. Maybe Phase 5+ write-back to Notion.

This is a **data ingestion pipeline**, not a sync problem. The correct pattern is ETL, not CRDT.

---

## 5. The Right Pattern: Scheduled ETL + Last-Write-Wins

### 5.1 Architecture

```
┌─────────────────────────────────────────────────┐
│                 Mission Control                   │
│                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐ │
│  │ Next.js  │   │ Drizzle  │   │   SQLite DB   │ │
│  │   UI     │──>│   ORM    │──>│  (canonical)  │ │
│  └──────────┘   └──────────┘   └───────┬───────┘ │
│                                        │         │
│  ┌─────────────────────────────────────┘         │
│  │  ETL Workers (node-cron or setInterval)       │
│  │                                               │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  │ Notion  │  │ Airtable │  │  Future:     │ │
│  │  │ Ingester│  │ Ingester │  │  Email/Cal   │ │
│  │  └────┬────┘  └────┬─────┘  └──────┬──────┘ │
│  │       │             │               │         │
│  └───────┼─────────────┼───────────────┘         │
│          │             │                          │
└──────────┼─────────────┼──────────────────────────┘
           │             │
    [Notion API]   [Airtable API]
    (read-only)    (read-only)
```

### 5.2 Sync Protocol (Simple)

```typescript
// Pseudocode for Notion ingester
async function syncNotionHub(hubId: string) {
  const lastSync = await db.query.syncState.findFirst({
    where: eq(syncState.sourceId, `notion:${hubId}`)
  });

  const lastEditedAfter = lastSync?.lastSyncedAt ?? new Date(0);

  // Notion API: query with filter for last_edited_time > lastSync
  const pages = await notion.databases.query({
    database_id: hubId,
    filter: {
      timestamp: 'last_edited_time',
      last_edited_time: { after: lastEditedAfter.toISOString() }
    }
  });

  for (const page of pages.results) {
    // Upsert: INSERT ... ON CONFLICT (source_id, source_ref) DO UPDATE
    await db.insert(projects).values({
      title: extractTitle(page),
      sourceId: 'notion',
      sourceRef: page.id,
      rawJson: JSON.stringify(page),
      syncedAt: new Date(),
    }).onConflictDoUpdate({
      target: [projects.sourceId, projects.sourceRef],
      set: {
        title: extractTitle(page),
        rawJson: JSON.stringify(page),
        syncedAt: new Date(),
      }
    });
  }

  // Update sync cursor
  await db.insert(syncState).values({
    sourceId: `notion:${hubId}`,
    lastSyncedAt: new Date(),
  }).onConflictDoUpdate({
    target: syncState.sourceId,
    set: { lastSyncedAt: new Date() }
  });
}

// Schedule: every 10 minutes while MC is running
setInterval(() => {
  syncNotionHub('14374ccd7c698089945ed119d1b1e1c0'); // CraftCode
  syncNotionHub('2f174ccd7c6980198e7be0c2831e6b25'); // Buraks Lab
  // ... other hubs
}, 10 * 60 * 1000);
```

### 5.3 Conflict Resolution: Last-Write-Wins (LWW)

Since MC is the ONLY writer to its SQLite database, and Notion/Airtable are read-only sources, there are only two conflict scenarios:

**Scenario A: Burak edits an item in MC UI after it was ingested from Notion.**
- Decision: MC edit wins. Set a `locallyModified: true` flag. Future syncs skip updating locally modified fields.
- This is the simplest correct behavior for a personal tool.

**Scenario B: Burak edits the same item in both Notion and MC UI.**
- Decision: Last write wins, with `locallyModified` items protected. If Burak explicitly wants to "re-sync from Notion," add a "Reset to source" button.
- This is a UI problem, not a CRDT problem.

**Scenario C: Two MC instances running simultaneously.**
- Decision: Don't do this. MC is single-process. SQLite's write lock prevents corruption.

None of these scenarios require CRDTs.

### 5.4 Why Not Webhooks?

Notion webhooks are unreliable, rate-limited, and require a public endpoint (MC is localhost). Airtable webhooks have similar constraints. Polling is simpler, more reliable, and perfectly adequate for a personal tool where 5-10 minute staleness is invisible.

If sub-second freshness becomes important later, consider:
- Notion's `last_edited_time` filter for incremental polling (already in the design above)
- A lightweight WebSocket listener IF Notion ships their long-promised real-time API
- For now: 10-minute polling is correct

---

## 6. Event Sourcing as a Middle Ground

Event sourcing stores every change as an immutable event, then derives current state by replaying events. It's between "just overwrite" and "full CRDT."

### When Event Sourcing Makes Sense for MC

1. **Audit trail**: "Show me what changed in my finances this week" -- replay events
2. **Undo/redo**: Reverse a sync that overwrote local edits
3. **Time travel**: "What did my project list look like on April 1st?"
4. **Agent accountability**: "Which agent run modified this data?"

### When It Doesn't

1. Simple dashboard reads (95% of MC usage)
2. Data that's ephemeral (sync cursors, UI state)
3. When SQLite WAL already provides crash recovery

### Lightweight Event Sourcing for MC (If Desired Later)

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  entity_type TEXT NOT NULL,       -- 'project', 'task', 'financial_snapshot'
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,        -- 'created', 'updated', 'deleted', 'synced_from_notion'
  payload JSON NOT NULL,           -- the changed fields
  source TEXT NOT NULL DEFAULT 'in-app', -- 'in-app', 'notion', 'airtable', 'agent:xxx'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX idx_events_time ON events(created_at);
```

This is NOT a full event-sourced architecture (no CQRS, no projections, no event bus). It's a change log. The main tables remain the source of truth for reads. The events table is append-only and used for:
- Debugging sync issues
- Displaying "recent changes" in the UI
- Future agent audit trail

**Recommendation**: Add the events table in Phase 3 or later. Not Phase 2. Get basic sync working first with plain upserts.

---

## 7. Comparison Matrix: All Options Scored for MC

| Criterion (weight) | Scheduled ETL + LWW | Event Sourcing (light) | cr-sqlite | ElectricSQL | Automerge | Yjs | Replicache |
|---|---|---|---|---|---|---|---|
| **Fit for MC** (30%) | 10 | 7 | 4 | 3 | 2 | 2 | 2 |
| **Implementation effort** (25%) | 10 | 7 | 5 | 3 | 3 | 3 | 3 |
| **Correctness** (15%) | 9 | 9 | 9 | 9 | 10 | 10 | 9 |
| **Performance** (10%) | 9 | 8 | 7 | 7 | 6 | 9 | 9 |
| **Future flexibility** (10%) | 6 | 8 | 7 | 8 | 8 | 7 | 7 |
| **Ecosystem/docs** (10%) | 9 | 7 | 3 | 6 | 5 | 8 | 5 |
| **Weighted total** | **9.15** | **7.45** | **4.85** | **4.35** | **3.55** | **3.75** | **3.55** |

**Winner by a wide margin: Scheduled ETL + Last-Write-Wins.**

---

## 8. Risk Assessment

### Risk 1: "But What If MC Goes Multi-Device Later?"

**Probability**: Low (10-15%). MC's vision is explicitly single-machine.
**Impact**: Medium. Would need to add sync.
**Mitigation**: The SQLite schema is clean. If multi-device becomes needed, cr-sqlite can be added as an extension WITHOUT changing the schema. The ETL layer would continue to work. Migration cost: 2-3 days, not a rewrite.

### Risk 2: "Notion API Rate Limits"

**Probability**: Medium (30%). Notion's API has a 3 req/sec rate limit.
**Impact**: Low. MC has 4 hubs. Even with 100 pages per hub, full sync is ~130 requests = ~45 seconds. Incremental sync (last_edited_time filter) is 4-8 requests.
**Mitigation**: Exponential backoff. Incremental sync by default. Full sync only on demand.

### Risk 3: "Airtable Schema Changes Breaking Ingestion"

**Probability**: Medium (40%). Airtable schemas are mutable by end users (Ali, in MAYTT's case).
**Impact**: Medium. Broken ingestion until field mapping is updated.
**Mitigation**: Store raw JSON in `rawJson` column. Parse lazily. Log ingestion errors. Don't crash the whole app if one source fails.

### Risk 4: "Burak Edits in Both Notion and MC, Data Diverges"

**Probability**: High (60%). During the Notion-to-MC migration, Burak will use both.
**Impact**: Low. For a personal tool, "I can see my latest changes within 10 minutes" is sufficient. No business-critical transactions depend on perfect sync.
**Mitigation**: `locallyModified` flag. "Source" badge in UI showing where data came from. "Reset to Notion" button. Eventually, MC becomes primary and Notion is archived (Phase 4-5 per VISION.md).

### Risk 5: "ETL Worker Crashes Silently"

**Probability**: Medium (30%).
**Impact**: Low. Data just becomes stale. No data loss.
**Mitigation**: `syncState` table tracks last successful sync time. Dashboard shows "Last synced: 3 hours ago" warning if stale. Health check in Ubersicht module.

---

## 9. Implementation Plan for MC Phase 2

### Step 1: Sync State Table (0.5 days)
Add to Drizzle schema:
```typescript
export const syncState = sqliteTable('sync_state', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: text('source_id').notNull().unique(), // 'notion:14374ccd...'
  lastSyncedAt: text('last_synced_at'),
  lastCursor: text('last_cursor'), // for paginated APIs
  itemsSynced: integer('items_synced').default(0),
  lastError: text('last_error'),
  status: text('status').default('idle'), // 'idle', 'running', 'error'
});
```

### Step 2: Notion Ingester (1-2 days)
- One function per hub type (projects, tasks, finance)
- Field mapping config: `{ notionProperty: 'Name', mcColumn: 'title' }`
- Upsert with `ON CONFLICT (source_id, source_ref) DO UPDATE`
- Raw JSON preserved for debugging
- Error handling: log and continue, never crash

### Step 3: Scheduler (0.5 days)
- `setInterval` in Next.js server startup (or a separate `sync-worker.mjs`)
- 10-minute default interval, configurable
- Manual "Sync Now" button in UI
- Status display in Ubersicht: last sync time, items synced, errors

### Step 4: Source Badge UI (0.5 days)
- Small badge on each item: "Notion", "In-App", "Airtable"
- `locallyModified` flag shown as "Edited locally" indicator

### Step 5: Airtable Ingester (1 day, Phase 5+ per VISION.md)
- Same pattern as Notion
- Airtable API is simpler (REST, no block model)
- Lower priority: MAYTT data is Phase 5+

**Total Phase 2 sync effort: 3-4 days.**

Compare with CRDT-based approach: 3-4 WEEKS minimum, plus ongoing complexity tax on every feature.

---

## 10. Catalogue Cross-References

### Existing catalogue entries with local-first relevance:

1. **gbrain (Garry Tan)** -- `research/catalogue/agent-memory/garrytan-gbrain.md`
   - Uses PGLite (Postgres-in-browser) for agent memory
   - Relevant pattern: "thin harness, fat skills" -- the sync layer should be thin
   - gbrain stores conversation history locally; similar to MC storing ingested data locally
   - Score: 9/9/9 in catalogue -- but PGLite is for agent memory, not dashboard sync

2. **Karpathy LLM Wiki Pattern** -- `research/catalogue/posts/2026-04/karpathy-llm-wiki-knowledge-bases.md`
   - Knowledge bases as flat files (Markdown/JSON)
   - MC's SQLite approach is compatible: SQLite IS a file
   - Key insight: "The wiki is the interface" -- MC's dashboard IS the interface to ingested data

3. **Wattenberger: What Comes After IDE** -- `research/catalogue/posts/2026-01/wattenberger-what-comes-after-ide.md`
   - Argues for tools that understand your data natively
   - MC aligns: it ingests YOUR Notion/Airtable data into YOUR local SQLite

4. **Harness Convergence Wave Synthesis** -- `research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md`
   - "Thin harness, fat skills" pattern appears repeatedly
   - Sync should be a thin layer, not the architecture's centerpiece

### NOT in catalogue (gaps to fill):
- No dedicated entry for Ink & Switch / local-first manifesto
- No entry for ElectricSQL, Replicache, or PowerSync
- No entry for Steph Ango "File Over App"
- These could be added as `research/catalogue/reference/` entries if the community relevance warrants it

---

## 11. The Contrarian Take: When CRDTs WOULD Be Right

For completeness, here are the scenarios where revisiting CRDTs makes sense:

1. **MC goes mobile** (iPad companion app that syncs with laptop SQLite) -- cr-sqlite becomes compelling
2. **MC becomes multi-user** (team dashboard) -- Yjs for real-time UI, Electric for data sync
3. **MC needs offline-resilient write-back to Notion** (bidirectional sync with conflict resolution) -- event sourcing + custom merge, not CRDTs but closer to their territory
4. **MC stores collaborative documents** (rich text notes edited by Burak + agents simultaneously) -- Yjs is the clear winner

None of these are in the current VISION.md. If they enter scope, revisit this document.

---

## 12. Final Verdict

**For Mission Control v2, the answer is unambiguous:**

| Question | Answer |
|----------|--------|
| Is CRDT complexity justified? | **No.** |
| Is a sync engine needed? | **No.** |
| Is "local-first" relevant? | **MC is already local-first by being SQLite on localhost.** |
| What pattern fits? | **Scheduled ETL + Last-Write-Wins** |
| Should event sourcing be added? | **Not in Phase 2. Maybe Phase 3+ for audit trail.** |
| What about future multi-device? | **cr-sqlite can be added later. Schema won't need to change.** |
| Implementation effort? | **3-4 days for full Notion sync. Compare: 3-4 weeks for any CRDT approach.** |

The local-first movement produced brilliant research and important software. But brilliance applied to the wrong problem is waste. Mission Control's sync needs are a solved problem: poll an API, upsert into a database, show a "last synced" timestamp. Ship it.

---

*Research conducted 2026-04-12. Technologies assessed at their current (April 2026) state of maturity.*
