# zmx

> **Session persistence for terminal processes — detach/reattach without tmux's window management overhead.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [neurosnap/zmx](https://github.com/neurosnap/zmx) |
| GitHub Stars | 1,048 (as of 2026-03-21) |
| Homepage | [zmx.sh](https://zmx.sh) |
| Publisher | Eric Bower (@neurosnap, 232 commits); sponsored by [pico.sh](https://pico.sh); solo maintainer with 9 minor contributors |
| License | MIT |
| Tech Stack | Zig v0.15, libghostty-vt (Ghostty's terminal state engine), Unix sockets, poll()-based event loop |
| Maturity | 🟡 Early Production (v0.4.2; active development; Homebrew published; Linux distro packages for Alpine/Arch/openSUSE/Gentoo; 50 forks; 19 open issues; known issues with version upgrades killing sessions) |
| Last Analyzed | 2026-03-21 |

---

## Burak's Notes

> *zmx is the anti-tmux: it does exactly ONE thing — session persistence (detach/reattach) — and explicitly defers window management to your OS. This is philosophically interesting for our orchestrator because we use tmux primarily for session persistence, NOT for its window/pane management. Our agents each get their own tmux window, but we never use splits or pane layouts. zmx's `run` command (send command without attaching) and `wait` command (block until session task completes) map directly to our `tmux send-keys` and polling patterns.*
>
> *The key technical differentiator is `libghostty-vt` for terminal state restoration — when you reattach, you get the FULL previous terminal state and scrollback, not just a reconnected PTY. This is superior to tmux's approach and would give us better forensic visibility when reattaching to agent sessions. The `history` command (dump scrollback as plain text, VT escape sequences, or HTML) is directly useful for agent telemetry — we currently use `tmux capture-pane` which is limited to the scrollback buffer size.*
>
> *However, zmx explicitly does NOT provide windows, tabs, or splits. Our orchestrator currently relies on tmux windows for agent isolation (each agent = one window in the tmux session). With zmx, we'd need N separate zmx sessions instead of N windows in one tmux session. The `ZMX_SESSION_PREFIX` feature helps namespace these (e.g., `ZMX_SESSION_PREFIX="orch."` → `orch.worker-1`, `orch.worker-2`), and `zmx list` enumerates them, but we lose the unified tmux session view.*
>
> *The `zmx run <name> <command>` pattern is cleaner than our `tmux send-keys -t <name> '<cmd>' Enter` — it's a proper API call, not keystroke simulation. And `zmx wait <name>...` is exactly what we need for synchronization points, replacing our polling loops. The `zmx history <name>` command replaces `tmux capture-pane -t <name> -p -S -50` with full scrollback access.*
>
> *At 1,048 stars and v0.4.2 with known session-killing upgrade issues, zmx is not production-ready enough to replace tmux in our orchestrator today. But the philosophy is right: session persistence as a discrete, composable primitive. If zmx reaches v1.0 stability, it could replace tmux as our agent session substrate while we use OS-level window management (Ghostty tabs, or simply headless sessions).*
>
> *Compared to our other catalogued tools: dmux wraps tmux (adds features on top), cmux replaces tmux (native terminal), zmx is between — it replaces tmux's session layer but uses your existing terminal. For headless orchestration, zmx is actually the best fit because we don't WANT window management — we want persistent sessions we can send commands to and read output from.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Direct overlap with our session persistence needs. `run` (send command), `wait` (block until done), `history` (capture output), `list` (enumerate sessions) map 1:1 to our tmux usage patterns. Loses 3 points: v0.4.2 maturity (session-killing upgrades), no window grouping (N sessions vs N windows in one tmux session), and we'd need to rewrite all tmux commands in our orchestrator. |
| **Novelty** | 7/10 | (1) libghostty-vt terminal state restoration is superior to tmux capture-pane, (2) `zmx wait` as native synchronization primitive eliminates polling, (3) `zmx history --html` for rich agent telemetry, (4) daemon-per-session architecture provides natural agent isolation, (5) philosophy of composable single-purpose tools over monolithic terminal multiplexers. |
| **Actionable** | 5/10 | Not immediately adoptable — would require rewriting our entire tmux command layer. But three patterns are portable today: (1) `zmx wait`-style synchronization could inspire a tmux equivalent using `tmux wait-for`, (2) `history` as full scrollback capture for agent telemetry, (3) session prefix namespacing for multi-orchestrator isolation. Phase 3+ adoption candidate if/when zmx reaches v1.0. |

---

## Overview

zmx is a Zig-based terminal session persistence tool that provides detach/reattach functionality without window management. It fills the exact role that `screen` and `tmux` were originally created for — keeping processes alive when your terminal disconnects — but intentionally excludes the window/pane/split features that tmux accumulated over the years.

The architecture is daemon-per-session: each `zmx attach <name>` creates a Unix socket file and a daemon process that owns the PTY. Multiple clients can connect to the same session simultaneously. The daemon sends PTY output to both connected clients AND to `libghostty-vt`, Ghostty's terminal state machine. When a client reconnects, `libghostty-vt` replays the full terminal state (cursor position, colors, scrollback) — the session picks up exactly where it left off.

Key commands for orchestration use:
- `zmx attach <name> [command...]` — Create or attach to a named session, optionally running a command
- `zmx run <name> [command...]` — Send a command to a session WITHOUT attaching (our `tmux send-keys` replacement)
- `zmx wait <name>...` — Block until session tasks complete (native synchronization, no polling needed)
- `zmx history <name> [--vt|--html]` — Dump full scrollback as plain text, with escape codes, or as HTML
- `zmx list [--short]` — Enumerate active sessions
- `zmx kill <name>` — Terminate a session

The `ZMX_SESSION_PREFIX` environment variable namespaces all commands, enabling multi-orchestrator isolation (e.g., `ZMX_SESSION_PREFIX="proj1."` keeps sessions from different projects separate).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  Per-Session                      │
│                                                   │
│  ┌──────────┐    ┌──────────┐    ┌────────────┐ │
│  │ zmx CLI  │    │ zmx CLI  │    │ zmx CLI    │ │
│  │ (client) │    │ (client) │    │ (run cmd)  │ │
│  └────┬─────┘    └────┬─────┘    └─────┬──────┘ │
│       │               │                │         │
│       └───────┬───────┘                │         │
│               │ (Unix socket)          │         │
│       ┌───────┴────────────────────────┴───────┐ │
│       │          Session Daemon                 │ │
│       │  ┌──────────────┐  ┌────────────────┐  │ │
│       │  │   PTY        │  │ libghostty-vt  │  │ │
│       │  │ (child proc) │  │ (state engine) │  │ │
│       │  └──────┬───────┘  └───────┬────────┘  │ │
│       │         │ output ──────────┤            │ │
│       │         │          (parallel feed)      │ │
│       │         │                               │ │
│       │   poll()-based event loop               │ │
│       └─────────────────────────────────────────┘ │
│                                                   │
│  Socket: {ZMX_DIR}/session_name.sock             │
│  Logs:   {ZMX_DIR}/logs/session_name.log         │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

- **Daemon per session**: Each session is fully isolated with its own process and socket. No single daemon failure takes down all sessions (unlike tmux server crash).
- **libghostty-vt**: Uses Ghostty's terminal state machine as a passive observer — it receives the same PTY output as clients but doesn't sit in the data path. Reattach = snapshot from ghostty-vt to client stdout. Fast and non-intrusive.
- **poll()-based**: Both daemon and client use `poll()` for the event loop. No async runtime overhead.
- **Socket location priority**: `ZMX_DIR` > `XDG_RUNTIME_DIR/zmx` > `TMPDIR/zmx-{uid}` > `/tmp/zmx-{uid}`.
- **stdin piping**: `echo "ls -lah" | zmx r dev` — commands can be piped via stdin, enabling programmatic control.

### Comparison with tmux for Agent Orchestration

| Capability | tmux | zmx | Impact on Orchestrator |
|-----------|------|-----|----------------------|
| Session persistence | Yes | Yes | Parity |
| Send command without attach | `send-keys` (keystroke sim) | `run` (proper API) | zmx is cleaner |
| Wait for completion | Polling `capture-pane` | `zmx wait` (native) | zmx eliminates polling |
| Capture output | `capture-pane -p -S N` (limited) | `history` (full scrollback) | zmx gives more data |
| Window grouping | N windows in 1 session | N separate sessions | tmux more convenient |
| Process tree | 1 server, N sessions | N daemons | zmx more resilient |
| Maturity | Decades, battle-tested | v0.4.2, known issues | tmux wins today |
| Terminal features | Limited (must support in tmux too) | Native (no middleware) | zmx passes through everything |

---

## Publisher Background

**Eric Bower** (@neurosnap) is the founder of [pico.sh](https://pico.sh), a developer tools company. He has 142 public repos, 421 followers, and his blog at [bower.sh](https://bower.sh) includes the essay "You might not need tmux" which articulates zmx's philosophy. He is the dominant contributor (232 of ~250 commits). The project has attracted 50 forks and package maintainers across 5 Linux distributions, suggesting genuine community interest despite the early version number.

The dependency on `libghostty-vt` from the Ghostty project (by Mitchell Hashimoto, creator of Vagrant/Terraform/Consul) gives zmx a high-quality terminal state engine without needing to build one from scratch.

---

## What's Valuable for Us

### 1. `zmx run` — Proper Command Injection API
Our current `tmux send-keys -t <name> '<cmd>' Enter` is keystroke simulation — it doesn't know if the session is ready, doesn't handle quoting properly, and can't pipe stdin. `zmx run <name> <command>` is a proper API call that creates the session if needed and sends the command. `echo "cmd" | zmx r <name>` enables programmatic stdin piping. This is a cleaner abstraction for agent command injection.

### 2. `zmx wait` — Native Synchronization
Our orchestrator polls `tmux capture-pane` in loops to detect when agents finish. `zmx wait <name>...` blocks until the session task completes, with support for waiting on multiple sessions simultaneously. This eliminates our polling code entirely and reduces orchestrator complexity.

### 3. `zmx history` — Full Scrollback Telemetry
`tmux capture-pane` is limited to the scrollback buffer (typically 2000 lines). `zmx history <name>` dumps the FULL session scrollback, with options for plain text (`--vt` for escape codes, `--html` for rendered output). The HTML mode is particularly useful for agent forensics — we could capture rich terminal output for devlog/telemetry.

### 4. Daemon-Per-Session Resilience
tmux has a single server process — if it crashes, ALL sessions die. zmx runs one daemon per session, so a crash in one session doesn't affect others. For an orchestrator running 6 parallel agents, this isolation is valuable.

### 5. Session Prefix for Multi-Orchestrator
`ZMX_SESSION_PREFIX` namespaces all operations. Two orchestrator instances can run simultaneously without session name collisions: `ZMX_SESSION_PREFIX="orch1."` and `ZMX_SESSION_PREFIX="orch2."`. We currently rely on tmux session names for this, which is less clean.

---

## What's NOT Relevant

- **SSH workflow**: The SSH config integration (`RemoteCommand zmx attach %k`, ControlMaster, autossh) is designed for human remote development. Our orchestrator runs locally.
- **Shell prompt integration**: The `ZMX_SESSION` prompt customization is for human users who need visual indicators.
- **Session picker (fzf)**: Interactive TUI for humans, not for autonomous orchestration.
- **Shell completions**: Human CLI convenience, not relevant to programmatic usage.

---

## Future Use Cases

- **Phase 1 (Now)**: Study the `run`/`wait`/`history` API patterns. Consider adopting `tmux wait-for` (an underused tmux feature) as a zmx-wait-inspired improvement to our current polling.
- **Phase 2 (Days 4-60)**: If zmx reaches v1.0 with stable upgrade path, prototype replacing our tmux layer with zmx sessions. Each agent gets a zmx session instead of a tmux window. The `run`/`wait`/`history` API is cleaner for programmatic control.
- **Phase 3 (Days 60-90)**: If staying on tmux, the zmx patterns (especially `wait` and `history`) can inspire wrappers around our existing tmux commands. If migrating to cmux, zmx becomes irrelevant (cmux handles session persistence natively).

---

## Competitive Comparison

| Feature | zmx | tmux | abduco | shpool | dtach |
|---------|-----|------|--------|--------|-------|
| Session persistence | Yes | Yes | Yes | Yes | Yes |
| Terminal state restore | Yes (ghostty-vt) | Yes (server) | No | Yes | No |
| Window management | No | Yes | No | No | No |
| Multiple clients | Yes | Yes | Yes | No | Yes |
| Native scrollback | Yes | No | Yes | Yes | Yes |
| Send cmd w/o attach | `run` | `send-keys` | No | No | No |
| Wait for completion | `wait` | `wait-for` (limited) | No | No | No |
| Scrollback export | `history` (text/vt/html) | `capture-pane` (limited) | No | No | No |
| Daemon architecture | Per-session | Single server | Per-session | Single server | Per-session |
| Language | Zig | C | C | Rust | C |
| Stars | 1,048 | ~36K | ~1K | ~2K | ~700 |

---

## Key Takeaway

> **zmx strips tmux down to its original purpose — session persistence — and does it better with ghostty-vt state restoration, native `run`/`wait`/`history` commands, and daemon-per-session isolation. For our orchestrator, which uses tmux purely for session persistence (not window management), zmx's API is a cleaner fit. Adoption blocked by v0.4.2 maturity and session-killing upgrade path. Watch for v1.0; in the meantime, port the `wait` and `history` patterns to our tmux layer.**
