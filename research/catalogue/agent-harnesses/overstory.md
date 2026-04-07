# Overstory

> **Multi-agent orchestration for AI coding agents — pluggable runtime adapters for Claude Code, Pi, and more.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/jayminwest/overstory](https://github.com/jayminwest/overstory) |
| GitHub Stars | 791 (as of 2026-03-08) |
| Publisher | Jaymin West — solo developer / consultant (previously built Rowana, acquired) |
| License | MIT |
| Tech Stack | TypeScript, Bun, SQLite, tmux, git worktrees |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Direct competitor/parallel to our L-Thread Orchestrator — solves the exact same problem (multi-agent coding coordination via tmux + worktrees). Nearly identical architecture decisions. |
| **Novelty** | 5/10 | Validates our pattern rather than introducing new ones. We already use tmux-based spawning, worktree isolation, and SQLite state. The pluggable AgentRuntime adapter interface is a refinement we haven't formalized. |
| **Actionable** | 7/10 | The AgentRuntime interface contract (`src/runtimes/types.ts`) and FIFO merge queue with tiered conflict resolution are directly adoptable patterns. The watchdog tiers are worth studying. |

---

## Overview

Overstory transforms a single coding session into a multi-agent team by spawning worker agents in git worktrees via tmux. Agents coordinate through a custom SQLite mail system using typed protocol messages, and their work merges back through a FIFO merge queue with 4-tier conflict resolution (auto-merge, rebase, AI-assisted, escalate-to-human).

The key architectural insight is the pluggable `AgentRuntime` interface — a contract that abstracts away the specifics of each AI coding agent (Claude Code, Pi, Gemini CLI, Codex, Copilot, Sapling, OpenCode). Each adapter handles spawning, config deployment, guard enforcement, readiness detection, and transcript parsing. This means the orchestration layer is completely decoupled from the execution layer.

The agent hierarchy is well-defined: Orchestrator (multi-repo coordinator of coordinators) > Coordinator (persistent, project-root) > Supervisor/Lead (team lead, depth 1) > Workers (Scout, Builder, Reviewer, Merger at depth 2). A tiered watchdog system monitors fleet health: mechanical daemon for heartbeats, AI-assisted triage for stuck agents, and a dedicated monitor agent for complex failure patterns.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│           TUI Dashboard                  │
│    (Fleet monitoring, task groups)        │
├─────────────────────────────────────────┤
│         Coordinator (persistent)         │
│   - Task decomposition & dispatch        │
│   - SQLite mail system (WAL mode)        │
│   - FIFO merge queue                     │
│   - Checkpoint save/restore              │
├──────────┬──────────┬───────────────────┤
│ Worker 1 │ Worker 2 │ Worker N           │
│ (Scout)  │(Builder) │(Reviewer)          │
│ worktree │ worktree │ worktree           │
│ tmux pane│ tmux pane│ tmux pane          │
├──────────┴──────────┴───────────────────┤
│       AgentRuntime Interface             │
│  ┌────────┬────────┬────────┬────────┐  │
│  │Claude  │  Pi    │Gemini  │ Codex  │  │
│  │Adapter │Adapter │Adapter │Adapter │  │
│  └────────┴────────┴────────┴────────┘  │
└─────────────────────────────────────────┘
```

**Core components:**
- **SQLite mail system**: Typed protocol messages between agents, WAL mode for concurrent access
- **Instruction overlay system**: Base `.md` files define HOW (workflow), per-task overlays define WHAT (scope) — with tool-call guards
- **Session metrics**: Extracted from runtime transcripts as JSONL
- **Checkpoint system**: Full save/restore for crash recovery
- **Watchdog tiers**: Mechanical daemon > AI triage > Monitor agent

---

## Publisher Background

Jaymin West is a Seattle-based agentic engineer and consultant helping companies accelerate AI adoption. He previously built Rowana (acquired) and is currently also working on KotaDB. He teaches AI development courses for software engineers. The project has 1,142 commits indicating serious solo-developer investment, but it remains a single-maintainer project with the risks that entails.

---

## What's Valuable for Us

1. **AgentRuntime interface** (`src/runtimes/types.ts`): A clean abstraction contract for swapping agent backends. Our orchestrator is Claude-first, but if we ever need to route specific tasks to Codex or Gemini, this pattern shows how to do it without touching orchestration logic.

2. **FIFO merge queue with 4-tier conflict resolution**: We currently handle merges manually. The escalation ladder (auto-merge > rebase > AI-assisted > human) is a production-ready pattern we should study.

3. **Tiered watchdog system**: Our crash recovery is reactive (tmux-recovery command). Overstory's proactive approach — mechanical heartbeat daemon + AI triage + monitor agent — is more robust.

4. **Instruction overlay system**: Base workflow definitions + per-task scope overlays with tool-call guards. This is more structured than our current CLAUDE.md approach.

5. **SQLite mail system**: Typed inter-agent messaging. Our orchestrator uses tmux `capture-pane` for agent communication, which is lossy. SQLite with WAL mode is more reliable.

---

## What's NOT Relevant

- **Multi-runtime support**: We are deliberately Claude-first per our architecture decisions. The runtime adapter complexity adds overhead we don't need today.
- **TUI dashboard**: Our orchestrator is headless by design — we operate through state files and tmux, not interactive UIs. A dashboard would violate our deterministic routing principle.
- **Multi-repo Orchestrator layer**: We use federated isolation per business line. A coordinator-of-coordinators is too much coupling for our DSGVO-compliant architecture.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the merge queue pattern when we start running 3+ parallel agents on the same repo. The 4-tier conflict resolution would reduce manual merge work.
- **Phase 3 (Days 60-90)**: If we formalize our agent spawning into a reusable SDK, the AgentRuntime interface is a proven contract to adopt.
- **Phase 4 (Days 90+)**: The watchdog tiers become essential at scale. When running 10+ concurrent agents, proactive health monitoring prevents cascading failures.

---

## Key Takeaway

> **Overstory validates our tmux + worktree + SQLite architecture with a more formalized runtime adapter layer — the AgentRuntime interface and tiered merge queue are the two patterns worth stealing.**
