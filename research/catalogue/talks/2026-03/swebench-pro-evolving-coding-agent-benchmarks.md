# SWEBench Pro — Evolving Coding Agent Benchmarks

> **Jiannis Hood — Coding Agents: AI Driven Dev Conference 2026, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (04:44:25 – 04:52:26) |
| Speaker | Jiannis Hood — Scale AI / SWEBench Pro co-founder |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~8 min (lightning talk) |
| Date | 2026-03-08 |
| Topics | benchmarks, coding agents, SWEBench, evaluation, data contamination, agent evolution |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Data contamination is the core problem SWEBench Pro solves** — As models trained on more code, the original SWEBench (Princeton) became contaminated. SWEBench Pro uses strictly licensed repos and acquired proprietary codebases to ensure models have never seen the test data.

2. **GitHub issue resolution is only ~25% of real software engineering** — Scale AI surveys show issue resolution is a shrinking fraction of engineer time, yet it's all that current benchmarks measure. SWEBench Pro is expanding to assess understanding, validation, and improvement of software systems — not just fixing issues.

3. **New benchmark launching at the conference** — A new multi-stage benchmark was announced (first public reveal) that requires agents to explore and run code for multi-file reasoning, not just observe. Includes rubrics for failure analysis and post-training data for model builders.

4. **Coding as "legs and hands" for AI** — Hood's vision: given enough freedom, coding agents will start building their own tools that are more intuitive to the agents themselves. Early signals from TerminalBench (Stanford) and OpenClaw support this thesis.

5. **Roadmap: human-agent interaction + domain expansion** — Future directions include strengthening agent escalation (knowing when to ask humans for help), collaborating with Stanford on next-gen TerminalBench, and expanding into healthcare, finance, legal, and other engineering domains.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly about coding agent evaluation — understanding benchmark evolution helps us pick the right agents and understand capability claims. The "beyond issue resolution" thesis aligns with our orchestrator pattern where agents do more than just write patches. |
| **Actionable** | 4/10 | No tools to adopt directly, but the framework for evaluating agent capabilities (multi-file reasoning, code exploration, human escalation) is useful for our own agent quality assessment. |

---

## Summary

Jiannis Hood, co-founder of SWEBench Pro at Scale AI, traced the evolution of coding agent benchmarks from the original SWEBench (Princeton) through the proliferation of SWEBench variants, all of which suffered from data contamination as models trained on increasingly large code corpora. SWEBench Pro solved this by using strictly licensed repos and even acquiring companies for their proprietary codebases, combined with human verification that each problem has the right amount of context.

SWEBench Pro quickly became the industry standard — even receiving a recommendation from OpenAI over their own benchmarks. But Hood's central question was: what comes next? His surveys found that GitHub issue resolution represents only about 25% of a software engineer's work, and that percentage is declining as coding agents improve at exactly that task.

The talk culminated in the announcement of a new benchmark (first public reveal, official launch the next day) that evaluates agents on understanding, validating, and improving software systems in real repositories. This requires multi-file reasoning, code exploration, and actual execution — not just observation. The benchmark also ships with post-training data and failure analysis rubrics for model builders.

Hood closed with a forward-looking vision: coding as the "legs and hands" for AI, where agents given enough freedom will develop their own tools. He cited TerminalBench (Stanford) and OpenClaw as early signals, and outlined a roadmap including human-agent interaction improvements, next-gen TerminalBench collaboration, and expansion into healthcare, finance, and legal domains.

---

## Notable Quotes

> "Coding is not just GitHub resolution. There are a lot more to do being a software engineer." — 04:48:27

> "Our vision believes if we give coding agents enough freedom, they will start developing tools that make more sense to the agents themselves — that's more intuitive and effective." — 04:50:23

> "We never expect what we are leaving to this world as the final thing of coding agents, but we are very excited to see what kind of a splash we can make." — 04:51:59

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://swebench.com (probable) | SWEBench Pro official site — leaderboard data, methodology details | `/ingest-article` |
| TerminalBench (Stanford) | Measures AI capability through command line exploration — novel benchmark axis | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| SWEBench (original) | Princeton benchmark that started the coding agent evaluation space | No — foundational reference |
| SWEBench Pro | Hood's benchmark solving contamination via proprietary codebases | No — this entry covers it |
| Cursor | Mentioned as example of IDE + AI evolution | [Yes](../../developer-gui/cursor.md) |
| TerminalBench | Stanford benchmark measuring AI command-line exploration capability | No — consider `/tool-catalogue` |
| OpenClaw | Cited as signal of agents building their own tools | [Yes](../../orchestration-platforms/openclaw.md) |

---

## Action Items

- [ ] Track SWEBench Pro leaderboard for agent capability comparisons when evaluating harnesses
- [ ] Watch for the new multi-stage benchmark release (announced day after conference)
- [ ] Investigate TerminalBench — agent command-line exploration is directly relevant to our tmux-based orchestration
- [ ] Consider the "25% issue resolution" framing when evaluating agent tools that only benchmark on SWE-Bench
