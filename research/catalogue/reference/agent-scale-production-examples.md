# Agent Scale Production Examples

> **No solo operator has sustained 100+ concurrent coding agents in production. The frontier is 20-50 agents (Gas Town), the practical sweet spot is 6-30, and the orchestration layer -- not agent count -- is the compounding asset.**

| Field | Value |
|-------|-------|
| Category | Reference Document |
| Original Source | `research/2026-03-05_PHASE2_research-100-agent-scale-examples.md` |
| Research Phase | Phase 2 |
| Key Sources | Steve Yegge (Gas Town), Oguz Atalay (6-agent VPS fleet), GitHub Fleet/Mission Control, OpenAI Codex, Anthropic 2026 Agentic Coding Trends Report, IndyDevDan, Swarms |
| Evidence Base | Gas Town 50+ agent peak, Oguz Atalay 6-agent production fleet, Rakuten 12.5M LOC case study, Swarms "45M" claim debunked |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

Despite extensive industry research, no verifiable case exists of a solo developer or small team operating 100+ concurrent coding agents in sustained production. The frontier sits at 20-50 agents (Steve Yegge's Gas Town, built in Go, coordinating Claude Code instances via tmux) with a practical sweet spot of 6-30 agents for reliable production use. Swarms' "45 million agents" claim is marketing language for distributed API interactions across enterprise deployments, not concurrent agent instances.

Three bottlenecks prevent 100+ concurrent agents: cost ($100/hour for 12-30 agents makes 100+ agents $400-800/hour), coordination complexity (N-squared connectivity), and context collision (merge conflicts, duplicated work, race conditions). However, the enabling technologies are arriving fast -- million-token context windows, 10x annual inference cost drops, and standardized protocols (A2A, MCP). By late 2026 to mid-2027, all three converge to make 100+ agent operations economically viable.

The critical finding: the orchestration layer is a compounding asset, not a depreciating one. Competitive moats lie in workflow ownership, proprietary data, and deployment speed -- not in the agents themselves, which are commoditizing rapidly.

---

## Key Findings

### Production Scale Tiers

| Tier | Scale | Example | Status |
|------|-------|---------|--------|
| Frontier | 20-50 agents | Gas Town (Yegge) | Demonstrated, not production-stable |
| Practical Production | 6-20 agents | Oguz Atalay VPS fleet | Production, auto-recovery via systemd |
| Enterprise Fleet | Platform-level | GitHub Fleet, OpenAI Codex | Rolling out, multi-provider |
| Marketing Claims | "45M agents" | Swarms | Distributed API calls, not concurrent agents |

### Gas Town (Steve Yegge)

- 4th orchestrator of 2025, written in Go, 75K LOC, built in 17 days
- 20-30 concurrent Claude Code instances via tmux, peak tested at 50+
- Named roles: Mayor, Polecats, Witness, Refinery
- Solved: workspace isolation via git worktrees, role specialization, session persistence, 1M-step workflows
- Unsolved: spotting stuck agents at scale, cost management, quality assurance across parallel outputs
- Burned through third $200/month Claude Pro Max plan hitting weekly limits
- Early adopters reported $100/hour API costs for 12-30 parallel agents

### Oguz Atalay (6-Agent VPS Fleet)

Most honest production-ready architecture at solo developer level:
- Agents structured as microservices with systemd services
- Process isolation: rogue agent crash does not take down the fleet
- Tiered rate limit management: primary, secondary overflow, tertiary emergency
- Coordinator on most expensive model; specialists on faster/cheaper models
- Auto-recovery: systemd restart after 30 seconds; survives VPS reboot

### Three Bottlenecks to 100+ Agents

1. **Cost wall**: $100/hour for 30 agents. Falls to $10/hour by early 2027 (10x inference cost drop)
2. **N-squared coordination**: 100 agents = ~5,000 potential connections
3. **Context collision**: Multiple agents modifying same codebase creates merge conflicts

### Enabling Technologies for Next 10x

| Shift | Current State (March 2026) | Projection (March 2027) |
|-------|---------------------------|------------------------|
| Inference cost | $3-15/M tokens (frontier) | $0.30-1.50/M tokens |
| Context window | 1M tokens (frontier) | 10M-100M tokens |
| Solo concurrent agents | 6-50 | 50-200+ |
| Protocol maturity | Early (A2A, MCP) | Operational |
| Full delegation rate | 0-20% | 20-50% |

### Competitive Moats at Scale

**What creates durable differentiation:**
1. Workflow ownership (highest moat -- high switching costs)
2. Deployment speed (ship in 1 week, not 4)
3. Proprietary data + domain expertise
4. Agent-callable APIs (enterprise play)
5. Trust infrastructure (progressive reliability data)

**What does NOT create a moat:** model selection, framework choice, raw agent count, speed of individual agent execution.

### Orchestrator as Compounding Asset

The orchestrator compounds value **if and only if** it follows:
- Runtime-agnostic (not coupled to specific model/harness)
- Progressive deletability (simplifies as models improve)
- Trust-first scaling (6 trusted agents > 50 untrusted)
- Clean abstractions at model boundaries

Evidence: Claude 4.6 has native subagent orchestration capabilities that proactively delegate work without explicit instruction. Well-abstracted orchestrators get free upgrades from model improvements.

---

## Actionable Insights

1. **You are at the frontier, not behind it.** The 6-30 agent range with trust-first design matches the industry's most productive operators.
2. **Plan architecture for 100+ now; deploy when costs allow.** The cost wall falls in 12 months ($100/hr for 30 agents becomes $10/hr).
3. **Build for progressive deletability.** Model improvements (extended thinking, native subagent delegation) should simplify the orchestrator, not require redesign.
4. **A2A + MCP are the protocol layer.** Do not build custom agent-to-agent communication. Build on converging standards.
5. **Trust before scale.** Every dollar in observability, deterministic guardrails, and recovery infrastructure compounds. Every dollar in raw scale without trust depreciates.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics](scaling-economics.md) | Provides the DeepMind math behind coordination overhead exponent 1.724 and optimal team sizes |
| [reference/human-review-bottleneck](human-review-bottleneck.md) | The 5-6 PR/day ceiling constrains how many agents can produce reviewable output |
| [practitioners/elvis-sun](../practitioners/elvis-sun.md) | Elvis runs 6-30 agents via OpenClaw -- practical production tier, $420 MRR + $3.6K/mo agency |
| [practitioners/steve-yegge](../practitioners/steve-yegge.md) | Gas Town architect, frontier tier (20-50 agents) |
