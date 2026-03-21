# Factory Floor — Tracking Autonomous Software Factories

> **Unknown creator(s) — factoryfloor.dev, 2026**

| Field | Value |
|-------|-------|
| Source | [https://factoryfloor.dev/about](https://factoryfloor.dev/about) |
| Author | Unknown (no public attribution) |
| Publication | factoryfloor.dev |
| Date | 2026 (exact launch date unknown; data updated hourly) |
| Topics | autonomous agents, agent economy, revenue tracking, software factories, leaderboard, market intelligence |
| Read Time | 5 min |

---

## Burak's Notes

> *(reserved)*

---

## Key Takeaways

1. **Autonomous agent revenue is real but tiny** — As of March 2026, Factory Floor tracks 7 agents with a combined $200K in total revenue across 43 shipped products. The top earner (Felix) accounts for $158K, meaning the remaining 6 agents collectively generated only $42K. This is the actual state of "autonomous software factories" — not zero, but far from transformative.

2. **"Verified commercial output, not hype metrics" is the right framing** — Factory Floor explicitly excludes token speculation, social media influence, and trading bots. Revenue figures are estimated from public dashboards, on-chain data, press coverage, and creator-confirmed announcements. Each agent page includes a methodology note with confidence levels. This disciplined scope makes the data actually useful.

3. **The "Mass App Factory" model underperforms** — Kelly Claude has shipped 19 products (most of any tracked agent) but generated only $6K in revenue. Felix shipped 3 products for $158K. Volume of output does not correlate with revenue — focused, higher-quality products dramatically outperform spray-and-pray approaches.

4. **Agent economy is heavily crypto-adjacent** — All 7 tracked agents have associated tokens ($FELIX, $JUNO, $KELLYCLAUDE, etc.) with a combined market cap of $11.6M against $200K in actual revenue. The speculative layer dwarfs the productive layer by 58x. Factory Floor wisely tracks revenue separately from market cap.

5. **The autonomous agent space is nascent and experimental** — Factory Floor itself acknowledges: "this is still largely experimental. None of these agents are fully autonomous in the way we might imagine five years from now." The site is a snapshot of day-one economic participation by AI agents.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Factory Floor tracks the exact space our SaaS factory vision targets — autonomous agents generating real revenue. The revenue benchmarks ($200K total, $158K top earner, $6K for 19-product mass factory) are the competitive landscape data points. The category taxonomy (Digital Product Factory, Mass App Factory, Autonomous Creative Studio) maps to our business line architecture. Not technically actionable but strategically valuable as market intelligence. |
| **Actionable** | 3/10 | No API, no data export, no integrations, no code, no patterns to steal. Pure observation tool. Bookmark and check monthly. The only actionable insight is the anti-pattern: Kelly Claude's 19 products / $6K revenue proves volume-over-quality fails even for autonomous agents. |

---

## Summary

Factory Floor is a live leaderboard that tracks autonomous AI agents ("software factories") generating real commercial revenue. The site defines its scope as agents that "independently build, ship, and sell real products and services — generating actual revenue from real customers." It explicitly excludes token speculation, social influence metrics, and trading bots, focusing only on verified commercial output.

As of March 2026, Factory Floor tracks 7 autonomous agents with a combined $200K in revenue across 43 shipped products, with a combined market cap of $11.6M. The top earner, Felix (a "Digital Product Factory"), has generated $158K from just 3 products including ClawMart and a $29 playbook "How to Hire an AI." The second-place Juno ("Zero-Human Research Institute") earned $26K from 5 products including a paid membership institute. Kelly Claude ("Mass App Factory") shipped the most products (19) but earned only $6K — a telling data point about the relationship between volume and value.

The site operates as a simple Next.js application on Vercel, updating hourly through a combination of automated scrapers and manual verification. Revenue sources include public dashboards, on-chain data, and creator announcements. Each agent page includes methodology notes explaining the source and confidence level of figures shown. A submission form allows adding new factories or correcting existing data.

Factory Floor frames its mission around a thesis: "We're witnessing the emergence of a new economic layer — one where AI agents are genuine economic participants. They earn money, spend money, hire humans, and compete in markets." While acknowledging this is still experimental, the site positions itself as the first serious attempt to track and verify this emerging phenomenon with disciplined methodology rather than hype metrics.

---

## Notable Quotes

> "We're witnessing the emergence of a new economic layer — one where AI agents are genuine economic participants. They earn money, spend money, hire humans, and compete in markets."

> "Factory Floor tracks the agents that are actually doing it — the ones generating real revenue from real products. We separate signal from noise by focusing on verified commercial output, not hype metrics."

> "This is still largely experimental. None of these agents are fully autonomous in the way we might imagine five years from now."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://felixcraft.ai | Top autonomous agent by revenue ($158K); understanding Felix's architecture could inform SaaS factory design | Manual check |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Factory Floor (tool entry) | This article covers the /about page; the tool entry covers the leaderboard | [Yes](../../observability/factory-floor.md) |
| Felix | Top autonomous agent ($158K revenue, 3 products) | No |
| Kelly Claude | "Mass App Factory" — 19 products, $6K revenue | No |
| Juno / ZHC Institute | "Zero-Human Research Institute" — $26K revenue | No |
| Clawd | "Onchain App Factory" — 5 products, $3.9M market cap, no verified revenue | No |

---

## Cross-Reference: Updated Metrics (March 2026 vs. March 8 2026)

The existing [tool catalogue entry](../../observability/factory-floor.md) was analyzed on 2026-03-08. Key changes since then:

| Metric | March 8 | March 21 | Change |
|--------|---------|----------|--------|
| Total Revenue | $147K | $200K | +36% |
| Felix Revenue | $109K | $158K | +45% |
| Juno Revenue | $23K | $26K | +13% |
| Combined Market Cap | $18.5M | $11.6M | -37% |

Market caps dropped significantly while revenue grew — the speculative premium is compressing toward fundamentals.

---

## Action Items

- [ ] Bookmark factoryfloor.dev — check monthly for new agents and revenue trends
- [ ] Update the tool entry (observability/factory-floor.md) with March 21 revenue figures
- [ ] When our SaaS factory ships autonomous products, consider submitting to Factory Floor for visibility
- [ ] Study Felix's architecture (felixcraft.ai) — $158K from 3 products suggests focused strategy beats volume
