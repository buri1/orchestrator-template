# Conare

> **Persistent context management UI for Claude Code and OpenAI Codex — upload docs, rules, specs once and your AI never starts from zero.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | Closed-source (no public GitHub repo) |
| GitHub Stars | N/A (proprietary macOS app) |
| Publisher | Artem Murzin (@flowisgreat) — solo/bootstrapped |
| License | Proprietary (commercial) |
| Tech Stack | Rust (core), macOS native, CLAUDE.md injection |
| Maturity | 🟡 Early (v0.6.20, alpha since Oct 2025) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Claude Code memory layer, reportedly 15K monthly users. From user's Airtable research list. Closed-source GUI wrapper — interesting context injection pattern via CLAUDE.md, but we already manage CLAUDE.md programmatically in the orchestrator. The "vibe rules" concept is essentially what our agent personas and command files already do. Main value is the visual token tracking — we could learn from that for our observability layer.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Solves context management for individual devs; our system already has CLAUDE.md, agent personas, and context separation built into the orchestrator architecture |
| **Novelty** | 3/10 | CLAUDE.md injection is a known pattern; token tracking UI is mildly interesting but ccusage covers our needs; "vibe rules" are repackaged prompt templates |
| **Actionable** | 2/10 | Closed-source, macOS-only GUI app — nothing to adopt, fork, or integrate. Our orchestrator already handles context injection programmatically |

---

## Overview

Conare is a macOS desktop application (~14MB, ~80MB RAM) that wraps existing Claude Code and OpenAI Codex CLI installations, adding a visual layer for persistent context management. Built in Rust by 18-year-old solo developer Artem Murzin in Warsaw, it launched in alpha in October 2025 and has reportedly gained 500+ paying customers.

The core mechanism is straightforward: Conare temporarily writes context (documents, rules, file references) into Claude Code's `CLAUDE.md` configuration file before each command execution, then removes it afterward. This means Claude Code receives enhanced prompts without any model modification — it simply sees a richer `CLAUDE.md` file. Context items are stored locally in `~/.conare/` and can be toggled on/off per conversation.

The app provides three main primitives: **Context Items** (documents, websites, PDFs attached via `attached-context` XML tags), **Vibe Rules** (reusable instruction sets for coding styles/patterns), and **File References** (dynamic file inclusion using `@` syntax with line numbers). Real-time token tracking shows exactly how context budget is allocated across these primitives.

---

## Technical Architecture

```
┌──────────────────────────────────────┐
│          Conare macOS App            │
│            (Rust core)               │
│                                      │
│  ┌─────────┐  ┌──────────┐          │
│  │ Context  │  │  Vibe    │          │
│  │ Manager  │  │  Rules   │          │
│  └────┬─────┘  └────┬─────┘          │
│       │              │               │
│       ▼              ▼               │
│  ┌──────────────────────────┐        │
│  │   CLAUDE.md Injector     │        │
│  │ (write before cmd,       │        │
│  │  remove after cmd)       │        │
│  └────────────┬─────────────┘        │
│               │                      │
│  ┌────────────▼─────────────┐        │
│  │  Token Tracker (live)    │        │
│  └──────────────────────────┘        │
└──────────────┬───────────────────────┘
               │
    ┌──────────▼──────────┐
    │  Claude Code CLI    │
    │  (or Codex CLI)     │
    │  reads CLAUDE.md    │
    └─────────────────────┘

Storage: ~/.conare/ (local, zero telemetry)
```

**Key architectural details:**

- **Context injection**: Writes to project-level `CLAUDE.md` temporarily — not a persistent file modification. Uses `attached-context` XML tags for document embedding.
- **MCP integration**: Visual UI for MCP server management with one-click OAuth authentication and real-time tool execution visibility.
- **Multi-provider**: Wraps both Claude Code and OpenAI Codex installations — uses whatever CLI is already installed.
- **Activity logging**: Sidebar shows file reads, writes, and updates in real-time (similar to Claude Code's native display but in a GUI).
- **No persistent memory**: Each session starts fresh — the "persistence" is in the stored context library, not in conversation memory across sessions.

---

## Publisher Background

**Artem Murzin** (@flowisgreat on X) is an 18-year-old solo developer based in Warsaw. He launched Conare 3 days after turning 18, making it his first commercial product. Prior work includes vibe-rules.com (a simpler prompt template tool). The project is fully bootstrapped — no funding, no team, no corporate backing.

Within its first weeks, Conare gained 500+ paying customers and 500K+ views on X, with 11 versions shipped and 30+ bugs fixed. The product was endorsed by Andrew Jefferson (@EastlondonDev), a "vibe-engineering" influencer.

**Credibility assessment**: Impressive execution speed for a solo teenage developer, but the closed-source proprietary model, dependency on Anthropic's CLI not changing its CLAUDE.md behavior, and single-person bus factor are significant risks. The CLAUDE.md injection pattern could break with any Claude Code update that changes how project instructions are loaded.

---

## What's Valuable for Us

**Very little that we don't already have:**

1. **Token tracking visualization pattern**: Conare's real-time display of where context tokens are spent is a useful UX concept. We could build something similar into our observability layer using ccusage data + Langfuse traces. But it's a "nice to have," not a need.

2. **Validates our CLAUDE.md approach**: The fact that a commercial product with 500+ paying customers is built entirely around CLAUDE.md injection confirms that our approach to agent configuration via CLAUDE.md and `.claude/agents/*.md` is sound.

3. **Context toggle UX**: The ability to toggle context items on/off per conversation is an interesting interaction pattern. We could implement something similar in our Notion meta-layer — storing context snippets as Notion blocks and toggling them into agent prompts.

---

## What's NOT Relevant

1. **GUI wrapper model**: Our orchestrator operates headlessly via tmux sessions and CLI. A macOS GUI app adds nothing to our architecture. (Governing Principle #2: deterministic orchestration, not visual IDEs.)

2. **Manual context management**: Conare requires a human to manually upload docs, toggle contexts, and manage rules. Our system automates context assembly — the orchestrator decides what context each agent gets. (Governing Principle #5: reduce what the human needs to review.)

3. **Single-user design**: Conare is built for one developer working with one Claude Code instance. Our architecture is multi-agent, multi-business-line, federated. (Governing Principle #6: federated systems.)

4. **Closed-source**: No code to study, adapt, or fork. No architectural insights beyond what marketing copy reveals.

5. **Temporary CLAUDE.md injection**: This is a fragile pattern — it modifies a file that other processes (including our orchestrator) might also be writing to. Race conditions are inevitable in multi-agent setups.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: None — we already have context management.
- **Phase 2 (Days 4-60)**: None — our orchestrator handles context injection programmatically.
- **Phase 3 (Days 60-90)**: None — moving to deterministic harness makes GUI wrappers irrelevant.
- **Phase 4 (Days 90+)**: If Conare open-sources or exposes an API, the token tracking module could be interesting for our observability dashboard. Otherwise, no use case.

---

## Key Takeaway

> **Conare validates that CLAUDE.md injection is a viable commercial pattern for context management, but our orchestrator already does this programmatically — there is nothing actionable to adopt from a closed-source GUI wrapper aimed at solo developers.**
