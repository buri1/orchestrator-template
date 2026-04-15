# Better Harness: A Recipe for Harness Hill-Climbing with Evals

> **Vivek Trivedy — LangChain Blog, 2026-04-08**

| Field | Value |
|-------|-------|
| Source | https://blog.langchain.com/better-harness-a-recipe-for-harness-hill-climbing-with-evals/ |
| Author | Vivek Trivedy (LangChain, Product Manager) |
| Publication | LangChain Blog |
| Date | 2026-04-08 |
| Topics | harness engineering, evals, hill-climbing optimization, agent improvement loops, regression testing, trace infrastructure, LangSmith |
| Read Time | 8 min |

---

## Burak's Notes

> *This is the operational playbook behind the headline claim in our [source article](../../harness-architecture/00-source-article.md): "LangChain changed only the infrastructure wrapping their LLM and jumped from outside the top 30 to rank 5 on TerminalBench 2.0." Same author (Vivek Trivedy), same canonical formula ("If you're not the model, you're the harness"). This article shows HOW they climb the hill: evals as gradient signal, train/holdout splits, one-change-per-iteration discipline, regression protection. The methodology is directly applicable to our orchestrator — we could run the same loop against our tmux workers: trace failures, propose harness change, validate against held-out tasks, check regressions. The "eval hygiene" concept (remove saturated evals as models improve) maps to the Von Neumann architecture analogy: you upgrade the instruction set when the substrate changes. This is the missing piece between "harness > model" (the thesis) and "how do I actually improve my harness systematically" (the practice).*

---

## Key Takeaways

1. **Evals Are Gradient Signals for Harnesses** — The central thesis: evals function identically to training data in classical ML. They encode target behavior, provide directional feedback, and enable iterative improvement. The same ML principles (data quality, train/test splits, generalization monitoring) apply directly to harness engineering. This formalizes what practitioners have been doing ad hoc.

2. **Four-Phase Hill-Climbing Loop** — The methodology has four distinct phases: (1) Data Sourcing & Tagging (hand-curated examples + production trace mining + behavioral categorization), (2) Experiment Design (optimization/holdout split, baseline metrics, production-mirrored distribution), (3) Autonomous Optimization (diagnose failures from traces, propose one targeted harness change per iteration, validate against both sets, track regressions), (4) Human Review & Acceptance (edge case verification, overfitting detection, deployment sanity checks).

3. **One Change Per Iteration Is Non-Negotiable** — The optimization loop proposes exactly one harness change per cycle. This mirrors the scientific method: isolate the variable. Multi-change iterations make attribution impossible and regressions undiagnosable. This has direct implications for our orchestrator: when changing worker prompts or tool configurations, change one thing at a time and measure.

4. **Recurring Harness Improvement Patterns** — The optimization loop surfaces four categories of harness fixes: instruction refinement ("use reasonable defaults"), constraint respect ("don't ask for already-supplied details"), exploration bounding ("don't issue near-duplicate searches"), and question sequencing ("ask domain-defining questions first"). These are concrete, adoptable prompt-engineering patterns for any agent system.

5. **Strong Generalization Demonstrated** — Testing with Claude Sonnet 4.6 and GLM-5 showed improvements generalized from optimization sets to holdout sets. Followup quality for Claude went from 2/6 to 6/6 on holdout; GLM-5 from 1/6 to 6/6. This proves the harness changes capture genuine behavioral improvements, not eval-specific overfitting.

6. **Eval Hygiene as Maintenance Discipline** — "Spring cleaning" of eval suites: remove saturated evals (model now always passes), retire no-longer-relevant evals as priorities shift, and maintain a "core suite" of critical evals that trigger investigation if they regress. This prevents eval rot and keeps the signal-to-noise ratio high.

---

## Cross-References: Harness Architecture Research Wave

This article is deeply connected to our [harness-architecture research series](../../harness-architecture/):

| Connection | Detail |
|-----------|--------|
| **[00-source-article.md](../../harness-architecture/00-source-article.md)** | Same author (Vivek Trivedy). The source article cites the TerminalBench 2.0 result as proof that "harness > model." This article is the methodology paper showing HOW LangChain achieved that result — the eval-driven hill-climbing loop. |
| **[01-computer-architecture-field-overview.md](../../harness-architecture/01-computer-architecture-field-overview.md)** | The eval loop maps to the quantitative methodology from Hennessy & Patterson: measure, change, measure again, compare. "Evals as gradient signals" is the agent equivalent of Amdahl's Law benchmarking — you optimize the bottleneck, not the whole system. |
| **[04-operating-systems-lessons.md](../../harness-architecture/04-operating-systems-lessons.md)** | Regression protection via "core suite" evals parallels OS regression testing: a kernel change must pass the entire test suite before merge. The holdout set functions like a fuzzing corpus — unseen inputs that test generalization. |
| **[05-cpu-microarchitecture-patterns.md](../../harness-architecture/05-cpu-microarchitecture-patterns.md)** | One-change-per-iteration discipline mirrors microarchitectural benchmarking: isolate the variable (branch predictor, cache policy, prefetch strategy) and measure delta. Multi-variable changes create attribution noise. |
| **Von Neumann Analogy** | Millidge's "harness = OS" analogy extends here: evals are the benchmark suite that drives OS optimization. Just as SPEC CPU benchmarks drove decades of hardware/OS co-optimization, well-designed eval suites drive harness optimization. The hill-climbing loop is the agent-world equivalent of the hardware design-simulate-tape out-benchmark cycle. |

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses the "how" of harness improvement — the core research question of our harness-architecture wave. Same author as our source article. Methodology is immediately applicable to our tmux orchestrator. |
| **Actionable** | 8/10 | Four-phase loop is concrete and adoptable. We could build an eval suite for our orchestrator workers today: trace failures from devlog, create optimization/holdout splits, iterate on worker prompts one change at a time, track regressions. |

---

## Summary

Vivek Trivedy — the LangChain product manager who coined "If you're not the model, you're the harness" — delivers the operational playbook for systematic harness improvement. The core argument: evals serve as gradient signals for agent harnesses, just as training data serves as gradient signals for neural networks. All classical ML principles (data quality over quantity, train/test splits, generalization monitoring, regression protection) apply directly.

The methodology is a four-phase hill-climbing loop. Phase 1 (Data Sourcing) combines hand-curated behavioral examples, production trace mining for failure cases, and external datasets adapted for relevance. Phase 2 (Experiment Design) splits evals into optimization and holdout sets, establishes baselines, and mirrors production distribution. Phase 3 (Autonomous Optimization) is the core loop: diagnose failures from traces, propose exactly one targeted harness change, validate against both sets, track regressions on previously-passing cases. Phase 4 (Human Review) catches token-wasteful overfitting that metrics miss and verifies edge cases.

The article demonstrates strong results. Testing with Claude Sonnet 4.6 and GLM-5, followup quality improved from 2/6 to 6/6 (Claude holdout) and 1/6 to 6/6 (GLM-5 holdout). Tool selection improved from 1/2 to 2/2 for Claude and 0/2 to 2/2 for GLM-5, both maintaining 7/8 on holdout. The generalization to unseen holdout examples proves the harness changes capture genuine behavioral improvements.

Four categories of recurring harness improvements emerged: instruction refinement (reasonable defaults), constraint respect (no redundant questions), exploration bounding (prevent search loops), and question sequencing (domain-defining questions first). These are concrete, model-agnostic patterns applicable to any agent system.

The article introduces "eval hygiene" as a maintenance discipline: regularly remove saturated evals, retire irrelevant ones, and maintain a "core suite" of critical evals that trigger investigation on regression. This prevents eval rot and keeps the improvement signal clean.

The underlying infrastructure dependency is LangSmith for centralized trace logging, version comparison, and production monitoring — the trace infrastructure that enables the feedback flywheel: usage -> traces -> evals -> harness improvements -> better usage.

---

## Notable Quotes

> "Evals encode the behavior we want our agent to exhibit in production."

> "Agents are famous cheaters" — on the tendency toward reward hacking and overfitting to eval structure.

> "Quality > quantity, a small set of well-tagged evals covering the behaviors you care about beats thousands of noisy but high-coverage evals."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://blog.langchain.com/how-we-build-evals-for-deep-agents/ | Predecessor article — the eval construction methodology that this article's optimization loop consumes | `/ingest-article` |
| DeepAgents framework (LangChain open-source) | The open-sourced implementation of the research described in this article | `/tool-catalogue` |
| Auto-Harness (DeepMind) | Referenced as related work — automated harness optimization from the model side | `/ingest-article` |
| Meta-Harness (Stanford) | Referenced as related work — meta-learning approach to harness configuration | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| LangSmith | Trace logging, version comparison, production monitoring — the infrastructure backbone for the eval loop | Not yet catalogued as standalone entry |
| DeepAgents | LangChain's open-source framework containing the research implementation | Not yet catalogued |
| Claude Sonnet 4.6 | One of two models tested in the hill-climbing experiments | N/A (model, not tool) |
| GLM-5 | Second model tested; showed even stronger improvement trajectory | N/A (model, not tool) |
| TerminalBench 2.0 | The benchmark where LangChain jumped from outside top 30 to rank 5 via harness-only changes | Referenced in [00-source-article.md](../../harness-architecture/00-source-article.md) |

---

## Action Items

- [ ] Design an eval suite for our tmux orchestrator workers: trace failures from devlog, categorize by behavior type (tool selection, planning, execution, error recovery), create optimization/holdout splits
- [ ] Adopt one-change-per-iteration discipline when modifying worker prompts or orchestrator configuration — track each change as a discrete experiment with before/after measurements
- [ ] Implement the four recurring improvement patterns in our worker prompts: reasonable defaults, no redundant questions, exploration bounding, domain-defining questions first
- [ ] Investigate LangSmith or equivalent trace infrastructure for our orchestrator — the feedback flywheel requires centralized trace logging with version comparison
- [ ] Add "eval hygiene" to our maintenance cadence: review and prune stale eval criteria as models improve
