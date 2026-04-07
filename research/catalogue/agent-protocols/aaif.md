# AAIF (Agentic AI Foundation)

> **A neutral, open foundation under the Linux Foundation ensuring agentic AI evolves transparently and collaboratively, anchored by MCP, goose, and AGENTS.md**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [github.com/aaif](https://github.com/aaif) (org with multiple repos) |
| GitHub Stars | landscape: 33, technical-committee: 1 (as of 2026-03-08) |
| Publisher | Linux Foundation — consortium (bigtech coalition) |
| License | Apache-2.0 |
| Tech Stack | Standards body — not a runtime. Founding projects: MCP (TypeScript/Python), goose (Rust/Python), AGENTS.md (Markdown spec) |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | AAIF is a governance/standards body, not a tool we'd adopt directly. However, it houses MCP which we already use heavily, and AGENTS.md which we already implement. The real value is tracking where these standards go — not adopting AAIF itself. |
| **Novelty** | 4/10 | We already know and use MCP. We already know goose and AGENTS.md. The novelty is the political consolidation under Linux Foundation governance, not technical innovation. |
| **Actionable** | 3/10 | Nothing to adopt today. It's a standards body. The actionable parts (MCP, AGENTS.md) we already use. Watch for future standards that might affect interop. |

---

## Overview

The Agentic AI Foundation (AAIF) was announced on December 9, 2025, as a Linux Foundation initiative to provide neutral, open governance for the most important agentic AI open-source projects. It is not a framework or SDK — it is a standards consortium that houses three founding projects: Anthropic's Model Context Protocol (MCP), Block's goose agent framework, and OpenAI's AGENTS.md specification.

The political significance is enormous: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, and OpenAI are all Platinum members, with 18 Gold members (including Datadog, Docker, IBM, JetBrains, Oracle, Salesforce) and 21 Silver members (including Hugging Face, Pydantic, Zapier). This is the first time all major AI players have agreed to co-govern agent interoperability standards under a single neutral body.

The foundation's GitHub org currently has four repos — `aaif-landscape` (a CNCF-style landscape map of the agentic AI ecosystem), `technical-committee` (governance docs), `foundation` (resources), and `.github` (profile). The Technical Committee is the governing body that will decide which new projects and standards get accepted.

---

## Technical Architecture

AAIF is not a technical system — it's a governance structure. The architecture that matters is the landscape of standards it governs:

```
AAIF (Linux Foundation)
├── MCP (Model Context Protocol)
│   ├── Server/client architecture for tool integration
│   ├── 10,000+ MCP servers in ecosystem
│   └── Already used in our orchestrator
├── goose (Block)
│   ├── Local-first agent framework
│   ├── MCP-native tool integration
│   └── Rust/Python, extensible via MCP
├── AGENTS.md (OpenAI)
│   ├── Markdown-based agent instruction standard
│   ├── 60,000+ projects adopted
│   └── We already use CLAUDE.md (similar concept)
└── Technical Committee
    ├── Governs project acceptance
    ├── Sets interoperability standards
    └── 741 followers, Apache-2.0 licensed
```

The key decision: AAIF intentionally does NOT define a runtime, framework, or single agent protocol. It provides governance for multiple competing/complementary standards to co-evolve.

---

## Publisher Background

The Linux Foundation is the gold standard for open-source governance (hosts Linux, Kubernetes/CNCF, Node.js, etc.). The AAIF follows the proven model of CNCF — neutral governance with tiered corporate membership providing funding and direction. Jim Zemlin (LF Executive Director) championed the effort. The founding was driven by the recognition that MCP, goose, and AGENTS.md were already becoming de facto standards but needed formal governance to prevent fragmentation.

Key founding member affiliations: Marco De Rossi (MetaMask/Consensys), Anthropic (MCP creators), Block (goose creators), OpenAI (AGENTS.md creators).

---

## What's Valuable for Us

1. **MCP governance trajectory**: We use MCP heavily. AAIF will determine how MCP evolves — watching the Technical Committee decisions is important for staying ahead of breaking changes or new capabilities.

2. **AGENTS.md standardization**: Our `CLAUDE.md` is functionally identical. If AGENTS.md becomes the cross-vendor standard (and with 60K+ adoptions it likely will), we should consider aliasing or symlinking `AGENTS.md` alongside `CLAUDE.md` for compatibility.

3. **Landscape map**: The `aaif-landscape` repo provides a CNCF-style map of the entire agentic AI ecosystem — useful for our catalogue research.

4. **Interop signals**: When AAIF accepts new projects or standards, those become the "canonical" choices. Better to adopt early than retrofit later.

---

## What's NOT Relevant

- **goose framework**: We're Claude-first with our own orchestrator pattern. goose is an alternative agent runtime — interesting but not something we'd adopt. It would mean replacing our entire L-Thread pattern.
- **Direct AAIF membership**: We're a small operation. Membership is for enterprises and tool vendors. We consume the standards, not govern them.
- **The landscape repo itself**: It's a visualization tool, not a technical component.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Monitor Technical Committee for MCP evolution. Add `AGENTS.md` symlink alongside `CLAUDE.md` for cross-vendor agent compatibility.
- **Phase 3 (Days 60-90)**: If AAIF standardizes an agent-to-agent communication protocol (beyond MCP), evaluate whether our orchestrator inter-agent communication should adopt it.
- **Phase 4 (Days 90+)**: As we build the federated multi-business system, AAIF's interoperability standards could become important for cross-system agent communication between business lines.

---

## Key Takeaway

> **AAIF is the CNCF of agentic AI — it won't change what we build today, but the standards it blesses (especially MCP and AGENTS.md) will define the ecosystem we operate in.**
