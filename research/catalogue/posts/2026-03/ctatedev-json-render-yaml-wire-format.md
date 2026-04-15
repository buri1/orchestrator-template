# json-render Now Supports YAML Wire Format for LLM Streaming

> **@ctatedev — 2026-03-13**

| Field | Value |
|-------|-------|
| Source | [x.com/ctatedev/status/2032557225030664272](https://x.com/ctatedev/status/2032557225030664272) |
| Author | [@ctatedev / Chris Tate — creator of json-render, manaflow, Emulate] |
| Date | 2026-03-13 |
| Topics | json-render, YAML, wire-format, LLM streaming, JSON Patch, Merge Patch, Unified Diff, token efficiency |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **YAML as wire format for LLM output** — json-render now supports YAML alongside JSON. The key insight: YAML "looks like source code" to LLMs, meaning models produce it more naturally and with fewer formatting errors than structured JSON. This reduces token waste on syntax characters (braces, quotes, commas).
2. **Multi-strategy patching for streaming** — The tool supports JSON Patch (RFC 6902), Merge Patch (RFC 7396), and Unified Diff for incremental updates. This means agents can stream partial updates to structured data without resending the entire payload — critical for real-time UIs and long-running agent tasks.
3. **Massive engagement signals category demand** — 1,796 likes and 187K views on a wire format library is extraordinary. Developers are clearly hungry for better agent-to-UI communication primitives. The 122 reposts suggest this is being actively shared among engineering teams.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Wire format optimization is a "context is zero-sum" (Principle 3) concern — fewer tokens per structured output means more room for actual content. Not immediately needed for our tmux orchestrator (we use plain text), but relevant if we build agent dashboards or structured state streaming. Chris Tate's ecosystem (manaflow, Emulate, json-render) keeps producing patterns aligned with our agent infrastructure interests. |

---

## Full Content

> json-render now supports YAML. YAML looks like source code to LLMs. Uses JSON Patch, Merge Patch and Unified Diff.

*[Post includes demo/screenshot of YAML wire format in action]*

**Engagement:** 1,796 likes | 122 reposts | 68 replies | 187K views

---

## Notable Replies

*[Replies not accessible via automated fetch. High reply count (68) suggests discussion around YAML vs JSON performance tradeoffs and integration patterns. Worth checking manually for benchmarks or comparisons.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/nicepkg/json-render | Core repo — YAML wire format for LLM streaming with patching strategies | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| json-render | Core subject — YAML/JSON wire format with patching | No — consider `/tool-catalogue` |
| manaflow | Same author (ctatedev) — Claude Code web alternative | [Yes — developer-gui/manaflow.md](../developer-gui/manaflow.md) |
| Emulate | Same author — local API emulation | [Yes — posts/2026-03/ctatedev-emulate-local-api-emulation.md](./ctatedev-emulate-local-api-emulation.md) |
