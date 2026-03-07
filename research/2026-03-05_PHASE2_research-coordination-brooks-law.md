# Phase 2 Research: Brooks' Law for AI Agents, Coordination Overhead, and Scaling Topologies

**Date**: 2026-03-05
**Cluster**: Scaling Q4 + Q6
**Lens**: IndyDevDan ("Knowing is engineering; not knowing is vibe coding")
**Status**: Complete

---

## Executive Summary

The central finding across all five research questions is this: **coordination overhead in multi-agent LLM systems follows Brooks' Law with even greater severity than human teams**. Google DeepMind and MIT's landmark study of 180 controlled experiments proves that communication overhead scales super-linearly (exponent 1.724), multi-agent token costs run 1.6-6.2x above single-agent baselines at matched performance, and error amplification reaches 17.2x in uncoordinated architectures. The only proven pattern that scales to 1,300+ PRs/week (Stripe's Minions) achieves this by **eliminating inter-agent coordination entirely** -- using one-shot, isolated agents with deterministic context assembly and zero shared state. The implication for the L-Thread Orchestrator is stark: invest in context engineering and task decomposition, not agent-to-agent communication.

---

## 1. The Mythical Agent-Month: Brooks' Law Applied to AI Agents

### 1.1 The Original Law and Its Formula

Brooks' Law states: "Adding manpower to a late software project makes it later." The mathematical basis is that communication channels grow as **N(N-1)/2** -- ten people require 45 channels, twenty require 190. The overhead is quadratic, meaning each new participant adds incrementally more coordination cost than the last.

### 1.2 Empirical Evidence: It's Worse for Agents

The December 2025 Google DeepMind / MIT paper ["Towards a Science of Scaling Agent Systems"](https://arxiv.org/abs/2512.08296) provides the first rigorous, quantitative test of this principle applied to LLM agents. Across **180 controlled experiments** spanning four benchmarks (Finance Agent, BrowseComp-Plus, PlanCraft, Workbench) and three LLM families (OpenAI, Google, Anthropic), they found:

- **Communication overhead scales super-linearly** with an exponent of **1.724** -- worse than the quadratic growth Brooks predicted for humans.
- **Coordination overhead formula**: O = (T_MAS - T_SAS) / T_SAS x 100%, where T_MAS is multi-agent token consumption and T_SAS is single-agent.
- **Measured overhead by architecture**: Independent (58%), Centralized (285%), Decentralized (263%), Hybrid (515%). This translates to **1.6-6.2x token budgets** relative to single-agent at matched performance.
- **The 45% threshold**: Once a single-agent baseline exceeds ~45% accuracy on a task, adding more agents yields **diminishing or negative returns** (beta = -0.408, p < 0.001).

### 1.3 The Crossover Point

Peter Forret's analysis ["The Mythical Agent-Month"](https://blog.forret.com/2025/2025-10-26/mythical-agent-month/) applies Brooks directly: an AI agent requires "context engineering" ramp-up analogous to onboarding a human. The communication with an AI agent (review, integration, validation) is often **more costly** than human-to-human code review because the human must verify machine-generated work they didn't write.

**Quantified crossover**: In tool-heavy environments (10+ tools), multi-agent efficiency dropped by **2-6x** compared to single agents. Cursor's experiment with 20 shared-context agents produced the output equivalent of **2-3 agents** due to lock contention and coordination failures.

### 1.4 IndyDevDan Lens

This is precisely the "knowing is engineering" principle. The quantified overhead numbers (1.724 exponent, 45% threshold, 2-6x efficiency drop) are not opinions -- they're empirical measurements. Anyone scaling agents without these numbers is vibe coding their architecture.

---

## 2. The Telephone Game: Hierarchical Instruction Degradation

### 2.1 The Distortion Model

In hierarchical multi-agent topologies, instructions pass through layers: orchestrator -> team lead -> worker agent. If each layer retains X% semantic fidelity, N layers yield X^N total fidelity. At 80% per layer:
- 2 layers: 64%
- 3 layers: 51.2%
- 4 layers: 40.9%

### 2.2 Empirical Evidence of Cascading Failures

The UC Berkeley paper ["Why Do Multi-Agent LLM Systems Fail?"](https://arxiv.org/abs/2503.13657) (NeurIPS 2025) provides the most comprehensive evidence, analyzing **1,600+ annotated traces** across 7 MAS frameworks. Their Multi-Agent System Failure Taxonomy (MAST) identifies **14 unique failure modes** in 3 categories:

1. **System Design Issues**: Poor prompt design, missing role constraints, lack of termination criteria
2. **Inter-Agent Misalignment**: Miscommunication, conflicting assumptions, missing context propagation
3. **Task Verification**: Inadequate quality control

Key finding: **"A single root-cause error propagates through subsequent decisions, leading to task failure."** Memory and reflection errors are the most common propagation sources, typically arising in early/mid-trajectory steps (6-15), where early missteps cascade downstream.

### 2.3 Error Amplification Quantified

From the Google DeepMind study:
- **Independent agents** amplify errors **17.2x** through unchecked propagation
- **Centralized coordination** contains amplification to **4.4x**

The cascading failure paper ["From Flat Logs to Causal Graphs"](https://arxiv.org/html/2602.23701) (CHIEF framework) confirms: error cascades proceed down the dependency chain, with each agent building on a faulty foundation. The initial small error becomes amplified and compounded at each step.

### 2.4 Stripe's Insight: The Compound Probability Problem

Stripe's engineering blog explicitly quantifies this for coding agents: **a five-step chain where each step has 95% accuracy yields ~77% end-to-end reliability**. At 90% per step, five steps = 59%. At 85%, five steps = 44%. This is why they chose one-shot over multi-step.

| Steps | 95%/step | 90%/step | 85%/step | 80%/step |
|-------|----------|----------|----------|----------|
| 1     | 95.0%    | 90.0%    | 85.0%    | 80.0%    |
| 2     | 90.3%    | 81.0%    | 72.3%    | 64.0%    |
| 3     | 85.7%    | 72.9%    | 61.4%    | 51.2%    |
| 5     | 77.4%    | 59.0%    | 44.4%    | 32.8%    |
| 10    | 59.9%    | 34.9%    | 19.7%    | 10.7%    |

### 2.5 Mitigation Strategies from Research

The MAST taxonomy identifies that solutions focused on communication protocols are **insufficient** for inter-agent misalignment -- agents need deeper "social reasoning" abilities. Current practical mitigations:
- **Scratchpad pattern**: Agents track intermediate steps internally, passing only final messages (reduces token consumption significantly)
- **File-identifier passing**: Instead of full content, pass URIs/paths so agents read from source (avoids re-encoding overhead)
- **Flat architectures**: Minimize layers to reduce compound fidelity loss

---

## 3. Optimal Team Size for Coding Agents

### 3.1 The Research Consensus: 3-4 Agents Maximum

Multiple independent sources converge on a narrow band:

**Google DeepMind (2025)**: Effective team sizes are limited to approximately **3-4 agents**. Beyond this, coordination cost exceeds execution value for most task types.

**HyperAgent** (SWE-Bench): The most successful multi-agent coding system uses exactly **4 specialized agents**: Planner, Navigator, Code Editor, Executor. Achieved 33% on SWE-Bench-Verified, surpassing existing methods.

**DyLAN (Dynamic LLM-Powered Agent Networks)**: Uses an "Agent Importance Score" to dynamically select the **minimum effective subset** of agents per task, demonstrating that fewer, better-selected agents outperform larger static teams.

### 3.2 The Single-Agent-with-Skills Alternative

A January 2026 paper ["When Single-Agent with Skills Replace Multi-Agent Systems and When They Fail"](https://arxiv.org/abs/2601.04748) provides a striking counter-argument:

- **Compiling multi-agent systems into single-agent skill libraries** reduces token consumption by **53.7% on average**
- HotpotQA: 58.4% token reduction, **+4.0% performance improvement** over multi-agent
- GSM8K: 56.2% token reduction
- API calls reduced by up to **75%** (from 4 calls to 1)
- **Caveat**: Skill selection accuracy degrades non-linearly as libraries grow, exhibiting a "phase transition" at a capacity threshold

This means the optimal team size might be **1 agent with many skills** for tasks where context integration matters more than parallel execution.

### 3.3 Task-Dependent Optimal Size

The Google DeepMind study's predictive model (R^2 = 0.513, 87% accuracy on unseen tasks) shows:

| Task Type | Optimal Architecture | Why |
|-----------|---------------------|-----|
| Parallelizable (finance) | Centralized, 3-4 agents | +80.9% over single agent |
| Web navigation (dynamic) | Decentralized, 2-3 agents | +9.2% over single agent |
| Sequential reasoning | **Single agent** | All MAS variants degraded by 39-70% |
| Tool-heavy (10+ tools) | **Single agent** | 2-6x efficiency drop in MAS |

### 3.4 AgentDropout: Dynamic Elimination

The ["AgentDropout"](https://aclanthology.org/2025.acl-long.1170/) technique (ACL 2025) dynamically eliminates unnecessary agents during execution, achieving both **token efficiency and performance gains**. This suggests the optimal team size is not static but should shrink during execution as redundant agents are identified.

---

## 4. Topology Comparison at Scale

### 4.1 The Five Architectures Tested

The Google DeepMind study defines and benchmarks five canonical topologies:

| Topology | Description | Token Overhead | Error Amplification |
|----------|-------------|---------------|-------------------|
| **Single Agent** | Baseline | 1.0x | 1.0x |
| **Independent** | Parallel, no communication | 1.58x | 17.2x |
| **Centralized** | Hub-and-spoke with orchestrator | 3.85x | 4.4x |
| **Decentralized** | Peer-to-peer, no hierarchy | 3.63x | Medium |
| **Hybrid** | Centralized + Decentralized | 6.15x | Lowest |

### 4.2 Communication Overhead Analysis

**Hub-and-Spoke (Centralized)**:
- Connections scale as **N** (each agent connects only to the hub)
- All traffic flows through the orchestrator, creating a **bandwidth bottleneck**
- Best for parallelizable tasks (+80.9% on financial reasoning)
- The orchestrator becomes a single point of failure and a context window bottleneck

**Mesh (Decentralized)**:
- Connections scale as **N(N-1)/2** (quadratic)
- No single bottleneck but massive communication overhead
- Best for dynamic tasks where agents need to share real-time state (+9.2% on web navigation)
- Impractical beyond ~4 agents due to connection explosion

**Hierarchical (Multi-level Hub-and-Spoke)**:
- Reduces per-node connections but introduces the "telephone game" degradation from Section 2
- Each additional level compounds both latency and fidelity loss
- Practical only when tasks decompose cleanly into independent subtrees

**Independent (Embarrassingly Parallel)**:
- Zero communication overhead
- Highest error amplification (17.2x) because errors are never caught
- Only works with voting/aggregation on simple outputs

### 4.3 The AWS Perspective

[AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_planning_network_topology_prefer_hub_and_spoke.html) recommends hub-and-spoke over mesh for the same reasons: lower connection overhead at the cost of hub bottleneck. In practice, most production multi-agent systems adopt centralized (hub-and-spoke) topology because the orchestrator bottleneck is preferable to quadratic mesh overhead.

### 4.4 Augment Code's Thesis

[Augment Code's "The End of Linear Work"](https://www.augmentcode.com/blog/the-end-of-linear-work) (January 2026) argues that **parallel execution is no longer the hard part -- coordination is**. When several agents work against different interpretations of "done," integration becomes the dominant cost. Git tracks changes but not intent, and reviewing intent scales far better than reviewing code.

---

## 5. Stripe's Minions: The Only Proven Pattern at Scale

### 5.1 The Numbers

- **1,300+ merged PRs per week** with zero human-written code
- Humans review but do not write the code
- Each "minion" executes **exactly one task in a single LLM call**
- Maximum **2 CI retry attempts** before handing to human

### 5.2 Why One-Shot Wins

Stripe's architecture deliberately eliminates every source of coordination overhead:

1. **Zero inter-agent coordination**: Agents never communicate with each other
2. **Deterministic context assembly**: Before the LLM fires, a deterministic orchestrator prefetches all context (Jira tickets, documentation, code via Sourcegraph/MCP), curating a surgical subset of ~15 tools from 400+ available
3. **Single LLM call**: No multi-turn reasoning chains, no error compounding
4. **Strict I/O contracts**: Execution is deterministic in structure even though model output is probabilistic
5. **Hard retry limit**: 2 attempts maximum, then escalate to human

### 5.3 The Six-Layer Architecture

Stripe built what they describe as an **embedded governance framework**:

1. **Context Assembly Pipeline**: Gathers, scores, and prunes data to fit token budget
2. **Task Definition**: Structured, machine-readable specifications
3. **Orchestration Layer**: Parallel dispatch of independent tasks
4. **Agent Execution**: Single LLM call with deterministic controls at each boundary
5. **CI/Validation Gates**: Automated testing with hard 2-attempt limit
6. **Human Review**: Final gate, reviewing code they didn't write

The philosophy: **"The walls matter more than the model."** The governance infrastructure constraining the AI is more important than which model you use.

### 5.4 Is One-Shot the Only Scalable Pattern?

Based on all evidence reviewed, **one-shot with zero inter-agent coordination is currently the only pattern proven to scale beyond ~4 agents**. The alternatives:

| Pattern | Max Proven Scale | Limitation |
|---------|-----------------|------------|
| One-shot isolated | 1,300+ PRs/week (Stripe) | Tasks must be independently decomposable |
| Centralized MAS | ~4 agents | Orchestrator bottleneck, 3.85x token overhead |
| Decentralized MAS | ~3 agents | Quadratic communication, error propagation |
| Hybrid MAS | ~4 agents | 6.15x token overhead, highest coordination cost |
| Single-agent with skills | Unlimited tasks (serial) | No parallelism, skill selection degrades at scale |

The Gastown framework (Steve Yegge) independently arrived at the same conclusion after four failed orchestration patterns: **peer coordination does not scale**. The solution: isolated workers with external contracts (specs, task queues, structured state) replacing shared memory.

---

## 6. Synthesis: The Coordination Token Tax

### 6.1 Quantifying the Real Cost

IndyDevDan's principle that "context is the bottleneck" is precisely validated by the data. Coordination tokens are the real cost of multi-agent systems:

| Metric | Single Agent | Multi-Agent (Naive) | Multi-Agent (Optimized) |
|--------|-------------|--------------------|-----------------------|
| Token consumption | 1x | 4-220x | 1.6-6.2x |
| Compared to chat | ~4x | ~15x | ~8x |
| API calls per task | 1 | 4-10+ | 2-4 |
| Error propagation | 1x | 17.2x (independent) | 4.4x (centralized) |
| Context re-encoding | 0% | 40-60% redundant | 10-20% with scratchpad |

At $0.30-$3.00 per million context tokens, a 15x token multiplier on a system processing thousands of tasks per day becomes a material cost center.

### 6.2 The Decision Framework

Based on the evidence, the decision of when to use multi-agent systems reduces to three questions:

1. **Is the task parallelizable?** If no, use a single agent. Multi-agent degrades sequential tasks by 39-70%.
2. **Is single-agent accuracy below 45%?** If yes, multi-agent coordination can help. If no, it will likely hurt.
3. **Can tasks be decomposed into independent units?** If yes, use Stripe's pattern (one-shot isolated). If no, limit to 3-4 agents with centralized topology.

### 6.3 Implications for L-Thread Orchestrator

The L-Thread Orchestrator's architecture should prioritize:

1. **Context engineering over agent communication**: Invest in pre-LLM context assembly (Stripe's approach). The deterministic pipeline before the LLM call determines output quality more than the number of agents.
2. **One-shot isolated agents for scalable parallelism**: Each agent gets a fully assembled context payload, executes once, returns structured output. No inter-agent chat.
3. **Hard retry limits**: Maximum 2 attempts per agent task, then escalate. Diminishing returns are real and quantified.
4. **Flat architecture**: Minimize hierarchy layers. Each layer compounds fidelity loss (~80% per layer) and error amplification.
5. **Dynamic agent elimination**: Start with needed agents, eliminate redundant ones during execution (AgentDropout pattern).
6. **Skill compilation for sequential work**: For non-parallelizable tasks, compile agent roles into skills on a single agent (53.7% token savings).

---

## 7. Open Questions and Research Gaps

1. **No longitudinal studies**: All current research measures single-session performance. No studies track multi-agent system reliability over weeks/months of continuous operation.
2. **Context window scaling**: As models expand to 1M+ tokens, does the single-agent-with-skills approach become universally superior?
3. **Semantic fidelity measurement**: No standardized metric exists for measuring instruction degradation through hierarchical layers -- the "80% per layer" is an estimate, not a measured constant.
4. **Cost-adjusted benchmarks**: Most studies report accuracy, not accuracy-per-dollar. The true optimal team size depends on budget constraints.
5. **Dynamic topology switching**: No system yet switches topology mid-task based on real-time coordination overhead measurements.

---

## Sources

### Core Research Papers
- [Towards a Science of Scaling Agent Systems (Google DeepMind / MIT, Dec 2025)](https://arxiv.org/abs/2512.08296)
- [Google Research Blog: When and Why Agent Systems Work](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)
- [Why Do Multi-Agent LLM Systems Fail? (UC Berkeley, NeurIPS 2025)](https://arxiv.org/abs/2503.13657)
- [MAST Taxonomy GitHub Repository](https://github.com/multi-agent-systems-failure-taxonomy/MAST)
- [When Single-Agent with Skills Replace Multi-Agent Systems (Jan 2026)](https://arxiv.org/abs/2601.04748)
- [Multi-Agent Collaboration Mechanisms: A Survey of LLMs](https://arxiv.org/html/2501.06322v1)
- [LLM-Based Multi-Agent Systems for Software Engineering (ACM TOSEM)](https://dl.acm.org/doi/10.1145/3712003)
- [AgentDropout: Dynamic Agent Elimination (ACL 2025)](https://aclanthology.org/2025.acl-long.1170/)
- [From Flat Logs to Causal Graphs: CHIEF Framework](https://arxiv.org/html/2602.23701)
- [Single-agent or Multi-agent Systems? Why Not Both?](https://arxiv.org/pdf/2505.18286)
- [A Token-Efficient Framework for Codified Multi-Agent Systems](https://arxiv.org/pdf/2507.03254)
- [Where LLM Agents Fail and How They Can Learn From Failures](https://arxiv.org/abs/2509.25370)

### Stripe Minions
- [Minions: Stripe's One-Shot Coding Agents (Part 1)](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Minions: Stripe's One-Shot Coding Agents (Part 2)](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)
- [Deconstructing Stripe's Minions (SitePoint)](https://www.sitepoint.com/stripe-minions-architecture-explained/)
- [Stripe's Coding Agents: The Walls Matter More Than the Model](https://www.anup.io/stripes-coding-agents-the-walls-matter-more-than-the-model/)
- [Stripe Minions on Hacker News](https://news.ycombinator.com/item?id=47110495)

### Analysis and Commentary
- [The Mythical Agent-Month (Peter Forret)](https://blog.forret.com/2025/2025-10-26/mythical-agent-month/)
- [The End of Linear Work (Augment Code, Jan 2026)](https://www.augmentcode.com/blog/the-end-of-linear-work)
- [Stop Blindly Scaling Agents (Medium)](https://evoailabs.medium.com/stop-blindly-scaling-agents-a-reality-check-from-google-mit-0cebc5127b1e)
- ['More Agents' Isn't a Reliable Path (VentureBeat)](https://venturebeat.com/orchestration/research-shows-more-agents-isnt-a-reliable-path-to-better-enterprise-ai)
- [Why Your Multi-Agent AI System Is Probably Making Things Worse (ImagineX)](https://www.imaginexdigital.com/insights/why-your-multi-agent-ai-system-is-probably-making-things-worse)
- [AI Coding Agents: Coherence Through Orchestration (Mike Mason, Jan 2026)](https://mikemason.ca/writing/ai-coding-agents-jan-2026/)
- [Brooks's Law (Wikipedia)](https://en.wikipedia.org/wiki/Brooks's_law)

### Benchmarks
- [FeatureBench: Benchmarking Agentic Coding](https://arxiv.org/html/2602.10975v1)
- [HyperAgent: Generalist Software Engineering Agents](https://openreview.net/forum?id=PZf4RsPMBG)
- [Comprehensive Empirical Evaluation of Agent Frameworks](https://arxiv.org/html/2511.00872v1)
- [LLM-Coordination: NAACL 2025](https://arxiv.org/abs/2310.03903)
