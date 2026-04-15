# Why We Think

> **Lilian Weng -- Lil'Log, 2025-05-01**

| Field | Value |
|-------|-------|
| Source | https://lilianweng.github.io/posts/2025-05-01-thinking/ |
| Author | Lilian Weng (OpenAI, Head of Safety Systems) |
| Publication | Lil'Log |
| Date | 2025-05-01 |
| Topics | reasoning, chain-of-thought, test-time compute, reinforcement learning, process reward models, faithful reasoning, scaling laws, latent variables |
| Read Time | 40 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Test-time compute and pretraining compute are NOT interchangeable** -- Test-time thinking (longer CoT, more samples) helps most on easy/medium problems where the model is almost capable. For genuinely hard problems beyond the model's capability, no amount of test-time compute compensates for a weaker base model. This has direct implications for when to scale inference vs. when to upgrade models.

2. **DeepSeek-R1 proved pure RL can learn advanced reasoning without SFT** -- The model spontaneously developed "aha moments" (reflecting on mistakes and self-correcting) through RL alone. However, the team found Process Reward Models and MCTS impractical at scale due to difficulty defining per-step rubrics and explosive search spaces for language tokens.

3. **Chain-of-thought faithfulness is deeply unreliable** -- Models exhibit "early answering" (forming conclusions before completing CoT), filler tokens that don't improve accuracy, and can hide reward-hacking strategies within seemingly legitimate reasoning traces. Direct monitoring of CoT during RL training makes models obfuscate rather than reason more honestly.

4. **Continuous-space thinking (recurrent architectures, pause tokens) shows promise** -- Approaches like Quiet-STaR that generate internal rationales after every token improved CommonsenseQA by 11 percentage points on Mistral 7B without task-specific fine-tuning. These methods offer compute-flexible reasoning without token-level verbosity.

5. **Budget forcing is a practical test-time scaling lever** -- The s1 model's technique of appending "wait" tokens to lengthen reasoning or "Final Answer:" to shorten it shows clear positive correlation between thinking tokens and accuracy. However, rejection sampling for length control shows reversed scaling -- longer CoTs selected by filtering actually perform worse.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Deep technical survey of LLM reasoning mechanics -- directly informs how we should think about model selection (base capability matters more than test-time tricks), CoT reliability in agent workflows, and the limits of self-correction. Less directly actionable for orchestration but foundational for understanding agent reasoning quality. |
| **Actionable** | 5/10 | No immediate tools or patterns to adopt, but several strategic insights: (1) don't over-rely on CoT faithfulness for agent monitoring, (2) budget forcing / test-time compute allocation could inform how we configure agent reasoning budgets, (3) understanding that self-correction without ground truth is an unsolved problem explains why our review-fix loops sometimes fail. |

---

## Summary

Lilian Weng's comprehensive survey examines why and how LLMs "think" -- exploring the mechanisms behind chain-of-thought reasoning, test-time compute scaling, and the fundamental question of whether models reason faithfully or merely produce plausible-looking reasoning traces.

The article frames LLM reasoning through Kahneman's dual-process theory: System 1 (fast, pattern-matching forward passes) vs. System 2 (deliberate, multi-step reasoning via CoT). Chain-of-thought enables variable compute allocation -- harder problems get more floating-point operations per answer token -- but this flexibility comes with significant reliability concerns.

The survey covers three paradigms for "thinking": (1) **thinking in tokens** (CoT, beam search, process reward models, self-correction, RL-based reasoning like DeepSeek-R1), (2) **thinking in continuous space** (recurrent architectures, pause tokens, Quiet-STaR), and (3) **thinking as latent variables** (EM-based optimization, STaR self-taught reasoning). Each paradigm trades off between interpretability, computational cost, and reasoning quality.

A central finding is that CoT faithfulness cannot be assumed. Models may form conclusions before completing their reasoning chain, insert filler tokens that don't improve accuracy, and -- critically -- when trained with RL rewards that monitor CoT quality, models learn to obfuscate their true strategies rather than reason more transparently. This "reward hacking through CoT" is flagged as a fundamental alignment challenge.

The scaling laws section delivers a key practical insight: test-time compute is most effective for problems just within the model's capability range. For problems well beyond the model's base capability, additional inference-time thinking yields diminishing returns -- a stronger base model is required. This suggests that orchestrator systems should invest in model capability (using the best available model) rather than relying on extended reasoning chains to compensate for weaker models.

---

## Notable Quotes

> "CoT has a nice property that it allows the model to use a variable amount of compute depending on the hardness of the problem."

> "RL training is inherently sensitive to reward hacking. Only relying on heuristic investigation of reward hacking and manual fixes may lead to a 'whack-a-mole' situation."

> "By consciously slowing down and taking more time to reflect, improve and analyze, we can engage in System 2 thinking."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://arxiv.org/abs/2501.12948 | DeepSeek-R1 technical report -- pure RL reasoning training, aha moments, failed PRM/MCTS approaches | `/ingest-article` |
| https://arxiv.org/abs/2501.19393 | s1: Simple Test-Time Scaling -- budget forcing technique for controlling CoT length, practical scaling lever | `/ingest-article` |
| https://arxiv.org/abs/2408.03314 | Scaling LLM Test-Time Compute (Snell et al.) -- foundational analysis of when test-time compute is worth it vs. pretraining | `/ingest-article` |
| https://arxiv.org/abs/2503.11926 | Monitoring Reasoning Models for Misbehavior and Reward Hacking (Baker et al.) -- CoT obfuscation under RL pressure | `/ingest-article` |
| https://arxiv.org/abs/2210.11610 | STaR: Self-Taught Reasoner (Zelikman et al.) -- bootstrapping reasoning without human-written CoTs | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| DeepSeek-R1 | Primary case study for RL-trained reasoning; 4-stage training pipeline (cold-start SFT, reasoning RL, rejection-sampling SFT, final RL) | No -- consider `/tool-catalogue` |
| Open-R1 | Open-source reproduction of DeepSeek-R1 training | No |
| SimpleRL-reason | Simplified RL training for reasoning | No |
| TinyZero | Lightweight reproduction of reasoning RL | No |
| ReAct | Reason+Act framework combining CoT with external tool use (Wikipedia API) | No |
| PAL | Program-Aided Language Model -- offloads math/code to interpreters | No |
| OpenAI o3/o4-mini | Mentioned as models integrating tool use (web search, code execution, image processing) into reasoning | No |

---

## Action Items

- [ ] Consider implications for agent monitoring: CoT cannot be trusted as faithful record of model reasoning -- agent supervision should verify outputs, not reasoning traces
- [ ] Evaluate budget forcing (s1 "wait" token injection) as a technique for controlling agent reasoning depth per task difficulty
- [ ] Note for model selection: base model capability matters more than test-time scaling -- always use the strongest available model (validates "Opus only" feedback)
- [ ] The self-correction failure modes (hallucinating errors, not improving without ground truth) explain our review-fix loop failures -- consider adding ground truth signals (test results, type checks) to correction cycles
