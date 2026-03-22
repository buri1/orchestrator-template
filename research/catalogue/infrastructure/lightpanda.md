# Lightpanda

> **The headless browser built from scratch in Zig — purpose-built for web automation, scraping, and AI agents.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [lightpanda-io/browser](https://github.com/lightpanda-io/browser) |
| GitHub Stars | N/A |
| Publisher | Lightpanda (startup) |
| License | AGPL-3.0 |
| Tech Stack | Zig, V8 (JavaScript engine) |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *A headless browser written from scratch in Zig — not a Chromium wrapper. 11x faster and 9x less memory than Chrome. CDP-compatible so it works with Playwright and Puppeteer. The performance numbers are impressive for agent-driven web automation and E2E testing. The robots.txt compliance flag is nice for ethical scraping. Could be a game-changer for our E2E testing pipeline if it matures enough.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Headless browser for E2E testing is directly relevant to our gate requirement |
| **Novelty** | 8/10 | From-scratch Zig implementation is truly novel; not another Chromium wrapper |
| **Actionable** | 5/10 | CDP-compatible means drop-in replacement potential, but maturity is a concern |

---

## Overview

Lightpanda is a headless browser built entirely from scratch in Zig, designed specifically for web automation, scraping, and AI agent workflows. Unlike most headless browser solutions that wrap Chromium, Lightpanda is new code that skips CSS rendering, image loading, layout calculation, and GPU operations — focusing only on DOM manipulation and JavaScript execution.

Key performance benchmarks show 11x faster execution and 9x lower memory usage compared to headless Chrome on a 100-page test suite (AWS EC2 m5.large). The browser is CDP-compatible, meaning it works as a drop-in replacement with existing Playwright and Puppeteer scripts.

Notable features include multi-client support (concurrent connections in a single process), request interception for blocking/modifying/mocking HTTP requests, and a robots.txt compliance flag for ethical scraping.

---

## Technical Architecture

- **Language**: Zig (systems programming, manual memory management)
- **JS Engine**: V8 for full JavaScript execution
- **Protocol**: CDP-compatible (works with Playwright/Puppeteer)
- **Rendering**: None — true headless (no CSS, images, layout, GPU)
- **Networking**: HTTP client with request interception
- **Platforms**: Linux, macOS, Windows (WSL)

---

## What's Valuable for Us

- **E2E testing acceleration**: 11x faster headless browsing could dramatically speed up our mandatory E2E gate
- **CDP compatibility**: Drop-in replacement for our Chrome DevTools MCP workflow
- **Lower resource usage**: 9x less memory means more headroom for parallel testing
- **Request interception**: Could mock API responses for deterministic E2E tests

---

## What's NOT Relevant

- **Scraping focus**: We need E2E testing, not web scraping
- **AGPL license**: Restrictive for embedding in commercial tools
- **Zig ecosystem**: We don't maintain Zig code; contribution would be difficult

---

## Key Takeaway

> **From-scratch Zig headless browser (11x faster, 9x less memory than Chrome, CDP-compatible) — monitor for E2E testing pipeline acceleration; could be transformative when mature enough for production.**
