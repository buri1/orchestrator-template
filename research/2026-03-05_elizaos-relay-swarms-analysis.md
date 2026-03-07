# ElizaOS, AgentWorkforce Relay, Swarms, Pi Agent Rust, Gas Town OSS, and Jean: Multi-Agent Communication & Framework Patterns

**Research Date:** 2026-03-05
**Status:** Deep Research Complete
**Focus:** Multi-agent communication patterns, framework architectures, and orchestration strategies not covered by prior research agents

---

## Table of Contents

1. [ElizaOS (Eliza)](#1-elizaos-eliza)
2. [AgentWorkforce Relay](#2-agentworkforce-relay)
3. [Swarms](#3-swarms)
4. [Pi Agent Rust](#4-pi-agent-rust)
5. [Gas Town OSS](#5-gas-town-oss)
6. [Jean.build](#6-jeanbuild)
7. [Cross-Cutting Analysis: Communication Patterns](#7-cross-cutting-analysis-communication-patterns)
8. [Relevance to L-Thread Orchestrator](#8-relevance-to-l-thread-orchestrator)
9. [Sources](#9-sources)

---

## 1. ElizaOS (Eliza)

**Repository:** [github.com/elizaOS/eliza](https://github.com/elizaOS/eliza)
**Language:** TypeScript
**Tagline:** "Autonomous agents for everyone"
**ROSS Index Rank:** #14 (Runa Open Source Startup Index)

### 1.1 Architecture

ElizaOS is a full agent operating system, not just a framework. Its architecture is organized around several core abstractions:

- **Agent Runtime**: The central coordinator that manages database connections, plugin lifecycle, memory retrieval, and action dispatch. Each agent is an Agent Runtime instance.
- **Character Files**: JSON/YAML personality definitions that configure an agent's name, bio, system prompt, knowledge base, and behavioral constraints. This is the primary customization surface.
- **Providers**: Supply context to the agent at inference time (e.g., time provider, wallet provider, market data provider). They answer "what does the agent currently know?"
- **Actions**: Executable capabilities the agent can invoke (e.g., send a message, execute a trade, search the web). They answer "what can the agent do?"
- **Evaluators**: Post-action reflection hooks that assess whether an action succeeded, update memory, or trigger follow-up actions. They answer "did it work? what next?"

The intent processing pipeline integrates template-driven context building with platform-specific interaction managers. This means a single agent definition can operate across Discord, Telegram, Farcaster, and other platforms while maintaining consistent behavior.

### 1.2 Multi-Agent Capabilities

ElizaOS's multi-agent model is built on two spatial abstractions:

- **Worlds**: Analogous to a server or workspace. A World is a shared environment that can contain multiple agents. Each agent within a World maintains its own context but can observe and interact with others.
- **Rooms**: Analogous to channels or DM threads within a World. Rooms scope conversations and enable agents to have private or group interactions.

This Worlds/Rooms model enables:
- **Delegation**: Agent A can assign tasks to Agent B within a shared Room.
- **Consensus**: Multiple agents can deliberate in a group Room before taking action.
- **Load-balancing**: Work can be distributed across agents within a World based on specialization or availability.

The v2 architecture added Hierarchical Task Networks (HTN), allowing agents to decompose complex goals into smaller sub-tasks and adjust plans dynamically as new information arrives.

### 1.3 Plugin System

The plugin architecture is ElizaOS's most distinctive engineering choice. Every capability arrives as an npm plugin that can be hot-swapped at runtime:

- Model providers (OpenAI, Anthropic, Gemini, Llama, Grok)
- Vector stores for memory
- Social network connectors (Discord, Telegram, Farcaster)
- Custom actions, evaluators, and providers
- Blockchain integrations (unified wallet system in v2)

A plugin is a structured object with a name, description, and optional arrays of actions, evaluators, providers, and services. This keeps the core runtime lightweight (under 2,000 lines) while supporting arbitrary extension.

### 1.4 Strengths

- **Web3-native**: Designed from the ground up for blockchain interaction, DeFi, and token management. The v2 unified wallet system manages assets across multiple chains from a single interface.
- **Personality-first design**: Character Files make it trivial to spin up agents with distinct personas, knowledge bases, and behavioral rules.
- **Platform breadth**: Out-of-the-box connectors for Discord, Telegram, Farcaster, Twitter, and more. Few frameworks match this breadth.
- **Plugin hot-swap**: Runtime plugin loading means you can reconfigure an agent without restarting it.
- **Event-driven v2**: The v2 architecture moved to an event-driven model, which is more scalable than the v1 polling approach.
- **Large community**: Ranked #14 on the ROSS Index. Active development with hundreds of contributors.

### 1.5 Weaknesses

- **Web3 bias**: The framework's DNA is crypto/DeFi. Using it for general-purpose coding agent orchestration requires ignoring or stripping out blockchain-specific assumptions.
- **Not for coding agents**: ElizaOS is designed for chatbots, autonomous trading agents, and game NPCs. It has no concept of file editing, terminal access, or code review.
- **Complexity overhead**: The full Agent Runtime with memory, evaluators, and providers is heavyweight compared to minimalist harnesses like Pi.
- **No built-in coding tools**: No read/write/edit/bash primitives. You would need to build these as plugins.
- **Deployment requirements**: Requires Node.js, a database (PostgreSQL or SQLite), and potentially a vector store. Not a single-binary solution.

### 1.6 Comparison to Pi/L-Thread for Orchestration

ElizaOS and Pi/L-Thread solve fundamentally different problems. ElizaOS is an "agent operating system" for building personality-driven agents that interact with users across social platforms. Pi/L-Thread is a coding agent orchestrator that manages terminal-based agents working on codebases. The Worlds/Rooms abstraction is conceptually interesting for orchestration (mapping to workspaces and task channels), but the implementation is oriented toward chat, not code.

**Portable pattern**: The Worlds/Rooms spatial model for agent context isolation is worth studying. The L-Thread Orchestrator's concept of tmux sessions and panes maps loosely to Worlds and Rooms, but with terminal I/O instead of chat messages.

---

## 2. AgentWorkforce Relay

**Repository:** [github.com/AgentWorkforce/relay](https://github.com/AgentWorkforce/relay)
**Tagline:** "Real-time agent to agent communication"
**Key metric:** Sub-5ms latency

### 2.1 What It Is

AgentWorkforce Relay is a pure messaging layer for agent-to-agent communication. It is explicitly not a framework -- it does not manage agent lifecycle, define agent behavior, or impose any architectural constraints. If your agent can print to stdout, it can participate.

This is a critical distinction. Most multi-agent systems bundle communication with orchestration. Relay separates them, providing only the communication primitive and letting you bring your own orchestration logic.

### 2.2 Architecture

The system consists of three components:

1. **Relay Daemon**: A central hub process started with `agent-relay up`. All agent messages route through this daemon. It handles routing, presence tracking, and message delivery.
2. **Agent SDK**: A TypeScript/JavaScript SDK for programmatic integration.
3. **MCP Server (Relaycast)**: An MCP server that exposes relay capabilities as tools, allowing any MCP-compatible agent to participate without custom integration code.

The architecture also includes:
- **Next.js Dashboard Frontend**: A web UI for monitoring relay state.
- **Relay Visualizer**: An interactive visualization of the agent relay system.
- **Proxy Server**: Sits between agents and the relay daemon.

### 2.3 MCP Tool Interface

Once configured, agents get access to six MCP tools:

| Tool | Purpose |
|------|---------|
| `relay_send` | Send a message to another agent |
| `relay_inbox` | Check for incoming messages |
| `relay_who` | List currently connected agents |
| `relay_spawn` | Spawn a new agent in the relay network |
| `relay_release` | Release/disconnect an agent |
| `relay_status` | Check relay system status |

This is elegant. By exposing communication as MCP tools, Relay works with any agent that supports MCP: Claude Desktop, Claude Code, Cursor, VS Code, Windsurf, Zed, OpenCode, Gemini CLI, and Droid.

### 2.4 Communication Protocol

Agent communication flows through the Relaycast MCP server. The protocol is:
- **Transport**: The relay daemon handles message routing internally. The related Agent Relay Protocol (ARP) by offgrid-ing uses persistent WebSocket connections (WSS) with HPKE encryption and Ed25519 challenge-response authentication.
- **Latency**: Sub-5ms for message delivery between agents.
- **Topology**: Hub-and-spoke (all messages route through the daemon), but agents can address any other agent directly.

### 2.5 Significance for Multi-Agent Orchestration

Relay's approach is the most composable of any tool in this analysis. Because it provides only messaging, you can layer it on top of any orchestration pattern:

- **Sequential**: Agent A sends result to Agent B via `relay_send`.
- **Parallel**: Spawn N agents with `relay_spawn`, each checks `relay_inbox` for tasks.
- **Hierarchical**: A lead agent uses `relay_who` to discover workers, delegates via `relay_send`.
- **Peer-to-peer**: Any agent can message any other agent directly.

The key insight is that relay separates the communication concern from the orchestration concern. This is exactly what the L-Thread Orchestrator does with tmux (using terminal I/O as the communication layer), but Relay provides a higher-level, more structured alternative.

**Limitation**: Relay is young. The repository shows active development but the ecosystem is small. There is no built-in persistence, retry logic, or dead-letter handling. If the daemon goes down, messages are lost.

---

## 3. Swarms

**Repository:** [github.com/kyegomez/swarms](https://github.com/kyegomez/swarms)
**Website:** [swarms.ai](https://www.swarms.ai/)
**Creator:** Kye Gomez (@kyegomez)
**Stars:** 25K+ GitHub

### 3.1 Current State (March 2026)

Swarms has evolved from an open-source library into a full commercial platform with API-based pricing. The framework supports Python, Rust, and cloud-native deployments.

### 3.2 Pricing Model

Swarms now operates on a token-based pricing model:

| Tier | Input (per 1M tokens) | Output (per 1M tokens) | Notes |
|------|----------------------|------------------------|-------|
| Standard | $3.00 | $15.00 | Consistent performance |
| Flex | $1.50 | $7.50 | 50% cheaper, higher latency |
| Off-Peak | 50% discount on either tier | 50% discount | 8pm-6am California time |

Additional costs:
- **Per-agent fee**: $0.01 per agent (swarm completions only)
- **MCP calls**: $0.10 per call
- **Image processing**: $0.25 per image
- **On-premise license**: $9,999/year (full source, unlimited usage)

This pricing makes Swarms prohibitively expensive for continuous multi-agent orchestration. Running 10 agents for a full workday of coding would accumulate significant token and per-agent costs. The on-premise license at $9,999/year is reasonable for enterprises but absurd for individual developers or small teams.

### 3.3 Supported Topologies

Swarms provides the richest topology menu of any framework analyzed:

| Topology | Description | Best For |
|----------|-------------|----------|
| SequentialWorkflow | A -> B -> C (linear pipeline) | Ordered dependencies |
| ConcurrentWorkflow | A, B, C in parallel | Independent tasks |
| MixtureOfAgents | Parallel experts + aggregator | Multi-perspective synthesis |
| AgentRearrange | Einsum-inspired flow strings (e.g., "A->B,C") | Complex non-linear routing |
| GroupChat | Multi-way conversation | Debate, brainstorming |
| HierarchicalSwarm | Boss delegates to sub-agents | Top-down decomposition |
| Peer-to-Peer (P2P) | Direct agent connections | No fixed infrastructure |
| Hub-and-Spoke | Agents sync with planning hub | Enterprise guardrails |

The `SwarmRouter` abstraction lets you switch topologies with a single parameter change, which is a powerful design pattern.

### 3.4 The "Hidden Swarms" in Claude Code

Mike Kelly (@NicerInPerson) discovered and published an unlocked build of Claude Code that activates a hidden "Swarms" feature. In this mode:
- Claude Code becomes a **team lead** that plans, delegates, and synthesizes but does not write code directly.
- When you approve a plan, it enters **delegation mode** and spawns specialist workers.
- Workers share a **task board with dependencies**, work in parallel, and **message each other** to coordinate.

This is significant because it reveals that Anthropic is building swarm orchestration directly into Claude Code. The L-Thread Orchestrator essentially replicates this pattern manually using tmux sessions and prompt engineering.

### 3.5 Verdict: Worth the Cost?

For the L-Thread Orchestrator use case (coding agent orchestration), Swarms is not worth the cost. The topologies are interesting but can be implemented with prompt engineering and a messaging layer. The per-token, per-agent, per-MCP-call pricing model makes it economically irrational for continuous agent workflows. The open-source library remains useful for studying topology patterns, but the commercial platform adds cost without proportional value for coding workflows.

---

## 4. Pi Agent Rust

**Repository:** [github.com/Dicklesworthstone/pi_agent_rust](https://github.com/Dicklesworthstone/pi_agent_rust)
**Creator:** Jeffrey Emanuel (@doodlestein)
**Language:** Rust (zero unsafe code)
**Origin:** Rust port of Mario Zechner's Pi Agent, made with his blessing

### 4.1 What the Rust Version Adds

Pi Agent Rust is a from-scratch Rust reimplementation of the Pi coding agent. It is not a wrapper or binding -- it is a complete rewrite that takes advantage of Rust's performance and safety guarantees.

The project builds on two custom-built Rust libraries:

1. **asupersync**: A structured concurrency async runtime with built-in HTTP, TLS, and SQLite. This replaces Node.js's event loop and networking stack.
2. **rich_rust**: A Rust port of Will McGugan's Rich library for terminal output. Provides markup syntax for beautiful, structured terminal rendering.

### 4.2 Performance

The performance gains are substantial and measured in realistic end-to-end flows, not synthetic benchmarks:

| Metric | TypeScript Pi | Rust Pi |
|--------|--------------|---------|
| Startup time | 500ms+ (Node.js) | <100ms |
| Memory footprint | Higher, grows in long sessions | Dramatically smaller |
| Extension safety | Runtime errors possible | Compile-time guarantees |
| Binary | Requires Node.js runtime | Single static binary |

The project enforces `#![forbid(unsafe_code)]` project-wide, meaning every line of code passes through Rust's borrow checker and lifetime system. This eliminates entire categories of bugs (use-after-free, data races, null pointer dereferences) that can plague long-running agent sessions.

Release builds use LTO (Link-Time Optimization) + strip + `opt-level = 3` for maximum runtime performance.

### 4.3 Conformance

The Rust port maintains full compatibility with the original Pi agent:
- Vendored matrix conformance: **224/224 passed**
- Scenario suite conformance: **25/25 passed**
- Release-binary live-provider full run: **224/224 passed**

This means existing Pi extensions, skills, and workflows work identically on the Rust version.

### 4.4 Extension System

Pi Agent Rust supports two extension runtime families:

1. **JS/TS entrypoints**: Run without Node.js or Bun in an embedded QuickJS runtime. This is remarkable -- JavaScript extensions run inside the Rust binary via an embedded JS engine, eliminating the Node.js dependency.
2. **Native Rust descriptors**: `*.native.json` descriptors that run in a native Rust runtime for maximum performance.

Extensions can register: tools, slash commands, event hooks, flags, and custom providers.

### 4.5 Default Tools

Pi Agent Rust ships with 7 built-in tools (compared to Pi's original 4: read, write, edit, bash). The additional tools likely include search, glob, and terminal-related utilities.

### 4.6 MCP Support

Neither the original Pi nor Pi Agent Rust has built-in MCP support. The design philosophy is that MCP can be added as an extension rather than baked into the core. The `pi-mcp-adapter` project by nicobailon provides this bridge, allowing MCP servers to be used with Pi without burning the context window.

### 4.7 Significance

Pi Agent Rust demonstrates that a high-quality coding agent can be packaged as a single static binary with sub-100ms startup. For orchestration scenarios where you spawn many agents, this startup time improvement is meaningful -- spawning 20 agents saves 8+ seconds compared to Node.js-based agents. The memory efficiency is even more important: running 20 concurrent agents in Rust uses a fraction of the memory that 20 Node.js processes would consume.

---

## 5. Gas Town OSS

**Repository:** [github.com/steveyegge/gastown](https://github.com/steveyegge/gastown)
**Language:** Go
**Creator:** Steve Yegge
**Released:** January 1, 2026

### 5.1 From Blog Post to Open Source

Gas Town was previously known only through Steve Yegge's blog posts about multi-agent coding. On New Year's Day 2026, Yegge open-sourced the actual implementation. The code reveals the real architecture behind the philosophy.

Gas Town is installable via Homebrew, npm, or from Go source. The repository shows active development with PRs in March 2026 including plugin development and legacy code cleanup.

### 5.2 Architecture: The Town Metaphor

Gas Town uses an elaborate metaphor of a frontier town to structure its multi-agent system:

**Roles:**

| Role | Function | Analogy |
|------|----------|---------|
| **Mayor** | Top-level orchestrator. Full context about workspace, projects, and agents. Creates convoys, assigns work. | Project manager |
| **Polecats** | Worker agents. Each gets a git worktree and a task from Beads. Run until completion. | Developers |
| **Witness** | Observer agent that monitors workers, nudges stuck agents, escalates issues. | QA/supervisor |
| **Deacon** | Town-level health monitor. | SRE |
| **Refinery** | Handles merge operations. | Release engineer |

**Spatial organization:**

- **Town**: The top-level workspace. Contains the Mayor and Deacon.
- **Rigs**: Sub-workspaces within the Town. Each Rig owns its own Witness, Refinery, and Polecats.
- **HQ**: The Mayor's command center.

### 5.3 Beads: Git-Backed Issue Tracking

The most innovative aspect of Gas Town's implementation is the Beads system. "Bead" and "issue" are used interchangeably -- beads are the underlying data format, issues are the work items stored as beads.

Beads is a lightweight, Git-backed issue tracker that serves as external memory for agents:

- **Town-level beads** at `{{ .TownRoot }}/.beads/` with prefix `hq-*` for coordination.
- **Rig-level beads** at `<rig>/crew/*/.beads/` with project prefixes for task tracking.

Each bead is a structured data file tracked in Git. This means:
- Work state survives agent crashes (it is in Git, not in memory).
- Any agent can read any bead to understand system state.
- The full history of every task is preserved in Git history.

### 5.4 The Workflow

1. You tell the Mayor what to build.
2. The Mayor creates a **convoy** (a batch of related beads/tasks).
3. Beads are **slung** (assigned) to Polecat agents.
4. Each Polecat gets its own git worktree and works in isolation.
5. Polecats store work state in beads and report completion.
6. The Refinery handles merging completed work.

### 5.5 The GUPP Principle

"If there is work on your hook, YOU MUST RUN IT." This is Gas Town's rule for agent autonomy -- agents do not wait for permission to start work that has been assigned to them.

### 5.6 Dashboard and Monitoring

Gas Town includes a TUI dashboard (`gt feed`) that surfaces agents needing human intervention by analyzing structured beads data. There is also a web dashboard for monitoring workspace state.

### 5.7 Goosetown: The Block Fork

The Goose team at Block (Tyler Longwell) built **Goosetown**, a fork/reimplementation inspired by Gas Town. Goosetown uses Goose agents instead of Claude Code and operates on four components: skills (markdown instruction files), subagents, beads, and a `gtwall` (a monitoring wall). When given a task, the main agent breaks it into phases (research, build, review) and delegates to subagents.

### 5.8 Comparison to L-Thread Orchestrator

Gas Town and L-Thread share the same fundamental insight: multi-agent coding requires persistent state that survives agent crashes. Gas Town uses Beads (Git-backed files), L-Thread uses orchestrator-state.json (JSON files). Gas Town uses the Mayor/Polecat hierarchy, L-Thread uses the orchestrator/agent pattern via tmux or Claude Code teams.

Key differences:
- Gas Town is agent-agnostic by design (works with Claude Code, Goose, or others). L-Thread is currently tightly coupled to Claude Code.
- Gas Town's Beads are richer than L-Thread's state JSON -- they include full task history, dependencies, and metadata.
- Gas Town includes a Witness role for automatic stuck-agent detection. L-Thread relies on the orchestrator polling tmux panes.
- Gas Town's Refinery role for merge handling is more sophisticated than L-Thread's manual merge approach.

**Portable patterns**: The Beads system (Git-backed structured work state), the Witness role (automatic stuck-agent nudging), and the Refinery role (dedicated merge agent) are all patterns the L-Thread Orchestrator could adopt.

---

## 6. Jean.build

**Repository:** [github.com/coollabsio/jean](https://github.com/coollabsio/jean)
**Website:** [jean.build](https://jean.build/)
**Creator:** Andras Bacsai (creator of Coolify)
**Tagline:** "Your AI dev team, parallelized."

### 6.1 What It Is

Jean is a native desktop application for managing parallel AI coding agent sessions. It is not an agent framework or communication protocol -- it is a workspace manager that solves the practical problems of running multiple Claude Code instances simultaneously.

### 6.2 Tech Stack

Jean is built with:
- **Tauri v2**: Cross-platform desktop framework (Rust backend + web frontend)
- **React 19**: UI framework
- **Rust**: Backend logic, filesystem operations, git management
- **TypeScript**: Frontend logic
- **Tailwind CSS v4 + shadcn/ui v4**: Styling
- **Zustand v5**: State management
- **TanStack Query**: Data fetching
- **CodeMirror 6**: Code editing
- **xterm.js**: Terminal emulation

### 6.3 Core Features

**Project and Worktree Management:**
- Multi-project support with custom project avatars
- Automated git worktree creation, archiving, and restoration
- Each agent session gets its own isolated worktree
- No manual git commands needed for branch management

**Session Management:**
- Multiple sessions per worktree
- Execution modes: Plan, Build, Yolo
- Session archiving and recovery
- Auto-naming and canvas views

**GitHub Integration:**
- Context loading from GitHub issues and PRs
- Automated PR creation and code review
- Commit management

**Terminal Integration:**
- Embedded terminal per session (via xterm.js)
- Runs your local Claude CLI installation
- No vendor lock-in -- everything runs locally

### 6.4 Relationship to Coolify

Andras Bacsai, the creator of Coolify (self-hosted alternative to Vercel/Netlify), built Jean as a complement to his deployment infrastructure. The vision is a complete pipeline: develop with Jean (parallel agents) and deploy with Coolify (self-hosted PaaS). A Coolify MCP server connects Claude Code directly to Coolify instances, enabling agents to pull logs, diagnose issues, and redeploy services in under two minutes.

### 6.5 Significance for Multi-Agent Orchestration

Jean occupies a unique niche: it is not an orchestrator (no agent-to-agent communication), not a framework (no agent behavior definition), and not a protocol (no message format). It is a **workspace manager** -- a GUI layer on top of git worktrees and Claude CLI sessions.

This is exactly the layer that the L-Thread Orchestrator's tmux-based approach provides via the terminal. Jean packages the same concept (parallel isolated agent sessions) into a polished desktop application with visual management, session recovery, and GitHub integration.

**Key insight**: Jean validates the L-Thread Orchestrator's core architectural bet -- that parallel coding agents need isolated worktrees, persistent session state, and a coordination layer above the individual agents. Jean just provides the coordination via a GUI instead of a CLI orchestrator.

---

## 7. Cross-Cutting Analysis: Communication Patterns

### 7.1 Communication Topology Spectrum

The tools analyzed span a complete spectrum of multi-agent communication approaches:

```
Shared State           Message Passing          Structured Protocol
(implicit)             (explicit)               (formal)
    |                      |                         |
Gas Town Beads     AgentWorkforce Relay        Google A2A / MCP
L-Thread State     Relay MCP Tools             ElizaOS Worlds/Rooms
Jean Worktrees     Swarms GroupChat            Swarms SwarmRouter
```

### 7.2 Three Communication Paradigms

**Paradigm 1: Shared-State Communication (Gas Town, L-Thread, Jean)**
Agents communicate by reading and writing shared files. No explicit messages are exchanged. Instead, agents observe state changes made by other agents. This is simple, crash-resilient (state is on disk), and requires no communication infrastructure. The downside is that agents must poll for changes and there is no guaranteed delivery or ordering.

**Paradigm 2: Message-Passing Communication (Relay, Swarms GroupChat)**
Agents send explicit messages to each other through a relay or broker. This enables real-time coordination (sub-5ms with Relay) and supports complex interaction patterns (request-response, pub-sub, broadcast). The downside is the dependency on the relay daemon and the lack of persistence if the daemon crashes.

**Paradigm 3: Protocol-Based Communication (ElizaOS Worlds/Rooms, A2A)**
Agents communicate through a formal protocol with defined message types, discovery mechanisms, and capability negotiation. This enables heterogeneous agent ecosystems where agents from different vendors can interoperate. The downside is complexity and overhead.

### 7.3 The Convergence Pattern

A clear pattern emerges: the most effective multi-agent systems combine paradigms. Gas Town uses shared-state (Beads) for persistence plus implicit message-passing (the Mayor slinging beads to Polecats). The L-Thread Orchestrator uses shared-state (JSON files) plus terminal I/O (reading/writing tmux panes). The most resilient architecture would combine:

1. **Shared-state** for crash recovery and persistence (Beads or state JSON)
2. **Message-passing** for real-time coordination (Relay or tmux I/O)
3. **Protocol layer** for agent discovery and capability negotiation (MCP)

---

## 8. Relevance to L-Thread Orchestrator

### 8.1 Directly Adoptable Patterns

| Pattern | Source | How to Adopt |
|---------|--------|-------------|
| Beads (Git-backed task state) | Gas Town | Replace `orchestrator-state.json` with structured, per-task files in a `.beads/` directory. Track in Git for crash recovery and history. |
| Witness role (stuck-agent detection) | Gas Town | Add a periodic health-check agent that reads tmux pane output and nudges stuck agents. |
| MCP-based messaging | AgentWorkforce Relay | Add Relaycast MCP server to agent configs. Agents can then message each other via `relay_send`/`relay_inbox` without tmux hacks. |
| Execution modes (Plan/Build/Yolo) | Jean | Formalize the orchestrator's agent spawning with explicit mode flags that control agent autonomy levels. |
| Worktree isolation | Jean, Gas Town | Ensure each spawned agent operates in its own git worktree to prevent file conflicts. |

### 8.2 Patterns to Study But Not Adopt

| Pattern | Source | Why Not |
|---------|--------|---------|
| Worlds/Rooms | ElizaOS | Designed for chat agents, not coding agents. The abstraction does not map well to terminal-based workflows. |
| SwarmRouter topologies | Swarms | Interesting but over-engineered for 3-10 agent coding workflows. The L-Thread Orchestrator only needs sequential and parallel. |
| Token-based pricing | Swarms | Economically irrational for continuous agent orchestration. |
| Web3/blockchain plugins | ElizaOS | Not relevant to coding agent workflows. |

### 8.3 Strategic Observations

1. **Relay is the most interesting tool for L-Thread**. It provides exactly what the orchestrator needs: a lightweight, MCP-native messaging layer for agent-to-agent communication. It could replace or complement the tmux terminal-read/terminal-write approach with structured message passing.

2. **Pi Agent Rust validates the single-binary approach**. If the L-Thread Orchestrator ever needs its own agent runtime (rather than relying on Claude Code), a Rust implementation with embedded JS extension support is the right architecture. Sub-100ms startup and minimal memory footprint matter when spawning 10-20 agents.

3. **Gas Town's Beads system is the most mature work-state management system analyzed**. The L-Thread Orchestrator's `orchestrator-state.json` is functional but fragile. Moving to Git-backed, per-task state files would dramatically improve crash recovery and debugging.

4. **Jean validates the UX gap**. The fact that someone built an entire Tauri desktop app to manage parallel Claude Code sessions demonstrates that the terminal-based approach (tmux) has real usability costs. If the L-Thread Orchestrator gains users beyond its creator, a Jean-like GUI layer would significantly lower the barrier to entry.

5. **Claude Code's hidden Swarms feature** suggests that Anthropic is building native multi-agent orchestration into Claude Code. The L-Thread Orchestrator may eventually be superseded by first-party functionality -- but today, it provides capabilities that the hidden feature does not (persistence, crash recovery, state management, custom roles).

---

## 9. Sources

### ElizaOS
- [ElizaOS GitHub Repository](https://github.com/elizaOS/eliza)
- [ElizaOS Documentation](https://docs.elizaos.ai)
- [ElizaOS Official Website](https://elizaos.ai/)
- [ElizaOS v2: From a Meme AI Fund to a Full-Fledged Agent System](https://metalamp.io/magazine/article/elizaos-v2-from-a-meme-ai-fund-to-a-full-fledged-agent-system)
- [Eliza: A Web3 Friendly AI Agent Operating System (arXiv)](https://arxiv.org/html/2501.06781v1)
- [What Is Eliza AI Agent? Features, Pros, Cons, and Alternatives (Lindy)](https://www.lindy.ai/blog/eliza-ai-agent)
- [Transform Your Projects with Eliza: The Multi-Agent AI Framework (BlockyDevs)](https://www.blockydevs.com/blog/transform-your-projects-with-eliza-the-multi-agent-ai-framework)

### AgentWorkforce Relay
- [AgentWorkforce Relay GitHub Repository](https://github.com/AgentWorkforce/relay)
- [Relay README](https://github.com/AgentWorkforce/relay/blob/main/README.md)
- [Relay AGENTS.md](https://github.com/AgentWorkforce/relay/blob/main/AGENTS.md)
- [Relay Dashboard](https://github.com/AgentWorkforce/relay-dashboard)
- [Relay Visualizer](https://github.com/AgentWorkforce/relay-visualizer)
- [Agent Relay Protocol (ARP) - Alternative Implementation](https://github.com/offgrid-ing/arp)

### Swarms
- [Swarms Official Website](https://www.swarms.ai/)
- [Swarms GitHub Repository](https://github.com/kyegomez/swarms)
- [Swarms Pricing](https://www.swarms.ai/pricing)
- [Swarms API Pricing Documentation](https://docs.swarms.ai/docs/documentation/resources/pricing)
- [Swarm Architectures Documentation](https://docs.swarms.world/en/latest/swarms/concept/swarm_architectures/)
- [Mike Kelly (@NicerInPerson) - Claude Code Swarms Feature Unlock](https://x.com/NicerInPerson/status/2014989679796347375)
- [Claude Code Swarms Feature - Hacker News Discussion](https://news.ycombinator.com/item?id=46743908)

### Pi Agent Rust
- [Pi Agent Rust GitHub Repository](https://github.com/Dicklesworthstone/pi_agent_rust)
- [Pi Agent Rust on Lib.rs](https://lib.rs/crates/pi_agent_rust)
- [Jeffrey Emanuel Projects Page](https://jeffreyemanuel.com/projects)
- [Jeffrey Emanuel Announcement Tweet](https://x.com/doodlestein/status/2024526138102435934)
- [Pi Agent Rust on Hacker News](https://news.ycombinator.com/item?id=47146089)

### Gas Town OSS
- [Gas Town GitHub Repository](https://github.com/steveyegge/gastown)
- [Gas Town Explained: How to Use Goosetown (Block/Goose Blog)](https://block.github.io/goose/blog/2026/02/19/gastown-explained-goosetown/)
- [Welcome to Gas Town (Steve Yegge, Medium)](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [GasTown and the Two Kinds of Multi-Agent (Paddo.dev)](https://paddo.dev/blog/gastown-two-kinds-of-multi-agent/)
- [Gastown: When Your Dev Team Runs on Eventual Consistency (Medium)](https://medium.com/@jamiesonio/gastown-when-your-dev-team-runs-on-eventual-consistency-b400a1902a85)
- [Gas Town Docs](https://docs.gastownhall.ai/)
- [What Is Gastown? (TWiT.TV)](https://twit.tv/posts/tech/what-gastown-how-steve-yegges-ai-coding-agents-are-changing-software-development)

### Jean.build
- [Jean Official Website](https://jean.build/)
- [Jean GitHub Repository](https://github.com/coollabsio/jean)
- [Jean CLAUDE.md](https://github.com/coollabsio/jean/blob/main/CLAUDE.md)
- [Jean TUI Version](https://github.com/coollabsio/jean-tui)
- [Coolify v5 & Sovereign PaaS](https://criztec.com/coolify-v5-sovereign-paas-2026-s-post-heroku-j5sr/)
