# Agent Relay

> **Real-time messaging between AI agents.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [AgentWorkforce/relay](https://github.com/AgentWorkforce/relay) |
| GitHub Stars | 569 (as of 2026-03-08) |
| Publisher | Agent Workforce Incorporated / Khaliq Gant (startup) |
| License | Apache-2.0 |
| Tech Stack | Rust (broker binary), TypeScript 63.9% (SDK/CLI), Python 4.1% (SDK), WebSocket (Relaycast cloud) |
| Version | v3.1.12 (npm `@agent-relay/sdk`) |
| Maturity | 🟢 Production (v3.x, 2,589 commits, Rust broker rewrite, active daily pushes, 42 forks) |
| Last Analyzed | 2026-03-08 (deep analysis — ARCHITECTURE.md + full codebase) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | This is not just a messaging layer — it's a full agent lifecycle system with a Rust broker managing PTY sessions, MCP tool integration, idle detection, and a DAG workflow engine. They solved the exact tmux problem we have and moved to native PTY. The MCP-based communication pattern (agents call `relay_send()` as a tool) is cleaner than our terminal injection approach. Directly maps to Blueprint principles #2 (deterministic orchestration) and #6 (thin meta-layer). Bumped from 7 after deep architecture review. |
| **Novelty** | 8/10 | The Rust broker wrapping CLI agents in PTY sessions with MCP tool injection is a genuinely novel architecture we haven't seen elsewhere in the catalogue. They independently solved the tmux-to-PTY migration we haven't attempted yet. The idle-detection-before-injection pattern and hash-based message deduplication are production-hardened patterns we lack. |
| **Actionable** | 7/10 | Three concrete adoption paths: (1) steal the PTY-over-tmux pattern for our broker, (2) adopt MCP tools for inter-agent messaging instead of terminal capture, (3) study the idle detection + injection timing logic. The DAG workflow engine (`WorkflowBuilder`) is also directly usable. Bumped from 6 — the Rust broker is `curl`-installable as a single binary. |

---

## Overview

Agent Relay is a real-time agent-to-agent communication system that has evolved well beyond a simple messaging layer. At v3.1.12 with 2,589 commits, it now comprises a Rust broker binary that manages agent CLI processes in native PTY sessions, a TypeScript SDK for programmatic orchestration, a cloud WebSocket routing service (Relaycast), and a DAG-based workflow engine. The system supports Claude, Codex, Gemini, Aider, and Goose CLIs.

The core architectural insight is that AI agents can communicate by invoking MCP tools (`relay_send`, `relay_spawn`, `relay_who`, `relay_inbox`) provided by the broker, rather than parsing terminal output or injecting text into sessions manually. This eliminates the parsing ambiguity problem entirely — agents make structured tool calls with typed parameters, and the broker routes messages through Relaycast's cloud WebSocket service. Message delivery uses idle detection (configurable threshold, default 30s) to wait for agent silence before injecting incoming messages into the recipient's PTY stdin.

The project made an explicit architectural decision to move from tmux to native PTY sessions via Rust's `portable-pty` crate, eliminating the tmux dependency entirely. This is directly relevant to our orchestrator — they encountered the same tmux pain points (dependency management, output capture reliability, session lifecycle) and solved them with a compiled broker binary. The broker handles ANSI stripping, CLI-specific injection quirks, hash-based message deduplication, and automatic WebSocket reconnection with backoff.

---

## Technical Architecture

### 5-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: CLI Interface (src/cli/)                              │
│  Commands: up, down, status, spawn, bridge, doctor              │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Broker (Rust binary — agent-relay-broker)             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │ PTY Manager   │ │ MCP Tools     │ │ Relaycast WS  │        │
│  │ (portable-pty)│ │ (relay_send)  │ │ (Cloud route) │        │
│  └───────────────┘ └───────────────┘ └───────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: SDK (packages/sdk/)                                   │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │ Client        │ │ Workflows     │ │ Relay Adapter │        │
│  │ (Stdio JSON)  │ │ (DAG runner)  │ │ (High-level)  │        │
│  └───────────────┘ └───────────────┘ └───────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Storage (packages/storage/)                           │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │ JSONL Adapter │ │ Memory Adapter│ │ DLQ Adapter   │        │
│  └───────────────┘ └───────────────┘ └───────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 5: Dashboard (packages/dashboard/) — Next.js + WebSocket │
└─────────────────────────────────────────────────────────────────┘
```

### MCP Tool Protocol (how agents communicate)

| Tool | Description |
|------|-------------|
| `relay_send(to, message)` | Send direct message, broadcast (`*`), or channel (`#channel`) |
| `relay_spawn(name, cli, task)` | Spawn a worker agent |
| `relay_release(name)` | Release a worker agent |
| `relay_who()` | List connected agents |
| `relay_inbox()` | Check incoming messages |
| `relay_status()` | Check connection status |

### Broker Stdio Protocol (SDK <-> Broker)

```json
// Request (SDK → Broker)
{ "id": "uuid", "method": "spawn_pty", "params": { "name": "Worker", "cli": "claude" } }

// Response (Broker → SDK)
{ "id": "uuid", "result": { "ok": true } }

// Event (Broker → SDK)
{ "event": "agent_idle", "data": { "name": "Worker", "idle_secs": 30 } }
```

### Message Flow (End-to-End)

```
Alice (Agent)          Broker (Rust)         Relaycast (Cloud)     Bob (Agent)
  │                      │                    │                    │
  │── relay_send() ─────▶│                    │                    │
  │  (MCP tool call)     │── hash dedup ─────▶│                    │
  │                      │── WebSocket msg ──▶│                    │
  │                      │                    │── WebSocket msg ──▶│ Bob's broker
  │                      │                    │                    │
  │                      │                    │     idle detection  │
  │                      │                    │     (30s default)   │
  │                      │                    │     inject into PTY │
  │                      │                    │     stdin + Enter   │
```

### Key Implementation Details

1. **PTY over tmux**: Uses Rust `portable-pty` for cross-platform PTY management. Explicit decision documented: eliminates tmux dependency, provides direct I/O control, works on Windows.
2. **ANSI stripping**: Output stripped of escape codes before pattern matching.
3. **Hash-based dedup**: `DedupCache` prevents re-sending identical messages.
4. **Idle detection**: Configurable threshold (default 30s) monitors agent output silence before injecting incoming messages.
5. **CLI-specific handlers**: Different injection strategies for Claude, Codex, Gemini, Aider, Goose.
6. **DAG Workflow Engine**: `WorkflowBuilder` in SDK supports YAML templates, step dependencies, output chaining via `{{steps.X.output}}`.

### Storage

```
.agent-relay/
├── credentials/             # Auth tokens
├── state.json               # Broker state (agents, channels)
└── pending/                 # Pending deliveries
```

Storage uses a `StorageAdapter` interface with JSONL, Memory, and DLQ (dead-letter queue) implementations.

### Supported CLIs

Claude, Codex, Gemini, Aider, Goose — each with CLI-specific injection handling.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_RELAY_DASHBOARD_PORT` | 3888 | Dashboard HTTP port |
| `RELAY_AGENT_NAME` | - | Agent name for broker registration |
| `RELAY_API_KEY` | - | Relaycast workspace API key |
| `RELAY_BASE_URL` | `https://api.relaycast.dev` | Relaycast API base URL |
| `RELAY_CHANNELS` | `general` | Comma-separated channel list |

### Additional Packages

| Package | Purpose |
|---------|---------|
| `packages/acp-bridge/` | ACP protocol bridge for editors |
| `packages/hooks/` | Hook system for events |
| `packages/telemetry/` | Usage analytics |
| `packages/trajectory/` | Work trajectory tracking |
| `packages/memory/` | Agent memory persistence |
| `packages/policy/` | Policy enforcement |
| `packages/user-directory/` | Agent directory management |

---

## Publisher Background

**Agent Workforce Incorporated** is a startup led by **Khaliq Gant** (`@khaliqgant`, 1,629 of 2,589 commits — 63% of codebase). Khaliq has 82 public repos and a focused presence on the agent-communication problem. The second-largest contributor is `claude` (354 commits), indicating heavy use of Claude Code for development — they eat their own dogfood.

**Will Washburn** (`@willwashburn`, 116 commits) is the second human contributor. The team is small (2-3 humans + Claude), which is exactly the team size our Blueprint recommends (Principle #4: 2-3 agents max).

The repo has an `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` — indicating they've embraced the agent-instructions-as-code pattern we also champion. The `openclaw-web/` directory suggests a connection to the OpenClaw project (Elvis Sun's ecosystem — a known benchmark person in our research).

Active development: 2,589 commits, pushed within hours of analysis, 569 stars, 42 forks, dedicated Discord community. Copyright 2026, Apache-2.0 licensed.

---

## What's Valuable for Us

### 1. PTY-Over-Tmux Migration Pattern (HIGH VALUE)

They independently faced our exact problem — tmux as the agent process manager — and documented their explicit decision to replace it with native PTY sessions via Rust's `portable-pty`. Their rationale maps perfectly to our pain points:
- Eliminates tmux as a dependency
- More direct control over agent I/O
- Better process lifecycle management
- Cross-platform (including Windows)

This is the strongest validation yet that our tmux approach is a stepping stone, not an endpoint.

### 2. MCP Tools for Agent Communication (HIGH VALUE)

Instead of parsing terminal output or injecting text blindly, agents call structured MCP tools (`relay_send`, `relay_who`, `relay_inbox`). This eliminates:
- Line-wrapping / ANSI code parsing issues we fight constantly
- Ambiguous output pattern matching
- Multi-line message fragmentation

This directly implements Blueprint Principle #2 (deterministic orchestration): the routing is structured tool calls, not LLM-interpreted text scraping.

### 3. Idle Detection Before Injection (MEDIUM VALUE)

Their configurable idle threshold (monitor agent output silence, then inject) is a production-hardened version of our crude `terminal-wait` approach. The event-driven idle detection (`onAgentIdle` callback with `idleSecs`) is cleaner than our polling loop.

### 4. Hash-Based Message Deduplication (MEDIUM VALUE)

The `DedupCache` preventing re-delivery of identical messages is a pattern we need but haven't implemented. In our tmux approach, we sometimes see duplicate message processing when capture-pane reads overlap.

### 5. DAG Workflow Engine (MEDIUM VALUE)

The `WorkflowBuilder` with YAML templates and `{{steps.X.output}}` chaining provides a lightweight alternative to our manual task decomposition. Worth studying for Phase 2 when we need repeatable multi-agent workflows.

### 6. CLI-Specific Injection Handlers (LOW-MEDIUM VALUE)

They maintain per-CLI injection strategies for Claude, Codex, Gemini, Aider, Goose. If we ever support multiple CLI backends, this is the reference implementation.

---

## What's NOT Relevant

| Aspect | Why Not Relevant | Blueprint Principle |
|--------|-----------------|---------------------|
| **Relaycast cloud dependency** | All messages route through their cloud WebSocket service. We need local-first operation (gov contracts, DSGVO). Internet dependency is a dealbreaker for production. | #6: Federated systems, no cloud lock-in |
| **Workspace-based multi-tenancy** | Their cloud isolation model doesn't match our per-business-line federation. We isolate at the git worktree / file system level. | #6: Federated with thin meta-layer |
| **Dashboard / Next.js web UI** | Additional web infrastructure to maintain. We monitor via terminal and state files. | #7: Build only what you've needed |
| **Telemetry / trajectory packages** | Usage analytics and work tracking are nice-to-have but not in our 60-day roadmap. | #7: Build only what you've needed |
| **Multi-CLI support (Codex/Gemini/Aider/Goose)** | We're Claude-only. Supporting 5 CLIs adds complexity without value for us. | #3: Context is zero-sum |
| **ACP bridge for editors** | Editor integration is outside our headless terminal workflow. | Not needed |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No adoption. But study `src/main.rs` PTY management and the MCP tool protocol as reference architecture for our own broker evolution.
- **Phase 2 (Days 4-60):** **Primary evaluation window.** If tmux-based communication becomes a bottleneck, prototype a local Rust broker (steal their PTY + idle detection pattern) WITHOUT the Relaycast cloud dependency. The MCP tool approach for agent messaging could be implemented independently using our existing tmux infrastructure as a transport layer. Study the `WorkflowBuilder` for repeatable multi-agent task patterns.
- **Phase 3 (Days 60-90):** If scaling to multi-client deployments, evaluate whether a self-hosted Relaycast equivalent provides value. The channel-based routing (`#channel` addressing) would map well to per-client isolation.
- **Phase 4 (Days 90+):** If building distributed orchestration across machines, Agent Relay (or a fork with self-hosted routing) becomes the strongest candidate for the communication backbone. The 5-layer architecture is clean enough to adopt wholesale.

---

## Key Takeaway

> **Agent Relay has evolved from a simple messaging layer into a production-grade agent lifecycle system with a Rust broker, native PTY management, and MCP-based communication — they independently solved the tmux-to-PTY migration we face and provide the reference architecture for our own broker evolution, though their cloud routing dependency (Relaycast) means we should steal patterns, not adopt wholesale.**
