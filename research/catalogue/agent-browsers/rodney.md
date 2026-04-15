# Rodney

> **CLI tool for interacting with the web**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/simonw/rodney](https://github.com/simonw/rodney) |
| GitHub Stars | 533 (as of 2026-03-08) |
| Publisher | Simon Willison (solo — prolific OSS author, Django co-creator, LLM/datasette ecosystem) |
| License | Apache-2.0 |
| Tech Stack | Go, go-rod (CDP), Chrome DevTools Protocol |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | E2E testing is a gate in our orchestrator (Rule 2). Rodney's persistent-session CLI model maps perfectly to how our tmux-based agents would drive browser interactions: issue commands, get text results, reason, issue next command. Simpler than agent-browser but also simpler to adopt. |
| **Novelty** | 5/10 | The persistent headless Chrome + reconnect-via-WebSocket pattern is known, but the pure-CLI stateful session model (no daemon, no SDK, no MCP) is the cleanest implementation we've seen. The accessibility tree commands (`ax-tree`, `ax-find`, `ax-node`) are a differentiator vs. Bowser. |
| **Actionable** | 7/10 | Single Go binary, zero dependencies beyond Chrome. Could be compiled and used by our agents today. The shell-pipe-friendly exit codes (0=success, 1=assertion-fail, 2=error) make it trivially composable in bash scripts and deterministic harness logic. |

---

## Overview

Rodney is a Go CLI that drives a persistent headless Chrome instance via the Chrome DevTools Protocol (through the go-rod library). Unlike MCP-based browser tools or Playwright wrappers, Rodney uses the simplest possible architecture: `rodney start` launches Chrome and saves its WebSocket debug URL to a JSON state file; every subsequent command (`open`, `click`, `text`, `screenshot`, etc.) reconnects to that same browser, performs the action, prints output to stdout, and exits. Chrome lives independently between commands, maintaining all tabs, cookies, and DOM state.

This "stateless CLI, stateful browser" design is purpose-built for coding agents. An agent in a tmux pane can issue `rodney open https://app.example.com`, then `rodney wait "#dashboard"`, then `rodney text "#status"` — each as a separate bash command with parseable output. No SDK imports, no daemon management, no protocol overhead. The exit code system (0/1/2) means assertions like `rodney exists ".error-message"` can be used directly in shell conditionals, making E2E validation fully deterministic.

The tool ships 50+ commands covering navigation, element interaction, JavaScript evaluation, accessibility tree inspection, tab management, PDF generation, and screenshot capture. It supports both global sessions (`~/.rodney/`) and project-local sessions (`./.rodney/`), enabling per-worktree browser isolation — directly compatible with our git-worktree-per-agent architecture.

---

## Technical Architecture

```
┌─────────────────────────────────────┐
│  AI Agent (Claude Code in tmux)     │
│  Issues: rodney <command> <args>    │
│  Reads: stdout (text/JSON)          │
│  Checks: exit code (0/1/2)         │
└────────────┬────────────────────────┘
             │ exec per command
┌────────────▼────────────────────────┐
│  Rodney CLI (single Go binary)      │
│                                     │
│  1. loadState() → state.json        │
│  2. connectBrowser(debugURL)        │
│  3. getActivePage(browser, state)   │
│  4. Execute command (switch/case)   │
│  5. Print result to stdout          │
│  6. Exit (0, 1, or 2)              │
└────────────┬────────────────────────┘
             │ CDP via WebSocket
┌────────────▼────────────────────────┐
│  Chrome (persistent, headless)      │
│                                     │
│  - Launched once by `rodney start`  │
│  - Lives independently of CLI       │
│  - Maintains tabs, cookies, state   │
│  - Killed by `rodney stop`          │
│  - Data dir: ~/.rodney/ or local    │
└─────────────────────────────────────┘
```

**Core data model (`State` struct):**
```go
type State struct {
    DebugURL    string   // WebSocket URL for CDP reconnection
    ChromePID   int      // For graceful shutdown fallback
    ActivePage  int      // Current tab index
    DataDir     string   // Chrome user data directory
    ProxyPID    int      // Authenticated proxy helper PID
    ProxyPort   int      // Proxy port for HTTPS_PROXY bridging
}
```

**Key design decisions:**
- **No daemon process**: Unlike agent-browser (Node.js daemon) or Playwright MCP (server process), Rodney has zero background processes beyond Chrome itself. Each CLI invocation is a fresh process that connects, acts, and exits.
- **go-rod over Playwright**: Uses Go's go-rod library which wraps CDP directly — no Node.js, no Playwright runtime, no npm dependencies.
- **Per-project session isolation**: `--local` flag stores state in `./.rodney/state.json`, enabling separate browser instances per git worktree. Auto-detection prefers local if present.
- **Authenticated proxy bridging**: Built-in HTTP proxy helper handles `HTTPS_PROXY` with credentials via Basic auth header injection — useful for corp network testing.
- **Timeout control**: `ROD_TIMEOUT` environment variable (default 30s) applies to all page operations.

**Command surface (50+ commands):**
- Navigation: `open`, `back`, `forward`, `reload`, `clear-cache`
- Extraction: `url`, `title`, `text`, `html`, `attr`, `js`
- Interaction: `click`, `input`, `clear`, `file`, `submit`, `select`, `hover`, `focus`
- Waiting: `wait`, `waitload`, `waitstable`, `waitidle`, `sleep`
- Assertions: `exists`, `visible`, `count`, `assert`
- Accessibility: `ax-tree`, `ax-find`, `ax-node`
- Capture: `screenshot`, `pdf`, `download`
- Tabs: `pages`, `newpage`, `page`, `closepage`
- Session: `start`, `stop`, `status`, `connect`

---

## Publisher Background

Simon Willison is the co-creator of Django and one of the most prolific open-source developers in the AI tooling space. His projects include:
- **datasette** (9.7K stars) — instant JSON API for SQLite databases
- **llm** (10K+ stars) — CLI for running LLMs from the terminal
- **sqlite-utils** — CLI and Python library for SQLite
- **shot-scraper** — predecessor to Rodney, screenshot/scraping CLI using Playwright
- His blog (simonwillison.net) is one of the most-cited sources for AI engineering patterns

Willison's credibility is exceptional. He coined the "agentic engineering patterns" article already in our catalogue (rated 9/10 relevance). His tools consistently prioritize CLI-first design, composability, and zero-infrastructure deployment — philosophically aligned with our stack. Rodney is clearly a spiritual successor to his earlier `shot-scraper` but redesigned in Go for performance and with an agent-first command surface.

At 533 stars in ~1 month (created 2026-02-09), growth trajectory is strong. 37 forks, 25 open issues indicate active community engagement. Apache-2.0 license is clean for any use.

---

## What's Valuable for Us

1. **Per-worktree browser isolation**: The `--local` flag creating `./.rodney/state.json` is a direct match for our git-worktree-per-agent architecture. Each agent gets its own Chrome instance scoped to its worktree. No shared browser state, no cross-contamination. This is something agent-browser does NOT offer out of the box.

2. **Shell-native assertion model**: Exit code 1 for failed checks means we can write deterministic E2E validation in pure bash:
   ```bash
   rodney open "$APP_URL" && rodney wait "#dashboard" && rodney exists ".success-indicator"
   ```
   This maps directly to our 70/30 principle — the routing and assertion logic is fully deterministic, the browser interaction is the "execution" layer.

3. **Accessibility tree inspection**: `ax-tree`, `ax-find`, `ax-node` commands expose Chrome's accessibility APIs. For our gov SaaS contracts (BITV 2.0 compliance), this could automate accessibility audits as part of the E2E gate — a use case neither agent-browser nor Bowser explicitly supports.

4. **Zero infrastructure overhead**: Single Go binary + Chrome. No Node.js daemon, no npm install, no MCP server. For our Claude Max agents running on a Mac, this is the lowest-friction browser automation option. Build once with `go build`, distribute the binary.

5. **JavaScript evaluation**: `rodney js "document.querySelectorAll('.item').length"` returns results directly. Combined with `assert`, this enables arbitrary DOM assertions without needing a test framework.

6. **Simon Willison's design taste**: His tools consistently age well. The API surface (50+ commands with consistent patterns) is well-designed for agent consumption — predictable, text-oriented, pipe-friendly.

---

## What's NOT Relevant

- **No context compression**: Unlike agent-browser's Snapshot + Refs (93% reduction), Rodney dumps raw text/HTML. For complex pages, this will consume significant context window. For agents doing heavy E2E testing across many pages, agent-browser remains superior on token economics.

- **No semantic locators**: Rodney uses CSS selectors for element targeting, not ARIA-based semantic refs. This makes tests more brittle to DOM changes — a known anti-pattern for AI-driven testing. agent-browser's approach is architecturally better here.

- **Go build requirement**: While the resulting binary is self-contained, building from source requires Go 1.21+. Not a dealbreaker but adds a build step vs. agent-browser's npm-or-binary distribution.

- **No network interception/mocking**: Cannot mock API responses for deterministic testing. agent-browser supports this; Rodney does not. For our 70/30 deterministic principle, this is a gap.

- **Early maturity**: 533 stars, ~1 month old, 25 open issues. The API surface may still shift. Not yet battle-tested at scale.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Evaluate as a lightweight E2E smoke-test tool for agent worktrees. The per-worktree `--local` isolation is immediately valuable. Use alongside (not replacing) Chrome DevTools MCP — Rodney for quick assertions, MCP for deep inspection. The accessibility commands (`ax-tree`, `ax-find`) should be tested against BITV 2.0 requirements for gov contracts.

- **Phase 3 (Days 60-90)**: If context budget becomes a constraint in E2E testing, compare Rodney's text output vs. agent-browser's Snapshot+Refs for token cost. Rodney may win for simple smoke tests (fewer commands = fewer tokens); agent-browser wins for complex page interactions. A hybrid approach — Rodney for assertions, agent-browser for navigation on complex pages — could be optimal.

- **Phase 4 (Days 90+)**: If we formalize a "browser agent" persona, Rodney's pure-CLI design could be wrapped as an MCP tool set (one MCP tool per Rodney command) for agents that prefer MCP over bash. Simon Willison may build this himself given his track record.

---

## Competitive Positioning

| Feature | Rodney | agent-browser | Bowser | Chrome DevTools MCP |
|---------|--------|---------------|--------|---------------------|
| Context reduction | None (raw text) | 93% (Snapshot+Refs) | None | None |
| Infrastructure | Binary + Chrome | Binary + Node daemon + Chrome | Playwright + Claude Code | MCP server + Chrome |
| Selectors | CSS | Semantic (ARIA) | CSS / Accessibility tree | CSS / CDP |
| Per-worktree isolation | Yes (`--local`) | No | No | No |
| Accessibility audit | Yes (ax-tree/find/node) | Limited | No | Yes (CDP) |
| Network mocking | No | Yes | No | Yes (CDP) |
| Exit code assertions | Yes (0/1/2) | No | No | N/A |
| Auth proxy support | Yes (built-in) | No | Yes (real Chrome cookies) | No |
| Stars | 533 | 19,900 | 184 | N/A |

---

## Key Takeaway

> **Rodney is the simplest correct browser automation CLI for coding agents — zero-daemon, per-worktree isolation, shell-native assertions, and accessibility inspection make it the ideal lightweight E2E smoke-test companion, though agent-browser remains superior for token-intensive complex page interactions.**
