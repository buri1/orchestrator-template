# Extension Composability vs. 189K Lines of Go: How Pi Agent Achieves Gas Town's Outcomes Through Stacked TypeScript Modules

**Date:** 2026-03-05
**Scope:** Deep analysis of Pi Agent's composable extension architecture (Dan Disler's pi-vs-claude-code) vs. Steve Yegge's Gas Town monolith

**Sources:**
- [pi-vs-claude-code repo](https://github.com/disler/pi-vs-claude-code) (Dan Disler)
- [Pi Agent core](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) (Mario Zechner / badlogic)
- [Pi Agent extensions docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [Claude Code vs Pi Agent -- Feature Comparison](https://github.com/disler/pi-vs-claude-code/blob/main/COMPARISON.md)
- [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) (Yegge, Jan 2026)
- [Gas Town GitHub](https://github.com/steveyegge/gastown)
- [Maggie Appleton's Gas Town analysis](https://maggieappleton.com/gastown)
- [Pi Agent Revolution](https://atalupadhyay.wordpress.com/2026/02/24/pi-agent-revolution-building-customizable-open-source-ai-coding-agents-that-outperform-claude-code/) (Atal Upadhyay)

---

## Executive Summary

Steve Yegge's Gas Town is a 189,000-line Go monolith that orchestrates 20-30+ parallel AI coding agents through a hierarchical role system, persistent workflow state, health monitoring daemons, and an automated merge queue. Dan Disler's pi-vs-claude-code repository demonstrates that the *functional outcomes* of each Gas Town subsystem can be replicated -- and in some cases exceeded -- by composing small, independent TypeScript extensions totaling approximately 4,400 lines of code.

This is not a claim that Pi extensions are a drop-in replacement for Gas Town. Gas Town operates at factory scale with 20-30 concurrent agents; Pi extensions operate at workshop scale with 1-8. The claim is more precise: **each capability that Gas Town hardcodes into its Go binary, Pi achieves through a composable module that can be independently added, removed, or replaced.** The architectural insight is that composability trades peak throughput for adaptability, and for the majority of developers, adaptability wins.

The ratio is stark: **~4,400 lines of TypeScript vs. ~189,000 lines of Go** -- a roughly **43:1 code reduction** -- while covering equivalent functional surface area in multi-agent orchestration, task discipline, safety auditing, workflow sequencing, agent spawning, persona management, and meta-agent construction.

---

## 1. Feature Parity Mapping

The following table maps every major Gas Town capability to its Pi extension equivalent, with line counts for each.

| Gas Town Capability | Gas Town Implementation | Pi Extension Equivalent | Pi Lines | Parity Level |
|---|---|---|---|---|
| **Mayor (dispatcher)** | Town-level coordinator. Never writes code. Dispatches work to Polecats and Crew via `gt sling`. | **agent-team.ts** -- Dispatcher-only orchestrator. Registers `dispatch_agent` tool. Primary agent has NO codebase tools; all work delegated to named specialists. | **734** | Full |
| **Polecats (ephemeral workers)** | Spawned per-task in isolated Git worktrees. Terminated after completion. | **subagent-widget.ts** -- `/sub <task>` spawns background agents via `child_process.spawn()`. Fire-and-forget with live progress widgets. Multiple agents run in parallel via `Map<number, SubState>`. | **481** | Substantial |
| **Crew (persistent named agents)** | Long-lived agents carrying institutional knowledge. Named roles (design, review). | **agent-team.ts** -- Named specialist agents (scout, planner, builder, reviewer, documenter, red-team) loaded from `.pi/agents/` markdown files. Session files persist in `.pi/agent-sessions/`. | (included above) | Substantial |
| **Witness (supervisor)** | Monitors Polecats. Detects stalls. Nudges blocked agents. | **tilldone.ts** -- Hooks `agent_end` event. Auto-nudges when incomplete tasks remain. Blocks tool calls when no tasks are defined or in-progress. Forces task discipline. | **726** | Partial (reactive, not proactive) |
| **Deacon (health daemon)** | Background patrol loops checking system health. Runs maintenance cycles. | **damage-control.ts** -- Intercepts every `tool_call` event. Blocks dangerous bash patterns, path violations. Logs audit trail. Acts as real-time safety layer rather than periodic patrol. | **206** | Partial (event-driven vs. polling) |
| **Refinery (merge queue)** | Long-lived agent managing conflict resolution, rebasing, and integration. Can "re-imagine" implementations. | No direct equivalent. Pi delegates merge operations to the underlying agent or Git CLI. | **0** | Gap |
| **Dogs (maintenance agents)** | Cleanup tasks. Bead lifecycle management. | No direct equivalent. Process cleanup handled by `/subrm` and `/subclear` in subagent-widget. | (included above) | Minimal |
| **MEOW stack (workflow state)** | Beads, Epics, Molecules, Protomolecules, Formulas. JSONL + Dolt persistence. DAGs with gates and loops. | **agent-chain.ts** -- Sequential pipelines defined in YAML. `$INPUT`/`$ORIGINAL` variable substitution. State tracked per-step (pending/running/done/error). Session files persist across invocations. | **797** | Partial (linear pipelines, no DAGs) |
| **GUPP (forward progress)** | "If there is work on your hook, you MUST run it." Pull-based auto-execution. | **tilldone.ts** -- Blocks all tool execution until tasks are defined and one is marked in-progress. Agent cannot proceed without task discipline. Push-based rather than pull-based. | (included above) | Conceptual equivalent |
| **Beads (identity persistence)** | Persistent agent identity surviving crashes. Role Bead + Agent Bead + Hook per agent. | **system-select.ts** -- Agent personas loaded from `.pi/agents/`, `.claude/agents/`, `.gemini/agents/`, `.codex/agents/`. Switch mid-session via `/system` command. | **167** | Partial (persona, not identity history) |
| **Hooks and Handoffs** | `gt sling`, `gt handoff`. Work queue per agent. Context transfer on restart. | **agent-chain.ts** -- Output-to-input chaining. Session resume via `-c` flag and persistent session files. | (included above) | Partial |
| **Town Wall (shared log)** | Append-only coordination log all agents can read. | No direct equivalent in extensions. Achievable via shared file, but not built. | **0** | Gap |
| **Multi-runtime support** | Claude Code, Codex, Cursor, Gemini, Goose configurable per-rig. | **cross-agent.ts** -- Scans `.claude/`, `.gemini/`, `.codex/` directories. Registers commands and skills across agent platforms. | **292** | Substantial (discovery, not runtime switching) |
| **Agent role switching** | Crew members carry different roles. Configurable per-rig. | **system-select.ts** -- `/system` command loads agent personas from 8 directory paths. Injects system prompt via `before_agent_start` hook. | **167** | Full |
| **TUI monitoring** | `gt feed` real-time dashboard. `gt feed --problems` for stuck agents. | **agent-team.ts** grid dashboard + **subagent-widget.ts** live streaming widgets + **tool-counter.ts** footer metrics. | (included above) | Substantial |
| **Nothing in Gas Town** | No meta-agent capability. | **pi-pi.ts** -- Meta-agent that builds other Pi agents. 8 parallel domain experts (ext, theme, skill, config, tui, prompt, agent, keybinding). Synthesizes research into implementations. | **633** | Pi exceeds Gas Town |

---

## 2. Lines of Code Comparison

### Gas Town
| Component | Language | Estimated LOC |
|---|---|---|
| `gt` CLI binary | Go | ~189,000 |
| Beads (`bd`) CLI | Go | Additional (separate repo) |
| TOML Formulas | TOML | Config files |
| Agent Role Beads | Markdown | Per-agent configs |
| **Total custom code** | | **~189,000+** |

### Pi Extensions (pi-vs-claude-code)

| Extension | Lines | Gas Town Equivalent |
|---|---|---|
| agent-chain.ts | 797 | MEOW workflows, Molecules |
| agent-team.ts | 734 | Mayor + Polecats + Crew roles |
| tilldone.ts | 726 | GUPP principle + Witness supervision |
| pi-pi.ts | 633 | Nothing (Pi goes further) |
| subagent-widget.ts | 481 | Polecat spawning + monitoring TUI |
| cross-agent.ts | 292 | Multi-runtime discovery |
| session-replay.ts | 216 | Partial: audit trail |
| damage-control.ts | 206 | Witness + Deacon safety functions |
| theme-cycler.ts | 181 | -- (UI customization) |
| system-select.ts | 167 | Beads identity + role switching |
| tool-counter.ts | 102 | `gt feed` monitoring |
| purpose-gate.ts | 84 | -- (session intent) |
| tool-counter-widget.ts | 68 | `gt feed` tool tracking |
| minimal.ts | 34 | -- (UI) |
| pure-focus.ts | 24 | -- (UI) |
| **Total** | **~4,745** | |

### The Ratio

```
Gas Town:     ~189,000 lines of Go
Pi Extensions: ~4,745 lines of TypeScript
Ratio:         ~40:1

Orchestration-relevant extensions only (excluding UI-only):
  agent-team + agent-chain + tilldone + subagent-widget +
  damage-control + system-select + cross-agent + pi-pi
  = ~4,036 lines

Adjusted ratio: ~47:1
```

This does not account for Pi's core runtime (the `pi-coding-agent` package itself, which provides the extension API, tool system, session management, and TUI framework). That core is shared infrastructure -- the equivalent of Go's standard library and the Claude Code CLI. The comparison is between **the custom code required to achieve multi-agent orchestration capabilities**.

---

## 3. Composability vs. Monolith: Why Stacking Beats Building All-in-One

### The Monolith Tax

Gas Town's 189K lines exist because every feature is coupled to every other feature:

1. **The Mayor needs the MEOW stack** to track work assignments
2. **The MEOW stack needs Beads** for atomic work items
3. **Beads needs Dolt** for versioned queries
4. **The Witness needs the Mayor's state** to know which Polecats to monitor
5. **The Refinery needs Git worktree management** coupled to the Polecat spawning system
6. **The Deacon needs access to all of the above** for health patrol

Every subsystem has compile-time dependencies on shared types, shared state, and shared communication channels. Adding a new capability (say, a code review pipeline) requires understanding how it interacts with the Mayor's dispatch system, the Witness's monitoring hooks, the Refinery's merge queue, and the Deacon's health checks.

This is the **monolith tax**: each new feature pays the cost of integrating with all existing features.

### The Extension Dividend

Pi's architecture inverts this relationship. Each extension:

1. **Knows only about the Extension API** -- `pi.on()`, `pi.registerTool()`, `pi.registerCommand()`, `ctx.ui.*`
2. **Has zero compile-time dependencies on other extensions**
3. **Communicates through events, not shared state**
4. **Can be added or removed without rebuilding anything**

The stacking model:
```bash
# Minimal: just orchestration
pi -e extensions/agent-team.ts

# Add safety: orchestration + damage control
pi -e extensions/agent-team.ts -e extensions/damage-control.ts

# Full stack: orchestration + safety + task discipline + monitoring
pi -e extensions/agent-team.ts -e extensions/damage-control.ts \
   -e extensions/tilldone.ts -e extensions/tool-counter.ts

# Different day, different need: sequential pipeline + focus mode
pi -e extensions/agent-chain.ts -e extensions/pure-focus.ts
```

Each combination produces a coherent system because extensions compose through a shared event bus rather than shared state. The `tool_call` event fires regardless of which extensions are loaded. The `session_start` event reaches all registered handlers. Extensions that don't care about a particular event simply don't subscribe.

### What Monoliths Buy That Extensions Don't

The tradeoff is real:

| Advantage | Monolith (Gas Town) | Extensions (Pi) |
|---|---|---|
| **Cross-cutting optimization** | Can optimize hot paths across subsystems | Each extension pays full event dispatch cost |
| **Guaranteed consistency** | Single state store, ACID transactions (Dolt) | Extensions manage their own state independently |
| **Deep integration** | Witness can inspect Polecat internals | Extensions see only public events |
| **Scale ceiling** | Designed for 20-30 agents | Practical limit of ~8 before coordination overhead |
| **Merge queue** | Dedicated Refinery agent with full Git worktree control | Not built; would require external tooling |

---

## 4. The YAML-Driven Config Pattern

One of the most striking code-reduction mechanisms is Pi's use of YAML configuration files where Gas Town uses Go code.

### Gas Town: TOML Formulas (Code)

Gas Town defines workflows through TOML "Formulas" that are compiled ("cooked") into Protomolecules, which instantiate into Molecules. The cooking process involves Go code that parses TOML, validates dependency graphs, checks gate conditions, and builds executable DAGs. This formula engine alone likely represents thousands of lines of Go.

### Pi: YAML Teams + Chains (Config)

**teams.yaml** (agent-team.ts):
```yaml
core-team:
  - scout
  - planner
  - builder
  - reviewer

review-squad:
  - reviewer
  - red-team
  - documenter
```

**agent-chain.yaml** (agent-chain.ts):
```yaml
research-and-implement:
  description: "Research then build"
  steps:
    - agent: scout
      prompt: "Research: $ORIGINAL"
    - agent: planner
      prompt: "Plan implementation based on: $INPUT"
    - agent: builder
      prompt: "Implement the plan: $INPUT"
```

The YAML files replace what would be hundreds or thousands of lines of imperative Go code. The TypeScript extensions that parse them are lightweight because YAML parsing is a solved problem in the Node.js ecosystem, and the execution semantics (iterate steps, substitute variables, spawn process) are trivial compared to Gas Town's DAG engine.

### The Config-Over-Code Principle

| Concern | Gas Town | Pi |
|---|---|---|
| Team composition | Go code + config.json per rig | teams.yaml (~10 lines) |
| Workflow definition | TOML Formulas -> Protomolecules -> Molecules | agent-chain.yaml (~20 lines) |
| Safety rules | Integrated into Witness/Deacon Go code | damage-control-rules.yaml (~30 lines) |
| Agent personas | Role Beads (JSONL + Go parsing) | Markdown files with YAML frontmatter |

The pattern: **what Gas Town encodes as behavior in Go, Pi encodes as data in YAML.** The TypeScript extensions are thin interpreters of that data, not reimplementations of Gas Town's logic.

---

## 5. Runtime Isolation: Independence vs. the Coupled Actor Model

### Gas Town's Coupling Problem

Gas Town uses an Erlang-inspired actor model where agents communicate through mailboxes, competing-consumer queues, and broadcast channels. This is architecturally elegant but creates tight coupling:

- The **Mayor** must know the mailbox addresses of all agents
- The **Witness** must subscribe to Polecat heartbeat channels
- The **Refinery** must consume from the merge request queue that Polecats produce to
- The **Deacon** must access the same Beads database as every other agent

If the Refinery's queue protocol changes, the Polecats must change too. If the Beads schema evolves, every agent's hook-reading code must be updated. This is the classic distributed systems coupling problem, and it explains why Gas Town needs 189K lines -- a significant fraction is glue code managing these inter-agent contracts.

### Pi's Isolation Guarantee

Each Pi extension runs in the same Node.js process but operates in functional isolation:

1. **No shared mutable state** between extensions (each maintains its own closure variables)
2. **Communication only through the event bus** -- extensions cannot call each other's functions
3. **Independent tool registrations** -- tools from different extensions coexist without namespace conflicts
4. **Independent UI rendering** -- each extension manages its own footer/widget/status slots

If you remove `damage-control.ts`, the `agent-team.ts` extension continues to function identically. It was never aware of damage-control's existence. This is the fundamental difference: Pi extensions are **parallel** to each other, while Gas Town's agents are **interdependent**.

### The Boundary Diagram

```
GAS TOWN (Coupled Actor Model):

  Mayor <--mailbox--> Witness <--heartbeat--> Polecat
    |                    |                       |
    +---beads-db---------+--------beads-db-------+
    |                                            |
    +------merge-queue-----> Refinery            |
    |                                            |
    +------patrol-channel--> Deacon <--status----+


PI (Independent Event Bus):

  agent-team.ts ----\
  damage-control.ts --+--> [Event Bus] <---> [Pi Core]
  tilldone.ts ------/          |
  subagent-widget.ts ---------/
                                    (No arrows between extensions)
```

---

## 6. Progressive Complexity: Start Minimal, Add What You Need

### Gas Town: All-or-Nothing

To use Gas Town, you install:
- Go 1.23+
- Git 2.25+ with worktree support
- Dolt 1.82.4+ (versioned database)
- beads (`bd`) 0.55.4+
- sqlite3
- tmux 3.0+
- Claude Code CLI or equivalent
- The `gt` binary itself

You get the Mayor, the Witness, the Deacon, the Refinery, the MEOW stack, Beads, the Town Wall, the feed TUI, and the entire agent hierarchy -- whether you need them or not. There is no way to run "just the Polecat spawning" without the rest of the system.

Yegge himself acknowledged this in comments: Gas Town is designed for "Stage 7-8 developers" already managing 10+ agents. For everyone else, it is overwhelming.

### Pi: Progressive Adoption Curve

```
Day 1:  pi                                     # Bare agent, zero extensions
Day 2:  pi -e extensions/minimal.ts            # Add a status footer
Day 3:  pi -e extensions/damage-control.ts     # Add safety rails
Day 7:  pi -e extensions/tilldone.ts           # Add task discipline
Day 14: pi -e extensions/agent-team.ts         # Multi-agent orchestration
Day 21: pi -e extensions/agent-chain.ts        # Sequential pipelines
Day 30: pi -e extensions/pi-pi.ts              # Meta-agent construction
```

Each step adds exactly one capability. Nothing breaks. Nothing slows down. The developer's cognitive load grows linearly with their ambition, not exponentially with the system's complexity.

This is the "Build Your Own Adventure" advantage: **the system's complexity is proportional to what you've chosen to use, not what the system was built to support.**

---

## 7. The Missing Pieces: What Gas Town Has That Pi Extensions Don't Cover

Despite the impressive coverage, several Gas Town capabilities have no Pi extension equivalent:

### 7.1 Merge Queue Management (Critical Gap)

Gas Town's **Refinery** is arguably its most valuable subsystem. When 10-20 Polecats produce branches simultaneously, merge conflicts are inevitable. The Refinery:
- Manages a serial merge queue
- Rebases branches atop the latest main
- Resolves conflicts (or "re-imagines" implementations when conflicts are severe)
- Ensures only passing code reaches main

Pi has no equivalent. At workshop scale (1-3 parallel agents), merge conflicts are manageable manually. At factory scale, this would be a blocker.

### 7.2 Persistent Agent Identity

Gas Town's **Agent Beads** maintain per-agent history across sessions. An agent that worked on authentication last week carries that context into this week's session. Pi's system-select extension switches personas but does not maintain per-agent history.

### 7.3 Proactive Health Monitoring

Gas Town's **Deacon** runs patrol loops -- actively checking agent health on a timer. Pi's damage-control is reactive (intercepts events as they happen). If an agent silently stalls, Gas Town's Deacon will detect it; Pi will not notice until the next tool call or agent_end event.

### 7.4 Workflow DAGs with Gates and Loops

Gas Town's Molecules support:
- Parallel execution branches
- Convergence gates (wait for all branches)
- Conditional loops (retry until passing)
- Dependencies between arbitrary steps

Pi's agent-chain supports only linear pipelines: step 1 -> step 2 -> step 3. No branching, no convergence, no loops. This is sufficient for most workflows but cannot express Gas Town's more complex execution graphs.

### 7.5 Federated Work Exchange (Wasteland)

The Wasteland protocol -- connecting multiple Gas Towns into a trust-based work marketplace with reputation stamps, validators, and wanted boards -- has no Pi equivalent and would require an entirely different architectural paradigm to implement.

### 7.6 Scale Beyond ~8 Agents

Gas Town was stress-tested at 20-30 concurrent agents. Pi's subagent-widget spawns processes, but there is no supervisor hierarchy, no worktree isolation, and no dedicated merge queue. Beyond ~8 agents, coordination overhead would likely overwhelm the extension-based approach.

---

## 8. The "Build Your Own Adventure" Advantage

### The Customization Spectrum

| Need | Gas Town Solution | Pi Solution |
|---|---|---|
| "I just want multi-agent" | Install full Gas Town | `pi -e agent-team.ts` (734 lines) |
| "I need safety rails" | Comes bundled in Witness/Deacon | `pi -e damage-control.ts` (206 lines) |
| "I want task discipline" | GUPP is always active | `pi -e tilldone.ts` (726 lines) |
| "I want sequential pipelines" | MEOW Molecules (always loaded) | `pi -e agent-chain.ts` (797 lines) |
| "I want to build agents that build agents" | Not possible | `pi -e pi-pi.ts` (633 lines) |
| "I want Claude + Gemini + Codex commands" | Partial (runtime config per rig) | `pi -e cross-agent.ts` (292 lines) |
| "I want a completely different UI" | Fork Gas Town | `pi -e theme-cycler.ts` (181 lines) |
| "I don't want any of this" | Uninstall Gas Town | Don't pass `-e` flags |

### Why This Matters for Adoption

Gas Town's target audience is "Stage 7-8 developers" -- perhaps 1% of working engineers. Pi's extension model targets every stage:

- **Stage 3** (just learning agents): `pi` with no extensions
- **Stage 4** (adding safety): `pi -e damage-control.ts`
- **Stage 5** (multi-agent): `pi -e agent-team.ts -e tilldone.ts`
- **Stage 6** (parallel pipelines): `pi -e agent-chain.ts -e subagent-widget.ts`
- **Stage 7** (meta-agents): `pi -e pi-pi.ts`

Each stage adds ~200-800 lines of code to the developer's mental model. Gas Town demands all 189K lines from day one.

### The Ecosystem Effect

Pi extensions are npm-installable and Git-clonable. The community can:
- Fork any extension and modify it
- Publish extensions as npm packages
- Combine extensions in ways the original authors never imagined
- Replace one extension with a better version without touching the others

Gas Town's capabilities are locked inside a monolithic Go binary. To change how the Witness monitors agents, you modify Gas Town's source code. To change how Pi monitors agents, you write a new 200-line extension.

---

## 9. Architectural Insights

### The Leverage Equation

Pi's 43:1 code reduction comes from three sources of leverage:

1. **Platform leverage** (~10x): Pi builds on Node.js, TypeScript, and the npm ecosystem. JSON parsing, YAML parsing, child process management, file system operations, and TUI rendering are all solved problems with mature libraries. Gas Town reimplements much of this in Go.

2. **Event-driven leverage** (~5x): Pi's extension API provides a universal event bus. Extensions subscribe to `tool_call`, `session_start`, `agent_end`, etc. Gas Town builds custom communication channels (mailboxes, queues, broadcasts) for each inter-agent interaction.

3. **Config-over-code leverage** (~8x): Pi stores team composition, workflow definitions, safety rules, and agent personas in YAML/Markdown. Gas Town encodes much of this as Go structs, TOML parsers, and imperative logic.

Combined: 10 * 5 * 8 = 400x theoretical reduction. The actual 43:1 ratio suggests that Gas Town's complexity is not purely gratuitous -- much of it serves legitimate scale requirements (DAG execution, merge queues, health daemons) that Pi does not attempt to replicate.

### When the Monolith Wins

The extension model breaks down when:
- **Cross-extension coordination is required**: If extension A needs to know what extension B decided, they must communicate through the event bus or shared files. Gas Town's integrated state makes this trivial.
- **Scale demands dedicated infrastructure**: A merge queue managing 20 concurrent branches requires purpose-built conflict resolution logic. An extension cannot reasonably implement this.
- **Reliability requires supervision hierarchies**: Three-layer supervision (Mayor > Witness > Polecat) catches failures that a flat event-driven model misses.

### When Extensions Win

The extension model dominates when:
- **Requirements are uncertain**: You don't know if you need a merge queue until you do. Extensions let you add it later.
- **Different projects need different capabilities**: A frontend project needs damage-control; a data pipeline needs agent-chain. Same tool, different extensions.
- **Rapid iteration matters**: Modifying a 200-line TypeScript file is faster than understanding a 189K-line Go codebase.
- **Community contribution is desired**: The barrier to contributing a Pi extension is writing a single TypeScript file. The barrier to contributing to Gas Town is understanding Go and the entire MEOW/Beads/Hooks architecture.

---

## 10. Conclusion

Gas Town and Pi's extension model are not competitors -- they are responses to the same problem at different scales and with different philosophies.

Gas Town says: **"Build the factory first, then run it."** It front-loads complexity into a comprehensive system that handles everything from agent spawning to merge queue management to health monitoring. The cost is 189K lines of Go and a steep learning curve. The payoff is the ability to run 20-30 agents in parallel with full crash recovery and automated merge management.

Pi says: **"Build nothing until you need it, then add exactly what you need."** It front-loads simplicity by providing a minimal core with a powerful extension API. The cost is that some capabilities (merge queues, DAG workflows, proactive health monitoring) are missing entirely. The payoff is that you can go from zero to multi-agent orchestration in 734 lines, and the system never becomes more complex than what you've chosen to use.

The 43:1 code ratio is real but misleading in isolation. What it actually demonstrates is:

1. **Most of Gas Town's complexity serves scale, not capability.** The core capabilities (dispatch, safety, task discipline, pipelines, agent spawning) each require only 200-800 lines of TypeScript.

2. **Event-driven composition is a more efficient architecture for capabilities that don't need deep integration.** When subsystems are independent (safety auditing doesn't need to know about team composition), events are cheaper than shared state.

3. **The missing 97% is not waste -- it is the cost of scale.** Merge queues, DAG execution, federated work exchange, and three-layer supervision hierarchies are genuinely hard problems that cannot be solved in 200-line modules.

4. **For the 95% of developers who will never run 20 parallel agents, Pi's model is not just sufficient -- it is superior.** It delivers the outcomes that matter (orchestration, safety, discipline, pipelines) without the outcomes that don't (factory-scale infrastructure).

The future likely converges: Pi extensions will grow more sophisticated (someone will write a merge-queue extension), and Gas Town will likely become more modular (Yegge has discussed pluggable runtimes). But today, the comparison illuminates a fundamental truth about software architecture: **composability is how small teams achieve big outcomes without building big systems.**

---

## Appendix: Quick Reference

### Stacking Recipes

```bash
# Solo developer wanting safety + task discipline
pi -e extensions/damage-control.ts -e extensions/tilldone.ts -e extensions/tool-counter.ts

# Team lead wanting multi-agent orchestration with monitoring
pi -e extensions/agent-team.ts -e extensions/damage-control.ts -e extensions/tool-counter-widget.ts

# Pipeline-oriented workflow (research -> plan -> implement)
pi -e extensions/agent-chain.ts -e extensions/minimal.ts

# Meta-agent building new agents
pi -e extensions/pi-pi.ts -e extensions/tool-counter.ts

# Full stack: everything
pi -e extensions/agent-team.ts -e extensions/damage-control.ts \
   -e extensions/tilldone.ts -e extensions/subagent-widget.ts \
   -e extensions/tool-counter.ts -e extensions/cross-agent.ts \
   -e extensions/system-select.ts
```

### Numbers at a Glance

| Metric | Gas Town | Pi Extensions |
|---|---|---|
| Total LOC | ~189,000 (Go) | ~4,745 (TypeScript) |
| Orchestration-relevant LOC | ~189,000 | ~4,036 |
| Code ratio | 1x | ~1/43x |
| Agent roles | 8+ hardcoded | 6 named + unlimited custom |
| Max tested agents | 20-30 | ~8 practical |
| Setup time | Hours (Go + Dolt + beads + tmux) | Seconds (`-e` flag) |
| Monthly cost | $2K-5K API | Per-use API costs only |
| Runtime support | Claude, Codex, Cursor, Gemini | 324 models across 20+ providers |
| Extension count | N/A (monolith) | 16 (pi-vs-claude-code) |
| Config format | TOML + JSON + JSONL | YAML + Markdown |
| Meta-agent capability | None | pi-pi.ts (8 parallel experts) |
| Merge queue | Refinery (dedicated agent) | Not built (gap) |
| Workflow model | DAGs with gates/loops | Linear pipelines |

---

*Research compiled from the pi-vs-claude-code repository, Pi Agent core documentation, Gas Town source analysis, and prior research on Yegge's architecture (see companion documents in this research directory).*
