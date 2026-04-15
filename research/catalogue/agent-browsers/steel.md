# Steel

> **Steel.dev — [github.com/steel-dev/steel-browser](https://github.com/steel-dev/steel-browser)**

| Field | Value |
|-------|-------|
| Source | [steel.dev](https://steel.dev/) |
| Type | Agent Browser / Cloud API |
| Stars | 6,700 (as of 2026-03-25) |
| License | Apache-2.0 |
| Tech Stack | TypeScript, Puppeteer, Chrome DevTools Protocol, Docker |
| Maturity | Production |

---

## Summary

Steel is an open-source browser API purpose-built for AI agents. It provides batteries-included browser sandboxes with session management, proxy rotation, stealth/anti-detection, CAPTCHA solving, and extension support -- all accessible via a REST API. Steel connects using Puppeteer, Playwright, or Selenium, making it infrastructure-agnostic.

Steel achieves sub-second session startup times, can maintain sessions for up to 24 hours, and reduces LLM costs by up to 80% through intelligent content extraction. The platform runs on Fly.io and can be self-hosted via Docker. Steel also maintains the AI Browser Agent Leaderboard (leaderboard.steel.dev) benchmarking web agents.

## Pros
- Open source (Apache-2.0), self-hostable via Docker
- Sub-second browser session startup
- 24-hour persistent sessions for complex workflows
- Works with Playwright, Puppeteer, AND Selenium
- Built-in stealth/anti-detection + proxy rotation
- 80% LLM cost reduction through intelligent extraction
- Maintains AI Browser Agent Leaderboard (credibility)
- REST API for programmatic control
- Chrome extension support
- Web-based debugging UI

## Cons
- 47% stealth benchmark score (below Browser Use Cloud's 81%)
- Cloud-first architecture -- local usage requires Docker
- Smaller community (6.7K stars) vs browser-use or Playwright MCP
- Infrastructure overhead for self-hosting
- Not CLI-first -- API/SDK oriented
- No MCP server (as of 2026-03-25)

## Best Use Case
Teams needing managed, scalable browser infrastructure for AI agents with built-in anti-detection and session persistence. Best for production deployments where you need reliable browser sessions at scale without managing Chrome instances yourself.

## Claude Code Integration
No native MCP server. Can be used indirectly through Playwright/Puppeteer connections to Steel sessions. Not a direct fit for Claude Code workflows. Better suited as infrastructure backing other browser tools.
