# Page Agent

> **JavaScript in-page GUI agent. Control web interfaces with natural language.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Browser Automation |
| Repository | [github.com/alibaba/page-agent](https://github.com/alibaba/page-agent) |
| GitHub Stars | 5,795 (as of 2026-03-12) |
| Publisher | Alibaba — bigtech (Alibaba Group, NYSE: BABA) |
| License | MIT |
| Tech Stack | TypeScript, JavaScript, DOM APIs, OpenAI-compatible LLM APIs |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *(Personal observations go here.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Strong fit for the SaaS factory line — deploying AI copilots inside existing web apps (gov admin panels, CRM, ERP) without backend rewrites. BYOK + zero-infra + MIT license matches our architecture principles exactly. Not a multi-agent orchestration tool, but a powerful delivery layer for client-facing agentic features. |
| **Novelty** | 8/10 | In-page JavaScript agent is genuinely novel. All other catalogued browser agents (agent-browser, Bowser, Rodney) rely on Playwright/Puppeteer/CDP or are server-side. Page Agent runs inside the DOM itself — no external process, no screenshots, no vision models. Acknowledges browser-use as ancestor but solves a fundamentally different problem (client-side enhancement vs server-side automation). |
| **Actionable** | 7/10 | `npm install page-agent` and 3 lines of code for a working copilot. The quick-start CDN link enables same-day evaluation. Free demo LLM API for technical evaluation. The DashScope/Qwen native integration matters less than the OpenAI-compatible BYOK — any model including our antigravity proxy at 127.0.0.1:8045 should work. |

---

## Overview

Page Agent is an in-page JavaScript GUI agent from Alibaba that lets natural language commands drive any web interface. Unlike all other catalogued browser automation tools, it runs entirely inside the webpage's JavaScript context — no external process, no Chrome DevTools Protocol, no Python backend, no screenshots. A single `<script>` tag or `npm install page-agent` is the entire integration surface.

The core mechanic is text-based DOM manipulation: the agent reads the DOM as structured text and issues standard DOM API calls to interact with UI elements. This eliminates the need for vision models, OCR, or multi-modal LLMs entirely — any standard OpenAI-compatible API endpoint can drive it. The library is fully BYOK: GPT, Claude, Gemini, Qwen, or any compatible model. A built-in human-in-the-loop UI ships out of the box, and an optional Chrome extension extends the agent's reach to multi-tab or cross-domain tasks.

Built on the DOM interaction patterns from `browser-use` (acknowledged in the README), Page Agent pivots that work toward client-side web enhancement rather than server-side automation. The distinction is architecturally significant: Page Agent is designed to be embedded by the web app developer into their own product, not deployed externally by an automation engineer. This makes it the closest thing to a drop-in AI copilot SDK for existing web applications. 5,795 GitHub stars in roughly 6 months (repo created 2025-09-23) signals genuine market pull.

---

## Technical Architecture

```
Browser Page
├── page-agent.js (loaded via <script> or npm)
│   ├── DOM Scanner — text-based element extraction (no screenshots)
│   ├── LLM Client — OpenAI-compatible API calls (BYOK)
│   │   └── Supports: GPT, Claude, Qwen (DashScope), any compatible endpoint
│   ├── Action Executor — standard DOM API calls (click, fill, navigate)
│   ├── Human-in-the-Loop UI — built-in visual overlay for approval gates
│   └── PageAgent.execute(naturalLanguageCommand) — public API
└── Optional: Chrome Extension
    └── Multi-tab / multi-page agent task coordination
```

Key design decisions:
- **No screenshots / no vision** — text DOM → LLM prompt → DOM action loop; keeps token costs low and avoids vision-model dependencies
- **In-process only** — everything runs in the browser's JS engine; no backend required; no WebSocket to an external process
- **OpenAI-compatible BYOK** — `baseURL` + `apiKey` constructor params; works with any provider or proxy (including LiteLLM, antigravity)
- **CDN demo mode** — free testing LLM API for eval (ToS-limited); `page-agent.demo.js` build serves as zero-setup entry point
- **browser-use lineage** — DOM processing components and prompts derived from browser-use (MIT, Gregor Zunic); credited in README

---

## Publisher Background

Alibaba Group (NYSE: BABA) is one of the largest technology companies globally. This repo lives under the `alibaba` GitHub org alongside Qwen (model family), Zvec (in-process vector DB — also in our catalogue), and DAMO Academy research outputs. The Page Agent team builds on top of Alibaba's DashScope API and Qwen models, but the library is designed to be model-agnostic. The MIT license and the absence of any Alibaba-specific lock-in suggests this is a genuine open-source contribution rather than a DashScope funnel.

Relevant: Alibaba previously open-sourced Zvec (in-process vector DB, 8.9K stars) catalogued in our posts section. Both share the zero-infrastructure, embedded-first philosophy.

---

## What's Valuable for Us

**SaaS Factory — AI Copilot Layer**: The most direct application. For any gov SaaS client or internal tool we build, Page Agent can add a natural language command layer in hours rather than days. No backend changes, no new infrastructure, BYOK so we control model routing and cost. The `$30/month copilot` business model cited in the viral X post is exactly what clients expect.

**Lead Gen Swarm — Lightweight Web Interaction**: For tasks where our orchestrator needs to interact with web UIs (form fills, data extraction from SaaS dashboards), Page Agent eliminates the Playwright/Puppeteer setup overhead. Because it runs in-page, it also sidesteps headless browser detection. Trade-off: requires the target page to load our script, which means it works for pages we control or can inject into, not arbitrary third-party sites.

**BYOK + Antigravity Proxy**: The `baseURL` constructor parameter accepts any OpenAI-compatible endpoint. Our antigravity proxy at `127.0.0.1:8045` should work directly — meaning we can drive Page Agent with $0 Claude/Gemini/GPT tokens for evaluation and lower-priority tasks.

**Human-in-the-Loop Pattern**: The built-in HITL UI overlay is a pattern worth studying for our own agent review gates. It shows how to surface agent intent to a human approver without breaking the in-page execution flow.

---

## What's NOT Relevant

**Multi-agent orchestration**: Page Agent is a single-agent tool. It has no concept of agent teams, task delegation, or inter-agent communication. Not a replacement for any component of our L-Thread Orchestrator.

**Server-side automation**: By design, Page Agent cannot run headlessly or be driven from a server process without a real browser context. For our CI/E2E testing pipeline, agent-browser (Vercel Labs, 19.9K stars) or Rodney remain better choices.

**Arbitrary web scraping**: Page Agent requires embedding the script into the page. For pages we don't control (competitor research, third-party data ingestion), server-side tools remain necessary.

---

## Future Use Cases

- **Phase 1 (immediate)**: Evaluate as AI copilot layer for any web UIs we build for gov SaaS contracts. 3-line integration, BYOK — low-risk technical eval.
- **Phase 2 (Days 4-60)**: Package as a reusable "copilot skill" deliverable for clients. Bundle with Claude/Gemini via antigravity proxy for zero-marginal-cost copilot features.
- **Phase 3 (Days 60-90)**: Explore Chrome extension mode for multi-tab orchestration tasks where our agent swarm needs to navigate across web properties we manage.
- **Phase 4 (Days 90+)**: If we build public-facing SaaS products (SaaS factory line), Page Agent becomes the default copilot integration — faster than any custom solution and already battle-tested.

---

## Key Takeaway

> **Page Agent is the fastest path to shipping an AI copilot inside any web app — in-page JavaScript, BYOK, zero backend, MIT licensed — making it the default choice for adding natural language control to gov SaaS client interfaces.**
