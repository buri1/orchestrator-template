# BridgeMCP / BridgeMind

> **MCP server that bridges your local IDE or terminal with the BridgeMind platform, giving your AI agents access to real-time project tasks, knowledge bases, and tools.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | No public GitHub repository. Proprietary SaaS product. Related: [Kibrom1/BridgeMind](https://github.com/Kibrom1/BridgeMind) (unrelated research project, 0 stars) |
| GitHub Stars | N/A — proprietary/closed-source |
| Publisher | BridgeMind AI (startup) |
| License | Proprietary (SaaS, $20/mo Pro plan) |
| Tech Stack | MCP protocol, cloud API, supports Claude Code / Cursor / Windsurf / BridgeSpace |
| Maturity | 🟡 Early (startup product, recently launched, running hackathons "Vibeathon" to build community) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | BridgeMCP solves cross-IDE agent context sharing — a real problem, but through a proprietary cloud platform. We need context sharing between agents on the same machine, not across IDEs via a cloud intermediary. |
| **Novelty** | 4/10 | The concept of a cloud-hosted shared context layer accessible via MCP is interesting but not novel — it's essentially a hosted database with MCP bindings. The cross-IDE synchronization feature is the differentiator but doesn't apply to our CLI-only setup. |
| **Actionable** | 2/10 | Proprietary, closed-source, requires subscription, cloud-dependent. We can't inspect, adapt, or self-host. The only takeaway is the concept of using MCP as a context synchronization protocol. |

---

## Overview

BridgeMCP is a proprietary MCP server from BridgeMind AI that connects local development environments (Claude Code, Cursor, Windsurf) to BridgeMind's cloud platform. The core value proposition is cross-agent context sharing: when one AI agent learns about your codebase, it writes that knowledge back to the BridgeMind server, so the next agent (potentially in a different IDE) starts with that context rather than from scratch.

BridgeMCP is part of a broader BridgeMind product suite: BridgeCode (CLI-first coding engine), BridgeVoice (privacy-first voice dictation), BridgeMCP (multi-agent collaboration via MCP), and BridgeSpace (agent-native terminal workspace). The platform positions itself as a "vibe coding & agentic coding platform."

The system operates entirely through the MCP protocol — any MCP-compatible client can connect to BridgeMCP. The server runs locally but communicates with BridgeMind's cloud API via encrypted channels using an API key. Users maintain control over what directories and commands agents can access. Task statuses and knowledge bases sync in real-time across all connected development environments.

---

## Technical Architecture

### Integration Model

```
Claude Code / Cursor / Windsurf (local)
  → BridgeMCP Server (local MCP server)
     → BridgeMind Cloud API (encrypted, API key auth)
        → Project context, tasks, knowledge base (cloud-hosted)
           → Synced back to other connected IDEs in real-time
```

### Core Features

| Feature | Description |
|---------|-------------|
| **Project Context Sync** | Agents across different IDEs share the same project context. Changes sync in real-time. |
| **Knowledge Writeback** | When an agent learns something about the codebase, it writes findings back to the cloud server. |
| **Task Management** | Project tasks accessible via MCP tools. Agents can read/update task status. |
| **Agent Configurations** | Pre-configured agent personas/roles accessible via MCP. |
| **Cross-IDE Support** | Claude Code, Cursor, Windsurf, BridgeSpace — any MCP-compatible client. |

### Setup

1. Create BridgeMind account
2. Generate API key from dashboard
3. Configure MCP server with API key via Authorization header
4. Restart AI tool to apply configuration

### Pricing

| Plan | Price | Includes |
|------|-------|----------|
| Free | $0 | BridgeCode only |
| Pro | $20/mo ($16/mo annual) | BridgeCode + BridgeMCP + BridgeSpace + BridgeVoice + Premium Skills + Prompt Library |

---

## Publisher Background

**BridgeMind AI** is a startup building a "vibe coding & agentic coding platform." The company is in early stage — they're running hackathons ("Vibeathon") to build community, maintaining documentation at docs.bridgemind.ai, and have a 2026 product roadmap published. No public funding information available. The team appears small. The GitHub presence is minimal — the Kibrom1/BridgeMind repository (0 stars, no license, last pushed Nov 2025) appears to be an unrelated research project, not the official company repository. The official product is closed-source SaaS.

---

## What's Valuable for Us

### 1. MCP as Context Synchronization Protocol (Concept Only)

The idea of using MCP not just for tool invocation but for context synchronization between agents is architecturally interesting. If we wanted our agents to share learned context (architectural decisions, bug patterns, codebase knowledge), an MCP server exposing read/write context tools would be a clean approach. But we'd build this ourselves, not use BridgeMCP.

### 2. Knowledge Writeback Pattern (Concept Only)

The concept of agents writing discoveries back to a shared knowledge store — so the next agent doesn't start cold — addresses our context loss problem during conversation compaction and agent restarts. This is the same pattern as Agent-MCP's memory bank but implemented via a cloud service.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **Proprietary/closed-source** | Cannot inspect, fork, or self-host. Vendor lock-in with a small startup. |
| **Cloud dependency** | All context goes through BridgeMind's cloud API. We operate locally. Adding cloud dependency to our orchestrator contradicts our architecture principles. |
| **$20/mo subscription** | Ongoing SaaS cost for a feature we can build with a JSON file + MCP server. |
| **Cross-IDE focus** | We use Claude Code exclusively. Context sharing between Cursor/Windsurf/Claude Code is irrelevant. |
| **"Vibe coding" positioning** | Marketing-heavy, substance-light. "Vibe coding" is a trend label, not an architectural pattern. |
| **No GitHub/open-source** | No public code to evaluate, adapt, or learn from. |
| **Early startup risk** | Small team, no visible funding, hackathon-driven community building. High risk of platform discontinuation. |
| **DSGVO/data sovereignty** | Sending project context to a third-party cloud API is a non-starter for our government contract work (DSGVO isolation requirement). |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** None.
- **Phase 2 (Days 4-60):** None. The cloud dependency makes this unsuitable regardless of phase.
- **Phase 3 (Days 60-90):** If we need persistent agent context sharing, build it ourselves — a local MCP server exposing read/write context tools backed by a JSON file or SQLite. BridgeMCP's concept without the cloud dependency.
- **Phase 4 (Days 90+):** If BridgeMind opens up self-hosting or open-sources BridgeMCP, revisit. Until then, irrelevant.

---

## Key Takeaway

> **BridgeMCP's concept of MCP-as-context-sync between agents is worth noting, but the proprietary cloud dependency, $20/mo cost, lack of source code, and DSGVO incompatibility make it a non-starter — we'd build the same pattern locally with a JSON-backed MCP server in an afternoon.**
