# Context Rot: How Increasing Input Tokens Impacts LLM Performance

> **Kelly Hong, Anton Troynikov, Jeff Huber — Chroma Research, 2025-07-14**

| Field | Value |
|-------|-------|
| Source | https://research.trychroma.com/context-rot |
| Author | Kelly Hong, Anton Troynikov (Cofounder/Advisor), Jeff Huber (Cofounder/CEO) — Chroma |
| Publication | Chroma Research |
| Date | 2025-07-14 |
| Topics | context rot, long context, LLM degradation, attention, NIAH, context engineering, benchmarking |
| Read Time | 25 min |

---

## Burak's Notes

> *This is the empirical proof for our "fresh 200K per task" architecture. Every finding here validates spawning new agents instead of accumulating context: performance degrades non-uniformly with length, structured (coherent) context HURTS more than shuffled noise, distractors compound degradation, and position matters (early = best). Our compaction strategy + sub-agent isolation is the correct response to context rot. The counterintuitive finding that shuffled haystacks outperform coherent ones suggests attention mechanisms get confused by logical flow at scale — implications for how we structure CLAUDE.md and task prompts.*

---

## Key Takeaways

1. **Performance degrades non-uniformly with input length, even on trivial tasks** — All 18 models tested show degradation as context grows, but the curves are not linear or predictable. Models that excel at short context can fail catastrophically at longer lengths.
2. **Structural coherence hurts performance (counterintuitive)** — Shuffled haystacks consistently outperform logically structured ones across all 18 models. Attention mechanisms process structured content differently, and logical flow appears to confuse retrieval at scale.
3. **Distractors compound degradation multiplicatively** — A single semantically-related distractor reduces performance; four distractors compound further. GPT models hallucinate confidently while Claude models abstain when uncertain (lowest hallucination rates).
4. **Lower needle-question similarity = steeper degradation** — When the retrieval target is semantically distant from the question, performance drops much faster with increasing context length. At short lengths, similarity doesn't matter; at long lengths, it's decisive.
5. **Information placement matters** — Position accuracy is highest when target information appears near the beginning of the sequence. Models under-generate at longer lengths (systematic word count drift).

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates our core architecture: fresh 200K context per task via sub-agent spawning, compaction triggers, and context isolation. Every finding maps to a design decision we've already made or need to make. |
| **Actionable** | 8/10 | Concrete implications: place critical instructions early in prompts, minimize distractors in context, prefer fresh agents over accumulated context, structure prompts for retrieval not narrative coherence. |

---

## Summary

Chroma Research conducted the most comprehensive empirical study of LLM performance degradation as a function of input length ("context rot"). Testing 18 frontier models across four controlled experiments — extended Needle in a Haystack (NIAH), LongMemEval conversational QA, and a novel Repeated Words task — they isolated input length as the sole variable while holding task complexity constant.

The core finding is stark: all models degrade with increasing context, but the degradation is non-uniform, model-specific, and often surprising. The most counterintuitive result is that **structurally coherent haystacks consistently hurt performance** compared to shuffled text across all 18 models. This suggests attention mechanisms process logical flow differently at scale, and that our intuition about "well-organized context helps the model" is wrong for retrieval tasks.

On the distractor front, semantically-related irrelevant content compounds degradation multiplicatively. Claude models (Sonnet 4, Opus 4) showed the lowest hallucination rates, tending to abstain rather than fabricate — a critical safety property. GPT models showed the highest hallucination rates with "confident but incorrect responses." Gemini models exhibited random word generation starting around 500-750 words.

The LongMemEval experiment showed significant gaps between focused (~300 tokens) and full (~113K tokens) prompts, with Claude Opus 4 showing the most pronounced gap driven by abstentions under ambiguity. Thinking modes improved both conditions but did not eliminate the performance gap. The Repeated Words task demonstrated consistent degradation across all models, with Claude Sonnet 3.5 outperforming newer Claude models up to its 8,192 token limit.

The practical implications are clear: current NIAH benchmarks dramatically underestimate real-world long-context challenges ("NIAH is fundamentally a simple retrieval task"), and real applications with greater complexity will see even more pronounced degradation. Context engineering — how information is presented, not just what's present — is the critical discipline.

---

## Notable Quotes

> "Model performance degrades as input length increases, often in surprising and non-uniform ways."

> "Models do not use their context uniformly; instead, their performance grows increasingly unreliable as input length grows."

> "Structural coherence consistently hurts model performance."

> "Whether relevant information is present in a model's context is not all that matters; what matters more is how that information is presented."

> "NIAH is fundamentally a simple retrieval task" that doesn't represent real-world complexity.

> "Real-world applications typically involve much greater complexity, implying that the influence of input length may be even more pronounced in practice."

---

## Methodology Detail

### Experiments

1. **Extended NIAH** — 4 variations testing needle-question similarity, distractor impact (0/1/4), needle-haystack similarity, and haystack structure (coherent vs. shuffled). 8 input lengths x 11 needle positions tested.
2. **LongMemEval** — 306 manually cleaned conversational QA prompts. Focused condition (~300 tokens, relevant info only) vs. full condition (~113K tokens with irrelevant context). Categories: knowledge updates, temporal reasoning, multi-session.
3. **Repeated Words** — Models replicate sequences with single unique word inserted. 1,090 variations per word combination, 7 combinations, 12 input length levels (25 to 10,000 words).

### Models Tested (18)

| Provider | Models |
|----------|--------|
| Anthropic | Claude Opus 4, Sonnet 4, Sonnet 3.7, Sonnet 3.5, Haiku 3.5 |
| OpenAI | o3, GPT-4.1, GPT-4.1 mini, GPT-4.1 nano, GPT-4o, GPT-4 Turbo |
| Google | Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.0 Flash |
| Alibaba | Qwen3-235B-A22B, Qwen3-32B, Qwen3-8B |

GPT-3.5 Turbo excluded (60.29% refusal rate). Total: 194,480 LLM calls.

### Key Numbers

- **Overall refusal rate**: 0.035% (69/194,480 calls)
- **Claude Opus 4 refusal rate**: 2.89% (copyright concerns, sequence inconsistencies)
- **GPT-4.1 refusal rate**: 2.55%
- **LongMemEval judge alignment**: >99% with human judgment
- **Needle similarity ranges**: PG essays 0.445-0.775, arXiv papers 0.521-0.829

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| LongMemEval (Wu et al., 2025) | Conversational QA benchmark used in this study; tests real-world long-context scenarios | `/ingest-article` |
| NoLiMa (Modarressi et al., 2025) | Non-lexical matching benchmark — tests retrieval without keyword overlap | `/ingest-article` |
| AbsenceBench (Fu et al., 2025) | Tests model ability to recognize when information is NOT in context | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Chroma | Authors' company; embedding/vector database | No |
| UMAP | Dimensionality reduction for similarity visualization | No |
| HDBSCAN | Clustering for haystack structure analysis | No |
| text-embedding-3-small/large | OpenAI embedding models used for similarity measurement | No |
| jina-embeddings-v3 | Embedding model used for similarity measurement | No |
| voyage-3-large | Embedding model used for similarity measurement | No |
| YaRN | Context extension technique (Qwen3-8B: 32K -> 131K) | No |

---

## Action Items

- [ ] Review our CLAUDE.md prompt structure in light of "coherent structure hurts" finding — consider whether narrative flow in system prompts is counterproductive for retrieval
- [ ] Validate that our compaction strategy preserves early-position critical instructions (position accuracy finding)
- [ ] Consider distractor minimization in context assembly — strip semantically-related but irrelevant content before injecting into agent prompts
- [ ] Use this paper as evidence for "fresh 200K per task" in client presentations and architecture docs
- [ ] Monitor Claude's abstention-over-hallucination behavior as a feature, not a bug — design agent error handling around it
