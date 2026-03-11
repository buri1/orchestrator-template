# Multi Boxing LLMs

> **Geoffrey Huntley — ghuntley.com, 2025-01-28**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/multi-boxing |
| Author | Geoffrey Huntley (former AI Dev Productivity Tech Lead at Canva/Sourcegraph, open-source maintainer) |
| Publication | ghuntley.com |
| Date | 2025-01-28 (last modified 2025-03-05) |
| Topics | multi-boxing, parallel agents, IDE design, autonomous coding, force multiplier |
| Read Time | ~3 min |

---

## Burak's Notes

> *Early-2025 articulation of the parallel agent thesis that became our L-Thread Orchestrator's conduit/teams modes. Huntley frames it through World of Warcraft multi-boxing -- why run one agent when you can run four? The key insight about splitting work into "separate discrete domain units" is exactly the worktree isolation pattern we adopted. Short but historically significant as one of the earliest public calls for IDEs designed around agents first, humans second. Companion piece to the six-month recap where he reports actually doing this in production.*

---

## Key Takeaways

1. **IDE design is stuck in 1983** -- Current coding assistants (Cursor, Windsurf, Cody, Copilot) are retrofitted into the synchronous single-pane-of-glass paradigm inherited from Turbo Pascal. This is a fundamentally flawed approach for the LLM era because agents don't need visual interfaces to work.

2. **Multi-boxing as force multiplier** -- Borrowed from World of Warcraft, where players control multiple characters simultaneously: instead of picking one story from the backlog, run multiple coding agents concurrently on multiple stories. The key to success is ensuring agents don't fight each other by splitting work into discrete domain units or checking out the codebase multiple times.

3. **Next-gen IDEs should be agent-first, human-second** -- Instead of "collaborate with humans" (Zed's model), invert it to "collaborate with LLMs" where an unbounded number of agents can connect to the IDE. Or perhaps, as Devin suggests, ditch the IDE entirely.

4. **Isolation is the prerequisite for parallelism** -- The practical insight: parallel agents work only when they operate on separate domain units within the same codebase, or on separate checkouts of the codebase. Without isolation, agents conflict and the multi-boxing pattern collapses.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly describes the parallel agent pattern that became our L-Thread Orchestrator. Multi-boxing = our conduit/teams mode. Worktree isolation = our tmux+worktree architecture. This is a foundational text for our approach. |
| **Actionable** | 6/10 | The article is more thesis than implementation guide -- it poses the right questions but doesn't provide concrete tooling or patterns. The actionable insight (isolate work into discrete domain units) we've already implemented. The "IDE designed for agents" vision is forward-looking but not yet buildable. |

---

## Summary

Geoffrey Huntley argues that the entire paradigm of software development tools is fundamentally misaligned with the capabilities of LLM coding agents. IDEs since Turbo Pascal in 1983 have been designed around a single human sitting in front of a single screen, working on a single task synchronously. Modern AI coding assistants (Cursor, Windsurf, Cody, GitHub Copilot) have inherited this baggage by embedding themselves into existing IDE designs rather than rethinking the paradigm.

Huntley proposes "multi-boxing" -- a term borrowed from World of Warcraft where players control multiple characters simultaneously -- as the correct mental model. Instead of an engineer picking one story from the backlog, they should allocate multiple stories and run multiple coding agents concurrently. He reports experimenting with this at home and finding it works, provided the work is split into separate discrete domain units within the codebase or agents work on separate checkouts.

This leads to his call for next-generation IDEs designed around agents first, humans second. He suggests inverting Zed's "collaborate with humans" model to "collaborate with LLMs" where an unbounded number of agents can connect. He even questions whether IDEs are needed at all, nodding at Devin's fully autonomous approach as potentially the right direction.

---

## Notable Quotes

> "Why level one character when you can do three or four at the same time?"

> "The key to making it work is ensuring these agents don't fight with each other by splitting the work into separate discrete domain units of work within the same code-base or checking out the code-base multiple times."

> "What if instead of being shackled to design inherited from Turbo Pascal in 1983 -- where IDEs are centred around humans we had a fresh take -- IDEs are designed around software assistants first, humans second."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/oh-fuck | Huntley's precursor post referenced as the trigger for multi-boxing thinking; contains the original "oh fuck" realization about AI disruption | **INGESTED**: [An "Oh Fuck" Moment in Time](./oh-fuck-moment-in-time.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Cursor | Listed as an IDE-embedded AI assistant following the flawed synchronous paradigm | [Yes](../../developer-gui/cursor.md) |
| Windsurf (Windsurfer) | Listed alongside Cursor as same-paradigm AI assistant | No -- low priority, same category as Cursor |
| Cody (Sourcegraph) | Listed as IDE-embedded coding assistant | No -- not yet catalogued |
| GitHub Copilot | Listed as IDE-embedded coding assistant | No -- not yet catalogued |
| Zed | IDE with "collaborate with humans" functionality that Huntley wants to invert for LLMs | No -- not yet catalogued |
| Devin | Referenced as potentially onto something with fully autonomous approach (no IDE needed) | [Yes](../../agent-harnesses/devin.md) |

---

## Action Items

- [ ] Compare this 2025-01 thesis with the 2025-06 six-month recap to track how Huntley's multi-boxing practice evolved over 5 months
- [x] ~~Consider ingesting `ghuntley.com/oh-fuck` as the origin piece that triggered this line of thinking~~ -- DONE: [oh-fuck-moment-in-time.md](./oh-fuck-moment-in-time.md)
- [ ] The "agent-first IDE" vision connects to our catalogue entries for Manaflow, AionUi, and the OSS Cowork clones -- worth a cross-reference analysis
