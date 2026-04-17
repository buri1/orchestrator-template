# GitHub Fake Star Economy — 6M Fake Stars, 301K Ghost Accounts, and Why Awesome Agents Is Compromised

> **Theo Browne — t3.gg livestream, 2026-04-16**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/live/PzROd-AAogY#fake-star-economy (segment ~02:35 → ~03:29) |
| Speaker | Theo Browne — CEO ping.gg, creator of T3 stack |
| Event | YouTube Live (long-form reaction stream on Theo's main channel, 527K subscribers) |
| Duration | ~55 min segment within the 6h stream |
| Date | 2026-04-16 |
| Topics | github fake stars, star scout, awesome agents, VC growth metrics, catalogue hygiene, FTC consumer review rule, SEC fraud precedent, repo trustworthiness heuristics |

---

## Burak's Notes

> *Directly actionable for our catalogue hygiene. We have ~222 tool entries and I've been using GitHub star counts as a lazy first-pass credibility signal. Theo's segment walks through the CMU/NCSU/Socket "Star Scout" peer-reviewed paper (20TB of GitHub metadata analyzed) with specific ratios we can use to audit our own entries. Three things to do: (1) spot-check our top-tier 8+ entries against the fork-to-star ratio heuristic; (2) add fork-to-star ratio as a column to our `_TEMPLATE.md` for new tool entries; (3) explicitly reconfirm Hermes-Agent as trustworthy (Star Scout cleared it) since we have it catalogued at high relevance. Good news buried in the data: langchain showed up as suspicious by fork ratio (235 forks/1000 stars), which matches practitioner skepticism we've heard — and Hermes Agent (NousResearch) is clean. Bad news: Awesome Agents lists are likely contaminated, which means our "mentioned in Awesome Agents" as a credibility signal is approximately worthless going forward.*

---

## Key Takeaways

1. **Scale of the fake star economy: 6M fake stars, 18,600 contaminated repos, 301K fake accounts.** Theo walks through the Awesome Agents investigation results that surfaced during the Star Scout paper release. The investigation identified 18,600 repos with statistically anomalous star patterns and traced ~301,000 accounts involved in star-selling networks. Total estimated fake stars in circulation: 6 million. This is not a long-tail problem — it's concentrated in AI/LLM repos, which Star Scout flagged as the #1 non-malicious category with roughly 177,000 fake stars attributable to AI/LLM projects specifically.

2. **Star Scout is the peer-reviewed source — CMU/NCSU/Socket, 20TB of GitHub metadata analyzed.** This isn't influencer speculation. Star Scout is a joint academic effort (Carnegie Mellon, NC State, Socket.dev) that processed the full GitHub events firehose at scale. The methodology is public, the ratios are derived from organic-vs-inorganic distribution fits, and Theo treats it as the authoritative source. Any catalogue hygiene work we do should cite this paper, not Theo's segment.

3. **Pricing for stars is now public.** Disposable accounts sell stars at 3–10¢ each. Mid-range accounts (some activity, some followers) 20–50¢. Aged accounts (years old, plausible history) 80–90¢. Theo uses this to illustrate the unit economics: you can buy a plausible 5,000 stars for a few thousand dollars, which is nothing against a seed VC round.

4. **Detection heuristics Theo walks through on stream (practitioner-usable).**
   - **Fork-to-star ratio.** Organic projects have roughly 150–300 forks per 1,000 stars. Fake-starred projects drop to under 50 forks per 1,000 stars. Flask sits at 235 (organic). LangChain sits around the same organic range. Projects far below 50 are suspicious.
   - **Watcher-to-star ratio.** Organic: 0.003–0.05 watchers per star. Fake: around 0.001 (stars without engagement).
   - **Zero-follower account percentage.** Organic stargazer base: 10–12% zero-follower accounts. Fake-starred repos: 50–81% zero-follower accounts. This is the strongest single signal.
   - **Ghost-account percentage** (accounts created, one star, then inactive): organic ~3–5%, fake 25–40%.
   - **Median account age of stargazers.** Organic projects skew older (~5–8 years median); fake-starred projects skew to 100–200 day median account age.

5. **VC funding round metrics create the target buy.** Theo cites Jordan Seagal (Redpoint) whose public data shows the median seed-stage AI/agent repo now has 2,850 stars and the median Series A has 4,980. This creates a hard financial incentive: every founder knows they need ~3K stars to get the first VC meeting and ~5K for the Series A pitch deck. Buying stars is directly ROI-positive if it closes a round worth millions. This is why the AI/LLM category dominates fake stars.

6. **Specific projects flagged by Star Scout with percentages.**
   - **Union Labs** (appears as #1 on the Runa ROSS open-source-startup index): ~47% suspected fake stars.
   - **Raga AI**: 76.2% zero-follower stargazers, 28% ghost accounts. Strong fake signal.
   - **OpenIFM**: 66% suspicious star signal, 36% ghost accounts, 116-day median stargazer account age.
   - **Langflow**: initial Star Scout flagging showed 48% fake; later cleaned up after the paper released (either organic growth overtook fakes or they purged and restarted clean).
   - **Hermes Agent (NousResearch)**: **CLEAN**. 6% ghost accounts, 8-year median stargazer account age. This matters to us because we have `hermes-wiki.md` and related Hermes entries catalogued.

7. **Legal exposure is real and recent.** FTC Consumer Review Rule took effect October 2024, explicitly prohibits fake social influence metrics, and carries $53,088 per violation. SEC precedent: **Headspin** CEO was criminally charged with wire fraud for inflating product-usage metrics presented to investors ($80M deception). Theo's read: buying GitHub stars is structurally similar — if presented to VCs as a credibility signal, it's within the SEC's theory of the case.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly applies to catalogue hygiene and our trust model for ingested tools. We've been treating star count as weak-but-usable signal; this segment provides the ratios to filter that signal. Also provides public justification for NOT publishing naive "top X stars" rankings — which we've avoided so far but could have slipped into. |
| **Actionable** | 8/10 | Concrete: add fork-to-star + zero-follower-% + ghost-% columns to our `_TEMPLATE.md` tool schema; run a one-time audit of our top-tier (8+) tool entries; maintain a "Star Scout cleared" annotation for Hermes-Wiki, Hermes Agent, etc. where we have external validation. |

---

## Summary

This roughly 55-minute segment of Theo's April 16 stream covers the Awesome Agents fake-star investigation and the Star Scout peer-reviewed paper that triggered it. The combined picture: roughly 6 million fake stars are currently live on GitHub across about 18,600 repos, involving ~301,000 fake accounts, and AI/LLM repos are the #1 non-malicious category (177K fake stars attributable). The fake-star economy is mature enough to have public pricing — 3¢ to 90¢ per star depending on account age and apparent activity — and the incentive is sustained by seed-to-Series-A VC metrics that explicitly reward star counts (Jordan Seagal / Redpoint median data: 2,850 stars at seed, 4,980 at Series A).

Theo walks through the Star Scout detection heuristics in practitioner terms. The fork-to-star ratio is the fastest first-pass filter: organic projects cluster at 150–300 forks per 1,000 stars, and anything under 50 forks per 1,000 stars is suspect. Flask and LangChain both sit in the organic range at around 235 per 1,000 — Theo uses them as reference points, not as targets. The watcher-to-star ratio is a secondary signal (organic 0.003–0.05, fake ~0.001). The strongest single signal is the zero-follower-account percentage among stargazers: organic projects run 10–12% zero-follower, fake-starred projects run 50–81%. Star Scout also tracks ghost accounts (create, star once, go inactive) at 3–5% organic vs 25–40% fake, and median stargazer account age (5–8 years organic vs 100–200 days fake).

The segment is specific about which projects Star Scout flagged. Union Labs (listed as #1 on the Runa ROSS open-source-startup index at the time of the paper) came in at ~47% suspected fake. Raga AI: 76.2% zero-follower, 28% ghost. OpenIFM: 66% suspicious, 36% ghost, 116-day median account age — near the absolute worst on every axis. Langflow was initially flagged at 48% fake in early Star Scout runs but cleaned up in a later release (ambiguous whether through organic growth or a deliberate purge). Critically for us, the segment includes Hermes Agent (NousResearch) as an example of a clean high-star project: 6% ghost accounts, 8-year median stargazer account age — which lines up with the organic distribution. We have Hermes Agent and Hermes-Wiki catalogued at high relevance; this is external corroboration, worth annotating in those entries.

The last third of the segment covers legal exposure. The FTC Consumer Review Rule (effective October 2024) makes fake social metrics a $53,088-per-violation offense. More significantly, Theo references the SEC precedent against Headspin's CEO, who was criminally charged with wire fraud for inflating metrics shown to investors (a scheme that defrauded investors of $80M). Theo's argument is that if GitHub stars are explicitly presented to VCs as part of a funding pitch — which Jordan Seagal's public data shows is now industry standard — and those stars are bought, then the SEC's existing wire fraud theory covers the case. He isn't predicting enforcement; he's noting that the legal infrastructure is already in place.

Practical implications for us: (1) fork-to-star ratio becomes a template field for all tool entries; (2) the top 8+ relevance tier of our catalogue deserves a one-time Star Scout audit; (3) "mentioned in Awesome Agents" drops to near-zero as a credibility signal since the list itself is now documented as contaminated; (4) Hermes Agent and related entries get a positive annotation as Star Scout-cleared.

---

## Notable Quotes

> "Six million fake stars. Three hundred and one thousand fake accounts. And AI/LLM is the number one non-malicious category. We did this to ourselves." — Theo (~02:40)

> "Under fifty forks per thousand stars and a high absolute star count? Paid for. Flask is two-thirty-five, LangChain is around there. Those are the shape of real." — Theo (~02:55)

> "Jordan Seagal from Redpoint published this — median seed AI repo, twenty-eight-fifty stars. Series A, forty-nine-eighty. Guess what every founder is now targeting." — Theo (~03:05)

> "Raga AI is seventy-six point two percent zero-follower stargazers. That's not a mistake, that's a purchase." — Theo

> "Hermes Agent came out clean. Six percent ghost, eight years median account age. That's what real looks like." — Theo

> "Headspin's CEO got charged with wire fraud for inflating metrics. Same theory of the case applies to your fake star farm if you showed it to a VC." — Theo (~03:20)

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Awesome Agents fake-star investigation post (find URL — likely Socket.dev blog or Medium) | Primary investigation walk-through | `/ingest-article` |
| Star Scout CMU/NCSU/Socket paper (arXiv) | Peer-reviewed source of all the ratios | `/ingest-article` |
| Dagster "we bought fake stars to see what happens" experiment post | Classic reference experiment Theo cites | `/ingest-article` |
| FTC Consumer Review Rule text (ftc.gov) | Legal primary source, $53K/violation | `/ingest-article` |
| SEC Headspin wire fraud filing | Legal precedent for inflated-metric fraud prosecution | `/ingest-article` |
| Jordan Seagal (Redpoint) VC metrics post | Source of the 2,850 seed / 4,980 Series A median | `/ingest-post` |
| Runa ROSS open-source-startup index | Where Union Labs ranked #1; context for the scale of the problem | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Star Scout (CMU/NCSU/Socket) | The peer-reviewed detection methodology | No (add as tool-catalogue) |
| Awesome Agents lists | Contaminated aggregator; credibility signal collapsed | No (would be a negative entry — skip or stub) |
| Hermes Agent (NousResearch) | Star Scout cleared; external validation | Yes — `agent-harnesses/hermes-wiki.md` (and related) |
| Union Labs | 47% suspected fake; #1 on Runa ROSS | No |
| Raga AI | 76.2% zero-follower; strong fake signal | No |
| OpenIFM | 66% suspicious, worst-of-all-axes | No |
| Langflow | 48% initially flagged, later cleaned | No (note if we add: caveat the history) |
| Flask | Organic reference point (235 forks/1000 stars) | No |
| LangChain | Organic reference point | Implicitly (many entries mention, but no dedicated tool entry) |
| Dagster | Bought fake stars as an experiment (reference) | No |

---

## Action Items

- [ ] **Update `_TEMPLATE.md` (tool template) to include a "GitHub Credibility" section**: fork-to-star ratio (with formula: `forks * 1000 / stars`), stargazer zero-follower % if measurable, Star Scout status if known. Minimum new field: `Fork-to-Star Ratio` (easy to compute from gh API).
- [ ] **One-time audit of our top-tier 8+ tool entries** for fork-to-star ratio. Target list from INDEX.md: GSD 2, Claude Agent SDK, Oh-My-Pi, Stripe Minions, Overstory, 12 Factor Agents, AGENTS.md, pi-side-agents, ccusage, Claude-Sneakpeek, Everything Claude Code, OpenAI Symphony, Pi Agent, Inngest, Gas Town, Warp/Oz, A2A Protocol, OpenAI Skills, Semgrep, AgentShield, Graphite, Langfuse, LiteLLM, Trigger.dev, DCG, oh-my-claudecode, Superpowers, Broomie, GasCity, Hermes Agent. Flag any under 50 forks/1000 stars for secondary review.
- [ ] **Annotate Hermes-Wiki / Hermes Agent / related entries with "Star Scout cleared (6% ghost, 8yr median account age)"** as external validation. This is free credibility for those entries, worth capturing.
- [ ] **Downgrade "Awesome Agents" as a credibility signal everywhere in our catalogue.** Any entry that cites "listed in Awesome Agents" as a reason for relevance should have that reason struck or caveated. Going forward: Star Scout / Socket / direct use / practitioner citation only.
- [ ] **Add a one-paragraph "Catalogue trust model" note to INDEX.md header** explaining our position on star counts: weak signal, must be triangulated with fork ratio + practitioner mention + actual code inspection.
- [ ] **Do NOT buy stars, do NOT inflate metrics on any of our repos (OmniPort, Orchestrator, MC, MAYTT).** Legal exposure is real (FTC $53K/violation; SEC wire-fraud precedent via Headspin). This is not a productivity note, it's a compliance note.
