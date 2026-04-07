# The Six-Month Recap: Closing Talk on AI at Web Directions

> **Geoffrey Huntley — ghuntley.com, 2025-06-17**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/six-month-recap |
| Author | Geoffrey Huntley (former AI Dev Productivity Tech Lead at Canva, then Sourcegraph) |
| Publication | ghuntley.com |
| Date | 2025-06-17 (last modified 2026-01-06) |
| Topics | AI productivity, agent workflows, multi-boxing, specs-driven dev, hiring disruption, organizational adoption |
| Read Time | ~25 min |

---

## Burak's Notes

> *6-month longitudinal perspective from a practitioner already in our catalogue. Validates specs-driven workflows, multi-boxing (our parallel agent pattern), subagent architecture, and the "back pressure" feedback loop. The Fruitco adoption curve case study is useful for client conversations about AI readiness. The context window degradation data point (147-152K actual vs 200K advertised for Claude 3.7) is operationally relevant.*

---

## Key Takeaways

1. **AI disruption is already sufficient** — Huntley argues that even if AI tooling froze at June 2025 levels, it would already be enough to fundamentally disrupt software engineering. The trajectory makes complacency dangerous, especially at high-performance companies.

2. **Multi-boxing (parallel agents) is the force multiplier** — Drawing from MMO gaming terminology, Huntley advocates running multiple AI instances concurrently rather than sequentially. "A thousand AI coworkers tackling your entire backlog all at once" instead of one assistant. This directly validates our orchestrator's parallel agent spawning.

3. **Specs-driven workflow replaces Jira** — Dialogue-based specification generation before coding creates richer context than thinly-sliced tickets. Stories begin at 50-70% completion; engineers fill gaps. AI can complete weeks of co-worker output in hours when fed proper specs.

4. **Context window degradation is real** — Claude 3.7 Sonnet advertises 200K tokens but observed quality degrades at 147-152K. This has direct implications for our agent context budgets and subagent spawning thresholds.

5. **Organizational adoption follows a predictable curve** — The "Fruitco" case study (7 developer archetypes) shows a critical "precarious moment of doubt" when employees grasp AI capabilities while fearing job security. Non-adopters face relative performance degradation regardless of prior excellence.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Validates multi-agent orchestration, specs-driven workflows, subagent architecture, and back pressure patterns — all core to our system. Not directly about building orchestrators, but strongly confirms our architectural decisions. |
| **Actionable** | 6/10 | The context window degradation threshold (147-152K) is immediately useful for agent config. The "standard library" prompt template concept maps to our .claude/commands/. Multi-boxing validates our parallel spawning. Less novel for us since we already implement most patterns. |

---

## Summary

Geoffrey Huntley's closing talk at Web Directions Melbourne (June 2025) synthesizes six months of intensive AI-assisted development into a comprehensive field report. The talk is structured as a practitioner's journey from skeptical experimentation to full adoption, with organizational and societal implications layered in.

The core thesis is twofold: (1) AI-assisted development has already crossed the disruption threshold — even without further improvement, current tools fundamentally change the economics of software creation, and (2) the primary barrier to adoption is organizational and cultural, not technical. Huntley illustrates this through "Fruitco," a fictional company where seven developers respond differently to AI, creating predictable adoption dynamics that mirror real organizational patterns.

Technically, Huntley advocates three key practices: **specs-driven development** (generating detailed specifications through dialogue before coding), **multi-boxing** (running multiple AI instances in parallel, borrowed from MMO gaming), and **standard libraries** (maintaining reusable prompt templates to correct model defaults). He demonstrates these through practical examples including a Haskell audio library built autonomously while he was at the pool, a compiler for a custom language, and COBOL emoji calculators.

The talk addresses uncomfortable implications: AI as an "intellectual property mixer" that enables company cloning, the obsolescence of traditional IDE paradigms (unchanged since Turbo Pascal 1983), the death of LeetCode-style hiring (with Canva publicly pivoting to AI-native interview processes), and the erosion of specialization-based professional identity. Huntley concludes that engineers must shift from creating software to automating the creation of software, maintaining accountability for outcomes rather than authorship of code.

---

## Notable Quotes

> "If AI and AI developer tooling were to cease improving today, then it would already be good enough to disrupt our profession completely."

> "Software engineers who haven't started exploring or adopting AI-assisted software development are, frankly, not going to keep up."

> "The future belongs to people who can just do things."

> "Ideas are now execution — spoken prompts can create immediate results."

> "This is a perilous year to be complacent, especially at high-performance companies."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/specs/ | Detailed specs-driven workflow methodology — core to his approach | `/ingest-article` |
| https://ghuntley.com/multi-boxing/ | Full treatment of parallel agent execution pattern | `/ingest-article` |
| https://ghuntley.com/subagents/ | Subagent architecture and token management strategies | `/ingest-article` |
| https://ghuntley.com/stdlib/ | "Standard library" prompt template methodology | `/ingest-article` |
| https://ghuntley.com/mirrors/ | LLMs as mirrors of operator skill — assessment methodology | `/ingest-article` |
| https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews/ | Major company publicly redesigning hiring for AI-native candidates | `/ingest-article` |
| https://ghuntley.com/agent/ | Free workshop on building coding agents | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary coding agent tool; context window analysis | Yes — [agent-harnesses/](../agent-harnesses/) |
| Windsurf | Used for the "oh fuck moment" Rust→Haskell conversion | No — not yet catalogued |
| Cursor | Referenced as AI IDE category; questioned IDE paradigm | Yes — [developer-gui/cursor.md](../developer-gui/cursor.md) |
| Amp Code | Referenced as AI coding tool | Yes — [agent-harnesses/amp-code.md](../agent-harnesses/amp-code.md) |
| GitHub Copilot | Referenced as AI coding tool | No — not yet catalogued |
| Grok | Best for red-team/offensive security due to fewer safety restrictions | No — not yet catalogued |
| Gemini | Best for document summarization due to large context + RL refinement | No — not yet catalogued |

---

## Action Items

- [ ] Apply the 147-152K context window degradation threshold to agent context budget configs
- [ ] Review Huntley's specs technique at ghuntley.com/specs/ — potential improvement to our PRD generation workflow
- [ ] Consider ingesting the 6 deep dive candidates above (ghuntley.com/specs, /multi-boxing, /subagents, /stdlib, /mirrors, /agent are all potentially 7+ relevance)
