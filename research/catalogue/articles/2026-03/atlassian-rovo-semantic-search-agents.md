# Advancing Semantic Search for Millions of Rovo Users

> **Kang Li, Lu He, Xin Yu, Fei Teng — Atlassian Engineering Blog, 2026-03-16**

| Field | Value |
|-------|-------|
| Source | https://atlassian.com/blog/atlassian-engineering/advancing-rovo-semantic-search |
| Author | Kang Li (Head of Engineering), Lu He (Principal ML Systems Engineer), Xin Yu (Principal ML Systems Engineer), Fei Teng (Senior Engineering Manager, ML) |
| Publication | Atlassian Engineering Blog |
| Date | 2026-03-16 |
| Topics | semantic search, hybrid retrieval, enterprise knowledge retrieval, embedding models, RAG, agentic AI, fine-tuning, NVIDIA NeMo |
| Read Time | ~12 min |

---

## Burak's Notes

> *Enterprise semantic search at 5M+ MAU scale. The hybrid retrieval approach (traditional signals + neural) is the production-proven pattern for knowledge retrieval in agent systems. The embedding model progression (MiniLM -> BGE-large -> EmbeddingGemma-300m) with fine-tuning via NVIDIA NeMo is a concrete roadmap. The 26-40% uplift from domain-specific fine-tuning on work artifacts (Jira issues, Confluence pages) validates that generic embeddings are insufficient for enterprise agent knowledge retrieval. Directly relevant to how our orchestrator agents should discover and retrieve context.*

---

## Key Takeaways

1. **Hybrid retrieval outperforms pure embeddings for enterprise search** -- Rovo combines traditional signals (fields, recency, project membership, engagement history) with neural semantic understanding. Neither keyword search nor embeddings alone solve enterprise knowledge retrieval.

2. **Domain-specific fine-tuning delivers 26-40% retrieval quality uplift** -- Fine-tuning Llama-Nemotron-Embed-1B-V2 on a Jira-like dataset using NVIDIA NeMo achieved massive gains (Recall@60 and NDCG@1), completed in less than one day. Generic web corpora embeddings leave significant quality on the table for work artifacts.

3. **Semantic search is the backbone for agentic AI** -- Atlassian explicitly positions semantic search as the foundation for agent systems. Agents need deterministic, trustworthy retrieval grounded in organizational work artifacts, not generic web search. Tenant-specific fine-tuning with privacy preservation is the path to domain-specific agent behavior.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Validates hybrid retrieval as the production pattern for agent knowledge retrieval at enterprise scale. The embedding model progression and domain fine-tuning methodology are directly applicable if we build knowledge retrieval for orchestrator agents. However, we currently use filesystem-based retrieval (grep/find/cat) which the Vercel articles suggest outperforms embedding-based approaches for our use case. |
| **Actionable** | 5/10 | The fine-tuning pipeline (NeMo Data Designer + NeMo Automodel) is actionable for tenant-specific knowledge retrieval. The hybrid retrieval pattern (combine structured signals with semantic) is a design principle we should adopt if we move beyond filesystem search. Not immediately actionable for our tmux+worktree architecture but relevant for Phase 3+ knowledge layer. |

---

## Summary

Atlassian's Rovo provides meaning-aware search across Jira, Confluence, and connected tools for over 5 million monthly active users. The article details how classic enterprise search fails: keywords rarely match document titles, answers are scattered across multiple tools, and team vocabulary evolves constantly. Rovo's solution is hybrid retrieval that combines traditional signals (structured fields, recency, project membership, historical engagement) with neural semantic understanding.

The search architecture is task-aware: queries from Jira contexts prioritize issues and epics, Confluence queries surface specs and runbooks, and cross-tool queries connect related artifacts (incidents to fixes to follow-ups). The system handles real-world messiness -- half-filled tickets, noisy comments, template violations -- by ranking on semantic closeness, role/project context, historical engagement and outcome signals, and inter-artifact relationships.

Rovo's embedding model evolution followed three generations: MiniLM (lightweight validation baseline), BGE-large (better recall on work language, longer passages, acronyms), and EmbeddingGemma-300m (current default, optimized for quality/latency/cost at scale). Validation uses offline metrics (Recall@k, MRR) and online experiments (click/long-click engagement, session success rates).

A key section details NVIDIA collaboration: fine-tuning Llama-Nemotron-Embed-1B-V2 on a public Jira-like dataset using NeMo Data Designer (synthetic data generation) and NeMo Automodel delivered 26-40% retrieval quality uplift in under one day. This demonstrates that domain-specific fine-tuning is both high-impact and low-cost.

The article explicitly positions semantic search as the foundation for agentic AI, stating that as agents become team members, they depend on "that same trusted semantic layer and shared context." Future directions include deeper work context modeling (initiatives to postmortems), conversational search with proactive assistance, and tenant-specific embedding fine-tuning using anonymized, privacy-preserving signals.

---

## Notable Quotes

> "Instead of forcing you to remember exact titles or ticket IDs, Rovo focuses on what you _mean_."

> "Rovo's semantic search is built to understand what you mean, not just what you type."

> "Semantic search in Rovo is not magic text similarity; it's domain-aware retrieval optimized for getting real work done."

> "Semantic search is becoming the backbone for how work gets discovered, understood, and acted on across tools."

> "The words you type ('how to find my pay stub') rarely match the words in the doc title."

> "The 'answer' isn't in one place, it's spread across Jira tickets, Confluence pages, comments, and Slack threads."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://build.nvidia.com/nvidia/llama-nemotron-embed-1b-v2 | The specific embedding model fine-tuned for enterprise work artifacts | `/ingest-article` |
| https://github.com/NVIDIA-NeMo/Nemotron/tree/preview/embed-finetune-recipe/src/nemotron/recipes/embed | Open-source fine-tuning recipe used for 26-40% uplift | `/ingest-article` |
| https://nvidia-nemo.github.io/DataDesigner/latest/ | NeMo Data Designer for synthetic data generation -- could be useful for generating training data for domain-specific agent knowledge | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Rovo | Atlassian's semantic search + chat + agents platform serving 5M+ MAU | No |
| MiniLM | First-generation embedding model (lightweight baseline) | No |
| BGE-large | Second-generation embedding model (better work language recall) | No |
| EmbeddingGemma-300m | Current default embedding model (quality/latency/cost balance) | No |
| Llama-Nemotron-Embed-1B-V2 | NVIDIA fine-tuned embedding model (26-40% uplift) | No |
| NVIDIA NeMo Data Designer | Synthetic data generation and cleaning for fine-tuning | No |
| NVIDIA NeMo Automodel | Fine-tuning framework | No |
| NVIDIA NemoClaw | Open-source always-on assistant stack (OpenShell + Nemotron) | Yes -- [nvidia-nemoclaw](../../infrastructure/nvidia-nemoclaw.md) |
| NVIDIA Agent Toolkit | Infrastructure layer beneath agent frameworks | Yes -- [nvidia-ai-agents-gtc-2026](../2026-03/nvidia-ai-agents-gtc-2026.md) |
| Jira | Atlassian project tracking (primary search corpus) | No |
| Confluence | Atlassian knowledge base (primary search corpus) | No |

---

## Action Items

- [ ] Evaluate hybrid retrieval pattern (structured signals + semantic) for orchestrator knowledge layer (Phase 3+)
- [ ] Track Llama-Nemotron-Embed-1B-V2 fine-tuning recipe as potential path for domain-specific agent memory retrieval
- [ ] Compare filesystem-based retrieval (our current grep/find/cat approach) vs embedding-based hybrid retrieval for orchestrator context -- Vercel articles suggest filesystem wins for code, but Rovo's approach may win for cross-tool knowledge graphs
