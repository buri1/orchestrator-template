# Harness-Agnostic Orchestration Tools

> **Comprehensive survey of tools, protocols, and patterns that orchestrate coding agents regardless of underlying agent harness — from MCP bridges and Vibe Kanban to tmux-based adapters and protocol standards.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | research/2026-03-05_harness-agnostic-orchestration-tools.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

The AI coding agent landscape in early 2026 is fragmenting across 10+ harnesses (Claude Code, Pi, OpenCode, Cursor, Gemini CLI, Codex, Amp, Goose, Droid, and more), each with its own CLI interface, configuration format, context model, and lifecycle semantics. This document surveys the full spectrum of approaches to building a single orchestration layer that can manage agents from any harness — from production-ready tools like Vibe Kanban (9,400+ stars, 10+ agent support) and AWS CLI Agent Orchestrator, through promising open-source projects like Overstory and agtx, to emerging protocol standards (A2A, ACP, Agent Protocol) and institutional efforts (AAIF).

The answer is a qualified yes for terminal-based agents — tmux provides a universal substrate, git worktrees provide isolation, and pluggable adapter interfaces handle per-harness differences. For IDE-embedded agents (Cursor, Windsurf), the problem is much harder and awaits ACP adoption. No single protocol solves orchestration; the practical stack is MCP for tool access + ACP for editor integration + tmux for lifecycle control + SQLite/shared memory for coordination state.

The ecosystem has converged on five primitives: tmux for universal agent lifecycle management, git worktrees for isolation, SQLite or MCP for inter-agent communication, pluggable adapter interfaces for per-harness differences, and AAIF/AGENTS.md/MCP for configuration standardization.

---

## Key Findings

### MCP Bridge Layer

- **BridgeMCP** (BridgeMind): Commercial product providing 50KB shared knowledge base per task across MCP-compatible clients (Claude Code, Cursor, Windsurf). Practical but limited — more "shared clipboard for agents" than full orchestration engine.
- **Agent-MCP** (rinadelph): Multi-agent framework using Main Context Documents (MCDs) with automatic task dependency management and conflict prevention.
- **Key insight**: MCP solves the "N x M" integration problem (reducing to "N + M") but is a tool-access protocol, not an orchestration protocol. It handles "what tools can agents use?" but not "which agent should work on which task, when, and in what order?"

### Production-Ready Orchestrators

- **Vibe Kanban** (BloopAI, 9,400+ stars): Most mature harness-agnostic orchestrator. Rust backend, 10+ agent support, git worktree isolation, WebSocket streaming. Apache 2.0. Limitation: task-board oriented, not workflow-oriented — no native dependency graphs or cross-agent communication during execution.
- **Overstory** (jayminwest): Most architecturally complete OSS orchestrator. Pluggable `AgentRuntime` adapter interface (Claude Code, Pi, Gemini CLI), SQLite WAL mail system (~1-5ms queries), FIFO merge queue with 4-tier conflict resolution, tiered watchdog system. Early-stage but architecturally right.
- **Composio Agent Orchestrator**: Closest to a true meta-orchestrator with dual-layer planner/executor architecture, self-improving performance tracking. Agent-agnostic (Claude Code, Codex, Aider), runtime-agnostic (tmux, Docker), tracker-agnostic (GitHub, Linear). Very new (Feb 2026).

### tmux-Based Approaches

- **AWS CLI Agent Orchestrator (CAO)**: Supervisor-worker pattern with MCP coordination. Supports Handoff (synchronous) and Assign (asynchronous) patterns.
- **agtx**: Spec-driven workflows with per-phase agent configuration and TOML-based plugin system. Automatic agent switching with preserved worktree/git state.
- **Agent Deck**: Go + Bubble Tea TUI with conductor system, socket pooling (85-90% MCP memory reduction), Docker sandboxing, Telegram/Slack integration.
- **Key trade-off**: tmux is the most practically accessible approach (universal terminal interface) but fragile — parsing terminal output for agent state requires per-agent heuristics.

### Configuration Layer

- **Bridle** (neiii): Cross-harness config manager supporting 7+ harnesses with auto-translation between configuration formats, profile management, and cross-harness skill/MCP installation. Essential infrastructure for any harness-agnostic orchestrator.

### Protocol Standards

| Protocol | Scope | Coding Agent Relevance | Maturity |
|----------|-------|----------------------|----------|
| Agent Protocol | Task execution (REST) | Low (agents don't expose APIs) | Moderate |
| A2A | Enterprise agent-to-agent | Low (cloud-service oriented) | High (100+ companies) |
| ACP | Editor-to-agent interface | High (JetBrains, Zed backing) | Growing |
| MCP | Agent-to-tool interface | High (AAIF, broad adoption) | High |

### Institutional Layer (AAIF)

Linux Foundation's Agentic AI Foundation (Dec 2025), co-founded by Anthropic, OpenAI, and Block, with AWS, Bloomberg, Cloudflare, Google, Microsoft as platinum members. Founding contributions: MCP (Anthropic), goose (Block), AGENTS.md (OpenAI). Strongest signal that the industry is converging on interoperability — competitors agreeing to standardize under neutral governance.

---

## Actionable Insights

1. **Overstory's `AgentRuntime` adapter pattern** is the closest architectural match for extending L-Thread beyond Claude Code to Pi, Gemini CLI, and other runtimes.
2. **agtx's TOML-based workflow plugins** offer a model for declarative, per-phase agent assignment — "canonical command format translated automatically for every supported agent" eliminates harness-specific encoding.
3. **Vibe Kanban** is the reference implementation for production-grade harness-agnostic orchestration (Rust backend, 10+ agents, git worktree isolation).
4. **Bridle** should be evaluated as a configuration normalization layer if L-Thread expands beyond Claude Code — translating CLAUDE.md context into equivalent formats for other harnesses.
5. **MCP as communication substrate** is already part of L-Thread (Chrome DevTools for E2E). Extending to inter-agent communication (following CAO's pattern) adds cross-harness coordination without new dependencies.
6. **The convergence path**: AAIF standardizes config (happening) -> ACP standardizes editor-agent interface (underway) -> tmux adapter pattern becomes default for terminal agents (consensus) -> meta-orchestrator emerges consuming all three layers.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent](../agent-harnesses/pi-agent.md) | Overstory has Pi runtime adapter; Pi's extension model contrasts with protocol-based approaches |
| [agent-harnesses/claude-agent-sdk](../agent-harnesses/claude-agent-sdk.md) | Claude Code is the most common orchestrated runtime across all tools surveyed |
| [agent-harnesses/oh-my-pi](../agent-harnesses/oh-my-pi.md) | Oh My Pi extends Pi's harness capabilities, relevant to pluggable adapter patterns |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town's 189K LOC Go orchestrator is the most ambitious harness-agnostic approach (runtime-agnostic, not model-agnostic) |
| [reference/harness-comparison-matrix](harness-comparison-matrix.md) | Provides scored comparison of individual harnesses that these tools orchestrate |
| [reference/mcp-ecosystem-orchestration](mcp-ecosystem-orchestration.md) | Deep dive on MCP protocol maturity underpinning many tools in this survey |
| [reference/hook-event-system-comparison](hook-event-system-comparison.md) | Per-harness extensibility mechanisms that determine what adapters can control |
