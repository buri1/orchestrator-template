# Office Agents SDK

> **Headless SDK for Office Agents — agent runtime, tools, storage, VFS, skills, OAuth, and provider config for building AI-powered Office Add-ins**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [hewliyang/office-agents](https://github.com/hewliyang/office-agents) |
| GitHub Stars | 239 (as of 2026-03-09) |
| Publisher | Li Yang (hewliyang) — solo developer, Singapore |
| License | MIT |
| Tech Stack | TypeScript (97.4%), pnpm monorepo, React, IndexedDB, SES (sandboxed eval), Office.js, pi-agent-core |
| Maturity | 🟡 Early (v0.0.4, explicitly "not production-ready", 97 commits) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *Browser-only agent runtime for MS Office. Interesting as a vertical application of agent patterns into a non-coding domain (spreadsheets, presentations). Uses pi-agent-core under the hood which links it to the Pi ecosystem. The BYOK multi-provider approach is solid. Not directly useful for our orchestration work, but the "agent inside existing productivity software" pattern is relevant for the SaaS factory vision -- imagine shipping Office Add-ins as a product line. The viral growth (100 to 239 stars in ~24 hours on March 8-9) suggests real demand for AI-in-Office tooling.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Office Add-in domain is orthogonal to our orchestrator/dev-agent focus; BYOK multi-provider pattern is already well-covered in catalogue |
| **Novelty** | 5/10 | Browser-only VFS + SES sandbox + Office.js integration is a novel combination; pi-agent-core dependency is interesting ecosystem signal |
| **Actionable** | 3/10 | No patterns we can directly adopt for L-Thread; possible SaaS factory product template in distant future |

---

## Overview

Office Agents is a TypeScript monorepo providing AI chat capabilities inside Microsoft Office Add-ins (Excel and PowerPoint). The core `@office-agents/sdk` package delivers a headless agent runtime that runs entirely in the browser, using IndexedDB for persistence and a virtual filesystem with bash shell emulation for file operations.

The system supports "bring your own key" authentication across 9+ API providers (OpenAI, Anthropic, Google, Azure, OpenRouter, Groq, xAI, Cerebras, Mistral) plus OAuth flows for Claude Pro/Max and ChatGPT Plus/Pro subscriptions, plus custom endpoints (Ollama, vLLM, LMStudio). This makes it the most provider-agnostic Office AI tool available.

The SDK architecture follows a modular design: AgentRuntime manages lifecycle and streaming, tools are defined via TypeBox schemas, a virtual filesystem provides bash-like operations, and an installable skills system allows extending capabilities. Sandboxed JavaScript evaluation is handled via SES (Secure ECMAScript).

---

## Technical Architecture

The monorepo contains four packages:

| Package | Purpose |
|---------|---------|
| `@office-agents/sdk` | Headless runtime: agent lifecycle, tools, VFS, storage, OAuth, skills, web search, sandbox |
| `@office-agents/core` | React-based chat UI with settings and session management |
| `@office-agents/excel` | Excel add-in with spreadsheet tools and Office.js integration |
| `@office-agents/powerpoint` | PowerPoint add-in with slide/OOXML manipulation |

Key architectural decisions:
- **Browser-only**: No server required; IndexedDB + localStorage for all persistence
- **VFS with bash**: In-memory virtual filesystem with shell emulation (via `just-bash`)
- **SES sandbox**: Secure ECMAScript for safe JavaScript evaluation in-browser
- **pi-agent-core dependency**: Uses `@mariozechner/pi-agent-core` and `@mariozechner/pi-ai` — linking this into the Pi Agent ecosystem
- **Document processing**: mammoth (Word), xlsx (Excel), pdfjs-dist (PDF), turndown (HTML-to-MD)
- **Web search**: DuckDuckGo, Brave, Serper, Exa providers
- **PKCE OAuth**: For Claude Pro/Max and ChatGPT Plus/Pro subscription-based access

---

## Publisher Background

Li Yang (hewliyang) is a solo developer based in Singapore with 61 followers and 63 public repos. No visible company affiliation or funding. The project has one other contributor (jlokos). The repo was created on 2026-01-31, reached 100 stars by 2026-03-08, then surged to 239 stars in ~24 hours (March 8-9), likely driven by a social media post or HN appearance. The "not production-ready" disclaimer suggests this is a passion project / reference implementation rather than a commercial venture.

### Star History
- First star: 2026-02-01
- 100 stars: 2026-03-08 (~5 weeks)
- 239 stars: 2026-03-09 (viral day — 139 stars in ~24h)

---

## What's Valuable for Us

1. **Pi ecosystem signal**: The dependency on `@mariozechner/pi-agent-core` and `@mariozechner/pi-ai` demonstrates Pi Agent being adopted as a runtime foundation outside the CLI/dev-agent space. This strengthens the case for Pi Agent as a long-term ecosystem bet.

2. **Browser-only VFS pattern**: The virtual filesystem with bash emulation running entirely in the browser (via `just-bash` + IndexedDB) is an interesting sandboxing approach. If we ever need to run agent tools in a browser context (e.g., for a dashboard or GUI), this is a reference implementation.

3. **SaaS factory template**: An Office Add-in with AI capabilities is a viable product category. The BYOK model means zero API cost for the publisher. Could be a template for rapid SaaS launches targeting the Office ecosystem.

4. **Multi-provider BYOK reference**: The provider configuration system supporting 9+ API providers + OAuth + custom endpoints is the most comprehensive BYOK implementation catalogued. Reference for any multi-provider tool.

---

## What's NOT Relevant

- **Office.js / Add-in infrastructure**: Our work is CLI-first, server-side agent orchestration. The Office Add-in integration (manifest files, sideloading, OOXML manipulation) is a completely different domain.
- **Browser-only constraint**: Our architecture uses git, tmux, filesystem, and server-side processes. A browser-only runtime with IndexedDB is architecturally opposite to our approach.
- **No multi-agent orchestration**: This is a single-agent runtime. No coordination, no task delegation, no parallel execution — the core of what we build.
- **Early maturity**: v0.0.4 with explicit "not production-ready" disclaimer. Not suitable for adoption.

---

## Future Use Cases

- **Phase 4 (Days 90+)**: If the SaaS factory launches Office-focused products, this could serve as a starter template. The BYOK model + MIT license makes it trivially forkable.
- **Distant future**: If we build a web-based dashboard for orchestrator monitoring, the browser-only VFS + agent runtime patterns could inform the architecture.

---

## Key Takeaway

> **A browser-only AI agent runtime for Office Add-ins that validates Pi Agent adoption outside CLI tooling and demonstrates the BYOK multi-provider pattern, but has zero relevance to multi-agent orchestration.**
