# MCP Ecosystem & Multi-Agent Orchestration

> **Assessment of Model Context Protocol maturity, key MCP servers for coding agents, A2A protocol landscape, multi-agent orchestration patterns, and strategic implications for building custom agent harnesses on Pi Agent.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | research/2026-03-05_mcp-ecosystem-orchestration.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

MCP has transformed from Anthropic's internal experiment (November 2024) to an industry-standard protocol governed by the Linux Foundation's Agentic AI Foundation (AAIF), with 97+ million monthly SDK downloads and adoption by every major AI coding tool. This document covers the full MCP ecosystem: protocol maturity and governance, tiered MCP server rankings for coding agents, the A2A protocol for agent-to-agent communication, six multi-agent orchestration patterns applicable via MCP, how three coding agents (Claude Code, OpenCode, Pi Agent) integrate MCP differently, and the protocol's fundamental limitations for orchestration.

The core tension for L-Thread on Pi Agent: Pi explicitly rejects MCP for philosophical reasons (context overhead — a single MCP server can burn 10K-18K tokens just from tool definitions), but multi-agent orchestration increasingly relies on MCP as the standard interface. The document recommends a hybrid architecture: orchestrator core stays in Pi's extension system (tmux, state, agent lifecycle), MCP access through the pi-mcp-adapter for specific high-value servers (Chrome DevTools for E2E, GitHub for PRs), and agent-to-agent communication continues via tmux terminal I/O.

The protocol landscape has settled into complementary layers: MCP for agent-to-tool (vertical), A2A for agent-to-agent (horizontal), and custom harnesses for orchestration logic. L-Thread's position as a custom orchestration layer that selectively consumes MCP tools via adapter is architecturally sound and future-compatible.

---

## Key Findings

### MCP Maturity Assessment: Production-Ready, Enterprise-Entering

**Key milestones (2024-2026):**
- Nov 2024: Anthropic releases MCP as open-source
- Early 2025: OpenAI and Google adopt MCP
- Mar 2025: Streamable HTTP transport replaces SSE
- Sep 2025: MCP Registry launches in preview
- Nov 2025: Major spec update — OAuth 2.1, async Tasks primitive, Step-Up Authorization
- Dec 2025: Anthropic donates MCP to AAIF (Linux Foundation)
- Q1 2026: A2A v1.0 stable, MCP v2.0 with Streamable HTTP + OAuth 2.1

**Scale:** 97M+ monthly SDK downloads, tens of thousands of servers, Python/TypeScript SDKs. AAIF platinum members: AWS, Anthropic, Block, Bloomberg, Cloudflare, Google, Microsoft, OpenAI.

### MCP Server Tiers for Coding Agents

**Tier 1 (Essential):**
- Filesystem MCP — file operations (low token cost)
- GitHub MCP — full GitHub API (high token cost)
- Playwright MCP — browser automation, 21 tools (~13.7K tokens)
- Sequential Thinking — multi-step reasoning for architecture

**Tier 2 (Valuable):** GitLab, Run Python, Chrome DevTools (26 tools, ~18K tokens), Docker, PostgreSQL/SQLite, Context7

**Tier 3 (Specialized):** GitMCP (any repo as MCP endpoint), Hyperbrowser (cloud BaaS with CAPTCHA solving), Firecrawl, Sentry, Linear, Slack

### The Token Budget Problem

Critical for orchestration: MCP tool definitions are verbose. Chrome DevTools MCP = 18K tokens for 26 tools. Connect a few servers and 50%+ of context is consumed before work begins. This is why Pi Agent explicitly rejects MCP and why pi-mcp-adapter exists as a workaround (~200 tokens for proxy tool vs 18K+ for direct definitions).

### Protocol Landscape (Q1 2026)

| Protocol | Created By | Purpose | Status |
|----------|-----------|---------|--------|
| MCP | Anthropic | Agent-to-Tool | v2.0 (Streamable HTTP + OAuth 2.1) |
| A2A | Google | Agent-to-Agent | v1.0 stable (100+ enterprises) |
| ACP | IBM/BeeAI | Agent messaging | Merged into A2A (Aug 2025) |

How they work together: agents use MCP to access tools internally, then A2A to communicate with other specialized agents. Linux Foundation roadmap: interoperability specification draft Q2 2026.

### Six Multi-Agent Orchestration Patterns

1. **Hub-and-Spoke** (Centralized Orchestrator) — what L-Thread implements via tmux/conduit/teams
2. **Pipeline** (Sequential Chain) — code review pipelines, CI/CD, docs generation
3. **Router** (Dynamic Dispatch) — classify requests, delegate to specialist agents
4. **Evaluator-Optimizer** (Iterative Refinement) — generate-evaluate-refine loops
5. **Competitive** (Parallel + Selection) — multiple agents solve same problem, evaluator picks best
6. **Hierarchical** (Multi-Tier Delegation) — maps to engineering team structures

Key frameworks: mcp-agent (LastMile AI), Agent-MCP (rinadelph), claude-code-mcp (steipete — "agent in your agent").

### How Coding Agents Integrate MCP

| Feature | Claude Code | OpenCode | Pi Agent |
|---------|------------|----------|----------|
| MCP Support | Native, first-class | Native, full spec | Rejected; adapter available |
| Token Efficiency | Standard (full defs) | Standard (warns about bloat) | Extreme (~200 tokens via proxy) |
| Subagents | Yes (Task tool) | Yes | Via pi-subagents extension |
| Config | `.mcp.json` | `opencode.yaml` | Extension (pi-mcp-adapter) |

### MCP Limitations for Orchestration

1. **No native agent-to-agent communication** — tool access protocol, not peer-to-peer
2. **Missing orchestration layer** — no central intelligence to coordinate across servers
3. **Token/context budget overhead** — Playwright 13.7K tokens, Chrome DevTools 18K tokens
4. **Specification maturity** — rapid evolution creates version compatibility issues
5. **Latency** — JSON-RPC adds 10-15ms per call vs direct API
6. **No state management across agent boundaries** — no conflict resolution, no context propagation
7. **Security at scale** — 53-62% of enterprises cite as top barrier (SOC2 gaps, audit trails)

### New MCP Capabilities (Nov 2025+)

- **Async Tasks Primitive** — long-running operations (SEP-1686), shifts MCP from synchronous to workflow-capable
- **Elicitation** — servers request human input (human-in-the-loop)
- **Server Identity / .well-known Discovery** — agents discover servers without connecting
- **OAuth 2.1 + Step-Up Authorization** — enterprise-grade auth
- **MCP Gateways emerging** — ContextForge (IBM), Kong AI Gateway, Microsoft MCP Gateway (K8s-native), MetaMCP

---

## Actionable Insights

1. **Use Hybrid Architecture for L-Thread on Pi**: Core orchestration in Pi extensions (tmux, state, lifecycle) + MCP via pi-mcp-adapter for specific high-value servers + tmux terminal I/O for agent communication.
2. **Token budget strategy**: Pi system prompt (~300 tokens) + pi-mcp-adapter (~200 tokens) + 2-3 promoted directTools (~2K tokens) = ~2.5K tokens vs ~52K+ for direct MCP approach. Preserves ~125K tokens for actual work.
3. **Priority MCP servers for L-Thread**: Chrome DevTools (E2E testing gate, mandatory per Rule 2), GitHub (PR management, CI status), GitMCP (documentation context), Hyperbrowser (cloud E2E for parallel testing).
4. **Watch A2A-MCP interop spec (Q2 2026)**: If it defines lightweight local agent communication patterns, consider adoption for replacing tmux-based messaging.
5. **Consider MCP gateway (MetaMCP or similar)** if required MCP servers grow beyond 5-6, to aggregate behind single endpoint.
6. **L-Thread's tmux-based agent management with file-based state is actually well-suited for local multi-agent orchestration** — neither MCP nor A2A is optimized for this use case.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent](../agent-harnesses/pi-agent.md) | Pi's deliberate MCP rejection and pi-mcp-adapter workaround are central to the strategy |
| [agent-harnesses/claude-agent-sdk](../agent-harnesses/claude-agent-sdk.md) | Claude Code has native, deep MCP integration — the comparison baseline |
| [agent-harnesses/oh-my-pi](../agent-harnesses/oh-my-pi.md) | Oh My Pi's extension model shows how MCP can be integrated as an optional module |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town accesses MCP indirectly via wrapped Claude Code agents |
| [reference/harness-agnostic-tools](harness-agnostic-tools.md) | MCP is the communication substrate for several cross-harness orchestration tools (CAO, BridgeMCP) |
| [reference/hook-event-system-comparison](hook-event-system-comparison.md) | MCP's token overhead connects to Pi's minimal system prompt philosophy |
| [reference/model-agnosticism-strategy](model-agnosticism-strategy.md) | Pi's MCP rejection parallels its minimal-prompt approach to model agnosticism |
