# L-Thread Orchestrator — Architecture Evolution Devlog

**Research date:** 2026-03-14
**Scope:** Full journey from prompt-only orchestration to Pi supervisor with stateless reducer

---

## Overview

The L-Thread Orchestrator evolved through six distinct architectural phases, each triggered by a concrete failure mode or capability ceiling in the previous approach. The through-line is a consistent tension: Claude Code is a powerful autonomous coder but a bad daemon. Every phase adds more infrastructure around that gap.

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6
Prompt     tmux         Pi Agent     cmux         Stateless    BMAD Waves
Loop       Sessions     Extension    Migration    Reducer
```

---

## Phase 1 — Pure Prompt Engineering (Claude Code + slash commands + conduit CLI)

### What it is

The entire orchestration system lives in markdown files. No compiled code. Three primary artefacts:

- `.claude/agents/orchestrator.md` — the persona prompt loaded as a custom agent
- `.claude/commands/orchestrator.md` — conduit sequential mode startup sequence
- `.claude/commands/orchestrator-teams.md` — parallel Teams mode startup sequence

### How it works

Claude Code reads the orchestrator persona and executes a deterministic loop entirely in its own context window:

```
GET_NEXT_STORY → SPAWN_DEV_AGENT (conduit pane-split) → WAIT_FOR_PR (terminal-wait)
→ CLOSE_DEV_PANE → REVIEW-FIX LOOP → AUTO_MERGE → E2E_TEST → MARK_DONE → LOOP
```

**Conduit CLI** (`conduit pane-split`, `terminal-write`, `terminal-wait`) provides the underlying pane management. `terminal-wait` is event-driven — it returns immediately when the terminal becomes idle rather than sleeping, which is the core waiting primitive.

**Teams Mode** is an alternative backend where Claude Code's native `Task` / `SendMessage` / `TaskList` tools replace conduit. Agents communicate peer-to-peer without the orchestrator relaying messages.

**State** is a JSON file (`_bmad/orchestrator-state.json`) written by the orchestrator after every phase transition. This file survives context compaction — the SessionStart hook re-injects it, enabling seamless resume.

### Key design choices

- **Tiered context loading:** Tier 0 (rules) always loaded; Tier 1 (session state) injected by hook; Tier 2 (briefings, FutureLearnings) loaded on demand. Keeps token usage low.
- **Mode detection priority:** Tmux state file existence beats Teams tools. Teams tools beat Conduit fallback. Explicit hierarchy prevents mode confusion.
- **FutureLearnings incident database** (`memory/FutureLearnings.md`) — a searchable INC-XXX knowledge base. When a dev agent hits a known failure pattern (DB connections, shell escaping, E2E skipping), the orchestrator retrieves the exact fix instead of hallucinating. This is the `/roadblock-recovery` command.
- **AUTO_MODE flag** — a file at `.bmad/AUTO_MODE`. When it reads "ENABLED", the loop never stops for user input. Roadblocks get logged and skipped. The loop is a daemon.

### Ceiling hit

The orchestrator itself can die (context overflow, conduit crash, network hiccup). When it does, all state of where it was in the loop is gone. The next session must reconstruct state from the JSON file — which works for phases, but gives no visibility into whether dev agents are still alive in their panes.

---

## Phase 2 — Tmux-based Terminal Multiplexing

### What it is

A bash library (`_bmad/scripts/tmux-helpers.sh`, v2) that adds crash-resistant session management on top of conduit. Workers run as independent `tmux` sessions (separate OS processes, not conduit panes). The orchestrator can crash and restart without losing the workers.

### How it works

Worker sessions are created as detached tmux sessions:

```bash
tmux new-session -d -s worker-<name> -c <dir>
# CRITICAL: unset CLAUDECODE to allow nested Claude sessions
unset CLAUDECODE && claude --dangerously-skip-permissions
```

The key insight: `CLAUDECODE` env var blocks nested Claude Code instances. Unsetting it before launching workers is what enables real isolation.

**Crash protection via latch files + `tmux wait-for`:** When an agent finishes, it writes a latch file (`/tmp/orchy-<session>.latch`). The orchestrator uses `tmux wait-for <channel>` to block until a signal fires. This is fully event-driven — no polling loops.

The v2 library adds:
- `tmux_wait_any` — blocks until the first of N sessions fires
- `tmux_wait_all` — blocks until all N sessions fire
- `tmux_dispatch` — clears latch, sends work, ready for wait
- Signal-before-waiter edge case: checks latch file existence before blocking so signals fired before `wait-for` is armed are not missed

**State:** `_bmad/orchestrator-tmux-state.json` tracks every known session — `tmux_session` name, `working_directory`, `claude_running` boolean, `last_seen_alive` timestamp, and an append-only `recovery.recovery_log`.

**Recovery flow:**
1. Read state file
2. `tmux has-session -t <name>` for each session
3. Dead → `tmux new-session -d -s <name> -c <dir>` then start claude
4. Log recovery to audit trail

### Key design choices

- **Tmux mode TAKES PRIORITY over Teams mode** when state file exists. Background Task agents share the same git working directory and cause branch conflicts. Tmux sessions are isolated OS processes.
- **Max 6 parallel sessions** — human review ceiling is 5-6 PRs/day.
- **`sleep 15` after Claude start** — the one acceptable sleep in the entire codebase. Claude Code takes ~10-15s to initialize its UI.
- **Bell propagation** — `printf '\a'` in tmux triggers Ghostty desktop notifications on session completion.

### Ceiling hit

Tmux works but the orchestrator still has no visibility into *what* the agent is doing inside the pane — only whether the process is alive. Nudging a stuck agent requires manual intervention. No way to distinguish "thinking" from "actually stuck".

---

## Phase 3 — Pi Agent Integration

### What it is

Pi (`@mariozechner/pi-coding-agent`) is a thin agent runtime with an **Extension API** that lets TypeScript code register into the agent lifecycle at first-class hooks. The orchestrator becomes a Pi extension that runs alongside the LLM.

### The Extension API surface

```typescript
pi.on("session_start", async (event, ctx) => { ... })
pi.on("tool_call", async (event, ctx) => { ... })
pi.on("before_agent_start", async () => { ... })
pi.registerTool({ name, description, parameters, execute, renderCall })
pi.appendEntry(key, value)  // inject structured data into Pi's context window
```

`registerTool` is the primary mechanism. It adds tools to the agent's own toolset — Pi can call `supervisor_start`, `supervisor_stop`, `supervisor_pause`, etc. as first-class tools with full TypeScript schemas (via `@sinclair/typebox`). The tools appear in the TUI and in the LLM's tool list.

`pi.on("tool_call")` fires for every tool invocation — used by the telemetry extension to log all activity.

`pi.appendEntry` injects supervisor state into Pi's context window so the LLM has live visibility.

### TUI widget

`pi.registerWidget` (via `ctx.ui.setWidget`) adds a persistent sidebar panel rendered using `@mariozechner/pi-tui`. The widget re-renders on every state change, showing phase, silence timer, nudge count, restart count, orchestrator phase, and (later) BMAD wave progress.

### Why Pi over Claude Code MCP

| Dimension | Claude Code MCP | Pi Extension API |
|---|---|---|
| Language | External server (any language) | TypeScript, same process |
| Tool schema | JSON Schema via MCP protocol | TypeBox (TypeScript-native) |
| Context injection | Via tool return values | `pi.appendEntry` (direct) |
| TUI integration | None | Full `pi-tui` widget system |
| Lifecycle hooks | Not available | `session_start`, `tool_call`, `before_agent_start`, `context` |
| Heartbeat timer | Must poll externally | `setInterval` in same process |
| Crash recovery | Orchestrator must reconnect | Extension restarts with Pi |
| Multi-extension | Separate servers | Multiple `-e` flags, `globalThis` shared bus |

The critical difference: Pi extensions share a process with the agent. The supervisor's `setInterval` heartbeat fires inside the same Node.js process as Pi itself. There is no IPC, no socket reconnection, no protocol overhead. The telemetry extension exposes `(globalThis as any).__telemetry_log` — the supervisor calls it directly to cross-log without any network round trip.

---

## Phase 4 — cmux Migration

### What it is

cmux (`manaflow-ai/cmux`) replaces tmux as the terminal multiplexer. It is a native macOS terminal emulator built on `libghostty` with a CLI that communicates over a Unix socket. Workers are "surfaces" in a "workspace" rather than tmux panes in a session.

`pi-orchestrator/extensions/cmux-client.ts` is a typed TypeScript wrapper around the CLI.

### tmux → cmux command mapping

```
tmux new-session -d -s <name> -c <dir>     →  cmux new-workspace --cwd <dir>
tmux capture-pane -t <pane> -p -S -N       →  cmux read-screen --surface <id> --lines N
tmux send-keys -t <pane> '<text>' Enter    →  cmux send --surface <id> '<text>'
                                              cmux send-key --surface <id> Enter  (SEPARATE call!)
tmux split-window -v -b -t <pane>          →  cmux new-split up --surface <id>
tmux kill-pane -t <pane>                   →  cmux close-surface --surface <id>
tmux select-pane -t <pane> -T <title>      →  cmux rename-tab --surface <id> <title>
```

**Critical cmux difference from tmux:** `cmux send` types text without pressing Enter. A separate `cmux send-key Enter` call is required. This was a live bug that was fixed in commits bcd3757 + 6deff3b across all 6 call sites.

### The double-window bug and workspace scoping

cmux `new-split` output format is `OK surface:N workspace:M`. Early code did not parse `surface:N` out of this string — it used the raw output, causing `cmux identify` failures. Fixed via `grep -o 'surface:[0-9]*'`.

A deeper issue: cmux surfaces target by short ref (`surface:N`). Without explicit `--workspace` scoping, commands can target surfaces in a different workspace context and create phantom windows. The supervisor wraps all cmux calls through a scoped helper:

```typescript
function cmux(args: string, timeout = 5000): string {
    const ws = _cmuxWorkspaceId ? ` --workspace "${_cmuxWorkspaceId}"` : "";
    return exec(`cmux ${args}${ws} 2>/dev/null`, timeout);
}
```

`_cmuxWorkspaceId` is read from `pane-layout.json` on init and set at the module level.

### cmux advantages over tmux

1. **No ANSI sequences** — `cmux read-screen` returns clean text. No stripping needed.
2. **No copy mode** — tmux required `q` before `send-keys` to exit scroll mode (INC-005). cmux has no scroll/copy mode. All INC-005 defensive `q` sends are removed.
3. **No shell escaping** — cmux `send` takes raw text. The only escaping needed is single-quote in the shell invocation of `cmux send '...'`.
4. **Desktop notifications** — `cmux notify --title ... --body ...` triggers macOS notifications natively.
5. **Sidebar status** — `cmux set-status`, `cmux set-progress`, `cmux log` — a persistent sidebar panel separate from the terminal surface.
6. **Embedded browser** — `cmux browser goto/snapshot/click/fill` for future E2E testing without Chrome DevTools MCP.

### cmux gaps (v0.62, 2026-03)

- No `wait-for` equivalent → completion detection falls back to latch file polling (5s interval in `pane-workers.sh`, 15s in BMAD wave tools)
- No per-surface PID exposure → hard-kill uses `pgrep -f "ORCHY_SESSION_NAME=<name>"` to find the claude/node process
- No session persistence → cmux doesn't restore live processes on restart. Supervisor handles restart.
- No pipe-pane → use `read-screen` polling for screen capture

### Layout

`run.sh` creates the 3-pane layout at startup by calling `cmux new-split` twice:

```
+──────────────────────────+──────────────────────────+
│ Pi Supervisor (top-left) │ Workers (right, stacked) │
├──────────────────────────┤                          │
│ Opus Orchestrator        │                          │
│ (bottom-left)            │                          │
+──────────────────────────+──────────────────────────+
```

Surface IDs and workspace ID are written to `_bmad/pane-layout.json`. The supervisor extension reads this on `session_start`.

---

## Phase 5 — Stateless Reducer Architecture

### What it is

The core monitoring logic in `supervisor.ts` is restructured as a pure function:

```typescript
function reduce(
    state: SupervisorState,
    event: SupervisorEvent,
    config: SupervisorConfig,
    layout: PaneLayout,
): [SupervisorState, SupervisorEffect[]]
```

No I/O inside the reducer. All side effects are returned as data (`SupervisorEffect[]`), then executed by a separate `executeEffects` function. This is "12 Factor Agents, Factor 12."

### The event/effect types

**Events** (things that happened, immutable input):
```
heartbeat | start | stop | pause | resume | manual_nudge
restart_settled | nudge_settled | worker_spawned | worker_closed
wave_started | wave_story_done | wave_merging | wave_merged
human_checkpoint_requested | latch_poll
```

**Effects** (things to do, pure data output):
```
send_keys | send_control | set_pane_title
start_heartbeat | stop_heartbeat
persist_state | persist_layout | persist_registry | persist_bmad_state
log_devlog | log_activity | notify | update_widget
hard_kill | schedule | check_latches
```

The `schedule` effect is how the reducer triggers future events without touching `setTimeout` itself — it returns `{ type: "schedule", delayMs, event }` and the effect executor calls `setTimeout(() => dispatch(fx.event), fx.delayMs)`.

### Dispatch loop

```
heartbeatProbe() [I/O: cmux read-screen]
    ↓
dispatch(heartbeat event)
    ↓
reduce(state, event, config, layout) → [newState, effects]
    ↓
state = newState
    ↓
executeEffects(effects) [I/O: cmux, filesystem, Pi API]
    ↓
schedule effects → setTimeout → dispatch(next event)
```

### Phase state machine

```
stopped → starting → running → silent → nudging → stalled → crashed
                 ↑_____________________|
                 (output detected after silence)

running → paused → running (via resume)
running → wave_running → wave_merging → running
running → awaiting_human (human checkpoint requested)
```

### Smart nudge — screen-state-aware silence detection

The heartbeat fires every 30 seconds. If no output change for 300s, the state moves to `silent`. But before nudging, `parseScreen()` is called to detect actual activity:

- **If screen shows `thinking`/`tool_calling`/`working`** — skip nudge, reset silence timer. The agent is busy, just not printing.
- **If no meaningful task** — skip nudge. Don't interrupt an idle orchestrator.
- **Context-aware nudge messages:**
  - Nudge 1: `Continue working on: <task>`
  - Nudge 2: `SUPERVISOR: idle for Xs. Resume or skip.`
  - Nudge 3: `SUPERVISOR FINAL WARNING: Resume immediately or you will be restarted.`
- After 3 nudges with no response: hard interrupt + restart.

### parseScreen — deterministic screen parser (40/40 tests passing)

`parseScreen(paneId)` reads 20 lines from the orchestrator surface and returns a `ScreenState`:

```typescript
interface ScreenState {
    activity: "idle" | "working" | "thinking" | "tool_calling" | "error" | "waiting_input" | "completed" | "unknown";
    claudeRunning: boolean;
    promptVisible: boolean;
    errorDetected: string | null;
    milestone: string | null;   // "pr_created", "tests_passed", "branch_created", "committed", "task_completed"
    lastToolCall: string | null;
    tokenCount: number | null;
    rawLines: string;
}
```

Detection logic (priority order):
1. Error patterns: `Error:|FAIL|panic|Traceback|ERR!|FATAL`
2. Spinner/thinking: `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏|Working|Thinking`
3. Tool calls: `Tool: (Edit|Write|Read|Bash|Grep|Glob|Agent)`
4. File activity: `⏺.*\.(ts|js|tsx|jsx|py|sh|md|json|yaml|yml)`
5. Prompt visible: `^\s*[❯○]\s*$` → idle
6. Claude running indicators: `[✓◆❯○]|claude>|╭─|│ >|Thinking|Tool|⏺`

### Why stateless reducer

- **Testable:** `reduce()` is a pure function. Test it with fake events and assert on returned effects — no mocking of cmux, no real timers.
- **Replayable:** The event log is append-only. Feeding it back through the reducer reproduces the exact state at any point.
- **Debuggable:** Every phase transition is logged with `{ts, type, detail}`. The TUI widget shows the last 10 events.
- **Telemetry bridge:** `dispatch()` calls `(globalThis as any).__telemetry_log` before executing effects. Every reducer invocation is logged to `_bmad/telemetry/YYYY-MM-DD.jsonl`.

### Hard kill implementation

`SIGKILL` cannot be sent to a surface (cmux doesn't expose PIDs). The hard kill effect uses the `ORCHY_SESSION_NAME` environment variable that is injected into every Claude process at startup:

```bash
export ORCHY_SESSION_NAME=orchestrator  # or worker name
```

Then from the supervisor:

```typescript
const pids = exec(`pgrep -f "ORCHY_SESSION_NAME=${sessionName}" 2>/dev/null`);
// Walk child processes to find claude/node
exec(`kill -9 ${claudePid} 2>/dev/null`);
```

---

## Phase 6 — BMAD Workflow Orchestration

### What it is

Five tools registered via `pi.registerTool` that implement wave-based parallel story execution on top of the supervisor infrastructure:

- `bmad_start_wave` — spawn N parallel workers (max 4, enforced by DeepMind coordination overhead: exponent 1.724)
- `bmad_wave_status` — report per-story status and elapsed time
- `bmad_merge_wave` — spawn a merge worker to review and merge all completed PRs
- `bmad_generate_report` — write a markdown sprint report
- `bmad_notify_human` — request a human checkpoint (transitions to `awaiting_human` phase)

### Wave lifecycle

```
bmad_start_wave called
    ↓
Guard: stories ≤ 4 (DeepMind limit)
Guard: no wave already running
    ↓
For each story: spawnWorkerPane() → dispatch(worker_spawned)
    ↓
dispatch(wave_started) → latch_poll scheduled every 15s
    ↓
setTimeout 15s → send full story prompt + latch instruction to each worker
    ↓
MONITORING: latch_poll → check /tmp/orchy-<name>.latch
    ↓
When latch exists: dispatch(wave_story_done) → persist BMAD state → update widget
    ↓
All stories done: wave.status = "complete" → desktop notification
    ↓
bmad_merge_wave → spawn merge worker → dispatch(wave_merging)
    ↓
Merge worker completes → dispatch(wave_merged)
    ↓
bmad_notify_human (if needed) → transition to awaiting_human
```

### Latch protocol

Workers signal completion by writing a JSON file:

```bash
echo '{"done":true,"pr":"https://github.com/..."}' > /tmp/orchy-<worker-name>.latch
```

The supervisor appends this instruction to every story prompt automatically in `bmad_start_wave`. The `check_latches` effect handler polls all running-story latch files every 15 seconds (replaces tmux `wait-for`, which cmux does not yet implement).

### BMAD state

Separate from supervisor health state. Lives at `_bmad/bmad-wave-state.json`:

```typescript
interface BmadWaveState {
    epic: string | null;
    epicId: string | null;
    wave: {
        id: string;
        index: number;
        stories: BmadStory[];
        status: "spawning" | "running" | "complete" | "merging" | "merged";
        spawnedAt: string;
        completedAt: string | null;
    } | null;
    completedWaves: Array<{ id: string; storiesCompleted: number; completedAt: string }>;
    humanCheckpoints: Array<{ reason: string; ts: string; resolved: boolean }>;
}
```

### TUI BMAD widget

The supervisor TUI widget gains BMAD-specific rendering when `bmadState.wave !== null`:

```
 BMAD │ Epic 1 — Anonymous Discovery  wave-0
 [████████░░] 4/5  ✗1
 1.1✓ 1.2✓ 1.3⟳ 1.4✓ 1.5✗
 ⚠ HUMAN  needs code review before merge
```

Progress bar, per-story icons (✓ done / ✗ failed / ⟳ running / · pending), human checkpoint banner.

---

## Key Architectural Decisions — The WHY

### 1. Orchestrator never writes code

Encoded as "Rule 1: DU BIST KEIN ENTWICKLER" in every prompt layer. Not a performance choice — a correctness choice. The orchestrator's context is full of coordination logic. Having it also write code means it will mix coordination decisions with implementation details, miss its own review pass, and skip E2E gates. The hard rule forces clean separation.

### 2. E2E as an absolute gate (not a suggestion)

Incidents INC-014 and INC-015 document that the orchestrator marked issues Done without E2E testing when the gate was soft. The rule was upgraded to hard in all modes: Conduit, Teams, Pi. Chrome DevTools MCP (or cmux browser) must fire before any issue is closed.

### 3. Event-driven waiting, never sleep

`conduit terminal-wait` in Phase 1, `tmux wait-for` in Phase 2, latch polling in Phase 4+ (cmux gap). The architecture documents why: `sleep 30` means the orchestrator is blocked for 30 seconds even if the agent finishes in 3. At scale (many agents, many stories), this adds up. The one accepted sleep is the Claude init wait (~15s after `unset CLAUDECODE && claude`).

### 4. State file as crash recovery, not as truth

State files (`orchestrator-state.json`, `session-registry.json`, `pane-layout.json`) record what the orchestrator believes is true. On restart, they are read and then validated against live reality (probe sessions, check surfaces). State is a hint, not a source of truth.

### 5. Max 4 parallel agents (hard limit)

Encoded in `bmad_start_wave`. The DeepMind paper (coordination overhead exponent 1.724) shows 4 agents as the threshold beyond which coordination cost exceeds throughput gain. Also: human review ceiling is 5-6 PRs/day. No point spawning 8 workers if the reviewer can only handle 6 outputs.

### 6. `ORCHY_SESSION_NAME` as process marker

Every Claude process started by the orchestrator gets `export ORCHY_SESSION_NAME=<role>`. This solves two problems: (a) cmux doesn't expose per-surface PIDs, so hard kill needs another way to find the process; (b) it provides a human-readable label in `ps aux` output for debugging.

---

## Claude Code MCP vs Pi Extension API — Full Comparison

| Dimension | Claude Code MCP | Pi Extension API |
|---|---|---|
| **Deployment** | External server process, any language | TypeScript module, same process as agent |
| **Transport** | JSON-RPC over stdio/HTTP | Direct function calls, no serialization |
| **Tool schema** | JSON Schema | TypeBox (TypeScript-native, compile-time checked) |
| **Context injection** | Via tool result text (pollutes context) | `pi.appendEntry(key, value)` (structured sidebar) |
| **TUI widget** | Not available | `pi-tui` widget, re-renders on state change |
| **Lifecycle hooks** | Not available | `session_start`, `tool_call`, `before_agent_start`, `context` |
| **Heartbeat timer** | External process must poll | `setInterval` inside the same event loop |
| **Cross-extension** | Separate servers, no shared state | `globalThis` shared bus (telemetry log) |
| **Crash behavior** | Server crash → tools unavailable, agent continues without them | Extension crash → Pi session ends (hard coupling) |
| **Multi-provider** | Only with Claude Code | Pi supports openai-codex, google-antigravity, anthropic |
| **Tool render** | Text-only | Custom `renderCall` for TUI (bold, colors, compact display) |
| **Session recovery** | Must reconnect socket | Extension re-reads state files on `session_start` |

**When to use MCP:** Browser automation (Chrome DevTools), external service integration (Notion, GitHub), tools that need to run as persistent services across many Claude sessions.

**When to use Pi Extension:** Supervisor/watchdog logic (same-process heartbeat), telemetry hooks (intercept every tool call), TUI widgets, multi-provider agent runtime.

In this system both are used: Chrome DevTools MCP for E2E browser testing, Pi Extension for the supervisor loop.

---

## Files Reference

| File | Phase | Purpose |
|---|---|---|
| `/Users/buraksmac/Desktop/code2/orchestrator/.claude/agents/orchestrator.md` | 1 | Core orchestrator persona, all modes, roadblock recovery |
| `/Users/buraksmac/Desktop/code2/orchestrator/.claude/commands/orchestrator.md` | 1 | Conduit mode startup + loop |
| `/Users/buraksmac/Desktop/code2/orchestrator/.claude/commands/orchestrator-teams.md` | 1 | Teams mode startup + loop |
| `/Users/buraksmac/Desktop/code2/orchestrator/.claude/commands/roadblock-recovery.md` | 1 | FutureLearnings incident lookup |
| `/Users/buraksmac/Desktop/code2/orchestrator/.bmad/scripts/tmux-helpers.sh` | 2 | Event-driven tmux session helpers, latch files, wait-for patterns |
| `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/run.sh` | 3/4 | Pi launch, 3-pane cmux layout, session registry init |
| `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/extensions/telemetry.ts` | 3 | Pi extension: hook into all tool calls, log to JSONL |
| `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/extensions/cmux-client.ts` | 4 | Typed TypeScript wrapper for cmux CLI |
| `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/_bmad/scripts/pane-workers.sh` | 4 | Worker CRUD functions for orchestrator (bash, sources in orchestrator pane) |
| `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/extensions/supervisor.ts` | 5/6 | Full stateless reducer, 10 supervisor tools + 5 BMAD tools, TUI widget |
| `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/CLAUDE.md` | 5 | Context-aware instructions for orchestrator vs worker panes |

---

## Current Status and Known Issues

**Live tested (2026-03-14):** Phases 1–5 confirmed working. BMAD wave tools implemented, not yet tested end-to-end.

**Known bug:** `supervisor_start` sometimes opens a new cmux window instead of using the orchestrator surface in the current workspace. Likely caused by `cmux send` targeting a surface in a different workspace context when `_cmuxWorkspaceId` is not set correctly at the time of the first `start` event. Fix: ensure `loadLayout()` runs before any tool execution that touches cmux.

**Next priorities:**
1. Fix double-window bug (workspace scoping on first start)
2. ZFC reconciliation via `cmux identify` — verify all surfaces in layout still exist on session resume
3. Adaptive TUI widget + cmux sidebar pills
4. Worker isolation: worktrees + CMUX workspaces (each worker gets its own git worktree)
5. End-to-end test of BMAD wave tools on OmniPort-HH first wave
