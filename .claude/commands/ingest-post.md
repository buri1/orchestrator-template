---
name: 'ingest-post'
description: 'Ingest an X/Twitter post or thread into the knowledge catalogue with key takeaways and cross-references'
---

You are ingesting an X post/thread into the Knowledge Catalogue at `{project-root}/research/catalogue/posts/`.

<steps CRITICAL="TRUE">
1. LOAD the template from `{project-root}/research/catalogue/_TEMPLATE-POST.md`
2. FETCH the post/thread content from the provided URL
3. ANALYZE the content:
   - Extract 1-3 key takeaways
   - Note any tools/projects mentioned
   - Preserve the full post text
   - Assess relevance to our system by checking `{project-root}/research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md`
4. CHECK if any mentioned tools already exist in the catalogue by reading `{project-root}/research/catalogue/INDEX.md`
5. CREATE the profile using the template format
6. SAVE to `{project-root}/research/catalogue/posts/YYYY-MM/<handle>-<slug>.md` (create the month directory if needed)
7. UPDATE `{project-root}/research/catalogue/INDEX.md` — add the entry to the "Notable Posts" table
</steps>

## File Naming

Include author handle: `theo-on-agent-scaling.md`, `steipete-claude-code-tips.md`, etc.

## Cross-Referencing

In the "Referenced Tools/Projects" table, always check if the tool exists in the catalogue. If it does, link to it. If it doesn't and it seems important, note it as "Not yet catalogued — consider /tool-catalogue".
