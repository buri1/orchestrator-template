# Lightpanda

> **The headless browser built from scratch in Zig — purpose-built for AI agents, web automation, and scraping. 9x faster, 16x less memory than Chrome.**

| Field | Value |
|-------|-------|
| Category | 🌐 Agent Browsers |
| Website | [lightpanda.io](https://lightpanda.io/) |
| Repository | [lightpanda-io/browser](https://github.com/lightpanda-io/browser) |
| GitHub Stars | 28,600+ (as of 2026-04-04) |
| Forks | 1,200+ |
| Commits | 5,543 on main |
| Publisher | Lightpanda (startup) |
| License | AGPL-3.0 |
| Tech Stack | Zig, V8 (JS engine), libcurl (HTTP), html5ever (HTML parsing) |
| Install | `curl -fsSL https://pkg.lightpanda.io/install.sh \| bash` |
| Maturity | 🟡 Beta |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *A headless browser written from scratch in Zig — not a Chromium wrapper. 9x faster and 16x less memory than Chrome. CDP-compatible so it works with Playwright and Puppeteer. Native MCP support is the killer feature for agent workflows — no adapter layer needed. 28.6k GitHub stars shows serious traction. The robots.txt compliance flag is nice for ethical scraping. Could be a game-changer for our E2E testing pipeline if it matures enough. AGPL license is a concern for commercial embedding but fine for our internal tooling. Integrated by Vercel, Dust, OpenClaw, and Trigger.dev already.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Headless browser for E2E testing is directly relevant to our gate requirement; native MCP support aligns with agent architecture |
| **Novelty** | 8/10 | From-scratch Zig implementation is truly novel; not another Chromium wrapper. Native MCP is rare. |
| **Actionable** | 6/10 | CDP-compatible means drop-in replacement potential; native MCP could replace Chrome DevTools MCP. Beta maturity is the main risk. |

---

## Overview

Lightpanda is a headless browser built entirely from scratch in Zig, designed specifically for AI agent workflows, web automation, and scraping. Unlike headless browser solutions that wrap Chromium, Lightpanda is new code that eliminates CSS rendering, image loading, layout calculation, and GPU compositing — focusing only on DOM manipulation and JavaScript execution via V8.

Performance benchmarks across 933 real web pages on AWS EC2 m5.large show:
- **Execution speed**: 9x faster than Chrome (5 seconds vs. 46 seconds)
- **Memory**: 16x less than Chrome (123MB peak vs. 2GB)

The browser is CDP-compatible, meaning it works as a drop-in replacement with existing Playwright and Puppeteer scripts. It also ships with **native MCP (Model Context Protocol) support**, making it directly usable by AI agents without an adapter layer.

Notable features include multi-client support (concurrent CDP connections in a single process), request interception (block, modify, or mock HTTP requests), robots.txt compliance via `--obey_robots` flag, form inputs, cookies, custom headers, and proxy support. Docker images are available for Linux amd64 and arm64.

The project has significant traction at 28.6k GitHub stars and has been integrated by Vercel, Dust, OpenClaw, and Trigger.dev. A managed cloud offering provides WebSocket endpoints compatible with existing Puppeteer/Playwright scripts.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│        Interfaces                       │
│  ┌──────────┐ ┌───────────┐ ┌───────┐  │
│  │CDP Server│ │  Native   │ │  CLI  │  │
│  │(Puppeteer│ │   MCP     │ │ fetch │  │
│  │Playwright│ │  Server   │ │ tool  │  │
│  └──────────┘ └───────────┘ └───────┘  │
├─────────────────────────────────────────┤
│        Core Engine (Zig)                │
│  ┌──────────────────────────────────┐   │
│  │  Custom DOM tree + native APIs   │   │
│  │  JS execution, Ajax (XHR/Fetch)  │   │
│  │  Form inputs, cookies, headers   │   │
│  │  Request interception + proxy    │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│        Dependencies                     │
│  ┌───────┐  ┌──────────┐  ┌─────────┐  │
│  │  V8   │  │ html5ever │  │ libcurl │  │
│  │ (JS)  │  │ (parser)  │  │ (HTTP)  │  │
│  └───────┘  └──────────┘  └─────────┘  │
├─────────────────────────────────────────┤
│  NO rendering: no CSS, images,          │
│  layout, GPU compositing                │
└─────────────────────────────────────────┘
```

**Key design decisions:**
- **True headless**: No rendering pipeline at all — not "headless mode" of a full browser, but a browser that was never designed to render
- **V8 for JS**: Full JavaScript execution without rendering overhead
- **CDP + MCP dual protocol**: Works with existing browser automation tooling AND directly with AI agents
- **Multi-client**: Concurrent CDP connections in a single process (no per-client process spawning)
- **Zig implementation**: Manual memory management for predictable, low-overhead resource usage
- **Cloud offering**: Managed WebSocket endpoints — swap `puppeteer.launch()` for `puppeteer.connect()`

---

## Publisher Background

Lightpanda is a startup building purpose-built infrastructure for AI agent web interaction. The project has accumulated 28.6k GitHub stars and 1.2k forks with 5,543 commits on main, indicating sustained active development. Early adopters include Vercel, Dust, OpenClaw, and Trigger.dev — all significant players in the developer tooling and AI agent ecosystem.

---

## What's Valuable for Us

1. **Native MCP support**: Direct agent-to-browser communication via MCP — no Chrome DevTools MCP adapter needed. This is the most aligned feature with our architecture.
2. **E2E testing acceleration**: 9x faster headless browsing could dramatically speed up our mandatory E2E gate.
3. **CDP compatibility**: Drop-in replacement for our Chrome DevTools MCP workflow if MCP mode has gaps.
4. **Lower resource usage**: 16x less memory means more headroom for parallel testing and agent workloads.
5. **Request interception**: Could mock API responses for deterministic E2E tests.
6. **Docker images**: Easy deployment for CI/CD and agent infrastructure.

---

## What's NOT Relevant

- **Scraping focus**: We need E2E testing, not web scraping. The scraping features are a side benefit.
- **AGPL license**: Restrictive for embedding in commercial tools, though fine for internal use.
- **Zig ecosystem**: We don't maintain Zig code; contribution would be difficult.
- **Cloud offering**: We run local/self-hosted. The managed WebSocket service adds latency we don't need.
- **Beta status**: May crash on some websites. Not production-hardened yet.

---

## Future Use Cases

- **Phase 1 (Now)**: Monitor maturity. Test against our E2E suite to measure real-world compatibility.
- **Phase 2 (Days 30-60)**: If MCP support is robust, evaluate replacing Chrome DevTools MCP with Lightpanda's native MCP for agent-driven browser interaction.
- **Phase 3 (Days 60-90)**: If stable, adopt for CI/CD E2E testing to cut test execution time by ~9x.

---

## Key Takeaway

> **From-scratch Zig headless browser with native MCP support (9x faster, 16x less memory than Chrome, 28.6k stars). The native MCP interface makes it the most agent-native browser available — monitor closely for E2E pipeline adoption when beta matures.**
