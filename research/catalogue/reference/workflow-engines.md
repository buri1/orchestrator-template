# Workflow Engines for Agent Orchestration

> **Comparison of nine workflow approaches (Temporal, Inngest, LangGraph, MEOW/Gas Town, XState, JSON state files, SQLite, Prefect, DBOS) for agent orchestration, with a three-tier architecture recommendation for resource-constrained deployment.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_workflow-engines-for-agents.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

This document evaluates workflow engines and state machines for agent orchestration, spanning enterprise durable execution platforms (Temporal, DBOS), AI-native graph frameworks (LangGraph, Inngest AgentKit), adapted traditional orchestrators (Prefect, Airflow), custom state machines (Gas Town MEOW, XState, JSON files, SQLite), and low-code builders (n8n, Dify). The central finding: for resource-constrained deployment (Pi-based or single-machine), the optimal strategy is a three-tier architecture -- JSON state files for session management, SQLite for durable task queues, and optional cloud delegation (DBOS/Temporal) for mission-critical workflows.

The research validates the L-Thread Orchestrator's existing JSON state file approach while identifying SQLite as the natural evolution path for ACID guarantees and queryability. DBOS emerges as the most relevant innovation: Temporal-grade durability delivered as a library rather than a server, demonstrating that durable execution does not require heavy infrastructure.

---

## Key Findings

### Tier 1: Enterprise Durable Execution

**Temporal** -- The most mature platform. Separates workflows (deterministic, replayable) from activities (non-deterministic, I/O). On crash, replays workflow from event history without re-executing completed activities. Now officially integrated with OpenAI Agents SDK and PydanticAI. Strengths: true crash recovery via replay, long-running workflow support, multi-agent coordination via signals/queries. Limitations: requires running a Temporal server (Go services + PostgreSQL/Cassandra), too heavy for edge devices, steep learning curve. Verdict: not suitable for on-device deployment, but Temporal Cloud works as a remote durability layer.

**DBOS** -- The key innovation: durable execution as a library, not a server. Provides Temporal-grade crash recovery using Postgres-backed (or SQLite-adaptable) state persistence. Workflow functions and steps are ordinary Python/TypeScript functions with no special DSL. Claims 25x better price-performance than AWS Lambda + Step Functions. Verdict: the most relevant engine for L-Thread -- demonstrates that a Pi orchestrator could implement DBOS-style durable execution using SQLite, gaining crash recovery without external services.

### Tier 2: AI-Native Frameworks

**Inngest AgentKit** -- Event-driven platform with three abstractions: Agents (LLM calls + tools), Networks (agent groups with shared state), Routers (deterministic or LLM-based routing). Key innovation: state-based routing rather than hard-coded graph edges, providing flexibility of conversational systems with predictability of structured workflows. TypeScript-native with MCP integration. Limitation: cloud-dependent, TypeScript-only.

**LangGraph** -- Graph-first orchestration with the strongest checkpoint system (PostgresSaver, SQLiteSaver, MemorySaver). Fault recovery at node level -- failed nodes resume from last successful checkpoint without re-running completed peers. Finishes 2.2x faster than CrewAI with best-in-class token efficiency. Real-world caveat: Grid Dynamics reported their LangGraph + Redis architecture was "powerful in concept but incredibly brittle in practice." Python-only with LangChain coupling.

### Tier 3: Custom State Machines

**Gas Town MEOW Stack** (Steve Yegge) -- Five-layer workflow abstraction for 20-30 parallel coding agents. Layers: Formulas (TOML templates) → Protomolecules (factory patterns) → Molecules (runtime workflow chains) → Epics (hierarchical task trees) → Beads (atomic work units). Beads stored as JSONL and tracked via Git. Key validation: sophisticated orchestration built entirely on file-based state without databases.

**XState** -- Finite state machines + actor model for TypeScript. Formal state machine semantics prevent impossible states. Visual debugging via Stately Studio. `@statelyai/agent` package targets LLM agent orchestration specifically. Lightweight (browser-runnable), zero infrastructure required.

**JSON State Files** (L-Thread approach) -- Plain JSON files for agent status, task assignments, workflow progress. Git-trackable, zero dependencies, trivially debuggable. Validated by Microsoft Agent Framework (FileCheckpointStorage), TaskQueue MCP Server, and Overstory. Limitations: no concurrency control, no query capabilities, no transactional guarantees.

**SQLite-Backed State** -- The sweet spot between JSON and full databases. AgentFS (Turso) provides standardized SQLite schema with FUSE mounting. OpenClaw uses SQLite as state machine for indexing. Gunnar Morling demonstrated building durable execution engines with SQLite. Strengths: ACID transactions, queryable, single-file deployment, WAL mode concurrency, works on Raspberry Pi.

### Tier 4: Traditional Orchestrators

**Prefect** -- Most agent-friendly traditional orchestrator. Follows Python control flow (while loops, runtime branching) unlike Airflow's precompiled DAGs. Wraps PydanticAI agents with automatic retries, result caching, task-level observability. Too infrastructure-heavy for edge deployment.

**Airflow** -- DAG-based architecture fundamentally conflicts with agent orchestration. DAGs must be defined before execution; cannot dynamically add tasks based on runtime decisions. Not recommended.

### Comparison Matrix Summary

| Engine | Durability | Pi Deployable | Resource Footprint | Crash Recovery |
|--------|-----------|--------------|-------------------|----------------|
| Temporal | Excellent (replay) | No (client only) | Very Heavy | Full replay |
| DBOS | Excellent (replay) | Yes (with SQLite) | Light | Full replay |
| LangGraph | Good (checkpoints) | Yes (with SQLite) | Medium | Checkpoint resume |
| MEOW/Gas Town | Good (Git-backed) | Yes | Light | Git restore |
| XState | None (in-memory) | Yes | Very Light | Manual |
| JSON State Files | Poor (no ACID) | Yes | Minimal | Manual |
| SQLite State | Good (ACID) | Yes | Light | Transaction rollback |
| Inngest | Good (event-driven) | No (cloud) | Medium | Event replay |
| Prefect | Good (retries) | No | Heavy | Task retry |

---

## Actionable Insights

### Three-Tier Architecture Recommendation

**Tier 1 -- JSON State Files (keep current approach)**: For session management, agent lifecycle tracking, simple task coordination. Enhancement: add JSONL write-ahead logging for crash recovery without adding dependencies.

**Tier 2 -- SQLite State Machine (recommended evolution)**: Migrate critical workflow state. Gains: ACID transactions (no corrupted state on crash), queryable history, single-file deployment, proven Pi compatibility. Implementation: DBOS-style decorators that persist execution state to SQLite, resuming from last completed step on restart. AgentFS schema as reference design.

**Tier 3 -- Cloud Durable Execution (for mission-critical)**: Delegate multi-hour workflows to DBOS Cloud or Temporal Cloud. Pi submits workflows and receives completion events. Cloud handles retries, replay, and persistence.

### Why NOT Full Frameworks

LangGraph/CrewAI orchestrate the internal logic of agents (tool calling, reasoning, handoff). The Pi orchestrator solves the external coordination problem (spawning, monitoring, state management, crash recovery). These are complementary -- spawned agents can internally use frameworks; the orchestrator needs lightweight state management.

### Concrete Next Steps

1. **Immediate**: Add JSONL write-ahead logging to existing JSON state files
2. **Short-term**: Introduce SQLite store alongside JSON; migrate task queue and agent history
3. **Medium-term**: DBOS-style durable execution wrappers around critical orchestrator functions
4. **Long-term**: Cloud delegation for guaranteed-completion workflows

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [DSPy](../agent-harnesses/dspy.md) | Stateless module framework; no state management (compilation handles robustness) |
| [OpenClaw](../orchestration-platforms/openclaw.md) | Uses SQLite as state machine for indexing; validates SQLite-on-Pi pattern |
| [IndyDevDan](../practitioners/indydevdan.md) | TAC framework's agent chaining uses file-based state persistence |
| [Steve Yegge](../practitioners/steve-yegge.md) | Gas Town MEOW stack: JSONL + Git for 20-30 agent orchestration without databases |
| [multi-agent-frameworks-landscape](./multi-agent-frameworks-landscape.md) | Framework-level context for LangGraph, Swarms checkpointing approaches |
| [orchestrator-topology-patterns](./orchestrator-topology-patterns.md) | State management patterns per topology (centralized vs. distributed) |
