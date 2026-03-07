# Phase 2 Analysis: Bleeding Edge Frontier

**Date:** 2026-03-05
**Domain:** What truly novel patterns is NOBODY else pursuing? Where is the undiscovered territory that yields 10x advantages?
**Lens:** IndyDevDan's philosophy -- "Knowing is engineering; not knowing is vibe coding"
**Basis:** 73 Phase 1 research documents, 5 synthesis reports, 1 landscape overview

---

## Executive Summary

Phase 1 mapped the known world. Seventy-three documents across 30 research agents cataloged every tool, framework, pattern, and practitioner in the agent orchestration space as of March 2026. The map is complete enough to see clearly what is crowded, what is emerging, and -- most importantly -- what is empty.

The empty spaces are where the 10x advantages live.

This document identifies 22 research questions for Phase 2 agents. Each question targets a genuinely novel frontier -- not an incremental improvement to existing tools, but a qualitative gap where building the right system creates a permanent, compounding advantage. The questions are organized into seven frontier domains, priority-ranked, and annotated with specific search strategies.

The organizing principle is IndyDevDan's three-tier progression applied to the frontier itself: Tier 1 (harness) is solved; Tier 2 (intelligent orchestration) is being built by a few dozen practitioners; Tier 3 (meta-agency, self-improving systems, agent economics) is almost entirely unexplored. The frontier is Tier 3 and the edges of Tier 2 that nobody has formalized.

The single deepest insight from Phase 1: **Moltbook's 93% non-response rate proves that agents without orchestration produce entropy, not value. But nobody has yet asked the inverse question -- what happens when orchestration itself becomes an agent?** That is the true frontier.

---

## Frontier Domain 1: META-AGENCY -- The System That Builds the System

**Why this is the frontier:** IndyDevDan describes Tier 3 (meta-agency) as "the system that builds the system" and lists it as largely unexplored. Phase 1 found no production system that auto-generates agent team compositions, agent definitions, or workflows from a project spec. Everyone builds their orchestrator manually. The meta-level -- agents that design, configure, and improve other agents -- is the highest-leverage gap in the entire landscape.

**IndyDevDan lens:** "Tools shape what you believe is possible." Building a meta-agency system would expand what is conceivable: not just orchestrating agents, but having agents orchestrate orchestrators.

### Question 1: Auto-Generated Agent Teams from Project Specifications
**Research Question:** Has anyone built a system that reads a project specification (PRD, README, issue description) and automatically generates: (a) the optimal number and types of agents, (b) their system prompts and tool permissions, (c) the task decomposition and dependency graph, (d) the model routing per agent role? If so, how does it perform compared to human-designed teams? If not, what are the technical barriers?

**Rationale:** Phase 1 found that agent role definitions (pi-subagents YAML frontmatter, Roo Code Modes, Gas Town's 7 roles) are always hand-crafted. This is the most obvious meta-agency capability and nobody appears to have shipped it. The system that auto-generates agent teams would compound every subsequent project -- the orchestrator gets better at team design with every execution.

**Search Strategy:**
- "auto generate agent team composition from specification"
- "LLM generates agent definitions automatically"
- "meta-agent creates sub-agents" site:arxiv.org OR site:github.com
- "automatic workflow generation multi-agent"
- "agent factory pattern" LLM OR AI
- Check Composio's "self-improving dual-layer planner" for closest existing implementation
- Check NVIDIA Orchestrator-8B training data for task decomposition patterns

**Priority:** P0 -- CRITICAL

---

### Question 2: Self-Improving Prompt Systems via Feedback Loops
**Research Question:** Are there production systems where agent prompts automatically improve over time based on success/failure outcomes? Specifically: (a) systems that log which prompt structures produce passing CI, (b) systems that mutate prompts based on failure analysis, (c) systems that maintain a "prompt evolution history" showing improvement over generations? What is the state of the art in automated prompt optimization (DSPy, TextGrad, OPRO, PromptBreeder)?

**Rationale:** Elvis Sun's Zoe does this manually -- she logs patterns ("This prompt structure works for billing features") and writes better prompts on retries. But this is in-context learning within a single session, not persistent automated prompt evolution. Phase 1 found DSPy (declarative self-improving pipelines) but no evidence of it being applied to coding agent orchestration. The gap between "prompt engineering" and "prompt evolution" is the gap between static and adaptive systems.

**Search Strategy:**
- "self-improving prompts" agent system OR coding agent
- DSPy "agent orchestration" OR "coding agents" 2026
- TextGrad "prompt optimization" production
- "prompt evolution" multi-agent system
- "automatic prompt tuning" feedback loop
- PromptBreeder "automated prompt optimization"
- OPRO "optimization by prompting" practical applications
- Elvis Sun "prompt improvement" OR "learning from failures"
- Check Ruflo's "SONA self-learning" for closest implementation

**Priority:** P0 -- CRITICAL

---

### Question 3: Agents That Design Their Own Tools
**Research Question:** Has anyone built agents that can create, register, and share new tools at runtime -- not just use pre-defined tools, but author tool definitions, test them, and make them available to other agents? What is the state of the art in "tool genesis" or "tool synthesis" by LLMs?

**Rationale:** Phase 1 found extensive tool ecosystems (MCP servers, Pi extensions, Goose extensions) but every tool is human-authored. Pi's `registerTool()` API allows runtime tool registration, but the tool code is still human-written. An agent that can identify a capability gap, write a tool to fill it, test the tool, and register it for other agents would be a qualitative leap -- the system grows its own capabilities.

**Search Strategy:**
- "agent creates its own tools" LLM
- "tool synthesis" artificial intelligence agent
- "dynamic tool creation" multi-agent
- "self-extending agent" tool generation
- "runtime tool registration" LLM agent
- Voyager Minecraft "tool library" LLM -- check if pattern has been applied to coding agents
- Check Letta Code's "skill learning" for closest implementation

**Priority:** P1 -- HIGH

---

## Frontier Domain 2: EMERGENT INTELLIGENCE -- What Multi-Agent Systems Can Do That Single Agents Cannot

**Why this is the frontier:** Phase 1 found that multi-agent systems are justified by context window limits (each agent gets focused context) and parallelism (multiple agents work simultaneously). But nobody has asked: do multi-agent systems exhibit emergent behaviors -- capabilities that no individual agent possesses? If so, this changes the value proposition from "efficiency" to "qualitatively new intelligence."

**IndyDevDan lens:** "Engineering with exponentials" -- emergent intelligence would be the ultimate exponential, where the whole exceeds the sum of parts not linearly but categorically.

### Question 4: Emergent Problem-Solving in Multi-Agent Coding Systems
**Research Question:** Is there academic or practical evidence that groups of coding agents solve problems that individual agents cannot -- not just faster, but qualitatively differently? Specifically: (a) problems solved through agent debate or deliberation that no single agent could solve, (b) architectural insights that emerged from multi-agent collaboration, (c) "collective intelligence" metrics for agent groups? What does the research say about when N agents > N * (1 agent)?

**Rationale:** Phase 1 found the opposite signal -- Moltbook's 93% non-response rate and the "17x error trap" suggest that naive multi-agent setups produce worse outcomes. But these are uncoordinated systems. The question is whether well-orchestrated multi-agent systems exhibit emergent capabilities. If yes, this fundamentally changes what orchestrators should optimize for.

**Search Strategy:**
- "emergent behavior" multi-agent LLM system
- "collective intelligence" artificial agents 2025 OR 2026
- "agent debate" improves reasoning OR problem solving
- "multi-agent deliberation" coding OR software engineering
- "society of mind" LLM implementation
- LLM "mixture of agents" emergent
- "multi-agent collaboration exceeds single agent" benchmark
- Check MIT/Stanford/DeepMind papers on multi-agent LLM collaboration
- Check Society of Mind (Minsky) + modern LLM implementations

**Priority:** P0 -- CRITICAL

---

### Question 5: Agent Specialization Through Repetition
**Research Question:** Do agents that repeatedly perform the same type of task develop measurably better performance over time through accumulated context, even without explicit fine-tuning? Is there evidence that "agent expertise" emerges from task specialization within an orchestrated system? What is the relationship between agent task history and output quality?

**Rationale:** Elvis Sun routes billing bugs to Codex and frontend work to Claude Code -- static specialization based on human judgment. But the question is whether dynamic specialization emerges: does an agent that has handled 100 billing tasks become measurably better at billing tasks than a fresh agent, purely through accumulated in-context or episodic memory? If yes, this argues for persistent agent identities rather than ephemeral spawning.

**Search Strategy:**
- "agent specialization" through experience OR repetition
- "learning from task history" LLM agent
- "expertise development" AI agent over time
- "agent performance improvement" through repeated tasks
- "persistent agent" vs "ephemeral agent" performance
- Letta "skill learning" longitudinal performance
- Check Cognee/Mem0 for evidence of memory improving task performance

**Priority:** P1 -- HIGH

---

### Question 6: Adversarial Agent Architectures for Code Quality
**Research Question:** Are there systems that deliberately set agents against each other -- red team vs. blue team, generator vs. critic, advocate vs. devil's advocate -- to produce higher quality code than any single-direction workflow? What does "Constitutional AI" look like applied to multi-agent coding, where agents enforce principles on each other?

**Rationale:** Phase 1 found reviewer agents (pi-messenger's SHIP/NEEDS_WORK/MAJOR_RETHINK, Elvis's multi-model review) but these are unidirectional: generator produces, reviewer critiques. The frontier is bidirectional adversarial architectures where agents with opposing objectives produce emergent quality. Red-teaming is standard for security but unexplored for general code quality.

**Search Strategy:**
- "adversarial multi-agent" code quality OR software engineering
- "red team blue team" LLM agent coding
- "generator critic" architecture coding agents
- "debate improves code quality" agent
- "constitutional AI" applied to coding OR multi-agent
- "adversarial collaboration" software development AI
- Check Shannon's autonomous pentesting architecture for adversarial patterns

**Priority:** P1 -- HIGH

---

## Frontier Domain 3: AGENT ECONOMICS -- Agents as Economic Actors

**Why this is the frontier:** Phase 1 revealed a rapidly growing agent economy (Moltlaunch, Sponge Wallet, x402, ERC-8004) but the orchestrator-to-marketplace bridge does not exist. Nobody has built an orchestrator that can discover, hire, pay, and evaluate external agents programmatically. This is the gap between "agents as tools" and "agents as economic actors."

**IndyDevDan lens:** "Do not outsource your mastery" -- but the corollary is that you should outsource what is NOT your mastery. An orchestrator that can hire specialists on demand has unbounded capability.

### Question 7: Autonomous Agent Hiring -- Orchestrators That Recruit
**Research Question:** Has anyone built an orchestrator that programmatically discovers agents on marketplaces (Moltlaunch, A2A Agent Cards), evaluates them by reputation and capability, hires them for specific tasks, pays them (via x402/Sponge), monitors their work, and rates them on completion? What are the technical primitives needed? What are the trust/verification challenges?

**Rationale:** Phase 1 identified that all primitives exist (ERC-8004 for identity, A2A for discovery, Sponge for payment, MCP for tools) but the integration layer is missing. The orchestrator that can dynamically expand its workforce by hiring from the open market has a fundamentally different scaling curve than one limited to locally spawned agents.

**Search Strategy:**
- "orchestrator hires agents" marketplace OR programmatic
- "agent-to-agent hiring" OR "agent marketplace integration"
- Moltlaunch API documentation OR integration guide
- "autonomous agent procurement" OR "agent talent marketplace"
- A2A protocol "agent discovery" orchestrator implementation
- x402 "agent payment" integration tutorial
- Sponge wallet API documentation
- "hybrid local remote agent" orchestration

**Priority:** P1 -- HIGH

---

### Question 8: Agent Revenue Generation -- Agents That Earn Money
**Research Question:** Beyond the crypto/token economy (Clawnch, Moltlaunch), are there production systems where software agents independently earn revenue by performing services -- writing code, reviewing PRs, answering support tickets, generating content -- and routing payments back to their operator? What is the longest-running autonomous revenue-generating agent system documented?

**Rationale:** Elvis Sun's system generates revenue indirectly (agents build the product, Elvis sells it). The frontier is agents that earn directly -- an orchestrator that deploys agents as services on marketplaces, collects revenue, and reinvests in compute. This is the "self-funding orchestrator" vision where the system pays for its own API costs.

**Search Strategy:**
- "agent earns money" OR "agent generates revenue" autonomously
- "self-funding AI agent" OR "autonomous revenue generation"
- "agent as a service" marketplace earning
- "AI agent freelancer" OR "agent gig economy"
- Moltlaunch "agent earnings" OR "top earning agents"
- "autonomous business" run by AI agents 2025 OR 2026
- Check Elvis Sun's X payout model ($1,505 for 9.3M impressions)

**Priority:** P2 -- MEDIUM

---

### Question 9: Agent Reputation Systems -- Trust at Scale
**Research Question:** Beyond ERC-8004's on-chain reputation, what are the most sophisticated agent reputation and trust scoring systems? Specifically: (a) multi-dimensional trust (code quality, speed, reliability, security), (b) reputation decay over time, (c) task-type-specific reputation (an agent trusted for frontend but not for database work), (d) adversarial robustness (resistance to wash trading, Sybil attacks)? What can we learn from human reputation systems (StackOverflow, Upwork, eBay)?

**Rationale:** Phase 1 found Yegge's "multi-dimensional trust stamps" vision and ERC-8004's basic reputation registry, but nothing that implements nuanced, task-specific, adversarial-robust reputation for agents. This is critical for any system that hires external agents -- without trustworthy reputation, marketplace agents are unverifiable.

**Search Strategy:**
- "agent reputation system" multi-dimensional OR task-specific
- "trust scoring" AI agent 2025 OR 2026
- ERC-8004 "reputation registry" implementation details
- "adversarial robust reputation" AI agent
- "Sybil resistance" agent marketplace
- Yegge "trust stamps" wasteland reputation
- "agent trust framework" computational
- Apply human reputation system research (eBay, Uber, StackOverflow) to agents

**Priority:** P2 -- MEDIUM

---

## Frontier Domain 4: PERSISTENT AGENT IDENTITY -- Agents as Individuals, Not Instances

**Why this is the frontier:** Phase 1 found that every production system treats agents as ephemeral -- spawn, execute, dispose. No system gives agents persistent identity, accumulated expertise, or consistent behavior across sessions. This is a fundamental design choice that may be wrong.

**IndyDevDan lens:** "Do you trust your agents?" Trust requires identity. You cannot trust what you cannot identify across time.

### Question 10: Long-Term Agent Memory and Identity Continuity
**Research Question:** Has anyone built agents that maintain consistent identity, preferences, and accumulated knowledge across hundreds or thousands of sessions? What are the architectural patterns for "agent autobiography" -- a persistent record of what an agent has done, learned, and become? How does Letta/MemGPT's self-editing memory perform over months of continuous operation?

**Rationale:** Letta (MemGPT) is the closest existing system -- agents with database-backed memory that persists across sessions. But Phase 1 found no evidence of agents maintaining coherent identity over long time horizons (months). The question is whether persistent identity produces measurably better outcomes than ephemeral agents, and if so, what the minimum viable architecture for persistent identity looks like.

**Search Strategy:**
- "persistent agent identity" across sessions
- "long-term agent memory" months OR longitudinal
- Letta OR MemGPT "long-running" agent performance
- "agent autobiography" OR "agent life story"
- "agent personality development" over time
- "identity continuity" artificial agent
- "digital identity" AI agent persistent
- Check Letta blog for longitudinal performance data

**Priority:** P1 -- HIGH

---

### Question 11: Agent Confidence Scoring with Incremental Delegation
**Research Question:** Are there production systems that track per-agent confidence scores -- measuring how much the orchestrator trusts each agent for each task type -- and use those scores to automatically expand or restrict delegation? Specifically: (a) agents that earn autonomy by demonstrating competence, (b) automatic model escalation when confidence is low, (c) confidence-weighted task routing?

**Rationale:** IndyDevDan's trust framework describes this conceptually ("build justified trust through observability, measurement, and incremental delegation") but Phase 1 found no production implementation. The closest is Elvis's manual pattern logging. A formal confidence scoring system would make the orchestrator's delegation decisions data-driven rather than heuristic.

**Search Strategy:**
- "agent confidence scoring" delegation OR trust
- "incremental delegation" AI agent autonomy
- "trust score" agent performance routing
- "confidence-based routing" multi-agent
- "earned autonomy" AI agent system
- "agent performance scoring" feedback loop
- IndyDevDan "confidence" OR "trust measurement"
- Check NVIDIA Orchestrator-8B for learned routing confidence

**Priority:** P0 -- CRITICAL

---

## Frontier Domain 5: ZERO-HUMAN LOOPS -- Maximum Autonomy

**Why this is the frontier:** Phase 1 documented systems at various autonomy levels: Stripe's human-review-final-gate, Elvis's near-autonomous Zoe, Gas Town's hierarchical delegation. But nobody has systematically studied the limits of fully autonomous operation. What is the longest an agent system has operated without human intervention? What breaks first?

**IndyDevDan lens:** "Year of Trust" -- the trust question becomes most acute when the human is fully absent. What are the failure modes that only emerge after hours or days of unsupervised operation?

### Question 12: Maximum Autonomous Runtime Duration
**Research Question:** What is the longest documented period that a coding agent system has operated without any human intervention while producing correct, deployable output? What are the failure modes that emerge only after extended autonomous operation (context degradation, strategic drift, compounding errors, resource exhaustion)? Is there a theoretical or empirical "autonomy horizon" beyond which agent quality degrades?

**Rationale:** Elvis's system runs 24/7 on a Mac Studio with cron-based health monitoring, but he still reviews PRs daily. Gas Town operates with human review as the final gate. The question is: what happens if you remove the human entirely for 48 hours? A week? A month? Understanding the autonomy horizon is essential for designing systems that can operate while the human sleeps, travels, or focuses on strategy.

**Search Strategy:**
- "autonomous agent" longest runtime OR duration without human
- "unattended agent" operation hours OR days
- "agent degradation" over time without supervision
- "autonomy horizon" AI agent OR multi-agent
- "fully autonomous" software development agent results
- "agent drift" without human correction
- "unsupervised agent operation" failure modes
- Check SWE-bench or similar for longest autonomous runs

**Priority:** P1 -- HIGH

---

### Question 13: Self-Healing Orchestrators -- Recovery Without Human Input
**Research Question:** Are there orchestrator systems that can diagnose and recover from their own failures -- not just individual agent crashes (which Phase 1 covers well) but orchestrator-level failures: corrupted state, strategy errors, cascading failures across the fleet? What does "self-healing" look like at the orchestration layer?

**Rationale:** Phase 1 documented agent-level crash recovery extensively (Beads, tmux recovery, checkpoint-resume). But orchestrator-level self-healing -- the orchestrator diagnosing that its own strategy is wrong and correcting course -- is unexplored. This is the recursive trust problem: who watches the watchman?

**Search Strategy:**
- "self-healing orchestrator" AI agent
- "orchestrator failure recovery" autonomous
- "meta-orchestrator" monitors orchestrator
- "watchdog for agent orchestrator"
- "self-correcting" multi-agent system
- "recursive supervision" AI agent hierarchy
- "who watches the watchman" agent OR orchestrator
- Temporal "self-healing workflow" patterns

**Priority:** P1 -- HIGH

---

## Frontier Domain 6: NOVEL TOPOLOGIES -- Beyond Hub-and-Spoke

**Why this is the frontier:** Phase 1's architecture patterns research cataloged six topologies (hub-and-spoke, hierarchical, pipeline, DAG, swarm, mesh) and concluded that hub-and-spoke with hierarchical escape is the 2026 consensus. But evolutionary and biological systems achieve coordination through radically different patterns. The question is whether there are topologies that produce qualitatively different outcomes.

**IndyDevDan lens:** "Progressive deletability" -- the truly novel topology should be simpler than what it replaces, not more complex.

### Question 14: Evolutionary Agent Architectures -- Survival of the Fittest
**Research Question:** Has anyone applied evolutionary algorithms to agent team composition -- spawning multiple agent teams with different configurations, evaluating their outputs, breeding the best configurations, and iterating? Is there evidence that evolved agent teams outperform hand-designed teams? What is the state of the art in "neuroevolution" applied to multi-agent coordination?

**Rationale:** Phase 1 found that all agent team compositions are hand-designed (Elvis picks models manually, Stripe's blueprint patterns are static, Gas Town's 7 roles are fixed). Evolution is the only known process that produces complex, optimized designs without a designer. Applying evolutionary pressure to agent team configurations could discover team structures that no human would design.

**Search Strategy:**
- "evolutionary" multi-agent team composition OR configuration
- "genetic algorithm" agent team optimization
- "neuroevolution" multi-agent coordination
- "evolved agent teams" vs "designed agent teams"
- "automated machine learning" applied to agent orchestration
- "neural architecture search" multi-agent
- "survival of the fittest" AI agent system
- Check OpenAI's "population-based training" for agent applications

**Priority:** P2 -- MEDIUM

---

### Question 15: Stigmergic Coordination -- Communication Through the Environment
**Research Question:** Has anyone implemented stigmergy (indirect coordination through environmental modifications -- how ant colonies coordinate without central control) in multi-agent coding systems? Specifically: agents that coordinate by modifying shared artifacts (code, documents, state files) rather than through explicit messages? Is there evidence that stigmergic coordination scales better than message-based coordination for coding tasks?

**Rationale:** Phase 1 found two coordination paradigms: explicit messaging (pi-messenger, Relay, A2A) and centralized orchestration (hub-and-spoke). But biological systems achieve massive-scale coordination through stigmergy -- ants leave pheromone trails, termites build without blueprints. Git itself is a stigmergic system (developers coordinate through code changes, not meetings). Applying stigmergic patterns to agent coordination might unlock a coordination mechanism that scales without increasing message complexity.

**Search Strategy:**
- "stigmergy" multi-agent AI OR software agent
- "indirect coordination" through environment modification agent
- "ant colony optimization" applied to software development
- "swarm intelligence" coding OR programming agents
- "coordination through artifacts" multi-agent
- "blackboard architecture" modern AI agent
- "emergent coordination" without explicit messaging
- Check Confluent's "blackboard" event-driven pattern

**Priority:** P2 -- MEDIUM

---

### Question 16: Attention-Based Agent Routing -- The Transformer Applied to Orchestration
**Research Question:** Has anyone applied the transformer attention mechanism to agent routing -- treating the orchestrator as a transformer where each agent is a "token" and the routing decision is an attention computation over agent capabilities, task requirements, and historical performance? Could the orchestrator itself be a specialized small model trained on routing decisions?

**Rationale:** NVIDIA's Orchestrator-8B proves that a small trained model outperforms large general-purpose models at orchestration. Phase 1 found this but did not explore the full implications. If orchestration is a learnable skill, the frontier is training custom routing models on your own orchestration data -- a model that learns from every task assignment whether the routing was optimal.

**Search Strategy:**
- NVIDIA "Orchestrator-8B" training methodology OR dataset
- "trained orchestrator model" multi-agent routing
- "learned routing" multi-agent system
- "attention mechanism" agent selection OR routing
- "transformer architecture" for orchestration
- xRouter "reinforcement learning" agent routing
- "custom trained" agent router OR dispatcher
- BudgetMLAgent cost-aware routing trained model

**Priority:** P1 -- HIGH

---

## Frontier Domain 7: CROSS-DOMAIN AND CROSS-RUNTIME ORCHESTRATION

**Why this is the frontier:** Phase 1 found that all production orchestrators operate within a single domain (coding) and most operate within a single runtime (Claude Code OR Pi OR Goose). The frontier is orchestrators that manage agents across completely different domains and runtimes simultaneously.

**IndyDevDan lens:** "Think in ANDs not ORs" -- the frontier is AND, not OR. Code AND design AND marketing AND sales under one orchestrator.

### Question 17: Cross-Domain Orchestration -- One Orchestrator, Many Domains
**Research Question:** Has anyone built an orchestrator that manages agents across completely different domains -- coding agents, design agents, marketing agents, customer support agents, sales agents -- under a single coordination layer? What are the unique challenges of cross-domain orchestration (different success metrics, different tool requirements, different time horizons)?

**Rationale:** Elvis Sun's Zoe is the closest -- she manages coding agents AND social media AND customer support AND email. But this is one orchestrator making decisions across domains, not a formal cross-domain architecture. The question is whether cross-domain orchestration requires fundamentally different patterns or whether the same hub-and-spoke + domain supervisors pattern works when the domains are "coding" and "marketing."

**Search Strategy:**
- "cross-domain agent orchestration" OR "multi-domain AI agent"
- "full business automation" AI agent system
- Elvis Sun "Zoe" cross-domain OR multiple domains
- "AI agent" manages coding AND marketing AND sales
- "enterprise agent orchestration" multiple departments
- "unified agent platform" different domains
- Deloitte "agent orchestration" cross-functional
- "business process automation" multi-agent 2026

**Priority:** P1 -- HIGH

---

### Question 18: Cross-Runtime Agent Orchestration -- Claude + Pi + Gemini Under One Roof
**Research Question:** Beyond Overstory's pluggable AgentRuntime interface and IndyDevDan's big-3-super-agent experiment, has anyone built a production system that simultaneously orchestrates agents running on different runtimes (Claude Code, Pi Agent, Codex CLI, Gemini CLI) with unified state management, observability, and task routing? What are the practical challenges of cross-runtime orchestration?

**Rationale:** Phase 1 found Overstory (3 runtime adapters) and agtx (per-phase agent mixing) but both are early-stage. The question is whether cross-runtime orchestration delivers measurable advantages over single-runtime systems -- does routing different task types to their optimal runtime produce better outcomes than using one runtime for everything?

**Search Strategy:**
- "cross-runtime" agent orchestration OR multi-runtime
- Overstory "agent runtime" adapter pattern results
- agtx "multi-agent mixing" performance OR results
- "model-agnostic orchestration" production deployment
- "different AI runtimes" single orchestrator
- Bridle "configuration normalization" cross-harness
- CodeMachine-CLI "engine abstraction" usage
- IndyDevDan "big-3-super-agent" results OR learnings

**Priority:** P2 -- MEDIUM

---

## Frontier Domain 8: KNOWLEDGE COMPOUNDING -- The Agent That Gets Smarter Over Time

**Why this is the frontier:** Phase 1 identified "no persistent shared memory" as a critical gap. Agents cannot query "what did we learn about the auth module yesterday?" But the deeper question is not just memory -- it is knowledge compounding. Can an orchestrator accumulate knowledge that makes every subsequent project easier, faster, and higher quality?

**IndyDevDan lens:** "Context is the highest leverage" -- but context that compounds across projects is exponentially higher leverage than context within a single project.

### Question 19: Cross-Project Knowledge Transfer
**Research Question:** Has anyone built a system where knowledge gained by agents on Project A automatically improves agent performance on Project B? Specifically: (a) architectural patterns learned in one codebase applied to another, (b) failure modes discovered in one project prevented in the next, (c) tool usage patterns optimized across projects? What is the state of "transfer learning" for agent orchestration?

**Rationale:** Every orchestrator in Phase 1 starts from scratch on each project. Elvis's Zoe accumulates knowledge within a single monorepo, but there is no evidence of cross-project transfer. An orchestrator that gets measurably better with each project it completes has a compounding advantage that grows over time -- the opposite of "starting from scratch."

**Search Strategy:**
- "cross-project knowledge transfer" AI agent OR coding agent
- "transfer learning" agent orchestration
- "accumulated expertise" agent across projects
- "knowledge graph" coding agent cross-repository
- "project-independent" agent learning
- Cognee "cross-project" OR "multi-repository" knowledge
- "organizational memory" AI agent system
- "institutional knowledge" captured by AI agents

**Priority:** P0 -- CRITICAL

---

### Question 20: Post-Mortem Replay Systems -- Learning from Every Failure
**Research Question:** Has anyone built a system that automatically records every agent decision, every tool call, and every outcome in a replayable format -- and then uses replay analysis to identify systematic failure patterns, optimize workflows, and prevent recurrence? What does "agent post-mortem" look like at scale?

**Rationale:** Phase 1 identified "no post-mortem replay system" as a gap. Pi-subagents' observability triplet (status.json, events.jsonl, log.md) provides raw data, but no system analyzes this data to extract lessons. The frontier is closing the loop: record everything, analyze failures, update the orchestrator's strategy, and verify that the failure cannot recur.

**Search Strategy:**
- "agent post-mortem" replay OR analysis
- "agent failure analysis" automated learning
- "trace replay" multi-agent debugging OR optimization
- "systematic failure detection" agent system
- "decision audit trail" agent learning from mistakes
- Langfuse "trace analysis" automated insights
- "retrospective" AI agent multi-agent
- "root cause analysis" automated agent system

**Priority:** P1 -- HIGH

---

### Question 21: Semantic Codebase Models -- Agents That Understand Architecture
**Research Question:** Beyond tree-sitter repo maps (Aider) and directory-scoped rules (Stripe), has anyone built agents that maintain a semantic model of the codebase -- understanding not just what files exist but the architectural intent, design patterns, module boundaries, data flow, and invariants? Can an agent that "understands" the architecture make qualitatively better decisions than one that only sees files?

**Rationale:** Phase 1 found that context engineering (what agents see) is the #1 bottleneck. But current context engineering is syntactic -- file contents, symbol maps, directory rules. Semantic understanding (this module is the payment gateway, it must never call the user service directly) would enable agents to make architecturally sound decisions without being told every constraint explicitly.

**Search Strategy:**
- "semantic codebase model" OR "architectural understanding" AI agent
- "code knowledge graph" agent reasoning
- "codebase comprehension" beyond syntax tree-sitter
- "architectural intent" AI agent understanding
- "design pattern recognition" automated agent
- "invariant detection" codebase AI
- Cognee "code knowledge graph" architecture
- "program comprehension" LLM 2025 OR 2026

**Priority:** P1 -- HIGH

---

### Question 22: The Orchestrator's Own Context Engineering -- Meta-Context
**Research Question:** How should an orchestrator manage its own context window? As the orchestrator tracks more agents, more tasks, more history, and more cross-project knowledge, its own context becomes the bottleneck. What are the patterns for "meta-context engineering" -- context engineering applied to the orchestrator itself, not just its workers? Is there research on hierarchical context compression where supervisors maintain compressed summaries of their workers' contexts?

**Rationale:** Phase 1's context engineering research (Koylan, Horthy, Stripe) focuses on worker agent context. But the orchestrator has the hardest context problem: it must hold enough state to make intelligent routing decisions without being overwhelmed by detail. Context-Gateway solves worker compaction, but orchestrator compaction -- maintaining strategic awareness while shedding tactical detail -- is unsolved.

**Search Strategy:**
- "orchestrator context management" OR "meta-context engineering"
- "hierarchical context compression" multi-agent
- "supervisor context" vs "worker context" management
- "context summarization" between agent tiers
- "orchestrator context window" optimization
- "strategic context" vs "tactical context" agent
- Context-Gateway "orchestrator" OR "coordinator" application
- "attention management" orchestrator AI agent

**Priority:** P0 -- CRITICAL

---

## Priority Ranking Summary

### P0 -- CRITICAL (Must research -- these are the highest-leverage gaps)

| # | Question | Domain | Rationale |
|---|----------|--------|-----------|
| 1 | Auto-Generated Agent Teams from Specs | Meta-Agency | The meta-capability that multiplies all others |
| 2 | Self-Improving Prompt Systems | Meta-Agency | Closes the loop from execution to improvement |
| 4 | Emergent Problem-Solving in Multi-Agent Systems | Emergent Intelligence | Determines whether multi-agent is worth the complexity |
| 11 | Agent Confidence Scoring with Incremental Delegation | Persistent Identity | Makes delegation data-driven, not heuristic |
| 19 | Cross-Project Knowledge Transfer | Knowledge Compounding | The compounding advantage that grows with every project |
| 22 | Orchestrator's Own Context Engineering | Knowledge Compounding | The meta-problem that limits everything else |

### P1 -- HIGH (Should research -- these are differentiated advantages)

| # | Question | Domain | Rationale |
|---|----------|--------|-----------|
| 3 | Agents That Design Their Own Tools | Meta-Agency | Self-extending capability |
| 5 | Agent Specialization Through Repetition | Emergent Intelligence | Persistent vs. ephemeral design decision |
| 6 | Adversarial Agent Architectures | Emergent Intelligence | Quality through opposition |
| 10 | Long-Term Agent Memory and Identity | Persistent Identity | Foundation for trust over time |
| 12 | Maximum Autonomous Runtime Duration | Zero-Human Loops | Empirical autonomy horizon |
| 13 | Self-Healing Orchestrators | Zero-Human Loops | Recursive supervision |
| 16 | Attention-Based Agent Routing | Novel Topologies | Learned routing beats heuristic routing |
| 17 | Cross-Domain Orchestration | Cross-Domain | Business-wide agent management |
| 20 | Post-Mortem Replay Systems | Knowledge Compounding | Learning from every failure |
| 21 | Semantic Codebase Models | Knowledge Compounding | Architectural understanding, not just syntax |

### P2 -- MEDIUM (Could research -- these are forward-looking explorations)

| # | Question | Domain | Rationale |
|---|----------|--------|-----------|
| 7 | Autonomous Agent Hiring | Agent Economics | Marketplace integration |
| 8 | Agent Revenue Generation | Agent Economics | Self-funding systems |
| 9 | Agent Reputation Systems | Agent Economics | Trust at marketplace scale |
| 14 | Evolutionary Agent Architectures | Novel Topologies | Evolved vs. designed teams |
| 15 | Stigmergic Coordination | Novel Topologies | Coordination through artifacts |
| 18 | Cross-Runtime Orchestration | Cross-Domain | Multi-harness production |

---

## Research Agent Deployment Strategy

### Wave 1 (6 agents -- P0 questions)
Deploy one agent per P0 question. These are the highest-leverage gaps. Each agent should:
1. Search broadly for academic papers, GitHub repositories, blog posts, and production case studies
2. Identify the closest existing implementations
3. Assess technical feasibility for a solo builder with ~$500/month compute budget
4. Estimate implementation complexity in lines of TypeScript

### Wave 2 (5-8 agents -- P1 questions, grouped by domain)
Group related P1 questions for agents that can cover multiple questions:
- Agent A: Questions 3 + 6 (tool genesis + adversarial architectures)
- Agent B: Questions 5 + 10 (specialization + persistent identity)
- Agent C: Questions 12 + 13 (autonomy limits + self-healing)
- Agent D: Questions 16 + 21 (learned routing + semantic models)
- Agent E: Questions 17 + 20 (cross-domain + post-mortem)

### Wave 3 (3-4 agents -- P2 questions)
P2 questions can be batched more aggressively:
- Agent F: Questions 7 + 8 + 9 (all agent economics)
- Agent G: Questions 14 + 15 (evolutionary + stigmergic)
- Agent H: Question 18 (cross-runtime)

### Total: 14-18 research agents across 3 waves

---

## The Frontier Thesis

The bleeding edge is not a place -- it is a mode of operation. Phase 1 mapped the tools, patterns, and practitioners. Phase 2 must map the unknown.

The single most important insight from this analysis: **the frontier is not about better agents. It is about better orchestration of agents. And the deepest frontier is orchestration that improves itself.**

Every crowded space in Phase 1 (basic multi-agent, MCP integration, code review automation) optimizes the agent. The uncrowded spaces (meta-agency, self-improving prompts, cross-project knowledge compounding, orchestrator self-healing) optimize the orchestrator. Optimizing the agent gives a linear advantage. Optimizing the orchestrator gives an exponential one, because every improvement compounds across every agent, every project, and every future decision.

IndyDevDan's three-tier progression provides the map:
- **Tier 1 (Harness):** Solved. Many good options exist.
- **Tier 2 (Intelligent Orchestration):** Being built by ~50 practitioners worldwide. The L-Thread Orchestrator is here.
- **Tier 3 (Meta-Agency):** Almost entirely unexplored. This is where the permanent edge lives.

The 22 questions in this document target the boundary between Tier 2 and Tier 3. Answering them will not just inform what to build -- it will expand what is believed possible. And as IndyDevDan teaches, expanding belief is the highest-leverage investment of all.

---

*Analysis based on 73 Phase 1 documents totaling approximately 200,000 words. March 5, 2026.*
