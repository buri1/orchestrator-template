# Stagehand

> **Browserbase — [github.com/browserbase/stagehand](https://github.com/browserbase/stagehand)**

| Field | Value |
|-------|-------|
| Source | [stagehand.dev](https://www.stagehand.dev/) |
| Type | Agent Browser / TypeScript SDK |
| Stars | 21,700 (as of 2026-03-25) |
| License | MIT |
| Tech Stack | TypeScript, Playwright, multi-LLM, multi-language (Python/Go/Ruby/Rust/Java/C#/Kotlin) |
| Maturity | Production (v3.6) |

---

## Summary

Stagehand is Browserbase's open-source browser automation framework that adds three AI primitives -- `act()`, `extract()`, and `observe()` -- on top of a standard Playwright page object. Its hybrid architecture lets developers combine deterministic Playwright code with AI-driven natural language interactions, choosing the right tool for each step.

Stagehand v3 is 44% faster on average, supports auto-caching (records AI actions for deterministic replay without LLM calls), self-healing (adapts when websites change), and "Canonical Stagehand" enables driver-agnostic, multi-language automation. The SDK now spans 8 programming languages via Canonical Stagehand's server architecture.

## Pros
- Hybrid AI + deterministic approach (70/30 pattern applied to browser automation)
- Auto-caching: replay workflows without LLM calls after first run
- Self-healing: adapts to website changes automatically
- TypeScript-native (aligns with our stack)
- MIT license
- Multi-language support (8 languages via Canonical Stagehand)
- v3 is 44% faster with iframe/shadow-root support
- MCP server available (Stagehand MCP)
- 21.7K stars, active Browserbase backing ($25M+ raised)
- Works with local Chromium or Browserbase cloud

## Cons
- SDK-oriented, not CLI-first -- requires integration into code
- Browserbase cloud dependency for scale/stealth features
- No per-worktree isolation concept
- Heavier than CLI tools (Rodney, agent-browser) for simple assertions
- Context consumption not optimized for agents (no Snapshot+Refs equivalent)
- Cloud browser features are paid

## Best Use Case
TypeScript projects needing reliable, hybrid AI+code browser automation with caching for repeatability and self-healing for resilience. Best when you need both deterministic tests and AI-driven navigation.

## Claude Code Integration
MCP server exists. Can be installed via `claude mcp add`. The SDK approach is better suited for programmatic integration than direct agent CLI usage. Not ideal for our tmux-based agent architecture where CLI-first tools are preferred.
