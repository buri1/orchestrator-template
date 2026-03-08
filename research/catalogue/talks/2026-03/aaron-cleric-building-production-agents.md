# Lightning Talk: Building Production Agents — Lessons from Cleric

> **Aaron Ahmed — Coding Agents: AI Driven Dev Conference 2026, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [YouTube (04:52:32 - 05:00:25)](https://www.youtube.com/watch?v=99Kxkemj1g8&t=17552s) |
| Speaker | Aaron Ahmed, Head of Product @ Cleric |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~08:00 (lightning talk) |
| Date | 2026-03-08 |
| Topics | learning agents, agent memory, stateful agents, self-improvement, operational memory, correction loops |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Agent capabilities are commoditized — learning is the next differentiator.** As of 2026, raw agent capabilities are table stakes. The agents that "earn their place" accumulate knowledge about three things: environment, team/workflow, and past outcomes/corrections. This is the competitive moat now.

2. **The three properties of effective corrections: persist, compound, be visible.** A correction should (a) persist — the agent recalls the lesson in the same context next time, (b) compound — the agent generalizes the lesson to adjacent contexts, and (c) be visible — the agent shows its work so users can see knowledge being applied and correct it when wrong.

3. **Good learning agents absorb context continuously (ambient learning).** You cannot rely solely on explicit user corrections. The agent must be placed "in the path of real work" automatically — monitoring channels, observing incidents, absorbing environment context — so learning happens without the user having to invoke the agent each time.

4. **The three lessons form an interdependent loop — break one and the system fails.** Easy correction without visible improvement loses trust. Visible improvement without ambient learning limits scope to user-directed work only. Ambient learning without user correction risks compounding errors (dead code, outdated docs).

5. **No fine-tuning required — context engineering is sufficient.** In the Q&A, Aaron confirmed Cleric achieves all of this through context engineering alone, with no model fine-tuning. As models improve, these patterns only get easier.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly validates our memory architecture decisions; the persist/compound/visible framework maps to our orchestrator's state management and CLAUDE.md knowledge accumulation. The "ambient learning" concept is exactly what our session hooks and pre-compact handoff scripts attempt. |
| **Actionable** | 7/10 | The three-lesson loop is a concrete design checklist. We should evaluate our orchestrator against: (1) do corrections persist across sessions? (2) do they compound into related contexts? (3) are they visible to the operator? The "agent in the path of real work" principle reinforces our always-on monitoring design. |

---

## Summary

Aaron Ahmed, Head of Product at Cleric (an AI SRE product), presents three lessons learned from building a "learning agent" — one that retains and applies knowledge across sessions, as opposed to stateless agents that start fresh each time.

The core thesis is that agent capabilities have been commoditized in the past year, and the next horizon of differentiation is self-learning. Agents that earn their place will accumulate knowledge about three things: the user's environment, the team and how they work, and past outcomes and corrections. Cleric demonstrates this by connecting to infrastructure and observability tools, monitoring alert channels, learning from incidents, and adapting to user preferences over time.

The three lessons are: (1) make it easy for users to teach via correction — propose memories, self-harvest skills, capture user ratings, and visibly never repeat mistakes; (2) reward corrections with better performance — corrections must persist (same context recall), compound (generalize to adjacent contexts), and be visible (show the agent's reasoning and knowledge application); (3) absorb context continuously — place the agent in the path of real work automatically so learning happens ambiently rather than only when explicitly invoked.

Aaron emphasizes these three lessons form a tightly coupled loop. Missing any one element undermines the others: easy correction without visible improvement erodes trust, visible improvement without ambient learning constrains scope, and ambient learning without user correction risks compounding errors from outdated documentation or dead code. In the Q&A, he confirmed Cleric achieves all of this through context engineering alone — no fine-tuning — and expects foundation model improvements to make these patterns even more accessible.

---

## Notable Quotes

> "Agent capabilities are commoditized. This wasn't the case at this time last year. And the next horizon of differentiation is going to be learning or self-learning." — [04:53:28]

> "You lose your user's trust when they expend the effort to teach the agent something and that lesson is not retained." — [04:55:29]

> "Think about all the dead code or the outdated documentation that's just laying in wait for the agent to stumble on." — [04:58:35]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://cleric.io | Cleric AI SRE product — understand their architecture and memory implementation | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Cleric | Aaron's company — AI SRE that learns from production incidents, builds environment models, absorbs alert channel history | No — consider `/tool-catalogue` |

---

## Action Items

- [ ] Evaluate our orchestrator state management against the persist/compound/visible framework
- [ ] Assess whether our session hooks and pre-compact handoff achieve "ambient learning"
- [ ] Consider adding explicit user correction capture (ratings/feedback) to agent outputs
- [ ] Review MEMORY.md compounding — do learnings generalize across contexts or stay siloed?
