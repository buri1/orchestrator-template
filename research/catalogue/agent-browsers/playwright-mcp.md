# Playwright MCP

> **Microsoft — [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)**

| Field | Value |
|-------|-------|
| Source | [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| Type | Agent Browser / MCP Server |
| Stars | 29,600 (as of 2026-03-25) |
| License | Apache-2.0 |
| Tech Stack | TypeScript/Node.js, Playwright, Chrome DevTools Protocol |
| Maturity | Production |

---

## Summary

Playwright MCP is Microsoft's official MCP server that provides browser automation capabilities to LLMs through structured accessibility snapshots. It enables Claude Code and other MCP clients to navigate, click, fill forms, take screenshots, and run Playwright scripts -- all through the accessibility tree, without requiring vision models.

The 2026 update added `--vision auto` mode: uses accessibility tree for 90% of interactions, automatically switching to vision for canvas/WebGL/complex visualizations. Microsoft also released `@playwright/cli` as a companion, which reduces token usage from ~114K (MCP) to ~27K (CLI) -- a 4x reduction.

## Pros
- Official Microsoft backing, actively maintained
- 29.6K stars -- massive community and ecosystem
- Accessibility-tree-first: deterministic, no vision models needed
- `--vision auto` mode for canvas/WebGL fallback (2026)
- Apache-2.0 license
- Native Claude Code integration (`claude mcp add playwright`)
- Browser extension connectivity for existing logged-in sessions
- Full Playwright power (screenshots, PDFs, file uploads, custom scripts)
- Also available as `@playwright/cli` for 4x token reduction
- Supports all major browsers (Chromium, Firefox, WebKit)
- Available via Homebrew (`brew install playwright-mcp`)

## Cons
- MCP protocol overhead inflates token usage (~114K tokens per task vs 27K for CLI)
- Node.js dependency
- Dumps full accessibility trees -- no context compression
- No per-worktree browser isolation
- No semantic locators (uses CSS selectors)
- Server process management overhead
- Not CLI-first (MCP protocol adds latency)

## Best Use Case
Claude Code users needing full-featured browser automation via MCP with the backing and reliability of Microsoft's Playwright team. Best for exploratory automation, self-healing tests, and long-running workflows where persistent browser context matters.

## Claude Code Integration
**Native.** First-class MCP integration: `claude mcp add playwright npx @playwright/mcp@latest`. Configuration persists in `~/.claude.json`. Listed first in Claude Code's official documentation. The CLI companion (`@playwright/cli`) offers 4x token savings for deterministic tasks.
