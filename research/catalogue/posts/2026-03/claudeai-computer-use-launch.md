# Claude Can Now Use the Computer: Apps, Browser, Spreadsheets (Research Preview)

> **@claudeai — 2026-03-25**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/claudeai/status/2036195789601374705) |
| Author | @claudeai / Claude (Anthropic official account) |
| Date | 2026-03-25 |
| Topics | Computer use, Claude Cowork, Claude Code, desktop automation, browser automation, macOS, research preview |
| Type | Single post (major product announcement) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Computer Use is now real** — Claude can open apps, navigate browsers, fill spreadsheets, and interact with the full desktop environment. This graduates from the earlier API-only computer use beta to an integrated experience in Claude Cowork and Claude Code on macOS. This is a paradigm shift from "AI writes code" to "AI operates the computer."

2. **Research preview in Cowork and Claude Code (macOS)** — Two entry points: Claude Cowork (new desktop app for general computer tasks) and Claude Code (terminal-based, for developer workflows). Both macOS-first. The research preview label means expect rough edges but the capability is functional.

3. **MEGA engagement signals market-defining moment** — 140K likes and 76.5M views is one of the highest-engagement AI announcements ever on X. This is not incremental — it's the kind of announcement that shifts how people think about what AI agents can do. The ratio of views-to-likes (547:1) suggests massive reach beyond the core AI community.

4. **Closes the "last mile" gap** — Many agent workflows break at the point where the agent needs to interact with a GUI app (Figma, Excel, web apps with no API). Computer use removes this barrier entirely. Combined with MCP for structured tool access, Claude now has both the "API path" and the "GUI path" for interacting with any software.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is a foundational capability expansion for our entire orchestration architecture. Computer use means our agents can now interact with ANY software, not just CLI tools and APIs. For OmniPort-HH: agents can visually verify UI changes in a real browser, interact with Supabase dashboard, check Vercel deployments visually. For the orchestrator: computer use could enable E2E testing without dedicated browser automation frameworks — Claude just uses the browser like a human. The "Claude Cowork" product is also a potential alternative to our tmux-based orchestration for certain workflows. Maps directly to Principle 5 (reduce what humans must review) — if Claude can operate the computer, it can do the review steps too. |

---

## Full Content

> Claude can now use the computer. Opens apps, navigates browser, fills spreadsheets. Research preview in Claude Cowork and Claude Code (macOS).

*[Major product announcement from Anthropic's official Claude account. Announces computer use capability as a research preview available in two products: Claude Cowork (new desktop app) and Claude Code (existing CLI tool), both macOS-only at launch. Includes demo video showing Claude interacting with desktop applications.]*

**Engagement:** 4,963 replies, 25,271 reposts, 139,959 likes, 76.5M views

---

## Notable Replies

> *[Replies not accessible at ingest time. With 4,963 replies and 76.5M views, this is one of the most-discussed AI announcements on X. The replies almost certainly contain early user reports, limitations discovered, comparison to OpenAI's computer use, and creative use case demonstrations. A dedicated reply curation pass is strongly recommended.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.anthropic.com/news/claude-computer-use | Official Anthropic blog post — likely contains architecture details, safety measures, and API reference | `/ingest-article` |
| https://docs.anthropic.com/en/docs/computer-use | Official computer use documentation | `/ingest-article` |
| https://claude.ai/cowork | Claude Cowork product page — new desktop app entry point | Manual review |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Computer Use | Core subject — desktop/browser automation capability | No — **HIGH PRIORITY INGEST** |
| Claude Cowork | New desktop app for general computer use tasks | No — **INGEST** |
| Claude Code | Developer-focused entry point for computer use on macOS | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Chrome DevTools MCP | Our existing browser automation — computer use may complement or replace | Yes — referenced in orchestrator config |
