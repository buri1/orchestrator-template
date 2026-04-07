# Jean

> **A native desktop app (Tauri v2) for managing multiple AI coding agent sessions across projects — a visual tmux manager for Claude Code, Codex, and OpenCode with git worktree automation.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [coollabsio/jean](https://github.com/coollabsio/jean) |
| Publisher | Andras Bacsai / Coolify (solo — Coolify founder) |
| License | Open Source (check repo) |
| Tech Stack | Tauri v2 (Rust backend + React frontend), Zustand, xterm.js |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-07 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Solves the human interface problem, not the agent coordination problem. Operates at a fundamentally different layer than our architecture. |
| **Novelty** | 4/10 | Execution modes (Plan/Build/Yolo) and worktree lifecycle formalization are interesting concepts we haven't formalized. |
| **Actionable** | 2/10 | Only two small ideas worth taking: execution mode enum and worktree lifecycle pattern. |

---

## Overview

Jean is a **human-operated developer workbench**, not an orchestrator. It gives developers a GUI for managing multiple AI coding agent sessions across projects. Think of it as a visual tmux manager for Claude Code, Codex, and OpenCode with git worktree automation baked in.

**It does not** make decisions about what agents should do, route tasks, manage state, or enforce quality gates. The human is the orchestrator, clicking buttons to start/stop/switch sessions. This is the fundamental mismatch with our architecture — Jean assumes a human is sitting at a desk managing sessions through a GUI, while our system assumes agents run autonomously with the human only reviewing outputs.

Key features include multi-project management, git worktree automation (create/archive/restore/delete), multi-session per worktree, execution modes (Plan/Build/Yolo), "magic commands" for issue investigation and code review, GitHub/Linear integration, an embedded terminal (xterm.js), remote HTTP access, and detached background sessions.

---

## Technical Architecture

```
┌────────────────────────────────────────────┐
│            Jean (Tauri Desktop App)         │
│                                            │
│  React UI                Rust Backend      │
│  ┌──────────────┐       ┌────────────────┐ │
│  │ Components   │       │ chat/          │ │
│  │ Store(Zustand)│◄────►│  claude.rs     │ │
│  │ Hooks        │       │  codex.rs      │ │
│  │ Services     │       │  opencode.rs   │ │
│  └──────────────┘       │  detached.rs   │ │
│                         │  registry.rs   │ │
│                         ├────────────────┤ │
│                         │ projects/      │ │
│                         │  git.rs        │ │
│                         │  github_*.rs   │ │
│                         │  linear_*.rs   │ │
│                         ├────────────────┤ │
│                         │ terminal/      │ │
│                         │ http_server/   │ │
│                         └────────────────┘ │
│              ┌───────────────┼──────────┐  │
│              ▼               ▼          ▼  │
│         Claude CLI      Codex CLI   OpenCode│
│         (process)       (process)   (process)│
└────────────────────────────────────────────┘
```

Key architectural choices:
- **Tauri v2:** Rust backend for process management, React frontend for UI
- **Multi-harness support:** Claude, Codex, OpenCode via process spawning
- **Sessions:** Each chat session maps to a harness process against a worktree
- **State:** Zustand (client-side) + run logs (backend), no persistent server DB

---

## Publisher Background

Built by Andras Bacsai, known as the solo creator of [Coolify](https://coolify.io/) — a self-hosted alternative to Heroku/Netlify/Vercel. Bacsai has a track record of building polished, complex applications solo. The Coolify project has thousands of GitHub stars and a strong community. Jean appears to be a newer side project leveraging his Tauri/Rust expertise.

---

## What's Valuable for Us

1. **Execution Modes: Plan / Build / Yolo** *(Most Interesting)*

   Jean formalizes what developers do informally — setting different autonomy levels:

   | Mode | Behavior | Our Equivalent |
   |------|----------|---------------|
   | **Plan** | Agent plans but doesn't execute | Design doc first |
   | **Build** | Agent plans and executes with confirmations | Developer-supervised mode |
   | **Yolo** | Agent runs fully autonomously | Our target AUTO_MODE |

   Worth adding `execution_mode: plan | build | yolo` to our task state schema.

2. **Git Worktree Lifecycle:** Proper lifecycle management: create → work → archive (on PR merge) → restore/delete. Our blueprint mentions worktree-per-agent but doesn't formalize the lifecycle. Their archive-on-merge pattern is clean.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Desktop GUI (Tauri/React)** | We explicitly don't want a custom UI (ADR, Section 8.9). Terminal + Notion is our interface. |
| **GitHub/Linear issue investigation** | Our agents work from task assignments, not by browsing issue trackers interactively |
| **Manual session management** | We need *automated* session management, not human-driven |
| **Code review magic commands** | We use multi-model review gates (automated), not interactive code review |
| **Themes, fonts, keybindings** | Developer comfort features, irrelevant to orchestration |
| **Remote web access** | We use tmux+SSH/Tailscale, not a web app |

**Governing Principle conflicts:**
- **#2 (Deterministic orchestration):** Jean has no deterministic orchestration — the human is the routing layer.
- **#5 (Human review is binding constraint):** Jean *increases* human involvement; our architecture *minimizes* it.
- **#9 (The terminal is the interface):** Jean builds a custom GUI; our blueprint says "adding a custom interface is UI work that generates zero revenue."

---

## Future Use Cases

- **Phase 1 (Days 1–3):** Take the `execution_mode` concept for our task state schema.
- **Phase 2 (Days 4–60):** Formalize worktree lifecycle (create → work → archive-on-merge → cleanup) in our deterministic harness.
- **Phase 3–4:** No future relevance. Jean solves a different problem.

---

## Key Takeaway

> **Jean is a well-built developer tool solving a fundamentally different problem — it's the interactive IDE approach to agent management, while our architecture is the autonomous orchestration engine approach. Take the execution mode concept and worktree lifecycle, ignore everything else.**
