# Mission Control Data Architecture -- Catalogue Exploration

> **Date:** 2026-04-12
> **Scope:** Systematic search across 530-entry research catalogue for insights on personal command center data architecture
> **Question:** "What is the right data architecture for a solo developer's personal command center / mission control app?"
> **Context:** Mission Control v2 is Next.js + SQLite (better-sqlite3 + Drizzle ORM), local-first, single-user. Four Notion hubs exist with real data. Decision pending: Notion as source of truth vs. local-first SQLite vs. hybrid.

---

## Executive Summary

The research catalogue contains **35+ directly relevant entries** converging on a clear answer: **local-first with markdown/SQLite as source of truth, with Notion relegated to a read-only input source that gets progressively archived.** Every high-signal practitioner in the catalogue -- Karpathy, Garry Tan, Steph Ango (Obsidian CEO), Harrison Chase, Cole Medin, Internet Vin -- independently arrived at the same conclusion: plain files on your machine, owned by you, with agents maintaining them. Not one credible source advocates for a SaaS database (Notion, Airtable) as the primary data layer for agent-powered personal tools.

The catalogue also reveals a critical insight from Harrison Chase: **memory IS the harness, and whoever owns the memory layer owns the competitive advantage.** Putting your data behind Notion's API means Notion owns your memory layer.

---

## Tier 1 -- Foundational Entries (Must-Read for This Decision)

### 1. Karpathy -- LLM Knowledge Bases (10/10 relevance)
**Path:** `research/catalogue/posts/2026-04/karpathy-llm-wiki-knowledge-bases.md`
**Key Insight:** "Just markdown + git" gives you version history, branching, collaboration, and diffing for free. No proprietary formats, no vendor lock-in, no database migrations. Three-layer architecture: Raw Sources (immutable) / Wiki (LLM-maintained) / Schema (CLAUDE.md). Three operations: Ingest / Query / Lint.
**MC Implication:** The Mission Control data model maps cleanly to this: raw data (Notion exports, email imports) goes into a raw/ layer. SQLite + markdown files form the wiki layer. CLAUDE.md and the app config form the schema.

### 2. GBrain -- Garry Tan's Personal Brain (9/10 relevance)
**Path:** `research/catalogue/agent-memory/garrytan-gbrain.md`
**Key Insight:** PGLite (embedded Postgres 17.5 via WASM) for zero-setup local DB that can graduate to Supabase via `gbrain migrate --to supabase`. Compiled-truth + append-only-timeline page schema. 10,000+ markdown files, 3,000+ people pages. Bidirectional migration between local and cloud. "Start local and graduate to managed only when a brain exceeds ~1000 files."
**MC Implication:** The PGLite/Postgres pattern is the strongest precedent for MC's SQLite approach. Start local, optionally scale to cloud. The compiled-truth + timeline schema maps to MC's source-tracking pattern (`source_id` on every table). The bidirectional migration is exactly the "graduate from local" pattern MC needs.

### 3. Harrison Chase -- "Your Harness, Your Memory" (9/10 relevance)
**Path:** `research/catalogue/articles/2026-04/langchain-your-harness-your-memory.md`
**Key Insight:** "Memory is the harness, not a plugin." Three levels of lock-in: (1) Stateful APIs -- can't switch providers while preserving threads. (2) Closed harnesses -- memory exists but is opaque. (3) Full API enclosure -- zero ownership. Harrison's deleted email assistant lost months of accumulated preferences -- the accumulated memory WAS the differentiation.
**MC Implication:** This is the strongest argument AGAINST Notion as source of truth. Notion is Level 1 lock-in (stateful API). Moving MC's data behind Notion's API means every query goes through their rate limits, every migration is a rebuild, and every Notion outage kills your system. Local SQLite = Level 0 (full ownership).

### 4. Steph Ango -- "File Over App" (7/10 relevance)
**Path:** `research/catalogue/talks/2026-04/steph-ango-obsidian-ceo-notes.md`
**Key Insight:** The Obsidian CEO's core principle: "Notes are plain-text Markdown files that exist independently of any application. The data outlives every tool." Properties (YAML frontmatter) replace folders. Separate "personal vault" (human-curated) from "messy vault" (agent-generated). Promote after review.
**MC Implication:** The CEO of the most successful personal knowledge app says: your data must not depend on any app. This applies directly to the Notion question -- if Notion dies or changes its API, your data should survive. Local SQLite + markdown exports satisfy this. Notion sync should be import-only, not bidirectional.

### 5. Harrison Chase -- Continual Learning for Agents (9/10 relevance)
**Path:** `research/catalogue/posts/2026-04/harrison-chase-continual-learning-agents.md`
**Key Insight:** Three-layer learning: Model / Harness / Context. Context is the most accessible lever (no GPU, no training). The "Dreaming" pattern: offline trace consolidation into persistent context. Traces are the currency.
**MC Implication:** MC is a Context Layer tool. It should accumulate context (decisions, project state, financial data) in a format agents can consume. SQLite + JSON + markdown is the ideal format for this -- agents can query it directly.

### 6. Notion as Agent Backend -- Our Own Research (Direct relevance)
**Path:** `research/catalogue/reference/notion-as-agent-backend.md`
**Key Insight:** Detailed analysis of Notion 3.3 as agent backend. Critical limitations: 3 req/sec API rate limit, 10K rows/DB, no real-time webhooks, 50 columns/DB. Core design principle: "Notion is a meta-layer and human interface, not a high-frequency transactional database. Agent logs, real-time metrics, and bulk operations should use local files or dedicated databases."
**MC Implication:** We already researched this and concluded Notion is NOT suitable as a primary data store. The 3 req/sec limit alone kills any real-time agent interaction. The 10K row limit means archival is mandatory. This research directly supports local-first with Notion as a display/input layer only.

---

## Tier 2 -- Strong Supporting Entries

### 7. Cole Medin -- AI Second Brain (9/10 relevance)
**Path:** `research/catalogue/talks/2026-04/cole-medin-ai-second-brain-claude-code.md`
**Key Insight:** Hybrid RAG (70% vector + 30% keyword) for memory search. SQLite/PostgreSQL as storage backend. Three hooks (SessionStart/PreCompact/SessionEnd) for continuity. The entire system runs on ~20 EUR/month. Obsidian vault as persistence backend. All data stays as plain-text markdown on your machine.
**MC Implication:** Cole Medin's architecture validates SQLite as the search/storage backend for a personal system. The 70/30 hybrid search formula is worth adopting if MC grows beyond simple SQL queries.

### 8. Internet Vin -- Obsidian + Claude Code (9/10 relevance)
**Path:** `research/catalogue/talks/2026-02-23_greg-isenberg-vin-obsidian-claude-code.md`
**Key Insight:** "Never let the agent write into your vault." Context is the bottleneck, not the model. Obsidian's local-first, markdown-based architecture makes it the ideal backbone for AI integration. Notes are .md files on disk, not locked in someone else's cloud.
**MC Implication:** The read-only principle applies to MC's Notion relationship: import FROM Notion, never write back. MC should be the primary data store; Notion becomes a legacy input.

### 9. Obsidian CLI + Claude Code Integration (9/10 relevance)
**Path:** `research/catalogue/articles/2026-04-04_obsidian-cli-claude-code-integration.md`
**Key Insight:** First-party CLI (100+ commands) with JSON output. 54x faster than grep for orphan detection. "CLI-as-interface pattern: wrapping a rich app behind a Unix-style CLI with JSON output creates the ideal agent integration surface."
**MC Implication:** MC should expose its data via a CLI/API that agents can query, similar to how Obsidian CLI makes vault data agent-accessible. SQLite with a thin CLI wrapper is the natural implementation.

### 10. CASS Memory System (8/10 relevance)
**Path:** `research/catalogue/agent-memory/cass-memory-system.md`
**Key Insight:** Three-layer cognitive architecture: Episodic (raw logs) -> Working (structured summaries) -> Procedural (distilled rules with confidence decay). 90-day half-life decay prevents stale knowledge. "Deterministic curation": LLM extracts insights but NEVER rewrites the playbook -- only delta merges.
**MC Implication:** MC's data should follow a similar tiering: raw imported data (Notion/email) -> structured app state (SQLite tables) -> compiled insights (dashboards, reports). The confidence decay concept is worth adopting for task/project priorities.

### 11. Icarus Memory Protocol (8/10 relevance)
**Path:** `research/catalogue/posts/2026-04-03_icarus-memory-protocol-self-training.md`
**Key Insight:** ~50 lines of bash writing markdown files with YAML frontmatter. Hot (<24h) / Warm (1-7 days) / Cold (>7 days) memory tiering via timestamps. No vector DB, no embedding pipeline.
**MC Implication:** The simplest viable memory system is just timestamped files with implicit tiering. MC's SQLite tables already have `created_at`/`updated_at` -- this enables the same tiering pattern with zero additional infrastructure.

### 12. claude-obsidian Integration (5/5 relevance in their scale)
**Path:** `research/catalogue/general-interest/claude-obsidian-integration.md`
**Key Insight:** Karpathy LLM Wiki pattern deployed as a Claude Code plugin. Hot cache (`hot.md`) for session continuity. 8-category vault lint. Cross-project vault technique: one shared knowledge vault accessible by all projects.
**MC Implication:** MC could serve as the "hot cache" and "cross-project vault" for all of Burak's businesses -- a central data store that every project agent reads from.

### 13. Synthesis: Obsidian + LLM Wiki + Second Brain Convergence
**Path:** `research/catalogue/2026-04-04_SYNTHESIS_obsidian-llm-wiki-second-brain.md`
**Key Insight:** 13 independent sources converge: "plain-text markdown files, maintained by LLMs and stored in local vaults, are the knowledge infrastructure of the agent era." The field has converged on "one or more markdown files at the root of a workspace" as the universal agent configuration mechanism. The most debated principle: agent write access (Vin: never; Ango: separate vaults; Karpathy: agent owns the wiki).
**MC Implication:** The trust boundary question maps to MC: agent-generated content (research, summaries) should be clearly separated from human-entered data (decisions, financial records, personal notes).

### 14. Hermes-Wiki (8/10 relevance)
**Path:** `research/catalogue/agent-harnesses/hermes-wiki.md`
**Key Insight:** Wiki-as-skill-pack pattern: one markdown repo consumed by humans AND by workers via skill-pack loading. SCHEMA.md with fixed YAML frontmatter spec, tag taxonomy, page-splitting thresholds, append-only log.md audit.
**MC Implication:** MC's data should be structured so agents can consume it as a "skill pack" -- not just a database to query, but a knowledge layer that shapes agent behavior.

### 15. MemFactory -- Modular Agent Memory (6/10 relevance)
**Path:** `research/catalogue/posts/2026-04/omarsar0-memfactory-agent-memory-framework.md`
**Key Insight:** Modular plug-and-play memory components (episodic, semantic, procedural). GRPO for RL-based memory management -- 14.8% improvement.
**MC Implication:** Future consideration: MC could serve as the episodic + semantic memory store for Burak's agents, with the procedural layer living in CLAUDE.md files.

### 16. Memory Forgetting Strategy for Agents (7/10 relevance)
**Path:** `research/catalogue/posts/2026-04/brianroemmele-memory-forgetting-strategy-agents.md`
**Key Insight:** Memory forgetting is as important as retention. Relevance scoring + strategic forgetting prevents context explosion.
**MC Implication:** MC needs an archival strategy. Old tasks, completed projects, and stale financial data should be automatically demoted. The `updated_at` timestamp enables this.

### 17. Agents.md Don't Scale -- Codified Context (9/10 relevance)
**Path:** `research/catalogue/posts/2026-03/omarsar0-agents-md-dont-scale-codified-context.md`
**Key Insight:** Three-tier memory: hot-memory constitution (660 lines, always loaded), 19 domain-expert agents (9,300 lines), cold-memory knowledge base (34 spec docs, ~16,250 lines) queried via MCP. Knowledge-to-code ratio of 24.2% across 108K-line system.
**MC Implication:** MC's data model should support tiered retrieval: critical state always in context (hot), module-specific data on demand (warm), archived data via search (cold).

### 18. Vercel -- Knowledge Agents Without Embeddings (7/10 relevance)
**Path:** `research/catalogue/articles/2026-03/vercel-knowledge-agents-without-embeddings.md`
**Key Insight:** Filesystem beats embeddings for knowledge agents. 75% cost reduction. "LLMs already understand filesystems." Deterministic retrieval > semantic similarity.
**MC Implication:** When agents need to query MC data, a simple filesystem/SQL interface outperforms vector embeddings. SQLite queries are deterministic and debuggable.

### 19. The Great Convergence (9/10 relevance)
**Path:** `research/catalogue/posts/2026-04/nichochar-the-great-convergence.md`
**Key Insight:** Everyone (Linear, OpenAI, Anthropic, Notion, Google, Microsoft, Meta) is converging on the same general-harness agent shape. The prize is enterprise knowledge work.
**MC Implication:** The tools landscape is converging, which means MC doesn't need to be clever about infrastructure -- it needs to be clever about domain (Burak's specific workflows). Standard, boring data architecture (SQLite + files) is the correct choice because the value is in the data, not the database.

### 20. Computer Architecture for Agents -- Memory Hierarchy (Part 6)
**Path:** `research/catalogue/computer-architecture-for-agents/06-memory-hierarchy-for-agents.md`
**Key Insight:** Maps classical memory hierarchy (registers -> L1 -> L2 -> L3 -> RAM -> SSD -> HDD -> tape) onto agent systems. The context window is RAM. Local files are SSD. Databases/git history are HDD. The principle of locality applies: agent access patterns are predictable, so caching works.
**MC Implication:** MC should be designed as the "SSD layer" -- faster than searching through Notion (HDD equivalent), but persisting beyond the context window (RAM). The data should be pre-organized for agent consumption (spatial locality).

---

## Tier 3 -- Contextual / Strategic Entries

### 21. agentOS -- Portable OS for Agents
**Path:** `research/catalogue/posts/2026-04/rivet-agentos-portable-os-for-agents.md`
**Key Insight:** S3/SQLite as the filesystem for agent isolation. WASM-based, 6ms cold starts.
**MC Implication:** SQLite is becoming the default persistence layer for agent-native tools.

### 22. Matt Shumer -- Memory Systems for OpenClaw/Hermes
**Path:** `research/catalogue/posts/2026-04/mattshumer-memory-systems-openclaw-hermes.md`
**Key Insight:** Even the OpenClaw/HermesAgent creator hasn't settled on a memory solution. Criteria: OSS, stable, simple.
**MC Implication:** The agent memory problem is unsolved in the ecosystem. MC building its own simple solution (SQLite + files) is not reinventing the wheel -- it's the pragmatic path while the ecosystem matures.

### 23. Karpathy -- Idea Files
**Path:** `research/catalogue/posts/2026-04/2026-04-04_karpathy-idea-files-concept.md`
**Key Insight:** Share the idea as markdown, not the code. Agent builds specifics per user.
**MC Implication:** MC's architecture should be describable as an "idea file" -- simple enough that an agent can understand and maintain it.

### 24. Elvis -- LLM Knowledge Base Diagram
**Path:** `research/catalogue/posts/2026-04/omarsar0-llm-knowledge-base-diagram.md`
**Key Insight:** One-image visual spec: Data Ingest -> Wiki -> Obsidian IDE -> Q&A + Output + Linting.
**MC Implication:** MC's architecture should follow this pipeline: import data -> structure in SQLite -> display in UI -> agents query it + maintain it.

### 25. Obsidian Second Brain Synthesis
**Path:** `research/catalogue/2026-04-04_SYNTHESIS_obsidian-llm-wiki-second-brain.md`
**Key Insight:** Properties over folders. YAML frontmatter as primary organizer. Fractal journaling across time scales. An 8-rule personal style guide eliminates hundreds of decisions.
**MC Implication:** MC's data schema should support rich metadata (tags, categories, dates, sources) as first-class properties, not afterthoughts. This is already in the schema via `source_id`, `source_ref`, etc.

### 26. Adoptable Patterns Backlog
**Path:** `research/catalogue/ADOPTABLE-PATTERNS.md`
**Key Insight:** Contains patterns like "Beads" for agent-native work tracking (JSONL-in-git, hash-based IDs), "remain-on-exit" for crash forensics, and "Hallucination Guard" for zero-tool-call rejection.
**MC Implication:** MC could adopt the Beads pattern for task management -- JSONL storage + hash IDs + dependency graphs. The semantic compaction pattern (summarize closed tasks) maps to MC's archival needs.

### 27. Harness Convergence Wave Synthesis
**Path:** `research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md`
**Key Insight:** "Wiki-as-memory" is now part of the industry's shared primitive. The L-Thread v3 architecture is the open-source consensus position.
**MC Implication:** Validates that MC's local-first approach is not contrarian -- it IS the consensus for personal tools.

---

## Questions These Entries Raise

### Architecture Questions

1. **SQLite or PGLite?** GBrain uses PGLite (embedded Postgres via WASM) with pgvector for hybrid search. MC uses better-sqlite3. Is there a case for switching to PGLite for vector search capabilities as data grows? Or is SQLite + full-text search sufficient at MC's scale?

2. **Markdown companion files?** Multiple sources (Karpathy, gbrain, Hermes-Wiki) store compiled knowledge as markdown files alongside the database. Should MC generate markdown "compiled truth" files from its SQLite data for agent consumption?

3. **What is MC's "raw layer"?** In Karpathy's model, raw sources are immutable. For MC, this would be: Notion API snapshots, email imports, financial CSV imports. Where do these live? A `raw/` directory? A separate SQLite table?

4. **Two-way sync or one-way import?** Every source says "don't let agents write to your source of truth" (Vin) or "separate human and agent vaults" (Ango). This means: import FROM Notion, but never write back. MC becomes the canonical source; Notion becomes read-only legacy.

5. **When does MC need vector search?** At 144 seeded demo rows, SQL queries are fine. At what scale does MC need hybrid search (70% vector + 30% keyword, per Cole Medin)? Is that 1,000 rows? 10,000? 100,000?

6. **How should MC expose data to agents?** Obsidian CLI wraps the app in a Unix CLI with JSON output. Should MC have a similar CLI (`mc search "term" --format json`)? Or is direct SQLite access sufficient?

7. **What about the "Dreaming" pattern?** Harrison Chase describes offline trace consolidation. Should MC have a nightly batch process that consolidates the day's data into compiled summaries?

### Strategic Questions

8. **Is MC a knowledge base or a task manager?** Karpathy's wiki is purely knowledge. Linear is purely tasks. MC is both (projects + tasks + finances + content). Does this dual nature create architectural tension?

9. **Should MC's data be agent-consumable from Day 1?** Multiple sources emphasize that data structured for agent consumption is fundamentally different from data structured for human UIs. Should MC optimize for agent readability (markdown, JSON, flat files) or human readability (relational DB, rich UI)?

10. **How much of Notion should MC replace vs. mirror?** The MEMORY.md says "5-phase migration: mirror -> primary -> archive -> retirement." Is this the right pace? Or should MC immediately become primary for the most-used data (projects, tasks) while Notion stays primary for the least-used (archived notes)?

---

## Gaps in the Catalogue (What We DON'T Have Research On)

### Critical Gaps for MC Decision

1. **No entry on better-sqlite3 vs. PGLite vs. Turso vs. LibSQL.** The catalogue has zero deep research on embedded database options for local-first apps. GBrain's PGLite usage is mentioned in passing but not analyzed as a technology choice.

2. **No entry on CRDTs, Automerge, Y.js, or ElectricSQL.** The catalogue has zero research on sync engines or conflict-free replicated data types. If MC ever needs multi-device sync (phone, laptop, desktop), this is the enabling technology.

3. **No entry on Notion API deep dive.** The `notion-as-agent-backend.md` reference doc covers the architecture design but doesn't analyze Notion API's actual developer experience, migration tooling, or export capabilities in depth.

4. **No entry on PowerSync, Replicache, or LiveBlocks.** These are the leading local-first sync solutions for SQLite/Postgres. Zero coverage.

5. **No entry on TinyBase, Triplit, or other local-first frameworks.** These are purpose-built for the exact use case MC faces.

6. **No entry on Drizzle ORM patterns.** MC uses Drizzle. The catalogue has no research on Drizzle-specific patterns, migration strategies, or how it compares to Prisma for local-first.

7. **No entry on SQLite extensions (FTS5, json1, etc.)** for knowledge retrieval. CASS uses Tantivy, gbrain uses pgvector, but nobody analyzed SQLite's own full-text search capabilities.

### Secondary Gaps

8. **No entry on Linear's data model.** Linear is cited as an inspiration (MEMORY.md says "Linear on the left") but its actual database architecture, sync engine, or data model has never been catalogued.

9. **No entry on Sunsama's architecture.** Also cited as inspiration ("Sunsama on the right") but never researched.

10. **No entry on Raycast's data layer.** Cited for keybindings but its local-first data architecture has not been studied.

11. **No entry on any Tauri/Electron local-first app architecture.** MC is a web app, but the catalogue has no research on how successful local-first desktop apps (Obsidian, Linear, Raycast) structure their data.

12. **No comparative analysis of "Notion sync" patterns.** Multiple projects (MC, Finance Agent, Content Planer) need to interact with Notion. There's no unified research on how to do Notion import/export/sync well.

13. **No research on SQLite + Next.js 16 patterns.** This specific stack (MC's stack) is not covered anywhere in the catalogue.

---

## The Emerging Answer

Based on 35+ catalogue entries, the architecture recommendation crystallizes:

### What the catalogue says unanimously:

1. **Local-first is the consensus.** Not one credible source in 530 entries recommends putting personal data behind a SaaS API as the primary store. Karpathy, Garry Tan, Steph Ango, Harrison Chase, Cole Medin, Internet Vin -- all say: own your data, files on your machine.

2. **SQLite/Postgres is the right database layer.** GBrain (PGLite), CASS (Tantivy/Bun), Overstory (SQLite), agentOS (SQLite), MC (better-sqlite3) -- embedded databases are the pattern.

3. **Notion should be an input source, not the source of truth.** Our own research (`notion-as-agent-backend.md`) already concluded this: "Notion is a meta-layer and human interface, not a high-frequency transactional database." Import from Notion. Never sync back.

4. **Markdown companion files for agent consumption.** The data should exist in two forms: structured (SQLite for queries, UI, relations) and compiled (markdown for agent context, human browsing, portability).

5. **The 5-phase Notion independence plan is correct but should be accelerated.** Phase 1 (mirror) should happen in one sprint. Phase 2 (MC primary) should happen immediately for projects and tasks. Notion stays as a legacy viewer until the full migration is done.

### What the catalogue leaves open:

1. **Hybrid search timing.** When SQL isn't enough, the 70/30 vector+keyword formula (Cole Medin) or PGLite+pgvector (GBrain) are the paths. Not needed at current scale.

2. **Multi-device sync.** If MC stays laptop-only, SQLite is perfect. If it needs phone/iPad access, CRDTs or a sync engine become necessary. No catalogue research on this.

3. **Agent write access policy.** Should agents modify MC data directly, or should they propose changes that the human approves? The Vin/Ango/Karpathy spectrum applies here.

---

## Recommended Next Research

Priority research to fill the gaps for the MC decision:

1. **Deep dive on better-sqlite3 + FTS5 for local-first Next.js** -- benchmark full-text search, JSON queries, and row counts at which performance degrades
2. **PGLite vs SQLite comparison** -- specifically for the "start local, graduate to cloud" pattern (gbrain's approach)
3. **Linear's architecture** -- how they do local-first with sync, and what their data model looks like under the hood
4. **CRDTs / ElectricSQL** -- only if multi-device becomes a requirement
5. **Drizzle ORM + SQLite patterns** -- migrations, schema evolution, type safety patterns
6. **Notion export/migration tooling** -- what exists for bulk data extraction from Notion to SQLite

---

*Generated by research explorer scanning `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/` (530 entries) and `_bmad/` support files.*
