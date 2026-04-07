# Langfuse

> **Open source LLM engineering platform: LLM Observability, metrics, evals, prompt management, playground, datasets.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/langfuse/langfuse](https://github.com/langfuse/langfuse) |
| GitHub Stars | 22,800 (as of 2026-03-08) |
| Publisher | Langfuse (YC W23 startup) |
| License | MIT (except `ee/` folders — proprietary) |
| Tech Stack | TypeScript/Node.js, React, ClickHouse, PostgreSQL, Redis, S3, Docker/K8s |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Direct answer to our observability gap — gov clients need trust artifacts (trace logs, cost breakdowns, audit trails). We need this within 60 days. |
| **Novelty** | 5/10 | LLM tracing is a well-understood concept. The ClickHouse-backed architecture with ReplacingMergeTree is a solid engineering choice but not a paradigm shift. |
| **Actionable** | 7/10 | Self-host via Docker in a day. Python/TS SDKs integrate cleanly with our TypeScript stack. The prompt management and eval features are immediately useful. |

---

## Overview

Langfuse is the dominant open-source LLM observability platform, acquired by ClickHouse in early 2025. It provides end-to-end tracing of LLM application executions — every prompt, completion, latency measurement, token count, and cost estimate gets captured and stored in a structured, queryable format. The platform covers the full LLM engineering lifecycle: tracing, evaluation, prompt management, datasets, and an interactive playground.

The architecture is built around a high-throughput event ingestion pipeline. Traces flow through Redis queues into an async event processor that writes to ClickHouse (for analytics/observability data) and PostgreSQL (for transactional data like user accounts and project configs). Large payloads get offloaded to S3/blob storage. This dual-database approach — ClickHouse for reads, Postgres for writes — is a well-proven pattern that handles the 1000+ self-hosted production deployments currently running.

Langfuse is framework-agnostic with native integrations for OpenTelemetry, LangChain, LlamaIndex, OpenAI SDK, LiteLLM, and more. The OpenTelemetry support is particularly relevant — it means any OTel-instrumented application can pipe traces directly into Langfuse without vendor-specific SDK changes.

---

## Technical Architecture

```
┌─────────────┐     ┌──────────┐     ┌─────────────────┐
│  App / Agent │────▶│  Redis   │────▶│  Event Processor│
│  (SDK/OTel)  │     │  Queue   │     │  (async worker) │
└─────────────┘     └──────────┘     └────────┬────────┘
                                              │
                    ┌─────────────────────────┼─────────────────┐
                    │                         │                 │
              ┌─────▼─────┐          ┌────────▼───────┐  ┌─────▼─────┐
              │ ClickHouse │          │   PostgreSQL   │  │  S3/Blob  │
              │ (traces,   │          │ (users, orgs,  │  │ (large    │
              │  spans,    │          │  projects,     │  │  payloads)│
              │  scores)   │          │  configs)      │  │           │
              └────────────┘          └────────────────┘  └───────────┘
```

**Core data model:**
- **Traces**: Top-level container for an execution (e.g., one agent task)
- **Observations**: Individual spans within a trace (LLM calls, retrieval, tool use)
- **Scores**: Evaluation results attached to traces/observations (manual, LLM-as-judge, or programmatic)
- **Sessions**: Group of related traces (e.g., multi-turn conversation)

ClickHouse tables use **ReplacingMergeTree** engine — writes new rows with incrementing version numbers, deduplicates in background. This allows "updates" on immutable columnar storage, which is critical for traces that get enriched over time (e.g., score attached after generation).

**Wide events table**: Langfuse is migrating to a single wide `events` table that collapses trace- and span-level data into one structure. This delivered ~3x less memory usage and up to 20x faster queries.

---

## Publisher Background

Langfuse was founded as a YC W23 startup and quickly became the de facto open-source LLM observability tool. **ClickHouse acquired Langfuse** — the project continues as open source under ClickHouse stewardship. The team is actively hiring for product engineering and GTM roles. With 6,444+ commits and 22.8K stars, this is a mature, well-maintained project with strong community adoption. Over 1,000 organizations run self-hosted Langfuse in production.

---

## What's Valuable for Us

1. **Trust artifacts for gov clients**: Every agent execution produces a full trace — input/output, latency, token counts, costs. This is exactly the audit trail gov clients demand. Self-hosted means data stays in our infrastructure (DSGVO compliance).

2. **Cost tracking at scale**: With Claude Max $200/mo arbitrage being central to our business model, having per-trace cost breakdowns validates the margin story. Langfuse tracks token usage per model, per trace, with caching metrics.

3. **Prompt management + versioning**: The prompt management feature with version control is directly useful for our orchestrator prompts. We can A/B test prompt changes with real execution data rather than guessing.

4. **Session-level grouping**: Maps perfectly to our L-Thread model — each L-Thread becomes a Langfuse session, each agent task becomes a trace, each LLM call becomes an observation.

5. **OpenTelemetry native**: We can instrument our TypeScript orchestrator with standard OTel without coupling to Langfuse-specific SDKs — clean separation.

---

## What's NOT Relevant

- **Managed cloud offering**: We must self-host for DSGVO compliance. The cloud tier is irrelevant.
- **LLM playground**: Nice-to-have but we iterate on prompts in Claude Code directly, not in a web UI.
- **Dataset/fine-tuning features**: We're not fine-tuning models. Our 70/30 split puts the deterministic logic in code, not in model weights.
- **Enterprise edition features** (`ee/` folders): SSO, RBAC, advanced access controls — overkill for our current team size. May become relevant at scale.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Deploy self-hosted Langfuse via Docker. Instrument the L-Thread orchestrator with OpenTelemetry. Start collecting trace data for all agent executions. Build a cost dashboard for gov client reporting.
- **Phase 3 (Days 60-90)**: Use evaluation features to systematically score agent outputs. Build automated quality gates using Langfuse scores (e.g., block PR merge if agent trace shows hallucination markers).
- **Phase 4 (Days 90+)**: Prompt versioning becomes critical as we scale across business lines. Use Langfuse datasets to regression-test orchestrator prompt changes before deploying.

---

## Key Takeaway

> **Langfuse is the most production-ready open-source LLM observability platform available — self-host it to generate the trust artifacts gov clients demand while tracking the cost arbitrage that makes our business model work.**
