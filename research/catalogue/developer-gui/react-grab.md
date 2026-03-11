# React Grab

> **Select context for coding agents directly from your website**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [aidenybai/react-grab](https://github.com/aidenybai/react-grab) |
| Website | [react-grab.com](https://react-grab.com) |
| GitHub Stars | 6,288 (as of 2026-03-08) |
| Publisher | Aiden Bai (solo — creator of bippy, Million.js; SF-based; aiden@million.dev) |
| License | MIT |
| Tech Stack | TypeScript, Solid.js (UI layer), [bippy](https://github.com/aidenybai/bippy) (React fiber introspection, 1,224 stars), Tailwind CSS, tsup, Playwright (e2e) |
| Maturity | 🟡 Early (v0.1.26, created Oct 2025, rapid iteration — 58 open issues, 290 forks) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *From Airtable research list. The token reduction angle (28K vs 42K per UI task) is directly relevant to the Master Blueprint's Principle 3 ("Context is zero-sum"). Worth testing on the SaaS factory line where we spin up React frontends. The MCP server integration makes this composable with our agent harness layer without touching agent code. Not useful for gov contract work (Angular/Java), but high signal for any React-based rapid launches.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves frontend context precision for React projects, but our primary work (gov contracts) is not React. Relevant only when SaaS factory launches React apps. |
| **Novelty** | 7/10 | Using React fiber introspection (via bippy) to extract source locations from the DOM at dev time is a genuinely clever approach. The O(n)→O(1) file discovery elimination is a real insight. |
| **Actionable** | 6/10 | One-line install (`npx grab@latest init`) for any React project. MCP server available out of the box. But only actionable when we have React frontends in play. |

---

## Overview

React Grab is a browser-based development tool that lets developers hover over any UI element in their running React application and press Cmd+C (Mac) or Ctrl+C (Windows/Linux) to copy the element's full context — file name, React component name, component stack trace with line numbers, and HTML source — directly to the clipboard. This context can then be pasted into any AI coding agent (Cursor, Claude Code, Copilot, Gemini, etc.) to give it precise targeting information.

The core insight is that AI coding agents waste significant time and tokens on the "search phase" — grepping through codebases to find which file contains the UI element the user wants to change. React Grab eliminates this by leveraging React's internal fiber tree, which already tracks source file locations in development mode. By walking up the component tree from the clicked DOM element, it provides an O(1) lookup for file paths and line numbers that would otherwise require O(n) LLM-driven search calls.

Benchmarks on 20 real-world UI modification tasks (shadcn/ui dashboard, Claude 4.5 Sonnet) show: without React Grab, average 13.6s / 5 tool calls / 41.8K tokens; with React Grab, average 6.9s / 1 tool call / 28.1K tokens — roughly a 3x speedup and 33% token reduction. The authors acknowledge high variance and single-trial limitations, but the directionality is credible.

---

## Technical Architecture

```
Browser (Dev Mode)                    Agent Toolchain
┌────────────────────────────┐       ┌─────────────────────┐
│  React App (dev build)     │       │  Claude Code / etc  │
│  ┌──────────────────────┐  │       │                     │
│  │ React Fiber Tree     │  │       │  Reads clipboard    │
│  │  └─ source locations │  │       │  or MCP context     │
│  └──────────┬───────────┘  │       └──────────┬──────────┘
│             │ bippy        │                   │
│  ┌──────────▼───────────┐  │       ┌──────────▼──────────┐
│  │ react-grab overlay   │  │       │  MCP Server          │
│  │  - hover highlight   │──┼──────▶│  (grab-mcp)          │
│  │  - Cmd+C capture     │  │  OR   │  get_element_context │
│  │  - context menu      │  │ clip  │  submit_context      │
│  │  - drag select       │  │ board │  HTTP + stdio modes  │
│  └──────────────────────┘  │       └──────────────────────┘
└────────────────────────────┘
```

**Key components:**

- **bippy** (`getFiberFromHostInstance`, `getOwnerStack`, `parseStack`): The author's own library for hacking into React internals. Extracts fiber nodes from DOM elements, walks the owner stack to collect component names and source locations. Works with React 17+.
- **context.ts**: Core context assembly — `getStack(element)` resolves the full component stack with file:line:column, `getHTMLPreview(element)` produces a concise DOM snippet, `getComponentDisplayName(element)` filters out framework internals (Next.js, React primitives, styled-components).
- **primitives.ts**: Standalone API (`getElementContext`, `freeze`, `unfreeze`, `openFile`) that can be used without the default overlay UI. Enables building custom element selectors.
- **Plugin system**: `registerPlugin` / `unregisterPlugin` with hooks (`onElementSelect`) and actions (context menu items, toolbar items). Plugins can extend the default UI without forking.
- **MCP server** (`packages/mcp/`): Model Context Protocol server exposing `get_element_context` tool. Runs as HTTP server or stdio transport. Stores latest context with TTL expiration. CORS-enabled for browser→MCP communication.
- **Provider packages**: Dedicated integration packages for Cursor, Claude Code, Copilot, Codex, Gemini, AMP, AMI, Droid, OpenCode — each adapts the context format to the agent's preferred input.
- **Relay package**: Bridges browser context to MCP server.

**Installation**: `npx -y grab@latest init -y` auto-detects framework (Next.js App/Pages router, Vite, Webpack) and injects the script tag in dev mode only. Production builds never include React Grab.

---

## Publisher Background

**Aiden Bai** is a solo developer based in San Francisco, known for building performance-oriented React tooling. His most notable prior project is **Million.js** (a virtual DOM replacement that accelerated React rendering), evidenced by the `babel-preset-million` package and the `aiden@million.dev` email. He also created **bippy** (1,224 stars), the React fiber introspection library that powers React Grab's core mechanism.

With 5,092 GitHub followers, 174 public repos, and React Grab hitting 6,288 stars in ~5 months (created Oct 2025), he has strong traction in the React performance tooling niche. The project is solo-dominated (1,111 of ~1,135 contributions are his), suggesting bus-factor risk but also tight architectural coherence. No known VC backing — appears to be an independent/bootstrapped effort.

---

## What's Valuable for Us

1. **Context precision pattern (Principle 3 — "Context is zero-sum")**: The idea of providing agents with exact file:line:column instead of letting them grep is directly aligned with our Master Blueprint. Even outside React, the pattern — "give the agent the answer to its first 3 tool calls upfront" — is universally applicable. We could apply this thinking to any codebase by pre-computing file location indexes.

2. **MCP server as context bridge**: The `grab-mcp` server demonstrates a clean pattern for bridging browser state to agent toolchains via MCP. The `get_element_context` tool with TTL-based context storage is a reusable architecture for any "human points at thing → agent acts on thing" workflow. This maps to our Chrome DevTools MCP usage.

3. **Token reduction benchmarks**: The 41.8K → 28.1K token reduction (33%) on real tasks provides concrete evidence for our cost optimization work. At Claude Max scale, token efficiency is less about cost and more about context window pressure — fewer search tokens means more room for actual reasoning.

4. **Plugin architecture for extensibility**: The `registerPlugin` / `unregisterPlugin` pattern with hooks and actions is a clean, lightweight extensibility model we could adapt for our own tooling.

5. **O(1) file discovery via fiber introspection**: The technical mechanism of using React's own debug information (already present in dev builds) rather than building a separate index is elegant. Zero additional infrastructure required.

---

## What's NOT Relevant

1. **React-only limitation**: Our gov contract work (primary revenue) uses Angular/Java stacks. React Grab provides zero value there. Only relevant for SaaS factory React launches.

2. **Browser-side operation**: Our orchestrator operates at the CLI/tmux level. React Grab is a browser dev tool — different operational surface entirely. It doesn't integrate into our tmux-based agent spawning pattern.

3. **Frontend-focused scope**: Our Master Blueprint's Principle 5 ("Human review is the binding constraint") focuses on PR review, not UI element selection. React Grab optimizes a different bottleneck than what we face today.

4. **Dev-mode only**: Stripped from production builds, so it's purely a development acceleration tool. No production observability or monitoring value.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: No immediate use — our current sprint is orchestrator infrastructure, not frontend development.
- **Phase 3 (Days 60-90)**: When SaaS factory begins launching React-based products, React Grab becomes a high-value dev tool for the coding agents building those UIs. One-line install per project.
- **Phase 4 (Days 90+)**: If we build a custom agent harness with MCP support, React Grab's MCP server could be auto-configured as part of the SaaS factory boilerplate. The plugin system could be extended to capture user intent ("make this button blue") and route directly to a coding agent via our orchestrator.

---

## Key Takeaway

> **React Grab eliminates the AI agent search phase for React frontends by providing O(1) file:line:column lookups via fiber introspection, cutting tokens by 33% and time by 3x — a concrete implementation of the Master Blueprint's "context is zero-sum" principle, actionable the moment we ship React-based SaaS products.**
