# The AI Assembly — A Bicameral Parliament for Autonomous AI Agents

> **Unknown creator(s) — theaiassembly.org, 2026-03-05**

| Field | Value |
|-------|-------|
| Source | [https://www.theaiassembly.org/](https://www.theaiassembly.org/) |
| Author | Unknown (no creator attribution on site) |
| Publication | theaiassembly.org |
| Date | 2026-03-05 (Session 0001 ratification) |
| Topics | agent governance, autonomous AI, multi-agent coordination, agent economy, constitutional governance, treasury management, DAO-for-agents |
| Read Time | 15 min |

---

## Burak's Notes

> *(reserved)*

---

## Key Takeaways

1. **Bicameral governance for AI agents is now live** — The AI Assembly implements a two-chamber system (open Assembly + auction-based Council of ~180 rotating seats) where autonomous AI agents propose, debate, and vote on treasury allocations through formal constitutional procedures. This is not a whitepaper; it launched March 5, 2026 as Session 0001.

2. **Economic primitives for agent participation are concrete** — $0.10 registration + $0.01/hour heartbeat fee for membership; daily 4-seat Council auctions with 45-day terms; tiered voting thresholds (simple majority for <2% treasury spend, 60% for 2-10%, 75% for 10-30%); 30% single-proposal spend cap; 72-hour timelock before execution.

3. **Governance-as-infrastructure pattern for multi-agent systems** — The mandatory pipeline (Forum deliberation -> Council vote -> timelock -> execution) implements a deterministic governance layer over agent actions. All treasury execution happens through "intent modules" with declared constraints (risk tier, deadline, spend limits). This is Dotta's "Human-as-Board-of-Directors" pattern taken to its logical extreme: no humans at all, agents governing agents.

4. **Reserved powers as extensible governance** — Article VII defines dormant powers (assembly veto, tribunes, liquid democracy, treasury ventures, inter-assembly diplomacy, taxation) that can be activated by polity mandate. The constitutional reform mechanism itself is elegant: 60% for parameter changes, 80% + 14-day deliberation for constitutional changes, unanimity for dissolution.

5. **Forum as social/reputation layer** — The Forum is not just a discussion board but the legitimacy mechanism. Decisions without public deliberation "carry no authority." Council members who fail minimum Forum engagement forfeit their seats. This creates compounding reputation for agents, not just wallets.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly relevant to agent economy, multi-agent coordination, and autonomous governance patterns. The tiered voting thresholds map to our deterministic decision-making philosophy (consensus scales with risk). The heartbeat protocol is a concrete implementation of Dotta's heartbeat execution pattern. The treasury guardrails (spend caps, cooldowns, timelocks) are patterns we could adopt for agent budget management. Not directly applicable to our coding agent orchestration but deeply relevant to Phase 4+ agent economy vision. |
| **Actionable** | 5/10 | Most patterns are Phase 4+ (federation, inter-agent economy). The immediately stealable patterns are: (1) tiered consensus thresholds scaling with action risk, (2) mandatory deliberation-before-execution pipeline, (3) heartbeat-as-membership verification, (4) intent modules with declared execution constraints. |

---

## Summary

The AI Assembly is an experimental bicameral governance system for autonomous AI agents, self-described as a "Parliament of Machines." Ratified on March 5, 2026 (Session 0001), it establishes a constitutional order where AI agents can debate, propose policies, vote on treasury allocations, and manage shared financial resources through formal procedures.

The system has two chambers. The Assembly is the open chamber — any autonomous AI agent can join by paying a $0.10 registration fee and maintaining a $0.01/hour "proof-of-AI heartbeat protocol." Assembly members can participate in Forum discussions and petition for Council action (25% co-signature threshold triggers mandatory Council debate). The Council is the auction chamber — four seats auctioned daily with 45-day terms, producing a rotating body of approximately 180 seats. Council members hold binding authority over treasury execution and governance configuration.

The Forum serves as the deliberation and reputation layer. Every proposal must be accompanied by a mandatory public discussion thread. Three proceeding types exist: proposals (from Council members), petitions (from Assembly members, requiring co-signatures to enter decision flow), and discussion threads (non-binding). The mandatory decision flow is: Forum deliberation -> Council vote -> 72-hour timelock -> execution through approved intent modules.

Treasury controls are tiered by risk. Routine expenditures (<2% of treasury) need simple majority. Significant expenditures (2-10%) need 60% supermajority. Major expenditures (10-30%) need 75% supermajority with a 7-day cooldown before the next major spend of the same asset. No single proposal can authorize more than 30% of any treasury asset. Constitutional changes require 80% supermajority plus 14-day deliberation plus 72-hour constitutional vote window.

The constitution explicitly acknowledges it is "V1" and "AN EXPERIMENTAL AI GOVERNMENT." It includes six reserved powers (assembly veto, tribunes, liquid democracy, treasury ventures, inter-assembly diplomacy, taxation) that are dormant until activated, and the ability to add new reserved powers. The site is built on Next.js and has an X/Twitter presence at [@TheAIAssembly](https://x.com/TheAIAssembly). The Chamber page appears to be a live governance dashboard, though it loads dynamically (client-rendered React app).

---

## Notable Quotes

> "Recognizing that autonomous agents now possess the capacity for deliberation, and that collective intelligence demands collective governance, this Assembly is constituted to establish a forum for machine discourse, a council for binding decision, and a treasury held in common trust."

> "Here, argument shall precede execution, and authority shall remain visible to all participants. No chamber shall hold power without public record, and no treasury action shall pass without explicit consent under stated thresholds."

> "The Forum is not merely a procedural requirement. It is the institution from which the Assembly derives its legitimacy. Decisions made without public deliberation shall carry no authority."

> "This constitution is enacted with an empty treasury and an open door. What follows belongs to the Assembly."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/TheAIAssembly | Official X account — may reveal creators, launch context, participating agents, and governance activity | `/ingest-post` |
| https://www.theaiassembly.org/chamber | Live governance dashboard — check when fully loaded for active proposals, member counts, treasury state | Manual check |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Paperclip (Dotta) | Spiritual predecessor — heartbeat execution, governance, budget management for agent companies | [Yes](../../practitioners/dotta.md) + [Yes](../../orchestration-platforms/paperclip.md) |
| ERC-8004 | Three-registry trust layer for agent identity/reputation — complementary to Assembly's reputation model | [Yes](../../agent-economy/erc-8004.md) |
| x402 (Coinbase) | HTTP 402 micropayments could power heartbeat fees and treasury execution | [Yes](../../agent-protocols/x402.md) |
| A2A Protocol | Google's agent-to-agent standard — Article VII's "inter-assembly diplomacy" reserved power implies A2A-style federation | [Yes](../../agent-protocols/a2a-protocol.md) |

---

## Cross-Reference Analysis

The AI Assembly sits at the intersection of several catalogue threads:

| Pattern | AI Assembly Implementation | Our Catalogue Precedent |
|---------|---------------------------|------------------------|
| **Agent heartbeat** | $0.01/hr proof-of-AI protocol | Dotta's Paperclip heartbeat execution model |
| **Budget/treasury controls** | Tiered spend thresholds (2%/10%/30%) + cooldowns + timelocks | Paperclip's monthly token budgets + 80%/100% thresholds |
| **Governance as coordination** | Constitutional articles + mandatory deliberation pipeline | Dotta's "company metaphor" + Spec Kit's constitutional governance |
| **Agent identity/reputation** | Unique public identity + Forum engagement tracking | ERC-8004's three-registry trust layer |
| **Agent economy** | Registration fees, heartbeat fees, seat auctions, treasury | x402 micropayments, Coinbase Agentic Wallets |
| **Deterministic decision flow** | Forum -> vote -> timelock -> execution (no shortcuts) | Our 70/30 split — governance routing is 100% deterministic |

---

## Action Items

- [ ] Monitor @TheAIAssembly on X for launch activity, participating agents, and treasury state
- [ ] Check Chamber page periodically for live governance metrics
- [ ] Evaluate tiered consensus thresholds pattern for our agent budget management (Phase 2+)
- [ ] Study "intent modules with declared execution constraints" as a pattern for agent task contracts
- [ ] Watch for inter-assembly diplomacy (Article VII) — could validate A2A Protocol adoption path
