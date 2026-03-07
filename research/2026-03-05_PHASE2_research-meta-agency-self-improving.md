# Phase 2 Research: Bleeding Edge Frontier -- Meta-Agency, Self-Improving Systems, and Tool Genesis

**Date**: 2026-03-05
**Agent**: bleeding-edge-frontier
**Lens**: IndyDevDan (Tier 3 Meta-Agency, Progressive Deletability, "Tools shape what you believe is possible")
**Status**: Complete

---

## Executive Summary

This research investigates four frontier questions at the bleeding edge of agentic AI: (1) automatic generation of agent teams from specifications, (2) self-improving prompt systems via feedback loops, (3) agents that design their own tools at runtime, and (4) what IndyDevDan's "Tier 3 Meta-Agency" looks like in practice. The findings reveal that all four capabilities now exist -- not as vaporware, but as shipped code, published papers, and production systems. The gap between "research curiosity" and "production primitive" has collapsed in the last 12 months. The system that builds the system is no longer theoretical. It is being built by multiple independent teams, converging on remarkably similar architectures.

---

## 1. Auto-Generated Agent Teams from Project Specifications

### The Question
Has anyone built a system that reads a project spec and automatically generates: optimal number/types of agents, their system prompts, tool permissions, task decomposition, and dependency graph?

### The Answer: Yes. Multiple Independent Implementations Exist.

#### 1.1 ADAS / Meta Agent Search (ICLR 2025)

The most theoretically rigorous answer comes from **Automated Design of Agentic Systems (ADAS)** by Shengran Hu et al. (UBC/Vector Institute). Their **Meta Agent Search** algorithm is a meta-agent that iteratively programs new agents in code, evaluates them, adds them to an archive of discovered agents, and uses this archive to create better agents in subsequent iterations.

The key insight: because programming languages are Turing Complete, this approach can theoretically learn **any possible agentic system** -- novel prompts, tool use, workflows, and combinations thereof. Meta Agent Search consistently outperforms hand-designed agents across domains, and discovered agents transfer across models and domains.

This is the closest thing to IndyDevDan's Tier 3: a system that searches the space of all possible agent architectures and finds ones humans would not have designed.

- Paper: https://arxiv.org/abs/2408.08435
- Code: https://github.com/ShengranHu/ADAS
- Venue: ICLR 2025

#### 1.2 MetaAgent: FSM-Based Automatic Multi-Agent Construction (ICML 2025)

**MetaAgent** (University of Wisconsin-Madison) takes a task description and automatically generates a multi-agent system structured as a **Finite State Machine**. Each state includes: (a) the task-solving agent, (b) instructions for that agent, (c) a condition verifier that checks state transition conditions, and (d) listener agents who receive output.

Key capability: **State Traceback** -- the system can return to a previous state to fix issues, enabling self-correction in the generated architecture.

Performance: surpasses other auto-designed methods by 9% on text-based tasks, and achieves 97% of the performance of the best human-designed systems on ML tasks.

- Paper: https://arxiv.org/abs/2507.22606
- Code: https://github.com/SaFoLab-WISC/MetaAgent

#### 1.3 MAS-ZERO: Zero-Supervision Multi-Agent Design (2025)

**MAS-ZERO** is the first self-evolved, inference-time framework for automatic MAS design that requires **no validation set**. It employs meta-level design to iteratively design, critique, and refine MAS configurations tailored to each problem instance. Unlike static approaches, MAS-ZERO adapts at inference time -- every new problem gets a custom agent team.

- Paper: https://arxiv.org/abs/2505.14996

#### 1.4 OpenSage: Self-Programming Agent Generation Engine (Feb 2026)

The most recent and radical entry: **OpenSage** is the first ADK (Agent Development Kit) that enables LLMs to automatically create agents with **self-generated topology and toolsets**. Agents can create and manage their own sub-agents and toolkits. It features a hierarchical, graph-based memory system.

The authors explicitly frame this as shifting agent development from "human-centered to AI-centered paradigms."

- Paper: https://arxiv.org/abs/2602.16891

#### 1.5 NVIDIA Orchestrator-8B / ToolOrchestra (Late 2025)

NVIDIA's contribution is more surgical: a small 8B-parameter model trained via reinforcement learning to coordinate tools and specialized models. Given a complex task, Orchestrator-8B analyzes it, decomposes it, and invokes the right tools/models in the right order.

The stunning result: **Nemotron-Orchestrator-8B achieves 37.1% on Humanity's Last Exam, surpassing GPT-5 (35.1%) at 30% of the cost and 2.5x faster.** This proves that the orchestration layer -- not the model -- is the competitive advantage, which is precisely IndyDevDan's thesis.

- Paper/Blog: https://developer.nvidia.com/blog/train-small-orchestration-agents-to-solve-big-problems
- Model: https://huggingface.co/nvidia/Nemotron-Orchestrator-8B
- Code: https://github.com/NVlabs/ToolOrchestra

#### 1.6 Composio Agent Orchestrator (Feb 2026 -- Open Source)

Composio shipped and open-sourced a production Agent Orchestrator with a dual-layered architecture: a **Planner** layer that decomposes objectives into verifiable sub-tasks, and an **Executor** layer that handles tool interaction. The system employs "Just-in-Time" context management, routing only relevant tool definitions to each agent.

Their blog reports: **40,000 lines of TypeScript, 17 plugins, 3,288 tests -- built in 8 days** by the agents the system orchestrates. The orchestrator itself was built by an agent (ao-52), creating a recursive self-improvement loop.

- Blog: https://composio.dev/blog/the-self-improving-ai-system-that-built-itself
- Code: https://github.com/ComposioHQ/agent-orchestrator

#### 1.7 AutoAgents and MetaGPT

Earlier frameworks like **AutoAgents** (IJCAI 2024) demonstrated the core pattern: a Planner, Agent Observer, and Plan Observer collaboratively synthesize a customized agent team and execution plan. **MetaGPT** evolved this into MGX, described as the world's first AI agent development team, using a shared message pool architecture.

- AutoAgents: https://arxiv.org/abs/2309.17288
- MetaGPT: https://github.com/FoundationAgents/MetaGPT

### IndyDevDan Lens

NVIDIA's result is the smoking gun for IndyDevDan's core thesis: **"The orchestration layer is the asset, not the runtime."** An 8B model beating GPT-5 proves that knowing how to coordinate matters more than raw capability. ADAS's Meta Agent Search is the purest expression of Tier 3 -- a system that searches the space of all possible agent architectures. The question is no longer whether auto-generation works. The question is how fast you can build the meta-system.

---

## 2. Self-Improving Prompt Systems via Feedback Loops

### The Question
Are there production systems where agent prompts automatically improve based on success/failure?

### The Answer: Yes. The Field Has Matured from Research to Production Primitives.

#### 2.1 DSPy: Prompts as Programs (Stanford, 2023-2026)

**DSPy** (Declarative Self-improving Python) remains the foundational framework. Rather than treating prompts as fixed text, DSPy treats them as programs that can be optimized. You define structured pipelines, and DSPy's optimizers automatically improve how these pipelines interact with language models.

A 2025 production study applied DSPy to five enterprise use cases -- guardrail enforcement, hallucination detection in code, code generation, routing agents, and prompt evaluation -- demonstrating that prompt optimization moves into practice in actual company workflows. The prompt evaluation task showed accuracy improvement from **46.2% to 64.0%** through automated optimization.

- Site: https://dspy.ai
- Paper: https://arxiv.org/abs/2310.03714
- Production study: https://arxiv.org/abs/2507.03620

#### 2.2 PromptBreeder: Self-Referential Self-Improvement (DeepMind)

**PromptBreeder** is the most conceptually radical approach: a self-referential system that mutates both task-prompts AND mutation-prompts. Given a seed set of mutation-prompts and thinking-styles, it evolves task-prompts for domain adaptation while simultaneously evolving the mutation operators themselves. This is meta-improvement: the system improves its ability to improve.

- Paper: https://arxiv.org/pdf/2309.16797

#### 2.3 TextGrad and OPRO

**TextGrad** uses backpropagation with text-based feedback -- evaluating LLM output to identify weaknesses, then improving the prompt accordingly.

**OPRO** (Optimization by Prompting) uses meta-prompting: an LLM optimizes a prompt by considering previous prompts alongside their training accuracy, then progressively crafts new prompts. A 10-round iterative process generating 10 candidates per round.

**SPO** (Self-Supervised Prompt Optimization) achieves competitive performance while maintaining costs of only **1.1% to 5.6%** of other methods -- making self-improving prompts economically viable at scale.

- SPO: https://arxiv.org/abs/2502.06855

#### 2.4 Agentic Neural Networks (LMU Munich, June 2025)

The **Agentic Neural Network (ANN)** framework conceptualizes multi-agent collaboration as a layered neural network where each agent is a node and each layer is a cooperative team. The two-phase optimization: Forward Phase (dynamic task decomposition and team construction) and Backward Phase (textual backpropagation refining both global and local collaboration). Agents self-evolve their roles, prompts, and coordination.

Result: **93.9% accuracy on HumanEval using GPT-4o-mini** -- a lightweight model achieving near-perfect scores through self-evolving coordination.

- Paper: https://arxiv.org/abs/2506.09046

#### 2.5 A Self-Improving Coding Agent (Bristol, April 2025)

The most direct answer to "can coding agents improve their own prompts?": **SICA** (Self-Improving Coding Agent) eliminates the distinction between meta-agent and target agent. The agent can edit its own codebase to improve itself with respect to cost, speed, and benchmark performance. Performance gains: **17% to 53% on SWE Bench Verified** through non-gradient-based learning driven by LLM reflection and code updates.

- Paper: https://arxiv.org/abs/2504.15228

#### 2.6 aiXplain Evolver (Production, November 2025)

**Evolver** is a production meta-agent from aiXplain. It treats agent optimization as a search problem. The LLM acts as both Scientist (analyzing evaluation reports, proposing modifications) and Judge (evaluating outputs against structured criteria). The evaluation criteria themselves evolve as the agent improves -- the system learns what "good" means for specific use cases.

- Blog: https://aixplain.com/blog/evolver-meta-agent-self-improving-ai/

#### 2.7 Skill Evolver (Vadim Nicolai, Production 2026)

The **Skill Evolver** is a production system where an agent edits its own Markdown skill files, commands, hooks, and memory files based on measured evidence. Critical safety design: it cannot touch application source code (bounded blast radius). It only acts when scores drop. A mandatory Self-Questioning step before any edit prevents regressions.

This is progressive deletability in action: the meta-system constrains itself to the minimum modification surface.

- Blog: https://vadim.blog/skill-evolver-research-to-practice

#### 2.8 Yohei Nakajima's Synthesis (NeurIPS 2025 Adjacent)

Yohei Nakajima (BabyAGI creator) synthesized the state of the art: self-improvement mechanisms have become **concrete recipes rather than vague long-term concepts**. Key patterns:
- **Reflexion**: agents solve, see failures, write natural-language critiques, retry -- achieving ~91% pass@1 on HumanEval.
- **Self-Taught Optimizer**: recursive pattern where agent proposes improved code variants, enters self-edit phase, re-evaluates.
- **BabyAGI 2**: uses a functionz framework storing functions and metadata in a database; the agent loads, runs, and updates functions as it builds itself. Design principle: "the optimal way to build a general autonomous agent is to build the simplest thing that can build itself."

- Blog: https://yoheinakajima.com/better-ways-to-build-self-improving-ai-agents/

### IndyDevDan Lens

The Skill Evolver embodies IndyDevDan's philosophy most directly: evidence-based modification, bounded blast radius, progressive deletability. PromptBreeder's self-referential mutation is the theoretical ceiling -- improving the improver. The practical frontier is the convergence of DSPy (structured optimization) with Skill Evolver (safe self-modification) applied to agent orchestration prompts. This is where Tier 3 becomes operational.

---

## 3. Agents That Design Their Own Tools

### The Question
Has anyone built agents that create, register, and share new tools at runtime -- not just using pre-defined tools, but authoring tool definitions, testing them, making them available to other agents?

### The Answer: The Pattern Exists at Multiple Levels of Sophistication.

#### 3.1 Voyager: The Original Skill Library Pattern (2023, Still Foundational)

**Voyager** (NVIDIA/MineDojo) established the canonical pattern: an agent that creates executable code skills, verifies them through three feedback channels (execution errors, environment feedback, peer review from another LLM), and stores them in an ever-growing skill library. Skills are temporally extended, interpretable, and compositional -- they compound the agent's abilities and transfer to new environments.

This is the Ur-pattern for tool genesis. Every subsequent system is a variation on Voyager.

- Paper: https://arxiv.org/abs/2305.16291
- Site: https://voyager.minedojo.org

#### 3.2 LATM: Large Language Models as Tool Makers (ICLR 2024)

**LATM** formalized the two-phase architecture: (1) Tool Making -- a powerful LLM creates reusable Python utility functions, and (2) Tool Using -- a lightweight LLM uses those tools. The once-off cost of tool-making is amortized over many instances of tool-using.

Result: GPT-4 as tool maker + GPT-3.5 as tool user achieves GPT-4-level performance at a fraction of the cost. Tools are cached and shared via APIs.

- Paper: https://arxiv.org/abs/2305.17126
- Code: https://github.com/ctlllll/LLM-ToolMaker

#### 3.3 Dynamic Tool Generation at Runtime (2025-2026)

Multiple implementations now exist where agents create tools on-the-fly:

- **OpenAI's Code Interpreter pattern**: The o3-mini model creates data analysis code at runtime based on prompts -- the tool was not predetermined by developers.
- **ToolMaker** (academic): autonomously translates scientific code repositories into usable agent tools, installing dependencies, generating interface functions, and self-correcting through feedback.
- **CodeAct** (Apple ML Research): a framework where the LLM emits Python code, executes it via interpreter, observes results, and revises in multi-turn interaction.

A practitioner's perspective from DEV Community captures the state: "I Built AI Agents That Create Their Own Tools at Runtime" -- noting that while function-calling in LLM APIs exists, a bot deciding it needs a capability and writing it is fundamentally different.

- OpenAI Cookbook: https://cookbook.openai.com/examples/object_oriented_agentic_approach/secure_code_interpreter_tool_for_llm_agents
- CodeAct: https://machinelearning.apple.com/research/codeact
- DEV: https://dev.to/diego_falciola_02ab709202/i-built-ai-agents-that-create-their-own-tools-at-runtime-heres-how-and-why-nobody-else-does-this-dd3

#### 3.4 MCP as the Tool-Sharing Protocol (2025-2026)

The **Model Context Protocol** now supports dynamic tool registration at runtime. Servers can add tools via `McpSyncServer.addTool()` after client/server connection initialization, and a notification system informs clients about changes to available tools. Clients always get the most up-to-date tool list without restart.

Enterprise-grade registries like **MCP Gateway Registry** centralize tool discovery with OAuth authentication, enabling agent-to-agent communication and unified governance.

The implication: an agent can write a tool, register it as an MCP server, and other agents can discover and use it immediately. The protocol infrastructure for tool sharing between agents is production-ready.

- Spring AI Dynamic Tools: https://spring.io/blog/2025/05/04/spring-ai-dynamic-tool-updates-with-mcp
- MCP Gateway Registry: https://github.com/agentic-community/mcp-gateway-registry

#### 3.5 OpenSage: Agents with Self-Generated Toolsets (Feb 2026)

As noted in Section 1, **OpenSage** provides agents with the ability to create and manage their own sub-agents AND toolkits. This is the most complete implementation of the Voyager pattern applied to software engineering -- agents that extend their own capabilities as needed.

- Paper: https://arxiv.org/abs/2602.16891

#### 3.6 Claude Code Skills + MCP: The Practical Path

In the Claude Code ecosystem, the combination of **Skills** (dynamically loaded instruction/script folders) and **MCP servers** (exposable tool interfaces) creates a viable path for tool genesis:

1. An agent identifies a missing capability
2. It writes a script or MCP server implementing that capability
3. It registers it as a Skill or MCP endpoint
4. Other agents (subagents) inherit access to it

Claude Code's `claude mcp serve` mode means any Claude Code instance can expose its tools to other agents. The Tool Search Tool enables on-demand discovery. This is not theoretical -- it is shipped infrastructure.

- Claude Code Sub-agents: https://code.claude.com/docs/en/sub-agents
- Claude Code as MCP: https://github.com/steipete/claude-code-mcp

### IndyDevDan Lens

"Tools shape what you believe is possible." Tool genesis is the mechanism by which agents expand the space of what they believe is possible. The Voyager pattern + LATM economics + MCP sharing protocol = the infrastructure stack for Tier 3. The agent that can write its own tools and share them with other agents has achieved a form of open-ended capability growth. The constraint is trust: do you trust an agent's self-authored tool? IndyDevDan's "Year of Trust 2026" is the necessary complement to tool genesis.

---

## 4. IndyDevDan's Tier 3 Meta-Agency in Practice

### The Question
What does "the system that builds the system" look like as running code?

### The Convergent Architecture

Across all the systems surveyed, a strikingly consistent architecture emerges for Tier 3 meta-agency:

```
TIER 3: META-AGENCY ARCHITECTURE (Convergent Pattern)
======================================================

Layer 4: Meta-Search / Architecture Evolution
  - ADAS Meta Agent Search (searches space of all agent architectures)
  - PromptBreeder (evolves the mutation operators, not just prompts)
  - MAS-ZERO (generates custom agent team per problem at inference time)

Layer 3: Self-Improvement Loop
  - Skill Evolver (evidence-based self-modification with verification gates)
  - SICA (agent edits own codebase, improves speed/cost/accuracy)
  - Composio ao-52 (orchestrator built by agents, improves agents)
  - aiXplain Evolver (meta-agent optimizes agent graphs)
  - DSPy optimizers (structured prompt compilation)

Layer 2: Dynamic Capability Expansion
  - Tool Genesis (LATM, Voyager pattern, MCP dynamic registration)
  - Sub-agent Creation (OpenSage, Claude Code subagents)
  - Skill Library Growth (composable, transferable capabilities)

Layer 1: Execution
  - Specialized agents with auto-generated prompts and tool permissions
  - NVIDIA Orchestrator-8B style routing (small model, big coordination)
  - FSM-based state machines (MetaAgent) for traceable execution
```

### The Three Properties of Tier 3

Drawing from the research, Tier 3 meta-agency has three defining properties:

**1. Recursive Self-Reference**
The system improves its ability to improve. PromptBreeder mutates its mutation operators. Composio's orchestrator was built by an agent and improves the agents that built it. BabyAGI 2's design principle: "build the simplest thing that can build itself."

**2. Evidence-Based Bounded Modification**
Every production system enforces constraints on self-modification. The Skill Evolver cannot touch source code. SICA uses benchmark scores as objective functions. Composio logs performance and runs retrospectives. The meta-system simplifies, not complexifies -- this is progressive deletability.

**3. Open-Ended Capability Growth**
The system can expand what it's capable of -- not just optimize within fixed capabilities. Tool genesis (writing new tools), architecture search (discovering new agent configurations), and skill libraries (accumulating reusable components) all enable this.

### Dan Disler's Concrete Contributions

IndyDevDan's practical work includes:
- **indydevtools**: an opinionated agentic engineering toolbox for autonomous problem-solving
- **agent-sandbox-skill**: isolated execution environments (E2B Sandboxes) for safe agent operation
- **single-file-agents**: packing single-purpose, powerful AI agents into single Python files
- **Tactical Agentic Coding** course: teaching "Build the System That Builds the System" as an engineering discipline

His GitHub repositories and gists show a progression from Skills to Subagents to full orchestration patterns, with the meta-engineering principle baked into every layer.

- GitHub: https://github.com/disler
- Course: https://agenticengineer.com/tactical-agentic-coding

### The Practical Implementation Path

Based on the research, here is what Tier 3 meta-agency looks like as a buildable system:

1. **Start with an orchestrator** that decomposes tasks and spawns agents (this exists: L-Thread, Composio, MetaAgent)
2. **Add a self-improvement loop**: log agent outcomes, score them, feed scores into a prompt optimizer (DSPy, Skill Evolver pattern)
3. **Enable tool genesis**: let agents write MCP servers or skill scripts that other agents can discover and use
4. **Add architecture search**: let the meta-system try different agent configurations for different task types, keeping winners (ADAS pattern)
5. **Enforce progressive deletability**: every new capability must prove its value or get pruned. The system should get simpler over time, not more complex.

---

## 5. Synthesis: The State of the Bleeding Edge

### What Exists Today (March 2026)

| Capability | Status | Best Implementation |
|---|---|---|
| Auto-generate agent teams from spec | Production | Composio Agent Orchestrator, MetaAgent |
| Search space of all agent architectures | Research (ICLR 2025) | ADAS Meta Agent Search |
| Self-improving prompts in production | Production | DSPy, Skill Evolver, aiXplain Evolver |
| Agent edits its own code to improve | Research | SICA (53% gain on SWE-Bench) |
| Agents create tools at runtime | Production | CodeAct, MCP dynamic registration |
| Agents share tools with other agents | Production | MCP protocol, Claude Code as MCP server |
| Self-referential improvement (improve the improver) | Research | PromptBreeder, ANN textual backpropagation |
| Zero-supervision agent team design | Research | MAS-ZERO |
| Self-programming agent generation | Research (Feb 2026) | OpenSage |

### The Gap That Remains

No one has built all five layers into a single integrated system. The pieces exist independently:
- Composio has the orchestrator + self-improvement loop but not architecture search
- ADAS has architecture search but not tool genesis
- The Skill Evolver has safe self-modification but operates on a single agent
- MCP has the tool-sharing protocol but no automated tool creation pipeline

**The integration is the opportunity.** This aligns perfectly with the L-Thread Orchestrator's position: the orchestration layer is the asset, and the one who integrates these capabilities first owns the meta-layer.

### IndyDevDan's Framework Applied

- **"Knowing is engineering; not knowing is vibe coding."** -- The research is clear enough to engineer from. Self-improving prompts, tool genesis, and auto-generated agent teams are no longer speculative.
- **Context/Prompt/Model triad** -- Context (Skill Evolver, memory systems) remains highest leverage. NVIDIA proved a small model with great orchestration beats a big model without it.
- **Progressive deletability** -- Every production system that works enforces bounded self-modification. Unbounded self-modification fails. The meta-system must simplify.
- **"Year of Trust 2026"** -- Tool genesis and self-modification require trust infrastructure. MCP's OAuth and governance layers are the beginning, but trust in agent-authored tools is the unsolved frontier.
- **Observability before scale** -- Composio's retrospective logs, SICA's benchmark tracking, Skill Evolver's evidence requirements -- all prioritize observability over capability expansion.

---

## Sources (Complete)

### Auto-Generated Agent Teams
- [ADAS: Automated Design of Agentic Systems](https://arxiv.org/abs/2408.08435)
- [MetaAgent: FSM-Based Multi-Agent Construction](https://arxiv.org/abs/2507.22606)
- [MAS-ZERO: Zero-Supervision Multi-Agent Design](https://arxiv.org/abs/2505.14996)
- [OpenSage: Self-Programming Agent Generation Engine](https://arxiv.org/abs/2602.16891)
- [NVIDIA ToolOrchestra Blog](https://developer.nvidia.com/blog/train-small-orchestration-agents-to-solve-big-problems)
- [NVIDIA Orchestrator-8B on HuggingFace](https://huggingface.co/nvidia/Nemotron-Orchestrator-8B)
- [Composio Self-Improving AI System](https://composio.dev/blog/the-self-improving-ai-system-that-built-itself)
- [Composio Agent Orchestrator GitHub](https://github.com/ComposioHQ/agent-orchestrator)
- [AutoAgents Framework](https://arxiv.org/abs/2309.17288)
- [MetaGPT GitHub](https://github.com/FoundationAgents/MetaGPT)
- [Agent Teams Lite](https://github.com/Gentleman-Programming/agent-teams-lite)
- [DannyMac Meta-Agent](https://github.com/DannyMac180/meta-agent)

### Self-Improving Prompts
- [DSPy Framework](https://dspy.ai)
- [DSPy Production Study](https://arxiv.org/abs/2507.03620)
- [PromptBreeder Paper](https://arxiv.org/pdf/2309.16797)
- [SPO: Self-Supervised Prompt Optimization](https://arxiv.org/abs/2502.06855)
- [Agentic Neural Networks (Textual Backpropagation)](https://arxiv.org/abs/2506.09046)
- [SICA: A Self-Improving Coding Agent](https://arxiv.org/abs/2504.15228)
- [aiXplain Evolver](https://aixplain.com/blog/evolver-meta-agent-self-improving-ai/)
- [Skill Evolver (Vadim Blog)](https://vadim.blog/skill-evolver-research-to-practice)
- [Yohei Nakajima: Better Ways to Build Self-Improving AI Agents](https://yoheinakajima.com/better-ways-to-build-self-improving-ai-agents/)
- [OpenAI Self-Evolving Agents Cookbook](https://cookbook.openai.com/examples/partners/self_evolving_agents/autonomous_agent_retraining)
- [Awesome Self-Evolving Agents Survey](https://github.com/EvoAgentX/Awesome-Self-Evolving-Agents)

### Agents That Design Their Own Tools
- [Voyager (MineDojo)](https://voyager.minedojo.org)
- [LATM: LLMs as Tool Makers](https://arxiv.org/abs/2305.17126)
- [LATM Code](https://github.com/ctlllll/LLM-ToolMaker)
- [OpenAI Code Interpreter Cookbook](https://cookbook.openai.com/examples/object_oriented_agentic_approach/secure_code_interpreter_tool_for_llm_agents)
- [CodeAct (Apple ML)](https://machinelearning.apple.com/research/codeact)
- [Runtime Tool Creation (DEV Community)](https://dev.to/diego_falciola_02ab709202/i-built-ai-agents-that-create-their-own-tools-at-runtime-heres-how-and-why-nobody-else-does-this-dd3)
- [Spring AI Dynamic MCP Tools](https://spring.io/blog/2025/05/04/spring-ai-dynamic-tool-updates-with-mcp)
- [MCP Gateway Registry](https://github.com/agentic-community/mcp-gateway-registry)
- [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents)
- [Claude Code as MCP Server](https://github.com/steipete/claude-code-mcp)

### Meta-Agency and Self-Evolution
- [IndyDevDan GitHub](https://github.com/disler)
- [Tactical Agentic Coding](https://agenticengineer.com/tactical-agentic-coding)
- [IndyDevDan Agent Sandbox Skill](https://github.com/disler/agent-sandbox-skill)
- [EvoAgent: Self-Evolving Agent](https://arxiv.org/abs/2502.05907)
- [AgentEvolver](https://arxiv.org/abs/2511.10395)
- [Self-Evolving Agents Survey](https://arxiv.org/abs/2508.07407)
- [3-Tier Multi-Agent Architecture Blog](https://autofei.wordpress.com/2026/02/24/3-tier-multi-agent-architecture-future-of-ai/)
- [Agentic Design Patterns 2026 (SitePoint)](https://www.sitepoint.com/the-definitive-guide-to-agentic-design-patterns-in-2026/)

---

## Addendum: Deep-Dive Findings, Feasibility Assessment, and Implementation Roadmap

*Added 2026-03-05 (second research pass with additional web search coverage)*

### A1. Additional Systems Not Covered Above

#### AOrchestra (Feb 2026) -- The Four-Tuple Paradigm
AOrchestra models any agent as a compositional four-tuple `<Instruction, Context, Tools, Model>`. The central orchestrator concretizes this tuple at each step: curating task-relevant context, selecting tools/models, and delegating via on-the-fly automatic agent creation. Sub-agents are NOT static tools but dynamically created executors tailored to each sub-task.

**Results:** 80% overall on GAIA (165 tasks). Level 1: 88.7%, Level 2: 80.2%, Level 3: 61.5%. 16.28% relative improvement over strongest baseline with Gemini-3-Flash. Self-correction via Main-Agent reflection and replanning mitigates "context rot."

- Paper: [arxiv.org/abs/2602.03786](https://arxiv.org/abs/2602.03786)
- Code: [github.com/FoundationAgents/AOrchestra](https://github.com/FoundationAgents/AOrchestra)

#### AFlow (ICLR 2025 Oral) -- Monte Carlo Tree Search for Workflows
Reformulates workflow optimization as search over code-represented workflows. "Operators" encapsulate common agentic operations (Ensemble, Review, Revise).

**Results:** 5.7% average improvement over SOTA. Smaller models outperform GPT-4o on specific tasks at 4.55% of inference cost.

- Paper: [arxiv.org/abs/2410.10762](https://arxiv.org/abs/2410.10762)
- Code: [github.com/FoundationAgents/AFlow](https://github.com/FoundationAgents/AFlow)

#### DyLAN -- Dynamic LLM-Agent Network (COLM 2024)
Two-stage: (1) Team Optimization via Agent Importance Score (unsupervised), (2) Task Solving with dynamic communication. Automatically selects optimal team composition from candidates.

**Results:** 13.0% on MATH, 13.3% on HumanEval vs single execution. Up to 25.0% on specific MMLU subjects.

- Code: [github.com/SALT-NLP/DyLAN](https://github.com/SALT-NLP/DyLAN)

#### EvoAgentX (Jul 2025) -- Unified Evolution Framework
Integrates TextGrad, AFlow, and MIPRO to iteratively refine agent prompts, tool configurations, and workflow topologies. Five layers: basic components, agent, workflow, evolving, evaluation. Auto-assembles multi-agent workflow from simple goal description.

**Results:** 7.44% HotPotQA F1, 10% MBPP pass@1, 10% MATH, up to 20% on GAIA.

- Paper: [arxiv.org/abs/2507.03616](https://arxiv.org/abs/2507.03616)
- Code: [github.com/EvoAgentX/EvoAgentX](https://github.com/EvoAgentX/EvoAgentX)

#### STELLA (Jul 2025) -- Self-Evolving Tool Creation for Biomedical Research
Multi-agent architecture (Manager, Developer, Critic, Tool Creation Agent) with autonomous tool creation into a "Tool Ocean." Performance almost doubles with experience.

**Results:** 26% Humanity's Last Exam (Biomedicine), 54% LAB-Bench: DBQA, 63% LitQA. Designed enzymes with 3x efficiency over wild type.

- Paper: [arxiv.org/abs/2507.02004](https://arxiv.org/abs/2507.02004)
- Code: [github.com/zaixizhang/STELLA](https://github.com/zaixizhang/STELLA)

#### ToolMaker (ACL 2025) -- GitHub Repos to Agent Tools
Autonomously transforms GitHub repos into LLM-compatible tools. Two-stage workflow: environment setup + tool implementation with closed-loop self-correction.

**Results:** 80% task success rate (12/15), 94% unit-test pass rate. Outperforms OpenHands.

- Code: [github.com/KatherLab/ToolMaker](https://github.com/KatherLab/ToolMaker)
- Paper: [arxiv.org/abs/2502.11705](https://arxiv.org/abs/2502.11705)

#### Tool-R0 (Feb 2026) -- Self-Play Tool Learning from Zero Data
Co-evolves Generator (proposes tasks at competence frontier) and Solver (learns to solve with real tool calls) via complementary RL rewards. Zero external data.

**Results:** 92.5% relative improvement over base model. Surpasses fully supervised baselines.

- Paper: [arxiv.org/abs/2602.21320](https://arxiv.org/abs/2602.21320)

#### Letta Code Skill Learning (2025) -- The Most Practical Implementation
Memory-first coding harness. After solving complex tasks, `/skill` command extracts reusable skill as `.md` file. Skills are git-manageable, model-portable, and shareable across agents. Learning SDK: drop-in for adding continual learning to any LLM agent.

**Results:** Terminal Bench 2.0: 36.8% relative improvement (15.7% absolute) with learned skills.

- Blog: [letta.com/blog/skill-learning](https://www.letta.com/blog/skill-learning)
- Code: [github.com/letta-ai/letta-code](https://github.com/letta-ai/letta-code)
- SDK: [github.com/letta-ai/learning-sdk](https://github.com/letta-ai/learning-sdk)

#### Metaswarm (2026) -- Production Self-Reflecting Orchestration for Claude Code
Full orchestration layer: 9-phase workflow, 4-phase execution loop, JSONL knowledge base with patterns/gotchas/anti-patterns. After every merged PR, `self-reflect` analyzes what happened and writes new entries. Watches for: repeated instructions (skill candidates), disagreements (preferred approach capture), manual steps (automation candidates).

- Code: [github.com/dsifry/metaswarm](https://github.com/dsifry/metaswarm)

#### MasRouter (ACL 2025) -- Model Routing for Multi-Agent Systems
Determines when/how to use different LLMs based on query needs and roles. Enterprise LLM routing delivers 85% cost reduction while maintaining 95% of GPT-4 performance.

- Paper: [aclanthology.org/2025.acl-long.757](https://aclanthology.org/2025.acl-long.757.pdf)

#### PromptWizard (Microsoft, Dec 2024)
Self-evolving prompt optimization at $0.05/task. 5-60x cost reduction vs alternatives. 60x fewer API calls than PromptBreeder. Works with limited data and smaller LLMs.

- Code: [github.com/microsoft/PromptWizard](https://github.com/microsoft/PromptWizard)

#### AgentEvolver (ModelScope, Nov 2025)
Three synergistic mechanisms: self-questioning (curiosity-driven task generation), self-navigating (experience reuse), self-attributing (differentiated rewards per trajectory state/action).

- Code: [github.com/modelscope/AgentEvolver](https://github.com/modelscope/AgentEvolver)

### A2. Critical Counter-Evidence: "Inefficiencies of Meta Agents for Agent Design" (Oct 2025)

This paper is essential reading for anyone considering meta-agency at small scale:

1. **Context expansion hurts.** Adding all previous agent designs to meta-agent context performs WORSE than ignoring prior designs entirely. Only evolutionary approaches help.
2. **Low behavioral diversity.** Designed agents are too similar, limiting complementary use.
3. **Poor economics at small scale.** Cost of meta-designed agents is lower than human-designed agents only on 2 of tested datasets, and only when deployed on 15,000+ examples. Other datasets don't justify the design cost regardless of scale.

**Implication:** For a solo builder running dozens of contracts (not thousands), meta-agent auto-design is NOT cost-effective vs. well-crafted human-designed templates. The winning strategy at small scale is human templates + automated prompt optimization + experience compounding.

- Paper: [arxiv.org/abs/2510.06711](https://arxiv.org/abs/2510.06711)

### A3. TensorZero Finding: Automated Prompt Engineering Diminishes with Complexity

TensorZero research (April 2025) evaluated MIPRO on tasks of increasing complexity and found that benefits diminish as task complexity grows. MIPRO significantly improves simpler structured tasks but gains flatten for open-ended agent reasoning.

**Implication:** Don't expect automated prompt optimization to solve everything. It works best for structured sub-tasks within agents, not for top-level orchestration prompts.

- Source: [tensorzero.com/blog/from-ner-to-agents](https://www.tensorzero.com/blog/from-ner-to-agents-does-automated-prompt-engineering-scale-to-complex-tasks/)

### A4. Observability as the Self-Improvement Enabler

Arize Phoenix (2025-2026) identifies that the self-improving loop requires agents to consume their own telemetry. Traditional dashboards don't work -- agents need structured data via APIs and CLIs. Phoenix ships a CLI for fetching traces, datasets, and experiments for use with coding agents.

**Key insight:** "Organizations that invest early in giving agents access to telemetry, embedding evaluation into workflows, and exposing programmatic observability interfaces are the ones that will scale agent-driven development effectively."

- Source: [arize.com/blog/closing-the-loop-coding-agents-telemetry](https://arize.com/blog/closing-the-loop-coding-agents-telemetry-and-the-path-to-self-improving-software/)

---

## 6. Feasibility Assessment for Solo Builder (~$500/mo Compute)

### Tier 1: Immediately Feasible (This Week) -- Cost: ~$0

| Technique | How | Expected Impact | Evidence |
|---|---|---|---|
| **Experience Replay** | Log successful agent trajectories as JSON, inject top-3 as few-shot for future tasks | 20-50% improvement | ALFWorld: 73%->93% (Yohei Nakajima) |
| **Post-Task Self-Reflection** | JSONL knowledge base with patterns/gotchas, loaded into agent prompts (Metaswarm pattern) | Eliminates repeated failures | Metaswarm production-tested |
| **Letta-Style Skill Learning** | After complex tasks, extract reusable `.md` skill files, share across agents | 36.8% relative improvement | Letta Terminal Bench 2.0 |
| **LLM-as-Judge Eval** | Cheap model (Haiku) evaluates expensive model (Opus) outputs, logs scores | Enables automated quality tracking | OpenAI Cookbook pattern |

### Tier 2: Feasible in 1-2 Weeks -- Cost: ~$25-45/mo

| Technique | How | Expected Impact | Evidence |
|---|---|---|---|
| **PromptWizard** | Offline prompt optimization on agent system prompts using validation tasks | 8-50% per domain | Microsoft: $0.05/task, 45+ benchmarks |
| **DSPy MIPROv2** | Program structured agent pipelines, run MIPROv2 optimization | 24%->51% on structured tasks | Stanford + production studies |
| **Model Routing** | Classify tasks by complexity, route simple->Haiku/Flash, complex->Opus | 50-85% cost reduction | MasRouter (ACL 2025), UC Berkeley |
| **Dual-Layer Architecture** | Separate Planner from Executor (Composio pattern), add structured state machine | Reduced greedy decisions, better recovery | Composio production results |

### Tier 3: Feasible in 1-2 Months -- Cost: ~$50-150/mo

| Technique | How | Expected Impact | Evidence |
|---|---|---|---|
| **Dynamic Tool Registration** | Combine Pi's `registerTool()` with CREATOR-style generation from task descriptions | Agents create+register tools as needed | CREATOR (EMNLP 2023), Pi API |
| **SICA-Style Self-Editing** | Agent proposes prompt/heuristic modifications, test gate, adopt if improved | 17-53% improvement | SICA (ICLR 2025 Workshop) |
| **EvoAgentX Integration** | Use EvoAgentX to evolve prompts+workflows via TextGrad/AFlow/MIPRO combo | Up to 20% improvement | EvoAgentX benchmarks |

### Tier 4: Research Project (3-6 Months) -- Cost: ~$200/mo

| Technique | How | Expected Impact | Evidence |
|---|---|---|---|
| **Project-Spec-to-Agents** | AOrchestra 4-tuple + AFlow MCTS for generating agents from specs | Unknown (doesn't exist yet) | Theoretical integration |
| **Cross-Project Knowledge Transfer** | Semantic embedding of skill libraries + retrieval for new projects | Compounding returns | No direct benchmark |
| **Full Recursive Loop** | Composio pattern: orchestrator observes+adjusts+improves itself | Theoretical unlimited ceiling | Composio: 40K LOC in 8 days |

### Budget Allocation Recommendation ($500/mo)

```
Experience replay + skill learning:        $0 (free, highest ROI)
LLM-as-judge evaluations:                 $20/mo
PromptWizard/MIPROv2 optimization:         $25/mo
Model routing implementation:             -$150/mo (NET SAVINGS -- this pays for everything else)
Self-editing agent experiments:           $100/mo
Dynamic tool generation experiments:       $50/mo
Reserved for search/eval compute:         $100/mo
                                          --------
Net cost after model routing savings:     ~$145/mo
```

**The critical insight:** Model routing alone saves enough to fund ALL other self-improvement experiments. Implementing MasRouter-style routing is the first move that makes everything else free.

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1-2) -- Gradient-Free Self-Improvement

**1. Experience Replay System**
- Create `_bmad/experience-library/` directory
- After each successful agent task, save full trajectory (prompt + actions + result) as JSON
- Before spawning agents, retrieve top-3 relevant trajectories via keyword/semantic match
- Inject as few-shot examples in agent system prompt
- Expected: 20-50% task success improvement (per ALFWorld benchmarks)

**2. Post-Task Self-Reflection (Metaswarm Pattern)**
- Create `_bmad/knowledge-base.jsonl`
- After each completed task: agent writes entry with pattern, gotcha, or architectural decision
- Load relevant entries into agent system prompts based on task type
- Watch for: repeated instructions (skill candidates), disagreements (preferred approach), manual steps (automation candidates)

**3. LLM-as-Judge Pipeline**
- For each completed output, run cheap model evaluation (pass/fail + reasoning)
- Store scores in `_bmad/eval-scores.jsonl`
- Weekly: review lowest-scoring patterns, update prompts manually
- This builds the training data needed for Phase 2 automation

### Phase 2: Automated Optimization (Week 3-4)

**4. PromptWizard Integration**
- Install PromptWizard, define agent system prompts as optimization targets
- Create validation set from experience library (successful=positive, failed=negative)
- Run monthly optimization: ~$5 cost per run, 8-50% expected improvement
- Apply optimized prompts to orchestrator agent configurations
- Critical: only optimize structured sub-task prompts (per TensorZero finding)

**5. Model Routing Implementation**
- Classify tasks: simple file ops / boilerplate -> Haiku/Flash; complex architecture -> Opus/Sonnet
- Implement at orchestrator level before agent spawning
- Expected: 50-85% cost reduction on simple tasks, NET positive ROI from day 1
- Reference: MasRouter (ACL 2025), NVIDIA Orchestrator-8B patterns

### Phase 3: Tool Evolution (Month 2)

**6. Skill File Generation (Letta Pattern)**
- After complex tasks, prompt agent to extract reusable skill as `.md` file
- Store in `_bmad/skills/` with semantic tags and usage metadata
- Auto-load relevant skills based on task description matching
- Skills compound across projects -- this is the knowledge transfer mechanism

**7. Dynamic Tool Registration (Pi-Specific)**
- Create a "tool factory" agent: given task description, generates tool definition + implementation
- Use Pi's `registerTool()` to make available at runtime
- Validate via unit tests before registration (CREATOR pattern)
- Start with data transformation tools, expand to domain-specific utilities

### Phase 4: Recursive Self-Improvement (Month 3-6)

**8. SICA-Style Self-Editing**
- Allow orchestrator to propose modifications to its own configuration files (prompts, heuristics, decomposition strategies)
- Test gate: run on 10 validation tasks before adopting changes
- Track improvement over time in `_bmad/evolution-log.jsonl`
- Enforce bounded blast radius: only config files, never application source code (Skill Evolver principle)

**9. Observability-Driven Optimization**
- Instrument all agent calls with structured telemetry (Arize Phoenix or custom JSON logs)
- Build agent-readable API for querying own performance data
- Weekly: agent analyzes telemetry, proposes prompt/workflow improvements
- Key: agents consume structured data, not dashboards

**10. The Recursive Loop (Composio Pattern)**
- Orchestrator spawns agents to build features
- Orchestrator observes which strategies succeeded/failed
- Orchestrator adjusts session management and agent configurations for future runs
- Agents can propose improvements to orchestrator's own config
- Loop accelerates with each iteration as knowledge base compounds

---

## 8. Key Takeaways Through IndyDevDan Lens

> "The frontier is not better agents but better orchestration that improves itself."

1. **Context is still highest leverage.** Experience replay and skill learning are context engineering techniques that compound over time. No model changes needed. NVIDIA proved an 8B model with great orchestration beats GPT-5 without it.

2. **Observability before scale.** You cannot improve what you cannot measure. Arize Phoenix's insight: agents need structured API access to their own telemetry. Instrument first, optimize second.

3. **Skills over MCP for context preservation.** Letta's skill learning validates this: skills are `.md` files that capture HOW to do something, not just what tools exist. This is higher-order context engineering.

4. **The 80/20 of self-improvement:** Experience replay (free) gives 80% of the benefit. Automated prompt optimization (PromptWizard at $0.05/task) gives another 15%. Full recursive self-improvement gives the last 5% at 10x complexity.

5. **The "Inefficiencies" paper is the most important finding for solo builders.** Meta-agent auto-design is NOT cost-effective at small scale (requires 15,000+ deployments). The winning strategy: human-designed templates + automated prompt optimization + experience compounding.

6. **Progressive deletability applies to self-improvement too.** Every production system that works (Skill Evolver, SICA, Composio) enforces bounded self-modification with test gates. Unbounded self-modification fails. The meta-system must simplify over time, not complexify.

7. **The integration is the opportunity.** No single system combines all five layers (auto-generation + prompt improvement + tool genesis + architecture search + recursive self-improvement). The pieces exist independently. Whoever integrates them first owns the meta-layer -- and that is precisely what an orchestration-focused builder is positioned to do.

### Additional Sources (Addendum)

- [AOrchestra Paper](https://arxiv.org/abs/2602.03786)
- [AOrchestra GitHub](https://github.com/FoundationAgents/AOrchestra)
- [AOrchestra on HackerNoon](https://hackernoon.com/aorchestra-turns-ai-agents-into-on-demand-specialists-not-static-roles)
- [AFlow Paper](https://arxiv.org/abs/2410.10762)
- [AFlow GitHub](https://github.com/FoundationAgents/AFlow)
- [DyLAN GitHub](https://github.com/SALT-NLP/DyLAN)
- [EvoAgentX Paper](https://arxiv.org/abs/2507.03616)
- [EvoAgentX GitHub](https://github.com/EvoAgentX/EvoAgentX)
- [STELLA Paper](https://arxiv.org/abs/2507.02004)
- [STELLA GitHub](https://github.com/zaixizhang/STELLA)
- [ToolMaker Paper](https://arxiv.org/abs/2502.11705)
- [ToolMaker GitHub](https://github.com/KatherLab/ToolMaker)
- [Tool-R0 Paper](https://arxiv.org/abs/2602.21320)
- [Letta Skill Learning Blog](https://www.letta.com/blog/skill-learning)
- [Letta Code GitHub](https://github.com/letta-ai/letta-code)
- [Letta Learning SDK](https://github.com/letta-ai/learning-sdk)
- [Metaswarm GitHub](https://github.com/dsifry/metaswarm)
- [MasRouter Paper (ACL 2025)](https://aclanthology.org/2025.acl-long.757.pdf)
- [PromptWizard GitHub](https://github.com/microsoft/PromptWizard)
- [PromptWizard Blog](https://www.microsoft.com/en-us/research/blog/promptwizard-the-future-of-prompt-optimization-through-feedback-driven-self-evolving-prompts/)
- [AgentEvolver GitHub](https://github.com/modelscope/AgentEvolver)
- [Inefficiencies of Meta Agents Paper](https://arxiv.org/abs/2510.06711)
- [TensorZero: Automated Prompt Engineering and Complexity](https://www.tensorzero.com/blog/from-ner-to-agents-does-automated-prompt-engineering-scale-to-complex-tasks/)
- [TensorZero GitHub](https://github.com/tensorzero/tensorzero)
- [Arize Phoenix: Closing the Loop](https://arize.com/blog/closing-the-loop-coding-agents-telemetry-and-the-path-to-self-improving-software/)
- [Arize Phoenix GitHub](https://github.com/Arize-ai/phoenix)
- [DSPy MIPROv2 Optimizer](https://dspy.ai/api/optimizers/MIPROv2/)
- [OpenAI Self-Evolving Agents Cookbook](https://cookbook.openai.com/examples/partners/self_evolving_agents/autonomous_agent_retraining)
- [Composio Agent Orchestrator MarkTechPost](https://www.marktechpost.com/2026/02/23/composio-open-sources-agent-orchestrator-to-help-ai-developers-build-scalable-multi-agent-workflows-beyond-the-traditional-react-loops/)
- [Pi Agent Extensions](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/extensions.md)
- [NVIDIA Orchestrator-8B HuggingFace](https://huggingface.co/nvidia/Orchestrator-8B)
- [AgentSquare (ICLR 2025)](https://openreview.net/forum?id=mPdmDYIQ7f)
- [TextGrad Nature Paper](https://arxiv.org/abs/2406.07496)
- [SiriuS Multi-Agent Self-Improvement](https://yoheinakajima.com/better-ways-to-build-self-improving-ai-agents/)
- [Google ADK Multi-Agent Patterns](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
