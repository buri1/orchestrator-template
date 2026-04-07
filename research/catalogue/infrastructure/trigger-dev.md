# Trigger.dev

> **Build and deploy fully-managed AI agents and workflows**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [triggerdotdev/trigger.dev](https://github.com/triggerdotdev/trigger.dev) |
| GitHub Stars | 14,000 (as of 2026-03-08) |
| Publisher | Trigger.dev (startup, YC W23, $19M total raised) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (98.4%), Node.js runtime, Docker/Kubernetes (self-hosting), Helm charts |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | TypeScript-native, durable task execution with retries/queues directly maps to our orchestrator's needs; checkpoint-resume is exactly what we lack in tmux crash recovery |
| **Novelty** | 6/10 | Background job frameworks aren't new, but Trigger.dev's adaptation for AI agent workflows (no timeouts, human-in-the-loop, streaming) is a meaningful evolution |
| **Actionable** | 7/10 | TypeScript-native + self-hostable + Apache-2.0 = we could adopt this within days. The durable execution model could replace our tmux-based crash recovery with proper checkpointing |

---

## Overview

Trigger.dev started as a TypeScript background jobs framework (think Sidekiq for Node.js) and has evolved into a full agent execution platform. The key differentiator is **durable execution** — tasks can run for hours or days without timeouts, automatically checkpoint their state, and resume after crashes or deployments. This solves the fundamental fragility of agent workflows that break when a process dies mid-execution.

The platform provides no-timeout task execution, automatic retries for uncaught errors, concurrency controls via queues, idempotency support, and — critically for agent workflows — **waitpoints** for human-in-the-loop approval. Tasks are defined as TypeScript functions with typed inputs/outputs, versioned atomically to prevent conflicts during deployments, and observable through built-in tracing and logging.

For AI agents specifically, Trigger.dev supports streaming LLM responses, realtime run subscriptions (watch an agent work from your frontend), and customizable runtime environments (install browsers, Python, FFmpeg — whatever tools the agent needs). Two deployment options: hosted cloud or self-hosted via Docker Compose / Kubernetes Helm chart. Apache-2.0 license. YC W23, $16M Series A (Standard Capital), $19M total raised.

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│          Trigger.dev Platform                │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │         Task Definition Layer        │   │
│  │  TypeScript functions + typed I/O    │   │
│  │  Automatic retries + idempotency     │   │
│  └──────────────────┬───────────────────┘   │
│                     │                        │
│  ┌──────────────────▼───────────────────┐   │
│  │       Durable Execution Engine       │   │
│  │  ┌────────────┐  ┌───────────────┐   │   │
│  │  │ Checkpoint │  │ Resume Logic  │   │   │
│  │  │ Snapshots  │  │ (crash-safe)  │   │   │
│  │  └────────────┘  └───────────────┘   │   │
│  │  ┌────────────┐  ┌───────────────┐   │   │
│  │  │ Queue Mgmt │  │ Concurrency   │   │   │
│  │  │ & Priority │  │ Controls      │   │   │
│  │  └────────────┘  └───────────────┘   │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ Waitpoints   │  │ Observability      │   │
│  │ (HITL, ext   │  │ (Tracing, Logs,    │   │
│  │  events)     │  │  Realtime UI)      │   │
│  └──────────────┘  └────────────────────┘   │
│                                              │
│  Deployment: Docker Compose / K8s Helm      │
└──────────────────────────────────────────────┘
```

Key technical details:
- **No timeouts** — tasks run indefinitely (unlike Lambda's 15min, Vercel's 300s)
- **Checkpoint-resume** — automatic state snapshots; tasks survive crashes and redeploys
- **Atomic versioning** — deploying new task versions doesn't disrupt running tasks
- **Typed tasks** — TypeScript-native with Zod schema validation for inputs/outputs
- **Queue primitives** — concurrency limits, priority levels, FIFO ordering
- **Waitpoints** — pause execution waiting for human approval, external events, or timer
- **Batch triggering** — run tasks in parallel batches with aggregated results
- **Cron schedules** — durable cron that survives restarts (unlike node-cron)
- **Environment support** — dev, staging, preview, production environments
- **Self-hosting** — Docker Compose or Kubernetes (official Helm chart)

---

## Publisher Background

Founded in 2022 by **Matt Aitken** (CEO), **Eric Allam** (CTO), **Daniel Patel**, and **James Ritchie**. YC W23 cohort. 135+ contributors.

Funding: $3M seed, $16M Series A (Standard Capital, with participation from Rebel Fund and CTO Fund angel Michael Grinich). Total: $19M.

Eric Allam is the primary technical driver — prolific open-source contributor. The team has deep background in TypeScript developer tooling and has iterated from "background jobs framework" to "AI agent execution platform" — a pivot that follows market demand.

---

## What's Valuable for Us

- **Durable execution as crash recovery**: Our current crash recovery relies on tmux session persistence + state files. Trigger.dev's checkpoint-resume model is architecturally superior — the execution engine handles crashes, not our orchestrator. This directly addresses our tmux recovery complexity.
- **TypeScript-native**: 98.4% TypeScript. Our stack is TypeScript/shell. No language impedance mismatch. Tasks are defined as TypeScript functions — same mental model as our current agent task definitions.
- **Queue + concurrency controls**: Our orchestrator manually manages agent concurrency (2-3 agents max, coordination overhead exponent 1.724). Trigger.dev's queue primitives could enforce these limits at the infrastructure level rather than in orchestrator logic.
- **Waitpoints for human-in-the-loop**: Our AUTO_MODE flag controls whether agents wait for human input. Trigger.dev's waitpoints formalize this pattern — pause an agent workflow, wait for approval, resume. More robust than our file-flag approach.
- **Self-hostable (Apache-2.0)**: Docker Compose deployment for single-machine, Kubernetes for scale. We could start with Docker Compose alongside our tmux setup and migrate gradually.
- **Observability built-in**: Tracing and logging for every task run. Currently we rely on tmux capture-pane and state files for observability — Trigger.dev would give us proper run history, error traces, and performance data.
- **Atomic versioning**: Deploy updated agent logic without killing running agents. Our current approach requires manual orchestrator coordination to avoid disrupting in-flight work.

---

## What's NOT Relevant

- **Cloud-hosted execution**: The managed cloud service adds a dependency and removes our local-first control. We'd want self-hosted deployment to maintain the current operational model.
- **Web UI / Dashboard**: Trigger.dev includes a web dashboard for monitoring runs. We prefer terminal-first operations. The dashboard is useful for debugging but shouldn't become the primary interface.
- **Generic background jobs features**: Job scheduling, webhook triggers, API route handlers — these are the "background jobs framework" legacy features. We specifically need the durable execution + agent workflow capabilities.
- **Realtime frontend subscriptions**: Streaming agent output to a web frontend — we don't have a web frontend for the orchestrator. Terminal output via tmux is our interface.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Deploy self-hosted Trigger.dev alongside our orchestrator. Wrap agent task spawning in Trigger.dev tasks to get automatic retries, checkpointing, and queue management. Start with a single business line as proof of concept.
- **Phase 3 (Days 60-90)**: Migrate from tmux-based agent management to Trigger.dev task management. Each agent becomes a Trigger.dev task with typed inputs (task description, context, constraints) and outputs (PR URL, status, errors). The orchestrator dispatches tasks instead of managing tmux sessions.
- **Phase 4 (Days 90+)**: Full federated deployment. Each business line runs its own Trigger.dev instance (DSGVO isolation). The thin meta-layer dispatches tasks across instances. Queue concurrency controls enforce the 2-3 agent optimal team size per business line.

---

## Key Takeaway

> **Trigger.dev is the strongest infrastructure candidate for replacing our tmux-based agent execution — TypeScript-native, durable checkpointing, self-hostable under Apache-2.0, and its task/queue model maps directly to our orchestrator pattern. Evaluate for Phase 2 adoption.**
