# Vibe Kanban

> **Get 10X more out of Claude Code, Codex or any coding agent — a Kanban board purpose-built for orchestrating AI coding agents in parallel.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [BloopAI/vibe-kanban](https://github.com/BloopAI/vibe-kanban) |
| GitHub Stars | 22,600 (as of 2026-03-08) |
| Publisher | BloopAI (startup — YC-backed, over 50% of their code written by agents) |
| License | Apache-2.0 |
| Tech Stack | Rust (49.6%), TypeScript/React (46.4%), Node.js ≥20, pnpm |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves a real problem (parallel agent coordination) but through a GUI-first approach that conflicts with our terminal-first, autonomous architecture. The git worktree isolation pattern is genuinely useful. |
| **Novelty** | 4/10 | We already do parallel agents via tmux + worktrees. The workspace isolation model confirms our approach rather than teaching us something new. The built-in diff review is a nice touch. |
| **Actionable** | 3/10 | The worktree-per-agent isolation pattern validates our existing approach. The "workspace" abstraction (branch + terminal + dev server) is a clean formalization worth referencing. No code to adopt directly. |

---

## Overview

Vibe Kanban is the **most popular open-source tool** for managing AI coding agents, with 22.6K stars and explosive growth. Built by YC-backed BloopAI, it provides a web-based Kanban board where each card is an agent task, and each workspace gives an agent its own git branch, terminal, and dev server. It supports 10+ coding agents: Claude Code, Codex, Gemini CLI, GitHub Copilot, Amp, Cursor, OpenCode, Droid, CCR, and Qwen Code.

The core workflow is: plan issues on a Kanban board → create isolated workspaces → agents execute tasks in parallel (each in its own git worktree) → review diffs with inline comments → merge PRs. The tool explicitly targets the bottleneck that "coding agents can work on infinite tasks in parallel, but humans still need to plan and review that work."

This is fundamentally a **human-in-the-loop orchestration GUI** — the human plans, assigns, reviews, and merges. Agents are the executors, not the coordinators. The approach has clearly resonated (22.6K stars, 239 releases, 1,929 commits, 62 contributors), making it the mainstream answer to "how do I manage multiple coding agents?"

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│              Vibe Kanban                         │
│                                                  │
│  React/TS Frontend         Rust Backend          │
│  ┌──────────────┐        ┌────────────────────┐ │
│  │ Kanban Board  │        │ Workspace Manager  │ │
│  │ Diff Reviewer │◄──────►│ Terminal Manager   │ │
│  │ Browser Preview│       │ Git Worktree Mgmt  │ │
│  │ Agent Switcher│        │ Agent Launcher     │ │
│  └──────────────┘        │ Dev Server Proxy   │ │
│                           └─────────┬──────────┘ │
│                                     │            │
│           ┌─────────────────────────┼──────┐     │
│           ▼              ▼          ▼      ▼     │
│     Claude Code      Codex     Gemini   Amp      │
│     (worktree A)   (worktree B) (wt C)  (wt D)  │
│         │              │         │        │      │
│     ┌───┴──────────────┴─────────┴────────┴──┐  │
│     │          Git Repository                 │  │
│     │   main ─── branch-a ── branch-b ...     │  │
│     └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

Key architectural choices:
- **Workspace = branch + terminal + dev server:** Each agent gets an isolated environment, no conflicts
- **Git worktree isolation:** Agents work on separate branches via git worktrees, preventing merge hell
- **Agent-agnostic:** Supports 10+ coding agents through a standardized launch/monitor interface
- **Built-in browser:** Preview app with devtools, inspect mode, device emulation
- **Inline diff review:** Code review directly in the UI with comments
- **Rust backend:** High-performance workspace and process management
- **1,929 commits**, 62 contributors, 239 releases — very active development
- **Single-command install:** `npx vibe-kanban`

---

## Publisher Background

**BloopAI** is a YC-backed company that reports over 50% of their own code is now written by agents. They built Vibe Kanban out of their own need to manage parallel agent execution. The team has clearly struck a nerve — 22.6K stars and 62 contributors make this one of the fastest-growing tools in the AI coding space.

BloopAI previously built code search/understanding tools, giving them experience with developer tooling and codebase-scale operations. The Rust + TypeScript stack shows serious engineering (not a weekend project). With 239 releases and daily commits, they're iterating aggressively.

---

## What's Valuable for Us

1. **Workspace Abstraction Validation**

   Vibe Kanban's "workspace" concept (branch + terminal + dev server) closely mirrors our tmux-based agent sessions (tmux session + worktree + state file). Their success at scale validates our architectural choice. Specifically, their model confirms that **git worktree isolation is the right primitive** for parallel agent execution.

2. **Agent-Agnostic Launch Interface**

   Their abstraction for supporting 10+ different coding agents through a standardized interface is worth studying. Our current approach is Claude Code-specific. If we ever support multiple agent backends, their launch/monitor abstraction is a good reference.

3. **Human Review Bottleneck Framing**

   Their explicit framing — "agents can parallelize infinitely, humans can't review infinitely" — validates our human review ceiling calculation (5-6 PRs/day). Their diff review UI is their answer to this bottleneck; our answer is automated E2E testing as a quality gate before human review.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Web-based Kanban GUI** | We use terminal + Notion as our interface. Building a custom GUI is "UI work that generates zero revenue" (ADR Section 8.9). |
| **Manual task planning** | Our orchestrator plans tasks autonomously from roadmap/state files. Human-driven planning defeats the purpose. |
| **Manual agent assignment** | Our orchestrator routes tasks to agents based on capability and state. Human-driven assignment is a bottleneck. |
| **Built-in browser preview** | We use Chrome DevTools MCP for testing, not an embedded browser. |
| **Inline code review** | We use automated multi-model review gates. Interactive review is the bottleneck we're trying to eliminate. |

**Governing Principle conflicts:**
- **#2 (Deterministic orchestration):** Vibe Kanban has zero deterministic orchestration. The human IS the router.
- **#5 (Human review is binding constraint):** Vibe Kanban optimizes the review experience but doesn't reduce review volume. We automate the quality gate.
- **#9 (Terminal is the interface):** Vibe Kanban builds a full web GUI. Our architecture says terminal + existing tools (Notion, tmux).
- **70/30 Split:** Vibe Kanban is 100% human-driven, 0% deterministic. It's the antithesis of our Stripe Pattern.

---

## Future Use Cases

- **Phase 1 (Days 1–3):** Nothing. Our tmux-based approach already handles parallel agents.
- **Phase 2 (Days 4–60):** Reference their workspace isolation model if formalizing our worktree management. Study their AGENTS.md file for how they document agent interaction patterns.
- **Phase 3 (Days 60–90):** If we build a visual dashboard for client demos, Vibe Kanban's Kanban view could inform the UI design (but we'd build it in Notion, not as a custom app).
- **Phase 4 (Days 90+):** If we ever need a human-friendly interface for less technical stakeholders to interact with our agent system, Vibe Kanban or something like it could sit as a presentation layer on top of our autonomous orchestration engine.

---

## Key Takeaway

> **Vibe Kanban is the most popular answer to "how do I manage multiple coding agents" — but it's the human-operated answer, not the autonomous orchestration answer. It validates our git worktree isolation pattern and confirms the human review bottleneck is real, but its GUI-first, human-driven approach is the opposite of our terminal-first, autonomous architecture. Study their workspace model, ignore the product.**
