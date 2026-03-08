# Pi Agent Community Extensions Map

**Source**: `research/2026-03-05_pi-community-extensions-complete-map.md`
**Date**: 2026-03-05
**Ecosystem size**: ~50-80 extensions, 20+ skills, 5+ themes (March 2026)

---

## Platform Architecture

| Package | Role |
|---------|------|
| `pi-ai` | Unified LLM API across providers |
| `pi-agent-core` | Agent loop with tool calling |
| `pi-coding-agent` | Full coding agent with built-in tools, extensibility |
| `pi-tui` | Terminal UI library |

**Extension primitives**: Extensions (TypeScript lifecycle hooks), Skills (SKILL.md workflow guides), Prompt Templates, Themes. All bundled as Pi Packages via npm or git.

---

## Multi-Agent Communication

| Extension | Author | Install | Description |
|-----------|--------|---------|-------------|
| pi-collaborating-agents | baochunli | `npm:@baochunli/pi-collaborating-agents` | File-based coordination: auto-generated callsigns, direct/broadcast messaging, file reservation, `/agents` overlay, `/subagent` spawning |
| pi-messenger | nicobailon | `npm:pi-messenger` | Most feature-rich: file-based messaging, steering prompts, file reservation, activity feed, stuck detection (900s). Includes **Crew** (PRD-to-task orchestration with planner/worker/reviewer in parallel waves) |
| pi-agent-teams | tmustier | GitHub | Experimental swarm: shared task list with dependency tracking, file-based mailboxes, idle agent auto-pickup |

---

## Orchestration & Subagent Management

| Extension | Author | Install | Description |
|-----------|--------|---------|-------------|
| pi-side-agents | pasky | GitHub (~84 stars) | tmux/worktree/merge lifecycle. `/agent <task>` spawns background agents in isolated tmux windows + topic branches. Auto-merge on "LGTM, merge" |
| pi-subagents | nicobailon | `npm:pi-subagents` | Async delegation: single, sequential chains, parallel fan-out/fan-in, background/async. Built-in agent types (scout, planner, worker, reviewer). Chain files (`.chain.md`) for reusable pipelines |
| pi-foreground-chains | nicobailon | git clone into `~/.pi/agent/skills/` | Skill for sequential multi-agent workflows with full user visibility. Scout -> Planner -> Worker -> Reviewer |
| Overstory | jayminwest | GitHub (standalone) | Cross-runtime orchestration (Claude Code, Pi, Gemini CLI, Copilot, Codex). SQLite mail, FIFO merge queue, tiered watchdog, hierarchical teams, TUI dashboard |
| PiSwarm | (awesome-pi-agent) | -- | Parallel GitHub issue/PR processing using git worktrees |
| task-factory | patleeman | GitHub | Queue-first work orchestrator. "The human is the bottleneck" -- stage work, system sequences execution |

---

## Tools & Capabilities

| Extension | Author | Install | Description |
|-----------|--------|---------|-------------|
| pi-web-access | nicobailon | `npm:pi-web-access` | Web search, content extraction, YouTube analysis. Zero-config Chrome cookies for Gemini. Fallbacks: Perplexity -> Gemini API -> Gemini Web -> Jina Reader |
| pi-interactive-shell | nicobailon | `npx pi-interactive-shell` | Full PTY emulation (vim, htop, psql, ssh, etc.). Three modes: interactive, hands-free, dispatch |
| pi-mcp-adapter | nicobailon | `npm:pi-mcp-adapter` | Token-efficient MCP bridge. One proxy tool (~200 tokens) instead of 10k+ per server. Supports 100+ MCP servers. Lazy startup/shutdown |
| pi-super-curl | (awesome-pi-agent) | -- | Enhanced curl capabilities |
| pi-agent-scip | (awesome-pi-agent) | -- | SCIP code intelligence for cross-language navigation |
| pi-amplike | (awesome-pi-agent) | -- | Web search and extraction via Jina APIs |
| pi-skills (Official) | badlogic | GitHub | brave-search, browser-tools, gccli, gdcli, gmcli, transcribe, vscode, youtube-transcript |

---

## UI/TUI

| Extension | Author | Description |
|-----------|--------|-------------|
| pi-canvas | (awesome-pi-agent) | Interactive TUI canvases (calendar, documents, flights) |
| pi-powerline-footer | (awesome-pi-agent) | Powerline-style status bar with git/context/token info |
| pi-gui | (awesome-pi-agent) | GUI extension for visual interface |
| pi-screenshots-picker | (awesome-pi-agent) | Enhanced screenshot selection for visual input |
| pi-sketch | ogulcancelik | Browser-based sketch pad for visual model input |
| pi-ghostty-theme-sync | ogulcancelik | Terminal theme sync with Ghostty |
| pi-rose-pine | (awesome-pi-agent) | Rose Pine color variants (main, moon, dawn) |
| ultrathink | shitty-extensions | Rainbow animated text effect |
| pi-ds | (awesome-pi-agent) | TUI design system components for extension devs |
| pi-interview-tool | (awesome-pi-agent) | Web forms with keyboard nav for structured data collection |

---

## Quality, Safety & Observability

| Extension | Author | Description |
|-----------|--------|-------------|
| nono | (awesome-pi-agent) | Kernel-enforced sandbox (Landlock on Linux, Seatbelt on macOS). Blocks dangerous commands, protects paths |
| gondolin | earendil-works | Linux micro-VM sandbox (QEMU). Mounts project at /workspace. Host-side JS policy control |
| filter-output | michalvavra | Redacts API keys, tokens, passwords from tool results before LLM sees them |
| security extension | michalvavra | Blocks dangerous bash commands, protects sensitive file paths |
| toolwatch | kcosr | Auditing and approving tool calls before execution |
| pi-hooks | prateekmedia | Checkpoint creation, LSP integration, permission control |
| pi-rewind-hook | (awesome-pi-agent) | Git checkpoints (1/turn), `/rewind` command, diff preview, redo stack, conversation branching |
| cost-tracker / pi-cost-dashboard | shitty-extensions / awesome-pi-agent | Session spending analysis. Dashboard adds web UI for cost monitoring |
| pi-notify / pi-notification-extension / pi-notify-pp | ferologics et al. | Notification systems: native desktop (OSC 777), Telegram/bell alerts, rich notifications with tool stats |

---

## Session & Workflow Management

| Extension | Source | Description |
|-----------|--------|-------------|
| handoff | shitty-extensions | Transfer context to new focused sessions (for context limit overflows) |
| memory-mode | shitty-extensions | Save instructions to AGENTS.md with AI-assisted integration |
| oracle | shitty-extensions | Second opinion from alternative AI models without switching contexts |
| plan-mode | shitty-extensions | Read-only exploration mode for safe code analysis |
| status-widget | shitty-extensions | Provider status indicators in UI |
| pi-ssh-remote | (awesome-pi-agent) | Redirects file ops and shell commands to remote host via SSH |
| pi-dcp | (awesome-pi-agent) | Dynamic Context Pruning -- intelligent context optimization for long sessions |
| pi-prompt-template-model | (awesome-pi-agent) | Reusable prompts with model/skill frontmatter |

---

## External Tooling & Infrastructure

| Tool | Author | Description |
|------|--------|-------------|
| oh-my-pi | can1357 | Full Pi fork/reimagining: LSP (11 ops, 40+ lang configs), FUSE filesystem isolation, async background jobs (100 concurrency), Agent Control Center dashboard, full MCP with OAuth, plugin CLI, NVD/OSV/CISA KEV security DBs |
| dmux | standardagents/formkit | Agent-agnostic dev multiplexer. Worktree/branch/launch for Claude Code, Codex, OpenCode. A/B agent testing side-by-side. AI-generated branch names/commits. dmux.ai |
| workmux | raine | Git worktrees + tmux windows for parallel agent dev. Each worktree = tmux window. workmux.raine.dev |
| agent-desktop | (awesome-pi-agent) | Native UI desktop application for Pi |
| pi-mobile | (awesome-pi-agent) | Android client with Tailscale session management |
| CodexBar | (awesome-pi-agent) | macOS menu bar usage tracker for multiple AI coding tools |
| codemap | (awesome-pi-agent) | Token-aware codebase maps for LLMs |
| gob | (awesome-pi-agent) | Process manager with background job support |
| pi-synthetic | (awesome-pi-agent) | Synthetic provider adapter for open-source models (Llama, Mistral, etc.) |
| pi-acp | (awesome-pi-agent) | ACP (Agent Communication Protocol) adapter |

---

## Extension Collections

| Collection | Author | Contents |
|------------|--------|----------|
| shitty-extensions | hjanuschka | branch-sessions, clipboard, cost-tracker, handoff, loop, memory-mode, oracle, plan-mode, status-widget, ultrathink, usage-bar |
| pi-extensions | tmustier | agent guidance, arcade interactions, ralph-wiggum loops, tab status, usage tracking |
| pi-extensions | richardgill | file browser, skill-task routing, parallel work execution |
| pi-kit | butttons | Personal extensions and skills collection |
| agent-stuff | mitsupi | answer, review, loop, files, todos, codex-tuning, whimsical, commit, changelog, GitHub, web browser, tmux, Sentry |
| rhubarb-pi | -- | Background notifications, session emoji/color assignment, safe-git approval workflows |

---

## Key Community Figures

| Person | Handle | Contributions |
|--------|--------|---------------|
| Mario Zechner | badlogic | Pi creator, pi-mono maintainer, official pi-skills |
| Nico Bailon | nicobailon/nicopreme | pi-messenger, pi-subagents, pi-interactive-shell, pi-web-access, pi-mcp-adapter, pi-foreground-chains (most prolific) |
| Petr Baudis | pasky | pi-side-agents |
| Baochun Li | baochunli | pi-collaborating-agents |
| Thomas Mustier | tmustier | pi-agent-teams, pi-extensions collection |
| can1357 | can1357 | oh-my-pi (full Pi reimagining) |
| jayminwest | jayminwest | Overstory |
| hjanuschka | hjanuschka | shitty-extensions collection |

---

## Ecosystem Gaps (as of March 2026)

| Gap | What's Missing |
|-----|----------------|
| Persistent shared memory | No cross-session queryable knowledge base for agents |
| Deterministic state machine | No declarative workflow-as-code (Temporal/XState-style) orchestration |
| E2E testing gate | No automated test-runner integration that gates task completion |
| Fleet token budget | No fleet-wide spending cap or budget reallocation across agents |
| Conflict-free merge automation | No universal merge conflict resolution extension |
| Unified observability dashboard | No single pane of glass for agents, tasks, tokens, messages, merge queue |
| Human-in-the-loop escalation | No formalized escalation protocol with priority levels |
| Cross-project agent mobility | All extensions project-scoped; no meta-orchestration across repos |
| Agent capability contracts | No formal capability registry for intelligent task routing |
| Replay / post-mortem | No comprehensive multi-agent workflow replay system |

---

## Burak's Notes

<!-- Add notes here -->

---

*Reference entry generated from research doc dated 2026-03-05.*
