# Corporate Coding Agents

> **Architecture deep-dive into Google Jules and Amp Code (Sourcegraph) -- their multi-agent patterns, isolation models, MCP integration, limitations, and patterns worth stealing for custom harness design.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | research/2026-03-05_corporate-coding-agents-jules-amp.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

Google Jules and Amp Code (Sourcegraph) represent the corporate tier of AI coding agents in 2026 -- cloud-hosted platforms with polished UX, enterprise features, and substantial infrastructure behind them. Both are evaluated for architectural patterns transferable to custom orchestration harnesses rather than as direct adoption candidates, since both constrain multi-agent topology to their fixed architectures.

Jules operates on a Perceive-Plan-Execute-Evaluate loop inside ephemeral Google Cloud VMs (Ubuntu), powered by Gemini 2.5/3 Pro. Its most notable innovation is **critic-augmented generation**: an adversarial reviewer that evaluates all proposed changes against user intent (not just lint rules), triggering iterative replanning until clean. Jules offers four control modes (Start, Review, Interactive Plan, Schedule) and launched MCP server support in February 2026 with Linear, Supabase, and others. However, Jules has no native multi-agent orchestration -- tasks are isolated VMs with no inter-task communication, no shared context, and no hierarchical topology. Multi-agent workflows require API-driven external orchestration.

Amp Code, built by Sourcegraph and spun out as a standalone company, takes a more agent-native approach. It features first-class **subagent parallelization** in a hub-and-spoke pattern: the main agent spawns generic mini-instances for parallel work, each with full tool access but no lateral communication. Dynamic model selection (Sonnet for coding, o3/GPT-5 for heavy lifting, Gemini 3 for review) optimizes cost-quality tradeoffs automatically. The Thread Map visualizes agent relationships as a directed graph. Amp's MCP integration uses **lazy loading via Skills** -- tools load on demand rather than globally, reducing context pollution. The Toolbox system provides a lighter-weight alternative: UNIX-style executables that describe themselves via stdout.

The fundamental advantage of a custom harness over both: full control over agent topology, inter-agent communication, state management, and recovery patterns. Corporate agents excel at single-agent task execution with nice UX but constrain multi-agent orchestration to their fixed patterns.

---

## Key Findings

### Jules Architecture

**Execution model:** Each task runs in a fresh, ephemeral Ubuntu VM on Google Cloud. The VM is created per task and destroyed on completion or failure -- no persistent containers, shared volumes, or long-lived processes. GitHub serves as the state layer; all output flows back as branches, PRs, and diffs.

**Critic-augmented generation:** An adversarial reviewer evaluates all proposed changes at point of generation:
- One-shot evaluation of final output
- Flags subtle bugs, missed edge cases, inefficient code
- Jules replans in real-time based on critic feedback
- Iterative loop continues until clean
- Differentiated from linters: judges against user context and intent, not preset rules
- Planning Critic (January 2026) extends this to auto-approved plans

**Four control modes:** Start (execute immediately), Review (plan + approval), Interactive Plan (tweakable roadmap), Schedule (time-triggered execution). This is a clean UX pattern for orchestrator task modes.

**Jules API:** REST API at `julius.googleapis.com/v1alpha/` supporting session creation, listing, messaging, and plan approval. Authentication via API key. Enables external orchestration -- build your own multi-agent coordinator that delegates tasks to Jules.

**MCP support (February 2026):** Native server connections for Linear, Stitch, Neon, Tinybird, Context7, Supabase. Community MCP servers also emerged, including ones that use Jules as a tool.

### Amp Architecture

**Multi-model routing:** Dynamically selects models based on task complexity. Sonnet (1M token window) as default; o3/GPT-5 for heavy lifting; Gemini 3 for code review and image generation; GPT-5.2 as "the oracle." Unconstrained token usage -- no artificial limits.

**Subagent parallelization:** First-class hub-and-spoke pattern:
- Main agent spawns generic mini-instances with full tool access
- Multiple subagents run simultaneously in parallel
- Context isolation: subagents start fresh, no accumulated context from main thread
- Summary consolidation: main agent receives only final summaries
- **Limitations:** Subagents cannot communicate laterally, cannot be guided mid-task, start without conversation context, and provide only final summaries

**Thread Map:** Visualizes agent activity as a directed graph with nodes (threads) and edges (references/continuations/handoffs). Shows where effort concentrates and overlaps. CLI-only currently.

**MCP integration:** Lazy loading via Skills -- MCP servers load only when a skill is invoked, not globally. `SkillMCPServerSpec` extends base spec with `includeTools` glob patterns for selective tool exposure. Best practice: fewer tools is better -- too many degrades model performance.

**Toolbox system:** Simpler alternative to MCP. A directory of UNIX-style executables that describe themselves via stdout. Lower barrier than full MCP for custom tools.

**SDK:** `@sourcegraph/amp-sdk` (TypeScript) and Python SDK. `execute()` streams messages as agent works, enabling external state tracking. Headless mode for programmatic use.

### Corporate vs. OSS Comparison

| Aspect | Corporate (Jules/Amp) | Custom Harness (L-Thread) |
|--------|----------------------|---------------------------|
| Sandboxing | Cloud VMs (Jules), managed infra | Git worktrees + tmux panes |
| Model access | Built-in multi-model routing | BYO keys, manual selection |
| Scaling | Cloud-native, parallel VMs | Machine-bound |
| Recovery | Ephemeral = clean slate (Jules), thread continuation (Amp) | Tmux persistence + state snapshots |
| Cost | Subscription + caps | Tokens only |
| Customization | API/SDK within boundaries | Full control, any pattern possible |
| Multi-agent topology | Fixed (isolated VMs / hub-spoke) | Hierarchical, lateral, event-driven -- anything |

### Limitations for Custom Orchestration

**Jules:** No native multi-agent orchestration, no inter-task communication, no persistent agent state, daily task caps, GitHub-only integration, no custom agent topology, no real-time steering of long-running tasks.

**Amp:** Subagents cannot communicate laterally, start fresh without context inheritance, main agent gets only summaries, cannot guide subagents mid-task, SDK consumes paid credits only, no hierarchical multi-agent (only hub-spoke with isolated spokes).

---

## Actionable Insights

1. **Implement critic-augmented generation.** Run an adversarial review pass on every agent output before accepting. Judge against user intent, not just lint rules. Implementable as a post-execution validation agent in any harness -- the highest-value pattern to steal from Jules.

2. **Use ephemeral clean-slate execution.** Reset worktrees to a clean state before each agent task. Eliminates stale state bugs. Maps directly to git worktree + tmux pane patterns already in L-Thread.

3. **Add lazy tool loading.** Don't load all MCP tools globally -- define skills that bundle specific tools and load on demand. Reduces context pollution and improves model performance with fewer available tools.

4. **Adopt the Toolbox pattern for custom tools.** UNIX-style executables that describe themselves via stdout are simpler than full MCP servers. Lower barrier for adding orchestrator-specific tools.

5. **Implement dynamic model selection.** Route simple tasks to fast/cheap models (Haiku) and complex tasks to reasoning models (Opus). Amp validates this as a production pattern -- the orchestrator should select models per-agent based on task complexity.

6. **Build a Thread Map equivalent.** Generate a dependency graph of agent tasks from state JSON. Visualize agent relationships, handoffs, and work concentration. Even a CLI-rendered graph would improve orchestrator observability.

7. **Scheduled/proactive agent tasks.** Jules's scheduled tasks and proactive repo scanning are implementable as a cron-like scheduler in the orchestrator. Background analysis agents can populate the orchestrator's backlog with improvement suggestions.

8. **Hub-and-spoke with summary consolidation.** Amp's pattern of main agent receiving only final summaries from subagents is a deliberate context-management strategy. Formalize this in orchestrator state: agents report summaries, orchestrator never ingests raw output.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [orchestration-platforms/openclaw](../orchestration-platforms/openclaw.md) | OpenClaw's Lobster workflows contrast with Jules's ephemeral VM model |
| [orchestration-platforms/paperclip](../orchestration-platforms/paperclip.md) | Paperclip's management plane is runtime-agnostic -- could orchestrate Jules or Amp as agent backends |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town's 7-role hierarchy vs. Jules's flat task isolation and Amp's hub-spoke limitation |
| [reference/harness-comparison-matrix](harness-comparison-matrix.md) | Jules and Amp occupy the "Buy" end of the build-vs-buy spectrum |
| [reference/build-vs-buy-strategy](build-vs-buy-strategy.md) | Strategic framework for when corporate agents vs. custom harnesses are appropriate |
| [agent-harnesses/claude-agent-sdk](../agent-harnesses/claude-agent-sdk.md) | Claude Agent SDK scores highest for programmatic orchestration; Jules/Amp constrain topology |

---

*Source: research/2026-03-05_corporate-coding-agents-jules-amp.md*
