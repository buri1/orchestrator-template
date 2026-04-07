# LiteLLM

> **Python SDK, Proxy Server (AI Gateway) to call 100+ LLM APIs in OpenAI format, with cost tracking, guardrails, loadbalancing and logging**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [BerriAI/litellm](https://github.com/BerriAI/litellm) |
| GitHub Stars | 38,200 (as of 2026-03-08) |
| Publisher | BerriAI (startup, YC W23) |
| License | MIT (core), Enterprise license (enterprise/ directory) |
| Tech Stack | Python (SDK + proxy), JavaScript/TypeScript (litellm-js), Prisma ORM, Docker |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Model routing directly addresses our 378x pricing spread observation; cost tracking enables the 70/30 deterministic/LLM split optimization; multi-provider fallback adds resilience |
| **Novelty** | 5/10 | Unified LLM API is a well-known pattern, but LiteLLM's execution (100+ providers, 8ms P95 latency, production-grade proxy) is the best implementation |
| **Actionable** | 7/10 | Could deploy as our model routing layer within a day; the proxy server mode is production-ready and would give us immediate cost visibility across all agent LLM calls |

---

## Overview

LiteLLM is a unified API gateway that normalizes 100+ LLM provider APIs into a single OpenAI-compatible interface. It exists in two forms: a Python SDK for direct in-app calls (`from litellm import completion`) and a standalone proxy server that acts as an AI Gateway with its own authentication, cost tracking, rate limiting, and load balancing. Both expose the same interface — switching providers means changing a model string, not rewriting integration code.

The proxy server is the more interesting component for infrastructure. It sits between your applications and LLM providers, providing a single endpoint that handles routing, fallback, caching, and spend tracking. At 8ms P95 latency at 1,000 RPS, the overhead is negligible. The admin dashboard gives real-time visibility into costs per project, per user, per model — exactly the kind of observability needed to optimize the 378x pricing spread between models.

LiteLLM also recently added A2A (Agent-to-Agent) protocol support and MCP (Model Context Protocol) integration, positioning it as an agent infrastructure component rather than just an API wrapper. YC W23 pedigree, MIT license, 38K+ stars, and production use at Netflix, Lemonade, and Rocket Money validate its maturity.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│              LiteLLM Proxy Server               │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Virtual  │  │ Cost     │  │ Guardrails   │  │
│  │ Keys     │  │ Tracking │  │ & Rate Limit │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Router / │  │ Fallback │  │ Load         │  │
│  │ Model Map│  │ Logic    │  │ Balancer     │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           Admin Dashboard UI             │   │
│  │  (Spend tracking, user mgmt, analytics)  │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │         Prisma ORM / Database            │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Anthropic│  │ OpenAI   │  │ Bedrock  │  ... 100+
  │ Claude   │  │ GPT      │  │ AWS      │  providers
  └──────────┘  └──────────┘  └──────────┘
```

Key technical details:
- **8ms P95 latency at 1K RPS** — negligible proxy overhead
- **OpenAI-compatible API** — drop-in replacement for any OpenAI SDK call
- **Virtual keys** — per-team/per-project API keys with spend limits
- **Fallback chains** — automatic failover to backup models/providers
- **Model aliasing** — map logical names to specific model versions
- **Cost tracking** — per-request cost calculation with per-user/per-project aggregation
- **A2A Protocol + MCP** — agent-native communication protocols
- **Prisma ORM** — PostgreSQL-backed state for keys, spend, logs
- **Docker deployment** — single container, self-hosted

---

## Publisher Background

Built by **BerriAI**, a YC W23 company. The team has built LiteLLM into one of the most-starred AI infrastructure projects on GitHub (38K+). Enterprise tier starts at $250/mo with SSO, Prometheus metrics, and audit logs.

Production users include Netflix, Lemonade, Rocket Money, and numerous other companies. The MIT license for the core product and YC backing provide strong long-term viability signals.

---

## What's Valuable for Us

- **Cost optimization layer**: With the 378x pricing spread between models, LiteLLM's routing + cost tracking gives us the data to make informed routing decisions. Run the proxy, see exactly what each agent/task/business-line costs, then optimize routing rules.
- **Fallback resilience**: Our production orchestrator depends on Claude. If Anthropic has an outage, LiteLLM can auto-failover to a backup model (GPT-4, Gemini) — critical for revenue-generating production workloads.
- **70/30 split enforcement**: Route deterministic tasks to cheaper/faster models, reserve expensive frontier models for the 30% LLM work. LiteLLM's model aliasing makes this configurable without code changes.
- **Multi-tenant cost isolation**: Virtual keys per business line (gov SaaS, SaaS factory, lead gen) give us per-line cost visibility — directly supports the federated architecture.
- **MIT license**: No licensing friction. Self-host, modify, extend freely.
- **Model aliasing for A/B testing**: Test whether Claude Haiku can handle tasks currently routed to Sonnet — instant cost savings discovery.

---

## What's NOT Relevant

- **Python-first**: LiteLLM is Python-native. Our stack is TypeScript/shell. The proxy server abstracts this (HTTP API), but extending LiteLLM itself requires Python. The `litellm-js` SDK exists but is secondary.
- **Enterprise features**: SSO, JWT auth, audit logs — overkill for our current team size. The free/MIT tier covers everything we need.
- **Guardrails/content filtering**: We don't need content moderation on agent-to-agent communication. This is more relevant for user-facing chatbots.
- **A2A Protocol**: Interesting but our agent communication happens via tmux/files/state, not HTTP-based agent protocols.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Deploy LiteLLM proxy alongside our orchestrator to get immediate cost visibility. Route through it for all LLM calls. The cost data alone is worth the setup — takes ~1 hour with Docker.
- **Phase 3 (Days 60-90)**: Implement intelligent routing rules — use cheaper models for search/classification tasks, frontier models only for code generation. The 378x pricing spread means even small routing optimizations yield significant savings.
- **Phase 4 (Days 90+)**: Multi-tenant model routing per business line. Gov work uses dedicated Claude instances (compliance), SaaS factory uses cost-optimized routing, lead gen experiments use cheapest available models.

---

## Key Takeaway

> **LiteLLM is the most mature model routing/gateway solution (38K stars, MIT, YC-backed) and directly addresses our 378x pricing spread problem — deploy it as a proxy server for immediate cost visibility and future intelligent routing.**
