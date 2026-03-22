# Slate

> **Thread-based episodic memory architecture for single-threaded coding agents — bounded workers return compressed episodes to an orchestrator, not raw message passing.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | Not public (closed-source; CLI distributed via npm) |
| GitHub Stars | N/A (no public repo) |
| Publisher | Random Labs — startup; building "LLM-based systems for end-to-end software engineering"; actively hiring |
| License | Proprietary (open beta) |
| Tech Stack | TypeScript/Node.js (npm global install), multi-model (Claude, GLM, Codex), dashboard (dashboard.randomlabs.ai), Mintlify docs |
| Maturity | 🟡 Early (Open beta; `npm i -g @randomlabs/slate`) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *This is the tool entry for the article already catalogued at [Slate: moving beyond ReAct and RLM](../articles/2026-03/random-labs-slate.md) (8/10). The article is a dense 20-min technical report; this entry focuses on Slate as an installable tool. The thread weaving pattern — bounded workers that return compressed "episodes" rather than raw message passing — is a formalization of what we do with tmux+worktree workers that return compressed summaries. The OS kernel framing (orchestrator=kernel, threads=processes, episodes=return values) maps directly to our L-Thread architecture. The key limitation: it's closed-source with no public repo, so we can study the architecture but can't fork or deeply integrate. Their claim to be "the first frontier agent built for swarm orchestration" is interesting positioning. The automatic model selection (Claude for planning, GLM for search, Codex for execution) validates our multi-model routing approach. Worth testing the CLI to see if the episode compression format is extractable for our own handoff.sh.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Thread weaving is a direct formalization of our tmux worker pattern. Episode-based compression at worker completion boundaries addresses our compaction pain point. The architecture taxonomy (7 approaches across 8 dimensions) is the best comparative reference in the catalogue. |
| **Novelty** | 7/10 | Episode as a first-class return value (not summary, not message) is a genuinely new primitive. Implicit adaptive decomposition via thread weaving avoids rigid task trees. Cross-model composition via episode boundaries is validated empirically. |
| **Actionable** | 6/10 | Installable today via npm. But closed-source limits deep integration. The episode compression pattern is the immediately adoptable insight for our orchestrator-handoff.sh. |

---

## Overview

Slate is a CLI agent tool from Random Labs that introduces "thread weaving" as its core primitive. Unlike traditional subagent architectures that use message passing (Claude Code, Codex) or strategize-delegate-compress cycles (Devin, Manus), Slate treats each worker as a "thread" — a bounded general-purpose worker that executes one action at a time and pauses, returning a compressed "episode" to the orchestrator.

The key architectural insight is that episodes are not summaries — they are structured return values that preserve only the important results of a thread's execution, discarding the full tactical trace. This makes compaction a natural architectural property rather than a lossy afterthought. Episodes can be composed as inputs to downstream threads, enabling context routing without degradation.

Slate maps to Karpathy's LLM OS framing: the orchestrator is the kernel, threads are isolated processes, episodes are process return values committed back to working memory (RAM). Instead of letting context fill until the agent crashes, each thread return is a natural garbage-collection opportunity. The system supports massively parallel thread execution and cross-model composition (e.g., Sonnet workers + Codex workers in the same task via episode boundaries).

---

## Technical Architecture

### Core Primitives

```
┌─────────────────────────────────────────────────────────┐
│                  ORCHESTRATOR (Kernel)                    │
│  - Dispatches threads by reference                       │
│  - Receives episodes as return values                    │
│  - Composes episodes as inputs to downstream threads     │
│  - Implicit adaptive decomposition (no static plans)     │
│  - Auto model selection (Claude/GLM/Codex per task)      │
└────────┬──────────────┬──────────────┬──────────────────┘
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Thread  │   │ Thread  │   │ Thread  │
    │ (Worker)│   │ (Worker)│   │ (Worker)│
    │ Bounded │   │ Bounded │   │ Bounded │
    │ 1 action│   │ 1 action│   │ 1 action│
    └────┬────┘   └────┬────┘   └────┬────┘
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
    │ Episode │   │ Episode │   │ Episode │
    │ (Return)│   │ (Return)│   │ (Return)│
    │Compressed│  │Compressed│  │Compressed│
    └─────────┘   └─────────┘   └─────────┘
```

### Key Design Decisions

- **Threads are general workers**, not purpose-specific subagents. They serve the system's current intent, not a fixed role.
- **Episodes are structured return values**, not summaries. They preserve critical state and discard tactical traces.
- **Context is explicitly shared** — the orchestrator passes context in, episodes come back out, and one thread's episode can become another thread's input.
- **Decomposition is implicit** — thread weaving produces adaptive task decomposition without static plans or rigid task trees.
- **Model selection is automatic** — the system selects the right model per task type (Claude for planning, GLM for search, Codex for execution).

### Infrastructure

- **CLI**: `npm i -g @randomlabs/slate` (global install)
- **Dashboard**: dashboard.randomlabs.ai (web UI for monitoring)
- **Docs**: docs.randomlabs.ai (Mintlify-based)
- **Configuration**: `slate.json` per workspace

---

## Publisher Background

Random Labs describes itself as "building LLM-based systems for end-to-end software engineering" with a mission to create "general software agents and interfaces that allow engineers to maximally leverage them." Small startup, actively hiring. No public funding information. The team produced a rigorous 20-minute technical report comparing 7 agent architectures across 8 dimensions — the most comprehensive taxonomy in the catalogue — which suggests strong architectural thinking. They position Slate as "the first frontier agent in the wild built for swarm orchestration."

---

## What's Valuable for Us

1. **Episode compression pattern** — Our `orchestrator-handoff.sh` currently generates free-form summaries. Slate's episode model suggests we should generate structured return values (what changed, what was decided, what's unresolved) rather than prose summaries. This is the single most adoptable pattern.

2. **Implicit decomposition via thread weaving** — Validates our resistance to adding rigid task-tree scaffolding. Slate's expressivity analysis shows that strict planner/implementer/reviewer pipelines constrain the system's ability to react to new information.

3. **Cross-model composition via episode boundaries** — Slate empirically validates that "using Sonnet and Codex together across the same task works well" when episode boundaries serve as the handoff points. This directly supports our Opus orchestrator + Sonnet worker pattern.

4. **The 7-architecture taxonomy** — The comparison table (ReAct / Markdown Plans / Task Trees / RLM / Devin-Manus-Altera / Claude Code-Codex / Slate) across 8 dimensions (planning, decomposition, synchronization, feedback, isolation, compaction, parallelism, expressivity, adaptability) is the best reference material for evaluating our own architectural decisions.

5. **Knowledge overhang concept** — Models have latent knowledge they can't access without scaffolding (planning, chain-of-thought). This explains why our markdown-based task descriptions improve worker output quality.

---

## What's NOT Relevant

- **Closed-source CLI** — Cannot fork, extend, or deeply integrate. We can study patterns but not adopt the tool itself as infrastructure.
- **"Single-threaded agents first" stance** — They argue multi-agent teams are premature. We've already validated multi-agent with tmux+worktree and it works. Their position is interesting but we've moved past it.
- **npm global install model** — Adds a runtime dependency we don't control. Our tmux+worktree+Claude Code stack has zero external agent dependencies.
- **Proprietary dashboard** — dashboard.randomlabs.ai is a hosted service. Our observability should remain local (devlog, state files, ccusage).

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt the episode compression pattern in `orchestrator-handoff.sh` — replace free-form summaries with structured episode objects (what_changed, decisions, unresolved, artifacts). This is achievable without using Slate itself.
- **Phase 3 (Days 60-90)**: If Slate open-sources or provides an episode format spec, consider using it as a standard format for cross-agent memory exchange.
- **Phase 4 (Days 90+)**: If Random Labs grows and Slate matures, re-evaluate as a potential orchestrator substrate. Their architectural thinking is strong but the tool needs to prove itself in production.

---

## Key Takeaway

> **Slate's episode primitive — a structured compressed return value from bounded worker threads — is the cleanest formalization of our tmux worker handoff pattern, and the episode compression format should be adopted in our orchestrator-handoff.sh even without using Slate itself.**
