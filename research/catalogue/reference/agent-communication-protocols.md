# Agent Communication Protocols

> **The five-protocol stack (MCP, A2A, ACP, ANP, WebMCP) defining how agents connect to tools, talk to each other, and interact with the web -- with standardization timeline, messaging patterns, and recommendations for the L-Thread Orchestrator.**

| Field | Value |
|-------|-------|
| Category | 📚 Reference |
| Source Document | `research/2026-03-05_agent-communication-protocols.md` |
| Research Phase | Phase 1 |
| Evidence Base | A2A specification (v0.3-v1.0 DRAFT), MCP specification, ANP white paper, WebMCP W3C standard, AAIF founding documents, Gartner/Cisco/Microsoft reference architectures |
| Key Standards Bodies | Linux Foundation (AAIF, LF AI & Data), W3C, Ethereum Foundation |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

The multi-agent communication landscape has consolidated around five protocols, each addressing a distinct layer of the stack. MCP (Anthropic/AAIF) handles agent-to-tool connectivity -- databases, APIs, file systems. A2A (Google/Linux Foundation) handles agent-to-agent collaboration -- task delegation, discovery via Agent Cards, progress tracking. ACP (IBM) merged into A2A in September 2025, validating A2A as the horizontal coordination standard. ANP handles decentralized internet-scale agent discovery using W3C DID identifiers. WebMCP (Google + Microsoft/W3C) enables structured agent-to-website interaction, shipping in Chrome 146 with an 89% token efficiency improvement over screenshot-based methods.

The standardization trajectory is unprecedented: Anthropic, Google, OpenAI, Microsoft, and IBM all agreed on shared standards under neutral Linux Foundation governance within 14 months (Nov 2024 - Dec 2025). The Agentic AI Foundation (AAIF), launched December 2025 with MCP, AGENTS.md, and Goose as founding projects, signals that protocol fragmentation is ending. Gartner reports a 1,445% surge in multi-agent system inquiries from Q1 2024 to Q2 2025.

For the L-Thread Orchestrator, the current hybrid approach (file-based JSON state + tmux I/O + Claude Agent Teams) remains appropriate for local-first CLI orchestration. The recommended evolution path is to adopt A2A's task lifecycle model (`submitted` -> `working` -> `completed` / `failed` / `canceled`) as the state machine, add Agent Cards for agent discovery, and adopt OpenTelemetry GenAI semantic conventions for trace logging -- all without adding HTTP servers or message queues locally.

---

## Key Findings

### The Five-Protocol Stack

| Protocol | Owner / Governance | Purpose | Layer |
|----------|-------------------|---------|-------|
| **MCP** | Anthropic / AAIF | Agent-to-Tool connectivity | Vertical (tools, data, APIs) |
| **A2A** | Google / Linux Foundation | Agent-to-Agent collaboration | Horizontal (inter-agent) |
| **ACP** | IBM (merged into A2A Sept 2025) | REST-based agent messaging | Horizontal (merged) |
| **ANP** | Open source community | Decentralized internet-scale discovery | Network (P2P, open internet) |
| **WebMCP** | Google + Microsoft / W3C | Agent-to-Website interaction | Browser (structured web tools) |

These are complementary, not competing. The analogy is TCP/IP layers: MCP is the "application layer" for tools, A2A is the "transport layer" for agent messaging, ANP is the "network layer" for discovery.

### A2A Protocol Architecture

A2A uses standard web technologies (HTTP, SSE, JSON-RPC 2.0, gRPC as of v0.3). Its three-layer model:

1. **Data Structures** -- Agent Cards, Tasks, Messages, Artifacts, Parts
2. **Abstract Operations** -- send message, get task, cancel task, push notifications
3. **Protocol Bindings** -- JSON-RPC over HTTP, gRPC, or REST

Agent Cards are published at `/.well-known/agent.json` and serve as discovery mechanisms listing capabilities, endpoints, authentication, and content types. Tasks follow a lifecycle: `submitted` -> `working` -> `completed` / `failed` / `canceled`, with streaming via SSE and push notifications for long-running work.

### MCP vs A2A: The Key Distinction

- **MCP** = how an agent connects to tools and data (vertical integration)
- **A2A** = how agents talk to each other (horizontal coordination)

Adoption as of March 2026: MCP SDKs at 97+ million monthly downloads; A2A with 100+ enterprise supporters. Both under Linux Foundation governance.

### How Coding Agents Communicate Today

| Method | Latency | Scalability | Durability | Best For |
|--------|---------|-------------|------------|----------|
| stdin/stdout | Very low | 1:1 only | None | Subprocess/MCP stdio |
| File-based JSON | Low | Limited | Persisted | Local CLI orchestrators |
| Tmux terminal I/O | Low | Limited (panes) | Session-lived | L-Thread conduit mode |
| Shared mailbox (Agent Teams) | Low | 2-16 agents | Session-lived | Claude Code native |
| HTTP/JSON-RPC (A2A) | Medium | High | Configurable | Enterprise/cross-network |
| Message queue | Medium | Very high | Persisted | High-throughput production |

### Standardization Timeline

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

### Messaging Pattern Decision Matrix

| Factor | File | Pipes | HTTP | Queue | WebSocket | Mailbox |
|--------|------|-------|------|-------|-----------|---------|
| Setup complexity | Very Low | Low | Medium | High | Medium | Low |
| Real-time | No | Yes | SSE | Yes | Yes | Yes |
| Persistence | Yes | No | Config | Yes | No | Session |
| Scale | Low | 1:1 | High | Very High | High | 2-16 |
| Crash recovery | Good | None | Config | Good | Fair | Session |
| Cross-network | No | No | Yes | Yes | Yes | No |

### Agent-Native Communication

AgentMail (YC-backed) provides email inboxes for AI agents, using email as a universal identity and communication protocol. Email is the lowest-common-denominator protocol every system already supports -- agents with email addresses can communicate with legacy systems without new protocol adoption.

OpenTelemetry GenAI Semantic Conventions are becoming the standard for agent observability, defining span types (`create_agent`, tool calls, LLM inference), key attributes (`gen_ai.agent.id`, `gen_ai.agent.name`), and three signal types (traces, metrics, events).

---

## Actionable Insights

### For the L-Thread Orchestrator -- Immediate

1. **Keep the current hybrid approach.** File-based state + tmux I/O + Claude Agent Teams is well-suited for local-first CLI orchestration. Do not add HTTP servers or message queues for local agent coordination.

2. **Adopt AGENTS.md convention** alongside CLAUDE.md for broader tool compatibility (Cursor, Codex, Copilot).

3. **Add structured trace logging** using OpenTelemetry GenAI semantic conventions (`gen_ai.agent.id`, `gen_ai.agent.name`). Even without OTel collectors, the naming ensures future compatibility.

### For the L-Thread Orchestrator -- Medium-Term (3-6 months)

4. **Implement A2A Agent Cards** for agent discovery. Each managed agent should have a lightweight capability description. This makes the system A2A-compatible when inter-network communication is needed.

5. **Adopt A2A task lifecycle** (`submitted` -> `working` -> `completed` / `failed` / `canceled`) as the state machine model, replacing manual status tracking in JSON files.

6. **Evaluate Agent Teams as primary backend** for 2-5 agent workflows, potentially more robust than tmux terminal I/O.

### What NOT to Do

- Do not add Kafka/RabbitMQ for a local CLI orchestrator (infrastructure overkill).
- Do not implement ANP unless the orchestrator needs open-internet agent discovery.
- Do not abandon file-based state -- it provides crash recovery that in-memory solutions lack.
- Do not force A2A for local agent communication -- protocol overhead is unnecessary when agents share a filesystem.

### Recommended Protocol Stack

```
Layer 4: Application    -> AGENTS.md / CLAUDE.md (project guidance)
Layer 3: Agent-to-Agent -> A2A task lifecycle + Agent Cards
Layer 2: Agent-to-Tool  -> MCP (already in use)
Layer 1: Transport      -> Local: tmux/stdio | Remote: HTTP/SSE/gRPC
Layer 0: State          -> File-based JSON (current) -> A2A task model (future)
```

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) | Uses MCP for tool connectivity; Agent Teams implement shared mailbox pattern; stdin/stdout is the subprocess communication channel |
| [Pi Agent](../agent-harnesses/pi-agent.md) | MCP-compatible via stdio transport; skills system uses SKILL.md standard related to AGENTS.md |
| [Stripe Minions](../orchestration-platforms/stripe-minions.md) | Toolshed is a 400-tool MCP server; validates one-shot over multi-turn for reducing coordination overhead |
| [OpenClaw](../orchestration-platforms/openclaw.md) | Uses Slack/Discord/email as agent communication channels; AgentMail pattern |
| [Elvis Sun](../practitioners/elvis-sun.md) | Telegram notifications as human-in-the-loop communication; Obsidian vault as context backbone |
| [Steve Yegge](../practitioners/steve-yegge.md) | Wasteland federation model maps to A2A's decentralized agent discovery via Agent Cards |
| [Scaling Economics](./scaling-economics.md) | Coordination overhead exponent 1.724 quantifies why messaging pattern choice matters |
| [Master Blueprint](./master-blueprint.md) | Protocol stack recommendation aligns with the three-layer architecture and 70/30 deterministic/LLM split |
| [Agent Marketplace Economy](./agent-marketplace-economy.md) | A2A Agent Cards are the discovery mechanism for marketplace integration; x402 adds payment to MCP |
| [Agent Skills Systems](./agent-skills-systems.md) | SKILL.md standard and AGENTS.md are complementary project guidance formats |
