# LightRAG

> **Simple and Fast Retrieval-Augmented Generation — EMNLP 2025 paper implementation.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [HKUDS/LightRAG](https://github.com/hkuds/lightrag) |
| GitHub Stars | 29,885 (as of 2026-03-22) |
| Publisher | HKUDS / Hong Kong University (research) |
| License | MIT |
| Tech Stack | Python, Knowledge Graphs, LLM |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *30K stars for a RAG framework that uses knowledge graphs instead of pure vector similarity. The academic pedigree (EMNLP 2025) suggests rigorous evaluation. Could be relevant for our knowledge catalogue search if we ever need programmatic access to the 345+ entries. For now, file-based grep works fine.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | RAG could improve catalogue search but we don't need it yet |
| **Novelty** | 6/10 | Graph-based RAG is more novel than vector-only approaches |
| **Actionable** | 3/10 | No immediate use case — file-based search works for our scale |

---

## Overview

LightRAG is a retrieval-augmented generation framework that uses knowledge graphs to improve retrieval quality over traditional vector-similarity approaches. Published at EMNLP 2025, it builds a graph of entities and relationships from documents, then uses graph traversal combined with embedding similarity for retrieval.

The system is designed to be simpler and faster than existing GraphRAG approaches while maintaining quality. It supports multiple LLM backends and can index large document collections efficiently.

---

## What's Valuable for Us

- **Graph-based retrieval pattern**: If our knowledge catalogue grows beyond grep-able scale, this could power semantic search
- **Entity extraction pipeline**: Could auto-link related catalogue entries

---

## What's NOT Relevant

- **Full RAG pipeline**: Overkill for our current 345-entry catalogue
- **LLM-powered retrieval**: Adds cost and latency vs. file-based grep

---

## Key Takeaway

> **Academic-grade graph-based RAG (30K stars, EMNLP 2025) — bookmark for when our knowledge catalogue outgrows file-based search, but no action needed now.**
