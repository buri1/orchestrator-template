# cmux

> **Ghostty-based macOS terminal with vertical tabs and notifications for AI coding agents — scriptable via CLI and Unix socket API.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [manaflow-ai/cmux](https://github.com/manaflow-ai/cmux) |
| GitHub Stars | 5,305 (as of 2026-03-12) |
| Homepage | [cmux.dev](https://cmux.dev) |
| Publisher | Manaflow AI — Lawrence Chen (@lawrencecchen, 1,111 commits) + Austin Wang (@austinywang, 225 commits); startup; previously built manaflow web platform |
| License | AGPL-3.0-or-later |
| Tech Stack | Swift + AppKit (native macOS), libghostty (Ghostty terminal rendering), Zig (daemon/xcframework), Go (remote daemon), WebKit/WKWebView (browser), Bonsplit (custom split/tab framework), Sparkle (auto-update), PostHog (analytics), Sentry (crash reporting) |
| Maturity | 🟢 Production (v0.62.0; 1,219+ PRs; daily releases; auto-update via Sparkle; 5.3K stars; Homebrew tap) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> This is THE tool I've been unknowingly building towards with our tmux-based L-Thread Orchestrator. cmux is what happens when someone takes the "terminal as agent substrate" concept and builds a purpose-built native app around it instead of bolting automation onto tmux. The socket API + CLI gives us everything we do with tmux send-keys/capture-pane but with proper handle-based addressing, JSON-RPC, and first-class notification rings. The `cmux claude-teams` command that shims tmux commands into cmux operations is the killer feature -- it means Claude Code's native agent teams mode works directly in cmux splits without ANY tmux dependency. The in-app scriptable browser eliminates our Chrome DevTools MCP dependency for E2E testing. This could collapse our entire tmux + notification + browser testing stack into a single native app. MUST INSTALL AND TEST IMMEDIATELY.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 10/10 | Directly replaces our tmux substrate, notification hacks, and browser testing infrastructure with a single native app. The socket API is a superset of everything we do with tmux. The `claude-teams` tmux shim means zero migration cost for Claude Code's agent teams. The browser automation API eliminates Chrome DevTools MCP dependency. This is the most architecturally aligned tool in the entire catalogue. |
| **Novelty** | 9/10 | Native macOS terminal with first-class agent notification rings, scriptable browser, handle-based JSON-RPC socket API, tmux compatibility shim, remote SSH with daemon bootstrap, and `wait-for` event signaling -- none of these exist in any other tool we've catalogued. The only thing keeping this from 10/10 is that the underlying concept (terminal + splits + scripting) is familiar from tmux. |
| **Actionable** | 10/10 | Install today, replace tmux tomorrow. The `cmux claude-teams` command is a drop-in replacement for our tmux-based agent spawning. The socket API (`cmux send`, `cmux read-screen`, `cmux notify`, `cmux new-workspace`, `cmux new-split`) maps 1:1 to our existing orchestrator operations. The browser API (`cmux browser snapshot`, `cmux browser click`) replaces Chrome DevTools MCP for E2E testing. |

---

## Overview

cmux is a native macOS terminal application built in Swift/AppKit on top of libghostty (the rendering engine from Ghostty terminal). It was purpose-built for developers running multiple AI coding agent sessions in parallel -- the exact use case our L-Thread Orchestrator addresses via tmux.

The core concept is a three-level hierarchy: **Windows** contain **Workspaces** (vertical tabs in a sidebar), workspaces contain **Panes** (split containers), and panes contain **Surfaces** (terminal or browser tabs within a pane). Every entity has a stable handle (UUID + short ref like `surface:7`, `pane:3`, `workspace:2`) and is addressable via CLI or JSON-RPC socket API. The sidebar shows git branch, linked PR status/number, working directory, listening ports, and the latest notification text for each workspace -- all the context you need at a glance.

The notification system is the standout UX feature: when an agent needs attention, its pane gets a blue ring and the workspace tab lights up in the sidebar. A notification panel aggregates all pending notifications with one-click jump. This is built on standard terminal escape sequences (OSC 9/99/777) plus a `cmux notify` CLI that agent hooks can call. The `cmux claude-teams` launcher sets up a tmux shim that translates Claude Code's native tmux commands into cmux operations, enabling agent teams mode without any tmux installation.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    cmux.app (Swift/AppKit)                         │
│                                                                    │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐  │
│  │ Sidebar   │  │ Terminal      │  │ Browser (WKWebView)       │  │
│  │ - Git     │  │ - libghostty  │  │ - Scriptable API          │  │
│  │ - PR      │  │ - GPU accel   │  │ - Snapshot + Refs         │  │
│  │ - Ports   │  │ - Ghostty cfg │  │ - Click/Fill/Eval/Wait    │  │
│  │ - Notif   │  │ - PTY         │  │ - Ported from agent-brow. │  │
│  └──────────┘  └──────────────┘  └───────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │             Bonsplit (Custom Split/Tab Framework)             │  │
│  │  - Horizontal/vertical splits                                │  │
│  │  - Drag-and-drop surfaces between panes                      │  │
│  │  - Tab bar per pane with notification badges                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │             Unix Socket Server (JSON-RPC v2)                  │  │
│  │  /tmp/cmux.sock (or tagged: /tmp/cmux-debug-<tag>.sock)      │  │
│  │                                                               │  │
│  │  v2 Methods:                                                  │  │
│  │  - window.{list,current,focus,create,close}                  │  │
│  │  - workspace.{list,create,select,close,move_to_window}       │  │
│  │  - surface.{list,create,close,split,focus,send_text,send_key}│  │
│  │  - pane.{list,create,focus,surfaces}                         │  │
│  │  - notification.{create,list,clear}                          │  │
│  │  - browser.{open_split,navigate,snapshot,click,fill,...}     │  │
│  │  - system.{identify,capabilities}                            │  │
│  │  - debug.{type,terminal.read_text,window.screenshot,...}     │  │
│  │                                                               │  │
│  │  Auth Modes: off | cmux-only | automation | password | open  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │             CLI (cmux binary, 9,383 lines Swift)              │  │
│  │  80+ commands: topology, input, notifications, browser,       │  │
│  │  tmux compatibility (capture-pane, resize-pane, pipe-pane,   │  │
│  │  wait-for, swap-pane, break-pane, join-pane, etc.)           │  │
│  │  + claude-teams launcher with tmux shim                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │             Remote SSH (cmuxd-remote, Go daemon)              │  │
│  │  - Bootstraps daemon over SSH                                │  │
│  │  - HMAC-SHA256 authenticated relay                           │  │
│  │  - SOCKS5 + HTTP CONNECT proxy                               │  │
│  │  - PTY resize coordination                                    │  │
│  │  - CLI relay via reverse SSH forward                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **Handle-based addressing:** Every entity (window, workspace, pane, surface) gets a UUID and a short ref (`surface:N`). All CLI/socket commands accept both. This is far superior to tmux's session:window.pane addressing which breaks on topology changes.
- **v2 JSON-RPC protocol:** Newline-delimited JSON over Unix socket. Request: `{"id":"1","method":"workspace.list","params":{}}`. Response: `{"id":"1","ok":true,"result":{...}}`. Clean, typed, machine-readable.
- **Tmux compatibility layer:** A shim that translates `tmux new-session`, `tmux new-window`, `tmux split-window`, `tmux send-keys`, etc. into cmux workspace/split/send operations. This is what makes `cmux claude-teams` work.
- **Socket auth modes:** Five levels from `off` to `allowAll`, with password mode using file-based storage (migrated from keychain). The `cmux-only` mode verifies caller process ancestry.
- **Environment injection:** Every terminal spawned inside cmux gets `CMUX_WORKSPACE_ID`, `CMUX_SURFACE_ID`, and `CMUX_SOCKET_PATH` in its environment. CLI commands auto-resolve the caller's context from these.
- **Session restore:** Layout, working directories, and terminal scrollback survive app restart. Live process state (Claude Code sessions, tmux, vim) does NOT survive yet.
- **Browser API:** Ported from [agent-browser](https://github.com/vercel-labs/agent-browser) by the same team's founder. Snapshot + element refs pattern: snapshot the accessibility tree, get ref handles (`e1`, `e2`), interact via refs. Click, fill, type, eval JS, wait for conditions, screenshot.

---

## Publisher Background

**Manaflow AI** is a startup founded by Lawrence Chen (@lawrencecchen) and Austin Wang (@austinywang). Lawrence is the primary developer with 1,111 commits (90%+ of the codebase). The organization previously built a web-based agent orchestration platform (the old "manaflow" which we catalogued at 5/10 — that entry is now obsolete).

The pivot to cmux as a native macOS terminal was a strategic bet on "primitives not solutions" — their "Zen of cmux" philosophy explicitly rejects prescriptive workflows in favor of composable primitives that developers wire together themselves. This aligns perfectly with our own architecture philosophy.

Chris Tate (@ctatedev) from Vercel, who created agent-browser (20K stars), is connected to the project — the browser automation API in cmux is ported from agent-browser.

**Key signals:**
- 5,305 stars in ~6 weeks (created 2026-01-28)
- 310 forks, 442 open issues (high engagement)
- 1,219+ PRs merged
- v0.62.0 — 62 releases in 6 weeks (daily release cadence)
- Founder's Edition monetization (priority features, early access to AI features, iOS app, cloud VMs, voice mode)
- Ghostty-compatible (reads existing `~/.config/ghostty/config`)
- 18 language localizations

---

## What's Valuable for Us

### 1. REPLACE TMUX ENTIRELY (Critical Path)
cmux's socket API + CLI is a strict superset of everything we do with tmux in the L-Thread Orchestrator:

| Our tmux Operation | cmux Equivalent |
|---|---|
| `tmux new-session -d -s <name>` | `cmux new-workspace --cwd <path>` |
| `tmux split-window -h/-v` | `cmux new-split right/down` |
| `tmux send-keys -t <pane> 'cmd' Enter` | `cmux send --workspace <ref> --surface <ref> 'cmd'` |
| `tmux capture-pane -t <pane> -p -S -50` | `cmux read-screen --surface <ref> --lines 50` |
| `tmux has-session -t <name>` | `cmux list-workspaces` (check if exists) |
| `tmux list-panes -F '#{pane_current_command}'` | `cmux list-pane-surfaces --workspace <ref>` |
| `tmux kill-session -t <name>` | `cmux close-workspace --workspace <ref>` |

Plus cmux adds: handle-based stable addressing, JSON output, environment-based auto-targeting, notification rings, browser automation, session persistence, and the sidebar with git/PR/port context.

### 2. `cmux claude-teams` — ZERO-MIGRATION AGENT TEAMS
The `claude-teams` launcher sets `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, prepends a tmux shim to PATH, and runs Claude Code. The shim translates Claude's native tmux window/pane commands into cmux workspace/split operations. This means:
- Claude Code's agent teams mode works natively in cmux
- No tmux installation needed
- Each agent gets a proper workspace with notification rings
- The orchestrator can monitor agents via the socket API

### 3. BROWSER AUTOMATION REPLACES CHROME DEVTOOLS MCP
The `cmux browser` command family provides:
- `snapshot --interactive` — accessibility tree with element refs
- `click/fill/type/select` with ref handles
- `wait` with selectors, text, URL, load state, or JS function conditions
- `eval` for arbitrary JavaScript
- `screenshot` for visual verification
- `cookies/storage/state` for session management

This eliminates our dependency on Chrome DevTools MCP for E2E testing (INC-014, INC-015). The browser pane lives alongside the terminal — no external browser process to manage.

### 4. NOTIFICATION SYSTEM FOR AGENT MONITORING
The `cmux notify` CLI and OSC 9/99/777 terminal sequences provide:
- Blue ring on pane when agent needs attention
- Tab lights up in sidebar
- Notification panel with jump-to-unread
- macOS system notifications
- Configurable sounds
- `cmux claude-hook` for Claude Code session lifecycle events

This replaces our custom tmux-based notification polling.

### 5. `wait-for` EVENT SIGNALING
`cmux wait-for [-S|--signal] <name> [--timeout <seconds>]` provides event-driven waiting — exactly what our orchestrator needs instead of `bash sleep` loops. One agent can signal an event, another blocks until the signal arrives.

### 6. `pipe-pane` FOR OUTPUT STREAMING
`cmux pipe-pane --command <shell-command>` pipes terminal output to a shell command in real-time. This could feed our telemetry/scribe pipeline directly.

### 7. HANDLE-BASED TOPOLOGY MODEL
The `window:N > workspace:N > pane:N > surface:N` hierarchy with stable short refs and UUIDs is a proper data model. Our tmux session:window.pane addressing is fragile and breaks on topology changes.

### 8. SKILLS SYSTEM FOR AGENT INSTRUCTIONS
cmux ships with `skills/cmux/` and `skills/cmux-browser/` — structured SKILL.md files with references that agents can read to understand how to use cmux CLI/API. This is the same skill pattern we use with CLAUDE.md.

---

## What's NOT Relevant

1. **macOS only** — cmux is Swift/AppKit, macOS-only. Our production orchestrator may need Linux deployment for cloud environments. However, for local development (which is our current mode), this is not a blocker.

2. **AGPL-3.0 license** — Copyleft license means any modifications must be open-sourced. We're using it as a tool, not embedding it, so this is manageable but worth noting for commercial contexts.

3. **Founder's Edition paywall features** — AI context per workspace, iOS app, cloud VMs, voice mode are behind a paid tier. We don't need these for orchestration.

4. **Session restore limitations** — Live process state (Claude Code sessions) does NOT survive app restart. We still need tmux-style `remain-on-exit` or similar crash forensics. This is a gap compared to tmux's session persistence.

5. **PostHog/Sentry telemetry** — The app includes analytics and crash reporting. Can be opted out but worth noting for gov client environments.

---

## Comparison with Catalogue Tools

### vs. Our L-Thread Orchestrator (tmux-based)
cmux is a strict upgrade. Every tmux operation we use has a cmux equivalent with better ergonomics (handle-based addressing, JSON output, notification rings, environment auto-targeting). The `claude-teams` tmux shim provides zero-migration-cost adoption. The browser API eliminates our Chrome DevTools MCP dependency. The only gap is session persistence across restarts.

### vs. NTM (Named Tmux Manager)
NTM (8/10) builds ON tmux. cmux REPLACES tmux. NTM's robot-mode JSON API inspired our comparison, but cmux's v2 JSON-RPC socket protocol is more comprehensive (80+ commands vs NTM's ~80 commands, but cmux adds browser automation, remote SSH, and tmux compatibility layer). NTM's TUI dashboard is more visually rich; cmux's native macOS sidebar is more functional (git, PR, ports, notification text). Both have prompt broadcasting and output capture.

### vs. Relay App
Relay (8/10) also moved away from tmux to native PTY, which validates cmux's approach. Relay uses a Rust broker + MCP tool protocol; cmux uses Swift + Unix socket JSON-RPC. cmux is more mature (5.3K stars vs 569) and has browser automation that Relay lacks.

### vs. agent-browser
cmux's browser API is literally ported from agent-browser (by the same founder's team member). The key difference: cmux's browser is embedded IN the terminal app as a split pane, while agent-browser is a standalone process. Same Snapshot+Refs pattern, same commands, integrated experience.

### vs. Emdash
Emdash (6/10) provides 22 CLI agent adapters and an IDE-like GUI. cmux is terminal-first with a scriptable API. Emdash is Electron; cmux is native Swift. cmux's `claude-teams` gives it deeper Claude Code integration than Emdash.

---

## Future Use Cases

- **Phase 1 (IMMEDIATE):** Install cmux, run `cmux claude-teams` to validate agent teams mode works with our orchestration patterns. Test socket API for workspace/split/notification operations. Replace tmux in the L-Thread Orchestrator with cmux CLI calls.

- **Phase 2 (Days 4-60):** Migrate the Pi Orchestrator supervisor to use cmux socket API instead of tmux. Use `cmux browser` for E2E testing gates (INC-014, INC-015). Implement the tiered scribe using `cmux pipe-pane` for real-time output streaming. Use `cmux wait-for` for event-driven agent coordination.

- **Phase 3 (Days 60-90):** Build custom automation workflows using the v2 JSON-RPC protocol. Implement the session registry on top of cmux's handle model. Use `cmux notify` hooks for the Pi supervisor's progressive escalation (warn -> nudge -> terminate). Explore `cmux ssh` for remote agent deployment.

- **Phase 4 (Days 90+):** Evaluate Founder's Edition AI features (per-workspace context, iOS monitoring). Consider contributing back to cmux (AGPL allows this). Build cmux-native TUI dashboard using the socket API's debug/screenshot capabilities.

---

## Cross-References

- **[Manaflow (old entry)](./manaflow.md)** — OBSOLETE. Describes the previous web platform, not the current native terminal. This entry supersedes it.
- **[NTM](../orchestration-platforms/ntm.md)** — Closest functional competitor (tmux-based orchestration); cmux is the native-app evolution of this concept.
- **[Relay App](../orchestration-platforms/relay-app.md)** — Also moved away from tmux to native PTY; validates cmux's architectural direction.
- **[agent-browser](../agent-harnesses/agent-browser.md)** — cmux's browser API is ported from this project.
- **[Overstory](../agent-harnesses/overstory.md)** — Uses tmux+worktree+SQLite; cmux could replace the tmux layer.
- **[pi-interactive-shell](../agent-harnesses/pi/pi-interactive-shell.md)** — Also eliminates tmux via PTY emulation; different approach (Pi extension vs standalone app).
- **[OpenTUI](./opentui.md)** — Zig-native terminal rendering; cmux chose Swift+libghostty instead.
- **[Commander](./commander.md)** — Only other SwiftUI-native Claude tool; but closed-source and human-operated.

---

## Key Takeaway

> **cmux is the purpose-built native macOS terminal that collapses our entire tmux orchestration layer, notification system, and browser testing infrastructure into a single app with a scriptable socket API and zero-migration Claude Code agent teams support -- the highest-impact tool discovery in this catalogue.**
