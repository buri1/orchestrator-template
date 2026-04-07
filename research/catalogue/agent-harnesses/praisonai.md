# PraisonAI

> **Production-ready Multi-AI Agents framework with self-reflection, designed to create AI Agents to automate and solve problems ranging from simple tasks to complex challenges.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/MervinPraison/PraisonAI](https://github.com/MervinPraison/PraisonAI) |
| GitHub Stars | 5,638 (as of 2026-03-08) |
| Publisher | Mervin Praison — solo developer (802 GitHub followers, 335 public repos) |
| License | MIT |
| Tech Stack | Python (primary), TypeScript/Node.js (secondary), Rust (experimental); LiteLLM for model routing; FastAPI for serving |
| Maturity | 🟢 Production (v4.5.28, 2,131 commits, rapid release cadence) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *From Airtable research list. Big star count but very much a "kitchen sink" framework — tries to be everything (CrewAI competitor, AutoGen competitor, chat UI, bot framework, code interpreter, image gen, video processing). The opposite of our "build only what you need" principle. Worth cataloguing for pattern reference but not adoption.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | LLM-heavy orchestration, Python-only core, no deterministic routing — violates Governing Principles #2, #3, #7 |
| **Novelty** | 3/10 | Covers ground already researched via CrewAI, AutoGen, OpenAI Agents SDK, LangGraph. State management pattern is known. |
| **Actionable** | 2/10 | Wrong stack (Python), wrong paradigm (LLM-decides-routing), nothing we can directly adopt |

---

## Overview

PraisonAI is a Python-first multi-agent framework that provides three primary abstractions: `Agent` (individual AI entity), `AgentTeam` (parallel coordination), and `AgentFlow` (sequential pipelines). It supports 100+ LLM models via LiteLLM and ships with 140+ built-in tools. The framework emphasizes low-code usage — agents can be defined via YAML config or minimal Python, and a CLI allows `praisonai "task description"` one-liner execution.

The architecture is comprehensive to a fault: it includes agent types for audio, video, images, OCR, embeddings, deep research, code execution, real-time streaming, and more. It supports MCP (Model Context Protocol), A2A (Agent-to-Agent Protocol), approval workflows, guardrails, checkpoints, session persistence, background jobs, and deployment as web APIs via `AgentOS`. The codebase spans 371 source files across 50+ submodules.

The framework positions itself on speed benchmarks — claiming 3.77μs agent instantiation time (1.39x faster than OpenAI Agents SDK). However, instantiation speed is irrelevant for our use case where agents run for minutes-to-hours. The real architectural question is orchestration quality, and here PraisonAI follows the LLM-decides-routing pattern that our Master Blueprint explicitly rejects.

---

## Technical Architecture

```
AgentOS (FastAPI web layer)
    │
    ├── AgentTeam (parallel coordination)
    │     ├── Agent 1 (LiteLLM → any model)
    │     ├── Agent 2
    │     └── Shared state dict + memory
    │
    ├── AgentFlow (sequential pipeline)
    │     ├── Step 1: Agent A → TaskOutput
    │     ├── Step 2: Agent B (receives A's output as context)
    │     └── Step 3: Agent C
    │
    └── Process Engine
          ├── sequential() — ordered execution
          ├── hierarchical() — manager delegates, creates subtasks
          └── workflow() — DAG with next_tasks routing
```

**Core Data Model:**
- `Agent`: ~50 constructor parameters covering identity, LLM config, tools, memory, planning, reflection, guardrails, autonomy, hooks, output, execution
- `Task`: id, name, description, agent, status (enum), result (TaskOutput), context (list), next_tasks (list)
- `TaskOutput`: raw (str), json_dict (dict), pydantic (model)
- `AgentTeam`: agents list, tasks list, process type, shared state dict, variables for template substitution

**State Management:**
- In-memory `_state` dictionary with get/set/update/clear/save/restore
- Session persistence via shared memory system
- Checkpoints module for workflow snapshots
- No external state store required (everything in-process)

**Key Integration Points:**
- LiteLLM for model abstraction (OpenAI, Anthropic, Google, Groq, Ollama)
- MCP client/server support
- A2A protocol support
- FastAPI for HTTP serving
- Bot integrations (Slack, Discord, Telegram, WhatsApp)

**Agent Hook System:**
- `HooksConfig` with `on_step`, `middleware` list
- `on_task_start` / `on_task_complete` callbacks at team level
- Per-task callbacks
- Approval backends (auto, HTTP, Slack, Discord, Telegram)
- `DoomLoopTracker` for stuck detection
- `FileSnapshot` for filesystem undo/redo

---

## Publisher Background

Mervin Praison is a solo developer with 802 GitHub followers and 335 public repos. He is the overwhelmingly dominant contributor (2,131 of ~2,873 commits). The second-largest "contributor" is github-actions[bot] (250 commits), followed by claude[bot] (216 commits) — indicating heavy use of automated PR review and CI bots. The project has no known funding, no corporate backing, and no visible team beyond Praison himself plus a few minor contributors.

Website: [mer.vin](https://mer.vin). No listed company affiliation. The project's breadth (371 source files, 50+ submodules, Python+TypeScript+Rust SDKs) for a solo developer suggests either exceptional productivity or significant LLM-assisted code generation — the claude[bot] contribution count supports the latter.

**Credibility assessment:** High individual output but sustainability risk. Solo maintainer with a massive surface area. 5.6K stars indicates real community interest, but the 774 forks vs. 64 open issues suggests more forking-to-study than active production usage.

---

## What's Valuable for Us

1. **DoomLoopTracker** (`agent/autonomy.py`): Detects when an agent is stuck in a loop. We have similar needs in our tmux-based agents. The implementation (configurable threshold + automatic intervention) is a pattern worth studying, though we'd implement it deterministically in our orchestrator layer, not inside the agent.

2. **Approval workflow architecture** (`approval/` module): Multiple backends (HTTP, Slack, Discord, Telegram) for human-in-the-loop approval. Our Master Blueprint requires human review as the binding constraint (Governing Principle #5). The backend abstraction pattern (registry + protocol) is clean.

3. **Checkpoint/snapshot system** (`checkpoints/`, `snapshot/`): Service-based checkpoint management for workflow state. Interesting reference for our state file persistence, though our JSON state files are simpler and sufficient.

4. **Variable substitution in task descriptions**: `{{variable_name}}` template syntax in YAML configs. Minor but useful pattern for parameterized agent instructions.

5. **Structured output enforcement**: `output_json` and `output_pydantic` parameters on tasks force agents to return structured data. We handle this via prompt engineering, but typed output contracts are worth considering for Phase 3+.

---

## What's NOT Relevant

1. **LLM-decides-routing paradigm**: The hierarchical process type lets a "manager" agent dynamically create subtasks and delegate to workers using LLM judgment. This directly violates Governing Principle #2 ("The orchestrator never guesses"). Our routing is deterministic lookup tables and state machines.

2. **Python-only core**: Our stack is Claude Code (TypeScript/Shell) + tmux + JSON state files. Adopting a Python framework would require a complete stack change and introduce a runtime dependency we don't need.

3. **Kitchen-sink feature scope**: 50+ submodules covering audio, video, OCR, embeddings, real-time, bots, LSP, sandbox, RAG, planning, etc. Violates Governing Principle #7 ("Build only what you have needed in the last 30 days"). This is the opposite of our thin-layer philosophy.

4. **In-process state management**: State lives in Python dicts in memory. Our architecture requires state in JSON files on disk for tmux session recovery and cross-process visibility. In-process state is fragile for long-running orchestration.

5. **Speed benchmarks**: The 3.77μs instantiation claim is irrelevant. Our agents run for minutes-to-hours. Instantiation overhead is noise.

6. **Self-reflection via LLM re-evaluation**: The reflection system uses additional LLM calls to evaluate and improve responses. This burns tokens without deterministic quality gates. Our quality pipeline is lint → SAST → tests → E2E → review — all deterministic.

---

## Future Use Cases

- **Phase 1-3 (Days 1-90):** No direct use. Wrong stack, wrong paradigm.
- **Phase 4 (Days 90+):** If we ever need to integrate with Python-based agent ecosystems (e.g., a client uses PraisonAI), the MCP and A2A protocol support means we could interoperate without adopting the framework itself. The A2A protocol support is the most forward-looking feature for federated agent systems.

---

## Key Takeaway

> **PraisonAI is the maximalist opposite of our minimalist architecture — a 371-file Python framework that does everything via LLM-driven orchestration, useful only as a negative example of what not to build and a minor reference for its DoomLoopTracker and approval workflow patterns.**
