# W1-04: Agent Memory Architectures for Personal Context (2026)

> Deep Research — Mission Control Agent Memory Layer
> Date: 2026-04-12
> Status: COMPLETE — ready for architecture decisions

---

## Executive Summary

This report synthesizes 9 high-signal sources from the research catalogue to answer one question: **How should Mission Control's AI agents store and retrieve personal context across sessions?**

The answer, backed by converging evidence from Karpathy, Garry Tan, Matt Shumer, UC Berkeley (MemFactory), and the AIE Europe 2026 conference, is a **3-layer architecture** that separates structured business data (SQLite/Drizzle), agent knowledge (LLM Wiki files + FTS5), and session context (CLAUDE.md/MEMORY.md). No vector database is needed at MC's scale. The minimum viable implementation requires adding one SQLite table (`agent_memories`) to the existing schema and a `wiki/` directory of flat Markdown files with YAML frontmatter.

Estimated implementation effort: **2-3 days for v1, 1 week for v2 with compression and forgetting.**

---

## Table of Contents

1. [Sources Analyzed](#1-sources-analyzed)
2. [The 5 Key Questions — Answered](#2-the-5-key-questions--answered)
3. [Technology Comparison Matrix](#3-technology-comparison-matrix)
4. [Recommended Architecture for MC](#4-recommended-architecture-for-mc)
5. [Schema Design](#5-schema-design)
6. [Memory Operations: The MemFactory 6](#6-memory-operations-the-memfactory-6)
7. [Finance Agent: Cross-Session Context Pattern](#7-finance-agent-cross-session-context-pattern)
8. [Staleness Prevention Strategy](#8-staleness-prevention-strategy)
9. [Risk Assessment](#9-risk-assessment)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Alternative Approaches & Fallbacks](#11-alternative-approaches--fallbacks)
12. [Decision Record](#12-decision-record)

---

## 1. Sources Analyzed

| # | Source | Author | Pattern | Score | Key Contribution |
|---|--------|--------|---------|-------|-------------------|
| 1 | gbrain | Garry Tan (YC) | PGLite + pgvector personal RAG | 9/10 | Embedded Postgres with vector search, incremental indexing |
| 2 | Hermes-Wiki | cclank | Flat Markdown + FTS5 + MCP | 8/10 | Agent-native wiki, no vectors needed for decision recall |
| 3 | Karpathy LLM Wiki | Andrej Karpathy | File-based, token-dense pages | 9/10 | Foundational pattern: flat namespace, YAML frontmatter, 2K token pages |
| 4 | OpenClaw/Hermes | Matt Shumer | 4-layer memory stack | 7/10 | Working/procedural/semantic/episodic layers, 2.3M sessions in production |
| 5 | MemFactory | UC Berkeley | 6 memory operation primitives | 7/10 | STORE/RETRIEVE/UPDATE/FORGET/COMPRESS/REFLECT taxonomy |
| 6 | Strategic Forgetting | Brian Roemmele | Cognitive-science forgetting policies | 6/10 | Decay, interference, intentional forgetting; nightly consolidation |
| 7 | Obsidian for Agents | Omar Sarmiento | Vault structure patterns | 7/10 | Flat+tagged beats Zettelkasten; agent_writable flag |
| 8 | Icarus Memory Protocol | Icarus Project | Self-training confidence adjustment | 6/10 | Post-task memory evaluation, confidence boost/penalize |
| 9 | Claude .claude/ Anatomy | Akshay Pachaar | Built-in CLAUDE.md/MEMORY.md system | 7/10 | Documents Claude Code's Layer 1+2 memory; identifies gaps |
| 10 | AIE Europe 2026 Synthesis | Conference | Memory as competitive moat | 8/10 | "The model is a commodity; the memory is proprietary" |
| 11 | Harness Convergence Wave | Internal synthesis | Thin harness, fat skills | 10/10 | Validates file-based LLM Wiki as agent memory foundation |

---

## 2. The 5 Key Questions -- Answered

### Q1: Should MC's SQLite be the agent's memory store?

**Answer: PARTIALLY. Structured business data stays in SQLite. Agent knowledge gets its own layer.**

The evidence is clear from every source analyzed:

- **OpenClaw/Hermes** explicitly separates structured data from agent memory: "No single source of truth. Different layers serve different retrieval patterns."
- **Karpathy** recommends: "The agent wiki should be separate from the app's structured data."
- **MemFactory** schema puts memories in a dedicated table with `memory_type`, `confidence`, `decay_rate` -- fields that make no sense on a `projects` or `tasks` table.

**Recommendation**: MC's existing SQLite database (Drizzle) houses business data (projects, tasks, finances, content). Add ONE new table -- `agent_memories` -- to the same SQLite database for structured memory entries (episodic logs, semantic facts). Agent procedural knowledge (how-tos, decision records) lives in a `wiki/` directory as flat Markdown files.

Why same DB, not separate? MC is single-user, single-device, single-process. A second database adds complexity for zero benefit at this scale. The `agent_memories` table is logically separated by schema design, not by database boundary.

### Q2: Should there be a separate vector DB for semantic search?

**Answer: NO. Not at MC's scale. FTS5 is sufficient.**

Karpathy's rule of thumb is precise and well-calibrated:

| Scale | Search Strategy | Technology |
|-------|----------------|------------|
| <500 pages | File-based lookup + naming conventions | `grep` / `find` |
| 500-5000 pages | Keyword search | SQLite FTS5 |
| >5000 pages | Semantic search | pgvector / sqlite-vec |

MC will have fewer than 500 agent memory pages for the first 6-12 months. Even at full capacity with daily Finance Agent runs, weekly Content Agent runs, and ad-hoc task memories, MC will reach approximately:

- 365 episodic entries/year (1 per day from Finance Agent)
- 52 content planning entries/year
- ~100 project decision entries/year
- ~200 ad-hoc memories/year
- **Total: ~700 entries/year**

After compression (MemFactory's COMPRESS operation), this reduces to ~200-300 active entries. FTS5 handles this in <12ms (OpenClaw's production benchmark).

**When to reconsider**: If MC's agent memory exceeds 5000 active entries OR if cross-lingual retrieval becomes necessary (searching German memories with English queries). At that point, evaluate sqlite-vec (stays in SQLite ecosystem) or PGLite (Garry Tan's approach -- migration path to hosted Postgres).

### Q3: How do agents like Finance-Agent maintain context across daily runs?

**Answer: Episodic logging + periodic compression into semantic summaries.**

The OpenClaw/Hermes 4-layer model provides the exact pattern:

```
Daily Run (Finance Agent):
  1. Load WORKING MEMORY: CLAUDE.md + relevant MEMORY.md entries
  2. Load PROCEDURAL MEMORY: wiki/howto-process-invoices.md
  3. Query SEMANTIC MEMORY: agent_memories WHERE type='semantic' AND tags LIKE '%finance%'
  4. Execute task: process invoices, check deadlines, update snapshots
  5. Write EPISODIC ENTRY: "2026-04-12: Processed 8 invoices, EUR 3,200 total, 1 overdue (Vodafone EUR 45)"
  6. If monthly boundary: COMPRESS last 30 episodic entries into 1 semantic summary
```

Concrete example of compression:

**30 daily episodic entries** (each ~200 tokens = 6000 tokens total):
```
2026-03-01: Processed 5 invoices, EUR 2,100. All current.
2026-03-02: Processed 3 invoices, EUR 890. Vodafone overdue.
...
2026-03-30: Processed 7 invoices, EUR 3,400. Vodafone still overdue (30 days).
```

**Compressed into 1 semantic summary** (~300 tokens):
```yaml
---
page_id: finance-summary-2026-03
type: semantic
created: 2026-04-01
confidence: 0.95
tags: [finance, monthly-summary, 2026-03]
supersedes: [finance-daily-2026-03-01 through finance-daily-2026-03-30]
---
March 2026 Finance Summary:
- 158 invoices processed, total EUR 42,300
- Average daily: 5.3 invoices, EUR 1,410
- Recurring subscriptions: EUR 1,240/mo (no change from Feb)
- Overdue: Vodafone EUR 45 (chronic, 30+ days, escalate)
- Notable: New creditor added (Hetzner, EUR 29/mo server)
- Runway: 4.2 months at current burn rate
```

**Compression ratio: 20:1** (matches OpenClaw's production numbers).

### Q4: What's the minimum viable agent memory for a personal dashboard?

**Answer: 2 layers + 1 table + 1 directory. Implementation in 2-3 days.**

The minimum viable agent memory (MVAM) for MC v1:

| Layer | Implementation | What Goes Here | Day 1? |
|-------|---------------|----------------|--------|
| **Working Memory** | CLAUDE.md + MEMORY.md (already exists) | Project rules, user preferences, current session state | YES (already done) |
| **Procedural Memory** | `wiki/` directory with flat .md files | Decision records, how-tos, workflow patterns | YES |
| **Episodic Memory** | `agent_memories` SQLite table | Daily agent run logs, task outcomes | YES |
| **Semantic Memory** | Same `agent_memories` table, type='semantic' | Compressed summaries, learned facts | Phase 2 (after 30+ episodic entries) |

What you do NOT need for MVAM:
- Vector database (overkill at <500 entries)
- PGLite (adds dependency for no benefit over SQLite)
- MCP server for wiki (Claude Code can read/write files directly)
- Confidence decay algorithms (implement manually first, automate later)
- Self-training / REFLECT operations (v2+ feature)

### Q5: How do you prevent agent memory from going stale?

**Answer: 5 mechanisms, ordered by implementation effort.**

| Mechanism | Effort | Effectiveness | When to Implement |
|-----------|--------|---------------|-------------------|
| **1. `as_of` date on every fact** | Trivial | High | Day 1 |
| **2. `superseded_by` links** | Low | Very High | Day 1 |
| **3. `last_accessed` tracking** | Low | Medium | Day 1 |
| **4. Scheduled compression cron** | Medium | High | Week 2 |
| **5. REFLECT pass (agent self-review)** | High | Very High | Month 2+ |

**Mechanism details:**

**1. `as_of` dates** (Karpathy pattern): Every factual memory includes `as_of: 2026-04-12`. When an agent retrieves a fact, it checks: is this older than the relevant threshold? Finance facts (invoice amounts): never stale. Project status: stale after 7 days. Market data: stale after 1 day.

**2. `superseded_by` links** (OpenClaw pattern): When a fact changes, the old entry is NOT deleted. It gets a `superseded_by: <new-memory-id>` pointer. Retrieval skips superseded entries. Audit trail preserved.

```sql
-- Old entry
UPDATE agent_memories SET superseded_by = 'mem_new_123' WHERE id = 'mem_old_456';
-- New entry
INSERT INTO agent_memories (id, content, ...) VALUES ('mem_new_123', 'MC uses PGLite', ...);
```

**3. `last_accessed` tracking** (MemFactory pattern): Every RETRIEVE operation updates `last_accessed` and increments `access_count`. Memories not accessed in 30+ days are candidates for compression or archival.

**4. Scheduled compression** (Roemmele + OpenClaw): A weekly or monthly job that:
- Finds episodic entries older than 30 days
- Groups by tags/topic
- Generates summary entries (type='semantic')
- Marks originals as `superseded_by` the summary
- Result: active memory stays compact; historical detail is preserved but not loaded

**5. REFLECT pass** (MemFactory): A periodic agent run that reviews memory quality:
- "Do I have contradictory facts about X?"
- "Which memories haven't been accessed in 60+ days?"
- "Are there retrieval failures I should investigate?"
- Generates meta-observations, flags issues for human review

---

## 3. Technology Comparison Matrix

### Memory Storage Technologies

| Technology | Type | Vector Search | FTS | Embedded | Maturity | MC Fit | Score |
|-----------|------|--------------|-----|----------|----------|--------|-------|
| **SQLite + FTS5** | Relational + FTS | No (add sqlite-vec) | Yes (native) | Yes | 25 years | BEST | 9/10 |
| **PGLite + pgvector** | Relational + Vector | Yes (native) | Yes (Postgres FTS) | Yes (WASM) | Pre-1.0 (0.2.x) | Good, overkill | 7/10 |
| **Qdrant** | Vector DB | Yes | Limited | No (server) | 3 years | Overkill | 4/10 |
| **Pinecone** | Vector DB (cloud) | Yes | No | No (SaaS) | 4 years | Wrong model (cloud) | 2/10 |
| **ChromaDB** | Vector DB (embedded) | Yes | Limited | Yes | 2 years | Acceptable | 5/10 |
| **sqlite-vec** | SQLite extension | Yes | Via FTS5 | Yes | 1 year | Future upgrade path | 6/10 |
| **Flat files (LLM Wiki)** | File system | No | No (grep) | N/A | Infinite | BEST for <500 pages | 9/10 |

### Memory Architecture Patterns

| Pattern | Complexity | Scale Ceiling | Agent-Writable | Staleness Handling | MC Fit | Score |
|---------|-----------|--------------|----------------|-------------------|--------|-------|
| **CLAUDE.md/MEMORY.md only** | Trivial | ~10K tokens | Yes | None | Already using, insufficient alone | 5/10 |
| **LLM Wiki (files)** | Low | ~500 pages | Yes | Manual | Foundation layer | 9/10 |
| **LLM Wiki + FTS5** | Medium | ~5000 pages | Yes | Via queries | Target for v1 | 8/10 |
| **4-Layer Stack (OpenClaw)** | High | Unlimited | Yes | Full lifecycle | Target for v2 | 7/10 |
| **Full MemFactory (6 ops)** | Very High | Unlimited | Yes | Self-maintaining | Target for v3 | 6/10 |
| **gbrain (PGLite RAG)** | Medium | 10K+ docs | Index-only | Re-embedding | Wrong model for MC | 4/10 |

---

## 4. Recommended Architecture for MC

### Primary Recommendation: Hybrid File + SQLite ("LLM Wiki + Structured Memory")

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: WORKING MEMORY (Session-scoped)               │
│  ├── .claude/CLAUDE.md          (project rules)         │
│  ├── ~/.claude/.../MEMORY.md    (user prefs, facts)     │
│  └── Agent prompt context       (current task state)    │
│  Loaded: ALWAYS. Cleared: session end.                  │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: PROCEDURAL MEMORY (LLM Wiki)                  │
│  ├── wiki/decision-*.md         (architecture decisions) │
│  ├── wiki/howto-*.md            (reusable workflows)    │
│  ├── wiki/pattern-*.md          (learned patterns)      │
│  └── wiki/_index.yaml           (page registry + tags)  │
│  Loaded: ON DEMAND (agent reads relevant pages).        │
│  Updated: BY AGENT after completing tasks.              │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: EPISODIC + SEMANTIC MEMORY (SQLite)           │
│  └── agent_memories table                               │
│      ├── type: 'episodic'       (daily run logs)        │
│      ├── type: 'semantic'       (compressed summaries)  │
│      ├── type: 'fact'           (learned facts)         │
│      └── type: 'feedback'       (user corrections)      │
│  Queried: FTS5 or SQL filters. Written: by agent.       │
├─────────────────────────────────────────────────────────┤
│  LAYER 4: STRUCTURED BUSINESS DATA (SQLite/Drizzle)     │
│  └── Existing schema: projects, tasks, finances, etc.   │
│  Agent READS this data. Agent DOES NOT write here       │
│  (writes go through MC's action layer).                 │
└─────────────────────────────────────────────────────────┘
```

### Why This Architecture

1. **No new dependencies.** SQLite is already in MC. Flat files are already in the repo. Zero new packages to install.

2. **Separation of concerns.** Business data (projects, invoices) has different lifecycle, schema, and access patterns than agent knowledge (decisions, how-tos, daily logs). Mixing them in one table schema creates friction.

3. **Token efficiency.** LLM Wiki files are written for agent consumption -- no HTML, no visual chrome, YAML frontmatter for machine parsing. Karpathy estimates 2-3x context savings vs. human-formatted docs.

4. **Incremental complexity.** Start with Layer 1+2 (already working) + Layer 3 (one new table). Add FTS5 when >500 entries. Add compression cron when episodic entries accumulate. Add REFLECT when there is enough data to make it meaningful.

5. **Matches the thin-harness principle.** The memory layer is ~200 lines of schema + ~100 lines of helper functions. Not a framework. Not a dependency. Just SQL and files.

---

## 5. Schema Design

### 5.1 `agent_memories` Table (add to MC's SQLite)

```sql
CREATE TABLE agent_memories (
  id TEXT PRIMARY KEY,                    -- 'mem_' + nanoid
  content TEXT NOT NULL,                   -- The memory content (plain text)
  memory_type TEXT NOT NULL               -- 'episodic' | 'semantic' | 'fact' | 'feedback' | 'procedural'
    CHECK(memory_type IN ('episodic','semantic','fact','feedback','procedural')),
  agent_id TEXT NOT NULL,                  -- 'finance-agent' | 'content-agent' | 'chat-agent' | 'system'
  scope TEXT DEFAULT 'global',             -- 'global' | project_id | 'finance' | 'content'
  tags TEXT,                               -- JSON array: ["finance", "monthly-summary", "2026-03"]
  confidence REAL DEFAULT 1.0,             -- 0.0 to 1.0, decays over time
  decay_rate REAL DEFAULT 0.0,             -- Per-day decay. 0 = permanent. 0.01 = stale in 100 days.
  as_of TEXT,                              -- Date this fact is accurate as of
  superseded_by TEXT REFERENCES agent_memories(id),  -- Points to newer version
  source TEXT,                             -- 'agent-run:run_123' | 'user-feedback' | 'compression'
  access_count INTEGER DEFAULT 0,          -- Incremented on each retrieval
  last_accessed TEXT,                      -- ISO timestamp of last retrieval
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT                         -- Soft delete
);

-- FTS5 virtual table for keyword search
CREATE VIRTUAL TABLE agent_memories_fts USING fts5(
  content,
  tags,
  content=agent_memories,
  content_rowid=rowid
);

-- Triggers to keep FTS5 in sync
CREATE TRIGGER agent_memories_ai AFTER INSERT ON agent_memories BEGIN
  INSERT INTO agent_memories_fts(rowid, content, tags)
  VALUES (new.rowid, new.content, new.tags);
END;

CREATE TRIGGER agent_memories_ad AFTER DELETE ON agent_memories BEGIN
  INSERT INTO agent_memories_fts(agent_memories_fts, rowid, content, tags)
  VALUES('delete', old.rowid, old.content, old.tags);
END;

CREATE TRIGGER agent_memories_au AFTER UPDATE ON agent_memories BEGIN
  INSERT INTO agent_memories_fts(agent_memories_fts, rowid, content, tags)
  VALUES('delete', old.rowid, old.content, old.tags);
  INSERT INTO agent_memories_fts(rowid, content, tags)
  VALUES (new.rowid, new.content, new.tags);
END;

-- Performance indexes
CREATE INDEX idx_memories_type ON agent_memories(memory_type);
CREATE INDEX idx_memories_agent ON agent_memories(agent_id);
CREATE INDEX idx_memories_scope ON agent_memories(scope);
CREATE INDEX idx_memories_confidence ON agent_memories(confidence);
CREATE INDEX idx_memories_superseded ON agent_memories(superseded_by);
CREATE INDEX idx_memories_created ON agent_memories(created_at);
```

### 5.2 `memory_links` Table (relationships between memories)

```sql
CREATE TABLE memory_links (
  source_id TEXT NOT NULL REFERENCES agent_memories(id),
  target_id TEXT NOT NULL REFERENCES agent_memories(id),
  link_type TEXT NOT NULL
    CHECK(link_type IN ('supports','contradicts','elaborates','supersedes','compresses')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (source_id, target_id)
);
```

### 5.3 LLM Wiki Directory Structure

```
missioncontrole/
  wiki/
    _index.yaml              # Master page registry
    decision-database.md     # Why SQLite over Postgres
    decision-auth-none.md    # Why no auth (single-user)
    decision-memory-arch.md  # This architecture decision
    howto-deploy-local.md    # How to run MC locally
    howto-finance-agent.md   # Finance Agent workflow
    howto-content-agent.md   # Content Agent workflow
    pattern-compression.md   # Memory compression procedure
    pattern-daily-run.md     # Daily agent run pattern
    status-mc-phase-1.md     # Current project status
```

### 5.4 Wiki Page Template

```yaml
---
page_id: decision-database
type: decision              # decision | howto | pattern | status | fact
created: 2026-04-12
updated: 2026-04-12
as_of: 2026-04-12
confidence: 0.95
tags: [architecture, database, sqlite, drizzle]
related: [decision-memory-arch, howto-deploy-local]
agent_writable: false       # Human-curated decision
---
MC uses SQLite (better-sqlite3) with Drizzle ORM. Single-file database, local-first, no server process. Chosen over Postgres/Supabase for simplicity — single-user app does not need multi-user concurrency or cloud deployment. Migration path: if MC ever needs hosted DB, Drizzle supports Postgres with minimal schema changes.
```

### 5.5 `_index.yaml` Template

```yaml
# wiki/_index.yaml — Master page registry
# Auto-updated by agent after creating/modifying pages
pages:
  - id: decision-database
    type: decision
    tags: [architecture, database]
    updated: 2026-04-12
  - id: howto-finance-agent
    type: howto
    tags: [finance, agent, workflow]
    updated: 2026-04-12
```

---

## 6. Memory Operations: The MemFactory 6

Adapted from UC Berkeley's MemFactory for MC's specific needs.

### Implementation Priority

| Operation | v1 (Day 1) | v2 (Month 1) | v3 (Month 3+) |
|-----------|-----------|-------------|---------------|
| **STORE** | YES | YES | YES |
| **RETRIEVE** | YES (SQL + file read) | YES (+ FTS5) | YES (+ semantic) |
| **UPDATE** | YES (supersede pattern) | YES | YES |
| **FORGET** | YES (soft-delete) | YES (confidence decay) | YES (auto-prune) |
| **COMPRESS** | NO | YES (monthly cron) | YES (weekly) |
| **REFLECT** | NO | NO | YES (agent self-review) |

### Operation Signatures (TypeScript/Drizzle)

```typescript
// STORE: Write a new memory
async function storeMemory(params: {
  content: string;
  memoryType: 'episodic' | 'semantic' | 'fact' | 'feedback';
  agentId: string;
  scope?: string;
  tags?: string[];
  confidence?: number;
  decayRate?: number;
  asOf?: string;
  source?: string;
}): Promise<string>; // returns memory ID

// RETRIEVE: Find relevant memories
async function retrieveMemories(params: {
  query?: string;          // FTS5 search (v2+)
  memoryType?: string;
  agentId?: string;
  scope?: string;
  tags?: string[];
  minConfidence?: number;  // default 0.3
  limit?: number;          // default 20
  excludeSuperseded?: boolean; // default true
}): Promise<Memory[]>;

// UPDATE: Supersede an existing memory with a new version
async function updateMemory(params: {
  oldMemoryId: string;
  newContent: string;
  reason?: string;
}): Promise<string>; // returns new memory ID

// FORGET: Soft-delete or reduce confidence
async function forgetMemory(params: {
  memoryId: string;
  reason: string;
  hardDelete?: boolean;    // default false (soft-delete)
}): Promise<void>;

// COMPRESS: Summarize multiple memories into one
async function compressMemories(params: {
  memoryIds: string[];
  summary: string;
  tags?: string[];
}): Promise<string>; // returns summary memory ID

// REFLECT: Agent reviews memory quality (v3)
async function reflectOnMemories(params: {
  scope?: string;
  olderThan?: number;      // days
}): Promise<ReflectionReport>;
```

---

## 7. Finance Agent: Cross-Session Context Pattern

The Finance Agent is MC's most frequent agent -- designed to run daily. Here is the complete memory flow.

### Daily Run Memory Flow

```
08:00 — Finance Agent Triggered (cron or manual)
│
├── 1. LOAD WORKING MEMORY
│   ├── Read CLAUDE.md (project rules)
│   ├── Read wiki/howto-finance-agent.md (procedure)
│   └── Read MEMORY.md (user prefs: "Burak wants runway in months")
│
├── 2. RETRIEVE RECENT CONTEXT
│   ├── SELECT * FROM agent_memories
│   │   WHERE agent_id = 'finance-agent'
│   │   AND memory_type IN ('semantic', 'fact')
│   │   AND superseded_by IS NULL
│   │   AND confidence > 0.3
│   │   ORDER BY created_at DESC LIMIT 10
│   └── Result: last month's summary, known creditors, recurring amounts
│
├── 3. READ BUSINESS DATA
│   ├── SELECT * FROM creditors WHERE archived_at IS NULL
│   ├── SELECT * FROM subscriptions WHERE active = 1
│   ├── SELECT * FROM deadlines WHERE due_date >= date('now') AND due_date <= date('now', '+7 days')
│   └── SELECT * FROM financial_snapshots ORDER BY created_at DESC LIMIT 1
│
├── 4. EXECUTE TASK
│   ├── Check for new/changed creditors
│   ├── Calculate current monthly burn
│   ├── Identify overdue payments
│   ├── Calculate runway
│   └── Generate daily finance report
│
├── 5. STORE EPISODIC MEMORY
│   └── INSERT INTO agent_memories:
│       content: "2026-04-12: Monthly burn EUR 2,340. Runway 4.1 months.
│                 Vodafone EUR 45 overdue (42 days). New: Hetzner EUR 29/mo."
│       memory_type: 'episodic'
│       agent_id: 'finance-agent'
│       tags: ["finance", "daily", "2026-04-12"]
│       confidence: 1.0
│       decay_rate: 0.03  (stale after ~30 days)
│
├── 6. UPDATE FACTS (if changed)
│   └── If monthly burn changed: supersede old fact, store new one
│       UPDATE agent_memories SET superseded_by = 'mem_new'
│         WHERE id = 'mem_old_burn_rate';
│       INSERT: content="Monthly burn: EUR 2,340 (as of 2026-04-12)"
│               memory_type: 'fact', decay_rate: 0.0
│
└── 7. CHECK COMPRESSION THRESHOLD
    └── IF count(episodic WHERE agent_id='finance-agent' AND created > 30 days ago) > 25:
        TRIGGER compression job (monthly summary)
```

### Monthly Compression Job

```
1st of each month — Compression Triggered
│
├── SELECT episodic memories from previous month
│   WHERE agent_id = 'finance-agent'
│   AND memory_type = 'episodic'
│   AND created_at BETWEEN '2026-03-01' AND '2026-03-31'
│
├── Feed to LLM: "Summarize these 30 daily finance logs into one monthly summary.
│                  Include: total processed, averages, anomalies, overdue items, trend."
│
├── STORE summary as type='semantic'
│   tags: ["finance", "monthly-summary", "2026-03"]
│   confidence: 0.95
│   decay_rate: 0.0 (monthly summaries never decay)
│
└── Mark 30 episodic entries as superseded_by the summary
    (entries preserved for audit, but excluded from default retrieval)
```

---

## 8. Staleness Prevention Strategy

### The 5-Layer Defense Against Stale Memory

```
┌────────────────────────────────────────────────────┐
│  LAYER 5: REFLECT (Agent Self-Review)    [v3]      │
│  Periodic: agent reviews own memory for quality    │
│  Catches: contradictions, forgotten context         │
├────────────────────────────────────────────────────┤
│  LAYER 4: COMPRESS (Scheduled Consolidation) [v2]  │
│  Monthly: episodic → semantic summaries            │
│  Prevents: unbounded memory growth                  │
├────────────────────────────────────────────────────┤
│  LAYER 3: Confidence Decay              [v1]       │
│  decay_rate per memory type                        │
│  Retrieval filters: WHERE confidence > 0.3         │
│  Prevents: stale facts treated as current          │
├────────────────────────────────────────────────────┤
│  LAYER 2: superseded_by Links           [v1]       │
│  New fact points to old fact                       │
│  Retrieval skips superseded entries                │
│  Prevents: contradictory facts in context          │
├────────────────────────────────────────────────────┤
│  LAYER 1: as_of Dates                   [v1]       │
│  Every fact timestamped                            │
│  Agent checks: "Is this older than my threshold?"  │
│  Prevents: acting on outdated information          │
└────────────────────────────────────────────────────┘
```

### Decay Rates by Memory Type

| Memory Type | Decay Rate | Effective Half-Life | Rationale |
|------------|-----------|--------------------|-----------|
| Financial amounts (invoices) | 0.0 | Permanent | Invoice amounts don't change |
| Monthly summaries | 0.0 | Permanent | Historical record |
| Project status | 0.03 | ~23 days | Projects change frequently |
| User preferences | 0.005 | ~140 days | Preferences are relatively stable |
| Daily episodic logs | 0.05 | ~14 days | Rapidly superseded by newer logs |
| Technical facts ("MC uses SQLite") | 0.001 | ~700 days | Rarely changes |
| Decision records | 0.0 | Permanent | Decisions are historical fact |

### Effective Confidence Calculation

```typescript
function effectiveConfidence(memory: Memory): number {
  const daysSinceUpdate = daysBetween(memory.updated_at, now());
  const decayed = memory.confidence - (memory.decay_rate * daysSinceUpdate);
  return Math.max(0, Math.min(1, decayed));
}

// Retrieval filter
function isRetrievable(memory: Memory): boolean {
  return (
    memory.superseded_by === null &&
    memory.archived_at === null &&
    effectiveConfidence(memory) > 0.3
  );
}
```

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Memory grows unbounded** | High (without compression) | Medium -- context window waste | Implement COMPRESS in v2. Set hard limit: 1000 active memories, force compression above. |
| **Stale facts cause wrong decisions** | Medium | High -- agent acts on outdated info | `as_of` + `superseded_by` + confidence decay (all v1). Agent prompt includes: "Check as_of date before trusting facts." |
| **FTS5 misses relevant memories** | Low | Medium -- agent lacks context | Page naming conventions + tags reduce miss rate. Karpathy: "Good naming beats embeddings for <5000 pages." |
| **Agent writes bad memories** | Medium | Medium -- garbage in, garbage out | All agent writes are soft-deletable. REFLECT pass (v3) reviews quality. User can manually review/edit. |
| **Schema migration complexity** | Low | Low -- one new table | Standard Drizzle migration. No breaking changes to existing schema. |
| **PGLite is pre-1.0** | N/A (not using) | N/A | Avoided by choosing SQLite. PGLite remains future upgrade path. |
| **wiki/ directory gets messy** | Medium | Low -- organizational debt | `_index.yaml` registry + naming conventions + type prefixes. |
| **Compression loses important detail** | Low | Medium -- information loss | Originals are preserved (superseded, not deleted). Agent can access raw episodic entries if needed. |
| **Over-engineering memory for a personal tool** | Medium | Medium -- wasted dev time | MVAM approach: 2 layers + 1 table. Add complexity only when justified by actual scale. |

---

## 10. Implementation Roadmap

### Phase 1: MVAM (Minimum Viable Agent Memory) — 2-3 days

**Goal**: Agent can store, retrieve, update, and soft-delete memories.

| Task | Effort | Output |
|------|--------|--------|
| Add `agent_memories` table via Drizzle migration | 2h | Schema + migration |
| Add `memory_links` table | 30min | Schema + migration |
| Create `wiki/` directory with 3-5 seed pages | 1h | decision-database.md, howto-finance-agent.md, etc. |
| Implement STORE action | 2h | `storeMemory()` in MC's action layer |
| Implement RETRIEVE action (SQL filters, no FTS5 yet) | 2h | `retrieveMemories()` with type/scope/tag filters |
| Implement UPDATE (supersede pattern) | 1h | `updateMemory()` |
| Implement FORGET (soft-delete) | 30min | `forgetMemory()` |
| Add memory retrieval to agent prompt template | 1h | Agent loads relevant memories before each task |
| **Total** | **~10h** | **Functional agent memory layer** |

### Phase 2: Search + Compression — 1 week

**Goal**: FTS5 search, monthly compression, confidence decay.

| Task | Effort | Output |
|------|--------|--------|
| Add FTS5 virtual table + sync triggers | 2h | Full-text search over memories |
| Implement FTS5 RETRIEVE | 2h | Keyword search in `retrieveMemories()` |
| Implement COMPRESS operation | 4h | Monthly episodic-to-semantic compression |
| Add confidence decay calculation | 1h | `effectiveConfidence()` function |
| Add `last_accessed` tracking to RETRIEVE | 30min | Access count and timestamp updates |
| Create compression cron/trigger | 2h | Monthly job or manual trigger |
| Finance Agent integration | 4h | Daily run with full memory flow |
| **Total** | **~16h** | **Searchable, self-compressing memory** |

### Phase 3: Intelligence — 2-4 weeks (future)

**Goal**: REFLECT, self-training, advanced retrieval.

| Task | Effort | Output |
|------|--------|--------|
| Implement REFLECT operation | 8h | Agent self-review of memory quality |
| Post-task memory evaluation (Icarus pattern) | 4h | Confidence boost/penalize based on usefulness |
| Cross-agent memory sharing | 4h | Finance agent reads content agent's memories (scoped) |
| Memory dashboard UI in MC | 8h | View, search, edit, delete memories in the web UI |
| sqlite-vec integration (if >5000 entries) | 8h | Semantic search upgrade |
| **Total** | **~32h** | **Self-improving agent memory** |

---

## 11. Alternative Approaches & Fallbacks

### Alternative A: PGLite Instead of SQLite (gbrain approach)

**When to consider**: If MC migrates to hosted deployment OR needs vector search before reaching 5000 entries.

| Dimension | SQLite (recommended) | PGLite |
|-----------|---------------------|--------|
| Maturity | 25 years, battle-tested | Pre-1.0 (0.2.x) |
| Vector search | Requires sqlite-vec extension | Built-in pgvector |
| Migration path | sqlite-vec for local; Turso for cloud | Direct to hosted Postgres |
| Drizzle support | First-class | Supported but newer |
| Risk | Very low | Medium (pre-1.0 API changes) |
| Effort to switch | N/A (current) | 1-2 days (schema port) |

**Decision**: Stay with SQLite for v1-v2. Revisit PGLite if vector search becomes necessary.

### Alternative B: Hermes-Wiki MCP Server Instead of File-Based Wiki

**When to consider**: If MC agents are MCP-connected and wiki operations need formalized tooling.

| Dimension | File-based wiki (recommended) | Hermes-Wiki MCP |
|-----------|------------------------------|------------------|
| Dependencies | None (file read/write) | Node.js server process |
| Search | grep / manual | FTS5 built-in |
| Agent integration | Direct file access | MCP tool calls |
| Overhead | Zero | Server process + MCP protocol |
| Bidirectional links | Manual REF: tokens | Automatic [[links]] |

**Decision**: Start file-based. If >200 wiki pages or multiple agents need concurrent access, adopt Hermes-Wiki.

### Alternative C: All-in-MEMORY.md (Minimal Approach)

**When to consider**: If MC development is resource-constrained and agent memory is not a priority.

Keep everything in CLAUDE.md + MEMORY.md. No new tables, no wiki directory. Accept limitations:
- No search (entire file loaded into context)
- No forgetting (manual cleanup only)
- No compression (grows until context window is the bottleneck)
- No cross-session episodic memory (only what fits in MEMORY.md)

**Decision**: NOT recommended. MEMORY.md is already ~15K tokens and growing. The 10h investment in Phase 1 prevents a much larger problem later.

### Fallback: If Phase 1 Implementation Fails

If the SQLite-based approach proves more complex than estimated:
1. **Fall back to pure file-based**: Store ALL memories as `wiki/mem-*.md` files. Use `grep` for search. Lose structured queries but gain simplicity.
2. **Effort**: 4h to implement (even simpler than Phase 1).
3. **Scale ceiling**: ~500 files before grep becomes slow.
4. **Upgrade path**: Migrate files into SQLite when ready.

---

## 12. Decision Record

### DR-001: Agent Memory Storage

| Field | Value |
|-------|-------|
| **Decision** | Hybrid: SQLite `agent_memories` table + file-based LLM Wiki |
| **Date** | 2026-04-12 |
| **Status** | PROPOSED (awaiting implementation) |
| **Alternatives considered** | PGLite (too immature), Qdrant (overkill), MEMORY.md only (insufficient), All-SQLite (mixes concerns) |
| **Rationale** | Zero new dependencies. Separation of structured (SQLite) and procedural (files) memory. Matches thin-harness principle. Clear upgrade path to vectors if needed. |
| **Risks accepted** | FTS5 may miss semantically-similar-but-keyword-different entries. Mitigation: good naming + tags. |

### DR-002: No Vector Database for v1-v2

| Field | Value |
|-------|-------|
| **Decision** | No vector DB. FTS5 for keyword search. |
| **Date** | 2026-04-12 |
| **Status** | PROPOSED |
| **Alternatives considered** | PGLite+pgvector, ChromaDB, sqlite-vec |
| **Rationale** | Karpathy: "Most personal agent wikis will never need vectors." MC will have <1000 active memories for 12+ months. FTS5 is 3.75x faster than vector search (12ms vs 45ms per OpenClaw benchmarks). |
| **Trigger to reconsider** | >5000 active memories OR cross-lingual retrieval need |

### DR-003: Separate Agent Memory from Business Data

| Field | Value |
|-------|-------|
| **Decision** | Agent memories in `agent_memories` table, NOT in existing business tables. Business data read-only for agents. |
| **Date** | 2026-04-12 |
| **Status** | PROPOSED |
| **Rationale** | Different lifecycle (memories decay, business data persists). Different access patterns (memories searched by confidence+recency, business data by status+project). Different write authority (agents write memories freely, business data writes go through MC action layer). |

---

## Appendix A: Source Cross-Reference Matrix

Which sources informed which recommendation:

| Recommendation | gbrain | Hermes-Wiki | Karpathy | OpenClaw | MemFactory | Roemmele | Obsidian | Icarus | Claude .claude/ | AIE Europe |
|---------------|--------|-------------|----------|----------|------------|----------|----------|--------|-----------------|------------|
| Hybrid file + SQLite | | X | X | X | | | X | | X | |
| No vector DB | | X | X | | | | | | | X |
| 4-layer model | | | | X | X | X | | | X | X |
| superseded_by links | | | | X | X | | | | | |
| Confidence decay | | | | | X | X | | X | | |
| FTS5 over vectors | | X | X | X | | | | | | X |
| YAML frontmatter | | X | X | | | | X | | | |
| Flat namespace | | X | X | | | | X | | | |
| Compression pattern | | | | X | X | X | | | | |
| REFLECT operation | | | | | X | | | X | | |

## Appendix B: Token Budget Analysis

Claude Code with Opus 4 has a 200K context window. MC agent memory budget:

| Memory Layer | Tokens Allocated | Content |
|-------------|-----------------|----------|
| CLAUDE.md | ~2K | Project rules (always loaded) |
| MEMORY.md | ~3K | User prefs, key facts (always loaded) |
| Wiki pages (on-demand) | ~4K (2 pages max) | Relevant procedures, decisions |
| Retrieved memories (SQL) | ~3K (10 entries max) | Recent episodic + semantic |
| Business data context | ~4K | Relevant projects, tasks, finances |
| **Total agent context** | **~16K** | **8% of context window** |
| Remaining for task execution | ~184K | Model reasoning, code generation, etc. |

This is well within budget. Even doubling the memory layer to 32K uses only 16% of context. The architecture is sustainable for years of accumulated memory at MC's scale.

---

*Research complete. This document should be used as the architecture specification for MC's agent memory layer. Implementation begins with Phase 1 (MVAM) when MC development resumes.*
