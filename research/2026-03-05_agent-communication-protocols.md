# Agent-to-Agent Communication Protocols & Standards

**Research Date:** 2026-03-05
**Status:** Deep Research Complete
**Relevance:** Direct impact on orchestrator architecture decisions

---

## Table of Contents

1. [Protocol Landscape Overview](#1-protocol-landscape-overview)
2. [Google A2A (Agent-to-Agent) Protocol](#2-google-a2a-agent-to-agent-protocol)
3. [MCP vs A2A: Complementary, Not Competing](#3-mcp-vs-a2a-complementary-not-competing)
4. [Other Agent Communication Protocols](#4-other-agent-communication-protocols)
5. [How Coding Agents Communicate Today](#5-how-coding-agents-communicate-today)
6. [Agent-Native Team Chat](#6-agent-native-team-chat)
7. [Agent Traces: Formats and Benefits](#7-agent-traces-formats-and-benefits)
8. [Standardization Efforts](#8-standardization-efforts)
9. [Messaging Patterns for Orchestrators](#9-messaging-patterns-for-orchestrators)
10. [Recommendations for This Orchestrator](#10-recommendations-for-this-orchestrator)

---

## 1. Protocol Landscape Overview

The multi-agent communication space has rapidly matured through 2025-2026. Five major protocols now define the landscape, each addressing a different layer:

| Protocol | Owner | Purpose | Layer |
|----------|-------|---------|-------|
| **MCP** (Model Context Protocol) | Anthropic / AAIF | Agent-to-Tool connectivity | Vertical (tools, data, APIs) |
| **A2A** (Agent-to-Agent) | Google / Linux Foundation | Agent-to-Agent collaboration | Horizontal (inter-agent) |
| **ACP** (Agent Communication Protocol) | IBM (merged into A2A) | REST-based agent messaging | Horizontal (merged Sept 2025) |
| **ANP** (Agent Network Protocol) | Open source community | Decentralized internet-scale agent discovery | Network (P2P, open internet) |
| **WebMCP** | Google + Microsoft / W3C | Agent-to-Website interaction | Browser (structured web tools) |

**Key insight:** These are not competing standards. They address different layers of a complete agent communication stack. The industry analogy is TCP/IP layers -- MCP is the "application layer" for tools, A2A is the "transport layer" for agent messaging, ANP is the "network layer" for discovery.

Gartner reported a 1,445% surge in multi-agent system inquiries from Q1 2024 to Q2 2025. If 2025 was the year of AI agents, 2026 is the year of multi-agent systems.

---

## 2. Google A2A (Agent-to-Agent) Protocol

### What It Is

A2A is an open protocol enabling communication and interoperability between opaque agentic applications. Released April 2025 by Google, it is now governed by the Linux Foundation with 100+ enterprise supporters.

### Core Architecture

A2A is built on standard web technologies: **HTTP, SSE (Server-Sent Events), and JSON-RPC 2.0**. As of v0.3 (July 2025), it also supports **gRPC**.

#### The Three-Layer Model

- **Layer 1: Data Structures** -- Defines Agent Cards, Tasks, Messages, Artifacts, and Parts
- **Layer 2: Abstract Operations** -- Defines capabilities agents must support (send message, get task, cancel task, push notifications)
- **Layer 3: Protocol Bindings** -- Concrete mappings to JSON-RPC over HTTP, gRPC, or REST

#### Agent Cards (Discovery)

Every A2A agent publishes a JSON file at `/.well-known/agent.json` listing:
- Agent name and description
- Endpoint URL
- Skills (what the agent can do)
- Supported authentication flows
- Supported input/output content types

This is the discovery mechanism -- clients read the Agent Card before sending any requests.

#### Task Lifecycle

Tasks are the core unit of work in A2A:
1. Client sends a message to create/continue a task
2. Task progresses through states: `submitted` -> `working` -> `completed` / `failed` / `canceled`
3. Tasks can produce **Artifacts** (output data) and send **Messages** back
4. Supports streaming via SSE and push notifications for long-running tasks

#### Communication Patterns

- **Synchronous**: Request/response over HTTP
- **Streaming**: Server-Sent Events for real-time updates
- **Asynchronous**: Push notifications for tasks that take hours/days
- **gRPC**: For high-performance, low-latency scenarios

### Current Version

A2A v1.0 DRAFT is in development with full gRPC support, signed security cards, and extended Python SDK.

### Sources

- [Google Developers Blog - Announcing A2A](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [A2A Protocol Specification](https://a2a-protocol.org/latest/specification/)
- [GitHub - a2aproject/A2A](https://github.com/a2aproject/A2A)
- [Linux Foundation A2A Launch](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)
- [IBM - What Is Agent2Agent Protocol](https://www.ibm.com/think/topics/agent2agent-protocol)

---

## 3. MCP vs A2A: Complementary, Not Competing

### The Key Distinction

**MCP = How an agent connects to tools and data (vertical integration)**
**A2A = How agents talk to each other (horizontal coordination)**

MCP standardizes the interface between an AI model and external capabilities (databases, APIs, file systems, browsers). A2A standardizes the interface between two autonomous agents that need to collaborate, delegate, or hand off tasks.

### Analogy

Think of it like a human worker:
- **MCP** is like knowing how to use your tools (email client, IDE, spreadsheet)
- **A2A** is like knowing how to communicate with your colleagues (assign tasks, share progress, ask for help)

### Adoption Numbers (2026)

- MCP Python and TypeScript SDKs: **97+ million monthly downloads**
- A2A: **100+ enterprise supporters**
- Both are now under Linux Foundation governance (AAIF for MCP, LF AI & Data for A2A)

### When to Use Which

| Scenario | Protocol |
|----------|----------|
| Agent needs to query a database | MCP |
| Agent needs to call an API | MCP |
| Agent needs to delegate a subtask to another agent | A2A |
| Agent needs to discover another agent's capabilities | A2A (Agent Cards) |
| Agent needs to hand off a conversation to a specialist | A2A |
| Agent needs to read/write files on a server | MCP |
| Two agents need to negotiate a shared workflow | A2A |

### Can They Work Together?

Yes. A typical architecture:
1. **Orchestrator agent** uses A2A to discover and delegate to specialist agents
2. Each **specialist agent** uses MCP to connect to its tools (databases, APIs, browsers)
3. Agents communicate progress and results back via A2A task lifecycle
4. The orchestrator aggregates results

### Sources

- [Auth0 - MCP vs A2A](https://auth0.com/blog/mcp-vs-a2a/)
- [Cisco - MCP and A2A Network Engineer's Mental Model](https://blogs.cisco.com/ai/mcp-and-a2a-a-network-engineers-mental-model-for-agentic-ai)
- [Clarifai - MCP vs A2A Clearly Explained](https://www.clarifai.com/blog/mcp-vs-a2a-clearly-explained)
- [TrueFoundry - MCP vs A2A Key Differences](https://www.truefoundry.com/blog/mcp-vs-a2a)

---

## 4. Other Agent Communication Protocols

### 4.1 ACP (Agent Communication Protocol) -- IBM

**Status: Merged into A2A (September 2025)**

IBM launched ACP in May 2025 as a REST-based, open-source standard for agent-to-agent communication. Key characteristics:
- Pure RESTful architecture (GET, POST, PUT, DELETE)
- No SDK required -- works with curl, Postman, any HTTP client
- Powered IBM's BeeAI platform

In September 2025, IBM announced ACP would officially merge with A2A under the Linux Foundation. This was a convergence, not an acquisition:
- ACP's HTTP/REST patterns merged with A2A's real-time coordination capabilities
- IBM's Kate Blair joined the A2A Technical Steering Committee
- Migration paths were provided for ACP users

**Sources:**
- [IBM Research - Agent Communication Protocol](https://research.ibm.com/blog/agent-communication-protocol-ai)
- [ACP Joins Forces with A2A - LF AI & Data](https://lfaidata.foundation/communityblog/2025/08/29/acp-joins-forces-with-a2a-under-the-linux-foundations-lf-ai-data/)

### 4.2 ANP (Agent Network Protocol)

**Status: Active, focused on open internet agent discovery**

ANP is designed for agent interconnection on the open internet, using peer-to-peer architecture for cross-platform and cross-organization agent discovery.

**Three-Layer Architecture:**

1. **Identity & Encrypted Communication Layer**: Based on W3C DID (Decentralized Identifiers) standard. Uses `did:wba` method for decentralized identity authentication without central authority.

2. **Meta-Protocol Negotiation Layer**: Agents negotiate communication protocols dynamically using natural language exchange of requirements, capabilities, and collaborative intentions.

3. **Application Protocol Layer**: Agent Description Protocol (ADP) in JSON-LD format using schema.org vocabulary for standardized agent self-description.

**Positioning:**
- Use **MCP** to connect tools/resources
- Use **A2A** for agent collaboration within enterprises
- Use **ANP** for agent connections on the open internet

**Sources:**
- [ANP White Paper](https://www.agent-network-protocol.com/specs/white-paper.html)
- [GitHub - AgentNetworkProtocol](https://github.com/agent-network-protocol/AgentNetworkProtocol)
- [Survey of Agent Interoperability Protocols (arXiv)](https://arxiv.org/html/2505.02279v1)

### 4.3 WebMCP (Web Model Context Protocol)

**Status: W3C Community Group standard, Chrome 146 early preview (Feb 2026)**

Jointly developed by Google and Microsoft, WebMCP enables browsers to expose structured tools to AI agents through the `navigator.modelContext` API.

**Key Innovation:** Instead of agents scraping/clicking DOM elements, websites publish a "Tool Contract" -- a structured list of callable functions (e.g., `buyTicket(destination, date)`).

**Two APIs:**
- **Declarative API**: Standard actions defined in HTML forms
- **Imperative API**: Complex dynamic interactions requiring JavaScript

**Performance:** 89% token efficiency improvement over screenshot-based methods.

**Sources:**
- [WebMCP W3C Standard](https://webmcp.link/)
- [Google AI Introduces WebMCP](https://www.marktechpost.com/2026/02/14/google-ai-introduces-the-webmcp-to-enable-direct-and-structured-website-interactions-for-new-ai-agents/)
- [VentureBeat - Chrome ships WebMCP](https://venturebeat.com/infrastructure/google-chrome-ships-webmcp-in-early-preview-turning-every-website-into-a)

### 4.4 AGENTS.md (OpenAI)

**Status: 60,000+ repos adopted, contributed to AAIF**

Not a communication protocol per se, but a universal standard for AI coding agents to receive project-specific guidance. It defines how agents should behave within a codebase -- coding standards, testing requirements, architectural constraints.

Adopted by: Amp, Codex, Cursor, Devin, Factory, Gemini CLI, GitHub Copilot, Jules, VS Code, and others.

**Sources:**
- [OpenAI - Agentic AI Foundation](https://openai.com/index/agentic-ai-foundation/)
- [Linux Foundation AAIF Announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)

### 4.5 Historical Context: FIPA-ACL and KQML

Earlier interoperability standards like KQML (Knowledge Query and Manipulation Language) and FIPA-ACL (Foundation for Intelligent Physical Agents - Agent Communication Language, ratified 2000) set formal semantic foundations. The current generation of protocols (MCP, A2A, ANP) builds on these ideas but emphasizes lightweight, web-native implementations.

---

## 5. How Coding Agents Communicate Today

### 5.1 stdin/stdout (Subprocess Pattern)

The most fundamental pattern. The Claude Agent SDK uses stdin/stdout for process communication:
- Parent process writes JSON to child's stdin
- Child process writes JSON responses to stdout
- Follows Unix philosophy of small tools connected through pipes

**Used by:** Claude Code hooks, MCP servers (stdio transport), subagent spawning.

**Limitation:** stdin is consumed by the first reader -- chaining multiple hook scripts requires careful handling.

### 5.2 Claude Code Subagents

Subagents run within a single session as focused workers:
- Parent spawns child via `Task` tool
- Child executes focused work and returns result
- Cannot message each other directly
- Parent acts as intermediary for all communication

**Limitation:** If Worker A discovers something Worker B needs, it must report to parent first, which relays it.

### 5.3 Claude Code Agent Teams (Feb 2026)

Agent Teams solve the inter-agent communication bottleneck:
- 2-16 agents working on shared codebases
- All agents communicate directly through a **shared mailbox**
- One session acts as team lead, coordinating work
- Teammates work independently in their own context windows
- Teammates inherit MCP server configuration from the project

**Key findings:**
- 2-3 focused teammates consistently outperform larger teams
- Beyond 4-5 agents, coordination overhead grows faster than productivity
- Sequential tasks with agent teams add 3-7x cost for zero speed improvement

### 5.4 File-Based Communication (This Orchestrator's Current Approach)

The L-Thread Orchestrator uses JSON state files:
- `_bmad/orchestrator-state.json` (conduit mode)
- `_bmad/orchestrator-teams-state.json` (teams mode)
- `_bmad/orchestrator-tmux-state.json` (tmux mode)

Plus tmux terminal read/write for real-time agent communication.

### 5.5 Comparison Matrix

| Method | Latency | Scalability | Complexity | Durability |
|--------|---------|-------------|------------|------------|
| stdin/stdout | Very low | 1:1 only | Low | None (in-memory) |
| File-based JSON | Low | Limited | Low | Persisted |
| Tmux terminal I/O | Low | Limited (panes) | Medium | Session-lived |
| Shared mailbox (Agent Teams) | Low | 2-16 agents | Medium | Session-lived |
| HTTP/JSON-RPC (A2A) | Medium | High | High | Configurable |
| Message queue (Kafka/RabbitMQ) | Medium | Very high | High | Persisted |
| gRPC | Low | High | High | Configurable |

### Sources

- [Claude Code Docs - Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Docs - Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Inside Claude Agent SDK - stdin/stdout](https://buildwithaws.substack.com/p/inside-the-claude-agent-sdk-from)
- [Addy Osmani - Claude Code Swarms](https://addyosmani.com/blog/claude-code-agent-teams/)

---

## 6. Agent-Native Team Chat

### What It Means

"Agent-native team chat" refers to communication platforms designed from the ground up for AI agents as first-class participants, not human chat tools with AI bolted on.

### Key Differences from Human Team Chat

| Aspect | Human Team Chat | Agent-Native Chat |
|--------|----------------|-------------------|
| Message format | Natural language, emojis | Structured JSON + natural language |
| Speed | Human typing speed | Milliseconds |
| Context | Shared understanding, culture | Explicit context passing required |
| Identity | Username + avatar | Agent Card + capabilities manifest |
| Persistence | Chat history | Structured state + traces |
| Concurrency | Sequential conversations | Massive parallelism |
| Handoff | "Hey, can you take a look?" | Formal task delegation with schema |

### AgentMail: Email as Agent Identity

AgentMail (YC-backed) provides email inboxes for AI agents, using email as a universal communication protocol:
- Each agent gets a dedicated email address (identity)
- Two-way communication with humans, services, and other agents
- Threaded conversations with semantic search
- Automatic SPF/DKIM/DMARC authentication
- API-first (no SMTP configuration)
- Integrates with LangChain, LlamaIndex, CrewAI, Google ADK

**Insight:** Email is the lowest-common-denominator protocol that every system already supports. Giving agents email addresses enables communication with legacy systems without new protocol adoption.

### Agent Collaboration Platforms

- **Microsoft Teams**: Agents as AI teammates in channels, supporting MCP for cross-agent tool sharing
- **OpenClaw**: Open-source, always-on AI assistant connected to Slack, Discord, email
- **Moltbook**: Social network exclusively for AI agents (1.5M+ agents)

### Sources

- [AgentMail](https://www.agentmail.to)
- [AgentMail - Email as Identity for AI Agents](https://www.agentmail.to/blog/email-as-identity-for-ai-agents)
- [Microsoft 365 Copilot - Human-Agent Teams](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/18/microsoft-365-copilot-enabling-human-agent-teams/)
- [TIME - Chat, Code, Claw: AI Agents Work in Teams](https://time.com/7381463/chat-code-claw-ai-agents-teams/)

---

## 7. Agent Traces: Formats and Benefits

### What Are Agent Traces?

Agent traces are detailed records of an agent's execution: every LLM call, tool invocation, decision point, and output. They serve as the "flight recorder" for AI agent behavior.

### OpenTelemetry GenAI Semantic Conventions

The industry is converging on **OpenTelemetry** as the standard for agent observability. The GenAI Semantic Conventions (currently in Development status) define:

**Span Types:**
- `create_agent {gen_ai.agent.name}` -- Agent creation
- Tool call spans with input/output
- LLM inference spans with token counts and latency

**Key Attributes:**
- `gen_ai.agent.id` -- Unique identifier
- `gen_ai.agent.name` -- Human-readable name
- `gen_ai.agent.version` -- Version
- `gen_ai.agent.description` -- Free-form description

**Three Signals:**
1. **Traces** -- End-to-end execution paths across agent calls
2. **Metrics** -- Token usage, latency, error rates
3. **Events** -- Prompts, model responses, tool calls

### traces.com Platform

Traces.com is a community platform for sharing and discovering agent execution traces publicly. It hosts traces from various agents powered by different LLMs (Claude, GPT), enabling developers to learn from real-world agent executions.

### Benefits of Trace Sharing

1. **Debugging**: See exactly where an agent went wrong
2. **Optimization**: Compare token usage across different approaches
3. **Learning**: Discover effective agent patterns from community traces
4. **Benchmarking**: Compare agent performance across frameworks
5. **Compliance**: Audit trail for enterprise requirements

### Sources

- [OpenTelemetry - GenAI Agent Spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-agent-spans/)
- [OpenTelemetry - AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)
- [Traces.com](https://www.traces.com/)
- [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)

---

## 8. Standardization Efforts

### Agentic AI Foundation (AAIF) -- December 2025

The single most important standardization event. The Linux Foundation launched AAIF with:

**Founding Projects:**
- **MCP** (Anthropic) -- Agent-to-tool connectivity
- **AGENTS.md** (OpenAI) -- Project-specific agent guidance
- **Goose** (Block) -- Open-source agent framework

**Platinum Members:** AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI

**Significance:** The three biggest AI labs (Anthropic, Google, OpenAI) plus major cloud providers all agreeing on shared standards under neutral governance. This is unprecedented alignment.

### A2A Under Linux Foundation -- July 2025

Google donated A2A to the Linux Foundation's LF AI & Data, with v0.3 released including gRPC support. The A2A + ACP merger (September 2025) further consolidated the agent communication standard.

### W3C WebMCP Community Group -- September 2025

WebMCP formalized as a W3C Community Group standard for agent-browser interaction.

### Timeline of Standardization

| Date | Event |
|------|-------|
| Nov 2024 | Anthropic releases MCP |
| Mar 2025 | OpenAI adopts MCP |
| Apr 2025 | Google releases A2A |
| May 2025 | IBM releases ACP |
| Jul 2025 | A2A v0.3 + Linux Foundation |
| Aug 2025 | OpenAI releases AGENTS.md |
| Sep 2025 | ACP merges into A2A |
| Sep 2025 | WebMCP accepted by W3C |
| Dec 2025 | AAIF formed (MCP + AGENTS.md + Goose) |
| Feb 2026 | WebMCP ships in Chrome 146 preview |
| Feb 2026 | Claude Code Agent Teams released |
| Mar 2026 | A2A v1.0 DRAFT in development |

### Sources

- [Linux Foundation AAIF Announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [OpenAI co-founds AAIF](https://openai.com/index/agentic-ai-foundation/)
- [TechCrunch - OpenAI, Anthropic, Block join AAIF](https://techcrunch.com/2025/12/09/openai-anthropic-and-block-join-new-linux-foundation-effort-to-standardize-the-ai-agent-era/)
- [Anthropic donates MCP to AAIF](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)

---

## 9. Messaging Patterns for Orchestrators

### Pattern Comparison

#### 1. Shared Filesystem
```
Orchestrator writes JSON -> Agent reads JSON -> Agent writes result -> Orchestrator reads
```
**Pros:** Simple, persistent, no infrastructure needed, works with any language
**Cons:** Polling required, no real-time, file locking issues, doesn't scale
**Best for:** Local development, small teams (2-5 agents), CLI tools

#### 2. Unix Pipes (stdin/stdout)
```
Orchestrator | Agent (stdin/stdout piped)
```
**Pros:** Lowest latency, zero overhead, Unix-native
**Cons:** 1:1 only, no persistence, loses state on crash
**Best for:** Subprocess/subagent patterns, MCP stdio transport

#### 3. HTTP / JSON-RPC (A2A pattern)
```
Orchestrator -> POST /tasks -> Agent -> SSE stream back
```
**Pros:** Standard, scalable, supports discovery, enterprise-ready
**Cons:** Higher latency, requires HTTP server per agent, more complex
**Best for:** Cross-network agents, enterprise deployments, A2A-compatible systems

#### 4. Message Queue (Kafka, RabbitMQ, Redis Streams)
```
Orchestrator -> Queue -> Agent consumes -> Queue -> Orchestrator consumes
```
**Pros:** Highly scalable, persistent, decoupled, handles backpressure
**Cons:** Infrastructure overhead, operational complexity
**Best for:** Production systems, high-throughput, many agents

#### 5. WebSocket
```
Orchestrator <-> WebSocket <-> Agent (bidirectional)
```
**Pros:** Real-time, bidirectional, lower overhead than HTTP polling
**Cons:** Connection management, reconnection logic needed
**Best for:** Real-time collaboration, streaming scenarios

#### 6. Shared Mailbox (Claude Agent Teams pattern)
```
All agents read/write to shared mailbox, team lead coordinates
```
**Pros:** Simple mental model, built-in to Claude Code, direct agent-to-agent messaging
**Cons:** Proprietary to Claude Code, 16 agent limit, session-lived
**Best for:** Claude Code native workflows

### Decision Matrix

| Factor | File | Pipes | HTTP | Queue | WebSocket | Mailbox |
|--------|------|-------|------|-------|-----------|---------|
| Setup complexity | Very Low | Low | Medium | High | Medium | Low |
| Real-time | No | Yes | SSE | Yes | Yes | Yes |
| Persistence | Yes | No | Config | Yes | No | Session |
| Scale | Low | 1:1 | High | Very High | High | 2-16 |
| Crash recovery | Good | None | Config | Good | Fair | Session |
| Cross-network | No | No | Yes | Yes | Yes | No |
| Standards-based | No | No | A2A | Varies | Varies | Proprietary |

### Microsoft's Reference Architecture

Microsoft published a multi-agent reference architecture recommending:
- **Hub-and-spoke** for predictable workflows with strong consistency
- **Mesh** for peer-to-peer agent collaboration
- **Hybrid** for strategic orchestration + tactical local execution

### Sources

- [Microsoft Multi-Agent Reference Architecture](https://microsoft.github.io/multi-agent-reference-architecture/docs/agents-communication/Message-Driven.html)
- [MarkTechPost - Production-Grade Multi-Agent Communication](https://www.marktechpost.com/2026/03/01/how-to-design-a-production-grade-multi-agent-communication-system-using-langgraph-structured-message-bus-acp-logging-and-persistent-shared-state-architecture/)
- [Arize - Orchestrator-Worker Agents Comparison](https://arize.com/blog/orchestrator-worker-agents-a-practical-comparison-of-common-agent-frameworks/)

---

## 10. Recommendations for This Orchestrator

### Current State Assessment

The L-Thread Orchestrator currently uses:
- **Conduit mode**: Tmux pane-split + terminal-write/read (essentially Unix pipe via tmux)
- **Teams mode**: Claude Code native Task tool + SendMessage (shared mailbox)
- **State**: File-based JSON (`_bmad/orchestrator-*.json`)
- **Recovery**: Tmux session persistence

This is a pragmatic, working approach. The question is: what should it evolve toward?

### Short-Term Recommendations (Now)

1. **Keep the current hybrid approach.** File-based state + tmux I/O + Claude Agent Teams is well-suited for a local-first CLI orchestrator. No need to add HTTP servers or message queues for local agent coordination.

2. **Adopt AGENTS.md convention.** The project already has CLAUDE.md. Consider also supporting AGENTS.md for broader tool compatibility (Cursor, Codex, Copilot, etc.).

3. **Add structured trace logging.** Adopt OpenTelemetry GenAI semantic conventions for trace output. Even if not sending to OTel collectors, using the attribute naming (`gen_ai.agent.id`, `gen_ai.agent.name`, etc.) ensures future compatibility.

4. **Use JSON-LD for agent descriptions.** When agents publish their capabilities (similar to A2A Agent Cards), use JSON-LD format for future interoperability with ANP and A2A discovery.

### Medium-Term Recommendations (3-6 months)

5. **Implement A2A Agent Cards for agent discovery.** Each orchestrator-managed agent should have a lightweight Agent Card describing its capabilities, even if communication remains local. This makes the system A2A-compatible if/when inter-network communication is needed.

6. **Consider A2A task lifecycle for state management.** The current state files track agent status manually. A2A's task lifecycle (`submitted` -> `working` -> `completed` / `failed` / `canceled`) is a proven pattern worth adopting as the state machine model.

7. **Evaluate Claude Code Agent Teams as primary backend.** With the Feb 2026 release, Agent Teams provide native inter-agent messaging, shared context, and MCP tool inheritance. For 2-5 agent workflows (which is this orchestrator's sweet spot), it may be more robust than tmux terminal I/O.

### Long-Term Recommendations (6-12 months)

8. **Build an A2A-compatible interface.** Expose the orchestrator as an A2A server with an Agent Card at `/.well-known/agent.json`. This allows other A2A-compatible systems to discover and delegate tasks to it.

9. **Support MCP as both client and server.** The orchestrator should be an MCP server (exposing orchestration capabilities to other agents) and an MCP client (using tools via MCP). This dual role is the emerging pattern for sophisticated agent systems.

10. **Watch WebMCP for UI testing.** The orchestrator currently uses Chrome DevTools MCP for E2E testing. WebMCP (Chrome 146+) could provide more reliable, structured interaction with web applications, replacing screenshot-based testing with semantic tool calls.

### Protocol Stack Recommendation

```
Layer 4: Application    -> AGENTS.md / CLAUDE.md (project guidance)
Layer 3: Agent-to-Agent -> A2A task lifecycle + Agent Cards
Layer 2: Agent-to-Tool  -> MCP (already in use)
Layer 1: Transport      -> Local: tmux/stdio | Remote: HTTP/SSE/gRPC
Layer 0: State          -> File-based JSON (current) -> A2A task model (future)
```

### What NOT to Do

- **Do not add Kafka/RabbitMQ** for a local CLI orchestrator. This is infrastructure overkill.
- **Do not implement ANP** unless the orchestrator needs to discover agents across the open internet.
- **Do not abandon file-based state** -- it provides crash recovery that in-memory solutions lack.
- **Do not force A2A for local agent communication** -- the protocol overhead is unnecessary when agents share a filesystem.

---

## Appendix: Key Links

### Specifications
- [A2A Protocol Spec](https://a2a-protocol.org/latest/specification/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [ANP White Paper](https://www.agent-network-protocol.com/specs/white-paper.html)
- [WebMCP Spec](https://webmachinelearning.github.io/webmcp/)
- [OpenTelemetry GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)

### Governance
- [Agentic AI Foundation (AAIF)](https://aaif.io/)
- [A2A GitHub](https://github.com/a2aproject/A2A)
- [ANP GitHub](https://github.com/agent-network-protocol/AgentNetworkProtocol)

### Implementation References
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Google ADK with A2A](https://google.github.io/adk-docs/a2a/)
- [Microsoft Multi-Agent Reference Architecture](https://microsoft.github.io/multi-agent-reference-architecture/)

### Community
- [Traces.com - Agent Trace Sharing](https://www.traces.com/)
- [AgentMail - Agent Email Identity](https://www.agentmail.to)
