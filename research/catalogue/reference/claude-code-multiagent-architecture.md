# Claude Code Multi-Agent Architecture

> **Deep internals of Claude Code's multi-agent system: Agent Teams (swarms), Task/Agent tool (subagents), 18-event hooks lifecycle, plugin system, Agent SDK, and extension points for custom orchestration harnesses.**

| Field | Value |
|-------|-------|
| Category | 📊 Reference |
| Original Source | `2026-03-05_claude-code-multiagent-internals.md` |
| Research Phase | Phase 1 |
| Evidence Base | Official Anthropic docs, Claude Code binary analysis, community projects, Boris Cherny interviews, 20+ community sources |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

Claude Code has three tiers of multi-agent capability, each trading coordination cost for context isolation: **Subagents** (ephemeral workers within a session, up to 10 concurrent, 200K context each), **Agent Teams** (separate CC processes with peer-to-peer messaging and shared task lists, no hard limit), and **External Harnesses** (separate `claude` processes with custom IPC, unlimited nesting). The core architectural insight is that LLMs perform worse as context expands -- not just from token limits but from attention dilution -- making context isolation the non-negotiable foundation of all multi-agent patterns.

The hooks system provides 18 lifecycle events with three handler types (command/HTTP/prompt), making it the primary extension mechanism. The plugin system bundles agents, skills, hooks, MCP servers, and LSP configs into distributable packages. The Claude Agent SDK exposes the CC runtime as a library for programmatic orchestration with 14+ built-in tools, custom tool callbacks, session management, and structured output streaming.

Key limitations drive the need for custom harnesses: no session resumption for in-process teammates, no crash recovery, no nested orchestration, Claude-only model support, and no custom IPC. The L-Thread Orchestrator's tmux-based persistence, durable state files, and nested spawning directly address these gaps.

---

## Key People

| Person | Role | Key Insight |
|--------|------|-------------|
| **Boris Cherny** (@bcherny) | Creator/Head of Claude Code | Runs 5 Claudes in parallel; claims 4% of public GitHub commits are by CC; "Claudes monitoring other Claudes will be the next challenge" |
| **@dmwlff** | CC Team Member | Building alongside Boris |
| **@JacksonKernion** | Fine-tuning at Anthropic | Directly impacts CC's agent behavior tuning |

---

## Three-Tier Multi-Agent Architecture

| Tier | Mechanism | Communication | Context | Max Parallel | Nesting |
|------|-----------|---------------|---------|-------------|---------|
| **Subagents** (Agent tool) | Ephemeral workers within session | Report back to parent only | Own 200K window | 10 concurrent | Cannot nest |
| **Agent Teams** (TeammateTool) | Separate CC processes | Peer-to-peer + shared task list | Fully independent | No hard limit (3-5 rec.) | Cannot nest |
| **External Harness** (CLI/SDK) | Separate `claude` processes | Custom IPC (files, tmux, pipes) | Fully independent | Unlimited | Can nest |

---

## Subagents (Agent Tool)

### Naming History
Originally "Task tool", renamed to "Agent tool" in v2.1.63. Breaking change: `tool_name` in hook payloads changed from `"Task"` to `"Agent"`. Old `Task(...)` syntax in settings still works as alias.

### Built-in Subagents

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **Explore** | Haiku (fast) | Read-only | File discovery, codebase exploration |
| **Plan** | Inherits | Read-only | Research for planning mode |
| **General-purpose** | Inherits | All | Complex multi-step tasks |
| **Bash** | Inherits | Terminal | Running commands in separate context |
| **statusline-setup** | Sonnet | - | `/statusline` configuration |
| **Claude Code Guide** | Haiku | - | Questions about CC features |

### Custom Subagent Configuration

Defined as markdown files with YAML frontmatter. Key fields:
- `tools` / `disallowedTools`: Scoped tool access
- `model`: sonnet | opus | haiku | inherit
- `permissionMode`: default | acceptEdits | dontAsk | bypassPermissions | plan
- `maxTurns`: Execution limit
- `skills`: Loaded skill dependencies
- `memory`: user | project | local (persistent across sessions)
- `background`: true = concurrent, false = blocking
- `isolation`: worktree (runs in isolated git worktree)
- `hooks`: Per-agent hook configuration

### Key Architecture Details

- **200K context window** per subagent, completely isolated
- **20K token overhead** per spawn
- **10 concurrent** max with intelligent queuing
- **Cannot spawn other subagents** (no nesting by design)
- Auto-compaction at ~95% capacity (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
- Transcripts stored at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`
- Subagents can be resumed with full conversation history
- Toggle foreground/background with Ctrl+B during execution

### Scoping Priority Order
1. `--agents` CLI flag (session-only, JSON)
2. `.claude/agents/` (project-level, committable)
3. `~/.claude/agents/` (user-level, all projects)
4. Plugin `agents/` directory (where plugin is enabled)

### Restricting Spawning
```yaml
# Only specific agents
tools: Agent(worker, researcher), Read, Bash
# Deny specific agents
permissions:
  deny: ["Agent(Explore)", "Agent(my-custom-agent)"]
```

---

## Agent Teams (Swarms)

### Discovery and Enabling

Discovered Jan 24, 2026 via `strings` command on CC binary by @kieranklaassen. Revealed TeammateTool with 13 operations. Shipped officially alongside Opus 4.6.

```json
// settings.json
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
```

### Architecture Components

| Component | Role |
|-----------|------|
| **Team lead** | Main CC session; creates team, spawns teammates, coordinates |
| **Teammates** | Separate CC instances with own context |
| **Task list** | Shared at `~/.claude/tasks/{team-name}/` |
| **Mailbox** | Messaging system for inter-agent communication |
| **Team config** | `~/.claude/teams/{team-name}/config.json` |

### Core Tools

| Tool | Operations |
|------|-----------|
| **Teammate** | `spawnTeam`, `cleanup`, `discoverTeams`, `requestJoin`, `approveJoin`, `rejectJoin` |
| **SendMessage** | `message` (to one), `broadcast` (to all), `shutdown_request`, `shutdown_response`, `plan_approval_response` |
| **TaskCreate** | Create tasks with dependencies |
| **TaskUpdate** | Update status, claim tasks |
| **TaskList** | View all tasks and statuses |
| **TaskGet** | Get specific task details |

### Task Coordination
- Three states: **pending**, **in progress**, **completed**
- Tasks can have **dependencies** (blocked until dependencies complete)
- **File locking** prevents race conditions on task claiming
- After finishing, teammates **auto-pick** next unassigned, unblocked task
- Lead can assign explicitly or teammates self-claim

### Display Modes

| Mode | Description |
|------|-------------|
| **in-process** | All teammates in main terminal, Shift+Down to cycle |
| **split-pane** | Each teammate gets own pane (requires tmux or iTerm2) |
| **auto** (default) | Split if in tmux, in-process otherwise |

### Communication Patterns
- **Automatic message delivery** -- no polling
- **Idle notifications** -- teammates notify lead when finished
- **Peer-to-peer messaging** -- any teammate can message any other
- **Broadcast** -- send to all (use sparingly, costs scale with team size)

### Plan Approval Mode
Teammate works in **read-only plan mode** until lead approves. Lead can approve or reject with feedback. Rejected teammates revise and resubmit.

### Context Efficiency
> "Single-agent Claude typically uses 80-90% of its context window before needing a reset. With agent teams? Around 40%."

Each teammate loads: CLAUDE.md, MCP servers, skills, and spawn prompt. Lead's conversation history does NOT carry over.

### Quality Gate Hooks

| Hook Event | When | Use |
|------------|------|-----|
| `TeammateIdle` | Teammate about to go idle | Exit code 2 sends feedback, keeps working |
| `TaskCompleted` | Task marked complete | Exit code 2 prevents completion, sends feedback |

---

## Hooks System: All 18 Lifecycle Events

Three handler types: **command** (shell), **HTTP** (POST to URL), **prompt** (LLM evaluation).

### Complete Event Reference

| Event | Matcher Input | When | Decision Control |
|-------|---------------|------|-----------------|
| `SessionStart` | `startup`, `resume`, `clear`, `compact` | Session begins or resumes | Context injection via stdout |
| `SessionEnd` | `clear`, `logout`, `prompt_input_exit`, etc. | Session terminates | Cleanup only |
| `UserPromptSubmit` | (no matcher) | User submits prompt | Can modify/block prompt |
| `PreToolUse` | Tool name (`Bash`, `Edit\|Write`, `mcp__.*`) | Before tool executes | `allow` / `deny` / `ask` |
| `PostToolUse` | Tool name | After tool succeeds | Context injection |
| `PostToolUseFailure` | Tool name | After tool fails | Context injection |
| `PermissionRequest` | Tool name | Permission dialog appears | Auto-approve/deny |
| `Notification` | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` | CC sends notification | - |
| `SubagentStart` | Agent type name | Subagent spawned | Setup scripts |
| `SubagentStop` | Agent type name | Subagent finishes | Cleanup scripts |
| `Stop` | (no matcher) | Claude finishes responding | Completion validation |
| `TeammateIdle` | (no matcher) | Teammate going idle | Exit 2 = keep working |
| `TaskCompleted` | (no matcher) | Task being marked complete | Exit 2 = prevent completion |
| `InstructionsLoaded` | (no matcher) | CLAUDE.md or rules loaded | Context augmentation |
| `ConfigChange` | `user_settings`, `project_settings`, etc. | Config file changes | - |
| `WorktreeCreate` | (no matcher) | Worktree being created | Replace default git behavior |
| `WorktreeRemove` | (no matcher) | Worktree being removed | Custom cleanup |
| `PreCompact` | `manual`, `auto` | Before context compaction | Preserve critical info |

### Exit Code Semantics

| Exit Code | Behavior |
|-----------|----------|
| 0 | Allow / success |
| 1 | Error (tool continues, error logged) |
| 2 | **Special**: blocks PreToolUse, prevents TaskCompleted, keeps TeammateIdle working |

### Hook Configuration Locations (Priority Order)

| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/settings.json` | All projects | No |
| `.claude/settings.json` | Single project | Yes (committable) |
| `.claude/settings.local.json` | Single project | No (gitignored) |
| Managed policy settings | Organization-wide | Admin-controlled |
| Plugin `hooks/hooks.json` | When plugin enabled | Bundled with plugin |
| Skill/agent frontmatter | While component active | In component file |

### Key Hooks for Custom Orchestration
- **SessionStart**: Inject orchestrator state, load context, set environment variables
- **PreCompact**: Preserve critical orchestration context before compaction
- **SubagentStart/Stop**: Track subagent lifecycle, manage external state
- **TeammateIdle + TaskCompleted**: Quality gates for agent teams
- **WorktreeCreate/Remove**: Custom VCS isolation (works beyond git)

---

## Plugin System

### Plugin Structure
```
my-plugin/
  .claude-plugin/
    plugin.json          # manifest
  commands/              # slash commands (skills)
  agents/                # custom subagent definitions
  skills/                # agent skills with SKILL.md
  hooks/
    hooks.json           # event handlers
  .mcp.json              # MCP server configs
  .lsp.json              # LSP server configs
  settings.json          # defaults (e.g., default agent)
```

### Distribution
- **Local**: `claude --plugin-dir ./my-plugin`
- **Marketplace**: `claude plugin install <name>` or `/plugin marketplace update`
- **Official marketplace**: Submit via claude.ai/settings/plugins/submit
- Skills namespaced: `/my-plugin:hello` prevents conflicts

### MCP + LSP Integration
Plugins can include MCP server configurations (database queries, Jira tickets, GitHub PRs, Sentry errors) and LSP server configurations for real-time diagnostics and completions.

---

## Claude Agent SDK (Programmatic)

### Overview
The runtime that powers Claude Code, exposed as a library. Renamed from "Claude Code SDK" to "Claude Agent SDK" (Sept 2025) to reflect generalization beyond coding.

### Core API (TypeScript)
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const agent = query({
  prompt: "Refactor the auth module",
  allowedTools: ["Read", "Write", "Bash", "Glob", "Grep", "Agent"],
  agents: {
    "worker": {
      description: "Implementation worker",
      prompt: "You implement features...",
      tools: ["Read", "Write", "Bash"],
      model: "sonnet"
    }
  },
  model: "opus"
});

for await (const message of agent) {
  // Process typed messages
}
```

### Key Capabilities
- 14+ built-in tools
- Custom tools as callbacks
- Session management (persistent, resume, rewind)
- Structured output streaming
- Agent definitions via `agents` parameter
- Custom plugin loading
- Headless mode: `--print --output-format stream-json`
- Bidirectional protocol for multi-turn persistent conversations

---

## New Features: /simplify, /batch, Worktrees

### /simplify
Runs parallel agents reviewing changed code for reuse opportunities, quality issues, and efficiency improvements. Open-sourced as `code-simplifier` plugin.

### /batch
Interactive planning of code migrations, then parallel execution using dozens of agents with full git worktree isolation. Each agent tests its work before creating a PR.

### Built-in Worktree Support
- `--worktree` (`-w`) flag creates isolated worktree + branch
- Subagents support `isolation: worktree` in frontmatter
- **WorktreeCreate** / **WorktreeRemove** hooks for custom VCS
- Auto-cleaned if subagent makes no changes

---

## Community Projects

| Project | Pattern | Key Feature |
|---------|---------|-------------|
| **claude-flow** | Swarm orchestration | Pre-TeammateTool community solution |
| **ccswarm** | Git worktree isolation | Per-agent branch isolation |
| **oh-my-claudecode** | 5 execution modes | Multi-modal orchestration |
| **ruflo** | Enterprise platform | Distributed swarm + RAG |
| **Agentrooms** | @mentions routing | Task routing to specialized agents |
| **parallel-code** | Side-by-side | Claude, Codex, Gemini each in own worktree |

### Community Patterns
- **Agentic Workflows** (ThibautMelen): Subagent Orchestration, Progressive Skills, Master-Clone Architecture
- **Fullstack Dev Skills** (jeffallan): 65 specialized skills, 9 workflow commands, Jira/Confluence integration
- **Multi-agent observability**: Hook-based real-time monitoring
- **CLAUDE.md finding**: Human-written context outperforms LLM-generated `/init` output -- LLM-generated context files *decreased* success rates

---

## Known Limitations

### Agent Teams
1. **No session resumption** with in-process teammates (`/resume` and `/rewind` don't restore them)
2. Task status can lag (teammates sometimes fail to mark tasks complete)
3. Shutdown can be slow (teammates finish current request before stopping)
4. One team per session
5. No nested teams
6. Lead is fixed (cannot promote/transfer)
7. Permissions set at spawn (all inherit lead's mode)
8. Split panes require tmux/iTerm2

### Subagents
1. Cannot spawn other subagents (no nesting)
2. 10 concurrent max with queuing
3. Batch execution (waits for full batch before next)
4. 20K token overhead per spawn
5. 3-4 subagent types recommended max

### Context Costs
- Agent teams use significantly more tokens than single sessions
- Token usage scales linearly with teammate count
- Results from many subagents can consume significant main context

---

## Native vs Custom Orchestration

### When Native is Sufficient
Parallel execution, context isolation, inter-agent communication, task dependency graphs, quality gates via hooks -- all covered.

### When Custom Harness is Necessary

| Gap | Native Limitation | Custom Advantage |
|-----|-------------------|------------------|
| **Crash recovery** | None for in-process teammates | Tmux persistence survives crashes |
| **Session resumption** | Explicitly documented as limitation | Durable state files + tmux recovery |
| **Nested orchestration** | Blocked by design | Multi-level hierarchies, sub-orchestrators |
| **Cross-project coordination** | Within single project only | Coordinate across repos |
| **Model-agnostic routing** | Claude only | Route to different providers per task |
| **State persistence** | `~/.claude/teams/` with no recovery | Project-local versioned state files |
| **Deterministic workflows** | Hooks are reactive | Proactive workflow graph enforcement |

---

## Patterns to Replicate in Custom Harnesses

### Must-Have
1. **Context isolation** -- each agent gets own context window
2. **File-locked task claiming** -- atomic task assignment preventing races
3. **Automatic idle notification** -- event-driven completion detection, not polling
4. **Quality gate hooks** -- validate work before accepting (TeammateIdle, TaskCompleted)
5. **Rich spawn context** -- CLAUDE.md + MCP + skills + detailed prompt (not conversation history)
6. **Task dependency graphs** -- blocked tasks auto-unblock when dependencies complete
7. **Plan approval mode** -- require plan before implementation

### Anti-Patterns to Avoid
1. Don't use LLM-generated CLAUDE.md -- human-written outperforms
2. Don't exceed 3-5 parallel agents -- diminishing returns
3. Don't use polling for completion -- use event-driven mechanisms
4. Don't use `bash sleep` -- event-driven waiting only
5. Don't put agents on same files -- worktree isolation or clear file ownership

---

## Quick Reference

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable background subagents |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Trigger compaction earlier (e.g., 50) |

### Key File Paths

| Path | Content |
|------|---------|
| `~/.claude/teams/{team}/config.json` | Team configuration |
| `~/.claude/tasks/{team}/` | Shared task lists |
| `.claude/agents/` | Project-level subagent definitions |
| `~/.claude/agents/` | User-level subagent definitions |
| `~/.claude/agent-memory/{agent}/` | User-scope persistent memory |
| `.claude/agent-memory/{agent}/` | Project-scope persistent memory |

### CLI Flags for Orchestration

| Flag | Purpose |
|------|---------|
| `--agents '{json}'` | Session-only subagent definitions |
| `--agent <name>` | Run as specific agent (main thread) |
| `--teammate-mode in-process\|tmux` | Set display mode |
| `--worktree` / `-w` | Run in isolated git worktree |
| `--plugin-dir ./path` | Load plugin during development |
| `--print --output-format stream-json` | Headless mode for CI/CD |
| `--dangerously-skip-permissions` | Skip all permission checks |

---

## Actionable Insights

1. **For L-Thread Orchestrator**: The tmux-based persistence, durable state files, nested spawning, and model-agnostic routing are genuine advantages over native Agent Teams. These gaps are unlikely to be filled soon -- Boris Cherny's roadmap signals focus on governance ("Claudes monitoring Claudes") rather than crash recovery.

2. **For hook-based integration**: The 18-event hooks system is the highest-leverage extension point. `SessionStart` (inject orchestrator state), `PreCompact` (preserve context), `SubagentStart/Stop` (lifecycle tracking), and `TeammateIdle/TaskCompleted` (quality gates) cover most orchestration needs without modifying CC internals.

3. **For SDK-based orchestration**: The Agent SDK's `query()` API with typed message streaming and custom agent definitions is the cleanest programmatic interface. Prefer SDK over CLI wrapping for new orchestration layers.

4. **For context efficiency**: Agent Teams reduce per-agent context usage from 80-90% to ~40% by isolating contexts. The 20K token overhead per subagent spawn means subagents are most efficient for tasks requiring 50K+ tokens of work -- below that, the overhead dominates.

5. **For production readiness**: Add `TeammateIdle` and `TaskCompleted` hooks as quality gates immediately. These are the lowest-effort, highest-impact additions to any CC-based workflow.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) | Detailed harness entry for the SDK that powers CC |
| [OpenAI Codex](../agent-harnesses/openai-codex.md) | Competing multi-agent architecture (App Server protocol, worktree isolation) |
| [OpenCode](../agent-harnesses/opencode.md) | Alternative OSS architecture (HTTP/SSE, TaskTool, oh-my-opencode ecosystem) |
| [DSPy](../agent-harnesses/dspy.md) | Complementary declarative paradigm for agent optimization |
| [OSS Harness Landscape](./oss-harness-landscape.md) | Comprehensive comparison of all OSS coding agents and harnesses |
| [Harness Comparison Matrix](./harness-comparison-matrix.md) | Quantitative scoring including CC across 20 dimensions |
| [Scaling Economics](./scaling-economics.md) | Cost curves governing multi-agent token economics |

---

*Source: research/2026-03-05_claude-code-multiagent-internals.md (Phase 1). Verified against official Anthropic docs and community resources.*
