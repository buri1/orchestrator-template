# Harness-Agnostic Orchestration Tools: A Comprehensive Research Survey

**Date:** 2026-03-05
**Scope:** Tools, protocols, and patterns that orchestrate coding agents regardless of the underlying agent harness
**Focus:** Practical vs. theoretical readiness for cross-harness orchestration

---

## 1. Executive Summary

The AI coding agent landscape in early 2026 is fragmenting across harnesses -- Claude Code, Pi, OpenCode, Cursor, Gemini CLI, Codex, Amp, Goose, Droid, and more. Each harness has its own CLI interface, configuration format, context model, and lifecycle semantics. The central question this document investigates: **can a single orchestration layer manage agents from any of these harnesses?**

The answer, as of March 2026, is a qualified yes -- but the approaches vary enormously in maturity, scope, and trade-offs. This survey covers the full spectrum: from production-ready tools like Vibe Kanban and AWS CLI Agent Orchestrator (CAO), through promising open-source projects like Overstory and agtx, to emerging protocol standards (A2A, ACP, Agent Protocol) and infrastructure-level efforts (Agentic AI Foundation). The document concludes with an assessment of what a truly harness-agnostic orchestrator would require and which approaches are closest to that goal.

---

## 2. The MCP Bridge Layer: BridgeMCP and Shared Memory

### 2.1 BridgeMCP

BridgeMCP is a Model Context Protocol server built by BridgeMind that transforms standard AI coding clients into connected, orchestratable teammates. It bridges local IDEs and terminals (Cursor, Claude Code, Windsurf) with the BridgeMind cloud platform, giving agents access to:

- **Shared memory:** A 50KB knowledge base per task, accessible by any connected agent regardless of harness.
- **Task orchestration:** Tasks move automatically from Todo to Done as agents work, providing a unified workflow surface.
- **Platform resources:** Real-time project context, prompt libraries, and cross-agent coordination tools.

BridgeMCP operates entirely locally, communicating with the BridgeMind API via encrypted channels using a secure API key. It officially supports Claude Code, Cursor, Windsurf, and the BridgeSpace desktop application -- but any MCP-compatible client can connect.

**Assessment:** BridgeMCP is **practical and shipping today**, but it is a commercial product (requires BridgeMind Pro subscription). Its cross-harness capability is limited to MCP-compatible clients. It treats shared memory as the coordination primitive, which sidesteps the harder problem of agent lifecycle management. The 50KB knowledge base per task is modest -- adequate for task context but insufficient for large-scale codebase reasoning. BridgeMCP is more of a "shared clipboard for agents" than a full orchestration engine.

### 2.2 The Broader MCP-as-Bridge Pattern

BridgeMCP is one instance of a broader pattern: using MCP servers as the universal adapter layer between agents and shared resources. Other projects in this space include:

- **Agent-MCP** (rinadelph/Agent-MCP): A framework for multi-agent systems that uses MCP to provide shared context, task management, and interaction visualization. It introduces the "Main Context Document" (MCD) as the primary mechanism for providing comprehensive project understanding to AI agents. The system automatically manages task dependencies and prevents conflicts.
- **Shared memory MCP servers** (e.g., Puliczek/mcp-memory, doobidoo/mcp-memory-service): Provide persistent memory layers accessible from any MCP-compatible client.
- **Context-Aware MCP (CA-MCP):** Recent research (January 2026) explores MCP servers that read from and write to shared context memory, allowing autonomous real-time coordination.

**Key insight:** MCP solves the "N x M" integration problem by reducing it to "N + M" -- any agent that speaks MCP can access any MCP server. However, MCP is a tool-access protocol, not an orchestration protocol. It handles "what tools can agents use?" but not "which agent should work on which task, when, and in what order?"

---

## 3. Overstory: Cross-Runtime Orchestration with SQLite Mail

Overstory (jayminwest/overstory) is arguably the purest expression of the harness-agnostic orchestration vision. It turns a single coding session into a multi-agent team with the following architecture:

### 3.1 Pluggable Runtime Adapters

The `AgentRuntime` interface (`src/runtimes/types.ts`) defines a contract that each runtime adapter must implement:
- **Spawning:** How to launch the agent process.
- **Config deployment:** How to inject task-specific configuration (CLAUDE.md, AGENTS.md, etc.).
- **Guard enforcement:** How to apply behavioral constraints.
- **Readiness detection:** How to know when the agent is ready to accept input.
- **Transcript parsing:** How to extract structured output from the agent's terminal stream.

Current adapters exist for Claude Code, Pi, and Gemini CLI, with the interface designed to accept any additional runtime.

### 3.2 SQLite Mail System

Inter-agent messaging uses a custom SQLite database in WAL (Write-Ahead Logging) mode, achieving approximately 1-5ms per query. The mail system supports:
- Typed protocol messages with structured payloads.
- Broadcast messages for fleet-wide coordination.
- Persistent message history for debugging and recovery.

WAL mode is critical: it allows one writer and multiple readers to operate concurrently without blocking, which is essential when multiple agents are reading/writing coordination state simultaneously.

### 3.3 Isolation and Merge

Each agent runs in an isolated git worktree via tmux. A FIFO merge queue with 4-tier conflict resolution handles merging agent branches back to canonical. A tiered watchdog system (Tier 0 mechanical daemon, Tier 1 AI-assisted triage, Tier 2 monitor agent) ensures fleet health.

**Assessment:** Overstory is the **most architecturally complete** harness-agnostic orchestrator in open source. The pluggable runtime adapter pattern is the right abstraction -- it acknowledges that different agent harnesses have fundamentally different lifecycle semantics and makes those differences explicit in the adapter contract. The SQLite mail system is an elegant choice: lightweight, zero-dependency, and battle-tested for concurrent access patterns.

However, Overstory comes with caveats: the project explicitly warns that "agent swarms are not a universal solution" and documents the compounding error rates, cost amplification, debugging complexity, and merge conflict challenges inherent in multi-agent orchestration. It is built with TypeScript/Bun and requires familiarity with tmux. The adapter ecosystem is still small (3 runtimes). **Practical but early-stage.**

---

## 4. Vibe Kanban: The Production-Ready Orchestrator

Vibe Kanban (BloopAI/vibe-kanban) has emerged as the de facto standard for multi-agent coding orchestration, with 9,400+ GitHub stars and broad agent support. It is the most mature harness-agnostic tool in this survey.

### 4.1 Architecture

- **Backend:** Rust workspace with crates for server, database (SQLx), executors, services, Git operations, API types, review tools, and deployment. Rust was chosen for file system management, child processes, WebSockets, and concurrency where performance and memory safety are needed.
- **Frontend:** TypeScript/React with type safety provided by `ts-rs` (deriving TypeScript types from Rust structs/enums).
- **Agent interface:** Kanban board surface where each card represents a task, each workspace gives an agent a branch, a terminal, and a dev server.

### 4.2 Agent Support

Vibe Kanban supports the widest range of agents of any tool surveyed: Claude Code, Codex, Gemini CLI, GitHub Copilot, Amp, Cursor, OpenCode, Droid, CCR, and Qwen Code. It functions as a "distributed control-plane, turning [agents] into a single, swappable, auditable workforce."

### 4.3 Worktree Isolation

Every agent runs in its own git worktree. Agents are unaware of each other's existence. Every execution happens inside a read-only worktree, with writes promoted only after human review. WebSocket streaming provides real-time visibility into agent logs.

### 4.4 Business Model

Free, open-source (Apache 2.0), backed by Y Combinator-funded BloopAI.

**Assessment:** Vibe Kanban is **the most production-ready** harness-agnostic orchestrator. Its Rust backend provides the performance and safety guarantees needed for managing multiple concurrent agent processes. The breadth of agent support (10+ harnesses) is unmatched. The Kanban metaphor provides an intuitive orchestration interface that doesn't require understanding tmux or terminal multiplexing.

Limitations: Vibe Kanban is task-board-oriented, not workflow-oriented. It excels at "give these N agents these N tasks and let them work in parallel" but does not natively support complex dependency graphs, conditional execution, or cross-agent communication during task execution. It is an orchestration surface, not an orchestration engine.

---

## 5. tmux-Based Orchestration: The Unix Philosophy Approach

tmux has become the dominant substrate for harness-agnostic orchestration because it provides something no protocol can: a universal interface to any terminal-based agent. If an agent runs in a terminal, tmux can manage it.

### 5.1 AWS CLI Agent Orchestrator (CAO)

AWS Labs' CLI Agent Orchestrator (awslabs/cli-agent-orchestrator) is a lightweight, supervisor-worker orchestration system built on tmux:

- **Hierarchical orchestration:** A supervisor agent coordinates workflow management and task delegation to specialized worker agents.
- **tmux isolation:** Each agent operates in isolated tmux sessions with proper context separation.
- **MCP coordination:** Agents communicate through MCP servers, enabling structured inter-agent messaging.
- **Orchestration patterns:** Supports Handoff (synchronous task transfer with wait-for-completion) and Assign (asynchronous task spawning for parallel execution).

CAO is agent-agnostic by design -- it works with Amazon Q Developer CLI, Claude Code, and any CLI-based agent.

### 5.2 agtx (Autonomous Multi-Session Orchestration)

agtx (fynnfluegge/agtx) takes the tmux approach further with spec-driven workflows:

- **Per-phase agent configuration:** Different agents can be assigned to different workflow phases (e.g., Gemini for planning, Claude for implementation, Codex for review).
- **Automatic agent switching:** When a task moves to a phase with a different agent configured, the current session is terminated and the new agent starts automatically in the same tmux window, with worktree, git state, and file changes preserved.
- **TOML-based plugin system:** All runtime behavior is derived from a declarative TOML config. Commands are written once in canonical format and translated automatically for every supported agent.
- **Kanban workflow:** Backlog/Research, Planning, Running, Review, Done -- with optional cyclic phases for multi-milestone plugins.

Supported agents: Claude Code, Codex, Gemini, OpenCode, and Copilot.

### 5.3 Agent Deck

Agent Deck (asheshgoplani/agent-deck) is a Go + Bubble Tea TUI that provides a unified session management surface:

- **Smart status detection:** Knows when an agent is thinking vs. waiting.
- **Conductor system:** Persistent Claude Code sessions that monitor and orchestrate all other sessions, auto-responding when confident and escalating when they cannot help.
- **Socket pooling:** Shares MCP processes across all sessions via Unix sockets, reducing MCP memory usage by 85-90%.
- **Docker sandboxing:** Optional isolated container execution.
- **Remote control:** Telegram and Slack integration for monitoring and intervention.

### 5.4 Named Tmux Manager (NTM)

NTM (Dicklesworthstone/ntm) supports YAML-defined workflows with pipelines that orchestrate agents, run commands, and manage dependencies across tmux panes.

### 5.5 Agent Conductor

Agent Conductor (gaurav-yadav/agent-conductor) provides CLI-first spinning up, coordinating, and supervising multi-terminal AI agents inside tmux sessions, with canned workflows and API-driven status relay.

**Assessment:** tmux-based orchestration is **the most practically accessible** approach to harness-agnostic orchestration. Every terminal-based coding agent (which is most of them in 2026) can be managed via tmux. The approach requires no protocol support from the agent itself -- you just need to be able to `send-keys` and `capture-pane`.

The trade-off is fragility. Parsing terminal output to determine agent state is inherently heuristic. Different agents have different prompt formats, progress indicators, and error patterns. The "readiness detection" problem (how do you know when the agent is ready for new input?) is unsolved in the general case and requires per-agent heuristics. But for practical orchestration today, tmux is the lowest-common-denominator that actually works.

---

## 6. Composio Agent Orchestrator: The Meta-Orchestrator

Composio's Agent Orchestrator (ComposioHQ/agent-orchestrator), open-sourced in February 2026, introduces a dual-layered architecture:

- **Planner layer:** An AI agent that reads the codebase, understands the backlog, decomposes features into parallelizable tasks, and assigns each to a coding agent.
- **Executor layer:** Each agent gets its own git worktree, branch, and PR. The orchestrator monitors progress, reads PRs, and makes decisions about next steps.

Key properties:
- **Agent-agnostic:** Claude Code, Codex, Aider.
- **Runtime-agnostic:** tmux, Docker.
- **Tracker-agnostic:** GitHub, Linear.
- **Self-improving:** Logs performance, tracks session outcomes, runs retrospectives, and adjusts future session management based on what worked.

**Assessment:** Composio's orchestrator is **the closest to a true meta-orchestrator** -- it treats the agent harness as a swappable plugin and focuses on the higher-order problem of task decomposition and workflow management. The self-improvement loop (observing what worked and adjusting) is a differentiator. However, the project is very new (February 2026) and the pluggability of the agent/runtime/tracker layers has not been battle-tested at scale.

---

## 7. Protocol Standards: The Interoperability Layer

### 7.1 Agent Protocol (agi-inc/agent-protocol)

Originally developed by the AI Engineer Foundation, the Agent Protocol is an OpenAPI-based specification that defines two essential routes:

- `POST /ap/v1/agent/tasks` -- Create a new task.
- `POST /ap/v1/agent/tasks/{task_id}/steps` -- Execute one step of a task.

Plus routes for listing tasks, steps, and managing artifacts. It is tech-stack-agnostic and works with any framework.

**Assessment:** The Agent Protocol is **the simplest and most widely referenced** interoperability standard. However, it is a task-execution protocol, not an orchestration protocol. It tells you how to talk to an individual agent, not how to coordinate multiple agents. Its adoption among coding agent harnesses specifically is limited -- most coding agents don't expose REST APIs.

### 7.2 Agent-to-Agent Protocol (A2A)

Originally developed by Google, donated to the Linux Foundation in June 2025, and now supported by AWS, Cisco, Microsoft, Salesforce, SAP, and ServiceNow (100+ companies total). Version 0.3 introduced gRPC support and security card signing.

A2A defines:
- **Agent Cards:** JSON metadata served at a well-known endpoint for agent discovery.
- **JSON-RPC 2.0 over HTTP(S):** Standardized communication format.
- **Capability negotiation:** Agents can discover what each other can do before delegating work.

**Assessment:** A2A is the **heavyweight standard** for enterprise agent interoperability. It is designed for a world where agents from different vendors need to discover and delegate to each other. However, A2A targets the enterprise agent ecosystem (cloud services, business workflows), not the coding agent orchestration problem specifically. Its utility for orchestrating Claude Code + Pi + OpenCode on a local machine is minimal -- it's designed for agents that are deployed as services, not agents running in terminals.

### 7.3 Agent Client Protocol (ACP)

Co-developed by JetBrains and Zed Industries, formalized in August 2025, ACP standardizes the interface between code editors and coding agents. It aims to be "the LSP for AI coding agents."

- **Registry:** The ACP Agent Registry (live since January 28, 2026) lists all verified compatible agents.
- **Compatible agents:** Kimi CLI (Moonshot AI), goose (Block), Augment Code.
- **Non-adopters:** Cursor does not support ACP as of March 2026.

**Assessment:** ACP is **directly relevant** to the harness-agnostic orchestration problem -- it standardizes the editor-to-agent interface, which is a prerequisite for building editor-agnostic orchestration. However, ACP targets the editor integration problem (how does an IDE talk to an agent?), not the orchestration problem (how do you coordinate multiple agents?). It is a building block, not a solution.

### 7.4 The Protocol Landscape Summary

| Protocol | Scope | Coding Agent Relevance | Maturity |
|----------|-------|----------------------|----------|
| Agent Protocol | Task execution for individual agents | Low (REST-based, agents don't expose APIs) | Moderate |
| A2A | Enterprise agent-to-agent communication | Low (cloud-service oriented) | High (Linux Foundation, 100+ companies) |
| ACP | Editor-to-agent interface | High (directly addresses IDE integration) | Growing (JetBrains, Zed backing) |
| MCP | Agent-to-tool interface | High (universal tool access) | High (AAIF, broad adoption) |

No single protocol solves the orchestration problem. The practical stack is: **MCP for tool access + ACP for editor integration + tmux/process management for lifecycle control + SQLite/shared memory for coordination state**.

---

## 8. The Configuration Layer: Bridle

Bridle (neiii/bridle) addresses a problem adjacent to orchestration: cross-harness configuration management. It is a TUI/CLI config manager that:

- Supports Amp, Claude Code, OpenCode, Goose, Copilot CLI, Crush, Droid.
- Manages profiles (work, personal, minimal) per harness.
- Auto-translates configuration formats, paths, namings, and schemas between harnesses.
- Installs skills, agents, commands, and MCPs from any GitHub repository, translating between formats automatically.

**Assessment:** Bridle is **essential infrastructure** for harness-agnostic orchestration. If you want to run the same project with different agents, you need their configurations to be semantically equivalent. Bridle solves this with a declarative approach. It's not an orchestrator, but an orchestrator that wants to be harness-agnostic will eventually need something like Bridle underneath.

---

## 9. The Institutional Layer: Agentic AI Foundation (AAIF)

In December 2025, the Linux Foundation announced the Agentic AI Foundation (AAIF), co-founded by Anthropic, Block, and OpenAI, with platinum members including AWS, Bloomberg, Cloudflare, Google, and Microsoft. The founding project contributions are:

- **Model Context Protocol (MCP)** -- from Anthropic.
- **goose** -- from Block (an open-source coding agent).
- **AGENTS.md** -- from OpenAI (configuration format used by 20,000+ open-source projects).

The AAIF aims to be a vendor-neutral home for open-source agentic AI projects, providing funding for community programs and research, and building open protocols for cross-builder interoperability.

**Assessment:** The AAIF is the **strongest signal** that the industry is converging on interoperability. Having Anthropic, OpenAI, and Block -- companies that compete on agent products -- agree to standardize under the Linux Foundation is unprecedented. However, the AAIF is an institutional framework, not a technology. The actual standards (MCP, AGENTS.md, goose) are building blocks that orchestrators will consume, not orchestration solutions themselves.

---

## 10. The Harness-Agnostic Dream: Is It Achievable?

### 10.1 What Would a Universal Orchestrator Need?

A truly harness-agnostic orchestrator would need to solve five problems:

1. **Agent lifecycle management:** Start, stop, restart, and health-check any agent regardless of harness. This requires either a pluggable adapter (Overstory's approach) or a universal substrate (tmux's approach).

2. **Task assignment and routing:** Decompose work into tasks and assign them to agents based on capability, cost, and availability. Composio's planner layer addresses this.

3. **Inter-agent communication:** Allow agents to share context, request help, and coordinate. Options: SQLite mail (Overstory), MCP servers (CAO), shared filesystem, or process-level IPC.

4. **Isolation and merge:** Prevent agents from stepping on each other's work. Git worktrees are the consensus solution (Vibe Kanban, Overstory, agtx all use them).

5. **Configuration normalization:** Ensure agents receive equivalent context regardless of harness. Bridle addresses this partially.

### 10.2 The Practical Answer

**For terminal-based agents (Claude Code, Pi, OpenCode, Gemini CLI, Codex, Amp, Goose):** Yes, harness-agnostic orchestration is achievable today. tmux provides the universal substrate. The adapter pattern (Overstory, agtx) handles per-harness differences. Git worktrees provide isolation. SQLite or MCP servers provide communication.

**For IDE-embedded agents (Cursor, Windsurf, GitHub Copilot in VS Code):** Much harder. These agents are deeply integrated with their host editors and don't expose clean terminal interfaces. ACP is the best hope for standardizing this interface, but adoption is limited and Cursor has not adopted it. Orchestrating Cursor agents from an external system requires workarounds (Chrome DevTools, programmatic editor control) that are fragile.

**For mixed fleets (some terminal, some IDE):** The hardest case. No existing tool handles this well. BridgeMCP comes closest by using MCP as the bridge, but it's limited to MCP-compatible clients and provides shared memory rather than true orchestration.

### 10.3 The Convergence Path

The most likely path to universal harness-agnostic orchestration is:

1. **AAIF standardizes the configuration layer** (AGENTS.md, MCP) -- already happening.
2. **ACP standardizes the editor-to-agent interface** -- underway but incomplete.
3. **The tmux adapter pattern becomes the default** for terminal agents -- already the consensus approach.
4. **A meta-orchestrator emerges** that consumes all three layers -- Composio's agent-orchestrator and Vibe Kanban are the leading candidates.

---

## 11. Comparative Analysis

| Tool | Harness Support | Orchestration Model | Communication | Isolation | Maturity | License |
|------|----------------|-------------------|---------------|-----------|----------|---------|
| **Vibe Kanban** | 10+ agents | Kanban task board | WebSocket logs | Git worktrees | Production | Apache 2.0 |
| **Overstory** | CC, Pi, Gemini | SQLite mail + watchdog | SQLite WAL | Git worktrees + tmux | Early | OSS |
| **CAO (AWS)** | Any CLI agent | Supervisor-worker | MCP servers | tmux sessions | Moderate | OSS |
| **agtx** | CC, Codex, Gemini, OpenCode, Copilot | Spec-driven workflow | Filesystem + tmux | Git worktrees + tmux | Early | OSS |
| **Composio** | CC, Codex, Aider | Dual-layer planner/executor | Git PRs | Git worktrees | Very early | OSS |
| **Agent Deck** | CC, Gemini, OpenCode, Codex+ | TUI session manager + conductor | MCP sockets | tmux + Docker | Moderate | OSS |
| **BridgeMCP** | CC, Cursor, Windsurf | Shared memory + tasks | MCP protocol | Per-task context | Production | Commercial |
| **Agent-MCP** | MCP-compatible | Knowledge graph + tasks | MCP + RAG | Task-level | Early | OSS |

---

## 12. Recommendations for the L-Thread Orchestrator Project

Given the L-Thread Orchestrator's existing architecture (tmux-based, CLAUDE.md-driven, state-file coordination), the following approaches are most relevant:

1. **Overstory's adapter pattern** is the closest architectural match. The `AgentRuntime` interface could be adopted or adapted to extend L-Thread's orchestrator beyond Claude Code to Pi, Gemini CLI, and others.

2. **agtx's TOML-based workflow plugins** offer a compelling model for declarative workflow definition with per-phase agent assignment. The "canonical command format translated automatically for every supported agent" pattern would eliminate the need for harness-specific command encoding in the orchestrator.

3. **Vibe Kanban** should be studied as the reference implementation for production-grade harness-agnostic orchestration. Its Rust backend and broad agent support represent the state of the art.

4. **Bridle** should be evaluated as a configuration normalization layer. If L-Thread wants to support agents beyond Claude Code, it will need to translate its CLAUDE.md-based context into equivalent formats for other harnesses.

5. **MCP as the communication substrate** is already part of L-Thread's architecture (Chrome DevTools MCP for E2E testing). Extending MCP usage to inter-agent communication (following CAO's pattern) would add cross-harness coordination without requiring new dependencies.

---

## 13. Conclusion

Harness-agnostic orchestration is no longer theoretical -- it is practical for terminal-based agents and becoming practical for IDE-embedded agents. The ecosystem has converged on a common set of primitives:

- **tmux** for universal agent lifecycle management.
- **Git worktrees** for agent isolation.
- **SQLite or MCP** for inter-agent communication.
- **Pluggable adapter interfaces** for per-harness differences.
- **AAIF/AGENTS.md/MCP** for configuration and tool standardization.

The remaining gaps are in IDE-embedded agent orchestration (waiting for ACP adoption), complex workflow orchestration (beyond simple task parallelism), and self-improving orchestration (only Composio addresses this). The tools surveyed here represent the state of the art as of March 2026 -- a landscape that is rapidly maturing from experimental projects into production infrastructure.

---

## Sources

- [BridgeMind MCP](https://www.bridgemind.ai/mcp)
- [BridgeMCP](https://www.bridgemind.ai/bridgemcp)
- [Overstory (jayminwest/overstory)](https://github.com/jayminwest/overstory)
- [Overstory Concurrency and WAL Mode](https://deepwiki.com/jayminwest/overstory/6.5-concurrency-and-wal-mode)
- [Vibe Kanban (BloopAI/vibe-kanban)](https://github.com/BloopAI/vibe-kanban)
- [Vibe Kanban Documentation](https://vibekanban.com/docs)
- [Vibe Kanban - VirtusLab Blog](https://virtuslab.com/blog/ai/vibe-kanban)
- [Agent Protocol (agi-inc)](https://github.com/agi-inc/agent-protocol)
- [Agent Protocol Website](https://agentprotocol.ai/)
- [LangChain Agent Protocol](https://github.com/langchain-ai/agent-protocol)
- [A2A Protocol](https://a2a-protocol.org/latest/)
- [A2A GitHub (a2aproject/A2A)](https://github.com/a2aproject/A2A)
- [Linux Foundation A2A Announcement](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [Google Cloud Donates A2A](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/)
- [Agent Client Protocol (ACP)](https://github.com/agentclientprotocol/agent-client-protocol)
- [ACP Introduction (Block/Goose Blog)](https://block.github.io/goose/blog/2025/10/24/intro-to-agent-client-protocol-acp/)
- [Zed ACP Support](https://zed.dev/acp)
- [JetBrains ACP Documentation](https://www.jetbrains.com/help/ai-assistant/acp.html)
- [AWS CLI Agent Orchestrator (CAO)](https://github.com/awslabs/cli-agent-orchestrator)
- [AWS CAO Blog Post](https://aws.amazon.com/blogs/opensource/introducing-cli-agent-orchestrator-transforming-developer-cli-tools-into-a-multi-agent-powerhouse/)
- [agtx (fynnfluegge/agtx)](https://github.com/fynnfluegge/agtx)
- [Agent Deck (asheshgoplani/agent-deck)](https://github.com/asheshgoplani/agent-deck)
- [Named Tmux Manager (NTM)](https://github.com/Dicklesworthstone/ntm)
- [Composio Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Composio Open Sources Agent Orchestrator - MarkTechPost](https://www.marktechpost.com/2026/02/23/composio-open-sources-agent-orchestrator-to-help-ai-developers-build-scalable-multi-agent-workflows-beyond-the-traditional-react-loops/)
- [Bridle (neiii/bridle)](https://github.com/neiii/bridle)
- [Agent-MCP (rinadelph/Agent-MCP)](https://github.com/rinadelph/Agent-MCP)
- [Ruflo (ruvnet/ruflo)](https://github.com/ruvnet/ruflo)
- [Agentic AI Foundation (AAIF) - Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [Anthropic AAIF Announcement](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)
- [OpenAI AAIF Announcement](https://openai.com/index/agentic-ai-foundation/)
- [Block AAIF Announcement](https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation)
- [Shared Memory as Missing Layer - VentureBeat](https://venturebeat.com/orchestration/shared-memory-is-the-missing-layer-in-ai-orchestration/)
- [MCP vs A2A Protocols - OneReach](https://onereach.ai/blog/guide-choosing-mcp-vs-a2a-protocols/)
- [Survey of Agent Interoperability Protocols - arXiv](https://arxiv.org/html/2505.02279v1)
- [Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode)
- [Agent Conductor](https://github.com/gaurav-yadav/agent-conductor)
