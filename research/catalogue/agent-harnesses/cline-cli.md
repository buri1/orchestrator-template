# Cline

> **Autonomous coding agent right in your IDE, capable of creating/editing files, executing commands, using the browser, and more with your permission every step of the way.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [cline/cline](https://github.com/cline/cline) |
| GitHub Stars | 58,800+ (as of 2026-03-08) |
| Publisher | Cline Bot Inc. (startup — Saoud Rizwan, founder; 35+ team members, many ex-OSS contributors) |
| License | Apache-2.0 |
| Tech Stack | TypeScript, VS Code Extension API, Protocol Buffers, Go (CLI), esbuild, Playwright (testing) |
| Maturity | 🟢 Production (5M+ installs, $32M raised, enterprise tier launched) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Cline is IDE-centric, not terminal-first. Our L-Thread Orchestrator pattern runs in terminal via Claude Code, and Cline's VS Code dependency is architectural friction. The MCP support and CLI preview are interesting but secondary to the IDE-first design. |
| **Novelty** | 4/10 | Well-documented in our research. Cline, Roo Code, and Claude Code all solve the same problem (autonomous coding agent) with similar approaches. Cline's browser automation and checkpoint system are known patterns. |
| **Actionable** | 3/10 | Can't integrate into our terminal-first orchestration pipeline. The CLI is in preview (macOS/Linux only) and lacks the maturity of Claude Code. MCP support is useful but we already have MCP via Claude Code. |

---

## Overview

Cline is the second-most-starred open-source coding agent (58.8K stars), created by Saoud Rizwan and now backed by $32M in funding from Emergence Capital and Pace Capital. It started as "Claude Dev" — a VS Code extension for Claude — and evolved into a multi-model autonomous coding agent with 5M+ installs across VS Code, JetBrains, Cursor, Windsurf, and other editors.

The core design philosophy is "permission every step of the way" — Cline shows you what it wants to do (create file, run command, edit code) and waits for approval. This human-in-the-loop approach differentiates it from fully autonomous agents. The agent can create/edit files with diff views, execute terminal commands via VS Code shell integration, launch headless browsers for testing, and extend capabilities through MCP servers. Context management uses `@url`, `@file`, `@folder`, and `@problems` attachments.

Cline's CLI component is in preview (macOS/Linux), offering terminal-based access outside VS Code. The enterprise tier (Cline Teams) adds organization management, centralized billing, and usage tracking. The project spawned Roo Code (the most successful fork), which diverged to add custom modes, faster iteration, and enterprise features.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│              VS Code Extension Host                   │
│  ┌────────────────────────────────────────────────┐  │
│  │         Webview UI (React)                      │  │
│  │  Chat │ Diff view │ Cost tracking │ Checkpoints │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Agent Core (TypeScript)                 │  │
│  │  Task planning │ Tool selection │ LLM routing   │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Tool Layer                              │  │
│  │  File ops │ Terminal (shell integration) │      │  │
│  │  Browser (headless) │ MCP tools                │  │
│  ├────────────────────────────────────────────────┤  │
│  │         LLM Provider Layer                      │  │
│  │  OpenRouter │ Anthropic │ OpenAI │ Gemini │    │  │
│  │  AWS Bedrock │ Azure │ Local (Ollama/LM Studio)│  │
│  ├────────────────────────────────────────────────┤  │
│  │         Context Management                      │  │
│  │  @url │ @file │ @folder │ @problems            │  │
│  └────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│              CLI (Go, preview)                        │
│  Terminal-based agent │ macOS/Linux only              │
└───────────────────────────────────────────────────────┘
```

**Key Components:**

- **Permission Model:** Every action (file create, edit, command execution, browser action) requires explicit user approval. No autonomous execution mode.
- **Checkpoints:** Snapshots workspace state at each task step. Users can compare current state to any checkpoint and restore if needed. Useful safety net for destructive operations.
- **Browser Automation:** Launches headless Chromium for clicking, typing, scrolling, screenshotting. Used for testing web apps and reading documentation.
- **MCP Integration:** Extends agent capabilities through Model Context Protocol servers. Users can ask Cline to "add a tool" and it configures the MCP server automatically.
- **Shell Integration:** Uses VS Code's terminal integration to execute commands and monitor output. Not raw terminal emulation — depends on VS Code's shell API.
- **Token/Cost Tracking:** Real-time monitoring of API usage and cost per task. Critical for budget management with expensive models.
- **CLI Preview:** Go-based terminal agent. Separate from the VS Code extension. macOS/Linux only, preview quality.

---

## Publisher Background

Saoud Rizwan created Cline as "Claude Dev" in mid-2024. The project grew virally — 5M installs by early 2026. The company raised $32M combined (seed + Series A) from Emergence Capital, Pace Capital, 1984 Ventures, and notable angels including Jared Friedman (YC), Logan Kilpatrick (ex-OpenAI), and Addy Osmani (Google). The team has grown from solo developer to 35+ people, with many hired from the open-source contributor community. Cline also launched a $1M Open Source Grant program.

**Risk profile:** Strong — well-funded, massive community, Apache license, diverse investor base. The VS Code platform dependency is a strategic risk (Microsoft controls the extension marketplace), but Cline's multi-editor support (JetBrains, Cursor, etc.) mitigates this. The Roo Code fork demonstrates both the strength of the open-source model and the risk of community fragmentation.

---

## What's Valuable for Us

1. **MCP Auto-Configuration:** Cline's pattern where a user says "add a tool for Jira" and the agent configures the MCP server automatically is a compelling UX pattern. Our orchestrator could adopt a similar "declarative tool request" approach for worker agents.

2. **Checkpoint/Restore Pattern:** The ability to snapshot workspace state at each step and roll back is a useful safety pattern for autonomous agents. More granular than git commits, less heavyweight than full VM snapshots. Worth studying for our worker agent safety model.

3. **Cost Tracking Design:** Real-time token/cost monitoring per task is essential for our $50K contract work. Cline's implementation is a good reference for building cost attribution into our orchestrator.

4. **Browser Automation Integration:** Cline's headless browser approach (click, type, scroll, screenshot) is simpler than our Chrome DevTools MCP setup. Worth comparing approaches for E2E testing agents.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **IDE-centric architecture** | Cline is built around VS Code's extension API. Our L-Thread Orchestrator is terminal-first (Claude Code + tmux). The architectural mismatch is fundamental — we can't embed Cline into our orchestration pipeline without VS Code running. |
| **Human-in-the-loop requirement** | Every action needs approval. No autonomous execution mode. Our worker agents need to operate unattended (AUTO_MODE). |
| **CLI is immature** | The Go-based CLI is in preview, macOS/Linux only. Not production-ready as a terminal-based agent alternative to Claude Code. |
| **Redundant with Claude Code** | For our use case, Cline solves the same problem as Claude Code but with worse terminal integration. We're already deeply invested in Claude Code's tool system and prompt engineering. |
| **Fork fragmentation risk** | Roo Code's successful fork means the community is split. Features may land in one fork but not the other, complicating long-term bets. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** No integration. We're committed to Claude Code + tmux for agent execution. Cline's VS Code dependency is a non-starter.
- **Phase 3 (Days 60-90):** If we need IDE-based agents for specific use cases (e.g., frontend development with visual feedback), Cline's browser automation and MCP integration make it a candidate.
- **Phase 4 (Days 90+):** Monitor the CLI maturity. If Cline CLI reaches production quality with autonomous execution mode, it could become a viable alternative worker agent runtime — but only if it offers something Claude Code doesn't.

---

## Key Takeaway

> **Cline is the most-installed open-source coding agent with strong MCP support and browser automation, but its VS Code-centric architecture and human-in-the-loop requirement make it a poor fit for our terminal-first, autonomous orchestration pipeline — study its MCP auto-configuration and checkpoint patterns, don't adopt the tool.**
