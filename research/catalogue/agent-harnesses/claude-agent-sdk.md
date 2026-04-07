# Claude Agent SDK

> **Anthropic's official framework for building autonomous AI agents — the battle-tested runtime extracted from Claude Code, with first-class subagent orchestration, 18 lifecycle hooks, Agent Teams (swarms), and session persistence.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [anthropics/claude-code](https://github.com/anthropics/claude-code) (main runtime), [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python), [anthropics/claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript) |
| GitHub Stars | 74,700 (claude-code), 5,200 (Python SDK), 812 (TypeScript SDK) — as of 2026-03-08 |
| Publisher | Anthropic (bigtech — Boris Cherny leads Claude Code team) |
| License | Proprietary (Anthropic) |
| Tech Stack | TypeScript (primary runtime), Python SDK, Go SDK (community). Claude Code CLI as runtime engine. MCP for extensibility. |
| Maturity | 🟢 Production (powers Claude Code internally at Anthropic; v2.1.63+, TS V2 preview available) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | This IS our current runtime. Every agent we spawn runs on Claude Code's engine. The SDK formalizes what we do ad-hoc with tmux. Agent Teams is the native equivalent of our orchestrator-teams mode. |
| **Novelty** | 4/10 | We have already researched this extensively across Phase 1-3 (82+ agents, 119+ docs). The catalogue profile consolidates known findings. New additions: Agent Teams quality gate hooks (`TeammateIdle`, `TaskCompleted`), plugin system maturation, `/batch` worktree isolation. |
| **Actionable** | 8/10 | We are actively using this. Phase 2 improvements: adopt Agent Teams for well-scoped parallel work, use hooks for orchestration state preservation, evaluate `/batch` for code migrations. |

---

## Overview

> [!IMPORTANT]
> **This is a consolidation profile.** The Claude Agent SDK has been extensively researched across multiple dedicated documents. This profile merges findings from two primary sources — see the [full research index](#full-research-index) below for deep-dive documents.

The Claude Agent SDK (renamed from "Claude Code SDK" in late 2025) is Anthropic's official agent harness. Rather than designing abstractions from scratch, Anthropic extracted the production runtime from Claude Code — the internal coding tool used for software development, deep research, and workflow automation — and packaged it as an embeddable SDK available in TypeScript (`@anthropic-ai/claude-agent-sdk`, 522+ npm dependents) and Python (`claude-agent-sdk`).

The SDK provides a four-layer architecture: Your Application > Agent SDK (harness) > Claude Code CLI (runtime engine) > Claude API (the model). This means agents automatically inherit all of Claude Code's built-in tools (Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, Agent/Task tool), session persistence, automatic context compaction, and MCP extensibility — without writing boilerplate for the agent loop, stop-condition checking, or context management.

The multi-agent system operates at three tiers: **Subagents** (ephemeral workers within a session, up to 10 concurrent, no nesting), **Agent Teams** (separate CC processes with peer-to-peer messaging and shared task lists), and **External Harness** (CLI/SDK spawning separate `claude` processes with custom IPC — what the L-Thread Orchestrator currently uses via tmux). The strictly hierarchical subagent model (no subagent-of-subagent) is a deliberate design constraint matching the DeepMind finding that 2-3 agents is optimal and 4+ is universally suboptimal.

---

## Technical Architecture

```
Your Application
       |
Claude Agent SDK         (Agent Harness: agent loop, compaction, hooks, subagent lifecycle)
       |
Claude Code CLI          (Runtime Engine: 14+ built-in tools, session persistence, MCP)
       |
Claude API               (The Model: Opus / Sonnet / Haiku per agent)
```

### Three-Tier Multi-Agent Architecture

| Tier | Mechanism | Communication | Context | Max Parallel | Nesting |
|------|-----------|---------------|---------|-------------|---------|
| **Subagents** (Agent tool) | Ephemeral workers within session | Report results back to parent only | Own 200K window; results return to caller | 10 concurrent | Cannot nest |
| **Agent Teams** (TeammateTool) | Separate CC processes | Peer-to-peer messaging + shared task list | Fully independent windows | No hard limit (3-5 recommended) | Cannot nest |
| **External Harness** (CLI/SDK) | Separate `claude` processes | Custom IPC (files, tmux, pipes) | Fully independent | Unlimited | Can nest |

### Subagent System

Custom subagents are defined as Markdown files with YAML frontmatter in `.claude/agents/`:

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Grep, Glob, Bash
model: sonnet
maxTurns: 50
isolation: worktree
background: false
---
You are a senior code reviewer...
```

Key constraints: each subagent gets its own 200K context window with 20K token overhead per spawn, cannot spawn other subagents, auto-compaction at ~95% capacity, transcripts stored at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`.

Built-in subagent types: Explore (Haiku, read-only), Plan (inherits model, read-only), General-purpose (all tools), Bash (terminal only), Claude Code Guide (Haiku).

### Agent Teams Architecture

| Component | Role |
|-----------|------|
| **Team lead** | Main CC session that creates team, spawns teammates, coordinates |
| **Teammates** | Separate CC instances, each with own context |
| **Task list** | Shared list at `~/.claude/tasks/{team-name}/`, file-locked |
| **Mailbox** | Messaging system for inter-agent communication |
| **Team config** | `~/.claude/teams/{team-name}/config.json` |

Core tools: `Teammate` (spawn/cleanup/discover), `SendMessage` (message/broadcast/shutdown), `TaskCreate`, `TaskUpdate`, `TaskList`, `TaskGet`. Tasks support three states (pending/in progress/completed) with dependency blocking.

Display modes: **in-process** (all in one terminal, Shift+Down to cycle), **split-pane** (each teammate gets own pane, requires tmux/iTerm2), **auto** (split if tmux available).

Plan Approval Mode: teammates work in read-only plan mode until lead approves — prevents wasted implementation work.

### Hooks System (18 Lifecycle Events)

| Event | When | Decision Control |
|-------|------|-----------------|
| `SessionStart` | Session begins or resumes | Context injection via stdout |
| `SessionEnd` | Session terminates | Cleanup only |
| `UserPromptSubmit` | User submits prompt | Can modify/block prompt |
| `PreToolUse` | Before tool executes | `allow` / `deny` / `ask` |
| `PostToolUse` | After tool succeeds | Context injection |
| `PostToolUseFailure` | After tool fails | Context injection |
| `PermissionRequest` | Permission dialog appears | Auto-approve/deny |
| `Notification` | CC sends notification | — |
| `SubagentStart` | Subagent spawned | Setup scripts |
| `SubagentStop` | Subagent finishes | Cleanup scripts |
| `Stop` | Claude finishes responding | Completion validation |
| `TeammateIdle` | Teammate going idle | Exit 2 = keep working |
| `TaskCompleted` | Task marked complete | Exit 2 = prevent completion |
| `InstructionsLoaded` | CLAUDE.md loaded | Context augmentation |
| `ConfigChange` | Config changes during session | — |
| `WorktreeCreate` | Worktree being created | Replace default git behavior |
| `WorktreeRemove` | Worktree being removed | Custom cleanup |
| `PreCompact` | Before context compaction | Preserve critical info |

Three handler types: **command** (shell), **HTTP** (POST to URL), **prompt** (LLM evaluation). Exit code 2 has special semantics: blocks PreToolUse, prevents TaskCompleted, keeps TeammateIdle working.

### Plugin System

```
my-plugin/
  .claude-plugin/plugin.json    # manifest
  commands/                     # slash commands (skills)
  agents/                       # custom subagent definitions
  skills/                       # agent skills with SKILL.md
  hooks/hooks.json              # event handlers
  .mcp.json                     # MCP server configurations
  .lsp.json                     # LSP server configurations
  settings.json                 # default settings
```

Distribution: local (`--plugin-dir`), marketplace (`claude plugin install`), official submission via claude.ai/settings/plugins/submit. Skills namespaced to prevent conflicts.

### SDK API (Programmatic)

```python
# Python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("search_database", "Search internal DB", {"query": str, "limit": int})
async def search_database(args):
    results = await db.search(args["query"], limit=args["limit"])
    return {"content": [{"type": "text", "text": json.dumps(results)}]}
```

```typescript
// TypeScript
import { query } from "@anthropic-ai/claude-agent-sdk";

const agent = query({
  prompt: "Refactor the auth module",
  allowedTools: ["Read", "Write", "Bash", "Agent"],
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
```

### Four Patterns for Building Orchestrators

| Dimension | Direct API | CC Subprocess | Agent SDK | .claude/agents/ |
|-----------|-----------|---------------|-----------|-----------------|
| Lines of code | 500-2000 | 200-500 | 50-200 | 0 |
| Agent loop | Manual | CC handles | SDK handles | CC handles |
| Context mgmt | Manual | CC handles | SDK handles | CC handles |
| Subagents | Manual threads | Spawn processes | AgentDefinition | YAML frontmatter |
| Session persistence | Manual | Built-in | Built-in | Built-in |
| Model flexibility | Any model | Claude only | Claude only | Claude only |

---

## Publisher Background

**Anthropic** is one of the leading AI safety companies, founded by former OpenAI researchers (Dario and Daniela Amodei). Claude Code is led by **Boris Cherny** (@bcherny, 297K followers), who claims to have written zero manual code since November 2025 and runs 5 Claude instances in parallel. He predicts 20% of all public GitHub commits will be Claude Code-authored by end of 2026 (currently 4%).

Key team members: @dmwlff (18K followers, Claude Code team), @JacksonKernion (fine-tuning), @k_neklyudov (technical staff).

Recent launches: `/simplify` (parallel code review agents), `/batch` (parallel code migration via git worktrees + dozens of agents), `Cowork` (file management agent for non-coders), open-sourced `code-simplifier` plugin. Agent Teams shipped alongside Opus 4.6 after being discovered feature-flagged in the binary by community member @kieranklaassen in January 2026.

**Risk assessment:** Minimal bus-factor risk (large corporate team). Proprietary license means no forking if Anthropic changes direction. Claude-only lock-in is structural — the entire stack assumes Claude as the underlying model. Pricing arbitrage (Claude Max $200/mo = 18-36x vs API) is structurally temporary.

---

## What's Valuable for Us

1. **Agent Teams Quality Gate Hooks:** `TeammateIdle` (exit code 2 sends feedback, keeps teammate working) and `TaskCompleted` (exit code 2 prevents premature completion). These enable automated work validation without human review — directly maps to our E2E testing gate requirement.

2. **PreCompact Hooks for State Preservation:** PreCompact receives `trigger` (auto/manual) and `custom_instructions`, enabling project-specific context preservation during compaction. Our `orchestrator-handoff.sh` script can be replaced or augmented with SDK hooks.

3. **Plan Approval Mode for Agent Teams:** Teammates work in read-only plan mode until lead approves. Prevents wasted implementation work — critical when agent time costs real tokens.

4. **Git Worktree Isolation:** `isolation: worktree` in agent frontmatter, `--worktree` CLI flag, WorktreeCreate/WorktreeRemove hooks. Each agent gets entire codebase to itself, merges only when tests pass. The `/batch` skill demonstrates this at scale with dozens of agents.

5. **Plugin System for Portable Orchestration:** Plugins bundle agents, hooks, skills, commands, and MCP configs into distributable packages. Our orchestrator configuration could be packaged as a plugin for reuse across projects.

6. **Model Heterogeneity:** Opus for orchestrator, Sonnet for implementation workers, Haiku for exploration/discovery. Matches our 70/30 deterministic/LLM split — expensive reasoning where it matters, cheap execution elsewhere.

7. **SubagentStart/SubagentStop Hooks:** Track subagent lifecycle externally, enabling custom state management and observability without modifying the agent itself.

8. **Context Efficiency from Teams:** "Single-agent Claude typically uses 80-90% of its context window before needing a reset. With agent teams? Around 40%." Each teammate loads CLAUDE.md, MCP servers, skills, and spawn prompt — but NOT the lead's conversation history.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Claude-only lock-in** | The entire SDK assumes Claude models. No path to multi-model routing. Per Master Blueprint, this is acceptable for Phase 1-2 but must be hedged by Phase 3 (Pi Agent as adapter candidate). |
| **No subagent nesting** | Strictly hierarchical by design. Prevents Gas Town-style 20-30 agent factories. Matches DeepMind optimal team size (2-3), but limits scaling patterns. |
| **LLM-decided delegation** | SDK uses Claude's judgment for which subagent to invoke. Less predictable than our deterministic orchestrator assignments. Agent Teams mitigates this with explicit task assignment. |
| **Black-box subagent execution** | No intermediate stream visibility for subagents. With tmux, we can observe agent work in real-time via `tmux capture-pane`. SDK subagents return only inputs and final outputs. |
| **No crash recovery for Agent Teams** | In-process teammates cannot be resumed with `/resume` or `/rewind`. Our tmux-based persistence layer is strictly superior here. |
| **No cross-project coordination** | Native teams work within a single project. Our orchestrator coordinates across repos. |
| **Agent Teams limitations** | One team per session, no nested teams, lead is fixed (cannot promote/transfer), permissions set at spawn (inherited from lead), split panes require tmux/iTerm2. |

---

## Full Research Index

> [!NOTE]
> The following documents contain deep-dive analysis. This profile is a consolidation — refer to these for full details.

| Document | Focus |
|----------|-------|
| [claude-agent-sdk-orchestration.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_claude-agent-sdk-orchestration.md) | SDK architecture, 4-layer design, tool definition, subagent system, hooks/sessions/lifecycle, 4 orchestration patterns, comparison with Pi, strategic assessment for L-Thread |
| [claude-code-multiagent-internals.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_claude-code-multiagent-internals.md) | Key people (Boris Cherny), 3-tier multi-agent overview, Agent/Task tool deep dive, Agent Teams (swarms), all 18 hooks, plugin system, /simplify and /batch, community projects, native vs custom harness comparison, known limitations, roadmap |

---

## Known Limitations

### Agent Teams
1. No session resumption with in-process teammates
2. Task status can lag (teammates sometimes fail to mark tasks completed)
3. Shutdown can be slow (teammates finish current request before stopping)
4. One team per session
5. No nested teams
6. Lead is fixed (cannot promote or transfer leadership)
7. Permissions set at spawn (all teammates inherit lead's mode)
8. Split panes require tmux/iTerm2

### Subagents
1. Cannot spawn other subagents (no nesting)
2. 10 concurrent max with queueing
3. Batch execution (Claude waits for entire batch before starting next)
4. 20K token overhead per spawn
5. 3-4 subagent types recommended max to avoid decision overhead
6. Task tool renamed to Agent tool in v2.1.63 (breaking change for hook payloads)

### General
- Agent teams use significantly more tokens than single sessions (linear scaling per teammate)
- LLM-generated CLAUDE.md files decrease success rates vs human-written ones
- `--append-system-prompt` is ephemeral and not preserved on resume
- Session hooks do not run in `--print` mode

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** Continue using Claude Code as primary runtime. Adopt Agent Teams for well-scoped parallel tasks (research, code review, test generation). Implement PreCompact hooks to replace custom handoff scripts. Test `/batch` for code migrations.
- **Phase 3 (Days 60-90):** Build `AgentRuntime` adapter interface abstracting over both Claude Agent SDK and Pi Agent. Evaluate whether Agent Teams can replace tmux-based orchestration for standard workflows while keeping tmux for crash recovery and cross-project coordination.
- **Phase 4 (Days 90+):** If Pi Agent stabilizes, strangler-fig pattern: Pi for cost-sensitive/model-agnostic agents, Claude Agent SDK for complex reasoning tasks requiring Opus. Keep SDK hooks for quality gates regardless of runtime.

---

## Key Takeaway

> **The Claude Agent SDK is the production-grade harness we already run on — its Agent Teams, 18 lifecycle hooks, and plugin system provide native orchestration primitives that can replace our custom tmux coordination for well-scoped tasks, but its lack of crash recovery, subagent nesting, and model agnosticism means our L-Thread Orchestrator layer remains necessary for production resilience.**
