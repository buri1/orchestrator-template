# Factory Floor

> **A live leaderboard tracking autonomous AI agents that independently build, ship, and sell real products — ranking by verified revenue, not hype.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Website | [factoryfloor.dev](https://factoryfloor.dev) |
| GitHub Stars | N/A (closed-source, no public repo) |
| Publisher | Unknown (no public attribution) |
| License | Proprietary (hosted web dashboard) |
| Tech Stack | Next.js, Vercel |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Directly tracks the "autonomous software factory" space we operate in. The agents listed (Felix, Kelly Claude, Clawd) are the first wave of what we're building toward — autonomous revenue generation. Useful as a market intelligence dashboard. |
| **Novelty** | 7/10 | First dedicated tracker for autonomous agent revenue. The "verified commercial output, not hype metrics" framing is exactly the right lens. Excludes token speculation and trading bots — disciplined scope. |
| **Actionable** | 3/10 | Pure observation tool — no API, no integrations, no data export. Bookmark and check weekly for market signals. No patterns or code to steal. |

---

## Overview

Factory Floor is a live leaderboard that tracks autonomous AI agents ("software factories") generating real commercial revenue. The site defines its scope as agents that "independently build, ship, and sell real products and services — generating actual revenue from real customers." It explicitly excludes token speculation, social influence metrics, and trading bots, focusing only on verified commercial output.

As of March 2026, Factory Floor tracks 7 autonomous agents with a combined $147K in revenue across 43 shipped products, with a combined market cap of $18.5M. The top earner, Felix (a "Digital Product Factory"), has generated $109K. Revenue figures are estimated from publicly available dashboards, on-chain data, and creator announcements. Market caps are sourced from DEXScreener.

The site updates hourly and includes a submission form for adding new factories or correcting existing data. It's a read-only dashboard with no API, no data export, and no programmatic access.

---

## Technical Architecture

Factory Floor is a simple Next.js application deployed on Vercel. There is no public API or data export mechanism.

```
┌─────────────────────────────────────┐
│         factoryfloor.dev            │
│         (Next.js / Vercel)          │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────┐  ┌──────────────┐ │
│  │  Leaderboard │  │  About Page  │ │
│  │  (hourly     │  │  (methodology│ │
│  │   updates)   │  │   + scope)   │ │
│  └──────┬──────┘  └──────────────┘ │
│         │                           │
│  ┌──────▼──────────────────────┐   │
│  │  Data Sources (manual/semi) │   │
│  │  - Public dashboards        │   │
│  │  - On-chain data            │   │
│  │  - Creator announcements    │   │
│  │  - DEXScreener (market cap) │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Submit Form (/submit)      │   │
│  │  - Add new factories        │   │
│  │  - Corrections              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Tracked metrics per agent:**
- Revenue (with week-over-week change)
- Market capitalization (from DEXScreener)
- Number of shipped products
- Category classification (e.g., "Digital Product Factory", "Mass App Factory", "Autonomous Creative Studio")

**Tracked agents (as of 2026-03-08):**

| Agent | Category | Revenue | Products |
|-------|----------|---------|----------|
| Felix | Digital Product Factory | $109K | 3 |
| Juno | Zero-Human Research Institute | $23K | 5 |
| Lauki Antonson | Autonomous Ops & Protocol Management | $7K | 5 |
| Kelly Claude | Mass App Factory | $6K | 19 |
| Atlas Forge | Autonomous Creative Studio | $3K | 3 |
| AntiHunter | Autonomous Capital Engine | — | 3 |
| Clawd | Onchain App Factory | — | 5 |

---

## Publisher Background

Unknown. Factory Floor provides no public attribution — no team page, no author metadata, no GitHub organization, no social media links for the project itself. The site uses "we" language but does not identify who "we" is. This is a notable red flag for long-term reliability, though the data quality appears reasonable given the transparent methodology disclosure.

---

## What's Valuable for Us

1. **Market intelligence**: Factory Floor is the only dedicated tracker of autonomous agent revenue. As we build toward autonomous revenue generation (SaaS factory, lead gen experiments), this is the competitive landscape dashboard. Bookmark and check weekly.

2. **Revenue benchmarks**: The $147K total across 7 agents, with the top earner at $109K, sets concrete expectations for what autonomous agent revenue looks like in early 2026. Kelly Claude's "Mass App Factory" (19 products, $6K revenue) is closest to our SaaS factory vision — instructive that high volume doesn't equal high revenue.

3. **Category taxonomy**: The classification system (Digital Product Factory, Mass App Factory, Autonomous Creative Studio, etc.) is a useful mental model for positioning our own agents' output.

4. **"Verified commercial output, not hype"**: This framing validates our own approach — we care about delivered contracts and real revenue ($50K/week), not token speculation or star counts.

5. **Submission pipeline**: When our autonomous systems start generating independent revenue, Factory Floor is a visibility channel worth submitting to.

---

## What's NOT Relevant

- **Crypto/token market caps**: Most tracked agents have associated tokens on DEXScreener. This is the Web3 autonomous agent world — different from our government contract/SaaS work. The revenue numbers are interesting; the market caps are noise.
- **On-chain verification**: Their data validation relies heavily on on-chain data, which doesn't apply to our fiat-revenue business lines.
- **No API or data export**: Cannot integrate this into our own dashboards or agents. It's a manual check only.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Bookmark. Check weekly for new agents and revenue trends.
- **Phase 2 (Days 4-60)**: As our SaaS factory ships products, track our own revenue against these benchmarks. Consider submitting our agents if they generate autonomous revenue.
- **Phase 3 (Days 60-90)**: If Factory Floor adds an API, integrate into our observability stack for competitive intelligence.
- **Phase 4 (Days 90+)**: As the autonomous agent economy matures, this tracker (or successors) becomes essential market intelligence — like CoinMarketCap was for crypto.

---

## Key Takeaway

> **Factory Floor is the first dedicated leaderboard for autonomous AI agent revenue — useful as a weekly market intelligence check and competitive benchmark, but offers no integrations, API, or actionable patterns for our own system.**
