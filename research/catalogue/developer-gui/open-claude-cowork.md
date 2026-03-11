# Open Claude Cowork

> **Open-source desktop AI assistant that wraps the Claude Agent SDK in an Electron GUI — multi-session tracking, SQLite persistence, and visual tool output inspection without terminal dependency.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [DevAgentForge/Open-Claude-Cowork](https://github.com/DevAgentForge/Claude-Cowork) |
| GitHub Stars | 3,006 (as of 2026-03-08) |
| Publisher | DevAgentForge (org / community — single primary contributor `aiagentbuilder` with 49/57 commits) |
| License | MIT (README claims; no LICENSE file in repo) |
| Tech Stack | TypeScript (94.7%), Electron, Vite, React 19, Zustand, better-sqlite3, Claude Agent SDK (`@anthropic-ai/claude-agent-sdk@0.2.6` — patched), Tailwind CSS 4, Radix UI |
| Maturity | 🟡 Early (v0.1.0, 57 commits, last push 2026-02-13, single active contributor) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | We are CLI-first orchestrators — a desktop GUI is orthogonal to the L-Thread pattern. Our agents run headless in tmux; a visual session manager adds no value to the current architecture. The SDK integration pattern is mildly interesting but we already use the SDK directly. |
| **Novelty** | 3/10 | Electron + Claude Agent SDK + SQLite is a straightforward combination. The permission interception pattern (`canUseTool` with pending promise map) is clean but not novel — the SDK docs demonstrate this. We have already catalogued more architecturally interesting GUI tools (1Code, Conductor Build, Manaflow). |
| **Actionable** | 3/10 | Nothing to adopt directly. The `bypassPermissions` + `allowDangerouslySkipPermissions` approach is what we already do with `--dangerously-skip-permissions`. The SQLite session schema is simpler than what we need for multi-agent orchestration state. |

---

## Overview

Open Claude Cowork (package name: `agent-cowork`) is an Electron desktop application that provides a GUI wrapper around Anthropic's Claude Agent SDK. It positions itself as an open-source alternative to Anthropic's commercial Claude Cowork product. The core value proposition is giving non-terminal users a visual interface for running Claude Code sessions with multi-session management, message history persistence, and tool output visualization.

The architecture is a classic Electron IPC pattern: the main process (`src/electron/`) runs the Claude Agent SDK's `query()` function, persists sessions and messages in a SQLite database via `better-sqlite3`, and broadcasts events to the renderer process (`src/ui/`) through Electron's `webContents.send`. The renderer uses React 19 + Zustand for state management and renders Claude's streaming responses with `react-markdown` + `rehype-highlight`.

The tool auto-approves all tool calls except `AskUserQuestion`, which triggers a permission dialog in the UI. It uses `permissionMode: "bypassPermissions"` and `allowDangerouslySkipPermissions: true`, meaning the agent runs fully autonomously with no human-in-the-loop for file edits, bash commands, etc. The SDK is patched via `patches/@anthropic-ai%2Fclaude-agent-sdk@0.2.6.patch` (contents not public but likely fixes a build/bundling issue for Electron packaging).

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│            Electron Renderer            │
│  React 19 + Zustand + Tailwind CSS 4    │
│                                         │
│  Components:                            │
│  - Sidebar (session list)               │
│  - EventCard (message rendering)        │
│  - DecisionPanel (permission dialogs)   │
│  - PromptInput (user input)             │
│  - SettingsModal (API config)           │
│  - StartSessionModal (new session)      │
│                                         │
│  Store: useAppStore (Zustand)           │
│  - sessions: Record<id, SessionView>    │
│  - activeSessionId                      │
│  - permissionRequests[]                 │
│  - handleServerEvent() dispatcher       │
└──────────────┬──────────────────────────┘
               │ IPC (server-event channel)
┌──────────────┴──────────────────────────┐
│           Electron Main Process         │
│                                         │
│  ipc-handlers.ts                        │
│  - ClientEvent → ServerEvent routing    │
│  - session.start/continue/stop/delete   │
│  - permission.response handling         │
│                                         │
│  runner.ts                              │
│  - query() from Claude Agent SDK        │
│  - canUseTool() permission interceptor  │
│  - AbortController for cancellation     │
│                                         │
│  session-store.ts (SQLite via WAL)      │
│  Tables:                                │
│  - sessions (id, title, status, cwd,    │
│    claude_session_id, allowed_tools,    │
│    last_prompt, created_at, updated_at) │
│  - messages (id, session_id, data,      │
│    created_at)                          │
│                                         │
│  claude-settings.ts                     │
│  - Reads ~/.claude/settings.json        │
│  - Falls back to custom api-config.json │
│  - Env injection: ANTHROPIC_AUTH_TOKEN, │
│    ANTHROPIC_BASE_URL, ANTHROPIC_MODEL  │
└──────────────┬──────────────────────────┘
               │ Claude Agent SDK query()
┌──────────────┴──────────────────────────┐
│         Claude Code CLI Runtime         │
│  (spawned as child process via SDK)     │
└─────────────────────────────────────────┘
```

**Key Data Model:**
- Sessions table: UUID primary key, title, status (`idle`/`running`/`completed`/`error`), working directory, allowed tools (string), last prompt, Claude session ID for resume
- Messages table: UUID primary key, FK to session, JSON blob of SDK message, timestamp
- WAL mode enabled for concurrent read/write

**Event System (typed discriminated unions):**
- Client→Server: `session.start`, `session.continue`, `session.stop`, `session.delete`, `session.list`, `session.history`, `permission.response`
- Server→Client: `stream.message`, `stream.user_prompt`, `session.status`, `session.list`, `session.history`, `session.deleted`, `permission.request`, `runner.error`

---

## Publisher Background

**DevAgentForge** is a GitHub organization (created 2026-01-05) with a single public repository. The org name "Claude Agent Forge" suggests it was created specifically for this project. The primary contributor `aiagentbuilder` authored 49 of 57 commits. Three other contributors made minor contributions (2-3 commits each). No funding, no company website, no other notable projects.

The project has a **MiniMax partnership** (Chinese AI company, M2.5 model) with promotional banners and discount codes in the README — this is unusual for a pure OSS project and suggests commercial motivations or sponsorship.

The repo was created 2026-01-13 and last pushed 2026-02-13 (nearly a month of inactivity as of analysis date). 21 open issues. 404 forks is high relative to the star count, suggesting significant community interest in forking/customizing rather than contributing upstream.

Found via @aratahikaru0's collection post.

---

## What's Valuable for Us

1. **SDK `query()` integration pattern** (`runner.ts`): Clean example of wrapping the Claude Agent SDK's streaming query with abort control, session resume via `claudeSessionId`, and event-driven message dispatch. We already do this more directly, but this is a good reference for anyone building SDK wrappers.

2. **Permission interception via promise map** (`runner.ts:canUseTool`): The pattern of storing a `Map<toolUseId, { resolve }>` to defer permission decisions to a UI and resolve them asynchronously is elegant. Could be adapted if we ever need human-in-the-loop approval for specific agent actions (e.g., production deployments).

3. **SQLite WAL mode for session persistence** (`session-store.ts`): Validates our own SQLite choice. Their schema is simpler than what we need but the WAL + `better-sqlite3` combination works well in Electron/Node.

4. **Event type system** (`types.ts`): The discriminated union pattern for `ServerEvent` and `ClientEvent` is a clean TypeScript reference for typed IPC. Our orchestrator state events could adopt a similar pattern.

---

## What's NOT Relevant

1. **Desktop GUI paradigm**: Our Master Blueprint explicitly separates business context from code context (Elvis Sun Principle). An Electron desktop app is the opposite of our headless, tmux-based, CLI-first approach. We orchestrate agents programmatically, not through a GUI.

2. **Single-agent-per-session model**: Open Claude Cowork runs one Claude agent per session. Our architecture runs 2-20+ parallel agents across worktrees with coordinated state. This tool has no concept of agent teams, task dependencies, or multi-agent coordination.

3. **`bypassPermissions` + `allowDangerouslySkipPermissions`**: While we use `--dangerously-skip-permissions` too, this tool provides zero security boundaries. No DSGVO isolation, no per-agent capability scoping, no audit trail beyond raw message storage.

4. **MiniMax sponsorship/integration**: Irrelevant to our Anthropic-only stack. The promotional content in the README is a credibility flag.

5. **No worktree isolation, no git integration, no merge queue**: Missing all the primitives our architecture requires for multi-agent code production.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: None. We are CLI-orchestrated.
- **Phase 2 (Days 4-60)**: None. If we need a GUI, 1Code (5.1K stars, REST API for tasks, worktree isolation) or Conductor Build are better candidates.
- **Phase 3 (Days 60-90)**: Unlikely. The tool would need to be fundamentally redesigned to support multi-agent orchestration.
- **Phase 4 (Days 90+)**: If client-facing demos need a visual session viewer, the Zustand store pattern and event system could be a lightweight reference for building a custom monitoring dashboard. But by Phase 4, we would likely build on a proper observability platform (Langfuse, BrainTrust).

---

## Key Takeaway

> **A clean but architecturally shallow Electron wrapper around the Claude Agent SDK — useful as a beginner-friendly reference for SDK integration and SQLite session persistence, but irrelevant to our multi-agent, CLI-first orchestration architecture.**
