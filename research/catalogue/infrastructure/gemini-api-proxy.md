# Gemini API Proxy

> **OpenAI/Anthropic Compatible API to proxy GEMINI Code Assist/CLI**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [IT-BAER/gemini-api-proxy](https://github.com/IT-BAER/gemini-api-proxy) |
| GitHub Stars | 11 (as of 2026-03-08) |
| Publisher | IT-BAER (solo, sysadmin/homelabber) |
| License | MIT |
| Tech Stack | Python 3.11+ (FastAPI, uvicorn, Pydantic), Docker |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Solves model cost arbitrage by routing Claude-format requests to free Gemini Code Assist tier — interesting for experimentation but uses undocumented internal Google APIs, making it unsuitable for production or gov contract work |
| **Novelty** | 5/10 | The dual OpenAI+Anthropic translation layer to Google's internal `cloudcode-pa.googleapis.com/v1internal` endpoint is clever reverse engineering; PKCE OAuth flow for Code Assist auth is novel; but the general proxy pattern is well-covered by LiteLLM |
| **Actionable** | 3/10 | Could theoretically point Claude Code at this to use Gemini models for low-stakes tasks, but ToS violation risk and account termination threat make it a non-starter for any serious workflow; the translation layer code itself is a useful reference for format conversion patterns |

---

## Overview

Gemini API Proxy is a Python reverse proxy that intercepts OpenAI- and Anthropic-formatted API requests and translates them into calls to Google's **undocumented internal** Gemini Code Assist API (`cloudcode-pa.googleapis.com/v1internal:streamGenerateContent`). This lets tools that speak the OpenAI or Anthropic protocols (including Claude Code itself) route requests through free or discounted Gemini models instead.

The proxy handles the full translation chain: request format conversion (roles, message structure, tool calls), streaming SSE translation (Gemini SSE to OpenAI delta chunks or Anthropic event streams), OAuth token management with PKCE and automatic refresh, and model aliasing (e.g., `claude-3.5-sonnet` maps to `gemini-2.5-pro`). It includes a built-in usage dashboard, rate limiting with queue mode, and mock embeddings for client compatibility.

The critical design choice is targeting Google's **internal** Code Assist API rather than the public Gemini API. This gives access to potentially higher quotas and free-tier usage that comes with Google accounts, but it explicitly violates Google's Terms of Service. The README itself warns of account suspension, rate limit enforcement, and termination risks.

---

## Technical Architecture

```
┌──────────────────────────────────┐
│         Client Application       │
│  (Claude Code, n8n, any OpenAI   │
│   or Anthropic-compatible app)   │
└──────────┬───────────┬───────────┘
           │           │
    OpenAI format  Anthropic format
           │           │
           ▼           ▼
┌──────────────────────────────────┐
│      FastAPI Proxy (app.py)      │
│                                  │
│  /v1/chat/completions (OpenAI)   │
│  /v1/messages (Anthropic)        │
│  /v1/embeddings (mock)           │
│  /v1/models (dynamic list)      │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Request Translation Layer  │  │
│  │ - Role mapping             │  │
│  │ - Message restructuring    │  │
│  │ - Tool call conversion     │  │
│  │ - System prompt injection  │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Rate Limiter (threading)   │  │
│  │ - Configurable delay       │  │
│  │ - Wait vs reject mode      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ OAuth + PKCE Manager       │  │
│  │ - Token file persistence   │  │
│  │ - Auto-refresh on 401      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Usage Tracker (in-memory)  │  │
│  │ - deque(maxlen=100)        │  │
│  │ - Daily reset              │  │
│  │ - HTML dashboard at /      │  │
│  └────────────────────────────┘  │
└──────────────┬───────────────────┘
               │
      Translated Gemini format
               │
               ▼
┌──────────────────────────────────┐
│  Google Internal API             │
│  cloudcode-pa.googleapis.com     │
│  /v1internal:streamGenerateContent│
│  (SSE streaming)                 │
└──────────────────────────────────┘
```

### Key Implementation Details

- **Single file architecture**: Everything in `app.py` — routes, translation, auth, dashboard
- **Model aliasing** via `MODEL_ALIASES` dict: maps `gpt-4` / `claude-3-opus` / `claude-3.5-sonnet` to Gemini equivalents; falls back to pattern matching (`flash`/`lite`/`mini` → `gemini-2.5-flash`, everything else → `gemini-2.5-pro`)
- **Streaming translation**: Consumes Gemini SSE (`data: {json}` lines), emits either OpenAI delta chunks or Anthropic event stream (`message_start` → `content_block_delta` → `message_stop`)
- **Token estimation fallback**: `char_count / 4` when `usageMetadata` missing from Gemini response
- **Mock embeddings**: MD5 hash → 16 hex pairs → float array × 96 = 1536-dim vector (Ada-002 compatible shape)
- **Project discovery**: Auto-fetches Google Cloud project ID via `/v1internal:loadCodeAssist` endpoint
- **Hardcoded OAuth credentials**: Client ID and secret baked into source (Google Code Assist client)
- **State**: In-memory dict with threading lock for rate limiter; no database, no persistence beyond token file

---

## Publisher Background

IT-BAER is a solo developer identifying as a "sysadmin/homelabber" based on their GitHub bio. Account created March 2025 with 20 public repos and 12 followers. The project is inspired by [copilot-api](https://github.com/ericc-ch/copilot-api), a similar reverse proxy for GitHub Copilot. No corporate backing, no funding, no team. The repository was created December 25, 2025, with the latest push on January 21, 2026 — roughly 6 weeks of development. Accepts donations via Buy Me a Coffee and PayPal.

This is a hobbyist project with minimal community traction (11 stars, 2 forks). The author's background is systems administration, not AI/ML or distributed systems engineering.

---

## What's Valuable for Us

1. **Format translation patterns**: The `app.py` file is a compact reference for bidirectional OpenAI-to-Anthropic format conversion. The Anthropic SSE event stream generation (`message_start` → `content_block_start` → `content_block_delta` → `content_block_stop` → `message_delta` → `message_stop`) is a clean implementation that could be studied if we ever need to build protocol adapters.

2. **Model aliasing approach**: The fallback chain (exact alias → prefix strip → keyword pattern → default) is a pragmatic pattern for flexible model routing without rigid configuration.

3. **Rate limit queue mode**: The `WAIT_MODE` toggle between rejecting (429) and queuing (sleep-then-proceed) is a simple but useful pattern for self-hosted proxies. Validates our Master Blueprint's deterministic rate limiting principle.

4. **Cost arbitrage awareness**: Demonstrates the ecosystem trend of proxying between API providers to exploit pricing/quota differences. This is the same insight behind our LiteLLM catalogue entry's 378x pricing spread observation.

---

## What's NOT Relevant

1. **Undocumented internal API usage**: Uses `cloudcode-pa.googleapis.com/v1internal` — explicitly violates Google ToS. Our Master Blueprint governing principle of operational reliability and our gov contract requirements make this a non-starter. Account termination risk is unacceptable for any production workflow.

2. **Hardcoded OAuth credentials**: Client ID and secret baked into source code for Google's Code Assist OAuth client. This is a security anti-pattern and likely violates Google's OAuth policies separately from the API abuse.

3. **No persistence**: In-memory state with `deque(maxlen=100)` means all usage data lost on restart. Our architecture requires durable state (SQLite minimum per Master Blueprint).

4. **Single-file monolith**: Everything in `app.py` with no test coverage, no CI beyond basic workflows. Does not meet our quality bar for production dependencies.

5. **We already have LiteLLM**: LiteLLM (38K stars, YC W23, MIT, 100+ providers) covers the legitimate model routing/proxy use case with production-grade implementation, cost tracking, and proper API key management.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Not applicable. ToS violation risk disqualifies immediate use.
- **Phase 2 (Days 4-60)**: Not applicable. Same concern.
- **Phase 3 (Days 60-90)**: Could study the Anthropic SSE translation code if building custom protocol adapters, but LiteLLM already handles this.
- **Phase 4 (Days 90+)**: If Google officially opens Code Assist API access (unlikely), the auth flow and project discovery logic could be useful. Otherwise, no use case.

---

## Key Takeaway

> **A clever but risky reverse-engineering hack that routes OpenAI/Anthropic requests through Google's undocumented internal Code Assist API for free Gemini access — interesting as a format translation reference but disqualified from any production use by ToS violation risk and 11-star maturity.**
