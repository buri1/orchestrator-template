# AionUi

> **Free, local, open-source 24/7 Cowork app and OpenClaw for Gemini CLI, Claude Code, Codex, OpenCode, Qwen Code, Goose CLI, Auggie, and more**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [github.com/iOfficeAI/AionUi](https://github.com/iOfficeAI/AionUi) |
| GitHub Stars | 18,202 (as of 2026-03-08) |
| Publisher | iOfficeAI (organization, unknown team size) |
| License | Apache-2.0 |
| Tech Stack | TypeScript, Electron 37.x, React 19.x, Arco Design, UnoCSS, Monaco Editor, Express 5.x, SQLite, Bun |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Source: @aratahikaru0's collection post. Positioned as OSS Claude Cowork clone. 18K stars is massive traction — bigger than most tools in the catalogue. The "OpenClaw for everything" angle is interesting: they're wrapping 15+ CLI agents (Claude Code, Codex, Gemini CLI, OpenCode, Qwen Code, Goose, Auggie) into a single Electron desktop app with a unified chat GUI. But for us: this is a GUI wrapper, not an orchestration system. No deterministic routing, no worktree isolation, no multi-agent coordination logic. The Channels architecture (Telegram/Lark/DingTalk remote access) is the only technically interesting part — but we'd build that as a notification layer, not through a desktop app.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | GUI wrapper for CLI agents — opposite of our headless, deterministic orchestration approach |
| **Novelty** | 4/10 | Multi-agent CLI wrapping and OpenClaw integration are known patterns; Channels architecture for IM platforms is moderately interesting |
| **Actionable** | 2/10 | Nothing to adopt or adapt — different architectural paradigm (GUI-first vs. headless-first) |

---

## Overview

AionUi is a cross-platform Electron desktop application that transforms CLI-based AI agents into a modern chat interface. It positions itself as an open-source alternative to Claude Cowork and as an "OpenClaw for everything" — wrapping 15+ CLI tools (Claude Code, Codex, Gemini CLI, OpenCode, Qwen Code, Goose CLI, Auggie, and more) plus 20+ AI platform APIs (Gemini, OpenAI, Anthropic, Ollama local models) into a unified GUI.

The application includes a built-in agent engine ("NanoBot") that requires zero CLI installation, plus an auto-detection layer that discovers and integrates any locally installed CLI agents. It ships with 12 professional built-in assistants, scheduled task automation via natural language cron, a 10+ format document preview panel (PDF, Word, Excel, PPT, Markdown, code, images, HTML), and AI-powered document generation.

The most architecturally distinct feature is the Channels system — a multi-platform remote access framework supporting Telegram (via grammY), Lark (official SDK), and DingTalk (dingtalk-stream) as bot interfaces. This allows users to interact with their local AionUi instance from mobile devices via messaging apps, with per-chat session isolation and 500ms throttled streaming updates.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Electron Shell                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  React 19 UI │  │ Monaco Editor│  │ Arco Design│ │
│  │  (renderer/) │  │              │  │ Components │ │
│  └──────┬───────┘  └──────────────┘  └────────────┘ │
│         │                                            │
│  ┌──────▼───────────────────────────────────────────┐│
│  │              Main Process (process/)              ││
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────┐  ││
│  │  │ Bridge  │ │ Database │ │ Services         │  ││
│  │  │ (IPC)   │ │ (SQLite) │ │ (task, i18n, msg)│  ││
│  │  └─────────┘ └──────────┘ └──────────────────┘  ││
│  └──────────────────────────────────────────────────┘│
│         │                                            │
│  ┌──────▼───────────────────────────────────────────┐│
│  │              Agent Layer (agent/)                 ││
│  │  ┌─────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ││
│  │  │ OpenClaw│ │ Gemini │ │ NanoBot │ │  ACP   │ ││
│  │  │ Gateway │ │ CLI    │ │ (built- │ │Adapter │ ││
│  │  │ Manager │ │ Wrap   │ │ in agent│ │(Codex) │ ││
│  │  └─────────┘ └────────┘ └─────────┘ └────────┘ ││
│  └──────────────────────────────────────────────────┘│
│         │                                            │
│  ┌──────▼───────────────────────────────────────────┐│
│  │            Channels (channels/)                   ││
│  │  ┌──────────┐ ┌──────┐ ┌──────────┐             ││
│  │  │ Telegram │ │ Lark │ │ DingTalk │             ││
│  │  │ (grammY) │ │(SDK) │ │ (stream) │             ││
│  │  └──────────┘ └──────┘ └──────────┘             ││
│  │  SessionManager + ChannelManager + ActionExecutor││
│  │  Per-chat isolation: userId:chatId composite key  ││
│  └──────────────────────────────────────────────────┘│
│         │                                            │
│  ┌──────▼───────────────────────────────────────────┐│
│  │           WebServer (webserver/)                   ││
│  │  Express 5 + JWT auth + WebSocket + Directory API ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Key components:**
- **Agent Layer**: Adapters for OpenClaw (gateway connections + device auth), Gemini CLI, built-in NanoBot, and ACP (Agent Communication Protocol) for Codex integration. Each adapter wraps a CLI tool into a unified message interface.
- **Channels System**: Production-grade IM integration with BasePlugin lifecycle state machine, per-platform message update strategies (text editing, interactive cards, AI cards), 500ms throttling for streamed updates, Base64 credential encryption, and a 4-table database schema (v7-v14 migration chain).
- **WebServer**: Express 5 remote access server with JWT authentication, WebSocket streaming, and a directory API for file management.
- **Skills System**: 12+ built-in skills (docx, xlsx, pptx, pdf, mermaid, story-roleplay, openclaw-setup, skill-creator) plus a skill creation framework.
- **Storage**: Local SQLite database for conversations, sessions, channel state, and configuration.

**SDK dependencies**: @anthropic-ai/sdk 0.71.2, OpenAI SDK 5.12.2, Google GenAI, AWS Bedrock client — direct API integrations alongside CLI wrapping.

---

## Publisher Background

**iOfficeAI** is an organization of unclear provenance. The GitHub org has no other public repositories besides AionUi. The project's README includes Chinese-language community links (WeChat articles), suggesting a China-based or Chinese-speaking team. The codebase is substantial (436MB, 2,785 commits, v1.8.23) and well-structured with TypeScript strict mode, Vitest testing, and comprehensive architecture documentation.

The project has achieved significant traction: 18.2K stars, 1.4K forks, and was featured on GitHub Trending. It was reviewed by YouTubers WorldofAI (200K subscribers) and Julian Goldie SEO (318K subscribers). The repo was created 2025-08-07 and has been actively maintained with the last push on 2026-03-08. Multiple community articles exist on Chinese social platforms.

No known funding, no identifiable individual maintainers, no other products from this org. The Apache-2.0 license is permissive.

---

## What's Valuable for Us

**Very little is directly adoptable.** The architectural paradigm (GUI-first desktop wrapper) is fundamentally opposed to our headless, deterministic orchestration approach (Master Blueprint Principle #2: "Deterministic orchestration, LLM execution").

The one potentially interesting pattern:

1. **Channels Architecture** (`src/channels/`): The multi-platform IM bot system is a well-documented reference for how to build Telegram/Lark/DingTalk integrations. The per-chat session isolation via composite `userId:chatId` keys, the BasePlugin lifecycle state machine, and the throttled streaming pattern could inform our notification layer design at Phase 3+. Their `ARCHITECTURE.md` is production-grade documentation with database schemas, IPC contracts, and 9 design patterns.

2. **ACP Adapter** (`src/agent/acp/`): The Agent Communication Protocol adapter shows how to detect and integrate arbitrary CLI agents (AcpDetector, AcpConnection, AcpAdapter). If we ever need to wrap non-Claude agents, this is a reference.

---

## What's NOT Relevant

- **GUI-first paradigm**: Our Master Blueprint Principle #5 ("Human review is the binding constraint") means we optimize for minimal human interaction, not more GUI surface area. A desktop app that requires a human to sit in front of it defeats the purpose of autonomous agent swarms.

- **Built-in agent (NanoBot)**: Another LLM wrapper. We already have Claude Code as our primary harness and don't need a second built-in agent competing for context.

- **Multi-provider API aggregation**: Direct SDK integrations with 20+ providers duplicates what LiteLLM (already in our catalogue at 8/10) does better as a standalone proxy.

- **Document generation skills** (docx, pptx, xlsx): Consumer productivity features irrelevant to code orchestration.

- **OpenClaw wrapping**: We already have OpenClaw catalogued separately (6/10). Wrapping it in Electron adds a GUI layer we don't want.

- **Desktop-local architecture**: Electron + local SQLite conflicts with our federated, server-side approach. There's no API-first design, no headless mode for CI/CD integration, no multi-machine coordination.

---

## Future Use Cases

- **Phase 1-2 (Days 1-60)**: No use case. We're building headless orchestration, not desktop GUIs.
- **Phase 3 (Days 60-90)**: The Channels architecture documentation could serve as a reference implementation if we add Telegram bot notifications to the notification layer. The composite key session isolation pattern is clean.
- **Phase 4 (Days 90+)**: If we ever build a monitoring dashboard, the WebServer pattern (Express 5 + JWT + WebSocket) is a reasonable reference for a lightweight web UI. But many better references exist (1Code's REST API, Broomie's status dashboard).

---

## Key Takeaway

> **AionUi is a polished Electron GUI wrapper around CLI agents with impressive traction (18K stars), but it solves the opposite problem from ours — it adds human-operated GUI surface area where we need headless autonomous coordination; the only technically interesting component is the Channels IM-bot architecture for future notification layer reference.**
