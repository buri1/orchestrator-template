# Orthogonal

> **Trusted skills and APIs for AI agents — one API key, pay-per-call access to hundreds of third-party APIs.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Website | [orthogonal.com](https://www.orthogonal.com/) |
| API Base | `https://api.orth.sh/v1/` |
| Repository | No public GitHub repo |
| GitHub Stars | N/A (closed-source SaaS) |
| Publisher | Orthogonal (YC W2026 startup, 2-person team) |
| License | Proprietary (SaaS) |
| Tech Stack | Next.js (frontend), Clerk (auth), REST API, MCP server |
| Maturity | 🟡 Early (YC W2026 batch, 20+ API partners, product live) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *YC W2026. From Airtable research list. API aggregator for agents -- one key gives you access to all their partner APIs. Think "Stripe for API consumption by agents." Founders are ex-Vercel and ex-Google (reCAPTCHA/Maps). The partner list is almost entirely lead gen / data enrichment APIs (People Data Labs, Sixtyfour, Tomba, etc.) which maps to our Lead Gen Swarm business line. Not needed for gov SaaS work. Worth watching as the agent API economy matures.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves API access unification for agents, which matters for our Lead Gen Swarm line (scraping, enrichment, outreach). However, our core business (gov SaaS contracts) doesn't need dozens of third-party APIs -- it needs DSGVO-compliant, auditable integrations. The Master Blueprint's Principle 7 ("build only what you needed in the last 30 days") says we haven't needed a unified API gateway yet. Could become relevant when Lead Gen Swarm scales. |
| **Novelty** | 6/10 | The "one API key to rule them all" pattern is conceptually similar to Composio (auth/integration layer, already catalogued at 6/10) and Arcade.dev (delegated auth, 7/10), but Orthogonal differentiates by focusing on the *payment/billing* unification rather than auth delegation. The `/v1/search` endpoint (semantic API discovery via natural language prompt) is a genuinely useful pattern for agent-driven API selection. The skill.md format for agent integration is practical. |
| **Actionable** | 4/10 | No open-source components to adopt. The pay-per-call model means vendor lock-in on pricing. The semantic search endpoint (`/v1/search`) and the skill.md integration pattern are worth studying as design references. For immediate value, the partner catalog doubles as a curated list of high-quality data enrichment APIs we could integrate directly if needed for Lead Gen Swarm. |

---

## Overview

Orthogonal is an **API aggregation and payment layer** purpose-built for AI agents. The core problem it solves: agents that need to call paid third-party APIs (web scraping, lead enrichment, identity verification, weather data) currently require separate API keys, billing accounts, documentation parsing, and auth flows for each service. Orthogonal collapses this into a single API key (`orth_live_*`) and a unified REST interface (`/v1/run`) that proxies calls to any API in their catalog.

The product has three integration surfaces: (1) a **REST API** with two core endpoints -- `/v1/search` for semantic API discovery and `/v1/run` for execution, (2) an **MCP server** for Claude Desktop/Cursor/MCP-compatible agents, and (3) **skill.md files** that can be dropped into any markdown-reading agent (Claude Code, OpenClaw, Codex). The billing is pure pay-per-call with no subscription -- agents consume APIs and Orthogonal handles metering, billing, and revenue sharing with API providers.

The founding thesis, articulated in their launch blog post ("Introducing Orthogonal: The Payment Layer for AI Agents"), is that "AI agents are about to become the biggest consumers of APIs, but today's API ecosystem was built for humans." This positions them as the Stripe of agent API consumption -- abstracting away the complexity of multi-vendor API management so agents can focus on task execution.

---

## Technical Architecture

```
┌────────────────────────────────────────────────────────────┐
│                Agent Layer                                  │
│  (Claude Code / OpenClaw / Cursor / any MCP-capable agent) │
└─────────┬──────────────┬──────────────────┬────────────────┘
          │              │                  │
    ┌─────▼─────┐  ┌────▼──────┐  ┌───────▼────────┐
    │ REST API  │  │ MCP Server│  │ skill.md files │
    │ /v1/run   │  │ (tools)   │  │ (markdown)     │
    │ /v1/search│  │           │  │                │
    └─────┬─────┘  └────┬──────┘  └───────┬────────┘
          │              │                  │
          └──────────────▼──────────────────┘
                         │
          ┌──────────────▼──────────────────┐
          │     Orthogonal API Gateway       │
          │                                  │
          │  • Single API key (orth_live_*)  │
          │  • Semantic search (/v1/search) │
          │  • Unified execution (/v1/run)  │
          │  • Pay-per-call metering        │
          │  • Credit balance tracking      │
          │  • Usage history                │
          └──────────────┬──────────────────┘
                         │
    ┌────────────────────▼────────────────────────┐
    │          Partner API Catalog (20+)           │
    │                                              │
    │  Data/Enrichment:                            │
    │    Sixtyfour, People Data Labs, Aviato,     │
    │    Ocean.io, Coresignal, PredictLeads,      │
    │    Brand.dev, Nyne, Fiber                    │
    │                                              │
    │  Web/Scraping:                               │
    │    Olostep, ScrapeGraphAI, Linkup,          │
    │    Riveter, ScrapeCreators, Notte            │
    │                                              │
    │  Identity/Verification:                      │
    │    Tomba, Didit, Shofo                       │
    │                                              │
    │  Specialized:                                │
    │    Openmart (local business), Precip         │
    │    (weather), Andi (private search)          │
    └──────────────────────────────────────────────┘
```

**Key API Endpoints:**

- `POST /v1/search` -- Semantic search for APIs by natural language prompt. Accepts `prompt` (string) and `limit` (int). Returns ranked API matches.
- `POST /v1/run` -- Execute an API call. Accepts `api` (provider name), `path` (endpoint), `body` (parameters). Returns data + pricing info in JSON.

**Authentication:** Bearer token via `Authorization: Bearer orth_live_*` header.

**Workflow chaining:** Responses from one `/v1/run` call can be piped as inputs to the next, enabling multi-step workflows (e.g., find company -> enrich lead -> verify email -> send outreach).

---

## Publisher Background

**Founders:**
- **Christian Pickett** -- Previously at Vercel and Coinbase. Vercel experience relevant to developer-facing API/platform design.
- **Bera Sogut** -- Previously at Google, working on reCAPTCHA and Maps APIs. Deep experience with high-scale API infrastructure.

**Backing:** Y Combinator Winter 2026 batch. Primary YC partner: Tyler Bosmeny.

**Team size:** 2 people (founders only as of March 2026).

**Credibility assessment:** Strong technical pedigree (Vercel + Google APIs), and the problem statement is well-timed -- agent API consumption is genuinely growing. The partner list (20+ APIs, mostly B2B data/enrichment) suggests real BD traction for a 2-person team. However, as a pure marketplace/gateway play, they need network effects to succeed -- both on the API provider side (catalog breadth) and the agent consumer side (volume for competitive pricing). Early stage with execution risk.

---

## What's Valuable for Us

1. **Semantic API discovery pattern.** The `/v1/search` endpoint -- accepting natural language prompts and returning ranked API matches -- is a pattern worth adopting in our own orchestrator. When the Lead Gen Swarm needs to decide which enrichment API to use, a similar semantic routing layer (backed by our own catalog of approved APIs) would be more robust than hardcoded tool selection. This maps to Master Blueprint Principle 2 (deterministic routing) -- the search itself could be deterministic with a local vector index.

2. **Partner catalog as curated API shortlist.** Orthogonal's 20+ partners effectively serve as a curated list of the best data enrichment APIs for agent use cases. If we build the Lead Gen Swarm (Business Line 3), these specific providers (Sixtyfour for lead enrichment, Tomba for email discovery, Linkup for web search, Notte for browser automation) are pre-vetted candidates worth evaluating directly.

3. **skill.md integration pattern.** The idea of a single markdown file that gives any agent access to an API's capabilities (auth, endpoints, parameters, error handling) is a clean pattern. We already use markdown extensively for agent instructions. Extending that to external API specs is a natural fit.

---

## What's NOT Relevant

1. **Closed-source SaaS dependency.** Master Blueprint Principle 6 (federated systems, thin meta-layer) and our DSGVO requirements for gov work mean we cannot route government client data through a third-party API proxy. For Client Work (Business Line 1), Orthogonal is a non-starter. Agent auth tokens flowing through a YC startup's infrastructure is exactly the pattern CISOs reject.

2. **Pay-per-call pricing opacity.** The pricing is opaque -- "pay per call" with no published rate card means we can't predict costs or enforce budget circuit breakers (Master Blueprint Layer 3: "Budget circuit breakers"). Arcade.dev at least publishes its pricing model. For a system designed to run autonomously, unpredictable per-call costs are a liability.

3. **No open-source components.** Unlike Arcade.dev (MIT-licensed MCP framework) or LiteLLM (MIT, self-hosted), Orthogonal offers nothing we can self-host or fork. Every API call goes through their infrastructure. This conflicts with our zero-infrastructure-dependency approach for the core system.

4. **Crypto/Web3 category listing on YC.** The YC profile lists "Crypto/Web3" as an industry alongside AI and Payments, suggesting possible pivot risk or scope creep toward on-chain agent payments -- a domain we've already assessed as low-relevance (see Agent Economy entries, all 3-4/10).

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Not relevant. Focus is on core orchestrator, not third-party API integrations.
- **Phase 2 (Days 4-60):** Not relevant. Gov SaaS delivery doesn't need enrichment APIs.
- **Phase 3 (Days 60-90):** **Possible.** If Lead Gen Swarm (Business Line 3) reaches the point of needing multiple data enrichment APIs, Orthogonal's unified gateway could save integration time vs. managing 5+ separate API keys. Evaluate alongside direct API integration.
- **Phase 4 (Days 90+):** **Monitor.** If the agent API economy matures and Orthogonal's catalog grows to 100+ APIs with transparent pricing, the value proposition strengthens. The semantic search endpoint becomes more useful with a larger catalog. Watch for: pricing transparency, SOC 2 / DSGVO compliance, self-hosted option.

---

## Key Takeaway

> **Orthogonal is "Stripe for agent API consumption" -- a YC W2026 unified gateway that collapses multi-vendor API management into one key and one endpoint, but its closed-source SaaS model and opaque pricing make it a watch-and-wait for us until the Lead Gen Swarm needs scale API access.**
