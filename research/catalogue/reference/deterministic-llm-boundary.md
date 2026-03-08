# The Deterministic-LLM Boundary Framework

> **Empirically validated 70/30 architecture splitting deterministic engineering (routing, state, gates, CI, scheduling) from LLM-powered capabilities (code writing, failure diagnosis, summarization), with a sharp classification of every system component.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_110029_codex-research-phase2-architecture-principles.md, 2026-03-06_analysis-deterministic-llm-boundary.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

The principle "orchestration should be deterministic as much as possible; only the engineering should be LLM-based" is now empirically validated by multiple independent production systems operating at scale in early 2026. Five convergent evidence streams confirm it: Stripe (1,300+ PRs/week -- "The walls matter more than the model"), OpenAI Codex (1M lines, zero manually written code -- harness engineering with deterministic linters and structural tests), Praetorian (39-agent platform -- "LLM is a nondeterministic kernel process wrapped in a deterministic runtime environment"), QuantumBlack/McKinsey ("orchestration layer stays deterministic; agents shouldn't decide what comes next"), and DeepMind (centralized deterministic coordination has the lowest error amplification at 4.4x vs 17.2x for independent agents).

Martin Fowler codifies the principle: "A harness is deterministic scaffolding that keeps non-deterministic behavior within useful boundaries." The boundary is not blurry -- it is sharp. Every system component falls cleanly into one of three categories: (A) must be deterministic, (B) must be LLM-powered, or (C) benefits from a hybrid where a deterministic frame wraps an LLM core. The document maps every component across task management, code generation, quality assurance, deployment, observability, and business operations.

The practical architecture is a "probabilistic coprocessor inside a deterministic shell" -- LLMs generate options, code, analyses, summaries, and proposed plans; deterministic software decides what runs, what blocks, what retries, and what escalates. The scaling unit is a small supervised cell: 1 orchestrator, 2-5 workers, deterministic gates, 1 review queue. Scale by replicating cells, not by building a giant swarm.

---

## Key Findings

### Why the Boundary Exists

LLMs are nondeterministic -- given the same input, they may produce different outputs. This is a feature for creative tasks (code writing, problem diagnosis) and a catastrophic liability for infrastructure tasks (state management, file operations, CI/CD execution). When you let an LLM decide routing, state transitions, or deploy permissions, every failure mode becomes probabilistic rather than debuggable.

### The Complete Component Classification

**Must Be Deterministic (70%)**

| Component | Why Deterministic | Evidence |
|-----------|-------------------|----------|
| Task state management | State transitions must be auditable and replayable | Stripe: "All state transitions are deterministic" |
| Routing rules | Wrong routing wastes all downstream agent work | DeepMind: centralized routing = lowest error amplification |
| Retry logic | Uncontrolled retries cause infinite loops | Praetorian: deterministic retry budgets (max 3 per step) |
| Escalation thresholds | Must trigger reliably, not probabilistically | All systems: hard thresholds, not LLM judgment |
| File/worktree isolation | Merge conflicts from non-deterministic file access | Stripe: one-shot isolated execution per task |
| CI, lint, tests, typechecks | Binary pass/fail must not depend on model mood | OpenAI: "the harness validates" |
| Merge criteria | Security-critical decision | All systems: deterministic gate stacks |
| Deploy permissions | Irreversible action | No system uses LLM for deploy decisions |
| Budget limits (tokens, runtime) | Must enforce hard cutoffs | Praetorian: deterministic cost budgets |
| Logging, traces, audit history | Must capture everything regardless of LLM behavior | Martin Fowler: "harness observability" |
| Scheduling | Must fire reliably | Finance Agent: LaunchAgent plist (not LLM) |
| Notifications | Must deliver regardless of context | Both systems: shell scripts, not prompt logic |

**Must Be LLM-Powered (30%)**

| Component | Why LLM | Evidence |
|-----------|---------|----------|
| Code writing / implementation | Creative, context-dependent generation | Stripe, OpenAI: LLM generates within deterministic constraints |
| Failure diagnosis | Requires reasoning about novel error patterns | Praetorian: LLM analyzes; harness decides retry strategy |
| Spec expansion into subtasks | Requires understanding intent and context | QuantumBlack: LLM decomposes; deterministic system tracks |
| Diff review / anomaly explanation | Pattern recognition across code changes | Elvis Sun: triple-model review gate |
| Summarization and reporting | Natural language generation | All systems: LLM summarizes, human reviews |
| Drafting human-facing artifacts | Style, tone, context-awareness | Finance Agent: German-language draft generation |
| Strategy and negotiation advice | Requires domain reasoning | Finance Agent: creditor-specific playbooks |

**Hybrid (Deterministic Frame + LLM Core)**

| Component | Deterministic Frame | LLM Core |
|-----------|--------------------|----------|
| Linting / code quality | Static analysis rules, threshold enforcement | AI-powered pattern detection, style suggestions |
| Test generation | Template structure, coverage requirements | Actual test case logic, edge case discovery |
| Context assembly | File selection rules, token budgets | Relevance ranking, summarization |
| Adversarial verification | Run structure, pass/fail criteria | Generate adversarial test cases |
| Post-mortem analysis | Incident format, required fields | Root cause hypothesis, fix suggestions |
| Confidence scoring | Score calculation formula, threshold rules | Feature extraction from agent outputs |

### Architecture Principles (Non-Negotiable)

1. **The orchestrator manages; workers execute; validators decide; humans own accountability.** No agent may mark its own work complete without deterministic validation.
2. **No shared mutable state is authoritative unless it is file-backed, inspectable, and logged.**
3. **Every loop has hard bounds: time, tokens, retries, and parallelism.**
4. **Every agent action must be observable enough to reconstruct failures after the fact.**
5. **Parallel work is allowed only for tasks with explicit dependency separation.**
6. **Human review is reserved for high-risk, high-ambiguity, or high-blast-radius changes.**
7. **Auto-merge is earned through measured confidence, not assumed from model performance.**
8. **New autonomy is added only after the previous layer is instrumented and stable.**
9. **System growth happens by modular replication, not by expanding one opaque super-system.**
10. **If a task cannot be validated deterministically, it is not ready for autonomy.**

### Scaling Limits (Hard Numbers)

- Solo operator: 5-6 meaningful PRs/day deep review capacity.
- Review capacity collapses long before agent generation capacity.
- Small teams beat swarms. Hub-and-spoke beats bag-of-agents.
- Beyond 3-5 active workers per coordination layer: management complexity rises sharply.
- Beyond 10-15 agents: need confidence routing, exception-based review, strong observability.
- Beyond 20-50 agents: problem becomes operations and governance, not code generation.

### Quality Gate Stack (Recommended Order)

1. **Static checks**: lint, typecheck, build
2. **Automated validation**: unit, integration, E2E where relevant
3. **Security checks**: secret scanning, dependency and policy checks
4. **AI review**: bug patterns, architectural drift, suspicious diffs
5. **Confidence routing**: auto-merge only for very low-risk, high-confidence work
6. **Human review**: architecture, business logic, customer-visible behavior, irreversible actions

### Human Review Bottleneck as Architecture Driver

The review bottleneck is not temporary -- it is the main limiting factor of the business model. This changes the architecture:
- Optimize for fewer review surfaces, not more output
- Force smaller diffs and narrower task scopes
- Route routine fixes through automatic gates and exception triage
- Reserve human attention for architecture, risk, and ambiguity
- Track reversal rate, rework rate, and escaped defect rate as first-class metrics

### Recommended Build Order

1. Build the deterministic core (state, events, budgets, timeouts, worktree isolation, gates)
2. Add a single worker loop (scoped task to validated diff)
3. Add review and confidence routing (AI pre-review, risk scoring, escalation thresholds)
4. Add observability before parallelism (dashboards, heartbeats, stuck-task alerts, cost-per-task)
5. Add 2nd and 3rd workers only for independent tasks
6. Productize one narrow autonomous loop (sentry-to-fix, dependency updates)
7. Add model routing and retry policy (after baseline reliability exists)
8. Replicate cells, not complexity
9. Expand human-offload only where metrics justify it

---

## Actionable Insights

1. **Build the most governable orchestrator, not the most impressive one.** Chase maximum trustworthy throughput, not maximum agent count.

2. **Do not let the orchestrator code.** The orchestrator should manage work, not participate in it. This is the single most important boundary.

3. **Put explicit files, logs, and state transitions at the center.** Not shared mutable memory. Not LLM-managed state. Files the human can inspect.

4. **Do not expand autonomy into areas you cannot deterministically validate.** If there is no gate, there is no autonomy.

5. **The LLM is a probabilistic coprocessor inside a deterministic shell.** This mental model correctly places every component.

6. **Observability is part of the product, not internal plumbing.** Before increasing agent count, you need visibility into who did what, with which context, at what cost, with what result, where failures cluster.

7. **The near-term wedge is a disciplined delivery and maintenance machine** where each successful loop creates more reusable context, better routing rules, and lower oversight cost on the next loop.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](../reference/master-blueprint.md) | Master blueprint implements the 70/30 split across the full system |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Human review bottleneck and cost economics constrain where deterministic vs LLM is viable |
| [reference/build-strategy-analysis.md](../reference/build-strategy-analysis.md) | Build order for the deterministic core follows the hybrid strategy timeline |
| [reference/existing-system-patterns.md](../reference/existing-system-patterns.md) | Current systems already implement partial deterministic/LLM separation |
| [reference/finance-agent-domain-module.md](../reference/finance-agent-domain-module.md) | Finance Agent has deterministic tasks (ingestion, dedup) currently handled by LLM |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Elvis Sun's 100% deterministic monitoring validates the principle |
| [orchestration-platforms/stripe-minions.md](../orchestration-platforms/stripe-minions.md) | Stripe's blueprint pattern is the clearest production example of deterministic orchestration |
