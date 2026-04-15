# Hyperagents: Darwin Gödel Machine Self-Improving AI Agents

> **@jennyzhangzt — 2026-03-23**

| Field | Value |
|-------|-------|
| Source | https://x.com/jennyzhangzt/status/2036099935083618487 |
| Author | [@jennyzhangzt — Jenny Zhang, Meta AI Research Intern] |
| Date | 2026-03-23 |
| Topics | self-improving agents, metacognitive AI, open-ended evolution, agent research |
| Type | Single post |

---

## Burak's Notes

> *DGM-H is the theoretical far edge of what self-improving agent systems can become. The core insight — that improving task performance doesn't automatically improve the self-improvement process itself — is a meaningful constraint that prior systems ignored. The "metacognitive self-modification" framing is worth tracking: agents that evolve their own evolution procedure. Not directly applicable to orchestration engineering today, but this is the trajectory the field is heading toward.*

---

## Key Takeaways

1. **Metacognitive self-modification closes the alignment gap in DGM** — The original Darwin Gödel Machine assumed coding performance and self-improvement skill are aligned (both expressed in code). Hyperagents break this assumption by making the self-improvement procedure itself evolvable across any domain.
2. **Cross-domain transfer of meta-level improvements** — Meta-level improvements (persistent memory, performance tracking, agent generation strategies) learned in one domain (e.g., coding) transfer to other domains (robotics reward design, Olympiad math, paper review), demonstrating genuine generalization.
3. **Open-ended self-improvement is now domain-agnostic** — DGM-H outperforms baselines without self-improvement, baselines without open-ended exploration, and prior self-improving systems (including original DGM) across 4 diverse task domains.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Research-horizon AI agent architecture; self-improving agent systems are the upstream research feeding into coding agent harness design. Not directly applicable today but signals the trajectory of agent autonomy and self-modification patterns. |

---

## Full Content

Introducing Hyperagents: an AI system that not only improves at solving tasks, but also improves how it improves itself.

The Darwin Gödel Machine (DGM) demonstrated that open-ended self-improvement is possible by iteratively generating and evaluating improved agents, yet it relies on a key assumption: that improvements in task performance (e.g., coding ability) translate into improvements in the self-improvement process itself. This alignment holds in coding, where both evaluation and modification are expressed in the same domain, but breaks down more generally. As a result, prior systems remain constrained by fixed, handcrafted meta-level procedures that do not themselves evolve.

We introduce Hyperagents – self-referential agents that can modify both their task-solving behavior and the process that generates future improvements. This enables what we call metacognitive self-modification: learning not just to perform better, but to improve at improving.

We instantiate this framework as DGM-Hyperagents (DGM-H), an extension of the DGM in which both task-solving behavior and the self-improvement procedure are editable and subject to evolution. Across diverse domains (coding, paper review, robotics reward design, and Olympiad-level math solution grading), hyperagents enable continuous performance improvements over time and outperform baselines without self-improvement or open-ended exploration, as well as prior self-improving systems (including DGM).

DGM-H also improves the process by which new agents are generated (e.g. persistent memory, performance tracking), and these meta-level improvements transfer across domains and accumulate across runs.

This work was done during my internship at Meta (@AIatMeta), in collaboration with Bingchen Zhao (@BingchenZhao), Wannan Yang (@winnieyangwn), Jakob Foerster (@j_foerst), Jeff Clune (@jeffclune), Minqi Jiang (@MinqiJiang), Sam Devlin (@smdvln), and Tatiana Shavrina (@rybolos).

---

## Notable Replies

*Replies not accessible via automated scraping at time of ingestion.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://arxiv.org/abs/2603.19461 | Full DGM-H paper — Hyperagents: Recursive Metacognitive Self-Improvement; cross-domain self-improving agent architecture with full experimental results | `/ingest-article` |
| https://arxiv.org/abs/2505.22954 | Original Darwin Gödel Machine paper (predecessor); SWE-bench 20%→50%, Polyglot 14.2%→30.7% via iterative self-modification; foundational reference for DGM-H | `/ingest-article` |
| https://github.com/jennyzzt/dgm | Original DGM implementation by Jenny Zhang; useful for understanding the baseline architecture that DGM-H extends | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Darwin Gödel Machine (DGM) | Predecessor system; open-ended self-improvement via iterative agent modification on coding tasks | Not yet catalogued — consider `/tool-catalogue` or `/ingest-article` (arxiv.org/abs/2505.22954) |
| DGM-Hyperagents (DGM-H) | Main subject; extends DGM with editable self-improvement procedure for cross-domain metacognitive evolution | Not yet catalogued — consider `/ingest-article` (arxiv.org/abs/2603.19461) |
| Meta AI | Research institution where the internship was conducted | Not yet catalogued |
