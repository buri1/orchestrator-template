# Emergent Intelligence & Adversarial Architectures

> **Emergent intelligence is real but conditional: Mixture-of-Agents gains +7.6%, adversarial review achieves +12.5%, skill learning yields +36.8%. But wrong topology produces 17.2x error amplification. The difference is purely architectural knowledge -- "knowing is engineering" has never been more literal.**

| Field | Value |
|-------|-------|
| Category | Reference Document |
| Original Source | `research/2026-03-05_PHASE2_research-emergent-intelligence-adversarial.md` |
| Research Phase | Phase 2 |
| Key Sources | Together AI MoA (ICLR 2025), Google DeepMind/MIT (180 configs), Agyn (SWE-bench), AgentCoder, CVCP, BlueCodeAgent (Microsoft Research), Letta skill learning, Anthropic multi-agent research, MAST/NeurIPS 2025, adversarial-review, Shannon pentester |
| Evidence Base | ICLR 2025 spotlight paper, 180 controlled experiments, 1,642 failure traces, 283 development sessions (codified context), SWE-bench verified results, HumanEval/MBPP benchmarks |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

The central tension in multi-agent AI coding systems is that emergent intelligence is real but conditional, and the conditions are far narrower than the hype suggests. The evidence splits into three distinct regimes: (1) Aggregation effects (proven, reliable) -- multiple agents producing diverse outputs that are then aggregated reliably outperform single agents by 7-15% on benchmarks through statistical diversity, not qualitative emergence. (2) Structural emergence (promising, fragile) -- team-structured agents with specialized roles show 7.2% gains on SWE-bench, and adversarial architectures produce measurable quality improvements (AgentCoder: 96.3% pass@1, CVCP: +12.5%, adversarial review: 80% bug detection). (3) True qualitative emergence (theoretical, unproven) -- no paper demonstrates that a group of coding agents solves a problem categorically impossible for any individual agent.

The paradox between Phase 1 findings (17x error trap, Brooks' Law exponent 1.724) and Phase 2 findings (MoA +7.6%, Agyn +7.2%, adversarial review +12.5%) resolves cleanly: they describe different architectural regimes. The 17x error trap is the default for uncoordinated systems. The gains require deliberate engineering of agent topology, role specialization, and adversarial dynamics. Skill codification through experience distillation (+36.8% from Letta) is the highest-ROI finding, representing pure context engineering that compounds over time.

---

## Key Findings

### The Three Regimes of Multi-Agent Performance

| Regime | Effect | Evidence | Status |
|--------|--------|----------|--------|
| Aggregation (parallel search + aggregate) | +7-15% accuracy | MoA, Verdent, Anthropic Research | Proven, reliable |
| Structural (specialized roles + adversarial) | +7-13% on benchmarks | Agyn, AgentCoder, CVCP | Promising, fragile |
| Qualitative emergence | No evidence | Riedl 2025 framework (untested on code) | Theoretical |

### Aggregation Effects (Proven)

**Mixture-of-Agents (ICLR 2025 Spotlight):**
- AlpacaEval 2.0: 65.1% (open-source MoA) vs 57.5% (GPT-4o) -- +7.6% absolute
- Key discovery: LLM collaborativeness -- output quality improves when provided with other models' answers, even from weaker models
- This is statistical emergence (wisdom-of-crowds), not qualitative emergence

**Verdent AI:** 76.1% pass@1 (81.2% pass@3) on SWE-bench using parallel agents in isolated Git worktrees with plan-code-verify cycle.

**Anthropic Multi-Agent Research:** Outperformed single Claude Opus 4 by 90.2% on internal evaluations. But uses ~15x more tokens -- the improvement comes from scale (parallel search), not agent collaboration.

### Structural Emergence (Promising)

**Agyn (SWE-bench):** Team-structured system with Manager, Researcher, Engineer, Reviewer achieves 72.2% on SWE-bench Verified -- +7.2% absolute gain from team structure alone, not model quality.

**AgentCoder (Generator-Critic-Tester):**
- HumanEval: 96.3% pass@1 (vs 90.2% SOTA) with GPT-4
- MBPP: 91.8% pass@1 (vs 78.9% SOTA)
- Token savings: 59% fewer tokens than baselines
- Critical insight: test designer never sees the code, producing objective and diverse tests

**CVCP (Cross-Verification):**
- Codeforces: +12.5% full acceptance rate vs SOP baselines
- CodeELO: +7.1% Elo Rating, hard category pass rate nearly doubled (3.25% to 5.87%)
- Agents generate tests for EACH OTHER's code, not their own

### Adversarial Architecture Taxonomy

| Architecture | Quality Metric | Token Cost | Best For |
|-------------|---------------|------------|---------|
| Generator + Independent Tester | +6-13% pass@1 | Lower (59% savings) | Code correctness |
| Cross-Verification (CVCP) | +12.5% acceptance | Medium | Competitive programming |
| Red Team / Blue Team (BlueCodeAgent) | +12.7% F1 | High | Security |
| Adversarial Review (Claude + Codex) | 80-100% bug detection | High (5 rounds) | Complex bug finding |
| Constitutional governance | Coherence maintenance | Low | Consistency at scale |
| Autonomous pentesting (Shannon) | 96.15% exploit success | Medium (~$50/run) | Security verification |
| Multi-agent pipeline (MapCoder) | +3-10% pass@1 | Medium | Competitive programming |

### The Architecture Spectrum

```
WORST CASE                                                    BEST CASE
Independent agents    Naive debate    Centralized    Specialized    Adversarial
no coordination      groupthink      orchestrator    roles          architecture
17.2x error amp      0% gain         4.4x error     +7.2% gain     +12.5% gain
-70% performance     (debate noise)  (contained)    (structured)   (bidirectional)
```

### Evidence Against Emergence

- **DeepMind/MIT (180 experiments):** Adding agents degrades performance up to 70% on some tasks. Sequential reasoning: multi-agent hurts -39% to -70%. Only high-entropy search tasks benefit (+9%).
- **Multi-agent debate study:** Majority pressure suppresses independent correction (groupthink). Intrinsic reasoning strength and group diversity are the dominant drivers.
- **MAST taxonomy:** Performance gains on popular benchmarks are often minimal. Single root-cause errors propagate through subsequent decisions.
- **ICLR 2025 blog:** 5 multi-agent debate methods rarely outperform simpler single-agent approaches. Majority voting alone accounts for most gains.

### Agent Specialization Through Repetition

LLMs do not learn from inference (no weight updates). "Specialization" comes from context accumulation, memory systems, and skill codification.

| Framework | Approach | Performance Impact |
|-----------|----------|-------------------|
| Letta skill learning | Distill trajectories to .md skills | +36.8% relative (highest ROI) |
| Mem0 | Managed memory infrastructure | +26% relative, 91% lower p95 latency, >90% token cost reduction |
| Cognee | Multi-layer semantic graphs | Outperforms Mem0, Graphiti, LightRAG on HotPotQA |
| AgentRR | Record-and-replay mechanism | Decouples intelligence from execution |

**The production consensus:** Agents are ephemeral but memory is persistent. A new agent instance reads the team manual and project history from shared memory, "instantly inheriting the wisdom of its predecessors."

**Security concern:** MemoryGraft research shows persistent memory creates attack surfaces -- poisoned experience retrieval can persistently compromise agent behavior.

### Topology Matching Rules

| Task Type | Best Architecture | Effect |
|-----------|------------------|--------|
| Sequential reasoning | Single agent | Multi-agent hurts -39% to -70% |
| Parallel search | Independent agents + aggregation | +7-15% |
| Code generation | Specialized roles + adversarial testing | +7-13% |
| Security testing | Red-blue teaming + constitutional distillation | +12.7% F1 |
| Complex bug finding | Bidirectional cross-model review | 80-100% detection |

---

## Actionable Insights

1. **Adopt adversarial review now.** Claude + GPT Codex cross-critique is immediately implementable. Five rounds of debate achieve 80% bug detection, 100% for hard bugs. Make this a standard quality gate.
2. **Separate generation from testing.** AgentCoder's principle -- never let the tester see the code -- should be a design rule. Independent test generation produces more diverse, objective test suites.
3. **Invest in skill codification.** Letta's +36.8% from skill learning is the highest-ROI finding. Distill successful agent trajectories into reusable `.md` skills -- pure context engineering that compounds over time.
4. **Use constitutional governance.** Codify project rules, conventions, and known failure modes into machine-readable constitutions. Prevents coherence loss at scale without adding coordination overhead.
5. **Match topology to task type.** Never use multi-agent for sequential reasoning. Use independent parallel agents for search tasks. Use adversarial architectures for quality-critical code.
6. **Do not pursue true emergence yet.** No evidence supports investing in architectures designed for qualitative emergence where agent groups solve categorically new problems. Wait for the science.
7. **The skill file IS the specialization.** No persistent agent identity needed. Ephemeral agents + persistent skills = best of both worlds.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics](scaling-economics.md) | DeepMind scaling laws (exponent 1.724, 45% threshold) define when multi-agent helps vs hurts |
| [reference/human-review-bottleneck](human-review-bottleneck.md) | Adversarial review architectures partially automate the human review bottleneck |
| [practitioners/elvis-sun](../practitioners/elvis-sun.md) | Elvis's static routing (billing to Codex, frontend to Claude) + ephemeral agents is the empirically optimal production pattern |
| [reference/code-quality-failure-taxonomy](code-quality-failure-taxonomy.md) | The 17.2x error trap and 1.7x quality deficit that adversarial architectures are designed to address |
| [reference/agent-scale-production-examples](agent-scale-production-examples.md) | Gas Town and other systems demonstrate where these architectural choices play out at scale |
