# Context Management for Deep Agents

> **Chester Curme & Mason Daugherty -- LangChain Blog, 2026-01-28**

| Field | Value |
|-------|-------|
| Source | https://blog.langchain.com/context-management-for-deepagents/ |
| Author | Chester Curme & Mason Daugherty (LangChain) |
| Publication | LangChain Blog |
| Date | 2026-01-28 |
| Topics | context management, context compression, summarization, deep agents, tiered compression, filesystem offloading |
| Read Time | 5 min |

---

## Burak's Notes

> Directly maps to our compaction strategy. We currently do single-tier compaction (Anthropic's `compact_20260112` API). This article validates multi-tier as strictly better: offload big tool results first (cheap), then offload old write inputs (medium), only then summarize (expensive + lossy). Should adopt tiers 1+2 before tier 3 per ADOPTABLE-PATTERNS 3.15. The 85% threshold matches our intuition but the 20K token trigger for tier 1 is a concrete number we can steal immediately. "Most insidious failure mode is goal drift after summarization" -- exactly what we see when orchestrator compacts mid-loop.

---

## Key Takeaways

1. **Three-tier compression beats single-tier** -- Offload large tool results first, then large tool inputs, only then summarize. Each tier is progressively more lossy, so deferring to the cheapest mechanism first preserves more context.
2. **Filesystem as infinite external memory** -- All tiers use the filesystem as canonical record. Offloaded content, truncated inputs, and full pre-summarization conversation history are all written to disk and remain retrievable.
3. **Goal drift is the #1 failure mode** -- After summarization, agents can lose track of the user's original intent. Needle-in-haystack tests and targeted evals are needed to verify recoverability, not just task completion benchmarks.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly maps to our orchestrator compaction; we do single-tier (Anthropic compact API), this gives a concrete multi-tier upgrade path |
| **Actionable** | 7/10 | Tier 1 (offload large tool results at 20K tokens) and Tier 2 (offload old write inputs at 85%) are immediately adoptable; Tier 3 summarization structure (intent + artifacts + next steps) improves our existing compact prompts |

---

## Summary

As AI agents tackle increasingly long-horizon tasks, context management becomes the critical bottleneck. The LangChain Deep Agents SDK implements a three-tier compression strategy that progressively reduces context pressure while preserving task-relevant information.

**Tier 1: Offloading Large Tool Results.** When any tool response exceeds 20,000 tokens, the full content is written to the filesystem and replaced in-context with a file path reference plus a 10-line preview. This is the cheapest intervention -- zero information loss since the full content remains on disk.

**Tier 2: Offloading Large Tool Inputs.** When context crosses 85% of the model's available window, old write/edit tool call arguments are truncated from conversation history and replaced with filesystem pointers. The rationale: file content already exists on disk, so carrying it in context is redundant.

**Tier 3: Summarization.** When offloading yields insufficient space, an LLM generates a structured summary (session intent, artifacts created, next steps) that replaces the full conversation history. The original messages are preserved on disk as the canonical record. This is the most aggressive and most lossy tier.

The authors emphasize that compression is only useful if critical information remains accessible. They recommend evaluating on real benchmarks (terminal-bench) first, then stress-testing individual compression features by lowering thresholds aggressively (10-25% of context window). The "most insidious failure mode" is goal drift -- an agent that continues working but has lost track of the user's original intent after summarization. Needle-in-haystack tests verify that agents can recover specific details from filesystem after compression events.

---

## Notable Quotes

> "Context compression refers to techniques that reduce the volume of information in an agent's working memory while preserving the details relevant to completing the task."

> "The most insidious failure mode is an agent that loses track of the user's intent after summarization."

> "Context compression is only useful if critical information remains accessible."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://research.trychroma.com/context-rot | Context rot research -- degradation mechanics | `/ingest-article` |
| https://www.tbench.ai/ | terminal-bench: real-world agent benchmark | `/ingest-article` |
| https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/ | METR long-task measurement methodology | `/ingest-article` |
| https://docs.langchain.com/oss/python/deepagents/overview | Deep Agents SDK docs | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Deep Agents SDK | LangChain's batteries-included agent harness with planning, subagents, filesystem | No |
| LangSmith | Trace visualization for compression events | Yes -- [LangSmith Sandboxes](../langsmith-sandboxes-secure-code-execution.md) |
| terminal-bench | Real-world agent task benchmark used for evaluation | No |
| Chroma Context Rot | Research on context degradation mechanics | No |

---

## Action Items

- [ ] Adopt Tier 1: offload tool results >20K tokens to filesystem before they enter context (per ADOPTABLE-PATTERNS 3.15)
- [ ] Adopt Tier 2: truncate old write/edit inputs at 85% threshold, replace with file pointers
- [ ] Restructure our compaction prompt to use the 3-field summary format (session intent, artifacts created, next steps)
- [ ] Add needle-in-haystack recovery test to our orchestrator eval suite
- [ ] Monitor for goal drift after compaction events -- log original intent and compare post-compaction behavior
