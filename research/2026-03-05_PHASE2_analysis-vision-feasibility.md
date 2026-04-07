# Phase 2 Analysis: Vision Feasibility

**Date:** 2026-03-05
**Domain:** Can a single human build a self-sustaining, autonomous, ROI-positive multi-agent system?
**Analyst lens:** IndyDevDan's philosophical framework (Context/Prompt/Model, Trust-through-observability, Engineering with exponentials, Progressive deletability)
**Basis:** 73 Phase 1 research documents, 5 synthesis reports, 1 landscape overview

---

## Executive Summary

Phase 1 research produced one existence proof (Elvis Sun: solo founder, $50K+ revenue trajectory, 94 commits/day, Karpathy-endorsed) and one enterprise proof (Stripe Minions: 1,300+ agent PRs/week, hundreds of millions of lines of code). Both validate the core pattern: a non-coding orchestrator delegates to isolated agents through deterministic gates. But the gap between "it works for Elvis" and "it works as a self-sustaining business at $500K/week" is enormous and under-examined.

Applying IndyDevDan's framework -- "knowing is engineering; not knowing is vibe coding" -- reveals that Phase 1 established the *architecture* but left five critical domains in the realm of not-knowing:

1. **Replicability**: Elvis is N=1. No systematic study of failure rates for solo agent-swarm founders exists.
2. **Revenue mechanics**: Agent output and billable revenue are not the same thing. The conversion path is undocumented.
3. **Trust ceiling**: At what scale does human oversight become the bottleneck that defeats the purpose?
4. **Fragility**: The entire stack depends on model APIs, pricing, and capabilities that change monthly.
5. **Legal/liability**: Who is responsible when an autonomous agent ships a security vulnerability to a client?

Phase 2 research must convert these unknowns into knowns. The 22 research questions below are designed to be answerable through web search, public case studies, and documented evidence -- not speculation. Each question targets a specific gap where "not knowing" creates business risk.

---

## The IndyDevDan Framework Applied

Before the questions, the analytical framework that generated them:

**"Knowing is engineering; not knowing is vibe coding."** Phase 1 gave us architecture patterns. Phase 2 must give us operational evidence. Every question below demands documented proof, not theory.

**Context/Prompt/Model triad -- context is highest leverage.** The most dangerous unknown is not "which model to use" but "what context does the orchestrator need to make good delegation decisions at scale?" Revenue context, legal context, client relationship context -- these are the bottlenecks Phase 1 did not address.

**"Year of Trust 2026" -- trust is earned through observability.** Elvis trusts Zoe because he built her and can see what she does. But can a *client* trust agent-produced work? Can a *regulator*? Trust has layers, and the outer layers (beyond the builder) are unexplored.

**Observability before scale.** Burak made $50K in one week. The temptation is to scale immediately. Dan would say: instrument first. Measure the failure rate, the rework rate, the cost-per-deliverable. Then scale what is measured.

**Three-tier progression: reliable harness, intelligent orchestration, meta-agency.** Phase 1 established Tier 1 (reliable harness). Phase 2 questions probe whether Tier 2 (intelligent orchestration) and Tier 3 (meta-agency / self-sustaining systems) are achievable today or still theoretical.

**Engineering with exponentials -- value scales with compute harnessed.** The core bet: if each model generation is 2-3x more capable, a well-designed orchestrator compounds that improvement across every project. But this is a bet, not a fact. What evidence exists that orchestrator ROI actually compounds with model improvements?

**Progressive deletability.** If the orchestration layer keeps getting more complex as you scale, something is wrong. The questions below probe whether scaling autonomous revenue requires more infrastructure or less.

---

## Research Questions

### TIER 1: What Is Actually Proven vs. Theoretical? (Questions 1-6)

#### Q1. Beyond Elvis Sun, who else is running a solo or micro-team business primarily through autonomous agent swarms, with documented revenue?

**Rationale:** Elvis is the only well-documented case of a solo founder running a revenue-generating business through an AI agent swarm. N=1 is not a pattern -- it is an anecdote. IndyDevDan's framework demands evidence: "knowing is engineering." Phase 2 must find additional existence proofs or document their absence. If Elvis is truly unique, that itself is a critical finding -- it suggests the pattern may require a rare combination of skills, temperament, and luck.

**Search strategy:** Search for "solo founder AI agent swarm revenue 2026", "one person SaaS AI agents", "autonomous coding agents business revenue", Twitter/X threads about agent-powered businesses generating revenue, Indie Hackers or HackerNews posts about autonomous agent businesses. Search specifically for people who followed Elvis's pattern after his viral moment. Look for counter-examples: people who tried and failed.

**Priority:** P0 -- This is the foundational question. If the pattern is not replicable, the entire vision needs recalibration.

---

#### Q2. What are the documented failure modes of autonomous agent systems in production? Specifically: what percentage of agent-produced work requires human rework, and what is the rework cost?

**Rationale:** Phase 1 documented success metrics (Elvis: 94 commits/day; Stripe: 1,300 PRs/week) but not failure metrics. CodeRabbit found that AI-authored code introduces 1.75x more logic errors and 2.74x more XSS vulnerabilities than human-written code. Stripe enforces a 2-round retry cap because additional attempts have diminishing returns. But nobody has published: "of 1,300 PRs, X% required significant rework after merge." IndyDevDan's trust framework requires measurement: you cannot build justified trust without failure rate data.

**Search strategy:** Search for "AI agent production failure rate", "agent-produced code rework statistics 2026", "autonomous coding agent quality metrics", CodeRabbit security analysis of agent code, post-mortems of agent-produced bugs in production, Stripe Minions quality data beyond the blog posts, academic studies on LLM-generated code defect rates. Search for "AI code quality regression" or "agent code technical debt."

**Priority:** P0 -- Without failure rate data, ROI projections are fiction.

---

#### Q3. What is Elvis Sun's actual current revenue, customer count, and churn rate? Has his system sustained performance beyond the initial viral period?

**Rationale:** Elvis documented Days 5-33 publicly. His numbers at Day 33: $420 MRR, 200+ waitlist signups, $1,505 X payout. But Day 33 was approximately February 2026. It is now March 2026. Has he converted the waitlist? Has MRR grown? Has Zoe continued to perform, or did the system hit scaling issues? Phase 1 captured the launch trajectory; Phase 2 needs the sustainability data. "Knowing is engineering" -- we need current numbers, not month-old hype.

**Search strategy:** Search Elvis Sun's latest X/Twitter posts, his blog (elvis.so), any podcast interviews since February 2026, Product Hunt or indie hacker updates. Search for "Elvis Sun PressPulse" or his new SaaS name for actual product reviews or customer feedback. Look for any public metrics he has shared since the viral period.

**Priority:** P0 -- Sustainability is more important than launch velocity.

---

#### Q4. What is the actual cost-per-deliverable for agent-produced contract work, including failed attempts, rework, API costs, and human oversight time?

**Rationale:** Burak made $50K in one week with the L-Thread orchestrator. But what was the fully loaded cost? Phase 1 estimated $120-400/month for API costs at solo scale. But this does not include: time spent writing specs, time reviewing agent output, time fixing agent failures, time managing agent infrastructure, time handling client communication about agent-produced work. The real question is: what is the net margin per deliverable-hour when agents do the work? IndyDevDan would say: "measure the full loop, not just the API bill."

**Search strategy:** Search for "AI agent contract work cost analysis", "freelance AI agent cost per project", "agent-assisted software development economics 2026", any detailed cost breakdowns from developers using agents for client work. Search for "AI coding agent ROI calculator" or "agent productivity real cost." Look for consultants or agencies who have published their agent-augmented billing economics.

**Priority:** P0 -- Revenue without margin analysis is vanity metrics.

---

#### Q5. Has anyone documented a system where agents autonomously acquire and execute contracts without human involvement in the sales/scoping/delivery cycle?

**Rationale:** The ultimate vision is "self-sustaining" -- agents that not only execute work but find work, scope it, price it, deliver it, and collect payment. Elvis's Zoe handles operations (Sentry scanning, customer support, social media) but Elvis still does sales calls and strategic decisions. Paperclip's "zero-human company" concept exists but has no documented revenue. Phase 2 must determine: does fully autonomous revenue generation exist anywhere, or is the vision still theoretical?

**Search strategy:** Search for "autonomous AI company revenue", "zero human company AI agents", "AI agent autonomous business 2026", "Paperclip AI company results", "autonomous software development agency", "AI agents acquiring clients." Search for fully autonomous crypto/trading bots that also handle customer acquisition as a parallel. Look at ElizaOS and Web3 agent economies for any revenue-generating autonomous systems.

**Priority:** P1 -- This determines whether the ceiling is "highly leveraged human" or "truly autonomous system."

---

#### Q6. What evidence exists that orchestrator ROI compounds with model improvements? Do systems built for Claude 3.5 perform proportionally better with Claude 4.6, or do they require redesign?

**Rationale:** The "engineering with exponentials" thesis assumes that a well-designed orchestrator captures more value as models improve. But Phase 1 also documented that Pi v0.35 broke all hooks and custom tools -- model/harness upgrades are disruptive, not additive. Progressive deletability assumes the system gets simpler, but every major model release changes tool-calling behavior, context window semantics, and reasoning patterns. What actually happens to existing orchestrators when models upgrade?

**Search strategy:** Search for "AI agent system model upgrade experience", "Claude 3 to Claude 4 agent migration", "model upgrade orchestrator impact 2026", "agent system backward compatibility model changes." Look for blog posts about upgrading agent systems to new models, especially from people running production agent fleets. Search for "progressive deletability evidence" or "agent infrastructure simplification."

**Priority:** P1 -- This determines whether the orchestrator is a compounding asset or a depreciating one.

---

### TIER 2: Revenue Scaling -- Can $50K/Week Become $500K/Week? (Questions 7-11)

#### Q7. What are the economic models for AI-augmented software agencies? Are there documented cases of agencies scaling revenue through agent leverage rather than headcount?

**Rationale:** Traditional software agencies scale revenue by hiring more developers. Agent-augmented agencies would scale by deploying more agents. The unit economics are fundamentally different: developers have salaries, benefits, and recruitment costs; agents have API costs and infrastructure costs. But does anyone actually run an agency this way? What are the margins? Phase 1 found no documented case of an agent-augmented agency at scale.

**Search strategy:** Search for "AI software agency model 2026", "agent-augmented consulting revenue", "AI development agency scaling", "software agency using AI agents revenue model." Look at consultancies like Thoughtworks, Pivotal alumni, or indie agencies that have publicly discussed agent-augmented delivery. Search for "AI-first agency" or "agent-powered development shop." Look for Upwork or Toptal trends in AI-augmented freelancing.

**Priority:** P0 -- This is the most direct path to $500K/week and the least documented.

---

#### Q8. What are the real-world constraints on parallel agent scaling? At what point do diminishing returns, merge conflicts, context contamination, or coordination overhead cap the number of productive agents?

**Rationale:** Phase 1 established hub-and-spoke for 2-7 agents, team leads for 7+. Elvis runs 4-5 concurrent agents on a Mac Mini (RAM-limited). Gas Town runs 20-30 but at $2K-5K/month and with 100% vibe-coded, unmaintainable infrastructure. Stripe runs hundreds but across thousands of engineers. For a solo operator: what is the maximum number of productive agents before coordination overhead exceeds productivity gains? This is the scaling ceiling question.

**Search strategy:** Search for "maximum concurrent AI agents productivity", "agent scaling diminishing returns", "parallel coding agents limit 2026", "multi-agent coordination overhead research." Look for benchmarks or experiments that measured agent productivity as agent count increases. Search for "agent context contamination at scale" or "merge conflict rate multi-agent coding." Look for academic research on multi-agent system scaling limits.

**Priority:** P0 -- This determines whether the vision is "10x with 10 agents" or "3x with 5 agents and then flat."

---

#### Q9. What pricing models work for agent-produced deliverables? Do clients pay per-feature, per-hour, per-sprint, or value-based? How do they react to knowing work is agent-produced?

**Rationale:** The revenue model matters as much as the technical architecture. If clients expect to pay per-developer-hour, agent leverage creates an ethical tension: billing 40 hours when agents did the work in 4. If clients pay per-feature or value-based, the speed advantage translates to margin without deception. But how do clients actually respond? Phase 1 documented that Elvis closed a 5-figure deal and Zoe drafted the agreement -- but the pricing model was not disclosed.

**Search strategy:** Search for "AI generated software pricing model", "agent produced deliverables billing", "freelance AI coding pricing ethics 2026", "value based pricing AI development." Look for discussions on HackerNews, Reddit, or X about how developers price agent-assisted work. Search for "should I tell clients I use AI agents" or "AI disclosure software consulting." Look for any agencies that have published their AI-augmented pricing strategy.

**Priority:** P1 -- Revenue scaling requires a pricing model that clients accept and that captures agent leverage.

---

#### Q10. What infrastructure is required to run 10-20 parallel agents 24/7 for sustained contract delivery? What are the realistic hardware, networking, and operational costs?

**Rationale:** Elvis runs on a $5K Mac Studio. Phase 1 estimated $120-400/month for solo, $2K-8K/month for production scale. But sustained 24/7 operation for contract delivery requires more: redundant hardware, monitoring, crash recovery, automatic restart, cost alerting, and backup plans for API outages. The infrastructure question is: what does it actually cost to run a reliable agent factory, not just a development experiment?

**Search strategy:** Search for "always-on AI agent infrastructure cost", "running AI agents 24/7 hardware requirements", "agent server production setup 2026", "VPS for AI coding agents." Look for Hetzner, AWS, or GCP pricing for agent workloads. Search for Terminal Use (YC company) pricing and infrastructure specs. Look for blog posts about running Claude Code or similar agents as always-on services.

**Priority:** P1 -- Infrastructure cost is the denominator of the ROI equation.

---

#### Q11. What is the realistic throughput of an agent-augmented solo operator measured in billable deliverables per week? How does this compare to a traditional 5-person dev team?

**Rationale:** Elvis claims 94 commits/day and 50 commits/day sustained. But commits are not billable deliverables. A client pays for features, bug fixes, or milestones -- not git activity. What is the actual conversion rate from agent output to client-accepted deliverables? If a traditional 5-person team delivers 3 features per sprint, how many features does a solo operator with 5 agents deliver? This data does not exist publicly and is the most critical number for the business case.

**Search strategy:** Search for "AI agent productivity vs human team comparison 2026", "agent-produced features per week", "solo developer AI agent output measurement", "agent coding throughput metrics." Look for SWE-bench or similar benchmarks translated to real-world feature delivery. Search for case studies from Conductor, Codex, or similar tools that quantify deliverable throughput. Look for any consulting firms that have published before/after metrics.

**Priority:** P0 -- This is the conversion factor between "impressive demo" and "viable business."

---

### TIER 3: The Trust Ceiling (Questions 12-16)

#### Q12. At what point does human review of agent work become the bottleneck? What is the maximum volume of agent PRs a single human can meaningfully review per day?

**Rationale:** Stripe's 1,300 PRs/week are spread across hundreds of engineers. Elvis reviews output from 4-5 agents. But a solo operator scaling to 10-20 agents will generate far more output than one person can review. IndyDevDan's trust framework says trust is earned through observability -- but observability requires human attention, and attention does not scale. This is the "Dracula Effect" -- the system works until it generates more output than the human can verify, at which point trust collapses.

**Search strategy:** Search for "code review bottleneck AI agents", "human review capacity agent PRs", "maximum code reviews per day developer", "agent output review scaling problem 2026." Look for research on code review throughput (Google published studies on optimal PR review time). Search for "AI review of AI code" -- can agents review each other's work reliably enough to reduce human review load?

**Priority:** P0 -- This is the existential constraint on the vision. If review does not scale, the system is capped.

---

#### Q13. Can multi-agent review (agents reviewing other agents' work) reliably replace human review? What evidence exists for or against this?

**Rationale:** Elvis uses multi-model review (Codex, Claude, Gemini each review PRs). This catches different error classes. But can agent-only review achieve the quality bar clients expect? If yes, the trust ceiling rises dramatically -- agents can produce AND verify work, with human review only for high-stakes decisions. If no, human review remains the bottleneck. Phase 1 documented the pattern but not the evidence for its reliability.

**Search strategy:** Search for "AI code review accuracy 2026", "automated code review replace human review", "multi-model code review quality", "CodeRabbit vs human reviewer accuracy", "agent review reliability study." Look for A/B studies comparing human-reviewed vs. agent-reviewed code in production. Search for "AI reviewer false negative rate" -- how often do AI reviewers miss bugs that humans would catch?

**Priority:** P0 -- This determines whether the trust ceiling is "human attention" or "multi-agent verification."

---

#### Q14. How do enterprises and clients perceive agent-produced code? Are there documented cases of client pushback, contract disputes, or trust issues related to AI-generated deliverables?

**Rationale:** Technical feasibility is only half the equation. Client acceptance determines whether the business model works. Some clients may refuse agent-produced work on principle. Others may demand disclosure. Some may expect lower prices ("if AI did it, why am I paying developer rates?"). Phase 1 focused on the builder's perspective; Phase 2 must investigate the buyer's perspective.

**Search strategy:** Search for "client reaction AI generated code 2026", "enterprise AI code acceptance policy", "AI disclosure requirements software contracts", "client pushback AI development." Look for legal discussions about AI-produced work in software contracts. Search for "AI work product liability software" or "who is responsible AI code bugs client." Look for procurement policies from large enterprises regarding AI-generated deliverables.

**Priority:** P1 -- Market acceptance is a harder constraint than technical capability.

---

#### Q15. What observability and trust-building patterns exist for demonstrating agent work quality to external stakeholders (clients, auditors, regulators)?

**Rationale:** IndyDevDan's trust framework applies internally: *you* trust your agents because *you* built observability. But how do you demonstrate that trust to someone outside the system? A client who pays $50K wants to know the work is reliable. An auditor wants an audit trail. A regulator (especially in finance, healthcare, or government) wants compliance evidence. What tooling and practices exist for external trust-building?

**Search strategy:** Search for "AI agent audit trail compliance", "demonstrating AI code quality to clients", "agent observability external stakeholders", "AI work product certification 2026." Look for ISO/SOC2 implications of agent-produced code. Search for Langfuse, PostHog, or similar tools used for client-facing agent work transparency. Look for any "AI work quality certification" or "agent code provenance" initiatives.

**Priority:** P1 -- External trust is the gate between internal tool and scalable business.

---

#### Q16. What is the state of AI-generated code liability law as of March 2026? If an agent ships a security vulnerability that causes client harm, who is legally responsible?

**Rationale:** This is the existential legal question. If you build an autonomous system that writes code for paying clients, and that code has a security flaw that leads to a data breach, the liability chain is: client -> your agency -> your agent system -> the model provider? Current case law is thin. Phase 1 documented Elvis's security practices (USB drive for critical data, billing caps, least privilege) but not the legal framework. A $50K/week business needs legal clarity before scaling.

**Search strategy:** Search for "AI generated code liability 2026", "legal responsibility AI coding agent", "AI software liability law", "autonomous agent legal framework 2026." Look for law firm publications, EU AI Act implications, and US regulatory guidance on AI-produced software. Search for "AI code warranty" or "autonomous software development legal risk." Look for insurance products covering AI-produced code.

**Priority:** P0 -- Legal liability is the one risk that can kill the business overnight.

---

### TIER 4: Minimum Viable Autonomy (Questions 17-19)

#### Q17. What is the smallest, most focused agent system that generates ROI without human intervention beyond initial setup and periodic review?

**Rationale:** The vision of "infinite scaling" is aspirational. The practical question is: what is the minimum viable autonomous system? Elvis's cron-based Sentry scanning is one example -- it finds and fixes bugs without human prompting. Stripe's one-shot minions are another -- fire and forget. What is the smallest loop that generates value? IndyDevDan's progressive deletability principle suggests starting with the simplest system that works and removing complexity as trust grows.

**Search strategy:** Search for "minimum viable AI agent system", "smallest autonomous agent loop ROI", "simplest agent system that generates value", "autonomous bug fixing agent production." Look for examples of narrow, focused agent systems that run autonomously (Sentry -> fix -> deploy, CI failure -> diagnose -> fix -> PR). Search for "agent cron job production" or "autonomous maintenance agent." Look for Mendral (YC), Dependabot, or similar narrow-scope autonomous systems.

**Priority:** P1 -- Start small, prove ROI, expand. This question defines "start small."

---

#### Q18. What triggers should an autonomous agent system use to decide when human intervention is needed? What decision frameworks exist for autonomous escalation?

**Rationale:** Full autonomy is the ceiling; smart escalation is the floor. The system must know when it is out of its depth. Phase 1 documented Stripe's 2-round retry cap and the L-Thread orchestrator's roadblock recovery. But these are simple heuristics. What more sophisticated frameworks exist? When should an agent escalate to human review vs. skip-and-log vs. try a different approach? This is the boundary between reliable autonomy and dangerous over-confidence.

**Search strategy:** Search for "AI agent escalation framework", "autonomous agent human intervention trigger", "agent confidence scoring production", "when should AI agents ask for help." Look for research on human-AI collaboration boundaries, NASA's levels of autonomy framework applied to coding agents. Search for "agent uncertainty detection" or "agent self-assessment reliability." Look for any production systems with documented escalation policies.

**Priority:** P1 -- The escalation framework is what makes autonomy safe rather than reckless.

---

#### Q19. What is the minimum observability stack required for a solo operator to trust and manage 5-10 autonomous agents running 24/7?

**Rationale:** Dan built hook-based multi-agent observability. Langfuse provides traces and cost tracking. But for a solo operator running agents overnight and on weekends: what is the minimum alerting, monitoring, and dashboarding needed to sleep soundly? This is not about comprehensive instrumentation -- it is about the vital signs. What do you absolutely need to see, and what can you ignore?

**Search strategy:** Search for "minimum observability AI agent production", "monitoring autonomous coding agents", "AI agent alerting production setup", "agent fleet monitoring solo developer." Look for blog posts about running agents overnight, what alerts people set up, what failures they caught (or missed). Search for Langfuse or PostHog agent monitoring configurations. Look for "AI agent on-call" or "agent incident management."

**Priority:** P1 -- Observability is the prerequisite for trust, and trust is the prerequisite for sleep.

---

### TIER 5: Existential Risks (Questions 20-22)

#### Q20. What happens to autonomous agent businesses when model API pricing changes, rate limits are imposed, or capability regressions occur? Are there documented cases?

**Rationale:** The entire stack depends on model API stability. Phase 1 documented that Claude Code's subscription provides "effectively unlimited tokens for $100-$200/month" -- but this pricing is a growth-stage subsidy, not a permanent cost structure. OpenAI has changed pricing multiple times. Anthropic could do the same. What happens to an agent business built on $200/month when the cost becomes $2,000/month? What about rate limits that prevent parallel agent operation? What about model capability regressions (models getting worse at specific tasks after updates)?

**Search strategy:** Search for "AI API pricing change impact business 2026", "model API cost increase agent system", "Claude pricing change impact", "OpenAI API rate limit agents." Look for case studies of businesses disrupted by API pricing changes. Search for "model capability regression 2026" or "AI model quality decrease after update." Look for hedging strategies: multi-model, self-hosted models, cost caps.

**Priority:** P0 -- API dependency is the single point of failure for the entire vision.

---

#### Q21. What are the realistic competitive moats for an agent-augmented software business? If agents commoditize development, what prevents a race to the bottom?

**Rationale:** If agents make every developer 10x more productive, they also make every competitor 10x more productive. The strategic question is: what is defensible? Phase 1 identified "the orchestration layer is the asset, not the runtime." But orchestration patterns are documented, open-source, and replicable. IndyDevDan's framework suggests the moat is in *context* -- proprietary business knowledge, client relationships, domain expertise that agents enhance but do not replace. But is that enough?

**Search strategy:** Search for "AI development competitive moat 2026", "agent commoditization software development", "defensible advantage AI-powered agency", "competitive moat AI coding." Look for strategic analyses of how AI changes software agency competition. Search for "race to bottom AI development pricing" or "AI freelance market saturation." Look for cases where agent-augmented businesses compete against each other.

**Priority:** P1 -- Scaling revenue is worthless if margins erode to zero.

---

#### Q22. What insurance, contractual, or structural protections exist for businesses built on autonomous agent systems? How do you protect against catastrophic agent failure?

**Rationale:** Agents can fail spectacularly: shipping broken code to production, deleting data, exposing secrets, or generating toxic content in client-facing applications. Elvis manually controls Stripe access ("declined her access to Stripe lol"). But at scale, manual control over every sensitive resource is a bottleneck. What insurance products, contract clauses, corporate structures, or technical safeguards exist specifically for agent-driven businesses?

**Search strategy:** Search for "AI agent business insurance 2026", "autonomous software liability insurance", "contract clauses AI generated code", "corporate structure AI risk protection." Look for E&O (errors and omissions) insurance covering AI work, cyber liability insurance for AI-produced code. Search for "AI development contract template 2026" or "indemnification AI code." Look for YC or startup legal resources on structuring an AI-first agency.

**Priority:** P1 -- Catastrophic risk mitigation is the difference between a business and a bet.

---

## Priority Summary

### P0 -- Must answer before scaling (9 questions)

| # | Question | What it determines |
|---|----------|-------------------|
| Q1 | Who else runs agent-swarm businesses with revenue? | Whether the pattern is replicable |
| Q2 | What are documented failure modes and rework rates? | True quality of agent output |
| Q3 | Elvis Sun current status and sustainability? | Whether the poster child sustained |
| Q4 | Real cost-per-deliverable including all overhead? | True margins |
| Q7 | AI-augmented agency economic models? | Path to $500K/week |
| Q8 | Parallel agent scaling limits? | Maximum productive capacity |
| Q11 | Agent throughput in billable deliverables? | Conversion from output to revenue |
| Q12 | Human review bottleneck threshold? | Absolute scaling ceiling |
| Q16 | AI code liability law? | Legal viability of the business |
| Q20 | API pricing/capability change risks? | Single point of failure resilience |

### P1 -- Must answer before sustained operation (12 questions)

| # | Question | What it determines |
|---|----------|-------------------|
| Q5 | Fully autonomous revenue generation? | Ceiling: leveraged human vs. autonomous system |
| Q6 | Orchestrator ROI compounding with model upgrades? | Whether the orchestrator is compounding or depreciating asset |
| Q9 | Pricing models for agent work? | Revenue model clients accept |
| Q10 | 24/7 agent infrastructure costs? | Operational cost baseline |
| Q13 | Multi-agent review replacing human review? | Whether the trust ceiling can rise |
| Q14 | Client perception of agent code? | Market acceptance |
| Q15 | External trust-building patterns? | Client-facing quality demonstration |
| Q17 | Minimum viable autonomous system? | Where to start |
| Q18 | Autonomous escalation framework? | Safe autonomy boundary |
| Q19 | Minimum observability for solo operator? | What you need to sleep |
| Q21 | Competitive moats? | Long-term defensibility |
| Q22 | Insurance and structural protections? | Catastrophic risk mitigation |

---

## The Honest Assessment

Through IndyDevDan's lens, here is what we *know* and what we *don't know*:

**We KNOW (engineering):**
- The orchestrator-worker architecture works (Elvis, Stripe, Gas Town, OpenClaw)
- Non-coding orchestrators with deterministic gates produce reliable output
- A solo operator can achieve 3-5x team output with agent leverage (Elvis, limited data)
- The infrastructure costs $120-400/month at solo scale
- The tool stack is mature enough for production (Pi, Context-Gateway, Langfuse)
- $50K in one week is achievable (Burak, proven)

**We DON'T KNOW (vibe coding):**
- Whether $50K/week is sustainable or a one-time spike
- Whether the pattern works for anyone besides Elvis and Burak (N=2)
- What the true failure rate and rework cost is
- Whether clients accept agent-produced work at premium prices
- What happens when API pricing changes
- Who is legally liable when agents ship bugs
- Whether human review scales or becomes the bottleneck
- Whether competitive moats exist or margins compress to zero
- What the minimum viable autonomous system looks like
- Whether orchestrator ROI compounds or requires constant redesign

**The gap between "know" and "don't know" is the gap between a successful experiment and a self-sustaining business.** Phase 2 research must close this gap with evidence, not hope.

---

## Instructions for Phase 2 Research Agents

Each research agent should:

1. **Search for evidence, not opinions.** Prioritize documented case studies, published metrics, and primary sources over blog posts and hot takes.
2. **Document the absence of evidence.** If a question cannot be answered because the data does not exist, say so explicitly. "No documented case exists" is a valid and important finding.
3. **Capture counter-evidence.** If you find evidence that contradicts the vision (agent businesses failing, clients rejecting agent work, legal rulings against AI-produced code), document it with equal rigor.
4. **Note recency.** The landscape changes monthly. Prioritize 2026 sources. Flag anything from before 2025 as potentially outdated.
5. **Apply IndyDevDan's test.** For every finding, ask: "Does this move us from 'not knowing' to 'knowing'?" If yes, it is valuable. If it is speculation dressed as analysis, skip it.

---

*Analysis complete. 22 research questions generated from 73 Phase 1 documents through IndyDevDan's philosophical framework. Ready for Phase 2 research agent deployment.*
