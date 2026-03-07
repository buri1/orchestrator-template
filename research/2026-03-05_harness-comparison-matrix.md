# Definitive Agent Harness Comparison Matrix

**Date:** 2026-03-05
**Purpose:** Comprehensive practical comparison of 10 agent harnesses for building a custom orchestrator
**Methodology:** Web research across official docs, GitHub repos, community reports, and release changelogs

---

## Executive Summary

This document evaluates 10 coding agent harnesses across 14 general dimensions and 6 orchestration-specific dimensions. The goal: determine which harness is the best foundation for building a **custom multi-agent orchestrator** -- not just which is the best coding assistant.

The distinction matters. A great coding assistant (Aider, Continue) may be terrible as an orchestration substrate. Conversely, a harness with mediocre UX but excellent programmatic APIs (Claude Agent SDK, Pi Agent) may be the ideal foundation.

**Top-line finding:** The Claude Agent SDK is the strongest foundation for pure programmatic orchestration. Pi Agent is the strongest for a self-contained, extensible harness that you fully own. OpenCode and Codex CLI are strong general-purpose alternatives with growing orchestration capabilities. Claude Code (the CLI product) is the most battle-tested for interactive multi-agent work but constrains you to Anthropic's ecosystem.

---

## 1. Harness Profiles

### 1.1 Pi Agent (badlogic/pi-mono)

**What it is:** A TypeScript monorepo containing a coding agent CLI, unified LLM API, TUI/web UI libraries, a Slack bot, and vLLM pod management. Created by Mario Zechner (libGDX creator). Philosophy: aggressively minimal core, aggressively extensible surface.

**Key differentiator:** Extensions are first-class -- they can register tools, subscribe to lifecycle events, add commands, and modify behavior. The harness deliberately ships *without* sub-agents or plan mode, expecting you to build or install what you need. This makes it uniquely suited for custom orchestration because it does not fight you.

**Stars:** ~9-19K | **License:** MIT | **Language:** TypeScript

### 1.2 Claude Code (Anthropic CLI)

**What it is:** Anthropic's official CLI coding agent, powered by Claude models. Ships with ~18 built-in tools, CLAUDE.md project instructions, slash commands, skills, hooks, and (as of Feb 2026) experimental Agent Teams for multi-agent coordination.

**Key differentiator:** The most deeply integrated harness for Claude models. Agent Teams allows a lead session to spawn teammates that communicate via message passing. Git worktree isolation is built in. The ecosystem (MCP support, custom subagents via `.claude/agents/`) is the richest of any single-vendor tool.

**Stars:** N/A (proprietary CLI) | **License:** Proprietary (Anthropic ToS) | **Language:** TypeScript

### 1.3 OpenCode (anomalyco)

**What it is:** The open-source coding agent with the largest community (116K+ stars, 650K+ MAU, 2.5M+ developers monthly). Built by the creators of terminal.shop. Features a client/server architecture, TUI, desktop app, and IDE extensions.

**Key differentiator:** Massive community, model-agnostic (75+ models), privacy-first architecture. Custom agents can be defined in config with their own system prompts and tool restrictions. MCP servers managed from config with on-demand startup. Sub-agents supported but cannot yet spawn their own sub-agents (depth limit).

**Stars:** ~116K | **License:** MIT | **Language:** Go/TypeScript

### 1.4 Aider

**What it is:** The pioneer of terminal AI pair programming. Git-native workflow with automatic commits. Supports 100+ languages and connects to virtually any LLM.

**Key differentiator:** Best-in-class git integration -- every edit becomes a git commit with a meaningful message. The "architect + editor" dual-model pattern is elegant. However, Aider is fundamentally a *pair programming* tool, not an orchestration platform. No native sub-agent spawning; multi-agent requires external wrappers.

**Stars:** ~26K+ | **License:** Apache 2.0 | **Language:** Python

### 1.5 Goose (Block)

**What it is:** Block's open-source AI agent framework, contributed to the Linux Foundation's Agentic AI Foundation in Dec 2025. Built in Rust. Extensible through MCP-based extensions.

**Key differentiator:** Most mature extension ecosystem via MCP. Subagents supported natively with configurable system prompts, tool restrictions, and timeouts. The Goose Grant program funds external development. Strong enterprise backing from Block (Square, Cash App).

**Stars:** ~27-32K | **License:** Apache 2.0 | **Language:** Rust

### 1.6 Cline

**What it is:** The dominant open-source AI coding agent for VS Code. Plan/Act pipeline with human approval at every step. 5M+ installs, 58K+ stars.

**Key differentiator:** IDE-native with the largest VS Code install base. MCP Marketplace for discovering and installing tools. Cline CLI 2.0 (Feb 2026) rebuilt for terminal-first workflows with fully isolated instances. Cline Teams adds SSO, RBAC, and central policy management for enterprise.

**Stars:** ~58K | **License:** Apache 2.0 | **Language:** TypeScript

### 1.7 Continue

**What it is:** Open-source AI code agent as a VS Code/JetBrains extension. Focus on source-controlled AI checks enforceable in CI. Hub-based model and rules sharing.

**Key differentiator:** The only harness that bridges IDE coding assistance with CI/CD enforcement. Continue Hub lets teams share models, rules, and prompts. Agent mode with custom system prompts (baseAgentSystemMessage). However, limited orchestration primitives -- no native sub-agent spawning or multi-agent coordination.

**Stars:** ~26K | **License:** Apache 2.0 | **Language:** TypeScript

### 1.8 Roo Code

**What it is:** Open-source AI dev team in your VS Code editor. Forked from Cline, differentiated by "custom modes" -- specialized personas with scoped tool permissions and per-mode model assignment.

**Key differentiator:** Best "mode orchestration" -- each mode (Architect, Code, Security Reviewer, etc.) gets its own model, system prompt, and tool permissions. The orchestrator delegates to specialized modes. However, this is mode-switching within a single agent, not true multi-agent spawning.

**Stars:** ~22K | **License:** Apache 2.0 | **Language:** TypeScript

### 1.9 Codex CLI (OpenAI)

**What it is:** OpenAI's lightweight terminal coding agent, built in Rust. Powers the Codex ecosystem (CLI + desktop app + VS Code extension). Uses GPT-5.x-Codex models.

**Key differentiator:** Native multi-agent with automatic orchestration -- Codex decides when to spawn sub-agents, each getting its own git worktree. The Codex App provides a desktop experience for parallel thread management. Skills system for task-specific extensions. MCP support via config.

**Stars:** ~63K | **License:** Apache 2.0 | **Language:** Rust

### 1.10 Claude Agent SDK

**What it is:** The programmatic library that powers Claude Code, exposed as an npm package (`@anthropic-ai/claude-agent-sdk`). Enables building fully custom agents with Claude's capabilities.

**Key differentiator:** The only harness designed *specifically* for programmatic agent building. Define agents with custom system prompts, restricted tool sets, and MCP servers. Spawn subagents with `Task` tool. Full control over orchestration, lifecycle, and permissions. Both TypeScript and Python SDKs available.

**Stars:** N/A (SDK package) | **License:** Anthropic Commercial ToS | **Language:** TypeScript/Python

---

## 2. Feature Comparison Matrix

### 2.1 General Features

| Dimension | Pi Agent | Claude Code | OpenCode | Aider | Goose | Cline | Continue | Roo Code | Codex CLI | Agent SDK |
|---|---|---|---|---|---|---|---|---|---|---|
| **Model Support** | 15+ providers (Anthropic, OpenAI, Google, Azure, Bedrock, Mistral, Groq, xAI, Ollama, etc.) | Claude only | 75+ models, any provider | 100+ models, any LLM | 25+ providers, any LLM with tool calling | Any provider via API keys | Any provider, local+remote mix | Any provider via API/LiteLLM | OpenAI models only (GPT-5.x-Codex) | Claude only |
| **Extension/Plugin System** | First-class TypeScript extensions with lifecycle events, tool registration, commands | CLAUDE.md, skills, slash commands, hooks, MCP servers | Plugins via config, MCP servers, custom agents | Limited (MCP server support emerging) | MCP-based extensions, grant-funded ecosystem | MCP Marketplace, Plan/Act pipeline | Continue Hub, context providers, custom rules | Custom modes with scoped permissions | Skills system, MCP servers | Programmatic tool registration, MCP |
| **Multi-Agent Support** | Not built-in; build via extensions or tmux spawning | Native Agent Teams (experimental), Task tool subagents | Sub-agents via config, no recursive spawning yet | None native; external wrappers only | Native subagents with configurable behavior | CLI 2.0 isolated instances; subagents via Claude Code bridge | No native multi-agent | Mode orchestration (single agent, multiple personas) | Native multi-agent with auto-spawning | Native subagents, full programmatic control |
| **Tool Registration API** | `extension.registerTool()` with schema + handler | Custom subagent tool configs in `.claude/agents/` | Agent config with allowed tools | Limited tool customization | MCP tool discovery + registration | MCP server integration, "ask Cline to add a tool" | Function/tool calling via config | Per-mode tool permission scoping | Skills + MCP server tools | `allowedTools` array per agent definition |
| **Event/Hook System** | Lifecycle events (onStart, onMessage, onTool, etc.) via extensions | Hooks (PreToolUse, PostToolUse, etc.), SessionStart, PreCompact | Limited hooks | Git commit hooks integration | Extension lifecycle events | Plan/Act approval pipeline | CI integration hooks | Mode transition events | Session lifecycle | Full programmatic event handling |
| **TUI/UI Customization** | TUI + Web UI + SDK for embedding | Terminal TUI, keyboard shortcuts | TUI + Desktop App + IDE extensions + Mobile | Terminal TUI | CLI + Desktop App | VS Code extension + CLI 2.0 | VS Code + JetBrains extensions | VS Code extension | Full-screen TUI + Desktop App | Headless (build your own UI) |
| **MCP Support** | Not native; buildable via extension | Full native MCP support | Native MCP from config | Emerging (community MCP servers) | Core architecture built on MCP | Native + MCP Marketplace | MCP support via config | MCP support via settings | Native MCP via config.toml | Native MCP support |
| **Git Worktree Isolation** | Manual (via tmux/extensions) | Built-in for Agent Teams | Built-in, auto-cleanup | Not native | Not native (via extensions) | CLI 2.0 isolated instances | Not native | Not native | Built-in per-agent worktrees | Configurable |
| **Session Management** | Print/JSON modes, RPC protocol, multi-session | Conversation history, compact, resume | Multi-session, client/server architecture | Session files, conversation history | Session persistence, resume | Session per instance | Session via workspace | Session per mode | Thread-based, persistent sessions | Full programmatic session control |
| **Cost Model** | Free (pay for LLM APIs) | $20-200/mo subscription OR API pay-as-you-go | Free (pay for LLM APIs) | Free (pay for LLM APIs) | Free (pay for LLM APIs) | Free (pay for LLM APIs) | Free (pay for LLM APIs) | Free (pay for LLM APIs) | Included in ChatGPT subscription ($20-200/mo) | API pay-as-you-go |
| **License** | MIT | Proprietary (Anthropic ToS) | MIT | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 | Apache 2.0 | Anthropic Commercial ToS |
| **Community Size** | ~9-19K stars, Discord, active maintainer | Massive (Anthropic-backed), Discord | 116K stars, 779 contributors, 2.5M devs/mo | 26K+ stars, 4.1M installs | 27-32K stars, Linux Foundation backing | 58K stars, 5M+ VS Code installs, 35+ team | 26K stars, 65 repos, Y Combinator backed | 22K stars, 1.2M VS Code installs, Discord | 63K stars, OpenAI backing | Growing, Anthropic Discord |
| **Documentation Quality** | Good (README + docs/, may need source reading) | Excellent (code.claude.com/docs) | Good (opencode.ai/docs, Mintlify) | Excellent (aider.chat with interactive demos) | Good (block.github.io/goose) | Good (docs.cline.bot) | Excellent (docs.continue.dev) | Good (docs.roocode.com) | Excellent (developers.openai.com/codex) | Excellent (platform.claude.com/docs) |
| **Stability/Maturity** | Medium (rapid iteration, 151 releases) | High (Anthropic production product) | High (650K MAU, major funding) | High (pioneer, 3+ years) | High (Linux Foundation, Block backing) | High (5M installs, enterprise offering) | High (Y Combinator, CI/CD focus) | Medium-High (Cline fork, growing fast) | High (OpenAI production product) | Medium-High (newer, but powers Claude Code) |

### 2.2 Scoring Summary (1-5 scale)

| Dimension | Pi | CC | OC | Aider | Goose | Cline | Cont. | Roo | Codex | SDK |
|---|---|---|---|---|---|---|---|---|---|---|
| Model Support | 5 | 1 | 5 | 5 | 5 | 5 | 5 | 5 | 1 | 1 |
| Extension System | 5 | 4 | 4 | 2 | 4 | 4 | 3 | 4 | 3 | 5 |
| Multi-Agent | 2 | 4 | 3 | 1 | 4 | 3 | 1 | 2 | 4 | 5 |
| Tool Registration | 5 | 4 | 4 | 2 | 4 | 3 | 3 | 4 | 3 | 5 |
| Event/Hook System | 5 | 4 | 2 | 2 | 3 | 3 | 3 | 2 | 2 | 5 |
| TUI/UI Customization | 4 | 3 | 5 | 3 | 4 | 4 | 4 | 4 | 4 | 5 |
| MCP Support | 2 | 5 | 5 | 2 | 5 | 5 | 4 | 4 | 4 | 5 |
| Git Worktree | 2 | 5 | 4 | 2 | 2 | 3 | 1 | 1 | 5 | 4 |
| Session Management | 4 | 4 | 5 | 3 | 3 | 3 | 3 | 3 | 4 | 5 |
| Cost Model | 5 | 2 | 5 | 5 | 5 | 5 | 5 | 5 | 2 | 3 |
| License | 5 | 1 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 1 |
| Community | 2 | 4 | 5 | 4 | 4 | 5 | 4 | 3 | 5 | 3 |
| Documentation | 3 | 5 | 4 | 5 | 4 | 4 | 5 | 4 | 5 | 5 |
| Stability | 3 | 5 | 4 | 5 | 4 | 5 | 4 | 3 | 5 | 3 |
| **TOTAL** | **52** | **51** | **60** | **44** | **52** | **52** | **46** | **45** | **52** | **55** |

> **Note:** These totals reflect *general-purpose* feature breadth. The orchestration-specific comparison below reweights for our use case.

---

## 3. Orchestration-Specific Comparison

This section evaluates each harness on the six capabilities that matter most for building a custom multi-agent orchestrator.

### 3.1 Detailed Assessment

#### Can you spawn sub-agents programmatically?

| Harness | Rating | Details |
|---|---|---|
| **Pi Agent** | Partial | No built-in sub-agent tool. You spawn pi instances via tmux or build it with extensions. The `bash` tool can invoke `pi` recursively. Slash commands can spawn review sub-agents. Maximum flexibility, zero hand-holding. |
| **Claude Code** | Yes | `Task` tool spawns subagents natively. Agent Teams spawns full teammate sessions. Subagents defined in `.claude/agents/*.md` or programmatically via SDK. |
| **OpenCode** | Yes | Sub-agents configurable in `opencode.jsonc`. Cannot recursively spawn (no sub-sub-agents yet, depth-1 only). Feature request open for recursive spawning with depth limits. |
| **Aider** | No | No native sub-agent support. Requires external orchestration (tmux, Docker, or wrapper frameworks like agent-orchestrator). |
| **Goose** | Yes | `Agent::new()` creates isolated agent instances. Subagent types definable with custom system prompts, tools, turn limits, and timeouts. |
| **Cline** | Partial | `use_subagents` tool launches parallel agents. Subagents get own prompt, context window, token budget. Cannot spawn nested subagents. |
| **Continue** | No | No sub-agent spawning. Single-agent architecture with mode-based behavior switching. |
| **Roo Code** | No | Mode orchestration (delegates to specialized modes) but this is persona switching, not true agent spawning. No isolated context windows per mode. |
| **Codex CLI** | Yes | Automatic sub-agent spawning with worktree isolation. Codex decides when to spawn or you can request it. Full orchestration across agents. |
| **Agent SDK** | Yes | Full programmatic control. Define agent types with `agents` parameter, spawn via `Task` in `allowedTools`, configure per-agent tools and prompts. Most flexible option. |

#### Can you inject custom system prompts?

| Harness | Rating | Details |
|---|---|---|
| **Pi Agent** | Yes | Extensions can modify prompts. Prompt templates are customizable. Project-local `.pi/` config for per-project instructions. |
| **Claude Code** | Yes | `CLAUDE.md` files (global, project, user). `custom_system_prompt` and `append_system_prompt` in SDK. Per-subagent custom prompts in `.claude/agents/*.md`. |
| **OpenCode** | Yes | Per-agent system prompt in config. `opencode.jsonc` agent definitions include custom instructions. |
| **Aider** | Partial | `--system-prompt` flag and config files. Limited compared to extension-based approaches. |
| **Goose** | Yes | `subagent_system.md` template. Per-subagent type configuration with custom system prompts. |
| **Cline** | Yes | Custom instructions in settings. Per-subagent prompts when using `use_subagents`. `.clinerules` files. |
| **Continue** | Yes | `baseSystemMessage` for Chat, `baseAgentSystemMessage` for Agent mode. Per-model prompt configuration in `config.yaml`. |
| **Roo Code** | Yes | Per-mode custom instructions with full prompt structure control. System prompt contains role definition, capabilities, and custom instructions per mode. |
| **Codex CLI** | Yes | `AGENTS.md`, `codex.md` instructions, per-skill system prompts. Model-level instruction configuration. |
| **Agent SDK** | Yes | `custom_system_prompt`, `append_system_prompt` parameters. Per-subagent dedicated prompts. Full control. |

#### Can you monitor agent health?

| Harness | Rating | Details |
|---|---|---|
| **Pi Agent** | Partial | Extension lifecycle events (onError, onComplete). JSON output mode for parsing. RPC protocol for external monitoring. No built-in dashboard. |
| **Claude Code** | Partial | Agent Teams keyboard shortcuts (Shift+Up/Down, Ctrl+T task list). Message delivery notifications. No programmatic health API. |
| **OpenCode** | Partial | Client/server architecture enables remote monitoring. Session state observable. No built-in health dashboard. |
| **Aider** | No | Terminal output only. No health monitoring primitives. |
| **Goose** | Partial | Subagent timeouts and turn limits. Extension status monitoring. No unified health dashboard. |
| **Cline** | Partial | Plan/Act approval pipeline provides implicit monitoring. Cline Teams adds analytics and traceability. |
| **Continue** | No | No agent health monitoring. CI check results only. |
| **Roo Code** | Partial | Mode state tracking. Permission-based approval serves as implicit health check. |
| **Codex CLI** | Partial | Thread status visible in Codex App. Worktree state observable. No programmatic health API. |
| **Agent SDK** | Yes | Full programmatic access to agent state, events, errors. Parent-child metadata for hierarchical monitoring. Build any monitoring you need. |

#### Can you manage agent lifecycle?

| Harness | Rating | Details |
|---|---|---|
| **Pi Agent** | Yes | Extensions control full lifecycle. Hot-reload with `/reload`. Start/stop via tmux. RPC protocol for external control. |
| **Claude Code** | Yes | Spawn/kill teammates. `shutdown_request` for graceful termination. Session resume. Tmux integration for crash recovery. |
| **OpenCode** | Partial | Session management. Sub-agent creation. No graceful shutdown protocol for sub-agents. |
| **Aider** | No | Single session lifecycle only. No agent management primitives. |
| **Goose** | Yes | `Agent::new()` creation, configurable turn limits and timeouts, session management. |
| **Cline** | Partial | Instance creation/destruction. Token budget per subagent. No graceful inter-agent lifecycle management. |
| **Continue** | No | Single agent lifecycle. No management primitives. |
| **Roo Code** | Partial | Mode switching. No independent agent lifecycle management. |
| **Codex CLI** | Yes | Thread creation/closure. Automatic agent lifecycle management. Worktree cleanup. |
| **Agent SDK** | Yes | Full lifecycle control -- spawn, configure, communicate, terminate. Session persistence. Programmatic everything. |

#### Can you route models per agent?

| Harness | Rating | Details |
|---|---|---|
| **Pi Agent** | Yes | Any provider/model configurable. Per-extension or per-invocation model selection. 15+ providers. |
| **Claude Code** | No | Claude models only. Can select between Opus/Sonnet/Haiku but locked to Anthropic. |
| **OpenCode** | Yes | Per-agent model assignment in config. 75+ models across all providers. |
| **Aider** | Yes | Architect + Editor dual-model pattern. Any LLM for any role. |
| **Goose** | Yes | Multi-model configuration. Different subagents can use different models. Any LLM with tool calling. |
| **Cline** | Yes | Model routing based on task complexity. Per-instance model configuration. |
| **Continue** | Yes | Per-feature model assignment (chat, edit, autocomplete, embeddings). Local + remote mix. |
| **Roo Code** | Yes | Per-mode model assignment (e.g., o3 for Architect, Sonnet 4 for Code). Persists across sessions. |
| **Codex CLI** | Partial | GPT-5.x models only. Can switch between Codex and Codex-Mini. Locked to OpenAI. |
| **Agent SDK** | Partial | Claude models only. Per-subagent model selection within Claude family. |

#### Can you customize the tool set per agent?

| Harness | Rating | Details |
|---|---|---|
| **Pi Agent** | Yes | Extensions register custom tools. Default: read, write, edit, bash. Add any tools programmatically. Per-extension tool scoping. |
| **Claude Code** | Yes | `allowedTools` array per subagent. Custom tools via MCP. ~18 built-in tools selectable per agent. |
| **OpenCode** | Yes | Per-agent tool restrictions in config. MCP server tools discoverable per agent. |
| **Aider** | No | Fixed tool set. No per-agent tool customization. |
| **Goose** | Yes | Extension-based tool discovery. Per-subagent tool restrictions configurable. |
| **Cline** | Yes | MCP tools addable. Per-subagent tool restrictions. Permission-based tool governance. |
| **Continue** | Partial | Tool/function calling configurable. No per-agent tool scoping. |
| **Roo Code** | Yes | Per-mode tool permissions (e.g., Architect = read-only, Code = all tools). Custom modes define tool scope. |
| **Codex CLI** | Yes | Skills + MCP tools configurable. Per-session tool availability. |
| **Agent SDK** | Yes | `allowedTools` per agent definition. MCP servers per agent. Most granular control available. |

### 3.2 Orchestration Scoring (1-5 scale, weighted)

| Capability (Weight) | Pi | CC | OC | Aider | Goose | Cline | Cont. | Roo | Codex | SDK |
|---|---|---|---|---|---|---|---|---|---|---|
| Programmatic Sub-Agents (x3) | 2 | 4 | 3 | 1 | 4 | 3 | 1 | 1 | 4 | 5 |
| Custom System Prompts (x2) | 5 | 5 | 5 | 3 | 5 | 4 | 4 | 5 | 4 | 5 |
| Agent Health Monitoring (x2) | 3 | 3 | 3 | 1 | 3 | 3 | 1 | 2 | 3 | 5 |
| Agent Lifecycle Mgmt (x3) | 4 | 4 | 3 | 1 | 4 | 3 | 1 | 2 | 4 | 5 |
| Model Routing Per Agent (x2) | 5 | 1 | 5 | 5 | 5 | 5 | 5 | 5 | 2 | 2 |
| Tool Set Per Agent (x2) | 5 | 5 | 5 | 1 | 5 | 4 | 2 | 5 | 4 | 5 |
| **Weighted Total (max 70)** | **49** | **49** | **52** | **26** | **57** | **46** | **28** | **38** | **49** | **63** |
| **Normalized (%)** | **70%** | **70%** | **74%** | **37%** | **81%** | **66%** | **40%** | **54%** | **70%** | **90%** |

---

## 4. Composite Rankings

### 4.1 Overall Ranking (General + Orchestration)

Combining general features (normalized to 100) and orchestration capability (normalized to 100), weighted 40/60 in favor of orchestration:

| Rank | Harness | General (40%) | Orchestration (60%) | Composite | Key Strength |
|---|---|---|---|---|---|
| 1 | **Claude Agent SDK** | 36.7 | 54.0 | **90.7** | Full programmatic control, purpose-built for orchestration |
| 2 | **Goose (Block)** | 34.7 | 48.9 | **83.6** | Best native sub-agents + MCP ecosystem + open license |
| 3 | **OpenCode** | 40.0 | 44.6 | **84.6** | Largest community + model-agnostic + growing orchestration |
| 4 | **Claude Code** | 34.0 | 42.0 | **76.0** | Most mature interactive multi-agent, Agent Teams |
| 5 | **Pi Agent** | 34.7 | 42.0 | **76.7** | Maximum extensibility, MIT license, build anything |
| 6 | **Codex CLI** | 34.7 | 42.0 | **76.7** | Best auto-orchestration, native worktrees |
| 7 | **Cline** | 34.7 | 39.4 | **74.1** | Largest VS Code base, enterprise governance |
| 8 | **Roo Code** | 30.0 | 32.6 | **62.6** | Best mode-based orchestration |
| 9 | **Continue** | 30.7 | 24.0 | **54.7** | Best CI/CD integration |
| 10 | **Aider** | 29.3 | 22.3 | **51.6** | Best git-native pair programming |

### 4.2 Rankings by Use Case

**If you need full programmatic orchestration (building your own multi-agent framework):**
1. Claude Agent SDK (90%)
2. Pi Agent (76%) -- because MIT + full extension API
3. Goose (83%) -- because Apache 2.0 + native sub-agents

**If you need model-agnostic orchestration:**
1. Goose (81%)
2. OpenCode (74%)
3. Pi Agent (70%)

**If you are committed to Claude and want the most power:**
1. Claude Agent SDK (90%)
2. Claude Code (70%)

**If you need the largest community and ecosystem:**
1. OpenCode (116K stars)
2. Codex CLI (63K stars)
3. Cline (58K stars)

**If license freedom is paramount:**
1. Pi Agent (MIT)
2. OpenCode (MIT)
3. Any Apache 2.0 (Aider, Goose, Cline, Continue, Roo Code, Codex CLI)

---

## 5. Critical Trade-Off Analysis

### 5.1 Vendor Lock-in vs. Capability

The three most orchestration-capable harnesses all have vendor constraints:

- **Claude Agent SDK** (score: 90%) -- locked to Anthropic/Claude models. If Anthropic changes pricing, deprecates models, or alters the SDK ToS, your orchestrator is at risk.
- **Claude Code** (score: 70%) -- same Anthropic lock-in, plus proprietary CLI that you cannot fork or modify.
- **Codex CLI** (score: 70%) -- locked to OpenAI/GPT models. Apache 2.0 licensed code, but useless without OpenAI API access.

The model-agnostic alternatives sacrifice some orchestration sophistication:

- **Goose** (81% orchestration) -- Apache 2.0, any LLM, native sub-agents. The best balance of power and freedom.
- **OpenCode** (74% orchestration) -- MIT, any model, but sub-agent depth limited to 1.
- **Pi Agent** (70% orchestration) -- MIT, any model, but you build the multi-agent layer yourself.

### 5.2 Build vs. Buy

| Approach | Harness | What You Get | What You Build |
|---|---|---|---|
| **Buy** | Claude Code + Agent Teams | Full orchestration out of the box | Nothing (but limited customization) |
| **Integrate** | Claude Agent SDK | Programmatic agent primitives | Orchestration logic, monitoring, UI |
| **Extend** | Goose or OpenCode | Agent framework + sub-agents + MCP | Custom orchestration patterns |
| **Build** | Pi Agent | Minimal agent core + extension API | Everything: sub-agents, routing, lifecycle |

### 5.3 The "Escape Hatch" Problem

A critical consideration: what happens when you need to switch models or providers?

- **Claude Agent SDK / Claude Code**: No escape. Rewrite required.
- **Codex CLI**: No escape from OpenAI. Rewrite required.
- **Pi Agent**: Clean escape. Swap provider config, keep all extensions.
- **OpenCode / Goose**: Clean escape. Config-level provider change.
- **Aider / Cline / Roo Code / Continue**: Clean escape but limited orchestration to preserve.

---

## 6. Recommendation

### For Building a Custom Multi-Agent Orchestrator

**Primary recommendation: Hybrid approach -- Claude Agent SDK for orchestration core, with Pi Agent architecture patterns for extensibility.**

Rationale:
- The Claude Agent SDK provides the most powerful programmatic orchestration primitives available today: typed subagent definitions, tool scoping, system prompt injection, lifecycle management, and native MCP.
- Pi Agent's extension architecture (lifecycle events, tool registration API, hot-reload, RPC protocol) represents the gold standard for *how* an extensible agent should be designed -- even if Pi itself lacks built-in multi-agent.
- Use the SDK for the engine, borrow Pi's patterns for the chassis.

**If vendor lock-in is unacceptable: Goose.**

Rationale:
- Goose scores 81% on orchestration with full model agnosticism.
- Apache 2.0 license with Linux Foundation governance.
- Native sub-agents with custom prompts, tool restrictions, and timeouts.
- MCP-first architecture means the extension ecosystem is interoperable.
- Block (Square/Cash App) provides enterprise-grade backing without Anthropic/OpenAI dependency.

**If you want maximum long-term control: Pi Agent.**

Rationale:
- MIT license means absolute freedom.
- The extension API is the most flexible of any harness reviewed.
- Mario Zechner's design philosophy (minimal core, maximum extensibility) aligns perfectly with orchestrator requirements.
- You build the multi-agent layer exactly how you want it.
- Trade-off: higher initial investment, but no ceiling on what you can build.

### What to Avoid for Orchestration

- **Aider**: Excellent pair programmer, wrong abstraction for orchestration. No sub-agents, no lifecycle management.
- **Continue**: IDE-first CI/CD tool. No orchestration primitives.
- **Roo Code**: Mode switching is not multi-agent orchestration. Single context window limits capability.

---

## 7. Future Outlook (March 2026)

Key trends that may shift this analysis:

1. **OpenCode's sub-agent depth limit** is under active development (issue #9280). If recursive sub-agents ship, OpenCode becomes a much stronger orchestration platform.
2. **Cline CLI 2.0** (Feb 2026) signals Cline's move toward terminal-first, API-driven workflows. Watch for programmatic orchestration APIs.
3. **Pi Agent** may add native sub-agent support via community packages. The extension ecosystem is growing.
4. **Codex CLI** opening to non-OpenAI models would dramatically change its positioning. Currently speculative.
5. **Claude Agent SDK** is maturing rapidly. The Python SDK (`claude-agent-sdk-python`) opened in late 2025, suggesting Anthropic sees this as a platform play.
6. **Goose** joining the Linux Foundation Agentic AI Foundation alongside MCP and AGENTS.md signals convergence toward open standards -- good for orchestrators building on Goose.

---

## Sources

- [Pi Agent (badlogic/pi-mono) - GitHub](https://github.com/badlogic/pi-mono)
- [Pi Agent Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [What I learned building a minimal coding agent - Mario Zechner](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Claude Code Overview](https://code.claude.com/docs/en/overview)
- [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Agent SDK Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Building agents with the Claude Agent SDK - Anthropic Engineering](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Claude Agent SDK: Subagents, Sessions and Why It's Worth It](https://www.ksred.com/the-claude-agent-sdk-what-it-is-and-why-its-worth-understanding/)
- [OpenCode - GitHub](https://github.com/anomalyco/opencode)
- [OpenCode Agents Documentation](https://opencode.ai/docs/agents/)
- [OpenCode vs Claude Code Comparison](https://www.morphllm.com/comparisons/opencode-vs-claude-code)
- [OpenCode: Open-source AI Coding Agent - InfoQ](https://www.infoq.com/news/2026/02/opencode-coding-agent/)
- [Aider - AI Pair Programming](https://aider.chat/)
- [Aider - GitHub](https://github.com/Aider-AI/aider)
- [Goose - GitHub](https://github.com/block/goose)
- [Goose Subagents Guide](https://block.github.io/goose/docs/guides/subagents/)
- [Block Introduces Goose](https://block.xyz/inside/block-open-source-introduces-codename-goose)
- [Linux Foundation Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [Cline - GitHub](https://github.com/cline/cline)
- [Cline Subagents](https://docs.cline.bot/features/subagents)
- [Cline CLI 2.0 - DevOps.com](https://devops.com/cline-cli-2-0-turns-your-terminal-into-an-ai-agent-control-plane/)
- [Continue - GitHub](https://github.com/continuedev/continue)
- [Continue Documentation](https://docs.continue.dev/)
- [Roo Code - GitHub](https://github.com/RooCodeInc/Roo-Code)
- [Roo Code Custom Modes](https://docs.roocode.com/features/custom-modes)
- [Multi Agent Workflow With Roo Code - Xebia](https://xebia.com/blog/multi-agent-workflow-with-roo-code/)
- [Codex CLI - GitHub](https://github.com/openai/codex)
- [Codex CLI Features](https://developers.openai.com/codex/cli/features/)
- [Codex Multi-agents](https://developers.openai.com/codex/multi-agent/)
- [Codex Agent Skills](https://developers.openai.com/codex/skills/)
- [Claude Code Pricing Guide](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)
- [Anthropic API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Goose AI Review 2026](https://aitoolanalysis.com/goose-ai-review/)
- [Roo Code vs Cline Comparison](https://www.qodo.ai/blog/roo-code-vs-cline/)
- [Claude Code 2.0 Agentic Features](https://claude5.ai/news/anthropic-claude-code-v2-agentic-features-launch)
- [Pi Mono Toolkit Review](https://www.decisioncrafters.com/pi-mono-the-revolutionary-ai-agent-toolkit-thats-transforming-development-with-2-9k-github-stars/)
