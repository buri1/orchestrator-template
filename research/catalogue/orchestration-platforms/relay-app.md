# Agent Relay

> **Real-time messaging between AI agents.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [AgentWorkforce/relay](https://github.com/AgentWorkforce/relay) |
| GitHub Stars | 566 (as of 2026-03-08) |
| Publisher | Agent Workforce Incorporated (startup) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (primary), Python SDK, Node.js, WebSocket, supports Claude CLI + Codex CLI |
| Maturity | 🟡 Early (active development, pushed today 2026-03-08, 42 forks, growing community) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Agent Relay solves the exact problem we solve with tmux pane communication — real-time agent-to-agent messaging. TypeScript stack, Claude-native, sub-5ms latency. This is a dedicated solution for our inter-agent communication layer. |
| **Novelty** | 7/10 | Purpose-built messaging layer for AI agents is a genuinely new category. "Not a framework, just messaging" philosophy aligns with thin-layer architecture. Channel-based pub/sub for agent coordination is cleaner than our tmux capture approach. |
| **Actionable** | 6/10 | Could replace our tmux-based inter-agent communication. The SDK is npm-installable, TypeScript-native, and supports Claude CLI out of the box. However, it introduces a server dependency we don't currently have. |

---

## Overview

Agent Relay is a purpose-built real-time messaging layer for AI agent communication. Built by Agent Workforce Inc., it is explicitly "not a framework" — it's a messaging primitive that works with any CLI tool, any orchestration system, and any memory layer. The design philosophy is to do one thing well: real-time agent messaging with sub-5ms latency.

The system supports spawning agents from multiple CLI backends (Claude, Codex), organizing them into channels for topic-based communication, and providing real-time message delivery between agents. The API is intentionally minimal: spawn agents, subscribe to channels, send messages. The system also includes a dashboard for monitoring agent fleets and a visualizer for debugging agent interactions.

What makes Agent Relay notable is its focus on the communication layer specifically rather than trying to be a full orchestration platform. It provides the messaging substrate that orchestrators can build on top of — similar to how Redis provides pub/sub that applications build workflows around. This aligns with our thin-shared-layer architecture principle.

---

## Technical Architecture

### Core API

```typescript
import { AgentRelay, Models } from "@agent-relay/sdk";

const relay = new AgentRelay();

// Subscribe to messages
relay.onMessageReceived = (msg) =>
  console.log(`[${msg.from} → ${msg.to}]: ${msg.text}`);

// Spawn agents into channels
const agent = await relay.claude.spawn({
  name: "Worker1",
  model: Models.Claude.SONNET,
  channels: ["backend-team"],
  task: "Implement the API endpoint for /users",
});

// Wait for agent readiness
await relay.waitForAgentReady("Worker1");

// Send messages between agents
relay.system().sendMessage({ to: "Worker1", text: "Start." });
```

### Architecture Components

| Component | Function |
|-----------|----------|
| **Relay SDK** | TypeScript/Python client library. `npm install @agent-relay/sdk` or `pip install agent-relay-sdk` |
| **Relay Server** | Central message broker. Handles routing, channel management, agent lifecycle. |
| **Channels** | Pub/sub topics for organizing agent communication. Agents subscribe to channels. |
| **Agent Spawner** | Launches CLI agents (Claude, Codex) with task assignments and channel subscriptions. |
| **Dashboard** | Web UI for real-time monitoring, agent fleet management, communication logs. |
| **Visualizer** | Interactive visualization of agent network topology and message flows. |

### Supported CLI Backends

- **Claude** (Anthropic CLI)
- **Codex** (OpenAI CLI)

### Message Flow

```
Orchestrator
  → relay.claude.spawn({name, model, channels, task})
     → Agent starts in CLI process
        → Agent subscribes to channels
           → relay.system().sendMessage({to, text})
              → Message routed via Relay server (<5ms)
                 → Target agent receives message
                    → Agent processes and responds via channel
```

### Related Projects (same org)

| Project | Purpose |
|---------|---------|
| [relay-dashboard](https://github.com/AgentWorkforce/relay-dashboard) | Web dashboard for agent monitoring and fleet management |
| [relay-visualizer](https://github.com/AgentWorkforce/relay-visualizer) | Interactive visualization of agent network |
| Relaycast | "Headless Slack for AI agents" — async communication layer |

---

## Publisher Background

**Agent Workforce Incorporated** is a startup focused specifically on inter-agent communication infrastructure. The company maintains the Agent Relay ecosystem (core SDK, dashboard, visualizer). The organization has a clear and focused mission — building the messaging layer for AI agent teams. The repository shows active development (pushed today, 2026-03-08), growing community (42 forks, 566 stars), and a dedicated Discord community. Copyright is 2026, indicating this is a new venture built specifically for the current agentic AI wave.

---

## What's Valuable for Us

### 1. Dedicated Agent Messaging Layer

Agent Relay is exactly the kind of thin, purpose-built communication layer our architecture calls for. Instead of building agent communication into the orchestrator itself (which is what we do with tmux capture/send), Agent Relay provides it as a separate service. This aligns with our thin-shared-layer principle.

### 2. Channel-Based Agent Organization

The channel/pub/sub pattern for agent communication is cleaner than our point-to-point tmux approach:
- Agents subscribe to topic channels (e.g., "backend-team", "review")
- Multiple agents can listen to the same channel
- The orchestrator doesn't need to know individual agent pane IDs

### 3. TypeScript-Native, Claude-First

Agent Relay is TypeScript (our stack), supports Claude CLI natively, and uses npm for distribution. This is rare — most multi-agent tools are Python-first. The SDK is clean and minimal.

### 4. Sub-5ms Latency Claim

If true, this is significantly faster than our tmux capture approach (which involves shell commands, file I/O, and polling loops). For real-time agent coordination, low latency matters.

### 5. Agent Lifecycle Management

The `waitForAgentReady()` and `shutdown()` patterns provide clean lifecycle management for spawned agents — something we currently handle with tmux session probing and crude health checks.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **Server dependency** | Agent Relay requires running a relay server. We currently operate serverless (tmux on a single machine). Adding a server is additional infrastructure and a potential single point of failure. |
| **Codex integration** | We don't use OpenAI's Codex CLI. Claude-only for us. |
| **Dashboard/Visualizer** | Nice for demos but we monitor via terminal. Additional web services to maintain. |
| **Multi-machine distribution** | Agent Relay seems designed for distributed agent fleets. We run everything on one machine currently. |
| **Channel complexity** | For 2-3 agents, channels add overhead. Direct point-to-point (tmux) is simpler when agent count is small. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None — tmux communication works for current needs. But bookmark for evaluation.
- **Phase 2 (Days 4-60):** If tmux-based agent communication becomes a bottleneck (polling latency, pane management overhead), evaluate Agent Relay as a drop-in replacement. Test with `npm install @agent-relay/sdk` and compare latency/reliability.
- **Phase 3 (Days 60-90):** If scaling to multi-client deployments where agents need to communicate across projects, Agent Relay's channel system provides natural isolation (one channel per project/client).
- **Phase 4 (Days 90+):** If building a distributed orchestrator across multiple machines, Agent Relay becomes the natural communication backbone. The thin messaging layer is exactly what you'd need for federation.

---

## Key Takeaway

> **Agent Relay is the most architecturally aligned tool in this batch — a thin, TypeScript-native, Claude-first messaging layer for agent-to-agent communication that could replace our tmux-based approach when we outgrow single-machine orchestration, but introduces a server dependency we don't need today.**
