# T3 Code Now Supports Claude (Claude Code CLI Integration)

> **@theo — 2026-03-20**

| Field | Value |
|-------|-------|
| Source | [x.com/theo/status/2034831968463200359](https://x.com/theo/status/2034831968463200359) |
| Author | [@theo / Theo Browne — Creator of T3 Stack, founder of Ping (YC), t3.gg] |
| Date | 2026-03-20 |
| Topics | T3 Code, Claude Code CLI, developer GUI, agent harness, open-source, Codex |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **T3 Code adds Claude Code CLI as a backend alongside Codex** — T3 Code (6.9K stars, MIT, TypeScript) is a minimal web GUI that wraps coding agent CLIs. With v0.0.13 it now supports Claude Code CLI in addition to OpenAI Codex, making it a multi-harness frontend. If you have Claude Code CLI installed and signed in, T3 Code detects and uses it directly — no API keys needed, it piggybacks on your existing Claude Max subscription.
2. **"A harness for your harnesses" pattern emerging** — T3 Code represents a growing category of GUI wrappers that sit above agent CLIs (Claude Code, Codex, Gemini CLI) and provide unified visual interfaces. This is the same space as cmux, Cowork clones, and manaflow. The pattern: CLI agents do the work, GUI layers provide visibility and interaction.
3. **Theo's reach amplifies Claude Code ecosystem** — With 393K views and 2.4K likes, this announcement exposes Claude Code CLI to Theo's massive developer audience (primarily TypeScript/Next.js developers). The "hopefully the lawyers won't make us remove this" quip hints at tensions around CLI integration licensing — worth monitoring.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | T3 Code validates the "GUI wrapper over agent CLI" pattern we see with cmux and Cowork clones. Not directly useful for our tmux-based orchestration (we already have terminal-native control), but confirms the market is converging on multi-harness frontends. The open-source TypeScript codebase (1,070 commits, 932 forks) could be a reference for building agent dashboards. Theo's distribution means this will accelerate Claude Code adoption among web developers. Monitor for: Gemini/Cursor integration (announced as coming), and whether the multi-agent coordination features evolve beyond single-session. |

---

## Full Content

> T3 Code now supports Claude. If you have the Claude Code CLI installed and signed in, you can use it with T3 Code. Hopefully the lawyers won't make us remove this :upside_down_face:

*[Post includes a screenshot showing Claude integration in T3 Code]*

**Engagement:** 2,409 likes | 46 retweets | 212 replies | 259 bookmarks | 393,931 views

---

## Notable Replies

*[Replies could not be fetched due to X/Twitter scraping restrictions. The post has 212 replies — high reply count suggests lively discussion around licensing concerns and feature requests. Consider checking manually for counterarguments around CLI wrapping legality and comparison to other GUI wrappers.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/pingdotgg/t3code | 6.9K stars, MIT, TypeScript. Multi-agent GUI wrapper supporting Codex + Claude Code CLI. 1,070 commits, very active development (25 releases). | `/tool-catalogue` |
| https://t3.codes | Official T3 Code site with downloads and documentation | Manual review |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| T3 Code | Core subject — multi-agent GUI wrapper (6.9K stars, MIT) | No — **consider `/tool-catalogue https://github.com/pingdotgg/t3code`** |
| Claude Code CLI | Now supported as a backend in T3 Code | N/A (Anthropic core product) |
| Codex CLI | Original/primary backend for T3 Code | N/A |
| cmux | Same category — GUI wrapper for agent CLIs | [Yes — developer-gui/cmux.md](../developer-gui/cmux.md) |
| manaflow | By ctatedev — similar OSS Claude Code web alternative | [Yes — developer-gui/manaflow.md](../developer-gui/manaflow.md) |
