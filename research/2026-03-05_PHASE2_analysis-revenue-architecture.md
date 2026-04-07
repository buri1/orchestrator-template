# Phase 2 Analysis: Revenue Architecture for Agent-Delivered Work

**Date:** 2026-03-05
**Analysis Agent Domain:** Revenue Architecture
**Core Question:** How to architect agents that autonomously deliver contracts/value -- cost models, margins, pricing strategies for agent-delivered work.
**Phase 1 Basis:** 76 research documents, 5 synthesis reports, 1 landscape overview
**Philosophical Lens:** IndyDevDan -- "Knowing is engineering; not knowing is vibe coding"

---

## Executive Summary

Burak has already proven the hypothesis: $50K in one week with the L-Thread Orchestrator MVP running on Claude Max. The question is no longer "can agents deliver contracts?" but "what is the economic architecture that scales this from $50K/week to $500K/week to $5M/month -- and at what point does it become self-sustaining?"

Phase 1 research reveals a landscape where the economics of agent-delivered work are known by very few and published by almost nobody. Elvis Sun's $190/month for 3-5-person-equivalent output is the clearest solo-builder data point. Stripe's 1,300 PRs/week proves enterprise viability but discloses no cost data. VoxYZ's 6 agents producing a $75K consulting package in 3 hours on an $8/month VPS is the most provocative margin signal. Yet no one has published a rigorous cost model for delivering client contracts via agent orchestration. That gap is the opportunity -- and the danger.

The 25 research questions below are designed to close this gap. They target the specific unknowns that stand between Burak's current MVP success and a scalable, autonomous revenue engine. Every question applies IndyDevDan's lens: demand evidence, measure before scaling, build trust through transparency, and engineer with exponentials -- not linear hours.

---

## Research Questions

### TIER 1: CRITICAL -- Agent Economics at Scale (Questions 1-7)

These questions address the foundational cost/revenue math. Without answers here, scaling is gambling.

---

**Question 1: What is the actual fully-loaded cost to deliver a $10K software contract with an agent orchestrator?**

**Rationale:** Burak's $50K week proves revenue. But we have no published cost breakdown for agent-delivered contract work. Elvis Sun spends $190/month for his SaaS operations. Stripe does not disclose costs. Gas Town burns $2K-$5K/month in API alone. The critical unknown is: what does it cost to deliver a specific contract size ($5K, $10K, $25K, $50K) including API tokens, infrastructure, QA time, human review time, revision cycles, and client communication? Without this number, margin is unknown and pricing is intuition.

**Search Strategy:**
- Search for "AI agent contract delivery cost breakdown" + "agent-delivered software cost model"
- Search for agency/freelancer communities discussing agent cost economics (Twitter/X threads, Substack, Discord)
- Look for SaaS builders (like Elvis Sun) who have published detailed cost breakdowns
- Search for consulting firms that have published agent augmentation ROI data
- Look at Devin, Factory AI, and other agent-as-a-service companies for pricing signals

**Priority:** P0 -- Without this, everything else is speculation.

---

**Question 2: What are the real-world margins for different types of agent-delivered work, and how do they compare to traditional dev agency margins?**

**Rationale:** Traditional dev agencies operate at 30-60% gross margins. If agent orchestration achieves 80-95% margins (as the $190/month-for-$50K-output math suggests), this changes every pricing and scaling decision. But margins vary dramatically by project type: a CRUD app with known patterns will have different agent success rates (and thus margins) than a complex system integration or greenfield architecture. Phase 1 found that agents excel at "well-scoped, clearly described" tasks (Stripe) and struggle with "ambiguous requirements, cross-cutting architecture" (Stripe limitations). The margin map by project type is the key to client selection.

**Search Strategy:**
- Search for "AI agency margins" + "agent-delivered software margins"
- Look for Devin, Cosine/Genie, Factory AI case studies with pricing
- Search for traditional agency margin benchmarks to establish baseline
- Look for consulting reports on AI augmentation ROI (McKinsey, BCG, Deloitte 2025-2026 reports)
- Find developers/agencies publicly sharing revenue vs. cost data with agent tools

**Priority:** P0

---

**Question 3: How do API/compute costs scale non-linearly as you move from 1 to 5 to 20 to 50 concurrent agent sessions delivering work?**

**Rationale:** Phase 1 found that "Agent Teams multiply cost ~4x due to separate context windows" and that a single Gas Town session costs ~$100/hour in tokens. Elvis Sun manages costs at $190/month because he routes carefully (Codex for backend, Claude for frontend, Gemini for design). The critical question for scaling is: does cost scale linearly with agents (good -- predictable), sub-linearly (great -- economies of scale), or super-linearly (dangerous -- hidden cost traps at scale)? Memory pressure was Elvis's binding constraint (4-5 agents on Mac Mini). Token costs compound with context accumulation. Infrastructure costs have step functions (new server needed at N agents). We need the real curve.

**Search Strategy:**
- Search for "multi-agent system cost scaling" + "LLM token cost at scale"
- Look for cloud cost optimization posts from teams running large agent fleets
- Search for Anthropic/OpenAI enterprise pricing tiers and volume discounts
- Find benchmarks on Context-Gateway compression ratios at scale (does 200x hold?)
- Look for data on Claude Max / Claude Team subscription cost-effectiveness vs. API at different volumes

**Priority:** P0

---

**Question 4: What is the token-cost-per-deliverable for common contract deliverable types (landing page, API, full-stack app, mobile app, data pipeline, migration)?**

**Rationale:** IndyDevDan's principle: "knowing is engineering." To price contracts scientifically, you need a cost-per-deliverable database. Phase 1 gives us averages ($6/developer-day, 90% below $12/day) but no per-deliverable breakdown. If a landing page costs $3 in tokens and sells for $2,000, that is a different business than a data migration that costs $500 in tokens and sells for $5,000. This data determines which contracts to pursue and which to decline.

**Search Strategy:**
- Search for "Claude Code token usage by project type" + "AI coding agent cost per feature"
- Look for benchmarking posts from developers tracking token usage per project
- Search for SWE-bench cost data (cost per resolved issue by complexity)
- Find agency operators sharing per-project cost data on Twitter/X
- Look at Cursor, Windsurf, and Codex usage reports for cost-per-feature patterns

**Priority:** P0

---

**Question 5: What does the Claude Max subscription ceiling look like, and when does API billing become more economical than subscription?**

**Rationale:** Burak's current model runs on Claude Max -- a flat subscription that provides extraordinary value (one user reported $5,623 API-equivalent for $100-200/month). But flat subscriptions have hidden ceilings: rate limits, throttling during peak usage, and usage-based tiers that Anthropic may introduce. The $50K/week result needs to be stress-tested against subscription limits. At what point does the orchestrator's token consumption exceed what Max provides? When should the architecture shift to API billing with model routing?

**Search Strategy:**
- Search for "Claude Max rate limits 2026" + "Claude Max throttling" + "Claude Code usage limits"
- Look for developers hitting Claude Max ceilings and discussing workarounds
- Search for Anthropic pricing changes and enterprise tier details
- Find comparisons of Claude Max vs. API billing at different usage levels
- Look for discussions of Claude Team plan economics for multi-agent workflows

**Priority:** P0

---

**Question 6: What model routing strategies maximize margin -- and what is the measured quality delta between Opus/Sonnet/Haiku for contract deliverables?**

**Rationale:** Phase 1 found that Elvis Sun routes by task type (Codex ~90% backend, Claude for frontend, Gemini for design). Stripe curates 15 tools from 400. The custom-harness-economics doc shows Sonnet 4.6 "matches Opus-level coding at one-fifth the cost." But for revenue-critical contract work, quality differences matter: if Sonnet produces code that requires 2x more human review than Opus, the review cost may exceed the token savings. We need measured data on quality-adjusted cost per model, not just raw token pricing.

**Search Strategy:**
- Search for "Claude Opus vs Sonnet coding quality comparison 2026"
- Look for benchmarks comparing models on real-world task completion (not just SWE-bench)
- Find developers sharing A/B test results of model routing strategies
- Search for "model routing cost optimization agents" + quality metrics
- Look for Langfuse/LangSmith published cost-per-quality analyses

**Priority:** P1

---

**Question 7: What are the infrastructure cost step-functions as you scale (single machine to cluster, free tiers to paid, hobby to enterprise)?**

**Rationale:** Phase 1 maps the cost landscape: solo ($120-400/month), production ($2K-8K/month). Elvis started on a Mac Mini ($600), upgraded to a Mac Studio ($5K). The tools landscape synthesis shows free tiers for most SaaS (Langfuse, CodeRabbit, Graphite, PostHog). But these free tiers have limits. When delivering contracts at scale, you will hit: GitHub Actions limits, E2B sandbox limits, Langfuse trace limits, and hardware RAM limits. Each creates a cost step-function. We need the staircase mapped.

**Search Strategy:**
- Search for "AI agent infrastructure costs at scale" + "developer tools free tier limits 2026"
- Look for VPS cost optimization for agent workloads (Hetzner, DigitalOcean, Fly.io)
- Find data on GitHub Actions / CI cost at high PR volumes
- Search for E2B, Daytona pricing tiers and real-world usage costs
- Look for comparisons of cloud vs. local hardware economics for agent fleets

**Priority:** P1

---

### TIER 2: STRATEGIC -- Pricing Models and Client Trust (Questions 8-14)

These questions address how to position, price, and guarantee agent-delivered work.

---

**Question 8: How do existing agent-as-a-service companies (Devin, Factory AI, Cosine/Genie, Augment, Poolside) price their offerings, and what do clients actually pay?**

**Rationale:** These companies represent the competitive landscape. Devin launched at $500/month (individual), Factory AI targets enterprise, Cosine/Genie targets code generation as a service. Their pricing reveals what the market will bear. But their pricing also reveals their cost structure -- if Devin charges $500/month and provides roughly 100 engineering hours equivalent, their implied cost per hour is knowable. This competitive intelligence directly informs Burak's pricing strategy.

**Search Strategy:**
- Search for "Devin pricing 2026" + "Factory AI pricing" + "Cosine Genie pricing"
- Look for enterprise procurement discussions of agent-as-a-service contracts
- Search for Augment Code, Poolside AI, and Codium (QodoAI) pricing
- Find client reviews/testimonials discussing value vs. cost
- Look for Conductor (YC S24), Terminal Use pricing models

**Priority:** P0

---

**Question 9: What pricing models work for agent-delivered contract work: per-hour, per-feature, per-sprint, value-based, outcome-based, or retainer?**

**Rationale:** The traditional freelance/agency pricing models (per-hour, per-project, retainer) were designed for human labor. Agent-delivered work breaks these models: a "100-hour project" might take 2 hours of agent time and 3 hours of human review. Per-hour pricing would mean charging $5K for 5 hours of human time -- hard to justify even if the deliverable is identical. Value-based pricing (charge based on value delivered, not time spent) is the obvious answer, but it requires a different sales conversation. We need evidence on what pricing models agent-delivery companies are actually using and what clients accept.

**Search Strategy:**
- Search for "AI agency pricing model" + "agent-delivered work pricing strategy"
- Look for agency owners sharing pricing pivots after adopting AI agents
- Search for "value-based pricing software development 2026"
- Find discussions of pricing transparency when using AI agents (ethical debates)
- Look for SaaS pricing models that could apply (usage-based, outcome-based)

**Priority:** P0

---

**Question 10: How do clients perceive and value agent-delivered work -- is there a discount or premium, and how should it be positioned?**

**Rationale:** IndyDevDan's "Year of Trust 2026" principle applies here. If a client learns their $50K contract was delivered largely by AI agents, do they feel cheated (discount) or impressed (premium)? Early signals are mixed: some clients see AI-delivered work as lower quality; others see it as faster and more thorough (multi-model review, comprehensive testing). VoxYZ positions it as "6 AI agents run my business" -- transparency as a selling point. Elvis Sun documents publicly. But for B2B contracts, the dynamics may differ. We need evidence on client perception and positioning strategies.

**Search Strategy:**
- Search for "client perception AI generated code" + "AI delivered software client trust"
- Look for agency owners discussing client reactions to AI-assisted delivery
- Search for surveys on business attitudes toward AI-delivered software (Gartner, Forrester, McKinsey)
- Find ethical framework discussions on AI disclosure in professional services
- Look for positioning strategies used by AI-first agencies (transparency vs. stealth)

**Priority:** P1

---

**Question 11: What quality guarantee and liability frameworks exist for agent-delivered work, and what happens when agents produce buggy code that costs clients money?**

**Rationale:** Phase 1 found that "AI-authored code introduces 1.75x more logic errors and 2.74x more XSS vulnerabilities than human-written code" (CodeRabbit). Stripe mitigates this with sandboxes and human review. But for contract delivery, the liability question is real: if an agent produces a security vulnerability that leads to a data breach, who is liable -- the orchestrator operator, the model provider, or the client who accepted the deliverable? Traditional agencies carry E&O insurance. How does agent-delivered work change the insurance and liability landscape?

**Search Strategy:**
- Search for "AI generated code liability" + "AI software delivery liability framework"
- Look for legal analysis of AI-delivered professional services liability
- Search for E&O insurance changes for AI-augmented agencies
- Find contract clause examples for AI-delivered software (indemnification, warranty)
- Look for case studies of AI-generated bugs causing client harm and outcomes

**Priority:** P1

---

**Question 12: What quality assurance pipeline produces client-grade deliverables, and what is the human review cost as a percentage of total delivery cost?**

**Rationale:** Elvis Sun's definition of done: CI passes, multi-model review, screenshots for UI. Stripe: max 2 CI rounds, then escalate. The L-Thread Orchestrator: E2E testing gate via Chrome DevTools MCP. But for paying clients, the bar is higher: the code must not just work, it must be maintainable, secure, well-documented, and aligned with the client's existing codebase conventions. Human review is the final gate, and its cost determines the effective margin. If human review takes 30 minutes per agent-hour, the effective cost model changes dramatically from "agents are nearly free."

**Search Strategy:**
- Search for "AI code review time cost" + "human review agent generated code"
- Look for studies on review time for AI-generated vs. human-written code
- Search for quality pipelines used by AI-first development agencies
- Find data on CodeRabbit/GitHub Copilot review effectiveness and time savings
- Look for multi-model review patterns and their cost/benefit data

**Priority:** P1

---

**Question 13: How should contracts be structured to protect against agent failure modes (context exhaustion, hallucination, scope drift)?**

**Rationale:** Phase 1 identified specific agent failure modes: context exhaustion (agent loses track of requirements as context fills), hallucination (agent claims completion when work is incomplete or wrong), scope drift (agent solves a different problem than requested), and the "17x error trap" (multi-agent systems without bounds produce 17x more errors). For contract delivery, each failure mode has a cost: rework, client dissatisfaction, reputation damage. Contract structure (milestone-based delivery, acceptance criteria, revision caps) can mitigate these risks. We need evidence on contract structures that account for agent-specific failure modes.

**Search Strategy:**
- Search for "AI agent failure modes contract mitigation"
- Look for freelancer/agency contract templates adapted for AI delivery
- Search for milestone-based delivery patterns for AI-augmented projects
- Find discussions of acceptance criteria for AI-generated deliverables
- Look for SLA/SLO frameworks adapted for agent-delivered work

**Priority:** P1

---

**Question 14: What is the trust-building playbook for getting enterprise clients to accept agent-delivered work?**

**Rationale:** IndyDevDan: "Year of Trust 2026 -- do you trust your agents?" The same question applies to clients: do they trust your agents? Stripe's engineers trust Minions because they see the PRs, review the diffs, and run the tests. Elvis's Zoe builds trust through multi-model review and CI gates. For Burak's contract delivery, the trust chain extends to the client. What artifacts, processes, and transparency mechanisms build client trust? Observability dashboards, detailed commit histories, automated test reports, multi-model review certificates?

**Search Strategy:**
- Search for "building client trust AI software delivery"
- Look for enterprise procurement criteria for AI-augmented development services
- Search for SOC 2, ISO 27001 implications of agent-delivered work
- Find transparency/observability patterns used by AI-first agencies
- Look for Stripe's internal trust-building process for Minions adoption

**Priority:** P1

---

### TIER 3: FRONTIER -- Autonomous Revenue Streams and Scaling (Questions 15-22)

These questions explore the frontier: revenue models that scale with compute, not hours.

---

**Question 15: What autonomous, recurring revenue models can agents sustain without per-contract human sales effort?**

**Rationale:** Contract delivery requires human sales effort per deal. The exponential play is revenue that scales with compute: SaaS products built and maintained by agents, automated code review as a service, continuous security testing, automated dependency updating, codebase modernization subscriptions. Elvis Sun's SaaS is the proof-of-concept: Zoe maintains the product, handles customer support, generates content -- all while Elvis pushes a stroller. What other autonomous revenue models have been validated?

**Search Strategy:**
- Search for "autonomous AI revenue models 2026" + "AI agent recurring revenue"
- Look for SaaS builders using agents for autonomous product maintenance
- Search for "automated code review as a service" + "AI bug bounty"
- Find examples of agent-maintained open-source projects with commercial models
- Look for Bankrbot's self-funding loop analogy in software services

**Priority:** P0

---

**Question 16: What is the ROI curve for adding agents -- at what point do diminishing returns set in, and what is the optimal team size per orchestrator?**

**Rationale:** Phase 1 found: hub-and-spoke for 2-7 agents, team leads for 7+. Stripe scales to hundreds but with massive infrastructure. Elvis operates at 4-5 concurrent. The 17x error trap suggests unbounded scaling is dangerous. But where exactly is the sweet spot? If adding a 6th agent increases output by 20% but costs increase by 40%, the marginal ROI is negative. We need empirical data on the diminishing returns curve for multi-agent coding orchestration.

**Search Strategy:**
- Search for "multi-agent coding system optimal size" + "agent team scaling diminishing returns"
- Look for academic papers on multi-agent system performance vs. team size
- Find practitioners sharing data on agent fleet size vs. output quality
- Search for coordination overhead measurements in multi-agent coding systems
- Look for Stripe's data on minion scaling (1,000 to 1,300+ PRs/week -- what was added?)

**Priority:** P1

---

**Question 17: Can agents deliver ongoing SaaS maintenance contracts autonomously, and what does the cost/revenue model look like?**

**Rationale:** Maintenance contracts are the holy grail of agency revenue: predictable, recurring, and (for humans) boring. For agents, "boring" is ideal -- well-scoped, repetitive, pattern-matched. A maintenance contract might include: bug fixes from Sentry alerts, dependency updates, performance monitoring, feature requests. Zoe already does this for Elvis. Can this be packaged as a service? What would clients pay for "autonomous SaaS maintenance" -- $500/month? $2,000/month? $10,000/month? What are the real costs?

**Search Strategy:**
- Search for "AI automated maintenance contract" + "agent SaaS maintenance service"
- Look for DevOps/SRE services being automated by agents
- Search for managed services pricing for application maintenance
- Find examples of Sentry-to-fix automation pipelines in production
- Look for Mendral's CI/CD agent pattern as maintenance automation

**Priority:** P1

---

**Question 18: What is the viable market for "agent orchestration as a service" -- selling the orchestrator capability itself rather than its output?**

**Rationale:** There are two businesses here: (1) using agents to deliver contracts (Burak's current model), and (2) selling the orchestration capability to other agencies/developers. Phase 1 found: the "orchestration layer is the asset, not the runtime." Conductor (YC S24) charges for agent orchestration. Terminal Use charges for agent hosting. The question is: which is a bigger business -- selling fish or selling fishing rods? At what point does the orchestrator itself become the product?

**Search Strategy:**
- Search for "agent orchestration platform pricing" + "coding agent platform business model"
- Look at Conductor, 1Code, Terminal Use revenue models
- Search for platform vs. services business model analysis in AI
- Find data on developer tools market size for agent orchestration
- Look for "picks and shovels" business model analysis in the AI agent space

**Priority:** P2

---

**Question 19: How do white-label or agency-in-a-box models work for agent-delivered services?**

**Rationale:** If the orchestrator can deliver $50K contracts, it can potentially be licensed to other agencies who want the same capability. White-label models (your orchestrator, their brand) or franchise models (your playbook, their execution) could create exponential revenue without linear scaling of Burak's time. Phase 1 found that "35% of enterprises have replaced SaaS tools with custom builds" (Retool 2026). The question is: would agencies pay for a pre-built agent orchestration capability?

**Search Strategy:**
- Search for "white label AI development agency" + "agent agency in a box"
- Look for franchise/license models in traditional dev agencies
- Search for platform plays in the AI services space
- Find examples of orchestration toolkits sold to other practitioners
- Look for the emerging "AI agency" category and its business models

**Priority:** P2

---

**Question 20: What are the economics of the "agent + human review" delivery model vs. pure human delivery for standardized deliverables (landing pages, MVPs, integrations)?**

**Rationale:** For standardized deliverables, the cost comparison is straightforward. A landing page delivered by a human costs $X (market rate: $3K-$15K). The same landing page delivered by agents + human review costs $Y. If Y < 0.2X, the margin is extraordinary. But the comparison must include: client communication time, revision cycles, edge case handling, and the probability of rework. We need real data from practitioners who have delivered the same type of project both ways.

**Search Strategy:**
- Search for "AI vs human software development cost comparison 2026"
- Look for A/B studies of AI-assisted vs. traditional project delivery
- Search for standardized deliverable pricing (landing pages, MVPs, APIs)
- Find agency owners who have published before/after cost data with AI agents
- Look for Upwork/Fiverr pricing trends for AI-augmented deliverables

**Priority:** P1

---

**Question 21: What does the revenue timeline look like from "first agent-delivered contract" to "self-sustaining agent business" -- what are the real milestones?**

**Rationale:** Burak is at the "$50K in first week" milestone. Elvis went from first commit to $420 MRR + $3,600/month client in ~30 days. VoxYZ went from "agents can talk" to "agents run the business" in two weeks. But these are cherry-picked success stories. What does the realistic timeline look like for building a sustainable agent-delivery business? What are the common failure points? When do most people give up? What separates the ones who scale from the ones who stall?

**Search Strategy:**
- Search for "AI agency growth timeline" + "agent business scaling milestones"
- Look for indie hacker / solopreneur case studies of agent-powered businesses
- Search for agency growth frameworks adapted for AI augmentation
- Find failure case studies of agent delivery businesses (what went wrong)
- Look for community discussions on scaling AI-powered freelancing

**Priority:** P1

---

**Question 22: At what revenue level does it make sense to shift from Claude Max subscription to enterprise API agreements, and what do those agreements look like?**

**Rationale:** Claude Max at $200/month provides extraordinary value for current scale. But at $500K/month revenue, the API usage may exceed subscription limits. Anthropic offers enterprise agreements, priority access, and dedicated capacity. OpenAI has similar enterprise tiers. At what revenue level does the shift from consumer subscription to enterprise agreement become necessary? What do those agreements look like? What negotiating leverage does a heavy user have?

**Search Strategy:**
- Search for "Anthropic enterprise pricing 2026" + "Claude enterprise agreement"
- Look for enterprise AI API pricing negotiations and benchmarks
- Search for volume discount structures at major LLM providers
- Find data on when companies shift from consumer to enterprise AI plans
- Look for OpenAI, Google, and Anthropic enterprise case studies

**Priority:** P2

---

### TIER 4: META -- The Business Architecture Itself (Questions 23-25)

These questions address the meta-structure: how to architect the business around the agents.

---

**Question 23: What legal/business structures optimize for agent-delivered revenue (LLC, agency, SaaS, marketplace)?**

**Rationale:** The business structure determines tax treatment, liability exposure, scalability, and exit optionality. A freelancer using agents is different from an agency employing agents is different from a SaaS product maintained by agents is different from a marketplace connecting agents to clients. Each structure has different liability profiles (especially given the AI code quality risks from Phase 1), tax implications, and scaling characteristics. We need analysis of which structures other agent-first businesses are using.

**Search Strategy:**
- Search for "AI agency business structure legal" + "agent business entity type"
- Look for legal analysis of AI-first service businesses
- Search for tax optimization for AI-augmented professional services
- Find business structure comparisons for AI delivery companies
- Look for IP ownership analysis when agents generate deliverables

**Priority:** P2

---

**Question 24: What does the competitive landscape look like for agent-delivered contract work in 6-12 months, and how fast is the margin compression?**

**Rationale:** IndyDevDan's "engineering with exponentials" principle applies to competitors too. If the $50K/week margin exists because few people can orchestrate agents effectively today, that advantage erodes as tools improve and more people learn. Phase 1 found: "Agent harnesses are getting simpler, frameworks are getting thinner." If agent orchestration becomes commodity, margins compress toward traditional agency levels. The question is: how fast, and what creates durable differentiation?

**Search Strategy:**
- Search for "AI development agency competition 2026" + "agent delivery margin compression"
- Look for market analysis of the AI services sector growth and competition
- Search for "AI commoditization software development" forecasts
- Find data on the rate of AI agent adoption among freelancers/agencies
- Look for moat analysis of agent orchestration businesses

**Priority:** P1

---

**Question 25: How do you build a revenue architecture with "progressive deletability" -- one that simplifies as models improve rather than requiring more complexity?**

**Rationale:** This is the IndyDevDan principle applied to business architecture. As models improve, the orchestration layer should shrink. Applied to revenue: as models improve, delivery costs should decrease, margins should increase, and complexity should reduce. But many agent businesses are building increasingly complex infrastructure that creates its own maintenance burden. The question is: what revenue architecture gets simpler over time? What business model benefits most from model improvement? The answer likely involves: value-based pricing (your price stays the same while costs drop), standardized deliverables (agents get better at repeatable work), and productized services (the "service as SaaS" model).

**Search Strategy:**
- Search for "AI business model future proofing" + "progressive deletability business"
- Look for business model analysis of declining AI costs on service margins
- Search for "productized service AI" + "service as SaaS" models
- Find examples of businesses that have benefited from AI cost curves
- Look for economic analysis of AI deflation on professional services

**Priority:** P1

---

## Priority Ranking Summary

### P0 -- Research Immediately (7 questions)
| # | Question | Why Critical |
|---|----------|-------------|
| 1 | Fully-loaded cost per $10K contract | Cannot price without knowing cost |
| 2 | Margins by project type | Determines which contracts to pursue |
| 3 | Cost scaling curve (1 to 50 agents) | Determines if scaling is viable |
| 4 | Token cost per deliverable type | Enables scientific pricing |
| 5 | Claude Max ceiling and API crossover | Protects current business model |
| 8 | Competitor pricing (Devin, Factory AI, etc.) | Market positioning intelligence |
| 9 | Pricing model for agent-delivered work | Directly determines revenue |
| 15 | Autonomous recurring revenue models | The exponential play |

### P1 -- Research in Wave 2 (11 questions)
| # | Question | Why Important |
|---|----------|-------------|
| 6 | Model routing quality-adjusted economics | Optimizes margin |
| 7 | Infrastructure cost step-functions | Prevents cost surprises |
| 10 | Client perception of agent-delivered work | Informs positioning |
| 11 | Liability frameworks for agent-delivered code | Protects against downside |
| 12 | QA pipeline and human review cost percentage | Refines margin model |
| 13 | Contract structures for agent failure modes | Risk mitigation |
| 14 | Enterprise trust-building playbook | Enables upmarket move |
| 16 | ROI curve and optimal agent team size | Prevents over-scaling |
| 17 | Autonomous SaaS maintenance economics | Recurring revenue validation |
| 20 | Agent vs. human cost for standardized deliverables | Competitive pricing data |
| 21 | Revenue timeline milestones | Realistic planning |
| 24 | Competitive landscape and margin compression speed | Strategic positioning |
| 25 | Progressive deletability in revenue architecture | Future-proofing |

### P2 -- Research in Wave 3 (4 questions)
| # | Question | Why Later |
|---|----------|----------|
| 18 | Market for orchestration-as-a-service | Second-order business model |
| 19 | White-label / agency-in-a-box models | Requires proven model first |
| 22 | Enterprise API agreement timing | Only relevant at higher scale |
| 23 | Legal/business structure optimization | Operational, not strategic |

---

## Cross-Domain Dependencies

These questions connect to other Phase 2 analysis domains:

| Revenue Question | Depends On |
|---|---|
| Q1 (cost per contract) | **Scaling Bottlenecks** -- infrastructure cost data |
| Q3 (cost scaling curve) | **Scaling Bottlenecks** -- what breaks at 10x/100x |
| Q10 (client perception) | **Vision Feasibility** -- can a single human run this? |
| Q11 (liability) | **Harness Mastery** -- security and quality patterns |
| Q14 (enterprise trust) | **Vision Feasibility** -- trust thesis from IndyDevDan |
| Q24 (competitive landscape) | **Bleeding Edge Frontier** -- truly novel patterns as moat |
| Q25 (progressive deletability) | **Scaling Bottlenecks** -- what simplifies as models improve |

---

## The IndyDevDan Lens: Summary of How It Shapes These Questions

Every question in this analysis is filtered through Dan's framework:

1. **"Knowing is engineering; not knowing is vibe coding"** -- We demand measured economics (Q1-Q7), not vibes about how cheap agents are. We want real cost breakdowns, real margin data, real scaling curves.

2. **Context/Prompt/Model triad** -- Context engineering is not just a technical investment; it is the highest-leverage revenue lever (Q6, Q12). Better context = fewer retries = lower cost = higher margin.

3. **"Year of Trust 2026"** -- Client trust is not a soft skill; it is a revenue architecture component (Q10, Q11, Q13, Q14). Without trust, the pipeline dries up regardless of technical capability.

4. **Observability before scale** -- You cannot price what you cannot measure (Q1, Q4). Langfuse cost tracking, per-agent metrics, and per-deliverable cost data are prerequisites to scaling.

5. **Three-tier progression** -- Revenue architecture should follow the same tiers: reliable delivery (Tier 1) before intelligent routing (Tier 2) before autonomous revenue (Tier 3). Questions are ordered accordingly.

6. **Engineering with exponentials** -- Revenue should scale with compute, not linearly with hours (Q15, Q17, Q18). The exponential play is autonomous recurring revenue, not bigger contracts.

7. **"Tools shape what you believe is possible"** -- The orchestrator IS the business model (Q18, Q19). Building it creates capabilities that buying cannot match.

8. **Progressive deletability** -- The revenue architecture should simplify as models improve (Q25). Price on value, not cost. Let the cost curve work in your favor.

---

*25 research questions. 76 source documents absorbed. IndyDevDan's lens applied throughout. Ready for Phase 2 research agent deployment.*
