# Multica

> **A native desktop client that brings coding agent capabilities to everyone through a visual interface.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [multica-ai/multica](https://github.com/multica-ai/multica) |
| GitHub Stars | 300 (as of 2026-03-08) |
| Publisher | Jiayuan Zhang (@forrestchang) / index-labs — startup (also building devv-ai) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (98.8%), Electron, React 19, Vite, sql.js (SQLite), Zustand, Tailwind CSS 4, Radix UI |
| Maturity | 🟡 Early (v0.1.7, 8 releases since Jan 2026) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> OSS Claude Cowork clone from @aratahikaru0's collection post. The ACP protocol integration is the interesting angle — it's the only GUI in our catalogue that standardizes agent communication via a protocol layer rather than hardcoding subprocess management. The Conductor pattern is clean but the tool is fundamentally a GUI wrapper, not an orchestration layer. Watch for ACP adoption signals.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | GUI-first desktop app; we're CLI-first orchestrators — different problem domain |
| **Novelty** | 5/10 | ACP protocol integration is notable; Conductor facade pattern is clean but standard; sql.js for session persistence is pragmatic |
| **Actionable** | 3/10 | Nothing directly adoptable — our architecture is headless; ACP protocol itself is dead (merged into A2A) |

---

## Overview

Multica (Multiplexed Information and Computing Agent) is an Electron-based desktop application that provides a visual interface for interacting with multiple coding agents. Named after Multics (the 1964 OS that influenced Unix), it targets the 95% of knowledge workers who find CLI-based agent tools inaccessible due to interaction mismatch, local environment setup barriers, and privacy concerns.

The core differentiator is its use of the **Agent Client Protocol (ACP)** as a standardized communication layer. Rather than hardcoding support for specific agents, Multica speaks ACP to any compliant agent subprocess — currently Claude Code (`claude-code-acp`), OpenCode (`opencode acp`), and Codex CLI (`codex-acp`). Each agent runs as a local subprocess with stdin/stdout piped through ACP's newline-delimited JSON stream protocol.

The architecture follows a **Conductor facade pattern** where a central `Conductor` class delegates to four specialized modules: `SessionLifecycle` (CRUD), `AgentProcessManager` (subprocess pool), `PromptHandler` (message routing with history replay), and `G3Workaround` (answer injection for ACP's AskUserQuestion limitation). Sessions are persisted via sql.js (pure-JS SQLite) to `~/Library/Application Support/Multica/multica.db`.

---

## Technical Architecture

```
Multica (Electron)
├── Renderer Process (React 19 + Zustand + Radix UI)
│   └── UI Components (Chat, Settings, Session list, Project browser)
├── Main Process
│   ├── Conductor (facade — orchestrates 4 modules)
│   │   ├── SessionLifecycle — create/resume/delete/switchAgent
│   │   ├── AgentProcessManager — subprocess pool (Map<sessionId, SessionAgent>)
│   │   ├── PromptHandler — message routing + history replay for resumed sessions
│   │   ├── G3Workaround — AskUserQuestion answer injection (ACP protocol gap)
│   │   └── AcpClientFactory — creates ClientSideConnection via @agentclientprotocol/sdk
│   ├── SessionStore / DatabaseStore — sql.js (pure-JS SQLite) persistence
│   ├── IPC Handlers — Electron main↔renderer bridge
│   ├── CLI (cli.ts) — alternative text-mode interface via tsx
│   └── Config / Logger / Watcher / Permission / Updater
├── Preload (contextBridge → electronAPI)
└── Shared (types, IPC channels, tool names)
```

**Key data model types:**

- `SessionAgent` — per-session state: `AgentProcess` handle, `ClientSideConnection`, `agentSessionId`, mode/model state, `availableCommands`, `pendingUpdates` promises
- `MulticaSession` — metadata: ID, title, agent config, working directory, project association
- `SessionData` — full session including stored `SessionNotification` updates
- `MulticaProject` — project grouping with sort ordering and expand/collapse state
- `AgentConfig` — `{command, args, env}` for subprocess spawning

**Agent subprocess lifecycle:**
1. `AgentProcess.start()` calls `spawn(command, args, {stdio: ['pipe', 'pipe', 'inherit']})` with enhanced PATH
2. `ndJsonStream()` wraps stdin/stdout into ACP stream
3. `ClientSideConnection` from `@agentclientprotocol/sdk` manages ACP protocol handshake
4. Session updates arrive as `SessionNotification` events, stored in SQLite via `appendUpdate()`
5. Resume creates new ACP session but replays stored history for UI continuity

**Storage:** `~/Library/Application Support/Multica/multica.db` (Electron) or `~/.multica/multica.db` (CLI/test fallback)

---

## Publisher Background

**Jiayuan Zhang** (@forrestchang, @jiayuan_jy on Twitter) is the lead contributor with 137 of 320 commits. He's the founder of **index-labs** and is also building **devv-ai** (an AI-powered developer search engine). Based on his GitHub profile, he has 930 followers and 103 public repos — an established open-source developer.

The **multica-ai** GitHub organization is a single-repo org with no description, blog, or social links — indicating this is a focused side project rather than a venture-backed company. The contributor team is small (4 active contributors: forrestchang 137, ldnvnbl 85, NevilleQingNY 66, Bohan-J 29), suggesting a small startup or side-project team, likely based in China given the README translations (Chinese Simplified/Traditional, Japanese, Korean).

24 forks and 300 stars in ~2 months is reasonable early traction but not breakout growth.

---

## What's Valuable for Us

1. **ACP protocol integration pattern** — The `AcpClientFactory` + `ClientSideConnection` + `ndJsonStream` combination shows how to speak a standardized protocol to multiple agent types. While ACP itself is dead (merged into A2A per our catalogue at `agent-protocols/acp.md`), the abstraction pattern — where the orchestrator doesn't care which agent it's talking to — validates our harness-agnostic design principle from the Master Blueprint.

2. **Conductor facade decomposition** — Clean separation into `SessionLifecycle`, `AgentProcessManager`, `PromptHandler`, and `G3Workaround` modules with dependency injection via interfaces (`ISessionStore`, `IAgentProcessManager`, `IPromptHandler`, `IG3Workaround`). This is a well-factored version of what our `orchestrator-state.json` manages less formally.

3. **sql.js for in-process SQLite** — Using `sql.js` (pure JavaScript SQLite compiled from C via Emscripten) avoids native module compilation issues across Electron versions. Pragmatic choice if we ever need browser-compatible SQLite. Overstory uses native `better-sqlite3` instead — both are valid; sql.js trades performance for portability.

4. **History replay on resume** — The `needsHistoryReplay` flag and `historyReplay.ts` module handle the problem of resuming agent sessions by prepending stored history to the first prompt of a new ACP session. This is a clean solution to a real problem we'll face with long-running orchestrator sessions.

5. **G3Workaround pattern** — Documents a real ACP protocol gap: `AskUserQuestion` returns "User has answered" without the actual answer. The workaround stores pending answers and injects them into the next prompt. Useful signal about protocol maturity gaps.

---

## What's NOT Relevant

1. **GUI-first architecture** — We're headless CLI orchestrators. The entire Electron/React/Zustand/Radix UI layer is irrelevant. Per Master Blueprint: "Context Separation — business context NEVER enters coding agents, code context NEVER enters orchestrator." A desktop GUI violates this by coupling human interaction with agent execution.

2. **Single-user desktop model** — Multica is a personal coding assistant GUI. Our architecture is multi-business-line federated orchestration. No multi-tenancy, no team coordination, no business line isolation.

3. **ACP protocol dependency** — ACP was archived in August 2025 and merged into A2A (per our `agent-protocols/acp.md` entry). Building on a dead protocol is a strategic risk. The `@agentclientprotocol/sdk ^0.13.0` dependency may become unmaintained.

4. **No orchestration intelligence** — Multica routes user messages to agents 1:1. There's no task decomposition, no multi-agent coordination, no deterministic routing, no governance layer. It's a thin relay, not an orchestrator.

5. **Project/session model is too simple** — Projects are just working-directory groupings with sort order. Sessions are linear chat histories. No DAG dependencies, no quality gates, no merge queues — none of the orchestration primitives our architecture requires.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No use case. We don't need a GUI.
- **Phase 2 (Days 4-60):** No use case. Our tmux+worktree architecture is headless.
- **Phase 3 (Days 60-90):** If we build a monitoring dashboard, the Conductor facade decomposition pattern is a clean reference for structuring session state management. The `ISessionStore` interface with project grouping could inform our dashboard's data model.
- **Phase 4 (Days 90+):** If A2A protocol adoption grows and Multica migrates to A2A, it could serve as a reference GUI client for testing our A2A-compatible agent endpoints. Low probability — we'd more likely build our own dashboard.

---

## Key Takeaway

> **Multica is a well-engineered but strategically irrelevant GUI wrapper; the only transferable pattern is its Conductor facade decomposition with dependency-injected modules, and the ACP integration serves as a cautionary example of building on a dead protocol.**
