# Hyperbrowser

> **Hyperagent is Playwright supercharged with AI. No more brittle scripts, just powerful natural language commands.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [hyperbrowserai/HyperAgent](https://github.com/hyperbrowserai/HyperAgent) |
| GitHub Stars | 1,100 (as of 2026-03-08) |
| Publisher | Hyperbrowser (startup — YC S21, 4-person team, backed by Accel + SV Angel) |
| License | MIT |
| Tech Stack | TypeScript, Playwright, multi-LLM (OpenAI/Anthropic/Gemini/DeepSeek) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Browser automation is a second-order concern — we orchestrate coding agents, not web scrapers. Becomes relevant only if lead-gen or marketing agents need reliable web access. |
| **Novelty** | 5/10 | The two-tier API design (fast `page.perform()` vs. smart `page.ai()`) and action caching for deterministic replay are genuinely clever patterns we haven't seen formalized this way. |
| **Actionable** | 3/10 | Nothing we can adopt this week. The action caching concept is interesting for our Chrome DevTools E2E testing, but the tool solves a different problem (web scraping at scale). |

---

## Overview

Hyperbrowser provides cloud browser infrastructure for AI agents — managed Chromium instances with built-in CAPTCHA solving, proxy rotation, and anti-bot detection. Their open-source component, **HyperAgent**, wraps Playwright with AI capabilities so agents can interact with web pages using natural language instead of brittle CSS selectors.

The key design insight is the **two-tier action model**: `page.perform()` uses the accessibility tree for fast, cheap, single-LLM-call actions ("click the login button"), while `page.ai()` uses screenshots and visual understanding for complex multi-step workflows that need adaptive reasoning. This lets developers choose the right tool for each interaction — deterministic speed when possible, AI reasoning when necessary.

HyperAgent also supports **action caching** — recording AI-driven workflows and replaying them deterministically without LLM calls. This is essentially the 70/30 pattern (deterministic where possible, LLM when needed) applied to browser automation. The tool functions as a full MCP client, connecting to external tool servers for extended capabilities.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│              HyperAgent (TypeScript)             │
│                                                  │
│  ┌─────────────┐    ┌───────────────────────┐   │
│  │  page.ai()  │    │  page.perform()       │   │
│  │  (visual +  │    │  (a11y tree only,     │   │
│  │  screenshots│    │   single LLM call,    │   │
│  │  multi-step)│    │   fast + cheap)       │   │
│  └──────┬──────┘    └──────────┬────────────┘   │
│         │                      │                 │
│  ┌──────┴──────────────────────┴──────────┐     │
│  │          LLM Provider Layer            │     │
│  │   OpenAI | Anthropic | Gemini | DeepSeek│     │
│  └──────────────────┬────────────────────┘     │
│                     │                           │
│  ┌──────────────────┴────────────────────┐     │
│  │         Playwright Engine              │     │
│  │   + Stealth patches + MCP Client       │     │
│  └──────────────────┬────────────────────┘     │
│                     │                           │
│  ┌──────────────────┴────────────────────┐     │
│  │         Action Cache Layer             │     │
│  │   Record → Replay (no LLM needed)     │     │
│  └───────────────────────────────────────┘     │
└─────────────────────┬───────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │  Local Chromium  OR   │
          │  Hyperbrowser Cloud   │
          │  (scalable sessions)  │
          └───────────────────────┘
```

Key components:
- **Core APIs:** `agent.executeTask()` (high-level), `page.ai()` (visual multi-step), `page.perform()` (fast single action), `page.extract()` (structured data extraction with Zod schemas)
- **LLM flexibility:** Provider-agnostic, supports 4+ LLM backends
- **Cloud scaling:** Optional Hyperbrowser cloud integration for hundreds of concurrent browser sessions
- **MCP integration:** Full MCP client support for connecting to external tool servers (e.g., Composio)
- **97 commits** on main branch, npm package `@hyperbrowser/agent`

---

## Publisher Background

Hyperbrowser is a **YC Summer 2021** company based in San Francisco with a 4-person team. They're backed by Y Combinator, Accel, and SV Angel. Founded in 2021, they pivoted to AI agent infrastructure as the LLM wave arrived. The team is small but well-funded and focused. Their commercial offering (managed browser cloud) subsidizes the open-source HyperAgent framework. Having YC + Accel backing means they're likely to persist and iterate, though the small team size limits velocity.

---

## What's Valuable for Us

1. **Two-Tier Action Pattern (Deterministic vs. AI)**

   The `perform()` vs `ai()` split maps directly to our 70/30 principle. When we eventually build web-interacting agents (lead gen, marketing), this pattern of "use the cheap/fast/deterministic path first, fall back to AI reasoning only when needed" is exactly right.

2. **Action Caching for Replay**

   Recording AI-driven workflows and replaying them without LLM calls is a powerful pattern. We could apply this concept to our E2E testing pipeline — record a Chrome DevTools test flow once with AI assistance, then replay deterministically in CI.

3. **Structured Extraction with Zod Schemas**

   `page.extract()` with Zod schemas for typed data extraction is a clean API pattern. If our agents ever need to pull structured data from web pages, this is the right abstraction.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Cloud browser scaling** | We don't run hundreds of concurrent browser sessions. Our E2E testing uses a single Chrome DevTools MCP connection. |
| **Anti-bot / CAPTCHA solving** | We're testing our own apps, not scraping protected sites. |
| **Proxy management** | No need for IP rotation in our use case. |
| **Web scraping at scale** | Not part of our current or near-term roadmap. |

**Governing Principle conflicts:**
- **Context Separation:** Browser automation context is far from our coding agent orchestration context. Mixing these would violate the Elvis Sun principle.
- **Terminal-first:** Our architecture uses Chrome DevTools MCP for testing, not a separate browser automation framework.

---

## Future Use Cases

- **Phase 1 (Days 1–3):** Nothing.
- **Phase 2 (Days 4–60):** Study the action caching concept for making our E2E test flows more deterministic and replayable.
- **Phase 3 (Days 60–90):** If lead-gen or marketing agent swarms need web interaction, HyperAgent + Hyperbrowser cloud is the right infrastructure choice.
- **Phase 4 (Days 90+):** Full lead-gen pipeline with scalable browser sessions could use this as the browser layer.

---

## Key Takeaway

> **Hyperbrowser is the right infrastructure choice if you need AI-powered web automation at scale, but that's not our problem today. The two-tier action model (deterministic-first, AI-fallback) and action caching for replay are transferable patterns worth studying when we build web-facing agents.**
