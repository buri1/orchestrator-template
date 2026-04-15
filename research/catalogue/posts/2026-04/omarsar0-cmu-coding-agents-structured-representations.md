# CMU: Biggest Unlock for Coding Agents Is Structured Representations

> **@omarsar0 — 2026-04-01**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/omarsar0/status/2038627572108743001) |
| Author | @omarsar0 — Omar Santos, AI researcher & curator at DAIR.AI |
| Date | 2026-04-01 |
| Topics | coding-agents, structured-representations, CMU, code-intelligence, AST, context |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Structured representations are the biggest unlock for coding agents** — CMU research argues that giving coding agents structured representations of code (ASTs, dependency graphs, type hierarchies) rather than raw text dramatically improves their effectiveness. This shifts the bottleneck from model capability to context quality.
2. **Context quality > model quality** — This validates our Principle #3 ("Context is zero-sum. Every token competes for attention."). If structured representations compress code context more efficiently than raw source files, agents can reason over larger codebases within the same context window.
3. **Strong practitioner signal (435 likes, 52K views)** — The coding agent community is actively seeking better context strategies, not just bigger models. The 94 reposts indicate high amplification among practitioners.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly relevant to how our coding agents understand codebases. Our agents currently receive raw file context via Claude Code's built-in codebase understanding. If structured representations (ASTs, call graphs) could be pre-computed and injected, our agents would be more effective on complex codebases. Maps to Principle #3 (context is zero-sum) and Principle #4 (better context on fewer agents beats more agents). The arxiv paper is worth a deep dive. |

---

## Full Content

The biggest unlock for coding agents is understanding structured representations.

Link: https://arxiv.org/abs/2603.21489

*(Shares CMU research demonstrating that providing coding agents with structured code representations (ASTs, dependency graphs, type information) significantly outperforms raw-text context for code generation and modification tasks.)*

---

## Notable Replies

*36 replies posted. Likely discussion of specific structured representation formats, tools that already provide this (tree-sitter, LSP, etc.), and practical integration approaches.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://arxiv.org/abs/2603.21489 | CMU research on structured representations for coding agents — directly applicable to improving our agent context quality | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| CMU Structured Representations Paper | The research being shared | No |
| tree-sitter | Implied as a structured representation provider | No — not catalogued |
