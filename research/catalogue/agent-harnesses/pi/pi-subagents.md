# Pi-Subagents

> **Pi extension for async subagent delegation with chains, parallel execution, TUI management, and structured observability.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents) |
| GitHub Stars | 97 (as of 2026-03-08) |
| Publisher | Nico Bailon (nicopreme) — solo |
| License | MIT |
| Tech Stack | TypeScript (Node.js), Pi Agent extension, npm: `@oh-my-pi/subagents` |
| Maturity | 🟡 Early (v1.3.3710, rapid iteration) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Declarative YAML agent definitions, observability triplet, and chain pipelines directly map to our orchestrator patterns. Hub-and-spoke model matches our centralized coordination architecture. |
| **Novelty** | 5/10 | Patterns well-documented in our Phase 1-2 research. Key novel elements: skill injection, depth guards, and the status.json/events.jsonl/log.md observability triplet. |
| **Actionable** | 6/10 | Agent definition format, observability triplet, and tool whitelisting are adoptable now. Process isolation model (in-process) is explicitly NOT what we want — we use tmux. |

---

## Overview

Pi-subagents is the most feature-complete subagent delegation extension in the Pi coding agent ecosystem. Created by Nico Bailon, it provides three execution modes: single dispatch (`/run`), chain-based sequential pipelines (`/chain` with `->` operator), and parallel execution (`/parallel`). Each agent is defined as a markdown file with YAML frontmatter controlling tools, model, thinking level, output behavior, and skill injection — making definitions versionable, human-readable, and modifiable at runtime.

The system ships with four canonical roles — Scout (read-only reconnaissance), Planner (restricted-write task planning), Worker (full-capability implementation), and Reviewer (read-only quality analysis) — forming a canonical pipeline: Scout -> context.md -> Planner -> plan.md -> Worker -> impl.md -> Reviewer -> review.md. Each step's output file becomes the next step's input context.

Async runs produce a structured observability folder containing three artifacts: `status.json` (machine-readable progress), `events.jsonl` (timestamped event stream), and a human-readable execution log. A TUI overlay (Ctrl+Shift+A or `/agents`) provides real-time agent management including browsing, editing, creating, and launching agents and chains.

---

## Technical Architecture

```
Pi Coding Agent (parent session)
    |
    +-- Agent Definitions (.md files with YAML frontmatter)
    |       scout.md, planner.md, worker.md, reviewer.md
    |
    +-- Execution Engine
    |       Single dispatch: /run <agent> "task"
    |       Chain: /chain scout "scan" -> planner "plan" -> worker "implement"
    |       Parallel: /parallel scanner "find bugs" -> reviewer "check style"
    |
    +-- Session Manager (in-process, createAgentSession)
    |       Tool whitelisting per agent
    |       MCP isolation (explicit opt-in)
    |       Depth guard (default: 2 levels, configurable via PI_SUBAGENT_MAX_DEPTH)
    |
    +-- Skill Injection (SKILL.md files -> system prompt composition)
    |
    +-- Observability (per async run)
    |       <tmpdir>/pi-async-subagent-runs/<id>/
    |           status.json    (progress tracking)
    |           events.jsonl   (event stream)
    |           subagent-log-<id>.md (human log)
    |
    +-- TUI Integration
            Agents Manager overlay (Ctrl+Shift+A)
            Real-time footer (tokens, cost, model)
            Parallel builder (Ctrl+P)
```

**Key YAML frontmatter fields:** `name`, `description`, `tools` (whitelist), `model`, `thinking` (off/minimal/low/medium/high/xhigh), `skill` (composable injection), `output` (file path), `defaultReads`, `interactive`, `mcp` (explicit opt-in), `maxOutput` (truncation).

**Process model:** In-process sessions via `createAgentSession()` — no `child_process.spawn()`. Subagents share the parent's Node.js process. Optional git worktree isolation available (`ensureWorktree`, `applyBaseline`, `captureDeltaPatch`, `cleanupWorktree`).

---

## Publisher Background

Nico Bailon (GitHub: nicobailon, handle: nicopreme) is a solo developer and prolific Pi ecosystem contributor. He has built several notable Pi extensions:

- **pi-subagents** — async delegation framework (this tool)
- **pi-foreground-chains** — simpler foreground chain variant with observable overlay
- **pi-messenger** — file-based agent chat room
- **pi-interactive-shell** — autonomous CLI control with PTY emulation
- **pi-mcp-adapter** — lazy-loading MCP proxy with 50-100x token reduction
- **pi-powerline-footer** — status bar extension

He is one of the most active contributors to Pi's extension ecosystem and his work has become the de facto standard for multi-agent orchestration within Pi.

---

## What's Valuable for Us

1. **Declarative agent definitions in markdown:** YAML frontmatter + markdown body is the exact pattern we already use (`.claude/agents/*.md`). Validates our approach and offers additional fields worth considering (thinking level, skill injection, maxOutput).

2. **Observability triplet (status.json + events.jsonl + log.md):** Three-file pattern covering machine-readable status, event streaming, and human-readable logs. Directly adoptable for our tmux-based agents — each agent could write to `_bmad/agents/<name>/status.json`.

3. **Tool whitelisting per role:** Strict isolation (scout gets only `read/grep/find/ls`) prevents agents from exceeding their mandate. We enforce this via system prompts; explicit whitelisting is more robust.

4. **Depth guard pattern:** Simple environment variable (`PI_SUBAGENT_MAX_DEPTH`) prevents recursive spawning cost explosion. Trivially implementable in our orchestrator.

5. **Skill injection / prompt composition:** Composable `SKILL.md` files injected into agent system prompts at runtime. Enables behavior reuse across agents without duplicating prompt text.

6. **Chain file format:** `.chain.md` files defining reusable multi-step pipelines with per-step configuration. The `->` operator for sequential handoff with file-based artifacts is simple and debuggable.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **In-process execution model** | Subagents share parent's Node.js process. A crashed subagent affects the parent. We use tmux for process isolation (per Master Blueprint and Elvis Sun patterns). |
| **Hub-and-spoke only** | No peer-to-peer communication between agents. Our architecture supports direct messaging when needed (Claude Code Teams pattern). |
| **No automatic retry** | No built-in retry with backoff. Our orchestrator already handles this at the tmux/state layer. |
| **No heartbeat monitoring** | Must poll status.json manually. Our `check-agents.sh` pattern (Elvis Sun) handles health checks deterministically. |
| **Pi-specific** | Runs only within the Pi coding agent ecosystem. Not portable to Claude Code or other harnesses. |
| **No budget enforcement** | Per-agent cost visibility exists but no aggregate budget ceiling. |

---

## Future Use Cases

- **Phase 1–2 (Days 1–60):** Adopt the observability triplet pattern (status.json + events.jsonl) for our tmux-based agents. Study the YAML frontmatter schema for additional fields to add to our agent definitions.
- **Phase 3 (Days 60–90):** If migrating to Pi Agent as primary harness, pi-subagents becomes the default delegation layer. Evaluate whether its chain/parallel primitives replace our tmux orchestration or complement it.
- **Phase 4 (Days 90+):** At scale, consider whether pi-subagents' in-process model is viable or whether tmux isolation remains superior. The answer likely depends on agent count: 2-3 agents favor in-process, 5-10 favor process isolation.

---

## Key Takeaway

> **Pi-subagents solved the agent definition and observability problems well — its YAML frontmatter format, skill injection system, and status.json/events.jsonl observability triplet are production-worthy patterns worth adopting, but its in-process execution model is too fragile for 5-10 concurrent agents where tmux isolation is superior.**
