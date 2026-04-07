# Arize Phoenix

> **AI Observability & Evaluation — tracing, evals, datasets, experiments, playground, and prompt management.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/Arize-ai/phoenix](https://github.com/Arize-ai/phoenix) |
| GitHub Stars | 8,800 (as of 2026-03-08) |
| Publisher | Arize AI (startup, VC-backed) |
| License | Elastic License 2.0 (ELv2) — self-hosting free, cannot resell as hosted service |
| Tech Stack | Python (primary), TypeScript/JavaScript, OpenTelemetry, Docker/K8s |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves the same observability problem as Langfuse but with a Python-first approach. Our stack is TypeScript/shell — Langfuse fits better. |
| **Novelty** | 4/10 | Covers the same ground as Langfuse. The evaluation framework is slightly more mature but not a fundamentally different approach. |
| **Actionable** | 4/10 | Python-first means friction with our TypeScript stack. Would require running a separate Python service or using their JS client (thinner than the Python SDK). |

---

## Overview

Arize Phoenix is an AI observability and evaluation platform built by Arize AI, a company that started in ML monitoring and expanded into LLM observability. Phoenix provides tracing, evaluation, prompt management, dataset creation, and experimentation — a feature set nearly identical to Langfuse but with a distinctly Python-first philosophy.

Phoenix is built on OpenTelemetry standards, making it vendor-agnostic. It supports 30+ framework integrations including OpenAI Agents SDK, LangGraph, Vercel AI SDK, Mastra, CrewAI, LlamaIndex, and DSPy. The platform can run anywhere — local machine, Jupyter notebook, Docker container, or cloud — with a managed offering at app.phoenix.arize.com.

The key differentiator from Langfuse is Phoenix's evaluation framework. It provides LLM-as-judge evaluation pipelines out of the box — relevance scoring, groundedness checks, hallucination detection — with explanations generated alongside scores. This is more opinionated and batteries-included than Langfuse's evaluation approach, which is more modular.

---

## Technical Architecture

- **Runtime**: Python application (Flask/FastAPI-based) with a React frontend
- **Storage**: SQLite for local/development, PostgreSQL for production
- **Tracing**: OpenTelemetry-native — uses standard OTEL collectors and exporters
- **Deployment**: `pip install arize-phoenix`, Docker image (`arizephoenix/phoenix`), Helm charts for K8s
- **SDKs**: Full Python SDK, lighter TypeScript/JS SDK, REST API

**Core abstractions:**
- **Traces/Spans**: Standard OTel trace model — traces contain spans, spans have attributes
- **Evaluations**: LLM-as-judge pipelines that score traces on dimensions like relevance, groundedness, toxicity
- **Datasets**: Versioned collections of input/output pairs for regression testing
- **Experiments**: Systematic comparison of prompt/model variants against datasets
- **Playground**: Interactive prompt testing environment

Unlike Langfuse's ClickHouse-backed analytics engine, Phoenix uses a more traditional database approach. This means simpler deployment but potentially less performant at high trace volumes.

---

## Publisher Background

Arize AI is a VC-backed ML observability company. They started with traditional ML model monitoring (data drift, feature importance, model performance) and expanded into LLM observability with Phoenix. The team has deep experience in ML infrastructure — their commercial Arize platform is used by enterprise customers for production ML monitoring. Phoenix is their open-source play to capture the LLM observability market. With 7,842+ commits and 8.8K stars, it's a well-maintained project but trails Langfuse in community adoption (22.8K stars).

---

## What's Valuable for Us

1. **Evaluation framework**: Phoenix's LLM-as-judge evaluation is more polished than Langfuse's. If we need automated quality scoring of agent outputs (e.g., "was this PR review thorough?"), Phoenix's eval pipelines are a good reference implementation.

2. **Jupyter notebook integration**: Phoenix can run inside a notebook for ad-hoc analysis of agent trace data. Useful for research and debugging, even if our production stack uses something else.

3. **Dataset/experiment workflow**: The systematic approach to versioned datasets + experiments is a pattern worth studying for our prompt regression testing needs.

---

## What's NOT Relevant

- **Python-first stack**: Our orchestrator is TypeScript/shell. Adding a Python dependency for observability adds operational complexity that Langfuse avoids.
- **Elastic License 2.0**: More restrictive than MIT. If we ever wanted to offer observability as part of a hosted service for clients, ELv2 would block that. Langfuse's MIT license is cleaner.
- **ML monitoring features**: The traditional ML observability features (data drift, embeddings visualization) are irrelevant — we're not training or deploying custom models.
- **Managed cloud**: Same as Langfuse — must self-host for DSGVO.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Not recommended as primary observability tool — Langfuse is a better fit for our stack.
- **Phase 3 (Days 60-90)**: Study Phoenix's evaluation framework as a reference when building our own agent quality scoring. Their LLM-as-judge implementation is more mature.
- **Phase 4 (Days 90+)**: If we need Python-based data analysis of agent traces, Phoenix's notebook mode could complement a Langfuse deployment for ad-hoc research.

---

## Key Takeaway

> **Phoenix is a strong LLM observability platform but loses to Langfuse for our use case — Python-first stack, ELv2 license, and lower community adoption make it the second choice; study its evaluation framework as reference instead.**
