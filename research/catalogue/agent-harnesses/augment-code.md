# Augment Code / Context Engine

> **AI coding agent with a proprietary Context Engine that semantically indexes and maps your entire codebase.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/augmentcode](https://github.com/augmentcode) (proprietary product; open-source components include [augment-swebench-agent](https://github.com/augmentcode/augment-swebench-agent), [augment.vim](https://github.com/augmentcode/augment.vim)) |
| GitHub Stars | N/A — proprietary product (open-source components vary) |
| Publisher | Augment Code (Igor Ostrovsky, Guy Gur-Ari) — startup ($252M raised, $977M valuation) |
| License | Proprietary (free for open source projects) |
| Tech Stack | Proprietary semantic indexing, MCP server, VS Code/JetBrains/Vim/Terminal extensions |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | The Context Engine MCP is directly usable with Claude Code today. For large codebases across our federated business lines, semantic search beats grep. However, we're not struggling with codebase comprehension yet. |
| **Novelty** | 7/10 | The semantic indexing approach — understanding relationships between hundreds of thousands of files, not just keyword matching — is a genuinely different approach to context retrieval. The MCP exposure is novel. |
| **Actionable** | 6/10 | Can be plugged into Claude Code via MCP today. The question is whether we need it now or later. At our current codebase size, Claude Code's built-in context handling is sufficient. |

---

## Overview

Augment Code is a $977M-valuation startup that has built a proprietary "Context Engine" — a semantic code indexing system that goes far beyond grep or keyword search. It creates semantic embeddings of entire codebases, maps relationships between files, understands architectural patterns, and maintains millisecond-level sync with code changes. When an agent asks "add logging to payment requests," the Context Engine traces the complete execution path across multiple services and surfaces only the relevant code.

The breakthrough move was exposing this Context Engine via MCP (Model Context Protocol), making it available to any MCP-compatible coding agent — Claude Code, Cursor, Codex, and others. This transforms Augment from a standalone coding agent into a context infrastructure layer. You can use Augment's semantic understanding without switching away from your preferred coding agent.

The company was founded by Igor Ostrovsky (former chief architect at Pure Storage, Microsoft engineer) and Guy Gur-Ari (AI researcher from Google), with Scott Dietzen as CEO. They hit $20M revenue in October 2025 with ~156-188 employees. Their open-source SWE-bench agent is the #1 verified implementation, demonstrating the Context Engine's effectiveness on complex software engineering tasks.

---

## Technical Architecture

```
┌──────────────────────────────────────┐
│     Your Coding Agent                │
│  (Claude Code, Cursor, Codex, etc.)  │
├──────────────────────────────────────┤
│     Context Engine MCP Server        │
│  ┌────────────────────────────────┐  │
│  │ Local Mode (Auggie CLI)       │  │
│  │ - Indexes working directory   │  │
│  │ - Real-time sync on edits     │  │
│  │ - stdio MCP transport         │  │
│  ├────────────────────────────────┤  │
│  │ Remote Mode (Hosted)          │  │
│  │ - GitHub App integration      │  │
│  │ - Indexes on push to default  │  │
│  │ - HTTP MCP transport          │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│     Semantic Index Layer             │
│  - Embedding generation              │
│  - Relationship mapping              │
│  - Cross-repo understanding          │
│  - Dependency graph                  │
│  - Commit history analysis           │
│  - Pattern recognition               │
│  40-70 credits per query             │
└──────────────────────────────────────┘
```

**Key technical decisions:**
- **Semantic over syntactic**: Full semantic embeddings, not grep. Understands code meaning, not just text patterns.
- **Selective context**: Retrieves only relevant code segments. Compresses without losing critical information. Ranks by relevance.
- **Access control**: Proof-of-possession validation for repo access — respects existing permissions.
- **Dual deployment**: Local (Auggie CLI, stdio) or remote (hosted, HTTP). Local indexes in real-time; remote indexes on git push.
- **MCP-first**: Exposed as an MCP server, not a proprietary API. Works with any MCP client.

---

## Publisher Background

Strong pedigree. Igor Ostrovsky was chief architect at Pure Storage (one of the most successful storage startups, IPO'd in 2015) and previously at Microsoft. Guy Gur-Ari was an AI researcher at Google. The company raised $252M total ($227M Series B from Sutter Hill Ventures, Index Ventures, Innovation Endeavors, Lightspeed, Meritech at $977M valuation). Eric Schmidt is a backer. They hit $20M revenue in Oct 2025 — real traction, not vaporware. The #1 SWE-bench Verified ranking adds technical credibility. Team of ~156-188 people. This is a well-funded, well-led company with serious engineering depth.

---

## What's Valuable for Us

1. **Context Engine MCP for Claude Code**: This is the headline. We can add semantic codebase understanding to our existing Claude Code workflow by adding one MCP server. Setup is documented at `app.augmentcode.com/mcp/configuration` with a dedicated Claude Code quickstart guide.

2. **Cross-repo semantic search**: Our federated architecture means code is spread across multiple repos per business line. The Context Engine can index and search across repos — understanding relationships between services that grep would miss.

3. **Real-time sync (local mode)**: The Auggie CLI indexes your working directory and syncs on every edit. This means agents always have current semantic understanding, not stale embeddings.

4. **The SWE-bench agent** (`augment-swebench-agent`): Open-source, #1 on SWE-bench Verified. Worth studying for how they structure agent workflows for complex code changes.

---

## What's NOT Relevant

- **Augment as a coding agent**: We're not switching from Claude Code. We only care about the Context Engine MCP as an add-on.
- **IDE extensions**: We're terminal-first. The VS Code/JetBrains extensions are irrelevant.
- **Augment Agent product**: The full agent product competes with Claude Code. We don't need a competing agent — we need better context fed into our existing agent.
- **Credit-based pricing**: At 40-70 credits per query, costs could add up at scale. Need to evaluate pricing tiers carefully before committing.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Set up Context Engine MCP for our primary gov SaaS repo. Evaluate whether semantic search materially improves Claude Code's understanding of the codebase vs. its built-in context handling.
- **Phase 3 (Days 60-90)**: If Phase 2 validates value, extend to all business line repos. Cross-repo search becomes essential as we scale to 5+ repos.
- **Phase 4 (Days 90+)**: At enterprise scale, the Context Engine becomes infrastructure — a shared semantic index that all agents across all business lines can query. This aligns with our "thin shared layer" architecture principle.

---

## Key Takeaway

> **Augment's Context Engine MCP is the rare case where a competitor's proprietary technology can be used as infrastructure for our existing Claude Code setup — semantic codebase search as a plug-in, not a platform switch.**
