# BrainTrust

> **Enterprise AI evaluation and observability platform: evals, tracing, production logging, prompt management, and AI proxy.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/braintrustdata](https://github.com/braintrustdata) (multi-repo org) |
| GitHub Stars | 827 (autoevals), 384 (braintrust-proxy), 121 (braintrust-sdk-javascript) (as of 2026-03-08) |
| Publisher | Braintrust (VC-backed startup, $80M Series B) |
| License | MIT (autoevals, proxy) / Apache-2.0 (JS SDK) |
| Tech Stack | TypeScript, Python, Go, Ruby, Rust; DuckDB-derived custom DB ("Brainstore"); multi-cloud proxy (Vercel/Cloudflare/Lambda) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses eval gap in our quality gates; the four-part eval framework (dataset/task/scorer/experiment) maps to our need for systematic agent performance measurement. However, it's a managed SaaS — DSGVO compliance for gov clients requires self-hosting, which BrainTrust only partially supports ("hybrid deployment"). Langfuse is the stronger fit for self-hosted observability. BrainTrust's eval framework and "Loop" NL querying feature are genuinely differentiated. |
| **Novelty** | 6/10 | The "Loop" feature (NL querying of experiment results) and the four-part eval anatomy are well-articulated frameworks, but the core concept — LLM tracing + evaluation — is well-covered by Langfuse in our catalogue. AutoEvals library (LLM-as-judge, RAG scorers, heuristic evaluators) is the most novel component. The AI proxy with caching is a lighter LiteLLM alternative. |
| **Actionable** | 6/10 | AutoEvals library is immediately usable (`pip install autoevals` / `npm install autoevals`) for scoring agent outputs without committing to the full platform. The four-part eval framework is adoptable as a mental model today. Full platform adoption requires API keys and cloud dependency, which conflicts with our zero-infra / self-hosted posture. |

---

## Overview

BrainTrust is an AI observability and evaluation platform that positions itself as the end-to-end toolkit for "turning production traces into evals." Founded in 2022 and backed by $80M in Series B funding, the platform serves notable customers including Vercel, Notion, Coursera, Dropbox, Replit, and Graphite. It competes directly with Langfuse in the LLM observability space but differentiates through its eval-first philosophy and the "Loop" feature for NL querying of experiment results.

The platform is structured around three pillars: (1) **Observability** — real-time trace inspection for prompts, responses, tool calls, with latency/cost/quality monitoring; (2) **Evaluation** — a four-part framework (dataset, task, scorer, experiment) for systematic AI quality measurement, with support for LLM-as-judge, deterministic, and human-review scoring; and (3) **Loop** — an AI-powered agent that queries experiment results in natural language, which Jess from BrainTrust demonstrated at the Coding Agents Conference (2026-03-08) as essential for debugging long multi-turn agent traces where manual inspection fails.

The open-source footprint is distributed across multiple repos: `autoevals` (827 stars) provides a rich library of pre-built evaluators (factuality, RAG metrics, security, moderation), `braintrust-proxy` (384 stars) offers a unified AI provider gateway with caching, and `braintrust-sdk-javascript` (121 stars) provides the TypeScript tracing/eval SDK. SDKs also exist for Python, Go, Ruby, Rust, Kotlin, and Java.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     BrainTrust Platform                         │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐  │
│  │ Tracing  │   │  Evals   │   │  Loop    │   │  Prompt    │  │
│  │ (spans,  │   │ (dataset │   │ (NL query│   │  Mgmt /    │  │
│  │  traces) │   │  + task  │   │  over    │   │  Versioning│  │
│  │          │   │  + scorer│   │  results)│   │            │  │
│  │          │   │  + expt) │   │          │   │            │  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └─────┬──────┘  │
│       │              │              │                │          │
│       └──────────────┴──────────────┴────────────────┘          │
│                              │                                  │
│                    ┌─────────▼──────────┐                       │
│                    │    Brainstore      │                       │
│                    │ (DuckDB-derived    │                       │
│                    │  custom DB for     │                       │
│                    │  AI trace data)    │                       │
│                    └────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘

                              ▲
                              │ SDKs (TS, Python, Go, Ruby, Rust, Kotlin, Java)
                              │
┌─────────────┐     ┌────────┴────────┐     ┌─────────────────┐
│  Your App / │────▶│  braintrust-    │────▶│  AI Providers   │
│  Agent      │     │  proxy          │     │  (OpenAI,       │
│             │     │  (unified API   │     │   Anthropic,    │
│             │     │   gateway +     │     │   Mistral, etc) │
│             │     │   caching)      │     │                 │
└─────────────┘     └─────────────────┘     └─────────────────┘
```

**Core data model (eval framework):**
- **Dataset**: Collection of input/expected-output pairs (golden cases, edge cases, failure modes)
- **Task**: Function definition (prompt + model config) that produces output from input
- **Scorer**: Evaluation function — deterministic (Levenshtein, JSON validity), LLM-as-judge (Factuality, Faithfulness), or human review
- **Experiment**: Named run combining dataset + task + scorer(s), producing comparable results across configurations

**AutoEvals scorer categories:**
- **LLM-as-Judge**: Factuality, Closed QA, Humor, Moderation, Security, Summarization, SQL, Translation
- **RAG-specific**: Context Precision/Relevancy/Recall/Entity Recall, Faithfulness, Answer Relevancy/Similarity/Correctness
- **Heuristic**: Levenshtein distance, JSON validity, embedding similarity, semantic list contains

**Brainstore** (custom database):
- DuckDB-derived, purpose-built for nested AI trace data
- Full-text search optimized for prompt/response content
- Low-latency writes for production ingestion
- Claims significant performance over general-purpose DBs for AI workloads

**braintrust-proxy:**
- Unified OpenAI-compatible gateway to multiple AI providers
- `seed` parameter enables deterministic caching (identical requests return cached results)
- Deployable on Vercel, Cloudflare Workers, AWS Lambda, or Express.js
- Functions as a lighter alternative to LiteLLM for provider routing

---

## Publisher Background

BrainTrust was founded in 2022 and has raised $80M in Series B funding — well-capitalized for a developer tools company. Their customer list (Vercel, Notion, Coursera, Dropbox, Replit, Graphite) signals strong enterprise traction and validates the platform's production readiness. The company holds SOC 2 Type II, GDPR, and HIPAA compliance certifications.

The team has deep AI infrastructure experience, and the multi-language SDK coverage (7 languages) indicates significant engineering investment. The Jess conference talk at the Coding Agents Conference (2026-03-08) demonstrated genuine practitioner depth — transparent about eval limitations, honest about sample sizes, and modeling good eval hygiene by explicitly stating she wouldn't publish results without more trials. This is a credible team building for real practitioners, not a demo-ware operation.

Compared to Langfuse (acquired by ClickHouse, MIT-licensed, fully self-hostable), BrainTrust is a more managed/commercial offering. The open-source components (autoevals, proxy) are valuable standalone, but the core platform is SaaS.

---

## What's Valuable for Us

1. **AutoEvals library as standalone scorer**: `autoevals` (MIT, 827 stars) can be used independently of the BrainTrust platform. The Factuality, Faithfulness, and RAG scorers are directly useful for scoring our agent outputs — `pip install autoevals` and start scoring today. No platform dependency required.

2. **Four-part eval framework as mental model**: The dataset/task/scorer/experiment anatomy from Jess's talk is the most clearly articulated eval framework we've encountered. Adopt this vocabulary and structure for our own quality gates, regardless of whether we use BrainTrust or build on Langfuse.

3. **"Loop" NL querying pattern**: The idea of querying experiment results in natural language is valuable for debugging multi-turn agent traces. We could implement a similar pattern on top of Langfuse data using Claude as the query engine.

4. **braintrust-proxy as lightweight AI gateway**: At 384 stars and MIT-licensed, the proxy is a simpler alternative to LiteLLM for scenarios where we need provider routing + caching without LiteLLM's full infrastructure. Deployable as a Cloudflare Worker for near-zero ops.

5. **Agentic search vs. vector search eval methodology**: The conference talk's head-to-head eval methodology (SWE-bench Django + TypeScript-Go bugs, binary pass/fail scoring) is a template for how we should evaluate our own agent tool configurations.

---

## What's NOT Relevant

- **BrainTrust managed platform (SaaS)**: Gov client work requires DSGVO-compliant self-hosting. BrainTrust offers "hybrid deployment" but the core platform is SaaS-first. Langfuse's fully self-hosted Docker deployment is the stronger fit for our compliance posture. *(Conflicts with Governing Principle #6: Federated systems, no cross-contamination.)*

- **Brainstore custom database**: Interesting engineering but we don't need a specialized AI trace database — Langfuse's ClickHouse + Postgres architecture is proven at 1000+ self-hosted deployments and is what we'd deploy.

- **MCP integration for IDE-based eval management**: We work in Claude Code, not in a web IDE. The MCP integration is for teams who manage prompts through a UI.

- **SOC 2 / HIPAA compliance of the SaaS**: These certifications apply to the managed platform. For self-hosted observability, we handle compliance ourselves.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt `autoevals` library for scoring agent outputs in our quality gate pipeline. Use the four-part eval framework to structure our first systematic agent evaluation (dataset of known tasks, task = agent execution, scorer = autoevals Factuality + test pass rate, experiment = compare orchestrator configurations).

- **Phase 3 (Days 60-90)**: Evaluate BrainTrust platform vs. Langfuse for production observability. Key differentiator: BrainTrust's Loop feature for NL querying vs. Langfuse's OpenTelemetry-native tracing. May use both — Langfuse for traces, AutoEvals for scoring.

- **Phase 4 (Days 90+)**: If scaling to multiple business lines, the braintrust-proxy could serve as a lightweight model router for non-primary agents (lead gen, marketing) where LiteLLM is overkill. The production-logs-to-dataset flywheel (convert production failures into eval datasets) becomes critical at scale.

---

## Key Takeaway

> **BrainTrust's open-source AutoEvals library and four-part eval framework are immediately adoptable for agent quality measurement, but for production observability, self-hosted Langfuse remains the stronger fit for our DSGVO-constrained architecture — use BrainTrust's eval patterns on top of Langfuse's trace data.**
