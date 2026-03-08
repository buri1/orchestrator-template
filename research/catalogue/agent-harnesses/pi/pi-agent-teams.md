# pi-agent-teams

> **Experimental agent swarm extension for Pi inspired by Claude Code agent teams — shared task lists with dependency tracking, auto-claiming, direct messaging, and git worktree isolation.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [tmustier/pi-agent-teams](https://github.com/tmustier/pi-agent-teams) |
| GitHub Stars | 18 (as of 2026-03-08) |
| Publisher | tmustier (community contributor, solo) |
| License | MIT |
| Tech Stack | TypeScript, Node.js, git worktrees, tmux |
| Maturity | 🟡 Early (MVP, 118 commits, active development) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Most feature-complete multi-agent coordination extension for Pi. Shared task lists, dependency tracking, auto-claiming, lifecycle management — this is the Claude Code Teams mode ported to Pi with more features. Directly relevant to our orchestrator pattern. |
| **Novelty** | 6/10 | The concepts (task lists, dependency graphs, agent spawning) are familiar from Claude Code Teams mode. The quality gate hooks and auto-claiming are meaningful additions we haven't seen. |
| **Actionable** | 7/10 | 118 commits shows sustained development. `/swarm` for quick-start orchestration and the LLM-callable teams tool for autonomous delegation map well to our patterns. Installable via npm. |

---

## Overview

pi-agent-teams brings Claude Code's agent teams functionality to Pi, enabling a "leader" agent to spawn teammate agents, share a task list with dependency tracking, and coordinate work across multiple Pi sessions. The extension provides 30+ slash commands under `/team` for spawning teammates, managing tasks, sending messages, and lifecycle control, plus a quick-start `/swarm` command for automatic team orchestration.

The distinguishing feature is its **task management system**: a file-per-task architecture with dependency graphs, blocking relationships, and assignment tracking. Tasks have three states (pending/in-progress/completed) with dependency resolution — a task won't start until its dependencies complete. Idle teammates automatically pick up unassigned tasks via "auto-claim."

The extension also introduces **quality gate hooks** — leader-side remediation scripts that fire on task completion or failure. Configurable failure policies (warn, followup, reopen, reopen_followup) allow the system to automatically reopen failed tasks or create follow-up tasks, providing deterministic error handling without LLM judgment.

---

## Technical Architecture

```
<teamsRoot>/<teamId>/
    ├── config.json              (team configuration)
    ├── tasks/
    │   ├── task-001.json        (status, assignee, dependencies, blockers)
    │   ├── task-002.json
    │   └── ...
    ├── mailboxes/
    │   ├── leader.jsonl         (message inbox)
    │   └── worker-1.jsonl
    ├── sessions/                (agent session state)
    └── worktrees/               (git worktree isolation)

<teamsRoot>/_hooks/
    ├── on_idle.{js,sh}          (triggered when agent has no tasks)
    ├── on_task_completed.{js,sh} (quality gate on completion)
    └── on_task_failed.{js,sh}   (failure remediation)
```

**Agent Interaction Modes:**
1. **Command-driven:** 30+ `/team` slash commands for manual orchestration
2. **LLM-callable:** `teams` tool enables autonomous delegation (delegate, task_assign, member_spawn, etc.)
3. **Quick-start:** `/swarm` for automatic team formation and task distribution

**Task System:**
- File-per-task with JSON state
- Three states: pending → in-progress → completed
- Dependency graph with blocking relationships
- Auto-claim: idle agents automatically pick up unassigned tasks
- Assignment tracking with agent identity

**Quality Gate Hooks:**
- `on_task_completed` — Validate results, optionally reopen or create follow-up
- `on_task_failed` — Remediation with configurable policies
- `on_idle` — Custom behavior when agent has nothing to do
- Hooks receive context via environment variables

**UI Styles:** Three built-in naming conventions (normal, soviet, pirate) with customizable JSON themes — amusing but signals developer-focused culture.

---

## Publisher Background

tmustier is a solo community contributor focused on bringing Claude Code's team coordination model to Pi. 118 commits demonstrate sustained investment. The project includes smoke tests, RPC E2E tests, hooks integration tests, and tmux dogfooding scripts — better testing infrastructure than most Pi extensions. A roadmap document (`docs/claude-parity.md`) explicitly tracks feature parity with Claude Code Teams.

---

## What's Valuable for Us

1. **Dependency-Aware Task Queue:** The file-per-task architecture with dependency resolution is more sophisticated than our current state management. Tasks won't start until dependencies complete — deterministic ordering without orchestrator intervention.

2. **Quality Gate Hooks:** `on_task_completed` and `on_task_failed` hooks provide deterministic error handling. Our orchestrator currently relies on LLM judgment for failure detection. Hook-based quality gates (70/30 split principle) would improve reliability.

3. **Auto-Claim Pattern:** Idle agents automatically pick up unassigned tasks. This eliminates the orchestrator as bottleneck for task assignment — agents self-schedule from a shared queue. Aligns with our "thin shared layer" principle.

4. **LLM-Callable Teams Tool:** Agents can autonomously delegate tasks, spawn teammates, and manage the task list without slash commands. Enables fully autonomous orchestration loops.

5. **Testing Infrastructure:** Smoke tests, RPC E2E tests, hooks integration tests. More testing discipline than most Pi extensions — gives confidence for production use.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Claude Code parity goal** | Designed to replicate Claude Code Teams mode. We're moving away from Claude Code, so parity with it isn't inherently valuable — the patterns matter, not the feature matching. |
| **UI style themes** | Soviet/pirate naming conventions are fun but irrelevant for production orchestration. |
| **Single-team assumption** | One team at a time. Our federated architecture may need multiple concurrent teams across business lines. |
| **MVP status** | Self-described as MVP. Task management works but advanced features (complex dependency graphs, cross-repo teams) may not be battle-tested. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Study the quality gate hooks pattern for immediate adoption in our Claude Code orchestrator. The `on_task_failed` → reopen/followup policy can improve our current roadblock recovery.
- **Phase 3 (Days 60-90):** Primary candidate for our orchestration coordination layer alongside pi-side-agents. pi-agent-teams provides the task management; pi-side-agents provides the tmux/worktree isolation. Evaluate whether they compose well.
- **Phase 4 (Days 90+):** Extend with cross-repo support for our federated architecture. Contribute upstream or fork if multi-team support is needed.

---

## Key Takeaway

> **pi-agent-teams is the most feature-complete multi-agent coordination extension for Pi — its dependency-aware task queue, quality gate hooks, and auto-claiming pattern provide the orchestration primitives we need at Day 60+, though it needs maturity testing before production adoption.**
