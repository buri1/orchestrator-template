# Shannon

> **A production-oriented multi-agent orchestration framework.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [github.com/Kocoro-lab/Shannon](https://github.com/Kocoro-lab/Shannon) |
| GitHub Stars | 1,147 (as of 2026-03-08) |
| Publisher | Kocoro-lab (startup/research group) |
| License | MIT |
| Tech Stack | Go (orchestrator), Rust (agent core, WASI sandbox), Python (LLM service), TypeScript (Tauri desktop app) |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Token budget enforcement and automatic model fallback directly solve a cost control problem we'll face at scale. The multi-strategy orchestration patterns (DAG, supervisor, debate) are comprehensive. But the heavy infrastructure requirements (PostgreSQL, Redis, Qdrant, Temporal) conflict with our thin shared layer principle. |
| **Novelty** | 7/10 | WASI sandboxing for agent isolation is genuinely novel. Token budget with automatic model downgrade is a production pattern we haven't seen elsewhere. Time-travel debugging via Temporal is an interesting approach to failure analysis. Debate pattern with Qdrant persistence for learning from consensus is unique. |
| **Actionable** | 4/10 | The token budget fallback pattern could be implemented in our orchestrator within a day. But the overall system is too heavy to adopt — we'd cherry-pick specific patterns, not the framework. |

---

## Overview

Shannon is a polyglot multi-agent orchestration framework that takes a kitchen-sink approach to production concerns: WASI sandboxing for security, token budget enforcement with automatic model fallback, Temporal workflows for durable execution, OpenTelemetry for observability, and OPA policies for governance. Named (presumably) after Claude Shannon, the father of information theory, it positions itself as a production-grade alternative to LangChain, AutoGen, and CrewAI.

The framework supports an impressive range of orchestration patterns: DAG-based workflows, supervisor routing, swarm P2P messaging, debate with consensus persistence, ReAct, Tree-of-Thoughts, Chain-of-Thought, and Reflection. This breadth is both its strength (comprehensive pattern library) and weakness (complexity explosion).

The architecture splits responsibilities across four languages: Go for the orchestrator (task routing, budget enforcement, OPA policies), Rust for the agent core (WASI sandbox, file operations, session workspaces), Python for LLM provider abstraction (15+ providers via MCP), and TypeScript/Tauri for a native desktop app. This polyglot design achieves performance and security goals but raises the complexity bar significantly for contributors and operators.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│                Desktop App (Tauri)                │
│            TypeScript + Rust runtime              │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────┐
│              Orchestrator (Go)                    │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Task Router │ │Budget    │ │OPA Policy     │  │
│  │(DAG/Super/ │ │Enforcer  │ │Engine         │  │
│  │ Swarm)     │ │(70/90%)  │ │               │  │
│  └────────────┘ └──────────┘ └───────────────┘  │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────┐
│              Agent Core (Rust)                    │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │WASI        │ │Session   │ │File           │  │
│  │Sandbox     │ │Workspace │ │Operations     │  │
│  └────────────┘ └──────────┘ └───────────────┘  │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────┐
│            LLM Service (Python)                   │
│  ┌────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Provider    │ │MCP Tool  │ │Model Fallback │  │
│  │Abstraction │ │Integration│ │Chain          │  │
│  └────────────┘ └──────────┘ └───────────────┘  │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────┴───────────────────────────────┐
│              Data Layer                           │
│  PostgreSQL    Redis       Qdrant     Temporal    │
│  (state)       (sessions)  (vectors)  (workflows) │
└──────────────────────────────────────────────────┘
```

**Orchestration Patterns:**
- **DAG Workflow**: Directed acyclic graph with conditional edges
- **Supervisor**: Central routing agent delegates to specialist workers
- **Swarm**: P2P agent messaging without central supervisor
- **Debate**: Multiple agents argue positions, consensus persisted to Qdrant
- **ReAct / CoT / ToT / Reflection**: Standard LLM reasoning patterns

**Token Budget System:**
- Per-task budget configuration with threshold warnings (70%, 90%)
- Automatic model downgrade chain: premium (GPT-4, Claude Opus) → mid (GPT-3.5, Claude Sonnet) → local (Ollama)
- Graceful failure with detailed usage metrics if all budgets deplete

**Security:**
- WASI sandboxing provides process-level isolation per agent
- OPA policies govern network access, file operations, system calls
- Isolated session workspaces per agent instance

---

## Publisher Background

Kocoro-lab appears to be a small development team (possibly a startup or research group) with a focused portfolio. Their GitHub organization also hosts `ai-agent-book`, a framework-agnostic AI agent architecture patterns book, suggesting deep expertise in agent system design. The team has practical production experience — Shannon explicitly addresses problems that only surface in real deployments (cost spiraling, silent failures, security vulnerabilities). With 1.1K stars and 143 forks for a relatively young project, community traction is modest but growing. The polyglot architecture (Go + Rust + Python + TypeScript) suggests a team with diverse technical skills. Limited public information about funding or team size.

---

## What's Valuable for Us

**Token Budget with Automatic Model Fallback**: This is the most immediately useful pattern. Configure a cost ceiling per task, get warnings at 70% and 90%, and automatically fall back to cheaper models when budget runs low. We could implement this in our orchestrator's deterministic routing layer — a pure rules-based system that tracks token spend and switches Claude models accordingly. Fits perfectly in our 70% deterministic category.

**Debate Pattern with Consensus Persistence**: The idea of having agents argue positions and then persisting the consensus decision for future reference is a novel approach to improving decision quality over time. Could be valuable for our research/analysis workflows where multiple perspectives reduce hallucination risk.

**WASI Sandboxing Concept**: While we don't need WASI specifically, the principle of process-level agent isolation is important as we scale. Currently our tmux panes provide some isolation, but git worktrees (like Gas Town) or container-based isolation would be more robust for production.

**OPA Policy Engine for Agent Governance**: Using Open Policy Agent to define what agents can and cannot do (network access, file operations) is a mature approach to the security problem. Could inform how we define agent permissions in our orchestrator prompts.

---

## What's NOT Relevant

**Infrastructure Complexity**: PostgreSQL + Redis + Qdrant + Temporal Server is a massive operational footprint. Our thin shared layer principle explicitly avoids this kind of infrastructure sprawl. We achieve comparable functionality with JSON files + git + tmux. This is exactly the "premature infrastructure" trap we're avoiding in our build strategy (thin layer → run under load → informed rebuild).

**Polyglot Architecture**: Four languages across four components creates a maintenance and hiring burden. Our TypeScript/shell stack is deliberately simple. The performance benefits of Go + Rust are real but unnecessary at our current scale.

**Desktop App via Tauri**: We're terminal-first. A native desktop application for orchestrator management conflicts with our pure CLI approach and adds significant surface area to maintain.

**15+ LLM Provider Support**: We're Claude-first. Supporting 15+ providers dilutes focus and adds abstraction layers. Our architecture's power comes from deep optimization for a single provider, not breadth.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Implement token budget tracking with model fallback as a deterministic rule in our routing layer — this is a day-one win for cost control
- **Phase 3 (Days 60-90)**: Evaluate debate pattern for research/analysis tasks where quality matters more than speed
- **Phase 4 (Days 90+)**: If multi-tenant isolation becomes necessary for gov contracts (DSGVO), study Shannon's WASI + OPA approach for agent sandboxing; Temporal-style durable workflows could inform our "informed rebuild" phase

---

## Key Takeaway

> **Shannon's token budget enforcement with automatic model fallback is the standout production pattern worth stealing immediately, but the framework itself is over-engineered infrastructure for our needs — cherry-pick the cost control and debate patterns, leave the four-language Kubernetes-grade deployment behind.**
