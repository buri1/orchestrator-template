# Temporal

> **A durable execution platform that enables developers to build scalable applications without sacrificing productivity or reliability.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [temporalio/temporal](https://github.com/temporalio/temporal) |
| GitHub Stars | 18,700 (as of 2026-03-08) |
| Publisher | Temporal Technologies (startup, Series B $75M+, founded by Maxim Fateev & Samar Abbas) |
| License | MIT |
| Tech Stack | Go (server 99.5%), gRPC, Protocol Buffers, PostgreSQL/Cassandra, multi-language SDKs (Go, Java, Python, TypeScript, .NET) |
| Maturity | 🟢 Production (v1.30.1, March 2026, used by Netflix/Uber/Snap/Stripe/HashiCorp) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Temporal IS the 70% deterministic layer — durable workflow execution with automatic retry, state persistence, and failure recovery. It solves the exact infrastructure problem our tmux/JSON state approach handles manually. But it's heavy infrastructure for our current 2-3 agent scale. |
| **Novelty** | 4/10 | Durable execution is a well-known pattern from our research. Temporal is the gold standard implementation but the concepts (workflow-as-code, activity retry, state persistence) are already embedded in our architecture thinking. |
| **Actionable** | 4/10 | TypeScript SDK exists and is production-grade. But adopting Temporal means running the Go server (self-hosted or Temporal Cloud), managing PostgreSQL/Cassandra, and rearchitecting our orchestrator as Temporal workflows. This is a Phase 3+ infrastructure decision, not a quick adoption. |

---

## Overview

Temporal is the most battle-tested durable execution platform in production today. It originated as a fork of Uber's Cadence project (2019), built by the same engineers who created Cadence (Maxim Fateev, Samar Abbas). The core insight is deceptively simple: **write your workflow logic as normal code, and the platform guarantees it will complete despite any infrastructure failure** — server crashes, network partitions, deployments, even month-long outages.

The model works by recording every step of a workflow's execution in an event history. If a worker crashes mid-execution, a new worker replays the event history to reconstruct the workflow's state, then continues from where it left off. This "event sourcing for workflow state" pattern means developers write straightforward sequential code (no callback hell, no state machine boilerplate) while getting distributed systems reliability for free.

Temporal is not an AI agent framework — it's general-purpose workflow infrastructure. But it has become the de facto choice for teams building production AI agent systems that need reliability beyond what in-memory frameworks provide. When your agent workflow involves multiple LLM calls, external API interactions, human approval steps, and needs to survive failures across hours or days, Temporal is what serious engineering teams reach for.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│              Temporal Cluster                    │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Frontend   │  │  History   │  │  Matching  │ │
│  │  Service    │  │  Service   │  │  Service   │ │
│  │  (gRPC API) │  │  (events)  │  │  (queues)  │ │
│  └──────┬──────┘  └──────┬─────┘  └──────┬─────┘ │
│         │               │               │        │
│  ┌──────▼───────────────▼───────────────▼──────┐ │
│  │         Persistence Layer                    │ │
│  │    PostgreSQL / Cassandra / MySQL            │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │         Visibility Store (Elasticsearch)    │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ gRPC
        ┌──────────────▼──────────────┐
        │         Workers              │
        │  ┌───────────┐ ┌──────────┐  │
        │  │ Workflow   │ │ Activity │  │
        │  │ Worker     │ │ Worker   │  │
        │  │ (replay +  │ │ (execute │  │
        │  │  decide)   │ │  tasks)  │  │
        │  └───────────┘ └──────────┘  │
        └──────────────────────────────┘
```

**Core abstractions:**

| Concept | Description |
|---------|-------------|
| **Workflow** | Deterministic function defining the orchestration logic. Must be replay-safe (no side effects). |
| **Activity** | Non-deterministic operation (API calls, LLM inference, file I/O). Automatically retried on failure. |
| **Worker** | Process that polls Temporal server for tasks and executes workflows/activities. |
| **Task Queue** | Named queue connecting workflows/activities to workers. Enables routing. |
| **Signal** | External event sent to a running workflow (human input, webhook, etc.). |
| **Query** | Read-only inspection of workflow state without affecting execution. |
| **Namespace** | Isolation boundary for multi-tenant deployments. |
| **Child Workflow** | Workflow spawned by another workflow — composable orchestration. |

**Key design decisions:**
- **Event sourcing**: Full event history for every workflow execution, enabling replay-based recovery.
- **Deterministic replay**: Workflow code must be deterministic — same inputs always produce same decisions. Side effects go in Activities.
- **Language-agnostic**: SDKs in Go, Java, Python, TypeScript, .NET. Workflows and activities can be in different languages.
- **Namespace isolation**: Multi-tenant by default — each namespace has independent workflow histories, task queues, and search attributes.

**TypeScript SDK specifics:**
- `@temporalio/workflow` — workflow definitions (run in V8 isolate for determinism)
- `@temporalio/activity` — activity implementations
- `@temporalio/worker` — worker process
- `@temporalio/client` — external client for starting/signaling workflows
- Workflows run in a sandboxed V8 environment to enforce determinism (no `Math.random()`, no `Date.now()`, no network calls)

---

## Publisher Background

Temporal Technologies was founded in 2019 by Maxim Fateev and Samar Abbas, both core engineers on Uber's Cadence project. They raised $75M+ in Series B funding (led by Greenoaks Capital, with Sequoia, Madrona, and others). The company has 200+ employees and thousands of production deployments. Temporal Cloud (managed hosting) serves enterprise customers including Netflix, Uber, Snap, Stripe, HashiCorp, Datadog, and many others. This is not a startup experiment — it's production infrastructure at massive scale. The 255 contributors and v1.30+ release indicate deep maturity. Temporal is to durable execution what PostgreSQL is to databases — the default serious choice.

---

## What's Valuable for Us

| Pattern | Where in Temporal | How to Apply |
|---------|------------------|--------------|
| **Workflow = deterministic orchestrator** | `@temporalio/workflow` | Temporal's workflow model IS our orchestrator: a deterministic function that dispatches activities (agents), manages state, and handles failures. The conceptual mapping is 1:1. |
| **Activity = agent task** | `@temporalio/activity` | Each agent invocation maps to a Temporal Activity — non-deterministic work with automatic retry, timeout, and heartbeat. Our `terminal-write` + `terminal-wait` pattern is a manual version. |
| **Signal for human-in-the-loop** | `workflow.signal()` | External events (human approval, webhook, timer) sent to running workflows. Cleaner than our current "check for user input" polling. |
| **Query for state inspection** | `workflow.query()` | Read-only state inspection without affecting execution. Better than our `cat orchestrator-state.json` approach. |
| **Namespace isolation** | Namespace per tenant | Maps directly to our DSGVO-required business line isolation. Each business line gets its own namespace with independent state. |
| **TypeScript SDK with V8 sandboxing** | `@temporalio/workflow` V8 isolate | The V8 sandbox enforcing determinism in workflows is clever — prevents accidental non-determinism in orchestrator logic. |
| **Child workflows** | `workflow.executeChild()` | Composable orchestration — one workflow spawning sub-workflows. Maps to our orchestrator spawning sub-orchestrators for complex multi-phase tasks. |
| **Retry policies** | Activity retry configuration | Configurable retry with backoff for agent invocations. Our current approach has no retry logic — agents either succeed or we manually intervene. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Heavy infrastructure** | Running Temporal requires the Go server + PostgreSQL/Cassandra + Elasticsearch (optional). This is serious infrastructure for our current 2-3 agent scale. Temporal Cloud avoids self-hosting but adds SaaS dependency + cost. |
| **Overkill for current scale** | Temporal shines at 100+ concurrent workflows with complex failure scenarios. Our 2-3 agent orchestrator with JSON state files works fine today. The complexity-to-value ratio doesn't justify adoption until we hit reliability problems. |
| **Event sourcing overhead** | Every workflow step is persisted as an event. For short-lived agent tasks, this adds latency and storage cost that doesn't provide proportional value. |
| **Learning curve** | Deterministic workflow constraints (no side effects, replay safety) require developer discipline. Subtle bugs from non-deterministic workflow code are hard to debug. |
| **Not agent-native** | Temporal has no concept of "agents," "LLMs," or "prompts." You build these abstractions yourself on top of workflows/activities. Unlike Inngest's AgentKit, there's no agent-specific primitive layer. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None. Too heavy for current needs.
- **Phase 2 (Days 4-60):** Study Temporal's workflow/activity pattern as the reference architecture for our orchestrator's state machine. Internalize the "workflow = deterministic, activity = non-deterministic" split — it's our 70/30 principle formalized as code.
- **Phase 3 (Days 60-90):** **This is the evaluation window.** If our tmux/JSON state approach hits reliability limits, Temporal is the production-grade replacement. Prototype: Orchestrator as Temporal Workflow, each agent invocation as an Activity, state as workflow variables, human approval as Signals. The TypeScript SDK makes this feasible.
- **Phase 4 (Days 90+):** If scaling to multiple business lines with concurrent orchestrators, Temporal's namespace isolation + task queue routing + retry policies become essential infrastructure. This is where the complexity-to-value ratio flips positive. **Temporal is the Day 90+ infrastructure play.**

---

## Key Takeaway

> **Temporal is the gold standard for durable execution and validates our orchestrator pattern (workflow=deterministic, activity=agent task) at enterprise scale — adopt it at Phase 3-4 when our tmux/JSON approach hits reliability limits, not before.**
