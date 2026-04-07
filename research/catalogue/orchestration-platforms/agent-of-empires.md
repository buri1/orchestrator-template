# Agent of Empires (AoE)

> **A terminal session manager for AI coding agents (Claude Code, Codex CLI, Gemini CLI, OpenCode, Pi.dev, Copilot CLI, Mistral Vibe, Cursor CLI) via tmux and git Worktrees, written in Rust.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [njbrake/agent-of-empires](https://github.com/njbrake/agent-of-empires) |
| GitHub Stars | 1,098 (as of 2026-03-12) |
| Publisher | Nate Brake (@natebrake) — solo developer |
| License | MIT |
| Tech Stack | Rust, tmux, Git Worktrees, Docker (optional sandbox), TUI (custom), TOML config |
| Maturity | 🟢 Production (active daily pushes, Homebrew formula, CI/CD, 86 forks, 25 open issues) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *This is the most directly applicable tool in the catalogue for our current architecture. AoE independently arrived at the exact same tmux + git worktree pattern we use in the L-Thread Orchestrator, and then productized it into a polished Rust binary with TUI, Docker sandboxing, diff view, and per-repo config hooks. The `remain-on-exit` pane pattern (panes survive agent crash for forensics) was already flagged in our research/indydevdan-patterns.md as a top-10 pattern to implement. The status detection module (`src/tmux/status_detection.rs`) is particularly valuable — it distinguishes running/waiting-for-input/idle states across all 8 supported agents. The per-repo `.aoe/config.toml` with lifecycle hooks is a cleaner version of our own `.bmad/scripts/` approach. The agent auto-detection (checks what's installed on your system) is a nice UX touch.*
>
> *The ClawHub badge (`clawhub.ai/njbrake/aoe`) is a new signal to track — seems like an emerging agent tool registry.*
>
> *Main gap: AoE is a session manager / TUI — it doesn't do orchestration (no task routing, no agent-to-agent communication, no state machine). It's infrastructure, not a coordinator. Think of it as the "tmux wrapper" layer that sits below our L-Thread Orchestrator logic. We could theoretically run our orchestrator on top of AoE sessions.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Direct overlap: tmux + git worktree isolation + multi-agent session management + Pi.dev support is exactly our stack. The status detection, diff view, Docker sandbox, and per-repo hooks are features we're building toward. Loses 1 point because AoE is a human-driven TUI tool, not a headless autonomous orchestrator — it assumes a human is watching the dashboard. |
| **Novelty** | 7/10 | The core tmux+worktree pattern is well-established (pi-side-agents, Overstory, Broomie all do it), but AoE's Rust implementation with polished TUI, Docker sandboxing, multi-agent auto-detection across 8 CLIs, and `remain-on-exit` forensic pane survival are genuinely novel contributions. The `.aoe/config.toml` per-repo hooks system is cleaner than anything we've catalogued. |
| **Actionable** | 8/10 | Four immediately actionable patterns: (1) `remain-on-exit` pane survival for crash forensics — add to our tmux session creation; (2) `status_detection.rs` logic for distinguishing agent states (running/waiting/idle) — adapt for our telemetry; (3) `.aoe/config.toml` per-repo lifecycle hooks — model our `.bmad/scripts/` after this; (4) agent auto-detection pattern for multi-harness support. All four are adaptable to our bash-based orchestrator today. |

---

## Overview

Agent of Empires wraps tmux to create a purpose-built terminal session manager for AI coding agents. Each session is a tmux session, so agents keep running when the TUI is closed. The key design philosophy: **sessions are infrastructure, not ephemeral processes**. Close and reopen AoE freely; agents persist until explicitly deleted.

The tool supports 8 agent CLIs (Claude Code, OpenCode, Mistral Vibe, Codex CLI, Gemini CLI, Cursor CLI, Copilot CLI, Pi.dev) with auto-detection of which are installed. Each session maps to a git worktree on a dedicated branch, providing full code isolation between parallel agents. The TUI dashboard offers agent/terminal view toggle (`t`), diff view (`D`), status indicators (running/waiting/idle), and a full help system.

Docker sandboxing is opt-in — `aoe add --sandbox .` wraps the agent in a container with shared auth volumes, so credentials flow through without being copied into the container. The bare repo + worktree workflow is explicitly documented as the recommended setup for maximum parallelism across branches.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  AoE Binary (Rust)                        │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   TUI    │  │   CLI    │  │ Session  │  │  Agent   │ │
│  │Dashboard │  │  cmds    │  │ Builder  │  │ Detector │ │
│  │ (toggle  │  │ (add,    │  │(worktree │  │(cc,ocode,│ │
│  │ agent/   │  │  delete, │  │+branch+  │  │codex,gmi,│ │
│  │terminal) │  │  list)   │  │sandbox)  │  │pi,etc.)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       └──────────────┴─────────────┴─────────────┘       │
│                           │                              │
│  ┌────────────────────────┴─────────────────────────┐   │
│  │                Core Modules (Rust)                │   │
│  │                                                   │   │
│  │  src/session/ — instance lifecycle, profiles,     │   │
│  │    storage, status detection, config               │   │
│  │  src/tmux/ — session ops, status bar, terminal    │   │
│  │  src/git/ — worktree create/list/delete, diff     │   │
│  │  src/containers/ — Docker runtime interface       │   │
│  │  src/tui/ — dashboard, keybindings                │   │
│  │  src/process/ — agent subprocess management       │   │
│  └─────────────────────────┬─────────────────────────┘   │
│                            │                              │
│  ┌─────────────────────────┴────────────────────────┐    │
│  │              tmux (subprocess)                    │    │
│  │  Per-session named tmux sessions                  │    │
│  │  Agent pane | Terminal pane (toggle with `t`)     │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
         │               │               │
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │ Claude  │     │  Pi.dev │     │ Codex   │
    │  Code   │     │         │     │  CLI    │
    └─────────┘     └─────────┘     └─────────┘
```

### Key Source Modules

| Module | Path | Purpose |
|--------|------|---------|
| Session builder | `src/session/builder.rs` | Worktree resolution, sandbox config, branch creation |
| Instance lifecycle | `src/session/instance.rs` | Start/stop/delete + `remain_on_exit` |
| Status detection | `src/tmux/status_detection.rs` | Distinguish running/waiting/idle per agent type |
| Git worktree | `src/git/mod.rs` | List, create, delete worktrees; bare repo detection |
| Diff view | `src/git/diff.rs` | In-TUI git diff rendering |
| Container config | `src/session/container_config.rs` | Docker sandbox with shared auth volumes |
| Per-repo config | `src/session/repo_config.rs` | `.aoe/config.toml` lifecycle hooks |
| Profile config | `src/session/profile_config.rs` | Multi-workspace profile isolation |
| Civilizations | `src/session/civilizations.rs` | Agent CLI detection + command building |
| tmux status bar | `src/tmux/status_bar.rs` | Integrated session monitoring widget |

### Session Data Model

Each session (`Instance`) tracks:
- `title` — unique identifier
- `path` — absolute path to working directory (or worktree)
- `group` — session grouping (maps to profile)
- `tool` — which agent CLI (detected from installed binaries)
- `worktree_branch` — git branch if using worktree isolation
- `sandbox: bool` — whether running in Docker container
- `yolo_mode: bool` — `--dangerously-skip-permissions` equivalent
- `extra_args` / `command_override` — CLI passthrough

### Per-Repo Config (`.aoe/config.toml`)

```toml
[worktree]
path_template = "../{repo}-{branch}"
bare_repo_path_template = "./{branch}"

[hooks]
before_agent_start = "npm install"
after_agent_stop = "git push origin HEAD"
```

Hooks fire before/after agent lifecycle events, enabling automated setup and cleanup.

### Docker Sandbox

```bash
aoe add --sandbox .  # Wraps agent in container
# Auth volumes shared: ~/.claude, ~/.config/gh, etc.
# Shared auth means no credential copying
# Each container gets isolated filesystem + shared host auth
```

---

## Publisher Background

**Nate Brake** (GitHub: njbrake, X: @natebrake) is a solo developer who built AoE as a personal productivity tool that grew into a public project. The tool has a dedicated website (`agent-of-empires.com`), YouTube channel, and ClawHub profile — signs of deliberate productization beyond a weekend hack. 1,098 stars with 86 forks indicates meaningful community adoption. The Homebrew formula and Nix flake show packaging maturity. Active CI/CD pipeline (GitHub Actions badge) and 25 open issues indicate ongoing maintenance. No VC backing visible — practitioner-built, similar to our L-Thread Orchestrator origin.

The ClawHub platform (`clawhub.ai`) appears to be a new AI tools registry — AoE's presence there (`clawhub.ai/njbrake/aoe`) is worth tracking as a discovery surface.

---

## What's Valuable for Us

### 1. `remain-on-exit` Pane Survival — Highest Priority

From our `_bmad/research/indydevdan-patterns.md` Pattern #5, this was already flagged as a top pattern to implement. AoE has it in production. When an agent crashes, the pane stays open for crash forensics rather than being destroyed. This directly solves INC-007 (zombie kill) and INC-008 (invisible terminal) from our incidents log.

**Concrete tmux flag to add to our session creation:**
```bash
tmux set-option -t <session> remain-on-exit on
```

### 2. Status Detection Logic (`src/tmux/status_detection.rs`)

AoE distinguishes three agent states — running (active computation), waiting-for-input (blocked on human), and idle (done or paused) — across 8 different agent CLIs. This is more sophisticated than our current binary running/stopped detection. Adapting this for our telemetry pipeline would enable the ZFC principle (observable state overrides stored state) flagged in our research.

### 3. Per-Repo `.aoe/config.toml` Lifecycle Hooks

The hook system (`before_agent_start`, `after_agent_stop`) is a cleaner architecture than our scattered `.bmad/scripts/` approach. The template pattern for worktree paths (`../repo-branch`) directly matches our naming convention. Worth modeling our own config layer after this.

### 4. Bare Repo Detection + Worktree Template Selection

AoE auto-detects whether a repo is bare and selects the appropriate worktree path template. Our `pi-orchestrator` uses worktrees but doesn't handle the bare-vs-regular distinction gracefully. AoE's `GitWorktree::is_bare_repo()` + `find_main_repo()` pattern is directly adaptable.

### 5. Agent Auto-Detection (`src/session/civilizations.rs`)

The "civilizations" module detects which agent CLIs are installed and builds the correct launch command for each. As we expand beyond Claude Code (Pi.dev support is live), this pattern gives us a clean abstraction for multi-harness support without hardcoding agent paths.

### 6. Profile Isolation for Multi-Client Work

The Profiles feature maps cleanly to our multi-business-line architecture — different profiles for gov contract work, SaaS factory, lead gen, etc. Each profile gets its own session namespace with isolated config.

---

## What's NOT Relevant

### 1. TUI Dashboard

AoE is designed for a human watching a terminal dashboard. Our L-Thread Orchestrator is headless — the orchestrator is the watcher, not a human. The TUI polish (toggle views, keybindings, diff view) is irrelevant to our autonomous operation model. Per CLAUDE.md Rule 1 (DU BIST KEIN ENTWICKLER), we orchestrate, not supervise interactively.

### 2. Human-Driven Session Management

AoE requires a human to create sessions (`n` key), attach to them (`Enter`), delete them (`d`). Our architecture spawns and kills agents programmatically via the supervisor's `spawn_worker` / `close_worker` tools. AoE has no API surface for programmatic control — it's a human tool, not an agent tool.

### 3. Multi-Provider Strategy (as tooling decision)

While AoE supports 8 agent CLIs, this is a feature for humans who want to mix Claude + Codex + Gemini. Our Claude Max subscription makes single-provider the right economic choice (18-36x arbitrage). The multi-provider architecture of AoE's `civilizations.rs` is worth studying for future harness-agnostic design, but we don't need it today.

### 4. Docker Sandbox for Our Workloads

Docker sandboxing is valuable for untrusted code, but our gov contract work runs on trusted internal repos. The sandbox overhead and Docker daemon dependency conflicts with our zero-infra lean approach. The auth volume sharing pattern is clever but irrelevant until we need container isolation.

---

## Future Use Cases

- **Phase 1 (Now)**: Adopt `remain-on-exit` tmux flag immediately — copy the pane-survival pattern from AoE into our `_bmad/scripts/tmux-helpers.sh`. Zero development cost; one tmux option.
- **Phase 2 (Days 4-60)**: Study `src/tmux/status_detection.rs` to improve our telemetry's agent state discrimination. Add running/waiting/idle three-state detection to our `_bmad/telemetry/` pipeline instead of binary running/stopped. Also model our supervisor config on AoE's `.aoe/config.toml` hooks system.
- **Phase 3 (Days 60-90)**: If expanding to multiple business lines with different harness preferences, AoE's Profiles system provides the right mental model for namespace isolation. Consider whether AoE could replace our hand-rolled tmux session creation scripts entirely.
- **Phase 4 (Days 90+)**: If the Rust binary becomes a bottleneck vs our bash orchestrator, AoE demonstrates that a Rust tmux wrapper is production-viable (Homebrew, CI, 1K stars). The `src/session/` module architecture is a reference for a potential Rust rewrite of our session management layer.

---

## Key Takeaway

> **AoE independently validates and productizes our exact architecture — tmux + git worktrees + multi-agent isolation — in a polished Rust binary; the `remain-on-exit` forensic pane survival, three-state status detection, and per-repo lifecycle hooks are the three patterns to adapt into our L-Thread Orchestrator immediately.**
