# Harness Design for Long-Running Application Development

> **Prithvi Rajasekaran — Anthropic Engineering Blog, 2026-03-24**

| Field | Value |
|-------|-------|
| Source | https://www.anthropic.com/engineering/harness-design-long-running-apps |
| Author | Prithvi Rajasekaran (Anthropic Labs) |
| Publication | Anthropic Engineering Blog |
| Date | 2026-03-24 |
| Topics | harness engineering, multi-agent architecture, generator-evaluator loop, context management, frontend design |
| Read Time | 15 min |

---

## Burak's Notes

> *Directly from Anthropic's engineering team — this is the canonical reference for harness design. The generator-evaluator loop is exactly our review-fix cycle. The "context anxiety" finding validates our context-clearing approach with worktrees. The sprint contract pattern between planner/generator/evaluator maps to our orchestrator/worker/reviewer flow. Cost data ($9 solo vs $200 harness for same app) quantifies the harness premium but also the quality delta.*

---

## Key Takeaways

1. **Generator-evaluator separation beats self-evaluation** — When agents evaluate their own work, they praise mediocre outputs. Separating generation from evaluation via distinct agents produces dramatically better results, inspired by GAN architecture.

2. **Context resets with structured handoffs > compression** — Claude Sonnet 4.5 exhibited "context anxiety," prematurely concluding work when approaching perceived context limits. Clean-slate context resets with handoff documents maintain coherence over long tasks.

3. **Harness assumptions must be stress-tested as models improve** — Every harness component encodes an assumption about what the model cannot do alone. As models evolve (4.5 to 4.6), previously essential scaffolding becomes unnecessary, but new harness combinations unlock previously impossible capabilities. The space of effective harness combinations expands, not shrinks.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates our orchestrator architecture: planner=orchestrator, generator=worker, evaluator=reviewer. Sprint contracts = task specs. Context resets = worktree isolation. |
| **Actionable** | 9/10 | Adopt sprint contract pattern (negotiate success criteria before implementation), adopt GAN-inspired eval loop, adopt Playwright MCP for E2E verification |

---

## Summary

Anthropic's engineering team shares advanced patterns for building applications through multi-agent architectures. The work addresses two interconnected challenges: generating high-quality frontend designs and enabling autonomous full-stack application development.

The core innovation is a GAN-inspired generator-evaluator loop with four grading criteria (design quality, originality, craft, functionality). Evaluators use Playwright MCP to interact with live pages before scoring, running 5-15 iterations per generation. This pushes models toward distinctive designs rather than safe defaults.

The full-stack architecture uses three agents: a Planner (converts brief prompts into product specs), a Generator (implements features iteratively with React/Vite/FastAPI/SQLite), and an Evaluator (tests running applications through Playwright against negotiated "sprint contracts"). The planner deliberately emphasizes high-level design over granular technical details to prevent cascading errors.

Results demonstrate the harness premium: a Retro Game Maker took 20 minutes and $9 solo (broken core gameplay) vs 6 hours and $200 with the harness (functional, polished application). A Digital Audio Workstation took 3 hours 50 minutes and $124.70. As Claude improved from 4.5 to 4.6, sprint decomposition became unnecessary, but the evaluator continued catching critical functionality gaps.

---

## Notable Quotes

> "When agents evaluate their own work, they tend to respond by confidently praising outputs — even when quality is obviously mediocre."

> "Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md | Official Anthropic frontend design skill — reference implementation | `/ingest-article` |
| https://www.anthropic.com/research/building-effective-agents | Referenced foundational blog post on agent design | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Agent SDK | Powers the three-agent system | Yes — [claude-agent-sdk](../agent-harnesses/claude-agent-sdk.md) |
| Playwright MCP | Used by evaluator to test live applications | Yes — referenced in multiple entries |
| React + Vite + FastAPI + SQLite | Generator's tech stack | N/A (standard tools) |

---

## Action Items

- [ ] Adopt sprint contract pattern: negotiate success criteria document between orchestrator and worker BEFORE implementation begins
- [ ] Implement GAN-inspired evaluator: separate reviewer agent with skeptical prompt tuning (not out-of-the-box Claude)
- [ ] Test context reset approach vs compaction for long-running tasks
- [ ] Benchmark harness cost vs quality tradeoff for our use cases
