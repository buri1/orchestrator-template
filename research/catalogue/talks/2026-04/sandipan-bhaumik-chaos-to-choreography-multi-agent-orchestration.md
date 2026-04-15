# From Chaos to Choreography: Multi-Agent Orchestration Patterns That Actually Work

> **Sandipan Bhaumik (Databricks) — AI Engineer Conference, 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=2czYyrTzILg |
| Speaker | Sandipan Bhaumik — Lead Data & AI Solutions Architect, Databricks (prev. AWS EMEA Analytics Tech Lead) |
| Channel | AI Engineer (@aiDotEngineer) |
| Duration | ~25-30 min (conference talk) |
| Date | 2026 (AI Engineer conference) |
| Topics | multi-agent orchestration, choreography vs orchestration, state management, circuit breakers, immutable state snapshots, production architecture, failure recovery, distributed systems, LangGraph, observability, race conditions, regulated industries |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Multi-agent is a distributed systems problem, not a feature** — Moving from a single agent to multiple agents transforms the challenge from "AI feature development" into a full distributed systems engineering problem. The exponential increase in complexity catches most teams off-guard because they treat multi-agent as a simple scaling exercise.

2. **Choreography vs. orchestration is the foundational architectural decision** — Two primary coordination patterns exist: (a) Choreography, where agents coordinate through events and a message bus, each autonomous and loosely coupled; (b) Orchestration, where a central orchestrator directs workflow by calling agents sequentially or in parallel. The decision matrix: choreography suits loosely coupled workflows with high agent autonomy and frequent agent additions; orchestration is preferred for complex dependencies, centralized rollback capability, and stable workflows.

3. **Immutable state snapshots prevent the stale data catastrophe** — Bhaumik shares a production war story: a credit scoring system failed due to a race condition where a credit score calculation agent wrote a score of 750 to the database, but a subsequent risk assessment agent operating with stale cached data read an outdated score of 680. Root cause: a caching layer without proper invalidation. Immutable state snapshots eliminate this entire class of failures.

4. **Circuit breakers are mandatory for production multi-agent systems** — Borrowed from microservices architecture, circuit breakers monitor agent calls and "open" after consistent failures (e.g., 5 consecutive), preventing further calls for a timeout period. This protects the system from cascading failures and gives failing agents time to recover.

5. **Orchestration offers more control and simpler debugging** — While choreography provides elegance and loose coupling, orchestration wins in practice for most enterprise use cases because it offers centralized control, easier debugging, and simpler rollback. The traceability advantage is critical in regulated industries like financial services and healthcare.

6. **Hub-and-spoke is the right starting architecture** — One coordinator agent managing 2-4 specialist workers. The coordinator routes tasks, handles dependencies, and integrates results. Workers report back to the hub rather than communicating peer-to-peer. This prevents the chaos of fully-connected networks while avoiding bottlenecks of strict hierarchies.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses the orchestration vs. choreography decision we made (we chose orchestration). The hub-and-spoke pattern IS our tmux orchestrator + worker architecture. The immutable state snapshot recommendation validates our `orchestrator-tmux-state.json` approach. Circuit breaker pattern is something we should adopt for worker failure handling. The credit scoring race condition war story mirrors the kind of shared-state conflicts we hit before switching to git worktrees. |
| **Actionable** | 7/10 | The decision matrix (choreography vs orchestration) provides a clear framework for evaluating our architecture. Circuit breakers could be added to our worker monitoring loop. The "agent-washing" warning (testing if your agents are truly specialized or just different prompts) is a useful self-audit. The immutable state pattern reinforces our state file approach. |

---

## Summary

Sandipan Bhaumik, Lead Data & AI Solutions Architect at Databricks with 18+ years in distributed data systems, presents a practitioner's guide to making multi-agent AI systems work in production. His central thesis: most teams underestimate the leap from single-agent to multi-agent systems because they fail to recognize it as a distributed systems problem requiring the same engineering rigor as microservices architectures.

The talk is structured around two primary coordination patterns. **Choreography** has agents coordinating through events and a message bus, where each agent is autonomous and loosely coupled -- ideal for workflows where agents are frequently added or modified and high autonomy is desired. **Orchestration** uses a central orchestrator to direct workflow by calling agents sequentially or in parallel, with agents being relatively "dumb" executors of specific tasks. Bhaumik presents a decision matrix: choreography excels for loosely coupled, high-autonomy, frequently-changing agent ecosystems; orchestration wins for complex dependencies, centralized rollback needs, and stable workflows.

The production architecture section emphasizes the critical role of a workflow engine (he references LangGraph as an example) that manages the workflow graph, state store, and observability layer. Three pillars support production readiness: (1) immutable state snapshots to prevent race conditions and stale data, (2) circuit breakers to prevent cascading failures across agents, and (3) distributed tracing for end-to-end observability of agent decision chains.

Bhaumik drives the state management point home with a compelling war story from a credit scoring system. A credit score calculation agent successfully wrote a score of 750 to the database, but a subsequent risk assessment agent operating with stale cached data read an outdated score of 680. The root cause was a caching layer without proper cache invalidation -- a classic distributed systems problem that immutable state snapshots would have prevented entirely.

For teams starting out, he recommends the hub-and-spoke pattern: one coordinator agent managing 2-4 specialist workers, with workers reporting to the hub rather than communicating peer-to-peer. This balances the chaos of fully-connected agent networks against the bottlenecks of strict hierarchies. He warns against "agent-washing" -- building multiple agents when a single LLM with function calling would suffice -- and offers a litmus test: "Can you clearly articulate why agent specialization provides value?"

Bhaumik also introduces the concept of "agent debt" (analogous to technical debt) where organizations deploy AI agents without proper evaluation frameworks, governance, or observability, accumulating systemic risks that compound over time and become increasingly expensive to remediate. His evaluation-first approach emphasizes defining success metrics before deployment: faster resolution time, better understanding, actual progress -- not just rapid responses.

The talk is grounded in Bhaumik's experience across regulated industries (financial services, healthcare) and his work founding the AgentBuild community (newsletter.agentbuild.ai), a global community for practical AI agent implementation.

---

## Notable Quotes

> "Most conversational AI gets deployed without defining success." -- on the evaluation-first imperative

> "Can you clearly articulate why agent specialization provides value?" -- the agent-washing litmus test

> "Governed communication means your agents can explain decisions and you can audit them later." -- on governance as trust

> "40% of agentic AI projects will be scrapped by 2027 -- primarily due to cooperation failures, not technical limitations." -- on production reality

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://newsletter.agentbuild.ai/p/why-multi-agent-systems-are-eating | Bhaumik's detailed newsletter on multi-agent enterprise patterns; hub-and-spoke, agent-washing, observability requirements | `/ingest-post` |
| https://docs.databricks.com/aws/en/generative-ai/guide/agent-system-design-patterns | Databricks official agent design patterns guide; production-grade patterns from the platform perspective | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| LangGraph | Referenced as example orchestration engine managing workflow graph + state store + observability | Yes -- [LangGraph](../../orchestration-platforms/langgraph.md) |
| Databricks | Speaker's company; enterprise AI platform with agent design pattern guidance | No -- enterprise platform, not a tool |
| AgentBuild.ai | Speaker's community newsletter for enterprise agent builders | No -- community resource |

---

## Action Items

- [ ] Evaluate circuit breaker pattern for our tmux worker monitoring loop (detect N consecutive failures, pause agent, alert)
- [ ] Audit our current agents against the "agent-washing" litmus test -- are they truly specialized?
- [ ] Consider adding cache invalidation / immutable snapshot semantics to our state management
- [ ] Review the Databricks agent design patterns guide for additional production patterns
