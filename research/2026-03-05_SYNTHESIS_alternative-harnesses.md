# Synthesis: Alternative Harnesses & Orchestration Tools

**Date:** 2026-03-05
**Sources:** 5 deep-research documents covering OpenCode, OSS harnesses, harness-agnostic tools, Claude Agent SDK, and workflow engines.

---

## 1. The Alternative Harness Landscape

The open-source coding agent space has matured into a competitive field with at least seven viable alternatives to Claude Code (referred to as "Pi" in earlier project terminology). Each occupies a distinct architectural niche:

- **OpenCode** (SST/Anomaly) -- 100K+ stars, 650K MAU. Hybrid Go/TypeScript/Zig runtime with HTTP+SSE server, TypeScript SDK, native TaskTool for subagent delegation, and event-bus-driven multi-agent Teams. The most complete open-source platform.
- **Goose** (Block) -- 27K stars, Rust-based, fully MCP-native. Six extension types (built-in, stdio, SSE, InlinePython, WASM, frontend). Goosetown multi-agent layer with Town Wall coordination and Beads crash recovery. Donated to Linux Foundation's AAIF.
- **Aider** -- 30K+ stars, Python. Git-native (every edit auto-committed), tree-sitter repo map with PageRank for context selection, Architect mode (two-model planning/editing pipeline). No multi-agent support; purely single-agent.
- **Cline CLI 2.0** -- 5M+ VS Code installs, now decoupled into Cline Core (headless gRPC API) + CLI. Parallel isolated instances, JSON streaming, headless mode. Provides building blocks, not a built-in orchestrator.
- **Codex CLI** (OpenAI) -- Rust, 1M+ users. App Server protocol (bidirectional JSON-RPC over stdio), native multi-agent spawning, git worktree isolation per agent, Agents SDK integration. The most production-ready multi-agent system, but OpenAI-model-centric.
- **Roo Code** -- VS Code extension with built-in Orchestrator mode and Boomerang Tasks (hierarchical subtask delegation with mode-scoped tool permissions). Best in-IDE orchestration, but no headless/CLI mode.
- **Claude Agent SDK** -- Anthropic's official framework. Extracts Claude Code's runtime into an embeddable SDK with typed subagent definitions, lifecycle hooks (PreToolUse, PreCompact, etc.), MCP tool registration, and parallel subagent execution. Claude-only by design.

---

## 2. Orchestration Suitability Verdicts

**OpenCode:** The strongest open-source orchestration *platform*. Its HTTP server + TypeScript SDK + event bus means you can build a meta-orchestrator that drives OpenCode sessions via proper API calls instead of terminal emulation. Multi-model Teams (Claude for reasoning, GPT for speed, Gemini for long context) is a unique differentiator. The main risk is permission propagation bugs in nested subagents -- a problem they have been fighting for months.

**Goose:** The strongest competitor for *self-contained* orchestration. MCP-native extensibility means any MCP server becomes a tool for any Goosetown delegate. Beads (git-backed crash recovery) is production-grade durability that most competitors lack. The Rust codebase raises the contribution barrier, but InlinePython and WASM extensions mitigate this. Best choice for model-agnostic, crash-recoverable multi-agent work.

**Aider:** Not an orchestrator, but the best *agent runtime* to wrap inside one. Its Python API, `--message` batch mode, and `--yes` auto-accept make it the easiest harness to script. Multiple external orchestrators (Composio, Overstory) already use Aider as a backend. The tree-sitter repo map is unmatched for codebase-aware context injection.

**Cline CLI 2.0:** The best *programmatic building block* for custom orchestrators. The gRPC API with Protocol Buffers is the cleanest programmatic interface in the ecosystem -- network-capable, typed, and surface-agnostic. But you must build all orchestration logic yourself; Cline provides primitives, not policies.

**Codex CLI:** The most *production-ready* multi-agent coding system. The App Server protocol is the most mature agent-surface decoupling available. Native worktree isolation solves parallel-agents-same-repo. The decisive limitation is OpenAI model lock-in -- while technically protocol-agnostic, the practical experience is tuned for GPT-5.x.

**Roo Code:** The most mature *in-IDE* orchestration (Modes + Boomerang Tasks). The Orchestrator mode with scoped tool permissions per specialist mode is the right abstraction for interactive IDE workflows. Fatal limitation: no headless/CLI operation, no external API -- unusable as an orchestration substrate for custom systems.

**Claude Agent SDK:** The path of least resistance for Claude-committed teams. Typed `AgentDefinition` objects, automatic delegation, lifecycle hooks, and session persistence replace tmux scaffolding with proper API abstractions. The strict hierarchy (no subagent-of-subagent) is a design constraint, not a limitation -- it prevents runaway delegation. The trade-off is total Claude lock-in and loss of terminal-level visibility into agent work.

---

## 3. Harness-Agnostic Tools

Four cross-harness tools stand out:

**Vibe Kanban** (BloopAI, 9.4K stars) -- The most production-ready harness-agnostic orchestrator. Rust backend, supports 10+ agents (Claude Code, Codex, Gemini, OpenCode, Amp, Cursor, etc.). Each agent gets a git worktree, a branch, a terminal, and a dev server. Kanban board as the orchestration surface. Limitation: task-board-oriented, not workflow-oriented -- no dependency graphs, no conditional execution, no inter-agent communication during task execution.

**Overstory** (jayminwest) -- The purest expression of the adapter pattern. Pluggable `AgentRuntime` interface with adapters for Claude Code, Pi, and Gemini CLI. SQLite WAL-mode mail system for inter-agent messaging (~1-5ms per query). FIFO merge queue with 4-tier conflict resolution. Tiered watchdog system. The most architecturally complete open-source solution, but early-stage with only 3 runtime adapters.

**agtx** (fynnfluegge) -- Spec-driven workflows with per-phase agent assignment. TOML-based plugins with canonical command format auto-translated for every supported agent. Supports cyclic phases for multi-milestone work. Enables mixing agents across workflow phases (Gemini for planning, Claude for implementation, Codex for review) -- a pattern no single-harness tool can match.

**Bridle** (neiii) -- Configuration normalization across harnesses. Auto-translates configuration formats, paths, schemas between Amp, Claude Code, OpenCode, Goose, Copilot CLI, Crush, and Droid. Installs skills, agents, commands, and MCPs from any GitHub repository, translating between formats. Not an orchestrator, but essential infrastructure for any orchestrator that wants to be harness-agnostic.

Additional tools worth noting: **AWS CLI Agent Orchestrator (CAO)** provides supervisor-worker orchestration over tmux with MCP coordination; **Composio Agent Orchestrator** introduces a self-improving dual-layer planner/executor that adjusts future strategies based on observed outcomes; **Agent Deck** offers socket-pooled MCP sharing (85-90% memory reduction) with remote control via Telegram/Slack.

---

## 4. Workflow Engines: When You Need Them

The research identifies a clear tiering:

**You do NOT need a workflow engine when:** Orchestration is local, agents are short-lived, failure is recoverable by restarting, and the state fits in a JSON file. The L-Thread approach (JSON state files + tmux) is sufficient for 2-5 agent workshops with human oversight.

**You need SQLite-backed state when:** You want ACID transactions (no corrupted state on crash), queryable agent history, and single-file deployment. SQLite with WAL mode is the natural evolution from JSON files -- proven on everything from Raspberry Pi to enterprise systems. DBOS demonstrates that Temporal-grade durability can be achieved as a library using SQLite, not a server.

**You need a full workflow engine when:** Agents run for hours or days, financial or compliance guarantees are required, or workflows span multiple machines. Temporal provides true replay-based crash recovery (not checkpoint-restart) but requires heavy infrastructure. Inngest AgentKit offers event-driven TypeScript-native orchestration with dynamic state-based routing. LangGraph provides graph-based stateful orchestration with multiple checkpointer backends but has documented brittleness at scale.

**You specifically do NOT need:** Airflow (DAG-first architecture fundamentally conflicts with runtime-decided agent workflows), CrewAI/AutoGen (solve internal agent logic, not external agent coordination), or Prefect/n8n (too infrastructure-heavy for edge/local deployment).

---

## 5. The Convergence Pattern

All enterprise and production-grade systems are converging on the same five-layer architecture:

1. **Protocol decoupling** -- Agent logic separated from client surfaces via a stable API (Codex App Server, Cline Core gRPC, OpenCode HTTP+SSE). Agents become addressable services, not terminal processes.
2. **MCP as the tool lingua franca** -- Every serious agent now supports MCP. The AAIF (Anthropic + OpenAI + Block under Linux Foundation) cements this as the universal tool-access protocol.
3. **Git worktrees for isolation** -- One worktree per agent is the consensus pattern for parallel work on the same repository. Adopted by Vibe Kanban, Overstory, agtx, Codex CLI.
4. **Event-driven coordination** -- File-based polling (Claude Code Teams v1) is being replaced by event buses (OpenCode), SSE streams (OpenCode SDK), SQLite mail (Overstory), or MCP-mediated messaging (CAO).
5. **Deterministic routing with LLM fallback** -- The winning orchestrators use code-defined routing (YAML pipelines, state machines, TOML specs) for predictable coordination, reserving LLM-driven delegation for ambiguous cases only.

The pattern that is NOT converging: **model lock-in**. The industry is splitting between model-locked ecosystems (Claude Agent SDK, Codex CLI) and model-agnostic platforms (OpenCode, Goose, Pi). The AAIF may eventually bridge this, but as of March 2026, choosing a harness still implies choosing a model ecosystem.

---

## 6. Why Claude Code Still Wins (Or Doesn't)

**Where Claude Code / Claude Agent SDK wins:**

- **Deepest Claude integration.** If Claude is your model, nothing else provides the same runtime optimization -- 10K-token system prompt tuned for Claude's strengths, built-in tools calibrated to Claude's tool-calling behavior, session compaction tuned to Claude's context window semantics.
- **Battle-tested runtime.** The Agent SDK extracts Anthropic's own internal production system. The hooks (PreCompact, PostToolUse), session persistence, and subagent lifecycle are proven at scale inside Anthropic.
- **Simplest path from current state.** The L-Thread Orchestrator already uses Claude Code as subprocess via tmux. Migrating to the Agent SDK replaces tmux scaffolding with typed APIs while keeping the same model.

**Where Claude Code loses:**

- **Model lock-in is strategic risk.** Every competitor supports 75+ models. Claude Code supports exactly one family. If Claude falls behind on a specific capability (vision, long context, cost), you cannot route around it.
- **OpenCode has more orchestration surface area.** HTTP server + SDK + event bus + plugin ecosystem vs. Claude Code's subprocess + hooks + MCP. OpenCode's architecture is inherently more composable.
- **Community orchestration is richer elsewhere.** oh-my-opencode (46 hooks, 26 tools), swarm-tools (40+ coordination tools), opencode-swarm (9 specialists) -- this community-built orchestration ecosystem does not exist at the same scale for Claude Code.
- **Terminal emulation is a dead end.** The industry is moving from `tmux send-keys` to HTTP APIs and gRPC. Claude Code's `--print` and `stream-json` modes are steps in this direction, but the Agent SDK still shells out to the Claude CLI binary underneath.

**The honest verdict:** For the L-Thread Orchestrator's specific needs (2-5 agents, tmux-based, human-in-the-loop, Claude-committed), Claude Code remains the pragmatic choice. The Agent SDK is the recommended evolution path -- it replaces tmux scaffolding with proper APIs while keeping full Claude capability. But if model agnosticism becomes important, OpenCode's SDK or Goose's MCP-native architecture are the strongest alternatives.

---

## 7. Patterns to Steal

Regardless of which harness you choose, these patterns from the research should be adopted:

| Source | Pattern | What to Steal |
|--------|---------|---------------|
| **OpenCode** | HTTP+SSE as transport | Replace terminal emulation with structured event streams. Agents should be driven by APIs, not by `tmux send-keys`. |
| **Goose** | Beads crash recovery | Git-backed atomic work units with status tracking. If a session crashes, the next agent picks up the Bead. Directly applicable to L-Thread's state files. |
| **Aider** | Tree-sitter repo map | PageRank-weighted symbol extraction for context injection. Ensures agents always have the most relevant codebase overview within a token budget. |
| **Codex CLI** | Git worktree per agent | Eliminates file-level conflicts between parallel agents. Trivial to implement: `git worktree add`. Already adopted by Vibe Kanban, Overstory, agtx. |
| **Roo Code** | Mode-scoped tool permissions | Each specialist agent gets only the tools appropriate for its role. Prevents a "reviewer" agent from editing code or a "planner" from running bash. |
| **Cline** | gRPC protocol decoupling | Separate agent logic from client surface. Enables multiple frontends, network-distributed orchestration, and typed programmatic control. |
| **Claude Agent SDK** | PreCompact hooks | Intercept context compaction to preserve critical state (function signatures, security findings, orchestration references). Prevents context amnesia. |
| **Overstory** | Pluggable runtime adapters | Explicit `AgentRuntime` interface that acknowledges per-harness lifecycle differences. The right abstraction for future harness-agnostic expansion. |
| **Gas Town MEOW** | JSONL write-ahead log | Append state changes to JSONL before modifying the main state file. Provides crash recovery without adding dependencies. Directly applicable to `orchestrator-state.json`. |
| **agtx** | Per-phase agent mixing | Assign different agents to different workflow phases (Gemini for planning, Claude for implementation). A single TOML config with canonical commands auto-translated per agent. |

---

## Bottom Line

The landscape has matured enough that there is no single "best" harness -- there is a best harness *for your constraints*. For Claude-committed, local-first, human-in-the-loop orchestration, the Claude Agent SDK is the recommended evolution from the current tmux-based approach. For model-agnostic or large-scale multi-agent work, OpenCode's SDK or Goose's Goosetown are the frontrunners. For custom orchestration where you want full control, Cline CLI 2.0's gRPC API is the cleanest building block.

The immediate, zero-cost improvements regardless of harness choice: (1) add JSONL write-ahead logging for crash recovery, (2) adopt git worktrees for agent isolation, and (3) scope tool permissions per agent role.
