# Head of Growth (Anthropic): "Claude is growing itself at this point"

> **Amol Avasare (Anthropic) — Lenny's Podcast, 2026-04-05**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=k-H4nsOTuxU |
| Speaker | Amol Avasare, Head of Growth, Anthropic |
| Host | Lenny Rachitsky |
| Event | Lenny's Podcast: Product / Career / Growth |
| Duration | 01:52 |
| Date | 2026-04-05 |
| Topics | growth engineering, AI-native growth, autonomous experiments, activation, product-led growth, PM-to-engineer ratio, research flywheel, big bets vs. micro-optimization |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **CASH: Claude-powered autonomous growth experimentation** — Anthropic built an internal tool called CASH that uses Claude to autonomously run growth experiments. This is the "Claude is growing itself" thesis: the product is literally used to optimize its own adoption funnel. This is the most concrete example of an AI company dogfooding its own agent capabilities for non-engineering business functions.

2. **Activation is the highest-leverage growth problem in AI** — Not acquisition, not retention. The biggest unlock is getting users past the initial "what do I do with this?" moment. This frames the entire growth strategy around reducing time-to-value rather than traditional top-of-funnel optimization. Relevant to any AI product including our orchestrator.

3. **70/30 big bets over micro-optimization** — Anthropic's growth team allocates 70% of effort to large strategic bets and only 30% to incremental A/B testing. This is a deliberate rejection of the classic growth hacking playbook (run 100 small experiments). The reasoning: in a market growing this fast, the opportunity cost of playing small exceeds the risk of big swings.

4. **PM-to-engineer ratio needs to flip** — As AI coding tools (Claude Code) make engineers dramatically more productive, the traditional 1 PM : 5 engineers ratio may need to invert. Engineers are getting the most leverage from AI right now, so teams may need more PMs/designers per engineer to keep up with the increased output. This is a structural org design insight.

5. **AI coding creates a research flywheel** — Claude Code's success feeds back into Anthropic's core model development. Better coding tools attract more developers, who generate more usage data, which informs model training, which produces better coding capabilities. This virtuous cycle is a moat that compounds over time.

6. **Cowork for team alignment detection** — Anthropic uses Claude Cowork to analyze Slack conversations and detect team misalignment early. This is an internal application of their own product for organizational health monitoring -- another dogfooding data point.

7. **$1B to $19B ARR in 14 months** — The raw growth numbers are staggering and represent the fastest B2B SaaS ramp in history. This validates that AI products can achieve consumer-scale growth with enterprise-scale revenue.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | The CASH autonomous experimentation system is directly relevant -- it's an agent autonomously running business experiments, which is exactly the kind of non-coding agent work our orchestrator could expand into. The activation-as-bottleneck insight applies to our own product onboarding. The research flywheel concept validates the "AI building AI" thesis we're operating under. The PM-to-engineer ratio discussion has implications for how we structure agent teams. |
| **Actionable** | 5/10 | The CASH tool is internal and not open-sourced, so we can't study the implementation. However, the 70/30 big-bets framework is immediately applicable to how we prioritize orchestrator features. The activation insight is relevant for any product we ship. The Cowork-for-alignment pattern could be replicated with our own agent monitoring. Limited direct technical transfer since this is a growth strategy talk, not an engineering architecture talk. |

---

## Summary

Amol Avasare, Head of Growth at Anthropic, joined Lenny Rachitsky for a nearly two-hour conversation about how Anthropic scaled from $1 billion to over $19 billion in ARR in just 14 months -- making it the fastest growth trajectory in B2B SaaS history. Avasare landed his role by cold-emailing Anthropic's CPO Mike Krieger (formerly co-founder of Instagram), and brought a growth engineering background from companies like Uber, DoorDash, and Calm.

The central thesis is captured in the episode title: "Claude is growing itself at this point." Anthropic built an internal tool called CASH that uses Claude to autonomously design, run, and analyze growth experiments. This represents a practical example of AI dogfooding at the business operations level -- not just using Claude for coding, but for growth strategy execution.

Avasare frames activation as the single highest-leverage growth problem in AI products. Unlike traditional SaaS where the value proposition is immediately clear (spreadsheet, CRM, etc.), AI products face a unique "what do I do with this?" barrier. Anthropic's growth strategy focuses heavily on reducing time-to-value through better onboarding and contextual guidance rather than optimizing top-of-funnel metrics.

The conversation covers Anthropic's deliberate 70/30 allocation toward big strategic bets over incremental optimization -- a rejection of the traditional growth hacking playbook of running hundreds of small A/B tests. In a market growing as fast as AI, the opportunity cost of thinking small outweighs the risk of big swings.

Avasare also discusses the structural implications of AI coding tools on team composition. As Claude Code makes engineers dramatically more productive, the traditional 1:5 PM-to-engineer ratio may need to flip. Engineers are currently getting the most leverage from AI, creating a potential bottleneck on the product management and design side.

The episode also covers how Claude Code's success creates a research flywheel -- more developer adoption generates usage data that improves model training, which produces better coding capabilities, which attracts more developers. This compounding loop is a structural moat. Anthropic also uses Claude Cowork internally to analyze Slack conversations and detect team misalignment early.

Personal context: Avasare shared his experience recovering from a traumatic brain injury sustained in Muay Thai, which sidelined him for nearly a year before joining Anthropic. He credits the experience with sharpening his focus and decision-making framework.

---

## Notable Quotes

> "Claude is growing itself at this point." — Episode title / thesis

> "While PMs and designers are getting leverage from AI, engineering is getting the most leverage right now. If you think about a default team with 5 engineers, 1 designer, 1 PM -- with Claude Code, you might need to flip that ratio." — Amol Avasare (via Lenny's X post)

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.lennysnewsletter.com/p/anthropics-1b-to-19b-growth-run | Full show notes with timestamps and links; paid subscriber transcript | `/ingest-article` |
| https://www.lennysnewsletter.com/p/head-of-claude-code-what-happens | Related Lenny's episode with Boris Cherny (Head of Claude Code) on post-coding future | `/ingest-talk` |
| https://www.lennysnewsletter.com/p/the-design-process-is-dead | Related Lenny's episode with Jenny Wen (Head of Design at Claude) on design transformation | `/ingest-talk` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| CASH | Anthropic's internal Claude-powered autonomous growth experimentation tool | No |
| Claude Code | AI coding tool driving the research flywheel; basis for PM-to-engineer ratio discussion | Yes -- extensively catalogued |
| Claude Cowork | Slack analysis tool for detecting team misalignment; internal dogfooding example | No |
| Granola | Referenced as a tool/company in show notes | No |
| Mercury | Referenced sponsor/example company | No |

---

## Action Items

- [ ] Study the CASH concept (autonomous growth experiments via agent) as a template for non-coding agent applications in our orchestrator
- [ ] Apply the 70/30 big-bets framework to our own feature prioritization
- [ ] Consider activation optimization patterns for any products we ship
- [ ] Watch the Boris Cherny (Head of Claude Code) episode for technical architecture insights
- [ ] Evaluate the Cowork-for-alignment pattern as inspiration for agent monitoring dashboards
