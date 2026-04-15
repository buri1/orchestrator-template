# Notte

> **Notte Labs — [github.com/nottelabs/notte](https://github.com/nottelabs/notte)**

| Field | Value |
|-------|-------|
| Source | [notte.cc](https://www.notte.cc/) |
| Type | Agent Browser / Full-Stack Framework |
| Stars | 1,900 (as of 2026-03-25) |
| License | SSPL-1.0 (Server Side Public License) |
| Tech Stack | Python 3.11+, Playwright, Pydantic, CDP |
| Maturity | Early-Production (v1.4) |

---

## Summary

Notte is a full-stack framework for building AI web agents that combines traditional scripting with AI reasoning. Its core value proposition is hybrid workflows: script the deterministic parts, use AI only when needed, cutting costs by 50%+ while improving reliability. The cloud platform provides stealth browser sessions on demand with observe/act/scrape APIs.

Notte's perception layer converts web pages into an action API in text, making it simpler for LLMs to reason about pages. Supports Playwright, Puppeteer, Selenium, browser-use, and Stagehand via CDP. Includes CAPTCHA solving, proxy support, credential vaults, and digital persona management.

## Pros
- Hybrid scripting + AI approach (50%+ cost reduction)
- Perception layer converts pages to text action API
- Works with multiple browser tools (Playwright, Puppeteer, Selenium, browser-use, Stagehand)
- Structured output via Pydantic models
- Built-in CAPTCHA solving and proxy support
- Credential vault for secure auth management
- Cookie and session management
- File upload/download support

## Cons
- SSPL-1.0 license (restrictive for commercial SaaS)
- Python-only
- Small community (1.9K stars)
- Cloud platform is paid
- Not CLI-first
- No MCP server
- Heavy framework for simple E2E testing
- Still maturing (v1.4)

## Best Use Case
Building production web agents that need both reliability (scripted paths) and flexibility (AI reasoning) for complex automation tasks like form filling, data extraction, and multi-step workflows across various websites.

## Claude Code Integration
No native MCP integration. Python framework requires wrapping. The hybrid deterministic/AI approach is philosophically aligned with our 70/30 principle, but the Python dependency and SSPL license make it unsuitable for direct adoption.
