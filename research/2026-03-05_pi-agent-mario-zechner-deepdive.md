# Pi Agent Deep Dive: Mario Zechner (@badlogicgames) & Ecosystem

**Date:** 2026-03-05
**Research Type:** Deep Research
**Subject:** Pi Coding Agent, Mario Zechner, @nicopreme, Pi Agent community

---

## 1. Mario Zechner's Background and Pi Agent Origin Story

Mario Zechner ([@badlogicgames](https://x.com/badlogicgames)) is best known as the creator of **libGDX**, the popular open-source Java game development framework. He pivoted hard into AI coding agents in late 2025.

**The frustration that birthed Pi:** Zechner tracked the evolution of AI-assisted coding from ChatGPT through Cursor to newer harnesses like Claude Code. He preferred Claude Code for most of his work, but over time it became overly complex -- "80% of functionality he had no use for" -- and the system prompt and tools changed on every release, breaking his workflows. This frustration led him to build Pi.

**Core blog post:** ["What I learned building an opinionated and minimal coding agent"](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/) (Nov 30, 2025) -- this is the Pi manifesto and remains the most important single document for understanding Pi's philosophy.

**Year in Review 2025:** [mariozechner.at/posts/2025-12-22-year-in-review-2025/](https://mariozechner.at/posts/2025-12-22-year-in-review-2025/)

---

## 2. Pi Agent Architecture

### 2.1 The Four Tools Philosophy

Pi ships with exactly **4 tools**: `read`, `write`, `edit`, `bash`.

The system prompt is under 1,000 tokens. The entire system prompt is essentially:

> "You are Pi, a coding assistant. You help users write, debug, and understand code. You have access to these tools: read (read files and images), write (create/overwrite files), edit (make surgical edits to files), bash (run shell commands). Work directly in the user's project. Read files to understand context before making changes."

Mario's argument: "All frontier models have been RL-trained up the wazoo, so they inherently understand what a coding agent is." Adding specialized tools (like a "search in codebase" tool) just adds tokens to the system prompt without adding capability. If you need ripgrep, run `rg` via bash. If you need GitHub, use `gh` via bash. The model can read documentation and figure out CLI tools.

### 2.2 Monorepo Package Architecture

Pi lives in [badlogic/pi-mono](https://github.com/badlogic/pi-mono), a TypeScript monorepo using npm workspaces with lockstep versioning. Packages layer on top of each other:

| Package | npm | Purpose |
|---------|-----|---------|
| **pi-ai** | `@mariozechner/pi-ai` | Unified multi-provider LLM API (Anthropic, OpenAI, Google, xAI, Groq, Cerebras, OpenRouter, any OpenAI-compatible endpoint). Streaming, tool calling with TypeBox schemas, thinking/reasoning support, cross-provider context handoffs, token and cost tracking. |
| **pi-agent-core** | `@mariozechner/pi-agent-core` | Agent runtime with tool calling, state management, and the agent loop. |
| **pi-coding-agent** | `@mariozechner/pi-coding-agent` | Full coding agent CLI with built-in tools, session persistence, extensibility. The user-facing product. |
| **pi-tui** | `@mariozechner/pi-tui` | Terminal UI library with differential rendering (described as "gold-standard for differential rendering in terminals"). |
| **pi-web-ui** | `@mariozechner/pi-web-ui` | Web components for AI chat interfaces. |

**Latest version:** 0.56.1 (as of March 2026).

### 2.3 LLM Abstraction Layer (pi-ai)

Rather than building provider-specific adapters, Mario identified that every provider speaks one of **four wire protocols**. Pi normalizes around these four protocols and maintains a model catalogue of **300+ definitions** auto-generated at build time from models.dev and OpenRouter metadata.

Key features:
- **Cross-provider context handoffs:** Designed from the start to maintain context across different providers. Each provider has their own way of tracking tool calls and thinking traces; pi-ai handles the translation.
- **Token and cost tracking:** Built-in at the pi-ai layer. However, providers report tokens inconsistently (some at SSE stream start, some at end), making accurate cost tracking of aborted requests impossible.
- **Tool implementation:** Tools can return both content blocks for the LLM and separate content blocks for UI rendering. Tools can also return attachments like images that get attached in the native format of the respective provider.

### 2.4 Safety Philosophy

Pi operates in **"YOLO by default"** mode -- no permissions, no sandbox. This is a direct contrast to Claude Code's deny-first permissions with 5 modes, filesystem sandbox, and Haiku pre-screening of commands. Mario sees the permission system as friction that slows down experienced developers.

---

## 3. Extension System

### 3.1 Extension Architecture

Extensions are TypeScript/JavaScript modules that enhance Pi functionality. They were previously called "hooks" or "custom tools" before being [unified into a single system](https://github.com/badlogic/pi-mono/issues/326).

**Extension capabilities:**
- Subscribe to lifecycle events
- Register custom tools callable by the LLM
- Add slash commands
- Add keyboard shortcuts
- Add custom UI components
- Session persistence via `pi.appendEntry()`
- Custom rendering for tool calls and results

**Discovery paths:**
- `~/.pi/agent/extensions/` (global)
- `.pi/extensions/` (project-local)
- npm packages

Extensions use a default export function that receives an `ExtensionAPI`, allowing you to register tools, commands, and event handlers. There are 50+ examples in the [official examples directory](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent/examples/extensions).

Full docs: [pi-mono/packages/coding-agent/docs/extensions.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)

### 3.2 Skills System

Skills are on-demand capability packages following the **Agent Skills standard**, invoked via `/skill:name` or auto-loaded by the agent.

**Discovery paths:**
- `~/.pi/agent/skills/`
- `~/.agents/skills/`
- `.pi/skills/`
- `.agents/skills/` (from cwd up through parent directories)
- Package `skills/` directories or `pi.skills` entries in `package.json`

**Cross-compatibility:** Skills are [compatible with Claude Code, Codex CLI, Amp, and Droid](https://github.com/badlogic/pi-skills). Claude Code only looks one level deep for SKILL.md files. To use pi-skills from Claude Code: `{ "skills": [ "~/.claude/skills", "~/.codex/skills" ] }`.

**Official pi-skills repo:** [badlogic/pi-skills](https://github.com/badlogic/pi-skills) -- includes brave-search, browser-tools, gccli, gdcli, gmcli, transcribe, vscode, youtube-transcript.

### 3.3 Prompt Templates and Themes

Extensions, skills, prompts, and themes can be bundled as packages and installed from npm or git. The [pi.dev](https://shittycodingagent.ai/packages) website provides a browsable catalog.

### 3.4 How Far Can You Push the Extension System?

The extension system is genuinely powerful. Community examples prove you can build:
- Full subagent orchestration (pi-subagents, pi-collaborating-agents)
- MCP server integration (pi-mcp-adapter)
- Interactive shell control with PTY emulation (pi-interactive-shell)
- LSP integration (oh-my-pi)
- Browser automation
- Multi-agent messaging protocols (pi-messenger)
- Workflow chains (pi-foreground-chains)
- Plan modes, permission gates, file reservation systems

The constraint: everything must be TypeScript/JavaScript and work within the extension API surface. But that surface is broad enough that the community has essentially replicated every feature Claude Code has built-in, and then some.

---

## 4. Mario's Views on Multi-Agent Orchestration

### 4.1 The Anti-Pattern Position

**Mario considers parallel sub-agent spawning an anti-pattern.** From his blog post:

> "Spawning multiple sub-agents to implement various features in parallel is an anti-pattern in my book and doesn't work, unless you don't care if your codebase devolves into a pile of garbage."

He has also [tweeted](https://x.com/badlogicgames/status/2020466594497908792): "and now you know why pi doesn't have subagents built-in."

And [separately](https://x.com/badlogicgames/status/2016306398678683867): "People of pi all build their own subagent support, while I, a caveman, enjoy two parallel sessions top, without any such fanciness."

He has criticized sub-agents and agent modes as "crap," citing how an LLM switched between multiple modes and called different agents unnecessarily when asked to implement a feature.

### 4.2 Why Pi Does NOT Have Built-In Subagents

Pi ships without sub-agents, plan mode, or team management **by design**. The philosophy is:
- There are many ways to handle parallel work
- Users can spawn pi instances via tmux manually
- Users can build their own with extensions
- Users can install a package that does it their way
- One-size-fits-all subagent systems don't work because workflows vary too much

### 4.3 Community Subagent Solutions (Despite Mario's Skepticism)

Despite Mario's position, the community has built extensive multi-agent tooling:

1. **[pi-subagents](https://github.com/nicobailon/pi-subagents)** (by @nicopreme) -- Async subagent delegation with truncation, artifacts, session sharing. Chains (`->`) and parallel (`/parallel`). Built-in agent types: scout, planner, worker, reviewer, context-builder, researcher. Depth limit: 2 levels by default (configurable via `PI_SUBAGENT_MAX_DEPTH`).

2. **[pi-collaborating-agents](https://github.com/baochunli/pi-collaborating-agents)** (by baochunli) -- Multiple agents with readable two-word callsigns (e.g., SilverHarbor). `@AgentName` for DMs, `@all` for broadcast. File reservations enforced via hooks on edit/write tools. Normal messages queued with `followUp`, urgent messages interrupt with `steer`.

3. **[pi-side-agents](https://github.com/pasky/pi-side-agents)** (by pasky) -- Automates tmux/worktree/merge lifecycle. Each side agent gets its own tmux window and short-lived topic branch. Avoids "teams of long-running agents" complexity. One-off child agents that live with their short topic branches.

4. **[pi-messenger](https://github.com/nicobailon/pi-messenger)** (by @nicopreme) -- Multi-agent communication protocol for Pi.

5. **[pi-foreground-chains](https://github.com/nicobailon/pi-foreground-chains)** (by @nicopreme) -- Sequential workflow orchestration (Scout -> Planner -> Worker -> Reviewer) with file-based handoff, running in observable overlay where user can intervene.

6. **[Overstory](https://github.com/jayminwest/overstory)** -- Multi-agent orchestration with pluggable runtime adapters for Claude Code, Pi, and more. Spawns workers in git worktrees via tmux, coordinates through SQLite mail system, merges with tiered conflict resolution. FIFO merge queue with 4-tier conflict resolution and watchdog health monitoring.

---

## 5. Nicopreme (@nicopreme / Nico Bailon) -- Pi's Power User

Nico Bailon ([@nicopreme](https://x.com/nicopreme)), based in Vancouver BC, is the most prolific Pi extension builder. His projects:

### 5.1 Published Extensions and Tools

| Project | Description |
|---------|-------------|
| **[pi-subagents](https://github.com/nicobailon/pi-subagents)** | Async subagent delegation with chains, parallel execution, TUI clarification. Scout/planner/worker/reviewer agents. |
| **[pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter)** | Single proxy tool (~200 tokens) that discovers MCP servers on-demand. Solves the problem that a single MCP server can burn 10k+ tokens. Tools load progressively. Servers start/stop on demand. Option to promote tools to first-class. Supports 100+ MCP servers. |
| **[pi-web-access](https://github.com/nicobailon)** | Web search and content extraction. Works with Chrome cookies, Perplexity, or Gemini API. Provides `web_search`, `fetch_content`, `get_search_content` tools. |
| **[pi-interactive-shell](https://github.com/nicobailon/pi-interactive-shell)** | Allows Pi to autonomously control interactive CLIs in an observable overlay. Full PTY emulation, no tmux dependency, token efficient. User can take over anytime. |
| **[pi-messenger](https://github.com/nicobailon/pi-messenger)** | Multi-agent communication protocol. |
| **[pi-foreground-chains](https://github.com/nicobailon/pi-foreground-chains)** | Multi-agent workflow orchestration with file-based handoff. Sequential chains: scout -> planner -> worker -> reviewer. |
| **Model Switcher** | Extension that lets Pi [list, search, and switch its own models on demand](https://x.com/nicopreme/status/2012980743685935290). |

### 5.2 Nicopreme's Impact

Nicopreme also contributed the **skills system** to Pi itself. Mario [acknowledged this](https://x.com/badlogicgames/status/1999534755256074354): "pi, the shitty coding agent, now supports skills. Brought to you by mom, the shitty slack chatbot based on pi, and @nicopreme who implemented it."

His pi-mcp-adapter is particularly significant -- it elegantly solves the context window bloat problem that plagues MCP-heavy setups by using a single proxy tool and lazy-loading servers on demand.

---

## 6. Pi Agent Community -- What People Are Building

### 6.1 Major Community Projects

| Project | Author | Description |
|---------|--------|-------------|
| **[oh-my-pi](https://github.com/can1357/oh-my-pi)** | can1357 | Fork/enhancement with hash-anchored edits, optimized tool harness, LSP (40+ languages, 11 operations), Python support, browser, subagents. Plan mode with restricted tool sets. Isolation backends (git worktrees, fuse-overlay filesystems). |
| **[Overstory](https://github.com/jayminwest/overstory)** | jayminwest | Multi-agent orchestration with pluggable runtime adapters for Claude Code/Pi/Gemini. Git worktrees + tmux + SQLite mail system. |
| **[awesome-pi-agent](https://github.com/qualisero/awesome-pi-agent)** | qualisero | Curated list of extensions, hooks, tools, skills, and resources. |
| **[pi-extensions](https://github.com/tmustier/pi-extensions)** | thomasmustier | Collection of delightful extensions. Thomas also contributed the dequeuing feature to pi core. |
| **[pi-mono-py](https://github.com/williepaul/pi-mono-py)** | williepaul | Python port of the pi-mono toolkit. |
| **[piagent-vscode](https://github.com/brijbyte/piagent-vscode)** | brijbyte | VSCode extension for Pi. |

### 6.2 Community Extensions Ecosystem

From the [awesome-pi-agent](https://github.com/qualisero/awesome-pi-agent) list and [pi.dev packages](https://shittycodingagent.ai/packages):

- **pi-super-curl** -- Advanced HTTP tool
- **cost-tracker** -- Cost monitoring
- **handoff** -- Session handoff between agents
- **memory-mode** -- Persistent memory
- **oracle** -- Knowledge base queries
- **plan-mode** -- Structured planning
- **status-widget** -- Session status display
- **ultrathink** -- Enhanced reasoning
- **usage-bar** -- Token usage visualization
- **filter-output** -- Redact sensitive data
- **security** -- Block dangerous bash commands
- **agent-stuff (mitsupi)** -- Skills and extensions for commit, changelog, GitHub, web browser, tmux, Sentry
- **pi-amplike** -- Web search and webpage extraction

### 6.3 OpenClaw

[OpenClaw](https://github.com/openclaw/openclaw) is the multi-channel AI assistant built on Pi's AgentSession SDK. It reached **145,000+ GitHub stars in a single week** -- the fastest-growing open-source project in that period. OpenClaw demonstrates that Pi's minimalist architecture scales to massive adoption. [Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/) (creator of Flask/Rye) wrote about Pi's role in OpenClaw, and both appeared on [Syntax podcast #976](https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner).

---

## 7. Pi Agent vs Claude Code -- Mario's Own Assessment

### 7.1 Mario's Core Criticism of Claude Code

Mario's frustration with Claude Code centers on:
1. **Bloated system prompts** -- Claude Code's multi-thousand-token system prompt vs Pi's sub-1000-token prompt
2. **Too many built-in tools** -- Claude Code ships Glob, Grep, WebSearch, WebFetch, etc.; Pi says bash covers all of these
3. **Opaque changes** -- System prompt and tools change on every release, breaking workflows
4. **Unnecessary complexity** -- 80% of features he doesn't use
5. **Safety friction** -- Permission systems slow down experienced developers

### 7.2 Detailed Comparison (from [disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code))

| Dimension | Pi | Claude Code |
|-----------|-----|-------------|
| **Philosophy** | "If I don't need it, it won't be built" | "Tool for every engineer" |
| **Tools** | 4 (read, write, edit, bash) | 10+ built-in (Glob, Grep, WebSearch, etc.) |
| **System prompt** | ~200 tokens | Multi-thousand tokens |
| **Safety** | YOLO by default, no sandbox | Deny-first, 5 modes, filesystem sandbox, Haiku pre-screening |
| **Sub-agents** | None built-in (community extensions) | Built-in sub-agents and teams |
| **MCP** | Via extension (pi-mcp-adapter) | Native support |
| **Model support** | 300+ models, any provider | Claude-only (with some model routing) |
| **Cost tracking** | Built-in at pi-ai layer | Limited |
| **License** | MIT | Proprietary |
| **Extensibility** | TypeScript extensions, full API | Hooks, custom slash commands |
| **Plan mode** | Via extension | Built-in |

### 7.3 When to Choose Pi (per community consensus)

- Truly model-agnostic framework needed
- Built-in cost tracking important
- Radical simplicity preferred
- Building multi-channel applications
- Working exclusively in TypeScript
- Want fully MIT-licensed solution
- Want maximum customization control

### 7.4 Benchmark Performance

On Terminal-Bench 2.0, Pi held its own against Claude Code despite having a fraction of the tooling. Mario created a test run with Claude Opus 4.5 and competed against Codex, Cursor, Windsurf. The benchmark team noted that their own Terminus agent (even more minimal than Pi -- only tmux access) also competed effectively, supporting Mario's thesis that minimal tooling is sufficient.

---

## 8. Mario's Vision for Pi Agent's Future

### 8.1 Stated Philosophy

Pi's entire idea is that if you want the agent to do something it doesn't do yet, **you don't go and download an extension or a skill -- you ask the agent to extend itself.** This self-modification capability is central to Mario's vision.

From the [Syntax podcast](https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner): "Bash is all you need." The risks of agents, workflow adaptability, and where AI coding agents are headed were major discussion topics.

### 8.2 Evolution Trajectory

1. **v0.37.x** (Dec 2025) -- DOOM running in terminal (demonstrating pi as a rendering engine)
2. **v0.45.1** (Jan 2026) -- "ENTERPRISE release" with Amazon Bedrock support, MiniMax AI with interleaved thinking
3. **v0.56.1** (Mar 2026) -- Claude Opus 4.6 support, GPT-5.3 Codex support, undo support, custom keyboard bindings, offline startup mode, default skill auto-discovery

### 8.3 Direction

Mario is focused on:
- **Keeping the core minimal** -- Resisting feature creep
- **Improving extensibility** -- Unified extension system, better discovery
- **Model catalogue expansion** -- 300+ models with auto-generation from models.dev
- **Community ecosystem growth** -- pi.dev package catalog, encouraging community extensions
- **Self-modification** -- The agent extending itself rather than relying on pre-built features
- **NOT building in sub-agents** -- Explicitly leaving this to community extensions

His belief: the agent harness should be a thin, stable layer between the user and the model. The model is smart enough to figure things out; the harness should not try to be smarter than the model.

---

## 9. Orchestration-Specific Features Assessment

### 9.1 What Pi Has Built-In for Orchestration

**Nothing.** This is by design.

### 9.2 What Community Extensions Provide

| Capability | Extension | Maturity |
|-----------|-----------|----------|
| Subagent spawning | pi-subagents, pi-collaborating-agents, pi-side-agents | High |
| Inter-agent messaging | pi-messenger, pi-collaborating-agents | Medium-High |
| Sequential chains | pi-foreground-chains | Medium |
| Parallel execution | pi-subagents (`/parallel`), pi-side-agents (tmux) | Medium |
| Git worktree isolation | pi-side-agents, Overstory | Medium-High |
| File reservation/locking | pi-collaborating-agents | Medium |
| Depth-limited recursion | pi-subagents (2-level default) | High |
| Cross-agent runtime support | Overstory (Claude Code + Pi + Gemini) | Medium |
| Agent role specialization | pi-subagents (scout/planner/worker/reviewer) | High |
| Observable orchestration | pi-foreground-chains | Medium |

### 9.3 Assessment for Custom Multi-Agent Orchestration

**Strengths:**
- Pi's extension API is powerful enough to build any orchestration pattern
- TypeScript-native means full programmatic control
- Multiple competing community approaches = patterns to learn from
- MIT license means no legal constraints
- Model-agnostic means you can use cheap models for sub-agents and expensive ones for orchestrators
- Cost tracking at pi-ai layer lets you monitor orchestration costs
- The thin agent loop means less interference from the harness

**Weaknesses:**
- No built-in orchestration primitives means you build from scratch or depend on community extensions
- Mario actively discourages multi-agent patterns, meaning core Pi won't evolve to support them better
- Community extensions have varying maturity levels
- No standardized inter-agent protocol (each extension invents its own)
- Depth limits and nesting guards need manual configuration
- No built-in state management for orchestration (you roll your own)

---

## 10. Published Content by Mario Zechner About Pi

### Blog Posts
1. **["What I learned building an opinionated and minimal coding agent"](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)** (Nov 30, 2025) -- The Pi manifesto. Architecture, philosophy, 4 tools, system prompt design, anti-patterns (including multi-agent as anti-pattern).
2. **["Year in Review 2025"](https://mariozechner.at/posts/2025-12-22-year-in-review-2025/)** (Dec 22, 2025) -- Year-end retrospective including Pi's development.

### Podcast
3. **[Syntax #976: "Pi - The AI Harness That Powers OpenClaw"](https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner)** (Feb 4, 2026) -- With Armin Ronacher. Covers bash-is-all-you-need, risks of agents, workflow adaptability, where AI coding agents are headed.

### Third-Party Coverage
4. **[Armin Ronacher: "Pi: The Minimal Agent Within OpenClaw"](https://lucumr.pocoo.org/2026/1/31/pi/)** (Jan 31, 2026)
5. **[Nader Substack: "How to Build a Custom Agent Framework with PI"](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)**
6. **[Medium: "Agent Pi: How 4 Tools Coding Agent Power OpenClaw/MoltBot/ClawdBot"](https://medium.com/@shivam.agarwal.in/agentic-ai-pi-anatomy-of-a-minimal-coding-agent-powering-openclaw-5ecd4dd6b440)**
7. **[atalupadhyay: "PI Agent Revolution: Building Customizable, Open-Source AI Coding Agents That Outperform Claude Code"](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)** (Feb 24, 2026)
8. **[disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code)** -- Detailed feature comparison
9. **[Zhihu: Next-gen Agent Architecture -- Pi Agent Core Design Logic Deep Analysis](https://zhuanlan.zhihu.com/p/2004665077618458930)** (Chinese)
10. **[Hacker News discussion](https://news.ycombinator.com/item?id=46844822)** and **[Lobsters discussion](https://lobste.rs/s/ihdozl/what_i_learned_building_opinionated)**

### Key Tweets
11. **[Pi 0.45.1 "ENTERPRISE" announcement](https://x.com/badlogicgames/status/2010897722518196516)** -- Bedrock support, MiniMax AI
12. **["Most steerable coding harness" tweet](https://x.com/badlogicgames/status/2009789951290880220)** -- Dequeuing, steerability
13. **["Pi doesn't have subagents built-in"](https://x.com/badlogicgames/status/2020466594497908792)** -- Subagent anti-pattern
14. **["Caveman with two parallel sessions"](https://x.com/badlogicgames/status/2016306398678683867)** -- His personal multi-agent approach
15. **["Pi the shitty coding agent is going places"](https://x.com/badlogicgames/status/2027144867453837551)** (Feb 26, 2026) -- Ollama integration announcement
16. **[Extensions demo tweet](https://x.com/badlogicgames/status/2015879838423245290)** -- "Adapt pi to your workflow, share your wares"

---

## 11. Assessment: Pi as Foundation for Custom Multi-Agent Orchestration

### 11.1 Viability Rating: HIGH (with caveats)

Pi is an excellent foundation for building custom orchestration because:

1. **The pi-agent-core layer** provides a clean agent loop you can embed programmatically
2. **TypeScript SDK** (`@mariozechner/pi-agent-core`) lets you spawn agent sessions from code
3. **Extension API** is rich enough for tool registration, event handling, and UI components
4. **Model agnosticism** means you can assign different models to different agent roles (cheap models for scouts, expensive for planners)
5. **Cost tracking** gives you orchestration cost visibility out of the box
6. **MIT license** means no constraints on how you build
7. **Community has already proven** multiple orchestration patterns work

### 11.2 Key Caveats

1. **Mario is philosophically opposed** to multi-agent patterns. Core Pi will never get orchestration primitives. You are always swimming against the current of the project's creator.
2. **No standardized protocol** for inter-agent communication. Each community extension invents its own. If you build on top of pi-subagents today and it changes, you absorb the breakage.
3. **Extension stability** -- community extensions may not keep up with pi-mono's rapid release cadence (currently at 0.56.x).
4. **No built-in state persistence** for orchestration state. You need to build your own (JSON files, SQLite, etc.).

### 11.3 Comparison to Claude Code as Orchestration Base

| Factor | Pi | Claude Code |
|--------|-----|-------------|
| Multi-agent built-in | No | Yes (sub-agents, teams) |
| Programmatic embedding | Yes (pi-agent-core SDK) | Yes (Claude Agent SDK) |
| Model flexibility | 300+ models, any provider | Claude-only |
| Cost per agent | Lower (model choice) | Higher (Claude pricing) |
| Extension power | Very high | Medium (hooks, commands) |
| Orchestration state | DIY | Partial built-in |
| Community patterns | 6+ approaches | Official patterns |
| Creator support | Against multi-agent | Supports multi-agent |
| Stability | Rapid changes, 0.x | More stable releases |

### 11.4 Bottom Line

Pi is the better **raw material** for custom orchestration if you want full control, model flexibility, and cost optimization. Claude Code is the better choice if you want something that works out of the box with less assembly required. For a project like L-Thread Orchestrator that already has its own orchestration layer, Pi's minimal core and powerful SDK could be a compelling alternative runtime -- but the philosophical mismatch with Mario's vision means you'd be building against the grain of the project's leadership.

---

## Key Repositories

- **Pi Mono:** https://github.com/badlogic/pi-mono
- **Pi Skills:** https://github.com/badlogic/pi-skills
- **Pi Subagents:** https://github.com/nicobailon/pi-subagents
- **Pi MCP Adapter:** https://github.com/nicobailon/pi-mcp-adapter
- **Pi Messenger:** https://github.com/nicobailon/pi-messenger
- **Pi Interactive Shell:** https://github.com/nicobailon/pi-interactive-shell
- **Pi Foreground Chains:** https://github.com/nicobailon/pi-foreground-chains
- **Pi Collaborating Agents:** https://github.com/baochunli/pi-collaborating-agents
- **Pi Side Agents:** https://github.com/pasky/pi-side-agents
- **Oh-My-Pi:** https://github.com/can1357/oh-my-pi
- **Overstory:** https://github.com/jayminwest/overstory
- **Awesome Pi Agent:** https://github.com/qualisero/awesome-pi-agent
- **Pi vs Claude Code:** https://github.com/disler/pi-vs-claude-code
- **Pi Website:** https://shittycodingagent.ai/
