# OSS Coding Agent & Harness Landscape

> **Comprehensive landscape of open-source coding agents, orchestration harnesses, and agentic development frameworks as of March 2026 -- covering architecture, multi-agent capabilities, extensibility, and suitability as orchestration substrates.**

| Field | Value |
|-------|-------|
| Category | 📊 Reference |
| Original Sources | `2026-03-05_airtable-agent-harnesses-frameworks.md`, `2026-03-05_airtable-misc-hidden-gems.md`, `2026-03-05_alternative-oss-harnesses-deep.md`, `2026-03-05_oss-coding-agents-landscape.md` |
| Research Phase | Phase 1 |
| Evidence Base | 40+ tools evaluated, 25 from Airtable collection, 7 deep-dive harness architectures, 15+ dashboard/ecosystem projects |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

The open-source coding agent landscape in early 2026 has bifurcated into two camps: **orchestration layers** (tools that coordinate multiple coding agents in parallel) and **agentic coding frameworks** (methodologies that structure how agents approach software development). The most consequential emerging pattern is **spec-driven development** -- the idea that agents need structured specifications before writing code, not just prompts.

For building a custom multi-agent orchestration harness, the deep architectural analysis reveals three tiers: **Codex CLI and Goose** have native multi-agent orchestration ready today; **Cline CLI 2.0** provides the best programmatic building block via gRPC API; and **Aider** remains the gold standard for single-agent terminal scriptability. The VS Code extension family (Cline/Roo Code/Kilo Code) has converged on a shared pattern of modes + subtask delegation. On the infrastructure side, **Trigger.dev** for durable execution, **Langfuse** for observability, and **Dify** for visual workflow building represent the highest-impact additions to any agent orchestration stack.

Key market gaps remain: no Linux/Pi-native orchestrator exists (Conductor and Commander are macOS-only), no truly engine-agnostic orchestrator combines spec-driven development with multi-agent execution, and the MCP token bloat problem is universal -- only Pi's `pi-mcp-adapter` proxy pattern (~200 tokens vs 10K+ per server) has solved it cleanly.

---

## Tier 1: Coding Agent Harnesses (Deep Architecture)

### Aider

**Language:** Python | **License:** Apache 2.0 | **Stars:** 30K+

The best single-agent terminal tool with exceptional scriptability. Key architectural features:
- **RepoMap**: Tree-sitter-based dependency graph with PageRank-like ranking, fitting the most contextually relevant symbols into a configurable token budget
- **Architect Mode**: Two-model pipeline separating reasoning (strong model) from editing (fast model) -- a micro-orchestration pattern that achieved state-of-the-art benchmark results
- **75+ model providers** via LiteLLM
- **Fully scriptable**: Python API (`Coder.create()`) and CLI `--message` batch mode

**Orchestration verdict:** Excellent as an agent runtime within an external orchestrator. Not an orchestrator itself. Easiest agent to wrap (used by ComposioHQ and Overstory as backend).

### Goose (Block/Square)

**Language:** Rust | **License:** Apache 2.0 | **Stars:** 27K+ | **Governance:** Linux Foundation Agentic AI Foundation

MCP-native architecture with the most flexible extension system (6 types: built-in Rust, stdio, SSE, InlinePython, WASM, frontend). Key innovations:
- **Goosetown** (Feb 2026): Native multi-agent orchestration. Orchestrator breaks tasks into phases, spawns parallel delegates via `summon` extension
- **Town Wall**: Append-only shared log for inter-agent communication
- **Beads**: Git-based local issue tracker for crash recovery -- delegates update issues, failed sessions are picked up by next agent
- **4 permission modes**: Autonomous, Manual Approval, Smart Approval, Chat Only
- **MCP Sampling**: Extensions can request LLM completions from Goose, turning tools into intelligent sub-agents

**Orchestration verdict:** Strongest competitor to Claude Code for orchestration. MCP-native + Goosetown + crash recovery make it a serious foundation. Main trade-off: no Anthropic model-specific optimizations.

### Cline CLI 2.0

**Language:** TypeScript | **License:** Apache 2.0 | **Installs:** 5M+ VS Code

Evolved from VS Code extension into three-surface platform: VS Code Extension, **Cline Core** (headless gRPC), and **CLI 2.0** (terminal). The gRPC architecture is the key differentiator:
- Presentation Layer connects as gRPC client to Cline Core; Core connects to Host Provider Layer
- Protocol Buffers definitions, compiled to TypeScript
- **Headless mode** (`-y`/`--yolo`) for CI/CD, JSON streaming for programmatic consumption
- **Parallel isolated instances** with own state, conversation, and model config
- **Fleet management** tools for many Clines
- **Pipe support** for Unix-tool composition

**Orchestration verdict:** Best programmatic building block for custom orchestrators. gRPC API is the architecturally cleanest interface in the ecosystem. You must build orchestration logic yourself.

### Codex CLI (OpenAI)

**Language:** Rust | **License:** Apache 2.0 | **Users:** 1M+ in first month

The most production-ready multi-agent coding system in OSS:
- **App Server Protocol**: Bidirectional JSON-RPC over stdio. Three primitives: Threads (durable sessions), Turns (unit of work), Items (atomic I/O). Powers CLI, VS Code, web, desktop, JetBrains, Xcode through single stable API
- **Native multi-agent**: Automatic spawning (Codex decides) or explicit (`/agent` command), parallel by default
- **Worktree isolation** built-in: each agent works in its own git worktree
- **Consolidated responses**: Waits for all sub-agents, returns merged result
- **Agents SDK integration** for deterministic workflows

**Orchestration verdict:** Most mature protocol and best agent isolation. Main concern: OpenAI model lock-in. Best foundation for teams committed to the OpenAI ecosystem.

### Roo Code

**Language:** TypeScript | **License:** Apache 2.0

Most orchestration-native VS Code extension:
- **Modes system**: Code, Architect, Debug, Ask, **Orchestrator** (with custom modes via slug/purpose/tool permissions/model config)
- **Boomerang Tasks**: Parent pauses, spawns subtask in specialized mode, results "boomerang" back. True hierarchical task delegation
- **Cloud agents** (2026): Coder agent for PRs, PR Reviewer for monitoring repos

**Orchestration verdict:** Most complete in-IDE orchestration. Lacks headless/CLI operation and external APIs, limiting use as substrate for custom systems.

### Continue

**Language:** TypeScript | **License:** Apache 2.0

Pivoted from IDE copilot to CI-enforceable AI checks:
- **Markdown-as-checks** in `.continue/checks/` -- source-controlled, reviewable, show as GitHub status checks
- Agent mode with MCP tool support
- CLI (`cn`) for headless CI/CD

**Orchestration verdict:** Not an orchestration platform. Specialized for CI-integrated AI checks. Useful as a leaf agent for review/validation phase.

### OpenCode (Anomaly/SST)

**Language:** Go | **License:** MIT | **Stars:** 100K+ | **Users:** 2.5M+ monthly

Dominant OSS Claude Code alternative with client/server architecture (HTTP+SSE):
- TUI is just one frontend; same server supports web, desktop, IDE clients
- SQLite persistence, LSP integration, 75+ model providers
- **TaskTool** for subagent spawning; agents defined as markdown files with YAML frontmatter
- Rich ecosystem: **oh-my-opencode** (25+ hooks, three-tier agent hierarchy, Sisyphus orchestrator), **OCX** (ShadCN-style package manager), **opencode-workspace** (curated multi-agent bundle)

**Orchestration verdict:** Massive community and battle-tested. No direct library embedding -- must communicate over HTTP. MCP token bloat unsolved at core level.

### Pi Agent (badlogic/pi-mono)

**Language:** TypeScript | **License:** MIT

Deliberately minimal harness (4 core tools: read, write, edit, bash) with 4 operating modes:
- **SDK mode**: `import { createAgentSession }` directly in TypeScript -- designed for embedding from day one
- **RPC mode**: stdin/stdout JSON protocol for non-Node integration
- **Extension system**: Tools, events, commands, shortcuts, providers, UI components via npm packages
- **Key extensions**: pi-subagents (role-based delegation with chains), pi-messenger (file-based inter-agent messaging, Crew feature for PRD-to-parallel-wave execution), pi-mcp-adapter (proxy pattern solving MCP token bloat)
- **oh-my-pi** (can1357): Hash-anchored edits (10x improvement on some models), LSP integration, subagents

**Orchestration verdict:** Strongest embedding target for custom multi-agent orchestration. SDK/RPC modes provide the most direct path. Smaller community than OpenCode.

---

## Tier 2: Agentic Development Frameworks

### BMAD Method

**Stars:** 38.9K | **License:** Open Source

Most mature scrum-simulation framework. Two-phase approach:
1. **Agentic Planning**: Analyst, PM, Architect agents create PRDs and architecture docs
2. **Context-Engineered Development**: Scrum Master transforms plans into hyper-detailed story files; dev agents execute

**Key pattern:** Story files as context containers -- embed everything the agent needs in the task file itself, not in system prompts.

### OpenSpec (Fission-AI)

**Stars:** 25K | **License:** Open Source

Spec-driven development with **change-as-folder** model: each feature gets its own folder with proposal, specs, design, tasks. Delta specs describe only what changes. 21+ AI tool support.

### CodeMachine-CLI

**Stars:** 2.3K

Orchestration layer for structured, long-running workflows:
- **Registry-based engine providers**: Supports Claude, Codex, Cursor, OpenCode as first-class engines
- Main Agent / Sub Agent / Module architecture
- JSON event streaming for observability
- Long-running workflow persistence

**Key pattern:** Engine-agnostic provider registry -- cleanest abstraction for swapping between CLIs.

### Agent Skills for Context Engineering (Muratcan Koylan)

**Stars:** 10K+

Context engineering skill library. Key patterns:
- **File-system-as-memory**: Just-in-time context loading without stuffing windows
- **Scratch pads**: Offload verbose tool output to files, keep only summaries in context
- **Dynamic skill loading**: Agents load relevant skills on demand

### spec-kit (GitHub Official)

**Status:** Experimental (v0.1.4)

GitHub's official spec-driven development toolkit. Specifications as **living, executable artifacts** that evolve with the project. Template packages for GitHub Copilot, Claude Code, Gemini CLI, Cursor, Windsurf.

---

## Tier 3: Infrastructure & Platforms

### Trigger.dev

**Stars:** 13K+ | **License:** Apache 2.0 | **Funding:** $16M Series A

Evolved from background jobs framework into TypeScript agent runtime:
- **Durable execution**: Long-running compute, agents run for hours without timeouts
- **MCP server**: Agents can orchestrate other agents through Trigger.dev
- **Queue fan-out**: Smart distribution to specialized AI models
- **Realtime API**: Stream LLM responses and task statuses to frontends

**Verdict:** Could serve as execution backend for productionized orchestrator. Bridges Temporal's robustness and Inngest's simplicity.

### Langfuse

**License:** Open Source | **Backed by:** Y Combinator (W23)

The most important observability tool for production agent systems:
- **Nested trace model**: Top-level trace = orchestrator run, child spans = agent tasks, generation spans = LLM calls
- **Multi-agent framework support**: Native integration with LangGraph, OpenAI Agents, CrewAI, n8n
- **OpenTelemetry native** (SDK v3): Flows into existing Grafana/Datadog infrastructure
- **Cost tracking**: Automatic per-provider token usage and cost
- **Evaluation framework**: LLM-as-judge, human annotations, custom scoring

**Verdict:** Non-negotiable for production multi-agent systems. First infrastructure addition to any orchestrator.

### Dify.ai

**License:** Open Source

Most complete open-source LLMOps platform:
- Visual workflow builder, RAG pipeline, agent framework, model management
- **Agent Node** with customizable strategies (ReAct, Function Calling)
- Model agnostic: GPT, Mistral, Llama, Claude, any OpenAI-compatible
- MCP protocol support

**Limitation:** Pipeline-oriented, not true autonomous multi-agent teams. Best used as node-level tool within a larger orchestrator.

### Conductor.build

**Funding:** $2.8M | **Growth:** 250% MoM

Mac app for orchestrating parallel Claude Code + Codex agents:
- **Git worktree isolation** per agent
- Visual diff review across parallel outputs
- Used by Linear, Vercel, Stripe, Ramp, Notion

**Verdict:** Validates the parallel-agent-in-worktrees pattern. macOS-only and closed-source -- the gap this creates is the opportunity for headless, server-native orchestrators.

### Other Notable Tools

| Tool | Key Insight |
|------|-------------|
| **Activepieces** | MIT-licensed automation layer; runs on Raspberry Pi via Docker Compose |
| **Flowise** | 43K stars, AgentFlow v3; acquired by Workday (Aug 2025) -- strategic risk |
| **Codebuff** | Beats Claude Code 61% vs 53% on 175+ tasks; specialized sub-agent teams via OpenRouter |
| **PraisonAI** | YAML-based workflow definition; orchestrator-workers as first-class pattern |
| **Kiro (AWS)** | EARS notation for requirements; Agent Client Protocol (ACP) for IDE-agent standardization |
| **Mission Control** | Open-source dashboard: 28 panels, WebSocket push, Kanban, token usage, agent-agnostic gateway |
| **Overstory** | Multi-agent orchestration with git worktrees + tmux, live dashboard |
| **oh-my-opencode** | Three-tier agent hierarchy (Sisyphus orchestrator), 25+ hooks, built-in MCPs |

---

## Pattern Convergence

Six patterns appear across multiple tools, indicating consensus:

| Pattern | Tools Using It | Significance |
|---------|---------------|--------------|
| Git worktree isolation | Conductor, Codex CLI, Verdent, Automaker, 1code, oh-my-pi | Standard for parallel agents on same repo |
| Spec-driven development | OpenSpec, spec-kit, Kiro, BMAD | Agents need structured specs, not just prompts |
| File-system-as-memory | Koylan Skills, BMAD, OpenSpec, pi-messenger | External memory + just-in-time loading beats context stuffing |
| Engine/model agnosticism | CodeMachine, Codebuff, PraisonAI, OpenCode, Pi | Table stakes -- decoupling agent behavior from model selection |
| MCP as lingua franca | Trigger.dev, Resend, Dify, Goose, Cline, Codex | Universal adapter between agents and tools |
| Protocol decoupling | Codex App Server, Cline Core gRPC, OpenCode HTTP/SSE | Separating agent logic from client surfaces enables orchestration |

---

## Orchestration Comparison Matrix

| Capability | Aider | Goose | Cline CLI 2.0 | Continue | Roo Code | Codex CLI | OpenCode | Pi Agent |
|---|---|---|---|---|---|---|---|---|
| **Build orchestrator on top?** | Yes (runtime) | Yes (native) | Yes (gRPC) | Limited | Partial (VS Code) | Yes (native) | Yes (HTTP) | Yes (SDK) |
| **Native multi-agent** | No | Goosetown | Parallel instances | No | Boomerang Tasks | Native spawning | TaskTool | Extensions |
| **Headless/CI mode** | Yes | Yes | Yes | Yes | No | Yes | Limited | Yes |
| **Agent isolation** | N/A | Fresh context | Isolated instances | N/A | Mode contexts | Git worktrees | Subagent contexts | Extension-based |
| **Crash recovery** | Git commits | Beads | None | None | None | Thread persistence | None | pi-rewind-hook |
| **Model agnostic** | Excellent (75+) | Good | Excellent | Good | Excellent | Limited (OpenAI) | Excellent (75+) | Good (15+) |
| **Programmatic API** | Python + CLI | CLI + MCP | gRPC + JSON stream | CLI | VS Code API | App Server JSON-RPC | HTTP/SSE | SDK + RPC |

---

## The Workday Consolidation Signal

Workday acquired **Flowise** (Aug 2025), **Pipedream** (Nov 2025), and **Sana** ($1.1B) to build an end-to-end AI agent platform. This validates enterprise demand for agent orchestration but creates strategic risk for independent projects dependent on these tools. Recommendation: prefer tools with strong community governance, permissive licensing, and no acquisition risk -- Trigger.dev (Apache 2.0), Dify (independent), Activepieces (MIT), Langfuse (open source).

---

## Market Gaps

1. **No Linux/Pi-native orchestrator**: Conductor and Commander are macOS-only. No headless, server-native orchestration layer exists.
2. **No truly engine-agnostic orchestrator**: CodeMachine comes closest. A harness treating Claude Code, Codex, Gemini CLI, and Pi as interchangeable engines -- with model-per-task routing -- would be unique.
3. **No spec + multi-agent combination**: BMAD does planning but not parallel orchestration. Conductor orchestrates but has no spec layer.
4. **MCP token bloat unsolved at platform level**: Only pi-mcp-adapter's proxy pattern solves it. Both OpenCode and Claude Code suffer from tool definitions consuming context.
5. **Dashboard orchestration immature**: Mission Control, Overstory, and similar projects show demand but none are production-ready.

---

## Actionable Insights

1. **For L-Thread Orchestrator architecture**: Combine git-lock synchronization (Claude Quickstart), registry-based engine providers (CodeMachine), story files as context containers (BMAD), file-system-as-memory + scratch pads (Koylan Skills), change-as-folder task management (OpenSpec), and git worktree isolation (Conductor pattern).

2. **For custom harness foundation**: Pi Agent's SDK/RPC mode provides the most direct path to programmatic orchestration. OpenCode's HTTP/SSE server is the battle-tested alternative. Goose is the best model-agnostic option. Codex CLI is the best if committed to OpenAI.

3. **For production infrastructure**: Add Langfuse (observability, non-negotiable), Trigger.dev (durable execution replacing tmux crash recovery), and Dify (visual agent flow prototyping).

4. **For MCP integration**: Adopt pi-mcp-adapter's proxy pattern regardless of platform -- one ~200-token proxy tool instead of 10K+ per MCP server.

5. **For crash recovery**: Only Goose (Beads) and Aider (git commits) have meaningful crash recovery among OSS agents. This is an underserved area with high production importance.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [OpenAI Codex](../agent-harnesses/openai-codex.md) | Detailed entry for Codex CLI harness |
| [OpenCode](../agent-harnesses/opencode.md) | Detailed entry for OpenCode harness |
| [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) | Primary harness; see claude-code-multiagent-architecture.md for internals |
| [DSPy](../agent-harnesses/dspy.md) | Declarative agent paradigm, complementary approach |
| [Pi Agent](../agent-harnesses/pi-agent.md) | Detailed entry for Pi Agent harness |
| [Harness Comparison Matrix](./harness-comparison-matrix.md) | Quantitative scoring of 10 harnesses across 20 dimensions |
| [Claude Code Multi-Agent Architecture](./claude-code-multiagent-architecture.md) | Claude Code's internal multi-agent system (Teams, hooks, SDK) |
| [Scaling Economics](./scaling-economics.md) | Cost curves and coordination overhead governing agent scaling |

---

*Consolidated from 4 research documents (Phase 1, 2026-03-05). Sources verified against GitHub repos, official docs, and community resources.*
