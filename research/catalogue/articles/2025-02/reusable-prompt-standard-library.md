# You Are Using Cursor AI Incorrectly... (The Stdlib Method)

> **Geoffrey Huntley -- ghuntley.com, February 2025**

| Field | Value |
|-------|-------|
| Source | [https://ghuntley.com/stdlib](https://ghuntley.com/stdlib) |
| Author | Geoffrey Huntley -- Engineer at Sourcegraph (Amp) / Independent researcher |
| Publication | ghuntley.com |
| Date | 2025-02-09 (modified 2025-08-22) |
| Topics | stdlib methodology, reusable prompts, prompt engineering, context engineering, Cursor AI, agent productivity |
| Read Time | ~10 min (paywalled; reconstructed from public excerpts, practitioner profile, and companion articles) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Build a reusable prompt standard library ("stdlib"), not one-off prompts** -- Huntley's core thesis: instead of writing throwaway prompts for each task, build thousands of composable, reusable prompting rules that work like Unix pipes. Each rule encodes a successful pattern for manufacturing LLM outcomes. This is a compounding investment -- the library improves exponentially over time as you discover and codify what works.

2. **Five anti-patterns that make you "use Cursor incorrectly"** -- (a) Using AI as a Google Search replacement, (b) underspecifying prompts without understanding what drives outcomes, (c) treating Cursor as an IDE rather than an autonomous agent, (d) lacking awareness of how to program LLM outcomes, (e) wasting tokens on unnecessary pleasantries. Each anti-pattern represents a misunderstanding of the tool's nature as an agent, not an assistant.

3. **Stdlib + specs + type-safe languages are multiplicative** -- The stdlib is one leg of a three-part methodology. When combined with specs-driven development (`/specs` method -- declarative specification files organized by topic of concern) and programming languages with compiler soundness (Rust, Elm, Haskell), the result is "entire weeks' worth of co-workers in hours." Each component multiplies the others: stdlib encodes HOW to prompt, specs define WHAT to build, and the type system provides automated verification.

4. **Prompts are a compounding asset, not a consumable** -- The mental model shift: prompts should be treated like code in a standard library. They are versioned, tested, composed, and reused. A well-maintained stdlib of prompting rules is the primary differentiator between effective and ineffective agent operators. The real moat is not the AI tool -- it is the accumulated knowledge of how to drive it encoded as reusable rules.

5. **Context engineering > prompt engineering** -- The stdlib approach reframes "prompt engineering" as "context engineering" -- systematically controlling what information enters the agent's context window, in what format, and in what order. The rules in the stdlib are not just instructions but context-shaping patterns that steer the agent toward correct outputs.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly applicable to our orchestrator architecture. Our `.claude/agents/` and `.claude/commands/` directories are already proto-stdlib patterns. Huntley's methodology validates formalizing these into a composable, versioned library of reusable agent instructions. The concept of prompts-as-compounding-asset aligns with our investment in the knowledge catalogue itself. |
| **Actionable** | 8/10 | Three immediately actionable patterns: (1) Audit existing agent prompts and extract reusable rules into a stdlib directory, (2) Apply the five anti-pattern checklist to improve how we instruct spawned agents, (3) Version and test prompt rules the way we version code. The stdlib concept is the missing formalization layer for our agent spawning patterns. |

---

## Summary

This article is the companion piece to Huntley's `/specs` method (specs-driven development) and the foundational article in his methodology trilogy (stdlib + specs + back pressure). The core argument is that most developers misuse AI coding tools like Cursor by treating them as glorified autocomplete or search engines, rather than as autonomous agents that can be systematically programmed to produce specific outcomes.

Huntley identifies five common anti-patterns: using AI as Google, underspecifying prompts, treating the tool as an IDE rather than an agent, not understanding how to "program" LLM outcomes, and wasting tokens on pleasantries. The solution to all five is the "stdlib" -- a personal or team library of reusable, composable prompting rules that encode successful patterns for driving agent behavior. These rules are not one-off prompts but versioned, tested artifacts that compound in value over time.

The stdlib concept draws explicitly from software engineering's standard library pattern: just as a programming language's stdlib provides battle-tested, composable functions that developers reach for instead of reimplementing from scratch, a prompt stdlib provides battle-tested, composable instruction patterns that agent operators reach for instead of writing ad-hoc prompts. The investment in building and maintaining this library is the highest-leverage activity for anyone working with AI coding tools.

The article positions the stdlib as inseparable from the broader methodology: stdlib (HOW to prompt) + specs (WHAT to build) + back pressure (VERIFICATION that it worked). Without all three, agents produce inconsistent results. With all three, they produce "N-factor output." This methodology has since been validated by industry adoption -- OpenAI's Codex, Anthropic's Claude Code plugin system, and multiple open-source implementations all converge on variations of this pattern.

---

## Notable Quotes

> "You are using the Cursor incorrectly." (the opening thesis, addressing software engineers from entry to principal level)

> "When you use '/specs' method with the 'stdlib' method in conjunction with a programming language that provides compiler soundness, the results are incredible."

> "You can drive hands-free output of N factor (entire weeks' worth) of co-workers in hours."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/specs | Companion article: specs-driven development methodology (the WHAT to stdlib's HOW) | Already ingested: `articles/2025-03/specs-driven-development-groundhog.md` |
| https://ghuntley.com/pressure | Back pressure hierarchy -- the third leg of the methodology (VERIFICATION) | `/ingest-article` |
| https://ghuntley.com/ralph | The original Ralph Wiggum Loop post -- the execution engine that uses stdlib + specs | `/ingest-article` |
| https://ghuntley.com/loop | "Everything is a Ralph loop" -- philosophical evolution of the pattern | `/ingest-article` |
| https://ghuntley.com/ngmi | "NGMI" -- the anti-patterns and failure modes of those who don't adopt these methods | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Cursor | Primary subject -- the AI coding tool most users are "using incorrectly" | Yes -- [cursor.md](../../developer-gui/cursor.md) |
| Claude Code | Referenced as alternative agent runtime compatible with stdlib methodology | No -- not yet catalogued as standalone tool |
| Amp (Sourcegraph) | Huntley is building this; compatible with stdlib approach | Yes -- [amp-code.md](../../agent-harnesses/amp-code.md) |

---

## Action Items

- [ ] Audit our `.claude/agents/` and `.claude/commands/` for reusable patterns that should be extracted into a formalized stdlib
- [ ] Apply Huntley's five anti-pattern checklist to our agent spawning instructions
- [ ] Consider creating a `stdlib/` directory for composable prompt rules (versioned, tested, reusable)
- [ ] Cross-reference with existing [Geoffrey Huntley practitioner profile](../../practitioners/geoffrey-huntley.md) and [specs article](../2025-03/specs-driven-development-groundhog.md) -- this article completes the methodology trilogy
- [ ] Ingest remaining deep dive candidates (`/pressure`, `/ralph`, `/loop`) to have the full Huntley methodology documented
