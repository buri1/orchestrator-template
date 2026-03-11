# 12 Factor Agents

> **Dex Horthy (James) — HumanLayer Blog, 2025-04-03**

| Field | Value |
|-------|-------|
| Source | [humanlayer.dev/blog/12-factor-agents](https://www.humanlayer.dev/blog/12-factor-agents) |
| Author | Dex Horthy (James), Co-founder @ HumanLayer |
| Publication | HumanLayer Blog |
| Date | 2025-04-03 |
| Topics | agent architecture, context engineering, LLM applications, deterministic control flow, human-in-the-loop, tool calls, agent state management |
| Read Time | ~32 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Production agents are mostly deterministic code with strategic LLM sprinkles** — The best agents don't follow "here's your prompt, here's a bag of tools, loop until you hit the goal." They are well-engineered software systems that use LLMs for specific, controlled transformations at just the right points. This directly validates our 70/30 deterministic/LLM split (Stripe pattern).

2. **Own your prompts, context window, and control flow (Factors 2, 3, 8)** — Frameworks that abstract away prompt construction, context assembly, and control flow rob you of the flexibility to experiment. Treat prompts as first-class code. Build custom control structures matching your specific use cases. Different tool calls warrant different handling (immediate execution vs. pause-for-human vs. long-running).

3. **Unify execution state and business state (Factor 5)** — Engineer applications to infer execution state from the context window itself. This gives you a single source of truth, trivial serialization, complete debugging visibility, recovery from any point, and thread forking. Maps directly to our state-in-JSON approach.

4. **Small, focused agents over monolithic ones (Factor 10)** — Even as models support longer context windows, you ALWAYS get better results with a small, focused prompt. Agents should handle 3-10 steps max (20 ceiling). This is the "agents as DAG nodes" pattern — individual focused agents composed into larger deterministic pipelines.

5. **Contact humans with tool calls (Factor 7)** — Define "request_human_input" as a structured tool call with urgency levels and response formats. This enables breaking agent loops for approval, supporting event-driven outer-loop agents, and creating durable reviewable workflows. This is the foundation for HumanLayer's entire product thesis.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | This is the foundational article for context engineering and deterministic-first agent architecture. Every factor maps to a pattern we either already use or should adopt. The 70/30 split, state-in-JSON, focused agent scoping, human-in-the-loop via tool calls, and own-your-control-flow principles are the intellectual bedrock of the L-Thread Orchestrator. |
| **Actionable** | 9/10 | Nearly every factor has a direct implementation counterpart in our system. Factor 5 (unified state) = our orchestrator-state.json. Factor 8 (own control flow) = our deterministic routing. Factor 10 (small agents) = our agent scoping. Factor 7 (human contact via tools) = our roadblock escalation. The main gap is Factor 12 (stateless reducer) which we should evaluate for our agent design. |

---

## Summary

Published in April 2025, "12 Factor Agents" is the seminal article that formalized what would later be called "context engineering." Authored by Dex Horthy (James), co-founder of HumanLayer, it draws inspiration from Heroku's classic "12 Factor App" methodology and applies the same principle-based thinking to building production-grade LLM applications.

The article's central thesis is that after interviewing 100+ startup founders and AI engineers, a clear pattern emerged: teams achieve 70-80% of desired functionality with agent frameworks, then hit a reliability ceiling where agents hallucinate, loop infinitely, or fail unpredictably. The most successful agents aren't the most "agentic" — they're well-engineered software systems that leverage LLMs for specific, controlled transformations within a mostly deterministic codebase.

The 12 factors span the full lifecycle of agent engineering: (1) Natural Language to Tool Calls as the atomic pattern, (2) Own Your Prompts as first-class code, (3) Own Your Context Window for token efficiency, (4) Tools Are Just Structured Outputs, (5) Unify Execution and Business State, (6) Launch/Pause/Resume with Simple APIs, (7) Contact Humans with Tool Calls, (8) Own Your Control Flow, (9) Compact Errors into Context Window for self-healing, (10) Small Focused Agents over monolithic systems, (11) Trigger from Anywhere, and (12) Make Your Agent a Stateless Reducer.

The article provides concrete code examples for each factor, including a basic agent loop structure, custom XML-style context formats, switch-statement control flow patterns, and thread-based state management. It repeatedly emphasizes experimental flexibility over framework conventions — "I don't know what's the best prompt, but I know you want the flexibility to be able to try EVERYTHING."

This article predates and directly influenced the RPI (Research-Plan-Implement) methodology and later the CRISPY pipeline that Dex presented at the Coding Agents conference in March 2026. It also predates the broader "context engineering" movement that became mainstream in mid-2025.

---

## Notable Quotes

> "Most of them are mostly deterministic code, with LLM steps sprinkled in at just the right points to make the experience truly magical."

> "Agents, at least the good ones, don't follow the 'here's your prompt, here's a bag of tools, loop until you hit the goal' pattern."

> "Even as models support longer and longer context windows, you'll ALWAYS get better results with a small, focused prompt and context."

> "I don't know what's the best prompt, but I know you want the flexibility to be able to try EVERYTHING."

> "Can you imagine a web app that crashed on 10% of page loads?"

---

## The 12 Factors (Reference)

| # | Factor | Core Principle |
|---|--------|---------------|
| 1 | Natural Language to Tool Calls | The atomic LLM pattern: NL input -> structured JSON -> deterministic execution |
| 2 | Own Your Prompts | Treat prompts as first-class code; reject black-box framework abstractions |
| 3 | Own Your Context Window | Manage context assembly directly; custom formats beat standard message arrays |
| 4 | Tools Are Just Structured Outputs | Tool calls are JSON describing what code should execute, not magic |
| 5 | Unify Execution State and Business State | Single source of truth; infer execution state from context window |
| 6 | Launch/Pause/Resume with Simple APIs | Straightforward APIs for lifecycle management; enable long-running ops |
| 7 | Contact Humans with Tool Calls | Human interaction as structured tool calls with urgency/format metadata |
| 8 | Own Your Control Flow | Custom control structures per use case; different tools need different handling |
| 9 | Compact Errors into Context Window | Self-healing via error context; consecutive-error counters prevent spin-outs |
| 10 | Small, Focused Agents | 3-10 step workflows max; agents as DAG nodes in larger deterministic systems |
| 11 | Trigger from Anywhere | Slack, email, SMS, crons, events — meet users where they operate |
| 12 | Make Your Agent a Stateless Reducer | Functional programming paradigm; pure state transformation |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/humanlayer/12-factor-agents | GitHub repo with full text, code examples, and community discussion | Already ingested (this entry covers the content) |
| https://hamel.dev/blog/posts/prompt/ | Hamel Husain's prompt engineering post, cited as key reference for Factor 2 | `/ingest-article` |
| https://12factor.net/ | The original 12 Factor App methodology that inspired this article | Background reference only |
| https://github.com/boundaryml/baml | BAML — referenced as a tool for structured LLM outputs (Factor 4) | `/tool-catalogue` |
| https://humanlayer.dev | HumanLayer platform — implements Factors 6, 7, 11 as a product | `/tool-catalogue` |
| RPI to CRISPY talk (Dex, March 2026) | Evolution of this article's principles into a 7-phase pipeline | Already in catalogue: [dex-rpi-crispy-brownfield-agents](../../talks/2026-03/dex-rpi-crispy-brownfield-agents.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| HumanLayer | Author's company; implements human-in-the-loop as a product | Not yet catalogued — consider `/tool-catalogue` |
| CrewAI | Cited as example of "black box" framework approach to avoid | [Yes](../../orchestration-platforms/crew-ai.md) |
| LangChain | Cited alongside CrewAI as framework that obscures prompts | Referenced in many entries |
| LangGraph | Mentioned as DAG orchestrator | [Yes](../../orchestration-platforms/langgraph.md) |
| Inngest | Listed as modern DAG orchestrator | [Yes](../../orchestration-platforms/inngest.md) |
| Prefect | Listed as DAG orchestrator | [Yes](../../orchestration-platforms/prefect.md) |
| BAML (Boundary ML) | Referenced for structured output generation | Not yet catalogued — consider `/tool-catalogue` |
| Stripe API | Used in Factor 1 example (payment link creation) | N/A (external API) |
| Slack | Referenced in Factor 11 (trigger from anywhere) | N/A (external platform) |
| Linear | Referenced as issue tracking integration | N/A (external platform) |
| OpenAI Assistants API | Referenced as standard message format example | N/A (API reference) |
| Apache Airflow | Historical DAG orchestrator reference | N/A (background context) |
| Dagster | Historical DAG orchestrator reference | N/A (background context) |
| Windmill | Historical DAG orchestrator reference | N/A (background context) |

---

## Mapping to L-Thread Orchestrator

| 12 Factor | Our Implementation | Gap? |
|-----------|-------------------|------|
| 1. NL to Tool Calls | Agent task decomposition via prompts | None |
| 2. Own Your Prompts | Custom agent personas in `.claude/agents/` | None |
| 3. Own Your Context Window | State files + CLAUDE.md + agent-specific context | None |
| 4. Tools Are Structured Outputs | Tool calls via Claude Code tools | None |
| 5. Unified State | `orchestrator-state.json` / `orchestrator-teams-state.json` | None |
| 6. Launch/Pause/Resume | Tmux sessions + state persistence | Partial — no webhook resume |
| 7. Contact Humans | Roadblock recovery + AUTO_MODE check | Partial — not structured as tool calls |
| 8. Own Control Flow | Deterministic routing in orchestrator | None |
| 9. Compact Errors | Agent retry logic + roadblock logging | None |
| 10. Small Focused Agents | Scoped agent personas, 2-3 max per team | None |
| 11. Trigger from Anywhere | CLI-only currently | Gap — no Slack/email triggers |
| 12. Stateless Reducer | Not yet implemented | Gap — evaluate for agent design |

---

## Action Items

- [ ] Ingest Hamel Husain's prompt engineering post (cited as key Factor 2 reference)
- [ ] Evaluate BAML for structured output generation in our agent tool calls
- [ ] Implement Factor 11 (Trigger from Anywhere) — Slack/webhook triggers for orchestrator
- [ ] Evaluate Factor 12 (Stateless Reducer) pattern for agent redesign
- [ ] Consider `/tool-catalogue` for HumanLayer platform itself
