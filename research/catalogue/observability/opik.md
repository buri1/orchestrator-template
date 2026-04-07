# Opik

> **Open-source AI Observability, Evaluation, and Optimization — debug, evaluate, and monitor LLM applications, RAG systems, and agentic workflows with comprehensive tracing, automated evaluations, and production-ready dashboards.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/comet-ml/opik](https://github.com/comet-ml/opik) |
| GitHub Stars | 18,116 (as of 2026-03-09) |
| Publisher | Comet ML (VC-backed startup, Series B) |
| License | Apache 2.0 |
| Tech Stack | Python (primary SDK), TypeScript (SDK + frontend), Java (backend), ClickHouse, MySQL, Redis, Docker/K8s/Helm |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Direct competitor to Langfuse for LLM observability. The Agent Optimizer SDK and 55+ integrations (including OpenClaw, CrewAI, LangGraph, n8n, Cursor) make it broader than pure tracing. The PyTest integration for CI/CD eval gates aligns with our quality pipeline needs. |
| **Novelty** | 5/10 | Overlaps heavily with Langfuse which we already catalogued. The Agent Optimizer (automatic prompt/tool optimization) and Guardrails modules are differentiators. The 40M+ traces/day scale claim is notable. |
| **Actionable** | 6/10 | Self-host via Docker or Helm. Python/TS/Ruby SDKs. The `@opik.track` decorator is dead simple. However, we already have Langfuse catalogued for the same niche — Opik is an alternative, not an addition. |

---

## Overview

Opik (built by Comet ML) is an open-source platform for the full lifecycle of LLM application observability, evaluation, and optimization. It covers three main areas: (1) deep tracing of LLM calls, agent activity, and conversation logging during development and in production, (2) automated evaluation with LLM-as-a-judge metrics (hallucination detection, moderation, RAG assessment) and dataset-driven experiments, and (3) production monitoring with dashboards tracking feedback scores, trace counts, and token usage, plus Online Evaluation Rules for continuous quality assessment.

What sets Opik apart from pure tracing tools is the inclusion of the **Opik Agent Optimizer** — a dedicated SDK with optimizers that automatically enhance prompts and agents — and **Opik Guardrails** for implementing safety practices. The platform claims to handle 40M+ traces per day at production scale.

The integration coverage is exceptionally broad: 55+ native integrations spanning LLM providers (OpenAI, Anthropic, Gemini, DeepSeek, Groq, Mistral, etc.), agent frameworks (CrewAI, LangGraph, LangChain, AutoGen, AG2, OpenAI Agents SDK, PydanticAI, BeeAI, Smolagents, Microsoft Agent Framework, Google ADK), workflow tools (n8n, Dify, Langflow, Flowise AI), and even coding tools (Cursor). OpenTelemetry support provides a universal bridge for any instrumented application. SDKs exist for Python, TypeScript, and Ruby (via OTel).

---

## Technical Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  App / Agent     │────▶│  Opik Backend    │────▶│  ClickHouse     │
│  (Python/TS SDK) │     │  (Java/Spring)   │     │  (analytics)    │
└──────────────────┘     └────────┬─────────┘     └─────────────────┘
                                  │
                         ┌────────┴─────────┐
                         │  MySQL            │
                         │  (transactional)  │
                         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         │  Redis            │
                         │  (cache/queues)   │
                         └──────────────────┘
```

**Key components:**

- **Backend**: Java (Spring Boot) application (`apps/opik-backend/`) with Maven build (`pom.xml`)
- **Frontend**: React/TypeScript application (`apps/opik-frontend/`)
- **Python SDK**: Main client library (`sdks/python/`) with `@opik.track` decorator, evaluation metrics, dataset management
- **TypeScript SDK**: JS/TS client (`sdks/typescript/`)
- **Agent Optimizer**: Separate SDK (`sdks/opik_optimizer/`) for automatic prompt and tool optimization with benchmarks
- **Python Backend**: Additional Python backend service (`apps/opik-python-backend/`)
- **Guardrails Backend**: Dedicated guardrails service (`apps/opik-guardrails-backend/`)
- **Sandbox Executor**: Python sandbox for evaluation execution (`apps/opik-sandbox-executor-python/`)
- **Storage**: ClickHouse for high-throughput analytics, MySQL for transactional data, Redis for caching/queuing
- **Deployment**: Docker Compose for local dev, Helm chart for Kubernetes production deployments
- **Releases**: Rapid release cadence (v1.10.31 as of 2026-03-09, multiple releases per day)

---

## Publisher Background

Comet ML is a VC-backed company (Series B, $50M+ total funding) that originally built the Comet experiment tracking platform for ML teams. Opik is their pivot/expansion into the LLM observability space, launched as an open-source product in mid-2023. The team has significant ML tooling experience — the original Comet platform was widely used for traditional ML experiment tracking, model registry, and hyperparameter optimization. The repo has 1,381 forks and 155 open issues, with active development (multiple releases per day). Top contributors are primarily Comet employees. The company offers Comet Cloud as the managed hosted option alongside self-hosting.

---

## What's Valuable for Us

1. **Agent Optimizer SDK** (`sdks/opik_optimizer/`): Unlike Langfuse, Opik includes a dedicated optimizer that can automatically improve prompts and tool configurations. This is a unique capability that could be valuable for tuning orchestrator prompts during Phase 2-3.

2. **55+ framework integrations**: The integration breadth is the widest of any observability tool in the catalogue. Notably includes OpenClaw, Cursor, n8n, Dify, Flowise, Google ADK, Autogen/AG2, and Microsoft Agent Framework — covering agent frameworks we may interact with.

3. **PyTest integration for CI/CD eval gates**: The ability to run LLM evaluations as part of CI/CD pipelines (`opik.evaluation.metrics`) is immediately relevant for quality gating agent-generated code. This maps directly to our deterministic quality pipeline.

4. **Online Evaluation Rules**: Production-time LLM-as-a-judge rules that run automatically on traces. This is the production monitoring equivalent of our E2E testing gates — continuous quality assessment rather than point-in-time checks.

5. **OpenTelemetry support**: Framework-agnostic tracing via OTel means any agent runtime can be instrumented without Opik-specific SDK changes.

6. **Apache 2.0 license**: No `ee/` folder restrictions like Langfuse's MIT+proprietary split. Full Apache 2.0 means unrestricted commercial self-hosting.

---

## What's NOT Relevant

1. **Java backend**: The backend is Java/Spring Boot, which conflicts with our TypeScript-native stack. Langfuse's TypeScript/Node.js backend is a better cultural fit.

2. **Managed cloud dependency**: Many features are optimized for the Comet Cloud hosted offering. Self-hosted deployments work but may lag feature-wise.

3. **Heavy infrastructure requirements**: ClickHouse + MySQL + Redis + Java backend is heavier than what we need for Phase 1-2. Langfuse's stack (ClickHouse + Postgres + Redis) is similarly heavy but at least uses our preferred language.

4. **Overlaps with Langfuse**: We already have Langfuse catalogued at 8/10 relevance with the same core capability (LLM tracing + eval). Adding both tools would be redundant for our use case. Langfuse has stronger community adoption (22.8K stars), MIT license (more permissive for core), and TypeScript alignment.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: If Langfuse proves insufficient, Opik is the strongest alternative. The Apache 2.0 license may be preferable for gov contract delivery where license clarity matters.
- **Phase 3 (Days 60-90)**: The Agent Optimizer SDK could be valuable for automated prompt tuning as we scale agent operations. The Online Evaluation Rules could replace manual E2E testing for production monitoring.
- **Phase 4 (Days 90+)**: At scale, the 40M+ traces/day capacity and comprehensive framework integrations become relevant for monitoring a federated multi-business agent system.

---

## Key Takeaway

> **Opik is the strongest open-source alternative to Langfuse for LLM observability, differentiated by its Agent Optimizer SDK, Apache 2.0 licensing, and the broadest integration coverage (55+ frameworks), but its Java backend and overlap with our already-catalogued Langfuse make it a backup rather than a primary choice.**
