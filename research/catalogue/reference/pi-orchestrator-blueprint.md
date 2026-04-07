# Pi Orchestrator Architecture Blueprint & Implementation Roadmap

> **Complete 8-layer extension stack and 8-week implementation plan for migrating L-Thread Orchestrator to Pi Agent with programmatic rule enforcement, model routing, and composable multi-agent orchestration.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `2026-03-05_pi-orchestrator-architecture-blueprint.md`, `2026-03-05_pi-orchestrator-implementation-roadmap.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

This consolidated reference covers both the target architecture and the concrete implementation roadmap for building a production orchestrator on Pi Agent. The architecture places Pi Agent at the core, wrapped by a disciplined extension stack that preserves every L-Thread orchestrator guarantee (4 Absolute Rules, E2E gate, tiered context, state persistence) while gaining model agnosticism, composable extensions, and native sub-agent support.

The implementation roadmap spans 8 weeks across three phases: Foundation (weeks 1-2, single-agent discipline enforcement), Multi-Agent Orchestration (weeks 3-5, full orchestration loop with parallel agents), and Migration & Polish (weeks 6-8, project migration, dashboard, packaging). Total estimated effort is ~1,980 lines of TypeScript across 6 extensions, plus ~2,000 lines from community extensions (pi-subagents, pi-messenger, pi-mcp-adapter), for a ~4,000 line system.

The fundamental tradeoff: L-Thread is 0 lines of code (pure prompt engineering) with ~800 lines of shell scripts. The Pi migration adds 4x code but delivers programmatic rule enforcement (cannot be bypassed by LLM), model flexibility across 300+ providers, cost visibility per agent/task, and extension composability across all projects.

---

## Key Findings

### 8-Layer Architecture Stack

The target architecture consists of eight layers:

1. **orchestrator-discipline** (P0) -- `tool_call` hooks enforcing the 4 Absolute Rules: blocks code writes by orchestrator, blocks issue-close without E2E verdict, bounds review cycles to 3, reads AUTO_MODE flag
2. **orchestrator-state** (P0) -- Hybrid persistence via `_bmad/orchestrator-state.json` (external tools can read) + `pi.appendEntry()` (survives compaction). JSON for snapshots, JSONL for append-only decision logs
3. **orchestrator-agents** (P0) -- Agent lifecycle via pi-subagents with YAML frontmatter definitions per role. Worktree isolation native to Pi
4. **orchestrator-loop** (P1) -- Automated cycle: GET_NEXT_TASK -> SPAWN_AGENT -> WAIT -> REVIEW -> MERGE -> E2E_TEST -> MARK_DONE -> LOG -> CONTINUE
5. **orchestrator-health** (P1) -- Three-tier monitoring: Tier 0 mechanical (heartbeat/tmux liveness), Tier 1 AI-assisted triage, Tier 2 monitor agent fleet patrol
6. **orchestrator-dashboard** (P2) -- TUI widget via `pi.registerComponent()` showing agent grid, cost tracker, context budget, decision log
7. **orchestrator-devlog** (P2) -- Automatic devlog on `agent_end` and session summary on `session_shutdown`
8. **MCP integration layer** -- Chrome DevTools via pi-mcp-adapter (~200 tokens vs 18K+ for raw MCP). Notion and shadcn lazy-loaded per agent

### Model Routing Table

| Role | Model | Rationale |
|------|-------|-----------|
| Orchestrator | Claude Opus 4 | Best reasoning for planning and judgment |
| Coder | Claude Sonnet 4.5 | Best code quality-to-cost ratio |
| Reviewer | Claude Opus 4 | Deep correctness and architecture analysis |
| E2E Tester | Claude Haiku 3.5 | Formulaic test scripts, speed over reasoning |
| Lint Fixer | Claude Haiku 3.5 / MorphLLM | Mechanical repetitive fixes |
| Researcher | Gemini 2.5 Pro | 1M token context for large codebases |

Dynamic escalation: Haiku -> Sonnet -> Opus on failure, logged with cost delta.

### Community Extensions Adopted

| Extension | Role | Install |
|-----------|------|---------|
| pi-subagents | Async subagent delegation with chains | `pi install npm:pi-subagents` |
| pi-messenger | Agent-to-agent communication backbone (Teams mode) | `pi install npm:pi-messenger` |
| pi-mcp-adapter | Token-efficient MCP bridge | `pi install npm:pi-mcp-adapter` |

### Key Architecture Decisions

- **Composable extensions over monolith** -- 5-6 focused extensions, each independently installable/updatable
- **pi-messenger over custom broker** -- File-based messaging at 50-100ms latency (irrelevant on 10-30s agent cycles), no daemon required
- **Pi SDK subagents over tmux** -- In-process spawning as primary, tmux retained for debugging and crash recovery
- **JSON + JSONL + appendEntry** -- Hybrid state matching L-Thread schema with zero migration needed
- **SQLite deferred** -- Not needed below 10 concurrent agents

### Implementation Line Counts

| Component | Lines | Time |
|-----------|-------|------|
| orchestrator-discipline.ts | ~180 | 2 days |
| orchestrator-state.ts | ~220 | 2 days |
| orchestrator-loop.ts | ~400 | 5 days |
| orchestrator-health.ts | ~150 | 2 days |
| orchestrator-dashboard.ts | ~200 | 2 days |
| orchestrator-devlog.ts | ~80 | 1 day |
| Agent definitions (6 files) | ~300 | 1 day |
| Config + chains + skills | ~330 | 2 days |
| **Total** | **~1,980** | **~17 days** |

### What NOT to Build (Anti-Patterns)

| Anti-Pattern | Alternative |
|-------------|-------------|
| Custom message broker (Redis, NATS) | pi-messenger file-based |
| Custom model routing service | Pi native 300+ model routing |
| Fork Pi Agent | Extensions only; contribute upstream |
| Cross-machine orchestration | Local-first; evaluate Overstory later |
| Vector database for memory | JSONL decision log + FutureLearnings skill |
| Recursive agent monitoring | Single orchestrator monitors all |
| Consensus protocols | Orchestrator decides, agents execute |
| Full A2A protocol | AGENTS.md for discovery; file-based messaging |

---

## Actionable Insights

1. **Start with discipline-only (Phase 1)** -- orchestrator-discipline + orchestrator-state deliver immediate value without multi-agent complexity. An operator can run Pi with just enforcement and get programmatic rule enforcement on day 5.

2. **The 4 Absolute Rules become uncheckable hooks** -- `tool_call` interception fires before every tool execution. Unlike prompt text, the LLM cannot bypass it regardless of context length, compaction, or prompt injection.

3. **Parallel running strategy** -- Weeks 1-2: both systems available, Pi runs enforcement only. Weeks 3-5: Pi orchestrates one project, CC handles rest. Weeks 6-8: all on Pi, CC as fallback.

4. **Compaction is the critical risk** -- Use `session_before_compact` to preserve orchestration state. Without it, the orchestrator loses task assignments and review counters after compaction.

5. **Success metric: 100% programmatic enforcement** -- Zero incidents where the orchestrator writes code, closes issues without E2E, or exceeds review bounds. Measurable via decision log audit.

6. **Target 30% cost reduction** via model routing (Haiku for simple, Opus only when needed) and 2x throughput via parallel execution of independent tasks.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Pi Agent is the runtime foundation this blueprint builds on |
| [agent-harnesses/oh-my-pi.md](../agent-harnesses/oh-my-pi.md) | Alternative runtime with built-in subagents; fallback if Pi SDK proves unstable |
| [practitioners/mario-zechner.md](../practitioners/mario-zechner.md) | Pi creator whose minimalism philosophy shapes extension-only approach |
| [reference/pi-extensions-map.md](pi-extensions-map.md) | Complete map of community extensions adopted or evaluated here |
| [reference/pi-future-direction.md](pi-future-direction.md) | Risk assessment for building on Pi long-term |
| [reference/pi-production-systems.md](pi-production-systems.md) | Real-world orchestrators validating patterns used in this blueprint |
| [orchestration-platforms/paperclip.md](../orchestration-platforms/paperclip.md) | Management plane for scaling beyond 10 agents |

---

## Burak's Notes

<!-- Add decision notes, updates, or re-evaluations here -->

---

*Reference entry consolidated from two research docs dated 2026-03-05.*
