# Unlocking Claude Code's Hidden Swarms Feature — Agent Team Delegation Mode

> **@NicerInPerson — Jan 24, 2026**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/NicerInPerson/status/2014989679796347375) |
| Author | @NicerInPerson (Mike Kelly) — "I design, build, and market technology products. Originally a software engineer. Enjoy sparring." |
| Date | 2026-01-24 |
| Topics | Claude Code, agent swarms, multi-agent orchestration, feature flags, parallel subagents |
| Type | Thread (5 posts by author + replies) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Claude Code has a hidden "Swarms" feature behind feature flags** — Mike Kelly reverse-engineered the minified JS CLI to find and unlock a delegation mode where Claude acts as a team lead, not a coder. It plans, delegates to specialist subagents who share a task board with dependencies, work in parallel, coordinate via messaging, and report back.
2. **Event-driven async subagents are the differentiator** — Kelly explicitly calls out that Claude Code's subagents are event-driven, unlike Codex which (at the time) lacked async subagent support. This is the same architectural advantage our L-Thread orchestrator relies on.
3. **The unlock repo (claude-sneakpeek) hit HN front page** — Kelly packaged the feature-flag unlock into a GitHub repo (mikekelly/claude-sneakpeek) so others could try it. It briefly got pulled from HN by mods but was restored. 270 likes on the follow-up repo post alone.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates our orchestrator architecture: lead agent delegates to parallel workers, shared task board, event-driven coordination. The hidden feature is essentially what we built with L-Thread. Confirms Anthropic is building this natively into Claude Code. |

---

## Full Content

**Post 1 (main):**
I managed to unlock a crazy new hidden feature in Claude Code called Swarms. You're not talking to an AI coder anymore. You're talking to a team lead. The lead doesn't write code - it plans, delegates, and synthesizes. When you approve a plan, it enters a new "delegation mode" and spawns a team of specialists who: - Share a task board with dependencies - Work in parallel as teammates - Message each other to coordinate work. Workers do the heavy lifting, coordinate amongst themselves, then report back.

[Embedded video: 3:25 demo]

*561.5K views, 143 replies, 363 reposts, 2.9K likes, 4.7K bookmarks*

**Post 2 (follow-up):**
I packaged up an unlocked build of claude code so everyone can try it out
[Link: github.com/mikekelly/claude-sneakpeek]

*49K views, 270 likes, 455 bookmarks*

**Post 3:**
Update: it made the front page of HN but got pulled down by mods

*39K views, 55 likes*

**Post 4:**
Update: it's back up on the main page

*36K views, 56 likes*

**Post 5 (reply to @rizzytoday who called it a token burner):**
Takes up less tokens to break up work across subagents

*17K views, 32 likes*

---

## Notable Replies

> **@LLMJunky (am.will)**: "This is very similar to codex new orchestration mode actually. Very interesting to see them both com[e to the same conclusion]"
> *Validates convergent evolution between Claude Code and Codex on orchestration patterns. 39 likes, 22K views.*

> **@NicerInPerson (reply to @DBurkland asking about opencode)**: "It really requires async subagents. There's a couple of issues on GitHub discussing it and a plugin [for it]"
> *Confirms async subagents as the key architectural requirement — aligns with our event-driven design. 11 likes.*

> **@NicerInPerson (reply to @mysticaltech asking how he activated it)**: "nah the cli is just minified js - I just had to look through it and find the function that does the [feature flag check]"
> *Reveals the technical approach: reverse-engineering the minified Claude Code CLI to bypass feature flags. 50 likes, 19K views.*

> **@ghumare64 (Rohit Ghumare)**: "You can try dedicated skills for this in [github.com/rohitg00/skillkit]"
> *Links to SkillKit — portable agent skills framework. 13 likes, 15 bookmarks.*

> **@rizzytoday (Riz)**: "great tool to burn all your tokens"
> *Common concern about multi-agent token costs. Kelly's response: breaking work across subagents actually uses fewer tokens. 29 likes.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/mikekelly/claude-sneakpeek | The actual feature-flag unlock repo for Claude Code swarms | `/tool-catalogue` |
| https://github.com/rohitg00/skillkit | Portable agent skills framework mentioned in replies (15K+ skill marketplace) | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary subject — hidden swarms feature unlocked | Yes — referenced throughout catalogue |
| claude-sneakpeek | Mike Kelly's repo to unlock feature-flagged swarms mode | No — consider `/tool-catalogue` |
| Codex (orchestration mode) | Compared by @LLMJunky as converging on same pattern | Yes — [Swarms (Codex)](../agent-harnesses/swarms-codex.md), [Codex Skills](../agent-harnesses/codex-skills.md) |
| SkillKit | Portable agent skills framework linked in replies | No — consider `/tool-catalogue` |
| OpenCode | Asked about by @DBurkland re: similar features | Yes — [OpenCode](../agent-harnesses/opencode.md) |
