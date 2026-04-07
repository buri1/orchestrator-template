---
name: 'ingest-x-activity'
description: 'Track a practitioner''s recent X/Twitter activity via web search and fxtwitter, extract high-signal posts, and flag candidates for full /ingest-post treatment'
---

You are tracking a practitioner's X/Twitter activity for the Knowledge Catalogue.
The target handle is: `$ARGUMENTS`

**Default model: Sonnet.** Do not use Opus unless explicitly requested.

<steps CRITICAL="TRUE">

## Step 1: Resolve the Handle and Load State

Parse `$ARGUMENTS`:
- The first token beginning with `@` is the handle (strip the `@` for URL use).
- Optional flag `opus` → use Opus model.
- Optional flag `force` → ignore dedup cache and re-fetch everything.
- Optional flag `deep` → also run full `/ingest-post` on every post that scores 7+.

Locate the practitioner profile (if it exists) by reading:
```
research/catalogue/INDEX.md
```
Search the Practitioners table for a row matching the handle. Note the profile path if found.

Check for existing X activity shards:
```
research/catalogue/practitioners/x-activity/<handle-lowercase>/
```
If shards exist, read the most recent one. Build a Set of already-tracked post IDs from `posts[].id` — you will skip these later.

Also check the dedup state file:
```
_bmad/x-activity/<handle-lowercase>.json
```
If it exists, read it for scan metadata. If not, this is a first run.

## Step 2: Collect Recent Posts via Web Search

Run at least **3 web searches** targeting different time windows and content types:

```
site:x.com/<handle> (agent OR orchestration OR claude OR "coding agent" OR llm OR "ai tool")
"<handle>" x.com tweet (AI OR agent OR coding OR rust) 2026
<handle> twitter thread site:threadreaderapp.com
```

For each result:
- Extract the post URL (x.com/<handle>/status/<id>)
- Extract the post ID from the URL (numeric string after `/status/`)
- Record: raw snippet text, publication date, any linked URLs

Deduplicate across searches. Filter out retweets on different handles.

**Resilience rule**: Web search will be incomplete. Aim for 10-30 posts. If fewer than 5, note "sparse coverage" and continue.

## Step 3: Enrich Each Post via fxtwitter

For each unique post URL, fetch structured data:
```
https://api.fxtwitter.com/<handle>/status/<post-id>
```

Extract: full text, created_at, likes, retweets, replies, views, bookmarks, links, media.

- If fxtwitter succeeds → use as authoritative record.
- If 404 or error → keep web search snippet, mark `enriched: false`.
- **Never block the whole run on one failure.** Mark and move on.

## Step 4: Deduplicate Against Tracked State

- If post `id` is already tracked AND `force` flag NOT set → **SKIP**
- Otherwise → **NEW** (process it)

If ALL posts already tracked, report "No new posts" and exit.

## Step 5: Classify and Score Each New Post

For each post, produce a structured JSON record following `_SCHEMA.json`:

### Topic Tagging (controlled vocabulary)
```
agent-orchestration  multi-agent  claude-code  coding-tools  llm-engineering
context-engineering  prompt-engineering  saas-business  ai-economics
ai-ops  devops  lead-gen  marketing  observability  memory-systems
mcp  a2a-protocol  infrastructure  research  rust  security  open-source
personal  off-topic
```

### Relevance Scoring (0-10)
Score HIGH (7-10) if it covers: AI agents, multi-agent orchestration, coding tools, autonomous software factories, SaaS/solo founder scaling, LLM/context/prompt engineering, AI economics, business automation.
Score MEDIUM (4-6) for tangential content.
Score LOW (1-3) for off-topic.
Score 0 (NOISE) for platform meta, duplicates.

### Signal Tier
| Tier | Criteria |
|------|----------|
| HIGH | Relevance 7+ AND (has links OR substantive technical content OR >100 likes) |
| MEDIUM | Relevance 4-6, OR 7+ but low engagement/no links |
| LOW | Relevance 1-3 |
| NOISE | Relevance 0 |

### Ingest Candidate Flag
Set `true` if: signal HIGH, OR is a thread, OR contains GitHub/blog link AND relevance >= 6.

## Step 6: Write Monthly Shard Files

Group posts by month. For each month, write/update:
```
research/catalogue/practitioners/x-activity/<handle>/<YYYY-MM>.json
```

Schema per file:
```json
{
  "handle": "<handle>",
  "practitioner_ref": "../../<practitioner-file>.md",
  "month": "YYYY-MM",
  "synced_at": "<ISO timestamp>",
  "posts": [... sorted by date descending ...]
}
```

When updating existing shards: merge new posts by ID, do not overwrite existing entries (unless `force`).

## Step 7: Write Dedup State

Write to `_bmad/x-activity/<handle>.json`:
```json
{
  "handle": "@<handle>",
  "practitioner_profile": "<path or null>",
  "last_scan": "<ISO timestamp>",
  "scan_count": N,
  "total_tracked": N,
  "stats": { "high": N, "medium": N, "low": N, "noise": N, "ingested": N }
}
```

## Step 8: Show Activity Summary

Print structured summary:
```
## X Activity Scan — @<handle>
Scanned: YYYY-MM-DD
Posts collected: N (N new / N already tracked)

### HIGH Signal (N)
| Date | Preview (60 chars) | Rel | Topics | URL |

### MEDIUM Signal (N)
| Date | Preview (60 chars) | Rel | Topics | URL |

### LOW + NOISE: N (omitted)

### Recommended Actions
- /ingest-post candidates: [list URLs]
- Profile update needed: [Yes/No]
```

## Step 8a: Auto-Ingest (only if `deep` flag)

For each HIGH-signal ingest candidate, spawn a Sonnet subagent running `/ingest-post` on the URL.

</steps>

## Argument Reference

| Arg | Example | Effect |
|-----|---------|--------|
| Handle (required) | `@doodlestein` | The practitioner to track |
| `opus` | `@doodlestein opus` | Use Opus model |
| `force` | `@doodlestein force` | Re-fetch all, ignore dedup |
| `deep` | `@doodlestein deep` | Auto-ingest HIGH-signal posts |
