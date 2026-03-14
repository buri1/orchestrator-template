# L-Thread Orchestrator — Development Log

> **Project**: L-Thread Orchestrator (multi-agent code orchestration system)
> **Author**: Burak Smac + Claude Opus 4.5/4.6
> **Period**: 2026-02-01 → 2026-03-14 (42 days, 34 commits)
> **Status**: Live-tested, building production apps (OmniPort-HH)

---

## What Is This

An autonomous multi-agent orchestration system that coordinates AI coding agents to build software. One supervisor agent (GPT-5.4 via Pi) watches one orchestrator agent (Claude Opus via Claude Code) which spawns worker agents to write code in parallel. The supervisor never writes code — it only monitors, nudges, and restarts.

**Key numbers:**
- 34 commits across 42 days
- supervisor.ts grew from 774 lines to ~2,400 lines
- 15 registered tools (10 supervisor + 5 BMAD workflow)
- 23 documented bugs/incidents across 3 eras
- 192 knowledge catalogue entries built with the system itself
- First production use: OmniPort-HH (72 stories, 13 epics, 5 waves)

---

## Architecture Evolution (6 Phases)

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
Prompt     tmux       Pi Agent   cmux       Stateless   BMAD Waves
Loop       Sessions   Extension  Migration  Reducer
```

### Phase 1 — Pure Prompt Engineering (Feb 1)

The entire system is markdown. `.claude/agents/orchestrator.md` is a Claude Code custom agent that runs a loop: `GET_STORY → SPAWN_DEV → WAIT_PR → REVIEW → MERGE → E2E_TEST → DONE → LOOP`. Workers are Conduit CLI panes (`pane-split`, `terminal-write`, `terminal-wait`).

**Breakthrough:** SessionStart hook (`1617582`) — injects orchestrator state into context after every compaction. The orchestrator survives crashes without spawning new agents.

### Phase 2 — Tmux Sessions (Feb 16)

Workers become independent tmux sessions (separate OS processes). Crash protection: tmux sessions survive terminal crashes. Event-driven waiting via `tmux wait-for` + latch files. No polling. Zero CPU while waiting.

**Key trick:** `unset CLAUDECODE` before launching nested Claude Code instances — the env var blocks nested sessions.

### Phase 3 — Pi Agent Integration (Mar 12)

Pi (`@mariozechner/pi-coding-agent`) replaces the Conduit CLI as the execution harness. TypeScript extensions register tools directly into the agent's toolset via `registerTool()`. The supervisor runs as a Pi extension with `setInterval` heartbeats — same process, no IPC.

**The split:** Pi's LLM is NOT the orchestrator — it's the supervisor/watchdog. Claude Opus runs in a terminal pane as the orchestrator. Pi provides deterministic infrastructure.

### Phase 4 — cmux Migration (Mar 14)

cmux (manaflow-ai/cmux) replaces tmux. Native macOS terminal on libghostty. Clean text output (no ANSI), no copy-mode issues, desktop notifications, embedded browser API. Two live bugs fixed: `cmux send` doesn't press Enter (separate `send-key Enter` required), `new-split` output must be regex-parsed.

### Phase 5 — Stateless Reducer (Mar 12-14)

Core monitoring logic refactored as a pure function: `reduce(state, event, config, layout) → [newState, effects[]]`. No I/O inside the reducer. All side effects are data. Enables: replay, testing, time-travel.

**Screen parser** (`parseScreen()`) — deterministic regex-based activity detection. 40/40 tests. Detects: idle, working, thinking, tool_calling, error. Feeds into smart nudge logic that skips interruptions during active work.

### Phase 6 — BMAD Workflow Orchestration (Mar 14)

5 tools for wave-based parallel story execution. Max 4 concurrent workers (DeepMind coordination overhead exponent 1.724). Workers signal completion via latch files. TUI widget shows progress bar and per-story icons.

---

## Timeline

| Date | Milestone | Commit |
|------|-----------|--------|
| Feb 01 | Project inception, Conduit-based L-Thread pattern | `c3e90b7` |
| Feb 01 | SessionStart hook — crash-resistant context injection | `1617582` |
| Feb 07 | **v2.0.0** — Custom Agent architecture, Conduit + Teams modes | `a49a337` |
| Feb 16 | Tmux mode — crash protection via persistent sessions | `682e025` |
| Mar 08 | Knowledge catalogue — 192 entries via multi-agent pipelines | `bf64008` |
| Mar 12 | Pi Agent orchestrator — 4 TypeScript extensions | `593ee49` |
| Mar 12 | **Supervisor/Orchestrator split** — Pi as watchdog | `b3a7a9e` |
| Mar 12 | Stateless reducer (12 Factor Agents) | `4150a60` |
| Mar 12 | First live test — 8 incidents, 9 fixes | `588b467` |
| Mar 14 | cmux migration — native macOS terminal layer | `915ec76` |
| Mar 14 | BMAD workflow — 5 tools, wave-based parallel dev | `eefb379` |
| Mar 14 | Screen parser — activity-aware smart nudging (40/40 tests) | `bcd3757` |
| Mar 14 | Workspace scoping fix — phantom window prevention | uncommitted |
| Mar 14 | **First production run** — OmniPort-HH Story 1.1 built + PR | live |

---

## Full Commit Log

| # | Hash | Date | Description |
|---|------|------|-------------|
| 01 | `c3e90b7` | 2026-02-01 | Initial commit: L-Thread Orchestrator Template |
| 02 | `1617582` | 2026-02-01 | feat: Robust context persistence via SessionStart hook |
| 03 | `00e7ccf` | 2026-02-01 | docs: ADWO synthesis plan and handoff prompt |
| 04 | `7e40472` | 2026-02-01 | docs: Structured events architecture (stream-json) |
| 05 | `a49a337` | 2026-02-07 | **feat: v2.0 — Custom Agent, Teams, Roadblock Recovery** [TAG: v2.0.0] |
| 06 | `03eeea3` | 2026-02-16 | Multi-agent orchestration deep comparison doc |
| 07 | `682e025` | 2026-02-16 | feat: tmux session persistence as crash-protection layer |
| 08 | `751619c` | 2026-02-16 | docs: tmux mode README |
| 09 | `d04c254` | 2026-02-16 | fix(tmux): prioritize tmux over teams mode |
| 10 | `d359739` | 2026-03-08 | feat: knowledge catalogue system |
| 11 | `eb78e43` | 2026-03-08 | feat: /ingest-bookmarks + deeper pipeline |
| 12 | `9fbfd18` | 2026-03-08 | feat: catalogue entries, overseer agent, ui-review |
| 13 | `69c569d` | 2026-03-08 | feat: 27 new catalogue entries from research |
| 14 | `ed30058` | 2026-03-08 | feat: 73 structured entries from 126 research docs |
| 15 | `bf64008` | 2026-03-08 | feat: 85 tool entries via 3-wave pipeline (25 agents) |
| 16 | `6d529de` | 2026-03-08 | feat: conference talk entries, planning artifacts |
| 17 | `47d2232` | 2026-03-11 | feat: 28+ new catalogue entries |
| 18 | `3f66fca` | 2026-03-11 | docs: Ghostty notification setup |
| 19 | `7760ee0` | 2026-03-11 | docs: rewrite notification guide |
| 20 | `deed12a` | 2026-03-11 | docs: Codex CLI hooks + clipboard integration |
| 21 | `a122311` | 2026-03-11 | feat: agent-watch clipboard copy |
| 22 | `cfe9e8e` | 2026-03-11 | fix: remove clipboard from Claude Code hook |
| 23 | `86daa47` | 2026-03-11 | docs: clipboard limitations per agent |
| 24 | `971aa3d` | 2026-03-12 | feat: event-driven notification system |
| 25 | `593ee49` | 2026-03-12 | feat: Pi Agent orchestrator — 4 TypeScript extensions |
| 26 | `b3a7a9e` | 2026-03-12 | **feat: supervisor mode — Pi as watchdog over Claude Opus** |
| 27 | `3da0827` | 2026-03-12 | feat: multi-source ingest pipeline, Sonnet default |
| 28 | `4150a60` | 2026-03-12 | feat: stateless reducer, telemetry, pane layout |
| 29 | `588b467` | 2026-03-12 | feat: session registry, pause/resume, hard kill |
| 30 | `42f3256` | 2026-03-12 | docs: Pi ecosystem research — 10 deep-dives |
| 31 | `915ec76` | 2026-03-14 | feat: cmux migration — tmux → native macOS terminal |
| 32 | `eefb379` | 2026-03-14 | feat: BMAD workflow — 5 tools, wave state, TUI |
| 33 | `bcd3757` | 2026-03-14 | fix: cmux send/split bugs + screen parser |
| 34 | `6deff3b` | 2026-03-14 | fix: registry scope in pure reducer |

---

## Bug & Incident Registry (23 total)

### Pi Orchestrator Era (INC-001 through INC-008)

| ID | Issue | Status |
|----|-------|--------|
| INC-001 | Pi defaulted to amazon-bedrock instead of anthropic | Fixed: `--provider openai-codex` in run.sh |
| INC-002 | gpt-5.4 routed to azure-openai-responses after /login | Fixed: explicit `--provider` flag |
| INC-003 | GPT-5.4 read docs instead of calling supervisor_start | Partial: needs prompt fix |
| INC-004 | Pi v0.56.1 missing gpt-5.4 model | Fixed: `pi --list-models` pre-flight guard |
| INC-005 | tmux copy mode blocked send-keys | Fixed: irrelevant after cmux migration |
| INC-006 | Orchestrator resumed wrong terminal's conversation | **Open**: needs `-p` flag at launch |
| INC-007 | supervisor_stop didn't kill Claude Code | Fixed: hard_kill after 3s (`588b467`) |
| INC-008 | Orchestrator spawned invisibly | Fixed: session registry (`588b467`) |

### cmux Migration Bugs (CMUX-BUG-01 through 05)

| ID | Issue | Status |
|----|-------|--------|
| CMUX-01 | new-split returns "OK surface:N workspace:M" | Fixed: regex extraction (`bcd3757`) |
| CMUX-02 | send doesn't press Enter | Fixed: separate send-key Enter (`bcd3757`) |
| CMUX-03 | registry scope in pure reducer | Fixed: use s.task (`6deff3b`) |
| CMUX-04 | Phantom window from missing workspace scoping | Fixed: `--workspace` on all cmux calls |
| CMUX-05 | Google Antigravity const schema | Abandoned: provider incompatible |

### L-Thread Conduit Era (L-INC-001 through L-INC-015)

| ID | Issue | Status |
|----|-------|--------|
| L-001 | postgres.js prepare:false for serverless | Fixed |
| L-002 | Zod schema drift from TypeScript types | Fixed |
| L-004 | Tests pass locally, fail on deploy | Fixed |
| L-007 | XSS via rehype-raw | Fixed: rehype-sanitize |
| L-009 | N+1 queries | Fixed: JOINs |
| L-011 | Pagination LIMIT/OFFSET | Fixed |
| L-013 | Chrome DevTools MCP instability | Fixed: retry logic |
| L-014 | **E2E tests skipped — tasks marked Done** | Fixed: structural gate in v2.0 |
| L-015 | **Workflow ordering: merge before test** | Fixed: explicit ordering in v2.0 |

---

## Key Architectural Decisions

### 1. "DU BIST KEIN ENTWICKLER" — Orchestrator never writes code
Not performance — correctness. Mixing coordination and implementation leads to skipped reviews and E2E gates. Hard rule forces clean separation.

### 2. E2E as structural gate (INC-014/015)
The orchestrator loop has `E2E_TEST` between `MERGE` and `DONE`. Not optional. Not a suggestion. A gate.

### 3. Event-driven waiting, never sleep
`conduit terminal-wait` → `tmux wait-for` → latch file polling. The one accepted sleep: 15s after Claude Code launch for UI init.

### 4. Max 4 parallel agents
DeepMind coordination overhead exponent 1.724. Beyond 4 agents, coordination cost exceeds throughput gain. Human review ceiling: 5-6 PRs/day.

### 5. Pi Extension API over Claude Code MCP
Same-process heartbeats (no IPC), TUI widgets, lifecycle hooks, multi-provider support. MCP reserved for browser automation (Chrome DevTools).

### 6. Workspace scoping for cmux
All cmux commands use `--workspace <UUID>`. Surface short refs (`surface:N`) are workspace-scoped. Without explicit workspace targeting, cmux may create phantom windows.

---

## Detailed Research Files

For deep dives, see the research files generated by 4 parallel Sonnet agents:

- [`_bmad/devlog-research-history.md`](./_bmad/devlog-research-history.md) — Full 34-commit chronology with evolution phases
- [`_bmad/devlog-research-architecture.md`](./_bmad/devlog-research-architecture.md) — 6-phase architecture evolution, Claude Code MCP vs Pi Extension comparison
- [`_bmad/devlog-research-features.md`](./_bmad/devlog-research-features.md) — All 15 tools, screen parser, smart nudge, TUI widget, BMAD wave lifecycle
- [`_bmad/devlog-research-bugs.md`](./_bmad/devlog-research-bugs.md) — All 23 incidents with root cause, fix, and lessons learned

---

## Stack

| Layer | Technology |
|-------|------------|
| Supervisor | Pi Agent (`@mariozechner/pi-coding-agent`) + GPT-5.4 (OpenAI Codex) |
| Orchestrator | Claude Code + Claude Opus 4.6 (1M context) |
| Terminal | cmux (manaflow-ai/cmux) — native macOS on libghostty |
| Extension | TypeScript (supervisor.ts ~2400L, telemetry.ts, cmux-client.ts) |
| Schema | TypeBox (`@sinclair/typebox`) for Pi tool parameters |
| TUI | `@mariozechner/pi-tui` for supervisor widget |
| State | JSON files (reducer state, layout, registry, wave state) |
| Telemetry | JSONL (daily rotation + append-only activity log) |
| Architecture | Stateless reducer: `reduce(state, event, config, layout) → [newState, effects[]]` |

---

*Generated 2026-03-14 by 4 parallel Sonnet research agents + Claude Opus 4.6 compiler.*
