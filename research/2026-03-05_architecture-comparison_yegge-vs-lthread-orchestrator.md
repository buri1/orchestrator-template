# Architecture Comparison: Yegge's Gas Town/Wasteland vs L-Thread Orchestrator

**Date:** 2026-03-05
**Scope:** Deep technical comparison of Steve Yegge's Gas Town + Wasteland vision with the L-Thread Orchestrator v2.0 architecture.

**Sources:**
- [Welcome to the Wasteland: A Thousand Gas Towns](https://steve-yegge.medium.com/welcome-to-the-wasteland-a-thousand-gas-towns-a5eb9bc8dc1f) (March 2026)
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) (January 2026)
- [The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c) (January 2026)
- L-Thread Orchestrator v2.0 (`.claude/agents/orchestrator.md` and related files)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Philosophical Foundations](#philosophical-foundations)
3. [Agent Spawning and Lifecycle](#1-agent-spawning--lifecycle)
4. [Communication Patterns](#2-communication-patterns)
5. [State Management](#3-state-management)
6. [Orchestration Philosophy](#4-orchestration-philosophy)
7. [Error Handling and Recovery](#5-error-handling--recovery)
8. [Tool Integration](#6-tool-integration)
9. [Scaling Model](#7-scaling-model)
10. [Feature Comparison Table](#8-feature-comparison-table)
11. [Architectural Topology Diagrams](#9-architectural-topology-diagrams)
12. [The Wasteland Extension](#10-the-wasteland-extension)
13. [Convergences and Divergences](#11-convergences-and-divergences)
14. [Conclusions](#12-conclusions)

---

## Executive Summary

Steve Yegge's **Gas Town** (January 2026) and its evolution into the **Wasteland** protocol (March 2026) represent a maximalist, factory-scale approach to multi-agent orchestration -- 20-30+ parallel agents managed through a bespoke Go CLI (`gt`), persistent JSONL-based state (Beads), and a hierarchical role system inspired by Mad Max metaphors. The **Wasteland** extends this into a federated marketplace where multiple Gas Towns exchange work through a protocol of wanted boards, validators, and reputation stamps.

The **L-Thread Orchestrator** takes a minimalist, mode-adaptive approach -- a single orchestrator agent that never writes code, operating through three interchangeable backends (Conduit CLI, Claude Code Teams, tmux sessions) with JSON state files, event-driven waiting, and a strict "conductor not musician" philosophy. It targets the 2-5 agent range with tight review-merge-test loops.

Both systems share the core conviction that **the orchestrator must never write code** and that **persistent state is essential for crash recovery**. They diverge dramatically on scale, complexity, agent taxonomy, and communication architecture.

---

## Philosophical Foundations

### Yegge: "Kubernetes Mated with Temporal"

Yegge's journey is instructive. He first built **Vibecoder** on top of Temporal (the workflow orchestration standard), writing ~350,000 lines of TypeScript before concluding that Temporal was too heavy for agent orchestration. His insight: agent tasks are **micro-workflows** -- so severely decomposed that enterprise workflow engines add friction rather than value. This led to:

1. **Beads** -- a lightweight, git-backed issue tracker replacing markdown plans as agent memory
2. **Gas Town** -- a ~189,000-line Go CLI that is, in Yegge's words, "Kubernetes mated with Temporal" but purpose-built for agent factories
3. **The Wasteland** -- a federated protocol for inter-Gas-Town work exchange

Yegge explicitly positions Gas Town for **Stage 7-8 developers** in his maturity model -- those already managing 10+ agents and needing factory infrastructure.

### L-Thread: "Conductor, Not Musician"

The L-Thread Orchestrator emerged from a different pain point: **how to make a single Claude Code instance reliably manage a development sprint without writing code itself**. Its philosophy is encoded in four absolute rules (Tier 0), two of which are written in German ("DU BIST KEIN ENTWICKLER") for emphasis:

1. The orchestrator never touches code -- spawn an agent instead
2. E2E testing is a mandatory gate before marking anything done
3. Respect AUTO-MODE -- never block on user input when autonomous
4. Update state after every phase transition

Where Yegge builds a purpose-built binary, L-Thread works entirely within Claude Code's existing tool ecosystem -- Conduit CLI, Claude Code Teams API, tmux, and bash.

---

## 1. Agent Spawning & Lifecycle

### Gas Town: Role-Based Factory Model

Gas Town defines a rich taxonomy of agent roles across two levels:

**Town-Level Agents:**
| Role | Function | Lifecycle |
|------|----------|-----------|
| **Mayor** | Chief coordinator, dispatches work, never codes | Persistent, human-facing |
| **Deacon** | System health daemon, runs patrol loops | Long-lived background process |
| **Dogs** | Maintenance tasks under the Deacon | Ephemeral, task-specific |
| **Overseer** | Human operator | External to system |

**Rig-Level Agents:**
| Role | Function | Lifecycle |
|------|----------|-----------|
| **Crew** | Named, persistent agents for design/review | Persistent identity, ephemeral sessions |
| **Polecats** | Ephemeral "cattle" workers, spawned and terminated | Fully ephemeral |
| **Refinery** | Merge queue manager, conflict resolver | Persistent process |
| **Witness** | Supervises Polecats, unblocks stalled work | Persistent supervisor |

Agents are spawned via the `gt` CLI:
```bash
gt sling <bead-id> <rig>           # Assign work to agent
gt mayor attach                     # Start Mayor session
gt convoy create "Feature" <beads>  # Bundle work items
```

Each agent has a **Role Bead** (rules and priming), an **Agent Bead** (persistent identity), and a **Hook** (work queue). The GUPP principle ("Gas Town Universal Propulsion Principle") mandates: "If there is work on your hook, you MUST run it."

### L-Thread: Mode-Adaptive Spawning

L-Thread uses a simpler role model -- dev agents, review agents, fix agents, and test agents -- spawned through whichever backend is available:

**Conduit Mode (Sequential):**
```bash
conduit pane-split right -t terminal
pane_id=$(conduit pane-list | jq -r '.[-1].id')
conduit terminal-write -p $pane_id -e "cd $PWD && claude --dangerously-skip-permissions"
conduit terminal-wait -p $pane_id -t 15
conduit terminal-write -p $pane_id -e "/bmad_bmm_agent_dev"
```

**Teams Mode (Parallel):**
```
Task tool:
  subagent_type: "general-purpose"
  team_name: "sprint-1"
  name: "dev-1"
  mode: "bypassPermissions"
  prompt: [inline agent instructions]
```

**Tmux Mode (Crash-Protected):**
```bash
tmux new-session -d -s <name> -c <directory>
tmux send-keys -t <name> 'claude --dangerously-skip-permissions' Enter
```

### Comparison

| Dimension | Gas Town | L-Thread |
|-----------|----------|----------|
| Agent taxonomy | 8+ specialized roles | 4 generic roles (dev/review/fix/test) |
| Identity persistence | Permanent Agent Beads | None -- fresh context per spawn |
| Spawning mechanism | Custom Go CLI (`gt`) | Native tools (Conduit/Teams/tmux) |
| Lifecycle model | "Pets" (Crew) + "Cattle" (Polecats) | All "Cattle" -- spawn fresh, close after |
| Supervisor hierarchy | Multi-layer (Mayor > Witness > Polecat) | Flat (Orchestrator > Agent) |
| Session persistence | Git-backed hooks survive crashes | Tmux sessions survive crashes |
| Max concurrent agents | 20-30+ | 2-5 (recommended 3 for rate limits) |

**Key insight:** Gas Town invests in agent identity because at 20-30 agents, you need to track who did what. L-Thread treats agents as disposable because at 2-5 agents, fresh context is cheaper than identity management.

---

## 2. Communication Patterns

### Gas Town: Multi-Channel Actor Model

Gas Town implements three communication patterns inspired by the actor model:

1. **Direct Mailbox** -- Messages delivered to individual agents by name
2. **Competing-Consumer Queue** -- Multiple agents pull from a shared work queue
3. **Channel Broadcast** -- Publish messages to all agents on a channel

Agents check their mailbox on startup (via Claude Code hook injection in `.claude/settings.json`). The `gt handoff` command transfers work context when restarting sessions. The **Town Wall** (`gtwall`) provides an append-only log for coordination -- agents post findings and status updates that all other agents can read.

Communication is **decentralized**: agents can talk to each other without routing through the Mayor.

### L-Thread: Mode-Dependent Communication

L-Thread's communication is strictly determined by the active mode:

**Conduit Mode (Terminal I/O):**
```
Orchestrator --[terminal-write]--> Agent
Agent --[terminal-read]<-- Orchestrator
```
All communication passes through the orchestrator. Agents cannot talk to each other.

**Teams Mode (Peer-to-Peer Messaging):**
```
Orchestrator --[SendMessage]--> Agent
Agent --[SendMessage]--> Orchestrator
Agent --[SendMessage]--> Other Agent  (peer-to-peer!)
```
The Teams mode explicitly supports peer-to-peer messaging: "Teammates can message EACH OTHER directly. The orchestrator does not need to relay every message."

**Tmux Mode (Terminal Injection):**
```
Orchestrator --[tmux send-keys]--> Agent
Agent --[tmux capture-pane]<-- Orchestrator
```
Like Conduit, all communication is orchestrator-mediated.

### Comparison

| Pattern | Gas Town | L-Thread |
|---------|----------|----------|
| Direct messaging | Yes (mailbox) | Teams mode only |
| Broadcast | Yes (channels) | Teams mode (`broadcast` type) |
| Shared log | Town Wall (append-only) | Devlog (orchestrator-written) |
| Agent-to-agent | Yes (decentralized) | Teams mode only |
| Orchestrator-mediated | Optional | Required in Conduit/Tmux |
| Protocol | Custom (gt CLI) | Native Claude Code APIs |
| Async delivery | Yes (mail on next startup) | Teams: yes; Conduit/Tmux: no |

**Key insight:** Gas Town's communication is richer because it must coordinate 20-30 agents where a hub-and-spoke model would bottleneck. L-Thread's hub-and-spoke model works at 2-5 agents because the orchestrator can track all conversations without being overwhelmed.

---

## 3. State Management

### Gas Town: The MEOW Stack

Gas Town's state architecture is its most distinctive feature -- the **Molecular Expression of Work (MEOW)** stack:

```
Formulas (TOML)          -- High-level workflow definitions
    |
Protomolecules           -- Reusable workflow templates
    |
Molecules                -- Instantiated workflows (DAGs of Beads)
    |
Beads (JSONL)            -- Atomic work items with status, assignee, history
    |
Git + Dolt               -- Persistence layer (versioned, auditable)
```

**Beads** are the fundamental unit -- JSONL records with IDs (e.g., `gt-abc12`), descriptions, status, and assignees. They transition through six lifecycle states: Create, Live, Close, Decay, Compact, Flatten. Dogs (maintenance agents) manage lifecycle transitions.

**Molecules** are workflow graphs: Design -> Implement -> Test -> Review -> Approval Gate -> Merge. They support loops, gates, parallel execution, and dependency tracking.

State persists in **Git repositories**, making it crash-recoverable, auditable, and versionable. The Dolt database provides transactional query capabilities on top of the JSONL files.

### L-Thread: JSON State Files

L-Thread uses simple JSON files with mode-specific schemas:

**Conduit State** (`_bmad/orchestrator-state.json`):
```json
{
  "current_story": { "id": "1.4", "issue_number": 12, "branch": "feature/story-1.4" },
  "current_agent": { "pane_id": "abc123", "type": "dev", "spawned_at": "..." },
  "phase": "waiting_for_pr",
  "review_cycle": 0,
  "stories_completed": 5
}
```

**Teams State** (`_bmad/orchestrator-teams-state.json`):
```json
{
  "team_name": "sprint-1",
  "prs": { "ISSUE-1": { "pr_number": null, "review_cycles": 0 } },
  "sprint_metrics": { "tasks_total": 10, "tasks_merged": 0 }
}
```

**Tmux State** (`_bmad/orchestrator-tmux-state.json`):
- Session-to-project mappings
- Claude running status per session
- Recovery log (append-only crash/recovery audit trail)

Recovery works through:
1. **SessionStart Hook** -- injects current state into new sessions via `additionalContext`
2. **PreCompact Hook** -- saves handoff state before context compaction
3. **Tmux persistence** -- sessions survive terminal/Conduit crashes

### Comparison

| Dimension | Gas Town | L-Thread |
|-----------|----------|----------|
| State format | JSONL (Beads) + Dolt DB | JSON files |
| Persistence layer | Git + Dolt (versioned, queryable) | File system + Git |
| Workflow modeling | Molecules (DAGs with gates/loops) | Linear phase machine |
| Work item tracking | Beads (6-state lifecycle) | Phase field (6 states) |
| Audit trail | Full bead history, stamps | Devlog + recovery log |
| Recovery mechanism | Hook resume from checkpoint | SessionStart hook + state re-injection |
| Complexity | Very high (MEOW stack) | Low (flat JSON) |
| Queryability | SQL via Dolt | `jq` on JSON files |

**Key insight:** Gas Town's MEOW stack is a full workflow engine with DAG execution, gates, and loops. L-Thread's state is a simple finite state machine that tracks "what phase am I in?" This reflects the scale difference: at 20-30 agents with complex interdependencies, you need a workflow engine. At 2-5 agents executing a fixed loop (code -> PR -> review -> merge -> test), a state machine suffices.

---

## 4. Orchestration Philosophy

### Gas Town: Hierarchical Autonomy

Gas Town implements a multi-layer supervisory hierarchy:

```
Overseer (Human)
    |
Mayor (Coordinator)
    |
    +-- Witness (Supervisor)
    |       |
    |       +-- Polecats (Workers)
    |
    +-- Refinery (Merge Manager)
    |
    +-- Deacon (Health Daemon)
            |
            +-- Dogs (Maintenance)
```

The Mayor **never writes code** -- it dispatches work, tracks progress, and makes strategic decisions. The Witness monitors Polecats and unblocks stalled workers. The Refinery handles the merge queue independently. This creates **autonomous subsystems** that operate without constant human or Mayor intervention.

The GUPP principle ensures forward progress: any agent with work on its hook MUST execute it. This creates a self-propelling system where work flows through the pipeline as long as the queue has items.

### L-Thread: Flat Command-and-Control

L-Thread has a strict two-level hierarchy:

```
Orchestrator
    |
    +-- Dev Agent(s)
    +-- Review Agent
    +-- Fix Agent
    +-- Test Agent
```

The orchestrator controls the entire lifecycle: spawn, monitor, analyze results, merge, test, close, repeat. In Conduit mode, this is fully sequential -- one agent at a time. In Teams mode, 2-3 dev agents work in parallel, but the orchestrator still makes all merge/skip/retry decisions.

The "conductor not musician" principle is equivalent to Gas Town's Mayor-never-codes rule, but L-Thread applies it more strictly: the orchestrator does not even analyze code review output to decide what to fix. It spawns a fix agent for that.

### Comparison

| Aspect | Gas Town | L-Thread |
|--------|----------|----------|
| Hierarchy depth | 3-4 levels | 2 levels |
| Decision authority | Distributed (Mayor + Witness + Refinery) | Centralized (Orchestrator only) |
| Autonomous subsystems | Yes (Refinery, Deacon operate independently) | No -- orchestrator controls all |
| Human intervention point | Overseer (strategic only) | User commands (start/stop/pause/skip) |
| Forward progress guarantee | GUPP principle | AUTO-MODE (skip-on-roadblock) |
| Code review integration | Crew members as PR Sheriffs | Dedicated review agent spawns |

**Key insight:** Gas Town distributes control because at scale, a single coordinator becomes a bottleneck. L-Thread centralizes control because at its target scale, the orchestrator can handle all decisions without becoming a bottleneck -- and centralization simplifies reasoning about system state.

---

## 5. Error Handling & Recovery

### Gas Town: Layered Supervision

Gas Town handles failures through its supervisory hierarchy:

1. **Witness** detects stalled Polecats and attempts to unblock them
2. **Deacon** runs patrol loops checking system health
3. **Dogs** perform maintenance tasks (cleanup, lifecycle management)
4. **Refinery** can "re-imagine" implementations when merge conflicts become untenable
5. **`gt feed --problems`** surfaces stuck agents in the TUI
6. **`gt handoff`** restarts sessions while preserving context via mail

Crash recovery relies on Git-backed persistence: hooks and beads survive any process death, and agents resume from their last checkpoint on restart.

### L-Thread: Structured Roadblock Recovery

L-Thread has a formalized roadblock recovery pattern with five steps:

1. **Classify** the roadblock (Known Issue / Test Failure / Infrastructure / Agent Stuck)
2. **Search FutureLearnings** (`memory/FutureLearnings.md`) for matching INC-XXX incidents
3. **Send recovery instructions** to the stuck agent
4. **Spawn recovery agent** if the original cannot recover (close old, spawn fresh with pre-loaded fix context)
5. **AUTO-MODE escalation**: after 3 failed attempts, SKIP the task, log, continue

The FutureLearnings database acts as institutional memory -- documented incidents with root causes, fixes, and prevention checklists. Common entries include database connection patterns (INC-001), shell escaping issues, Chrome DevTools instability (INC-013), and the E2E testing gate (INC-014/015).

**AUTO-MODE roadblock handling:**

| Roadblock | Action | Timeout |
|-----------|--------|---------|
| Tests fail 3x | SKIP task, continue | Immediate |
| Merge conflict | SKIP task, continue | Immediate |
| Agent stuck | Close/shutdown, SKIP | 30 minutes |
| No PR created | Close/shutdown, SKIP | 45 minutes |
| Review agent fails | Merge if tests pass | Immediate |

### Comparison

| Dimension | Gas Town | L-Thread |
|-----------|----------|----------|
| Detection mechanism | Supervisor agents (Witness, Deacon) | Orchestrator monitoring + timeouts |
| Recovery strategy | Unblock, re-imagine, handoff | Fix instructions, respawn, skip |
| Institutional memory | Bead history, agent identity | FutureLearnings incident database |
| Crash recovery | Git-backed hooks + checkpoint resume | Tmux persistence + SessionStart hook |
| Skip/escalation | Escalate to human (Overseer) | AUTO-MODE: skip after 3 attempts |
| Context preservation | Mail injection on restart | State file re-injection via hook |

**Key insight:** Gas Town's recovery is agent-based (Witness unblocks Polecats), while L-Thread's recovery is pattern-based (look up the incident, send known fix). Gas Town's approach scales better to novel failures because a supervisor agent can reason about the problem. L-Thread's approach is more deterministic for known failures because it codifies solutions.

---

## 6. Tool Integration

### Gas Town: Custom CLI + Standard Tools

Gas Town's tool integration centers on the `gt` CLI (189,000 lines of Go):

| Layer | Tools |
|-------|-------|
| Core CLI | `gt sling`, `gt convoy`, `gt mayor`, `gt feed`, `gt handoff`, `gt prime` |
| Agent Runtime | Claude Code, Codex, Cursor, Gemini, Goose (configurable per-rig) |
| Persistence | Git worktrees, Dolt database, JSONL storage |
| Isolation | tmux sessions (one per agent) |
| Monitoring | `gt feed` TUI, `gt feed --problems` |
| Communication | `.claude/settings.json` hook injection, mailbox system |

Gas Town supports multiple AI runtimes -- not just Claude Code but also Codex, Cursor, Gemini, and others -- configured per-rig in `settings/config.json`. This runtime-agnostic design is a significant architectural difference.

### L-Thread: Native Claude Code Ecosystem

L-Thread integrates exclusively with Claude Code's native tool ecosystem:

| Layer | Tools |
|-------|-------|
| Agent Management | Conduit CLI, Claude Code Teams API, tmux |
| Code Operations | `gh` CLI (GitHub), `git` |
| Testing | Chrome DevTools MCP (desktop + mobile emulation) |
| Communication | `conduit terminal-write/read`, `SendMessage` |
| State | `Write` tool for JSON files |
| Process Control | `pkill` for orphaned process cleanup |
| Notification | `conduit notify` |

The Chrome DevTools MCP integration is particularly notable -- L-Thread mandates E2E testing through actual browser automation (navigate, screenshot, emulate mobile devices) as a gate before any task can be marked done.

### Comparison

| Dimension | Gas Town | L-Thread |
|-----------|----------|----------|
| Custom tooling | 189K lines of Go | Zero custom code |
| Agent runtimes | Multi-runtime (Claude, Codex, Cursor, etc.) | Claude Code only |
| E2E testing | Not emphasized | Mandatory gate (Chrome DevTools MCP) |
| Browser automation | Not built-in | Chrome DevTools MCP (desktop + mobile) |
| Merge management | Refinery agent | `gh pr merge --squash` |
| Monitoring UI | `gt feed` TUI | Conduit pane layout |
| Dependencies | Go 1.23+, Git 2.25+, Dolt, tmux, sqlite3 | Claude Code + tmux (optional) |

**Key insight:** Gas Town builds its own infrastructure; L-Thread leverages existing infrastructure. Gas Town's approach enables runtime flexibility and custom workflow primitives. L-Thread's approach means zero installation overhead and automatic upgrades when Claude Code improves its native capabilities.

---

## 7. Scaling Model

### Gas Town: Factory Scale

Gas Town explicitly targets large-scale agent operations:

```
Stage 6:  3-5 parallel agents (CLI-based, high trust)
Stage 7:  10+ hand-managed agents (coordination limit)
Stage 8:  20-30+ agents (factory infrastructure required)  <-- Gas Town's target
```

Scaling mechanisms:
- **Worktrees** isolate agents from file conflicts
- **Hierarchical supervision** prevents coordinator bottleneck
- **Competing-consumer queues** distribute work automatically
- **Refinery** serializes merge operations to avoid conflicts
- **Convoy tracking** bundles related work for delivery management

**Cost profile:** Yegge reports $2,000-5,000/month in API costs. The architecture assumes users who view this as a productivity investment rather than an expense.

### L-Thread: Sprint Scale

L-Thread targets the 2-5 agent range:

```
Conduit Mode:  1 agent at a time (sequential loop)
Teams Mode:    2-3 dev agents + 1 reviewer (parallel)
Tmux Mode:     Cross-project sessions (crash protection layer)
```

Scaling mechanisms:
- **Sequential processing** in Conduit mode eliminates coordination overhead
- **Teams mode** enables limited parallelism with peer-to-peer messaging
- **Tmux sessions** persist across crashes for session continuity
- **Rate limit awareness**: "Max Parallel Agents: 3 (recommended, to stay within rate limits)"

**Cost profile:** Minimized by sequential processing and agent recycling. No custom infrastructure costs.

### Scaling Topology Comparison

```
GAS TOWN (Factory Model):              L-THREAD (Sprint Model):

    [Overseer]                              [User]
        |                                      |
    [Mayor]                              [Orchestrator]
    /   |    \                            /    |    \
[Witness] [Refinery] [Deacon]        [Dev-1] [Dev-2] [Reviewer]
  / | \                |
[P] [P] [P]         [Dogs]

P = Polecats (20-30)
Scale: Factory                        Scale: Workshop
```

---

## 8. Feature Comparison Table

| Feature | Gas Town | L-Thread Orchestrator |
|---------|----------|----------------------|
| **Scale target** | 20-30+ agents | 2-5 agents |
| **Language** | Go (189K LOC) | Pure prompt engineering (0 LOC) |
| **Agent runtimes** | Claude, Codex, Cursor, Gemini, etc. | Claude Code only |
| **Orchestrator writes code** | No (Mayor rule) | No (Rule 1: "DU BIST KEIN ENTWICKLER") |
| **Agent roles** | 8+ specialized (Mayor, Polecat, Crew, Witness, Refinery, Deacon, Dogs, Overseer) | 4 generic (dev, review, fix, test) |
| **Agent identity** | Persistent (Agent Beads) | Ephemeral (fresh per spawn) |
| **State format** | JSONL Beads + Dolt DB | JSON files |
| **Workflow engine** | Molecules (DAGs with gates, loops, dependencies) | Linear state machine |
| **Communication** | Mailbox + Queue + Broadcast (actor model) | Terminal I/O or SendMessage |
| **Agent-to-agent comms** | Yes (decentralized) | Teams mode only |
| **Crash recovery** | Git-backed hooks + checkpoint resume | Tmux sessions + SessionStart hook |
| **Merge management** | Refinery agent (automated conflict resolution) | `gh pr merge --squash` |
| **E2E testing** | Not emphasized | Mandatory gate (Chrome DevTools MCP) |
| **Mobile testing** | Not built-in | iPhone 14 Pro emulation (390px) |
| **Auto-mode** | GUPP (always execute if work exists) | AUTO-MODE flag (skip on roadblock) |
| **Error recovery** | Supervisor agents (Witness, Deacon) | FutureLearnings incident database |
| **Cost** | $2K-5K/month API + Go infra | Claude Code subscription only |
| **Setup complexity** | Go, Git, Dolt, sqlite3, tmux, beads CLI | Zero (prompt files only) |
| **Federation** | Wasteland protocol (inter-Gas-Town) | None |
| **Reputation system** | Stamps + trust levels | None |
| **Runtime agnostic** | Yes (configurable per rig) | No (Claude Code specific) |
| **Monitoring** | `gt feed` TUI | Conduit pane visual + `conduit notify` |
| **Custom CLI** | `gt` (extensive) | None (uses existing CLIs) |
| **Maturity** | ~3 months (Jan-Mar 2026) | v2.0 |
| **Documentation style** | English + Mad Max metaphors | German + English bilingual |

---

## 9. Architectural Topology Diagrams

### Gas Town: Full Architecture

```
+----------------------------------------------------------+
|                     THE WASTELAND                         |
|  (Federated Protocol: Wanted Boards, Stamps, Trust)      |
|                                                           |
|  +------------------+    +------------------+             |
|  |   GAS TOWN A     |    |   GAS TOWN B     |            |
|  |                   |    |                   |            |
|  |  [Overseer]       |    |  [Overseer]       |           |
|  |      |            |    |      |            |            |
|  |  [Mayor]          |    |  [Mayor]          |            |
|  |   /    \          |    |   /    \          |            |
|  | [Rig 1] [Rig 2]   |    | [Rig 1] [Rig 2]  |           |
|  |  |       |        |    |  |       |        |            |
|  | [Crew]  [Crew]    |    | [Crew]  [Crew]   |            |
|  | [Polecats...]     |    | [Polecats...]    |            |
|  | [Witness]         |    | [Witness]        |            |
|  | [Refinery]        |    | [Refinery]       |            |
|  +--------+----------+    +--------+---------+            |
|           |                        |                      |
|           +--- Wanted Board -------+                      |
|           |    (federated)         |                      |
|           +--- Stamps/Trust -------+                      |
+----------------------------------------------------------+

Persistence: Git + Dolt + JSONL (Beads)
Communication: Mailbox + Queue + Broadcast + Town Wall
```

### L-Thread: Full Architecture

```
+----------------------------------------------------------+
|               L-THREAD ORCHESTRATOR v2.0                  |
|          (Mode-Adaptive, Single Coordinator)              |
|                                                           |
|  +--- Mode Detection Algorithm ---+                      |
|  |                                |                      |
|  v                                v                      |
|  +----------------+  +----------------+  +-----------+   |
|  | CONDUIT MODE   |  | TEAMS MODE     |  | TMUX MODE |   |
|  | (Sequential)   |  | (Parallel)     |  | (Recovery)|   |
|  |                |  |                |  |           |   |
|  | [Orchestrator] |  | [Orchestrator] |  | [Sessions]|   |
|  |      |         |  |   /  |  \      |  |  |  |  |  |   |
|  |   [Agent]      |  | [D1][D2][Rev]  |  | [S1][S2] |   |
|  |  (one at       |  |  (peer-to-     |  | (persist  |   |
|  |   a time)      |  |   peer msgs)   |  |  across   |   |
|  +----------------+  +----------------+  |  crashes)  |   |
|                                          +-----------+   |
|                                                           |
|  State: JSON files (_bmad/*.json)                        |
|  Hooks: SessionStart, PreCompact                         |
|  Recovery: FutureLearnings (INC-XXX database)            |
|  Testing: Chrome DevTools MCP (mandatory gate)           |
+----------------------------------------------------------+

Loop: Story -> PR -> Review -> Fix -> Merge -> E2E -> Done
```

---

## 10. The Wasteland Extension

The **Wasteland** (March 2026) extends Gas Town beyond a single workspace into a federated marketplace. This has no direct equivalent in L-Thread and represents Yegge's vision for the next evolution of agent orchestration.

### Wasteland Core Concepts

| Concept | Description |
|---------|-------------|
| **Wanted Board** | Shared list of open work (tasks, bugs, features, research). Each item has title, description, effort estimate, and tags. |
| **Rigs** | Participants (human + AI side). A rig's AI side can be an agent, a Gas Town, or another orchestrator. |
| **Posters** | Entities that put work on the board. |
| **Validators** | Maintainer-level rigs that review completions and issue stamps. |
| **Stamps** | Multi-dimensional attestations (quality, reliability, creativity scored independently). |
| **Trust Levels** | Level 1 (registered) -> Level 2 (contributor) -> Level 3 (maintainer). Gates access. |
| **Federation** | Each wasteland is a sovereign database with a shared schema. Anyone can create one. |

### Wanted Item Lifecycle

```
Open -> Claimed -> In Review -> Completed
                      |
                  [Validator issues Stamp]
                      |
                  [Stamp accumulates into Rig reputation]
```

### Implications for L-Thread

The Wasteland introduces concepts that L-Thread's architecture would need fundamental extensions to support:

1. **Cross-project work exchange** -- L-Thread operates within a single project. The Wasteland envisions work flowing between independent Gas Towns.
2. **Reputation and trust** -- L-Thread has no notion of agent reputation. The Wasteland builds portable professional identity from stamp history.
3. **Decentralized validation** -- L-Thread's orchestrator is the sole judge of quality. The Wasteland distributes validation to independent validators.
4. **Federated state** -- L-Thread's state is local JSON files. The Wasteland requires a versioned, federated database with shared schema.

---

## 11. Convergences and Divergences

### Where They Agree

1. **The orchestrator must never write code.** Both systems enforce this as an absolute, non-negotiable rule. Gas Town calls it the Mayor's role constraint; L-Thread encodes it as Rule 1 in German for emphasis.

2. **State persistence is essential.** Both recognize that agent sessions are ephemeral and that work state must survive crashes. Gas Town uses Git-backed JSONL; L-Thread uses JSON files + tmux session persistence.

3. **Forward progress requires automation.** Gas Town's GUPP principle and L-Thread's AUTO-MODE both ensure the system keeps moving without human intervention. Both have skip/escalation paths for irrecoverable roadblocks.

4. **Context matters more than code.** Both invest heavily in giving agents the right context: Gas Town through Role Beads and mail injection, L-Thread through tiered context loading and inline prompts.

5. **Process cleanup is necessary.** Both explicitly handle orphaned processes -- Gas Town through Dogs and Deacon patrols, L-Thread through `pkill` commands after closing agents.

### Where They Diverge

1. **Build vs. Leverage.** Gas Town builds 189K lines of custom Go infrastructure. L-Thread builds zero lines of code -- it is pure prompt engineering leveraging existing Claude Code capabilities. This is the deepest philosophical divergence.

2. **Scale ambition.** Gas Town targets 20-30+ agents (factory scale). L-Thread targets 2-5 agents (workshop scale). Each architecture is optimized for its target scale and would struggle at the other's.

3. **Agent identity.** Gas Town maintains persistent agent identities with history and reputation. L-Thread spawns fresh, stateless agents for every task. Gas Town treats agents as professionals with track records; L-Thread treats them as interchangeable workers.

4. **Communication topology.** Gas Town is decentralized (any agent can message any other). L-Thread is hub-and-spoke in most modes (all communication through orchestrator), with peer-to-peer only in Teams mode.

5. **Testing philosophy.** L-Thread mandates E2E browser testing as a non-negotiable gate (INC-014/015 incidents learned this the hard way). Gas Town does not emphasize automated E2E testing, relying more on code review through Crew/PR Sheriffs.

6. **Runtime coupling.** Gas Town supports Claude Code, Codex, Cursor, Gemini, and others. L-Thread is tightly coupled to Claude Code. This reflects different bets: Gas Town bets that the best runtime will change; L-Thread bets that Claude Code's capabilities will keep improving.

---

## 12. Conclusions

### When to Use Each

**Use Gas Town when:**
- You manage 10+ parallel agents
- You need cross-project coordination
- You want runtime-agnostic agent orchestration
- You are comfortable with $2K-5K/month API costs
- You need persistent agent identity and reputation tracking
- You are building toward Wasteland-scale federation

**Use L-Thread Orchestrator when:**
- You manage 1-5 agents in a sprint workflow
- You want zero-infrastructure setup (pure prompt engineering)
- You need mandatory E2E testing gates
- You prefer Claude Code's native ecosystem
- You want predictable, deterministic sprint execution
- You need crash recovery without custom tooling

### The Deeper Pattern

Both systems are responses to the same fundamental insight: **LLMs are capable workers but terrible self-managers.** Left to their own devices, agents lose context, go in circles, and mark things as done without testing. Both Gas Town and L-Thread solve this by externalizing management -- but at radically different scales.

Gas Town is a **factory management system** that assumes you will run dozens of agents and need industrial-grade infrastructure. L-Thread is a **sprint management system** that assumes you will run a handful of agents and need lightweight, reliable automation.

The Wasteland extends this metaphor further: if Gas Town is a factory, the Wasteland is an **economy** -- a federated marketplace where factories exchange work, build reputation, and develop trust. This is the most ambitious vision for multi-agent orchestration currently proposed in the coding agent space.

Neither system is "better" -- they operate at different scales, make different trade-offs, and solve different problems. The fact that both independently arrived at "the orchestrator must never write code" and "state must persist across crashes" suggests these are **fundamental principles** of multi-agent orchestration, regardless of scale.

---

*Research compiled from public sources, GitHub repositories, and the L-Thread Orchestrator v2.0 codebase.*
