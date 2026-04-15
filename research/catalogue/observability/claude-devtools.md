# claude-devtools

> **The missing DevTools for Claude Code — inspect every tool call, subagent, and token like a browser inspector**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Repository | [github.com/matt1398/claude-devtools](https://github.com/matt1398/claude-devtools) |
| GitHub Stars | 2,593 (as of 2026-03-25) |
| Publisher | @matt1398 (solo developer) |
| License | MIT |
| Tech Stack | TypeScript, Electron 28, React 18, Tailwind CSS 3, Zustand 4, Vite, Vitest, pnpm monorepo |
| Maturity | 🟢 Production (v0.4.9, released 2026-03-23) |
| Last Analyzed | 2026-03-25 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | We run 6+ parallel tmux workers consuming Claude Max flat-rate. Understanding exactly which subagent, tool call, and CLAUDE.md injection consumes context is directly useful for diagnosing stuck agents, tuning compaction thresholds, and justifying our 18-36x arbitrage claim. |
| **Novelty** | 7/10 | The JSONL reverse-engineering approach (reconstructing the full context window from local logs) and the 6-category injection tracker are genuinely novel. ccusage already covers token cost; this covers structure and causation. |
| **Actionable** | 8/10 | `brew install` or Homebrew cask on macOS. No API key, no setup — reads existing `~/.claude/` logs instantly. Can be deployed as a standalone server via Docker for headless/remote use. Works against our tmux worker sessions today. |

---

## Overview

claude-devtools is a cross-platform Electron desktop application (macOS, Linux, Windows) that reconstructs the hidden execution context of Claude Code sessions from local JSONL logs stored at `~/.claude/projects/{encoded-path}/*.jsonl`. It was created in response to Claude Code updates that replaced detailed tool output with opaque summaries like "Read 3 files" — the app restores full visibility into what happened, why, and at what token cost.

The core abstraction is the **Chunk**: an atomic unit of timeline visualization. There are four types: `UserChunk` (real user messages), `AIChunk` (assistant responses with tool executions and spawned subagents), `SystemChunk` (command output), and `CompactChunk` (compaction boundary events). Each chunk carries timestamps, duration, and metrics (tokens, cost, tools). This chunk-based model enables precise attribution: you can see which turn consumed which tokens, which tool call fired which subagent, and where compaction resets the context window.

The **Visible Context Tracker** (`src/renderer/utils/contextTracker.ts`) is the most technically sophisticated component. It walks every session turn and identifies 6 categories of context injection: `claude-md` (CLAUDE.md files), `mentioned-file` (user @-mentions), `tool-output` (Read/Bash/Edit results), `thinking-text` (extended thinking tokens), `team-coordination` (TeamCreate/TaskCreate/SendMessage tools), and `user-message` (prompt text). These are exposed as per-turn popovers (`ContextBadge`), hover breakdowns (`TokenUsageDisplay`), and a full session panel (`SessionContextPanel`). Compaction events reset accumulated injection phases, tracked via `ContextPhaseInfo`.

---

## Technical Architecture

```
claude-devtools/
├── src/
│   ├── main/                          # Electron main process
│   │   ├── ipc/handlers.ts            # IPC bridge (sessions, projects, search, notifications)
│   │   ├── services/
│   │   │   ├── parsing/               # JSONL → domain objects
│   │   │   │   ├── SessionParser.ts   # Entry point: reads .jsonl, classifies messages
│   │   │   │   ├── MessageClassifier.ts  # isMeta flag resolution
│   │   │   │   ├── ChunkBuilder.ts    # Assembles UserChunk/AIChunk/SystemChunk/CompactChunk
│   │   │   │   ├── ChunkFactory.ts    # Chunk creation helpers
│   │   │   │   ├── SubagentDetailBuilder.ts   # Resolves Task→subagent linkage
│   │   │   │   ├── SemanticStepExtractor.ts   # Tool-call-to-human-readable step
│   │   │   │   └── ToolSummaryFormatter.ts    # "Read 3 files" → full details
│   │   │   ├── analysis/              # Context window reconstruction
│   │   │   ├── discovery/             # Project/session discovery from ~/.claude/
│   │   │   └── infrastructure/        # LRU cache, file watchers, SSE for standalone
│   │   ├── http/standalone.ts         # HTTP server for Docker/headless deployment
│   │   └── index.ts                   # Electron app entry
│   ├── renderer/                      # React UI
│   │   ├── types/
│   │   │   └── contextInjection.ts    # ContextInjection discriminated union, ContextStats
│   │   ├── utils/contextTracker.ts    # computeContextStats(), processSessionContextWithPhases()
│   │   ├── components/                # ContextBadge, TokenUsageDisplay, SessionContextPanel
│   │   └── store/                     # Zustand state
│   ├── preload/                       # Electron IPC bridge (contextBridge)
│   └── shared/                        # Types and utils shared across all processes
├── docker-compose.yml                 # Standalone server deployment
└── electron.vite.config.ts            # Vite build config
```

**Key data model — ContextInjection discriminated union:**

```typescript
type ContextInjection =
  | ClaudeMdContextInjection       // { category: 'claude-md', filePath, tokens }
  | MentionedFileInjection         // { category: 'mentioned-file', filePath, tokens }
  | ToolOutputInjection            // { category: 'tool-output', toolName, tokens }
  | ThinkingTextInjection          // { category: 'thinking-text', tokens }
  | TeamCoordinationInjection      // { category: 'team-coordination', toolName, tokens }
  | UserMessageInjection           // { category: 'user-message', tokens }
```

**Agent Teams visibility:** Claude Code's team coordination (`teammate_spawned`, `SendMessage`, `TaskCreate`, `TeamCreate`) is fully parsed. Teammate messages (injected as `<teammate-message teammate_id="..." color="...">` in user messages) are detected by `isParsedTeammateMessage()` and rendered as `TeammateMessageItem` cards, not as regular user messages. The `SubagentDetailBuilder` resolves orphaned Task calls (no matching subagent) vs linked ones. `ProcessLinker` correlates sessions via `teammate_spawned` tool results.

**Performance:** LRU cache prevents re-parsing large JSONL files. Streaming JSONL (line-by-line) avoids loading full files into memory. 100ms debounce on file watchers. Virtual scrolling for large session lists.

**Standalone/Docker:** A separate `standalone.ts` entry point runs as a Node.js HTTP server with SSE replacing Electron's native file watchers. Accessible at `http://localhost:3456`. Suitable for remote SSH sessions or headless CI environments.

---

## Publisher Background

@matt1398 is a solo developer with no visible prior notable projects. The project launched 2026-02-07 and reached 2,593 stars in 47 days — fast organic growth driven by a genuine tooling gap. The 181 forks, 17 open issues, active branch activity (22 branches including `feat/token-consumption-insights`, `feat/session-analysis-report`, `feat/mermaid-diagram-visualization`), and v0.4.9 release pace suggest healthy solo maintenance. No institutional backing. MIT license. The quality of the CLAUDE.md and codebase structure suggests a developer who works with Claude Code daily and built this for their own use first.

---

## What's Valuable for Us

**1. Context injection taxonomy** — The 6-category `ContextInjection` union (`src/renderer/types/contextInjection.ts`) is the most precise model we've seen for attributing token consumption within a session. The `computeContextStats()` function in `contextTracker.ts` shows how to reconstruct what the model was actually seeing at each turn. This directly informs our orchestrator's compaction threshold tuning: we can now see empirically how much token space CLAUDE.md files, tool outputs, and subagent coordination consume before triggering compaction.

**2. Chunk schema for timeline visualization** — The `UserChunk`/`AIChunk`/`SystemChunk`/`CompactChunk` taxonomy (with `isMeta` flag distinguishing real vs internal messages) is a clean abstraction for our devlog and supervisor state. Our `orchestrator-tmux-state.json` tracks session-level state; this pattern fills the gap for turn-level granularity.

**3. Agent Teams parsing** — The `SubagentDetailBuilder` + `ProcessLinker` approach to correlating `teammate_spawned` results with their corresponding sessions shows exactly how Claude Code's internal team coordination is structured. Directly useful for diagnosing worker coordination failures in our tmux-based system.

**4. Standalone server mode** — The Docker deployment (`docker-compose.yml`, `http/standalone.ts`) enables attaching a devtools instance to a headless CI runner or remote Pi server. Our orchestrator runs on macOS but client work may move to remote Linux machines.

**5. Custom notification rules** — Regex-match rules against tool call fields (file paths, commands, error output) triggering system alerts. Directly applicable for alerting when a worker accesses sensitive files or hits errors.

---

## What's NOT Relevant

**Electron app lifecycle** — We don't need an installed desktop app. The value is in the parsing logic (`src/main/services/parsing/`), not the GUI. The Master Blueprint's zero-infra preference means we'd extract the parsing layer rather than deploy the full app.

**SSH remote session support** — Our workers run locally in tmux windows on the same machine. SSH tunneling is unnecessary overhead for our current architecture.

**Multi-pane layouts and tab management** — GUI ergonomics for human operators. Our orchestrator uses tmux `capture-pane` for programmatic output reading, not a visual inspector.

**Windows/Linux path normalization code** — Our stack is macOS-native. The WSL path translation and drive letter casing fixes are irrelevant.

---

## Future Use Cases

**Phase 2 (Days 4-60): Compaction tuning** — Run claude-devtools against a full orchestrator session to see exactly which context categories fill the window fastest. Use this data to tune CLAUDE.md file sizes, tool output verbosity, and compaction trigger points. This is the highest-value near-term use.

**Phase 2: Stuck worker diagnosis** — When a tmux worker goes silent, attach claude-devtools to its session log to see the last tool calls, token consumption, and whether a compaction event may have wiped critical context.

**Phase 3 (Days 60-90): Custom notification rules** — Wire up alerts for when workers access files outside their assigned worktree, or when error patterns appear in bash output. Complementary to DCG (PreToolUse blocking) — this adds post-hoc alerting.

**Phase 3+: Extract parsing library** — The `src/main/services/parsing/` pipeline (SessionParser → MessageClassifier → ChunkBuilder → SubagentDetailBuilder) could be extracted as a Node.js library and integrated into our orchestrator's supervisor loop for real-time session analysis without the Electron shell.

---

## Key Takeaway

> **claude-devtools is the missing microscope for Claude Code sessions — its 6-category context injection tracker and chunk-based timeline model are the most precise tools available for diagnosing exactly what consumes tokens and why workers get stuck.**
