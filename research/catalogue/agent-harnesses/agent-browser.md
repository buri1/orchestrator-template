# agent-browser

> **Headless browser automation CLI for AI agents. Fast Rust CLI with Node.js fallback.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) |
| GitHub Stars | 19,900 (as of 2026-03-08) |
| Publisher | Vercel Labs — bigtech (Vercel, $3.5B+ valuation) |
| License | Apache-2.0 |
| Tech Stack | Rust (CLI), Node.js (fallback/daemon), Playwright, Chrome DevTools Protocol |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | E2E testing is a gate in our orchestrator (Rule 2). This tool could replace or complement our Chrome DevTools MCP for agent-driven browser testing. The 93% context savings directly addresses our token budget concerns. |
| **Novelty** | 7/10 | The "Snapshot + Refs" system for context reduction is genuinely new. Semantic locators instead of DOM trees is a smarter approach than full accessibility dumps. |
| **Actionable** | 8/10 | Drop-in replacement for Playwright MCP in our E2E testing pipeline. CLI-first design fits our terminal-first architecture. Could be integrated this week. |

---

## Overview

agent-browser is a CLI-first browser automation tool designed specifically for AI agents rather than humans. Its core innovation is the "Snapshot + Refs" system that reduces context window consumption by 93% compared to traditional approaches like Playwright MCP. Instead of dumping full DOM trees or accessibility snapshots, it uses semantic locators (ARIA roles, text content, labels, placeholders) and compact element references.

The architecture is a three-layer stack: a Rust CLI for sub-millisecond command parsing, a Node.js daemon managing Playwright browser lifecycle, and a fallback Node.js execution path for environments without Rust. It ships with 108+ commands covering navigation, form interaction, network interception, screenshots, PDF generation, multi-tab management, iframe support, storage manipulation, geolocation emulation, and visual diffing.

The tool is designed to be invoked by AI agents as part of their tool-use loop — the agent issues CLI commands, gets compact snapshot responses, reasons about them, and issues next commands. This is fundamentally different from MCP-based browser tools that stream full page state into context.

---

## Technical Architecture

```
┌──────────────────────────────┐
│     AI Agent (Claude, etc.)  │
│     Issues CLI commands      │
├──────────────────────────────┤
│     Rust CLI Binary          │
│  - Sub-ms parsing overhead   │
│  - Semantic locator system   │
│  - Snapshot + Refs output    │
├──────────────────────────────┤
│     Node.js Daemon           │
│  - Playwright lifecycle mgmt │
│  - Browser state management  │
│  - Auth state save/load      │
├──────────────────────────────┤
│     Chrome/Chromium (CDP)    │
│  - Headless execution        │
│  - Network interception      │
│  - DevTools Protocol         │
└──────────────────────────────┘
```

**Key design decisions:**
- **Semantic locators over CSS selectors**: Elements referenced by ARIA role, text content, label, placeholder — not brittle XPaths
- **Compact refs**: Each element gets a short ref ID. Agent sees `[ref=a3]` not `<div class="xyz" id="abc" data-testid="...">`
- **State persistence**: Save/load auth cookies, localStorage, sessionStorage for reusable login flows
- **Network mocking**: Intercept and mock API responses for deterministic testing
- **Visual diff**: Compare snapshots between URLs for regression detection

---

## Publisher Background

Vercel Labs is the experimental arm of Vercel (creators of Next.js, valued at $3.5B+). The "Labs" designation means this is an exploratory project, but it benefits from Vercel's engineering culture and the team's deep experience with web infrastructure. At 19.9k stars, this has substantial community adoption and is likely to be maintained long-term. Vercel has a strong track record of open-sourcing high-quality developer tools.

---

## What's Valuable for Us

1. **93% context reduction**: Our E2E testing gate (Rule 2) requires Chrome DevTools MCP, which dumps significant context. Replacing this with agent-browser's Snapshot + Refs system would free up context window for actual reasoning.

2. **CLI-first design**: Fits perfectly into our terminal-first, tmux-based architecture. Agents can invoke `agent-browser` commands directly rather than going through MCP server protocols.

3. **Semantic locators**: More resilient to UI changes than CSS selectors or XPaths. This aligns with our need for stable E2E tests that don't break on minor frontend changes.

4. **Auth state persistence**: Save/load login state for testing authenticated flows without re-authenticating every session. Critical for our gov SaaS contract testing.

5. **Network interception**: Mock API responses for deterministic E2E tests — aligns with our 70/30 deterministic/LLM split principle.

---

## What's NOT Relevant

- **Visual diff comparison**: We don't do visual regression testing currently and it's not on the roadmap.
- **Geolocation/device emulation**: Our gov SaaS contracts are desktop-first, no mobile testing needed.
- **PDF generation**: Not part of our testing pipeline.
- **The Rust requirement**: Adds a build dependency. The Node.js fallback mitigates this, but it's still an extra tool in the chain. Our stack is TypeScript/shell — adding Rust binaries is friction.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Evaluate as drop-in replacement for Chrome DevTools MCP in our E2E testing gate. The context savings alone justify a spike.
- **Phase 2 (Days 4-60)**: If adopted, build reusable auth state snapshots for each gov SaaS project. Agents can test authenticated flows without browser login per session.
- **Phase 3 (Days 60-90)**: Use network interception for contract testing — mock external APIs to verify our integrations deterministically.
- **Phase 4 (Days 90+)**: If we scale to multiple business lines, the compact context format enables running more E2E tests per agent session before hitting token limits.

---

## Key Takeaway

> **agent-browser's 93% context reduction via Snapshot + Refs is the single most compelling feature — it directly solves the token budget problem in our E2E testing gate and fits our CLI-first architecture perfectly.**
