# Pi MCP Adapter

> **Analysis of the pi-mcp-adapter extension: proxy architecture achieving 50-100x token reduction for MCP integration, lazy lifecycle management, direct-tool escape hatch, and server optimization strategies.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_pi-mcp-adapter-deep-analysis.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

The pi-mcp-adapter (v2.1.2, by Nico Bailon) is a TypeScript extension that bridges Pi Agent to the MCP ecosystem without sacrificing Pi's lean context philosophy. It replaces hundreds of tool schemas (10,000-70,000+ tokens) with a single `mcp` proxy tool costing approximately 200 tokens. When the agent needs MCP functionality, it calls the proxy tool, which searches cached metadata, connects to the relevant server on-demand, executes the tool, and disconnects after an idle timeout. This achieves a 50-100x token reduction compared to naive MCP loading while maintaining access to all tools via on-demand discovery.

The document also covers the broader MCP ecosystem in 2026, comparing MCP handling across agent harnesses (Pi, Claude Code, OpenCode, IDE-based agents), evaluating MCP versus CLI tools (with the GitHub case study as canonical example), and providing concrete integration strategies for Pi-based orchestrators. The consensus from the industry is that MCP is infrastructure for bridging AI agents to systems lacking good CLIs, not a replacement for CLIs that already exist.

The adapter introduces three lifecycle modes (lazy, eager, keep-alive), a direct-tool escape hatch for high-frequency tools, npx binary resolution saving ~143 MB memory per server, metadata caching, and subagent integration via frontmatter syntax for per-agent MCP tool declarations.

---

## Key Findings

### Proxy Architecture

The adapter exposes a single `mcp` tool to the agent (~200 tokens in system prompt). The proxy tool description includes server names and tool counts from the metadata cache (~30 extra tokens), giving the LLM ambient awareness of available servers. When the agent calls the proxy:

1. Search cached metadata for matching tools across all configured servers
2. Connect to the relevant server on-demand (lazy lifecycle)
3. Execute the requested tool
4. Return the result
5. Disconnect after idle timeout (default: 10 minutes)

### Token Economics

| Configuration | Tokens at Startup | % of 200K Context |
|---------------|-------------------|-------------------|
| Pi vanilla (no MCP) | ~200 | 0.1% |
| Pi + pi-mcp-adapter (8 servers) | ~430 | 0.2% |
| Claude Code (no MCP) | ~10,000 | 5.0% |
| Claude Code + 4 MCP servers | ~51,000 | 25.5% |
| Claude Code + 7 MCP servers | ~67,300 | 33.7% |
| Cloudflare API (traditional MCP) | ~1,170,000 | Exceeds any window |

The adapter maintains constant ~200-400 token cost regardless of how many servers are configured. Adding servers scales linearly in naive implementations but remains constant with the proxy pattern.

### Three Lifecycle Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| **lazy** (default) | No connection at startup. Connect on first use. Disconnect after idle timeout. Cached metadata keeps search working. | Most servers: filesystem, GitHub, Notion |
| **eager** | Connect at startup. No auto-reconnect. No idle timeout by default. | Servers needed early in sessions |
| **keep-alive** | Connect at startup. Auto-reconnect via health checks. No idle timeout. | Chrome DevTools during E2E testing |

### Direct Tools Escape Hatch

For high-frequency tools where proxy indirection adds friction:
- `"directTools": true` -- expose all tools from a server directly
- `"directTools": ["search_repositories", "get_file_contents"]` -- expose a curated subset
- Each direct tool costs 150-300 tokens in system prompt
- Guidance: use direct mode for targeted sets of 5-20 tools; for servers with 75+ tools, use proxy

Direct tools register from the metadata cache at `~/.pi/agent/mcp-cache.json`, requiring no server connections at startup.

### NPX Binary Resolution

Resolves `npx`-based server commands to direct binary paths, eliminating ~143 MB npm parent process per MCP server. For 5-8 MCP servers, this saves 700 MB - 1.1 GB of memory. Resolution cache persists at `~/.pi/agent/mcp-npx-cache.json`.

### MCP vs CLI: The Consensus

The 2026 industry consensus is clear: **for agents with bash access, CLI tools are almost always superior to MCP equivalents**.

| Factor | GitHub MCP | `gh` CLI |
|--------|-----------|----------|
| Token cost | 2,000-5,000 tokens | 0 tokens (model knows it) |
| Composability | Isolated tool calls | Full bash pipeline |
| Model familiarity | Custom schema at runtime | Trained on billions of examples |

**MCP is the correct choice when:** no CLI exists (browser automation, Notion, Slack), stateful interaction is required (WebSocket, streaming), structured output matters, or authentication is complex (OAuth).

### Subagent Integration

When used with pi-subagents, subagents can request specific MCP tools via frontmatter:
- `mcp:chrome-devtools` -- all tools from that server
- `mcp:github/search_repositories` -- a specific tool

This enables per-agent MCP tool isolation: the E2E tester gets Chrome DevTools, the PR manager uses `gh` CLI instead.

### Emerging Patterns

- **Cloudflare Code Mode**: Replaces tool schemas with two meta-tools (`search()` + `execute()`); model writes JavaScript against typed SDK representation. Total cost: ~1,000 tokens for an entire API.
- **Speakeasy Dynamic Toolsets**: Server-side lazy loading achieving 160x token reduction with 100% success rates.
- **Claude Code Deferred Tools**: Converged on the same architectural insight -- replace upfront loading with on-demand discovery (~85% token reduction).
- **MCP+**: Post-processing layer for tool result compression (75% reduction in output token consumption).

---

## Actionable Insights

1. **Adopt pi-mcp-adapter for all MCP integration** in orchestrator subagents. The orchestrator itself should never call MCP tools directly -- it orchestrates, delegates, and verifies.

2. **Recommended architecture**: Orchestrator (no MCP) delegates to subagents with role-specific MCP configs:
   - E2E Tester: Chrome DevTools MCP (keep-alive during testing, direct tools: take_screenshot, click, navigate_page, fill)
   - Backend/Frontend Developers: No MCP (use bash/CLI)
   - Documentation: Notion MCP (lazy, idle timeout: 5 min)

3. **Eliminate GitHub MCP** -- use `gh` CLI exclusively. 35x token reduction and better model familiarity.

4. **CLI-first, MCP-when-necessary**: Default to bash/CLI for git, GitHub, Docker, npm, HTTP. Use MCP only for browser automation, services without CLIs, and stateful interactions.

5. **Cap direct tools at 15-20 per subagent** -- beyond that, the token cost erodes Pi's context advantage.

6. **Watch Cloudflare Code Mode**: If the pattern of replacing tool schemas with code generation against typed SDKs generalizes, it could replace traditional MCP for large API surfaces entirely.

7. **Track key metrics**: MCP tokens at subagent startup (<500 target), direct tools per subagent (<20), server idle disconnects (>80% of lazy servers), CLI vs MCP ratio (>70% CLI).

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Pi Agent core entry; adapter extends Pi's capability |
| [agent-harnesses/pi-subagents.md](../agent-harnesses/pi-subagents.md) | Subagent extension with MCP frontmatter integration |
| [agent-harnesses/pi-messenger.md](../agent-harnesses/pi-messenger.md) | Alternative inter-agent communication (non-MCP) |
| [agent-harnesses/oh-my-pi.md](../agent-harnesses/oh-my-pi.md) | Fork with native MCP support (alternative to adapter) |
| [reference/pi-agent-architecture-reference.md](pi-agent-architecture-reference.md) | Pi's minimal-core philosophy that motivates the proxy pattern |
| [reference/pi-sdk-internals.md](pi-sdk-internals.md) | SDK layers enabling per-subagent MCP configuration |
| [reference/lthread-pi-migration-guide.md](lthread-pi-migration-guide.md) | MCP gap analysis for L-Thread migration |
| [reference/agent-automation-deployment.md](agent-automation-deployment.md) | Deployment contexts where MCP lifecycle management matters |
