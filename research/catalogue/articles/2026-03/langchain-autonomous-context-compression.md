# Autonomous Context Compression

> **LangChain — LangChain Blog, 2026-03-11**

| Field | Value |
|-------|-------|
| Source | https://blog.langchain.com/autonomous-context-compression/ |
| Author | LangChain |
| Publication | LangChain Blog |
| Date | 2026-03-11 |
| Topics | context compression, context management, compaction, model-triggered summarization, Deep Agents, agent memory |
| Read Time | 4 min |

---

## Burak's Notes

> *This is the missing piece for our PreCompact hook (`orchestrator-handoff.sh`) and ADOPTABLE-PATTERNS 3.15. We currently only compact at forced 99% thresholds. LangChain's approach — let the model decide WHEN to compact at clean task boundaries — is exactly what we need. The key insight: expose compaction as a tool the agent can call, not a rule that fires at a token count. Their conservative approach (models compress sparingly but strategically) matches our experience: bad compaction timing loses critical state, good timing preserves everything that matters. Integrate with our existing `orchestrator-handoff.sh` by adding a model-invokable summarization step before forced compaction.*

---

## Key Takeaways

1. **Model-triggered compaction beats hard thresholds** — Instead of compacting at fixed token percentages (85%, 90%), expose a "compact now" tool and let the model choose when. Models recognize clean task boundaries (after extracting results, before consuming new context, when decisions supersede prior context) far better than token counters.
2. **Conservative by design** — Agents tend to compress sparingly but strategically when they do trigger it. This is intentional: a bad compaction that destroys critical context mid-task is worse than running close to the window limit. The system favors under-compaction over over-compaction.
3. **Preservation strategy: recent 10% + summary** — Default approach retains the most recent 10% of available context window verbatim and summarizes everything preceding it. Recent messages including the compaction tool call itself are preserved post-compression.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly maps to our `orchestrator-handoff.sh` PreCompact hook and ADOPTABLE-PATTERNS 3.15 (Context Compaction with Artifact Survival). Our current approach is forced compaction at 99% — this gives us the model-triggered intermediate layer we've been missing. |
| **Actionable** | 9/10 | Concrete implementation: expose compaction as a tool in the orchestrator agent's toolset; enhance handoff.sh to offer self-summarization before forced compaction; adopt the "recent 10% + summary" preservation ratio; add clean-task-boundary detection to our compaction logic. |

---

## Summary

The article addresses "context rot" — the degradation of agent performance as conversation history grows and fills the finite context window. Rather than relying on fixed token thresholds (e.g., compact at 85% of context limit), LangChain's Deep Agents SDK exposes compaction as a model-invokable tool. The model itself decides when to trigger compression, choosing opportune moments like completed task boundaries, after extracting results from large context blocks, or before consuming substantial new context.

The implementation uses a separate middleware (`create_summarization_tool_middleware`) added to `create_deep_agent`. When the model triggers it, the system retains the most recent 10% of the context window verbatim and summarizes all preceding content. The feature follows "The Bitter Lesson" principle — harnesses should get out of the way and leverage improvements in underlying reasoning models rather than imposing rigid rules.

LangChain takes an intentionally conservative approach. Models compress sparingly, but when they do, they choose strategically beneficial moments. The system includes a safety net: agents can recover full conversation history from a virtual filesystem, making compaction reversible. The feature ships enabled in the Deep Agents CLI and as opt-in for the SDK.

Testing used LangSmith traces and internal Deep Agents CLI coding tasks. Notably, on Terminal-bench-2, no autonomous compaction was observed — the model didn't need it. This validates the conservative design: compaction should be a strategic choice, not an automatic behavior.

---

## Notable Quotes

> "Harnesses should get out of the way and take advantage of improvements in the underlying reasoning models."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://docs.langchain.com/oss/python/deepagents | Deep Agents SDK docs — full middleware API for context compression | Already ingested: [Deep Agents](../../agent-harnesses/deep-agents.md) |
| https://blog.langchain.com/context-management-for-deepagents | Companion article on broader context management strategies | `/ingest-article` |
| https://incompleteideas.net/IncIdeas/BitterLesson.html | Rich Sutton's Bitter Lesson — foundational principle behind the design | Reference only |
| https://github.com/langchain-ai/deepagents | Deep Agents source — middleware implementation details | Already ingested: [Deep Agents](../../agent-harnesses/deep-agents.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Deep Agents SDK | Primary implementation vehicle for autonomous compaction | [Yes](../../agent-harnesses/deep-agents.md) |
| Deep Agents CLI | Ships with compaction enabled by default | [Yes](../../agent-harnesses/deep-agents.md) |
| LangSmith | Used for trace-based evaluation of compaction behavior | [Yes](../../observability/langsmith.md) |
| StateBackend | Backend protocol for conversation state persistence | [Yes](../../agent-harnesses/deep-agents.md) (part of Deep Agents) |

---

## Action Items

- [ ] Enhance `orchestrator-handoff.sh` PreCompact hook: add model-invokable self-summarization step before forced compaction (ADOPTABLE-PATTERNS 3.15)
- [ ] Implement "recent 10% + summary" preservation ratio as default compaction strategy
- [ ] Add clean-task-boundary detection: compact after task completion, before new task ingestion, when prior decisions are superseded
- [ ] Evaluate exposing compaction as an explicit tool in our orchestrator agent's toolset (not just a hook)
- [ ] Ingest companion article: https://blog.langchain.com/context-management-for-deepagents
