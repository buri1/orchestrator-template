# Flyte

> **Scalable and flexible workflow orchestration platform that seamlessly unifies data, ML and analytics stacks.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [flyteorg/flyte](https://github.com/flyteorg/flyte) |
| Website | [flyte.org](https://flyte.org) |
| GitHub Stars | 6,844 (as of 2026-03-08) |
| Publisher | Union.ai (startup, backed by LF AI & Data Foundation; used by Spotify, LinkedIn, Stripe, NVIDIA, OpenAI) |
| License | Apache-2.0 |
| Tech Stack | Go (server/propeller), Python (flytekit SDK), gRPC, Protocol Buffers, Kubernetes, object storage (S3/GCS/Azure Blob) |
| Maturity | 🟢 Production (v2.0.7 released March 2026; v1.16.4 parallel LTS; 80M+ downloads; 251 watchers) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Flyte's durability primitives (replay logs, global caching, intermediate state persistence) directly address crash recovery and wasted-compute problems we'll face at scale. The Dragonfly case study (4-tier agent architecture, 2,000+ concurrent runs) validates the ambient agent orchestration model. However, it requires Kubernetes — heavy infrastructure for our current tmux/JSON approach. |
| **Novelty** | 6/10 | Replay logs and global caching are known patterns (Temporal does event sourcing similarly), but Flyte 2.0's three specific innovations are fresh: (1) per-run micro-cache that skips completed steps on retry, (2) cross-run global cache to avoid duplicate LLM calls across agent runs, and (3) automatic serialization to object store via Python decorators. The "infrastructure-as-context" pattern (bubbling OOM/timeout errors into the agent loop) is novel for ML orchestration. |
| **Actionable** | 4/10 | Flyte requires Kubernetes, which we don't run. The patterns are highly valuable as reference architecture, but direct adoption is Phase 3-4 at earliest. The Python-first SDK is a friction point for our TypeScript-leaning stack. Specific patterns (replay logs, global cache keying) can be adapted without adopting Flyte itself. |

---

## Overview

Flyte is an open-source orchestration platform originally built for ML pipelines that has evolved into a general-purpose durable execution engine for AI workflows and agentic systems. Founded by engineers from Lyft's ML platform team, it was donated to the Linux Foundation AI & Data in 2020 and is now maintained by Union.ai. The platform runs on Kubernetes, executing each task as an isolated container (pod), which provides strong resource isolation and reproducibility guarantees.

**Flyte 2.0** (released late 2025, now at v2.0.7) represents a major architectural shift: from static DAG-based workflows to fully dynamic, crash-proof orchestration. The key change is that workflows are now pure Python — no DSL, no static graph compilation. Agents can make runtime decisions, spawn dynamic sub-tasks, and self-heal from infrastructure failures. Three durability primitives make this work: **replay logs** (per-run micro-cache that records every step, enabling crash recovery without re-executing completed work), **global caching** (cross-run shared computation keyed by function signature + inputs, eliminating duplicate LLM calls across agent runs), and **intermediate state persistence** (automatic serialization of all task outputs to object storage via `@task` decorators).

The platform has found significant traction in the ML/AI space, with production deployments at LinkedIn, Spotify, Stripe, NVIDIA, OpenAI, Amazon, Shopify, Adobe, Mercedes, and others. The Dragonfly case study from Neils Bentilan's conference talk is particularly relevant: a deep research SaaS processing 250K+ software products with a 4-tier agent architecture (4 drivers -> 8 coordinators -> 12 researchers -> 12 tool replicas) achieving 2,000+ concurrent runs, 50% reduction in failure recovery time, and an innovation called "semantic convergence detection" for deduplicating parallel agent research threads.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Flyte Control Plane                   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  FlyteAdmin   │  │  DataCatalog │  │  FlyteConsole │  │
│  │  (gRPC API,   │  │  (global     │  │  (web UI,     │  │
│  │   scheduling, │  │   cache,     │  │   lineage     │  │
│  │   launch      │  │   artifact   │  │   viz)        │  │
│  │   plans)      │  │   tracking)  │  │               │  │
│  └──────┬────────┘  └──────┬───────┘  └───────────────┘  │
│         │                  │                              │
│  ┌──────▼──────────────────▼─────────────────────────┐   │
│  │           FlytePropeller (K8s Operator)            │   │
│  │   Workflow engine: DAG execution, step tracking,   │   │
│  │   replay log management, retry orchestration       │   │
│  └──────────────────────┬────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────┘
                          │ spawns K8s pods
          ┌───────────────▼───────────────┐
          │        Data Plane (K8s)       │
          │                               │
          │  ┌─────────┐  ┌─────────┐    │
          │  │ Task Pod │  │ Task Pod │   │
          │  │ (Python  │  │ (Spark/  │   │
          │  │  flytekit│  │  Ray/    │   │
          │  │  agent)  │  │  custom) │   │
          │  └────┬─────┘  └────┬─────┘   │
          │       │             │          │
          │  ┌────▼─────────────▼──────┐  │
          │  │   Object Store (S3/GCS) │  │
          │  │   Intermediate state,   │  │
          │  │   artifacts, replay log │  │
          │  └─────────────────────────┘  │
          └───────────────────────────────┘
```

**Core abstractions:**

| Concept | Description |
|---------|-------------|
| **Task** | Containerized unit of work. Each task runs in its own K8s pod with explicit resource requests (CPU, memory, GPU). Decorated with `@task(cache=True, retries=3, timeout=timedelta(hours=1))`. |
| **Workflow** | Composition of tasks with data dependencies. In v2.0, fully dynamic — can branch, loop, and spawn sub-tasks at runtime. |
| **Launch Plan** | Named, versioned execution configuration (inputs, schedule, notifications). Enables reproducible re-runs. |
| **DataCatalog** | Global cache keyed by task signature + input hash. Cross-run deduplication — if task A with inputs X was already computed in a previous run, the cached result is returned. |
| **Replay Log** | Per-run step-level record. On crash recovery, completed steps are skipped and execution resumes from the last incomplete step. |
| **FlyteFile / FlyteDirectory** | Typed abstractions for cloud storage objects. Automatic upload/download between task pods and object store. |
| **Map Task** | Parallel fan-out with `map_task()` — distributes work across N pods with minimal configuration. |
| **Agent Framework** | Flyte 2.0's async agent interface for integrating external services (LLMs, databases, APIs) as first-class task types. |

**Key design decisions:**
- **Kubernetes-native**: Every task is a pod. Strong isolation but requires K8s cluster.
- **Strongly typed**: FlyteIDL (Protocol Buffers) defines typed interfaces between tasks. Type checking at compile time, not runtime.
- **Immutable executions**: Once started, execution inputs/outputs are frozen. Enables reproducibility and audit trails.
- **Declarative resource management**: Tasks declare CPU/memory/GPU needs; FlytePropeller handles scheduling and spot instance management.

---

## Publisher Background

Flyte was created by the ML platform team at Lyft around 2017-2018, open-sourced in 2019, and donated to the **Linux Foundation AI & Data** foundation in 2020 — the same umbrella that houses projects like ONNX and Horovod. The core team then founded **Union.ai** as the commercial entity, offering a managed Flyte platform with enterprise features (sub-second latency, warm-start containers <100ms, live remote debugging, 50K+ actions per run).

Union.ai has raised significant venture funding (exact amount undisclosed but operating at scale given the enterprise customer list). The team is led by Ketan Umare (CEO, ex-Lyft ML platform) and Haytham AbdelFattah (CTO). Neils Bentilan serves as Chief ML Engineer and is a prominent speaker/advocate. The project has 30+ core contributors and a broader community of adopters.

The adopter list is serious: **LinkedIn** (ML pipelines), **Spotify** (recommendation systems), **Stripe** (ML workflows), **NVIDIA** (training infrastructure), **OpenAI** (reported user), **Amazon**, **Shopify**, **Adobe**, **Mercedes**, **Expedia**, **Airbus**, **Warner Bros. Discovery**, **Wayve** (autonomous driving), **Mistral** (LLM training). This is not a toy — it's production infrastructure at some of the most demanding ML organizations on the planet.

---

## What's Valuable for Us

| Pattern | Where in Flyte | How to Apply |
|---------|---------------|--------------|
| **Replay logs (per-run micro-cache)** | FlytePropeller step tracking + object store | Adapt for our orchestrator: record each agent task completion as a checkpoint in state JSON. On crash recovery, skip completed tasks instead of re-running the entire pipeline. Our `orchestrator-state.json` already tracks task status — extend it with per-step output hashes. |
| **Global caching (cross-run dedup)** | DataCatalog, `cache=True` decorator | The killer feature for LLM cost control. Key insight: deterministic tool calls (web searches, DB reads, code analysis) produce identical results — cache them by input hash across runs. We could implement a simple file-based cache keyed by `sha256(tool_name + args)`. |
| **Infrastructure-as-context** | Exception bubbling into agent loop | Neils's core insight: OOM errors, timeouts, and K8s failures are delivered as Python exceptions that agents can reason about and self-heal from. We should bubble tmux crashes, git conflicts, and CI failures into agent prompts rather than silently retrying. |
| **Dragonfly 4-tier architecture** | Case study: driver -> coordinator -> researcher -> tools | Reference architecture for scaling beyond 2-3 agents. The "semantic convergence detection" at the coordinator layer (grouping duplicate research threads) is directly applicable to our parallel research agent pattern. |
| **Typed task interfaces** | FlyteIDL + flytekit type annotations | Strongly typed inputs/outputs between tasks catch integration errors at definition time, not runtime. Our current approach passes untyped JSON between agents — adding schemas would catch mismatches earlier. |
| **Map task for embarrassingly parallel work** | `map_task()` | Our research agent pipeline (Wave 1: 9 agents scanning 81 docs) is exactly this pattern. Flyte's `map_task` provides built-in parallelism with failure isolation per item. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Kubernetes requirement** | Flyte is Kubernetes-native. Every task is a pod. We run on a single Mac with tmux. Adopting Flyte means running a K8s cluster (minikube for dev, EKS/GKE for prod). This is a fundamental infrastructure commitment that conflicts with our current zero-infra approach (Governing Principle #7: build only what you've needed in the last 30 days). |
| **Python-first SDK** | `flytekit` is Python. Our stack leans TypeScript. While Flyte has Java/Scala SDKs, there's no TypeScript SDK. This creates a language split that adds cognitive overhead and tooling fragmentation. Temporal and Trigger.dev both have TypeScript-native SDKs. |
| **ML pipeline heritage** | Much of Flyte's feature set (data lineage, structured datasets, Spark/Ray integration, GPU scheduling) is built for ML training pipelines. We're orchestrating coding agents, not training models. The ML-specific features are dead weight. |
| **Heavy control plane** | FlyteAdmin, FlytePropeller, DataCatalog, FlyteConsole — four services to run and maintain. Even with Union.ai's managed offering, this is a significant operational footprint compared to our JSON state files + tmux. |
| **Overkill for current scale** | Like Temporal, Flyte shines at hundreds of concurrent workflows with complex failure scenarios. Our 2-3 agent orchestrator doesn't need container isolation, global caching infra, or a workflow engine. The complexity-to-value ratio is wrong today. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None. Flyte requires infrastructure we don't have.
- **Phase 2 (Days 4-60):** **Study and steal patterns.** Implement a lightweight replay log in our `orchestrator-state.json` (record step outputs, skip completed on recovery). Prototype a file-based global cache for deterministic tool calls (`sha256(tool + args) -> cached_result.json`). Study the Dragonfly 4-tier architecture as a reference for scaling research agent pipelines. Apply the "infrastructure-as-context" pattern by bubbling tmux/git errors into agent prompts.
- **Phase 3 (Days 60-90):** **Evaluate as Temporal alternative.** If we need Kubernetes for container isolation (e.g., untrusted agent code execution for gov clients), Flyte becomes a serious contender against Temporal. Its ML-native features and global caching are more relevant than Temporal's general-purpose model for our AI workloads. Compare: Flyte (ML-native, global cache, K8s-native) vs. Temporal (general-purpose, TypeScript SDK, lighter infra) vs. Trigger.dev (TypeScript-native, serverless, lightest infra).
- **Phase 4 (Days 90+):** If scaling to multi-business-line orchestration with 10+ concurrent agent workflows, Flyte's namespace isolation, DataCatalog for cross-workflow caching, and Kubernetes scheduling become genuinely valuable. The Dragonfly-scale architecture (2,000+ concurrent runs) validates this path. **This is when Flyte's infrastructure overhead becomes justified.**

---

## Key Takeaway

> **Flyte 2.0's three durability primitives (replay logs, global caching, intermediate state persistence) are the most concrete implementation of crash-proof agent orchestration in the catalogue — steal the patterns now for our state layer, but defer the Kubernetes-dependent platform itself to Phase 3-4.**
