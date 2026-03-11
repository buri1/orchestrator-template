# Composio Open Claude Cowork

> **Open-source desktop chat application powered by Claude Agent SDK and Composio Tool Router — automate your work end-to-end across desktop and all your work apps in one place.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [ComposioHQ/open-claude-cowork](https://github.com/ComposioHQ/open-claude-cowork) |
| GitHub Stars | 3,121 (as of 2026-03-09) |
| Publisher | Composio HQ (startup, VC-funded — 27K stars on main repo, 68 public repos, 1,218 org followers) |
| License | MIT |
| Tech Stack | JavaScript, Electron.js, Node.js + Express, Claude Agent SDK (`@anthropic-ai/claude-agent-sdk@0.2.7`), Opencode SDK, Composio `@composio/core`, SSE streaming |
| Maturity | 🟡 Early (v1.0.0, 2 contributors, last push 2026-03-05, actively maintained) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Desktop GUI is orthogonal to our CLI-first, tmux-based orchestration. The Composio Tool Router integration pattern is the only interesting angle — we already have a [Composio entry](../orchestration-platforms/composio.md) cataloguing their auth/tool layer separately. No multi-agent, no orchestration. |
| **Novelty** | 4/10 | The dual-provider abstraction (Claude Agent SDK + Opencode SDK behind a unified `BaseProvider` interface) is a slightly more interesting architectural pattern than the DevAgentForge version. Composio MCP integration for 500+ SaaS tool access via a single SSE-backed endpoint is genuinely novel plumbing, but it's just a wrapper around their existing platform. |
| **Actionable** | 3/10 | The `BaseProvider` abstraction pattern and per-request provider/model switching could be referenced if we ever need to swap agent runtimes dynamically. The Composio MCP session initialization pattern (`composio.create(userId) -> mcpUrl + headers`) is a clean reference for integrating Composio's tool layer into any agent. But we don't need a GUI to use this — the SDK works standalone. |

---

## Overview

Composio Open Claude Cowork is an Electron desktop application built by the Composio team (the 27K-star tool integration platform) as an open-source alternative to Anthropic's commercial Claude Cowork product. Unlike the [DevAgentForge "Open Claude Cowork"](./open-claude-cowork.md) (which is a different project despite the identical name), this version is built by a well-funded company with a clear strategic motive: showcase Composio's Tool Router as the integration backbone for agent GUIs.

The architecture is simpler than the DevAgentForge version — no React, no Zustand, no build tooling. It's vanilla JavaScript (Electron renderer + Express backend) with SSE streaming. The key differentiator is **dual-provider support**: the backend abstracts Claude Agent SDK and Opencode SDK behind a shared `BaseProvider` interface, allowing per-request provider and model switching from the UI. The Composio Tool Router is injected as an MCP server into both providers, giving the agent access to 500+ SaaS app integrations (Gmail, Slack, GitHub, Google Drive, etc.) through a single managed endpoint.

The repo also advertises a "Secure Clawdbot" component (AI assistant for WhatsApp/Telegram/Signal/iMessage) but this directory is not present in the repo — it's likely in a separate branch or was removed. The README describes it but the `clawd/` directory returns 404.

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│            Electron Desktop App              │
│    main.js → BrowserWindow (1200x800)        │
│    preload.js → context bridge               │
│    renderer/ → vanilla HTML/CSS/JS           │
│                                              │
│    Features:                                 │
│    - Multi-chat session management           │
│    - Provider selector (Claude / Opencode)   │
│    - Model selector (per provider)           │
│    - Tool call visualization sidebar         │
│    - Thinking mode toggle (normal/extended)  │
│    - SSE streaming display                   │
└──────────────────┬───────────────────────────┘
                   │ HTTP (localhost:3001)
                   │ POST /api/chat (SSE response)
                   │ POST /api/abort
                   │ GET  /api/providers
                   │ GET  /api/health
┌──────────────────┴───────────────────────────┐
│           Express Backend (server.js)         │
│                                              │
│  Composio Session Management:                │
│  - composio.create(userId) → MCP session     │
│  - Sessions cached in Map<userId, session>   │
│  - MCP URL + headers injected into providers │
│                                              │
│  Provider Abstraction:                       │
│  ┌─────────────────────────────────────────┐ │
│  │         BaseProvider (abstract)         │ │
│  │  - sessions: Map<chatId, sessionId>    │ │
│  │  - query(params): AsyncGenerator       │ │
│  │  - abort(chatId): boolean              │ │
│  │  - getSession/setSession               │ │
│  └──────┬──────────────────┬──────────────┘ │
│  ┌──────┴──────┐    ┌──────┴──────────────┐ │
│  │   Claude    │    │    Opencode         │ │
│  │  Provider   │    │    Provider         │ │
│  │             │    │                     │ │
│  │ SDK query() │    │ SDK session.create  │ │
│  │ + resume    │    │ + promptAsync       │ │
│  │ + abort     │    │ + event.subscribe   │ │
│  │ bypassPerms │    │ + SSE streaming     │ │
│  └─────────────┘    └─────────────────────┘ │
│                                              │
│  MCP Server Config (injected per request):   │
│  { composio: { type: 'http',                │
│     url: session.mcp.url,                    │
│     headers: session.mcp.headers }}          │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────┴───────────────────────────┐
│      Composio Tool Router (remote MCP)       │
│  500+ SaaS integrations via managed auth     │
│  Gmail, Slack, GitHub, Drive, Calendar, ...  │
└──────────────────────────────────────────────┘
```

**Key implementation details:**

- **No database**: Unlike DevAgentForge's SQLite-backed version, this stores chat state entirely in the renderer's JavaScript memory. Session persistence is via Claude Agent SDK's built-in `resume` capability (session ID stored in provider's `Map<chatId, sessionId>`). Chats are saved to `localStorage` in the renderer.
- **SSE streaming**: Backend streams tool_use, text, tool_result, session_init, and done/error/aborted events as Server-Sent Events. 15-second heartbeat keeps connections alive.
- **Composio MCP pre-initialization**: On server startup, a default Composio session is created and cached. The MCP URL/headers are also written to `opencode.json` for the Opencode provider.
- **Per-request provider/model switching**: Each `/api/chat` request can specify `provider` (claude/opencode) and `model`, enabling seamless switching between providers within the same UI.
- **Claude provider specifics**: Uses `permissionMode: "bypassPermissions"`, `settingSources: ['user', 'project']` (enables Skills from filesystem), 100 `maxTurns` default, 10 allowed tools (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, TodoWrite, Skill).
- **Opencode provider specifics**: Event-driven streaming via `event.subscribe()`, async prompt submission, model string parsed into `providerID/modelID`, supports models from Opencode (Big Pickle, GPT-5 Nano, Grok Code), Anthropic, and others.

---

## Publisher Background

**Composio HQ** is a VC-funded startup (composio.dev) with significant traction: their main `composio` repo has 27,323 stars, 68 public repositories, and 1,218 org followers. They describe themselves as powering "1000+ toolkits, tool search, context management, authentication, and a sandboxed workbench." They have a freemium SaaS model with enterprise customers.

This specific repo (`open-claude-cowork`) has 3,121 stars and 401 forks but only 2 contributors: `sujayjayjay` (18 commits) and `Prat011` (11 commits) — both appear to be Composio employees. The repo was created 2026-01-13, pushed last 2026-03-05.

**Strategic context**: This is clearly a marketing/developer-relations play. By building an OSS Cowork clone that showcases the Composio Tool Router as its integration backbone, they're demonstrating that any agent GUI can plug into Composio's 500+ SaaS integrations via a simple MCP session. The "open-source Cowork" framing rides the wave of demand surfaced by swyx's viral thread (60K views, 90 bookmarks asking for OSS Cowork alternatives). Composio's name appears prominently in swyx's thread replies.

---

## What's Valuable for Us

| Pattern | Where | How to Apply |
|---------|-------|--------------|
| **BaseProvider abstraction** | `server/providers/base-provider.js` | Clean interface for swapping agent runtimes. If we ever need to run tasks through different LLM providers (e.g., Claude for code, Opencode for low-cost triage), this `query() -> AsyncGenerator` pattern with session management is a solid reference. |
| **Composio MCP session bootstrap** | `server/server.js:initializeComposioSession()` | The `composio.create(userId) -> { mcp: { url, headers } }` pattern is the simplest reference for how to inject Composio's 500+ tool integrations into any Claude Agent SDK or MCP-compatible agent. Two lines of code to get managed OAuth for Gmail/Slack/GitHub/etc. |
| **Per-request provider routing** | `server/server.js:/api/chat` | Each request carries `provider` and `model` fields — the backend routes to the correct provider instance. This is a lightweight version of our "model routing" concept from the Master Blueprint. |
| **Opencode SDK integration** | `server/providers/opencode-provider.js` | First clean example we've seen of the Opencode SDK's event-driven streaming pattern (`session.create -> promptAsync -> event.subscribe`). Useful reference if we evaluate Opencode as a secondary runtime. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Desktop GUI paradigm** | Master Blueprint Principle 3 (context is zero-sum) and the Elvis Sun Principle (business context never enters coding agents) — a desktop chat GUI violates both. Our agents run headless in tmux. |
| **No multi-agent support** | Single agent per chat session. No concept of agent teams, task decomposition, worktree isolation, or coordinated state. Our architecture runs 2-20+ parallel agents. |
| **No persistence** | Chat history lives in `localStorage` in the renderer and in-memory `Map` in the backend. No SQLite, no state files, no recovery. This is a demo, not production infrastructure. |
| **Composio SaaS dependency** | Requires Composio API key and their hosted platform at runtime. For DSGVO-isolated gov work, this is a blocker. And we already have a separate [Composio catalogue entry](../orchestration-platforms/composio.md) evaluating their tool layer independently. |
| **Marketing wrapper** | The "500+ app integrations" headline is Composio's existing platform feature, not something this repo builds. This is an Electron GUI that calls Composio's API. The value is in Composio, not in this GUI. |
| **Missing advertised features** | The README describes "Secure Clawdbot" (WhatsApp/Telegram/Signal/iMessage bot) but the `clawd/` directory doesn't exist in the repo. Marketing ahead of implementation. |
| **`bypassPermissions` with no boundaries** | Zero security model. No per-agent capability scoping, no audit trail, no DSGVO compliance. |

---

## Comparison with DevAgentForge "Open Claude Cowork"

These are two distinct projects with the same name, both catalogued:

| Aspect | Composio Version (this entry) | DevAgentForge Version |
|--------|-------------------------------|----------------------|
| Repo | `ComposioHQ/open-claude-cowork` | `DevAgentForge/Claude-Cowork` |
| Stars | 3,121 | 3,006 |
| Publisher | VC-funded startup (27K main repo) | Solo dev / community org |
| Tech | Vanilla JS, Express, Electron | TypeScript, React 19, Zustand, Vite |
| Persistence | localStorage + in-memory Map | SQLite (WAL mode, better-sqlite3) |
| Key differentiator | Composio Tool Router (500+ SaaS) + dual provider (Claude/Opencode) | SQLite sessions + permission interception UI |
| Architecture quality | Simpler, less polished | More engineered, typed event system |
| Strategic intent | Marketing for Composio platform | Community OSS project |

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: None. CLI-orchestrated.
- **Phase 2 (Days 4-60)**: If we decide to use Composio's Tool Router for Notion/Airtable/Gmail integration (see [Composio entry](../orchestration-platforms/composio.md)), the `initializeComposioSession()` pattern in this repo's `server.js` is the fastest reference for MCP session bootstrap. But use the SDK directly, not this GUI.
- **Phase 3 (Days 60-90)**: None. The dual-provider pattern is interesting but we're Claude-only.
- **Phase 4 (Days 90+)**: If we build a client-facing monitoring dashboard, the SSE streaming pattern and provider abstraction could serve as a lightweight reference. But by then, Langfuse or custom observability is the better path.

---

## Deep Dive Candidates

- **Composio Tool Router docs**: https://docs.composio.dev/tool-router/overview — How the MCP-based tool injection works under the hood
- **Opencode SDK**: https://opencode.dev — The alternative agent runtime supported by this project; evaluate as secondary runtime
- **swyx's OSS Cowork thread**: Already catalogued at `posts/2026-03/swyx-oss-cowork-clones-thread.md`

---

## Key Takeaway

> **A marketing showcase for Composio's Tool Router wrapped in an Electron GUI — the dual-provider abstraction and MCP session bootstrap pattern are the only architecturally interesting contributions, but use the Composio SDK directly rather than adopting this GUI.**
