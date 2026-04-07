# Hook/Event System Deep Comparison: Pi Agent vs Claude Code vs Gas Town

**Date:** 2026-03-05
**Scope:** Why Pi Agent's TypeScript in-process events are architecturally superior for building custom harnesses, compared to Claude Code's shell-based hooks and Gas Town's monolithic Go event system.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Full Event Inventories](#full-event-inventories)
3. [Architecture Comparison Diagrams](#architecture-comparison-diagrams)
4. [Dimension 1: In-Process vs External Process](#dimension-1-in-process-vs-external-process)
5. [Dimension 2: Event Coverage](#dimension-2-event-coverage)
6. [Dimension 3: Blocking Capability](#dimension-3-blocking-capability)
7. [Dimension 4: State Access](#dimension-4-state-access)
8. [Dimension 5: Custom Tool Registration](#dimension-5-custom-tool-registration)
9. [Dimension 6: Context Manipulation](#dimension-6-context-manipulation)
10. [Dimension 7: System Prompt Modification](#dimension-7-system-prompt-modification)
11. [Dimension 8: Composability](#dimension-8-composability)
12. [Dimension 9: Developer Experience](#dimension-9-developer-experience)
13. [The TillDone Case Study](#the-tilldone-case-study)
14. [Event Mapping Tables](#event-mapping-tables)
15. [Implications for Harness Building](#implications-for-harness-building)
16. [Conclusions](#conclusions)

---

## Executive Summary

Three fundamentally different paradigms exist for extending AI coding agents:

| System | Model | Events | Language | Process Boundary |
|--------|-------|--------|----------|-----------------|
| **Pi Agent** | In-process TypeScript hooks | 25 | TypeScript (jiti, zero-build) | None -- same V8 runtime |
| **Claude Code** | Shell-based hooks | 14 | Shell commands / LLM prompts / agent subprocesses | Full OS process boundary |
| **Gas Town** | Monolithic Go event system | Internal (actor model) | Go | None, but requires Go compilation |

Pi Agent's architecture is superior for building custom harnesses because it eliminates the process boundary entirely. When a hook fires in Pi, the handler function executes in the same V8 runtime as the agent, with direct access to session state, message history, tool registry, and the shared event bus. There is no serialization overhead, no JSON piping through stdin/stdout, no subprocess spawning latency, and no loss of type information.

Claude Code's hooks are the safest and most accessible -- any shell command can participate -- but they pay a fundamental tax: every hook invocation crosses a process boundary, serializes context to JSON, pipes it through stdin, and deserializes the response. This makes them unsuitable for high-frequency events (like message_update or tool_execution_update) and unable to directly manipulate session internals.

Gas Town's event system is powerful but locked inside a 189K-line Go binary. Extending it requires modifying Go source code, recompiling, and understanding a complex actor-model architecture. It is not designed for third-party extensibility.

**The core thesis:** Pi Agent's in-process model enables a class of extensions that are structurally impossible in Claude Code and impractical in Gas Town -- extensions that block execution, transform data mid-flight, register new tools, manipulate context windows, and coordinate across hooks, all within a single runtime with full type safety.

---

## Full Event Inventories

### Pi Agent: 25 In-Process TypeScript Events

```
SESSION LIFECYCLE (4)
+------------------------------------------------------------------+
| session_start          | Session initialized                      |
| session_shutdown       | Session ending                           |
| session_before_compact | Before context compaction                |
| session_compact        | After context compaction                 |
+------------------------------------------------------------------+

BRANCHING / TREE MANAGEMENT (6)
+------------------------------------------------------------------+
| session_before_fork    | Before conversation forks                |
| session_fork           | After fork completed                     |
| session_before_switch  | Before switching branches                |
| session_switch         | After branch switch completed            |
| session_before_tree    | Before tree operation                    |
| session_tree           | After tree operation completed           |
+------------------------------------------------------------------+

INPUT PROCESSING (1)
+------------------------------------------------------------------+
| input                  | User input received                      |
|                        | CAN: block, transform, handle entirely   |
+------------------------------------------------------------------+

TOOL EXECUTION (5)
+------------------------------------------------------------------+
| tool_call              | Tool about to execute                    |
|                        | CAN: block (with reason), modify args    |
| tool_result            | Tool execution completed                 |
| tool_execution_start   | Tool begins running                      |
| tool_execution_update  | Tool progress update (streaming)         |
| tool_execution_end     | Tool finished running                    |
+------------------------------------------------------------------+

BASH EXECUTION (2)
+------------------------------------------------------------------+
| BashSpawnHook          | Bash command about to execute            |
|                        | CAN: modify command, cwd, env vars       |
| user_bash              | User-initiated bash command              |
+------------------------------------------------------------------+

AGENT / TURN LIFECYCLE (4)
+------------------------------------------------------------------+
| before_agent_start     | Before agent begins processing           |
|                        | CAN: modify system prompt                |
| agent_start            | Agent processing started                 |
| agent_end              | Agent processing completed               |
| turn_start             | New turn beginning                       |
| turn_end               | Turn completed                           |
+------------------------------------------------------------------+

MESSAGE STREAMING (3)
+------------------------------------------------------------------+
| message_start          | New message beginning                    |
| message_update         | Message content streaming                |
| message_end            | Message completed                        |
+------------------------------------------------------------------+

SPECIAL (2)
+------------------------------------------------------------------+
| model_select           | Model selection decision point           |
| context                | Deep copy of all messages                |
|                        | CAN: filter, prune, rewrite messages     |
+------------------------------------------------------------------+
```

### Claude Code: 14 Shell-Based Hooks

```
SESSION (2)
+------------------------------------------------------------------+
| SessionStart           | Session initialized                      |
|                        | OUTPUT: additionalContext injection       |
| SessionEnd             | Session ending                           |
+------------------------------------------------------------------+

INPUT (1)
+------------------------------------------------------------------+
| UserPromptSubmit       | User prompt submitted                    |
|                        | CAN: modify prompt text                  |
+------------------------------------------------------------------+

TOOL USAGE (3)
+------------------------------------------------------------------+
| PreToolUse             | Before tool execution                    |
|                        | CAN: allow, deny, modify input           |
| PostToolUse            | After tool execution                     |
| PostToolUseFailure     | After tool execution failure             |
+------------------------------------------------------------------+

PERMISSIONS (1)
+------------------------------------------------------------------+
| PermissionRequest      | Tool requesting permission               |
+------------------------------------------------------------------+

AGENT LIFECYCLE (4)
+------------------------------------------------------------------+
| SubagentStart          | Subagent spawned                         |
| SubagentStop           | Subagent terminated                      |
| TeammateIdle           | Teammate agent is idle                   |
| TaskCompleted          | Task finished                            |
+------------------------------------------------------------------+

FLOW CONTROL (2)
+------------------------------------------------------------------+
| Stop                   | Agent stopping                           |
| Notification           | Notification event                       |
+------------------------------------------------------------------+

CONTEXT (1)
+------------------------------------------------------------------+
| PreCompact             | Before context compaction                |
+------------------------------------------------------------------+
```

### Gas Town: Internal Go Event System

```
ACTOR MODEL (internal, not extensible)
+------------------------------------------------------------------+
| Agent mailbox delivery | Message arrives in agent mailbox         |
| Competing-consumer     | Work pulled from shared queue            |
| Channel broadcast      | Message published to all subscribers     |
| Hook attachment        | Work attached to agent hook              |
| Bead state transition  | Bead moves through lifecycle states      |
| Molecule step advance  | Workflow moves to next step              |
| Session handoff        | Agent session restarts with context      |
| Patrol loop trigger    | Deacon health check fires               |
| Worktree creation      | Git worktree created for agent           |
| Merge queue event      | Refinery processes merge                 |
+------------------------------------------------------------------+
Note: These are NOT extensible hooks. They are internal
dispatching mechanisms within the Go binary. Extending
them requires modifying Go source and recompiling.
```

---

## Architecture Comparison Diagrams

### Pi Agent: In-Process Event Model

```
+========================================================+
|                   Pi Agent Process (V8)                  |
|                                                          |
|  +------------------+     +-------------------------+    |
|  |   Extension A    |     |     Extension B         |    |
|  |  (TypeScript)    |     |    (TypeScript)         |    |
|  |                  |     |                         |    |
|  | on('tool_call')--+---->| on('tool_call')         |    |
|  | on('input')      |     | on('agent_end')         |    |
|  | on('context')    |     | on('before_agent_start')|    |
|  +--------+---------+     +------------+------------+    |
|           |                            |                 |
|           |    pi.events (shared bus)  |                 |
|           +<===========================+                 |
|           |                                              |
|  +--------v-------------------------------------------+  |
|  |              Agent Core Runtime                     | |
|  |                                                     | |
|  |  [Session State] [Message History] [Tool Registry]  | |
|  |  [Context Window] [System Prompt] [Model Config]    | |
|  |                                                     | |
|  |  ALL directly accessible from extension code        | |
|  +-----------------------------------------------------+ |
+=========================================================+

    Latency:     ~0ms (function call)
    Serialization: None
    Type safety:   Full (TypeScript)
    State access:  Direct (same heap)
```

### Claude Code: External Process Hook Model

```
+========================+          +=====================+
|   Claude Code Process  |          |   Hook Process      |
|                        |          |   (shell/script)    |
|  [Session State]       |          |                     |
|  [Message History]     |   JSON   |  stdin:             |
|  [Tool Registry]   ----+--pipe--->|  { "event": "...",  |
|  [Context Window]      |  stdin   |    "tool_name": ... |
|  [System Prompt]       |          |    "input": {...} } |
|                        |          |                     |
|  Waits for response... |   JSON   |  stdout:            |
|                    <---+--pipe----|  { "decision":      |
|                        |  stdout  |    "allow" }        |
|                        |          |                     |
+========================+          +=====================+

    Latency:     ~5-50ms (process spawn + pipe I/O)
    Serialization: JSON encode/decode on both sides
    Type safety:   None (shell scripts, raw JSON)
    State access:  Only what's serialized into stdin JSON

    3 Handler Types:
    +-----------+     +--------+     +-------+
    | "command" |     |"prompt"|     |"agent"|
    | (shell)   |     | (LLM)  |     |(sub)  |
    +-----------+     +--------+     +-------+
```

### Gas Town: Monolithic Go Event System

```
+========================================================+
|               Gas Town Binary (Go, 189K LOC)            |
|                                                          |
|  +--------------------------------------------------+   |
|  |                 Actor System                       |  |
|  |                                                    |  |
|  |  [Mayor Actor]--mailbox-->[Witness Actor]          |  |
|  |       |                        |                   |  |
|  |    dispatch                 supervise              |  |
|  |       |                        |                   |  |
|  |  [Polecat Actor]          [Polecat Actor]          |  |
|  |       |                        |                   |  |
|  |  [tmux session]           [tmux session]           |  |
|  |  [Claude Code]            [Claude Code]            |  |
|  |                                                    |  |
|  |  Events are INTERNAL dispatch mechanisms.           |  |
|  |  No extension API. No hook registration.           |  |
|  |  To modify: edit Go source, recompile.             |  |
|  +--------------------------------------------------+   |
|                                                          |
|  External integration only via:                          |
|  - .claude/settings.json hook injection                  |
|  - gt CLI commands                                       |
|  - Bead/JSONL file manipulation                          |
+=========================================================+

    Latency:     ~0ms (internal dispatch)
    Serialization: Go structs (internal)
    Type safety:   Full (Go, but only if you modify source)
    State access:  Full (if you modify source)
    Extensibility: None without Go compilation
```

### Side-by-Side Data Flow for a Tool Call

```
PI AGENT                    CLAUDE CODE                 GAS TOWN
=========                   ===========                 ========

tool_call fires             PreToolUse fires            (internal dispatch)
     |                           |                           |
     v                           v                           v
handler(event) {            spawn process                no external hook
  // SAME runtime           fork() + exec()              (Go handles internally)
  // access session           |                             |
  // modify args              v                             |
  // block if needed      pipe JSON stdin                   |
  return modified;           |                              |
}                            v                              |
     |                   hook script reads                  |
     v                   parses JSON                        |
  tool executes          makes decision                     |
  with modified args     writes JSON stdout                 |
     |                       |                              |
     v                       v                              |
  tool_result fires      Claude Code reads                  |
  handler(result) {      parses response                    |
    // inspect result    applies decision                   |
    // modify if needed       |                             |
  }                          v                              |
                         tool executes                      |
                              |                             |
                              v                             |
                         PostToolUse fires                  |
                         spawn another process              |
                         (no modification possible)         |

Total hooks fired: 3-5      Total hooks: 2               Total: 0 (external)
Processes spawned: 0         Processes spawned: 2         Processes: N/A
Serialization: 0             Serialization: 4 (2x2)      Serialization: 0
Can modify result: YES       Can modify result: NO        Can modify: N/A
```

---

## Dimension 1: In-Process vs External Process

This is the foundational architectural difference from which all other differences derive.

### Pi Agent: Same Runtime, Zero Boundary

Pi extensions are TypeScript files loaded into the same V8 runtime as the agent itself via jiti (a zero-config TypeScript runtime that requires no build step). When a hook fires, the agent calls a JavaScript function. There is no process boundary, no serialization, no IPC.

```typescript
// This runs IN the agent process
pi.on('tool_call', (event) => {
  // Direct access to session state
  const messages = pi.session.messages;
  const currentModel = pi.session.model;

  // Modify the tool call in-place
  if (event.tool === 'Write' && !tasksDefined) {
    return { block: true, reason: 'Define tasks first' };
  }

  // Modify arguments before execution
  event.input.content = transform(event.input.content);
  return event;
});
```

Key properties:
- **Latency**: ~0ms (function call within the same event loop)
- **Memory sharing**: Extensions share the heap with the agent core
- **Type safety**: Full TypeScript types for all event payloads
- **Error handling**: Standard try/catch, stack traces point to extension code
- **Debugging**: Standard Node.js debugging (breakpoints, inspect)

### Claude Code: Process Boundary Tax

Every Claude Code hook invocation pays five costs:

1. **Process spawn**: `fork()` + `exec()` for the shell command (~5-15ms)
2. **Serialization**: JSON.stringify on the Claude Code side (~0.1-1ms)
3. **Pipe I/O**: Write to stdin, read from stdout (~1-5ms)
4. **Deserialization**: JSON.parse on both sides (~0.1-1ms)
5. **Process teardown**: Wait for exit, cleanup file descriptors (~1-5ms)

For a single PreToolUse hook, this adds 10-50ms of overhead. For a workflow involving hundreds of tool calls, the cumulative tax is measurable.

More critically, the process boundary means:
- **No shared state**: The hook process starts fresh every time. It cannot accumulate state across invocations without writing to disk.
- **No type safety**: The hook receives raw JSON. There are no TypeScript interfaces for the event payloads.
- **Limited error context**: If the hook fails, Claude Code sees an exit code and stderr, not a stack trace into the agent internals.

```bash
# Claude Code hook: .claude/settings.json
{
  "hooks": {
    "PreToolUse": [{
      "type": "command",
      "command": "python3 my_hook.py"
    }]
  }
}

# my_hook.py receives JSON on stdin:
# {"event":"PreToolUse","tool_name":"Write","input":{"file_path":"..."}}
# Must write JSON to stdout:
# {"decision":"allow"}
```

The L-Thread Orchestrator's own hooks illustrate this constraint. The `orchestrator-session-start.sh` script (84 lines of bash) does nothing more than read JSON files, extract fields with `jq`, and construct a context string -- because that is the limit of what a shell hook can do. It cannot inspect the agent's message history, cannot register a custom tool, cannot modify the system prompt dynamically.

### Gas Town: Full Power, No Extension API

Gas Town's internal event system is Go structs dispatched through channels and goroutines -- the actor model implemented in a systems language. This gives it the same in-process advantages as Pi Agent (zero serialization, full state access) but with a critical limitation: there is no extension API.

To add a new event handler in Gas Town, you must:
1. Modify Go source code
2. Understand the actor system architecture
3. Recompile the 189K-line binary
4. Deploy the new binary

This makes Gas Town a closed system for event handling. It is powerful internally but not designed for third-party extensions or rapid prototyping.

### Verdict

| Property | Pi Agent | Claude Code | Gas Town |
|----------|----------|-------------|----------|
| Process boundary | None | Full OS boundary | None (but closed) |
| Spawn latency per hook | ~0ms | ~5-50ms | ~0ms |
| Serialization overhead | None | JSON both directions | None |
| State persistence across invocations | Automatic (same heap) | Must use filesystem | Automatic (Go heap) |
| Extension language | TypeScript | Any (shell, Python, etc.) | Go only |
| Build step required | No (jiti) | No | Yes (go build) |
| Third-party extensibility | Designed for it | Designed for it | Not designed for it |

**Winner: Pi Agent** -- combines the performance of in-process execution with the extensibility of a plugin API.

---

## Dimension 2: Event Coverage

### Quantitative Comparison

| Category | Pi Agent | Claude Code | Gas Town |
|----------|----------|-------------|----------|
| Session lifecycle | 4 | 2 | N/A (internal) |
| Branching/tree | 6 | 0 | N/A |
| Input processing | 1 | 1 | N/A |
| Tool execution | 5 | 3 | N/A |
| Bash execution | 2 | 0 | N/A |
| Agent/turn lifecycle | 4 | 4 | N/A |
| Message streaming | 3 | 0 | N/A |
| Permissions | 0 | 1 | N/A |
| Special | 2 | 1 | N/A |
| **Total** | **25** | **14** | **~10 internal** |

### Critical Gaps in Claude Code

The 11-event gap is not just quantitative -- it represents entire categories of extensibility that Claude Code hooks cannot reach:

**1. No branching/tree events (6 missing)**
Pi Agent exposes the entire conversation tree manipulation lifecycle. Extensions can intercept forks, switches, and tree operations to maintain consistent state across branches. Claude Code has no equivalent -- there is no way to know when the conversation branches or which branch is active.

**2. No bash execution hooks (2 missing)**
Pi's `BashSpawnHook` fires before every bash command, allowing extensions to modify the command, change the working directory, or inject environment variables. This enables sandboxing, logging, and security policies at the bash level. Claude Code's `PreToolUse` fires for bash as one tool among many, but provides no mechanism to modify the command before execution.

**3. No message streaming events (3 missing)**
Pi's `message_start`, `message_update`, and `message_end` events provide real-time access to the agent's output as it streams. Extensions can build live UIs, progress indicators, or token counters. Claude Code hooks have no streaming access -- you see tool calls and final outputs, but not the generation process.

**4. No context manipulation event (1 missing)**
Pi's `context` event provides a deep copy of all messages in the context window, allowing extensions to filter, prune, or rewrite messages before the agent sees them. This is the most powerful single event in Pi's system. Claude Code has `PreCompact` but it cannot modify what gets compacted -- it can only observe that compaction is about to happen.

**5. No model selection event (1 missing)**
Pi's `model_select` event fires when the model is being chosen, allowing extensions to override model selection based on task characteristics. Claude Code has no equivalent.

### Verdict

Pi Agent covers 78% more events than Claude Code, and the missing events in Claude Code are not minor -- they represent entire extension categories (branching, bash modification, streaming, context manipulation, model selection) that are structurally unavailable.

---

## Dimension 3: Blocking Capability

The ability to **block** an operation -- to prevent the agent from proceeding until conditions are met -- is the most important primitive for building custom harnesses. Without blocking, you can observe but not control.

### Pi Agent: Block Anything, Anywhere

Pi's hooks can return blocking directives for any event:

```typescript
// Block a tool call
pi.on('tool_call', (event) => {
  if (event.tool === 'Write' && !isReady()) {
    return { block: true, reason: 'Not ready yet' };
  }
});

// Block and transform input
pi.on('input', (event) => {
  if (event.text.startsWith('/custom')) {
    handleCustomCommand(event.text);
    return { handled: true }; // Fully consume the input
  }
  // Transform input before agent sees it
  event.text = augment(event.text);
  return event;
});

// Block agent start to modify system prompt
pi.on('before_agent_start', (event) => {
  event.systemPrompt += '\n\nAdditional context: ' + getContext();
  return event;
});
```

Blocking capabilities by event:
- `tool_call`: Block with reason, modify args
- `input`: Block, transform, handle entirely
- `BashSpawnHook`: Modify command/cwd/env, or block
- `before_agent_start`: Modify system prompt
- `context`: Filter/prune messages
- `session_before_compact`: Intervene in compaction
- `session_before_fork/switch/tree`: Intercept branching

### Claude Code: Block Only Tool Calls

Claude Code's blocking capability is limited to `PreToolUse`:

```json
// Deny a tool call
{ "decision": "deny", "reason": "Not allowed" }

// Allow with modifications
{ "decision": "allow", "input": { "modified": "args" } }
```

That is the extent of it. There is no way to:
- Block or transform user input (`UserPromptSubmit` can modify but not block)
- Block agent start
- Block bash commands specifically (only via PreToolUse for the Bash tool generically)
- Block or modify context compaction
- Block message streaming

### Gas Town: Internal Blocking Only

Gas Town's actor system can block internally (a supervisor can hold a message in its mailbox), but this is not exposed as an extension mechanism. The Mayor can decide not to dispatch work, but this is a role behavior, not a hook API.

### Blocking Capability Matrix

| Operation | Pi Agent | Claude Code | Gas Town |
|-----------|----------|-------------|----------|
| Block tool call | Return `{ block: true }` | `{ "decision": "deny" }` | N/A |
| Modify tool args | Mutate event object | `{ "input": {...} }` | N/A |
| Block user input | Return `{ handled: true }` | Cannot block | N/A |
| Transform user input | Mutate event.text | Modify prompt text | N/A |
| Block bash command | Return from BashSpawnHook | Only via generic PreToolUse | N/A |
| Modify bash env | Set event.env | Not possible | N/A |
| Block agent start | Return from before_agent_start | Not possible | N/A |
| Modify system prompt | Mutate event.systemPrompt | Not possible (only SessionStart additionalContext) | N/A |
| Block context compaction | Return from session_before_compact | Not possible (PreCompact is observe-only) | N/A |
| Filter context messages | Mutate messages in context event | Not possible | N/A |
| Block model selection | Override in model_select | Not possible | N/A |
| Block message streaming | Not applicable (streaming) | Not possible | N/A |

**Winner: Pi Agent** -- can block or modify 11 operations vs Claude Code's 2 (tool deny and tool input modification).

---

## Dimension 4: State Access

### Pi Agent: Full Session State

Pi extensions operate in the same runtime and can access:

```typescript
pi.on('agent_end', (event) => {
  // Full session state
  const messages = pi.session.messages;       // All messages
  const tools = pi.session.tools;             // Registered tools
  const model = pi.session.model;             // Current model
  const branch = pi.session.branch;           // Current branch
  const contextSize = pi.session.contextSize; // Token usage

  // Inter-hook shared state
  pi.events.emit('custom:taskComplete', { id: taskId });

  // Accumulated extension state (persists across turns)
  extensionState.tasksCompleted++;
});
```

Properties:
- **Scope**: Everything in the session -- messages, tools, model, branches, context
- **Mutability**: Can read and write (with appropriate hooks)
- **Persistence**: In-memory for session duration; extensions can persist to disk
- **Sharing**: Extensions share state via `pi.events` bus and closures

### Claude Code: Serialized Snapshots

Claude Code hooks receive a JSON snapshot of the relevant event data:

```json
// PreToolUse stdin payload
{
  "event": "PreToolUse",
  "tool_name": "Write",
  "input": {
    "file_path": "/path/to/file",
    "content": "..."
  }
}

// SessionStart can inject additionalContext
{
  "additionalContext": "Injected text appears in system prompt area"
}
```

Properties:
- **Scope**: Only the event-specific fields serialized by Claude Code
- **Mutability**: Can only affect the narrow response (allow/deny/modify for PreToolUse)
- **Persistence**: None -- each hook invocation is a fresh process. Must use filesystem.
- **Sharing**: Hooks cannot communicate with each other except through the filesystem.

What Claude Code hooks **cannot** access:
- Message history
- Other active tools
- Context window contents
- Current model
- Token usage
- Branch/conversation state
- Other hooks' state

### Gas Town: Full but Locked

Gas Town's Go code has full access to all internal state (beads, molecules, agent status, mailboxes, hooks), but this access is not exposed to extensions.

### State Access Comparison

```
PI AGENT ACCESS SCOPE:
+----------------------------------------------------------+
| Session State (FULL ACCESS)                               |
|   messages[], tools[], model, branch, contextSize,        |
|   systemPrompt, compactionHistory, forkTree               |
|                                                           |
| Extension State (PERSISTENT ACROSS TURNS)                 |
|   Any JavaScript object in closure scope                  |
|   pi.events shared bus for inter-extension communication  |
|                                                           |
| Tool Registry (READ + WRITE)                              |
|   Can register new tools, inspect existing tools          |
+----------------------------------------------------------+

CLAUDE CODE ACCESS SCOPE:
+----------------------------------------------------------+
| Event Payload Only (SNAPSHOT)                              |
|   tool_name, input args, file paths                       |
|                                                           |
| No access to:                                              |
|   messages, tools, model, context, branches,              |
|   other hooks' state, session internals                   |
|                                                           |
| Persistence: filesystem only (no in-memory state)          |
+----------------------------------------------------------+

GAS TOWN ACCESS SCOPE:
+----------------------------------------------------------+
| Full Internal State (Go structs)                           |
|   beads, molecules, agents, mailboxes, hooks, worktrees   |
|                                                           |
| NOT EXPOSED to extensions                                  |
| Requires Go source modification to access                  |
+----------------------------------------------------------+
```

**Winner: Pi Agent** -- full, mutable, persistent access to session state from extension code.

---

## Dimension 5: Custom Tool Registration

This dimension asks: can an extension add new tools to the agent's available toolkit?

### Pi Agent: First-Class Tool Registration

Pi extensions can register custom tools that the agent can call, just like built-in tools:

```typescript
pi.registerTool({
  name: 'task_manager',
  description: 'Manage development tasks',
  parameters: {
    action: { type: 'string', enum: ['add', 'complete', 'list'] },
    task: { type: 'string', optional: true }
  },
  handler: async (params) => {
    switch (params.action) {
      case 'add': return addTask(params.task);
      case 'complete': return completeTask(params.task);
      case 'list': return listTasks();
    }
  }
});
```

Properties:
- **In-process**: The tool handler runs in the same runtime
- **Type-safe**: Parameters are validated against the schema
- **Stateful**: The handler has closure access to extension state
- **Discoverable**: The agent sees the tool in its available tools list
- **Zero latency**: No IPC, no subprocess, no network call

### Claude Code: MCP or External Server

Claude Code supports custom tools only through the Model Context Protocol (MCP), which requires running a separate server process:

```json
// .claude/settings.json
{
  "mcpServers": {
    "my-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["my-mcp-server.js"]
    }
  }
}
```

Properties:
- **External process**: MCP server runs as a separate process
- **Network overhead**: Communication via stdio or HTTP
- **Stateful**: The MCP server maintains its own state (but isolated from Claude Code)
- **Complex setup**: Requires implementing the MCP protocol
- **Type safety**: JSON Schema for parameters, but no compile-time checking

The L-Thread Orchestrator uses Chrome DevTools MCP for browser testing -- this works well but demonstrates the overhead: a separate process, a protocol layer, and no access to Claude Code internals.

### Gas Town: CLI Commands Only

Gas Town extends tool availability through the `gt` CLI, which agents invoke as bash commands. There is no mechanism to register custom tools that the AI agent directly sees in its tool list.

### Tool Registration Comparison

| Aspect | Pi Agent | Claude Code | Gas Town |
|--------|----------|-------------|----------|
| Registration mechanism | `pi.registerTool()` | MCP server | gt CLI commands |
| Execution context | In-process | External process | External process |
| Latency per call | ~0ms | ~10-100ms (stdio IPC) | ~50-200ms (shell exec) |
| State sharing | Full (closure access) | None (isolated process) | None (shell) |
| Type safety | TypeScript interfaces | JSON Schema | None |
| Setup complexity | One function call | Full MCP server | Go source modification |
| Agent discoverability | Automatic | Automatic (via MCP) | Must be in system prompt |

**Winner: Pi Agent** -- custom tools are first-class citizens in the same runtime.

---

## Dimension 6: Context Manipulation

The ability to manipulate the agent's context window -- the actual messages the model sees -- is perhaps the most architecturally significant capability difference.

### Pi Agent: Direct Context Surgery

Pi's `context` event provides a deep copy of all messages in the context window. Extensions can filter, prune, rewrite, or reorder messages before the model sees them:

```typescript
pi.on('context', (event) => {
  // Remove all messages from a failed attempt
  event.messages = event.messages.filter(
    msg => !msg.metadata?.failedAttempt
  );

  // Inject synthetic messages
  event.messages.push({
    role: 'user',
    content: 'Remember: always check task list before coding'
  });

  // Truncate old tool results to save context
  event.messages.forEach(msg => {
    if (msg.toolResult && msg.toolResult.length > 1000) {
      msg.toolResult = msg.toolResult.slice(0, 1000) + '... [truncated]';
    }
  });

  return event;
});
```

This enables:
- **Custom compaction**: Replace the default compaction with domain-specific logic
- **Context poisoning prevention**: Remove messages that lead the model astray
- **Priority injection**: Ensure critical context is never pruned
- **Multi-extension coordination**: Each extension can add/remove messages independently

### Claude Code: No Context Access

Claude Code hooks have zero access to the context window. The `PreCompact` hook fires before compaction but cannot influence what gets compacted. The `SessionStart` hook can inject `additionalContext`, but this is a one-time injection at session start, not continuous context management.

The L-Thread Orchestrator's `orchestrator-session-start.sh` demonstrates the workaround: it reads state from JSON files and injects a text summary via `additionalContext`. This is a one-way, one-time injection -- the hook cannot inspect what is already in the context, cannot remove stale information, and cannot dynamically adjust based on the conversation's current state.

### Gas Town: Indirect Context via Handoffs

Gas Town manages context indirectly through the `gt handoff` mechanism, which restarts agent sessions with fresh context constructed from mail and hooks. This is effective for context management between sessions but does not provide within-session context manipulation.

### Context Manipulation Comparison

| Capability | Pi Agent | Claude Code | Gas Town |
|-----------|----------|-------------|----------|
| Read context messages | Yes (deep copy) | No | No (external) |
| Filter/remove messages | Yes | No | No |
| Rewrite message content | Yes | No | No |
| Inject synthetic messages | Yes | No | No |
| Custom compaction logic | Yes (replace default) | No | No |
| Per-turn context shaping | Yes | No | No |
| One-time context injection | Yes | Yes (SessionStart additionalContext) | Yes (mail/handoff) |

**Winner: Pi Agent** -- only system with direct, mutable access to the context window.

---

## Dimension 7: System Prompt Modification

### Pi Agent: Per-Turn Dynamic Modification

Pi's `before_agent_start` event fires before every agent turn, allowing extensions to modify the system prompt dynamically:

```typescript
pi.on('before_agent_start', (event) => {
  // Add context-dependent instructions
  const activeTasks = getActiveTasks();
  event.systemPrompt += `\n\nACTIVE TASKS:\n${activeTasks.map(t =>
    `- ${t.id}: ${t.description} [${t.status}]`
  ).join('\n')}`;

  // Add time-sensitive rules
  if (isAfterHours()) {
    event.systemPrompt += '\n\nRULE: Do not make external API calls during off-hours.';
  }

  return event;
});
```

This enables:
- Task-aware prompting (add current task context every turn)
- Dynamic rule injection based on state
- Progressive disclosure (add complexity as agent demonstrates competence)
- Multi-extension prompt composition (each extension appends its section)

### Claude Code: Static Injection Only

Claude Code's `SessionStart` hook can inject `additionalContext` once, at session start. This text is included in the system prompt area but cannot be updated during the session.

```bash
# orchestrator-session-start.sh output:
echo '{"additionalContext": "ORCHESTRATOR RULES:\n1. Never write code\n2. ..."}'
```

After this initial injection, the system prompt is fixed for the session (until compaction triggers a new SessionStart). There is no mechanism to add, remove, or modify system prompt content between turns.

The only workaround is to write instructions into files (like `CLAUDE.md`) that the agent reads, but this consumes context window space with tool calls and is not guaranteed to be re-read each turn.

### Gas Town: Role Beads (Static Per-Session)

Gas Town injects system prompt content through Role Beads, loaded when an agent session starts. Like Claude Code, this is static per-session.

### System Prompt Comparison

| Capability | Pi Agent | Claude Code | Gas Town |
|-----------|----------|-------------|----------|
| Initial injection | Yes | Yes (additionalContext) | Yes (Role Beads) |
| Per-turn modification | Yes (before_agent_start) | No | No |
| Dynamic content | Yes (function return value) | No (static string) | No (static file) |
| Multi-extension composition | Yes (each extension appends) | No | No |
| Conditional rules | Yes (based on any runtime state) | No | No |
| Remove/replace content | Yes (mutate systemPrompt) | No | No |

**Winner: Pi Agent** -- per-turn dynamic system prompt modification vs one-time static injection.

---

## Dimension 8: Composability

Can multiple extensions/hooks coexist, cooperate, and build on each other?

### Pi Agent: Full Composability Stack

Pi extensions compose through three mechanisms:

**1. Event Bus (`pi.events`)**
Extensions communicate through a shared event bus, publishing and subscribing to custom events:

```typescript
// Extension A: task manager
pi.events.emit('tasks:updated', { tasks: activeTasks });

// Extension B: UI renderer
pi.events.on('tasks:updated', (data) => {
  renderTaskWidget(data.tasks);
});

// Extension C: guardrails
pi.events.on('tasks:updated', (data) => {
  if (data.tasks.length === 0) {
    enforceTaskCreation();
  }
});
```

**2. Hook Chaining**
Multiple extensions can register handlers for the same event. They execute in registration order, each seeing the output of the previous handler:

```typescript
// Extension A modifies tool args
pi.on('tool_call', (event) => {
  event.input.style = 'verbose';
  return event;
});

// Extension B sees A's modification and adds its own
pi.on('tool_call', (event) => {
  // event.input.style is already 'verbose'
  event.input.maxLines = 100;
  return event;
});
```

**3. Shared Runtime State**
Extensions can export and import values through the shared runtime:

```typescript
// Extension A exports a utility
pi.exports.taskManager = { addTask, getTask, listTasks };

// Extension B uses it
const tasks = pi.imports.taskManager.listTasks();
```

### Claude Code: Isolated Hook Scripts

Claude Code hooks are isolated processes. Multiple hooks for the same event execute independently:

```json
{
  "hooks": {
    "PreToolUse": [
      { "type": "command", "command": "hook-a.sh" },
      { "type": "command", "command": "hook-b.sh" }
    ]
  }
}
```

Properties:
- Each hook is a separate process
- Hooks cannot see each other's output
- No shared state (except filesystem)
- No event bus for inter-hook communication
- If hook-a denies and hook-b allows, the resolution logic is in Claude Code (not configurable)

The only inter-hook communication mechanism is the filesystem -- hooks can write to shared files and read from them. This is slow, race-prone, and requires explicit coordination.

### Gas Town: No Extension Composability

Gas Town does not support third-party extensions, so composability is not applicable.

### Composability Comparison

| Mechanism | Pi Agent | Claude Code | Gas Town |
|-----------|----------|-------------|----------|
| Multiple handlers per event | Yes (chained, ordered) | Yes (independent, parallel) | N/A |
| Inter-extension messaging | pi.events bus | Filesystem only | N/A |
| Shared state | Same heap + exports/imports | Filesystem only | N/A |
| Handler chaining (A's output -> B's input) | Yes | No | N/A |
| Custom event types | Yes (emit/on anything) | No | N/A |
| Extension dependency management | Yes (import order) | No | N/A |

**Winner: Pi Agent** -- three composability mechanisms (event bus, hook chaining, shared runtime) vs Claude Code's single mechanism (filesystem).

---

## Dimension 9: Developer Experience

### Pi Agent: TypeScript-Native

```
Setup:     Create ~/.pi/extensions/my-ext.ts
Build:     None (jiti handles TypeScript at runtime)
Types:     Full IntelliSense for all events and APIs
Debugging: Standard Node.js debugging (--inspect, breakpoints)
Testing:   Standard test frameworks (vitest, jest)
Feedback:  Instant (modify file, reload extension)
```

Example extension skeleton:

```typescript
import { PiExtension } from 'pi-agent';

export default function myExtension(pi: PiExtension) {
  // Full IntelliSense for pi.on(), pi.registerTool(), etc.
  pi.on('tool_call', (event) => {
    // TypeScript knows event.tool, event.input, etc.
    console.log(`Tool called: ${event.tool}`);
    return event;
  });
}
```

### Claude Code: Shell Script Wilderness

```
Setup:     Edit .claude/settings.json, create hook script
Build:     None
Types:     None (raw JSON parsing)
Debugging: echo/printf debugging, exit codes
Testing:   Manual (pipe JSON to script, check output)
Feedback:  Must trigger the event to test the hook
```

Example hook:

```bash
#!/bin/bash
# Read JSON from stdin
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name')

if [ "$TOOL" = "Write" ]; then
  echo '{"decision": "deny", "reason": "Not allowed"}'
else
  echo '{"decision": "allow"}'
fi
```

Or with a Python hook:

```python
import json, sys

event = json.load(sys.stdin)
if event.get('tool_name') == 'Write':
    json.dump({"decision": "deny", "reason": "Not allowed"}, sys.stdout)
else:
    json.dump({"decision": "allow"}, sys.stdout)
```

The "prompt" and "agent" handler types in Claude Code are notable -- they allow hooks to be LLM-powered, which is a unique capability Pi Agent does not offer natively. However, this comes at significant latency cost (an LLM call per hook invocation).

### Gas Town: Go Compilation Required

```
Setup:     Clone repository, set up Go toolchain
Build:     go build (189K LOC, significant compile time)
Types:     Full Go type system (but must read source to understand)
Debugging: Go debugging tools (dlv)
Testing:   Go test framework
Feedback:  Recompile after every change
```

### Developer Experience Comparison

| Aspect | Pi Agent | Claude Code | Gas Town |
|--------|----------|-------------|----------|
| Language | TypeScript | Any (bash, Python, etc.) | Go |
| Build step | None (jiti) | None | go build (slow) |
| Type safety | Full TypeScript | None | Full Go |
| IDE support | Full IntelliSense | Minimal | Full (Go LSP) |
| Iteration speed | Instant (file save) | Instant (file save) | Slow (recompile) |
| Debugging | Node.js inspect | printf/echo | dlv |
| Learning curve | Low (if you know TS) | Very low (shell scripts) | High (189K LOC Go) |
| Error messages | TypeScript stack traces | Exit codes + stderr | Go stack traces |
| LLM-powered hooks | Not built-in | Yes ("prompt" type) | No |

**Winner: Pi Agent** for harness building. Claude Code wins on accessibility (any language, zero learning curve for simple hooks). Gas Town loses on iteration speed.

---

## The TillDone Case Study

The TillDone extension demonstrates why Pi's architecture is uniquely suited for building custom harnesses. In approximately 700 lines of TypeScript, it implements a complete task management system that:

### What TillDone Does

1. **Registers a custom tool** (`task_manager`) that the agent can call to add, complete, and list tasks
2. **Hooks into `tool_call`** to BLOCK file-writing operations until tasks are defined
3. **Hooks into `agent_end`** to check whether all tasks are complete before allowing the session to end
4. **Hooks into `input`** to validate and route user commands
5. **Renders persistent UI widgets** showing task status
6. **Manages state across turns** using closure variables

### Why This Is Impossible in Claude Code

Let us trace each capability against Claude Code's hook system:

| TillDone Capability | Pi Agent | Claude Code Equivalent |
|---------------------|----------|----------------------|
| Register custom tool | `pi.registerTool()` | Must run MCP server (separate process, MCP protocol implementation, ~200+ lines minimum) |
| Block Write until tasks defined | `tool_call` returns `{ block: true }` | `PreToolUse` can deny, BUT cannot maintain "tasks defined" state across invocations without filesystem |
| Check task completion on agent_end | `agent_end` hook with closure state | No equivalent event. `Stop` exists but cannot block stopping. |
| Validate user input commands | `input` hook transforms/handles | `UserPromptSubmit` can modify but handling is limited |
| Render persistent UI widgets | Direct terminal access in-process | Not possible from a hook (separate process, no terminal access) |
| Cross-turn state in memory | Closure variables persist | Must serialize to filesystem on every invocation |

**To replicate TillDone in Claude Code, you would need:**
1. An MCP server for the custom tool (~200 lines)
2. A PreToolUse hook script with filesystem-based state (~50 lines)
3. A state file read/written on every hook invocation
4. No equivalent for agent_end checking (structural gap)
5. No equivalent for persistent UI widgets (structural gap)
6. No equivalent for input handling/routing (limited equivalent)

Total: ~300+ lines spread across 3 files, 2 processes, with two capabilities simply impossible.

**In Pi Agent:** 700 lines in a single file, single process, full capability.

### Why This Is Impractical in Gas Town

To add TillDone-equivalent functionality to Gas Town:
1. Modify Go source to add a task manager component
2. Add event handlers to the actor system
3. Implement UI rendering in Go's TUI framework
4. Recompile the 189K-line binary
5. Deploy and test

This is not a matter of writing an extension -- it requires becoming a Gas Town contributor.

---

## Event Mapping Tables

### Cross-Platform Event Equivalence

| Pi Agent Event | Claude Code Equivalent | Gap Analysis |
|---------------|----------------------|-------------|
| `session_start` | `SessionStart` | Equivalent, but Pi has full state access |
| `session_shutdown` | `SessionEnd` | Equivalent |
| `session_before_compact` | `PreCompact` | Pi can intervene; Claude Code can only observe |
| `session_compact` | (none) | Pi gets post-compaction notification |
| `session_before_fork` | (none) | **No Claude Code equivalent** |
| `session_fork` | (none) | **No Claude Code equivalent** |
| `session_before_switch` | (none) | **No Claude Code equivalent** |
| `session_switch` | (none) | **No Claude Code equivalent** |
| `session_before_tree` | (none) | **No Claude Code equivalent** |
| `session_tree` | (none) | **No Claude Code equivalent** |
| `input` | `UserPromptSubmit` | Pi can block/handle; Claude Code can only modify |
| `tool_call` | `PreToolUse` | Both can deny/modify; Pi has richer state access |
| `tool_result` | `PostToolUse` | Both observe; Pi can modify result |
| `tool_execution_start` | (none) | **No Claude Code equivalent** |
| `tool_execution_update` | (none) | **No Claude Code equivalent** |
| `tool_execution_end` | (none) | **No Claude Code equivalent** (PostToolUseFailure partial) |
| `BashSpawnHook` | (PreToolUse for Bash) | Pi can modify cmd/cwd/env; Claude Code generic deny only |
| `user_bash` | (none) | **No Claude Code equivalent** |
| `before_agent_start` | (none) | **No Claude Code equivalent** -- critical gap |
| `agent_start` | `SubagentStart` | Different scope (Pi: main agent; CC: subagents) |
| `agent_end` | `SubagentStop` / `TaskCompleted` | Different scope |
| `turn_start` | (none) | **No Claude Code equivalent** |
| `turn_end` | (none) | **No Claude Code equivalent** |
| `message_start` | (none) | **No Claude Code equivalent** |
| `message_update` | (none) | **No Claude Code equivalent** |
| `message_end` | (none) | **No Claude Code equivalent** |
| `model_select` | (none) | **No Claude Code equivalent** |
| `context` | (none) | **No Claude Code equivalent** -- most powerful gap |
| (none) | `PermissionRequest` | Pi handles permissions differently |
| (none) | `Notification` | Pi handles via message events |
| (none) | `TeammateIdle` | Pi does not have native multi-agent |
| (none) | `TaskCompleted` | Pi does not have native task system |

### Capability Heat Map

```
                        Pi Agent    Claude Code    Gas Town
                        --------    -----------    --------
Block tool calls          ████         ██░░          ░░░░
Modify tool args          ████         ██░░          ░░░░
Block user input          ████         ░░░░          ░░░░
Transform input           ████         ██░░          ░░░░
Modify bash cmd/env       ████         ░░░░          ░░░░
Register custom tools     ████         ██░░          ░░░░
Modify system prompt      ████         █░░░          ░░░░
Manipulate context        ████         ░░░░          ░░░░
Stream message access     ████         ░░░░          ░░░░
Branch/tree management    ████         ░░░░          ░░░░
Inter-hook communication  ████         █░░░          ░░░░
In-memory state           ████         ░░░░          ████
Zero-build iteration      ████         ████          ░░░░
Language flexibility      █░░░         ████          ░░░░
Multi-agent native        ░░░░         ████          ████
LLM-powered hooks         ░░░░         ████          ░░░░
Production scale (20+)    █░░░         ██░░          ████

████ = Full support
██░░ = Partial / limited
█░░░ = Minimal / workaround
░░░░ = Not available
```

---

## Implications for Harness Building

### What Is a "Custom Harness"?

A custom harness is an extension layer that controls an AI agent's behavior for a specific workflow. Examples:
- An orchestrator that prevents agents from writing code (L-Thread's core rule)
- A task manager that blocks operations until tasks are defined (TillDone)
- A security layer that audits and modifies all bash commands
- A cost controller that switches models based on task complexity
- A context manager that keeps critical information from being compacted away

### Harness Requirements Matrix

| Harness Requirement | Pi Agent | Claude Code | Gas Town |
|--------------------|----------|-------------|----------|
| **Behavioral gates** (block operations until conditions met) | Native -- any event can block | Limited -- only PreToolUse can deny | Not extensible |
| **State machines** (track workflow phase across turns) | Native -- closure state persists | Fragile -- filesystem state, race conditions | Not extensible |
| **Dynamic rules** (change rules based on context) | Native -- before_agent_start per turn | Not possible -- static additionalContext | Not extensible |
| **Context hygiene** (prevent context pollution) | Native -- context event prunes messages | Not possible | Not extensible |
| **Custom commands** (add new user-facing commands) | Native -- input event handles custom syntax | Not possible | gt CLI extensions (Go) |
| **Tool augmentation** (wrap existing tools with logic) | Native -- tool_call modifies args | Partial -- PreToolUse can modify input | Not extensible |
| **Observability** (log all operations with context) | Native -- all 25 events available | Partial -- 14 events, no streaming/context | Internal only |
| **Cost control** (model switching based on task) | Native -- model_select event | Not possible | Not extensible |
| **Multi-extension workflows** (extensions cooperate) | Native -- event bus, chaining, shared state | Not possible (isolated processes) | Not applicable |

### The L-Thread Orchestrator as a Case Study

The L-Thread Orchestrator, as implemented in this repository, demonstrates both the power and limitations of Claude Code's hook system:

**What it achieves with Claude Code hooks:**
- `SessionStart` hook injects orchestrator rules and state recovery context
- `PreCompact` hook preserves state before context compaction
- The combination enables crash recovery and session continuity

**What it cannot achieve with Claude Code hooks:**
- Cannot enforce "never write code" at the hook level (relies on prompt engineering, not mechanical enforcement)
- Cannot dynamically update rules based on sprint progress
- Cannot prune failed attempt context to prevent the agent from repeating mistakes
- Cannot register custom orchestrator tools (must use bash commands)
- Cannot intercept and modify bash commands before execution
- Cannot coordinate multiple hooks with shared state

**If L-Thread were built on Pi Agent instead:**
- `tool_call` hook could mechanically block `Edit` and `Write` on code files (not just prompt-based)
- `before_agent_start` could inject current sprint state into the system prompt every turn
- `context` event could prune messages from failed agent interactions
- `BashSpawnHook` could intercept `gh` commands and validate them
- Custom tools could replace bash-based state management
- Inter-hook state would enable the E2E testing gate to be enforced mechanically

---

## Conclusions

### The Hierarchy of Extensibility

```
POWER                          ACCESSIBILITY
  ^                                  ^
  |                                  |
  |  Pi Agent                        |  Claude Code
  |  (in-process TS,                 |  (shell hooks,
  |   25 events,                     |   14 events,
  |   full state,                    |   any language,
  |   block anything,                |   zero learning curve)
  |   custom tools,                  |
  |   context manipulation)          |
  |                                  |
  |        Gas Town                  |
  |        (full internal power,     |
  |         zero extensibility)      |
  |                                  |
  +---------------------------------->
                LOCKED-IN-NESS
```

### When Each System Is the Right Choice

**Choose Pi Agent's event model when:**
- Building a custom harness that must mechanically enforce behavioral rules
- Creating extensions that need cross-turn state management
- Requiring context window manipulation (pruning, injection, prioritization)
- Building composable extension stacks where multiple extensions cooperate
- Needing custom tools that share state with hooks
- Requiring per-turn system prompt modification
- Performance-sensitive workflows where hook latency matters

**Choose Claude Code's hook model when:**
- Simple gate-keeping (allow/deny specific tools)
- Language-agnostic hook implementation is required
- LLM-powered hooks are needed (the "prompt" handler type)
- Multi-agent orchestration is the primary concern (TeammateIdle, TaskCompleted)
- Zero learning curve is essential (any shell script works)
- The hook does not need to maintain state across invocations
- Integration with existing CLI tools is the primary use case

**Choose Gas Town when:**
- You are building the factory itself, not extending it
- 20-30+ agent scale requires industrial infrastructure
- You are willing to modify Go source for customization
- Runtime-agnostic agent support is needed

### The Fundamental Architectural Insight

The difference between Pi Agent and Claude Code is not just "more events" or "TypeScript vs shell." It is the difference between **an extension that lives inside the agent** and **an extension that observes the agent from outside**.

Claude Code hooks are security cameras -- they can see events and trigger alarms, but they cannot physically intervene in the agent's thought process. Pi Agent hooks are part of the agent's nervous system -- they can intercept signals, modify reflexes, and reshape perception.

For building custom harnesses -- systems that reliably control agent behavior for specific workflows -- the nervous system model is categorically superior. The security camera model works for simple gatekeeping but fundamentally cannot achieve the depth of control needed for sophisticated workflow enforcement.

This is not a criticism of Claude Code's design. Shell-based hooks optimize for different values: accessibility, safety, language agnosticism, and simplicity. These are valid engineering trade-offs. But when the goal is building a custom harness that mechanically enforces complex behavioral rules, Pi Agent's in-process TypeScript event system is the architecturally superior foundation.

---

*Research compiled from Pi Agent documentation, Claude Code hooks documentation, Gas Town source analysis, the L-Thread Orchestrator v2.0 codebase, and the TillDone extension analysis.*
