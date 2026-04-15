# LLM Knowledge Bases — "Markdown is the programming language of the AI era"

> **@karpathy (Andrej Karpathy) — 2026-04-03**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/karpathy/status/2039805659525644595) + [GitHub Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) |
| Author | @karpathy — Andrej Karpathy, ex-OpenAI/Tesla AI, independent educator & researcher |
| Date | 2026-04-03 |
| Topics | llm-wiki, knowledge-management, obsidian, rag-alternative, markdown |
| Type | Thread + Long-form Gist (Idea File) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **LLMs as Knowledge Compilers, not just Code Generators** — Karpathy's central thesis: "A large fraction of my recent token throughput is going less into manipulating code, and more into manipulating knowledge." The shift is from Vibe Coding (Feb 2025) to Agentic Engineering (Jan 2026) to now Knowledge Curation (Apr 2026). Each step moves humans further from execution toward strategic steering. The LLM doesn't just answer questions — it builds and maintains a persistent, compounding wiki artifact.

2. **3-Layer Architecture: Raw Sources / Wiki / Schema** — Clean separation of concerns. `raw/` is immutable source material (human-curated). `wiki/` is the LLM-owned, LLM-maintained knowledge layer (entities, concepts, comparisons, synthesis). The Schema (e.g., CLAUDE.md) is the co-evolved configuration that disciplines the LLM into a structured maintainer rather than a generic chatbot. This maps directly to our orchestrator architecture.

3. **3 Core Operations: Ingest / Query / Lint** — Ingest: new source arrives, LLM reads it, writes summary, updates index, touches 10-15 cross-referenced pages. Query: LLM searches wiki, synthesizes answer with citations, and critically files good answers back into the wiki (explorations compound). Lint: periodic health check for contradictions, orphan pages, missing cross-references, data gaps. This trio formalizes what many power users do ad-hoc.

4. **RAG is fundamentally flawed for knowledge work** — The core critique: RAG re-derives knowledge at every query. No accumulation, no compounding. Subtle questions requiring 5+ document synthesis get the same fragmented treatment every time. The wiki pattern compiles knowledge once and keeps it current — cross-references are pre-built, contradictions are pre-flagged, synthesis reflects everything read so far.

5. **"Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase"** — The human never writes the wiki directly. The LLM edits while the human browses in real-time via Obsidian — following links, checking graph view, reading updated pages. This redefines the human-AI collaboration: human curates sources and asks questions, LLM handles all bookkeeping, filing, cross-referencing, and maintenance.

6. **Markdown + Git as the universal substrate** — "Just markdown + git" gives you version history, branching, collaboration, and diffing for free. No proprietary formats, no vendor lock-in, no database migrations. The format is both human-readable and LLM-native. This is the strongest argument for markdown as infrastructure, not just documentation.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | This is the architectural reference for what we are already building. Our `research/catalogue/` is a wiki layer. The orchestrator's CLAUDE.md is the schema. The `/ingest-*` skills are ingest operations. What we lack: formalized Query and Lint operations, and the compounding loop where good query results get filed back into the catalogue. Karpathy's pattern validates and extends our approach. Maps to every Master Blueprint principle — especially #1 (orchestration layer as compounding asset), #3 (context is zero-sum, pre-compile it), and #7 (build what you need with simple tools). |
| **Actionable** | 9/10 | Concrete next steps: (1) Formalize `/lint` as a skill that checks for orphan pages, missing cross-references, and contradictions across the catalogue. (2) Add a "file back" step to query operations so synthesized answers become catalogue entries. (3) Model our `INDEX.md` more explicitly on Karpathy's index.md pattern with one-line summaries per entry. (4) Consider Obsidian graph view for visualizing catalogue structure. (5) Evaluate `qmd` (Tobi Lutke's local search) and `llm-knowledge-bases` plugin for tooling. |

---

## Full Content

### The Gist — LLM Knowledge Bases (Idea File)

Karpathy published a comprehensive "Idea File" describing a pattern where LLMs serve as knowledge compilers maintaining persistent markdown wikis. The full gist runs ~3,500 words. Core argument:

**The Problem with RAG:**
- Classic RAG retrieves relevant chunks at query time and generates answers
- No accumulation effect — LLM rediscovers knowledge with every question
- Subtle questions requiring synthesis across 5+ documents get the same fragmented treatment each time
- NotebookLM, ChatGPT file uploads, most RAG systems work this way
- Nothing is built, nothing compounds

**The Wiki as Persistent Artifact:**
Instead of querying raw documents every time, the LLM builds and maintains a persistent wiki:

- Structured, interlinked collection of markdown files
- Sits between the user and raw sources
- On new source: LLM reads, extracts, **integrates** into existing wiki
- Updates entity pages, revises topic summaries
- Notes contradictions to existing findings
- Strengthens or challenges the evolving synthesis

> "The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read."

**3-Layer Architecture:**

| Layer | Contents | Owner |
|-------|----------|-------|
| **Raw Sources** (`raw/`) | Articles, papers, images, data — immutable | Human (curates) |
| **Wiki** (`wiki/`) | index.md, log.md, entities/, concepts/, sources/, comparisons/, synthesis/, overview.md | LLM (writes & maintains) |
| **Schema** (e.g., CLAUDE.md) | Structure, conventions, workflows for ingest/query/lint | Co-evolved (human + LLM) |

**3 Operations:**

| Operation | What happens |
|-----------|-------------|
| **Ingest** | LLM reads source, writes summary page, updates index, updates 10-15 cross-referenced entity/concept pages, appends to log |
| **Query** | LLM searches relevant pages, synthesizes answer with citations. Good answers filed back as new wiki pages — explorations compound |
| **Lint** | Periodic health check: contradictions, stale claims, orphan pages, missing cross-references, data gaps, suggested new sources |

**Indexing & Navigation:**

- `index.md`: Catalogue of all wiki pages with links, one-line summaries, metadata. LLM reads index first, drills down to relevant pages. Works surprisingly well at moderate scale (~100 sources, ~hundreds of pages). Avoids embedding-based RAG infrastructure entirely.
- `log.md`: Append-only chronological record of operations. Consistent prefix format for Unix tool parsing.

**Role Separation:**

| Role | Human | LLM |
|------|-------|-----|
| Curate sources | Yes | -- |
| Explore & ask questions | Yes | -- |
| Summarize | -- | Yes |
| Cross-reference | -- | Yes |
| Filing & bookkeeping | -- | Yes |
| Wiki maintenance | -- | Yes |
| Think about what it means | Yes | -- |

> "You never (or rarely) write the wiki yourself — the LLM writes and maintains all of it."

**The Compiler Analogy:**

| Compiler Concept | Wiki Equivalent |
|------------------|-----------------|
| Source Code | `raw/` documents |
| Compiler | LLM |
| Executable | Wiki |
| Tests | Health Checks / Lint |
| Runtime | Queries |

**Why It Works:**
- "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping."
- Humans abandon wikis because maintenance overhead grows faster than utility
- LLMs don't get bored, don't forget cross-references, can touch 15 files in one pass
- Maintenance cost approaches zero, so the wiki stays maintained

**Historical Reference — Vannevar Bush's Memex (1945):**
- Personal, curated knowledge store with associative trails between documents
- Bush's vision was closer to this pattern than what the web became
- Private, actively curated, connections between documents as valuable as documents themselves
- What Bush couldn't solve: who does the maintenance? The LLM solves this.

**Design Principles:**
1. Intentionally abstract — describes the pattern, not a specific implementation
2. Modular — everything optional, take what you need
3. Co-evolution — schema developed together with the LLM
4. Domain-agnostic — adaptable to any knowledge domain
5. Just markdown + git — version history, branching, collaboration for free

> "The right way to use this is to share it with your LLM agent and work together to instantiate a version that fits your needs. The document's only job is to communicate the pattern."

### The X Post

Original post announcing the gist, framing it as "Markdown is the programming language of the AI era." The post went viral, trending on X under AI/Tech topics. Karpathy positions this as the natural evolution of his trajectory: Vibe Coding (Feb 2025) -> "Never felt this behind" (Dec 2025) -> Agentic Engineering (Jan 2026) -> LLM Knowledge Bases (Apr 2026).

---

## Notable Replies

> **@staborobot (Steph Ango, Obsidian CEO)**: Recommends explicit vault separation — "personal vault" stays high-signal, human-curated with known content origins. Separate "messy vault" for agent-generated material. Only after human review do artifacts move to the personal vault. Prevents contamination of curated knowledge with unverified AI content.
> *Critical architectural insight: the trust boundary between human-curated and agent-generated knowledge. Directly relevant to our catalogue design — we need a similar boundary.*

> **@omarsar0 (Elvis Saravia, DAIR.AI)**: "I have also been obsessed with building LLM knowledge bases. LLMs are excellent at curating and searching (finding connections) once data is stored properly."
> *Validation from a respected AI research curator. See also: his own post on Obsidian + agent knowledge bases (catalogued separately).*

> **@itsolelehmann (Ole Lehmann)**: "Whoever packages this for normal people is sitting on something massive. One app that syncs with the tools you already use — your bookmarks, your read-later app, your podcast app, your saved threads."
> *Product opportunity signal. The gap between Karpathy's power-user pattern and a consumer product is where the money is.*

> **@eugenalpeza (Eugen Alpeza, Edra)**: "The jump from personal research wiki to enterprise operations is where it gets brutal."
> *Enterprise scalability concern. Single-user wiki is solved; multi-user, multi-agent wiki with access control, verification, and conflict resolution is not.*

> **@zaboravlje (Ziga Drev, OriginTrail)**: Wiki is local, unverifiable, limited to one agent. Problematic when scaling to multi-agent systems.
> *Identifies the fundamental limitation: single-agent, single-machine knowledge. No federation, no verification, no shared truth.*

> **Community consensus**: The pattern resonated because it names something many power users were already doing intuitively but never formalized. The gist provided the missing architectural reference.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f | The full idea file — canonical reference for the LLM Wiki pattern | `/ingest-article` |
| https://github.com/rvk7895/llm-knowledge-bases | Claude Code plugin implementing the pattern: `/kb-init`, `/kb compile`, `/kb query`, `/kb lint` | `/ingest-article` |
| https://github.com/tobi/qmd | Tobi Lutke's on-device markdown search engine — hybrid BM25 + vector + LLM re-ranking, all local | `/ingest-article` |
| https://x.com/itsolelehmann/status/2040119257581646030 | Ole Lehmann's thread on productizing the pattern — consumer market angle | `/ingest-post` |
| https://antigravity.codes/blog/karpathy-llm-knowledge-bases | Detailed breakdown of the architecture with additional analysis | `/ingest-article` |
| https://academy.dair.ai/blog/llm-knowledge-bases-karpathy | DAIR.AI's perspective on the pattern from research curation angle | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| **Obsidian** | Viewing IDE for the wiki — graph view, web clipper, Marp slides, Dataview plugin | No |
| **llm-knowledge-bases** (rvk7895) | Claude Code plugin implementing the full pattern with `/kb-init`, `/kb compile`, `/kb query`, `/kb lint` commands. Three query modes: Quick (index only), Standard (wiki + web), Deep (multi-agent) | No |
| **qmd** (Tobi Lutke) | On-device search engine for markdown. Hybrid BM25 + vector + LLM re-ranking. CLI + MCP server. All local, no cloud dependency | No |
| **Obsidian Web Clipper** | Browser extension converting web articles to markdown for ingest into raw/ | No |
| **Marp** | Markdown-to-slide-deck renderer, Obsidian plugin for presenting wiki content | No |
| **Dataview** (Obsidian plugin) | Query engine over page frontmatter — tags, dates, source counts | No |
| **NotebookLM** | Mentioned as example of flawed RAG approach — no knowledge accumulation | No |

---

## Karpathy's Evolution Arc

| Date | Concept | Shift |
|------|---------|-------|
| Feb 2025 | Vibe Coding | Generate code without reviewing — just accept and ship |
| Dec 2025 | "Never felt this behind" | Magnitude-9 earthquake signal — AI capabilities accelerating |
| Jan 2026 | Agentic Engineering | Humans write <1% of code, orchestrate agents instead |
| **Apr 2026** | **LLM Knowledge Bases** | **LLMs manage knowledge, not just code. Developer becomes curator.** |

Each shift moves the human further from mechanical execution toward strategic steering. The LLM Wiki pattern is the most recent — and most general — expression of this trajectory.

---

## Application Domains

| Domain | Example Use Case |
|--------|-----------------|
| **Personal** | Goals, health, psychology, self-improvement — journals, articles, podcast notes |
| **Research** | Weeks/months of deep research — papers, reports building a wiki with evolving thesis |
| **Book reading** | Chapter filing, character/theme/plot pages, companion wiki |
| **Business/Team** | Internal wiki from Slack threads, meeting transcripts, project docs, customer calls |
| **Competitive Analysis** | Due diligence, market research |
| **Our orchestrator** | Research catalogue + devlog + context files already follow this pattern. Formalize with Ingest/Query/Lint. |
