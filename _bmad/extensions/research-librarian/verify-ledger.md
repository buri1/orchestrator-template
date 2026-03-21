# Verify Ledger Workflow

> Cross-references the ingest ledger against the actual catalogue files to find mismatches.

---

## Steps

### Step 1: Load Ledger

Read `_bmad/ingest-ledger.json`. Parse the `ingested` object. Store all entries as a map: `URL -> { catalogue_path, source, ingested_at }`.

Count: {ledger_count} entries. Last run: {last_run}.

If the file is missing or invalid JSON, report the error and offer to recreate it from scratch (empty ledger).

### Step 2: Scan Catalogue Files

List all `.md` files under `research/catalogue/` recursively, excluding:
- `reference/` directory
- `INDEX.md`, `TIMELINE.md`, `ADOPTABLE-PATTERNS.md`
- `_TEMPLATE*.md` files
- `catalogue-explorer.html`
- Python scripts (`*.py`)

For each catalogue `.md` file:
1. Read the first 30 lines.
2. Extract the Source URL from the metadata table (look for `| Source |`, `| Repository |`, or a URL in the first table).
3. Store as: `{ file_path, source_url }`.

Count: {catalogue_count} entries with extractable URLs.

### Step 3: Cross-Reference

#### 3a. Catalogue entries MISSING from ledger

For each catalogue entry with a source URL: check if that URL exists as a key in the ledger's `ingested` map.

If not found → **MISSING FROM LEDGER** (needs backfill).

#### 3b. Ledger entries with MISSING files

For each ledger entry: check if `catalogue_path` exists on disk.

If file not found → **STALE LEDGER ENTRY** (file deleted or moved).

#### 3c. Path Mismatches

For each ledger entry where the file exists: verify the `catalogue_path` in the ledger matches the actual file location. Flag any paths that have changed.

### Step 4: Report

```
## Ledger Verification Report — [date]

| Metric | Count |
|--------|-------|
| Catalogue entries (with URL) | {catalogue_count} |
| Ledger entries | {ledger_count} |
| Matched (in both) | {matched} |
| In catalogue, MISSING from ledger | {missing_from_ledger} |
| In ledger, file NOT FOUND | {stale_entries} |
| Path mismatches | {path_mismatches} |

### Missing from Ledger (top 20)
| # | Catalogue Path | Source URL |
|---|---------------|------------|

### Stale Ledger Entries (file not found)
| # | Ledger URL | Expected Path |
|---|-----------|---------------|

### Path Mismatches
| # | URL | Ledger Path | Actual Path |
|---|-----|------------|-------------|
```

### Step 5: Offer Backfill

If there are entries missing from the ledger:

1. Ask: "Backfill {N} missing entries into the ledger? (Y/N)"
2. If confirmed, for each missing entry:
   - Add to ledger: `{ "source": "backfill", "ingested_at": "[current ISO timestamp]", "catalogue_path": "[path]" }`
3. Update `last_run` timestamp.
4. Write the updated ledger back to `_bmad/ingest-ledger.json`.
5. Report: "Backfilled {N} entries. Ledger now has {new_total} entries."

For stale entries, ask: "Remove {N} stale entries from ledger? (Y/N)" and clean up if confirmed.
