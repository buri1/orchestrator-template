# New /init Version Testing with Env Var Flag (CLAUDE_CODE_NEW_INIT=1)

> **@trq212 — 2026-03-22**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/trq212/status/2035799806640115806) |
| Author | @trq212 — Thariq, Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-03-22 |
| Topics | Claude Code /init, CLAUDE.md setup, skills, hooks, onboarding, env var feature flag, UX improvements |
| Type | Single post (product preview) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Interactive interview-based /init** — The new `/init` doesn't just scaffold a CLAUDE.md template; it *interviews* the user to understand the project, then sets up skills, hooks, and other configuration based on the answers. This is a shift from static generation to guided onboarding.

2. **Env var opt-in for early testing** — Enable via `CLAUDE_CODE_NEW_INIT=1 claude` — a feature flag pattern that Anthropic is using to collect feedback before general rollout. This is Thariq's direct invitation for the community to test and report back.

3. **Skills + hooks setup is now part of onboarding** — The fact that `/init` is being upgraded to configure skills and hooks signals these are graduating from power-user features to first-class defaults that every project should consider from day one.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly relevant to our CLAUDE.md-driven orchestrator workflow. If the new `/init` can auto-detect and configure skills + hooks for a repo, it eliminates a significant portion of the manual setup we do when bootstrapping new worker environments. The interview pattern also echoes the "Inversion" skill design pattern (ADK: interview before acting), validating our own onboarding philosophy. High signal because Thariq is the Claude Code engineer who shipped Tasks, Channels, and the prompt caching architecture we rely on — his bets track very well. |

---

## Full Content

**Engagement:** 207 replies, 307 reposts, 538.8K views (as of ingest date)

**Post text:**

> "we're testing a new version of /init based on your feedback- it should interview you and help setup skills, hooks, etc.
> you can enable it with this env var flag: CLAUDE_CODE_NEW_INIT=1 claude
> would love your feedback!"

This post quote-tweets Thariq's earlier question from 2026-03-05:

> "I want to make /init more useful- what do you think it should do to help setup Claude Code in a repo?"

**Posted:** 8:24 PM · March 22, 2026

---

## Notable Replies

> *[Reply data not accessible at ingest time — 207 replies; high-signal replies to be curated on a future pass. The original feedback-gathering tweet from 2026-03-05 likely contains the requirements that shaped this implementation.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/trq212/status/2029459856505843736 | Thariq's 2026-03-05 question asking community what /init should do — this is the direct requirements source for the new version | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code /init | The command being upgraded with interview-based onboarding | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Claude Code Skills | Skills setup is now part of /init onboarding flow | Yes — cross-ref [trq212-lessons-building-claude-code](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) |
| Claude Code Hooks | Hooks setup is now part of /init onboarding flow | Yes — referenced throughout our CLAUDE.md architecture |

---

## Cross-References (Other @trq212 Posts)

| Post | Date | Connection |
|------|------|-----------|
| [Tasks Replacing TodoWrite](../2026-01/trq212-tasks-replacing-todowrite-claude-code.md) | 2026-01-22 | Same author — evolution of Claude Code UX toward better inter-agent coordination |
| [Prompt Caching Is Everything](../2026-02/trq212-prompt-caching-is-everything.md) | 2026-02-19 | Same author — cache architecture that a well-structured /init could optimize from the start |
| [Lessons from Building Claude Code](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) | 2026-02-27 | Same author — progressive disclosure philosophy directly informs the new interview-based /init |
| [Claude Code Channels](./trq212-claude-code-channels-telegram-discord.md) | 2026-03-19 | Same author — channels as a feature that /init could now auto-configure |
