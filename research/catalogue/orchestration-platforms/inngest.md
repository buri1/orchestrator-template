# Inngest

> **Durable functions replace queues, state management, and scheduling — event-driven workflow engine with AgentKit for multi-agent networks in TypeScript.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [inngest/inngest](https://github.com/inngest/inngest) (platform), [inngest/agent-kit](https://github.com/inngest/agent-kit) (AgentKit) |
| GitHub Stars | 5,000 (inngest platform), 797 (agent-kit) (as of 2026-03-08) |
| Publisher | Inngest Inc (startup, VC-funded) |
| License | SSPL (server) + Apache 2.0 (SDKs, delayed open-source for server) |
| Tech Stack | Go (server 58.5%), TypeScript (SDKs 39.2%), Zod, MCP integration, multi-model (Anthropic/OpenAI/Gemini) |
| Maturity | 🟡 Early (AgentKit v0.9.0) / 🟢 Production (Inngest platform itself) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | TypeScript-native, deterministic routing as first-class concept, event-driven durable execution, state machines with typed state — this is the closest match to our architecture philosophy in the entire agent framework space. |
| **Novelty** | 7/10 | The combination of durable execution platform + agent-specific primitives (Networks, Routers, shared state) is genuinely new. Most agent frameworks ignore infrastructure; Inngest starts from infrastructure and adds agent concepts on top. |
| **Actionable** | 6/10 | TypeScript SDK, Claude/Anthropic as first-class model, MCP integration. Could prototype an agent network in a day. But AgentKit is v0.9 (early), and adopting Inngest platform means new infrastructure dependency. |

---

## Overview

Inngest is a durable execution platform that has expanded into the AI agent space with AgentKit. Unlike every other framework on this list, Inngest didn't start as an "AI agent framework" — it started as a production workflow engine solving queues, state management, scheduling, and retry logic for backend developers. AgentKit layers agent-specific primitives on top of this battle-tested infrastructure.

This origin story matters because it means Inngest approaches agent orchestration from the **infrastructure side**, not the AI side. Where CrewAI and AutoGen ask "how do we make LLMs collaborate?", Inngest asks "how do we make agent workflows durable, observable, and deterministic?" This aligns precisely with our 70/30 deterministic/LLM split — the 70% deterministic layer (routing, state, scheduling, retry) is Inngest's core competency, with the 30% LLM layer (agent inference) handled by AgentKit's model-agnostic design.

AgentKit introduces four primitives: **Agents** (LLM entities with tools and system prompts), **Networks** (collections of agents with shared state), **Routers** (deterministic or LLM-based decision functions that select which agent runs next), and **State** (typed state machine shared across the network). The router pattern is key — it supports code-based routing (fully deterministic), LLM-based routing (ReAct pattern), or hybrid approaches. This maps directly to our orchestrator's state-machine-driven agent dispatching.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│              Inngest Platform                     │
│                                                   │
│  Event API ──► Event Stream ──► Runner ──► Queue  │
│                                    │              │
│                              Executor             │
│                                    │              │
│                        ┌───────────▼──────────┐   │
│                        │   Your Functions      │   │
│                        │   (Steps / Agents)    │   │
│                        └──────────────────────┘   │
│                                                   │
│  State DB ◄──── Checkpoint after each step        │
│  History DB ◄── Full execution trace              │
│  Dashboard ◄── GraphQL/REST API                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│              AgentKit Layer                        │
│                                                   │
│  ┌──────────┐   ┌───────────┐   ┌─────────────┐  │
│  │  Agent   │   │  Network  │   │   Router    │  │
│  │ - model  │◄──│ - agents  │──►│ - code/LLM  │  │
│  │ - tools  │   │ - state   │   │ - hybrid    │  │
│  │ - prompt │   │ - history │   │             │  │
│  └──────────┘   └───────────┘   └─────────────┘  │
│                       │                           │
│              ┌────────▼────────┐                  │
│              │  Shared State   │                  │
│              │  (typed, Zod)   │                  │
│              └─────────────────┘                  │
└──────────────────────────────────────────────────┘
```

**AgentKit core primitives:**

| Concept | Description |
|---------|-------------|
| **Agent** | LLM entity with system prompt, model config, tools (including MCP), and lifecycle callbacks |
| **Network** | Collection of agents with shared state and conversation history, orchestrated by a router |
| **Router** | Decision function that selects which agent runs next — supports code-based (deterministic), LLM-based (ReAct), or custom hybrid |
| **State** | Typed (Zod schema) shared memory flowing bidirectionally through agents, routers, tools, and callbacks |
| **Tools** | Functions with Zod-validated input schemas, plus MCP server integration via Smithery |

**Inngest platform primitives (underlying AgentKit):**

| Concept | Description |
|---------|-------------|
| **Functions** | Durable, event-triggered execution units with automatic retry |
| **Steps** | Individual operations within functions, each checkpointed |
| **Events** | HTTPS triggers that initiate function execution |
| **Flow Control** | Concurrency limits, throttling, debouncing, rate limiting, priority queues |
| **Dev Server** | Local development server with production parity and live tracing |

**Key design decisions:**
- **TypeScript-first**: SDK and AgentKit are TypeScript-native (not a port from Python).
- **Infrastructure-up**: Durability, retries, and state persistence come from the platform, not bolted on.
- **Model-agnostic**: OpenAI, Anthropic (Claude), Gemini, and any OpenAI-compatible API.
- **MCP-native**: Tools can be MCP servers, connecting to the broader tool ecosystem.
- **Deterministic routing as default**: Code-based routers are the recommended starting point, with LLM routing as an opt-in escalation.

---

## Publisher Background

Inngest Inc is a VC-funded startup (raised $6.1M seed) focused on durable execution infrastructure. Founded by Dan Farrelly (CEO) and Tony Holdstock-Brown (CTO), both with backgrounds in developer tools and infrastructure. The platform has been in production use for workflow orchestration before pivoting to add agent-specific features with AgentKit. Their approach — "start with infrastructure, add AI" — is the inverse of most agent startups ("start with AI, bolt on infrastructure"). The team is small but technically strong. The SSPL license on the server (with delayed Apache 2.0 publication) means the server is not fully open-source, but the SDKs (what you actually use) are Apache 2.0.

---

## What's Valuable for Us

| Pattern | Where in AgentKit | How to Apply |
|---------|-------------------|--------------|
| **Deterministic router pattern** | `defaultRouter` / custom router functions | AgentKit's router is almost identical to our orchestrator's state-machine-based dispatching. Study their router API for inspiration on formalizing our routing logic. `router: ({ network, state }) => agent_or_stop` is clean. |
| **Typed shared state** | Zod-validated `State` object | Our `orchestrator-state.json` is untyped. Adding Zod schema validation to our state files would catch bugs earlier. AgentKit's bidirectional state flow (agents read and update shared state) is exactly our pattern. |
| **Durable step execution** | Inngest `step.run()` primitive | Each orchestrator action as a durable step with automatic retry and checkpointing. If we ever move beyond JSON state files, Inngest's step model is the reference architecture. |
| **Event-driven triggers** | Inngest event API | Replace our tmux polling with event-driven agent completion signals. `inngest.send({ name: "agent.completed", data: { ... } })` is cleaner than `tmux capture-pane`. |
| **MCP tool integration** | Smithery SDK integration in AgentKit | Their MCP integration pattern for giving agents tools via MCP servers. We already use Chrome DevTools MCP — this pattern extends to other MCP servers. |
| **Dev Server with live tracing** | `npx inngest-cli@latest dev` | Local development with full execution traces and debugging. Our devlog approach is a manual version of this — Inngest automates it. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Platform dependency** | Using AgentKit means depending on the Inngest platform (self-hosted or cloud). Adding infrastructure is a Phase 3+ decision, not Phase 1. |
| **AgentKit immaturity** | v0.9.0 — pre-1.0, API will change. Not production-ready for our revenue-generating work. |
| **SSPL license on server** | Not fully open-source. If self-hosting, the SSPL has restrictions on offering it as a service. SDKs are Apache 2.0, so client-side usage is fine. |
| **Overkill for 2-3 agents** | Inngest's flow control (concurrency, throttling, debouncing) is designed for high-throughput systems. Our 2-3 agent topology doesn't need this yet. |
| **Cloud-first pricing** | Inngest cloud has usage-based pricing. Self-hosting requires running the Go server. Either way, it's more infrastructure than our current zero-infra approach. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Study AgentKit's router and state patterns. Apply Zod-typed state validation to our orchestrator state files. No platform adoption yet.
- **Phase 2 (Days 4-60):** If we hit reliability issues with tmux-based agent management, prototype an Inngest-based agent network as an alternative execution layer. The event-driven model could replace our polling.
- **Phase 3 (Days 60-90):** Evaluate Inngest platform (self-hosted) as the deterministic execution layer for our orchestrator. This is the natural fit — Inngest handles the 70% (routing, state, retry, scheduling), our prompts handle the 30% (LLM inference). **This is the most architecturally aligned option on this list.**
- **Phase 4 (Days 90+):** If scaling to multiple business lines, Inngest's multi-tenant flow control (concurrency limits per tenant) maps to our federated architecture.

---

## Key Takeaway

> **Inngest + AgentKit is the most architecturally aligned framework to our vision — TypeScript-native, deterministic routing as default, durable execution from infrastructure-up — but AgentKit is pre-1.0, so study the patterns now and evaluate platform adoption at Phase 3.**
