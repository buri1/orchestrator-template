# Multi-Business Portfolio Control Plane

> **Federated hub-and-spoke architecture for managing five business lines (Client Work, Agent Swarm, SaaS Factory, Finance, Marketing) under a thin portfolio orchestration meta-layer with Notion as the unified intelligence surface.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_110029_codex-research-multi-business-system-blueprint.md, 2026-03-06_analysis-multi-business-architecture.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

The central architectural question -- one monolithic system or five federated systems -- resolves decisively in favor of federated systems with a thin orchestration meta-layer. Each business line (Client Work at $50K/week, Agent Swarm Experiments, SaaS Factory, Finance Agent, Marketing System) has fundamentally different cadences, compliance requirements, risk profiles, and agent configurations. Forcing them into a single system creates domain overload; leaving them fully isolated wastes the compounding knowledge that is the primary competitive advantage.

The architecture is a hub-and-spoke model: a Portfolio Control Plane (the hub) provides cross-business visibility, resource allocation, and shared infrastructure, while each business line (the spokes) runs its own agent configuration, state management, and deployment pipeline. The control plane operates through Notion as the unified intelligence layer with portfolio dashboards, cross-business metrics, and a shared knowledge base. The L-Thread Orchestrator evolves from managing agents within a single project to managing business lines across a portfolio.

The system has three layers: a Meta-Layer (Notion + Portfolio Orchestrator) for cross-business visibility and resource allocation, a Business Line Layer with independent agent configurations per line each with its own CLAUDE.md and state files, and a Shared Infrastructure Layer providing common auth, payments, hosting, CI/CD, and boilerplate. Conservative revenue potential at Month 12: $130K-$200K MRR across all five lines, with client work as the anchor.

---

## Key Findings

### The Five-Layer System Architecture

**Layer 1: Business Portfolio Layer** (human-directed)
- Owns: which businesses exist, target economics, pricing model, trust posture, autonomy limits
- Stores durable business objects: business registry, operating constraints, pricing/margin targets, risk class, approval policy
- This is the Burak-specific adaptation of Elvis Sun's Zoe pattern: the top layer holds real business context; coding agents do not need it.

**Layer 2: Goals and Projects Layer** (translation layer)
- Canonical hierarchy: Business -> Product -> Goal -> Project -> Task -> Run -> Artifact -> Verdict
- Deterministic and inspectable. Does not ask an LLM to remember the portfolio.
- Materializes goals and projects into files, state snapshots, and append-only logs.

**Layer 3: Orchestration Control Layer** (shared substrate)
- Project registry, scheduler, priority engine, model routing by role and cost tier
- Agent adapter layer for Claude Code / Codex / Pi-style runtimes
- Approval/escalation rules, shared pattern memory (evolved from FutureLearnings), cost/token/throughput accounting
- This is where the current L-Thread Orchestrator should evolve, not be replaced.

**Layer 4: Agent Execution Layer** (intentionally boring, replaceable)
- Bounded worker roles: coder, reviewer, e2e tester, research/doc agent, lint/refactor agent
- Rules: one job, narrow context, isolation, artifacts + handoff payload
- Default pool: 2-3 concurrent workers per project cell.

**Layer 5: Deterministic Infrastructure** (production substrate)
- Git branches/worktrees, tmux/Teams session management, JSON/JSONL state, structured events
- CI, tests, E2E, screenshot diffing, MCP allowlists per role, notifications

### Federated vs. Unified Decision

| Factor | Unified | Federated + Meta-Layer |
|--------|---------|----------------------|
| Context window | Overloaded (all lines compete for tokens) | Clean (dedicated context per line) |
| Compliance isolation | Cross-contamination risk (gov data in experiment context) | Hard isolation between lines |
| Complexity growth | Exponential | Linear |
| Failure blast radius | One failure affects everything | Contained per line |
| Knowledge sharing | Automatic but noisy | Explicit via shared Notion KB |

**Verdict: Federated.** The DSGVO compliance requirements of government client work alone make isolation mandatory. An agent that scraped local businesses for a cold email experiment cannot also hold Staatskanzlei project context.

### Control Plane vs. Execution Plane

| Aspect | Control Plane | Execution Plane |
|--------|--------------|-----------------|
| Lifespan | Long-lived | Ephemeral |
| Context | Business, portfolio, goals, policies | Task-local only |
| Responsibility | Decide, route, budget, gate, observe | Implement, review, test, report |
| State | Canonical and durable | Scratch plus handoff artifacts |
| Replaceability | Stable system asset | Swappable runtime layer |

**Design rule**: Business context stops at the control plane boundary.

### Per-Business-Line Strategy

- **Client Work ($50K/week)**: Do not touch. L-Thread Orchestrator works and earns. Build new tooling as separate modules; migrate only after proving better approach on non-critical project.
- **Agent Swarm Experiments**: Disposable modules. Each experiment = new directory, new agent config, shared task protocol. Success = promotion to real module. Failure = `rm -rf`.
- **SaaS Factory**: Each product gets its own module. Shared infrastructure built only when 2+ products need the same thing. Kill criteria: <100 users AND <$200 MRR at week 12.
- **Finance Agent**: Automated Notion workflows already built. P4 priority. Monthly review cadence. 5% of weekly budget.
- **Marketing System**: Embarrassingly parallel (Stripe pattern). Social media, content, campaigns have zero coordination overhead. Hormozi frameworks as templates.

### Resource Allocation (Claude Max $200/month)

| Business Line | Priority | Budget | Cadence |
|---------------|----------|--------|---------|
| Client Work | P0 (revenue) | 50% | Daily, 4-6 hours focused |
| SaaS Factory | P1 (growth) | 20% | 2-3 sessions/week |
| Agent Swarm | P2 (bet) | 15% | 1-2 sessions/week, batch |
| Marketing | P3 (leverage) | 10% | Weekly batch, templates |
| Finance Agent | P4 (ops) | 5% | Automated, monthly review |

Critical constraint: Never run more than 2 parallel Claude sessions to avoid the 4-hour budget burnout scenario.

### Risks If Overbuilt

1. **Context collapse**: Giant unified system mixes portfolio strategy, project planning, and code execution into same prompt surface.
2. **Coordination tax**: Super-quadratic overhead (exponent 1.724) from coupling 4+ concerns.
3. **Premature platforming**: Custom broker, distributed A2A, heavy memory store will slow productization.
4. **Trust debt**: Autonomy expanding faster than logs, quality gates, and approval trails.
5. **Provider lock-in**: Business logic locked to one runtime/model is a mistake.

### First Productization Slice: Active Maintenance Control Tower

Highest leverage because it is narrow, trustable, repeatable, and directly aligned with the current orchestrator:
- One business lane, 1-3 repos maximum
- One issue intake path: GitHub issue, CI failure, or Sentry incident
- One execution chain: coder -> reviewer -> E2E verifier -> PR/report
- One human approval boundary before merge/deploy
- Recurring revenue instead of one-off project revenue

---

## Actionable Insights

1. **Unify the substrate, not the workflows.** One shared control substrate (state model, event model, policy model, quality-gate model) powers several bounded business/product modules.

2. **Context switching without state loss.** Externalized state per business line (`_bmad/portfolio/{business-line}/state.json`). Pre-compact hook writes full context to state file before switching. Agent loads target state file and resumes with full context.

3. **Government work compliance is non-negotiable.** DSGVO, BSI IT-Grundschutz, BSI C5 (if cloud), NIS2, EU AI Act (Art. 50 transparency, effective August 2026), XRechnung for invoicing, Vergaberecht for procurement. Agent activity logs provide audit trails that traditional devs never produce -- this is a competitive advantage.

4. **SaaS Factory uses kill criteria ruthlessly.** Maximum 3 active products. Each surviving product adds to MRR base. Target: 3-5 products at $1K-5K MRR each.

5. **Build the Active Maintenance Control Tower first.** It creates recurring revenue, is narrow enough to audit and sell, compounds pattern memory fast, and directly uses the current orchestrator's strengths.

6. **Lead gen in Germany must use Briefpost.** UWG Section 7 makes cold email effectively illegal for initial B2B contact. Physical letter with QR code to demo page -> opt-in form -> then email follow-up is legal. Budget EUR 500-1,500/month for 500-1,000 letters.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](../reference/master-blueprint.md) | Master blueprint defines the overall system; this entry details the portfolio control plane layer |
| [reference/finance-agent-domain-module.md](../reference/finance-agent-domain-module.md) | Finance Agent is one spoke in the hub-and-spoke architecture |
| [reference/build-strategy-analysis.md](../reference/build-strategy-analysis.md) | Build strategy (thin shared layer -> grow -> rebuild) governs how the control plane is constructed |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Resource allocation and budget constraints for multi-business operation |
| [reference/deterministic-llm-boundary.md](../reference/deterministic-llm-boundary.md) | Control plane is deterministic; execution plane contains LLM workers |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Zoe pattern: orchestrator holds business context, coding agents see only code |
| [orchestration-platforms/stripe-minions.md](../orchestration-platforms/stripe-minions.md) | One-shot isolated execution pattern used for marketing (embarrassingly parallel) |
