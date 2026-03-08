# Aider

> **AI pair programming in your terminal — works best with Claude 3.7 Sonnet, supports 100+ languages via tree-sitter, automatic git commits, and a repo-map system that gives LLMs structural understanding of your entire codebase.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [Aider-AI/aider](https://github.com/Aider-AI/aider) |
| GitHub Stars | 41,600+ (as of 2026-03-08) |
| Publisher | Aider AI (solo-turned-startup — Paul Gauthier, ex-Microsoft) |
| License | Apache-2.0 |
| Tech Stack | Python, tree-sitter (AST parsing), NetworkX (graph ranking), diskcache, Git CLI |
| Maturity | 🟢 Production (v0.80+, 13K+ commits, 88% of code self-authored by Aider) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Aider is a single-developer pairing tool, not an orchestration platform. The repo-map and tree-sitter architecture are genuinely interesting for context management, but it lacks multi-agent coordination, MCP support, or any orchestration primitives. It solves developer productivity, not agent orchestration. |
| **Novelty** | 6/10 | The tree-sitter + PageRank repo-map system is a genuinely novel approach to codebase context that we haven't seen replicated well elsewhere. The search/replace edit format and benchmark suite (SWE-bench, Exercism) are well-documented reference implementations. |
| **Actionable** | 3/10 | Can't adopt directly — Python-only, no SDK/API mode, no MCP, no multi-agent. The repo-map algorithm concept could inform how we feed codebase context to worker agents, but that's a "study the paper" level of actionability, not "adopt this week." |

---

## Overview

Aider is the OG terminal-based AI coding assistant, started by Paul Gauthier (ex-Microsoft Principal Architect) in mid-2023. It pioneered the "AI pair programming in your terminal" paradigm that Claude Code, OpenCode, and others followed. Aider's core insight is that LLMs need structural understanding of a codebase, not just raw file contents — and it solves this with a tree-sitter-powered "repo map" that uses PageRank to identify the most relevant code elements across the entire repository.

The tool works by maintaining a conversation with an LLM (Claude 3.7 Sonnet recommended, but supports dozens of providers), presenting it with a ranked subset of the codebase context, and applying edits via a search/replace block format. All changes are automatically committed to git with AI-generated commit messages. Aider has a strong benchmark culture — it maintains public SWE-bench and Exercism leaderboards showing how different LLMs perform with Aider's editing formats.

Aider is remarkably self-hosting: 88% of recent release code was written by Aider itself (the "Singularity" metric). This is a compelling proof-of-concept for autonomous coding agents, though it operates strictly as a single-agent, human-in-the-loop tool — there is no multi-agent coordination, no API/server mode, and no MCP support.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Aider CLI (Python)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │         LLM Provider Layer                      │  │
│  │  Claude / GPT-4o / DeepSeek / Ollama / 50+     │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Repo Map Engine                         │  │
│  │  tree-sitter AST → Tags (def/ref) →            │  │
│  │  NetworkX MultiDiGraph → PageRank →             │  │
│  │  Token-budgeted context string                  │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Edit Formats                            │  │
│  │  search/replace blocks │ whole-file │ diff      │  │
│  ├────────────────────────────────────────────────┤  │
│  │         Git Integration                         │  │
│  │  Auto-commit │ undo │ diff view │ .gitignore    │  │
│  ├────────────────────────────────────────────────┤  │
│  │         I/O Layer                               │  │
│  │  CLI REPL │ Watch mode (IDE) │ Voice │ Images   │  │
│  └────────────────────────────────────────────────┘  │
│              diskcache for tag persistence             │
└───────────────────────────────────────────────────────┘
```

**Key Components:**

- **Repo Map (RepoMap class):** Parses all source files via tree-sitter into Tags (`rel_fname, fname, line, name, kind`). Builds a NetworkX MultiDiGraph where nodes are files and edges connect files with dependencies. Runs PageRank with personalization (boosting files the user is actively editing) to select the most relevant context that fits the token budget.
- **Edit Formats:** Multiple strategies for LLM-driven code editing. The "search/replace block" format was a breakthrough — dramatically reduced malformed edits compared to earlier "edit block" format.
- **Tag Caching:** Uses `diskcache.Cache` stored in `.aider.tags.cache.v3` (or v4 with TSL pack) to avoid re-parsing unchanged files.
- **Watch Mode:** Monitors files for changes, enabling IDE integration without a plugin — edit a file in VS Code, Aider picks up the change and continues the conversation.
- **Linting + Testing Pipeline:** Can run linters and test suites after edits, feeding errors back to the LLM for auto-fix loops.

---

## Publisher Background

Paul Gauthier started Aider as a solo project in mid-2023 while consulting. He previously spent 15+ years at Microsoft as a Principal Architect. Aider grew organically through developer word-of-mouth and consistent benchmark leadership. The project incorporated as Aider AI in 2024. The community is strong (400+ contributors), and the project's self-hosting metric (88% of code written by Aider) serves as both a proof-of-concept and marketing asset.

**Risk profile:** Moderate — strong community and Apache license mitigate bus-factor risk, but the project remains Paul-centric in terms of architectural direction. No known VC funding, which means independence but also resource constraints.

---

## What's Valuable for Us

1. **Repo Map Algorithm:** The tree-sitter + PageRank approach to codebase context selection is the most sophisticated we've seen in open-source. Worth studying for how we feed context to worker agents — instead of sending entire files, we could send ranked code elements. Relevant files: `aider/repomap.py`, `aider/queries/tree-sitter-languages/`.

2. **Edit Format Design:** The evolution from "edit blocks" to "search/replace blocks" and the measurable reduction in malformed edits is a direct lesson for any system that has LLMs edit code. Our worker agents could benefit from enforcing structured edit formats.

3. **Benchmark Methodology:** Aider's SWE-bench and Exercism benchmark suite is a gold standard for evaluating coding agent performance. If we ever need to compare agent configurations, their methodology is worth replicating.

4. **Git Integration Pattern:** Auto-commit with AI-generated messages, plus one-command undo, is a clean pattern for worker agents that make code changes. The approach of committing every change gives you a full audit trail.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Single-agent only** | No multi-agent coordination, no spawning, no delegation. Fundamentally a pairing tool, not an orchestration component. Cannot serve as a worker agent runtime in our L-Thread pattern. |
| **No API/server mode** | CLI-only with no HTTP, SSE, or SDK interface. Cannot be driven programmatically by an orchestrator. |
| **No MCP support** | Cannot extend capabilities through Model Context Protocol. Closed tool ecosystem. |
| **Python stack** | Our stack is TypeScript/shell. Aider's Python codebase isn't directly reusable, and running Python agents alongside our TypeScript infrastructure adds operational complexity. |
| **Human-in-the-loop assumption** | Aider assumes a human developer is present to approve changes. No autonomous mode suitable for CI/CD or unattended agent execution. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** No direct integration. Study the repo-map algorithm as reference material for improving context feeding to worker agents.
- **Phase 3 (Days 60-90):** If we build a context management layer for worker agents, the tree-sitter + PageRank approach from Aider's `repomap.py` is the best open-source reference implementation.
- **Phase 4 (Days 90+):** Could potentially use Aider as a specialized coding worker if they ever add an API/server mode or MCP support — but this is speculative.

---

## Key Takeaway

> **Aider's tree-sitter + PageRank repo-map is the most sophisticated open-source approach to codebase context management — worth studying as an algorithm, but the tool itself is a single-agent pairing tool with no orchestration primitives, no API mode, and no MCP support.**
