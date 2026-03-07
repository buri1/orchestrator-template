# Agent-Delivered Contract Economics: Real Numbers for 2025-2026

**Phase 2 Research Agent | Revenue Architecture Cluster (Q1, Q2, Q4)**
**Date**: 2026-03-05
**Lens**: IndyDevDan — "Knowing is engineering; not knowing is vibe coding"

---

## Executive Summary

This research answers five interconnected questions about the economics of delivering software contracts with AI agents. The core finding: agent-augmented contract delivery achieves **60-90% gross margins** depending on service type, with the critical variable being **human oversight time**, not token costs. The $6/developer-day average for Claude Code obscures massive variance by task type. Competitor pricing (Devin, Factory, Cosine) has collapsed to $20-100/month, making the cost-of-goods for agent-delivered work nearly negligible compared to the value captured.

---

## 1. Fully-Loaded Cost to Deliver a $10K Software Contract with AI Agents

### The Cost Stack

For a $10,000 contract (e.g., a custom dashboard, API integration, or simple AI agent), here is the fully-loaded cost breakdown based on aggregated industry data:

| Cost Category | Low Estimate | High Estimate | Notes |
|---|---|---|---|
| **LLM API / Subscription** | $50 | $200 | Claude Max at $100-200/mo covers most projects |
| **Infrastructure** | $20 | $100 | Hosting, CI/CD, staging environments |
| **Human Review & QA** | $800 | $2,500 | 10-30 hours at $80-100/hr effective rate |
| **Revision Cycles** | $400 | $1,500 | 1-3 revision rounds, mostly re-prompting agents |
| **Client Communication** | $300 | $800 | Scoping calls, demos, handoff |
| **Overhead (tools, admin)** | $100 | $300 | Project management, invoicing, contracts |
| **TOTAL COGS** | **$1,670** | **$5,400** | |
| **Gross Margin** | **$4,600-$8,330** | | **46-83%** |

### Key Insight: Human Time Dominates

Token costs are trivial. A developer using Claude Code on the Max plan ($100-200/month) consumes approximately $6/day in API-equivalent tokens ([Anthropic Claude Code Docs](https://code.claude.com/docs/en/costs)). For a one-week project, that's $30-42 in compute. The real cost is the 15-40 hours of human time for:

- **Scoping & architecture decisions** (agents can't negotiate requirements)
- **QA and integration testing** (Upwork's HAPI study showed agents alone complete only 64-68% of tasks; human+agent reaches 85-91%) ([VentureBeat - Upwork Study](https://venturebeat.com/technology/upwork-study-shows-ai-agents-excel-with-human-partners-but-fail))
- **Client communication** (irreducible human cost)
- **Revision cycles** (scope creep, taste adjustments)

### Real Developer Spending Data

One developer's 8-month tracking revealed: ~10 billion tokens consumed, API-equivalent cost of $15,000+, actual cost on Max plan: $800 total ($100/month). That's a **95% discount** on raw compute via subscription ([Claude Code Pricing Guide](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)). Another developer logged $5,623 in API-equivalent usage across 201 sessions in a single month of July 2025, all covered by the Max plan.

### IndyDevDan Lens

"Knowing is engineering." The difference between a $1,670 and $5,400 COGS on the same $10K contract is **context quality**. Better prompts, better CLAUDE.md files, better agent orchestration = fewer revision cycles = higher margins. The Context/Prompt/Model triad directly determines your cost structure.

---

## 2. Real-World Margins by Deliverable Type

### Margin Comparison Table

| Deliverable Type | Typical Contract Value | Estimated COGS (Agent-Augmented) | Gross Margin | Traditional Agency Margin |
|---|---|---|---|---|
| **Landing Page** | $2,000-5,000 | $300-800 | 75-85% | 40-60% |
| **Custom Dashboard** | $10,000-30,000 | $2,000-6,000 | 70-80% | 30-50% |
| **API / Backend Service** | $5,000-15,000 | $1,000-3,000 | 70-80% | 35-55% |
| **Full-Stack App (MVP)** | $15,000-50,000 | $5,000-15,000 | 60-70% | 25-45% |
| **Data Pipeline / ETL** | $8,000-25,000 | $1,500-5,000 | 75-80% | 30-50% |
| **Migration Project** | $10,000-40,000 | $3,000-12,000 | 65-70% | 25-40% |
| **AI Agent / Chatbot** | $10,000-50,000 | $3,000-10,000 | 70-80% | N/A (new category) |
| **AI Consulting** | $5,000-20,000 | $500-2,000 | 85-90% | 50-70% |

### Validated Case Studies

1. **AI Automation Agency**: $38,000/month revenue, 73% profit margins ([High-Margin AI Business Models](https://www.humai.blog/high-margin-ai-business-models-financial-analysis-2025/))

2. **Legal Tech Agent (Contract Review)**: Deployed to 8 law firms, $672,000 year-one revenue, 73% gross margins ([ALM Corp Revenue Blueprint](https://almcorp.com/blog/make-money-ai-digital-agencies-2026/))

3. **Restaurant Scheduling Agent**: $60K development cost, licensed to 35 restaurants at $399/month = $167K ARR with 85% margins ([Chargebee Pricing Playbook](https://www.chargebee.com/blog/pricing-ai-agents-playbook/))

4. **Solo AI Freelancer**: $10,000 MRR within 6 months, tools cost $50/month (ChatGPT + Midjourney), 85% gross margin, $7,000/month net ([DigitalApplied Guide](https://www.digitalapplied.com/blog/build-sell-custom-ai-agents-developer-revenue-guide))

5. **Content Agency (4 employees)**: Repositioned with AI delivery, charging $3,000-8,000/month retainers for 8-12 articles monthly vs. old $150-300/article model ([Digital Agency Network](https://digitalagencynetwork.com/ai-agency-pricing/))

### The Margin Unlock

Traditional agencies operate at 30-60% gross margins because labor is their primary cost. Agent-augmented delivery inverts this: **variable costs (tokens, compute) are <5% of revenue**, making human oversight the only meaningful cost line. A consultant billing $200/hour incurs perhaps $20-40 in direct costs, yielding 80-90% gross margins on consulting work ([Articsledge AI Agency Model](https://www.articsledge.com/post/ai-agency-business-model)).

The critical quote from industry data: "Because AI handles 80% of the execution, the profit margin on each project increases exponentially as the freelancer gets faster at oversight."

---

## 3. Token-Cost-Per-Deliverable for Common Project Types

### Claude API Pricing (Current, March 2026)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Cache Read | Cache Write |
|---|---|---|---|---|
| **Opus 4.6** | $5.00 | $25.00 | $0.50 | $6.25 |
| **Sonnet 4.6** | $3.00 | $15.00 | $0.30 | $3.75 |
| **Haiku 4.5** | $1.00 | $5.00 | $0.10 | $1.25 |

Source: [Anthropic Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

### SWE-Bench Cost Per Resolved Issue

The SWE-rebench leaderboard now tracks cost-per-problem as a first-class metric ([SWE-rebench](https://swe-rebench.com)):

| Agent/Model | Resolve Rate | Cost Per Problem | Notes |
|---|---|---|---|
| **Claude Opus 4.5 (medium)** | ~70% | $0.72 | Without caching |
| **Claude Sonnet 4** | ~65% | $0.91 (Aug) -> optimized | Dropped with prompt caching |
| **Gemini 3 Pro Preview** | ~60% | $0.46 | Budget-competitive |
| **Budget agents (Grok Fast, gpt-oss)** | 29-30% | $0.03-0.04 | Low quality, cheap |

Key finding: **Prompt caching dropped Claude Sonnet 4's per-problem cost from $5.29 to $0.91** — an 83% reduction — validating IndyDevDan's "context is highest leverage" thesis.

### Estimated Token Costs by Project Type

Based on developer reports and session data, here are estimated token costs per deliverable using Claude Code (Sonnet, Max plan or API):

| Project Type | Estimated Sessions | Tokens (Input+Output) | API Cost (Sonnet) | Max Plan Cost |
|---|---|---|---|---|
| **Landing page** (simple) | 3-5 | 2-5M | $10-25 | ~$3 effective |
| **REST API** (5-10 endpoints) | 8-15 | 10-25M | $50-125 | ~$15 effective |
| **Dashboard** (React + backend) | 15-30 | 25-60M | $125-300 | ~$30 effective |
| **Full-stack MVP** | 30-60 | 60-150M | $300-750 | ~$60 effective |
| **Data pipeline** | 10-20 | 15-40M | $75-200 | ~$20 effective |
| **Migration** (medium codebase) | 20-40 | 40-100M | $200-500 | ~$40 effective |

Note: "Max Plan Cost" is the amortized effective cost assuming ~$200/month covers 200M+ tokens of usage. The Max plan provides roughly **93-95% savings** over raw API costs for heavy users ([Faros AI Token Limits Guide](https://www.faros.ai/blog/claude-code-token-limits)).

### The 90% Cache Read Finding

A critical optimization detail: **over 90% of all tokens consumed in Claude Code sessions are cache reads**, which cost only 10% of standard input pricing. This means the effective per-token cost is dramatically lower than headline rates suggest ([BrainGrid Claude Code Pricing](https://www.braingrid.ai/blog/claude-code-pricing)).

---

## 4. Competitor Pricing: Devin, Factory AI, Cosine/Genie

### Pricing Comparison Table (March 2026)

| Service | Free Tier | Entry Paid | Pro/Team | Enterprise | Pricing Model |
|---|---|---|---|---|---|
| **Devin** (Cognition) | - | $20/mo (Core) | $500/mo (Team, 250 ACUs) | Custom | Per-ACU ($2.00-2.25/ACU) |
| **Factory AI** | BYOK (free) | $20/mo (Pro) | - | Custom (~$2,000/mo) | Token-based |
| **Cosine Genie** | 80 tasks (one-time) | $20/mo (Hobby, 80 tasks) | $99/user/mo (Pro, 240 tasks) | Custom | Per-task (flat rate) |
| **Claude Code** | Limited | $20/mo (Pro) | $100-200/mo (Max 5x/20x) | API usage-based | Subscription + tokens |
| **Cursor** | Free tier | $20/mo (Pro) | $40/mo (Business) | Custom | Subscription + usage |
| **GitHub Copilot** | Free tier | $10-19/mo | $39/mo (Enterprise) | Custom | Per-seat |

Sources: [Devin Pricing](https://devin.ai/pricing), [Factory Pricing](https://factory.ai/pricing), [Cosine Pricing](https://cosine.sh/pricing), [Lindy - Devin Analysis](https://www.lindy.ai/blog/devin-pricing)

### Devin Deep Dive

- **1 ACU = ~15 minutes of active Devin work** = ~$2.00-2.25
- **1 hour of Devin = $8-9** on Team plan
- **Devin 2.0** completes 83% more tasks per ACU than v1 ([VentureBeat](https://venturebeat.com/programming-development/devin-2-0-is-here-cognition-slashes-price-of-ai-software-engineer-to-20-per-month-from-500))
- Real cost for a meaningful task (restore feature, modify design): ~1 ACU ($2)
- Complex multi-file task: 5-15 ACUs ($10-34)

### Cosine Genie Deep Dive

Cosine's task-based model is philosophically distinct: "We charge for completed units of work, not every interaction." Once you start a task, you iterate as many times as needed within that single task cost. This eliminates "prompt anxiety" and aligns incentives with outcomes ([Cosine Blog](https://cosine.sh/blog/ai-coding-agent-pricing-task-vs-token)).

At $99/month for 240 tasks, effective cost per task = **$0.41**. Compare to SWE-bench average costs of $0.46-0.91 per resolved issue.

### Factory AI Deep Dive

Factory uses token-based billing (BYOK or included tokens) and positions as "agent-native software development." One notable data point: a user canceled two AI Max plans and switched to Factory's Droids, suggesting competitive value ([Every.to Vibe Check](https://every.to/vibe-check/vibe-check-i-canceled-two-ai-max-plans-for-factory-s-coding-agent-droid)).

### What This Means for Contract Delivery

The tool cost for delivering a $10K contract using any of these agents is **$20-200/month** — representing **0.2-2% of contract value**. The pricing war between agent-as-a-service providers benefits contract deliverers enormously: the cost of the "factory floor" is approaching zero.

---

## 5. The $6/Developer-Day Average: Breakdown by Task Type

### How $6/Day Breaks Down

The headline statistic — average $6/day, 90% of users under $12/day — comes from Anthropic's own data on Claude Code usage ([Anthropic Docs](https://code.claude.com/docs/en/costs)). But this average masks extreme variance:

| Task Category | Estimated Daily Token Cost | Tokens/Session | Why |
|---|---|---|---|
| **Simple bug fixes** | $1-3 | 50K-200K | Small context, quick resolution |
| **Unit test writing** | $2-4 | 100K-300K | Repetitive patterns, cacheable |
| **Code review / refactor** | $3-8 | 200K-500K | Large context reads |
| **New feature (small)** | $5-12 | 300K-800K | Multi-file creation |
| **New feature (complex)** | $10-25 | 500K-2M | Extended thinking, iteration |
| **Architecture / planning** | $8-20 | 500K-1.5M | Deep reasoning, long outputs |
| **Large codebase exploration** | $15-40 | 1M-5M | Massive input context |
| **Multi-agent orchestration** | $20-50+ | 2M-10M+ | Multiple parallel sessions |

### Cost Drivers Explained

1. **Context size is king**: A project with 50,000 lines costs significantly more per task than a fresh 500-line script. If input exceeds 200K tokens, costs can effectively double due to caching dynamics.

2. **Extended thinking**: Enabled by default with 31,999 token budget. Thinking tokens are billed as output tokens (the expensive direction at $15-25/M). For complex planning tasks, thinking can consume 50-80% of total cost.

3. **Model selection**: Opus 4.6 costs 5x more than Sonnet 4.6 for equivalent token volume. Most daily work should use Sonnet; reserve Opus for complex multi-file reasoning.

4. **Cache efficiency**: Over 90% of tokens are cache reads at 10% of input price. First-time reads of large codebases are expensive; subsequent queries on the same files are cheap.

### Cost Optimization Strategies (IndyDevDan Lens)

The Context/Prompt/Model triad directly maps to cost:

- **Better Context** (CLAUDE.md, structured prompts, clear codebase docs) = fewer iteration cycles = lower cost
- **Better Prompts** (specific, scoped, with examples) = less extended thinking needed = lower output tokens
- **Right Model** (Haiku for simple, Sonnet for daily, Opus for complex) = optimal cost-per-capability

Practical optimization moves:
- Use `/compact` to manage conversation length and reduce context bloat
- Use plan mode (Shift+Tab x2) before expensive operations to prevent costly rework
- Scope tasks narrowly: multiple small, focused sessions cost less than one sprawling session
- Leverage `.claudeignore` to exclude irrelevant files from context

---

## Synthesis: The Agent-Delivered Contract P&L

### Model P&L for a Solo Operator (Monthly)

```
Revenue:
  2 x $10K contracts/month                    $20,000

Cost of Goods Sold:
  Claude Max 20x subscription                    $200
  Infrastructure (hosting, CI/CD)                 $100
  Other tools (Cursor, Devin, etc.)               $100
  Human time: 60 hours @ $0 (your time)             $0
                                              --------
  Total COGS (excl. your time)                    $400

Gross Profit                                  $19,600  (98%)

Operating Expenses:
  Your time opportunity cost (60 hrs)          $6,000   (@ $100/hr equivalent)
  Client acquisition                           $1,000
  Admin / accounting                             $500
                                              --------
  Total OpEx                                   $7,500

Net Profit                                    $12,100  (60.5%)
```

### Model P&L for an AI Agency (3 people, Monthly)

```
Revenue:
  8 x $10K contracts/month                    $80,000
  2 x $5K retainers/month                    $10,000
                                              --------
  Total Revenue                               $90,000

Cost of Goods Sold:
  Claude Max x3                                   $600
  Devin Team                                      $500
  Infrastructure                                  $500
  Subcontractors (overflow)                     $3,000
                                              --------
  Total COGS                                   $4,600

Gross Profit                                  $85,400  (95%)

Operating Expenses:
  3 salaries / draws                          $30,000
  Office / tools                               $2,000
  Marketing / sales                            $3,000
  Legal / accounting                           $1,500
                                              --------
  Total OpEx                                  $36,500

Net Profit                                    $48,900  (54%)
Gross Margin (excl. labor)                       95%
Net Margin (incl. labor)                         54%
```

### The Bottom Line

The economics of agent-delivered contract work are structurally different from traditional software services:

1. **Token costs are noise**: At $6/day average, monthly compute for a full-time developer is $120-180. On a Max plan, it's $100-200 flat. This is <2% of revenue on a $10K contract.

2. **Human oversight is the bottleneck**: Upwork's HAPI study proves agents alone complete 64-68% of tasks. The 32-36% gap requires human judgment, and that's where your margin lives or dies.

3. **Context quality determines margin**: Per IndyDevDan's triad, better context (structured repos, clear CLAUDE.md, good agent orchestration) directly reduces iteration cycles, which is the primary cost driver.

4. **The pricing collapse is your friend**: Devin dropped from $500 to $20/month. Cosine charges $0.41/task. Factory is BYOK-free. The cost of the "factory floor" approaches zero.

5. **Value-based pricing is mandatory**: Charging hourly in an AI-augmented world is leaving money on the table. A dashboard that takes 1 week with AI but would take 6 weeks without it should be priced at the 6-week value ($30K-50K), not the 1-week cost ($5K).

---

## Sources

### Agent Delivery Economics & Margins
- [AI Agent Development Cost: Full Breakdown for 2026 - Azilen](https://www.azilen.com/blog/ai-agent-development-cost/)
- [AI Agency Pricing Guide 2025 - Digital Agency Network](https://digitalagencynetwork.com/ai-agency-pricing/)
- [High-Margin AI Business Models: Financial Analysis 2025](https://www.humai.blog/high-margin-ai-business-models-financial-analysis-2025/)
- [AI Agency Business Model: How They Make Money - Articsledge](https://www.articsledge.com/post/ai-agency-business-model)
- [How to Make Money with AI for Digital Agencies 2026 - ALM Corp](https://almcorp.com/blog/make-money-ai-digital-agencies-2026/)
- [Build and Sell Custom AI Agents: Developer Guide - DigitalApplied](https://www.digitalapplied.com/blog/build-sell-custom-ai-agents-developer-revenue-guide)
- [Selling Intelligence: The 2026 Playbook For Pricing AI Agents - Chargebee](https://www.chargebee.com/blog/pricing-ai-agents-playbook/)

### Token Costs & Developer Spending
- [Manage costs effectively - Claude Code Docs](https://code.claude.com/docs/en/costs)
- [Claude Code Pricing Guide: Which Plan Saves You Money - KSRed](https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/)
- [Claude Code Token Limits Guide - Faros AI](https://www.faros.ai/blog/claude-code-token-limits)
- [Claude Code Pricing: Complete Guide - BrainGrid](https://www.braingrid.ai/blog/claude-code-pricing)
- [Pricing - Claude API Docs](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude Code Pricing: Optimize Your Token Usage](https://claudefa.st/blog/guide/development/usage-optimization)

### SWE-Bench & Benchmarks
- [SWE-rebench Leaderboard](https://swe-rebench.com)
- [SWE-bench - Vals.ai](https://www.vals.ai/benchmarks/swebench)
- [Claude Sonnet 4.6 Benchmarks - NxCode](https://www.nxcode.io/resources/news/claude-sonnet-4-6-complete-guide-benchmarks-pricing-2026)

### Competitor Pricing
- [Devin Pricing](https://devin.ai/pricing)
- [Devin 2.0 Price Drop - VentureBeat](https://venturebeat.com/programming-development/devin-2-0-is-here-cognition-slashes-price-of-ai-software-engineer-to-20-per-month-from-500)
- [Devin Pricing Feature Breakdown - Lindy](https://www.lindy.ai/blog/devin-pricing)
- [Factory AI Pricing](https://factory.ai/pricing)
- [Factory AI Review - Fritz.ai](https://fritz.ai/factory-ai-review/)
- [Cosine Pricing](https://cosine.sh/pricing)
- [Pricing AI Coding Agents: Task vs Token - Cosine Blog](https://cosine.sh/blog/ai-coding-agent-pricing-task-vs-token)
- [Vibe Check: Factory's Coding Agent Droid - Every.to](https://every.to/vibe-check/vibe-check-i-canceled-two-ai-max-plans-for-factory-s-coding-agent-droid)

### Human+Agent Performance
- [Upwork HAPI Study - VentureBeat](https://venturebeat.com/technology/upwork-study-shows-ai-agents-excel-with-human-partners-but-fail)
- [Upwork Human+Agent Productivity Index Press Release](https://investors.upwork.com/news-releases/news-release-details/upwork-humanagent-productivity-index-reveals-70-boost-work)

### AI Agent Market & Freelance Rates
- [AI Agent Development Freelance Rates 2026](https://www.ai-agentsplus.com/blog/ai-agent-freelance-rates-2026)
- [AI Agent Development Cost $5K-$500K Pricing Guide](https://www.ai-agentsplus.com/blog/ai-agent-development-cost-pricing-guide-2026)
- [AI Automation Agency Pricing 2026: A CFO's Guide](https://optimizewithsanwal.com/ai-automation-agency-pricing-2026-a-cfos-guide/)
- [The AI Pricing and Monetization Playbook - Bessemer](https://www.bvp.com/atlas/the-ai-pricing-and-monetization-playbook)
