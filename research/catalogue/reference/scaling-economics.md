# Agent Scaling Economics

> **Cost curves, coordination overhead, optimal team sizes, and token economics for multi-agent LLM systems from 1 to 100 agents.**

| Field | Value |
|-------|-------|
| Category | 📊 Reference |
| Primary Source | Google DeepMind/MIT: "Towards a Science of Scaling Agent Systems" (arXiv:2512.08296) |
| Supporting Sources | Stripe Minions blog (Feb 2026), SmartBear/Cisco 3.2M LOC study, GitClear 211M changed lines, 143 open-source project merge study |
| Evidence Base | 180 controlled experiments (DeepMind), 1,300+ weekly PRs (Stripe), 1,642 failure traces, 50+ academic/industry sources |
| Maturity | 🟢 Production-validated (Stripe, Google internal data) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## The Central Constraint

Coordination overhead in multi-agent LLM systems scales with exponent **1.724** -- super-quadratic, worse than Brooks' Law for human teams. This is not a soft limit to engineer around; it is a measured property of multi-agent token economics derived from 180 controlled experiments. Doubling agent count more than triples coordination cost.

The only pattern proven to scale past this limit is Stripe's one-shot isolated agents: zero inter-agent coordination, deterministic context assembly before the LLM call, single execution per task, maximum 2 retries.

---

## Three Scaling Regimes

### Regime 1: Linear (1-5 agents)

Token costs scale ~1:1 per agent. Each agent operates independently with its own context window. Infrastructure overhead is negligible. Free tiers cover GitHub Actions, Langfuse, and most tooling.

**Monthly cost:** $230-$1,130 (Claude Max covers most)

### Regime 2: Superlinear (5-20 agents)

Coordination overhead introduces a **6-8x cost multiplier** (not the naive 4x) versus the 5-agent baseline. A 5-agent hierarchy burns 50K+ tokens on coordination alone per task cycle. Free tiers exhaust. API billing becomes mandatory. ITPM limits become binding.

**Monthly cost:** $2,890-$6,500

### Regime 3: Step-Function (20-100 agents)

Every infrastructure component hits hard limits: API rate limits at 10-20 agents, context degradation at 15-25, human review capacity at 20-30, machine resources at 30-50, CI/CD saturation at 40-100.

**Monthly cost:** $10,350-$47,140

---

## Cost-Per-Agent Curve (U-Shaped)

The minimum cost per agent occurs at **5-10 agents**. Below 5, fixed costs are under-amortized. Above 10, coordination overhead and infrastructure step-functions drive marginal costs upward.

| Agents | Total Monthly (mid) | Cost/Agent | Marginal Cost/Agent |
|--------|---------------------|------------|---------------------|
| 1 | $200-400 | $200-400 | N/A |
| 5 | $680 | **$136** | $95 (economies of scale) |
| 10 | ~$2,650 | ~$200 | ~$200 (rising) |
| 20 | $4,700 | $235 | $268 (coordination premium) |
| 50 | $15,500 | $310 | $360 (infrastructure step) |
| 100 | $34,000 | $340 | $370 (continued premium) |

**Sweet spot for ROI: 5-15 agents.**

---

## DeepMind Coordination Overhead (arXiv:2512.08296)

180 controlled experiments. The definitive measurements:

| Metric | Single Agent | Independent MAS | Centralized MAS | Hybrid MAS |
|--------|-------------|-----------------|-----------------|------------|
| Token consumption | 1.0x | 1.58x | 3.85x | 6.15x |
| Error amplification | 1.0x | 17.2x | 4.4x | Lowest |
| Coordination overhead | 0% | 58% | 285% | 515% |

### Key Numbers

- **Exponent 1.724**: Communication overhead scales super-quadratically
- **45% threshold**: Once a single agent exceeds ~45% accuracy, adding agents yields diminishing or negative returns (beta = -0.408, p < 0.001)
- **Sequential task penalty**: Multi-agent variants degrade performance by **39-70%** while consuming 4-6x more tokens
- **4.4x vs 17.2x**: Centralized orchestration (our pattern) contains error amplification to 4.4x; independent agents let it reach 17.2x -- a 4x safety differential
- **Hybrid overhead**: 515% overhead with -2.4% vs decentralized -- never worth it

---

## Optimal Team Sizes

Multiple independent sources converge on **3-4 agents maximum** for coordinated work:

| Source | Finding |
|--------|---------|
| Google DeepMind | Effective team sizes limited to ~3-4 agents |
| HyperAgent (SWE-Bench) | 4 specialized agents, 33% on SWE-Bench-Verified |
| DyLAN | Dynamic minimum effective subset consistently selects fewer agents |
| Cursor | 20 shared-context agents = output of 2-3 agents (lock contention) |
| steipete | Sweet spot ~4 agents for cleanup/tests/UI work |

### Single-Agent-with-Skills Alternative

A January 2026 paper shows compiling multi-agent systems into single-agent skill libraries reduces token consumption by **53.7%** while maintaining or improving performance (+4.0% on HotpotQA). API calls reduced up to 75%. However, skill selection degrades non-linearly past a capacity threshold.

---

## Topology Cost Profiles

| Topology | Communication | Cost Profile | Best For |
|----------|---------------|--------------|----------|
| **Star (hub-and-spoke)** | O(N) | Predictable, orchestrator absorbs overhead | 1-15 agents |
| **Mesh (all-to-all)** | O(N^2) | Explosive -- 5 agents = 25x single agent in comms tokens | Never recommended |
| **Pipeline (sequential)** | O(N) | Efficient but slow | Dependent tasks only |
| **One-shot isolated** | O(1) per agent | Linear total, zero coordination | 15+ agents, parallelizable tasks |

### Recommended Topology by Scale

| Scale | Topology | Why |
|-------|----------|-----|
| 1-5 agents | Hub-and-spoke (star) | O(N) communication; orchestrator absorbs coordination |
| 5-15 agents | Star + model tiering | Haiku scouts, Sonnet code, Opus orchestration |
| 15-30 agents | One-shot isolated (Stripe pattern) | Zero coordination overhead; tasks must be independently decomposable |
| 30-50 agents | One-shot + directory partitioning + Refinery merge | Isolated workers, serialized merge, backpressure |
| 50+ agents | Hierarchical one-shot with team leads | 3-4 layers max (each loses ~20% semantic fidelity) |

**Critical rule:** Keep coordination tokens below 20% of total tokens. Above 20%, you are in the N^1.724 zone.

---

## Breaking Point Cascade

Ordered by agent count at which each system breaks:

| Rank | System | Breaks At | Hard Number |
|------|--------|-----------|-------------|
| 1 | API rate limits | 10-20 agents | Tier 4 Sonnet ITPM: 2,000,000. Supports 10-15 concurrent agents. |
| 2 | Context window degradation | 15-25 agents | >30% performance drop for mid-context info. 98.6-99.3% compression rate per compaction. |
| 3 | Human review queue | 20-30 agents | 5-6 PRs/day max (SmartBear/Cisco). 3-4 hour cognitive ceiling. |
| 4 | Machine resources | 30-50 agents | 2-4GB RAM per agent. Mac Studio M3 Ultra: 15-25 active agents. |
| 5 | Git merge conflicts | 30-50 agents | N(N-1)/2 conflict pairs. 19-20% base conflict rate. 30-50% agent time lost. |
| 6 | CI/CD pipeline saturation | 40-100 agents | Free tier: 2,000 min/month. 20 concurrent jobs (Free), 500 (Enterprise). |

---

## Token Economics

### API Pricing (March 2026)

| Model | Input/1M tokens | Output/1M tokens | With Prompt Caching (90% off input) |
|-------|-----------------|-------------------|--------------------------------------|
| Haiku 4.5 | $1.00 | $5.00 | $0.10 / $5.00 |
| Sonnet 4.5 | $3.00 | $15.00 | $0.30 / $15.00 |
| Opus 4.6 | $5.00 | $25.00 | $0.50 / $25.00 |

### Subscription vs. API Inflection

| Agents | Claude Max 20x ($200/mo) | API Sonnet | API Opus |
|--------|--------------------------|------------|----------|
| 1 | Sufficient | ~$180/mo | ~$300/mo |
| 3 | Tight | ~$540/mo | ~$900/mo |
| 5 | **Exceeds limits** | ~$900/mo | ~$1,500/mo |
| 10 | N/A | ~$1,800/mo | ~$3,000/mo |
| 20 | N/A | ~$5,400/mo | ~$9,000/mo |

Claude Max 20x ceiling: **3-5 concurrent heavy agents.** Weekly limits (40 Opus hours, 480 Sonnet hours) are hard caps. The $200/mo subscription vs. $15,000+ API equivalent represents an 18-36x arbitrage -- structurally temporary.

### The Cost Multiplier by Architecture

| Source | Configuration | Measured Multiplier |
|--------|--------------|---------------------|
| Claude Agent Teams | 1 vs. 3-agent team | 3x ($1.13 to $3.38) |
| Anthropic internal | Single vs. multi-agent | 15x tokens (90.2% better on parallelizable tasks) |
| Claude Teams "plan mode" | vs. single session | 7x tokens (coordination overhead) |
| Google Research | Centralized coordination | 4.4x error propagation |
| Google Research | Independent agents | 17.2x error amplification |

---

## Total Cost of Ownership

### Monthly TCO by Scale (Star Topology, Sonnet Workers)

| Cost Category | 5 Agents | 20 Agents | 50 Agents | 100 Agents |
|---------------|----------|-----------|-----------|------------|
| LLM API/Subscription | $200-900 | $2,400-5,400 | $9,000-18,000 | $18,000-40,000 |
| Infrastructure (Hetzner) | $0-55 | $109-220 | $220-500 | $500-1,000 |
| CI/CD (GitHub Actions) | $24-54 | $96-288 | $240-720 | $480-1,440 |
| Observability | $0-29 | $29-199 | $199-500 | $500-2,499 |
| Code Review (CodeRabbit) | $0-75 | $240-300 | $600-750 | $1,200-1,500 |
| Task Automation | $0 | $0-50 | $50-200 | $200-500 |
| Electricity | $5-15 | $15-45 | $40-100 | $80-200 |
| **TOTAL** | **$230-1,130** | **$2,890-6,500** | **$10,350-20,770** | **$20,960-47,140** |

### Margin Curve (No Economies of Scale)

| Scale | Monthly Cost (mid) | Revenue Needed for 50% Margin | Revenue/Agent Needed |
|-------|-------------------|-------------------------------|----------------------|
| 5 agents | $680 | $1,360 | $272 |
| 20 agents | $4,700 | $9,400 | $470 |
| 50 agents | $15,500 | $31,000 | $620 |
| 100 agents | $34,000 | $68,000 | $680 |

Revenue per agent needed for 50% margin **rises with scale** -- each marginal agent must justify an increasingly higher cost.

---

## The Human Bottleneck

| Metric | Value | Source |
|--------|-------|--------|
| Max meaningful code reviews/day | 5-6 | SmartBear/Cisco (3.2M LOC study) |
| Peak cognitive work ceiling | 3-4 hours/day | Ericsson, Newport, Huberman convergence |
| Human conscious processing rate | 10 bits/second | Caltech 2024 |
| AI-generated PR review time | 4.6x longer than human-written | Opsera |
| Incidents per PR increase (AI) | +24% | Cortex 2026 |

### Review Deficit at Scale

| Agents | PRs/Day | After 85% AI Pre-Screen | Human Capacity | Deficit |
|--------|---------|-------------------------|----------------|---------|
| 5 | 15-25 | 2-4 | 5-6 | Manageable |
| 10 | 30-50 | 5-8 | 5-6 | Tight |
| 20 | 60-100 | 9-15 | 5-6 | 2-3x deficit |
| 50 | 150-250 | 23-38 | 5-6 | 4-6x deficit |
| 100 | 300-500 | 45-75 | 5-6 | 8-13x deficit |

The Dracula Effect (3-4 hour daily ceiling on peak cognitive work) is not solvable with tooling. You can make the 3 hours cover more ground through confidence-based triage, but you cannot extend 3 hours to 6.

---

## Quality Degradation at Scale

| Metric | Value | Source |
|--------|-------|--------|
| Issues per PR (AI vs human) | 1.7x more | CodeRabbit |
| Security failure rate | 45% | Veracode |
| Performance inefficiencies | 8x more frequent | CodeRabbit |
| Code readability problems | 3x more | CodeRabbit |
| Non-determinism range | 7.9-83.3% failure on previously solved problems | Robustness study |
| Technical debt by year 2 | 4x traditional maintenance costs | GitClear (211M lines) |

### Chain Reliability (Stripe Insight)

A 5-step chain with 95%/step accuracy yields ~77% end-to-end. At 90%/step: 59%. At 85%/step: 44%. This is why Stripe chose one-shot execution over multi-step chains.

---

## Infrastructure Quick Reference

### Hardware by Scale

| Scale | Minimum Hardware | RAM | Agents Supported |
|-------|-----------------|-----|------------------|
| 1-5 | Mac Mini M4 Pro 64GB | 64GB | 5-8 |
| 5-15 | Hetzner AX102 or Mac Studio M4 Max | 128GB | 15-25 |
| 15-30 | Mac Studio M3 Ultra 192GB or 2x AX102 | 192-256GB | 20-30 |
| 30-50 | 3x Hetzner AX102 | 384GB total | 30-50 |
| 50+ | Cloud infrastructure (VM per agent) | Elastic | Elastic |

Dedicated servers are 2-4x more cost-effective than cloud VPS for sustained workloads.

### Free Tier Exhaustion Points

| Service | Free Tier | Exhausted At |
|---------|-----------|-------------|
| GitHub Actions | 2,000 min/month | ~5 agents |
| Langfuse | 50,000 traces/month | ~10 agents |
| CodeRabbit | Public repos only | Any private repo |
| Trigger.dev | 10,000 runs/month | ~10 agents |
| Claude Max 20x | 40 Opus hrs/week | 3-5 heavy agents |

---

## Cost Optimization Levers

1. **Model tiering**: Opus for orchestration, Sonnet for code, Haiku for scouts -- 3-5x cost reduction
2. **Prompt caching**: 90% input cost reduction on shared codebase context
3. **One-shot isolated execution**: Eliminates coordination exponent entirely -- O(N) not O(N^1.724)
4. **Context curation**: 15 tools from 400 (Stripe pattern) -- prevents "token paralysis"
5. **Hard retry caps**: Max 2 CI rounds per task. After 2 failures: stop, surface to human
6. **Dedicated servers over cloud**: Hetzner AX102 at $109/mo outperforms $380/mo cloud VPS
7. **Self-hosted observability**: Langfuse + Prometheus on $50-200/mo infrastructure

---

## Key Takeaway

> **The coordination overhead exponent of 1.724 is the governing constraint on all agent scaling -- there are no economies of scale in current architectures. The sweet spot is 5-15 agents with star topology and model tiering; beyond that, only one-shot isolated execution (zero inter-agent coordination) has been proven to work at scale.**
