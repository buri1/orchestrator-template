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
   - Assess relevance to our system by checking `{project-root}/research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md`
4. CHECK if any mentioned tools already exist in the catalogue by reading `{project-root}/research/catalogue/INDEX.md`
5. CREATE the profile using the template format
6. SAVE to `{project-root}/research/catalogue/articles/YYYY-MM/<slug>.md` (create the month directory if needed)
7. UPDATE `{project-root}/research/catalogue/INDEX.md` — add the entry to the "Recent Articles" table
</steps>

## Scoring Rubric

**Relevance** (0-10): How much does this article's content apply to our orchestrator architecture, agent systems, or business model?

**Actionable** (0-10): Are there concrete patterns, tools, or strategies we can implement from this article?

## File Naming

Use slugified article title: `context-engineering-for-agents.md`, `building-autonomous-companies.md`, etc.

## Cross-Referencing

In the "Referenced Tools/Projects" table, always check if the tool exists in the catalogue. If it does, link to it. If it doesn't and it seems important, note it as "Not yet catalogued — consider /tool-catalogue".
