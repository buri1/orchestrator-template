# ccusage

> **A CLI tool for analyzing Claude Code/Codex CLI usage from local JSONL files.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/ryoppippi/ccusage](https://github.com/ryoppippi/ccusage) |
| GitHub Stars | 11,300 (as of 2026-03-08) |
| Publisher | @ryoppippi (solo developer, 61 contributors) |
| License | MIT |
| Tech Stack | TypeScript (99.2%), Node.js/Bun/Deno, pnpm monorepo |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | We run Claude Max $200/mo and need to track usage across multiple agent sessions. This is the exact tool for validating our 18-36x arbitrage claim with real data. |
| **Novelty** | 6/10 | Simple concept (parse JSONL logs), but the execution is polished — billing windows, per-model breakdowns, cache token tracking. |
| **Actionable** | 10/10 | `npx ccusage@latest` — zero installation, immediate results. Works with our exact stack today. Already at v18.0.9 with 107 releases. |

---

## Overview

ccusage is a zero-install CLI tool that reads Claude Code's local JSONL conversation files (`~/.claude/projects/<project>/<conversation-id>.jsonl`) and produces detailed usage reports — daily, monthly, per-session, and per-billing-window breakdowns with cost estimates. It tracks token usage across all Claude models (Opus, Sonnet, Haiku), separates cache creation from cache read tokens, and exports to JSON for further analysis.

The tool is built as a TypeScript monorepo with companion packages for other AI coding tools (Codex, OpenCode, Pi-agent, Amp) and an MCP Server integration (`@ccusage/mcp`). It's designed for extreme portability — ultra-small bundle size, runs via `npx`/`bunx` without local installation, and uses pre-cached pricing data for offline functionality.

With 11.3K GitHub stars and 107 releases (v18.0.9 as of March 2026), ccusage has become the de facto usage tracking tool for the Claude Code community. The rapid release cadence (nearly daily updates) shows an active, responsive maintainer.

---

## Technical Architecture

```
~/.claude/projects/
  ├── <project-a>/
  │   ├── <conv-1>.jsonl    ──┐
  │   └── <conv-2>.jsonl    ──┤
  └── <project-b>/            │
      └── <conv-3>.jsonl    ──┤
                               │
                    ┌──────────▼──────────┐
                    │     ccusage CLI     │
                    │  (TypeScript/Node)  │
                    ├────────────────────┤
                    │  JSONL Parser       │
                    │  Token Counter      │
                    │  Cost Calculator    │
                    │  (cached pricing)   │
                    │  Report Formatter   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────▼─────┐  ┌──────▼──────┐  ┌──────▼──────┐
        │  Terminal  │  │  JSON Export │  │  MCP Server │
        │  Tables    │  │  (--json)    │  │  (@ccusage/ │
        │            │  │              │  │   mcp)      │
        └───────────┘  └─────────────┘  └─────────────┘
```

**Monorepo packages:**
- `ccusage` — main Claude Code analyzer
- `@ccusage/codex` — OpenAI Codex CLI tracking
- `@ccusage/opencode` — OpenCode tracking
- `@ccusage/pi` — Pi-agent tracking
- `@ccusage/amp` — Amp tracking
- `@ccusage/mcp` — Model Context Protocol server for AI-assisted usage analysis

**Key design decisions:**
- Reads local files only — no network calls, no API keys, no privacy concerns
- Pre-cached pricing data for offline operation
- Timezone/locale-aware reporting
- 5-hour billing window tracking (matches Claude Max subscription windows)

---

## Publisher Background

Built by @ryoppippi, a solo developer who has built a highly active open-source profile. The project has attracted 61 contributors and achieved 11.3K stars — remarkable for a utility tool. The release cadence (107 releases, nearly daily at times) demonstrates obsessive attention to the Claude Code ecosystem's evolving needs. The MCP server integration shows forward-thinking about how usage data could be consumed by agents themselves.

---

## What's Valuable for Us

1. **Arbitrage validation**: We claim 18-36x cost arbitrage with Claude Max $200/mo. ccusage gives us actual token counts and cost estimates to prove this to clients and ourselves. Run `npx ccusage monthly --breakdown` to see per-model costs.

2. **Billing window awareness**: The 5-hour billing window tracking (`npx ccusage window`) is critical for understanding when we're hitting Claude Max rate limits during multi-agent orchestration sessions.

3. **Per-session tracking**: `npx ccusage session` maps directly to our L-Thread model — each agent session shows its individual token consumption. This is the data we need to optimize agent efficiency.

4. **MCP Server integration**: `@ccusage/mcp` means our orchestrator could query usage data programmatically — imagine an agent that auto-throttles when approaching billing window limits.

5. **JSON export pipeline**: `--json` flag enables us to pipe usage data into our own dashboards, Langfuse, or Notion-based reporting for clients.

6. **Zero operational overhead**: No server to deploy, no database to manage, no config files to maintain. It reads the files Claude Code already produces.

---

## What's NOT Relevant

- **Companion packages** (Codex, OpenCode, Amp, Pi): We're Claude-only. These are irrelevant unless we diversify AI tooling.
- **Fine-grained cost estimation**: Since we're on Claude Max (flat rate), the dollar-amount cost estimates are hypothetical — useful for understanding what we'd pay on API pricing, but not our actual costs.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Run `npx ccusage daily` and `npx ccusage monthly` immediately. Establish baseline usage patterns. Zero setup required.
- **Phase 2 (Days 4-60)**: Integrate `@ccusage/mcp` into the orchestrator for real-time usage awareness. Build billing window tracking into agent scheduling logic — don't spawn 5 agents if we're near a window limit.
- **Phase 3 (Days 60-90)**: Pipe `--json` output into Langfuse or a custom dashboard for client-facing usage reports. Combine with Langfuse traces for a complete "what did the agents do and how much did it cost" view.
- **Phase 4 (Days 90+)**: As we scale across business lines, per-project usage tracking becomes essential for internal cost allocation and client billing.

---

## Key Takeaway

> **ccusage is the highest-ROI tool in this catalogue — zero install, immediate value, TypeScript-native, and directly validates the Claude Max cost arbitrage that underpins our entire business model.**
