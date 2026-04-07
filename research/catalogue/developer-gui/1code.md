# 1Code

> **Orchestration layer for coding agents (Claude Code, Codex) — open-source visual client with parallel agent sessions, git worktree isolation, and background cloud sandboxes.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [21st-dev/1Code](https://github.com/21st-dev/1Code) |
| GitHub Stars | 5,148 (as of 2026-03-08) |
| Publisher | 21st.dev / Sergey Bunas & Serafim Korablev (YC W26 startup, 3 employees) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (98.6%), Electron + Vite, Bun, Drizzle ORM, Tailwind CSS |
| Maturity | 🟡 Early (v0.0.84, 84 releases since Jan 2026, 22 contributors) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | GUI wrapper around Claude Code conflicts with our terminal-first, autonomous orchestration approach (Governing Principle #9). However, the worktree isolation, background agents API, and MCP lifecycle management are architecturally interesting patterns we already use or plan to adopt. More relevant than Jean/T3Code because it adds a programmatic API layer and background execution — closer to "managed harness" than pure GUI. |
| **Novelty** | 5/10 | Worktree-per-session is a pattern we've seen in Overstory, pi-side-agents, Broomie, and Vibe Kanban. Background cloud sandboxes are a minor novelty (similar to Manaflow's Morph Cloud approach). The REST API for programmatic agent spawning (`/api/v1/tasks`) is the most novel aspect — an API-first agent execution surface we haven't catalogued before. |
| **Actionable** | 3/10 | Not directly adoptable as a tool (we don't want Electron GUIs). The REST API pattern for remote agent execution is worth studying for Phase 3+. Their MCP server lifecycle UI could inform our future MCP management tooling. |

---

## Overview

1Code is an open-source Electron desktop application that wraps Claude Code and OpenAI Codex into a unified visual interface. Built by the 21st.dev team (YC W26), it positions itself as the "Cursor-like UI for Claude Code" — letting developers run multiple AI coding agents in parallel, each in its own git worktree, with real-time visibility into tool execution (bash commands, file edits, web searches).

The product operates at three tiers: a free self-hosted desktop app, a $20/mo Pro tier adding background cloud agents with live browser previews, and a $100/mo Max tier with automations (PR reviews, CI/CD fixes, Linear task automation). The cloud tier runs agents in isolated sandboxes that persist when the laptop is closed — essentially a managed remote agent execution environment.

What distinguishes 1Code from the crowded agent GUI space (Jean, T3Code, Manaflow) is its combination of (1) multi-harness support (Claude Code + Codex in the same app), (2) a REST API for programmatic task submission, and (3) external trigger integration (@1code mentions in GitHub/Linear/Slack launch agents automatically). This pushes it beyond "developer GUI" toward "lightweight agent orchestration platform with a GUI frontend."

---

## Technical Architecture

**Desktop app stack:**
- Electron + Vite for the desktop shell
- Bun as runtime and package manager
- Drizzle ORM for local database (likely SQLite for session/state persistence)
- React + Tailwind CSS for the UI layer
- Agent binaries downloaded separately (`bun run claude:download`, `bun run codex:download`)

**Key architectural patterns:**

```
┌─────────────────────────────────────┐
│         1Code Electron App          │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Session 1 │  │ Session 2 │  ...  │
│  │ worktree  │  │ worktree  │       │
│  │ + claude  │  │ + codex   │       │
│  └─────┬─────┘  └─────┬─────┘      │
│        │              │             │
│  ┌─────▼──────────────▼─────┐      │
│  │   Git Worktree Manager    │      │
│  │   (isolation per session) │      │
│  └──────────────────────────┘      │
│                                     │
│  ┌──────────────────────────┐      │
│  │   MCP Server Lifecycle    │      │
│  │   (toggle/configure/del)  │      │
│  └──────────────────────────┘      │
│                                     │
│  ┌──────────────────────────┐      │
│  │   Drizzle ORM (SQLite?)   │      │
│  │   Sessions, state, config │      │
│  └──────────────────────────┘      │
└─────────────────────────────────────┘
         │ (Pro/Max tiers)
         ▼
┌─────────────────────────────────┐
│   1Code Cloud Infrastructure     │
│                                   │
│  REST API: /api/v1/tasks          │
│  Background sandboxes             │
│  Live browser previews            │
│  @1code trigger integrations      │
│  (GitHub, Linear, Slack)          │
└─────────────────────────────────┘
```

**Git worktree isolation:** Each chat/agent session gets its own worktree, preventing cross-contamination between parallel agent tasks. This is the same pattern documented in Overstory, pi-side-agents, Broomie, and our own architecture.

**MCP integration:** Full server lifecycle management from the UI — add, configure, toggle, and delete MCP servers without editing JSON config files. Supports Notion, Linear, GitHub, Slack, Sentry, PostgreSQL out of the box.

**Background agents (cloud):** Pro/Max tiers run agents in isolated cloud sandboxes with live dev server previews accessible via browser. Agents continue executing when the developer closes their laptop.

**REST API:** Programmatic agent execution at `https://1code.dev/api/v1/tasks` — submit tasks, get async results with automatic PR creation. This is the most architecturally interesting feature, enabling CI/CD integration and external automation triggers.

---

## Publisher Background

**21st.dev** (YC W26, San Francisco, 3 employees) was founded in 2024 by:

- **Sergey Bunas** — CS dropout, previously built UI systems at Deel (YC W19), created Suggesty (#1 Product Hunt, inspired early Perplexity concept), solo-built Stage (Figma competitor, 10K users), Cambridge AI hackathon winner.
- **Serafim Korablev** (CEO) — self-described "vibe-coder," co-founded Rork.com (Next.js web app builder), built first Telegram memecoin launchpad (multi-million exit), co-founded Via (cross-chain crypto routing, $1.5B GTV).

The parent company 21st.dev is positioned as "infrastructure and UI building blocks for the agentic internet" — the largest React component registry for AI applications, with 1.4M+ developers and 200K MAU. They claim 9 products launched in 10 months, 1M+ total users, $200K revenue, and 10K GitHub stars across projects. The 1Code product specifically has 5.1K stars and 544 forks — strong traction for a 2-month-old repo.

**Credibility assessment:** Strong execution velocity (84 releases in ~2 months). YC backing adds validation. However, the team is tiny (3 people) and 1Code is one product among many from 21st.dev — risk of spread-thin attention. The founders have strong shipping records but pivoted from crypto/design tools to AI dev tools recently.

---

## What's Valuable for Us

1. **REST API for agent task submission** (`/api/v1/tasks`) — This is the most interesting pattern. A simple API endpoint that accepts a task description and returns async results with auto-PR creation. We could build something similar on top of our tmux-based orchestrator to enable external systems (Notion automations, webhooks, CI pipelines) to spawn agent tasks programmatically. Worth studying the API design.

2. **@mention trigger pattern** — Tagging @1code in GitHub issues, Linear tickets, or Slack messages to automatically spawn an agent. This "event-driven agent spawning from existing tools" pattern aligns with our future automation goals (Phase 3+). The integration surface is broader than what we've seen in other tools.

3. **MCP server lifecycle management** — Their UI for managing MCP servers (add/configure/toggle/delete) without editing JSON is a good reference for how MCP configuration could be exposed. Not directly adoptable (we're terminal-first) but the underlying data model for MCP server state is worth examining.

4. **Worktree isolation validation** — Yet another independent implementation confirming git worktree-per-agent as the de facto standard pattern. Their approach (worktree per chat session) is identical to ours.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Electron desktop app** | Terminal is our interface (Governing Principle #9). We explicitly avoid custom GUIs (ADR-005). Electron is heavy, resource-hungry. |
| **Visual agent interaction** | We need autonomous orchestration, not interactive chat-with-agents GUI. Our agents run unattended. |
| **Multi-harness switching (Claude+Codex)** | We're Claude Code-first. Adding Codex as a harness is Phase 4+ at earliest, and if we do, it won't be through a GUI toggle. |
| **$20-100/mo SaaS pricing** | We run on Claude Max ($200/mo) with 18-36x arbitrage. Adding another SaaS subscription for agent execution doesn't fit the cost model. |
| **Background cloud sandboxes** | Interesting concept but we already have tmux sessions that persist. Cloud sandboxes add infrastructure dependency we don't need (Governing Principle #7). |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No relevance. We have our orchestrator working.
- **Phase 2 (Days 4-60):** No relevance. Terminal-first approach is locked in.
- **Phase 3 (Days 60-90):** The REST API pattern for programmatic agent spawning could inform our webhook/automation layer design. Study their `/api/v1/tasks` endpoint design when building external trigger support.
- **Phase 4 (Days 90+):** If we ever need a visual dashboard for non-technical stakeholders (client demos, portfolio visibility), 1Code's approach of "GUI on top of CLI agents" is the right pattern — don't rebuild the agent, just wrap it. The @mention trigger pattern could be valuable for client-facing automations.

---

## Key Takeaway

> **1Code is the most feature-complete GUI wrapper for Claude Code (5.1K stars, YC W26, REST API, background agents), but its value for us is limited to studying the programmatic task API and @mention trigger patterns for Phase 3+ automation — the Electron GUI itself conflicts with our terminal-first architecture.**
