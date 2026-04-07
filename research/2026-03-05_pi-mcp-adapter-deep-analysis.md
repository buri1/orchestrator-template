# Pi-MCP-Adapter Deep Analysis: Lazy-Loading MCP for Token-Efficient Orchestration

**Deep Research Analysis -- 2026-03-05**

---

## Executive Summary

The pi-mcp-adapter by Nico Bailon (nicobailon) is a TypeScript extension for the Pi coding agent that solves one of the most persistent problems in the MCP ecosystem: tool definition bloat. By replacing hundreds of tool schemas (consuming 10,000-70,000+ tokens) with a single proxy tool (~200 tokens), the adapter enables Pi to access the full MCP ecosystem without sacrificing its lean context philosophy. Currently at version 2.1.2 on npm, the adapter introduces lazy lifecycle management, metadata caching, npx binary resolution (saving ~143 MB memory per server), and a direct-tool escape hatch for high-frequency tools. This document analyzes its architecture, compares MCP handling across agent harnesses, evaluates MCP servers for orchestration use cases, and recommends an integration strategy for a Pi-based orchestrator.

---

## Table of Contents

1. [Pi-MCP-Adapter Architecture](#1-pi-mcp-adapter-architecture)
2. [The Token Economics of MCP](#2-the-token-economics-of-mcp)
3. [MCP Handling Across Agent Harnesses](#3-mcp-handling-across-agent-harnesses)
4. [MCP Servers for Orchestration](#4-mcp-servers-for-orchestration)
5. [MCP vs CLI: The GitHub Case Study](#5-mcp-vs-cli-the-github-case-study)
6. [The MCP Ecosystem in 2026](#6-the-mcp-ecosystem-in-2026)
7. [Token Budget Optimization Strategies](#7-token-budget-optimization-strategies)
8. [Integration Strategy for Pi-Based Orchestrator](#8-integration-strategy-for-pi-based-orchestrator)
9. [Recommendations](#9-recommendations)

---

## 1. Pi-MCP-Adapter Architecture

### The Core Problem

Pi's philosophy is radical minimalism: ~200-token system prompt, 4 core tools (`read`, `write`, `bash`, `edit`), and TypeScript in-process extensions. This architecture gives Pi a massive context window advantage over competitors. However, the MCP ecosystem -- with servers like Playwright (21 tools, ~13,700 tokens), Chrome DevTools (18,000+ tokens), and GitHub (dozens of tools) -- threatens to destroy that advantage. Loading even 4-5 MCP servers directly can consume 50,000+ tokens before a single user message.

The pi-mcp-adapter resolves this tension by acting as a proxy layer between Pi and the MCP server ecosystem.

### Proxy Architecture

The adapter exposes a **single `mcp` proxy tool** to the agent. This tool costs approximately 200 tokens in the system prompt (name + description + minimal schema). When the agent needs MCP functionality, it calls this proxy tool with a search query or a specific tool invocation. The proxy then:

1. **Searches** cached metadata to find matching tools across all configured servers
2. **Connects** to the relevant server on-demand (lazy lifecycle)
3. **Executes** the requested tool
4. **Returns** the result to the agent
5. **Disconnects** after an idle timeout (default: 10 minutes)

The proxy tool description includes server names and tool counts drawn from the metadata cache (~30 extra tokens), so the LLM has ambient awareness of what servers are available without needing to issue a search call first.

### Three Lifecycle Modes

The adapter supports three connection lifecycle strategies per server:

| Mode | Behavior | Use Case |
|------|----------|----------|
| **lazy** (default) | No connection at startup. Connect on first tool call. Disconnect after idle timeout. Cached metadata keeps search/list working without live connections. | Most servers -- filesystem, GitHub, Notion |
| **eager** | Connect at startup. No auto-reconnect if connection drops. No idle timeout by default. | Servers needed early in sessions |
| **keep-alive** | Connect at startup. Auto-reconnect via health checks. No idle timeout. | Servers that must always be live -- Chrome DevTools during E2E testing |

### Direct Tools Escape Hatch

For high-frequency tools where the proxy indirection adds friction, the adapter supports a `directTools` configuration:

- `"directTools": true` -- expose all tools from a server directly in the agent's tool list
- `"directTools": ["search_repositories", "get_file_contents"]` -- expose a curated subset
- Per-server overrides of the global setting

Each direct tool costs 150-300 tokens in the system prompt. The guidance is clear: use direct mode for targeted sets of 5-20 tools. For servers with 75+ tools, stick with the proxy or cherry-pick specific tools.

Direct tools register from the metadata cache at `~/.pi/agent/mcp-cache.json`, so no server connections are needed at startup. On first use of a new server, tools fall back to proxy-only while the cache populates in the background.

### NPX Binary Resolution

A notable optimization: the adapter resolves `npx`-based server commands to direct binary paths, eliminating the ~143 MB npm parent process per MCP server. For an orchestrator running 5-8 MCP servers, this saves approximately 700 MB - 1.1 GB of memory overhead. The resolution cache persists at `~/.pi/agent/mcp-npx-cache.json`.

### Configuration

Configuration follows Pi's convention with JSON files at two levels:

- **Global**: `~/.pi/agent/mcp.json`
- **Project**: `.pi/mcp.json` in the project root (overrides global)

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/chrome-devtools-mcp"],
      "lifecycle": "keep-alive",
      "directTools": ["take_screenshot", "click", "navigate_page"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem"],
      "lifecycle": "lazy",
      "idleTimeout": 15
    }
  }
}
```

### Subagent Integration

When used alongside the pi-subagents extension (also by nicobailon), subagents can request specific MCP tools in their frontmatter using `mcp:` prefixed syntax:

- `mcp:chrome-devtools` -- all tools from that server
- `mcp:github/search_repositories` -- a specific tool from a server

This is architecturally significant for orchestration: it means each spawned subagent can declare exactly which MCP capabilities it needs, and only those tools are loaded into that subagent's context.

### Additional Quality-of-Life Features

- **Fuzzy tool name matching**: hyphens and underscores are treated as equivalent (e.g., `resolve_library_id` finds `resolve-library-id`)
- **Error guidance**: when a server is identified but the tool is not found, the error response lists available tools for self-correction
- **In-flight tracking**: prevents server disconnect mid-request
- **Unified search**: results include both MCP tools and Pi native tools, with Pi tools appearing first with a `[pi tool]` prefix

---

## 2. The Token Economics of MCP

Understanding why the adapter matters requires understanding how MCP consumes context.

### Where Tokens Go

MCP token consumption occurs at two points:

1. **Tool definitions** loaded into the system prompt at session initialization (the dominant cost)
2. **Tool results** injected into the conversation when tools are invoked

The first category is the killer. Every configured MCP server dumps its complete tool schemas -- names, descriptions, parameter schemas with types, constraints, and examples -- into the context window at startup. This happens regardless of whether the tools are ever used.

### Real-World Token Costs

| Configuration | Tokens at Startup | % of 200K Context |
|---------------|-------------------|-------------------|
| Pi vanilla (no MCP) | ~200 | 0.1% |
| Pi + pi-mcp-adapter (8 servers) | ~430 | 0.2% |
| Claude Code (no MCP) | ~10,000 | 5.0% |
| Claude Code + 4 MCP servers | ~51,000 | 25.5% |
| Claude Code + 7 MCP servers | ~67,300 | 33.7% |
| Cloudflare API (traditional MCP) | ~1,170,000 | Exceeds any context window |
| Cloudflare API (Code Mode) | ~1,000 | 0.5% |

The pi-mcp-adapter achieves a **50x-100x reduction** compared to naive MCP loading, and it does so while maintaining access to all tools via on-demand discovery.

### The Scaling Problem

Every additional MCP server adds linearly to context consumption in naive implementations. An orchestrator that needs Chrome DevTools (E2E testing), filesystem (file ops), GitHub (PR management), Notion (documentation), and a custom communication server would consume 40,000-80,000 tokens before any work begins. The pi-mcp-adapter keeps this constant at ~200-400 tokens regardless of how many servers are configured.

---

## 3. MCP Handling Across Agent Harnesses

### Pi Agent (Native, Without Adapter)

Without the pi-mcp-adapter, Pi has no native MCP support. Pi's philosophy is that `bash` is the universal tool -- any CLI tool, API call, or automation can be expressed as a bash command. This is powerful but creates friction when interacting with systems that have mature MCP servers (browser automation, database queries, structured API interactions).

### Pi Agent (With pi-mcp-adapter)

With the adapter, Pi gains MCP access while preserving its lean context. The proxy pattern means Pi pays ~200 tokens for access to unlimited MCP servers. The tradeoff is an extra round-trip: the agent must first search/describe tools, then invoke them. For well-known tools this is minimal friction; for discovery-heavy workflows it adds 1-2 extra turns.

### Claude Code

Claude Code has evolved its MCP handling significantly through 2025-2026:

- **Initial approach**: all MCP tool definitions loaded into context at startup (the "bloat" approach)
- **Issue #7336** (early 2025): community request for lazy loading, noting 95% context reduction potential
- **Issue #11364**: formal proposal for two-tier approach -- tool names/descriptions first, full schemas on-demand
- **Current implementation**: "MCP Tool Search" / deferred tools feature. MCP tools are deferred rather than loaded upfront. Claude uses a ToolSearch meta-tool to discover relevant MCP tools when needed. Anthropic reports approximately 85% token reduction.

Claude Code's solution converges on the same architectural insight as pi-mcp-adapter: replace upfront loading with on-demand discovery. The key difference is that Claude Code's implementation is built into the harness itself, while pi-mcp-adapter is an extension that can evolve independently.

### OpenCode

OpenCode (the open-source Claude Code alternative, supporting 75+ model providers) faced the same problem. Multiple issues were filed:

- **Issue #8277**: lazy/dynamic loading for MCP tools
- **Issue #8625**: add MCP search tool to reduce context occupation
- **Issue #9350**: MCP Tool Search with 85% token reduction (directly inspired by Claude Code's approach)

Community implementations emerged, including a dynamic MCP tool search plugin. The pattern is now recognized as a fundamental requirement for any agent harness supporting multiple MCP servers.

### Cursor, Windsurf, and IDE-Based Agents

IDE-based agents (Cursor, Windsurf, Trae) handle MCP differently because they operate within a graphical environment:

- MCP servers are typically configured per-workspace
- Tool definitions are managed by the IDE's extension system, somewhat buffered from the LLM's context
- The token impact is less visible to users but still present
- As of early 2026, every current-generation AI IDE provides MCP integration, but lazy-loading sophistication varies

The IDE approach sidesteps some of the raw token cost by handling tool routing at the IDE level rather than within the LLM's context window.

---

## 4. MCP Servers for Orchestration

### Chrome DevTools MCP -- The E2E Testing Gate

For orchestrators that require E2E verification (as specified in INC-014/INC-015), Chrome DevTools MCP is non-negotiable. The official server (`@anthropic/chrome-devtools-mcp`) provides:

- **Browser automation**: click, fill, navigate, type, press_key, hover, drag, upload_file
- **Inspection**: take_screenshot, take_snapshot (DOM), list_console_messages, list_network_requests
- **Performance**: performance_start_trace, performance_stop_trace, performance_analyze_insight
- **Device emulation**: emulate (responsive testing), resize_page
- **Multi-tab**: new_page, select_page, close_page, list_pages

For a Pi-based orchestrator, the recommended configuration is `lifecycle: "keep-alive"` during E2E testing phases and `lifecycle: "lazy"` otherwise, with a curated set of direct tools for the most frequent operations (screenshot, click, navigate, fill).

The 2026 workflow for AI-driven E2E testing has matured: requirements written in natural language are translated to Gherkin scenarios, and the AI orchestrates test execution via Chrome DevTools MCP without generating brittle test code. The agent observes actual browser state through screenshots and DOM snapshots, creating a fundamentally more robust testing loop than traditional selector-based automation.

### GitHub MCP vs `gh` CLI

This is one of the most debated MCP tradeoffs in the coding agent community. The consensus from extensive 2025-2026 discussion is clear: **for agents with bash access, `gh` CLI is almost always superior to GitHub MCP**.

| Factor | GitHub MCP | `gh` CLI |
|--------|-----------|----------|
| Token cost | 2,000-5,000 tokens (tool schemas) | 0 tokens (model already knows it) |
| Model familiarity | Custom schema seen at runtime | Deeply trained on billions of examples |
| Composability | Isolated tool calls | Full bash pipeline (`gh pr list \| grep`) |
| Debuggability | Opaque MCP error messages | Standard CLI error output |
| Operational overhead | Background process, state management | Binary on disk, stateless |
| Authentication | MCP-specific OAuth flow | Standard `gh auth` |

The rule of thumb: **use MCP when no good CLI exists**. For GitHub, git, Docker, kubectl, and most DevOps tools, the CLI is superior. MCP shines for browser automation, database queries, and structured API interactions where no CLI equivalent exists.

### Filesystem MCP

The filesystem MCP server provides structured file operations (read, write, list, search) through MCP. However, for Pi-based agents, this is largely redundant -- Pi's native `read`, `write`, `edit`, and `bash` tools already provide comprehensive filesystem access. The only scenario where filesystem MCP adds value is in sandboxed environments where direct filesystem access is restricted.

### Custom MCP Servers for Agent-to-Agent Communication

An emerging pattern combines MCP with the Agent-to-Agent (A2A) protocol. Agents can be exposed as MCP servers themselves, enabling orchestration topologies where:

- The orchestrator discovers agent capabilities via MCP tool schemas
- Task delegation happens through MCP tool calls
- Results flow back as MCP tool responses

The pi-collaborating-agents extension (by baochunli) implements a simpler version: spawned subagents auto-register, can reserve/receive files, and send/receive messages. This is a Pi-native alternative to using MCP for inter-agent communication.

For the L-Thread orchestrator pattern, the current approach (tmux sessions + terminal read/write for conduit mode, or Task/SendMessage for teams mode) is more battle-tested than MCP-based inter-agent communication, which is still experimental.

---

## 5. MCP vs CLI: The GitHub Case Study

The MCP-vs-CLI debate deserves deeper treatment because it informs the broader strategy for which tools should be MCP servers vs CLI wrappers in an orchestrator.

### The Training Data Argument

AI models have been trained on billions of lines of terminal interactions from Stack Overflow, GitHub repos, and documentation. Asking Claude or GPT-4 to use `gh pr create --title "Fix bug" --body "Description"` taps into deeply learned patterns. MCP server schemas are custom interfaces the model encounters for the first time at runtime, requiring novel reasoning about unfamiliar tool structures.

This argument extends beyond GitHub. Any tool with a well-known CLI (git, docker, npm, curl, jq, grep, find, sed, awk) will generally be used more reliably via bash than via a custom MCP wrapper. The MCP wrapper adds token cost, operational complexity, and forces the model into unfamiliar territory -- all for functionality that already works through bash.

### When MCP Wins

MCP is the correct choice when:

1. **No CLI exists**: Browser automation, database GUIs, Notion, Slack
2. **Stateful interaction is required**: WebSocket connections, streaming data, persistent sessions
3. **Structured output matters**: MCP returns typed JSON; CLI output requires parsing
4. **Authentication is complex**: OAuth flows, multi-step auth that CLI tools handle poorly
5. **The operation is inherently interactive**: Browser page manipulation, real-time data monitoring

### The 2026 Consensus

Multiple prominent voices (including Andrew Jefferson, Mario Zechner, and the author of "MCP is Dead, Long Live the CLI") have converged on the same position: **MCP is infrastructure for bridging AI agents to systems that lack good CLIs, not a replacement for CLIs that already exist**.

For an orchestrator design, this means maintaining a clear boundary: use bash/CLI for git, GitHub, Docker, npm, and DevOps; use MCP for browser automation, database queries, and services without CLIs.

---

## 6. The MCP Ecosystem in 2026

### Scale

The MCP ecosystem has exploded. FastMCP tracks 1,864+ MCP servers. PulseMCP, LobeHub, and mcpservers.org maintain competing registries. The protocol has become the de facto standard for connecting AI agents to external tools and services.

### Top Servers by Usage (FastMCP Data)

1. **Context7** -- Memory management, 11,000 views, 690 installs
2. **Playwright** -- Browser automation, ~6,000 views
3. **Chrome DevTools** -- Browser debugging and performance, growing rapidly
4. **Filesystem** -- Local file access
5. **GitHub** -- Repository management (though CLI is preferred for agents with bash)

### Enterprise Patterns

Enterprise MCP usage has evolved toward gateway architectures. The MCP Gateway Registry pattern centralizes tool discovery, authentication (OAuth via Keycloak/Entra), and access control behind a single entry point. This is analogous to API gateways in the microservices world.

Cloudflare's Portal pattern lets organizations compose multiple MCP servers behind a single gateway with unified auth. This is relevant for orchestrators that need to manage MCP access across multiple subagents with different permission levels.

### Code Mode: The Cloudflare Innovation

Cloudflare's Code Mode represents a paradigm shift. Instead of exposing individual API operations as MCP tools (which would consume 1.17 million tokens for the full Cloudflare API), the server exports just two tools: `search()` and `execute()`. The model writes JavaScript against a typed representation of the OpenAPI spec, and the code runs in an isolated Worker sandbox. Total cost: ~1,000 tokens for an entire API.

This pattern -- replacing tool schemas with code generation against typed SDKs -- may represent the future of large-API MCP integration. It eliminates the token scaling problem entirely.

### Dynamic Toolsets: The Speakeasy Approach

Speakeasy's Dynamic Toolset implementation achieves up to 160x token reduction compared to static toolsets while maintaining 100% success rates. The approach uses meta-tools for discovery rather than exposing individual operations directly. Tool schemas (the bulk of token usage) are deferred until the LLM explicitly requests them. Adding new tools does not increase initial token usage.

This is architecturally equivalent to what pi-mcp-adapter does, but implemented at the MCP server level rather than the client level. The convergence of these approaches -- client-side lazy loading (pi-mcp-adapter, Claude Code's deferred tools) and server-side dynamic toolsets (Speakeasy, Cloudflare Code Mode) -- confirms that token-efficient discovery is the correct pattern.

---

## 7. Token Budget Optimization Strategies

For an orchestrator managing multiple MCP servers across multiple subagents, token budget management is a first-class concern. The research reveals five proven strategies:

### Strategy 1: Proxy/Lazy Loading (pi-mcp-adapter pattern)

Replace all tool schemas with a single proxy tool. Discovery happens on-demand. Cost: ~200 tokens regardless of server count. This is the correct default for a Pi-based orchestrator.

### Strategy 2: Direct Tools for Hot Paths

For tools invoked in nearly every session (e.g., `take_screenshot` during E2E testing), expose them directly to avoid the proxy round-trip. Cost: 150-300 tokens per tool. Use sparingly -- cap at 5-20 direct tools.

### Strategy 3: Subagent Context Isolation

Each subagent only receives the MCP tools it needs (via frontmatter `mcp:` syntax). The E2E testing agent gets Chrome DevTools. The PR management agent gets no MCP servers (uses `gh` CLI instead). The documentation agent gets Notion MCP. No single agent pays for tools it does not use.

### Strategy 4: Server Lifecycle Management

Aggressive idle timeouts. Servers that are used once per session (e.g., Notion for final documentation) should have short idle timeouts (5 minutes). Always-needed servers (Chrome DevTools during testing phases) should use keep-alive. The orchestrator should dynamically adjust lifecycle modes based on the current phase of work.

### Strategy 5: Context Post-Processing (MCP+)

MCP+ is an emerging post-processing layer that intercepts tool outputs and delivers only relevant data, achieving up to 75% reduction in tool result token consumption. This addresses the second source of MCP token cost (tool results) rather than the first (tool definitions).

---

## 8. Integration Strategy for Pi-Based Orchestrator

### Architecture

The Pi-based orchestrator should integrate MCP through the pi-mcp-adapter at the subagent level, not at the orchestrator level. The orchestrator itself should never call MCP tools directly -- it orchestrates, delegates, and verifies.

```
Orchestrator (Pi)
  |-- No MCP tools (pure orchestration)
  |-- Subagent: E2E Tester (Pi + pi-mcp-adapter)
  |     |-- Chrome DevTools MCP (keep-alive)
  |     |-- directTools: [take_screenshot, click, navigate_page, fill]
  |-- Subagent: Backend Developer (Pi)
  |     |-- No MCP (uses bash/CLI for everything)
  |-- Subagent: Frontend Developer (Pi)
  |     |-- No MCP (uses bash/CLI)
  |-- Subagent: Documentation (Pi + pi-mcp-adapter)
  |     |-- Notion MCP (lazy, idleTimeout: 5)
```

### Configuration Blueprint

Global config at `~/.pi/agent/mcp.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@anthropic/chrome-devtools-mcp"],
      "lifecycle": "lazy",
      "directTools": ["take_screenshot", "click", "navigate_page", "fill", "evaluate_script"]
    },
    "notion": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-notion"],
      "lifecycle": "lazy",
      "idleTimeout": 5
    }
  },
  "settings": {
    "idleTimeout": 10
  }
}
```

Project-level overrides at `.pi/mcp.json` for projects that need Chrome DevTools in keep-alive mode during active E2E phases.

### Subagent Frontmatter Pattern

E2E testing subagent:
```
---
tools:
  - mcp:chrome-devtools
---
```

Documentation subagent:
```
---
tools:
  - mcp:notion/notion-search
  - mcp:notion/notion-update-page
---
```

### What NOT to Use MCP For

Based on the research, the following should remain CLI-based in the orchestrator:

- **Git operations**: `git` CLI, deeply known to all models
- **GitHub operations**: `gh` CLI, zero token cost, superior composability
- **Docker operations**: `docker` CLI
- **npm/package management**: `npm`/`pnpm` CLI
- **File operations**: Pi's native `read`/`write`/`edit`/`bash`
- **HTTP requests**: `curl`/`httpie` via bash

---

## 9. Recommendations

### Immediate Actions

1. **Adopt pi-mcp-adapter** (v2.1.2) for all MCP integration in the orchestrator's subagents
2. **Configure Chrome DevTools MCP** with selective direct tools for E2E testing subagents
3. **Eliminate GitHub MCP** -- use `gh` CLI exclusively (35x token reduction, better model familiarity)
4. **Set project-level `.pi/mcp.json`** with server configurations tuned per-project

### Architecture Principles

1. **Orchestrator stays MCP-free**: the orchestrator itself uses zero MCP tokens. Only subagents use MCP.
2. **CLI-first, MCP-when-necessary**: default to bash/CLI for all tools with good CLIs. Use MCP only for browser automation, services without CLIs, and stateful interactions.
3. **Context isolation via subagent frontmatter**: each subagent declares exactly which MCP tools it needs. No shared MCP state between subagents.
4. **Lazy by default, keep-alive by exception**: only Chrome DevTools during active E2E testing phases should use keep-alive. Everything else is lazy.
5. **Cap direct tools at 15-20 per subagent**: beyond that, the token cost erodes Pi's context advantage.

### Watch List

- **Cloudflare Code Mode pattern**: if this generalizes to other APIs, it could replace traditional MCP for large API surfaces entirely
- **Speakeasy Dynamic Toolsets**: server-side lazy loading that complements client-side adapters
- **MCP+ post-processing**: tool result compression for reducing output token costs
- **A2A + MCP convergence**: agent-to-agent communication standardizing on MCP transport
- **Claude Code deferred tools evolution**: Anthropic's ToolSearch implementation may influence how other harnesses handle MCP

### Key Metrics to Track

| Metric | Target | Method |
|--------|--------|--------|
| MCP tokens at subagent startup | <500 | pi-mcp-adapter proxy mode |
| Direct tools per subagent | <20 | Frontmatter audit |
| Server idle disconnects | >80% of lazy servers | Adapter logs |
| E2E test token cost | <5,000 per test cycle | Chrome DevTools direct tools |
| CLI vs MCP ratio | >70% CLI | Tool usage audit |

---

## Sources

- [nicobailon/pi-mcp-adapter (GitHub)](https://github.com/nicobailon/pi-mcp-adapter)
- [pi-mcp-adapter README](https://github.com/nicobailon/pi-mcp-adapter/blob/main/README.md)
- [pi-mcp-adapter Releases](https://github.com/nicobailon/pi-mcp-adapter/releases)
- [pi-mcp-adapter on npm (v2.1.2)](https://libraries.io/npm/pi-mcp-adapter)
- [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents)
- [Lazy-load MCP tool definitions -- Claude Code Issue #11364](https://github.com/anthropics/claude-code/issues/11364)
- [Feature Request: Lazy Loading -- Claude Code Issue #7336](https://github.com/anthropics/claude-code/issues/7336)
- [MCP Tool Search -- OpenCode Issue #9350](https://github.com/anomalyco/opencode/issues/9350)
- [Lazy/dynamic loading for MCP tools -- OpenCode Issue #8277](https://github.com/anomalyco/opencode/issues/8277)
- [Chrome DevTools MCP (GitHub)](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools MCP Blog](https://developer.chrome.com/blog/chrome-devtools-mcp)
- [Cloudflare Code Mode: Give Agents an Entire API in 1,000 Tokens](https://blog.cloudflare.com/code-mode-mcp/)
- [Speakeasy: Reducing MCP Token Usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
- [MCP Context Window Explained](https://deploystack.io/blog/how-mcp-servers-use-your-context-window)
- [MCP Token Optimization Strategies (Tetrate)](https://tetrate.io/learn/ai/mcp/token-optimization-strategies)
- [Top 10 Most Popular MCP Servers in 2026 (FastMCP)](https://fastmcp.me/blog/top-10-most-popular-mcp-servers)
- [Best MCP Servers for Developers in 2026 (Builder.io)](https://www.builder.io/blog/best-mcp-servers-2026)
- [MCP vs CLI: Benchmarking Tools for Coding Agents](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/)
- [Why CLI Tools Are Beating MCP for AI Agents](https://jannikreinhard.com/2026/02/22/why-cli-tools-are-beating-mcp-for-ai-agents/)
- [GitHub CLI is Better Than MCP for Claude Code](https://bishnu.dev/posts/git-mcp-vs-gh-cli/)
- [Pi: The Minimal Agent Within OpenClaw (Armin Ronacher)](https://lucumr.pocoo.org/2026/1/31/pi/)
- [PI Agent Revolution (2026)](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [Orchestrating Multi-Agent Intelligence: MCP-Driven Patterns (Microsoft)](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/orchestrating-multi-agent-intelligence-mcp-driven-patterns-in-agent-framework/4462150)
- [Architecting Agentic MLOps: A2A and MCP (InfoQ)](https://www.infoq.com/articles/architecting-agentic-mlops-a2a-mcp/)
- [What's New in MCP in 2026](https://strategizeyourcareer.com/p/whats-new-in-mcp-in-2026)
- [MCP+ Precision Context Management](https://mcp-plus.github.io/)
- [voicetreelab/lazy-mcp](https://github.com/voicetreelab/lazy-mcp)
- [baochunli/pi-collaborating-agents](https://github.com/baochunli/pi-collaborating-agents)
- [Cursor vs Windsurf vs Claude Code 2026 (NxCode)](https://www.nxcode.io/resources/news/cursor-vs-windsurf-vs-claude-code-2026)
- [OpenCode vs Claude Code vs Cursor 2026 (NxCode)](https://www.nxcode.io/resources/news/opencode-vs-claude-code-vs-cursor-2026)
