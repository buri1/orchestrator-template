# Simon Willison: Engineering Practices That Make Coding Agents Work

> **Simon Willison — The Pragmatic Summit, 2026-03-14**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=owmJyKVu5f8 |
| Speaker | Simon Willison — independent developer, creator of Datasette, Django co-creator |
| Event | The Pragmatic Summit (hosted by The Pragmatic Engineer / Statsig) |
| Duration | ~45 min (fireside chat with Eric Lui) |
| Date | 2026-03-14 |
| Topics | agentic engineering, TDD, coding agents, red/green TDD, manual testing, prompt injection, sandboxing, code quality |

---

## Burak's Notes

> *This is the definitive talk on how to work WITH coding agents properly. The Red/Green TDD pattern is the single highest-leverage change we can make to our orchestrator workflow — "use red/green TDD" is 5 tokens that transform agent output quality. The conformance-driven development pattern (build test suites across frameworks, use them to drive new implementations) is exactly what we need for cross-project quality. The mental exhaustion point (2 hours max) validates our auto-mode approach — let the system run while humans rest.*

---

## Key Takeaways

1. **"Use red/green TDD" is the highest-leverage 5-token prompt** — It simultaneously validates correctness, prevents unnecessary code, and builds a regression suite. Every coding agent understands this shorthand. Tests are now "effectively free" with agents and therefore non-optional.

2. **Conformance-driven development** — Build test suites across multiple frameworks (Go, Node.js, Django, Starlette), then use those tests to drive new implementations. "Reverse engineer six implementations to get a new standard." This is a powerful pattern for maintaining quality across projects.

3. **Trust progression mirrors team management** — Rather than reviewing every line of AI-generated code, trust AI output the way you'd trust an external service team. Claude Opus 4.5 was the first model earning Willison's confidence for predictable tasks like JSON APIs.

4. **Manual testing via agents is complementary to automated tests** — Code can pass all tests yet still fail in production. Use Playwright, curl, and tools like Showboat to document manual test results. Agents should start dev servers and actually explore the output.

5. **Poor agent code quality is a developer choice, not an inevitability** — Simple refactoring tasks are ideal for coding agents. Use async agents (Gemini Jules, OpenAI Codex, Claude Code) to run refactoring jobs in background branches. "Compound Engineering": document what works, refine instructions, quality compounds over time.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Directly addresses every problem we hit: agent compliance, code quality, testing gates, orchestrator workflow. Simon's patterns ARE the fix for our orchestrator v3. |
| **Actionable** | 10/10 | "Use red/green TDD" can be added to our worker prompts TODAY. Conformance-driven dev, Showboat-style documentation, and manual testing via Playwright are all immediately implementable. |

---

## Summary

Simon Willison's fireside chat at The Pragmatic Summit is a masterclass in professional agentic engineering — the practices that separate "vibe coding" from production-grade AI-assisted development.

The talk describes a progression of AI adoption: from ChatGPT for questions, to coding snippets, to the inflection point where agents write more code than developers. He references StrongDM's "software factory" with principles of "nobody writes code, nobody reads code" — where the developer role shifts to architectural decisions and quality oversight.

The core technical contribution is his Agentic Engineering Patterns guide, a living document with chapters covering: (1) "Writing code is cheap now" — the fundamental cost shift, (2) Red/Green TDD — the single highest-leverage practice, (3) "AI should help us produce better code" — using agents for refactoring and technical debt, (4) Agentic manual testing — using Playwright, curl, and Showboat for verification beyond unit tests, (5) Linear walkthroughs and interactive explanations for understanding code.

On testing specifically: despite historically disliking test-first development, Willison now considers it non-optional when working with agents. The "red/green" framing (watch tests fail, then pass) prevents the common pitfall of writing tests that already pass. He introduced Showboat, a tool that generates markdown documentation of manual tests with `exec` (recording actual command output) and `image` (screenshots) commands.

The safety discussion covers prompt injection (Willison coined the term), the "lethal trifecta" (private data + malicious instructions + exfiltration vectors), and sandboxing as the primary defense. He advocates for Claude Code for web running in Anthropic-managed containers.

On sustainability: working with agents is cognitively demanding — after two hours, mental fatigue sets in. This natural constraint may prevent over-scaling and validates the auto-mode approach of letting systems run autonomously while humans rest.

---

## Notable Quotes

> "Use red/green TDD is the highest-leverage four-word prompt you can give a coding agent — it simultaneously validates correctness, prevents unnecessary code, and builds a regression suite."

> "Poor agent code quality is a developer choice. Refactoring requests can yield superior code than manual development."

> "Tests are now effectively free with agents and therefore non-optional."

> "Nobody writes code, nobody reads code." — referencing StrongDM's software factory approach

> "Trust AI output the way you'd trust an external service team."

> "After two hours, mental fatigue sets in. This constraint may prevent over-scaling."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://simonwillison.net/guides/agentic-engineering-patterns/ | Full guide with all patterns — the canonical reference | `/ingest-article` |
| https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/ | Detailed red/green TDD pattern with examples | `/ingest-article` |
| https://simonwillison.net/guides/agentic-engineering-patterns/agentic-manual-testing/ | Manual testing with Showboat, Playwright, Rodney | `/ingest-article` |
| https://simonwillison.net/guides/agentic-engineering-patterns/better-code/ | Using agents for code quality improvement | `/ingest-article` |
| https://simonwillison.net/2026/Mar/14/pragmatic-summit/ | Companion blog post with full summary | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary coding agent recommended; sandboxing via Claude Code for web | Yes — [everything-claude-code](../../agent-harnesses/everything-claude-code.md) |
| OpenAI Codex | Mentioned as async agent for background refactoring | No — consider `/tool-catalogue` |
| Showboat | Simon's tool for documenting manual test results as markdown | No — consider `/tool-catalogue` |
| Rodney | Simon's Chrome DevTools Protocol tool for browser automation | No — consider `/tool-catalogue` |
| Playwright | Recommended for browser automation testing by agents | No — consider `/tool-catalogue` |
| agent-browser | Vercel's CLI wrapper for coding agents | No — consider `/tool-catalogue` |
| Gemini Jules | Google's async coding agent for background work | No |
| Claude Opus 4.5 | First model Willison trusted for predictable tasks | N/A (model, not tool) |

---

## Action Items

- [x] Add "use red/green TDD" to worker prompt template in `_bmad/worker-claude-md.template.md`
- [ ] Add "first run the tests" pattern to orchestrator review cycle
- [ ] Evaluate Showboat for documenting E2E test results in our orchestrator
- [ ] Implement conformance-driven development for cross-project quality
- [ ] Add Playwright-based manual testing to E2E screenshot workflow
- [ ] Research Rodney as alternative to Chrome DevTools MCP for browser testing
- [ ] Update orchestrator agent to enforce TDD in worker task prompts
