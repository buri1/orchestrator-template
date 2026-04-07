# AgentHub (Karpathy)

> **Agent-first collaboration platform. A bare git repo + message board, designed for swarms of AI agents working on the same codebase.**

| Field | Value |
|-------|-------|
| Category | :control_knobs: Orchestration |
| Repository | [github.com/karpathy/agenthub](https://github.com/karpathy/agenthub) (taken down same day; analyzed from fork) |
| GitHub Stars | N/A (removed within hours of release) |
| Publisher | Andrej Karpathy (solo; co-founder OpenAI, former Tesla AI director) |
| License | MIT |
| Tech Stack | Go 1.26, SQLite (modernc.org/sqlite, pure Go), bare git repo, git bundles, HTML dashboard |
| Maturity | :yellow_circle: Early (self-described "just a sketch, thinking...") |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *This is Karpathy thinking out loud in code about what the "GitHub for AI agents" looks like. The key insight is NOT the code (it's a sketch) -- it's the MENTAL MODEL. He's saying: agents don't need branches, PRs, or merges. They need a sprawling DAG of commits going in every direction, plus a message board. The platform is deliberately dumb -- culture comes from agent instructions, not platform enforcement. This maps almost perfectly to our federated architecture: thin deterministic infrastructure layer (the 70%), intelligence pushed to the edges (the 30%). The autoresearch connection is massive -- he's building "agent-first academia" where PhD-student-agents coordinate through a shared Git+message substrate. Compare with Gas Town's bead model and our L-Thread Orchestrator: all three independently arrived at "git as the coordination primitive" but Karpathy's version is the most radical simplification. No main branch. No PRs. No merges. Just a DAG and a bulletin board. This is the minimum viable multi-agent coordination surface.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Validates git-as-coordination-primitive; "platform is generic, culture comes from instructions" mirrors our CLAUDE.md / AGENTS.md approach; DAG-first model challenges conventional branch/PR assumptions |
| **Novelty** | 9/10 | No-main-branch, no-PR, no-merge paradigm is genuinely new; git bundles for agent-to-server transport; "leaves" as frontier discovery; the "agent-first academia" framing |
| **Actionable** | 6/10 | Sketch-quality code, not deployable as-is; but the architectural patterns (DAG navigation API, message board coordination, bundle-based transport) are immediately transferable concepts |

---

## Overview

AgentHub is Andrej Karpathy's vision for a "GitHub for AI agents" -- a collaboration platform where swarms of AI agents work on the same codebase. It was released briefly on GitHub before being taken down the same day, making this fork a rare window into Karpathy's thinking on agent infrastructure.

The core thesis is radical simplification: strip away everything that exists in GitHub for human ergonomics (branches, PRs, merge reviews, main branch protection) and replace it with what agents actually need: a bare git DAG they can push commits into and navigate, plus a message board for unstructured coordination. The platform is deliberately "dumb" -- it doesn't know or care what agents are optimizing. The "culture" (what agents post, how they format results, what experiments to try) comes from their instructions, not the platform. This is the context-engineering principle applied to infrastructure: the platform provides substrate, the prompts provide intelligence.

The first intended use case is organizing [autoresearch](https://github.com/karpathy/autoresearch), Karpathy's earlier project that emulates a single PhD student doing ML research. AgentHub would turn that into "an autonomous agent-first academia" -- a research community of PhD-student-agents where anyone on the internet can contribute their agent instance. The architecture is explicitly designed to be more general than this use case.

---

## Technical Architecture

```
agenthub architecture (~1,100 lines of Go)

+-------------------+     git bundles (HTTP POST)     +---------------------+
|   ah CLI          | -------------------------------->|  agenthub-server    |
|   (agent-side)    | <--------------------------------|  (single binary)    |
|                   |     git bundles (HTTP GET)       |                     |
|  - push HEAD      |                                  |  +---------------+  |
|  - fetch <hash>   |     JSON API                     |  | bare git repo |  |
|  - log/children/  | <------------------------------->|  | (repo.git)    |  |
|    leaves/lineage |                                  |  +---------------+  |
|  - diff           |                                  |                     |
|  - channels/post/ |                                  |  +---------------+  |
|    read/reply     |                                  |  | SQLite DB     |  |
+-------------------+                                  |  | (agenthub.db) |  |
                                                       |  +---------------+  |
      ~/.agenthub/config.json                          |                     |
      (server_url, api_key, agent_id)                  |  +---------------+  |
                                                       |  | HTML Dashboard|  |
                                                       |  | (auto-refresh)|  |
                                                       |  +---------------+  |
                                                       +---------------------+
```

### Two Binaries

1. **`agenthub-server`** -- the hub. One Go binary, one SQLite database, one bare git repo on disk. Configurable via flags: `--listen`, `--data`, `--admin-key`, `--max-bundle-mb` (50MB default), `--max-pushes-per-hour` (100), `--max-posts-per-hour` (100). Only runtime dependency: `git` on PATH.

2. **`ah`** -- the CLI. Thin wrapper around the HTTP API. Stores config in `~/.agenthub/config.json`. Agents use this to join the hub, push/fetch commits via git bundles, navigate the DAG, and communicate via the message board.

### Data Model (5 tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agents` | Registered agents | `id` (PK), `api_key` (unique), `created_at` |
| `commits` | Commit metadata index | `hash` (PK), `parent_hash`, `agent_id` (FK), `message`, `created_at` |
| `channels` | Message board channels | `id` (auto), `name` (unique), `description` |
| `posts` | Messages/replies | `id` (auto), `channel_id` (FK), `agent_id` (FK), `parent_id` (self-FK), `content` |
| `rate_limits` | Per-agent rate limiting | `agent_id`, `action`, `window_start`, `count` |

SQLite pragmas: WAL mode, 5s busy timeout, foreign keys ON, synchronous NORMAL. The database indexes `commits.parent_hash`, `commits.agent_id`, `posts.channel_id`, and `posts.parent_id`.

### Git Layer -- The Key Innovation

The git layer is the most architecturally significant component. Key design decisions:

- **No branches, no refs, no main**. The server maintains a bare git repo. Agents push via git bundles (binary serialization of commit objects + their ancestors). The server unbundles, indexes commit metadata into SQLite, and that's it. No branch management whatsoever.
- **DAG navigation API**. Instead of branches, agents navigate the raw commit DAG:
  - `GET /api/git/commits` -- list recent commits (optionally filtered by agent)
  - `GET /api/git/commits/{hash}/children` -- what has been built on top of this?
  - `GET /api/git/commits/{hash}/lineage` -- ancestry path to root
  - `GET /api/git/leaves` -- frontier commits (commits with no children) -- the active research frontier
  - `GET /api/git/diff/{a}/{b}` -- diff between any two commits
- **Git bundles as transport**. Agents create a bundle from HEAD, POST it to the server. The server unbundles into the bare repo, extracts commit metadata (hash, parent, message), and indexes into SQLite. For fetch, the server creates a temporary ref, bundles it, serves the file, then cleans up the ref.
- **Mutex on writes**. The `Repo` struct uses `sync.Mutex` for unbundle operations, serializing writes to the bare repo.

### Message Board

Simple threaded message board with channels:
- Agents can create channels, post messages, read messages, reply to posts
- Posts have a `parent_id` for threading (single-level reply structure)
- 32KB max post size, 100 max channels
- Rate-limited per agent

### Auth & Defense

- Admin key for agent creation (via flag or `AGENTHUB_ADMIN_KEY` env var)
- Per-agent API keys (256-bit random, hex-encoded) for all authenticated endpoints
- Public self-registration endpoint with IP-based rate limiting (10/hour/IP)
- Per-agent rate limits: 100 pushes/hour, 100 posts/hour, 60 diffs/hour
- Bundle size limit (50MB default)
- 64KB JSON body limit on non-bundle endpoints

### Dashboard

Auto-refreshing (30s) HTML dashboard at `/` showing:
- Stats (agent count, commit count, post count)
- Recent commits table (hash, parent, agent, message, time ago)
- Recent posts (channel, agent, content, time ago, reply indicators)
- Monospace terminal aesthetic (dark theme, SF Mono)

---

## Publisher Background

Andrej Karpathy is one of the most significant figures in the current AI wave. Co-founded OpenAI, served as Senior Director of AI at Tesla (leading the Autopilot computer vision team), returned to OpenAI before going independent. Creator of minGPT, nanoGPT, llm.c, and the wildly popular "Neural Networks: Zero to Hero" video series. His YouTube channel has millions of subscribers. He rarely releases code -- when he does, it typically signals a direction the field is moving toward (e.g., nanoGPT preceded the open-source LLM explosion).

The fact that he released AgentHub and took it down the same day is itself significant. This is not a polished release -- it's Karpathy thinking in public about agent infrastructure, then deciding it wasn't ready. The "just a sketch, thinking..." note in the README confirms this. The autoresearch project it connects to suggests he's actively working on autonomous research agents and needed coordination infrastructure.

---

## What's Valuable for Us

### 1. The "No Main Branch" Paradigm

This is the most radical and useful insight. In a multi-agent system, the concept of a "main branch" is a human artifact. Agents don't need a canonical truth -- they need:
- A way to see what's been tried (`children`)
- A way to find the frontier (`leaves`)
- A way to build on top of any commit (`push` with any parent)
- A way to compare approaches (`diff`)

This maps directly to our multi-agent architecture. When we spawn parallel agents on different tasks, each agent's work is a branch in the DAG, but there's no overhead of branch naming, PR creation, or merge management. The DAG IS the coordination structure.

### 2. "Culture From Instructions, Not Platform"

The README explicitly states: "The platform is generic: it doesn't know or care what the agents are optimizing. The 'culture' (what agents post, how they format results, what experiments to try) comes from their instructions, not the platform."

This is exactly our CLAUDE.md / AGENTS.md approach: the orchestration substrate is deterministic and dumb, the intelligence is in the agent instructions. This validates the 70/30 split at a philosophical level.

### 3. Git Bundles as Agent Transport

Using git bundles instead of `git push/pull` is clever for agent systems:
- No SSH key management or git credentials
- HTTP-only transport (works through any proxy/firewall)
- Server-side validation before accepting into the bare repo
- The server controls what enters the repo, not the agents

This solves the "how do agents share code without full git access" problem. Worth studying for our Phase 3+ federation where agents across business lines might need to share code artifacts.

### 4. Leaves as Frontier Discovery

The `GET /api/git/leaves` endpoint returns commits with no children -- effectively the "active research frontier." This is a powerful coordination primitive: an agent can query the frontier, pick an interesting leaf, build on it, and push. No task assignment needed. The DAG structure itself becomes the task queue.

This is related to Gas Town's bead model but more primitive and more powerful. Gas Town assigns beads (tasks) to agents. AgentHub lets agents self-organize around interesting leaves.

### 5. Message Board for Soft Coordination

The message board is the "loose coupling" coordination mechanism. Agents can post results, hypotheses, failures, and notes without any structured protocol. This is softer than A2A (which defines rigid message types) and more like how human researchers coordinate -- through papers and discussion forums.

### 6. SQLite + Bare Git = Zero Infrastructure

The entire system is one Go binary + one SQLite file + one bare git directory. No Redis, no Postgres, no message queue, no container runtime. This is the same infrastructure minimalism we practice with our JSON-in-git state files and SQLite-backed tools.

---

## What's NOT Relevant

### 1. Single-Codebase Assumption

AgentHub assumes all agents work on the same codebase (one bare git repo). Our federated architecture explicitly separates codebases per business line (DSGVO isolation). We would need one AgentHub instance per business line, not one shared hub.

### 2. No Access Control Within the Hub

All agents can see all commits and all messages. There's no concept of visibility scoping, team boundaries, or information compartmentalization. For our gov contracts, this is a non-starter without significant modification.

### 3. No Task Decomposition or Assignment

AgentHub is pure coordination substrate -- it doesn't decompose tasks, assign work, or track completion. Our orchestrator needs active task management (which we handle with orchestrator-state.json). AgentHub would need to be layered under our orchestrator, not replace it.

### 4. Research-Optimized, Not Production-Optimized

The "explore the DAG, build on interesting leaves" model works for research (many parallel hypotheses, most will fail). For production code delivery, we need convergence (merge to main, deploy, verify). The two models serve different purposes.

---

## Cross-References

| Catalogue Entry | Relationship |
|----------------|-------------|
| [Gas Town](./gas-town.md) | Both use git as coordination primitive; Gas Town uses beads for task tracking, AgentHub uses leaves for frontier discovery; Gas Town is more structured |
| [A2A Protocol](../agent-protocols/a2a-protocol.md) | A2A defines rigid agent-to-agent message types; AgentHub's message board is deliberately unstructured; opposite ends of the coordination spectrum |
| [MCP Agent Mail](./mcp-agent-mail.md) | Both solve agent coordination via message passing; Agent Mail uses FastMCP+Git+SQLite, AgentHub uses HTTP+Git+SQLite; similar substrates, different abstraction levels |
| [OpenClaw](./openclaw.md) | OpenClaw adds lane queuing and context checkpoints to multi-agent coding; AgentHub removes all structure and lets agents self-organize |
| [NTM](./ntm.md) | Both written in Go; NTM provides 80+ structured commands for tmux-based agents; AgentHub provides ~15 commands for DAG-based agents; different coordination models |
| [AGENTS.md](../agent-protocols/agents-md.md) | AgentHub's "culture from instructions" principle is exactly what AGENTS.md codifies; complementary |
| [Relay App](./relay-app.md) | Both provide agent messaging infrastructure; Relay uses Rust+PTY, AgentHub uses Go+HTTP; Relay is more production-oriented |

---

## Future Use Cases

### Phase 1 (Days 1-3)
- **Not applicable**. AgentHub is a coordination substrate, not a harness. Our L-Thread orchestrator already provides task management.

### Phase 2 (Days 4-60)
- **Study the "leaves as frontier" pattern** for parallel agent coordination. When spawning multiple agents to explore different approaches to a problem, the leaves concept could inform how we present options to the orchestrator for selection.
- **Adopt the message board concept** as a lightweight alternative to structured inter-agent communication for research/exploration tasks.

### Phase 3 (Days 60-90)
- **Git bundle transport** for cross-business-line code sharing in the federated architecture. Agents in Business Line A could push bundles to a shared hub that Business Line B agents can fetch from, without direct git access across repositories.
- **DAG navigation API** as a read model for understanding what multiple agents have tried. Instead of just tracking state in orchestrator-state.json, maintain a DAG of experiments.

### Phase 4 (Days 90+)
- **Agent-first academia pattern** for internal R&D. Spawn a community of research agents that explore ML/AI improvements to our own systems, coordinating through an AgentHub instance. Each agent is a "PhD student" exploring different hypotheses.
- **Public AgentHub instance** as part of SaaS offerings -- let customers' agents collaborate on shared codebases.

---

## Design Decisions Worth Studying

1. **Go + SQLite + bare git** -- three technologies, zero infrastructure dependencies. The entire system compiles to one static binary. This is Karpathy-level minimalism applied to infrastructure.

2. **Git bundles over git push** -- decouples agent identity from git identity. Agents don't need SSH keys or git credentials. The server is the gatekeeper.

3. **Parent indexing in SQLite** -- the bare git repo stores the actual objects, SQLite stores the metadata index (commit hash, parent hash, agent ID, message, timestamp). This separation allows efficient DAG queries (children, leaves, lineage) without expensive `git log` traversals.

4. **Rate limiting per action type** -- pushes, posts, diffs, and registrations each have independent rate limits. Diffs are limited more aggressively (60/hour vs 100/hour) because they're CPU-expensive.

5. **Public self-registration** -- the `/api/register` endpoint allows anyone to create an agent without an admin key, rate-limited by IP. This enables the "anyone on the internet can contribute their agent" vision.

6. **Auto-indexing parent commits** -- when a bundle is pushed, the server not only indexes the new commit but also backfills any parent commits that aren't in the database yet (e.g., seed commits from initial repo setup). This ensures the DAG is always complete in SQLite.

7. **Monospace terminal dashboard** -- the HTML dashboard at `/` is a single Go template with inline CSS. Auto-refreshes every 30 seconds. No JavaScript framework, no build step. Pure server-rendered HTML. This is the dashboard pattern we should steal for our orchestrator monitoring.

---

## Key Takeaway

> **Karpathy's AgentHub proves that the minimum viable multi-agent coordination platform is shockingly simple: a bare git DAG (no branches, no PRs, no merges) + a message board + an auth layer -- and the critical insight is that "culture comes from agent instructions, not the platform," which is the strongest external validation of our CLAUDE.md-driven, deterministic-substrate approach.**
