# 2 AI Coding Strategies I Wish I Knew Earlier

> **Cody Seibert (Web Dev Cody) — YouTube, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=Vn6ZjeRa6VE |
| Speaker | Cody Seibert (@webdevcody) — full-stack dev, YouTube educator, Automaker creator |
| Event | Web Dev Cody YouTube Channel |
| Duration | 00:09:34 (574s) |
| Date | 2026-04-09 |
| Topics | agent-coding, plan-mode, uncertainty-axis, prototyping, pair-prompting, agentic-workflows |

---

## Burak's Notes

> *Short practitioner reflection (10 min) on one axis: **well-known vs uncertain requirements**. The value isn't novelty — we already know plan-mode exists — the value is an explicit **decision rule** practitioners use to pick a strategy. Matches our own split between orchestrator-driven well-defined issues (plan-mode + E2E gate) and Burak's SaaS prototyping (vibe loops). Relevant for our Adoptable Patterns: a "requirements-uncertainty gate" that switches between plan-mode and rapid-iteration-in-pair. Cody also describes a **stash-and-restart pattern**: prototype with vibes, discover the true requirements, throw the code away, redo it properly in plan-mode. That's the "spike then harden" pattern we haven't formalized.*

---

## Key Takeaways

1. **Two strategies on a single axis** — Plot your task on a spectrum from "well-known requirements" (left) to "uncertain requirements" (right). Each end has its own optimal agent-coding strategy; picking wrong wastes hours.
2. **Well-known = plan mode with 1-5 iteration loops** — Throw max context at plan mode, iterate 1-5 times (ask questions, catch edge cases), then implement. Works for ~80% of the output; for the remaining 5-20% you retag context and add guardrails (TDD, Cypress tests) so the agent self-verifies during implementation.
3. **Uncertain = rapid pair-prompting, no MD files** — No upfront planning doc. Get a UX/product person on a Zoom, share screen, and fire prompts continuously. "On the fly" improvements to spacing, validation, colors. Use multiple parallel agent windows: notice a bug while play-testing, immediately spawn another agent to fix it.
4. **Spike-then-harden pivot pattern** — When uncertain work reveals the true requirements, **stash everything, discard the slop-accumulated code, and restart in plan mode**. One coherent plan-mode implementation > many iterative prototype patches for final code quality.
5. **Slop accumulates in iterative mode** — Explicit admission that rapid prompt-over-prompt iteration produces lower code quality than a single well-planned implementation. "Sometimes you start adding more slop into your code base." The iterative mode is for *discovery*, not production.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Confirms our dual-mode operation: orchestrator (well-defined GitHub issues → plan mode + E2E gate) vs Burak's SaaS prototyping (vibes, play-test, re-prompt). Not novel but articulates the decision rule cleanly. |
| **Actionable** | 7/10 | Three adoptable patterns: (1) a **requirements-uncertainty gate** at issue intake that routes to plan-mode vs vibe-loop; (2) the **spike-then-harden** pivot (stash prototype, restart in plan mode) as an explicit workflow state; (3) **multiple parallel agent windows** during uncertain work — a worker per observed issue during play-testing, matching our tmux+worktree model. |

---

## Summary

Cody Seibert describes his day-to-day agent-coding practice across both his professional work and side projects (notably a multiplayer game and SaaS prototypes). He argues all agent-coding work falls on a single axis: **well-known requirements** on one end, **uncertain requirements** on the other. The choice of strategy follows directly from where your task sits on that axis.

**Well-known requirements** describe the insurance-backend or enterprise case: a domain expert has bulletproof user stories, post-conditions, traffic expectations, data volumes. Here the optimal move is plan mode with max context injected. You iterate 1-5 times against the plan — asking questions, surfacing edge cases, cross-checking business rules — then implement. Cody estimates this approach nails ~80% of the work, with 5-20% misses the agent makes (missing requirements, adding bad code). For those misses you retag context or add runtime guardrails: TDD, Cypress tests during implementation so the LLM self-checks.

**Uncertain requirements** are the startup/game/prototype case. You don't know if cards or tables are the right UI. You don't have a game design doc. You're trying to *find* the product. Here, plan mode is a waste because any plan would be fictional. Cody's alternative is continuous prompting with a domain person (UX, product, co-founder) in the Zoom: share screen, fire prompts, test immediately, fire more prompts. He leans heavily on **multiple parallel agent windows** — while play-testing he notices the map editor lags or the weapon switcher is broken, and immediately spawns another agent window to fix each one without breaking his play-test flow.

The most interesting move is the **pivot**. Uncertain-requirements mode accumulates slop — "sometimes you start adding more slop into your code base" — so Cody's recommended workflow is to use it *for discovery only*, then once the product shape is clear, **stash everything, throw it all away, and restart in plan mode** with the newly-discovered real requirements. The one-shot plan-mode implementation produces dramatically better code quality than an iterative patch-over-patch history.

He closes by noting that many real tasks sit in the middle: some knowns, some unknowns you can't resolve without building the thing first. The decision is recursive — start prototyping to answer the open questions, then bounce back to plan mode once they're resolved.

---

## Notable Quotes

> "Well-known requirements will be on the left and I will say uncertain requirements will be on the right." — ~01:00 (the core framing)

> "Throw as much context into the plan mode as possible, and then kick off the plan mode, and then you actually want to iterate on it... one to five iterations to make sure that the plan is actually really solid." — ~04:10

> "Get them into a Zoom with you and just like iterate and prototype on something." — ~06:30 (on pair-prompting vs upfront spec docs)

> "Instead of sitting down with pen and paper and planning everything out in an MD file, I'm like on the fly improving the quality of my game." — ~07:20

> "Sometimes you can do a bunch of this rapid experimentation and prototyping to kind of get a feel for something... and then you can just stash everything and kind of pivot back to the well-known requirements." — ~08:10 (the spike-then-harden pattern)

> "Sometimes you start adding more slop into your code base." — ~08:40 (explicit iterative-mode cost admission)

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://agenticjumpstart.com | Cody's paid course on agent coding — likely the most detailed version of this framework, with concrete examples and workflows | `/ingest-article` (landing page) then optionally `/ingest-course` if course landing has more detail |
| https://discord.gg/JUDWZDN3VT | Agentic Jumpstart Discord — practitioner community for agent-coding workflows; worth scanning for pattern discussions | `/ingest-post` (manual scan, not bulk) |
| https://github.com/webdevcody/automaker | Cody's already-catalogued agent-coding IDE; relevant because Automaker operationalizes plan-mode-with-iteration as a GUI workflow | Already catalogued at `agent-harnesses/automaker.md` — cross-reference |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Plan Mode (Claude Code) | Core strategy for well-known requirements; iterate 1-5x on plan, then implement | Yes — referenced across many talks, canonical in `agent-harnesses/claude-code-*` |
| TDD / Cypress | Guardrails to reduce the 5-20% miss rate during implementation | Yes — referenced in Simon Willison, Matt Pocock talks |
| Survive the Night Game | Cody's multiplayer game prototype used as uncertain-requirements case study | No — tangential, not worth cataloguing |
| Automaker | Not explicitly named in this video, but the patterns Cody describes (plan + iteration + parallel agents) are what Automaker operationalizes | Yes — `agent-harnesses/automaker.md` |
| Agentic Jumpstart Course | Cody's paid course where this framework is elaborated | No — worth a future ingest for pattern-mining |

---

## Action Items

- [ ] Encode the **uncertainty-axis gate** as an explicit pre-flight check in our orchestrator issue intake: does the issue have well-defined acceptance criteria, or is it exploratory? Route to different workflows accordingly.
- [ ] Add the **spike-then-harden** workflow as a formal state transition: `UNCERTAIN_PROTOTYPE` → `DISCOVERED_REQUIREMENTS` → `DISCARD_PROTOTYPE` → `PLAN_MODE_RESTART`. Stop treating prototype code as final.
- [ ] Evaluate Cody's **parallel-agents-during-play-test** pattern for our E2E test phase: if Chrome DevTools MCP finds issues, immediately spawn fix workers in parallel windows rather than serially.
- [ ] Consider an ingest of `agenticjumpstart.com` landing page to mine the rest of Cody's framework.
- [ ] Link this talk from `agent-harnesses/automaker.md` as the "author's mental model" reference for why Automaker is built the way it is.
