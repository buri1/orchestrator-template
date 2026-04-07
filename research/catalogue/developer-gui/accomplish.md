# Accomplish

> **Accomplish™ is the open source AI coworker that lives on your desktop.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI |
| Repository | [github.com/accomplish-ai/accomplish](https://github.com/accomplish-ai/accomplish) |
| GitHub Stars | ~1,052 (as of 2026-03-12) |
| Publisher | Accomplish Inc — solo/small team; founder likely Konstantinos Botonakis (GitHub: konstantinosbotonakis) |
| License | MIT |
| Tech Stack | Electron + React + Vite (renderer), Node.js (main process), node-pty to spawn OpenCode CLI, AES-256-GCM keychain encryption |
| Maturity | 🟡 Early (v0.4.0, active development) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *Desktop agent, not orchestrator. The BYOK-plus-built-in-model angle is interesting for distribution — zero friction to try, then monetize via key upgrade. The OpenCode-as-subprocess architecture is the same shell-spawning pattern we already use with tmux/Claude Code, but packaged as a consumer Electron app rather than a developer harness. Very low relevance for our core orchestration work, but worth watching for lead gen experiments where we need a self-contained agent that non-technical clients can run without touching a terminal.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | Consumer desktop GUI; our architecture is tmux + harness + headless — opposite direction |
| **Novelty** | 3/10 | BYOK-with-built-in-fallback distribution model is notable; rest is standard Electron+LLM recipe |
| **Actionable** | 2/10 | No patterns directly portable to our stack; distribution model is interesting for SaaS factory thought |

---

## Overview

Accomplish is a free, open-source (MIT) AI desktop agent for macOS and Windows that automates file management, document creation, and browser tasks locally. It ships with a built-in AI model (no API key required at all) and optionally accepts BYOK keys for xAI, OpenAI, Anthropic (Claude), Google Gemini, or local models via Ollama. The "no API key, no setup, no cost" pitch is the core distribution wedge — users can start immediately, then upgrade to their preferred model.

Under the hood the app is an Electron shell wrapping a React/Vite UI. The main process spawns the OpenCode CLI via node-pty, meaning Accomplish is essentially a packaged GUI around OpenCode's terminal agent — it does not implement its own agent loop. API keys are encrypted with AES-256-GCM and stored in the OS keychain; files never leave the user's machine. Parallel task execution is supported (each task runs in its own isolated OpenCode process). The project was formerly named Openwork and rebranded to Accomplish at launch.

Custom Skills (reusable workflow macros) extend the agent's capabilities. The project also ships with an AGENTS.md at the repo root, signalling alignment with that convention. Version 0.4.0 is current; Windows 11 and macOS (Apple Silicon) are the supported platforms.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│           Electron Main Process          │
│  - Key storage (AES-256-GCM + keychain) │
│  - node-pty → spawns OpenCode CLI        │
│  - Per-task isolated process             │
└────────────────┬────────────────────────┘
                 │ IPC
┌────────────────▼────────────────────────┐
│         React + Vite Renderer            │
│  - Chat UI (3D tilt animation)           │
│  - Task list + parallel status           │
│  - Skills management                     │
└─────────────────────────────────────────┘

Provider routing (BYOK or built-in):
  Built-in model  ─┐
  xAI / OpenAI    ─┤→ OpenCode CLI → LLM API
  Anthropic / Gemini─┤
  Ollama (local)  ─┘
```

- **Storage**: OS keychain for secrets; local filesystem only; no cloud sync
- **Agent runtime**: OpenCode CLI (Go + TUI) — Accomplish does NOT own the agent loop
- **Parallelism**: One node-pty child process per task; isolation is process-level
- **Skills**: Markdown-based custom command templates stored locally
- **Distribution**: Direct DMG download (v0.4.0); no app store listing yet

---

## Publisher Background

Accomplish Inc is a small (likely solo or micro) team. The primary GitHub contributor is `konstantinosbotonakis` (Konstantinos Botonakis), who maintains a personal fork at `github.com/konstantinosbotonakis/accomplish-ai`. The org account is `accomplish-ai`. No funding, YC batch, or team size information is publicly available. The project launched publicly in early 2026 and grew to ~1K GitHub stars. The @accomplish_ai handle is active on X. The pivot from "Openwork" branding to "Accomplish" happened at the public launch.

---

## What's Valuable for Us

1. **BYOK-with-built-in-fallback distribution model**: Shipping a working free tier that requires zero credentials is a powerful acquisition pattern for consumer-facing SaaS experiments. If we ever build a non-technical-user-facing agent product, this zero-friction onboarding is the right pattern.

2. **AGENTS.md adoption signal**: The project ships `AGENTS.md` at the root, which confirms the convention is spreading beyond developer-first tools into consumer desktop agents — further evidence that adopting AGENTS.md today has compounding reach.

3. **OpenCode-as-subprocess pattern**: Demonstrates that OpenCode CLI is embeddable as a subprocess in larger applications. If we ever want to offer a lightweight desktop companion for client delivery, OpenCode (not Claude Code) is the correct subprocess candidate due to its Go binary + headless mode.

---

## What's NOT Relevant

- **Electron GUI layer**: Our architecture is headless tmux + SSH — an Electron wrapper adds zero value and conflicts with server-side deployment.
- **Single-user desktop focus**: Accomplish is designed for one person on one machine. Our multi-business orchestrator is fundamentally multi-agent, multi-project, server-side.
- **OpenCode dependency**: We're Claude Code-native; switching the agent backend to OpenCode would require significant rework for minimal gain.
- **No orchestration primitives**: No multi-agent coordination, no session registry, no tmux pane management, no state machine — it is a single-agent consumer app. Conflicts with our entire Conduit/Teams architecture.

---

## Future Use Cases

- **Phase 4 (Days 90+)**: If building a client-facing "AI assistant" product for non-technical German SME clients (e.g., a packaged automation tool for lead gen customers), the BYOK-with-built-in-model distribution pattern is the right template. Accomplish itself is not the vehicle — the pattern is.
- **SaaS Factory**: The zero-friction onboarding model (built-in model, no keys required) is worth encoding as a launch template for rapid SaaS experiments targeting non-developer end-users.

---

## Key Takeaway

> **Accomplish is a consumer Electron wrapper around OpenCode CLI with a clever zero-key-required distribution model — not an orchestration tool, but its BYOK-with-built-in-fallback onboarding pattern is the right template for any non-developer-facing agent product.**
