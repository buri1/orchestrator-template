# Software Modularity Is More Important Than Ever Because Agents Are Forgetful

> **@GeoffreyHuntley — 2026-03-27**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/GeoffreyHuntley/status/2036878840413278411) |
| Author | @GeoffreyHuntley — Geoffrey Huntley, open-source maintainer, agent engineering practitioner |
| Date | 2026-03-27 |
| Topics | software modularity, agent limitations, context windows, code architecture, software design |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Agent forgetfulness demands modular architecture** — The core argument: because AI agents have limited context windows and "forget" across sessions, software must be split into small, self-contained modules. A monolithic codebase that requires understanding the whole system is hostile to agent-based development.

2. **Modularity as agent-compatibility** — This reframes the classic software engineering principle of modularity through a new lens: not just for human maintainability, but for agent effectiveness. Small modules mean each agent task can be completed within a single context window without needing system-wide knowledge.

3. **Validates our worktree + per-task isolation approach** — Our orchestrator already embodies this principle: each agent gets a focused task in an isolated worktree with scoped context. Huntley's post provides the theoretical backing for why this works better than throwing agents at large monoliths.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly validates Master Blueprint principle #3 (context is zero-sum) and principle #4 (coordination overhead scales at exponent 1.724). The argument that modularity enables better agent performance is exactly why our orchestrator uses per-task agent isolation. This also connects to the Codified Context paper's finding that 108K-line systems need multi-tier context — modular code reduces context requirements per agent interaction. Huntley is a consistently high-signal practitioner. |

---

## Full Content

Software modularity is more important than ever because agents are forgetful and you need to split things into small modules.

[Post argues that the rise of AI coding agents makes software modularity a first-class architectural requirement rather than a nice-to-have. Agents with limited context windows perform dramatically better when code is organized into small, self-contained modules that can be understood independently.]

---

## Notable Replies

[Replies not directly accessible — 21 replies, 14 reposts, 140 likes, 9.8K views at time of ingestion. Niche but high-signal audience (Geoffrey Huntley's followers skew toward agent engineering practitioners).]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| — | No external URLs identified in available context | — |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| — | Post is a design principle argument, not tool-specific | — |
