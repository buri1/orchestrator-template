# AgentHub (ygivenx fork)

> **GitHub is for humans. AgentHub is for agents. First use case is for autoresearch but it's a lot more general than that. Exploratory project.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration |
| Repository | [github.com/ygivenx/agenthub](https://github.com/ygivenx/agenthub) |
| GitHub Stars | 47 (as of 2026-03-12) |
| Publisher | ygivenx (solo; community fork of Karpathy's original, taken down same day it launched) |
| License | N/A (no license file detected) |
| Tech Stack | Go, SQLite (modernc.org/sqlite pure-Go driver), bare git repo, git bundles, HTML dashboard |
| Maturity | 🟡 Early (fork is 3 days old; upstream self-described "just a sketch, thinking...") |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *This is the live, deployable fork of Karpathy's AgentHub — which he took down within hours of publishing. The original repo analysis is already in the catalogue ([AgentHub (Karpathy)](./agenthub-karpathy.md)), so treat this as the "runnable version." With 223 forks in 3 days, it clearly struck a nerve. The key question is whether to deploy this as a standalone coordination layer for multi-agent research tasks or fold the patterns into our existing orchestrator. My instinct: don't deploy it in Phase 1-2 — we already have orchestrator-state.json + tmux for coordination. But the "leaves as frontier" query and git bundle transport are worth referencing when we build the Phase 3 federated architecture. The 223 forks suggest the community is actively experimenting — worth watching for integration work with Claude Code or Pi Agent.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Architecture validates git-as-coordination-primitive and thin-deterministic-substrate, but covers mostly the same ground as the Karpathy analysis already in catalogue; no new insights for current roadmap phase |
| **Novelty** | 4/10 | Same design as Karpathy's original (Go + SQLite + bare git + message board); novelty is availability not architecture; 223 forks suggest active ecosystem forming around it |
| **Actionable** | 5/10 | Now actually deployable (unlike Karpathy's deleted original); bundle-based transport and leaves-as-frontier patterns remain the most concrete takeaways; usable as a Phase 3 coordination substrate |

---

## Overview

`ygivenx/agenthub` is the community fork of Andrej Karpathy's AgentHub — a "GitHub for agents" platform that was published and taken down the same day (2026-03-09). It is architecturally identical to the original: a single Go binary combining a bare git repository (no branches, no PRs, no merges — just a sprawling commit DAG) with a message board, per-agent API key auth, and an auto-refreshing HTML dashboard. The fork preserves the complete design without modification, making it the canonical way to actually run the system.

The platform's thesis is radical simplification of multi-agent coordination. Traditional VCS ergonomics (branch naming, PR reviews, merge strategies) are human artifacts that add no value for autonomous agents. Instead, agents push commits as git bundles, navigate the raw DAG (children, leaves, lineage, diff), and coordinate through an unstructured message board with channels and threaded replies. All "culture" — what to optimize, how to format results, what experiments to run — is embedded in agent instructions, not the platform. This is the context-engineering principle applied to infrastructure.

The initial target use case is [Karpathy's autoresearch project](https://github.com/karpathy/autoresearch), which emulates a single PhD student doing ML research. AgentHub turns that into "agent-first academia" where distributed researcher-agents coordinate through a shared Git+message substrate. With 223 forks in 72 hours, the community is likely already building integrations with Claude Code, Pi Agent, and other harnesses.

---

## Technical Architecture

```
ygivenx/agenthub architecture (~1,100 lines of Go)

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

1. **`agenthub-server`** — the hub. One Go binary, one SQLite database, one bare git repo on disk. Flags: `--listen`, `--data`, `--admin-key`, `--max-bundle-mb` (50MB default), `--max-pushes-per-hour` (100), `--max-posts-per-hour` (100). Only runtime dependency: `git` on PATH.

2. **`ah`** — the CLI. Thin wrapper around the HTTP API. Config stored at `~/.agenthub/config.json`. Agents use it to join the hub, push/fetch commits via git bundles, navigate the DAG, and post to message board.

### Data Model (5 tables in SQLite)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `agents` | Registered agents | `id` (PK), `api_key` (unique), `created_at` |
| `commits` | Commit metadata index | `hash` (PK), `parent_hash`, `agent_id` (FK), `message`, `created_at` |
| `channels` | Message board channels | `id` (auto), `name` (unique), `description` |
| `posts` | Messages/replies | `id` (auto), `channel_id` (FK), `agent_id` (FK), `parent_id` (self-FK), `content` |
| `rate_limits` | Per-agent rate limiting | `agent_id`, `action`, `window_start`, `count` |

SQLite pragmas: WAL mode, 5s busy timeout, foreign keys ON, synchronous NORMAL. Indexed: `commits.parent_hash`, `commits.agent_id`, `posts.channel_id`, `posts.parent_id`.

### Git Layer — Core Innovation

- **No branches, no refs, no main**. The server maintains a bare git repo. Agents push via git bundles (binary-serialized commit objects + ancestors). Server unbundles, indexes commit metadata into SQLite. No branch management.
- **DAG navigation API**:
  - `GET /api/git/commits` — recent commits (filter by agent)
  - `GET /api/git/commits/{hash}/children` — what was built on top of this commit?
  - `GET /api/git/commits/{hash}/lineage` — ancestry path to root
  - `GET /api/git/leaves` — frontier commits (no children) — the active research frontier
  - `GET /api/git/diff/{a}/{b}` — diff between any two commits
- **Mutex on writes** — `sync.Mutex` serializes unbundle operations to the bare repo.
- **Parent backfill** — on push, server backfills any parent commits not yet indexed in SQLite (handles seed commits).

### Auth & Rate Limiting

- Admin key (flag or `AGENTHUB_ADMIN_KEY` env) for agent creation
- Per-agent API keys: 256-bit random, hex-encoded
- Public self-registration at `/api/register`, IP-rate-limited (10/hour/IP)
- Per-agent limits: 100 pushes/hour, 100 posts/hour, 60 diffs/hour
- 50MB bundle size cap; 64KB JSON body limit

### Build

```bash
go build ./cmd/agenthub-server
go build ./cmd/ah
./agenthub-server --admin-key YOUR_SECRET --data ./data
```

---

## Publisher Background

`ygivenx` is an anonymous community member who forked Karpathy's repo the day it was taken down. No track record beyond this preservation act. The original work is entirely Karpathy's — see [AgentHub (Karpathy)](./agenthub-karpathy.md) for full publisher context. The fork's value is purely operational: it makes the architecture deployable and preserves it from deletion. The 223-fork explosion in 72 hours suggests the community is treating it as the canonical source for this pattern.

---

## What's Valuable for Us

### 1. Deployable Reference Implementation

Unlike Karpathy's deleted original, this fork is live and buildable. When we need to prototype the "DAG as coordination structure" concept (Phase 3+), this is the working reference. `go build` → running server → test with `ah` CLI.

### 2. Leaves as Frontier Discovery (Transferable Pattern)

`GET /api/git/leaves` returns commits with no children — the active frontier. This is the most powerful coordination primitive in the codebase: an orchestrator can query leaves, pick the most promising, assign an agent to build on it, and push. No explicit task assignment queue needed. The DAG structure IS the queue. Map to our architecture: replace orchestrator-state.json task list with a DAG for exploratory/research tasks while keeping the structured queue for production delivery.

### 3. Git Bundles as Agent Transport (Phase 3 Federation)

HTTP-only bundle transport solves cross-business-line code sharing without SSH keys or git credentials. For Phase 3 federated architecture, agents in Business Line A could push bundles to a shared hub that Business Line B agents can fetch from, without direct git access across repositories. This is DSGVO-compatible if each business line runs its own hub instance.

### 4. Zero-Infrastructure Substrate

One Go binary + SQLite + bare git directory. No Redis, Postgres, message queue, or container runtime. Consistent with our infrastructure-minimalism principle (JSON-in-git state, SQLite-backed tools). If we ever need a lightweight multi-agent coordination server for a client project, this compiles to a static binary we can drop anywhere.

### 5. "Culture From Instructions" Validates CLAUDE.md

The README explicitly states the platform is generic and doesn't enforce agent behavior — culture comes from agent instructions. This is the strongest external confirmation of our CLAUDE.md / AGENTS.md approach: the orchestration substrate should be deterministic and dumb; all intelligence lives in the prompt layer.

---

## What's NOT Relevant

### 1. Covers Ground Already in Catalogue

The architectural analysis in [AgentHub (Karpathy)](./agenthub-karpathy.md) is complete and covers all the design decisions in depth. This fork adds nothing architecturally new — only availability.

### 2. Single-Codebase Assumption

One hub = one bare git repo. Our federated architecture has per-business-line codebases with DSGVO isolation. We would need one instance per business line, not a shared hub. Not a blocker, but means multi-hub orchestration is needed.

### 3. No Task Decomposition or State Management

AgentHub is pure coordination substrate. No task decomposition, no assignment, no completion tracking. Our orchestrator-state.json already handles this. AgentHub would layer under the orchestrator as a git coordination primitive, not replace it.

### 4. No Access Control Within Hub

All agents see all commits and all messages. For gov contracts requiring information compartmentalization, this is inadequate without modification. The rate limiting and admin key provide basic auth but no per-agent visibility scoping.

### 5. Research-Optimized, Not Production-Optimized

The "explore the DAG, build on interesting leaves" model works for hypothesis exploration. Production delivery requires convergence (merge to main, deploy, verify). The two models serve different purposes — don't conflate them.

---

## Cross-References

| Catalogue Entry | Relationship |
|----------------|-------------|
| [AgentHub (Karpathy)](./agenthub-karpathy.md) | This IS the same codebase — ygivenx fork is the deployable preservation of Karpathy's deleted original; all architectural analysis lives in the Karpathy entry |
| [Gas Town](./gas-town.md) | Both use git as coordination primitive; Gas Town uses bead-based task tracking (structured), AgentHub uses leaves for self-organized frontier discovery (unstructured) |
| [MCP Agent Mail](./mcp-agent-mail.md) | Both solve agent messaging; Agent Mail uses FastMCP+Git+SQLite with advisory file leases; AgentHub uses HTTP+Git+SQLite with unstructured message board |
| [NTM](./ntm.md) | Both written in Go targeting multi-agent coordination; NTM uses tmux+80+ structured commands; AgentHub uses HTTP+DAG+~15 commands; different substrates |
| [AGENTS.md](../agent-protocols/agents-md.md) | AgentHub's "culture from instructions" principle is exactly what AGENTS.md codifies at a convention level |

---

## Future Use Cases

### Phase 1 (Days 1-3)
- Not applicable. L-Thread Orchestrator already handles task coordination.

### Phase 2 (Days 4-60)
- **Reference only**: Study `GET /api/git/leaves` implementation for how to surface the "active frontier" across parallel agent runs without explicit task queue management.

### Phase 3 (Days 60-90)
- **Git bundle transport** for cross-business-line code sharing in the federated architecture. Per-line hub instances, each with full isolation.
- **DAG as experiment log** for research/exploration tasks (not production delivery). Track what approaches have been tried; let agents build on interesting leaves.

### Phase 4 (Days 90+)
- **Agent-first research substrate**: deploy as internal R&D coordination layer for our own ML/AI improvement experiments.
- **Client deliverable**: drop a compiled binary into a client's infrastructure as a lightweight agent coordination server — zero infra dependencies, single binary.

---

## Key Takeaway

> **The ygivenx fork is the deployable preservation of Karpathy's deleted AgentHub — same ~1,100-line Go codebase, same architecture — making the "bare git DAG + message board + zero infra" coordination pattern actually runnable; deploy only at Phase 3+ for federated research coordination, not as a replacement for our existing orchestrator-state.json-driven task management.**
