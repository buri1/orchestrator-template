# Claude-Obsidian

> **Claude + Obsidian knowledge companion. A persistent, compounding wiki vault that auto-organizes notes, cross-references entities, and maintains session memory across conversations. Based on Karpathy's LLM Wiki pattern.**

| Field | Value |
|-------|-------|
| Category | Integration / Second Brain |
| Repository | [github.com/AgriciDaniel/claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) |
| GitHub Stars | 743 (as of 2026-04-04) |
| Forks | 71 |
| Publisher | Agrici Daniel — solo developer, builds Claude Code plugins (claude-seo, claude-ads, claude-blog, claude-canvas) |
| License | MIT |
| Tech Stack | Shell (setup scripts), Claude Code plugin system, Obsidian (Bases, Templater, Local REST API), MCP (optional), CSS snippets |
| Maturity | 🟢 Active / Growing (created 2026-04-07, 743 stars in first week, active development) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/5 | Directly implements the "Second Brain" layer we need for Mission Control. Our orchestrator already generates research, devlogs, and session state -- claude-obsidian provides the structured knowledge vault to persist and cross-reference all of it. The cross-project CLAUDE.md pattern (point any project at the vault) mirrors our multi-business architecture. |
| **Novelty** | 4/5 | The Karpathy LLM Wiki pattern itself is known, but the full implementation -- hot cache for session continuity, 8-category vault lint, autonomous research loops, batch parallel ingestion, and Claude Code plugin distribution -- goes well beyond any existing Obsidian AI integration. |
| **Actionable** | 5/5 | Can be installed today as a Claude Code plugin (`claude plugin install`) or cloned as a vault. The cross-project pattern (add vault path to any project's CLAUDE.md) is immediately adoptable for our orchestrator. Zero custom code required. |

---

## Overview

claude-obsidian turns Obsidian into an autonomous knowledge engine driven by Claude Code. Unlike typical Obsidian AI plugins that merely chat about existing notes, this system creates, organizes, maintains, and evolves notes without manual filing.

The core workflow:

1. **Ingest**: Drop sources (files, URLs, PDFs). Claude reads them, extracts entities and concepts, creates 8-15 wiki pages per source, updates the master index and cross-references.
2. **Query**: Ask questions. Claude reads the hot cache (recent context), scans the index, drills into relevant pages, and synthesizes answers citing specific wiki pages -- not training data.
3. **Lint**: Claude finds orphans, dead links, stale claims, missing cross-references, and suggests fixes. 8-category health check.
4. **Hot Cache**: At session end, Claude updates `wiki/hot.md` with a summary of recent context. Next session starts with full continuity.

The vault supports 6 modes (Website, GitHub, Business, Personal, Research, Book/Course) that can be combined.

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│  Claude Code (or Gemini/Codex/Cursor/etc.)   │
│  Commands: /wiki /save /autoresearch /canvas │
├──────────────────────────────────────────────┤
│  Skills Layer (10 skills)                    │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │wiki-ingest│ │wiki-query│ │ wiki-lint   │  │
│  │(parallel) │ │(cache→   │ │ (8 checks)  │  │
│  │           │ │ index→   │ │             │  │
│  │           │ │ drill)   │ │             │  │
│  ├──────────┤ ├──────────┤ ├─────────────┤  │
│  │  /save   │ │autoresrch│ │  /canvas    │  │
│  │          │ │(3-round) │ │(via claude- │  │
│  │          │ │          │ │  canvas)    │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
├──────────────────────────────────────────────┤
│  Obsidian Vault                              │
│  wiki/                                       │
│  ├── index.md      (master catalogue)        │
│  ├── hot.md        (session continuity)      │
│  ├── log.md        (append-only ops log)     │
│  ├── overview.md   (executive summary)       │
│  ├── concepts/     (extracted concepts)      │
│  ├── entities/     (extracted entities)      │
│  ├── sources/      (ingested source refs)    │
│  └── meta/                                   │
│      ├── dashboard.base  (Bases dashboard)   │
│      └── dashboard.md    (Dataview fallback) │
├──────────────────────────────────────────────┤
│  MCP (optional)                              │
│  Option A: Local REST API plugin (port 27124)│
│  Option B: Filesystem-based (mcpvault)       │
└──────────────────────────────────────────────┘
```

**Key design decisions:**
- **Hot cache pattern**: `wiki/hot.md` persists recent context between sessions, eliminating "where were we?" startup cost
- **Append-only log**: `wiki/log.md` records every operation for auditability
- **Entity/concept extraction**: Every ingested source generates structured wiki pages with cross-references, not just raw notes
- **Contradiction flagging**: `[!contradiction]` callouts when new sources conflict with existing wiki content
- **Multi-agent batch ingestion**: Parallel agents for processing multiple sources simultaneously
- **Plugin distribution**: Installable via Claude Code's plugin marketplace (`claude plugin install`)

---

## Publisher Background

Agrici Daniel is building a suite of Claude Code plugins focused on content and knowledge workflows: claude-obsidian (knowledge vault), claude-canvas (visual layer), claude-seo, claude-ads, and claude-blog. He runs an AI Marketing Hub community on Skool with 2,800+ members. The project gained 743 stars within its first week, indicating strong market demand for Claude + Obsidian integration. The blog post "I Turned Obsidian Into a Self-Organizing AI Brain" provides a detailed deep-dive with data visualizations and competitor analysis.

---

## What's Valuable for Us

1. **Cross-project knowledge base pattern**: The technique of pointing any Claude Code project at a shared Obsidian vault via `CLAUDE.md` (read `wiki/hot.md` first, then index, then drill) is directly applicable to our multi-business orchestrator. Every agent session could read from and write to a shared knowledge vault.

2. **Hot cache for session continuity**: Our orchestrator loses context on compaction. The hot cache pattern (`hot.md` = compressed recent context, updated at session end via hooks) is a battle-tested solution we could adopt for `orchestrator-tmux-state.json` or devlog summaries.

3. **Structured ingestion pipeline**: We already ingest research (bookmarks, X posts, articles) into the catalogue. claude-obsidian's entity/concept extraction + cross-referencing is a more sophisticated version of what our `/research-librarian` does. The 8-15 wiki pages per source approach with automatic backlinking is worth studying.

4. **Vault lint / health checks**: 8-category lint (orphans, dead links, gaps, stale claims) is a maintenance pattern we lack for our research catalogue. Our INDEX.md and ADOPTABLE-PATTERNS.md could benefit from automated cross-reference checking.

5. **Session hooks**: The `hooks.json` (SessionStart + Stop) that auto-update the hot cache is the same pattern as our `.bmad/scripts/orchestrator-session-start.sh` and `orchestrator-handoff.sh`. Compatible architecture.

6. **Autoresearch loop**: 3-round autonomous research with gap-filling is a more structured version of our research agent spawning. The configurable `program.md` (what sources to prefer, confidence scoring, max rounds) is a pattern we could adopt for research agent prompts.

---

## What's NOT Relevant

- **Obsidian plugin ecosystem details** (Calendar, Thino, Excalidraw, Banners): We don't use Obsidian as our primary UI. The vault structure and Claude integration patterns are what matter, not the Obsidian-specific plugins.
- **CSS snippets**: Cosmetic vault customization is irrelevant to our headless orchestrator.
- **Canvas companion** (claude-canvas): Visual presentations via Obsidian canvas are tangential to our mission-critical workflows.
- **Setup wizard** (`/wiki` bootstrap): We already have our own scaffolding. The bootstrap UX is not transferable.

---

## Comparison with Our Stack

| Aspect | claude-obsidian | Our Orchestrator |
|--------|----------------|------------------|
| Knowledge persistence | Obsidian vault with hot cache | `_bmad/` state files + devlog |
| Ingestion | Entity/concept extraction, 8-15 pages per source | `/research-librarian` + ingest-discoveries JSON |
| Cross-referencing | Automatic backlinks, contradiction flagging | Manual INDEX.md curation |
| Session continuity | `hot.md` via hooks | `orchestrator-handoff.sh` compaction |
| Health checks | 8-category lint | None (manual review) |
| Multi-agent | Parallel batch ingestion agents | tmux workers (max 6) |
| Distribution | Claude Code plugin marketplace | Git clone + shell scripts |

---

## Future Use Cases

- **Immediate**: Install claude-obsidian as a personal second brain for Burak's research, client notes, and meeting prep. Point it at the existing `_bmad/` research outputs.
- **Short-term (1-2 weeks)**: Adopt the hot cache pattern for orchestrator session continuity. Add a `hot.md`-equivalent to `_bmad/` that gets updated by the handoff hook.
- **Medium-term (1 month)**: Evaluate using an Obsidian vault as the unified knowledge layer that all orchestrator agents (research, development, client work) read from and write to.
- **Long-term**: Build a cross-project knowledge graph where OmniPort-HH, venture-spine, and other projects all share context through a single wiki vault -- the "Mission Control Second Brain" vision.

---

## Key Takeaway

> **claude-obsidian solves the "knowledge compounds but context windows don't" problem with a hot cache + structured wiki + automated cross-referencing pattern. The cross-project vault technique (shared CLAUDE.md reference) is immediately adoptable and directly enables our Mission Control / Second Brain architecture. Install it, point the orchestrator at it, and every agent session builds on every previous one.**
