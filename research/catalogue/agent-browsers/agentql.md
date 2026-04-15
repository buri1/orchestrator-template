# AgentQL

> **TinyFish — [github.com/tinyfish-io/agentql](https://github.com/tinyfish-io/agentql)**

| Field | Value |
|-------|-------|
| Source | [agentql.com](https://www.agentql.com/) |
| Type | Agent Browser / Query Language + SDK |
| Stars | 1,300 (as of 2026-03-25) |
| License | MIT |
| Tech Stack | Python, JavaScript, Playwright, REST API |
| Maturity | Production |

---

## Summary

AgentQL provides a natural language query language for AI agents to interact with and extract structured data from web pages. Instead of CSS selectors or XPaths, agents describe what they want in natural language, and AgentQL's selectors find elements intuitively based on page content. Queries work across similar websites and self-heal as UIs change over time.

Integrates with Playwright and agent frameworks (LangChain, Zapier). Offers Python and JavaScript SDKs, a REST API, and a Chrome browser debugger extension. Designed for both automation (clicking, filling) and extraction (structured data output).

## Pros
- Natural language selectors (self-healing, cross-site compatible)
- MIT license
- Python AND JavaScript SDKs
- REST API for non-SDK usage
- Playwright integration
- Browser debugger extension for developing queries
- Resilient to UI changes
- Structured data output with transformations
- Works on authenticated and dynamic content
- LangChain/Zapier integrations

## Cons
- Small community (1.3K stars)
- Requires LLM calls for query resolution (token cost)
- Two languages but neither is pure CLI
- Not designed for E2E testing
- No MCP server
- Query language adds learning curve
- Extraction-focused, not full browser automation
- Company is small (TinyFish)

## Best Use Case
Extracting structured data from web pages using natural language queries, especially when targeting multiple similar websites where traditional selectors would need per-site maintenance.

## Claude Code Integration
No native MCP integration. Python/JavaScript SDKs could be wrapped, but the query language paradigm doesn't map well to Claude Code's tool-use pattern. Not a natural fit for our architecture.
