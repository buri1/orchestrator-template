# Build Strategy Analysis: Incremental vs. Monolithic vs. Rebuild-from-Scratch

**Date:** 2026-03-06
**For:** Burak
**Context:** Deciding how to approach building a unified agent system (client work + experiments + SaaS launches + marketing) given existing working systems (L-Thread Orchestrator, Finance Agent) and $50K/week contract revenue.

---

## 1. Executive Summary

You are asking the right question at the right time. The answer is not one of the three options you presented. It is a specific hybrid: **build a thin shared layer now (2-3 days), keep your existing systems running untouched, grow the new layer by absorbing functions from the old systems one at a time, and accept that you will rebuild the shared layer once -- exactly once -- after 60-90 days of learning.**

This is not a compromise. It is the strategy that the evidence -- from Composio's self-building orchestrator, from Elvis Sun's rebuild-from-PressPulse trajectory, from the strangler fig pattern, from the disposable software movement, and from your own Phase 2 research findings -- converges on. The reasoning follows.

---

## 2. The Three Strategies, Honestly Evaluated

### 2A. Build the Whole Thing at Once (Monolithic Design-First)

**What it means:** Spend 2-4 weeks designing the unified system architecture. Define all interfaces, all shared primitives, all integration points between client work, experiments, SaaS, and marketing before writing a line of code.

**Who does this successfully:** Enterprise teams with stable requirements and dedicated architects. Nobody in the solo-operator agent space.

**Failure modes:**
- **The Second System Effect** (Fred Brooks). You have already built two working systems. The temptation to incorporate every lesson learned from both, plus every insight from 104 research documents, plus every feature from the bleeding-edge frontier research, will produce an over-engineered monster. Brooks observed this in 1975: "The second system is the most dangerous system any architect designs because they want to include everything they restrained themselves from adding to the first." With 104 research docs of ideas in your head, this risk is extreme.
- **Requirements will change under you.** The agent tooling landscape shifts weekly. Claude Code just shipped Agent Teams. OpenClaw is evolving. MCP is standardizing. Any "complete" design you produce this week will be partially obsolete in 30 days.
- **Revenue interruption.** Every hour spent on greenfield architecture is an hour not spent on the $50K/week contracts. At your rate, a 2-week design sprint has a $100K opportunity cost -- not counting the risk that the resulting system does not work as designed.
- **The Google DeepMind coordination finding applies to you too.** Your own research found coordination overhead scales with exponent 1.724. Designing a system that coordinates client work + experiments + SaaS + marketing is designing a system with 4+ tightly-coupled concerns. The overhead will be super-quadratic.

**Verdict:** Wrong for your situation. You do not have stable requirements, you do not have a team, and you cannot afford the revenue interruption.

### 2B. Build Small and Incrementally Add

**What it means:** Start with the smallest possible shared layer between your existing systems, add capabilities one by one as you need them, never tear anything down until the replacement is proven.

**Who does this successfully:** This is the strangler fig pattern, used successfully by Amazon (monolith to microservices), Netflix, and every mature organization that migrated a working system without downtime. In the agent space, Dan Disler (IndyDevDan) exemplifies this -- his progression from single-file agents to indydevtools to Pi extensions is textbook incremental evolution.

**Failure modes:**
- **Architectural debt accumulation.** Each incremental addition makes decisions that constrain future additions. After 20 incremental additions, the system may be harder to understand than a clean design would have been.
- **Local optima.** Incremental changes optimize each step locally but can miss globally better architectures. You end up on a local hill when there is a mountain nearby.
- **The "never rebuild" trap.** Some teams become so committed to incremental improvement that they never make the clean break that would unlock a step-function improvement. The prototype calcifies into the product.

**Strengths:**
- **Revenue continuity.** Your existing systems keep running and earning while you build alongside them.
- **Learning under load.** Each increment teaches you something about what the unified system actually needs (vs. what you imagine it needs).
- **Reversibility.** Any single increment that fails can be rolled back without affecting the whole system.

**Verdict:** Close to correct, but incomplete. Pure incrementalism does not account for the moment when accumulated learnings justify a clean rebuild of the shared layer.

### 2C. Build Fast, Learn, Rebuild from Scratch

**What it means:** Accept that the first version will be wrong. Build it anyway, as fast as possible, use it for real work, and when you understand the actual requirements (not the imagined ones), rebuild it cleanly with all the learnings.

**Who does this successfully:** Elvis Sun. He built PressPulse, scaled it to $17K MRR, recognized it was "the wrong business built on someone else's land," shut it down, and rebuilt from scratch as Zoe + the agent swarm. The rebuild was not wasted -- every lesson from PressPulse informed the architecture of Zoe. Composio's Agent Orchestrator was literally built by the agents it orchestrates -- 40,000 lines of TypeScript, 17 plugins, 3,288 tests in 8 days. They built the bash-script version first, used it to manage 30 agents building the TypeScript replacement, then threw away the bash version. Brooks himself said: "Plan to throw one away; you will, anyhow."

**In the AI era, this pattern has a new economic argument:** If Claude Code can ship 35K lines of working code in 7 hours (the BAML case), and if Rakuten completed a complex implementation across 12.5M lines in 7 hours, then the cost of rebuilding a 5-10K line system is measured in hours, not weeks. Rebuilding is cheap when your agents can rebuild. The traditional objection to throwaway prototyping -- "it costs too much to rewrite" -- has collapsed.

**Failure modes:**
- **The prototype does not get thrown away.** The most common failure. Under revenue pressure, you ship the prototype, add patches, and it becomes the product. Then you have the worst of both worlds: production load on prototype architecture.
- **Brooks' warning, updated:** "Plan to throw one away" works only if you actually throw it away. Every month the prototype runs in production, the switching cost increases.
- **Knowledge loss between versions.** If the person who understands the prototype's lessons is not the person building the replacement, critical context is lost. For a solo operator, this risk is minimal.

**Verdict:** Correct in principle, but needs guardrails. The risk is not in rebuilding -- it is in failing to rebuild when you should.

---

## 3. What the Evidence Actually Says

### 3.1 The Disposable Software Thesis

Andreessen Horowitz has codified "disposable software" as a 2026 trend: software built for specific purposes, used, and discarded. Christina Lin (Google Cloud) argues that "in the AI era, the best codebase might not be the most elegant or the most performant, but the one that's most refactorable." The hybrid development model -- keep foundational parts robust and reusable, attach replaceable parts via AI -- is the emerging consensus.

**Applied to your situation:** The orchestration wiring (how agents communicate, how state is managed, how tasks are tracked) is the foundational part. The specific implementations (Finance Agent's Notion integration, Orchestrator's tmux management, specific client workflows) are the replaceable parts. Design the foundation for stability. Design everything else for disposability.

### 3.2 The Strangler Fig Pattern

Martin Fowler's strangler fig pattern is the established enterprise approach to incremental migration. The key mechanism: introduce a facade (proxy) between the client and the existing system. Route requests through the facade. Gradually reimplement capabilities behind the facade. The old system shrinks as the new system grows. The old system is never "turned off" -- it simply has nothing left to do.

**Applied to your situation:** The facade is a shared state layer and a shared task routing interface. Your Finance Agent and Orchestrator both need to route tasks, track state, and report results. Build a thin shared interface for these three functions. Both existing systems call through it. New capabilities are built against it. Old implementations are migrated one at a time.

### 3.3 The Elvis Sun Rebuild Pattern

Elvis Sun's trajectory is the most relevant case study. He did not iterate PressPulse into Zoe. He killed PressPulse entirely and started fresh -- but he carried every lesson forward. The critical details from your own research:

- He moved from scattered tools to a **monorepo** (code + knowledge base in one place so Zoe has full context)
- He moved from manual task management to **JSON-based state tracking** (`.clawdbot/active-tasks.json`)
- He moved from single-agent to **two-tier architecture** (orchestrator never writes code, agents never see business context)
- He moved from static prompts to **learned prompt patterns** (Zoe logs which prompt structures work for which task types)

Every one of these architectural decisions was informed by failures in previous versions. The rebuild was not starting from zero -- it was starting from a position of hard-won knowledge about what actually matters.

### 3.4 The IndyDevDan Incremental Pattern

Dan Disler took the opposite approach and it also worked. His progression:
1. Single-file agents (one Python file per agent, proving the concept)
2. IndyDevTools (opinionated toolbox, growing incrementally)
3. Pi Agent extensions (building on someone else's foundation)
4. Big-3 Super Agent (Gemini + OpenAI + Claude multi-agent experiment)

At no point did Dan throw everything away. Each step built on the previous one. But critically: **Dan's goal was different from Elvis's.** Dan is building engineering knowledge and a teaching platform. Elvis is building a business. Dan can afford to evolve slowly because his asset is the knowledge, not the system. Elvis needed to ship product, so he needed a clean architecture fast.

**Your situation is closer to Elvis's.** You are building a business under revenue pressure, not an educational platform. The build-fast-and-rebuild pattern fits your context better than pure incrementalism.

### 3.5 The Composio Self-Building Pattern

Composio's Agent Orchestrator is the most provocative data point. They built the bash-script version first, used it to manage 30 agents building the TypeScript replacement, then the TypeScript version replaced the bash version. The system literally built its own replacement.

**The meta-lesson:** In the agent era, the rebuild cost is not proportional to the system's complexity. It is proportional to how well you can specify what you want. If you have spent 60-90 days operating the V1 system and you understand exactly what it needs to do, your agents can rebuild it in days. The bottleneck is never the coding. It is the knowing.

### 3.6 The Inner Platform Anti-Pattern Warning

The inner platform effect -- building a system so configurable it becomes a poor replica of the platform it runs on -- is the primary risk when building a "unified agent platform." Signs you are falling into this trap:
- You are building a "task routing system" when Claude Code already has Task tool and Agent Teams
- You are building a "state management system" when a JSON file and git already work
- You are building a "plugin system" when MCP already provides dynamic tool registration
- You are building abstractions for problems you have not encountered yet

**The antidote:** Build only what you have needed in the last 30 days. Not what you might need. Not what the research says is frontier. What you have actually needed and did not have.

---

## 4. The Hybrid Strategy: What to Actually Do

### Phase 1: The Thin Shared Layer (Days 1-3)

Build the minimum viable shared infrastructure that both your existing systems (and any future system) can use. This is not a platform. It is three things:

**1. Unified State Schema**
A single JSON schema that any orchestrator (L-Thread, Finance Agent, or future systems) can write to and read from. Fields:
- Task ID, type, status, assigned agent, parent system
- Timestamps (created, started, completed)
- Outcome (success/failure, confidence score, notes)
- Cross-references (which client, which project, which business line)

This is not a database. It is a file format. Your existing `orchestrator-state.json` and whatever the Finance Agent uses both write to this format. A simple aggregator reads all instances.

**2. Shared Notification Layer**
One webhook/Telegram/Slack endpoint that any system can post to. Format: `[system_name] [severity] [message]`. This replaces per-system notification logic.

**3. Shared Task Interface**
A minimal protocol: any system can emit a task request with `{type, priority, context, constraints}`. Any system can claim and execute a task. This is the facade from the strangler fig pattern -- it sits between "something needs to be done" and "something does it."

That is it. Three things. No framework, no abstractions, no plugin system, no database. JSON files, a webhook, and a task format.

### Phase 2: Run Under Load (Days 4-60)

Keep your L-Thread Orchestrator running client work. Keep the Finance Agent running finances. Both systems emit tasks and state updates through the thin shared layer. You observe:
- What tasks actually cross system boundaries?
- What state do you actually need to see aggregated?
- Where does the thin layer break or become insufficient?
- What manual steps do you keep doing that should be automated?

This phase is not building. It is learning. The thin shared layer is an observation instrument as much as it is infrastructure. Every friction point you encounter is a specification for V2.

During this phase, you also build new capabilities (SaaS experiments, marketing automation) as new modules that speak the shared protocol. Each module is independent, disposable, and narrowly scoped.

### Phase 3: The Informed Rebuild (Days 60-90)

After 60 days of real operation, you will know:
- Which of the 104 research findings actually matter for your workflow (not in theory -- in practice)
- What the real integration points between client work, experiments, SaaS, and marketing are
- Where the thin shared layer was sufficient and where it was not
- What your actual state management needs are (flat JSON? knowledge graph? database?)

At this point, and not before, you rebuild the shared layer. Not the whole system -- just the shared layer. Your existing modules (Orchestrator, Finance Agent, any new modules) stay running. The new shared layer replaces the thin one, informed by 60 days of data about what you actually needed.

This rebuild should take 2-5 days with your agents. The bottleneck will not be coding. It will be deciding.

### Phase 4: Absorb and Simplify (Days 90-180)

With the informed shared layer in place, begin the strangler fig process:
- Migrate Finance Agent capabilities that overlap with the shared layer
- Migrate Orchestrator capabilities that overlap with the shared layer
- Each migration is a pull request, tested, reversible
- As capabilities move to the shared layer, the old systems shrink
- When an old system has nothing left to do, archive it

---

## 5. Decision Framework: When to Extend, Build New, or Rebuild

Use this framework going forward for every architectural decision:

### Extend an Existing System When:
- The capability is closely related to the system's core purpose
- Adding it requires less than 500 lines of new code
- The existing system's architecture naturally supports it
- The user (you) is the only consumer

### Build a New Module When:
- The capability serves a different business line than any existing system
- It has different state management requirements
- It could be useful to more than one existing system
- It can be built in under 2 days and run independently

### Rebuild a Component When:
- You can articulate exactly what is wrong with the current version (not vaguely -- specifically)
- You have at least 30 days of operational data showing the failure patterns
- The rebuild can be completed in under 5 days
- The old system can keep running during the rebuild
- You have a clear test: "if the new version can do X, Y, Z, it replaces the old one"

### Rebuild the Whole System from Scratch When:
- The fundamental assumptions of the architecture have changed (e.g., switching from prompt-engineering-only to a coded harness)
- Migration cost exceeds rebuild cost (the strangler fig has become more expensive than a clean start)
- You have extensive operational data from the current system (minimum 90 days)
- The rebuild team (you + agents) can complete it in under 2 weeks
- You can keep the old system running as a fallback during the transition

### Never Rebuild When:
- You are bored with the current system but it is working
- You read a paper about a better architecture but have not hit the limits of the current one
- You want to incorporate frontier research that has not been proven in production
- Revenue would be interrupted during the transition

---

## 6. Addressing the Specific Business Lines

### Client Work ($50K/week contracts)
**Strategy:** Do not touch. The L-Thread Orchestrator works. It earns. Every change is risk. Build new client work tooling as separate modules that speak the shared protocol. When you have proven a better approach on a non-critical project, migrate.

### Experiments
**Strategy:** Build as disposable modules. Each experiment is a new directory, a new agent configuration, speaks the shared task protocol. Success means it gets promoted to a real module. Failure means `rm -rf`. No emotional attachment to experiment code.

### SaaS Launches
**Strategy:** Each SaaS product gets its own module. Shared infrastructure (deployment, monitoring, billing) is built into the shared layer only when two or more SaaS products need the same thing. Do not pre-build infrastructure for hypothetical SaaS products.

### Marketing
**Strategy:** Elvis Sun's model works here. Marketing is embarrassingly parallel -- social media posts, content creation, email campaigns have zero coordination overhead. Build a marketing module that receives tasks from the shared protocol and spawns independent agents for each task. This is one-shot isolated execution (the Stripe pattern from your research), which scales linearly.

---

## 7. What Not to Build

Your 104 research documents contain dozens of frontier capabilities. Here is what to explicitly not build yet:

- **Cross-project knowledge graph** (Cognee integration). Build this at Day 90+, not Day 1. You need operational data first.
- **Self-improving prompt system** (DSPy). Build this at Day 120+. You need a stable system to improve before you automate improvement.
- **Confidence scoring engine**. Build this at Day 60+. You need 60 days of agent performance data to score.
- **Architecture search / ADAS**. Not until 2027. Research-grade, not production-ready.
- **Learned routing model**. Not until you have training data from your own operations.
- **Tool genesis pipeline**. Not until the shared layer is stable.

The pattern: every frontier capability requires operational data to be useful. Build the system that generates the data first. Add the frontier capabilities when you have the data to feed them.

---

## 8. The Opinionated Recommendation

**Do not design a unified system. Grow one.**

Here is the specific sequence:

1. **This week (Days 1-3):** Build the thin shared layer. JSON schema, webhook, task format. Nothing more.
2. **This month (Days 4-30):** Keep earning $50K/week with the existing Orchestrator. Wire it to the shared layer. Wire the Finance Agent to the shared layer. Build your first SaaS experiment as a new module on the shared layer. Build a marketing module on the shared layer.
3. **Day 30-60:** Observe what works and what breaks. Log every friction point. Do not fix the shared layer yet -- document what needs fixing.
4. **Day 60-67:** Rebuild the shared layer based on 60 days of evidence. This is your one planned rebuild. Your agents do the coding. You do the specifying.
5. **Day 67-180:** Strangler-fig your way to a unified system. Each old component migrates to the new shared layer one function at a time. Nothing is "turned off" -- it simply has nothing left to do.

**Why this works for you specifically:**

- You keep earning throughout. Zero revenue interruption.
- You avoid the Second System Effect because the thin shared layer is so small there is nothing to over-engineer.
- You avoid the inner platform anti-pattern because you build only what you need, when you need it.
- You get the benefit of "rebuild from scratch" (clean architecture informed by real experience) without the risk (the rebuild is of the shared layer, not the whole system).
- You incorporate frontier research on a data-driven schedule: confidence scoring at Day 60 when you have data, knowledge graphs at Day 90 when you have multiple projects, self-improving prompts at Day 120 when you have a stable system to improve.
- You match Elvis Sun's pattern (build fast, learn, rebuild the core) and Dan Disler's pattern (incremental evolution, each step building on the last) simultaneously. It is not one or the other. It is both, in sequence.

**The one thing that would make this wrong:** If the fundamental tooling shifts (e.g., Anthropic releases a native multi-system orchestration layer, or Pi Agent ships a unified agent platform that does everything). In that case, you would evaluate whether to adopt the external platform instead of building your own. But that has not happened yet, and building your thin shared layer is cheap enough that abandoning it for a better external option costs you 2-3 days of work, not months.

**Final word:** The orchestration layer is the compounding asset. Your Phase 2 research concluded this. The way you build a compounding asset is not by designing it perfectly upfront (it will be wrong) or by iterating forever on V1 (you will hit local optima). You build it by running a real system under real load, measuring what matters, and rebuilding the core once you know what you are actually building. Then you compound from there.

---

## Sources

### Build Strategy and Architecture Patterns
- [Multi-Agent Systems: Architecture Shift from Monolithic to Collaborative Intelligence](https://www.comet.com/site/blog/multi-agent-systems/)
- [AI Agent Architectures: Efficiency vs. Scaling Limits in 2026](https://beta.hyper.ai/en/stories/53d4fafdd3b77c15bc7008b4122bc84c)
- [Beyond the Monolith: 3-Tier Multi-Agent Architecture](https://autofei.wordpress.com/2026/02/24/3-tier-multi-agent-architecture-future-of-ai/)
- [Red Hat: Optimizing Application Architectures for AI](https://www.redhat.com/en/blog/optimizing-application-architectures-ai-monoliths-intelligent-agents-part-1)

### Disposable Software
- [Andreessen Horowitz: Disposable Software](https://a16z.com/disposable-software/)
- [CodeConductor: Disposable AI Apps -- How AI Is Changing Software Development in 2026](https://codeconductor.ai/blog/disposable-apps-ai-changing-software-development/)
- [Christina Lin / Google Cloud: Software Becomes Disposable?](https://medium.com/google-cloud/software-becomes-disposable-how-ai-is-changing-the-way-we-architect-code-1bfb50356b98)
- [Atsushi Ito: The Disposable Software Revolution in the AI Era](https://medium.com/@poola.vii/the-disposable-software-revolution-in-the-ai-era-the-future-of-hybrid-development-d62f673af90a)
- [Vibe Coding and Disposable Software 2026](https://dailyaiworld.com/post/vibe-coding-disposable-software-2026-the-end-of-saas-as-we-know-it)

### Strangler Fig and Migration Patterns
- [Martin Fowler: Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Microsoft Azure: Strangler Fig Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)
- [AWS: Strangler Fig Pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)
- [Thoughtworks: Embracing the Strangler Fig Pattern](https://www.thoughtworks.com/en-us/insights/articles/embracing-strangler-fig-pattern-legacy-modernization-part-one)
- [AppsTek: Big Bang vs. Progressive Modernization](https://appstekcorp.com/blog/progressive-modernization-enterprise-transformation/)

### Platform Engineering and Inner Platform Effect
- [The New Stack: AI Is Merging With Platform Engineering in 2026](https://thenewstack.io/in-2026-ai-is-merging-with-platform-engineering-are-you-ready/)
- [CIO: Agentic AI Is About the Platform](https://www.cio.com/article/4125864/agentic-ai-isnt-about-the-agents-its-about-the-platform.html)
- [Paradigma: 2026 Will Be the Year of AI Platforms](https://en.paradigmadigital.com/techbiz/2026-the-year-ai-platform/)
- [UBOS: Understanding the Inner Platform Effect](https://ubos.tech/news/understanding-the-inner%E2%80%91platform-effect-risks-real%E2%80%91world-examples-and-solutions/)
- [Google Cloud: Choose a Design Pattern for Agentic AI](https://docs.google.com/architecture/choose-design-pattern-agentic-ai-system)

### Rapid Development in the AI Era
- [Composio: The Self-Improving AI System That Built Itself](https://composio.dev/blog/the-self-improving-ai-system-that-built-itself)
- [Composio Agent Orchestrator on GitHub](https://github.com/ComposioHQ/agent-orchestrator)
- [Hacker News: Agent Orchestrator -- Built Using the Agents It Orchestrates](https://news.ycombinator.com/item?id=47219229)
- [a16z: Notes on AI Apps in 2026](https://a16z.com/notes-on-ai-apps-in-2026/)

### Build vs. Buy Decision Frameworks
- [Antoine Sauvinet: Build vs Buy in 2026 -- The Paradigm Has Shifted](https://oinant.com/en/posts/2026-01-05-build-vs-buy-2026/)
- [Inkeep: Build vs Buy AI Support Decision Framework for 2026](https://inkeep.com/blog/build-vs-buy-ai-support-decision-framework-for-2026)
- [AppInventiv: Build vs Buy Software in 2026](https://appinventiv.com/blog/build-vs-buy-software/)

### IndyDevDan and Pi Agent
- [Dan Disler GitHub](https://github.com/disler)
- [Pi vs Claude Code Comparison](https://github.com/disler/pi-vs-claude-code)
- [Agentic Engineer: Tactical Agentic Coding](https://agenticengineer.com/tactical-agentic-coding)

### Second System Effect
- [The Mythical Man-Month -- Wikipedia](https://en.wikipedia.org/wiki/The_Mythical_Man-Month)
- [Beware the Second System Effect](https://robertgreiner.com/the-second-system-effect/)

### Internal Research Documents
- Phase 2 Landscape Overview: `research/2026-03-05_PHASE2_landscape_overview.md`
- Bleeding Edge Frontier Synthesis: `research/2026-03-05_PHASE2_SYNTHESIS_bleeding-edge.md`
- Elvis Sun Analysis: `research/2026-03-05_elvis-sun-orchestrator-analysis.md`
- IndyDevDan Strategic Vision: `research/2026-03-05_indydevdan-strategic-vision-analysis.md`
