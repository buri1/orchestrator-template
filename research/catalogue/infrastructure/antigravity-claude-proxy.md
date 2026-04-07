# Antigravity Claude Proxy

> **Proxy server that exposes an Anthropic-compatible API backed by Antigravity's Cloud Code, letting you use Claude and Gemini models with Claude Code CLI and OpenClaw/ClawdBot**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [badrisnarayanan/antigravity-claude-proxy](https://github.com/badrisnarayanan/antigravity-claude-proxy) |
| GitHub Stars | 3,082 (as of 2026-03-08) |
| Publisher | Badri Narayanan S (solo developer) |
| License | MIT |
| Tech Stack | Node.js (ES modules), Express, Alpine.js + Tailwind CSS (WebUI), Google OAuth 2.0 + PKCE |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Solves cost arbitrage for Claude Code usage by routing through Google's Antigravity Cloud Code, but we already run on Claude Max ($200/mo flat rate) which eliminates the cost problem entirely. No architectural patterns map to our Master Blueprint. |
| **Novelty** | 4/10 | The Anthropic-to-Google format conversion and multi-account load balancing are well-engineered, but conceptually this is a standard API proxy pattern. The thinking signature cross-model handling is the most technically interesting piece. |
| **Actionable** | 2/10 | Not actionable for us. We pay for Claude Max directly, so proxying through free Google accounts adds latency, ToS risk, and zero benefit. The load-balancing strategy patterns are mildly interesting as reference but not worth adopting. |

---

## Overview

Antigravity Claude Proxy is a local Node.js proxy server that sits between Claude Code CLI and Google's Antigravity Cloud Code service. It receives requests in Anthropic Messages API format, transforms them to Google Generative AI format with Cloud Code wrapping, sends them to `daily-cloudcode-pa.sandbox.googleapis.com`, and converts responses back to Anthropic format. The net effect: you can run Claude Code CLI with Claude Opus 4.6, Claude Sonnet 4.6, or Gemini models without paying Anthropic directly -- the compute runs on Google's Antigravity infrastructure using linked Google accounts.

The proxy supports multi-account load balancing with three strategies (hybrid, sticky, round-robin), a full web management UI (Alpine.js + Tailwind + DaisyUI), OAuth-based Google account linking, quota tracking, model fallback chains, and cross-model thinking signature handling. It is distributed as an npm package (`npx antigravity-claude-proxy@latest start`) and runs as a background process on `localhost:8080`.

The project has grown rapidly to 3,000+ stars and 413 forks, driven by the appeal of free Claude Code usage. However, Google has been issuing ToS violation bans on accounts using this proxy, making it a significant risk for production use.

---

## Technical Architecture

```
┌──────────────────┐     ┌─────────────────────────┐     ┌────────────────────────┐
│   Claude Code    │────▶│  Antigravity Proxy       │────▶│  Google Cloud Code API │
│   (Anthropic     │     │  (localhost:8080)         │     │  (Antigravity)         │
│    API format)   │     │                           │     │                        │
└──────────────────┘     └─────────────────────────┘     └────────────────────────┘
```

**Core Components:**

- **`src/server.js`** — Express server exposing Anthropic-compatible endpoints (`/v1/messages`, `/v1/models`, `/health`, `/account-limits`)
- **`src/format/`** — Bidirectional format conversion: `request-converter.js` (Anthropic → Google), `response-converter.js` (Google → Anthropic), `content-converter.js` (message content), `schema-sanitizer.js` (JSON Schema cleaning for Gemini), `signature-cache.js` (cross-model thinking signature cache)
- **`src/cloudcode/`** — Cloud Code API client with streaming/non-streaming handlers, SSE parsing, session management (SHA256 hash of first user message for cache continuity), rate limit tracking
- **`src/account-manager/`** — Multi-account pool with pluggable strategy pattern:
  - `hybrid-strategy.js` — Scoring formula: `(Health x 2) + ((Tokens/MaxTokens x 100) x 5) + (Quota x 1) + (LRU x 0.1)` with emergency/last-resort fallback
  - `sticky-strategy.js` — Cache-optimized, stays on same account until rate-limited >2min
  - `round-robin-strategy.js` — Simple rotation, skips unavailable accounts
  - Trackers: `health-tracker.js`, `token-bucket-tracker.js` (50 tokens, 6/min regen), `quota-tracker.js`
- **`src/auth/`** — Google OAuth 2.0 with PKCE, legacy SQLite token extraction from Antigravity desktop app, auto-rebuild for native modules (`better-sqlite3`)
- **`src/webui/`** — SPA management interface with real-time dashboard (Chart.js), live log streaming (SSE), Claude CLI config editor, i18n (5 languages)

**Data Model (`accounts.json`):**
Each account stores: email, source (oauth/manual/database), enabled flag, refreshToken/apiKey, subscription tier (free/pro/ultra auto-detected), per-model quota cache (`remainingFraction` + `resetTime`), three-tier quota thresholds (per-model > per-account > global), model-specific rate limits (in-memory), validity state.

**Model Fallback Chain:**
When `--fallback` is enabled and all accounts are exhausted for a model, it falls back to alternate models (e.g., `claude-sonnet-4-6-thinking` → `gemini-3-flash`). Disabled on recursive calls to prevent infinite chains.

---

## Publisher Background

Badri Narayanan S is a solo developer based in India. His other public projects are small-scale Flutter apps (college placement automation, catering order printing) and a Chrome extension (`default.wtf` — Google account switcher). The antigravity-claude-proxy is his breakout project by far, with 3,082 stars vs. single-digit stars on everything else. The project has a second significant contributor (jgor20, 137 commits) and a handful of minor contributors. No funding or company backing is evident -- this is a community-driven open-source project.

The project is actively maintained (v2.7.7, last push 2026-03-07), with a comprehensive CLAUDE.md, detailed docs, and a thorough test suite. The codebase quality is solid for a solo project: proper strategy pattern, modular architecture, structured logging, custom error classes, and defensive coding (native module auto-rebuild, cache control stripping).

---

## What's Valuable for Us

**Very little is directly useful.** The tool solves a problem we do not have (cost of Claude Code usage) by introducing a risk we should not take (ToS violations on Google accounts).

That said, two patterns are mildly worth noting as reference:

1. **Multi-account load balancing strategy pattern** (`src/account-manager/strategies/`) — The pluggable strategy pattern (hybrid/sticky/round-robin) with health tracking, token bucket rate limiting, and emergency fallback is a clean implementation. If we ever need to distribute work across multiple API keys or accounts (e.g., scaling beyond Claude Max limits), the scoring formula and fallback cascade are well-designed. However, our Master Blueprint principle #4 (coordination overhead at exponent 1.724) argues against the complexity of managing account pools when a single flat-rate subscription suffices.

2. **Cross-model thinking signature handling** (`src/format/signature-cache.js`, `src/format/thinking-utils.js`) — The proxy handles switching between Claude and Gemini models mid-conversation by detecting and dropping incompatible thinking signatures, injecting synthetic messages to close interrupted tool loops. This is a niche problem but the implementation shows what happens when you try to make different model families interoperate in multi-turn conversations. Instructive if we ever consider multi-model agent routing (Phase 4+ per roadmap).

---

## What's NOT Relevant

- **The entire core value proposition.** We use Claude Max at $200/mo flat rate. Proxying through free Google accounts to avoid paying Anthropic creates ToS risk, adds latency, removes official support, and introduces a failure mode (Google bans) that does not exist with a direct subscription. Master Blueprint Principle #7 ("Build only what you have needed in the last 30 days") -- we have never needed cheaper Claude access.

- **The Antigravity/Google Cloud Code dependency.** This proxy is tightly coupled to a specific Google service (Antigravity Cloud Code) that can be shut down or rate-limited at Google's discretion. The ToS warning in the README itself confirms this is not a stable foundation. Our architecture requires stable infrastructure (Master Blueprint Principle #2 -- deterministic infrastructure, no guessing).

- **WebUI management interface.** While polished (Alpine.js + Tailwind + Chart.js dashboard), it manages accounts and quotas for a problem we don't have. Our observability needs are served by ccusage, Langfuse, and the L-Thread state files.

- **Gemini model support.** We are committed to Claude models for coding agents. The Anthropic-to-Google-to-Anthropic format conversion pipeline is impressive engineering but irrelevant to our stack.

---

## Future Use Cases

- **Phase 1-3 (Days 1-90):** No use case. Claude Max flat rate covers all needs.
- **Phase 4+ (Days 90+):** If scaling to many concurrent agent teams exceeds Claude Max capacity, the multi-account load balancing patterns (not this specific proxy) could inform how we distribute API calls across multiple subscriptions. But at that point, LiteLLM (already in our catalogue at 8/10 relevance) is the far superior choice -- it supports 100+ providers, has enterprise backing, and carries no ToS risk.

---

## Key Takeaway

> **A well-engineered API proxy that solves cost arbitrage for Claude Code users who don't have Claude Max, but carries meaningful ToS risk and provides zero value to teams already on a flat-rate subscription -- file under "interesting engineering, wrong problem for us."**
