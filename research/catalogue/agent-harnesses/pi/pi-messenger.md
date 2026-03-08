# Pi-Messenger

> **Multi-agent communication extension for Pi coding agent — file-based coordination with zero infrastructure, steering injection for real-time message delivery, and a Crew orchestration engine for PRD-to-implementation workflows.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [nicobailon/pi-messenger](https://github.com/nicobailon/pi-messenger) |
| GitHub Stars | 359 (as of 2026-03-08) |
| Publisher | Nico Bailon (nicopreme) — solo |
| License | MIT |
| Tech Stack | TypeScript (Pi extension), filesystem-based IPC, JSONL streaming, jiti (zero-build TS) |
| Maturity | 🟡 Early (active development, Pi ecosystem) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *(empty)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Demonstrates proven file-based multi-agent coordination patterns (wave execution, dependency graphs, model tiering) that validate our architecture principles, but locked to Pi Agent — not usable with Claude Code. |
| **Novelty** | 7/10 | Steering injection (messages interrupt agent flow instead of polling), wave-based parallelism from dependency graphs, configurable coordination levels with message budgets, and token-efficient on-demand skill loading are all patterns not seen elsewhere. |
| **Actionable** | 3/10 | Pi Agent lock-in means nothing is directly usable today. Patterns are study material for when/if we migrate to Pi at Phase 3+. |

---

## Overview

Pi-messenger is a multi-agent communication extension for the Pi coding agent created by Nico Bailon. It answers the question: *what if multiple agents in different terminals sharing a folder could talk to each other like they're in a chat room?* The answer is a zero-infrastructure coordination layer that uses the filesystem as its only communication medium — no daemon, no server, no database, just files.

The extension registers into Pi's lifecycle hooks (`session_start`, `session_shutdown`, `tool_call`, `tool_result`, `agent_end`) to provide automatic agent registration, activity tracking, file reservation enforcement, and autonomous task execution. Communication state is split between a global shared directory (`~/.pi/agent/messenger/`) for cross-project agent discovery and a project-scoped directory (`.pi/messenger/`) for task orchestration data.

The most sophisticated feature is **Crew** — a complete task orchestration engine that converts a PRD into a dependency graph of tasks, then executes them in parallel waves using spawned `pi --mode json` subprocesses with distinct planner/worker/reviewer roles and configurable model tiers (Opus for planning/review, Haiku for workers).

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Pi-Messenger Extension              │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Messaging │  │  File    │  │   Crew Engine     │  │
│  │  Layer    │  │ Reserve  │  │                   │  │
│  │          │  │  Layer   │  │ Planner → Workers │  │
│  │ DM/Bcast │  │ block:   │  │    → Reviewer     │  │
│  │ Steering │  │  true    │  │ (wave execution)  │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                                                      │
│  Hooks: session_start | tool_call | tool_result |    │
│         session_shutdown | agent_end                 │
└──────────────────────────┬───────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
  ~/.pi/agent/messenger/          .pi/messenger/
  (Global: registry,              (Project: activity feed,
   inboxes, swarm claims)         crew data, skills)
```

**Communication Protocol:**
- **Agent Identity:** Themed names (SwiftRaven, LunarDust) from configurable word lists, auto-registered on join
- **Message Delivery:** Two-stage — file write to inbox, then `pi.sendMessage()` with `triggerTurn: true` + `deliverAs: "steer"` (steering injection)
- **Presence:** Auto-derived status (active/idle/away/stuck) from tool_call activity tracking
- **File Reservations:** `{ block: true }` returned from `tool_call` hook — blocks write/edit operations *before* they execute
- **Failure Detection:** PID-based dead agent cleanup + 15-minute stuck threshold with peer notification

**Crew Engine (3 phases):**

| Phase | Agent | Default Model | Function |
|-------|-------|---------------|----------|
| Plan | crew-planner | claude-opus-4-6 | PRD analysis, dependency graph generation, reviewer feedback loop |
| Work | crew-worker | claude-haiku-4-5 | Parallel wave execution of ready tasks (max 10 workers) |
| Review | crew-reviewer | claude-opus-4-6 | SHIP / NEEDS_WORK / MAJOR_RETHINK verdicts (max 3 iterations) |

**Configuration:** Per-role models, concurrency (default 2, max 10), coordination levels (none/minimal/moderate/chatty with message budget caps), dependency modes (advisory/strict), safety bounds (maxAttemptsPerTask: 5, maxWaves: 50).

---

## Publisher Background

Nico Bailon (nicopreme) is a solo developer active in the Pi coding agent community ("Shitty Coders Club" Discord). Pi-messenger is his primary open-source project, listed on the Pi packages marketplace. He has also published pi-interview-tool, pi-powerline-footer, and pi-mcp-adapter. The extension was inspired by mcp_agent_mail (by Dicklesworthstone), credited in the repository. A complementary extension, pi-messenger-bridge (by tintinweb), extends the communication mesh to external messengers (Telegram, WhatsApp, Slack, Discord).

---

## What's Valuable for Us

1. **Steering Injection Pattern:** Messages injected via `deliverAs: "steer"` interrupt the agent's reasoning flow in real-time rather than sitting in a queue. This is a fundamentally different approach to inter-agent communication that eliminates polling overhead. Worth studying for any future Pi-based orchestration.

2. **Wave-Based Parallelism from Dependency Graphs:** The planner structures tasks to maximize parallelism — independent tasks run in parallel waves, dependent tasks unblock automatically. This validates our roadmap assumption that LLM-powered task decomposition can produce efficient parallel execution plans.

3. **Token-Efficient Skill Loading:** Zero tokens spent on domain knowledge until a worker needs it. The planner sees a compact skill index and tags tasks; workers load full skill content on demand. A concrete implementation of context-window management we should study.

4. **Configurable Coordination Levels:** The `none`/`minimal`/`moderate`/`chatty` spectrum with message budget caps (0/2/5/10 messages per task) is a practical solution to the coordination overhead problem documented in the DeepMind paper (exponent 1.724).

5. **Model Tiering for Cost:** Opus for planning/review, Haiku for implementation. A proven pattern for keeping multi-agent token costs manageable.

6. **File Reservation with Pre-Execution Blocking:** Reservations are enforced *before* tool calls execute via the `tool_call` hook returning `{ block: true }`. This prevents merge conflicts at the source rather than detecting them after the fact.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Pi Agent lock-in** | Deeply integrated with Pi's extension API (`pi.on()`, `pi.sendMessage()`, `ctx.ui.custom()`). Cannot be used with Claude Code, Cursor, or any other agent platform without a complete rewrite. |
| **Single-machine filesystem assumption** | All coordinating agents must share `~/.pi/agent/messenger/`. No distributed/multi-machine support. Our architecture may need cross-machine coordination. |
| **No persistent message history** | Unlike mcp_agent_mail's Git+SQLite backing, inbox files are transient. No searchable conversation history across sessions. Our orchestrator requires persistent state. |
| **No E2E testing integration** | Review phase checks implementation quality but does not integrate with testing frameworks or browser automation. Violates our Rule #2 (E2E testing is gate). |
| **No structured event protocol** | Activity feed and JSONL streaming are observability features, not a formal event protocol. No standardized state transition subscriptions. |
| **PID-based crash detection is best-effort** | PID recycling can cause false negatives. 15-minute stuck threshold may be too slow for time-sensitive orchestration. |

---

## Future Use Cases

- **Phase 1–2 (Days 1–60):** Not applicable. Stay with Claude Code. Study pi-messenger's patterns (steering injection, wave execution, skill loading) as architectural reference material.
- **Phase 3 (Days 60–90):** If Pi Agent evaluation proceeds, pi-messenger becomes the natural communication backbone. Test Crew's wave execution against our tmux-based agent spawning for a non-critical workflow.
- **Phase 4 (Days 90+):** If Pi migration succeeds, adopt Crew as the worker management layer. Extend reviewer agent to include E2E testing (Chrome DevTools MCP). Build `orchestrator-state.json` synchronization adapter. Use Swarm mode as lightweight coordination for pre-planned tasks.

---

## Key Takeaway

> **Pi-messenger is the most complete file-based multi-agent coordination system in the coding agent ecosystem — its steering injection, wave-based Crew engine, and on-demand skill loading are genuinely novel patterns worth studying, but its hard lock-in to Pi Agent means it is only actionable if and when we migrate from Claude Code at Phase 3+.**
