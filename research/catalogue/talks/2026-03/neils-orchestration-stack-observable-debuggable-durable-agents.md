# The Orchestration Stack for Observable, Debuggable, and Durable Agents

> **Neils Bentilan (Union / Flyte) — Coding Agents: AI Driven Dev Conference 2026, March 2026**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (01:40:45 - 02:10:12) |
| Speaker | Neils Bentilan — Chief ML Engineer, Union (Flyte) |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~30 min |
| Date | 2026-03 |
| Topics | agent infrastructure, durability, observability, self-healing, orchestration, replay logs, caching, sandboxes, Flyte 2.0 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Infrastructure failures are the blind spot in agent systems** — Most agent evals and recovery mechanisms focus on semantic/logical failures (hallucination, wrong tool args), but production agents fail far more often at the infrastructure layer: OOM errors, spot instance preemptions, network outages, scheduler kills. Agents can self-recover from these if given the right context and capabilities.

2. **Context engineering is also an infra problem** — If a failure wipes agent state, all hard-earned context is lost. Durability (replay logs, global caching, intermediate state persistence) is what makes context engineering actually work in production. The three building blocks: replay logs (per-run micro-cache), global caching (cross-run shared work), and intermediate state persistence (automatic serialization to object store).

3. **Exceptions are the perfect delivery mechanism for infra context** — Using plain Python try/except, agents can catch OOM errors, timeout errors, and system-level failures, then reason about them and self-heal. The key insight: bubble infrastructure errors up into the agent's agentic loop so it can respond (e.g., provision more memory, add missing dependencies).

4. **"Code mode" sandboxes enable tight self-healing loops** — Two sandbox types: (1) Code mode (restricted Python with no IO/network, agent writes pure orchestration code using its toolbox), and (2) Stateless code sandbox (one-shot with third-party libs and limited IO). Both enable the agent to fix its own orchestration bugs in a tight inner loop without out-of-band evals.

5. **Aim for cheap failures, not failure-proof systems** — The design goal is not to prevent failures but to make recovery fast and cheap. Replay logs skip completed steps on retry, failed runs become training data/context for the agent, and human-in-the-loop is the final recourse when the agent exhausts its iteration budget.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses the durability and crash-recovery layer we need for production agents. The replay log pattern maps to our tmux recovery + state persistence. Infrastructure-as-context is what we're doing with error bubbling in our orchestrator. The Dragonfly case study (250K products, 2000+ concurrent runs) validates the scaled ambient agent pattern. |
| **Actionable** | 7/10 | The six design principles are immediately applicable. Replay logs and global caching are patterns we should consider for our state management. The "exceptions as context delivery" pattern validates our try/catch approach in bash orchestration. The Dragonfly tiered architecture (driver -> coordinator -> researcher -> tools) is a reference for scaling beyond our current 2-3 agent setup. |

---

## Summary

Neils Bentilan, Chief ML Engineer at Union (the company behind the Flyte orchestration platform), presents lessons learned from 5 years building production ML orchestration and more recently productionizing agentic systems. His central thesis: agents fail at multiple layers of an orchestration stack (infrastructure, network, logical, semantic, tool execution, context), but most agent builders only handle the upper layers. The infrastructure layer remains a blind spot that causes the most painful production failures.

The talk introduces three core building blocks for durable agent systems. First, **replay logs** — a service that records agent state and subtask outputs at granular per-step level, enabling crash recovery without re-executing completed work. Second, **global caching** — cross-run shared computation so deterministic tool calls (web searches, DB reads) are not duplicated across agent runs. Third, **intermediate state persistence** — automatic serialization of all agent state and tool outputs to object storage via functional decorators, eliminating manual serialization code.

Bentilan then walks through six design principles distilled from Union's experience: (1) Use plain Python/TypeScript that LLMs already know, avoiding DSL surprises; (2) Provide functional hooks for durability via decorators (trace, checkpoint, persist); (3) Make failures cheap with automatic step-skipping on recovery; (4) Treat infrastructure as context by bubbling OOM errors and system failures into the agent loop; (5) Enable agent self-healing through code mode sandboxes (restricted Python where agents write orchestration code) and stateless sandboxes (one-shot execution with third-party libs); (6) Human-in-the-loop as the final recourse when the agent exhausts its iteration budget.

The talk concludes with a compelling case study of Dragonfly, a deep research SaaS customer that built an automated solutions architect processing 250K+ software products. Their tiered architecture (4 agent drivers -> 8 research coordinators -> 12 researchers -> 12 tool replicas) used Flyte's durability primitives to achieve 2,000+ concurrent runs, 50% reduction in failure recovery time, 30% increase in development velocity, and 12 hours/week saved on infrastructure maintenance. Their innovation of "semantic convergence detection" — grouping and consolidating duplicate research threads at the coordinator layer — is particularly noteworthy.

In Q&A, Bentilan recommends starting with a single agent plus sub-agents (not deep hierarchies), noting that the 4-tier Dragonfly architecture was an exceptional case driven by their scale requirements. For internal use cases at Union, single agent with tools or agent + one sub-agent layer works well — echoing the 2-3 agent optimum from coordination overhead research.

---

## Notable Quotes

> "The problem isn't that agents fail. It's that recovering from failure is challenging without the full context of how infra, networking, logical, semantic layers all interact." — [01:47:45]

> "Context engineering is also an infra problem. If a failure wipes the agent state, then all the hard-earned context that you've implemented in your agent loop is worthless." — [01:52:01]

> "Exceptions are actually a perfect delivery mechanism for critical context about failures at all layers of the stack." — [01:56:50]

> "Don't aim for failure-proof. Aim for cheap failures, fast recovery, and a very tight quick agent loop feedback." — [02:07:44]

> "Agents are telling us: help me, help you. Agents now are very capable of helping themselves if they have the right context." — [02:08:06 paraphrased from 01:48:09]

> "Generally I just start with one [agent] and then one sub-agent layer... the sub-agents can do different things." — [02:10:02]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/flyteorg/flyte | Flyte 2.0 with durability primitives, replay logs, and containerized task isolation — directly relevant to our crash recovery needs | `/tool-catalogue` |
| https://union.ai | Union's commercial platform built on Flyte; the managed version with the durability features described | `/tool-catalogue` |
| https://github.com/pydantic/pydantic-monty | Restricted Python execution sandbox mentioned by Bentilan; used for code mode sandboxes | `/tool-catalogue` |
| https://www.boundaryml.com/docs/home | BAML — used by Dragonfly customer; onboarded local BAML agent prototype to production in ~1 hour | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Flyte / Flyte 2.0 | Core subject — ML orchestration platform with durability, replay logs, caching, containerized tasks | No — consider `/tool-catalogue` |
| Union | Commercial platform behind Flyte; speaker's company | No — consider `/tool-catalogue` |
| BAML | Used by Dragonfly customer for their agent prototype | No — consider `/tool-catalogue` |
| Pydantic Monty | Used for restricted Python sandbox (code mode) | No — consider `/tool-catalogue` |
| LangChain | Mentioned as 2024 prototyping tool | Yes — [LangGraph](../orchestration-platforms/langgraph.md) (related) |
| Cursor | Mentioned as coding tool in adoption timeline | Yes — [Cursor](../developer-gui/cursor.md) |
| Claude Code | Mentioned as coding agent tool | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) |
| OpenClaw | Referenced audience question about installing it | Yes — [OpenClaw](../orchestration-platforms/openclaw.md) |
| Kubernetes | Infrastructure layer for Flyte task execution (pods, containers) | N/A — infrastructure primitive |
| Dragonfly | Customer case study — deep research SaaS, 250K products | No — SaaS product, not a tool |

---

## Action Items

- [ ] Evaluate Flyte 2.0 replay log pattern for potential adoption in our state persistence layer
- [ ] Study the "infrastructure as context" pattern — can we bubble tmux/container errors into agent prompts?
- [ ] Look into Pydantic Monty for restricted sandbox execution in our worker agents
- [ ] Consider the Dragonfly "semantic convergence detection" pattern for deduplicating parallel agent work
- [ ] Compare Flyte's durability approach with Temporal and Trigger.dev (already in catalogue)
- [ ] Assess whether BAML is worth a `/tool-catalogue` entry given the fast onboarding claim
