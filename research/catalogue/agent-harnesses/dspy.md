# DSPy

> **The framework for programming -- not prompting -- language models.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [stanfordnlp/dspy](https://github.com/stanfordnlp/dspy) |
| GitHub Stars | 32,382 (as of 2026-03-08) |
| Publisher | Stanford NLP (research lab — Omar Khattab leads, Databricks is primary enterprise sponsor) |
| License | MIT |
| Tech Stack | Python. Core deps: litellm (100+ LM providers), pydantic, optuna (Bayesian search). MLflow integration for observability. |
| Maturity | 🟢 Production (DSPy 3.1.3, Feb 2026. ICLR 2024 paper, ICLR 2026 Oral for GEPA optimizer. Databricks enterprise deployment.) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | DSPy solves a different problem than what we face today. We orchestrate Claude Code agents via tmux/Agent Teams -- DSPy optimizes the LM calls themselves. It becomes relevant only if we build a custom agent runtime or want to optimize prompts algorithmically. Not a replacement for our orchestration layer, but a potential enhancement for the LM-call layer beneath it. |
| **Novelty** | 7/10 | The automatic prompt optimization paradigm (MIPROv2, GEPA) is genuinely novel and has no equivalent in any other framework. The Assertions system (164% compliance improvement) and the BetterTogether meta-optimizer (60-80% cost reduction via distillation) are concepts we haven't seen elsewhere. |
| **Actionable** | 3/10 | Low immediate actionability. We would need to build a custom agent runtime before DSPy becomes useful -- Claude Code's prompt layer is a black box we can't inject DSPy into. The transferable patterns (typed contracts, machine-checkable assertions, metric-driven improvement) are intellectually valuable but require significant engineering to adopt. |

---

## Overview

DSPy (Declarative Self-improving Python) is a Stanford NLP framework that replaces manual prompt engineering with a programmatic, optimizable approach to building LM-powered systems. Created by Omar Khattab (research started Feb 2022, first release Dec 2022, evolved through DSP to DSPy 3.x by 2026), it draws a deliberate parallel to PyTorch: just as PyTorch replaced manual gradient computation with composable neural network layers, DSPy replaces manual prompt writing with composable, optimizable modules.

The core thesis is radical: **you should never write a prompt string.** Instead, you declare input/output behavior via typed Signatures (`"question -> answer"`), choose invocation strategies via Modules (`ChainOfThought`, `ReAct`, `ProgramOfThought`), and let algorithmic Optimizers (MIPROv2, GEPA, BetterTogether) discover the optimal prompt text, few-shot examples, and even fine-tuning targets through Bayesian search and reflective evolution. The framework is model-agnostic via Adapters backed by litellm, meaning the same program runs on OpenAI, Anthropic, local Ollama, and 100+ other providers without code changes.

DSPy's multi-agent model differs fundamentally from message-passing frameworks (AutoGen, CrewAI). Each agent is a `dspy.Module` subclass with a `forward()` method. Multi-agent coordination is plain Python composition -- a parent module calls child modules, passing outputs between them. The entire pipeline is then holistically optimizable: DSPy can tune prompts across all agent boundaries simultaneously, a capability no other framework offers. Databricks is the primary enterprise sponsor, providing deep integration with Model Serving, Vector Search, and MLflow Tracing.

---

## Technical Architecture

```
User Code (Python)
       |
dspy.Module Composition     (Agent/pipeline definition: Signatures, Modules, Tools)
       |
Optimizers                   (MIPROv2, GEPA, BetterTogether — algorithmic prompt tuning)
       |
Adapters                     (ChatAdapter — translates Signatures to raw LM API calls)
       |
litellm                      (Model-agnostic provider layer: 100+ LMs)
       |
Any LM API                   (OpenAI, Anthropic, Google, local Ollama, Databricks Model Serving)
```

### Six Core Abstractions

| Abstraction | Role | Analogy |
|-------------|------|---------|
| **Signatures** | Typed I/O contracts (`"question -> answer"`) | Function signatures with semantic meaning |
| **Modules** | Parameterized strategies (Predict, ChainOfThought, ReAct) | PyTorch `nn.Module` |
| **Tools** | External functions/APIs agents can invoke | Function calling |
| **Adapters** | Bridge Signatures to raw LM APIs | Device drivers |
| **Optimizers** | Algorithms that compile programs into effective prompts/weights | PyTorch optimizers |
| **Metrics** | User-defined evaluation functions that drive optimization | Loss functions |

### Key Optimizers

| Optimizer | Mechanism | Best For |
|-----------|-----------|----------|
| **BootstrapFewShot** | Collects successful traces as few-shot demos | Quick boost with tiny datasets |
| **MIPROv2** | Bayesian search over instruction + demo combinations (3-stage: bootstrap, proposal, discrete search) | Production prompt optimization |
| **GEPA** (ICLR 2026 Oral) | Reflective prompt evolution with Pareto frontier maintenance. Outperforms RL (GRPO) by 6-20%, MIPROv2 by 10%+. 35x fewer rollouts. | State-of-the-art prompt optimization |
| **BetterTogether** | Meta-optimizer chaining prompt optimization + fine-tuning. 60-80% cost reduction. | Production cost optimization |

### DSPy Assertions

Two constraint types for runtime self-refinement:
- **`dspy.Assert`** (hard) — triggers retry with feedback, halts after max retries
- **`dspy.Suggest`** (soft) — triggers refinement, but never halts pipeline

Impact: up to 164% compliance improvement and 37% more high-quality responses.

---

## Publisher Background

**Stanford NLP Group** — one of the most influential NLP research labs globally (Christopher Manning's group). DSPy is led by **Omar Khattab**, who also created ColBERT (the leading neural retrieval model). The project has strong academic pedigree: ICLR 2024 paper for DSPy core, ICLR 2026 Oral for GEPA optimizer (Agrawal et al., 2025).

**Databricks** is the primary enterprise sponsor. DSPy is deeply integrated with the Databricks platform (Model Serving, Vector Search, MLflow Tracing). DSPy 3.0 was launched at DAIS 2025 (Databricks AI Summit). This gives DSPy a clear enterprise adoption path and commercial sustainability that pure academic projects typically lack.

Community: 32K+ GitHub stars, active Discord, DeepLearning.AI course. Framework overhead benchmarks at 3.53ms (vs LangChain 10ms, LangGraph 14ms).

---

## What's Valuable for Us

1. **Transferable Pattern: Typed Agent Contracts.** DSPy Signatures enforce structured I/O at every LM call boundary. Our orchestrator currently uses free-form markdown instructions for agent spawning. Even without adopting DSPy itself, we should define machine-checkable contracts for agent inputs/outputs to eliminate the "agent produced garbage output" failure mode.

2. **Transferable Pattern: Machine-Checkable Assertions.** `dspy.Assert` / `dspy.Suggest` with automatic retry is directly applicable. Our orchestrator should implement constraint-checking on agent outputs with automated retry-with-feedback rather than binary pass/fail.

3. **GEPA Optimizer for Prompt Tuning (Phase 3+).** If we build a custom agent runtime, DSPy's optimizers could algorithmically improve our orchestrator's task decomposition, agent instruction, and verification prompts. The research doc estimates 6-20% quality improvement over hand-crafted prompts.

4. **BetterTogether for Cost Reduction (Phase 4+).** The meta-optimizer's ability to distill orchestrator intelligence into smaller models (60-80% cost reduction) maps directly to the Master Blueprint's "Opus for reasoning, Haiku for execution" principle. Could enable using Sonnet/Haiku for routine orchestration tasks currently requiring Opus.

5. **Complementary Pattern: LangGraph + DSPy.** The ecosystem is converging on using graph-based orchestration (control flow) with DSPy-optimized LM calls at each node. If we adopt Pi Agent or build a custom runtime, DSPy could power the "thinking" layer while the runtime handles "acting."

6. **Framework Overhead Advantage.** 3.53ms per call vs LangChain 10ms and LangGraph 14ms. In agent loops making hundreds of calls, this 3-4x advantage compounds.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Wrong abstraction level for current stack** | DSPy optimizes LM calls. Claude Code is a black box -- we cannot inject DSPy between our orchestrator prompts and the Claude API. Unless we build a custom runtime, DSPy cannot touch our actual LM interactions. |
| **Multi-agent model is too simplistic** | DSPy's "multi-agent" is module composition in Python. It has no concept of file system agents, terminal commands, session persistence, crash recovery, or tmux-based coordination. It solves a fundamentally different problem than our orchestrator. |
| **No coding agent integration** | Direct integration with Claude Code, Cursor, or Copilot is "still emerging" per the research. DSPy operates at the LM API layer, not the tool-use layer. The gap between "optimized prompts" and "working code agents" remains unbridged. |
| **Optimization requires evaluation infrastructure** | MIPROv2 and GEPA need metrics, training sets, and evaluation loops. Orchestration quality is notoriously hard to evaluate -- defining good metrics is non-trivial and there's no off-the-shelf solution. |
| **Databricks dependency for enterprise features** | Deep integration with Databricks platform. Without Databricks, you lose MLflow Tracing, Model Serving integration, and enterprise deployment pipeline. We run on Claude Max, not Databricks. |

---

## Future Use Cases

- **Phase 1-2 (Days 1-60):** No direct adoption. Extract transferable patterns: implement typed agent contracts (structured I/O validation) and machine-checkable assertions (constraint-checking with retry) in our orchestrator prompt templates. These require zero DSPy dependency.

- **Phase 3 (Days 60-90):** If building a custom `AgentRuntime` adapter (per Master Blueprint), evaluate DSPy as the LM-call layer beneath it. Wrap critical orchestrator prompts (task decomposition, agent instruction, result verification) as DSPy Signatures. Run GEPA on historical orchestration traces to optimize prompt text. Start with the highest-impact prompt (agent spawn instructions) and measure quality delta.

- **Phase 4 (Days 90+):** BetterTogether meta-optimization to distill Opus-level orchestration intelligence into Sonnet/Haiku for cost reduction on routine tasks. Explore the LangGraph + DSPy complementary pattern if Pi Agent or another graph-based runtime is adopted. GEPA's Pareto frontier maintenance is particularly well-suited to the diverse task types an orchestrator handles.

---

## Key Takeaway

> **DSPy is the only framework that can algorithmically optimize prompts across multi-agent boundaries -- its GEPA optimizer (ICLR 2026 Oral) and Assertions system represent genuine breakthroughs -- but it operates at the wrong abstraction level for our current Claude Code-based stack, making it a Phase 3+ investment whose transferable patterns (typed contracts, machine-checkable constraints, metric-driven improvement) are more immediately valuable than the framework itself.**
