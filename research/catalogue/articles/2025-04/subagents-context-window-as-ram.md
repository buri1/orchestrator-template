# I Dream About AI Subagents; They Whisper to Me While I'm Asleep

> **Geoffrey Huntley — ghuntley.com, 2025-04-13**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/subagents |
| Author | Geoffrey Huntley (Sourcegraph/Amp engineer, Ralph Wiggum Loop creator) |
| Publication | ghuntley.com |
| Date | 2025-04-13 (updated 2025-06-08) |
| Topics | subagents, context windows, agent architecture, memory management, multi-agent |
| Read Time | ~2 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Context windows are RAM, not magic** -- Huntley extends his recurring systems-programming metaphor: LLM context windows are like RAM in an IBM 8086 XT. They are a precious, finite resource, but engineers and developer tooling companies do not treat them as such. We are in another "640KB should be enough for anyone" era.

2. **Agent death spirals burn the main context** -- When an LLM produces a bad outcome within a single-context-window agent loop, the agent death-spirals: it brute-forces recovery attempts in the same polluted context, consuming precious tokens and compounding the problem. The current generation of coding agents all operate via tight tool-call loops within a single context window.

3. **Subagents as SWAP space** -- The proposed solution: spawn a sub-agent with a cloned (fresh) context window. The main agent pauses, the sub-agent burns through its own context (like SWAP memory), produces concrete next steps, and returns results to the parent. The main context stays clean.

4. **Practical context ceiling at 147-152K** -- Claude 3.7's advertised 200K context window clips in quality at the 147-152K mark. Tool-call-to-tool-call invocation starts failing. This makes context conservation even more critical.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is literally our architecture. The L-Thread Orchestrator spawns agents with fresh contexts, never pollutes the orchestrator's own context with code, and treats agent sessions as disposable. Huntley arrived at the same conclusion from a single-agent perspective -- we implemented it as a multi-agent system. |
| **Actionable** | 6/10 | Short conceptual piece -- the idea is powerful but the article is a thought experiment, not an implementation guide. The actionable value is in the mental model (context=RAM, subagent=SWAP) which we can use to explain and refine our architecture. |

---

## Summary

Geoffrey Huntley draws a direct parallel between LLM context windows and RAM in early personal computers. He argues that the industry is in another "640KB should be enough" era -- context windows are precious and finite, but current coding agents waste them by running tight tool-call loops within a single context window.

The core problem he identifies is the "death spiral": when an agent produces a bad result, it tries to recover within the same polluted context, burning through tokens and compounding errors. This is analogous to a program exhausting its RAM with no way to free memory.

His proposed solution is the subagent pattern: the main agent spawns a child agent with a fresh context window. The parent pauses, the child does the heavy lifting in its own context (like virtual memory SWAP), and returns concrete results to the parent. This keeps the parent's context clean and focused.

At the time of writing (April 2025), Huntley frames this as theoretical -- "I haven't looked into it" -- but the pattern he describes is essentially what multi-agent orchestration systems (including our L-Thread Orchestrator) implement in practice. By June 2025, Claude Code's Agent Teams and subagent features would make this a first-class capability.

---

## Notable Quotes

> "LLM context windows are like RAM in an IBM 8086 XT and are a precious resource, but engineers and developer tooling companies do not treat them as such."

> "What if an agent could spawn a new agent and clone the context window? ... The main agent would pause, wait for the sub-agent to burn through its own context window (ie. SWAP), and then provide concrete next steps for the primary agent."

> "We are in another era of '640kb should be enough for anyone,' and folks need to start thinking about how the current generation of context windows is similar to RAM on a computer in the 1980s."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/redlining | Companion article: "if you are redlining the LLM, you aren't headlining" -- context management strategies | `/ingest-article` |
| https://link.springer.com/article/10.1007/s10664-005-4858-z | Academic paper on developer context management -- "Latent Patterns in Activities" | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude 3.7 | Example of advertised vs real context window (200K advertised, 147-152K practical) | N/A (model, not tool) |
| MCP | Referenced in page metadata | Yes -- [MCP Ecosystem Orchestration](../reference/mcp-ecosystem-orchestration.md) |

---

## Action Items

- [ ] Use the "context=RAM, subagent=SWAP" mental model in orchestrator documentation to explain why we spawn fresh agents
- [ ] Cross-reference with the "redlining" companion article when ingested
- [ ] Validate our own context ceiling observations -- do we see degradation at 147-152K?
