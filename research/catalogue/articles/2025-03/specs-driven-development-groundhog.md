# From Design Doc to Code: The Groundhog AI Coding Assistant (and New Cursor Vibecoding Meta)

> **Geoffrey Huntley -- ghuntley.com, March 3, 2025**

| Field | Value |
|-------|-------|
| Source | [https://ghuntley.com/specs/](https://ghuntley.com/specs/) |
| Author | Geoffrey Huntley -- Engineer at Sourcegraph (Amp) / Independent researcher |
| Publication | ghuntley.com |
| Date | 2025-03-03 |
| Topics | specs-driven development, agent review loops, stdlib methodology, back pressure, Ralph Wiggum loop, context engineering |
| Read Time | ~15 min (paywalled; reconstructed from public excerpts, GitHub repos, and related posts) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Specs-first + stdlib + type-safe languages = multiplicative output** -- Huntley's core thesis: when you combine declarative specification files (`specs/FILENAME.md`) with a reusable prompt library ("stdlib") and a language with compiler soundness (Rust, Elm, Haskell), agents produce "entire weeks' worth of co-workers in hours." The specs define WHAT, the stdlib encodes HOW to prompt, and the type system provides automated verification. All three together create an agent feedback loop that converges on correct code faster than any single technique alone.

2. **The Ralph Wiggum Loop is the agent-to-agent review pattern OpenAI adopted** -- The simple `while true` bash loop that feeds specs to an agent, has it plan/build/test/commit one task per iteration, then exits for fresh context, has become the de facto standard. OpenAI's Codex now instructs agents to review their own changes locally, request additional agent reviews, respond to feedback, and iterate until all agent reviewers are satisfied -- effectively a Ralph loop. Anthropic formalized it as an official Claude Code plugin. The pattern is now platform-agnostic (works with Claude Code, Codex, Amp, OpenCode, Copilot).

3. **Specifications as the control surface for autonomous agents** -- Instead of giving agents imperative instructions ("build X"), you give them declarative specifications organized by topic of concern. The agent performs gap analysis (specs vs. current code), generates an IMPLEMENTATION_PLAN.md, and picks tasks from the plan. Each spec file answers one topic describable in a single sentence without "and." This separation of specification from implementation is the key insight that enables long-running autonomous loops.

4. **Back pressure is the deterministic enforcement layer** -- Types > tests > linters > build errors > UI verification > git history. This hierarchy determines how much autonomy you can safely grant. Without back pressure, agents hallucinate and drift. With it, they self-correct. The insight that "if you aren't capturing your back-pressure then you are failing" directly validates the 70/30 deterministic/LLM split.

5. **Context windows are memory allocation with no free()** -- Reading files into context is `malloc()` with no garbage collector. One task per context window achieves 100% "smart-zone" utilization. When context is polluted, kill it and spawn fresh -- "if the bowling ball is in the gutter, there's no saving it." This reframes agent lifecycle management as systems programming.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly validates our orchestrator architecture: specs-first planning, deterministic gates (E2E testing), fresh context per agent task, git-as-memory. The agent-to-agent review loop pattern is the missing piece we should adopt. The stdlib concept suggests we should formalize our reusable prompt patterns into a composable library. |
| **Actionable** | 8/10 | Three immediately actionable patterns: (1) Organize agent task specs as `specs/TOPIC.md` files with one-sentence scope, (2) Build a stdlib of reusable prompt rules that compound over time, (3) Implement agent-to-agent review where a second agent reviews the first's output before marking done. |

---

## Summary

This article (and its companion posts on `/stdlib`, `/ralph`, `/loop`, `/pressure`) lays out Geoffrey Huntley's complete methodology for autonomous software development using AI agents. The core innovation is the `/specs` method: instead of giving agents vague instructions, you create declarative specification files organized by "topic of concern" (each describable in one sentence without "and"). These specs become the control surface for the Ralph Wiggum Loop -- a simple bash loop that repeatedly feeds the agent its specifications and lets it perform gap analysis, plan tasks, implement one task per iteration, validate against back pressure (types, tests, linters, builds, UI), commit, and exit for fresh context.

The methodology has three layers that multiply each other: (1) The **specs** define what needs to be built in a format agents can compare against code, (2) The **stdlib** is a library of reusable prompting rules that encode successful patterns for manufacturing LLM outcomes (not one-off prompts but a compounding investment), and (3) **Back pressure** from type-safe languages provides automated verification that closes the feedback loop without human intervention. Huntley claims this combination enables "N-factor output" -- weeks of human developer work in hours.

The article is notable because this pattern has been adopted industry-wide. OpenAI's Codex now implements what is effectively a Ralph loop: agents review their own changes, request additional agent reviews, respond to feedback, and iterate until all reviewers are satisfied. Anthropic formalized it as an official Claude Code plugin. The Ralph Wiggum technique went viral in late 2025, spawned multiple open-source implementations (for Claude Code, Codex, Amp, OpenCode, Copilot), and Huntley himself demonstrated it by running a 3-month continuous loop that built a complete programming language ("Cursed lang") through C, Rust, and Zig implementations.

The deepest insight is that agents are "just 300-500 lines of code in a loop" -- every agentic coding tool is fundamentally a small program running in a loop of LLM tokens. The differentiation is not the tool itself but the specs, the stdlib, and the back pressure stack you wrap around it. Software development (writing code by hand) is dead; software engineering (designing systems that write code) is more alive than ever.

---

## Notable Quotes

> "When you use '/specs' method with the 'stdlib' method in conjunction with a programming language that provides compiler soundness (driven by good types) and compiler errors, the results are incredible."

> "You can drive hands-free output of N factor (entire weeks' worth) of co-workers in hours."

> "If you aren't capturing your back-pressure then you are failing."

> "If the bowling ball is in the gutter, there's no saving it." (on killing polluted context windows)

> "Software is now clay on the pottery wheel." (on iterative agent loops replacing linear development)

> "Code is cheap -- the easier alternative to merge/rebase is re-running ralph on fresh code."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/ralph/ | The original Ralph Wiggum post -- foundational methodology that spawned the entire pattern | `/ingest-article` |
| https://ghuntley.com/stdlib/ | The companion stdlib methodology -- reusable prompt library that compounds over time | `/ingest-article` |
| https://ghuntley.com/pressure/ | Back pressure hierarchy for agent reliability -- directly maps to our deterministic gates | Already ingested: `articles/2026-01/dont-waste-your-back-pressure.md` |
| https://ghuntley.com/loop/ | "Everything is a Ralph loop" -- the philosophical evolution of the pattern | `/ingest-article` |
| https://openai.com/index/unrolling-the-codex-agent-loop/ | OpenAI's official documentation of their agent loop -- shows how Ralph was adopted | `/ingest-article` |
| https://openai.com/index/harness-engineering/ | Ryan Lopopolo's harness engineering post -- 0 hand-written lines, 1M LOC via agents | Already ingested: `articles/2026-02/harness-engineering-codex-agent-centric-world.md` |
| https://github.com/ghuntley/how-to-ralph-wiggum | Complete playbook for the Ralph technique | `/tool-catalogue` |
| https://www.humanlayer.dev/blog/brief-history-of-ralph | HumanLayer's history of Ralph with adoption timeline and lessons learned | `/ingest-article` |
| https://github.com/ghuntley/groundhog | Groundhog -- teaches how coding agents work from first principles | `/tool-catalogue` |
| https://marmelab.com/blog/2025/11/12/spec-driven-development-waterfall-strikes-back.html | Third-party analysis of spec-driven development as a pattern | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Cursor | IDE used with /specs + /stdlib methodology | Yes -- [cursor.md](../../developer-gui/cursor.md) |
| Claude Code | Primary runtime for Ralph loops | No -- not yet catalogued as standalone tool |
| Amp (Sourcegraph) | Huntley is building this; used in Ralph loops | Yes -- [amp-code.md](../../agent-harnesses/amp-code.md) |
| OpenAI Codex | Adopted Ralph loop pattern for agent-to-agent review | Yes -- [openai-codex.md](../../agent-harnesses/openai-codex.md) |
| Groundhog | Teaching tool for understanding coding agents from first principles | Not yet catalogued -- consider `/tool-catalogue` |
| how-to-ralph-wiggum | Official Ralph playbook repository | Not yet catalogued -- consider `/tool-catalogue` |
| Ralph Wiggum Plugin | Official Anthropic Claude Code plugin | Not yet catalogued |
| Loom | Experimental self-evolutionary software infrastructure | Not yet catalogued |
| Cursed Lang | Programming language built by 3-month Ralph loop (C -> Rust -> Zig) | Not yet catalogued |
| Goose (Block) | Ralph loop tutorial in their docs | Yes -- [goose.md](../../agent-harnesses/goose.md) |

---

## Action Items

- [ ] Formalize our reusable prompt patterns into a stdlib-style composable library
- [ ] Adopt `specs/TOPIC.md` file organization for agent task specifications (one topic of concern per file)
- [ ] Implement agent-to-agent review loop: second agent reviews first agent's output before marking task done
- [ ] Evaluate the Ralph Wiggum Plugin for Claude Code as a potential integration point
- [ ] Study the Groundhog repo for first-principles understanding of coding agent internals
- [ ] Consider adding back pressure hierarchy ordering to our agent spawning rules (types > tests > linters > build > UI > git)
