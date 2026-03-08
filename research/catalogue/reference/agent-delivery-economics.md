# Agent Delivery Economics

> **Agent-augmented contract delivery achieves 60-90% gross margins on $10K contracts. Token costs are noise (<2% of revenue). Human oversight time is the critical variable, and context quality directly determines the margin spread.**

| Field | Value |
|-------|-------|
| Category | Reference Document |
| Original Source | `research/2026-03-05_PHASE2_research-agent-delivery-economics.md` |
| Research Phase | Phase 2 |
| Key Sources | Anthropic Claude Code pricing docs, SWE-rebench leaderboard, Upwork HAPI study, Devin/Factory/Cosine pricing, CodeRabbit, industry margin analyses |
| Evidence Base | $6/day average Claude Code cost (Anthropic), 10B token developer tracking, SWE-bench cost-per-problem data, Upwork 64-68% agent completion rate, 5 validated agency case studies |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

The economics of agent-delivered contract work are structurally different from traditional software services. A $10,000 contract delivered with AI agents costs $1,670-$5,400 in fully-loaded COGS, yielding 46-83% gross margins. Token costs average $6/day per developer on Claude Code ($30-42 per week-long project), representing less than 2% of contract value. The real cost driver is human oversight: 15-40 hours for scoping, QA, client communication, and revision cycles.

The Upwork HAPI study provides the critical productivity data: agents alone complete 64-68% of tasks, while human+agent combinations reach 85-91%. The 32-36% gap requiring human judgment is where margin lives or dies. Competitor pricing has collapsed -- Devin dropped from $500 to $20/month, Cosine charges $0.41/task -- making the "factory floor" cost approach zero. One developer tracked 10 billion tokens over 8 months; the API equivalent would have cost $15,000+, but Max plan cost was $800 total (95% discount).

Context quality is the margin multiplier: better CLAUDE.md files, better prompts, and better agent orchestration directly reduce revision cycles (the primary cost driver). Through IndyDevDan's lens, the Context/Prompt/Model triad determines your cost structure.

---

## Key Findings

### Fully-Loaded Cost Stack for a $10K Contract

| Cost Category | Low Estimate | High Estimate | Notes |
|--------------|-------------|--------------|-------|
| LLM API / Subscription | $50 | $200 | Claude Max at $100-200/mo covers most projects |
| Infrastructure | $20 | $100 | Hosting, CI/CD, staging |
| Human Review & QA | $800 | $2,500 | 10-30 hours at $80-100/hr |
| Revision Cycles | $400 | $1,500 | 1-3 rounds, mostly re-prompting |
| Client Communication | $300 | $800 | Scoping, demos, handoff |
| Overhead (tools, admin) | $100 | $300 | PM, invoicing, contracts |
| **TOTAL COGS** | **$1,670** | **$5,400** | |
| **Gross Margin** | **$4,600-$8,330** | | **46-83%** |

### Margins by Deliverable Type

| Deliverable | Contract Value | Agent-Augmented COGS | Gross Margin | Traditional Margin |
|------------|---------------|---------------------|-------------|-------------------|
| Landing Page | $2K-5K | $300-800 | 75-85% | 40-60% |
| Custom Dashboard | $10K-30K | $2K-6K | 70-80% | 30-50% |
| API / Backend | $5K-15K | $1K-3K | 70-80% | 35-55% |
| Full-Stack MVP | $15K-50K | $5K-15K | 60-70% | 25-45% |
| Data Pipeline | $8K-25K | $1.5K-5K | 75-80% | 30-50% |
| AI Consulting | $5K-20K | $500-2K | 85-90% | 50-70% |

### Token Cost Per Deliverable

| Project Type | Sessions | Tokens (I/O) | API Cost (Sonnet) | Max Plan Effective Cost |
|-------------|----------|-------------|-------------------|------------------------|
| Landing page | 3-5 | 2-5M | $10-25 | ~$3 |
| REST API (5-10 endpoints) | 8-15 | 10-25M | $50-125 | ~$15 |
| Dashboard (React + backend) | 15-30 | 25-60M | $125-300 | ~$30 |
| Full-stack MVP | 30-60 | 60-150M | $300-750 | ~$60 |
| Data pipeline | 10-20 | 15-40M | $75-200 | ~$20 |

### The $6/Day Average Masks Extreme Variance

| Task Category | Daily Token Cost | Why |
|--------------|-----------------|-----|
| Simple bug fixes | $1-3 | Small context, quick resolution |
| Unit test writing | $2-4 | Repetitive, cacheable |
| Code review / refactor | $3-8 | Large context reads |
| New feature (small) | $5-12 | Multi-file creation |
| New feature (complex) | $10-25 | Extended thinking, iteration |
| Large codebase exploration | $15-40 | Massive input context |
| Multi-agent orchestration | $20-50+ | Multiple parallel sessions |

### Competitor Pricing Collapse

| Service | Entry Paid | Pro/Team | Pricing Model |
|---------|-----------|----------|---------------|
| Devin (Cognition) | $20/mo | $500/mo (250 ACUs) | Per-ACU ($2.00-2.25) |
| Factory AI | $20/mo (Pro) | Custom (~$2K/mo) | Token-based |
| Cosine Genie | $20/mo (80 tasks) | $99/mo (240 tasks) | Per-task ($0.41 effective) |
| Claude Code | $20/mo (Pro) | $100-200/mo (Max) | Subscription + tokens |

Tool cost for a $10K contract: $20-200/month, representing 0.2-2% of contract value.

### SWE-Bench Cost Per Resolved Issue

| Agent/Model | Resolve Rate | Cost Per Problem |
|------------|-------------|-----------------|
| Claude Opus 4.5 (medium) | ~70% | $0.72 |
| Claude Sonnet 4 | ~65% | $0.91 (optimized) |
| Gemini 3 Pro Preview | ~60% | $0.46 |
| Budget agents | 29-30% | $0.03-0.04 |

Prompt caching dropped Sonnet 4's per-problem cost from $5.29 to $0.91 -- an 83% reduction.

### The 90% Cache Read Finding

Over 90% of all tokens consumed in Claude Code sessions are cache reads, costing only 10% of standard input pricing. Effective per-token cost is dramatically lower than headline rates.

### Validated Case Studies

1. **AI Automation Agency**: $38K/month revenue, 73% profit margins
2. **Legal Tech Agent**: 8 law firms, $672K year-one revenue, 73% gross margins
3. **Restaurant Scheduling Agent**: $60K dev cost, 35 restaurants at $399/mo = $167K ARR, 85% margins
4. **Solo AI Freelancer**: $10K MRR in 6 months, tools $50/mo, 85% gross margin
5. **Content Agency (4 people)**: Repositioned with AI delivery, $3K-8K/month retainers

---

## Actionable Insights

1. **Token costs are noise.** At $6/day average, monthly compute is $120-180. On Max plan, $100-200 flat. This is <2% of revenue on a $10K contract. Stop optimizing for tokens; optimize for human time.
2. **Human oversight is the bottleneck.** Upwork HAPI proves agents complete 64-68% of tasks solo. The 32-36% gap requiring human judgment is where margin lives or dies.
3. **Context quality determines margin.** Better CLAUDE.md files, structured repos, and good orchestration directly reduce iteration cycles -- the primary cost driver. The difference between $1,670 and $5,400 COGS on the same $10K contract is context quality.
4. **Value-based pricing is mandatory.** A dashboard that takes 1 week with AI but 6 weeks without should be priced at 6-week value ($30K-50K), not 1-week cost ($5K).
5. **The pricing collapse is your friend.** Devin dropped from $500 to $20/month. The "factory floor" approaches zero cost.
6. **Cost optimization hierarchy**: Better context > right model selection > prompt caching > batch processing. In that order.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics](scaling-economics.md) | Token cost curves and coordination overhead determine how margins change with agent count |
| [reference/human-review-bottleneck](human-review-bottleneck.md) | The 5-6 PR/day human ceiling directly constrains throughput and therefore revenue per operator |
| [practitioners/elvis-sun](../practitioners/elvis-sun.md) | Elvis spends $190/mo API costs on Mac Studio -- real-world cost validation at solo operator scale |
| [reference/claude-max-economics](claude-max-economics.md) | The Max plan subscription arbitrage ($200/mo vs $15K+ API equivalent) underlying these margins |
| [reference/autonomous-revenue-case-studies](autonomous-revenue-case-studies.md) | Revenue models and projections that depend on these margin economics |
