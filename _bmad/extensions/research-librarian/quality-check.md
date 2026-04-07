# Quality Check Workflow

> Audits recently created catalogue entries for completeness, consistency, and proper indexing.

---

## Steps

### Step 1: Identify Recent Entries

Find all `.md` files modified in the last 7 days under `research/catalogue/`:

```bash
find research/catalogue/ -name "*.md" -mtime -7 -not -name "INDEX.md" -not -name "TIMELINE.md" -not -name "ADOPTABLE-PATTERNS.md" -not -path "*/reference/*" -not -name "_TEMPLATE*"
```

If no files found, report: "No catalogue entries modified in the last 7 days." and return.

### Step 2: Audit Each Entry

For each recent entry, read the file and check:

#### 2a. Metadata Table Completeness

Every entry must have a metadata table near the top with pipe-delimited rows. Required fields vary by type:

**Tools** (in tool directories):
- Category, Repository, GitHub Stars, Publisher, License, Relevance, Actionable, Novelty

**Articles** (in `articles/`):
- Source, Author, Published, Category, Relevance

**Talks** (in `talks/`):
- Source, Speaker, Event, Published, Category, Relevance

**Posts** (in `posts/`):
- Source, Author, Platform, Published, Category, Relevance

Mark as `WARN` if any required field is missing or says "TBD" / "TODO" / "N/A".

#### 2b. Analysis Section

Check for the presence of at least ONE of these section headers:
- `## Key Takeaways`
- `## Analysis`
- `## Architecture`
- `## What This Means for Us`
- `## Relevance to Our Vision`

Mark as `ERROR` if none found — the entry lacks substantive analysis.

#### 2c. Relevance Score with Justification

Check that a relevance score exists (pattern: `Relevance` row with a number `/10`).
Check that there is justification text near the score (not just a bare number).

Mark as `WARN` if score exists but no justification. Mark as `ERROR` if no score at all.

#### 2d. INDEX.md Listing

Read `research/catalogue/INDEX.md` and search for the entry's filename (without the directory path).

Mark as `ERROR` if the entry is not found in INDEX.md.

#### 2e. Cross-Reference Validation

If the entry contains an "In Our Catalogue?" or "See Also" section with links to other catalogue entries, verify those linked files exist on disk.

Mark as `WARN` for any broken internal links.

### Step 3: Report Findings

Present results as a table:

```
## Quality Check Report — [date]

Entries audited: N (modified in last 7 days)

| # | Entry | Issues | Severity |
|---|-------|--------|----------|
| 1 | articles/2026-03/example.md | Missing "Key Takeaways" section | ERROR |
| 2 | orchestration-platforms/foo.md | Not listed in INDEX.md | ERROR |
| 3 | agent-harnesses/bar.md | GitHub Stars says "TBD" | WARN |
| 4 | posts/2026-03/baz.md | No issues | OK |

Summary: X errors, Y warnings, Z clean entries.
```

### Step 4: Offer Auto-Fix

If any entries are missing from INDEX.md:

1. List them and ask: "Auto-add N entries to INDEX.md? (Y/N)"
2. If confirmed, read the entry's metadata to extract category, relevance score, and a one-line verdict.
3. Add a row to the appropriate category table in INDEX.md.
4. Increment the total count in the INDEX.md header.

For other issues (missing sections, TBD fields), list them as manual action items — do not auto-fix content.
