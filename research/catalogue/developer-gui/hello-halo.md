# Hello Halo

> **Open-source Claude Code GUI — like Claude Cowork. Visual AI assistant with remote access, file management, and built-in AI browser.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [openkursar/hello-halo](https://github.com/openkursar/hello-halo) |
| GitHub Stars | 624 (as of 2026-03-08) |
| Publisher | OpenKursar (small team / org, lead: openkursar-flynn) |
| License | MIT |
| Tech Stack | TypeScript, Electron + Vite, React, Claude Agent SDK, better-sqlite3, Tailwind CSS, Playwright |
| Maturity | 🟡 Early (v2.0.8, active development, 70 forks, 21 open issues) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | GUI wrapper for Claude Code — solves the accessibility/UI problem, not the orchestration or coordination problem. Opposite of our "terminal is the interface" principle. |
| **Novelty** | 5/10 | The Digital Human Protocol (DHP) spec.yaml pattern for defining autonomous agents is genuinely interesting. The "Space" workspace isolation concept maps loosely to our per-business-line isolation. |
| **Actionable** | 3/10 | DHP's spec.yaml schema for declarative agent definitions has some adaptation potential for our task schema. Remote access pattern is irrelevant since we use tmux+SSH. |

---

## Overview

Halo is a **desktop GUI wrapper around the Claude Code Agent SDK** built with Electron. It positions itself as the "open-source Claude Cowork" — giving non-technical users (designers, PMs, students) a visual interface to interact with Claude Code's full agent capabilities without touching a terminal. The pitch: "Windows turned DOS into visual desktops. Halo turns Claude Code CLI into a visual AI companion."

The core architecture is straightforward: an Electron main process hosts the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) for the agent loop, a React renderer provides the chat and artifact UI, and IPC bridges the two. All data stays local in `~/.halo/` backed by SQLite. Users bring their own API keys (Anthropic, OpenAI, DeepSeek, or any OpenAI-compatible endpoint). Multi-model support is provided via an OpenAI-compatible router in the main process.

The most architecturally interesting feature is the **Digital Human Protocol (DHP)** — an open registry (`digital-human-protocol` repo) where autonomous agents are defined as `spec.yaml` files with system prompts, cron-based schedules, MCP tool requirements, memory schemas, and multi-channel output configuration. These "Digital Humans" run as background agents: price monitors, news digesters, inbox summarizers. This is essentially a declarative agent marketplace pattern with a separation between spec (what/when) and runtime (how).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Halo Desktop (Electron)                  │
│                                                                 │
│  Renderer (React + Tailwind)          Main Process (Node.js)    │
│  ┌───────────────────────┐           ┌────────────────────────┐ │
│  │ Chat UI               │           │ services/              │ │
│  │ Artifact Rail (Code-  │◄── IPC ──►│   agent.service.ts     │ │
│  │   Mirror previews)    │           │   conversation.service │ │
│  │ Space Manager         │           │   space.service.ts     │ │
│  │ Digital Human Store   │           │   remote.service.ts    │ │
│  │ Settings / Themes     │           │   ai-browser/          │ │
│  │ Overlay (screen share)│           │   tunnel.service.ts    │ │
│  └───────────────────────┘           │   artifact.service.ts  │ │
│                                      │   search.service.ts    │ │
│                                      ├────────────────────────┤ │
│                                      │ apps/                  │ │
│                                      │   runtime/ (DHP exec)  │ │
│                                      │   spec/ (spec.yaml)    │ │
│                                      │   manager/ (lifecycle) │ │
│                                      │   conversation-mcp/    │ │
│                                      ├────────────────────────┤ │
│                                      │ openai-compat-router/  │ │
│                                      │ (multi-provider proxy) │ │
│                                      ├────────────────────────┤ │
│                                      │ store/ (better-sqlite3)│ │
│                                      └────────────────────────┘ │
│                                              │                  │
│  Worker Thread                               │                  │
│  ┌───────────────────────┐                   ▼                  │
│  │ file-watcher/         │         ┌──────────────────┐        │
│  │ (@parcel/watcher)     │         │ Claude Agent SDK │        │
│  └───────────────────────┘         │ (agent loop)     │        │
│                                    └──────────────────┘        │
│                                              │                  │
│                                    ┌──────────────────┐        │
│                                    │ ~/.halo/ (SQLite) │        │
│                                    └──────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

Key architectural details:

- **Claude Agent SDK integration:** Direct dependency on `@anthropic-ai/claude-agent-sdk` (v0.1.76) for the core agent loop — the same SDK Anthropic provides for programmatic Claude Code usage.
- **Space System:** Isolated workspaces per project (each with own files, conversations, context). Conceptually similar to our per-business-line isolation.
- **Digital Human Protocol (DHP):** `spec.yaml` defines agents declaratively — system prompt, cron subscriptions, MCP tool requirements, memory schema, output channels. Registry at `openkursar/digital-human-protocol`. Agent types: `automation` (background), `skill` (on-demand), `mcp` (server wrapper), `extension` (UI).
- **AI Browser:** CDP-based embedded browser for web scraping, form filling, testing — via `ai-browser/` service.
- **Remote Access:** Cloudflare tunnel (`cloudflared` npm package) + HTTP server enables phone/tablet access.
- **File Watching:** Dedicated worker thread with `@parcel/watcher` for real-time artifact tracking.
- **Multi-provider:** OpenAI-compatible router proxies requests to Anthropic, OpenAI, DeepSeek, etc.
- **Storage:** SQLite via `better-sqlite3` for conversations, spaces, and agent state. Local-only.

---

## Publisher Background

**OpenKursar** is a small organization (6 visible contributors) with the primary developer being `openkursar-flynn`. The origin story describes a solo developer who built the first version "in a few hours" to solve personal frustrations with Claude Code's CLI-only nature, then iterated using Halo itself ("100% built by Halo itself"). The project has Chinese-language contributors and bilingual docs (EN/ZH/ES/DE/FR/JA), suggesting a strong Chinese developer community base.

No prior notable open-source projects from this org. The related `digital-human-protocol` repo is their other significant project. The 624 stars and 70 forks in ~2 months since creation (Jan 2026) shows solid traction for a niche tool. Active development with v2.0.8 released on 2026-03-08.

Found via `@aratahikaru0`'s collection post (curator/aggregator in the Claude Code ecosystem).

---

## What's Valuable for Us

1. **Digital Human Protocol (DHP) — spec.yaml schema** *(Most Interesting)*

   The DHP's declarative agent specification is a clean pattern worth studying:

   ```yaml
   # DHP spec.yaml structure
   system_prompt: "..."
   subscriptions:
     - type: schedule
       cron: "0 8 * * *"     # deterministic trigger
   requires:
     - type: mcp
       name: browser         # capability declaration
   memory_schema:            # persistent state across runs
     last_checked: datetime
   output:
     - type: webhook
       url: "..."
   config_schema:            # user-configurable params
     api_key: { type: string, required: true }
   ```

   This maps loosely to what our task state schema needs: declarative definitions of *what* an agent does, *when* it triggers, *what tools* it needs, and *what state* it persists. The separation of spec (portable, shareable) from runtime (execution environment) is a clean architectural boundary.

2. **Agent Type Taxonomy:** Their four agent types (`automation`, `skill`, `mcp`, `extension`) are a useful categorization we could adopt for classifying our own agent definitions — background autonomous vs. on-demand invocable vs. infrastructure wrapper.

3. **Multi-provider Router:** The `openai-compat-router/` pattern for proxying requests to multiple LLM providers through a unified interface is a solved pattern if we ever need model-level routing beyond Claude.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Electron Desktop GUI** | Our Master Blueprint explicitly states "adding a custom interface is UI work that generates zero revenue." Terminal + Notion is our interface layer. |
| **Remote Access (Cloudflare tunnels)** | We use tmux + SSH/Tailscale for remote agent access — zero infrastructure overhead. |
| **AI Browser (CDP)** | We already have Chrome DevTools MCP for browser automation. An embedded browser adds complexity without benefit. |
| **Artifact Rail / File Previews** | Visual file browsing is a human comfort feature. Our agents work autonomously; humans review PRs, not file previews. |
| **Space System** | We achieve workspace isolation through git worktrees + business-line separation, not GUI-managed "spaces." |
| **Digital Human Store** | Marketplace model requires ecosystem scale we don't need. Our agents are custom-built for specific business lines. |
| **Multi-provider support** | We're Claude-native. The 70/30 deterministic/LLM split means we optimize for one model, not abstract across many. |

**Governing Principle conflicts:**
- **#2 (Deterministic orchestration, LLM execution):** Halo has no deterministic orchestration layer — the user is the routing layer, or DHP agents run on simple cron triggers.
- **#3 (Context is zero-sum):** Halo's "Space" isolation is per-project UI organization, not the architectural context separation our blueprint mandates between business context and code context.
- **#5 (Human review is binding constraint):** Halo *increases* human interaction surface area (GUI, artifact previews, chat). Our architecture *minimizes* it.
- **#7 (Build only what you needed in the last 30 days):** We have not needed a GUI for Claude Code in 60+ days of L-Thread operation.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No adoption. Nothing needed here.
- **Phase 2 (Days 4-60):** Study the DHP `spec.yaml` schema when designing our declarative task/agent definition format. The `subscriptions` + `requires` + `memory_schema` structure is a clean reference.
- **Phase 3 (Days 60-90):** If we ever need to onboard non-technical users (client stakeholders) to interact with agents, Halo's approach of wrapping Claude Code in a GUI is the reference implementation. But this is a big "if."
- **Phase 4 (Days 90+):** If agent marketplace / agent sharing becomes relevant, the DHP registry pattern (spec.yaml + GitHub-based publishing) is worth revisiting.

---

## Key Takeaway

> **Halo is a polished Claude Code GUI wrapper solving the accessibility problem, not the orchestration problem — its only architecturally interesting contribution is the Digital Human Protocol's declarative spec.yaml pattern for defining autonomous agents, which is a useful reference when we formalize our own task/agent definition schema.**
