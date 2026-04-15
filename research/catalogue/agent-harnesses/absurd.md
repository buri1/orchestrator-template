# Absurd

> **The simplest durable execution workflow system -- entirely based on Postgres and nothing else.**

| Field | Value |
|-------|-------|
| Category | Agent Harnesses |
| Repository | [github.com/earendil-works/absurd](https://github.com/earendil-works/absurd) |
| GitHub Stars | 1,593 (as of 2026-04-04) |
| Publisher | earendil-works (organization) -- created by Armin Ronacher (lucumr.pocoo.org) |
| License | Apache-2.0 |
| Tech Stack | Postgres (stored functions), Python (absurdctl CLI), TypeScript/Python/Go SDKs |
| Maturity | 🟢 Growing (1.5k stars, 62 forks, active development, multi-SDK) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Durable execution is the missing persistence layer in our orchestrator. Agent tasks that survive crashes, restarts, and compactions without losing state is exactly what we need for long-running multi-business orchestration. |
| **Novelty** | 7/10 | Postgres-only durable execution with zero additional services is a genuinely novel simplification. Most competitors (Temporal, Inngest) require dedicated infrastructure. The "absurd" thesis is that Postgres stored functions can replace all of that. |
| **Actionable** | 8/10 | TypeScript SDK available. We already use Supabase (Postgres). Could integrate Absurd as the durability layer for orchestrator task state, replacing our JSON state files with checkpointed durable workflows. Agent skill installation (`absurdctl install-skill`) shows explicit agent-workflow design intent. |

---

## Overview

Absurd is a durable execution / workflow system built entirely on top of Postgres stored functions. No additional services, no message brokers, no coordinator processes. You apply a single SQL file to your database, install an SDK, and you have durable workflows with automatic retries, checkpointing, sleep, and event-driven suspension.

The core abstraction: a **task** dispatches onto a **queue**, a **worker** pulls it, and the task is subdivided into **steps**. Each step result is checkpointed in Postgres. If the process crashes mid-task, the engine replays checkpoints and resumes from the last completed step -- exactly-once semantics expressed as readable code.

Tasks can sleep (scheduled wake-up), suspend for events (race-free cached events), and spawn child tasks. The system is pull-based by design -- workers pull tasks as they have capacity, avoiding backpressure issues inherent in push architectures.

The project explicitly supports AI agent workflows. It ships with `absurdctl install-skill` to inject Absurd skills into agent working directories (`.agents/skills` or `.pi/skills`), showing first-class intent for agent-driven durable execution.

Created by Armin Ronacher (creator of Flask, Rye, uv, Sentry SDK), which signals high engineering quality and strong maintenance trajectory.

---

## Technical Architecture

```
┌──────────────────────────────────────┐
│         Client Application           │
│  (TypeScript / Python / Go SDK)      │
├──────────────────────────────────────┤
│       Absurd SDK Layer               │
│  - registerTask()                    │
│  - ctx.step() → checkpoint           │
│  - ctx.awaitEvent() → suspend        │
│  - ctx.sleep() → scheduled resume    │
│  - app.spawn() → child tasks         │
├──────────────────────────────────────┤
│       Worker (Pull-Based)            │
│  - Pulls tasks from queue            │
│  - Executes steps sequentially       │
│  - Replays checkpoints on restart    │
├──────────────────────────────────────┤
│       Postgres Stored Functions      │
│  ┌────────────────────────────────┐  │
│  │ absurd.sql (single file)      │  │
│  │ - Queue management            │  │
│  │ - Task state machine          │  │
│  │ - Step checkpointing          │  │
│  │ - Event caching (first wins)  │  │
│  │ - Retry / scheduling          │  │
│  │ - Worker claim / heartbeat    │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│       Tooling                        │
│  - absurdctl: CLI (init, migrate,    │
│    create-queue, spawn, retry)       │
│  - habitat: Web UI dashboard (Go)    │
│  - install-skill: agent integration  │
└──────────────────────────────────────┘
```

**Key design decisions:**
- **Postgres-only**: Zero additional infrastructure. All state, scheduling, retries, and event caching live in Postgres stored functions
- **Pull-based**: Workers pull tasks as they have capacity. No push coordinator needed
- **Step checkpointing**: Each step result is stored in Postgres. On replay, completed steps return cached results without re-executing
- **Event caching (first-emit-wins)**: Events are cached and race-free. `awaitEvent` suspends the task until the event arrives
- **Single SQL file**: The entire system is one `absurd.sql` applied to any Postgres database. Migrations provided for upgrades
- **Multi-language SDKs**: TypeScript, Python, Go (experimental)

---

## Publisher Background

The repository is under the `earendil-works` GitHub organization. The announcement post is on `lucumr.pocoo.org`, which is Armin Ronacher's blog -- the creator of Flask, Jinja2, Rye, uv, and the Sentry Python SDK. This is a highly credible publisher with a track record of building widely-adopted developer tools. The project has grown to 1,593 stars and 62 forks since its October 2025 announcement, with active development (last push April 2026). The presence of three SDKs, a CLI tool, a web UI (habitat), and agent skill installation shows serious investment in the ecosystem.

---

## What's Valuable for Us

1. **Durable task state for orchestrator**: Our orchestrator currently tracks state in JSON files (`orchestrator-tmux-state.json`). Absurd could replace this with checkpointed durable workflows where each orchestrator phase (SPAWN_WORKER, WAIT_FOR_PR, REVIEW, E2E_TEST) becomes a step. If the orchestrator crashes or compacts, it resumes from the last checkpoint instead of losing context.

2. **Postgres-only = Supabase-compatible**: We already use Supabase (Postgres) for OmniPort-HH. Absurd requires only a single SQL file applied to the database -- no additional services. This aligns with our "simplicity over ego" principle.

3. **Agent skill integration**: `absurdctl install-skill` explicitly supports agent workflows. Our orchestrator workers could use Absurd skills to make their own work durable -- e.g., a worker doing a multi-step refactor could checkpoint after each file, surviving crashes without re-doing work.

4. **Event-driven suspension**: The `awaitEvent` pattern maps directly to our "WAIT_FOR_PR" phase. Instead of polling with `tmux capture-pane`, a task could suspend and resume when a GitHub webhook emits the PR event.

5. **Habitat web UI**: The Go-based web dashboard for inspecting task state could complement our headless orchestrator, giving us visibility into running and completed tasks.

---

## What's NOT Relevant

- **Order fulfillment / payment examples**: The README examples focus on e-commerce workflows. Our use case is agent orchestration, not transactional processing.
- **Go SDK**: We're TypeScript/shell. The experimental Go SDK isn't useful for us directly.
- **Push-based alternatives**: Absurd explicitly rejects push. If we ever need HTTP webhook-triggered tasks, we'd need a thin adapter layer.

---

## Future Use Cases

- **Phase 1 (Immediate)**: Evaluate applying `absurd.sql` to our Supabase instance and replacing `orchestrator-tmux-state.json` with a durable workflow. Each orchestrator loop iteration becomes a checkpointed task.
- **Phase 2 (Days 14-30)**: Use Absurd's `install-skill` to make orchestrator workers durable. Workers that crash mid-refactor resume from the last completed step instead of restarting.
- **Phase 3 (Days 30-60)**: Implement event-driven orchestration using `awaitEvent` -- replace polling patterns with event suspension for PR creation, E2E test completion, and deployment hooks.
- **Phase 4 (Days 60+)**: Deploy habitat dashboard alongside orchestrator for client-visible task inspection and audit trails.

---

## Key Takeaway

> **Absurd solves the "state amnesia" problem in our orchestrator -- the fact that crashes, compactions, and restarts lose all in-flight context. By moving task state into Postgres checkpoints, every orchestrator phase becomes resumable. The Postgres-only architecture means zero new infrastructure on top of our existing Supabase stack.**
