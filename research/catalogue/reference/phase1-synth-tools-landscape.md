# Phase 1 Synthesis: Tools Landscape

> **Tier-1 tools, four-layer memory architecture, three-tier deployment stack, four-stage quality pipeline, and full budget projections for production agent orchestration.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `research/2026-03-05_SYNTHESIS_tools-landscape.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

This synthesis maps the complete tooling landscape for a production agent orchestrator in March 2026, covering agent harnesses, memory/context, skills/orchestration, automation/deployment, and browser/security/testing tools across five research documents. Six tools emerged as Tier 1 (competitive baseline): Claude Multi-Agent Quickstart, CodeMachine-CLI, BMAD Method, Context-Gateway, Vercel agent-browser, and Shannon.

The memory architecture consensus is a layered system mirroring human cognition: working memory (context window), short-term (per-agent session), episodic (cross-session via Cognee/Mem0), semantic (permanent knowledge graph), procedural (skills/tools), and task state (Beads + Dolt). The deployment stack progresses from cron + headless CLI (day 1) through Trigger.dev event-driven orchestration (weeks 2-4) to VPS + tmux always-on agents (month 2+). The quality pipeline has four stages: code generation with property-based testing, automated review (CodeRabbit), security/E2E (Shannon + agent-browser), and production monitoring (PostHog + Sentry + Mendral).

Estimated monthly cost for a solo/small team: $120-400. Production scale: $2,000-8,000.

---

## Key Findings

### Tier-1 Must-Have Tools

| Tool | Function | Why Tier 1 |
|------|----------|-----------|
| **Claude Multi-Agent Quickstart** | Two-agent git-lock synchronization pattern | 86.8% SWE-bench; git-lock simpler than JSON state |
| **CodeMachine-CLI** | Engine abstraction layer | Registry-based provider pattern treats Claude/Codex/Gemini/Pi as interchangeable |
| **BMAD Method** (38.9K stars) | Scrum-simulation framework | "Story files as context containers" eliminates context-passing complexity |
| **Context-Gateway** (Compresr) | Background context compression proxy | Zero-interruption compaction, drop-in via `ANTHROPIC_BASE_URL`. Single highest-ROI integration |
| **Vercel agent-browser** | Browser automation CLI | 93% context reduction vs Chrome DevTools MCP via element refs (`@e1`, `@e2`) |
| **Shannon** | Autonomous AI pentester | 96.15% on XBOW security benchmark. Built on Claude Agent SDK |

### Memory Architecture Layers

| Layer | Duration | Tool | Purpose |
|-------|----------|------|---------|
| Working Memory | Current turn | Context window | Immediate task execution |
| Short-Term | Current session | Per-agent local store | Conversational continuity |
| Episodic | Cross-session | Cognee or Mem0 | "What happened when" |
| Semantic | Permanent | Cognee knowledge graph | "What is true about the codebase" |
| Procedural | Permanent | Skills + tool definitions | "How to do things" |
| Task State | Permanent | Beads + Dolt | Structured work tracking with branching |

**Key tools:**
- **Cognee**: Self-hosted semantic memory. ECL pipeline (Extract, Cognify, Memify, Search) builds knowledge graph of codebase entities. Eliminates ad-hoc rediscovery.
- **Mem0**: Managed alternative ($24M Series A, 26% higher accuracy than OpenAI's built-in memory). Two-phase extraction/update pipeline.
- **Beads + Dolt**: Git-like branching for task state. Hash-based IDs prevent merge collisions. Cell-level merges for parallel agents.
- **Context-Gateway Pattern**: Background process monitors token usage, pre-computes summaries at 70% utilization, swaps in at 90%. Agents run longer without quality loss.

**Anti-patterns**: single global context store (pollution), synchronous compaction (waste), full-history replay (use extracted facts), append-only memory without decay (noise generator).

### Deployment Stack

| Tier | Timeline | Infrastructure | Cost |
|------|----------|---------------|------|
| Tier 1 | Day 1 | Cron + headless CLI (`claude -p "..." --max-turns 25`) + GitHub Actions | $0 |
| Tier 2 | Weeks 2-4 | Trigger.dev: no timeouts, checkpoint-resume, fan-out, queue concurrency | Usage-based / free tier |
| Tier 3 | Month 2+ | VPS + tmux (Hetzner ~$5-50/mo) + mosh + Tailscale | $5-50/mo (3-5x cheaper than cloud) |

**Sandbox isolation:**
- **E2B** (Firecracker microVMs, ~150ms startup): Best for one-shot ephemeral tasks. 88% Fortune 100. Free tier + $100 credit.
- **Daytona** (Docker, 27-90ms startup): Best for iterative stateful tasks. S3-backed volumes, SSH access.

### Quality Pipeline

| Stage | Tools | Function |
|-------|-------|----------|
| 1. Code Generation | E2B sandbox + property-based testing + Blueprint pattern | Interleave deterministic steps with agentic; max 2 CI retries |
| 2. Code Review | CodeRabbit ($550M valuation, 46% bug detection) + Graphite ($52M, stacked PRs) | Median PR merge time: 24hr to 90min |
| 3. Security & E2E | Shannon (96.15% exploit detection) + Vercel agent-browser (93% less context) + Bowser | Authenticated browser testing, cloud scaling |
| 4. Production Monitoring | PostHog (traces, feature flags, cost) + Sentry (94.5% root-cause) + Mendral (CI diagnosis, 75% PR acceptance) | Unified agent observability |

### Skills & Context Standards

- **SKILL.md standard** (Anthropic): YAML frontmatter triggers + markdown instructions + lazy resource subdirectories
- **SkillKit**: Package manager for 15K+ marketplace, 44+ agent formats, `--universal` flag for non-Claude agents
- **Koylan's Agent Skills** (12.9K stars): Progressive disclosure, minimum viable context, BDI mental states
- **obra/superpowers**: Fresh-subagent-per-task with mandatory two-stage review (spec compliance + code quality), TDD enforcement

### Budget Projections

| Scenario | API Monthly | Infrastructure | SaaS | Total |
|----------|-----------|----------------|------|-------|
| Solo developer | $30-100 | $20-50 | $0 (free tiers) | **$50-150** |
| Small team | $100-300 | $20-50 | $0 (free tiers) | **$120-400** |
| Production scale | $1,000-5,000 | $100-250 | $200-500 + $500-2,000 (est.) | **$2,000-8,000** |

Average cost per developer-day in 2026: ~$6. Agent Teams multiply cost ~4x.

---

## Actionable Insights

1. **Context-Gateway is the single highest-ROI integration** -- zero code changes to agents, instant benefit for all tmux-spawned workers. Deploy first.
2. **Stripe's Blueprint pattern is the most impactful architectural insight** -- interleave deterministic steps with agentic steps. Never let the LLM decide what should be deterministic.
3. **The merge problem is unsolved without Graphite** -- parallel agents producing independent PRs create a merge conflict wall. Stacked PRs with partitioned merge queues are the answer.
4. **Memory is layered, not monolithic** -- working + semantic (Cognee) + task state (Beads) + compaction (Context-Gateway). Omitting any layer degrades the system.
5. **CLI over MCP for token efficiency** -- Bowser and agent-browser deliberately avoid MCP for browser automation. Apply this principle broadly.
6. **Security is the gap most orchestrators ignore** -- Shannon at 96.15% exploit detection fills it.
7. **Cost control requires `--max-turns` on every automated run** -- a runaway agent without turn limits can consume hundreds of dollars.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/harness-comparison-matrix.md](../reference/harness-comparison-matrix.md) | Quantitative tool comparison underlying Tier 1 selections |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Pi MCP adapter token efficiency data |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | DeepMind coordination overhead confirming Blueprint pattern value |
| [reference/master-blueprint.md](../reference/master-blueprint.md) | System architecture consuming these tool recommendations |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Model routing and proactive orchestration patterns from Zoe |
| [practitioners/steve-yegge.md](../practitioners/steve-yegge.md) | Beads/Dolt task state system detail |
| [practitioners/dotta.md](../practitioners/dotta.md) | Budget-as-safety and heartbeat patterns referenced in deployment |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | Observability-first philosophy validating Langfuse requirement |
| [reference/phase1-synth-deep-dives.md](phase1-synth-deep-dives.md) | Stripe, Elvis Sun, YC W2026 source analyses |
| [reference/phase1-synth-pi-ecosystem.md](phase1-synth-pi-ecosystem.md) | Pi extension ecosystem providing the harness layer |
