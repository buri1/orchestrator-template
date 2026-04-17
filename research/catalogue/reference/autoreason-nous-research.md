# Autoreason: Self-Refinement That Knows When to Stop

> **Nous Research / Hermes Agent paper + experiments: iterative self-refinement fixed by a 3-version tournament (incumbent A vs adversarial B vs synthesis AB) judged by fresh blind agents via Borda count, with "do nothing" as a first-class option.**

| Field | Value |
|-------|-------|
| Category | 📚 Reference — Research Paper (reasoning harness pattern) |
| Repository | https://github.com/NousResearch/autoreason |
| GitHub Stars | 424 (as of 2026-04-17) |
| Publisher | Nous Research — credited authors SHL0MS + Hermes Agent |
| License | (no LICENSE file — paper-first repo; human-eval materials share-alike-ish) |
| Tech Stack | TeX (paper) + Python (experiments/v2/*.py runners) |
| Maturity | 🔵 Research — paper + 150-problem CodeContests experiments + multi-seed replication + human eval materials |
| Last Analyzed | 2026-04-17 |

---

## Burak's Notes

> *(Reserved for your observations — agents won't overwrite this section.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | This paper addresses the **exact failure mode** our L-Thread review-fix loop hits at iteration 2+: prompt bias (model hallucinates flaws), scope creep (diff grows unchecked), lack of restraint (never says "done"). Our current 3-cycle max on review-fix is essentially a hack around these three problems. Autoreason provides a principled architecture — tournament of A/B/AB with fresh-context judges and convergence on "A wins k=2 times" — that we could drop into our review-fix loop with a few hundred lines of orchestrator changes. Directly relevant to the Claude Code ecosystem (uses Haiku/Sonnet 4.6 in the experiments) and the same Nous Research shop as the hermes-agent / Hermes-Wiki entries already catalogued. |
| **Novelty** | 8/10 | The three named failure modes (prompt bias, scope creep, lack of restraint) are a cleaner taxonomy of "why iterative self-critique fails" than anything we have in the catalogue. The A/B/AB tournament is a specific, implementable pattern — not a vague "add a critic" recommendation. The empirical results are unusual for the self-refinement literature: **refinement actively degrades weak models** (Haiku 3.5 loses 59–70% word count over 15 critique-and-revise passes) and **gains disappear at Haiku 4.5's 60% baseline** (the generation-evaluation gap has closed — the transition point thesis). "7 judges converge 3x faster than 3" is a testable claim we haven't seen elsewhere. |
| **Actionable** | 7/10 | The method is implementable as a standalone harness layer in ~1-2 days: three fresh Claude Code sessions per iteration (Critic → Author B, Synthesizer AB, 3-7 Judges), Borda count aggregation, convergence on k=2 incumbent wins. The runners (`experiments/v2/run_overnight.py`, `run_code_overnight.py`, `run_multi_seed.py`, `run_ablations.py`) are real Python code, not pseudocode — we can adapt them directly. Ablation results give us the priors (7 judges, both B+AB, Borda not majority, length-controlled eval). Caveat: compute cost scales linearly per pass (1 critic + 1 author + 1 synth + 7 judges = 10 fresh-context agent spawns per iteration) — Claude Max flat rate makes this viable but we'd want to gate on task criticality. |

---

## Overview

**Autoreason** is a Nous Research paper + experimental codebase addressing a specific failure: iterative self-refinement (the "ask the model to critique its own output, then revise") empirically **degrades** model performance for weaker models and plateaus for stronger ones. The authors identify three structural causes:

1. **Prompt bias**: when asked to critique, models hallucinate flaws even in correct outputs.
2. **Scope creep**: outputs expand unchecked each pass; for Haiku 3.5, word count shrank 59–70% over 15 critique-and-revise passes (pathological instability).
3. **Lack of restraint**: models never say "no changes needed" — they always find something to "improve."

The fix is a **3-version tournament per iteration**, judged by fresh agents with **no shared context**:

- **A** = unchanged incumbent (explicitly first-class — "do nothing" is a valid outcome)
- **B** = adversarial revision (fresh critic writes critique, fresh author writes revision)
- **AB** = synthesis (fresh synthesizer agent combines A's strengths with B's improvements)

A panel of 3 or 7 judges (fresh context each) votes via **blind Borda count**. Convergence criterion: incumbent A wins **k=2 consecutive rounds**. The "fresh agent" + "blind ranking" constraints are critical — every ablation that removes them collapses the tournament to 2-3 passes vs 24.

**Empirical headline results**:

- Haiku 3.5 + autoreason → **42/42 perfect Borda sweep** across 3 tasks; all baselines *degraded* below single-pass.
- Sonnet 4.6 on 150 CodeContests → **77% vs 73%** autoreason vs single-pass (private-test).
- Haiku 3.5 autoreason → **40% vs 31%** vs best-of-6 sampling at matched compute.
- Haiku 4.5 at 60% private accuracy → autoreason's held-out gains **vanish** (transition point; generation-evaluation gap closed).
- Length-controlled evaluation → autoreason still beats 3 of 4 baselines at matched word count → gains are **not** just "writes more."

---

## Technical Architecture

### Tournament flow per iteration

```
Task Prompt → Incumbent A
                  ↓
        ┌─── Critic (fresh agent) ────→ Critique
        │
        ├─── Author B (fresh agent) ──→ Revision (B)
        │
        └─── Synthesizer (fresh) ─────→ Synthesis (AB)
                  ↓
          Judge Panel (3 or 7 fresh agents, Borda count)
                  ↓
              Winner → new A   (or converge if A wins k=2 times)
```

### Ablation-informed priors (use these as defaults)

| Design choice | Recommended | Why (from ablations) |
|---|---|---|
| Judges | 7 | 3x faster convergence than 3; 1 judge noisy/slow |
| Aggregation | Borda count | Majority vote collapses tournament |
| Versions | A + B + AB | Removing either collapses to 2-3 passes vs 24 |
| Convergence | incumbent wins k=2 | Prevents premature stop |
| Judge context | fresh / blind | Shared context biases toward most recent version |
| Evaluation | length-controlled | Guards against "write more" cheat |

### Repository structure

```
paper/                        # LaTeX source, figures, compiled PDF
tasks/                        # 5 open-ended + 3 constrained task prompts
human_eval/                   # Blinded materials for human raters (5 tasks × 3 methods)
experiments/v2/
  run_overnight.py            # Main runner (writing tasks)
  run_code_overnight.py       # CodeContests runner
  run_code_haiku45.py         # Haiku 4.5 runner
  run_multi_seed.py           # 15-run replication
  run_ablations.py            # Judge count, Borda vs majority, component, length
  compute_stats.py            # Bootstrap CIs, McNemar tests
  results_code_s46/           # Sonnet 4.6 (150 problems)
  results_code_haiku/         # Haiku 3.5 (150 problems)
  results_code_haiku45/       # Haiku 4.5 (150 problems)
  results_code_best_of_n/     # Compute-matched best-of-N control
  results_multi_seed/         # 15 independent writing runs
  results_ablations/          # Judge/aggregation/component/length ablations
  results_monte_carlo/        # 5-run Monte Carlo replication
```

### Model scaling curve (CodeContests private-test with autoreason)

| Model | Accuracy |
|---|---|
| Haiku 3.5 | 40% |
| Haiku 4.5 | 60% — **transition point**, held-out gains vanish |
| Sonnet 4 | 64% |
| Sonnet 4.6 | 77% |

---

## Publisher Background

**Nous Research** is the same shop behind `hermes-agent` (already catalogued as the subject of `Hermes-Wiki`, 73 stars, 4-day-old Chinese-language line-by-line source documentation project) and the `autoresearch` research program more broadly. Authors credited as **SHL0MS** (individual) + **Hermes Agent** (the agent itself as co-author — a choice consistent with Nous Research's public style). The repo is 20 days old at time of cataloguing, with 424 stars and 29 forks — strong reception for a paper-first release.

Nous Research publishes open research alongside working code (runners, human-eval materials, ablations) rather than API-only demos — useful for us because we can actually run the experiments on our own tasks.

Cross-reference: this complements the **Hermes-Wiki** catalogue entry (`research/catalogue/agent-harnesses/hermes-wiki.md`) as the second Nous Research artifact we've catalogued. Autoreason is the **reasoning-layer** counterpart to Hermes-Wiki's **harness-documentation** layer — together they sketch a coherent Nous Research architectural view.

---

## What's Valuable for Us

1. **Three-mode failure taxonomy (prompt bias / scope creep / lack of restraint)**: cleanest vocabulary we have for what goes wrong in review-fix loops. Use this in devlog writeups when a worker spins on a review cycle.
2. **A/B/AB tournament as a replacement for our 3-cycle review-fix loop**: our current design is "reviewer finds issues → fixer fixes → max 3 cycles." Autoreason says: run A (don't fix) + B (fix) + AB (synthesize) in parallel, vote blind. This would let our orchestrator handle the 19-20% "reviewer is wrong, original was fine" case we've observed.
3. **Fresh-context judge requirement**: validates our Claude Code pattern of spawning new tmux windows with fresh context for each review — NOT reusing the same session. Autoreason's ablations show shared-context judges are the failure mode.
4. **Convergence criterion = incumbent wins k=2 consecutive rounds**: this is a principled replacement for our hardcoded "max 3 cycles." Actually measures whether we've converged, not a budget timeout.
5. **Transition point thesis (Haiku 4.5 = 60% baseline = gains vanish)**: tells us that for Opus 4.6+ tasks where the model is already near the frontier, autoreason overhead isn't worth it. Gate autoreason on task difficulty / baseline confidence — not on every task.
6. **Length-controlled evaluation**: we have no guard against this in our own review loop. Autoreason's length-controlled Borda ablation is a direct pattern to add to our PR review phase.
7. **Ablation prior**: 7 judges, Borda aggregation, both B and AB, k=2 convergence. These are the priors to start from if we ever implement this — don't re-run the ablations, trust the paper.

---

## What's NOT Relevant

- **Pure writing tasks (5 open-ended tasks)**: we don't build content-generation agents; MAYTT is template-driven, not refine-iteratively.
- **Monte Carlo / multi-seed replication overhead**: useful for a paper, not for shipping. We'd adopt the method, not the experimental rigor.
- **Academic framing**: the paper's contribution is empirical — bootstrap CIs, McNemar tests, blinded human eval. We just need the architecture; the statistical machinery isn't load-bearing for a production harness.
- **LaTeX source**: no value unless Burak ever cites the paper in a client writeup (plausible for Ausschreibungen where "we implement patterns from current research" is a differentiator).

---

## Future Use Cases

- **Phase 2 (Day 4-60)**: prototype autoreason as an opt-in mode for the review-fix loop — flag in `orchestrator-tmux-state.json`, enabled for PRs over N LOC or touching critical paths. 1-2 day implementation.
- **Phase 3 (Day 60-90)**: if we're running cheap models (Haiku 3.5) as part of a model-routing strategy, autoreason's 42/42 perfect sweep on Haiku is the argument for "use Haiku with autoreason instead of Sonnet without it" — validated compute-matched comparison. Good input for client pitches where cost is pressure.
- **Phase 4 (Day 90+)**: autoreason as a citable architectural pattern in client proposals — "we implement a Nous-Research-validated tournament pattern for autonomous refinement with guaranteed convergence" plays well in German conservative buyer contexts.

---

## Key Takeaway

> **Iterative self-refinement fails because critics hallucinate, scope drifts, and models never say "done" — autoreason fixes all three with a fresh-context blind-Borda tournament over A/B/AB versions, converging on k=2 incumbent wins, and this is the principled replacement for our hardcoded 3-cycle review-fix loop.**
