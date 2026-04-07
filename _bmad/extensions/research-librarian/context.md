# Research Librarian — Context Reference

> Loaded once per session on the first ingest action. Contains all protocols and reference data needed for catalogue curation.

---

## 1. Catalogue Directory Map

| Directory | Content Type | Template |
|-----------|-------------|----------|
| `research/catalogue/orchestration-platforms/` | Multi-agent coordination, task routing, governance | `_TEMPLATE.md` |
| `research/catalogue/agent-harnesses/` | CLI tools, SDKs, runtimes, agent execution frameworks | `_TEMPLATE.md` |
| `research/catalogue/agent-memory/` | Memory systems, context retrieval, RAG platforms | `_TEMPLATE.md` |
| `research/catalogue/developer-gui/` | Desktop/web apps, IDE extensions for agent management | `_TEMPLATE.md` |
| `research/catalogue/research-academic/` | Papers, benchmarks, research systems | `_TEMPLATE.md` |
| `research/catalogue/observability/` | Tracing, monitoring, failure analysis, cost tracking | `_TEMPLATE.md` |
| `research/catalogue/code-intelligence/` | Semantic code understanding, codebase search | `_TEMPLATE.md` |
| `research/catalogue/infrastructure/` | Hosting, deployment, runtime infrastructure | `_TEMPLATE.md` |
| `research/catalogue/agent-protocols/` | Standards, conventions, inter-agent protocols | `_TEMPLATE.md` |
| `research/catalogue/agent-economy/` | Marketplaces, pricing, agent economics | `_TEMPLATE.md` |
| `research/catalogue/articles/YYYY-MM/` | Blog posts, articles (time-bucketed) | `_TEMPLATE-ARTICLE.md` |
| `research/catalogue/talks/YYYY-MM/` | Conference talks, YouTube presentations | `_TEMPLATE-TALK.md` |
| `research/catalogue/posts/YYYY-MM/` | X/Twitter posts, social media threads | `_TEMPLATE-POST.md` |
| `research/catalogue/practitioners/` | Notable practitioners and their work | `_TEMPLATE-PRACTITIONER.md` |

### Template Paths

- Tool: `research/catalogue/_TEMPLATE.md`
- Article: `research/catalogue/_TEMPLATE-ARTICLE.md`
- Talk: `research/catalogue/_TEMPLATE-TALK.md`
- Post: `research/catalogue/_TEMPLATE-POST.md`
- Practitioner: `research/catalogue/_TEMPLATE-PRACTITIONER.md`

---

## 2. Scoring Rubric

### Relevance to Our Vision (0-10)

| Score | Meaning |
|-------|---------|
| 9-10 | Directly solves a problem in our current roadmap phase |
| 7-8 | Solves a problem we'll face in the next 60 days |
| 5-6 | Interesting patterns we could adapt, but no immediate need |
| 3-4 | Tangentially related, maybe useful at Phase 4 (Day 90+) |
| 1-2 | Different problem domain, minimal overlap |

### Novelty (0-10)

| Score | Meaning |
|-------|---------|
| 9-10 | Completely new approach we haven't seen in our research |
| 7-8 | Known concept but significantly better implementation |
| 5-6 | Validates patterns we've documented with minor new insights |
| 3-4 | Mostly covers ground we've already researched |
| 1-2 | Nothing new |

### Actionable (0-10)

| Score | Meaning |
|-------|---------|
| 9-10 | Can directly adopt code/patterns this week |
| 7-8 | Clear adaptation path, ~1 day of work |
| 5-6 | Useful reference, needs significant adaptation |
| 3-4 | Interesting but requires substantial rethinking |
| 1-2 | Purely informational |

---

## 3. Master Blueprint — 7 Governing Principles (Summary)

Full document: `research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md`

1. **The orchestration layer is the compounding asset.** Agents commoditize. The wiring endures.
2. **Deterministic orchestration, LLM execution.** Orchestrator never guesses. LLM writes code, diagnoses, generates.
3. **Context is zero-sum.** Every token competes for attention. Separate business/coding context architecturally.
4. **Coordination overhead scales at exponent 1.724.** Better context on fewer agents beats more agents.
5. **Human review is the binding constraint.** Reduce what humans must review, not increase agent output.
6. **Federated systems, thin meta-layer.** Each business line is independent. Meta-layer provides visibility without contamination.
7. **Build only what you needed in the last 30 days.** Not frontier research. Not speculative. Actually needed.

Always cross-reference new entries against these principles when writing the "Relevance to Our Vision" analysis.

---

## 4. Ingest Ledger Protocol

**Path**: `_bmad/ingest-ledger.json`

### Structure

```json
{
  "version": 1,
  "last_run": "ISO timestamp or null",
  "ingested": {
    "https://example.com/article": {
      "source": "chrome|comet|x-bookmarks|discovery-cycle-N|manual",
      "ingested_at": "ISO timestamp",
      "catalogue_path": "research/catalogue/..."
    }
  }
}
```

### Deduplication Rules

- The ledger is the **authoritative dedup source**. Do NOT fall back to grepping INDEX.md.
- Before ingesting any URL, check if it exists as a key in `ingested`.
- After successful ingest, add the URL to the ledger immediately.
- Failed ingests are NOT added (so they get retried next run).
- If the ledger has fewer than 50 entries, warn: it likely hasn't been backfilled.

---

## 5. Discovery Sidecar Format

**Path**: `_bmad/ingest-discoveries/{unique-slug}.json`

```json
{
  "source_url": "https://...",
  "source_title": "Title from the ingested content",
  "catalogue_path": "research/catalogue/...",
  "ingested_at": "ISO timestamp",
  "discovered_urls": [
    {
      "url": "https://...",
      "context": "Why this was mentioned",
      "suggested_type": "tool|article|post|talk",
      "relevance_hint": "Why it might be valuable"
    }
  ]
}
```

Rules: Only include URLs that would score 6+ relevance. No generic links, docs, or social profiles. Empty array if no valuable discoveries.

---

## 6. ADOPTABLE-PATTERNS.md Append Protocol

**Path**: `research/catalogue/ADOPTABLE-PATTERNS.md`

### When to Append

- After any ingest where the entry scores **7+ relevance** AND contains **concrete implementation steps or transferable patterns**.
- Priority mapping: 8+ relevance = HIGH, 7 = MEDIUM, speculative/future = LOW.

### Format for New Entries

Append under the correct subsection of `## 2. Patterns from Research Catalogue (Actionable)`:
- HIGH: `### 2.1 HIGH PRIORITY — Implement Soon`
- MEDIUM: `### 2.2 MEDIUM PRIORITY — Next Sprint`
- LOW: `### 2.3 LOW PRIORITY — Track for Later`

```markdown
#### [Pattern Name] (from [Source Name])
**Source**: [relative link to catalogue entry](./path/to/entry.md)
[One-line description of the pattern and why it matters.]
**Implementation**: [Concrete sketch of how to adopt this in our system.]
**Priority**: [High|Medium|Low] — [brief justification]
```

### Rules

- NEVER rewrite existing content. Append only.
- Check for duplicates before appending (search for the source URL or pattern name).
- Update the `Last Updated` field in the metadata table at the top.

---

## 7. INDEX.md Update Protocol

**Path**: `research/catalogue/INDEX.md`

### After Creating a New Entry

1. Identify which category table the entry belongs in.
2. Add a new row to that table in the correct alphabetical position.
3. Format: `| [Entry Name](./path/to/entry.md) | Category Emoji + Name | X/10 | Verdict |`
4. Update the header line total count: `**Total entries:** N+1 (breakdown...)`.
5. If the entry scores 8+ relevance, also add it to the `## Quick Reference — Top Tier (8+ Relevance)` table.

### Category Breakdown Update

The header line format is: `**Total entries:** 344 (176 tools, 7 practitioners, 81 reference docs, 39 articles, 16 talks, 29 posts)`

Increment the appropriate type counter when adding a new entry.
