# Pi Agent vs Claude Code: Decision Analysis

**Date:** 2026-03-06
**Author:** Research Agent (WebSearch-based)
**Purpose:** Provide Burak with a clear, evidence-based recommendation on what to build where

---

## Table of Contents

1. [Pi Agent March 2026 State](#1-pi-agent-march-2026-state)
2. [Claude Code March 2026 State](#2-claude-code-march-2026-state)
3. [Head-to-Head Feature Comparison](#3-head-to-head-feature-comparison)
4. [OpenClaw Analysis](#4-openclaw-analysis)
5. [What Goes Where](#5-what-goes-where)
6. [Migration Path](#6-migration-path)
7. [Recommendation](#7-recommendation)

---

## 1. Pi Agent March 2026 State

### Growth Trajectory

| Metric | Dec 2025 | Jan 2026 | March 2026 |
|--------|----------|----------|------------|
| GitHub stars (pi-mono) | ~2.9K | ~8.9K | ~19.4K |
| npm weekly downloads | ~4K | ~1.3M | ~3.17M/month |
| Contributors | Unknown | Unknown | 134 |
| Published versions | Unknown | Unknown | 207 (in 4 months) |

Pi has gone from a niche tool to the second most popular coding agent (behind OpenClaw, which uses Pi internally). Growth is explosive and sustained.

### What Pi Has Shipped Recently

- **Offline startup mode** (`--offline` / `PI_OFFLINE`) for air-gapped environments
- **Gemini 3.1 Pro Preview** support added to google-gemini-cli provider
- **GNU Screen terminal detection** fixes
- **Issue tracker and PRs reopened** March 2, 2026 (post-vacation)
- **324+ model catalog** across 20+ providers, auto-generated from models.dev and OpenRouter
- **RPC mode** for headless/programmatic control (stdin/stdout JSONL)
- **SDK mode** for embedding (`createAgentSession()`)
- **Print/JSON mode** for CI/CD pipelines

### Extension Ecosystem

The community extension ecosystem is growing but not yet massive:

- **pi-side-agents** (tmux-based sub-agents, Petr Pasky)
- **pi-subagents** (chain orchestration, Nico Bailon)
- **pi-collaborating-agents** (message-passing multi-agent, Baochun Li)
- **pi-mcp-adapter** (MCP bridge, Nico Bailon)
- **pi-interactive-shell** (PTY emulation without tmux)
- **damage-control** (safety auditing via YAML rules)
- **pure-focus**, **minimal**, **tool-counter** (workflow extensions)
- **subagent-widget** (background sub-agent UI)
- **agent-team**, **agent-chain** (multi-agent patterns)
- **cross-agent** (loads configs from `.claude/`, `.gemini/`, `.codex/`)
- **pi-pi** (meta-agent that builds Pi agents)

Extensions are distributed as npm packages (`pi install npm:@foo/bar`) or local TypeScript files. No centralized registry comparable to OpenClaw's ClawHub (13,729 skills). The "pi-package" npm keyword is the informal discovery mechanism.

### Stability & Documentation

- **Maintained by Mario Zechner** (bus factor of 1, mitigated by MIT license and 134 contributors)
- **Documentation quality:** Good for core features, sparse for extensions. Extension authors write their own docs.
- **Breaking changes:** Multiple releases per week means API surface moves fast. Pinning versions is mandatory.
- **Community:** Discord-based, active but smaller than Claude Code's community

### What Pi Still Lacks

1. No native MCP support (deliberate choice; pi-mcp-adapter bridges the gap)
2. No native sub-agent support (community extensions fill this)
3. No IDE integration (terminal-only by design)
4. No SSO/SAML, audit logging, or enterprise features
5. No built-in scheduling (must use external cron / LaunchAgents / OpenClaw's heartbeat)
6. No built-in permission model (YOLO by default; damage-control extension is opt-in)

---

## 2. Claude Code March 2026 State

### Recent Releases (Feb-March 2026)

Claude Code has been on a rapid release cadence: versions 2.1.41 through 2.1.63+ across 15 days in late February/early March 2026. Key additions:

- **Agent Teams** (experimental): Lead agent + teammates with shared task list, inter-agent messaging, and centralized management. Uses `Task`, `SendMessage`, `TaskList` tools.
- **Built-in git worktree support**: Each agent gets isolated worktree. Available in both CLI and Desktop app.
- **Worktree hooks**: `WorktreeCreate` and `WorktreeRemove` hooks for custom VCS integration (SVN, Perforce, Mercurial)
- **HTTP hooks**: `"type": "http"` hooks that POST JSON to a URL instead of running shell commands. Custom headers with env var interpolation.
- **14 lifecycle hooks** expanded from original 7. Three handler types: `command`, `prompt`, `agent`.
- **Custom subagents**: `.claude/agents/*.md` files with YAML frontmatter, automatic delegation
- **Skills**: Markdown-based (SKILL.md) for domain knowledge injection
- **New commands**: `/simplify`, `/batch`, `/copy`
- **Shared project configs**: Configs and auto-memory now shared across git worktrees of same repository
- **Model update**: Opus 4 and 4.1 removed; pinned users auto-moved to Opus 4.6
- **Symlink security fix**: Writing through symlinked parent directories no longer escapes working directory

### Pricing & Limits

| Plan | Price | Usage | Opus Access |
|------|-------|-------|-------------|
| Pro | $20/mo | ~45 messages per 5-hour window (10-40 coding prompts) | Limited |
| Max 5x | $100/mo | ~5x Pro usage | Yes + priority |
| Max 20x | $200/mo | ~20x Pro usage + weekly active compute hours cap | Yes + priority |
| API | Pay-per-token | $15/MTok input, $75/MTok output (Opus) | Full |

Max 20x at $200/mo = 18-36x arbitrage vs API pricing for heavy usage. Weekly limits with active compute hours cap. Additional usage purchasable at API rates.

### Agent Teams Limitations (Critical)

- **Experimental** (not production-ready)
- No session resumption: `/resume` and `/rewind` do not restore teammates
- One team per session; no nested teams
- Task status lag: teammates sometimes fail to mark tasks as completed
- Slow shutdown: teammates finish current request before terminating
- 4x token consumption vs sub-agents
- No file locking: last write wins on same file
- Token costs scale linearly per teammate (each has full context window)
- Coordination overhead increases super-linearly with teammate count

### What Claude Code Still Lacks

1. Model-locked to Anthropic (Claude family only)
2. No mid-session model switching
3. No local model support
4. Closed-source (TypeScript SDK has commercial license terms)
5. Auto-updates can break existing workflows (no version pinning option)
6. Agent Teams experimental and unstable
7. ~10,000 token system prompt overhead per session
8. MCP tool descriptions add 10K-25K tokens of context overhead
9. No cost tracking/visibility built in
10. No deterministic tool-call blocking (hooks can block but only via shell subprocess or HTTP)

---

## 3. Head-to-Head Feature Comparison

### Core Architecture

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **System prompt size** | ~200 tokens (core) / <1,000 (with tools) | ~10,000 tokens | Pi |
| **Core tools** | 4 (read, write, edit, bash) + 3 convenience | 15-20 built-in | Pi (less = more) |
| **Effective context window** | ~199,000 tokens of 200K | ~150,000-170,000 tokens of 200K | Pi |
| **Extension/plugin system** | TypeScript in-process (25+ events) | Shell/HTTP hooks (14 events) + custom agents | Pi |
| **Context rewriting** | Yes (`context` event) | No (hooks cannot modify LLM input) | Pi |
| **Tool call blocking** | In-process, microseconds | Shell subprocess or HTTP, milliseconds | Pi |
| **Type safety** | Full TypeScript types for all events | Untyped shell strings / JSON | Pi |

### Agent Orchestration

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **Sub-agent spawning** | Extensions (pi-side-agents, pi-subagents) | Native (Task tool, custom agents) | Claude Code |
| **Agent Teams / Swarms** | Extensions (pi-collaborating-agents, agent-team) | Native (experimental) | Tie (both immature) |
| **Worktree isolation** | Via pi-side-agents (tmux + worktree) | Native built-in | Claude Code |
| **Inter-agent messaging** | File-based JSONL inboxes | In-memory routing (SendMessage) | Claude Code |
| **Agent chain patterns** | pi-subagents (.chain.md files) | Custom agents with delegation | Pi |
| **Session resumption** | JSONL session files + `/resume` | `/resume` (but not with teammates) | Pi |

### Model & Provider

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **Supported models** | 324+ across 20+ providers | Claude family only (Anthropic) | Pi |
| **Mid-session model switching** | Yes (`/model` command) | No | Pi |
| **Local model support** | Yes (Ollama, vLLM, any OpenAI-compatible) | No | Pi |
| **Cost optimization routing** | Route by task complexity | Fixed model per session | Pi |
| **Provider lock-in** | None | Complete (Anthropic) | Pi |
| **Best-in-class Claude integration** | Via Anthropic provider | Native, deeply optimized | Claude Code |

### Developer Experience

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **IDE integration** | None (terminal-only) | VS Code + JetBrains | Claude Code |
| **MCP support** | Via pi-mcp-adapter (bridge) | Native, first-class | Claude Code |
| **Permission model** | YOLO default + opt-in extensions | 5 modes, deny-first, Haiku pre-screening | Claude Code |
| **Configuration** | `.pi/settings.json` + extensions | `.claude/settings.json` + CLAUDE.md + agents/ | Tie |
| **Version pinning** | npm lockfile, full control | Auto-updates, no pinning | Pi |
| **Licensing** | MIT (fully open) | Commercial terms on TypeScript SDK | Pi |
| **Documentation** | Good core, sparse extensions | Comprehensive official docs | Claude Code |
| **Community size** | ~19.4K stars, Discord | Larger (Anthropic-backed), forums + Discord | Claude Code |

### State & Persistence

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **Session persistence** | JSONL files, `/tree` navigation | Resume, rewind | Tie |
| **State management** | `appendEntry()` + external files | External files (JSON) + hooks | Pi (dual mode) |
| **Compaction** | Built-in with `session_before_compact` hook | Built-in with PreCompact hook | Tie |
| **Cross-session state** | External files (same as current L-Thread) | External files (same as current L-Thread) | Tie |

### Scheduling & Automation

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **Built-in scheduling** | None (use cron/LaunchAgents) | None (use cron/LaunchAgents) | Tie |
| **Headless execution** | RPC mode, SDK mode, Print/JSON mode | `--print` mode, `-p` flag | Pi (more modes) |
| **CI/CD integration** | JSON output mode | Print mode | Tie |
| **Programmatic control** | RPC (JSONL stdin/stdout) + SDK (Node.js API) | Claude Agent SDK (Python/TypeScript) | Tie |

### Cost

| Feature | Pi Agent | Claude Code | Winner |
|---------|----------|-------------|--------|
| **Platform cost** | Free (MIT, self-hosted) | $200/mo Max 20x or API pricing | Pi |
| **Token cost** | Pay-per-token at provider rates | Included in Max subscription (with caps) | Claude Code (Max arbitrage) |
| **Effective cost for heavy use** | API costs can exceed $200/mo easily | $200/mo flat with 20x cap | Depends on volume |
| **Cost visibility** | Extensions (tool-counter, custom) | None built-in | Pi |

---

## 4. OpenClaw Analysis

### What OpenClaw Is

OpenClaw (formerly Clawdbot, then Moltbot) is an autonomous AI agent framework created by Peter Steinberger. It is **not** a coding agent -- it is a **personal AI assistant** that runs 24/7 and communicates via messaging apps (WhatsApp, Telegram, Discord, Slack, iMessage, web UI).

- **163K GitHub stars** (as of March 2026)
- **13,729 community-built skills** on ClawHub marketplace
- **50+ messaging/service integrations**
- **MIT licensed**
- **Wikipedia entry** (notable as an AI project)

### OpenClaw Architecture

```
Gateway (WhatsApp, Telegram, Slack, iMessage, Web, CLI)
    |
Brain (ReAct reasoning loop via Pi SDK)
    |
Memory (Markdown files, persistent long-term)
    |
Skills (13,729+ on ClawHub)
    |
Heartbeat (cron scheduling, proactive tasks)
```

OpenClaw uses **Pi SDK** (`@mariozechner/pi-coding-agent`) as its "think and act" engine:

- `createAgentSession()` gives OpenClaw full control over session lifecycle
- Pi's `codingTools` (read, bash, edit, write) are base tools
- OpenClaw replaces `bash` with a sandboxed `exec/process`
- OpenClaw adds middleware: permission checks, image normalization, context pruning
- OpenClaw's compaction replaces Pi's default with a multi-stage pipeline

### OpenClaw vs Pi Agent vs Claude Code

| Dimension | OpenClaw | Pi Agent | Claude Code |
|-----------|----------|----------|-------------|
| **Primary use case** | 24/7 personal assistant | Coding agent | Coding agent |
| **Interface** | Messaging apps (WhatsApp, etc.) | Terminal | Terminal + IDE |
| **Scheduling** | Built-in (Heartbeat/cron) | None | None |
| **Memory** | Persistent Markdown + proactive recall | JSONL sessions | Resume/rewind |
| **Skills/Extensions** | 13,729 on ClawHub | ~30-50 community | Custom agents + MCP |
| **Multi-model** | Yes (via Pi SDK) | Yes (native) | No (Claude only) |
| **Self-hosted** | Yes ($15 VPS) | Yes (local) | No (Anthropic cloud) |
| **Coding quality** | Inherits Pi's coding ability | Native strength | Native strength |
| **Always-on** | Yes (designed for it) | No (session-based) | No (session-based) |

### Should Burak Consider OpenClaw?

**Not as a replacement for Pi or Claude Code.** OpenClaw is a different product category:

- OpenClaw = personal AI assistant (always-on, messaging-first, life/business automation)
- Pi Agent = coding agent engine (session-based, terminal, code-focused)
- Claude Code = coding agent product (session-based, IDE-integrated, code-focused)

OpenClaw is relevant if Burak wants to build an **always-on business agent** (scheduling, client communication, invoicing, monitoring) that also codes when needed. The architecture is:

```
OpenClaw (business layer: scheduling, messaging, memory)
    |
    uses Pi SDK (coding layer: read, write, edit, bash)
    |
    which calls LLM providers (Anthropic, OpenAI, Google, etc.)
```

Elvis Sun's approach (100% OpenClaw) works because Elvis is building an always-on autonomous assistant, not just a coding orchestrator. If Burak's vision is "autonomous ROI-positive multi-agent system that scales infinitely with minimal human oversight," OpenClaw's architecture is closer to that vision than either Pi or Claude Code alone.

**However:** Burak's current revenue is from contract coding work, not from running a 24/7 assistant. OpenClaw is a distraction unless he's building the business automation layer. Focus on the coding orchestrator first.

---

## 5. What Goes Where

### The Clean Split

Based on the feature comparison, there is a natural division:

| Layer | Best Tool | Why |
|-------|-----------|-----|
| **Orchestration logic** | Pi Agent | Programmatic hooks, context rewriting, model routing, TypeScript enforcement |
| **Coding execution** | Claude Code (via Max) | Best Claude integration, IDE support, $200/mo arbitrage, worktree isolation |
| **Business automation** | OpenClaw (future) | Scheduling, messaging, memory, 24/7 operation |
| **Deterministic infrastructure** | Shell scripts | tmux management, cron scheduling, git operations, deployment |

### What Should Be Built in Pi Agent

1. **Orchestrator persona and loop** -- The L-Thread orchestrator itself. Pi's `tool_call` hooks enforce the "no code" rule programmatically. The `context` event enables dynamic context injection. The orchestrator spawns coding agents but never codes itself.

2. **Rule enforcement** -- All 4 Absolute Rules become TypeScript hooks that cannot be bypassed regardless of context length or compaction.

3. **Multi-model routing** -- Use Claude Opus for complex architecture decisions, Sonnet for standard coding, Haiku for reviews and simple tasks. This is impossible in Claude Code.

4. **Cost tracking and observability** -- Pi's in-process hooks can track every token, every tool call, every model invocation. Claude Code provides no visibility.

5. **Cross-project extension library** -- Build orchestrator extensions once, `pi install` everywhere. No more copying `.claude/agents/orchestrator.md` to every project.

6. **Research agents** -- Multi-agent research (like the Phase 1/2 operations) benefits from model flexibility. Use Claude for deep analysis, GPT-4o for breadth, Gemini for Google-source research.

### What Should Stay in Claude Code

1. **Coding agents (workers)** -- The actual coding work. Claude Code's deep Anthropic integration, IDE support, and Max subscription arbitrage make it the best choice for the agents that write code. The orchestrator (Pi) spawns Claude Code sessions as workers.

2. **IDE-integrated development** -- When Burak is personally coding (not orchestrating), Claude Code in VS Code/JetBrains is superior to a terminal-only Pi session.

3. **MCP-heavy workflows** -- Chrome DevTools MCP for E2E testing works natively in Claude Code. The pi-mcp-adapter is functional but adds a layer of indirection.

4. **Quick one-off tasks** -- When the overhead of the orchestration loop is unnecessary. "Fix this bug" is faster in Claude Code than setting up a Pi orchestration session.

### What Should Be Deterministic Shell Scripts (Neither)

1. **tmux session management** -- Creating, monitoring, and recovering tmux sessions. Already in `.bmad/scripts/tmux-helpers.sh`. Should remain shell scripts that both Pi and Claude Code can invoke.

2. **cron/LaunchAgents scheduling** -- Neither Pi nor Claude Code has built-in scheduling. Use macOS LaunchAgents or cron for recurring tasks. Shell scripts are the right abstraction.

3. **Git operations** -- Branch creation, worktree management, PR merging. These are deterministic and should not depend on LLM judgment.

4. **State file initialization** -- Resetting `_bmad/*.json` state files for new sprints. Deterministic, no LLM needed.

5. **Process cleanup** -- `pkill` patterns for orphaned agent processes. Shell scripts.

6. **Health monitoring** -- Checking if agents are alive, restarting crashed sessions. The Overseer pattern is better as a shell script with optional Pi/Claude Code escalation for complex issues.

### The Hybrid Architecture

```
Layer 3: Deterministic Shell Scripts
         tmux-helpers.sh, cron jobs, git automation, state init
              |
Layer 2: Pi Agent (Orchestrator)
         L-Thread loop, rule enforcement, model routing, cost tracking
         Spawns and manages Layer 1 agents
              |
Layer 1: Claude Code (Workers)
         Actual coding, E2E testing (Chrome DevTools MCP), IDE work
         Max subscription for cost efficiency
              |
Layer 0: Shared Infrastructure
         _bmad/*.json state files, git repos, tmux sessions
```

### Why This Split Works

1. **Pi orchestrates, Claude codes.** The orchestrator never needs IDE integration or native MCP. The coding agents never need model routing or cross-project extension reuse.

2. **Cost optimization.** The orchestrator (Pi) can use cheaper models for coordination decisions (Haiku/Sonnet). The coding agents (Claude Code) use the Max subscription's included Opus tokens.

3. **No vendor lock-in on the control plane.** If Anthropic changes Max pricing or Claude Code breaks, the orchestration logic is in Pi (MIT, version-pinned, self-hosted). Only the worker layer is Anthropic-dependent.

4. **Incremental migration.** Start by moving just the orchestrator to Pi. Workers stay on Claude Code. Over time, evaluate whether Pi workers (with Claude via API) outperform Claude Code workers.

---

## 6. Migration Path

### Phase 0: Coexistence (This Week)

**Effort:** 1 day. **Risk:** Zero.

Install Pi alongside Claude Code. They use different config directories (`.pi/` vs `.claude/`) and do not conflict.

```bash
npm install -g @mariozechner/pi-coding-agent
mkdir -p .pi/extensions .pi/agents .pi/skills
```

Create a minimal `.pi/settings.json`:

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "thinking": "medium"
}
```

Test Pi on a simple coding task to verify it works with your Anthropic API key. Do not migrate anything yet.

### Phase 1: Enforcement Extensions (Week 1-2)

**Effort:** ~3-4 days of extension development. **Risk:** Low.

Build the three P0 extensions that provide immediate value without changing the orchestration loop:

1. **`orchestrator-discipline.ts`** (~150 lines) -- Block Edit/Write on code files. This single extension eliminates the "DU BIST KEIN ENTWICKLER" prompt fragility.

2. **`state-manager.ts`** (~200 lines) -- Dual persistence (`appendEntry()` + JSON files). Replaces SessionStart and PreCompact shell hooks with in-process TypeScript.

3. **`e2e-gate.ts`** (~100 lines) -- Block issue close without E2E test pass. Prevents INC-014/INC-015 recurrence programmatically.

**Exit criteria:** Run a Pi session with these extensions. Verify that attempting to edit a `.ts` file returns a block message. Verify that attempting to close an issue without E2E returns a block message.

### Phase 2: Orchestrator Loop on Pi (Week 3-4)

**Effort:** ~5-7 days. **Risk:** Medium.

Install community sub-agent extensions:

```bash
pi install npm:@pasky/pi-side-agents
pi install npm:@nicobailon/pi-mcp-adapter
```

Build the orchestrator loop extension (~500 lines):

- GET_NEXT_STORY (query GitHub issues)
- SPAWN_DEV_AGENT (via pi-side-agents, which creates tmux windows with worktrees)
- WAIT_FOR_PR (event-driven via agent-wait-any)
- REVIEW_CYCLE (spawn review agent, bounded to 3 cycles by enforcement extension)
- AUTO_MERGE (gh pr merge)
- E2E_TEST (via MCP adapter to Chrome DevTools, or direct Playwright)
- MARK_DONE (close issue, gated by e2e-gate extension)

**The workers remain Claude Code sessions.** Pi spawns tmux windows that run `claude --dangerously-skip-permissions`. The orchestrator communicates via tmux `send-keys` and `capture-pane`, exactly like the current Conduit mode.

**Exit criteria:** Complete one full sprint cycle (3-5 stories) with Pi as orchestrator and Claude Code as workers.

### Phase 3: Optimization (Week 5-6)

**Effort:** ~3-4 days. **Risk:** Low-Medium.

1. **Model routing:** Configure the orchestrator to use Haiku for review decisions, Sonnet for orchestration, Opus (via Max) for complex architecture decisions.

2. **Cost tracker extension:** Track tokens per agent, per task, per session. Compare with Claude Code-only baseline.

3. **Roadblock recovery extension:** Auto-detect errors in tool results, search FutureLearnings.md, spawn recovery agents.

4. **Evaluate Pi workers vs Claude Code workers:** Run a few stories with Pi workers (using Claude via API) and compare quality/speed/cost against Claude Code workers (using Max subscription). This determines whether the Max subscription remains valuable.

**Exit criteria:** Cost data showing orchestrator overhead. Quality comparison between Pi and Claude Code workers.

### What NOT to Migrate (Keep on Claude Code)

- **IDE integration workflows** -- When personally coding, Claude Code in VS Code is better
- **Quick one-off tasks** -- "Fix this lint error" does not need the orchestration loop
- **Chrome DevTools MCP** -- Keep as primary E2E testing tool in Claude Code workers until Playwright extension is battle-tested

### Risk/Effort/Reward Summary

| Phase | Effort | Risk | Reward |
|-------|--------|------|--------|
| Phase 0: Coexistence | 1 day | Zero | Familiarization, no commitment |
| Phase 1: Enforcement | 3-4 days | Low | Programmatic rule enforcement (highest value/effort ratio) |
| Phase 2: Orchestrator Loop | 5-7 days | Medium | Full Pi orchestrator with Claude Code workers |
| Phase 3: Optimization | 3-4 days | Low-Medium | Cost optimization, model routing, observability |
| **Total** | **~2-3 weeks** | | |

This is faster than the 8-week estimate in the migration feasibility doc because we are NOT migrating the workers to Pi. The workers stay on Claude Code. We only migrate the orchestrator.

---

## 7. Recommendation

### The Decision: Hybrid Architecture -- Pi Orchestrator + Claude Code Workers

**Do not go 100% Pi.** Do not go 100% Claude Code. Do not consider OpenClaw yet.

The optimal architecture for Burak's current situation is:

**Pi Agent as orchestrator (control plane):**
- L-Thread loop logic
- Rule enforcement via TypeScript hooks
- Multi-model routing for cost optimization
- Cross-project extension library
- State management with dual persistence
- Cost tracking and observability

**Claude Code as workers (execution plane):**
- Actual code writing via Max subscription ($200/mo arbitrage)
- E2E testing via Chrome DevTools MCP (native, no adapter needed)
- IDE integration when personally developing
- Quick one-off tasks outside orchestration loop

**Shell scripts as infrastructure:**
- tmux session management
- cron/LaunchAgents scheduling
- Git operations, state initialization, process cleanup

### Why This Is Better Than IndyDevDan's 80/20 or Elvis Sun's 100% OpenClaw

**IndyDevDan's 80% Pi / 20% Claude Code** is close to correct but misses a nuance: the split should not be by project or by time spent, but by **role**. The orchestrator is 100% Pi. The workers are 100% Claude Code (for now). This is a clean architectural boundary, not a fuzzy percentage.

**Elvis Sun's 100% OpenClaw** is correct for a different use case: always-on personal assistant. OpenClaw is not a coding orchestrator; it is a lifestyle/business automation platform that happens to code. Burak's revenue is from contract coding, not from running a 24/7 assistant. OpenClaw becomes relevant when Burak builds the business automation layer on top of the coding orchestrator.

### Why This Week

1. **Phase 1 (enforcement extensions) takes 3-4 days and has zero downside.** The extensions work alongside Claude Code. If they do not improve reliability, remove them. If they do (they will), proceed to Phase 2.

2. **The Max subscription arbitrage is structurally temporary** (Phase 2 finding #4). When Anthropic reprices, the Claude Code worker advantage shrinks. Having the orchestrator on Pi means you can switch workers to Pi + API or Pi + local models without rebuilding the control plane.

3. **The orchestration layer is the compounding asset** (Phase 2 finding #15). Every extension you build for the Pi orchestrator is reusable across every project, every client, every future product. Claude Code's CLAUDE.md files are project-scoped. Pi extensions are npm packages.

### What to Do Monday

1. `npm install -g @mariozechner/pi-coding-agent`
2. Create `.pi/extensions/orchestrator-discipline.ts` (blocks code writes)
3. Run a test session: try to `Edit` a `.ts` file. Verify block.
4. If it works, proceed with `state-manager.ts` and `e2e-gate.ts`
5. By end of week: Pi orchestrator with enforcement, Claude Code workers, same tmux infrastructure

### The Three-Month View

| Month 1 | Month 2 | Month 3 |
|---------|---------|---------|
| Pi orchestrator + Claude Code workers | Add model routing (Haiku for reviews) | Evaluate Pi workers vs Claude Code workers |
| Enforcement extensions | Cost tracker + observability | Decide Max subscription renewal |
| Same revenue, better reliability | Lower token costs via routing | OpenClaw evaluation for business layer |

The total investment is ~2-3 weeks of part-time work to get the Pi orchestrator running. The enforcement extensions alone justify the migration -- every L-Thread incident would have been prevented by a `tool_call` hook.

---

## Sources

### Pi Agent
- [Pi-Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Pi Coding Agent (npm)](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi Extensions Documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Pi Official Site](https://shittycodingagent.ai/)
- [Pi Packages](https://shittycodingagent.ai/packages)
- [What I Learned Building a Coding Agent -- Mario Zechner](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Pi Agent Revolution (Feb 2026)](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/)
- [Pi-Mono: AI Agent Toolkit with 19K Stars](https://aibit.im/blog/post/pi-mono-ultimate-ai-agent-toolkit-with-19k-stars)
- [Oh-My-Pi Fork](https://github.com/can1357/oh-my-pi)
- [Pi MCP Adapter](https://github.com/nicobailon/pi-mcp-adapter)
- [Pi-Side-Agents](https://github.com/pasky/pi-side-agents)
- [Pi-Subagents](https://github.com/nicobailon/pi-subagents)
- [Pi-Collaborating-Agents](https://github.com/baochunli/pi-collaborating-agents)

### Claude Code
- [Claude Code Official Docs](https://code.claude.com/docs/en)
- [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams)
- [Claude Code Custom Subagents Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code Git Worktree Support](https://supergok.com/claude-code-git-worktree-support/)
- [Claude Code v2.1.41-2.1.63 Platform Shift Analysis](https://www.vibesparking.com/en/blog/ai/claude-code/changelog/2026-03-04-claude-code-2141-2163-multi-agent-platform/)
- [Claude Max Plan Pricing](https://claude.com/pricing/max)
- [Claude Code Pricing Guide](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)
- [Claude Code Agent Teams Guide](https://claudefa.st/blog/guide/agents/agent-teams)
- [Claude Code Agent Teams Best Practices](https://claudefa.st/blog/guide/agents/agent-teams-best-practices)
- [Claude Code Hooks Guide (Feb 2026)](https://smartscope.blog/en/generative-ai/claude/claude-code-hooks-guide/)

### Comparisons
- [Pi vs Claude Code -- IndyDevDan](https://github.com/disler/pi-vs-claude-code)
- [Pi vs Claude Code Feature Comparison](https://github.com/disler/pi-vs-claude-code/blob/main/COMPARISON.md)
- [Pi vs Claude Agent SDK (Agentlas)](https://agentlas.pro/compare/pi-vs-claude-agent-sdk/)
- [Ultimate Guide: OpenClaw vs Claude Cowork vs Claude Code](https://dev.to/tech_croc_f32fbb6ea8ed4/the-ultimate-guide-to-ai-agents-in-2026-openclaw-vs-claude-cowork-vs-claude-code-395h)

### OpenClaw
- [OpenClaw Official Site](https://openclaw.ai/)
- [OpenClaw Wikipedia](https://en.wikipedia.org/wiki/OpenClaw)
- [OpenClaw GitHub Releases](https://github.com/openclaw/openclaw/releases)
- [OpenClaw Pi Integration Architecture](https://docs.openclaw.ai/pi)
- [OpenClaw AGENTS.md](https://github.com/openclaw/openclaw/blob/main/AGENTS.md)
- [OpenClaw Architecture Overview](https://ppaolo.substack.com/p/openclaw-system-architecture-overview)
- [Inside OpenClaw: Under the Hood (DEV.to)](https://dev.to/jiade/inside-openclaw-how-the-worlds-fastest-growing-ai-agent-actually-works-under-the-hood-4p5n)
- [Pi: The Minimal Agent Within OpenClaw -- Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [How to Build a Custom Agent Framework with Pi -- Nader Dabit](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [OpenClaw Skills: Developer's Guide (DigitalOcean)](https://www.digitalocean.com/resources/articles/what-are-openclaw-skills)
- [Awesome OpenClaw Skills (5,400+)](https://github.com/VoltAgent/awesome-openclaw-skills)
- [OpenClaw New Features 2026](https://openclawblog.space/articles/openclaw-new-features-2026)
- [OpenClaw Production Stack (Memory, Cron, $15 VPS)](https://medium.com/@rentierdigital/the-complete-openclaw-architecture-that-actually-scales-memory-cron-jobs-dashboard-and-the-c96e00ab3f35)
