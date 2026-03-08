# A2A Protocol (Agent-to-Agent)

> **An open protocol enabling communication and interoperability between opaque agentic applications.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [github.com/a2aproject/A2A](https://github.com/a2aproject/A2A) |
| GitHub Stars | 22,300 (as of 2026-03-08) |
| Publisher | Google / Linux Foundation (bigtech + foundation) |
| License | Apache 2.0 |
| Tech Stack | JSON-RPC 2.0 over HTTP(S), SSE streaming, SDKs in Python, C#/.NET, Java, Go |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Cross-agent communication is exactly what we need as we scale beyond single-orchestrator patterns. Federated multi-business architecture demands a standard protocol for agent-to-agent handoff. |
| **Novelty** | 6/10 | The Agent Card discovery pattern and opaque-agent-interop model are solid but conceptually familiar from our MCP work. The key novelty is the standardized task lifecycle across vendors. |
| **Actionable** | 6/10 | Not something we adopt this week — our L-Thread orchestrator handles inter-agent comms internally. But as we federate across business lines, A2A becomes the natural wire protocol. Phase 3-4 territory. |

---

## Overview

A2A (Agent-to-Agent) is Google's open protocol for enabling communication between AI agents that are built on different frameworks, by different vendors, and potentially running in different environments. Unlike MCP, which connects agents to tools and data sources, A2A operates at a higher level — it enables agents to discover each other, negotiate interaction modalities, and collaborate on tasks without exposing their internal state, memory, or tools.

The protocol is built on JSON-RPC 2.0 over HTTP(S) and supports three communication patterns: synchronous request/response, streaming via Server-Sent Events (SSE), and asynchronous push notifications. This flexibility allows A2A to handle everything from quick lookups to long-running multi-step tasks.

A2A was donated to the Linux Foundation in 2025 and has absorbed the competing ACP (Agent Communication Protocol) from IBM, making it the de facto standard for agent-to-agent communication. It launched with support from 50+ technology partners including Atlassian, Salesforce, PayPal, Langchain, and MongoDB.

---

## Technical Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Client Agent   │◄──────►│   Remote Agent   │
│                  │  A2A    │                  │
│  ┌────────────┐  │  JSON-  │  ┌────────────┐  │
│  │ Agent Card │  │  RPC    │  │ Agent Card │  │
│  │ Discovery  │  │  2.0    │  │ Published  │  │
│  └────────────┘  │        │  └────────────┘  │
│  ┌────────────┐  │        │  ┌────────────┐  │
│  │   Task     │  │        │  │   Task     │  │
│  │  Manager   │  │        │  │  Executor  │  │
│  └────────────┘  │        │  └────────────┘  │
└─────────────────┘         └─────────────────┘
```

**Core Abstractions:**

- **Agent Card**: JSON document describing an agent's capabilities, supported input/output types, authentication requirements, and endpoint URL. Served at a well-known URL (like `/.well-known/agent.json`) for discovery.
- **Task**: The primary unit of work. Tasks have a lifecycle: `submitted` → `working` → `input-required` → `completed` / `failed` / `canceled`. Tasks can be long-running and support resumption.
- **Message**: Communication unit within a task, containing one or more `Parts` (text, file, or structured data).
- **Part**: Atomic content unit — `TextPart`, `FilePart` (inline or URI-referenced), or `DataPart` (structured JSON).

**Communication Patterns:**
- `tasks/send` — synchronous request/response
- `tasks/sendSubscribe` — streaming via SSE
- `tasks/pushNotification/set` — webhook-based async notifications

**Authentication:** Delegated to HTTP-level mechanisms (OAuth 2.0, API keys, JWT). The protocol itself is auth-agnostic.

---

## Publisher Background

Google Cloud developed and launched A2A in April 2025, then donated it to the Linux Foundation's LF AI & Data foundation. This is a deliberate Google strategy — similar to Kubernetes and TensorFlow — to establish an open standard that prevents vendor lock-in while ensuring Google's cloud platform has first-class support. IBM Research's competing ACP protocol merged into A2A in August 2025, bringing IBM's BeeAI platform contributions. The project now has backing from 50+ enterprise partners and is governed by Linux Foundation processes.

---

## What's Valuable for Us

1. **Agent Card pattern for discovery**: As we scale to federated business lines, each line could publish an Agent Card describing what its orchestrator can do. This maps directly to our thin shared layer concept — the meta-layer discovers capabilities via Agent Cards rather than hardcoded routing.

2. **Task lifecycle model**: The `submitted → working → input-required → completed` lifecycle is almost identical to our L-Thread state machine. Aligning our internal task states with A2A's model would make future federation nearly free.

3. **Opaque agent interop**: A2A's core design principle — agents don't expose internals — maps perfectly to our context separation principle (business context never enters coding agents). A2A enforces this at the protocol level.

4. **MCP + A2A complementarity**: Google's ADK documentation explicitly positions MCP for agent-to-tool communication and A2A for agent-to-agent communication. We already use MCP extensively; adding A2A gives us the agent-to-agent layer we'll need.

---

## What's NOT Relevant

- **Google ADK integration**: The tightest A2A integration is with Google's Agent Development Kit. We're Claude-first and terminal-first — we don't need their ADK framework.
- **Enterprise SSO/OAuth complexity**: A2A's enterprise auth patterns (federated OAuth, SAML) are overkill for our current single-operator setup.
- **Multi-vendor agent marketplace**: A2A imagines a world where you discover and hire agents from different vendors. We're building our own agents, not shopping for them.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study Agent Card format for potential adoption in our orchestrator state schema. No implementation needed yet.
- **Phase 3 (Days 60-90)**: When federating business lines, implement A2A endpoints on each line's orchestrator so the meta-layer can discover and route work across lines.
- **Phase 4 (Days 90+)**: Full A2A support for external agent interop — allowing client agents or partner systems to interact with our orchestrators via the standard protocol. Also relevant for the agent economy vision (selling agent services via A2A endpoints).

---

## Key Takeaway

> **A2A is the emerging HTTP of agent communication — backed by Google, Linux Foundation, and 50+ partners — and its Agent Card discovery + Task lifecycle model maps cleanly onto our federated architecture vision.**
