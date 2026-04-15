# hermes-agent-template

> **Railway deployment template for Hermes Agent -- one-click deploy with a web-based admin dashboard for configuration, gateway management, and user pairing.**

| Field | Value |
|-------|-------|
| Category | Agent Harnesses |
| Repository | [github.com/praveen-ks-2001/hermes-agent-template](https://github.com/praveen-ks-2001/hermes-agent-template) |
| GitHub Stars | 39 (as of 2026-04-04) |
| Publisher | praveen-ks-2001 -- community contributor, previously built openclaw-railway template |
| License | None specified |
| Tech Stack | Python, Starlette, Uvicorn, Docker, Railway, HTML/CSS (dark-themed admin UI) |
| Maturity | Early |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | A deployment template, not an agent architecture. The admin dashboard pattern for managing agent lifecycle (start/stop/restart, config, user pairing) has mild relevance to our orchestrator's worker management. |
| **Novelty** | 3/10 | Standard Railway template pattern. The admin dashboard is a simple Starlette app with basic auth. The gateway-as-subprocess management is straightforward. |
| **Actionable** | 3/10 | The one-click deploy pattern and admin dashboard for gateway management are interesting for productization but not directly useful for our tmux-based orchestrator architecture. |

---

## Overview

hermes-agent-template is a community-built Railway deployment template that wraps Hermes Agent with a web-based admin dashboard. It solves the "Hermes Agent is powerful but hard to deploy" problem by providing a one-click Railway deploy button, a dark-themed admin UI for configuration, and gateway lifecycle management from the browser.

The admin dashboard is a Python Starlette/Uvicorn server that manages the Hermes gateway as an async subprocess. It provides:
- **Provider configuration**: Dropdown-based LLM provider selection (OpenRouter, DeepSeek, DashScope, GLM, Kimi, MiniMax, HuggingFace) with API key input
- **Channel toggles**: Checkbox-based enable/disable for Telegram, Discord, Slack, WhatsApp, Email, Mattermost, Matrix
- **Tool toggles**: Enable/disable for Parallel search, Firecrawl scraping, Tavily search, FAL image gen, Browserbase, GitHub, OpenAI Voice, Honcho memory
- **Gateway management**: Start, stop, restart the Hermes gateway process from the UI
- **Live status**: Stat cards for gateway state, uptime, current model, and pending pairing requests
- **Live logs**: Streaming log viewer from the gateway's stdout/stderr ring buffer
- **User pairing**: Approve/deny users who message the bot, revoke access anytime
- **Config reset**: One-click reset to factory defaults

Config is stored in `/data/.hermes/.env` and `/data/.hermes/config.yaml`, persisted via Railway volume mount at `/data`.

---

## Technical Architecture

```
Railway Container
├── Python Admin Server (Starlette + Uvicorn)
│   ├── /            Admin dashboard (Basic Auth)
│   ├── /health      Health check (no auth)
│   └── /api/*       Config, status, logs, gateway, pairing
└── hermes gateway   Managed as async subprocess
    ├── stdout/stderr → ring buffer → /api/logs stream
    └── Config from /data/.hermes/{.env, config.yaml}
```

**Key design decisions:**
- **Gateway-as-subprocess**: The admin server manages Hermes gateway as a child process, capturing its output into a ring buffer for the live log viewer. Simple but effective process management.
- **Volume persistence**: Config and state persist at `/data` across Railway redeploys.
- **Basic auth only**: Username/password protection, no OAuth or token-based auth. Appropriate for single-user deployment.
- **No code changes to Hermes**: The template wraps Hermes without modifying it -- pure operational layer.

---

## Publisher Background

praveen-ks-2001 is a community contributor who previously built the openclaw-railway template (referenced in the credits). The hermes-agent-template has 39 stars and 13 forks, suggesting moderate community adoption for a deployment-focused utility. The repo was created 2026-03-31, making it very recent and actively developed (last push 2026-04-13).

---

## What's Valuable for Us

1. **Admin dashboard for agent lifecycle**: The pattern of a lightweight web UI for starting/stopping/restarting agent processes and viewing their logs could be useful if we ever need a dashboard for our orchestrator's workers. The ring buffer approach for log streaming is clean.

2. **Gateway-as-subprocess pattern**: Managing the main agent process as an async subprocess of a control server is a simple way to add lifecycle management without modifying the agent itself. Our orchestrator could wrap tmux workers similarly.

3. **User pairing workflow**: The approve/deny/revoke pattern for controlling who can interact with the agent is a useful access control model, even if we don't need it now.

---

## What's NOT Relevant

- **Railway-specific deployment**: We deploy via tmux locally, not Railway.
- **Basic auth / admin UI**: Our orchestrator is headless and API-driven, not browser-managed.
- **LLM provider configuration UI**: We hardcode Claude; no need for provider dropdowns.
- **Messaging channel configuration**: We don't use Telegram/Discord/Slack for agent communication.
- **Tool toggle UI**: Our tool configuration is in prompts, not a web dashboard.

---

## Key Takeaway

> **hermes-agent-template is a clean deployment wrapper for Hermes Agent, not an agent architecture innovation. Its main contribution is the pattern of a lightweight admin server managing an agent process as an async subprocess with log streaming -- a simple operational pattern that could inform future orchestrator dashboard work.**
