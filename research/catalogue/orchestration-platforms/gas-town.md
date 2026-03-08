# Gas Town

> **Gas Town — multi-agent workspace manager.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [github.com/steveyegge/gastown](https://github.com/steveyegge/gastown) |
| GitHub Stars | 11,263 (as of 2026-03-08) |
| Publisher | Steve Yegge (solo, industry veteran — Google, Amazon, Sourcegraph) |
| License | MIT |
| Tech Stack | Go (primary), Shell, with Dolt (SQL database), tmux, git worktrees |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Gas Town solves nearly the same problem we solve: coordinating multiple Claude Code instances with persistent state. The Mayor/Polecat architecture mirrors our orchestrator/worker pattern. Git-backed persistence aligns with our approach. |
| **Novelty** | 7/10 | Beads/Hooks/Convoys work-tracking vocabulary is genuinely new. Git worktree isolation per agent is an architectural decision we should evaluate. The Dolt-backed structured tracking adds a dimension our JSON state files lack. |
| **Actionable** | 6/10 | Several patterns directly transferable: git worktree isolation, bead-based work tracking, persistent agent identity with ephemeral sessions. But Go codebase means no direct code reuse — pattern extraction only. |

---

## Overview

Gas Town is Steve Yegge's multi-agent orchestration system for Claude Code, released on New Year's Day 2026. It presents itself as a single-agent interface (you talk to "The Mayor") but behind the scenes spawns and manages a fleet of specialized worker agents ("Polecats") across isolated git worktrees. The key insight is that agent sessions are ephemeral but work state must be persistent — Gas Town solves this by backing everything with git.

The system uses a "Town" metaphor: your workspace (`~/gt/`) contains "Rigs" (project containers), each with "Crew Members" (personal workspaces backed by git worktrees). "Beads" are work items tracked in a Dolt database (a MySQL-compatible version-controlled database), and "Hooks" are assignment queues where work lands for workers. "Convoys" bundle related work items that move through the pipeline together.

Gas Town supports 4-30 concurrent agents, which is notably larger than our optimal 2-3 agent finding. Yegge's bet is that the coordination overhead can be managed by giving each agent an isolated worktree (avoiding merge conflicts) and using The Mayor as a centralized planning agent. Justin Abrahms' review notes the key challenge: "you have to do a LOT of design and planning to keep the engine fed."

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│                 The Mayor                    │
│         (AI Coordinator Agent)               │
│    Plans work, creates beads, assigns hooks  │
└──────────────┬──────────────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
┌────┴───┐ ┌───┴────┐ ┌──┴─────┐
│Polecat │ │Polecat │ │Polecat │   ← Worker agents
│  #1    │ │  #2    │ │  #N    │      (Claude/Codex/etc.)
└────┬───┘ └───┬────┘ └──┬─────┘
     │         │         │
┌────┴───┐ ┌───┴────┐ ┌──┴─────┐
│Worktree│ │Worktree│ │Worktree│   ← Isolated git worktrees
│  (git) │ │  (git) │ │  (git) │
└────────┘ └────────┘ └────────┘
               │
         ┌─────┴──────┐
         │    Dolt     │  ← Version-controlled SQL database
         │  (Beads DB) │     for work tracking
         └─────────────┘
```

**Core Concepts:**
- **Town** (`~/gt/`): Root workspace directory
- **Rig**: Project container with its own git repo
- **Crew Member**: Named workspace backed by a git worktree
- **Polecat**: Worker agent (Claude Code, Codex, Cursor, etc.)
- **Bead**: Work item with ID format `gt-xxxxx` (prefix + 5-char alphanumeric)
- **Hook**: Assignment queue — work lands here for a specific worker
- **Convoy**: Bundle of related beads that move together
- **The Mayor**: AI coordinator that decomposes tasks and manages polecats

**Key Design Decisions:**
- Git worktrees for agent isolation (no merge conflicts between concurrent agents)
- Dolt for structured work tracking (SQL queries over version-controlled data)
- tmux 3.0+ for terminal multiplexing (same as our approach)
- Agent-agnostic: supports Claude, Codex, Cursor, Gemini, and others
- Bead IDs provide persistent identity across ephemeral agent sessions

**Infrastructure Requirements:**
- Go 1.23+, Dolt 1.82.4+, beads (bd) 0.55.4+, tmux 3.0+, sqlite3
- At least one AI coding runtime (Claude Code recommended)

---

## Publisher Background

Steve Yegge is one of the most respected voices in software engineering, with decades of industry experience at Amazon (where he wrote the famous internal "platforms rant"), Google (where he worked on developer tools and wrote the Google+ critique), and Sourcegraph (where he was Head of Engineering). His blog posts have shaped industry thinking about platform architecture, programming languages, and developer tooling. Gas Town emerged from his personal frustration with managing multiple Claude Code instances — he built it for himself and open-sourced it. The 11K+ stars in ~2 months reflect his reputation and the real demand for this solution. This is a solo project with growing community contributions.

---

## What's Valuable for Us

**Git Worktree Isolation Pattern**: Each agent gets its own worktree, eliminating merge conflicts between concurrent agents. This is a concrete improvement over our current approach where agents may edit the same files. We should evaluate whether git worktrees could replace or complement our tmux pane isolation.

**Bead-Based Work Tracking**: The concept of persistent, ID'd work items that survive agent restarts is more robust than our current prompt-based task tracking. Our `orchestrator-state.json` tracks tasks, but beads add structured queryability via SQL.

**Dolt for Version-Controlled State**: Using a MySQL-compatible database that versions every change (like git for data) is a fascinating choice for orchestrator state. Currently we use JSON files — Dolt could provide both queryability and audit trails.

**Persistent Agent Identity**: Gas Town agents have persistent identity (Crew Members) even though their sessions are ephemeral. This pattern could help us maintain continuity across Claude Code restarts in our tmux sessions.

**The Mayor as Centralized Planner**: Mirrors our orchestrator agent. The explicit separation of "planning work" (Mayor) from "doing work" (Polecats) validates our architecture. Study how the Mayor decomposes tasks and manages the bead queue.

---

## What's NOT Relevant

**4-30 Agent Scale**: Gas Town encourages scaling to 30 concurrent agents. Our DeepMind-informed research shows coordination overhead grows at exponent 1.724, making 2-3 agents optimal. The "keep the engine fed" problem Abrahms identifies is exactly this coordination overhead.

**Go Codebase**: We're TypeScript/shell. Can't directly use Gas Town code. However, patterns are transferable.

**Dolt Dependency**: Adding a specialized version-controlled database is a significant infrastructure commitment. Our JSON state files + git are simpler and sufficient for our current scale. Dolt would only make sense if we need SQL-queryable state history.

**Agent-Agnostic Design**: Gas Town supports Codex, Cursor, Gemini, etc. We're Claude-first by design. The abstraction layer for supporting multiple agent runtimes adds complexity we don't need.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Evaluate git worktree isolation for our tmux workers — could prevent file conflict issues immediately
- **Phase 2 (Days 4-60)**: Study bead/hook/convoy patterns for improving our task tracking in `orchestrator-state.json`
- **Phase 3 (Days 60-90)**: If we need structured state queryability beyond JSON, evaluate Dolt as a potential state backend
- **Phase 4 (Days 90+)**: As we scale to multiple business lines, the Rig/Crew abstraction for project-level isolation becomes relevant

---

## Key Takeaway

> **Gas Town is the closest existing system to our L-Thread Orchestrator — same problem space (coordinating Claude Code instances), same infrastructure (tmux + git), same architecture (central planner + ephemeral workers) — study it deeply for the git worktree isolation and bead-based work tracking patterns, but be wary of its 4-30 agent scale assumptions.**
