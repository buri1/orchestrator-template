# Orchestrator Project — Full Git History & Evolution

> Written: 2026-03-14
> Source: `git log --all --format="%h %ai %s" --reverse`
> Branch: `master` (single linear history, no merges)
> Tags: `v2.0.0` → commit `a49a337`
> Remotes: `origin/main`, `origin/master`

---

## Chronological Commit Log

| # | Hash | Date | Description |
|---|------|------|-------------|
| 01 | `c3e90b7` | 2026-02-01 01:53 | Initial commit: L-Thread Orchestrator Template |
| 02 | `1617582` | 2026-02-01 02:12 | feat: Robust context persistence via SessionStart hook |
| 03 | `00e7ccf` | 2026-02-01 02:48 | docs: Add ADWO synthesis plan and handoff prompt |
| 04 | `7e40472` | 2026-02-01 20:46 | docs: Add structured events architecture (stream-json) |
| 05 | `a49a337` | 2026-02-07 14:50 | feat: v2.0 - Custom Agent architecture with Tiered Context, Teams support, and Roadblock Recovery **[TAG: v2.0.0]** |
| 06 | `03eeea3` | 2026-02-16 18:43 | Add multi-agent orchestration deep comparison doc |
| 07 | `682e025` | 2026-02-16 20:28 | feat: add tmux session persistence as crash-protection layer |
| 08 | `751619c` | 2026-02-16 20:50 | docs: add tmux mode to README per-project setup and usage |
| 09 | `d04c254` | 2026-02-16 22:37 | fix(tmux): prioritize tmux mode over teams mode, add worker spawning docs |
| 10 | `d359739` | 2026-03-08 00:55 | feat: add knowledge catalogue system with templates, slash commands, and research docs |
| 11 | `eb78e43` | 2026-03-08 01:59 | feat: add /ingest-bookmarks command and deepen ingest pipeline |
| 12 | `9fbfd18` | 2026-03-08 01:59 | feat: add catalogue entries, overseer agent, ui-review command, and cleanup drafts |
| 13 | `69c569d` | 2026-03-08 02:16 | feat: massive catalogue expansion — 27 new entries from research conversion |
| 14 | `ed30058` | 2026-03-08 09:50 | feat: convert 126 research docs into 73 structured catalogue reference entries |
| 15 | `bf64008` | 2026-03-08 10:46 | feat: add 85 tool catalogue entries via 3-wave extraction pipeline (25 agents) |
| 16 | `6d529de` | 2026-03-08 17:55 | feat: add conference talk catalogue entries, planning artifacts, and research index updates |
| 17 | `47d2232` | 2026-03-11 12:54 | feat: add new catalogue entries, articles, posts, and research updates |
| 18 | `3f66fca` | 2026-03-11 15:00 | docs: add Ghostty task-finish notification setup guide |
| 19 | `7760ee0` | 2026-03-11 15:02 | docs: rewrite ghostty notification as step-by-step setup guide |
| 20 | `deed12a` | 2026-03-11 20:12 | docs: add Codex CLI hooks + clipboard/Maccy integration |
| 21 | `a122311` | 2026-03-11 20:19 | feat: agent-watch now copies last response to clipboard |
| 22 | `cfe9e8e` | 2026-03-11 20:21 | fix: remove clipboard copy from Claude Code hook |
| 23 | `86daa47` | 2026-03-11 20:29 | docs: clarify clipboard limitations per agent |
| 24 | `971aa3d` | 2026-03-12 10:28 | feat: event-driven notification system for Ghostty 1.3 + tmux |
| 25 | `593ee49` | 2026-03-12 10:47 | feat: Pi Agent orchestrator — replaces Conduit with tmux + event-driven wait |
| 26 | `b3a7a9e` | 2026-03-12 11:03 | feat: supervisor mode — Pi as deterministic watchdog over Claude Opus orchestrator |
| 27 | `3da0827` | 2026-03-12 13:51 | feat: multi-source ingest pipeline with discovery sidecars and Sonnet default |
| 28 | `4150a60` | 2026-03-12 17:15 | feat: stateless reducer architecture, telemetry extension, pane-based tmux layout |
| 29 | `588b467` | 2026-03-12 20:50 | feat: supervisor mode — session registry, pause/resume, hard kill, research docs |
| 30 | `42f3256` | 2026-03-12 21:16 | docs: phase 2 Pi ecosystem research — 10 deep-dive project analyses |
| 31 | `915ec76` | 2026-03-14 13:51 | feat: cmux migration — replace tmux I/O layer in Pi supervisor |
| 32 | `eefb379` | 2026-03-14 14:02 | feat: BMAD workflow orchestration — 5 new tools, wave state, TUI progress |
| 33 | `bcd3757` | 2026-03-14 17:45 | fix: cmux send/split bugs + screen state parser for smart nudging |
| 34 | `6deff3b` | 2026-03-14 18:04 | fix: registry not in scope in pure reducer — use s.task instead |

**Total: 34 commits across 42 days (2026-02-01 → 2026-03-14)**

---

## Branch & Tag Structure

- **Single branch**: `master` (HEAD at `6deff3b`)
- **Remote**: `origin/master` and `origin/main` both exist
- **Tag**: `v2.0.0` lightweight tag pointing at `a49a337` (the Custom Agent rearchitecture commit, Feb 7)
- No feature branches, no merge commits — pure linear history

---

## Evolution Phases

### Phase 1 — Foundation & Hooks (2026-02-01, commits 01–04)
**Duration**: Single day (4 commits in ~19 hours)

The project starts as a direct port of IndyDevDan's L-Thread Orchestrator pattern. Core concepts established on day one:

- `c3e90b7`: Initial template — Conduit CLI agent spawning, BMAD Framework integration, PreCompact hook for context preservation, auto-mode, roadblock handling. Co-authored by Claude Opus 4.5. Files include `.claude/commands/orchestrator.md`, `.bmad/scripts/orchestrator-handoff.sh`, setup scripts.
- `1617582`: Critical architectural insight — move from PreCompact-based agent spawning to **SessionStart hook** for deterministic context injection. `CLAUDE.md` with 4 absolute rules. `orchestrator-session-start.sh` injects rules + state via `additionalContext` after every compaction. Eliminates spawn-on-compaction entirely.
- `00e7ccf`: ADWO synthesis — planned integration of CLI orchestrator as ADWO backend. Event Bridge via `terminal-read`. Architecture doc + handoff prompt.
- `7e40472`: Stream-JSON architecture discovery — `--output-format stream-json` as cleaner alternative to terminal-read for observability. Verified live; structured NDJSON events for tools, hooks, costs.

**Key milestone**: SessionStart hook pattern (`1617582`) — this is the breakthrough that makes the orchestrator crash-resistant without requiring new agent spawns on compaction.

---

### Phase 2 — v2.0 Custom Agent Architecture (2026-02-07, commit 05)
**Duration**: 1 commit, 6 days after Phase 1

- `a49a337` **(TAG: v2.0.0)**: Major rearchitecture. Orchestrator moves from a single `.claude/commands/orchestrator.md` monolith into a **Custom Agent** (`/.claude/agents/orchestrator.md`) with a tiered context system (Tier 0 = rules, Tier 1 = current state, Tier 2 = templates/patterns). Adds dual-mode support:
  - **Conduit mode**: `terminal-write` / `terminal-wait` / `pane-split`
  - **Teams mode**: `Task` tool + `SendMessage` (parallel agents)
  - **Roadblock Recovery** command with FutureLearnings incident database
  - `setup.sh` for global `~/.claude/` installation
  - `CHANGELOG.md` starts
  - 1,710 insertions, 1,068 deletions — the biggest single-commit change in the project

**Files changed**: `.claude/agents/orchestrator.md` (407 lines, new), `.claude/commands/orchestrator-teams.md` (298 lines, new), `.claude/commands/roadblock-recovery.md` (175 lines, new), `orchestrator.md` command slimmed from monolith to reference.

---

### Phase 3 — Tmux Mode & Crash Protection (2026-02-16, commits 06–09)
**Duration**: 1 day

- `03eeea3`: Multi-agent orchestration analysis doc — 1,016-line comparison of patterns (external contributor commit via GitHub web UI, note different email format).
- `682e025`: **Tmux as third execution mode** alongside Conduit and Teams. Tmux sessions survive Conduit crashes, keeping Claude Code instances alive. New files: `tmux-helpers.sh`, `tmux-recovery` command, tmux state template. Hooks probe live sessions on every start/compaction. 381 insertions.
- `751619c`: README update documenting tmux mode per-project setup.
- `d04c254`: Fix — tmux state file now takes priority over Teams mode in mode detection. Added explicit worker spawning pattern; critical note that `Task` tool background agents share git working directory (conflict risk) so tmux mode must NOT use them.

**Key milestone**: `682e025` — tmux as crash-protection layer. The orchestrator can now survive terminal crashes, not just compactions.

---

### Phase 4 — Knowledge Catalogue System (2026-03-08, commits 10–16)
**Duration**: ~17 hours (single intense day, 7 commits)

A complete research infrastructure was built in one day using multi-agent parallel pipelines:

- `d359739`: Knowledge catalogue system scaffolding — 4 templates (tools, talks, articles, posts), 4 slash commands (`/tool-catalogue`, `/ingest-talk`, `/ingest-article`, `/ingest-post`), master `INDEX.md`, 126 raw research documents committed as seed material.
- `eb78e43`: `/ingest-bookmarks` — reads Chrome `LLM-INGEST` bookmark folder from disk, classifies URLs, spawns parallel subagents for batch ingestion. Deepens all 3 ingest skills with broader relevance scoring.
- `9fbfd18`: First catalogue entries — 9 tool profiles (copilot-sdk, openai-codex, pi-agent, airweave, always-on-memory-agent, factory-ide, jean, t3code, paperclip/qwen-agent). Overseer agent, `ui-review` command, UI migration plan docs.
- `69c569d`: Massive wave — **27 new entries**: 7 practitioner profiles (Elvis Sun, IndyDevDan, Steve Yegge, Steipete, Geoffrey Huntley, Mario Zechner, Dotta), 9 tool profiles, 8 reference docs. Practitioner template created. INDEX fully restructured.
- `ed30058`: **73 structured reference entries** from 126 raw research docs. 2-wave pipeline: 5 analysis agents categorized, 15 conversion agents produced entries. 11 categories. INDEX reaches 107 total entries.
- `bf64008`: **85 tool entries** from 3-wave pipeline (25 agents total). Wave 1: 9 agents scanned 81 docs extracting ~536 tool mentions. Wave 2: deduplicated to 282 unique. Wave 3: 15 agents created 85 entries. New categories: `agent-protocols/`, `agent-economy/`, `observability/`, `code-intelligence/`, `infrastructure/`. Catalogue grows to **192 total entries**.
- `6d529de`: Conference talk entries (14 talks from the Anthropic/agent conference transcript). Planning artifacts added (`_bmad-output/planning-artifacts/epics.md` — 791 lines). Excel files of Elvis Sun following analysis committed.

**Key milestone**: This phase demonstrates the orchestrator eating its own dog food — multi-wave parallel agent pipelines used to build the catalogue that the orchestrator learns from.

---

### Phase 5 — Developer UX & Notification System (2026-03-11, commits 17–23)
**Duration**: ~8 hours

- `47d2232`: 28+ new catalogue entries (agent-harnesses blitz: 99ravens, agent-flywheel, automaker, broomie, claude-sneakpeek, codebuff, codex-skills, dash, deep-agents, ironclaw, kilo-code, loom, mitra, opendev, openspec, praisonai, ramain, and more). INDEX grows significantly.
- `3f66fca` + `7760ee0`: Ghostty task-finish notification setup guide. Two commits in 2 minutes — initial draft then full rewrite as step-by-step guide.
- `deed12a`: Codex CLI hooks + clipboard/Maccy integration docs.
- `a122311`: `agent-watch` script now copies last response to clipboard automatically.
- `cfe9e8e` + `86daa47`: Clipboard copy removed from Claude Code hook (limitations clarified); docs updated to describe per-agent clipboard behavior.

---

### Phase 6 — Pi Agent: Initial Integration (2026-03-12 morning, commits 24–26)
**Duration**: ~35 minutes (3 commits, 10:28–11:03)

This is the architectural pivot — moving from pure Claude Code orchestration to Pi as the execution harness.

- `971aa3d`: **Event-driven notification system** for Ghostty 1.3 + tmux. `tmux-helpers.sh` v2 with `wait-for` latch pattern, `wait_any`/`wait_all`, dispatch. `tmux-agent.conf` complete config with bell propagation, Tokyo Night status bar. `ghostty-workspace.sh` 4-pane workspace launcher. 1,015 insertions.
- `593ee49`: **Pi Agent orchestrator** — first Pi-based L-Thread Orchestrator. Replaces Conduit CLI with tmux + event-driven wait. **4 TypeScript extensions** (1,152 lines):
  - `orchestrator-discipline.ts` (126L): Physically blocks code writes via tool_call hooks
  - `orchestrator-agents.ts` (673L): tmux worker lifecycle (spawn, dispatch, wait, capture, close)
  - `orchestrator-state.ts` (186L): persistence + devlog + auto-mode + context injection
  - `orchestrator-dashboard.ts` (81L): TUI footer with phase/workers/context
  - Key improvement: event-driven wait via `tmux wait-for` (zero CPU), latch files for race condition safety, state survives compaction via Pi's `appendEntry()`
- `b3a7a9e`: **Supervisor mode** (architectural pivot #2). Pi's LLM is NOT the orchestrator — it's the **SUPERVISOR**. Claude Opus runs in tmux as the actual orchestrator; Pi provides the deterministic harness. `supervisor.ts` (774L):
  - State machine: `stopped → starting → running → silent → nudging → stalled`
  - 7 tools: start, stop, nudge, observe, status, config, spawn_worker
  - Auto-nudge escalation (3 levels → auto-restart)
  - Crash detection + auto-restart
  - `run.sh` now supports `--mode supervisor|orchestrator`

**Key milestone**: `b3a7a9e` — the supervisor/orchestrator split. Pi as deterministic watchdog over a Claude Opus Claude Code instance. This becomes the primary architecture for all subsequent development.

---

### Phase 7 — Supervisor Hardening & Research (2026-03-12 afternoon/evening, commits 27–30)
**Duration**: ~10 hours

- `3da0827`: Multi-source ingest pipeline expansion. `/ingest-bookmarks` supports Chrome + Comet + X bookmarks, recursive depth cycles, ingest ledger tracking, per-agent discovery sidecar files. **Sonnet confirmed as default** for all subagents (Opus quality at lower cost). 14 new catalogue entries (311 total). `_bmad/ingest-ledger.json` tracks all ingested URLs.
- `4150a60`: **Stateless reducer architecture** (12 Factor Agents pattern). `supervisor.ts` refactored to: `Probe (I/O) → Event → reduce(pure) → Effects → Execute (I/O)`. New `telemetry.ts` extension — logs ALL hook events to `_bmad/telemetry/YYYY-MM-DD.jsonl`. Single tmux session "lthread" with deterministic 3-pane layout. `pane-workers.sh` shell helper. Also: Gemini commands (`.gemini/` directory), catalogue explorer HTML, TIMELINE.md, `12-factor-agents` catalogue entry.
- `588b467`: **9 determinism fixes from first live test** (8 incidents logged to `_bmad/incidents.md`):
  - Session registry `_bmad/session-registry.json`
  - Pause/Resume tools (Escape to interrupt)
  - Hard kill on stop (polite C-c → kill -9 after 3s, INC-007)
  - Copy mode protection — defensive `q` before every `send_keys` (INC-005)
  - Activity log `_bmad/agent-activity.jsonl`
  - `run.sh --provider` flag, model pre-flight, active session guard
  - System prompt forces `supervisor_start` call immediately (INC-003)
  - Research: 599-line IndyDevDan pi-vs-claude-code pattern analysis
- `42f3256`: Phase 2 Pi ecosystem research. 10 parallel Sonnet agents analyzed Pi ecosystem projects. Key patterns discovered: ZFC principle, progressive escalation, `pi.events` bus, context alert semaphore, `remain-on-exit`, quiet detection, LLM drift detection, guard codegen. Projects analyzed: agent-of-empires, overstory, pi-messenger, pi-interactive-shell, pi-tmux, pi-supervisor, oh-my-pi, pi-shadow-git, pi-skills, OpenClaw/Lobster.

---

### Phase 8 — CMUX Migration & BMAD Orchestration (2026-03-14, commits 31–34)
**Duration**: ~4.5 hours (4 commits, 13:51–18:04)

- `915ec76`: **CMUX migration** — replace tmux I/O layer with cmux (manaflow-ai/cmux, native macOS terminal on libghostty). Stateless reducer completely untouched — only I/O helpers change. Changes:
  - `supervisor.ts`: 5 I/O helpers now use `cmux` CLI
  - `run.sh`: Full rewrite for cmux, requires `CMUX_SURFACE_ID`
  - `pane-workers.sh`: All tmux calls replaced with cmux equivalents
  - `cmux-client.ts`: Rewritten from incorrect JSON-RPC assumption to CLI wrapper (258L, down from 849L)
  - INC-005 copy-mode workaround removed (cmux has no scroll mode)
- `eefb379`: **BMAD workflow orchestration** — 5 new tools for automated parallel development. `supervisor.ts` grows from ~1,300L to ~2,350L (+1,040 lines in single commit):
  - `bmad_start_wave`: Spawn N parallel workers (max 4 per DeepMind exponent), latch-based completion detection
  - `bmad_wave_status`: Poll all workers, check latches, report progress
  - `bmad_merge_wave`: Spawn merge agent after wave completion
  - `bmad_generate_report`: Wave/epic markdown reports to `_bmad-output/reports/`
  - `bmad_notify_human`: Pause all agents + cmux desktop notification for human-in-the-loop checkpoints
  - `BmadWaveState` separate state file `_bmad/bmad-wave-state.json`
  - TUI: BMAD progress bar, per-story icons, human checkpoint banner
- `bcd3757`: **Two cmux bugs fixed from live testing** + screen state parser:
  - Bug 1: `cmux new-split` returns `OK surface:N workspace:M` — must extract `surface:N` via regex (not bare ref)
  - Bug 2: `cmux send` types text without Enter — must follow with `cmux send-key Enter`
  - `parseScreen()` — deterministic regex-based activity detection (idle/working/thinking/tool_calling/error)
  - Smart nudge: skips nudge during active work, skips if no real task, context-aware messages
  - Silence threshold: 120s → 300s
  - 40/40 parser tests passing
- `6deff3b`: Hotfix — `reduce()` is pure and can't access `registry` from closure; use `s.task` instead.

---

## Key Milestones Summary

| Date | Milestone | Commit |
|------|-----------|--------|
| 2026-02-01 | Project inception, Conduit-based L-Thread pattern | `c3e90b7` |
| 2026-02-01 | SessionStart hook — crash-resistant context injection | `1617582` |
| 2026-02-07 | **v2.0.0** — Custom Agent architecture, dual mode (Conduit + Teams) | `a49a337` |
| 2026-02-16 | Tmux mode — third execution mode, crash protection via sessions | `682e025` |
| 2026-03-08 | Knowledge catalogue system — 192 entries via multi-agent pipelines | `bf64008` |
| 2026-03-12 | Pi Agent orchestrator — 4 TypeScript extensions, event-driven wait | `593ee49` |
| 2026-03-12 | **Supervisor/Orchestrator split** — Pi as deterministic watchdog | `b3a7a9e` |
| 2026-03-12 | Stateless reducer architecture (12 Factor Agents) | `4150a60` |
| 2026-03-12 | First live test — 8 incidents logged, 9 fixes applied | `588b467` |
| 2026-03-14 | CMUX migration — native macOS terminal layer replaces tmux | `915ec76` |
| 2026-03-14 | BMAD workflow orchestration — 5 tools, wave-based parallel dev | `eefb379` |
| 2026-03-14 | Screen state parser — activity-aware smart nudging | `bcd3757` |

---

## supervisor.ts Growth Trajectory

| Commit | Date | Lines | Delta | Description |
|--------|------|-------|-------|-------------|
| `b3a7a9e` | Mar 12 11:03 | ~774 | +774 | Initial supervisor (7 tools, state machine) |
| `4150a60` | Mar 12 17:15 | ~1,074 | +300 | Stateless reducer refactor |
| `588b467` | Mar 12 20:50 | ~1,479 | +405 | Session registry, pause/resume, hard kill |
| `915ec76` | Mar 14 13:51 | ~1,479→adj | +/-112 | CMUX I/O migration |
| `eefb379` | Mar 14 14:02 | ~2,350 | +1,040 | BMAD workflow orchestration |
| `bcd3757` | Mar 14 17:45 | ~2,400+ | +133 | Screen parser + nudge improvements |
| `6deff3b` | Mar 14 18:04 | ~2,400+ | +1 | Pure reducer hotfix |

---

## .claude/agents/ and .claude/commands/ Evolution

### orchestrator.md (Custom Agent) — `a49a337` through `d04c254`

| Commit | Change |
|--------|--------|
| `c3e90b7` | Only `.claude/commands/orchestrator.md` exists (monolith, ~800+ lines) |
| `a49a337` | Split: `.claude/agents/orchestrator.md` created (407L), commands/orchestrator.md slimmed to reference |
| `682e025` | agents/orchestrator.md gains tmux mode documentation (+46 lines) |
| `d04c254` | agents/orchestrator.md gains explicit tmux worker spawning pattern, mode detection priority fix (+53 lines) |

### Commands added over time

| Command | Commit | Date |
|---------|--------|------|
| `orchestrator.md` | `c3e90b7` | Feb 01 |
| `orchestrator-teams.md` | `a49a337` | Feb 07 |
| `roadblock-recovery.md` | `a49a337` | Feb 07 |
| `tmux-recovery.md` | `682e025` | Feb 16 |
| `tool-catalogue.md` | `d359739` | Mar 08 |
| `ingest-talk.md` | `d359739` | Mar 08 |
| `ingest-article.md` | `d359739` | Mar 08 |
| `ingest-post.md` | `d359739` | Mar 08 |
| `ingest-bookmarks.md` | `eb78e43` | Mar 08 |
| `ui-review.md` | `9fbfd18` | Mar 08 |
| `ingest-x-activity.md` | `4150a60` | Mar 12 |
| `pi-incident.md` | `588b467` | Mar 12 |

---

## Architectural Thread: Terminal I/O Layer Evolution

The terminal I/O layer changed 3 times:

1. **Conduit CLI** (Feb 01 – Mar 11): `pane-split`, `terminal-write`, `terminal-wait`, `pane-close` — Claude Code's Conduit CLI for agent spawning
2. **tmux directly** (Feb 16 – Mar 13): `tmux send-keys`, `tmux wait-for`, `tmux capture-pane` — crash-resistant but required terminal workarounds (copy mode protection INC-005)
3. **cmux** (Mar 14 – present): `cmux send`, `cmux send-key Enter`, `cmux read-screen`, `cmux new-split` — native macOS terminal (libghostty), no scroll mode issues, returns `OK surface:N workspace:M`

---

## Architectural Thread: Orchestrator Identity Evolution

1. **Conduit mode** (Feb 01): Claude Code IS the orchestrator, uses Conduit CLI to spawn workers
2. **Teams mode** (Feb 07): Claude Code orchestrator uses `Task` tool for parallel workers
3. **Tmux mode** (Feb 16): Claude Code orchestrator manages workers via tmux sessions
4. **Pi as orchestrator** (Mar 12, `593ee49`): Pi's LLM IS the orchestrator, uses TypeScript extensions + tmux
5. **Pi as supervisor** (Mar 12, `b3a7a9e`): Pi is NOT the orchestrator — it's the deterministic WATCHDOG. Claude Opus runs in tmux as orchestrator; Pi provides harness + smart nudging

---

## Model Usage Pattern

- Commits `c3e90b7`–`1617582`: Co-authored by **Claude Opus 4.5** (early February)
- Commits `a49a337` onward: Co-authored by **Claude Opus 4.6**
- Commits `915ec76` onward: Co-authored by **Claude Opus 4.6 (1M context)**
- Ingest subagents: **Sonnet** default established at `3da0827` (Mar 12) after confirming parity with Opus for research tasks
