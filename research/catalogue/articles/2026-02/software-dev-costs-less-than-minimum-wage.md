# Software Development Now Costs Less Than the Wage of a Minimum Wage Worker

> **Geoffrey Huntley -- ghuntley.com, 2026-02-27**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/real/ |
| Author | Geoffrey Huntley (Engineer at Sourcegraph/Amp, independent researcher) |
| Publication | ghuntley.com (personal blog) |
| Date | 2026-02-27 (modified 2026-03-05) |
| Topics | AI economics, developer commoditization, K-shaped economy, agent-driven development, SaaS disruption, per-seat pricing death |
| Read Time | ~10 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **Software development is now cheaper than minimum wage** -- At $10.42/hour for AI agent runtime (Ralph loop), producing software costs less than flipping burgers. This isn't a projection; it's a measurement from Huntley's year-long autonomous coding practice.

2. **K-shaped economic divergence is underway** -- Companies split into two tiers: model-first lean operators with razor-thin margins (winners) vs. traditional orgs requiring massive transformation (losers). The gap is accelerating as model improvements compress competitive timeframes from years to months.

3. **Developer identity function is dissolving** -- Non-developers at meetups are creating functional applications with Cursor. Backend/frontend/language specializations become irrelevant. "If everyone can be a software developer, what does that mean if your identity function is that you're a software developer?"

4. **Per-seat pricing is dead** -- SaaS moats built on per-seat pricing, human-optimized features, and switching costs are collapsing. Utility-based pricing (metered consumption) and distribution networks are the only surviving moats.

5. **Solo builders are achieving 30x output multipliers** -- Anonymous founder reports "20ish people now do about 30x the output of what having more than 60 did 3 years ago." Solo operators run entire companies with AI employees working 24/7.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates Burak's business model: agent delivery margins (46-83%), Claude Max arbitrage (18-36x), solo operator scaling with AI. The $10.42/hr figure is the same number in our practitioner profile. The K-shaped economy thesis reinforces why being model-first NOW matters. The per-seat pricing death has direct implications for our SaaS factory strategy. |
| **Actionable** | 7/10 | More strategic than tactical. The key actionable insight is the moat analysis: distribution + utility pricing are the only defensible positions. The Canva MCP integration example and the Latent Patterns feature-cloning approach are concrete patterns. The "compress 5-year roadmaps to 1 year" framing is useful for client conversations. |

---

## Summary

Geoffrey Huntley synthesizes a year of operating autonomous AI coding agents into an economic and societal thesis. His core claim: software development now costs $10.42/hour via AI agent loops, undercutting minimum wage workers. He backs this with a private equity case study (Minotaur Capital shorting Atlassian after Ralph went viral) and firsthand observations of non-developers building functional apps at Cursor meetups.

The article frames the impact as a K-shaped economic divergence. Top-tier companies (model-first, lean, utility-priced) will thrive while traditional organizations face existential transformation pressure. Huntley argues that developer identity -- the specializations (backend, frontend, language expertise) that defined careers -- is dissolving as AI commoditizes the skill of writing code itself.

He presents a moat analysis for the AI era: per-seat pricing, human-optimized features, and technology switching costs are no longer defensible. Only distribution networks, brand awareness, and utility-based pricing models survive. As evidence, he points to Canva's CTO implementing 50,000 lines of MCP integration code to make AI-first development the default, and his own Latent Patterns platform that cloned features from PostHog, Jira, Pipedrive, and Calendly through AI-assisted development.

The article closes with dual recommendations. For employees: upskill in AI immediately, become organizational champions, and leave companies that ban AI tools. For organizations: compress 5-year roadmaps to 1 year, create workflow backlogs, implement AI-first operations, and resist the lazy leadership pattern of cutting headcount instead of transforming workflows. Huntley acknowledges the emotional weight of career identity erosion while framing adaptation as non-optional.

---

## Notable Quotes

> "Knowledge and skill of software developers has been commoditised."

> "If everyone can be a software developer, what does that mean if your identity function is that you're a software developer?"

> "Experience as a software engineer today doesn't guarantee relevance tomorrow."

> "20ish people now do about 30x the output of what having more than 60 did 3 years ago." -- Anonymous founder

> "I've never seen this before in my career: 28-30 year olds who refuse to use AI coding tools..." -- Ivan Burazin (2026-03-05)

> "Solo builders are running entire companies now with AI employees working 24/7..." -- Alex the Engineer (2026-03-01)

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/screwed | "Dear Student: Yes, AI is here, you're screwed unless you take action" -- companion piece on career implications | `/ingest-article` |
| https://ghuntley.com/papercuts | "LLM weights vs the papercuts of corporate" -- organizational friction vs AI velocity | `/ingest-article` |
| https://ghuntley.com/six-month-recap | Six-month AI impact recap (June 2025) -- longitudinal data on agent productivity | `/ingest-article` |
| https://latentpatterns.com/principles | Principles for AI-native software development -- potential architectural patterns | `/ingest-article` |
| https://www.theregister.com/2026/01/27/ralph_wiggum_claude_loops/ | The Register coverage of Ralph going mainstream -- press validation | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Ralph | AI coding loop achieving $10.42/hr development cost; central to the thesis | Referenced in [Geoffrey Huntley](../../practitioners/geoffrey-huntley.md) practitioner profile |
| Cursor | Enabling non-developers to build functional apps at meetups | Yes -- [Cursor](../../developer-gui/cursor.md) |
| Claude Code | Used to rebuild product features from screenshots | Referenced in practitioner profiles |
| Atlassian | PE firm shorting it after Ralph gained traction; poster child for disruption | Not catalogued (company, not tool) |
| Canva | CTO implementing 50K lines of MCP integration for AI-first development | Not catalogued (company, not tool) |
| Latent Patterns | Huntley's AI-native platform; cloned PostHog, Jira, Pipedrive, Calendly features | Not yet catalogued -- consider `/tool-catalogue` |
| PostHog | Analytics platform whose features were cloned via AI | Not catalogued (not in scope) |
| Jira | Project management features cloned via AI | Not catalogued (not in scope) |
| Pipedrive | CRM features cloned via AI | Not catalogued (not in scope) |
| Calendly | Scheduling features cloned via AI | Not catalogued (not in scope) |
| Cloudflare D1 | Database migrated FROM automatically via Ralph Loop | Not catalogued (infrastructure) |
| PlanetScale Postgres | Database migrated TO automatically via Ralph Loop | Not catalogued (infrastructure) |
| MCP (Model Context Protocol) | Canva's integration layer for AI-first development | Referenced across catalogue |
| Minotaur Capital | PE firm that profited from shorting Atlassian post-Ralph | Not catalogued (finance) |

---

## Action Items

- [ ] Update Geoffrey Huntley practitioner profile with this article's newer data points (K-shaped economy thesis, Canva MCP example, Minotaur Capital short)
- [ ] Consider Latent Patterns for `/tool-catalogue` if it becomes open-source or has a public API
- [ ] Use the "compress 5-year roadmaps to 1 year" framing in client pitch materials
- [ ] Evaluate utility-based pricing models for SaaS factory launches (per-seat is dead)
- [ ] Ingest the deep dive candidates (especially /screwed and /papercuts) for a more complete picture of Huntley's thesis
