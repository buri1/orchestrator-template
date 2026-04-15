# GBrain — Garry Tan's Opinionated OpenClaw/Hermes Agent Brain

> **Personal knowledge brain for AI agents: markdown-files-in-git as source of truth, Postgres + pgvector hybrid search, compiled-truth + append-only timeline per page, agent reads brain before every response and writes to it after every conversation. "Markdown is the programming language of the AI era" deployed as a shipped product by the CEO of Y Combinator.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context (with harness overlap) |
| Repository | https://github.com/garrytan/gbrain |
| GitHub Stars | 3,678 (as of 2026-04-11) — repo created 2026-04-05, ~613 stars/day |
| Forks | 414 |
| Publisher | Garry Tan (President & CEO, Y Combinator) — solo founder repo, MIT licensed |
| License | MIT |
| Tech Stack | TypeScript + Bun + PGLite (embedded Postgres 17.5 via WASM) OR Supabase Postgres + pgvector + pg_trgm + OpenAI text-embedding-3-large + Claude Haiku (multi-query expansion) |
| Runtime targets | CLI (`gbrain`), MCP stdio server, Remote MCP (Supabase Edge Function), TypeScript library, OpenClaw bundle plugin |
| Family | `bundle-plugin` (OpenClaw plugin API `>=2026.4.0`) |
| Maturity | 🟢 Shipping (v0.7 in active release, 6-day-old CHANGELOG is 25KB, TODOS.md is 6KB) |
| Last Analyzed | 2026-04-11 |

---

## Burak's Notes

> *(Reserved for your observations — agents won't overwrite this section.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | This is the single strongest "Great Convergence" datapoint we've catalogued. Garry Tan (YC CEO, ~800K X followers) independently built and shipped the exact pattern Karpathy described one week earlier — markdown-files-in-git as the source of truth, a retrieval layer bolted on top, an AI agent reading-before-responding and writing-after-learning. It converts Karpathy's LLM Wiki thesis from "interesting post" to "shipped product by the most-watched founder in YC's orbit." For us, the brain-first lookup loop, the compiled-truth-on-top + append-only-timeline-at-bottom page schema, the 3-layer search with RRF fusion, and the `ingest/query/maintain/enrich/briefing/migrate/setup` skill taxonomy are all directly adoptable to our research catalogue (`research/catalogue/`, 529 entries, `_bmad/ingest-ledger.json`) with minimal code changes. The 3-file meta-harness architecture — mutable agent, markdown playbook (`GBRAIN_SKILLPACK.md`), stable substrate — is the same shape AutoAgent, AutoKernel, and Hermes-Wiki ship. Docking score with the Harness Convergence Wave synthesis is nearly perfect: tag it as datapoint #17 in the wave. |
| **Novelty** | 8/10 | Not the first agent-PKM in the catalogue — Obsidian-Claude-PKM (1.3K⭐), Hermes-Wiki (73⭐), Claude-Mem (39K⭐), Letta, CASS, Beads already cover parts of the surface — but gbrain is the first one that is (a) shipped by a mainstream startup-world figure, (b) built around a pluggable BrainEngine interface that runs real Postgres locally via PGLite+WASM with zero setup, (c) ships 7 integration recipes as markdown-executable "skills" ("Homebrew for personal AI"), (d) explicitly designed to be installed by an AI agent reading the README, (e) combines compiled_truth versioning + append-only timeline + RRF hybrid search + 3-tier chunking (recursive/semantic/LLM-guided) in one coherent product. The "markdown is code... the recipe IS the installer" framing in `THIN_HARNESS_FAT_SKILLS.md` is the clearest articulation of our own thin-orchestrator / fat-markdown-skill philosophy we've seen. The BrainEngine pluggable-backend pattern (`'pglite'` or `'postgres'`) with bidirectional `gbrain migrate --to supabase/pglite` is also novel — most memory tools lock you into a single backend. |
| **Actionable** | 9/10 | High actionability on three distinct axes. (1) **Drop-in trial for Burak's brain:** `bun add -g github:garrytan/gbrain && gbrain init && gbrain import ~/Desktop/code2/orchestrator/research/catalogue/` — zero infra, 2-second PGLite brain, searchable within an hour over our existing 529-entry catalogue. Potentially replaces our bespoke INDEX.md regex+dedup flow. (2) **Pattern transplant:** the compiled-truth + append-only-timeline page schema, the `ingest_log` audit table, `page_versions` snapshot table, and `raw_data` JSONB sidecar pattern are directly adaptable to our practitioner X-activity files and devlog architecture. (3) **Skill-pack template:** `GBRAIN_SKILLPACK.md` + `docs/ethos/THIN_HARNESS_FAT_SKILLS.md` + `skills/*/SKILL.md` provide a ready-made template for writing our own L-Thread Skill Pack — we should steal the structure and adapt it to the orchestrator. The schema.sql (10,744 bytes, 10 tables, HNSW + GIN + trgm indexes, trigger-based search_vector, RLS-with-BYPASSRLS check) is lift-and-shift quality if we ever need to persist the research catalogue in Postgres. |

---

## Overview

**GBrain** is a CLI + MCP server + TypeScript library + OpenClaw plugin that turns a directory of markdown files in a git repo into a searchable agent-queryable knowledge backbone. The thesis is "your AI agent is smart but it doesn't know anything about your life" — gbrain fixes that by making the agent **read the brain before every response and write to it after every conversation**, so the agent gets smarter every day.

Every page follows a fixed schema: a **compiled truth** section above a `---` separator (the current best understanding, rewritten when new evidence arrives) and an **append-only timeline** below (evidence trail, never edited, only appended). One page per person, one page per company, one page per concept, one page per deal. Tan's public deployment — the one the README is drafted around — has 10,000+ markdown files, 3,000+ people pages with compiled dossiers, 13 years of calendar data, 280+ meeting transcripts, and 300+ captured original ideas. An overnight "dream cycle" scans every conversation, enriches missing entities, fixes broken citations, and consolidates memory so the brain is smarter in the morning than it was the night before.

Architecturally, gbrain is a **contract-first** system: `src/core/operations.ts` (20KB) defines ~37 shared operations (get/put/search/query/link/tag/traverse/ingest/etc.), and both the CLI (`src/cli.ts`) and the MCP stdio server (`src/mcp/server.ts`) are **generated from the same operation definitions**. The BrainEngine interface (`src/core/engine.ts`) is pluggable: `createEngine('pglite')` spins up an embedded Postgres 17.5 via WASM with zero setup in two seconds, and `createEngine('postgres')` targets Supabase or any Postgres with pgvector. `gbrain migrate --to supabase|pglite` is bidirectional, so users start local and graduate to managed only when a brain exceeds ~1000 files. Embedding (`text-embedding-3-large`, 1536-dim), chunking (recursive / semantic / LLM-guided, 3-tier), and search fusion (vector + keyword + RRF + multi-query expansion + 4-layer dedup) are engine-agnostic and run above the engine.

The philosophy is explicit and documented in `docs/ethos/THIN_HARNESS_FAT_SKILLS.md` and `docs/ethos/MARKDOWN_SKILLS_AS_RECIPES.md`: **the binary is thin, the markdown is fat**. Skills (`skills/ingest/SKILL.md`, `skills/query/SKILL.md`, `skills/maintain/SKILL.md`, `skills/enrich/SKILL.md`, `skills/briefing/SKILL.md`, `skills/migrate/SKILL.md`, `skills/setup/SKILL.md`) are standalone markdown instruction sets the agent reads to learn how to behave. Integration recipes (`recipes/twilio-voice-brain.md`, `recipes/email-to-brain.md`, `recipes/x-to-brain.md`, `recipes/calendar-to-brain.md`, `recipes/meeting-sync.md`, `recipes/ngrok-tunnel.md`, `recipes/credential-gateway.md`) are "Homebrew for personal AI" — each recipe is a markdown file that tells the agent what credentials to ask for, how to validate them, and how to wire the integration. The recipe **is** the installer.

The README is aggressively agent-oriented: the "Start here" section is a 7-step GOAL block that Tan tells users to **copy-paste into OpenClaw or Hermes Agent**, which then installs gbrain, sets up the schema, imports the user's files, configures all integrations, and verifies each step. "Requires a frontier model. Tested with Claude Opus 4.6 and GPT-5.4 Thinking. Likely to break with smaller models." The setup skill targets **TTHW < 2 minutes** (time to hello world) for the zero-config PGLite path.

---

## Technical Architecture

### Contract-first operation generation

```
src/core/operations.ts       (single source of truth, 20,818 bytes, ~37 operations)
      │
      ├── src/cli.ts                     (thin CLI wrapper, 13,323 bytes)
      ├── src/mcp/server.ts              (thin MCP stdio wrapper)
      ├── supabase/functions/gbrain-mcp/ (remote MCP via Supabase Edge Function)
      └── test/parity.test.ts            (parity test: CLI ≡ MCP ≡ tools-json)
```

Adding a new operation (e.g. `backlinks`) requires a single edit to `operations.ts`; CLI, MCP, remote MCP, and the `gbrain --tools-json` discovery endpoint all pick it up automatically. The parity test asserts structural identity between the three surfaces.

### BrainEngine pluggable interface

```
┌─ CLI / MCP (thin wrappers) ─────────────────────────────────────┐
│                                                                   │
│  BrainEngine interface (src/core/engine.ts, 2,740 bytes)         │
│       │                                                           │
│  engine-factory.ts (871 bytes, dynamic imports)                  │
│       │                                                           │
│  ┌────┴────┐                                                      │
│  │         │                                                      │
│  PGLiteEngine (21,470 bytes)  PostgresEngine (22,173 bytes)      │
│  pglite-schema.ts (7,900)     schema.sql + schema-embedded.ts    │
│   │                            │                                 │
│  ~/.gbrain/brain.pglite       Supabase Pro ($25/mo, 8GB)         │
│  embedded PG 17.5 via WASM    Postgres + pgvector + pg_trgm      │
│  @electric-sql/pglite         Supavisor connection pooling       │
│                                                                   │
│        gbrain migrate --to supabase/pglite (bidirectional)      │
└──────────────────────────────────────────────────────────────────┘
```

Both engines implement **all 37 BrainEngine methods**, both run real Postgres (PGLite is not a separate SQL dialect), and `test/parity.test.ts` enforces that `searchKeyword` / `searchVector` behaviour is identical across them. RRF fusion, multi-query expansion, and 4-layer dedup run above the engine on `SearchResult[]` arrays, so they are shared between backends.

### Database schema (10 tables, Postgres + pgvector)

From `src/schema.sql` (10,744 bytes):

```
pages               — core content: slug UNIQUE, type, title, compiled_truth, timeline,
                      frontmatter JSONB, content_hash (SHA-256), trigger-maintained
                      search_vector tsvector (weighted A/B/C/C)
content_chunks      — chunk_text + embedding vector(1536) + chunk_source
                      ('compiled_truth'|'timeline') + HNSW cosine index
links               — from_page_id → to_page_id + link_type (knows, invested_in,
                      works_at, founded, references, ...) + UNIQUE(from, to)
tags                — page_id + tag, many-to-many
timeline_entries    — structured timeline rows: date, source, summary, detail
                      (triggers parent page to rebuild search_vector)
page_versions       — snapshot history for compiled_truth
raw_data            — sidecar JSONB per (page_id, source) — replaces `.raw/` JSON files
ingest_log          — audit trail: source_type, source_ref, pages_updated, summary
config              — brain-level settings (embedding_model, chunk_strategy, sync state)
files               — binary attachments in Supabase Storage / S3 / R2 / MinIO / local
                      storage_path UNIQUE + content_hash + mime_type + metadata JSONB
access_tokens       — bearer tokens for remote MCP (hashed, scoped, revocable)
mcp_request_log     — remote MCP usage log (token_name, operation, latency_ms, status)
```

Indexes: B-tree on `pages.type`, GIN on `frontmatter`, GIN on `search_vector`, GIN on `title gin_trgm_ops` (fuzzy slug resolution), HNSW on `content_chunks.embedding`.

Trigger-based `search_vector` is weighted: title A, compiled_truth B, timeline C, timeline_entries text C. Timeline entry updates touch the parent page to re-fire the trigger.

Row-Level Security is conditionally enabled: gbrain checks if the current role has `BYPASSRLS` (via `pg_roles.rolbypassrls`) and only enables RLS if yes, to avoid locking the user out when running as a non-privileged role.

### Chunking — 3 strategies

- **Recursive** (default, timeline, bulk import): 5-level delimiter hierarchy (paragraphs → lines → sentences → clauses → words), 300-word chunks with 50-word sentence-aware overlap, fast and lossless.
- **Semantic** (compiled truth): embeds each sentence, computes adjacent cosine similarities, applies **Savitzky-Golay smoothing** to find topic boundaries; falls back to recursive on failure.
- **LLM-guided** (high-value content, on request): pre-splits into 128-word candidates, asks Claude Haiku to identify topic shifts in sliding windows, 3 retries per window.

### Hybrid search — RRF fusion with multi-query expansion

```
Query: "when should you ignore conventional wisdom?"
         │
    Multi-query expansion (Claude Haiku)
    "contrarian thinking startups", "going against the crowd"
         │
    ┌────┴────┐
    │         │
  Vector    Keyword
  (HNSW     (tsvector +
  cosine)    ts_rank)
    │         │
    └────┬────┘
         │
    RRF Fusion: score = sum(1 / (60 + rank))
         │
    4-Layer Dedup
    1. Best chunk per page
    2. Cosine similarity > 0.85
    3. Type diversity (60% cap)
    4. Per-page chunk cap
         │
    Stale alerts (compiled truth older than latest timeline)
         │
    Results
```

The stale-alert step is a nice touch — if a page's `compiled_truth` was last updated before the latest `timeline_entries.date`, the result is flagged "needs re-compilation" so the agent knows to rewrite the summary in the next maintain cycle.

### File migration lifecycle (`gbrain files`)

Three-stage reversible migration for binary attachments:

```
Local files in git repo
  │
  ▼  gbrain files mirror <dir>
Cloud copy exists, local files untouched    (reversible: mirror removes cloud copy)
  │
  ▼  gbrain files redirect <dir>
Local files replaced with `.redirect` breadcrumbs (tiny YAML pointers)
  │                                            (reversible: `gbrain files restore`)
  ▼  gbrain files clean <dir> --yes
Breadcrumbs removed, cloud is the only copy   (IRREVERSIBLE)
```

Storage backends: S3-compatible (AWS S3, Cloudflare R2, MinIO), Supabase Storage, local filesystem. The file resolver (`src/core/file-resolver.ts`) handles fallback automatically: missing local → check `.redirect` breadcrumb → check `.supabase` marker → resolve to cloud URL. Code referencing files by path keeps working after migration.

### The brain-agent loop (the compounding thesis)

```
Signal arrives (meeting, email, tweet, link)
  → Agent detects entities (people, companies, ideas)
  → READ: check the brain first (gbrain search, gbrain get)
  → Respond with full context
  → WRITE: update brain pages with new information
  → Sync: gbrain indexes changes for next query
```

Every cycle adds knowledge. After a meeting, the agent enriches the person page. Next time that person comes up, the agent already has context. "You never start from zero."

### 7 integration recipes ("Homebrew for personal AI")

Each recipe is a markdown file with YAML frontmatter + setup instructions an agent reads and executes. Dependencies resolve automatically (e.g. `twilio-voice-brain` requires `ngrok-tunnel`; `email-to-brain` requires `credential-gateway`).

| Recipe | Bytes | Requires | What It Does |
|--------|-------|----------|-------------|
| `recipes/ngrok-tunnel.md` | 8,106 | — | Fixed URL for MCP + voice (ngrok Hobby $8/mo) |
| `recipes/credential-gateway.md` | 7,229 | — | Gmail + Calendar access (ClawVisor or Google OAuth) |
| `recipes/twilio-voice-brain.md` | 19,738 | ngrok-tunnel | Phone calls → brain pages (Twilio + OpenAI Realtime) |
| `recipes/email-to-brain.md` | 12,715 | credential-gateway | Gmail → entity pages (deterministic collector) |
| `recipes/x-to-brain.md` | 12,831 | — | Twitter → brain pages (timeline + mentions + deletions) |
| `recipes/calendar-to-brain.md` | 14,550 | credential-gateway | Google Calendar → searchable daily pages |
| `recipes/meeting-sync.md` | 12,166 | — | Circleback transcripts → brain pages with attendees |

### 7 skills (fat markdown, tool-agnostic)

| Skill | What the agent learns |
|-------|----------------------|
| `skills/ingest/` | How to import meetings, docs, articles; update compiled truth (rewrite, not append); append timeline; create cross-reference links |
| `skills/query/` | 3-layer search (keyword + vector + structured) with synthesis and citations; "brain doesn't have info on X" instead of hallucinating |
| `skills/maintain/` | Periodic health: contradictions, stale compiled truth, orphan pages, dead links, tag inconsistency, missing embeddings, overdue threads |
| `skills/enrich/` | Enrich pages from external APIs; raw data stored separately, distilled highlights go to compiled truth |
| `skills/briefing/` | Daily briefing: today's meetings with participant context, active deals with deadlines, time-sensitive threads |
| `skills/migrate/` | Universal migration from Obsidian (wikilinks → gbrain links), Notion (strip UUIDs), Logseq (block refs), plain markdown, CSV, JSON, Roam |
| `skills/setup/` | Set up GBrain from scratch: auto-provision Supabase via CLI, AGENTS.md injection, import, sync; TTHW < 2 min |

### 30 MCP tools (stdio + remote HTTP)

Generated from `operations.ts`. Local stdio via `gbrain serve`. Remote MCP via `scripts/deploy-remote.sh` → Supabase Edge Function with bearer-token auth (`access_tokens` table, hashed, scoped, revocable). Claude Code, Claude Desktop, Cursor, Windsurf, Perplexity Computer, Cowork are all supported; ChatGPT requires OAuth 2.1 (not yet implemented).

Core tools: `get_page`, `put_page`, `search`, `query`, `add_link`, `traverse_graph`, `sync_brain`, `file_upload`, `list_pages`, `delete_page`, `tag`/`untag`, `timeline`/`timeline-add`, `embed`, `doctor`, `stats`, `history`, `revert`, `config`.

### How it fits with OpenClaw / Hermes

`openclaw.plugin.json` declares gbrain as a `bundle-plugin` with `compat.pluginApi: ">=2026.4.0"`, exposing 7 skills and an MCP server (`./bin/gbrain serve`). GBrain is **world knowledge** (people, companies, deals, meetings, concepts, original thinking — long-term memory of what you know about the world). OpenClaw's agent memory (`memory_search`) is **operational state** (preferences, decisions, session context, how the agent should behave). Session context is **current conversation**. All three should be checked.

---

## Publisher Background

**Garry Tan** is the President & CEO of Y Combinator (since January 2023). Before YC, he co-founded Initialized Capital ($3.2B AUM) with Alexis Ohanian, was a Partner at Y Combinator from 2011-2015, and founded Posterous (acquired by Twitter 2012). He is one of the most-watched figures in the Silicon Valley startup ecosystem (~800K+ followers on X, frequent YC batch videos, "Founder-Mode" essays). His published portfolio from Initialized includes Coinbase, Instacart, Flexport, Cruise, Benchling, Patreon, and Standard Cognition.

The repo is **Tan's personal brain**, not a YC product. It is explicitly framed as "Garry's Opinionated OpenClaw/Hermes Agent Brain" — the README body says "I was setting up my OpenClaw agent and started a markdown brain repo." It is MIT-licensed and open to community PRs (`CONTRIBUTING.md`, fix-wave workflow documented in `CLAUDE.md`), and the CHANGELOG voice guidance explicitly says "write changelog entries that sell the upgrade, not document the implementation" — indicating Tan is treating this as a product he wants users to adopt, not a throwaway tool.

Credibility: **extremely high**. The repo went from zero to 3,678 stars in six days (repo created 2026-04-05, stars as of 2026-04-11, ~613 stars/day), forks 414, CHANGELOG.md is 25KB, TODOS.md is 6KB, `docs/` has a full directory tree, test suite has 23 unit test files + 4 E2E test files, the build produces a compiled Bun binary, and the project ships a coherent CLI + library + MCP + remote MCP + plugin in the same repo. The v0.7 release is shipping. This is a finished product, not a demo.

Also a strong public marker that the "LLM Knowledge Wiki" pattern has crossed from researcher-philosophy (Karpathy, 2026-04-03) into shipping founder-CEO infrastructure within one week. When Garry Tan publicly ships the same pattern as Karpathy and uses it daily, that changes its category from "interesting idea" to "consensus primitive."

---

## What's Valuable for Us

### 1. Direct trial for Burak's own brain (this week, ~30 minutes)

```bash
bun add -g github:garrytan/gbrain
cd ~/Desktop/code2/orchestrator
gbrain init                                        # PGLite, 2s, no config
gbrain import research/catalogue/ --no-embed       # index our 529 entries
gbrain import _bmad/x-activity/ --no-embed         # practitioner files
gbrain import _bmad/ingest-discoveries/ --no-embed # discovery sidecars
export OPENAI_API_KEY=sk-...
gbrain embed --stale                               # ~1 min per 1000 pages
gbrain query "what are the dominant themes in the 2026-04-11 ingest wave?"
gbrain query "who has validated the tmux+worktree+Claude Opus pattern?"
gbrain query "what is the harness convergence thesis?"
```

Estimated cost: ~$1-2 in OpenAI embeddings for our current catalogue. No Supabase, no Docker. If it works we might get a better search experience over our 529-entry catalogue than grep-over-INDEX.md provides.

### 2. Page schema lift-and-shift

The **compiled-truth + append-only-timeline** schema (upper section is best current understanding, lower section is evidence trail never edited, only appended) is a near-perfect match for our practitioner X-activity JSONs and our devlog. Right now our `_bmad/x-activity/<handle>.json` files mix "who this person is" with "what they tweeted this week" — adopting Tan's schema would cleanly separate the dossier from the timeline.

Adaptation plan:
- `_bmad/x-activity/<handle>.md` with compiled dossier on top, append-only tweet log below
- Frontmatter: `type: practitioner`, `tags: [x-activity, ...]`, `handle`, `followers`, `last_seen`
- `pi-orchestrator/_bmad/devlog.md` already uses append-only semantics — gbrain's `ingest_log` + `page_versions` tables would add audit trail and compiled-truth history without losing the raw evidence

### 3. Skill-pack template for L-Thread

`docs/GBRAIN_SKILLPACK.md` + `docs/ethos/THIN_HARNESS_FAT_SKILLS.md` + 7 `skills/*/SKILL.md` files are a ready-made template for writing our own **L-Thread Skill Pack**. The pattern: one skill file per agent concern (ingest, query, maintain, enrich, briefing, migrate, setup) — each a standalone instruction set the agent reads before operating. Our current `.claude/commands/*.md` are close but less structured; migrating to gbrain's layout would give us (a) one-line taxonomy per skill, (b) explicit WHEN-and-HOW-to-use each tool, (c) MECE coverage.

Steal specifically:
- The **7-step copy-paste GOAL block** in the README (STEP 1 INSTALL, STEP 2 DATABASE, STEP 3 SCHEMA, STEP 4 IMPORT, STEP 5 SEARCH, STEP 6 GO LIVE, STEP 7 INTEGRATIONS) as a template for our orchestrator onboarding
- The **"Verify each step before proceeding. If a step fails, stop and fix it."** framing — matches our E2E-as-gate rule from CLAUDE.md
- The **`gbrain doctor --json`** health-check CLI → port to our orchestrator as `/debug --json`

### 4. The `THIN_HARNESS_FAT_SKILLS.md` framing as a public manifesto

The essay at `docs/ethos/THIN_HARNESS_FAT_SKILLS.md` articulates our own architecture philosophy more clearly than we've ever written it down: **"Markdown is code... the recipe IS the installer"**. This is the single best external validation of the L-Thread "thin orchestrator + fat markdown prompts" approach we've seen. Worth reading in full before our next meeting-prep doc or blog post — it gives us ready-to-cite language for pitches to conservative German buyers who want to understand "why markdown instead of YAML" or "why no UI".

The companion essay `docs/ethos/MARKDOWN_SKILLS_AS_RECIPES.md` ("Homebrew for Personal AI") frames integration recipes as Homebrew formulas — a familiar metaphor for every developer. We should borrow this framing for the orchestrator's recipe system.

### 5. BrainEngine pluggable-backend pattern + PGLite for local-first

The pluggable `BrainEngine` interface with dynamic imports (`'pglite'` | `'postgres'`) and bidirectional `gbrain migrate --to supabase|pglite` is exactly the pattern we want for our own **state storage**. Right now we hardcode `_bmad/orchestrator-tmux-state.json` — but at Phase 3 we will need (a) local SQLite for dev, (b) Supabase for production, (c) a migration path. Gbrain shows how to do this without locking users in: same SQL, different driver, test parity enforced.

**PGLite itself** (`@electric-sql/pglite`, embedded Postgres 17.5 via WASM, 2-second boot, zero infra) is a significant find on its own. We catalogued `dolt.md` as "git-for-data" but dismissed it as overkill — PGLite is the opposite: **real Postgres with pgvector + pg_trgm + triggers** running locally in a single process with no network. If we ever want to give clients a "one-click local dev brain" this is the primitive.

### 6. 3-tier chunking + RRF fusion + stale-alert pattern

The chunking taxonomy (recursive / semantic / LLM-guided) with dispatch-by-content-type is smarter than one-size-fits-all chunking. Our research catalogue has markdown pages of very different shapes (short posts, long synthesis docs, massive X-activity feeds) — applying the same chunker to all of them is suboptimal.

The **stale-alert** step in hybrid search (compiled_truth older than latest timeline → flag as needs-recompile) is a pattern we have **not** seen elsewhere and is a genuinely novel idea for agent memory: make the staleness of compiled knowledge a first-class signal to the agent, so the maintain skill knows what to rewrite in its next pass.

### 7. Remote MCP via Supabase Edge Functions (reusable pattern)

`scripts/deploy-remote.sh` one-shot deploys a remote MCP server as a Supabase Edge Function with bearer-token auth (`access_tokens` table, hashed, scoped, revocable, with `mcp_request_log` audit table). This is a **clean reference architecture** for how to expose agent tools to third parties (Claude Desktop, Perplexity, Cowork) over HTTP without running our own server — directly applicable if OmniPort-HH ever needs a multi-client MCP gateway.

### 8. The "agent installs the tool by reading the README" pattern

The README's **copy-paste GOAL block** that the user drops into OpenClaw or Hermes Agent — which then installs gbrain, runs `gbrain init`, imports files, configures integrations, and verifies each step — is the clearest example we've seen of **an AI agent installing a tool by reading the README**. This is the natural endpoint of the "markdown is code" thesis: install instructions become executable. For our own tools (L-Thread orchestrator, omniport-hh dev harness) we should write README sections structured as agent-executable installers.

---

## What's NOT Relevant

### 1. The domain ontology is Garry's, not ours

The brain schema is optimized for a VC/startup-founder workflow: `people/`, `companies/`, `deals/`, `yc/`, `civic/`, `project/`, `concepts/`, `source/`, `media/`. Our research catalogue uses a different taxonomy (articles/posts/talks/agent-harnesses/orchestration-platforms/agent-memory/...) and our x-activity files use a different structure. We can adopt the **schema pattern** (compiled_truth + timeline + frontmatter) without adopting the **type names**.

### 2. Supabase Pro is optional but the dependency footprint is real

For the full "agent with voice and Twitter and Gmail" experience the README ships, you need ngrok Hobby ($8/mo), Supabase Pro ($25/mo), OpenAI API, Anthropic API, Twilio, Google OAuth. The local-only PGLite path is free but loses the remote MCP and integration recipes. This is fine for a personal brain but does not match our zero-infra-for-clients principle for client work. Use PGLite path only; do not build our commercial offering around a stack that requires $33+/mo in SaaS dependencies.

### 3. No worker isolation / no multi-agent orchestration

Gbrain is strictly a **single-user memory backbone**. It does not do agent-to-agent coordination, does not handle parallel workers, does not manage git worktrees, does not do review-fix loops, does not enforce E2E testing. It is the memory layer, not the harness. We still need L-Thread / Symphony / Scion / ACPX for the orchestration shape; gbrain fits *underneath* those as the shared knowledge store.

### 4. "Tested with Claude Opus 4.6" is aligned but fragile

The README explicitly says "Requires a frontier model. Tested with Claude Opus 4.6 and GPT-5.4 Thinking. Likely to break with smaller models." This matches our Opus-only rule, so it is not a blocker — but it is a concrete reminder that the pattern assumes frontier models and will not degrade gracefully if a client insists on Haiku-tier spend for the agent layer.

### 5. The "dream cycle" overnight agent requires always-on infra

Tan's description of the overnight dream cycle ("agent runs while I sleep, scans every conversation, enriches missing entities, fixes broken citations, consolidates memory") implies an always-on agent host with cron access. This is fine on a personal laptop with cmux open, but incompatible with our current orchestrator model where the agent only runs during a `./run-tmux.sh` session. For us, this is a Phase 3+ deployment pattern, not a Day 1 adoption.

### 6. Ontology enforcement is soft

Unlike Hermes-Wiki's explicit SCHEMA.md with required frontmatter fields and tag taxonomy, gbrain's schema recommendations live in `docs/GBRAIN_RECOMMENDED_SCHEMA.md` as prose guidance. There is no machine-checked lint. If we want strict validation we would still need to build our own linter on top — or combine gbrain with Hermes-Wiki's SCHEMA.md-enforced approach.

---

## Future Use Cases

### Phase 1 — Days 1-3 (this week)
- **Trial gbrain over our research catalogue**: `gbrain init` + `gbrain import research/catalogue/` + `gbrain query "..."`. If the search quality is better than grep-over-INDEX.md, graduate to real use.
- **Steal `THIN_HARNESS_FAT_SKILLS.md` framing**: copy language into our next meeting-prep doc and client pitches. "Thin harness, fat skills" is the single best English translation of our architecture.
- **Read `GBRAIN_SKILLPACK.md`** end-to-end and compare against our existing `.claude/commands/` taxonomy. Port the tightest skill-file structure.

### Phase 2 — Days 4-60
- **Adopt compiled_truth + timeline schema for practitioner X-activity files**: `_bmad/x-activity/<handle>.md` with dossier on top, timeline below. Use frontmatter spec from `docs/GBRAIN_RECOMMENDED_SCHEMA.md`.
- **Use gbrain as the retrieval layer for research synthesis**: when doing a new wave synthesis, `gbrain query "..."` across the catalogue to pull cross-references instead of hand-grepping. The 3-layer search + RRF + multi-query expansion should surface connections our current grep flow misses.
- **Port PGLite** as our local-dev state store for L-Thread (replacing `orchestrator-tmux-state.json`). Bidirectional migration to Supabase gives us a clean production path.

### Phase 3 — Days 60-90
- **Adopt the BrainEngine pluggable-backend pattern** for L-Thread's own state storage: one interface, local PGLite + remote Postgres implementations, parity-tested. This is the migration path from JSON-in-git to durable state.
- **Build an L-Thread Skill Pack** using gbrain's structure: `skills/ingest/`, `skills/query/`, `skills/maintain/`, `skills/enrich/`, `skills/briefing/`, `skills/migrate/`, `skills/setup/` as markdown files the orchestrator agents read before operating.
- **Deploy a remote MCP** for OmniPort-HH using gbrain's `scripts/deploy-remote.sh` pattern (Supabase Edge Function + bearer tokens + request log).

### Phase 4 — Days 90+
- **Personal brain for Burak**: ingest the orchestrator devlog, OmniPort-HH dev notes, cmux telemetry, X-activity files, meeting-prep docs, client pitches into gbrain as the single knowledge backbone. Query it from Claude Code, Claude Desktop, and cmux via MCP.
- **Research catalogue as gbrain brain**: once the pattern is proven, migrate `research/catalogue/` from flat markdown to a gbrain-managed brain. Keep markdown files in git as source of truth (gbrain's architecture preserves this); gain semantic search + link graph traversal + stale alerts + maintenance skills for free.
- **Client-brain SaaS**: combine PGLite + gbrain skills + our orchestrator → a "personal brain for every German KMU founder" product. Niche but defensible: same pattern as Tan's personal brain, adapted to DSGVO and opencode.de constraints.

---

## Cross-References (Catalogue Links)

### Primary wave ties (2026-04-11 Harness Convergence Wave)
- [Karpathy LLM Wiki Knowledge Bases](../posts/2026-04/karpathy-llm-wiki-knowledge-bases.md) — the thesis gbrain ships as a product; "Markdown is the programming language of the AI era"; 3-layer Raw/Wiki/Schema + 3-op Ingest/Query/Lint. Gbrain is the strongest real-world instantiation we've seen, from a mainstream startup-world figure, within one week of Karpathy's post.
- [omarsar0 LLM KB Diagram](../posts/2026-04/omarsar0-llm-knowledge-base-diagram.md) — Elvis's one-image distillation of the Karpathy pattern. The "Obsidian as IDE / LLM as programmer / wiki as codebase" framing applies 1:1 to gbrain.
- [Hermes-Wiki](../agent-harnesses/hermes-wiki.md) — the other shipped instantiation of the Karpathy pattern (source-verified wiki for Hermes Agent, 36 concept pages + SCHEMA.md + log.md). Hermes-Wiki is wiki-as-docs; gbrain is wiki-as-memory-backbone. Complementary patterns, not substitutes.
- [Harness Convergence Wave — 2026-04-11 Synthesis](../reference/synthesis-2026-04-11-harness-convergence-wave.md) — Gbrain is datapoint #17 in this wave (not in the original 16-entry manifest because it was discovered later in the same day). Update the synthesis to include it as the strongest "Karpathy wiki deployed in the wild" example.
- [nichochar "The Great Convergence"](../posts/2026-04/nichochar-the-great-convergence.md) — "very different companies have started moving towards the same product shape." Gbrain + Karpathy + Hermes-Wiki + Symphony + Scion + Aspire all shipped in 11 days. Nichochar's thesis just gained another instance.

### Adjacent agent-memory entries
- [Obsidian-Claude-PKM](./obsidian-claude-pkm.md) — same "markdown + agent reads/writes" pattern but personal productivity only; gbrain is more ambitious (people/company/deal schema + Postgres + MCP + remote server).
- [Claude-Mem](./claude-mem.md) — 39K⭐, AI-compressed session capture + ChromaDB; different axis (session memory vs world memory); complementary.
- [Letta / MemGPT](./letta.md) — "LLM-as-OS" self-editing memory; git-based Context Repositories validate the markdown-in-git approach gbrain takes to the next level.
- [CASS Memory System](./cass-memory-system.md) — 3-layer cognitive (episodic/working/procedural); gbrain is the world-knowledge equivalent; they are on different axes and could co-exist.
- [Beads](./beads.md) — Yegge's git-backed task memory with dependency graphs; similar "git is the database" philosophy; Beads is task-centric, gbrain is entity-centric.
- [Dolt](./dolt.md) — we dismissed as overkill; PGLite (gbrain's default) is a better local-first primitive than Dolt for agent memory.

### Adjacent orchestration / harness
- [OpenAI Symphony](../agent-harnesses/openai-symphony.md) — orchestration shape; gbrain is the memory shape that could sit underneath Symphony per-repo.
- [openclaw/acpx](../agent-harnesses/openclaw-acpx.md) — session client; `openclaw.plugin.json` in gbrain targets the same OpenClaw plugin API (`>=2026.4.0`). Adoption path: ACPX for sessions + gbrain for world memory.
- [AGENTS.md](../agent-protocols/agents-md.md) — gbrain's setup skill injects AGENTS.md automatically. Same convention, same purpose.

---

## Key Takeaway

> **Garry Tan shipped Karpathy's LLM Wiki thesis as a production personal brain in one week — contract-first pluggable-engine Postgres+pgvector with compiled-truth + append-only-timeline pages, 3-tier chunking, RRF hybrid search, 7 markdown skills, 7 markdown-executable integration recipes, and a copy-paste README-as-installer that an AI agent reads and runs. The "thin harness, fat skills" manifesto in `docs/ethos/THIN_HARNESS_FAT_SKILLS.md` is the clearest external validation of our own architecture we have ever seen. Trial it over `research/catalogue/` this week.**
