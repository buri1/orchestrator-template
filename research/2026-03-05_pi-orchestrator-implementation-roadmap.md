# Pi Orchestrator: Concrete Implementation Roadmap

**Date:** 2026-03-05
**Status:** Implementation Plan
**Scope:** From L-Thread Orchestrator (prompt-only, Claude Code) to Pi Agent Custom Harness (TypeScript extensions, model-agnostic)
**Prerequisites:** Architecture Blueprint, Migration Feasibility Analysis, Master Synthesis

---

## 1. Inventory of Reusable Assets

Before writing a single line of extension code, the implementation must audit what already exists and determine what to adopt, fork, or merely learn from.

### 1.1 Community Extensions to Adopt Directly

**pi-subagents (nicobailon/pi-subagents)**
This extension provides async subagent delegation with truncation, artifacts, and session sharing. It ships six ready-to-use agent definitions -- scout, planner, worker, reviewer, context-builder, and researcher -- each configured as markdown files with YAML frontmatter. The key feature for the orchestrator is management actions: the LLM can discover, inspect, create, and modify agent definitions at runtime without manual file editing or restart. Chain orchestration via `.chain.md` files enables codified multi-step workflows that L-Thread currently hardcodes in prompt text.

**Adoption strategy:** Install directly via `pi install npm:pi-subagents`. Use the built-in reviewer and worker agents as starting templates. Create custom orchestrator-specific agent definitions (coder, e2e-tester, lint-fixer) by writing new markdown files in `.pi/agents/`. Use chain files for the standard orchestration loop (plan -> implement -> review -> merge -> test).

**pi-mcp-adapter (nicobailon/pi-mcp-adapter)**
The adapter bridges MCP servers into Pi with a single proxy tool costing approximately 200 tokens versus 18,000+ for raw MCP server definitions. As of February 2026, it supports promoting specific MCP tools to first-class status via a TUI panel so they load immediately on session start. Servers connect lazily and shut down when idle.

**Adoption strategy:** Install directly. Configure Chrome DevTools MCP as the primary server. Promote `navigate_page`, `take_screenshot`, `emulate`, and `evaluate_script` to first-class status since E2E testing is a core gate. Keep Notion and shadcn MCP servers as lazy-loaded for agents that need them.

**pi-messenger (nicobailon/pi-messenger)**
This is the most architecturally relevant extension for the orchestrator. Agents join a shared overlay, see who is online, reserve files, and send messages in real time. When given a PRD, it decomposes the plan into a dependency graph, fans out parallel workers in waves, and coordinates them through the shared overlay. Message delivery uses Pi's message routing: normal messages are queued with `followUp`, urgent messages interrupt immediately with `steer`.

**Adoption strategy:** Install directly. Use pi-messenger as the default communication backbone for Teams mode (parallel multi-agent). Its dependency-graph decomposition maps directly to the L-Thread GET_NEXT_TASK pattern, and its file reservation system is a capability L-Thread lacks entirely. The orchestrator extension will sit on top of pi-messenger, adding the discipline rules and E2E gate enforcement that pi-messenger does not provide.

### 1.2 Community Extensions to Learn From

**pi-side-agents (pasky/pi-side-agents)**
This extension spawns one-off child agents in separate tmux windows with their own git worktrees. Each child is ephemeral -- it lives and dies with its topic branch and tmux window. The extension shows active-agent summary with tmux window numbers in the statusline. It automates the full tmux/worktree/merge lifecycle.

**Learning:** The tmux window-per-agent pattern validates L-Thread's existing tmux approach. The key insight is the worktree isolation: each agent gets a full copy of the repository, preventing file conflicts. However, pi-side-agents is designed for interactive use (user spawns agents via `/agent` command and manually reviews via LGTM), not for automated orchestration loops. The orchestrator needs programmatic control, not interactive commands.

**Adoption decision:** Do not install directly. Instead, adopt the worktree isolation pattern by configuring `isolation: worktree` in custom agent frontmatter (a Pi-native feature). Use pi-messenger for communication rather than pi-side-agents' manual tmux window switching.

**pi-collaborating-agents (baochunli/pi-collaborating-agents)**
This extension provides file reservation enforcement via Pi's edit/write tool hooks -- when an agent tries to edit a reserved file, the tool call gets blocked and the agent sees who reserved it, why, and a suggestion to coordinate. It includes a recursion guard (`PI_COLLAB_SUBAGENT_DEPTH` tracking) to prevent runaway nested spawning.

**Learning:** The file reservation enforcement pattern is critical. When multiple agents work on overlapping files, uncoordinated edits create merge conflicts. The tool-hook-based blocking is the right approach. The recursion guard is also important -- L-Thread does not have this, and runaway agent spawning is a real risk.

**Adoption decision:** If pi-messenger's file reservation proves insufficient, install pi-collaborating-agents as a supplementary layer. Otherwise, implement the file reservation pattern as a lightweight hook in the orchestrator-discipline extension (approximately 30 lines of code).

**oh-my-pi (can1357/oh-my-pi)**
This fork adds native subagent support (in-process via `createAgentSession`), LSP for 40+ languages, browser integration, and parallel subagent execution with configurable concurrency up to 100 jobs. The latest release (v13.9.2, March 5 2026) shows extremely active development.

**Learning:** oh-my-pi's in-process subagent model (`createAgentSession`, `SessionManager`, direct event subscription) is architecturally superior to tmux-based spawning for performance. No child process overhead, no filesystem polling, direct event streams. However, it introduces fork risk -- oh-my-pi moves fast and may diverge from pi-mono's extension API.

**Adoption decision:** Start on pi-mono. If tmux-based spawning proves too slow or unreliable for the orchestration loop, evaluate migrating to oh-my-pi as the runtime. The extension code would require minimal changes since oh-my-pi maintains pi-mono extension compatibility.

**Overstory (jayminwest/overstory)**
This is a standalone multi-agent orchestration framework with a pluggable `AgentRuntime` interface that supports Claude Code, Pi, Gemini CLI, and custom adapters. It uses SQLite-backed messaging (WAL mode, approximately 1-5ms per query) instead of filesystem messaging, and features tiered health monitoring: Tier 0 mechanical daemon (tmux/pid liveness), Tier 1 AI-assisted failure triage, Tier 2 monitor agent for continuous fleet patrol.

**Learning:** Overstory's three-tier health monitoring is more sophisticated than anything in the L-Thread system. The SQLite mail system is faster than filesystem polling (1-5ms vs approximately 50-100ms for file reads). The pluggable runtime interface is worth studying if the orchestrator ever needs to manage agents running on different harnesses.

**Adoption decision:** Do not install. Overstory is a separate orchestration layer, not a Pi extension. However, adopt its three-tier health monitoring pattern as a design principle for the orchestrator's agent lifecycle management.

**dmux (standardagents/dmux)**
A dev agent multiplexer for git worktrees and coding agents. Creates a tmux pane per task, each with its own git worktree and branch. Supports multi-agent selection per pane. Smart merging with auto-commit, merge, and cleanup.

**Learning:** dmux validates the tmux + worktree + merge pattern at a simpler level than Overstory. Its UI (press 'n' to create, 'm' to merge) is worth emulating in the orchestrator's TUI dashboard for manual intervention mode.

### 1.3 L-Thread Patterns to Preserve

The following L-Thread patterns transfer directly to Pi and must be preserved in the implementation:

| Pattern | Current Implementation | Pi Implementation |
|---------|----------------------|-------------------|
| 4 Absolute Rules | Prompt text in `orchestrator.md` | `tool_call` hooks that return `{ block: true, reason: "..." }` |
| State persistence | `_bmad/orchestrator-state.json` flat file | Same file + `pi.appendEntry()` for session-scoped backup |
| E2E gate | Chrome DevTools MCP, manual enforcement | `tool_call` hook blocking issue-close without E2E verdict file |
| Tiered context | Manual loading in prompt | `before_agent_start` and `context` event hooks |
| FutureLearnings | `memory/FutureLearnings.md` manually read | Skill (`SKILL.md`) with auto-load on error pattern match |
| Bounded review loops | Prompt-enforced max 3 cycles | Extension counter, hard block at limit |
| AUTO-MODE | File check in prompt | Extension reads `.bmad/AUTO_MODE`, suppresses `input` events |
| SessionStart hook | `.bmad/scripts/orchestrator-session-start.sh` | `session_start` event handler |
| PreCompact hook | `.bmad/scripts/orchestrator-handoff.sh` | `session_before_compact` event handler |
| Devlog | Manual append to `_bmad/devlog.md` | `agent_end` hook with automatic append |
| Tmux recovery | `tmux has-session` + state probe | Same mechanism, wrapped in extension |
| Decision audit | None | JSONL append-only log (`_bmad/decisions.jsonl`) -- new capability |

---

## 2. Architecture Decisions

### 2.1 Extension Architecture: Composable, Not Monolithic

The 2026 industry consensus strongly favors composable architectures for agent systems. Pi's extension model is inherently composable -- each extension is a self-contained TypeScript module that hooks into the agent lifecycle independently. The orchestrator must follow this pattern.

**Decision:** Build 5-6 focused extensions rather than one monolithic orchestrator extension. Each extension has a single responsibility and can be installed, updated, or disabled independently.

| Extension | Responsibility | Hooks Used | Priority |
|-----------|---------------|------------|----------|
| `orchestrator-discipline` | Rule enforcement (no-code, E2E gate, review bounds, auto-mode) | `tool_call`, `session_start`, `input` | P0 |
| `orchestrator-state` | State persistence, tiered context, decision logging | `session_start`, `session_before_compact`, `turn_end`, `agent_end` | P0 |
| `orchestrator-loop` | Automated orchestration cycle (plan -> spawn -> wait -> review -> merge -> test -> done) | `input`, `before_agent_start`, `agent_end` | P1 |
| `orchestrator-health` | Agent heartbeat monitoring, timeout kills, escalation | `tool_call` (heartbeat tracking), `turn_end` | P1 |
| `orchestrator-dashboard` | TUI status widget, cost display, decision log tail | Custom rendering via `pi.registerComponent()` | P2 |
| `orchestrator-devlog` | Automatic devlog generation and session summaries | `agent_end`, `session_shutdown` | P2 |

**Rationale:** This decomposition means Phase 1 delivers enforcement (orchestrator-discipline + orchestrator-state) without needing the orchestration loop. A developer can run Pi with just the discipline extensions and get immediate value -- no code writing, E2E gating, and state persistence -- while still orchestrating manually.

### 2.2 Communication: pi-messenger as Primary, File Inboxes as Fallback

Three communication options were evaluated:

| Option | Token Cost | Latency | Complexity | Maturity |
|--------|-----------|---------|------------|----------|
| pi-messenger | Near-zero (uses Pi's native `followUp`/`steer`) | Sub-second | Low (install and configure) | Medium (active development) |
| Custom file-based inboxes | Zero | 1-2 seconds (polling) | Medium (must build) | N/A (custom) |
| A2A protocol | ~500 tokens per agent card | Variable | High (protocol implementation) | Low (early) |

**Decision:** Use pi-messenger for agent-to-agent communication and task coordination. It provides dependency graph decomposition, file reservation, and message routing out of the box. Keep the custom file-based inbox pattern (from the architecture blueprint) as a documented fallback for environments where pi-messenger is unavailable.

A2A is deferred. It solves cross-machine and cross-harness coordination, which is not the current problem. When cross-machine becomes a requirement, evaluate Overstory's pluggable runtime approach.

### 2.3 State: Hybrid JSON + appendEntry

**Decision:** Continue using `_bmad/orchestrator-state.json` as the primary state file. Add `pi.appendEntry()` as a secondary persistence channel for session-scoped state that benefits from compaction survival.

The JSON file remains the source of truth because:
- External tools (tmux helpers, monitoring scripts) can read it without Pi SDK access
- It survives session changes (`/new`)
- The schema is already validated across L-Thread projects

`pi.appendEntry()` adds value because:
- Entries survive compaction (embedded in session history)
- Navigable via Pi's `/tree` command for debugging
- Acts as an automatic backup of state transitions

SQLite was considered (Overstory uses it) but rejected for this implementation. SQLite adds a dependency, requires WAL configuration for concurrent access, and provides query capabilities that a 5-agent orchestrator does not need. If the orchestrator scales beyond 10 concurrent agents, reconsider SQLite.

### 2.4 Agent Roles and Model Routing

Based on the architecture blueprint's model routing table and real-world cost data:

| Role | Model | Rationale | Worktree Isolation | MCP Access |
|------|-------|-----------|-------------------|------------|
| **Orchestrator** | Claude Opus 4 | Best reasoning for planning, dependency resolution, judgment | No (reads only) | Chrome DevTools (for E2E), Notion (for task lookup) |
| **Coder** | Claude Sonnet 4.5 | Best code generation quality-to-cost ratio | Yes (`isolation: worktree`) | None |
| **Reviewer** | Claude Opus 4 | Deep reasoning about correctness, security, architecture | No (read-only access) | None |
| **E2E Tester** | Claude Haiku 3.5 | Test scripts are formulaic; fast model reduces gate latency | No | Chrome DevTools (full access) |
| **Lint Fixer** | Claude Haiku 3.5 or MorphLLM | Repetitive mechanical fixes | Yes | None |
| **Researcher** | Gemini 2.5 Pro | 1M token context for reading large codebases | No | None |

**Dynamic escalation:** If a Haiku agent fails (error, timeout, or output quality below threshold), escalate to Sonnet. If Sonnet fails, escalate to Opus. Log escalation in the decision log with cost delta.

**Agent definition via frontmatter:**
```yaml
---
name: coder
model: anthropic/claude-sonnet-4-5
thinking: medium
isolation: worktree
tools:
  - read
  - write
  - edit
  - bash
  - grep
  - find
---
You are a senior software engineer. You write clean, tested code.
[Task-specific instructions injected by orchestrator-loop extension]
```

This uses Pi's native custom agent system. No extension code needed for agent role definition -- just markdown files with YAML frontmatter.

### 2.5 Process Management: Pi SDK Subagents, Not Tmux

The feasibility analysis recommended tmux as the agent spawning mechanism (matching L-Thread's approach). After additional research, the recommendation changes:

**Decision:** Use Pi's native subagent spawning (either pi-subagents extension or oh-my-pi's `createAgentSession`) as the primary mechanism. Keep tmux as a fallback and debugging tool.

**Rationale:**
- pi-subagents spawns agents programmatically with session sharing, truncation, and artifact collection
- Custom agent frontmatter provides `isolation: worktree` natively -- no manual `git worktree add` scripts
- oh-my-pi's in-process subagents run with direct event subscription, eliminating filesystem polling latency
- tmux is still useful for debugging (visible terminal output) and crash recovery, but should not be the primary spawn mechanism

**Tmux retained for:**
- Debugging: spawn agents in visible tmux panes when investigating issues
- Crash recovery: tmux sessions survive terminal crashes; state files enable resume
- Manual intervention: when AUTO-MODE is disabled, operator can switch tmux windows to interact with stuck agents

---

## 3. Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Pi running with orchestrator discipline rules and state persistence. Single-agent only. No multi-agent spawning yet.

**Week 1: Core Setup and Discipline Extension**

Day 1-2: Environment setup
- Install Pi globally (`npm i -g @mariozechner/pi-coding-agent`)
- Install pi-mcp-adapter (`pi install npm:pi-mcp-adapter`)
- Configure `.pi/settings.json` with model preferences and extension paths
- Configure `.pi/mcp.json` with Chrome DevTools MCP server
- Create `AGENTS.md` at project root (port orchestrator persona from `.claude/agents/orchestrator.md`)
- Verify: Pi starts, loads AGENTS.md, and can execute basic commands

Day 3-4: orchestrator-discipline extension
- Implement `tool_call` hook that blocks `edit`/`write` on code files when role is orchestrator
- Implement `tool_call` hook that blocks `gh issue close` without E2E verdict
- Implement `session_start` handler that reads `.bmad/AUTO_MODE`
- Implement bounded review counter (reset per task, block at 3)
- Test: Attempt to write a `.ts` file as orchestrator -- confirm blocked. Attempt to close issue without E2E -- confirm blocked.

Day 5: orchestrator-state extension (basic)
- Implement `session_start` handler that loads `_bmad/orchestrator-state.json`
- Implement `session_before_compact` handler that saves state + writes handoff context
- Implement `turn_end` handler that persists state changes via both file write and `pi.appendEntry()`
- Test: Start Pi, make state changes, compact session, verify state survives.

**Week 2: E2E Gate and State Refinement**

Day 1-2: E2E testing integration
- Configure Chrome DevTools MCP via pi-mcp-adapter with promoted tools (`take_screenshot`, `navigate_page`, `emulate`, `evaluate_script`)
- Implement E2E verdict file system (`_bmad/e2e-verdicts/<taskId>.json`)
- Wire E2E gate into orchestrator-discipline: state writes marking tasks "done" are blocked unless verdict file exists and passes
- Test: Run E2E test against existing project, verify verdict file creation. Attempt to mark done without E2E -- confirm blocked.

Day 3-4: Tiered context system
- Implement context tier builder: Tier 0 (current task, <2K tokens), Tier 1 (task + related, <8K tokens), Tier 2 (full project, <32K tokens)
- Implement `before_agent_start` hook that injects Tier 0 context for spawned agents
- Implement `context` event hook that strips stale context before LLM calls
- Test: Verify context sizes stay within budget. Verify context injection on agent start.

Day 5: Integration testing
- Run the discipline + state extensions together on a real project (e.g., Lagerlink)
- Test all 4 Absolute Rules are enforced
- Test state persistence through compaction
- Test E2E gate prevents premature task completion
- Document any Pi API surprises or incompatibilities

**Phase 1 Exit Criteria:**
- All 4 Absolute Rules enforced programmatically (not just prompt text)
- State persists through compaction and session restart
- E2E gate functional with Chrome DevTools MCP
- Tiered context system operational
- Running alongside Claude Code on the same project without conflicts

### Phase 2: Multi-Agent Orchestration (Week 3-5)

**Goal:** Full orchestration loop with multiple agents. Equivalent to L-Thread conduit + teams modes.

**Week 3: Agent Spawning and Communication**

Day 1-2: Install and configure community extensions
- Install pi-subagents (`pi install npm:pi-subagents`)
- Install pi-messenger (`pi install npm:pi-messenger`)
- Create custom agent definitions in `.pi/agents/`:
  - `coder.md` (worktree isolation, Sonnet 4.5, code tools only)
  - `reviewer.md` (read-only, Opus 4, no write/edit tools)
  - `e2e-tester.md` (Haiku, Chrome DevTools MCP access)
  - `lint-fixer.md` (Haiku, edit tools only)
- Test: Manually spawn each agent type. Verify isolation, model selection, and tool access.

Day 3-4: orchestrator-loop extension (sequential mode)
- Implement the core loop as a registered command (`/orchestrate`):
  1. GET_NEXT_TASK: Read GitHub issues via `gh issue list` or state file task queue
  2. SPAWN_AGENT: Use pi-subagents to spawn a coder agent with Tier 0 context
  3. WAIT_FOR_COMPLETION: Subscribe to `agent_end` event (event-driven, no polling)
  4. REVIEW: Spawn reviewer agent with handoff payload
  5. HANDLE_FEEDBACK: If review fails, re-spawn coder with feedback (bounded to 3 cycles)
  6. MERGE: Execute `gh pr merge` via bash tool
  7. E2E_TEST: Spawn e2e-tester agent with Chrome DevTools MCP
  8. MARK_DONE: Update state, close issue (gated by E2E verdict)
  9. LOG: Append to devlog
  10. CONTINUE: Loop to GET_NEXT_TASK (if AUTO-MODE enabled, no user prompt)
- Test: Run one complete cycle on a simple task. Verify each step fires correctly.

Day 5: Handoff system
- Implement handoff payload generation (files changed, decisions made, open questions, test results)
- Implement handoff injection into next agent's starting context
- Test: Coder completes task, handoff payload flows to reviewer with correct file list and decisions.

**Week 4: Parallel Mode and Health Monitoring**

Day 1-2: orchestrator-loop parallel mode
- Extend the loop to support parallel agent spawning when tasks have no dependencies
- Use pi-messenger's dependency graph decomposition: give it the task list, let it determine wave execution order
- Implement pool limit enforcement (max 5 concurrent agents)
- Test: Create 3 independent tasks. Verify all 3 agents spawn in parallel. Verify pool limit blocks 6th agent.

Day 3-4: orchestrator-health extension
- Implement heartbeat monitoring: each agent writes a timestamp to `_bmad/agent-inboxes/<id>/.heartbeat` every 15 seconds
- Implement timeout detection: if heartbeat age exceeds 60 seconds, mark agent as unresponsive
- Implement kill and respawn: unresponsive agents are killed, task is re-queued with error context
- Implement Overstory-inspired tiered health:
  - Tier 0: Mechanical check (heartbeat file timestamp, tmux pane existence)
  - Tier 1: AI-assisted triage (read last 50 lines of agent output, determine if stuck or working)
  - Tier 2: Monitor sweep (periodic check of all agents, log fleet status)
- Test: Spawn agent, simulate hang (sleep in agent), verify timeout detection and kill.

Day 5: File reservation and conflict prevention
- If pi-messenger's file reservation is sufficient, configure it
- If not, implement lightweight file reservation in orchestrator-discipline:
  - `tool_call` hook checks a reservation registry before allowing `edit`/`write`
  - Reservation acquired when agent is assigned a task, released on completion
  - Blocked writes include helpful message: "File reserved by agent X for task Y"
- Test: Two agents attempt to edit the same file. Verify second agent is blocked with clear message.

**Week 5: Roadblock Recovery and Intelligence**

Day 1-2: Roadblock recovery extension
- Implement `/roadblock` command for manual invocation
- Implement auto-detection: `tool_result` hook scans for error patterns (compilation errors, test failures, timeout patterns)
- Implement FutureLearnings lookup: load `memory/FutureLearnings.md`, match error symptoms to INC-XXX entries
- Implement recovery actions:
  - If matching INC found: inject fix instructions into agent context via `steer` message
  - If no match: spawn research agent to investigate
  - If 3 recovery attempts fail: skip task, log roadblock, continue (AUTO-MODE behavior)
- Test: Introduce a known error (matching an existing INC entry). Verify auto-detection, lookup, and fix injection.

Day 3-4: FutureLearnings as a Pi Skill
- Create `.pi/skills/future-learnings/SKILL.md` that wraps the incident database
- Frontmatter triggers: auto-load when error patterns detected, searchable by INC ID
- Include common error resolution patterns as skill instructions
- Test: Agent encounters error, skill auto-loads, resolution instructions appear in context.

Day 5: Full integration test
- Run the complete orchestration loop on a real project with 3+ tasks
- Verify: sequential mode (tasks with dependencies run in order)
- Verify: parallel mode (independent tasks run concurrently)
- Verify: roadblock recovery (simulated error triggers INC lookup)
- Verify: E2E gate (no task completes without passing test)
- Measure: total token usage, cost, time per task, time per orchestration cycle

**Phase 2 Exit Criteria:**
- Full orchestration loop (GET_NEXT -> SPAWN -> REVIEW -> MERGE -> E2E -> DONE) operational
- Both sequential and parallel modes working
- Agent health monitoring with timeout detection and kill
- File reservation preventing concurrent edit conflicts
- Roadblock recovery with FutureLearnings integration
- Cost tracking per agent, per task, per session

### Phase 3: Migration and Polish (Week 6-8)

**Goal:** Migrate all projects from Claude Code to Pi. Build observability and optimization layers.

**Week 6: Project Migration**

Day 1-2: Migrate first real project (Lagerlink recommended -- most mature, best test coverage)
- Set up `.pi/` configuration alongside existing `.claude/`
- Run orchestrator on 2-3 real sprint tasks
- Compare: task completion time, cost, error rate vs Claude Code baseline
- Document any gaps or regressions

Day 3-4: Migrate second project
- Apply lessons learned from first migration
- Test Gemini 2.5 Pro as researcher agent model (leverage 1M context for large codebases)
- Test model escalation: start coder on Haiku, verify escalation to Sonnet on failure

Day 5: Evaluate Playwright replacement
- Build a minimal Playwright extension (approximately 100 lines) that replaces Chrome DevTools MCP for E2E testing
- Compare: startup time, reliability, token cost, screenshot quality
- Decision: if Playwright extension is more reliable, migrate E2E testing away from MCP adapter

**Week 7: Observability Extensions**

Day 1-2: orchestrator-dashboard extension
- Implement TUI status widget showing:
  - Agent grid (role, model, status, elapsed time, token usage)
  - Task progress (queued -> in-progress -> review -> done)
  - Cost tracker (per agent, cumulative, budget remaining)
  - Decision log tail (last 5 decisions)
- Use `pi.registerComponent()` for custom TUI rendering
- Test: Dashboard updates in real time as agents work.

Day 3-4: orchestrator-devlog extension
- Implement `agent_end` hook that appends to `_bmad/devlog.md`:
  - Task ID, PR number, duration, review cycles, E2E result, model used, cost
- Implement `session_shutdown` hook that writes session summary:
  - Tasks completed, tasks skipped, total cost, total time, roadblocks encountered
- Test: Run orchestration cycle, verify devlog entries are accurate and complete.

Day 5: Remaining project migrations
- Migrate remaining projects (CityHub, Finance Agent, ContentOS)
- For each: set up `.pi/`, run 1-2 tasks, verify functionality

**Week 8: Optimization and Packaging**

Day 1-2: Cost optimization
- Analyze cost data from Weeks 6-7
- Identify tasks where cheaper models perform adequately
- Implement aggressive model routing: default coder to Haiku for simple tasks (file renames, import fixes), escalate to Sonnet only when complexity warrants
- Implement context budget enforcement: warn when agent context usage exceeds 50% of window

Day 3-4: Package as installable pi-package
- Structure extensions as an npm package: `@lthread/pi-orchestrator`
- Include all 6 extensions, agent definitions, skill files, and configuration templates
- Write installation instructions: `pi install npm:@lthread/pi-orchestrator`
- Test: clean install on a new project, verify everything works from scratch

Day 5: Deprecate Claude Code dependency
- Remove Claude Code orchestrator configuration from projects (`.claude/agents/orchestrator.md`, `.claude/commands/orchestrator.md`)
- Keep Claude Code available for IDE integration use cases (VS Code users)
- Update project CLAUDE.md files to reference Pi orchestrator
- Final cost comparison report

**Phase 3 Exit Criteria:**
- All projects running on Pi orchestrator
- TUI dashboard operational with real-time agent status
- Automatic devlog generation
- Cost optimization implemented and measured
- Extensions packaged as installable pi-package
- Claude Code retained only for optional IDE integration

---

## 4. Migration Path Details

### 4.1 What Claude Code Features Are Needed in Pi

| CC Feature | Pi Equivalent | Status |
|------------|--------------|--------|
| `Task` tool (spawn subagent) | pi-subagents `subagent` tool | Available via extension |
| `SendMessage` (agent communication) | pi-messenger message routing | Available via extension |
| `TaskList` (status query) | pi-messenger agent status / custom extension | Available |
| Chrome DevTools MCP | pi-mcp-adapter with Chrome DevTools server | Available via extension |
| `CLAUDE.md` project instructions | `AGENTS.md` project instructions | Native Pi feature |
| `.claude/agents/` custom agents | `.pi/agents/` custom agent definitions | Native Pi feature |
| `.claude/commands/` slash commands | Pi commands (registered via extension) | Native Pi feature |
| Session hooks (sessionStart, preCompact) | `session_start`, `session_before_compact` events | Native Pi feature |
| Tiered context loading | `before_agent_start` + `context` events | Native Pi feature |
| `--dangerously-skip-permissions` | Pi has no permission system by default | N/A |

### 4.2 What L-Thread Patterns Change

**Improves in Pi:**
- Rule enforcement moves from prompt text to programmatic hooks (cannot be bypassed)
- Context management moves from manual tier loading to event-driven injection
- Review bounding moves from "please count to 3" to a hard counter with block
- Cost tracking is now possible (L-Thread had zero visibility)
- Agent definitions are YAML-validated (L-Thread's were freeform markdown)
- Worktree isolation is native (L-Thread had none -- all agents shared the same working directory)

**Same in Pi:**
- State file format (`_bmad/orchestrator-state.json`) -- identical schema, same location
- Tmux recovery pattern -- identical mechanism
- GitHub integration (gh CLI) -- identical
- FutureLearnings incident database -- identical (now also a Skill)

**Loses in Pi:**
- Zero-code simplicity: L-Thread is pure prompt engineering. Pi requires approximately 1,500-2,000 lines of TypeScript. This is the fundamental tradeoff.
- Claude Code IDE integration: Claude Code works with VS Code and JetBrains. Pi is terminal-only. For developers who prefer IDE integration, Claude Code remains available.
- Native Teams API: Claude Code's Task/SendMessage/TaskList are first-party tools with full Anthropic support. Pi's equivalents are community extensions with varying maturity levels.

### 4.3 Risk Mitigation During Migration

**Risk 1: Pi extension API breaks between versions**
- Mitigation: Pin Pi to an exact version in `package.json`. Test extension compatibility before upgrading. Maintain a lockfile.

**Risk 2: Community extensions (pi-subagents, pi-messenger) become unmaintained**
- Mitigation: Fork critical extensions to a private repo. The extensions are small (hundreds of lines, not thousands). Maintaining a fork is feasible.

**Risk 3: Chrome DevTools MCP adapter instability**
- Mitigation: Build the Playwright fallback extension in Phase 3 Week 6. If MCP adapter is unreliable, switch entirely to Playwright.

**Risk 4: Multi-agent coordination failures (93% non-response rate without orchestration)**
- Mitigation: Heartbeat monitoring from Phase 2 Week 4. Timeout kills with automatic re-queue. Error cascade breakers (one agent failure does not cascade to others).

**Risk 5: Context window overflow with multiple agent communications**
- Mitigation: Tiered context system limits token injection. Pi-messenger uses Pi's native `followUp`/`steer` (minimal overhead). MCP adapter compresses 18K tokens to approximately 200.

**Parallel running strategy:**
- Weeks 1-2: Both systems available. Pi runs enforcement extensions only. Claude Code handles orchestration.
- Weeks 3-5: Pi handles orchestration on one project. Claude Code handles remaining projects.
- Weeks 6-8: All projects on Pi. Claude Code available as fallback and for IDE users.

---

## 5. Technology Choices

### 5.1 TypeScript Extensions vs Standalone Orchestration Layer

Two approaches were considered:

**Option A: Pi Extensions (chosen)**
- Extensions run inside Pi's process
- Direct access to Pi's event system, tool registry, and session state
- TypeScript with Pi's extension API (`pi.registerTool()`, `pi.on()`, `pi.appendEntry()`)
- Extensions are composable, installable via `pi install`

**Option B: Standalone Node.js process managing Pi instances**
- External process spawns and monitors Pi instances via stdin/stdout or tmux
- Communication through filesystem or IPC
- Full control over lifecycle but no integration with Pi internals

**Decision: Option A.** The extension approach provides direct access to Pi's 25+ lifecycle events, tool-call interception (essential for rule enforcement), and session state. A standalone process would need to reimplement event observation through filesystem polling, losing the sub-second responsiveness that `tool_call` hooks provide. The only scenario where Option B wins is cross-machine orchestration, which is explicitly deferred.

### 5.2 Tmux vs Pi SDK Mode for Process Management

| Dimension | Tmux | Pi SDK (subagents) |
|-----------|------|--------------------|
| Visibility | Terminal visible, debuggable | In-process, less visible |
| Startup time | Approximately 2-3 seconds (tmux + pi launch) | Approximately 0.5 seconds (in-process) |
| Communication | Filesystem + capture-pane | Event streams, direct messaging |
| Crash recovery | Sessions survive terminal crash | Process crash kills all subagents |
| Isolation | Process-level (strong) | In-process (shared memory) |
| Scalability | Limited by tmux pane count | Limited by memory |

**Decision: Pi SDK subagents as primary, tmux as debugger and fallback.** Use `isolation: worktree` in agent frontmatter for filesystem isolation. Use tmux sessions when manual debugging is needed or when Pi SDK subagents are unstable.

### 5.3 File-Based vs IPC for Communication

| Dimension | File-based (pi-messenger) | IPC (Unix sockets, pipes) |
|-----------|--------------------------|--------------------------|
| Latency | Approximately 50-100ms (write + poll) | Approximately 1-5ms |
| Durability | Files survive crashes | Lost on crash |
| Debuggability | `cat` and `ls` to inspect | Requires tooling |
| Concurrency | Filesystem handles it | Must implement locking |
| Portability | Works everywhere | Platform-dependent |

**Decision: File-based communication via pi-messenger.** The 50-100ms latency is irrelevant when agents operate on 10-30 second cycles. The durability and debuggability advantages are significant for an orchestration system that must recover from crashes and be inspectable by operators.

### 5.4 State Serialization Format

| Format | Read/Write Speed | Human Readable | Query Capability | Tool Support |
|--------|-----------------|----------------|-----------------|--------------|
| JSON | Fast | Yes | JQ, JavaScript | Universal |
| SQLite | Fastest | No (binary) | Full SQL | sqlite3 CLI |
| JSONL | Fast (append) | Yes | grep, jq | Universal |
| Git-backed JSON | Slow (commit overhead) | Yes | git log, diff | Git |

**Decision: JSON for snapshots, JSONL for append-only logs, `pi.appendEntry()` for session-scoped state.** This mirrors the existing L-Thread approach with no migration needed. JSONL for the decision log enables cheap appends without read-modify-write cycles. `pi.appendEntry()` provides Pi-native state that survives compaction.

---

## 6. Testing Strategy Per Phase

### Phase 1 Tests

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Rule 1: No code writing | Attempt `edit` on `.ts` file as orchestrator | Tool call blocked, error message returned |
| Rule 2: E2E gate | Attempt `gh issue close` without verdict file | Tool call blocked, error message includes INC-014 |
| Rule 3: Review bounds | Spawn 4th review cycle | 4th spawn blocked, message says "max 3 reached" |
| Rule 4: AUTO-MODE | Set AUTO_MODE=ENABLED, check input suppression | No user prompts during orchestration |
| State persistence | Start session, change state, compact, verify | State JSON matches pre-compact values |
| E2E test execution | Run Chrome DevTools via MCP adapter | Screenshot captured, verdict file written |
| Tiered context | Spawn agent, check injected context | Tier 0 context present, under 2K tokens |

### Phase 2 Tests

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Sequential orchestration | Run loop on 2 dependent tasks | Tasks execute in dependency order |
| Parallel orchestration | Run loop on 3 independent tasks | All 3 agents spawn simultaneously |
| Pool limit | Attempt to spawn 6th agent | 6th spawn blocked, message says "max 5" |
| Heartbeat timeout | Simulate agent hang (60+ seconds) | Agent killed, task re-queued |
| File reservation | Two agents edit same file | Second agent blocked with reservation message |
| Roadblock recovery | Introduce known error pattern | INC match found, fix injected, agent recovers |
| Handoff payload | Coder completes, reviewer starts | Reviewer receives files changed, decisions made |
| Model escalation | Haiku agent fails twice | Escalated to Sonnet, decision logged |

### Phase 3 Tests

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Full migration | Run 3+ sprint tasks on migrated project | All tasks complete, cost tracked, devlog generated |
| Dashboard accuracy | Compare dashboard display to state file | All fields match, real-time updates visible |
| Cost comparison | Compare Pi cost to Claude Code baseline | Documented with per-task breakdown |
| Clean install | `pi install npm:@lthread/pi-orchestrator` on new project | Extensions load, configuration applied, first task works |
| Playwright fallback | Run E2E test via Playwright extension | Screenshots captured, equivalent quality to MCP |

---

## 7. Estimated Line Counts and Effort

| Component | Lines of TypeScript | Development Time |
|-----------|-------------------|------------------|
| orchestrator-discipline.ts | ~180 | 2 days |
| orchestrator-state.ts | ~220 | 2 days |
| orchestrator-loop.ts | ~400 | 5 days |
| orchestrator-health.ts | ~150 | 2 days |
| orchestrator-dashboard.ts | ~200 | 2 days |
| orchestrator-devlog.ts | ~80 | 1 day |
| Agent definitions (6 files) | ~300 (markdown + YAML) | 1 day |
| Skill files (FutureLearnings, etc.) | ~100 (markdown) | 0.5 days |
| Configuration (settings.json, mcp.json) | ~80 | 0.5 days |
| Chain definitions (.chain.md) | ~150 (markdown) | 1 day |
| Playwright fallback extension | ~120 | 1 day |
| **Total** | **~1,980** | **~17 days** |

With community extensions providing approximately 2,000 lines of functionality (pi-subagents, pi-messenger, pi-mcp-adapter), the total orchestrator system is approximately 4,000 lines. This compares to L-Thread's 0 lines of code (pure prompt engineering) plus approximately 800 lines of shell scripts and markdown.

The tradeoff: 4x more code, but programmatic enforcement, model flexibility, cost visibility, and extension composability across all projects.

---

## 8. Decision Log: What NOT to Build

These decisions are as important as the build list. Each represents a trap identified in the research.

| Anti-Pattern | Why It Is Tempting | Why It Is Wrong | Alternative |
|-------------|-------------------|----------------|-------------|
| Custom message broker (Redis, NATS) | "Real-time" agent communication | Agents operate on 10-30s cycles; filesystem is fast enough | pi-messenger file-based messaging |
| Custom model routing service | Centralized model selection | Pi already routes to 300+ models natively | Model selection at spawn time via agent frontmatter |
| Fork Pi Agent | Add missing features | Every community fork falls behind upstream within weeks | Extensions only; contribute upstream |
| Cross-machine orchestration | Distribute agents across machines | 10x complexity for a capability not yet needed | Local-first; evaluate Overstory later |
| Vector database for agent memory | "Long-term learning" | JSONL decision log + FutureLearnings skill covers the need | File-based memory; reconsider at scale |
| Recursive agent monitoring | Agents monitoring agents monitoring agents | Exponential cost, diminishing returns | Single orchestrator monitors all agents |
| Consensus protocols between agents | Democratic decision-making | Orchestrator has clear authority; agents execute | Orchestrator decides, agents execute |
| Custom IDE integration | VS Code extension for dashboard | Terminal is the interface; tmux pane for dashboard | `orchestrator-dashboard` renders to stdout |
| Full A2A protocol implementation | Future-proof interoperability | Premature; adds protocol overhead without current need | AGENTS.md for discovery; file-based messaging |

---

## 9. Success Metrics

The migration succeeds when:

1. **Rule enforcement is 100% programmatic.** Zero incidents where the orchestrator writes code, closes an issue without E2E, or exceeds review bounds. This is measurable by auditing the decision log for blocked actions.

2. **Cost per task is measurable and optimized.** Every agent spawn logs model, token usage, and dollar cost. Target: 30% cost reduction vs Claude Code baseline through model routing (Haiku for simple tasks, Opus only when needed).

3. **Mean time to task completion is equal or better.** Parallel mode should reduce total sprint time. Target: 2x throughput on independent tasks via parallel execution.

4. **Zero manual orchestration steps.** In AUTO-MODE, the orchestrator runs the full loop without human intervention. The operator's role is to start the sprint and review the devlog at the end.

5. **Extension composability is demonstrated.** The orchestrator extensions work across 3+ projects with no per-project customization beyond agent definitions and task lists.

6. **Recovery from failure is automatic.** Agent crashes, timeouts, and roadblocks are handled without human intervention. Measurable by the ratio of auto-recovered vs manually-recovered incidents.

---

## Sources

- [Pi-Mono (badlogic/pi-mono)](https://github.com/badlogic/pi-mono)
- [Pi Coding Agent Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi SDK Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/sdk.md)
- [Pi-Subagents Extension](https://github.com/nicobailon/pi-subagents)
- [Pi-MCP-Adapter Extension](https://github.com/nicobailon/pi-mcp-adapter)
- [Pi-Messenger Extension](https://github.com/nicobailon/pi-messenger)
- [Pi-Side-Agents Extension](https://github.com/pasky/pi-side-agents)
- [Pi-Collaborating-Agents Extension](https://github.com/baochunli/pi-collaborating-agents)
- [Oh-My-Pi (can1357/oh-my-pi)](https://github.com/can1357/oh-my-pi)
- [Overstory Multi-Agent Orchestration](https://github.com/jayminwest/overstory)
- [dmux Dev Agent Multiplexer](https://github.com/standardagents/dmux)
- [OpenClaw Multi-Agent Orchestration Guide](https://zenvanriel.com/ai-engineer-blog/openclaw-multi-agent-orchestration-guide/)
- [How to Build a Custom Agent Framework with PI](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Pi Official Site](https://shittycodingagent.ai/)
- [Pi Packages Registry](https://shittycodingagent.ai/packages)
- [Shipyard: Multi-agent orchestration for Claude Code](https://shipyard.build/blog/claude-code-multi-agent/)
- [PI Agent Revolution: Building Customizable AI Coding Agents](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [Armin Ronacher: Pi: The Minimal Agent Within OpenClaw](https://lucumr.pocoo.org/2026/1/31/pi/)
