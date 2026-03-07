# Corporate Coding Agents: Google Jules & Amp Code

**Date:** 2026-03-05
**Research Focus:** Architecture, extensibility, multi-agent patterns, and lessons for custom harness design

---

## 1. Google Jules: Architecture & Multi-Step Task Handling

### Core Architecture

Jules operates on a **Perceive-Plan-Execute-Evaluate** loop. Each task runs inside a dedicated, sandboxed **Google Cloud VM (Ubuntu)**. The VM is ephemeral -- created fresh per task, destroyed on completion or failure. There are no persistent containers, shared volumes, or long-lived processes.

**Execution model:**
- Clones your repo into the sandboxed VM
- Understands full project context
- Carries out steps sequentially: shell commands, git diffs, package installation, code modification
- Tests changes and validates output
- Iterates the cycle until the task is completed
- Presents a plan, reasoning, and diff for review

**Powered by:** Gemini 2.5 Pro (and now Gemini 3 Pro rolling out in early 2026), with "advanced thinking capabilities" for plan development.

### Multi-Step Task Handling

You assign Jules a goal (e.g., "upgrade to Python 3.12", "add input validation", "fix integration tests") and Jules independently devises and executes a multi-step plan. Key characteristics:

- **Asynchronous operation** -- works in the background, you don't block
- **Multi-file handling** -- can make complex, multi-file changes
- **Concurrent tasks** -- parallel tasks execute in separate VMs
- **Web search** -- if it encounters an unknown library, it proactively searches documentation

### Control Modes

Jules offers four distinct modes:
1. **Start** -- executes immediately
2. **Review** -- generates a plan, waits for approval
3. **Interactive Plan** -- creates a detailed roadmap you can tweak before execution
4. **Schedule Task** -- executes at predefined times while you're away

### Self-Correction: The Critic Agent

Google introduced a **critic feature** (August 2025) that subjects all proposed changes to adversarial review at point of generation. This is "critic-augmented generation":

- One-shot evaluation of final output
- Flags subtle bugs, missed edge cases, inefficient code
- Jules replans in real-time based on critic feedback
- Iterative loop: critic reviews updated patch, continues flagging until clean
- Differentiated from linters -- judges code relative to user's context and intent, not preset rules

A **Planning Critic** (January 2026) extends this to auto-approved plans.

---

## 2. Jules: Open Source & Extensibility

### Is Jules Open Source?

**No.** Jules itself is a closed-source, cloud-hosted service. However, Google has opened up significant extensibility surfaces:

### Jules API

Full REST API at `https://julius.googleapis.com/v1alpha/`:
- **Create Session:** `POST /v1alpha/sessions` -- start a coding task with prompt, source context, optional automation mode
- **List Sessions:** `GET /v1alpha/sessions`
- **Send Message:** Provide feedback or additional instructions to an active session
- **Approve Plan:** Approve pending plans when `requirePlanApproval` was set

Authentication via API key (X-Goog-Api-Key header), generated in Jules web app settings.

### Jules Tools CLI

`npm install -g @google/jules` -- lightweight CLI companion:
- `jules remote list` -- list connected repos / active sessions
- Create remote sessions, delegate tasks
- Auto-infers repo from current working directory
- Authenticate via Google account

### Gemini CLI Extension

The Jules extension for Gemini CLI (`/jules` command) allows orchestrating Jules from within Gemini CLI. Jules acts as an autonomous sidekick, working asynchronously in the background while you continue in the terminal.

### MCP Support (February 2026)

Jules launched MCP Server support with initial integrations: **Linear, Stitch, Neon, Tinybird, Context7, Supabase**. Service connections are added in Settings and trigger MCP server tools when Jules detects the need.

**Community MCP servers** have also emerged:
- `savethepolarbears/jules-mcp-server` -- production-ready MCP server for Jules API
- `CodeAgentBridge/jules-mcp-server` -- unofficial MCP server
- `scarmonit-antigravity-jules-orchestration` -- autonomous orchestration combining Google Antigravity with Jules API

### Memory & Context

Jules has a **memory feature** that remembers preferences per repository, plus the ability to specify **environment variables** at the repository level.

---

## 3. Amp Code: Who Built It & Core Approach

### Origin

**Amp is built by Sourcegraph** (the code intelligence company). Launched as a research preview in May 2025, Amp has since **spun out as a standalone company** while retaining deep integration with Sourcegraph's code graph infrastructure.

### Philosophy: "The Coding Agent Is Dead"

Amp published a provocative manifesto: with the newest models, the agent wrapper is no longer the limiting factor. Amp is "killing the editor extensions" for VS Code and Cursor, unshackling models from the editor. The goal: let models write code and run even when you're not sitting in front of your editor.

### Core Architecture

- **Agentic coding tool** -- autonomous reasoning, comprehensive code editing, complex task execution
- **Multi-model:** Dynamically selects models based on task complexity. Defaults to Sonnet with 1M token window; switches to o3 or GPT-5 for heavy lifting; uses Gemini 3 for code review and image generation; GPT-5.2 for "the oracle"
- **Unconstrained token usage** -- no artificial token limits
- **Subagent parallelization** -- spawn multiple mini-instances for parallel work
- **Code intelligence backbone** from Sourcegraph's global code graph and search infrastructure

### Clients

- VS Code extension
- JetBrains IDEs
- Neovim
- CLI (`amp` command)
- **Headless mode** for programmatic use
- **SDK** (TypeScript via `@sourcegraph/amp-sdk`, Python SDK also available)

---

## 4. Corporate Agents vs. OSS Harnesses for Orchestration

### Corporate Advantages

| Aspect | Corporate (Jules/Amp) | OSS Harnesses (Conductor, Claude Squad, L-Thread) |
|--------|----------------------|---------------------------------------------------|
| **Sandboxing** | Cloud VMs per task (Jules), managed infra | DIY: tmux panes, git worktrees, Docker |
| **Model access** | Built-in multi-model routing | BYO keys, manual model selection |
| **Team features** | Thread sharing, leaderboards (Amp) | Not built-in, manual coordination |
| **Observability** | Thread Map (Amp), web UI (Jules) | State files, tmux capture, manual |
| **Scaling** | Cloud-native, parallel VMs | Machine-bound, resource-limited |
| **Recovery** | Ephemeral VMs = clean slate | Must build crash recovery (tmux, state) |
| **Cost** | Subscription/usage-based | Infrastructure + tokens only |
| **Customization** | API/SDK within boundaries | Full control, any pattern possible |
| **Governance** | Enterprise compliance (limited) | Roll your own |

### OSS Advantages

- **Full control** over orchestration patterns, agent lifecycle, state management
- **No vendor lock-in** -- swap models, tools, infrastructure freely
- **Custom multi-agent topologies** -- hierarchical, parallel, event-driven, anything
- **Local execution** -- no cloud dependency, data stays on your machine
- **Cost predictable** -- pay only for tokens, not platform fees

### The 2026 Trend

The industry is moving from single-agent sequential workflows to **hierarchical multi-agent orchestration**. Open-source frameworks provide flexibility but require internal expertise. Corporate platforms offer governance and support but constrain topology.

---

## 5. Multi-Agent Patterns in Jules & Amp

### Jules: Limited Multi-Agent

Jules does **not** natively support multi-agent orchestration in the traditional sense. Its multi-agent-like behavior comes from:

1. **Parallel task execution** -- separate VMs per task, but tasks are independent (no inter-agent communication)
2. **Critic agent** -- internal adversarial reviewer (actor-critic pattern)
3. **Gemini CLI orchestration** -- use Gemini CLI as an orchestrator to delegate multiple Jules tasks
4. **API-driven orchestration** -- build your own multi-agent coordinator using the Jules API

**Limitation:** No native agent-to-agent communication, no shared context between tasks, no hierarchical agent topology.

### Amp: Native Subagent Architecture

Amp has **first-class subagent support**:

- **Main agent spawns subagents** -- generic mini-instances with full tool access
- **Parallel execution** -- multiple subagents run simultaneously
- **Hub-and-spoke pattern** -- core thread spawns specialized spoke threads (refactoring, tests, docs)
- **Context isolation** -- subagents start fresh, no accumulated context from main thread
- **Summary consolidation** -- main agent receives only final summaries from subagents

**Common patterns:**
- One subagent handles code changes, another updates tests, a third generates docs
- Distributed refactoring across different modules in parallel
- Research tasks: separate subagents for query analysis, index review, configuration audit

**Limitations:**
- Subagents **cannot communicate with each other**
- You **cannot guide subagents mid-task**
- Subagents **start fresh** without conversation context
- Main agent receives **only final summary**, not intermediate state

### Amp Thread Map

Amp's **Thread Map** visualizes agent activity as a directed graph:
- Nodes represent threads, edges represent references/continuations/handoffs
- Top-down view of all connected threads
- Shows where effort is concentrated and where work overlaps
- CLI: `threads: map` command
- Helps manage complexity when running multiple agents in tandem

---

## 6. Agent Isolation, State Management, Recovery

### Jules: Isolation by Ephemeral VMs

- **Every task runs in a fresh Ubuntu VM** on Google Cloud
- **No persistent state** -- VM destroyed on completion/failure
- **No shared volumes** between tasks
- **Sandboxed execution** -- full-stack access within the VM, zero leakage to your local environment
- **GitHub as the state layer** -- all output flows back as branches/PRs/diffs

**Recovery model:** If a task fails, you start a new one. No crash recovery needed because there's nothing to recover -- the VM is already gone. Clean and simple, but no resumption capability.

### Amp: Thread-Based State

- **Threads are the unit of state** -- each thread maintains its own context
- **Thread sharing** -- threads can be shared with team members for review/continuation
- **Thread Map** provides visualization of thread relationships
- **No persistent VM** -- runs locally or in your environment
- **SDK streaming** -- `execute()` streams messages as agent works, enabling external state tracking

**Recovery model:** Thread state persists. You can revisit, continue, or fork threads. But subagents are ephemeral -- their work is only captured via final summary.

### Lessons for Custom Harnesses

| Pattern | Jules Approach | Amp Approach | Custom Harness Opportunity |
|---------|---------------|-------------|---------------------------|
| **Isolation** | Cloud VM per task | Thread-level isolation | Git worktrees + tmux panes (already in L-Thread) |
| **State** | Ephemeral (GitHub is state) | Thread persistence | JSON state files + git history |
| **Recovery** | None (start fresh) | Thread continuation | Tmux session recovery + state snapshots |
| **Clean slate** | Always (new VM) | Optional (fork thread) | Git stash/worktree reset |
| **Cost of failure** | Low (VM is cheap) | Low (new thread) | Low (new pane + worktree) |

---

## 7. MCP/Tool Integration

### Jules MCP Support

- **Native MCP server connections** since February 2026
- Initial servers: Linear, Stitch, Neon, Tinybird, Context7, Supabase
- Configured in Settings, auto-triggered when Jules detects need
- Jules API enables **building MCP servers that call Jules** (Jules-as-a-tool)
- Community ecosystem of third-party Jules MCP servers

### Amp MCP Support

Amp has **deep MCP integration** with a sophisticated loading strategy:

- **Lazy loading via Skills** -- MCP servers load only when a skill is invoked, not globally
- **SkillMCPServerSpec** -- extends base MCPServerSpec with `includeTools` glob patterns for selective tool exposure
- **Toolbox system** -- simpler alternative to MCP for custom tools. A directory of UNIX-style executables that describe themselves via stdout. Less complex than MCP, easier for the agent
- **Best practice: fewer tools is better** -- too many available tools degrades model performance. Bundle MCP servers in skills, use high-level tools with good descriptions

### Amp SDK for Tool Integration

```
npm install @sourcegraph/amp-sdk
```
- `MCPConfig` for defining MCP servers with commands, args, env vars
- `execute()` function with streaming for programmatic integration
- Python SDK also available

---

## 8. Limitations for Custom Orchestration

### Jules Limitations

1. **No native multi-agent orchestration** -- tasks are isolated, no inter-task communication
2. **Daily task caps** tied to plan tiers, non-pooled
3. **No local execution** -- must use Google Cloud VMs
4. **No persistent agent state** -- every task starts from scratch
5. **GitHub-only** for source integration (initially)
6. **Limited enterprise governance** documentation
7. **Ambiguous specs** or unfamiliar internal libraries increase iteration cycles
8. **Context window limits** with large codebases frustrate users
9. **No custom agent topology** -- you get Jules's fixed architecture
10. **No real-time steering** of long-running tasks (except message injection via API)

### Amp Limitations

1. **Subagents cannot communicate with each other** -- no lateral coordination
2. **Subagents start fresh** -- no context inheritance from parent thread
3. **Main agent gets only summary** from subagents -- no intermediate visibility
4. **Cannot guide subagents mid-task** -- fire-and-forget pattern
5. **Model costs** can be high with unconstrained token usage
6. **Thread Map is CLI-only** currently
7. **SDK consumes paid credits only** -- no free-tier SDK access
8. **Ad-supported free tier** may not suit all environments
9. **Sourcegraph dependency** for deep code intelligence features
10. **No hierarchical multi-agent** -- only hub-spoke with isolated spokes

---

## 9. Patterns Worth Stealing for a Custom Harness

### From Jules

1. **Critic-Augmented Generation** -- Run an adversarial review pass on every agent output before accepting. The critic judges against user intent, not just lint rules. Implementable as a post-execution validation agent in any harness.

2. **Ephemeral Clean-Slate Execution** -- Every task starts in a pristine environment. For a tmux/worktree harness: reset the worktree to a clean state before each agent task. Eliminates stale state bugs.

3. **Scheduled Tasks** -- Define recurring agent tasks (dependency updates, TODO scanning). A cron-like scheduler in the orchestrator that fires agents on schedule.

4. **Suggested Tasks / Proactive Scanning** -- Agent scans repo for improvements and presents suggestions. Could run as a background analysis agent that populates the orchestrator's backlog.

5. **Plan-Review-Execute Loop** -- Jules's four control modes (Start, Review, Interactive Plan, Schedule) are a clean UX pattern. An orchestrator could implement similar modes per-task.

6. **API-as-Orchestration-Primitive** -- Jules API's session/activity model (create session -> send messages -> approve plan -> get result) is a clean abstraction for any agent lifecycle.

### From Amp

7. **Subagent Parallelization with Summary Consolidation** -- Spawn parallel workers, collect summaries. The L-Thread orchestrator already does something similar, but Amp's pattern of "main agent only receives final summary" is a deliberate context-management strategy worth formalizing.

8. **Thread Map Visualization** -- Visual graph of agent relationships (references, continuations, handoffs). For a custom harness: generate a dependency graph of agent tasks from state JSON.

9. **Lazy MCP Loading via Skills** -- Don't load all tools globally. Define "skills" that bundle specific MCP servers, load on demand. Reduces context pollution.

10. **Toolbox Pattern** -- Simple UNIX executables as agent tools, lighter than MCP servers. Each tool is a script that describes itself and accepts input. Lower barrier than full MCP for custom tools.

11. **Thread Sharing & Team Visibility** -- Make agent work transparent to the team. State files + git history in a custom harness could serve a similar function.

12. **Dynamic Model Selection** -- Use different models for different tasks based on complexity. An orchestrator could route simple tasks to fast/cheap models and complex tasks to reasoning models.

13. **Hub-and-Spoke Thread Topology** -- Core thread as the coordination point, spoke threads for independent work. Spokes link only to the hub, keeping context windows lean.

---

## 10. User Feedback on Reliability for Multi-Agent Workflows

### Jules User Sentiment

**Positive:**
- Characterized as an "extremely capable junior developer" that saves teams time on tests, bug fixes, dependency updates
- Gemini 3 Pro brings "clearer reasoning, stronger intent alignment, noticeable lift in day-to-day reliability"
- Multi-step tasks "hold together more naturally" with latest models
- Good for routine, well-scoped tasks with clean diffs

**Negative:**
- Underwhelming on complex/ambiguous tasks
- Context window limits with large codebases
- Daily task caps cause workflow friction
- Not suitable for tasks requiring deep domain knowledge or unfamiliar libraries
- Still requires human oversight for correctness
- No multi-agent coordination means you're doing orchestration yourself via API

**Consensus:** Jules is reliable for **well-scoped, routine tasks** (bug fixes, test writing, dependency bumps, small features). It is not a multi-agent orchestration platform -- it's a single-agent task runner with a good API.

### Amp User Sentiment

**Positive:**
- "Better at coding than Claude Code MAX" according to some users
- Subagent parallelization praised for complex refactoring tasks
- Thread sharing improves team collaboration around agent work
- Thread Map helps manage complexity when running multiple agents
- Dynamic model selection appreciated for cost/quality balance

**Negative:**
- Subagent isolation means you can't steer mid-task
- Context loss between parent and subagents
- Subagents can't coordinate laterally
- Costs can be unpredictable with unconstrained token usage
- Thread Map is CLI-only, not ideal for visual thinkers in a team

**Consensus:** Amp is the more capable tool for **multi-agent-like workflows** thanks to subagent parallelization, but it's still limited to hub-spoke topology with no inter-agent communication. For true multi-agent orchestration, you need a custom harness.

---

## Summary: Strategic Takeaways for L-Thread Orchestrator

| Dimension | Jules | Amp | L-Thread Opportunity |
|-----------|-------|-----|---------------------|
| **Multi-agent** | API-driven only | Subagent parallel | Full topology control (hierarchical, lateral, event-driven) |
| **Agent communication** | None (isolated VMs) | Summary-only (no lateral) | Direct inter-agent messaging via tmux/state |
| **State management** | Ephemeral (GitHub) | Thread persistence | JSON state + git history + tmux recovery |
| **Recovery** | Start fresh | Thread continuation | Tmux session persistence + state snapshots |
| **Extensibility** | API + MCP | SDK + MCP + Toolbox | Full tool control + MCP + custom hooks |
| **Cost** | Subscription + caps | Free tier + pay-per-use | Tokens only |
| **Isolation** | Cloud VM | Thread-level | Git worktree + tmux pane |
| **Observation** | Web UI | Thread Map (CLI) | State JSON + potential visualization |

**The fundamental advantage of a custom harness remains:** full control over agent topology, inter-agent communication, state management, and recovery patterns. Corporate agents excel at single-agent task execution with nice UX, but they constrain multi-agent orchestration to their fixed patterns. For a Pi-based or local harness, the patterns worth stealing are: critic-augmented generation, lazy tool loading, scheduled/proactive tasks, thread visualization, and hub-spoke with summary consolidation.

---

## Sources

- [Jules - Proactive Coding Agent by Google](https://jules.google.com/)
- [Jules: Google's autonomous AI coding agent (Google Blog)](https://blog.google/technology/google-labs/jules/)
- [New ways to build with Jules: Jules Tools & Jules API](https://blog.google/technology/google-labs/jules-tools-jules-api/)
- [Jules API Documentation](https://developers.google.com/jules/api)
- [Jules API Reference: Sessions](https://jules.google/docs/api/reference/sessions/)
- [Meet Jules Tools: CLI Companion (Google Developers Blog)](https://developers.googleblog.com/en/meet-jules-tools-a-command-line-companion-for-googles-async-coding-agent/)
- [MCP support comes to Jules (Changelog Feb 2026)](https://jules.google/docs/changelog/2026-02-02)
- [Meet Jules' sharpest critic (Critic Agent)](https://developers.googleblog.com/meet-jules-sharpest-critic-and-most-valuable-ally/)
- [Introducing the Planning Critic for Auto-Approved Plans (Jan 2026)](https://jules.google/docs/changelog/2026-01-26-1/)
- [Building with Gemini 3 in Jules](https://developers.googleblog.com/jules-gemini-3/)
- [Jules proactive coding features](https://blog.google/technology/developers/jules-proactive-updates/)
- [Jules Gemini CLI Extension](https://github.com/gemini-cli-extensions/jules)
- [Master multi-tasking with Jules extension for Gemini CLI](https://cloud.google.com/blog/topics/developers-practitioners/master-multi-tasking-with-the-jules-extension-for-gemini-cli)
- [Amp Code](https://ampcode.com/)
- [Amp - an AI coding agent built by Sourcegraph](https://sourcegraph.com/amp)
- [Amp Code AI Review 2026 (Second Talent)](https://www.secondtalent.com/resources/amp-ai-review/)
- [The Coding Agent Is Dead (Amp)](https://ampcode.com/news/the-coding-agent-is-dead)
- [Agents for the Agent (Amp subagents)](https://ampcode.com/agents-for-the-agent)
- [Amp SDK Documentation](https://ampcode.com/manual/sdk)
- [Amp Thread Map](https://ampcode.com/news/thread-map)
- [Amp Agentic Code Review](https://ampcode.com/news/agentic-code-review)
- [Amp Free -- Agentic Coding for Free](https://ampcode.com/free)
- [Amp MCP Setup Guide (GitHub)](https://github.com/sourcegraph/amp-examples-and-guides/blob/main/guides/mcp/amp-mcp-setup-guide.md)
- [How to use subagents in AI coding with Amp (Medium)](https://medium.com/@matthewtanner91/how-to-use-subagents-in-ai-coding-with-amp-8b8418486782)
- [Amp vs Claude Code for Infra](https://elite-ai-assisted-coding.dev/p/amp-vs-claude-code-for-infra)
- [Conductors to Orchestrators: The Future of Agentic Coding (O'Reilly)](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)
- [AI Coding Agents in 2026: Coherence Through Orchestration (Mike Mason)](https://mikemason.ca/writing/ai-coding-agents-jan-2026/)
- [The Orchestrator Era: Why 2026 is the Year (Medium)](https://medium.com/codetodeploy/the-orchestrator-era-why-2026-is-the-year-agentic-coding-rewrites-the-sdlc-c1bf547df755)
