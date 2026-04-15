# Agent Browsers -- Comparative Index

> Browser automation tools designed for AI coding agents. Ranked by relevance to our orchestrator system's E2E testing gate (Rule 2) and terminal-first, tmux-based architecture.

Last updated: 2026-03-25

---

## Ranking

| Rank | Tool | Score | MCP? | Stars | Summary | Best For |
|------|------|-------|------|-------|---------|----------|
| 1 | [agent-browser](./agent-browser.md) | 9/10 | No (CLI) | 24.8K | Rust CLI, 93% context reduction via Snapshot+Refs, semantic locators | E2E testing gate (primary) |
| 2 | [Playwright MCP](./playwright-mcp.md) | 8/10 | **Yes** | 29.6K | Microsoft's official MCP server; accessibility tree; `--vision auto` | Claude Code native browser |
| 3 | [Rodney](./rodney.md) | 8/10 | No (CLI) | 621 | Go CLI, per-worktree isolation, shell assertions, accessibility audit | Lightweight E2E smoke tests |
| **4** | **[dev-browser](./dev-browser.md)** | **7/10** | No (CLI) | 4K | Agent writes sandboxed Playwright scripts (QuickJS WASM); beats Playwright MCP: 14% faster, 39% cheaper, 43% fewer turns | **Claude Code CLI browser** |
| 5 | [Stagehand](./stagehand.md) | 7/10 | Yes | 21.7K | Hybrid AI+code; auto-caching; self-healing; TypeScript-native | Hybrid deterministic+AI flows |
| 6 | [browser-use](./browser-use.md) | 6/10 | Community | 84.3K | Largest community; Python+Playwright; 89% WebVoyager | Python agent systems |
| 7 | [Bowser](./bowser.md) | 6/10 | No | 184 | IndyDevDan's 4-layer architecture; YAML user stories; Justfile | Pattern reference |
| 8 | [Lightpanda](./lightpanda.md) | 6/10 | No | 24.7K | Zig headless browser; 11x faster, 9x less memory; CDP-compatible | Performance-critical headless |
| 9 | [Page Agent](./page-agent.md) | 5/10 | No | 5.8K | Alibaba's in-page JS agent; BYOK; no backend; copilot SDK | SaaS copilot embedding |
| 10 | [Steel](./steel.md) | 5/10 | No | 6.7K | Open-source browser API; session mgmt, stealth, Docker | Cloud browser infrastructure |
| 11 | [Skyvern](./skyvern.md) | 5/10 | No | 21K | Vision-LLM browser automation; no-code builder; forms specialist | Complex form filling / RPA |
| 12 | [AgentQL](./agentql.md) | 4/10 | No | 1.3K | Natural language query selectors; structured extraction | Data extraction |
| 13 | [Notte](./notte.md) | 4/10 | No | 1.9K | Full-stack hybrid framework; scripting + AI; credential vault | Production web agents |
| 14 | [Hyperbrowser](./hyperbrowser.md) | 4/10 | No | 1.1K | Cloud browser-as-a-service; two-tier action model; CAPTCHA solving | Scale-out browser capacity |
| 15 | [Anthropic Computer Use](./anthropic-computer-use.md) | 3/10 | API | N/A | Screenshot+keyboard/mouse desktop control; Dispatch; macOS beta | Desktop automation (non-browser) |
| 16 | [BrowserOS](./browseros.md) | 2/10 | No | 10.1K | Chromium fork with native AI agents; consumer-oriented | Personal browsing automation |
| 17 | [Puppeteer MCP](./puppeteer-mcp.md) | 1/10 | Deprecated | N/A | Original Anthropic MCP reference impl; archived; use Playwright MCP | **Do not use** |

---

## Detailed Comparison

### Evaluation Criteria

| Criterion | Description | Weight |
|-----------|-------------|--------|
| **Agent-native** | Designed for agents, not humans scripting browsers | High |
| **MCP support** | Works as MCP server for Claude Code | High |
| **CLI-first** | Can be invoked as shell commands by tmux agents | High |
| **Context efficiency** | How much token budget it consumes per interaction | High |
| **Per-worktree isolation** | Separate browser state per git worktree / agent | Medium |
| **Stealth** | Can pass bot detection (Cloudflare, Akamai, etc.) | Low |
| **Speed** | Headless performance, startup time | Medium |
| **Maintenance** | Active development, community size, backing | Medium |

### Feature Matrix

| Feature | agent-browser | Playwright MCP | Rodney | dev-browser | Stagehand | browser-use | Lightpanda |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| CLI-first | **Yes** | No (MCP) | **Yes** | **Yes** | No (SDK) | No (SDK) | No |
| Context reduction | **93%** | None | None | snapshotForAI() | Caching | None | N/A |
| MCP server | No | **Yes** | No | No | Yes | Community | No |
| Per-worktree isolation | No | No | **Yes** | No | No | No | N/A |
| Semantic locators | **Yes** (ARIA) | No (CSS) | No (CSS) | Via code | Yes (NL) | Yes (NL) | N/A |
| Accessibility audit | Limited | Yes (tree) | **Yes** (ax-*) | No | No | No | No |
| Network mocking | **Yes** | Yes | No | Via code | No | No | Yes |
| Auth state persistence | **Yes** | Yes (ext) | Yes (proxy) | Yes (pages) | No | Yes | No |
| Shell exit codes | No | N/A | **Yes** (0/1/2) | No | No | No | No |
| Vision mode | No | **Yes** (auto) | No | No | Yes | Yes | No |
| Stealth/anti-detect | No | No | No | No | Via cloud | **Yes** (81%) | No |
| Self-healing | **Yes** (semantic) | No | No | Via code | **Yes** | Yes (NL) | No |
| Sandbox security | No | No | No | **Yes** (QuickJS WASM) | No | No | No |
| Stars | 24.8K | 29.6K | 621 | 4K | 21.7K | 84.3K | 24.7K |
| License | Apache-2.0 | Apache-2.0 | Apache-2.0 | MIT | MIT | MIT | AGPL-3.0 |
| Language | Rust+Node | TypeScript | Go | TypeScript | TypeScript | Python | Zig |

### Token Cost Comparison

| Tool | Tokens per typical E2E task | Method |
|------|---------------------------|--------|
| agent-browser (Snapshot+Refs) | ~8K | Semantic refs, compact text |
| Rodney (text output) | ~15-25K | Raw text extraction |
| dev-browser (snapshotForAI) | ~20-30K | Agent writes scripts; 29 turns/$0.88 per task |
| Playwright CLI (`@playwright/cli`) | ~27K | Accessibility tree (CLI mode) |
| Stagehand (cached) | ~0 (replay) | Deterministic replay, no LLM |
| Playwright MCP | ~114K | Full accessibility tree via MCP (51 turns/$1.45) |
| browser-use | ~50-100K | Full page state + screenshots |
| Anthropic Computer Use | ~150-300K | Screenshots + vision model |

---

## Recommendation

### For our orchestrator's E2E testing gate (Rule 2):

**Primary: agent-browser** (Vercel Labs)
- 93% context reduction is transformative for multi-agent E2E testing economics
- CLI-first design fits our tmux-based architecture perfectly
- Semantic locators (ARIA roles) are more resilient than CSS selectors
- Network mocking enables deterministic test assertions
- 24.8K stars, Apache-2.0, actively maintained by Vercel

**Secondary: Rodney** (Simon Willison)
- Per-worktree isolation via `--local` flag directly supports our git-worktree-per-agent architecture
- Shell exit codes (0/1/2) enable deterministic bash assertions
- Accessibility audit commands (`ax-tree`, `ax-find`) for BITV 2.0 compliance
- Single Go binary, zero daemon overhead
- Use for quick smoke tests where agent-browser's daemon is overkill

**Alternative: dev-browser** (Sawyer Hood) — NEW
- "Let agents write code" paradigm: agent generates sandboxed Playwright scripts instead of multi-turn MCP calls
- Benchmarks beat Playwright MCP: 14% faster (3m53s vs 4m31s), 39% cheaper ($0.88 vs $1.45), 43% fewer turns (29 vs 51)
- CLI-first (`npm i -g dev-browser`), fits tmux architecture
- QuickJS WASM sandbox for security isolation
- `snapshotForAI()` for compact page representation
- Pre-approve in Claude Code settings: `"Bash(dev-browser *)"`
- 4K stars, MIT, TypeScript — monitor for maturity
- **Trade-off vs agent-browser**: No 93% context reduction, no semantic locators. **vs Rodney**: No per-worktree isolation, no shell exit codes
- Best for: Claude Code users who want the simplest CLI browser with minimal setup

**Fallback: Playwright MCP**
- Already integrated into Claude Code natively
- 29.6K stars, Microsoft-backed, will always be maintained
- Use when vision mode is needed (canvas, WebGL, complex visualizations)
- Consider `@playwright/cli` companion for 4x token savings over MCP mode

### Tools to monitor:

- **Stagehand**: Auto-caching could eliminate LLM calls for repeated E2E flows. Monitor v3+ for maturity.
- **Lightpanda**: 11x faster, 9x less memory than Chrome. If it matures to full CDP compatibility, it becomes the ideal Rodney/agent-browser backend.
- **Notte**: Hybrid scripting+AI philosophy aligns with our 70/30 principle. Watch if they ship an MCP server.

### Tools to skip:

- **Anthropic Computer Use**: Too token-heavy (150-300K/task), too slow for E2E pipelines
- **Skyvern/browser-use**: Python-primary, not CLI-first, designed for scraping/RPA not E2E testing
- **BrowserOS**: Consumer browser, not a developer tool
- **Puppeteer MCP**: Deprecated, use Playwright MCP instead

---

## Related Catalogue Entries

| Entry | Location | Relationship |
|-------|----------|-------------|
| [Browser & E2E Testing Tools](../reference/browser-e2e-testing-tools.md) | Reference | Comprehensive evaluation including security + CI tools |
| [Stealth Benchmark Article](../articles/2026-03/browser-use-stealth-benchmark-cloud-browsers.md) | Article | Cloud browser stealth comparison (42-81%) |
| [Mind2Web 97% Article](../articles/2026-03/browser-use-mind2web-online-benchmark-97-percent.md) | Article | Browser Use Cloud hits 97% on Mind2Web Online; full leaderboard including Stagehand (55-65%); ranking unchanged |
| [sawyerhood — dev-browser CLI announcement](../posts/2026-03/sawyerhood-dev-browser-cli.md) | Post | Launch post with benchmarks; enters ranking at #4 |
| [IndyDevDan](../practitioners/indydevdan.md) | Practitioner | Creator of Bowser |
| [Simon Willison](../talks/2026-03/simon-willison-agentic-engineering-pragmatic-summit.md) | Talk | Creator of Rodney |
| [cmux](../developer-gui/cmux.md) | Developer GUI | Scriptable browser built into cmux (Snapshot+Refs) |
