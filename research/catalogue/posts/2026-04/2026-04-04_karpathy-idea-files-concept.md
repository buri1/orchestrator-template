# Karpathy Follow-Up: "Idea Files" — Share the Idea, Not the Code

> **@karpathy — 2026-04-04**

| Field | Value |
|-------|-------|
| Source | [Follow-Up Tweet (Apr 4)](https://x.com/karpathy/status/2040470801506541998) / [Original Tweet (Apr 3)](https://x.com/karpathy/status/2039805659525644595) / [GitHub Gist: llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) |
| Author | @karpathy — Andrej Karpathy, ex-Tesla AI Director, OpenAI co-founder |
| Date | 2026-04-04 |
| Topics | idea-files, llm-agents, code-sharing, karpathy |
| Type | Thread (two posts + Gist) |

---

## Burak's Notes

> Karpathy follow-up zum viralen "LLM Knowledge Bases"-Post. Das "Idea File"-Konzept ist der eigentliche Paradigmenwechsel: Man teilt nicht den Code oder die fertige App — man teilt die Idee als Markdown, und LLM-Agenten implementieren sie. Hat direkte Relevanz für unseren Orchestrator und wie wir Templates/Patterns distribuieren.

---

## Key Takeaways

1. **Idea Files als neues Sharing-Primitive** — Statt GitHub-Repos oder npm-Packages teilt man ein Markdown-Dokument, das die High-Level-Idee kommuniziert. Der LLM-Agent des Empfängers baut die spezifische Implementierung in Kollaboration mit dem User.
2. **Markdown wird zum Interface zwischen Mensch und AI** — Karpathy's Entwicklungslinie (Vibe Coding → Autoresearch → Agentic Engineering → Idea Files) zeigt konsistent: Markdown verdrängt Code als primäres Austauschformat in der Agent-Ära.
3. **LLM Wiki als RAG-Alternative** — Statt bei jeder Query Wissen aus Rohdokumenten neu zusammenzusetzen, baut das LLM inkrementell ein persistentes Wiki mit drei Schichten: Raw Sources, Wiki Pages, Schema (CLAUDE.md). Drei Kernoperationen: Ingest, Query, Lint.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Direkt anwendbar auf unsere Agent-Architektur — CLAUDE.md ist bereits die Schema-Schicht, context/ ist kompiliertes Wissen. Das Idea File-Format könnte Template für Orchestrator-Pattern-Sharing werden. |
| **Actionable** | 7/10 | Ingest/Query/Lint-Zyklus und index.md + log.md Tracking sind sofort implementierbar. Idea File-Format als Katalog-Template evaluieren. |

---

## Full Content

### Post 1 — "LLM Knowledge Bases" (Apr 3, 2026)

Karpathy beschreibt einen fundamentalen Shift: Er investiert Token-Nutzung zunehmend in Wissensmanagement statt Code-Manipulation.

> "A large fraction of my recent token throughput is going less into manipulating code, and more into manipulating knowledge."

Ca. 100 Artikel mit 400.000+ Wörtern in persönlichen Wikis, die von LLMs verwaltet werden.

### Post 2 — "Idea File" Follow-Up (Apr 4, 2026)

Referenziert die virale Reaktion und teilt das "Idea File"-Konzept als GitHub Gist. Kernthese: In der Ära von LLM-Agenten teilt man nicht den Code — man teilt die Idee.

> "This is an idea file, it is designed to be copy pasted to your own LLM Agent (e.g. OpenAI Codex, Claude Code, OpenCode / Pi, or etc.). Its goal is to communicate the high level idea, but your agent will build out the specifics in collaboration with you."

### Paradigmenwechsel-Tabelle

| Alte Welt | Neue Welt (Idea Files) |
|---|---|
| Code teilen (GitHub repos, npm packages) | Idee teilen (Markdown-Dokument) |
| Spezifische Implementierung | Abstraktes Pattern + Prinzipien |
| Fork & modify | Copy-paste in Agent, co-evolve |
| README erklärt wie man es nutzt | Idea File erklärt was das Konzept ist |
| Gebunden an Tech-Stack | Stack-agnostisch |

### LLM Wiki — Drei Schichten

1. **Raw Sources** (`raw/`) — Kuratierte Quelldokumente. Immutable. LLM liest, modifiziert nie.
2. **Das Wiki** (`wiki/`) — LLM-generierte Markdown-Dateien: Summaries, Entity Pages, Concept Pages, Cross-References.
3. **Das Schema** (z.B. `CLAUDE.md`) — Konfigurationsdokument, das dem LLM Struktur und Workflows definiert.

### Drei Kernoperationen

1. **Ingest** — Neue Quelle droppen, LLM verarbeitet: liest, diskutiert, schreibt Summary, updated Index + Entity/Concept Pages.
2. **Query** — Fragen gegen Wiki stellen. Gute Antworten werden zurück ins Wiki gefilet.
3. **Lint** — Periodischer Health-Check: Widersprüche, veraltete Claims, Orphan Pages, fehlende Cross-References.

### Warum es funktioniert

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping."

Karpathy referenziert Vannevar Bush's Memex (1945) — ein persönlicher Wissensspeicher mit assoziativen Trails. Bush konnte das Maintenance-Problem nicht lösen. Das LLM erledigt das jetzt.

---

## Notable Replies

> **@lexfridman**: Bestätigte ähnliches Setup, ergänzt durch dynamische HTML-Visualisierung und temporäre Mini-Knowledge-Bases für Voice-Mode beim Laufen.
> *Validierung durch prominenten Practitioner; zeigt zusätzliche Modalitäten (Voice + HTML-Viz).*

> **@StephAngo (Obsidian CEO)**: Betonte "Contamination Mitigation" — persönliche Vaults clean halten, Agent-Content in separaten Vaults.
> *Wichtige Gegenposition: Mischung von menschlichem und LLM-generiertem Wissen als Risiko.*

> **@VamshiReddy**: "Every business has a raw/ directory. Nobody's ever compiled it. That's the product." Karpathy stimmte zu.
> *Potenzielle Produktkategorie: kompiliertes Unternehmenswissen als Service.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| [GitHub Gist: llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) | Full Idea File mit Architektur-Details, Schema-Beispielen, Tooling-Empfehlungen | `/ingest-article` |
| [VentureBeat Coverage](https://venturebeat.com/data/karpathy-shares-llm-knowledge-base-architecture-that-bypasses-rag-with-an) | Mainstream-Perspektive auf die RAG-Alternative | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Obsidian | Empfohlen als IDE mit Web Clipper, Graph View, Marp, Dataview | Yes — omarsar0-personal-knowledge-base-agents-obsidian.md |
| qmd | Lokale Markdown-Suchmaschine (BM25/Vector, CLI + MCP Server) | No |
| Claude Code | Genannt als Target-Agent für Idea File copy-paste | Yes |
| OpenAI Codex | Genannt als Target-Agent für Idea File copy-paste | Yes — nummanali-codex-plugin-claude-code.md |
