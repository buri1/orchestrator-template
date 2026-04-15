# Delta Check: Content & Code Pipeline — 2026-04-05 bis 2026-04-12

**Datum:** 2026-04-12
**Baseline:** `_bmad/research/DISCOVERY-MASTER-CONTENT-VOICE-STRATEGY.md` (2026-04-05)
**Zeitraum:** 7 Tage
**Methode:** git log + mtime-Scan + Content-Keyword-Grep pro Scope

---

## Summary — Was hat sich in 7 Tagen bewegt?

Sehr ungleich verteilt. **Die Voice-AI- und Content-Repos sind eingefroren** — kein einziger Commit in coldyAI, LivekitDemo, production-app, CraftCodeWebsite, ContentOS, Finance-agent oder ultravox-demo seit dem 5. April. OmniPort-HH ist nach Meeting 2 (01.04.) ebenfalls auf Eis.

**Wo es gerollt ist:**
1. **Mission Control v2** ist komplett **neu gebootstrapt** (Initial Commit 12.04. 01:31, 4 Commits in 47 Minuten) — eigene Repo, VISION, BACKLOG, data-schema, anti-slop Playbook.
2. **Research Catalogue** hat einen **Mega-Ingest-Wave am 11.04.** erhalten — 47 neue `ingest-discoveries`, ~24 neue AIE-Europe/April-Talks, 8 neue practitioner x-activity Profile (ctatedev, doodlestein, jennyzhangzt, mitchellh, noahzweben, omarsar0, scobleizer, trq212), 2 neue `posts/2026-04/` Einträge.
3. **Content-Strategie-relevante Talks** dazugekommen: Theo Browne "Pi-pilled", Amol Avasare (Anthropic Growth), Jesse Frimpong (Shopify+Claude Content), plus IndyDevDan und Greg Isenberg am 01./02.04.

**Strategisch relevant:** Noahzweben **Monitor Tool** (09.04., ingest candidate, 10/10 relevance) und trq212 **`/ultraplan`** (10.04., 10/10) — beides direkt orchestrator-relevant, nicht content-strategie-relevant. Das April-5-Discovery **bleibt vollständig gültig** für Voice-AI-Assets, wird aber um das Mission-Control-v2-Stück erweitert (neue strategische Klammer über Voice/Content/Finance).

---

## Repo-Änderungen (nur Delta)

### ColdyAI — nichts neu
- Letzter Commit: 2025-11-25 (5 Monate alt).
- Kein Change im Working Tree seit 2026-04-05.
- **Invalidation:** keine. Status "95% fertig, braucht ENV" gilt unverändert.

### LivekitDemo — nichts neu
- Letzter (einziger!) Commit: 2025-06-23 "First commit".
- Keine neuen Demo-Files, keine neuen Client-Varianten.
- **Korrektur gegenüber Discovery:** Discovery behauptet "letzter Commit Sep-Okt 2025" — tatsächlich hat das Repo nur *einen* Commit von Juni 2025 im git log. Lokale Files sind uncommitted. Sollte aufgeräumt werden, aber keine neue Arbeit seit Apr 5.

### production-app — nichts neu
- Letzter Commit: 2025-11-25 (Silent Observer / Scribe Mode).
- Epic 4 / Epic 5 Stand unverändert seit Baseline.
- Nichts seit Apr 5.

### CraftCodeWebsite — nichts neu
- Ordner ist kein git-Repo (wird in Baseline behauptet, Discovery-Info ist unscharf).
- Keine mtime-Änderungen in `craftcodeaiwebsite/` oder `craftcodewebsite-fromscratch/` seit Mai 2025.

### ContentOS — nichts neu
- CLAUDE.md zuletzt 04.04. geändert, Verzeichnis sonst seit März statisch.
- Kein Commit seit Apr 5 (Working Tree clean).

### Finance-agent — nichts neu
- Kein Unterordner unter `~/Desktop/code2/` gefunden. Existiert möglicherweise unter anderem Pfad (`Finance-agent-main`?) — nicht verifizierbar im Delta-Scope.

### OmniPort-HH — nichts neu
- Letzter Commit: 2026-04-01 14:26 (Moderation-Bulk-Approve). Meeting 2 war 01.04., danach eingefroren.
- Keine Commits zwischen 05.04. und 12.04.
- **Content-Strategie-Implikation:** OmniPort bleibt das sichtbare Referenzprojekt für "echte Ausschreibung → ausgeliefert", ist aber kein Content-Funnel. Unverändert gültig.

### ultravox-demo / gptrealtime / craftcodedashboard — nichts neu
- Außerhalb des direkten Delta-Scopes, aber per mtime-Spotcheck ebenfalls eingefroren.

### Mission Control v2 — BRAND NEW, nicht in Baseline
- **Pfad:** `/Users/buraksmac/Desktop/code2/missioncontrole/` + private GitHub `buri1/mission-control`.
- **4 Commits** seit Initial Commit 12.04. 01:31:
  1. `3922aeb` — Initial commit: Mission Control v2 bootstrap
  2. `2f8fee9` — docs: capture Notion hub structure + data schema + explicit Kanban
  3. `0f2fdde` — schema: add universal source-tracking pattern for every table
  4. `0fc3915` — research: 3 parallel agents produce anti-slop implementation playbook
- **Stack gelockt:** Next.js latest + SQLite (better-sqlite3 + Drizzle) + shadcn/ui + Tailwind v4 + Claude Code headless als Agent-Runtime. Local-first, single-user, `localhost:3000`.
- **5 MVP-Module:** Übersicht, Projekte (Kanban), Finanzen, Content-Planer (Kanban, Theo-T3GG-style), Agent-Chat.
- **Relevanz für Content-Strategie:**
  - **Content-Planer ist ein MVP-Modul.** Erstes Mal, dass Burak einen dedizierten Content-Workflow lokal bauen will — trennt sich von MAYTT (cousin-facing) und wird zu seinem eigenen Personal Content Pipeline.
  - **Notion-Hubs für Ingest** (Phase 2) enthalten *CraftCode AI Agency*, *Buraks Lab*, *Finance Agent*, *Genmedia Agency* — alle 4 sind Content/Brand-Quellen, das geht über reine Projektverwaltung hinaus.
  - **Agent-Chat Cmd+J Side Panel** statt Chat-Bubble — Ästhetik ist gelockt ("Linear links, Sunsama rechts, Raycast Keybinds, Claude Artifacts im Agent Panel"). Das ist das erste Mal, dass Burak eine UI-Ästhetik dokumentiert, die direkt als Voice/Look für Content-Videos taugt ("das baue ich live").
- **Strategisch:** Mission Control v2 ist der neue **organisatorische Oberbau über Voice AI + Content + Finance + Client Work**. Das Discovery-Dokument vom 5. April hatte noch keine einheitliche Klammer — diese existiert jetzt.

---

## Research Catalogue — Zugänge relevant für Content/Voice

### Neue Practitioner-Profile am 11.04. (x-activity)
Alle am 11.04. 10:58–11:07 geschrieben. Das sind keine zufälligen 8 Handles — das ist ein geplanter Sweep über die Claude-Code-Harness-Autoritäten plus 2 research-Quellen. Für **Content-Strategie** relevant in absteigender Priorität:

| Handle | Content-Relevanz | Kernfund |
|--------|------------------|----------|
| **trq212** (Anthropic/Claude Code PM) | **Hoch** | 04-01 virtual viewport renderer rewrite (285K views). 04-08 non-technical streams proposal (180K views, direkt zur MAYTT-Cousin-Ali-Zielgruppe). 04-10 `/ultraplan` (765K views) — Plan-Web/Terminal-Handoff als Content-Format für Orchestrator-Storytelling. |
| **noahzweben** (Claude Code PM) | **Hoch** | 04-09 Monitor-Tool-Launch (1.08M views, 5.1K bookmarks). Event-driven statt poll-driven Agents — Content-Story "Wir haben bash sleep abgeschafft" direkt framebar. |
| **ctatedev** (Vercel) | Mittel | 03-27 agent-browser dashboard + 03-23 Generative TUI (216K views). Visual-Content-Goldmine für "so debuggt man Agents". |
| **omarsar0** (DAIR.AI) | Mittel | 04-03 LLM Knowledge Base Diagramm (1.54:1 bookmark/like ratio, 143K views) — pair mit Karpathy Idea Files für den "LLM Wiki als zweites Gehirn"-Content-Arc. |
| **doodlestein** (xf/cass) | Niedrig | 04-06 xf Rust CLI für X-Archive-Suche. Privacy-first Framing. |
| **mitchellh** (Ghostty) | Niedrig | 04-06 libghostty Kitty Graphics Protocol in tmux. Relevant für orchestrator-Demos mit Inline-Images, nicht direkt content. |
| **scobleizer** | Niedrig | 04-06 "autonomous web" Framing-Post — brauchbar als Soundbite. |
| **jennyzhangzt** | Niedrig | Nur 2026-03 (keine April-Aktivität erfasst). |

**Action:** trq212 und noahzweben sind content-ready Assets für Videos/Posts. Beide sind ingest-candidates aber noch nicht als Catalogue-Einträge angelegt. Das ist die erste Lücke, die content-wise geschlossen werden muss.

### Neue Posts in `research/catalogue/posts/2026-04/` (seit Apr 5)
Nur **2 neue Einträge** am 11.04.:

1. **`nichochar-the-great-convergence.md`** (9/10) — "Everyone is converging on the same agentic product". Direkter **Market-Thesis-Content**, quotable als Client-Framing ("selbst Linear/Notion bauen sich gerade zu Agent-Products um"). Für Content-Strategy relevant als *European-harness-moat*-Begründung.
2. **`omarsar0-llm-knowledge-base-diagram.md`** (9/10) — Elvis' Diagramm zu Karpathy's LLM Wiki Pattern. Ein-Image-Spec für die "research/catalogue/ ist das hier"-Story. Content-Hook: "Ich habe mein eigenes LLM Wiki mit Claude Code gebaut, hier das Diagramm dazu".

**Nicht neu** in `posts/2026-04/`: weder Hormozi, Isenberg noch Yawen Zhang tauchen in den Apr-5-Apr-12-Ingests auf.

### Neue Talks in `research/catalogue/talks/2026-04/` (seit Apr 5)
16 neue Markdown-Files — der Großteil ist AIE-Europe-Backfill (10.04. ingestiert, also nach 2026-04-05 geschrieben). Content/Voice/Creator-relevant:

| Datei | Datum | Relevanz |
|-------|-------|----------|
| **theo-browne-crashing-out-anthropic-pi-pilled.md** | 09.04. Podcast | **Zentral** — 1h21 TBPN Episode über Claude Code Source Leak, DMCA, Subscription-Economics, Pi-Agent Minimalismus. Theo ist der wichtigste englische Creator für das "Orchestrator-Thema" und Burak sollte wissen, dass er offen Claude Code kritisiert und Pi bewirbt. Direktes Content-Alignment-Problem: wenn Burak weiter "Claude Max = 18-36x Arbitrage" framt, muss er Theo's Gegenthese kennen. |
| **amol-avasare-anthropic-growth-claude-automation.md** | 05.04. Lenny's Podcast | **Hoch** — Anthropic Head of Growth erklärt CASH (Claude automatisiert Growth-Experimente). "Claude is growing itself." Direkte Bestätigung der "document-don't-create"-Thesis und der 70/30 big-bets-Regel. Soundbite für Content. |
| **jesse-frimpong-claude-ai-shopify-brand-scaling.md** | 03.04. YouTube | **Hoch** — e-commerce founder ($20M/7 brands) zeigt Chained Workflows mit Claude für Brand Voice, Copy, Ads. Ist inhaltlich genau das, was Burak für seine "Ich baue echte Produkte mit Agents"-Serie als B-Roll oder Referenz zitieren kann. |
| **sandipan-bhaumik-chaos-to-choreography-multi-agent-orchestration.md** | ~09.04. | Multi-Agent-Orchestration-Talk, nur mittel relevant für Content (technisch). |
| **ryan-lopopolo-extreme-harness-engineering-openai.md** | 09.04. | Harness-Engineering, orchestrator-thematisch, nicht content. |
| **letta-code-app-intro.md** | 09.04. | Letta Code App — Memory-Layer, orchestrator-thematisch. |
| **runway-gen1-video-to-video-ai.md** | 09.04. | Runway-Demo, **MAYTT-relevant** als Video-Generation-Baseline. |
| **web-dev-cody-2-ai-coding-strategies.md** | 11.04. | Creator-Content (Cody), mittlere Relevanz. |

**Plus 12 AIE-Europe Talks** (Radik, Matt Pocock, Sunil Pai, Malte Ubl, Gergely Orosz × swyx Token Maxing, Nick Taylor, Honor Solaz, K-Benji, Raia Hadsell, Peter Steinberger × 2, Vincent Kottsch, Frederick Vichowski, Sally Omali) — alle ingestiert 10.04. Die Inhalte waren im MEMORY.md Zusammenfassung schon erwähnt ("AIE Europe 2026 INGESTED"), aber **die MD-Files selbst sind post-05.04. geschrieben**. Für Content: der Gergely-Orosz-Swyx-Talk "Token Maxing" ist der wichtigste Soundbite ("2025 = token maxing, 2026 = not wasting them") — den sollte Burak wortwörtlich in mindestens ein Content-Piece übernehmen.

Zusätzlich im Parent-Ordner (nicht `talks/2026-04/` sondern `talks/`):
- `2026-04-04_mark-kashef-obsidian-dream-second-brain.md`
- `2026-04-04_rick-mulready-ai-system-claude-obsidian.md`
- `2026-04-01_felixba-ki-leben-satire-openclaw.md`

Diese drei wurden **am oder nach 04.04.** angelegt und liegen inhaltlich im Obsidian/Second-Brain-Thema — direkt im Content-Territorium "Agentic Engineering auf Deutsch" (felixba-ki-leben = Satire auf deutsch, **hochrelevantes Genre-Template** für Burak, wenn er deutschen Content macht).

### Neue Articles in `research/catalogue/articles/2026-04/` (seit Apr 5)
8 Files vom 11.04., alle technisch (AutoAgent, AutoKernel, Microsoft Aspire, GitHub Copilot Agentic Dev, Google Scion, Lilian Weng Why-We-Think, agentcraft side panel, x-tweet-fetcher script). **Keine direkte Content-Strategy-Relevanz** — das ist orchestrator-Research, nicht Content-Material.

### Neue Agent-Harnesses / Orchestration / Architecture Einträge (11.04.)
- `agent-harnesses/`: jackchen-open-multi-agent, openclaw-acpx, openai-symphony, hermes-wiki, openharness
- `orchestration-platforms/`: herdr, karpathytalk
- `computer-architecture-for-agents/`: komplette 9-teilige Serie (00–09) von Burak angelegt
- `agent-memory/garrytan-gbrain.md`

Das ist **der Karpathy-Wave + Architecture-Serie**, nicht content-relevant. Aber: die 9-teilige "Computer Architecture for Agents"-Serie ist *selbst* ein Content-Artefakt, das direkt als Newsletter-/Blog-Sequenz publiziert werden könnte. Das ist die größte unentdeckte Content-Opportunity im Delta.

---

## Neue Ingest-Discoveries (`_bmad/ingest-discoveries/`)

**47 neue JSON-Files** seit 2026-04-05. Die meisten sind Duplikate zu den oben gelisteten Catalogue-Einträgen (Ingest-Sidecar → MD-File). Content-spezifisch neu und *nicht* in der Apr-5-Baseline:

| Datei | Thema | Content-Hook |
|-------|-------|--------------|
| `anthropic-claude-growth-automation.json` | Amol Avasare Lenny's | "Claude grows itself" |
| `claude-shopify-brand-scaling.json` | Jesse Frimpong | Chained Prompts für Brand |
| `garrytan-gbrain.json` | Garry Tan PGLite Brain | 9/9/9 score, harness-skills split |
| `karpathy-self-improving-kb.json` + `karpathy-talk.json` | Karpathy KB/Talk | Direkte Referenz für LLM-Wiki-Content-Arc |
| `cclank-hermes-wiki.json` | Hermes Wiki | Community Wiki-Builder |
| `agentcraft-side-panel.json` | AgentCraft Side Panel | MC UI Referenz (nicht content aber ästhetik) |
| `video-3DNkDIVKtK8.json` | Theo Browne TBPN | s.o. |
| `video-CeOXx-XTYek.json` | unbekannt (prüfen wenn nötig) | tbd |
| `video-2czYyrTzILg.json` | unbekannt | tbd |
| `runway-gen1-intro.json` | Runway Gen1 | MAYTT-Video-Baseline |
| `letta-code-app-intro.json` | Letta Code App | Memory Layer |
| `ballred-obsidian-claude-pkm.json` | Obsidian PKM | Second-Brain-Content |

**Gezielte Keyword-Treffer (voice/content/hormozi/isenberg/indydevdan/creator/theo/yawen/zhang):**
- `theo-t3-code-claude.json` — Theo-Profil-Sidecar, existiert aber ohne Catalogue-MD-Pendant (Lücke)
- `indydevdan-pi-ceo-agents.json` — IndyDevDan Pi/CEO-Agents (bereits in Baseline als "talks/2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md" referenziert)
- `leeleepenkman-dictator-flow-voice-control.json` — Voice Control Flow
- `willowvoiceai-atlas1-stt-model.json` — Willow Voice AI STT
- `jennyzhangzt-hyperagents-dgm.json` — DGM Paper (already catalogued)
- Hormozi/Isenberg/Yawen/Zhang/creator/yawen: **keine Treffer** in neuen Ingests. Isenberg existiert nur als älterer 23-AI-Trends Talk (04.04., bereits vor dem Delta-Fenster als Datei existent).

---

## Was ist material für Strategie oder Execution?

1. **Mission Control v2 wird der Content-Strategie-Hub.** Das MVP-Modul "Content-Planer (Kanban)" ist das erste dedizierte Content-Tool in Burak's Stack. Alles was bisher verstreut in MAYTT/Airtable/Discovery-Docs war, kann hier zentral laufen. **Action:** vor dem nächsten Content-Sprint den Content-Planer in MC bauen, nicht extern.
2. **trq212 `/ultraplan` + noahzweben Monitor Tool** sind Apr-5-zu-Apr-12 Produktlaunches die direkt zur Orchestrator-Content-Arc passen. Beides ist **nicht catalogued**, beides ist 10/10-Signal. Sollte als Nächstes ingested und in Video-Skripten zitiert werden.
3. **Theo Browne "Pi-pilled" Episode (09.04.)** ist ein **Content-Risiko**: wenn Burak weiter "Claude Max = 18-36x Arbitrage" framt, muss er die Gegenthese kennen und adressieren. Mindestens ein "Response-Video" oder ein Satz Framing in bestehenden Posts ist fällig.
4. **Gergely Orosz × Swyx "Token Maxing" Talk** (10.04. ingested, inhaltlich aus AIE Europe) — der Soundbite "2025 = token maxing. 2026 = not wasting them" ist bereits in MEMORY.md festgehalten, aber das zugehörige Talk-MD ist post-05.04. neu geschrieben. Direkt zitierfähig.
5. **Felixba "Ki Leben" Satire (01.04. Talk-MD, 04.04. erstellt)** — deutsche Satire-Content-Template. Erstes deutsches Content-Format im Catalogue, bestätigt dass es einen deutschen Creator-Space gibt. **Action:** prüfen als Genre-Vorbild für "Agentic Engineering auf Deutsch".
6. **9-teilige Computer-Architecture-for-Agents-Serie** (11.04. angelegt) ist ein **unpublished Content-Asset in Burak's eigenem Catalogue** — 9 strukturierte Deep-Dives, ready to publish. Das ist der schnellste Hebel für "document-don't-create"-Strategie.
7. **mark-kashef-obsidian-dream-second-brain** + **rick-mulready-ai-system-claude-obsidian** (beide 04.04., direkt am Delta-Rand): Obsidian/Second-Brain-Inhalte sind die sichtbaren Content-Templates im englischsprachigen Space. Nützlich als Referenz für das MC-v2-Narrativ.

---

## Was invalidiert die April-5-Discovery?

**Nichts materiell.** Die Apr-5-Discovery gilt vollständig weiter für:
- Voice-AI-Projektstand (ColdyAI 95%, LivekitDemo ~10 Demos, production-app BMAD-managed)
- Content-Strategy-Locks (Deutsch, Agentic Engineering, No-Face, document-don't-create)
- USP ("Ich baue echte Produkte mit AI Agent-Teams…")
- Revenue-Realität (Voice AI = $0, TikTok = small Sony Sache, Ausschreibungen = OmniPort)

**Was ergänzt werden muss** (nicht invalidiert):
- Mission Control v2 als organisatorische Klammer über dem Voice/Content/Finance-Portfolio — war am 5. April noch nicht existent. Discovery spricht noch von "Airtable" als primärem System; das ist jetzt geplanterweise der Notion-Hub-Read-Flow in MC.
- **Kleinkorrektur:** Discovery sagt LivekitDemo "letzter Commit Sep-Okt 2025" — tatsächlich existiert nur 1 Commit von Juni 2025. Bitte beim nächsten Discovery-Update anpassen.

---

## Explizite "nothing new in [X]" Zeilen

- **Nothing new in coldyAI** seit 2025-11-25.
- **Nothing new in LivekitDemo** seit 2025-06-23 (nur 1 Commit im git log überhaupt).
- **Nothing new in production-app** seit 2025-11-25.
- **Nothing new in CraftCodeWebsite** seit Mai 2025 (kein git-Repo, kein mtime-Delta).
- **Nothing new in ContentOS** seit 04.04. (CLAUDE.md), sonst März-Stand.
- **Nothing new in ultravox-demo / ultravox-incoming-calls / gptrealtime / craftcodedashboard**.
- **Nothing new in omniport-hh** seit 2026-04-01 14:26.
- **Nothing new in Finance-agent** im erwarteten Pfad — nicht auffindbar unter `~/Desktop/code2/Finance-agent/`.
- **Nothing new in Hormozi / Greg Isenberg / Yawen Zhang** ingests (Isenberg nur 01.04. = pre-Delta).
- **Nothing new in catalogue/posts/2026-04/** über die 2 neuen Einträge hinaus (nichochar + omarsar0-diagram).
- **Nothing new in MAYTT / Airtable / N8N-Workflow** — kein Commit, kein File-Change seit 05.04.

---

## Artefakt-Referenzen (absolute Pfade)

- `/Users/buraksmac/Desktop/code2/missioncontrole/VISION.md`
- `/Users/buraksmac/Desktop/code2/missioncontrole/BACKLOG.md`
- `/Users/buraksmac/Desktop/code2/missioncontrole/SYNTHESIS-2026-04-12.md`
- `/Users/buraksmac/Desktop/code2/missioncontrole/docs/notion-sources.md`
- `/Users/buraksmac/Desktop/code2/missioncontrole/docs/data-schema.md`
- `/Users/buraksmac/Desktop/code2/missioncontrole/docs/research-shadcn-premium-patterns.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/practitioners/x-activity/trq212/2026-04.json`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/practitioners/x-activity/noahzweben/2026-04.json`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/practitioners/x-activity/omarsar0/2026-04.json`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-04/nichochar-the-great-convergence.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-04/omarsar0-llm-knowledge-base-diagram.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/theo-browne-crashing-out-anthropic-pi-pilled.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/amol-avasare-anthropic-growth-claude-automation.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/jesse-frimpong-claude-ai-shopify-brand-scaling.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-gergely-orosz-swyx-token-maxing.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04-01_felixba-ki-leben-satire-openclaw.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04-04_mark-kashef-obsidian-dream-second-brain.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04-04_rick-mulready-ai-system-claude-obsidian.md`
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/computer-architecture-for-agents/00-field-overview.md` (+ 01 bis 09)
