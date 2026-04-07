# DyLAN

> **Dynamic LLM-Agent Network: An LLM-agent Collaboration Framework with Agent Team Optimization**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [SALT-NLP/DyLAN](https://github.com/SALT-NLP/DyLAN) |
| GitHub Stars | 196 (as of 2026-03-08) |
| Publisher | SALT-NLP Lab (Stanford/Tsinghua — research) |
| License | MIT |
| Tech Stack | Python, OpenAI API (GPT-3.5/GPT-4), numpy |
| Maturity | 🔵 Research (academic paper implementation, last pushed May 2024) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Research framework for dynamic agent team composition — interesting concept but purely academic, no production viability. We already validated that 2-3 agents are optimal; DyLAN's contribution is the formal proof via Agent Importance Score. |
| **Novelty** | 6/10 | The "LLM-as-a-neuron" metaphor and temporal feed-forward network abstraction is a genuinely novel framing. The Agent Importance Score metric for unsupervised team optimization is new. |
| **Actionable** | 2/10 | Research code only. Tightly coupled to OpenAI API, benchmark-specific evaluation scripts. No production patterns, no reusable abstractions. The conceptual insight (dynamic team selection > static teams) is already part of our thinking. |

---

## Overview

DyLAN (Dynamic LLM-Agent Network) is a research framework from Stanford/Tsinghua that treats multi-agent LLM collaboration as a neural network problem. The core innovation is modeling agent teams as temporal feed-forward networks (T-FFNs), where each communication round between agents corresponds to a network layer. Nodes are agents, edges are communications, and the framework dynamically selects which agents participate at each layer based on task requirements.

The framework operates in two stages: (1) Team Optimization — using an unsupervised "Agent Importance Score" metric to select the best agents for a given task type, and (2) Task Solving — running the optimized team through multiple communication rounds with inference-time agent selection and early stopping. DyLAN achieves 13% improvement on MATH and 13.3% on HumanEval over single-agent GPT-3.5-turbo execution.

The key insight is that static agent teams with fixed interaction patterns are suboptimal — the framework dynamically adjusts both which agents participate and how they communicate based on the task. This is implemented as an "LLMLP" (LLM-based Multi-Layer Perceptron), structuring the code in a neural network style with forward passes, layers, and activation functions replaced by LLM calls.

---

## Technical Architecture

### Core Abstraction: Temporal Feed-Forward Network (T-FFN)

```
Layer 0 (Input):   [Agent_1, Agent_2, ..., Agent_N] ← all agents receive query
Layer 1:           [Agent_2, Agent_5] ← inference-time selection
Layer 2:           [Agent_1, Agent_5] ← dynamic re-selection
...
Layer K (Output):  [Agent_3] ← final answer (early stopping or max rounds)
```

### Key Components

| Component | Function |
|-----------|----------|
| `LLMLP` | Core class — implements the multi-layer perceptron analogy with LLM agents as neurons |
| `Agent Importance Score` | Unsupervised metric measuring each agent's contribution to team output quality |
| `Ranker` | Inference-time agent selection module — decides which agents participate in each round |
| `Early Stopping` | Halts communication rounds when agents converge on an answer |

### Data Flow

1. Query enters all agents at Layer 0
2. Each agent produces an initial response
3. Ranker evaluates agent outputs and selects top-K for next layer
4. Selected agents see previous round's outputs and refine
5. Repeat until convergence (early stopping) or max rounds reached
6. Final agent output selected by ranking

### Code Structure

- `code/demo/run_DyLAN.py` — Quick-start demo
- `code/MATH/` — MATH benchmark experiments
- `code/MMLU/` — MMLU benchmark experiments
- `code/HumanEval/` — HumanEval code generation experiments
- `exp/` — Pre-computed experiment records for result verification

---

## Publisher Background

DyLAN comes from the **SALT-NLP Lab** with authors spanning Stanford (Diyi Yang's lab) and Tsinghua University (Peng Li, Yang Liu). Diyi Yang is a well-known NLP researcher at Stanford, previously at Georgia Tech. The paper was published on arXiv (October 2023) and accepted at academic venues. This is a research group with strong academic credentials but no production tooling track record. The repository is a paper accompaniment, not a maintained software project — last pushed May 2024 with no updates since.

---

## What's Valuable for Us

### 1. Agent Importance Score Concept

The unsupervised metric for measuring how much each agent contributes to team output quality is conceptually valuable. In our orchestrator, we could adapt this to track which agent configurations produce the best results over time — not by implementing DyLAN's exact formula, but by logging agent task outcomes and computing contribution scores.

### 2. Formal Validation: Dynamic > Static Teams

DyLAN provides academic evidence that dynamically composing agent teams per-task outperforms fixed teams. This validates our approach of spawning task-specific agent configurations rather than running a static pool of permanent agents.

### 3. Early Stopping for Multi-Round Communication

The convergence detection mechanism (stop when agents agree) is a useful pattern for any multi-agent discussion/debate setup. If we ever implement agent deliberation rounds, early stopping prevents wasting tokens on consensus that's already been reached.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **Neural network metaphor** | Overcomplicating what is fundamentally "run multiple agents, pick best output." The MLP analogy is elegant for a paper but adds no practical value. |
| **OpenAI-only implementation** | Hardcoded to GPT-3.5/GPT-4 API. We are Claude-first. |
| **Benchmark-specific code** | MATH, MMLU, HumanEval evaluation scripts have zero applicability to production orchestration. |
| **7-agent default team size** | Their optimal teams run 3-7 agents. We've established that 4+ is universally suboptimal for our coordination overhead model (exponent 1.724). |
| **Research-grade code quality** | No error handling, no logging, no state management, no recovery. Paper code, not production code. |
| **Communication round overhead** | Multiple synchronous LLM rounds per task multiplies latency and cost. Our one-shot task formulation (validated by Stripe) is more efficient. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None. No immediate applicability.
- **Phase 2 (Days 4-60):** None directly. Could reference the Agent Importance Score concept when designing agent performance tracking.
- **Phase 3 (Days 60-90):** If implementing agent quality metrics, review DyLAN's contribution scoring formula as one input to a simpler production metric.
- **Phase 4 (Days 90+):** If scaling to scenarios requiring agent deliberation (e.g., code review debates between agents), the early stopping and dynamic selection patterns become relevant reference material.

---

## Key Takeaway

> **DyLAN is an academically interesting proof that dynamic agent team composition outperforms static teams, but its neural-network-as-orchestration metaphor adds complexity without production value — the useful insight (select agents per-task, stop early on consensus) fits in two sentences.**
