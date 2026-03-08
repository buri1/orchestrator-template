# Pi Agent

> **A minimal, extensible terminal coding agent with 4 core tools, ~200-token system prompt, TypeScript in-process extensions, and 324+ model support — the foundation for custom agent harnesses.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / SDKs |
| Repository | [badlogic/pi-mono](https://github.com/badlogic/pi-mono) |
| Publisher | Mario Zechner (solo — libGDX creator, 24.8K GitHub stars) |
| License | MIT |
| Tech Stack | TypeScript (Node.js), jiti (zero-build TS loading), monorepo (pi-ai / pi-agent-core / pi-coding-agent) |
| Maturity | 🟡 Early (v0.56.1, rapid iteration) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Most architecturally aligned harness for our orchestration vision. Token efficiency, extension model, model agnosticism, and SDK embeddability directly serve our architecture. |
| **Novelty** | 7/10 | In-process `context` event (message rewriting before LLM sees them), 4-tool minimalism, extension composability via CLI flags — all represent genuinely different approaches from Claude Code. |
| **Actionable** | 5/10 | Deferred to Phase 3 (Day 60+) per Master Blueprint §7. Claude Code is earning revenue now. Pi Agent is the validated replacement candidate when it stabilizes. |

---

## Overview

> [!IMPORTANT]
> **This is a consolidation profile.** Pi Agent has been extensively researched across 15+ dedicated research documents. This profile summarizes key findings — see the [full research index](#full-research-index) below for deep-dive documents.

Pi Agent (originally "Pi") is a terminal coding agent created by Mario Zechner that powers OpenClaw (145K+ stars) and has 3.17M monthly npm downloads. Its core thesis: **less infrastructure yields better agent outcomes.** The entire system prompt fits in ~200 tokens (vs. Claude Code's ~10,000), uses only 4 core tools (read, write, edit, bash), and makes everything else optional via composable TypeScript extensions.

Pi operates as a layered SDK (`pi-ai` → `pi-agent-core` → `pi-coding-agent`), supporting 324+ models across 20+ providers. Extensions hook into 25+ lifecycle events in-process (microsecond latency vs. shell-hook milliseconds), with the `context` event being the most powerful: it allows **rewriting messages before the LLM sees them** — a capability Claude Code's hooks cannot match.

The extension ecosystem has 50–80 actively maintained extensions covering multi-agent orchestration, safety/discipline, MCP adapters, and workflow management. OpenClaw validates the "Pi as engine inside your application" pattern at production scale.

---

## Technical Architecture

```
pi-coding-agent    (Application: CLI with tools, sessions, extensions)
       |
pi-agent-core      (Core: Agent loop, tool execution, state management)
       |
  pi-ai + pi-tui   (Foundation: LLM abstraction + Terminal UI)
```

**4 Core Tools:** `read`, `write`, `edit`, `bash` (+ optional convenience: `grep`, `find`, `ls`)

**Integration Modes:**

| Mode | Interface | Best For |
|------|-----------|----------|
| Interactive | Terminal TUI | Developer use |
| Print/JSON | stdout | CI/CD pipelines |
| RPC | stdin/stdout JSONL | IDE integration, custom UIs |
| SDK | Node.js API | Embedding in applications |

**Extension Event Categories (25+ events, 7 categories):**

| Category | Key Events |
|----------|-----------|
| **Session** | `session_start`, `session_before_compact`, `session_shutdown` |
| **Tool** | `tool_call`, `tool_execution_start/end`, `tool_result` |
| **Context** | `context` — message rewriting before LLM |
| **Agent** | `before_agent_start`, `agent_end` |

**Key extensions ecosystem highlights:**
- **pi-subagents:** Async delegation, YAML agent definitions, observability triplet (status.json, events.jsonl, log.md)
- **pi-messenger:** File-based agent chat room + Crew orchestration engine
- **pi-mcp-adapter:** Lazy-loading MCP proxy, 50–100x token reduction vs. native MCP
- **damage-control:** YAML-based safety rules, intercepting dangerous bash patterns

---

## Publisher Background

Mario Zechner is the creator of libGDX (24.8K GitHub stars), one of the most widely-used open-source Java game frameworks. He is a solo developer with a proven track record of building complex, well-architected systems that gain massive adoption. Pi Agent is his current primary project.

**Risk factor:** Bus factor of 1. MIT license mitigates (forkable), oh-my-pi proves substantial forks are viable, OpenClaw's dependency guarantees an active consumer. But no succession plan or governance structure exists. API stability is improving but still 0.x (v0.35 broke all hooks for the unified extension system).

---

## What's Valuable for Us

1. **Token Efficiency:** 200-token system prompt vs. 10,000 for Claude Code. Spawning 5 Pi agents costs ~6K tokens vs. ~110K for Claude Code Task tool — an 18x overhead difference.

2. **`context` Event:** In-process message rewriting before LLM calls. No equivalent in Claude Code. Enables: task state injection, irrelevant history filtering, role-specific context windows, orchestration state preservation across compaction.

3. **Extension Composability:** Behavior as CLI flags (`pi -e damage-control -e tool-counter`). Features are opt-in, not baked-in. Zero token cost when absent.

4. **SDK Mode:** `createAgentSession()` for embedding Pi in a Node.js process. Each session gets independent prompt, tools, model, working directory, extensions. Perfect for orchestrator patterns.

5. **RPC Mode:** Structured JSONL protocol for headless worker management from an orchestrator.

6. **Model Agnosticism:** 324+ models, mid-session switching, local model support. Strategic hedge against provider lock-in.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Not yet stable** | v0.56.1, 30 minor versions in 4 months. v0.35 broke all hooks. Pin versions aggressively. |
| **No native multi-agent** | Mario philosophically opposed. Must build via extensions. |
| **No MCP support** | Deliberately excluded. pi-mcp-adapter fills the gap. |
| **Enterprise readiness** | No SSO, audit logging, rate limiting, team management, compliance certs. |
| **Phase 1-2 timing** | Master Blueprint mandates: "Do not switch until Pi Agent is demonstrably better for YOUR workflow" and "Wait 60 days for it to stabilize." |

---

## Full Research Index

> [!NOTE]
> The following documents contain deep-dive analysis of Pi Agent. This profile is a consolidation — refer to these for full details.

| Document | Focus |
|----------|-------|
| [pi-agent-architecture-deep-dive.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-agent-architecture-deep-dive.md) | 200-token advantage, 4-tool design, extension composability, TypeScript in-process events, model agnosticism, SDK/RPC modes, gaps analysis |
| [pi-core-sdk-deep-architecture.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-core-sdk-deep-architecture.md) | Monorepo layering, `createAgentSession()` API, tool registration, state management |
| [pi-orchestrator-architecture-blueprint.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-orchestrator-architecture-blueprint.md) | Blueprint for building orchestrator on Pi, runtime abstraction, agent spawning, communication, MCP strategy |
| [SYNTHESIS_pi-ecosystem.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_SYNTHESIS_pi-ecosystem.md) | Ecosystem map, 50-80 extensions, best patterns, critical gaps, risk assessment, recommended architecture |
| [MASTER-SYNTHESIS_gastown-vs-pi-agent-custom-harness.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_MASTER-SYNTHESIS_gastown-vs-pi-agent-custom-harness.md) | Comparison of harness approaches |
| [pi-agent-mario-zechner-deepdive.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-agent-mario-zechner-deepdive.md) | Mario Zechner's philosophy and design decisions |
| [oh-my-pi-deep-analysis.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_oh-my-pi-deep-analysis.md) | Community fork with batteries-included features |
| [openclaw-pi-internals-deep-analysis.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_openclaw-pi-internals-deep-analysis.md) | How OpenClaw embeds Pi at production scale |
| [pi-messenger-deep-analysis.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-messenger-deep-analysis.md) | File-based agent chat room + Crew orchestration |
| [pi-subagents-deep-analysis.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-subagents-deep-analysis.md) | Async delegation, YAML agents, observability |
| [pi-mcp-adapter-deep-analysis.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-mcp-adapter-deep-analysis.md) | Lazy-loading MCP proxy, 50-100x token savings |
| [pi-community-extensions-complete-map.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-community-extensions-complete-map.md) | Full extension ecosystem catalog |
| [real-world-pi-orchestrators.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_real-world-pi-orchestrators.md) | Production orchestrator implementations |
| [pi-automation-deployment-guide.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-automation-deployment-guide.md) | Deployment and automation patterns |
| [pi-roadmap-future-direction.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_pi-roadmap-future-direction.md) | Pi's future direction and risks |
| [lthread-to-pi-migration-feasibility.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-05_lthread-to-pi-migration-feasibility.md) | Migration path from Claude Code to Pi |
| [research-pi-vs-claude-code-decision.md](file:///Users/buraksmac/Desktop/code2/orchestrator/research/2026-03-06_research-pi-vs-claude-code-decision.md) | Final decision document: Pi vs. Claude Code |

---

## Future Use Cases

- **Phase 1–2 (Days 1–60):** Stay with Claude Code. Monitor Pi's stability. Audit our system prompts for bloat using Pi's philosophy.
- **Phase 3 (Days 60–90):** Evaluate Pi as primary harness. Build `AgentRuntime` adapter interface. Test with a non-critical agent first.
- **Phase 4 (Days 90+):** If evaluation succeeds, strangler-fig migrate from Claude Code to Pi for cost/token efficiency gains. Keep Claude Code as fallback adapter.

---

## Key Takeaway

> **Pi Agent is the most architecturally aligned harness for our vision — its token efficiency, `context` event, SDK embeddability, and model agnosticism make it the validated replacement candidate for Claude Code at Day 60+, but switching prematurely violates Governing Principle #7.**
