# Jean Analysis: Fit with Our Vision

**Date:** 2026-03-07
**Project:** [coollabsio/jean](https://github.com/coollabsio/jean)
**By:** Andras Bacsai (Coolify founder)

---

## What Jean Is

A **native desktop app** (Tauri v2 = Rust backend + React frontend) that gives you a GUI for managing multiple AI coding agent sessions across projects. Think of it as a **visual tmux manager for Claude Code, Codex, and OpenCode** with git worktree automation baked in.

**It is NOT an orchestrator.** It does not make decisions about what agents should do, route tasks, manage state, or enforce quality gates. It's a **human-operated developer workbench**.

### Core Architecture

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
│                         │  run_log.rs    │ │
│                         ├────────────────┤ │
│                         │ projects/      │ │
│                         │  git.rs        │ │
│                         │  git_status.rs │ │
│                         │  github_*.rs   │ │
│                         │  linear_*.rs   │ │
│                         │  pr_status.rs  │ │
│                         │  saved_ctxs.rs │ │
│                         ├────────────────┤ │
│                         │ terminal/      │ │
│                         │ http_server/   │ │
│                         │ background_tasks│ │
│                         └────────────────┘ │
│                              │             │
│              ┌───────────────┼──────────┐  │
│              ▼               ▼          ▼  │
│         Claude CLI      Codex CLI   OpenCode│
│         (process)       (process)   (process)│
└────────────────────────────────────────────┘
```

### Key Features

| Feature | What It Does |
|---------|-------------|
| **Multi-project management** | Add multiple git repos, switch between them |
| **Git worktree automation** | Create, archive, restore, delete worktrees from UI |
| **Multi-session per worktree** | Several chat sessions running against same worktree |
| **Execution modes** | Plan / Build / Yolo — configures agent behavior |
| **Magic commands** | Investigate issues/PRs, code review with tracking, AI commit messages, PR generation, merge conflict resolution |
| **GitHub/Linear integration** | Issue investigation, PR checkout as worktree, auto-archive on merge |
| **Integrated terminal** | xterm.js embedded terminal |
| **Remote access** | Built-in HTTP server with WebSocket + token auth |
| **Detached sessions** | Run agents in background |

---

## How It Maps to Our Architecture

### The Fundamental Mismatch

| Jean's Layer | Our Architecture Layer | Match? |
|-------------|----------------------|--------|
| Developer GUI | Not in our blueprint | ❌ |
| Session management (chat sessions) | L-Thread Orchestrator session lifecycle | ⚠️ Similar problem, different solution |
| Git worktree management | Shared Infrastructure Layer (git worktree isolation) | ✅ Direct overlap |
| Process management (spawn Claude CLI) | tmux + LaunchAgent scheduling | ⚠️ Different mechanism, same goal |
| GitHub integration | CI/CD quality gates | ⚠️ Jean focuses on investigation, we focus on enforcement |

**Jean operates at the human-computer interface layer. Our architecture operates at the orchestration layer.** Jean assumes a human is sitting at a desk, managing agent sessions through a GUI. Our system assumes agents run autonomously with the human only reviewing outputs.

### Where Our Governing Principles Clash

**Principle #2 ("Deterministic orchestration, LLM execution")** — Jean has no deterministic orchestration. The human is the orchestrator, clicking buttons to start/stop/switch sessions. There's no programmatic routing, no state machine, no lookup tables.

**Principle #5 ("Human review is the binding constraint")** — Jean *increases* human involvement (you're manually managing every session), whereas our architecture *minimizes* it (agents run autonomously, human only reviews PRs).

**Principle #9 (from ADR-005, "The terminal is the interface")** — Jean builds a custom GUI. Our blueprint explicitly states "adding a custom interface is UI work that generates zero revenue."

---

## What's Interesting (Reference Value)

### 1. Execution Modes: Plan / Build / Yolo (⭐ Most Interesting)

Jean formalizes what many developers do informally — setting different autonomy levels:

| Mode | Behavior | Our Equivalent |
|------|----------|---------------|
| **Plan** | Agent plans but doesn't execute | Like asking agent to create a design doc first |
| **Build** | Agent plans and executes with confirmations | Our current developer-supervised mode |
| **Yolo** | Agent runs fully autonomously | Our target AUTO_MODE |

We could formalize this in our orchestrator state schema:
```json
{
  "current_task": {
    "execution_mode": "plan | build | yolo",
    ...
  }
}
```

### 2. Saved Contexts (`saved_contexts.rs`)

Jean lets users save and reuse context configurations per project. This validates our Skills system — pre-defined context bundles that get loaded for specific task types.

### 3. Detached Sessions (`detached.rs`)

Running agent sessions in background without needing the UI open. This is exactly what our tmux-based system does, but Jean implements it at the process level.

### 4. Git Worktree Lifecycle

Jean has proper worktree lifecycle management: create → work → archive (on PR merge) → restore/delete. Our blueprint mentions worktree-per-agent but doesn't formalize the lifecycle. Their archive-on-merge pattern is clean.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Desktop GUI (Tauri/React)** | We explicitly don't want a custom UI (ADR, Section 8.9). Terminal + Notion is our interface. |
| **GitHub/Linear issue investigation** | Cool for a developer tool, but our agents work from task assignments, not by browsing issue trackers interactively |
| **Manual session management** | We need *automated* session management, not human-driven |
| **Code review magic commands** | We use multi-model review gates (automated), not interactive code review |
| **Themes, fonts, keybindings** | Developer comfort features, irrelevant to orchestration |
| **Remote web access** | We use tmux+SSH/Tailscale, not a web app |

---

## Verdict

```
Relevance:  ███░░░░░░░ 3/10
Novelty:    ████░░░░░░ 4/10
Actionable: ██░░░░░░░░ 2/10
```

**Jean is a well-built developer tool that solves a fundamentally different problem.** It's the "interactive IDE extension" approach to agent management, whereas our architecture is the "autonomous orchestration engine" approach.

The overlap is minimal:

| What to Take | How |
|-------------|-----|
| **Execution modes concept** | Add `execution_mode: plan/build/yolo` to our task state schema |
| **Worktree lifecycle** | Formalize create → work → archive-on-merge → cleanup in our deterministic harness |
| **Nothing else** | — |

> [!NOTE]
> Jean is essentially what a solo developer builds when they want a nicer UI for managing Claude Code sessions. It's a good product for its audience (interactive developers), but has near-zero architectural relevance to our autonomous multi-business orchestration vision. It's solving the *human interface* problem, not the *agent coordination* problem.
