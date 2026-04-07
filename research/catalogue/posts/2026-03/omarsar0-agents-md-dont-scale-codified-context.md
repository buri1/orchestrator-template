# AGENTS.md Files Don't Scale Beyond Modest Codebases — Codified Context Paper

> **@omarsar0 (elvis / DAIR.AI) — 2026-02-28**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/omarsar0/status/2027770787659464812) |
| Author | @omarsar0 — elvis, Building @dair_ai, Prev: Meta AI, Elastic, PhD |
| Date | 2026-02-28 |
| Topics | AGENTS.md, context engineering, agent memory, multi-tier documentation, MCP, coding agents |
| Type | Single post (long-form / note tweet) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Single AGENTS.md hits a ceiling fast** — A 1,000-line prototype can be fully described in a single prompt, but a 100,000-line system cannot. The post directly challenges the "one file to rule them all" approach that most Claude Code/Codex users rely on.

2. **Three-tier memory architecture for agent context** — The "Codified Context" paper documents a working system with hot-memory constitution (660 lines, always loaded), 19 specialized domain-expert agents (9,300 lines total), and a cold-memory knowledge base of 34 spec docs (~16,250 lines) queried via MCP retrieval server. This mirrors our own multi-layer context approach.

3. **Documentation as load-bearing infrastructure** — Each agent and specification emerged from a real failure (bug, architectural mistake, forgotten convention) and was codified so it never required re-explanation again. Documentation becomes memory, not reference — agents depend on it structurally.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly validates and extends our multi-file context architecture. The three-tier memory model (hot constitution / domain-expert agents / cold-memory MCP retrieval) maps almost 1:1 to our CLAUDE.md + agent prompts + knowledge catalogue pattern. The "knowledge-to-code ratio of 24.2%" gives a concrete benchmark. The paper's 283-session longitudinal data over 70 days on a 108K-line system is the most rigorous production evidence for codified context engineering we've seen. |

---

## Full Content

AGENTS dot md files don't scale beyond modest codebases.

Lots of discussions on this lately.

If you're building serious software with Claude Code or any agentic tool, a single AGENTS dot md will eventually fail you. This paper shows what comes next.

A 1,000-line prototype can be fully described in a single prompt. A 100,000-line system cannot. The AI must be told, repeatedly and reliably, how the project works, what patterns to follow, and what mistakes to avoid.

Single-file manifests hit a ceiling fast.

This new paper, Codified Context, documents a three-tier infrastructure built during real development of a 108,000-line C# distributed system across 283 sessions over 70 days.

The system uses a three-tier memory architecture: a hot-memory constitution (660 lines, always loaded), 19 specialized domain-expert agents (9,300 lines total) invoked per task, and a cold-memory knowledge base of 34 specification documents (~16,250 lines) queried on demand via an MCP retrieval server.

Across 283 sessions, this produced 2,801 human prompts, 1,197 agent invocations, and 16,522 autonomous agent turns, roughly 6 autonomous turns per human prompt, with a knowledge-to-code ratio of 24.2%.

Crucially, none of it was designed upfront: each new agent and specification emerged from a real failure, a recurring bug, an architectural mistake, a convention forgotten, and was codified so it could never require re-explanation again, turning documentation into load-bearing infrastructure that agents depend on as memory, not reference.

Paper: https://arxiv.org/abs/2602.20478

Learn to build effective AI agents in our academy: https://academy.dair.ai/

[Image: Paper diagram showing the three-tier Codified Context architecture]

---

## Notable Replies

[Replies not accessible via API — X post had 90 replies and 177K views at time of ingestion. The post was highly engaged (1,490 likes, 2,908 bookmarks, 174 retweets) suggesting significant discussion. Manual review recommended for high-signal replies.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://arxiv.org/abs/2602.20478 | The "Codified Context" paper itself — three-tier agent memory architecture with 283-session longitudinal data; most rigorous production evidence for multi-file context engineering | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| AGENTS.md | The post argues AGENTS.md doesn't scale beyond modest codebases — the paper shows what comes next | [Yes — agent-protocols/agents-md.md](../agent-protocols/agents-md.md) |
| Claude Code | Named as an example agentic tool that needs better context infrastructure | Yes (multiple entries) |
| MCP (Model Context Protocol) | Cold-memory knowledge base queried on demand via MCP retrieval server | [Yes — reference/mcp-ecosystem-orchestration.md](../reference/mcp-ecosystem-orchestration.md) |
| Codified Context (paper) | The central subject — three-tier memory architecture for 108K-line C# system | Not yet catalogued — consider `/ingest-article https://arxiv.org/abs/2602.20478` |
| DAIR.AI Academy | Author's AI learning platform, promoted at end of post | Not yet catalogued |
