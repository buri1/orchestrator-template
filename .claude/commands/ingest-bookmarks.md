---
name: 'ingest-bookmarks'
description: 'Batch-ingest all bookmarks from Chrome LLM-INGEST folder via parallel subagents'
---

You are a bookmark ingestion dispatcher. Your job is to read the Chrome bookmarks file, extract URLs from the LLM-INGEST folder, and spawn parallel subagents to process each one.

<steps CRITICAL="TRUE">

## Step 1: Read Bookmarks

Read the Chrome bookmarks JSON file:
```
/Users/buraksmac/Library/Application Support/Google/Chrome/Default/Bookmarks
```

Find the folder with `"name": "LLM-INGEST"` in the bookmark bar children. Extract all bookmark entries (type: "url") from that folder — NOT from subfolders, only direct children.

## Step 2: Classify Each Bookmark

For each bookmark URL, determine the ingest type:

| URL Pattern | Type | Skill |
|---|---|---|
| `youtube.com` or `youtu.be` | talk | `/ingest-talk` |
| `x.com` or `twitter.com` | post | `/ingest-post` |
| Everything else | article | `/ingest-article` |

## Step 3: Show Plan and Confirm

Present a numbered table to the user:

```
| # | Type    | Title (truncated) | URL |
|---|---------|-------------------|-----|
| 1 | article | Factory Floor...  | ... |
| 2 | talk    | Coding Agents...  | ... |
```

Ask: "Ready to ingest N bookmarks? (Y to proceed, or specify numbers to skip)"

## Step 4: Spawn Parallel Subagents

For EACH bookmark, spawn a subagent using the `Agent` tool with `subagent_type: "general-purpose"`. Launch ALL agents in a single message for maximum parallelism.

Each agent prompt MUST follow this exact structure:

```
You are ingesting a single resource into the knowledge catalogue.

URL: {bookmark_url}
Title: {bookmark_name}
Type: {article|post|talk}

YOUR MISSION:
Run the /ingest-{type} skill with the URL above. Use the Skill tool:
- skill: "ingest-{type}", args: "{bookmark_url}"

If the Skill tool is not available, follow these steps manually:
1. Read the template: research/catalogue/_TEMPLATE-{TYPE}.md
2. Fetch the URL content using WebFetch
3. Read the master blueprint: research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md
4. Read the catalogue index: research/catalogue/INDEX.md
5. Create the profile following the template format
6. Save to the correct path under research/catalogue/{type}s/YYYY-MM/
7. Update research/catalogue/INDEX.md with the new entry

IMPORTANT: Do NOT skip the INDEX.md update. Every ingested item must appear in the index.
```

## Step 5: Report Results

After all agents complete, summarize:

```
## Ingest Results

| # | Title | Type | Status | File |
|---|-------|------|--------|------|
| 1 | ...   | article | done | research/catalogue/articles/2026-03/... |

Processed: X/Y
Failed: Z (list reasons)
```

If any agents failed, offer to retry them.

</steps>

## Edge Cases

- **Empty folder**: Report "LLM-INGEST folder is empty — nothing to ingest" and stop
- **Nested folders**: Only process direct URL children of LLM-INGEST, not subfolders
- **Duplicate URLs**: Check INDEX.md before spawning — if URL already exists, skip and note as "already catalogued"
- **Chrome not flushed**: If the bookmark count seems low, tell the user to switch Chrome tabs or close/reopen bookmark manager to force a disk flush
