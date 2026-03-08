# ANP (Agent Network Protocol)

> **An open source protocol defining how agents connect with each other, building an open, secure, and efficient collaboration network for billions of intelligent agents.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [github.com/agent-network-protocol/AgentNetworkProtocol](https://github.com/agent-network-protocol/AgentNetworkProtocol) |
| GitHub Stars | 1,200 (as of 2026-03-08) |
| Publisher | ANP Open Source Community / GaoWei Chang (solo → community) |
| License | Apache 2.0 |
| Tech Stack | HTML (specs), Python (AgentConnect SDK), W3C DID, Semantic Web |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | ANP is ambitious but over-engineered for our needs. Decentralized identity (DID) and semantic web are heavy infrastructure we don't need. A2A covers agent-to-agent communication without this complexity. |
| **Novelty** | 6/10 | The three-layer architecture (identity → meta-protocol → application) is a clean separation. The meta-protocol negotiation layer — where agents dynamically agree on HOW to communicate — is a genuinely interesting idea we haven't seen elsewhere. |
| **Actionable** | 2/10 | Too early-stage and too complex to adopt. No TypeScript SDK, Python-only. The ideas are interesting but the implementation is not production-ready for our stack. |

---

## Overview

ANP (Agent Network Protocol) positions itself as "the HTTP of the Agentic Web era" — an ambitious open-source protocol aiming to create a decentralized communication infrastructure for billions of intelligent agents. Where A2A focuses on practical agent-to-agent task handoff, ANP tackles the deeper infrastructure layer: decentralized identity, encrypted communication, dynamic protocol negotiation, and agent discovery.

The protocol uses a three-layer architecture: (1) Identity & Encrypted Communication based on W3C Decentralized Identifiers (DID), (2) a Meta-Protocol Negotiation layer where agents dynamically agree on communication protocols, and (3) an Application Protocol layer using semantic web specifications for capability description. This layered approach is intellectually elegant but adds significant complexity compared to A2A's simpler model.

ANP has a dedicated community (16 GitHub repos, Discord, regular updates) but significantly less industry backing than A2A. It's primarily driven by GaoWei Chang and a small open-source community rather than big tech sponsors. The protocol has academic/research flavor — the specification documents read more like white papers than API docs.

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│              Application Layer               │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │ Agent Description│  │ Agent Discovery │   │
│  │ Protocol (ADP)   │  │ Protocol        │   │
│  └─────────────────┘  └─────────────────┘   │
├─────────────────────────────────────────────┤
│           Meta-Protocol Layer                │
│  ┌─────────────────────────────────────┐    │
│  │ Dynamic Protocol Negotiation         │    │
│  │ (agents agree on HOW to communicate) │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│     Identity & Encrypted Communication       │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │ W3C DID-based   │  │ End-to-End      │   │
│  │ Identity         │  │ Encryption      │   │
│  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────┘
```

**Six Core Specifications:**

1. **Technical White Paper** — Foundational architecture and vision
2. **DID:WBA Method Specification** — Decentralized identity using W3C DID standards, with web-based anchoring (no blockchain required)
3. **Communication Meta-Protocol** — How agents negotiate which protocol to use for a given interaction
4. **Agent Description Protocol (ADP)** — Semantic capability declarations (richer than A2A Agent Cards)
5. **Agent Discovery Protocol** — How agents find each other on the network
6. **Peer-to-Peer Transaction Specification** — Direct agent-to-agent exchanges without intermediaries

**Key Design Decisions:**

- **Decentralized Identity**: Every agent gets a W3C DID, enabling cross-platform identity without a central registry. This is more complex than A2A's approach but more resilient.
- **Meta-Protocol Negotiation**: Instead of mandating a single wire protocol, agents negotiate what protocol to use. This is flexible but adds a negotiation round-trip.
- **Semantic Web Foundation**: Capability descriptions use semantic web technologies for machine-readable interoperability. This is powerful but heavy.
- **No Blockchain Required**: Despite using DIDs, ANP's DID:WBA method uses web-based anchoring, avoiding blockchain dependency.

**SDK: AgentConnect**
- Python-based reference implementation
- Available at [github.com/agent-network-protocol/AgentConnect](https://github.com/agent-network-protocol/AgentConnect)
- Implements the three-layer protocol stack

---

## Publisher Background

ANP was created by GaoWei Chang and has grown into a small open-source community (ANP Open Source Community on GitHub, 16 repositories). The project has an academic/research orientation — the specifications are written as formal documents with white paper styling. Compared to A2A (Google + Linux Foundation + 50 partners) or even ACP (IBM Research), ANP lacks institutional backing. The community is active (Discord, regular commits through Feb 2026) but small. The repository migrated from `chgaowei/AgentNetworkProtocol` to the organization account, indicating professionalization.

---

## What's Valuable for Us

1. **Meta-protocol negotiation concept**: The idea that agents dynamically negotiate HOW to communicate (rather than mandating a single protocol) is intellectually interesting. In a federated architecture with diverse business lines, some might use A2A, others might use simpler REST. A meta-protocol layer could bridge them. Worth studying as a design pattern even if we don't adopt ANP itself.

2. **Three-layer separation**: The clean separation of identity, negotiation, and application layers is a good architectural pattern. Our orchestrator could benefit from thinking about agent identity as a distinct concern from agent communication.

3. **DID-based agent identity**: For Phase 4+ when we interact with external agents, decentralized identity eliminates the need for a central agent registry. Each agent has a self-sovereign identity. This is overkill now but may matter in a multi-tenant agent economy.

4. **Comparison articles**: ANP has published detailed comparisons with A2A and MCP that clarify the protocol landscape. These are useful reference material.

---

## What's NOT Relevant

- **The full protocol stack**: Three layers of infrastructure is too much complexity for our current needs. A2A covers 90% of our agent-to-agent requirements with 20% of the complexity.
- **Semantic web technologies**: We don't need RDF/OWL-style capability descriptions. JSON schemas and simple capability lists are sufficient for our agents.
- **Python-only SDK**: No TypeScript support. Our stack is TypeScript/shell. Would need to build our own client.
- **"Billions of agents" vision**: We're running 2-6 agents in parallel. The planetary-scale networking vision is irrelevant to our near-term work.
- **W3C DID complexity**: Managing decentralized identifiers adds operational overhead we don't need when our agents are all within our own infrastructure.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: No action. Too early-stage and too complex.
- **Phase 3 (Days 60-90)**: Read ANP's comparison articles (ANP vs A2A vs MCP) for protocol selection insights.
- **Phase 4 (Days 90+)**: If the agent economy requires decentralized agent identity (agents from different orgs interacting without a central registry), revisit ANP's DID:WBA method. More likely: A2A will absorb these ideas, just as it absorbed ACP.

---

## Key Takeaway

> **ANP is an ambitious "HTTP for agents" protocol with elegant three-layer architecture, but it's over-engineered for our needs and lacks the industry backing of A2A — monitor for interesting ideas (meta-protocol negotiation, DID identity) but don't adopt.**
