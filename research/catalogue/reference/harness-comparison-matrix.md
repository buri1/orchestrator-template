# Agent Harness Comparison Matrix

**Type:** Reference — Comparison Matrix
**Source:** research/2026-03-05_harness-comparison-matrix.md
**Date:** 2026-03-05

---

## Purpose

Comprehensive comparison of 10 coding agent harnesses evaluated as foundations for building a custom multi-agent orchestrator. Scored across 14 general dimensions and 6 orchestration-specific dimensions.

---

## Harnesses Evaluated

| Abbrev. | Harness | Language | License | Stars |
|---------|---------|----------|---------|-------|
| Pi | Pi Agent (badlogic/pi-mono) | TypeScript | MIT | ~9-19K |
| CC | Claude Code (Anthropic CLI) | TypeScript | Proprietary | N/A |
| OC | OpenCode (anomalyco) | Go/TypeScript | MIT | ~116K |
| Aider | Aider | Python | Apache 2.0 | ~26K+ |
| Goose | Goose (Block) | Rust | Apache 2.0 | ~27-32K |
| Cline | Cline | TypeScript | Apache 2.0 | ~58K |
| Cont. | Continue | TypeScript | Apache 2.0 | ~26K |
| Roo | Roo Code | TypeScript | Apache 2.0 | ~22K |
| Codex | Codex CLI (OpenAI) | Rust | Apache 2.0 | ~63K |
| SDK | Claude Agent SDK | TypeScript/Python | Anthropic Commercial ToS | N/A |

---

## General Feature Scoring (1-5 scale)

| Dimension | Pi | CC | OC | Aider | Goose | Cline | Cont. | Roo | Codex | SDK |
|---|---|---|---|---|---|---|---|---|---|---|
| Model Support | 5 | 1 | 5 | 5 | 5 | 5 | 5 | 5 | 1 | 1 |
| Extension System | 5 | 4 | 4 | 2 | 4 | 4 | 3 | 4 | 3 | 5 |
| Multi-Agent | 2 | 4 | 3 | 1 | 4 | 3 | 1 | 2 | 4 | 5 |
| Tool Registration | 5 | 4 | 4 | 2 | 4 | 3 | 3 | 4 | 3 | 5 |
| Event/Hook System | 5 | 4 | 2 | 2 | 3 | 3 | 3 | 2 | 2 | 5 |
| TUI/UI Customization | 4 | 3 | 5 | 3 | 4 | 4 | 4 | 4 | 4 | 5 |
| MCP Support | 2 | 5 | 5 | 2 | 5 | 5 | 4 | 4 | 4 | 5 |
| Git Worktree | 2 | 5 | 4 | 2 | 2 | 3 | 1 | 1 | 5 | 4 |
| Session Management | 4 | 4 | 5 | 3 | 3 | 3 | 3 | 3 | 4 | 5 |
| Cost Model | 5 | 2 | 5 | 5 | 5 | 5 | 5 | 5 | 2 | 3 |
| License | 5 | 1 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 1 |
| Community | 2 | 4 | 5 | 4 | 4 | 5 | 4 | 3 | 5 | 3 |
| Documentation | 3 | 5 | 4 | 5 | 4 | 4 | 5 | 4 | 5 | 5 |
| Stability | 3 | 5 | 4 | 5 | 4 | 5 | 4 | 3 | 5 | 3 |
| **TOTAL** | **52** | **51** | **60** | **44** | **52** | **52** | **46** | **45** | **52** | **55** |

> These totals reflect general-purpose feature breadth. The orchestration-specific scoring below reweights for the orchestrator use case.

---

## Orchestration-Specific Scoring (1-5 scale, weighted)

| Capability (Weight) | Pi | CC | OC | Aider | Goose | Cline | Cont. | Roo | Codex | SDK |
|---|---|---|---|---|---|---|---|---|---|---|
| Programmatic Sub-Agents (x3) | 2 | 4 | 3 | 1 | 4 | 3 | 1 | 1 | 4 | 5 |
| Custom System Prompts (x2) | 5 | 5 | 5 | 3 | 5 | 4 | 4 | 5 | 4 | 5 |
| Agent Health Monitoring (x2) | 3 | 3 | 3 | 1 | 3 | 3 | 1 | 2 | 3 | 5 |
| Agent Lifecycle Mgmt (x3) | 4 | 4 | 3 | 1 | 4 | 3 | 1 | 2 | 4 | 5 |
| Model Routing Per Agent (x2) | 5 | 1 | 5 | 5 | 5 | 5 | 5 | 5 | 2 | 2 |
| Tool Set Per Agent (x2) | 5 | 5 | 5 | 1 | 5 | 4 | 2 | 5 | 4 | 5 |
| **Weighted Total (max 70)** | **49** | **49** | **52** | **26** | **57** | **46** | **28** | **38** | **49** | **63** |
| **Normalized (%)** | **70%** | **70%** | **74%** | **37%** | **81%** | **66%** | **40%** | **54%** | **70%** | **90%** |

---

## Composite Rankings (General 40% + Orchestration 60%)

| Rank | Harness | General (40%) | Orchestration (60%) | Composite | Key Strength |
|---|---|---|---|---|---|
| 1 | **Claude Agent SDK** | 36.7 | 54.0 | **90.7** | Full programmatic control, purpose-built for orchestration |
| 2 | **OpenCode** | 40.0 | 44.6 | **84.6** | Largest community + model-agnostic + growing orchestration |
| 3 | **Goose (Block)** | 34.7 | 48.9 | **83.6** | Best native sub-agents + MCP ecosystem + open license |
| 4 | **Pi Agent** | 34.7 | 42.0 | **76.7** | Maximum extensibility, MIT license, build anything |
| 5 | **Codex CLI** | 34.7 | 42.0 | **76.7** | Best auto-orchestration, native worktrees |
| 6 | **Claude Code** | 34.0 | 42.0 | **76.0** | Most mature interactive multi-agent, Agent Teams |
| 7 | **Cline** | 34.7 | 39.4 | **74.1** | Largest VS Code base, enterprise governance |
| 8 | **Roo Code** | 30.0 | 32.6 | **62.6** | Best mode-based orchestration |
| 9 | **Continue** | 30.7 | 24.0 | **54.7** | Best CI/CD integration |
| 10 | **Aider** | 29.3 | 22.3 | **51.6** | Best git-native pair programming |

---

## Rankings by Use Case

**Full programmatic orchestration (building your own framework):**
1. Claude Agent SDK (90%)
2. Pi Agent (76%) — MIT + full extension API
3. Goose (83%) — Apache 2.0 + native sub-agents

**Model-agnostic orchestration:**
1. Goose (81%)
2. OpenCode (74%)
3. Pi Agent (70%)

**Committed to Claude, want maximum power:**
1. Claude Agent SDK (90%)
2. Claude Code (70%)

**Largest community and ecosystem:**
1. OpenCode (116K stars)
2. Codex CLI (63K stars)
3. Cline (58K stars)

**License freedom paramount:**
1. Pi Agent (MIT)
2. OpenCode (MIT)
3. Any Apache 2.0 (Aider, Goose, Cline, Continue, Roo Code, Codex CLI)

---

## Vendor Lock-in vs. Escape Hatch

| Harness | Lock-in Risk | Escape Path |
|---------|-------------|-------------|
| Claude Agent SDK | High — Claude models only | No escape. Rewrite required. |
| Claude Code | High — Anthropic proprietary CLI | No escape. Rewrite required. |
| Codex CLI | High — OpenAI models only | No escape. Rewrite required. |
| Goose | None — any LLM, Apache 2.0, Linux Foundation | Clean escape. Config-level provider change. |
| OpenCode | None — any model, MIT | Clean escape. Config-level provider change. |
| Pi Agent | None — any provider, MIT | Clean escape. Swap provider config, keep extensions. |
| Aider / Cline / Roo / Continue | None — model-agnostic | Clean escape but limited orchestration to preserve. |

---

## Recommendation Summary

| Approach | Harness | What You Get | What You Build |
|---|---|---|---|
| **Buy** | Claude Code + Agent Teams | Full orchestration out of the box | Nothing (but limited customization) |
| **Integrate** | Claude Agent SDK | Programmatic agent primitives | Orchestration logic, monitoring, UI |
| **Extend** | Goose or OpenCode | Agent framework + sub-agents + MCP | Custom orchestration patterns |
| **Build** | Pi Agent | Minimal agent core + extension API | Everything: sub-agents, routing, lifecycle |

**Primary:** Hybrid — Claude Agent SDK for orchestration core, with Pi Agent architecture patterns for extensibility.

**If vendor lock-in unacceptable:** Goose (81% orchestration, Apache 2.0, Linux Foundation governance, any LLM).

**If maximum long-term control:** Pi Agent (MIT, most flexible extension API, you build exactly what you need).

**Avoid for orchestration:** Aider (no sub-agents), Continue (no orchestration primitives), Roo Code (mode-switching is not multi-agent).

---

## Burak's Notes

<!-- Add decision notes, updates, or re-evaluations here -->

---

*Source: research/2026-03-05_harness-comparison-matrix.md*
