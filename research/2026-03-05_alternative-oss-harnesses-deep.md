# Alternative OSS Coding Agent Harnesses: Deep Research

**Date:** 2026-03-05
**Focus:** Orchestration potential of each harness beyond Pi and OpenCode

---

## Executive Summary

The open-source coding agent landscape in early 2026 has matured dramatically. Beyond Pi (badlogic) and OpenCode (SST), at least seven serious contenders offer viable foundations for building orchestration layers. This document provides a deep architectural analysis of each, with a specific lens on their suitability as orchestration substrates -- that is, can you build a multi-agent orchestrator *on top of* each harness, and how?

The key finding: **Codex CLI, Cline CLI 2.0, Roo Code, and Goose** all now offer first-class multi-agent or orchestration primitives. **Aider** remains the best-in-class single-agent terminal tool with exceptional scriptability. **Continue** has pivoted toward CI-enforceable agent checks. The VS Code extension family (Cline/Roo/Kilo) has converged on a shared architectural pattern of modes + subtask delegation.

---

## 1. Aider

**Repository:** [github.com/Aider-AI/aider](https://github.com/Aider-AI/aider)
**Language:** Python
**License:** Apache 2.0
**Stars:** 30k+ (as of March 2026)

### Architecture

Aider is a Python-based CLI tool that treats Git as a first-class citizen. Every LLM-generated code change is automatically committed with a meaningful message. Its architecture consists of:

- **Coder abstraction** -- the core `Coder` class manages the conversation loop, file editing, and git integration. Different coder types handle different edit formats (whole file, diff, search/replace, unified diff).
- **InputOutput layer** -- handles terminal I/O, streaming, and can be replaced for programmatic use.
- **Model layer** -- abstraction over LiteLLM, supporting 75+ model providers.
- **RepoMap** -- the signature feature: a tree-sitter-based understanding of the entire repository.

### Architect Mode

Aider's Architect mode is a two-model pipeline that separates *reasoning* from *editing*:

1. The **Architect model** (typically a strong reasoning model like Claude Sonnet 4 or o3) analyzes the task and produces plain-text instructions describing how to solve the problem.
2. The **Editor model** (can be a cheaper, faster model) takes the Architect's instructions and produces specific file editing operations (search/replace blocks, diffs, etc.).

This separation produced state-of-the-art results on Aider's code editing benchmark. It is, in essence, a two-agent pipeline within a single session -- a micro-orchestration pattern.

### Repository Map (Tree-Sitter)

The repo map is Aider's most sophisticated subsystem:

- **Parsing:** Uses `tree-sitter` to extract symbol definitions (classes, functions, methods, type signatures) from every file in the repository.
- **Graph construction:** Builds a dependency graph where nodes are files and edges represent cross-file references.
- **Ranking:** Applies a PageRank-like algorithm to identify the most "important" symbols -- those most referenced by other parts of the codebase.
- **Budget optimization:** Fits the ranked symbols into a configurable token budget (`--map-tokens`, default 1024 tokens), ensuring the LLM always has the most contextually relevant codebase overview.

This means Aider can make coordinated multi-file edits with an understanding of how changes propagate through the dependency graph.

### Model Support

Aider supports virtually any LLM through LiteLLM: Claude (Sonnet 4, Opus 4), GPT-4o/GPT-5.x, Gemini 2.5 Pro, DeepSeek R1/V3, Ollama local models, and any OpenAI-compatible endpoint. The `--model` flag accepts any LiteLLM model string.

### Orchestration Potential

**Scriptability:** Aider exposes a Python API (unofficial but functional):
```python
from aider.coders import Coder
from aider.models import Model
from aider.io import InputOutput

model = Model("claude-sonnet-4-20250514")
coder = Coder.create(model=model, fnames=["src/app.py"])
coder.run("Add error handling to the main function")
```

The `--message` flag enables single-shot CLI invocations, and `--yes` auto-accepts all confirmations, making Aider fully scriptable in batch mode.

**Limitations for orchestration:**
- No built-in multi-agent support -- Aider is fundamentally a single-agent, single-session tool.
- No native task delegation or subtask system.
- The Python scripting API is unofficial and may break between versions.
- No gRPC/REST API for remote control.

**Verdict:** Aider is excellent as an *agent runtime* within an external orchestrator (like ComposioHQ's agent-orchestrator or Overstory, both of which support Aider as a backend). It is not itself an orchestrator. Its scriptability via Python and CLI makes it one of the easiest agents to wrap.

---

## 2. Goose (Block/Square)

**Repository:** [github.com/block/goose](https://github.com/block/goose)
**Language:** Rust
**License:** Apache 2.0
**Stars:** 27k+ (contributed to Linux Foundation's Agentic AI Foundation)

### Architecture

Goose is Block's (formerly Square) open-source agent, written in Rust. Its architecture is built entirely around MCP (Model Context Protocol):

- **Host layer:** Goose acts as an MCP host, managing multiple MCP clients.
- **Extension system:** Each extension runs as a separate MCP server, communicating via MCP primitives (tools, resources, prompts).
- **Agent loop:** Core reasoning loop with tool-calling, operating over the extension ecosystem.

### Extension Types

Goose supports six extension types, each with different integration characteristics:

1. **Built-in extensions** -- compiled into the Goose binary as Rust code, implementing `McpClientTrait` directly.
2. **Stdio extensions** -- external processes communicating via stdin/stdout using MCP protocol, with lifecycle managed by Goose.
3. **SSE extensions** -- connect to remote MCP servers over Server-Sent Events.
4. **InlinePython extensions** -- Python code executed dynamically via `uvx`, with dependencies and MCP implementation provided inline in configuration.
5. **WASM extensions** -- WebAssembly modules for sandboxed execution.
6. **Frontend extensions** -- tools implemented by the UI client (desktop app, web UI), where execution happens in the frontend.

This six-type extension model is the most flexible in the entire OSS agent ecosystem.

### Goosetown: Multi-Agent Orchestration

Goosetown is Goose's multi-agent orchestration layer, introduced in February 2026:

- **Orchestrator pattern:** When given a complex task, the main agent acts as an Orchestrator, breaking the job into phases (research, build, review) and spawning parallel delegates.
- **Town Wall:** An append-only shared log where every agent posts status and findings. This is the inter-agent communication channel.
- **Subagents:** Ephemeral agent instances triggered via the `summon` extension using `delegate()`. Each delegate runs in a fresh context, avoiding "context cliff" problems.
- **Skills:** Markdown files describing procedures ("how to deploy to production"). Delegates are pre-loaded with role-specific skills.
- **Beads:** A Git-based local issue tracker for crash recovery. The Orchestrator creates issues, delegates update them, and if a session fails, the next agent picks up the "bead."

### Permission Modes

- **Autonomous** -- modify files and use extensions without approval
- **Manual Approval** -- ask confirmation before each tool use
- **Smart Approval** -- risk-based approach
- **Chat Only** -- no file modifications or extension use

### Orchestration Potential

**Strengths:**
- Native multi-agent orchestration via Goosetown is production-ready.
- The MCP-native architecture means any MCP server becomes a tool for any agent.
- Crash recovery via Beads provides durability that most competitors lack.
- The extension system is the most composable in the ecosystem.
- MCP Sampling allows extensions to request LLM completions from Goose, turning simple tools into intelligent sub-agents.

**Limitations:**
- Goosetown is relatively new (February 2026) and the API surface may shift.
- The Town Wall (append-only log) is simpler than structured message-passing systems.
- Rust codebase makes it harder for most teams to contribute extensions (though InlinePython and WASM mitigate this).

**Verdict:** Goose is the strongest competitor to Claude Code for building orchestration systems. Its MCP-native architecture, Goosetown multi-agent layer, and crash-recovery primitives make it a serious foundation. The main trade-off vs. Claude Code is the lack of Anthropic's model-specific optimizations.

---

## 3. Cline

**Repository:** [github.com/cline/cline](https://github.com/cline/cline)
**Language:** TypeScript
**License:** Apache 2.0
**Installs:** 5M+ VS Code installs

### Architecture

Cline has evolved from a VS Code extension into a three-surface platform:

1. **Cline VS Code Extension** -- the original GUI agent in the VS Code sidebar.
2. **Cline Core** -- a headless Node.js process exposing a **gRPC API**, decoupled from any UI.
3. **Cline CLI 2.0** -- a terminal interface built on top of Cline Core.

The gRPC architecture is the key differentiator:

- **Presentation Layer** connects as a gRPC client to Cline Core, receiving state changes and LLM messages via subscription.
- **Cline Core** connects as a gRPC client to the **Host Provider Layer**, which integrates with the embedding environment (VS Code linter output, terminal, file system).
- All messages defined in Protocol Buffers, compiled to TypeScript via ts-proto.
- Multiple frontends can attach simultaneously, over the network, passing tasks around.

### Plan and Act Modes

Cline operates in dual modes:
- **Plan mode** -- the agent devises a step-by-step plan before execution.
- **Act mode** -- the agent executes steps, requesting explicit permission before each file change.

### CLI 2.0 Capabilities

Cline CLI 2.0 (released early 2026) transforms Cline into a proper orchestration platform:

- **Headless mode** (`-y` / `--yolo` / `--no-interactive`) -- fully autonomous operation, no user approval needed. Suitable for CI/CD, GitHub Actions, scheduled maintenance.
- **JSON streaming** (`--json`) -- structured output for programmatic consumption.
- **Parallel instances** -- each instance is fully isolated with its own state, conversation, and model configuration. Run one agent refactoring database layer while another updates API docs.
- **Fleet management** -- advanced tools for managing many Clines in parallel.
- **Pipe support** -- full stdin/stdout support; Cline as a Unix tool.

### Model Support

OpenRouter, Anthropic, OpenAI, Google Gemini, AWS Bedrock, Azure, GCP Vertex, Cerebras, Groq, and any OpenAI-compatible API, plus local models via LM Studio/Ollama.

### Orchestration Potential

**Strengths:**
- The gRPC API is the most architecturally clean programmatic interface in the ecosystem. You can build any orchestrator on top of Cline Core.
- Headless mode + JSON streaming makes Cline CLI 2.0 a first-class CI/CD agent.
- Parallel isolated instances provide the building blocks for multi-agent systems.
- Network-capable gRPC means distributed orchestration is possible.

**Limitations:**
- No built-in orchestrator role or task delegation system (unlike Roo Code's Orchestrator mode).
- The gRPC API is relatively new and documentation is still maturing.
- Multi-agent coordination logic must be built externally -- Cline provides the primitives but not the orchestration layer itself.

**Verdict:** Cline CLI 2.0 with its gRPC Core is the best *programmatic building block* for custom orchestrators. If you want to build your own orchestration layer (rather than use a pre-built one), Cline's architecture is the most flexible substrate.

---

## 4. Continue

**Repository:** [github.com/continuedev/continue](https://github.com/continuedev/continue)
**Language:** TypeScript
**License:** Apache 2.0
**Tagline:** "Source-controlled AI checks, enforceable in CI"

### Architecture

Continue has undergone a significant pivot. It started as an IDE copilot extension but has evolved into a platform with two distinct surfaces:

1. **IDE Extensions** (VS Code, JetBrains) -- agent mode with MCP tool support.
2. **Continue CLI (`cn`)** -- an open-source, modular coding agent for the command line, focused on CI/CD integration.

The defining architectural idea: **AI checks as source-controlled markdown files.**

- Each "check" is a markdown file in `.continue/checks/` that defines an AI-powered code review criterion.
- These checks show up as GitHub status checks -- green if code passes, red with a suggested fix.
- Checks are versioned alongside code, reviewable in PRs, and enforceable in CI pipelines.

### Agent Mode

Agent mode in the IDE extension equips the chat model with tools:
- Built-in tools from VS Code (workspace search, code changes, terminal commands, linting).
- MCP server tools (any MCP server can be added via config).
- System message tools -- a novel abstraction ensuring consistent tool functionality across all models, regardless of native capabilities.

Configuration lives in `config.yaml`, and MCP servers can be added using JSON config files compatible with Claude Desktop, Cursor, or Cline formats.

### CLI Architecture

Continue CLI provides:
- A battle-tested agent loop where you plug in model, rules, and tools.
- Tool permission system with `~/.continue/permissions.yaml`.
- MCP tool support identical to IDE extensions.
- Headless operation for CI/CD environments with API key authentication.

### Orchestration Potential

**Strengths:**
- The CI-enforceable checks paradigm is unique -- no other tool does this.
- The CLI's modular agent loop is clean and composable.
- MCP support means tool ecosystem compatibility.
- Source-controlled configuration (checks, rules) fits GitOps workflows.

**Limitations:**
- No multi-agent support whatsoever. Continue is fundamentally a single-agent system.
- No task delegation, no subtask system, no agent spawning.
- The focus is narrower than competitors: CI checks + IDE agent mode, not general orchestration.
- Less community momentum than Cline or Aider for orchestration use cases.

**Verdict:** Continue is not an orchestration platform. It is a specialized tool for CI-integrated AI checks and single-agent IDE assistance. Its value is in the "last mile" of a pipeline -- running AI-powered quality gates on PRs -- rather than as an orchestration substrate. However, it could serve as a *leaf agent* within a larger orchestration system, particularly for the review/validation phase.

---

## 5. Roo Code

**Repository:** [github.com/RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code)
**Language:** TypeScript
**License:** Apache 2.0
**Tagline:** "A whole dev team of AI agents in your code editor"

### Architecture

Roo Code is the most orchestration-native of the VS Code extensions. Its architecture centers on **Modes** and **Boomerang Tasks**:

#### Modes System

Roo Code ships with built-in specialist modes:
- **Code** -- implementation
- **Architect** -- planning and design
- **Debug** -- debugging and diagnostics
- **Ask** -- information retrieval
- **Orchestrator** -- workflow coordination (the key mode)

Custom modes can be defined with:
- **Slug** -- identifier (can override built-in modes)
- **Purpose** -- string describing ideal task types, used for automated mode selection
- **Tool permissions** -- scoped access to specific tools per mode
- **Model configuration** -- different API profiles per mode

Modes can be global (across all projects) or project-specific (defined in repo).

#### Boomerang Tasks (Subtask Orchestration)

The Orchestrator mode uses `new_task` tool to delegate subtasks:
- The parent task pauses when spawning a subtask.
- The subtask runs in a specialized mode (Code, Debug, Architect, etc.).
- Context is passed via the `message` parameter of `new_task`.
- The mode is specified via the `mode` parameter.
- Child tasks inherit the parent's API configuration profile.
- On completion, results "boomerang" back to the parent Orchestrator.

This is a true hierarchical task delegation system within a single tool.

#### Cloud Agents (2026)

Roo Code now offers cloud agents:
- **Coder agent** -- writes code, creates PRs, implements features end-to-end.
- **PR Reviewer agent** -- automatic code reviews, can monitor repositories.

### Orchestration Potential

**Strengths:**
- The most complete built-in orchestration system among VS Code extensions.
- Boomerang Tasks provide hierarchical task delegation with mode-appropriate tooling.
- Custom modes allow defining arbitrary specialist agents with scoped permissions.
- The Orchestrator mode is purpose-built for breaking down and coordinating complex tasks.
- Mode-aware tool permissions prevent agents from exceeding their role.

**Limitations:**
- Tightly coupled to VS Code -- no standalone CLI or headless mode (unlike Cline CLI 2.0).
- The Orchestrator is an LLM-driven coordinator, not a deterministic state machine. This means orchestration quality depends on model capability.
- No gRPC or REST API for external programmatic control.
- Boomerang Tasks are sequential (parent pauses), not truly parallel.
- Known issue ([#3400](https://github.com/RooCodeInc/Roo-Code/issues/3400)): Orchestrator mode sometimes doesn't know what other modes can do.

**Verdict:** Roo Code has the most mature *in-IDE* orchestration system. Its Modes + Boomerang Tasks pattern is the closest analog to a proper multi-agent team within a VS Code extension. However, the lack of headless/CLI operation and external APIs limits its use as an orchestration substrate for custom systems. It is best suited for interactive, IDE-centric multi-agent workflows.

---

## 6. Codex CLI (OpenAI)

**Repository:** [github.com/openai/codex](https://github.com/openai/codex)
**Language:** Rust
**License:** Apache 2.0
**Users:** 1M+ developers in first month

### Architecture

Codex CLI is OpenAI's entry, built in Rust with a sophisticated server architecture:

#### App Server Protocol

The Codex App Server is a bidirectional protocol that decouples agent logic from client surfaces:
- Powers CLI, VS Code extension, web app, macOS desktop app, JetBrains, and Xcode integrations through a **single stable API**.
- Communication uses **bidirectional JSON-RPC streamed as JSONL over stdio**.
- Three primitives: **Threads** (durable session containers), **Turns** (unit of agent work), **Items** (atomic I/O with lifecycle events).
- All source code is open-source in the Codex CLI repo, with schema generation for TypeScript and JSON Schema.

#### Multi-Agent System

Codex has native multi-agent capabilities:
- **Automatic spawning** -- Codex decides when to spawn sub-agents based on task complexity.
- **Explicit spawning** -- users can request agent creation via `/agent` command.
- **Parallel execution** -- multiple agents run in parallel by default (one core session per thread).
- **Worktree isolation** -- built-in git worktree support so agents work on isolated copies without conflicts.
- **Consolidated responses** -- Codex waits for all sub-agents, then returns a merged result.

#### Plugin System and MCP

- Plugin system loads skills, MCP entries, and app connectors from config or local marketplace.
- MCP support for third-party tools (browser, Figma, documentation).
- Agents SDK integration -- Codex can be orchestrated via OpenAI's Agents SDK, enabling deterministic workflows that scale from single agent to full delivery pipelines.

### Orchestration Potential

**Strengths:**
- The App Server protocol is the most mature agent-surface decoupling in the ecosystem.
- Native multi-agent with automatic or explicit spawning.
- Worktree isolation solves the parallel-agents-same-repo problem natively.
- Agents SDK integration provides a clean orchestration layer.
- Plugin marketplace adds extensibility.
- Rust implementation is fast and resource-efficient.

**Limitations:**
- Deeply tied to OpenAI models (GPT-5.x family). While technically model-agnostic through the protocol, the practical experience is optimized for OpenAI.
- The Agents SDK is OpenAI-specific infrastructure.
- Less community diversity than model-agnostic tools.
- The App Server protocol, while open-source, is complex -- higher barrier for custom integrations than Cline's gRPC.

**Verdict:** Codex CLI is the most production-ready multi-agent coding system in the OSS space. Its App Server protocol, native agent spawning, worktree isolation, and Agents SDK integration make it a complete orchestration platform. The main concern is OpenAI model lock-in. For teams committed to the OpenAI ecosystem, Codex CLI is arguably the best foundation for agent orchestration.

---

## 7. Others

### Kilo Code

**Repository:** [github.com/kilocode](https://github.com/nicepkg/kilo-code)
**Origin:** Fork of both Cline and Roo Code
**Funding:** $8M seed round, 1.5M+ users

Kilo Code merges features from Cline and Roo Code into a single extension:
- **Orchestrator mode** identical to Roo's Boomerang Tasks
- **Memory Bank** -- structured markdown files storing architectural decisions, project conventions, and codebase context, read on session start to reconstruct understanding
- **Multi-IDE support** -- VS Code and JetBrains
- **CLI mode** -- standalone terminal operation
- Zero markup pricing (you pay only LLM costs)

**Orchestration verdict:** Kilo inherits Roo's orchestration patterns and adds persistence via Memory Bank. The CLI mode partially addresses Roo's VS-Code-only limitation. Worth watching but still stabilizing its fork-of-forks identity.

### PearAI

**Website:** [trypear.ai](https://www.trypear.ai/)

PearAI is an open-source AI code editor with zero data retention. It integrates curated AI tools into an editor experience with a focus on privacy and self-hosting. Has a coding agent for features and bug fixes but **no multi-agent or orchestration capabilities**. Not suitable as an orchestration substrate.

### Void

**License:** Apache 2.0

Void is an open-source Cursor alternative focused on data privacy. It offers Agent Mode for complex tasks, test generation, and documentation. **No multi-agent support.** Architecturally simple -- suitable as a leaf agent but not an orchestration foundation.

### Melty

Melty is an open-source standalone editor with:
- **Composer** -- a session manager structuring multi-step tasks into named flows with conversational checkpoints, patch sets, and test plans.
- Local deployment with on-device execution for sensitive components and remote models for reasoning.

**Orchestration verdict:** Melty's Composer concept (named flows with checkpoints) has interesting orchestration primitives, but the project has limited community momentum compared to the leaders.

### Amp (Sourcegraph)

While not fully open-source, Amp deserves mention:
- Built for teams with no token constraints
- Composable tool system with sub-agents (Oracle, Librarian, Painter)
- Code review agent, image generation, walkthrough creation
- Up to 1M tokens of context

Amp's sub-agent architecture (Oracle for code analysis, Librarian for external libraries) demonstrates a specialized-agent-team pattern that is architecturally relevant for orchestrator design.

### RA.Aid

RA.Aid is an open-source assistant using LangGraph for agent-based task management:
- Research -> Planning -> Execution pipeline
- Compatible with Anthropic, OpenAI, OpenRouter, Gemini
- Uses LangGraph's graph-based orchestration

**Orchestration verdict:** RA.Aid is itself a simple orchestrator (three-phase pipeline). Interesting as a reference implementation but limited in multi-agent capabilities.

---

## 8. Orchestration Comparison Matrix

| Capability | Aider | Goose | Cline CLI 2.0 | Continue | Roo Code | Codex CLI | Kilo Code |
|---|---|---|---|---|---|---|---|
| **Can build orchestrator on top?** | Yes (as runtime) | Yes (native) | Yes (gRPC API) | Limited | Partial (VS Code) | Yes (native) | Partial |
| **Extension/plugin system** | None | 6 extension types + MCP | MCP tools | MCP + checks | Custom modes | Plugins + MCP | Custom modes + MCP |
| **Programmatic control** | Python API + CLI flags | CLI + config + MCP | gRPC API + JSON streaming | CLI + API key | VS Code extension API | App Server JSON-RPC | VS Code extension API |
| **Native multi-agent** | No | Yes (Goosetown) | Parallel instances | No | Boomerang Tasks | Yes (native spawning) | Boomerang Tasks |
| **Headless/CI mode** | Yes (`--message`) | Yes (autonomous mode) | Yes (`-y` flag) | Yes (CLI) | No | Yes | Partial (CLI) |
| **Agent isolation** | N/A | Fresh context per delegate | Isolated instances | N/A | Separate mode contexts | Git worktrees | Separate mode contexts |
| **Crash recovery** | Git commits | Beads (Git-based) | None built-in | None | None | Thread persistence | Memory Bank |
| **Inter-agent comms** | N/A | Town Wall (append-only) | External (no built-in) | N/A | Boomerang return | Consolidated responses | Boomerang return |
| **Model agnostic** | Excellent (75+) | Good (any LLM) | Excellent | Good | Excellent | Limited (OpenAI-centric) | Excellent |
| **Git-native** | Best-in-class | Good | Good | CI-focused | Basic | Worktree isolation | Basic |

---

## 9. Strategic Assessment for Orchestration

### Tier 1: Ready for Orchestration Today

**Codex CLI** and **Goose** are the only two tools with *native* multi-agent orchestration. Codex offers the more mature protocol (App Server) and better agent isolation (worktrees), while Goose offers superior model agnosticism and MCP-native extensibility. Choose Codex if you are in the OpenAI ecosystem; choose Goose if you need model flexibility.

**Cline CLI 2.0** provides the best *programmatic foundation* for building custom orchestration. Its gRPC API, JSON streaming, and parallel instances are clean building blocks, but you must build the orchestration logic yourself.

### Tier 2: Strong Single-Agent with Orchestration Wrappers

**Aider** is the gold standard for single-agent terminal work. Its Python scriptability and `--message` batch mode make it the easiest agent to wrap in an external orchestrator. Tools like ComposioHQ's agent-orchestrator and Overstory already use Aider as a backend runtime.

**Roo Code** has excellent in-IDE orchestration (Orchestrator mode + Boomerang Tasks) but lacks headless operation, limiting its use in custom systems.

### Tier 3: Specialized or Emerging

**Continue** excels at CI-integrated AI checks but is not an orchestration platform. Use it as a leaf agent for the review/validation phase.

**Kilo Code** inherits orchestration patterns from Roo and adds Memory Bank persistence, but is still stabilizing.

**PearAI, Void, Melty** are single-agent editors without orchestration primitives.

### Key Architectural Patterns Emerging

1. **Protocol decoupling** -- The winning pattern is separating agent logic from client surfaces (Codex App Server, Cline Core gRPC). This enables orchestration by making agents addressable services.

2. **MCP as the extension lingua franca** -- Every serious agent now supports MCP. This means an orchestrator can provision tools to any agent through a standard protocol.

3. **Git worktrees for isolation** -- Codex's approach of one worktree per agent is becoming the standard pattern for parallel agent work on the same repository.

4. **Crash recovery is rare but critical** -- Only Goose (Beads) and Aider (git commits) have meaningful crash recovery. This is an underserved area with high importance for production orchestration.

5. **LLM-driven vs. deterministic orchestration** -- Roo Code and Goosetown use LLM-driven orchestrators (the model decides what to delegate). Codex and Cline enable deterministic orchestration (your code decides). The L-Thread Orchestrator pattern aligns more with the deterministic approach, suggesting Codex CLI or Cline CLI 2.0 as the most architecturally compatible substrates.

---

## Sources

- [Aider Chat Modes](https://aider.chat/docs/usage/modes.html)
- [Aider Architect Mode](https://aider.chat/2024/09/26/architect.html)
- [Aider Repository Map](https://aider.chat/docs/repomap.html)
- [Aider Tree-Sitter Repo Map](https://aider.chat/2023/10/22/repomap.html)
- [Aider Scripting](https://aider.chat/docs/scripting.html)
- [Aider Connecting to LLMs](https://aider.chat/docs/llms.html)
- [Understanding AI Coding Agents Through Aider's Architecture](https://simranchawla.com/understanding-ai-coding-agents-through-aiders-architecture/)
- [Goose GitHub Repository](https://github.com/block/goose)
- [Block Introduces Goose](https://block.xyz/inside/block-open-source-introduces-codename-goose)
- [Goose AI Review 2026](https://aitoolanalysis.com/goose-ai-review/)
- [Goosetown Explained](https://block.github.io/goose/blog/2026/02/19/gastown-explained-goosetown/)
- [Goose Extension System Deep Dive](https://dev.to/lymah/deep-dive-into-gooses-extension-system-and-model-context-protocol-mcp-3ehl)
- [Goose Building Custom Extensions](https://block.github.io/goose/docs/tutorials/custom-extensions/)
- [Goose Subagents](https://block.github.io/goose/docs/guides/subagents/)
- [Cline GitHub Repository](https://github.com/cline/cline)
- [Cline Review 2026](https://vibecoding.app/blog/cline-review-2026)
- [Cline CLI 2.0 Announcement](https://cline.ghost.io/introducing-cline-cli-2-0/)
- [Cline Core gRPC Architecture](https://cline.ghost.io/cline-cli-my-undying-love-of-cline-core/)
- [Cline CLI 2.0 DevOps Review](https://devops.com/cline-cli-2-0-turns-your-terminal-into-an-ai-agent-control-plane/)
- [Cline gRPC Communication System (DeepWiki)](https://deepwiki.com/cline/cline/6.1-grpc-communication-system)
- [Continue GitHub Repository](https://github.com/continuedev/continue)
- [Continue Documentation](https://docs.continue.dev/)
- [Continue Agent Mode](https://docs.continue.dev/ide-extensions/agent/how-it-works)
- [Continue CLI Guide](https://docs.continue.dev/guides/cli)
- [Continue Building Cloud Agents with CLI](https://blog.continue.dev/building-async-agents-with-continue-cli)
- [Continue MCP Setup](https://docs.continue.dev/customize/deep-dives/mcp)
- [Roo Code GitHub Repository](https://github.com/RooCodeInc/Roo-Code)
- [Roo Code Review 2026](https://vibecoding.app/blog/roo-code-review)
- [Roo Code Boomerang Tasks](https://docs.roocode.com/features/boomerang-tasks)
- [Roo Code Custom Modes](https://docs.roocode.com/features/custom-modes)
- [Multi Agent Workflow With Roo Code (Xebia)](https://xebia.com/blog/multi-agent-workflow-with-roo-code/)
- [Roo Code vs Cline 2026 (Qodo)](https://www.qodo.ai/blog/roo-code-vs-cline/)
- [Codex CLI GitHub Repository](https://github.com/openai/codex)
- [Codex CLI Documentation](https://developers.openai.com/codex/cli/)
- [Codex Multi-Agents](https://developers.openai.com/codex/multi-agent/)
- [Codex App Server Architecture (InfoQ)](https://www.infoq.com/news/2026/02/opanai-codex-app-server/)
- [Codex MCP Integration](https://developers.openai.com/codex/mcp/)
- [Codex Agents SDK Guide](https://developers.openai.com/codex/guides/agents-sdk/)
- [Kilo Code Review 2026](https://vibecoding.app/blog/kilo-code-review)
- [Linux Foundation Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [VS Code Multi-Agent Development](https://code.visualstudio.com/blogs/2026/02/05/multi-agent-development)
- [15 AI Coding Agents Compared (Tembo)](https://www.tembo.io/blog/coding-cli-tools-comparison)
- [Top 8 Open Source AI Coding Agents (AIMultiple)](https://research.aimultiple.com/open-source-ai-coding/)
- [ComposioHQ Agent Orchestrator](https://github.com/ComposioHQ/agent-orchestrator)
- [Overstory Multi-Agent Orchestration](https://github.com/jayminwest/overstory)
