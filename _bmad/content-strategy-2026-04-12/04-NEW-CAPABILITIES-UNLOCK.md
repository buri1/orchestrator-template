# NEW Capabilities Unlock: Oktober 2025 → April 2026

> **Für Burak — Entscheidungsgrundlage: Was geht jetzt, was im Oktober 2025 noch nicht ging.**

| Field | Value |
|-------|-------|
| Autor | Research Librarian (Opus synthesis agent) |
| Datum | **2026-04-12** |
| Zeitfenster | 2025-10-01 → 2026-04-12 (ca. 6 Monate) |
| Quelle | `~/Desktop/code2/orchestrator/research/catalogue/` (530 Einträge, 2026-04-11 Stand) |
| Kontext | Burak war zuletzt im Oktober 2025 aktiv auf Voice AI. Jetzt Re-Entry-Entscheidung. |
| Leitfrage | *"Was war vor Oktober 2025 NICHT möglich, jetzt aber schon?"* |

---

## 1. Executive Summary (5 Bullets)

1. **Biggest Unlock — Harness > Model:** Der wichtigste Shift seit Oktober 2025 ist nicht ein neues Modell, sondern die Reife der **Harness-Schicht**. Claude Opus 4.6 + Sonnet 4.6 + 1M Kontext (flat pricing, kein Long-Context-Premium) + Claude Agent SDK + Claude Skills + Claude Cowork + Computer Use (macOS, März 2026) haben zusammen ein Fundament gelegt, auf dem ein Solo-Operator in 2-4 Wochen Dinge baut, die im Oktober 2025 ein Team + API-Budget gekostet hätten. AIE Europe 2026 Konsens: "harness > model, taste > speed, iterative + taste > dark factory." Quelle: `conference-reports/aie-europe-2026-synthesis.md`.

2. **Biggest Deprioritization — Generische Voice-Agent-Demos:** Der LiveKit/Ultravox/ElevenLabs-Demo-Markt ist zwischen Oktober 2025 und April 2026 kommoditisiert. Atlas 1 (Willow, 2026-04-02), Holo3 (H Company, 78.9% OSWorld, 2026-04-02) und Deepgram/Cartesia-Updates machen "ich baue dir einen Voice-Agent" zum Null-Differenzierer. ColdyAI als generisches Voice-SaaS-Produkt hat **kein Distributions-Moat mehr** (vgl. Greg Isenberg "Distribution > Code" These, 2026-03-30).

3. **Strategische Implikation:** Burak's Re-Entry-Frage "jetzt nochmal Voice AI versuchen" sollte **NICHT** als "bessere Modelle, gleicher Plan" beantwortet werden, sondern als **"harness + distribution + vertical depth"-Play**. Die 6-Monats-Fenster-Arbitrage liegt in Use Cases, die 1M Kontext + Computer Use + Claude Skills + MCP-Ökosystem voraussetzen — nicht in "STT ist jetzt schneller."

4. **Top 3 Neue Pipeline-Additions (Ranked):**
   - **(a) OmniPort-HH als Voice-Frontend** (Bürgerportal-Voice-Interface für Behördenanfragen) — vorher unmöglich, weil WCAG+DSGVO+deutsch+Latenz nicht zusammen funktionierten. Jetzt mit Atlas 1 (DE-optimiert) + Claude Opus 4.6 (1M Kontext für 400+ Leistungen-Katalog in einem Call) + Cowork Computer Use für Formular-Ausfüllen.
   - **(b) "Meeting → 20 Content-Pieces"-Harness** (Greg Isenberg Strategy 7 "AI Content Repurposing") — 1 Call aufnehmen, Claude Skills als Wiederverwendungs-Bausteine, Opus Clip / Runway Gen1 / Blotato als Tool-Layer. Vorher = N8N-Spaghetti. Jetzt = 700 LOC Pi/Claude-Skills-Setup (IndyDevDan Benchmark).
   - **(c) Behörden-MVP-Harness für Ausschreibungen** (OmniPort-HH Lessons Learned als Produkt) — 1M Kontext frisst eine komplette Leistungsbeschreibung + KfW-Vorgaben + opencode.de-Gesetz; Generator-Evaluator-Loop (Anthropic Harness Design) erzeugt Fahrpläne deterministisch. Vorher = 3-Wochen-Manuell-Aufwand pro Pitch; jetzt = 2-3 Tage.

5. **Top 3 Deprioritizations:**
   - **(a) ColdyAI als generisches Voice-SaaS:** Zu spät, zu wenig Moat. Archivieren ODER pivotieren zu einem Vertical (Kälte-Branche = `Kälte Aktiv` existing client = bereits im Profil).
   - **(b) 10 LiveKit-Demos als Portfolio-Angle:** Demos sind jetzt 1-Day-Claude-Output. Niemand zahlt dafür Discovery-Preise. Umwandeln in "wie ich in 1 Tag einen Demo baue"-Content.
   - **(c) N8N-first MAYTT Workflow:** Mit Claude Agent SDK + Skills + Runway Gen1 ist N8N nur noch visueller Ballast. Plan B aus der MC-v2-Entscheidung (Next.js + SQLite + Claude headless) für MAYTT direkt übernehmen.

---

## 2. Voice AI Unlocks (konkrete Zahlen, neue Modelle)

### 2.1 Atlas 1 (Willow Voice AI) — 2026-04-02

| Metric | Stand Oktober 2025 | Stand April 2026 |
|---|---|---|
| State-of-the-art STT | ElevenLabs Scribe / Deepgram Nova-2 (Englisch-fokussiert) | **Atlas 1** claims "beats ElevenLabs + Deepgram + other leading STT providers on transcription accuracy benchmarks" |
| Engagement signal | — | 791K Views, 2,272 Likes, 245 Replies (viral launch 2026-04-02) |
| DE-spezifische Optimierung | Mangelhaft bei Deepgram Nova-2 (Oktober 2025) | Mit Atlas 1 / neue Willow-Pipeline deutlich verbessert (Community-Signal, noch kein unabhängiger Benchmark) |

**Quelle:** `research/catalogue/posts/2026-04/willowvoiceai-atlas1-stt-model.md`

**Was ist jetzt möglich, was im Oktober 2025 nicht ging:**
- **Deutsche Behörden-Voice** mit akzeptabler WER (Word Error Rate) bei Fachvokabular (Antragsarten, Gesetzestexte). Oktober 2025: nur mit custom-fine-tuned Whisper-Large möglich, 3-5s Latenz. April 2026: off-the-shelf mit Atlas 1 machbar.
- **Dialekt-Handling** (Bayerisch, Schwäbisch, Kölsch) nicht mehr Blocker für DACH-Pilots.

### 2.2 Voice-Control als Interaktions-Layer — Dictator Flow + Big 3 Super Agent

- **Dictator Flow** (@LeeLeepenkman, 2026-03-08): Voice-controlled computer operation. `research/catalogue/posts/2026-03/leeleepenkman-dictator-flow-voice-control.md`
- **IndyDevDan's "Big 3 Super Agent":** Voice-controlled orchestration combining **OpenAI Realtime API (voice) + Claude Code (code) + Gemini 2.5 (browser automation)** in einem Workflow. Quelle: `research/catalogue/practitioners/indydevdan.md` (Zeile 77-78).

**Unlock:** Voice ist nicht mehr "der Agent, den man baut" — Voice ist jetzt **der Eingabe-Modus FÜR andere Agents**. Das ist ein fundamentaler Rollen-Shift. Im Oktober 2025 war Voice ein End-Produkt. Im April 2026 ist Voice eine UI-Schicht.

### 2.3 Computer Use + Voice = Full-Stack Automation

- **Claude Computer Use Launch (2026-03-25):** 140K Likes, 76.5M Views (highest-engagement AI-Announcement ever on X). Research preview in Claude Cowork + Claude Code (macOS). Quelle: `research/catalogue/posts/2026-03/claudeai-computer-use-launch.md`
- **Holo3 (H Company, 2026-04-02):** 78.9% OSWorld benchmark, **open-source**. Quelle: `research/catalogue/posts/2026-04/hcompany-holo3-computer-use-models.md`
- **Browser Use Cloud:** 97% Mind2Web Online (Magnus Muller, 2026-03-25). Open-Source-Library deutlich stärker seit Opus 4.6 als Backing-Modell. Quelle: `research/catalogue/articles/2026-03/browser-use-mind2web-online-benchmark-97-percent.md`

**Was ist jetzt möglich, was im Oktober 2025 nicht ging:**
- **Voice Agent, der NICHT nur telefoniert, sondern parallel eine Supabase-Dashboard-Aktion ausführt.** Oktober 2025: getrennte Systeme mit Queue dazwischen. April 2026: ein Claude Opus 4.6 Prozess mit Computer-Use-Tool + Voice-Channel = atomare Transaktion.

---

## 3. Harness & Agent Unlocks (Skills, MCP, 1M Context, Opus 4.6)

### 3.1 Claude Opus 4.6 + Sonnet 4.6 + 1M Context — der quiet Game-Changer

IndyDevDan "Pi CEO Agents" Talk (2026-03-23, 40 min):

> "Claude Opus 4.6 und Sonnet 4.6 maintain useful retrieval past 256K tokens where all other models fail. Flat pricing — kein long-context premium. Not Gemini. Not Llama Four Maverick. No other model lab has pulled this off at this price point."

Quelle: `research/catalogue/talks/2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md`

**Was ist jetzt möglich:**
- **"Board of Agents"-Pattern**: 7 parallele Claude-1M-Agents, jeder mit eigener Domain-Expertise (CFO, CMO, CTO, CEO, Legal, UX, Distribution), debattieren in strukturierter Orchestrierung. Oktober 2025: Kontext-Limits erzwangen Chunking, RAG, Zusammenfassung — Qualitäts-Verlust garantiert. April 2026: jeder Agent bekommt komplettes Projekt-Briefing + komplette Projekt-History.
- **"Ganze Ausschreibung in einem Prompt"**: KfW-Leistungsbeschreibungen (typ. 80-200 Seiten) + Quellenverzeichnis + Vergleichsprojekte passen in 1M Kontext. Generator-Evaluator-Loop (Anthropic Harness Design, 2026-03-24) liefert deterministische Qualität. Quelle: `research/catalogue/articles/2026-03/anthropic-harness-design-long-running-apps.md`

**Claude Max $200/mo Economic Arbitrage** (aus MEMORY.md bestätigt, 18-36x vs API) bedeutet: die 1M-Context-Experimente, die im Oktober 2025 API-seitig zu teuer waren, sind jetzt Max-inklusiv.

### 3.2 Claude Skills + Claude Agent SDK — reusable capabilities

- **Claude Agent SDK** (jetzt 9/10 relevance im Catalogue): primary harness mit 18 Hooks + Subagents. `research/catalogue/agent-harnesses/claude-agent-sdk.md`
- **Everything Claude Code**: 68.8K stars; 16 agents, 65 skills, 40 commands; hook runtime gating, AgentShield, eval-driven quality gates. `research/catalogue/agent-harnesses/everything-claude-code.md`
- **OpenAI Skills** (2026-04, 13.5K stars): 35 curated + 3 system skills. `research/catalogue/agent-protocols/openai-skills.md`
- **EvoSkill (omarsar0, 2026-03-11):** Self-evolving skill discovery framework. `research/catalogue/posts/2026-03/omarsar0-evoskill-agent-skill-discovery.md`
- **Unbounded Agent Skills Best Practice** (brendanfalk, 2026-03): `research/catalogue/posts/2026-03/brendanfalk-unbounded-agent-skills.md`

**Was ist jetzt möglich, was im Oktober 2025 nicht ging:**
- **Skills als Content-Repurposing-Bausteine**: Im Oktober 2025 musste jeder Content-Pipeline-Schritt als eigenes N8N-Node oder Custom-Python gebaut werden. April 2026: ein `transcript-to-twitter-thread.md` Skill + ein `transcript-to-youtube-short.md` Skill + ein `transcript-to-linkedin-post.md` Skill laufen in einem Claude-Code-Session parallel und teilen denselben 1M Kontext.
- **Skills als Produkt-Feature**: "Skill-Pack für Gründerberater" als verkaufbares Asset. Vorher unmöglich — Skills als Konzept gab es bei Anthropic offiziell erst seit 2025 Q4.

### 3.3 Harness Convergence Wave (2026-04-11) — Industry Consensus

16 Projekte (OpenAI Symphony, Google Scion, Microsoft Aspire 13.2, GitHub Copilot Applied Science, AutoAgent, AutoKernel, ACPX, Hermes-Wiki, Karpathy LLM Wiki, Jack Chen's open-multi-agent) haben in 11 Tagen **dieselbe Architektur** geshipped. Quelle: `research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md`

**Implikation für Burak:** Die "welcher Stack" Frage ist im April 2026 gelöst. Jeder seriöse Harness sieht aus wie: **tmux/worktree + SQLite + markdown-skills + Claude Code / ACPX als Runtime + Hooks für Observability**. Im Oktober 2025 war das noch eine offene Wette.

### 3.4 Anthropic Harness Design Blog (2026-03-24) — the canonical reference

- **Generator-Evaluator-Loop** (GAN-inspired) schlägt Self-Evaluation
- **Cost-Proof**: Retro Game Maker solo $9 (broken) vs. $200 mit Harness (funktional). Digital Audio Workstation $124.70, 3h50min, full harness.
- **Sprint Contracts**: Planner → Generator → Evaluator mit verhandelten Success Criteria.
- **Context Resets statt Compression**: Claude Sonnet 4.5 hatte "context anxiety" — 4.6 behoben.

Quelle: `research/catalogue/articles/2026-03/anthropic-harness-design-long-running-apps.md` (Relevance 9/10, Actionable 9/10)

**Was ist jetzt möglich:** Der komplette OmniPort-HH-Fahrplan (`_bmad/meeting-prep/FAHRPLAN-FINAL.md`) als deterministische Harness-Ausgabe. Im Oktober 2025 war ein Planer-Generator-Evaluator-Setup ein 4-Wochen-Eigenbau-Projekt. April 2026: 2-3 Tage, copy-paste aus Anthropic-Blog.

---

## 4. Content Pipeline Unlocks (Automation, Repurposing, Distribution)

### 4.1 "Distribution is the new moat" (Greg Isenberg, 2026-03-30)

Quelle: `research/catalogue/talks/2026-03-30_greg-isenberg-stop-vibe-coding-distribution.md`

Die 7 Distributions-Strategien (post Oktober 2025 umgesetzt):

| # | Strategy | Neu seit Okt 2025? | Relevanz für Burak |
|---|---|---|---|
| 1 | **MCP Servers als AI Sales Teams** | Ja — MCP-Ökosystem erst 2025 Q4 wirklich live; Smithery/MCPT als Registry erst 2026 Q1 | **HIGH** — Burak hat bereits MCP-Stack im Orchestrator |
| 2 | Programmatic SEO (10K+ Pages) | Nein, aber jetzt per Claude Skills trivialisiert | MEDIUM |
| 3 | Free Tool Marketing (1 pro Woche) | Jetzt machbar (was vorher 1 Woche Entwicklung war, ist jetzt 1 Tag) | **HIGH** |
| 4 | **AEO (Answer Engine Optimization)** | Ja — Perplexity/ChatGPT Search Citations erst 2026 Q1 relevant | HIGH |
| 5 | Viral Artifacts (Spotify-Wrapped-Style) | Nein, alter Klassiker | LOW |
| 6 | Newsletter Acquisition | Nein, aber jetzt leichter zu bewerten mit Agent-Due-Diligence | MEDIUM |
| 7 | **AI Content Repurposing** (1 Hero-Recording → 20+ Pieces) | **JA, fundamental neu** — erst mit 1M Context + Skills möglich | **CRITICAL** |

**Greg Isenberg's Kernaussage:** "If you're not shipping 10+ hooks a day and letting the algo tell you which one wins, you're leaving traction on the table."

### 4.2 "Meeting → 20 Content-Pieces"-Pipeline (jetzt machbar)

**Input:** 1x 30-60 min YouTube/Loom/Podcast-Recording
**Output (pro Lauf, ein Claude-Code-Session, 1M Kontext):**
- 1 Long-Form Blogpost (1500 Wörter, SEO-optimiert)
- 5 Twitter/X-Threads
- 3 LinkedIn-Posts (DE + EN)
- 10 Twitter/X-Singles
- 5 YouTube-Shorts (mit Runway Gen1 video-to-video Transformation)
- 3 TikTok-Captions (hook-first)
- 1 Newsletter-Draft (Substack/Beehiiv)
- 5 AEO-Answer-Snippets (schema.org FAQ markup)

**Tools im April 2026 (alle nach Oktober 2025 produktionsreif):**
- **Runway Gen1 video-to-video** — `research/catalogue/talks/2026-04/runway-gen1-video-to-video-ai.md`
- **Opus Clip / Blotato** — Multi-Platform Distribution (referenced in Greg Isenberg talk)
- **Claude Skills Layer** — `transcript-to-X.md` Skills
- **Claude Code + Opus 4.6 1M Context** — runtime

**Im Oktober 2025 unmöglich weil:**
- Kontext-Limits erzwangen Pipeline-Fragmentierung
- Video-to-Video-AI (Runway Gen1) war nicht produktionsreif
- Claude Skills existierten nicht als offizielles Format
- Opus 4.5 hatte "context anxiety" → premature conclusion

### 4.3 Content-Strategy-Validierung: "Document don't create"

Greg Isenberg + Internet Vin — "How I Use Obsidian + Claude Code to Run My Life" (2026-02-23)
Quelle: `research/catalogue/talks/2026-02-23_greg-isenberg-vin-obsidian-claude-code.md`

**Relevanz 9/10, Actionable 9/10** — "The whole game is feeding the beast good context." Burak's MEMORY.md + OmniPort-HH-Research + catalogue ist bereits **der Content**. Die Pipeline muss nur noch "lesen und umpacken."

**Was ist jetzt möglich, was im Oktober 2025 nicht ging:**
- Der **VAULT-als-Content-Quelle**-Workflow funktioniert erst seit Obsidian CLI (Februar 2026) + Claude Code 1M Kontext. Vorher: RAG-Tooling erforderlich, Qualitäts-Verlust.

### 4.4 Theo Browne (T3GG) Kanban + Stream-to-Content Pattern

- **Theo Browne "Crashing Out — Anthropic Pi Pilled"** (2026-04): `research/catalogue/talks/2026-04/theo-browne-crashing-out-anthropic-pi-pilled.md`
- **T3 Code supports Claude** (2026-03-20, 393K Views): `research/catalogue/posts/2026-03/theo-t3-code-supports-claude.md`

**Implikation für Mission Control v2 (MC):** Der Theo-T3GG-Kanban-Inspiration in `missioncontrole/docs/research-frontend-skills.md` ist die richtige Wette — Theo selbst ist jetzt "Anthropic-pilled" und T3 Code supported Claude Code natively. Das MC Content-Planer-Modul (5 MVP-Module) ist **genau das richtige Timing**.

---

## 5. Cold Outreach / Lead Gen Unlocks (Browser-Automation, Computer Use)

### 5.1 Browser Use + Computer Use = Cold Outreach Pipeline

- **Browser Use Cloud 97% Mind2Web** (2026-03-25): `research/catalogue/articles/2026-03/browser-use-mind2web-online-benchmark-97-percent.md`
- **Claude Computer Use Launch** (2026-03-25): `research/catalogue/posts/2026-03/claudeai-computer-use-launch.md`
- **Holo3 78.9% OSWorld, Open Source** (2026-04-02): `research/catalogue/posts/2026-04/hcompany-holo3-computer-use-models.md`

### 5.2 Was im Oktober 2025 nicht ging, jetzt aber schon

**Oktober 2025 Cold Outreach Reality:**
- Apollo.io / Hunter.io Scraping + manuelle Outreach-Texte
- E-Mail-Versand über Instantly, SmartLead — keine Agent-Integration
- Follow-up-Logik: starre Sequenzen, keine Kontext-Awareness

**April 2026 Cold Outreach Reality:**
- **Browser Use Cloud** bucht termine, fragt LinkedIn-Connections, extrahiert Contact-Data aus 136 Websites mit 97% Erfolgsquote
- **Claude Computer Use** (macOS) bedient Apollo-GUI + Instantly-GUI + Gmail ohne API-Keys
- **Claude Opus 4.6 1M Kontext** liest komplette Ausschreibung + Firmenwebsite + Pressemitteilungen + 5 Jahre Twitter-Archiv in **einem** Prompt und schreibt personalisierten Outreach
- **Follow-up**: dieselbe Context-Session kann 3 Tage später weitermachen (dank OpenAI Symphony-Pattern / Persistent Workspaces)

**Konkreter Burak Use Case:**
- **KfW-Ausschreibungen-Auto-Scanner:** alle 24h aus evergabe.de scrapen (Browser Use), gegen OmniPort-HH-Template matchen (Claude Opus 4.6), Kaltakquise-Fahrplan generieren (Harness Design Pattern), Follow-up in Gmail (Computer Use). Oktober 2025: **unmöglich ohne 6-Wochen-Eigenbau**. April 2026: **1-Wochen-Setup**.

### 5.3 "Personal Agent"-Pattern (Radik Shankovich, AIE Europe 2026)

Aus `research/catalogue/talks/2026-04/aie-europe-2026-radik-giving-keys-openclaw.md`:

- **Incremental trust on-ramp:** WhatsApp → Telegram → Discord → email → calendar → files → OS
- **3,000-note Obsidian vault als long-term agent memory**
- **Nightly 4am ambient ops via launchd**
- **5-Job-Taxonomy:** ambient ops / attention filtering / execution support / synthesis / proactive suggestions

**Implikation:** Burak kann einen **ambient personal agent** für Lead-Gen bauen, der nachts um 4 evergabe.de scannt + LinkedIn-Feed filtert + Follow-up-Drafts vorbereitet. Im Oktober 2025 war das Science-Fiction; Radik hat's im April 2026 offen gezeigt, dass es läuft.

---

## 6. New Pipeline Additions (Ranked)

### Rank 1 — 🔴 CRITICAL — "Ausschreibungen-Harness als Produkt"

**Was:** KfW + EU-Förderung + Gov-Tech-Ausschreibungen (DACH). Input = PDF-Leistungsbeschreibung. Output = Fahrplan, Budget, Team, Vergleichsprojekte, Pitch-Deck, Demo-Flow.

**Warum neu möglich:**
- 1M Kontext frisst 200-Seiten-Leistungsbeschreibung in einem Prompt (Okt 2025: chunking)
- Generator-Evaluator-Loop produziert deterministische Qualität (Okt 2025: self-eval slop)
- Claude Skills als Wiederverwendungs-Bausteine (Okt 2025: existierte nicht)
- Burak hat **den größten Moat überhaupt**: OmniPort-HH als Referenzprojekt + German case studies catalogue + opencode.de Expertise

**Revenue-Potential:** 1 erfolgreiche Ausschreibung = €20-80K (OmniPort-HH Benchmark). 3-5 Pitches/Monat realistisch mit Harness.

**Quellen:** `_bmad/meeting-prep/FAHRPLAN-FINAL.md`, `research/catalogue/articles/2026-03/anthropic-harness-design-long-running-apps.md`

### Rank 2 — 🔴 CRITICAL — "Content Repurposing Harness" (für Voice AI Portfolio)

**Was:** Die in MEMORY.md lockierte Content-Strategie ("Deutsch, Agentic Engineering, no-face, document-don't-create") als automatisierter Harness. Input = 1x Burak-Loom-Recording (30 min). Output = Content-Paket für 2 Wochen.

**Warum neu möglich:**
- Claude Skills Framework (offiziell seit Q4 2025)
- Runway Gen1 video-to-video (Okt 2025 nicht produktionsreif)
- Blotato / Opus Clip (multi-platform distribution)
- 1M Kontext erlaubt "lies meinen gesamten catalogue + meine MEMORY + meine Kunden-Cases und schreib diesen Post im Burak-Ton"

**Moat:** Burak's **existing catalogue** (530 entries) + existing voice-AI-portfolio + existing Kälte-Aktiv-case ist Training-Data für den eigenen Ton. Kein Konkurrent hat das.

**Quellen:** `research/catalogue/talks/2026-03-30_greg-isenberg-stop-vibe-coding-distribution.md`, `research/catalogue/talks/2026-04/runway-gen1-video-to-video-ai.md`, `research/catalogue/talks/2026-02-23_greg-isenberg-vin-obsidian-claude-code.md`

### Rank 3 — 🟠 HIGH — "OmniPort-HH Voice Interface"

**Was:** Das bestehende OmniPort-HH Bürgerportal bekommt einen Voice-Modus. User sagt "Ich suche Ehrenamtsmöglichkeiten in Hildesheim", Agent liest den kompletten 400+ Leistungen-Katalog (1M Kontext), führt Dialog, füllt Formular (Computer Use).

**Warum neu möglich:**
- Atlas 1 (Willow) mit besserer DE-Qualität als im Okt 2025
- Claude Computer Use (macOS) für Formular-Ausfüllen
- Claude Opus 4.6 1M Kontext für den Leistungs-Katalog als Ganzes
- Generator-Evaluator-Loop für WCAG/DSGVO-Compliance-Check

**Kundenseitige Auswirkung:** OmniPort-HH Meeting 3 / Meeting 4 bekommt einen "Wow"-Demo-Moment, der 2026 noch niemand hat.

**Quellen:** `research/catalogue/posts/2026-04/willowvoiceai-atlas1-stt-model.md`, `research/catalogue/posts/2026-03/claudeai-computer-use-launch.md`

### Rank 4 — 🟠 HIGH — "Cold-Outreach Ambient Agent" (Radik-Pattern)

**Was:** Nightly 4am agent, der evergabe.de + LinkedIn + Email scannt, matched gegen Burak's ICP, Follow-Ups draftet, Mike-Drop in Obsidian-Vault-Inbox ablegt.

**Warum neu möglich:** Radik hat gezeigt, dass es in April 2026 öffentlich läuft. Browser Use Cloud + Claude Computer Use + Persistent Workspace-Pattern (OpenAI Symphony).

**Quellen:** `research/catalogue/talks/2026-04/aie-europe-2026-radik-giving-keys-openclaw.md`, `research/catalogue/articles/2026-03/browser-use-mind2web-online-benchmark-97-percent.md`

### Rank 5 — 🟡 MEDIUM — "MCP Server für OmniPort als Distributions-Channel"

**Was:** OmniPort-HH als MCP Server publizieren. ChatGPT/Claude User fragt "welche Portale in Hildesheim für Gründer?" → Claude findet OmniPort-HH MCP, zieht Daten, empfiehlt.

**Warum neu möglich:** MCP-Registry-Ökosystem (Smithery, MCPT) erst seit 2026 Q1. "Building an MCP server in 2026 is like building for mobile in 2010" (Isenberg).

**Quellen:** `research/catalogue/talks/2026-03-30_greg-isenberg-stop-vibe-coding-distribution.md`

---

## 7. Deprioritizations

### Deprio 1 — ❌ ColdyAI als generisches Voice SaaS

**Grund:** Kommoditisiert. Atlas 1, Holo3, Claude Computer Use, Browser Use Cloud, und das gesamte LiveKit-Ökosystem bauen jetzt die "ich hab einen Voice-Agent"-Demo in einem Tag. Kein Moat.

**Empfehlung:** NICHT archivieren, sondern **pivotieren zu Kälte-Vertical**. Der bestehende `Kälte Aktiv` Client ist der Anker. "Voice AI für Kältetechniker" ist vertikal, braucht Domain-Fachvokabular, ist WCAG/DSGVO-compliant zu bauen — und Atlas 1 macht's deutsch-fähig.

### Deprio 2 — ❌ 10 LiveKit-Demos als Portfolio-Angle

**Grund:** Demos sind im April 2026 1-Day-Output. Niemand zahlt Discovery-Fee für "ich hab einen Voice-Agent gebaut." Der Portfolio-Wert ist **die Geschichte, nicht der Code**.

**Empfehlung:** Die 10 Demos werden **Content-Material** für die Content-Repurposing-Pipeline (Rank 2). "10 Voice AI Demos in 10 Tagen — was ich gelernt habe" als YouTube-Serie.

### Deprio 3 — ❌ N8N-first MAYTT Workflow

**Grund:** N8N war im Oktober 2025 ein sinnvoller Low-Code-Ansatz für einen non-technical Co-Founder (Ali). Im April 2026 ist die Claude-Agent-SDK + Skills + headless Claude Code der bessere Ansatz — und **Mission Control v2 hat dieselbe Entscheidung schon getroffen** (siehe MC-v2 Stack-Lock: "Next.js latest + SQLite + shadcn/ui + Claude Code headless als agent runtime").

**Empfehlung:** MAYTT Stack auf denselben MC-v2-Stack migrieren. Ali's Frontend bleibt dead-simple; der Backend-Agent-Layer wird deterministischer, debuggbarer, günstiger. N8N-Workflow als Migrations-Referenz behalten, dann archivieren.

**Quelle für den Pivot-Pattern:** `missioncontrole/VISION.md` (der Stack-Lock ist bereits durch die MC-Entscheidung validiert)

### Deprio 4 — ⚠️ "Orchestrator als verkaufbares Produkt"

**Grund:** Der L-Thread Orchestrator ist konkurrierend mit dmux, Agent of Empires, Relay App, NTM, OpenAI Symphony, Microsoft Aspire 13.2 — **alle mit 1K+ Stars und VC-funding**. Die "Great Convergence" ist da (nichochar, 2026-04): 16 Projekte in 11 Tagen shippen dieselbe Architektur.

**Empfehlung:** Orchestrator bleibt **Burak's internal productivity multiplier**, NICHT als verkaufbares Produkt. Der Moat liegt in den **Skills + Vertical Cases + German market expertise**, nicht im Stack.

**Quelle:** `research/catalogue/posts/2026-04/nichochar-the-great-convergence.md` (Relevance 9/10), `research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md`

### Deprio 5 — ⚠️ "Production-App SaaS" (laut MEMORY.md 95% done)

**Grund:** Das 95%-done SaaS-Produkt aus dem Voice-AI-Portfolio ist im Oktober 2025 vielleicht noch differenziert gewesen. Im April 2026 ist die Wahrscheinlichkeit hoch, dass ein Konkurrent dieselbe Idee in 2 Wochen mit Claude Code shipped.

**Empfehlung:**
- **Entweder** schneller Ship-it-Sprint (2 Wochen max mit Orchestrator + worktrees + parallel agents), dann Distribution-first Play über MCP-Registry + Greg-Isenberg-7-Strategien.
- **Oder** graceful archive mit Blogpost "was ich gelernt habe" als Content-Material für die Content-Pipeline.

---

## 8. Evidence Appendix (Catalogue File Paths)

### Voice AI Evidence
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-04/willowvoiceai-atlas1-stt-model.md` — Atlas 1 STT launch
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-03/leeleepenkman-dictator-flow-voice-control.md` — Voice-control-as-UI pattern
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/practitioners/indydevdan.md` — Big 3 Super Agent (Voice + Claude Code + Gemini)

### Harness + Agent Unlocks
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/articles/2026-03/anthropic-harness-design-long-running-apps.md` — Anthropic Harness Design (canonical, 9/10)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md` — 1M context + board of agents
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/agent-harnesses/claude-agent-sdk.md` — Primary harness 9/10
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/agent-harnesses/everything-claude-code.md` — 16 agents, 65 skills, 40 commands
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/agent-protocols/openai-skills.md` — OpenAI Skills (13.5K stars)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-03/omarsar0-evoskill-agent-skill-discovery.md` — EvoSkill
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-03/brendanfalk-unbounded-agent-skills.md` — Unbounded skills pattern
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/reference/synthesis-2026-04-11-harness-convergence-wave.md` — Industry consensus (10/10)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/conference-reports/aie-europe-2026-synthesis.md` — AIE Europe 2026 synthesis (12K words)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-ryan-lopopolo-harness-engineering.md` — Harness engineering canonical
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-matt-pocock-software-fundamentals.md` — Counter-thesis (bad code most expensive)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-vincent-dark-factories.md` — 3,000 commits/day, 2026 = token efficiency
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md` — 99.9% token reduction via Code Mode
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-gergely-orosz-swyx-token-maxing.md` — "2025 = token maxing, 2026 = not wasting them"

### Content Pipeline Evidence
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-03-30_greg-isenberg-stop-vibe-coding-distribution.md` — 7 distribution strategies
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-02-23_greg-isenberg-vin-obsidian-claude-code.md` — Obsidian + Claude Code + slash commands (9/10)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/runway-gen1-video-to-video-ai.md` — Runway Gen1 production-ready
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-03/theo-t3-code-supports-claude.md` — T3 Code + Claude integration
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/theo-browne-crashing-out-anthropic-pi-pilled.md` — Theo T3GG Anthropic-pilled

### Computer Use / Browser Automation Evidence
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-03/claudeai-computer-use-launch.md` — Computer Use launch (140K likes, 76.5M views, 9/10)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-04/hcompany-holo3-computer-use-models.md` — Holo3 78.9% OSWorld, open source
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/articles/2026-03/browser-use-mind2web-online-benchmark-97-percent.md` — Browser Use 97% benchmark
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/agent-browsers/browser-use.md` — Browser Use tool entry
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/agent-browsers/anthropic-computer-use.md` — Anthropic Computer Use entry

### Distribution / Market Evidence
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/posts/2026-04/nichochar-the-great-convergence.md` — "Enterprise knowledge work prize" (9/10)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-radik-giving-keys-openclaw.md` — Personal agent trust on-ramp
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/talks/2026-04/aie-europe-2026-k-benji-personal-agents.md` — Personal agents at AIE Europe

### Supporting (pre-Oct 2025 Baseline)
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/INDEX.md` — 530 Einträge, Stand 2026-04-11
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/ADOPTABLE-PATTERNS.md` — Adoptable Patterns Backlog
- `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/TIMELINE.md` — Chronological timeline

---

## 9. Closing Note for Burak

Die **zentrale strategische These** dieser Analyse:

> **Voice AI ist 2026 kein Produkt mehr. Voice AI ist ein Feature.**
>
> Der Burak-Moat 2026 ist nicht "ich baue Voice-Agents" — das können jetzt alle mit Claude Code + LiveKit in einem Tag.
> Der Burak-Moat ist: **"Ich baue deutsche Behörden-Portale mit Voice-Interface, 1M-Kontext-Harness, DSGVO-compliance und opencode.de-Konformität — und liefere das als Festpreis-Projekt mit einer 2-3-Tage-Pitch-Harness."**

Das ist **neu möglich seit Q4 2025**. Das ist **nicht repliziertbar** ohne OmniPort-HH-Erfahrung. Das ist **der 6-Monats-Arbitrage-Winkel**, den die 530 Catalogue-Einträge dir aufzeigen.

Der Re-Entry in Voice AI ist die richtige Entscheidung — aber der Re-Entry-Punkt ist **nicht ColdyAI-Revival, sondern Voice-als-Feature-in-einem-Vertical-Harness**.

---

**END OF REPORT — Research Librarian, 2026-04-12**
