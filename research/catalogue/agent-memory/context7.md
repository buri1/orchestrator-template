# Context7

> **Up-to-date code documentation for LLMs and AI code editors — no hallucinated APIs, no outdated code generation.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | [github.com/upstash/context7](https://github.com/upstash/context7) |
| GitHub Stars | 48,100 (as of 2026-03-08) |
| Publisher | Upstash (startup — serverless data platform) |
| License | MIT |
| Tech Stack | TypeScript, Node.js, pnpm monorepo, MCP protocol |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Solves documentation context for coding agents, not orchestration context. Our agents already get context via prompt engineering and file-based state, not library docs. |
| **Novelty** | 3/10 | MCP-based doc retrieval is a known pattern. The llms.txt / documentation indexing approach is well-trodden ground. |
| **Actionable** | 3/10 | Could add as MCP server to coding agents for better library usage, but this is a nice-to-have, not a bottleneck for us. |

---

## Overview

Context7 is an MCP server that fetches up-to-date, version-specific documentation and code examples directly into LLM prompts. Instead of relying on the model's training data (which may reference outdated APIs), Context7 indexes entire project documentation libraries, pre-processes them, and delivers clean, filtered snippets on demand via a proprietary ranking algorithm.

The system exposes two MCP tools: `resolve-library-id` (converts a general library name into a Context7-compatible ID) and `query-docs` (retrieves documentation for a specific library). It supports both a remote HTTP endpoint (`mcp.context7.com/mcp`) and a local stdio transport via npx. The project has exploded in popularity (48K+ stars) largely because it solves the very common "hallucinated API" problem that plagues AI code editors.

Context7 is backed by Upstash, a well-funded serverless data infrastructure company known for Redis and Kafka products. The core indexing/ranking engine is proprietary (not in the public repo), with the open-source portion being the MCP server interface layer.

---

## Technical Architecture

```
┌─────────────────┐     MCP Protocol     ┌──────────────────┐
│  AI Code Editor  │◄────────────────────►│  Context7 Server │
│  (Cursor/Claude) │                      │  (TypeScript)    │
└─────────────────┘                      └────────┬─────────┘
                                                  │ API
                                         ┌────────▼─────────┐
                                         │  Context7 Backend │
                                         │  (Proprietary)    │
                                         │  - Doc Crawler    │
                                         │  - Indexer        │
                                         │  - Ranking Engine │
                                         └──────────────────┘
```

- **Data model**: Library → versioned documentation → pre-processed snippets
- **Core abstractions**: `resolve-library-id` and `query-docs` MCP tools
- **Integration**: MCP protocol (works with any MCP-compatible client)
- **Infrastructure**: Upstash-hosted backend; local MCP server is just a thin client
- **Auth**: OAuth 2.0 support for authenticated access

---

## Publisher Background

Upstash is a well-established serverless data platform company, known for Upstash Redis and Upstash Kafka. They have significant venture funding and a track record of building developer infrastructure. Context7 was originally a separate project (context7-legacy repo still exists) that Upstash acquired/absorbed. The team has deep experience in building scalable, developer-facing APIs.

---

## What's Valuable for Us

- **MCP integration pattern**: The two-tool MCP interface (`resolve` then `query`) is a clean pattern for any context retrieval service. If we build custom MCP servers for our orchestrator state or knowledge base, this is a good reference for API design.
- **Documentation freshness problem**: When our coding agents work with rapidly evolving libraries, Context7 could reduce hallucination. But this is a quality-of-life improvement, not architectural.

---

## What's NOT Relevant

- **Not an orchestration tool**: Context7 is about feeding documentation to coding agents. Our orchestrator doesn't write code (Rule #1: "DU BIST KEIN ENTWICKLER") and our coding agents already get context through file-based state and prompt engineering.
- **Proprietary backend**: The actual intelligence (indexing, ranking) is closed-source. We can't study or adapt the core algorithms.
- **IDE-centric**: Designed for Cursor/Windsurf/VS Code workflows. Our terminal-first Claude Code approach doesn't need IDE integrations.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Could add as an MCP server to coding agents if we see hallucinated API calls becoming a problem. Low priority.
- **Phase 4 (Days 90+)**: If we build a SaaS factory that spins up many projects with diverse tech stacks, Context7 becomes more valuable for ensuring coding agents use correct, current APIs across all stacks.

---

## Key Takeaway

> **Context7 is the most popular MCP server for injecting fresh library docs into LLM prompts, but it solves a coding-agent problem, not an orchestration problem — useful as a quality-of-life add-on for our worker agents, not a strategic tool.**
