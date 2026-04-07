# Phase 2 Analysis: Harness Mastery Path

**Date:** 2026-03-05
**Domain:** What does "being the edge" of harness engineering require?
**Analyst Lens:** IndyDevDan's philosophical framework (Context/Prompt/Model triad, trust thesis, observability before scale, knowing is engineering)
**Basis:** 73 Phase 1 research documents, 5 synthesis reports, 1 landscape overview, 28 practitioner profiles

---

## Executive Summary

Phase 1 revealed a clear stratification in the agentic engineering space: the top practitioners (IndyDevDan, Elvis Sun, steipete, Mario Zechner, Steve Yegge, Geoffrey Huntley, Boris Cherny) share a set of characteristics that separate them from the 98% who merely use AI coding tools. They build their own tools. They understand agent internals at the protocol level. They measure everything before scaling anything. They have philosophical frameworks that guide technical decisions. And they share in public, creating compounding network effects.

But Phase 1 left critical questions unanswered. We know WHO the top practitioners are and WHAT they build. We do not yet understand the precise learning sequences, the non-obvious meta-skills, the knowledge frontiers that nobody has mastered, or the measurable indicators that separate mastery from competence. Phase 2 must answer these questions with the specificity needed to construct a learning-while-building roadmap for someone already generating $50K/week and aiming to become one of the best harness engineers in the world.

Through IndyDevDan's lens: "Knowing is engineering; not knowing is vibe coding." The goal of these research questions is to convert Phase 2 from vibe-researching into engineered knowledge -- specific, falsifiable, actionable findings that compound.

---

## Research Questions

### TIER 1: THE ANATOMY OF THE TOP 0.1% (Highest Priority)

#### Q1: What is the daily workflow of the top 5 harness engineers, hour by hour?

**Rationale:** Phase 1 gave us surface-level descriptions ("94 commits/day," "3x3 terminal grid," "20+ repos") but never broke down how these practitioners actually spend their time. The difference between a 50-commit day and a 5-commit day is not talent -- it is workflow design. IndyDevDan teaches that "tools shape what you believe is possible," but the tools are only half the story. The other half is how you sequence your attention across orchestration, review, debugging, and learning within a single working session.

**Search Strategy:**
- Search for IndyDevDan's "day in the life" or workflow videos on YouTube (he publishes weekly)
- Search for Elvis Sun's daily routine descriptions on X/Twitter and his blog (elvis.so)
- Search for steipete's "My Current AI Dev Workflow" blog posts (he's published at least two)
- Search for any podcast interviews where practitioners describe their actual daily routines
- Search for Geoffrey Huntley's "overnight autonomous loops" setup descriptions
- Look for time-tracking or productivity data shared by any of these practitioners

**What to capture:** Hour-by-hour or phase-by-phase breakdown of a typical working day. How much time is spent writing prompts vs. reviewing output vs. debugging vs. building tools vs. learning. What triggers context switches. When they let agents run unattended vs. when they actively supervise.

---

#### Q2: What specific technical knowledge separates the top harness engineers from competent AI-assisted developers?

**Rationale:** Phase 1 identified skill domains (context engineering, prompt architecture, multi-model routing, state management, observability, security, cost optimization) but did not drill into the specific knowledge within each domain that creates disproportionate advantage. IndyDevDan's "knowing is engineering" principle demands we identify exactly WHAT must be known. For example: does context engineering mastery require understanding transformer attention mechanics at the math level? Or is it sufficient to understand the practical implications (U-shaped attention, lost-in-the-middle)?

**Search Strategy:**
- Search for IndyDevDan's "Principled AI Coding" course syllabus and "Tactical Agentic Coding" course curriculum in detail
- Search for Dexter Horthy's "Advanced Context Engineering for Coding Agents" guide/course content
- Search for Muratcan Koylan's publications on context engineering (his arxiv paper on ACE)
- Search for Anthropic's published guidance on harness engineering and agent design
- Search for any "skills assessment" or "competency matrix" for agentic engineering
- Search for technical interview questions or assessments used by companies hiring agent engineers (Terminal Use, Anthropic, OpenAI)
- Search for Mario Zechner's blog posts about what Pi extension developers need to know

**What to capture:** A hierarchical knowledge map: foundational knowledge (must know), intermediate knowledge (creates leverage), and frontier knowledge (separates the top 0.1%). Specific technical concepts, not just category labels.

---

#### Q3: How do the top practitioners handle failure, debugging, and "the agent did something unexpected" scenarios?

**Rationale:** Phase 1 documented success patterns extensively but barely touched failure handling. The Stripe Minions analysis mentions "max 2 CI rounds" and Elvis Sun's Zoe "examines the failure with full business context," but the actual debugging methodology -- how do you diagnose why an agent produced bad output? How do you trace a failure back to a context engineering problem vs. a prompt problem vs. a model limitation? -- is undocumented. IndyDevDan's trust framework says trust is built through observability, but what does the debugging workflow look like in practice?

**Search Strategy:**
- Search for blog posts or threads about "debugging AI agents" or "agent failure analysis"
- Search for steipete's descriptions of reverting agent work ("if they made shit, I just revert it" -- but what happens before the revert?)
- Search for Geoffrey Huntley's "autoregressive queens of failure" blog post content
- Search for any postmortems of multi-agent system failures
- Search for IndyDevDan's observability system (claude-code-hooks-multi-agent-observability) usage patterns and what failures it catches
- Search for Elvis Sun's Zoe failure recovery descriptions beyond what Phase 1 captured
- Search for academic or industry literature on "agent debugging" or "LLM output debugging"

**What to capture:** A taxonomy of agent failure modes and the diagnostic methodology for each. How long does debugging take relative to the original task? What tools are used? What patterns indicate "kill and respawn" vs. "fix the prompt" vs. "fix the context" vs. "switch models"?

---

#### Q4: What is the role of "taste" and "judgment" in harness engineering, and can it be systematized?

**Rationale:** Multiple Phase 1 sources hint at an ineffable quality that separates the best. Elvis Sun's Zoe "writes a better prompt for the retry" based on accumulated pattern knowledge. IndyDevDan says "knowing is engineering" but also that "tools shape beliefs" -- implying that good judgment comes from building. steipete talks about "blast radius" as an intuitive concept. The question is whether this judgment is purely experiential (you develop it by doing) or whether there are systematic frameworks that can accelerate its development. This directly connects to IndyDevDan's question: can you engineer trust, or must you earn it the hard way?

**Search Strategy:**
- Search for "engineering judgment" or "technical taste" in software engineering literature
- Search for IndyDevDan's discussions of how he decides which tasks to delegate vs. which to do manually
- Search for any decision frameworks practitioners use for agent delegation (when to spawn an agent vs. do it yourself, when to use Opus vs. Sonnet vs. Haiku)
- Search for Elvis Sun's prompt improvement patterns -- how Zoe's prompts get better over time
- Search for literature on expertise development in complex systems (Dreyfus model, Klein's naturalistic decision making)
- Search for any "agent delegation rubric" or "task suitability assessment" frameworks

**What to capture:** Explicit decision frameworks or heuristics that practitioners use, consciously or unconsciously, when making judgment calls about agent orchestration. Can these be encoded into the orchestrator itself?

---

### TIER 2: THE LEARNING ROADMAP (High Priority)

#### Q5: What is the optimal learning sequence for someone who already ships with AI agents but wants to reach the frontier?

**Rationale:** Burak is NOT a beginner. He already has a working orchestrator generating $50K/week. The question is not "how to get started" but "what to learn next." IndyDevDan's three-tier progression (harness basics -> agent orchestration -> meta-agency) provides a framework, but the specific learning sequence within each tier is undefined. Phase 1 identified ~8 skill domains; the question is which to deepen first for maximum compounding.

**Search Strategy:**
- Search for IndyDevDan's "Top 2% Agentic Engineering Roadmap for 2026" detailed content
- Search for any published "mastery paths" or "learning roadmaps" for agentic engineering
- Search for Dan Disler's course progression recommendations (PAIC -> TAC -> what's next?)
- Search for Mario Zechner's recommendations for Pi extension developers (any onboarding guides?)
- Search for skill trees or progression models in adjacent fields (DevOps, SRE, platform engineering) that might map to agentic engineering
- Search for any "from 10x to 100x" or "from good to great" frameworks in engineering productivity literature

**What to capture:** A sequenced learning path with specific milestones and validation criteria. Not "learn context engineering" but "build a context injection extension that reduces token usage by 50%, then measure the impact on agent success rate."

---

#### Q6: What are the highest-ROI investments in knowledge for a harness engineer in 2026?

**Rationale:** IndyDevDan's "engineering with exponentials" essay argues that leverage scales with the compute you can harness. Some knowledge investments yield exponential returns (understanding the `context` event in Pi gives you power over every LLM call). Others are linear (learning a specific MCP server's API). The question is: which knowledge compounds, and which is consumed?

**Search Strategy:**
- Search for practitioners' retrospective accounts of "the single thing that changed everything" in their agentic engineering journey
- Search for IndyDevDan's "beyond-mcp" analysis for lessons on what tools/knowledge are high-leverage vs. low-leverage
- Search for any "Pareto analysis" of agentic engineering skills (which 20% of skills deliver 80% of results?)
- Search for steipete's evolution from single-agent to polyagentmorous -- what knowledge unlocked each level?
- Search for Geoffrey Huntley's "level 9" maturity model -- what knowledge is required at each level?
- Search for any analysis of what knowledge becomes obsolete quickly vs. what endures (progressive deletability applied to learning)

**What to capture:** A ranked list of knowledge investments with estimated ROI and decay rate. Which knowledge has the longest half-life? Which becomes obsolete with the next model release?

---

#### Q7: How should a practitioner balance building vs. learning vs. shipping?

**Rationale:** IndyDevDan balances building open-source tools (20+ repos), creating educational content (courses, YouTube), AND shipping production work. Elvis Sun balances agent orchestration with raising two children. steipete built OpenClaw while transitioning to OpenAI. The tension between learning deeply (reading Pi's source code, understanding transformer attention) and shipping fast (using what works today, not optimizing) is real. IndyDevDan's "do not outsource your mastery" principle suggests deep learning is essential, but "engineering with exponentials" suggests speed matters too.

**Search Strategy:**
- Search for IndyDevDan's blog posts or videos on time allocation and prioritization
- Search for any practitioner discussions about the "learning vs. shipping" trade-off in agentic engineering
- Search for Elvis Sun's descriptions of how he allocates time between building Zoe, building the product, and family
- Search for steipete's transition from PSPDFKit founder to agentic engineering -- how did he upskill?
- Search for any research on "learning by building" or "constructionist learning" in engineering contexts
- Search for the concept of "t-shaped" or "pi-shaped" skills applied to agentic engineering

**What to capture:** Concrete time-allocation frameworks. What percentage of time should go to building tools, learning internals, shipping product, and building in public? How does this ratio change as you progress from competent to expert to frontier?

---

### TIER 3: NON-OBVIOUS META-SKILLS (Medium-High Priority)

#### Q8: What systems thinking and mental models separate the best orchestrator architects from good programmers?

**Rationale:** Phase 1 repeatedly showed that the best practitioners think in systems, not features. Elvis Sun thinks about "tiers" and "context separation." Stripe thinks about "blueprints" and "deterministic gates." Yegge thinks about "factory floors" and "roles." IndyDevDan thinks about "triads" and "portfolios." These are mental models, not technical skills. The question is: which mental models from systems engineering, operations research, control theory, or organizational design transfer directly to agent orchestration?

**Search Strategy:**
- Search for "systems thinking for software engineering" or "control theory applied to AI agents"
- Search for organizational design principles that map to multi-agent architectures (span of control, delegation patterns, communication overhead as a function of team size)
- Search for Donella Meadows' "Leverage Points" applied to agent systems
- Search for any practitioner discussions about mental models they borrowed from other domains
- Search for the connection between DevOps/SRE practices and agent orchestration (SLOs, error budgets, incident management)
- Search for manufacturing/operations research concepts that map to agent workflows (Theory of Constraints, bottleneck analysis, kanban)

**What to capture:** A curated list of mental models and their specific application to agent orchestration. Not abstract philosophy but concrete mappings: "Goldratt's Theory of Constraints maps to agent orchestration because the constraint is always context, not compute."

---

#### Q9: How do the best practitioners develop and maintain their observability intuition?

**Rationale:** IndyDevDan's first principle is "observability before scale." But observability is not just about having dashboards -- it is about knowing WHAT to look at and WHEN. steipete built tmuxwatch, CodexBar, and VibeTunnel for monitoring. Elvis Sun uses cron-based health checks. The question is not what tools exist (Phase 1 covered that) but what signals experienced practitioners actually watch, what alerts they configure, and how they develop the intuition to spot problems before they cascade.

**Search Strategy:**
- Search for IndyDevDan's observability system (claude-code-hooks-multi-agent-observability) in detail -- what specific metrics does he track?
- Search for steipete's tmuxwatch functionality -- what does it display? What alerts does it generate?
- Search for any "agent observability playbook" or "what to monitor in multi-agent systems"
- Search for SRE literature applied to AI agents (golden signals, USE method, RED method)
- Search for Elvis Sun's cron job details -- what exactly does the health check look for?
- Search for Langfuse usage patterns in multi-agent contexts -- what traces are most useful?
- Search for any discussion of "agent SLOs" or "agent reliability metrics"

**What to capture:** A concrete observability playbook: what signals to watch, what thresholds to set, what patterns indicate emerging problems. The difference between a dashboard that looks impressive and a dashboard that prevents failures.

---

#### Q10: What role does cost modeling and token economics play in mastery, and how do the best optimize it?

**Rationale:** Phase 1 showed wildly different cost profiles: Elvis Sun spends ~$190/month for a one-person SaaS equivalent to a 3-5 person team. Yegge spends $2K-5K/month on Gas Town. Stripe's scale is undisclosed but enormous. IndyDevDan advocates model routing (Opus for orchestration, Sonnet for code, Haiku for scouts). The ability to reason about token economics -- understanding that spawning 5 SDK agents costs 6K tokens on Pi vs. 110K on Claude Code -- is a concrete, measurable skill that directly impacts profitability. This is not a secondary concern for someone running a $50K/week operation.

**Search Strategy:**
- Search for detailed cost breakdowns of multi-agent operations (tokens per task type, cost per agent session, cost per commit)
- Search for Elvis Sun's cost tracking methodology (he reports ~$190/month -- how does he track this?)
- Search for model routing optimization strategies (when is Haiku sufficient? When does Opus pay for itself?)
- Search for any "token budget management" tools or frameworks
- Search for IndyDevDan's benchy tool and its findings on price/performance ratios
- Search for the Claude subscription economics analysis (the user who reported $5,623/month API-equivalent for $200/month flat)
- Search for any "cost per developer-day" benchmarks for AI-assisted development

**What to capture:** A cost modeling framework for multi-agent orchestration. Not just "how to save money" but "how to reason about token investment as a function of expected value." When is spending more on tokens ROI-positive?

---

#### Q11: How do the best practitioners handle the psychology of working with unreliable systems?

**Rationale:** This is the most non-obvious meta-skill. IndyDevDan's entire 2026 framework centers on trust -- but trust in unreliable systems creates unique psychological challenges. Agents fail unpredictably. The same prompt produces different results. Multi-agent coordination introduces emergent failure modes. Geoffrey Huntley's characterization of agents as "autoregressive queens of failure" captures the reality. The question is: how do the best practitioners maintain composure, avoid micromanagement, and develop the emotional resilience to let agents work autonomously while accepting that some work will need to be reverted?

**Search Strategy:**
- Search for any practitioner discussions about the emotional/psychological aspects of working with AI agents
- Search for steipete's "slot machine" metaphor -- how does he handle variance?
- Search for IndyDevDan's trust thesis in detail -- does he discuss the psychological dimension?
- Search for Elvis Sun's descriptions of learning to trust Zoe (he mentions "Zoe declined VCs on his behalf")
- Search for cognitive load theory applied to AI-assisted development
- Search for any research on "human-AI teaming" psychological dynamics
- Search for the concept of "calibrated trust" in automation literature (aviation, autonomous vehicles)

**What to capture:** Practical psychological strategies for working with unreliable autonomous systems. How to build justified confidence without becoming either micromanaging or reckless. How to maintain creative flow while monitoring agent work.

---

### TIER 4: THE KNOWLEDGE FRONTIER (Medium Priority)

#### Q12: What are the unsolved problems in context engineering that nobody has mastered yet?

**Rationale:** Phase 1 established that "context is the bottleneck" -- every successful system makes this claim. But the field is still young. Dexter Horthy's 40-60% utilization rule is empirical, not theoretically grounded. The "lost-in-the-middle" problem is documented but not solved. Cross-session memory (what did Agent A learn yesterday that Agent B needs today?) remains primitive. The question is: what are the frontier problems in context engineering that, if solved, would create massive competitive advantage?

**Search Strategy:**
- Search for the latest academic research on context window optimization (arxiv papers from 2025-2026)
- Search for Manus AI's published "context engineering lessons" in detail
- Search for any research on "attention-aware context construction" -- building contexts that align with how transformers allocate attention
- Search for Koylan's arxiv paper on Agentic Context Engineering (ACE) for unsolved problems identified
- Search for any discussion of "context compaction quality" -- how much information is lost during compaction?
- Search for research on "cross-agent memory" or "shared semantic memory" in multi-agent systems
- Search for the bleeding edge of context window expansion (10M+ token contexts) and what that changes for orchestration

**What to capture:** A map of the context engineering frontier: solved problems, partially solved problems, and open problems. Which open problems, if solved, would create 10x leverage?

---

#### Q13: What does "meta-agency" (agents that build and improve agents) actually look like in practice?

**Rationale:** IndyDevDan's Tier 3 is "meta-agency" -- the orchestrator reads a project spec and generates the optimal team composition, agent definitions, and task decomposition automatically. Elvis Sun's Zoe already shows emergent meta-agency: she improves her own prompts over time based on failure patterns. But nobody has built a fully self-improving agent orchestrator in the open. The question is: how close is the frontier? What are the specific technical challenges? Is this a 2026 problem or a 2027+ problem?

**Search Strategy:**
- Search for any implementations of "self-improving agent orchestration" or "meta-agent" systems
- Search for Elvis Sun's latest descriptions of Zoe's prompt improvement mechanisms
- Search for academic research on "meta-learning for agent coordination"
- Search for any "agent that writes agent definitions" or "automated agent configuration" systems
- Search for Harrison Chase's "Deep Agents" and "Ambient Agents" concepts in detail
- Search for the Claude Code hidden "Swarms" feature and what it reveals about Anthropic's multi-agent roadmap
- Search for oh-my-pi's memory pipeline and how it approaches cross-session learning

**What to capture:** Current state of meta-agency: what exists, what works, what doesn't, and what's needed. Specific technical challenges (how do you evaluate whether a generated agent definition is good?).

---

#### Q14: What is the state of agent-to-agent trust and verification in multi-agent systems?

**Rationale:** IndyDevDan's 2026 thesis is "the year of trust." But trust in multi-agent systems has a second dimension: not just human-to-agent trust, but agent-to-agent trust. When the orchestrator delegates to a coding agent, how does it verify the output? When multiple agents need to coordinate, how do they establish shared ground truth? Phase 1 documented Elvis Sun's multi-model review gate (3 models review each PR) and Stripe's 2-round CI cap, but the theoretical foundations of agent-to-agent verification are underdeveloped.

**Search Strategy:**
- Search for research on "multi-agent verification" or "agent output validation" in AI systems
- Search for the concept of "cross-validation" applied to agent outputs (using one agent to check another)
- Search for Stripe's multi-model review patterns in detail
- Search for Elvis Sun's three-model review gate implementation details
- Search for any formal frameworks for "agent trust" or "agent reliability scoring"
- Search for blockchain/cryptographic verification approaches applied to agent outputs
- Search for research on "consensus mechanisms" adapted for AI agent coordination

**What to capture:** The state of agent-to-agent trust: what verification mechanisms exist, what gaps remain, and what a production-grade trust system would look like.

---

#### Q15: What will harness engineering look like in 12 months, and what should you learn now that will still matter then?

**Rationale:** IndyDevDan's "progressive deletability" principle implies that some of today's knowledge will become obsolete. Models will get better. Context windows will expand. New tools will emerge. The question is not just what to learn now but what learning has a long half-life. Phase 1 documented that IndyDevDan has an 87% prediction win rate on his annual bets. The question is: what are the structural trends (not feature announcements) that will shape the next year?

**Search Strategy:**
- Search for IndyDevDan's latest 2026 predictions and their current status
- Search for Matt Shumer's predictions about post-February-2026 agent evolution
- Search for Mario Zechner's signals about Pi Agent's 1.0 roadmap
- Search for Anthropic's public roadmap for Claude Code and Agent SDK evolution
- Search for predictions about context window expansion (will 10M tokens change everything?)
- Search for predictions about model commoditization and its impact on harness engineering
- Search for any "what to learn that won't be obsolete" discussions in the agentic engineering community
- Search for Tobi Lutke's (Shopify CEO) latest statements about agent tooling direction

**What to capture:** A time-decay analysis of current knowledge: what skills have a 3-month half-life, a 12-month half-life, and a multi-year half-life. What to invest in now that will still compound in 12 months.

---

### TIER 5: MEASURING MASTERY (Medium Priority)

#### Q16: What are the KPIs of a world-class harness engineer, and how do you measure them?

**Rationale:** "What gets measured gets managed." If Burak wants to become one of the best, he needs to know what "best" looks like in measurable terms. Elvis Sun measures commits/day. Stripe measures PRs merged/week. IndyDevDan measures prediction accuracy and trust scores. But there is no consensus on what the definitive KPIs of a harness engineer are. Is it throughput? Quality? Cost efficiency? Agent uptime? Time-to-resolution? Some combination?

**Search Strategy:**
- Search for any published "agentic engineering metrics" or "agent productivity metrics"
- Search for software engineering productivity metrics (DORA, SPACE framework) adapted for agent-assisted development
- Search for Elvis Sun's full metric set beyond commits/day
- Search for Stripe's internal metrics for Minions productivity
- Search for any "benchmarks" for multi-agent orchestration systems (SWE-bench scores, TerminalBench)
- Search for cost-per-outcome metrics used by any practitioner
- Search for IndyDevDan's benchy tool methodology for comparing agent performance

**What to capture:** A proposed KPI framework for harness engineering mastery, with specific metrics, measurement methods, and target values. Include both leading indicators (what predicts future mastery) and lagging indicators (what confirms achieved mastery).

---

#### Q17: How do the best practitioners build in public, and what does that practice contribute to their mastery?

**Rationale:** Every top practitioner identified in Phase 1 builds in public: IndyDevDan (YouTube weekly, 20+ repos), Elvis Sun (X thread, blog), steipete (410K followers, blog posts), Huntley (16+ blog posts), Yegge (Medium essays, Gas Town repo). This is not coincidental. IndyDevDan's framework suggests that sharing forces clarity, and clarity deepens understanding. The question is: what specific practices of building in public accelerate mastery, and what's the minimum viable public presence for a practitioner who is already busy generating revenue?

**Search Strategy:**
- Search for IndyDevDan's reflections on why he publishes weekly and what it does for his learning
- Search for steipete's reflections on blogging and sharing ("Ship beats perfect")
- Search for research on "learning by teaching" or "the protege effect" applied to engineering
- Search for Elvis Sun's reflections on what the Karpathy moment and viral thread did for his practice
- Search for any analysis of how public building creates feedback loops that accelerate skill development
- Search for practical frameworks for "building in public" as an engineer (not as a marketer)

**What to capture:** The specific mechanisms by which building in public accelerates mastery. Practical tactics for someone who wants the learning benefits without spending 10+ hours/week on content creation.

---

### TIER 6: DEEP TECHNICAL FRONTIERS (Standard Priority)

#### Q18: What does mastery of the Pi Agent SDK internals actually require?

**Rationale:** IndyDevDan's "do not outsource your mastery" principle and his "knowing is engineering" dictum demand understanding Pi at the source code level, not just the API level. Phase 1 documented Pi's architecture (25+ lifecycle events, 7 categories, createAgentSession(), context event) but from the outside. The question is: what does a Pi Agent power user need to understand about the internals? How does the message processing pipeline work? What happens during compaction? How does tool registration interact with the LLM's tool-calling behavior?

**Search Strategy:**
- Search for Pi Agent's source code documentation or architecture guides (github.com/badlogic/pi-mono)
- Search for Mario Zechner's blog posts or videos explaining Pi's internal architecture
- Search for any community deep-dives into Pi's codebase
- Search for oh-my-pi's modifications to understand what the internals allow
- Search for OpenClaw's usage of Pi SDK internals (the two-level lane queue, the pre-compaction memory flush)
- Search for any Pi Agent "internals" or "architecture" documentation

**What to capture:** A knowledge map of Pi Agent internals: what you need to understand to build production-grade extensions, what you can safely treat as a black box, and what understanding creates the biggest leverage.

---

#### Q19: What is the state of the art in multi-model routing, and what makes a routing decision "intelligent"?

**Rationale:** Elvis Sun routes tasks to Codex for backend, Claude Code for frontend, and Gemini for UI design. Phase 1's landscape overview recommends "Opus for orchestration/review, Sonnet for implementation, Haiku for scouts." But the routing logic is ad-hoc in every documented system. No one has published a formal routing framework. The question is: can model routing be made rigorous? What dimensions matter (cost, latency, quality, context window size, specific capability)? Can routing decisions be learned from historical performance data?

**Search Strategy:**
- Search for any "model routing" or "LLM routing" frameworks or tools
- Search for Elvis Sun's model routing logic in detail (how does Zoe decide which model to use?)
- Search for any benchmarking data that maps task types to model strengths (e.g., "Codex is 23% better at multi-file refactors")
- Search for IndyDevDan's nano-agent multi-provider evaluation system
- Search for research on "adaptive model selection" or "model ensemble" for coding tasks
- Search for MorphLLM and similar tools that optimize model selection based on task characteristics
- Search for any "LLM leaderboard" data that differentiates by task type, not just aggregate scores

**What to capture:** The current state of model routing: what heuristics work, what data is available, and what a production-grade routing engine would look like.

---

#### Q20: How do the best practitioners handle the merge problem in parallel multi-agent development?

**Rationale:** Phase 1 identified git worktrees as "the consensus pattern for parallel work" but also noted that "the merge problem is unsolved without Graphite." steipete controversially works all agents on main branch and avoids worktrees. Yegge's Gas Town has a dedicated "Refinery" agent for merging. The merge problem is the single biggest technical barrier to scaling agent parallelism, and it compounds with agent count. How do the best practitioners actually handle it?

**Search Strategy:**
- Search for steipete's detailed explanation of why he avoids worktrees and how he handles conflicts
- Search for Gas Town's Refinery agent implementation details
- Search for Graphite's stacked PRs workflow applied to multi-agent development
- Search for any "AI-assisted merge conflict resolution" tools or research
- Search for Vibe Kanban's merge strategy (it gives each agent a worktree -- how does it merge?)
- Search for Overstory's 4-tier merge queue implementation details
- Search for any empirical data on merge conflict rates as a function of agent count

**What to capture:** A decision framework for merge strategy: when to use worktrees, when to work on main, when to use stacked PRs, and how to handle conflicts when they inevitably arise.

---

#### Q21: What are the security and safety skills that most harness engineers neglect?

**Rationale:** Phase 1's deep-dives synthesis noted that "AI-authored code introduces 1.75x more logic errors and 2.74x more XSS vulnerabilities than human-written code." Shannon scores 96.15% on security benchmarks. But security was treated as a footnote in most Phase 1 documents, not as a core mastery domain. IndyDevDan's agent-sandbox-skill addresses isolation, but the broader question of how to secure multi-agent systems (preventing data exfiltration, ensuring agents don't leak secrets, protecting against prompt injection in agent-to-agent communication) is largely unexplored.

**Search Strategy:**
- Search for "AI agent security" or "multi-agent security" research and best practices
- Search for Stripe's security model for Minions (devbox isolation, internet restriction)
- Search for any "prompt injection" attacks on multi-agent systems
- Search for IndyDevDan's agent-sandbox-skill security model in detail
- Search for Shannon's architecture and what it reveals about agent security testing
- Search for any "agent security checklist" or "multi-agent threat model"
- Search for OWASP or similar standards body guidance on AI agent security

**What to capture:** A security knowledge map: what threats exist, what mitigations are proven, and what security skills a harness engineer must develop. This is a neglected domain where mastery creates disproportionate value.

---

#### Q22: What are the community dynamics and network effects that accelerate mastery?

**Rationale:** Phase 1 revealed that the top practitioners form a loose network: dotta's top 20 includes Mario Zechner (#1), Nico Bailon (#2), steipete (#3), Boris Cherny (#4), and Koylan (#9). They reference each other's work, build on each other's patterns, and create feedback loops. The Pi extension ecosystem (50-80 extensions) is a community product. The question is: how does a practitioner break into this network, and what does network membership contribute to mastery beyond access to information?

**Search Strategy:**
- Search for how the Pi Agent community is organized (Discord? GitHub discussions? X/Twitter circles?)
- Search for how IndyDevDan, steipete, and Elvis Sun interact with each other and with followers
- Search for any "agentic engineering community" groups, forums, or events
- Search for the AAIF (Agentic AI Foundation) community and how practitioners engage with it
- Search for conference talks or events where the top practitioners present
- Search for any "mastermind group" or "cohort" models in the agentic engineering space

**What to capture:** A network map of the agentic engineering community and practical strategies for building relationships that accelerate learning. Not networking advice -- engineering community participation patterns.

---

#### Q23: What can be learned from adjacent fields where humans orchestrate autonomous systems?

**Rationale:** Agent orchestration is not a new problem -- it is a new instantiation of an old problem. Air traffic control, factory automation, military C2 (command and control), distributed systems engineering, and orchestra conducting all involve humans coordinating autonomous or semi-autonomous agents. The best mental models may come from outside the AI engineering bubble. IndyDevDan's "engineering with exponentials" is itself borrowed from investment theory.

**Search Strategy:**
- Search for "human supervisory control" literature (Thomas Sheridan's foundational work)
- Search for air traffic control principles applied to software systems
- Search for factory automation / Industry 4.0 patterns that map to agent orchestration
- Search for military C2 (command and control) decision frameworks
- Search for distributed systems engineering principles (CAP theorem, eventual consistency) applied to agent coordination
- Search for orchestra conducting techniques as a metaphor for agent orchestration (Addy Osmani already uses this metaphor)
- Search for any explicit "cross-domain transfer" articles about agent orchestration

**What to capture:** Cross-domain principles that transfer to agent orchestration but are not commonly discussed in the AI engineering community. Fresh mental models that could create novel approaches.

---

#### Q24: What is the minimum viable practice for maintaining mastery as the field evolves at exponential speed?

**Rationale:** The field is moving so fast that knowledge decays rapidly. Phase 1 documented ~30 Pi minor versions in 4 months. Claude Code shipped Agent Teams in February 2026. New tools appear weekly. IndyDevDan publishes every Monday. The question is: what is the minimum viable practice for staying current without drowning in information? What sources to follow? How often to update your tool stack? How to distinguish signal from noise?

**Search Strategy:**
- Search for IndyDevDan's information diet -- what sources does he follow? How does he decide what to pay attention to?
- Search for any "staying current in AI" guides or frameworks
- Search for how the top practitioners curate their information sources
- Search for "signal vs. noise" frameworks applied to fast-moving technology fields
- Search for any "technology radar" equivalents for the agentic engineering space
- Search for changelog monitoring strategies (how to track Pi, Claude Code, OpenCode releases efficiently)

**What to capture:** A minimum viable information diet: what to follow, how often to check, and how to filter. Not a reading list but a curation system.

---

## Priority Ranking

| Priority | Question | Rationale |
|----------|----------|-----------|
| P0 (Critical) | Q1: Daily workflows of top practitioners | Directly actionable, transforms working patterns |
| P0 (Critical) | Q2: Specific technical knowledge map | Defines the learning target |
| P0 (Critical) | Q5: Optimal learning sequence | Determines what to do first, second, third |
| P1 (High) | Q3: Debugging and failure handling | Fills the biggest gap in Phase 1 |
| P1 (High) | Q6: Highest-ROI knowledge investments | Prevents wasted learning effort |
| P1 (High) | Q9: Observability intuition | Core to IndyDevDan's philosophy |
| P1 (High) | Q10: Cost modeling and token economics | Direct revenue impact at $50K/week |
| P2 (Medium-High) | Q4: Taste and judgment systematization | Meta-skill with compounding returns |
| P2 (Medium-High) | Q7: Building vs. learning vs. shipping balance | Critical for time allocation |
| P2 (Medium-High) | Q8: Systems thinking mental models | Creates novel approaches |
| P2 (Medium-High) | Q12: Unsolved context engineering problems | Frontier opportunity |
| P2 (Medium-High) | Q16: KPIs of mastery | Enables measurement and tracking |
| P3 (Medium) | Q11: Psychology of unreliable systems | Non-obvious but high-impact |
| P3 (Medium) | Q15: 12-month forecast | Prevents learning obsolete skills |
| P3 (Medium) | Q18: Pi Agent SDK internals | Deep technical mastery |
| P3 (Medium) | Q19: Multi-model routing | Concrete optimization opportunity |
| P3 (Medium) | Q21: Security and safety skills | Neglected domain with disproportionate value |
| P4 (Standard) | Q13: Meta-agency in practice | Frontier, likely 2027+ |
| P4 (Standard) | Q14: Agent-to-agent trust | Theoretical but important |
| P4 (Standard) | Q17: Building in public practices | Accelerator, not core |
| P4 (Standard) | Q20: Merge problem solutions | Technical but specific |
| P4 (Standard) | Q22: Community dynamics | Network effects matter but secondary |
| P4 (Standard) | Q23: Adjacent field lessons | Novel but speculative |
| P4 (Standard) | Q24: Staying current practices | Maintenance, not building |

---

## Recommended Phase 2 Agent Allocation

Based on 24 questions across 6 tiers, recommend 12-15 research agents in 2-3 waves:

**Wave 1 (6 agents, P0+P1):**
1. Agent: `top-practitioner-workflows` -- Q1 + Q7 (daily workflows + time allocation)
2. Agent: `technical-knowledge-map` -- Q2 (specific technical knowledge that separates the best)
3. Agent: `learning-sequence-roadmap` -- Q5 + Q6 (optimal sequence + highest-ROI knowledge)
4. Agent: `debugging-failure-mastery` -- Q3 + Q11 (failure handling + psychology)
5. Agent: `observability-mastery` -- Q9 + Q16 (observability intuition + KPIs)
6. Agent: `cost-token-economics` -- Q10 (cost modeling and optimization)

**Wave 2 (5 agents, P2):**
7. Agent: `judgment-taste-systems` -- Q4 + Q8 (taste/judgment + systems thinking)
8. Agent: `context-engineering-frontier` -- Q12 (unsolved problems in context engineering)
9. Agent: `12-month-durability` -- Q15 + Q24 (future forecast + staying current)
10. Agent: `pi-internals-mastery` -- Q18 (Pi SDK internals deep dive)
11. Agent: `model-routing-mastery` -- Q19 (multi-model routing state of the art)

**Wave 3 (4 agents, P3+P4):**
12. Agent: `meta-agency-frontier` -- Q13 + Q14 (meta-agency + agent trust)
13. Agent: `security-safety-mastery` -- Q21 (security skills that most neglect)
14. Agent: `building-in-public-network` -- Q17 + Q22 (public building + community)
15. Agent: `cross-domain-merge` -- Q20 + Q23 (merge problem + adjacent fields)

---

*Analysis complete. 24 research questions across 6 tiers, prioritized for maximum compounding. Through IndyDevDan's lens: these questions are designed to convert "not knowing" into "knowing" -- to move from vibe-orchestrating to engineered mastery.*
