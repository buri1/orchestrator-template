# AgentK

> **An autoagentic AGI that is self-evolving and modular.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [mikekelly/AgentK](https://github.com/mikekelly/AgentK) |
| GitHub Stars | 959 (as of 2026-03-09) |
| Publisher | Mike Kelly (@NicerInPerson / @realmikekelly) — solo, serial builder |
| License | MIT |
| Tech Stack | Python (98.3%), LangGraph 0.2, LangChain, SQLite (checkpoints), Docker |
| Maturity | 🟡 Early (37 commits, 145 forks, 13 open issues, no releases) |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *Same author as claude-sneakpeek (9/10 in our catalogue). AgentK is his earlier project — a LangGraph-based self-evolving agent system where a kernel of 4 agents (Hermes orchestrator, AgentSmith agent-builder, ToolMaker tool-builder, WebResearcher) can create new agents and tools at runtime by writing Python files to disk. Conceptually interesting as a "self-bootstrapping AGI" experiment, but architecturally the opposite of what we need: it's 100% LLM-driven routing (Hermes decides everything via tool calls), uses LangGraph/LangChain (Python lock-in we avoid), and the self-evolution means agents writing agent code — a recursive trust problem our Blueprint explicitly warns against. The 959 stars reflect the "self-evolving AGI" marketing more than production utility. Mike Kelly's real contribution to our stack is claude-sneakpeek, not this.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | LLM-driven routing contradicts Principle 2 (deterministic orchestration); Python/LangChain contradicts our stack; no worktree isolation, no git integration, no quality gates |
| **Novelty** | 5/10 | Self-evolving agent creation (agents that write new agents) is conceptually novel but well-explored in academic literature; the kernel-bootstrapping metaphor is a clean framing we haven't seen elsewhere in OSS |
| **Actionable** | 3/10 | Wrong stack (Python/LangGraph vs our TypeScript/Claude Code), wrong routing model (LLM vs deterministic), wrong trust model (agents create agents unsupervised); pattern study only |

---

## Overview

AgentK is a self-evolving multi-agent system built on LangGraph. The name represents "kernel" — a minimal core of four agents designed to bootstrap itself by creating new specialized agents and tools at runtime. The architecture is simple: Hermes acts as the user-facing orchestrator, decomposing goals into tasks and dispatching them to other kernel agents or to dynamically-created custom agents via a `assign_agent_to_task` tool call. AgentSmith handles agent creation (writing Python files to `agents/`), ToolMaker handles tool creation (writing to `tools/`), and WebResearcher provides internet access.

The core design decision is radical self-modification: when the system encounters a task it cannot handle with existing agents, AgentSmith designs, implements, and tests a new agent — writing the code to disk, running smoke tests, and registering it for future use. The same applies to tools via ToolMaker. This creates a system that theoretically grows its own capabilities over time.

The routing model is entirely LLM-driven. Hermes (the orchestrator) uses GPT-4o/Claude/Ollama to reason about which agent to assign tasks to. There are no deterministic routing rules, no state machines beyond LangGraph's basic `MessagesState`, and no governance over what agents can create. This is architecturally the opposite of our Master Blueprint's Principle 2 (deterministic orchestration, LLM execution).

---

## Technical Architecture

### Core Graph (Hermes Orchestrator)

```
┌──────────────────────────────────────────────────────────┐
│                    Hermes (Orchestrator)                   │
│                                                           │
│  StateGraph(MessagesState)                                │
│  ┌────────────────┐   ┌────────────┐   ┌──────────────┐  │
│  │ feedback_and_  │──▶│  reasoning │──▶│    tools      │  │
│  │ wait_on_human  │   │  (LLM call)│   │  (ToolNode)   │  │
│  │ _input         │   │            │◀──│              │  │
│  │                │◀──│            │   └──────────────┘  │
│  └────────────────┘   └────────────┘                     │
│                                                           │
│  Bound tools: list_available_agents, assign_agent_to_task │
│  Checkpointer: SqliteSaver("checkpoints.sqlite")         │
└──────────────────────────────────────────────────────────┘
```

### Agent Dispatch Mechanism

```python
# tools/assign_agent_to_task.py (simplified)
def assign_agent_to_task(agent_name: str, task: str):
    module = utils.load_module(f"agents/{agent_name}.py")
    agent_fn = getattr(module, agent_name)
    result = agent_fn(task)
    return result["messages"][-1].content
```

Agents are dynamically loaded via `importlib.util`, executed as LangGraph subgraphs, and their last message is returned as the result. Modules are cleaned from `sys.modules` after execution.

### Dynamic Loading (utils.py)

- `all_agents()` — scans `agents/` directory, loads modules, extracts docstrings
- `all_tool_functions()` — scans `tools/` directory, imports `@tool`-decorated functions
- `load_module()` — `importlib.util` loader with `gensym()` namespace isolation
- `list_broken_tools()` / `list_broken_agents()` — diagnostic functions for import failures
- State persistence via `SqliteSaver` from `langgraph-checkpoint-sqlite`

### Kernel Agents

| Agent | Role | Tools |
|-------|------|-------|
| **Hermes** | User-facing orchestrator; task decomposition and delegation | `list_available_agents`, `assign_agent_to_task` |
| **AgentSmith** | Creates/modifies agents by writing Python to `agents/` | `write_to_file`, `read_file`, `run_shell_command`, `assign_agent_to_task` |
| **ToolMaker** | Creates/modifies tools by writing Python to `tools/` | `write_to_file`, `read_file`, `run_shell_command` |
| **WebResearcher** | DuckDuckGo search + web scraping | `duck_duck_go_web_search`, `duck_duck_go_news_search`, `fetch_web_page_content` |
| **SoftwareEngineer** | Code implementation agent | `write_to_file`, `read_file`, `run_shell_command`, `overwrite_file`, `delete_file` |

### Built-in Tools (12)

`assign_agent_to_task`, `delete_file`, `duck_duck_go_news_search`, `duck_duck_go_web_search`, `fetch_web_page_content`, `fetch_web_page_raw_html`, `list_available_agents`, `overwrite_file`, `read_file`, `request_human_input`, `run_shell_command`, `write_to_file`

### Dependencies

LangGraph 0.2, LangChain Community 0.2.11, LangChain OpenAI, LangChain Anthropic, langgraph-checkpoint-sqlite, Selenium, Unstructured, DuckDuckGo-search, python-dotenv

### Infrastructure

Docker-based deployment via `docker-compose.yml`. Environment variables configure model provider (`OPENAI`/`ANTHROPIC`/`OLLAMA`), model name, and temperature.

---

## Publisher Background

**Mike Kelly** (@NicerInPerson on Twitter/X, mikekelly on GitHub) is a Dubai-based serial builder with deep API design credentials. His most notable projects:

- **claude-sneakpeek** (1,063 stars) — Binary-patches Claude Code to unlock native swarm mode; catalogued at 9/10 relevance in our catalogue
- **AgentK** (959 stars) — This project; self-evolving agent system
- **hal-browser** (849 stars) — API browser for HAL+JSON hypermedia
- **hal_specification** (626 stars) — The HAL specification itself (he authored it)
- **btc-endgame** (214 stars) — Bitcoin analysis

308 GitHub followers, 147 public repos. His background spans API standards (HAL), crypto analysis, and AI agents. The HAL specification authorship is significant — it demonstrates ability to design protocol-level abstractions, not just applications. AgentK (created Aug 2024) predates claude-sneakpeek and shows his progression from LangChain-based multi-agent systems to Claude Code binary hacking. The low commit count (37) suggests this is more of a concept demonstration than an actively maintained production tool.

---

## What's Valuable for Us

### 1. Kernel Bootstrap Metaphor (Pattern Study)

The "K = kernel" concept — a minimal viable agent set that can expand itself — is a clean mental model. Our Master Blueprint already has the thin meta-layer concept, but AgentK's framing of identifying the smallest possible kernel (orchestrator + builder + toolmaker + researcher) and making everything else emergent is worth noting. We use a similar decomposition: orchestrator + coding agents + E2E testing agent.

### 2. Dynamic Agent/Tool Registration Pattern

The `utils.py` pattern of scanning directories, dynamically importing modules, and making them available via tool calls is simple and elegant. While we don't use Python/LangGraph, the principle of "drop a file in a directory and it becomes an agent" maps to how our `.claude/agents/` and `.claude/commands/` directories work. The `list_broken_agents()` diagnostic function is a useful concept for our health monitoring.

### 3. Agent-as-Tool Dispatch

The `assign_agent_to_task` tool wraps agent invocation as a standard tool call, making inter-agent communication uniform. This validates the pattern we see in Claude Code's native `Task` tool — agents are dispatched via tool calls, not custom protocols. The module cleanup (`sys.modules` removal after execution) is a good practice for context isolation.

### 4. Self-Testing Requirement

AgentSmith and ToolMaker both require smoke tests before considering an agent/tool complete. This aligns with our E2E testing gate (Rule 2: "NIEMALS Issues als Done markieren OHNE E2E Test"). However, their tests are LLM-generated and LLM-validated — a recursive trust problem we explicitly avoid.

---

## What's NOT Relevant

### 1. LLM-Driven Routing (Fundamental Conflict)

Hermes uses the LLM to decide which agent handles which task. This directly violates Master Blueprint Principle 2: "The orchestrator never guesses. Routing, state transitions, health checks — all deterministic code or lookup tables." AgentK's entire routing model is one big LLM guess. In production, this creates unpredictable behavior, non-reproducible task assignments, and no audit trail for why Agent X was chosen over Agent Y.

### 2. Self-Evolving Agent Creation (Trust Problem)

Agents creating other agents without human review violates Principle 5 (human review is the binding constraint). When AgentSmith writes a new agent, who validates the code? The LLM runs the tests — but the LLM also wrote the tests. This is a circular validation problem. Our architecture explicitly requires human review gates and deterministic quality pipelines.

### 3. Python/LangGraph Stack

Our stack is TypeScript/Claude Code/tmux/shell. LangGraph's Python state machines, LangChain's abstraction layers, and the Docker deployment model are all wrong-stack for us. The 2024-era LangGraph 0.2 pinning also suggests this codebase hasn't tracked LangGraph's evolution.

### 4. No Git Integration

No worktree isolation, no PR pipeline, no branch management, no merge queue. Agents write directly to the filesystem with `write_to_file`. This is fine for a demo but incompatible with our git-centric workflow where every agent operates in its own worktree and produces reviewable PRs.

### 5. No Context Separation

All agents share the same filesystem and can read/write any file. There's no enforcement of Principle 3 (context is zero-sum) — business context could leak into coding agents and vice versa. The `MessagesState` accumulates everything in a single message chain.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: None. Wrong stack, wrong architecture.

- **Phase 2 (Days 4-60)**: None directly. The kernel-bootstrap concept could inform how we think about minimum viable agent sets when spinning up new business lines. If a new client project needs agents, what's the smallest kernel? (Answer for us: orchestrator + 2 coding agents + E2E agent.)

- **Phase 3 (Days 60-90)**: The dynamic agent/tool registration pattern could inform our harness design if we build a deterministic agent registry. The `list_broken_agents()` health-check pattern is adoptable.

- **Phase 4 (Days 90+)**: If we ever build a meta-agent that creates agent definitions (not code — definitions/configs), the kernel-bootstrap metaphor from AgentK provides a reference point. But our version would use deterministic templates, not LLM-generated code.

---

## Key Takeaway

> **AgentK demonstrates the "self-evolving kernel" concept where 4 core agents bootstrap an expandable system by writing new agents/tools to disk, but its 100% LLM-driven routing and unsupervised agent creation are architecturally opposite to our deterministic orchestration principles — study the kernel metaphor, ignore the implementation.**
