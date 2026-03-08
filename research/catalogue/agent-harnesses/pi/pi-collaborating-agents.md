# pi-collaborating-agents

> **Multi-agent collaboration framework for Pi with agent-to-agent messaging, file reservations to prevent concurrent edit conflicts, and hierarchical subagent spawning.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [baochunli/pi-collaborating-agents](https://github.com/baochunli/pi-collaborating-agents) |
| GitHub Stars | 1 (as of 2026-03-08) |
| Publisher | baochunli (community contributor, solo) |
| License | MIT |
| Tech Stack | TypeScript, Bun runtime, Pi extension system |
| Maturity | 🟡 Early (22 commits, low adoption) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | File reservation system directly addresses a real problem in multi-agent coding: concurrent edits to the same file. The messaging system is simpler than pi-messenger but the reservation mechanism is unique and valuable. |
| **Novelty** | 7/10 | File reservation with tool-level blocking is a genuinely novel pattern we haven't seen elsewhere. When an agent tries to edit a reserved file, the edit tool itself is intercepted and blocked — deterministic conflict prevention at the tool layer. |
| **Actionable** | 5/10 | Low star count (1) raises adoption risk. The file reservation pattern is worth studying and potentially adapting, but the extension itself is too early-stage to depend on directly. |

---

## Overview

pi-collaborating-agents enables multiple Pi agent instances to coordinate through three mechanisms: messaging, file reservations, and hierarchical subagent spawning. The key innovation is **file reservation enforcement at the tool level** — when Agent A reserves a file, Agent B's `edit` and `write` tool calls are physically blocked by hooking Pi's tool execution pipeline. The blocked agent sees who reserved the file, why, and a suggestion to coordinate via messaging.

All sessions auto-register immediately when they start, so any new Pi session is automatically part of the collaboration system. Agents communicate via an append-only message log with support for direct messages (`@AgentName`), broadcasts (`@all`), and urgent interrupts. The system stores state in `~/.pi/agent/collaborating-agents/` with per-agent inboxes and a global message log.

The extension also supports spawning specialized subagent types defined via TOML configuration files (scout, documenter, reviewer) with distinct system prompts and reasoning levels, enabling hierarchical task decomposition.

---

## Technical Architecture

```
~/.pi/agent/collaborating-agents/
    ├── registry.json           (auto-registered agent sessions)
    ├── message-log.jsonl       (append-only global message log)
    ├── inboxes/
    │   ├── agent-1.jsonl       (per-agent message queue)
    │   └── agent-2.jsonl
    └── reservations.json       (file → agent reservation map)

Pi Tool Hooks:
    edit() ──→ check reservations ──→ blocked? → return error + who + why
    write() ──→ check reservations ──→ blocked? → return error + suggestion
```

**Core Tools:**
- `agent_message({ action: "send", to: "@AgentName", body: "..." })` — Inter-agent messaging
- `subagent({ task: "...", type: "scout" })` — Spawn specialized child agents

**Slash Commands:**
- `/subagent` — Spawn single or parallel subagents
- `/agents` — Unified dashboard (agent status, message feed, reservations, shared chat)

**Subagent Types:** Defined in TOML files at `~/.pi/agents/` or `.pi/agents/` (project-level), specifying system prompt, reasoning level, and tool restrictions per agent type.

**Configuration:** `~/.pi/agent/collaborating-agents.json` (global) or `.pi/collaborating-agents.json` (project-level)

---

## Publisher Background

baochunli appears to be a solo community contributor with limited public profile. Only 1 GitHub star and 22 commits suggest this is an early-stage personal project. The MIT license is a positive signal. The code quality appears solid based on the architecture, but there is no established track record to evaluate reliability.

---

## What's Valuable for Us

1. **File Reservation Pattern:** The most valuable idea here. In our multi-agent orchestration, we've experienced race conditions when two agents edit the same file. Intercepting `edit`/`write` at the tool level with file locks is a deterministic solution that doesn't require LLM cooperation — it's enforced mechanically. This pattern should be adopted regardless of whether we use this specific extension.

2. **Auto-Registration:** Sessions auto-register on startup. No explicit coordination setup required. Aligns with our "thin shared layer" principle — agents join the collaboration mesh implicitly.

3. **Urgent Message Priority:** Normal messages queue as follow-ups; urgent messages interrupt immediately. This maps to our need for priority-based communication (e.g., orchestrator sending stop signals to agents).

4. **TOML Agent Type Definitions:** Declarative agent specialization with distinct prompts and reasoning levels. Simpler than YAML and more structured than ad-hoc prompting.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Very low adoption** | 1 star, 1 fork. No community validation. Risk of abandonment. |
| **Bun runtime dependency** | Requires Bun, not Node.js. We run Node.js. Would need to verify Bun compatibility or fork. |
| **Flat collaboration model** | All agents are peers. Our architecture needs hierarchical orchestration (orchestrator → workers). The `/subagent` command adds some hierarchy but the messaging is peer-to-peer. |
| **No merge/conflict resolution** | Reservations prevent conflicts but there's no strategy for resolving blocked work. An agent just... waits. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Extract the file reservation pattern and implement it in our Claude Code orchestrator. This doesn't require Pi — the concept (hook edit/write tools, check a reservation map) is portable.
- **Phase 3 (Days 60-90):** Evaluate alongside pi-messenger and pi-side-agents for multi-agent coordination. The reservation system could complement pi-side-agents' worktree isolation.
- **Phase 4 (Days 90+):** If the extension matures, consider as one layer in a composite multi-agent stack. Most likely we'd adopt the pattern rather than the package.

---

## Key Takeaway

> **pi-collaborating-agents introduces a uniquely valuable file reservation pattern that prevents concurrent edit conflicts at the tool level — a deterministic solution to a real multi-agent problem that we should adopt as a pattern regardless of whether we use this specific (low-adoption) extension.**
