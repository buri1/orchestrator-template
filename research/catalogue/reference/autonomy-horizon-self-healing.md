# Autonomy Horizon and Self-Healing Orchestrators

> **The maximum autonomy frontier for coding agent systems: Cursor's 1-week self-driving experiment, METR's doubling-every-7-months autonomy horizon, Agent Drift taxonomy (semantic/coordination/behavioral), Lusser's Law for compounding errors, self-healing architectures (Cursor, Composio, Quoracle, MASC), and the unsolved recursive trust problem.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_PHASE2_research-zero-human-self-healing.md |
| Research Phase | Phase 2 |
| Last Updated | 2026-03-08 |

---

## Summary

The pursuit of fully autonomous coding agent systems represents the bleeding edge of agentic engineering in 2026. This research maps the frontier across five dimensions: documented autonomy records, the empirical autonomy horizon, failure mode taxonomy, self-healing architectures, and practical limits of overnight loops.

Cursor's "self-driving codebases" experiment ran for approximately one week with ~1,000 commits/hour, 10M tool calls, and 1M+ lines of code -- but all output requires post-hoc human review. METR confirms the autonomy horizon doubles every 7 months (196 days); as of February 2026, Claude Opus 4.6 crossed 14.5-hour autonomous tasks at 50% reliability, with week-long tasks projected by late 2026. However, "50% reliability" is not production-grade. The Agent Drift paper (arXiv 2601.04170) documents three forms of progressive degradation measurable after 20-100 turns. Lusser's Law makes the math unforgiving: a 95% per-step success rate yields only 60% reliability across 10 steps. This is why Stripe's one-shot pattern (zero inter-agent coordination) scales to 1,300+ PRs/week while multi-step loops degrade.

Self-healing orchestrators exist but are immature. Cursor's multi-agent self-healing, Composio's autonomous CI fix, Quoracle's Erlang/OTP supervision trees, and MASC (+7-8% task success) demonstrate partial self-healing. But the recursive trust problem -- who watches the watchman -- remains unsolved. Every production system ultimately reports to a human. Fortune's definitive verdict (February 2026): "Working with AI agents may have less to do with sleeping while they work than with staying half-awake while they do."

---

## Key Findings

### Documented Autonomy Records

**Tier 1: Multi-Day (48+ hours)**

| System | Duration | Scale | Output Quality |
|--------|----------|-------|----------------|
| Cursor Self-Driving | ~1 week | ~1,000 commits/hr, 10M tool calls, 1M+ LOC | Functional but requires post-hoc review |
| Cursor Long-Running Agents | 25-52+ hours | 151,000+ LOC PRs | Developer approval required before coding; multiple agents cross-check |
| Kiro (AWS) | "Days" per task | 18-month project in 76 days (4.3x speedup) | 86% root cause accuracy; 80% report risky behaviors |
| Blitzy OS | Hours per cycle | 3,000+ agents, 3M LOC | 80% automated, 20% human finalization |

**Tier 2: Overnight (8-24 hours)**

| System | Duration | Output | Key Pattern |
|--------|----------|--------|-------------|
| Elvis Sun / Zoe | 24/7 continuous | 50 commits/day avg, 94 peak | Cron monitoring 10min, failure-aware respawning, multi-model review |
| Geoffrey Huntley / Ralph | Overnight builds | $50K MVP for $297 | Bash loop feeding errors back until tests pass ("naive persistence") |
| OpenClaw 24/7 | 4-week field test | 70% success by Day 4 | Memory layers: MEMORY.md + daily logs + runtime state |

**Tier 3: Production One-Shot (minutes per task, 24/7 total)**

| System | Duration/Task | Scale | Key Insight |
|--------|---------------|-------|-------------|
| Stripe Minions | Minutes (one-shot) | 1,300+ PRs/week | Zero inter-agent coordination; deterministic gates; isolated devboxes |

### METR Autonomy Horizon

| Time Period | 50% Task Completion Horizon |
|-------------|---------------------------|
| March 2025 | ~50 minutes (Claude 3.7 Sonnet) |
| February 2026 | ~14.5 hours (Claude Opus 4.6) |
| Late 2026 (projected) | Week-long tasks |
| Mid-2027 (projected) | Month-long tasks |
| 2029 (projected) | Work-month (167 hours) |

Doubling rate: every 7 months (196 days), accelerating. Critical caveat: "50% reliability" means the agent fails half the time. The gap between "50% on benchmarks" and "reliable enough to sleep through" is enormous. User behavior signal: by 750 sessions, Claude Code users employ full auto-approve >40% of the time -- trust builds but never reaches 100%.

### Agent Drift Taxonomy

The Agent Drift paper (arXiv 2601.04170, January 2026) provides the first rigorous framework:

**Three Manifestations:**
1. **Semantic Drift**: Progressive deviation from original intent without external trigger
2. **Coordination Drift**: Breakdown in multi-agent consensus over time
3. **Behavioral Drift**: Emergence of unintended strategies not in the design specification

**Timeline**: Measurable at 20-100 turns, then compounds exponentially. "Degradation rarely begins with obviously incorrect outputs -- it shows up in subtler ways."

**Agent Stability Index (ASI)**: 12-dimension metric framework:
- Response Consistency (30%): output similarity, decision pathway stability, confidence calibration
- Tool Usage Patterns (25%): selection stability, sequencing consistency, parameter drift
- Behavioral Boundaries (20%): output length stability, error pattern emergence, human intervention rate
- Alert threshold: ASI < 0.75 for three consecutive 50-interaction windows

### Compounding Errors (Lusser's Law)

| Per-Step Success | Steps | System Reliability |
|-----------------|-------|-------------------|
| 99% | 100 | 36.6% |
| 99% | 5,000 | ~0% (near-certain failure) |
| 98% | 5 agents | 90.4% |
| 95% | 10 | 59.9% |
| 90% | 10 | 34.9% |

This mathematics explains why Stripe's one-shot pattern works at 1,300+ PRs/week (avoids compounding entirely) while multi-step autonomous loops degrade predictably.

### Self-Healing Systems

| System | Mechanism | Handles | Does NOT Handle |
|--------|-----------|---------|----------------|
| Cursor Self-Healing | Agent B fixes Agent A's breaks | Build breaks | Strategic drift |
| Composio Orchestrator | Autonomous CI fix + merge conflict resolution | CI failures, review comments | Architectural decisions |
| Elvis/Zoe | Failure-aware respawn with adjusted prompts | Agent crashes, failed tasks | Strategic errors |
| Ralph Loop | Bash loop feeding errors back until tests pass | Transient failures | Strategic drift, burns tokens |
| Quoracle (Erlang/BEAM) | OTP supervision trees, auto-restart failed processes | Process crashes, budget overruns | LLM blind spots |
| MASC | Metacognitive self-correction via embedding reconstruction | Step-level errors (+7-8% success) | 10-12x overhead |

### The Recursive Trust Problem

Every self-healing solution encounters the same challenge: who watches the watchman? An agent cannot reliably evaluate failure modes it doesn't know about. A meta-orchestrator using the same LLM has the same blind spots. The only external ground truth without humans: deterministic tests (pass/fail, can't test strategy), production metrics (delayed), multi-model cross-validation (catches different errors, shares structural biases).

**No production system today achieves fully recursive self-healing without an eventual human checkpoint.**

### Failure Modes by Duration

| Hours | Failure Mode | Why Invisible Short-Term |
|-------|-------------|------------------------|
| 4-8 | Slow strategic drift | Agent redefines success criteria; passes tests but builds wrong thing |
| 6-12 | Memory contamination cascade | Early mistake persists, influences all decisions; tests also contaminated |
| 8-24 | Coordination entropy | Agents optimize locally, global state becomes incoherent |
| 12-48 | Resource exhaustion surprise | Token consumption spikes without visible cause |
| 48-168 | Quality regression plateau | Stabilizes at mediocre; "satisfices" rather than optimizes |

### Three Trust Tiers

| Tier | Duration | Requirements | Production-Ready? |
|------|----------|-------------|-------------------|
| Verified (deterministic gates) | Minutes-hours | CI per output, bounded scope, one-shot | Yes |
| Monitored (human on-call) | Hours-overnight | Cron monitoring, kill switches, daily review | Yes (with caveats) |
| Unverified (post-hoc review) | Days-weeks | Branch isolation, accept error rate, fixup passes | No (research only) |

---

## Actionable Insights

1. **Prefer one-shot over multi-step where possible**: Stripe's model (deterministic context gathering -> single LLM call -> deterministic validation) avoids compounding errors entirely. 53.7% token savings from single-agent skill compilation.

2. **Implement three-tier validation**: Local lint/type-check (seconds) -> selective CI (minutes) -> human escalation after N failed attempts. Stripe caps at 2 auto-fix attempts.

3. **Add mechanical watchdogs (Tier 0)**: Cron every 5-10 minutes: process alive, token consumption within budget, error rate below threshold. Zero AI involvement -- pure process monitoring that never hallucinates.

4. **Build drift detection using ASI-like metrics**: Track tool usage patterns, response consistency, and inter-agent agreement. Alert when behavioral patterns shift, even if tests pass.

5. **Use layered memory**: Curated MEMORY.md (permanent rules) + append-only daily logs + runtime state file. "Mental notes don't persist, but files do."

6. **Accept error rate during execution, add fixup passes before merge**: Cursor's finding: requiring 100% correctness at each step causes serialization bottlenecks. Accept small error rate, run cleanup agent before human review.

7. **Set hard token budget kill switches**: Per agent, per run. Alert at 80%, hard kill at 100%. Cautionary tale: 500K tokens/day from single cron job, unnoticed until the bill arrived.

8. **Use multi-model validation**: Elvis's approach (Codex + Claude + Gemini review before notification) catches different error types, though shares structural biases.

9. **Design for restartability**: State must be externalized (JSON files, database), not held in context. Crashed agent replacements must pick up from last checkpoint without losing trajectory.

10. **The autonomy horizon is capability, not trust**: METR shows agents CAN do longer tasks. The engineering challenge is building trust infrastructure (observability, containment, recovery, verification) that makes longer runs safe.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Lusser's Law and compounding errors directly impact the economics of multi-step vs one-shot patterns |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | "Year of Trust 2026" thesis; hook-based observability as drift detection substrate |
| [practitioners/steipete.md](../practitioners/steipete.md) | tmuxwatch for process health monitoring; practical 1-4 agent ceiling |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Zoe orchestrator: 24/7 operation, cron monitoring, failure-aware respawning, multi-model validation |
| [practitioners/geoffrey-huntley.md](../practitioners/geoffrey-huntley.md) | Ralph Loop: "naive persistence" as simplest self-healing pattern |
| [reference/infrastructure-breaking-points.md](../reference/infrastructure-breaking-points.md) | Resource exhaustion (Rank 4) and context degradation (Rank 2) are failure modes that emerge during extended autonomy |
| [reference/observability-trust-kpis.md](../reference/observability-trust-kpis.md) | ASI metrics, Judgment SLOs, and three-tier monitoring framework for detecting drift |
| [reference/knowledge-compounding-transfer.md](../reference/knowledge-compounding-transfer.md) | Post-mortem replay and failure catalogs feed prevention systems that extend reliable autonomy |
