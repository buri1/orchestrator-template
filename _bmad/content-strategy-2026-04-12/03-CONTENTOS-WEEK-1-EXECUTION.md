# ContentOS — Week 1 Execution Plan

**Datum:** 2026-04-12
**Basis:** `ContentOS/docs/COMPLETE-CONTENT-BRAND-STRATEGY.md` (1,051 Zeilen, 14.02.2026, nie ausgefuehrt)
**Zusatzquelle:** `ContentOS/docs/STRATEGIE-ROADMAP.md` (08.02.2026, NotebookLM Deep Research)
**Hormozi Playbook PDFs vorhanden:** `$100M Branding`, `$100M Hooks`, `$100M Goated Ads`, `$100M Lead Nurture`, `$100M Leads (2 Bonus Chapters)`, `$100M Marketing Machine`, `$100M Fast Cash`, `$100M Lifetime Value`, `$100M Retention`, `$100M Pricing`, `$100M Price Raise`, `100MMM`, `100M Journal`, `ACQ Advertising Handbook`, `Affiliate Blackbook`, `Closing Playbook`, `Leila Hormozis 5 Scaling Framework SOPs`, `Proof Checklist` (in `docs/Hormozi Playbooks/`)
**Locked Decisions vom 2026-04-05 (30 Tage gueltig):** Deutsch, Agentic Engineering Umbrella, Voice AI sprinkle, IndyDevDan No-Face, Document-don't-create, 1x/Woche Quality + 2-3x/Woche Quick, USP "Ich baue echte Produkte mit AI Agent-Teams..."

---

## Executive Summary

- **Was die Strategie zu Week 1 sagt:** Setup-only. YouTube-Kanal + Twitter/X Profil erstellen, Positioning-Statement ins Bio, 3-4 Thumbnail-Templates in Canva, USB-Mikro kaufen falls nicht vorhanden, Outlines fuer die ersten 3 Videos. **Erstes Video wird explizit erst in Week 2 publiziert** ("It will suck. That's the point."). Das ist zu langsam fuer Buraks Kontext — wir komprimieren Setup + Video 1 in Week 1.
- **Was bereits ready ist:** USP locked, Format (IndyDevDan no-face) locked, Niche (Agentic Engineering) locked, MLX-Whisper Transcription-Pipeline laeuft schon, ffmpeg ready, echtes Material taeglich (Mission Control Build, OmniPort-HH, Orchestrator v3). Hormozi-Frameworks + 30 ready-to-use Hooks aus Section 7 liegen vor. 6 Content Pillars + 5 Formate + Ship-It-Ugly-Regeln komplett dokumentiert.
- **Was fehlt fuer Video 1:** Screen-Recorder installiert (OBS oder ScreenFlow), Mikrofon getestet auf Record-Setup, YouTube-Kanal mit deutschem Namen + Bio, Thumbnail-Template in Figma/Canva, 15-Zeilen-Bullet-Outline fuer Video 1, Cold-Open-Hook geschrieben, Commitment Contract unterschrieben und im Blickfeld.
- **Konflikte mit Locked Decisions:** 4 Konflikte (siehe Section am Ende). Hauptkonflikt: Strategie sagt **2 Videos/Woche = Minimum**, Lock sagt **1 Quality + 2-3 Quick**. Zweitens: Strategie ist **englischsprachig ausgelegt** (Titel, Hooks, Zielgruppe "developers", Persona-Namen) — Lock sagt **Deutsch Primary**. Drittens: Strategie plant **Camera-on** Setup, Lock sagt **No-Face**. Viertens: Strategie-Beispiel-Titles sind Englisch, muessen uebersetzt werden. Empfehlung: **Lock gewinnt**, Strategie-Texte als Inspiration-Bank behalten, Hooks/Pillars/Formate uebernehmen, Sprache + Face-Regel ueberschreiben.
- **Empfohlenes erstes Video:** **"Ich baue mir ein eigenes Mission Control mit Claude Code — Tag 1, kein Script, kein Plan"** (Build Session Format, Pillar 4 "Real Builds", 18-25 Minuten, Deutsch, No-Face, Screen + Voice only). Begruendung: (1) Burak baut es sowieso gerade, (2) "document don't create" direkt erfuellt, (3) matched USP 1:1, (4) Build Session ist das schwerste Format — wenn du damit startest, ist alles andere leichter, (5) gibt automatisch Content fuer 6-8 Folgevideos (Day 2, Day 3, Decision-Log, Bug-Postmortems).

---

## Fear Protocol / Ship It Ugly Rules

### Direkte Zitate aus Strategy Doc (Section 1)

> "If you publish 2 videos/week, your first 20 videos take only 10 weeks. 99% of creators can't get past 20 videos. Just consistency puts you in the top 1%. Volume negates luck — you cannot predict which piece goes viral, so produce enough that probability works in your favor. Hormozi posted for 2+ years before getting traction. His first videos got single-digit views."

> "Set a quality FLOOR, not a ceiling. If it has clear audio and teaches something useful, ship it."

> "Time-box every video. If editing takes more than 2x the video length, stop editing."

> "Publish on schedule regardless of how you feel about the content."

> "Never delete a published video in the first 90 days. You are not qualified to judge yet."

> "Content is an experiment, not a verdict. A video that flops teaches you something: the topic didn't have demand (market data), the title/thumbnail didn't attract clicks (packaging data), the content didn't retain viewers (quality data), the algorithm didn't push it (timing data). None of these are about your worth as a person or professional."

> "The 90-day rule: Do not evaluate whether content creation is 'working' until you've published consistently for 90 days (minimum 20-25 videos). Anything before that is statistically insignificant."

### Interpretation fuer Burak

1. **Quality Floor = klares Audio + lehrt etwas.** Das ist die gesamte Messlatte. Kein Lighting-Setup, keine B-Rolls, keine Intros, keine Overlays. Screen + Stimme + Terminal.
2. **2x Video-Laenge = Edit-Hard-Cap.** 20-Min-Video = max. 40 Min Edit. Wenn du drueber bist, publizierst du den Rohschnitt. **Keine Ausnahmen.**
3. **Kein Delete-Recht fuer 90 Tage.** Selbst wenn dir Video 3 peinlich ist in Woche 4, bleibt es online. Peinlichkeit in Woche 4 = Beweis fuer Wachstum in Woche 12.
4. **Publish-Pflicht unabhaengig vom Gefuehl.** Der einzige Failure-State ist "nicht publiziert". Nicht "schlecht publiziert". Nicht "ein bisschen publiziert". **Nicht publiziert.**
5. **Analytics-Sperrfrist 90 Tage.** Nicht in Subscribercount schauen. Nicht in Views schauen. Prozess-Metriken (published/week, comments replied) sind erlaubt — Outcome-Metriken nicht.
6. **Video 1 MUSS schlecht sein.** Wenn Video 1 nicht peinlich ist, hast du zu lange geplant. Direktes Zitat der Strategie: *"It will suck. That's the point."*

**Burak-spezifische Addenda:**
- Bei Analysis-Paralysis-Attacke: Commitment Contract (Section 14 der Strategy) laut vorlesen, dann 1 Tweet als "Shipping Muscle Reset" posten, dann weiterarbeiten.
- Monatelange Planung = Bug, nicht Feature. Die Planung ist zu 100% fertig seit 2026-02-14. Jede weitere Planungsminute schadet.
- Wenn Video 1 in Week 1 nicht publiziert ist: Orchestrator-Agent beauftragen, jeden Tag in devlog.md zu dokumentieren **"Burak hat heute NICHT publiziert"** bis es passiert.

---

## Week 1 Concrete Plan (Mo 2026-04-13 bis So 2026-04-19)

Basis: Strategie-Section 11 + Section "Quick Reference: What To Do Right Now". Strategie trennt Setup (Week 1) und erstes Video (Week 2). **Wir komprimieren auf 7 Tage**, weil Setup <4h braucht und Paralysis nur durch Shipping gebrochen wird.

### Day 1 — Montag 2026-04-13: Setup Day (max. 3h)

- [ ] **08:00-08:15** Commitment Contract (Strategy Section 14) ausdrucken, unterschreiben, ueber den Monitor tapen. Signed-Date: 2026-04-13. Duration: 90 Tage.
- [ ] **08:15-08:30** YouTube-Kanal anlegen. Name: `Burak Agentic` oder `Buri Codes` (keine weitere Debatte — nach 15 Min entscheiden, Lock). Bio: *"Ich baue echte Produkte mit AI Agent-Teams und zeige euch die Tools, Workflows und Fehler, die ich dabei entdecke. Deutsch. Screen + Stimme. Kein Hype."*
- [ ] **08:30-08:45** Twitter/X Bio identisch updaten. Pinned Tweet: *"Neuer Kanal, neues Format: Agentic Engineering auf Deutsch. 1 Deep-Dive + 2-3 Quick Explorations pro Woche. Kein Hype, nur echte Builds."* + Kanal-Link.
- [ ] **08:45-09:15** OBS Studio installieren (`brew install --cask obs`) oder ScreenFlow Lizenz checken. **Eine** Entscheidung. Default: OBS. 5120x2880 Retina -> 1920x1080 Output. Audio: existierendes Mikro testen (Blue Yeti / Rode / MacBook-Mikro notfalls — **kein** Upgrade jetzt).
- [ ] **09:15-09:45** Test-Recording 2 Minuten. Terminal aufmachen, `echo "test"`, eigene Stimme aufnehmen. File auf Desktop ziehen. **Nur um zu pruefen ob Audio nicht scheisse ist.** Nicht publizieren.
- [ ] **09:45-10:15** Thumbnail-Template in Figma (Burak hat Figma). **Eine** Vorlage: 1920x1080, schwarzer Hintergrund, Geist Bold weiss, rechts Screenshot-Slot, links 3-Wort-Hook. Template `thumb-template-v1.fig` speichern.
- [ ] **10:15-10:30** Video-1-Outline schreiben (siehe unten "First Video Ideas" -> Idea #1). **Bullet points, kein Script.** 15 Zeilen max.
- [ ] **10:30-11:00** **RECORD VIDEO 1.** Siehe Tooling-Checklist. Ein Take. Keine Zweitaufnahme erlaubt heute.
- [ ] **Rest des Tages:** Normale Arbeit (MC build, OmniPort, Orchestrator). Mental: "Video 1 ist im Kasten."

### Day 2 — Dienstag 2026-04-14: Edit + Publish Day 1 (max. 2h)

- [ ] **Morgens 1h Edit-Block.** DaVinci Resolve oder CapCut. Nur: Cuts der laengsten Denkpausen, Trim Intro/Outro. **Keine** Musik, **keine** B-Rolls, **keine** Zoom-Effekte. Hard-Cap 40 Min bei 20-Min-Video.
- [ ] **15 Min Thumbnail.** Template oeffnen, Screenshot rein, 3-Wort-Hook. Fertig.
- [ ] **15 Min Titel + Description.** Titel-Formeln aus Hook Bank (siehe unten). Description: 2 Saetze + Timestamps + Link zum GitHub-Repo falls sinnvoll. **Keine** Tags optimieren heute.
- [ ] **PUBLISH.** Ja, heute. Nicht "wenn es besser ist". Heute. Um 19:00 Uhr Berlin (Prime Time DACH).
- [ ] **Tweet announcen** mit ersten 30 Sek als Teaser-GIF.
- [ ] **Erster Comment** selbst pinnen: Frage an Community ("Was soll Tag 2 des Builds enthalten?").

### Day 3 — Mittwoch 2026-04-15: Quick Exploration 1 (max. 90 Min)

- [ ] **Format:** Quick Exploration (5-8 Min, kein Edit, Screen+Voice, ein Take).
- [ ] **Thema:** Reaktion auf eigenen Day-1-Stream ODER ein Tool das Burak gestern erstmalig benutzt hat (z.B. cmux, Claude Code Subagents, neues MCP Server). Pillar 3 "Buzz Concept Explainer" ODER Pillar 5 "Hot Take".
- [ ] **Record + direkt publish** (YouTube + als Short-Clip auf X). Kein Edit, kein Thumbnail-Aufwand (Template reuse).
- [ ] **Abends:** 10 Comments auf anderen AI-Deutsch-Kanaelen hinterlassen (Marcus Burk, The Morpheus Tutorials, coding2go). Echtes Engagement, kein Spam.

### Day 4 — Donnerstag 2026-04-16: Mission Control Day 2 (Quality Slot)

- [ ] **Haupt-Arbeitstag an MC.** Normal arbeiten.
- [ ] **Record PARALLEL** — OBS laeuft einfach mit. Das ist "document don't create". Kein separater "Shooting-Termin".
- [ ] **Abends 45 Min:** Footage schneiden zu Build-Update Video (10-12 Min, Pillar 4, Format "Build Update"). Publizieren Freitag frueh.

### Day 5 — Freitag 2026-04-17: Video 2 publish + Idea Bank

- [ ] **08:00** Video 2 (MC Day 2) publizieren. Tweet announcen.
- [ ] **1h Idea Bank.** Notion-Seite oder `~/Desktop/code2/ContentOS/idea-bank.md` anlegen. **20 Video-Ideen** runterschreiben aus: eigenen Problemen der Woche, Claude-Code-News, Mission-Control-Meilensteinen, OmniPort-Lessons, Research-Catalogue-Eintraegen. 20 ist das Minimum (Strategy Section 13).
- [ ] **Rest Tag:** Arbeit + Recording laeuft weiter.

### Day 6 — Samstag 2026-04-18: Quick Exploration 2 + Repurposing

- [ ] **30 Min Record:** 5-Minuten Reaction auf aktuelle AI-News-Woche ODER Demo eines einzelnen Tools aus Burak's Stack. Publizieren Samstag Nachmittag.
- [ ] **MLX-Whisper Transkription** von Video 1 + Video 2 laufen lassen (Pipeline ist schon installiert).
- [ ] **1 Twitter/X Thread** aus Video 1 Insights (8-10 Tweets).
- [ ] **1 LinkedIn-Post** aus Video 2 Insights (B2B-Framing, ~150 Woerter).

### Day 7 — Sonntag 2026-04-19: Retrospektive + Week-2-Prep

- [ ] **30 Min Retrospektive** in `_bmad/content-strategy-2026-04-12/week-1-retro.md`:
  - Wie viele Videos tatsaechlich publiziert? (Ziel: 3 Quick + 1 Quality + 1 Build-Update = mindestens 1 Quality, real ist alles > 0 ein Win)
  - Was hat geclickt? (Welches Format hat am meisten Watch-Time?)
  - Was war der groesste Bottleneck? (Setup? Edit? Angst?)
  - **Nicht** Views/Subs bewerten. **Verboten** bis Tag 90.
- [ ] **Week 2 Shot-List:** 3 konkrete Video-Outlines fertig schreiben.
- [ ] **Quality-Slot fuer Week 2 festlegen:** Montag oder Donnerstag (Strategy empfiehlt Monday Batch-Recording Day).

**Week 1 Success Criteria:**
- Minimum-Floor: **1 Video publiziert.** Alles darunter = Roadblock, Orchestrator notfallmaessig reaktivieren.
- Target: **4-5 Videos publiziert** (1 Quality + 1 Build-Update + 2-3 Quick).
- Stretch: **6 Videos** (1 Quality + 1 Build-Update + 3 Quick + 1 Weekend Extra).

---

## Content Pillars + Formats (1-Page Summary)

### 6 Content Pillars (Strategy Section 5)

| # | Pillar | Frequenz | Primary Platform | Purpose | Burak-Anwendung |
|---|--------|----------|------------------|---------|-----------------|
| 1 | AI Agent-Driven Development | 1/Woche | YouTube | Core Identity als Practitioner | Orchestrator v3, Claude Code Deep-Dives, MCP-Experimente |
| 2 | AI Model Benchmarks | 1-2/Monat | YouTube + Blog | Authority via Methodologie | Claude vs GPT vs Gemini auf **Burak's echte Tasks** (OmniPort-Bugfix, MC-Feature) |
| 3 | Buzz Concept Explainers | 1-2/Woche | YouTube + Shorts | Top-of-Funnel Discovery | Neue Releases erklaeren: Skills, Subagents, Context Hub, MCP v2 |
| 4 | Real Builds / Build-in-Public | 1 / 1-2 Wochen | YouTube + Twitter | Trust + Authenticity | **Mission Control Build Serie**, OmniPort-Updates, Orchestrator-Features |
| 5 | AI Industry Analysis / Hot Takes | 1-2/Woche | Twitter + YouTube | Thought Leadership | "Warum Dark Factories nicht funktionieren", "AIE Europe Synthesis auf Deutsch" |
| 6 | Meta / Creator Journey | 1-2/Monat | YouTube + Newsletter | Relatability | "Monat 1: Was ich gelernt habe", Analytics-Breakdowns |

**Monatliche Balance-Regel:** Kein Pillar ueber 40%, keiner unter 10%.

### 5 Content Formats (Strategy Section 6)

| Format | Laenge | Struktur-Kern | Burak-Start? |
|--------|--------|---------------|--------------|
| **Model Benchmark** | 12-18 Min | Hook -> 6 Tests -> Verdict -> Chart | Week 3+ (erst Methodologie standardisieren) |
| **Concept Explainer** | 8-15 Min | Hook -> Problem -> ELI5 -> Demo -> Nuance -> Next Steps | Quick Slot, Week 1 Day 3 |
| **Build Session** | 20-45 Min | Goal -> Architektur -> Setup -> Core Build (mit Fehlern!) -> Integration -> Demo -> Lessons | **Week 1 Day 1 = ERSTES VIDEO** |
| **Hot Take / Commentary** | 8-15 Min | Provocative Hook -> Context -> Analysis -> Implications -> Discussion Invite | Quick Slot, Week 1 Day 6 |
| **Tutorial** | 12-25 Min | Problem -> Promise -> Prereqs -> Steps -> Testing -> Troubleshooting -> Extensions | Week 2+ |

**Goldene Regel fuer Build Sessions:** *"DO NOT edit out the failures. The debugging process IS the content. This is your differentiator."* — Strategy Section 6.

---

## Hook Bank — Top 10 fuer Buraks Niche (Deutsch)

Adaptiert aus Strategy Section 7 (30 englische Hooks) nach Burak's Lock (Deutsch, Agentic Engineering, No-Face, Document-don't-create). Hormozi Verbal-Hook-Typen gemischt (Statements 48%, Commands 22%, Fragen 10%, Exclamations 9%, Lists 6%, Stories 3%, Conditionals 2%).

1. **"Ich baue mir gerade ein eigenes Mission Control mit Claude Code. Tag 1, kein Script, kein Plan. Schau mir zu wie es scheitert."** (Story + Conditional — Build Session Opener)
2. **"Hoer auf Claude Code Tutorials zu schauen. Bau was. Hier ist wie du heute anfaengst."** (Command — Hot Take)
3. **"Ich habe 6 AI Coding Assistants mit echten Tasks getestet. Nur 2 ueberleben bei mir."** (Statement + List — Benchmark Teaser)
4. **"Jeder redet ueber MCP. Kaum einer zeigt was wirklich passiert wenn man ein eigenes MCP baut. Lass es uns aendern."** (Conditional + Command — Concept Explainer)
5. **"Mein Orchestrator hat letzte Nacht 8 Stunden autonom gearbeitet. Hier ist was er wirklich gemacht hat — und wo er Mist gebaut hat."** (Story + Statement — Build Update)
6. **"Der Grund warum dein Claude Code Workflow langsamer ist als haendisches Coden: du prompten falsch. Kurze Demo."** (Conditional + Command — Concept Explainer)
7. **"Hot Take: Cursor ist ueberbewertet. Ich nutze seit 3 Monaten was anderes und hier ist der Unterschied."** (Exclamation + Statement — Hot Take)
8. **"3 Subagent Patterns die bei mir in Production laufen. Nicht die aus Twitter. Die echten."** (List + Statement — Tutorial)
9. **"Ich habe mein komplettes Orchestrator-Setup mit tmux + Claude Code gebaut. Hier ist der Code, hier ist warum, hier ist was nicht geklappt hat."** (Story — Build Session)
10. **"Wenn du AI Agents baust und sie in Production immer wieder crashen: das Architektur-Pattern das bei mir den Unterschied gemacht hat."** (Conditional — Tutorial)

**Hook-Rule (Strategy Section 7 — 70/20/10):**
- 70% bewaehrte Hooks wiederverwenden (einmal Top 10 etabliert, reuse)
- 20% "Winner Adjacent" — Hooks aus Dev-Productivity/Business-Creators adaptieren
- 10% Experiment

**Tracking:** Simple Spreadsheet `content-os-hook-tracker.md`: `Video | Hook | Views (90d) | Link`. Nach Tag 90 auswerten.

---

## Tooling & Setup Checklist

Alles was Burak fuer Video 1 am Montag braucht. **Kein "nice to have".** Floor only.

### Screen Recording
- [ ] OBS Studio installiert: `brew install --cask obs` — **Default-Wahl**. Alternativ ScreenFlow falls Lizenz vorhanden.
- [ ] Output 1920x1080, 30 fps, mp4 H.264.
- [ ] Hotkey Start/Stop konfiguriert (z.B. `cmd+opt+r`).
- [ ] Recording-Folder: `~/Desktop/content-os/raw/` (anlegen).

### Audio (NON-NEGOTIABLE — Strategy Section 9)
- [ ] Mikrofon testen: Blue Yeti / Rode NT-USB Mini / Rode PodMic — was vorhanden ist. Notfall: MacBook-Mikro (akzeptabel fuer Video 1, nicht fuer Video 10).
- [ ] In OBS: Noise Suppression Filter aktiviert (RNNoise).
- [ ] Testrecord 30 Sek, abspielen, pruefen: keine Clicks, kein Rauschen, keine Volume-Spikes.
- [ ] **Kein Mikro-Upgrade vor Monat 3.** Strategy explizit.

### Video (Kein Camera — Lock ueberschreibt Strategy)
- [ ] **Keine Webcam.** No-Face Format (Lock 2026-04-05).
- [ ] Nur: Terminal + Browser + Editor als OBS Scenes.
- [ ] Scene 1 "Terminal Full" (ghostty/cmux fullscreen), Scene 2 "Split" (Terminal + Browser), Scene 3 "Editor" (Zed/Cursor), Scene 4 "Whiteboard" (Excalidraw falls Architektur gezeichnet wird).

### Editing
- [ ] DaVinci Resolve (free) installiert ODER CapCut. **Eine** Wahl. Default: DaVinci fuer Longform, CapCut fuer Shorts.
- [ ] Hard-Cap: Edit-Zeit <= 2x Videolaenge. Timer setzen.
- [ ] Keine Musik in Video 1. Keine Lower-Thirds. Keine Intros. Nur Cuts.

### Thumbnails
- [ ] Figma oder Canva. Template `thumb-template-v1`:
  - 1920x1080
  - Background: `#0a0a0a`
  - Font: Geist Bold 120pt weiss
  - 3-Wort Hook links
  - Screenshot-Slot rechts
- [ ] 3-4 Template-Varianten fuer Week 2. **Heute nur 1.**

### Upload Targets (Week 1)
- [ ] **YouTube Hauptkanal** (primary) — Longform + Shorts
- [ ] **Twitter/X** — Clip-Teaser + Thread aus jedem Longform
- [ ] **LinkedIn** — Textpost mit Link (nicht vor Donnerstag starten, Fokus Week 1 = YouTube+X)
- [ ] **Kein TikTok, kein Instagram, kein Newsletter** in Week 1. Lock sagt 2 Plattformen start, Strategy sagt dasselbe.

### Transcription / Repurposing (Burak hat das schon)
- [ ] MLX-Whisper Pipeline: `mlx-community/whisper-small-mlx` — ready.
- [ ] ffmpeg Audio-Extract: `ffmpeg -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav` — ready.
- [ ] Script `transcribe.sh` wrappen fuer One-Command Use (nice-to-have, nicht Week 1 kritisch).

### State / Tracking
- [ ] `~/Desktop/code2/ContentOS/idea-bank.md` — Minimum 20 Ideen (siehe Day 5).
- [ ] `~/Desktop/code2/ContentOS/hook-tracker.md` — Spreadsheet-Ersatz (`Video | Hook | Date | Views@7d | Views@30d | Views@90d | Link`).
- [ ] `~/Desktop/code2/ContentOS/published-log.md` — Eine Zeile pro Publish. Proof fuer das Commitment Contract.

### Commitment Contract (Strategy Section 14)
- [ ] Gedruckt + unterschrieben + ueber Monitor.
- [ ] Dauer: 90 Tage (2026-04-13 bis 2026-07-12).
- [ ] Einzige Failure-Condition: nicht publiziert.

---

## First 3 Video Ideas (shootable diese Woche)

Alle drei basieren auf Arbeit die Burak **eh schon macht**. "Document don't create" ist erfuellt.

### Video 1 (Quality Slot, Week 1 Day 1, Mo 13.04.)

**Titel:** "Ich baue mir ein eigenes Mission Control mit Claude Code — Tag 1, kein Script"
**Format:** Build Session (20-30 Min)
**Pillar:** 4 (Real Builds) + 1 (AI Agent-Driven Development)
**Hook (erste 20 Sek):** *"Seit Monaten plane ich einen Kommandozentrale fuer meine Agent-Teams. Heute baue ich sie. Kein Script, kein Plan, keine Bearbeitung der Fehler. Wenn was kaputt geht, seht ihr es."*
**Inhalt-Outline:**
1. Goal Reveal: Was ist Mission Control (30 Sek) — 5 Module, lokal, SQLite, Next.js 16.
2. Architektur-Diagram (Excalidraw 2 Min): Next.js + SQLite + Drizzle + shadcn + Claude Code headless.
3. Setup (5 Min): `pnpm create next-app`, Drizzle installieren, bessere-sqlite3.
4. Erste Migration: `projects` Tabelle anlegen. Live tippen, echte Fehler.
5. Minimale UI: shadcn Table mit 3 Dummy-Projects.
6. Claude Code Subagent callen: `claude "zeig mir alle projects aus db"` — live.
7. Was funktioniert nicht — ehrlich zeigen.
8. Lessons + was morgen kommt.
**Thumbnail 3-Wort-Hook:** "Mission Control / Tag 1"
**Description:** 2 Saetze + Timestamps + Link zu `~/Desktop/code2/missioncontrole/` auf GitHub (privat lassen oder einzelne Dateien als Gist, je nach IP-Check).
**IP-Check:** Tier 1 (Share Freely) — Stack ist oeffentlich dokumentiert, keine Client-Logik drin.

### Video 2 (Build Update / Quick Slot, Week 1 Day 3, Mi 15.04.)

**Titel:** "Ich habe 5 Tools in 48h fuer meinen Content-Stack getestet. 2 haben ueberlebt."
**Format:** Hot Take / Mini-Benchmark (8-12 Min)
**Pillar:** 3 (Buzz Explainer) + 5 (Industry Analysis)
**Hook:** *"Letzte Woche habe ich 5 neue AI-Tools in meinen Workflow eingebaut. 3 davon habe ich heute wieder deinstalliert. Ich zeig euch warum."*
**Inhalt-Outline:**
1. Kontext: Warum ich Tools teste (30 Sek).
2. Tool-Liste ansagen — 5 konkrete Namen (je nachdem was Burak real testet: cmux, Claude Skills, neuer MCP Server, etc.).
3. Pro Tool 60-90 Sek: was es verspricht, was es fuer **mich** wirklich gemacht hat.
4. Die 2 Gewinner: warum sie bleiben.
5. Ein "Damaging Admission" (Hormozi): ein Tool das alle lieben wuerden aber bei mir versagte.
**Thumbnail:** "5 Tools / 2 ueberleben"
**IP-Check:** Tier 1.

### Video 3 (Build Update, Week 1 Day 4-5, Do 16.04. / Fr 17.04.)

**Titel:** "Mission Control Tag 2: Der erste Agent haengt sich auf — und ich lasse es im Video"
**Format:** Build Update (10-12 Min)
**Pillar:** 4 (Real Builds) + 6 (Creator Journey)
**Hook:** *"Tag 2 des Builds. Ich wollte nur Notion-Sync bauen. Es sind 4 Stunden und 3 Crashes geworden. Ich habe nichts rausgeschnitten."*
**Inhalt-Outline:**
1. Recap Day 1 (30 Sek).
2. Ziel fuer heute: Notion API Integration.
3. Live-Debug (6 Min) — echte Errors, echtes Copy-Paste in Claude Code, echtes "hm das geht nicht".
4. Breakthrough Moment.
5. Was morgen kommt.
6. **Discussion Invite:** "Soll der naechste Schritt X oder Y sein? Kommentare."
**Thumbnail:** "Tag 2 / 3 Crashes"
**IP-Check:** Tier 1. Notion-Workspace-IDs zensieren (schwarze Balken in Post) — sind in MC Memory dokumentiert.

**Gemeinsame Eigenschaften dieser 3 Videos:**
- Alle basieren auf **echter Arbeit die in Burak's MEMORY.md dokumentiert ist** (Mission Control v2 Stack locked, 2026-04-12).
- Alle No-Face.
- Alle <45 Min Record + Edit (Ship-It-Ugly compliant).
- Alle uebersetzen direkt in Tweets, Threads, LinkedIn-Posts (Content Multiplication System).
- Zusammen bilden sie eine **Serie** — reinforcing, nicht random. Das ist Hormozi's Bouquet-Metapher in Aktion.

---

## Conflicts with Locked Decisions (2026-04-05)

Die Strategy wurde am 14.02.2026 geschrieben, die Locks am 05.04.2026. Wo beide sich widersprechen, **gewinnt der Lock**. Hier sind die 4 identifizierten Konflikte mit Empfehlungen.

### Konflikt 1: Sprache

- **Strategy sagt:** Englisch implizit. Alle Beispiel-Titel, alle Hooks, alle Persona-Beschreibungen, alle Platform-Stack-Referenzen sind englischsprachig. Zielgruppe "developers" im englischsprachigen Sinn.
- **Lock sagt:** Deutsch primary (2026-04-05).
- **Begruendung Lock:** Burak hat TikTok-Erfahrung auf Deutsch, Sony-Music-Projekt war DE, OmniPort-HH ist DE-Kunde, Ausschreibungen kommen aus DACH, Discord Community ist teilweise DE, Konkurrenz im DE-Raum (Marcus Burk, etc.) ist technisch schwaecher.
- **Empfehlung:** **Lock bleibt, Strategy anpassen.** Alle 30 Hooks, alle Pillar-Titel-Beispiele, alle Format-Templates auf Deutsch uebersetzen. Englische Tech-Begriffe (Claude Code, MCP, Subagent, Orchestrator, Benchmark) bleiben unuebersetzt. USP-Statement ist schon auf Deutsch im Lock — passt.
- **Action:** Ich habe die Top 10 Hooks oben bereits auf Deutsch adaptiert. Die restlichen 20 Strategy-Hooks uebersetzen ist Week-2-Aufgabe (1 Hour Batch).

### Konflikt 2: Frequenz

- **Strategy sagt:** 2 Quality-Videos/Woche (Section 11, Week 2: "Record and publish Video 1. Publish Video 2. Record Videos 2-3." — explizit 2/Woche als Minimum).
- **Lock sagt:** 1 Quality + 2-3 Quick Explorations pro Woche. Also 3-4 Videos, aber nur 1 mit Edit-Aufwand.
- **Analyse:** Lock ist nicht strenger — er ist nur anders verteilt. Burak produziert genauso viel (oder mehr), aber nur **eine** Production ist "polished". Das ist pragmatischer und matched "document don't create" besser.
- **Empfehlung:** **Lock gewinnt.** Strategy-Zahl reinterpretieren als "3-4 Uploads/Woche total, davon 1 Quality". Das erfuellt Strategy-Ziel (Consistency, Volume) ohne den Burnout-Effekt zweier Batch-Recording-Days.
- **Action:** Week 1 Plan oben ist bereits nach Lock strukturiert (1 Quality Mo, 1 Build-Update Do-Fr, 2-3 Quick Mi/Sa).

### Konflikt 3: Face vs No-Face

- **Strategy sagt:** Section 9 Tool Stack listet explizit "Camera: Built-in Mac webcam or Logitech C920+". Section 6 Format 4 "Hot Take" sagt "Thumbnail: Your face with skeptical/strong expression". Section 1 Videos 1-5 "How to speak to a camera without freezing".
- **Lock sagt:** IndyDevDan No-Face Format — Screen + Voice only.
- **Begruendung Lock:** Burak hat bewiesen (TikTok, Sony-Music-Projekt) dass er kein Camera-Shy ist, aber der No-Face-Style matched besser zu Tech-Deep-Dive-Content, reduziert Production-Overhead um ~40%, und ist bei IndyDevDan (73K Subs in <1 Jahr) empirisch validiert.
- **Empfehlung:** **Lock gewinnt. Strategy ueberholt.** Tool-Stack-Tabelle der Strategy ist ab heute in dem Punkt obsolet. Webcam-Zeile streichen.
- **Action:** Im Tooling-Checklist oben bereits "Kein Camera" dokumentiert. Thumbnail-Templates ohne Face-Slot designen.

### Konflikt 4: Positioning-Statement Format

- **Strategy sagt (Section 2):** *"I'm a practitioner who actually builds with AI - showing the real process, the real failures, and the real results of AI agent-driven development."* (Englisch, 1. Person Singular, "practitioner who").
- **Lock sagt:** *"Ich baue echte Produkte mit AI Agent-Teams und zeige euch die Tools, Workflows und Fehler, die ich dabei entdecke."* (Deutsch, du-adressiert, "Agent-Teams" plural explizit).
- **Analyse:** Lock ist **konkreter** (Agent-Teams statt "AI"), **aktiver** (baue, zeige, entdecke) und **direkter** (du-Adresse). Strategy ist generischer.
- **Empfehlung:** **Lock gewinnt.** Lock-Statement in YouTube-Bio, Twitter-Bio, LinkedIn-About und Kanal-Beschreibung uebernehmen. Strategy-Version als interne Referenz behalten.
- **Action:** In Day 1 Tasks oben bereits so geplant.

### Weitere kleinere Reibungen (kein echter Konflikt)

- **Voice AI Sprinkle:** Lock sagt "Voice AI sprinkled in". Strategy hat keinen Voice-AI-Pillar. Empfehlung: Voice AI ist **Content-Variante innerhalb Pillar 1 (Agent-Driven Development)** und Pillar 4 (Real Builds), nicht eigener Pillar. Zaehlt als "Agent-Teams" breite Kategorie. ColdyAI + LiveKit-Demos werden in Week 3-4 als Build-in-Public-Updates eingebaut, nicht als separater Content Stream.
- **Plattform-Stack:** Strategy listet TikTok in Tier 1 nicht. Lock enthaelt kein TikTok-Commitment. Empfehlung: **kein TikTok in Phase 1.** Fokus YouTube + X. TikTok ab Monat 3 optional.

---

## Strategie-Update Recommendation (Post Week 1)

Nach Week 1 Retro: **COMPLETE-CONTENT-BRAND-STRATEGY.md nicht neu schreiben.** Stattdessen:

1. **Diesen Week-1-Plan** als "execution layer" behandeln — die Strategy als "playbook layer".
2. **Hook Bank auf Deutsch** als separates File `~/Desktop/code2/ContentOS/hook-bank-de.md` pflegen (30 Hooks uebersetzt, adaptiert, getrackt).
3. **Content Calendar** als `~/Desktop/code2/ContentOS/calendar.md` wochenweise fuehren. Jede Woche diesen Week-1-Plan als Template klonen und anpassen.
4. **Strategy-Konflikte** als `~/Desktop/code2/ContentOS/strategy-overrides.md` dokumentieren (No-Face, Deutsch, Frequenz, Positioning) — damit Burak in 3 Monaten weiss welche Teile der Original-Strategy noch gelten und welche ueberholt sind.

---

## Anti-Paralysis Protocol (Kurzfassung fuer Montag frueh)

Wenn Burak am Montag 13.04. um 08:00 zaudert:

1. **Nicht ueber Namen diskutieren.** 15 Minuten Timer, dann ist der Kanalname gelocked.
2. **Nicht mehrere Mikros vergleichen.** Das Mikro das am naechsten liegt wird benutzt.
3. **Kein Intro aufnehmen.** Video 1 startet mit Hook, nicht mit Begruessung.
4. **Kein Outro aufnehmen.** Video 1 endet mit "morgen Tag 2". Keine Outro-Card.
5. **Kein Review-Watch vor Upload.** Einmal durchspielen zur Audio-Kontrolle, dann hoch. Das Gehirn wird immer Fehler finden.
6. **Kein Titel-Debate.** Titel oben in Video 1 Idea nehmen, done.
7. **Nicht auf Stats schauen nach Upload.** Browser-Tab schliessen fuer 24h.
8. **Failure = nicht publiziert. Alles andere ist Lernen.**

Der einzige Failure-State ist nicht publiziert. Alles andere ist Daten.

---

**Ende Plan. Montag 08:00 starten. Kein zweites Planungsdokument.**

```
cmux markdown open ~/Desktop/code2/orchestrator/_bmad/content-strategy-2026-04-12/03-CONTENTOS-WEEK-1-EXECUTION.md
```
