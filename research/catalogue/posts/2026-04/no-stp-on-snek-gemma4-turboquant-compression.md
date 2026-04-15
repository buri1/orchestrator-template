# Gemma 4 31B Compressed from 30.4GB to 18.9GB with TurboQuant+

> **@no_stp_on_snek (Tom Turney) — 2026-04-03**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/no_stp_on_snek/status/2039787271365300335) |
| Author | @no_stp_on_snek — Tom Turney |
| Date | 2026-04-03 |
| Topics | model compression, quantization, Gemma 4, TurboQuant+, weight compression, inference optimization |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Gemma 4 31B shrinks 38% with TurboQuant+** — The model goes from 30.4GB to 18.9GB, a substantial reduction that makes it viable on consumer hardware with less VRAM. This builds on Google Research's TurboQuant compression method with additional optimizations.

2. **Open-source tooling available** — The turboquant_plus repository on GitHub provides the compression tooling, making this reproducible and adaptable to other models.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 3/10 | Model compression is tangential to our orchestration focus. We consume models via API, not locally. Could become relevant if we ever run local models for cost optimization, but not in our current 60-day horizon. |

---

## Full Content

Gemma 4 31B compressed from 30.4GB to 18.9GB using TurboQuant+ weight compression technique.

GitHub: https://github.com/TheTom/turboquant_plus

---

## Notable Replies

[Replies not accessible via fetch — post had 37 replies, 122 reposts, 1,368 likes, 80K views at time of ingestion.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/TheTom/turboquant_plus | Open-source TurboQuant+ implementation for model compression | `/ingest-article` (if README has technical depth) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Gemma 4 (Google) | Target model being compressed | No |
| TurboQuant+ | Weight compression technique extending Google's TurboQuant | Related: [googleresearch-turboquant](../2026-03/googleresearch-turboquant-compression-algorithm.md) |
