# Ralph Wiggum as a "software engineer"

> **Geoffrey Huntley -- ghuntley.com, 2025-07-14 (updated 2026-02-19)**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/ralph |
| Author | Geoffrey Huntley -- Engineer at Sourcegraph (building Amp), creator of the Ralph Wiggum Loop |
| Publication | ghuntley.com (personal blog) |
| Date | 2025-07-14 (updated 2026-02-19) |
| Topics | agent loops, autonomous coding, back pressure, context engineering, subagent orchestration, specs-driven development |
| Read Time | ~18 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **The Ralph Loop is a deterministic bash `while true` that feeds the same prompt to Claude Code repeatedly** -- Each iteration gets fresh context (solving context rot), but progress persists via git commits, a `fix_plan.md`, and specifications. The technique is "deterministically bad in an undeterministic world" -- faith in eventual consistency is the operating principle.

2. **Back pressure is the entire correctness strategy** -- Type systems, test suites, static analyzers, and build tools serve as the feedback mechanism. Different languages offer different back pressure: Rust's type system is excellent but compilation is slow. The "speed of the wheel turning matters, balanced against the axis of correctness." Dynamically typed languages need extra static analyzers (Dialyzer, Pyrefly).

3. **One task per loop, subagents for parallelism** -- The primary agent acts as a scheduler, spawning subagents for expensive work rather than consuming its own 170K context window. Parallelism must be controlled: allow many subagents for filesystem searches and writes, but restrict validation/build to a single subagent to avoid backpressure conflicts.

4. **Specifications replace prompts as the primary control surface** -- Have extended conversations with the agent about requirements, then have it write specs (one per file) in a specifications folder. The specs ARE the source of truth; if Ralph builds the wrong thing, the specs are wrong. A spec defining a keyword twice for opposing scenarios created "significant waste."

5. **Self-improving agents via AGENT.md and fix_plan.md** -- Ralph updates its own AGENT.md with learned build/run commands and maintains a rolling fix_plan.md as a prioritized TODO list. Future loops inherit these learnings without the reasoning context. Tests should document their own "why" since "future loops will not have the reasoning in their context window."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is the definitive reference for the Ralph Wiggum pattern -- the foundational autonomous agent loop technique that influenced OpenAI Codex, Anthropic's own plugin system, and Steve Yegge's Gas Town. It maps directly to our L-Thread loop architecture. The subagent scheduling model, back pressure hierarchy, and specs-driven approach all validate and extend patterns we already use. |
| **Actionable** | 9/10 | Extremely concrete: includes full production prompts, the complete CURSED building prompt, the planning prompt, specific anti-patterns (placeholder detection, duplicate code from bad ripgrep searches), and exact strategies for context window management. The numbered-priority prompt technique (9999999...) for instruction weighting is immediately adoptable. |

---

## Summary

Geoffrey Huntley's definitive article on the Ralph Wiggum technique lays out the complete methodology for autonomous agent-driven software development using a simple bash `while true` loop feeding prompts to Claude Code. The article walks through Ralph building CURSED, a production-grade esoteric programming language that didn't exist in any LLM's training data -- proving agents can create genuinely novel artifacts, not just reproduce training data.

The core philosophy is "faith in eventual consistency." When Ralph goes wrong, you tune the prompts (like tuning a guitar) rather than blaming the tools. The playground metaphor illustrates this: Ralph starts with no instructions, makes mistakes, and you add signage to guide future iterations. Eventually the accumulated corrections create their own drag and you need a fresh instance.

The article divides the process into two phases: **Generate** (code generation is cheap; control it through stdlib and specifications) and **Back Pressure** (ensuring correctness is hard; use type systems, tests, static analyzers, and build tools as automated feedback). The critical insight is that different programming languages offer different back pressure mechanisms, and the optimal choice balances iteration speed against correctness guarantees.

Huntley provides extensive detail on managing subagent parallelism (many for search, one for build), avoiding placeholder implementations (escalating prompt emphasis including "I WILL YELL AT YOU"), capturing test documentation for future loops, handling broken codebases (git reset vs. rescue prompts), and enabling self-improvement through AGENT.md updates. The article includes his complete production prompts for both the building and planning phases.

The article explicitly states that senior engineering expertise is mandatory -- "anyone claiming engineers are obsolete and tools can do 100% without them is peddling horseshit" -- and that Ralph is strictly for greenfield projects, with an expectation of reaching ~90% completion.

---

## Notable Quotes

> "That's the beauty of Ralph - the technique is deterministically bad in an undeterministic world."

> "Building software with Ralph requires faith and belief in eventual consistency."

> "Ralph has three states. Under baked, baked, or baked with unspecified latent behaviours (which are sometimes quite nice!)"

> "If models and tools remain as they are now, we are in post-AGI territory. All you need are tokens; these models yearn for tokens, so throw them at them, and you have primitives to automate software development if you take the right approaches."

> "There's no way in heck would I use Ralph in an existing code base."

> "DO NOT IMPLEMENT PLACEHOLDER OR SIMPLE IMPLEMENTATIONS. WE WANT FULL IMPLEMENTATIONS. DO IT OR I WILL YELL AT YOU"

> "The speed of the wheel turning matters, balanced against the axis of correctness."

> "Cost of a $50k USD contract, delivered, MVP, tested + reviewed with @ampcode. $297 USD."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now | VentureBeat mainstream coverage of the Ralph technique; likely contains industry perspective and adoption data | `/ingest-article` |
| https://github.com/repomirrorhq/repomirror/blob/main/repomirror.md | YC hackathon report: "We Put a Coding Agent in a While Loop and It Shipped 6 Repos Overnight" -- real validation data | `/ingest-article` |
| https://ghuntley.com/subagents | Huntley's dedicated article on subagent patterns -- "I dream about AI subagents" | `/ingest-article` |
| https://ghuntley.com/stdlib | "You are using Cursor AI incorrectly" -- the stdlib methodology for reusable prompt rules | `/ingest-article` |
| https://ghuntley.com/mirrors | "LLMs are mirrors of operator skill" -- the operator-quality thesis | `/ingest-article` |
| https://ghuntley.com/gutter | "Autoregressive queens of failure" -- failure mode analysis | `/ingest-article` |
| https://pyrefly.org/ | Python type checker recommended as back pressure for dynamically typed agent codebases | DONE -- `code-intelligence/pyrefly.md` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary agent runtime for the Ralph loop | No (not standalone entry) |
| [Amp Code](../agent-harnesses/amp-code.md) | Huntley works at Sourcegraph building Amp; used for $297 contract delivery | Yes -- `agent-harnesses/amp-code.md` |
| LLVM | Compiler backend for the CURSED language Ralph is building | No (infrastructure, not agent tool) |
| Rust | Primary language for CURSED compiler; praised for type system back pressure | No (language, not agent tool) |
| ripgrep | Code search tool; noted as unreliable for agent use (non-deterministic results) | No (utility, not agent tool) |
| Gemini | Used as alternative for processing error files too large for Claude's context | No (model, not tool) |
| Tree-sitter | Parser generator used in CURSED language tooling | No (utility) |
| Dialyzer | Erlang static analyzer recommended as back pressure for dynamic languages | No -- not yet catalogued |
| [Pyrefly](../../code-intelligence/pyrefly.md) | Python type checker recommended as back pressure for dynamic languages | Yes -- `code-intelligence/pyrefly.md` |
| ExUnit | Elixir testing framework; example of documenting test importance | No (test framework) |
| [Gas Town](../orchestration-platforms/gas-town.md) | Steve Yegge's multi-agent extension of the Ralph pattern | Yes -- `orchestration-platforms/gas-town.md` |
| [Geoffrey Huntley](../practitioners/geoffrey-huntley.md) | Author | Yes -- `practitioners/geoffrey-huntley.md` |

---

## Action Items

- [ ] Adopt the numbered-priority prompt technique (9999...) for instruction weighting in agent prompts -- test whether escalating number prefixes actually influence instruction adherence
- [ ] Add "search before implementing" guard to our agent prompts to prevent duplicate code generation (Huntley's anti-pattern for ripgrep non-determinism)
- [ ] Consider adding `fix_plan.md` as a persistent artifact pattern for our agents -- a rolling TODO that survives context resets
- [x] Evaluate Pyrefly as a back pressure tool for any Python-based agent work -- DONE: catalogued at `code-intelligence/pyrefly.md` (7/10 relevance)
- [ ] Test the "document why tests matter" pattern in our E2E testing -- capture test rationale for future agent loops
- [ ] Study the CURSED building prompt structure for our own multi-step agent prompts -- particularly the spec-reference + subagent-control + self-improvement triad
