# Geoffrey Huntley (@GeoffreyHuntley) - AI Agent Practices Deep Dive

**Date:** 2026-03-05
**Subject:** Geoffrey Huntley's approach to AI agents, multi-agent orchestration, and "unhinged" AI practices
**Profile:** Independent software engineer/researcher, ~78K followers, former tech lead for developer productivity at Canva, now engineer at Sourcegraph building Amp

---

## Table of Contents

1. [Core Philosophy & Approach](#1-core-philosophy--approach)
2. [The Ralph Wiggum Loop - His Signature Pattern](#2-the-ralph-wiggum-loop---his-signature-pattern)
3. [Multi-Agent Patterns & Setups](#3-multi-agent-patterns--setups)
4. [Key Blog Posts & Published Content](#4-key-blog-posts--published-content)
5. [Tools & Frameworks](#5-tools--frameworks)
6. [Contrarian / "Unhinged" Takes](#6-contrarian--unhinged-takes)
7. [Context Engineering & Agent Memory](#7-context-engineering--agent-memory)
8. [Agent Reliability & Error Recovery (Back Pressure)](#8-agent-reliability--error-recovery-back-pressure)
9. [OSS Contributions](#9-oss-contributions)
10. [Hidden Gems & Non-Obvious Insights](#10-hidden-gems--non-obvious-insights)
11. [Network & Interactions](#11-network--interactions)
12. [Relevance to L-Thread Orchestrator](#12-relevance-to-l-thread-orchestrator)

---

## 1. Core Philosophy & Approach

### The Central Thesis

Huntley draws a hard line between **software development** (typing code, implementing specs, translating requirements into syntax) and **software engineering** (designing higher-order systems that safely leverage autonomous loops, managing failure scenarios, orchestrating agents).

> "Software development as a profession is effectively dead. Software engineering is more alive -- and critical -- than ever before."

Engineers are no longer writing software -- they are designing systems that write code. The role shifts from crafting code to designing mental models and architectural intuitions that guide AI toward good solutions.

### The Economics Argument

Running Claude Sonnet 4.5 on a bash loop (Ralph) costs **$10.42 USD/hour** -- less than minimum wage. A burger flipper at McDonald's gets paid more. This collapse in unit economics is the forcing function behind everything Huntley advocates.

### Level 9 Vision

Huntley describes a maturity ladder and says he is "going for a level 9 where autonomous loops evolve products and optimise automatically for revenue generation." This is the endgame: self-evolving software that doesn't just build features but optimizes for business outcomes.

### Key Quote

> "It's not that hard to build a coding agent. 300 lines of code running in a loop with LLM tokens. You just keep throwing tokens at the loop, and then you've got yourself an agent."

---

## 2. The Ralph Wiggum Loop - His Signature Pattern

### Origin

Huntley discovered the pattern in **February 2024** and named it after Ralph Wiggum from The Simpsons. It went viral in the **final weeks of 2025**. By late 2025, **Boris Cherny** (Anthropic's Head of Claude Code) formalized it into an official `ralph-wiggum` plugin in the Anthropic Claude Code repository.

### What It Is

Ralph is a deterministic development loop -- a `while true` bash loop that repeatedly feeds the same prompt to an AI coding agent. Each iteration starts with **fresh context** (solving context rot), but progress persists via **git history**, `progress.txt`, and `prd.json`.

### The Three-Phase Architecture

Ralph is a funnel with **3 Phases, 2 Prompts, and 1 Loop**:

1. **PLANNING prompt** -- Does gap analysis (specs vs. code), outputs a prioritized TODO list. No implementation, no commits.
2. **BUILDING prompt** -- Assumes a plan exists, picks tasks from it, implements, runs tests (back pressure), and commits.
3. **Loop** -- A Stop hook intercepts Claude's exit and re-feeds the original prompt. Each iteration sees modified files and git history from previous runs.

### Key Design Principles

- **One item per loop** (emphasis: repeat this restriction)
- **Commits are the agent's memory** -- the next iteration picks up from git history
- **Fresh context per iteration** -- solves the context accumulation / rot problem
- **Naive persistence** -- the LLM isn't protected from its own mess; it's forced to confront failures
- **Non-deterministic self-correction** -- not "is it running?" but "is it done?"

### Proven Results

- Huntley ran a **3-month loop that built a complete programming language**
- YC hackathon teams shipped **6+ repos overnight for $297 in API costs**

### Official Plugin

The Ralph Wiggum technique is now an official Anthropic plugin:
- `github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum`
- `github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop`

---

## 3. Multi-Agent Patterns & Setups

### Subagents Model

From his blog post "I dream about AI subagents; they whisper to me while I'm asleep":

Instead of allocating everything to the main context window and overflowing it, you **spawn a subagent** with its own brand-new context window for doing the meaty work (building, testing, etc.). The parent agent delegates and receives results.

### Roombas Vision

From "I dream of roombas -- thousands of automated AI robots that autonomously maintain codebases":

The vision is fleets of autonomous agents that handle KTLO (Keeping The Lights On) maintenance work -- the unglamorous but essential work of keeping codebases healthy.

### Overnight Autonomous Loops

Huntley has personally run **four headless agents simultaneously** that automated software development, cloning products such as Tailscale, HashiCorp Nomad, and Infisical -- operating while he slept.

### Relationship to Gas Town (Steve Yegge)

Gas Town is the natural multi-agent extension of Ralph. Where Ralph is a single loop in a single repo, Gas Town coordinates **20-30 parallel Claude Code instances** on the same codebase. Key concepts:

- **MEOW (Molecular Expression of Work)** -- tasks defined in such granular steps they can be picked up, executed, and handed off by ephemeral workers
- **Kubernetes-like architecture**: Mayor (interface), Polecats (ephemeral workers), Refinery (merge queue), Witness (health monitoring), Deacon (patrol loops), Dogs (maintenance), Crew (persistent design agents)
- Key difference from K8s: K8s asks "Is it running?" Gas Town asks "Is it done?"

Huntley's work on Ralph directly inspired Gas Town. Yegge mentions he wouldn't have pursued his approach if Huntley hadn't validated the pattern first.

---

## 4. Key Blog Posts & Published Content

All hosted at **ghuntley.com**:

| Post | Key Idea |
|------|----------|
| [Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/) | Original Ralph technique manifesto |
| [Everything is a Ralph loop](https://ghuntley.com/loop/) | The universal applicability of the loop pattern |
| [Don't waste your back pressure](https://ghuntley.com/pressure/) | Back pressure as the key to agent reliability |
| [Autoregressive queens of failure](https://ghuntley.com/gutter/) | Context rot, "redlining," and when to kill a context window |
| [I dream about AI subagents](https://ghuntley.com/subagents/) | Subagent spawning for context isolation |
| [I dream of roombas](https://ghuntley.com/ktlo/) | Autonomous KTLO maintenance agents |
| [You are using Cursor AI incorrectly](https://ghuntley.com/stdlib/) | The stdlib methodology for AI tools |
| [From Design doc to code](https://ghuntley.com/specs/) | Specs-driven development with AI |
| [Software development costs less than minimum wage](https://ghuntley.com/real/) | The economics collapse argument |
| [The future belongs to people who can just do things](https://ghuntley.com/dothings/) | Agency and action over credentials |
| [Teleporting into the future](https://ghuntley.com/teleport/) | AI lets you build your "someday" projects now |
| [How to build a coding agent (workshop)](https://ghuntley.com/agent/) | Free hands-on agent-building workshop |
| [Six-month recap (Web Directions)](https://ghuntley.com/six-month-recap/) | Conference closing talk recap |
| [Anti-patterns for secure codegen](https://ghuntley.com/secure-codegen/) | Security in AI-generated code |
| [What is the point of libraries now?](https://ghuntley.com/libraries/) | If you can generate it, why import it? |
| [Deliberate intentional practice](https://ghuntley.com/play/) | Building skill with AI deliberately |
| [Dear Student: you're screwed unless you take action](https://ghuntley.com/screwed/) | Advice for students entering the field |

### Podcast Appearances

- **Dev Interrupted** (LinearB): "Inventing the Ralph Wiggum Loop" -- deep dive into the technique and philosophy

### Conference Talks

- **Web Directions Code 25** (Melbourne, June 2025): Closing talk on AI's impact on software engineering

---

## 5. Tools & Frameworks

### Tools He Uses / Recommends

| Tool | Role |
|------|------|
| **Amp** (Sourcegraph) | Agentic coding tool (he builds it); CLI + VS Code extension |
| **Claude Code** (Anthropic) | Primary agent runtime, especially with Ralph plugin |
| **Cursor** | IDE-as-agent with stdlib approach |
| **Windsurf** | Alternative agentic IDE |
| **Bash loops** | The actual runtime for Ralph (literally `while true`) |
| **Git** | Agent memory system -- commits are the persistence layer |
| **Chrome DevTools MCP / Playwright** | Visual back pressure -- agents verify rendered UI |

### The stdlib Methodology

From "You are using Cursor AI incorrectly":

Instead of one-off prompts, build a **standard library of reusable rules** (thousands of them) that compose like Unix pipes. The approach involves:

- Building prompting rules that teach the AI your exact preferences
- Composing rules together for complex tasks
- Programming the AI's behavior instead of fighting it
- Creating an exponentially improving personal coding assistant

### The /specs Method

Combine the stdlib approach with **specs-driven development** -- design documents that the AI implements:

> "When you use /specs method with the stdlib method in conjunction with a programming language that provides compiler soundness (driven by good types) and compiler errors, the results are incredible. You can drive hands-free output of entire weeks' worth of co-workers in hours."

---

## 6. Contrarian / "Unhinged" Takes

### Take 1: "Software Development is Dead"

Not hedged, not qualified. He says the profession of writing code by hand is dead, and that anyone not exploring AI-assisted development by now won't keep up. Developing skills with AI agents is expected as a **bare minimum** by employers in 2026.

### Take 2: "Artisanal Hand-Crafted Commits" Are Over

> "I seriously can't see a path forward where the majority of software engineers are doing artisanal hand-crafted commits by as soon as the end of 2026."

### Take 3: Naive Persistence > Sophistication

The power of the original Ralph was in its **naive persistence** -- unsanitized feedback where the LLM isn't protected from its own mess. If you press the model hard enough against its own failures without a safety net, it will eventually "dream" a correct solution just to escape the loop. This is deliberately **anti-sophisticated**.

### Take 4: IDEs Are File Explorers Now

> "These days, I primarily use IDEs as file explorer tools and rarely use the IDE except to craft and maintain my prompt library."

### Take 5: Libraries May Be Pointless

If you can generate code on demand, what is the point of importing libraries? This challenges one of the most fundamental assumptions in software engineering.

### Take 6: 40 Years of Best Practices Are Outdated

> "Forty years of best practices are now outdated and the patterns relied on, team structures built, and processes followed all need to be reconsidered."

### Take 7: Teleport to the Future

AI lets you build your retirement projects right now. Anything you've been putting off to "someday" -- just generate it.

---

## 7. Context Engineering & Agent Memory

### Context as Memory Allocation

Huntley reframes the LLM context window using systems programming metaphors:

- **Reading files, tool outputs, conversation history = `malloc()`**
- **There is no `free()`** -- you can't selectively release context
- This is **"the malloc/free problem"** in LLM context management

The solution: treat context windows as **disposable**. Use one context window for one task. When it's polluted, kill it and start fresh.

### The Bowling Analogy (from "Autoregressive Queens of Failure")

> "If your coding agent is misbehaving, it's time to create a new context window. If the bowling ball is in the gutter, there's no saving it."

### The Redlining Analogy

Pushing too much into a context window is like audio engineers "pushing signals into the red" -- the result is clipped, muddy output. Don't overload the context; respect its limits.

### Memory Persistence Strategy

Memory does NOT persist in the LLM context window. Instead:

- **Git commits** are the agent's memory
- **progress.txt** tracks loop state
- **prd.json** defines remaining work
- Each iteration starts fresh but inherits the file system and git history

### Context Engineering vs Prompt Engineering

> "Prompt engineering was about cleverly phrasing a question; context engineering is about constructing an entire information environment so the AI can solve the problem reliably."

---

## 8. Agent Reliability & Error Recovery (Back Pressure)

### Back Pressure: The Core Concept

> "Back pressure consists of constraints and feedback mechanisms allowing autonomous loops to operate safely at scale. The more back pressure you capture, the more autonomy you can grant."

This is perhaps Huntley's most actionable insight. Back pressure is the bridge between "agent that hallucinates" and "agent that ships production code."

### Practical Back Pressure Sources

| Source | Mechanism |
|--------|-----------|
| **Build systems** | Agent runs build, reads errors, self-corrects |
| **Type systems** | Compiler errors feed directly back into the LLM as guidance. Languages with excellent error messages (Rust, Elm) work best |
| **Test suites** | Failing tests apply pressure to the generative loop. Companies with robust test coverage adopt AI faster |
| **Linters** | Automated style/quality enforcement |
| **UI verification** | Agents see rendered pages via MCP servers for Playwright or Chrome DevTools, comparing expectations against results |
| **Git history** | Previous iterations' commits provide implicit guidance |

### Key Insight on Back Pressure

> "Projects that set up structure around the agent itself, to provide it with automated feedback on quality and correctness, have been able to push them to work on longer horizon tasks."

### Error Recovery Pattern

The Ralph loop IS the error recovery pattern. Errors are not caught and handled -- they are **fed back into the next iteration**. The agent confronts its own failures in a fresh context and must resolve them to progress. This is fundamentally different from try/catch error handling -- it's **error-as-input**.

---

## 9. OSS Contributions

### Direct Contributions

| Project | Description |
|---------|-------------|
| [how-to-ralph-wiggum](https://github.com/ghuntley/how-to-ralph-wiggum) | The Ralph Wiggum Technique methodology and implementation |
| [how-to-build-a-coding-agent](https://github.com/ghuntley/how-to-build-a-coding-agent) | Free workshop: build your own coding agent from scratch (like Roo, Cline, Amp, Cursor) |
| [loom](https://github.com/ghuntley/loom) | Infrastructure for evolutionary software (experimental, explicitly warns others not to use it) |
| **Amp** (Sourcegraph) | Engineer on the team building Amp, the Sourcegraph agentic coding tool |
| **Ralph Wiggum plugin** (Anthropic) | His technique was formalized into official Anthropic Claude Code plugins |

### Prior Track Record

Software Huntley maintained has shipped inside Microsoft Visual Studio, GitHub, Atlassian Sourcetree, Amazon Drive, Halo, Slack -- installed by developers **21 million times**.

### Loom: The Experimental Frontier

Loom is described as "infrastructure for evolutionary software" -- essentially self-evolutionary software designed for robots rather than humans, which aims to automate software deployment without code review. Huntley says it's been "in his head for three years."

He is explicit about Loom's status:
> "If your name is not Geoffrey Huntley then do not use Loom."

He wants people to study it to understand **failure modes**, not to use it directly.

---

## 10. Hidden Gems & Non-Obvious Insights

### Gem 1: One Task Per Context Window

The single most actionable takeaway. Don't try to do multiple things in one session. Context rot is real, it's the gutter ball, and there's no saving it. Kill the context and start fresh.

### Gem 2: Compiler Errors as First-Class Agent Feedback

Languages with excellent error messages (Rust, Elm, Haskell) are dramatically better for agentic development because their compiler output functions as high-quality back pressure. Choose your language stack with agent-friendliness in mind.

### Gem 3: The stdlib Compounds Exponentially

Building a personal library of thousands of reusable prompting rules creates an exponentially improving system. This is not a one-off productivity hack; it's a compounding investment.

### Gem 4: Specs + Types + stdlib = Hands-Free Development

The combination of:
1. Detailed specifications (/specs)
2. Type-safe languages with good error messages
3. A rich stdlib of prompting rules

...produces results that Huntley claims equal "entire weeks' worth of co-workers in hours."

### Gem 5: Agents Are Just 300-500 Lines of Code

Demystification: every agentic coding tool (Cursor, Windsurf, Claude Code, Amp, Cline) is fundamentally "a small number of lines of code running in a loop of LLM tokens." Understanding this lets you build your own and recognize what vendors are actually selling.

### Gem 6: Context Window = Array Allocation

Don't think "tokens." Think **array allocation and memory management**. This mental model from systems programming makes LLM behavior much more predictable and manageable.

### Gem 7: Study Failure Modes, Not Just Success Patterns

His explicit advice about Loom: study it for failure modes, not to replicate it. Understanding where agents fail is more valuable than copying where they succeed.

### Gem 8: "If the bowling ball is in the gutter, there's no saving it"

Don't try to rescue a derailed agent session. Start fresh. The cost of a new context window is trivial compared to the cost of fighting a polluted one.

---

## 11. Network & Interactions

### Key Figures in His Orbit

| Person | Relationship |
|--------|-------------|
| **Steve Yegge** | Gas Town creator; mutual influence with Huntley. Yegge built the multi-agent extension of Ralph's single-agent pattern |
| **Boris Cherny** | Anthropic's Head of Claude Code; formalized Ralph into an official plugin |
| **Tanner Hodges** | Wrote "Geoff Huntley has me shook" -- representative of the community reaction to his ideas |
| **LinearB / Dev Interrupted** | Featured him on podcast and blog for the Ralph loop deep dive |
| **Maggie Appleton** | Wrote analysis of Gas Town's agent patterns and design bottlenecks |

### Community Impact

- The Ralph technique spawned an **entire ecosystem**: awesome-ralph lists, third-party implementations for Cursor, Copilot, Vercel's AI SDK, and Block's Goose
- A **$RALPH memecoin** was created by the community
- A **$GAS token** emerged around Gas Town, with both Huntley and Yegge navigating the crypto community's enthusiasm
- VentureBeat covered Ralph going from The Simpsons to "the biggest name in AI right now"
- The Register covered it as "Ralph Wiggum loop prompts Claude to vibe-clone software"

### Professional Background

- Former tech lead for developer productivity at **Canva**
- Currently engineer at **Sourcegraph** building **Amp**
- Based in Australia, speaks at Australian conferences (Web Directions Melbourne)

---

## 12. Relevance to L-Thread Orchestrator

### Alignment Points

| Huntley Concept | L-Thread Equivalent |
|----------------|---------------------|
| One task per context window | Mode-aware agents with isolated contexts |
| Back pressure (build/test/lint) | E2E testing as gate (Chrome DevTools MCP) |
| Git as agent memory | State files (orchestrator-state.json, tmux-state.json) |
| Fresh context per iteration | Agent spawning with clean context |
| Subagent spawning | Conduit pane-split / Teams Task tool |
| MEOW (granular task units) | Issue-level agent delegation |
| Specs-driven development | PRD/spec-first planning before agent execution |

### Key Differences

| Aspect | Huntley/Ralph | L-Thread Orchestrator |
|--------|--------------|----------------------|
| Orchestrator role | Minimal -- bash loop IS the orchestrator | Rich orchestrator persona with rules and state management |
| Agent count | Typically single agent per loop | Multi-agent with parallel coordination |
| State persistence | Git + flat files | JSON state files + tmux sessions |
| Error handling | Feed errors back into next iteration | Roadblock recovery commands |
| Coordination | Single-agent; Gas Town for multi | Native conduit/teams modes |

### Lessons to Adopt

1. **Back pressure is king** -- Huntley's hierarchy (types > tests > linters > build errors > UI verification) is directly applicable
2. **Kill polluted contexts early** -- Don't try to salvage a derailed agent; spawn a new one
3. **Specs-first always** -- The /specs + stdlib combo is the highest-leverage approach
4. **Memory via artifacts, not context** -- Git, state files, and progress trackers are the right persistence layer
5. **Respect the malloc/free problem** -- Context windows are finite; manage them like memory

---

## Sources

- [Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/)
- [Everything is a Ralph loop](https://ghuntley.com/loop/)
- [Don't waste your back pressure](https://ghuntley.com/pressure/)
- [Autoregressive queens of failure](https://ghuntley.com/gutter/)
- [I dream about AI subagents](https://ghuntley.com/subagents/)
- [I dream of roombas](https://ghuntley.com/ktlo/)
- [You are using Cursor AI incorrectly (stdlib)](https://ghuntley.com/stdlib/)
- [From Design doc to code (specs)](https://ghuntley.com/specs/)
- [Software development costs less than minimum wage](https://ghuntley.com/real/)
- [The future belongs to people who can just do things](https://ghuntley.com/dothings/)
- [Teleporting into the future](https://ghuntley.com/teleport/)
- [How to build a coding agent (workshop)](https://ghuntley.com/agent/)
- [Six-month recap (Web Directions)](https://ghuntley.com/six-month-recap/)
- [AI tag - all AI posts](https://ghuntley.com/tag/ai/)
- [How to Ralph Wiggum (GitHub)](https://github.com/ghuntley/how-to-ralph-wiggum)
- [How to build a coding agent (GitHub)](https://github.com/ghuntley/how-to-build-a-coding-agent)
- [Loom (GitHub)](https://github.com/ghuntley/loom)
- [Anthropic Claude Code Ralph Wiggum Plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- [Inventing the Ralph Wiggum Loop - Dev Interrupted Podcast](https://devinterrupted.substack.com/p/inventing-the-ralph-wiggum-loop-creator)
- [Mastering Ralph Loops - LinearB Blog](https://linearb.io/blog/ralph-loop-agentic-engineering-geoffrey-huntley)
- [Gas Town - Cloud Native Now](https://cloudnativenow.com/features/gas-town-what-kubernetes-for-ai-coding-agents-actually-looks-like/)
- [Gas Town's Agent Patterns - Maggie Appleton](https://maggieappleton.com/gastown)
- [Gas Town (GitHub - Steve Yegge)](https://github.com/steveyegge/gastown)
- [Ralph Wiggum from Simpsons to AI - VentureBeat](https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now/)
- [Ralph Wiggum loop - The Register](https://www.theregister.com/2026/01/27/ralph_wiggum_claude_loops/)
- [Brief History of Ralph - HumanLayer](https://www.humanlayer.dev/blog/brief-history-of-ralph)
- [AI Giants: Geoffrey Huntley - Codacy](https://www.codacy.com/ai-giants/geoffrey-huntley)
- [Geoff Huntley has me shook - Tanner Hodges](https://tannerhodges.com/blog/geoff-huntley-has-me-shook/)
- [Ralph Wiggum AI Agents: The Coding Loop of 2026 - Leanware](https://www.leanware.co/insights/ralph-wiggum-ai-coding)
