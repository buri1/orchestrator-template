# How the CEO of Obsidian Takes his Notes (Underrated Genius)

> **Steph Ango (kepano, Obsidian CEO) — Karlos Obsidian Tutorials, ~Nov/Dec 2025**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=Dq3R3uS0sQ4 |
| Speaker | Steph Ango (kepano), CEO of Obsidian MD |
| Event | Karlos Obsidian Tutorials (YouTube: @TimeGardenObsidian) |
| Duration | 00:32 |
| Date | ~2025-12 |
| Topics | obsidian, pkm, note-taking, vault-design, file-over-app, markdown, fractal-journaling, properties, templates |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **"File Over App" as survival principle** — Notes are plain-text Markdown files that exist independently of any application. The data outlives every tool. This philosophy directly aligns with our preference for portable, version-controlled formats over proprietary databases.

2. **Properties replace folders as the primary organizer** — YAML frontmatter (dates, people, themes, locations, ratings) replaces deep folder hierarchies. A single note can belong to unlimited categories through properties and links, solving the forced single-classification problem that folders create.

3. **Templates collapse decision fatigue into zero-cost consistency** — Nearly every note starts from a template that pre-fills required properties. Combined with custom hotkeys (e.g., Alt+Shift+N for unique notes), the system makes capture nearly frictionless.

4. **Fractal journaling builds review loops at every time scale** — Daily capture, multi-day review, weekly to-do, monthly reflection, quarterly random-note sessions, and yearly 40-question reviews. The layered cadence prevents the vault from becoming a write-only data graveyard.

5. **An 8-rule personal style guide eliminates hundreds of future decisions** — One vault, minimal folders, standard Markdown only, plural categories/tags, extensive linking (first mention), ISO dates, 7-point rating scale, one weekly to-do list. Having explicit conventions documented makes every new note faster and more consistent.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | The "properties over folders" principle maps directly to how we structure metadata in our orchestrator catalogue and Notion databases. The fractal journaling cadence is a useful model for our own review rhythms (session logs, devlogs, retrospectives). The "File Over App" philosophy validates our Markdown-first, git-backed approach to knowledge storage. |
| **Actionable** | 8/10 | Concrete patterns we can adopt: (1) standardize YAML frontmatter properties across all catalogue entries for richer cross-referencing, (2) implement a periodic random-revisit workflow for the research catalogue to surface forgotten insights, (3) create a personal style guide document that codifies our naming, tagging, and rating conventions, (4) evaluate composable templates for different note types. The 7-point rating scale and "first mention linking" rules are directly applicable. |

---

## Summary

The video by Karlos Obsidian Tutorials deconstructs how Steph Ango (kepano), CEO of Obsidian, organizes his personal knowledge vault. Despite running the company behind one of the most powerful note-taking tools, Ango's system is remarkably minimal -- just five top-level folders (References, Clippings, Daily notes, Templates, Attachments) with everything else living at the vault root.

The core philosophy is "File Over App": notes are plain-text Markdown files that belong to the user, not to any application. This principle drives every design decision. Instead of organizing through folder hierarchies (which force artificial single-classification), Ango uses YAML properties (frontmatter) as the primary organizational layer. Properties like dates, people, themes, locations, and ratings allow a single note to exist in multiple contexts simultaneously. Dataview queries then generate dynamic overview pages from these properties.

Templates are the consistency engine. Nearly every note type (meetings, people, books, movies, evergreen notes) has a dedicated template that pre-fills the required properties. Combined with custom hotkeys, the time from "I have a thought" to "it's captured with full metadata" approaches zero. The system is designed for speed and laziness -- every avoidable decision has been eliminated.

The review system follows a fractal pattern across time scales: daily capture of unique notes, multi-day review of recent entries, weekly to-do lists (not daily), monthly high-level reflections, quarterly random-note sessions to rediscover old ideas, and an annual 40-question review. This layered cadence ensures that knowledge compounds rather than decays. Ango also maintains a personal 8-rule style guide that standardizes conventions (plural tags, ISO dates, 7-point ratings, first-mention linking), collapsing hundreds of micro-decisions into documented rules.

The video's presenter (Karlos) argues that Ango's system appears deceptively simple but reveals sophisticated knowledge synthesis upon closer inspection. The key insight is that minimalism in structure enables emergence in connections -- the fewer rigid categories you impose, the more organic and valuable the link network becomes over time.

---

## Notable Quotes

> "Having a consistent style collapses hundreds of future decisions into one and gives you focus."

> "File Over App" — Steph Ango's core principle: notes are files that outlive any application.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://stephango.com/vault | Ango's primary blog post detailing his vault structure -- the canonical source material | `/ingest-article` |
| https://github.com/kepano/kepano-obsidian | Downloadable vault template with all templates, properties, and structure ready to use | `/ingest-repo` |
| https://x.com/kepano/status/1896622716905726095 | Thread on fractal journaling with additional detail beyond the video | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Obsidian | The application Ango built and uses for his PKM system | No |
| Dataview Plugin | Used for dynamic category overview pages generated from YAML properties | No |
| Minimal Theme | Obsidian theme created by Ango (kepano) himself, mentioned as his default | No |

---

## Action Items

- [ ] Define a standardized YAML frontmatter schema for orchestrator catalogue entries (properties over folders principle)
- [ ] Implement a "random revisit" mechanism -- periodic surfacing of older catalogue entries for re-evaluation
- [ ] Create a personal style guide for the orchestrator knowledge base (naming, tagging, rating conventions)
- [ ] Evaluate the 7-point rating scale as a replacement/complement to our current relevance/actionable scoring
- [ ] Download and review the kepano-obsidian vault template for transferable structural patterns
- [ ] Consider "first mention linking" as a convention for cross-referencing between catalogue entries
