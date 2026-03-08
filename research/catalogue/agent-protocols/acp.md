# ACP (Agent Communication Protocol)

> **Open protocol for communication between AI agents, applications, and humans.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [github.com/i-am-bee/acp](https://github.com/i-am-bee/acp) (archived) |
| GitHub Stars | 960 (as of 2026-03-08) |
| Publisher | IBM Research / Linux Foundation (bigtech + foundation) |
| License | Apache 2.0 |
| Tech Stack | Python (77.9%), TypeScript (20.9%), REST/OpenAPI, Redis/PostgreSQL backends |
| Maturity | 🔵 Archived — merged into A2A |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | ACP is dead as a standalone protocol — merged into A2A. But its design patterns (lightweight REST, stateful sessions, trajectory metadata) live on and are worth studying. |
| **Novelty** | 4/10 | Mostly covers the same ground as A2A now. The interesting bits are the unique features ACP contributed before the merger: trajectory metadata, citation support, distributed sessions. |
| **Actionable** | 3/10 | Archived repo, no future development. Value is purely as a reference for design patterns that influenced A2A. |

---

## Overview

ACP (Agent Communication Protocol) was IBM Research's answer to agent-to-agent communication, launched in March 2025 to power their BeeAI Platform. The protocol enabled agents to exchange rich, multimodal messages (text, code, media), respond synchronously or via streaming, discover each other's capabilities, and maintain shared state across interactions.

ACP distinguished itself from Google's A2A through its emphasis on simplicity — pure REST/OpenAPI rather than JSON-RPC, making it immediately usable with any HTTP client. It also introduced features like trajectory metadata (tracking agent reasoning chains), citation metadata (source attribution), and distributed sessions across multiple server instances backed by Redis or PostgreSQL.

In August 2025, IBM pragmatically merged ACP into A2A under the Linux Foundation umbrella, recognizing that maintaining two competing agent-to-agent standards would fragment the ecosystem. The ACP repository was archived on August 27, 2025. ACP's best ideas — REST simplicity, lightweight messaging patterns, stateful conversations — are being absorbed into the A2A standard.

---

## Technical Architecture

```
┌──────────────┐     REST/OpenAPI      ┌──────────────┐
│  Agent/App   │◄────────────────────►│  ACP Server  │
│              │                       │              │
│ ┌──────────┐ │  Sync / Async /      │ ┌──────────┐ │
│ │  Client  │ │  Streaming (SSE)     │ │  Agent   │ │
│ │  SDK     │ │                       │ │  Runtime │ │
│ └──────────┘ │                       │ └──────────┘ │
└──────────────┘                       │ ┌──────────┐ │
                                       │ │  State   │ │
                                       │ │  Store   │ │
                                       │ │ (Redis/  │ │
                                       │ │  PG)     │ │
                                       │ └──────────┘ │
                                       └──────────────┘
```

**Core Abstractions:**

- **Sessions**: Stateful conversation contexts that can span multiple request/response cycles. Sessions support distributed deployment via Redis/PostgreSQL backends for high availability.
- **Messages**: Rich multimodal content units supporting text, code blocks, images, and structured data.
- **Agent Descriptors**: Capability declarations similar to A2A's Agent Cards, used for discovery and routing.
- **Trajectory Metadata**: Unique to ACP — tracks the reasoning chain of agent actions, enabling observability into multi-step agent workflows.
- **Citation Metadata**: Source attribution attached to agent responses, enabling provenance tracking.

**Communication Modes:**
- Synchronous request/response (simple REST POST)
- Asynchronous with polling
- Streaming via Server-Sent Events (SSE)

**46 releases** shipped before archival, indicating rapid iteration and a mature release cadence.

---

## Publisher Background

IBM Research developed ACP as part of their BeeAI Platform initiative. IBM has a long history in agent and AI systems research (Watson, IBM Research AI). The BeeAI team included 28+ contributors. IBM's decision to merge ACP into A2A rather than compete was pragmatic and credibility-boosting — it showed ecosystem maturity over ego. The merged contributions now live under the Linux Foundation's LF AI & Data umbrella.

---

## What's Valuable for Us

1. **REST-first simplicity**: ACP's pure REST/OpenAPI approach is simpler than A2A's JSON-RPC. For our internal agent communication (within a single business line), a lightweight REST approach might be preferable to full A2A. Worth studying ACP's API design as a reference.

2. **Trajectory metadata pattern**: Tracking the reasoning chain across agent interactions is directly relevant to our observability needs. When the orchestrator delegates to coding agents, having trajectory metadata would help diagnose failures without breaking context separation.

3. **Distributed sessions with Redis/PostgreSQL**: ACP's approach to session persistence across server instances maps to our crash-protection needs. Our tmux-based session persistence could learn from ACP's more structured approach.

4. **Citation metadata**: As our agents process research docs and produce outputs, source attribution becomes important for trust and auditability.

---

## What's NOT Relevant

- **The protocol itself as a standard**: ACP is archived. Don't build against it — use A2A instead.
- **BeeAI Platform integration**: ACP was tightly coupled to IBM's BeeAI. We don't use BeeAI and won't.
- **Python-heavy implementation**: 78% Python doesn't align with our TypeScript/shell stack. Reference the patterns, not the code.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study ACP's trajectory metadata and citation patterns for potential adoption in our orchestrator state tracking.
- **Phase 3 (Days 60-90)**: If implementing A2A endpoints, review how ACP's REST patterns were absorbed — they may offer simpler integration paths than raw JSON-RPC.
- **Phase 4 (Days 90+)**: No direct use — ACP is dead. All future investment goes into A2A.

---

## Key Takeaway

> **ACP is a dead protocol (merged into A2A in Aug 2025), but its design patterns — REST simplicity, trajectory metadata, distributed sessions, citation tracking — are worth studying as references for our own agent communication layer.**
