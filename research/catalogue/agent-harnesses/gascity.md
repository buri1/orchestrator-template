# GasCity

> **Multi-agent orchestration SDK in Go with 5 irreducible primitives, zero hardcoded roles, and pluggable runtime providers.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/gastownhall/gascity](https://github.com/gastownhall/gascity) |
| Publisher | Steve Yegge / Gastown Hall |
| License | MIT |
| Tech Stack | Go v1.25.0, Cobra CLI, TOML config, OpenTelemetry |
| Maturity | 🔴 Stealth / Pre-launch (deep engineering, not yet public) |
| Last Analyzed | 2026-04-02 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/5 | Directly comparable multi-agent orchestration system. Represents the "framework" approach vs our "bespoke prompt-driven" approach. |
| **Innovation** | 5/5 | Novel primitives (bead store, convergence loops, formula DAGs, zero-role philosophy). No hardcoded agent roles — all behavior is user-configured. |
| **Maturity** | 3/5 | Stealth/pre-launch, but deep engineering evident across 40+ CLI commands and multiple runtime backends. |
| **Adoptability** | 2/5 | Go-based — would need pattern translation to our TypeScript/shell stack. No direct code reuse possible. |

---

## Overview

GasCity is a multi-agent orchestration SDK/framework built in Go by Steve Yegge (formerly Google, Amazon, Grab). It provides **5 irreducible primitives** that form the foundation of all agent orchestration:

1. **Agent Protocol** — standardized interface for agent communication
2. **Bead Store** — persistent state tracking for agent work units
3. **Event Bus** — async inter-agent messaging backbone
4. **TOML Config** — declarative system configuration with hot reload
5. **Prompt Templates** — templated prompt composition

The core philosophy is **"zero hardcoded roles"** — unlike most frameworks that ship with predefined agent types (planner, coder, reviewer, etc.), GasCity treats all agent behavior as user-configured. Roles, workflows, and orchestration patterns are composed from primitives rather than inherited from the framework.

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│            40+ Cobra CLI Commands            │
│  (agent, bead, formula, order, convoy, ...)  │
├─────────────────────────────────────────────┤
│          Formula System (DAG Workflows)      │
│  ┌────────┐  ┌────────┐  ┌──────────────┐  │
│  │Step A  │→ │Step B  │→ │Convergence   │  │
│  │(agent) │  │(agent) │  │Loop (bounded)│  │
│  └────────┘  └────────┘  └──────────────┘  │
├─────────────────────────────────────────────┤
│           Runtime Providers                  │
│  ┌──────┐ ┌───────────┐ ┌────┐ ┌──────┐   │
│  │ tmux │ │subprocess │ │K8s │ │ exec │   │
│  └──────┘ └───────────┘ └────┘ └──────┘   │
├─────────────────────────────────────────────┤
│              Bead Store                      │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌─────────┐ │
│  │ Dolt │ │ File │ │ Memory │ │ Caching │ │
│  └──────┘ └──────┘ └────────┘ └─────────┘ │
├─────────────────────────────────────────────┤
│  Event Bus │ Inter-Agent Mail │ OTel Traces │
├─────────────────────────────────────────────┤
│  TOML Config (hot reload) │ Prompt Templates│
└─────────────────────────────────────────────┘
```

**Key design decisions:**
- **Pluggable runtime providers**: tmux, subprocess, Kubernetes, exec — same agent definition runs on any runtime
- **Bead store abstraction**: Multiple backends (Dolt for versioned SQL, file, memory, caching) behind a unified interface
- **Formula system**: DAG-based workflow composition across 24 files — formulas compile agent steps into dependency graphs
- **Convergence loops**: Bounded refinement cycles (run agent → check condition → refine → check → done or bail)
- **Zero hardcoded roles**: All agent behavior configured via TOML, not baked into framework code
- **Controller lock pattern**: Single-instance enforcement to prevent duplicate orchestrators
- **9-step context resolution chain**: Layered context assembly for agent prompts
- **CLAUDE.md**: Designed for Claude Code integration out of the box

---

## Key Features

| Feature | Description |
|---------|-------------|
| **40+ CLI Commands** | Full Cobra CLI covering agents, beads, formulas, orders, convoys, packs, mail |
| **Runtime Providers** | tmux, subprocess, Kubernetes, exec — swap runtime without changing agent definitions |
| **Bead Store** | Multi-backend persistent state (Dolt, file, memory, caching layer) |
| **Formula System** | DAG-based workflow composition (24 files); compiles agent steps into dependency graphs |
| **Convergence Loops** | Bounded refinement — run→check→refine→check, with configurable max iterations |
| **Inter-Agent Mail** | Async messaging between agents via mailbox primitives |
| **Order System** | Cron/interval scheduling for dispatching agent work |
| **Pack System** | Remote config composition — pull and merge configuration packs |
| **Convoy Graphs** | Grouped work units that travel together through the pipeline |
| **OpenTelemetry** | Built-in observability via OTel traces and spans |
| **Hot Config Reload** | TOML config changes take effect without restarting the system |
| **Controller Lock** | Single-instance enforcement pattern to prevent duplicate orchestrators |
| **9-Step Context Chain** | Layered context resolution for building agent prompts |

---

## Relevance to Orchestrator

**VERY HIGH** — GasCity is the most directly comparable system to our L-Thread Orchestrator in the catalogue. Both solve the same core problem (multi-agent code orchestration) but from opposite design philosophies:

| Dimension | GasCity | L-Thread Orchestrator |
|-----------|---------|----------------------|
| Approach | Framework SDK | Bespoke prompt-driven |
| Language | Go | TypeScript/Shell |
| Configuration | TOML (declarative) | Markdown + JSON (imperative prompts) |
| Agent roles | Zero hardcoded (all user-defined) | Orchestrator + Worker (fixed roles) |
| Runtime | Pluggable (tmux/K8s/subprocess/exec) | tmux only (hardcoded) |
| State | Bead store (multi-backend) | JSON state file |
| Workflow | Formula DAGs + convergence loops | Linear loop (10 steps) |
| Observability | OpenTelemetry native | Manual devlog |

---

## What's Valuable for Us

1. **Runtime provider abstraction**: The pattern of defining agents independently from their execution environment (tmux vs subprocess vs K8s) is the single most adoptable pattern. We're locked to tmux — a provider abstraction would let us add cmux or subprocess backends without rewriting agent logic.

2. **Formula compilation (DAG workflows)**: Our orchestrator loop is strictly linear (get task → spawn → wait → review → merge → test). GasCity's formula system compiles steps into dependency graphs, enabling parallel execution paths. Worth studying for Phase 3+.

3. **Convergence loops**: Their bounded refinement pattern (run → check → refine, max N iterations) is a formalized version of our review-fix loop (max 3 cycles). The convergence condition abstraction is cleaner.

4. **Bead store interface**: A unified interface over multiple storage backends is a pattern we need. Our JSON state file doesn't scale. The bead store's pluggable backends (file for local dev, Dolt for versioned history, memory for tests) is a clean separation.

5. **Zero-role philosophy**: Challenges our fixed orchestrator/worker role split. If all agent behavior were user-configured via TOML, adding a new role (e.g., researcher, reviewer, tester) wouldn't require code changes.

6. **Controller lock pattern**: We've hit duplicate orchestrator issues. Their single-instance lock is a simple pattern to adopt immediately.

---

## What's NOT Relevant

- **Go implementation**: No direct code reuse. Patterns only.
- **Dolt backend**: Version-controlled SQL database is over-engineered for our needs. File or memory backends are sufficient.
- **Kubernetes runtime**: We're developer-machine-first. K8s is a Phase 4+ concern.
- **Pack system**: Remote config composition assumes distributed teams. We're single-operator.

---

## Relationship to Gas Town Entry

The existing [Gas Town](../orchestration-platforms/gas-town.md) catalogue entry covers the higher-level orchestration platform and actor model. This entry covers **GasCity** specifically — the SDK/framework codebase, its primitives, CLI surface, and internal architecture. Gas Town is the vision; GasCity is the implementation.

---

## Future Use Cases

- **Phase 2 (Now)**: Adopt the controller lock pattern to prevent duplicate orchestrator instances. Study the convergence loop formalization for our review-fix cycle.
- **Phase 3 (Days 60-90)**: Evaluate runtime provider abstraction for cmux migration. Study formula compilation for parallel task execution.
- **Phase 4 (Days 90+)**: Consider bead store interface pattern if we outgrow JSON state. Evaluate zero-role configuration for supporting multiple business-line workflows.

---

## Key Takeaway

> **GasCity represents the "framework SDK" pole of agent orchestration design — the opposite of our "bespoke prompt-driven" approach. The runtime provider abstraction, formula DAG compilation, and bead store interface are the three patterns most worth studying. The controller lock pattern is adoptable immediately. The zero-role philosophy challenges our fixed orchestrator/worker split and deserves serious consideration for Phase 3+.**
