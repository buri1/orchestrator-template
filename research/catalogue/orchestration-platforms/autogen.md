# AutoGen

> **A programming framework for agentic AI — multi-agent conversation with local and distributed runtimes, from Microsoft Research.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [microsoft/autogen](https://github.com/microsoft/autogen) |
| GitHub Stars | 55,300 (as of 2026-03-08) |
| Publisher | Microsoft Research (bigtech) |
| License | MIT (code), CC BY 4.0 (docs) |
| Tech Stack | Python (primary), .NET (secondary), AsyncIO, gRPC (distributed runtime), Playwright MCP |
| Maturity | 🟢 Production (v0.4+, heavy enterprise adoption) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Microsoft's scale and research depth are impressive, but the framework is Python/.NET only and optimized for conversational multi-agent patterns (agents talking to each other), not deterministic orchestration. |
| **Novelty** | 4/10 | Event-driven agent communication and the layered API (Core → AgentChat → Extensions) are well-designed but represent known patterns. AutoGen Studio (no-code GUI) is novel but irrelevant to our terminal-first approach. |
| **Actionable** | 2/10 | Python/.NET stack, conversation-centric paradigm, heavy async runtime. Nothing directly portable to our TypeScript/shell/Claude Code stack. |

---

## Overview

AutoGen is Microsoft Research's multi-agent framework, and by star count (55K+) it is the most popular agent framework on GitHub. Originally released in 2023 as a research project exploring multi-agent conversations, it was substantially rewritten for v0.4 with a layered architecture separating core runtime (message passing, event-driven) from high-level patterns (AgentChat) and extensions (LLM clients, tools).

The core mental model is **agents as conversational participants**. Agents send messages to each other, respond, and collaborate through structured conversations. This is fundamentally different from our orchestrator pattern where a single deterministic controller dispatches tasks to worker agents. In AutoGen, there is no central controller by default — agents self-organize through conversation protocols, though you can implement a "group chat manager" agent to add structure.

AutoGen's v0.4 rewrite introduced three layers: **Core API** (low-level message passing with local or distributed gRPC runtime), **AgentChat API** (simplified interface for common patterns like round-robin, selector, swarm), and **Extensions** (LLM clients, tool integrations). It also includes **AutoGen Studio**, a no-code web GUI for building and testing agent workflows visually.

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│              AutoGen Ecosystem               │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │         AutoGen Studio (GUI)         │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│  ┌──────────────▼───────────────────────┐    │
│  │       AgentChat API (High-level)     │    │
│  │  RoundRobinGroupChat, SelectorGroup, │    │
│  │  Swarm, MagenticOneGroupChat         │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│  ┌──────────────▼───────────────────────┐    │
│  │       Extensions API (LLM clients,   │    │
│  │       tools, MCP servers)            │    │
│  └──────────────┬───────────────────────┘    │
│                 │                             │
│  ┌──────────────▼───────────────────────┐    │
│  │        Core API (Message passing)    │    │
│  │   Local Runtime │ Distributed (gRPC) │    │
│  │   Event-driven  │ Async-first        │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

**Core abstractions:**

| Concept | Description |
|---------|-------------|
| **Agent** | Async entity that processes messages and publishes responses |
| **Runtime** | Local (in-process) or Distributed (gRPC across machines) message router |
| **Topic** | Pub/sub channel for multi-agent communication |
| **AgentTool** | Wraps an agent as a tool callable by other agents (agent-to-agent delegation) |
| **GroupChat** | Conversation protocol — RoundRobin, Selector (LLM picks next speaker), Swarm (handoffs) |
| **Termination** | Conditions for ending conversations (max messages, text match, token limit, etc.) |

**Key design decisions:**
- **Event-driven, not request-response**: Agents publish messages to topics, runtime routes them.
- **Distributed-first**: gRPC runtime allows agents on different machines (cross-language Python/.NET).
- **No built-in persistence**: State is in-memory. Persistence is left to the user.
- **MCP integration**: Agents can use MCP servers as tools (e.g., Playwright for web browsing).

---

## Publisher Background

Microsoft Research is one of the world's premier AI research labs. AutoGen originated from the "AI Frontiers" group, with key contributors including Chi Wang, Qingyun Wu, and others. The project has massive institutional backing — Microsoft's resources ensure continued development. However, the project has gone through significant API churn (v0.2 → v0.4 was a major rewrite with breaking changes), and the community has expressed frustration with the instability (see GitHub Discussion #7066 "AutoGen Update" for context on the transition). The .NET support signals Microsoft's enterprise ambitions, targeting their Azure/.NET customer base alongside the Python AI community.

---

## What's Valuable for Us

| Pattern | Where in AutoGen | How to Apply |
|---------|------------------|--------------|
| **AgentTool wrapper** | `AgentTool` class | Wrapping an agent as a callable tool for another agent. We could expose orchestrator capabilities as "tools" that Claude Code agents can invoke — e.g., a `spawn_agent` tool or `check_state` tool. Interesting abstraction. |
| **Termination conditions** | `MaxMessageTermination`, `TextMentionTermination`, `TokenUsageTermination` | Explicit, composable termination conditions. We currently use implicit "agent completed" signals. Formalizing termination conditions (max tokens, max time, specific output pattern) would improve robustness. |
| **Layered API design** | Core → AgentChat → Extensions | Clean separation of concerns. Our orchestrator could benefit from separating "core state machine" from "agent interaction protocol" from "tool integrations." Reference architecture for refactoring. |
| **Distributed runtime concept** | gRPC-based distributed runtime | Not for now, but the idea of agents on different machines communicating via message passing is relevant for Phase 4 when scaling across business lines. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Conversation-centric paradigm** | Agents talking to each other is the opposite of our single-orchestrator-dispatches-to-workers model. Multi-agent "conversation" introduces the N^1.724 coordination overhead. |
| **Python/.NET only** | No TypeScript runtime. The gRPC bridge is for Python↔.NET, not for our stack. |
| **API instability** | v0.2 → v0.4 rewrite broke the entire ecosystem. Building on AutoGen means accepting Microsoft Research's willingness to break APIs for better abstractions. |
| **No persistence by default** | In-memory state only. For a framework at 55K stars, the lack of built-in checkpointing is surprising. Users must build their own persistence — which is what we already do. |
| **AutoGen Studio** | No-code GUI is irrelevant for our terminal-first, prompt-engineering approach. |
| **Overhead for small teams** | GroupChat protocols (RoundRobin, Selector, Swarm) are designed for 3+ agents conversing. Our 2-3 agent model with deterministic routing doesn't need conversation management. |

---

## Future Use Cases

- **Phase 1-3:** None. Wrong language, wrong paradigm, API instability risk.
- **Phase 4 (Days 90+):** If a client has existing AutoGen deployments (likely given Microsoft's enterprise push), understanding the AgentChat API and GroupChat protocols is necessary for integration. The distributed gRPC runtime could be relevant if we need cross-machine agent coordination.
- **Research reference:** The termination condition pattern and AgentTool wrapper are worth internalizing as concepts, even if we never use AutoGen code.

---

## Key Takeaway

> **AutoGen has the most stars (55K) and Microsoft's backing but suffers from API instability and a conversation-centric paradigm that conflicts with deterministic orchestration — useful as market context and for the termination condition pattern, but not for adoption.**
