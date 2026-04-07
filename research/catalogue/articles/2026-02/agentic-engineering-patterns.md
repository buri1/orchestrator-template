# Agentic Engineering Patterns

> **Simon Willison — simonwillison.net, February 2026**

| Field | Value |
|-------|-------|
| Source | [simonwillison.net/guides/agentic-engineering-patterns/](https://simonwillison.net/guides/agentic-engineering-patterns/) |
| Author | Simon Willison — independent developer, creator of Datasette, Django co-creator |
| Publication | Simon Willison's Weblog |
| Date | 2026-02-23 (ongoing, updated through March 2026) |
| Topics | agentic engineering, coding agents, TDD, context engineering, prompt patterns, testing, code understanding, WASM compilation, browser automation |
| Read Time | ~35 min (multi-chapter guide with 10 sections) |

---

## Burak's Notes

> *Simon Willison is one of the most respected voices in the AI-assisted development space (357+ posts tagged ai-assisted-programming). This guide is a practitioner's handbook for working effectively with coding agents like Claude Code and Codex. Multiple patterns directly validate our architecture decisions — especially TDD enforcement (Superpowers pattern), the "code is cheap" economics, and the anti-pattern warnings about unreviewed agent PRs. The "hoard things you know how to do" principle is essentially context engineering for agents. The manual testing chapter (Showboat + Rodney) is directly relevant to our E2E testing gate requirement. The interactive explanation pattern could pay down cognitive debt on our own orchestrator codebase.*

---

## Key Takeaways

1. **Writing code is cheap, but good code is not** — AI agents have made code production near-zero cost, but quality still requires verification, testing, error handling, security, and maintainability. The shift: default to "fire off a prompt anyway" instead of "don't build that, it's not worth the time." Parallel agent sessions multiply the disruption further — one engineer can implement, refactor, test, and document simultaneously.

2. **Good code has 9 quality dimensions** — Willison's explicit framework: (1) works correctly, (2) verified fit for purpose, (3) solves the right problem, (4) graceful error handling, (5) simple and minimal, (6) test coverage against regression, (7) current documentation, (8) future-change-friendly (YAGNI-respecting), (9) quality attributes (accessibility, testability, reliability, security, maintainability, observability, scalability, usability). Agents help with most, but developer burden remains substantial.

3. **Hoard working examples as agent context** — Maintain repositories of solved problems (TILs, blog posts, GitHub repos). Agents amplify this practice massively because "we only ever need to figure out a useful trick once." Feed agents real working code via curl/clone rather than relying on their training data. Four prompting patterns: combining multiple examples, fetching internet-accessible code, searching local repos, and cloning public repos.

4. **Never file PRs with unreviewed agent code** — Filing hundreds/thousands of lines of agent-generated code without personal review delegates responsibility unfairly to colleagues. "They could have prompted an agent themselves. What value are you even providing?" Quality agent PRs require: functional confidence, appropriate scope (many small > one large), contextual documentation, and validated descriptions. Show manual testing notes, implementation choice comments, and screenshots/videos.

5. **Red/green TDD is the highest-leverage agent pattern** — Test-first development mitigates the two biggest agent risks: non-functional code and unnecessary code. The critical step is confirming test failure before implementation. Every good model understands "red/green TDD" as shorthand for the full methodology. Example prompt: "Build a Python function to extract headers from a markdown string. Use red/green TDD."

6. **"First run the tests" — a 4-word prompt that sets the entire session** — Starting agent sessions with this prompt (or "Run 'uv run pytest'" for Python) establishes test awareness, provides project complexity indicators through test count, and creates a testing-oriented mindset for all subsequent work. "Automated tests are no longer optional when working with coding agents."

7. **Manual testing is essential even with passing automated tests** — Tests passing doesn't guarantee functional code. Manual testing catches server crashes, missing UI elements, and uncovered edge cases. Techniques: `python -c` for quick edge case tests, writing demo files to `/tmp`, exercising JSON APIs with `curl`, and browser automation with Playwright/Rodney. The prompt "Run a dev server and explore that new JSON API using curl" — the word "explore" encourages agents to try multiple API aspects comprehensively.

8. **Showboat captures testing workflows as documentation artifacts** — Willison's Showboat tool records agentic manual testing into structured Markdown: `showboat note` for commentary, `showboat exec` for recording commands with actual output (preventing agent fabrication), and `showboat image` for screenshots. The `exec` command is key — it prevents agents from reporting hoped-for results instead of actual ones.

9. **Linear walkthroughs combat cognitive debt from vibe coding** — When agents generate code faster than you can understand it, use them to produce structured codebase explanations. Critical technique: instruct agents to use `grep`/`cat`/`sed` to include real code snippets rather than manually copying (which risks hallucination). "If you are concerned that LLMs might reduce the speed at which you learn new skills I strongly recommend adopting patterns like this one."

10. **Interactive explanations make algorithms observable** — For complex core logic, static walkthroughs may not suffice. Agents can generate animated HTML visualizations that demonstrate algorithms step-by-step with pause/speed/frame controls. Claude Opus 4.6 noted for "quite good taste when it comes to building explanatory animations." Example: animated word cloud placement algorithm where you can watch spiral search, overlap detection, and placement attempts in real time.

11. **Agents excel at trial-and-error compilation tasks** — Complex builds like compiling C to WebAssembly via Emscripten involve inscrutable compiler errors that would make humans give up. Agents can brute-force their way through. "Coding agents are fantastic at trial and error!" Prompting tip: start with filename only in an established repo — agents recognize patterns. Queue follow-up ideas while the agent works.

12. **Human authorship boundary** — Willison maintains a clear line: "anything that expresses opinions or uses 'I' pronouns needs to have been written by me." LLMs handle technical support (proofreading, alt text, documentation updates) but personality-driven content stays human. Artifacts use plain HTML/vanilla JS/CSS — no React — for maximum portability.

---

## Guide Sections

### 1. Writing Code is Cheap Now
**Core thesis:** Coding agents have disrupted software engineering economics at both macro (project planning, feature ROI) and micro (daily refactoring/testing decisions) levels. Code production is now near-free; quality remains expensive. The 9-dimension quality framework (see Key Takeaway #2) defines what separates cheap code from good code. Practical shift: default to firing off an async agent prompt rather than dismissing ideas as "not worth the time." Parallel agent sessions compound the advantage.

### 2. Hoard Things You Know How to Do
**Core thesis:** Build a personal collection of proven solutions and feed them to agents for recombination. Willison's collection infrastructure: blog (simonwillison.net), TIL repo (til.simonwillison.net), 1,000+ GitHub repos, HTML tools collection (tools.simonwillison.net), and research repo (github.com/simonw/research).

**Case study:** Built a browser-based PDF OCR tool by combining two existing working examples — a PDF-to-images converter (PDF.js) and an OCR implementation (Tesseract.js). Full prompt included both code blocks plus natural language instructions. "This worked flawlessly!" — required only a few iterations. Created March 2024, before Claude Code existed.

**Four prompting patterns for leveraging hoarded knowledge:**
1. **Combine examples:** Give agents two+ working code samples and describe the hybrid
2. **Fetch from internet:** "Use curl to fetch the source of [URL1] and [URL2] and build..." (specify curl to avoid tool summarization)
3. **Search local repos:** "Add mocked HTTP tests to ~/dev/project-A inspired by how ~/dev/project-B is doing it"
4. **Clone public repos:** "Clone [repo] from GitHub to /tmp and find examples of [technique], then use that to build..."

### 3. Anti-patterns: Things to Avoid
**Primary anti-pattern:** Filing PRs with unreviewed agent code. "They could have prompted an agent themselves. What value are you even providing?" This wastes reviewer time and signals zero value-add.

**Four qualities of good agentic PRs:**
1. **Functional confidence** — code works and you're confident it works
2. **Appropriate scope** — multiple small PRs beat one large PR; agents handle Git logistics
3. **Contextual documentation** — higher-level goals, relevant issue links, specifications
4. **Validated descriptions** — PR descriptions from agents require personal validation

**Demonstrate thorough work through:** manual testing notes, comments on implementation choices, screenshots/videos showing features in operation.

### 4. Red/Green TDD
**Core thesis:** TDD is the most disciplined approach to ensuring agent code quality. The red/green cycle — confirm test failure, then implement until tests pass — guards against both non-functional code and unnecessary implementations. Skipping the red phase risks tests that already pass, failing to validate new code. As projects expand, comprehensive test suites protect against cascading regressions.

**Practical prompt:** "Build a Python function to extract headers from a markdown string. Use red/green TDD." Every good model understands this shorthand.

### 5. First Run the Tests
**Core thesis:** "Automated tests are no longer optional when working with coding agents." The 4-word prompt "First run the tests" accomplishes multiple objectives simultaneously: forces discovery of the test suite, establishes testing infrastructure awareness, provides project size/complexity signals through test count, primes the agent for testing discipline, and encourages test expansion. For Python specifically: "Run 'uv run pytest'".

Old barriers to testing (time/cost) no longer apply — agents can update test suites in minutes. Tests serve triple duty: verify code works, help agents understand codebases, and influence agents to test their own changes.

### 6. Agentic Manual Testing
**Core thesis:** The defining characteristic of coding agents over standard LLMs is the ability to execute and verify code. Automated tests alone are insufficient — manual testing catches server crashes, missing UI elements, and uncovered edge cases.

**Testing techniques by context:**
- **Python libraries:** `python -c "..."` for quick edge-case testing
- **General pattern:** Write demo files to `/tmp` to avoid accidental commits
- **Web APIs:** Use `curl` to exercise JSON APIs; the word "explore" encourages comprehensive testing
- **Browser automation:** Playwright (most powerful), agent-browser (Vercel's Playwright wrapper for agents), Rodney (Willison's CDP-based tool)

**Rodney prompting technique:** "Start a dev server and then use `uvx rodney --help` to test the new homepage, look at screenshots to confirm the menu is in the right place." Three embedded techniques: (1) `uvx` triggers automatic tool installation, (2) `--help` gives agents complete usage documentation, (3) "look at screenshots" prompts vision capability usage.

**Showboat for documentation:** "Run `uvx showboat --help` and then create a `notes/api-demo.md` showboat document and use it to test and document that new API." Three commands: `note` (Markdown commentary), `exec` (record commands with actual output — prevents fabrication), `image` (screenshots). The `exec` command is critical — it prevents agents from reporting hoped-for results.

**Bug-to-test workflow:** When manual testing reveals issues, instruct agents to fix using red/green TDD, ensuring permanent coverage of discovered cases. Browser automation tests, historically avoided for flakiness, become viable because agents can maintain them through design changes.

### 7. Linear Walkthroughs
**Core thesis:** Agents generate code faster than developers can understand it, creating "cognitive debt." Linear walkthroughs use agents to produce structured codebase explanations that help developers understand, recall, or comprehend code.

**Case study:** Willison vibe-coded a SwiftUI slide presentation app ("Present") with Claude Code + Opus 4.6, then realized he didn't understand his own creation. Solution prompt: "Read the source and then plan a linear walkthrough of the code... use showboat to create a walkthrough.md file... using showboat note for commentary and showboat exec plus sed or grep or cat or whatever you need to include snippets of code you are talking about."

**Critical technique:** Instruct agents to use `sed`/`grep`/`cat` for code snippets rather than manually copying, which "could introduce a risk of hallucinations or mistakes." Claude generated comprehensive documentation walking through six `.swift` files.

**Learning benefit:** "If you are concerned that LLMs might reduce the speed at which you learn new skills I strongly recommend adopting patterns like this one."

**Output:** [github.com/simonw/present/blob/main/walkthrough.md](https://github.com/simonw/present/blob/main/walkthrough.md)

### 8. Interactive Explanations
**Core thesis:** For complex core application logic, static walkthroughs may not provide intuitive understanding. Interactive HTML explanations with animations make algorithms observable and build genuine comprehension.

**Case study:** Claude Code created a Rust word cloud CLI using "Archimedean spiral placement with per-word random angular offset." The technical description didn't convey how the algorithm actually works. Solution: an animated HTML visualization (animated-word-cloud.html) where users can watch placement attempts, overlap detection, and spiral search in real time, with pause/speed/frame-by-frame controls and PNG download.

**Key insight:** "If you watch the animation closely you can see that for each word it attempts to place it somewhere on the page by showing a box, run checks if that box intersects an existing word." Transforms abstract algorithm descriptions into observable behavior.

**Live tool:** [tools.simonwillison.net/animated-word-cloud](https://tools.simonwillison.net/animated-word-cloud)

**Model note:** Claude Opus 4.6 praised for "quite good taste when it comes to building explanatory animations."

### 9. GIF Optimization Tool (Annotated Prompt)
**Core thesis:** Agents excel at trial-and-error compilation tasks that would exhaust human patience. Demonstrates compiling Gifsicle (30-year-old C GIF optimizer by Eddie Kohler) to WebAssembly via Emscripten for a browser-based tool.

**Prompting techniques demonstrated:**
1. **Start with filename only** in established repos — agents recognize patterns
2. **Skip detailed specs** for optional features (drag-drop, etc.) — agents have good taste
3. **Include testing tool commands** (e.g., Rodney) to enable real-time debugging
4. **"Clumsy" phone-typed prompts work** — sufficient intent is enough
5. **Queue follow-up ideas** while agents work

**Build approach:** Clone gifsicle to `/tmp`, reference known commit before patches, include WASM bundle (233KB) in repo for GitHub Pages deployment. Only build scripts and diffs committed, not gifsicle source.

**UI features generated:** Drag-and-drop upload, multiple preview settings with size comparisons, "tweak these settings" buttons linking previews to manual controls, download buttons, sliders for optimization level, lossy compression, colors, color reduction method, scaling, and dithering.

**Live tool:** [tools.simonwillison.net/gif-optimizer](https://tools.simonwillison.net/gif-optimizer)
**Session transcript:** [claude.ai/code/session_01C8JpE3yQpwHfBCFni4ZUc4](https://claude.ai/code/session_01C8JpE3yQpwHfBCFni4ZUc4)

### 10. Prompts I Use (Appendix)
**Artifacts for prototyping:** Willison uses Claude's Artifacts for small HTML tools. Custom instructions enforce plain HTML + vanilla JS/CSS (no React) for portability. Specific conventions: 2-space CSS indentation, `* { box-sizing: border-box; }`, 16px input/textarea font, Helvetica, 2-space JS indentation, `<script type="module">`, sentence case headings.

**Proofreading:** Clear boundary: "anything that expresses opinions or uses 'I' pronouns needs to have been written by me." LLMs update code docs but not opinion/personal content. Proofreading prompt checks: spelling/typos, grammar, repeated terminology, logical/factual errors, weak arguments, empty/placeholder links.

**Alt text generation:** Dedicated prompt generating single-line alt text in fenced code blocks for easy Markdown integration. Includes all visible text in screenshots. Willison prefers Claude Opus for "extremely good taste in alt text" and frequently edits output or provides follow-up refinement prompts.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses engineering patterns for coding agents — our exact domain. TDD enforcement validates Superpowers pattern. PR anti-patterns validate our human review bottleneck research. "Hoard" principle validates context engineering strategy. Manual testing chapter (Showboat/Rodney) directly relevant to our E2E testing gate (Rule #2). Linear walkthroughs applicable for orchestrator onboarding docs. |
| **Actionable** | 9/10 | Every chapter contains immediately usable patterns: TDD prompts, "first run the tests" session opener, Showboat-style documentation, interactive explanation generation, curl-based hoarding, `/tmp` demo file pattern, Rodney `uvx` install trick. Multiple tools referenced are deployable today. |

---

## Summary

Simon Willison's "Agentic Engineering Patterns" is a living guide (published as updatable chapters, not frozen blog posts) documenting professional practices for developers using AI coding agents. Willison explicitly distinguishes this from "vibe coding" — this targets professional software engineers accelerating their work with agents like Claude Code and OpenAI Codex.

The guide is structured into four major sections spanning 10 chapters:

**Principles** (Chapters 1-3) establishes the economic foundation: code production is now cheap, but quality remains expensive across 9 explicit dimensions. The key behavioral shift is to default to "try it" rather than "not worth the time." The "hoard" pattern advocates maintaining personal repositories of working solutions that agents can reference, turning one-time learning into permanent leverage — with four concrete prompting patterns for feeding hoarded knowledge to agents. Anti-patterns warns against filing unreviewed agent PRs and provides a four-quality framework for good agentic PRs.

**Testing and QA** (Chapters 4-6) is the guide's strongest section. Red/green TDD is positioned as the single most effective pattern for agent code quality, compressing sophisticated engineering discipline into minimal prompts. "First run the tests" provides a 4-word session initialization that establishes testing mindset and makes automated tests non-optional. Agentic manual testing covers `python -c` for quick tests, `/tmp` demo files, `curl` for API exploration, and browser automation via Playwright, agent-browser, Rodney (CDP-based), and Showboat (documentation-while-testing). The `exec` command in Showboat is highlighted as critical for preventing agent fabrication of results.

**Understanding Code** (Chapters 7-8) addresses "cognitive debt" — the growing cost of not understanding agent-generated code. Linear walkthroughs use agents to produce structured codebase explanations using real code snippets via grep/cat (not hallucinated copies). Interactive explanations go further: agents generate animated HTML visualizations that demonstrate algorithms step-by-step with pause/speed/frame controls, making abstract descriptions observable.

**Annotated Prompts and Appendix** (Chapters 9-10) provide concrete examples: a GIF optimization tool compiled from C to WebAssembly via Emscripten (demonstrating agents' trial-and-error strength), plus Willison's personal prompt collection for artifacts (no-React HTML tools), proofreading (human authorship boundary), and alt text generation (Opus praised for "extremely good taste").

---

## Notable Quotes

> "Any time our instinct says 'don't build that, it's not worth the time' fire off a prompt anyway, in an asynchronous agent session."

> "Knowing something is theoretically possible is not the same as having seen it done for yourself."

> "We only ever need to figure out a useful trick once."

> "They could have prompted an agent themselves. What value are you even providing?"

> "Never assume that code generated by an LLM works until that code has been executed."

> "Tests are vital for ensuring AI-generated code does what it claims to do. If the code has never been executed it's pure luck if it actually works when deployed to production."

> "Automated tests are no longer optional when working with coding agents."

> "Don't file pull requests with code you haven't reviewed yourself."

> "If you are concerned that LLMs might reduce the speed at which you learn new skills I strongly recommend adopting patterns like this one." (on linear walkthroughs)

> "Coding agents are fantastic at trial and error! They can often brute force their way to a solution where I would have given up after the fifth inscrutable compiler error."

> "Anything that expresses opinions or uses 'I' pronouns needs to have been written by me." (on human authorship boundary)

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/ | Introduction blog post with additional context on the guide's philosophy and Design Patterns inspiration | `/ingest-article` |
| https://github.com/simonw/showboat | Willison's tool for documenting manual testing workflows — agents produce docs while testing. Novel pattern for our E2E testing gate. 14 tagged posts on simonwillison.net. | `/tool-catalogue` |
| https://github.com/simonw/rodney | Chrome DevTools Protocol-based browser automation tool purpose-built for coding agents. 4 tagged posts. | `/tool-catalogue` |
| https://github.com/vercel-labs/agent-browser | Playwright wrapper designed specifically for coding agents (by Vercel Labs) | Already catalogued |
| https://github.com/simonw/present | SwiftUI slide presentation app — the linear walkthrough case study. Contains walkthrough.md demonstrating the pattern. | Low priority |
| https://github.com/simonw/research/tree/main/rust-wordcloud | Rust word cloud project — the interactive explanation case study. Contains walkthrough.md and animated HTML visualization. | Low priority |
| https://tools.simonwillison.net/animated-word-cloud | Live animated word cloud explanation — demonstrates the interactive explanation pattern in action | Low priority |
| https://tools.simonwillison.net/gif-optimizer | Live GIF optimizer — demonstrates WASM compilation pattern and agent trial-and-error | Low priority |
| https://gisthost.github.io/?bfbc338977ceb71e298e4d4d5ac7d63c | Full vibe-coding transcript for the "Present" SwiftUI app | Low priority |
| https://minimaxir.com/2026/02/ai-agent-coding/ | Max Woolf article on AI agent coding — referenced in interactive explanations chapter as inspiration for the word cloud project | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary coding agent referenced throughout the guide | No (it's our primary tool, not catalogued separately) |
| Claude Opus 4.6 | Noted for "good taste" in explanatory animations and alt text | No (model, not tool) |
| OpenAI Codex | Referenced alongside Claude Code as major coding agent | [Yes](../agent-harnesses/openai-codex.md) |
| Playwright | "Most powerful browser automation tool" for agentic manual testing | No — consider `/tool-catalogue` |
| agent-browser | Vercel Labs' Playwright wrapper for coding agents | [Yes](../agent-harnesses/agent-browser.md) |
| Showboat | Willison's tool for documenting testing workflows with `note`, `exec`, `image` commands. `exec` prevents agent fabrication. | Not yet catalogued — consider `/tool-catalogue` |
| Rodney | Willison's CDP-based browser automation CLI with screenshot, JS execution, scrolling, clicking, typing, a11y tree. Install via `uvx`. | Not yet catalogued — consider `/tool-catalogue` |
| Gifsicle | C-based GIF optimizer (30 years old, by Eddie Kohler) compiled to WASM | N/A (not an agent tool) |
| Emscripten | WASM compiler toolchain used in GIF optimization example | N/A (not an agent tool) |
| Tesseract.js | WebAssembly build of Tesseract OCR engine — used in "hoard" case study | N/A (not an agent tool) |
| PDF.js | Mozilla's PDF rendering library — used in "hoard" case study | N/A (not an agent tool) |
| Datasette | Willison's own project, referenced as example of hoarding solutions | N/A (not directly relevant) |
| LICEcap | Screen recording tool for animated GIFs — motivation for GIF optimizer | N/A (not an agent tool) |
| uv/uvx | Python package manager — used for Rodney and Showboat installation | N/A (infrastructure) |

---

## Action Items

- [ ] Adopt "first run the tests" as standard session opener prompt for worker agents
- [ ] Evaluate Showboat for documenting E2E test runs (complements our Chrome DevTools MCP gate) — `showboat exec` prevents result fabrication
- [ ] Evaluate Rodney as lightweight alternative to full Playwright for agent browser automation — `uvx rodney --help` pattern
- [ ] Consider adding Simon Willison as a practitioner entry — 357+ posts on AI-assisted programming, Django co-creator, Datasette creator, highly influential voice
- [ ] Test the "linear walkthrough" pattern on our own orchestrator codebase for onboarding documentation
- [ ] Apply the "interactive explanation" pattern for complex algorithm visualization in agent outputs
- [ ] Implement the "hoard" pattern: maintain a working-examples repo that worker agents can curl/clone for context
- [ ] Test the four hoarding prompt patterns (combine examples, fetch from internet, search local repos, clone public repos)
- [ ] Adopt the `/tmp` demo file pattern for manual testing to avoid accidental commits
- [ ] Add Willison's Artifacts conventions (no-React, plain HTML/vanilla JS) as reference for our HTML tool generation
- [ ] Evaluate the "explore" keyword in API testing prompts — encourages comprehensive agent coverage
