# DBOS

> **Lightweight durable workflows built on top of Postgres — add fault tolerance to your code with a few decorators, no external orchestration infrastructure required.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [github.com/dbos-inc/dbos-transact-ts](https://github.com/dbos-inc/dbos-transact-ts) (TS) / [github.com/dbos-inc/dbos-transact-py](https://github.com/dbos-inc/dbos-transact-py) (Python) |
| GitHub Stars | 1,100 (TS) / 1,200 (Python) (as of 2026-03-08) |
| Publisher | DBOS, Inc. (startup — founded by Mike Stonebraker + Matei Zaharia) |
| License | MIT |
| Tech Stack | TypeScript, Python, Go, Java; PostgreSQL (required) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Durable workflows with Postgres checkpointing directly addresses our need for crash recovery in multi-agent orchestration. Our tmux persistence layer is a DIY version of what DBOS does properly. |
| **Novelty** | 5/10 | Durable execution is a known pattern (Temporal, Inngest, Restate). DBOS's innovation is "no extra infrastructure" — just Postgres + decorators. That simplicity is genuinely novel vs. Temporal's heavy server. |
| **Actionable** | 6/10 | TypeScript library with MIT license. Could wrap our orchestrator workflows in DBOS decorators for crash recovery. Main blocker: requires Postgres, and we're currently file-based + tmux. |

---

## Overview

DBOS (Database-Oriented Operating System) is a lightweight library that makes application workflows durable by checkpointing execution state in PostgreSQL. Unlike Temporal or other durable execution platforms that require separate orchestration servers, DBOS is entirely contained in an open-source library — you connect it to Postgres, annotate your functions with decorators (`@DBOS.workflow()`, `@DBOS.step()`), and your code automatically becomes fault-tolerant. If the application crashes mid-workflow, upon restart it resumes from the last completed step.

The project was born from joint MIT-Stanford research by Turing Award winner Mike Stonebraker (creator of PostgreSQL) and Matei Zaharia (creator of Apache Spark, co-founder of Databricks). Their thesis is that the database should be the operating system's core primitive, not the filesystem — and that durability should be a property of the execution environment, not something bolted on with message queues and retry logic.

DBOS also maintains `durable-swarm` (Swarm + DBOS for crash-resistant multi-agent systems) and `dbos-openai-agents` (durable execution for OpenAI Agents SDK), demonstrating their focus on making agent workflows production-grade.

---

## Technical Architecture

```
┌──────────────────────────────────────────┐
│            Application Code              │
│                                          │
│  @DBOS.workflow()                        │
│  async function processOrder() {         │
│    await DBOS.step(chargePayment);       │
│    await DBOS.step(reserveInventory);    │  ← Each step checkpointed
│    await DBOS.step(sendConfirmation);    │
│  }                                       │
└──────────────────┬───────────────────────┘
                   │ Checkpoint after each step
          ┌────────▼────────┐
          │   PostgreSQL     │
          │                  │
          │  - Workflow state│
          │  - Step results  │  ← Rows in Postgres tables
          │  - Queue items   │
          │  - Event log     │
          └──────────────────┘
```

- **Data model**: Workflows stored as Postgres rows; each step result checkpointed
- **Core abstractions**: `workflow()` (durable function), `step()` (checkpointed operation), `WorkflowQueue` (background tasks), `sleep()` (durable pause), `recv()` (event notification)
- **Recovery mechanism**: On restart, DBOS replays the workflow from the beginning but skips already-completed steps (using stored results from Postgres)
- **Infrastructure**: Only requires PostgreSQL — no separate servers, message brokers, or orchestration infrastructure
- **Exactly-once**: Built-in idempotency for event processing (webhooks, Kafka consumers)
- **Observability**: Built-in OpenTelemetry tracing of workflow execution

---

## Publisher Background

DBOS, Inc. is a San Francisco-based startup with extraordinary academic pedigree. **Mike Stonebraker** (CTO, co-founder) won the Turing Award for his work on relational databases and is the creator of PostgreSQL, Ingres, and VoltDB. **Matei Zaharia** (founding advisor) created Apache Spark and co-founded Databricks. The company raised $8.5M in seed funding led by Engine Ventures and Construct Capital. CEO Jeremy Edberg previously led Reddit's infrastructure. The research basis comes from several years of joint MIT-Stanford work on database-oriented operating systems.

This is one of the most credible teams in infrastructure. When the PostgreSQL creator says "put everything in Postgres," you listen.

---

## What's Valuable for Us

- **Postgres-as-state-store pattern**: Our orchestrator currently uses JSON files for state (`_bmad/orchestrator-state.json`, `orchestrator-tmux-state.json`). DBOS demonstrates that Postgres can replace this with transactional guarantees, crash recovery, and queryability. If we ever move beyond file-based state, this is the pattern.
- **Decorator-based durability**: The `@workflow()` / `@step()` pattern is elegant and minimally invasive. We could wrap our orchestrator's task lifecycle in DBOS decorators to get automatic crash recovery without rewriting the core logic.
- **Durable Swarm integration**: `dbos-inc/durable-swarm` shows how to make multi-agent workflows crash-resistant. Their approach of wrapping Swarm's `run()` function with DBOS durability is a reference implementation for what we'd want for our agent spawning.
- **No Temporal overhead**: DBOS validates our instinct to avoid heavy orchestration infrastructure. "Just use Postgres" aligns with our thin shared layer philosophy.
- **TypeScript-first**: The TS library (`dbos-transact-ts`) matches our stack.

---

## What's NOT Relevant

- **Requires Postgres**: We're currently file-based + tmux. Adding a Postgres dependency is a significant infrastructure change that contradicts our "thin shared layer" phase 1 approach. This is a Phase 3+ consideration.
- **Not agent-aware**: DBOS makes workflows durable, not intelligent. It doesn't understand agent context, prompt engineering, or LLM orchestration. It's plumbing, not brain.
- **Cloud hosting pitch**: DBOS Pro (their commercial offering) adds hosted Postgres + dashboard. We don't need another SaaS dependency.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study `durable-swarm` source code for patterns on wrapping agent execution with checkpointing. Consider whether our tmux persistence layer could be replaced with a lighter DBOS-based approach.
- **Phase 3 (Days 60-90)**: If we introduce Postgres as our state store (likely for the federated business system), DBOS becomes the natural way to make our orchestrator workflows durable. Wrap task lifecycle in `@workflow()` / `@step()` decorators.
- **Phase 4 (Days 90+)**: Full durable execution for all business line workflows — payment processing, lead gen pipelines, SaaS factory deployments. DBOS's exactly-once event processing becomes critical at scale.

---

## Key Takeaway

> **DBOS is the "just use Postgres" answer to durable execution — built by the literal creator of PostgreSQL and the creator of Spark, it replaces heavyweight orchestration infrastructure (Temporal) with a lightweight library, and its TypeScript support + Durable Swarm integration make it the most natural crash-recovery layer for our orchestrator when we're ready to move beyond file-based state.**
