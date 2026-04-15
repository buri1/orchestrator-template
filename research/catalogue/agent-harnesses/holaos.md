# holaOS

> **The agent environment for long-horizon work, continuity, and self-evolution.**

| Field | Value |
|-------|-------|
| Category | Agent Harnesses |
| Repository | [github.com/holaboss-ai/holaOS](https://github.com/holaboss-ai/holaOS) |
| GitHub Stars | 2,040 (as of 2026-04-04) |
| Publisher | holaboss-ai (organization) -- commercial product with OSS core |
| License | MIT |
| Tech Stack | TypeScript, Electron (desktop), Node.js 22+, MCP |
| Maturity | 🟢 Growing (2k stars, 260 forks, active development, comprehensive docs) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | The "environment engineering" thesis -- that the environment (memory, continuity, durable state) defines agent capability more than the model -- directly validates our orchestrator approach. The workspace model, memory continuity, and long-horizon resume behavior are patterns we're building toward. |
| **Novelty** | 6/10 | The concept of an "agent OS" with structured workspaces, durable memory, and continuity artifacts is architecturally interesting but not unique. The Electron desktop wrapper adds visual inspection but isn't relevant to our headless approach. The "environment engineering" framing as a thesis is the novel contribution. |
| **Actionable** | 5/10 | TypeScript-based, which aligns with our stack. However, holaOS is a full desktop application (Electron) designed for interactive use -- fundamentally different from our headless tmux orchestrator. The concepts (workspace model, memory continuity, agent harness boundary) are adoptable as patterns, but the code itself isn't directly reusable. |

---

## Overview

holaOS is a desktop-first agent environment that provides agents with a structured operating system: runtime, memory, tools, apps, and durable state. Its core thesis is "environment engineering" -- the idea that the environment surrounding an agent defines the system more than the model itself. Instead of agents resetting to zero on each run, holaOS gives them persistent workspaces where they can work continuously, evolve over time, and stay inspectable across runs.

The system is built around several key concepts:

- **Workspaces**: Structured containers with authored surfaces (user-defined) and runtime-owned state. Each workspace has a contract defining what the agent can access and modify.
- **Memory and Continuity**: Durable memory and "continuity artifacts" that let agents resume long-horizon work after interruptions. The agent doesn't lose context between sessions.
- **Agent Harness**: A stable boundary inside the runtime that defines how executors (the actual LLM calls) fit into the system. This separation means you can swap executors without changing the environment.
- **Desktop Workspace**: An Electron-based GUI for inspecting agent state, memory, outputs, and workspace configuration.

The project positions itself explicitly as an alternative to "one-off task execution" -- agents that spin up, do one thing, and die. holaOS wants agents that persist, learn, and evolve.

---

## Technical Architecture

```
┌──────────────────────────────────────┐
│       Electron Desktop App           │
│  (Workspace Experience / GUI)        │
│  - Workspace inspection              │
│  - Memory browser                    │
│  - Run history / outputs             │
│  - Model configuration               │
├──────────────────────────────────────┤
│       holaOS Runtime                 │
│  ┌────────────────────────────────┐  │
│  │ Workspace Model               │  │
│  │ - Authored surfaces (user)    │  │
│  │ - Runtime-owned state         │  │
│  │ - Workspace contract          │  │
│  ├────────────────────────────────┤  │
│  │ Memory & Continuity           │  │
│  │ - Durable memory              │  │
│  │ - Continuity artifacts        │  │
│  │ - Long-horizon resume         │  │
│  ├────────────────────────────────┤  │
│  │ Agent Harness                 │  │
│  │ - Executor boundary           │  │
│  │ - Tool registration           │  │
│  │ - App lifecycle               │  │
│  ├────────────────────────────────┤  │
│  │ Runtime APIs                  │  │
│  │ - Workspace CRUD              │  │
│  │ - Run management              │  │
│  │ - App lifecycle               │  │
│  │ - MCP integration             │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│       Independent Deploy             │
│  (Portable runtime without desktop)  │
│  - Headless mode available           │
│  - CI/server deployment              │
└──────────────────────────────────────┘
```

**Key design decisions:**
- **Environment over model**: The thesis is that the environment (workspace + memory + tools) matters more than which LLM you use. holaOS invests in the environment layer.
- **Workspace contract**: Each workspace defines a contract specifying what the agent can access. This creates a security and permission boundary.
- **Continuity artifacts**: Structured outputs from previous runs that let agents resume without re-discovering context. Not just chat history -- structured state.
- **Executor abstraction**: The agent harness separates the "how to call the LLM" from "what environment the LLM operates in". Swap models without changing workspace structure.
- **Independent deploy**: The runtime can run without the Electron desktop -- headless mode for CI or server deployment.
- **MCP integration**: Native Model Context Protocol support for tool registration and discovery.

---

## Publisher Background

holaboss-ai is a GitHub organization with a commercial product (holaboss.ai website with sign-in, docs, and hosted offering). The OSS release (MIT license) of the core runtime suggests a commercial-open-core model. The project has reached 2,040 stars and 260 forks in under a month since its March 2026 creation, indicating strong community interest. The comprehensive documentation (12+ doc pages covering concepts, APIs, contributing guidelines, and troubleshooting) suggests a well-resourced team. GitHub Discussions are enabled, and the project has 55 subscribers and 6 open issues, indicating early but active community engagement.

---

## What's Valuable for Us

1. **"Environment engineering" thesis**: The framing that the environment defines agent capability more than the model is a powerful mental model. Our orchestrator's value isn't that it uses Claude -- it's that it provides tmux isolation, git worktrees, state management, and autonomous loop structure. holaOS validates this thesis with a full product.

2. **Continuity artifacts pattern**: The idea of structured outputs from previous runs that let agents resume is directly applicable. Our orchestrator currently uses `devlog.md` and `orchestrator-tmux-state.json` for continuity, but these are ad-hoc. A formalized "continuity artifact" abstraction could make our compaction/recovery more robust.

3. **Workspace contract model**: The idea that each workspace defines what an agent can access creates a permission boundary. We could define workspace contracts for our orchestrator workers -- what files, tools, and APIs each worker type can touch.

4. **Independent deploy / headless mode**: holaOS supports running the runtime without the Electron desktop. This validates that the "agent OS" concept works in headless environments like our tmux orchestrator.

5. **Agent harness boundary**: The clean separation between executor (LLM calls) and environment (workspace + memory + tools) is a pattern we could formalize. Our orchestrator currently mixes these concerns.

---

## What's NOT Relevant

- **Electron desktop app**: We're headless by design. A desktop GUI for agent inspection doesn't fit our tmux-based orchestration model.
- **Commercial hosted offering**: The holaboss.ai SaaS product isn't relevant to our self-hosted approach.
- **MCP as primary tool interface**: We use direct CLI tools, not MCP servers, for our orchestrator workers.
- **Single-agent focus**: holaOS appears designed for single-agent workspaces with continuity. Our orchestrator manages multiple parallel agents with coordination.
- **macOS-only (currently)**: Windows and Linux support is "in progress". Not a blocker for us (we're macOS) but limits portability.

---

## Future Use Cases

- **Phase 1 (Immediate)**: Adopt the "continuity artifact" pattern for our orchestrator. Define a structured format for compaction handoff files that goes beyond raw state dumps.
- **Phase 2 (Days 14-30)**: Evaluate the workspace contract model for worker isolation. Define per-worker contracts specifying allowed files, tools, and API access.
- **Phase 3 (Days 30-60)**: Study holaOS's memory and continuity implementation for ideas on long-horizon agent memory in our orchestrator. Our agents currently lose all context on compaction.
- **Phase 4 (Days 60+)**: If holaOS matures its headless/independent deploy mode, evaluate it as an alternative runtime for individual orchestrator workers (replacing raw Claude Code CLI).

---

## Key Takeaway

> **holaOS's "environment engineering" thesis validates our orchestrator approach -- the environment (isolation, state, memory, continuity) matters more than the model. The continuity artifact pattern and workspace contract model are the two concepts worth formalizing in our system. The tool itself is desktop-focused and not directly usable, but the architectural ideas are highly relevant.**
