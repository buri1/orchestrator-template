# Agent-MCP

> **A framework for creating multi-agent systems that enables coordinated, efficient AI collaboration through the Model Context Protocol (MCP).**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [rinadelph/Agent-MCP](https://github.com/rinadelph/Agent-MCP) |
| GitHub Stars | 1,188 (as of 2026-03-08) |
| Publisher | rinadelph (solo developer) |
| License | Not specified (NOASSERTION) |
| Tech Stack | TypeScript/Node.js + Python dual implementation, MCP protocol, WebSocket, React dashboard, OpenAI API |
| Maturity | 🟡 Early (active community, 149 forks, Discord server, but solo maintainer and rough edges) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Agent-MCP tackles multi-agent coordination with shared context — our exact problem domain. The MCP-based approach and knowledge graph persistence are relevant patterns. But it's OpenAI-centric and the "Obsidian for agents" metaphor pushes toward complexity we avoid. |
| **Novelty** | 6/10 | The persistent knowledge graph ("memory bank") for cross-session agent context is a good implementation of shared memory. Real-time visualization dashboard showing agent collaboration topology is unique. MCP-as-coordination-protocol is a natural evolution. |
| **Actionable** | 4/10 | TypeScript implementation exists but it's OpenAI-first and dashboard-heavy. The MCP server pattern for exposing agent coordination tools is directly relevant to our MCP usage, but would need significant adaptation. |

---

## Overview

Agent-MCP positions itself as "Obsidian for AI agents" — a living knowledge graph where multiple AI agents collaborate through shared context, intelligent task management, and real-time visualization. The system is designed for developers building applications that benefit from multiple specialized agents working in parallel on different aspects of a project.

The core problem it solves: context windows overflow on large codebases, knowledge gets lost between sessions, single-threaded execution creates bottlenecks, and there's constant rework from lost context. Agent-MCP addresses this with parallel execution (multiple agents on different parts of the codebase), a persistent knowledge graph (searchable memory bank surviving across sessions), and intelligent task management (dependency tracking, conflict prevention).

The system runs as an MCP server, exposing its multi-agent capabilities to MCP-compatible clients like Claude Desktop, Cline, and other AI coding assistants. It has both a Python (recommended) and Node.js/TypeScript implementation. The React dashboard provides real-time visualization of agent networks, memory bank contents, and task management.

---

## Technical Architecture

### MCP Server Model

Agent-MCP functions as an MCP server exposing tools for agent coordination:

```json
{
  "tools": [
    {"name": "create_agent", "description": "Create a new specialized AI agent"},
    {"name": "assign_task", "description": "Assign a task to an agent"},
    {"name": "query_memory", "description": "Search the persistent knowledge graph"},
    {"name": "update_context", "description": "Write to shared memory bank"}
  ]
}
```

### Core Components

| Component | Function |
|-----------|----------|
| **MCP Server** | Central coordination hub. Exposes tools via Model Context Protocol. HTTP + WebSocket transport. |
| **Agent Fleet** | Pool of specialized agents with different roles (backend, frontend, testing, etc.) |
| **Memory Bank** | Persistent knowledge graph. Agents query and write context. Survives across sessions. |
| **Task Manager** | Tracks task assignments, dependencies, completion status. Prevents conflicts. |
| **Dashboard** | React app showing agent network topology, memory bank, task status in real-time. |

### Agent Network Visualization

The dashboard shows a graph where:
- Purple nodes = context entries in the knowledge graph
- Blue nodes = active agents
- Edges = active collaborations/context access patterns

### Setup Flow

```bash
# Python (recommended)
git clone https://github.com/rinadelph/Agent-MCP.git
cp .env.example .env  # Add OpenAI API key
uv venv && uv install
uv run -m agent_mcp.cli --port 8080 --project-dir /path/to/project

# Node.js/TypeScript (alternative)
cd agent-mcp-node
npm install
cp .env.example .env
npm run server

# Dashboard
cd agent_mcp/dashboard && npm install && npm run dev
```

### MCP Client Configuration

```json
{
  "mcpServers": {
    "agent-mcp": {
      "url": "http://localhost:8000/mcp",
      "transport": "http"
    }
  }
}
```

---

## Publisher Background

**rinadelph** is a solo developer who created Agent-MCP as an open-source project. The repository has gained significant traction (1,188 stars, 149 forks) and has an active Discord community. The project self-describes as aimed at "experienced AI developers who need sophisticated multi-agent orchestration" and warns newcomers to start with simpler tools. The solo maintainer model with high fork count suggests active community interest but potential sustainability risk. No corporate backing or funding information available. The project has a DeepWiki integration for documentation.

---

## What's Valuable for Us

### 1. MCP-as-Coordination-Protocol Pattern

Agent-MCP demonstrates using MCP not just for tool access (our current usage) but as the coordination protocol between agents. The idea of exposing `create_agent`, `assign_task`, and `query_memory` as MCP tools means any MCP-compatible client can participate in multi-agent coordination. This is worth studying for extending our orchestrator's MCP usage.

### 2. Persistent Knowledge Graph (Memory Bank)

The "memory bank" concept — a persistent, searchable context store that agents read from and write to — addresses our cross-session context loss problem. When we compact conversations or restart agents, context is lost. A persistent shared memory would preserve architectural decisions, known issues, and task history across agent lifetimes.

### 3. Task Dependency Tracking

Agent-MCP's task manager tracks dependencies between agent tasks and prevents conflicts. Our orchestrator currently tracks task status but not inter-task dependencies. As we scale to more parallel agents, dependency tracking becomes important.

### 4. Conflict Prevention Model

The system actively prevents agents from stepping on each other's work. Our tmux-based approach has no built-in conflict prevention — agents could theoretically edit the same files simultaneously. Agent-MCP's approach to this problem is worth studying.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **OpenAI-first** | Requires OpenAI API key. We're Claude-first. Would need significant rewiring. |
| **Dashboard-heavy** | The React dashboard is a major component but we're terminal-first. Web UIs add infrastructure and maintenance burden. |
| **"Obsidian for agents" complexity** | The knowledge graph visualization and network topology views are impressive demos but add complexity without clear production value for our use case. |
| **Solo maintainer risk** | 1,188 stars but one developer. No corporate backing. High bus factor risk for depending on this. |
| **Unclear licensing** | "NOASSERTION" on license means legal uncertainty for production use. |
| **Dual implementation split** | Python (recommended) + Node.js (alternative) suggests neither is fully mature. We'd want one solid TypeScript implementation. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None directly. But review how Agent-MCP exposes coordination as MCP tools — could inform extending our own orchestrator's tool surface.
- **Phase 2 (Days 4-60):** If implementing persistent agent memory, study Agent-MCP's memory bank schema and query patterns. Consider a minimal version (JSON file + grep) rather than adopting their full knowledge graph.
- **Phase 3 (Days 60-90):** If adding task dependency tracking to our orchestrator, reference Agent-MCP's dependency resolution logic. The conflict prevention model becomes important as we scale parallel agents.
- **Phase 4 (Days 90+):** If building a multi-project orchestrator where agents need shared context across projects, the persistent knowledge graph pattern becomes relevant. Evaluate Agent-MCP as a component or rebuild the pattern in our stack.

---

## Key Takeaway

> **Agent-MCP's best idea is using MCP itself as the agent coordination protocol (exposing create_agent/assign_task/query_memory as MCP tools) and its persistent memory bank for cross-session context — but the OpenAI dependency, unclear licensing, and solo maintainer make it a reference architecture rather than something to adopt directly.**
