# OSS Coding Agents Landscape: OpenCode, Pi Agent, and the Emerging Ecosystem

**Date:** 2026-03-05
**Research Focus:** Architecture, multi-agent orchestration, extensibility, and custom harness potential across OSS coding agents

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [OpenCode (Anomaly/SST)](#opencode)
3. [Pi Agent (badlogic/pi-mono)](#pi-agent)
4. [oh-my-pi (can1357)](#oh-my-pi)
5. [Nicopreme's Pi Extensions](#nicopremes-pi-extensions)
6. [OpenCode Ecosystem: oh-my-opencode, OCX, opencode-workspace](#opencode-ecosystem)
7. [OpenWork (different-ai)](#openwork)
8. [Mission Control (builderz-labs)](#mission-control)
9. [Stoneforge AI / Other Dashboard Approaches](#stoneforge-and-dashboard-approaches)
10. [Comparison Matrix](#comparison-matrix)
11. [Custom Harness Suitability Analysis](#custom-harness-suitability)
12. [Key Takeaways for L-Thread Orchestrator](#key-takeaways)

---

## Executive Summary

The OSS coding agent landscape in early 2026 has consolidated around two major poles:

- **OpenCode** (Go, 100K+ GitHub stars): The dominant open-source Claude Code alternative, model-agnostic, client/server architecture, rich plugin ecosystem via OCX. Built by Anomaly (formerly SST), the team behind terminal.shop.
- **Pi Agent** (TypeScript, growing community): A deliberately minimal coding harness by Mario Zechner (libGDX creator), with an aggressive extension system, 4 operating modes including SDK/RPC for programmatic embedding, and a vibrant community building multi-agent orchestration on top.

For building a custom multi-agent harness, **Pi Agent's SDK/RPC mode is the strongest foundation** -- it was designed from day one for programmatic embedding, while OpenCode's architecture requires working through its HTTP/SSE server layer.

Key accounts from dotta's following map to this ecosystem:
- **@opencode** / **@RhysSullivan** / **@iamdavidhill** --> OpenCode (Anomaly)
- **@nicopreme** --> Pi Agent extensions (pi-subagents, pi-messenger, pi-mcp-adapter)
- **@benjaminshafii** --> OpenWork (desktop GUI over OpenCode)
- **@stoneforge_ai** --> Dashboard approach to agent orchestration (minimal public footprint)

---

## OpenCode

### Overview

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [anomalyco/opencode](https://github.com/anomalyco/opencode) |
| **Language** | Go |
| **Stars** | 100K+ |
| **Contributors** | 700+ |
| **Users** | 2.5M+ monthly |
| **License** | MIT |
| **Website** | [opencode.ai](https://opencode.ai/) |

OpenCode is a Go-based CLI application that brings AI assistance to your terminal. Originally built as `sst/opencode` by the Serverless Stack team, it rebranded under Anomaly (the company's legal name) in early 2026, moving to `anomalyco/opencode`.

**Key people:**
- Dax Raad (@thdxr) -- Co-founder, vocal about open-source philosophy
- David Hill (@iamdavidhill) -- Design lead, formerly Head of Design at Laravel, also building terminal.shop
- Rhys Sullivan (@RhysSullivan) -- Core contributor
- Jay V -- CEO
- Frank Wang -- CTO

### Architecture

OpenCode uses a **client/server architecture**:

```
Clients (TUI, Web, Desktop, IDE)
        |
    HTTP + SSE
        |
   OpenCode Server (Go)
     |         |         |
  LLM APIs   Tools   MCP Servers
```

**Core design decisions:**
- **All clients communicate via HTTP + SSE** -- the TUI is just one frontend. This enables remote driving (e.g., from a mobile app).
- **Event-driven state broadcasting** -- state changes are pushed to connected clients via Server-Sent Events.
- **SQLite for persistence** -- sessions, messages, and state stored locally.
- **Vercel AI SDK** -- used internally for provider adapters despite being a Go application (the SDK runs in a Node sidecar for some providers).
- **LSP integration** -- connects to Language Server Protocol servers for type-aware operations.

### Model Support (75+ providers)

OpenCode supports a massive provider matrix: Anthropic Claude, OpenAI GPT, Google Gemini, AWS Bedrock, Azure OpenAI, Groq, Cerebras, xAI, OpenRouter, Ollama (local), and any OpenAI-compatible endpoint. Model selection is fully decoupled from agent behavior.

**Note on Anthropic access:** In January 2026, Anthropic blocked OpenCode from using consumer OAuth tokens. OpenCode responded by launching **Black** (enterprise API gateway at $20/$100/$200/mo) and **Zen** (pay-as-you-go curated gateway).

### Built-in Tools

| Tool | Purpose |
|------|---------|
| `BashTool` | Execute shell commands |
| `EditTool` | Edit files with diffs |
| `ReadTool` | Read file contents |
| `WriteTool` | Write files |
| `GrepTool` | Search patterns in files |
| `GlobTool` | Find files by pattern |
| `ListTool` | List directory contents |
| `WebFetchTool` | Fetch web content |
| `TodoWriteTool` | Write todo lists |
| `TodoReadTool` | Read todo lists |
| `TaskTool` | Spawn and manage sub-agents |

### Tool Registration System

The `ToolRegistry` maintains a centralized map of all available tools. The tool pipeline:
1. Tools from various sources registered in `ToolRegistry`
2. Resolved per agent and model capabilities via `resolveTools()`
3. Transformed for the AI model by `ProviderTransform`
4. Executed with results tracked through `MessageV2.ToolPart` states

### MCP Integration

OpenCode implements MCP through a client architecture connecting to both **local (stdio-based)** and **remote (HTTP/SSE)** MCP servers. Configured in `opencode.json`. Known limitation: enabling many MCP servers dumps all tool definitions into context immediately, consuming significant token budget.

### Agent System

**Two types of agents:**
- **Primary agents** -- main assistants you interact with directly
- **Subagents** -- specialized assistants invoked by primary agents via `TaskTool` or by users via `@mention`

**Built-in agents:**

| Agent | Type | Purpose |
|-------|------|---------|
| `Build` | Primary | Full-access development (default) |
| `Plan` | Primary | Read-only analysis and planning |
| `General` | Subagent | Multi-step research tasks |
| `Explore` | Subagent | Fast read-only codebase exploration |

**Custom agents** are defined as markdown files with YAML frontmatter in `.opencode/agents/` or `~/.config/opencode/agents/`. Configuration includes:
- `mode`: primary, subagent, or all
- `tools`: glob patterns for allowed tools
- `model`: specific model to use
- `temperature`: per-agent tuning
- `hidden`: hide from autocomplete (for programmatic-only subagents)

### Multi-Agent Orchestration

OpenCode's multi-agent support is **primarily through the TaskTool**:
- Primary agents can invoke subagents as tool calls
- Subagent output is returned as the tool result
- No built-in parallel agent execution -- this is delegated to community solutions

The orchestration gap is filled by ecosystem projects (see below).

---

## Pi Agent

### Overview

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) |
| **Language** | TypeScript |
| **npm** | [@mariozechner/pi-coding-agent](https://www.npmjs.com/package/@mariozechner/pi-coding-agent) |
| **Creator** | Mario Zechner (libGDX creator) |
| **Website** | [pi.dev](https://shittycodingagent.ai/) (aka shittycodingagent.ai) |
| **License** | MIT |
| **Philosophy** | Radical minimalism -- 4 core tools, everything else via extensions |

### Architecture

Pi is a **TypeScript monorepo** (`npm workspaces`, lockstep versioning) with layered packages:

```
pi-ai              -- Unified LLM API across providers
   |
pi-agent-core      -- Agent loop with tool calling
   |
pi-coding-agent    -- Full coding agent (tools, sessions, extensibility)
   |
pi-tui             -- Terminal UI (Bubble Tea-like for Node)
```

**Core design thesis:** A coding agent needs only 4 tools -- `read`, `write`, `edit`, `bash`. Everything else is an extension.

### 4 Operating Modes (Critical for Custom Harnesses)

| Mode | Purpose | Interface |
|------|---------|-----------|
| **Interactive** | Standard TUI | Terminal |
| **Print/JSON** | Scripting/CI | stdout |
| **RPC** | Process integration | stdin/stdout JSON protocol |
| **SDK** | Programmatic embedding | TypeScript imports |

The **RPC and SDK modes are the killer feature for custom harness builders**:

```typescript
// SDK mode -- import directly
import { createAgentSession, runPrintMode, runRpcMode } from 'pi-coding-agent';

// Create a programmatically controlled agent
const session = await createAgentSession({
  model: 'claude-opus-4-6',
  tools: ['read', 'write', 'edit', 'bash'],
  extensions: ['pi-subagents', 'pi-mcp-adapter'],
});
```

For non-Node integrations, RPC mode provides a JSON protocol over stdin/stdout.

### Model Support

pi-ai provides a unified LLM API supporting: Anthropic, OpenAI, Google, Azure, Bedrock, Mistral, Groq, Cerebras, xAI, Hugging Face, Kimi, MiniMax, OpenRouter, Ollama, and any OpenAI-compatible endpoint. Features include streaming, tool calling with TypeBox schemas, thinking/reasoning support, cross-provider context handoffs, and token/cost tracking.

### Extension System

Extensions are TypeScript modules that can:
- Register custom tools
- Subscribe to events (lifecycle hooks)
- Add commands (slash commands)
- Add keyboard shortcuts
- Register/override model providers
- Add UI components

**Installation:**
```bash
pi install npm:@foo/pi-tools
pi install git:github.com/user/repo
# Or use directly without installing:
pi --extension ./my-ext.ts
```

**Package types:**
- **Extensions** -- TypeScript modules with full API access
- **Skills** -- Prompt templates available as `/skill:name`
- **Prompt Templates** -- Expand via `/templatename`
- **Themes** -- Visual customization

Packages use the `pi-package` npm keyword for discoverability. Security note: packages run with full system access.

---

## oh-my-pi

### Overview

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) |
| **Creator** | can1357 |
| **Base** | Fork/extension of Pi Agent |
| **Focus** | Performance optimization, hash-anchored edits, LSP, subagents |

oh-my-pi is a comprehensive enhancement layer over Pi Agent that introduces several innovations:

### Key Innovations

**1. Hash-anchored edits (Hashline)**
Every line gets a short content-hash anchor. The model references anchors instead of reproducing text. If the file changed since last read, hashes won't match and the edit is rejected. This eliminates "string not found" errors and ambiguous matches.

**2. LSP Integration (11 operations)**
diagnostics, definition, type_definition, implementation, references, hover, symbols, rename, code_actions, status, reload

**3. Subagents**
Full output access via `agent://<id>` resources, isolated execution contexts, async background jobs with configurable concurrency.

**4. Python Support**
Line operations for precise edits, shared gateway for kernel reuse, custom module loading, rich output.

### Benchmark Results

Benchmarked across 16 models and 180 tasks (3 runs each):
- Grok Code Fast 1: improved from 6.7% to **68.3%** (10x improvement)
- Gemini 3 Flash: beat Google's own best attempt by +5 percentage points

---

## Nicopreme's Pi Extensions

### Overview

Nico Bailon (@nicopreme) is one of the most prolific Pi extension builders, based in Vancouver, BC. His philosophy: prototype changes, work backward to identify needed extension points, then open issues for upstream API design.

### Key Extensions

#### pi-subagents
| Attribute | Detail |
|-----------|--------|
| **GitHub** | [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents) |
| **npm** | `@nicopreme/pi-subagents` |

Async subagent delegation with truncation, artifacts, and session sharing. Ships with ready-to-use agents:
- **scout** -- codebase reconnaissance
- **planner** -- implementation planning
- **worker** -- task execution
- **reviewer** -- code review
- **context-builder** -- context assembly
- **researcher** -- research tasks

Supports **chain execution**: `/chain scout "scan the codebase" -> planner "create implementation plan"`

Agents are markdown files with YAML frontmatter. Agents can use MCP server tools directly (requires pi-mcp-adapter).

#### pi-messenger
| Attribute | Detail |
|-----------|--------|
| **GitHub** | [nicobailon/pi-messenger](https://github.com/nicobailon/pi-messenger) |

**Multi-agent coordination through the filesystem.** No daemon required.

- Shared state lives in `~/.pi/agent/messenger/` (registry, inboxes, swarm claims/completions)
- **Crew feature**: Turns a PRD into a dependency graph of tasks executed in parallel waves
  - Planner explores the codebase and drafts tasks
  - Workers implement ready tasks in parallel waves

This is the closest Pi ecosystem analog to our L-Thread Orchestrator's conduit/teams modes.

#### pi-mcp-adapter
| Attribute | Detail |
|-----------|--------|
| **GitHub** | [nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter) |

Solves the MCP token bloat problem. Instead of loading all tool definitions upfront (~10K+ tokens per MCP server):
- **One proxy tool (~200 tokens)** replaces hundreds
- Agent discovers tools on-demand
- Servers only start when actually used
- Specific tools can be promoted to first-class Pi tools via `directTools` config

This is a genuinely clever architecture -- OpenCode's MCP integration suffers from exactly this context bloat problem.

#### Other Extensions
- **pi-web-access** -- Web search/extraction using Chrome cookies, Perplexity, or Gemini API
- **pi-rewind-hook** -- Git-backed checkpoints for AI coding sessions, browse and restore file states
- **pi-annotate** -- Visual annotation mode for Chrome (click elements, add comments, get CSS selectors)
- **surf-cli** -- CLI for controlling Chrome from any agent (screenshots, navigation, element interaction)

---

## OpenCode Ecosystem

### oh-my-opencode

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [code-yeongyu/oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) |
| **Website** | [ohmyopencode.com](https://ohmyopencode.com/) |
| **npm** | `oh-my-opencode` |
| **Type** | Batteries-included orchestration layer for OpenCode |

**Three-tier agent hierarchy:**
1. Master orchestrator (e.g., Sisyphus on claude-opus-4-6)
2. Primary agents (task-specific)
3. Specialized subagents

**Built-in agents include:**
- **Sisyphus** -- Main orchestrator, plans and delegates with aggressive parallel execution
- **Hephaestus, Prometheus, Oracle, Librarian** -- Specialized development agents

**25+ built-in hooks** across categories:
- Task Management (todo-continuation-enforcer, empty-task-response-detector)
- Context Management (context-window-monitor, compaction-context-injector)
- Session Management (session-recovery, auto_resume)
- Code Quality (comment-checker, thinking-block-validator)

**Built-in MCPs:** websearch (Exa), context7 (docs), grep_app (GitHub search)

**Configuration:** `.opencode/oh-my-opencode.jsonc` with 14 overridable agents (21 fields each), 8 categories, and `disabled_*` arrays.

### OCX (OpenCode Extensions)

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [kdcokenny/ocx](https://github.com/kdcokenny/ocx) |
| **Type** | Package manager for OpenCode |
| **Model** | ShadCN-style (components copied into project, not hidden in node_modules) |

OCX provides:
- Profile-based configuration management
- Component registries for distributing extensions
- Plugin system via `@opencode-ai/plugin` SDK (TypeScript)
- Dependency resolution between plugins
- npm dependency management isolated in `.opencode/node_modules`

### opencode-workspace

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [kdcokenny/opencode-workspace](https://github.com/kdcokenny/opencode-workspace) |
| **Type** | Curated multi-agent harness bundle |

One install gives you:
- 4 plugins (delegation, planning, notifications, worktrees)
- 2 npm plugins (DCP, markdown table formatter)
- 3 MCP servers (Context7, Exa, GitHub Grep)
- 4 agents (researcher, coder, scribe, reviewer)
- 4 skills (plan protocol, code review, code philosophy, frontend philosophy)
- 1 command (/review)
- Orchestrator configurations for plan/build/explore agents

---

## OpenWork

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [different-ai/openwork](https://github.com/different-ai/openwork) |
| **Website** | [openwork.software](https://openwork.software/) |
| **Type** | Desktop GUI over OpenCode |
| **Platforms** | macOS (stable), Windows (stable), Linux (alpha) |
| **Relation to @benjaminshafii** | Creator/contributor |

OpenWork is an open-source alternative to Claude Cowork (Anthropic's desktop app). It provides a GUI wrapper around OpenCode with:
- Workspace management
- Session handling
- Live streaming updates
- Permission controls
- Skill manager for installing plugins
- Connectors for WhatsApp/Slack/Telegram

**Key design:** Powered by OpenCode, so anything OpenCode can do is available. Local-first, runs on your machine. Free to use with free models; you only pay for API usage with paid cloud models.

---

## Mission Control

| Attribute | Detail |
|-----------|--------|
| **GitHub** | [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control) |
| **Type** | Open-source dashboard for AI agent fleet orchestration |
| **Stack** | SQLite, zero external dependencies |

Mission Control is the closest thing to what @stoneforge_ai appears to be building. Features:
- 28 panels (tasks, agents, logs, tokens, memory, cron, alerts, webhooks, pipelines)
- Real-time WebSocket + SSE push updates
- Token usage dashboard with per-model breakdowns and cost analysis
- Kanban board (inbox -> backlog -> todo -> in-progress -> review -> done)
- GitHub inbound sync with label/assignee mapping
- CLI agent registration with heartbeats and auto-registration
- Agent-agnostic gateway (connects to any orchestration framework)
- Role-based access control (viewer, operator, admin)

---

## Stoneforge and Dashboard Approaches

### Stoneforge AI (@stoneforge_ai)

Stoneforge AI has a minimal public footprint (60 Twitter followers at time of research). Self-describes as "open-source web dashboard and runtime for orchestrating AI coding agents." No significant GitHub presence or documentation was found through web search. This appears to be a very early-stage project.

### Other Notable Dashboard Projects

| Project | GitHub | Description |
|---------|--------|-------------|
| **Overstory** | [jayminwest/overstory](https://github.com/jayminwest/overstory) | Multi-agent orchestration with git worktrees + tmux, live dashboard |
| **AI-Agents-Orchestrator** | [hoangsonww/AI-Agents-Orchestrator](https://github.com/hoangsonww/AI-Agents-Orchestrator) | Coordinates Claude, Codex, Gemini CLI, Copilot CLI via REPL or Vue/Nuxt dashboard |
| **agent-orchestrator** | [ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator) | Plans tasks, spawns agents in git worktrees, handles CI fixes |
| **OpenAgentsControl** | [darrenhinde/OpenAgentsControl](https://github.com/darrenhinde/OpenAgentsControl) | Plan-first development workflows with approval-based execution |

---

## Comparison Matrix

### Core Architecture

| Feature | OpenCode | Pi Agent | Claude Code |
|---------|----------|----------|-------------|
| **Language** | Go | TypeScript | Proprietary |
| **Architecture** | Client/Server (HTTP+SSE) | Monorepo layered packages | CLI binary |
| **Stars** | 100K+ | Growing | N/A (closed) |
| **Model Agnostic** | Yes (75+ providers) | Yes (15+ providers) | No (Anthropic only) |
| **Open Source** | Yes (MIT) | Yes (MIT) | No |
| **MCP Support** | Yes (stdio + HTTP) | Yes (via pi-mcp-adapter) | Yes (native) |
| **Programmatic API** | HTTP/SSE server | SDK + RPC + JSON modes | No |
| **Extension System** | OCX (ShadCN-style) | npm packages (TypeScript) | Custom agents (md) |

### Multi-Agent Orchestration

| Feature | OpenCode | Pi Agent | Claude Code |
|---------|----------|----------|-------------|
| **Built-in subagents** | Yes (TaskTool) | No (via extensions) | Yes (Task tool) |
| **Parallel execution** | Via oh-my-opencode | Via pi-subagents | Via /orchestrator |
| **Agent definitions** | Markdown + YAML | Markdown + YAML | Markdown + YAML |
| **Custom agent roles** | Yes | Yes | Yes |
| **Inter-agent messaging** | Via plugins | Via pi-messenger | Via SendMessage |
| **Orchestrator pattern** | oh-my-opencode (Sisyphus) | pi-messenger (Crew) | L-Thread Orchestrator |

### Extensibility

| Feature | OpenCode | Pi Agent | Claude Code |
|---------|----------|----------|-------------|
| **Tool registration** | ToolRegistry (Go) | Extension API (TypeScript) | N/A |
| **Custom tools** | Yes (plugins) | Yes (extensions) | No |
| **Hooks/Events** | oh-my-opencode (25+) | Extension events | Hooks (limited) |
| **Package manager** | OCX | npm/pi install | N/A |
| **Provider override** | Config-based | Extension API | N/A |
| **MCP token optimization** | Not built-in | pi-mcp-adapter (proxy) | Not built-in |

### Harness Integration

| Feature | OpenCode | Pi Agent | Claude Code |
|---------|----------|----------|-------------|
| **Embed as library** | No (server process) | Yes (SDK mode) | No |
| **RPC protocol** | HTTP/SSE | stdin/stdout JSON | No |
| **Scripting mode** | Limited | Print/JSON mode | --print flag |
| **Background agents** | Via plugins | Async subagents | Via tmux |
| **Session sharing** | SQLite | Extension-based | Not built-in |

---

## Custom Harness Suitability Analysis

### For building a custom multi-agent orchestration harness, the options rank:

#### Tier 1: Best Foundation

**Pi Agent (SDK/RPC mode)**
- **Strengths:** Designed for embedding from day one. Import `createAgentSession` directly in TypeScript. RPC mode for non-Node integration. Minimal core (4 tools) means less to fight against. Extension system lets you add exactly what you need.
- **Weaknesses:** Smaller community than OpenCode. Less battle-tested at scale. TypeScript-only for SDK mode.
- **Best for:** Custom orchestrators that need programmatic control over agent lifecycle, tool selection, and session management.

#### Tier 2: Strong Alternative

**OpenCode (HTTP/SSE server)**
- **Strengths:** Massive community, battle-tested, rich ecosystem (oh-my-opencode, OCX, opencode-workspace). Client/server architecture means you can build any frontend.
- **Weaknesses:** No direct library embedding -- you must spawn a server process and communicate over HTTP. Go codebase means extension points are limited to what the plugin API exposes. MCP token bloat not solved at core level.
- **Best for:** Teams that want a proven foundation and are okay with an HTTP integration layer.

#### Tier 3: Useful Components

**oh-my-opencode / opencode-workspace / Mission Control**
- Not foundations themselves, but contain valuable patterns for agent hierarchy, hook systems, and dashboard design that can inform custom harness architecture.

### Specific Comparison: L-Thread Orchestrator vs. Pi-based Harness

| L-Thread Orchestrator Feature | Pi Agent Equivalent |
|-------------------------------|---------------------|
| Conduit mode (tmux panes) | pi-subagents (async delegation) |
| Teams mode (parallel agents) | pi-messenger Crew (parallel waves) |
| State JSON files | Extension event system + filesystem state |
| Roadblock recovery | pi-rewind-hook (git checkpoints) |
| Chrome DevTools E2E | pi-annotate + surf-cli |
| MCP integration | pi-mcp-adapter (proxy pattern) |
| AGENTS.md custom agents | Markdown agents with YAML frontmatter |

---

## Key Takeaways for L-Thread Orchestrator

### 1. Pi Agent is the strongest embedding target

If migrating from Claude Code to an OSS agent, Pi's SDK mode provides the most direct path to programmatic multi-agent orchestration. You can import the agent session, control tool registration, manage multiple parallel sessions in a single Node process, and tap into the extension event system for coordination.

### 2. Nicopreme's extensions solve real orchestration problems

`pi-messenger` (file-based inter-agent messaging with no daemon) and `pi-subagents` (async delegation with chains) are directly relevant to the L-Thread Orchestrator's conduit/teams modes. The `pi-mcp-adapter` proxy pattern for MCP token optimization is something our orchestrator should adopt regardless of platform.

### 3. OpenCode's ecosystem shows what maturity looks like

oh-my-opencode's 25+ hooks, 14 agent definitions, and three-tier hierarchy represent the most mature community-built orchestration pattern. Study its architecture even if not using OpenCode as the base.

### 4. The MCP token bloat problem is universal

Both OpenCode and Claude Code suffer from MCP tool definitions consuming context. The pi-mcp-adapter's proxy approach (~200 tokens for one proxy tool vs. 10K+ per server) is the best solution found in this research.

### 5. Dashboard orchestration is emerging but immature

Mission Control, Overstory, and similar projects show demand for visual agent fleet management, but none are production-ready yet. Stoneforge AI appears to be targeting this space but has minimal public presence.

### 6. Model agnosticism is table stakes

Both OpenCode and Pi support 15-75+ providers. Any custom harness should be model-agnostic from day one. The decoupling of agent behavior from model selection (as both OpenCode and Pi do) is the correct architectural pattern.

### 7. The hash-anchored edit pattern (oh-my-pi) is worth stealing

Hash-anchoring every line eliminates edit ambiguity errors. This technique showed a 10x improvement on some models (Grok: 6.7% to 68.3%). This is model-agnostic and could be integrated into any agent's edit tool.

---

## Sources

### OpenCode
- [OpenCode Official Site](https://opencode.ai/)
- [anomalyco/opencode GitHub](https://github.com/anomalyco/opencode)
- [OpenCode Agents Docs](https://opencode.ai/docs/agents/)
- [OpenCode Tools Docs](https://opencode.ai/docs/tools/)
- [OpenCode Custom Tools](https://opencode.ai/docs/custom-tools/)
- [OpenCode Config](https://opencode.ai/docs/config/)
- [DeepWiki: OpenCode Architecture](https://deepwiki.com/anomalyco/opencode)
- [DeepWiki: MCP Architecture](https://deepwiki.com/anomalyco/opencode/13.1-mcp-architecture)
- [DeepWiki: Tool System](https://deepwiki.com/sst/opencode/5-tool-system)
- [DeepWiki: Provider System](https://deepwiki.com/sst/opencode/4.1-provider-management)
- [InfoQ: OpenCode Coding Agent](https://www.infoq.com/news/2026/02/opencode-coding-agent/)
- [TechFundingNews: OpenCode Background Story](https://techfundingnews.com/opencode-the-background-story-on-the-most-popular-open-source-coding-agent-in-the-world/)
- [How Coding Agents Actually Work: Inside OpenCode](https://cefboud.com/posts/coding-agents-internals-opencode-deepdive/)
- [OpenCode vs Claude Code (MorphLLM)](https://www.morphllm.com/comparisons/opencode-vs-claude-code)
- [OpenCode vs Claude Code (DataCamp)](https://www.datacamp.com/blog/opencode-vs-claude-code)
- [OpenCode vs Claude Code (Builder.io)](https://www.builder.io/blog/opencode-vs-claude-code)

### Pi Agent
- [badlogic/pi-mono GitHub](https://github.com/badlogic/pi-mono)
- [Pi Agent Coding Agent README](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/README.md)
- [Pi Extensions Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi SDK Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Pi Packages Docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/packages.md)
- [Pi Website (pi.dev)](https://shittycodingagent.ai/)
- [Pi Packages Registry](https://shittycodingagent.ai/packages)
- [Mario Zechner: What I Learned Building a Coding Agent](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [DeepWiki: Pi Coding Agent](https://deepwiki.com/badlogic/pi-mono/4-pi-coding-agent:-coding-agent-cli)
- [Pi Agent Revolution (Blog)](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [How to Build a Custom Agent Framework with PI](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Anatomy of a Minimal Coding Agent (Medium)](https://shivamagarwal7.medium.com/agentic-ai-pi-anatomy-of-a-minimal-coding-agent-powering-openclaw-5ecd4dd6b440)

### oh-my-pi
- [can1357/oh-my-pi GitHub](https://github.com/can1357/oh-my-pi)

### Nicopreme Extensions
- [nicobailon GitHub Profile](https://github.com/nicobailon)
- [pi-subagents GitHub](https://github.com/nicobailon/pi-subagents)
- [pi-messenger GitHub](https://github.com/nicobailon/pi-messenger)
- [pi-mcp-adapter GitHub](https://github.com/nicobailon/pi-mcp-adapter)

### OpenCode Ecosystem
- [oh-my-opencode GitHub](https://github.com/code-yeongyu/oh-my-opencode)
- [oh-my-opencode Website](https://ohmyopencode.com/)
- [oh-my-opencode Features](https://ohmyopencode.com/features/)
- [DeepWiki: oh-my-opencode Orchestration](https://deepwiki.com/code-yeongyu/oh-my-opencode/4.1-agent-orchestration-overview)
- [OCX GitHub](https://github.com/kdcokenny/ocx)
- [DeepWiki: OCX Plugin Architecture](https://deepwiki.com/kdcokenny/ocx/6.1-plugin-architecture)
- [opencode-workspace GitHub](https://github.com/kdcokenny/opencode-workspace)
- [opencode-agents GitHub](https://github.com/rothnic/opencode-agents)
- [OpenAgentsControl GitHub](https://github.com/darrenhinde/OpenAgentsControl)
- [Building Agent Teams in OpenCode (DEV)](https://dev.to/uenyioha/porting-claude-codes-agent-teams-to-opencode-4hol)

### OpenWork
- [different-ai/openwork GitHub](https://github.com/different-ai/openwork)
- [OpenWork Website](https://openwork.software/)
- [OpenWork HN Thread](https://news.ycombinator.com/item?id=46612494)

### Mission Control & Dashboards
- [builderz-labs/mission-control GitHub](https://github.com/builderz-labs/mission-control)
- [Overstory GitHub](https://github.com/jayminwest/overstory)
- [AI-Agents-Orchestrator GitHub](https://github.com/hoangsonww/AI-Agents-Orchestrator)
- [ComposioHQ/agent-orchestrator GitHub](https://github.com/ComposioHQ/agent-orchestrator)
