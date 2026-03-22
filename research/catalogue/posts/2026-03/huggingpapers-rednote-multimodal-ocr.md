# RedNote Releases Multimodal OCR: 3B-Parameter Document Parser

> **@HuggingPapers — 2026-03-22**

| Field | Value |
|-------|-------|
| Source | [x.com/HuggingPapers/status/2035692629778739267](https://x.com/HuggingPapers/status/2035692629778739267) |
| Author | [@HuggingPapers / DailyPapers — Hugging Face paper announcements] |
| Date | 2026-03-22 |
| Topics | OCR, multimodal, RedNote, document parsing, Markdown, HTML, SVG, LaTeX, charts, tables |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **RedNote releases a 3B-parameter multimodal OCR model** — The model converts text, charts, diagrams, and tables into structured formats including Markdown, HTML, SVG, and LaTeX. At 3B parameters it's small enough to run locally, making it accessible for agent pipelines that need document understanding without cloud API calls.
2. **Ranks second only to Gemini 3 Pro on OCR benchmarks** — Despite being a relatively small model (3B vs frontier models at 100B+), it achieves near-SOTA OCR performance. This positions it as the best open-weight OCR model available.
3. **Structured output formats align with agent workflows** — The ability to output Markdown, HTML, SVG, and LaTeX directly means the OCR output can be consumed by downstream agents without format conversion. Markdown output is particularly useful for knowledge pipelines like our ingest system.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Potentially useful for our ingest pipeline when processing PDF documents, screenshots, or image-heavy content. A local 3B OCR model could replace cloud OCR APIs for document analysis tasks. The Markdown output format integrates naturally with our catalogue system. Not immediately actionable but worth tracking for document-heavy client work (e.g., German government procurement documents, Leistungsbeschreibung PDFs). RedNote (Xiaohongshu) releasing open models is notable — Chinese tech companies increasingly open-sourcing competitive models. |

---

## Full Content

DailyPapers announces RedNote's release of a Multimodal OCR model that parses documents into text and code. The 3B-parameter model converts text, charts, diagrams, and tables into structured formats like Markdown, HTML, SVG, and LaTeX. It ranks second only to Gemini 3 Pro on OCR benchmarks.

**Engagement:** 29 likes | 3 retweets | 1 reply

**Media:** 1 image (937x375) showing benchmark comparison

---

## Notable Replies

*[1 reply — insufficient engagement for notable replies analysis.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| *(HuggingFace model page when available)* | Model card and weights for local deployment | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| RedNote Multimodal OCR | Core subject — 3B OCR model | No |
| Gemini 3 Pro | Benchmark comparison (ranked #1) | No |
