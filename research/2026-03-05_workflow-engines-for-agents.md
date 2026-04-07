# Workflow Engines and State Machines for Agent Orchestration

**Research Date:** 2026-03-05
**Focus:** Which workflow approach is best for a Pi-based orchestrator?

---

## Executive Summary

The agent orchestration space in 2026 has fragmented into distinct tiers: enterprise-grade durable execution engines (Temporal, DBOS), AI-native graph frameworks (LangGraph, Inngest AgentKit), adapted traditional orchestrators (Prefect, Airflow), custom state machines (Gas Town MEOW, XState, JSON state files, SQLite-backed), and low-code visual builders (n8n, Dify). For a Pi-based orchestrator running on constrained hardware, the optimal strategy is a **tiered approach**: a lightweight file-based or SQLite-backed state machine for local orchestration, with the option to delegate to cloud-hosted durable execution (DBOS or Temporal) for workflows requiring enterprise-grade guarantees. This document analyzes each approach in depth and provides a comparison matrix for decision-making.

---

## 1. Temporal: Durable Execution for Agents

### Overview

Temporal is the most mature durable execution platform, providing infrastructure-level guarantees that workflow code will execute to completion regardless of crashes, network failures, or infrastructure outages. In 2025-2026, Temporal has aggressively positioned itself as the foundation layer for production AI agent systems.

### How It Works

Temporal separates code into two categories:

- **Workflows** (deterministic): Execute identically when replayed with the same inputs. These define the orchestration logic -- which agent runs when, what happens on failure, how to handle branching decisions.
- **Activities** (non-deterministic): Can perform I/O, call LLMs, execute tools. These are the actual agent work units.

When a worker crashes, Temporal replays the workflow from its event history. It does not re-execute completed activities -- it uses recorded results from history and picks up at the exact point of failure. This is the "durable execution" guarantee.

### Agent Integration Pattern

The `TemporalAgent` wrapper (via Pydantic AI) demonstrates the canonical pattern: any agent can be wrapped to gain durability by automatically offloading model requests, tool calls, and MCP server communication to non-deterministic activities. If a worker crashes after a dispatcher agent succeeds but before a researcher agent starts, Temporal replays the workflow, skips the dispatcher (using cached results), and resumes at the researcher call.

OpenAI's Agents SDK now officially integrates with Temporal. Google's Gemini documentation includes Temporal integration examples. This signals that durable execution is becoming a baseline requirement, not a premium feature.

### Strengths for Agent Orchestration

- **True crash recovery**: Not checkpoint-based restart, but replay-based resumption from the exact failure point.
- **Long-running workflows**: Agents that run for hours or days are first-class citizens.
- **Multi-agent coordination**: Workflow-to-workflow communication via signals and queries.
- **Enterprise adoption**: 40% of enterprise applications are predicted to feature task-specific AI agents by end of 2026 (Gartner), and Temporal is the infrastructure many are choosing.

### Limitations

- **Operational complexity**: Requires running a Temporal server (or paying for Temporal Cloud). The server itself needs PostgreSQL or Cassandra.
- **Resource footprint**: Far too heavy for a Raspberry Pi. The Temporal server cluster requires multiple Go services, a database, and significant memory.
- **Learning curve**: The workflow/activity separation and determinism constraints require significant mental model shifts.
- **Overkill for simple orchestration**: If your agents are short-lived and failure is tolerable, Temporal adds unnecessary complexity.

### Verdict for Pi-Based Orchestrator

**Not suitable for on-device deployment.** However, Temporal Cloud could serve as a remote durability layer that a Pi-based orchestrator delegates to for mission-critical, long-running workflows. The Pi would act as a lightweight client submitting workflows to a cloud-hosted Temporal cluster.

---

## 2. Inngest: Event-Driven Agent Orchestration

### Overview

Inngest takes a fundamentally different approach from Temporal: instead of a separate orchestration server, it provides an event-driven platform where functions are triggered by events and executed with built-in durability. Its AgentKit framework (released 2025) is purpose-built for multi-agent systems.

### AgentKit Architecture

AgentKit introduces three core abstractions:

- **Agents**: LLM calls combined with prompts, tools, and MCP integrations.
- **Networks**: Collections of agents that collaborate with shared state and handoff capabilities.
- **Routers**: Deterministic or LLM-based routing logic that decides which agent runs next, based on shared state and message history.

The key innovation is **state-based routing**: rather than hard-coded graph edges, routing decisions are made dynamically based on the accumulated state of the network. This provides the flexibility of conversational multi-agent systems (like AutoGen) with the predictability of structured workflows (like LangGraph).

### step.ai Integration

Inngest's `step.ai.infer` proxies long-running LLM requests, reducing serverless compute costs while providing enhanced telemetry. The `useAgent` React hook (released September 2025) enables real-time streaming of updates from durable AI workflows directly to browser clients.

### Strengths

- **TypeScript-native**: First-class TypeScript support, which aligns well with Node.js-based orchestrators.
- **Event-driven**: Natural fit for reactive agent systems that respond to external triggers.
- **Deterministic routing with flexibility**: Code-based to fully autonomous routing while maintaining control.
- **MCP integration**: Native support for Model Context Protocol tooling.
- **Serverless-friendly**: Functions can run on edge/serverless infrastructure.

### Limitations

- **Cloud-dependent**: Inngest is primarily a cloud service. Self-hosting is possible but adds operational burden.
- **TypeScript-only**: AgentKit currently targets TypeScript developers exclusively.
- **Newer ecosystem**: Less battle-tested than Temporal for mission-critical workloads.

### Verdict for Pi-Based Orchestrator

**Partially suitable.** The event-driven model aligns well with a Pi orchestrator that reacts to sensor data, scheduled tasks, or external triggers. However, the cloud dependency and resource requirements for self-hosting make pure on-device deployment challenging. Best used as a cloud-side orchestration layer that a Pi triggers via events.

---

## 3. LangGraph: Graph-Based Stateful Agents

### Overview

LangGraph is a low-level orchestration framework for building stateful, multi-actor agent applications using graph architectures. It organizes agent actions as nodes in a directed graph, enabling conditional decision-making, parallel execution, and persistent state management. Companies including Klarna, Replit, and Elastic use it in production.

### State and Persistence Architecture

LangGraph's standout feature is its checkpoint system:

- **Checkpointers** save graph state at every super-step (a full pass through all concurrently executing nodes).
- **PostgresSaver** provides production-grade persistence: durable, queryable, debuggable, and enterprise-ready.
- **MemorySaver** provides in-memory checkpointing for development and testing.
- **SQLiteSaver** provides lightweight file-based persistence.

Fault recovery works at the node level: if one node fails mid-superstep, LangGraph stores pending checkpoint writes from other nodes that completed successfully, so resumption does not re-run successful nodes.

### Graph-First Orchestration

LangGraph provides explicit state machines with cyclical workflows and runtime graph mutation. Combined with MCP, this enables dynamic, language-native, recoverable multi-agent workflows. The graph structure makes agent interaction patterns visible and debuggable.

### Performance

LangGraph emerges as the fastest multi-agent framework with the fewest tokens in benchmark comparisons. Its graph-based architecture passes only necessary state deltas between nodes rather than full conversation histories, finishing 2.2x faster than CrewAI with significantly better token efficiency.

### Real-World Challenges

A case study from Grid Dynamics revealed practical issues: their LangGraph + Redis architecture was "powerful in concept but incredibly brittle in practice." Key pain points included implementing robust error handling, managing internal state debugging, high scaling costs, and the expense of supporting custom workflows. The team reported "constantly fighting limitations of the tooling instead of focusing on core business logic."

### Strengths

- **Explicit state management**: Clear visibility into what state exists and how it transitions.
- **Flexible persistence**: Multiple checkpointer backends from in-memory to PostgreSQL.
- **Python ecosystem**: Deep integration with LangChain and the broader Python AI ecosystem.
- **Token efficiency**: Best-in-class performance for multi-agent token usage.
- **Human-in-the-loop**: Built-in support for pausing execution and waiting for human input.

### Limitations

- **Python-only**: No first-class TypeScript/JavaScript support.
- **LangChain coupling**: While usable standalone, the best experience comes within the LangChain ecosystem.
- **Brittleness at scale**: Real-world reports of debugging difficulties and scaling challenges.
- **No infrastructure durability**: Checkpoints provide state persistence, not the full replay-based durability of Temporal.

### Verdict for Pi-Based Orchestrator

**Viable with SQLiteSaver.** LangGraph with SQLite-based checkpointing could run on a Pi for Python-based orchestration. The graph model maps well to multi-agent workflows. However, the Python runtime and LangChain dependencies add resource overhead. Best suited if the orchestrator is already Python-based and needs structured agent workflows with persistence.

---

## 4. Custom State Machines

### 4.1 Gas Town MEOW Stack

Steve Yegge's Gas Town framework (released January 2026) introduces the MEOW (Molecular Expression of Work) stack -- a five-layer workflow abstraction for managing colonies of 20-30 parallel AI coding agents:

| Layer | Description | Analogy |
|-------|-------------|---------|
| **Formulas** | TOML-based workflow source templates | Blueprints |
| **Protomolecules** | Template classes for instantiating workflows | Factory patterns |
| **Molecules** | Runtime workflow chains with loops, gates | Executable workflows |
| **Epics** | Hierarchical collections of Beads as tree structures | Project plans |
| **Beads** | Atomic work units with IDs, status, assignees | Individual tasks |

Beads are stored as JSONL and tracked via Git, providing crash-recoverable, Git-backed persistent orchestration. Molecules can be stitched together at runtime, unlike epics which define static hierarchies. Formulas define reusable patterns for operations like patrol cycles, code review, or deployment.

**Relevance to Pi orchestration:** The MEOW stack demonstrates that sophisticated multi-agent orchestration can be built entirely on file-based state (JSONL + Git) without requiring databases or external services. This is directly applicable to resource-constrained environments.

### 4.2 XState for Agent Workflows

XState implements finite state machines, statecharts, and the actor model for JavaScript/TypeScript applications. Its `@statelyai/agent` package specifically targets LLM agent orchestration:

- State machines guide agent behavior by incorporating observations, message history, and feedback.
- The actor model provides independent processes communicating through events, with parent-child hierarchies managed by an ActorSystem.
- Stately Expert enables agents guided by state machines that learn from experience through structured observations, feedback, and insights.

**Strengths:** Formal state machine semantics prevent impossible states, provide visual debugging via Stately Studio, and the actor model maps naturally to multi-agent systems.

**Limitations:** Additional abstraction layer over already complex agent logic. The formalism can feel constraining for the inherently non-deterministic nature of LLM-based agents.

**Relevance to Pi orchestration:** XState is lightweight (browser-runnable), TypeScript-native, and requires zero infrastructure. An excellent choice for a Node.js-based Pi orchestrator that needs formal state management without external dependencies.

### 4.3 Simple JSON State Files (L-Thread Approach)

The L-Thread orchestrator (this project) uses plain JSON state files (`orchestrator-state.json`, `orchestrator-teams-state.json`, `orchestrator-tmux-state.json`) for tracking agent status, task assignments, and workflow progress. This approach represents the filesystem-based agent state pattern:

- Agents write intermediate state to JSON files at each step.
- On startup, the orchestrator checks for previous state to resume from the last checkpoint.
- Git-trackable state provides audit trails and rollback capability.
- Zero dependencies beyond the filesystem.

The broader ecosystem validates this pattern: Microsoft's Agent Framework provides `FileCheckpointStorage` for JSON-based persistent checkpointing. The TaskQueue MCP Server uses JSON-based persistence with a simple state machine. Overstory (multi-agent orchestration for Claude Code and Pi) uses pluggable runtime adapters with file-based state.

**Strengths:** Maximum simplicity, zero infrastructure, works on any device with a filesystem, trivially debuggable (just read the JSON), Git-friendly for version control and audit.

**Limitations:** No built-in concurrency control (file locking needed for parallel writes), no query capabilities (must load full state to inspect), no transactional guarantees (partial writes on crash can corrupt state), limited scalability.

**Relevance to Pi orchestration:** This is the native approach for the L-Thread orchestrator and remains the most pragmatic choice for single-device, moderate-scale agent coordination.

### 4.4 SQLite-Backed State

SQLite has emerged as a sweet spot between JSON files and full databases for agent state management:

- **AgentFS** by Turso provides a standardized SQLite schema for agent filesystem state, with TypeScript, Rust, and Python SDKs. It even supports FUSE mounting, exposing agent state as a POSIX filesystem.
- **DBOS** provides lightweight durable workflows built on Postgres, but its architecture principle -- implementing durability in a library rather than an external server -- applies equally to SQLite.
- **OpenClaw** treats SQLite as the state machine for its indexing process, providing persistent memory as a RAG-lite local system.
- **Stabilize** uses `SqliteWorkflowStore` and `SqliteQueue` for lightweight DAG-based workflow orchestration.

The key insight from Gunnar Morling's work on building durable execution engines with SQLite: for self-contained AI agents, an embedded database provides persisted execution state without the overhead of client-server database architectures. SQLite ensures LLM invocations are not repeated when an agent crashes.

**Strengths:** ACID transactions, queryable state, single-file deployment, excellent read performance, built-in concurrency handling (WAL mode), works everywhere including Raspberry Pi.

**Limitations:** Write concurrency limited (single writer), no built-in replication, requires schema management.

**Relevance to Pi orchestration:** SQLite represents the natural evolution from JSON state files. It provides transactional guarantees and queryability while maintaining the single-file, zero-infrastructure simplicity that Pi deployment requires.

---

## 5. Prefect and Airflow: Traditional Orchestrators Adapted

### Prefect for Agents

Prefect has positioned itself as the most agent-friendly traditional orchestrator. Its key advantage: **Prefect follows Python's control flow** -- while loops, runtime branching, conditional logic. No precompiled graphs means agent state machines work natively. Traditional orchestrators like Airflow require precompiled DAGs, but agents are state machines that decide their next step at runtime.

Prefect wraps Pydantic AI agents with durable execution: automatic retries, result caching, and task-level observability. The integration is straightforward -- decorate agent functions with `@task` and get crash recovery, logging, and monitoring for free.

### Airflow Limitations

Apache Airflow's DAG-based architecture fundamentally conflicts with agent orchestration. DAGs must be defined before execution -- you cannot dynamically add tasks based on agent decisions at runtime. While Airflow 2.x introduced dynamic task mapping, it remains oriented toward batch data processing rather than interactive agent workflows.

### Verdict for Pi-Based Orchestrator

**Not recommended for Pi deployment.** Both Prefect and Airflow require significant infrastructure (web servers, databases, schedulers). Prefect's Python-native approach is intellectually appealing but operationally heavy for edge devices. If the Pi orchestrator needs to trigger cloud-based data pipelines, Prefect is an excellent choice for the cloud side.

---

## 6. Agent-Specific Workflow Tools (2026 Landscape)

### New Purpose-Built Frameworks

The 2026 landscape has seen an explosion of agent-specific tools:

- **OpenAI Agents SDK**: First-party agent framework with built-in handoff, guardrails, and tracing. Integrates with Temporal for durability.
- **Google ADK (Agent Development Kit)**: Graph-based orchestration with Gemini integration.
- **Anthropic Agent SDK**: Claude-native agent framework.
- **CrewAI**: Role-based multi-agent orchestration (estimated 70% market share for business workflow agents by January 2026). Emphasizes role delegation and parallel execution.
- **AutoGen/Microsoft Agent Framework**: Conversation-based multi-agent systems. Microsoft has shifted AutoGen to maintenance mode in favor of the broader Microsoft Agent Framework, which includes `FileCheckpointStorage` for JSON-based persistence.
- **OpenClaw**: Specifically designed for Raspberry Pi deployment with a hybrid architecture -- Pi handles orchestration while calling cloud-hosted LLMs via API.

### Pi-Specific Tools

- **OpenClaw + Raspberry Pi**: Official Raspberry Pi blog endorsement. Agents on Pi integrate sensors, cameras, and GPIO while delegating LLM inference to cloud APIs.
- **PicoClaw**: Ultra-lightweight agent for Raspberry Pi Zero and Pi 3.
- **NanoClaw**: Mid-weight Python agent bridging PicoClaw and full-featured MoltClaw. Runs on affordable SBCs.
- **Pico-Cloud**: Micro-edge cloud on Pi Zero with container-based virtualization and lightweight orchestration.

### Low-Code/Visual Builders

- **n8n**: 150k+ GitHub stars, AI Workflow Builder with natural language workflow creation and 400+ integrations.
- **Dify**: AI-native app development platform with visual workflow orchestration, RAG pipelines, and agent framework.
- Both support self-hosting and could run on a Pi 5 for simple automation workflows, though they are resource-intensive.

---

## 7. DBOS: The Lightweight Durable Execution Alternative

DBOS deserves special attention as a middle ground between Temporal's heavy infrastructure and simple JSON state files. Its core principle: **durable execution should be a library, not a server.**

DBOS provides:
- Lightweight durable workflows as a Python/TypeScript library.
- Postgres-backed state persistence (but the architectural pattern applies to SQLite).
- Workflow functions and steps as ordinary functions -- no special DSL or separation into workflows/activities.
- Automatic crash recovery: if a process restarts, workflows resume from the last completed step.
- 25x better price-performance than AWS Lambda + Step Functions (per DBOS benchmarks).

**Why this matters for Pi:** DBOS demonstrates that Temporal-grade durability can be achieved without Temporal-grade infrastructure. A Pi-based orchestrator could implement DBOS-style durable execution using SQLite as the backing store, gaining crash recovery and exactly-once semantics without any external services.

---

## 8. Comparison Matrix

| Dimension | Temporal | Inngest/AgentKit | LangGraph | MEOW/Gas Town | XState | JSON State Files | SQLite State | Prefect | DBOS |
|-----------|----------|-----------------|-----------|---------------|--------|-----------------|-------------|---------|------|
| **Complexity** | Very High | High | Medium-High | Medium | Medium | Very Low | Low | High | Low-Medium |
| **Durability** | Excellent (replay) | Good (event-driven) | Good (checkpoints) | Good (Git-backed) | None (in-memory) | Poor (no ACID) | Good (ACID) | Good (retries) | Excellent (replay) |
| **Crash Recovery** | Full replay | Event replay | Checkpoint resume | Git restore | Manual | Manual (if no corruption) | Transaction rollback | Task retry | Full replay |
| **Scalability** | Excellent | Good (cloud) | Medium | Medium (file I/O) | Good (actors) | Poor (file locks) | Medium (single writer) | Good | Good |
| **Resource Footprint** | Very Heavy | Medium (cloud) | Medium | Light | Very Light | Minimal | Light | Heavy | Light |
| **Pi Deployable** | No (client only) | No (cloud) | Yes (with SQLite) | Yes | Yes | Yes | Yes | No | Yes (with SQLite) |
| **Language** | Go/Python/Java/TS | TypeScript | Python | TOML/JSONL | TypeScript | Any | Any | Python | Python/TypeScript |
| **Agent-Specific** | Growing | Yes (AgentKit) | Yes (LangChain) | Yes (coding agents) | Partial | No | No | Partial | Partial |
| **Dev Experience** | Steep curve | Good (TS devs) | Good (Python devs) | Steep (Yegge-specific) | Good (formal) | Excellent (simple) | Good | Good | Excellent |
| **Observability** | Excellent (Web UI) | Good (dashboard) | Good (LangSmith) | Basic (Git log) | Good (Stately Studio) | None (manual) | Basic (SQL queries) | Excellent (Web UI) | Good |
| **Human-in-the-Loop** | Yes (signals) | Yes (events) | Yes (checkpoints) | Yes (approval gates) | Yes (events) | Manual | Manual | Yes (tasks) | Yes (workflows) |

### When to Use Each

| Approach | Best For | Avoid When |
|----------|----------|------------|
| **Temporal** | Enterprise production agents, multi-day workflows, mission-critical operations | Resource-constrained devices, simple orchestration, small teams |
| **Inngest/AgentKit** | Event-driven TypeScript agent systems, serverless architectures | Python-based systems, offline/edge deployment |
| **LangGraph** | Python-based multi-agent workflows needing explicit state, LangChain ecosystem users | TypeScript projects, simple linear workflows, infrastructure-constrained environments |
| **MEOW/Gas Town** | Large-scale parallel coding agent colonies (20-30 agents), Git-centric workflows | Non-coding use cases, small-scale orchestration |
| **XState** | Formal state machine needs, TypeScript orchestrators requiring visual debugging | Python ecosystems, simple scripts, teams unfamiliar with state machine theory |
| **JSON State Files** | Prototyping, single-device orchestrators, maximum simplicity, Pi deployment | High-concurrency scenarios, large state, mission-critical durability |
| **SQLite State** | Pi deployment needing durability, queryable agent state, moderate scale | High write concurrency, distributed systems, cloud-native architectures |
| **Prefect** | Cloud-based Python agent pipelines with observability needs | Edge devices, non-Python systems, simple orchestration |
| **DBOS** | Lightweight durable execution without infrastructure overhead, Pi-compatible durability | Complex multi-namespace routing, systems needing Temporal's full feature set |

---

## 9. Recommendation: Optimal Architecture for Pi-Based Orchestrator

### The Three-Tier Strategy

Based on this research, the optimal architecture for a Pi-based orchestrator uses three tiers matched to workflow criticality:

#### Tier 1: JSON State Files (Current L-Thread Approach)
**For:** Session management, agent lifecycle tracking, simple task coordination.

Keep the existing `orchestrator-state.json` / `orchestrator-tmux-state.json` pattern. It works, it is debuggable, it is Git-trackable, and it requires zero infrastructure. For the majority of orchestration tasks -- spawning agents, tracking progress, managing tmux sessions -- this is sufficient.

**Enhancement:** Add a write-ahead pattern where state changes are appended to a `.jsonl` log before modifying the main state file. This provides crash recovery without adding dependencies.

#### Tier 2: SQLite-Backed State Machine (Recommended Evolution)
**For:** Durable task queues, agent work history, crash-recoverable workflows, queryable state.

Migrate critical workflow state to SQLite. This provides:
- ACID transactions (no more corrupted state on crash).
- Queryable history (find all failed tasks, check agent utilization).
- Single-file deployment (just one `.db` file, fully portable).
- Proven Pi compatibility (SQLite runs on everything, including Pi Zero).

Implementation approach inspired by DBOS: wrap orchestrator functions with a decorator that persists execution state to SQLite. On restart, check the database for incomplete workflows and resume from the last completed step.

The AgentFS pattern (SQLite schema for agent filesystem state) provides a proven schema design. The Stabilize project demonstrates SQLite-based workflow stores and queues specifically for DAG orchestration.

#### Tier 3: Cloud Durable Execution (For Mission-Critical Workflows)
**For:** Multi-hour agent workflows, financial operations, anything requiring guaranteed completion.

For workflows that absolutely must complete despite Pi crashes, network failures, or power outages, delegate to a cloud-hosted durable execution engine. Options:
- **DBOS Cloud**: Lightest integration, library-based, 25x better price-performance than Lambda + Step Functions.
- **Temporal Cloud**: Most mature, best tooling, but heaviest integration effort.
- **Inngest**: Best if the orchestrator is TypeScript-based and event-driven.

The Pi submits workflows to the cloud tier and receives completion events. The cloud tier handles retries, replay, and persistence.

### Why Not LangGraph or Full Frameworks?

LangGraph, CrewAI, and similar frameworks solve a different problem: they orchestrate the *internal logic* of agents (which tool to call, how to reason, when to hand off). The Pi orchestrator solves the *external coordination* problem: spawning agents, monitoring health, managing state across sessions, crash recovery.

These are complementary concerns. Individual agents spawned by the Pi orchestrator could internally use LangGraph or CrewAI. The orchestrator itself needs lightweight, infrastructure-minimal state management -- not a full agent framework.

### Why Not Gas Town MEOW?

The MEOW stack is architecturally elegant and validates file-based state management at scale. However, it is designed for a specific use case (managing 20-30 parallel coding agents) and carries opinions about workflow structure (Formulas/Protomolecules/Molecules/Beads) that may not align with the L-Thread orchestrator's simpler model. The key takeaway from MEOW -- Git-backed JSONL for crash recovery -- is directly applicable without adopting the full stack.

### Concrete Next Steps

1. **Immediate:** Add JSONL write-ahead logging to the existing JSON state file system for crash recovery.
2. **Short-term:** Introduce an SQLite state store alongside JSON files. Migrate task queue and agent history to SQLite. Keep session state in JSON for human readability.
3. **Medium-term:** Implement DBOS-style durable execution wrappers around critical orchestrator functions using the SQLite store.
4. **Long-term:** Evaluate cloud delegation for workflows requiring guaranteed completion beyond what local durability can provide.

---

## Sources

### Temporal
- [Durable Execution Solutions - Temporal](https://temporal.io/)
- [Building Dynamic AI Agents with Temporal](https://temporal.io/blog/of-course-you-can-build-dynamic-ai-agents-with-temporal)
- [Durable Multi-Agentic AI Architecture with Temporal](https://temporal.io/blog/using-multi-agent-architectures-with-temporal)
- [Orchestrating Ambient Agents with Temporal](https://temporal.io/blog/orchestrating-ambient-agents-with-temporal)
- [Durable Execution Meets AI - Temporal](https://temporal.io/blog/durable-execution-meets-ai-why-temporal-is-the-perfect-foundation-for-ai)
- [Build Durable AI Agents with Pydantic and Temporal](https://temporal.io/blog/build-durable-ai-agents-pydantic-ai-and-temporal)
- [Temporal + AI Agents: Production-Ready Agentic Systems](https://dev.to/akki907/temporal-workflow-orchestration-building-reliable-agentic-ai-systems-3bpm)
- [Agentic AI Workflows: Why Orchestration with Temporal is Key](https://intuitionlabs.ai/articles/agentic-ai-temporal-orchestration)
- [Pydantic AI Temporal Documentation](https://ai.pydantic.dev/durable_execution/temporal/)
- [Pydantic AI Temporal Example - GitHub](https://github.com/pydantic/pydantic-ai-temporal-example)

### Inngest / AgentKit
- [Inngest - AI and Backend Workflows](https://www.inngest.com/)
- [Inngest AI Platform](https://www.inngest.com/ai)
- [AgentKit Overview](https://agentkit.inngest.com/overview)
- [AgentKit and step.ai: Orchestrating AI with Confidence](https://www.inngest.com/blog/ai-orchestration-with-agentkit-step-ai)
- [AgentKit - GitHub](https://github.com/inngest/agent-kit)
- [Building Agentic Workflows That Query Millions of Rows](https://www.inngest.com/blog/building-agentic-workflows-that-can-query)

### LangGraph
- [LangGraph: Agent Orchestration Framework](https://www.langchain.com/langgraph)
- [LangGraph Overview - LangChain Docs](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph AI Framework 2025: Complete Architecture Guide](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-ai-framework-2025-complete-architecture-guide-multi-agent-orchestration-analysis)
- [LangGraph Persistence - LangChain Docs](https://docs.langchain.com/oss/javascript/langgraph/persistence)
- [Mastering LangGraph Checkpointing: Best Practices 2025](https://sparkco.ai/blog/mastering-langgraph-checkpointing-best-practices-for-2025)
- [langgraph-checkpoint-postgres - PyPI](https://pypi.org/project/langgraph-checkpoint-postgres/)
- [LangGraph - GitHub](https://github.com/langchain-ai/langgraph)
- [Prototype to Production-Ready Agentic AI - Grid Dynamics / Temporal](https://temporal.io/blog/prototype-to-prod-ready-agentic-ai-grid-dynamics)

### Custom State Machines
- [XState - GitHub](https://github.com/statelyai/xstate)
- [Stately Agent: State-Machine-Powered LLM Agents - GitHub](https://github.com/statelyai/agent)
- [XState Documentation](https://stately.ai/docs/xstate)
- [Gas Town: Multi-Agent Orchestration Framework](https://reading.torqsoftware.com/notes/software/ai-ml/agentic-coding/2026-01-15-gas-town-multi-agent-orchestration-framework/)
- [Gas Town - GitHub (Steve Yegge)](https://github.com/steveyegge/gastown)
- [Gas Town Glossary (MEOW definitions)](https://github.com/steveyegge/gastown/blob/main/docs/glossary.md)
- [Welcome to Gas Town - Steve Yegge](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Filesystem-Based Agent State Pattern](https://agentic-patterns.com/patterns/filesystem-based-agent-state/)
- [Microsoft Agent Framework - Checkpointing](https://learn.microsoft.com/en-us/agent-framework/tutorials/workflows/checkpointing-and-resuming)

### SQLite-Backed State
- [AgentFS with FUSE: SQLite-backed Agent State](https://turso.tech/blog/agentfs-fuse)
- [Building a Durable Execution Engine With SQLite - Gunnar Morling](https://www.morling.dev/blog/building-durable-execution-engine-with-sqlite/)
- [SQLite Agent Extension - GitHub](https://github.com/sqliteai/sqlite-agent)
- [SQL State Machine - GitHub](https://github.com/BenjaminPritchard/sql_state_machine)
- [Stabilize: Queue-Based State Machine - GitHub](https://github.com/rodmena-limited/stabilize)
- [SQLite for AI Agent State (Pekka Enberg)](https://x.com/penberg/status/1985769421353168904)

### DBOS
- [DBOS - Durable Workflow Orchestration](https://www.dbos.dev/)
- [Why Durable Execution Should Be Lightweight](https://www.dbos.dev/blog/what-is-lightweight-durable-execution)
- [DBOS vs Temporal Comparison](https://www.dbos.dev/compare/compare-dbos-vs-temporal-dbos)
- [DBOS Python SDK - GitHub](https://github.com/dbos-inc/dbos-transact-py)
- [Pydantic AI DBOS Integration](https://ai.pydantic.dev/durable_execution/dbos/)
- [Yutori: Large-scale Durable Agentic AI on DBOS](https://www.dbos.dev/case-studies/yutori-large-scale-durable-agentic-ai)

### Prefect / Airflow
- [Prefect - Workflow Orchestration](https://www.prefect.io)
- [Prefect AI Teams](https://www.prefect.io/ai-teams)
- [Prefect vs Airflow Comparison](https://www.prefect.io/compare/airflow)
- [Airflow vs Dagster vs Prefect 2026](https://bix-tech.com/airflow-vs-dagster-vs-prefect-which-workflow-orchestrator-should-you-choose-in-2026/)
- [Build AI Agents That Resume from Failure with Pydantic AI + Prefect](https://www.prefect.io/blog/prefect-pydantic-integration)

### Agent-Specific Tools & Pi Deployment
- [The 2026 Guide to Agentic Workflow Architectures](https://www.stackai.com/blog/the-2026-guide-to-agentic-workflow-architectures)
- [Top 10+ Agentic Orchestration Frameworks 2026](https://aimultiple.com/agentic-orchestration)
- [AI Agent Tools Landscape: 120+ Tools Mapped 2026](https://www.stackone.com/blog/ai-agent-tools-landscape-2026/)
- [OpenClaw x Raspberry Pi Deployment Guide](https://www.meta-intelligence.tech/en/insight-openclaw-raspberry-pi)
- [Turn Your Raspberry Pi into an AI Agent with OpenClaw](https://www.raspberrypi.com/news/turn-your-raspberry-pi-into-an-ai-agent-with-openclaw/)
- [NanoClaw: Mid-weight Python AI Agent for SBCs](https://github.com/Clawland-AI/nanoclaw)
- [MCP Server on Raspberry Pi 5 - Arm Learning Paths](https://learn.arm.com/learning-paths/cross-platform/mcp-ai-agent/)
- [CrewAI vs LangGraph vs AutoGen 2026](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)
- [Deloitte: Unlocking Value with AI Agent Orchestration](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/ai-agent-orchestration.html)
- [Orchestrating Multi-Step Agents: Temporal/Dagster/LangGraph Patterns](https://www.kinde.com/learn/ai-for-software-engineering/ai-devops/orchestrating-multi-step-agents-temporal-dagster-langgraph-patterns-for-long-running-work/)
