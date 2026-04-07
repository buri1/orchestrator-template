# AgentRR

> **Record-and-replay framework for LLM agents — capture execution traces, summarize into reusable experiences, replay to guide future agent behavior.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | No public GitHub repo (research paper) |
| GitHub Stars | N/A |
| Publisher | Feng, Zhou, Liu et al. (research — academic team, 11 authors) |
| License | N/A (research paper, no released code) |
| Tech Stack | Python (inferred), LLM integration via MCP and A2A protocols |
| Maturity | 🔵 Research |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | The record-replay-learn loop directly addresses our need for agent reliability and failure recovery. We already have roadblock recovery, but structured experience replay could level it up. |
| **Novelty** | 7/10 | Multi-level experience abstraction (low-level precise ops vs. high-level generalized workflows) is a genuinely new framing we haven't seen in other agent debugging tools. |
| **Actionable** | 3/10 | No code released. The concepts are compelling but would need to be implemented from scratch. The check function mechanism is the most portable idea. |

---

## Overview

AgentRR (Agent Record & Replay) is a research framework published in May 2025 (arXiv:2505.17716) that applies the classical record-and-replay debugging technique from systems engineering to LLM agent workflows. The core insight is that agent execution traces can be recorded, summarized into structured "experiences" at multiple abstraction levels, and then replayed to guide agents through similar tasks in the future — improving reliability, reducing cost, and enabling privacy-aware execution.

The framework introduces two key innovations. First, a **multi-level experience abstraction** that balances specificity and generality: lower-level experiences capture precise behavioral operations for exact replay (like deterministic scripts), while higher-level experiences provide generalized workflow summaries that adapt to varying environments. Second, a **check function mechanism** that serves as a trusted computing base (TCB) — it verifies execution flow integrity, validates state preconditions, and enforces safety invariants during replay.

AgentRR also envisions an "experience repository" where agents share and reuse recorded experiences, and explores application modes including user-recorded task demonstrations, large-small model collaboration (record with a powerful model, replay with a cheaper one), and privacy-aware execution (record in a secure environment, replay in production).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  AgentRR Pipeline                │
│                                                  │
│  ┌──────────┐    ┌──────────────┐    ┌────────┐ │
│  │  RECORD   │───►│  SUMMARIZE   │───►│ REPLAY │ │
│  │           │    │              │    │        │ │
│  │ Trace     │    │ Multi-level  │    │ Guide  │ │
│  │ capture   │    │ experience   │    │ agent  │ │
│  │ (actions, │    │ abstraction  │    │ via    │ │
│  │  state,   │    │              │    │ check  │ │
│  │  env)     │    │ Low: precise │    │ funcs  │ │
│  │           │    │ High: general│    │        │ │
│  └──────────┘    └──────────────┘    └────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────────┐│
│  │         Experience Repository                ││
│  │  (shared, reusable knowledge base)           ││
│  └──────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

- **Record phase**: Captures agent interaction traces with environment and internal decision processes
- **Summarize phase**: Converts raw traces into structured experiences at multiple abstraction levels
- **Replay phase**: Uses experiences + check functions to guide agents through similar tasks
- **Check functions**: Trust anchors that verify execution flow, preconditions, and safety invariants
- **Integration**: Designed to work with MCP and A2A communication protocols

---

## Publisher Background

The paper has 11 co-authors (Erhu Feng, Wenbo Zhou, Zibin Liu, Le Chen, Yunpeng Dong, Cheng Zhang, Yisheng Zhao, Dong Du, Zhichao Hua, Yubin Xia, Haibo Chen). The team appears to be from Chinese university systems engineering labs with expertise in operating systems and trusted computing — they're applying systems-level replay/record concepts (like rr debugger, CRIU) to the agent domain. No commercial entity behind this; pure academic research.

---

## What's Valuable for Us

- **Check function pattern**: The idea of check functions as a "trusted computing base" for agent execution maps directly to our 70/30 deterministic/LLM split. We could implement check functions as deterministic validators in our orchestrator that verify agent outputs before accepting them — this is essentially what our E2E testing gate does, but AgentRR formalizes it as an inline mechanism.
- **Multi-level experience abstraction**: Our roadblock recovery already captures failure context, but AgentRR's idea of recording successful executions at multiple abstraction levels (precise replay vs. generalized guidance) could improve our agent spawning. Instead of always starting fresh, agents could receive "experience summaries" from prior successful runs.
- **Large-small model collaboration**: Record with Claude Opus, replay with Haiku. This directly maps to our cost optimization needs — use expensive models to establish patterns, then replay with cheaper models.

---

## What's NOT Relevant

- **No code to adopt**: This is a paper, not a tool. We can't pip install anything.
- **Experience repository / sharing**: Their vision of cross-agent experience sharing adds complexity we don't need. Our agents are ephemeral by design (context separation principle).
- **Python-centric research**: Even if code were released, it would likely be Python research code, not production TypeScript.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Implement a lightweight "check function" pattern in our orchestrator — deterministic validators that run after agent task completion to verify outputs meet expectations before marking tasks as done. This is the most portable concept from the paper.
- **Phase 3 (Days 60-90)**: If we see repeated similar tasks (e.g., "add CRUD endpoint for entity X"), we could record successful execution patterns and feed them as guidance to future agents, reducing LLM calls and improving consistency.
- **Phase 4 (Days 90+)**: Full record-replay for agent debugging — capture complete execution traces for post-mortem analysis when agents fail.

---

## Key Takeaway

> **AgentRR's check function mechanism and multi-level experience abstraction are the most intellectually interesting concepts — they formalize what we're already doing informally with E2E gates and roadblock recovery, and the "record with expensive model, replay with cheap model" pattern maps directly to our cost optimization strategy.**
