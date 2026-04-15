# Puppeteer MCP (Deprecated)

> **Model Context Protocol / Anthropic — [github.com/modelcontextprotocol/server-puppeteer](https://github.com/modelcontextprotocol/server-puppeteer)**

| Field | Value |
|-------|-------|
| Source | [github.com/modelcontextprotocol/server-puppeteer](https://github.com/modelcontextprotocol/server-puppeteer) |
| Type | Agent Browser / MCP Server (DEPRECATED) |
| Stars | N/A (archived) |
| License | MIT |
| Tech Stack | TypeScript, Puppeteer, Chrome DevTools Protocol |
| Maturity | Deprecated/Archived |

---

## Summary

The original Puppeteer MCP server published by Anthropic as part of the Model Context Protocol reference implementations. It provided browser automation capabilities (navigation, clicking, form filling, screenshots, JavaScript execution, console monitoring) through Puppeteer. The npm package `@modelcontextprotocol/server-puppeteer` has been deprecated and archived as of 2026.

For most developers in 2026, **Playwright MCP is the recommended replacement** -- actively maintained by Microsoft, supports all major browsers, and listed first in Claude Code documentation.

## Pros
- Was the original reference MCP browser implementation
- Simple, well-documented
- MIT license
- Showed the MCP pattern for browser tools

## Cons
- **DEPRECATED and archived** -- no longer maintained
- npm registry marks it as unsupported
- Puppeteer-only (Chromium-only, no Firefox/WebKit)
- No vision mode, no accessibility tree optimization
- Superseded entirely by Playwright MCP
- No stealth/anti-detection features
- Community forks exist but fragmented

## Best Use Case
**Do not use.** Migrate to Playwright MCP (`@playwright/mcp`).

## Claude Code Integration
Was previously available but is now deprecated. Use `claude mcp add playwright npx @playwright/mcp@latest` instead.
