# OpenCode: Deep Architecture Analysis for Orchestration Use

**Deep Research Analysis -- 2026-03-05**

---

## Executive Summary

OpenCode, originally launched as "opencode" under the SST/Anomaly team on June 19, 2025, has become the most-starred open-source coding agent on GitHub with 100K+ stars, 700+ contributors, 650K monthly active users, and a growth trajectory that outpaced Claude Code by 4.5x in star velocity during January 2026. Built by the founders of SST (Jay V, Frank Wang, Dax Raad, and Adam Elmore), the tool emerged from a strategic bet that developers would demand provider-agnostic, open-source alternatives to locked-in proprietary agents. This document provides a comprehensive architectural analysis of OpenCode, its multi-agent capabilities, its SDK/API surface, and a head-to-head comparison with Pi for orchestration use cases.

---

## Table of Contents

1. [Founding and Team](#1-founding-and-team)
2. [Architecture Deep Dive](#2-architecture-deep-dive)
3. [The Agent System](#3-the-agent-system)
4. [TaskTool and Subagent Mechanics](#4-tasktool-and-subagent-mechanics)
5. [Multi-Agent Teams](#5-multi-agent-teams)
6. [SDK, Server, and Programmatic Control](#6-sdk-server-and-programmatic-control)
7. [Plugin and Extension Ecosystem](#7-plugin-and-extension-ecosystem)
8. [Community and Ecosystem](#8-community-and-ecosystem)
9. [OpenCode vs Pi for Orchestration](#9-opencode-vs-pi-for-orchestration)
10. [Implications for L-Thread Orchestrator](#10-implications-for-l-thread-orchestrator)

---

## 1. Founding and Team

### Origins: From SST to Anomaly

Jay V and Frank Wang co-founded Anomaly during their first week at the University of Waterloo. In 2021, they took Serverless Stack (SST) through Y Combinator, raising backing from founders of PayPal, LinkedIn, Yelp, and YouTube. SST grew to 25K GitHub stars and turned profitable in 2025.

When Claude Code and similar AI coding assistants began gaining traction, Jay identified a strategic gap: there would be an explosion of AI coding models, and developers would demand open-source alternatives to proprietary lock-in. OpenCode launched alongside Frank, Dax Raad (an early SST user who became co-founder), and Adam Elmore.

### Key People

- **Jay V** (CEO): Strategic vision, ecosystem partnerships (GitHub Copilot integration)
- **Frank Wang** (CTO): Core architecture, the TypeScript/Bun backend
- **Dax Raad** (Co-founder): Early contributor, Go TUI, developer experience
- **David Hill** (Founding Designer): Formerly Head of Design at Laravel. Responsible for OpenCode's visual identity, TUI aesthetics, and the OpenTUI framework direction
- **Rhys Sullivan**: Vercel engineer and active contributor. Notably used OpenCode to fix bugs in OpenCode itself, demonstrating the tool's self-hosting capability. Maintains adjacent projects like executor.sh (agent API calling) and fastergh.com

### Growth Milestones

| Date | Stars | Event |
|------|-------|-------|
| Jun 2025 | Launch | Initial release as sst/opencode |
| Jan 6, 2026 | ~50K | +1,852 stars/day, overtaking Claude Code |
| Jan 12, 2026 | ~63K | +2,087 star surge in one day |
| Mar 2026 | 100K+ | 650K MAU, 700+ contributors |

---

## 2. Architecture Deep Dive

### The Hybrid Runtime

OpenCode's most distinctive architectural decision is its **hybrid Go + TypeScript runtime**. The system is not purely Go-based, despite common misconception. The actual breakdown:

**TypeScript/Bun Backend (Core Logic)**
- The core business logic lives in `packages/opencode`, written in TypeScript running on Bun
- HTTP server built with **Hono**, running on port 4096 by default
- Agent orchestration, tool execution, session management, and LLM interaction all happen in the Bun/JS runtime
- Uses the **Vercel AI SDK** as the provider abstraction layer, enabling 75+ LLM providers
- SQLite for persistent storage (sessions, messages, file changes)

**Go TUI Frontend (originally)**
- The original TUI was built with **Bubble Tea** (Charm ecosystem), compiled separately with `go build`
- The Go binary was packaged alongside the Bun binary
- When the user ran `opencode`, Bun launched the HTTP server, then started the TUI, which took over stdin/stdout

**OpenTUI Migration (current)**
- The TUI migrated from Go/Bubble Tea to **OpenTUI**, a native terminal UI core written in **Zig** with TypeScript bindings
- This transition was driven by performance limitations in Go TUI libraries at scale (high resource consumption with complex AI-driven interfaces)
- Anomaly open-sourced OpenTUI as a standalone library (`anomalyco/opentui`)

### HTTP + SSE Communication Model

The communication architecture is fundamentally client-server over HTTP:

1. **User submits prompt** in TUI (or any client)
2. **HTTP request** sent to the Hono server
3. **Server processes** through Vercel AI SDK, calling the LLM provider
4. **SSE stream** broadcasts results in real-time to all subscribed clients
5. **Messages persisted** to SQLite

This design has a critical implication: **any HTTP client can drive OpenCode**. The TUI is just one frontend. The desktop app (Tauri), VS Code extension, web UI, and the SDK all connect to the same HTTP server. Two SSE endpoints provide event streams, with events published through a strongly-typed internal **Bus** system and forwarded over SSE using `streamSSE` from `hono/streaming`.

### Provider Abstraction

OpenCode integrates with 75+ AI providers through a unified abstraction layer built on the Vercel AI SDK and Models.dev:

- **Anthropic**: Claude 4.5 series
- **OpenAI**: GPT-5.3 / GPT-5.1 series
- **Google**: Gemini models
- **AWS Bedrock**, **Azure OpenAI**, **Groq**, **OpenRouter**
- **Local models** via Ollama or any OpenAI-compatible endpoint

Models are specified in `providerID/modelID` format. Provider-specific transforms handle temperature, topP, topK defaults, and JSON schema adaptations for tool parameters. The `ProviderTransform.schema()` function adapts tool parameter schemas across providers automatically.

### ACP Integration

OpenCode supports the **Agent Client Protocol (ACP)**, an open protocol by JetBrains and Zed that standardizes communication between code editors and AI coding agents. Running `opencode acp` starts an ACP-compatible subprocess communicating via JSON-RPC over stdio, enabling integration with the entire JetBrains IDE lineup (IntelliJ IDEA, PyCharm, WebStorm) and Zed.

---

## 3. The Agent System

### Agent Types

OpenCode distinguishes between two categories:

**Primary Agents** -- user-facing agents that handle direct interaction:
- **Build**: Full tool access, the default coding agent
- **Plan**: Restricted tool access, focused on planning and analysis
- Custom primary agents defined in `.opencode/agents/` or `~/.config/opencode/agents/`

**Subagents** -- specialized assistants invoked programmatically:
- Spawned by primary agents via the TaskTool
- Can also be manually invoked by `@` mentioning them in messages
- Run in isolated sessions with their own tools, system prompt, and potentially different LLM

### Agent Configuration

Agents are configured via markdown files with YAML frontmatter:

```
---
name: my-agent
model: anthropic/claude-sonnet-4-5
temperature: 0.2
permission:
  read: allow
  write: ask
  task:
    "build-*": allow
---

Your custom system prompt here.
```

Key configuration options:
- **model**: Provider/model ID
- **temperature**: LLM temperature (provider-specific defaults if omitted)
- **permission**: Granular tool permissions using glob patterns
- **prompt**: Path to a custom system prompt file

### Rules System

OpenCode uses `AGENTS.md` files (similar to Claude Code's `CLAUDE.md`) for project-specific instructions:
- **Project rules**: `AGENTS.md` in project root
- **Global rules**: `~/.config/opencode/AGENTS.md`
- **Dynamic rules**: The `opencode-rules` plugin enables conditional rules based on file patterns, prompt keywords, tools, model, agent, branch, OS, CI environment, and more

---

## 4. TaskTool and Subagent Mechanics

### How TaskTool Works

The TaskTool is the core mechanism for agent-to-agent delegation:

1. **Primary agent calls TaskTool** with a subagent name and task description
2. **Permission check** validates the delegation against `permission.task` glob patterns
3. **New session created** for the subagent with its own context window
4. **Subagent executes** independently with its own tools, system prompt, and potentially a different LLM
5. **Result returned** to the primary agent

This is architecturally significant because each subagent gets a **fresh context window**. The primary agent's context is not shared -- only the task description is passed. This prevents context pollution but also means the subagent must independently discover project state.

### Permission Propagation Issues

There are documented challenges with permission propagation in the TaskTool system:

- Custom agent permissions (e.g., `"*": "allow"` for autonomous operation) do **not** automatically propagate to spawned subagents
- After a permission rework, the task tool is always disabled for sub-agents regardless of agent permissions, preventing nested sub-agent delegation by default
- This has been partially addressed by PR #7756 which adds subagent-to-subagent delegation with configurable call budgets and depth limits to prevent infinite loops

### Hierarchical Session Navigation

Recent developments include a hierarchical multi-level TUI session navigation system:
- Clickable delegation boxes and keyboard shortcuts for traversing nested session trees
- A Session Tree dialog providing a visual tree view of all sessions in the hierarchy
- Interactive session switching for navigating between subagent sessions

---

## 5. Multi-Agent Teams

### OpenCode Teams vs Claude Code Teams

When Anthropic shipped agent teams in Claude Code (February 2026), OpenCode built its own implementation with the same concept but different architecture:

| Aspect | Claude Code Teams | OpenCode Teams |
|--------|------------------|----------------|
| Communication | File-based polling | Event-driven message injection |
| Message delivery | Polling-based | Auto-wake with session injection |
| Model mixing | Single provider | Multi-model, multi-provider per team |
| State management | File-based | In-process event bus + JSONL |
| Architecture | Multi-process | Single-process with explicit tool separation |

### Event Bus Architecture

OpenCode's multi-agent coordination runs on a **strongly-typed event bus**:
- Every action (file changes, permission requests, agent messages) flows through the bus
- Tools subscribe and react to events
- Agents pass messages to each other and claim tasks from a shared list
- **Append-only JSONL writes** for audit trail
- **Peer-to-peer communication** between agents (not just lead-to-worker)

### Community Multi-Agent Implementations

The community has built significant orchestration layers on top of OpenCode's primitives:

- **opencode-workspace**: Bundled 16-component orchestration harness with plugins for delegation, planning, notifications, and worktrees
- **swarm-tools**: 40+ tools for multi-agent coordination, task decomposition, and learning systems with git-backed work items
- **opencode-swarm**: Architect-centric hub-and-spoke orchestration with 9 specialized agents (code writer, reviewer, tester, security auditor, etc.)
- **oh-my-opencode**: Batteries-included orchestration layer with the Sisyphus agent system, 46 lifecycle hooks, 26 tools

---

## 6. SDK, Server, and Programmatic Control

### Headless Server Mode

`opencode serve` runs a headless HTTP server for automation and CI/CD:
- REST/OpenAPI endpoints (spec at `/doc`)
- Multi-client session support
- HTTP basic auth via `OPENCODE_SERVER_PASSWORD`
- CORS configuration
- LAN discovery via mDNS
- OpenAPI 3.1.1 specification auto-generated

### The TypeScript SDK

`@opencode-ai/sdk` provides type-safe programmatic control:

```typescript
import { OpenCode } from "@opencode-ai/sdk"

// Create a session
const session = await opencode.session.create({ agent: "build" })

// Send a prompt
await opencode.session.prompt(session.id, { content: "Fix the failing test" })

// Subscribe to real-time events
opencode.event.subscribe((event) => {
  console.log(event.type, event.data)
})

// Read files, search, access project metadata
const files = await opencode.find.files("**/*.ts")
```

Core SDK methods:
- `session.create` / `session.prompt` / `session.list`
- `event.subscribe` (SSE-backed real-time events)
- `file.read`
- `find.files`
- `project.current`

### Operational Modes

OpenCode runs in multiple modes relevant to orchestration:
- **Interactive TUI**: Default terminal mode
- **CLI headless**: `opencode serve` for programmatic control
- **ACP mode**: `opencode acp` for IDE integration
- **Desktop app**: Tauri-based, connects to same HTTP server
- **GitHub App**: `github.com/apps/opencode-agent` for issue/PR automation

---

## 7. Plugin and Extension Ecosystem

### Plugin Architecture

Plugins are JavaScript/TypeScript modules placed in `.opencode/plugins/` or `~/.config/opencode/plugins/`, or loaded from npm:

```typescript
import { definePlugin } from "@opencode-ai/plugin"

export default definePlugin((ctx) => ({
  beforeToolCall: async (tool, args) => {
    console.log(`Calling ${tool.name}`)
    return args // or modify args
  },
  afterToolCall: async (tool, result) => {
    // audit, log, transform result
    return result
  }
}))
```

Plugins can intercept:
- Chat messages
- Tool execution (before and after)
- Session lifecycle events
- File operations

Plugins are loaded from all sources and hooks run in sequence. Full TypeScript support via `@opencode-ai/plugin` package.

### MCP Server Integration

OpenCode has first-class MCP support:
- Define MCP servers in config under the `mcp` key
- Supports both local (stdio) and remote (HTTP) MCP servers
- On startup, OpenCode creates MCP clients that fetch tool lists from servers
- MCP tools are automatically available alongside built-in tools
- Tools are referenced by their MCP server name when prompting

### Hook System

Six extensibility mechanisms:
1. **Plugins** (primary): Before/after hooks on tool calls, messages, sessions
2. **Rules**: Static instruction injection via AGENTS.md
3. **Custom agents**: Markdown-defined agents with custom prompts and tool access
4. **MCP servers**: External tool integration
5. **Skills**: Reusable prompt templates and tool configurations
6. **Themes**: TUI customization

### Oh-My-OpenCode

The most significant community extension. Created by code-yeongyu, oh-my-opencode wraps OpenCode with:

- **Sisyphus Agent Orchestration**: Main orchestrator with Prometheus (Planner) and Metis (Plan Consultant)
- **Multi-specialist agent collaboration**: Domain-specific task delegation
- **46 lifecycle hooks**: Far exceeding OpenCode's built-in 6
- **26 additional tools**: playwright, git-master, and more
- **Built-in MCPs**: Exa (web search), context7 (docs), grep_app (GitHub search)
- **Background tasks** with configurable concurrency limits
- **LSP tool integration**: Deep language server awareness

Installation: `bunx oh-my-opencode install`

---

## 8. Community and Ecosystem

### Ecosystem Scale

| Metric | Value |
|--------|-------|
| GitHub stars | 100K+ |
| Contributors | 700+ |
| Monthly active users | 650K |
| LLM providers supported | 75+ |
| Current version | v1.2.17 (as of March 2026) |
| License | MIT |
| Revenue model | OpenCode Zen (curated model configs) |

### Key Community Resources

- **awesome-opencode**: Curated list of plugins, themes, agents, projects
- **opencode.cafe**: Community hub for extensions and plugins
- **OpenCode Zen**: Official curated set of reliable, optimized models for coding agents
- **oh-my-opencode**: 46-hook orchestration plugin
- **swarm-tools**: Multi-agent coordination primitives
- **opencode-workspace**: Bundled orchestration harness

### GitHub Integration

OpenCode is available as a GitHub App (`github.com/apps/opencode-agent`) for use in issues and pull requests. GitHub's Copilot partnership lets all paid Copilot subscribers authenticate directly into OpenCode.

---

## 9. OpenCode vs Pi for Orchestration

### Philosophical Divergence

The two tools represent fundamentally different philosophies:

| Dimension | OpenCode | Pi |
|-----------|----------|-----|
| Philosophy | Full-featured platform | Minimal harness |
| System prompt | Thousands of tokens | ~200 tokens |
| Built-in tools | 15+ (read, write, edit, bash, glob, grep, LSP, task, etc.) | 4 (read, write, edit, bash) |
| Language | TypeScript (Bun) + Go/Zig (TUI) | TypeScript (Node/Bun) |
| GitHub stars | 100K+ | ~19K |
| Contributors | 700+ | 134 |
| MAU | 650K | Not disclosed |
| Extension system | Plugins (JS/TS), MCP, ACP, Skills | Extensions (TS), Skills, Packages |
| Multi-agent | Built-in TaskTool + Teams | No built-in (by design) |
| Sub-agents | Native, with hierarchical sessions | Not included; add via extension |
| Model support | 75+ via Vercel AI SDK | Multi-provider via pi-llm package |
| Runtime mode | Interactive, Server, CLI, ACP, Desktop | Interactive, Print/JSON, RPC, SDK |

### For Orchestration Specifically

**OpenCode Advantages:**

1. **Native TaskTool**: Built-in mechanism for spawning subagents with isolated sessions. No extension needed. Primary agents can delegate to subagents, which can further delegate with configurable depth limits.

2. **SDK for Programmatic Control**: `@opencode-ai/sdk` provides type-safe session management, prompt injection, and SSE event subscription. You can build a meta-orchestrator that drives OpenCode sessions programmatically.

3. **HTTP Server as Orchestration Surface**: `opencode serve` exposes a full REST API with OpenAPI spec. Any language can control OpenCode via HTTP. This is a massive advantage for polyglot orchestration systems.

4. **Event Bus Architecture**: The strongly-typed event bus enables reactive orchestration patterns. Agents, tools, and external systems can all subscribe to events and react accordingly.

5. **Multi-Model Teams**: A single orchestration session can mix Claude for complex reasoning, GPT for fast code generation, and Gemini for large-context analysis. Pi cannot do this natively.

6. **Community Orchestration Layers**: oh-my-opencode, swarm-tools, opencode-workspace, and opencode-swarm provide battle-tested orchestration patterns. This ecosystem does not exist for Pi at the same scale.

**Pi Advantages:**

1. **Extension Depth**: Pi's TypeScript extensions hook into the agent lifecycle at a lower level. The `context` event lets extensions rewrite messages before the LLM sees them. `session_before_compact` customizes summarization. `tool_call` intercepts or gates tool invocations. OpenCode's plugin hooks are shallower by comparison (before/after tool calls, session events).

2. **Minimal Context Overhead**: Pi's ~200-token system prompt leaves virtually the entire context window for actual work. OpenCode's larger prompt + tool descriptions consume meaningful context, especially with MCP servers loaded.

3. **Embeddability**: Pi's RPC and SDK modes make it trivially embeddable as a subprocess in another application. OpenCode's server mode is more heavyweight (full HTTP server with SSE).

4. **Deterministic Behavior**: Fewer moving parts means more predictable behavior. When you need an agent to do exactly one thing reliably, Pi's 4-tool constraint reduces failure modes.

5. **No Permission Complexity**: Pi's extension system doesn't have OpenCode's permission propagation issues with nested subagents. What you configure is what you get.

### Extension System Comparison

| Feature | OpenCode Plugins | Pi Extensions |
|---------|-----------------|---------------|
| Language | TypeScript/JavaScript | TypeScript |
| Hook depth | Before/after tool calls, sessions | Full lifecycle (context, compact, tool_call, session events, message history) |
| Message rewriting | Not natively (need plugin workaround) | First-class via `context` event |
| Distribution | npm, local files | npm, git, local files |
| Community catalog | opencode.cafe, awesome-opencode | npm registry |
| MCP integration | Native, first-class | Not built-in |
| RAG/memory hooks | Via plugins | Native extension event (`context`) |

### The Orchestration Verdict

**For building an orchestration harness on top of an agent:**
- **Pi wins** if you want a lightweight, embeddable subprocess that you control from the outside. Its minimal footprint, RPC mode, and deep extension hooks make it ideal as a "worker agent" in a larger orchestration system.
- **OpenCode wins** if you want the agent infrastructure itself to handle orchestration. Its TaskTool, Teams, SDK, and HTTP server make it a self-contained orchestration platform.

**For the L-Thread Orchestrator pattern specifically:**
- Pi's subprocess/RPC model maps cleanly to spawning tmux sessions or task workers
- OpenCode's SDK could replace the tmux layer entirely -- `opencode serve` + SDK calls replaces `tmux send-keys` with proper API calls and SSE event streams
- OpenCode's permission and subagent issues mean you may fight the framework when trying to implement custom orchestration policies

---

## 10. Implications for L-Thread Orchestrator

### What OpenCode's Architecture Teaches Us

1. **HTTP+SSE is the right communication primitive for agent orchestration.** File-based polling (Claude Code Teams) introduces latency and complexity. Event-driven delivery through SSE is superior. The L-Thread Orchestrator's tmux-based approach is a middle ground -- more reliable than file polling but less structured than HTTP+SSE.

2. **The SDK surface matters enormously.** OpenCode's auto-generated TypeScript SDK from OpenAPI spec means any integration is type-safe and versioned. Building orchestration on top of `tmux send-keys` is brittle by comparison. If OpenCode's SDK were used as the transport layer, the orchestrator would gain typed session management, proper error handling, and SSE event streams for free.

3. **Permission propagation in nested agents is a hard, unsolved problem.** OpenCode has been fighting this for months (issues #4267, #8114, #12566). Any orchestration system that spawns agents which spawn sub-agents will encounter this. The L-Thread Orchestrator should design its permission model upfront rather than discovering these issues in production.

4. **The plugin/extension ecosystem is where orchestration patterns emerge.** oh-my-opencode, swarm-tools, and opencode-workspace prove that the community builds orchestration on top of extensible primitives. Providing the right hooks (event bus, lifecycle events, tool interception) is more important than building orchestration features directly.

5. **Multi-model teams are a real differentiator.** The ability to assign different LLMs to different agents in the same orchestration session enables cost optimization (cheap models for routine tasks, expensive models for complex reasoning) and capability optimization (different models excel at different tasks).

### Strategic Options

| Option | Description | Risk |
|--------|-------------|------|
| **Adopt OpenCode SDK as transport** | Replace tmux layer with `opencode serve` + SDK | Tight coupling to OpenCode's release cycle |
| **Use Pi as worker agent** | Spawn Pi processes via RPC for each task | Smaller community, less multi-agent support |
| **Hybrid approach** | OpenCode for orchestration backbone, Pi for lightweight workers | Complexity of managing two agent runtimes |
| **Stay on tmux + Claude Code** | Current approach, proven but brittle | tmux is not a proper agent communication protocol |

### Recommendation

OpenCode's HTTP+SSE+SDK architecture represents the direction agent orchestration is heading. The L-Thread Orchestrator should study its event bus design and consider migrating from tmux-based communication to HTTP+SSE as the transport layer, regardless of whether OpenCode itself is adopted as the underlying agent. The key insight is: **agents should be driven by APIs, not by terminal emulation**.

---

## Sources

- [OpenCode Official Site](https://opencode.ai/)
- [anomalyco/opencode GitHub Repository](https://github.com/anomalyco/opencode)
- [OpenCode Agents Documentation](https://opencode.ai/docs/agents/)
- [OpenCode SDK Documentation](https://opencode.ai/docs/sdk/)
- [OpenCode Server Documentation](https://opencode.ai/docs/server/)
- [OpenCode Plugins Documentation](https://opencode.ai/docs/plugins/)
- [OpenCode MCP Servers Documentation](https://opencode.ai/docs/mcp-servers/)
- [OpenCode Rules Documentation](https://opencode.ai/docs/rules/)
- [OpenCode Config Documentation](https://opencode.ai/docs/config/)
- [OpenCode ACP Support](https://opencode.ai/docs/acp/)
- [OpenCode Providers Documentation](https://opencode.ai/docs/providers/)
- [How Coding Agents Actually Work: Inside OpenCode -- Moncef Abboud](https://cefboud.com/posts/coding-agents-internals-opencode-deepdive/)
- [OpenCode: The Background Story -- TechFundingNews](https://techfundingnews.com/opencode-the-background-story-on-the-most-popular-open-source-coding-agent-in-the-world/)
- [Building Agent Teams in OpenCode -- DEV Community](https://dev.to/uenyioha/porting-claude-codes-agent-teams-to-opencode-4hol)
- [Oh My OpenCode](https://ohmyopencode.com/)
- [oh-my-opencode GitHub](https://github.com/code-yeongyu/oh-my-opencode)
- [awesome-opencode GitHub](https://github.com/awesome-opencode/awesome-opencode)
- [opencode.cafe](https://www.opencode.cafe/)
- [OpenCode vs Claude Code -- Daniel Miessler](https://danielmiessler.com/blog/opencode-vs-claude-code)
- [Subagent-to-Subagent Delegation PR #7756](https://github.com/anomalyco/opencode/pull/7756)
- [TaskTool Dynamic Model Selection Issue #6651](https://github.com/anomalyco/opencode/issues/6651)
- [Subagent Permission Issues #12566](https://github.com/anomalyco/opencode/issues/12566)
- [Pi Coding Agent -- Mario Zechner](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Pi Monorepo GitHub](https://github.com/badlogic/pi-mono)
- [Rhys Sullivan on OpenCode](https://x.com/RhysSullivan/status/2007898509257949478)
- [David Hill Joins Anomaly](https://x.com/iamdavidhill/status/1967499661259780415)
- [swarm-tools GitHub](https://github.com/joelhooks/swarm-tools)
- [opencode-workspace GitHub](https://github.com/kdcokenny/opencode-workspace)
- [opencode-swarm GitHub](https://github.com/zaxbysauce/opencode-swarm)
- [Zed ACP for OpenCode](https://zed.dev/acp/agent/opencode)
