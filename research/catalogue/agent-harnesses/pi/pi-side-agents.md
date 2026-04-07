# pi-side-agents

> **Parallel subagents and long-running side agents for Pi coding agent — automates tmux/worktree/merge lifecycle with statusline monitoring and orchestration tools.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [pasky/pi-side-agents](https://github.com/pasky/pi-side-agents) |
| GitHub Stars | 90 (as of 2026-03-08) |
| Publisher | pasky (Petr Baudis, community contributor, solo) |
| License | Not specified |
| Tech Stack | JavaScript (56.8%), TypeScript (43.2%), tmux, git worktrees |
| Maturity | 🟡 Early (v1.1.0, active development since March 2026) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | This is almost exactly our L-Thread Orchestrator pattern but implemented natively in Pi. tmux sessions, git worktrees, agent lifecycle management, statusline monitoring — maps directly to what we built with Claude Code. |
| **Novelty** | 5/10 | Validates our approach more than teaches new patterns. We already built tmux-based orchestration. The worktree isolation and auto-merge lifecycle is a cleaner packaging of what we do manually. |
| **Actionable** | 8/10 | Near drop-in replacement for our tmux orchestration layer at Day 60+. The `/agent` command and orchestration tools (agent-start, agent-check, agent-wait-any, agent-send) map to our conduit patterns. |

---

## Overview

pi-side-agents automates the full lifecycle of parallel agent development using tmux windows and git worktrees. Instead of agents working sequentially on tasks, you spawn child agents that run independently in isolated environments. Each child agent gets its own tmux window and git worktree with replicated build setup, works on a short-lived topic branch, and auto-merges upon completion.

The extension provides two usage patterns: manual (user spawns agents via `/agent <task>`) and programmatic (parent agent uses `agent-start`, `agent-check`, `agent-wait-any`, `agent-send` tools to orchestrate its own flock of subagents). A statusline widget shows which agents are waiting for review, and `/agents` provides a detailed overview of all active work.

This is architecturally significant because it validates the tmux-based multi-agent pattern we independently developed for our L-Thread Orchestrator — using the same primitives (tmux sessions, git worktrees, branch isolation) but packaged as a Pi extension with proper lifecycle management.

---

## Technical Architecture

```
Parent Pi Agent (main tmux window)
    │
    ├── /agent "implement feature X"
    │       └── Child Agent (tmux window 2, worktree: .worktrees/feature-x)
    │           └── topic branch → auto-merge on LGTM
    │
    ├── /agent "write tests for Y"
    │       └── Child Agent (tmux window 3, worktree: .worktrees/tests-y)
    │           └── topic branch → auto-merge on LGTM
    │
    └── /agents (status dashboard)
         └── Shows: window #, branch, status, task summary
```

**Orchestration Tools (for programmatic use by parent agent):**
- `agent-start` — Spawn a child agent with a task
- `agent-check` — Poll child agent status
- `agent-wait-any` — Event-driven wait for any child to complete
- `agent-send` — Send message/instruction to running child
- `/skill:agent-setup` — One-time project scaffolding

**Isolation Model:**
- Each child gets a fresh git worktree (replicated build setup)
- Separate tmux window (user can switch to any agent)
- Short-lived topic branch (auto-merges on completion)
- Optional: agents can open GitHub PRs instead of local merge

**Requirements:** tmux, git with worktree support, authenticated Pi installation

---

## Publisher Background

Petr Baudis (pasky) is a well-known open-source contributor, historically associated with early Git development (cogito, the original Git porcelain) and Go/AI projects. 83 commits in the repo, 90 stars, v1.1.0 release — active and maintained. Solid engineering pedigree gives confidence in the architecture decisions.

---

## What's Valuable for Us

1. **Architectural Validation:** This extension independently arrived at the same pattern we built: tmux windows as agent containers, git worktrees for isolation, branch-per-task lifecycle. Confirms our approach is sound.

2. **Orchestration Tool API:** `agent-start`, `agent-check`, `agent-wait-any`, `agent-send` — this is a cleaner API than our `terminal-write`/`terminal-read`/`terminal-wait` conduit pattern. Study for Day 60+ migration.

3. **Auto-Merge Lifecycle:** Child agents auto-merge their branches on completion with user review. We should adopt this pattern — currently our agents don't have structured merge-back.

4. **Statusline Integration:** Real-time agent status in the terminal statusline. Pi's TUI makes this native. More observable than our state JSON file approach.

5. **PR-Based Workflow Option:** Agents can open GitHub PRs instead of local merge — useful for our gov contract work where audit trails matter.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **tmux-only** | Requires tmux — not an issue for us (we already use tmux), but limits portability to non-tmux environments. |
| **No license specified** | Repository has no LICENSE file. Risk for production adoption. Would need to clarify with author before depending on it. |
| **Single-repo assumption** | Assumes all agents work in the same git repository via worktrees. Our federated architecture has agents across multiple repos. Would need adaptation. |
| **No inter-agent messaging** | Agents are isolated — no message passing between children. For complex coordination, would need to combine with pi-messenger or pi-collaborating-agents. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Study the orchestration API (agent-start/check/wait-any/send) for patterns to improve our conduit mode.
- **Phase 3 (Days 60-90):** Primary candidate for our Pi-based orchestration layer. The `/agent` command replaces our `conduit pane-split` + `terminal-write` pattern. Test with a 3-agent workflow.
- **Phase 4 (Days 90+):** Combine with pi-messenger or pi-collaborating-agents for full multi-agent coordination. Evaluate worktree approach vs. our separate-session approach for agent isolation.

---

## Key Takeaway

> **pi-side-agents independently validates our L-Thread Orchestrator's tmux+worktree pattern and packages it as a clean Pi extension with lifecycle management — making it the most natural migration target for our orchestration layer at Day 60+.**
