# Orchestrator Topology Patterns

> **Six primary multi-agent topologies (hub-spoke, hierarchical, pipeline, DAG, swarm, mesh) with communication, state management, error handling, scaling patterns, and eight anti-patterns to avoid.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_orchestrator-architecture-patterns-deep.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

This document provides the definitive 2026 guide to multi-agent orchestration architecture, covering topology selection, communication patterns, state management, error handling, scaling tiers, and anti-patterns. The research draws from academic papers, industry guides, framework documentation, and production postmortems. The core finding: the 2026 consensus is hybrid architectures -- pure orchestration (central control) and pure choreography (distributed autonomy) each have limitations; practical systems combine both. The choice of topology is the single most consequential architectural decision in a multi-agent system.

The document also codifies eight anti-patterns ("bag of agents," unbounded autonomy, unbounded loops, premature framework adoption, role confusion, messy data contracts, polling tax, and ignoring observability) that represent the most common and costly mistakes in production systems. Error propagation research quantifies naive multi-agent setups as producing 17x more errors than well-structured single agents.

---

## Key Findings

### The Six Primary Topologies

**1. Hub-and-Spoke (Centralized Orchestration)**
A single orchestrator dispatches tasks to specialized workers and collects results. Workers never communicate directly. Simple mental model, deterministic routing, natural fit for disjoint capabilities. Weakness: single point of failure, context budget pressure on orchestrator, serialized latency. Canonical examples: ChatDev's "CEO" agent, Claude Code Teams mode.

**2. Hierarchical (Multi-Tier Delegation)**
Extends hub-spoke with intermediate supervisor agents. Orchestrator defines strategy, supervisors translate to tactical plans, workers execute atomic tasks. Each supervisor manages 5-10 agents. Scales past context bottleneck, enables domain decomposition, isolates failures. Weakness: multi-hop latency, cross-supervisor coordination, "telephone game" distortion. Use when: 10+ agents with clear domain boundaries.

**3. Pipeline (Sequential Chain)**
Linear arrangement analogous to Unix pipes. Agent A output becomes Agent B input. Trivially easy to debug, each agent independently optimizable, minimal coordination overhead. Weakness: no parallelism, error cascade, poorly suited for iterative refinement. Use for: document processing, content pipelines, compliance checking chains.

**4. Graph-Based (DAG Execution)**
Agents and dependencies modeled as directed acyclic graph. Runtime executes in topological order, parallelizing independent branches. Conditional edges enable adaptive workflows. Controlled cycles allow iterative refinement. Maximum parallelism, explicit dependency modeling, native checkpointing. Weakness: higher cognitive complexity, harder debugging. LangGraph is the canonical implementation. Dominant paradigm for complex workflows in 2026.

**5. Swarm (Emergent Coordination)**
Multiple agents share conversation context, dynamically handing off to whichever agent fits the current step. No fixed topology -- coordination emerges from shared state. Extremely flexible, low ceremony, natural for conversational systems. Weakness: unbounded context growth, unpredictable execution paths, hallucination loops. OpenAI's Swarm framework is the canonical implementation.

**6. Peer-to-Peer Mesh**
Direct agent-to-agent communication without central coordinator. No single point of failure, maximally parallel. Weakness: O(n^2) communication complexity, extremely difficult debugging, no natural owner for cross-cutting concerns. 2026 validation: four Claude Opus agents with peer-to-peer coordination proving atomic task claiming under concurrent access.

**7. Hybrid (The 2026 Consensus)**
The winning pattern combines topologies: high-level orchestrators for strategic coordination + local meshes or swarms for tactical execution within bounded domains. Example: hierarchical top level with DAG scheduling, swarms within teams, critical cross-team decisions escalating to orchestrator.

### Communication Patterns

- **Direct messaging**: Low latency, tight coupling. Used in pipeline and hub-spoke.
- **Mailbox/queue-based**: Decouples sender/receiver lifetimes. Dominant in event-driven architectures (Kafka).
- **Broadcast**: O(n) message volume. Used in swarm topologies with shared conversation history.
- **File-based**: Simple, debuggable, naturally persistent. Used in CLI-based systems like L-Thread Orchestrator.
- **Memory-based (shared state)**: Fast but volatile. LangGraph's state graph pattern.
- **Network-based**: HTTP, gRPC, WebSockets, message brokers. Required for distributed deployment. MCP (agent-to-tool) and A2A (agent-to-agent) are 2026's leading standards.
- **Event-driven > Polling**: Event-driven is architecturally superior. Polling is an anti-pattern in production ("Polling Tax").

### State Management

The primary bottleneck in enterprise AI is memory, not model intelligence. "Agentic amnesia" -- catastrophic context loss -- is the defining operational challenge.

- **Centralized + local hybrid**: Most practical. Centralized for orchestrator-level tracking, local state within each agent.
- **Checkpointing approaches**: Per-superstep (LangGraph), per-tool-call (long-running agents), Temporal-style durable execution (replay-based).
- **Storage backends**: Redis (sub-ms hot state), PostgreSQL (ACID durability, default for production), SQLite (lightweight, zero-config), S3 (archival/compliance).
- **Crash recovery**: Checkpoint-aware state machines, idempotent tool calls, graceful degradation with heartbeat-based failure detection.

### Error Handling: Five Failure Categories

1. **Infrastructure**: Network timeouts, OOM, crashes -- traditional distributed systems problems
2. **API**: Rate limits, quota exhaustion, model outages -- transient, recoverable
3. **Semantic**: Hallucinations that return HTTP 200 -- hardest to detect, no error signal
4. **Coordination**: Agents interpreting instructions differently -- both "correct" within their context
5. **Cascade (17x error trap)**: Early hallucination passed downstream as fact, snowballing into total failure

Key patterns: exponential backoff with jitter, semantic retry (modify prompt before retry), bounded retries, four-state circuit breakers (CLOSED/OPEN/HALF-OPEN/DEGRADED), confidence-based escalation to humans.

### Scaling Tiers

| Agents | Tier | Topology | Key Requirements |
|--------|------|----------|-----------------|
| 2-3 | Micro | Any (hub-spoke simplest) | Single JSON state, sync comms |
| 4-7 | Small | DAG or simple hierarchy | Async comms, checkpointing mandatory |
| 8-15 | Medium | Hierarchical (3-5 workers per lead) | Distributed state, model routing |
| 16+ | Large | Full hybrid | Event-driven comms, cluster circuit breakers, observability |

The primary bottleneck is communication, not computation. Planning and coordination consume the most tokens.

### Eight Anti-Patterns

1. **Bag of Agents**: No formal topology → 17x error trap, hallucination loops
2. **Unbounded Autonomy**: No permission scopes → portfolio liquidation, resource deletion
3. **Unbounded Loops**: No termination conditions → infinite remediation, cost explosion
4. **Premature Framework Adoption**: LangGraph for a three-step pipeline → unnecessary complexity
5. **Role Confusion**: Overlapping responsibilities → "DU BIST KEIN ENTWICKLER"
6. **Messy Data Contracts**: Unstructured inter-agent JSON → silent failures, the leading cause in production
7. **Polling Tax**: Periodic checks → wasted resources, latency. Use event-driven.
8. **Ignoring Observability**: No structured logging → unreconstructable failures

### Emerging Patterns

- **Evolving orchestration**: Topology itself evolves during execution, exhibiting compaction and cyclicality
- **Trained orchestrators**: NVIDIA's Orchestrator-8B (small model trained for routing) outperforms large general-purpose models on orchestration tasks
- **Bounded autonomy as default**: "What is the minimum autonomy needed to accomplish the task safely?"
- **Context as infrastructure**: Memory, checkpoints, context management treated with same rigor as database design

---

## Actionable Insights

- **Decision framework**: Can a single agent solve it? → single agent. Fixed sequence? → pipeline. Independent subtasks? → DAG. 2-5 specialists? → hub-spoke. 6-15 with domains? → hierarchical. Dynamic selection? → swarm. 15+ complex? → hybrid.
- **Universal rules at every scale**: Explicit agent roles (no overlap), event-driven comms (no polling), checkpoint at every meaningful boundary, bounded loops with escalation, tiered model routing (cheap for classification, expensive for reasoning), instrument everything.
- **L-Thread Orchestrator mapping**: Conduit mode = pipeline/hub-spoke. Teams mode = DAG/hierarchical. Tmux mode = manual hybrid. The orchestrator's state.json is already centralized state; agent tmux sessions provide local state.
- **Model routing**: Use Opus/GPT-4.5 for orchestrator decisions, Sonnet/GPT-4o for worker tasks, Haiku/GPT-4o-mini for classification/routing.
- **MCP + A2A complementary**: MCP for agent-to-tool, A2A for agent-to-agent. Combine both for scalable, decentralized systems.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [DSPy](../agent-harnesses/dspy.md) | Compilable programs paradigm; GEPA for multi-agent optimization |
| [OpenClaw](../orchestration-platforms/openclaw.md) | Production hub-spoke implementation with lane queuing |
| [IndyDevDan](../practitioners/indydevdan.md) | TAC course teaches topology-aware agent orchestration |
| [Steve Yegge](../practitioners/steve-yegge.md) | Gas Town uses hierarchical topology (Mayor + 7 roles, 20-30 agents) |
| [multi-agent-frameworks-landscape](./multi-agent-frameworks-landscape.md) | Framework-level implementations of these topology patterns |
| [workflow-engines](./workflow-engines.md) | Durability layer (Temporal, DBOS) underneath topology patterns |
| [scaling-economics](./scaling-economics.md) | Cost and throughput implications of topology choices |
