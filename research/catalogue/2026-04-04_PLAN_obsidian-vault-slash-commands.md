# Plan: Obsidian Vault Slash Commands for Claude Code

> **Date:** 2026-04-04
> **Author:** Claude Code (planning session)
> **Status:** PROPOSAL — awaiting Burak's review
> **Based on:** [Synthesis: Obsidian + LLM Wiki + Second Brain](./2026-04-04_SYNTHESIS_obsidian-llm-wiki-second-brain.md)

---

## Design Principles

These commands follow the same structural pattern as the Finance Agent skills (`/check`, `/scan`, `/draft`) and the Orchestrator skills (`/ingest-talk`, `/tool-catalogue`):

1. **YAML frontmatter** with `name` and `description`
2. **Vorab-Checkliste** — files to read before executing
3. **Numbered steps** with tool references
4. **Formatted output** with consistent visual blocks
5. **Error handling** section at the end
6. **Idempotency** — safe to run multiple times

Target location: `<vault-project>/.claude/commands/`

---

## The 14 Commands — Prioritized by Value

### Priority Tier 1 — Daily Drivers

---

### 1. `/today`

**One-line:** Tagesbriefing — was ansteht, was offen ist, was sich seit gestern geaendert hat.

**What it does:**
1. Reads or creates today's daily note (`YYYY-MM-DD.md`) in the vault's journal directory.
2. Queries Notion databases (Finance Agent's Fristen, Posteingang, Abos) via MCP for today's obligations.
3. Checks the Obsidian vault for orphan notes (created but never linked), recently modified files, and any `TODO` / `FIXME` markers.
4. Scans the orchestrator's session logs for yesterday's unfinished items.
5. Outputs a structured daily briefing: calendar items, deadlines, open loops, vault health stats.
6. Appends a `## Briefing` section to today's daily note (never overwrites existing content).

**Tools:** Obsidian CLI (`obsidian-cli list`, `obsidian-cli search`), Notion MCP (`notion-fetch`, `notion-search`), Bash (file operations), Read/Write (daily note).

**Inspired by:** Internet Vin's `/today`, Cole Medin's proactive heartbeat, Steph Ango's fractal journaling.

---

### 2. `/context`

**One-line:** Lade einen Themen-Kontext aus dem Vault — sammelt alle relevanten Notizen, Verknuepfungen und offenen Fragen zu einem Stichwort.

**What it does:**
1. Takes a topic argument: `/context Schulden`, `/context CraftCode`, `/context Steuern`.
2. Searches the vault for all notes mentioning that topic (full-text + tags + YAML frontmatter properties).
3. Follows backlinks and forward links one level deep to build a context graph.
4. Reads the top 5-10 most relevant notes (ranked by mention density + recency).
5. Compiles a structured context summary: key facts, open questions, timeline of related events, linked people/entities.
6. Outputs the summary to the terminal. Does NOT write to the vault (read-only agent principle, per Vin).

**Tools:** Obsidian CLI (`obsidian-cli search`, `obsidian-cli list-links`), Read (note contents), Grep (full-text search fallback).

**Inspired by:** Internet Vin's `/context` — "context is the bottleneck."

---

### 3. `/ingest`

**One-line:** Rohmaterial in den Vault aufnehmen — URL, PDF, Textblock, Voice-Transkript — als strukturierte Notiz mit Frontmatter.

**What it does:**
1. Accepts input type: `/ingest <url>`, `/ingest <filepath>`, or `/ingest` (reads clipboard/stdin).
2. Fetches the content (WebFetch for URLs, Read for PDFs/files, stdin for text).
3. Extracts key information: title, author, date, main claims, tags.
4. Creates a new note in the vault's `_inbox/` directory with standardized YAML frontmatter:
   ```yaml
   ---
   created: 2026-04-04
   source: <url or filename>
   type: <article|pdf|transcript|note>
   tags: [auto-generated]
   status: raw
   ---
   ```
5. Writes a human-readable summary + the raw extracted content below a fold (`<details>`).
6. Adds the note to `_inbox/INDEX.md` if one exists.

**Tools:** WebFetch (URLs), Read (PDFs/files), Write (new note), Obsidian CLI (optional: open note after creation).

**Inspired by:** Karpathy's Ingest operation, Cole Medin's ingestion pipeline, orchestrator's `/ingest-talk`.

---

### 4. `/connect`

**One-line:** Verbindungen zwischen Notizen finden — semantische Verwandtschaft, fehlende Links, Cluster-Vorschlaege.

**What it does:**
1. Takes an optional argument: `/connect` (whole vault) or `/connect <note-name>` (from one note).
2. Reads the vault index or scans all notes for their tags, links, and frontmatter properties.
3. For a specific note: finds the 5-10 most semantically related notes based on shared tags, shared links, keyword overlap, and temporal proximity (created within same week).
4. For whole vault: identifies clusters of related but unlinked notes, suggests missing `[[wikilinks]]`.
5. Outputs connection suggestions as a list: `Note A --> Note B (reason: shared tag #finanzen, both mention KSP)`.
6. Does NOT modify notes. The user adds links manually (read-only principle for connection suggestions).

**Tools:** Obsidian CLI (`obsidian-cli list`, `obsidian-cli list-links`), Grep (keyword matching), Read (note contents for deeper analysis).

**Inspired by:** Internet Vin's `/connect`, Karpathy's cross-referencing in the Wiki layer.

---

### 5. `/lint`

**One-line:** Vault-Hygiene — orphane Notizen, kaputte Links, fehlende Frontmatter, veraltete Inhalte, Duplikate.

**What it does:**
1. Runs a comprehensive vault health check:
   - **Orphan notes:** Notes with zero incoming links (not referenced anywhere).
   - **Broken links:** `[[wikilinks]]` pointing to non-existent notes.
   - **Missing frontmatter:** Notes without required YAML fields (`created`, `tags`, `status`).
   - **Stale notes:** Notes with `status: raw` or `status: draft` older than 30 days.
   - **Duplicate titles:** Notes with identical or near-identical names.
   - **Empty notes:** Files with frontmatter but no content.
   - **Tag inconsistency:** Tags used only once (probable typos or orphan concepts).
2. Categorizes findings by severity: ERROR (broken links, missing dates), WARNING (orphans, stale), INFO (style suggestions).
3. Outputs a report. Optionally writes the report to `_meta/lint-report-YYYY-MM-DD.md` if `--save` flag is passed.
4. Does NOT auto-fix anything. Suggests specific commands for each fix.

**Tools:** Obsidian CLI (`obsidian-cli list`, `obsidian-cli list-links`, `obsidian-cli search`), Grep (frontmatter validation), Bash (file stats for staleness).

**Inspired by:** Karpathy's Lint operation — "check for orphan pages, missing cross-references, contradictions, stale claims."

---

### Priority Tier 2 — Weekly Value

---

### 6. `/trace`

**One-line:** Entscheidungshistorie nachverfolgen — wie hat sich ein Thema ueber die Zeit entwickelt, welche Entscheidungen wurden wann getroffen.

**What it does:**
1. Takes a topic: `/trace Schuldenabbau`, `/trace CraftCode Infrastruktur`.
2. Searches all vault notes, daily journals, and session logs for mentions of that topic.
3. Builds a chronological timeline: date, note title, what was said/decided, linked entities.
4. Identifies decision points (notes tagged `#decision` or containing "Entscheidung:", "beschlossen:", "abgelehnt:").
5. Highlights contradictions: places where later notes contradict earlier decisions.
6. Outputs a timeline view and optionally saves to `_meta/traces/`.

**Tools:** Obsidian CLI (search), Grep (pattern matching for decision markers), Read (note contents).

**Inspired by:** Internet Vin's `/trace`, Harrison Chase's "traces as currency" for continual learning.

---

### 7. `/query`

**One-line:** Frage an den Vault stellen — durchsucht, synthetisiert, und antwortet mit Quellenangaben.

**What it does:**
1. Takes a natural language question: `/query Wie viel zahle ich monatlich fuer Abos?`, `/query Was war der letzte Stand bei KSP?`.
2. Identifies which vault directories, Notion databases, and session logs are relevant.
3. Reads the relevant notes (max 15-20 for context window management).
4. Synthesizes an answer with inline source references: `[Quelle: 2026-03-15.md]`.
5. If the answer reveals a gap (question cannot be fully answered), explicitly says what is missing and suggests creating a note.
6. Files the answer back into the wiki layer as a new note ONLY if the user confirms with `/query --save`.

**Tools:** Obsidian CLI (search), Notion MCP (database queries), Read (note/DB contents), Write (optional save).

**Inspired by:** Karpathy's Query operation — "good answers should file back into the wiki."

---

### 8. `/ideas`

**One-line:** Ideen-Radar — sammelt verstreute Gedanken aus Daily Notes, Inbox, und Notizen und kondensiert sie thematisch.

**What it does:**
1. Scans daily notes from the last 7-30 days (configurable) for lines tagged `#idea`, `#gedanke`, or in a `## Ideas` / `## Ideen` section.
2. Scans `_inbox/` for notes with `status: raw` that contain potential project/business ideas.
3. Groups found ideas by theme (finance, business, tech, personal).
4. For each idea: shows the original quote, the source note, the date, and any related existing notes.
5. Suggests which ideas are ready to "graduate" to a proper project note or MOC (Map of Content).
6. Outputs the grouped list. Does not modify source notes.

**Tools:** Obsidian CLI (search by tag), Grep (pattern matching for idea markers), Read (daily notes).

**Inspired by:** Internet Vin's `/ideas` + `/graduate` combined. Karpathy's "idea files" concept.

---

### 9. `/ghost`

**One-line:** Recherche-Entwurf generieren — Agent schreibt einen Erstentwurf basierend auf Vault-Kontext, den Burak dann ueberarbeitet.

**What it does:**
1. Takes a topic + output type: `/ghost Steuererklaerung 2024 Brief`, `/ghost CraftCode Pitch Outline`, `/ghost Wochenbericht Zusammenfassung`.
2. Runs `/context <topic>` internally to gather all relevant vault knowledge.
3. Reads the Schreibstil-Referenz (`context/schreibstil.md`) for Burak's writing style.
4. Generates a first draft in Burak's voice, using the vault context as source material.
5. Saves the draft to `_drafts/<topic-slug>.md` with frontmatter `status: ghost-draft` and `drafted_by: agent`.
6. Outputs the draft with a clear header: "ENTWURF — Muss von Burak geprüft werden".
7. The trust boundary is explicit: the file is in `_drafts/`, not in the main vault. Human review required before promotion.

**Tools:** Read (schreibstil.md, context notes), Write (draft file), Obsidian CLI (optional: open in Obsidian).

**Inspired by:** Internet Vin's `/ghost`, Mark Kashef's `/voicenotetoletter`, Finance Agent's `/draft` pattern.

---

### 10. `/drift`

**One-line:** Reflexionsfragen zu einer Notiz oder einem Thema — Annahmen hinterfragen, blinde Flecken aufdecken.

**What it does:**
1. Takes a note or topic: `/drift 2026-04-04.md`, `/drift Schuldenabbau-Strategie`.
2. Reads the target note(s) and their context (linked notes, one level deep).
3. Generates 3-5 probing questions that challenge assumptions in the note:
   - "Du gehst davon aus dass X — was wenn Y?"
   - "Dieses Thema erwaehnt Z nicht — bewusst oder Luecke?"
   - "Letzte Woche hast du A entschieden, jetzt deutest du B an — hat sich was geaendert?"
4. Checks for contradictions with other vault notes.
5. Outputs questions only. Never modifies anything.

**Tools:** Read (target note + context), Obsidian CLI (backlink traversal), Grep (contradiction search).

**Inspired by:** Internet Vin's `/drift` + `/challenge` combined. The "thinking partner" use case.

---

### Priority Tier 3 — Setup & Maintenance

---

### 11. `/vault-setup`

**One-line:** Vault-Struktur initialisieren — Ordner, Templates, CLAUDE.md, VAULT-INDEX.md, Frontmatter-Schema anlegen.

**What it does:**
1. Creates the standard vault directory structure:
   ```
   _inbox/          # Raw ingested material
   _drafts/         # Ghost-written drafts (agent layer)
   _meta/           # Lint reports, traces, vault stats
   _templates/      # Note templates
   journal/         # Daily notes (YYYY/MM/YYYY-MM-DD.md)
   projects/        # Active project MOCs
   people/          # Contact/person notes
   areas/           # Ongoing life areas (Finanzen, Gesundheit, CraftCode, ...)
   resources/       # Reference material
   archive/         # Graduated/completed items
   ```
2. Creates `VAULT-INDEX.md` — a live dashboard file showing note counts per directory, recent changes, and vault health stats.
3. Creates `_templates/` with standard templates: daily note, project MOC, person, resource, meeting notes.
4. Creates vault-level `CLAUDE.md` with: directory conventions, frontmatter schema, tag taxonomy, and trust boundary rules.
5. Validates that the Obsidian CLI is installed and functional.

**Tools:** Bash (mkdir, obsidian-cli check), Write (CLAUDE.md, VAULT-INDEX.md, templates), Obsidian CLI (vault detection).

**Inspired by:** Mark Kashef's `/vault-setup`, Internet Vin's VAULT-INDEX.md, Steph Ango's properties-over-folders.

---

### 12. `/graduate`

**One-line:** Notiz befoerdern — von _inbox nach areas/projects, von _drafts in den Hauptvault, Status-Upgrade mit Frontmatter-Update.

**What it does:**
1. Takes a note path: `/graduate _inbox/steuer-recherche.md areas/finanzen/`.
2. Validates the note has required frontmatter (created, tags, status). If missing, prompts to add them.
3. Updates the `status` field: `raw` -> `reviewed`, `ghost-draft` -> `published`, etc.
4. Moves the file to the target directory.
5. Updates any `[[wikilinks]]` in other notes that pointed to the old location (Obsidian handles this if vault-relative, but verifies).
6. Updates VAULT-INDEX.md if it exists.
7. Logs the graduation in `_meta/graduation-log.md` with date and reason.

**Tools:** Bash (mv), Read/Edit (frontmatter update), Obsidian CLI (link verification), Write (log entry).

**Inspired by:** Internet Vin's `/graduate`, Steph Ango's "promote from messy to personal vault."

---

### 13. `/session-end`

**One-line:** Session abschliessen — Entscheidungen, Learnings, offene Fragen erfassen und in den Vault zurueckschreiben.

**What it does:**
1. Asks Burak (or reads from the current session context) for:
   - What was decided this session?
   - What was learned?
   - What remains open?
2. Creates a session log entry in `journal/sessions/YYYY-MM-DD_HH-MM.md` with structured frontmatter:
   ```yaml
   ---
   created: 2026-04-04T18:30:00
   type: session-log
   tags: [session]
   decisions: ["Decided X", "Rejected Y"]
   open_loops: ["Still need to Z"]
   ---
   ```
3. Appends a summary line to today's daily note under `## Sessions`.
4. Updates `VAULT-INDEX.md` with the latest session count.
5. Optionally logs to the Notion Session Logs DB (if Finance Agent's Notion MCP is available).

**Tools:** Write (session log), Edit (daily note append), Notion MCP (optional session log DB), Obsidian CLI (optional).

**Inspired by:** Cole Medin's SessionEnd hook, Harrison Chase's "Dreaming" pattern, Icarus Memory Protocol's decision capture.

---

### 14. `/vault-stats`

**One-line:** Vault-Metriken — Notizen nach Status, Wachstum, aktivste Bereiche, Link-Dichte, Tag-Verteilung.

**What it does:**
1. Counts notes per directory and per `status` field (raw, draft, reviewed, published, archived).
2. Calculates vault growth: notes created this week vs. last week, monthly trend.
3. Identifies the most active areas (most edits in last 7 days).
4. Computes link density: average links per note, most-linked notes (hubs), least-linked notes (periphery).
5. Shows tag distribution: top 20 tags by usage, tags used only once (cleanup candidates).
6. Compares to previous `/vault-stats` run if a history file exists in `_meta/`.
7. Outputs a formatted dashboard. Optionally saves to `_meta/vault-stats-YYYY-MM-DD.md`.

**Tools:** Obsidian CLI (list, list-links, search), Bash (wc, date calculations), Grep (frontmatter parsing), Write (optional report save).

**Inspired by:** Internet Vin's VAULT-INDEX.md as live dashboard, Karpathy's index.md pattern.

---

## Command Summary Table

| # | Command | Tier | Description | Primary Tools | From |
|---|---------|------|-------------|---------------|------|
| 1 | `/today` | Daily | Tagesbriefing mit Deadlines, offenen Loops, Vault-Health | Obsidian CLI, Notion MCP | Vin, Cole Medin |
| 2 | `/context` | Daily | Themen-Kontext aus dem Vault laden (read-only) | Obsidian CLI, Read, Grep | Vin |
| 3 | `/ingest` | Daily | Rohmaterial aufnehmen (URL, PDF, Text) | WebFetch, Read, Write | Karpathy, Cole Medin |
| 4 | `/connect` | Daily | Fehlende Links und Cluster finden | Obsidian CLI, Grep | Vin, Karpathy |
| 5 | `/lint` | Daily | Vault-Hygiene: Orphans, kaputte Links, Stale Notes | Obsidian CLI, Grep, Bash | Karpathy |
| 6 | `/trace` | Weekly | Entscheidungshistorie chronologisch aufbauen | Obsidian CLI, Grep, Read | Vin, Harrison Chase |
| 7 | `/query` | Weekly | Natuerliche Frage an den Vault | Obsidian CLI, Notion MCP, Read | Karpathy |
| 8 | `/ideas` | Weekly | Verstreute Gedanken thematisch kondensieren | Obsidian CLI, Grep, Read | Vin, Karpathy |
| 9 | `/ghost` | Weekly | Entwurf in Buraks Stimme generieren | Read, Write, Obsidian CLI | Vin, Kashef |
| 10 | `/drift` | Weekly | Reflexionsfragen und Annahmen hinterfragen | Read, Obsidian CLI, Grep | Vin |
| 11 | `/vault-setup` | Once | Vault-Struktur + Templates + CLAUDE.md initialisieren | Bash, Write, Obsidian CLI | Kashef, Vin |
| 12 | `/graduate` | Maintenance | Notiz befoerdern: _inbox -> areas, _drafts -> vault | Bash, Read/Edit, Obsidian CLI | Vin, Ango |
| 13 | `/session-end` | Per Session | Session-Abschluss: Decisions, Learnings, Open Loops | Write, Edit, Notion MCP | Cole Medin, Chase |
| 14 | `/vault-stats` | Weekly | Vault-Metriken und Wachstums-Dashboard | Obsidian CLI, Bash, Grep | Vin, Karpathy |

---

## Naming Conflicts with Existing Skills

The following names are already in use and must NOT be reused for the vault project:

| Name | Owner | Conflict? |
|------|-------|-----------|
| `/scan` | Finance Agent | No conflict — vault uses `/ingest` instead |
| `/check` | Finance Agent | No conflict — vault uses `/today` instead |
| `/draft` | Finance Agent | No conflict — vault uses `/ghost` instead |
| `/status` | Finance Agent | No conflict — vault uses `/vault-stats` instead |
| `/triage` | Finance Agent | No conflict |
| `/log` | Finance Agent | No conflict — vault uses `/session-end` instead |
| `/ingest-talk` | Orchestrator | Potential overlap — vault's `/ingest` is broader but different scope |

Resolution: Each project has its OWN `.claude/commands/` directory. Claude Code resolves commands per-project, so `/today` in the vault project is separate from `/check` in the Finance Agent. No actual naming conflicts exist at the filesystem level.

---

## Trust Boundary Design

Following the Steph Ango middle ground (from the synthesis):

| Zone | Directory | Written by | Trust Level |
|------|-----------|------------|-------------|
| **Human-curated** | `journal/`, `projects/`, `areas/`, `people/` | Burak only | HIGH — agent reads, never writes (except `/session-end` appending to daily notes) |
| **Agent-generated** | `_inbox/`, `_drafts/`, `_meta/` | Agent (via `/ingest`, `/ghost`, `/lint`) | MEDIUM — requires human review before promotion |
| **Promoted** | Any main directory | Burak (via `/graduate`) | HIGH — human-reviewed agent output |

The underscore prefix (`_inbox/`, `_drafts/`, `_meta/`) visually signals "agent territory" vs. human-curated content.

---

## Implementation Order

**Phase 1 — Foundation (first session):**
1. `/vault-setup` — without this, nothing else works
2. `/ingest` — start populating the vault
3. `/lint` — validate vault health from day one

**Phase 2 — Daily Workflow (second session):**
4. `/today` — the daily driver
5. `/context` — the knowledge retrieval primitive
6. `/session-end` — close the learning loop

**Phase 3 — Intelligence (third session):**
7. `/connect` — find hidden relationships
8. `/query` — ask questions, get answers
9. `/ghost` — write in Burak's voice

**Phase 4 — Maintenance & Reflection (fourth session):**
10. `/graduate` — note lifecycle management
11. `/ideas` — idea aggregation
12. `/trace` — decision archaeology
13. `/drift` — assumption challenging
14. `/vault-stats` — growth tracking

---

## Prerequisites

1. **Obsidian CLI** must be installed: `brew install obsidian-cli` (or via npm). Verify with `obsidian-cli --version`.
2. **kepano/obsidian-skills** should be cloned into the project for reference: these teach the agent the full Obsidian CLI syntax.
3. **Vault path** must be configured in the vault project's `CLAUDE.md`.
4. **Notion MCP** is optional but recommended for `/today` and `/session-end` (cross-system integration).
