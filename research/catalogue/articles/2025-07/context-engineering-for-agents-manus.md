# Context Engineering for AI Agents: Lessons from Building Manus

> **Yichao 'Peak' Ji -- Manus Blog, 2025-07-18**

| Field | Value |
|-------|-------|
| Source | https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus |
| Author | Yichao 'Peak' Ji (Co-founder, Manus) |
| Publication | Manus Blog |
| Date | 2025-07-18 |
| Topics | context engineering, KV-cache optimization, agent architecture, tool masking, file-as-memory, attention manipulation, error recovery |
| Read Time | 8-10 min |

---

## Burak's Notes

> *Deep dive candidate from Thariq's prompt caching post. Manus rebuilt their agent framework 4 times -- "Stochastic Graduate Descent." Several patterns directly map to our orchestrator architecture: KV-cache awareness aligns with Thariq's 4-tier cache layout, file-as-context validates our approach to agent memory, and the todo.md recitation trick is essentially what our agents already do with state files. The 100:1 input-to-output ratio is a critical number for cost modeling.*

---

## Key Takeaways

1. **KV-cache hit rate is the single most important metric for production agents** -- Manus agents have a ~100:1 input-to-output token ratio. Stable prefixes, append-only contexts, and deterministic serialization are essential. Claude Sonnet charges 10x more for uncached vs cached input tokens ($3 vs $0.30/MTok).

2. **Mask tool availability via logits, never add/remove tools dynamically** -- Changing tool definitions mid-conversation invalidates the KV-cache and confuses the model when prior context references now-absent tools. Instead, use token logit masking and response prefilling with consistent tool name prefixes (e.g., `browser_`, `shell_`).

3. **File system as unlimited external memory with restorable compression** -- Treat files as structured externalized memory, not just storage. Compress context by removing content but keeping paths/URLs, allowing the agent to re-read on demand. This makes compression reversible, unlike truncation.

4. **Recitation defeats lost-in-the-middle** -- Manus agents create and continuously update a `todo.md` file, effectively reciting objectives into the end of the context window. This manipulates attention to maintain goal alignment across ~50 tool calls per task.

5. **Keep failed actions in context -- error erasure destroys learning signal** -- Removing failed action traces prevents the model from updating its internal beliefs. Error recovery is "perhaps the clearest indicator of genuine agentic behavior" but remains underrepresented in benchmarks.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses context engineering for multi-step agents -- core to our orchestrator architecture. KV-cache optimization maps to Thariq's 4-tier layout. File-as-memory validates our state file approach. Tool masking relevant for our growing MCP tool surface. |
| **Actionable** | 8/10 | Concrete patterns: stable prompt prefixes, append-only context, logit masking for tool availability, todo recitation for attention, keeping errors in context. Tool naming convention (`browser_`, `shell_`) is immediately adoptable. |

---

## Summary

Yichao 'Peak' Ji, co-founder of Manus, shares six battle-tested context engineering patterns from building and scaling Manus to millions of users. The team chose in-context learning over fine-tuning to maintain fast iteration cycles ("ship improvements in hours instead of weeks") and model orthogonality, rebuilding their agent framework four times in the process.

The most impactful insight is that KV-cache hit rate is the dominant metric for production agents. With Manus agents exhibiting a 100:1 input-to-output token ratio, even small cache invalidations cascade into massive latency and cost penalties. Three rules emerge: keep prompt prefixes stable (timestamps at the top destroy cache), make context append-only (never modify prior actions/observations), and ensure deterministic serialization (JSON key ordering instability silently breaks caching).

On tool management, Manus discovered that dynamically adding/removing tools via RAG-style approaches causes more harm than good -- it invalidates KV-cache and confuses models when prior context references absent tools. Instead, they mask token logits during decoding to control which tools are selectable, and use response prefilling with consistent action name prefixes to constrain the action space without touching tool definitions.

For memory management, Manus treats the file system as unlimited external context. Rather than irreversible truncation, they use "restorable compression" -- removing content from context while preserving paths/URLs so agents can re-read on demand. This pairs with a "recitation" pattern where agents continuously update a todo.md file, effectively re-injecting objectives into the attention-heavy tail of the context window to combat goal drift across ~50 tool calls per task.

Finally, the article makes a strong case for keeping failed actions in context rather than sanitizing traces. When models see their own failures and resulting error messages, they implicitly shift their priors away from similar actions -- a form of in-context learning that erasure destroys. Ji argues error recovery is the clearest indicator of genuine agentic behavior.

---

## Notable Quotes

> "If model progress is the rising tide, we want Manus to be the boat, not the pillar stuck to the seabed."

> "The agentic future will be built one context at a time. Engineer them well."

> "Erasing failure removes evidence. And without evidence, the model can't adapt."

> "Don't few-shot yourself into a rut."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/NousResearch/Hermes-Function-Calling | Hermes function-calling format used for response prefill examples; relevant to our tool protocol design | `/tool-catalogue` |
| https://arxiv.org/abs/1410.5401 | Neural Turing Machines paper -- Ji speculates agentic SSMs with file-based memory could be "the real successors" | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Manus | Primary subject -- the agent being engineered | Yes -- [Manus AI](../../agent-harnesses/manus-ai.md) |
| Claude Sonnet | Pricing reference ($0.30 vs $3/MTok cached vs uncached) | No (model, not tool) |
| vLLM | Self-hosted inference framework requiring explicit prefix caching enablement | No -- consider `/tool-catalogue` |
| MCP | Referenced as driver of tool proliferation ("user-configurable tool scenarios") | Yes -- multiple entries |
| Hermes | NousResearch function-calling format used for prefill examples | No -- consider `/tool-catalogue` |
| GPT-3 | Historical reference -- made fine-tuning-first approach obsolete | No (model, not tool) |
| Flan-T5 | Historical reference -- co-initiated the in-context learning era | No (model, not tool) |

---

## Action Items

- [ ] Audit our orchestrator system prompt for timestamp placement -- move any timestamps to end of system prompt to protect KV-cache prefix stability
- [ ] Implement consistent tool name prefixes (`browser_`, `shell_`, `file_`) across our MCP tool definitions for prefill-based action space control
- [ ] Evaluate todo.md recitation pattern for long-running orchestrator agent loops (>20 tool calls)
- [ ] Verify our context serialization is deterministic (JSON key ordering) to avoid silent cache invalidation
- [ ] Review error handling -- ensure we keep failed action traces in agent context rather than sanitizing them
