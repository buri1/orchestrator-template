# Playbooks.com (Skills & MCP Directory)

> **A free, curated directory of 34,600+ agent skills and 14,800+ MCP servers — the npm registry for AI agent capabilities. Browse and copy whatever you need, no account required.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | No public repo (closed-source SaaS) |
| GitHub Stars | N/A — proprietary web platform |
| Publisher | Ian Nuttall (solo — serial internet business builder, multiple 6 & 7 figure exits) |
| License | Proprietary (free to use, no account required) |
| Tech Stack | Next.js, React, TypeScript, Node.js |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Recommended by Kevin from Airtable research list. This is the biggest aggregator of Agent Skills and MCP servers I've seen — 34K+ skills, 14K+ MCP servers. Think of it as the "npm registry" or "Product Hunt" for the Agent Skills ecosystem. Not a tool to build with, but a discovery layer to find skills/MCP servers from.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Useful discovery layer for finding skills and MCP servers, but we build our own orchestration skills in-repo. Doesn't solve a problem on our roadmap — it's a browsing tool. |
| **Novelty** | 3/10 | Directory/marketplace pattern is well-understood. The scale (34K+ skills) is impressive but the concept of "search and copy-paste" isn't novel. |
| **Actionable** | 5/10 | Can browse it today to discover high-quality skills from Anthropic, Vercel, Google, OpenAI that we could adapt. But there's no API, no programmatic integration — it's manual browsing. |

---

## Overview

Playbooks.com is the largest public directory for Agent Skills (the SKILL.md standard catalogued in our [OpenSkills](./openskills.md) entry) and MCP servers. Built by Ian Nuttall, it aggregates **34,654 skills** and **14,890 MCP servers** from across the ecosystem — Anthropic, Google Gemini, OpenAI, Vercel, Microsoft, OpenClaw, and thousands of community contributors.

The platform operates as a **free, no-account-required discovery layer**. Users browse skills by programming language (45+ supported), sort by trending/popularity, filter to official/verified sources only, and copy-paste installation instructions for their agent of choice. Each skill card shows view counts, verification badges, and creator attribution. The platform supports installation paths for Claude Code (`.claude/skills/`), Codex CLI (`.codex/skills/`), Cursor, Windsurf, Zed, Amp, Roo Code, VS Code, Gemini CLI, Factory, and any MCP client.

The key value proposition is solving the **agent capability discovery problem**: as the Agent Skills ecosystem explodes (34K+ skills from thousands of publishers), finding high-quality, relevant skills becomes the bottleneck. Playbooks positions itself as the centralized search engine for this long tail. It also includes a "Skill Security Scanner" tool that audits GitHub skills for suspicious patterns before installation — addressing the supply-chain security concern that comes with running arbitrary agent instructions.

---

## Technical Architecture

```
Playbooks.com Platform:
┌───────────────────────────────────────────┐
│  FRONTEND (Next.js + React)               │
│  ├── Skills Directory (/skills)           │
│  │   ├── Search (URL params)              │
│  │   ├── Language filters (45+)           │
│  │   ├── Sort: trending/popular           │
│  │   ├── Official-only filter             │
│  │   └── Pagination (963+ pages)          │
│  ├── MCP Directory (/mcp)                 │
│  │   ├── 14,890 MCP servers               │
│  │   └── Pagination (414+ pages)          │
│  ├── Tools (/tools)                       │
│  │   └── Skill Security Scanner           │
│  └── Advertise (/advertise)               │
│       └── Sponsored skill placements      │
├───────────────────────────────────────────┤
│  DATA MODEL                               │
│  ├── Skills: name, creator, repo, views,  │
│  │   verified badge, language tags,        │
│  │   install instructions per-agent       │
│  ├── MCP Servers: name, description,      │
│  │   JSON-RPC 2.0 config, client compat   │
│  └── JSON-LD structured markup (SEO)      │
├───────────────────────────────────────────┤
│  MONETIZATION                             │
│  └── Sponsored placements (/advertise)    │
└───────────────────────────────────────────┘

No public API. No SDK. Copy-paste installation model.
```

Key design decisions:
- **No account required** — frictionless browsing, reduces barrier to discovery
- **Verification badges** — official sources (Anthropic, Vercel, Google, OpenAI) get visual trust signals
- **Multi-agent installation** — each skill shows install paths for 12+ agent products
- **SEO-first** — JSON-LD markup, server-rendered Next.js, clean URL structure
- **Ad-supported** — sponsored skill placements fund the directory

---

## Publisher Background

**Ian Nuttall** (@iannuttall) is a solo developer based in Nottingham, UK. Self-described as a "serial internet biz builder with multiple 6 & 7 figure exits." He has significant traction in the Claude Code ecosystem:

- **claude-agents** — Custom subagents for Claude Code (2K GitHub stars)
- **claude-sessions** — Development session tracking (1.2K stars)
- **ralph** — TypeScript agent loop for autonomous coding (810 stars)
- **mcp-boilerplate** — Remote Cloudflare MCP server template (1K stars)
- **dotagents** — Centralized hooks and commands repository (619 stars)
- **librarian** — CLI documentation search tool (96 stars)

Total GitHub: 610 followers, 32 repositories. His projects collectively demonstrate strong understanding of the Claude Code ecosystem, agent tooling, and MCP infrastructure. Playbooks.com is his attempt to build the "registry layer" on top of this ecosystem — the aggregation play that sits above individual tools.

---

## What's Valuable for Us

1. **Discovery of High-Quality Official Skills**

   The verified/official filter surfaces skills from Anthropic (frontend-design at 78K views), Vercel Labs (web-design-guidelines at 22K views, agent-browser at 10.8K views), Google Gemini (code-reviewer at 92.6K views), and others. These are production-tested, high-signal skills worth reviewing.

2. **MCP Server Discovery**

   With 14,890 MCP servers catalogued, this is the most comprehensive directory for finding MCP integrations. Useful when we need to evaluate MCP options for specific services (Figma, n8n, Azure DevOps, etc.).

3. **Ecosystem Trend Signal**

   View counts and trending sorts provide signal on what the broader agent community finds valuable. The most-viewed skills (nano-banana-pro at 234K, cache-components at 138K, code-reviewer at 92K) reveal what patterns are in highest demand.

4. **Security Scanner**

   The Skill Security Scanner tool addresses a real concern — skills are essentially arbitrary instructions that agents execute. As we consider adopting community skills, having a pre-installation security audit tool is valuable.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Sponsored placements** | We're not publishing skills commercially. |
| **Breadth of 34K skills** | 99% are community-contributed, unvetted. We build our own orchestration skills in-repo. Browsing 34K entries is noise, not signal. |
| **Copy-paste installation** | We need programmatic, version-controlled skill management — not manual copy-paste from a website. |
| **No API** | Without an API, we can't integrate discovery into our orchestration pipeline. It's a human-in-the-loop browsing experience. |
| **Ad-supported model** | Sponsored placements may bias discovery toward paying advertisers over highest-quality skills. |

**Governing Principle tensions:**
- **Principle 7 (Build only what you've needed in last 30 days):** We haven't needed a skills directory. Our skills are hand-crafted for our orchestration patterns.
- **Principle 2 (Deterministic orchestration):** A browsing directory is inherently manual/non-deterministic. Doesn't fit our automation-first approach.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Nothing to adopt. Bookmark for occasional browsing.
- **Phase 2 (Days 4-60):** Browse official skills from Anthropic and Vercel when building new agent capabilities. Check MCP directory when evaluating new integrations.
- **Phase 3 (Days 60-90):** If we convert our `.claude/commands/` to the SKILL.md format (see [OpenSkills](./openskills.md) entry), Playbooks becomes a distribution channel for publishing our orchestration skills.
- **Phase 4 (Days 90+):** If Playbooks adds an API, it could become a programmatic discovery layer for our agent system to find and evaluate new skills automatically.

---

## Relationship to Other Catalogue Entries

| Entry | Relationship |
|-------|-------------|
| [OpenSkills](./openskills.md) | Playbooks is the **registry/directory** for the Agent Skills standard that OpenSkills defines. OpenSkills = the spec, Playbooks = the npm registry. |
| [Koylan Skills](./koylan-skills.md) | Koylan's skills are among the items discoverable through Playbooks. Koylan = a curated skill library, Playbooks = the search engine that indexes it. |
| [AGENTS.md](./agents-md.md) | AGENTS.md defines agent capabilities per-repo. Skills extend agent capabilities across repos. Complementary standards. |

---

## Key Takeaway

> **Playbooks.com is the largest directory for Agent Skills (34K+) and MCP servers (14K+) — useful for occasional discovery of high-quality official skills from Anthropic/Vercel/Google, but not a tool to build with. No API, no programmatic integration, manual copy-paste model. Bookmark it, browse it when evaluating new capabilities, but our orchestration skills remain hand-crafted in-repo.**
