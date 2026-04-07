# Multi-Agent Frameworks & SDKs Landscape

> **Comparative analysis of five major multi-agent frameworks (Swarms, DSPy, Agentica, LangGraph, Letta) with portable patterns extractable for lightweight harness architectures.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_multi-agent-frameworks-analysis.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

This document analyzes five multi-agent frameworks across architecture, communication, state management, error recovery, and scalability dimensions. The frameworks span the full spectrum from maximally opinionated (Swarms, 25K+ stars, all topologies behind a SwarmRouter) to anti-framework minimalism (Agentica, TypeScript functions as the only abstraction). The 2026 industry consensus has converged on a clear distinction between frameworks (compose an agent loop) and harnesses (operate an agent loop), with harnesses expected to get simpler as models improve -- infrastructure that can be progressively deleted.

Seven portable patterns were extracted for lightweight harness implementations: topology-aware routing, checkpoint-based resume, tiered memory, sleep-time processing, handoff protocols, automatic prompt optimization, and topology-aware agent spawning. The analysis concludes that the L-Thread Orchestrator should follow a "progressively deletable infrastructure" principle: prompts and state files are the durable investment; orchestration logic should shrink as model capabilities grow.

---

## Key Findings

### Framework Architectures

**Swarms** (Kye Gomez, 25K+ GitHub stars) is the heaviest-weight option, providing 8+ pre-built orchestration topologies behind a single `SwarmRouter` abstraction. Supports sequential, concurrent, mixture-of-agents, agent-rearrange (einsum-inspired), group chat, hierarchical, council, and spreadsheet patterns. Enterprise-grade with message passing, shared memory, Redis/Pulsar integration, and audit logging. Cost: deep framework lock-in.

**DSPy** (Stanford NLP, 20K+ stars) treats LLM interactions as compilable programs. Its killer feature is automatic prompt optimization via MIPRO, BootstrapFewShot, and GEPA optimizers -- no other framework automates prompt engineering. Lowest framework overhead at ~3.5ms (vs. LangChain ~10ms, LangGraph ~14ms). Requires ML thinking (metrics, optimization loops) which limits adoption by pure software engineers.

**Agentica** (Samchon/wrtnlabs) is the anti-framework: if you can write TypeScript functions, you can build agents. Uses typia (20,000x faster JSON validation) for compiler-level type analysis. No graphs, no orchestration layers. Multi-agent comes from composing function sets from multiple domains. A bet on model capability -- as models improve at tool use, explicit orchestration becomes unnecessary.

**LangGraph** (Harrison Chase/LangChain Inc.) is the most mature production framework. Graph-first orchestration with three key patterns: supervisor (central coordinator), handoff (dynamic agent-to-agent transfer), and message bus (shared state communication). Unmatched checkpointing with PostgresSaver/SQLiteSaver and full fault recovery. Trade-off: ~14ms overhead, deep dependency tree, API churn.

**Letta/MemGPT** (Charles Packer et al., 15K+ stars) solves the memory persistence problem with a three-tier system: core memory (in-context, like RAM), archival memory (vector DB, like disk), and recall memory (conversation history, like logs). Novel sleep-time compute enables background agents to consolidate memories, identify patterns, and pre-compute responses. Introduced the open `.af` agent file format for portability.

### Comparative Matrix Highlights

| Dimension | Best Option | Notable |
|-----------|------------|---------|
| Max practical agents | Swarms (100+) | LangGraph (~20), DSPy/Letta (~10) |
| State persistence | LangGraph (PostgresSaver) | Letta (DB-persisted tiered memory) |
| Error recovery | LangGraph (checkpoint resume) | Letta (DB persistence) |
| Framework overhead | DSPy (~3.5ms) | LangGraph (~14ms), Swarms (heavy) |
| Lock-in risk | DSPy/Agentica (low) | Swarms/LangGraph (high) |
| Cross-session state | Letta (core feature) | LangGraph (via checkpoints) |

### The Harness vs. Framework Distinction

The 2026 consensus: capabilities requiring complex hand-coded pipelines in 2024 are handled by single context-window prompts in 2026. Harnesses should get simpler as models improve. Use a framework when you need 20+ agents, production-grade fault tolerance, or enterprise compliance. Use a harness when you need 2-10 agents, value simplicity, want model-agnosticism, and iterate fast.

### Seven Portable Patterns

1. **SwarmRouter topology selector** -- prompt-level decision selecting sequential, concurrent, mixture, or hierarchical topology per task
2. **Checkpoint-based resume** -- state JSON with step tracking, output hashing, and "resume from step N" capability
3. **Tiered memory** -- core (always in prompt), working (current task), archival (searchable via grep), recall (git log + session logs)
4. **Sleep-time processing** -- background tmux agents running consolidation between active work sessions
5. **Handoff protocol** -- structured handoff context files enabling agent-to-agent transitions with orchestrator routing
6. **Prompt optimization loop** -- track prompt version performance, generate improved versions, A/B test, promote winners
7. **Topology-aware spawning** -- orchestrator selects conduit (sequential), teams (parallel), or groupchat mode based on task structure

---

## Actionable Insights

- **High priority**: Formalize tiered memory (already partially implemented via state files), enhance checkpoint resume with output hashing, and add topology-aware routing prompt to orchestrator agent
- **Medium priority**: Implement handoff protocol with structured context files; add sleep-time consolidation via idle tmux sessions
- **Low priority / watch**: GroupChat debate mode, agent file format (.af), full DSPy compilation (wait for sufficient run data)
- **Architecture principle**: Build progressively deletable infrastructure -- prompts (permanent) > state files (durable) > lifecycle hooks (light) > tmux helpers (replaceable) > orchestration logic (simplify as models improve)
- **The Bitter Lesson**: If the harness scales by adding human-authored structure, it fights the Bitter Lesson. The part that scales is the model, not bespoke scaffolding.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [DSPy](../agent-harnesses/dspy.md) | Framework deep-dive; GEPA optimizer for multi-agent pipeline optimization |
| [OpenClaw](../orchestration-platforms/openclaw.md) | Production harness validating lightweight approach over heavy frameworks |
| [IndyDevDan](../practitioners/indydevdan.md) | TAC course teaches agent chaining patterns aligned with portable patterns |
| [Steve Yegge](../practitioners/steve-yegge.md) | Gas Town MEOW stack validates file-based state at 20-30 agent scale |
| [harness-comparison-matrix](./harness-comparison-matrix.md) | Scoring of 10 harnesses across 20 dimensions |
| [orchestrator-topology-patterns](./orchestrator-topology-patterns.md) | Deep dive on the six topology patterns referenced in framework analysis |
| [workflow-engines](./workflow-engines.md) | Temporal, DBOS, and other engines providing durability layer beneath frameworks |
