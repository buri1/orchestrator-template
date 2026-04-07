# Tool Search Tool — Anthropic API Documentation

> **Anthropic — Anthropic Docs (platform.claude.com), undated (accessed 2026-03-08)**

| Field | Value |
|-------|-------|
| Source | https://docs.anthropic.com/en/docs/build-with-claude/tool-use/tool-search |
| Author | Anthropic (official documentation) |
| Publication | Anthropic API Docs |
| Date | undated (accessed 2026-03-08) |
| Topics | tool-use, deferred-loading, context-engineering, agent-scaling, MCP, API-design |
| Read Time | 15 min |

---

## Burak's Notes

> *Thariq's deep dive candidate from the prompt caching post. This is the mechanism Claude Code itself uses internally (the ToolSearch deferred tool pattern we see in our own sessions). Directly relevant to our orchestrator — when we scale to 100+ MCP tools across multiple servers, this is the API-level solution for context window management. The 85% token reduction claim and the 30-50 tool accuracy ceiling are key numbers. Custom client-side implementation via tool_reference blocks means we could build our own embedding-based search without depending on server-side regex/BM25.*

---

## Key Takeaways

1. **Deferred tool loading solves context bloat** — A typical multi-MCP-server setup (GitHub, Slack, Sentry, Grafana, Splunk) consumes ~55K tokens in tool definitions alone. Tool search reduces this by 85%+ by loading only the 3-5 tools Claude actually needs per request via `defer_loading: true`.
2. **Tool selection accuracy degrades past 30-50 tools** — Claude's ability to correctly pick the right tool drops significantly once you exceed 30-50 available tools. On-demand search keeps selection accuracy high even across thousands of tools.
3. **Two search variants: Regex and BM25** — `tool_search_tool_regex_20251119` uses Python `re.search()` patterns (max 200 chars); `tool_search_tool_bm25_20251119` uses natural language queries. Both search tool names, descriptions, argument names, and argument descriptions.
4. **Custom client-side implementation supported** — You can build your own search (embeddings, semantic search) by returning `tool_reference` blocks from a custom tool. Every referenced tool must have a corresponding `defer_loading: true` definition in the top-level `tools` parameter. This is ZDR-eligible unlike server-side.
5. **MCP integration via `mcp_toolset`** — The `default_config.defer_loading` pattern lets you defer entire MCP server tool sets while keeping specific high-frequency tools immediately available via per-tool `configs` overrides.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Core API mechanism for scaling our orchestrator beyond 30 tools; directly addresses context window management for multi-MCP setups; this is what Claude Code itself uses (we see ToolSearch in our own sessions) |
| **Actionable** | 8/10 | Immediately usable in API calls; custom client-side implementation pattern means we can build embedding-based search for our tool catalogue; `defer_loading: true` is a one-line change per tool definition |

---

## Summary

The Tool Search Tool is Anthropic's server-side solution for scaling tool use to hundreds or thousands of tools without blowing up the context window. It introduces a `defer_loading: true` flag on tool definitions that prevents them from being injected into Claude's context until Claude actively searches for and discovers them.

The mechanism works in a two-step process: (1) Claude sees only non-deferred tools plus the tool search tool itself; (2) when Claude needs additional tools, it searches using regex patterns or BM25 natural language queries, receives `tool_reference` blocks pointing to matching tools, and those references are automatically expanded into full tool definitions. The API returns 3-5 most relevant tools per search.

Two variants are available: a regex variant (`tool_search_tool_regex_20251119`) where Claude constructs Python regex patterns, and a BM25 variant (`tool_search_tool_bm25_20251119`) that accepts natural language queries. The system supports up to 10,000 tools in a catalog. Model support is Sonnet 4.0+ and Opus 4.0+ only (no Haiku).

Critically, the documentation describes a custom client-side implementation path: any tool can return `tool_reference` blocks in its `tool_result`, enabling developers to build their own search algorithms (embeddings, vector search, semantic matching) while maintaining compatibility with the deferred loading system. This custom path is ZDR-eligible, unlike the server-side variant.

The feature integrates with MCP servers via `mcp_toolset` with `default_config` for bulk deferral and per-tool `configs` overrides, prompt caching for multi-turn conversations, streaming (with SSE events for search results), and the Messages Batches API. Best practice: keep 3-5 most frequently used tools as non-deferred, use consistent namespacing (`github_`, `slack_`), and add a system prompt describing available tool categories.

---

## Notable Quotes

> "Tool definitions eat into your context budget fast. A typical multi-server setup (GitHub, Slack, Sentry, Grafana, Splunk) can consume ~55K tokens in definitions before Claude does any actual work. Tool search typically reduces this by over 85%."

> "Claude's ability to correctly pick the right tool degrades significantly once you exceed 30-50 available tools. By surfacing a focused set of relevant tools on demand, tool search keeps selection accuracy high even across thousands of tools."

> "You can implement your own tool search logic (e.g., using embeddings or semantic search) by returning tool_reference blocks from a custom tool."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.anthropic.com/engineering/advanced-tool-use | Background on scaling challenges tool search solves; engineering blog post | `/ingest-article` |
| https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Tool search as instance of just-in-time retrieval principle; context engineering patterns | `/ingest-article` |
| https://docs.anthropic.com/en/agents-and-tools/tool-use/programmatic-tool-calling | Companion feature for tool search — programmatic tool calling for scaling orchestration | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude API / Messages API | Core API hosting tool search | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) covers SDK layer |
| MCP (Model Context Protocol) | Tool search integrates with MCP servers via `mcp_toolset` | Yes — referenced across multiple entries |
| MCP Connector | Alternative to building own MCP client; works with tool search | No — consider `/tool-catalogue` |

---

## Action Items

- [ ] Implement `defer_loading: true` on low-frequency tools when building API-based orchestrator layer
- [ ] Evaluate custom client-side tool search with embeddings for our 100+ tool catalogue
- [ ] Test regex vs BM25 variant performance for our tool naming conventions
- [ ] Read the "Advanced tool use" and "Effective context engineering" companion articles
- [ ] Add consistent namespacing (`github_`, `slack_`, `notion_`) to our tool definitions for better search discoverability
