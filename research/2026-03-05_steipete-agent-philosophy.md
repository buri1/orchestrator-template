# Deep Research: steipete (Peter Steinberger) -- Multi-Agent Philosophy & The Polyagentmorous Approach

**Date:** 2026-03-05
**Subject:** @steipete -- 410K followers, "ClawFather," "Polyagentmorous," creator of OpenClaw, now at OpenAI
**Sources:** Blog posts, GitHub repos, interviews (Lex Fridman, Pragmatic Engineer), X/Twitter, Hacker News

---

## Table of Contents

1. [Who Is steipete?](#1-who-is-steipete)
2. [What "Polyagentmorous" Means in Practice](#2-what-polyagentmorous-means-in-practice)
3. [Agent Orchestration Setup & Tools](#3-agent-orchestration-setup--tools)
4. [Published Best Practices for Multi-Agent Coordination](#4-published-best-practices-for-multi-agent-coordination)
5. [Problems Encountered and Solved](#5-problems-encountered-and-solved)
6. [OpenClaw: Origin, Role, and Impact](#6-openclaw-origin-role-and-impact)
7. [MCP Servers and Tools He Recommends](#7-mcp-servers-and-tools-he-recommends)
8. [Agent-to-Agent Communication](#8-agent-to-agent-communication)
9. [Key Blog Posts, Threads, and Interviews](#9-key-blog-posts-threads-and-interviews)
10. [People He References and Collaborates With](#10-people-he-references-and-collaborates-with)
11. [Orchestration Patterns He Advocates](#11-orchestration-patterns-he-advocates)
12. [Actionable Patterns for Building a Multi-Agent Orchestrator](#12-actionable-patterns-for-building-a-multi-agent-orchestrator)

---

## 1. Who Is steipete?

Peter Steinberger is an Austrian software engineer based in Vienna and London. He founded PSPDFKit (a PDF SDK used by Apple, Dropbox, SAP -- "used on a billion devices"), bootstrapped it for a decade, and exited when Insight Partners invested $116M in 2021. He then went "deep in vibe-coding mode," becoming one of the most influential voices in AI-native development.

**Self-description from his GitHub profile:**
> "Polyagentmorous builder | Ex-PSPDFKit Founder"
> "Deep in vibe-coding mode -- building AI-powered developer tools at ludicrous speed."

**Key identity markers:**
- **ClawFather** -- his persona as creator of OpenClaw
- **Polyagentmorous** -- his term for running multiple AI agents simultaneously
- **"Claudoholic"** -- self-described addiction to agentic engineering (from his "Just One More Prompt" talk)
- Joined OpenAI in February 2026 to "bring agents to everyone"

**Philosophy (from GitHub):**
> "Ship beats perfect. I build tools to solve my own problems, then share them with the world."

**Random fact from his profile:**
> "Treat AI agents as 'slot machines for programmers.' Run 3-6 Claude instances concurrently."

---

## 2. What "Polyagentmorous" Means in Practice

### Definition
"Polyagentmorous" is steipete's playful portmanteau combining "polyamorous" with "agent" -- meaning a developer who simultaneously maintains active relationships with multiple AI coding agents, running them in parallel rather than monogamously using one at a time.

### How Many Agents He Runs

His practice has evolved over time:

- **Early setup (mid-2025):** 3-4 Claude instances simultaneously
- **Mature setup (late 2025):** 3-8 agents in parallel in a **3x3 terminal grid**
- **Context-dependent scaling:**
  - **1-2 agents** when not refactoring (focused single-task work)
  - **~4 agents** for cleanup/tests/UI work ("the sweet spot")
  - **Up to 8** for maximum parallel throughput

**Direct quote from "My Current AI Dev Workflow" (Aug 2025):**
> "When I'm not refactoring I usually run 1-2 agents; for cleanup/tests/UI work ~4 seems to be the sweet spot. All depends on the blast radius of the work."

**Direct quote from "Just Talk To It" (Oct 2025):**
> "I've completely moved to codex cli as my daily driver, running between 3-8 in parallel in a 3x3 terminal grid, most of them in the same folder, with some experiments in separate folders."

### The "Slot Machine" Metaphor

From "Slot Machines for Programmers" (2025):
> "Agents have 'temperature.' Don't like the result? Just re-execute without changing the prompt. Like slot machines: press enter, get something new."

He runs multiple agents like a distributed team of "brilliant but unpredictable interns" -- you spin many up, take what works, and revert what doesn't.

---

## 3. Agent Orchestration Setup & Tools

### Core Terminal Setup

| Component | Tool | Purpose |
|-----------|------|---------|
| Terminal | **Ghostty** | Primary terminal (returned from VS Code) |
| Monitor | **Dell UltraSharp U4025QW** | 3840x1620 ultrawide -- fits 4 Claude instances + Chrome |
| IDE | **VS Code** (side panel) | Code lookup, not primary coding |
| Review | **Cursor / GPT-5** | Plan review, second opinions |
| Git GUI | **Tower** | Diff review after agent runs |
| Agent CLI | **Claude Code** + **Codex CLI** | Primary agent interfaces |

**Key quote (Aug 2025):**
> "VS Code's terminal is too unstable, had plenty freezes when pasting in large amounts of text. Nothing beats Ghostty."

### All Agents Work on Main Branch

> "Yes, all of these work on main. I tried the whole worktree setup, just slows me down. If you pick areas of work carefully you can work on multiple areas without much cross-pollination."

This is a deliberate anti-pattern to conventional git worktree advice. He finds worktrees add friction and always reverts to working on main with careful area-of-work separation.

### Agent Monitoring Tools (steipete-built)

| Tool | Repo | Purpose |
|------|------|---------|
| **tmuxwatch** | `steipete/tmuxwatch` | TUI dashboard for monitoring all tmux sessions/panes |
| **CodexBar** | `steipete/CodexBar` | macOS menu bar app showing agent quota/usage stats |
| **VibeTunnel** | `amantus-ai/vibetunnel` | Browser-based terminal access for commanding agents remotely |
| **Poltergeist** | `steipete/poltergeist` | Universal hot reload & file watcher |
| **RepoBar** | `steipete/RepoBar` | CI, PRs, releases at a glance |

The combination of **tmuxwatch + poltergeist + codex** is described as particularly powerful for monitoring subagents and background tasks.

### Configuration

From "Shipping at Inference Speed," his configuration includes:
```
unified_exec = true       # Replaced tmux and old runner scripts
apply_patch_freeform = true
web_search_request = true
skills = true
shell_snapshot = true
ghost_commit = false
```

Token management formula:
```
model_auto_compact_token_limit = 273000 - (tool_output_token_limit + 15000)
# With tool_output_token_limit of 25000: result is 233000
```

---

## 4. Published Best Practices for Multi-Agent Coordination

### 4.1 The "Blast Radius" Principle

Think about how many files a change will touch before spawning agents:
> "Think about 'blast radius' -- understand how long a change will take and how many files it will touch. You can throw many small bombs at the codebase or one large change."

**Rule:** Multiple large changes make isolated commits impossible and rollback harder. Prefer **many small, isolated changes** ("small bombs") over "Fat Man" (large sweeping changes).

### 4.2 CLI-First Architecture

> "Whatever I want to build, it starts as a CLI -- agents can call it directly and verify output, closing the loop."

**Rule:** Build CLIs before UIs. Agents can invoke CLIs directly. One line in CLAUDE.md is enough:
```
logs: axiom or vercel cli
Database: psql + one example how to load env correctly
```

### 4.3 CLIs Over MCPs

This is one of his strongest opinions:

> "Almost all MCPs should be CLIs. You can just refer to a CLI by name without explanation -- the agent will try commands on the first call, the CLI will present the help menu, and context will have full information on how it works."

> "Unlike MCPs which are a constant cost and take up context space, there's no price for using tools via CLI."

**Concrete example:** GitHub's MCP consumes 23k tokens of context. The `gh` CLI has the same features with zero context cost.

He eventually removed his last MCP because:
> "Claude sometimes would go off spinning up Playwright unasked when it could simply read the code -- which is faster and pollutes the context less."

### 4.4 Context Engineering

- **AGENTS.md** (symlinked to CLAUDE.md) as the single global instruction file
- Every consuming repo's AGENTS.MD reduced to a single pointer line: `READ ~/Projects/agent-scripts/AGENTS.MD BEFORE ANYTHING`
- Repo-specific rules placed after that pointer line only if truly needed
- Docs in a `docs/` folder in each project with instruction: `write docs to docs/*.md`
- Script + instructions in global AGENTS file to force the model to read docs on certain topics
- Telegraphic writing style: drop filler/grammar, minimize tokens

**Key principle:**
> "Since CLAUDE.md goes into every single session, ensure its contents are as universally applicable as possible, and it should contain as few instructions as possible."

### 4.5 Testing Strategy

> "Bigger changes always get tests. Automated ones usually aren't great, but the model almost always finds issues when you ask it to write tests IN THE SAME CONTEXT. Context is precious, don't waste it."

**Rule:** Write tests after implementation, in the same context window, not in a separate session.

### 4.6 Atomic Commits & Review

- Agents configured to perform **atomic Git commits**
- After agents run, review everything in **Tower** (Git GUI) for good diffing
- "If they made shit, I just revert it"
- Commit as soon as something is tested and works
- No complex PR workflows for small teams

### 4.7 Screenshots as Context

> "Adding images/screenshots is an effective way to provide context -- I use screenshots in at least 50% of my prompts."

The model is adept at identifying relevant strings and locations from screenshots.

### 4.8 Mid-Run Intervention

> "Mid-way through agent operations, you can hit escape and ask for status updates, and file changes are atomic so agents are good at picking up where they stopped."

### 4.9 Compaction as Review

> "Compaction works well enough that tasks can run across many compacts and will be finished. It makes things slower but often acts like a review, and the model will find bugs when it looks at code again."

### 4.10 Model-Specific Prompting

> "Claude reacts well to SCREAMING ALL-CAPS commands that threaten it will imply ultimate failure and 100 kittens will die if it runs command X. That freaks out GPT-5."

> "When things get hard, using trigger words like 'take your time,' 'comprehensive,' and 'read all code that could be related' helps solve even the trickiest problems."

---

## 5. Problems Encountered and Solved

### Problem 1: Context Pollution from MCPs
**Solution:** Remove MCPs, use CLIs instead. Zero context cost vs. 23k+ tokens for MCP tool descriptions.

### Problem 2: Agents Drifting Off Task
**Observation:** "I steer the models a lot as I notice them drifting off -- that's much harder if they run in the background."
**Solution:** Stay interactive. He is skeptical of fully background agents: "Still don't see how this could be moved to background agents."

### Problem 3: Multiple Agents Conflicting on Same Codebase
**Solution:** Work on main, but pick areas of work carefully to avoid cross-pollination. No worktrees needed if you partition work intelligently.

### Problem 4: Agent-Generated Technical Debt
**Solution:** "Claude often makes a mess but it's equally great in refactoring and cleaning up. Important to do both to not create too much technical debt."

### Problem 5: VS Code Terminal Instability
**Solution:** Switched entirely to Ghostty terminal.

### Problem 6: Distributed System Design Complexity
**Observation:** "The hardest part is distributed system design, picking the right dependencies, platforms and a forward-thinking database schema."
**Solution:** Build custom infra, admin pages, and CLIs to assist both humans and agents.

### Problem 7: Compaction Breaking Agent State
**Solution:** Use unified_exec (replaced tmux and runner scripts). Compaction now acts as an implicit review pass.

### Problem 8: Understanding Which Model to Use When
**Observations:**
- Codex reads more code before acting (sometimes silently for 10-15 minutes), increasing fix accuracy
- Claude/Opus is more eager -- great for smaller edits, less good for larger features
- GPT-5 is more literal in prompting requirements
- Use GPT-5 for reviewing plans, Claude for execution

---

## 6. OpenClaw: Origin, Role, and Impact

### What Is OpenClaw?

OpenClaw is a **free and open-source autonomous AI agent** that can execute tasks via large language models, using messaging platforms as its primary user interface.

**Origin story (from Lex Fridman podcast):**
> "I was annoyed that it didn't exist, so I just prompted it into existence."

### Timeline

| Date | Event |
|------|-------|
| Nov 2025 | Published as "Clawdbot" by steipete |
| Jan 27, 2026 | Renamed to "Moltbot" after Anthropic trademark complaints |
| Jan 30, 2026 | Renamed again to "OpenClaw" |
| 72 hours | Went from 0 to 180,000 GitHub stars |
| Feb 2026 | Surpassed React as most-starred non-aggregator project (~250K+ stars) |
| Feb 15, 2026 | Steinberger announces joining OpenAI; OpenClaw moves to independent foundation |

### How OpenClaw Works

- Bots run **locally** on your machine
- Integrates with external LLMs (Claude, DeepSeek, GPT models)
- User interface through **messaging platforms**: Signal, Telegram, Discord, WhatsApp, iMessage
- Can control a browser, send emails, do multi-step planning, pursue persistent goals
- Self-modifying capability (can modify its own code)
- "Nodes" concept: your computer becomes a node in the agent network

### steipete's Role

He is the **creator and original author**. After joining OpenAI:
- OpenClaw moved to an **independent open-source foundation**
- OpenAI is a **sponsor, not owner**
- MIT license stays intact
- Steinberger's non-negotiable condition: the project must remain open-source

### Naming Controversy

The original name "Clawdbot" (a play on "Claude") drew trademark complaints from Anthropic, leading to two rapid renames. This became a significant part of the project's viral story.

---

## 7. MCP Servers and Tools He Recommends

### steipete's Strong Opinion on MCPs

He is **increasingly skeptical of MCPs** and favors CLIs. However, he has built and recommends specific MCP servers for cases where they genuinely add value.

### MCP Servers He Built

| Server | Repo | Purpose |
|--------|------|---------|
| **claude-code-mcp** | `steipete/claude-code-mcp` | "An agent in your agent" -- runs Claude Code as one-shot MCP |
| **mcp-agentify** | `steipete/mcp-agentify` | Orchestrator that converts MCP servers to agents |
| **Peekaboo** | `steipete/Peekaboo` | macOS screenshots + GUI automation (MCP + CLI) |
| **macOS Automator MCP** | `steipete/macos-automator-mcp` | System automation for macOS |
| **Conduit MCP** | `steipete/conduit-mcp` | File ops, web prowling, data hunting (archived/legacy) |
| **Terminator MCP** | `steipete/Terminator` | Terminal output capture (legacy) |

### Essential MCP Servers (from his agent-rules repo)

From `steipete/agent-rules/global-rules/steipete-mcps.md`:
- **peekaboo** -- AI vision/screenshots
- **context7** -- context management
- **agent** -- agent orchestration
- **automator** -- macOS automation
- **playwright** -- browser automation
- **gitmcp** -- git operations

Additional servers requiring API keys: **GitHub**, **Firecrawl**

### MCP Launcher

Uses **mcporter** (`steipete/mcporter`) to call MCP servers from TypeScript or package them as CLIs:
```
npx mcporter <server>
```

### Oracle Tool

> "Ask the oracle when you're stuck -- invoke GPT-5 Pro with a custom context and files."

```
npx -y @steipete/oracle
```

Used when the primary agent gets stuck; the oracle provides a second opinion from a different model.

---

## 8. Agent-to-Agent Communication

### His Approach

steipete's approach to agent-to-agent communication is notably **pragmatic and file-based** rather than protocol-based:

1. **Git as communication medium**: Multiple agents work on the same codebase on main. Git history and file changes are how agents "see" each other's work.

2. **Docs folder as shared context**: `docs/*.md` files serve as inter-agent documentation that any agent can read to understand subsystem state.

3. **AGENTS.md as shared instruction set**: A single canonical instruction file that all agents read, ensuring consistent behavior.

4. **claude-code-mcp for nesting**: His "agent in your agent" pattern -- one agent can invoke another via the claude-code-mcp server for subtask delegation.

5. **mcp-agentify for orchestration**: Converts MCP servers to agents, accepting requests through `agentify/orchestrateTask`, interpreting queries, selecting appropriate backend tools, and proxying calls.

### What He Does NOT Do

- No formal A2A (Agent-to-Agent) protocol
- No message queues between agents
- No explicit hub-spoke or swarm coordination
- Agents are **intentionally independent** -- they don't talk to each other directly

### The Implicit Pattern

His agents communicate **through the codebase itself**:
- Agent A writes code to file X
- Agent B reads file X when it needs context
- Git provides versioning and conflict detection
- The human (steipete) acts as the orchestrator/router

---

## 9. Key Blog Posts, Threads, and Interviews

### Blog Posts (steipete.me)

| Date | Title | Key Content |
|------|-------|-------------|
| 2025-06 | **"Slot Machines for Programmers"** | 3-4 agents as distributed team, temperature/re-execution philosophy |
| 2025-08 | **"My Current AI Dev Workflow"** | Ghostty + Claude Code, 1-4 agents, CLIs over MCPs, removed last MCP |
| 2025-08 | **"Essential Reading for Agentic Engineers"** | Curated monthly reading lists (July, August editions) |
| 2025-10 | **"Just Talk To It -- the no-bs Way of Agentic Engineering"** | 23-min read, atomic commits, small bombs, CLI-first, 3x3 grid |
| 2025-11 | **"Shipping at Inference Speed"** | "I ship code I don't read," unified_exec, compaction as review, 6600 commits/month |
| 2025-12 | **"Claude Code Anonymous"** | Meetup format, "Claudoholic" identity, community building |
| 2025-12 | **"Just One More Prompt"** | Talk about agent addiction, session time tracking |
| 2026-02 | **"OpenClaw, OpenAI and the future"** | Joining OpenAI, OpenClaw to foundation |

### Interviews & Podcasts

| Date | Platform | Title |
|------|----------|-------|
| 2026-02 | **Lex Fridman Podcast #491** | "OpenClaw: The Viral AI Agent that Broke the Internet" |
| 2026-01 | **The Pragmatic Engineer** | "The creator of Clawd: 'I ship code I don't read'" (114 min) |
| 2025 | **YouTube** | "How to Code 20x Faster with Claude Code" |
| 2025 | **YouTube** | "AI Native Development Interview" |
| 2025 | **YouTube** | "Arena Live Build -- Full Session" |

### Media Coverage

- **Fast Company**: "6 quotes from OpenClaw creator Peter Steinberger hint at the future of personal computing"
- **Fortune**: "Who is OpenClaw creator Peter Steinberger?"
- **TechCrunch**: "OpenClaw creator Peter Steinberger joins OpenAI"
- **VentureBeat**: "OpenAI's acquisition of OpenClaw signals the beginning of the end of the ChatGPT era"
- **WIRED**: "Claude 3 Sonnet 'Funeral' in San Francisco" (featuring steipete)
- **The Pragmatic Engineer Newsletter**: Featured in 2025 edition

### Community Events

- **Claude Code Anonymous** -- meetup format he co-created with Orta Therox
  - Chapters: London, Vienna, Berlin, Cologne, San Francisco, Delft
  - Format: "meet likeminded people" over long talks
  - Also called "Agents Anonymous"
  - Lightning talks from steipete, Orta, mitsuhiko

---

## 10. People He References and Collaborates With

| Person | Relationship |
|--------|-------------|
| **Orta Therox** (@orta) | Co-created Claude Code Anonymous meetup format |
| **Armin Ronacher** (@mitsuhiko) | Lightning talks at Claude Code Anonymous |
| **Greg Brockman** (@gdb) | Shared "Shipping at Inference Speed" post ("how to leverage coding agents to ship fast") |
| **Lex Fridman** | 3-hour interview about OpenClaw |
| **Gergely Orosz** (Pragmatic Engineer) | Featured interview + newsletter coverage |
| **Simon Willison** | Shared and commented on "Just Talk To It" blog post |
| **Sam Altman** | OpenAI CEO; recruited steipete, committed to keeping OpenClaw open-source |
| **Paul Solt** (@PaulSolt) | Commented on tmuxwatch + poltergeist + codex combo |
| **Ruben Casas** (@Infoxicador) | Attended Claude Code Anonymous meetups |
| **dotta** | Connection in the AI coding agent space (follows steipete) |

---

## 11. Orchestration Patterns He Advocates

### Pattern: Human-as-Hub (NOT Hub-Spoke Automation)

steipete acts as the **central orchestrator himself**. He does NOT use automated hub-spoke, swarm, or pipeline patterns. His pattern is:

```
                    [steipete]
                   /    |    \
              [Agent1] [Agent2] [Agent3]
                 |        |        |
              [main branch -- same codebase]
```

- **Human dispatches work** to each agent manually
- **Human steers** agents when they drift ("I steer the models a lot")
- **Human reviews** output in Tower (Git GUI) and reverts bad output
- **Agents are independent** -- no direct communication between them
- **Codebase is shared** -- all work on main, partitioned by area

### Anti-Pattern: Fully Autonomous Background Agents

> "Still don't see how this could be moved to background agents. I steer the models a lot as I notice them drifting off -- that's much harder if they run in the background."

### Anti-Pattern: Complex Orchestration Frameworks

He explicitly avoids:
- Complex PR workflows for small teams
- Git worktree setups (tried, always reverts)
- Heavy MCP stacks (removed his last MCP)
- Elaborate subagent hierarchies

### Pattern: "The Oracle" -- Cross-Model Consultation

When the primary agent gets stuck, invoke a **different model** (GPT-5 Pro) via the Oracle tool for a second opinion. This is model-to-model consultation mediated by the human.

### Pattern: Agent-in-Agent (claude-code-mcp)

One agent (e.g., in Cursor or Claude Desktop) can invoke another Claude Code instance via MCP for subtask delegation. This is the closest he gets to automated agent-to-agent orchestration.

---

## 12. Actionable Patterns for Building a Multi-Agent Orchestrator

Based on steipete's practices, here are concrete patterns applicable to building an orchestrator:

### 12.1 Scale Agents by "Blast Radius"

```
if task.blast_radius == "small" (1-2 files):
    spawn 1 agent
elif task.blast_radius == "medium" (cleanup/tests/UI):
    spawn 3-4 agents on separate areas
elif task.blast_radius == "large" (refactor):
    spawn 1-2 agents, work sequentially
```

### 12.2 CLI-First Agent Tooling

Build every tool as a CLI first. Agents can invoke CLIs with zero context overhead. Reference tools by name in AGENTS.md -- the agent will discover usage from `--help` output.

### 12.3 Centralized Agent Instructions (AGENTS.md)

Single master file with a pointer architecture:
```
# Every repo's AGENTS.MD:
READ ~/Projects/agent-scripts/AGENTS.MD BEFORE ANYTHING
# Repo-specific rules below this line only if truly needed
```

### 12.4 Docs as Inter-Agent State

Use `docs/*.md` files as shared knowledge. Instruct agents to `write docs to docs/*.md` -- let the model pick filenames. Force agents to read docs on certain topics via AGENTS.md instructions.

### 12.5 Compaction as Quality Gate

Allow compaction (context window overflow) to happen naturally. Treat it as an implicit review pass -- the model re-reads code and often finds bugs. Design tasks to survive across multiple compactions.

### 12.6 Interactive Steering Over Autonomy

Keep the human in the loop. Use `escape` to interrupt and check status. Do NOT fully background agents for important work. The human's role shifts from "writing code" to "making architectural decisions and steering."

### 12.7 Atomic Commits as Checkpoints

Configure agents for atomic commits. If something breaks, you can revert a single commit, not a massive changeset. Commit as soon as something is tested and works.

### 12.8 Model Selection Strategy

| Task | Best Model |
|------|-----------|
| Small edits, eager execution | Claude (Opus) |
| Large features, careful reading | Codex |
| Plan review, second opinions | GPT-5 |
| When stuck | Oracle (GPT-5 Pro) |
| Understanding codebases | Gemini |

### 12.9 Monitor Everything

Use tmuxwatch-style dashboards to monitor all agent sessions. Track token usage with CodexBar-style tools. Remote access via VibeTunnel for mobile monitoring.

### 12.10 "Ship Beats Perfect" Philosophy

> "I ship code I never read."

In January 2026, steipete made **6,600+ commits** in a single month. The philosophy: let agents generate, review diffs, revert bad output, ship what works. Perfection is the enemy of velocity.

---

## Key Quotes Summary

| Quote | Source |
|-------|--------|
| "Treat AI agents as 'slot machines for programmers'" | GitHub profile |
| "Ship beats perfect" | GitHub profile |
| "I ship code I never read" | X/Twitter, Pragmatic Engineer |
| "I was annoyed that it didn't exist, so I just prompted it into existence" | Lex Fridman podcast on OpenClaw |
| "Almost all MCPs should be CLIs" | "Just Talk To It" |
| "Still don't see how this could be moved to background agents" | "My Current AI Dev Workflow" |
| "Context is precious, don't waste it" | "My Current AI Dev Workflow" |
| "If they made shit, I just revert it" | "Slot Machines for Programmers" |
| "The amount of software I can create is now primarily limited by inference time and deep thinking" | "Shipping at Inference Speed" |

---

## Appendix: Complete Repo Inventory (Agent/MCP Related)

| Repo | Stars | Purpose |
|------|-------|---------|
| `openclaw/openclaw` | 250K+ | The AI that actually does things |
| `steipete/agent-rules` | -- | Rules for working with agents (archived Dec 2025) |
| `steipete/agent-scripts` | -- | Canonical AGENTS.MD + shared scripts |
| `steipete/claude-code-mcp` | -- | Agent-in-agent MCP server |
| `steipete/mcp-agentify` | -- | MCP orchestrator converting servers to agents |
| `steipete/Peekaboo` | -- | macOS screenshots + GUI automation |
| `steipete/mcporter` | -- | TypeScript MCP caller / CLI packager |
| `steipete/oracle` | -- | Cross-model consultation (GPT-5 Pro) |
| `steipete/tmuxwatch` | -- | TUI dashboard for tmux sessions |
| `steipete/CodexBar` | -- | Menu bar agent usage monitor |
| `steipete/macos-automator-mcp` | -- | macOS system automation |
| `steipete/conduit-mcp` | -- | File ops + web + data (legacy) |
| `steipete/Terminator` | -- | Terminal output capture (legacy) |
| `steipete/poltergeist` | -- | Hot reload / file watcher |
| `steipete/AXorcist` | -- | Swift UI automation |
| `amantus-ai/vibetunnel` | -- | Browser-based terminal access |

---

## Sources

- [steipete GitHub Profile README](https://github.com/steipete/steipete)
- [My Current AI Dev Workflow (Aug 2025)](https://steipete.me/posts/2025/optimal-ai-development-workflow)
- [Just Talk To It -- the no-bs Way of Agentic Engineering (Oct 2025)](https://steipete.me/posts/just-talk-to-it)
- [Shipping at Inference-Speed (Nov 2025)](https://steipete.me/posts/2025/shipping-at-inference-speed)
- [Slot Machines for Programmers (2025)](https://steipete.me/posts/2025/when-ai-meets-madness-peters-16-hour-days)
- [Claude Code Anonymous](https://steipete.me/posts/2025/claude-code-anonymous)
- [Just One More Prompt](https://steipete.me/posts/just-one-more-prompt)
- [OpenClaw, OpenAI and the future (Feb 2026)](https://steipete.me/posts/2026/openclaw)
- [Lex Fridman Podcast #491 -- OpenClaw](https://lexfridman.com/peter-steinberger/)
- [The Pragmatic Engineer -- "I ship code I don't read"](https://newsletter.pragmaticengineer.com/p/the-creator-of-clawd-i-ship-code)
- [OpenClaw -- Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [steipete/agent-rules (GitHub)](https://github.com/steipete/agent-rules)
- [steipete/agent-scripts AGENTS.MD](https://github.com/steipete/agent-scripts/blob/main/AGENTS.MD)
- [steipete/claude-code-mcp (GitHub)](https://github.com/steipete/claude-code-mcp)
- [steipete/mcp-agentify (GitHub)](https://github.com/steipete/mcp-agentify)
- [steipete MCP config (agent-rules)](https://github.com/steipete/agent-rules/blob/main/global-rules/steipete-mcps.md)
- [Fast Company -- 6 quotes from OpenClaw creator](https://www.fastcompany.com/91494326/openclaw-peter-steinberger-openai-meta-lex-fridman)
- [Simon Willison on "Just Talk To It"](https://simonwillison.net/2025/Oct/14/agentic-engineering/)
- [Greg Brockman sharing Shipping at Inference-Speed](https://x.com/gdb/status/2005543960010498389)
- [Fortune -- Who is OpenClaw creator Peter Steinberger?](https://fortune.com/2026/02/19/openclaw-who-is-peter-steinberger-openai-sam-altman-anthropic-moltbook/)
- [TechCrunch -- OpenClaw creator joins OpenAI](https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/)
- [Peekaboo MCP (GitHub)](https://github.com/steipete/Peekaboo)
