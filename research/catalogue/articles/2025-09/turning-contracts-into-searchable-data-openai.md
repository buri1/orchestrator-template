# Turning Contracts into Searchable Data at OpenAI

> **Wei An Lee & Siddharth Jain — OpenAI Blog, 2025-09-29**

| Field | Value |
|-------|-------|
| Source | https://openai.com/index/openai-contract-data-agent/ |
| Author | Wei An Lee & Siddharth Jain (AI Engineers, OpenAI Finance) |
| Publication | OpenAI Blog |
| Date | 2025-09-29 |
| Topics | contract data extraction, RAG, human-in-the-loop, enterprise agents, ASC 606, document processing, overnight batch agents |
| Read Time | ~6 min |

---

## Burak's Notes

> *Companion to the "Inside OpenAI's In-House Data Agent" (Aardvark) article already ingested. This one focuses on a different domain — contract/legal document extraction rather than data analytics — but shares the same design philosophy: lean team, retrieval-augmented prompting, human experts in control. The overnight batch pattern is notable — not everything needs to be real-time. The "50% reduction in review time" metric and "scale without linear headcount growth" thesis directly map to our agent delivery economics model. The three-step pipeline (ingest -> inference with RAG -> human review) is the same pattern we should use for any document extraction agent in gov contracts. ASC 606 compliance classification shows this works in regulated domains — relevant for our DSGVO gov work.*

---

## Key Takeaways

1. **Three-Step Pipeline for Document Extraction** — Ingest (accept PDFs, scans, phone photos with handwritten edits) -> Inference (retrieval-augmented prompting that pulls only relevant sections, not entire documents) -> Human Review (expert validation with annotations and non-standard term flagging). This is a reusable blueprint for any document-to-structured-data agent.

2. **Overnight Batch Processing Over Real-Time** — The agent runs as an overnight batch process so finance teams "wake up in the morning to data that's ready for review." Not everything needs to be real-time — batch processing reduces costs, simplifies architecture, and aligns with human review cadence.

3. **Selective RAG Over Full-Context Dumping** — Rather than dumping thousands of contract pages into context, the system retrieves only relevant sections, reasons against them, and shows its work. This mirrors the "curated context > noisy context" finding from the companion Aardvark article.

4. **Human Feedback Sharpens the Agent** — Each cycle of expert review creates a feedback loop that improves subsequent reviews. The system gets better over time without requiring retraining or fine-tuning — just structured human corrections.

5. **Scaling Without Linear Headcount** — The system enables OpenAI to handle hypergrowth in contract volume (hundreds to 1,000+ monthly) without proportionally growing the finance team. This is the core thesis of agent delivery economics — sublinear headcount growth.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Enterprise document extraction agent — not multi-agent orchestration, but the three-step pipeline pattern (ingest/inference/review), overnight batch design, selective RAG approach, and scaling-without-headcount thesis are directly transferable to gov contract work |
| **Actionable** | 7/10 | The pipeline architecture is immediately reusable for any document extraction task; batch processing pattern applicable to our overnight agent runs; ASC 606 compliance classification validates agents in regulated domains (relevant for DSGVO) |

---

## Summary

OpenAI's finance and engineering teams built a contract data extraction agent to transform unstructured contracts — PDFs, scanned copies, even phone photos with handwritten edits — into structured, queryable data. The system was designed with a clear principle: take the repetition out of contract review while keeping domain experts firmly in control of final decisions.

The architecture follows a three-step pipeline. First, the ingestion layer accepts diverse document formats into a unified processing channel. Second, the inference layer uses retrieval-augmented prompting to parse contracts into structured data, selectively pulling only relevant sections rather than loading entire documents into context. The agent reasons against the retrieved content, classifies terms (including ASC 606 revenue recognition standards), identifies non-standard clauses, and provides source citations. Third, finance experts review the structured output, validate annotations, and confirm or override the agent's classifications.

The system operates as an overnight batch process — processing contracts while teams sleep, so structured data is ready for review each morning. This design choice avoids the complexity and cost of real-time processing while aligning with the natural cadence of human review. Each cycle of expert feedback "sharpens the agent," improving subsequent reviews without retraining.

The business impact is substantial: review turnaround times cut in half, capacity scaled from hundreds to over 1,000 contracts monthly, and the ability to handle OpenAI's hypergrowth without growing the finance team linearly. Results flow into the data warehouse as tabular data for further analysis. The architecture extends beyond contracts to procurement, compliance workflows, and month-end financial closings.

The system was built by AI engineers Wei An Lee and Siddharth Jain, achieving its scalability goals within six months. It validates a core principle of agent delivery economics: well-designed automation enables sublinear headcount scaling during hypergrowth.

---

## Notable Quotes

> "The only way we can scale as OpenAI scales is through this. Without it, you'd have to grow your team linearly in lockstep with contract volume. This lets us keep the team lean while handling hypergrowth." — Wei An Lee

> "Each cycle of human feedback sharpens the Agent." — on the continuous improvement loop between expert review and agent performance

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://openai.com/index/building-openai-with-openai/ | Parent article: "Building OpenAI with OpenAI" — umbrella piece covering multiple internal agent use cases including this contract agent | `/ingest-article` |
| https://github.com/agno-agi/dash | Open-source "self-learning data agent" inspired by OpenAI's internal agent implementations — already flagged in companion article | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenAI internal contract agent | The subject of this article — internal tool, not a product | No — internal tool |
| OpenAI Responses API | Implied infrastructure (uses publicly available APIs) | No — API, not tool |
| Inside OpenAI's In-House Data Agent (Aardvark) | Companion article — same "Building OpenAI with OpenAI" series | Yes — [Inside OpenAI's In-House Data Agent](../2026-01/inside-openai-in-house-data-agent.md) |

---

## Action Items

- [ ] Apply the three-step pipeline pattern (ingest -> inference with selective RAG -> human review) to any document extraction agent for gov contracts
- [ ] Consider overnight batch processing for non-time-critical agent workloads — simpler, cheaper, aligns with human review cadence
- [ ] Note ASC 606 compliance classification as evidence that LLM agents work in regulated domains — relevant for DSGVO gov SaaS contracts
- [ ] Cross-reference with companion Aardvark article's "curated context > noisy context" finding — both validate selective retrieval over full-context dumps
