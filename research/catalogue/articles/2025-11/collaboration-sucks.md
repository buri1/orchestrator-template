# Collaboration sucks

> **Charles Cook — Product for Engineers (PostHog Newsletter), 2025-11-11**

| Field | Value |
|-------|-------|
| Source | [PostHog Newsletter](https://newsletter.posthog.com/p/collaboration-sucks) / [PostHog Blog](https://posthog.com/newsletter/collaboration-sucks) |
| Author | Charles Cook (PostHog) |
| Publication | Product for Engineers (PostHog Newsletter) |
| Date | 2025-11-11 |
| Topics | anti-collaboration, team structure, ownership, shipping velocity, org design, small teams |
| Read Time | ~6 min |

---

## Burak's Notes

> *Scott from Kilo cited this as direct inspiration for their "anti-collaboration + N=1 ownership" model where each of their 15 engineers owns one feature end-to-end with only 1 PM for the entire company. See [Scott's Kilo talk](../../talks/2026-03/scott-kilo-ai-driven-dev-transformation.md). This maps directly to our agent architecture: the orchestrator should not "collaborate" with worker agents -- it should assign, trust, and verify. Over-coordination between agents is the multi-agent equivalent of over-collaboration between humans.*

---

## Key Takeaways

1. **Default to shipping, not discussing** -- PostHog's priority hierarchy is "Pull requests > issues > Slack messages." The further left you are in that chain, the more value you are creating. They found 175 instances of "let's discuss" in their Slack, which they treat as a smell.

2. **"You're the driver" as organizational principle** -- Hire people who are exceptional at their jobs, then get out of their way. No arbitrary deadlines, minimal coordination, no micromanagement. The person who owns the work makes the decisions -- everyone else is an advisor.

3. **Over-collaboration erodes the driver's effectiveness** -- Forcing the driver to slow down, explain context, and seek consensus erodes their motivation, confidence, and velocity. The article uses a driving metaphor: helpful collaboration is a co-pilot giving directions; harmful collaboration is stopping to ask every pedestrian for feedback or swapping drivers constantly.

4. **Identify the warning phrases** -- Three phrases signal excessive collaboration: "Curious what X thinks," "Would love to hear Y's take," and "We should work with Z on this." When these appear, someone should actively intervene: "There are too many people involved. X, you are the driver, you decide."

5. **Post-ship feedback beats pre-ship approval** -- Provide feedback after launch rather than before. Pre-ship feedback processes become quasi-approval gates that delay execution. The "informed captain" principle means the owner listens to input but maintains decision authority.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly applicable to both our org structure for client work (N=1 ownership per feature) and our multi-agent architecture (orchestrator assigns, workers execute without seeking consensus). The anti-collaboration philosophy validates context separation (Elvis Sun principle) -- agents should not "collaborate" on tasks, they should own them. Kilo adopted this and went from shipping every 2-3 weeks to 1-2 features/week with 15 engineers. |
| **Actionable** | 8/10 | Concrete patterns to adopt: (1) PR > issue > message hierarchy for agent output, (2) single-owner assignment in orchestrator routing, (3) post-completion review instead of pre-approval gates, (4) "informed captain" model maps to orchestrator-as-final-authority. Also useful framing for client consulting engagements. |

---

## Summary

Charles Cook of PostHog challenges the default assumption that collaboration is inherently good. As PostHog has grown, they observed increasing amounts of collaboration that adds zero or marginal value relative to the time lost. The article argues that excessive collaboration forces the "driver" (the person who owns a task) to slow down, explain their reasoning to people who lack full context, and seek consensus that waters down decisions.

PostHog's core value is "You're the driver" -- they hire exceptionally competent people, remove obstacles, and expect high individual ownership. Marketers ship code. Salespeople answer technical questions independently. Product engineers work across the entire stack. The company deliberately minimizes handoffs and approval processes.

Cook identifies seven root causes of over-collaboration: well-intentioned helpfulness, reluctance to name specific reviewers (broadcasting requests instead), vague feedback requests that invite scope creep, defaulting to discussion over action, preference for talking over doing, unclear ownership, and genuinely complex tasks that require multiple perspectives. He found "let's discuss" appeared 175 times in PostHog's Slack -- a concrete smell metric.

The proposed solutions are actionable: default to shipping work (PRs over issues over messages), actively intervene when too many people get involved ("X, you are the driver, you decide"), request targeted feedback from specific people about specific things, prefer post-ship feedback over pre-ship approval, and embrace the "informed captain" principle where the owner listens to input but retains decision authority. Cook acknowledges nuance -- some collaboration is essential (the article itself was edited by two colleagues) -- but argues organizations overwhelmingly err toward too much collaboration, not too little.

---

## Notable Quotes

> "If you want to go fast, go alone; if you want to go far, go alone too. (mostly)"

> "There are too many people involved. X, you are the driver, you decide."

> "Pull requests > issues > Slack messages"

> "Let's discuss" -- appeared 175 times in PostHog's Slack, treated as a collaboration smell

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| PostHog handbook — values (posthog.com/handbook) | "You're the driver" value and full org philosophy | `/ingest-article` |
| PostHog "What is a Product Engineer?" | Defines the full-stack, high-ownership role that makes anti-collaboration work | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| PostHog | The company itself -- open-source product analytics platform practicing anti-collaboration | No |

---

## Action Items

- [ ] Cross-reference with [Scott/Kilo talk](../../talks/2026-03/scott-kilo-ai-driven-dev-transformation.md) -- mark the Deep Dive Candidate as completed
- [ ] Apply "informed captain" model to orchestrator routing: orchestrator assigns one agent as owner, that agent decides, orchestrator reviews output (not process)
- [ ] Consider "175 Slack discussions" as a metric template -- count coordination messages between agents as an over-collaboration smell
- [ ] Use PR > issue > message hierarchy as agent output format preference: agents should produce artifacts (code, PRs), not status messages
