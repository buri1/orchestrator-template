# pi-mcp-adapter

> **Token-efficient MCP protocol adapter for Pi Agent — one proxy tool (~200 tokens) instead of hundreds, with lazy server loading, metadata caching, and automatic idle disconnection.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter) |
| GitHub Stars | 175 (as of 2026-03-08) |
| Publisher | nicobailon (community contributor, solo) |
| License | MIT |
| Tech Stack | TypeScript (97.6%), Node.js, MCP protocol |
| Maturity | 🟢 Production (v2.1.1, 12 releases, active development) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly solves the MCP token bloat problem we'd face when integrating Pi with our MCP-dependent tools (Chrome DevTools, Notion, etc.). Critical for keeping our orchestrator's context window clean. |
| **Novelty** | 7/10 | The single-proxy-tool pattern with lazy loading and metadata caching is a genuinely elegant solution. We haven't seen this approach in our Claude Code MCP usage. |
| **Actionable** | 7/10 | Drop-in installation via `pi install npm:pi-mcp-adapter`. Can import existing Claude Code MCP configs directly. Immediately usable at Day 60+ when we migrate. |

---

## Overview

pi-mcp-adapter solves a fundamental problem with the Model Context Protocol: tool definitions are verbose. A single MCP server can burn 10,000+ tokens just from tool schemas, and you pay that cost whether you use those tools or not. Connect a few servers (as we do with Chrome DevTools, Notion, shadcn) and you've burned half your context window before the conversation starts.

The adapter replaces all MCP tool definitions with a single proxy tool consuming ~200 tokens. When the agent needs an MCP tool, it discovers it on-demand via `mcp({ search: "screenshot" })`. Servers launch lazily on first tool call, not at startup. Metadata is cached to `~/.pi/agent/mcp-cache.json` for offline discovery, and idle servers auto-disconnect after a configurable timeout (default 10 minutes) with automatic reconnection.

This represents a 50-100x token reduction compared to native MCP integration — transformative for multi-agent setups where each spawned agent would otherwise inherit the full MCP tool payload.

---

## Technical Architecture

```
Agent Context (~200 tokens)
    │
    └── mcp() proxy tool
            │
            ├── search(query)     → Cached metadata lookup
            ├── server(name)      → List server tools
            ├── describe(tool)    → Get tool details
            └── tool(name, args)  → Execute → lazy connect → run → auto-disconnect
                                        │
                                        ├── stdio transport (npx → direct binary resolution)
                                        ├── HTTP/StreamableHTTP (SSE fallback)
                                        └── OAuth / Bearer auth
```

**Key Components:**
- **Proxy Tool:** Single `mcp()` function with search/describe/execute modes
- **Metadata Cache:** `~/.pi/agent/mcp-cache.json` — persists tool metadata for offline discovery
- **Server Lifecycle:** Three modes — lazy (default), eager (startup), keep-alive (persistent + health checks)
- **Config Import:** Reads MCP configs from Cursor, Claude Code, Claude Desktop, VS Code, Windsurf, Codex
- **npx Optimization:** Resolves npx-based servers to direct binary paths, avoiding ~143 MB npm overhead per invocation
- **Direct Tools:** Option to promote specific high-frequency tools to first-class Pi tools when proxy overhead is unwanted

**Configuration:** `~/.pi/agent/mcp.json` (global) or `.pi/mcp.json` (project-level)

---

## Publisher Background

nicobailon is one of the most prolific contributors to the Pi extension ecosystem, also responsible for pi-interactive-shell (287 stars), pi-web-access (163 stars), pi-foreground-chains (27 stars), and pi-subagents. Demonstrates deep understanding of Pi's architecture and extension system. The adapter has 175 stars and 25 forks — significant community traction for a niche extension.

---

## What's Valuable for Us

1. **Token Budget Preservation:** With our multi-agent orchestration, spawning 5 Pi agents with 3 MCP servers each would cost ~150K tokens in tool definitions alone. The adapter reduces this to ~1K tokens total. This is a non-negotiable requirement for our architecture.

2. **Config Import from Claude Code:** Direct import of our existing `.claude/mcp.json` configuration. Reduces migration friction at Day 60+.

3. **Lazy Loading Pattern:** Servers only start when actually needed. In our architecture, most agents only need 1-2 MCP servers out of the full set. Lazy loading means agents don't pay for servers they never touch.

4. **Project-Level MCP Config:** `.pi/mcp.json` per project aligns with our federated architecture — different business lines can have different MCP server sets without global contamination.

5. **Direct Tools Escape Hatch:** For high-frequency tools (like our Chrome DevTools screenshot tool), promoting to first-class avoids the proxy roundtrip while keeping everything else lazy.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **OAuth flow limitation** | OAuth tokens must be obtained externally (no in-app browser). Minor concern — most of our MCP servers use stdio transport. |
| **No cross-session sharing** | Each Pi session runs isolated MCP processes. In our tmux-based multi-agent setup, this means N copies of the same MCP server. Acceptable at our scale but would need addressing at 10+ agents. |
| **Interactive `/mcp` panel** | Nice for manual use but irrelevant for our headless orchestrator agents. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Study the proxy pattern for potential Claude Code adaptation. Could we build a similar lazy-loading MCP wrapper for our current setup?
- **Phase 3 (Days 60-90):** Install as standard Pi extension when migrating. Import Claude Code MCP configs. Test with Chrome DevTools MCP server.
- **Phase 4 (Days 90+):** Essential infrastructure for production Pi-based multi-agent deployment. Investigate cross-session MCP server sharing to reduce resource overhead.

---

## Key Takeaway

> **pi-mcp-adapter is the mandatory companion extension for any Pi deployment using MCP servers — its 50-100x token reduction transforms MCP from a context budget killer into a viable tool integration strategy for multi-agent systems.**
