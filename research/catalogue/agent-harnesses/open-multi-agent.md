# Open Multi-Agent

> **JackChen-me — GitHub, 2026-04-01**

| Field | Value |
|-------|-------|
| Source | https://github.com/JackChen-me/open-multi-agent |
| Author | JackChen-me |
| Publication | GitHub |
| Date | 2026-04-01 |
| Topics | multi-agent orchestration, TypeScript, task DAG, LLM adapters, MCP, tool registry, CLI |
| Stars | 5,500+ |
| License | MIT |

---

## Burak's Notes

> *This is the TypeScript answer to CrewAI and LangGraph — three runtime deps, zero config, goal-to-result in one `runTeam()` call. The auto-decomposition into task DAGs at runtime is the key differentiator: you give it a goal string and it plans the graph itself. The built-in tool set (bash, file_read, file_write, file_edit, grep) mirrors Claude Code's own primitives, which means agent workers get the same capabilities we give our tmux workers. MCP support (stdio transport) means it can plug into the same tool ecosystem. Worth watching as a potential replacement for hand-rolled orchestration if we ever move off raw Claude CLI.*

---

## Key Takeaways

1. **Goal-to-DAG Auto-Decomposition** — Unlike LangGraph (where you draw the graph) or CrewAI (where you define crew roles), Open Multi-Agent takes a plain-text goal and autonomously decomposes it into a task DAG with dependency resolution, parallel execution via semaphores, and failure cascading. No manual graph definition required.

2. **Three Runtime Dependencies** — The entire framework ships with only `@anthropic-ai/sdk`, `openai`, and `zod` as production dependencies. Optional peer dep for Gemini. This extreme minimalism contrasts with the dependency-heavy Python agent ecosystem and makes it viable for constrained environments.

3. **Multi-Provider Agent Teams** — Each agent in a team can use a different LLM provider (Anthropic, OpenAI, Gemini, Grok, GitHub Copilot, or local models via Ollama/vLLM/LM Studio). Verified local model support includes Gemma 4, Llama 3.1, Qwen 3, Mistral, and Phi-4 with tool-calling.

4. **Three Execution Modes** — `runAgent()` for single-agent tasks, `runTeam()` for auto-orchestrated multi-agent teams, and `runTasks()` for explicit pipeline definition with manual task graphs. Progressive complexity — start simple, scale up.

5. **Built-in Tool Set Mirrors Claude Code** — The five built-in tools (bash, file_read, file_write, file_edit, grep) with tool presets (readonly, readwrite, full) and fine-grained allowlists/denylists provide the same primitives as Claude Code's native tool set. MCP server integration via stdio transport extends this further.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | TypeScript multi-agent orchestrator with auto task DAG decomposition, MCP support, and Claude-native tool primitives — directly comparable to our tmux orchestrator approach but as a library |
| **Actionable** | 6/10 | Could serve as the runtime engine if we move from raw Claude CLI to a programmatic orchestration layer; the tool preset system and progress/trace observability are adoptable patterns |

---

## Summary

Open Multi-Agent is a TypeScript-native multi-agent orchestration framework positioned as the lightweight alternative to Python-heavy systems like CrewAI and graph-drawing approaches like LangGraph. Its core innovation is runtime goal decomposition: users provide a natural language goal, and the coordinator agent autonomously breaks it into a task DAG with dependency resolution and parallel execution.

The architecture comprises a coordinator agent that plans tasks, an agent pool with semaphore-controlled parallelism, a task queue with auto-unblocking and failure cascading, and a shared memory / message bus for inter-agent visibility. The framework supports five LLM providers (Anthropic, OpenAI, Gemini, Grok, GitHub Copilot) plus local models via OpenAI-compatible endpoints.

The built-in tool set (bash, file_read, file_write, file_edit, grep) mirrors Claude Code's own primitives, and tool access is controlled via presets (readonly, readwrite, full) with fine-grained allowlists and denylists. MCP server integration is supported via stdio transport.

The framework offers three execution modes of increasing complexity: single agent (`runAgent()`), auto-orchestrated team (`runTeam()`), and explicit task pipeline (`runTasks()`). A JSON-first CLI (`oma`) enables shell and CI integration. Observability is built in via `onProgress` and `onTrace` callbacks that emit structured events for token usage, tool execution, and task lifecycle.

Notable production deployments include a WordPress security analyzer (temodar-agent), a multi-agent quant trading platform (rentech-quant-platform), and a private cybersecurity SOC running offline models via Ollama.

---

## Notable Quotes

> "The lightweight multi-agent orchestration engine for TypeScript. Three runtime dependencies, zero config, goal to result in one runTeam() call."

> "Users provide a goal statement; the system autonomously decomposes it into coordinated tasks without manual graph definition."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/JackChen-me/open-multi-agent/tree/main/examples | 16 runnable examples showing single-agent, team, and pipeline patterns — study the auto-decomposition in action | `/tool-catalogue` |
| https://github.com/JackChen-me/open-multi-agent/blob/main/src/orchestrator.ts | Core orchestrator implementation — compare DAG planning logic with our tmux orchestrator loop | Code review |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| CrewAI | Python multi-agent framework; positioned as alternative | Yes — `/agent-harnesses/` |
| LangGraph | Graph-drawing orchestration; positioned as alternative | Not yet catalogued |
| Vercel AI SDK | LLM call abstraction; complementary, not competitive | Not yet catalogued |
| MCP (Model Context Protocol) | Supported via stdio transport for tool extension | Referenced in multiple entries |
| Ollama | Local model runtime for offline deployments | Not yet catalogued |

---

## Action Items

- [ ] Evaluate `runTeam()` auto-decomposition quality for our typical orchestrator tasks — does the DAG planning match what our manual SPAWN_WORKER logic produces?
- [ ] Study the tool preset system (readonly/readwrite/full with allowlists/denylists) as a model for constraining our tmux worker agent capabilities
- [ ] Consider adopting the `onTrace` observability pattern for structured telemetry in our orchestrator loop
