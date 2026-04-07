# Pi Agent Core Architecture and SDK: Deep Implementation Reference

**Date:** 2026-03-05
**Classification:** PhD-Level Systems Research
**Focus:** Implementation-relevant architecture for orchestrator construction
**Source Repository:** [badlogic/pi-mono](https://github.com/badlogic/pi-mono) (3,037 commits, 217 tags, 96.6% TypeScript)

---

## Executive Summary

Pi Agent is a layered TypeScript monorepo (`pi-mono`) providing a coding agent CLI, unified LLM API, TUI framework, and embeddable SDK. Created by Mario Zechner (libGDX, 24.8K GitHub stars), it powers OpenClaw (145K stars) and has achieved 3.17M monthly npm downloads. This document is a deep architectural reference focused on the internals that matter for building an orchestrator on top of Pi: the SDK's `createAgentSession()` factory, the agent loop mechanics in `pi-agent-core`, the 25+ extension events with their in-process TypeScript execution model, the RPC protocol for headless agent control, session persistence via tree-structured JSONL, and the `pi-ai` transport abstraction that normalizes 324 models across 7 wire protocols into a single `streamFn` interface.

The core thesis: Pi's architecture is uniquely suited for orchestration because it separates **think-and-act** (the agent loop) from **connect-queue-remember-extend** (the embedding application's responsibility). An orchestrator imports Pi at the SDK level, registers custom tools for inter-agent communication, hooks lifecycle events for coordination, and manages multiple `AgentSession` instances -- each potentially running a different model -- through a unified programmatic interface. Every capability that other tools bake into their core (sub-agents, permissions, plan mode, multi-agent coordination) exists in Pi as an optional extension, meaning an orchestrator can compose exactly the behavior set it needs without carrying dead weight in the context window.

---

## 1. Core Architecture: The Monorepo Stack

### 1.1 Package Layering

Pi is not a monolithic CLI -- it is a four-layer SDK stack where each layer can be imported independently:

```
pi-coding-agent    (L4: Application layer -- CLI, tools, sessions, extensions)
       |
pi-agent-core      (L3: Runtime layer -- agent loop, tool dispatch, state, queues)
       |
    pi-ai           (L2: LLM abstraction -- 324 models, 7 wire protocols, streaming)
       |
    pi-tui           (L1: Terminal UI -- ink-based rendering, widgets, themes)
```

**For orchestrator construction, L2 + L3 + L4 are the relevant layers.** L1 (pi-tui) is only needed if the orchestrator has its own terminal interface.

| Package | npm | Purpose | Orchestrator Relevance |
|---------|-----|---------|----------------------|
| `@mariozechner/pi-ai` | Published | Unified LLM API, model catalog, streaming normalization | Direct import for custom agent loops, model routing |
| `@mariozechner/pi-agent-core` | Published | Agent loop, tool execution, state management, message queues | Understanding the execution model the SDK wraps |
| `@mariozechner/pi-coding-agent` | Published | Full coding agent with tools, sessions, extensions | Primary import for SDK-mode orchestration |
| `@mariozechner/pi-tui` | Published | Terminal UI components | Only if building TUI dashboard |

### 1.2 The Four Operating Modes

Pi runs in four modes, each serving a different integration pattern:

| Mode | Interface | Activation | Orchestrator Use Case |
|------|-----------|------------|----------------------|
| **Interactive** | Terminal TUI | Default | Developer use, debugging agents |
| **Print/JSON** | stdout text/JSON | `--mode print` / `--mode json` | CI/CD pipelines, scripting |
| **RPC** | stdin/stdout JSONL | `--mode rpc` | External process control (non-Node.js orchestrators) |
| **SDK** | TypeScript API | `createAgentSession()` | **Primary mode**: in-process embedding |

**The SDK mode is the correct choice for an orchestrator.** It provides full programmatic control with zero serialization overhead. RPC mode is the fallback for polyglot orchestrators that cannot import Node.js modules directly.

---

## 2. SDK Mode: `createAgentSession()` Deep Dive

### 2.1 Factory Function Signature

```typescript
import {
  AuthStorage,
  createAgentSession,
  ModelRegistry,
  SessionManager
} from "@mariozechner/pi-coding-agent";

const { session } = await createAgentSession({
  // Session persistence
  sessionManager: SessionManager.inMemory(),      // or SessionManager.files({ sessionsDir })

  // Authentication
  authStorage: AuthStorage.create(),               // or AuthStorage.create(customPath)
  modelRegistry: new ModelRegistry(authStorage),   // resolves available models from API keys

  // Model configuration
  model: getModel("anthropic", "claude-opus-4-5"), // optional, uses default if omitted
  thinkingLevel: "medium",                         // "off"|"minimal"|"low"|"medium"|"high"|"xhigh"
  scopedModels: [{ model, thinkingLevel }],        // for Ctrl+P cycling in interactive mode

  // Working environment
  cwd: process.cwd(),                              // working directory for tool execution
  agentDir: "~/.pi/agent",                         // global config/extensions/sessions dir

  // Customization
  tools: [readTool, bashTool],                     // override default tool set
  systemPrompt: "Custom system instructions",      // replace default system prompt
  resourceLoader: new DefaultResourceLoader(),     // override extension/skill/prompt discovery
});
```

**Critical detail for orchestrators:** The `resourceLoader` parameter controls which extensions, skills, prompts, themes, and context files are loaded. A custom `ResourceLoader` can restrict or expand what each agent instance sees, enabling role-specific agent configurations from a single codebase.

### 2.2 The AgentSession Interface

The returned `session` object is the primary control surface:

```typescript
interface AgentSession {
  // === Prompting ===
  prompt(text: string, options?: PromptOptions): Promise<void>;
  steer(text: string): Promise<void>;      // interrupt during streaming, skip remaining tools
  followUp(text: string): Promise<void>;   // queue for after agent completes

  // === Event Subscription ===
  subscribe(listener: (event: AgentSessionEvent) => void): () => void;  // returns unsubscribe fn

  // === State Access ===
  sessionFile: string | undefined;
  sessionId: string;
  agent: Agent;                            // access to AgentState, replaceMessages(), waitForIdle()
  model: Model | undefined;
  thinkingLevel: ThinkingLevel;
  messages: AgentMessage[];
  isStreaming: boolean;

  // === Model Control ===
  setModel(model: Model): Promise<void>;
  setThinkingLevel(level: ThinkingLevel): void;
  cycleModel(): Promise<ModelCycleResult | undefined>;

  // === Session Management ===
  newSession(options?: { parentSession?: string }): Promise<boolean>;
  switchSession(sessionPath: string): Promise<boolean>;
  fork(entryId: string): Promise<{ selectedText: string; cancelled: boolean }>;
  compact(customInstructions?: string): Promise<CompactionResult>;

  // === Control ===
  sendHookMessage(message: HookMessage, triggerTurn?: boolean): Promise<void>;
  abort(): Promise<void>;
  dispose(): void;
}
```

**Key orchestrator patterns:**

1. **`session.prompt()` + `session.subscribe()`**: Send task, stream results. The subscribe function returns an unsubscribe callback -- use it for cleanup when rotating agents.

2. **`session.steer()`**: Mid-execution course correction. Delivers after the current tool finishes but skips remaining queued tools. This is how an orchestrator can interrupt a stuck agent.

3. **`session.agent.waitForIdle()`**: Blocks until all processing completes. Essential for sequential orchestration patterns.

4. **`session.compact()`**: Manual context compaction with custom instructions. The orchestrator can trigger compaction with summarization that preserves orchestration-relevant context.

5. **`session.dispose()`**: Tears down the session. Must be called when recycling agents.

### 2.3 PromptOptions and Image Support

```typescript
interface PromptOptions {
  images?: Array<{
    type: "image";
    source: {
      type: "base64";
      mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp";
      data: string;
    };
  }>;
  streamingBehavior?: "steer" | "followUp";  // required if agent is currently streaming
}
```

The `streamingBehavior` parameter is mandatory when calling `prompt()` while the agent is already processing. Without it, the call throws. This prevents accidental message collision in concurrent orchestration scenarios.

### 2.4 Event Types for Orchestrator Consumption

Subscribe via `session.subscribe(listener)` to receive these event types:

| Event Type | Payload | Orchestrator Use |
|------------|---------|-----------------|
| `agent_start` | -- | Track when agent begins processing |
| `agent_end` | `{ messages }` | Collect final output, all new messages |
| `turn_start` | -- | Track LLM response + tool call cycles |
| `turn_end` | `{ message, toolResults }` | Inspect each reasoning step |
| `message_start` | -- | Track streaming boundaries |
| `message_update` | `{ assistantMessageEvent }` | Stream text_delta, thinking_delta |
| `message_end` | -- | Message complete |
| `tool_execution_start` | `{ toolName }` | Monitor which tools are active |
| `tool_execution_update` | streaming output | Live tool output (e.g., bash stdout) |
| `tool_execution_end` | `{ isError }` | Detect tool failures |
| `auto_compaction_start/end` | -- | Context window management |
| `auto_retry_start/end` | -- | Rate limit / error recovery |

**Pattern for orchestrator event consumption:**

```typescript
session.subscribe((event) => {
  switch (event.type) {
    case "agent_end":
      // Collect results, update orchestrator state, decide next action
      break;
    case "tool_execution_end":
      if (event.isError) {
        // Log failure, potentially steer or abort
      }
      break;
    case "message_update":
      if (event.assistantMessageEvent.type === "text_delta") {
        // Stream to orchestrator dashboard or log
      }
      break;
  }
});
```

---

## 3. The Agent Loop: `pi-agent-core` Internals

### 3.1 Execution Flow

The `Agent` class in `@mariozechner/pi-agent-core` implements the standard ReAct loop:

```
User Message -> LLM Call -> [Tool Calls?]
                              |
                   Yes: Execute tools in parallel
                              |
                   Feed tool results back to LLM
                              |
                   [More tool calls?] -> Loop
                              |
                   No: Return assistant message
```

**Critical implementation details:**

1. **Tool calls within a single turn execute in parallel.** If the LLM requests `read` and `bash` simultaneously, both run concurrently. The `pendingToolCalls` Set tracks active executions.

2. **The loop continues until the LLM stops making tool calls AND all queued messages are processed.** This means follow-up messages can extend execution beyond the initial prompt.

3. **Steering messages interrupt gracefully.** When a steering message arrives, the agent finishes the currently-executing tool, generates error results for remaining pending tools ("skipped due to steering"), and delivers the steering message to the LLM.

### 3.2 Message Queues

The agent maintains two parallel queues for dynamic interaction during streaming:

| Queue | Behavior | Delivery Mode | Orchestrator Use |
|-------|----------|---------------|-----------------|
| **Steering** | Interrupts current operation | After current tool, skip remaining | Course correction, emergency stop |
| **Follow-up** | Waits for agent to become idle | After all processing completes | Sequential task chaining |

Both queues support two delivery modes:
- **one-at-a-time** (default): Delivers one message, waits for LLM response, then delivers next
- **all-at-once**: Delivers all queued messages in a single batch

### 3.3 State Management

All agent state lives in a single `AgentState` object:

```typescript
interface AgentState {
  messages: AgentMessage[];       // conversation history
  model: Model;                   // current model configuration
  thinkingLevel: ThinkingLevel;   // reasoning depth
  systemPrompt: string;           // system instructions
  tools: Tool[];                  // registered tool set
}
```

The state object is the single source of truth. It can be serialized for persistence, inspected for debugging, and replaced wholesale via `session.agent.replaceMessages()` for branching/restoration patterns.

### 3.4 The `streamFn` Abstraction

The agent does not know how messages reach the LLM. The `streamFn` property defines the transport:

```typescript
session.agent.streamFn = customStreamFunction;
```

By default, `streamFn` is `streamSimple` from `@mariozechner/pi-ai`, which normalizes all provider-specific streaming formats into a unified event set:

| Normalized Event | Description |
|-----------------|-------------|
| `start` | Stream initiated |
| `text_start` / `text_delta` / `text_end` | Text generation lifecycle |
| `thinking_start` / `thinking_delta` / `thinking_end` | Extended thinking (when enabled) |
| `toolcall_start` / `toolcall_delta` / `toolcall_end` | Tool call streaming |
| `done` | Stream complete |
| `error` | Stream failure |

**Orchestrator implication:** You can wrap `streamFn` to inject headers, add logging, implement rate limiting, or route different requests to different providers -- all without modifying the agent loop.

---

## 4. Extension API Surface: The Full Picture

### 4.1 Extension Loading and Discovery

Extensions are TypeScript modules loaded via `jiti` (Just-In-Time TypeScript compilation -- no build step required). Discovery locations:

| Location | Scope | Auto-loaded |
|----------|-------|-------------|
| `~/.pi/agent/extensions/*.ts` | Global | Yes |
| `.pi/extensions/*.ts` | Project-local | Yes |
| Subdirectory `index.ts` files | Either | Yes |
| `settings.json` paths | Configured | Yes |
| `-e <name>` CLI flag | Session-specific | Manual |
| Pi packages (npm/git) | Installable | Via package config |

**Extension entry point:**

```typescript
export default function(pi: ExtensionAPI) {
  // Registration phase -- runs once at load time
  pi.on("session_start", async (event, ctx) => { /* ... */ });
  pi.registerTool({ name: "my_tool", /* ... */ });
  pi.registerCommand("my_cmd", { /* ... */ });
  pi.registerShortcut("ctrl+x", { handler: async (ctx) => { /* ... */ } });
  pi.registerFlag("my-flag", { description: "...", handler: async (value, ctx) => { /* ... */ } });
}
```

### 4.2 Complete Event Taxonomy

Pi fires 25+ extension events across 7 categories. Every event handler receives `(event, ctx: ExtensionContext)` and executes in-process (same Node.js runtime as the agent):

#### Session Events
| Event | When Fired | Return Value Effect |
|-------|-----------|-------------------|
| `session_start` | Initial session load | -- |
| `session_before_switch` | Before session change | `{cancel: true}` prevents switch |
| `session_switch` | After session changed | -- |
| `session_before_fork` | Before fork operation | Can skip conversation restore |
| `session_fork` | After fork completed | -- |
| `session_before_compact` | Before compaction | Custom summary support |
| `session_compact` | After compaction | -- |
| `session_before_tree` | Before tree navigation | -- |
| `session_tree` | After tree navigation | -- |
| `session_shutdown` | Session exit | -- |

#### Agent Events
| Event | When Fired | Return Value Effect |
|-------|-----------|-------------------|
| `input` | User message submitted | Can intercept/transform input |
| `before_agent_start` | Before agent processing | Inject messages, modify system prompt |
| `agent_start` | Agent begins processing | -- |
| `agent_end` | Agent completes | -- |
| `context` | Before every LLM call | **Rewrite message array** -- most powerful event |

#### Turn Events
| Event | When Fired | Return Value Effect |
|-------|-----------|-------------------|
| `turn_start` | Tool-calling loop iteration begins | -- |
| `turn_end` | Loop iteration ends | -- |

#### Message Events
| Event | When Fired | Return Value Effect |
|-------|-----------|-------------------|
| `message_start` | LLM streaming begins | -- |
| `message_update` | Streaming delta | -- |
| `message_end` | Streaming complete | -- |

#### Tool Events
| Event | When Fired | Return Value Effect |
|-------|-----------|-------------------|
| `tool_call` | Before tool execution | `{block: true, reason: "..."}` blocks execution |
| `tool_execution_start` | Tool begins | -- |
| `tool_execution_update` | Tool streaming output | -- |
| `tool_execution_end` | Tool completes | -- |
| `tool_result` | Tool result available | **Modify tool output** before LLM sees it |

#### Other Events
| Event | When Fired | Return Value Effect |
|-------|-----------|-------------------|
| `model_select` | Model switching/cycling | -- |
| `user_bash` | User-initiated shell command | -- |

### 4.3 The `context` Event: Context Engineering Power

The `context` event fires before every LLM call and allows extensions to rewrite the message array the model sees:

```typescript
pi.on("context", async (event, ctx) => {
  // event.messages is the full conversation history
  // Modify it in-place or return a replacement

  // Example: Drop large tool results older than 10 messages
  event.messages = event.messages.filter((msg, i) => {
    if (i < event.messages.length - 10 && msg.type === "tool_result" && msg.content.length > 5000) {
      return false;
    }
    return true;
  });
});
```

**This is the single most important event for orchestrator construction.** It enables:

- Injecting orchestrator state into agent context at every turn
- Filtering irrelevant history to maximize effective context
- Implementing custom compaction strategies per agent role
- Injecting inter-agent messages without polluting the session log
- Dynamic system prompt modification based on task phase

Claude Code has no equivalent. Its hooks can block tool calls or run side effects, but they cannot modify what the LLM sees mid-conversation.

### 4.4 Tool Registration API

```typescript
pi.registerTool({
  name: "tool_name",
  label: "Human-Readable Name",
  description: "What this tool does (included in system prompt)",
  parameters: Type.Object({
    fieldName: Type.String({ description: "Parameter description" }),
    optional: Type.Optional(Type.Number()),
  }),
  async execute(toolCallId, params, signal, onUpdate, ctx) {
    // signal: AbortSignal for cancellation
    // onUpdate: callback for streaming output
    // ctx: ExtensionContext with full session access

    onUpdate({ type: "text", text: "Processing..." });  // stream progress

    return {
      content: [{ type: "text", text: "Result" }],
      details: { key: "value" }  // metadata, not sent to LLM
    };
  },
  renderCall(params) { /* custom TUI rendering */ },
  renderResult(result) { /* custom TUI rendering */ },
});
```

**Tools registered at any point are immediately available** -- during extension load, inside event handlers, inside command handlers. They appear in `pi.getAllTools()` and are callable by the LLM without requiring `/reload`.

**Orchestrator-relevant tool patterns:**
- Register an `orchestrator_report` tool that agents use to send structured status updates
- Register a `request_help` tool that triggers the orchestrator's roadblock recovery
- Register a `claim_file` tool for file-level locking across parallel agents

### 4.5 ExtensionContext (`ctx`) API

Every event handler and tool execution receives `ctx: ExtensionContext`:

| Category | Methods |
|----------|---------|
| **UI** | `ctx.ui.notify()`, `ctx.ui.confirm()`, `ctx.ui.select()`, `ctx.ui.input()`, `ctx.ui.setStatus()`, `ctx.ui.setWidget()`, `ctx.ui.custom()` |
| **Session** | `ctx.sessionManager`, `ctx.cwd`, `ctx.newSession()`, `ctx.fork()`, `ctx.compact()` |
| **Model** | `ctx.modelRegistry`, `ctx.model` |
| **State** | `ctx.isIdle()`, `ctx.hasPendingMessages()`, `ctx.getContextUsage()`, `ctx.getSystemPrompt()` |
| **Control** | `ctx.abort()`, `ctx.shutdown()`, `ctx.waitForIdle()`, `ctx.reload()` |
| **Environment** | `ctx.hasUI` (boolean -- critical for headless SDK mode) |

### 4.6 State Persistence via Custom Entries

Extensions can persist arbitrary state that survives session restarts:

```typescript
// Store state (does NOT go to LLM context)
pi.appendEntry("orchestrator-state", {
  phase: "testing",
  completedIssues: ["INC-001", "INC-002"],
  activeAgents: 3
});

// Inject messages that DO participate in LLM context
pi.sendMessage({
  role: "user",
  content: "Context update: INC-003 is now in review.",
  customType: "orchestrator-context-injection",
  display: false  // hidden from TUI but visible to LLM
});
```

The distinction between `appendEntry` (persisted, invisible to LLM) and `sendMessage` with `display: false` (visible to LLM, hidden from TUI) is critical for orchestrator state management.

---

## 5. RPC Protocol: Headless Agent Control

### 5.1 Protocol Fundamentals

For orchestrators that cannot import the Node.js SDK (e.g., written in Python, Go, Rust), RPC mode provides equivalent control:

```bash
pi --mode rpc --no-session  # start headless agent
```

Protocol: line-delimited JSON over stdin (commands) / stdout (events + responses).

### 5.2 Command Taxonomy

| Category | Commands |
|----------|----------|
| **Prompting** | `prompt`, `steer`, `follow_up`, `abort` |
| **State** | `get_state`, `get_messages`, `get_session_stats` |
| **Model** | `set_model`, `cycle_model`, `get_available_models`, `set_thinking_level`, `cycle_thinking_level` |
| **Session** | `new_session`, `switch_session`, `fork`, `set_session_name`, `export_html` |
| **Compaction** | `compact`, `set_auto_compaction` |
| **Queuing** | `set_steering_mode`, `set_follow_up_mode` |
| **Execution** | `bash`, `abort_bash` |
| **Retry** | `set_auto_retry`, `abort_retry` |
| **Discovery** | `get_commands` |

### 5.3 Event Stream

The agent emits structured events to stdout:

```json
{"type": "agent_start"}
{"type": "message_update", "assistantMessageEvent": {"type": "text_delta", "delta": "Let me"}}
{"type": "tool_execution_start", "toolName": "bash"}
{"type": "tool_execution_update", "output": "..."}
{"type": "tool_execution_end", "isError": false}
{"type": "agent_end", "messages": [...]}
```

### 5.4 Extension UI Protocol in RPC Mode

When extensions call `ctx.ui.select()`, `ctx.ui.confirm()`, etc., in RPC mode these are translated into request/response sub-protocol:

1. Extension emits `extension_ui_request` on stdout
2. Extension blocks waiting for response
3. Client sends `extension_ui_response` on stdin with matching `id`
4. Extension resumes

This means an orchestrator using RPC mode can programmatically answer extension UI prompts -- enabling fully unattended operation.

### 5.5 Response Correlation

All commands support an optional `id` field:

```json
// stdin
{"type": "prompt", "message": "Fix the bug in auth.ts", "id": "task-42"}

// stdout (eventually)
{"type": "response", "command": "prompt", "success": true, "id": "task-42"}
```

This enables multiplexed command dispatch -- multiple outstanding requests correlated by ID.

---

## 6. Session Persistence: Tree-Structured JSONL

### 6.1 Storage Format

Sessions are stored as JSONL files at `~/.pi/agent/sessions/--<path>--/<timestamp>_<uuid>.jsonl`, where `<path>` is the working directory with `/` replaced by `-`.

Every line is a JSON object with a `type` field. The first line is always a SessionHeader:

```json
{"type":"session","version":3,"id":"abc123","timestamp":"2026-03-05T10:00:00Z","cwd":"/project"}
```

### 6.2 Tree Structure

All entries have `id` (8-char hex) and `parentId` fields, forming a directed acyclic graph. This enables:

- **In-place branching** without creating new files
- **Fork** creates a new session file with `parentSession` pointer
- **Navigation** via `/tree` displays the branch structure
- **Context reconstruction** by traversing from current entry to root via `parentId` chain

### 6.3 Entry Types

| Type | Purpose | LLM Visible |
|------|---------|-------------|
| `SessionMessageEntry` | User, assistant, tool result messages | Yes |
| `ModelChangeEntry` | Model switch record | No |
| `ThinkingLevelChangeEntry` | Reasoning level change | No |
| `CompactionEntry` | Summary replacing older messages | Yes (as summary) |
| `BranchSummaryEntry` | LLM-generated summary of abandoned branch | Yes (when switching) |
| `CustomEntry` | Extension state persistence | No |
| `CustomMessageEntry` | Extension-injected context | Yes |
| `LabelEntry` | User annotation of decision points | No |

### 6.4 Compaction Semantics

When context approaches the model's window limit, auto-compaction fires:

1. Older messages are summarized into a `CompactionEntry`
2. Summary includes `firstKeptEntryId` and `tokensBefore`
3. **The full history remains in the JSONL file** -- compaction is lossy in-memory but lossless on disk
4. The `/tree` command can navigate back to pre-compaction entries

**Orchestrator relevance:** By hooking `session_before_compact`, an orchestrator extension can inject custom compaction instructions that preserve orchestration-critical context (e.g., "Always preserve the current task assignment and issue status in the summary").

---

## 7. Model Routing: The `pi-ai` Transport Layer

### 7.1 The Seven Wire Protocols

Despite dozens of LLM providers, Pi normalizes to seven wire protocols:

| Protocol | SDK Used | Compatible Providers |
|----------|----------|---------------------|
| `openai-completions` | OpenAI SDK | OpenAI, Groq, Cerebras, xAI, OpenRouter, Ollama, vLLM, Mistral, HuggingFace, any OpenAI-compatible |
| `openai-responses` | OpenAI SDK | OpenAI (newer API) |
| `openai-codex-responses` | OpenAI SDK | OpenAI Codex |
| `azure-openai-responses` | OpenAI SDK | Azure OpenAI |
| `anthropic-messages` | Anthropic SDK | Anthropic, Amazon Bedrock (Anthropic) |
| `google-generative-ai` | Google SDK | Google Gemini |
| `google-vertex` | Google SDK | Google Vertex AI |

### 7.2 Model Catalog

324+ model definitions auto-generated at build time from models.dev and OpenRouter metadata:

```typescript
interface ModelDefinition {
  id: string;
  provider: string;
  protocol: string;       // one of the 7 wire protocols
  contextWindow: number;
  maxOutputTokens: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  capabilities: {
    vision: boolean;
    toolUse: boolean;
    streaming: boolean;
    reasoning: boolean;
  };
}
```

### 7.3 Orchestrator Model Routing Strategy

Because each `AgentSession` can run a different model, an orchestrator can implement cost/capability routing:

| Agent Role | Suggested Model | Reasoning |
|-----------|----------------|-----------|
| Orchestrator (coordinator) | claude-opus-4-5 | Complex reasoning, planning |
| Frontend specialist | gpt-4o | Fast, good at UI code |
| Testing specialist | claude-sonnet-4 | Good balance of speed/quality |
| Documentation | gemini-2-pro | Cost-effective for text |
| Simple file ops | llama-4-70b (local) | Zero API cost, privacy |

Model switching is also possible mid-session via `session.setModel()`, enabling dynamic routing based on task complexity.

---

## 8. Orchestration Capabilities: Multi-Agent Patterns

### 8.1 Native vs Extension-Based

Pi deliberately does not include built-in sub-agent support. All multi-agent patterns are implemented as extensions:

| Extension | Pattern | Communication |
|-----------|---------|--------------|
| `subagent-widget` | Spawn background Pi instances via `/sub` | File-based |
| `agent-team` | Dispatcher with specialist roster | YAML-defined roles |
| `agent-chain` | Sequential pipeline (output N -> input N+1) | `$INPUT` variable |
| `pi-subagents` (nicobailon) | Async delegation with truncation, artifacts | Status files, JSONL logs |
| `pi-collaborating-agents` (baochunli) | File reservation + messaging | Inter-agent messages |
| `pi-messenger` (nicobailon) | Chat room model for agents | Real-time messaging |
| `pi-side-agents` (pasky) | Parallel side agents in tmux + git worktrees | Filesystem isolation |

### 8.2 The SDK-Mode Multi-Agent Pattern

The most powerful orchestration pattern uses `createAgentSession()` to manage multiple in-process agents:

```typescript
// Orchestrator manages multiple sessions
const agents = new Map<string, AgentSession>();

// Spawn a specialist
const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),  // ephemeral
  authStorage,
  modelRegistry,
  model: getModel("anthropic", "claude-sonnet-4"),
  systemPrompt: "You are a frontend specialist. Focus only on React components.",
  cwd: "/project",
  tools: [readTool, writeTool, editTool, bashTool, reportToOrchestratorTool],
});

agents.set("frontend-agent", session);

// Send task
await session.prompt("Implement the login form in src/components/Login.tsx");

// Wait for completion
await session.agent.waitForIdle();

// Collect results
const messages = session.messages;
const lastAssistant = messages.filter(m => m.role === "assistant").pop();
```

### 8.3 Inter-Agent Communication via Custom Tools

Register tools that enable agents to communicate with the orchestrator:

```typescript
pi.registerTool({
  name: "report_status",
  description: "Report your current status to the orchestrator",
  parameters: Type.Object({
    status: Type.String({ description: "current|blocked|complete|failed" }),
    summary: Type.String({ description: "Brief description of progress" }),
    artifacts: Type.Optional(Type.Array(Type.String(), { description: "Files created/modified" })),
  }),
  async execute(toolCallId, params, signal, onUpdate, ctx) {
    orchestratorBus.emit("agent-status", { agent: agentId, ...params });
    return { content: [{ type: "text", text: "Status reported." }] };
  }
});
```

### 8.4 Nesting Limits

Default Pi subagent nesting is limited to 2 levels: main session -> subagent -> sub-subagent. Any deeper spawning is blocked with an error. This prevents runaway agent trees but can be worked around in SDK mode where the orchestrator manages the hierarchy explicitly.

### 8.5 Resource Isolation

Each `AgentSession` has its own:
- Message history and context window
- Tool set (can be different per agent)
- Model configuration
- Working directory (`cwd`)
- Extension set (via `resourceLoader`)

There is **no shared memory between sessions**. Communication must happen through external channels (files, custom tools, message bus). This is a deliberate design choice -- full isolation prevents context contamination between specialists.

---

## 9. Comparison with Claude Code

### 9.1 Architectural Comparison

| Dimension | Pi Agent | Claude Code |
|-----------|----------|-------------|
| **System prompt** | ~200 tokens (core) / <1,000 (with tools) | ~10,000 tokens |
| **Core tools** | 4 (read, write, edit, bash) + 3 optional | 15-20 built-in |
| **Extension model** | TypeScript in-process (microsecond latency) | Shell hooks (millisecond, process spawn) |
| **Event count** | 25+ events across 7 categories | ~14 hooks |
| **Context rewriting** | `context` event modifies messages pre-LLM | Not possible |
| **Model support** | 324 models, 20+ providers | Claude only |
| **Sub-agents** | Extensions (pi-subagents, agent-team, etc.) | Built-in Task tool |
| **Sub-agent overhead** | Configurable (SDK mode: near-zero) | ~20K tokens fixed |
| **Sub-agent nesting** | 2 levels default (extensible in SDK) | 1 level (subagents cannot use Task tool) |
| **MCP support** | No (extension-based adapters exist) | Native, 100+ servers |
| **Session format** | Tree-structured JSONL with branching | Linear session files |
| **Permission model** | None by default (extensions add it) | Granular built-in |
| **Open source** | MIT license, full source | Closed source |
| **Source of truth** | Source code | Reverse engineering + docs |

### 9.2 Hook/Event System Comparison

| Capability | Pi Extension Events | Claude Code Hooks |
|-----------|-------------------|-------------------|
| Block tool calls | `tool_call` -> `{block: true}` | `PreToolUse` -> exit code |
| Modify tool results | `tool_result` event | Not possible |
| Rewrite context | `context` event | Not possible |
| Inject messages | `before_agent_start` / `sendMessage` | Not possible |
| Custom tools | `pi.registerTool()` | MCP servers (external process) |
| State persistence | `pi.appendEntry()` | File-based (manual) |
| UI modification | `ctx.ui.setWidget()`, `ctx.ui.custom()` | Not possible |
| Session lifecycle | 10 session events | `SessionStart`, `Stop` |
| Model switching | `model_select` event | Not possible |
| Input interception | `input` event | Not possible |

**The gap is significant.** Pi's extension system is a full application framework. Claude Code's hooks are a safety/side-effect mechanism. For orchestrator construction, Pi's in-process events with full state access and context rewriting capability provide a fundamentally more powerful foundation.

### 9.3 Token Economics

| Scenario | Pi (SDK mode) | Claude Code (Task tool) |
|----------|---------------|------------------------|
| Spawn 1 agent | ~1K tokens (system prompt + tools) | ~20K tokens (system prompt + tools + overhead) |
| Spawn 5 agents | ~5K tokens total | ~100K tokens total |
| Orchestrator context overhead | Custom (you control the prompt) | Fixed ~10K for orchestrator itself |
| **Total for orchestrator + 5 agents** | **~6K tokens** | **~110K tokens** |

This 18x overhead difference means Pi can support significantly more concurrent agents within the same cost budget, or significantly longer sessions before compaction.

---

## 10. Key Takeaways for Orchestrator Implementation

### 10.1 Architecture Decision: SDK Mode as Primary Interface

Use `createAgentSession()` to spawn and manage agent instances. Each agent gets:
- Custom `systemPrompt` defining its specialist role
- Custom `tools` array including orchestrator communication tools
- Custom `model` matched to task complexity
- Custom `resourceLoader` restricting extensions to role-appropriate set
- `SessionManager.inMemory()` for ephemeral agents, `SessionManager.files()` for persistent ones

### 10.2 The Three Essential Custom Tools

Every orchestrated agent should receive three orchestrator tools:

1. **`report_status`** -- Structured status reporting (current/blocked/complete/failed)
2. **`request_context`** -- Ask the orchestrator for information from other agents' work
3. **`claim_resource`** -- File-level locking to prevent parallel agents from colliding

### 10.3 Context Engineering via `context` Event

The `context` event is the orchestrator's most powerful lever. Use it to:
- Inject current task status and dependencies before every LLM call
- Filter out irrelevant history to keep agents focused
- Implement role-specific context windows (frontend agent doesn't see backend discussions)
- Add dynamic few-shot examples based on current task type

### 10.4 Session Strategy

| Agent Type | Session Strategy | Reasoning |
|-----------|-----------------|-----------|
| Orchestrator | `SessionManager.files()` | Persist decisions, enable recovery |
| Specialist (short task) | `SessionManager.inMemory()` | Ephemeral, no cleanup needed |
| Specialist (long task) | `SessionManager.files()` with `compact()` | Persist for crash recovery |
| Review/QA agent | `SessionManager.inMemory()` | Stateless, always starts fresh |

### 10.5 What Pi Cannot Do (Gaps for Orchestrator)

1. **No shared memory** -- Agents cannot directly access each other's state. The orchestrator must mediate all inter-agent communication.
2. **No cost tracking across agents** -- Each session tracks its own token usage. The orchestrator must aggregate.
3. **No automatic context inheritance** -- Sub-agents don't receive parent context. The orchestrator must explicitly inject relevant context.
4. **No built-in health monitoring** -- No heartbeat, no timeout. The orchestrator must implement watchdog patterns.
5. **No distributed deployment** -- All sessions run in a single Node.js process. Scaling across machines requires external infrastructure.
6. **Bus factor** -- Primarily maintained by Mario Zechner. MIT license mitigates but does not eliminate this risk.

### 10.6 Migration Path from Claude Code Orchestrator

| Current (Claude Code) | Target (Pi SDK) |
|-----------------------|-----------------|
| Tmux session spawning | `createAgentSession()` in-process |
| `terminal-write` / `terminal-read` | `session.prompt()` / `session.subscribe()` |
| `terminal-wait` (polling) | `session.agent.waitForIdle()` (event-driven) |
| `orchestrator-state.json` (manual file) | `pi.appendEntry()` + custom state manager |
| Shell hooks for validation | `tool_call` event with `{block: true}` |
| MCP for browser testing | Extension wrapping Chrome DevTools |
| CLAUDE.md for system prompt | `systemPrompt` parameter in `createAgentSession()` |
| Sub-agents via Task tool (20K overhead) | SDK sessions (~1K overhead each) |

---

## Sources

- [badlogic/pi-mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Pi Coding Agent README](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md)
- [Pi SDK Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Pi Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi RPC Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/rpc.md)
- [Pi Session Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/session.md)
- [Pi AGENTS.md](https://github.com/badlogic/pi-mono/blob/main/AGENTS.md)
- [@mariozechner/pi-coding-agent npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [@mariozechner/pi-ai npm](https://www.npmjs.com/package/@mariozechner/pi-ai)
- [@mariozechner/pi-agent-core npm](https://www.npmjs.com/package/@mariozechner/pi-agent-core)
- [How to Build a Custom Agent Framework with PI -- Nader Dabit](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Pi Agent Revolution -- Atal Upadhyay](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [Pi vs Claude Code Comparison -- disler](https://github.com/disler/pi-vs-claude-code)
- [Pi vs Claude Agent SDK -- Agentlas](https://agentlas.pro/compare/pi-vs-claude-agent-sdk/)
- [Three Kingdoms of CLI Coding Agents](https://yun123.io/en/blog/cli-coding-agents-comparison/)
- [Inside OpenClaw Architecture -- DEV Community](https://dev.to/jiade/inside-openclaw-how-the-worlds-fastest-growing-ai-agent-actually-works-under-the-hood-4p5n)
- [Pi Integration Architecture -- OpenClaw Docs](https://docs.openclaw.ai/pi)
- [RFC: Generalize AgentRuntime -- OpenClaw Discussion](https://github.com/openclaw/openclaw/discussions/5536)
- [What I Learned Building a Minimal Coding Agent -- Mario Zechner](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Agent Loop and State Management -- DeepWiki](https://deepwiki.com/badlogic/pi-mono/3.1-agent-and-transport-layer)
- [RPC Mode -- DeepWiki](https://deepwiki.com/badlogic/pi-mono/4.5-rpc-mode)
- [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents)
- [baochunli/pi-collaborating-agents](https://github.com/baochunli/pi-collaborating-agents)
- [nicobailon/pi-messenger](https://github.com/nicobailon/pi-messenger)
- [pasky/pi-side-agents](https://github.com/pasky/pi-side-agents)
- [Pi: The Minimal Agent Within OpenClaw -- Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [badlogic/pi-skills](https://github.com/badlogic/pi-skills)
- [Sessions as Trees, Code as Clay](https://random.qmx.me/posts/2026/02/19/sessions-as-trees/)
- [Overstory Multi-Agent Orchestration](https://github.com/jayminwest/overstory)
- [Pi.dev Official Site](https://shittycodingagent.ai/)
