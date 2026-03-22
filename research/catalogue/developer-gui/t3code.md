# T3 Code

> **A minimal web GUI for coding agents (currently Codex and Claude, more coming soon).**

| Field | Value |
|-------|-------|
| Category | Developer GUI / IDE |
| Repository | [pingdotgg/t3code](https://github.com/pingdotgg/t3code) |
| GitHub Stars | 7,000 (as of 2026-03-22) |
| Publisher | Ping.gg / Theo Browne (YC-backed, creator of T3 Stack, Uploadthing) |
| License | MIT |
| Tech Stack | TypeScript (97%), React 19, Vite 8, Zustand, TanStack Router/Query, Tailwind 4, xterm.js, Lexical editor, WebSocket (ws), node-pty, Effect (functional TS), SQLite (Bun), Turborepo monorepo, Tauri (desktop) |
| Maturity | Early (v0.0.13, "expect bugs", not accepting contributions) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Event-sourced orchestration engine with decider+projector pattern is a production-grade architecture we should study. Multi-provider adapter registry with strategy pattern for swapping Claude/Codex is exactly the abstraction we'd need for multi-model orchestration. |
| **Novelty** | 7/10 | Event sourcing + CQRS in a coding agent GUI is genuinely novel -- no other catalogued tool uses this pattern. The `@anthropic-ai/claude-agent-sdk` integration (not just CLI wrapping) is a first in our catalogue. Provider adapter registry with health monitoring is more sophisticated than any Cowork clone. |
| **Actionable** | 6/10 | Decider/projector pattern is directly portable to our orchestrator state management. Provider adapter abstraction could replace our ad-hoc agent spawning. WebSocket push-bus for domain events is a clean dashboard pattern for Phase 3+. |

---

## Overview

T3 Code is Theo Browne's multi-agent GUI wrapper that sits above coding agent CLIs (Codex, Claude Code) and provides a unified visual interface for managing sessions, reviewing diffs, and orchestrating turns. As of v0.0.13 (2026-03-20), it supports both OpenAI Codex and Claude Code CLI as backends -- if you have Claude Code installed and signed in, T3 Code detects and uses it directly via `@anthropic-ai/claude-agent-sdk`, no API keys needed.

What separates T3 Code from the dozens of Cowork clones in our catalogue is its **event-sourced orchestration engine**. Rather than imperative state management, T3 Code uses a full CQRS/event-sourcing architecture with a decider (command -> events), projector (events -> read model), and domain event streaming via WebSocket push-bus. This is enterprise-grade architecture applied to a coding agent GUI.

The monorepo ships four apps: `web` (React 19 + Vite 8 SPA), `desktop` (Tauri native app), `server` (Node.js + WebSocket + Effect), and `marketing`. The server manages provider subprocesses, brokers JSON-RPC communication over stdio to Codex, and streams domain events to connected clients in real-time. With 7K stars, 960 forks, 1,070 commits, and 25 releases, it's the most actively developed multi-agent GUI after cmux.

---

## Technical Architecture

```
+----------------------------------------------------+
|               T3 Code Web/Desktop Client            |
|  React 19 + TanStack Router + Zustand + xterm.js   |
|  Lexical editor, dnd-kit, react-markdown            |
+-----------------------+----------------------------+
                        | WebSocket (ws)
+-----------------------v----------------------------+
|                    T3 Server                        |
|  Node.js 22+ / Effect (functional TS)              |
|                                                     |
|  +-----------+  +------------+  +--------------+   |
|  | wsServer  |  | Orchestr-  |  | Provider     |   |
|  | (routes,  |  | ation      |  | Manager      |   |
|  |  push-bus)|  | Engine     |  |              |   |
|  +-----------+  +-----+------+  +------+-------+   |
|                       |                |            |
|              +--------v--------+  +----v--------+  |
|              | Decider (CQRS)  |  | Adapter     |  |
|              | Commands->Events|  | Registry    |  |
|              +--------+--------+  +----+--------+  |
|                       |                |            |
|              +--------v--------+  +----v--------+  |
|              | Projector       |  | Claude      |  |
|              | Events->ReadMdl |  | Adapter     |  |
|              +-----------------+  +----+--------+  |
|                                        |            |
|  +-------------+  +-------------+ +----v--------+  |
|  | Checkpoints |  | Persistence | | Codex       |  |
|  | (git-based) |  | (SQLite)    | | Adapter     |  |
|  +-------------+  +-------------+ +------+------+  |
+----------------------------------------------------+
                                           |
                         stdio (JSON-RPC)  |
                    +------v------+  +-----v------+
                    | codex       |  | claude     |
                    | app-server  |  | agent-sdk  |
                    +-------------+  +------------+
```

### Key Components

**Orchestration Engine (event-sourced)**
- **Decider** (`orchestration/decider.ts`): Pure function `(command, readModel) -> event[]`. Handles ~20 command types across projects and threads. Validates invariants before emitting events.
- **Projector** (`orchestration/projector.ts`): Folds events into read model. Domain events streamed to browser via `orchestration.domainEvent` WebSocket channel.
- **Schemas** (`@t3tools/contracts`): Shared contract package defining all event payloads, commands, and aggregate types.

**Provider System (strategy pattern)**
- **ProviderAdapter** interface: `startSession`, `stopSession`, `sendTurn`, `interruptTurn`, `respondToRequest`, `respondToUserInput`, `readThread`, `rollbackThread`, `streamEvents`.
- **ProviderAdapterRegistry**: Dynamic adapter selection by provider kind.
- **ClaudeAdapter**: Uses `@anthropic-ai/claude-agent-sdk` (v0.2.77) -- Anthropic's official SDK, not just CLI wrapping.
- **CodexAdapter**: Wraps `codex app-server` via stdio JSON-RPC subprocess with bidirectional message routing.
- **ProviderHealth**: Health monitoring per adapter.

**Session Management**
- **CodexAppServerManager**: Event-emitting class managing child processes. Per-session Codex subprocess with JSON-RPC over stdio. Timeout-managed pending requests (20s). Process tree killing on cleanup. Thread resume with fallback to fresh start.
- **ProviderSessionDirectory**: Tracks active sessions across providers.

**WebSocket Server** (`wsServer.ts`)
- Request-response with ID correlation + push channels (`domainEvent`, `terminalEvent`, `serverConfigUpdated`, `serverWelcome`).
- Routes: `getSnapshot`, `dispatchCommand`, `getTurnDiff`, `getFullThreadDiff`, `replayEvents`, git operations, terminal operations, file search.
- Push-bus broadcasting to all connected clients via `Set<WebSocket>`.

**Persistence**
- SQLite via `@effect/sql-sqlite-bun` for event store.
- Git-based checkpointing for thread state.
- `node-pty` for terminal emulation.

---

## Publisher Background

Built by Theo Browne ([@t3dotgg](https://twitter.com/t3dotgg)), founder of Ping.gg (YC-backed). Theo created the T3 Stack (`create-t3-app`, 28K+ stars), Uploadthing (file uploads), and runs one of the largest web dev YouTube channels. His audience is primarily TypeScript/Next.js developers. T3 Code launched as a Codex wrapper and added Claude support in v0.0.13 (2026-03-20) -- the announcement got 393K views, 2.4K likes, confirming massive distribution reach. The "hopefully the lawyers won't make us remove this" quip suggests some tension around CLI integration licensing. Despite YC backing and 7K stars, the project explicitly states "not accepting contributions" and "expect bugs" -- it's still a focused side project, not a venture-backed product.

---

## What's Valuable for Us

1. **Event Sourcing / CQRS for Agent Orchestration** -- The decider+projector pattern is the most architecturally sophisticated state management in any catalogued agent GUI. Our `orchestrator-tmux-state.json` is imperative JSON mutation; this pattern would give us event replay, time-travel debugging, and crash recovery for free. Study `apps/server/src/orchestration/decider.ts` and `projector.ts`.

2. **Provider Adapter Registry** -- The `ProviderAdapterShape<TError>` interface (`startSession`, `sendTurn`, `interruptTurn`, `streamEvents`, etc.) is exactly the abstraction layer we'd need to support multiple agent backends. Our current tmux spawning is provider-agnostic by accident (Claude-only); this pattern makes it intentional.

3. **Domain Event Streaming** -- The WebSocket push-bus pattern for broadcasting orchestration domain events to connected dashboards is the cleanest architecture for a Phase 3+ monitoring UI. Events like `thread.turn.start`, `thread.activity.append`, `thread.turn.diff.complete` map directly to our orchestrator loop phases.

4. **Effect (functional TS)** -- T3 Code uses the [Effect](https://effect.website/) library throughout the server for typed errors, dependency injection, and composable async flows. Worth evaluating as an alternative to our ad-hoc error handling.

5. **Claude Agent SDK Integration** -- They use `@anthropic-ai/claude-agent-sdk` (v0.2.77) directly, not CLI wrapping. This is the same SDK Anthropic ships for Cowork. If we ever need programmatic Claude control beyond CLI, this is the reference implementation.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Web/Desktop GUI (React + Tauri)** | We're terminal-first; building a GUI adds overhead without improving autonomous throughput |
| **Codex-first design** | We're Claude-only; Codex integration is Phase 3+ at best |
| **Human-interactive session model** | T3 Code assumes a human operator per session; we need autonomous orchestration |
| **Lexical rich-text editor / xterm.js** | UI components for human interaction, not agent-to-agent communication |
| **Marketing app** | N/A |

---

## Future Use Cases

- **Phase 1-2 (Now):** Study the decider+projector event-sourcing pattern for potential adoption in orchestrator state management. The `orchestrator-tmux-state.json` mutation model doesn't survive compaction or crash recovery well; event sourcing would solve both.
- **Phase 3 (Days 60-90):** If building a monitoring dashboard, the WebSocket push-bus + domain event streaming architecture is the reference implementation. The `ProviderAdapterShape` interface could become our multi-provider abstraction if we add Codex/Gemini agents.
- **Phase 4 (Days 90+):** The `@anthropic-ai/claude-agent-sdk` integration pattern becomes relevant if we move from CLI-based to SDK-based Claude control for tighter lifecycle management.

---

## Key Takeaway

> **T3 Code is far more architecturally interesting than any Cowork clone -- its event-sourced CQRS orchestration engine, provider adapter registry, and Claude Agent SDK integration make it the best reference implementation for multi-agent GUI orchestration in our catalogue, even though its human-interactive design conflicts with our autonomous vision.**
