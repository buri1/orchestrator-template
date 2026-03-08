# Hormozi Framework Encoding

> **Complete extraction and encoding of Alex Hormozi's 7-step Grand Slam Offer architecture, Value Equation, CLOSER sales framework, Core Four lead generation, and content engine into agent-executable system prompts with Notion integration schemas.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-hormozi-system-encoding.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document transforms Alex Hormozi's business frameworks from "$100M Offers" and "$100M Leads" into structured, agent-executable knowledge. It extracts seven systematizable components (Offer Architect, Value Equation scoring, Grand Slam Offer creation, CLOSER sales framework, Core Four lead generation, Lead Magnet design, and Content Engine with Hook-Retain-Reward methodology) and encodes them as complete system prompts for four interconnected AI agents that share context and optimize based on results.

The analysis of existing AI implementations (Hormozi Pro GPTs, community GPTs, HormoziGPT open source) reveals that no one has built a connected system where offer design feeds into lead generation feeds into sales scripting feeds into content creation. All existing tools are single-prompt, single-turn, with no iterative refinement loop or cross-framework data flow. The architecture fills this gap with four agents (Offer Architect, Lead Machine, Sales Script Builder, Content Engine) connected through Notion databases (Offers, Leads, Content Calendar, Sales Scripts, Avatars) with full scoring, A/B tracking, and performance feedback loops.

The document also applies these frameworks to three business lines: government digital transformation (entry EUR 50K assessment, target EUR 500K phased implementation, anchor EUR 2M full transformation), local business landing pages ("48-Hour Business Launch System" with 72x Value Score), and SaaS launches (free tool lead magnets, $1/month entry offers, value-based subscription pricing). A knowledge encoding strategy recommends context files as primary storage, Notion for live data, and CLAUDE.md for routing rules only.

---

## Key Findings

### The Value Equation (Core Formula)

`VALUE = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort & Sacrifice)`

Scoring: 1-10 per variable. Score < 1.0 = commodity; 1.0-3.0 = decent; 3.0-10.0 = strong; > 10.0 = Grand Slam Offer. This formula is naturally quantifiable and ideal for agent-based scoring with iterative improvement loops.

### Grand Slam Offer: 7-Step Process

1. Identify Dream Outcome (emotional state, transformed life)
2. List ALL Problems/Obstacles (minimum 20, sourced from before/during/after the transformation)
3. Convert Problems to Solutions ("How to [result] without [pain] in [timeframe]")
4. Delivery Vehicle Brainstorm (attention level x effort level x medium x response speed matrix)
5. Trim and Stack (remove low-value, keep high-value-to-cost items)
6. Apply Five Enhancers (Scarcity, Urgency, Bonuses, Guarantees, MAGIC Naming)
7. Price for Value, Not Cost (10% of annual dream outcome value as minimum price, 3-tier architecture with anchor at 10x)

### CLOSER Sales Framework

C=Clarify why they're here (scale 1-10 importance), L=Label the problem (get verbal YES), O=Overview past pain (every failed attempt strengthens your case), S=Sell the vacation (outcomes not features, use their exact words), E=Explain away concerns (Triple A: Acknowledge, Associate, Ask), R=Reinforce the decision (welcome package within 48h). Complete branching scripts provided with objection handling matrix covering price, time, trust, authority, and need objections.

### Core Four Lead Generation

Four channels in 2x2 matrix (you do it / others do it, one-to-one / one-to-many): Warm Outreach (ACA Framework), Cold Outreach (below 3rd-grade reading level), Free Content (Hook-Retain-Reward, 98% value / 2% asks), Paid Ads (only after organic proven). Rule of 100: pick one and do it 100 consecutive days. More-Better-New scaling framework.

### Four Agent Architecture

- **Offer Architect**: 6-phase process from discovery through Value Equation re-score; outputs Grand Slam Offer Document with before/after scorecard
- **Lead Machine**: Avatar deep dive, 3 lead magnet options with scoring, Core Four channel strategy, Lead Getter scaling plan, Rule of 100 implementation
- **Sales Script Builder**: Pre-call setup, full CLOSER script with branching logic and score-based routing, objection handling matrix, post-sale reinforcement sequence
- **Content Engine**: Content pillar architecture, 50-hook library, 5 post templates (Framework, Story, Myth-Bust, Value Bomb, CTA), 30-day calendar, platform-specific adaptation, Give-to-Ask ratio compliance audit

### Notion Database Schemas

Five interconnected databases: Offers (with Value Equation scoring fields, MAGIC name components, guarantee type), Leads (qualification scoring, Hormozi funnel stages), Content Calendar (Hook-Retain-Reward templates, Give-to-Ask ratio tracking), Sales Scripts (CLOSER variants, A/B testing, close rate tracking), Avatars (demographics, psychographics, pain points, trust influencers). Relations flow: Avatars <-> Offers <-> Leads, Offers <-> Sales Scripts, Offers <-> Content Calendar.

---

## Actionable Insights

- **The Value Equation is the single most powerful diagnostic**: Score any offer before building it; if score < 3.0, redesign before investing resources
- **Encode frameworks as context files, not CLAUDE.md**: Store in `/context/hormozi/` with one file per framework; CLAUDE.md only contains routing rules pointing to the right context
- **The connected system is the moat**: No existing tool connects offer -> leads -> sales -> content with shared context; building this creates defensible IP
- **German government offers should use Implied/Performance guarantees**: Milestone-based payments are standard in gov contracts and naturally implement Hormozi's conditional guarantee pattern
- **Local business "48-Hour Launch System" achieves a 72x Value Score**: Near-zero time delay + zero effort + visible demo = most powerful offer variant
- **Content follows the 3.5:1 minimum give-to-ask ratio**: Agent-generated content calendars must be audited against this ratio before scheduling

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](master-blueprint.md) | Marketing agents are one of the five business line verticals in the federated architecture |
| [reference/lead-gen-pipeline-architecture.md](lead-gen-pipeline-architecture.md) | Lead gen pipeline implements the Core Four channels and lead magnet strategy specified here |
| [reference/german-government-compliance.md](german-government-compliance.md) | Government offer stack, pricing tiers, and disclosure strategy apply Hormozi frameworks to gov context |
| [reference/notion-as-agent-backend.md](notion-as-agent-backend.md) | Notion database schemas for Offers, Leads, Content Calendar integrate with the portfolio architecture |
| [reference/saas-factory-infrastructure.md](saas-factory-infrastructure.md) | SaaS validation funnel uses Hormozi test scoring (minimum 16/25) as kill criteria |
| [reference/legal-compliance-framework.md](legal-compliance-framework.md) | UWG constraints on cold email in Germany affect Core Four channel strategy |
