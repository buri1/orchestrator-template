# W1-02: Notion API Capabilities & Sync Feasibility (2026)

**Date**: 2026-04-12
**Context**: Mission Control v2 Phase 2 — Notion Sync Layer
**Key Question**: Is real-time or near-real-time two-way sync between 4 Notion databases and a local SQLite store feasible?
**Verdict**: Read-only mirror is straightforward (2-3 day build). Two-way sync is possible but carries significant complexity. Near-real-time (<30s) requires polling; there are no webhooks.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Notion API Overview (2026 State)](#2-notion-api-overview)
3. [Rate Limits & Pagination](#3-rate-limits--pagination)
4. [Data Model: What Is Queryable vs Not](#4-data-model-what-is-queryable-vs-not)
5. [Webhook Support (or Lack Thereof)](#5-webhook-support-or-lack-thereof)
6. [Polling Strategies](#6-polling-strategies)
7. [Known Gotchas & Pain Points](#7-known-gotchas--pain-points)
8. [Ecosystem: SDKs, Libraries, Community Tools](#8-ecosystem)
9. [Real-World Sync Implementations](#9-real-world-sync-implementations)
10. [MC-Specific Feasibility: 4 Hubs + 11 Finance Sub-DBs](#10-mc-specific-feasibility)
11. [Minimal Viable Sync (Read-Only Mirror)](#11-minimal-viable-sync)
12. [Two-Way Sync Architecture](#12-two-way-sync-architecture)
13. [Technology Comparison Matrix](#13-technology-comparison-matrix)
14. [Risk Assessment](#14-risk-assessment)
15. [Implementation Roadmap](#15-implementation-roadmap)
16. [Recommendation](#16-recommendation)

---

## 1. Executive Summary

### Key Findings

| Dimension | Assessment |
|-----------|-----------|
| **Read-only mirror feasibility** | HIGH — straightforward with official SDK, 2-3 day build |
| **Two-way sync feasibility** | MEDIUM — possible but complex conflict resolution needed |
| **Near-real-time latency** | 30-60s polling is practical minimum (no webhooks) |
| **Rate limit headroom** | COMFORTABLE — 3 req/sec average allows syncing ~10,800 pages/hour |
| **Rich text complexity** | HIGH PAIN — Notion's block model is deeply nested, lossy round-trips |
| **Official SDK maturity** | GOOD — @notionhq/client v2.x is stable, typed, actively maintained |
| **Webhook availability** | NONE — no official webhooks as of 2026. Polling only. |
| **4-hub sync volume** | LOW — estimated <500 total pages across all 4 hubs = trivial for rate limits |

### Primary Recommendation

**Phase 2 approach: Read-only polling mirror with 60-second intervals, using @notionhq/client + Drizzle ORM, storing Notion data in SQLite with `source_id = 'notion:<page_id>'` tracking.**

Do NOT attempt two-way sync in Phase 2. The complexity-to-value ratio is unfavorable when the goal is Notion independence (per VISION.md 5-phase migration plan). Write-back should only be considered in Phase 4+ if Notion remains in use.

---

## 2. Notion API Overview

### API Version & Base URL

- **Current version**: `2022-06-28` (header: `Notion-Version: 2022-06-28`)
- **Base URL**: `https://api.notion.com/v1/`
- **Auth**: Internal integration tokens (bearer) or OAuth2 for public integrations
- **SDK**: `@notionhq/client` — official TypeScript/JavaScript SDK, v2.2.x+ (2026)

### Core Endpoints

| Endpoint | Method | Purpose | Rate Cost |
|----------|--------|---------|-----------|
| `databases/{id}/query` | POST | Query database rows with filters/sorts | 1 req |
| `pages/{id}` | GET | Retrieve single page properties | 1 req |
| `pages/{id}` | PATCH | Update page properties | 1 req |
| `pages` | POST | Create new page | 1 req |
| `blocks/{id}/children` | GET | List child blocks (page content) | 1 req |
| `blocks/{id}/children` | PATCH | Append blocks to page | 1 req |
| `blocks/{id}` | GET | Retrieve single block | 1 req |
| `blocks/{id}` | PATCH | Update single block | 1 req |
| `blocks/{id}` | DELETE | Delete block | 1 req |
| `search` | POST | Full-text search across workspace | 1 req |
| `users` | GET | List workspace users | 1 req |

### Authentication for MC

MC needs an **internal integration** (not OAuth2 public):
1. Create integration at https://www.notion.so/my-integrations
2. Get the `Internal Integration Secret` (starts with `ntn_` or `secret_`)
3. Share each database/page with the integration (click "..." > "Connections" > add integration)
4. Store token in `.env.local` as `NOTION_API_KEY`

**Critical**: Each of the 4 hubs and all sub-databases must be explicitly shared with the integration. This is a manual step per database.

---

## 3. Rate Limits & Pagination

### Rate Limits

| Limit Type | Value | Notes |
|-----------|-------|-------|
| **Average rate** | 3 requests/second | Per integration token |
| **Burst** | ~10 requests in quick succession | Undocumented but observed |
| **Response header** | `Retry-After` | Seconds to wait when rate-limited |
| **HTTP status** | `429 Too Many Requests` | Standard rate limit response |
| **Per-integration** | Shared across all API calls | NOT per endpoint |
| **Search endpoint** | Same pool | No separate limit |

### Rate Limit Math for MC

```
4 hubs × ~100 pages each = ~400 pages
11 Finance sub-DBs × ~30 rows each = ~330 rows
Total: ~730 rows to sync

At 3 req/sec:
- Full initial sync: ~730 / 3 = ~243 seconds (~4 minutes)
- If fetching blocks too: ~730 × 2 / 3 = ~487 seconds (~8 minutes)
- Incremental sync (changed pages only): typically <50 pages = <17 seconds
```

**Verdict**: Rate limits are NOT a bottleneck for MC's scale. Even a full re-sync takes under 10 minutes.

### Pagination

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Max page_size** | 100 | Per `databases/{id}/query` call |
| **Cursor-based** | `start_cursor` + `has_more` | NOT offset-based |
| **Block children** | Also paginated, max 100 | Recursive for nested blocks |

**Pagination pattern**:
```typescript
let cursor: string | undefined;
do {
  const response = await notion.databases.query({
    database_id: dbId,
    start_cursor: cursor,
    page_size: 100,
    filter: { timestamp: "last_edited_time", last_edited_time: { after: lastSync } }
  });
  // process response.results
  cursor = response.has_more ? response.next_cursor : undefined;
} while (cursor);
```

---

## 4. Data Model: What Is Queryable vs Not

### Fully Queryable (via database/query filter)

| Property Type | Filterable | Sortable | Notes |
|--------------|-----------|----------|-------|
| Title | Yes | Yes | Primary name field |
| Rich text | Yes (contains, equals) | No | Text content only, not formatting |
| Number | Yes | Yes | All comparators |
| Select | Yes | Yes | Single select |
| Multi-select | Yes | No | Contains/does_not_contain |
| Date | Yes | Yes | Before/after/on_or_before etc. |
| Checkbox | Yes | Yes | equals true/false |
| URL | Yes | No | equals/contains |
| Email | Yes | No | equals/contains |
| Phone | Yes | No | equals/contains |
| Status | Yes | Yes | Like select but with groups |
| Created time | Yes | Yes | Automatic |
| Last edited time | Yes | Yes | **KEY FOR SYNC** |
| Created by | Yes | No | User reference |
| Last edited by | Yes | No | User reference |
| People | Yes | No | Contains user |
| Files | No | No | **Not filterable** |
| Relation | Yes | No | Contains page ID |
| Formula | Depends | Depends | Based on output type |

### NOT Queryable or Limited

| Property Type | Limitation |
|--------------|-----------|
| **Rollup** | NOT filterable or sortable via API (must compute client-side) |
| **Files & media** | Not filterable; URLs returned but files hosted on Notion's S3 with expiring URLs |
| **Unique ID** | Filterable since 2023 but read-only |
| **Verification** | Not available via API |
| **Button** | Not available via API |
| **Page content (blocks)** | Separate API call per page, not part of database query |
| **Comments** | Separate endpoint, limited functionality |
| **Synced blocks** | Reference only, content requires resolving |

### Critical for MC Sync

The `last_edited_time` property is the **cornerstone of incremental sync**. It is:
- Automatically maintained by Notion
- Filterable with `after` / `on_or_after` comparators
- Available on every page without configuration
- Updated when ANY property changes OR when page content (blocks) change

**However**: It does NOT distinguish between property edits and block edits. A sync that only cares about property changes will still be triggered by content edits.

---

## 5. Webhook Support (or Lack Thereof)

### Status: NO WEBHOOKS (as of April 2026)

Notion has **never shipped webhooks** despite years of community requests. The status:

- **2020**: API launched, no webhooks
- **2021**: "Webhooks are on our roadmap" (Notion DevRel)
- **2022-2023**: No movement, community workarounds proliferate
- **2024**: Notion acquired Skiff; focus shifted to enterprise features
- **2025-2026**: Still no webhooks. The official recommendation remains polling.

### Workarounds in the Wild

1. **Polling `last_edited_time`** — The standard approach. Query with filter `last_edited_time > lastSyncTimestamp`.
2. **Notion Automations** — Notion's built-in automations can trigger on property changes but can only call Notion's own "Send to webhook" action (Slack, external URL). This is a **partial workaround**:
   - Only triggers on property changes in databases (not page content changes)
   - Can POST to an arbitrary URL with limited payload
   - Does NOT include the full page data — just a notification
   - Still requires an API call to fetch the actual changed data
3. **Third-party services** — Zapier, Make.com, n8n have Notion triggers that internally poll
4. **RSS feeds** — Some community tools expose Notion databases as RSS; unreliable

### Impact on MC

Without webhooks, MC must poll. This is fine for our use case:
- 60-second polling interval is sufficient for a personal dashboard
- The data volume is small (~730 pages across all databases)
- Incremental polling (filter by `last_edited_time > lastSync`) costs 1-4 API calls per database per poll cycle
- Total polling cost: ~15 API calls per 60-second cycle = 0.25 req/sec (well within 3 req/sec limit)

---

## 6. Polling Strategies

### Strategy 1: Periodic Full Diff (Simple, Recommended for Phase 2)

```
Every 60 seconds:
  For each database:
    Query all pages where last_edited_time > lastSyncTimestamp
    For each changed page:
      Upsert into SQLite (match on source_ref = notion:<page_id>)
    Update lastSyncTimestamp = now()
```

**Pros**: Simple, reliable, handles all change types
**Cons**: Misses deletes (archived/deleted pages don't appear in queries)
**API cost**: 1-4 requests per database per cycle (pagination dependent)

### Strategy 2: Full Resync + Diff (Robust, Catches Deletes)

```
Every 5 minutes:
  For each database:
    Fetch ALL page IDs (just IDs, not full properties)
    Compare with SQLite source_ref set
    New pages: fetch full properties + upsert
    Missing pages: mark as archived/deleted in SQLite
    Changed pages (via last_edited_time): fetch full properties + upsert
```

**Pros**: Catches deletes, complete consistency
**Cons**: More API calls (~7 per database per cycle for 100-page DBs)
**API cost**: ~7-15 requests per database per 5-minute cycle

### Strategy 3: Hybrid (Recommended for Production)

```
Every 60 seconds: Strategy 1 (incremental changes only)
Every 15 minutes: Strategy 2 (full resync to catch deletes)
On app startup: Strategy 2 (ensure consistency)
```

**Pros**: Best of both worlds — low latency for changes, eventual consistency for deletes
**Cons**: Slightly more complex code
**API cost**: ~20 requests per minute average across all databases

### Recommended for MC Phase 2

**Strategy 3 (Hybrid)** with these parameters:
- Incremental poll: every 60 seconds
- Full resync: every 15 minutes
- Startup: full resync
- Backoff: exponential on 429 responses (2s, 4s, 8s, 16s cap)

---

## 7. Known Gotchas & Pain Points

### 7.1 Rich Text Complexity

Notion's rich text is NOT a string. It's an array of `RichTextItemResponse` objects:

```typescript
// What you get from the API for a "Rich text" property:
{
  "type": "rich_text",
  "rich_text": [
    {
      "type": "text",
      "text": { "content": "Hello ", "link": null },
      "annotations": { "bold": false, "italic": false, "strikethrough": false, "underline": false, "code": false, "color": "default" },
      "plain_text": "Hello ",
      "href": null
    },
    {
      "type": "text",
      "text": { "content": "world", "link": null },
      "annotations": { "bold": true, "italic": false, ... },
      "plain_text": "world",
      "href": null
    }
  ]
}
```

**MC impact**: For sync purposes, extracting `plain_text` concatenation is sufficient. Do NOT try to preserve formatting in SQLite — store `plain_text` for searchability and optionally store the raw JSON for fidelity.

**Recommended approach**:
```typescript
function extractPlainText(richText: RichTextItemResponse[]): string {
  return richText.map(rt => rt.plain_text).join('');
}
```

### 7.2 Relation Properties

Relations return an array of page IDs, NOT the related page's properties:

```typescript
{
  "type": "relation",
  "relation": [
    { "id": "page-uuid-1" },
    { "id": "page-uuid-2" }
  ]
}
```

**MC impact**: To resolve relations, you need additional API calls per related page. For the sync layer:
- Store relation IDs in a junction table
- Resolve lazily (fetch related page data on demand, not during sync)
- OR resolve during full resync only

### 7.3 Rollup Properties

Rollups are computed server-side by Notion and **returned read-only** via the API. You CANNOT filter or sort by rollups. They compute across relations:

```typescript
{
  "type": "rollup",
  "rollup": {
    "type": "number",  // or date, array, etc.
    "number": 42,
    "function": "sum"
  }
}
```

**MC impact**: If any Finance sub-DBs use rollups for totals, those values are available as read-only snapshots. They cannot be recomputed locally without replicating the relation + rollup logic in SQLite.

### 7.4 Formula Properties

Formulas are also computed server-side. The API returns the result, not the formula expression:

```typescript
{
  "type": "formula",
  "formula": {
    "type": "string",  // or number, boolean, date
    "string": "Q2-2026-Active"
  }
}
```

**MC impact**: Store formula results as plain values. They refresh when the source page is updated in Notion.

### 7.5 File Properties & Expiring URLs

Files uploaded to Notion (not external URLs) have **expiring signed S3 URLs** (typically 1 hour):

```typescript
{
  "type": "file",
  "file": {
    "url": "https://prod-files-secure.s3.us-west-2.amazonaws.com/...",
    "expiry_time": "2026-04-12T13:00:00.000Z"
  }
}
```

**MC impact**: If any databases contain file attachments, URLs must be refreshed before use. Options:
- Download and cache locally during sync
- Re-fetch URL on demand (costs 1 API call)
- Ignore files in Phase 2 (recommended)

### 7.6 Page Content (Blocks) vs Properties

**Database query returns ONLY properties, NOT page content.** To get the content (text, headings, lists, etc. written inside a page), you must call `blocks/{page_id}/children` separately.

Block types include: paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item, to_do, toggle, child_page, child_database, embed, image, video, file, pdf, bookmark, callout, quote, equation, divider, table_of_contents, column_list, column, link_to_page, synced_block, template, link_preview, table, table_row.

**MC impact**: For database sync, you likely do NOT need block content. Properties (title, status, dates, numbers) are sufficient for the dashboard. Block content fetching should be deferred to Phase 3+ if needed (e.g., for notes/content display).

### 7.7 Deleted/Archived Pages

- **Archived pages** (trashed): Still queryable with `filter: { property: "archived", checkbox: { equals: true } }` — BUT this filter is NOT available on the standard query endpoint. You must use `search` with `filter: { property: "object", value: "page" }` and check `archived: true` in results.
- **Permanently deleted pages**: Completely gone. API returns 404. Only detectable by absence.
- **MC impact**: Use full resync (Strategy 2) every 15 minutes to detect deletions by diffing known IDs.

### 7.8 Date Properties: Timezone Handling

Notion dates can be:
- Date only: `"2026-04-12"` (no time, no timezone)
- DateTime with timezone: `"2026-04-12T09:00:00.000+02:00"`
- Date range: `{ "start": "2026-04-12", "end": "2026-04-15" }`

**MC impact**: Store as ISO strings in SQLite. Use `dayjs` or `date-fns` for timezone-aware comparisons. Do NOT assume UTC.

### 7.9 API Versioning Stability

Notion uses date-based API versioning (`Notion-Version: 2022-06-28`). The current version has been stable since June 2022. Breaking changes require a new version header. The SDK handles this automatically.

**MC impact**: Low risk. Pin to `2022-06-28` and update only when beneficial.

### 7.10 Search Endpoint Limitations

The `search` endpoint:
- Searches across the entire workspace (not scoped to a database)
- Returns max 100 results per request
- Sorts by "most relevant" (not by date or title)
- Cannot filter by database ID (you get ALL pages matching the query)
- Rate-limited from the same pool as all other endpoints

**MC impact**: Do NOT use `search` for sync. Use `databases/{id}/query` per database instead.

---

## 8. Ecosystem

### 8.1 Official SDK: @notionhq/client

| Attribute | Detail |
|-----------|--------|
| **Package** | `@notionhq/client` |
| **Current version** | 2.2.x (2026) |
| **Language** | TypeScript (full type definitions) |
| **Maintained by** | Notion (official) |
| **License** | MIT |
| **GitHub stars** | ~5,000+ |
| **Bundle size** | ~50KB (minimal dependencies) |
| **Key dependency** | `node-fetch` (for Node.js < 18), none for Node 18+ |
| **Auto-retry** | Built-in for 429 responses |
| **Pagination helpers** | `iteratePaginatedAPI()` utility |
| **Type safety** | Full TypeScript types for all API responses |

**Usage**:
```typescript
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Query a database
const response = await notion.databases.query({
  database_id: 'your-db-id',
  filter: {
    timestamp: 'last_edited_time',
    last_edited_time: { after: '2026-04-11T00:00:00Z' }
  },
  sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
  page_size: 100
});

// Iterate with built-in pagination
for await (const page of notion.databases.query.paginate({
  database_id: 'your-db-id'
})) {
  // process each page
}
```

**Verdict**: Use this. It's the right choice. Well-typed, auto-retry, actively maintained.

### 8.2 notion-to-md

| Attribute | Detail |
|-----------|--------|
| **Package** | `notion-to-md` |
| **Current version** | 3.x (2026) |
| **Purpose** | Convert Notion blocks to Markdown |
| **Quality** | Good for basic content, lossy for complex blocks |
| **Use case** | Blog/CMS export, static site generators |

**MC impact**: NOT needed for Phase 2 (properties-only sync). Potentially useful in Phase 3+ if MC wants to display Notion page content as rendered markdown.

### 8.3 Notable Community Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **notion-sdk-js** | Official SDK (same as @notionhq/client) | |
| **notion-to-md** | Block-to-markdown conversion | v3 stable |
| **notion-enhancer** | Browser extension for Notion UI | Not API-related |
| **react-notion-x** | React renderer for Notion blocks | Good if MC wants to render Notion pages in UI |
| **notion-client** (unofficial) | Alternative client with caching | Less maintained than official |
| **notion-types** | TypeScript types for unofficial API | Based on reverse-engineered internal API |
| **notion2md** (Go) | Go-based converter | Not relevant for MC stack |
| **notionapi** (Python) | Python client | Not relevant for MC stack |

### 8.4 Sync-Specific Libraries

There is **no established off-the-shelf Notion-to-SQLite sync library** in the npm ecosystem. Existing approaches:

1. **Custom sync scripts** — Most common. 100-300 lines of TypeScript.
2. **n8n / Zapier / Make** — Polling-based triggers with database inserts
3. **notion-backup** — Exports full workspace to Markdown/HTML files (not database sync)
4. **Datadog/monitoring tools** — Some have Notion integrations for metrics extraction

**MC impact**: We build our own sync layer. This is the right call — it's 200-400 lines of code and gives us full control over the mapping logic.

---

## 9. Real-World Sync Implementations

### Pattern A: One-Way Mirror (Most Common)

Used by: Static site generators (Astro + Notion, Next.js blog templates), dashboard tools.

```
Notion DB → Poll API → Transform → SQLite/Postgres → App reads from DB
```

- Sync interval: 1-5 minutes
- Conflict resolution: Notion wins (overwrite local)
- Deletion handling: Mark as archived or full resync diff

**GitHub examples**:
- `splitbee/notion-api-worker` — Cloudflare Worker that caches Notion API responses
- `transitive-bullshit/nextjs-notion-starter-kit` — Next.js + Notion as CMS, polling-based
- `NotionX/react-notion-x` — Includes data fetching layer with caching

### Pattern B: Two-Way Sync (Rare, Complex)

Used by: Notion-to-Linear sync, Notion-to-Jira bridges, enterprise integrations.

```
Notion DB ←→ Sync Engine ←→ Local DB
              ↑ conflict resolver
              ↑ change tracker (both sides)
```

Challenges observed in real implementations:
1. **Conflict detection**: Both sides may edit the same field between polls. Need `last_edited_time` comparison.
2. **Write amplification**: Updating Notion triggers `last_edited_time` change, which your next poll sees as a "Notion change," creating a loop.
3. **Partial update semantics**: Notion PATCH updates individual properties, but local edits may touch multiple fields simultaneously.
4. **ID mapping**: Notion uses UUIDs, local DB may use auto-increment. Need a reliable bidirectional mapping table.

**GitHub examples**:
- `makenotion/notion-sdk-js` examples directory — basic CRUD patterns
- Various "Notion to Google Sheets" bidirectional sync scripts — illustrate the conflict resolution complexity

### Pattern C: Event-Sourced Sync (Sophisticated)

Used by: Some enterprise tools.

```
Changes logged as events → Event store → Projections to both Notion and local DB
```

**MC impact**: Over-engineered for our scale. Interesting as a future pattern if MC becomes multi-user.

---

## 10. MC-Specific Feasibility: 4 Hubs + 11 Finance Sub-DBs

### Hub Inventory (from notion-sources.md)

| Hub | Database ID | Estimated Rows | Key Properties |
|-----|------------|-----------------|----------------|
| **CraftCode AI Agency** | `14374ccd7c698089945ed119d1b1e1c0` | ~80 | Projects, tasks, clients |
| **Buraks Lab** | `2f174ccd7c6980198e7be0c2831e6b25` | ~120 | Research, ideas, notes |
| **Finance Agent** | `30674ccd7c698132a182e8b672939c62` | ~50 | Master finance DB |
| **Genmedia Agency** | `14374ccd7c6980438e5be0974d4f239d` | ~60 | Content, campaigns |

### Finance Sub-DBs (11 total, from notion-sources.md)

| Sub-DB | Purpose | Estimated Rows |
|--------|---------|----------------|
| Einnahmen | Revenue entries | ~40 |
| Ausgaben | Expense entries | ~80 |
| Rechnungen | Invoices | ~30 |
| Steuern | Tax records | ~20 |
| Abonnements | Subscriptions | ~25 |
| Bankkonten | Bank accounts | ~5 |
| Budgets | Budget plans | ~10 |
| Finanzielle Ziele | Financial goals | ~10 |
| Kreditgeber | Creditors | ~15 |
| Fristen | Deadlines | ~20 |
| Wunschliste | Wishlist | ~30 |

### Total Estimated Volume

```
4 hubs:    ~310 rows
11 sub-DBs: ~285 rows
Total:     ~595 rows

With 15% growth buffer: ~685 rows
```

### API Cost per Full Sync

```
15 databases × 1 query each (all fit in 100-page pages) = 15 requests
15 requests at 3 req/sec = 5 seconds

Incremental sync (assuming 5% change rate):
~35 changed rows = 15 queries (one per DB, most return 0-5 results) = 5 seconds
```

**Verdict**: The data volume is trivially small. Rate limits are a non-issue. Even aggressive polling (every 30 seconds) would use only 0.5 req/sec average.

---

## 11. Minimal Viable Sync (Read-Only Mirror)

### Scope: Projects + Deadlines Only

The absolute minimum useful sync for MC Phase 2:

| Source | Target SQLite Table | Properties to Sync |
|--------|--------------------|--------------------|
| CraftCode AI Agency DB | `projects` | title, status, client, deadline, priority |
| Finance > Fristen | `deadlines` | title, due_date, type, status, linked_project |

### Implementation Estimate

| Component | Effort | Lines of Code |
|-----------|--------|---------------|
| Notion client setup + auth | 0.5 hours | ~30 |
| Property mapping (Notion → SQLite) | 2 hours | ~150 |
| Polling loop with incremental filter | 1 hour | ~80 |
| Drizzle upsert logic | 1.5 hours | ~100 |
| Sync state tracking (last_sync_time) | 0.5 hours | ~40 |
| Error handling + retry | 1 hour | ~60 |
| **Total** | **~6.5 hours** | **~460 lines** |

### Property Mapping Example

```typescript
// Notion page → SQLite project row
function mapNotionToProject(page: PageObjectResponse): NewProject {
  const props = page.properties;
  return {
    source_id: 'notion',
    source_ref: `notion:${page.id}`,
    title: extractTitle(props.Name || props.Title),
    status: extractSelect(props.Status),
    client: extractRichTextPlain(props.Client),
    deadline: extractDate(props.Deadline),
    priority: extractSelect(props.Priority),
    notion_last_edited: page.last_edited_time,
    synced_at: new Date().toISOString(),
  };
}
```

### Sync State Schema Addition

```sql
-- Already in data-schema.md as sync_state table:
CREATE TABLE sync_state (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,           -- 'notion'
  database_id TEXT NOT NULL,      -- Notion database UUID
  last_sync_at TEXT NOT NULL,     -- ISO timestamp
  last_cursor TEXT,               -- Pagination cursor if interrupted
  sync_status TEXT DEFAULT 'idle', -- idle | running | error
  error_message TEXT,
  rows_synced INTEGER DEFAULT 0,
  UNIQUE(source, database_id)
);
```

---

## 12. Two-Way Sync Architecture

### Why It Is Complex (But Possible)

Two-way sync introduces these challenges that read-only does not have:

#### Challenge 1: Conflict Detection

When both MC and Notion edit the same page between poll cycles:
- MC has `local_updated_at` timestamp
- Notion has `last_edited_time`
- If both are newer than `last_sync_at`, there is a conflict

**Resolution strategies**:
| Strategy | Description | Recommended? |
|----------|-------------|-------------|
| Last-write-wins | Higher timestamp wins | Simple but lossy |
| Notion-wins | Always prefer Notion data | Safe for Phase 2-3 |
| MC-wins | Always prefer local data | Only after Notion independence |
| Field-level merge | Compare per-property timestamps | Notion doesn't provide per-property timestamps |
| User prompt | Ask user to resolve | Breaks auto-mode |

**Recommendation**: "Notion-wins" for Phase 2-3, transitioning to "MC-wins" in Phase 4 (independence phase per VISION.md).

#### Challenge 2: Write-Back Loop Prevention

When MC updates a page in Notion:
1. MC writes to Notion API (PATCH)
2. Notion updates `last_edited_time`
3. Next poll sees the change as "new from Notion"
4. MC overwrites local data with what it just wrote

**Solution**: Track `last_write_to_notion` timestamp per page. If `notion.last_edited_time` is within 5 seconds of `last_write_to_notion`, skip it (it's our own echo).

```typescript
// Detect write-back echo
const isOwnEcho = page.last_edited_time && lastWriteTimestamp &&
  Math.abs(new Date(page.last_edited_time) - new Date(lastWriteTimestamp)) < 5000;
if (isOwnEcho) continue; // skip this change
```

#### Challenge 3: Property Type Mapping for Writes

Writing to Notion requires constructing the exact property format:

```typescript
// Writing a date back to Notion
await notion.pages.update({
  page_id: pageId,
  properties: {
    'Deadline': {
      type: 'date',
      date: {
        start: '2026-05-15',
        end: null,
        time_zone: null
      }
    },
    'Status': {
      type: 'select',
      select: { name: 'In Progress' }
    }
  }
});
```

Select options must match EXACTLY (case-sensitive). If MC creates a status value that doesn't exist in Notion's select options, the API returns 400.

#### Challenge 4: New Page Creation

Creating pages in Notion from MC requires:
- Knowing the exact database ID
- Mapping all required properties
- Generating correct property types
- Handling the returned Notion page ID for future sync

### Two-Way Implementation Estimate

| Component | Effort | Lines of Code |
|-----------|--------|---------------|
| Everything from read-only sync | 6.5 hours | ~460 |
| Write-back to Notion (PATCH) | 3 hours | ~200 |
| Create in Notion (POST) | 2 hours | ~150 |
| Conflict detection | 2 hours | ~100 |
| Write-back loop prevention | 1 hour | ~50 |
| Property type mapping (write direction) | 3 hours | ~250 |
| Delete/archive propagation | 1.5 hours | ~80 |
| Integration tests | 3 hours | ~300 |
| **Total** | **~22 hours** | **~1,590 lines** |

**Verdict**: 3-4x more effort than read-only. Defer to Phase 4+ per VISION.md plan.

---

## 13. Technology Comparison Matrix

### Sync Approach Comparison

| Criterion | Read-Only Poll (Rec.) | Two-Way Sync | Notion Automations Webhook | Third-Party (Zapier/n8n) |
|-----------|:----:|:----:|:----:|:----:|
| **Implementation complexity** | 3/10 | 7/10 | 5/10 | 2/10 |
| **Reliability** | 9/10 | 6/10 | 5/10 | 7/10 |
| **Latency (change detection)** | 60s | 60s | ~10s | 60-300s |
| **Data fidelity** | 9/10 | 7/10 | 4/10 | 6/10 |
| **Conflict risk** | None | High | Low | Low |
| **Maintenance burden** | Low | High | Medium | Medium |
| **Cost** | $0 (API free) | $0 (API free) | $0-20/mo | $20-50/mo |
| **Notion independence path** | Clean | Entangled | Entangled | Entangled |
| **Aligns with VISION.md** | Yes | Partially | No | No |
| **Effort estimate** | 6.5 hours | 22 hours | 8 hours | 2 hours |

### SDK/Library Comparison

| Criterion | @notionhq/client (Rec.) | notion-client (unofficial) | Raw fetch | react-notion-x |
|-----------|:----:|:----:|:----:|:----:|
| **Type safety** | 10/10 | 7/10 | 3/10 | 8/10 |
| **Maintenance** | 10/10 (official) | 5/10 | N/A | 7/10 |
| **Auto-retry (429)** | Yes | No | Manual | No |
| **Pagination helpers** | Yes | No | Manual | Yes |
| **Bundle size** | ~50KB | ~30KB | 0KB | ~200KB |
| **Community support** | Excellent | Limited | N/A | Good |
| **API coverage** | 100% | ~80% | 100% | ~60% (read-focused) |

---

## 14. Risk Assessment

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|:---------:|:------:|-----------|
| **Notion API rate limit hit** | Low (5%) | Low | Built-in SDK retry + exponential backoff. MC volume is 1/10th of limits. |
| **Notion API breaking change** | Very Low (2%) | Medium | Pin SDK version, date-based API versioning protects. |
| **Schema drift (Notion DB properties renamed)** | Medium (30%) | Medium | Validate property names on sync, alert on missing expected properties. Log and skip unknown. |
| **Rich text data loss in sync** | Medium (40%) | Low | Store `plain_text` extraction + raw JSON blob. Accept lossy for MC dashboard use case. |
| **Rollup/formula values stale** | Medium (25%) | Low | These are read-only snapshots. Accept eventual consistency. Document limitation. |
| **File URL expiration** | High (80%) | Low | Do not cache file URLs. Fetch on demand or ignore files in Phase 2. |
| **Notion outage during sync** | Low (5%) | Low | Retry with backoff. SQLite has last-good data. Dashboard continues working offline. |
| **Two-way sync conflicts** | High (70%) | High | **Do not implement two-way sync in Phase 2.** Defer to Phase 4+. |
| **Integration token leak** | Low (10%) | High | Store in `.env.local` (gitignored). Never commit. Rotate if exposed. |
| **Notion deprecates API** | Very Low (1%) | Critical | By Phase 4, MC should be primary. Notion data already mirrored locally. This is the entire point of the 5-phase independence plan. |

### Schema Drift Handling Strategy

Notion databases can have their properties renamed, retyped, or deleted by the user at any time. The sync layer must handle this gracefully:

```typescript
// Defensive property extraction
function extractProperty(page: PageObjectResponse, name: string, fallbacks: string[] = []): any {
  const allNames = [name, ...fallbacks];
  for (const n of allNames) {
    if (page.properties[n]) return page.properties[n];
  }
  console.warn(`Property "${name}" not found on page ${page.id}. Available: ${Object.keys(page.properties).join(', ')}`);
  return null;
}
```

---

## 15. Implementation Roadmap

### Phase 2a: Read-Only Mirror (Week 1, Days 1-3)

| Day | Task | Output |
|-----|------|--------|
| 1 | Set up Notion integration, share all 15 DBs, verify access | Auth working, all DBs accessible |
| 1 | Implement database discovery (list all shared DBs + their schemas) | Schema snapshot saved locally |
| 2 | Build property mapper for each MC table (projects, tasks, deadlines, subscriptions, creditors, goals) | Typed mapping functions |
| 2 | Implement incremental polling loop with `last_edited_time` filter | Polling running, changes detected |
| 3 | Drizzle upsert logic with `source_id`/`source_ref` tracking | Data flowing into SQLite |
| 3 | Error handling, logging, sync_state table updates | Robust sync layer |

### Phase 2b: Dashboard Integration (Week 1, Days 4-5)

| Day | Task | Output |
|-----|------|--------|
| 4 | Wire synced data into existing MC dashboard components | Real Notion data in UI |
| 4 | Add sync status indicator (last sync time, error count) | User visibility into sync health |
| 5 | Add manual "Sync Now" button + automatic background sync | Full sync lifecycle |
| 5 | Integration tests with mock Notion responses | Test coverage |

### Phase 3 (Future): Content Sync

- Fetch page blocks (content) for notes/details display
- Use `notion-to-md` for rendering
- Estimated: additional 2-3 days

### Phase 4 (Future): Two-Way Sync

- Implement write-back for status changes, dates, titles
- Conflict resolution (Notion-wins initially)
- Write-back loop prevention
- Estimated: additional 4-5 days

### Phase 5 (Future): Notion Independence

- MC becomes primary data store
- Notion write-back becomes optional/deprecated
- Export remaining Notion-only data
- Archive Notion integration code

---

## 16. Recommendation

### Primary Recommendation

**Implement a read-only polling mirror using @notionhq/client + Drizzle ORM with 60-second incremental polls and 15-minute full resyncs.**

**Rationale**:
1. **Aligns with VISION.md**: The 5-phase Notion independence plan starts with mirroring. Two-way sync would deepen the dependency.
2. **Low risk**: Read-only sync has zero conflict potential. Notion data flows one-way into SQLite.
3. **Fast build**: 6.5 hours estimated vs 22 hours for two-way. Phase 2 should ship fast.
4. **Sufficient for dashboard**: MC's primary value is aggregating data for display. Users edit in Notion (their habit) and see results in MC.
5. **Data volume is trivial**: ~685 rows across 15 databases. Rate limits are 10x overprovisioned.
6. **Clean migration path**: When MC becomes primary (Phase 4-5), the sync direction simply reverses.

### Technology Stack for Sync Layer

| Component | Choice | Reason |
|-----------|--------|--------|
| **Notion SDK** | `@notionhq/client` v2.x | Official, typed, auto-retry |
| **ORM** | Drizzle ORM (already in MC) | Consistent with existing data layer |
| **Database** | SQLite via better-sqlite3 (already in MC) | Local-first, zero config |
| **Polling scheduler** | `setInterval` + async queue | Simple, no external deps |
| **Property mapping** | Custom typed mappers per DB | Full control, type-safe |
| **Error handling** | Exponential backoff + sync_state table | Observable, recoverable |

### Alternative Approaches (If Primary Fails)

| Alternative | When to Consider | Trade-off |
|-------------|-----------------|-----------|
| **n8n workflow** | If custom sync is too brittle | Adds n8n dependency, less control |
| **Notion Automations webhook** | If Notion ships proper webhooks (unlikely soon) | Would reduce polling, but still need API calls for data |
| **Full export + reimport** | If API access becomes unreliable | Notion's "Export all" is lossy, no incremental |
| **Unofficial API (notion-client)** | If official API is too limited | Unstable, may break, TOS risk |

### What NOT to Do

1. **Do NOT build two-way sync in Phase 2** — Complexity-to-value ratio is 4:1 compared to read-only.
2. **Do NOT use the Search endpoint for sync** — Use per-database queries with `last_edited_time` filters.
3. **Do NOT try to sync page content (blocks) in Phase 2** — Properties are sufficient for the dashboard.
4. **Do NOT cache Notion file URLs** — They expire. Fetch on demand or skip.
5. **Do NOT build a generic "Notion sync framework"** — Build exactly what MC needs: 15 specific database mappings.

---

## Appendix A: MC Database ID Reference

From `notion-sources.md`:

```
# 4 Main Hubs
CraftCode AI Agency:  14374ccd7c698089945ed119d1b1e1c0
Buraks Lab:           2f174ccd7c6980198e7be0c2831e6b25
Finance Agent:        30674ccd7c698132a182e8b672939c62
Genmedia Agency:      14374ccd7c6980438e5be0974d4f239d

# 11 Finance Sub-DBs (under Finance Agent hub)
# IDs to be captured during Phase 2a Day 1 database discovery
```

## Appendix B: Existing MC Schema Alignment

From `data-schema.md`, these tables have `source_id` + `source_ref` columns ready for Notion sync:

- `projects` — maps to CraftCode + Genmedia databases
- `tasks` — maps to task rows within project databases
- `goals` — maps to financial goals sub-DB
- `deadlines` — maps to Fristen sub-DB
- `subscriptions` — maps to Abonnements sub-DB
- `creditors` — maps to Kreditgeber sub-DB
- `financial_snapshots` — maps to Einnahmen/Ausgaben/Rechnungen
- `content_items` — maps to Genmedia content rows
- `notes` — maps to Buraks Lab entries
- `wishlist` — maps to Wunschliste sub-DB
- `data_sources` — lookup table with `UNIQUE(source_id, source_ref)` indexes

The schema is already designed for multi-source ingestion. No schema changes needed for Phase 2.

## Appendix C: Polling Cost Calculator

```
Databases:           15
Poll interval:       60 seconds
Requests per poll:   15 (one query per DB, all fit in single page)
Full resync:         Every 15 minutes = 15 additional requests
                     (fetch all pages, diff with local)

Requests per hour:
  Incremental: (60 min / 1 min) × 15 = 900 requests
  Full resync: (60 min / 15 min) × 15 = 60 requests
  Total: 960 requests/hour

Rate limit capacity:
  3 req/sec × 3600 sec = 10,800 requests/hour

Utilization: 960 / 10,800 = 8.9%
Headroom: 91.1% — more than sufficient
```

---

*Research completed 2026-04-12. Based on Notion API documentation, @notionhq/client SDK source, community implementations, and MC project requirements from VISION.md and data-schema.md.*
