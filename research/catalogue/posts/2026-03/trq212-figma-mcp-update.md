# Figma MCP: Claude Code Can Now Design Directly in Figma with Full Design System Context

> **@trq212 — 2026-03-25**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/trq212/status/2036442891346755787) |
| Author | @trq212 / Thariq — Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-03-25 |
| Topics | Figma MCP, Claude Code, design-to-code, AI design, MCP, use_figma, design systems |
| Type | Quote-thread (quotes Figma's official announcement) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Claude Code + Figma MCP = AI designs in Figma** — Figma's new `use_figma` MCP tool lets Claude Code interact directly with the Figma canvas. This means an agent can read design system tokens, create/modify frames, apply styles, and produce design artifacts without a human designer operating the tool manually.

2. **Full design system context** — The critical detail is "full design system context." The MCP tool doesn't just push pixels; it understands the project's design tokens, component library, and style guide. This means generated designs are consistent with existing design language, not random AI art.

3. **Thariq amplifying = Anthropic endorsement** — Thariq (Claude Code engineer) quote-tweeting Figma's announcement signals this integration is expected to be a major Claude Code use case. The 6.2K likes and 1.1M views confirm massive market interest in AI-driven design workflows.

4. **Design-to-code loop closes** — Combined with Claude Code's code generation capabilities, this creates a full loop: Claude designs in Figma (via MCP) -> exports specs -> generates code matching the design. The human designer becomes a reviewer, not the producer.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Highly relevant for our client work (OmniPort-HH) where pixel-matching customer PDFs is mandatory. If Claude Code can work directly in Figma with design system context, we could feed it the customer's Figma files and have it generate pixel-perfect implementations. This also validates our MCP-centric architecture — Figma joining the MCP ecosystem proves the protocol is becoming the standard integration layer for AI tools. The design-to-code loop is exactly what we need for reducing the "translate design to code" bottleneck in client sprints. |

---

## Full Content

> Figma MCP lets Claude Code design directly in Figma with full design system context.

*[Post is a quote-tweet of @figma's official announcement of the use_figma MCP tool, adding commentary about the integration with Claude Code. Includes demo media showing Claude Code interacting with Figma canvas.]*

**Engagement:** 254 replies, 432 reposts, 6,278 likes, 1.1M views

---

## Notable Replies

> *[Replies not accessible at ingest time. 254 replies with 1.1M views — extremely high engagement. Likely contains workflow demonstrations, limitations discovered by early adopters, and comparisons to existing Figma-to-code tools like Anima, Locofy, or Builder.io.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/figma/status/2036434766661296602 | Figma's official announcement — being ingested as separate entry (figma-use-figma-mcp-open-beta.md) | `/ingest-post` (this batch) |
| https://www.figma.com/mcp | Official Figma MCP documentation and setup guide | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| use_figma MCP | Core subject — Figma's official MCP tool for AI agent design interaction | No — **INGEST as tool** |
| Claude Code | The agent harness using the Figma MCP tool | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Figma | Design platform providing MCP integration | No — design platform |
| MCP (Model Context Protocol) | Integration protocol enabling Claude Code + Figma connection | Yes — referenced across catalogue |

---

## Cross-References (Other @trq212 Posts)

| Post | Date | Connection |
|------|------|-----------|
| [Claude Code Channels](./trq212-claude-code-channels-telegram-discord.md) | 2026-03-19 | Same author — channels + Figma MCP together enable mobile-driven design workflows |
| [New /init Testing](./trq212-new-init-testing.md) | 2026-03-22 | Same author — /init could auto-configure Figma MCP for design-heavy projects |
| [Lessons from Building Claude Code](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) | 2026-02-27 | Same author — progressive disclosure philosophy applies to design tool integration |
