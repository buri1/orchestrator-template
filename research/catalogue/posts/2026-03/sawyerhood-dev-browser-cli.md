# Introducing dev-browser CLI: Let Agents Write Browser Code

> **@sawyerhood — 2026-03-25**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/sawyerhood/status/2036842374933180660) |
| Author | @sawyerhood (Sawyer Hood) |
| Date | 2026-03-25 |
| Topics | browser-automation, agent-tooling, CLI, Claude Code, sandboxing |
| Type | Single post (with video demo) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **"The fastest way for an agent to use a browser is to let it write code"** — dev-browser flips the paradigm from MCP/API-based browser control to agents writing sandboxed Playwright scripts. Instead of multi-turn tool calls, the agent generates a complete browser automation script that executes in one shot.
2. **Benchmarks beat Playwright MCP on every metric** — 3m53s vs 4m31s (14% faster), $0.88 vs $1.45 (39% cheaper), 29 turns vs 51 (43% fewer interactions), both at 100% success rate.
3. **QuickJS WASM sandbox** — Scripts run in a lightweight JavaScript engine compiled to WASM, not Node.js, providing security isolation. File I/O restricted to `~/.dev-browser/tmp/`.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | CLI-first browser automation designed for AI agents directly addresses our E2E testing gate (Rule 2) and tmux-based architecture. The "agent writes code" paradigm aligns with Master Blueprint principle 2 (deterministic orchestration, LLM execution). |

---

## Full Content

> Introducing the new dev-browser cli. The fastest way for an agent to use a browser is to let it write code. Just `npm i -g dev-browser` and tell your agent to 'use dev-browser'

[Video demo: 30s, 1920x1080 — shows agent writing and executing browser automation scripts via CLI]

---

## Tool Details (from GitHub)

| Field | Value |
|-------|-------|
| Repository | [SawyerHood/dev-browser](https://github.com/SawyerHood/dev-browser) |
| Stars | 4,017 |
| License | MIT |
| Language | TypeScript |
| Browser Engine | Chromium via Playwright |
| Script Runtime | QuickJS WASM sandbox |

### Architecture

- CLI tool (`npm i -g dev-browser`)
- Auto-connects to running Chrome or launches fresh Chromium
- Persistent pages: navigate once, interact across multiple scripts without reconnecting
- Full Playwright API: goto, click, fill, locators, evaluate, screenshots
- `page.snapshotForAI()` returns AI-friendly page representation
- File I/O sandboxed to `~/.dev-browser/tmp/`
- Claude Code integration: pre-approve with `"Bash(dev-browser *)"` in settings

### Benchmarks (from dev-browser-eval)

| Method | Duration | Cost | Turns | Success |
|--------|----------|------|-------|---------|
| Dev Browser | 3m 53s | $0.88 | 29 | 100% |
| Playwright MCP | 4m 31s | $1.45 | 51 | 100% |
| Playwright Skill | 8m 07s | $1.45 | 38 | 67% |
| Chrome Extension | 12m 54s | $2.81 | 80 | 100% |

---

## Notable Replies

[23 replies, not individually accessible via API — high engagement: 207 likes, 270 bookmarks, 21.7K views. The 1.3:1 bookmark-to-like ratio signals strong practitioner save-for-later intent.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/SawyerHood/dev-browser | Full tool evaluation with feature matrix | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| dev-browser | The announced tool itself | No — **should be added via `/tool-catalogue`** |
| Playwright MCP | Benchmark comparison baseline | Yes — [agent-browsers/playwright-mcp.md](../agent-browsers/playwright-mcp.md) |
| Claude Code | Target integration platform | N/A (our primary tool) |
