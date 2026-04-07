# Agent Orchestration Landscape Overview

**Date:** 2026-03-05 | **Basis:** 30 research agents, 70+ documents, 5 synthesis reports | **For:** Burak Ismac

---

## 1. Executive Summary

Thirty research agents analyzed every major agent orchestration tool, framework, harness, and pattern available in March 2026. The single finding: **the bottleneck has moved from model capability to orchestration quality.** The models are good enough. What determines output quality is context engineering (what agents see), deterministic workflow control (what agents do vs. what code decides), and infrastructure (crash recovery, observability, cost control). Pi Agent is the correct harness choice for a model-agnostic, fully-owned orchestrator -- but it must be wrapped in an adapter layer for insurance, extended with community orchestration primitives (pi-subagents, pi-messenger, pi-mcp-adapter), and hardened with custom extensions for discipline enforcement, E2E gating, and fleet-wide budget management. The architecture that wins everywhere -- Stripe, Elvis Sun, Gas Town, OpenClaw -- is the same: a non-coding coordinator that holds business context, delegates creative work to isolated agents through deterministic gates, and enforces hard retry caps. Build that.

---

## 2. The Landscape at a Glance

| Tool/Harness | Category | 1-Line Verdict | Relevance (1-5) |
|---|---|---|---|
| **Pi Agent** | Agent harness | Maximum extensibility, MIT, zero vendor lock-in. Your primary harness. | 5 |
| **pi-subagents** | Pi extension | De facto standard for async multi-agent delegation within Pi. | 5 |
| **pi-messenger** | Pi extension | Most complete coordination system: PRD-to-parallel-execution with planner/worker/reviewer. | 5 |
| **pi-mcp-adapter** | Pi extension | Non-negotiable MCP integration: 50-100x token reduction via lazy proxy. | 5 |
| **Context-Gateway (Compresr)** | Context management | Drop-in proxy for zero-interruption compaction. Single highest-ROI integration. | 5 |
| **Vercel agent-browser** | Browser automation | 93% context reduction vs. Chrome DevTools MCP. Use for all E2E testing. | 5 |
| **Langfuse** | Observability | Nested traces, cost tracking, prompt versioning. Non-negotiable for production. | 5 |
| **Claude Agent SDK** | Agent harness | Best Claude-native orchestration. Keep as secondary adapter option. | 4 |
| **OpenCode** | Agent harness | Strongest OSS orchestration platform (HTTP+SSE+SDK). Primary fallback. | 4 |
| **Goose** | Agent harness | Best model-agnostic crash-recoverable multi-agent. Strong alternative. | 4 |
| **Cognee** | Semantic memory | Self-hosted knowledge graph for cross-session agent memory. | 4 |
| **Beads + Dolt** | Task state | Git-backed version-controlled task graph. Replaces flat JSON state. | 4 |
| **CodeRabbit** | Code review | 46% real-world bug detection, automated review gate. | 4 |
| **Graphite** | Merge management | Stacked PRs + partitioned merge queues for parallel agent work. | 4 |
| **Trigger.dev** | Durable execution | Long-running agent tasks as first-class citizens, fan-out, queues. | 4 |
| **Relay** | Messaging layer | Sub-5ms agent-to-agent messaging via MCP. Composable, lightweight. | 4 |
| **oh-my-pi** | Pi fork | Batteries-included: hashline edits, LSP, browser, worktree isolation. | 4 |
| **Shannon** | Security testing | 96.15% exploit detection. Fills the security gap most orchestrators ignore. | 3 |
| **Overstory** | Harness-agnostic | Pluggable AgentRuntime interface. Study for adapter pattern, adopt pattern. | 3 |
| **Vibe Kanban** | Harness-agnostic | Kanban-based multi-agent manager. Good for team visibility, limited workflows. | 3 |
| **agtx** | Harness-agnostic | Spec-driven per-phase agent mixing. Useful for cross-model workflows. | 3 |
| **SkillKit** | Skill management | Universal skill marketplace (15K+ skills, 44+ agent formats). | 3 |
| **Aider** | Agent runtime | Best single-agent runtime to wrap (tree-sitter repo map, git-native). | 3 |
| **Codex CLI** | Agent harness | Best production multi-agent, but OpenAI-locked. | 2 |
| **Cline CLI 2.0** | Agent harness | Cleanest gRPC building block, but build-everything-yourself. | 2 |
| **Roo Code** | IDE orchestration | Best in-IDE orchestration, but no headless/CLI mode. Unusable as substrate. | 2 |
| **E2B** | Sandbox | Firecracker microVMs, 150ms startup. For ephemeral agent sandboxing. | 3 |
| **Daytona** | Sandbox | Docker containers, 27-90ms startup. For stateful persistent sandboxing. | 3 |
| **Dify** | Visual prototyping | Agent flow designer. Use for prototyping, not as the orchestrator itself. | 2 |
| **LangGraph** | Framework | Graph-based orchestration. Documented brittleness at scale. Avoid. | 1 |
| **CrewAI/AutoGen** | Framework | Internal agent logic, not external coordination. Wrong abstraction. | 1 |
| **Swarms** | Framework | Rich topologies, economically irrational pricing. Steal patterns, avoid SaaS. | 1 |
| **ElizaOS** | Framework | Web3-native, no file/terminal access. Study architecture only. | 1 |

---

## 3. The 10 Universal Laws of Agent Orchestration

These principles appeared independently across all 30 agents' findings. Every successful system follows them.

1. **Orchestrate, never participate.** The orchestrator never writes code. One role per agent, enforced programmatically, not by prompts. Role confusion is the #1 failure mode.

2. **Context is the bottleneck.** Managing what agents see matters more than which model they use. Target 40-60% context utilization (Horthy's rule). Progressive disclosure: load context only when needed.

3. **Progress lives in files, not in memory.** JSON state files, JSONL decision logs, git history. File-based state survives crashes, is human-inspectable, and persists across sessions.

4. **Bound everything.** Every loop needs max iterations. Every agent needs a timeout. Every fleet needs a pool limit. Every retry sequence has a cap (max 2, per Stripe). Unbounded anything is the path to cost explosion.

5. **Front-load specs, back-load review.** Human effort belongs at the beginning (specifications) and the end (review). The middle is where agents operate autonomously.

6. **Deterministic steps are not agent steps.** Git checkout, linting, CI triggers, file moves -- hardcode these. Only delegate creative/judgment work to the LLM. The Blueprint Pattern (Stripe) is the reference.

7. **Isolation is non-negotiable.** One git worktree per coding agent. No shared working directories. No merge conflicts during execution. Merge back after review passes.

8. **Observability before scale.** You cannot trust what you cannot see. Instrument every boundary: task assignment, tool calls, completion, cost. Three files per agent minimum: status.json, events.jsonl, log.md.

9. **Infrastructure beats intelligence.** "The tool that wins isn't the one with the best model; it's the one with the best infrastructure around the model" (Stripe). The harness is commodity; the orchestration layer is the value.

10. **Progressive deletability.** Build infrastructure that gets simpler as models improve. If your orchestration code keeps growing in complexity, you are over-engineering. The harness should shrink over time.

---

## 4. Pi Agent: The Verdict

Pi Agent is the correct choice. It offers maximum long-term control with zero vendor lock-in. The 70% orchestration score reflects absent built-in multi-agent -- not a capability ceiling. With extensions, Pi reaches any level of sophistication.

| Dimension | Strengths | Weaknesses | Mitigations |
|---|---|---|---|
| **Architecture** | SDK mode with programmatic session control; `context` event for transparent context injection; 200-token system prompt (18x more efficient than Claude Code) | No built-in multi-agent; must build from extensions | pi-subagents + pi-messenger provide production-ready multi-agent |
| **Extensibility** | 25+ lifecycle events, 7 categories; runtime tool registration; in-process TypeScript (microsecond latency) | 50-80 extensions only; gaps in memory, state machines, budget mgmt | Build custom extensions (~1,980 lines for full orchestrator) |
| **Model support** | 324+ models, 7 wire protocols, 20+ providers; per-agent model routing | None | N/A |
| **Stability** | MIT license, irrevocable, no CLA | v0.56.1, no semver guarantees; ~30 minor versions in 4 months | Pin versions; build adapter layer; monitor for 1.0 |
| **Bus factor** | Clean monorepo; oh-my-pi proves forkability | Bus factor of 1 (Mario Zechner) | MIT = forkable; OpenClaw guarantees active consumer |
| **Competition** | Community extensions are rich and growing | Anthropic shipped native Agent Teams (Feb 2026); platform-native solutions may win adoption | Build patterns generic solutions cannot match: roadblock recovery, tiered context, domain workflows |

**Action:** Adopt Pi as primary harness. Wrap it behind an `AgentRuntime` adapter interface (Overstory pattern) so you can swap harnesses if needed. Pin versions. Build the three custom extensions (discipline, state, loop) in Phase 1.

---

## 5. The Recommended Architecture

```
                    +---------------------------+
                    |     ORCHESTRATOR CORE     |
                    |  (Pi SDK, TypeScript)      |
                    |                           |
                    |  - Discipline Extension    |
                    |  - State Extension         |
                    |  - Loop Extension          |
                    |  - Health Extension         |
                    +---+-------+-------+---+---+
                        |       |       |   |
              +---------+   +---+---+   |   +----------+
              |             |       |   |              |
         +----v----+  +----v--+ +--v---v--+     +-----v------+
         | AGENT A |  |AGENT B| |AGENT C  |     | AGENT N    |
         | (SDK)   |  | (SDK) | | (tmux)  |     | (tmux)     |
         | Sonnet  |  | Haiku | | Opus    |     | Codex/etc  |
         | Coder   |  | Scout | | Reviewer|     | Specialist |
         +---------+  +-------+ +---------+     +------------+
              |            |          |                |
         [worktree A] [worktree B] [worktree C]  [worktree N]

    Communication:
      Orch->Agent: session.prompt() / tmux send-keys
      Agent->Orch: report_status tool (structured JSON)
      Agent<->Agent: Orchestrator-mediated (no direct mesh)

    Infrastructure:
      +------------------+  +----------+  +----------+
      | Context-Gateway  |  | Langfuse |  | Cognee   |
      | (compaction)     |  | (traces) |  | (memory) |
      +------------------+  +----------+  +----------+

    State:
      orchestrator-state.json  (centralized truth)
      events.jsonl per agent   (audit trail)
      appendEntry() per session (compaction-surviving)

    Quality Gates:
      Lint -> Unit Tests -> E2E (agent-browser) -> CodeRabbit -> Human Review
      Max 2 CI retries, then escalate model or skip+log
```

**Key design decisions:**
- **SDK mode** for in-process agents (fast, event-driven, MCP proxy inheritance). **tmux mode** for filesystem-isolated agents (parallel code editors in worktrees).
- **Hub-and-spoke topology.** Orchestrator dispatches, workers execute, results flow back. No mesh. If scaling past 7 agents, introduce team leads (1 supervisor per domain, 3-5 workers each).
- **Model routing by role.** Opus for orchestration/review, Sonnet for implementation, Haiku for scouts/simple tasks, local models for zero-cost file ops.
- **CLI over MCP** for git, GitHub (`gh`), Docker, npm. MCP only for browser automation and services without CLIs.

---

## 6. The Tool Stack

### MUST-HAVE (deploy in first 2 weeks)

| Tool | Purpose | Cost |
|---|---|---|
| Pi Agent + pi-subagents + pi-messenger + pi-mcp-adapter | Core harness + multi-agent + MCP | Free (OSS) |
| Context-Gateway | Background compaction proxy | Free (OSS) |
| Vercel agent-browser | E2E testing (93% less context) | Free (OSS) |
| Langfuse | Observability, cost tracking, traces | Free tier |
| Git worktrees | Per-agent filesystem isolation | Built-in |

### SHOULD-HAVE (weeks 3-6)

| Tool | Purpose | Cost |
|---|---|---|
| Cognee + Neo4j | Cross-session semantic memory | Free (OSS, self-hosted) |
| Beads + Dolt | Version-controlled task state | Free (OSS) |
| CodeRabbit | Automated code review gate | Free for OSS |
| Graphite | Stacked PRs, merge queue management | Free for OSS |
| Koylan's Agent Skills | Context engineering meta-framework | Free (OSS) |

### NICE-TO-HAVE (month 2+)

| Tool | Purpose | Cost |
|---|---|---|
| Trigger.dev | Durable execution, fan-out, scheduling | Free tier / usage-based |
| Shannon | Autonomous security pentesting | Contact for pricing |
| E2B / Daytona | Sandbox isolation per agent | Free-$150/mo |
| PostHog | Feature flags, agent behavior rollout | Free tier |
| SkillKit | Universal skill marketplace | Free (OSS) |
| Relay | Sub-5ms structured agent messaging | Free (OSS) |
| Mendral | Autonomous CI failure diagnosis | YC pricing |

**Estimated monthly cost (solo/small team):** $120-400 (API $100-300, VPS $20-50, SaaS free tiers)

---

## 7. The Implementation Roadmap

| Phase | Timeline | Effort | Key Milestones | Exit Criteria |
|---|---|---|---|---|
| **1. Foundation** | Weeks 1-2 | ~400 lines TS | Install Pi + extensions. Build `orchestrator-discipline` extension (no-code-writing enforcement, E2E gate, bounded reviews). Build `orchestrator-state` extension (JSON persistence, tiered context injection, compaction survival). Deploy Context-Gateway + Langfuse. | All 4 absolute rules enforced by code. State survives compaction. Observability live. |
| **2. Multi-Agent Loop** | Weeks 3-5 | ~550 lines TS | Create agent role definitions (coder, reviewer, tester, lint-fixer) as YAML-frontmatter markdown. Build `orchestrator-loop` extension (plan/spawn/wait/review/merge/test/done cycle). Build `orchestrator-health` (heartbeats, timeouts, stuck-detection). Add parallel mode via pi-messenger dependency graphs. Install Cognee + Beads. | Full orchestration loop operational in sequential and parallel modes. Semantic memory capturing cross-session knowledge. |
| **3. Migration & Polish** | Weeks 6-8 | ~1,030 lines TS | Migrate real projects from Claude Code to Pi orchestrator. Add model routing (Haiku/Sonnet/Opus by task type). Build TUI dashboard. Add CodeRabbit + Graphite as quality gates. Package as npm module. Measure cost reduction. | All projects running on Pi. 30% cost reduction target. Package published. |

**Total:** ~1,980 lines custom TypeScript + ~2,000 lines from community extensions = ~4,000 lines. Approximately 17 development days across 8 weeks.

---

## 8. People to Follow

| Person/Account | Why |
|---|---|
| **IndyDevDan** (@IndyDevDan) | Pioneer of agentic engineering. Published the trust-through-observability framework. Deepest thinker on what to build next. |
| **Elvis Sun** (@anthropicai_elvis) | Solo builder doing 94 commits/day with his "Zoe" orchestrator. Proof that the pattern works at individual scale. |
| **Mario Zechner** (@badlogicdames) | Pi Agent creator. Every Pi release note is an architecture lesson. Bus factor = 1, so watch closely. |
| **Steve Yegge** (@steve_yegge) | Gas Town creator. Beads/Dolt task state system is the most mature work-state architecture. GUPP principle. |
| **Geoffrey Huntley** (@geoffreyhuntley) | "Context is malloc without free." Sharpest articulator of context engineering as the core discipline. |
| **Dexter Horthy** (@dexhorthy) | 40-60% context utilization rule. Practical context engineering metrics from Manus AI. |
| **Addy Osmani** (@nicobailon) | Created pi-subagents + pi-messenger + pi-mcp-adapter. The entire Pi orchestration ecosystem. |
| **Muratcan Koylan** (@muratkoylan) | Agent Skills for Context Engineering (12.9K stars). Progressive disclosure, BDI mental states. |
| **Peter Steinberger** (@steipete) | Most prolific agent-infra practitioner. Practical patterns from running large-scale agent fleets. |
| **Matt Shumer** (@mattshumer_) | Identified Feb 2026 as the "psychological breakpoint." Best at reading where the market is heading. |

---

## 9. The Biggest Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **Pi bus factor of 1** -- Mario Zechner steps back or project stalls | Medium | Critical | MIT license ensures forkability. Build adapter layer so you can swap harnesses. Monitor oh-my-pi as backup fork. |
| 2 | **Anthropic ships native Agent Teams that make Pi irrelevant** | Medium-High | High | Implement patterns generic solutions cannot match (roadblock recovery, tiered context, domain workflows). The orchestration layer is the asset, not the runtime. |
| 3 | **Pi breaking changes** -- v0.x has no semver guarantees, ~30 minor versions in 4 months | High | Medium | Pin versions aggressively. Upgrade deliberately. Adapter layer absorbs breakage. Maintain CI tests against Pi. |
| 4 | **Cost explosion** from unbounded multi-agent runs | Medium | High | Fleet-wide budget caps (build in Phase 2). `--max-turns` on every automated run. Hard retry caps (max 2). Model routing (Haiku for cheap tasks). |
| 5 | **Context contamination** between agents degrades output quality | Medium | Medium | Strict orchestrator-worker context separation (Zoe pattern). File reservation with hook enforcement. Per-agent worktree isolation. `context` event for surgical injection. |

---

## 10. The One Insight

**The orchestrator is not the product. It is the factory that builds the products.**

Every hour invested in orchestrator quality compounds across every future project. Stripe invested in Minions and now merges 1,300+ agent-produced PRs per week. Elvis Sun invested in Zoe and now operates a solo SaaS with the output of a 3-5 person team. The orchestrator is the highest-leverage investment a builder can make because it is a multiplier on everything else. Do not optimize for shipping the orchestrator fast. Optimize for building the orchestrator right -- with discipline enforcement, context engineering, crash recovery, and observability baked in from day one. Then let it build everything else.

---

## 11. Document Index

### Synthesis Reports (start here)

| Document | Coverage |
|---|---|
| `SYNTHESIS_pi-ecosystem.md` | Pi core, extensions, community orchestrators, architecture recommendation |
| `SYNTHESIS_alternative-harnesses.md` | OpenCode, Goose, Aider, Cline, Codex CLI, Roo Code, Claude Agent SDK, harness-agnostic tools |
| `SYNTHESIS_vision-strategy.md` | 28 visionary profiles, build vs. buy, 7 universal principles, implementation roadmap |
| `SYNTHESIS_tools-landscape.md` | Must-have tools, memory architecture, automation, quality pipeline, costs |
| `SYNTHESIS_deep-dives.md` | Stripe Minions, Elvis Sun/Zoe, Gas Town, Relay, YC W2026, infrastructure hidden gems |

### Deep Research Documents (by topic)

**Pi Agent Ecosystem (10 docs)**
- `pi-core-sdk-deep-architecture.md` -- SDK mode, event system, token efficiency
- `pi-subagents-deep-analysis.md` -- Async delegation, chain pipelines, observability triplet
- `pi-messenger-deep-analysis.md` -- File-based chat rooms, Crew orchestration engine
- `pi-mcp-adapter-deep-analysis.md` -- Lazy MCP proxy, metadata caching, direct-tool escape
- `oh-my-pi-deep-analysis.md` -- Batteries-included fork, hashline edits, fuse-overlay
- `openclaw-pi-internals-deep-analysis.md` -- Two-level lane queue, pre-compaction memory flush
- `pi-community-extensions-complete-map.md` -- Full 50-80 extension ecosystem map
- `pi-agent-mario-zechner-deepdive.md` -- Creator profile, philosophy, roadmap signals
- `pi-roadmap-future-direction.md` -- Risk assessment, API stability, competition analysis
- `real-world-pi-orchestrators.md` -- Production Pi orchestration case studies

**Alternative Harnesses (7 docs)**
- `opencode-deep-architecture.md` -- HTTP+SSE server, TypeScript SDK, Teams
- `alternative-oss-harnesses-deep.md` -- Goose, Aider, Cline, Codex CLI, Roo Code
- `claude-agent-sdk-orchestration.md` -- Anthropic's official framework deep dive
- `harness-comparison-matrix.md` -- 10 harnesses x 20 dimensions scored
- `harness-agnostic-orchestration-tools.md` -- Vibe Kanban, Overstory, agtx, Bridle
- `workflow-engines-for-agents.md` -- Temporal, Inngest, DBOS, LangGraph evaluation
- `claude-code-multiagent-internals.md` -- Task tool, hooks, stream-json internals

**Vision & Strategy (5 docs)**
- `indydevdan-benchmark-deep-dive.md` -- Trust-through-observability framework
- `visionary-agentic-engineers-2026.md` -- 28 practitioner profiles and consensus
- `orchestrator-architecture-patterns-deep.md` -- Topologies, communication, state patterns
- `build-vs-buy-orchestration-analysis.md` -- Hybrid verdict, framework economics
- `pi-orchestrator-implementation-roadmap.md` -- Phase-by-phase build plan

**Tools & Infrastructure (5 docs)**
- `agent-memory-context-tools-deep.md` -- Cognee, Mem0, Beads, Context-Gateway
- `agent-skills-orchestration-tools.md` -- SkillKit, Playbooks, obra/superpowers, Koylan
- `pi-automation-deployment-guide.md` -- Cron, Trigger.dev, VPS, E2B, Daytona
- `browser-security-testing-tools.md` -- agent-browser, Shannon, Bowser, Hyperbrowser
- `airtable-agent-harnesses-frameworks.md` -- Master reference of 200+ collected tools

**Deep Dives (5 docs)**
- `stripe-minions-deep-analysis.md` -- Blueprint pattern, context curation, retry caps
- `elvis-sun-orchestrator-analysis.md` -- Zoe architecture, proactive orchestration, model routing
- `elizaos-relay-swarms-analysis.md` -- Framework verdicts, Relay messaging, Swarms topologies
- `yc-w2026-agent-companies.md` -- Compresr, Terminal Use, Orthogonal, market signals
- `airtable-misc-hidden-gems.md` -- Langfuse, Trigger.dev, Dify, Resend, Typst

**Gas Town / Yegge Series (8 docs)**
- `yegge-wasteland-thousand-gas-towns_deep-analysis.md`
- `yegge-gas-town-welcome_deep-analysis.md`
- `yegge-future-coding-agents_deep-analysis.md`
- `architecture-comparison_yegge-vs-lthread-orchestrator.md`
- `vision-philosophy-comparison_yegge-vs-lthread.md`
- `actionable-insights_yegge-for-lthread-orchestrator.md`
- `MASTER-SYNTHESIS_yegge-wasteland-vs-lthread-orchestrator.md`
- `gastown-bloat-analysis.md`

**Additional Research (10 docs)**
- `MASTER-SYNTHESIS_gastown-vs-pi-agent-custom-harness.md`
- `MASTER-SYNTHESIS_dotta-network-multiagent-intelligence.md`
- `dotta-agent-orchestrator-profile.md` / `dotta-network-accounts-tools-reference.md`
- `pi-orchestrator-architecture-blueprint.md`
- `lthread-to-pi-migration-feasibility.md`
- `oss-coding-agents-landscape.md`
- `multi-agent-frameworks-analysis.md`
- `corporate-coding-agents-jules-amp.md`
- `agent-orchestration-patterns-2026.md`
- `indydevdan-strategic-vision-analysis.md`

---

*73 research documents. 5 synthesis reports. 1 landscape overview. Open the synthesis reports for depth; open the deep research docs for primary sources.*
