# Goose

> **A local, extensible, open-source AI agent that automates engineering tasks — built by Block (Jack Dorsey), Rust-core with MCP-first extensibility, multi-model support, and custom distribution system.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [block/goose](https://github.com/block/goose) |
| GitHub Stars | 32,600+ (as of 2026-03-08) |
| Publisher | Block (bigtech — Jack Dorsey CEO, Dhanji Prasanna CTO; parent of Square, Cash App, Tidal) |
| License | Apache-2.0 |
| Tech Stack | Rust (57.3%), TypeScript (34.6%), Shell, MCP protocol, Tauri (desktop app) |
| Maturity | 🟢 Production (32.6K stars, 700+ forks, active development, backed by $80B market cap company) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Goose's MCP-first architecture is the closest to our vision of extensible, composable agent tooling. The Rust core + TypeScript UI split mirrors a performance-critical/flexibility-critical separation. Custom distributions (preconfigured extensions + branding) are directly applicable to our multi-business federated model. |
| **Novelty** | 6/10 | MCP-first agent design is the direction the industry is heading, and Goose is the best-capitalized open-source implementation. The custom distribution system and Block's collaboration with Anthropic on MCP itself add credibility. The Rust core is a differentiator for performance-sensitive orchestration. |
| **Actionable** | 5/10 | Can install and use today as a coding agent. The MCP extension ecosystem is directly relevant — any MCP server we build for Goose also works with Claude Code. Custom distributions could template our per-business-line agent configurations. But integrating Goose as a worker agent runtime requires evaluating its orchestration capabilities vs. Claude Code. |

---

## Overview

Goose is Block's (formerly Square, Jack Dorsey's company) open-source AI agent, released under Apache 2.0. It's built with a Rust core for performance and a TypeScript UI layer, designed from the ground up around the Model Context Protocol (MCP) that Block co-developed with Anthropic. Goose is not just a coding agent — it's an extensible agent framework that can automate any engineering task through MCP servers.

The architecture is intentionally modular: Goose provides the agent loop (planning, tool selection, execution, error handling), while MCP servers provide the capabilities. This means Goose can interact with any system that has an MCP server — content repositories, business applications, development environments, cloud infrastructure, and custom internal tools. Block dogfoods Goose internally across Square, Cash App, and other business lines.

Goose supports multiple LLMs (any OpenAI-compatible API, Anthropic, Google, local models), runs locally on the developer's machine (important for security-conscious organizations), and offers both CLI and desktop (Tauri) interfaces. The "Custom Distributions" feature lets organizations create preconfigured Goose variants with specific providers, extensions, and branding — essentially white-labeling the agent for different teams or business lines.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Goose Agent                          │
│  ┌────────────────────────────────────────────────┐  │
│  │         Client Layer                            │  │
│  │  CLI (terminal) │ Desktop App (Tauri)           │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Agent Core (Rust)                       │  │
│  │  Planning │ Tool selection │ Error handling │   │  │
│  │  Multi-model routing │ Context management      │  │
│  ├────────────────────────────────────────────────┤  │
│  │         MCP Layer                               │  │
│  │  stdio servers │ HTTP servers │ MCP Registry    │  │
│  │  Built-in: file ops, shell, search, git        │  │
│  │  External: any MCP-compliant server             │  │
│  ├────────────────────────────────────────────────┤  │
│  │         LLM Provider Layer                      │  │
│  │  Anthropic │ OpenAI-compatible │ Google │ Local │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │         Extension System                        │  │
│  │  MCP server integration │ Custom distributions │  │
│  │  Preconfigured providers + extensions + branding│  │
│  └────────────────────────────────────────────────┘  │
│              Rust core / TypeScript UI                 │
└───────────────────────────────────────────────────────┘
```

**Key Components:**

- **Rust Core:** The agent loop, tool execution, and performance-critical paths are in Rust (57.3% of codebase). Provides memory safety, concurrency, and low overhead — important for running multiple agent instances.
- **MCP-First Design:** All tool capabilities are exposed through MCP servers. Built-in tools (file ops, shell, search, git) are implemented as MCP servers. External capabilities are added by connecting additional MCP servers. The MCP Registry provides a discovery mechanism for available servers.
- **Custom Distributions:** Organizations can create `goose` variants with preconfigured providers, MCP servers, and branding. This is like creating a custom Linux distro but for AI agents — extremely relevant for our multi-business federated architecture.
- **Multi-Model Configuration:** Different models can be assigned for different cost/performance tradeoffs. Aligns with our 70/30 deterministic/LLM split (use cheap models for routine tasks, expensive for reasoning).
- **Local Execution:** Goose runs entirely on the developer's machine. No code leaves the local environment unless an MCP server explicitly sends it somewhere. Critical for security/compliance.
- **Modular Crates:** Rust codebase organized into modular crates (`/crates`), enabling selective compilation and potential embedding as a library.

---

## Publisher Background

Block (NYSE: XS, formerly Square) is Jack Dorsey's fintech company ($80B+ market cap) and parent of Square, Cash App, Tidal, and other businesses. Dhanji Prasanna (CTO) oversaw the Goose open-source release. Block co-developed MCP with Anthropic, giving them unique insight into the protocol's design and direction. Goose is dogfooded internally across Block's business lines.

**Risk profile:** Very strong — backed by one of the largest public tech companies. Apache 2.0 license ensures community continuity regardless of Block's priorities. No startup risk, no funding concerns. The risk is strategic abandonment (Block deprioritizes Goose if it doesn't serve internal needs), but the 700+ forks and active community provide insurance. Block's collaboration with Anthropic on MCP means Goose will likely stay current with protocol evolution.

---

## What's Valuable for Us

1. **MCP-First Architecture Pattern:** Goose proves that building an agent around MCP (rather than bolting MCP on later) creates a cleaner, more extensible system. Every capability is a server, every integration is standardized. Our worker agents already use MCP via Claude Code — Goose's approach validates this direction and shows what a purpose-built MCP agent looks like.

2. **Custom Distributions for Multi-Business:** The ability to create preconfigured Goose variants with specific providers, extensions, and branding maps directly to our federated multi-business architecture. We could create a "Gov SaaS Goose" (restricted tools, DSGVO-compliant providers) and a "Lead Gen Goose" (marketing MCP servers, analytics tools) from the same base.

3. **Rust Core for Performance:** If we ever need to run many concurrent agent instances, Goose's Rust core provides significantly better memory and CPU efficiency than Python (Aider) or Node.js (Cline/Roo Code) alternatives. Worth monitoring for high-scale orchestration scenarios.

4. **Block's MCP Co-Development:** Since Block co-created MCP with Anthropic, Goose is likely to be the first tool to implement new MCP features. Staying close to Goose's development keeps us at the frontier of MCP capabilities.

5. **Local-First Security Model:** Goose runs locally with no cloud dependencies. For our gov work (DSGVO isolation), this is the right security posture. Code never leaves the machine unless explicitly routed through an MCP server.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Not an orchestrator** | Goose is a single-agent tool. No built-in multi-agent coordination, no task delegation, no worker spawning. It's a capable worker, not an orchestration layer. |
| **Rust learning curve** | Contributing to or customizing Goose's core requires Rust expertise. Our team is TypeScript/shell-focused. Extension via MCP is easier (any language), but core modifications are harder. |
| **Desktop app focus** | The Tauri desktop app is prominent in Goose's UX. Our workflow is terminal-first. The CLI exists and works, but the desktop app gets more development attention. |
| **No direct Claude Code interop** | Can't use Goose as a drop-in replacement for Claude Code in our tmux orchestration without significant adapter work. Different tool interfaces, different context management, different permission models. |
| **Young project** | Despite Block's backing, Goose is relatively young (launched Feb 2025) with a fast-moving API surface. Production stability is less proven than Claude Code or Aider. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** Study Goose's MCP-first architecture and custom distribution system. Any MCP servers we build for Claude Code should be tested with Goose for portability validation.
- **Phase 3 (Days 60-90):** Evaluate Goose CLI as an alternative worker agent runtime. Test: spawn Goose agents via tmux alongside Claude Code agents. Compare task completion quality, cost, and reliability. The Rust core may provide better resource efficiency for running many concurrent agents.
- **Phase 4 (Days 90+):** If we adopt a multi-runtime strategy (different agent runtimes for different task types), Goose is the strongest candidate for MCP-heavy workflows. Custom distributions could template per-business-line agent configurations. The Block/Anthropic MCP collaboration ensures long-term protocol alignment.

---

## Key Takeaway

> **Goose is the most architecturally aligned open-source agent to our MCP-first, local-execution, multi-business vision — its custom distribution system and Rust core make it the top candidate for a future alternative worker agent runtime, but it's not ready to replace Claude Code in our pipeline today.**
