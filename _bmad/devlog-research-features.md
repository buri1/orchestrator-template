# L-Thread Pi Orchestrator — Feature Research Devlog

**Researched:** 2026-03-14
**Sources:** `pi-orchestrator/extensions/supervisor.ts` (~2400 LOC), `orchestrator-agents.ts`, `orchestrator-state.ts`, `orchestrator-discipline.ts`, `orchestrator-dashboard.ts`, `telemetry.ts`, `cmux-client.ts`, `screen-parser-smoke.mjs`, `run.sh`, and all live state files in `pi-orchestrator/_bmad/`

---

## 1. Architecture Philosophy: Stateless Reducer

The entire supervisor is built around **12 Factor Agents, Factor 12** — the core monitoring logic is a pure function:

```
reduce(state, event, config, layout) -> [newState, effects[]]
```

No I/O happens inside the reducer. Every side effect (sending keys, persisting files, desktop notifications, scheduling timers) is returned as a typed data structure and executed by a separate `executeEffects()` function. This architecture enables: replay, testing, debugging, and time-travel — the full event log is the source of truth.

The runtime loop is:

```
Probe (I/O) → Event → Reduce (pure) → Effects[] → Execute (I/O)
                                                         ↓
                                               schedule_delayed
                                                         ↓
                                              Event → Reduce → Effects → ...
```

The `dispatch()` function is the single entry point: it calls `reduce()`, writes the new state, then calls `executeEffects()`. Every Pi tool creates an event and dispatches it — they never mutate state directly.

---

## 2. All 15 Registered Tools

### Supervisor Tools (10) — registered in `supervisor.ts`

#### `supervisor_start`
- **Label:** Start Orchestrator
- **Description:** Start Claude Code in the orchestrator pane and begin heartbeat monitoring.
- **Parameters:**
  - `directory` (optional string): Working directory override
  - `initial_prompt` (optional string): First prompt after Claude starts (fired after 15s startup delay)
  - `task` (optional string): Task description shown in TUI widget
- **What it does:** Dispatches a `start` event through the reducer. The reducer emits effects: send `claude --dangerously-skip-permissions` to the orchestrator pane, start the heartbeat timer, write to the devlog, log to activity JSONL, persist the registry. If `initial_prompt` is set, a `setTimeout(15s)` fires it after Claude has loaded its UI.

#### `supervisor_stop`
- **Label:** Stop Orchestrator
- **Description:** Stop heartbeat and kill Claude in orchestrator pane + all workers. Hard-kills after 3s if polite interrupt fails.
- **Parameters:**
  - `kill` (optional boolean): Kill Claude too (default: true)
- **What it does:** Dispatches a `stop` event. When `kill=true`, sends Escape+Ctrl-C×3, then schedules a `hard_kill` effect that runs `kill -9` on the claude process (found via `ORCHY_SESSION_NAME` env var) and closes the cmux surface. Also kills all worker panes in `layout.workerPanes`.

#### `supervisor_pause`
- **Label:** Pause All
- **Description:** Pause all agents (orchestrator + workers). Sends Escape to interrupt without killing. Resume with supervisor_resume.
- **Parameters:** none
- **What it does:** Dispatches a `pause` event. Sends `Escape` to the orchestrator pane and all worker panes (Escape interrupts Claude Code without killing the process). Stops the heartbeat timer. Transitions phase to `paused`. Renames cmux tabs to `(paused)`. Idempotent — returns early if already paused.

#### `supervisor_resume`
- **Label:** Resume All
- **Description:** Resume all paused agents. Sends 'continue' to orchestrator and all workers. Restarts heartbeat.
- **Parameters:**
  - `message` (optional string): Custom resume message (default: `"continue"`)
- **What it does:** Dispatches a `resume` event. Sends the message to the orchestrator pane and all workers. Restarts the heartbeat timer. Resets the silence timer (`s.lastOutputAt = now`) so the freshly resumed orchestrator doesn't immediately get nudged.

#### `supervisor_nudge`
- **Label:** Nudge Orchestrator
- **Description:** Send a custom message to the orchestrator. Use for intelligent, context-aware nudging.
- **Parameters:**
  - `message` (string): Message to send
- **What it does:** Dispatches a `manual_nudge` event. Before sending text, sends `q` to exit any copy-mode state (INC-005 defensive workaround — retained in reducer but `q` is skipped in cmux executor since cmux has no copy mode). Logs the nudge to devlog. Increments `totalNudges` counter.

#### `supervisor_observe`
- **Label:** Observe
- **Description:** Capture output from orchestrator or a worker pane.
- **Parameters:**
  - `lines` (optional number): Lines to capture (default: 50)
  - `target` (optional string): `'orchestrator'` (default) or worker name
- **What it does:** Calls `paneCapture()` which runs `cmux read-screen --surface <id> --lines N`. Returns clean terminal text. Also stores the captured output in `state.lastCapturedOutput` for the heartbeat to reference.

#### `supervisor_status`
- **Label:** Status
- **Description:** Full supervisor status with pane layout, registry, and event log.
- **Parameters:** none
- **What it does:** Generates a multiline text report covering: current phase, orchestrator pane liveness (via `cmux identify`), Claude process status (via screen heuristic), silence duration, nudge/restart counters, session registry summary, all workers with their pane status, and the last 10 events from the in-memory event log.

#### `supervisor_config`
- **Label:** Configure
- **Description:** Update heartbeat/silence/nudge thresholds.
- **Parameters:**
  - `heartbeat_interval_sec` (optional number)
  - `silence_threshold_sec` (optional number)
  - `stall_threshold_sec` (optional number)
  - `max_nudges` (optional number)
  - `orchestrator_flags` (optional string)
- **What it does:** Updates the in-memory `config` object and writes it to `_bmad/supervisor-config.json`. Immediately restarts the heartbeat timer if one is running, so the new interval takes effect without a restart.

#### `supervisor_spawn_worker`
- **Label:** Spawn Worker
- **Description:** Spawn a worker pane on the right side. First fills right, subsequent stack above.
- **Parameters:**
  - `name` (string): Worker name
  - `directory` (string): Working directory
  - `flags` (optional string): Claude flags
- **What it does:** Calls `spawnWorkerPane()` which uses cmux to create a new terminal surface. The first worker fills the pre-allocated `workersPaneId` surface. Subsequent workers use `cmux new-split up` to split above the last worker, extracting the new surface ID via regex `surface:\d+`. Dispatches `worker_spawned` event through reducer for logging/registry.

#### `supervisor_close_worker`
- **Label:** Close Worker
- **Description:** Kill a worker pane and remove from layout.
- **Parameters:**
  - `name` (string): Worker name
- **What it does:** Sends `escape` then `ctrl+c` ×3 to the pane, then schedules `cmux close-surface` after 2s. Removes the worker from `layout.workerPanes`. Dispatches `worker_closed` event through reducer.

### BMAD Workflow Tools (5) — also in `supervisor.ts`

#### `bmad_start_wave`
- **Label:** BMAD Start Wave
- **Description:** Spawn parallel worker agents for a BMAD wave. Each worker handles one story. Max 4 stories (DeepMind coordination limit). Guards against double-launch.
- **Parameters:**
  - `epic` (string): Epic title
  - `epic_id` (string): Epic ID for file paths
  - `wave_id` (string): Wave identifier
  - `stories` (array): Array of `{id, title, directory, prompt}` objects (1–4 items)
  - `flags` (optional string): Claude flags
- **What it does:** Hard limit of 4 stories (enforced with early return referencing the DeepMind coordination overhead paper, exponent 1.724). Guards against double-launch by checking `bmadState.wave.status`. For each story: calls `spawnWorkerPane()`, creates a `BmadStory` object, appends latch instructions to the prompt. After 15s startup delay, sends prompts via cmux and transitions wave status `spawning → running`. Dispatches `wave_started` event which schedules latch polling every 15s.

#### `bmad_wave_status`
- **Label:** BMAD Wave Status
- **Description:** Check status of all workers in the active wave. Reads latch files for completion and captures recent screen output per worker.
- **Parameters:**
  - `capture_lines` (optional number): Lines to capture per running worker (default: 20)
- **What it does:** For each story in `bmadState.wave.stories`: checks if the latch file (`/tmp/orchy-<workerName>.latch`) exists, reads its JSON content, updates story status `running → done` with PR URL if latch says done, captures screen output from running workers. Returns a formatted multiline report. If all stories are resolved, transitions wave status to `complete`.

#### `bmad_merge_wave`
- **Label:** BMAD Merge Wave
- **Description:** Spawn a merge agent after all wave stories are done. Optionally auto-closes workers after merge is confirmed.
- **Parameters:**
  - `merge_prompt` (optional string): Custom merge instructions (defaults to auto-built prompt from PR list)
  - `close_workers_after` (optional boolean): Auto-close story workers after merge latch fires (default: true)
- **What it does:** Guards: wave must exist and all stories must be done/failed. Builds a default merge prompt listing all PR URLs and instructing the merge agent to review, merge in dependency order, run tests, and write a merge latch. Spawns a worker named `merge-<waveId>`. Sends prompt after 15s. Sets up a 60s polling interval (max 120 polls = 2 hours) watching for the merge latch file. On merge latch: archives the wave to `completedWaves`, nulls `bmadState.wave`, closes all story workers (leaving the merge worker open for human verification).

#### `bmad_generate_report`
- **Label:** BMAD Generate Report
- **Description:** Generate a markdown report for a completed wave or full epic. Writes to `_bmad-output/reports/`.
- **Parameters:**
  - `scope` (union `"wave" | "epic"`): Report scope
  - `include_pr_diffs` (optional boolean): Include PR diff summaries via `gh pr diff` (default: false, slow)
- **What it does:**
  - **Wave scope:** Generates a markdown report with per-story status, duration, PR link, optional diff content (via `gh pr diff <N> --patch | head -200`), and a summary table. Written to `_bmad-output/reports/wave-<id>-<date>.md`.
  - **Epic scope:** Summarizes all completed waves for the active epic with totals table. Written to `_bmad-output/reports/epic-<id>-<date>.md`.

#### `bmad_notify_human`
- **Label:** BMAD Notify Human
- **Description:** Pause all agents and send a desktop notification requesting human review. Use for blockers, ambiguous requirements, or security decisions. Call supervisor_resume to continue.
- **Parameters:**
  - `reason` (string): Why human review is needed (shown in notification)
  - `context` (optional string): Additional context logged but not in notification
  - `severity` (optional union `"info" | "warning" | "error"`): Default `"warning"`
- **What it does:** Pauses all agents via `dispatch({type: "pause"})`. Dispatches `human_checkpoint_requested` which transitions phase to `awaiting_human` and stops the heartbeat. Appends to `bmadState.humanCheckpoints`. Sends a `cmux notify` desktop notification. Logs to devlog and activity JSONL. Returns human-readable instructions including how to resume. The heartbeat check skips the `awaiting_human` phase entirely — agents stay frozen until `supervisor_resume` is called.

---

## 3. Screen Parser (`parseScreen()`)

### What it does

`parseScreen(paneId)` reads the last 20 lines from a cmux surface and returns a `ScreenState` object with 7 fields:

```typescript
interface ScreenState {
  activity: "idle" | "working" | "thinking" | "tool_calling" | "error" | "waiting_input" | "completed" | "unknown";
  claudeRunning: boolean;
  promptVisible: boolean;
  errorDetected: string | null;   // first 120 chars of matched error
  milestone: string | null;        // "pr_created", "tests_passed", "branch_created", "committed", "task_completed"
  lastToolCall: string | null;     // "Edit", "Write", "Bash", etc.
  tokenCount: number | null;
  rawLines: string;                // full captured text
}
```

### Regex patterns (in priority order)

**1. Claude running detection** — any of these signals the Claude Code UI is present:
```
/[✓◆❯○]|claude>|╭─|│ >|Thinking|Tool |⏺|waiting for|permission|Working/i
```

**2. Prompt visible** — Claude is idle, awaiting input (two variants):
```
/^\s*[❯○]\s*$/m          — bare prompt character on a line alone
/^\s*[❯○]\s*▊?\s*$/m     — prompt with optional block cursor
```

**3. Token count extraction:**
```
/(\d[\d,]+)\s*tokens?/i  — captures comma-formatted numbers, strips commas
```

**4. Activity detection (priority order, first match wins):**

| Priority | Pattern | Activity |
|----------|---------|----------|
| 1 | `/Error:|FAIL|panic|Traceback|ERR!|FATAL|Unhandled|exception/i` | `"error"` |
| 2 | `/⠋|⠙|⠹|⠸|⠼|⠴|⠦|⠧|⠇|⠏|Working|Thinking/i` | `"thinking"` |
| 3 | `/Tool:\s*(Edit|Write|Read|Bash|Grep|Glob|Agent)/i` | `"tool_calling"` |
| 4 | `/⏺.*\.(ts|js|tsx|jsx|py|sh|md|json|yaml|yml)/i` | `"working"` |
| 5 | `promptVisible === true` | `"idle"` |
| 6 | `claudeRunning === true` (fallback) | `"working"` |

The braille spinner characters `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` are the activity indicators Claude Code displays while processing. Error detection has highest priority — it fires even over a spinner (tested in `screen-parser-smoke.mjs` as "error beats spinner").

**5. Milestone detection** (checked after activity, not mutually exclusive):

| Pattern | Milestone |
|---------|----------|
| `/gh pr create|Pull request created|pr create/i` | `"pr_created"` |
| `/All tests passed|✓.*tests?|Tests.*passed|npm test.*ok/i` | `"tests_passed"` |
| `/git checkout -b|git switch -c|branch.*created/i` | `"branch_created"` |
| `/git commit|committed|\[\w+ [a-f0-9]+\]/i` | `"committed"` |
| `/latch|DONE|completed.*story|story.*done/i` | `"task_completed"` |

### Known false positives

The `exception` pattern in error detection fires on code like `catch (exception) { ... }` — acknowledged as a known limitation in the smoke test comments. The test suite intentionally labels this case as "false positive — known limitation" while still asserting the current behavior.

### Smoke test

The test file `screen-parser-smoke.mjs` contains 40 test cases covering all branches. It explicitly notes that the test summary output avoids words like "failed/FAIL/Error" to prevent the supervisor from false-positive detecting an error in its own test runner output.

---

## 4. Smart Nudge Logic

The nudge system is entirely inside the `heartbeat` case of `reduce()`. It is multi-stage with activity awareness at every step.

### Silence detection

Every heartbeat (default: 30s interval) computes `silence = now - state.lastOutputAt`. The supervisor uses a simple hash of the 20-line screen capture to detect new output. When the hash changes, `lastOutputAt` is updated and `nudgeCount` is reset.

### Stage 1: Transition to `silent`

When `phase === "running"` and `silence > silenceThresholdMs` (default: 300s / 5min):

**Activity-aware skip:** If `activity === "thinking" || "tool_calling" || "working"` → skip transition to silent, log the skip. This is the key insight: Claude may not be producing visible new output because it's processing internally (spinner) or executing a slow tool. Silence alone is insufficient.

If activity is `"idle"`, `"error"`, or `"unknown"` → transition to `"silent"`.

### Stage 2: Auto-nudge (`silent` → `nudging`)

When `phase === "silent"` and `nudgeCount < maxNudgesBeforeRestart` (default: 3):

**Activity-aware skip:** Same check — if screen shows active work, transition back to `"running"` and reset nudge count.

**Task-aware skip:** If `state.task` is null or shorter than 10 characters → log "no real task, skipping nudge". This prevents the supervisor from nagging an orchestrator that hasn't been given work yet.

**Context-aware messages** — three escalating tiers:

| Nudge # | Message format |
|---------|---------------|
| 1 | `Continue working on: <task>.[<error context>]` |
| 2 | `SUPERVISOR: You have been idle for <Ns>. Resume working on: <task>. If stuck, skip and move to the next step.[<error context>]` |
| 3 | `SUPERVISOR FINAL WARNING: Resume immediately or you will be restarted. Task: <task>[<error context>]` |

The error context is appended when `event.screen.errorDetected` is set: `Error detected: <first 80 chars of error>`.

After sending the nudge, a `schedule(5s, nudge_settled)` event is set. When `nudge_settled` fires, the phase transitions from `"nudging"` back to `"silent"`, setting up the next potential nudge.

### Stage 3: Restart (`stalled`)

When `phase === "silent"` and `nudgeCount >= maxNudgesBeforeRestart`:

Transitions to `"stalled"`. Sends `Escape + Ctrl-C × 3` to the orchestrator pane (polite interrupt). Schedules `restart_settled` after 3s. When `restart_settled` fires (if still in `crashed` or `stalled`), re-sends the `claude --dangerously-skip-permissions` command to the orchestrator pane and transitions to `"starting"`.

### Crash detection (separate from silence)

If `claudeRunning === false` during a heartbeat (process died rather than went silent), the supervisor immediately transitions to `"crashed"`, re-sends the claude startup command, increments `restartCount`, and schedules `restart_settled` after 15s.

### Live evidence

The `supervisor-state.json` event log shows this working in production. Example sequence: `running → silent (330s, activity=error) → nudging #1 → silent → running → silent (300s, activity=error) → nudging #1 ...` (nudge count always resets to 1 because output is detected after each nudge). The `totalNudges: 16` and `totalRestarts: 2` in the live state file confirm real-world exercise.

---

## 5. TUI Widget

### Supervisor widget (`updateWidget()` in supervisor.ts)

Registered as `"supervisor"` via `widgetCtx.ui.setWidget()`. Renders as a multi-line panel. Content:

**Line 1:** Bold "Supervisor" header

**Line 2:** Status badge + silence timer:
```
[RUN] Last output: 42s ago
```
Badge values: `STOP | INIT | RUN | QUIET | NUDGE | STALL | CRASH | PAUSE | WAVE | MERGE | HUMAN`
Colors: stopped=dim, starting=accent, running=success, silent/paused=warning, stalled/crashed=error, wave=success, merge=warning, awaiting_human=warning

**Line 3:** Counters + orchestrator phase + worker names:
```
N:0/3 R:2 | Orchy: unknown | W: none
```
(N = nudge count/max, R = restart count)

**Line 4 (conditional):** Task from state, truncated to 60 chars

**Line 5 (conditional):** Session ID and status from registry:
```
Session: lthread-1773509995 | ACTIVE
```

**Line 6 (conditional):** Last event from event log with ISO time:
```
18:06:35 heartbeat: starting -> running: first output detected
```

### BMAD Wave progress (gated on `bmadState.wave !== null`)

**BMAD header line:**
```
BMAD │ Epic 1 — Foundation wave-0
```

**Progress bar** (10-character fixed width):
```
[█████░░░░░] 3/5
```
Filled with `█` (success color) for done stories, `░` (dim) for remaining. Count colored by wave status (success if complete/merged, warning if merging, error if any failures, accent otherwise). Failed count shown as ` ✗N` in error color if > 0.

**Per-story icons:**
```
1.1✓ 1.2⟳ 1.3· 1.4✗
```
- `✓` = done (success color)
- `⟳` = running (accent color)
- `·` = pending (dim color)
- `✗` = failed (error color)

**Human checkpoint banner** (only when unresolved checkpoints exist):
```
⚠ HUMAN a rubber duck has requested architecture review
```

### Footer bar (always visible at bottom)

The supervisor also sets a footer (separate from the widget) via `setFooter()`:

```
gpt-5.4 | [RUN] | 42s N:0 R:2 W:0 | Wave 0: Build OmniPort... | W:wave-0 3/5    [#####-----] 50%
```

Components (left to right): model name, status badge, silence/nudge/restart/worker counts, task (truncated 30 chars), wave indicator (`W:<waveId> done/total`), context window bar (10 chars #/-), percentage.

### Orchestrator dashboard (separate extension `orchestrator-dashboard.ts`)

A simpler footer for when Pi is used as the orchestrator (not supervisor). Shows: model, phase from `_bmad/orchestrator-state.json`, worker count, AUTO/MANUAL mode, context bar.

---

## 6. BMAD Workflow Tools — Wave Lifecycle

### State: `BmadWaveState` in `_bmad/bmad-wave-state.json`

```json
{
  "epic": "Epic 1 — Anonymous Discovery",
  "epicId": "epic-1",
  "wave": {
    "id": "wave-0",
    "index": 0,
    "stories": [
      {
        "id": "story-1.1",
        "title": "Portal Shell & Themed Entry",
        "workerName": "epic-1-story-1-1",
        "status": "running",
        "latchFile": "/tmp/orchy-epic-1-story-1-1.latch",
        "prUrl": null,
        "startedAt": "2026-03-14T...",
        "completedAt": null
      }
    ],
    "status": "spawning | running | complete | merging | merged",
    "spawnedAt": "2026-03-14T...",
    "completedAt": null
  },
  "completedWaves": [],
  "humanCheckpoints": [...]
}
```

### Lifecycle: SPAWN → MONITOR → REVIEW → MERGE → REPORT → CHECKPOINT

**SPAWN (`bmad_start_wave`)**
Validates 1–4 stories. Guards against double-launch. Calls `spawnWorkerPane()` for each story. Worker name is sanitized as `<epic_id>-<story_id>` with non-alphanumeric replaced by `-`. Sets wave status to `"spawning"`. Dispatches `wave_started` which starts latch polling every 15s. After 15s, sends the user-provided prompt + latch instructions to each worker. Wave transitions to `"running"`.

**MONITOR (automatic latch polling)**
Every 15s (from `latch_poll` event dispatched in a schedule loop), `check_latches` effect fires. It reads each running story's `/tmp/orchy-<workerName>.latch` file. If present: extracts PR URL via `https://github.com/[^\s]+` regex, marks story done, dispatches `wave_story_done` event, sends desktop notification. If all stories are done/failed: fires `cmux notify "Wave Complete"`.

The latch file format (written by worker):
```json
{"done":true,"pr":"https://github.com/owner/repo/pull/42"}
```

**REVIEW (`bmad_wave_status`)**
On-demand status check. Repeats latch detection (useful for ad-hoc queries between 15s polls). Shows per-story report with screen capture from running workers.

**MERGE (`bmad_merge_wave`)**
Guards: wave must exist + no stories still `"pending"` or `"running"`. Spawns a merge worker. Builds a default merge prompt listing all done PR URLs and instructing merge-in-dependency-order → run tests → write merge latch. Sets 60s polling interval for merge latch file. On merge latch: archives wave → closes story workers → leaves merge worker open for human verification.

**REPORT (`bmad_generate_report`)**
Generates markdown reports to `_bmad-output/reports/`. Wave scope includes per-story duration calculations. Epic scope summarizes all completed waves.

**CHECKPOINT (`bmad_notify_human`)**
Pauses everything. Transitions supervisor phase to `"awaiting_human"`. Heartbeat skips entirely during this phase. Human must call `supervisor_resume` to unblock.

---

## 7. Session Registry

**File:** `_bmad/session-registry.json`
**Schema version:** 1
**Written by:** `persistRegistry()` on every `supervisor_stop`, `supervisor_start`, `pause`, `resume`, `worker_spawned`, `worker_closed`, and at session startup.

```json
{
  "version": 1,
  "session": {
    "id": "lthread-<epoch>",
    "terminal_session": "lthread",
    "launched_at": "2026-03-14T17:39:56Z",
    "status": "active | paused | stopped",
    "task": "full task description string",
    "panes": {
      "supervisor": { "pane_id": "<uuid-or-surface:N>", "pid": null },
      "orchestrator": { "pane_id": "surface:6", "pid": null },
      "workers_base": { "pane_id": "surface:5", "pid": null },
      "worker_<name>": { "pane_id": "surface:7", "pid": null }
    },
    "agents": [
      {
        "role": "supervisor",
        "pane_id": "...",
        "model": "gpt-5.4",
        "started_at": "...",
        "stopped_at": null,
        "status": "running"
      },
      {
        "role": "orchestrator",
        "pane_id": "surface:6",
        "model": "claude-opus-4-6",
        "started_at": "...",
        "stopped_at": null,
        "status": "running"
      },
      {
        "role": "worker:lagerlink",
        "pane_id": "surface:7",
        "model": "claude-opus-4-6",
        "started_at": "...",
        "stopped_at": null,
        "status": "running"
      }
    ]
  },
  "history": [
    {
      "id": "lthread-1773499000",
      "started_at": "...",
      "stopped_at": "...",
      "task": "prev task",
      "agents_spawned": 2
    }
  ]
}
```

**Phase → Status mapping:**
- `stopped`, `crashed` → `"stopped"`
- `paused`, `awaiting_human` → `"paused"`
- All other phases → `"active"`

The registry serves as the "what's running" surface for external tools. The `run.sh` script reads it at startup to detect active sessions and prompt before overwriting.

**Note on PIDs:** cmux does not expose per-surface PIDs via its CLI. All `pid` fields are `null`. Hard kills use `pgrep -f "ORCHY_SESSION_NAME=<name>"` to find the process by environment variable instead.

---

## 8. Telemetry

**Files:**
- `_bmad/telemetry/YYYY-MM-DD.jsonl` — one file per day, daily rotation
- `_bmad/agent-activity.jsonl` — all supervisor lifecycle events (append-only, never rotated)

### JSONL schema (telemetry)

```json
{
  "ts": "2026-03-14T16:24:56.533Z",
  "epoch": 1773505496533,
  "session": "pi-<base36>",
  "type": "hook | tool | reducer | activity | user | system",
  "subtype": "session_start | tool_call | context_injected | before_agent_start | session_before_compact",
  "data": { ... }
}
```

### Events logged by `telemetry.ts`

| Hook | type | subtype | data |
|------|------|---------|------|
| `session_start` | `"hook"` | `"session_start"` | `{cwd, model, contextUsage}` |
| `session_before_compact` | `"hook"` | `"session_before_compact"` | `{contextUsage, entriesLogged}` |
| `tool_call` | `"tool"` | `"tool_call"` | `{tool, input (truncated to 500 chars)}` |
| `before_agent_start` | `"hook"` | `"before_agent_start"` | `{sessionId, entriesLogged}` |
| `context` | `"hook"` | `"context_injected"` | `{contextUsage}` |

The telemetry logger is exposed on `globalThis.__telemetry_log` so other extensions can call it. The supervisor's `dispatch()` function calls it for every reducer invocation:
```
tlog("reducer", event.type, { prevPhase, newPhase, effectCount, effects[], silence })
```

### JSONL schema (agent-activity)

Written by `logActivity()` in supervisor.ts to `_bmad/agent-activity.jsonl`:

```json
{
  "ts": "2026-03-14T16:24:56.533Z",
  "epoch": 1773505496533,
  "session": "lthread",
  "session_id": "lthread-1773505494",
  "event": "orchestrator_started | orchestrator_crashed | orchestrator_restarted | paused | resumed | stopped | worker_spawned | worker_closed | hard_kill_applied | supervisor_session_start | bmad_wave_spawn_failed | bmad_wave_prompt_sent | bmad_story_completed | bmad_merge_prompt_sent | bmad_wave_merged | bmad_merge_timeout | bmad_human_checkpoint | bmad_report_generated",
  "phase": "running",
  "task": "current task string or null",
  "...additional event-specific fields..."
}
```

The session_created events in `agent-activity.jsonl` are written by `run.sh` at startup (bash, not TypeScript) to capture the cmux surface IDs before Pi starts.

---

## 9. Worker Management (Orchestrator Agents)

The worker lifecycle is split across two extensions:
- `supervisor.ts` — supervisor-owned worker tools (`supervisor_spawn_worker`, `supervisor_close_worker`) plus all BMAD wave spawning
- `orchestrator-agents.ts` — orchestrator-owned worker tools (`tmux_spawn`, `tmux_dispatch`, `tmux_wait`, `tmux_wait_any`, `tmux_capture`, `tmux_status`, `tmux_close`)

### Spawn flow

First worker reuses the pre-allocated `workersPaneId` surface from the layout. Subsequent workers use `cmux new-split up --surface <lastWorkerPaneId>` and extract the new surface ID via `newPaneRaw.match(/surface:\d+/)?.[0]`. Each worker gets `export ORCHY_SESSION_NAME=<name>` injected as an env var for PID lookup during hard kill.

### Latch protocol

Workers signal completion by writing a file to `/tmp/orchy-<name>.latch`. The file contains JSON: `{"done":true,"pr":"<PR_URL>"}`. The orchestrator-agents extension uses `tmux wait-for <channel>` for zero-CPU waiting, but falls back to latch file polling on timeout. The supervisor's BMAD tools use only latch file polling (since cmux has no `wait-for` equivalent).

### Worker status tracking

`orchestrator-agents.ts` maintains a `Map<string, WorkerState>` in memory. Each `WorkerState` tracks: `{name, paneId, directory, status: "idle|running|done|error|dead", currentTask, startedAt, elapsed}`. A `setInterval(2s)` updates `elapsed` while a worker is `"running"`. On session start, workers are restored from `_bmad/pane-layout.json`.

### Function reference

| Function | Source | What it does |
|----------|--------|-------------|
| `spawnWorkerPane()` | supervisor.ts | Creates cmux surface, sends cd+claude command, adds to layout |
| `dispatch_worker / tmux_dispatch` | orchestrator-agents.ts | Clears latch, sends prompt, starts elapsed timer |
| `tmux_wait` | orchestrator-agents.ts | Blocks on `tmux wait-for <channel>` subprocess (zero CPU) |
| `tmux_wait_any` | orchestrator-agents.ts | Same but races N workers on shared channel |
| `paneCapture / tmux_capture` | both | `cmux read-screen --surface <id> --lines N` |
| `tmux_close / supervisor_close_worker` | both | Escape + Ctrl-C × 3, then `cmux close-surface` after 2s |

---

## 10. Pane Layout System

### 3-pane layout created by `run.sh`

```
+──────────────────────+──────────────────────+
│ Pi Supervisor        │ Worker N (newest)    │
│ (top-left)           ├──────────────────────┤
├──────────────────────┤ Worker 2             │
│ Opus Orchestrator    ├──────────────────────┤
│ (bottom-left)        │ Worker 1 (first)     │
+──────────────────────+──────────────────────+
```

### How it's created

1. `run.sh` runs inside a cmux terminal — `$CMUX_SURFACE_ID` is the initial (supervisor) surface
2. `cmux new-split right` from supervisor surface → creates workers surface (right half)
3. `cmux new-split down` from supervisor surface → creates orchestrator surface (below left)
4. Layout written to `_bmad/pane-layout.json` with all three surface IDs + workspace ID

The workspace ID (`$CMUX_WORKSPACE_ID`) is critical — all cmux commands in supervisor.ts are wrapped with `--workspace <id>` to prevent cross-workspace surface targeting (the "double-window bug" where cmux might target a surface in a different workspace).

### Workspace scoping

The module-level `_cmuxWorkspaceId` variable is loaded from `layout.workspaceId`. All cmux calls go through the `cmux()` wrapper function:

```typescript
function cmux(args: string, timeout = 5000): string {
  const ws = _cmuxWorkspaceId ? ` --workspace "${_cmuxWorkspaceId}"` : "";
  return exec(`cmux ${args}${ws} 2>/dev/null`, timeout);
}
```

### Layout file: `_bmad/pane-layout.json`

```json
{
  "session": "lthread",
  "workspaceId": "1A58256C-7369-4B0B-95F7-D7926EA58DBB",
  "supervisorPaneId": "F5CF3294-FBD2-44D5-B3ED-1411CC9FE34A",
  "orchestratorPaneId": "surface:6",
  "workersPaneId": "surface:5",
  "orchestratorDir": "/Users/buraksmac/Desktop/code2/orchestrator",
  "workerPanes": []
}
```

Note: supervisorPaneId is a UUID (cmux UUID format for the surface Pi itself runs in), while orchestratorPaneId and workersPaneId use short `surface:N` refs returned by `cmux new-split`. Both formats are accepted by cmux `--surface`.

### Layout persistence

`persistLayout()` writes `_bmad/pane-layout.json`. Called on:
- `worker_spawned` event (new pane added)
- `worker_closed` event (pane removed)
- `session_before_compact` hook (survival across Pi context compaction)

On session start (`session_start` hook), `loadLayout()` reads the file and sets `_cmuxWorkspaceId`. If the file doesn't exist (first run), layout defaults to all empty strings — supervisor tools won't work until `run.sh` creates the layout.

---

## 11. Orchestrator Discipline (Code Write Guard)

The `orchestrator-discipline.ts` extension implements the "DU BIST KEIN ENTWICKLER" rule as a **physical block**, not just a prompt instruction.

It intercepts every `tool_call` event via `pi.on("tool_call")`. For `write` and `edit` tool calls: checks if the target path is a code file by extension. Allowed write targets: paths containing `_bmad/`, `.bmad/`, `orchestrator-state`, `devlog.md`, or `orchestrator-tmux-state`. All other code file writes are blocked via `ctx.abort()` and return a `{block: true}` result with a detailed explanation.

For `bash` tool calls: checks for patterns that write to code files:
- `sed -i` (in-place sed)
- `awk ... -i inplace`
- `> *.ts|js|py|go|rs|css|html|sql` (output redirection)
- `tee *.ts|js|py|go|rs|css|html|sql` (tee to code file)

Blocked attempts are logged to Pi's `appendEntry("discipline-log")` and shown as error notifications in the TUI. The block count is shown in the status bar: `Discipline: N blocked`.

---

## 12. State Files Summary

| File | Written by | Purpose |
|------|-----------|---------|
| `_bmad/supervisor-state.json` | supervisor.ts `persistState()` | Phase, counters, event log, task |
| `_bmad/pane-layout.json` | supervisor.ts `persistLayout()` | Surface IDs for all panes |
| `_bmad/session-registry.json` | supervisor.ts `persistRegistry()` | Agent roster, session ID |
| `_bmad/bmad-wave-state.json` | supervisor.ts `persistBmadState()` | Wave progress, story statuses, checkpoints |
| `_bmad/supervisor-config.json` | `supervisor_config` tool | Thresholds (heartbeat, silence, max nudges) |
| `_bmad/orchestrator-state.json` | orchestrator-state.ts extension | Orchestrator phase, current story, agent info |
| `_bmad/orchestrator-tmux-state.json` | orchestrator-agents.ts | Worker pane statuses |
| `_bmad/agent-activity.jsonl` | `logActivity()` + run.sh | Audit trail, append-only |
| `_bmad/telemetry/YYYY-MM-DD.jsonl` | telemetry.ts | All hooks and tool calls, daily rotation |
| `.bmad/devlog.md` | `writeDevlog()` | Human-readable supervisor log |

---

## 13. Design Philosophy & How Features Interact

### The supervisor is the Pi LLM's "infrastructure brain"

The Pi process (running GPT-5.4 or other models) is the supervisor. It watches Claude Opus (the orchestrator) running in a cmux surface. The supervisor provides intelligence: it decides *what* nudge to send, whether to restart vs skip, and when to call `bmad_notify_human`. The heartbeat handles *mechanics* automatically.

### Event-driven, not polling-driven

The heartbeat timer fires every 30s but produces no side effects when things are normal. Phase transitions only happen when thresholds are crossed. The `schedule` effect type allows deferred events (nudge_settled, restart_settled) without blocking or sleeping.

### Latch files as the coordination primitive

Workers signal completion by writing `/tmp/orchy-<name>.latch`. This is simple, crash-safe, and cmux/tmux agnostic. The supervisor polls latch files every 15s (for BMAD waves) or via `tmux wait-for` events (for orchestrator-agents mode). The worker's prompt always includes latch instructions appended by `bmad_start_wave`.

### Workspace scoping prevents phantom windows

The known bug (double-window creation) is caused by cmux targeting a surface in a different workspace. The fix is `--workspace <id>` on every command. This is architecturally important: surface IDs are scoped to workspaces, not global.

### Screen state feeds back into silence detection

The `parseScreen()` result is attached to every `heartbeat` event as `event.screen`. The reducer reads `event.screen.activity` before deciding whether to nudge. This creates a closed loop: the supervisor reads the terminal to decide whether silence is real idleness or active work. This is the core mechanism that prevents false-positive nudging during slow Bash commands or long LLM thinking phases.

### BMAD respects the DeepMind limit

The 4-story cap in `bmad_start_wave` is enforced in code (not just prompt) with an explicit error return. The comment cites the DeepMind coordination overhead exponent (1.724) as the architectural reason. The merge agent is always spawned separately from story workers, keeping peak concurrent agents at 5 maximum.
