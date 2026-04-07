# AI-Driven Development Transformation at Kilo

> **Scott (CEO, Kilo) — Coding Agents: AI Driven Dev Conference 2026**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (00:45:54 - 01:11:39) |
| Speaker | Scott, Co-founder & CEO at Kilo |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~26 min (incl. Q&A) |
| Date | 2026-03 |
| Topics | agentic engineering, orchestration, trust ladder, developer transformation, model routing, team structure, multi-agent |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **The Trust Ladder is fragile and measurable** -- Developers progress through four stages (autocomplete -> chat -> single agent -> orchestration), but trust can break at any point and send them back down. Kilo observed that even 200ms latency spikes caused measurable usage drops. Trust is not a feeling -- it is quantifiable via acceptance rates, copy behavior, and feature adoption.

2. **Anti-collaboration + N=1 ownership unlocks velocity** -- Kilo deliberately minimizes collaboration. Each engineer owns one feature end-to-end (conception, coding, deployment, user feedback). They have ~15 engineers, 1 PM for the whole company, and ship 1-2 features per week. The bottleneck is no longer coding -- it is process overhead.

3. **The work shifts, it does not shrink** -- Moving from 80% coding / 20% thinking to 80% thinking / 20% coding is cognitively taxing. Engineers new to Kilo need about a week to adjust to spending most of their time as architect/orchestrator rather than code writer. Scott calls this supporting "200 hours a week of agent coding" vs the old "4 hours architecture + 36 hours coding."

4. **Right model for the right job** -- Kilo learned the hard way that throwing everything at the most expensive model is wasteful. Their philosophy: use state-of-the-art models (Opus) for architecture/planning, cost-effective models (Qwen/MiniMax/GLM) for coding/debugging. The power comes from combining models, not picking one.

5. **Context depth scales with trust level** -- At autocomplete level, the agent only needs the current file. At chat, it needs related files and docs. At agent level, it needs the full repo + dependencies. At orchestration level, it needs all repos across the organization. Kilo's data engineer built an entire DBT data model in 1-2 weeks (vs 6 months) by giving the agent access to both the data repo and the application repo.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly validates our orchestrator architecture. Scott's description of "developer as orchestrator of agents" is literally what we are building. The N=1 ownership model, anti-collaboration stance, and trust-as-measurable-metric all map to our system. Their 5 built-in agents (orchestrator, architect, code, ask, debug) mirror our agent specialization patterns. |
| **Actionable** | 7/10 | The trust ladder framework is immediately useful for thinking about our own adoption curve. The model routing philosophy (expensive for planning, cheap for execution) validates our architecture. The "context depth scales with trust level" insight reinforces our context separation principle. The anti-collaboration / single-owner model is a strong org pattern for client engagements. |

---

## Summary

Scott, co-founder and CEO of Kilo (an "all-in-one agentic engineering platform" with 25+ trillion tokens processed and 1.5+ million developers since May 2025), presents the lessons learned from transforming both Kilo's internal engineering team and their user base into AI-native development workflows.

The core thesis is that developers are evolving from "code monkeys" who write every line into "orchestrators" who manage AI agents, guide vision, set quality gates, and make architectural decisions. At Kilo, this transformation took the team from shipping one feature every 2-3 weeks to shipping 1-2 features per week -- without growing the team. The key enablers were: eliminating unnecessary collaboration (inspired by PostHog's anti-collaboration philosophy), implementing N=1 feature ownership (one engineer owns a feature from conception through deployment and user feedback), and embracing AI agents for all execution work.

Scott introduces the "Trust Ladder" -- a four-stage progression from autocomplete through chat, single agent, to full orchestration. Each stage requires more trust and more context. Critically, trust is fragile: slow suggestions, wrong file edits, or excessive permission requests can break it and send users back down the ladder. Kilo obsessively monitors trust metrics (autocomplete acceptance rates, chat result adoption, agent task completion) and ships fixes rapidly to eliminate "sharp edges." They found that trust is measurable at the autocomplete level (clear accept/reject signal), harder at chat level (seconds of delay before knowing if the result was used), and hardest at orchestration level (results come minutes/hours/days later).

A key practical insight is model routing: Kilo initially defaulted to the most expensive models for everything and learned this was both costly and slow. Their current philosophy is to match model capability to task complexity -- state-of-the-art models for architecture and planning, cost-effective models for coding and debugging. The power comes from combining models rather than using a single one.

During Q&A, Scott elaborates on their organizational structure: one PM for the entire company (focused on horizontal platform concerns), each engineer acting as their own PM for their vertical feature. When asked about vacation coverage, Scott is candid -- if the code review owner takes a week off, code reviews may not progress that week, and they accept that tradeoff because the velocity gains from single ownership far outweigh the downtime. For production issues, they maintain an on-call rotation with proactive monitoring and heavy use of the "ask agent" for incident triage.

---

## Notable Quotes

> "We stopped working like it's 2023 and we started working like it's 2027." -- 00:47:54

> "We are very anti-collaboration. [...] We make sure it's not the default. You only are supposed to collaborate with someone if you really need to, and it adds value." -- 00:49:14

> "In the age of AI, coding is the easy part and the bottleneck is no longer the coding, it's kind of all the process." -- 00:50:16

> "You got to give trust to get trust." -- 00:56:49

> "It is much harder to do 40 hours a week where you are the architect and orchestrator and you are supporting 200 hours a week of an agent coding, versus 4 hours a week of architecture and thinking and 36 hours of coding." -- 01:03:17

> "The developer is the conductor of an orchestra. They are the tastemaker, the architect, they're deciding the quality gates, and then the agent is just handling all the execution." -- 01:03:45

> "We don't really believe in PMs at Kilo. Every engineer is their own PM." -- 01:10:08

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| ~~https://www.kilo.dev~~ | ~~Kilo's agentic engineering platform -- 25T+ tokens, 1.5M+ devs, 5 built-in agents (orchestrator, architect, code, ask, debug)~~ | DONE -- [Kilo Code](../../agent-harnesses/kilo-code.md) |
| ~~PostHog anti-collaboration blog post~~ | ~~Referenced by Scott as inspiration for their anti-collaboration philosophy~~ | DONE -- [Collaboration sucks](../../articles/2025-11/collaboration-sucks.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Kilo | Scott's company -- agentic engineering platform with orchestrator, architect, code, ask, and debug agents | Yes -- [Kilo Code](../../agent-harnesses/kilo-code.md) |
| Claude Opus | Recommended for architecture/planning tasks | Yes -- referenced across catalogue |
| Qwen (Kimmy) | Mentioned as cost-effective coding model | Yes -- [Qwen-Agent](../../agent-harnesses/qwen-agent.md) |
| MiniMax | Mentioned as cost-effective coding model | No |
| GLM | Mentioned as cost-effective coding model | No |
| PostHog | Referenced for their anti-collaboration blog post | No |
| DBT | Used by Kilo's data team; data model built in 1-2 weeks with AI vs 6 months traditional | No |

---

## Action Items

- [x] Evaluate Kilo platform (kilo.dev) -- DONE: [Kilo Code](../../agent-harnesses/kilo-code.md)
- [x] Find and ingest PostHog's anti-collaboration blog post -- DONE: [Collaboration sucks](../../articles/2025-11/collaboration-sucks.md)
- [ ] Consider the Trust Ladder as a framework for evaluating our own orchestrator UX -- where do trust breakdowns happen?
- [ ] Validate model routing pattern: use expensive models (Opus) for architecture/planning, cheap models for execution -- aligns with our 70/30 split philosophy
- [ ] The "200 hours agent coding supported by 40 hours human thinking" ratio is a useful mental model for capacity planning
