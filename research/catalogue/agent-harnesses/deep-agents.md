# Deep Agents (LangChain)

> **The batteries-included agent harness built on LangChain and LangGraph — equipped with a planning tool, pluggable filesystem backend, sub-agents, skills, compaction, and HITL.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) |
| GitHub Stars | 10,040 (as of 2026-03-08) |
| Publisher | LangChain / Harrison Chase — bigtech-backed startup ($240M+ raised, Sequoia/Benchmark) |
| License | MIT |
| Tech Stack | Python (core SDK), TypeScript (CLI + UI), LangGraph, LangChain, LangSmith; sandbox integrations: Daytona, Modal, Runloop |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | The pluggable backend abstraction (real FS vs virtual FS vs database-backed FS) is the most architecturally interesting contribution — it directly addresses remote/sandboxed agent deployment, which maps to our Phase 3-4 roadmap. The middleware stack pattern validates our approach. However, Python-first + LangChain lock-in conflicts with our TypeScript-native, harness-over-framework principle. |
| **Novelty** | 6/10 | The virtual filesystem abstraction (StoreBackend, CompositeBackend) and the progressive skill disclosure pattern are genuinely new ideas we haven't seen elsewhere. The rest (planning via todos, sub-agents, compaction, HITL) mirrors Claude Code's architecture — which Harrison Chase explicitly acknowledged as the design inspiration. |
| **Actionable** | 5/10 | The backend protocol interface is a clean reference design for our Phase 3 sandbox abstraction layer. The skills system with SKILL.md + progressive disclosure validates our existing `.claude/commands/` approach. But adopting code directly is blocked by the Python/LangChain stack mismatch. |

---

## Overview

Deep Agents is LangChain's open-source agent harness — their answer to Claude Code, Cursor Agent, and the broader "general purpose agent" wave. Harrison Chase introduced it at his conference talk as one half of the "harness + tool runtime = general purpose agent" thesis (the other half being delegated authorization via Arcade.dev). It is explicitly modeled on Claude Code's architecture: planning via todo lists, filesystem tools, shell execution, sub-agent delegation, context compaction, and human-in-the-loop approval.

What distinguishes Deep Agents from Claude Code clones is the **pluggable backend abstraction**. The `BackendProtocol` interface defines a unified contract for all file operations (read, write, edit, ls, grep, glob) and shell execution. Three concrete implementations ship out of the box: `FilesystemBackend` (real local FS), `StoreBackend` (database-backed virtual FS using LangGraph's BaseStore), and `SandboxBackend` (remote containers via Daytona/Modal/Runloop). The `CompositeBackend` routes different path prefixes to different backends — e.g., `/memories` to a persistent store while `/workspace` hits the real filesystem. This enables the same agent code to run locally during development and remotely in production without changes.

The architecture is a middleware stack compiled into a LangGraph state machine (`CompiledStateGraph` with `recursion_limit=1000`). Seven middleware layers process every model call: TodoListMiddleware, MemoryMiddleware, SkillsMiddleware, FilesystemMiddleware, SubAgentMiddleware, SummarizationMiddleware, and HumanInTheLoopMiddleware. The project ships as a monorepo with four packages: the core SDK (`libs/deepagents`), a Textual-based CLI (`libs/cli`), an ACP server (`libs/acp`), and Harbor for hosted deployment (`libs/harbor`).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLI (Textual TUI)                 │
│  Sessions, MCP trust, model selector, approval UI   │
├─────────────────────────────────────────────────────┤
│              create_deep_agent()                     │
│                                                     │
│  Middleware Stack (processed per model call):        │
│  1. TodoListMiddleware        (planning)             │
│  2. MemoryMiddleware          (AGENTS.md injection)  │
│  3. SkillsMiddleware          (progressive disclosure)│
│  4. FilesystemMiddleware      (tool wiring)          │
│  5. SubAgentMiddleware        (isolated delegation)  │
│  6. SummarizationMiddleware   (context compaction)   │
│  7. HumanInTheLoopMiddleware  (approval gates)       │
│  8. AnthropicPromptCachingMiddleware                 │
│  9. PatchToolCallsMiddleware                         │
├─────────────────────────────────────────────────────┤
│              BackendProtocol Interface               │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │Filesystem│  Store   │ Sandbox  │Composite │      │
│  │ Backend  │ Backend  │ Backend  │ Backend  │      │
│  │(real FS) │(DB VFS)  │(Daytona/ │(path     │      │
│  │          │          │ Modal/   │ router)  │      │
│  │          │          │ Runloop) │          │      │
│  └──────────┴──────────┴──────────┴──────────┘      │
├─────────────────────────────────────────────────────┤
│              LangGraph CompiledStateGraph            │
│  (recursion_limit=1000, checkpointers, streaming)   │
└─────────────────────────────────────────────────────┘
```

**BackendProtocol** — the core abstraction:
- `read(file_path, offset, limit)` → line-numbered content with pagination
- `write(file_path, content)` → create-only (fails if exists)
- `edit(file_path, old_string, new_string, replace_all)` → exact string replacement
- `ls_info(path)` → directory listing with metadata (size, timestamps)
- `grep_raw(pattern, path, glob)` → ripgrep with Python regex fallback
- `glob_info(pattern, path)` → wildcard file search
- `execute(command, timeout)` → shell execution (SandboxBackendProtocol only)
- `upload_files(files)` / `download_files(paths)` → batch file transfer

**StoreBackend data model** — virtual filesystem in database:
- Namespace: hierarchical tuple (e.g., `("assistant_id", "filesystem")`) for multi-agent isolation
- Key: file path string
- Value: `{content: [lines], created_at: str, modified_at: str}`

**CompositeBackend routing** — path prefix dispatch:
- Routes sorted by length (longest-prefix match)
- Root-level operations aggregate across all backends
- Write/edit operations sync state changes back through the default backend

**Sub-agent isolation**: Parent state keys (`messages`, `todos`, `structured_response`, `skills_metadata`, `memory_contents`) are explicitly excluded from sub-agent state. Sub-agents receive only a `HumanMessage(content=description)` — complete context isolation.

**Compaction strategy**: Three trigger modes (token count, message count, fraction of context window). Pre-summarization optimization truncates large tool arguments at a lower threshold before full compaction fires. Previous summaries are filtered during chained compaction to prevent summary-of-summary accumulation.

**Skills system**: SKILL.md files with YAML frontmatter (name, description, license, allowed_tools). Progressive disclosure — agent sees metadata in system prompt but reads full instructions only when needed. Layered sources (base > user > project > team) with last-one-wins deduplication.

---

## Publisher Background

LangChain (Harrison Chase, CEO) is the most well-funded and widely adopted LLM application framework company. Raised $240M+ from Sequoia and Benchmark. LangChain the Python library has 100K+ GitHub stars. LangGraph (their stateful agent orchestration layer) has 10K+ stars. LangSmith is their commercial observability/evaluation platform. Deep Agents is their entry into the "coding agent harness" category — a strategic move to compete with Claude Code, Cursor, and others in the general-purpose agent market. Harrison Chase presented Deep Agents at the March 2026 conference alongside Arcade.dev's Sam Partee, framing it as the "harness" half of the "harness + tool runtime" thesis.

The company has a massive developer ecosystem, extensive documentation, and commercial support. The risk is **framework lock-in**: Deep Agents is deeply coupled to LangChain's abstractions (ChatModel, BaseStore, LangGraph state machines, LangSmith tracing). This is not a portable, minimalist harness — it's an opinionated framework play.

---

## What's Valuable for Us

1. **BackendProtocol interface** (`libs/deepagents/deepagents/backends/protocol.py`): The cleanest abstraction we've seen for decoupling agent file operations from the actual storage layer. When we need to run agents in remote sandboxes (Phase 3-4), this interface contract is the reference design. The key insight: make file operations a protocol, not an assumption about the local filesystem.

2. **CompositeBackend path-routing** (`libs/deepagents/deepagents/backends/composite.py`): Different storage strategies for different path prefixes. `/memories` → persistent database store, `/workspace` → ephemeral sandbox filesystem. This maps directly to our potential need for ephemeral working directories + persistent knowledge.

3. **StoreBackend virtual filesystem** (`libs/deepagents/deepagents/backends/store.py`): Proves that a database-backed virtual FS is viable for agent operations. The namespace-based multi-agent isolation (tuple keys like `("assistant_id", "filesystem")`) is a pattern we should study for federated agent isolation per business line (Master Blueprint Principle #6).

4. **SKILL.md progressive disclosure** (`libs/deepagents/deepagents/middleware/skills.py`): Agent sees skill names and descriptions in system prompt, but only reads full instructions when relevant. This is more token-efficient than our current approach of dumping all command content into context. Worth adopting for our `.claude/commands/` system.

5. **Three-mode compaction triggers** (`libs/deepagents/deepagents/middleware/summarization.py`): Token-based, message-based, and fraction-based triggers with pre-summarization argument truncation as a cheaper first pass. Our orchestrator-handoff.sh is cruder — this is a more sophisticated approach to context management.

6. **Sub-agent state isolation pattern** (`libs/deepagents/deepagents/middleware/subagents.py`): Explicit exclusion of parent state keys (`_EXCLUDED_STATE_KEYS`) ensures clean context separation. Validates Master Blueprint Principle #3 (context is zero-sum) with a concrete implementation.

---

## What's NOT Relevant

- **LangChain/LangGraph dependency**: Our architecture is deliberately framework-minimal. LangChain's abstraction layers add token overhead and coupling. Per Master Blueprint Principle #2 (deterministic orchestration), we route with lookup tables and state machines, not LLM-driven LangGraph graphs.

- **Python-first stack**: Our entire system is TypeScript/Node/Bun-native. Adopting Python would fragment our stack and complicate deployment. The patterns are transferable; the code is not.

- **Model-agnostic routing via LangChain ChatModel**: We use Claude Max with flat-rate economics (18-36x arbitrage). Model routing adds complexity without cost savings in our specific setup.

- **ACP server mode** (`libs/acp/`): Agent Communication Protocol server for multi-agent federation. We noted ACP was archived and merged into A2A (see our catalogue entry). This implementation may be on a dead-end standard.

- **Harbor hosted deployment** (`libs/harbor/`): Commercial deployment platform. We deploy locally with tmux + worktrees per the Master Blueprint's deterministic harness layer.

- **Textual TUI** (`libs/cli/`): Our orchestrator is headless by design. Interactive UIs violate our AUTO_MODE principle.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the SKILL.md progressive disclosure pattern and adapt for our `.claude/commands/` system. Low-effort, high-impact token savings.

- **Phase 3 (Days 60-90)**: When we formalize remote agent execution, the BackendProtocol interface is the reference design for our sandbox abstraction layer. The CompositeBackend routing pattern directly addresses the need for persistent state + ephemeral workspace.

- **Phase 3 (Days 60-90)**: The StoreBackend's namespace-based multi-agent isolation pattern maps to our federated business-line architecture. Each business line could get its own namespace tuple.

- **Phase 4 (Days 90+)**: If we ever need to support non-Claude agents (e.g., for cost optimization on low-value tasks), Deep Agents' model-agnostic design via LangChain ChatModel provides a reference for how to abstract the model layer.

---

## Key Takeaway

> **Deep Agents' pluggable BackendProtocol (real FS / virtual DB-backed FS / remote sandbox) is the most production-ready filesystem abstraction for agent harnesses — study it for Phase 3 sandbox design, but don't adopt the LangChain framework dependency.**
