# Cursor

> **The best way to code with AI — an AI-native code editor with multi-model agent support, built on VS Code.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | Proprietary (closed-source, built on VS Code fork) |
| GitHub Stars | N/A (proprietary) |
| Publisher | Anysphere (startup — $29.3B valuation, 300+ employees) |
| License | Proprietary / Commercial |
| Tech Stack | Electron (VS Code fork), custom embedding model, multi-model inference (Opus 4.6, GPT-5.2, Gemini 3 Pro, Grok, Composer 1.5) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | GUI-first, IDE-centric approach is orthogonal to our terminal-first, prompt-engineering orchestrator. We use Claude Code CLI, not an IDE. Cursor's value prop (single-developer productivity) doesn't map to multi-agent orchestration. |
| **Novelty** | 3/10 | "Agent mode in an IDE" is well-understood. The autonomy slider concept and BugBot PR review are minor variations on known patterns. Cloud agents are interesting but not novel — they're remote Claude Code sessions with a GUI. |
| **Actionable** | 2/10 | Nothing directly adoptable. We're terminal-first, and Cursor's value is in the GUI experience. We can't use their agents as part of our orchestrator pipeline. |

---

## Overview

Cursor is the dominant AI-native code editor, built as a VS Code fork by Anysphere (founded 2022, San Francisco). It has crossed $1B in annualized revenue, is used by over half the Fortune 500, and raised $3.4B across seven rounds at a $29.3B valuation. The product integrates AI at every level of the coding workflow: Tab (predictive autocomplete), Composer (multi-file editing), Agent (autonomous task execution), and Cloud Agents (remote execution on dedicated machines).

Cursor supports every major frontier model — Opus 4.6, GPT-5.2, Gemini 3 Pro, Grok Code, and Cursor's own Composer 1.5 model — letting developers choose or auto-route to the best model per task. The "autonomy slider" design philosophy lets users scale from simple autocomplete to full agentic automation within the same interface.

Recent additions include Automations (always-on agents triggered by rules), BugBot (automated PR review on GitHub), and deep integrations with Slack, Linear, and JetBrains IDEs. The enterprise offering (SOC 2, SCIM, SAML/OIDC SSO) positions Cursor as the corporate-approved AI coding tool.

---

## Technical Architecture

```mermaid
graph TD
    UI[VS Code Fork - Electron] --> Modes{Interaction Mode}
    Modes --> Tab[Tab - Autocomplete]
    Modes --> Composer[Composer - Multi-file Edit]
    Modes --> Agent[Agent - Autonomous]
    Modes --> Cloud[Cloud Agent - Remote]

    Agent --> Planning[Planning Phase]
    Planning --> SubAgents[Parallel Sub-agents]
    SubAgents --> Models{Model Selection}
    Models --> Opus[Opus 4.6]
    Models --> GPT[GPT-5.2]
    Models --> Gemini[Gemini 3 Pro]
    Models --> CursorModel[Composer 1.5]

    Agent --> Context[Context Engine]
    Context --> Embeddings[Custom Embedding Model]
    Context --> Codebase[Full Codebase Index]
    Context --> AtMentions[@-mentions + Images]

    Agent --> Tools[Tool Use]
    Tools --> Terminal[Sandboxed Terminal]
    Tools --> Git[Git + Checkpoints]
    Tools --> MCP[MCP Connections]
    Tools --> Extensions[Team Extensions/Skills]

    Cloud --> Automations[Automations - Trigger-based]
    Cloud --> BugBot[BugBot - PR Review]
    Cloud --> Slack[Slack Integration]
    Cloud --> GitHub[GitHub Integration]
```

**Key components:**

| Component | Purpose | Detail |
|-----------|---------|--------|
| **Custom Embedding Model** | Codebase indexing | Proprietary model for superior recall across large repos |
| **Autonomy Slider** | UX paradigm | Scale from Tab → Composer → Agent → Cloud Agent |
| **Subagent Parallelism** | Multi-model execution | Multiple agents using different models in parallel |
| **Git Checkpoints** | Safety net | Automatic snapshots for rollback |
| **MCP Connections** | External tool integration | Figma, GitHub, custom tools via Model Context Protocol |
| **Automations** | Always-on agents | Trigger-based agents that produce merge-ready PRs |
| **BugBot** | PR review automation | Automated code review with bug detection |

**Pricing tiers:** Hobby (free, limited), Pro ($20/mo), Pro+ ($60/mo, 3x usage), Ultra ($200/mo, 20x usage), Teams ($40/user/mo), Enterprise (custom).

---

## Publisher Background

Anysphere was founded in 2022 by Michael Truell, Aman Sanger, Arvid Lunnemark, and Sualeh Asif. Headquartered in San Francisco with 300+ employees. Raised $3.4B total across seven rounds — Series D of $2.3B led by Accel and Coatue at $29.3B valuation (November 2025). Previous investors include Benchmark, Index Ventures, Andreessen Horowitz, and Thrive Capital. Over 1M daily active users. $1B+ annualized revenue. This is the most well-funded AI coding tool company by a significant margin.

---

## What's Valuable for Us

| Pattern to Study | Where in Cursor | How to Apply |
|-----------------|----------------|--------------|
| **BugBot concept** | PR review automation | We could build a lightweight equivalent: an agent that reviews PRs against our governing principles before merge. No need for Cursor — just a Claude Code agent triggered by git hooks. |
| **Automations (trigger-based agents)** | Cloud agents | The concept of always-on agents triggered by events (new PR, Slack message, schedule) aligns with our Phase 3+ automation goals. We'd implement this via webhooks + tmux, not Cursor. |
| **Custom embedding for codebase indexing** | Context engine | As our codebase grows, understanding how Cursor indexes large repos could inform our context engineering. But we'd use Claude's native context window, not a separate embedding. |

---

## What's NOT Relevant

| Concern | Why |
|---------|-----|
| **GUI-first paradigm** | We're terminal-first. Cursor's entire value prop is the visual IDE experience. Our orchestrator runs in tmux sessions, not a graphical editor. |
| **Single-developer productivity** | Cursor optimizes for one developer + AI. We orchestrate multiple agents. Different problem space. |
| **Proprietary + expensive** | Ultra tier at $200/mo per seat. We already pay for Claude Max at $200/mo for unlimited agent spawning. Cursor would be an additional cost with little incremental value for our workflow. |
| **VS Code lock-in** | Requires Electron/VS Code. Our agents don't need a GUI — they work directly with files via Claude Code CLI. |
| **Multi-model as a feature** | Cursor touts model choice as a differentiator. We deliberately chose Claude-only for simplicity. |

---

## Future Use Cases

- **Phase 1–3:** Not relevant. Our terminal-first approach is fundamentally different.
- **Phase 4 (Days 90+):** If building a client-facing dashboard or developer experience layer, study Cursor's autonomy slider UX for inspiration on how to expose different automation levels to users. Their Automations concept (trigger-based agents) is worth adapting for our own event-driven agent system, but implemented with our own stack, not Cursor.

---

## Key Takeaway

> **Cursor is the $29B gorilla in AI-assisted coding but solves a different problem than ours — it's a single-developer productivity tool, while we orchestrate multi-agent systems from the terminal. Watch their Automations feature for event-driven agent patterns, but don't adopt the product.**
