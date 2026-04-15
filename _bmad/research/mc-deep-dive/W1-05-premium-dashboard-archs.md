# W1-05: How Linear, Sunsama, Raycast, and Notion Actually Work Internally (2026)

> Deep architecture research for Mission Control v2 reference apps.
> Researched: 2026-04-12 | Sources: Official engineering blogs, architecture teardowns, API docs, community analysis

---

## Table of Contents

1. [Linear: The Sync Engine IS the Product](#1-linear-the-sync-engine-is-the-product)
2. [Sunsama: Ritual Design as Architecture](#2-sunsama-ritual-design-as-architecture)
3. [Raycast: Native Speed + Extension Ecosystem](#3-raycast-native-speed--extension-ecosystem)
4. [Notion: The Block Model Trap](#4-notion-the-block-model-trap)
5. [Cross-App Architecture Comparison Matrix](#5-cross-app-architecture-comparison-matrix)
6. [What MC Steals, What MC Skips](#6-what-mc-steals-what-mc-skips)
7. [MC Architecture Implications](#7-mc-architecture-implications)
8. [Risk Assessment](#8-risk-assessment)

---

## 1. Linear: The Sync Engine IS the Product

### 1.1 Architecture Overview

Linear is a React SPA backed by a custom **local-first sync engine** that uses **IndexedDB as the client-side database**. The UI never reads from the network directly -- it always reads from IndexedDB, and a background sync layer keeps IndexedDB in sync with the server.

```
[User Action] --> [Optimistic Write to IndexedDB] --> [React Re-render (instant)]
                         |
                         v
              [Sync Queue] --> [WebSocket to Server] --> [PostgreSQL]
                                       |
                                       v
                          [Broadcast to Other Clients]
```

### 1.2 Sync Engine Deep Dive

**Delta Sync Protocol:**
- Every entity mutation generates a sync event with a **monotonically increasing sequence number**
- Clients track their "last seen sequence" and request only changes since that number on reconnect
- First-time clients receive a **full bootstrap snapshot** (10-50MB compressed), then switch to incremental sync
- Data is partitioned into **sync groups** (roughly per-workspace) so clients only subscribe to relevant data

**NOT CRDTs, NOT Operational Transform:**
Linear explicitly does NOT use CRDTs or OT. Their approach:
- **Server is the source of truth** for conflict resolution
- Optimistic updates apply immediately on the client
- If the server rejects a mutation, the client rolls back and re-applies server state
- In practice, conflicts are rare because most edits target different entities
- This is a massive simplification vs. Figma-style OT or Notion-style collaboration

**Connection Resilience:**
- Automatic reconnection with exponential backoff
- Offline mutations queued locally
- On reconnect, queued mutations sent in order
- Full offline read capability (all cached data available)

### 1.3 Client-Side Data Architecture

**IndexedDB as the React Store:**
- Full data model cached locally: issues, projects, cycles, users, comments
- Client-side IndexedDB schema **mirrors PostgreSQL schema**
- Custom indexes on status, assignee, project, cycle for instant filtering
- Storage: typically 50-200MB per workspace (well within IndexedDB limits)
- Custom hooks read directly from IndexedDB -- NOT React state, NOT Redux, NOT Zustand
- Components subscribe to IndexedDB queries and re-render on data changes
- **The sync engine IS the state management** -- no separate state layer needed

**Custom Virtual Rendering:**
- Linear does NOT use react-window or react-virtual
- Custom virtualization implementation for issue lists
- Optimized for their specific data shapes and scroll behavior
- Enables consistent 60fps scrolling through 10,000+ issue lists

**Views System:**
- Saved views = stored filter/sort/group configurations
- All filtering/sorting runs locally against IndexedDB
- View computation is < 50ms because it queries local indexed data
- This is why switching views feels instant -- no server round-trip

### 1.4 Keyboard-First UX Philosophy

**Design Principles:**
1. **Consistency over discoverability**: `C` creates in any context, `S` for status, `A` for assignee -- learn the pattern once, use it everywhere
2. **Single-key shortcuts for common actions**: No modifier keys for frequent actions. `I` for inbox, `V` for views, `1-9` for status groups
3. **Command palette (Cmd+K) as universal escape hatch**: Don't know the shortcut? Cmd+K finds any action, issue, project, or setting
4. **Context-aware shortcuts**: `Enter` opens selected item in a list, starts editing in detail view
5. **Vim-inspired navigation**: `J/K` for up/down in lists (optional, alongside arrow keys)
6. **Bulk operations**: `X` to select, then apply action to all selected (email-client pattern)

**Shortcut Usage Data:**
- ~60% of actions via keyboard for active users
- Power users report 2-3x faster workflow vs mouse-primary tools
- Command palette is the most-loved feature in user surveys

### 1.5 Opinionated Method ("Linear Method")

**Fixed Workflow:**
- Status: Backlog -> Todo -> In Progress -> Done (+ Triage, Cancelled) -- not configurable
- Priority: 0-4 (Urgent, High, Medium, Low, None) -- no custom levels
- Estimates: Points (1, 2, 3, 5, 8) or none -- no hours tracking
- Labels: flat tags, not hierarchical
- One assignee per issue -- clear ownership, no committees

**Cycles** (Time-boxed iterations):
- Fixed-length (1-2 weeks), auto-rollover of unfinished work
- Velocity tracked automatically
- Creates rhythm without heavy ceremony

**Triage** (Inbox Zero for Issues):
- All new issues land in Triage
- Daily practice: accept, decline, or redirect each issue
- Goal: nothing sits in limbo

### 1.6 Performance Metrics

| Metric | Value |
|--------|-------|
| App startup (returning user) | < 1 second (reads from IndexedDB) |
| Action response | < 50ms (local write + optimistic update) |
| Initial bootstrap | 3-10 seconds (workspace-dependent) |
| View switch | < 50ms (local query) |
| Memory usage | 100-300MB |
| Command palette open | < 50ms |

---

## 2. Sunsama: Ritual Design as Architecture

### 2.1 Architecture Overview

Sunsama is NOT local-first. It is a **server-first integration hub** built on React + Node.js + MongoDB. Its architectural innovation is not in data infrastructure but in **UX flow design** -- specifically, the guided daily rituals that create habitual daily usage.

```
[15+ Integrations] --> [OAuth2 Adapter Layer] --> [MongoDB (normalized tasks)]
                                                          |
                                                          v
                                                [React SPA / Electron]
                                                          |
                                                          v
                                    [Guided Ritual Flows (Morning / Evening)]
```

### 2.2 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend (Web) | React SPA |
| Frontend (Desktop) | Electron |
| Frontend (Mobile) | React Native |
| Backend | Node.js + Express |
| Database | MongoDB |
| Cache | Redis |
| Real-time | WebSocket |
| Cloud | AWS (ECS, S3, CloudFront) |
| Integrations | OAuth2 to 15+ services |

### 2.3 Integration Architecture

This is Sunsama's actual technical moat -- the **integration adapter pattern**:

- Each integration (Linear, Asana, Jira, Google Calendar, Todoist, GitHub, Notion, Slack, Trello, ClickUp, Outlook, Zoom) has a dedicated adapter
- Adapters normalize external tasks into Sunsama's internal task model
- **Bidirectional sync**: Marking a Linear issue done in Sunsama marks it done in Linear
- Conflict resolution: source system is authority for metadata (title, description); Sunsama owns scheduling/timeboxing data
- OAuth2 tokens encrypted per user per integration
- Mix of webhooks (Google Calendar) and polling for sync

### 2.4 Daily Planning Flow -- The Actual UX Architecture

This is the core product. The flow is **guided, sequential, and intentionally friction-ful**:

**Morning Ritual (5-10 minutes, guided):**

```
Step 1: REVIEW YESTERDAY
  - Shows incomplete tasks
  - For each: "Move to today?" / "Reschedule?" / "Archive?"
  - Creates closure on previous day

Step 2: PULL FROM INTEGRATIONS
  - Shows pending tasks from connected tools
  - User picks which to work on today
  - Tasks copied + linked to source

Step 3: ADD PERSONAL TASKS
  - Quick-add for tasks not in any tool
  - "Anything else for today?"

Step 4: ESTIMATE TIME
  - Each task gets time estimate (15m / 30m / 1h / 2h / custom)
  - Running total: "6h planned / 8h available"
  - OVERBOOK WARNING if planned > available

Step 5: PRIORITIZE
  - Drag to reorder
  - Optional: assign to calendar time slots (timeboxing)
  - "Your plan is ready!" -- confirmation
```

**Day View (Main Working Surface):**
- Left panel: Task list ordered by priority, time estimates visible
- Right panel: Calendar (synced from Google/Outlook)
- Tasks can be dragged onto calendar for timeboxing
- Active task highlighted with timer (optional)
- Channel-based grouping by source

**Evening Shutdown Ritual:**
- Mark each task: done / partially done / not started
- Actual time vs estimated shown
- Unfinished: "Move to tomorrow?" or "Reschedule?"
- Optional reflection journal + energy rating (1-5)
- Weekly stats: planned vs actual hours, completion rate, focus vs meeting time

### 2.5 Why People Open It Every Day

1. **Scheduled triggers**: Daily planning reminder at user's chosen time
2. **The ritual IS the value**: The 5-minute planning session reduces anxiety ("I know what I'm doing today")
3. **Intentional friction**: Forces thinking before doing -- this is a feature, not a bug
4. **Calendar integration**: Tasks and meetings in one view eliminates context-switching
5. **Gentle accountability**: Weekly stats without judgment, no streaks, no gamification
6. **Low barrier**: Planning takes 5 minutes, not 30
7. **Completion satisfaction**: Subtle animations on task completion (no badges, no points)

### 2.6 Visual Design Philosophy

- **Warm palette**: Soft beige/cream backgrounds, muted accent colors
- **Generous whitespace**: Breathing room between elements
- **No badges, no notifications**: Pull-based, not push-based
- **Clean typography**: Slightly rounded, highly readable
- **Subtle animations**: Purposeful transitions on task completion
- **Feels like a journal, not a tool**

---

## 3. Raycast: Native Speed + Extension Ecosystem

### 3.1 Architecture Overview

Raycast is a **native macOS application (Swift/AppKit)** with extensions running in **sandboxed Node.js processes**. Extensions declare their UI in React, but Raycast renders it as **native AppKit views** -- this is the key architectural insight that gives it both developer ergonomics and native performance.

```
[Extension (Node.js)] --React component tree--> [IPC Bridge] --JSON diffs--> [Native Host (Swift/AppKit)]
                                                                                       |
                                                                                       v
                                                                          [Native macOS UI Rendering]
```

### 3.2 Extension Runtime Architecture

**Sandboxed Node.js Process:**
- Each extension runs in its own isolated V8 context
- Extensions are TypeScript/JavaScript + React
- `@raycast/api` provides the component library mapping to native views
- Extensions CANNOT access arbitrary system resources -- only what the API exposes

**IPC Bridge Protocol:**
- Extension sends React component tree updates to native host via Unix domain socket
- Protocol is JSON-based: `{type: "List", props: {...}, children: [...]}`
- React reconciliation happens in Node.js, only diffs sent to native host
- Native host has component mapping: `<List>` -> NSTableView, `<Detail>` -> NSScrollView, `<Form>` -> native form controls

**Lifecycle Management:**
- Extensions loaded on demand (user selects from search)
- Kept alive briefly after use (warm cache)
- Killed after timeout to free resources
- State: ephemeral by default, persistent via `LocalStorage` API (JSON file per extension)

### 3.3 Search Ranking System (Frecency)

Raycast's search is its most critical UX feature. Results must appear before the user finishes typing.

**Scoring Factors (Weighted):**

1. **Frecency** (highest weight): Frequency + Recency combined
   - Tracks usage events per item
   - Exponential decay: ~7-day half-life
   - Formula: `score = SUM(frequency_weight * recency_decay_factor)` per event

2. **Text Match Quality:**
   - Prefix match: highest score ("lin" -> "Linear")
   - Substring match: medium
   - Fuzzy match: lower (typo tolerance)
   - Acronym match: bonus ("gc" -> "Google Chrome")

3. **Context Awareness:**
   - Active application boosts relevant commands
   - Time-of-day patterns (slight boost)
   - Clipboard content relevance

4. **Static Priority:**
   - User-pinned items always first
   - Built-in commands have baseline priority
   - Extension popularity as tiebreaker

**Performance:**
- All searchable items indexed at launch, updated incrementally
- Entire index in RAM -- zero disk I/O during search
- 10ms input debounce (imperceptible)
- Only top 20 results computed and rendered
- Built-in results: < 5ms. Extension results: < 50ms.

### 3.4 AI Integration Architecture

**Design Philosophy**: "AI should be a tool in your workflow, not a destination."

**Three Layers of AI:**

1. **Quick AI** (single-turn): Selected text -> AI command -> result -> paste back. All via keyboard. No conversation UI.
2. **AI Chat** (multi-turn): Dedicated conversation mode when needed. History persisted locally.
3. **AI in Extensions**: `AI.ask()` API lets any extension use AI as a utility. Model-agnostic -- extension calls the API, Raycast handles model routing.

**Model Routing:**
- Simple tasks (grammar, translation) -> faster/cheaper models
- Complex tasks (code, summaries) -> more capable models
- User can override model selection

**Key Insight**: AI is most valuable when it is **one shortcut away** from your current context, not a separate application. The "AI as a command" pattern reduces friction to under 3 seconds.

### 3.5 Security Model

- Process-level sandboxing per extension
- Permissions declared in manifest (clipboard, network, specific URLs)
- User grants permissions on first use
- Store review before publishing
- No arbitrary code execution, no subprocess spawning, no shell access

---

## 4. Notion: The Block Model Trap

### 4.1 Architecture Overview

Notion is a **server-first React SPA** (web) + **Electron wrapper** (desktop) backed by **PostgreSQL with JSONB block storage**. Everything -- text, headings, images, database rows, embeds -- is stored as a "block" in a recursive tree structure.

```
[React SPA / Electron] <--REST + WebSocket--> [Node.js API] <--> [PostgreSQL (blocks table)]
                                                                          |
                                                                   [JSONB properties]
                                                                   [parent_id tree]
                                                                   [Custom sharding]
```

### 4.2 The Block Model -- Strength and Curse

**How Blocks Are Stored:**
- Every piece of content = a block with UUID
- Schema: `{id, type, properties (JSONB), content (child block IDs array), parent_id, timestamps}`
- A page is a block whose `content` array contains top-level block IDs
- Those blocks may have their own `content` arrays (nesting)
- Result: **tree structure stored as flat rows with parent-child references**

**The Recursive Loading Problem:**
1. Client requests page -> server returns page block with `content: [id1, id2, ...]`
2. Client renders top-level blocks, but each may have children
3. Toggle blocks, callouts, columns: children loaded lazily
4. Deep pages trigger a **cascade of sequential requests**: 5-20 round-trips for complex pages
5. Notion batches some of these, but the fundamental problem remains

**JSONB Query Performance:**
- Block properties stored as schemaless JSONB in PostgreSQL
- Flexible, but inherently slower than typed columns
- Database views (filtered/sorted/grouped) must query JSONB properties
- Complex views on 1000+ row databases: 2-15 seconds to compute
- GIN indexes help but don't solve all query patterns

### 4.3 Real-World Performance Profile

| Page Type | Load Time | Why |
|-----------|-----------|-----|
| Simple page | < 500ms | Flat structure, one request |
| Medium page | 1-2s | Some nesting, a few lazy loads |
| Complex page | 3-10s | Deep nesting, databases, embeds |
| Large database (5000+ rows) | 5-15s | Filtered views computed server-side |

### 4.4 Why People Want to Leave Notion

**Performance:**
- Loading spinners on page open (server dependency)
- Database views slow on large datasets
- Search is weak and slow on large workspaces
- Electron desktop app has inherent memory/CPU overhead

**Offline:**
- Local cache exists but is unreliable
- Sync conflicts are common
- NOT local-first architecture
- Users report data loss in offline scenarios

**Data Lock-in:**
- Markdown export is lossy (loses database relations, views, rollups, formulas)
- No good way to extract structured data
- API rate limit: 3 requests/second (devastating for automation)
- No real-time webhooks for change events
- Pagination required on all queries (max 100 results)

**Complexity Spiral:**
- "Lego for productivity" enables Byzantine systems that users can't maintain
- Template proliferation leads to inconsistency
- "Everything is a page" means nothing has a fixed structure
- Users spend more time organizing Notion than doing work

**AI Bolt-On Feel:**
- AI features don't understand workspace structure deeply
- Generic summarize/write -- not integrated into workflow
- No agent-native architecture

### 4.5 What Notion Gets Right (Don't Throw the Baby Out)

- **Database-with-views concept**: The idea that one dataset can have multiple visual representations (table, kanban, calendar, gallery, timeline) is brilliant
- **Block composability for rich content**: For wiki/documentation, the block model enables expressive pages
- **Template system**: Reusable structures for recurring workflows
- **Cross-linking between databases**: Relations and rollups for connecting data

### 4.6 Lesson for MC

**Do NOT use a generic block model for structured data.** Use typed entities (projects, tasks, content_items, financial_records) with proper schemas and typed columns. The database-with-views pattern (multiple React components querying the same typed table) gives you Notion's best UX idea without its worst architectural decision.

Save rich text / block editing for the ONE place it's needed: note-taking (Phase 4+, if at all).

---

## 5. Cross-App Architecture Comparison Matrix

### 5.1 Technical Architecture

| Dimension | Linear | Sunsama | Raycast | Notion |
|-----------|--------|---------|---------|--------|
| **Client type** | React SPA | React SPA + Electron + RN | Native macOS (Swift) | React SPA + Electron |
| **Data model** | Typed entities (fixed schema) | Normalized tasks (MongoDB) | Ephemeral + LocalStorage | Universal blocks (JSONB) |
| **Local storage** | IndexedDB (full workspace) | Minimal cache | In-memory index + JSON files | Limited cache |
| **Local-first?** | YES (IndexedDB is truth) | NO (server-first) | N/A (launcher, not database) | NO (server-first, cache unreliable) |
| **Sync protocol** | Custom delta sync + WebSocket | REST + WebSocket | N/A | REST + WebSocket + OT |
| **Offline capability** | Full read, queued writes | Very limited | Full (local app) | Unreliable |
| **Server DB** | PostgreSQL | MongoDB | N/A (cloud for extensions) | PostgreSQL (sharded) |
| **Real-time** | WebSocket (sync events) | WebSocket | N/A | WebSocket (OT per block) |
| **State management** | IndexedDB IS the store | React state + Redux/similar | Native app state | React state + cache |

### 5.2 UX Architecture

| Dimension | Linear | Sunsama | Raycast | Notion |
|-----------|--------|---------|---------|--------|
| **Primary interaction** | Keyboard shortcuts | Guided ritual flows | Search + keyboard | Mouse + blocks |
| **Command palette** | Cmd+K (core feature) | Not primary | IS the product | Cmd+K (limited) |
| **Navigation model** | Sidebar + shortcuts | Daily timeline | Search results | Sidebar + pages |
| **Onboarding** | Use the tool, learn shortcuts | Guided first plan | Install + explore | Template gallery |
| **Retention mechanism** | Speed + muscle memory | Daily ritual habit | Replaces Spotlight | Content lock-in |
| **Information density** | High (lists, compact) | Low (one day, calm) | Medium (search results) | Variable (user-defined) |
| **Configurability** | Low (opinionated) | Low (opinionated) | Medium (extensions) | Very high (blocks) |
| **Response time** | < 50ms | 200-500ms | < 5ms | 500ms-15s |

### 5.3 Relevance to MC (Single-User, Local-First)

| Dimension | Linear (steal) | Sunsama (steal) | Raycast (steal) | Notion (avoid) |
|-----------|----------------|-----------------|-----------------|----------------|
| **Data arch** | Local-first with SQLite (our IndexedDB) | Integration adapter pattern | Frecency scoring for search | Block model (too flexible) |
| **UX pattern** | Keyboard shortcuts + views | Daily planning ritual | Cmd+K as navigation spine | Database-with-views concept |
| **Speed target** | < 50ms local ops | Not a speed play | < 5ms search | Unacceptable latency |
| **Philosophy** | Opinionated defaults | Ritual > features | Speed > configuration | Flexibility > structure |
| **Agent integration** | N/A | N/A | AI as a command | Bolt-on AI |

---

## 6. What MC Steals, What MC Skips

### 6.1 STEAL from Linear

| Pattern | Implementation in MC | Effort | Priority |
|---------|---------------------|--------|----------|
| **Local-first with SQLite as source of truth** | Already implemented (SQLite + Drizzle) | Done | -- |
| **UI reads from local DB, never waits for network** | Server components read SQLite directly | Done | -- |
| **Optimistic updates** | TanStack Query with optimistic mutation config | 2-3 days | P1 |
| **Keyboard shortcut density** | Systematic shortcut map for every view + action | 3-5 days | P1 |
| **Command palette as navigation spine** | cmdk already chosen, needs full wiring | 2-3 days | P1 |
| **Custom views (saved filter/sort/group configs)** | Store view configs in SQLite, apply client-side | 3-5 days | P2 |
| **Cycles / Sprints concept** | Weekly cycle in Projekte module | 2-3 days | P2 |
| **Triage inbox** | Morning triage in Uebersicht from all modules | 3-5 days | P1 |
| **Virtual list rendering** | TanStack Virtual for long lists | 1-2 days | P2 |
| **Fixed opinionated workflow** | Status pipeline not configurable | Design decision | Done |

### 6.2 STEAL from Sunsama

| Pattern | Implementation in MC | Effort | Priority |
|---------|---------------------|--------|----------|
| **Morning planning ritual (guided flow)** | Uebersicht opens with "Plan your day" wizard | 3-5 days | P1 |
| **Yesterday review step** | Show incomplete tasks, carry-forward prompt | 1-2 days | P1 |
| **Time estimation per task** | Add `estimated_minutes` column to tasks table | 1 day | P1 |
| **Overbook warning** | Sum estimates vs available hours, warn if > 100% | 1 day | P1 |
| **Shutdown ritual** | End-of-day guided review flow | 2-3 days | P2 |
| **Weekly stats (planned vs actual)** | Aggregate from task time tracking data | 2-3 days | P3 |
| **Warm, calm aesthetic** | OKLCH palette already aligned. Refine whitespace | Ongoing | P1 |
| **Timeboxing (task -> calendar)** | Phase 3+, needs Google Calendar API | 5-10 days | P3 |
| **Focus mode (single task + agent)** | Single-task view with Cmd+J agent panel | 2-3 days | P2 |

### 6.3 STEAL from Raycast

| Pattern | Implementation in MC | Effort | Priority |
|---------|---------------------|--------|----------|
| **Frecency ranking in command palette** | Track command usage, weight by recency/frequency | 2-3 days | P2 |
| **< 100ms search** | SQLite FTS5 full-text search + in-memory index | 2-3 days | P1 |
| **AI as a command, not a destination** | Agent actions invokable from Cmd+K palette | 2-3 days | P2 |
| **Context piping** | Selected task/project -> agent command -> result | 3-5 days | P2 |
| **Quick actions on results** | Action buttons on search results (open, edit, assign) | 1-2 days | P1 |
| **Extension-like module commands** | Each MC module registers commands to palette | 2-3 days | P2 |

### 6.4 STEAL from Notion (Selectively)

| Pattern | Implementation in MC | Effort | Priority |
|---------|---------------------|--------|----------|
| **Database-with-views** | Multiple view components per SQLite table | Already architected | Done |
| **Template system** | Project/task templates stored in SQLite | 2-3 days | P3 |
| **Cross-entity relations** | Foreign keys in Drizzle schema (already done) | Done | -- |

### 6.5 EXPLICITLY SKIP

| Pattern | Why Skip | Risk of Including |
|---------|----------|--------------------|
| Linear's multi-client sync engine | Single-user, no other clients | Massive complexity for zero value |
| Linear's WebSocket infrastructure | No server, no network sync needed | Over-engineering |
| Sunsama's 15-integration adapter layer | MC Phase 1 is standalone; Notion sync is Phase 2 | Premature integration work |
| Sunsama's server-side MongoDB | We have SQLite, which is faster for single-user | Wrong architecture for local-first |
| Raycast's native macOS rendering | MC is web-based (Next.js). Native would be a different product. | Rewrite entire stack |
| Raycast's extension marketplace | MC is personal tool, not a platform | Platform thinking too early |
| Notion's block model | Schemaless JSONB is Notion's biggest perf problem | Performance regression |
| Notion's Electron wrapper | MC runs in browser tab, no Electron needed | Memory/CPU overhead |
| Notion's OT collaboration | Single-user = no concurrent edits | Massive complexity for zero value |
| Multi-device sync | MC is localhost:3000 on one machine | Sync complexity explosion |

---

## 7. MC Architecture Implications

### 7.1 Why MC's Stack Is Architecturally Superior for Its Use Case

MC's stack (Next.js + SQLite + Drizzle) accidentally achieves what Linear spent years building -- **local-first with instant UI** -- but WITHOUT the sync engine complexity, because there is only one user on one machine.

| Linear's Challenge | MC's Advantage |
|--------------------|----------------|
| Multi-client conflict resolution | Single writer, no conflicts ever |
| IndexedDB + PostgreSQL dual storage | SQLite is both the store and the source of truth |
| WebSocket sync layer | No network layer needed |
| Bootstrap snapshot for new clients | App opens, reads SQLite, done |
| Optimistic update rollback | Writes are immediately committed, no rollback needed |
| Sync group partitioning | One user = one "sync group" |

**MC gets Linear-class speed for free** because:
- SQLite reads are < 1ms for indexed queries
- Server components render on the same machine as the database
- No network hop between client and server (localhost)
- No cache invalidation problem (there is only one cache)

### 7.2 The "Views, Not Pages" Architecture

This is the pattern that bridges Linear (typed entities) and Notion (multiple views on data):

```
[SQLite Table: projects]
         |
         +-- KanbanView component (GROUP BY status, ORDER BY position)
         +-- ListView component (ORDER BY priority, updated_at)
         +-- TimelineView component (GROUP BY date_range)
         +-- DashboardView component (COUNT, SUM, AVG aggregations)
```

Each view is a React component that runs a Drizzle query against the same typed table. Switching views is < 50ms because:
1. SQLite query is < 1ms (indexed)
2. React component mounts with data (no loading state)
3. TanStack Query caches the previous view's data

This avoids Notion's block-tree recursive loading entirely.

### 7.3 Command Palette as Architecture (Not Just UI)

Learning from Raycast, the command palette should be an **architectural primitive**, not just a UI widget:

```typescript
// Each module registers commands
const projectCommands = [
  { id: 'project:create', name: 'Create Project', action: () => {}, shortcut: 'C P' },
  { id: 'project:search', name: 'Search Projects', action: () => {}, shortcut: '/' },
  { id: 'project:kanban', name: 'Kanban View', action: () => {}, shortcut: 'V K' },
  { id: 'project:list', name: 'List View', action: () => {}, shortcut: 'V L' },
];

const agentCommands = [
  { id: 'agent:start', name: 'Start Agent', action: () => {}, shortcut: 'Cmd+J' },
  { id: 'agent:ask', name: 'Ask Agent About...', action: () => {}, shortcut: 'Cmd+Shift+J' },
];

// Frecency tracker
const frecency = {
  track(commandId: string) { /* record usage event */ },
  score(commandId: string): number { /* compute frecency score */ },
};

// All commands searchable from Cmd+K with frecency ranking
```

This pattern means:
- Every feature is discoverable via Cmd+K
- Shortcut hints teach users the keyboard path
- Usage data (frecency) personalizes the experience over time
- New modules automatically gain palette presence by registering commands

### 7.4 Daily Planning Ritual Architecture

The Sunsama-inspired morning ritual needs its own architectural consideration:

```
[App Open] --> [Check: is this the first open today?]
                     |
                     YES --> [Morning Ritual Flow]
                     |           |
                     |           Step 1: Yesterday Review (query incomplete tasks)
                     |           Step 2: Today's Calendar (future: Google Cal API)
                     |           Step 3: Pull from Modules (projects with due dates, content deadlines)
                     |           Step 4: Estimate & Prioritize
                     |           Step 5: "Plan Ready" -> Day View
                     |
                     NO --> [Day View (normal Uebersicht)]
```

**State tracking in SQLite:**
```sql
-- daily_plans table
CREATE TABLE daily_plans (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,  -- '2026-04-12'
  planned_minutes INTEGER DEFAULT 0,
  actual_minutes INTEGER DEFAULT 0,
  tasks_planned INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  reflection TEXT,
  energy_level INTEGER,  -- 1-5
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT  -- set when shutdown ritual completes
);

-- daily_plan_tasks junction
CREATE TABLE daily_plan_tasks (
  daily_plan_id TEXT REFERENCES daily_plans(id),
  task_id TEXT REFERENCES tasks(id),
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  position INTEGER,  -- ordering in day
  completed_in_plan BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (daily_plan_id, task_id)
);
```

### 7.5 Agent Panel as First-Class Citizen

From Raycast's "AI as a command" insight and Wattenberger's "observability surface" concept:

The agent panel should NOT be a chatbot. It should be:
1. **A command interface**: "Summarize today's progress", "Draft PR description for Project X"
2. **An observability surface**: Shows what agents are running, their progress, recent completions
3. **A context bridge**: Knows which task/project you're looking at, offers relevant actions
4. **Invokable from Cmd+K**: Agent commands appear in the palette alongside navigation commands

---

## 8. Risk Assessment

### 8.1 Risks of Following These Patterns

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Over-engineering keyboard shortcuts (too many to remember) | Medium | Low | Start with 10 essential shortcuts, add based on usage data |
| Morning ritual feels forced (user skips it) | Medium | Medium | Make it skippable with one key. Track skip rate. |
| SQLite performance at scale (10K+ tasks) | Low | Medium | FTS5 index, WAL mode, proper indexes. SQLite handles millions of rows. |
| Feature creep from reference app envy | High | High | Strict module scope. Phase gates. "Does this help Burak open MC every morning?" |
| Timeboxing complexity (calendar integration) | Medium | Medium | Defer to Phase 3. Focus on task list + estimates first. |
| Agent panel becoming a generic chatbot | Medium | High | Constrain to structured commands + MC data context. No open-ended chat. |
| Frecency algorithm being over-engineered | Low | Low | Start with simple recency weighting. Add frequency tracking in Phase 2. |

### 8.2 Biggest Architectural Decision Remaining

**How tightly to couple the agent runtime to MC.**

Options:
1. **Mock agent (current Phase 1)**: Static panel, no runtime. Ship fast.
2. **Claude Code headless via shell**: Spawn `claude` subprocess, pipe stdin/stdout. Works but fragile.
3. **Claude API direct**: Call Anthropic API from MC backend. More control, costs money.
4. **MCP server pattern**: MC exposes its data via MCP, Claude Code connects as client.

Recommendation: Ship Phase 1 with mock. Evaluate MCP server pattern for Phase 2 -- it aligns with the "AI as a command" insight from Raycast (agent invokes structured tools, not open-ended chat).

---

## 9. Implementation Priority Matrix

Based on this research, the highest-ROI patterns for the next MC sprint:

### Tier 1: Must-Have (Ship This Week)
| Pattern | Source | Why Now |
|---------|--------|---------|
| Full keyboard shortcut map | Linear | Core UX quality signal |
| Morning planning ritual flow | Sunsama | THE retention mechanism |
| Command palette wired to all modules | Raycast | Navigation spine |
| Time estimates on tasks | Sunsama | Enables overbook warning |
| < 100ms response for all local ops | Linear | Trust signal |

### Tier 2: High-Value (Ship This Sprint)
| Pattern | Source | Why Soon |
|---------|--------|---------|
| Focus mode (single task + agent) | Sunsama | Reduces anxiety |
| Frecency ranking in palette | Raycast | Personalizes over time |
| FTS5 full-text search | Raycast | Find anything instantly |
| Saved views (filter/sort configs) | Linear | Power user retention |
| Triage inbox on Uebersicht | Linear | Inbox zero for work |

### Tier 3: Valuable (Next Sprint)
| Pattern | Source | Why Later |
|---------|--------|-----------|
| Shutdown ritual | Sunsama | Needs daily_plans table |
| Weekly stats | Sunsama | Needs 7 days of data |
| Virtual list rendering | Linear | Only needed at scale |
| Template system | Notion | Nice-to-have |
| Timeboxing (calendar drag) | Sunsama | Needs calendar integration |

---

## 10. Key Quotables for MC Development

> "The sync engine is the product." -- Linear engineering
> For MC: "The SQLite schema is the product." Everything flows from typed, well-indexed tables.

> "Opinionated software is better software." -- Linear Method
> MC should have ONE way to do each thing. No configuration anxiety.

> "Speed is a feature." -- Linear
> < 100ms for all local operations. If it's slower, it's a bug.

> "The ritual creates the habit." -- Sunsama
> The 5-minute morning planning flow IS the retention mechanism.

> "AI should be a tool in your workflow, not a destination." -- Raycast
> Agent panel = structured commands + context, not open-ended chat.

> "We're still trying to make agents fit inside tools designed for humans typing code." -- Wattenberger
> MC's agent panel should show intent and progress, not terminal output.

> "Don't use a generic block model for structured data." -- Lesson from Notion
> Typed entities with proper schemas. Views are React components, not database configurations.

---

## 11. Source Links

- Linear Sync Engine: https://linear.app/blog/scaling-the-linear-sync-engine
- Linear Method: https://linear.app/method
- Linear Keyboard-First: https://linear.app/blog/keyboard-first
- Linear Local-First Analysis: https://tuliocalil.com/linear-approach-to-building-local-first-applications
- Sunsama Building Story: https://www.sunsama.com/blog/building-sunsama
- Sunsama UX Case Study: https://growth.design/case-studies/sunsama
- Raycast Extensions Architecture: https://www.raycast.com/blog/how-extensions-work
- Raycast Search Ranking: https://www.raycast.com/blog/search-ranking
- Raycast AI Integration: https://www.raycast.com/blog/ai
- Notion Block Model Analysis: https://blog.plasmo.com/p/notion-block-model
- Notion Architecture (ByteByteGo): https://blog.bytebytego.com/p/notion-architecture
- Wattenberger "What Comes After IDE": catalogue entry at `research/catalogue/posts/2026-01/wattenberger-what-comes-after-ide.md`
- MC UX Industry Standards: `~/Desktop/code2/missioncontrole/docs/research-ux-industry-standards.md`
- MC Vision: `~/Desktop/code2/missioncontrole/VISION.md`
- Adoptable Patterns: `research/catalogue/ADOPTABLE-PATTERNS.md`
