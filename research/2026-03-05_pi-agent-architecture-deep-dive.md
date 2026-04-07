# Pi Agent: Why Minimal Architecture Is the Correct Foundation for Custom Agent Harnesses

**Deep Research Analysis -- 2026-03-05**

---

## Executive Summary

Pi, created by Mario Zechner (the mind behind libGDX, 24.8K GitHub stars), is a terminal coding agent with 11.5K+ stars and 3.17M monthly npm downloads. It powers OpenClaw (145K stars) and has become the de facto reference implementation for the thesis that **less infrastructure yields better agent outcomes**. This document analyzes why Pi's "less is more" architecture -- 4 tools, ~200-token system prompt, TypeScript in-process extensions -- represents the correct foundation for building custom agent harnesses, and where its gaps lie.

---

## Table of Contents

1. [The 200-Token Advantage](#1-the-200-token-advantage)
2. [4 Tools Are Enough](#2-4-tools-are-enough)
3. [Extension Composability](#3-extension-composability)
4. [TypeScript In-Process vs Shell Hooks](#4-typescript-in-process-vs-shell-hooks)
5. [Model Agnosticism as Strategy](#5-model-agnosticism-as-strategy)
6. [The Extension as Unit of Innovation](#6-the-extension-as-unit-of-innovation)
7. [What Pi Gets Wrong / Gaps](#7-what-pi-gets-wrong--gaps)
8. [Pi as Foundation for Custom Harness](#8-pi-as-foundation-for-custom-harness)
9. [Implications for Orchestrator Design](#9-implications-for-orchestrator-design)

---

## 1. The 200-Token Advantage

### The Core Insight

Every token in a system prompt is a **performance tax**. Pi's entire system prompt plus tool specifications fit in under 1,000 tokens. Claude Code's system prompt consumes approximately 10,000 tokens. This is not a minor implementation detail -- it is a fundamental architectural decision with cascading consequences.

### The Math

| Metric | Pi Agent | Claude Code |
|--------|----------|-------------|
| System prompt tokens | ~200 (core) / <1,000 (with tool specs) | ~10,000 |
| Context consumed before first user message | <0.5% of 200K window | ~5% of 200K window |
| With MCP tools loaded | N/A (no MCP) | 15-25% (Playwright: 13.7K, Chrome DevTools: 18K) |
| Effective working context | ~199,000 tokens | ~150,000-170,000 tokens |

### Why This Matters

**The Lost-in-the-Middle Effect.** Research consistently shows that LLMs perform worse when critical information is buried in the middle of long contexts. A 10,000-token system prompt pushes the user's actual code, documentation, and conversation history further into the "middle zone" where attention degrades. Pi's minimal prompt keeps the model's attention budget available for what actually matters: the developer's code and intent.

**Progressive Disclosure over Upfront Loading.** Pi's philosophy is that the agent reads documentation (like a README for a tool) only when it needs it, paying the token cost at the point of use. Claude Code's MCP architecture front-loads all tool descriptions into every session, regardless of whether they'll be used. A Playwright MCP server dumps 21 tool descriptions (13.7K tokens) into context even if the session never touches a browser.

**Cost Efficiency.** At scale, the token overhead compounds. For an organization running thousands of agent sessions daily, 10,000 extra tokens per session at $3/MTok input pricing represents meaningful cost. Pi's approach is structurally cheaper.

### Mario's Argument

> "All frontier models have been RL-trained to understand what coding agents are. They don't need 10,000 tokens of instructions telling them how to be a coding agent."

This is the key philosophical claim: **the training data already contains the patterns**. Modern models have been fine-tuned on millions of coding agent interactions. Telling Claude or GPT-4 how to use `bash` in excruciating detail is redundant -- they already know. The system prompt's job is to provide context-specific constraints, not to teach the model its job.

---

## 2. 4 Tools Are Enough

### The Core Tools

| Tool | Purpose | Why It's Sufficient |
|------|---------|-------------------|
| **read** | Read files and images | Handles text, binary inspection, image analysis |
| **write** | Create/overwrite files | Clean creation semantics |
| **edit** | Surgical line-level edits | Precise modifications without full file rewrites |
| **bash** | Execute shell commands | Gateway to the entire system |

Plus 3 optional convenience tools: `grep`, `find`, `ls` -- which are strictly redundant with `bash` but reduce token cost for common operations.

### The Bash Escape Hatch

The critical insight is that **`bash` is a universal tool**. Any capability you might want to add as a dedicated tool -- git operations, docker management, curl requests, package installation, test execution, linting -- is already accessible through bash. Adding a dedicated `git_commit` tool:

1. Adds tokens to the system prompt (tool description overhead)
2. Adds a decision point for the model (which tool to use?)
3. Adds maintenance burden (keeping the tool updated)
4. Provides zero additional capability (bash can do everything git_commit can do)

### Contrast with Claude Code

Claude Code ships with approximately 15-20 built-in tools depending on configuration, including specialized tools for sub-agent spawning, todo management, MCP integration, and more. Each tool adds its schema and description to the system prompt. The question Pi forces you to ask: **does tool X provide enough value to justify its permanent context cost?**

### The 95% Coverage Claim

For pure coding tasks -- reading code, writing code, editing code, running tests, using git, installing dependencies, debugging -- the 4-tool set covers effectively everything. The remaining 5% consists of:

- Browser automation (no built-in, but achievable via bash + headless browsers)
- GUI interaction (outside Pi's scope by design)
- Structured API calls to external services (achievable via bash + curl)

The thesis is that **the 5% doesn't justify permanently taxing the 95%**. If you need browser automation, you add it as an extension for that specific session, not as a permanent fixture in every session's context.

---

## 3. Extension Composability

### The `-e` Flag Architecture

Pi's extension model is built around CLI-level composition. Extensions are loaded via the `-e` flag:

```bash
# Single extension
pi -e pure-focus

# Stacked extensions -- order matters
pi -e damage-control -e tool-counter -e subagent-widget

# Project-local extension
pi -e .pi/extensions/my-custom-ext.ts
```

This creates a **combinatorial configuration space** from a small number of primitives. With 12 community extensions, you have 2^12 = 4,096 possible configurations, each creating a meaningfully different agent experience.

### Extension Discovery Locations

| Location | Scope | Auto-loaded? |
|----------|-------|-------------|
| `~/.pi/agent/extensions/` | Global (all sessions) | Yes |
| `.pi/extensions/` | Project-local | Yes |
| `-e <name>` flag | Session-specific | Manual |
| npm packages | Installable | Via package name |

### The Composability Principle

Each extension is a **pure additive layer**. Extensions don't modify Pi's core; they hook into lifecycle events and add behavior. This means:

1. **No conflicts by default** -- Extensions operate on different events or compose their effects
2. **Predictable stacking** -- Loading `damage-control` + `tool-counter` gives you exactly: safety auditing AND tool telemetry
3. **Easy removal** -- Remove the `-e` flag and the behavior vanishes completely
4. **Zero-cost when absent** -- Unlike MCP tools, an extension that isn't loaded adds zero tokens to context

### Configuration as Composition

Instead of a monolithic config file with hundreds of options, Pi's configuration IS the set of loaded extensions. This is philosophically similar to Unix pipes: small, focused tools composed at the command line.

```bash
# "Enterprise safety mode"
pi -e damage-control -e tilldone -e purpose-gate

# "Speed mode for solo hacking"
pi -e pure-focus -e minimal

# "Multi-agent orchestration"
pi -e agent-team -e tool-counter
```

---

## 4. TypeScript In-Process vs Shell Hooks

### Pi's Event System

Pi fires **25 extension events across 7 categories**, all executing in-process via TypeScript. Extensions register handlers through the `ExtensionAPI`:

```typescript
export default function(pi: ExtensionAPI) {
  pi.on("tool_call", async (event, ctx) => {
    // Intercept, modify, or block tool calls
    // Runs IN-PROCESS -- zero serialization overhead
  });
}
```

#### Event Categories (Reconstructed from Documentation)

| Category | Events | Purpose |
|----------|--------|---------|
| **Session** | `session_start`, `session_switch`, `session_shutdown`, `session_before_compact` | Session lifecycle management |
| **Turn** | `turn_start`, `turn_end` | Agent turn boundaries |
| **Message** | `message_start`, `message_update`, `message_end` | Streaming message lifecycle |
| **Tool** | `tool_call`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end`, `tool_result` | Full tool execution lifecycle |
| **Agent** | `before_agent_start`, `agent_end` | Agent lifecycle |
| **Context** | `context` | Message rewriting before LLM sees them |
| **UI** | Various render hooks | Footer, widgets, display |

### Claude Code's Hook System

Claude Code provides approximately 14 hooks, executed as **shell subprocesses**:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "bash",
      "command": "/path/to/validator.sh $TOOL_INPUT"
    }]
  }
}
```

### Why In-Process Is Architecturally Superior

| Dimension | Pi (In-Process TypeScript) | Claude Code (Shell Hooks) |
|-----------|--------------------------|--------------------------|
| **Latency** | Microseconds (function call) | Milliseconds (process spawn + exec) |
| **State sharing** | Direct access to agent state, context, history | Must serialize/deserialize via env vars or files |
| **Error handling** | Try/catch in same runtime | Exit codes, stderr parsing |
| **Composability** | Multiple handlers on same event, ordered execution | Each hook is an isolated process |
| **Type safety** | Full TypeScript types for all events | Untyped shell strings |
| **Debugging** | Standard Node.js debugger, stack traces | Printf debugging across process boundaries |
| **Data access** | `event.toolName`, `event.args`, `ctx.session` | Environment variables, temp files |

### The Critical Difference: Context Rewriting

Pi's `context` event allows extensions to **rewrite messages before the LLM sees them**. This is extraordinarily powerful:

```typescript
pi.on("context", async (event, ctx) => {
  // Modify, filter, or inject messages into the conversation
  // BEFORE they reach the LLM
  // This is impossible with shell-based hooks
});
```

Claude Code's hooks cannot do this. They can block tool calls or run side effects, but they cannot modify what the LLM sees mid-conversation. This makes Pi's event system fundamentally more capable for context engineering -- the most important skill in agent development.

### jiti: Zero-Build TypeScript Loading

Pi uses **jiti** (Just-In-Time TypeScript) to load extensions at runtime without any compilation step:

- Drop a `.ts` file in `.pi/extensions/` -- it works on next session start
- No `tsconfig.json` needed
- No build step, no watch mode, no bundler
- Extensions can import from `node_modules` (add a `package.json` in the extension directory)

This makes the extension development loop as fast as possible: edit file, restart session, see changes. Compare with building a Claude Code MCP server, which requires setting up a separate process, configuring transport, and managing lifecycle.

---

## 5. Model Agnosticism as Strategy

### The Four Wire Protocols

Mario's key architectural insight was that despite dozens of LLM providers, there are really only **four wire protocols** in use:

1. **OpenAI Chat Completions API** -- The de facto standard
2. **OpenAI Responses API** -- The newer, more structured variant
3. **Anthropic Messages API** -- Claude's native protocol
4. **Google Generative AI API** -- Gemini's protocol

Rather than building provider-specific adapters, Pi normalizes around these four protocols. The `pi-ai` package handles the abstraction, and a model catalog of 300+ definitions is auto-generated at build time from models.dev and OpenRouter metadata.

### Model Catalog Structure

Each model definition includes:

```typescript
interface ModelDefinition {
  id: string;
  provider: string;
  protocol: "openai-chat" | "openai-responses" | "anthropic" | "google";
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

### Why 324 Models Matters

| Dimension | Pi | Claude Code |
|-----------|-----|-------------|
| **Native model support** | 324 models across 20+ providers | Claude models only (Anthropic) |
| **Mid-session model switching** | Yes, via `/model` command | No |
| **Local model support** | Yes (Ollama, vLLM, any OpenAI-compatible) | No |
| **Cost optimization** | Switch to cheaper model for simple tasks | Fixed pricing |
| **Provider lock-in** | None | Complete (Anthropic) |

### The Strategic Bet

Model agnosticism is not just a convenience feature -- it is a **strategic hedge**:

1. **Capability arbitrage**: Use Claude for complex reasoning, GPT-4o for speed, local models for privacy
2. **Cost optimization**: Route simple tasks to cheaper models automatically
3. **Future-proofing**: When a new model drops (Gemini 3, GPT-5, Llama 4), Pi supports it by adding a catalog entry, not rewriting an integration
4. **Enterprise flexibility**: Organizations with existing provider contracts can use Pi without switching vendors

Claude Code being locked to Anthropic is both its strength (deep integration, optimized prompts) and its weakness (single point of failure, no cost optimization path).

---

## 6. The Extension as Unit of Innovation

### Extension Catalog Analysis

The community has built extensions that demonstrate Pi's thesis: if the core is minimal enough, everything interesting happens at the extension layer.

#### Workflow Extensions

| Extension | What It Does | Why It Matters |
|-----------|-------------|----------------|
| **pure-focus** | Strips all UI distractions, minimal output | Proves the default UI is optional, not essential |
| **minimal** | Compact footer with context usage meter | Information density without clutter |
| **cross-agent** | Loads commands from `.claude/`, `.gemini/`, `.codex/` dirs | Pi can consume other agents' configurations |
| **purpose-gate** | Session intent declaration and enforcement | Prevents scope creep -- extension enforces focus |
| **tool-counter** | Rich footer with per-tool usage tally | Observability as an opt-in layer |

#### Multi-Agent Extensions

| Extension | What It Does | Architectural Significance |
|-----------|-------------|---------------------------|
| **subagent-widget** | `/sub` command spawning background Pi instances | Sub-agents as extension, not core feature |
| **agent-team** | Dispatcher orchestrator with specialist roster | Full multi-agent orchestration from a single extension |
| **agent-chain** | Sequential pipeline (output of agent N becomes input to agent N+1) | Pipeline patterns without framework support |

#### Safety & Discipline Extensions

| Extension | What It Does | Design Implication |
|-----------|-------------|-------------------|
| **tilldone** | Task discipline system with hooks that block actions | Proves permission systems can be extensions |
| **damage-control** | Real-time safety auditing via YAML rules, intercepts dangerous bash patterns | Security as a composable layer, not baked-in theater |
| **system-select** | Switch between agent personas mid-session | Identity/persona as runtime-swappable |

#### Meta-Agent Extensions

| Extension | What It Does | Why It's Remarkable |
|-----------|-------------|-------------------|
| **pi-pi** | Meta-agent that builds Pi agents using parallel expert research | An extension that creates new Pi configurations -- self-modifying system |

### The Key Insight: Feature = Extension

Every feature that Claude Code bakes into its core, Pi makes available as an optional extension:

| Claude Code Built-in | Pi Extension Equivalent |
|---------------------|------------------------|
| Sub-agents | subagent-widget |
| Permission system | damage-control, tilldone |
| Todo tracking | tilldone |
| Plan mode | purpose-gate + file-based plans |
| Multi-agent | agent-team, agent-chain |

The difference is that Pi users **choose** which features they need. A solo developer hacking on a personal project doesn't need damage-control. A team working on a production system does. In Pi, this is a CLI flag. In Claude Code, it's always present, always consuming context.

---

## 7. What Pi Gets Wrong / Gaps

### 7.1 No Native Sub-Agent Support

Pi deliberately omits built-in sub-agents. While extensions like `subagent-widget` and `agent-team` fill this gap, they lack:

- **Shared memory between agents** -- Each Pi instance is fully isolated
- **Structured message passing** -- Communication happens via files or tmux, not typed channels
- **Cost tracking across agent trees** -- No unified view of total token spend across spawned agents
- **Automatic context inheritance** -- Sub-agents don't automatically receive parent context

For orchestrator patterns (like the L-Thread Orchestrator in this project), this means building substantial infrastructure on top of Pi rather than using built-in primitives.

### 7.2 No MCP Support

Pi explicitly rejects MCP, and Mario's argument has technical merit (MCP tool descriptions bloat context). However, MCP has become a de facto standard for tool integration:

- **Ecosystem access**: Hundreds of MCP servers exist for databases, APIs, cloud services
- **IDE integration**: VS Code, JetBrains, and other editors speak MCP natively
- **Enterprise tooling**: Many organizations are standardizing on MCP for internal tool distribution

Pi's answer is "use bash + curl" or "build an extension," which is technically valid but raises the barrier to entry for common integrations.

### 7.3 Enterprise Readiness Gaps

| Capability | Pi | Claude Code |
|-----------|-----|-------------|
| **SSO/SAML** | No | Yes |
| **Audit logging** | Extension (damage-control) | Built-in |
| **Rate limiting** | No | Via Anthropic platform |
| **Team management** | No | Via Anthropic organization |
| **Compliance certifications** | None | SOC 2, etc. |
| **Support SLA** | Community only | Enterprise contracts |
| **Permission model** | YOLO by default, extensions optional | Granular built-in permissions |

### 7.4 Bus Factor of 1

Pi is primarily maintained by Mario Zechner. While the MIT license and open-source nature mitigate this risk, the project's velocity depends on a single individual. The monorepo structure (pi-mono) with multiple packages increases the surface area that needs maintenance.

### 7.5 Security Model

Mario's stated position -- "Security in agentic coding is mostly theater" -- is accurate for individual developers but problematic for organizations. Running in YOLO mode by default means:

- No confirmation before destructive operations
- No sandboxing of bash commands
- No file access restrictions out of the box

The `damage-control` extension addresses this, but security-by-default vs security-by-opt-in represents a genuine philosophical disagreement with enterprise requirements.

### 7.6 Session Persistence and Recovery

While Pi has session persistence, it lacks the crash-recovery infrastructure that production orchestrators need:

- No tmux integration for session survival across terminal crashes
- No automatic state checkpointing with recovery semantics
- No distributed session management for multi-machine deployments

---

## 8. Pi as Foundation for Custom Harness

### The Monorepo as a Stack

Pi is not just a CLI tool -- it's a **layered SDK** organized as `pi-mono`:

```
pi-coding-agent    (Application: CLI with tools, sessions, extensions)
       |
pi-agent-core      (Core: Agent loop, tool execution, state management)
       |
  pi-ai + pi-tui   (Foundation: LLM abstraction + Terminal UI)
```

This layering is critical because **you can import at any level**:

| Import Level | What You Get | Use Case |
|-------------|-------------|----------|
| `pi-ai` | Unified LLM API across 324 models | Building your own agent from scratch |
| `pi-agent-core` | Agent loop + tool execution | Custom agent with your own tools |
| `pi-coding-agent` | Full coding agent + extensions | Embedding Pi in a larger system |

### How OpenClaw Uses Pi

OpenClaw (145K GitHub stars) demonstrates the "Pi as foundation" pattern:

```
OpenClaw Architecture:
  Messaging Gateway (WhatsApp, Telegram, Discord, Slack, etc.)
       |
  Queue + Memory Layer (persistent sessions, shared context)
       |
  Pi SDK (createAgentSession() -- handles think-and-act loop)
       |
  LLM Provider (via pi-ai abstraction)
```

OpenClaw handles **connect, queue, remember, and extend**. Pi handles **think and act**. This separation of concerns is why Pi's minimalism works as a foundation: it doesn't try to be an application, it tries to be the engine inside your application.

### Four Integration Modes

| Mode | Interface | Best For |
|------|-----------|----------|
| **Interactive** | Terminal TUI | Developer use |
| **Print/JSON** | stdout | CI/CD pipelines, scripting |
| **RPC** | stdin/stdout JSONL protocol | IDE integration, custom UIs |
| **SDK** | Node.js API (`@mariozechner/pi-coding-agent`) | Embedding in applications |

### RPC Mode for Orchestrators

RPC mode is particularly relevant for orchestrator patterns. The protocol:

1. Start Pi with `--rpc` flag
2. Pi emits `{ "type": "ready" }` on stdout
3. Send JSON commands on stdin: `{ "type": "prompt", "text": "...", "id": "req-1" }`
4. Receive streaming events on stdout, correlated by `id`

This enables an orchestrator to manage multiple Pi instances as headless workers, sending tasks and collecting results through a structured protocol. Compare with Claude Code's sub-agent approach, where each subprocess consumes ~50K tokens of overhead.

### Why You'd Build YOUR Orchestrator on Pi

1. **Token efficiency**: Your orchestrator's system prompt + Pi's system prompt < Claude Code's system prompt alone
2. **Model flexibility**: Route different agent tasks to different models based on complexity
3. **Full control**: Extensions give you hooks into every lifecycle event -- you can build exactly the coordination pattern you need
4. **Cost control**: No per-seat licensing, model-agnostic pricing, local model support for sensitive operations
5. **Transparency**: Every token visible, every tool call inspectable -- no hidden orchestration layers

### The Custom Harness Pattern

```
Your Orchestrator
  |-- Pi Instance 1 (specialist: frontend, model: claude-4-opus)
  |-- Pi Instance 2 (specialist: backend, model: gpt-4o)
  |-- Pi Instance 3 (specialist: testing, model: gemini-2-pro)
  |-- Pi Instance 4 (specialist: docs, model: llama-4-70b-local)
```

Each instance runs with different extensions, different models, different system prompts -- but all managed through a unified RPC or SDK interface. This is impossible with Claude Code, which is locked to Claude models and closed-source.

---

## 9. Implications for Orchestrator Design

### What Pi Validates About the L-Thread Orchestrator

Pi's success with OpenClaw validates several patterns used in this project's orchestrator:

1. **Minimal core, extensible edges** -- The orchestrator should do coordination, not coding
2. **Agent-as-process** -- Each agent is a separate instance with its own context
3. **Event-driven communication** -- Not polling, not sleep loops
4. **State externalization** -- State lives in files/JSON, not in agent memory

### What Pi Suggests We Should Change

1. **System prompt bloat audit** -- Apply Pi's philosophy to our agent prompts. How many tokens are we spending on instructions the model already knows?
2. **Tool count audit** -- Are we giving agents tools they don't need? Each unnecessary tool is a permanent context tax.
3. **Model routing** -- Instead of running everything on the same model, route tasks by complexity. Simple file reads don't need Claude Opus.
4. **Extension-style modularity** -- Instead of monolithic agent configurations, compose behavior from small, focused modules.

### The Bottom Line

Pi proves that the correct architecture for an agent harness is:

- **Minimal core**: Do less, but do it perfectly
- **Maximal extensibility**: Everything that isn't core should be pluggable
- **In-process events**: Not shell subprocesses, not MCP servers -- TypeScript functions in the same runtime
- **Model agnostic**: The model is a parameter, not an identity
- **Transparent**: No hidden orchestration, no magical context injection

The "less is more" approach works because **it respects the context window as the scarcest resource in agent computing**. Every token spent on framework overhead is a token unavailable for the developer's actual code, documentation, and reasoning. Pi's radical minimalism isn't asceticism -- it's engineering discipline applied to the most constrained resource in the system.

---

## Sources

- [What I learned building an opinionated and minimal coding agent -- Mario Zechner](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Pi vs Claude Code Comparison -- disler/pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code)
- [Pi vs Claude Code Feature Comparison (COMPARISON.md)](https://github.com/disler/pi-vs-claude-code/blob/main/COMPARISON.md)
- [Pi Mono Repository -- badlogic/pi-mono](https://github.com/badlogic/pi-mono)
- [Pi Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi SDK Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Pi RPC Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/rpc.md)
- [How to Build a Custom Agent Framework with PI -- Nader Dabit](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Pi Agent Revolution: Building Customizable AI Coding Agents](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [Agent Pi: How 4 Tools Power OpenClaw -- Medium](https://shivamagarwal7.medium.com/agentic-ai-pi-anatomy-of-a-minimal-coding-agent-powering-openclaw-5ecd4dd6b440)
- [Pi: The Minimal Agent Within OpenClaw -- Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [Pi Package Architecture -- DeepWiki](https://deepwiki.com/badlogic/pi-mono/1.1-package-architecture)
- [@mariozechner/pi-coding-agent -- npm](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi vs Claude Agent SDK Comparison -- Agentlas](https://agentlas.pro/compare/pi-vs-claude-agent-sdk/)
- [The Three Kingdoms of CLI Coding Agents](https://yun123.io/en/blog/cli-coding-agents-comparison/)
- [Inside OpenClaw Architecture -- DEV Community](https://dev.to/jiade/inside-openclaw-how-the-worlds-fastest-growing-ai-agent-actually-works-under-the-hood-4p5n)
- [Pi Coding Agent -- Ry Walker Research](https://rywalker.com/research/pi)
- [Pi.dev -- Official Site](https://shittycodingagent.ai/)
- [oh-my-pi -- Community Fork](https://github.com/can1357/oh-my-pi)
- [Awesome Pi Agent](https://github.com/qualisero/awesome-pi-agent)
