# Best Practice for Unbounded Agent Skills — How to Give Agents Access to Many Skills

> **@BrendanFalk (Brendan Falk) — 2026-03-12**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/BrendanFalk/status/2030388188771185005) |
| Author | @BrendanFalk — Brendan Falk, founder of Stagehand / Browserbase |
| Date | 2026-03-12 |
| Topics | agent-skills, skill-routing, unbounded-tools, context-management, AI-engineering |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Skill routing is a core unsolved problem** — When an agent has access to potentially hundreds of skills/tools, how do you route to the right one without overwhelming the context window? This is the "tool explosion" problem that every serious agent builder faces.

2. **Tension between context budget and capability breadth** — Directly maps to our Principle #3 (context is zero-sum). Every skill definition competes for attention in the context window. Unbounded skills means either (a) smart routing/retrieval, (b) hierarchical skill organization, or (c) just-in-time skill loading.

3. **Community discussion from Browserbase founder** — Brendan Falk (Stagehand/Browserbase) asking this question suggests even well-resourced agent companies are grappling with skill scaling. The replies likely contain diverse approaches from practitioners.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | This is a problem we face directly. Our orchestrator has 60+ skills/commands and growing. Our current approach uses CLAUDE.md listings + slash commands, which works but doesn't scale gracefully. The question of how to give agents access to many skills without context bloat is exactly our context architecture challenge. Maps to Principles #1 (orchestration is the asset), #3 (context is zero-sum), and #4 (fewer agents with better context). |

---

## Full Content

Question for AI engineering community: what is the current best practice for giving a single agent access to a potentially unbounded number of skills?

*(Open question from the founder of Stagehand/Browserbase, soliciting community input on skill routing and management for agents with large skill libraries.)*

---

## Notable Replies

[Replies not accessible via fetch at time of ingestion — this post likely generated high-signal discussion from AI engineers. Worth revisiting manually for specific pattern recommendations.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| [Check replies for specific skill routing architectures] | Practitioner approaches to the unbounded skills problem | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Stagehand | Brendan Falk's browser automation agent framework (author context) | Yes — research/catalogue/agent-browsers/ |
| Browserbase | Cloud browser infrastructure for agents (author context) | Yes — research/catalogue/agent-browsers/ |
