# Pi Agent: Production Orchestration Systems Survey

> **Comprehensive survey of 12+ real-world orchestration systems built on Pi Agent, documenting the five universal architectural primitives, communication patterns, scale limits (1-30+ agents), common failure modes, and the Paperclip management plane.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `2026-03-05_real-world-pi-orchestrators.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

The Pi Agent ecosystem has produced at least twelve distinct orchestration systems in the four months since Pi's extension system stabilized (v0.35.0). Every system converges on the same five architectural primitives: (1) filesystem isolation via git worktrees, (2) tmux as process supervisor, (3) file-based or SQLite-based messaging, (4) hierarchical task decomposition, and (5) eventual consistency through git merge. Systems diverge primarily on communication topology (hub-and-spoke vs peer-to-peer vs chain) and observability depth.

The ecosystem stratifies into three tiers: production orchestrators (Overstory, ComposioHQ, Paperclip), Pi-native extensions (pi-side-agents, pi-collaborating-agents, pi-subagents, pi-messenger, pi-foreground-chains), and adjacent tools (dmux, agtx, multi-agent-workflow-kit). Scale limits are well-documented: 1-3 agents (everything works), 4-10 (file reservation required), 10-30 (dashboard and CI mandatory), 30+ (management plane like Paperclip required). Six failure modes are catalogued with proven solutions from production use.

---

## Key Findings

### Tier 1: Production-Grade Orchestrators

**Overstory (jayminwest)** -- The most architecturally complete orchestrator. Uses SQLite WAL messaging (~1-5ms), 4-tier conflict resolution on merge, tiered watchdog (Tier 0 mechanical, Tier 1 AI-assisted, Tier 2 monitor agent). Runtime-agnostic via `AgentRuntime` interface supporting Claude Code, Pi, and Gemini CLI. Notably, it explicitly warns users: "Agent swarms are not a universal solution."

**ComposioHQ Agent Orchestrator** -- Highest-scale documented system: 30 concurrent agents across 40 worktrees in production. Self-bootstrapping (built itself using agents). Includes automatic CI failure detection, fix routing, and PR review comment routing to responsible agents. The 30-agent threshold represents the practical ceiling where coordination overhead dominates.

**mmeyer/pi-agent-example** -- Enterprise-grade monorepo with 40+ skills, 30+ extensions, 20+ specialized subagents. Demonstrates Pi's extensibility ceiling: what a fully batteries-included Pi installation looks like.

### Tier 2: Pi-Native Extensions

| Extension | Pattern | Key Feature |
|-----------|---------|-------------|
| pi-side-agents (pasky) | Hub-and-spoke, tmux | Worktree reuse avoids disk explosion; model override per agent |
| pi-collaborating-agents (baochunli) | Peer-to-peer messaging | File reservation via edit/write tool hooks; blocked writes show who holds the reservation |
| pi-subagents (nicobailon) | Chain orchestration | Depth guards (max 2 levels) prevent recursive spawning; chains via arrow syntax |
| pi-messenger (nicobailon) | Chat-room style | Closest Pi equivalent to Claude Code Teams; file-based, no daemon |
| pi-foreground-chains (nicobailon) | Observable chains | Only system prioritizing user observability over autonomy |

### Five Universal Architectural Primitives

Alex Lavaee documented that two independent teams (Cursor and Anthropic) converged on the same five primitives without coordinating. The Pi ecosystem independently converged on the same set:

1. **Hierarchical task decomposition** -- Orchestrator decomposes, assigns, reviews, merges. Never writes code. Flat peer structures were tried and abandoned (agents held locks too long, forgot to release them).

2. **Filesystem isolation via git worktrees** -- The only mechanism providing full independence, automatic branching, merge infrastructure, and cost-effective isolation (shared `.git`). Known limitation: LSP does not work in worktrees.

3. **tmux as process supervisor** -- Session persistence, named windows, `capture-pane` for reading output, `send-keys` for injecting instructions. Validates L-Thread's existing tmux approach.

4. **Eventual consistency via git merge** -- Cursor: "Sometimes multiple agents touch the same file... we accept some moments of turbulence and let the system naturally converge." File reservation reduces but does not eliminate conflicts.

5. **Structured communication contracts** -- "Most multi-agent workflow failures come down to missing structure, not model capability" (GitHub blog). Typed protocols, chain definitions, and named artifacts (context.md, plan.md, impl.md).

### Communication Methods

| Method | Used By | Latency | Notes |
|--------|---------|---------|-------|
| SQLite WAL | Overstory | 1-5ms | ACID, no torn reads |
| JSONL files | pi-collaborating-agents, pi-messenger | 5-20ms | No ACID, crash risk mid-write |
| tmux capture-pane | pi-side-agents, L-Thread | 10-50ms | Buffer overflow risk |
| Named files | pi-foreground-chains | Filesystem-bound | Highest durability |
| Pi sendMessage steer | pi-messenger | Immediate | In-process injection |

**Dominant pattern: file-based messaging.** No Pi orchestrator uses sockets, HTTP, or network protocols. File-based survives crashes, requires no daemons, works within single machine.

### Scale Limits

| Agents | What Happens | Best Approach |
|--------|-------------|---------------|
| 1-3 | Everything works | pi-side-agents or manual tmux |
| 4-10 | File conflicts emerge; 17x error trap begins | pi-collaborating-agents with file reservation, or Overstory |
| 10-30 | Dashboard required; manual review impossible | ComposioHQ or Paperclip management plane |
| 30+ | Orchestrator hits context limits | Management plane mandatory; orchestrator is an org structure, not a single agent |

Disk concern: automatic worktree creation consumed 9.82 GB in 20 minutes with a ~2 GB codebase.

### Six Common Failure Modes

| Failure | Symptom | Proven Solution |
|---------|---------|-----------------|
| Silent edit conflicts | PRs merge but codebase broken (function signature changed) | File reservation (pi-collaborating-agents), 4-tier merge (Overstory), CI after each merge |
| Recursive agent spawning | Tree grows until context/tmux overflow | Depth guard (pi-subagents: max 2 levels), plan mode disabling child spawning (oh-my-pi) |
| Dead worker holds lock | Agent crashes while holding reservation; others blocked | Lease-based locking with heartbeat expiry (Paperclip), worktree reuse (pi-side-agents) |
| Context window overflow | Orchestrator loses track of concurrent tasks | Tiered context injection, compaction-aware state, external JSON files |
| Cost amplification | 10 agents cost 10x but deliver < 10x output | Model routing (Haiku for simple tasks), budgets (Paperclip), task deduplication |
| Observability gap | Subagents run with zero visibility | Observable overlays (pi-foreground-chains), observability folders (pi-subagents), tiered watchdog (Overstory) |

### Paperclip: Management Plane Above Pi

Paperclip (paperclipai/paperclip, open-sourced February 2026 by dotta) operates at a different abstraction level. It is a management plane for autonomous companies where workers happen to be AI agents. Key architectural patterns:

- **Heartbeat execution** -- Agents run in short windows triggered by wakeup, not continuously. New wakeups coalesce.
- **Runtime agnostic** -- Agents can be Claude Code, Pi, Gemini CLI, Python scripts, HTTP webhooks.
- **Atomic task checkout** -- No double-work, no runaway spend.
- **Budget enforcement** -- Monthly per-agent budgets, auto-pause at 100%, soft warning at 80%.
- **Goal ancestry** -- Tasks carry full "why" chain so agents never lose sight of the objective.
- **Multi-company isolation** -- Complete data isolation and separate audit trails.

Paperclip does not replace Pi -- it wraps it. A deployment might have 10 agent slots, each running Pi. Paperclip handles organizational concerns while Pi handles coding.

---

## Actionable Insights

1. **Adopt file reservation immediately.** Silent edit conflicts are the most common failure mode. pi-collaborating-agents' tool hook approach (blocking write/edit on reserved files) prevents the entire class of problems.

2. **Implement depth guards.** Without them, recursive agent spawning is a realistic failure mode. pi-subagents' max-2-level default is the right starting point.

3. **Build compaction-aware state.** Use `session_before_compact` to preserve orchestration state. OpenClaw's multi-stage compaction pipeline is the reference implementation. Without this, the orchestrator loses its place.

4. **Plan for Paperclip at 10+ agents.** The orchestrator agent itself will hit context limits tracking more than 10 concurrent tasks. Paperclip's management plane (heartbeat execution, atomic checkout, budgets) becomes necessary.

5. **L-Thread tool mapping to pi-side-agents is clean.** `conduit pane-split` -> `agent-start`, `terminal-write` -> `agent-send`, `terminal-read` -> `agent-check`, `terminal-wait` -> `agent-wait-any`. The worktree isolation is something L-Thread currently lacks.

6. **File-based communication is the consensus.** No production system uses sockets, HTTP, or daemons. The 50-100ms latency is irrelevant on 10-30 second agent cycles. Durability and debuggability matter more.

7. **LSP in worktrees remains unsolved.** oh-my-pi's built-in LSP support may help, but worktree + LSP integration is a known gap across the entire ecosystem.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Runtime foundation all surveyed systems build on |
| [agent-harnesses/oh-my-pi.md](../agent-harnesses/oh-my-pi.md) | Alternative path with in-process subagents and LSP |
| [orchestration-platforms/paperclip.md](../orchestration-platforms/paperclip.md) | Management plane for scaling beyond 10 agents |
| [reference/pi-orchestrator-blueprint.md](pi-orchestrator-blueprint.md) | Blueprint that adopts patterns validated by these production systems |
| [reference/pi-extensions-map.md](pi-extensions-map.md) | Full extension map including all Tier 2 extensions surveyed here |
| [reference/harness-comparison-matrix.md](harness-comparison-matrix.md) | Quantitative scores for Pi vs other harnesses |
| [practitioners/mario-zechner.md](../practitioners/mario-zechner.md) | Pi creator whose no-subagents philosophy drove community building |

---

## Burak's Notes

<!-- Add decision notes, updates, or re-evaluations here -->

---

*Reference entry generated from research doc dated 2026-03-05.*
