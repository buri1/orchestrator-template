# AgentCraft

> **RTS (Real-Time Strategy) game-style interface for managing AI agent lifecycles — track, summon, command, and coordinate agents from a single command center.**

| Field | Value |
|-------|-------|
| Category | 🧩 General Interest |
| Website | [getagentcraft.com](https://www.getagentcraft.com/) |
| Install | `npx @idosal/agentcraft` |
| Publisher | Ido Salomon (@idosal) |
| License | Unknown (npm package) |
| Tech Stack | Node.js (npx), Docker, Apple Containers, PWA |
| Maturity | 🟡 Early (beta features) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves the same "manage multiple agents" problem but with a visual/interactive approach — opposite of our headless design. The container isolation and remote access patterns are relevant infrastructure ideas. |
| **Novelty** | 7/10 | The RTS game metaphor for agent orchestration is genuinely novel. "Alliance Hall" multiplayer collaboration, mobile PWA with push notifications, and Telegram/Discord integration are differentiated features. |
| **Actionable** | 3/10 | The visual/interactive paradigm is fundamentally different from our headless orchestrator. Pattern inspiration only — no direct adoption path. |

---

## Overview

AgentCraft applies the Real-Time Strategy game interface paradigm to AI agent orchestration. Users manage agents through a "command center" where they can track, summon, command, and manage agent lifecycles using the intuitive patterns familiar from RTS games.

The platform provides a single pane of glass for centralized agent management, supporting Claude Code, OpenCode (75+ models), Cursor, and experimental OpenClaw integration.

Key architectural features:

- **RTS-style control**: Game interface principles applied to agent management — rapid selection, commanding, and monitoring of multiple agents simultaneously
- **Container isolation**: Docker and Apple Container support with network isolation for secure agent execution
- **Remote operations**: Mobile PWA, secure tunnels, push notifications, and Telegram/Discord integration for managing agents from anywhere
- **Alliance Hall**: Collaborative multiplayer feature for shared agent coordination across team members

---

## Supported Agents

| Agent | Status |
|-------|--------|
| Claude Code | Supported |
| OpenCode | Supported (75+ models) |
| Cursor | Supported |
| OpenClaw | Experimental |

---

## What's Valuable for Us

1. **Container isolation pattern**: Docker and Apple Container support with network isolation is a more robust isolation model than our tmux windows. If we ever need stronger sandboxing (e.g., untrusted code execution), this is the pattern.

2. **Remote access via PWA + push notifications**: Managing agents from mobile with push notifications for completion/failure is a useful UX pattern. Our orchestrator currently requires terminal access.

3. **Telegram/Discord integration**: Notification channels beyond the terminal. Relevant for client-facing orchestration where stakeholders want updates without SSH access.

4. **Alliance Hall multiplayer**: The concept of multiple humans collaborating on shared agent pools is interesting for team scenarios — currently outside our scope but relevant for scaling.

---

## What's NOT Relevant

- **RTS visual interface**: We're headless by design. Interactive dashboards don't fit our AI-orchestrator-as-agent pattern.
- **npx installation model**: We use shell scripts and tmux, not Node.js package management for orchestration tooling.
- **Cursor integration**: We don't use Cursor in our workflow.
- **Game metaphor**: Fun but not functional for our use case where the orchestrator itself is an AI agent, not a human player.

---

## Key Takeaway

> **AgentCraft's novelty is the RTS game metaphor and its remote-access features (PWA, push notifications, Telegram/Discord). The container isolation pattern is the most technically relevant idea for us. The visual/interactive paradigm is the opposite of our headless approach, making this a design reference rather than an adoption candidate.**
