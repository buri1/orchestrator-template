# Steve Yegge

> **Veteran Google/Amazon engineer who built Gas Town, a 189K-line multi-agent orchestration framework, and is now federating it into "the Wasteland" -- a trust-based work-and-reputation network for thousands of agent rigs.**

| Field | Value |
|-------|-------|
| Handle | [@steveyegge](https://steve-yegge.medium.com/) |
| Role | Independent / Creator of Gas Town & the Wasteland |
| Known For | Gas Town multi-agent orchestrator, 8-stage developer evolution model, Wasteland federation thesis |
| Platforms | [Medium](https://steve-yegge.medium.com/), [GitHub](https://github.com/steveyegge/gastown), [gastownhall.ai](https://gastownhall.ai) |
| Last Analyzed | 2026-03-05 |

---

## Burak's Notes

> *(reserved)*

---

## Relevance to Our Work

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct overlap: hierarchical agent roles, Git-backed state persistence, crash recovery, tmux session management, orchestrator-as-discipline. Gas Town solves the same problems as L-Thread Orchestrator at a larger scale. |
| **Signal Quality** | 9/10 | Reports from deep personal use of 20-30 parallel agents. Shares real production failures (DB corruption, runaway Deacon), actual costs ($100/hr token burn), and specific line counts. Not hype -- operational dispatches from Stage 8. |

---

## Background & Track Record

Steve Yegge is a 40+ year software veteran with long tenures at Amazon (1998-2005) and Google (2005-2018), known for his influential technical blog posts ("Yegge's rants") that shaped industry discourse on topics ranging from platform thinking to programming language design. His 2011 internal Google memo (accidentally published publicly) on platforms vs. products became one of the most-cited pieces in software engineering.

In January 2026 he launched Gas Town, a multi-agent orchestration framework written in Go, claiming to have produced close to a million lines of code in the prior year using AI agents -- "rivaling his entire 40-year career oeuvre." Gas Town was itself 100% vibecoded (75K lines in 17 days, growing to 189K lines), and Yegge claims to have never read the code. He also built Beads, a 225K-line agent memory system reportedly used by tens of thousands daily.

By March 2026 he expanded the vision to the Wasteland, a federated work-and-reputation network connecting thousands of Gas Town instances. His earlier tool Vibecoder was built on Temporal, which he describes as "the gold standard for workflow orchestration" but "too heavy for agent micro-workflows." His credibility rests on being one of a handful of practitioners actually operating at Stage 8 (20-30 parallel agents daily) and publishing detailed operational reports from that frontier.

---

## System / Workflow

### Architecture: Gas Town

Gas Town is a two-tier hierarchical orchestration system built in Go:

**Town Level** (`~/gt/` directory): Cross-project configuration and orchestration.
**Rig Level**: Individual project repositories under Town's control, each with its own agents.

**Agent Role Hierarchy:**

| Role | Level | Function | Lifespan |
|------|-------|----------|----------|
| Overseer | Human | Strategic decisions, work assignment | Permanent |
| Mayor | Town | Chief dispatcher, human interface, never writes code | Long-lived |
| Deacon | Town | System health daemon, patrol loops | Long-lived |
| Dogs | Town | Maintenance helpers under Deacon | Ephemeral |
| Crew | Rig | Named agents for design work, code review, institutional knowledge | Long-lived |
| Polecats | Rig | Ephemeral workers in isolated Git worktrees | Ephemeral |
| Refinery | Rig | Merge queue manager, conflict resolution | Long-lived |
| Witness | Rig | Polecat supervisor, heartbeat, unsticking blocked work | Long-lived |

Each agent has three components: a **Role Bead** (instructions), an **Agent Bead** (persistent identity), and a **Hook** (work queue).

### The MEOW Stack (Molecular Expression of Work)

Five abstraction levels for persistent, crash-recoverable workflow orchestration:

1. **Beads** -- Atomic work units (issues with IDs, descriptions, status). JSONL + Git-tracked. SQLite cache locally.
2. **Epics** -- Hierarchical tree structures organizing Beads.
3. **Molecules** -- Instantiated workflow graphs with dependencies, gates, loops.
4. **Protomolecules** -- Reusable workflow templates ready for stamping out.
5. **Formulas** -- High-level TOML definitions specifying workflow composition.

Additional primitives: **Wisps** (ephemeral lightweight beads), **Convoys** (bundled bead groups for monitoring), **Guzzoline** (aggregate body of active molecules).

### The GUPP Principle

**Gas Town Universal Propulsion Principle**: "If there is work on your hook, you MUST run it." Pull-based scheduling -- agents check hooks, resume molecules, continue from checkpoints. Combined with Git-backed state, workflows survive crashes and session restarts.

### Communication Patterns

Erlang-inspired: supervisor trees + mailbox message-passing. Strictly hierarchical (Human -> Mayor -> Supervisors -> Workers). Each Polecat operates in an isolated Git worktree preventing shared-state corruption. The Refinery manages merge integration.

### Three Nested Development Loops

- **Outer Loop (Days-Weeks)**: Strategic planning, system upgrades, town-level cleanups.
- **Middle Loop (Hours-Days)**: Agent spawning decisions, Mayor/Polecat coordination, capacity throttling.
- **Inner Loop (Minutes)**: Task specification, handoffs, output review.

### Key Numbers

| Metric | Value |
|--------|-------|
| Codebase | ~189,000 lines Go (Gas Town) + ~225,000 lines Go (Beads) |
| Initial build speed | 75K lines in 17 days, 2,000 commits |
| Agent capacity | 4-10 comfortable, 20-30 scaled |
| Token burn | ~$100/hour peak, $2,000-$5,000/month |
| Annual cost estimate | Up to $60,000/year for heavy users |
| Primary model | Claude (Opus 4.5) via Claude Code CLI |
| Alternative runtimes | Codex, configurable per-rig |
| Session management | tmux-based |
| State persistence | Git + JSONL + SQLite + Dolt |

### The Wasteland: Federation Layer

The next 100x scaling step -- connecting thousands of Gas Town instances into a trust-based network:

- **Infrastructure backbone**: Dolt (SQL database with Git semantics -- fork, branch, merge, PR on structured data).
- **Universal work protocol**: PR-based workflow for all work types (code, docs, design, research).
- **Multi-dimensional stamps**: Attestations scoring quality, reliability, creativity independently, plus confidence level and severity.
- **Trust Ladder**: Level 1 (browse/claim) -> Level 2 (contributor) -> Level 3 (maintainer/validator) -> Level 4 (governance).
- **Yearbook Rule**: "You can't stamp your own work." Reputation is exclusively peer-attested.
- **Anti-collusion**: Graph topology analysis detects mutual-stamping rings.
- **Federation**: Sovereign databases with shared schema. Identity is portable across wastelands.
- **Gas City** (planned): Deconstructing Gas Town into composable LEGO blocks for custom orchestrator topologies.

---

## Key Insights

1. **The 8-Stage Developer Evolution Model** -- A widely-adopted framework mapping the trajectory from zero AI usage (Stage 1) to building your own orchestrator (Stage 8). The critical inversion happens at Stages 4-5: the agent shifts from assistant to primary producer, the developer shifts from coder to overseer. Most of the industry is at Stages 1-4; the leading edge is at 5-6; Yegge operates at 8.

2. **The Absorption Problem** -- Increasing engineering output velocity 5-10x is meaningless if downstream systems (QA, compliance, deployment, product management) cannot process that output. AI coding is an organizational transformation challenge, not a tooling upgrade. Large companies that cannot absorb are "already dead -- they just don't know it yet."

3. **The Dracula Effect** -- Maximum productivity from intensive AI-augmented work sustains for only ~3 hours/day before cognitive exhaustion. Theoretical 10x gains translate to 3-4x in practice. This imposes a hard human constraint on productivity claims.

4. **Work-as-Fluid, Not Artifact** -- At factory scale, code becomes disposable and work becomes an "uncountable substance that you sling around freely." The developer role transforms from craftsperson to factory foreman managing throughput.

5. **Federation Over Monolithic Scaling** -- Rather than building ever-larger orchestrators, federate multiple smaller ones with shared protocols. "Work is the only input, and reputation is the only output." Each 100x scaling step comes from a new form factor (single agent -> orchestrator -> federation), not from making a single instance bigger.

6. **Erlang Patterns Map to Agent Orchestration** -- Supervisor trees, actor model, mailbox message-passing from decades of distributed systems research apply directly to multi-agent AI systems. Isolated worktrees per agent (like Erlang process isolation) prevent cascading failures.

7. **The 50 First Dates Problem** -- AI agents have no memory between sessions, creating conflicting swamps of markdown and lost context. Git-backed persistent state (Beads) is the solution -- making work survive session boundaries changes what is possible.

8. **Temporal is Too Heavy for Agent Micro-Workflows** -- Enterprise workflow orchestrators like Temporal are "the Bagger 288" -- maximally powerful but overkill for agent tasks that need severe decomposition. Agent workflows need a "lite" version of durable execution.

9. **MCP as "The New HTTP"** -- Model Context Protocol becomes the standard interface for wiring company IP assets to AI systems. Companies should start writing MCP servers immediately.

10. **The "Product vs. Platform" Critique** -- Claude Code is falling into the classic trap of building a polished product rather than an extensible platform. The community will "route right around" this constraint by building a coding agent designed to be a composable factory worker.

---

## What We Can Learn

- **Git-backed state persistence** is the proven pattern for crash recovery in agent systems. L-Thread Orchestrator's JSON state files could adopt JSONL + Git tracking for auditability and recovery, similar to Beads.

- **Isolated Git worktrees per agent** prevents interference between parallel workers. When running multiple agents on the same repo, each should get its own worktree with a dedicated merge process.

- **The GUPP principle** ("if there is work on your hook, you MUST run it") maps directly to our event-driven waiting pattern. Pull-based scheduling where agents check their queues and resume from checkpoints is more robust than push-based orchestration.

- **Specialized agent roles** (Mayor=dispatcher, Crew=review, Polecats=execution, Refinery=merge) mirror our orchestrator pattern but with more granular separation. The Witness role (supervisor that nudges stalled agents) is particularly applicable -- we could add a heartbeat/health-check agent.

- **Three nested loops** (outer=strategic, middle=coordination, inner=execution) provide a useful mental model for structuring orchestrator work across different time horizons.

- **Multi-dimensional quality assessment** (quality + reliability + creativity scored independently) is a richer signal than binary pass/fail for evaluating agent output.

- **The Dracula Effect** is operationally important: design workflows assuming 3 hours of peak human oversight per day, not 8.

- **Dolt as infrastructure** for federated structured data with Git semantics is worth evaluating for any cross-project state management needs.

---

## What Doesn't Apply

- **Scale assumptions**: Gas Town targets 20-30 parallel agents with $60K/year token budgets. Our context operates at a smaller scale with Claude Max ($200/mo). Many Gas Town patterns are overengineered for our current throughput.

- **100% vibecoding philosophy**: Yegge's approach of never reading the code is deliberately extreme and has produced operational failures (runaway Deacon, auto-merged failing tests, DB corruption). Our 70/30 deterministic/LLM split is more appropriate for production contract work.

- **Gas Town's conceptual load**: The MEOW stack introduces 8+ new abstractions (Beads, Epics, Molecules, Protomolecules, Formulas, Wisps, Convoys, Guzzoline). This complexity is justified at Yegge's scale but would be overhead at ours. Simpler state management suffices.

- **The Wasteland federation model**: Compelling for open-source ecosystems but irrelevant for DSGVO-isolated government contract work where code and data must remain in controlled environments.

- **Mad Max theming and naming**: Entertaining but creates unnecessary cognitive load when onboarding team members. Descriptive naming (as in L-Thread Orchestrator) is more practical.

---

## Referenced Tools/Projects

| Tool/Project | How They Use It | In Our Catalogue? |
|-------------|-----------------|-------------------|
| Gas Town | Core multi-agent orchestrator (189K lines Go) | No |
| Beads | Agent memory/persistence system (225K lines Go, JSONL + Git + SQLite) | No |
| The Wasteland | Federated work-and-reputation network on Dolt | No |
| Gas City | Planned composable orchestrator builder toolkit | No |
| Claude Code | Primary AI runtime for all agents | No |
| Codex | Alternative AI runtime, configurable per-rig | No |
| Dolt | SQL database with Git semantics -- federation backbone | No |
| Temporal | "Gold standard" workflow orchestration, used in earlier Vibecoder tool, deemed too heavy | No |
| tmux | Session management for agent instances | No |
| MCP | Model Context Protocol -- "the new HTTP" for wiring IP to AI | No |
| Git worktrees | Isolation mechanism for parallel Polecat agents | N/A |

---

## Key Takeaway

> **The bottleneck in AI-augmented development is not implementation speed but the human and organizational capacity to absorb, review, and direct that output -- and the practitioners who build orchestration systems to manage that bottleneck are building the compounding asset of this era.**
