# Claude Code Turned Obsidian Into My Dream Second Brain

> **Mark Kashef — YouTube, 2026-04-04**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=2kbINqpluM0 |
| Speaker | Mark Kashef, YouTuber / Creator ([@Mark_Kashef](https://www.youtube.com/@Mark_Kashef)) |
| Event | YouTube (Mark Kashef channel) |
| Duration | ~00:20 |
| Date | 2026-04-04 |
| Topics | obsidian, claude-code, second-brain, skills, para |

---

## Burak's Notes

> *Noch offen -- nach dem Anschauen ergaenzen.*

---

## Key Takeaways

1. **Kontext bestimmt Output-Qualitaet** — Statt dem Modell jedes Mal den eigenen Hintergrund zu erklaeren, bettet man es via CLAUDE.md und memory.md in das bestehende Wissenssystem ein. Nach ~20 Sessions versteht Claude die eigene Domain besser als man selbst bewusst weiss.
2. **Slash Commands als wiederholbare Workflows** — Jeder mehrstufige Workflow (Voice-Note-to-Newsletter, Vault-Setup, Gap Analysis) kann als Skill-Datei persistiert und per `/skill-name` abgerufen werden. Das macht Automatisierung ohne Code moeglich.
3. **Hierarchische CLAUDE.md-Dateien** — Root-Level fuer systemweiten Kontext plus ordnerspezifische CLAUDE.md fuer lokale Anweisungen. Das skaliert Kontext ohne Token-Overhead.
4. **Agenten-unabhaengige Architektur** — Markdown-first, lokale Speicherung, kein Lock-in. Obsidian-Vaults funktionieren mit jedem zukuenftigen KI-Tool, das Dateisystemzugriff hat.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Direkt anwendbar: Hierarchische CLAUDE.md nutzen wir bereits, Slash Commands als Skills ebenso. Die PARA-Struktur ist ein valides Modell fuer den Orchestrator. |
| **Actionable** | 8/10 | Konkrete Patterns: "Aktiver Kontext"-Sektion in CLAUDE.md, Halluzinations-Constraints in Templates, Gap Analysis auf Glaeubiber-Daten, weitere Workflow-Skills. |

---

## Summary

Mark Kashef demonstriert, wie Claude Code und Obsidian zusammen ein KI-gestuetztes Second Brain bilden. Die Kernthese: Output-Qualitaet haengt vom Kontext ab, nicht vom Modell. Statt jede Session bei Null zu starten, bettet man Claude in das eigene Wissenssystem ein -- ueber eine hierarchische CLAUDE.md (das "Betriebshandbuch" fuer die KI) und eine memory.md fuer Session-Kontinuitaet.

Die empfohlene Vault-Struktur folgt dem PARA-Prinzip (Projects, Areas, Resources, Archive) mit flacher Hierarchie und beschreibenden Dateinamen, um Token-Overhead zu minimieren. Zentral ist die Idee, wiederkehrende Workflows als Slash Commands zu persistieren: Man fuehrt einen Workflow einmal mit Claude durch, laesst eine SOP erstellen, und Claude generiert daraus eine Skill-Datei, die permanent abrufbar ist.

Ueber MCP-Integration bindet Kashef externe Tools wie Things3 und Tana an, sodass Vault, Task-System und Capture-Plattform als ein Oekosystem funktionieren. Er betont Limitierungen: Context Ceiling bei grossen Vaults erfordert explizites Path-Scoping, und veraltete CLAUDE.md-Dateien produzieren fehlkalibrierte Antworten ("Document Drift").

Das begleitende Starter Kit (Gumroad, kostenlos) enthaelt einen `/vault-setup` Skill sowie Obsidian Agent Skills von Kepano.

---

## Notable Quotes

> "Context determines output quality" — Kernthese des gesamten Talks

> "Modify your CLAUDE.md so you avoid [specific mistake]" — Zur dynamischen Mid-Conversation-Anpassung des Kontextdokuments

> "Do not include anything I didn't write" — Halluzinations-Constraint fuer Note Synthesis

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://markkashef.gumroad.com/l/second-brain-obsidian-claude-code | Starter Kit mit /vault-setup Skill und Kepano Obsidian Agent Skills -- konkrete Skill-Dateien zum Referenzieren | `/ingest-article` |
| https://www.geeky-gadgets.com/obsidian-claude-second-brain/ | Kompakte Zusammenfassung mit zusaetzlichen Perspektiven | `/ingest-article` |
| https://noahvnct.substack.com/p/how-to-build-your-ai-second-brain | Erweiterte Anleitung mit Setup-Details | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Obsidian | Markdown-basierter Knowledge Manager, Basis des Second Brain | No |
| Claude Code | KI-Agent mit Dateisystemzugriff, Slash Commands, CLAUDE.md | No (eigene Nutzung) |
| Things3 | Task-Manager, via MCP angebunden | No |
| Tana | Capture-System mit Voice Notes und Tags, via MCP angebunden | No |
| Kepano Obsidian Agent Skills | Von Kepano erstellte Skills fuer Obsidian-Workflows, im Starter Kit enthalten | No |
| PARA Method | Organisationssystem (Projects, Areas, Resources, Archive) von Tiago Forte | No |

---

## Action Items

- [ ] "Aktiver Kontext"-Sektion in Finance Agent CLAUDE.md einfuehren
- [ ] Halluzinations-Constraints in E-Mail-Draft Templates einbauen
- [ ] Gap Analysis Skill fuer Glaeubiber-Daten erstellen (`/gap-analysis`)
- [ ] Weitere Workflow-Skills: `/mahnung-check`, `/frist-update`, `/glaeubiger-status`
- [ ] Kepano Obsidian Agent Skills aus Starter Kit evaluieren
