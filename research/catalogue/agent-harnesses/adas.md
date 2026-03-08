# ADAS

> **Automated Design of Agentic Systems — a meta-agent that programs ever-better agents in code, discovering novel architectures that outperform hand-designed systems.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/ShengranHu/ADAS](https://github.com/ShengranHu/ADAS) |
| GitHub Stars | 1,500 (as of 2026-03-08) |
| Publisher | Shengran Hu, Cong Lu, Jeff Clune (research — UBC / Vector Institute) |
| License | Apache 2.0 |
| Tech Stack | Python (100%) |
| Maturity | 🔵 Research |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Academic meta-search over agent architectures. We're building production systems with a fixed, opinionated architecture — not searching for novel agent designs. |
| **Novelty** | 8/10 | The idea of a meta-agent that writes agent code, evaluates it, and iteratively improves is genuinely novel. The "agents designing agents" concept is philosophically interesting. |
| **Actionable** | 2/10 | Python research code for benchmarks (ARC, DROP, MMLU). No production utility. Can't drop this into our TypeScript orchestrator. |

---

## Overview

ADAS (Automated Design of Agentic Systems) is a research framework from ICLR 2025 that frames agent architecture design as a search problem. Instead of humans hand-designing agent systems (prompt chains, tool use patterns, reflection loops), ADAS uses a "Meta Agent Search" algorithm where a higher-level meta-agent iteratively designs, implements, evaluates, and improves lower-level agents — all in code.

The core algorithm works as follows: the meta-agent maintains an archive of previously discovered agent designs. In each iteration, it examines the archive, programs a new agent design in Python code, evaluates it on target benchmarks, and adds successful designs back to the archive. Over time, the meta-agent discovers increasingly sophisticated agent architectures that outperform hand-designed baselines.

The paper demonstrates this across multiple domains (ARC reasoning, DROP reading comprehension, MGSM multilingual math, MMLU knowledge, GPQA graduate-level QA) and shows that meta-discovered agents not only outperform hand-designed ones but also transfer across domains and models. It received the Outstanding Paper Award at the NeurIPS 2024 Open-World Agent Workshop and was accepted as an ICLR 2025 paper.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│           Meta Agent Search              │
│                                          │
│  ┌──────────┐    ┌──────────────────┐   │
│  │  Archive   │◄──│  Meta Agent       │   │
│  │  (prior    │   │  (LLM that writes │   │
│  │   agent    │──►│   agent code)     │   │
│  │   designs) │   └────────┬─────────┘   │
│  └──────────┘            │              │
│                    ┌──────▼──────┐       │
│                    │  Evaluate    │       │
│                    │  (benchmark  │       │
│                    │   suite)     │       │
│                    └─────────────┘       │
└─────────────────────────────────────────┘
```

- **Search space**: Python code defining complete agent systems (prompts, tool use, control flow, reflection)
- **Search algorithm**: Meta Agent Search — LLM-based iterative design with archive-guided exploration
- **Evaluation function**: Domain-specific benchmarks (accuracy on ARC, DROP, MGSM, etc.)
- **Archive**: Growing collection of discovered agent designs that informs future iterations
- **Per-domain structure**: Each benchmark domain has its own self-contained directory with evaluation functions
- **No infrastructure requirements**: Runs as a Python script with LLM API access

---

## Publisher Background

The primary authors are **Shengran Hu** (UBC), **Cong Lu** (Vector Institute/UBC), and **Jeff Clune** (UBC, Vector Institute). Jeff Clune is a well-known AI researcher formerly at OpenAI and Uber AI Labs, known for work on neural architecture search, quality-diversity algorithms, and open-ended evolution. His research group consistently publishes influential work on automated AI system design. The ADAS paper received significant attention: Outstanding Paper at NeurIPS 2024 workshop and ICLR 2025 acceptance. The work builds on Clune's broader research agenda around open-ended search and AI-generating algorithms.

---

## What's Valuable for Us

- **Conceptual pattern — "agents designing agents"**: While we won't run Meta Agent Search, the philosophical frame is interesting. Our orchestrator already does a lightweight version of this: it decomposes tasks, selects agent configurations, and iterates on failures. The ADAS insight that this can be formalized as a search problem with an archive of successful patterns could inform how we structure our roadblock recovery and agent spawning heuristics.
- **Archive pattern for agent configurations**: The idea of maintaining an archive of successful agent designs, ranked by performance, is a pattern we could apply to our orchestrator. Track which agent configurations (prompt templates, tool sets, context structures) succeed most often for which task types, and prefer those configurations in future spawns.
- **Transfer learning for agents**: ADAS shows that agent designs discovered in one domain transfer to others. This validates our approach of having general-purpose agent templates rather than hyper-specialized per-task agents.

---

## What's NOT Relevant

- **Python research code**: 100% Python, benchmark-focused. No TypeScript, no CLI tooling, no production patterns.
- **Benchmark-oriented**: Optimizes for academic benchmarks (ARC, MMLU). Our agents do real-world tasks (code writing, E2E testing, PR creation), which can't be evaluated with a simple accuracy metric.
- **Compute-intensive search**: Meta Agent Search requires many LLM calls to explore the design space. We're optimizing for cost efficiency ($200/mo Claude Max), not burning credits on meta-search.
- **Contradicts fixed architecture principle**: We've made deliberate architecture decisions (70/30 split, context separation, thin shared layer). ADAS assumes the architecture itself should be discovered, which conflicts with our "informed rebuild" philosophy.

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: When we have enough data on agent task success/failure rates, we could build a lightweight "agent configuration archive" inspired by ADAS — tracking which prompt templates, tool configurations, and context structures produce the best results for each task type.
- **Phase 4 (Days 90+)**: If we reach a point where we're spawning hundreds of agents daily across multiple business lines, automated agent configuration optimization (a production-grade version of what ADAS does for research) could become worthwhile. But this is a distant future concern.

---

## Key Takeaway

> **ADAS is intellectually fascinating — a meta-agent that discovers novel agent architectures through iterative code generation — but it's a research tool optimizing for benchmarks, not a production system. The most portable idea is the archive pattern: track successful agent configurations and prefer them for similar future tasks.**
