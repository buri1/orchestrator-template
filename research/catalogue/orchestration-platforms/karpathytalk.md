# KarpathyTalk

> **A positive developer community for builders and agents — a minimalist social platform where every post, thread, and interaction is first-class accessible to LLM agents via JSON and Markdown APIs.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration (Agent-Native Social Substrate) |
| Repository | [github.com/karpathy/KarpathyTalk](https://github.com/karpathy/KarpathyTalk) / Live: [karpathytalk.com](https://karpathytalk.com/) |
| GitHub Stars | N/A at time of analysis (repo access 404 via gh API — mirrored at [anAirdrop/karpathytalk](https://github.com/anAirdrop/karpathytalk)) |
| Publisher | Andrej Karpathy (solo; co-founder OpenAI, former Tesla AI director, Eureka Labs) |
| License | Open source (unspecified in excerpted README, likely MIT per Karpathy convention) |
| Tech Stack | Go 1.26+, SQLite (modernc.org/sqlite pure-Go driver), htmx, goldmark (GFM), GitHub OAuth2, server-side Go templates |
| Maturity | 🟡 Early (live deployment at karpathytalk.com, ~50/50 Claude Code + OpenAI Codex authored) |
| Last Analyzed | 2026-04-11 |

---

## Burak's Notes

> *Second Karpathy experiment in "infrastructure for agents." First was AgentHub (March 2026, taken down same day) — a bare-git-DAG + message board for code coordination. KarpathyTalk is the same thesis applied to **discourse**: strip social networks down to what agents actually need (machine-readable JSON/Markdown, open APIs, no walled garden), add the human-legible Twitter-like layer on top. The architectural continuity with AgentHub is striking: Go 1.26 + SQLite (modernc.org pure-Go) + single binary — Karpathy has converged on this stack for agent infrastructure. Note: karpathy explicitly said the code was ~50/50 Claude Code + OpenAI Codex — so this is also a live data point on "what can an experienced human+agent pair build in a weekend." For us, the interesting question is whether this becomes the default "community layer" for agents to publish discoveries, the way arxiv-sanity became the paper layer. If we ever want agent-to-agent discovery or agent-to-human publishing, this stack is the reference. Not deployable for us today, but the **JSON+Markdown dual-API pattern** is directly transferable to anything we publish — it's literally the same pattern as our catalogue (JSON sidecars in `_bmad/ingest-discoveries/` + Markdown entries in `research/catalogue/`). Karpathy independently arrived at the same approach.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Validates JSON+Markdown dual-API content pattern we already use for catalogue; could host our ADOPTABLE-PATTERNS or public catalogue as a feed once we want agent-to-human publishing; not needed today |
| **Novelty** | 7/10 | "Social network where LLM agents are first-class users" is a fresh framing; most platforms bolt on an API afterward — Karpathy designed agent consumption as the default. Combined with AgentHub, this is now "Karpathy's stack for agent infrastructure": Go + SQLite + single binary + git/markdown as the data layer |
| **Actionable** | 5/10 | Not deployable as-is for our workflow. But the dual-surface pattern (every page has `.md` and `.json` variants) is copy-pasteable. `goldmark` for GFM rendering is worth noting. Rate limiting scheme (token-bucket with per-endpoint rules) is a clean reference |

---

## Overview

KarpathyTalk is Andrej Karpathy's second public experiment in "what does infrastructure look like when agents are first-class users?" — following [AgentHub](./agenthub-karpathy.md) (March 2026). Where AgentHub asked "what does GitHub look like without human ergonomics?", KarpathyTalk asks the same question about social networks: what does Twitter look like when an LLM is the primary reader?

The answer is a minimalist, Twitter-like developer community platform built as a single Go binary with embedded SQLite. Users post long-form Markdown content (GFM with syntax highlighting), can like/repost/quote/reply/follow, and have revision history on every post. The distinguishing feature is that **every content surface has three parallel representations**: HTML for humans, Markdown (`.md`) for LLM agents and humans, and JSON (`/api/*`) for programmatic consumption. RSS feeds (`.xml`) round out the export formats. Karpathy explicitly designed the platform so that agents can fetch timelines, parse posts, follow users, and create content programmatically — the same affordances human users have.

The core philosophy rejects walled gardens: "social data should not be locked behind walled gardens." The platform is deployed live at [karpathytalk.com](https://karpathytalk.com/), and Karpathy has stated the code was written approximately 50/50 by Claude Code and OpenAI Codex — making this itself a datapoint about agent-assisted greenfield development.

---

## Technical Architecture

```
karpathytalk architecture

+------------------+          +---------------------+
|   Browser (HTML) | <------> |  karpathytalk       |
|   htmx UI        |          |  (single Go binary) |
+------------------+          |                     |
                              |  +---------------+  |
+------------------+          |  | SQLite DB     |  |
|   LLM Agent      | <------> |  | (karpathy     |  |
|   /api/*.json    |          |  |  talk.db)     |  |
|   /posts/X.md    |          |  +---------------+  |
|   /feed.xml      |          |                     |
+------------------+          |  +---------------+  |
                              |  | goldmark GFM  |  |
+------------------+          |  | renderer      |  |
|   GitHub OAuth2  | -------> |  +---------------+  |
|   (auth only)    |          |                     |
+------------------+          |  +---------------+  |
                              |  | token-bucket  |  |
                              |  | rate limiter  |  |
                              |  +---------------+  |
                              |                     |
                              |  +---------------+  |
                              |  | /uploads/     |  |
                              |  | (local disk,  |  |
                              |  |  5MB images)  |  |
                              |  +---------------+  |
                              +---------------------+
                                        |
                              Caddy (TLS) + systemd
                                        |
                                 Linux VPS
```

### Tech Stack Details

| Component | Choice | Why |
|-----------|--------|-----|
| Language | Go 1.26+ | Single-binary deployment, strong stdlib HTTP |
| Database | SQLite via `modernc.org/sqlite` | Pure-Go driver, no CGo, embedded, WAL mode for concurrent reads |
| Frontend | htmx + server-side Go `html/template` | No SPA, no bundler, server rendering |
| Markdown | `goldmark` (GFM) | Syntax highlighting, standard dialect, agent-readable output |
| Auth | GitHub OAuth2 | Single provider, no password management |
| Reverse proxy | Caddy | Auto-TLS, zero config |
| Process | systemd | Standard Linux service management |

Note: identical stack to AgentHub — Karpathy has converged on Go + SQLite + single-binary as his default for agent infrastructure experiments.

### Three Parallel Surfaces

Every content object is exposed in three formats:
- **HTML** at `/` — human-friendly htmx UI
- **Markdown** at `.md` suffix — raw GFM for humans copying into notes or LLMs consuming as context
- **JSON** at `/api/*` — machine-readable REST
- **RSS** at `.xml` — chronological subscription

This is the pattern we should notice: **content-negotiation by URL suffix, not HTTP `Accept` header**. That's deliberate — agents are easier to point at `.md` URLs than to configure content negotiation.

### Rate Limiting (Token Bucket, Per-Endpoint)

| Endpoint Class | Rate | Burst |
|----------------|------|-------|
| Auth | 0.5 req/sec | 20 |
| Read / API | 2.0 req/sec | 60 |
| Write | 1.0 req/sec | 20 |
| Page views | 4.0 req/sec | 120 |
| Posts (hourly) | 30/hour | — |
| Replies (hourly) | 60/hour | — |

### Content Limits

- Post: 10,000 characters
- Reply: 5,000 characters
- Image upload: 5MB (PNG, JPEG, GIF, WebP)

### Setup

```bash
# 1. Register GitHub OAuth App (homepage http://localhost:8080, callback /auth/callback)
# 2. Export env vars
export GITHUB_CLIENT_ID=...
export GITHUB_CLIENT_SECRET=...
export BASE_URL=https://karpathytalk.com

# 3. Build
go build -o karpathytalk ./cmd/karpathytalk

# 4. Run
./karpathytalk -addr :8080 -db karpathytalk.db
```

Production deployment paths per the README: `/opt/karpathytalk/` (binary), `/var/lib/karpathytalk/` (data), `/etc/karpathytalk.env` (config).

---

## Publisher Background

Andrej Karpathy — co-founder of OpenAI, former Tesla Director of AI (led Autopilot), currently building Eureka Labs and publishing educational content through `nn-zero-to-hero`, `nanoGPT`, `nanochat`, `autoresearch`, and `KarpathyTalk`. Throughout 2026 he has been publishing a series of minimal experiments exploring "what does software look like when agents are users?" — AgentHub (git-for-agents, March 2026), autoresearch (agent-driven ML research, March 2026), the LLM Wiki knowledge base post (April 2026, see [karpathy-llm-wiki-knowledge-bases.md](../posts/2026-04/karpathy-llm-wiki-knowledge-bases.md)), and now KarpathyTalk. The throughline is **stripping human-centric complexity from platforms and exposing Markdown + JSON as the default data format**.

---

## What's Valuable for Us

1. **Dual-surface content pattern (HTML + Markdown + JSON)** — We already do something similar with `_bmad/ingest-discoveries/*.json` sidecars paired with `research/catalogue/**/*.md` entries. Karpathy validates the pattern by shipping a live platform on it. If we ever build a public-facing catalogue viewer, this is the reference: URL-suffix content negotiation, every resource has `.md`, `.json`, and HTML URLs.

2. **Go + SQLite + single-binary convergence** — Second time Karpathy has shipped this stack (AgentHub was the first). This is becoming the default for "small but agent-legible infrastructure." If we ever need to build a tiny hub service (job board for agents, publishing surface, etc.), this is the path of least resistance.

3. **goldmark for GFM rendering** — Cleanly produces markdown that agents can consume downstream. Notable that Karpathy chose GFM-with-syntax-highlighting, not raw MD or a custom dialect.

4. **Token-bucket rate limiter with per-endpoint rules** — Clean reference implementation pattern. The 4-tier split (auth / read / write / page-views) is a sensible default for any agent-serving API.

5. **"~50/50 Claude Code + OpenAI Codex"** — This entire platform is itself a data point for "what can a world-class human ship with two frontier agents in parallel." Worth referencing when pitching agent-assisted greenfield builds to clients.

6. **GitHub OAuth-only auth** — Zero password management, immediate trust graph bootstrapping from GitHub. Good pattern for any dev-facing tool.

---

## What's NOT Relevant

- **Social graph primitives (likes/reposts/follows)** — Not useful for our orchestrator; we have no "community" to model. Our agents don't need to follow each other.
- **Revision history on posts** — We already have git for this.
- **Image uploads** — Our catalogue is text-first; no need for an image pipeline.
- **htmx frontend** — We're not building a UI for this system. If we adopt the backend pattern, we'd pair it with our own frontend (or just expose JSON/MD).
- **Running it as-is** — It's a social platform, not an orchestration tool. We don't need a social feed.

---

## Future Use Cases

### Phase 3 (Days 60-90): Public catalogue publication
If/when we publish the `research/catalogue/` publicly, KarpathyTalk's dual-surface pattern (`/tool-x` renders HTML, `/tool-x.md` renders markdown, `/api/tools/tool-x` returns JSON) is the reference. Our existing Markdown + JSON sidecar pipeline already has the data shape — we'd just need a thin Go/TypeScript server to expose it.

### Phase 4+ (Days 90+): Agent-to-agent discovery layer
If we ever want agents to publish findings to other agents (or to a human audience), KarpathyTalk is the closest reference platform to fork or mimic. More realistically: we adopt the **content-negotiation-by-URL-suffix** pattern into whatever we build.

### Immediate: validate catalogue sidecar architecture
This entry itself proves the pattern: Karpathy independently converged on "JSON for machines, Markdown for humans AND machines, HTML for humans only." We've been doing this since the catalogue was created. Treat this as confirmation we're on the right path.

---

## Connections

- **[AgentHub (Karpathy)](./agenthub-karpathy.md)** — same author, same tech stack (Go 1.26 + SQLite + single binary), same philosophy (strip to what agents need). AgentHub = git-for-agents. KarpathyTalk = Twitter-for-agents.
- **[Karpathy LLM Wiki Knowledge Bases](../posts/2026-04/karpathy-llm-wiki-knowledge-bases.md)** — Karpathy's other April 2026 thesis that "Markdown is the programming language of the AI era." KarpathyTalk is that thesis deployed as a product.
- **[autoresearch](https://github.com/karpathy/autoresearch)** — Karpathy's agent-driven ML research project. Plausible first use case for KarpathyTalk: a social feed where autoresearch agents post findings.
- **[AGENTS.md](../agent-protocols/agents-md.md)** — same "make content machine-readable by convention" philosophy.
- **nanochat / nn-zero-to-hero** — Karpathy's track record of minimal reference implementations designed to be cloned and extended.

---

## Key Takeaway

> **Karpathy's second agent-infrastructure experiment (after AgentHub) converges on Go 1.26 + SQLite + single-binary + goldmark-markdown-everywhere — and validates by independent arrival that our own JSON+Markdown dual-surface catalogue architecture is the right pattern for agent-legible content.**
