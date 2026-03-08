# Phase 1 Synthesis: Vision, Strategy & Path Forward

> **Seven universal orchestration principles distilled from 28 practitioners, a build-vs-hybrid verdict, a three-tier progression roadmap, architecture topology recommendations, and five critical anti-patterns to avoid.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `research/2026-03-05_SYNTHESIS_vision-strategy.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

This synthesis draws on five research documents covering IndyDevDan's deep benchmark profile, 28 visionary practitioner surveys, architecture pattern analyses, build vs. buy economics, and a Pi orchestrator roadmap. The central thesis from all sources: the bottleneck has moved from model capability to orchestration quality. The models work. The question is whether you can design the system that tells them what to write, verifies the output, and recovers when things break.

Seven universal principles emerged independently across all five source documents, from "orchestrate, never participate" to "progressive deletability." The build-vs-buy verdict for a senior engineer or small team is unambiguous: go hybrid -- minimal SDK (Pi Agent) plus custom orchestration logic, not full custom (Gas Town's 189K lines of Go) and not a framework (LangGraph/CrewAI encode mismatched opinions). The implementation roadmap spans 8 weeks (~1,980 lines TypeScript + 2,000 from community extensions) across three phases: discipline and state, multi-agent loop, and migration/polish.

IndyDevDan's deepest insight: "The question is no longer HOW to build with agents but WHAT to build." The orchestrator is not the product -- it is the factory that builds the products. Every hour invested in orchestrator quality compounds across every future project.

---

## Key Findings

### The 7 Universal Principles

1. **Orchestrate, never participate.** The orchestrator must never do the work. "DU BIST KEIN ENTWICKLER" is not a quirky rule -- it is the single most common failure mode. Role confusion cited as top anti-pattern by GitHub engineering, Victor Dibia, and architecture patterns research. One role per agent, enforced programmatically.

2. **Observability before scale.** You cannot trust what you cannot see. IndyDevDan built hook-based multi-agent observability before scaling. Ignoring observability is a critical anti-pattern (architecture patterns research). Every successful system instruments agent activity at every boundary.

3. **Context is the bottleneck.** Number one consensus across 28-visionary survey. Progressive disclosure, tiered context budgets, frequent intentional compaction. Dexter Horthy's 40-60% context utilization rule is the most actionable metric.

4. **Progress lives in files, not in memory.** Huntley's Ralph Loop, Yegge's Gas Town, L-Thread state files. Git history is the real memory. File-based state survives crashes, is inspectable, persists across sessions.

5. **Front-load specs, back-load review.** Human effort at the beginning (specifications) and end (review). The middle -- implementation -- is where agents operate autonomously. Osmani, Horthy, and Composio all describe this.

6. **Bound everything.** Unbounded loops, autonomy, context growth, and agent spawning are the four horsemen of multi-agent failure. Every loop needs max iterations. Every agent needs timeout. The "17x error trap" research quantifies unbounded multi-agent failure.

7. **Progressive deletability.** Build infrastructure that gets simpler as models improve. Anthropic's harness team, Martin Fowler, and the build-vs-buy analysis converge: if orchestration code keeps growing in complexity, you are over-engineering.

### Build vs. Buy Verdict

| Approach | Verdict | Rationale |
|----------|---------|-----------|
| Full custom | Not recommended | Gas Town's 189K lines of Go and $2K-5K/mo represent research frontier, not replicable pattern. 10-50x more developer time. |
| Framework (LangGraph/CrewAI/AutoGen) | Not recommended | Encode opinions (graphs, roles, conversations) that may not match workflow. ~450 token overhead per request (LangChain). 5x cost multiplication (5-agent CrewAI). 60% of "agent systems" are single-LLM-call apps that do not need frameworks. |
| **Hybrid: minimal SDK + custom logic** | **Recommended** | Pi Agent or minimal SDK for agent loop. Custom discipline rules, state management, orchestration as lightweight extensions. Exactly what OpenClaw and L-Thread both did. |

Key insight: frameworks are getting thinner, custom systems standardizing on common patterns (MCP, progress files). The gap is narrowing. Building with progressive deletability means adopting new blocks and discarding old ones as the landscape evolves.

### Architecture Patterns

**Topology:** Hub-and-spoke with hierarchical escape hatch. For 2-7 agents, orchestrator dispatches, workers execute, results flow back. Past 7 agents, introduce team leads (1 supervisor per domain, 3-5 workers). Do not adopt mesh, swarm, or DAG topologies until simpler pattern demonstrably fails.

**Communication:** File-based, event-driven. Pi-messenger's file-based messaging with Pi's native `followUp`/`steer` routing. 50-100ms file I/O latency is irrelevant on 10-30 second agent cycles. Debuggable (`cat` and `ls`), durable, zero infrastructure.

**State:** Centralized JSON + append-only JSONL decision log. `orchestrator-state.json` as single source of truth. JSONL for audit trail. Pi's `appendEntry()` for compaction-surviving state.

**Error handling:** Bounded retries with model escalation. Haiku fails -> Sonnet. Sonnet fails -> Opus. Opus fails -> skip, log, continue. Every retry loop has max count. Timeouts calibrated to task type (60s lint, 5min code, 15min E2E).

**Isolation:** Git worktrees per agent. Native `isolation: worktree` frontmatter. No shared working directories. Merge back after review.

### Implementation Roadmap

| Phase | Timeline | Effort | Key Deliverables | Exit Criteria |
|-------|----------|--------|-----------------|---------------|
| 1. Foundation | Weeks 1-2 | ~400 lines TS | `orchestrator-discipline` extension (no-code-writing, E2E gate, bounded reviews, AUTO-MODE); `orchestrator-state` extension (JSON persistence, tiered context, compaction survival) | All 4 absolute rules enforced by code; state survives compaction |
| 2. Multi-Agent Loop | Weeks 3-5 | ~550 lines TS | Agent role definitions (YAML frontmatter); `orchestrator-loop` extension (plan/spawn/wait/review/merge/test/done); `orchestrator-health` (heartbeats, timeouts, stuck-detection); parallel mode via pi-messenger | Full loop operational in sequential and parallel modes |
| 3. Migration & Polish | Weeks 6-8 | ~1,030 lines TS | Real project migration; model routing; TUI dashboard; devlog generation; npm packaging | All projects on Pi, 30% cost reduction target |

**Total:** ~1,980 lines custom + ~2,000 community = ~4,000 lines. ~17 development days.

### Anti-Patterns to Avoid

1. **"Bag of Agents"** -- deploying agents without explicit topology. Quantified as "17x error trap." If you cannot draw the topology on a whiteboard, you do not have an architecture.
2. **Unbounded autonomy and loops** -- unlimited actions, spawning, retries. Fastest path to cost explosion. Fix: `max_steps`, `max_children`, `max_rounds`, `max_retries` on every agent.
3. **Over-engineering with premature framework adoption** -- LangGraph's full graph execution when a three-step pipeline suffices. Fix: start with simplest architecture, earn complexity.
4. **Outsourcing your understanding** -- IndyDevDan's warning: do not let someone else's abstraction become a ceiling on capability. Build at least one thing from scratch.
5. **Ignoring context economics** -- treating context windows as unlimited. Primary bottleneck is communication cost (tokens for planning/coordination), not computation. Fix: tiered budgets, sliding windows, 40-60% utilization rule.

### The Three-Tier Progression

- **Tier 1 (now): The Harness.** Reliable orchestrator managing sessions, state, discipline rules, crash recovery. This is what L-Thread already does; Pi migration adds programmatic enforcement and cost visibility.
- **Tier 2 (next): Intelligent Orchestration.** Typed agent teams, specialist handoffs, performance-history-based routing, confidence scoring, dependency-aware parallel execution.
- **Tier 3 (future): Meta-Agency.** Orchestrator reads project spec and generates optimal team composition, agent definitions, task decomposition automatically.

Strategic priority: complete Tier 1 (8-week roadmap), validate on real projects, measure cost and throughput, use metrics to guide Tier 2. Do not attempt Tier 3 until Tier 2 is proven.

---

## Actionable Insights

1. **The orchestrator is the factory, not the product.** Every hour invested compounds across every future project. Do not optimize for shipping fast; optimize for building right.
2. **Go hybrid** -- minimal SDK + custom orchestration logic. Not full custom, not a framework.
3. **Hub-and-spoke topology** is the right default for 2-7 agents. Add team leads only when scaling past 7.
4. **Enforce all discipline rules in code**, not prompts. Programmatic enforcement via extensions, not system prompt instructions.
5. **Progressive deletability** as a design constraint: build so any layer can be removed without breaking the system.
6. **"What to build" is the new question** -- tooling works, models are capable, patterns are documented. The frontier has moved from infrastructure to application.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | Primary benchmark profile, trust-through-observability framework, "what to build" thesis |
| [practitioners/dotta.md](../practitioners/dotta.md) | Paperclip orchestrator as hybrid-pattern validation |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Solo builder proving orchestrator-as-factory thesis |
| [practitioners/steve-yegge.md](../practitioners/steve-yegge.md) | Gas Town as full-custom reference (189K lines counterexample) |
| [practitioners/geoffrey-huntley.md](../practitioners/geoffrey-huntley.md) | Context-as-bottleneck, "malloc without free" insight |
| [reference/harness-comparison-matrix.md](../reference/harness-comparison-matrix.md) | Build-vs-buy data underlying hybrid verdict |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Primary harness choice for hybrid approach |
| [reference/master-blueprint.md](../reference/master-blueprint.md) | System architecture consuming these strategic principles |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | DeepMind data confirming coordination overhead and team size limits |
| [reference/phase1-synth-pi-ecosystem.md](phase1-synth-pi-ecosystem.md) | Pi ecosystem detail for implementation roadmap |
| [reference/phase1-synth-alternative-harnesses.md](phase1-synth-alternative-harnesses.md) | Alternative harness verdicts informing build-vs-buy |
