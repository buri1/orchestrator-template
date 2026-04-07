# HumeAI TADA

> **Open-source speech-language model using Text-Acoustic Dual Alignment for zero-hallucination, real-time text-to-speech synthesis.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [github.com/HumeAI/tada](https://github.com/HumeAI/tada) |
| HuggingFace | [HumeAI/tada collection](https://huggingface.co/collections/HumeAI/tada) |
| GitHub Stars | 859 (as of 2026-03-21) |
| Publisher | Hume AI (startup — voice AI research infrastructure) |
| License | MIT (code), Llama 3.2 Community License (weights) |
| Tech Stack | Python, PyTorch, HuggingFace Transformers, torchaudio, CUDA |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-21 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | TTS/speech synthesis is outside our orchestration domain; no current or near-term need for voice output in the L-Thread system or client projects |
| **Novelty** | 7/10 | The 1:1 text-acoustic token alignment is a genuinely novel architecture for LLM-based TTS — eliminates the token count explosion that plagues other speech models |
| **Actionable** | 2/10 | No integration path with our current stack; would only become relevant if a client project required voice UI or if agents needed speech output |

---

## Overview

TADA (Text-Acoustic Dual Alignment) is Hume AI's first open-source text-to-speech model, released on March 10, 2026. The core innovation is a 1:1 token alignment scheme where each text token maps to exactly one acoustic vector, rather than the 12.5-75 discrete audio tokens per second used by conventional LLM-based TTS systems. This collapses the sequence length dramatically — TADA operates at 2-3 frames per second versus competitors' 12.5-75, enabling ~700 seconds of audio context in a 2048-token window (versus ~70 seconds for conventional approaches).

The system generates text and audio in a single synchronized stream using dynamic autoregression: each step covers one text token, with the model determining duration and prosody individually. A flow-matching decoder head produces the final acoustic features. This dual-stream approach eliminates the class of "content hallucinations" (words inserted, repeated, or skipped) that plague other TTS systems — TADA achieved zero hallucinations across 1,000+ LibriTTSR test samples.

Three models are available: TADA-1B (English-only, based on Llama 3.2 1B), TADA-3B-ML (multilingual, based on Llama 3.2 3B), and TADA-Codec (shared encoder for all models). The multilingual model supports Arabic, Chinese, German, Spanish, French, Italian, Japanese, Polish, and Portuguese.

---

## Technical Architecture

```
┌───────────────────────────────────────────────────────┐
│                    TADA Pipeline                       │
│                                                        │
│  Input: Text + Reference Audio (voice clone source)    │
│       ↓                                                │
│  tada-codec (Encoder-Aligner)                          │
│    - Extracts per-text-token acoustic vectors           │
│    - 1:1 alignment (NOT N audio tokens per text token) │
│       ↓                                                │
│  LLM Backbone (Llama 3.2 1B or 3B)                    │
│    - Dual-stream autoregression                        │
│    - Each step: emit text token + acoustic vector      │
│    - Dynamic duration/prosody per token                │
│       ↓                                                │
│  Flow-Matching Decoder Head                            │
│    - Conditioned on LLM hidden state                   │
│    - Reduced from 20→10 steps (March 2026 update)      │
│       ↓                                                │
│  Output: Synthesized speech waveform                   │
└───────────────────────────────────────────────────────┘
```

**Key Performance Numbers:**
- Real-time factor: 0.09 (5x+ faster than comparable LLM-based TTS)
- Zero content hallucinations across 1,000+ test samples
- Speaker similarity: 4.18/5.0 (EARS dataset human eval)
- Naturalness MOS: 3.78/5.0
- Context window: ~700 seconds of audio in 2048 tokens
- VRAM: ~9GB for 3B model (bfloat16)
- torch.compile() optimized: ~0.12x RTF on H100

**Models:**
| Model | Params | Base | Languages | Downloads |
|-------|--------|------|-----------|-----------|
| tada-1b | ~2B | Llama 3.2 1B | English | 64.4K |
| tada-3b-ml | ~4B | Llama 3.2 3B | 9 languages | 28.7K |
| tada-codec | — | Custom | Shared encoder | 20 |

**Installation:**
```bash
pip install hume-tada
# or from source
git clone https://github.com/HumeAI/tada.git && cd tada && pip install -e .
```

**Known Limitations:**
- Speaker drift during extended generations (10+ minutes), mitigated via rejection sampling
- Language quality degrades when generating text alongside speech (mitigated by Speech Free Guidance)
- Pre-training limited to speech continuation; assistant/conversational use requires fine-tuning

---

## Publisher Background

Hume AI is a voice AI research startup focused on building "voice AI research infrastructure for frontier labs and AI-first enterprises." They provide training data, evaluation systems, and reinforcement learning infrastructure for voice model development. TADA is their first open-source model release, which signals a move toward community engagement and ecosystem building. The research paper (arXiv 2602.23068) demonstrates genuine academic rigor — the dual alignment approach is a novel contribution, not just an incremental improvement. The 68 upvotes on HuggingFace and 859 GitHub stars within 11 days of release indicate strong community interest.

---

## What's Valuable for Us

**Almost nothing for current Phase 1-3 work.** Our orchestrator system deals with code generation, task routing, and deterministic workflow management. TTS is entirely outside our domain.

**Potential cross-domain value:**
- **OmniPort-HH accessibility:** If the Hildesheim project ever requires BITV 2.0 (Barrierefreiheit) compliance with screen-reader alternatives, a TTS model that supports German could generate audio descriptions. However, browser-native TTS handles this more simply.
- **Agent voice interface (Phase 4+):** If Burak's unified multi-business system ever evolves toward voice-commanded orchestration (e.g., giving agents verbal instructions via Telegram voice messages), TADA's German support and zero-hallucination guarantee would make it a candidate for the speech synthesis side.
- **Token alignment as architecture pattern:** The 1:1 token alignment concept — collapsing a high-bandwidth signal into a sequence that matches the LLM's native token rate — is an interesting architectural principle. If we ever need to process non-text modalities (images, audio, structured data) through an LLM backbone, TADA's approach to alignment is worth studying.

---

## What's NOT Relevant

**Core orchestration work:** TADA solves none of the problems in our Master Blueprint — no task routing, no state management, no agent coordination, no context engineering. It is a model for generating speech audio, which is a different problem domain entirely.

**Governing Principle #7 ("Build only what you have needed in the last 30 days"):** We have not needed TTS in the last 30 days, nor in the last 90. No action required.

**Governing Principle #3 ("Context is zero-sum"):** Adding TTS capabilities to our agents would displace context for their actual work (code generation, orchestration). Speech synthesis belongs in a dedicated, separate service if ever needed.

---

## Future Use Cases

- **Phase 1-3:** None.
- **Phase 4 (Days 90+):** If a client project or SaaS product requires voice output (e.g., a customer-facing chatbot with speech, accessibility features for government projects, or a marketing engine that generates audio content), TADA would be the leading open-source option for German-language TTS. The MIT code license and Llama 3.2 Community License for weights are compatible with commercial use.

---

## Key Takeaway

> **TADA introduces a genuinely novel 1:1 text-acoustic alignment that eliminates TTS hallucinations and achieves 5x speed over competitors, but speech synthesis is entirely outside our orchestration domain — file under "impressive but irrelevant."**
