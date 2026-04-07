# CodeMachine-CLI

> **An open-source tool that orchestrates AI coding agents into repeatable, long-running workflows.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [moazbuilds/CodeMachine-CLI](https://github.com/moazbuilds/CodeMachine-CLI) |
| GitHub Stars | 2,400 (as of 2026-03-08) |
| Publisher | moazbuilds / Moaz Mali (solo developer, Cairo, Egypt) |
| License | Apache 2.0 |
| Tech Stack | TypeScript (98%), Bun runtime, ESLint |
| Maturity | 🟡 Early (v0.8.0 Nova BETA) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly comparable to our L-Thread Orchestrator — same problem space (multi-agent orchestration via CLI), same TypeScript stack. CodeMachine is the closest open-source competitor to what we've built. |
| **Novelty** | 5/10 | Validates our approach but with a different execution model. Spec-to-code pipeline is more opinionated than our task-based approach. The "Ali Workflow Builder" interactive workflow creation is interesting. |
| **Actionable** | 5/10 | We wouldn't switch to CodeMachine, but studying its workflow persistence model, inter-agent communication patterns, and context passing could improve our orchestrator. The Sustaina Platform case study (7 microservices, 500+ files) is a good benchmark for what multi-agent orchestration can produce. |

---

## Overview

CodeMachine-CLI is an orchestration platform that drives AI coding agents (Claude Code, Codex, Cursor) through structured, long-running workflows. Where our L-Thread Orchestrator uses prompt engineering and state files to coordinate agents, CodeMachine takes a more infrastructure-heavy approach: it spawns agents via their headless CLI modes, manages context passing between phases, and handles persistence for multi-day workflows.

The core workflow follows a spec-to-code pipeline: architect a system blueprint from requirements, formulate execution plans, engineer production-grade code, generate testing and deployment automation, and integrate validation checks. This is more prescriptive than our task-based approach — CodeMachine encodes a specific software development methodology into its orchestration, while we keep the orchestrator methodology-agnostic.

The tool has been battle-tested on the Sustaina Platform (a full-stack ESG compliance system spanning 7 microservices, 500+ files, and 60,000+ lines of code), demonstrating that multi-agent orchestration can produce substantial real-world codebases. Claims of 25-37x speed improvement over manual AI agent orchestration.

---

## Technical Architecture

- **Runtime**: Bun (TypeScript/JavaScript runtime, faster than Node.js)
- **Installation**: `npm i -g codemachine`
- **Agent Interface**: Spawns AI coding CLIs (Claude Code, Codex, Cursor) in headless mode via CLI arguments
- **Workflow Engine**: Multi-phase pipeline with inter-agent communication and context passing
- **Persistence**: Workflow state survives interruptions; can run for hours or days
- **Parallelism**: Supports parallel agent execution across workflow phases
- **Prompt Management**: Dynamic prompt templates with context engineering
- **Interactive Builder**: "Ali Workflow Builder" for interactive workflow creation
- **Autonomy Spectrum**: Supports workflows from interactive (human-in-loop) to fully autonomous

**Key Architectural Decisions:**
- CLI-native (no web UI, no API server — pure terminal)
- Spec-driven (workflows defined by specification files, not ad-hoc commands)
- Agent-agnostic (supports multiple coding CLIs as execution backends)
- Phase-based (strict pipeline: architect → plan → implement → test → validate)

---

## Publisher Background

Moaz Mali (moazbuilds) is a solo developer based in Cairo, Egypt, focused on AI agent systems. Beyond CodeMachine, he's built ClaudeClaw (a lightweight OpenClaw variant for Claude Code) and Pragma (modular AI content creation workflow). The project has 882 commits and 2.4k stars, indicating substantial individual effort. Latest release is v0.8.0 Nova BETA (February 2026), suggesting active development but not yet production-stable. The sole-developer status is both a strength (fast iteration, opinionated decisions) and a risk (bus factor of 1).

---

## What's Valuable for Us

- **Sustaina Platform case study**: 7 microservices, 500+ files, 60,000+ lines — this is the most concrete evidence we've seen of multi-agent orchestration producing a substantial codebase. Worth studying their workflow definition to understand how they broke down such a large system.
- **Workflow persistence model**: CodeMachine's ability to run workflows for hours or days with state persistence is directly relevant to our orchestrator's crash-protection concerns (our tmux session persistence layer).
- **Headless CLI spawning**: How CodeMachine interfaces with Claude Code, Codex, and Cursor in headless mode is useful reference for our agent spawning patterns.
- **Context passing between agents**: Inter-agent communication and context engineering patterns could inform how we pass state between L-Thread agents.
- **25-37x speed claims**: Useful benchmark for quantifying the value of multi-agent orchestration vs manual agent interaction.

---

## What's NOT Relevant

- **Spec-to-code methodology**: CodeMachine bakes in a specific development methodology (architect → plan → implement → test → validate). Our orchestrator is intentionally methodology-agnostic — the orchestrator coordinates, it doesn't prescribe how work gets done. This conflicts with our "DU BIST KEIN ENTWICKLER" principle.
- **Bun runtime**: We use Node.js/npm. Bun compatibility is improving but adds unnecessary complexity.
- **BETA status**: v0.8.0 with incomplete features is not production-ready. We can't risk our revenue-generating system on beta software.
- **Agent-agnostic approach**: We've deliberately chosen Claude-first. Supporting multiple coding CLIs adds complexity we don't need.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the workflow persistence model for improving our tmux crash-protection layer. Benchmark our orchestrator's output against the Sustaina Platform case study.
- **Phase 3 (Days 60-90)**: If we formalize our orchestrator into a reusable framework, CodeMachine's architecture doc is a good reference for what to build (and what to avoid — like baking in a methodology).
- **Phase 4 (Days 90+)**: If we productize the orchestrator as a SaaS tool, CodeMachine is a direct competitor to understand and differentiate from.

---

## Key Takeaway

> **The closest open-source competitor to our L-Thread Orchestrator — validates our approach with a more prescriptive spec-to-code pipeline, and the Sustaina Platform case study (60K LOC across 7 microservices) is the best proof point we've seen for multi-agent orchestration at scale.**
