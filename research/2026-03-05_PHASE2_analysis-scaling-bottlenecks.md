# Phase 2 Analysis: Scaling Bottlenecks

**Date:** 2026-03-05
**Domain:** What breaks at 10x, 100x, 1000x scale?
**Analyst Lens:** IndyDevDan's philosophy -- "Knowing is engineering; not knowing is vibe coding"
**Basis:** 70+ Phase 1 research documents, 5 synthesis reports, 1 landscape overview

---

## Executive Summary

The user currently operates a solo agent system generating $50K/week with Claude Max, running 2-5 agents via tmux in the L-Thread Orchestrator pattern. The vision is to scale this "infinitely" -- 10x, 100x, 1000x -- with minimal human oversight. Phase 1 research revealed a rich ecosystem of patterns, tools, and case studies, but most address the 2-7 agent regime. The scaling question -- what actually breaks when you push past that? -- remains under-investigated.

This analysis identifies 22 specific research questions that Phase 2 agents should investigate via web search. Each question targets a known or suspected bottleneck, includes rationale grounded in Phase 1 findings, and provides a concrete search strategy. The questions are organized into seven domains and prioritized by impact on the user's scaling trajectory.

The central thesis, through IndyDevDan's lens: **you cannot scale what you do not observe, and you cannot observe what you have not bounded.** Every scaling bottleneck ultimately traces back to something unbounded -- unbounded context, unbounded cost, unbounded coordination, unbounded human review load. The research questions below are designed to find the bounds before they find you.

---

## Domain 1: Token Economics at Scale

### Q1: What is the empirical cost curve for 10, 50, and 100 parallel coding agents?

**Rationale:** Phase 1 established cost ranges: solo ($120-400/mo), production ($2K-8K/mo), Gas Town ($2K-5K/mo for 20-30 agents). Elvis Sun runs 5 agents for ~$190/mo. But these are snapshots, not curves. The critical question is whether cost scales linearly, superlinearly, or has step functions. Agent Teams multiply cost ~4x per teammate (Phase 1). Coordination tokens (planning, status updates, merge discussions) are "the primary bottleneck" per the architecture patterns research -- and coordination overhead scales superlinearly with agent count. If each of 10 agents produces a 500-token status update that the orchestrator must read, that is 5K tokens per coordination round. At 100 agents, it is 50K -- consuming a quarter of a 200K context window in a single round.

**Search Strategy:**
- "multi-agent LLM cost scaling" + "token economics" + "parallel agents cost curve"
- "Stripe minions API cost" OR "Gas Town monthly spend" OR "production agent fleet cost"
- "agent coordination overhead tokens" + "scaling cost"
- "fleet budget management AI agents 2026"
- Look for academic papers on BudgetMLAgent, xRouter cost-aware orchestration

**Priority:** P0 -- directly determines whether the scaling vision is economically viable.

---

### Q2: What are the hidden costs beyond API tokens that compound at scale?

**Rationale:** Phase 1 identified RAM as Elvis Sun's primary constraint (Mac Mini caps at 4-5 agents; $5K Mac Studio needed for more). Each agent needs its own worktree with node_modules, build tools, and test runners. Five parallel TypeScript compilers consume significant memory. But Phase 1 did not quantify: disk I/O costs from parallel git worktrees, CI/CD pipeline costs when 20+ agents all push PRs, network bandwidth for MCP tool calls, electricity for always-on hardware, and the compute cost of background compaction (Context-Gateway). At 100 agents, the infrastructure stack itself may cost more than the API calls.

**Search Strategy:**
- "infrastructure cost AI agent fleet" + "hardware requirements"
- "git worktree disk space" + "parallel agents" + "scaling"
- "CI/CD pipeline costs" + "agent-generated PRs" + "high volume"
- "Context-Gateway resource usage" OR "background compaction compute cost"
- "E2B pricing 100 agents" OR "Daytona cost scaling"

**Priority:** P0 -- hidden costs are where scaling plans die.

---

### Q3: Does model routing actually reduce cost at scale, or does the routing layer itself become expensive?

**Rationale:** Phase 1 converges on model routing as essential: Opus for orchestration, Sonnet for code, Haiku for scouts. Elvis routes by task type. NVIDIA's Orchestrator-8B shows a small trained model can outperform large ones for routing. But no Phase 1 source quantified the routing layer's own cost. The orchestrator must read each task, reason about it, and select a model -- that is an LLM call per task. At 1000 tasks/day, routing itself could consume thousands of dollars monthly. Additionally, NVIDIA's trained orchestrator approach requires training data and infrastructure. The question is: at what scale does routing cost justify a trained routing model versus prompt-based routing?

**Search Strategy:**
- "LLM model routing cost" + "orchestration overhead"
- "NVIDIA Orchestrator-8B" + "cost savings" + "training data requirements"
- "agent task classification cost" + "model selection"
- "xRouter reinforcement learning" + "cost-aware routing results"
- "cheap model classifier" + "task routing production"

**Priority:** P1 -- routing is assumed to save money, but the assumption needs validation at scale.

---

## Domain 2: Coordination Overhead -- The Mythical Agent-Month

### Q4: At what agent count does coordination cost exceed execution value? Is there a "Mythical Man-Month" for agents?

**Rationale:** Brooks' Law states adding people to a late software project makes it later because communication overhead scales as n(n-1)/2. Phase 1's "17x error trap" finding is the agent equivalent: naive multi-agent setups produce 17x more errors than single well-structured agents. The architecture patterns research identifies O(n^2) communication complexity in full mesh topologies. Hub-and-spoke avoids this but creates a context bottleneck at the orchestrator. Hierarchical topology introduces "telephone game" distortion. The fundamental question: is there a ceiling beyond which adding agents reduces net output? Elvis at 5 agents seems to be near-optimal for solo. Stripe at 1300+ PRs/week operates entirely differently (one-shot, no inter-agent coordination). The shape of the coordination curve determines whether "infinite scaling" is possible or whether there is a hard ceiling.

**Search Strategy:**
- "Brooks Law AI agents" OR "mythical man-month autonomous agents"
- "multi-agent coordination overhead" + "diminishing returns" + "agent count"
- "optimal number of AI agents" + "team size" + "productivity"
- "agent fleet productivity ceiling" + research OR "empirical study"
- "coordination cost vs execution value" + "multi-agent systems"
- Look for ICLR 2026 papers on multi-agent scaling failures

**Priority:** P0 -- this determines the entire scaling strategy.

---

### Q5: What happens to merge conflict rates when 10+ agents work on the same codebase simultaneously?

**Rationale:** Phase 1 identified merge conflicts as a critical unsolved problem. Git worktrees isolate during execution, but all agents must merge back to main. Graphite's stacked PRs + partitioned merge queues are cited as the best solution, but Phase 1 notes "no universal Pi extension handles automated merge." Overstory's 4-tier merge queue is framework-specific. At 10 agents, if each produces a PR touching an average of 5 files, and the codebase has 500 files, the probability of file overlap is already significant (birthday problem). At 50 agents, it approaches certainty for large codebases. The merge conflict wall could be the hard ceiling on parallel agent count.

**Search Strategy:**
- "merge conflict rate" + "parallel development" + "many branches"
- "Graphite stacked PRs" + "agent generated" + "scale"
- "automated merge conflict resolution" + "AI agents" + "2026"
- "git merge queue" + "high throughput" + "best practices"
- "monorepo merge strategy" + "parallel agents" + "100 PRs/day"
- "Overstory merge queue" OR "partitioned merge queue" + results

**Priority:** P0 -- merge conflicts are the most concrete, least escapable scaling wall.

---

### Q6: How does the "telephone game" distortion work in hierarchical agent topologies, and can it be quantified?

**Rationale:** Phase 1's architecture patterns research identifies hierarchical topology as required for 8-15+ agents, with team leads managing 3-5 workers each. But it also warns of "telephone game distortion as instructions pass through layers." IndyDevDan's principle "knowing is engineering" demands we quantify this: if the orchestrator gives a high-level directive to a team lead, and the team lead decomposes it for workers, how much semantic fidelity is lost at each layer? This matters because context windows compress information at each handoff. If each layer retains 80% of intent, two hops give you 64%, three hops give you 51%. At 1000 agents with 3-4 layers of hierarchy, the bottom-level agents may be working on tasks that bear little resemblance to the original intent.

**Search Strategy:**
- "hierarchical multi-agent" + "information loss" + "instruction distortion"
- "message passing degradation" + "LLM agents" + "multi-hop"
- "semantic fidelity" + "agent delegation chains" + "depth"
- "principal-agent problem" + "AI agents" + "hierarchical"
- "instruction following" + "proxy agents" + "accuracy degradation"

**Priority:** P1 -- determines whether hierarchical scaling is viable without custom mitigation.

---

## Domain 3: Quality Degradation at Scale

### Q7: Does AI-generated code quality degrade as the number of parallel agents increases?

**Rationale:** Phase 1 cites CodeRabbit's finding that AI-authored code introduces 1.75x more logic errors and 2.74x more XSS vulnerabilities than human-written code. But this is a per-agent baseline. The question is whether quality degrades *further* with fleet size. Mechanisms for degradation include: context contamination between agents (despite isolation), increased merge conflict resolution that introduces bugs, overwhelming CI/CD with false positives from so many PRs that real issues get lost, and the orchestrator's own context filling up with status reports so it cannot maintain quality oversight. Stripe's max-2-retry cap implicitly acknowledges this -- more retries do not improve quality. The question is whether more agents also do not improve aggregate quality past a threshold.

**Search Strategy:**
- "AI generated code quality" + "scale" + "multiple agents"
- "code quality degradation" + "parallel development" + "agent fleet"
- "automated code review" + "false positive rate" + "high volume PRs"
- "technical debt" + "AI generated code" + "accumulation rate"
- "CodeRabbit" + "bug detection" + "scaling" + "high volume"
- "Stripe minions quality metrics" OR "agent PR defect rate"

**Priority:** P0 -- quality degradation is the stealthiest scaling killer.

---

### Q8: What is the compaction quality curve? How does repeated context compaction degrade agent performance over time?

**Rationale:** Phase 1 identifies context windows as a fundamental constraint (even 200K fills up) and notes that "compaction degrades quality over time." Context-Gateway pre-computes summaries to eliminate pauses, but the underlying problem remains: every compaction loses information. With 200x compression (Compresr claim), even if 99.5% of information is retained, after 5 compactions you have lost ~2.5% cumulative. For long-running orchestration sessions managing 50+ agents, the orchestrator itself may compact dozens of times per day. The question: is compaction quality degradation linear, exponential, or catastrophic after a threshold? And does the choice of summarizer model matter (Haiku vs. Sonnet for summarization)?

**Search Strategy:**
- "context compaction quality" + "LLM" + "degradation curve"
- "context window compression" + "information loss" + "repeated summarization"
- "Compresr" OR "Context-Gateway" + "quality metrics" + "long running"
- "conversation summarization" + "accuracy loss" + "multiple rounds"
- "agent context drift" + "long running sessions" + "quality"

**Priority:** P1 -- affects all long-running agent operations.

---

### Q9: At what scale does the "17x error trap" emerge, and what are the empirical error rate curves?

**Rationale:** The "17x error trap" from Towards Data Science is Phase 1's most alarming finding -- naive multi-agent setups produce 17x more errors than well-structured single agents. But Phase 1 does not reveal the curve shape. Is it: 2 agents = 2x errors, 5 = 5x, 17 = 17x (linear)? Or 2 agents = 1.1x, 5 = 2x, 10 = 17x (exponential)? Or is there a cliff where errors suddenly explode? The ICLR 2026 papers on multi-agent failures may contain empirical data. Understanding the curve shape determines where to draw the "add more agents" boundary and when to invest in error-prevention infrastructure instead.

**Search Strategy:**
- "17x error trap multi-agent" + "empirical" + "error rate curve"
- "multi-agent system error rate" + "agent count" + "scaling"
- "ICLR 2026 multi-agent failures" + "quantitative"
- "bag of agents anti-pattern" + "error multiplication" + "data"
- "multi-agent hallucination amplification" + "cascading errors" + "study"
- arXiv search: "multi-agent LLM error scaling"

**Priority:** P0 -- determines the safety of scaling beyond current agent count.

---

## Domain 4: Infrastructure Breaking Points

### Q10: What breaks first when scaling to 50+ agents -- context windows, merge queues, git repos, CI/CD, or human review capacity?

**Rationale:** Phase 1 identifies five candidate breaking points but does not rank them empirically. Context windows fill up (orchestrator context is the hub bottleneck). Merge queues back up (Graphite helps but has its own limits). Git repos slow down (100+ worktrees on a single repo may stress git's internals). CI/CD pipelines saturate (3 million tests at Stripe, but selective CI keeps it manageable). Human review capacity is fundamentally limited (the "Dracula Effect" limits peak AI-directed intensity to ~3 hours). Each of these has a different scaling curve and a different fix. Knowing which breaks first determines where to invest.

**Search Strategy:**
- "bottleneck analysis" + "parallel AI agents" + "infrastructure limits"
- "git performance" + "100 worktrees" OR "many branches" + "scaling"
- "CI/CD pipeline scaling" + "agent generated PRs" + "throughput"
- "code review bottleneck" + "AI generated code" + "human capacity"
- "Graphite merge queue" + "throughput limits" + "concurrent PRs"
- "context window bottleneck" + "orchestrator" + "many agents"

**Priority:** P0 -- identifies the first wall to hit and where to allocate engineering resources.

---

### Q11: Can a single machine (Mac Studio / Linux server) host 50+ agent worktrees, and what are the resource scaling curves?

**Rationale:** Elvis hit the RAM wall at 4-5 agents on a Mac Mini (16GB). Upgraded to a $5K Mac Studio. Each agent needs: a git worktree (~50-500MB), node_modules (~200MB-1GB), a running dev server (~100-500MB RAM), a TypeScript compiler (~100-300MB RAM), and the Claude CLI process itself. At 50 agents, that is potentially 25-100GB of RAM and 10-50GB of disk for worktrees alone. The architecture patterns research mentions "independent resource allocation" for clusters, but Phase 1 does not address whether a single-machine architecture can stretch to 50 agents or whether distributed infrastructure is required. The cost difference is massive: a single Mac Studio ($5K one-time) vs. a cluster of VPS instances ($500-2000/month).

**Search Strategy:**
- "many git worktrees" + "performance" + "resource usage"
- "Mac Studio M4 Ultra" + "concurrent processes" + "RAM scaling"
- "parallel development environments" + "single machine" + "limits"
- "node_modules" + "disk space" + "many projects" + "optimization"
- "agent fleet hardware requirements" + "2026" + "recommendations"
- "Hetzner dedicated server" + "agent workload" + "performance"

**Priority:** P1 -- determines build-vs-buy for infrastructure.

---

### Q12: How do LLM API rate limits interact with fleet scaling? What are the actual throughput ceilings for Anthropic, OpenAI, and Google APIs at 50-100 concurrent agents?

**Rationale:** Phase 1 discusses model routing and cost but does not address rate limits as a scaling constraint. Anthropic, OpenAI, and Google all impose rate limits (requests per minute, tokens per minute) that vary by plan tier. A single agent might make 5-20 API calls per minute. At 50 agents, that is 250-1000 calls per minute. Even enterprise-tier plans may not support this throughput. Rate limit hits cause agent stalls, which cascade into timeout-based escalations, which consume more tokens. The interaction between rate limits and multi-agent retries could create a vicious cycle where scaling up agents actually reduces effective throughput.

**Search Strategy:**
- "Anthropic API rate limits" + "enterprise tier" + "2026"
- "OpenAI API rate limits" + "concurrent requests" + "high volume"
- "LLM API throughput" + "multi-agent" + "rate limiting"
- "Claude Max" + "API limits" + "concurrent usage"
- "API rate limit" + "agent fleet" + "mitigation strategies"
- "token bucket rate limiting" + "multi-agent coordination"

**Priority:** P1 -- a hard infrastructure ceiling that cannot be engineered around.

---

## Domain 5: The Human Bottleneck

### Q13: What tasks fundamentally CANNOT be removed from the human loop, even with perfect agents?

**Rationale:** Phase 1 documents the "Dracula Effect" (3-hour ceiling on peak AI-directed intensity) and the "Absorption Problem" (organizations cannot metabolize AI-speed output). Elvis still manually controls Stripe access and reviews PRs. Stripe explicitly states minions "are not replacing engineers" and every PR gets human review. But Phase 1 does not systematically categorize which human functions are removable vs. irreducible. Candidates for irreducible: legal/regulatory sign-off, client relationship management, strategic business decisions, final quality sign-off for customer-facing changes, financial authorization, hiring/firing, physical world interactions. The question is: as agents improve, which of these shrink and which are permanent?

**Search Strategy:**
- "human in the loop" + "irreducible tasks" + "AI agents" + "2026"
- "autonomous AI" + "human oversight requirements" + "legal regulatory"
- "Dracula Effect" + "AI directed intensity" + "cognitive limits"
- "AI agent" + "what humans still need to do" + "production"
- "human review bottleneck" + "agent generated code" + "scaling"
- "autonomous company" + "human requirements" + "legal"

**Priority:** P0 -- defines the ceiling of autonomy.

---

### Q14: Can AI agents review other AI agents' work reliably enough to remove the human review bottleneck?

**Rationale:** Elvis's multi-model review gate (Codex + Claude + Gemini reviewing each PR) catches different error classes. Stripe uses human review as the final gate. At 1300+ PRs/week, Stripe's human reviewers are already strained. If scaling to 5000+ PRs/week, human review becomes physically impossible. The question is whether AI-reviewing-AI is reliable enough. Phase 1's CodeRabbit achieves 46% real-world bug detection -- but does that mean 54% of bugs pass through? For a solo operator scaling to hundreds of agent-produced PRs/day, the math of AI review reliability is existential. If AI review catches 90% of issues, and you produce 100 PRs/day, that is 10 buggy PRs deployed daily.

**Search Strategy:**
- "AI code review reliability" + "production" + "accuracy rate"
- "CodeRabbit" + "false negative rate" + "bugs missed"
- "AI reviewing AI code" + "quality" + "enterprise"
- "multi-model review" + "complementary error detection" + "coverage"
- "automated code review" + "replace human review" + "feasibility"
- "self-healing code" + "automated bug detection" + "production rate"

**Priority:** P0 -- if humans must review everything, scaling has a hard 3-hour/day ceiling.

---

### Q15: What organizational structures enable a single human to oversee 50, 100, or 1000 agents?

**Rationale:** Phase 1 documents hub-and-spoke for 2-7 agents, team leads for 7+, and hierarchical topology for 10+. But it does not address the management science question: how does a single human oversee a fleet that large? Traditional management theory says span of control is 5-9 direct reports. With hierarchical agents, the human might have 3-5 team-lead agents, each managing 10 workers, for a fleet of 30-50. But the human still needs to review team-lead outputs, handle escalations, and make strategic decisions. IndyDevDan's trust thesis suggests this is about instrument-then-delegate: build dashboards, confidence scores, and alerting so the human only sees exceptions. The question is whether anyone has actually operated at 50+ agents as a solo operator and what organizational innovations they needed.

**Search Strategy:**
- "single operator" + "AI agent fleet" + "management" + "large scale"
- "span of control" + "AI agents" + "organizational design"
- "exception-based management" + "autonomous agents" + "dashboard"
- "Paperclip management plane" + "agent fleet" + "solo operator"
- "zero-employee company" + "AI agents" + "operational structure"
- "dotta Paperclip" + "organizational infrastructure" + "agents"

**Priority:** P1 -- determines whether the "solo operator + agent fleet" vision is architecturally possible.

---

## Domain 6: Cost Ceilings and Economic Crossovers

### Q16: At what scale does it become cheaper to hire humans than run agents? Where is the crossover point?

**Rationale:** Phase 1 estimates $6/developer-day average API cost in 2026. A junior developer costs ~$200-400/day (salary + overhead). At that ratio, agents are 30-60x cheaper per unit of work. But this assumes agent output quality is comparable and that coordination costs are negligible. At scale, coordination overhead rises, quality assurance costs increase, and infrastructure costs compound. If a 50-agent fleet costs $8K/month in API + $2K in infrastructure + 4 hours/day of human oversight (valued at ~$100/hour = $8K/month), total is ~$18K/month. That buys 2-3 junior developers at market rates. Do the 50 agents outproduce 2-3 juniors? Probably yes for well-defined tasks, probably no for ambiguous work. The crossover point matters for business planning.

**Search Strategy:**
- "AI agent cost" + "vs human developer" + "comparison 2026"
- "ROI AI coding agents" + "breakeven analysis" + "hiring alternative"
- "agent fleet total cost of ownership" + "infrastructure overhead"
- "junior developer salary" + "2026" + "market rate"
- "AI vs human productivity" + "software development" + "quantitative"
- "economic model" + "autonomous agents" + "scaling costs"

**Priority:** P1 -- determines when to hire vs. when to scale agents.

---

### Q17: What are the revenue-per-agent economics? Can agents be directly revenue-generating (not just cost-saving)?

**Rationale:** Elvis's Zoe generates revenue directly: managing social media ($1,505 X payout), handling waitlist signups, closing deals. This is different from Stripe's Minions, which save developer time but do not directly generate revenue. The scaling question is: if each agent can be assigned revenue-generating tasks (content creation, lead nurturing, customer support, proposal writing), what is the revenue-per-agent curve? If an agent generates $500/month in revenue at $50/month in cost, then 100 agents = $45K/month profit. But this assumes each marginal agent finds revenue-generating work. Market saturation, quality standards, and task availability create diminishing returns. The question is: what is the shape of this curve?

**Search Strategy:**
- "AI agent revenue generation" + "autonomous" + "direct income"
- "AI content creation" + "revenue per agent" + "scaling"
- "agent-as-employee" + "revenue attribution" + "autonomous work"
- "AI freelancer" + "autonomous" + "earnings" + "2026"
- "diminishing returns" + "AI generated content" + "market saturation"
- "Elvis Sun Zoe" + "revenue" OR "agent revenue model"

**Priority:** P1 -- reframes scaling from cost to revenue.

---

### Q18: What are the insurance, legal, and liability costs that emerge at scale?

**Rationale:** Phase 1 does not address legal scaling. A solo operator running 5 agents producing code for $50K/week contracts operates in a gray zone. At 50+ agents producing code for multiple clients simultaneously, questions emerge: Who is liable when agent-generated code causes a client data breach? Does professional liability insurance cover AI-generated work? Are there contractual obligations to disclose that code was AI-generated? What happens when an agent accidentally commits a client's API key to a public repo? The CodeRabbit finding (2.74x more XSS vulnerabilities in AI code) means security incidents scale with agent output. Legal costs could be the most expensive hidden cost at scale.

**Search Strategy:**
- "AI generated code liability" + "legal" + "2026"
- "professional liability insurance" + "AI agents" + "software development"
- "AI code security breach" + "liability" + "contractor"
- "disclosure requirements" + "AI generated code" + "contracts"
- "AI agent" + "errors and omissions insurance" + "coverage"
- "autonomous AI" + "legal liability framework" + "2026"

**Priority:** P2 -- does not affect technical scaling but could be a business-killing risk.

---

## Domain 7: The Path to Exponential Scaling

### Q19: What does "infinite" scaling actually look like? Are there real examples of 100+ agent operations?

**Rationale:** Phase 1 documents several operating points: Elvis at 5 agents, Gas Town at 20-30 agents, Stripe at 1300+ PRs/week (unknown agent count). Swarms claims 45 million agents operated. But Phase 1 does not surface any solo operator or small team running 100+ agents continuously in production. The gap between Elvis (5) and Stripe (enterprise with hundreds of engineers supporting the system) may be unbridgeable for a solo operator. Or there may be examples we have not found. The question is: does anyone operate at the 100+ agent scale as a small team, and if not, why not?

**Search Strategy:**
- "100 AI agents" + "production" + "small team" OR "solo"
- "large scale agent fleet" + "coding" + "operations" + "2026"
- "Swarms 45 million agents" + "details" + "architecture"
- "Gas Town production" + "agent count" + "concurrent"
- "autonomous coding" + "large fleet" + "case study"
- "zero-employee AI company" + "agents" + "scale" + "2026"

**Priority:** P0 -- validates or invalidates the core scaling vision.

---

### Q20: What enabling technologies would create step-function improvements in agent scaling?

**Rationale:** Phase 1 identifies several technologies on the horizon: trained orchestrators (NVIDIA Orchestrator-8B), background compaction (Context-Gateway), 2-5 million token context windows (IndyDevDan's prediction), and MCP as universal protocol. But Phase 1 does not project which future capabilities would create 10x scaling improvements. Candidates include: infinite context windows (eliminating compaction entirely), 10x cheaper inference, deterministic code generation (eliminating the review bottleneck), native multi-agent protocols in model APIs, and hardware accelerators designed for agent workloads. Understanding which technologies to bet on determines where to invest today.

**Search Strategy:**
- "future LLM capabilities" + "agent scaling" + "breakthrough"
- "million token context window" + "timeline" + "2026 2027"
- "inference cost reduction" + "trajectory" + "projection"
- "deterministic code generation" + "LLM" + "reliability"
- "agentic AI hardware" + "specialized" + "accelerator"
- "AI model improvements" + "agent orchestration impact" + "2026"

**Priority:** P1 -- determines the long-term architecture investment strategy.

---

### Q21: What is the "Absorption Problem" curve? How fast can a solo operator metabolize agent output as fleet size grows?

**Rationale:** Phase 1 identifies the Absorption Problem: organizations cannot metabolize AI-speed output. For a solo operator, this is even more acute. If 5 agents produce 5 PRs/hour, the human can review them in roughly real-time. If 50 agents produce 50 PRs/hour, the human cannot keep up. At 100 agents producing 100 PRs/hour for 8 hours, that is 800 PRs to review. Even with AI-assisted review (CodeRabbit catching 46%), that leaves 432 PRs needing human attention. The question is: what organizational and tooling innovations allow a solo operator to absorb more output? Exception-based review (only review what AI review flags)? Confidence-based triage (only review low-confidence PRs)? Batch review (review summaries instead of individual PRs)?

**Search Strategy:**
- "code review throughput" + "solo developer" + "AI generated" + "scaling"
- "exception based review" + "AI agents" + "high volume PRs"
- "confidence scoring" + "AI code review" + "triage"
- "batch review" + "automated" + "developer productivity"
- "absorption problem" + "AI output" + "organizational capacity"
- "Conductor" + "review interface" + "parallel agents" + "throughput"

**Priority:** P0 -- the absorption rate IS the human scaling ceiling.

---

### Q22: What are the observability requirements at 50+ agents, and do current tools support them?

**Rationale:** IndyDevDan's first principle: "observability before scale." Phase 1 identifies Langfuse as the observability solution (nested traces, cost tracking, prompt versioning). Phase 1 also documents IndyDevDan's hook-based monitoring system (Hook Scripts -> HTTP POST -> SQLite -> WebSocket -> Vue Client) and the observability triplet (status.json + events.jsonl + log.md per agent). But at 50 agents, that is 50 status files, 50 event streams, and 50 log files -- all updating in real-time. Can Langfuse handle 50 concurrent trace streams? Can a single SQLite database handle 50 agents writing events simultaneously? Do current dashboards become unreadable at 50+ agents? The observability infrastructure itself may become a scaling bottleneck.

**Search Strategy:**
- "Langfuse performance" + "high concurrency" + "many agents"
- "agent observability" + "large fleet" + "dashboard design"
- "SQLite concurrent writes" + "performance" + "many processes"
- "distributed tracing" + "50+ agents" + "real-time monitoring"
- "OpenTelemetry" + "agent fleet" + "scaling" + "2026"
- "observability infrastructure" + "multi-agent" + "bottleneck"

**Priority:** P1 -- you cannot scale what you cannot observe.

---

## Priority Ranking

### P0 -- Investigate First (Determines Viability)

| # | Question | Domain | Why P0 |
|---|----------|--------|--------|
| Q1 | Token economics cost curve at 10/50/100 agents | Token Economics | Economic viability |
| Q4 | Coordination overhead ceiling (agent Mythical Man-Month) | Coordination | Determines max useful fleet size |
| Q5 | Merge conflict rates at 10+ agents | Coordination | Hardest physical constraint |
| Q7 | Quality degradation curve with fleet size | Quality | Stealthy killer |
| Q9 | "17x error trap" empirical curve | Quality | Quantifies the danger zone |
| Q10 | What breaks first at 50+ agents | Infrastructure | Identifies first wall |
| Q13 | Irreducible human tasks | Human Bottleneck | Defines autonomy ceiling |
| Q14 | AI reviewing AI reliability | Human Bottleneck | Gatekeeper for removing human review |
| Q19 | Real examples of 100+ agent operations | Exponential | Validates/invalidates core vision |
| Q21 | Absorption Problem curve | Exponential | The human scaling ceiling |

### P1 -- Investigate Second (Determines Strategy)

| # | Question | Domain | Why P1 |
|---|----------|--------|--------|
| Q2 | Hidden infrastructure costs | Token Economics | Budget accuracy |
| Q3 | Model routing layer cost | Token Economics | Validates cost savings assumption |
| Q6 | Telephone game distortion in hierarchies | Coordination | Determines hierarchy viability |
| Q8 | Compaction quality degradation curve | Quality | Affects long-running operations |
| Q11 | Single machine vs. cluster for 50+ agents | Infrastructure | Build vs. buy decision |
| Q12 | API rate limits at scale | Infrastructure | Hard throughput ceiling |
| Q15 | Solo operator organizational structures | Human Bottleneck | Architectural pattern |
| Q16 | Agent vs. human cost crossover | Economics | Business planning |
| Q17 | Revenue-per-agent economics | Economics | Revenue scaling model |
| Q20 | Enabling technologies for step-function scaling | Exponential | Investment strategy |
| Q22 | Observability tool limits at 50+ agents | Exponential | Infrastructure planning |

### P2 -- Investigate Third (Risk Mitigation)

| # | Question | Domain | Why P2 |
|---|----------|--------|--------|
| Q18 | Legal/liability costs at scale | Economics | Business risk, not technical |

---

## Research Agent Deployment Plan

Phase 2 research agents should use web search to investigate these questions. Recommended agent assignments:

| Agent | Questions | Search Focus |
|-------|-----------|--------------|
| Agent 1 | Q1, Q2, Q3 | Token economics, infrastructure costs, model routing |
| Agent 2 | Q4, Q6 | Coordination overhead, hierarchy distortion, Brooks' Law for agents |
| Agent 3 | Q5 | Merge conflicts, git scaling, merge queue throughput |
| Agent 4 | Q7, Q9 | Quality degradation curves, error rate scaling, 17x trap |
| Agent 5 | Q8 | Compaction quality, context degradation, long-running sessions |
| Agent 6 | Q10, Q11, Q12 | Infrastructure breaking points, hardware limits, API rate limits |
| Agent 7 | Q13, Q14 | Human-in-the-loop irreducibility, AI review reliability |
| Agent 8 | Q15, Q21 | Organizational structures, absorption problem, management science |
| Agent 9 | Q16, Q17, Q18 | Economic models, cost crossovers, legal/liability |
| Agent 10 | Q19, Q20, Q22 | Real examples at scale, enabling technologies, observability limits |

---

## The IndyDevDan Framing

Every question above maps to IndyDevDan's philosophy:

- **"Knowing is engineering; not knowing is vibe coding"** -- We are asking these questions BEFORE scaling, not after hitting walls. The answers turn uncertainty into engineering constraints.

- **"Bound everything"** -- Each question seeks a bound: the cost bound, the coordination bound, the quality bound, the human attention bound. Unbounded anything is the path to cost explosion.

- **Observability before scale** -- Q22 specifically addresses whether observability infrastructure can keep up. But every question implicitly asks: "can we see this breaking before it breaks us?"

- **Context is the bottleneck** -- Q1, Q4, Q6, Q8, Q10 all trace back to context window limits. At scale, the orchestrator's context window becomes the single point of failure.

- **Three-tier progression** -- Tier 1 (harness, 2-5 agents) is proven. Tier 2 (intelligent orchestration, 5-20 agents) is where Elvis and Gas Town operate. Tier 3 (meta-agency, 20+) is the frontier. These questions map the Tier 2-to-Tier 3 transition.

- **Progressive deletability** -- Q20 asks what technologies will make current scaling infrastructure unnecessary. The scaling system should get simpler over time, not more complex.

- **"Tools shape what you believe is possible"** -- The very act of asking these questions expands the cognitive model of what scaling means. Before this analysis, "infinite scaling" was a vague aspiration. After Phase 2 research answers these questions, it becomes an engineering problem with known parameters.

---

*22 research questions across 7 domains. 12 at P0. 10 at P1. 1 at P2. Ready for Phase 2 research agent deployment.*
