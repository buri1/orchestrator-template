# Pi vs Claude Code Decision

> **Evidence-based decision analysis comparing Pi Agent (19.4K stars, 324+ models, MIT license) vs Claude Code (Anthropic-locked, $200/mo Max arbitrage, native MCP) vs OpenClaw (163K stars, 13,729 skills), concluding with a hybrid architecture: Pi orchestrates, Claude Code executes, shell scripts manage infrastructure.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-pi-vs-claude-code-decision.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document provides a comprehensive head-to-head comparison of Pi Agent, Claude Code, and OpenClaw as of March 2026, across seven dimensions (core architecture, agent orchestration, model/provider support, developer experience, state/persistence, scheduling/automation, and cost). It concludes with a clear hybrid architecture recommendation: Pi Agent as orchestrator (control plane) for rule enforcement, multi-model routing, and cost tracking; Claude Code as workers (execution plane) for actual coding via the $200/mo Max subscription arbitrage; and shell scripts as infrastructure for tmux management, cron scheduling, and git operations.

The analysis is evidence-based with specific metrics: Pi Agent has grown from 2.9K to 19.4K GitHub stars in 3 months with 3.17M monthly npm downloads and 207 published versions; its system prompt is ~200 tokens vs Claude Code's ~10,000 tokens, giving Pi ~199K usable context vs Claude Code's ~150-170K. Pi's TypeScript-native extension system provides in-process tool-call blocking (microseconds) vs Claude Code's shell subprocess hooks (milliseconds), and crucially supports context rewriting via the `context` event -- something impossible in Claude Code. However, Claude Code has native sub-agent spawning, built-in worktree isolation, in-memory inter-agent messaging, first-class MCP support, IDE integration, and the Max subscription's 18-36x API cost arbitrage.

OpenClaw (163K stars, 13,729 skills on ClawHub) is analyzed as a different product category -- a 24/7 personal assistant that uses Pi SDK internally for its coding layer. It is relevant for the future business automation layer but is not a replacement for either Pi or Claude Code in the current coding orchestrator context.

---

## Key Findings

### Pi Agent Advantages

- **System prompt efficiency**: ~200 tokens core vs ~10,000 for Claude Code, yielding ~199K usable context window
- **Extension system**: 25+ TypeScript in-process events with type safety; can rewrite context, block tool calls in microseconds, enforce rules programmatically
- **Model flexibility**: 324+ models across 20+ providers; mid-session model switching; local model support (Ollama, vLLM)
- **Cost visibility**: Extensions like tool-counter provide per-session tracking; Claude Code has zero built-in cost visibility
- **Licensing**: MIT (fully open) vs Claude Code's commercial terms; version pinning via npm lockfile vs forced auto-updates
- **Headless modes**: RPC (JSONL stdin/stdout), SDK (Node.js API), Print/JSON -- more programmatic control options
- **Session persistence**: JSONL files + `/tree` navigation; appendEntry() dual persistence

### Claude Code Advantages

- **Native sub-agents**: Task tool, custom agents, built-in worktree isolation
- **Max subscription arbitrage**: $200/mo for ~20x usage = 18-36x cheaper than API pricing for heavy use
- **MCP integration**: First-class, native support vs Pi's bridge adapter
- **IDE integration**: VS Code + JetBrains support; Pi is terminal-only
- **Permission model**: 5 modes with deny-first and Haiku pre-screening vs Pi's YOLO default
- **Agent Teams**: Experimental but native shared task lists and inter-agent messaging
- **Documentation**: Comprehensive official docs vs sparse extension documentation

### OpenClaw Analysis

OpenClaw is an always-on personal AI assistant (WhatsApp, Telegram, Slack, iMessage, web), not a coding agent. It uses Pi SDK (`@mariozechner/pi-coding-agent`) as its "think and act" engine. Architecture: Gateway (messaging) -> Brain (ReAct via Pi SDK) -> Memory (persistent Markdown) -> Skills (13,729 on ClawHub) -> Heartbeat (cron scheduling). Relevant for future business automation layer but not for current coding orchestrator needs.

### The Hybrid Architecture Decision

| Layer | Tool | Why |
|-------|------|-----|
| Orchestration logic | Pi Agent | Programmatic hooks, context rewriting, model routing, TypeScript enforcement |
| Coding execution | Claude Code (Max) | Best Claude integration, IDE support, $200/mo arbitrage, worktree isolation |
| Business automation | OpenClaw (future) | Scheduling, messaging, memory, 24/7 operation |
| Infrastructure | Shell scripts | tmux management, cron scheduling, git operations, deployment |

The split is by **role**, not by percentage or by project. Orchestrator is 100% Pi. Workers are 100% Claude Code. This is a clean architectural boundary.

### Migration Path

- **Phase 0 (1 day, zero risk)**: Install Pi alongside Claude Code; test on simple task
- **Phase 1 (3-4 days, low risk)**: Build 3 enforcement extensions: `orchestrator-discipline.ts` (block Edit/Write on code files), `state-manager.ts` (dual persistence), `e2e-gate.ts` (block issue close without E2E test pass)
- **Phase 2 (5-7 days, medium risk)**: Move orchestrator loop to Pi; workers remain Claude Code sessions spawned via tmux send-keys
- **Phase 3 (3-4 days, low-medium risk)**: Model routing optimization, cost tracking, roadblock recovery extension

**Total migration: ~2-3 weeks**, faster than the 8-week estimate because only the orchestrator migrates, not the workers.

---

## Actionable Insights

- **Phase 1 enforcement extensions have the highest value-to-effort ratio**: The `orchestrator-discipline.ts` extension programmatically eliminates the "DU BIST KEIN ENTWICKLER" prompt fragility -- rules become code, not suggestions
- **Do not migrate workers to Pi**: The Max subscription arbitrage makes Claude Code workers more cost-effective; the orchestrator's model routing saves money by using cheaper models (Haiku/Sonnet) for coordination decisions
- **Keep Chrome DevTools MCP in Claude Code workers**: The pi-mcp-adapter works but adds indirection; E2E testing stays native
- **Version-pin Pi Agent**: Multiple releases per week mean API surface moves fast; use npm lockfile to prevent breakage
- **OpenClaw becomes relevant when building the business automation layer**: Not until the coding orchestrator is stable and revenue-generating
- **No vendor lock-in on the control plane**: If Anthropic changes Max pricing or Claude Code breaks, orchestration logic is in Pi (MIT, version-pinned, self-hosted); only the worker layer is Anthropic-dependent

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](master-blueprint.md) | The hybrid architecture implements the thin meta-layer strategy decided in Phase 3 convergence |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Detailed Pi Agent architecture, extension system, and community ecosystem |
| [reference/pi-orchestrator-blueprint.md](pi-orchestrator-blueprint.md) | Specific Pi orchestrator implementation plan building on this decision |
| [reference/pi-extensions-map.md](pi-extensions-map.md) | Catalog of Pi extensions including pi-side-agents, pi-subagents, pi-mcp-adapter |
| [practitioners/mario-zechner.md](../practitioners/mario-zechner.md) | Mario Zechner as Pi Agent creator; bus factor of 1 mitigated by MIT license and 134 contributors |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Elvis Sun's 100% OpenClaw approach analyzed as a different use case (always-on assistant vs coding orchestrator) |
| [reference/scaling-economics.md](scaling-economics.md) | Max subscription arbitrage economics referenced in the cost comparison |
