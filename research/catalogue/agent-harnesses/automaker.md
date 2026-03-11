# AutoMaker

> **Open-source autonomous AI development studio — describe features on a Kanban board, AI agents implement them in isolated git worktrees.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [AutoMaker-Org/automaker](https://github.com/AutoMaker-Org/automaker) |
| GitHub Stars | 3,019 (as of 2026-03-08) |
| Publisher | Cody Seibert (@webdevcody) + community — solo/community |
| License | MIT |
| Tech Stack | TypeScript, React, Vite, Electron, Express.js, Claude Agent SDK, Playwright, Node 22+ |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *From Airtable research list. Cody Seibert (webdevcody) is a well-known YouTube developer educator. 3K stars in ~3 months is solid traction. Core idea — Kanban-driven agent coding with worktree isolation — validates several patterns we already use. The "plan approval gate" pattern is interesting as a human-review chokepoint. Worth watching but not adopting — it's a GUI-first IDE replacement, not a composable harness.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | GUI-first IDE; we need headless orchestration. Opposite end of the control spectrum. |
| **Novelty** | 3/10 | Kanban + worktree + Claude Agent SDK is a known pattern; Overstory and pi-side-agents do it better for our use case. |
| **Actionable** | 3/10 | Desktop Electron app with tight coupling — nothing we can lift directly into our headless pipeline. |

---

## Overview

AutoMaker is an Electron-based desktop application that presents a Kanban board where developers describe features as cards, move them to "In Progress," and let Claude-powered agents autonomously implement them. Each agent operates in an isolated git worktree, streams its reasoning and code changes in real-time, and goes through a plan-approval gate before executing changes. The system supports multiple concurrent agents working on separate tasks.

The architecture is a monorepo split into `apps/ui` (React + Vite + Electron), `apps/server` (Express.js backend), and `libs/` (shared packages for git utilities, model resolution, prompt management, dependency resolution, and type definitions). The server uses an event-driven architecture where all operations emit events streamed to the frontend via WebSocket. The Claude Agent SDK handles the actual AI execution, with model resolution abstracted through `@automaker/model-resolver` supporting aliases (haiku, sonnet, opus variants).

AutoMaker positions itself as a "locally-run IDE" that replaces the manual coding workflow. It supports both manual control and an "Auto Mode" for fully autonomous execution — similar in spirit to our own AUTO_MODE flag, though implemented at the IDE level rather than the orchestration level.

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│          Electron Desktop App               │
│  ┌────────────────────────────────────────┐ │
│  │  React UI (Vite + Primer React)       │ │
│  │  - Kanban board (dnd-kit)             │ │
│  │  - Real-time agent streaming          │ │
│  │  - Plan approval UI                   │ │
│  │  - Agent decoding (reasoning view)    │ │
│  └──────────────┬─────────────────────────┘ │
│                 │ WebSocket events           │
│  ┌──────────────▼─────────────────────────┐ │
│  │  Express.js Server (port 3008)        │ │
│  │  - Task lifecycle management          │ │
│  │  - Agent session control              │ │
│  │  - Git worktree orchestration         │ │
│  │  - Context file loading               │ │
│  └──────────────┬─────────────────────────┘ │
│                 │                            │
│  ┌──────────────▼─────────────────────────┐ │
│  │  Shared Libs (@automaker/*)           │ │
│  │  - git-utils (worktree management)    │ │
│  │  - model-resolver (alias resolution)  │ │
│  │  - prompts (context assembly)         │ │
│  │  - dependency-resolver                │ │
│  │  - spec-parser                        │ │
│  │  - platform (OS detection)            │ │
│  └──────────────┬─────────────────────────┘ │
│                 │                            │
│  ┌──────────────▼─────────────────────────┐ │
│  │  Claude Agent SDK                     │ │
│  │  - Per-task worktree isolation        │ │
│  │  - Autonomous code read/write/exec    │ │
│  │  - Plan generation + approval gate    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Data Model:**
- Per-project data stored in `.automaker/` directory (context files, project-specific rules)
- Global data in configurable `DATA_DIR`
- Tasks are Kanban cards with status lifecycle (Backlog -> In Progress -> Review -> Done)
- Agent sessions tied 1:1 to tasks
- Git worktrees created per-agent for isolation

**Key Libs:**
- `@automaker/git-utils` — worktree creation, branch management, merge operations
- `@automaker/model-resolver` — `resolveModelString()` maps aliases to concrete model IDs
- `@automaker/prompts` — `loadContextFiles()` assembles agent context from `.automaker/context/`
- `@automaker/spec-parser` — parses task specifications
- `@automaker/dependency-resolver` — manages cross-package dependency ordering

---

## Publisher Background

**Cody Seibert (@webdevcody)** is a well-known full-stack developer and YouTube educator with a large following in the developer education space. He has a track record of building open-source projects and teaching web development. The project is community-driven with notable contributors including Shironex (860 commits, top contributor), DhanushSantosh, and gsxdsm.

The team explicitly states they built AutoMaker using agentic coding techniques (Cursor IDE + Claude Code CLI), which is both a demonstration and a validation of the tool's own thesis. With 3K stars and 584 forks in ~3 months since creation (Dec 2025), the project has meaningful traction, though the "no longer actively maintained" note in the LICENSE is a yellow flag for long-term viability.

The associated "Agentic Jumpstart" Discord community and educational course suggest the project serves a dual purpose: open-source tool + educational/community-building vehicle.

---

## What's Valuable for Us

1. **Plan Approval Gate pattern** — The concept of agents generating implementation plans that require human approval before execution is a clean implementation of Master Blueprint Principle #5 (human review as binding constraint). We could adopt a similar gate in our PR pipeline without the GUI.

2. **Model resolver abstraction** — `@automaker/model-resolver` with alias mapping (haiku/sonnet/opus) is a clean pattern for our multi-model routing. Our Blueprint calls for model routing in the deterministic layer; this shows a simple implementation.

3. **Context file convention** — `.automaker/context/` directory for project-specific agent rules is essentially a per-project AGENTS.md variant. Validates the AGENTS.md protocol entry in our catalogue.

4. **WebSocket event streaming** — The event-driven architecture where all server operations emit events could inform how we build observability into our Langfuse integration.

5. **CLAUDE.md as architecture rulebook** — Their CLAUDE.md enforces import paths, dependency chains, and architectural constraints. A good reference for how we structure our own CLAUDE.md for coding agents.

---

## What's NOT Relevant

1. **Electron desktop app** — We run headless orchestration via tmux + CLI. A GUI-first IDE directly contradicts our architecture (Master Blueprint Principle #2: deterministic orchestration, not interactive GUIs for agent control).

2. **Kanban board as orchestration interface** — Our orchestration is state-file driven (JSON), not UI-driven. The Kanban metaphor is useful for human developers but adds unnecessary complexity for agent-to-agent coordination.

3. **Single-repo, single-project scope** — AutoMaker is designed for one developer working on one project. Our Blueprint requires federated multi-business-line orchestration (Principle #6). Fundamentally different scale model.

4. **Claude Agent SDK as sole harness** — We need harness flexibility (Claude Code CLI today, potential Pi Agent at Day 60+). AutoMaker is tightly coupled to the Claude Agent SDK.

5. **Docker deployment model** — Their Docker setup exposes UI + API as a web service. Our infrastructure runs local-first on macOS with tmux sessions, not containerized services.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** The plan-approval-gate pattern could be adapted as a lightweight pre-PR review step in our quality gates pipeline. Worth extracting the concept without the UI.
- **Phase 3 (Days 60-90):** If we build a lightweight dashboard for portfolio oversight, AutoMaker's WebSocket event streaming pattern could inform real-time agent status display.
- **Phase 4 (Days 90+):** If we ever offer a client-facing "watch your project being built" view, the agent-decoding/reasoning transparency UI is a strong reference implementation.

---

## Key Takeaway

> **AutoMaker validates Kanban + worktree + plan-approval patterns for solo-developer agentic coding, but its GUI-first, single-project architecture is the opposite of what we need for headless multi-business orchestration — watch for pattern inspiration, don't adopt the tool.**
