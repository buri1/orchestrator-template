# Pi SDK Internals

> **Deep implementation reference for Pi's four-layer SDK stack: createAgentSession factory, pi-agent-core execution loop, pi-ai LLM transport abstraction, and the 25+ extension event system.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_pi-core-sdk-deep-architecture.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

Pi Agent is not a monolithic CLI -- it is a four-layer TypeScript monorepo (`pi-mono`, 3,037 commits, 96.6% TypeScript) where each layer can be imported independently. The stack runs from `pi-tui` (terminal UI) through `pi-ai` (unified LLM API for 324 models across 7 wire protocols) to `pi-agent-core` (agent loop, tool dispatch, state management) to `pi-coding-agent` (full application with tools, sessions, extensions). For orchestrator construction, the SDK mode via `createAgentSession()` is the primary interface, providing full programmatic control with zero serialization overhead.

The core architectural insight is that Pi separates **think-and-act** (the agent loop) from **connect-queue-remember-extend** (the embedding application's responsibility). An orchestrator imports Pi at the SDK level, registers custom tools for inter-agent communication, hooks lifecycle events for coordination, and manages multiple `AgentSession` instances -- each potentially running a different model -- through a unified programmatic interface. The token overhead is approximately 1K tokens per agent session (versus ~20K for Claude Code's Task tool), enabling an 18x advantage in concurrent agent capacity.

This document covers the SDK factory function, the AgentSession interface, the ReAct execution loop internals, the complete extension event taxonomy with return value effects, the RPC protocol for non-Node.js orchestrators, tree-structured JSONL session persistence, and the `streamFn` transport abstraction.

---

## Key Findings

### Package Layering

```
pi-coding-agent    (L4: Application -- CLI, tools, sessions, extensions)
       |
pi-agent-core      (L3: Runtime -- agent loop, tool dispatch, state, queues)
       |
    pi-ai           (L2: LLM abstraction -- 324 models, 7 wire protocols)
       |
    pi-tui           (L1: Terminal UI -- ink-based rendering, widgets)
```

| Import Level | What You Get | Orchestrator Use Case |
|-------------|-------------|----------------------|
| `@mariozechner/pi-ai` | Unified LLM API across 324 models | Custom agent loops, model routing |
| `@mariozechner/pi-agent-core` | Agent loop + tool execution | Custom agent with custom tools |
| `@mariozechner/pi-coding-agent` | Full coding agent + extensions | Primary: embedding Pi in a larger system |

### The createAgentSession Factory

The factory accepts configuration for session persistence (`SessionManager.inMemory()` or `SessionManager.files()`), authentication, model selection (with 6 thinking levels from "off" to "xhigh"), working directory, custom tool sets, system prompts, and a `resourceLoader` for controlling which extensions each agent instance sees. The returned `AgentSession` object provides the full control surface.

**Critical orchestrator patterns from AgentSession:**

- `session.prompt()` + `session.subscribe()`: Send task, stream results via event subscription (returns unsubscribe callback for cleanup)
- `session.steer()`: Mid-execution course correction; delivers after current tool finishes, skips remaining queued tools
- `session.agent.waitForIdle()`: Blocks until all processing completes (event-driven, no polling)
- `session.compact()`: Manual context compaction with custom instructions preserving orchestration-relevant context
- `session.dispose()`: Teardown for agent recycling
- `streamingBehavior` parameter: Mandatory when calling prompt() during active streaming, preventing accidental message collision

### Agent Loop Mechanics (pi-agent-core)

The `Agent` class implements a standard ReAct loop with critical implementation details:

1. **Tool calls within a single turn execute in parallel** via a `pendingToolCalls` Set
2. **The loop continues until the LLM stops making tool calls AND all queued messages are processed**
3. **Steering messages interrupt gracefully**: finish current tool, generate error results for remaining pending tools, deliver steering message

Two parallel message queues enable dynamic interaction during streaming:

| Queue | Behavior | Delivery |
|-------|----------|----------|
| Steering | Interrupts current operation | After current tool, skip remaining |
| Follow-up | Waits for agent idle | After all processing completes |

Both queues support one-at-a-time (default) or all-at-once delivery modes.

### Complete Extension Event Taxonomy (25+ Events)

**Session Events (10):** `session_start`, `session_before_switch`, `session_switch`, `session_before_fork`, `session_fork`, `session_before_compact`, `session_compact`, `session_before_tree`, `session_tree`, `session_shutdown`

**Agent Events (5):** `input` (intercept/transform user input), `before_agent_start` (inject messages, modify system prompt), `agent_start`, `agent_end`, `context` (rewrite message array before every LLM call -- most powerful event)

**Tool Events (5):** `tool_call` (block with `{block: true, reason}`), `tool_execution_start`, `tool_execution_update`, `tool_execution_end`, `tool_result` (modify tool output before LLM sees it)

**Turn/Message Events (5):** `turn_start`, `turn_end`, `message_start`, `message_update`, `message_end`

**Other Events (2):** `model_select`, `user_bash`

### The `context` Event

Fires before every LLM call and allows extensions to rewrite the message array the model sees. This is the single most important event for orchestrator construction, enabling: injecting orchestrator state at every turn, filtering irrelevant history, implementing custom compaction strategies per agent role, injecting inter-agent messages without polluting session log, and dynamic system prompt modification based on task phase. Claude Code has no equivalent.

### Tool Registration API

Extensions register tools via `pi.registerTool()` with TypeBox parameter schemas, execute functions receiving AbortSignal and streaming update callbacks, and optional custom TUI renderers. Tools registered at any point are immediately available without requiring session reload.

**Orchestrator-relevant custom tools:**
- `report_status`: Structured status reporting (current/blocked/complete/failed)
- `request_context`: Ask orchestrator for information from other agents' work
- `claim_resource`: File-level locking to prevent parallel agent collisions

### State Persistence

Two complementary mechanisms: `pi.appendEntry()` persists state in session JSONL (survives compaction, invisible to LLM) and `pi.sendMessage()` with `display: false` creates messages visible to LLM but hidden from TUI. Sessions are stored as tree-structured JSONL with `id`/`parentId` fields forming a directed acyclic graph, enabling in-place branching, fork operations, and full history navigation via `/tree`. Compaction is lossy in-memory but lossless on disk.

### RPC Protocol

For non-Node.js orchestrators, RPC mode provides equivalent control via line-delimited JSON over stdin/stdout. Commands include prompting (prompt, steer, follow_up, abort), state access, model control, session management, compaction, and execution. All commands support optional `id` fields for multiplexed dispatch. Extension UI requests in RPC mode are translated into a request/response sub-protocol, enabling fully unattended operation.

### The streamFn Transport Abstraction

The agent loop is decoupled from LLM transport. The `streamFn` property normalizes all provider-specific streaming formats into unified events (start, text_delta, thinking_delta, toolcall_delta, done, error). Orchestrators can wrap `streamFn` to inject headers, add logging, implement rate limiting, or route requests to different providers without modifying the agent loop.

### Token Economics Comparison

| Scenario | Pi (SDK mode) | Claude Code (Task tool) |
|----------|---------------|------------------------|
| Spawn 1 agent | ~1K tokens | ~20K tokens |
| Spawn 5 agents | ~5K tokens total | ~100K tokens total |
| Orchestrator + 5 agents | ~6K tokens | ~110K tokens |

This 18x overhead difference means Pi supports significantly more concurrent agents within the same cost budget.

---

## Actionable Insights

1. **Use SDK mode (`createAgentSession()`) as primary orchestrator interface** -- it provides full programmatic control with zero serialization overhead. Reserve RPC mode for polyglot orchestrators that cannot import Node.js modules.

2. **Register three essential custom tools** on every orchestrated agent: `report_status`, `request_context`, and `claim_resource` for structured coordination.

3. **Leverage the `context` event** to inject current task status and dependencies before every LLM call, filter irrelevant history, and implement role-specific context windows.

4. **Use `SessionManager.inMemory()` for ephemeral agents** (short tasks, review/QA) and `SessionManager.files()` for persistent agents (long tasks, orchestrator itself) with `compact()` for crash recovery.

5. **Wrap `streamFn`** for model routing: route different agent tasks to different providers based on complexity (Opus for architecture, Sonnet for review, local models for simple ops).

6. **Hook `session_before_compact`** with custom instructions that preserve orchestration-critical context in the compaction summary.

7. **Use `session.steer()`** for mid-execution course correction of stuck agents rather than killing and restarting them.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Core catalogue entry for Pi Agent |
| [agent-harnesses/pi-subagents.md](../agent-harnesses/pi-subagents.md) | Extension using SDK patterns for sub-agent spawning |
| [agent-harnesses/pi-messenger.md](../agent-harnesses/pi-messenger.md) | Inter-agent messaging built on extension API |
| [agent-harnesses/oh-my-pi.md](../agent-harnesses/oh-my-pi.md) | Fork with built-in sub-agents and MCP (alternative to SDK-level orchestration) |
| [reference/pi-agent-architecture-reference.md](pi-agent-architecture-reference.md) | High-level architecture philosophy and 4-tool design |
| [reference/pi-mcp-adapter.md](pi-mcp-adapter.md) | MCP integration via extension, token economics |
| [reference/lthread-pi-migration-guide.md](lthread-pi-migration-guide.md) | Maps L-Thread patterns to SDK interfaces |
| [reference/agent-automation-deployment.md](agent-automation-deployment.md) | SDK mode deployment in headless/automated contexts |
