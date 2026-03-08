---
name: 'ingest-article'
description: 'Ingest a blog post or article into the knowledge catalogue with summary, key takeaways, and relevance scoring'
---

You are ingesting an article/blog post into the Knowledge Catalogue at `{project-root}/research/catalogue/articles/`.

<steps CRITICAL="TRUE">
1. LOAD the template from `{project-root}/research/catalogue/_TEMPLATE-ARTICLE.md`
2. FETCH and read the full article content from the provided URL
3. ANALYZE the content thoroughly:
   - Extract 3-5 key takeaways
   - Note any tools/projects mentioned
   - Find notable quotes
   - Assess relevance using the broad interest scope (see Scoring Rubric below)
4. EXPLORE DEPTH — scan the article for outbound links and referenced resources:
   - If a linked article, paper, or tool seems highly relevant (would score 7+), add it to "Deep Dive Candidates"
   - Do NOT follow links yourself — just collect them for a potential second pass
5. CHECK if any mentioned tools already exist in the catalogue by reading `{project-root}/research/catalogue/INDEX.md`
6. CREATE the profile using the template format
7. SAVE to `{project-root}/research/catalogue/articles/YYYY-MM/<slug>.md` (create the month directory if needed)
8. UPDATE `{project-root}/research/catalogue/INDEX.md` — add the entry to the "Recent Articles" table
</steps>

## Scoring Rubric

**Relevance** (0-10): How relevant is this to Burak's interest space? Score HIGH if it covers ANY of these:
- AI agent systems, multi-agent orchestration, agent engineering patterns
- AI coding tools (Claude Code, Codex, Cursor, Windsurf, etc.)
- Autonomous software factories, AI-assisted development workflows
- SaaS business models, solo founder / small team scaling with AI
- LLM engineering, context engineering, prompt engineering
- Business automation, AI ops, DevOps for agents
- The economics of AI (pricing, margins, token costs, arbitrage)
- Lead generation, marketing automation, growth hacking with AI

Score LOW only if the content is genuinely unrelated to this space (e.g., pure politics, sports, unrelated science).

**Actionable** (0-10): Are there concrete patterns, tools, or strategies we can implement or learn from?

## File Naming

Use slugified article title: `context-engineering-for-agents.md`, `building-autonomous-companies.md`, etc.

## Cross-Referencing

In the "Referenced Tools/Projects" table, always check if the tool exists in the catalogue. If it does, link to it. If it doesn't and it seems important, note it as "Not yet catalogued — consider /tool-catalogue".
