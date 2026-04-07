# Don't Waste Your Back Pressure

> **Geoffrey Huntley (commentary) + Moss (original) -- ghuntley.com / banay.me, January 17, 2026**

| Field | Value |
|-------|-------|
| Source | [https://ghuntley.com/pressure](https://ghuntley.com/pressure) |
| Author | Geoffrey Huntley (commentary) + Moss (original article at banay.me) |
| Publication | ghuntley.com + banay.me |
| Date | 2026-01-17 (modified 2026-02-27) |
| Topics | back pressure, agent feedback loops, type systems, spec-driven development, formal verification, context engineering |
| Read Time | ~6 min (combined: Huntley's commentary + Moss's original) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Back pressure is the key differentiator between toy agent usage and production-grade autonomous work** -- Projects that set up automated feedback (type errors, test failures, lint warnings, build errors, UI rendering diffs) around agents can push them to work on longer-horizon tasks. Without back pressure, humans become the bottleneck manually validating every line of output.

2. **Four concrete back pressure techniques for agent systems** -- (1) Type systems with expressive error messages (Rust, Elm, Python PEP 657) that feed directly into LLM context for self-correction; (2) Visual feedback via MCP servers for Playwright/Chrome DevTools so agents can see rendered UI; (3) Formal verification (proof assistants like Lean) and randomized fuzzing for correctness guarantees; (4) Spec-driven development where agents compare output against OpenAPI schemas or declarative specifications.

3. **Engineering is shifting from writing code to designing back pressure** -- "An increasing part of engineering will involve designing and building back pressure in order to scale the rate at which contributions from agents can be accepted." The engineer's new job is not manual validation but building the automated feedback infrastructure that makes manual validation unnecessary.

4. **Loop until clean, not fix-once** -- The key operational pattern: give agents back pressure mechanisms and let them loop "until they have stamped out all of the inconsistencies and issues." This reframes agent quality from "get it right the first time" to "converge on correct through automated feedback."

5. **LSP servers as universal back pressure for non-UI projects** -- Beyond visual rendering, Language Server Protocol (LSP) based linting servers provide the same feedback loop for backend code, APIs, and infrastructure -- extending the back pressure concept beyond just frontend/UI work.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates and extends our E2E testing gate (Rule #2: Chrome DevTools MCP is mandatory). This article provides the theoretical framework for WHY our deterministic gates work and a taxonomy of WHICH back pressure mechanisms to invest in next. Maps perfectly to our 70/30 deterministic/LLM split -- back pressure IS the deterministic 70%. |
| **Actionable** | 8/10 | Four concrete techniques we can adopt: (1) We already have Chrome DevTools MCP for UI back pressure; (2) Add LSP-based linting servers as MCP tools for non-UI back pressure; (3) Evaluate type-safe language choices for new projects based on compiler error message quality; (4) Formalize spec-driven back pressure where agents compare output against declared specifications. |

---

## Summary

This is a companion piece in Geoffrey Huntley's specs-driven development series (alongside `/specs`, `/stdlib`, `/ralph`, `/loop`). Huntley highlights an article by Moss (banay.me) as "seminal reading for AI context engineering" and adds his own commentary framing back pressure as the central engineering challenge of the agent era.

Moss's original article draws a sharp distinction between two modes of agent work: without back pressure (agents have only file editing tools, humans manually check every line) and with back pressure (agents have build systems, test runners, linters, and visual feedback tools that enable self-correction). The core argument is that if you're spending time telling an agent about syntax errors and missing imports, you're wasting time that should be spent on higher-level architectural thinking.

The article catalogs four specific back pressure techniques: (1) type systems with excellent error messages (Rust, Elm) that create natural LLM feedback loops, (2) visual feedback via MCP servers for Playwright or Chrome DevTools, (3) formal verification using proof assistants like Lean combined with AI, and (4) spec-driven development where agents compare results against OpenAPI schemas or similar specifications. The article also notes that LSP-based linting servers extend back pressure beyond UI to any codebase.

The strategic implication is clear: rather than limiting agents to simple tasks because you don't trust them, invest in higher-quality testing and feedback infrastructure. This investment scales the rate at which agent contributions can be accepted. The closing challenge -- "are you wasting your back pressure?" -- asks whether engineers are spending their time on manual validation (low leverage) rather than building automated feedback systems (high leverage).

Huntley's framing connects this directly to his broader thesis: "software engineering is now about preventing failure scenarios and preventing the wheel from turning over through back pressure to the generative function." This positions back pressure not as a nice-to-have but as THE core engineering discipline of the agent era.

---

## Notable Quotes

> "You might notice a pattern in the most successful applications of agents over the last year. Projects that are able to setup structure around the agent itself, to provide it with automated feedback on quality and correctness, have been able to push them to work on longer horizon tasks."

> "Software engineering is now about preventing failure scenarios and preventing the wheel from turning over through back pressure to the generative function."

> "If you're directly responsible for checking each line of code produced is syntactically valid, then that's time taken away from thinking about the larger goals or problems in your software." -- Moss

> "An increasing part of engineering will involve designing and building back pressure in order to scale the rate at which contributions from agents can be accepted." -- Moss

> "Are you wasting your back pressure?" -- Moss

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://banay.me/dont-waste-your-backpressure/ | Moss's original article -- the primary source Huntley is commenting on (full content captured in this entry) | Already covered in this entry |
| https://ghuntley.com/ralph/ | The Ralph Wiggum Loop -- foundational autonomous agent loop pattern | `/ingest-article` |
| https://ghuntley.com/stdlib/ | The stdlib methodology for reusable prompt libraries | `/ingest-article` |
| https://ghuntley.com/loop/ | "Everything is a Ralph loop" -- philosophical evolution of the pattern | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| MCP Servers (Playwright/Chrome DevTools) | Visual back pressure -- agents render and compare UI output | Yes -- Chrome DevTools MCP used in our E2E testing gate |
| Lean | Proof assistant used with AI for formal verification of agent output | No -- not yet catalogued |
| Aristotle | Formalization tool used with GPT-5.2 Pro to solve Erdos Problems | No -- not yet catalogued |
| Rust | Type system cited as ideal for agent back pressure (excellent error messages) | N/A (language) |
| Elm | Type system cited as ideal for agent back pressure | N/A (language) |
| Python (PEP 657) | Fine-grained error locations improving LLM self-correction | N/A (language feature) |
| OpenAPI | Schema-driven spec back pressure for documentation generation | N/A (standard) |
| LSP (Language Server Protocol) | Linting servers as universal non-UI back pressure mechanism | No -- consider cataloguing LSP-based MCP tools |

---

## Action Items

- [ ] Audit our current back pressure stack against the 4-technique taxonomy (type systems, visual feedback, formal verification, spec-driven)
- [ ] Investigate LSP-based linting MCP servers as additional back pressure for non-UI agent work
- [ ] Consider adding spec-comparison back pressure where agents validate output against declared specifications (beyond just E2E tests)
- [ ] Cross-reference with existing specs-driven-development entry for combined action plan
