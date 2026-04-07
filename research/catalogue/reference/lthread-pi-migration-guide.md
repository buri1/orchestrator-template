# L-Thread to Pi Migration Guide

> **Full feasibility assessment for migrating the L-Thread Orchestrator from Claude Code to Pi Agent: 16/16 patterns mappable, 0 blockers, progressive 3-phase migration path with ~2,300 lines of TypeScript extensions.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_lthread-to-pi-migration-feasibility.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

Migration from L-Thread Orchestrator (Claude Code, pure prompt engineering) to Pi Agent is feasible but non-trivial. Every L-Thread pattern can be replicated in Pi, but the effort shifts from prompt engineering (0 lines of code) to TypeScript extension development (~2,000-4,000 lines across 6-8 extensions). The payoff is substantial: programmatic rule enforcement via hooks (strictly superior to prompt-only enforcement), multi-model routing for cost optimization, composable extensions across all projects via npm, version pinning (no surprise updates), and independence from Claude Code's release cycle.

The critical risk is the MCP gap -- Pi deliberately excludes native MCP, and the Chrome DevTools MCP dependency for E2E testing (INC-014, INC-015) requires either the pi-mcp-adapter or a custom Playwright extension. Three community sub-agent extensions (pi-side-agents, pi-collaborating-agents, pi-subagents) map directly to L-Thread's Conduit, Teams, and Chain modes.

The recommended approach is progressive migration: run both systems in parallel during a 3-phase transition over ~8 weeks part-time. Start with enforcement extensions (low risk, high value), then tackle sub-agent orchestration, and finally migrate the E2E testing pipeline.

---

## Key Findings

### Pattern-by-Pattern Mapping (16/16 Feasible)

| L-Thread Pattern | Pi Equivalent | Effort |
|-----------------|---------------|--------|
| Orchestrator persona | `AGENTS.md` + system prompt + extension hooks | Low |
| Conduit Mode (tmux) | `pi-side-agents` extension | Medium |
| Teams Mode (Task/SendMessage) | `pi-collaborating-agents` extension | High |
| Tmux crash recovery | Native tmux (Pi runs in terminal) | Low |
| SessionStart hook | `session_start` event in extension | Low |
| PreCompact hook | `session_before_compact` event | Low |
| State files (JSON) | `pi.appendEntry()` + external JSON (hybrid) | Low |
| FutureLearnings (INC-XXX) | Skill (`SKILL.md`) with auto-load on error | Low |
| Tiered Context (T0/T1/T2) | `before_agent_start` + `context` events | Medium |
| E2E Testing Gate | pi-mcp-adapter OR Playwright extension | High |
| AUTO-MODE | Extension flag + `input` event suppression | Low |
| Bounded review loops | Extension counter with `tool_call` hook | Low |
| Mode detection | Extension auto-detects sub-agent backend | Low |
| Devlog | Extension with `turn_end` / `agent_end` hooks | Low |
| Process cleanup | `session_shutdown` hook + cleanup | Low |
| Overseer agent | Dedicated Pi session with monitoring extension | Low |

### The MCP Problem (3 Solutions)

**Solution A -- pi-mcp-adapter (Recommended for immediate migration):** Bridges MCP into Pi with ~200 token proxy tool. Lazy server connections, supports stdio/HTTP transports, Chrome DevTools works via stdio. Minimal code change, reuses existing MCP servers.

**Solution B -- Custom Playwright Extension (Long-term target):** Wraps Playwright directly, no MCP middleman. Faster (no server startup), full control, works offline. More code to write (~300 lines) but eliminates MCP indirection layer.

**Solution C -- CLI Skill Wrapper:** Zero-code approach using Pi's skill system to wrap existing Playwright CLI. Less integrated, agent must interpret CLI output, no inline screenshots.

### Sub-Agent Mapping

| L-Thread Mode | Pi Extension | Architecture Match |
|--------------|-------------|-------------------|
| Conduit (sequential) | pi-side-agents | High -- both use tmux; Pi adds filesystem isolation via git worktrees |
| Teams (parallel) | pi-collaborating-agents | Medium-High -- file-based JSONL inboxes vs in-memory routing; includes file reservation system |
| Chain patterns | pi-subagents | Exceeds current L-Thread -- codified workflow chains via `.chain.md` files |

**Recommended hybrid approach:** Install pi-side-agents for tmux orchestration + pi-collaborating-agents for messaging + thin custom wrapper (~200-400 lines) for L-Thread-specific orchestration loop.

### Rule Enforcement: Hooks vs Prompts

Pi's `tool_call` hook can **programmatically block** code-writing attempts -- the model cannot bypass it regardless of context length, compaction, or prompt injection. This is categorically more reliable than L-Thread's prompt-only "DU BIST KEIN ENTWICKLER" instruction.

| Rule | L-Thread (Prompt) | Pi (Hook) |
|------|-------------------|-----------|
| No code writing | Model must "remember" | Programmatic block, cannot bypass |
| E2E gate | Prompt instruction | Tool call blocked until E2E passes |
| Review bounds | Prompt counter | Extension counter, hard block at limit |
| AUTO-MODE | File check in prompt | Extension reads file, suppresses user prompts |

Every L-Thread incident (INC-014, INC-015) would have been prevented by a Pi extension hook.

### State Migration

Both systems can read the same `_bmad/*.json` state files. Recommended hybrid: use `pi.appendEntry()` for session-scoped state (survives compaction, navigable via `/tree`) AND external JSON files for cross-session state (readable by tmux helpers, monitoring scripts). No data migration needed -- JSON format is identical.

### Extensions to Build (~2,300 Lines Total)

| Extension | Lines | Priority | Purpose |
|-----------|-------|----------|---------|
| orchestrator-discipline | 150 | P0 | No-code rule enforcement (block Edit/Write on code files) |
| state-manager | 200 | P0 | Dual persistence (appendEntry + JSON), session hooks |
| e2e-testing | 300 | P0 | E2E gate with Chrome DevTools MCP or Playwright |
| orchestrator-loop | 500 | P1 | Main GET_NEXT -> SPAWN -> REVIEW -> MERGE -> E2E -> DONE loop |
| roadblock-recovery | 200 | P1 | FutureLearnings lookup + recovery agent spawning |
| tiered-context | 150 | P2 | Dynamic context injection by tier |
| devlog | 100 | P2 | Automatic devlog generation on task completion |
| cost-tracker | 100 | P3 | Token/cost tracking per agent/task/session |

### Progressive Migration Path

**Phase 0 (Day 1):** Coexistence setup. `.claude/` and `.pi/` do not conflict. Both read `_bmad/*.json` state files.

**Phase 1 (Weeks 1-2):** Build enforcement extensions (P0). Pi running alongside Claude Code with programmatic rule enforcement and E2E testing.

**Phase 2 (Weeks 3-5):** Install community sub-agent extensions. Build orchestrator loop and roadblock recovery. Full L-Thread loop running in Pi on one project.

**Phase 3 (Weeks 6-8):** Migrate all projects. Build Playwright extension (replace MCP adapter). Package as pi-package for sharing.

### Risk Assessment

**High:** Chrome DevTools MCP instability via adapter (mitigate: Playwright fallback), sub-agent extension immaturity (mitigate: use simple tmux model first), Pi breaking changes (mitigate: pin version).

**Medium:** Context window differences across models, extension loading order conflicts, loss of Claude Code IDE integration.

**Low:** State file format (identical JSON), tmux handling (identical), model quality (use Claude via Pi initially).

### Pi-Mono vs Oh-My-Pi Decision

| Choose Pi-Mono When | Choose Oh-My-Pi When |
|---------------------|---------------------|
| Maximum control wanted | Batteries-included sub-agents needed |
| Stable, minimal releases preferred | Native MCP without adapter needed |
| Community extension compatibility required | LSP integration needed |
| Fork risk must be minimized | Minimizing custom code is priority |

If oh-my-pi is chosen, extension estimate drops from ~2,300 to ~1,200 lines (no sub-agent glue or MCP adapter config needed).

---

## Actionable Insights

1. **Start with enforcement extensions (Phase 1)** -- they work standalone and provide immediate value regardless of whether full orchestration is migrated. If they prove value in Week 1, the rest justifies itself.

2. **Do not big-bang migrate.** Run both systems in parallel. Start with one low-risk project on Pi, expand as confidence grows.

3. **Keep `_bmad/*.json` as shared state format.** Both Claude Code and Pi can read/write these files, enabling gradual migration with the Overseer agent monitoring both systems.

4. **The prompt engineering work is not wasted.** The orchestrator persona description migrates directly to Pi's `AGENTS.md`. But now the rules are also backed by programmatic hooks.

5. **Use pi-side-agents first** (maps to Conduit + Tmux modes), then add pi-collaborating-agents for Teams mode. The hybrid approach with a thin wrapper (~200-400 lines) minimizes custom code while preserving L-Thread-specific orchestration patterns.

6. **Pin Pi version.** Claude Code auto-updates and has historically broken CLAUDE.md parsing, hook behavior, and Teams API. Pi with version pinning provides stability.

7. **The Overseer pattern becomes trivial in Pi.** Instead of a separate tmux session monitoring via `capture-pane`, it becomes an extension with `turn_end` hooks -- no separate session needed.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Target platform for migration |
| [agent-harnesses/pi-subagents.md](../agent-harnesses/pi-subagents.md) | Community extension for chain orchestration patterns |
| [agent-harnesses/pi-messenger.md](../agent-harnesses/pi-messenger.md) | Alternative inter-agent messaging for Teams mode |
| [agent-harnesses/oh-my-pi.md](../agent-harnesses/oh-my-pi.md) | Alternative fork that reduces migration effort |
| [reference/pi-agent-architecture-reference.md](pi-agent-architecture-reference.md) | Architectural philosophy motivating migration |
| [reference/pi-sdk-internals.md](pi-sdk-internals.md) | SDK interfaces used by migration extensions |
| [reference/pi-mcp-adapter.md](pi-mcp-adapter.md) | MCP bridge solving the E2E testing gap |
| [reference/agent-automation-deployment.md](agent-automation-deployment.md) | Deployment strategies for migrated orchestrator |
