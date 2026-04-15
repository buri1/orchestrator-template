# agtx

> **Run and manage multi-agent AI coding workflows in the terminal — orchestrate Claude, Codex, Gemini and more in a single TUI.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/fynnfluegge/agtx](https://github.com/fynnfluegge/agtx) |
| GitHub Stars | 349 (as of 2026-03-08) |
| Publisher | Fynn Flügge — solo developer, Hamburg, Germany |
| License | Apache-2.0 |
| Tech Stack | Rust (Cargo), tmux, Git worktrees |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly adjacent to our orchestrator — same tmux + worktree + multi-agent pattern. The spec-driven plugin system and per-phase agent assignment are features we lack. |
| **Novelty** | 5/10 | Same architectural foundation as ours (tmux + worktrees). The per-phase agent switching and plugin system are incremental innovations, not paradigm shifts. |
| **Actionable** | 6/10 | The plugin system (TOML-based lifecycle hooks) and per-phase agent assignment pattern could be adapted. However, agtx is Rust-based and we're TypeScript/shell — no direct code reuse. |

---

## Overview

agtx is a terminal-based multi-agent coding orchestrator that manages AI agents across projects and tasks through a keyboard-driven TUI dashboard. Its core architectural decision is the same as ours — tmux for process isolation and git worktrees for code isolation — but it adds two distinctive features: per-phase agent assignment and a spec-driven plugin system.

Per-phase agent assignment means you can configure different AI agents for different workflow phases within the same task. For example: Gemini for research/planning, Claude for implementation, Codex for review. The system automatically switches agents at phase transitions within the same tmux window. This is a more granular approach than our current "one agent per task" model.

The plugin system lets spec-driven development frameworks hook into the task lifecycle. A plugin is a single TOML file defining what happens at each phase transition. Pre-built plugins exist for GSD, Spec-kit, OpenSpec, BMAD, and Superpowers. This means agtx isn't opinionated about your development methodology — it's a harness that executes whatever spec-driven workflow you plug in.

The TUI provides a multi-project dashboard where you can monitor all running agent sessions, navigate between tasks, view progress, and track artifacts — all via keyboard shortcuts without leaving the terminal.

---

## Technical Architecture

```
┌─────────────────────────────────────┐
│         TUI Dashboard               │
│  (Keyboard-driven, multi-project)   │
│  - Project list / task list         │
│  - Agent status monitoring          │
│  - Artifact tracking                │
├─────────────────────────────────────┤
│       Plugin System (TOML)          │
│  ┌─────┐ ┌────────┐ ┌──────────┐  │
│  │ GSD │ │Spec-kit│ │ OpenSpec │  │
│  ├─────┤ ├────────┤ ├──────────┤  │
│  │BMAD │ │Super-  │ │ Custom   │  │
│  │     │ │powers  │ │          │  │
│  └─────┘ └────────┘ └──────────┘  │
├─────────────────────────────────────┤
│    Per-Phase Agent Assignment       │
│  Research → Gemini                  │
│  Implement → Claude                 │
│  Review → Codex                     │
│  (Auto-switch at phase transition)  │
├─────────────────────────────────────┤
│       tmux Server ("agtx")          │
│  ┌──────────┐ ┌──────────┐         │
│  │ Project A│ │ Project B│         │
│  │ Session  │ │ Session  │         │
│  │┌────┐┌──┐│ │┌────┐┌──┐│        │
│  ││Task││T2││ ││Task││T2││        │
│  ││Win ││  ││ ││Win ││  ││        │
│  │└────┘└──┘│ │└────┘└──┘│        │
│  └──────────┘ └──────────┘         │
├─────────────────────────────────────┤
│    Git Worktree Isolation           │
│  (Each task = separate worktree)    │
└─────────────────────────────────────┘
```
    
**Key design decisions:**
- **Dedicated tmux server**: All agtx sessions run on a dedicated tmux server named `agtx`, separate from user's tmux sessions
- **Project → Session, Task → Window**: Clean mapping from project/task hierarchy to tmux primitives
- **TOML plugins**: Each plugin defines lifecycle hooks per phase transition — minimal config, maximum flexibility
- **Agent per phase**: Different agents optimized for different workflow stages, auto-switched
- **Rust implementation**: Fast startup, low memory, single binary distribution

---

## Publisher Background

Fynn Flügge is a software engineer based in Hamburg, Germany. He has 27 public repos on GitHub and 202 followers. He has contributed to projects like projen (AWS CDK infrastructure-as-code). While this is a solo-developer project, the Rust implementation suggests strong systems programming skills. The project is early (349 stars) but growing, with active development and a community forming around it (GitHub Discussions enabled). The BMAD plugin support is notably relevant — it suggests awareness of and compatibility with the broader agent orchestration ecosystem.

---

## What's Valuable for Us

1. **Per-phase agent assignment**: The idea of routing different workflow phases to different agents (research → fast/cheap agent, implementation → capable agent, review → thorough agent) is a pattern we should consider. Our orchestrator currently assigns one agent type per task. Phase-based switching could optimize cost and quality.

2. **TOML plugin system**: A single file defining lifecycle hooks per phase transition is an elegant pattern for making the orchestrator methodology-agnostic. We could adopt a similar plugin system to support different development workflows (e.g., TDD, spec-driven, spike) without hardcoding them.

3. **BMAD plugin**: agtx directly supports BMAD as a plugin, which is our own methodology. This validates that our workflow can be expressed as lifecycle hooks and suggests interoperability is possible.

4. **Dedicated tmux server**: Running all agent sessions on a separate tmux server (`agtx`) prevents collision with user tmux sessions. We currently use the user's tmux, which can cause confusion.

5. **Artifact tracking**: Built-in tracking of what each agent produces. We track state in JSON but don't explicitly track artifacts (files created, PRs opened, etc.).

---

## What's NOT Relevant

- **TUI dashboard**: Same as Overstory — we're headless by design. Interactive dashboards don't fit our orchestration pattern where the orchestrator itself is an AI agent, not a human.
- **Rust implementation**: We're TypeScript/shell. Can't reuse code directly, only patterns.
- **Multi-agent support (Gemini, Codex, Copilot)**: We're Claude-first. Multi-agent support adds complexity we've deliberately avoided.
- **Manual task creation**: agtx expects human-driven task creation via the TUI. Our orchestrator decomposes tasks programmatically.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Evaluate the per-phase agent assignment pattern. Could our orchestrator assign different reasoning modes (fast vs. deep) for different phases of a task? This doesn't require switching agents — just adjusting prompts.
- **Phase 3 (Days 60-90)**: Consider a TOML-based plugin system for workflow definitions. This would let us support different development methodologies per business line without code changes.
- **Phase 4 (Days 90+)**: If we ever need to coordinate agents across multiple business lines simultaneously, the dedicated tmux server pattern prevents session collision at scale.

---

## Key Takeaway

> **agtx's per-phase agent assignment and TOML plugin system for lifecycle hooks are the two patterns worth adopting — they solve the "one agent per task" rigidity and "hardcoded workflow" limitations in our current orchestrator without requiring us to switch tools.**
