# Pi Agent Community Extension Ecosystem: Complete Map

**Date**: 2026-03-05
**Scope**: Definitive catalog of every known Pi coding agent extension, tool, skill, and community project
**Sources**: GitHub, npm, X/Twitter, blog posts, awesome-pi-agent curated list, official pi-mono docs

---

## 1. Platform Overview

Pi (formerly known by its satirical domain shittycodingagent.ai, now pi.dev) is a minimal terminal coding agent created by Mario Zechner. The core project lives in the `badlogic/pi-mono` monorepo and ships as `@mariozechner/pi-coding-agent` on npm. As of March 2026, the package sees approximately 1.3M weekly npm downloads -- a 300x growth from approximately 4k/week in December 2025.

Pi's architecture is a layered TypeScript toolkit:

| Package | Role |
|---------|------|
| `pi-ai` | Unified LLM API across providers |
| `pi-agent-core` | Agent loop with tool calling |
| `pi-coding-agent` | Full coding agent with built-in tools, extensibility |
| `pi-tui` | Terminal UI library |

The extension system supports four primitives: **Extensions** (TypeScript modules hooking lifecycle events), **Skills** (SKILL.md natural-language workflow guides), **Prompt Templates** (reusable prompt scaffolds), and **Themes** (visual customization). All four can be bundled into **Pi Packages** and distributed via npm or git.

### Extension Architecture

Extensions are TypeScript/JavaScript modules that auto-discover from:
- `~/.pi/agent/extensions/*.ts` (global)
- `.pi/extensions/*.ts` (project-local)
- npm packages installed via `pi install npm:<package>`

They export a default function receiving an `ExtensionAPI` object providing:
- **Event subscription** (`pi.on(event, handler)`) across 25+ lifecycle events
- **Tool registration** (`pi.registerTool()`) for LLM-callable custom tools
- **Command registration** (`pi.registerCommand()`) for slash commands
- **UI components** (`ctx.ui.setWidget()`, `ctx.ui.setStatus()`, `ctx.ui.custom()`) for overlays, widgets, status bars
- **Keyboard shortcuts** (`pi.registerShortcut()`)
- **Provider management** for model switching
- **Session management** for state persistence

Key lifecycle events: `session_start`, `input`, `before_agent_start`, `agent_start`, `turn_start`, `context` (message modification), `tool_call` (blockable), `tool_result` (modifiable), `turn_end`, `session_shutdown`.

---

## 2. Multi-Agent Communication Extensions

These extensions enable agent-to-agent messaging, presence, and coordination.

### 2.1 pi-collaborating-agents

- **Author**: baochunli
- **GitHub**: [github.com/baochunli/pi-collaborating-agents](https://github.com/baochunli/pi-collaborating-agents)
- **Install**: `pi install npm:@baochunli/pi-collaborating-agents`

A file-based multi-agent coordination system with three core capabilities:

**Agent Identity & Registration**: Sessions auto-register with memorable two-word callsigns (e.g., "SilverHarbor"). Registry stored at `~/.pi/agent/collaborating-agents/registry/` as JSON files per agent.

**Messaging**: Direct messaging via `@AgentName message`, broadcasts via `@all message`. Urgent messages (`!!` prefix) interrupt immediately via Pi's "steer" mechanism; normal messages queue as "followUp". Global append-only log at `messages.jsonl`.

**File Reservation**: Agents reserve file paths to prevent write conflicts. Write/edit calls blocked when another active agent holds a matching reservation; reads remain unrestricted. Blocked agents receive notifications identifying the holder.

Additional features: `/agents` overlay with four tabs (agent list, feed, reservations, chat), `/subagent` command for spawning typed subagents (worker, scout, documenter, reviewer), configurable recursion depth limit (default: 2).

### 2.2 pi-messenger

- **Author**: nicobailon (Nico Bailon)
- **GitHub**: [github.com/nicobailon/pi-messenger](https://github.com/nicobailon/pi-messenger)
- **Install**: `pi install npm:pi-messenger`

The most feature-rich multi-agent extension in the ecosystem. Two major subsystems:

**Presence & Communication**: File-based messaging with no daemon/server. Agents register with themed names (SwiftRaven, LunarDust). Messages delivered as steering prompts via `pi.sendMessage()` with `triggerTurn: true`. File reservation with blocking enforcement via `tool_call` hooks. Activity feed tracking edits, commits, test runs, messages, and task events. Stuck detection (default 900s inactivity threshold).

**Crew -- PRD-to-Task Orchestration**: Transforms a PRD into a dependency graph of tasks executed in parallel waves.
- *Planning phase*: Planner explores codebase/requirements, drafts tasks with dependencies. Reviewer validates.
- *Work phase*: Workers implement ready tasks in parallel. Single wave or `autonomous: true` for continuous execution.
- *Review phase*: Reviewer marks SHIP, NEEDS_WORK, or MAJOR_RETHINK.
- Default models: Planner (Opus 4.6), Worker (Haiku 4.5), Reviewer (Opus 4.6).
- Domain skills loaded on-demand from user/extension/project scope.

### 2.3 pi-agent-teams

- **Author**: tmustier (Thomas Mustier)
- **GitHub**: [github.com/tmustier/pi-agent-teams](https://github.com/tmustier/pi-agent-teams)

Experimental agent swarm extension inspired by Claude Code agent teams. Core primitives: shared task list with file-per-task storage (pending/in-progress/completed states + dependency tracking), idle teammates auto-picking next unassigned unblocked task, direct/broadcast messaging via file-based mailboxes, graceful lifecycle (spawn/stop/shutdown/kill). Status: MVP (command-driven + status widget).

---

## 3. Orchestration & Subagent Extensions

These extensions manage agent lifecycle, spawning, and workflow pipelines.

### 3.1 pi-side-agents

- **Author**: pasky (Petr Baudis)
- **GitHub**: [github.com/pasky/pi-side-agents](https://github.com/pasky/pi-side-agents)
- **Stars**: ~84

Full tmux/worktree/merge lifecycle automation. Each agent runs in an isolated tmux window with its own git worktree and topic branch.

Key features:
- `/agent [-model ...] <task>` spawns background child agents
- `/agents` inspects status and cleans stale state
- Statusline shows active agents with tmux window numbers
- Orchestration tools for parent agents: `agent-start`, `agent-check`, `agent-wait-any`, `agent-send`
- `/skill:agent-setup` scaffolds project-specific lifecycle scripts
- Old worktrees reused by new agents; old branches auto-pruned
- "LGTM, merge" confirmation triggers auto-merge
- `/quit` exits agent session but retains worktree

Design philosophy: ephemeral agents tied to short topic branches, deliberately avoiding long-running agent swarms.

### 3.2 pi-subagents

- **Author**: nicobailon
- **GitHub**: [github.com/nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents)
- **Install**: `pi install npm:pi-subagents`

Async subagent delegation with four execution modes: single agent, sequential chains (inter-step data passing), parallel fan-out/fan-in, and background/async with durable status tracking.

Built-in agents: scout, planner, worker, reviewer, context-builder, researcher. Agents defined as markdown files with YAML frontmatter (tools, model, thinking level, skills, output behavior). Three-state semantics: omitted (inherit), value (override), or false (disable).

Advanced features:
- Chain files (`.chain.md`) for reusable pipelines
- Configurable truncation (byte/line limits)
- Shared artifact directories per chain run
- Agents Manager overlay (Ctrl+Shift+A)
- Inline configuration: `scout[output=context.md, model=claude-sonnet-4]`
- `--bg` flag for background execution
- Skill injection into system prompts via XML tags

### 3.3 pi-foreground-chains

- **Author**: nicobailon
- **GitHub**: [github.com/nicobailon/pi-foreground-chains](https://github.com/nicobailon/pi-foreground-chains)
- **Install**: `git clone` into `~/.pi/agent/skills/foreground-chains`

Skill (not extension) for sequential multi-agent workflows with full user visibility. Each step runs in an observable overlay where the user watches and can intervene.

Workflow: Scout (fast codebase scanning) -> Planner (implementation plan) -> Worker (execution with auto-continue) -> Reviewer (validation/fixes). File-based handoff through chain directories. Progress tracked in `progress.md`. Requires pi-interactive-shell.

### 3.4 Overstory

- **Author**: jayminwest
- **GitHub**: [github.com/jayminwest/overstory](https://github.com/jayminwest/overstory)

Cross-runtime multi-agent orchestration -- the most ambitious project in the ecosystem. Not a Pi extension per se, but a standalone framework with pluggable runtime adapters for Claude Code, Pi, Gemini CLI, GitHub Copilot, Codex, Sapling, and OpenCode.

Architecture:
- **Agent Isolation**: Each agent in its own git worktree via tmux
- **SQLite Mail**: Custom messaging (WAL mode, ~1-5ms/query) with 8 typed protocol messages and broadcast support
- **Merge Queue**: FIFO with 4-tier conflict resolution
- **Tiered Watchdog**: Tier 0 mechanical daemon, Tier 1 AI-assisted triage, Tier 2 monitor agent
- **Agent Roles**: Scout (read-only), Builder (read-write), Reviewer (read-only), Lead (coordination), Merger (branch specialist)
- **Hierarchical Teams**: Orchestrator -> Coordinator -> Supervisor -> Workers
- **Observability**: `ov dashboard` (live TUI), `ov inspect`, `ov trace`, `ov logs`, `ov costs`

Explicit warning in docs: "Agent swarms are not a universal solution."

### 3.5 PiSwarm

- **Listed in**: awesome-pi-agent
- **Purpose**: Parallel GitHub issue/PR processing using Pi agent and git worktrees

### 3.6 task-factory

- **Author**: patleeman
- **GitHub**: [github.com/patleeman/task-factory](https://github.com/patleeman/task-factory)

Queue-first work orchestrator built on Pi. Design principle: "the human is the bottleneck." Stage work in a queue, the system sequences execution. Includes planning skills for task decomposition.

---

## 4. Tools Extensions

These extensions add new capabilities the LLM can invoke.

### 4.1 pi-web-access

- **Author**: nicobailon
- **GitHub**: [github.com/nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access)
- **Install**: `pi install npm:pi-web-access`

Web search, content extraction, and video understanding. Zero-config mode reads Chrome session cookies to access Gemini directly. Smart fallbacks: search tries Perplexity -> Gemini API -> Gemini Web. YouTube analysis with transcripts, visual descriptions, frame extraction. GitHub URLs cloned locally for real file access. Jina Reader fallback for blocked pages.

### 4.2 pi-interactive-shell

- **Author**: nicobailon
- **GitHub**: [github.com/nicobailon/pi-interactive-shell](https://github.com/nicobailon/pi-interactive-shell)
- **Install**: `npx pi-interactive-shell`

Full PTY emulation for interactive CLIs. Architecture: `interactive_shell -> node-pty -> subprocess` with xterm-headless rendering as TUI overlay. Works with any CLI: vim, htop, psql, ssh, docker logs, git rebase -i, etc.

Three operating modes:
- **Interactive** (default): blocks until session ends
- **Hands-free**: returns immediately, agent polls for output
- **Dispatch**: auto-exit on quiet (5s default) with 30s startup grace

PTY preserved for 5 minutes post-exit for scrollback review. User can take over anytime.

### 4.3 pi-mcp-adapter

- **Author**: nicobailon
- **GitHub**: [github.com/nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter)
- **Install**: `pi install npm:pi-mcp-adapter`

Token-efficient MCP server bridge. Problem: a single MCP server can burn 10k+ tokens for tool definitions before conversation starts. Solution: one proxy tool (~200 tokens), on-demand tool discovery, lazy server startup/shutdown. Supports 100+ MCP servers. Option to promote frequently-used tools to native tools.

### 4.4 pi-super-curl

- **Listed in**: awesome-pi-agent
- **Purpose**: Enhanced curl request capabilities for the agent

### 4.5 pi-agent-scip

- **Listed in**: awesome-pi-agent
- **Purpose**: SCIP code intelligence integration for cross-language code navigation

### 4.6 pi-amplike (Skill)

- **Listed in**: awesome-pi-agent
- **Purpose**: Web search and webpage extraction via Jina APIs

### 4.7 pi-skills (Official)

- **Author**: badlogic
- **GitHub**: [github.com/badlogic/pi-skills](https://github.com/badlogic/pi-skills)

Official skill collection including:
- `brave-search`: Web search via Brave Search API
- `browser-tools`: Chrome DevTools Protocol automation
- `gccli`: Google Calendar CLI
- `gdcli`: Google Drive CLI
- `gmcli`: Gmail CLI
- `transcribe`: Groq Whisper speech-to-text
- `vscode`: VS Code diff integration
- `youtube-transcript`: YouTube video transcripts

---

## 5. UI/TUI Extensions

These extensions modify Pi's terminal interface.

### 5.1 pi-canvas

- **Listed in**: awesome-pi-agent
- **Purpose**: Interactive TUI canvases (calendar, documents, flights) rendered inline

### 5.2 pi-powerline-footer

- **Listed in**: awesome-pi-agent
- **Purpose**: Powerline-style status bar with git integration, context awareness, and token intelligence

### 5.3 pi-gui

- **Listed in**: awesome-pi-agent
- **Purpose**: GUI extension providing visual interface for the agent

### 5.4 pi-screenshots-picker

- **Listed in**: awesome-pi-agent
- **Purpose**: Enhanced screenshot selection for visual input

### 5.5 pi-sketch

- **Author**: ogulcancelik
- **Purpose**: Browser-based sketch pad for visual model input

### 5.6 pi-ghostty-theme-sync

- **Author**: ogulcancelik
- **Purpose**: Terminal theme synchronization with Ghostty terminal

### 5.7 pi-rose-pine (Theme)

- **Listed in**: awesome-pi-agent
- **Purpose**: Rose Pine color variants (main, moon, dawn)

### 5.8 ultrathink

- **Listed in**: shitty-extensions collection
- **Purpose**: Rainbow animated "ultrathink" text effect with Knight Rider shimmer

### 5.9 pi-ds

- **Listed in**: awesome-pi-agent
- **Purpose**: TUI design system components for extension developers

### 5.10 pi-interview-tool

- **Listed in**: awesome-pi-agent
- **Purpose**: Web-based forms with keyboard navigation for structured data collection

---

## 6. Quality, Safety & Observability Extensions

### 6.1 nono

- **Listed in**: awesome-pi-agent
- **Purpose**: Kernel-enforced capability sandbox for AI agents using Landlock (Linux) and Seatbelt (macOS). Blocks dangerous bash commands, protects sensitive paths.

### 6.2 gondolin

- **Author**: earendil-works
- **GitHub**: [github.com/earendil-works/gondolin](https://github.com/earendil-works/gondolin)
- **Purpose**: Linux micro-VM sandbox with programmable network/filesystem. Runs Pi tools inside a QEMU VM; mounts project at /workspace. Host-side policy control via JavaScript.

### 6.3 filter-output

- **Author**: michalvavra
- **Listed in**: awesome-pi-agent
- **Purpose**: Redacts sensitive data (API keys, tokens, passwords) from tool results before the LLM sees them

### 6.4 security extension

- **Author**: michalvavra
- **Purpose**: Blocks dangerous bash commands and protects sensitive file paths

### 6.5 toolwatch

- **Author**: kcosr (pi-extensions)
- **Purpose**: Auditing and approving tool calls before execution

### 6.6 pi-hooks (checkpoint/LSP/permissions)

- **Author**: prateekmedia
- **Purpose**: Checkpoint creation, LSP integration, and permission control systems

### 6.7 pi-rewind-hook

- **Listed in**: awesome-pi-agent
- **Purpose**: Git-based checkpoints (1 per turn) with `/rewind` command, diff preview, safe restore, and redo stack. Enables conversation branching.

### 6.8 cost-tracker / pi-cost-dashboard

- **Listed in**: shitty-extensions, awesome-pi-agent
- **Purpose**: Session spending analysis from pi logs. pi-cost-dashboard adds a web dashboard for monitoring API costs.

### 6.9 pi-notify / pi-notification-extension / pi-notify-pp

- **Various authors**: ferologics, others
- **Purpose**: Notification systems. pi-notify uses native desktop notifications via OSC 777. pi-notification-extension adds Telegram/bell alerts. pi-notify-pp adds rich notifications with tool stats and error tracking.

---

## 7. Session & Workflow Management Extensions

### 7.1 handoff

- **Listed in**: shitty-extensions
- **Purpose**: Transfer context to new focused sessions. Critical for long-running work that exceeds context limits.

### 7.2 memory-mode

- **Listed in**: shitty-extensions
- **Purpose**: Save instructions to AGENTS.md with AI-assisted integration

### 7.3 oracle

- **Listed in**: shitty-extensions
- **Purpose**: Get second opinion from alternative AI models without switching contexts

### 7.4 plan-mode

- **Listed in**: shitty-extensions
- **Purpose**: Read-only exploration mode for safe code analysis without modification risk

### 7.5 status-widget

- **Listed in**: shitty-extensions
- **Purpose**: Provider status indicators in the UI

### 7.6 pi-ssh-remote

- **Listed in**: awesome-pi-agent
- **Purpose**: Redirects all file operations and shell commands to a remote host via SSH

### 7.7 pi-dcp (Dynamic Context Pruning)

- **Listed in**: awesome-pi-agent
- **Purpose**: Intelligent conversation optimization for extended sessions. Prunes context dynamically to stay within token limits.

### 7.8 pi-prompt-template-model

- **Listed in**: awesome-pi-agent
- **Purpose**: Reusable prompts with model/skill frontmatter for standardized interactions

---

## 8. External Tooling & Infrastructure

These are standalone tools that work with Pi but are not Pi extensions.

### 8.1 oh-my-pi

- **Author**: can1357
- **GitHub**: [github.com/can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)

A full fork/reimagining of Pi with extensive additions: LSP support (11 operations, 40+ language configs), FUSE-overlay filesystem isolation, async background jobs (up to 100 concurrency), Agent Control Center dashboard, full MCP with OAuth, plugin CLI system, NVD/OSV/CISA KEV security database integrations. Essentially Pi-maximalist.

### 8.2 dmux

- **Author**: standardagents / formkit
- **GitHub**: [github.com/standardagents/dmux](https://github.com/standardagents/dmux)
- **Website**: [dmux.ai](https://dmux.ai)

Agent-agnostic dev multiplexer. Press `n` to create a new pane with prompt, pick agents (Claude Code, Codex, OpenCode), dmux handles worktree/branch/launch. A/B launches run two agents on same prompt side-by-side. AI-generated branch names and commit messages. Smart merging with auto-commit and cleanup. Multi-project support.

### 8.3 workmux

- **Author**: raine
- **GitHub**: [github.com/raine/workmux](https://github.com/raine/workmux)
- **Website**: [workmux.raine.dev](https://workmux.raine.dev)

Git worktrees + tmux windows for parallel AI agent development. Each worktree maps to a tmux window. Agent status visible in tmux window list. Streamlined flow from feature start to merge.

### 8.4 agent-desktop

- **Listed in**: awesome-pi-agent
- **Purpose**: Native UI desktop application for Pi

### 8.5 pi-mobile

- **Listed in**: awesome-pi-agent
- **Purpose**: Android client with Tailscale session management

### 8.6 CodexBar

- **Listed in**: awesome-pi-agent
- **Purpose**: macOS menu bar usage tracker supporting multiple AI coding tools

### 8.7 codemap

- **Listed in**: awesome-pi-agent
- **Purpose**: Token-aware codebase maps for LLMs

### 8.8 gob

- **Listed in**: awesome-pi-agent
- **Purpose**: Process manager with background job support

### 8.9 pi-synthetic

- **Listed in**: awesome-pi-agent
- **Purpose**: Synthetic provider adapter supporting open-source models (Llama, Mistral, etc.)

### 8.10 pi-acp

- **Listed in**: awesome-pi-agent
- **Purpose**: ACP (Agent Communication Protocol) adapter

---

## 9. Notable Extension Collections

### 9.1 shitty-extensions (hjanuschka)

- **GitHub**: [github.com/hjanuschka/shitty-extensions](https://github.com/hjanuschka/shitty-extensions)

Community collection bundling: branch-sessions, clipboard, cost-tracker, handoff, loop, memory-mode, oracle, plan-mode, status-widget, ultrathink, usage-bar.

### 9.2 pi-extensions (tmustier)

- **GitHub**: [github.com/tmustier/pi-extensions](https://github.com/tmustier/pi-extensions)

Set including: agent guidance, arcade interactions, ralph-wiggum loops, tab status, usage tracking.

### 9.3 pi-extensions (richardgill)

File browser, skill-task routing, parallel work execution.

### 9.4 pi-kit (butttons)

- **GitHub**: [github.com/butttons/pi-kit](https://github.com/butttons/pi-kit)

Personal extensions and skills collection.

### 9.5 agent-stuff (mitsupi)

Skills and extensions: answer, review, loop, files, todos, codex-tuning, whimsical, commit, changelog, GitHub, web browser, tmux, Sentry integrations.

### 9.6 rhubarb-pi

Background notifications, session emoji/color assignment, safe-git approval workflows.

---

## 10. Extension Pattern Taxonomy

### Category 1: Communication

| Pattern | Extensions |
|---------|-----------|
| File-based messaging | pi-collaborating-agents, pi-messenger, pi-agent-teams |
| SQLite-based messaging | Overstory |
| Steering prompts (inject turn) | pi-collaborating-agents, pi-messenger |
| File reservation/locking | pi-collaborating-agents, pi-messenger |
| Broadcast + direct messaging | All communication extensions |
| Activity feed | pi-messenger, pi-collaborating-agents |

### Category 2: Orchestration

| Pattern | Extensions |
|---------|-----------|
| tmux + worktree isolation | pi-side-agents, Overstory, dmux, workmux |
| Sequential chains | pi-subagents, pi-foreground-chains |
| Parallel fan-out/fan-in | pi-subagents, pi-messenger (Crew), pi-agent-teams |
| PRD-to-task decomposition | pi-messenger (Crew) |
| Queue-based execution | task-factory |
| Cross-runtime orchestration | Overstory |
| Dependency-graph scheduling | pi-messenger (Crew), pi-agent-teams |
| Merge queue with conflict resolution | Overstory, pi-side-agents |

### Category 3: Tools

| Pattern | Extensions |
|---------|-----------|
| Web search/fetch | pi-web-access, pi-amplike, pi-super-curl |
| Interactive CLI control | pi-interactive-shell |
| MCP bridging | pi-mcp-adapter |
| Code intelligence | pi-agent-scip, oh-my-pi (LSP) |
| Remote execution | pi-ssh-remote |
| Browser automation | pi-skills (browser-tools) |
| Video understanding | pi-web-access |

### Category 4: UI/TUI

| Pattern | Extensions |
|---------|-----------|
| Status bars | pi-powerline-footer, status-widget |
| Overlays/dashboards | pi-canvas, pi-gui, pi-cost-dashboard |
| Theme customization | pi-rose-pine, pi-ghostty-theme-sync |
| Visual input | pi-screenshots-picker, pi-sketch |
| Agent management overlay | pi-subagents, pi-collaborating-agents, pi-messenger |

### Category 5: Quality/Safety

| Pattern | Extensions |
|---------|-----------|
| Kernel-level sandboxing | nono (Landlock/Seatbelt) |
| VM-level sandboxing | gondolin (QEMU micro-VM) |
| Output redaction | filter-output |
| Tool call auditing | toolwatch |
| Dangerous command blocking | security extension |
| Checkpoint/rollback | pi-rewind-hook, pi-hooks |
| Cost monitoring | cost-tracker, pi-cost-dashboard, CodexBar |
| Context management | pi-dcp, handoff |

---

## 11. Gap Analysis: What Is Missing

Based on comprehensive mapping of the ecosystem, the following gaps would need to be addressed for a production-grade orchestrator:

### 11.1 Persistent Shared Memory / Knowledge Graph

**Gap**: No extension provides a shared knowledge base that persists across sessions and is queryable by all agents. pi-collaborating-agents has a message log, pi-messenger has an activity feed, but there is no structured semantic memory. Agents cannot ask "what did we learn about the auth module yesterday?"

**Needed**: A vector-store or knowledge-graph extension where agents write findings and other agents can query them. Something like a project-scoped RAG system.

### 11.2 Deterministic State Machine for Orchestration

**Gap**: All current orchestrators are either ad-hoc (pi-side-agents), event-driven-but-fragile (pi-messenger Crew), or heavyweight (Overstory). None provide a declarative state machine where transitions, rollback conditions, and retry policies are formally specified.

**Needed**: A workflow-as-code system (similar to Temporal or XState) where orchestration logic is defined declaratively, making it auditable, reproducible, and recoverable after crashes.

### 11.3 E2E Testing / Verification Gate

**Gap**: No extension provides automated end-to-end testing verification before marking tasks complete. pi-rewind-hook provides rollback, and pi-messenger has a reviewer role, but there is no automated test-runner integration that gates task completion.

**Needed**: An extension that wraps test execution (Jest, Playwright, pytest, etc.) and blocks task-completion signals until tests pass. Integration with Chrome DevTools MCP for browser-based E2E would be ideal.

### 11.4 Token Budget Management Across Fleet

**Gap**: Cost-tracker monitors individual session spending. No tool manages a token budget across an entire fleet of agents. An orchestrator spawning 10 workers has no way to set a fleet-wide spending cap or reallocate budget from idle agents to active ones.

**Needed**: A fleet-level token budget manager that the orchestrator reads before spawning agents and that workers check before expensive operations.

### 11.5 Conflict-Free Merge Automation

**Gap**: Overstory has a 4-tier merge queue but it is framework-specific. pi-side-agents has basic "LGTM, merge" but no conflict resolution. dmux and workmux have "smart merging" but are external tools. There is no universal Pi extension that handles merge conflicts intelligently.

**Needed**: A Pi extension providing: automatic rebase attempts, LLM-assisted conflict resolution, merge queue with priority ordering, and automatic CI/test validation post-merge.

### 11.6 Real-Time Observability Dashboard

**Gap**: Overstory has `ov dashboard`. pi-cost-dashboard provides cost monitoring. But there is no unified real-time dashboard showing: all active agents, their current task, token consumption, file reservations, message flow, merge queue status, and health indicators -- all in one place.

**Needed**: A TUI or web-based dashboard extension that aggregates data from whatever communication/orchestration layer is in use.

### 11.7 Human-in-the-Loop Escalation Protocol

**Gap**: pi-messenger has stuck detection (900s timeout). Overstory has tiered watchdog. But there is no standardized escalation protocol where agents can explicitly flag "I need human judgment" with structured context, and the orchestrator queues and prioritizes these escalations.

**Needed**: A formalized escalation channel with priority levels, structured context attachments, and notification routing (desktop, Slack, Telegram).

### 11.8 Cross-Project Agent Mobility

**Gap**: All extensions are project-scoped (`.pi/` directory). No extension supports an agent finishing work in project A and then moving to project B as part of a larger workflow.

**Needed**: A meta-orchestration layer that manages agents across multiple project directories, with context transfer and authorization scoping.

### 11.9 Formal Agent Capability Contracts

**Gap**: Pi extensions define tools in an ad-hoc way. There is no formal capability system where an orchestrator can query "which agents can run TypeScript tests?" or "which agents have web access?" and route tasks accordingly.

**Needed**: A capability registry where agents declare their tool access, model, and domain expertise, enabling intelligent task routing by the orchestrator.

### 11.10 Replay / Post-Mortem Analysis

**Gap**: pi-rewind-hook saves checkpoints. pi-messenger logs activity feeds. But there is no comprehensive replay system where an entire multi-agent workflow can be replayed step-by-step to diagnose failures or optimize performance.

**Needed**: A session-recorder extension that captures all agent actions, messages, tool calls, and outputs in a replayable format, with a TUI viewer for post-mortem analysis.

---

## 12. Key Community Figures

| Person | Contributions |
|--------|--------------|
| **Mario Zechner** (badlogic) | Pi creator, pi-mono maintainer, official pi-skills |
| **Nico Bailon** (nicobailon/nicopreme) | pi-messenger, pi-subagents, pi-interactive-shell, pi-web-access, pi-mcp-adapter, pi-foreground-chains -- the most prolific extension author |
| **Petr Baudis** (pasky) | pi-side-agents |
| **Baochun Li** (baochunli) | pi-collaborating-agents |
| **Thomas Mustier** (tmustier) | pi-agent-teams, pi-extensions collection |
| **can1357** | oh-my-pi (full Pi reimagining) |
| **jayminwest** | Overstory |
| **hjanuschka** | shitty-extensions collection |

---

## 13. Extension Distribution Landscape

**Primary channels**:
- npm (`pi install npm:<package>`) -- recommended for stable releases
- git (`pi install git:github.com/<user>/<repo>`) -- for bleeding-edge
- Manual clone into `~/.pi/agent/extensions/` or `~/.pi/agent/skills/`

**Discovery surfaces**:
- [awesome-pi-agent](https://github.com/qualisero/awesome-pi-agent) -- community curated list
- [GitHub Topics: pi-agent](https://github.com/topics/pi-agent), [pi-coding-agent](https://github.com/topics/pi-coding-agent)
- [Pi Packages page](https://shittycodingagent.ai/packages) -- official package directory
- Discord community (linked from pi.dev)
- X/Twitter -- active sharing under #pi-agent hashtag

**Package ecosystem size** (estimated, March 2026): 50-80 actively maintained extensions, 20+ skills, 5+ themes, growing rapidly.

---

## 14. Implications for L-Thread Orchestrator

The Pi extension ecosystem reveals that the community has converged on several patterns that directly validate or inform our orchestrator architecture:

1. **File-based messaging is the dominant IPC pattern** -- three of four major communication extensions use filesystem as transport. SQLite (Overstory) is the exception for performance-critical scenarios.

2. **tmux + git worktrees is the universal isolation pattern** -- every serious orchestration tool uses this combination. No exceptions.

3. **The "Crew" pattern (PRD -> dependency graph -> parallel waves) is the emerging standard** for task decomposition, appearing in pi-messenger and variants in pi-agent-teams.

4. **MCP adapter pattern is critical** -- pi-mcp-adapter's approach of lazy-loading tools via a proxy is the only scalable way to handle 100+ MCP servers without burning context.

5. **No extension solves the full orchestration problem** -- each addresses a slice (communication OR lifecycle OR tools), but none provides the integrated state machine + communication + lifecycle + verification loop that a production orchestrator needs. This is the gap our L-Thread Orchestrator fills.

---

*End of document. This map represents the state of the Pi extension ecosystem as of 2026-03-05 based on exhaustive web research.*

Sources:
- [pi-collaborating-agents](https://github.com/baochunli/pi-collaborating-agents)
- [pi-side-agents](https://github.com/pasky/pi-side-agents)
- [pi-foreground-chains](https://github.com/nicobailon/pi-foreground-chains)
- [pi-web-access](https://github.com/nicobailon/pi-web-access)
- [pi-interactive-shell](https://github.com/nicobailon/pi-interactive-shell)
- [pi-messenger](https://github.com/nicobailon/pi-messenger)
- [pi-subagents](https://github.com/nicobailon/pi-subagents)
- [pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter)
- [pi-agent-teams](https://github.com/tmustier/pi-agent-teams)
- [Overstory](https://github.com/jayminwest/overstory)
- [oh-my-pi](https://github.com/can1357/oh-my-pi)
- [dmux](https://github.com/standardagents/dmux)
- [workmux](https://github.com/raine/workmux)
- [awesome-pi-agent](https://github.com/qualisero/awesome-pi-agent)
- [pi-mono](https://github.com/badlogic/pi-mono)
- [pi-mono extensions docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [pi-skills](https://github.com/badlogic/pi-skills)
- [task-factory](https://github.com/patleeman/task-factory)
- [gondolin](https://github.com/earendil-works/gondolin)
- [shitty-extensions](https://github.com/hjanuschka/shitty-extensions)
- [Pi Packages](https://shittycodingagent.ai/packages)
- [pi.dev](https://shittycodingagent.ai/)
- [Mario Zechner blog post on building Pi](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Armin Ronacher on Pi within OpenClaw](https://lucumr.pocoo.org/2026/1/31/pi/)
- [PI Agent Revolution blog post](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [How to Build a Custom Agent Framework with PI](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Nico Bailon on X - MCP adapter](https://x.com/nicopreme/status/2024720851871158313)
- [Nico Bailon on X - model switching](https://x.com/nicopreme/status/2012980743685935290)
