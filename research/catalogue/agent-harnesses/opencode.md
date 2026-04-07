# OpenCode

> **The open source coding agent. Built by the SST/Anomaly team — hybrid Go+TypeScript runtime, native multi-agent TaskTool, HTTP+SSE server mode, TypeScript SDK, 75+ LLM providers, and a thriving plugin ecosystem.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [anomalyco/opencode](https://github.com/anomalyco/opencode) |
| GitHub Stars | 117,000+ (as of 2026-03-08) |
| Publisher | Anomaly (startup — Jay V, Frank Wang, Dax Raad, Adam Elmore; YC-backed SST founders) |
| License | MIT |
| Tech Stack | TypeScript (Bun) + Zig (OpenTUI), Hono HTTP server, Vercel AI SDK, SQLite, Tauri (desktop) |
| Maturity | 🟢 Production (v1.2.17, 650K MAU, 700+ contributors) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | HTTP+SSE+SDK architecture is the direction agent orchestration is heading. Native TaskTool and Teams provide built-in multi-agent, but permission propagation issues and heavier footprint reduce fit vs. Pi for our worker-agent use case. |
| **Novelty** | 5/10 | Well-documented in Phase 1-2 research. The SDK-as-orchestration-surface pattern and event bus design are valuable new insights vs. our tmux approach. |
| **Actionable** | 4/10 | Phase 3+ consideration. Could replace tmux layer with `opencode serve` + SDK, but tight coupling to OpenCode's release cycle is a risk. Pi's embeddability is cleaner for our pattern. |

---

## Overview

OpenCode is the most-starred open-source coding agent on GitHub (117K+ stars), built by the SST/Anomaly team (Jay V, Frank Wang, Dax Raad, Adam Elmore). It launched in June 2025 and outpaced Claude Code's star velocity by 4.5x during January 2026, reaching 650K monthly active users by March 2026. The project emerged from a strategic bet that developers would demand provider-agnostic, open-source alternatives to locked-in proprietary agents.

The architecture is a hybrid runtime: core business logic (agent orchestration, tool execution, session management, LLM interaction) runs in TypeScript on Bun with a Hono HTTP server, while the TUI has migrated from Go/Bubble Tea to OpenTUI (Zig with TypeScript bindings). Communication is HTTP+SSE, meaning any HTTP client can drive OpenCode — the TUI, desktop app (Tauri), VS Code extension, web UI, and SDK all connect to the same server. This design makes it a self-contained orchestration platform, not just a coding agent.

OpenCode supports 75+ LLM providers through the Vercel AI SDK, has native multi-agent capabilities via TaskTool and Teams, a plugin/extension ecosystem (JavaScript/TypeScript), first-class MCP support, ACP integration (JetBrains, Zed), and a GitHub App for issue/PR automation. The community has built significant orchestration layers on top: oh-my-opencode (46 hooks, 26 tools), swarm-tools (40+ tools), opencode-workspace (16-component harness), and opencode-swarm (hub-and-spoke with 9 specialized agents).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  OpenTUI (Zig)  │  Tauri Desktop  │  VS Code  │  SDK    │
└────────┬────────┴────────┬────────┴─────┬─────┴────┬────┘
         │        HTTP + SSE              │          │
┌────────▼────────────────────────────────▼──────────▼────┐
│              Hono HTTP Server (port 4096)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Vercel AI SDK (75+ providers)          │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Agent System: Build / Plan / Custom / Subagents  │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Event Bus (strongly-typed, SSE broadcast)        │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Tools: read, write, edit, bash, glob, grep,      │   │
│  │         LSP, task, + MCP tools                    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  SQLite (sessions, messages, file changes)        │   │
│  └──────────────────────────────────────────────────┘   │
│                TypeScript / Bun Runtime                   │
└──────────────────────────────────────────────────────────┘
```

**Key Components:**

- **Agent Types:** Primary agents (Build, Plan, custom via `.opencode/agents/`) and Subagents (spawned via TaskTool with isolated sessions)
- **TaskTool:** Core delegation mechanism — primary agent spawns subagent with fresh context window, own tools, system prompt, and potentially different LLM
- **Teams:** Event-driven multi-agent coordination via strongly-typed event bus (vs. Claude Code's file-based polling), peer-to-peer communication, append-only JSONL audit trail
- **HTTP+SSE:** Two SSE endpoints for real-time event streams; any HTTP client can drive OpenCode
- **Plugin System:** Before/after hooks on tool calls, messages, sessions; loaded from `.opencode/plugins/`, `~/.config/opencode/plugins/`, or npm
- **MCP Integration:** First-class support for local (stdio) and remote (HTTP) MCP servers
- **ACP Integration:** `opencode acp` for JetBrains and Zed IDE integration via JSON-RPC over stdio

**Operational Modes:**

| Mode | Interface | Best For |
|------|-----------|----------|
| Interactive TUI | Terminal (OpenTUI/Zig) | Developer use |
| Server | `opencode serve` — REST API with OpenAPI spec | Automation, CI/CD, programmatic control |
| ACP | `opencode acp` — JSON-RPC over stdio | IDE integration |
| Desktop | Tauri app | GUI users |
| GitHub App | `github.com/apps/opencode-agent` | Issue/PR automation |

---

## Publisher Background

Built by Anomaly, the team behind SST (Serverless Stack, 25K GitHub stars, YC 2021). Jay V and Frank Wang co-founded Anomaly at University of Waterloo. Backers include founders of PayPal, LinkedIn, Yelp, and YouTube. SST turned profitable in 2025. Key team members include Dax Raad (co-founder, early SST user), David Hill (founding designer, formerly Head of Design at Laravel), and Rhys Sullivan (Vercel engineer, active contributor). 700+ total contributors.

**Risk profile:** Strong — profitable parent company (SST), YC-backed, large contributor base, MIT license. Revenue model via OpenCode Zen (curated model configs). No bus-factor concern given team size and community depth.

---

## What's Valuable for Us

1. **HTTP+SSE as Orchestration Transport:** OpenCode proves that HTTP+SSE is superior to file-based polling (Claude Code Teams) and terminal emulation (our tmux approach). SSE delivers real-time event streams with proper structure. Key insight: **agents should be driven by APIs, not by terminal emulation.**

2. **TypeScript SDK (`@opencode-ai/sdk`):** Type-safe session management, prompt injection, and SSE event subscription. Could replace `tmux send-keys` with proper API calls. Auto-generated from OpenAPI spec, so always versioned and typed.

3. **Event Bus Design Pattern:** Strongly-typed internal bus where every action (file changes, permissions, agent messages) flows through a single reactive system. This pattern is worth studying for our orchestrator state management.

4. **Multi-Model Teams:** Ability to assign different LLMs to different agents in the same session — cheap models for routine tasks, expensive for reasoning. Aligns with our 70/30 deterministic/LLM split principle.

5. **Community Orchestration Layers:** oh-my-opencode, swarm-tools, opencode-workspace, and opencode-swarm provide battle-tested orchestration patterns to study. The extensibility primitives (event bus, lifecycle events, tool interception) that enabled these are more important than the features themselves.

6. **Permission Model Lessons:** OpenCode's ongoing struggles with permission propagation in nested agents (issues #4267, #8114, #12566) are cautionary tales. Our L-Thread Orchestrator should design its permission model upfront.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Heavier footprint** | Full HTTP server + 15+ built-in tools + large system prompt consumes meaningful context vs. Pi's 200-token minimalism. For worker agents, Pi's 4-tool constraint is more predictable. |
| **Permission propagation issues** | Custom agent permissions don't propagate to subagents. Nested delegation has been problematic for months. We'd fight the framework for custom orchestration policies. |
| **Tight coupling risk** | Adopting OpenCode SDK as transport ties us to their release cycle. Our tmux approach, while brittle, is agent-runtime-agnostic. |
| **Plugin hooks are shallow** | Before/after tool calls only. Pi's `context` event (message rewriting before LLM) is deeper and more powerful for orchestration use cases. |
| **Not embeddable as subprocess** | OpenCode's server mode is a full HTTP server, not a lightweight subprocess like Pi's RPC mode. For spawning many worker agents, the overhead is higher. |

---

## Full Research Index

| Document | Focus |
|----------|-------|
| [opencode-deep-architecture.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_opencode-deep-architecture.md) | Complete architecture analysis: hybrid runtime, TaskTool mechanics, Teams, SDK, plugins, MCP, ACP, comparison with Pi, implications for L-Thread Orchestrator |

---

## Future Use Cases

- **Phase 1–2 (Days 1–60):** Stay with Claude Code + tmux. Study OpenCode's event bus design and HTTP+SSE transport pattern as the target architecture for our communication layer.
- **Phase 3 (Days 60–90):** Evaluate whether `opencode serve` + SDK could replace tmux as the orchestration transport. Test with a single non-critical agent. Compare developer experience vs. Pi's RPC mode.
- **Phase 4 (Days 90+):** If HTTP+SSE transport proves superior, consider OpenCode SDK as the communication backbone — but only if permission propagation issues are resolved upstream. Alternative: build our own thin HTTP+SSE layer inspired by OpenCode's design.

---

## Key Takeaway

> **OpenCode's HTTP+SSE+SDK architecture represents the future of agent orchestration transport — worth studying deeply for our communication layer redesign — but Pi remains the better fit as a lightweight worker agent due to lower overhead, deeper extension hooks, and embeddability.**
