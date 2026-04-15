# What are your favorite AI agent orchestration tools or strategies?

> **@LLMJunky — Mar 21, 2026**

| Field | Value |
|-------|-------|
| Source | https://x.com/LLMJunky/status/2035435463998108120 |
| Author | [@LLMJunky (am.will) — Founder, StarSwap, "Director of n number of agents"] |
| Date | 2026-03-21 |
| Topics | agent orchestration, tooling survey, community pulse, Gas Town, agent flywheel, Ralph loops, skills |
| Type | Single post (community Q&A / crowdsourced survey) |

---

## Burak's Notes

> *A real-time pulse check on what practitioners are actually using in the wild. The replies surface droid/factory CLI and custom Linear-integrated orchestrators as grassroots choices. CrabDude's "600x team swarms" comment is wild — and validates that big team sizes are being explored even if 2-3 agents is the sweet spot for coordination. @LLMJunky is one of ours (already in catalogue twice); he's clearly living the multi-agent life.*

---

## Key Takeaways

1. **Tooling is highly fragmented** — practitioners are running custom orchestrators, linear-integrated pipelines, and proprietary CLI tools (droid/factory), not a single dominant framework. The field has no "standard" answer yet.
2. **Gas Town, agent flywheel, Ralph loops, Symphony, and skills** are the named patterns the author treats as common vocabulary — a useful shorthand for the community's shared reference stack.
3. **Subagent team size experimentation is active** — @CrabDude mentions "600x team swarms" chunked into groups of ~30, which is well above conventional recommendations, suggesting real-world exploration of coordination at scale.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Direct community survey of orchestration tool usage — exactly our domain; surfaces practitioner preferences and named patterns in active use |

---

## Full Content

**@LLMJunky**:
> "What are your favorite AI agent orchestration tools or strategies that you use? Can be anything. Gas town, agent flywheel, ralph loops, symphony, skills. I want to know, what are you using, and why?"

*Posted: 8:16 PM · Mar 21, 2026 — 6,123 views, 35 replies, 1 repost, 34 likes, 47 bookmarks*

---

## Notable Replies

> **@orange_boy (Vlad P)**: "For now only Mission Control in droid cli by factory. Nothing else works for me. Have my own build [...]"
> *Droid CLI's "Mission Control" is the grassroots pick from this practitioner — worth checking if droid/factory CLI is in catalogue.*

> **@CrabDude (Adam Crabtree)**: "Claude Code with 600x team swarms to chunk up a large piece of work into group sizes of ~30 subagents [...]"
> *Extreme scale experiment — 600-agent swarms subdivided into ~30-agent chunks. Pushes coordination theory hard.*

> **@Elenion88 (Austin Young)**: "linear issues <--> custom orchestrator for plan/code/test/review/merge running on a linux old laptop historically multi-instance claude [...]"
> *Linear-as-task-board + custom orchestrator doing full plan/code/test/review/merge cycle — this is exactly our pattern, validated by an independent builder.*

> **@Kyler_Lorin**: "I have been tinkering with my orchestration more than actual coding lately lol. Codex with cli calls [...]"
> *Honest practitioner confession — orchestration setup cost is real; "tinkering more than coding" is a known trap.*

> **@Handrovermeulen (Handro)**: "I've found that using Claude.md files and memory.md files not only for my main project repo but for individual agents [...]"
> *Per-agent CLAUDE.md files as agent identity layer — @LLMJunky responded with interest, asking how it's managed.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/orange_boy/status/2035449158836908334 | Vlad P's full answer on droid CLI / Mission Control — if droid CLI is a real tool this may be worth cataloguing | `/ingest-post` |
| https://x.com/CrabDude/status/2035455431980794238 | Full detail on 600x team swarms with ~30 subagent chunks — extreme scale orchestration practice | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Gas Town | Named as example orchestration tool in survey question | Yes — [Gas Town](../../orchestration-platforms/gas-town.md) |
| Agent Flywheel | Named as example strategy in survey question | Yes — [Agent Flywheel](../../agent-harnesses/agent-flywheel.md) |
| Ralph Loops | Named as example strategy in survey question | Referenced in practitioner profiles — [Geoffrey Huntley](../../practitioners/geoffrey-huntley.md) |
| Symphony | Named as example strategy in survey question | Not yet catalogued — consider `/tool-catalogue` |
| Skills | Named as example strategy (Claude Code skills) | Referenced throughout catalogue |
| Droid CLI / Factory | @orange_boy's answer — "Mission Control in droid cli by factory" | Not yet catalogued — consider `/tool-catalogue` |
| Linear | @Elenion88 uses Linear issues as task board for custom orchestrator | Not yet catalogued as orchestration integration |
| Claude Code (swarms) | @CrabDude's "600x team swarms" via Claude Code | Referenced throughout catalogue |
