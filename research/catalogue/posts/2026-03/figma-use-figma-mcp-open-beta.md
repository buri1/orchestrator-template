# Figma use_figma MCP Tool: AI Agents Can Now Design Directly on the Canvas (Open Beta)

> **@figma — 2026-03-25**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/figma/status/2036434766661296602) |
| Author | @figma / Figma (official account) — Design platform |
| Date | 2026-03-25 |
| Topics | Figma, MCP, use_figma, AI design, agent-driven design, open beta, design tools |
| Type | Single post (official product announcement) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Official Figma MCP tool in open beta** — Figma has released `use_figma`, an official MCP tool that lets AI agents interact directly with the Figma canvas. This is not a community hack or third-party integration — it's Figma themselves building MCP support, which is a massive validation of the MCP protocol as the standard for AI tool integration.

2. **Design directly on the canvas** — Agents can create frames, apply styles, use components from design systems, and manipulate layers. This goes beyond "read a Figma file" to "write to a Figma file" — full bidirectional interaction with the design tool.

3. **10K+ likes, 17.7M views = design industry earthquake** — The engagement numbers show this is one of the most significant Figma announcements in recent memory. The design community is paying attention to AI agents, and Figma is making it official by building the bridge themselves.

4. **MCP as the universal integration layer** — Figma joining GitHub, Notion, and others in adopting MCP confirms the protocol is becoming the de facto standard for AI agent integrations. This strengthens our bet on MCP-centric architecture.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Highly relevant on two axes. (1) **Client work**: For OmniPort-HH and future client projects, use_figma MCP could let our agents read the customer's Figma designs and generate pixel-perfect implementations automatically — solving the "design-to-code" translation problem that currently requires manual work. (2) **Architecture validation**: Figma adopting MCP validates our MCP-first integration strategy. The pattern "design tool provides MCP server, agent harness consumes it" is exactly the architecture we're building toward. This is a HIGH-priority tool to evaluate for our client delivery pipeline. |

---

## Full Content

> AI agents can now design directly on the Figma canvas with the new use_figma MCP tool.

*[Official announcement from Figma introducing the use_figma MCP tool in open beta. The tool enables AI agents (Claude Code, Cursor, and other MCP-compatible clients) to interact with Figma's design canvas programmatically through the MCP protocol. Includes demo showing agent-driven design workflows.]*

**Engagement:** 509 replies, 1,745 reposts, 10,360 likes, 17.7M views

---

## Notable Replies

> *[Replies not accessible at ingest time. 509 replies with 17.7M views — extremely high engagement. Likely contains setup guides, early user experiences, workflow demonstrations, and limitations. Thariq (@trq212) quote-tweeted this with Claude Code-specific context (see trq212-figma-mcp-update.md). A reply curation pass is strongly recommended.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.figma.com/mcp | Official Figma MCP documentation — setup, capabilities, API reference | `/ingest-article` |
| https://github.com/figma/figma-mcp | Likely open-source MCP server implementation | `/tool-catalogue` |
| https://x.com/trq212/status/2036442891346755787 | Thariq's Claude Code-specific take on the Figma MCP tool | Ingested in this batch (trq212-figma-mcp-update.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| use_figma MCP | Core subject — Figma's official MCP tool for AI agent design | No — **HIGH PRIORITY TOOL INGEST** |
| Figma | Design platform providing the MCP server | No — design platform |
| MCP (Model Context Protocol) | Integration protocol enabling agent-Figma connection | Yes — referenced across catalogue |
| Claude Code | One of the MCP clients that can use the tool | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| Cursor | Another MCP client that can use the tool | Yes — [Cursor](../../developer-gui/cursor.md) |
