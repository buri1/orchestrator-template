# Phase 1 Landscape Overview

> **The definitive Phase 1 synthesis: 30 research agents, 70+ documents, 5 synthesis reports distilled into 10 universal orchestration laws, a ranked tool stack, Pi Agent verdict, recommended architecture, 8-week roadmap, and the one compounding insight.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `research/2026-03-05_landscape_overview.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

This is the meta-synthesis of all Phase 1 research: 30 agents analyzed every major agent orchestration tool, framework, harness, and pattern available in March 2026. The single finding: the bottleneck has moved from model capability to orchestration quality. What determines output quality is context engineering (what agents see), deterministic workflow control (what agents do vs. what code decides), and infrastructure (crash recovery, observability, cost control).

Pi Agent is confirmed as the correct harness choice for a model-agnostic, fully-owned orchestrator. However, it must be: (1) wrapped behind an adapter layer for insurance, (2) extended with community orchestration primitives (pi-subagents, pi-messenger, pi-mcp-adapter), and (3) hardened with custom extensions for discipline enforcement, E2E gating, and fleet-wide budget management. The architecture that wins everywhere -- Stripe, Elvis Sun, Gas Town, OpenClaw -- is identical: a non-coding coordinator that holds business context, delegates creative work to isolated agents through deterministic gates, and enforces hard retry caps.

The landscape overview evaluates 30+ tools with relevance scores, documents 10 universal orchestration laws, provides a complete recommended architecture with diagram, defines a three-phase 8-week implementation roadmap (~4,000 lines total), identifies the top 5 risks with mitigations, and profiles 10 people to follow. Full document index covers 73 research documents and 5 synthesis reports.

---

## Key Findings

### The 10 Universal Laws of Agent Orchestration

1. **Orchestrate, never participate.** One role per agent, enforced programmatically. Role confusion is the #1 failure mode.
2. **Context is the bottleneck.** 40-60% context utilization (Horthy's rule). Progressive disclosure: load context only when needed.
3. **Progress lives in files, not in memory.** JSON state, JSONL logs, git history. File-based state survives crashes and is human-inspectable.
4. **Bound everything.** Max iterations on loops. Timeouts on agents. Pool limits on fleets. Cap retries at 2 (Stripe).
5. **Front-load specs, back-load review.** Human at beginning (specs) and end (review). Middle is autonomous.
6. **Deterministic steps are not agent steps.** Git checkout, linting, CI triggers -- hardcode these. Only delegate creative work to LLM. Blueprint Pattern (Stripe).
7. **Isolation is non-negotiable.** One git worktree per coding agent. No shared working directories. Merge after review.
8. **Observability before scale.** Instrument every boundary. Three files per agent minimum: status.json, events.jsonl, log.md.
9. **Infrastructure beats intelligence.** "The tool that wins isn't the one with the best model; it's the one with the best infrastructure around the model" (Stripe).
10. **Progressive deletability.** Build infrastructure that gets simpler as models improve. If orchestration complexity grows, you are over-engineering.

### Ranked Tool Stack

**MUST-HAVE (weeks 1-2):**

| Tool | Purpose | Cost |
|------|---------|------|
| Pi Agent + pi-subagents + pi-messenger + pi-mcp-adapter | Core harness + multi-agent + MCP | Free (OSS) |
| Context-Gateway | Background compaction proxy | Free (OSS) |
| Vercel agent-browser | E2E testing (93% less context) | Free (OSS) |
| Langfuse | Observability, cost tracking, traces | Free tier |
| Git worktrees | Per-agent filesystem isolation | Built-in |

**SHOULD-HAVE (weeks 3-6):** Cognee + Neo4j (semantic memory), Beads + Dolt (task state), CodeRabbit (review gate), Graphite (stacked PRs), Koylan's Agent Skills (context engineering)

**NICE-TO-HAVE (month 2+):** Trigger.dev (durable execution), Shannon (security), E2B/Daytona (sandboxing), PostHog (feature flags), SkillKit (skills marketplace), Relay (messaging), Mendral (CI diagnosis)

### Complete Tool Landscape (30+ tools rated)

| Relevance | Tools |
|-----------|-------|
| **5/5** | Pi Agent, pi-subagents, pi-messenger, pi-mcp-adapter, Context-Gateway, Vercel agent-browser, Langfuse |
| **4/5** | Claude Agent SDK, OpenCode, Goose, Cognee, Beads+Dolt, CodeRabbit, Graphite, Trigger.dev, Relay, oh-my-pi |
| **3/5** | Shannon, Overstory, Vibe Kanban, agtx, SkillKit, Aider, E2B, Daytona |
| **2/5** | Codex CLI, Cline CLI 2.0, Roo Code, Dify |
| **1/5** | LangGraph, CrewAI/AutoGen, Swarms, ElizaOS |

### Pi Agent Verdict

Pi Agent is correct for maximum long-term control with zero vendor lock-in. The 70% orchestration score reflects absent built-in multi-agent, not a capability ceiling.

| Dimension | Strengths | Weaknesses | Mitigation |
|-----------|-----------|------------|------------|
| Architecture | SDK mode, `context` event, 200-token system prompt (18x efficient) | No built-in multi-agent | pi-subagents + pi-messenger |
| Extensibility | 25+ lifecycle events, microsecond latency, runtime tool registration | 50-80 extensions, gaps in memory/state machines/budget | Build custom (~1,980 lines) |
| Models | 324+ models, 7 protocols, 20+ providers | None | N/A |
| Stability | MIT, irrevocable, no CLA | v0.56.1, ~30 minor versions in 4 months | Pin versions, adapter layer |
| Bus Factor | Clean monorepo, oh-my-pi proves forkability | Bus factor of 1 (Mario Zechner) | OpenClaw guarantees consumer |

**Action:** Adopt Pi as primary harness behind `AgentRuntime` adapter interface. Pin versions. Build three custom extensions (discipline, state, loop) in Phase 1.

### Recommended Architecture

**Topology:** Hub-and-spoke. Orchestrator dispatches, workers execute, results flow back. No mesh. Team leads at 7+ agents.

**Spawning:** SDK mode for in-process (fast, event-driven, MCP proxy inheritance). tmux mode for filesystem-isolated (parallel code editors in worktrees).

**Model routing:** Opus for orchestration/review, Sonnet for implementation, Haiku for scouts/simple, local models for zero-cost file ops.

**Tool access:** CLI over MCP for git, GitHub (`gh`), Docker, npm. MCP only for browser automation and services without CLIs.

**Quality gates:** Lint -> Unit Tests -> E2E (agent-browser) -> CodeRabbit -> Human Review. Max 2 CI retries, then escalate model or skip+log.

**Infrastructure:** Context-Gateway (compaction) + Langfuse (traces) + Cognee (memory).

**State:** orchestrator-state.json (centralized truth) + events.jsonl per agent (audit trail) + appendEntry() per session (compaction-surviving).

### Implementation Roadmap

| Phase | Timeline | Effort | Exit Criteria |
|-------|----------|--------|---------------|
| 1. Foundation | Weeks 1-2 | ~400 lines TS | All 4 absolute rules enforced by code. State survives compaction. Observability live. |
| 2. Multi-Agent Loop | Weeks 3-5 | ~550 lines TS | Full orchestration loop in sequential and parallel modes. Semantic memory active. |
| 3. Migration & Polish | Weeks 6-8 | ~1,030 lines TS | All projects on Pi. 30% cost reduction target. npm package published. |

**Total:** ~1,980 custom + ~2,000 community = ~4,000 lines. ~17 development days.

**Monthly cost:** Solo/small team $120-400. Production scale $2,000-8,000.

### Top 5 Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| 1 | Pi bus factor of 1 | Medium | Critical | MIT = forkable. Adapter layer. Monitor oh-my-pi. |
| 2 | Anthropic ships native Agent Teams | Medium-High | High | Build patterns generic solutions cannot match. Orchestration layer is the asset. |
| 3 | Pi breaking changes | High | Medium | Pin versions. Adapter layer absorbs breakage. CI tests against Pi. |
| 4 | Cost explosion from unbounded runs | Medium | High | Fleet-wide budget caps. `--max-turns`. Max 2 retries. Model routing. |
| 5 | Context contamination | Medium | Medium | Strict orchestrator-worker separation. File reservation. Per-agent worktree. `context` event. |

### People to Follow

IndyDevDan (agentic engineering pioneer), Elvis Sun (Zoe orchestrator, 94 commits/day), Mario Zechner (Pi creator), Steve Yegge (Gas Town, Beads), Geoffrey Huntley ("context = malloc"), Dexter Horthy (40-60% utilization rule), nicobailon (pi-subagents/messenger/mcp-adapter), Muratcan Koylan (Agent Skills, 12.9K stars), Peter Steinberger/steipete (CLIs over MCPs, joined OpenAI), Matt Shumer (Feb 2026 "psychological breakpoint").

### The One Insight

> **The orchestrator is not the product. It is the factory that builds the products.** Every hour invested in orchestrator quality compounds across every future project. Stripe invested in Minions: 1,300+ agent PRs/week. Elvis invested in Zoe: solo SaaS with 3-5 person output. The orchestrator is the highest-leverage investment because it is a multiplier on everything else.

---

## Actionable Insights

1. **Deploy the MUST-HAVE stack immediately** -- Pi + extensions, Context-Gateway, agent-browser, Langfuse, git worktrees. Zero financial cost, maximum leverage.
2. **Follow the 8-week roadmap** -- Foundation (discipline + state) -> Multi-Agent Loop -> Migration. ~17 dev days total.
3. **Enforce the 10 laws as architectural constraints**, not guidelines. Programmatic enforcement via extensions, not system prompt instructions.
4. **The hybrid approach is the only correct answer** for build-vs-buy. Minimal SDK + custom orchestration logic. Not full custom, not a framework.
5. **Invest in the orchestrator** as the compounding asset. Do not optimize for shipping the orchestrator fast. Optimize for building it right -- with discipline, context engineering, crash recovery, and observability baked in. Then let it build everything else.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/phase1-synth-pi-ecosystem.md](phase1-synth-pi-ecosystem.md) | Pi Agent ecosystem detail (source synthesis 1 of 5) |
| [reference/phase1-synth-alternative-harnesses.md](phase1-synth-alternative-harnesses.md) | Alternative harnesses (source synthesis 2 of 5) |
| [reference/phase1-synth-vision-strategy.md](phase1-synth-vision-strategy.md) | Vision and strategy (source synthesis 3 of 5) |
| [reference/phase1-synth-tools-landscape.md](phase1-synth-tools-landscape.md) | Tools landscape (source synthesis 4 of 5) |
| [reference/phase1-synth-deep-dives.md](phase1-synth-deep-dives.md) | Cross-cutting deep dives (source synthesis 5 of 5) |
| [reference/dotta-network-intelligence-map.md](dotta-network-intelligence-map.md) | Dotta's network analysis with 10 universal laws (parallel synthesis) |
| [reference/harness-comparison-matrix.md](../reference/harness-comparison-matrix.md) | Quantitative harness scoring data |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | DeepMind coordination overhead economics |
| [reference/master-blueprint.md](../reference/master-blueprint.md) | System architecture consuming these findings |
| [practitioners/dotta.md](../practitioners/dotta.md) | Paperclip, heartbeat execution, budget-as-safety |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | Agentic engineering pioneer, trust framework |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Solo builder proving orchestrator-as-factory thesis |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Primary harness choice |
