# Claude Code Multi-Agent Internals: Deep Research Report

**Date**: 2026-03-05
**Scope**: Claude Code's multi-agent architecture, people building it, community patterns, extension points, and implications for custom orchestration harnesses.

---

## Table of Contents

1. [Key People](#1-key-people)
2. [Multi-Agent Architecture Overview](#2-multi-agent-architecture-overview)
3. [Task/Agent Tool (Subagents)](#3-taskagent-tool-subagents)
4. [Agent Teams (Swarms)](#4-agent-teams-swarms)
5. [Hooks System: All 18 Lifecycle Events](#5-hooks-system-all-18-lifecycle-events)
6. [Plugin System and Extension Points](#6-plugin-system-and-extension-points)
7. [Claude Agent SDK (Programmatic)](#7-claude-agent-sdk-programmatic)
8. [New Features: /simplify and /batch](#8-new-features-simplify-and-batch)
9. [Community Projects and Patterns](#9-community-projects-and-patterns)
10. [Native vs Custom Orchestration Comparison](#10-native-vs-custom-orchestration-comparison)
11. [Known Limitations](#11-known-limitations)
12. [Roadmap and Direction](#12-roadmap-and-direction)
13. [Patterns a Custom Harness Should Replicate](#13-patterns-a-custom-harness-should-replicate)

---

## 1. Key People

### Boris Cherny (@bcherny) -- Creator and Head of Claude Code
- 297K followers. Created Claude Code, leads the team at Anthropic.
- Runs 5 Claudes in parallel in numbered terminal tabs. Uses system notifications to know when a Claude needs input.
- Exclusively uses Opus 4.5/4.6 with thinking. Has written zero manual code since November 2025.
- Claims 4% of all public GitHub commits are now authored by Claude Code (predicted 20% by end of 2026).
- Recently announced `/simplify` and `/batch` skills (Feb 27, 2026).
- Open-sourced the `code-simplifier` agent plugin used by the CC team internally.
- Built "Cowork" (file management agent for non-coders) in ~1.5 weeks using Claude Code itself.
- **Key prediction**: "By end of 2026, the title 'software engineer' will start disappearing, replaced by 'builder'."
- **On multi-agent future**: "Claudes monitoring other Claudes will be the next challenge."

**Sources**:
- [Boris's workflow tweet](https://x.com/bcherny/status/2007179832300581177)
- [/simplify and /batch announcement](https://x.com/bcherny/status/2027534984534544489)
- [Lenny's Podcast interview](https://www.lennysnewsletter.com/p/head-of-claude-code-what-happens)
- [Pragmatic Engineer interview](https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny)
- [howborisusesclaudecode.com](https://howborisusesclaudecode.com)

### @dmwlff -- Claude Code Team Member
- 18K followers. "Claude Code @AnthropicAI" in bio.
- Team member building Claude Code alongside Boris.

### @claude_code -- Community Account
- 39K followers. Shares Claude Code projects, releases, and community builds.

### @JacksonKernion -- Fine-tuning at Anthropic
- 6K followers. Works on fine-tuning, which directly impacts Claude Code's agent behavior tuning.

### @k_neklyudov -- Technical Staff at Anthropic
- 2.6K followers. Member of the Technical Staff.

---

## 2. Multi-Agent Architecture Overview

Claude Code has three tiers of multi-agent capability, each with different tradeoffs:

| Tier | Mechanism | Communication | Context | Max Parallel | Nesting |
|------|-----------|---------------|---------|-------------|---------|
| **Subagents** (Agent tool) | Ephemeral workers within a session | Report results back to parent only | Own 200K window; results return to caller | 10 concurrent | Cannot nest |
| **Agent Teams** (TeammateTool) | Separate CC processes | Peer-to-peer messaging + shared task list | Fully independent windows | No hard limit (3-5 recommended) | Cannot nest |
| **External Harness** (CLI/SDK) | Separate `claude` processes | Custom IPC (files, tmux, pipes) | Fully independent | Unlimited | Can nest |

### The Core Insight
> "LLMs perform worse as context expands. This isn't just about hitting token limits -- the more information in the context window, the harder it is for the model to focus on what matters right now."

This is why all three tiers exist: they all trade coordination cost for context isolation.

---

## 3. Task/Agent Tool (Subagents)

### Naming History
- Originally called **Task tool**
- Renamed to **Agent tool** in v2.1.63 (breaking change for hook payloads -- `tool_name` changed from `"Task"` to `"Agent"`)
- Old `Task(...)` references in settings still work as aliases
- [Rename bug report](https://github.com/anthropics/claude-code/issues/29677)

### Built-in Subagents

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **Explore** | Haiku (fast) | Read-only | File discovery, code search, codebase exploration |
| **Plan** | Inherits | Read-only | Research for planning mode |
| **General-purpose** | Inherits | All | Complex multi-step tasks |
| **Bash** | Inherits | Terminal | Running commands in separate context |
| **statusline-setup** | Sonnet | - | `/statusline` configuration |
| **Claude Code Guide** | Haiku | - | Questions about CC features |

### Custom Subagent Configuration (Markdown + YAML Frontmatter)

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
model: sonnet           # sonnet | opus | haiku | inherit
permissionMode: default # default | acceptEdits | dontAsk | bypassPermissions | plan
maxTurns: 50
skills:
  - api-conventions
  - error-handling-patterns
memory: user            # user | project | local (persistent across sessions)
background: false       # true = concurrent, false = blocking
isolation: worktree     # runs in isolated git worktree
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
---

You are a senior code reviewer...
```

### Key Architecture Details

- Each subagent gets its own **200K context window**, completely isolated
- **20K token overhead cost** per subagent spawn
- Up to **10 concurrent** tasks with intelligent queuing
- **Cannot spawn other subagents** (no nesting -- by design)
- Results return to the caller's context as a summary
- Auto-compaction at ~95% capacity (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)
- Transcripts stored at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`
- Subagents can be **resumed** with full conversation history

### Scoping Locations (Priority Order)

1. `--agents` CLI flag (session-only, JSON)
2. `.claude/agents/` (project-level, committable)
3. `~/.claude/agents/` (user-level, all projects)
4. Plugin `agents/` directory (where plugin is enabled)

### Restricting Agent Spawning

```yaml
# Only allow spawning specific subagent types
tools: Agent(worker, researcher), Read, Bash

# Allow any subagent
tools: Agent, Read, Bash

# Deny specific agents
permissions:
  deny: ["Agent(Explore)", "Agent(my-custom-agent)"]
```

### Foreground vs Background Execution
- **Foreground**: blocks main conversation, permissions pass through
- **Background**: concurrent, pre-approved permissions, auto-denies unapproved
- Toggle with Ctrl+B during execution
- Disable with `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`

**Sources**:
- [Official subagents docs](https://code.claude.com/docs/en/sub-agents)
- [Task vs Subagents comparison](https://www.ibuildwith.ai/blog/task-tool-vs-subagents-how-agents-work-in-claude-code/)
- [Task tool deep dive](https://dev.to/bhaidar/the-task-tool-claude-codes-agent-orchestration-system-4bf2)

---

## 4. Agent Teams (Swarms)

### Discovery History
- Discovered January 24, 2026 via `strings` command on Claude Code binary by @kieranklaassen
- Revealed **TeammateTool** with 13 operations, fully implemented but feature-flagged off
- Shipped officially alongside **Opus 4.6** as "Agent Teams"
- [paddo.dev discovery writeup](https://paddo.dev/blog/claude-code-hidden-swarm/)

### Enabling

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Architecture Components

| Component | Role |
|-----------|------|
| **Team lead** | Main CC session that creates team, spawns teammates, coordinates |
| **Teammates** | Separate CC instances, each with own context |
| **Task list** | Shared list at `~/.claude/tasks/{team-name}/` |
| **Mailbox** | Messaging system for inter-agent communication |
| **Team config** | `~/.claude/teams/{team-name}/config.json` |

### Core Tools

| Tool | Operations |
|------|-----------|
| **Teammate** | `spawnTeam`, `cleanup`, `discoverTeams`, `requestJoin`, `approveJoin`, `rejectJoin` |
| **SendMessage** | `message` (to one), `broadcast` (to all), `shutdown_request`, `shutdown_response`, `plan_approval_response` |
| **TaskCreate** | Create tasks with dependencies |
| **TaskUpdate** | Update task status, claim tasks |
| **TaskList** | View all tasks and their statuses |
| **TaskGet** | Get details on a specific task |

### Task Coordination

- Tasks have three states: **pending**, **in progress**, **completed**
- Tasks can have **dependencies** (blocked until dependencies complete)
- **File locking** prevents race conditions when multiple teammates try to claim the same task
- After finishing a task, a teammate **picks up the next unassigned, unblocked task** automatically
- Lead can assign explicitly or teammates can self-claim

### Display Modes

| Mode | Description | Requirement |
|------|-------------|-------------|
| **in-process** | All teammates in main terminal, Shift+Down to cycle | Any terminal |
| **split-pane** | Each teammate gets own pane | tmux or iTerm2 |
| **auto** (default) | Split if in tmux, in-process otherwise | - |

```bash
# Force mode for a session
claude --teammate-mode in-process
```

### Communication Patterns

- **Automatic message delivery**: messages delivered automatically, no polling
- **Idle notifications**: teammates notify lead when they finish
- **Shared task list**: all agents see status and claim work
- **Peer-to-peer messaging**: any teammate can message any other directly
- **Broadcast**: send to all teammates (use sparingly -- costs scale with team size)

### Plan Approval Mode

```text
Spawn an architect teammate to refactor the authentication module.
Require plan approval before they make any changes.
```

Teammate works in **read-only plan mode** until lead approves. Lead can approve or reject with feedback. Rejected teammates revise and resubmit.

### Context Efficiency

> "Single-agent Claude typically uses 80-90% of its context window before needing a reset. With agent teams? Around 40%."

Each teammate loads: CLAUDE.md, MCP servers, skills, and the spawn prompt. The lead's conversation history does **NOT** carry over.

### Quality Gate Hooks

| Hook Event | When | Use |
|------------|------|-----|
| `TeammateIdle` | Teammate about to go idle | Exit code 2 sends feedback, keeps teammate working |
| `TaskCompleted` | Task being marked complete | Exit code 2 prevents completion, sends feedback |

**Sources**:
- [Official agent teams docs](https://code.claude.com/docs/en/agent-teams)
- [Complete guide](https://claudefa.st/blog/guide/agents/agent-teams)
- [Addy Osmani's writeup](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Swarm orchestration gist](https://gist.github.com/kieranklaassen/4f2aba89594a4aea4ad64d753984b2ea)

---

## 5. Hooks System: All 18 Lifecycle Events

Hooks are the primary extension mechanism for intercepting and controlling Claude Code behavior. They support three handler types: **command** (shell), **HTTP** (POST to URL), and **prompt** (LLM evaluation).

### Complete Event Reference

| Event | Matcher Input | When | Decision Control |
|-------|---------------|------|-----------------|
| `SessionStart` | `startup`, `resume`, `clear`, `compact` | Session begins or resumes | Context injection via stdout |
| `SessionEnd` | `clear`, `logout`, `prompt_input_exit`, etc. | Session terminates | Cleanup only |
| `UserPromptSubmit` | (no matcher) | User submits prompt, before processing | Can modify/block prompt |
| `PreToolUse` | Tool name (`Bash`, `Edit\|Write`, `mcp__.*`) | Before tool call executes | `allow` / `deny` / `ask` |
| `PostToolUse` | Tool name | After tool succeeds | Context injection |
| `PostToolUseFailure` | Tool name | After tool fails | Context injection |
| `PermissionRequest` | Tool name | Permission dialog appears | Auto-approve/deny |
| `Notification` | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` | CC sends notification | - |
| `SubagentStart` | Agent type name | Subagent spawned | Setup scripts |
| `SubagentStop` | Agent type name | Subagent finishes | Cleanup scripts |
| `Stop` | (no matcher) | Claude finishes responding | Completion validation |
| `TeammateIdle` | (no matcher) | Agent team teammate going idle | Exit 2 = keep working |
| `TaskCompleted` | (no matcher) | Task being marked complete | Exit 2 = prevent completion |
| `InstructionsLoaded` | (no matcher) | CLAUDE.md or rules file loaded | Context augmentation |
| `ConfigChange` | `user_settings`, `project_settings`, etc. | Config file changes during session | - |
| `WorktreeCreate` | (no matcher) | Worktree being created | Replace default git behavior |
| `WorktreeRemove` | (no matcher) | Worktree being removed | Custom cleanup |
| `PreCompact` | `manual`, `auto` | Before context compaction | Preserve critical info |

### Hook Configuration Locations

| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/settings.json` | All projects | No |
| `.claude/settings.json` | Single project | Yes (committable) |
| `.claude/settings.local.json` | Single project | No (gitignored) |
| Managed policy settings | Organization-wide | Admin-controlled |
| Plugin `hooks/hooks.json` | When plugin enabled | Bundled with plugin |
| Skill/agent frontmatter | While component active | In component file |

### Hook Handler Types

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/validate.sh" },
          { "type": "http", "url": "https://my-server.com/hook" },
          { "type": "prompt", "prompt": "Is this command safe?" }
        ]
      }
    ]
  }
}
```

### Exit Code Semantics

| Exit Code | Behavior |
|-----------|----------|
| 0 | Allow / success |
| 1 | Error (tool continues, error logged) |
| 2 | **Special**: blocks PreToolUse, prevents TaskCompleted, keeps TeammateIdle working |

### Key Hooks for Custom Orchestration

- **SessionStart**: Inject orchestrator state, load context, set environment variables
- **PreCompact**: Preserve critical orchestration context before compaction
- **SubagentStart/Stop**: Track subagent lifecycle, manage external state
- **TeammateIdle + TaskCompleted**: Quality gates for agent teams
- **WorktreeCreate/Remove**: Custom VCS isolation (works beyond git)

**Sources**:
- [Official hooks reference](https://code.claude.com/docs/en/hooks)
- [Hooks mastery repo](https://github.com/disler/claude-code-hooks-mastery)
- [Multi-agent observability via hooks](https://github.com/disler/claude-code-hooks-multi-agent-observability)
- [Hooks lifecycle guide](https://claudefa.st/blog/tools/hooks/hooks-guide)

---

## 6. Plugin System and Extension Points

### Plugin Structure

```
my-plugin/
  .claude-plugin/
    plugin.json          # manifest (name, description, version, author)
  commands/              # slash commands (skills)
  agents/                # custom subagent definitions
  skills/                # agent skills with SKILL.md
  hooks/
    hooks.json           # event handlers
  .mcp.json              # MCP server configurations
  .lsp.json              # LSP server configurations
  settings.json          # default settings (e.g., default agent)
```

### Plugin Manifest

```json
{
  "name": "my-plugin",
  "description": "Plugin description",
  "version": "1.0.0",
  "author": { "name": "Author" },
  "homepage": "https://...",
  "repository": "https://...",
  "license": "MIT"
}
```

### Plugin Distribution

- **Local**: `claude --plugin-dir ./my-plugin`
- **Marketplace**: `claude plugin install <name>` or `/plugin marketplace update`
- **Official marketplace**: Submit via claude.ai/settings/plugins/submit
- Skills are namespaced: `/my-plugin:hello` prevents conflicts

### MCP Integration

MCP (Model Context Protocol) extends Claude Code to interact with external services:
- Query production databases
- Create Jira tickets
- Review GitHub PRs
- Check Sentry errors
- Any API via natural language

### LSP Integration

Plugins can include Language Server Protocol configurations for code intelligence, giving Claude real-time diagnostics, completions, and references.

### settings.json in Plugins

```json
{
  "agent": "security-reviewer"  // activates a plugin agent as the main thread
}
```

**Sources**:
- [Official plugins docs](https://code.claude.com/docs/en/plugins)
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- [50+ Best MCP Servers](https://claudefa.st/blog/tools/mcp-extensions/best-addons)

---

## 7. Claude Agent SDK (Programmatic)

### Overview

The Claude Agent SDK is the runtime that powers Claude Code, exposed as a library. Renamed from "Claude Code SDK" in September 2025 to reflect its generalization beyond coding.

### Installation

```bash
# TypeScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install claude-code-sdk
```

### Core API

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// Returns async generator yielding typed messages
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

- **14+ built-in tools**: Read, Write, Bash, Glob, Grep, WebSearch, WebFetch, Agent, etc.
- **Custom tools as callbacks**: extend with your own tool implementations
- **Session management**: persistent sessions, resume, rewind
- **Structured outputs**: typed message streaming
- **Agent definitions**: pass `agents` parameter to define spawnable subagent types
- **Custom plugins**: load via `plugins` option
- **Headless mode**: `--print` flag with `stream-json` output for CI/CD
- **Bidirectional protocol**: multi-turn, persistent conversations

### Two Execution Modes

1. **Headless one-shot**: `claude --print --output-format stream-json "prompt"`
2. **Bidirectional stream-json**: Multi-turn persistent conversations via SDK

**Sources**:
- [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [npm package](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
- [Building agents guide](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

---

## 8. New Features: /simplify and /batch

### /simplify

Announced Feb 27, 2026 by Boris Cherny. Runs **parallel agents** that review changed code for:
- Reuse opportunities
- Quality issues
- Efficiency improvements

All in one pass. It is the automated code review step between "it works" and "it's ready to merge." The Claude Code team open-sourced their internal `code-simplifier` agent as a plugin:

```bash
claude plugin install code-simplifier
```

### /batch

Interactive planning of code migrations, then **parallel execution using dozens of agents**. Each agent runs with **full isolation using git worktrees**, tests its work before creating a PR.

### Worktree Isolation (Built-in)

Boris announced built-in git worktree support. Key details:
- `--worktree` (`-w`) flag creates isolated worktree + branch
- Subagents support `isolation: worktree` in frontmatter
- Each agent has entire codebase to itself
- Agents merge code only when tests pass
- **WorktreeCreate** / **WorktreeRemove** hooks for custom VCS
- Worktree auto-cleaned if subagent makes no changes

**Sources**:
- [Boris's announcement](https://x.com/bcherny/status/2027534984534544489)
- [Code-simplifier plugin](https://x.com/bcherny/status/2009450715081789767)
- [Worktree guide](https://claudefa.st/blog/guide/development/worktree-guide)

---

## 9. Community Projects and Patterns

### Major Community Orchestrators

| Project | Pattern | Key Feature |
|---------|---------|-------------|
| **claude-flow** | Swarm orchestration | Pre-TeammateTool community solution |
| **ccswarm** | Git worktree isolation | Per-agent branch isolation |
| **oh-my-claudecode** | 5 execution modes | Multi-modal orchestration |
| **ruflo** | Enterprise platform | Distributed swarm intelligence + RAG |
| **Agentrooms** | @mentions routing | Task routing to specialized agents |
| **wshobson/agents** | 7+ specialist agents | backend-architect -> database-architect -> frontend-developer -> test-automator -> security-auditor -> deployment-engineer -> observability-engineer |
| **parallel-code** | Side-by-side | Claude, Codex, Gemini each in own worktree |

### Community Patterns

1. **Agentic Workflow Patterns** (ThibautMelen): Subagent Orchestration, Progressive Skills, Parallel Tool Calling, Master-Clone Architecture, Wizard Workflows
2. **Fullstack Dev Skills** (jeffallan): 65 specialized skills, 9 project workflow commands, Jira/Confluence integration
3. **Multi-agent observability**: Hook-based real-time monitoring of agent events
4. **CLAUDE.md Best Practices**: Human-written context outperforms LLM-generated `/init` output. LLM-generated context files **decreased** success rates according to recent research.

### Historical Context

> "Before TeammateTool existed, developers built their own multi-agent solutions: claude-flow for swarm orchestration, ccswarm for git worktree isolation, oh-my-claudecode with five execution modes. Anthropic absorbed the pattern."

**Sources**:
- [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- [Agentrooms](https://claudecode.run/)
- [Ruflo](https://github.com/ruvnet/ruflo)
- [Claude Code Showcase](https://github.com/ChrisWiles/claude-code-showcase)
- [CLAUDE.md making agents dumber](https://medium.com/@cdcore/your-claude-md-is-making-your-agent-dumber-953f6dbed308)

---

## 10. Native vs Custom Orchestration Comparison

### When Native is Sufficient

| Capability | Subagents | Agent Teams | Adequate? |
|-----------|-----------|-------------|-----------|
| Parallel execution | Up to 10 | Unlimited | Yes |
| Context isolation | Yes | Yes | Yes |
| Inter-agent communication | No (report back only) | Yes (peer-to-peer) | Yes |
| Task dependency graphs | No | Yes (with blocking) | Yes |
| Quality gates | Via hooks | TeammateIdle + TaskCompleted | Yes |
| Session resumption | Yes (subagent resume) | **No** (known limitation) | Gap |
| Crash recovery | No | No | Gap |
| Custom IPC protocols | No | No | Gap |
| Nested orchestration | No (by design) | No (by design) | Gap |
| Cross-project coordination | No | No | Gap |
| Model-agnostic routing | No (Claude only) | No (Claude only) | Gap |

### When Custom Harness is Necessary

1. **Crash recovery / tmux persistence**: Native agent teams have no session resumption for in-process teammates. A tmux-based harness survives crashes.
2. **Nested orchestration**: Neither subagents nor agent teams support nesting. A custom harness can implement multi-level hierarchies.
3. **Cross-project coordination**: Native teams work within a single project. External harnesses can coordinate across repos.
4. **State persistence**: Native teams store state in `~/.claude/teams/` and `~/.claude/tasks/` but have no recovery mechanism. Custom harnesses can manage durable state files.
5. **Model-agnostic routing**: Claude Code only supports Claude models. Custom harnesses can route to different providers.
6. **Custom communication protocols**: Native uses file-based messaging. Custom can use any IPC.
7. **Deterministic workflow enforcement**: Hook-based gates are reactive; custom harnesses can enforce proactive workflow graphs.

### Architecture Comparison

```
NATIVE (Agent Teams):
  Lead Session
    |-- TeammateTool.spawnTeam()
    |-- SendMessage (peer-to-peer)
    |-- TaskList (shared, file-locked)
    |-- ~/.claude/teams/ + ~/.claude/tasks/

CUSTOM HARNESS (e.g., L-Thread Orchestrator):
  Orchestrator Process
    |-- tmux session management
    |-- terminal-write / terminal-read / terminal-wait
    |-- _bmad/orchestrator-state.json (durable state)
    |-- Crash recovery via tmux probe
    |-- Custom CLAUDE.md per agent
```

**Sources**:
- [Orchestration Wars comparison](https://www.sitepoint.com/agent-orchestration-framework-comparison-2026/)
- [Shipyard multi-agent guide](https://shipyard.build/blog/claude-code-multi-agent/)
- [Claude Code harness repo](https://github.com/Chachamaru127/claude-code-harness)

---

## 11. Known Limitations

### Agent Teams Limitations (Official)
1. **No session resumption** with in-process teammates (`/resume` and `/rewind` don't restore them)
2. **Task status can lag**: teammates sometimes fail to mark tasks as completed
3. **Shutdown can be slow**: teammates finish current request before stopping
4. **One team per session**: clean up before starting a new one
5. **No nested teams**: teammates cannot spawn their own teams
6. **Lead is fixed**: cannot promote a teammate or transfer leadership
7. **Permissions set at spawn**: all teammates inherit lead's mode
8. **Split panes require tmux/iTerm2**: not supported in VS Code terminal, Windows Terminal, or Ghostty

### Subagent Limitations
1. **Cannot spawn other subagents** (no nesting)
2. **10 concurrent max** with queueing for additional
3. **Batch execution**: Claude waits for entire batch to finish before starting next (doesn't dynamically pull from queue)
4. **20K token overhead** per spawn
5. **3-4 subagent types recommended max** to avoid decision overhead

### Context and Token Costs
- Agent teams use **significantly more tokens** than single sessions
- Each teammate has its own context window and token usage scales linearly
- Results returning from many subagents can consume significant main context
- LLM-generated CLAUDE.md files decrease success rates vs human-written ones

### Tool Rename Breaking Change
- v2.1.63 renamed Task tool to Agent tool
- `tool_name` in hook payloads changed from `"Task"` to `"Agent"`
- Undocumented in release notes
- `Task(...)` syntax in settings.json still works as alias

**Sources**:
- [Official limitations](https://code.claude.com/docs/en/agent-teams#limitations)
- [Task rename issue](https://github.com/anthropics/claude-code/issues/29677)
- [Custom agents spawn bug](https://github.com/anthropics/claude-code/issues/23506)
- [Delegate mode permissions bug](https://github.com/anthropics/claude-code/issues/24307)

---

## 12. Roadmap and Direction

### Confirmed/Announced
1. **/simplify** and **/batch** skills (Feb 27, 2026) -- automating PR review and code migrations
2. **Built-in git worktree support** -- now in CLI (was Desktop-only)
3. **Agent Teams on Bedrock, Vertex, and Foundry** -- enterprise cloud support
4. **Plugin ecosystem expansion** -- official marketplace with community submissions
5. **Cowork** -- file management agent for non-coders, demonstrates CC runtime generalization

### Trajectory Signals from Boris Cherny
- **"Claudes monitoring other Claudes"**: Multi-agent governance/oversight is next frontier
- **Interface uncertainty**: "The interface needs to let humans inspect what's happening while also optimizing for Claude-to-Claude communication"
- **Engineering productivity**: 200% increase per engineer at Anthropic
- **CC as OS**: The "AI OS Blueprint" pattern -- hooks, skills, agents, MCP as the operating system layer
- **Agent SDK generalization**: Renamed from "Claude Code SDK" to reflect broader agentic application

### Community Signals
- **ClaudeLog** and **claudefa.st** emerging as major community hubs
- **Multi-agent observability** via hooks gaining traction
- **Worktree isolation** becoming standard pattern for parallel work
- Demand for better session resumption and crash recovery

---

## 13. Patterns a Custom Harness Should Replicate

Based on CC internals, a custom orchestration harness (like the L-Thread Orchestrator / Pi Agent) should replicate or improve upon these patterns:

### Must-Have Patterns from CC Internals

1. **Context Isolation**: Each agent gets its own context window. This is non-negotiable for quality.

2. **File-Locked Task Claiming**: CC uses file locking to prevent race conditions. Custom harnesses should implement equivalent atomic task assignment.

3. **Automatic Idle Notification**: When a teammate finishes, it automatically notifies the lead. Custom harnesses need event-driven completion detection (not polling).

4. **Quality Gate Hooks**: The `TeammateIdle` and `TaskCompleted` hooks let you validate work before accepting it. Custom harnesses should implement equivalent pre-acceptance validation.

5. **Spawn Prompt with Full Context**: Teammates don't inherit conversation history, but they do get CLAUDE.md, MCP servers, skills, and a detailed spawn prompt. Custom harnesses must provide rich initial context.

6. **Task Dependency Graphs**: CC supports blocked tasks that unblock automatically when dependencies complete. Custom harnesses need this for complex workflows.

7. **Plan Approval Mode**: The ability to require a plan before implementation prevents wasted work. Custom harnesses should support review gates.

### Improvements Over CC Native

1. **Crash Recovery**: CC has none for in-process teammates. Tmux-based persistence is a clear advantage.

2. **Session Resumption**: CC explicitly documents this as a limitation. Durable state files + tmux recovery is superior.

3. **Nested Orchestration**: CC blocks this by design. Custom harnesses can implement multi-level hierarchies where an orchestrator spawns sub-orchestrators.

4. **Custom State Management**: CC stores state in `~/.claude/teams/` with no recovery mechanism. Custom harnesses should use project-local state files with versioning.

5. **Deterministic Workflow Graphs**: CC relies on LLM decision-making for task flow. Custom harnesses can enforce deterministic sequences when needed.

6. **Git Worktree Automation**: CC has built-in support, but custom harnesses can add additional layers (pre-merge testing, conflict resolution protocols).

7. **Observability**: CC's hook system provides raw events. Custom harnesses should aggregate these into dashboards or structured logs.

### Anti-Patterns to Avoid

1. **Don't replicate the LLM-generated CLAUDE.md problem**: Human-written context outperforms auto-generated descriptions.
2. **Don't exceed 3-5 parallel agents**: Diminishing returns beyond this in practice.
3. **Don't use polling for agent completion**: Use event-driven mechanisms (hooks, terminal-wait).
4. **Don't use `bash sleep`**: Event-driven waiting is mandatory (mirrors CC's own design).
5. **Don't put agents on the same files**: Worktree isolation or clear file ownership prevents conflicts.

---

## Appendix: Quick Reference for Integration Points

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Enable agent teams |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | Disable background subagents |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Trigger compaction earlier (e.g., 50) |

### File Paths

| Path | Content |
|------|---------|
| `~/.claude/teams/{team-name}/config.json` | Team configuration |
| `~/.claude/tasks/{team-name}/` | Shared task lists |
| `~/.claude/agents/` | User-level subagent definitions |
| `.claude/agents/` | Project-level subagent definitions |
| `~/.claude/agent-memory/{agent}/` | User-scope persistent memory |
| `.claude/agent-memory/{agent}/` | Project-scope persistent memory |
| `~/.claude/projects/{project}/{session}/subagents/agent-{id}.jsonl` | Subagent transcripts |

### CLI Flags for Orchestration

| Flag | Purpose |
|------|---------|
| `--agents '{json}'` | Define session-only subagents |
| `--agent <name>` | Run as specific agent (main thread) |
| `--teammate-mode in-process\|tmux` | Set display mode |
| `--worktree` / `-w` | Run in isolated git worktree |
| `--plugin-dir ./path` | Load plugin during development |
| `--print --output-format stream-json` | Headless mode |
| `--dangerously-skip-permissions` | Skip all permission checks |
| `--disallowedTools "Agent(X)"` | Block specific subagent types |

---

*Research conducted 2026-03-05. Sources verified against official Anthropic documentation and community resources.*
