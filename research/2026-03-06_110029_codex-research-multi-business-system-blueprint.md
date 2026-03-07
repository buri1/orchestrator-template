# Memo: Layered Architecture for Burak's Multi-Business Production System

**Date:** 2026-03-06

## Core Thesis

Do not build one big unified "everything system." Build modular systems on a shared infrastructure spine.

Burak's advantage is not owning a giant agent runtime. It is owning a portfolio-grade control plane that can drive multiple businesses and products while reusing the same execution substrate: state files, structured events, quality gates, model routing, worktree/session isolation, and audit logs.

The current orchestrator already has the right execution DNA:
- orchestrator never writes code
- tiered context
- file-based state
- bounded agent loops
- E2E as a gate
- tmux/Conduit/Teams isolation
- structured event streaming as the observability base

What is missing is one layer above it and one layer below it:
- Above: business and goal control.
- Below: deterministic telemetry, policy enforcement, and reusable infra services.

This should borrow Elvis Sun's Zoe pattern and OpenClaw's gateway/heartbeat ideas, but adapted to Burak's actual situation:
- business context lives in the orchestrator, not in the coding agents
- workers stay narrow, disposable, and isolated
- files and events are the protocol
- routing is deterministic where possible
- autonomy is bounded by trust, cost, and verification
- no full OpenClaw-style agent OS until there is a proven need

**Recommendation:** unify the substrate, not the workflows. One shared control substrate should power several bounded business/product modules.

## Architecture Diagram

```text
                                   Burak
                                     |
                    +-----------------------------------+
                    | Portfolio / Business Layer        |
                    | strategy | economics | risk | SLA |
                    +-----------------------------------+
                                     |
                    +-----------------------------------+
                    | Goals / Projects Layer            |
                    | business -> product -> goal ->   |
                    | project -> task -> run -> verdict|
                    +-----------------------------------+
                                     |
               ===================== CONTROL PLANE =====================
                                     |
      +-------------------------------------------------------------------+
      | Shared Orchestration Services                                      |
      | scheduler | policy engine | model routing | cost budgets |         |
      | FutureLearnings/patterns | project registry | audit log |          |
      | structured event ingest | notifications | approval rules |         |
      +-------------------------------------------------------------------+
             |                          |                          |
             v                          v                          v
   +-------------------+      +-------------------+      +-------------------+
   | Project Cell A    |      | Project Cell B    |      | Project Cell C    |
   | current orchestr. |      | current orchestr. |      | current orchestr. |
   | + task backlog    |      | + task backlog    |      | + task backlog    |
   +-------------------+      +-------------------+      +-------------------+
             |                          |                          |
             v                          v                          v
        -------------------------- EXECUTION PLANE --------------------------
             |                          |                          |
   +-------------------+      +-------------------+      +-------------------+
   | coder agents      |      | reviewer agents   |      | e2e/research/docs |
   | worktrees/sessions|      | read-heavy        |      | role-specific MCP |
   +-------------------+      +-------------------+      +-------------------+
                                     |
      +-------------------------------------------------------------------+
      | Deterministic Infra                                                 |
      | git/worktrees | JSON/JSONL state | stream-json event bridge | CI   |
      | Chrome DevTools MCP | screenshots | secrets | dashboards | billing |
      +-------------------------------------------------------------------+
```

## System Layers

### 1. Business Portfolio Layer

This is the top layer and should remain mostly human-directed.

It owns:
- which businesses, clients, or product lines exist
- target economics, pricing model, and trust posture
- autonomy limits by business line
- what deserves attention this week

It should store durable business objects, not chat transcripts:
- business registry
- operating constraints
- pricing and margin targets
- risk class and approval policy
- recurring opportunities such as maintenance, delivery, or review

This is the Burak-specific adaptation of Elvis's Zoe idea: the top layer holds the real business context. Coding agents do not need it.

### 2. Goals and Projects Layer

This is the translation layer between business intent and executable work.

Canonical hierarchy:

```text
Business -> Product -> Goal -> Project -> Task -> Run -> Artifact -> Verdict
```

It owns:
- specs
- acceptance criteria
- dependencies
- budgets
- SLA or delivery promises
- success metrics

This layer should be deterministic and inspectable. It should not ask an LLM to remember the portfolio. It should materialize goals and projects into files, state snapshots, and append-only logs.

### 3. Orchestration Control Layer

This is where the current orchestrator should evolve, not be replaced.

It should become a shared control substrate with:
- project registry
- scheduler and priority engine
- agent adapter layer for Claude Code/Codex/Pi-style runtimes later
- model routing by role and cost tier
- approval and escalation rules
- shared pattern memory evolved from `FutureLearnings`
- structured event ingestion from `stream-json`
- cost, token, and throughput accounting

This layer should be long-lived and portfolio-aware. It should know which project cell to activate, which agent role to spawn, and when to stop.

OpenClaw's useful lesson here is the gateway concept, not the full platform. Burak needs a thin gateway over his own workflows, not a universal agent OS.

### 4. Agent Execution Layer

This layer is intentionally boring and replaceable.

It contains bounded worker roles such as:
- coder
- reviewer
- e2e tester
- research/doc agent
- lint/refactor agent

Rules for this layer:
- each agent has one job
- each agent gets narrow context
- each agent runs in isolation
- each agent produces artifacts plus a handoff payload
- default pool size stays small, usually 2-3 concurrent workers per project cell

This is where Elvis and the architecture research agree: most systems break when the worker pool becomes a bag of agents. Keep roles explicit and handoffs structured.

### 5. Deterministic Infrastructure Layer

This is the real production substrate.

It should include:
- git branches and worktrees
- tmux/Teams/session management
- JSON/JSONL state snapshots and decision logs
- structured event files from `claude --output-format stream-json`
- event bridge, persistence, and dashboards
- CI, unit tests, E2E, screenshot diffing
- MCP allowlists per role
- notifications and client-facing status artifacts

Burak's current structured-events work is especially important here. It means the platform can be measured and audited from native event output instead of fragile terminal parsing.

### Unified vs Modular

The right shape is:
- **Unified at the substrate level**: one event model, one state model, one policy model, one quality-gate model, one adapter model.
- **Modular at the product level**: each business or product module gets its own project cell, backlog, context pack, and autonomy policy.

So the answer is not "one big unified system" and not "totally separate systems." It is **modular systems on shared infrastructure with a thin portfolio control plane above them**.

## Control Plane vs Execution Plane

| Area | Control Plane | Execution Plane |
|---|---|---|
| Lifespan | long-lived | ephemeral |
| Context | business, portfolio, goals, policies | task-local only |
| Responsibility | decide, route, budget, gate, observe | implement, review, test, report |
| State | canonical and durable | scratch plus handoff artifacts |
| Human interaction | approvals, exceptions, reprioritization | almost none |
| Model choice | assigned strategically | assigned per role |
| Replaceability | stable system asset | swappable runtime layer |

Design rule: **business context should stop at the control plane boundary**.

That is the main adaptation from Elvis/OpenClaw into Burak's current orchestrator:
- Elvis was right that the orchestrator should hold business memory.
- OpenClaw was right that routing, bindings, heartbeat, and markdown-defined capabilities belong in a central layer.
- Burak should still keep the execution plane thin and meta-orchestrated, because the current orchestrator is already strongest there.

A practical split:
- `Control plane`: project registry, priority engine, structured-event ingest, pattern memory, policy engine, cost budgets, approval workflows.
- `Execution plane`: current L-Thread loop, worker sessions, worktrees, review passes, E2E enforcement.

That keeps Burak's compounding asset in the control plane while letting the execution layer change as models and runtimes change.

## Suggested First Productization Slice

**Build first:** an **Active Maintenance Control Tower**.

Why this first:
- it is the closest thing to the current orchestrator's strengths
- it creates recurring revenue instead of one-off project revenue
- it is narrow enough to audit and sell
- it compounds pattern memory fast
- Phase 2 research already points to maintenance/autofix as the highest-leverage autonomous revenue lane

Minimal slice:
- one business lane
- 1-3 repos maximum
- one issue intake path: GitHub issue, CI failure, or Sentry incident
- one project cell per repo
- one execution chain: coder -> reviewer -> E2E verifier -> PR/report
- one human approval boundary before merge/deploy

V1 flow:

```text
incident or bug -> project cell -> task packet -> coder agent -> reviewer agent
-> e2e gate -> PR + report + audit trail -> Burak approval -> merge/deploy
```

V1 shared substrate to build now:
- project registry
- durable state snapshot and decision log
- structured events pipeline
- handoff schema
- E2E verdict store
- client/operator status report

V1 things to avoid:
- CRM automation
- sales agent departments
- general business memory graph
- cross-machine orchestration
- generic agent marketplace behavior
- broad OpenClaw-style channel operating system

This slice turns the current orchestrator from a good internal harness into a sellable production module.

## Risks If Overbuilt

1. **Context collapse**
A giant unified system will mix portfolio strategy, project planning, and code execution into the same prompt surface. That destroys the clean separation that makes Elvis's pattern work.

2. **Coordination tax**
Adding more agents, more layers, and more handoffs too early will create exactly the multi-agent overhead the research warns about. Burak does not need a 20-agent factory yet.

3. **Premature platforming**
A custom broker, distributed A2A layer, heavy memory store, or full web platform will slow productization and add failure modes before the first monetizable loop exists.

4. **Trust debt**
If autonomy expands faster than logs, quality gates, screenshots, and approval trails, the system becomes hard to sell and risky to operate.

5. **Provider lock-in in the wrong place**
Locking the business logic to one runtime or one model is a mistake. The control plane should be durable; the workers should be swappable.

6. **Rebuilding OpenClaw instead of using its lessons**
OpenClaw proves the value of gateways, markdown skills, proactive heartbeats, and file-based transparency. It does not mean Burak should clone a universal agent OS before his own product surface is stable.

## Candidate Product Visions Ranked by Leverage

1. **Active Maintenance Control Tower**
Recurring service for error intake, fix PRs, review, E2E validation, and client-facing reporting. Highest leverage because it is narrow, trustable, repeatable, and directly aligned with the current orchestrator.

2. **Outcome Delivery Factory**
A spec-to-shipping project system for fixed-scope builds across Burak's own products and client work. High leverage because it turns delivery into a reusable factory, but it is less recurring than maintenance.

3. **Portfolio Operator for Burak's Businesses**
A business-aware control plane spanning multiple ventures, projects, and support loops. Highest long-term upside, but third by near-term leverage because it has the widest context surface and the highest risk of becoming an overbuilt monolith.
