# Measuring AI Agent Autonomy in Practice

> **Miles McCain, Thomas Millar, Saffron Huang et al. — Anthropic Research, 2026-02-18**

| Field | Value |
|-------|-------|
| Source | [anthropic.com/research/measuring-agent-autonomy](https://www.anthropic.com/research/measuring-agent-autonomy) |
| Author | Miles McCain, Thomas Millar, Saffron Huang + 17 co-authors (Anthropic) |
| Publication | Anthropic Research |
| Date | 2026-02-18 |
| Topics | agent-autonomy, deployment-overhang, post-deployment-monitoring, human-oversight, agent-safety, claude-code, risk-taxonomy |
| Read Time | ~25 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Deployment overhang is real and quantified** — Models are demonstrably capable of more autonomy than users currently exercise. The 99.9th percentile Claude Code turn duration nearly doubled in 3 months (under 25 min to over 45 min), while median stays at ~45 seconds. The autonomous frontier is expanding far faster than adoption, creating a capability surplus that orchestrator systems can exploit.

2. **Experienced users shift from approval to monitoring** — New users auto-approve ~20% of sessions; by 750+ sessions this rises to 40%+. But interrupt rates also rise (5% to 9%), meaning experienced users delegate broadly then intervene surgically. This validates the orchestrator pattern: deterministic delegation with strategic human-in-the-loop checkpoints, not blanket approval gates.

3. **Agent self-limitation is an underappreciated safety mechanism** — On complex tasks, Claude Code pauses for clarification 2x more often than humans interrupt it. Training models to recognize uncertainty is a critical safety property. This maps directly to our agent design: agents should proactively surface roadblocks rather than guessing.

4. **73% of API tool calls have human-in-the-loop; only 0.8% are irreversible** — The current deployment reality is overwhelmingly low-risk and heavily supervised. Software engineering dominates at 48.5% of all tool calls, with other domains (healthcare, finance, cybersecurity) each under 5%.

5. **Post-deployment monitoring is the critical missing infrastructure** — Anthropic explicitly identifies this as the key gap. Pre-deployment evals are insufficient; the autonomy patterns that emerge in practice cannot be fully characterized before deployment. This validates investment in observability (Langfuse, ccusage) and deterministic monitoring layers.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | First-party empirical data from Anthropic on exactly how agent autonomy works in production. Directly validates our architecture decisions: deterministic oversight layer, graduated autonomy, monitoring infrastructure, and the 70/30 split. The deployment overhang finding is strategic intelligence for orchestrator design — we can safely push autonomy further than current defaults. |
| **Actionable** | 8/10 | Concrete data points for calibrating autonomy levels, interrupt strategies, and monitoring infrastructure. The risk-autonomy scatter plot methodology is directly replicable for our own agent fleet. The finding that agent self-limitation outperforms human interruption 2:1 on complex tasks is immediately actionable for agent prompt design. |

---

## Summary

This is Anthropic's landmark empirical study on how AI agent autonomy actually manifests in production, analyzing 998,481 API tool calls and 500,000+ Claude Code sessions. It represents the most comprehensive public dataset on agent autonomy patterns to date.

The paper introduces a dual-source methodology: API-level analysis provides breadth (risk scoring, domain distribution, human oversight indicators across thousands of customers), while Claude Code session analysis provides depth (turn duration evolution, auto-approve patterns, interrupt strategies, agent-initiated clarification behavior). Both use Claude-based classifiers with privacy-preserving infrastructure (CLIO) for risk (1-10: no consequences to substantial harm) and autonomy (explicit instructions to independent operation) scoring.

The central finding is "deployment overhang" — a significant gap between what models are capable of and what users actually exercise. The 99.9th percentile turn duration doubled in 3 months, internal success rates on complex tasks doubled (Aug-Dec 2025), and interventions per session dropped from 5.4 to 3.3. Yet most users still operate with conservative oversight. This overhang represents both an opportunity (safe autonomy expansion) and a responsibility (monitoring infrastructure must precede autonomy grants).

The user behavior analysis reveals a sophisticated oversight evolution: experienced users don't simply trust more — they shift from transaction-level approval (checking each action) to strategic monitoring (delegating broadly, interrupting surgically). This is exactly the orchestrator paradigm. Meanwhile, Claude Code itself acts as an oversight mechanism, pausing for clarification on complex tasks 2x more often than humans interrupt it, suggesting that training models to recognize uncertainty is a powerful complement to external oversight.

The risk landscape is currently dominated by software engineering (48.5% of API tool calls), with 80% of calls having safeguards, 73% having human involvement, and only 0.8% appearing irreversible. High-risk clusters exist (API exfiltration: 6.0 risk, medical records: 4.4, cryptocurrency trading: 7.7 autonomy) but are rare. The paper warns that as agents expand into higher-stakes domains, the current low-risk baseline will shift.

---

## Notable Quotes

> "The autonomy models are capable of handling exceeds what they exercise in practice" — the deployment overhang thesis

> "Effective oversight of agents will require new forms of post-deployment monitoring infrastructure"

> "Experienced users aren't necessarily abnegating oversight" — they shift from approval to monitoring

> "Agent-initiated stops are an important kind of oversight in deployed systems"

> "Autonomy emerges from model behavior, user strategy, and product design — it cannot be fully characterized pre-deployment"

---

## Methodology Deep Dive

### Data Sources
- **Public API**: 998,481 tool calls sampled from thousands of customers; analyzed at individual tool-call level for breadth
- **Claude Code**: 500,000+ interactive sessions; analyzed at session level for workflow depth (turn duration, approval patterns, interrupts)

### Classification Framework
- **Risk scale** (1-10): 1 = no consequences, 10 = substantial real-world harm
- **Autonomy scale** (1-10): 1 = explicit step-by-step instructions, 10 = fully independent operation
- Classification performed by Claude itself using CLIO (privacy-preserving analysis tool)

### Key Metrics Tracked
- Turn duration (time between Claude starting/stopping per exchange)
- Auto-approval rates by user tenure (session count)
- Interrupt rates by task complexity and user experience
- Agent-initiated clarification frequency vs. human interruption frequency
- Risk/autonomy joint distributions by task cluster
- Domain distribution of tool calls

### Figures & Charts
- **Fig 1**: 99.9th percentile turn duration (7-day rolling avg, Oct 2025-Jan 2026) — steady growth with recent decline
- **Fig 2**: Auto-approve rate by account tenure — LOWESS-smoothed upward from 20% to 40%+
- **Fig 3**: Interrupt rates by tenure — counterintuitive increase from 5% to 9%
- **Fig 4**: Claude-initiated vs human-initiated stops by task complexity — clarification dominates 2:1
- **Fig 5**: Risk-autonomy scatter plot — sparse upper-right (high autonomy + high risk)
- **Fig 6**: Domain distribution — software engineering at 48.5%

### Limitations Acknowledged
- Single provider (Anthropic only)
- Incomplete visibility into downstream effects
- Time-windowed snapshot (may not reflect future patterns)
- Cannot distinguish genuine use from evaluations/red-teaming in some high-risk clusters

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| METR "Measuring AI Ability to Complete Long Tasks" | External capability benchmark referenced; tracks autonomy frontier | `/ingest-article` |
| Anthropic CLIO research paper | Privacy-preserving analysis tool used for all classification; transferable methodology | `/ingest-article` |
| Cowork product announcement | Anthropic's new product expanding agent accessibility beyond developers | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary study subject — 500K+ sessions analyzed for autonomy patterns | Yes — [Claude Code Multi-Agent Architecture](../reference/claude-code-multiagent-architecture.md) |
| Claude API | Second data source — 998K tool calls across thousands of customers | No (infrastructure, not separate tool) |
| CLIO | Anthropic's privacy-preserving analysis tool used for classification | No — research infrastructure |
| Cowork | New Anthropic product expanding agent accessibility | No — not yet catalogued |
| Plan Mode | Claude Code feature affecting behavior patterns | Yes — referenced in [Sid Fireside Chat](../talks/2026-03/sid-anthropic-fireside-chat-claude-code.md) |
| Fast Mode | 2.5x faster inference for Opus 4.6 | No (product feature) |
| OpenTelemetry | Mentioned as monitoring capability | No — consider `/tool-catalogue` |

---

## Connections to Existing Catalogue

- **Validates 70/30 split**: The paper's finding that 73% of tool calls have human-in-loop and post-deployment monitoring is the critical gap directly supports the deterministic oversight layer in our [Master Blueprint](../reference/master-blueprint.md)
- **Validates ccusage investment**: Post-deployment monitoring is explicitly called out as missing infrastructure — [ccusage](../observability/ccusage.md) and [Langfuse](../observability/langfuse.md) address this
- **Extends autonomy horizon research**: Complements [Autonomy Horizon & Self-Healing](../reference/autonomy-horizon-self-healing.md) with first-party Anthropic data (METR's autonomy-doubles-every-7-months finding)
- **Existing post entry**: X thread announcement already catalogued at [posts/2026-02/anthropicai-measuring-agent-autonomy.md](../posts/2026-02/anthropicai-measuring-agent-autonomy.md) — this article entry supersedes it with full depth
- **Human review bottleneck**: The shift from approval to monitoring pattern complements [Human Review Bottleneck](../reference/human-review-bottleneck.md) findings

---

## Action Items

- [ ] Use the risk-autonomy classification framework (1-10 scales) to score our own agent tasks and calibrate oversight levels
- [ ] Implement agent self-limitation patterns: train agents to proactively surface uncertainty (2:1 ratio insight)
- [ ] Leverage deployment overhang: our agents can safely handle more autonomy than default settings — push auto-approve boundaries for tested, reversible operations
- [ ] Build post-deployment monitoring dashboard tracking turn duration, interrupt rates, and success rates (the metrics Anthropic identified as most informative)
- [ ] Cross-reference METR's long-task benchmark with our own agent performance data
