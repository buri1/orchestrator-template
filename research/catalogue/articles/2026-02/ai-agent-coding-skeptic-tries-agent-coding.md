# An AI Agent Coding Skeptic Tries AI Agent Coding, in Excessive Detail

> **Max Woolf (@minimaxir) — minimaxir.com, 2026-02-27**

| Field | Value |
|-------|-------|
| Source | https://minimaxir.com/2026/02/ai-agent-coding/ |
| Author | Max Woolf — Senior Data Scientist at BuzzFeed, prolific open-source contributor |
| Publication | minimaxir.com (personal blog) |
| Date | 2026-02-27 |
| Topics | AI agent coding, AGENTS.md, Rust, Python, performance optimization, skepticism, Claude Opus, Codex |
| Read Time | ~28 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **AGENTS.md as the decisive factor** — Woolf identifies well-structured AGENTS.md files (code style, tool preferences, behavioral constraints, language idioms) as the single biggest determinant of agent coding success vs failure. Without them, agents produce mediocre output; with them, they produce production-quality code.

2. **Domain expertise multiplies agent output** — Agents work best when the human has "approximate knowledge of many things with enough domain expertise to know what should and should not work." The human's role shifts from writing code to directing, validating, and iterating on agent output — pure orchestration.

3. **Iterative chaining across models yields compounding gains** — Woolf chains different models (Codex for initial 1.5-2x speedups, then Opus for further optimization), achieving cumulative 6x performance gains. This validates multi-model routing strategies where different models excel at different optimization phases.

4. **Performance claims are concrete and verifiable** — Unlike most AI coding hype, Woolf ships open-source code with public benchmarks: UMAP 9-30x faster than Python, HDBSCAN 23-100x faster than Rust crates, GBDT 24-42x faster fit than xgboost. Code originality is proven by exceeding existing implementations.

5. **Calibrated skepticism, not evangelism** — Woolf resists both uncritical cheerleading and blanket dismissal. He maintains professional boundaries (won't claim Rust expertise on resume), acknowledges limitations, and remains skeptical of non-coding LLM applications while providing concrete evidence for coding use cases.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Validates AGENTS.md-driven agent coding and multi-model chaining; focused on individual productivity rather than multi-agent orchestration. Not directly about orchestration but reinforces context engineering principles. |
| **Actionable** | 5/10 | AGENTS.md patterns are already catalogued; the 8-step iterative optimization pipeline and model-chaining strategy are transferable patterns; Rust/Python performance work is domain-specific. |

---

## Summary

Max Woolf, a self-described AI coding skeptic, documents his transformation through hands-on experiments with Claude Opus 4.5/4.6 and OpenAI Codex. Rather than making vague capability claims, he ships multiple open-source projects with measurable performance improvements as evidence.

The article's central innovation is the emphasis on AGENTS.md files as structured guidance documents. Woolf's AGENTS.md files specify code style, formatting preferences, tool selections (uv, polars, pyo3), behavioral constraints ("NEVER use emoji"), comment reduction rules, and language-specific idioms. This systematic removal of friction between user expectations and model output is what separates productive agent coding from frustrating experiences.

Woolf describes an 8-step iterative optimization pipeline for ML algorithm implementation: (1) implement with functional requirements and benchmarks, (2) code cleanup and initial optimization, (3) identify algorithmic weaknesses in edge cases, (4) iterative optimization toward 1.4x speedup targets, (5) CPU thread scheduling and parallelization, (6) Python bindings via pyo3/maturin, (7) cross-implementation benchmarking, (8) accuracy verification against known-good implementations. He chains different models — Codex for initial speedups, then Opus for additional gains — achieving cumulative 6x improvements on some libraries.

The shipped projects include nndex (in-memory vector nearest-neighbor retriever competitive with numpy BLAS), miditui (terminal MIDI composer), ballin (Braille-character physics simulator), and rustlearn (scikit-learn port to Rust with 23-100x speedups). All are open-source with public benchmarks, making the claims verifiable. Woolf argues that if the code is faster than what currently exists, it cannot have been stolen from training data.

The article concludes with measured ambivalence: "I'm very sad at the state of agentic discourse but also very excited at its promise: it's currently unclear which one is the stronger emotion." This calibrated perspective — neither hype nor dismissal — makes the piece more credible than typical AI coding advocacy.

---

## Notable Quotes

> "Agents work best when you have approximate knowledge of many things with enough domain expertise to know what should and should not work."

> "My obligation as a professional coder is to do what works best, especially for open source code that other people will use."

> "Overall, I'm very sad at the state of agentic discourse but also very excited at its promise: it's currently unclear which one is the stronger emotion."

> "If the code is faster than what currently exists, then it can't have been stolen."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://gist.github.com/minimaxir/10b780671ee5d695b4369b987413b38f | Woolf's Python AGENTS.md — concrete example of structured agent guidance | `/ingest-article` |
| https://gist.github.com/minimaxir/068ef4137a1b6c1dcefa785349c91728 | Woolf's Rust AGENTS.md — companion to Python version | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| AGENTS.md | Central thesis — structured guidance files as the decisive factor for agent coding success | Yes — [agents-md.md](../agent-protocols/agents-md.md) |
| Claude Opus 4.5 / 4.6 | Primary agent models used; Opus 4.5 described as "order of magnitude better" than prior LLMs | N/A (model, not tool) |
| OpenAI Codex (GPT-5.2/5.3) | Used for initial optimization passes; chained with Opus for cumulative gains | Yes — [openai-codex.md](../agent-harnesses/openai-codex.md) |
| OpenRouter | Model routing platform used for API access | Not yet catalogued |
| PyO3 / maturin | Rust-Python bridge for building Python bindings from Rust code | N/A (build tools) |
| polars | Preferred data manipulation library (specified in AGENTS.md) | N/A (data library) |
| ratatui | Rust terminal UI framework used in miditui project | N/A (UI library) |

---

## Action Items

- [ ] Review Woolf's published AGENTS.md gists for patterns to incorporate into our own agent guidance files
- [ ] Consider the 8-step iterative optimization pipeline as a reusable agent task decomposition template
- [ ] Note model-chaining strategy (Codex first, then Opus) as evidence for multi-model routing ROI
