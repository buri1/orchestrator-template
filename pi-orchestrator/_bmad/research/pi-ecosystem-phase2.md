# Pi Ecosystem — Phase 2 Deep-Dive Research

> Created: 2026-03-12
> Purpose: Deep-dive analysis of 10 Pi ecosystem projects for pattern extraction. Phase 2 of research for pi-orchestrator supervisor architecture.
> Agents: 10 parallel Sonnet subagents, web search + code analysis

---

## Project Matrix

| # | Project | Stars | Role | Key Pattern | Relevance |
|---|---------|-------|------|-------------|-----------|
| 1 | njbrake/agent-of-empires | 1,097 | Session manager | Rust tmux manager, 8 agents, dual status detection | 4/5 |
| 2 | jayminwest/overstory | 970 | Supervisor | ZFC watchdog, Pi runtime adapter, guard codegen, mulch | 5/5 |
| 3 | nicobailon/pi-messenger | 364 | P2P mesh | File-based inbox, fs.watch, crew overlay TUI, lobby | 5/5 |
| 4 | nicobailon/pi-interactive-shell | 296 | Sidecar | PTY-in-extension, no tmux, quiet detection | 4/5 |
| 5 | offline-ant/pi-tmux | - | Supervisor | Semaphore registry, pipe-pane watch, context alert | 5/5 |
| 6 | tintinweb/pi-supervisor | 17 | Supervisor | LLM drift detection, in-memory session, sensitivity levels | 5/5 |
| 7 | can1357/oh-my-pi | 1,907 | Agent runtime | FUSE overlay isolation, baseline+delta, worktree.ts | 4/5 |
| 8 | EmZod/pi-subagent-with-logging | - | Dashboard | Mission Control TUI, audit JSONL, manifest registry | 4/5 |
| 9 | badlogic/pi-skills | 781 | Skills library | Cross-agent portability, undocumented Pi APIs | 4/5 |
| 10 | OpenClaw/Lobster | 809 | Pipeline engine | Deterministic YAML pipelines, approval gates, typed streams | 3/5 |

---

## 1. njbrake/agent-of-empires

**URL**: https://github.com/njbrake/agent-of-empires
**Stack**: Rust + ratatui TUI + tokio + git2 + clap
**Stats**: 1,097 stars, 403 commits, 67 releases, MIT

### Architecture
- 8 agents: Claude Code, Pi, Codex, Gemini, Vibe/Mistral, Cursor, OpenCode, Copilot
- Each agent has agent-specific YOLO flags and detect_status fn pointers
- Sessions stored in `~/.config/{profile}/sessions.json` (JSON array + .bak backup)
- Session IDs: random AoE2 civilization names with Roman numeral suffixes

### Dual Status Detection
**Strategy A — Terminal Scraping** (all agents): Last 30 lines from `tmux capture-pane -p -S -30`, braille spinner detection, prompt detection, activity keywords
**Strategy B — Hook Files** (Claude Code only): `/tmp/aoe-hooks/{INSTANCE_ID}/status` written by PreToolUse/Stop hooks

### Key Patterns
- `session:^` pane targeting (handles base-index 1 configs)
- `remain-on-exit` on tmux sessions — survives command exit
- `#{pane_dead}` for liveness detection
- SIGTERM → wait → SIGKILL sequence (same as our INC-007 fix)
- Git worktree templates: `path_template = "../{repo-name}-worktrees/{branch}"`
- No continuous watchdog — entirely on-demand (KISS philosophy)
- Web dashboard is just a docs site, not operational

### Stealable
- `remain-on-exit` on pane creation (we're missing this)
- `#{pane_dead}` check (better than PID-based approach)
- Agent-specific YOLO flag registry
- `aoe status -q` scriptable single-integer output

---

## 2. jayminwest/overstory

**URL**: https://github.com/jayminwest/overstory
**Stack**: Bun + TypeScript + SQLite (bun:sqlite) + tmux
**Stats**: 970 stars, packages: @os-eco/overstory-cli + @os-eco/mulch-cli

### Watchdog State Machine
States: `booting(0) → working(1) → completed(2) → stalled(3) → zombie(4)` (forward-only)

**ZFC (Zero Failure Crash)**: Observable state (tmux/PID liveness) ALWAYS overrides stored state.

Progressive escalation (4 levels, 60s time-gating):
- Level 0: warn (log only)
- Level 1: nudge ("Agent appears stalled. Please check your current task and report status.")
- Level 2: AI triage (Claude `--print` with 30s timeout, returns retry/terminate/extend)
- Level 3: terminate (kill process tree)

### Pi Runtime Adapter (`src/runtimes/pi.ts`)
```typescript
detectReady(paneContent: string): ReadyState {
  const hasHeader = paneContent.includes("pi v");
  const hasStatusBar = /\d+\.\d+%\/\d+k/.test(paneContent);
  if (hasHeader && hasStatusBar) return { phase: "ready" };
  return { phase: "loading" };
}

getTranscriptDir(projectRoot: string): string | null {
  const encoded = `--${projectRoot.replace(/[\\\/]/g, "-").replace(/:/g, "")}--`;
  return join(home, ".pi", "agent", "sessions", encoded);
}
```

### Guard Extension Code-Generation (`pi-guards.ts`)
7-layer guard chain:
1. Block native team tools (Task, SendMessage)
2. Block interactive tools (AskUserQuestion, EnterPlanMode)
3. Block write tools for non-implementation capabilities
4. Path boundary on write/edit (checks `event.input.path`)
5. Universal bash danger guards (git push, git reset --hard)
6. Non-implementation bash guards (safe prefix whitelist + dangerous pattern blocklist)
7. Default allow

Activity tracking: `agent_end` + `session_shutdown` hooks call `pi.exec("ov", ["log", "session-end"])` to prevent false zombie classification.

### Insights (Pure Statistics, No LLM)
- Tool workflow classification (read-heavy, write-heavy, bash-heavy, balanced)
- Hot file detection (files with 3+ edits)
- Error pattern analysis

### Mulch (Composting/Archival)
- Separate CLI: `@os-eco/mulch-cli`
- JSONL expertise records by domain in `.mulch/expertise/`
- Record types: convention, pattern, failure, decision, reference, guide
- No time-based decay — manual compact/prune
- `record()` / `search()` / `query()` / `prime()` / `compact()` API

### Forest Metaphor
seeds (tasks) → sapling (AI config) → overstory (orchestration) → mulch (archived learnings) → canopy (agent definitions)

### Session Registry
SQLite with WAL mode + 5s busy timeout for concurrent access. Fields: id, agentName, capability, worktreePath, branchName, taskId, tmuxSession, state, pid, parentAgent, depth, runId, startedAt, lastActivity, escalationLevel, stalledSince, transcriptPath.

### Stealable
- ZFC principle (observable > stored state)
- Progressive escalation with time-gating
- Guard extension code-generation
- SQLite WAL for concurrent session access
- `agent_end` activity tracking prevents false zombies
- Pure statistical insights (no LLM cost)
- Mulch composting pattern for expertise archival

---

## 3. nicobailon/pi-messenger

**URL**: https://github.com/nicobailon/pi-messenger
**Stack**: TypeScript Pi extension
**Stats**: 364 stars

### File-Based Inbox Architecture
```
~/.pi/agent/messenger/
├── registry/{AgentName}.json    # PID, CWD, model, reservations
├── inbox/{AgentName}/*.json     # Message delivery files
├── claims.json                  # Task claim registry
├── completions.json             # Task completion registry
└── swarm.lock                   # PID-based advisory lock (O_CREAT|O_EXCL)
```

Per-project crew state:
```
{cwd}/.pi/messenger/
├── feed.jsonl                   # 24 event types, append-only, pruned to N lines
├── crew/plan.json + plan.md     # Plan metadata + narrative
├── crew/tasks/{id}.json + .md + .progress.md
└── crew/blocks/{id}.md
```

### Message Delivery
- `fs.watch` on inbox directory — no polling, 50ms debounce
- `pi.sendMessage({ customType: "agent_message", content }, { triggerTurn: true, deliverAs: "steer" })` wakes sleeping agents
- Worker broadcast logs to feed only (prevents O(n²) messages)
- Message budget per session based on coordination level (silent/minimal/chatty)

### TUI Overlay
- `ctx.ui.custom()` for full-screen modal
- Renders agent cards, task list, feed, live worker progress
- Snapshot-on-close: `generateSnapshot()` → `pi.sendMessage({ triggerTurn: true })` for context continuity
- Tab completion for @mentions with agent name cycling

### Key Patterns
- `process.kill(pid, 0)` for liveness check
- Atomic writes: `writeFileSync(temp)` → `renameSync(temp, target)`
- Lobby pattern: pre-warmed idle workers waiting for task assignment
- Crew roles: planner → reviewer → worker → plan-sync
- Advisory file reservations with conflict detection

### Stealable
- File-based inbox with fs.watch (zero polling)
- Atomic temp+rename writes
- Message budget enforcement
- Lobby pattern (pre-warmed workers)
- Snapshot-on-close for context continuity

---

## 4. nicobailon/pi-interactive-shell

**URL**: https://github.com/nicobailon/pi-interactive-shell
**Stack**: TypeScript + node-pty + @xterm/headless
**Stats**: 296 stars

### PTY-in-Extension Architecture
- `node-pty` spawns subprocess in real PTY
- `@xterm/headless` maintains parsed terminal buffer (5000 line scrollback)
- @xterm/addon-serialize for ANSI-faithful output reconstruction
- DSR cursor query interception (ESC[6n) for vim/psql compatibility

### Token Efficiency
- Tail-only reads: `getTailLines({ lines: 20, maxChars: 5KB })`
- Parsed buffer (not raw stream) — screen-clearing redraws produce clean output
- Incremental/drain modes track what agent has already seen
- Budget cap: `handsFreeMaxTotalChars: 100KB`
- Quiet detection: `on-quiet` mode (5-8s threshold) — emits only when output goes silent
- Dispatch mode: single completion notification via `triggerTurn` (zero polling)

### User Takeover
- Any keystroke during `hands-free` mode triggers `triggerUserTakeover()`
- First keypress forwarded to subprocess (no input swallowed)
- Agent polling stopped, notification sent

### Comparison to tmux capture-pane
| Dimension | tmux capture-pane | pi-interactive-shell |
|---|---|---|
| Output fidelity | Raw escape sequences | Parsed xterm buffer |
| Incremental reads | Manual line offset tracking | Built-in drain/incremental |
| Scroll mode issues | INC-005 brittleness | N/A (no tmux) |
| Session confusion | INC-006/008 | N/A (owns PTY directly) |

### Stealable
- Quiet detection pattern (emit only when output goes silent)
- Incremental read with budget cap
- Dispatch mode completion notification

---

## 5. offline-ant/pi-tmux + pi-semaphore

**URL**: https://github.com/offline-ant/pi-tmux + pi-semaphore
**Stack**: Bash + TypeScript Pi extension

### Semaphore/Pane Mapping
```
<name> → /tmp/pi-semaphores/<name> → content = "%42" (pane id)
Active: /tmp/pi-semaphores/worker      → %42
Idle:   /tmp/pi-semaphores/idle:worker  → %42
```

### Context Alert Semaphore
```typescript
pi.on("agent_end", async (_event, ctx) => {
  const usage = ctx.getContextUsage();
  if (usage?.percent >= contextAlertThreshold) {
    await runSemaphore(pi, ["release", contextAlertLockName]);
  }
});
```
Supervisor can `semaphore_wait(['worker', 'worker:context'])` — react to task completion OR context fill.

### Key Patterns
- File-per-pane (more robust than single JSON for concurrent writes)
- Shell trap cleanup on process exit (transitions active → idle even on crash)
- Human-typing guard: AWK detects Pi input box text between `───` separators
- `pipe-pane` watch for zero-latency pattern matching
- Lock deduplication: `worker`, `worker-2`, `worker-3` up to 1000
- `input` event handler aborts blocking `semaphore_wait` when user types
- `is_pane_dead` on every `tmux-capture` call triggers automatic cleanup

### Stealable
- File-per-pane registry (atomic, no JSON parse contention)
- Context alert semaphore pattern
- Human-typing guard
- Shell trap cleanup (crash-resilient state transition)
- pipe-pane watch (zero-latency vs polling)

---

## 6. tintinweb/pi-supervisor

**URL**: https://github.com/tintinweb/pi-supervisor
**Stack**: TypeScript Pi extension (9 files, ~37KB)
**Stats**: 17 stars

### Out-of-Band LLM Observation
Uses `createAgentSession({ sessionManager: SessionManager.inMemory() })` — in-process, zero-context-pollution analysis session:
- Shares only `ctx.modelRegistry` (API keys)
- `noExtensions: true`, `noSkills: true`, `noPromptTemplates: true`
- One-shot: created fresh per analysis, then disposed
- Reads conversation via `ctx.sessionManager.getBranch()` (read-only)
- Steers via `pi.sendUserMessage()` (injects as user message)

### Sensitivity Levels
| Level | Message limit | Check timing | Confidence threshold |
|-------|--------------|--------------|---------------------|
| low | 6 msgs | agent_end only | n/a |
| medium | 12 msgs | agent_end + every 3rd tool cycle | ≥ 0.90 |
| high | 20 msgs | agent_end + every tool cycle from turn 2 | ≥ 0.85 |

### Stagnation Guard
After 5 idle steers without `done` → lenient mode (≥80% achieved = done).

### Clean Architecture
- `engine.ts`: pure functions (buildSnapshot, buildUserPrompt, analyze) — zero side effects
- `index.ts`: all side effects (sendMessage, updateUI, record interventions)
- `state.ts`: persists via `pi.appendEntry()` — survives session fork/tree navigation
- `model-client.ts`: fresh AgentSession per call, streams reasoning into widget via `onDelta`

### `pi.sendUserMessage()` Semantics
- `agent_end` (idle): plain `sendUserMessage` — wakes the agent
- `turn_end` (mid-run): `{ deliverAs: "steer" }` — injects without resetting turn context

### Stealable
- In-memory analysis session (zero context pollution)
- LLM-based semantic drift detection (vs our timer-based nudge)
- 3-level sensitivity with confidence thresholds
- Stagnation guard (5 steers → lenient mode)
- Clean engine/index side-effect separation
- State persistence via pi.appendEntry() (survives fork/tree)
- Streaming reasoning in TUI widget

---

## 7. can1357/oh-my-pi

**URL**: https://github.com/can1357/oh-my-pi
**Stack**: TypeScript + Rust monorepo (NOT a Pi fork — independent rewrite)
**Stats**: 1,907 stars

### FUSE Overlay Isolation
```
~/.omp/wt/--<encoded-project-path>--/<task-id>/
  upper/     # per-worker copy-on-write layer
  work/      # overlayfs scratch
  merged/    # mount point = worker's CWD
```
- Reads fall through to real repo (zero-copy)
- Writes land in `upper/` (completely isolated)
- Windows equivalent: ProjFS (Projected File System) in ~500 lines Rust
- Fallback chain: FUSE → git worktree (no FUSE available)

### Baseline + Delta Pattern
- Pre-execution: capture `WorktreeBaseline` (HEAD commit, staged/unstaged/untracked)
- Each worker gets `structuredClone(baseline)` — immutable
- Post-execution: delta as git binary patch or branch commit
- Sequential merge with conflict detection (aborts on first conflict)

### Swarm Extension (YAML Pipelines)
- DAG-based dependency graph with topo sort → waves
- `PipelineController` runs iterations × waves
- `StateTracker` persists to `.swarm_<name>/state/pipeline.json`
- Resumable from disk

### Stealable
- FUSE overlay pattern for worker file isolation
- Baseline + delta capture (immutable snapshots)
- `worktree.ts` is ~530 lines, pure TypeScript, extractable
- Fallback chain (FUSE → worktree)

---

## 8. EmZod/pi-subagent-with-logging (pi-shadow-git)

**URL**: https://github.com/EmZod/pi-subagent-with-logging
**Stack**: TypeScript Pi extension

### Mission Control TUI
```
╔══════════════════════════════════════════════════════════════╗
║              🚀  MISSION CONTROL                             ║
╚══════════════════════════════════════════════════════════════╝
  ● 3 running │ ○ 1 pending │ ✓ 2 done │ ✗ 0 errors
  ST  AGENT         TURN  TOOLS  ERR   LAST ACTIVITY
  ●  scout1           12     34    0   just now
  ✓  aggregator       15     42    0   2m ago
```

- `ctx.ui.custom()` for full-screen overlay
- `ctx.ui.setWidget()` for compact one-line status
- `setInterval(2000)` + `tui.requestRender()` for refresh
- Scrollable with 12 visible rows + scroll offset
- Detail panel on Enter (status, turns, tools, errors, duration)

### State
- `manifest.json`: agent registry (status, PIDs, timestamps)
- `agents/{name}/audit.jsonl`: real-time event stream
- Scales to "100s of agents" with pagination

### Stealable
- Mission Control dashboard layout
- audit.jsonl per agent pattern
- ctx.ui.custom() overlay with navigation

---

## 9. badlogic/pi-skills (Mario Zechner)

**URL**: https://github.com/badlogic/pi-skills
**Stats**: 781 stars, 81 forks

### Skills vs Extensions
- **Skills** = shell CLI tools (JS/bash), work across Claude Code, Codex, Amp, Droid
- **Extensions** = Pi TypeScript modules with full ExtensionAPI, Pi-only
- `{baseDir}` placeholder is the only cross-runtime mechanism

### Undocumented Pi APIs Discovered
```typescript
pi.events                           // Cross-extension event bus (.on/.emit) — better than globalThis!
ctx.ui.setHeader(factory)           // Replace built-in header
ctx.ui.setEditorComponent(factory)  // Replace main input editor
ctx.ui.pasteToEditor(text)          // Paste handling
pi.registerFlag(name, options)      // Register CLI flags → pi.getFlag("--name")
pi.getCommands()                    // List all commands with source field
pi.setLabel(entryId, label)         // Labels on session entries
ctx.waitForIdle()                   // Wait for agent idle (deadlocks in event handlers!)
ctx.hasPendingMessages()            // Check message queue
ctx.navigateTree(targetId)          // Programmatic tree navigation (CommandContext only)
ctx.fork(entryId)                   // Fork session (CommandContext only)
ctx.newSession(options?)            // New session (CommandContext only)
footerData.getGitBranch()           // Live git branch in footer
footerData.onBranchChange(cb)       // Subscribe to branch changes
footerData.getExtensionStatuses()   // Read all extension status texts
pi --mode rpc                       // stdin/stdout JSONL RPC: prompt, steer, follow_up, abort
```

### Full setWidget API
```typescript
ctx.ui.setWidget("key", ["Line 1"]);                          // String array
ctx.ui.setWidget("key", ["Line 1"], { placement: "belowEditor" });  // Below editor
ctx.ui.setWidget("key", (tui, theme) => new Component(...));  // Component factory
ctx.ui.setWidget("key", undefined);                           // Clear
```

### Full ctx.ui.custom() API
```typescript
await ctx.ui.custom<T>((tui, theme, keybindings, done) => component, {
  overlay: true,
  overlayOptions: { anchor: "top-right", width: "50%", margin: 2 },
  onHandle: (handle) => { handle.setHidden(true/false); }
});
```

### Stealable
- pi.events bus (replace globalThis)
- All undocumented APIs
- Full ctx.ui.custom() overlay with anchoring

---

## 10. OpenClaw/Lobster

**URL**: https://github.com/openclaw/lobster
**Stats**: 809 stars. OpenClaw itself: 307K stars.
**Note**: OpenClaw is Peter Steinberger (@steipete), NOT Elvis Sun. Pi creator Mario Zechner is security contributor.

### Deterministic YAML Pipelines
```yaml
steps:
  - id: collect
    command: inbox list --json
  - id: categorize
    command: inbox categorize --json
    stdin: $collect.stdout       # typed piping
  - id: approve
    command: inbox apply --approve
    approval: required           # hard halt, emits resumeToken
  - id: execute
    command: inbox apply --execute
    condition: $approve.approved
```

### Key Concepts
- LLM only for judgment at specific steps via `llm-task` plugin
- Typed JSON async generator streams (not text pipes)
- `approval: required` as first-class primitive — halts, emits resumeToken, resumes from exact step
- Runtime loop is pure `for` over stages (aligned with stateless reducer)
- Pi is OpenClaw's embedded agent runtime (RPC mode)

### Stealable
- Approval gate primitive (maps to our PAUSED state)
- Typed pipeline stages
- Deterministic routing philosophy

---

## Cross-Project Pattern Matrix

| Pattern | AoE | Overstory | Messenger | Shell | Tmux | Supervisor | OhMyPi | MC | Skills | Lobster |
|---------|-----|-----------|-----------|-------|------|------------|--------|----|--------|---------|
| Watchdog | on-demand | progressive | - | - | capture | LLM drift | - | - | - | - |
| Session registry | JSON file | SQLite WAL | file-based | - | semaphore | appendEntry | - | manifest | - | - |
| Guard/safety | - | 7-layer codegen | reservations | - | human-typing | - | - | - | - | approval |
| TUI dashboard | ratatui | - | overlay | - | - | widget | - | overlay | - | - |
| Worker isolation | worktree | worktree | per-agent dir | - | pane | - | FUSE+worktree | per-agent | - | - |
| Telemetry | - | SQLite metrics | feed.jsonl | - | - | appendEntry | - | audit.jsonl | - | - |
| Agent waking | - | nudge text | sendMessage+trigger | - | send-keys | sendUserMessage | - | - | - | - |
| Context monitoring | - | token polling | - | xterm buffer | context alert | getContextUsage | - | - | - | - |

---

## Top 10 Patterns to Implement

1. **ZFC principle** (overstory) — observable state overrides stored state
2. **Progressive escalation** (overstory) — warn → nudge → AI triage → terminate with time-gating
3. **pi.events bus** (pi-skills) — replace globalThis for cross-extension communication
4. **Context alert semaphore** (pi-tmux) — react to context fill before task completes
5. **remain-on-exit** (AoE) — panes survive command exit for crash forensics
6. **Quiet detection** (pi-interactive-shell) — emit only when output goes silent
7. **File-per-pane registry** (pi-tmux) — atomic, no JSON parse contention
8. **Snapshot-on-close** (pi-messenger) — inject crew state into context on TUI dismiss
9. **LLM drift detection** (pi-supervisor) — semantic analysis vs timer-based nudge
10. **FUSE overlay** (oh-my-pi) — filesystem-level worker isolation
