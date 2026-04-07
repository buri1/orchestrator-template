# Antigravity Manager

> **Professional AI account manager & switcher — turns web session credentials into standardized API interfaces with automatic account rotation, protocol conversion, and quota monitoring.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [lbjlaq/Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager) |
| GitHub Stars | 25,635 (as of 2026-03-08) |
| Publisher | lbjlaq (solo developer, China-based) |
| License | CC-BY-NC-SA-4.0 (non-commercial, share-alike) |
| Tech Stack | Rust (Axum backend), React + Tauri v2 (desktop GUI), TypeScript, Vite, Tailwind CSS, Docker |
| Maturity | 🟢 Production (v4.1.28, 554 commits, active development) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Solves credential rotation for AI subscriptions, but our architecture uses direct API keys (Claude Max subscription), not web-session credential harvesting. The proxy pattern overlaps with LiteLLM which we already catalogue at 8/10 relevance. |
| **Novelty** | 4/10 | The credential-to-API conversion pattern is novel, but the core proxy functionality (protocol conversion, model routing, fallback) is well-covered by LiteLLM. The account rotation on 429/401 errors is a unique feature but serves a different use case than ours. |
| **Actionable** | 2/10 | Non-commercial license (CC-BY-NC-SA-4.0) makes it legally unusable for our revenue-generating contract work. Even as a reference, LiteLLM's MIT-licensed proxy is a superior pattern source. |

---

## Overview

Antigravity Manager is a desktop application and local proxy server that converts web session credentials (OAuth tokens from AI service subscriptions) into standardized API endpoints. It sits on `localhost:8045` and exposes OpenAI-compatible `/v1/chat/completions`, Anthropic-native `/v1/messages`, and Google Gemini format endpoints. The core value proposition is multi-account management: users can import tokens from multiple AI service accounts, and the system automatically rotates between them when rate limits (429) or auth failures (401) are hit.

The tool is built with Tauri v2 (Rust backend + React frontend), providing a polished desktop GUI for account management, quota monitoring, and configuration. It includes a Docker deployment option for headless server use. The request pipeline flows through an Axum gateway with middleware (auth, rate-limiting, logging), into a model router, then to an account dispatcher that selects the best available account, through a protocol mapper to the upstream API, and back.

The model router supports series-based ID mapping, regex pattern matching for custom routing, tiered routing by account type (Ultra/Pro/Free), and automatic background-task downgrade to cheaper models. The dashboard provides real-time quota monitoring for Gemini Pro, Flash, Claude, and image generation quotas. It also supports Imagen 3 image generation via the OpenAI `size` parameter convention.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Antigravity Manager (Tauri v2)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Account      │  │ OAuth 2.0    │  │ 403 Auto-    │  │
│  │ Import/Mgmt  │  │ Auth Flow    │  │ Detection    │  │
│  │ (JSON batch) │  │ (auto/manual)│  │ & Tagging    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Axum Gateway (Rust)                  │   │
│  │  Auth → Rate Limit → Logging → Model Router      │   │
│  └──────────────────────┬───────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │           Account Dispatcher                      │   │
│  │  - Tiered routing (Ultra/Pro/Free)                │   │
│  │  - 429/401 auto-rotation                          │   │
│  │  - Smart account recommendation                   │   │
│  │  - Background task downgrade to Flash             │   │
│  └──────────────────────┬───────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────▼───────────────────────────┐   │
│  │           Protocol Mapper                         │   │
│  │  - OpenAI /v1/chat/completions                    │   │
│  │  - Anthropic /v1/messages                         │   │
│  │  - Google Gemini format                           │   │
│  └──────────────────────┬───────────────────────────┘   │
│                          │                               │
│  ┌──────────────┐  ┌────▼─────┐  ┌──────────────┐      │
│  │ React GUI    │  │ Quota    │  │ Config Store │      │
│  │ Dashboard    │  │ Monitor  │  │ gui_config   │      │
│  └──────────────┘  └──────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      ┌──────────┐  ┌──────────┐  ┌──────────┐
      │ Anthropic│  │ Google   │  │ OpenAI   │
      │ Claude   │  │ Gemini   │  │ GPT      │
      └──────────┘  └──────────┘  └──────────┘
```

Key technical details:
- **Rust + Axum backend** — performant local proxy server on port 8045
- **Multi-protocol output** — OpenAI, Anthropic, and Gemini format endpoints from a single proxy
- **Account rotation** — automatic failover on 429 (rate limit) and 401 (auth expired) errors
- **Tiered routing** — different accounts for different task types (Ultra for complex, Flash for background)
- **Regex model routing** — custom pattern matching to route model IDs to specific account pools
- **OAuth 2.0 flows** — automatic and manual token acquisition from web sessions
- **Docker deployment** — headless server mode with persistent storage at `~/.antigravity_tools/`
- **Cross-platform** — Linux, macOS (Apple Silicon + Intel), Windows builds
- **Imagen 3 support** — image generation with quality controls via OpenAI size parameter convention

---

## Publisher Background

**lbjlaq** is a solo developer based in China with a small portfolio of utility tools. The Antigravity-Manager is their flagship project by far (25.6K stars vs. <100 for everything else). Other projects include MeteorMail (self-hosted temporary email, 96 stars), ls-transcoder (28 stars), CursorChecker (25 stars), and KeyTools (Microsoft product key verification, 14 stars).

The project has 2,825 forks and 1,535 open issues, suggesting high usage but limited maintainer bandwidth. The CC-BY-NC-SA-4.0 license (non-commercial) and the nature of the tool (credential rotation for web-session-based AI access) position it in a legally and ethically gray area — it essentially turns consumer-tier web subscriptions into API-like access by harvesting and rotating session tokens.

Sponsorship ties to API relay services (PackyCode, AICodeMirror) suggest a commercial ecosystem around circumventing official API pricing. The project description is bilingual (English/Chinese), and the community appears primarily China-based.

---

## What's Valuable for Us

- **Account rotation pattern**: The concept of automatic failover on 429/401 with pool-based account dispatch is architecturally interesting. LiteLLM handles this more cleanly with proper API keys, but the rotation logic (tiered selection, health tagging, quota-aware dispatch) could inform our own model routing decisions.
- **Protocol conversion reference**: The multi-protocol mapper (OpenAI <-> Anthropic <-> Gemini) is a useful reference for understanding protocol differences if we ever need to support multi-provider agent execution.
- **Rust + Axum as proxy stack**: Validates Rust/Axum as a performant choice for local API proxies — relevant if we ever need a high-performance gateway component.

---

## What's NOT Relevant

- **Non-commercial license**: CC-BY-NC-SA-4.0 explicitly prohibits commercial use. Our primary revenue stream is government SaaS contracts. This tool cannot be used, adapted, or incorporated into any of our business lines without violating the license. This alone disqualifies it from adoption. (Conflicts with Master Blueprint Governing Principle #7 — build what you need, but do it legally.)
- **Credential harvesting model**: The core premise (turning web session tokens into API access) conflicts with most AI providers' Terms of Service. For government contract work with BSI/DSGVO compliance requirements, using a tool that circumvents official API channels is a non-starter. The legal and compliance risk far outweighs any cost savings.
- **Desktop GUI focus**: Tauri v2 desktop app is irrelevant to our headless, tmux-based orchestrator architecture. We need server-side infrastructure, not GUI account managers.
- **LiteLLM overlap**: Everything this tool does for legitimate API routing, LiteLLM does better, with MIT license, YC backing, 38K+ stars, and proper API key management instead of credential rotation. There is no gap in our catalogue that Antigravity-Manager fills that LiteLLM doesn't already cover.

---

## Future Use Cases

- **Phase 1-3**: No use case. The non-commercial license and credential-harvesting approach make this incompatible with our revenue-generating work at any phase.
- **Phase 4 (Days 90+)**: If the project re-licenses to MIT/Apache, the Rust/Axum proxy architecture and multi-protocol conversion code could serve as a reference for building a high-performance gateway. However, LiteLLM remains the preferred solution.

---

## Key Takeaway

> **Antigravity-Manager is a popular (25K+ stars) but legally unusable tool for our purposes — its non-commercial license and credential-harvesting approach conflict with our government contract compliance requirements, and LiteLLM already covers the legitimate proxy/routing functionality with a superior license and ecosystem.**
