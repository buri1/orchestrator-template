# Amp Code

> **An AI coding agent built by Sourcegraph — engineered for outcomes, with no token constraints.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [ampcode.com](https://ampcode.com/) (proprietary; [examples repo](https://github.com/sourcegraph/amp-examples-and-guides)) |
| GitHub Stars | N/A — proprietary product (examples repo: 44 stars as of 2026-03-08) |
| Publisher | Amp Inc. (spun out of Sourcegraph, $223M total funding, $2.6B valuation) — bigtech |
| License | Proprietary (free tier available) |
| Tech Stack | Claude Opus 4.6, GPT-5.4, GPT-5.3 Codex, Bun (CLI), VS Code/JetBrains/Neovim/Zed extensions |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | It's a coding agent, not an orchestration tool. We already have Claude Code as our coding workhorse. Amp is a competitor to our existing setup, not a complement. |
| **Novelty** | 6/10 | The sub-agent architecture (Oracle, Librarian, Painter) and the "Deep mode" with configurable reasoning effort are interesting design patterns. The Skills system for shareable instruction packages is worth noting. |
| **Actionable** | 3/10 | We're committed to Claude Code. Switching to Amp would require rearchitecting our entire orchestrator. The sub-agent patterns are informative but not directly adoptable. |

---

## Overview

Amp is Sourcegraph's AI coding agent, now being spun out as an independent company (Amp Inc.) led by Sourcegraph co-founders Quinn Slack and Beyang Liu. It positions itself as a "frontier coding agent" with three operational modes: Smart (unconstrained, best model), Rush (faster/cheaper), and Deep (extended reasoning with configurable effort levels).

The most architecturally interesting aspect is Amp's sub-agent system. Rather than one monolithic agent, Amp decomposes work into specialized sub-agents: Oracle (complex reasoning, uses GPT-5.4 with high reasoning), Librarian (cross-repo code search across all public GitHub and private repos), Painter (image generation via Gemini 3 Pro Image), and Task (independent parallel worker spawning). This multi-model routing — where different sub-agents use different foundation models optimized for their specific function — is a production-grade implementation of the model-routing pattern.

Amp supports CLI (`amp` and `amp -x "prompt"`), IDE extensions, and a web UI for thread sharing. It uses AGENTS.md files for codebase-specific instructions, has a Skills system for shareable instruction packages, and supports MCP servers. The free tier offers a $10 daily grant supported by ads.

---

## Technical Architecture

```
┌───────────────────────────────────┐
│          Amp Agent Core           │
│  ┌─────────┐  ┌────────────────┐ │
│  │ Smart   │  │ Deep Mode      │ │
│  │ Mode    │  │ (Extended      │ │
│  │         │  │  Reasoning)    │ │
│  └─────────┘  └────────────────┘ │
├───────────────────────────────────┤
│         Sub-Agent Layer           │
│  ┌────────┐ ┌──────────────────┐ │
│  │Oracle  │ │Librarian         │ │
│  │GPT-5.4 │ │Cross-repo search │ │
│  ├────────┤ ├──────────────────┤ │
│  │Painter │ │Task              │ │
│  │Gemini  │ │Parallel workers  │ │
│  └────────┘ └──────────────────┘ │
├───────────────────────────────────┤
│        Integration Layer          │
│  MCP Servers │ Skills │ AGENTS.md │
├───────────────────────────────────┤
│        Interface Layer            │
│  CLI (Bun) │ VS Code │ Web UI    │
└───────────────────────────────────┘
```

**Key technical decisions:**
- **Multi-model routing**: Different sub-agents use different foundation models (Claude Opus, GPT-5.4, Gemini 3 Pro) based on task type
- **200k token context window**: Full codebase understanding without chunking
- **Thread-based conversations**: Persistent, shareable, with git commit trailers
- **Permission system**: Built-in allow-lists for common dev commands
- **Skills system**: Shareable instruction packages, installable via git URLs, can bundle MCP servers via `mcp.json`

---

## Publisher Background

Amp is being spun out of Sourcegraph, which was founded by Quinn Slack and Beyang Liu. Sourcegraph raised $223M total ($125M Series D in 2021 at $2.6B valuation) and built the definitive code search platform used by companies like Uber, Lyft, and Yelp. The new Amp Inc. will be led by both co-founders, with Dan Adler taking over as CEO of the remaining Sourcegraph code search business. This pedigree — deep code intelligence expertise plus substantial funding — makes Amp a serious, well-resourced competitor in the AI coding space. Sourcegraph hit $50M revenue with 184 employees in 2025.

---

## What's Valuable for Us

1. **Sub-agent architecture with model routing**: The pattern of routing different task types to different foundation models (reasoning to GPT-5.4, search to a dedicated retrieval agent, images to Gemini) is a production-validated implementation of specialized agent routing. We could apply this principle within our orchestrator.

2. **Skills system**: Shareable, installable instruction packages that bundle prompts + MCP servers. This is a more structured version of our slash commands and could inform how we package reusable orchestrator capabilities.

3. **AGENTS.md convention**: Similar to our CLAUDE.md but adopted by a major tool — validates the "guidance file in repo root" pattern for codebase-specific agent instructions.

4. **Deep mode with configurable reasoning effort**: The idea of toggling reasoning depth (Medium/High/Extra-High) per task is a pattern we could apply to our agent spawning — some tasks need cheap/fast agents, others need deep reasoning.

---

## What's NOT Relevant

- **IDE integration**: We are terminal-first. VS Code/JetBrains extensions don't fit our architecture.
- **Web UI and thread sharing**: We don't share coding sessions. Our orchestrator state lives in JSON files and tmux.
- **Free tier with ads**: Our production system runs on Claude Max $200/mo. We don't need a free tier supported by ads.
- **Proprietary platform lock-in**: Our architecture principle is to stay on open/flexible tooling. Amp is a walled garden with a proprietary credit system.

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: If we need multi-model routing (e.g., using Claude for code generation but GPT for specific reasoning tasks), Amp's sub-agent architecture is a reference implementation to study.
- **Phase 4 (Days 90+)**: If Sourcegraph's code search capabilities become available via MCP, the Librarian pattern could enhance our agents' ability to search across multiple repos in our federated architecture.

---

## Key Takeaway

> **Amp's multi-model sub-agent routing (Oracle/Librarian/Painter/Task) is the most production-mature implementation of specialized agent dispatching — worth studying as a pattern even though we won't adopt the tool itself.**
