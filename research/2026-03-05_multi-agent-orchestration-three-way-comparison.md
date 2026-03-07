# Multi-Agent Orchestration: Three-Way Comparison
## Gas Town (Yegge) vs L-Thread Orchestrator vs Pi Agent (indydevdan)

**Date:** 2026-03-05
**Method:** Deep analysis of three independently developed multi-agent orchestration systems
**Scope:** Architecture, communication, state, error recovery, scalability, philosophy

---

## Executive Summary

Three systems. Three philosophies. One problem: LLMs are capable workers but terrible self-managers.

Steve Yegge's **Gas Town** is a factory -- 20-30 agents managed by a 189K-line Go binary, backed by Git+Dolt, scaling toward federated colonies. The **L-Thread Orchestrator** is a workshop -- 2-5 agents managed by pure prompt engineering with zero custom code, enforcing E2E quality gates. Dan's **Pi Agent** is a toolkit -- N agents composed from extensions and YAML configs, dispatching across models, building new agents with agents.

All three independently discovered the same five laws. All three are converging on the same architecture from radically different starting points.

| Dimension | Gas Town (Yegge) | L-Thread Orchestrator | Pi Agent (indydevdan) |
|-----------|------------------|----------------------|----------------------|
| **Scale** | 20-30 agents (factory) | 2-5 agents (workshop) | N agents (extensible) |
| **Codebase** | 189K lines Go | 0 lines (pure prompts) | ~2K lines (extensions) |
| **Model lock-in** | Multi-runtime | Claude Code only | Any model per agent |
| **Philosophy** | Throughput > precision | Reliability > speed | Composability > both |
| **Metaphor** | Mad Max colony | Symphony conductor | UNIX pipeline |
| **Cost** | $2-5K/month | Subscription only | Model-dependent |
| **Audience** | Stage 7-8 frontier devs | Any dev with Claude Code | Pi/Cursor power users |

---

## Table of Contents

1. [The Five Universal Laws](#the-five-universal-laws)
2. [Architecture Overview](#architecture-overview)
3. [Scale Comparison](#1-scale-comparison)
4. [Communication Patterns](#2-communication-patterns)
5. [State Management](#3-state-management)
6. [Error Recovery Strategies](#4-error-recovery-strategies)
7. [Model Flexibility](#5-model-flexibility)
8. [Orchestration Overhead](#6-orchestration-overhead)
9. [The Sweet Spot](#7-the-sweet-spot)
10. [The Convergence Thesis](#8-the-convergence-thesis)
11. [What Each Gets Uniquely Right](#9-what-each-gets-uniquely-right)
12. [Feature Matrix](#complete-feature-matrix)
13. [Architecture Diagrams](#architecture-diagrams)
14. [When to Use Which](#when-to-use-which)
15. [The Road Ahead](#the-road-ahead)

---

## The Five Universal Laws

All three systems, built independently by people who were not reading each other's code, arrived at the same five principles. This convergence suggests these are not preferences but **structural requirements** of multi-agent orchestration:

### Law 1: The Orchestrator Must Never Write Code

| System | How It's Enforced |
|--------|-------------------|
| **Gas Town** | Mayor role constraint -- Mayor dispatches, never implements |
| **L-Thread** | Rule 1 (in German for emphasis): "DU BIST KEIN ENTWICKLER" -- mental check before every action |
| **Pi Agent** | Dispatcher pattern -- primary agent routes to specialists, never executes domain work itself |

**Why it's universal:** An orchestrator that writes code loses its ability to evaluate that code objectively. The separation of concerns is not cosmetic -- it is structural. The moment the orchestrator touches implementation, it becomes biased toward its own output and loses the meta-cognitive distance required to manage workflow.

### Law 2: State Must Persist Across Crashes

| System | Mechanism |
|--------|-----------|
| **Gas Town** | Git-backed JSONL Beads + Dolt database -- work survives any process death |
| **L-Thread** | JSON state files + tmux session persistence + SessionStart hook re-injection |
| **Pi Agent** | `pi.appendEntry()` extension state + session JSONL logs |

**Why it's universal:** Agent sessions are ephemeral by nature. Context windows compact. Terminals crash. Processes die. Any system that assumes continuous execution will fail on the first disruption.

### Law 3: Forward Progress Must Be Automated

| System | Mechanism |
|--------|-----------|
| **Gas Town** | GUPP -- "If there is work on your hook, you MUST run it" |
| **L-Thread** | AUTO-MODE flag -- never block on user input, skip and continue on roadblocks |
| **Pi Agent** | Chain mode -- output of one agent feeds input of next, no human gate required |

**Why it's universal:** The value of multi-agent systems is throughput. Any system that blocks on human approval negates the throughput advantage. The escape hatch must be "skip and log," not "stop and wait."

### Law 4: Agents Need Structured Roles

| System | Role Count | Examples |
|--------|------------|----------|
| **Gas Town** | 8+ | Mayor, Polecats, Witness, Refinery, Deacon, Dogs, Crew, Overseer |
| **L-Thread** | 4 | Orchestrator, Dev, Review, Fix |
| **Pi Agent** | N (user-defined) | Dispatcher, specialists from YAML roster, sub-agents from /sub |

**Why it's universal:** Undifferentiated agents produce chaos. Role structure creates predictable behavior, clear responsibility boundaries, and composable workflows.

### Law 5: Quality Gates Matter

| System | Primary Gate |
|--------|-------------|
| **Gas Town** | Refinery + PR Sheriffs (code review) |
| **L-Thread** | Mandatory E2E testing via Chrome DevTools MCP (desktop + mobile) |
| **Pi Agent** | Hook-based validation + damage-control extension |

**Why it's universal:** Fast output without verification is waste. Every system discovered -- usually painfully -- that agents will mark work as done without proper testing unless the system structurally prevents it.

---

## Architecture Overview

### Gas Town: The Factory

```
+================================================================+
|                       THE WASTELAND                             |
|            (Federation Protocol: Trust, Stamps, Dolt)           |
|                                                                 |
|  +---------------------------+  +---------------------------+   |
|  |       GAS TOWN A          |  |       GAS TOWN B          |   |
|  |                            |  |                            |  |
|  |  [Overseer] (Human)       |  |  [Overseer] (Human)       |  |
|  |      |                     |  |      |                     |  |
|  |  [Mayor] -- Never codes   |  |  [Mayor] -- Never codes   |  |
|  |   /    |    \     \        |  |   /    |    \     \        |  |
|  |  /     |     \     \       |  |  /     |     \     \       |  |
|  | [W]  [Ref]  [Dea]  [Crew] |  | [W]  [Ref]  [Dea]  [Crew] |  |
|  | / \    |      |            |  | / \    |      |            |  |
|  |[P][P]  |    [Dogs]         |  |[P][P]  |    [Dogs]         |  |
|  |[P][P]  |                   |  |[P][P]  |                   |  |
|  |[P]...  |                   |  |[P]...  |                   |  |
|  |        |                   |  |        |                   |  |
|  | W=Witness  Ref=Refinery    |  | P=Polecat  Dea=Deacon     |  |
|  +----------+-----------------+  +----------+-----------------+  |
|             |                               |                    |
|             +------ Wanted Board -----------+                    |
|             +------ Stamps / Trust ---------+                    |
+================================================================+

Persistence: Git + Dolt + JSONL (Beads/MEOW Stack)
Communication: Mailbox + Queue + Broadcast + Town Wall
Runtime: Custom Go CLI (`gt`) -- 189K LOC
```

### L-Thread Orchestrator: The Workshop

```
+================================================================+
|              L-THREAD ORCHESTRATOR v2.0                          |
|          (Mode-Adaptive, Zero Custom Code)                      |
|                                                                  |
|  +--- Mode Detection ---+                                       |
|  |                       |                                       |
|  v                       v                       v               |
|  +----------------+  +----------------+  +---------------+       |
|  | CONDUIT MODE   |  | TEAMS MODE     |  | TMUX MODE     |      |
|  | (Sequential)   |  | (Parallel)     |  | (Crash-Safe)  |      |
|  |                |  |                |  |               |       |
|  | [Orchestrator] |  | [Orchestrator] |  | [Sessions]    |      |
|  |      |         |  |   /  |  \      |  |  |  |  |      |      |
|  |   [Agent]      |  | [D1][D2][Rev]  |  | [S1][S2][S3]  |      |
|  |  (1 at a time) |  | (peer-to-peer) |  | (persistent)  |      |
|  +----------------+  +----------------+  +---------------+       |
|                                                                  |
|  State: JSON files (_bmad/*.json)                               |
|  Hooks: SessionStart (inject), PreCompact (handoff)             |
|  Recovery: FutureLearnings INC-XXX incident database            |
|  Gate: Chrome DevTools MCP (desktop + mobile E2E)               |
|  Loop: Story -> PR -> Review -> Fix -> Merge -> E2E -> Done     |
+================================================================+

Persistence: JSON state files + tmux sessions
Communication: terminal-write/read (Conduit), SendMessage (Teams)
Runtime: Pure prompt engineering -- 0 lines of custom code
```

### Pi Agent: The Toolkit

```
+================================================================+
|                    PI AGENT ECOSYSTEM                            |
|          (Extension-Based, Multi-Model, Composable)             |
|                                                                  |
|  +--- Extension Layer ---+                                      |
|  |  YAML configs         |                                      |
|  |  Hook system          |                                      |
|  |  pi.appendEntry()     |                                      |
|  |  Session JSONL        |                                      |
|  +------------------------                                      |
|                                                                  |
|  +--- Agent Teams ---+  +--- Agent Chains ---+                  |
|  |                    |  |                    |                  |
|  | [Dispatcher]       |  | [Agent A]          |                  |
|  |   |                |  |    | (output)       |                  |
|  |   +-> [Specialist] |  |    v                |                  |
|  |   +-> [Specialist] |  | [Agent B]          |                  |
|  |   +-> [Specialist] |  |    | (output)       |                  |
|  |                    |  |    v                |                  |
|  | (YAML roster)      |  | [Agent C]          |                  |
|  | (dispatch_agent)   |  |    | (output)       |                  |
|  +--------------------+  |    v                |                  |
|                          | [Final Result]     |                  |
|  +--- Sub-Agents ---+   +--------------------+                  |
|  |                   |                                           |
|  | [Primary Pi]      |  +--- Meta-Agents ---+                   |
|  |   |               |  |                    |                   |
|  |   +-> /sub agent1 |  | [Pi-Pi]            |                   |
|  |   +-> /sub agent2 |  |   |                |                   |
|  |   +-> /sub agent3 |  |   +-> researches   |                   |
|  |                   |  |   +-> builds new    |                   |
|  | (background Pi    |  |       agents        |                   |
|  |  processes)       |  +--------------------+                   |
|  +-------------------+                                           |
|                                                                  |
|  Model routing: flash for scouts, opus for workers              |
|  State: Extension state + session JSONL                         |
|  Recovery: Hooks + damage-control extension                     |
+================================================================+

Persistence: JSONL sessions + extension state
Communication: dispatch_agent tool + /sub spawning
Runtime: ~2K lines of extension code
```

---

## 1. Scale Comparison

### Agent Count Spectrum

```
     1        5        10       20       30      100+
     |--------|---------|--------|--------|--------|
         L-Thread            Gas Town        Wasteland
         (2-5)               (20-30)         (federated)

     Pi Agent: ............[variable, N]..............
               (scales by extension, no fixed ceiling)
```

### Scale Design Decisions

| Decision | Gas Town | L-Thread | Pi Agent |
|----------|----------|----------|----------|
| **Target range** | 20-30 per project | 2-5 per sprint | N per task |
| **Hierarchy depth** | 3-4 levels | 2 levels | 2 levels (dispatcher + workers) |
| **Bottleneck at scale** | Merge conflicts (Refinery solves) | Orchestrator bandwidth | Extension state coherence |
| **Agent identity** | Persistent (Agent Beads) | Ephemeral (fresh per spawn) | Session-scoped |
| **Work distribution** | Competing-consumer queues | Direct assignment | Dispatch routing |
| **Rate limit strategy** | Per-rig token budgets | "Max 3 recommended" | Model-specific routing |

### Why Scale Matters Differently

**Gas Town** treats scale as the primary design constraint. At 20-30 agents, you need hierarchical supervision (Witness), dedicated merge management (Refinery), health monitoring (Deacon), and decentralized communication. Without these, the system collapses under coordination overhead.

**L-Thread** treats reliability as the primary design constraint. At 2-5 agents, the orchestrator can track all conversations, make all merge decisions, and verify all output. The smaller scale is a feature, not a limitation -- it enables deterministic quality gates.

**Pi Agent** treats composability as the primary design constraint. Agent count is not fixed by architecture but by the user's configuration. You compose teams from YAML, chain agents in pipelines, spawn sub-agents with /sub. Scale emerges from composition rather than being designed in.

---

## 2. Communication Patterns

### Topology Comparison

```
GAS TOWN: Decentralized Actor Model
+-------+     +-------+     +-------+
| Agent |<--->| Agent |<--->| Agent |
+---+---+     +---+---+     +---+---+
    |              |              |
    +-----+--------+--------+----+
          |                  |
     [Mailbox]          [Town Wall]
     (direct)           (broadcast)


L-THREAD: Hub-and-Spoke (Conduit/Tmux) or Peer-to-Peer (Teams)

Conduit/Tmux:                  Teams:
    [Orch]                     [Orch]
    / | \                      / | \
  [D] [R] [F]               [D]--[R]
  (all via Orch)             [D]--[F]
                             (peer-to-peer)


PI AGENT: Dispatch Model
    [Primary]
       |
  [dispatch_agent]
    /    |    \
  [S1]  [S2]  [S3]     (dispatch, no inter-agent)

  OR: [A] -> [B] -> [C]  (chain, sequential)

  OR: [Primary]
       +-> /sub [A]     (background, independent)
       +-> /sub [B]
       +-> /sub [C]
```

### Communication Feature Matrix

| Feature | Gas Town | L-Thread | Pi Agent |
|---------|----------|----------|----------|
| **Direct messaging** | Mailbox system | Teams mode only | dispatch_agent |
| **Broadcast** | Channel broadcast | Teams broadcast type | Not built-in |
| **Agent-to-agent** | Full (decentralized) | Teams mode only | Not built-in |
| **Shared log** | Town Wall (append-only) | Devlog (orchestrator-written) | Session JSONL |
| **Async delivery** | Mail on next startup | Teams: yes; others: no | Chain: sequential handoff |
| **Protocol** | Custom Go CLI (`gt`) | Native Claude Code APIs | Extension dispatch |
| **Orchestrator relay** | Optional | Required (Conduit/Tmux) | Required (dispatch) |

### Analysis

Gas Town's communication is the richest because it must be. At 20-30 agents, a hub-and-spoke model creates an unbearable bottleneck. The Mayor cannot relay every message. Agents must coordinate autonomously through mailboxes, queues, and the Town Wall.

L-Thread's communication is mode-dependent. In Conduit and Tmux modes, everything routes through the orchestrator -- which works at 2-5 agents. In Teams mode, agents can message each other directly, which is explicitly called out as the key advantage: "Teammates can message EACH OTHER directly. The orchestrator does not need to relay every message."

Pi Agent's communication is dispatch-oriented. The primary agent sends work to specialists via `dispatch_agent`. In chain mode, output flows sequentially from one agent to the next. Sub-agents spawned via /sub are independent background processes with no built-in inter-agent communication -- they report back to the primary. This is the simplest model, optimized for task decomposition rather than ongoing coordination.

---

## 3. State Management

### State Architecture Comparison

```
GAS TOWN: MEOW Stack (Hierarchical, Versioned)

Formulas (TOML)                    -- Workflow definitions
    |
Protomolecules                     -- Reusable templates
    |
Molecules                          -- Instantiated DAGs
    |
Beads (JSONL)                      -- Atomic work items
    |
Git + Dolt                         -- Versioned persistence
    |
Audit: Full stamp/bead history     -- Traversable graph


L-THREAD: JSON State Machine (Flat, Recoverable)

orchestrator-state.json            -- Current phase + agent
orchestrator-teams-state.json      -- Sprint metrics + PRs
orchestrator-tmux-state.json       -- Session mappings
    |
Hooks: SessionStart + PreCompact   -- Injection + handoff
    |
FutureLearnings (INC-XXX)         -- Incident database
    |
Devlog                            -- Session audit log


PI AGENT: Extension State (Session-Scoped, Append-Only)

pi.appendEntry()                   -- Extension state API
    |
Session JSONL                      -- Conversation + actions
    |
YAML configs                       -- Agent definitions
    |
Hook state                         -- Extension lifecycle
```

### State Feature Matrix

| Feature | Gas Town | L-Thread | Pi Agent |
|---------|----------|----------|----------|
| **Format** | JSONL (Beads) + Dolt DB | JSON files | JSONL sessions + extension state |
| **Persistence** | Git + Dolt (versioned, queryable) | File system | Session files |
| **Workflow model** | DAGs with gates, loops, dependencies | Linear phase machine | Sequential chains or parallel dispatch |
| **Work item tracking** | Beads (6-state lifecycle) | Phase field (6 states) | Extension entries |
| **Audit trail** | Full bead history + stamps | Devlog + recovery log | Session JSONL |
| **Recovery** | Checkpoint resume from Git | SessionStart hook re-injection | Hook-based recovery |
| **Queryability** | SQL via Dolt | `jq` on JSON | Extension API |
| **Cross-session** | Agent Beads carry history | Fresh context per spawn | Session-scoped |
| **Complexity** | Very high | Low | Medium |

### Analysis

**Gas Town's MEOW stack** is a full workflow engine. Molecules express DAGs with gates, loops, and parallel branches. Beads are atomic work units with a six-state lifecycle (Create, Live, Close, Decay, Compact, Flatten). All of this is backed by Git (versioning) and Dolt (SQL queries). It is powerful and complex -- the kind of infrastructure you build when you have 20-30 agents producing hundreds of work items that need to be tracked, audited, and federated across projects.

**L-Thread's JSON files** are a finite state machine. The state tracks one thing: "What phase am I in, and what agent is running?" This is sufficient because the orchestrator loop is linear (story -> PR -> review -> fix -> merge -> E2E -> done) and the agent count is small. Recovery works through hooks: PreCompact saves state before context compaction, SessionStart re-injects it after. Tmux provides the crash-protection layer.

**Pi Agent's extension state** is append-only and session-scoped. The `pi.appendEntry()` API lets extensions persist state across tool calls within a session. Session JSONL captures the full conversation and action history. This is lighter than both alternatives but sufficient because Pi's model is task-oriented (dispatch, execute, return) rather than workflow-oriented.

### The Tradeoff

```
Expressiveness --|-------------------------------------|
                Gas Town                              |
                (DAGs, gates,                         |
                 loops, stamps)                       |
                                                      |
                          Pi Agent                    |
                          (append-only,               |
                           session-scoped)            |
                                                      |
                                    L-Thread          |
                                    (linear phase     |
                                     machine)         |
                                                      |
Simplicity -----|-------------------------------------|
```

Gas Town buys expressiveness at the cost of a 189K-line runtime. L-Thread buys simplicity at the cost of a linear-only workflow. Pi Agent sits in the middle -- more expressive than L-Thread (chains, dispatch, sub-agents) but simpler than Gas Town (no custom database, no DAG engine).

---

## 4. Error Recovery Strategies

### Recovery Philosophy Spectrum

```
Agent-Based              Pattern-Based            Hook-Based
(Gas Town)               (L-Thread)               (Pi Agent)
    |                        |                        |
Supervisor agents        Incident database        Extension hooks
detect and unblock       match symptoms to        trigger on events
autonomously             known fixes              and run recovery

Pro: Handles novel       Pro: Deterministic       Pro: Composable
     failures                 for known issues          and extensible
Con: Expensive           Con: Fails on novel      Con: Must anticipate
     (dedicated agents)       problems                  failure modes
```

### Recovery Mechanisms Compared

| Mechanism | Gas Town | L-Thread | Pi Agent |
|-----------|----------|----------|----------|
| **Detection** | Witness monitors Polecats; Deacon patrols health | Orchestrator observes at loop checkpoints + timeouts | Hooks fire on specific events |
| **Classification** | Implicit (supervisor judgment) | Explicit (Known Issue / Test Failure / Infrastructure / Agent Stuck) | Extension-defined categories |
| **Known-fix lookup** | Mayor judgment + bead history | FutureLearnings INC-XXX database | Damage-control extension patterns |
| **Recovery action** | Witness unblocks; Deacon restarts; Refinery re-imagines | Send fix instructions; respawn agent; skip after 3 attempts | Hook triggers recovery extension |
| **Escalation** | Escalate to Overseer (human) | AUTO-MODE: skip, log, continue | Hook chain; fallback to primary agent |
| **Crash recovery** | Git-backed hooks resume from checkpoint | Tmux persistence + SessionStart hook re-injection | Session JSONL replay |
| **Continuous monitoring** | Yes (Deacon daemon runs patrols) | No (checks only at loop steps) | Event-driven (hooks fire when needed) |
| **Institutional memory** | Bead history, agent identity across sessions | FutureLearnings incident database with root cause + fix + prevention | Extension state persists learnings |

### The L-Thread FutureLearnings Model

L-Thread's approach deserves special attention. The FutureLearnings database is a codified incident response system:

```
INC-001: DB connection hanging     -> Fix: prepare: false
INC-002: Validation schema mismatch -> Fix: Update Zod schema
INC-009: N+1 query problems        -> Fix: JOIN queries
INC-013: Chrome DevTools instability -> Fix: Retry 3x, file-based prompts
INC-014: E2E tests skipped         -> Fix: GATE before Done (never skip)
INC-015: Issues marked Done w/o test -> Fix: Workflow enforcement
```

Each incident has: Symptom, Root Cause, Fix, Prevention checklist, Lessons Learned. When an agent hits a roadblock, the orchestrator searches FutureLearnings for matching patterns and sends specific fix instructions. This is the most systematic approach to error recovery among the three systems.

### The Gas Town Supervisor Model

Gas Town's approach is agent-based rather than pattern-based. The Witness actively supervises Polecats and can reason about novel problems. The Deacon runs continuous health patrols. Dogs handle maintenance. The Refinery can "re-imagine" implementations when merge conflicts become untenable. This is more expensive (dedicated supervisor agents consume tokens) but more capable against novel failures.

### The Pi Agent Hook Model

Pi Agent's approach is event-driven. Extensions define hooks that fire on specific events. The damage-control extension activates when errors are detected. This is the most composable approach -- you can add new recovery behaviors by adding new extensions -- but requires the extension author to anticipate failure modes.

---

## 5. Model Flexibility

### Runtime Support Matrix

| Runtime | Gas Town | L-Thread | Pi Agent |
|---------|----------|----------|----------|
| Claude Code | Yes | **Only** | Yes |
| Codex | Yes | No | Possible via sub-agent |
| Cursor | Yes | No | Possible via extension |
| Gemini | Yes | No | Yes (configurable) |
| GPT-4/o1 | Possible | No | Yes (configurable) |
| Open-source (local) | Possible | No | Yes (configurable) |

### Model Routing Strategies

**Gas Town:** Runtime is configured per-rig in `settings/config.json`. Different rigs can use different AI backends. A Claude-powered rig handles complex architecture while a Gemini-powered rig handles routine refactoring. The `gt` CLI abstracts the runtime, so the orchestration layer does not change.

**L-Thread:** Tightly coupled to Claude Code. Agent spawning uses `claude --dangerously-skip-permissions`. Communication uses Claude Code-specific APIs (Conduit CLI, Teams SendMessage). The orchestrator prompt itself runs in Claude Code. There is no abstraction layer for alternative runtimes.

**Pi Agent:** Model selection is a first-class feature. Different agents can use different models:

```
Scout agent:    -> flash model (fast, cheap, for reconnaissance)
Worker agent:   -> opus model (powerful, for implementation)
Review agent:   -> sonnet model (balanced, for evaluation)
```

This multi-model capability is Pi Agent's most distinctive architectural feature. The dispatcher routes tasks to the right model based on task complexity, cost sensitivity, and required capability.

### Analysis

Pi Agent's model flexibility is the most forward-looking. As model costs decrease and capabilities diversify, the ability to route different tasks to different models (flash for scanning, opus for implementation, local models for sensitive code) becomes a significant advantage.

Gas Town's runtime flexibility is practical but less granular -- it operates at the rig level, not the task level.

L-Thread's Claude Code coupling is a deliberate trade-off: by betting entirely on Claude Code, it gets deep integration with Conduit, Teams, and Chrome DevTools MCP at the cost of runtime portability.

---

## 6. Orchestration Overhead

### Lines of Code Required

```
Gas Town:    189,000 LOC (Go)
             |||||||||||||||||||||||||||||||||||||||||||||||||||
             Custom CLI, Bead engine, MEOW stack, Dolt integration,
             TUI (gt feed), federation protocol, agent lifecycle

L-Thread:    0 LOC (pure prompt engineering)
             |
             Markdown files: orchestrator.md, commands, hooks
             Everything runs through Claude Code's native tools

Pi Agent:    ~2,000 LOC (extension code)
             |||
             Extension framework, dispatch logic, hook system,
             YAML config parsing, session management
```

### Setup Complexity

| Step | Gas Town | L-Thread | Pi Agent |
|------|----------|----------|----------|
| **Install runtime** | Go 1.23+, Dolt, sqlite3, tmux | Claude Code (already installed) | Pi CLI |
| **Install orchestrator** | Build `gt` binary from 189K LOC | Copy markdown files | Install extensions |
| **Configure** | `settings/config.json`, rig setup, Dolt init | Edit project context in prompt | YAML agent definitions |
| **First run** | `gt mayor attach` | `/orchestrator` or start the agent | Configure dispatch roster |
| **Time to first agent** | ~30 minutes | ~5 minutes | ~10 minutes |
| **Maintenance burden** | High (custom Go binary, Dolt, Git worktrees) | Near-zero (prompt files auto-update via symlinks) | Low (extension updates) |

### The Overhead Paradox

Gas Town's 189K lines exist because Yegge discovered that Temporal (enterprise workflow engine) was too heavy for agent orchestration, so he built something lighter. The irony: 189K lines of Go is itself a substantial infrastructure investment. But it buys capabilities that the other systems lack: workflow DAGs, federated state, runtime abstraction, and the full MEOW stack.

L-Thread's zero lines exist because it pushes all complexity into prompt engineering. The orchestrator's behavior -- spawning agents, tracking state, recovering from failures -- is defined entirely in markdown files that Claude Code interprets. This is brilliant in its simplicity but fragile in a different way: the system's behavior depends on the model's ability to follow complex multi-step instructions reliably.

Pi Agent's ~2K lines represent a middle path. Extensions provide structured primitives (dispatch, hooks, state) without building an entire runtime. The framework does the plumbing; the user does the composition.

---

## 7. The Sweet Spot

### Capability vs. Complexity Tradeoff

```
Capability
    ^
    |                                    * Gas Town
    |                                   /
    |                                  /  (189K LOC, $2-5K/mo)
    |                                /
    |                      * Pi Agent
    |                     /
    |                    /  (~2K LOC, model costs)
    |                  /
    |        * L-Thread
    |       /
    |      /  (0 LOC, subscription)
    |     /
    |    /
    |   /
    +--+-----------------------------------------> Complexity
```

### Who is at the Sweet Spot?

**It depends on where you are on the adoption curve.**

**If you are starting today** and need multi-agent orchestration working by tonight: **L-Thread**. Zero setup cost. Copy the markdown files, run `/orchestrator`, and you have an autonomous sprint runner with E2E quality gates. The 2-5 agent ceiling is not a problem because most teams are not yet ready for more.

**If you are a power user** who wants to compose custom agent workflows across models: **Pi Agent**. The extension system lets you build exactly the orchestration you need. Agent Chains for pipeline work. Agent Teams for parallel dispatch. Sub-agents for background tasks. Meta-agents for building new agents. The composability is unmatched.

**If you are scaling to factory-level** with 20-30 agents across multiple projects: **Gas Town**. The infrastructure investment pays for itself at scale. Hierarchical supervision, merge queue management, federated state, and runtime abstraction are not luxuries -- they are requirements at this scale.

### The Sweet Spot Matrix

| Scenario | Best Fit | Why |
|----------|----------|-----|
| Solo dev, single project, Claude Code | L-Thread | Zero overhead, immediate value |
| Small team, multiple models, varied tasks | Pi Agent | Composable, model-flexible |
| Large org, many repos, high throughput | Gas Town | Built for factory scale |
| Quick prototype, test multi-agent concept | L-Thread | Fastest time-to-value |
| Research workflow with expert consultation | Pi Agent | Pi-Pi meta-agent pattern |
| Cross-project federation | Gas Town | Only one with federation protocol |
| Strict quality requirements | L-Thread | Mandatory E2E gates |
| Cost-sensitive, want model routing | Pi Agent | Flash for scouts, opus for workers |

---

## 8. The Convergence Thesis

### Are These Three Converging?

**Yes.** Despite starting from different positions -- factory (Gas Town), workshop (L-Thread), toolkit (Pi Agent) -- all three are moving toward the same target architecture. The evidence:

### The Target Architecture

```
+================================================================+
|              THE CONVERGENT AGENT ORCHESTRATOR                   |
|                                                                  |
|  1. Orchestrator (never writes code)                            |
|  2. Typed agent roles (specialist roster)                       |
|  3. Multi-model dispatch (right model for right task)           |
|  4. Persistent state (survives crashes)                         |
|  5. Quality gates (automated verification)                      |
|  6. Forward progress (skip-and-log on roadblock)                |
|  7. Composable communication (hub-spoke + peer-to-peer)         |
|  8. Institutional memory (learn from past failures)             |
|  9. Scalable hierarchy (supervisors at scale)                   |
| 10. Federation protocol (cross-project coordination)            |
+================================================================+
```

### Where Each System Already Has It

| Convergent Feature | Gas Town | L-Thread | Pi Agent |
|--------------------|----------|----------|----------|
| 1. Orchestrator never codes | Mayor rule | Rule 1 | Dispatcher pattern |
| 2. Typed agent roles | 8+ roles | 4 roles | YAML roster |
| 3. Multi-model dispatch | Per-rig config | -- | Per-agent model selection |
| 4. Persistent state | Git+Dolt MEOW | JSON + tmux | Extension state + JSONL |
| 5. Quality gates | Refinery/PR Sheriffs | E2E Chrome DevTools | Hook-based validation |
| 6. Forward progress | GUPP | AUTO-MODE | Chain auto-advance |
| 7. Composable comms | Mailbox+Queue+Broadcast | Conduit/Teams/Tmux | Dispatch + /sub |
| 8. Institutional memory | Bead history | FutureLearnings INC-XXX | Extension state |
| 9. Scalable hierarchy | Witness/Deacon/Dogs | -- | -- |
| 10. Federation | Wasteland protocol | -- | -- |

### What Each Must Add

**Gas Town needs:**
- Formal quality gates (E2E testing, not just code review)
- Structured incident learning (pattern database, not just supervisor judgment)
- Simpler onboarding (the 189K LOC binary is a barrier)

**L-Thread needs:**
- Multi-model support (break Claude Code coupling)
- Scale beyond 5 agents (hierarchy, supervision, merge queue)
- Cross-project coordination (federation or at least multi-repo)

**Pi Agent needs:**
- Persistent agent identity (across sessions, not just within)
- Hierarchical supervision (Witness/Deacon pattern for scale)
- Formal orchestration loop (structured workflow, not just dispatch)

### The Convergence Timeline

```
2026 Q1 (now):  Three distinct architectures
                 Gas Town = factory | L-Thread = workshop | Pi Agent = toolkit

2026 Q3:         Feature adoption begins
                 Gas Town adds quality gates
                 L-Thread adds model flexibility
                 Pi Agent adds persistent state

2027:            Convergent architecture emerges
                 Standard protocols for agent lifecycle
                 Composable, multi-model, quality-gated
                 Scalable from 1 agent to 100
```

---

## 9. What Each Gets Uniquely Right

### Gas Town: Federation

No other system has attempted to solve cross-project, cross-organization agent coordination. The Wasteland protocol -- with wanted boards, stamps, trust levels, and Dolt-backed federation -- is the most ambitious vision in the agent orchestration space. Key innovations:

- **Wanted Board**: Decentralized work marketplace
- **Stamps**: Multi-dimensional reputation (quality, reliability, creativity scored independently)
- **Trust Levels**: Progressive access (Level 1 registered -> Level 2 contributor -> Level 3 maintainer)
- **The Yearbook Rule**: "You can't stamp your own work" -- structural integrity
- **Dolt backing**: SQL + Git semantics for federated, versioned state

Even if the Wasteland is premature, the concepts it introduces -- portable reputation, federated work discovery, trust-based access -- will become essential as agent orchestration moves beyond single-project scope.

### L-Thread: E2E Quality Gates

No other system enforces end-to-end testing as a structural requirement. L-Thread's INC-014 and INC-015 incidents document the pain that led to this rule: tasks were marked as done without verification, causing regressions. The response was to make E2E testing a non-negotiable gate:

- Chrome DevTools MCP for browser automation
- Desktop AND mobile testing (emulate iPhone 14 Pro, 390px)
- API endpoint testing via curl
- Task reverts to in_progress on E2E failure
- Workflow: Fix -> PR -> Merge -> **E2E TEST** -> Done

This is the hardest-won lesson in the L-Thread system, encoded as scar tissue in the rules. The incident database approach -- documenting failures with root cause, fix, and prevention -- creates institutional memory that improves over time.

### Pi Agent: Composability

No other system offers the same degree of compositional flexibility. Pi Agent's extension architecture enables four distinct multi-agent patterns that can be mixed and matched:

1. **Agent Teams**: Dispatcher routes to specialist roster defined in YAML
2. **Agent Chains**: Sequential pipeline where output feeds next input
3. **Sub-agents**: /sub spawns independent background Pi processes
4. **Meta-agents**: Pi-Pi builds new agents using parallel expert research

The multi-model routing is the killer feature: scout agents on flash (fast, cheap) for reconnaissance, worker agents on opus (powerful) for implementation, review agents on sonnet (balanced) for evaluation. This cost-performance optimization is impossible in systems locked to a single model.

The Pi-Pi meta-agent pattern -- where Pi builds new Pi agents using parallel expert research -- is the most recursive and self-improving pattern among the three systems.

---

## Complete Feature Matrix

| Feature | Gas Town | L-Thread | Pi Agent |
|---------|:--------:|:--------:|:--------:|
| **Architecture** | | | |
| Agent scale target | 20-30+ | 2-5 | N (extensible) |
| Custom codebase | 189K LOC Go | 0 LOC | ~2K LOC |
| Agent roles | 8+ specialized | 4 generic | N (YAML-defined) |
| Hierarchy depth | 3-4 levels | 2 levels | 2 levels |
| **Communication** | | | |
| Agent-to-agent | Full (decentralized) | Teams mode only | Not built-in |
| Broadcast | Channel broadcast | Teams broadcast | Not built-in |
| Shared log | Town Wall | Devlog | Session JSONL |
| Protocol | Custom `gt` CLI | Native Claude Code | Extension dispatch |
| **State** | | | |
| Format | JSONL + Dolt DB | JSON files | JSONL + extension state |
| Workflow model | DAGs (gates, loops) | Linear phase machine | Chains/dispatch |
| Crash recovery | Git checkpoint resume | Tmux + SessionStart hook | Hook-based recovery |
| Cross-session identity | Agent Beads (persistent) | None (ephemeral) | Session-scoped |
| **Quality** | | | |
| E2E testing gate | Not emphasized | **Mandatory** (Chrome DevTools) | Hook-based |
| Mobile testing | Not built-in | iPhone 14 Pro emulation | Not built-in |
| Code review | Crew/PR Sheriffs | Dedicated review agent | Extension-defined |
| Bounded retry | Not explicit | Max 3 review-fix cycles | Not explicit |
| **Recovery** | | | |
| Detection | Supervisor agents | Orchestrator + timeouts | Event hooks |
| Institutional memory | Bead history | FutureLearnings INC-XXX | Extension state |
| Auto-skip on failure | Escalate to human | Skip after 3 attempts | Hook chain |
| Health monitoring | Continuous (Deacon) | Loop checkpoints only | Event-driven |
| **Model Support** | | | |
| Claude | Yes | **Only** | Yes |
| Codex/GPT | Yes | No | Yes |
| Gemini | Yes | No | Yes |
| Per-task model routing | Per-rig | No | **Per-agent** |
| Open-source models | Possible | No | Yes |
| **Advanced** | | | |
| Federation | Wasteland protocol | None | None |
| Reputation system | Stamps + trust levels | None | None |
| Merge queue | Refinery agent | `gh pr merge` | Not built-in |
| Workflow templates | Formulas/Protomolecules | None (hardcoded loop) | YAML configs |
| Meta-agent (self-building) | Not documented | None | Pi-Pi pattern |
| Cost tracking | Per-rig budget | None | Model-aware routing |
| Monitoring UI | `gt feed` TUI | Conduit pane layout | Pi CLI output |

---

## Architecture Diagrams

### Communication Flow Comparison

```
=== GAS TOWN: Full Mesh with Supervisor Oversight ===

    [Mayor]--------[Overseer]
     / | \
    /  |  \
[Wit] [Ref] [Dea]          Wit = Witness
  |     |     |              Ref = Refinery
  |     |     +--[Dog1]     Dea = Deacon
  |     |     +--[Dog2]
  |     |
  +--[P1]<---->[P2]        P = Polecats
  |   ^          ^           (can message each other
  |   |          |            via mailbox system)
  +--[P3]<-->[Crew1]
       ^         ^
       |         |
       +---------+
       Town Wall (broadcast)


=== L-THREAD: Mode-Dependent Topology ===

Conduit Mode:          Teams Mode:          Tmux Mode:
  [Orch]               [Orch]               [Orch]
    |                  / | \                   |
    v                 /  |  \                  v
  [Dev]            [D1] [D2] [Rev]         [tmux-S1]
    |               \   / \  /               [tmux-S2]
    v                \ /   \/                [tmux-S3]
  [Rev]              X    X
    |               / \  / \
    v             [D1]-[D2]-[Rev]
  [Fix]           (peer-to-peer)
  (sequential)                             (persistent)


=== PI AGENT: Dispatch + Chain + Sub-Agent Patterns ===

Teams:              Chains:              Sub-Agents:
  [Dispatcher]        [A]                  [Primary]
   / | \               |                    / | \
  /  |  \          (output)               /  |  \
[S1][S2][S3]           v              [/sub][/sub][/sub]
(parallel)           [B]              [a1]  [a2]  [a3]
                       |              (background processes,
                   (output)            report back to primary)
                       v
                     [C]
                       |
                   (result)

Meta-Agent:
  [Pi-Pi]
   / | \
  /  |  \
[Expert1][Expert2][Expert3]    (parallel research)
      \     |     /
       \    |    /
    [Synthesized New Agent]    (Pi-Pi builds agents)
```

### Error Recovery Flow Comparison

```
=== GAS TOWN ===
Agent stuck -> Witness detects -> Witness unblocks
                                    |
                              (if still stuck)
                                    v
                              Deacon detects -> restart/reassign
                                    |
                              (if irrecoverable)
                                    v
                              Escalate to Overseer (human)


=== L-THREAD ===
Agent stuck -> Orchestrator observes (at loop checkpoint)
                    |
                    v
              Classify roadblock
                    |
                    v
              Search FutureLearnings for INC-XXX match
                    |
              +-----+------+
              |            |
           (match)     (no match)
              |            |
              v            v
        Send fix       General troubleshooting
        instructions        |
              |            v
              v      Spawn recovery agent
        Agent recovers?     |
              |            v
        +-----+-----+   Skip (AUTO-MODE)
        |           |    Log to devlog
      (yes)       (no)  Continue
        |           |
        v           v
     Continue    Respawn fresh agent
                    |
                 (3 attempts)
                    |
                    v
                 Skip, log, continue


=== PI AGENT ===
Agent error -> Hook fires -> damage-control extension activates
                                   |
                                   v
                            Extension runs recovery logic
                                   |
                            +------+------+
                            |             |
                         (resolved)    (failed)
                            |             |
                            v             v
                         Continue     Fallback to
                                     primary agent
```

---

## When to Use Which

### Decision Tree

```
Do you need multi-agent orchestration?
    |
    +-- No --> Single agent is fine
    |
    +-- Yes --> How many agents?
                  |
                  +-- 1-5 agents --> Do you need multi-model support?
                  |                    |
                  |                    +-- No --> L-Thread Orchestrator
                  |                    |          (zero setup, E2E gates,
                  |                    |           crash recovery)
                  |                    |
                  |                    +-- Yes --> Pi Agent
                  |                               (composable, multi-model,
                  |                                extension-based)
                  |
                  +-- 5-20 agents --> Do you need cross-project federation?
                  |                    |
                  |                    +-- No --> Pi Agent (scaled)
                  |                    |          or Gas Town (light config)
                  |                    |
                  |                    +-- Yes --> Gas Town
                  |                               (federation, reputation,
                  |                                Wasteland protocol)
                  |
                  +-- 20+ agents --> Gas Town
                                     (hierarchical supervision,
                                      merge queue, health daemon,
                                      factory infrastructure)
```

### Quick Decision Guide

| If you value... | Choose |
|-----------------|--------|
| Fastest setup, zero infrastructure | L-Thread |
| Composable agent workflows | Pi Agent |
| Factory-scale throughput | Gas Town |
| Mandatory E2E quality gates | L-Thread |
| Multi-model cost optimization | Pi Agent |
| Cross-project federation | Gas Town |
| Agent self-improvement (meta-agents) | Pi Agent |
| Crash-proof session persistence | L-Thread |
| Rich agent role taxonomy | Gas Town |
| UNIX-philosophy composition | Pi Agent |

---

## The Road Ahead

### What the Three-Way Comparison Reveals

1. **The five universal laws are real.** Independent discovery by three systems, three developers, three philosophies. The orchestrator-never-codes rule, crash-persistent state, automated forward progress, structured roles, and quality gates are not preferences -- they are structural requirements.

2. **The sweet spot is moving.** Today, L-Thread's simplicity wins for most users. In six months, as model costs drop and capabilities improve, the sweet spot will shift toward Pi Agent's composability. In twelve months, Gas Town's scale will become relevant to more organizations.

3. **Composability is the deepest insight.** Pi Agent's extension architecture -- where you compose multi-agent patterns from reusable primitives rather than building monolithic orchestrators -- is the most forward-looking design. Gas Town's scale and L-Thread's discipline will eventually need to be delivered through composable primitives, not fixed architectures.

4. **Multi-model is inevitable.** Pi Agent is ahead here. As flash models handle reconnaissance, opus models handle implementation, and local models handle sensitive code, the ability to route tasks to the right model becomes a core architectural requirement, not a nice-to-have.

5. **Quality gates are non-negotiable.** L-Thread learned this the hard way (INC-014, INC-015). Gas Town will learn it too. Pi Agent's hook system can implement it. Every mature orchestration system will enforce automated verification before marking work as done.

6. **Federation is the endgame.** Gas Town is the only system thinking about this, and it is thinking about it seriously. When agent orchestration moves beyond single-project scope -- and it will -- the Wasteland's concepts (wanted boards, stamps, trust levels, Dolt-backed federation) will become the conversation.

### The Convergent Future

In eighteen months, the lines between these three systems will blur. The winning orchestration architecture will combine:

- **Gas Town's scale and federation** (hierarchical supervision, merge queue, Wasteland protocol)
- **L-Thread's discipline and quality** (E2E gates, incident learning, tiered context)
- **Pi Agent's composability and model flexibility** (extension architecture, multi-model dispatch, meta-agents)

The question is not which system wins. The question is which system absorbs the others' innovations fastest.

---

## Sources

### Gas Town / Wasteland
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) -- Steve Yegge, January 2026
- [The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c) -- Steve Yegge, January 2026
- [Welcome to the Wasteland: A Thousand Gas Towns](https://steve-yegge.medium.com/welcome-to-the-wasteland-a-thousand-gas-towns-a5eb9bc8dc1f) -- Steve Yegge, March 2026

### L-Thread Orchestrator
- `.claude/agents/orchestrator.md` -- Custom Agent definition (v2.0)
- `.claude/commands/orchestrator.md` -- Conduit Mode command
- `.claude/commands/orchestrator-teams.md` -- Teams Mode command
- `.claude/commands/roadblock-recovery.md` -- Roadblock Recovery command
- `.claude/commands/tmux-recovery.md` -- Tmux Recovery command
- `CHANGELOG.md` -- Version history

### Pi Agent
- [indydevdan Pi Agent](https://github.com/nichochar/pi-agent) -- Dan's extension-based multi-agent system
- Agent Teams, Agent Chains, Sub-agents, Meta-agents documentation
- Extension framework: dispatch_agent, pi.appendEntry(), hook system

---

*Compiled 2026-03-05. Total analysis: ~5,500 words across 15 sections with 12 comparison tables and 6 architecture diagrams.*
