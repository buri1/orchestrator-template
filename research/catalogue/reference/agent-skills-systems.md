# Agent Skills Systems

> **SkillKit, Playbooks, OpenSkills, and obra/superpowers -- the SKILL.md standard for universal agent capabilities, plus extractable patterns from Stripe Minions, Elvis Sun, Graphite, E2B/Daytona, PostHog, and Agent Flywheel.**

| Field | Value |
|-------|-------|
| Category | 📚 Reference |
| Source Document | `research/2026-03-05_agent-skills-orchestration-tools.md` |
| Research Phase | Phase 1 |
| Evidence Base | SkillKit (44+ agents, 15,000+ skills), Playbooks.com, obra/superpowers subagent-driven development, OpenSkills, Agent Flywheel (50+ tool packs), Stripe Minions (1,300+ PRs/week), Elvis Sun/Zoe system, Graphite merge queue, E2B/Daytona sandboxes, PostHog LLM analytics, VibeTunnel |
| Key Standard | SKILL.md (Anthropic specification: YAML frontmatter + markdown body) |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

A universal agent skills standard has emerged around the SKILL.md format (Anthropic specification): YAML frontmatter for trigger metadata, markdown body for instructions, optional resource files loaded lazily from subdirectories. SkillKit is the package manager (write once, deploy to 44+ agents including Claude Code, Cursor, Codex, Copilot, Windsurf, Devin), Playbooks.com is the curated directory (free, no account, browse and copy), OpenSkills is the lightweight standards-compliant loader, and obra/superpowers defines the most rigorous execution methodology -- fresh subagent per task with mandatory two-stage review (spec compliance first, then code quality) and TDD enforcement.

Beyond skills systems, the research identified 11 extractable patterns from orchestration-adjacent tools. The three highest-impact patterns for the L-Thread Orchestrator are: (1) Stripe Minions' Blueprints -- deterministic/agentic hybrid execution graphs where git, linting, and CI are always deterministic and only implementation/debugging are LLM-driven; (2) obra/superpowers' fresh-subagent-per-task with two-stage review, preventing context contamination and catching incomplete implementations; and (3) Elvis Sun's model routing per task type, sending billing bugs to Codex and style fixes to Claude Code. Supporting infrastructure includes E2B (150ms Firecracker microVM sandboxes) and Daytona (27-90ms Docker persistent workspaces) for agent isolation, Graphite for stacked PRs and partitioned merge queues, and PostHog for unified product analytics + agent observability.

The synthesis is that skills are first-class orchestrator primitives. The orchestrator should maintain a project-level skills directory, use skill trigger terms as routing metadata for auto-selecting capabilities per dispatched agent, bundle related skills into task templates, and enforce the 5,000-token-per-skill limit to keep context windows manageable.

---

## Key Findings

### The SKILL.md Standard

Every skill follows the Anthropic specification:
- **YAML frontmatter** (between `---` markers) -- tells the agent when to activate via trigger terms
- **Markdown body** -- instructions the agent follows
- **Optional resource files** -- templates, examples, scripts in `scripts/`, `references/`, `assets/` subdirectories
- **5,000-token limit** recommended for instructions; heavy resources loaded lazily
- **Description field** is critical -- it is what the agent uses to choose from dozens of available skills

### Skills Ecosystem

| System | What It Is | Key Capability |
|--------|-----------|----------------|
| **SkillKit** | Open-source package manager for agent skills | `init -> recommend -> install -> sync` lifecycle; 44+ agent targets; 15,000+ marketplace skills |
| **Playbooks.com** | Free curated skill directory | Bundles (related skills as group); browse and copy; no account needed |
| **obra/superpowers** | Agentic skills framework + methodology | Fresh subagent per task; two-stage review; TDD enforcement; YAGNI |
| **OpenSkills** | Lightweight standards-compliant loader | Claude Code compatibility; progressive disclosure; `--universal` flag for non-Claude agents |

### SkillKit Lifecycle

Four commands drive skill management:
1. `npx skillkit@latest init` -- detects present agents, creates directory structure
2. `skillkit recommend` -- AI-powered suggestions based on project context
3. `skillkit install` -- pulls from 15,000+ skill marketplace
4. `skillkit sync` -- deploys installed skills to all detected agent formats

The `--universal` flag installs to `.agent/skills/` (for Pi and non-Claude agents) rather than `.claude/skills/`.

### obra/superpowers: Subagent-Driven Development

The most rigorous execution methodology in the research:

1. **Fresh subagent per task** -- each starts clean, preventing context contamination
2. **Two-stage review system**:
   - Stage 1: **Spec Compliance Review** -- separate review agent reads the actual implementation (not the implementer's self-report) and verifies it matches the spec
   - Stage 2: **Code Quality Review** -- only runs after spec compliance passes
3. **TDD enforcement** -- RED-GREEN-REFACTOR is mandatory; YAGNI enforced
4. **The implementer cannot mark its own homework** -- reviewer is a distinct agent with a distinct prompt

### The 11 Extractable Patterns

| # | Pattern | Source | Priority |
|---|---------|--------|----------|
| 1 | Skills as first-class orchestrator primitives | SkillKit, Playbooks, OpenSkills | Medium |
| 2 | Fresh subagent per task + two-stage review | obra/superpowers | **HIGH** |
| 3 | Blueprints (deterministic + agentic hybrid) | Stripe Minions | **CRITICAL** |
| 4 | Context pre-hydration | Stripe Minions | **HIGH** |
| 5 | Maximum retry caps (2 CI rounds) | Stripe Minions | **HIGH** |
| 6 | Model routing per task type | Elvis Sun / Zoe | **HIGH** |
| 7 | Stacked PRs + partitioned merge queues | Graphite | **HIGH** |
| 8 | Sandbox per agent (E2B/Daytona) | E2B, Daytona | Medium |
| 9 | Observability via PostHog traces/spans | PostHog | **HIGH** |
| 10 | Destructive Command Guards | Agent Flywheel | Medium |
| 11 | Knowledge backbone (Obsidian vault pattern) | Elvis Sun / Zoe | **HIGH** |

### Blueprint Execution Model (from Stripe Minions)

The single most impactful pattern for reliability. Task execution is a graph of deterministic and agentic nodes:

```
BLUEPRINT: feature-implementation
1. [DETERMINISTIC] git checkout -b feature/X from main
2. [DETERMINISTIC] load relevant skills + context
3. [AGENTIC]       implement feature per spec
4. [DETERMINISTIC] run linter
5. [AGENTIC]       fix lint errors (if any)
6. [DETERMINISTIC] run tests
7. [AGENTIC]       fix test failures (max 2 rounds)
8. [DETERMINISTIC] git commit + push
9. [AGENTIC]       spec compliance review
10. [DETERMINISTIC] create PR via gh
```

Git checkout, linting, CI triggers, and PR creation are always deterministic. Only implementation, debugging, and review are agentic. This interleaving dramatically improves reliability versus pure agentic loops.

### Sandbox Infrastructure

| Factor | E2B | Daytona |
|--------|-----|---------|
| Isolation | Firecracker microVM (hardware-level) | Docker container (process-level) |
| Cold start | ~150ms | 27-90ms |
| Statefulness | Pause/resume up to 24h | Persistent workspaces (days/weeks) |
| Best for | One-shot ephemeral execution | Iterative development with state |
| Security | Stronger (dedicated kernel) | Adequate (container isolation) |

**Recommendation**: E2B for one-shot agent tasks (Stripe Minions-style). Daytona for iterative tasks where agents need persistent state.

### PostHog for Agent Observability

PostHog captures LLM interactions as regular events, meaning funnels, cohorts, retention, and session replay all work on agent data. Core concepts: Traces (full user-to-LLM interaction), Spans (individual operations -- tool calls, vector searches), Generations (individual LLM calls with tokens/cost/latency). Claims ~10x cheaper than dedicated LLM observability tools.

### Orchestration-Adjacent Tools Summary

| Tool | Category | Key Pattern | Priority |
|------|----------|-------------|----------|
| SkillKit | Skills | Universal skill management (44+ agents) | Medium |
| Playbooks.com | Skills | Bundles + trigger terms | Medium |
| obra/superpowers | Skills | Fresh subagent + two-stage review | **HIGH** |
| Agent Flywheel | Infra | Destructive Command Guard, VPS model | Medium |
| Stripe Minions | Architecture | Blueprints, pre-hydration, retry caps | **CRITICAL** |
| Elvis Sun / Zoe | Architecture | Model routing, knowledge backbone | **HIGH** |
| Graphite | Merge Strategy | Stacked PRs, partitioned queues | **HIGH** |
| E2B | Sandbox | Ephemeral isolation (Firecracker) | Medium |
| Daytona | Sandbox | Stateful persistent sandboxes | Medium |
| VibeTunnel | Infra | Browser-based terminal for remote mgmt | Low |
| PostHog | Observability | Traces/spans/generations for agents | **HIGH** |

---

## Actionable Insights

### Skills Integration for L-Thread

1. **Maintain a project-level skills directory** at `.agent/skills/` (universal format) loaded via `--universal` flag for cross-agent compatibility.
2. **Use skill descriptions as routing metadata** -- match task keywords against skill trigger terms to auto-select capabilities per dispatched agent.
3. **Bundle related skills into task templates** (Playbooks.com's bundle concept) for common workflows (deploy + test + review).
4. **Enforce the 5,000-token limit** per skill to keep agent context windows manageable.

### Execution Methodology for L-Thread

5. **Adopt fresh-subagent-per-task** -- when spawning tmux/conduit agents, each starts with clean context containing only the task spec and relevant skills.
6. **Implement two-stage review** -- after task completion, spawn a spec reviewer agent that reads the diff against the original spec. If spec passes, spawn a quality reviewer agent.
7. **Adopt the Blueprint model** -- define deterministic/agentic hybrid execution graphs for common workflows.
8. **Enforce maximum 2 CI rounds** to prevent infinite retry loops and cost blowout.
9. **Pre-hydrate context** before dispatching agents -- gather docs, related code, and prior agent outputs into context payloads deterministically.

### Infrastructure for L-Thread

10. **Implement Destructive Command Guards** as PreToolUse hooks blocking dangerous commands before execution (Agent Flywheel pattern).
11. **Emit PostHog trace events** for every agent dispatch (task ID, agent type, model, context size) and span events for every tool call.
12. **Evaluate Graphite** for stacked PR output from multi-agent work, with partitioned merge queues so independent workstreams do not block each other.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) | Skills stored in `.claude/skills/`; Agent Teams implement the shared mailbox pattern; hooks enable Destructive Command Guards |
| [Pi Agent](../agent-harnesses/pi-agent.md) | SkillKit's `--universal` flag targets Pi via `.agent/skills/`; Pi's 1,000-token system prompt constrains skill size |
| [Pi Subagents](../agent-harnesses/pi-subagents.md) | obra/superpowers fresh-subagent-per-task pattern maps directly to Pi's role-based delegation |
| [Oh-My-Pi](../agent-harnesses/oh-my-pi.md) | Worktree isolation aligns with sandbox-per-agent (E2B/Daytona) pattern |
| [Stripe Minions](../orchestration-platforms/stripe-minions.md) | Blueprint pattern, context pre-hydration, 2-round CI cap, one-shot execution -- all originated here |
| [Elvis Sun](../practitioners/elvis-sun.md) | Model routing per task type, Obsidian vault as knowledge backbone, Telegram notifications |
| [Steve Yegge](../practitioners/steve-yegge.md) | Gas Town = orchestrator in the Wasteland model; Beads = SQLite task tracker analogous to JSON state files |
| [Geoffrey Huntley](../practitioners/geoffrey-huntley.md) | Ralph Wiggum loop and kill-polluted-contexts align with fresh-subagent-per-task |
| [Scaling Economics](./scaling-economics.md) | Blueprint pattern and one-shot execution directly address the 1.724 coordination exponent |
| [Master Blueprint](./master-blueprint.md) | 70/30 deterministic/LLM split is the governing principle; Blueprints are its implementation |
| [Agent Communication Protocols](./agent-communication-protocols.md) | MCP is the tool connectivity layer skills operate through; AGENTS.md/SKILL.md are complementary standards |
| [Agent Marketplace Economy](./agent-marketplace-economy.md) | Skills as routing metadata parallels marketplace skill-based agent discovery and hiring |
