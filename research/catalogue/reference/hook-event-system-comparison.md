# Hook/Event System Deep Comparison

> **Architectural comparison of Pi Agent's 25 in-process TypeScript hooks vs Claude Code's 14 shell-based hooks vs Gas Town's monolithic Go actor model — demonstrating why in-process events are structurally superior for building custom agent harnesses.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | research/2026-03-05_hook-event-system-deep-comparison.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

Three fundamentally different paradigms exist for extending AI coding agents: Pi Agent's in-process TypeScript hooks (25 events, zero process boundary), Claude Code's shell-based hooks (14 events, full OS process boundary per invocation), and Gas Town's monolithic Go event system (internal actor model, no extension API). This document evaluates all three across 9 dimensions: in-process vs external process, event coverage, blocking capability, state access, custom tool registration, context manipulation, system prompt modification, composability, and developer experience.

Pi Agent's architecture is superior for building custom harnesses because it eliminates the process boundary entirely. When a hook fires in Pi, the handler executes in the same V8 runtime with direct access to session state, message history, tool registry, and the shared event bus. There is no serialization overhead, no subprocess spawning latency, and no loss of type information. Claude Code's hooks are the safest and most accessible (any shell command can participate) but pay a fundamental tax: 10-50ms per invocation for process spawn + pipe I/O + serialization. Gas Town's event system is powerful internally but locked inside 189K lines of Go — extending it requires source modification and recompilation.

The core thesis: Pi Agent's in-process model enables a class of extensions that are structurally impossible in Claude Code and impractical in Gas Town — extensions that block execution, transform data mid-flight, register new tools, manipulate context windows, and coordinate across hooks, all within a single runtime with full type safety.

---

## Key Findings

### Dimension 1: In-Process vs External Process

| Property | Pi Agent | Claude Code | Gas Town |
|----------|----------|-------------|----------|
| Process boundary | None | Full OS boundary | None (but closed) |
| Spawn latency per hook | ~0ms | ~5-50ms | ~0ms |
| Serialization overhead | None | JSON both directions | None |
| State persistence across invocations | Automatic (same heap) | Must use filesystem | Automatic (Go heap) |
| Extension language | TypeScript | Any (shell, Python) | Go only |
| Build step required | No (jiti) | No | Yes (go build) |
| Third-party extensibility | Designed for it | Designed for it | Not designed for it |

Claude Code hooks pay five costs per invocation: process spawn (~5-15ms), serialization (~0.1-1ms), pipe I/O (~1-5ms), deserialization (~0.1-1ms), process teardown (~1-5ms). Cumulative tax across hundreds of tool calls is measurable.

### Dimension 2: Event Coverage (Pi 25 vs Claude Code 14)

| Category | Pi Agent | Claude Code |
|----------|----------|-------------|
| Session lifecycle | 4 | 2 |
| Branching/tree | 6 | 0 |
| Input processing | 1 | 1 |
| Tool execution | 5 | 3 |
| Bash execution | 2 | 0 |
| Agent/turn lifecycle | 4 | 4 |
| Message streaming | 3 | 0 |
| Special (model select, context) | 2 | 1 |

Critical gaps in Claude Code: no branching events (6 missing), no bash execution hooks (2 missing), no message streaming events (3 missing), no context manipulation event, no model selection event. Pi covers 78% more events, and the missing ones represent entire extension categories.

### Dimension 3: Blocking Capability

Pi Agent can block or modify 11 operation types (tool calls, user input, bash commands, agent start, context compaction, branching, model selection). Claude Code can block only 2 (tool deny and tool input modification via PreToolUse). Gas Town has internal blocking only (not exposed to extensions).

### Dimension 4: State Access

Pi extensions have full read/write access to session state (messages, tools, model, branches, context size, system prompt). Claude Code hooks receive only a JSON snapshot of event-specific fields — no access to message history, context window, current model, token usage, or other hooks' state. L-Thread's own `orchestrator-session-start.sh` demonstrates the constraint: 84 lines of bash doing nothing more than reading JSON files and constructing a context string.

### Dimension 5: Custom Tool Registration

Pi's `pi.registerTool()` creates in-process tools with zero latency, full closure state access, and TypeScript type safety. Claude Code requires running a separate MCP server process with stdio/HTTP overhead. Gas Town only supports CLI commands via `gt`.

### Dimension 6: Context Manipulation

Pi's `context` event provides a deep copy of all messages for filtering, pruning, rewriting, or reordering before the model sees them. Enables custom compaction, context poisoning prevention, priority injection. Claude Code has zero context window access — `PreCompact` fires but cannot influence compaction. `SessionStart` allows one-time `additionalContext` injection only.

### Dimension 7: System Prompt Modification

Pi's `before_agent_start` fires every turn, enabling dynamic system prompt modification (task-aware prompting, conditional rules, progressive disclosure). Claude Code offers only static one-time injection via `SessionStart`. Gas Town uses static Role Beads per-session.

### Dimension 8: Composability

Pi provides three composability mechanisms: shared event bus (`pi.events`), ordered hook chaining (A's output becomes B's input), and shared runtime state (exports/imports). Claude Code hooks are isolated processes with no inter-hook communication except filesystem. Gas Town has no extension composability.

### Dimension 9: Developer Experience

Pi: TypeScript-native, zero build step (jiti), full IntelliSense, standard Node.js debugging. Claude Code: language-agnostic (shell/Python/etc.), no type safety, raw JSON parsing, process-spawn debugging overhead. Gas Town: Go source modification, compilation required, no extension API.

### Overall Scorecard

| Dimension | Pi Agent | Claude Code | Gas Town |
|-----------|----------|-------------|----------|
| In-process execution | Win | -- | Win (but closed) |
| Event coverage (25 vs 14) | Win | -- | N/A |
| Blocking capability (11 vs 2) | Win | -- | N/A |
| State access | Win | -- | Full (not exposed) |
| Tool registration | Win | -- | -- |
| Context manipulation | Win | -- | -- |
| System prompt modification | Win | -- | -- |
| Composability | Win | -- | N/A |
| Developer experience | Win | Accessible | -- |

Pi Agent wins 9/9 dimensions for harness building. Claude Code's one advantage is accessibility — any language can participate as a hook.

---

## Actionable Insights

1. **L-Thread's hook limitations are structural, not fixable**: The `orchestrator-session-start.sh` pattern (one-time context injection via shell) cannot be extended to per-turn context management, dynamic system prompt modification, or tool registration without switching to an in-process model.
2. **Pi's extension model enables orchestration patterns impossible in Claude Code**: Mid-session context surgery, per-turn task-aware prompting, custom compaction, and in-process tool registration are all available only through Pi's in-process hooks.
3. **For L-Thread specifically**: The orchestrator should consider Pi as a runtime for agents that need deep extensibility (scouts, quality checkers) while keeping Claude Code for primary development work where its safety and ecosystem matter more.
4. **Hook chaining enables multi-extension orchestration**: Pi's ordered hook execution (A's output becomes B's input) enables composable extension stacks — guardrails, logging, task management, and cost tracking can all coexist without filesystem-based coordination.
5. **The process boundary is the root constraint**: All of Claude Code's hook limitations derive from the OS process boundary. Any improvement Anthropic makes to hooks that doesn't eliminate this boundary is incremental, not architectural.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent](../agent-harnesses/pi-agent.md) | Primary subject — Pi's 25 in-process TypeScript hooks are the benchmark |
| [agent-harnesses/claude-agent-sdk](../agent-harnesses/claude-agent-sdk.md) | Claude Code's 14 shell-based hooks analyzed as the comparison baseline |
| [agent-harnesses/oh-my-pi](../agent-harnesses/oh-my-pi.md) | Oh My Pi demonstrates Pi's extension model in practice with curated extension packs |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town's 189K LOC Go actor model is the third paradigm analyzed — powerful but closed |
| [reference/harness-agnostic-tools](harness-agnostic-tools.md) | Tools like Overstory use pluggable adapters to abstract per-harness hook differences |
| [reference/model-agnosticism-strategy](model-agnosticism-strategy.md) | Pi's `model_select` hook (unique to Pi) connects to its model-agnostic architecture |
| [reference/pi-extensions-map](pi-extensions-map.md) | Catalog of existing Pi extensions built on the hook system analyzed here |
