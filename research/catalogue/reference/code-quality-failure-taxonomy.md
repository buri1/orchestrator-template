# Code Quality & Failure Taxonomy

> **AI-generated code introduces 1.7x more issues than human code, security vulnerabilities spike 10x in 6 months at enterprise scale, and uncoordinated multi-agent systems amplify errors 17.2x. The orchestrator with deterministic gates is the minimum viable safety mechanism.**

| Field | Value |
|-------|-------|
| Category | Reference Document |
| Original Source | `research/2026-03-05_PHASE2_research-agent-failure-modes-quality.md` |
| Research Phase | Phase 2 |
| Key Sources | CodeRabbit (470 PRs), Veracode (80 tasks, 100+ LLMs), Apiiro (Fortune 50), Opsera (250K+ devs), Harness (500 respondents), METR (246 tasks), Google DeepMind/MIT (180 configs), MAST/NeurIPS 2025 (1,642 traces), GitClear (211M lines), DORA 2024/2025, Cortex 2026 |
| Evidence Base | 14+ empirical studies, 211M changed lines of code (GitClear), 1,642 annotated failure traces (MAST), 180 controlled experiments (DeepMind/MIT), 250K+ developers (Opsera) |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

This reference synthesizes the most comprehensive empirical data available on AI code quality, multi-agent failure modes, and technical debt accumulation. The evidence is drawn from 14+ studies representing hundreds of thousands of developers and millions of lines of code. The findings converge on a clear picture: AI-generated code is faster to produce but carries measurably higher defect rates, and multi-agent systems amplify these defects unless deliberately engineered with centralized coordination and deterministic validation gates.

The CodeRabbit study (470 PRs) establishes the baseline: AI PRs contain 10.83 issues each versus 6.45 for human PRs -- 1.7x more issues, with logic/correctness errors up 75%, security vulnerabilities up 1.5-2x, and performance inefficiencies up 8x. At enterprise scale, Apiiro documents a 10x spike in security findings (from ~1,000 to 10,000+ per month in 6 months) while PR volume actually fell by a third. The METR randomized controlled trial delivers the most dangerous finding: developers using AI tools are 19% slower on mature codebases while believing they are 20% faster -- a 39-44% perception-reality gap.

The Google DeepMind/MIT paper across 180 configurations proves that uncoordinated agents amplify errors 17.2x, while centralized orchestration contains this to 4.4x. The MAST taxonomy (1,642 traces, NeurIPS 2025) identifies 14 unique failure modes across three categories. GitClear's analysis of 211M changed lines shows refactoring collapsed from 25% to under 10% while code duplication rose eightfold. By year 2+, unmanaged AI-generated code drives maintenance costs to 4x traditional levels.

---

## Key Findings

### AI Code Quality Metrics

| Metric | Value | Source |
|--------|-------|--------|
| Issues per PR (AI vs human) | 10.83 vs 6.45 (1.7x more) | CodeRabbit |
| Critical issues increase | 1.4x more per PR | CodeRabbit |
| Logic/correctness error increase | 75% higher | CodeRabbit |
| Security vulnerability increase | 1.5-2x | CodeRabbit |
| Readability problems increase | 3x+ | CodeRabbit |
| Performance inefficiencies increase | ~8x | CodeRabbit |
| Security test failure rate (avg) | 45% of AI code | Veracode |
| Java security failure rate | 72% | Veracode |
| Enterprise security findings growth | 10x in 6 months | Apiiro (Fortune 50) |
| Vulnerabilities per line increase | 15-18% more | Opsera (250K+ devs) |
| Deployments causing problems | 45% | Harness |
| AI PR review wait time | 4.6x longer than human | Opsera |
| Developer perception gap | 39-44% (think 20% faster, actually 19% slower) | METR |

### Multi-Agent Error Amplification

| Topology | Error Amplification | Source |
|----------|-------------------|--------|
| Single Agent | 1.0x (baseline) | DeepMind/MIT |
| Centralized (orchestrator) | 4.4x | DeepMind/MIT |
| Independent ("bag of agents") | 17.2x | DeepMind/MIT |

The jump from centralized to independent is ~4x worse, suggesting the curve is closer to exponential when coordination is removed. Once single-agent baseline exceeds ~45% accuracy, adding more agents yields diminishing or negative returns.

### MAST Failure Taxonomy (14 Modes, 3 Categories)

**System Design Issues:**
- Inadequate tool design and integration
- Poor agent role specification
- Insufficient context management
- Suboptimal workflow orchestration

**Inter-Agent Misalignment:**
- Communication breakdowns between agents
- Conflicting agent strategies
- Role confusion and scope drift
- Coordination overhead exceeding task benefit

**Task Verification:**
- Incomplete output validation
- Missing error recovery mechanisms
- Insufficient testing and quality gates
- Over-reliance on agent self-assessment

### Production Failure Modes

| Failure Mode | Description | Frequency |
|-------------|-------------|-----------|
| Context exhaustion | Agent thrashes on large codebases without progress | #1 killer |
| Loop of death | Agent plans without executing, endlessly refines | Very common |
| Error cascading | Single hallucination cascades through downstream systems | Common in multi-agent |
| Merge conflicts | Parallel agents blind to each other's changes | Structural in worktree patterns |
| Context corruption | Agent memory compromised, persists across sessions | Dangerous, hard to detect |
| Security injection | Consistent production of undetectable security flaws | 38-72% of code (by language) |

### Technical Debt Accumulation

| Metric | Finding | Source |
|--------|---------|--------|
| Refactoring collapse | 25% (2021) to <10% (2024) | GitClear (211M lines) |
| Code duplication growth | 8x increase | GitClear |
| Code churn (revised within 2 weeks) | 3.1% to 5.7% (near doubled) | GitClear |
| Maintenance cost multiplier (year 2+) | 4x traditional levels | Codebridge |
| Anti-patterns in AI code | 80-100% of repos (10 recurring patterns) | Ox Security (300+ repos) |
| Incidents per PR increase | 23.5% YoY | Cortex 2026 |
| Change failure rate increase | ~30% YoY | Cortex 2026 |

### DORA Findings

For every 25% increase in AI adoption:
- 1.5% decrease in delivery throughput (2024, since dissipated)
- 7.2% decrease in delivery stability (persists through 2025)

AI amplifies what is already there: strong teams get stronger, struggling teams get worse.

### The Multi-Agent Robustness Problem

Semantically equivalent inputs cause drastic performance drops in multi-agent code generation. Systems fail to solve 7.9-83.3% of problems they initially resolved successfully. Multi-agent code generation is highly non-deterministic.

---

## Actionable Insights

1. **Centralized orchestration is mandatory.** The difference between 4.4x and 17.2x error amplification is purely architectural -- having an orchestrator is the minimum viable safety mechanism.
2. **Deterministic validation gates at every agent boundary.** Stripe's "walls matter more than the model" pattern. CI/CD gates as non-negotiable checkpoints.
3. **E2E testing as hard gate.** No task marked done without passing tests. This is the single highest-leverage quality intervention.
4. **Security scanning inline, not as afterthought.** Models are not self-correcting on security (45% failure rate). Larger models do not perform significantly better -- this is systemic, not a scaling problem.
5. **Close the perception-reality gap.** Developers think they are 20% faster with AI; they are 19% slower on mature codebases. Measure actual outcomes, not developer sentiment.
6. **Enforce refactoring discipline.** AI kills refactoring (25% to <10%). Without active enforcement, technical debt compounds to 4x maintenance costs by year 2.
7. **Small batch sizes + rapid feedback loops.** DORA stability findings demand this -- speed without observability is chaos.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics](scaling-economics.md) | Provides the DeepMind scaling laws (exponent 1.724, 45% threshold) that predict when agents hurt vs help |
| [reference/human-review-bottleneck](human-review-bottleneck.md) | AI PRs wait 4.6x longer for review -- the trust deficit compounds the review bottleneck |
| [practitioners/elvis-sun](../practitioners/elvis-sun.md) | Elvis's three-model review (Codex best, Gemini great, Claude useless) is a practical response to the quality problem |
| [reference/emergent-intelligence](emergent-intelligence.md) | Adversarial architectures (+12.5%) are the engineering response to the 17.2x error trap |
| [reference/agent-delivery-economics](agent-delivery-economics.md) | The 15-25% rework rate from quality issues directly erodes the 30-40% initial productivity gains |
