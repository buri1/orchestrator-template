# Skyvern

> **Skyvern AI — [github.com/Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern)**

| Field | Value |
|-------|-------|
| Source | [skyvern.com](https://www.skyvern.com/) |
| Type | Agent Browser / Vision-based Automation |
| Stars | 21,000 (as of 2026-03-25) |
| License | Apache-2.0 |
| Tech Stack | Python, TypeScript, Playwright, Vision LLMs, Computer Vision |
| Maturity | Production (v2) |

---

## Summary

Skyvern automates browser-based workflows using LLMs and computer vision instead of traditional CSS selectors or XPaths. Its key differentiator is vision-first interaction: it "sees" web pages like a human, making it resilient to layout changes that break traditional selectors. Skyvern provides both a Playwright-compatible SDK and a no-code visual workflow builder.

Particularly strong at navigating government portals, insurance forms, and complex multi-step workflows on sites it has never seen before. Multi-agent architecture plans and executes actions. Available as both cloud-hosted SaaS and self-hosted deployment.

## Pros
- Vision-first: resilient to website layout changes
- No-code workflow builder for non-technical users
- Playwright-compatible SDK
- Strong on complex forms (government portals, insurance)
- Apache-2.0 license
- Multi-agent architecture for planning + execution
- 21K stars, well-funded startup
- Python and TypeScript SDKs
- Cloud and self-hosted options
- Built-in authentication and file download support

## Cons
- Vision-based: high token consumption (screenshots at every step)
- Python-primary (TypeScript SDK exists but secondary)
- Slower than accessibility-tree-based approaches
- Self-hosting requires significant infrastructure
- Not CLI-first
- No MCP server
- Designed for web scraping/RPA, not E2E testing

## Best Use Case
Automating complex, multi-step form-filling workflows on external websites (especially government portals and insurance forms) where traditional selectors would break. Best for RPA-style automation, not CI/E2E testing.

## Claude Code Integration
No native MCP server or Claude Code integration. Python SDK would need wrapping. Not suitable for our tmux-based CLI-first architecture. Better suited for standalone RPA tasks than agent-driven E2E testing.
