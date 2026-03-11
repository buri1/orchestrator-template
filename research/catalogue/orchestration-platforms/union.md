# Union

> **The managed AI orchestration platform built on Flyte — durable execution, replay logs, global caching, and infrastructure-aware self-healing for production agent systems at scale.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [flyteorg/flyte](https://github.com/flyteorg/flyte) (OSS engine), [unionai](https://github.com/unionai) (commercial) |
| GitHub Stars | 6,844 (Flyte OSS, as of 2026-03-08) |
| Publisher | Union.ai (startup, Series A $38.1M, Feb 2026; founded by Ketan Umare, ex-Lyft ML platform) |
| License | Apache 2.0 (Flyte OSS) / Proprietary (Union platform) |
| Tech Stack | Go (Flyte server: FlytePropeller, FlyteAdmin, FlyteConsole), Python (FlyteKit SDK), Kubernetes, gRPC, Protobuf, object storage (S3/GCS), multi-cloud |
| Maturity | 🟢 Production (Flyte v2 production preview; customers include Spotify, Wayve, Warner Bros. Discovery, Woven by Toyota) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Neils Bentilan's conference talk was one of the strongest at the AI Driven Dev Conference. The Dragonfly case study (250K products, 2,000+ concurrent agent runs) is the most concrete at-scale agent orchestration evidence in our entire catalogue. Union/Flyte is the "Temporal but for ML/AI" play — same durable execution thesis but with first-class data lineage, containerized task isolation, and now agentic AI as a core use case. The question is whether we'd ever need this level of infrastructure given our Claude Max + tmux approach, or whether the patterns (replay logs, infrastructure-as-context, cheap failures) are what we should steal.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses the durability and crash-recovery layer from our Master Blueprint's deterministic infrastructure tier. The workflow=deterministic/activity=agent split IS our 70/30 principle. But Union is Python-first (we're TypeScript), requires Kubernetes, and targets ML-at-scale — heavier infrastructure than our current needs. |
| **Novelty** | 5/10 | The durable execution pattern is well-covered by our existing Temporal entry. What's novel is the **agent-specific additions**: replay logs per run, global caching across runs, infrastructure-as-context (bubbling OOM/spot-preemption into agent loops), and the code-mode sandbox concept. These extend beyond what Temporal offers natively. |
| **Actionable** | 4/10 | Python-first SDK is a mismatch for our TypeScript stack. Kubernetes dependency is overkill for our 2-3 agent scale. The patterns (replay logs, cheap failures, infra-as-context) are highly actionable as design inspiration but the platform itself is a Phase 4+ adoption candidate at earliest. |

---

## Overview

Union is the commercial managed platform built on top of Flyte, the open-source workflow orchestration engine originally created at Lyft and now part of the LF AI & Data Foundation. While Flyte provides the core execution engine (Go-based, Kubernetes-native), Union adds managed infrastructure, enterprise features, Flyte 2 improvements, and increasingly, first-class support for agentic AI workloads.

The core execution model follows the same pattern as Temporal: **workflows are deterministic orchestration code, tasks are non-deterministic execution units** (LLM calls, API interactions, data processing). The key differentiators from Temporal are: (1) first-class ML/AI primitives (typed data artifacts with FlyteFile/FlyteDirectory, GPU task scheduling, model registries), (2) containerized task isolation (each task runs in its own Kubernetes pod with specified resources — memory, CPU, GPU), (3) data lineage tracking across the entire execution graph, and (4) the agentic AI extensions Neils Bentilan presented: replay logs, global caching, infrastructure-as-context, and code-mode sandboxes.

Union's agentic positioning is relatively recent but backed by serious production evidence. Their Dragonfly customer runs 2,000+ concurrent agent executions processing 250K+ software products through a tiered architecture (4 agent drivers -> 8 research coordinators -> 12 researchers -> 12 tool replicas). This is the most concrete multi-agent-at-scale case study in our entire research corpus. The platform claims sub-100ms task startup time and support for 50,000+ actions per run, positioning it firmly in the "infrastructure for agent orchestration" category rather than the "agent framework" category.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Union Platform (Managed)                   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ FlyteAdmin   │  │ FlyteConsole │  │ Union Extensions   │  │
│  │ (API server, │  │ (Web UI,     │  │ (Auth, RBAC,       │  │
│  │  scheduling, │  │  observ.,    │  │  multi-cloud,      │  │
│  │  launch      │  │  data        │  │  Flyte 2 features, │  │
│  │  plans)      │  │  lineage)    │  │  agentic AI)       │  │
│  └──────┬───────┘  └──────────────┘  └───────────────────┘  │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────────┐ │
│  │              FlytePropeller (Execution Engine)           │ │
│  │  • DAG scheduler — topological ordering of tasks        │ │
│  │  • Replay logs — per-run micro-cache of step outputs    │ │
│  │  • Global cache — cross-run shared computation          │ │
│  │  • Intermediate state — auto-serialize to object store  │ │
│  │  • Intratask checkpoints — resume within long tasks     │ │
│  └──────┬──────────────────────────────────────────────────┘ │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────────┐ │
│  │              Kubernetes Cluster                          │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ Task Pod │ │ Task Pod │ │ Task Pod │ │ Task Pod │  │ │
│  │  │ (Python  │ │ (GPU     │ │ (Agent   │ │ (Sandbox │  │ │
│  │  │  worker) │ │  training│ │  LLM call│ │  code    │  │ │
│  │  │          │ │          │ │          │ │  mode)   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────────┐ │
│  │              Object Store (S3/GCS/Azure Blob)           │ │
│  │  Typed artifacts: FlyteFile, FlyteDirectory,            │ │
│  │  StructuredDataset, Pydantic models, dataclasses        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Core abstractions:**

| Concept | Description |
|---------|-------------|
| **Task** (`@task`) | Atomic unit of execution. Runs in its own Kubernetes pod with specified resources (CPU, memory, GPU). Automatic retry, timeout, and resource provisioning. |
| **Workflow** (`@workflow`) | Deterministic DAG of tasks. Supports conditional branching, loops, dynamic sub-workflows, and imperative (procedural) definition. |
| **Dynamic Workflow** | Workflow that generates its task graph at runtime — critical for agent systems where the execution plan depends on intermediate results. |
| **Launch Plan** | Templated workflow execution with scheduling, notifications, and activation controls. The "cron job" primitive. |
| **Replay Log** | Per-run micro-cache recording all step outputs. On crash recovery, completed steps are skipped and execution resumes from the failure point. |
| **Global Cache** | Cross-run shared computation store. If Task A with inputs X already ran successfully in any prior execution, the result is reused. Eliminates redundant LLM calls and API requests across agent runs. |
| **Intratask Checkpoint** | Intermediate state persistence within a single long-running task. Enables resume from checkpoint rather than full task restart. |
| **FlyteFile / FlyteDirectory** | Typed data artifacts with automatic serialization to/from object storage. Provides data lineage across the execution graph. |
| **Code Mode Sandbox** | Restricted Python environment (no IO, no network) where agents write orchestration code using their toolbox. Tight self-healing loop. |

**Agentic AI design principles (from Bentilan's talk):**

1. **Plain Python** — no DSL; LLMs already know Python
2. **Functional hooks for durability** — `@trace`, `@checkpoint`, `@persist` decorators
3. **Cheap failures** — replay logs skip completed steps; failed runs become training data
4. **Infrastructure as context** — OOM errors, spot preemptions, timeouts bubble into agent loop as catchable exceptions
5. **Agent self-healing** — code-mode sandbox + stateless sandbox enable tight fix loops
6. **Human-in-the-loop** — final recourse when agent exhausts iteration budget

---

## Publisher Background

Union.ai was founded by Ketan Umare, who built the original Flyte platform at Lyft to orchestrate their ML pipelines. The company raised a $38.1M Series A in February 2026. Neils Bentilan serves as Chief ML Engineer and is the primary public-facing technical voice (conference speaker at the AI Driven Dev Conference 2026). The team leverages 5+ years of production ML orchestration experience from Flyte's open-source community (794 forks, 50+ contributors, 4,802 commits).

Flyte itself is a Linux Foundation AI & Data project with OpenSSF Best Practices certification, which provides governance credibility for enterprise and government buyers. Notable production users include Spotify (ML pipelines), Wayve (autonomous driving), Warner Bros. Discovery (media operations), Woven by Toyota (autonomous vehicles), Johnson & Johnson (drug discovery), and Dragonfly (agentic research at scale).

The pivot toward agentic AI orchestration is relatively recent (2025-2026) but grounded in real infrastructure — not a marketing rebrand. The same primitives that make ML pipelines durable (replay, caching, checkpointing, containerized isolation) are exactly what agent systems need. This is a "discovered application" rather than a "pivot to hype."

---

## What's Valuable for Us

| Pattern | Where in Union/Flyte | How to Apply |
|---------|---------------------|--------------|
| **Replay logs for crash recovery** | FlytePropeller's per-run step cache | Our tmux recovery currently loses all in-flight state. Replay log concept: serialize each orchestrator step output to a JSON log. On crash, replay the log to skip completed steps and resume. Implementable in our JSON state layer without adopting Flyte. |
| **Global caching across runs** | Cross-execution cache keyed on task+inputs | If agent A already fetched URL X and extracted data Y, agent B should reuse that result. We could implement a simple content-addressed cache (hash of task type + inputs -> cached output) in our state files. |
| **Infrastructure-as-context** | Python try/except bubbling OOM, timeout, preemption errors into agent loop | Our orchestrator could catch tmux session crashes, disk full errors, and API rate limits, then include that infrastructure context in the agent's next prompt. "Your last run failed with OOM — request more memory or simplify the approach." |
| **Cheap failures over failure-proof** | Design principle: fast recovery > prevention | Validates our "skip + log + continue" approach in AUTO_MODE. Don't build elaborate prevention; build fast recovery paths. |
| **Dynamic workflows** | `@dynamic` decorator generates task graph at runtime | Agent systems inherently need dynamic execution plans. The pattern of "workflow that decides its own shape at runtime" maps to our orchestrator's ability to spawn agents based on task decomposition results. |
| **Dragonfly's tiered architecture** | 4 drivers -> 8 coordinators -> 12 researchers -> 12 tools | Reference architecture for scaling beyond 2-3 agents. Key innovation: "semantic convergence detection" — deduplicating parallel research threads at the coordinator layer. Worth studying when we hit Phase 4 scale. |
| **Data lineage** | FlyteConsole observability | Every agent decision traceable through the execution graph. Our Langfuse integration could be extended to track data flow between agents, not just individual agent traces. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Python-first SDK** | FlyteKit is Python-only. Our stack is TypeScript/bash. While there are community SDKs in other languages, the Python primacy means first-class agent features won't be available in TypeScript. This is a fundamental mismatch. (Master Blueprint Principle 7: build what you need, not what research suggests.) |
| **Kubernetes dependency** | Flyte requires a Kubernetes cluster for task execution. We run on a single Mac with tmux sessions. The infrastructure gap is enormous for Phase 1-2. Even Union's managed offering requires cloud infrastructure. |
| **ML pipeline heritage** | Much of Flyte's power (GPU scheduling, model training, data processing primitives, StructuredDataset) is irrelevant for our coding agent orchestration use case. We don't train models; we orchestrate Claude Code instances. |
| **Scale we don't need yet** | 50,000+ actions per run, 2,000+ concurrent executions — Dragonfly's scale is impressive but our current ceiling is 3-5 concurrent agents. Principle 4 (coordination overhead exponent 1.724) means we shouldn't reach for this scale prematurely. |
| **Managed SaaS dependency** | Union's managed platform means our orchestration state lives in their cloud. For gov contract work, this creates DSGVO/BSI compliance questions. The self-hosted Flyte option exists but brings the Kubernetes burden. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None. Our tmux/JSON state approach is sufficient.
- **Phase 2 (Days 4-60):** **Steal the patterns.** Implement a lightweight replay log in our orchestrator-state.json (record step outputs, skip completed steps on recovery). Implement infrastructure-as-context by catching tmux/process errors and including them in agent prompts. These patterns require zero Flyte dependencies.
- **Phase 3 (Days 60-90):** Evaluate Union alongside Temporal and Trigger.dev as the durable execution backend. Union's advantage over Temporal: first-class data lineage and the agentic AI primitives (replay logs, global cache, code-mode sandbox). Union's disadvantage: Python-first, heavier infra. If our TypeScript stack shifts toward Python for orchestration, Union becomes the top candidate.
- **Phase 4 (Days 90+):** If scaling to Dragonfly-level concurrent agent runs (100+), Union/Flyte is the proven infrastructure. The tiered architecture pattern (driver -> coordinator -> researcher -> tools) and semantic convergence detection become directly applicable. This is also where Union's data lineage + observability would justify the infrastructure cost.

---

## Key Takeaway

> **Union/Flyte is the most production-proven infrastructure for durable agent orchestration at scale (2,000+ concurrent runs), but its Python-first/Kubernetes-heavy nature makes it a Phase 4+ adoption candidate — steal the replay log, global cache, and infrastructure-as-context patterns now, evaluate the platform later.**
