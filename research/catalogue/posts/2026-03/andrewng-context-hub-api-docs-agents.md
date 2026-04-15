# Context Hub — Open Tool Providing API Docs to Coding Agents

> **@AndrewYNg — 2026-03-09**

| Field | Value |
|-------|-------|
| Source | [x.com/AndrewYNg/status/2031051809499054099](https://x.com/AndrewYNg/status/2031051809499054099) |
| Author | [@AndrewYNg / Andrew Ng — AI pioneer, DeepLearning.AI founder, Stanford professor] |
| Date | 2026-03-09 |
| Topics | Context Hub, API documentation, coding agents, SKILL.md, agent skills, npm, open-source |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Context Hub provides current API docs to coding agents** — An open-source tool (npm install -g @aisuite/chub) that feeds coding agents up-to-date API documentation. Solves the knowledge cutoff problem: agents often generate code against outdated APIs. Context Hub ensures they have current signatures, parameters, and usage patterns.
2. **SKILL.md and Agent Skills pattern** — The tool introduces a `SKILL.md` convention where API documentation is structured for agent consumption rather than human reading. This is the same pattern as CLAUDE.md but for external API knowledge — standardized context injection.
3. **Andrew Ng's endorsement = massive distribution** — 5,379 likes, 810 reposts, 390K views. When Andrew Ng promotes a tool, it becomes a de facto standard overnight. The npm package approach (global install, CLI-first) aligns with the "tools as CLIs" pattern we see across the agent ecosystem.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly relevant to Principle 3 (context is zero-sum). Our agents constantly fight outdated API knowledge. Context Hub could be integrated into our worker agent startup scripts to provide fresh API context. The SKILL.md pattern validates our CLAUDE.md approach and suggests we should structure more of our agent context as machine-readable skill files. The `@aisuite/chub` npm package is immediately installable. High actionability. |

---

## Full Content

> Open tool providing coding agents with current API documentation. npm install -g @aisuite/chub. SKILL.md and Agent Skills.

*[Post links to https://github.com/andrewng/context-hub]*

**Engagement:** 5,379 likes | 810 reposts | 297 replies | 390K views

---

## Notable Replies

*[Replies not accessible via automated fetch. With 297 replies, this is a highly discussed post. Likely includes integration examples, comparison to alternatives (Cursor context, Codebase indexing), and requests for specific API coverage.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/andrewng/context-hub | Core repo — API documentation provider for coding agents, SKILL.md convention | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Context Hub (@aisuite/chub) | Core subject — API docs for coding agents | No — **strongly consider `/tool-catalogue https://github.com/andrewng/context-hub`** |
| SKILL.md | Convention for structuring agent-consumable API docs | No (pattern, not a tool) |
