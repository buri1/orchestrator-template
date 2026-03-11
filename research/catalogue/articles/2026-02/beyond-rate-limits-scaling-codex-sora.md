# Beyond Rate Limits: Scaling Access to Codex and Sora

> **OpenAI Engineering Blog, 2026-02-13**

| Field | Value |
|-------|-------|
| Source | https://openai.com/index/beyond-rate-limits/ |
| Author | OpenAI Engineering (no individual byline) |
| Publication | OpenAI Blog |
| Date | 2026-02-13 |
| Topics | rate-limiting, credit systems, real-time billing, infrastructure, Codex, Sora, access scaling |
| Read Time | ~8 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Waterfall decision stack replaces hard stops** -- OpenAI models access as a layered decision waterfall where rate limits, free tiers, credits, promotions, and enterprise entitlements are all just layers in the same decision stack. Users never perceive switching systems; credits are invisible.

2. **Synchronous correctness with asynchronous settlement** -- The real-time access engine makes provably correct decisions synchronously (checking rate-limit capacity then credit balance per request), while credit debits settle asynchronously through a streaming processor with stable idempotency keys to prevent duplicate charges.

3. **Three tightly coupled data streams** -- The architecture relies on product usage events, monetization events, and balance updates flowing together to keep every transaction auditable and reconcilable without interrupting user workflows.

4. **Explosive demand drove the redesign** -- Over 1 million developers adopted GPT-5.2-Codex within one month of its December 2025 release. Sora's economics were described as "currently completely unsustainable" by team lead Bill Peebles, making the credit system an economic necessity.

5. **Foundational infrastructure for future products** -- OpenAI frames the credit system as extensible infrastructure, not a Codex/Sora-specific feature. The same foundation will expand to more products over time.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Interesting infrastructure pattern for scaling agent access, but this is OpenAI's internal billing infrastructure -- not directly applicable to our orchestrator architecture. The waterfall decision model and synchronous-check/async-settle pattern are conceptually transferable to resource governance in multi-agent systems. |
| **Actionable** | 4/10 | The waterfall access model is a clean pattern for token budget management (check allocation tier first, then fallback to credit/overage). The idempotency and three-stream architecture are good reference patterns but not immediately actionable for our Phase 1-2 work. |

---

## Summary

OpenAI announced a fundamental shift in how they manage access to Codex and Sora, replacing hard rate limits with a hybrid credit-based system. The core innovation is treating access as a "waterfall" decision stack: each API request flows through layers of entitlements (rate-limit tier, free tier, credits, promotions, enterprise entitlements) until one allows the request. From the user's perspective, the experience is seamless -- they never hit a wall.

The engineering challenge was building a real-time access engine that consolidates usage tracking, rate-limit window management, and credit balance evaluation into a single synchronous evaluation path. Traditional billing systems operate asynchronously and suffer from lag, but interactive AI products (especially Codex for code generation and Sora for video generation) require low-latency decisions. OpenAI solved this by making the access decision synchronous and provably correct, while deferring credit settlement to an asynchronous streaming processor that uses stable idempotency keys to prevent duplicate charges.

The system architecture relies on three tightly coupled data streams: product usage events, monetization events, and balance updates. This ensures every transaction remains auditable and reconcilable without interrupting user workflows. Credit pricing for Sora is approximately $4 for 10 video generation credits (via Apple App Store), with consumption varying by video length, resolution, and technical factors.

The business context is significant: Sora team lead Bill Peebles admitted the platform's economics are "currently completely unsustainable," and over 1 million developers adopted Codex within its first month. The credit system is explicitly designed as foundational infrastructure that will extend to more OpenAI products over time. Codex's doubled promotional rate limits were set to expire in April 2026, returning to standard limits.

---

## Notable Quotes

> "Rate limits, free tiers, credits, promotions, and enterprise entitlements are all just layers in the same decision stack."

> "That's why credits feel invisible: they're just another element in the waterfall."

> "Currently completely unsustainable." -- Bill Peebles, Sora team lead, on Sora's economics

> "Enjoy the crazy usage limits while they last." -- Bill Peebles, warning of eventual free-tier reductions

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.infoq.com/news/2026/02/uber-openai-rate-limiting/ | Pairs OpenAI's system with Uber's rate-limiting redesign -- broader infrastructure pattern comparison | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenAI Codex | Primary product receiving the credit system; 1M+ developers in first month | Yes -- [openai-codex.md](../agent-harnesses/openai-codex.md) |
| Sora | Video generation product co-launching the credit system | No -- video generation, not relevant to catalogue |
| GPT-5.2-Codex | Underlying model powering Codex; December 2025 release | No -- model, not a tool |
| Codex Desktop (macOS) | Desktop app mentioned for in-app credit purchases | No -- part of Codex product |

---

## Action Items

- [ ] Consider the waterfall decision model as a pattern for token budget management in multi-agent orchestration (check plan allocation first, then fallback to overage/credit pool)
- [ ] Note the synchronous-check/async-settle pattern as a reference for any future real-time resource governance layer
