# Herdr

> **Supervise multiple coding agents in one terminal — a Rust-native terminal workspace manager with socket API and agent status detection.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [ogulcancelik/herdr](https://github.com/ogulcancelik/herdr) |
| Homepage | [herdr.dev](https://herdr.dev) |
| GitHub Stars | 214 (as of 2026-04-04) |
| Publisher | Can Celik (@ogulcancelik, oddbit.ai) — solo developer; also authored pi-extensions (42 stars), unity-bridge (31 stars) |
| License | AGPL-3.0 |
| Tech Stack | Rust (first Rust project, built primarily by AI agents), Unix sockets (JSON-RPC), TOML config, proc_pidinfo (macOS) / /proc (Linux) |
| Maturity | 🟡 Early (v0.1.x; 190 commits; 15 forks; 2 open issues; single-person project; active development since 2026-03-27) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *Herdr is conceptually in the same space as dmux, Agent of Empires, and cmux — terminal-native agent multiplexers. What distinguishes it: (1) it replaces tmux entirely rather than wrapping it (like cmux does, unlike dmux/AoE which build on tmux), (2) it has the most complete Unix socket API in this subcategory with full event subscriptions (output matching, agent status changes), and (3) the SKILL.md template system gives agents a portable reference for self-orchestration via CLI.*
>
> *The socket API is genuinely well-designed — newline-delimited JSON, 22 methods, parameterized event subscriptions with output pattern matching and agent status transitions. This is closer to what we'd want for programmatic agent control than raw tmux send-keys/capture-pane. The `herdr wait agent-status <pane> --status done --timeout 60000` command alone would replace our entire polling loop.*
>
> *However: 214 stars, AGPL-3.0 license (viral copyleft — can't fork without open-sourcing), solo developer's first Rust project, and built primarily by AI agents. The maturity gap versus dmux (1,161 stars, MIT, TypeScript, extensive test suite) and cmux (5,300 stars, AGPL but official Ghostty ecosystem) is significant. The "built by AI agents" provenance is both a feature and a risk — impressive as a demo, but raises questions about code quality and maintainability.*
>
> *The integration system (hooks into Claude Code, Pi, Codex, OpenCode) for authoritative state reporting is smart — rather than guessing agent status from terminal output, have the agent itself report state transitions via hooks. This is architecturally cleaner than dmux's LLM-powered status detection (which requires OpenRouter API calls). The Claude Code integration maps hook events to states: UserPromptSubmit/PreToolUse→working, PermissionRequest→blocked, Stop→idle, SessionEnd→release.*
>
> *Bottom line: Study the socket API design and integration hook patterns. Don't adopt the binary — AGPL + early maturity + solo dev. If we ever move off tmux, cmux is the better bet. But the `pane.wait_for_output` subscription pattern and the hook-based state reporting are patterns worth stealing for our own orchestrator.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Solves the same "supervise parallel coding agents" problem we solve with tmux. The socket API and event subscriptions are directly applicable to our orchestrator loop (replacing tmux capture-pane polling). Loses points: we're committed to tmux (or cmux migration), AGPL blocks forking, and herdr doesn't do orchestration (no task routing, no state machine, no git worktree isolation). |
| **Novelty** | 7/10 | Three genuinely new patterns vs. existing catalogue: (1) Hook-based authoritative agent state reporting (agents self-report via integration hooks rather than output parsing or LLM analysis), (2) Unix socket event subscriptions with output pattern matching (`pane.wait_for_output` + `pane.agent_status_changed`), (3) SKILL.md as a portable agent reference for self-orchestration. The terminal replacement approach (vs. tmux wrapper) we've already seen in cmux. |
| **Actionable** | 6/10 | Can't adopt the binary (AGPL, maturity). But three patterns are immediately adaptable: (1) The Claude Code hook integration pattern for authoritative state reporting — we could add similar hooks to our orchestrator, (2) The `wait agent-status` subscription model — cleaner than our tmux capture-pane polling, (3) The SKILL.md template concept for giving agents self-orchestration awareness. Requires adaptation work, not drop-in. |

---

## Overview

Herdr is a single Rust binary that serves as a terminal-native workspace manager purpose-built for supervising multiple AI coding agents. Rather than wrapping tmux (like dmux, Agent of Empires, NTM), herdr replaces the terminal multiplexer entirely — it renders its own PTY-based panes, tabs, and workspaces using a Ghostty/Alacritty/Kitty/WezTerm host terminal (it can also run inside tmux as a host).

The core value proposition is "the missing layer: supervision." Herdr provides real-time agent status detection (idle/working/blocked/done) via a two-tier system: foreground process identification (proc_pidinfo on macOS, /proc on Linux) determines which agent is running, then per-agent heuristics analyze terminal screen content to determine state. For deeper integration, herdr installs hook scripts into Claude Code, Pi, Codex, and OpenCode that enable authoritative state reporting — the agent itself tells herdr what it's doing, bypassing heuristic guessing.

The programmatic API is herdr's strongest technical contribution. A Unix domain socket serves newline-delimited JSON with 22 methods covering workspace/tab/pane CRUD, output reading, text/key injection, output pattern matching, and event subscriptions. Agents running inside herdr can use the `herdr` CLI (which wraps the socket API) to spawn sibling panes, read their output, wait for specific patterns, and coordinate parallel work — enabling agent-to-agent orchestration without external infrastructure.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Terminal (Ghostty/Alacritty/etc.)    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              herdr Process (Rust binary)               │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ PTY Engine    │  │ Socket Server│  │ Agent        │ │  │
│  │  │ - Workspaces  │  │ Unix socket  │  │ Detector     │ │  │
│  │  │ - Tabs        │  │ JSON-RPC     │  │ - Process ID │ │  │
│  │  │ - Panes       │  │ 22 methods   │  │ - Heuristics │ │  │
│  │  │ - Rendering   │  │ Events/Subs  │  │ - Hook state │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │  │
│  │         │                  │                  │        │  │
│  │  ┌──────┴──────────────────┴──────────────────┴──────┐ │  │
│  │  │              Session State                         │ │  │
│  │  │  ~/.config/herdr/session.json (auto-persist)       │ │  │
│  │  │  ~/.config/herdr/config.toml  (user prefs)         │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Agent Integration Hooks (installed per-agent)         │  │
│  │  Claude: ~/.claude/hooks/herdr-agent-state.sh          │  │
│  │  Pi:     ~/.pi/agent/extensions/herdr-agent-state.ts   │  │
│  │  Codex:  ~/.codex/herdr-agent-state.sh                 │  │
│  │  OCode:  ~/.config/opencode/plugins/herdr-agent-state  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key data structures:**

- **workspace_info**: `{workspace_id, number, label, focused, pane_count, tab_count, active_tab_id, agent_status}`
- **pane_info**: `{pane_id, workspace_id, tab_id, focused, cwd, agent, agent_status, revision}`
- **agent_status enum**: `idle | working | blocked | done | unknown`
- **Detection pipeline**: Process ID → agent name match → screen heuristics → hook override (if integration installed)
- **Session persistence**: Auto-saved to `~/.config/herdr/session.json` (workspaces, tabs, layouts, CWD, focus state). Restored on restart. `--no-session` for fresh start.

**Socket API highlights:**
- Transport: Newline-delimited JSON over Unix socket (`/tmp/herdr.sock` or `$HERDR_SOCKET_PATH`)
- 22 methods: workspace.{list,get,create,focus,rename,close}, tab.{list,get,create,focus,rename,close}, pane.{list,get,read,split,send_text,send_keys,send_input,close,wait_for_output}, events.subscribe
- Event subscriptions: 12 lifecycle events (created/closed/focused for workspace/tab/pane, plus pane.exited, pane.agent_detected, tab.renamed) + 2 parameterized subscriptions (pane.output_matched with regex/substring, pane.agent_status_changed with optional status filter)
- Output reading: 3 source modes (visible, recent, recent_unwrapped), configurable line count (max 1000), optional ANSI stripping

---

## Publisher Background

Can Celik (@ogulcancelik) is a solo developer based at oddbit.ai. His most notable project prior to herdr is pi-extensions (42 stars), a TypeScript extensions package for Pi agent, and unity-bridge (31 stars), a minimal HTTP bridge for AI-driven Unity Editor control. His GitHub account dates to 2014 with 29 public repos and 26 followers. Herdr is explicitly described as his first Rust project, "built almost entirely through AI coding agents" — making herdr itself a demonstration of the agent-supervised workflow it enables. The Pi ecosystem involvement (pi-extensions, pi-web-browse) suggests deep familiarity with coding agent patterns.

---

## What's Valuable for Us

1. **Hook-based authoritative state reporting** — The integration system where agents self-report state transitions (working/blocked/idle/done) via installed hooks is architecturally superior to both our tmux capture-pane regex approach and dmux's LLM-powered analysis. The Claude Code integration maps: `UserPromptSubmit/PreToolUse→working`, `PermissionRequest→blocked`, `Stop→idle`, `SessionEnd→release`. We could adopt this pattern in our orchestrator by installing similar hooks into our worker agents' Claude Code instances.

2. **Socket API event subscription model** — The `pane.wait_for_output` with regex/substring matching and `pane.agent_status_changed` subscriptions are a cleaner abstraction than our polling-based monitoring. The pattern of subscribing once and receiving push events eliminates the need for our `tmux capture-pane` polling loop. Even if we don't adopt herdr, we could implement a similar socket-based event system in our orchestrator.

3. **SKILL.md portable agent reference** — The concept of giving agents a standardized reference document (SKILL.md) that documents the CLI API for self-orchestration is a pattern we should adopt. Agents running inside herdr can read SKILL.md to learn how to spawn sibling tasks, wait for them, and read their output. We could create a similar reference for agents running in our tmux environment.

4. **Workspace/Tab/Pane hierarchy** — The three-level hierarchy (workspace=project, tab=subcontext, pane=terminal) is more structured than our flat tmux windows. Worth considering for organizing parallel agents by task group.

5. **Agent detection heuristic taxonomy** — The four-state model (idle/working/blocked/done) with per-agent heuristic rules is well-specified. The distinction between full support (Claude Code, Codex, droid, opencode) and partial support (pi, amp) with clear capability matrices is a good reference for our own agent monitoring.

---

## What's NOT Relevant

1. **Terminal replacement approach** — We're committed to tmux (and potentially cmux). Herdr's value as a terminal emulator isn't useful to us — we need the orchestration patterns, not the rendering engine.

2. **AGPL-3.0 license** — Viral copyleft prevents forking code into our proprietary orchestrator. We can study patterns but cannot copy implementations. (dmux is MIT, Agent of Empires is MIT — both are forkable.)

3. **No git worktree isolation** — Herdr manages terminal panes but doesn't create per-agent git worktrees. This is a critical gap for our use case — every worker needs its own branch/worktree to avoid conflicts. dmux and AoE both handle this natively.

4. **No task routing or orchestration logic** — Like AoE and dmux, herdr is a session manager, not a coordinator. There's no concept of task queues, issue assignment, PR review cycles, or state machine progression. The SKILL.md enables agent-to-agent awareness but not structured orchestration.

5. **Early maturity + AI-built codebase** — 214 stars, solo dev's first Rust project, primarily AI-written code. The risk profile is too high for production adoption. Compare: dmux has 5x the stars, TypeScript (our stack), MIT license, two active developers, and a comprehensive test suite.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt the hook-based state reporting pattern. Install Claude Code hooks in our worker agents that write state transitions to a file or socket that our orchestrator monitors. This would replace or supplement our tmux capture-pane polling with authoritative state data.

- **Phase 3 (Days 60-90)**: If we build a custom socket API for our orchestrator (replacing raw tmux commands), herdr's API design is the best reference in the catalogue — better structured than dmux's HTTP REST (22 focused methods vs. generic CRUD endpoints), with the event subscription system being the key differentiator.

- **Phase 4 (Days 90+)**: The SKILL.md concept could evolve into a standardized "agent capability advertisement" — each agent environment publishes a skill reference that other agents can discover and use. This aligns with the broader skill ecosystem pattern (OpenAI Skills, SkillKit).

---

## Key Takeaway

> **Herdr's hook-based authoritative state reporting (agents self-report via installed integration hooks) and socket API event subscriptions are architecturally superior to our polling-based monitoring — study these patterns even though the AGPL license and early maturity prevent direct adoption.**
