# Victor — An AI Coworker That Lives in Slack

> **Frederick Vichowski (Co-founder of Victor, formerly JACE) — AI Engineer Europe 2026, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=22426s |
| Speaker | Frederick Vichowski — Co-founder of Victor (formerly JACE). Company journey: 2023 started building browser-based AI employees (JCAI — state-of-the-art on Web Arena benchmark, pioneered DOM minification); evolved to JACE email agent in the Sonnet 3.5 era (still operational); launched Victor in February 2026 with zero growth expectations and hit immediate product-market fit. |
| Event | AI Engineer Europe 2026, London |
| Date | 2026-04-09 |
| Duration | ~20 min |
| Topics | ai-employee, company-agents, slack-agents, enterprise-deployment, memory-at-scale, permissions-hierarchy, tool-vs-hire, personal-vs-company-agent, proactivity, opus-vs-gpt, pipedream-integrations, tone-and-personality, agi-for-companies, latency-hiding |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.)*

---

## Key Takeaways

1. **Company agent != personal agent.** Victor is framed as an "AI employee" rather than an "AI assistant." The defining distinction is that one admin connects an integration once and the whole team inherits access, versus a personal agent where each user has to connect everything themselves. This sidesteps the 100x onboarding tax and makes horizontal PhD-level context possible ("a hired CMO could be better if they had access to the codebase").

2. **Slack as the only interface (no web app).** Victor deliberately ships without a web app for two reasons: (a) humans don't interact with other humans through web apps, so Slack "feels like a hire," and (b) Slack hides latency — a 10-minute agent response feels fast in Slack but unbearable in a web app context switch. "No teammate builds you an app in 10 minutes" is the yardstick.

3. **Memory at scale is a new failure mode.** OpenClaw-style memory clutter scales linearly with user count. At 100 users it clutters 100x faster. Victor had to solve this explicitly before launch — a warning for any team agent that naively reuses personal-agent memory patterns.

4. **Permissions hierarchy is non-trivial and non-optional.** Growth channel, engineering channel, executive channel, and DMs all need distinct context boundaries to prevent leakage. This is a multi-axis scoping problem that personal agents never face.

5. **Non-linear Slack context.** Slack inputs are not a linear transcript: DMs, threaded replies, reactions, and edits must all be flattened into a single linear context window the LLM can consume. Deletes are treated as "task should not continue" signals. Thread-vs-new-DM continuity matters — humans forget and start fresh, so the agent has to roll context over from prior threads automatically.

6. **Tone/personality matters more than tool-call quality.** Victor uses Opus 4.6. They AB-tested against GPT 5.4 (better tool calling, cheaper, faster) and users raged — "they loved Opus." Opus is described as "a bit sassy" in the Victor persona. OpenAI's "god-tier strategy" cited: "don't be shitty." The takeaway is that for employee-framed agents, model personality is a load-bearing product surface, not a branding afterthought.

7. **Proactivity is earned, not defaulted.** Victor can proactively suggest automations (e.g., overhearing an AB test discussion in #growth, checking PostHog, posting "that's actually not statistically significant"). But on Day 1 after install, pinging everyone will get the security team to rage-quit the product. Roll out proactivity to power users first, then broaden. This is a real enterprise adoption gate.

8. **Tool-vs-hire distinction is a real security risk.** The canonical customer story: a US e-commerce admin connected their personal Gmail as Victor's first integration. The team then started asking Victor about the admin's private emails. Frederick's response: "You wouldn't give a new employee your personal email." Victor added a "scoping feature" so personal integrations are only accessible to their owner. The design principle is "Victor is a hire, not a tool" — permission surfaces must match that mental model.

9. **Browser agent -> email agent -> Slack agent evolution.** The company journey encodes lessons at each step: (1) JCAI browser agents worked for 3-5 steps at 60% per step — compounds to ~8% end-to-end, unprofitable; lossless DOM minification was a real contribution but couldn't fix the reliability compound. (2) JACE email agent added persistent context and proactivity but was single-user. (3) Victor inherits the context+proactivity wins and adds the company surface. Each product was a forced move based on the previous ceiling.

10. **Latency hiding via channel choice is a core pattern.** The insight that Slack makes a 10-minute response feel fast is genuinely novel as an interface design principle for agents. In a web app, every second of wait is context-switch debt. On Slack, the user is already in a multi-threaded async mental model — 10 minutes is well under the "ignore a coworker" threshold. This is a reusable pattern for our own long-running agent UX.

11. **Three pillars for a "real" AI coworker.** Vichowski's synthesis: (1) *Helps get work done* — today's models plus Pipedream-style connectors make this commodity; (2) *Knows the company* — Slack ambient context utilization is the differentiator; (3) *Is actually friendly* — if your team doesn't like Victor, Victor dies. Slack approval process is painful but necessary because it forces the discipline. The closing frame is "AGI for companies by 2030" and the Leibniz quote: "It is unworthy of excellent men to lose hours like slaves in the labor of calculation."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | We are building multi-agent orchestrators that will eventually need to operate in team/company contexts (OmniPort-HH, SaaS products, agency work). Victor's personal-vs-company agent distinction directly applies to how we design permissions in `_bmad/orchestrator-tmux-state.json` for any future multi-tenant deployment. The memory-at-scale and permissions-hierarchy challenges are the exact problems we'll face the moment we put an orchestrator in a team Slack. The latency-hiding insight is already useful for our current long-running tmux worker UX. |
| **Novelty** | 8/10 | (1) Explicit "one admin connects integrations for the whole team" as a company-agent differentiator is a framing we haven't catalogued elsewhere. (2) "Scoping feature" as a hard separator between personal and team integrations is a concrete pattern. (3) Slack-as-latency-hide is a new interface design principle. (4) Opus-vs-GPT AB test favoring Opus on pure tone/personality (not capability) is a surprising data point. (5) Non-linear Slack context flattening (DMs + threads + reactions + edits + deletes as signals) is a set of subtleties we haven't seen documented. JACE->Victor company history adds depth to the AI-employee category. |
| **Actionable** | 7/10 | (1) Adopt "personal integrations stay private to their owner" as a permission invariant if we ever spawn team agents. (2) Apply latency-hiding logic: any long-running agent action should be routed through an async channel (Slack, email, devlog) rather than a web UI that blocks. (3) Treat proactivity as earned-trust gradient — start with explicit opt-in for power users, broaden from there. (4) Model tone as a product feature, not a debug toggle. (5) Plan for multi-channel context flattening if we ever integrate with Slack (threads, DMs, reactions as distinct input classes). (6) Use Pipedream as the connector layer reference when evaluating integration breadth. |

---

## Relevance for Orchestrator Research

**HIGH.** Victor is one of the cleanest extant examples of an AI agent designed around the *employee* metaphor, not the *assistant* metaphor, deployed into the exact context (Slack, team-scoped, proactive) that our orchestrator would need to inhabit if we ever moved beyond solo-developer workflows. The five enterprise-specific challenges Vichowski identifies — memory at scale, permissions hierarchy, non-linear context, tone matching, and earned proactivity — are a pre-written checklist for our team-agent roadmap. The tool-vs-hire customer story is the kind of concrete failure mode we should use to stress-test our own permission design. The JCAI->JACE->Victor evolution is also an implicit endorsement of the "start narrow, compound reliability" philosophy that matches our tmux orchestrator trajectory.

---

## Summary

Frederick Vichowski, co-founder of Victor (formerly JACE), delivered a ~20-minute talk at AI Engineer Europe 2026 in London on how to build an AI coworker that actually works inside a company. The talk traces his team's 3-year journey from browser agents (JCAI, 2023) through email agents (JACE, 2024, Sonnet 3.5 era) to the Victor launch in February 2026, which hit immediate product-market fit with zero growth investment.

**Company history as lesson archive.** In 2023, Vichowski's team built JCAI — browser-based AI employees that achieved state-of-the-art on the Web Arena benchmark. They pioneered DOM minification (lossless compression of the DOM for LLM context) but ran into a hard reliability wall: 60% per-step accuracy compounds to ~8% over 5 steps, which is unprofitable. Browser agents "worked for 3-5 steps reliably" but couldn't be productized because they took minutes to fail where function calls take seconds. In 2024 they pivoted to JACE, an email agent built in the Sonnet 3.5 era, adding persistent context and proactivity in a narrower domain. JACE is still alive. In February 2026 they launched Victor with zero growth expectations — and hit immediate product-market fit, now growing worldwide.

**Victor is an AI employee, not an AI assistant.** The defining frame: Victor lives in Slack (no web app), participates in threads, channels, and DMs, has access to 3,000+ Pipedream integrations, and can build its own connections. It has horizontal, PhD-level understanding across all company areas. Vichowski's aphorism: "A hired CMO could be better if they had access to the codebase." The company context is the moat.

**Personal vs company agent is a design fork, not a scaling exercise.** In a personal agent, one user connects each integration and everything runs on their own surface. In a company agent, one admin connects an integration and the whole team inherits permissions — no 100x onboarding tax. The team agent is the only form that can plausibly "live where you work" as a shared entity. But this creates four new challenge classes that personal agents never face:

1. **Memory at scale.** The OpenClaw memory clutter problem multiplies by user count. At 100 users, memory clutters 100x faster. Vichowski says Victor solved this explicitly before launch — it was a mandatory prerequisite.

2. **Permissions hierarchy.** Growth channel, engineering channel, executive channel, and DMs need separate context boundaries. Context leakage between them is a fireable offense. Victor maintains a multi-axis permission model.

3. **Non-linear context.** Slack is not a linear transcript. DMs, threads, reactions, edits, and deletes all feed into the agent's input — and all must be flattened into a linear context window. Vichowski notes deletes are interpreted as "task should not continue," and thread-vs-new-DM continuity is handled by automatically rolling context over from prior threads ("humans forget and start fresh").

4. **Tone/personality.** Somewhat surprisingly, this is where Victor invests the most. They use Opus 4.6. They AB-tested GPT 5.4 (better tool calling, cheaper, faster code gen) and users raged — "they loved Opus." Victor's Opus persona is described as "a bit sassy." Vichowski credits OpenAI with a "god-tier strategy: don't be shitty," and concludes that for employee-framed agents, personality is a load-bearing product feature, not a debug toggle.

**Slack as interface is the second key design choice.** Two reasons drive this. First, it *feels like a human employee* — people don't interact with coworkers through web apps. Second, and more interesting, **Slack hides latency**. Powerful agents can take 10 minutes to respond. In a web app, 10 minutes of context-switching is unbearable. In Slack, 10 minutes is well under the "ignore a coworker" threshold — async multi-threading is already the mental model. "No teammate builds you an app in 10 minutes" is the benchmark. This latency-hiding insight generalizes: any long-running agent should be routed through a channel where the user already expects asynchronous responses.

**Slack-specific engineering is non-trivial.** Victor has to handle DMs, threads, channels, emoji reactions, edits, and deletes as distinct input modalities. Thread-vs-new-DM continuity is a named problem. Deletes-as-cancellation is a specific convention.

**Proactivity is earned, not defaulted.** Victor can proactively spot opportunities — e.g., hearing an AB test discussion in #growth, checking PostHog, posting "that's actually not statistically significant." But if Victor DMs everyone on Day 1 after install, the security team will rage-quit the product. The explicit rollout pattern: "earn it with the first few users, then roll out broadly." Proactivity is a trust gradient.

**Tool vs hire — a real security incident.** Vichowski's canonical customer story: one of the biggest US e-commerce brands. The admin installed Victor, and as the first integration, connected his *personal* Gmail. The team started asking Victor about the admin's private emails. The admin texted Frederick: "Victor is leaking all my data!" Frederick's reply: "Why did you give Victor personal email access?" The fix was a scoping feature: personal integrations are only usable by their owner. The design principle: "Victor is a hire, not a tool" — you wouldn't give a new employee your personal email, so the permission model must match that mental model by default.

**Three pillars for any AI coworker.** Vichowski's closing synthesis: (1) *Helps get work done* — this is easy today, models plus Pipedream connectors are commodity; (2) *Knows the company* — Slack ambient context is the differentiator; (3) *Is friendly* — if the team doesn't like Victor, Victor is gone. The Slack approval process is painful but necessary because it forces the discipline. The closing vision is "AGI for companies by 2030," framed with the Leibniz quote: "It is unworthy of excellent men to lose hours like slaves in the labor of calculation, which could be safely relegated to anyone else if machines were used."

**Offer:** Attendees of AIE Europe 2026 get $100 free Victor credits, no strings attached, with a personal follow-up from Frederick if the product doesn't deliver value.

---

## Notable Quotes

> "It's a hire, not a tool." — on the core mental-model shift from AI assistant to AI employee

> "A hired CMO could be better if they had access to the codebase." — on the horizontal company-context advantage

> "No teammate builds you an app in 10 minutes." — on why Slack hides agent latency

> "Users loved Opus. There's something beautiful in that model." — on the Opus-vs-GPT-5.4 AB test result

> "OpenAI figured out a god-tier strategy: don't be shitty." — on tone as a product surface

> "Victor is leaking all my data!" — the admin-texted panic that led to the personal-integration scoping feature

> "You should earn it with the first few users, then roll out broadly." — on proactivity rollout

> "It is unworthy of excellent men to lose hours like slaves in the labor of calculation." — Leibniz, cited as the founding motivation for AI employees

---

## Personal vs Company Agent Comparison

| Dimension | Personal Agent | Company Agent (Victor) |
|-----------|---------------|------------------------|
| **Integration onboarding** | Each user connects each integration themselves | One admin connects once, team inherits permissions |
| **Context scope** | Single user's inbox / calendar / files | Horizontal PhD-level across company areas |
| **Memory scale** | Single-user clutter baseline | Multiplies linearly with team size — N× OpenClaw clutter at N users |
| **Permissions** | Single-owner ACL | Multi-axis: channel, team, DM, integration-scope, personal-vs-shared |
| **Context structure** | Mostly linear per user | Non-linear: threads, DMs, reactions, edits, deletes as distinct modalities |
| **Interface** | Web app acceptable | Slack-native (web apps break the hire metaphor and expose latency) |
| **Latency tolerance** | Seconds — web UX penalizes waits | Minutes — Slack async mental model hides it |
| **Proactivity risk** | Low — annoys one user | High — can get security team to rage-quit the whole install |
| **Tone sensitivity** | Moderate | High — team must actively like the agent or it dies |
| **Tool vs hire framing** | "It's my tool" | "It's our hire" — permission surfaces must match |
| **Example failure mode** | Forgets a task | Leaks admin's personal email to the whole team |

---

## Three Pillars Framework

Vichowski's closing framework for building an AI coworker:

1. **Helps get work done.** Commodity today. Models are capable; Pipedream-style connectors cover 3,000+ integrations. No moat here.
2. **Knows the company.** Slack ambient context utilization is the hard problem and the actual differentiator. Memory at scale, permissions hierarchy, and non-linear context flattening are the three sub-problems.
3. **Is friendly.** Tone is a product feature. Opus is load-bearing. If the team doesn't like Victor, Victor dies. Slack approval processes are painful but force the friendliness discipline.

All three must be solved simultaneously. Solving only the first gets you a tool; adding the second gets you an advanced assistant; only solving all three gets you something the team treats like a hire.

---

## Company Journey (JCAI -> JACE -> Victor)

| Era | Product | Primary Surface | Lesson Extracted |
|-----|---------|----------------|------------------|
| 2023 | JCAI | Browser (DOM-based) | Lossless DOM minification works but 60%/step compounds to ~8% end-to-end; reliability wall forces a narrower domain |
| 2024 | JACE | Email | Sonnet 3.5 era; persistent context + proactivity in a narrow domain; single-user ceiling; still operational |
| 2026 Feb | Victor | Slack | Team-scoped, horizontal company context, Opus 4.6, employee metaphor; immediate PMF with zero growth spend |

Each product was a forced move from the previous ceiling. The compounding lesson: start narrow to stabilize reliability, then broaden surface only when the new surface hides the previous weakness (browser latency -> email async -> Slack async).

---

## Relevance / Novelty / Actionable

| Dimension | Score |
|-----------|-------|
| Relevance | 9/10 |
| Novelty | 8/10 |
| Actionable | 7/10 |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://heyvictor.com | Victor product page — pricing, integration list, scoping feature documentation | `/ingest-article` |
| https://jace.ai | JACE (still operational) — email agent, Sonnet 3.5 era product that's now in maintenance; context/proactivity pattern source | `/ingest-article` |
| https://pipedream.com | Pipedream — the 3,000+ integration connector layer Victor builds on; reference for any integration-breadth evaluation | Tool catalogue entry |
| (arXiv) "Web Arena" benchmark | Original Web Arena benchmark JCAI achieved SOTA on — useful for understanding the 2023 browser-agent reliability wall | `/ingest-article` |
| https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz | Leibniz quote context — the "unworthy of excellent men" quote is from a 1685 letter, sometimes cited in automation history | Reference only |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Victor | Subject of the talk — Slack-native AI coworker | No — this entry |
| JACE | Previous product — email agent from 2024 Sonnet 3.5 era, still alive | No — worth a referenced note |
| JCAI | 2023 browser-based AI employee — Web Arena SOTA, DOM minification pioneer | No — historical reference |
| Slack | Primary interface; drives both hire-metaphor and latency-hiding design | Ambient — well known |
| Pipedream | 3,000+ integration connector layer Victor builds on | No — should add to tool catalogue |
| Opus 4.6 | Victor's production model — chosen over GPT 5.4 purely on tone | Ambient |
| GPT 5.4 | AB-tested and rejected on user tone preference | Ambient |
| PostHog | Example tool Victor checks for statistical significance in proactive growth suggestions | Ambient |
| OpenClaw (memory clutter problem) | Referenced as the canonical memory-at-scale failure mode | Yes — orchestration-platforms/openclaw.md |

---

## Action Items

- [ ] If/when we build team-scoped agents: adopt "personal integrations stay private to their owner" as a hard permission invariant
- [ ] Apply latency-hiding principle to our long-running tmux workers — route completion notifications through an async channel (devlog, Slack, email) rather than a blocking web UI
- [ ] Treat proactivity as an earned-trust gradient — default-off for new installs, opt-in expansion to power users first
- [ ] Model tone as a product surface, not a debug toggle — if we ever expose agents to non-technical users, the personality must be validated
- [ ] Plan for multi-channel context flattening (threads + DMs + reactions + edits + deletes) before any Slack integration — this is non-trivial preprocessing
- [ ] Add Pipedream to tool catalogue as the reference integration-connector layer
- [ ] Add a note to `orchestration-platforms/openclaw.md` referencing Victor's "memory clutter multiplies by N users" finding
- [ ] Cross-reference with Peter Steinberger's State of the Claw talk — both identify memory and permissions as the hardest team-agent problems
