# Enormous MoE Models Can Run Locally on Mac Without Loading the Whole Model into Memory

> **@simonw — 2026-03-25**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/simonw/status/2036294026438254783) |
| Author | @simonw / Simon Willison — Creator of Datasette, Django co-creator, prolific AI tooling blogger |
| Date | 2026-03-25 |
| Topics | MoE, local inference, Mac hardware, memory efficiency, Apple Silicon, large models |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **MoE models don't need full memory loading** — Mixture-of-Experts models only activate a fraction of their parameters per token. On Mac, this means you can run models with enormous total parameter counts (e.g., 100B+ total) because only the active experts need to be in memory at inference time. The rest can sit on SSD/swap.

2. **Mac unified memory as a competitive advantage** — Apple Silicon's unified memory architecture (up to 192GB on M4 Ultra) is uniquely suited for this. GPU and CPU share the same memory pool, so there's no PCIe bottleneck moving model weights around. This makes Macs disproportionately capable for large MoE inference compared to discrete GPU setups.

3. **Simon Willison signal = mainstream adoption inflection** — When Simon writes about something, it typically means the tooling has crossed the usability threshold for serious developers (not just ML researchers). His 327K views and 3.7K likes confirm massive interest in local large-model inference.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 5/10 | Interesting pattern but not on our critical path. We use Claude Max cloud API for orchestration, so local inference is not a current need. However, the economics of running large MoE models locally on Mac hardware could become relevant if we ever need local fallback models, private data processing, or want to reduce API costs for specific workloads. Simon's signal is always worth tracking. Filed under "interesting for Phase 4+". |

---

## Full Content

> Enormous MoE models can run on Mac hardware without loading the whole model into memory.

*[Post discusses how Mixture-of-Experts architecture enables running very large models locally on Mac by only loading active expert weights into memory during inference.]*

**Engagement:** 124 replies, 322 reposts, 3,778 likes, 327K views

---

## Notable Replies

> *[Replies not accessible at ingest time. 124 replies with 327K views suggests extremely high-signal discussion — Simon's threads typically attract tool builders and framework authors. Worth a manual pass for specific MLX/llama.cpp tooling recommendations.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://simonwillison.net | Simon's blog — likely has a longer writeup with benchmarks and specific model recommendations | `/ingest-article` (when published) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| MLX | Apple's ML framework — implied runtime for Mac-native MoE inference | No — framework |
| llama.cpp | Likely inference engine discussed in replies for GGUF quantized models | No |
| Apple Silicon (M-series) | Target hardware — unified memory architecture enables large model loading | N/A — hardware |
