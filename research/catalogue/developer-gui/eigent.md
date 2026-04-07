# Eigent

> **The Open Source Cowork Desktop — multi-agent workforce built on CAMEL-AI framework for local-first task automation with parallel agent execution, browser control, and MCP integration.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [eigent-ai/eigent](https://github.com/eigent-ai/eigent) |
| GitHub Stars | 12,891 (as of 2026-03-09) — first star 2025-07-29, 500 by day 2, 1K by day 5, 5K by 2026-01-15, 10K by 2026-01-21 (explosive HN-driven growth) |
| Publisher | Eigent AI (startup, spun out of CAMEL-AI.org research collective) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (Electron + React + Tailwind + Radix UI + Zustand + React Flow), Python (FastAPI + Uvicorn + CAMEL multi-agent framework), Playwright (browser automation), OAuth 2.0 + Passlib |
| Maturity | 🟡 Early (v0.0.87, rapid release cadence — 87 releases since 2025-07, 1,482 forks, 168 open issues, very active) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Multi-agent workforce concept aligns with our agent swarm vision, but it's a desktop GUI app — opposite of our headless CLI-first tmux approach. The CAMEL framework underneath has legitimate multi-agent coordination patterns worth studying. |
| **Novelty** | 6/10 | Genuine multi-agent parallel execution (not just a Claude SDK wrapper like most Cowork clones). The Workforce system with coordinating root node + worker nodes + async task channels is architecturally more interesting than other entries in this category. Browser automation via dual-layer Python+TypeScript stack is a distinct approach. |
| **Actionable** | 4/10 | The CAMEL Workforce coordination patterns (failure tolerance, recursive workers for long-horizon tasks) could inform our agent team design. MCP tool integration pattern is useful reference. Not directly usable since it's a desktop app, not an orchestration library. |

---

## Overview

Eigent is an open-source desktop application that positions itself as the primary alternative to Anthropic's Claude Cowork. Unlike most Cowork clones that simply wrap the Claude Agent SDK in an Electron GUI (see Open Claude Cowork, Hello Halo), Eigent is built on the CAMEL-AI multi-agent framework and runs a genuine multi-agent workforce — multiple specialized agents working in parallel on decomposed subtasks.

The system ships with pre-defined worker agents: Developer Agent (code execution, terminal commands), Browser Agent (web search, content extraction via Playwright), Document Agent (document creation/management), and Multi-Modal Agent (image/audio processing). A coordinating root node breaks down user tasks, distributes work across worker agents via async task channels, and reassembles results. The human-in-the-loop pattern automatically requests user input when tasks encounter uncertainty.

Eigent operates in two modes: fully local (zero cloud dependencies, supports vLLM/Ollama/LM Studio for local models) and cloud-connected (managed infrastructure with their API). The local-first approach with BYOK (bring your own key) is the primary differentiator vs. Claude Cowork's $100-200/month subscription model. The project hit #1 on GitHub Trending and has maintained strong growth (12.9K stars in ~7 months).

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│           Electron Desktop App              │
│  React + TypeScript + Tailwind + Radix UI   │
│  React Flow (workflow visualization)        │
│  Zustand (state management)                 │
│                                             │
│  ┌──────────────────────────────────┐       │
│  │ Workflow UI                      │       │
│  │ - Task decomposition view        │       │
│  │ - Agent status panels            │       │
│  │ - Human-in-the-loop dialogs      │       │
│  │ - MCP tool configuration         │       │
│  └──────────────────────────────────┘       │
└──────────────┬──────────────────────────────┘
               │ IPC / API
┌──────────────┴──────────────────────────────┐
│        FastAPI Backend (Python)              │
│        Uvicorn async server                 │
│        OAuth 2.0 + Passlib auth             │
│                                             │
│  ┌──────────────────────────────────┐       │
│  │ CAMEL Workforce System           │       │
│  │                                  │       │
│  │  Coordinating Root Node          │       │
│  │    ├── Developer Agent           │       │
│  │    ├── Browser Agent             │       │
│  │    ├── Document Agent            │       │
│  │    └── Multi-Modal Agent         │       │
│  │                                  │       │
│  │  Async Task Channels             │       │
│  │  Failure Tolerance + Retry       │       │
│  │  Recursive Workers (long tasks)  │       │
│  └──────────────────────────────────┘       │
│                                             │
│  ┌──────────────────────────────────┐       │
│  │ Browser Automation (dual-layer)  │       │
│  │  Python: agent reasoning/orch    │       │
│  │  TypeScript: Playwright DOM ops  │       │
│  │  WebSocket bridge (async, low    │       │
│  │  latency)                        │       │
│  └──────────────────────────────────┘       │
│                                             │
│  MCP Integration Layer                      │
│  Built-in: web, code exec, Notion,          │
│  Google Suite, Slack                        │
│  Custom MCP tools supported                 │
└─────────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────────┐
│  Model Layer (BYOK / Local)                 │
│  - Cloud APIs (OpenAI, Anthropic, etc.)     │
│  - Local models (vLLM, Ollama, LM Studio)   │
│  - Model-agnostic via CAMEL abstraction     │
└─────────────────────────────────────────────┘
```

**Key Architectural Decisions:**
- **Python backend + TypeScript frontend**: Unlike pure-Electron Cowork clones, Eigent splits the agent runtime (Python/CAMEL) from the UI (TypeScript/Electron). This enables the Workforce coordination patterns from CAMEL.
- **Dual-layer browser automation**: Python handles agent-level reasoning; TypeScript/Playwright handles low-level DOM manipulation. WebSocket bridge keeps latency low.
- **Async task channels**: Worker agents communicate via async channels, enabling true parallel execution (not sequential tool calls).
- **Recursive workers**: Long-horizon tasks can spawn sub-workers, creating a tree of agent execution.

---

## Publisher Background

**Eigent AI** is a startup spun out of the CAMEL-AI.org research collective. CAMEL-AI (Communicative Agents for "Mind" Exploration of Large Language Model Society) is an open-source research community with 100+ researchers, known for the CAMEL framework (16.2K GitHub stars) and OWL (Optimized Workforce Learning, 19.2K stars).

**Lead developer:** Wendong Fan (908 of ~1,800 total commits), listed as AI Engineer at Eigent AI and top contributor to the CAMEL framework (75 commits). Other notable contributors: FooFindBar (213), a7m-1st (203), fengju0213 (202), nitpicker55555 (193).

The team appears to be 10+ active contributors based on GitHub data. No publicly reported funding — appears bootstrapped like CAMEL-AI.org. The project has a commercial cloud offering (managed infrastructure) alongside the open-source desktop app.

The CAMEL-AI research pedigree is the key differentiator vs. other Cowork clones — this team has published papers on multi-agent coordination and built the framework that powers the product.

---

## What's Valuable for Us

1. **CAMEL Workforce coordination model**: The coordinating root node + worker nodes + async task channels pattern maps directly to our orchestrator architecture. Their failure tolerance and recursive worker patterns for long-horizon tasks are worth studying in the CAMEL framework source (`camel-ai/camel`). This is the most architecturally mature multi-agent coordination system in the Cowork-alternative space.

2. **Dual-layer browser automation**: Separating agent reasoning (Python) from DOM manipulation (TypeScript/Playwright) via WebSocket is a clean architectural pattern. If we ever add browser-based testing or web scraping agents, this separation of concerns is the right approach.

3. **MCP integration as first-class**: Built-in MCP tools for Notion, Google Suite, Slack, plus custom MCP tool support. Shows MCP becoming the standard integration protocol for agent tools — validates our own MCP-heavy approach.

4. **Model-agnostic agent runtime**: CAMEL's abstraction layer supports any model backend (cloud APIs, local models). While we're Anthropic-only today, this pattern would be valuable if we ever need model diversity for cost optimization.

5. **Task decomposition + parallel execution UI**: React Flow-based workflow visualization of how tasks get broken down and assigned to agents. Useful reference if we ever build a monitoring dashboard.

---

## What's NOT Relevant

1. **Desktop GUI paradigm**: We are CLI-first, tmux-based, headless. An Electron desktop app is architecturally opposite to our approach. The Master Blueprint explicitly keeps business context separated from code context — a unified desktop app violates this.

2. **Not Claude-native**: Eigent uses CAMEL framework with model-agnostic agents, not Claude Code/Agent SDK. Our entire stack is built on Claude Code's tool system, CLAUDE.md conventions, and the Claude Agent SDK. CAMEL's agent abstractions are a different paradigm.

3. **Consumer-focused UX**: Eigent targets non-technical users who want "zero setup." Our users are developers orchestrating agent swarms. The simplified UX hides the coordination primitives we need to control.

4. **No git/worktree integration**: No concept of git worktrees, branch management, merge queues, or code review pipelines. Missing the core primitives our multi-agent code production architecture requires.

5. **Cloud platform commercial model**: The managed cloud offering with premium support is irrelevant — we run everything locally on Claude Max.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: None. We are CLI-orchestrated.
- **Phase 2 (Days 4-60)**: Study the CAMEL Workforce coordination patterns (root node, async channels, failure tolerance) as reference for improving our own agent team coordination. The patterns live in `camel-ai/camel`, not in Eigent itself.
- **Phase 3 (Days 60-90)**: If browser automation agents become needed (e.g., for web scraping, UI testing beyond Chrome DevTools MCP), the dual-layer Python+TypeScript pattern is the best reference we've catalogued.
- **Phase 4 (Days 90+)**: The React Flow workflow visualization could inform a monitoring dashboard design. But by Phase 4, Langfuse or similar observability platforms would be the better foundation.

---

## Deep Dive Candidates

- [camel-ai/camel](https://github.com/camel-ai/camel) — The underlying multi-agent framework (16.2K stars). The Workforce coordination system, async task channels, and failure tolerance patterns are the real intellectual property. Already has a catalogue entry potential.
- [camel-ai/owl](https://github.com/camel-ai/owl) — OWL (Optimized Workforce Learning, 19.2K stars). Task automation benchmark and toolkit. More research-oriented but could have actionable patterns.

---

## Key Takeaway

> **The most architecturally serious Cowork alternative — backed by the CAMEL-AI research team with genuine multi-agent coordination (not just a Claude SDK wrapper) — but the real value lives in the underlying CAMEL framework's Workforce patterns, not in the Electron desktop app itself.**
