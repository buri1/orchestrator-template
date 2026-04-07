# Compaction — Server-Side Context Compaction API

> **Anthropic — Claude API Docs, 2026 (beta since 2026-01-12)**

| Field | Value |
|-------|-------|
| Source | https://docs.anthropic.com/en/docs/build-with-claude/context-windows/context-compaction |
| Author | Anthropic (official documentation) |
| Publication | Claude API Docs |
| Date | 2026-01 (beta header `compact-2026-01-12`) |
| Topics | context compaction, context management, long-running agents, prompt caching, token budget, API design |
| Read Time | 15 min |

---

## Burak's Notes

> *Deep dive candidate from Thariq's prompt caching post. This is the official API spec for cache-safe compaction — the mechanism behind Claude Code's own context management. Critical for orchestrator agents that run long agentic loops and hit the 200K window.*

---

## Key Takeaways

1. **Server-side compaction is a first-class API primitive** — Not a client-side hack. The API automatically summarizes older context when input tokens exceed a configurable trigger threshold (default 150K, minimum 50K), returning a `compaction` content block that replaces all prior history.

2. **`pause_after_compaction` enables surgical context control** — When enabled, the API pauses after generating the summary and returns with `stop_reason == "compaction"`, letting you inject preserved messages (e.g., last N turns) or instruction blocks before the model continues. This is the mechanism for keeping recent tool results or critical instructions alive across compaction boundaries.

3. **Compaction + prompt caching is the production pattern** — Add `cache_control: {"type": "ephemeral"}` on system prompts separately from compaction blocks. When compaction fires, the system prompt cache stays valid; only the new summary needs writing. This directly validates Thariq's 4-tier cache layout architecture.

4. **Token budget enforcement via compaction counting** — Multiply `n_compactions * trigger_threshold` to estimate cumulative token consumption across an entire long-running task. When the budget is hit, inject a wrap-up prompt. This is how you cap total cost on agentic loops without killing the agent mid-task.

5. **Usage billing is per-iteration, not per-request** — The `usage.iterations` array separates compaction sampling from message sampling. Top-level `input_tokens`/`output_tokens` exclude compaction costs. You must aggregate across all iterations for accurate cost tracking.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly applicable to our orchestrator's long-running agent sessions. Our agents regularly approach 200K limits during multi-tool agentic loops. Compaction is the official solution for exactly this problem. |
| **Actionable** | 9/10 | Concrete API parameters, code examples, and integration patterns ready to implement. The `pause_after_compaction` + preserved messages pattern maps directly to our state management needs. |

---

## Summary

Anthropic's Compaction API provides server-side context summarization for conversations approaching context window limits. Currently in beta (header `compact-2026-01-12`), it is supported on Claude Opus 4.6 and Sonnet 4.6.

The core mechanism works by detecting when input tokens exceed a configurable trigger threshold. When triggered, the API generates a summary of the conversation, wraps it in a `compaction` content block, and continues the response with the reduced context. On subsequent requests, all content blocks before the compaction block are automatically dropped by the API.

The API offers three key configuration parameters beyond the trigger threshold. Custom `instructions` completely replace the default summarization prompt, allowing domain-specific summary formats (e.g., preserving code snippets, variable names, or technical decisions). The `pause_after_compaction` flag stops execution after summary generation, enabling developers to inject preserved messages or instructions before the model continues — critical for maintaining recent context across compaction boundaries.

A particularly valuable pattern is the token budget enforcement technique: by counting compaction events and multiplying by the trigger threshold, developers can estimate cumulative token consumption and gracefully wrap up long-running tasks before exceeding a total budget. This provides cost control without abruptly terminating agent work.

The documentation emphasizes that compaction works synergistically with prompt caching. By placing `cache_control` breakpoints on system prompts separately, the system prompt cache survives compaction events — only the new summary needs cache-writing. The `usage.iterations` array in the response provides granular billing data, separating compaction sampling costs from message sampling costs.

---

## Notable Quotes

> "This isn't just about staying under a token cap. As conversations get longer, models struggle to maintain focus across the full history."

> "The purpose of this summary is to provide continuity so you can continue to make progress towards solving the task in a future context, where the raw history above may not be accessible."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Anthropic's own deep-dive on context rot and engineering around it — referenced twice in this doc | `/ingest-article` |
| https://docs.anthropic.com/en/docs/build-with-claude/context-editing | Companion feature: fine-grained context editing (tool result clearing, thinking block clearing) | `/ingest-article` |
| https://arxiv.org/abs/2501.03276 | MRCR paper — long-context retrieval benchmark Claude is SOTA on | `/ingest-article` |
| https://arxiv.org/abs/2412.04360 | GraphWalks paper — another long-context benchmark | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Opus 4.6 | Primary supported model for compaction | N/A (model, not tool) |
| Claude Sonnet 4.6 | Supported model for compaction | N/A (model, not tool) |
| Anthropic Python SDK | All code examples use `anthropic.Anthropic()` client | Not yet catalogued |
| Prompt Caching | Synergistic feature with cache_control breakpoints | Referenced in [@trq212 post](../../posts/2026-02/trq212-prompt-caching-is-everything.md) |
| Token Counting API | `/v1/messages/count_tokens` — applies existing compaction blocks | Not separately catalogued |
| Context Editing | Companion feature for tool result / thinking block clearing | Not yet catalogued — consider `/ingest-article` |

---

## Action Items

- [ ] Integrate compaction into orchestrator agent loops — add `context_management.edits` with `compact_20260112` to all long-running agent API calls
- [ ] Implement `pause_after_compaction` pattern to preserve last N tool results and critical instruction blocks across compaction boundaries
- [ ] Add compaction-aware cost tracking using `usage.iterations` array instead of top-level usage fields
- [ ] Test custom `instructions` parameter with orchestrator-specific summarization prompts (preserve agent state, task progress, decision log)
- [ ] Implement token budget enforcement pattern (`n_compactions * trigger_threshold >= TOTAL_TOKEN_BUDGET`) for capping agentic loop costs
- [ ] Add `cache_control` breakpoint on system prompts to maximize cache hit rates across compaction events
