# dmux

> **A dev agent multiplexer for git worktrees and coding agents — parallel agents with tmux and worktrees.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [standardagents/dmux](https://github.com/standardagents/dmux) |
| GitHub Stars | 1,161 (as of 2026-03-14) |
| Homepage | [dmux.ai](https://dmux.ai) |
| Publisher | Justin Schroeder (@jpschroeder, 533 commits) + Andrew Boyd (@andrew-boyd, 82 commits); Standard Agents org; previously FormKit (Vue ecosystem); solo-to-duo startup |
| License | MIT |
| Tech Stack | TypeScript, React/Ink TUI, tmux, Git Worktrees, Node.js 18+, OpenRouter (LLM status detection), Swift macOS native helper, Vue (web dashboard), Vitest (97 tests), HTTP REST API + SSE |
| Maturity | 🟢 Production (v5.6.1; active daily pushes; npm published; 81 forks; 26 open issues; comprehensive test suite; docs site at dmux.ai) |
| Last Analyzed | 2026-03-14 |

---

## Burak's Notes

> *dmux is the most feature-complete tmux+worktree multiplexer in the catalogue — it has more engineering polish than Agent of Empires, broader agent support than NTM, and it's the only one with an HTTP REST API, LLM-powered status detection, AI-assisted merge conflict resolution, a native macOS notification helper, and a multi-merge orchestrator that processes nested worktrees depth-first. The 11-agent registry (Claude, Codex, OpenCode, Cline, Gemini, Qwen, Amp, Pi, Cursor, Copilot, Crush) with per-agent permission mapping and prompt transport abstraction is the cleanest agent launcher implementation I've seen.*
>
> *The HTTP API + SSE streaming is the killer differentiator over AoE and NTM. Our orchestrator could use `POST /api/panes` to spawn worktree-isolated agents and `GET /api/panes-stream` to monitor them via SSE, completely replacing our tmux send-keys/capture-pane plumbing. The lifecycle hooks system (11 hook types, 3-tier resolution: team `.dmux-hooks/` > local `.dmux/hooks/` > global `~/.dmux/hooks/`) is more sophisticated than AoE's config.toml hooks.*
>
> *The LLM-powered PaneAnalyzer (OpenRouter → Gemini Flash/Grok/GPT-4o-mini with parallel racing) for detecting idle/waiting/working states is clever but adds external API dependency. Our tmux capture + regex approach is simpler. The native macOS helper daemon (Swift, Unix socket, CoreGraphics focus tracking, notification sounds) is impressive progressive enhancement.*
>
> *Compared to cmux: dmux uses tmux as substrate (like us), cmux replaces tmux entirely. dmux is MIT (we can fork), cmux is AGPL. dmux has HTTP API for programmatic control, cmux has socket API. dmux does LLM-based status detection, cmux uses escape sequences. Different tools for different needs — dmux is the "tmux-native" option, cmux is the "post-tmux" option.*
>
> *Main gap: Like AoE, dmux is human-driven TUI, not a headless autonomous orchestrator. No agent-to-agent communication, no task routing, no state machine. But the HTTP API + hooks make it the most automatable tmux wrapper available.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Direct overlap: tmux + git worktree isolation + multi-agent + HTTP API for programmatic control + lifecycle hooks + merge orchestration. The REST API and SSE streaming make it the first tool in the catalogue that could serve as a programmatic substrate for our L-Thread Orchestrator (spawn via API, monitor via SSE, merge via hooks). Loses 1 point: still human-driven TUI at core, no headless orchestration mode, no agent-to-agent messaging. |
| **Novelty** | 8/10 | Several patterns not seen elsewhere: (1) Parallel LLM model racing for status detection (Promise.any across 3 models), (2) HTTP REST API + SSE for programmatic tmux control, (3) AI-assisted merge conflict resolution (spawn agent in worktree, background monitor, auto-cleanup), (4) Multi-merge orchestrator (depth-first nested worktree merging), (5) Native macOS helper with CoreGraphics focus tracking and custom notification sounds, (6) 3-tier hook resolution (team > local > global), (7) PaneWorker thread-per-pane with fingerprint-based activity detection. |
| **Actionable** | 9/10 | Six immediately actionable patterns: (1) Agent registry with typed prompt transport abstraction (`positional`/`option`/`stdin`/`send-keys`) — adopt for our multi-agent launcher; (2) HTTP API for pane creation/monitoring — use as programmatic substrate instead of raw tmux commands; (3) 11-hook lifecycle system with environment variables — model our `.bmad/scripts/` after this; (4) PaneWorker fingerprint-based activity detection — adapt for our telemetry; (5) Two-phase merge strategy (main→worktree then worktree→main) with AI conflict resolution; (6) `tmux capture-pane` → content hash → LLM analysis pipeline for status detection. |

---

## Overview

dmux is a TypeScript + React/Ink TUI application that transforms tmux into a purpose-built multi-agent development environment. Each "pane" in dmux gets its own git worktree on a dedicated branch, providing complete code isolation between parallel AI coding agents. The core workflow: press `n`, type a prompt, pick an agent (or multiple), and dmux handles worktree creation, branch management, agent launch, and eventual merge-back.

The architecture is built around a singleton `StateManager` that tracks all pane state in a JSON config file (`.dmux/dmux.config.json`), a `TmuxService` singleton with retry strategies (NONE/FAST/IDEMPOTENT) for reliable tmux command execution, and a `StatusDetector` service that coordinates worker threads and LLM-powered pane analysis. Each active pane gets a dedicated `PaneWorker` thread that polls tmux capture-pane output, builds activity fingerprints, and requests LLM analysis when the terminal goes static.

What sets dmux apart from similar tools (Agent of Empires, NTM) is the depth of its merge system and programmatic API. The two-phase merge strategy (main→worktree for conflict detection, then worktree→main for integration) with AI-assisted conflict resolution (spawns an agent pane in the conflicted worktree, monitors until conflicts are resolved, auto-cleans up) is the most sophisticated merge pipeline in any tmux-based tool we've catalogued. The HTTP REST API with SSE streaming makes the entire system scriptable from external programs — no tmux command plumbing needed.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    dmux Process (Node.js)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Ink TUI       │  │ HTTP Server  │  │ macOS Native Helper    │ │
│  │ (React/Ink)   │  │ (REST+SSE)   │  │ (Swift, Unix socket)   │ │
│  │ - PanesGrid   │  │ /api/panes   │  │ - Focus tracking       │ │
│  │ - PopupMgr    │  │ /api/session │  │ - Notifications        │ │
│  │ - FooterHelp  │  │ /api/health  │  │ - Sound selection      │ │
│  │ - FileBrowser │  │ SSE stream   │  │ - CoreGraphics API     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬─────────────┘ │
│         │                  │                      │               │
│  ┌──────┴──────────────────┴──────────────────────┴─────────────┐ │
│  │                    StateManager (Singleton)                    │ │
│  │  .dmux/dmux.config.json — panes[], settings, sidebarProjects │ │
│  │  ConfigWatcher → file system events → state sync              │ │
│  └──────┬──────────────────┬──────────────────────┬─────────────┘ │
│         │                  │                      │               │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────────┴─────────────┐ │
│  │ TmuxService  │  │StatusDetector│  │ Actions System          │ │
│  │ (Singleton)  │  │ PaneWorkers  │  │ - mergeAction           │ │
│  │ - Retry strat│  │ PaneAnalyzer │  │ - closeAction           │ │
│  │ - Batched qry│  │ (OpenRouter) │  │ - multiMergeOrch.       │ │
│  │ - Layout calc│  │ AttentionSvc │  │ - conflictResolution    │ │
│  └──────────────┘  └──────────────┘  └─────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Hooks System (11 lifecycle hooks)                 │ │
│  │  .dmux-hooks/ (VC) > .dmux/hooks/ (local) > ~/.dmux/hooks/   │ │
│  │  before_pane_create → pane_created → worktree_created →       │ │
│  │  before_pane_close → pane_closed → pre_merge → post_merge     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │       tmux          │
                    │  ┌────┐ ┌────┐      │
                    │  │Pane│ │Pane│ ...  │
                    │  │WT1 │ │WT2 │      │
                    │  └──┬─┘ └──┬─┘      │
                    └─────┼──────┼────────┘
                          │      │
              ┌───────────┴┐  ┌──┴───────────┐
              │ .dmux/     │  │ .dmux/       │
              │ worktrees/ │  │ worktrees/   │
              │ slug-1/    │  │ slug-2/      │
              │ (branch)   │  │ (branch)     │
              └────────────┘  └──────────────┘
```

### Key Components

- **Agent Registry** (`src/utils/agentLaunch.ts`): 11 agents with typed `AgentRegistryEntry` — install detection, prompt transport abstraction (`positional`/`option`/`stdin`/`send-keys`), permission flags per agent, resume command templates.
- **PaneWorker** (`src/workers/PaneWorker.ts`): Worker thread per active pane. Polls `tmux capture-pane` at 1s intervals, builds content fingerprints, detects user typing vs agent activity, triggers LLM analysis on static content.
- **PaneAnalyzer** (`src/services/PaneAnalyzer.ts`): OpenRouter API with parallel model racing (Gemini Flash, Grok 4 Fast, GPT-4o-mini via `Promise.any`). Content-hash cache (5s TTL, 100 entries). Classifies pane state as `option_dialog` / `open_prompt` / `in_progress`.
- **StatusDetector** (`src/services/StatusDetector.ts`): Coordinates PaneWorkerManager and PaneAnalyzer. Emits `status-updated`, `attention-needed`, `pane-removed` events. 10s LLM timeout with abort controller.
- **Multi-Merge Orchestrator** (`src/actions/merge/multiMergeOrchestrator.ts`): Depth-first merge queue for nested worktrees. Per-worktree validation → confirmation dialog → sequential execution → summary.
- **Conflict Resolution** (`src/actions/merge/conflictResolution.ts`): AI-assisted merge — spawns agent pane in conflicted worktree, background conflict monitor polls every 2s, auto-kills pane when resolved, re-runs merge.
- **HTTP Server** (`src/server/`): REST API on localhost (auto-port 3000-3010). Endpoints: health, session, panes CRUD, pane snapshots, SSE pane-stream, settings, keyboard actions. Web dashboard served from embedded assets.
- **Native Helper** (`native/macos/dmux-helper.swift`): 800+ line Swift daemon. Unix socket IPC. CoreGraphics + Accessibility APIs for frontmost window tracking. Title token matching for multi-instance focus detection. Custom notification sounds (10 bundled .caf files).
- **Hooks** (`src/utils/hooks.ts`): 11 hook types with 3-tier resolution. Hooks receive 12+ environment variables. Async by default (detached spawn), sync option for blocking hooks (pre_merge).

### Data Model

```typescript
interface DmuxPane {
  id: string;                    // dmux-{timestamp}
  slug: string;                  // URL-safe branch name
  branchName?: string;           // May include prefix (e.g. feat/slug)
  prompt: string;                // Original user prompt
  paneId: string;                // tmux pane ID (%N)
  worktreePath?: string;         // .dmux/worktrees/{slug}
  agent?: AgentName;             // claude|codex|opencode|...
  agentStatus?: AgentStatus;     // idle|analyzing|waiting|working
  needsAttention?: boolean;      // Settled + waiting on user
  autopilot?: boolean;           // Auto-accept safe options
  type?: 'worktree' | 'shell';  // Pane type
  mergeTargetChain?: MergeTargetReference[];  // Nested merge ancestry
  // ... options, summary, test/dev status
}
```

---

## Publisher Background

**Justin Schroeder** is the creator of FormKit (Vue.js form framework, 6K+ stars), a well-known figure in the Vue ecosystem. He transitioned from Vue tooling to AI agent tooling with dmux. The project launched August 2025 and reached 1,161 stars by March 2026. His 533 commits show sustained personal investment. **Andrew Boyd** (82 commits) appears to be the secondary contributor.

The **Standard Agents** organization has the stated mission of "creating portable, vendor-agnostic, effective AI agents for everyone." dmux is their flagship (and essentially only) project. The previous FormKit affiliation explains the repository URL containing `formkit/dmux` in some places.

The project has a professional docs site (dmux.ai built with Vite + Cloudflare Workers), a pnpm monorepo structure, CI/CD via GitHub Actions, comprehensive test coverage (97+ test files covering actions, services, integration, and e2e), and a developer workflow that uses dmux-on-dmux (recursive self-hosting).

---

## What's Valuable for Us

### 1. Agent Registry Pattern (Steal Immediately)
The `AGENT_REGISTRY` in `src/utils/agentLaunch.ts` is the best-structured multi-agent launcher we've seen. Each agent has typed fields for: install detection command, common binary paths, prompt command, prompt transport type (`positional`/`option`/`stdin`/`send-keys`), permission flag mappings, resume command templates, and slug suffixes. This abstracts away the differences between agent CLIs into a clean data structure. Our orchestrator currently hardcodes Claude-specific launch commands — adopting this registry pattern enables multi-agent support trivially.

### 2. HTTP API as Orchestration Substrate
The REST API (`POST /api/panes`, `GET /api/panes-stream` SSE, `GET /api/panes/:id/snapshot`) is the feature that makes dmux uniquely useful as infrastructure. Our L-Thread Orchestrator could use dmux as its tmux layer: spawn worktree-isolated agents via API, monitor them via SSE, capture terminal snapshots for telemetry. This eliminates our direct tmux command plumbing.

### 3. Two-Phase Merge Strategy
The merge system is the most sophisticated in any tmux-based tool: (1) `git merge-tree` simulation for pre-validation, (2) main→worktree merge for conflict detection in isolation, (3) AI-assisted conflict resolution (spawn agent + background monitor + auto-cleanup), (4) worktree→main fast-forward merge. The multi-merge orchestrator processes nested worktrees depth-first. Directly adaptable to our merge workflow.

### 4. Lifecycle Hooks with 3-Tier Resolution
11 hook types (`before_pane_create`, `pane_created`, `worktree_created`, `before_pane_close`, `pane_closed`, `before_worktree_remove`, `worktree_removed`, `pre_merge`, `post_merge`, `run_test`, `run_dev`) with priority: `.dmux-hooks/` (version-controlled, team) > `.dmux/hooks/` (gitignored, local) > `~/.dmux/hooks/` (global). Each hook gets 12+ env vars. This is cleaner than AoE's TOML config and more flexible than our `.bmad/scripts/` approach.

### 5. PaneWorker Fingerprint-Based Activity Detection
The worker-per-pane pattern with content fingerprinting, user typing detection (`isLikelyUserTyping`), agent working indicators (`hasAgentWorkingIndicators`), and settle-time debouncing (3.5s for user typing, 1.5s for agent activity) is a robust approach to status detection without LLM calls. The LLM analysis is only triggered for ambiguous static content — the heuristics handle the common cases.

### 6. macOS Native Helper Architecture
The Swift helper daemon pattern — Unix socket IPC, CoreGraphics focus tracking, title token matching for multi-instance awareness, custom notification sounds — is the gold standard for progressive enhancement. The fact that it's completely optional (dmux works without it on Linux) shows good separation of concerns.

---

## What's NOT Relevant

- **LLM-powered status detection via OpenRouter**: Adds external API dependency and cost. Our regex-based tmux capture approach is simpler and free. The heuristic layer before LLM is worth studying, the LLM layer itself is not.
- **React/Ink TUI**: We don't need a TUI — our orchestrator is headless. The TUI code (DmuxApp.tsx at 43K, useInputHandling.ts at 47K) is the largest part of the codebase and irrelevant to us.
- **Web dashboard** (Vue frontend): Nice for humans, irrelevant for autonomous orchestration.
- **File browser** (FileBrowserApp.tsx): Human-facing feature, not needed for agent orchestration.
- **OpenRouter API key management**: We use Claude Max, not per-call API billing.
- **Auto-updater**: npm package management, not relevant to our architecture.

---

## Future Use Cases

- **Phase 1 (Now)**: Study the agent registry pattern and lifecycle hooks system. Port the `AGENT_REGISTRY` data structure to our orchestrator for multi-agent support. Adopt the 3-tier hook resolution pattern for our `.bmad/scripts/`.
- **Phase 2 (Days 4-60)**: Evaluate dmux as an alternative tmux substrate. Instead of raw tmux commands, use `dmux` as the worktree+agent layer and our orchestrator as the coordination layer on top. The HTTP API makes this feasible.
- **Phase 3 (Days 60-90)**: If migrating to cmux, dmux becomes a reference implementation rather than infrastructure. But if staying on tmux, dmux could become our primary pane management layer.
- **Phase 4 (Days 90+)**: The multi-merge orchestrator and AI conflict resolution could be extracted as standalone components for our merge pipeline, regardless of which terminal substrate we use.

---

## Competitive Comparison

| Feature | dmux | Agent of Empires | NTM | cmux | L-Thread Orch. v3 |
|---------|------|-----------------|-----|------|-------------------|
| Language | TypeScript | Rust | Go | Swift/Zig | Bash/TS |
| Stars | 1,161 | 1,098 | 175 | 5,305 | N/A |
| Agents supported | 11 | 8 | 3 | Any (tmux shim) | 1 (Claude) |
| Worktree isolation | Yes | Yes | No | Yes (via git) | Yes |
| HTTP API | Yes (REST+SSE) | No | No (robot-mode CLI) | No (socket API) | No |
| Status detection | LLM + heuristics | Regex (3-state) | Token velocity | Escape sequences | Regex |
| Merge system | 2-phase + AI conflict | Basic | None | None | Manual |
| Hooks | 11 types, 3-tier | TOML config | None | None | 2 scripts |
| macOS native | Swift helper | No | No | Full native app | AppleScript |
| Agent-to-agent comms | No | No | Agent Mail | No | terminal-write |
| Headless/API mode | Yes (HTTP) | No | Yes (robot-mode) | Yes (socket) | Yes |
| Multi-project | Yes | No | Yes (labels) | Yes (workspaces) | No |

---

## Key Takeaway

> **dmux is the most feature-complete tmux+worktree agent multiplexer available — the only one with an HTTP API, LLM status detection, AI-assisted merge conflict resolution, and 11-agent support — making it the strongest candidate to serve as a programmatic pane management layer beneath our L-Thread Orchestrator.**
