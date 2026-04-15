# /init Should Be More Useful — What Should It Do? (Community Feedback Thread)

> **@trq212 — 2026-03-05**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/trq212/status/2029455580444934627) |
| Author | @trq212 — Thariq, Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-03-05 |
| Topics | Claude Code /init, CLAUDE.md setup, onboarding, UX design, community requirements gathering |
| Type | Single post (requirements-gathering thread) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Thariq explicitly solicited community requirements for /init** — This is the direct source post that drove the improved `/init` shipped on 2026-03-22. The follow-up announcement (`CLAUDE_CODE_NEW_INIT=1`) explicitly quote-tweets this post as the requirements origin. Understanding what the community asked for reveals what Anthropic is building toward.

2. **Progressive disclosure for CLAUDE.md was a top community request** — Reply from @koylanai: "Let it make the Claude md file more like a table of contents with progressive disclosure." This directly echoes the philosophy in Thariq's own "Lessons from Building Claude Code" post — progressive disclosure > system prompt bloat.

3. **Skills and hooks setup should be first-class onboarding defaults** — The most-upvoted direction was that `/init` should help configure skills and hooks, not just scaffold a CLAUDE.md template. The resulting implementation confirmed this: the interview-based `/init` covers skills + hooks setup as core workflow.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directionally useful as the requirements-gathering origin post for the new `/init` (which is 8/10). The replies document what experienced Claude Code users want from repo setup — progressive disclosure, skills, hooks, MCP config. Thariq's team reads this thread as a spec; understanding it helps predict upcoming Claude Code UX direction. Cross-reference [trq212-new-init-testing](./trq212-new-init-testing.md) for the shipped implementation. |

---

## Full Content

**Post text:**

> "I want to make /init more useful- what do you think it should do to help setup Claude Code in a repo?"

**Posted:** March 5, 2026

**Context:** This tweet became the requirements gathering thread for the new interview-based `/init` announced on 2026-03-22. Thariq's follow-up quote-tweeted this post when announcing `CLAUDE_CODE_NEW_INIT=1`.

---

## Notable Replies

> **@koylanai**: "Let it make the Claude md file more like a table of contents with progressive disclosure."
> *High signal — directly echoes Thariq's own "progressive disclosure > system prompt bloat" philosophy from his Lessons post. Likely influenced the interview-based approach.*

> **@Zouhair__m** (on follow-up): "Will we be able to import skills/agents from other projects during the init?"
> *Thariq replied "not currently how it works!" — cross-project skill import is not in v1 but signals community demand.*

> **@renefaurskov** (on follow-up): "Is it only for initiating a new project, or also when cloning an existing?"
> *Thariq replied "both!" — confirms /init works on existing repos, not just greenfield.*

> **@savaerx** (on follow-up): "tested /init last week, setup always felt like guessing without a config. interview approach makes way more sense."
> *Thariq replied: "scans the repo, there are a few rounds of questions" — confirms repo-scan + interview flow.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/trq212/status/2035799806640115806 | The follow-up post announcing CLAUDE_CODE_NEW_INIT=1 — already catalogued as [trq212-new-init-testing](./trq212-new-init-testing.md) | Already ingested |
| https://x.com/trq212/status/2035801140940410886 | Thariq's own elaboration reply: "/init helps setup your Claude Code config in a new or existing repo (Claude.md...)" | `/ingest-post` if detail is needed |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code /init | The command being discussed and improved | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Claude Code Skills | Community request: /init should help configure skills | Referenced throughout catalogue |
| Claude Code Hooks | Community request: /init should help configure hooks | Referenced throughout catalogue |

---

## Cross-References (Other @trq212 Posts)

| Post | Date | Connection |
|------|------|-----------|
| [New /init Version Testing](./trq212-new-init-testing.md) | 2026-03-22 | Direct outcome — Thariq's follow-up quoting this post when shipping CLAUDE_CODE_NEW_INIT=1 |
| [Lessons from Building Claude Code](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) | 2026-02-27 | Progressive disclosure philosophy that shaped what /init should become |
| [Prompt Caching Is Everything](../2026-02/trq212-prompt-caching-is-everything.md) | 2026-02-19 | Cache-safe CLAUDE.md architecture that /init could optimize from day one |
| [Claude Code Channels](./trq212-claude-code-channels-telegram-discord.md) | 2026-03-19 | Channels: another feature /init could now auto-configure |
