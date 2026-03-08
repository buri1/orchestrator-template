# Swarms

> **The Enterprise-Grade Production-Ready Multi-Agent Orchestration Framework.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [github.com/kyegomez/swarms](https://github.com/kyegomez/swarms) |
| GitHub Stars | 5,848 (as of 2026-03-08) |
| Publisher | Kye Gomez / The Swarm Corporation (solo → startup) |
| License | Apache-2.0 |
| Tech Stack | Python (100%) |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | The swarm topology patterns (sequential, concurrent, hierarchical, mixture-of-agents) map conceptually to problems we solve, but Python-only and API-centric — doesn't fit our Claude Code terminal-first stack. |
| **Novelty** | 5/10 | AgentRearrange string syntax for defining agent topologies is a genuinely interesting abstraction. SwarmRouter's dynamic topology selection is a pattern worth studying. |
| **Actionable** | 4/10 | Topology patterns could inform our prompt engineering for agent routing, but we can't use the code directly. The string-syntax topology definition could inspire a similar notation in our state files. |

---

## Overview

Swarms is a Python framework by Kye Gomez that provides pre-built multi-agent orchestration patterns — from simple sequential pipelines to complex hierarchical swarms with dozens of agents. The core value proposition is a "SwarmRouter" that can dynamically select the appropriate swarm topology (sequential, concurrent, hierarchical, mixture-of-agents, etc.) based on the task at hand.

The framework markets itself as "enterprise-grade" and "production-ready," though the rapid pace of breaking changes, single-maintainer dominance, and relatively thin documentation suggest it's still in the early-to-mid maturity phase. The repository is actively maintained with frequent releases to PyPI.

A distinctive feature is `AgentRearrange`, which uses a string-based syntax (e.g., `"Agent1 -> Agent2, Agent3"`) to define complex agent topologies without writing code. This is an elegant abstraction for expressing parallel and sequential relationships between agents.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│              SwarmRouter                 │
│    (Dynamic Topology Selection)          │
│                                          │
│  ┌───────────┐  ┌───────────────────┐   │
│  │ Sequential │  │   Concurrent      │   │
│  │ Workflow   │  │   Workflow        │   │
│  └───────────┘  └───────────────────┘   │
│  ┌───────────┐  ┌───────────────────┐   │
│  │ Graph      │  │   Hierarchical    │   │
│  │ Workflow   │  │   Swarm           │   │
│  └───────────┘  └───────────────────┘   │
│  ┌───────────┐  ┌───────────────────┐   │
│  │ Mixture of │  │   AgentRearrange  │   │
│  │ Agents     │  │   (string syntax) │   │
│  └───────────┘  └───────────────────┘   │
└─────────────────────────────────────────┘
         │
    ┌────┴────┐
    │  Agent  │ ← LLM + Tools + Memory
    └─────────┘
```

**Core Abstractions:**
- **Agent**: Single LLM-powered entity with system prompt, tools, and memory
- **SwarmRouter**: Meta-orchestrator that selects topology based on task type
- **SequentialWorkflow**: Linear pipeline, output of agent N feeds into agent N+1
- **ConcurrentWorkflow**: Parallel execution with result aggregation
- **AgentRearrange**: String-syntax topology definition (e.g., `"A -> B, C -> D"`)
- **GraphWorkflow**: DAG-based execution with conditional edges
- **HierarchicalSwarm**: Director agent decomposes tasks and assigns to workers
- **MixtureOfAgents**: Parallel expert execution with synthesis agent

**Integration Points:**
- OpenAI, Anthropic, Groq, and other LLM providers
- MCP (Model Context Protocol) tool integration
- Memory systems (conversation buffer, vector stores)

**Data Model:**
- Agent state is mostly in-memory; no durable state management
- Task results passed as strings between agents
- No built-in persistence layer or crash recovery

---

## Publisher Background

Kye Gomez is a prolific solo developer / entrepreneur who maintains an extraordinary number of open-source AI projects under "The Swarm Corporation" banner. His GitHub profile shows 100+ repositories, many of which are single-purpose wrappers or experimental projects. Swarms is his flagship project. He markets it aggressively on social media and has built a community around the "Swarms" brand including a Discord server, documentation site, and commercial API platform at swarms.ai. The rapid iteration pace (multiple releases per week) suggests either strong commitment or insufficient stability testing — likely both. No known VC backing.

---

## What's Valuable for Us

**AgentRearrange String Syntax**: The notation `"Agent1 -> Agent2, Agent3"` for defining agent topologies is elegant and could inspire a similar shorthand in our orchestrator state files. Currently our agent routing is defined in prose prompts — a compact topology notation could make routing more explicit and debuggable.

**SwarmRouter Dynamic Selection**: The concept of a meta-orchestrator that examines a task and selects the optimal topology (sequential vs. parallel vs. hierarchical) maps well to our vision. We could implement this as a deterministic routing decision in our thin shared layer.

**Topology Taxonomy**: Swarms provides a useful vocabulary for multi-agent patterns (sequential, concurrent, hierarchical, mixture-of-agents, graph). This taxonomy helps us classify and communicate about our own routing patterns even if we don't use the framework.

---

## What's NOT Relevant

**Python-Only Stack**: We're TypeScript/shell. Can't use any code directly. Our Claude Code agents execute in terminal sessions, not Python runtimes.

**In-Memory State with No Persistence**: Swarms has no crash recovery, no durable state, no git-backed persistence. Our tmux-based orchestrator with JSON state files and git hooks is already more robust for production workloads.

**"Enterprise-Grade" Marketing vs. Reality**: The framework lacks production essentials: no built-in observability, no cost tracking, no rate limiting, no security isolation. The 71 open issues and single-maintainer bus factor make it risky for production. Conflicts with our emphasis on deterministic reliability.

**Large Swarm Sizes**: Swarms encourages topologies with 5-20+ agents. Our research (DeepMind coordination overhead exponent 1.724) shows 2-3 agents optimal, 4 universally suboptimal. The "more agents = better" philosophy directly contradicts our findings.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study AgentRearrange string syntax to potentially define a compact topology notation for our orchestrator state
- **Phase 3 (Days 60-90)**: If we build a routing layer that dynamically selects between sequential and parallel agent execution, the SwarmRouter pattern is a good reference
- **Phase 4 (Days 90+)**: The taxonomy of swarm patterns could inform documentation or API design if we expose orchestration configuration to clients

---

## Key Takeaway

> **Swarms provides a useful taxonomy of multi-agent topologies and an elegant string-syntax for defining agent relationships, but the Python-only, in-memory, single-maintainer implementation is too fragile for production — mine it for concepts, don't depend on it.**
