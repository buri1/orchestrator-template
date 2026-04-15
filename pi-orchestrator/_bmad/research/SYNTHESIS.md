# Research Synthesis — Actionable Architecture Decisions

> Synthesized from: indydevdan-patterns.md (599L) + pi-ecosystem-phase2.md (499L) + CMUX analysis (5 agents, 2026-03-14)
> Purpose: Answer the 8 architecture questions and produce a concrete implementation plan
> Date: 2026-03-12 (revised 2026-03-14 with CMUX)

---

## Q1: Watchdog Architecture — Which Hybrid?

**Our current approach**: Timer-based heartbeat (30s) → detect silence (120s) → nudge text → restart after 3 nudges.

**Research options**:
| Approach | Source | How it works | Cost |
|----------|--------|-------------|------|
| Timer + text nudge | Ours (supervisor.ts) | `setInterval` → capture-pane hash diff → send-keys nudge | $0 |
| Progressive escalation | Overstory | 4 levels with 60s time-gating: warn → nudge → AI triage → terminate | $0.01/triage |
| LLM drift detection | pi-supervisor | In-memory analysis session reads conversation, detects semantic drift | $0.02/check |
| On-demand only | Agent-of-Empires | No continuous watchdog at all — user triggers status checks | $0 |

**Decision: Progressive escalation (overstory), NOT LLM drift detection.**

Why:
- Our heartbeat already handles levels 0-1 (detect silence, send nudge). We just need levels 2-3.
- LLM drift detection (pi-supervisor) is elegant but expensive and over-engineered for our case. It creates an in-memory AgentSession per check — powerful for detecting *semantic* drift (agent going off-task), but our agents are Claude Code workers following explicit prompts. If they're producing output, they're on-task. If they're silent, they're stuck.
- Progressive escalation adds the missing pieces cheaply: **level 2** = one-shot AI triage via `pi --print --no-session --max-turns 1` asking "should I retry, terminate, or extend?", and **level 3** = hard kill. Both are already close to what we have (we do nudge + restart), but the 60s time-gating between levels prevents escalation storms.

**Implementation**:
```
Current supervisor.ts phases: stopped | starting | running | silent | nudging | stalled | crashed | paused

Add escalation level to state:
  escalationLevel: 0 | 1 | 2 | 3
  lastEscalationAt: number

Reducer logic changes:
  heartbeat + silent + escalation=0 → warn (log only, no action), escalation=1
  heartbeat + silent + escalation=1 + 60s elapsed → nudge text, escalation=2
  heartbeat + silent + escalation=2 + 60s elapsed → AI triage (new effect), escalation=3
  heartbeat + silent + escalation=3 + 60s elapsed → hard kill + restart
  heartbeat + new output → reset escalation to 0
```

**Skip**: LLM drift detection. Revisit only if we find agents going off-task while still producing output.

---

## Q2: State Management — JSON vs File-per-pane vs SQLite

**Our current approach**: Single `_bmad/session-registry.json` (read/write with `readFileSync`/`writeFileSync`).

**Research options**:
| Approach | Source | Concurrency safety | Complexity |
|----------|--------|-------------------|------------|
| Single JSON file | Ours | Race condition on concurrent writes | Minimal |
| File-per-pane | pi-tmux | Atomic (each pane writes own file) | Low |
| SQLite WAL | Overstory | Full ACID, concurrent reads + single writer | Medium |
| pi.appendEntry | pi-supervisor | Pi-native, survives fork/tree | Minimal |

**Decision: Keep single JSON, add ZFC principle. Skip file-per-pane and SQLite.**

Why:
- We have ONE writer (the supervisor extension) and ZERO concurrent writers. The session registry is only written by supervisor.ts in effect execution. Workers don't write to it. There's no contention problem to solve.
- File-per-pane (pi-tmux) solves a problem we don't have: multiple extensions writing to the same state. Their semaphore system is for a multi-extension architecture where each extension owns its pane state.
- SQLite WAL (overstory) is genuinely better for concurrent access, but adds bun:sqlite dependency and 50+ lines of schema management for no benefit at our scale (1 supervisor, 1-3 workers).

**But steal ZFC (Zero Failure Crash) principle**: Observable state (tmux pane liveness + PID checks) ALWAYS overrides what the JSON file says. We partially do this already in the heartbeat probe (`paneAlive`, `claudeRunning`), but we should be more explicit:

```typescript
// In heartbeat probe, BEFORE creating the event:
const actualPaneAlive = tmuxPaneExists(layout.orchestratorPaneId);
const actualPidAlive = processExists(registry.session?.panes?.orchestrator?.pid);

// If registry says "running" but pane is dead → force transition to "crashed"
// If registry says "stopped" but pane is alive → force transition to "running"
// Observable truth > stored state
```

**Also steal**: `pi.appendEntry()` for the activity log (replace `appendFileSync` to `agent-activity.jsonl`). It's Pi-native, queryable via `getBranch()`, and survives session fork/tree. Lower priority, but cleaner.

---

## Q3: TUI — Grid Cards vs Mission Control List

**Our current approach**: Simple text widget showing task + session ID + status (3 lines).

**Research options**:
| Pattern | Source | Layout | Best for |
|---------|--------|--------|----------|
| Grid cards | IndyDevDan agent-team.ts | Bordered cards in grid, 5 rows each | 2-6 agents |
| Mission Control list | EmZod pi-subagent-with-logging | Table rows with status columns | 10-100 agents |
| Crew overlay | pi-messenger | Full-screen modal on demand | Deep inspection |

**Decision: Grid cards (IndyDevDan) for the widget, with compact footer line.**

Why:
- We run 1 orchestrator + 1-3 workers = 2-4 agents max. Grid cards are perfect for this scale.
- Mission Control's tabular list optimizes for 10-100 agents — overkill and less visually informative at our scale.
- The crew overlay (pi-messenger) is a nice bonus for later — `ctx.ui.custom()` for full-screen inspection on demand.

**Implementation** (from agent-team.ts patterns):

Widget card (5 rows per agent):
```
┌──────────────────────────┐
│ ORCHESTRATOR             │  ← bold, accent color
│ ● running  0:04:23       │  ← status icon + elapsed
│ [########--] 80%         │  ← context bar (if available)
│ Reviewing PR #42...      │  ← last captured output (truncated)
└──────────────────────────┘
```

Column auto-sizing: `count <= 3 ? count : count === 4 ? 2 : 3` columns.

Footer (single line, always visible):
```
[supervisor] opus | running 0:04:23 | workers: 2/3 | [####----] 40% | Reviewing PR #42
```

Use `setInterval(1000)` for elapsed timer updates — independent of agent turns. Use `visibleWidth()` and `truncateToWidth()` from `@mariozechner/pi-tui` (already imported in supervisor.ts).

**Skip**: Overlay for now. Add later if we need deep inspection during live sessions.

---

## Q4: Scribe Implementation — Incorporate Pure Statistics?

**Our design**: Tier 1 (5min micro, Gemini Flash via antigravity) + Tier 2 (1hr/session-end, structured JSON for BI).

**Research insight from overstory**: Their "insights" module uses **pure statistics, zero LLM**:
- Tool workflow classification: count tool types, classify as read-heavy/write-heavy/bash-heavy/balanced
- Hot file detection: files with 3+ edits
- Error pattern analysis: regex on tool outputs

**Decision: Tier 1 = pure statistics (NO LLM). Tier 2 = LLM synthesis + structured JSON.**

Why:
- Overstory proved that the most actionable 5-minute insights are computational, not analytical. "Worker-1 edited auth.ts 7 times in 5 minutes" or "Context at 85%, 3 nudges sent" doesn't need an LLM — it needs `Object.entries(toolCounts).sort()`.
- Using Gemini Flash for Tier 1 was premature: it adds latency (1-3s), cost ($0.001/call × 12/hr = $0.012/hr), and a dependency on antigravity proxy being up. Pure statistics is instant, free, and deterministic.
- Tier 2 still benefits from LLM synthesis: consolidating 12 micro-reports into a coherent session narrative with anomaly detection IS a language task.

**Revised architecture**:

```
Tier 1 — Micro-Reports (every 5 min) — PURE STATISTICS
├── Read: _bmad/telemetry/YYYY-MM-DD.jsonl (from last offset)
├── Compute: tool counts, phase transitions, error patterns, hot files, context trend
├── Format: structured markdown (template-based, no LLM)
├── Write: _bmad/scribe-reports/micro/YYYY-MM-DD-HH-MM.md
└── Cost: $0, latency: <10ms

Tier 2 — Session Reports (every 1hr + session_shutdown) — LLM SYNTHESIS
├── Read: all Tier 1 micro-reports since last Tier 2
├── Invoke: pi --print --no-session --no-extensions --max-turns 1
│           --provider antigravity --model gemini-3-flash
│           "Synthesize these micro-reports into a session report: ..."
├── Parse: structured JSON output
├── Write: _bmad/scribe-reports/session/YYYY-MM-DD-HH-MM.json
└── Cost: ~$0.002/call, latency: 2-5s
```

**Also incorporate**: overstory's "mulch" composting concept for long-term expertise archival. After Tier 2 reports accumulate, a periodic `compact()` operation distills them into domain-specific learnings in `_bmad/scribe-reports/expertise/`. But this is v2 — not for initial implementation.

---

## Q5: Cross-Extension Comms — pi.events vs globalThis

**Our current approach**: `globalThis.__telemetry_log` in telemetry.ts for cross-extension access to the log function.

**Research**: pi-skills research discovered `pi.events` — an undocumented cross-extension event bus with `.on()` and `.emit()`.

**Decision: Use pi.events for new cross-extension communication. Migrate globalThis incrementally.**

Why:
- `pi.events` is the official (if undocumented) Pi mechanism for this exact purpose. It's semantically correct: we're emitting events, not sharing mutable global state.
- `globalThis` works but is fragile: name collisions, no typing, no cleanup on extension unload, invisible coupling.
- `pi.events` gives us: named channels, multiple listeners, proper lifecycle management.

**Implementation**:
```typescript
// telemetry.ts — emit events
pi.events.emit("telemetry:logged", { event, timestamp });

// supervisor.ts — listen
pi.events.on("telemetry:logged", (data) => { /* update scribe statistics */ });

// scribe.ts — listen
pi.events.on("telemetry:logged", (data) => { /* accumulate for micro-report */ });
```

**Migration**: Don't remove `globalThis.__telemetry_log` immediately. Add `pi.events.emit()` alongside it. Once all consumers are migrated, remove the globalThis reference. Zero-risk incremental migration.

**Caveat**: `pi.events` is undocumented. If it breaks in a Pi update, fall back to globalThis. But given it's used by pi-skills (781 stars, authored by Mario Zechner — Pi's creator), it's stable.

---

## Q6: Guard Extensions for Workers — Codegen?

**Research from overstory**: 7-layer guard chain generated per agent role. Blocks native team tools, interactive tools, write tools for non-implementation roles, path boundaries, bash danger patterns.

**Our current approach**: CLAUDE.md rules ("DU BIST KEIN ENTWICKLER") + `--dangerously-skip-permissions` on workers.

**Decision: Yes, but simplified. 3 layers, not 7. No codegen — static YAML rules.**

Why:
- Overstory's 7-layer codegen is for a complex multi-role system where each agent has different capabilities. We have 2 roles: supervisor (no code) and worker (writes code). Two rule sets, not seven.
- Codegen adds complexity we don't need: template rendering, file generation, runtime loading. IndyDevDan's `damage-control.ts` proves that static YAML rules loaded at startup are simpler and equally effective.
- The real value is the `tool_call` interception pattern, not the codegen.

**Implementation**: Use damage-control.ts pattern with YAML rules.

```yaml
# .pi/damage-control-rules.yaml (for workers)
bash_blocked:
  - pattern: "git push --force"
    reason: "Force push blocked — orchestrator handles merging"
  - pattern: "rm -rf /"
    reason: "Root deletion blocked"
  - pattern: "npm publish"
    reason: "Publishing blocked — requires human review"

path_blocked:
  - "~/.ssh/"
  - "~/.aws/"
  - "/etc/"
```

For the supervisor itself, `pi.setActiveTools([...supervisor tools only])` enforces delegation-only mode (from IndyDevDan's agent-team.ts). This is the Pi-native equivalent of "DU BIST KEIN ENTWICKLER."

---

## Q7: Context Management — Alert + Polling?

**Research options**:
| Pattern | Source | Mechanism |
|---------|--------|-----------|
| Context alert semaphore | pi-tmux | Release lock at threshold → supervisor reacts |
| getContextUsage() polling | pi-supervisor | Poll in agent_end hook |
| Context bar in footer | IndyDevDan | Visual indicator only |

**Decision: Polling in agent_end + scribe Tier 1 tracking. Skip semaphore.**

Why:
- The semaphore pattern (pi-tmux) is elegant but designed for multi-extension coordination where one extension blocks on another. We have a single supervisor that already probes on heartbeat.
- `ctx.getContextUsage()` in the `agent_end` hook is simpler and gives us what we need: react after each supervisor turn if context exceeds threshold.
- The scribe Tier 1 micro-report already tracks context trend from telemetry data. This gives us ambient awareness without extra polling.

**Implementation**:
```typescript
// In supervisor.ts, add to heartbeat probe or agent_end hook:
const usage = ctx.getContextUsage();
if (usage && usage.percent >= 80) {
  // Inject into widget: context warning
  // At 90%: auto-trigger session compact or handoff
}
```

**Context thresholds**:
- 70%: yellow indicator in widget
- 80%: orange, log warning
- 90%: red, auto-trigger compact/handoff preparation
- 95%: force stop orchestrator, persist state for resume

---

## Q8: Worker Isolation — FUSE vs Worktrees?

**Research options**:
| Pattern | Source | Isolation level | Complexity |
|---------|--------|----------------|------------|
| FUSE overlay | oh-my-pi | Filesystem-level COW | High (Rust, macOS FUSE) |
| Git worktrees | AoE, overstory | Branch-level isolation | Medium |
| Per-pane directory | pi-messenger | Directory-level | Low |
| Nothing (shared repo) | Ours currently | None | Zero |

**Decision: Not now. Revisit when we have >1 worker editing the same repo.**

Why:
- FUSE overlay is technically beautiful but requires macOS FUSE (macfuse) which needs kernel extension approval, adds a Rust build dependency, and is overkill for 1-3 workers.
- Git worktrees are the right eventual answer: each worker gets `../project-worktrees/feature-123/`, writes code there, creates PR from worktree branch. AoE's template `"../\{repo-name\}-worktrees/\{branch\}"` is the pattern to follow.
- But RIGHT NOW, our workers operate on different repos (Lagerlink, CityHub, etc.), not the same repo. There's no isolation problem to solve yet.

**When to revisit**: When we have 2+ workers editing the same project simultaneously. Then steal AoE's worktree template pattern.

**Do steal now**: `remain-on-exit` on worker pane creation. This is zero-cost and invaluable: when a worker crashes, the pane stays for forensics instead of vanishing.

```bash
# In spawn_worker function (pane-workers.sh):
tmux set-option -t "$PANE_ID" remain-on-exit on
```

---

## Implementation Priority — Ordered by Impact/Effort

| # | What | Impact | Effort | Source |
|---|------|--------|--------|--------|
| 1 | Progressive escalation in reducer | HIGH — eliminates restart storms | ~30 LOC | Overstory |
| 2 | ZFC principle in heartbeat probe | HIGH — eliminates stale state bugs | ~15 LOC | Overstory |
| 3 | Agent grid cards widget | MEDIUM — operator visibility | ~80 LOC | IndyDevDan |
| 4 | Scribe Tier 1 (pure stats) | MEDIUM — ambient awareness | ~60 LOC | New + Overstory insights |
| 5 | remain-on-exit on workers | LOW effort, HIGH value — crash forensics | 1 LOC | AoE |
| 6 | pi.events bus migration | MEDIUM — cleaner architecture | ~20 LOC | pi-skills |
| 7 | Tool restriction (setActiveTools) | MEDIUM — enforces delegation | 1 LOC | IndyDevDan |
| 8 | Scribe Tier 2 (LLM synthesis) | MEDIUM — BI data pipeline | ~40 LOC | New design |
| 9 | Damage control YAML rules | LOW — safety net for workers | ~30 LOC + YAML | IndyDevDan |
| 10 | Context threshold alerts | LOW — proactive context management | ~15 LOC | pi-tmux + pi-supervisor |

**First implementation batch** (items 1-5): ~186 LOC added to supervisor.ts + 1 line in pane-workers.sh. These are the highest-impact changes with the lowest risk.

**Second batch** (items 6-10): ~105 LOC. These are architectural improvements that can be done incrementally.

---

## Patterns Explicitly REJECTED

| Pattern | Source | Why rejected |
|---------|--------|-------------|
| LLM drift detection | pi-supervisor | Too expensive for timer-detectable problems |
| SQLite WAL state | Overstory | Over-engineered for single-writer scenario |
| FUSE overlay | oh-my-pi | macOS FUSE dependency, workers use different repos |
| File-per-pane registry | pi-tmux | Solves multi-writer problem we don't have |
| Mission Control table | EmZod | Optimized for 10-100 agents, we have 2-4 |
| Guard codegen | Overstory | Static YAML rules sufficient for 2 roles |
| Semaphore registry | pi-tmux | Heartbeat polling is simpler for single supervisor |
| PTY-in-extension | pi-interactive-shell | We use tmux (already have PTY management) |
| Mulch composting | Overstory | V2 feature — needs Tier 2 data first |
| Lobby pattern | pi-messenger | Pre-warming workers when we spawn on-demand |

---

## Summary: What We're Stealing

From **Overstory**: ZFC principle, progressive escalation, pure-statistics insights
From **IndyDevDan**: Agent grid cards, tool restriction, damage-control YAML, JSONL streaming
From **Agent-of-Empires**: remain-on-exit, worktree template (future)
From **pi-skills**: pi.events bus, undocumented Pi APIs
From **pi-supervisor**: agent_end context checking pattern
From **pi-tmux**: Context alert thresholds

Total: 10 patterns adopted, 10 explicitly rejected with reasons.

---

*Next step: implement batch 1 (items 1-5) in supervisor.ts + pane-workers.sh*

---

## CMUX REVISION (2026-03-14) — Terminal Layer Replacement

> Analyzed by 6 agents (1 exploration + 5 specialized): stack migration, socket API, browser automation, notifications+TUI, worker isolation+worktrees.
> Key discovery: CMUX collapses Ghostty + tmux + custom notification scripts + Chrome DevTools MCP into one native macOS app.

### What Is CMUX?

**manaflow-ai/cmux** — native macOS terminal (Swift/AppKit on libghostty), 5,305 stars in 6 weeks. Purpose-built for parallel AI coding agent sessions. AGPL-3.0.

- **4-level hierarchy**: Window → Workspace → Pane → Surface (stable UUID handles, never reused)
- **80+ method JSON-RPC v2 Unix socket API** at `/tmp/cmux.sock`
- **`cmux claude-teams`** — zero-migration Claude Code agent teams with tmux shim
- **Embedded WebKit browser** (ported from Vercel's agent-browser) with Snapshot+Refs API
- **Notification rings** — blue pane borders, sidebar badges, macOS desktop alerts
- **Sidebar metadata** — `set-status`, `set-progress`, `log` per workspace
- **Environment injection** — `CMUX_WORKSPACE_ID`, `CMUX_SURFACE_ID`, `CMUX_SOCKET_PATH` auto-injected
- **Reads existing `~/.config/ghostty/config`** — zero terminal reconfiguration

### Impact on Prior Decisions

| Question | Original Decision | CMUX Revision |
|----------|------------------|---------------|
| Q2 (State) | ZFC via tmux liveness checks | ZFC via `surface.list` — UUID handles never reuse, more reliable than tmux `%N` IDs |
| Q3 (TUI) | Grid cards, data from tmux capture-pane | **Adaptive widget**, data from `cmux sidebar-state` (workers self-report via pi-cmux) |
| Q5 (Comms) | pi.events replaces globalThis | Unchanged — pi.events is Pi-internal, cmux is terminal-level. Orthogonal. |
| Q6 (Guards) | YAML-per-role + setActiveTools | Unchanged — guard rules are Pi-level, not terminal-level |
| Q7 (Context) | Skip semaphores, use heartbeat polling | **Use pi.events for context alerts** (workers emit `worker:context_alert`). Supplement with `cmux wait-for` when it ships. |
| Q8 (Isolation) | "Not now" | **Now.** `claude --worktree <branch>` + CMUX workspace = atomic isolated spawn for 9 agents |

### Q3 Revised: TUI with CMUX

**Two layers, not one:**

1. **CMUX sidebar** (always visible) — per-workspace status pills, progress bars, notification rings. Workers self-report via `pi-cmux` extension. Human operator sees at-a-glance status without opening any terminal.
2. **Pi TUI widget** (inside supervisor terminal) — aggregate dashboard of ALL workers. Adaptive: grid cards at 1-3 agents, Mission Control table at 4-9 agents. Data source changes from `tmux capture-pane` to `cmux sidebar-state` socket reads.

**Drop**: Ghostty AppleScript notifications entirely. `cmux notify` is the correct primitive.

**Add**: Supervisor sidebar pills — `cmux set-status --key "phase" --value "running"`, `cmux set-progress 0.67`.

### Q8 Revised: Worker Isolation with Worktrees

**Lifecycle in CMUX + worktrees:**

```
SPAWN:
  git worktree add "../repo-worktrees/worker-${EPOCH}-task-${ID}" -b "worker-${EPOCH}-task-${ID}"
  WORKSPACE=$(cmux new-workspace --cwd "../repo-worktrees/..." --json | jq -r '.ref')
  cmux send --workspace "$WORKSPACE" "claude --dangerously-skip-permissions"

WORK:
  Worker writes code in isolated worktree (no other agent touches this branch)
  Supervisor monitors via cmux read-screen + sidebar-state

HARVEST:
  cmux wait-for "worker-${ID}-done" --timeout 1800  (or notification polling interim)
  Validate: git status + gh pr list

CLEANUP:
  cmux close-workspace --workspace "$WORKSPACE"
  git worktree remove --force "../repo-worktrees/..."
  git worktree prune
```

**Key pattern stolen from craigsc/cmux**: `.cmux/setup` hook — per-project script that runs on every new worktree (symlinks `.env`, runs `npm install`, runs codegen). Without this, every worktree spawn requires manual setup.

**Epoch naming** (`worker-${EPOCH}-task-${ID}`) eliminates branch exclusivity locks entirely.

### Browser: CMUX Replaces Chrome DevTools MCP for E2E Gate

**For the mandatory E2E gate** (INC-014/INC-015):
- `cmux browser snapshot --interactive` → accessibility tree with refs (e1, e2)
- `cmux browser click e1`, `cmux browser fill e2 "value"`
- `--snapshot-after` returns post-action state in same response
- WebKit renders Next.js/Tailwind identically for functional E2E

**Keep Chrome DevTools MCP for**: network request inspection (CMUX's only hard gap — P0 TODO), performance profiling, deep debugging.

### Stack Migration: ~9-11 Hours

| Phase | What | Effort |
|-------|------|--------|
| 0 | Validate: install cmux, test CLI commands | 1 hour |
| 1 | run.sh: tmux → cmux workspace/surface creation | 2-3 hours |
| 2 | supervisor.ts: I/O layer (5 functions, ~25 call sites). Reducer untouched. | 3-4 hours |
| 3 | pane-workers.sh: ~12 tmux calls → cmux | 2 hours |
| 4 | Notifications: drop Ghostty AppleScript, use cmux notify | 1 hour |
| 5 | Session persistence: verify supervisor.ts auto-resume works | 1 hour |

**cmux-client.ts already written** at `extensions/cmux-client.ts` — typed socket API wrapper with `CmuxSession`, `heartbeatProbeViaSocket()`, `spawnWorkerSurface()`, `detectRuntime()`.

### Gaps to Watch (v0.62, 2026-03)

| Feature | Status | Workaround |
|---------|--------|------------|
| `pipe-pane` | Listed in tmux compat, zero code hits | Use `readScreen()` polling (existing approach) |
| `wait-for` | Same status | Use notification polling via `pollForCompletion()` |
| `debug.terminal.read_text` | Planned socket method | CLI `cmux read-screen` fallback (in cmux-client.ts) |
| Session persistence (live process restore) | Open issue #1192 | supervisor.ts already handles crash-restart from state files |
| Network inspection in browser | P0 TODO (per-WKWebView proxy) | Keep Chrome DevTools MCP for network/API testing |

### Pi Integration: pi-cmux

`sasha-computer/pi-cmux` (MIT, 10 stars) — install via `pi install npm:pi-cmux`:
- **cmux-notify**: auto-notifications on `agent_end` with context-aware body
- **cmux-split**: create Pi sessions in adjacent panes (`/cmv`, `/cmh`)
- Sidebar status pills (model, state, context usage)
- `CmuxClient` pattern — persistent Unix socket, auto-reconnect

Install on workers for self-reporting. Build supervisor-level aggregation on top.

### Revised Implementation Priority (with CMUX)

| # | What | Impact | Effort | Source |
|---|------|--------|--------|--------|
| 0 | **CMUX migration** (run.sh + supervisor.ts I/O + pane-workers.sh) | CRITICAL — foundation for everything else | ~9-11 hrs | CMUX |
| 1 | Progressive escalation in reducer | HIGH | ~30 LOC | Overstory |
| 2 | ZFC reconciliation via `surface.list` | HIGH | ~30 LOC | Overstory + CMUX |
| 3 | Adaptive TUI widget (cards + table) + cmux sidebar pills | MEDIUM | ~100 LOC | IndyDevDan + EmZod + CMUX |
| 4 | Worker isolation (worktrees + CMUX workspaces) | HIGH — enables 9 agents | ~50 LOC + bash | CMUX + AoE |
| 5 | Scribe Tier 1 (pure stats) | MEDIUM | ~60 LOC | Overstory insights |
| 6 | CMUX browser E2E gate | MEDIUM — replaces Chrome MCP dependency | ~20 LOC | CMUX |
| 7 | pi.events bus + context alerts | MEDIUM | ~20 LOC | pi-skills + CMUX |
| 8 | YAML-per-role guard rules | LOW | ~30 LOC + YAML | IndyDevDan + Overstory |
| 9 | Scribe Tier 2 (LLM synthesis) | MEDIUM | ~40 LOC | New design |
| 10 | Tool restriction (setActiveTools) | MEDIUM | 1 LOC | IndyDevDan |

**CMUX migration is now item #0 — everything else builds on it.**
