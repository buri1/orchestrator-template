# DeepSeek Cowork

> **Open-source alternative to Claude Cowork - Browser automation & AI assistant powered by DeepSeek**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [github.com/imjszhang/Deepseek-Cowork](https://github.com/imjszhang/Deepseek-Cowork) |
| GitHub Stars | 422 (as of 2026-03-09) |
| Publisher | imjszhang / "JS" (solo dev) |
| License | MIT |
| Tech Stack | JavaScript, Electron 40, Node.js 18+, React, Express, Socket.io, WebSocket, sql.js (SQLite), libsodium (encryption) |
| Maturity | 🟡 Early (v0.1.35) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *OSS Cowork clone from swyx's thread on open-source Cowork alternatives. Chinese solo dev with 422 stars and 111 forks. The interesting angle is the hybrid architecture: it wraps Claude Code as the "agent kernel" but brands itself as DeepSeek-powered and markets on cost savings. The browser automation approach (custom "JS Eyes" Chrome extension communicating via WebSocket to a local Express server) is more like a mini-RPA system than an agent framework. The "Happy" integration for mobile monitoring with E2E encryption is a nice UX touch but irrelevant to us. Compared to the other Cowork clones in our catalogue (OpenWork at 11K stars, AionUi at 18K stars, Open Claude Cowork at 3K), this is a tier below in traction and less architecturally interesting. The modular server design (browser/explorer/memory/scheduler as pluggable modules with a central modulesManager) is the one clean pattern worth noting. Not actionable for us.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Desktop GUI wrapper for AI chat + browser automation. Our system is headless multi-business orchestration via tmux+worktree. Different problem domain. |
| **Novelty** | 3/10 | Ground we have thoroughly covered. We already have 7+ Cowork clones catalogued (OpenWork, AionUi, Hello Halo, Goodable, Multica, Open Claude Cowork). This adds minimal new patterns. |
| **Actionable** | 2/10 | Nothing we can directly adopt. The modular server architecture is clean but we don't need a local Express server. Our orchestration is prompt-engineering-based, not GUI-based. |

---

## Overview

DeepSeek Cowork is an Electron desktop application that wraps Claude Code as its "agent kernel" while marketing itself as a cost-effective alternative to Claude Cowork, powered by DeepSeek's API. The positioning is somewhat misleading: the core agent execution still relies on Claude Code's capabilities, with DeepSeek providing the LLM backbone for chat and reasoning tasks. The value proposition is centered on cost (DeepSeek API is cheaper than Claude API direct), open-source availability, and self-hosting capability.

The system provides four core capabilities: (1) browser automation via a custom Chrome extension called "JS Eyes" that communicates with the desktop app over WebSocket, (2) file management and workspace organization, (3) persistent conversation memory with active/archive lifecycle management, and (4) scheduled task execution via a cron-based scheduler. Everything runs locally on the user's machine; the only cloud dependency is the LLM API calls and the optional "Happy" session sync service.

The architecture follows a "Hybrid SaaS" model: a local Express server (port 3333) handles all logic, data stays on-device, and the frontend can run as an Electron window, a browser tab pointed at localhost, or a CLI. The "Happy" integration (an embedded companion app) adds mobile monitoring via iOS/Android apps with E2E encryption using libsodium, allowing users to monitor agent tasks and approve permission requests from their phone.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────┐
│                Electron 40 Shell                      │
│  ┌─────────────────────────────────────────────┐     │
│  │            React Frontend                    │     │
│  │  (renderer/: HTML + JS, static)             │     │
│  └──────────────────┬──────────────────────────┘     │
│                     │ IPC / HTTP / WebSocket          │
│  ┌──────────────────▼──────────────────────────┐     │
│  │         Express Server (port 3333)           │     │
│  │                                              │     │
│  │  modulesManager.js ─── modulesConfig.js      │     │
│  │       │                                      │     │
│  │  ┌────▼────────────────────────────────┐     │     │
│  │  │  Pluggable Modules:                 │     │     │
│  │  │                                     │     │     │
│  │  │  browser/                           │     │     │
│  │  │    ExtensionWebSocketServer (ws:8080)│    │     │
│  │  │    TabsManager, CallbackManager     │     │     │
│  │  │    AuthManager, RateLimiter         │     │     │
│  │  │    AuditLogger, ResourceMonitor     │     │     │
│  │  │    Database (sql.js)                │     │     │
│  │  │                                     │     │     │
│  │  │  memory/                            │     │     │
│  │  │    MemoryManager (active/archive)   │     │     │
│  │  │    MessageStore, index.md cache     │     │     │
│  │  │                                     │     │     │
│  │  │  explorer/                          │     │     │
│  │  │    File browsing, workspace mgmt    │     │     │
│  │  │                                     │     │     │
│  │  │  scheduler/                         │     │     │
│  │  │    node-cron based task scheduling  │     │     │
│  │  │                                     │     │     │
│  │  │  process/                           │     │     │
│  │  │    Process management               │     │     │
│  │  └─────────────────────────────────────┘     │     │
│  └──────────────────────────────────────────────┘     │
│                                                       │
│  ┌──────────────────────────────────────────────┐     │
│  │  lib/                                        │     │
│  │    happy-cli/    (session mgmt, E2E crypto)  │     │
│  │    happy-service/ (DaemonManager, Sessions)  │     │
│  │    happy-client/ (mobile sync)               │     │
│  │    channel-bridge/ (IPC abstraction)         │     │
│  │    memory-manager/ (conversation memory)     │     │
│  │    message-store.js (message persistence)    │     │
│  │    secure-settings.js (encrypted config)     │     │
│  └──────────────────────────────────────────────┘     │
│                                                       │
│  ┌──────────────────────────────────────────────┐     │
│  │  packages/cli/                               │     │
│  │    Commands: start, stop, status, config,    │     │
│  │    open, login, logout, deploy, module,      │     │
│  │    cleanup                                   │     │
│  └──────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘

         ▲ WebSocket (ws:8080)
         │
┌────────┴────────────────────┐
│  JS Eyes (Chrome Extension) │
│  Tab control, script exec,  │
│  data extraction            │
└─────────────────────────────┘
```

**Key Design Decisions:**

- **Modular server**: `modulesManager.js` loads modules declared in `modulesConfig.js`. Each module follows a standard interface: `setupFunction` returns a service class extending EventEmitter with `init()`, `start()`, `stop()` lifecycle. Modules declare `features` (hasRoutes, emitsEvents) and can have `enabledCondition` predicates.

- **Browser automation via extension**: Rather than using Puppeteer/Playwright, the project uses a custom Chrome extension ("JS Eyes") that connects via WebSocket to the local server. The `ExtensionWebSocketServer` handles auth challenges, heartbeat, rate limiting, request deduplication (5s window), round-robin distribution to multiple extension instances, and connection idle timeouts (5 min). Uses `sql.js` (WASM SQLite) for tab state persistence.

- **Memory system**: File-based (not SQLite). Active memories stored as markdown files in `active/` directory, auto-archived when count exceeds limit. An `index.md` file serves as a cached summary of all active memories, with token count estimation. Memory is rebuilt from disk on initialization.

- **Security**: AuthManager for WebSocket authentication, AuditLogger for operation tracking, RateLimiter for request throttling, ResourceMonitor for system resource tracking. libsodium for E2E encryption in Happy sync.

---

## Publisher Background

**imjszhang** (GitHub: "JS") -- solo developer, 17 followers, 67 public repos. No notable prior open-source projects (next highest repo has 4 stars). Deepseek-Cowork is their breakout project, created January 19, 2026. Single contributor with 167 commits. Last push was February 11, 2026 -- nearly a month without commits, which raises questions about maintenance momentum. No corporate backing, no funding visible. The code comments are entirely in Chinese (Mandarin), suggesting a Chinese domestic audience. The 422 stars with 111 forks (26% fork ratio) suggests interest primarily from people wanting to self-host a Cowork clone, not from active contributors.

---

## What's Valuable for Us

1. **Modular Service Architecture**: The `modulesManager.js` + `modulesConfig.js` pattern is a clean declarative approach to pluggable services. Each module declares its setup function, features, event handlers, initialization options, and enable conditions in a single config object. This is a reasonable pattern for any system that needs to dynamically compose services -- though our orchestrator achieves this through agent spawning rather than service composition.

2. **WebSocket Browser Extension Pattern**: The `ExtensionWebSocketServer` is a well-engineered piece: authentication challenges, heartbeat/idle management, request deduplication with configurable windows, round-robin distribution, and graceful shutdown. If we ever needed to build a browser extension bridge (we don't -- we use Chrome DevTools MCP), this would be reference code worth studying. Specific file: `server/modules/browser/ExtensionWebSocketServer.js`.

3. **Memory Active/Archive Lifecycle**: The `MemoryManager` pattern of active memories with automatic archiving when count exceeds a threshold, plus a consolidated `index.md` summary with token estimation, is a simple but effective approach to conversation memory management. Less sophisticated than vector stores but zero-dependency and file-system based.

---

## What's NOT Relevant

1. **GUI-First Design**: Electron desktop app with React frontend. We operate entirely in terminal/tmux (Master Blueprint Layer 3: Shared Infrastructure). Adding a GUI increases the human interaction surface, violating Principle 5 (human review is the binding constraint).

2. **Single-User Desktop Tool**: No multi-tenancy, no business-line isolation, no federated architecture. Directly conflicts with Principle 6 (federated systems, thin meta-layer) and our DSGVO isolation requirements for government work.

3. **Browser Automation via Extension**: We already have Chrome DevTools MCP for browser automation, which is more capable and doesn't require a custom extension. The JS Eyes approach is clever but technically inferior to CDP (Chrome DevTools Protocol) access.

4. **DeepSeek API Dependency**: We're committed to Claude Code as our agent runtime. DeepSeek cost savings are irrelevant when we're on Claude Max ($200/mo with 18-36x arbitrage vs API).

5. **Happy Mobile Sync**: Mobile monitoring via E2E-encrypted companion apps is a consumer UX feature. Our monitoring is via Telegram/Slack webhooks, macOS notifications, and healthchecks.io dead-man switches (Master Blueprint Layer 3: Notification Layer).

6. **Stale Development**: Last push February 11, 2026 -- nearly a month of inactivity for a v0.1.35 project suggests the developer may have moved on. Risky to build on.

---

## Future Use Cases

- **Phase 4 (Days 90+)**: If we ever build client-facing dashboards, the modular service architecture (`modulesManager` pattern) could inform how we compose backend services. Very low priority -- our Notion meta-layer handles this.
- No near-term applicability. This tool solves problems we don't have.

---

## Key Takeaway

> **DeepSeek Cowork is a mid-tier OSS Cowork clone (422 stars) with a clean modular server architecture but nothing novel beyond what we've already catalogued in 7+ similar entries; its browser extension approach, desktop GUI focus, and stale development make it a "file and forget" entry.**
