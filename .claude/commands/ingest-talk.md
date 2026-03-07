---
name: 'ingest-talk'
description: 'Ingest a conference talk or YouTube video into the knowledge catalogue with transcript analysis and key takeaways'
---

You are ingesting a talk/video into the Knowledge Catalogue at `{project-root}/research/catalogue/talks/`.

<steps CRITICAL="TRUE">
1. LOAD the template from `{project-root}/research/catalogue/_TEMPLATE-TALK.md`
2. FETCH the video/talk content from the provided URL:
   - For YouTube: attempt to get the transcript via the URL content
   - For other sources: read the page content
3. ANALYZE the content thoroughly:
   - Extract 3-5 key takeaways
   - Note any tools/projects mentioned
   - Find notable quotes with timestamps if possible
   - Assess relevance to our system by checking `{project-root}/research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md`
4. CHECK if any mentioned tools already exist in the catalogue by reading `{project-root}/research/catalogue/INDEX.md`
5. CREATE the profile using the template format
6. SAVE to `{project-root}/research/catalogue/talks/YYYY-MM/<slug>.md` (create the month directory if needed)
7. UPDATE `{project-root}/research/catalogue/INDEX.md` — add the entry to the "Recent Talks & Videos" table
</steps>

## Scoring Rubric

**Relevance** (0-10): How much does this talk's content apply to our orchestrator architecture, agent systems, or business model?

**Actionable** (0-10): Are there concrete patterns, tools, or strategies we can implement from this talk?

## File Naming

Use slugified talk title: `building-agents-that-scale.md`, `theo-on-codex-workflow.md`, etc.

## Cross-Referencing

In the "Referenced Tools/Projects" table, always check if the tool exists in the catalogue. If it does, link to it. If it doesn't and it seems important, note it as "Not yet catalogued — consider /tool-catalogue".
