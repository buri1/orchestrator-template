# Garry Tan's CLAUDE.md Prompt for Claude Code — Structured Review Before Implementation

> **@Amank1412 — 2026-02-17**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/Amank1412/status/2023754885473394918) |
| Author | [@Amank1412 — Aman, 20, eng, building @ClawGTM, prev @ Worldquant](https://x.com/Amank1412) |
| Date | 2026-02-17 |
| Topics | Claude Code, CLAUDE.md, prompt engineering, structured review workflow, context engineering |
| Type | Single post (with image of Garry Tan's original prompt) |

---

## Burak's Notes

> *Garry Tan's prompt evolved into gstack (23 skills, 600K+ LOC in 60 days). The core insight here -- review-before-implementation via CLAUDE.md -- is exactly what our orchestrator does by design: workers never self-review, the orchestrator enforces the review cycle. The "engineered enough" checkpoint is a pattern we should adopt in our spawn prompts.*

---

## Key Takeaways

1. **Review-before-implementation as a CLAUDE.md pattern** — Garry Tan (YC CEO) uses a structured prompt that forces Claude to evaluate architecture, code quality, tests, and performance BEFORE writing any code. This prevents the common failure mode of jumping straight to implementation.
2. **"Engineered enough" as a complexity gate** — The prompt explicitly asks Claude to decide if a plan is overbuilt, underbuilt, or appropriately engineered. This prevents both over-engineering and under-engineering, saving significant time on feature development.
3. **CLAUDE.md as a virtual staff engineer** — For small teams without senior reviewers on every PR, embedding review discipline directly into the AI's instructions effectively creates a persistent staff-engineer-level review process. Garry reports shipping 4,000+ LOC features with full tests in about an hour using this approach.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly applicable to our orchestrator's worker prompts and CLAUDE.md configuration; Garry Tan later evolved this into gstack (23 skills); validates the review-gate pattern we already use; high engagement (233K views, 6.5K bookmarks) signals broad practitioner adoption |

---

## Full Content

CEO of Y Combinator shared his CLAUDE.md prompt for Claude Code

It helps him ship 4,000+ line features with full tests in about an hour:

This prompt pushes Claude to:

Decide if the plan is overbuilt, underbuilt, or "engineered enough" before writing any code

Aggressively review test coverage, edge cases, and failure modes

Look for performance risks, scaling issues, and refactoring opportunities

But the real difference is the workflow.

Instead of jumping into implementation, he makes Claude:

Do a structured review (architecture -> code quality -> tests -> performance)

Present tradeoffs with opinionated recommendations

Pause for feedback before proceeding

In other words, Garry is using it as a senior engineer reviewing the system before changes are made.

For small teams, this is a game changer. When you don't have a staff engineer reviewing every PR, you design the review process into your AI.

*[Attached image: Screenshot of Garry Tan's original prompt text]*

**Engagement:** 67 replies, 276 reposts, 2,998 likes, 6,515 bookmarks, 233.1K views

---

## Notable Replies

> **@deniskrainovic (DEN)**: "its not his CLAUDE.md, just prompt"
> *Correction: the original Garry Tan post was a standalone prompt, not a CLAUDE.md file. Garry later formalized it into gstack. 12 likes, 8.1K views.*

> **@Shannoncode (Shannon Code)**: "This is pretty much my process too, but I manually prompt it every time, adjusting slightly for complexity of the feature, complexity of the target system. But seriously every significant feature is dead in the water without first having a full understanding of the target system."
> *Practitioner validation: experienced devs already do this manually; the value is encoding it into CLAUDE.md for consistency.*

> **@codymclain (Cody McLain)**: "the 'engineered enough' check is genius lol. saves so much time from overbuilding simple features into enterprise monsters"
> *Highlights the anti-over-engineering value of the complexity gate.*

> **@infooperative (CIPHER)**: "the claude.md file is the most underated part of the whole setup. its basically giving claude a brain transplant specific to your codebase. been using custom prompts like this since october. output quality went up 3x overnight"
> *Claims 3x quality improvement from CLAUDE.md customization -- anecdotal but directionally consistent with community consensus.*

> **@RRabinovici (Ronen Rabinovici)**: Links back to Garry Tan's original post (@garrytan, Feb 7): "I use a very specific prompt to push Claude to check its work and do a lot of testing and thinking about perf and refactoring. I find I can do big features (4K LOC+ with full testing) in about an hour."
> *Provides the source attribution -- Garry Tan's original post from Feb 7, 2026.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/garrytan/gstack | Garry Tan's full 23-skill Claude Code setup that evolved from this prompt; 600K+ LOC produced; CEO/Designer/EM/QA role-based skills | `/tool-catalogue` |
| https://x.com/garrytan/status/2020072098635665909 | Garry Tan's original Feb 7 post with the actual prompt text and screenshot | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | The AI coding tool this CLAUDE.md prompt targets | Yes — [claude-agent-sdk](../agent-harnesses/claude-agent-sdk.md) |
| CLAUDE.md | Claude Code's project-level instruction file | Referenced across multiple catalogue entries |
| gstack | Garry Tan's 23-skill Claude Code setup (evolved from this prompt) | Not yet catalogued — consider `/tool-catalogue` |
