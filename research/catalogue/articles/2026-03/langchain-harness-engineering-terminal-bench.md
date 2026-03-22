# Improving Deep Agents with Harness Engineering

> **LangChain — LangChain Blog, 2026-02-17**

| Field | Value |
|-------|-------|
| Source | https://blog.langchain.com/improving-deep-agents-with-harness-engineering/ |
| Author | LangChain Team |
| Publication | LangChain Blog |
| Date | 2026-02-17 |
| Topics | harness engineering, benchmarking, Terminal Bench, deep agents, middleware, self-verification, reasoning budget, context engineering |
| Read Time | 8 min |

---

## Burak's Notes

> *DIRECTLY applicable to our orchestrator. The "reasoning sandwich" (xhigh plan → high implement → xhigh verify) maps to our worker spawning strategy — give agents more thinking budget for planning and verification phases. The PreCompletionChecklistMiddleware is exactly what we need: intercept agent before exit and force a verification pass. Their 52.8% → 66.5% improvement with ZERO model changes proves harness engineering > model selection. The Trace Analyzer Skill (fetch failed traces → spawn parallel error analysis agents → synthesize → fix harness) is a meta-loop we should build for our orchestrator.*

---

## Key Takeaways

1. **Harness engineering alone yielded +13.7pp improvement (52.8% → 66.5%)** — Moving from top-30 to top-5 on Terminal Bench 2.0 without changing the model (GPT-5.2-Codex held constant). This proves that systems engineering around the model matters as much or more than model selection.

2. **Self-verification is the highest-leverage intervention** — Models are biased towards their first plausible solution and will skip verification unless forced. The `PreCompletionChecklistMiddleware` intercepts the agent before exit and injects a deterministic verification pass. Combined with prompted emphasis on testing as feedback mechanism, this prevents premature completion.

3. **The "Reasoning Sandwich" outperforms uniform high reasoning** — Allocating xhigh reasoning for planning, high for implementation, and xhigh for verification scored 63.6-66.5%, while running xhigh throughout only scored 53.9% (timeouts killed tasks). Budget allocation > raw reasoning power.

4. **Loop detection middleware prevents doom loops** — Tracking per-file edit counts and injecting "consider reconsidering your approach" after N edits to the same file breaks agents out of blind retry patterns. Authors acknowledge this is a workaround for current model limitations.

5. **Trace-driven improvement creates a meta-learning loop** — Fetch experiment traces from LangSmith, spawn parallel error analysis agents, synthesize findings, implement targeted harness changes. Similar to ML boosting — focus on mistakes from previous runs.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly maps to our orchestrator harness: middleware hooks = our pre/post hooks, self-verification = our E2E gate, loop detection = our stuck-agent recovery, reasoning sandwich = our worker budget strategy |
| **Actionable** | 9/10 | At least 4 patterns are immediately adoptable: PreCompletionChecklist, LocalContextMiddleware, LoopDetectionMiddleware, and the Trace Analyzer meta-loop |

---

## Summary

LangChain's Deep Agents team improved their Terminal Bench 2.0 score from 52.8% to 66.5% — a leap from top-30 to top-5 — through pure harness engineering with no model changes. The article defines harness engineering as "systems engineering around models to optimize goals like task performance, token efficiency, latency" and argues the harness designer's job is to "mold the inherently spiky intelligence of a model for tasks we care about."

The team compressed their optimization space to three levers: system prompts, tools, and middleware (hooks around model and tool calls). Their system prompt implements a four-stage problem-solving framework: Planning & Discovery → Build → Verify → Fix. The critical insight is that models are biased towards their first plausible solution and will avoid verification unless forced. They solved this with `PreCompletionChecklistMiddleware` that intercepts the agent before exit and injects a deterministic verification pass.

Two other middleware components proved essential: `LocalContextMiddleware` maps the working directory structure and discovers system tools at agent start (reducing context discovery errors), and `LoopDetectionMiddleware` tracks per-file edit counts to break agents out of "doom loops" where they retry the same broken approach 10+ iterations. Environmental awareness prompting emphasizes that code must pass programmatic tests, stresses exact file path compliance, and injects time budget warnings.

The "Reasoning Sandwich" strategy was a surprising finding: allocating xhigh reasoning for planning, dropping to high for implementation, then back to xhigh for verification outperformed uniform xhigh reasoning (66.5% vs 53.9%). The uniform approach caused timeouts. The authors note that adaptive reasoning (as in Claude and Gemini models, where the model self-determines reasoning allocation) represents the natural evolution of this pattern.

Finally, the Trace Analyzer Skill creates a meta-improvement loop: fetch experiment traces from LangSmith, spawn parallel error analysis agents, synthesize findings, and implement targeted harness changes — similar to ML boosting, focusing on mistakes from previous runs. The authors released their dataset of 89 Terminal Bench task traces publicly.

---

## Notable Quotes

> "The goal of a harness is to mold the inherently spiky intelligence of a model for tasks we care about."

> "Today's models are exceptional self-improvement machines."

> "The purpose of the harness engineer: prepare and deliver context so agents can autonomously complete work."

> "Agents can be myopic once they've decided on a plan which results in 'doom loops.'"

> "The job of the harness designer is to design around today's shortcomings while planning for smarter models in the future."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/langchain-ai/deepagents | Open-source deep agent framework — reference implementation of all patterns described | `/ingest-tool` |
| https://tbench.ai | Terminal Bench 2.0 — benchmark for evaluating agentic coding capabilities | `/ingest-tool` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Deep Agents (Python) | LangChain's open-source agent framework tested on Terminal Bench | No |
| Deep Agents (JavaScript) | JS port of the framework | No |
| deepagents-cli | The specific coding agent harness tested | No |
| Terminal Bench 2.0 | Benchmark: 89 tasks across ML, debugging, biology domains | No |
| Harbor | Run orchestration framework for Terminal Bench | No |
| Daytona | Sandbox environment creation for benchmark execution | No |
| LangSmith | Observability/tracing platform; traces as feedback signal for improvement | Yes — [LangSmith Sandboxes](../2026-03/langsmith-sandboxes-secure-code-execution.md) |
| GPT-5.2-Codex | Primary model used (held constant across all experiments) | No |
| Claude Opus 4.6 | Alternative test run scored 59.6% | No |

---

## Action Items

- [ ] Implement PreCompletionChecklistMiddleware equivalent — intercept worker before exit, force verification pass
- [ ] Add LocalContextMiddleware pattern — inject directory structure + tool availability at agent start
- [ ] Build LoopDetectionMiddleware — track per-file edit counts, inject "reconsider approach" after N edits
- [ ] Prototype Trace Analyzer meta-loop — analyze failed agent runs to improve orchestrator harness
- [ ] Evaluate "Reasoning Sandwich" budget allocation for our worker spawning (planning phase vs implementation phase)
