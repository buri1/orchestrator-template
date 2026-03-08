# Hybrid Build Strategy Analysis

> **Evidence-based build strategy: thin shared layer (3 days) -> run under load (60 days) -> informed rebuild (days 60-90) -> strangler fig absorption, drawing on Composio's self-building orchestrator, Elvis Sun's rebuild pattern, the strangler fig, and the disposable software thesis.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_analysis-build-strategy.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

The question of how to build the unified agent system -- given existing working systems (L-Thread Orchestrator, Finance Agent) and $50K/week contract revenue -- resolves to a specific hybrid: build a thin shared layer now (2-3 days), keep existing systems running untouched, grow the new layer by absorbing functions one at a time, and accept one planned rebuild of the shared layer after 60-90 days of learning. This is not a compromise but the strategy that multiple evidence streams converge on: Composio's self-building orchestrator (40,000 lines of TypeScript built by the agents it orchestrates), Elvis Sun's rebuild-from-PressPulse trajectory, the strangler fig pattern (Amazon, Netflix), the disposable software movement (Andreessen Horowitz, Google Cloud), and the Second System Effect warning (Fred Brooks).

The core insight is that in the agent era, rebuild cost is not proportional to system complexity -- it is proportional to how well you can specify what you want. If you spend 60-90 days operating V1 and understand exactly what it needs to do, agents can rebuild it in days. The bottleneck is never the coding; it is the knowing. Every frontier capability (knowledge graphs, self-improving prompts, confidence scoring, ADAS) requires operational data to be useful. Build the system that generates the data first, then add capabilities when you have data to feed them.

---

## Key Findings

### Three Strategies Evaluated

**Strategy A: Monolithic Design-First (REJECTED)**
- Spend 2-4 weeks designing the unified system before writing code
- Failure modes: Second System Effect (104 research docs of ideas = extreme over-engineering risk), requirements shift weekly in agent tooling, $100K opportunity cost at $50K/week revenue, super-quadratic coordination overhead (exponent 1.724) from coupling 4+ concerns
- Verdict: Wrong for solo operator under revenue pressure with unstable requirements

**Strategy B: Pure Incrementalism (CLOSE BUT INCOMPLETE)**
- Smallest possible shared layer, add capabilities one by one, never tear down until replacement proven
- Strengths: Revenue continuity, learning under load, reversibility
- Failure modes: Architectural debt accumulation after 20+ increments, local optima trap, "never rebuild" calcification
- Verdict: Missing the moment when accumulated learnings justify a clean rebuild

**Strategy C: Build Fast, Learn, Rebuild (CORRECT IN PRINCIPLE)**
- Accept V1 will be wrong, build it fast, use for real work, rebuild when you understand actual requirements
- Evidence: Elvis Sun (PressPulse -> Zoe), Composio (bash scripts -> TypeScript via self-orchestration), Brooks ("plan to throw one away")
- New economic argument: Claude Code ships 35K lines in 7 hours, Rakuten completed 12.5M-line implementation in 7 hours. Rebuilding a 5-10K line system = hours, not weeks.
- Failure mode: Prototype does not get thrown away under revenue pressure
- Verdict: Correct, but needs guardrails to ensure the rebuild actually happens

### The Hybrid Strategy (What to Actually Do)

**Phase 1: Thin Shared Layer (Days 1-3)**

Three things, nothing more:

1. **Unified State Schema**: Single JSON schema any orchestrator (L-Thread, Finance Agent, future systems) can write/read. Fields: task ID, type, status, assigned agent, parent system, timestamps, outcome, cross-references. Not a database -- a file format.

2. **Shared Notification Layer**: One webhook/Telegram/Slack endpoint any system can post to. Format: `[system_name] [severity] [message]`. Replaces per-system notification logic.

3. **Shared Task Interface**: Minimal protocol: any system emits `{type, priority, context, constraints}`. Any system can claim and execute. This is the strangler fig facade.

No framework, no abstractions, no plugin system, no database. JSON files, a webhook, and a task format.

**Phase 2: Run Under Load (Days 4-60)**

Keep L-Thread Orchestrator running client work. Keep Finance Agent running finances. Both emit tasks and state updates through the thin shared layer. Observe:
- What tasks actually cross system boundaries?
- What state do you actually need to see aggregated?
- Where does the thin layer break?
- What manual steps should be automated?

This phase is learning, not building. Every friction point is a specification for V2.

**Phase 3: The Informed Rebuild (Days 60-90)**

After 60 days of real operation, you know:
- Which of the 104 research findings actually matter (in practice, not theory)
- What the real integration points between business lines are
- Where the thin layer was sufficient vs insufficient
- What your actual state management needs are (flat JSON? graph? database?)

Rebuild the shared layer -- not the whole system. Existing modules stay running. 2-5 days with agents.

**Phase 4: Absorb and Simplify (Days 90-180)**

Strangler fig process: migrate capabilities that overlap with the shared layer one at a time. Each migration is a PR, tested, reversible. As capabilities move, old systems shrink. When an old system has nothing left to do, archive it.

### Decision Framework (When to Extend, Build New, or Rebuild)

| Action | Criteria |
|--------|----------|
| **Extend existing** | Closely related to core purpose, <500 lines, architecture supports it, single consumer |
| **Build new module** | Different business line, different state needs, useful to 2+ systems, <2 days and independent |
| **Rebuild component** | Can articulate exactly what's wrong (specifically), 30+ days of operational data, <5 days, old system keeps running |
| **Full rebuild** | Fundamental architecture assumptions changed, migration cost exceeds rebuild cost, 90+ days of operational data, <2 weeks |
| **Never rebuild** | Bored with current system but it works, read about better architecture but haven't hit current limits, want to incorporate unproven frontier research, revenue would be interrupted |

### What Not to Build Yet

| Capability | When | Why Wait |
|-----------|------|----------|
| Cross-project knowledge graph (Cognee) | Day 90+ | Need operational data first |
| Self-improving prompt system (DSPy) | Day 120+ | Need stable system to improve |
| Confidence scoring engine | Day 60+ | Need 60 days of performance data to score |
| Architecture search / ADAS | 2027+ | Research-grade, not production-ready |
| Learned routing model | After training data exists | Need data from own operations |
| Tool genesis pipeline | After shared layer stabilizes | Foundation must be stable first |

### Anti-Pattern Warnings

**The Second System Effect** (Fred Brooks): With 104 research docs of ideas, the temptation to incorporate everything into V2 is extreme. The thin shared layer is deliberately minimal to avoid this.

**The Inner Platform Effect**: Building a system so configurable it becomes a poor replica of the platform it runs on. Signs: building "task routing" when Claude Code already has Task tool, building "state management" when JSON + git already work, building "plugin system" when MCP already provides dynamic tool registration.

**Antidote**: Build only what you have needed in the last 30 days. Not what you might need. Not what the research says is frontier. What you have actually needed and did not have.

---

## Actionable Insights

1. **Do not design a unified system. Grow one.** The orchestration layer is the compounding asset. You build a compounding asset by running a real system under real load, measuring what matters, and rebuilding the core once you know what you are actually building.

2. **This week: JSON schema + webhook + task format.** Nothing more. The thin shared layer is so small there is nothing to over-engineer.

3. **Zero revenue interruption throughout.** Existing systems keep running and earning while the shared layer grows alongside them.

4. **The one planned rebuild is at Day 60.** Not Day 7 ("I read a better paper"), not Day 180 ("eventually"). Day 60, informed by 60 days of operational data. Your agents do the coding; you do the specifying.

5. **Every frontier capability requires operational data.** Knowledge graphs need multiple projects. Self-improving prompts need a stable system. Confidence scoring needs 60 days of performance data. Build the data-generating system first.

6. **The situation is closer to Elvis Sun than to IndyDevDan.** Elvis is building a business under revenue pressure (build fast, rebuild the core). Dan is building engineering knowledge (evolve slowly). Revenue pressure means the rebuild pattern fits better than pure incrementalism.

7. **What would make this wrong**: If Anthropic releases native multi-system orchestration or Pi Agent ships a unified agent platform. In that case, evaluate adoption vs building. But the thin shared layer costs 2-3 days, making abandonment cheap.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](../reference/master-blueprint.md) | Master blueprint is the target state; this entry defines the build sequence to get there |
| [reference/multi-business-control-plane.md](../reference/multi-business-control-plane.md) | The control plane is what gets built via this strategy |
| [reference/deterministic-llm-boundary.md](../reference/deterministic-llm-boundary.md) | Deterministic core is built first (Step 1 of recommended build order) |
| [reference/existing-system-patterns.md](../reference/existing-system-patterns.md) | Existing system patterns inform what the thin shared layer must accommodate |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Revenue and cost economics constrain the build timeline |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Elvis Sun's PressPulse -> Zoe rebuild trajectory is the primary analogy |
| [orchestration-platforms/stripe-minions.md](../orchestration-platforms/stripe-minions.md) | Stripe's incremental "blueprints" approach validates the grow-not-design pattern |
