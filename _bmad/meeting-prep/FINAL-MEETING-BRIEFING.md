# FINAL MEETING BRIEFING: Stadt Hildesheim -- 2. Vergaberunde

**Erstellt**: 2026-03-30
**Meeting**: 2. Runde, OmniPort Hildesheim Smart City Ausschreibung
**Publikum**: Stadt Hildesheim Smart-City-Team + erfahrener Sysadmin (kennt Claude Code)
**Projektvolumen**: EUR 15M (KfW-gefoerdert, EUR 15,75M Bundesfoerderung)
**Lesezeit dieses Dokuments**: ~30 Minuten

---

## 1. EXECUTIVE SUMMARY

### Die 5 staerksten Argumente

1. **Funktionaler Prototyp statt PowerPoint.** 5 Portale, 38 Seiten, 99 Shared Components, 202 Commits -- gebaut in 9 Tagen. Live unter omniport-hh.vercel.app. Kein anderer Bieter wird das haben.

2. **KI-Entwicklung ist Industriestandard, nicht Experiment.** 90% der Fortune 100 nutzen GitHub Copilot. Google schreibt 30% seines Codes mit KI. Stripe liefert 1.300+ AI-PRs pro Woche unter PCI-DSS-Compliance. Das BSI hat offizielle Leitlinien fuer den sicheren Einsatz veroffentlicht -- nicht um es zu verbieten, sondern um es zu regeln.

3. **Datensouveraenitaet ist architektonisch geloest.** Supabase in Frankfurt (eu-central-1), Open-Source-Stack ohne Vendor-Lock-in, KI-Tools sehen niemals Produktionsdaten. Code gehoert der Stadt, veroffentlichbar auf opencode.de.

4. **Human-in-the-Loop ist kein Lippenbekenntnis.** Jede Zeile Code durchlaeuft: TypeScript-Compiler, automatisierte Tests, menschliches PR-Review, E2E-Tests. KI-generierter Code hat 1.7x mehr Fehler (CodeRabbit-Studie) -- genau deshalb haben wir STRENGERE Review-Prozesse.

5. **Shared-Component-Architektur = langfristige Kosteneffizienz.** 99 wiederverwendbare Bausteine. Neues Portal = Konfiguration, nicht Neuentwicklung. API-Wrapper integriert externe Systeme in 1-2 Wochen. Die Stadt spart bei jedem neuen Modul.

### Die 3 groessten Risiken (proaktiv adressieren)

1. **Claude Max Training Policy.** Wir nutzen Claude Max ($200/mo) -- ein Consumer-Plan. Training ist seit Sep 2025 default ON. **AKTION HEUTE ABEND: Training opt-out aktivieren** unter claude.ai/settings/data-privacy-controls. Umgebungsvariablen setzen: `DISABLE_TELEMETRY=1`, `DISABLE_ERROR_REPORTING=1`. Fuer Produktionsphase: Wechsel auf API oder Team-Plan vorbereiten.

2. **4 Seiten geben noch 404 zurueck** (Stellenmarkt, Stadt.Herz, Unternehmenslandschaft, Profil). Falls jemand im Meeting die Live-Demo selbst durchklickt, kann das peinlich werden. **AKTION: Entweder vor dem Meeting fixen oder wissen, wo man NICHT hinklickt.**

3. **Talentpool-Missverstaendnis.** Wir haben Talentpool als Studenten-Jobsuche implementiert, aber laut Leistungsbeschreibung ist es ein Arbeitgeber-Portal (Unternehmen finden Talente). **AKTION: Im Meeting proaktiv ansprechen:** "Wir haben das beim letzten Mal so gezeigt -- nach genauerem Studium der Leistungsbeschreibung wissen wir jetzt, dass Talentpool die Arbeitgeber-Seite ist. Das Redesign ist Sprint 2 unseres Handoff-Plans."

### Der 1 "Wow Moment"

> **"Ein Entwickler. Neun Tage. Zweihundert Commits. Fuenf Portale. Live."**

Pause. Wirken lassen. Dann: "Das zeigt Ihnen, was wir in 12 Monaten als Produkt liefern koennen."

---

## 2. KILLER-DATENPUNKTE (Top 20)

Sortiert nach Schlagkraft. Jeder Punkt mit Quelle.

| # | Datenpunkt | Quelle |
|---|-----------|--------|
| 1 | **Stripe liefert 1.300+ KI-generierte PRs/Woche** -- bei $1T+ Zahlungsvolumen, unter PCI-DSS | Stripe Engineering Blog, Maerz 2026 |
| 2 | **90% der Fortune-100-Unternehmen** nutzen GitHub Copilot | GitHub/Panto Statistics 2026 |
| 3 | **30%+ des neuen Google-Codes** wird von KI geschrieben | Sundar Pichai, Q1 2025 Earnings Call |
| 4 | **73% der Engineering-Teams** nutzen KI-Coding-Tools taeglich | Developer Survey 2026 |
| 5 | **9 Tage: vom leeren Repo zur funktionalen 5-Portal-Plattform** -- 38 Seiten, 99 Shared Components, 202 Commits | OmniPort-HH Projektdaten |
| 6 | **JPMorgan Chase: 60.000 Entwickler** nutzen KI-Coding-Tools bei 30% Velocity-Steigerung -- regulierter Bankensektor | AWS/JPMorgan Reports |
| 7 | **BSI hat offizielle Leitlinien** fuer KI-Coding-Assistenten veroffentlicht (BSI-ANSSI Joint Paper, Sep 2024) | BSI.bund.de |
| 8 | **SAP: 7x-12x Produktivitaetsmultiplikator** intern mit Joule for Developers | SAP Community Blog 2026 |
| 9 | **SAP + Deutsche Telekom + Siemens: EUR 1 Mrd.** in souveraene KI-Infrastruktur in Muenchen | NVIDIA/Euronews, Feb 2026 |
| 10 | **73% aller Agent-Tool-Calls** haben Human-in-the-Loop-Aufsicht | Anthropic Research, 998.481 API-Calls analysiert |
| 11 | **Nur 0,8% der Agent-Aktionen** sind irreversibel | Anthropic Autonomie-Studie, Feb 2026 |
| 12 | **KI-Agent Runtime: $10,42/Stunde** -- unter Mindestlohn | Geoffrey Huntley/Sourcegraph, Feb 2026 |
| 13 | **Deloitte: Claude verfuegbar fuer 470.000 Mitarbeiter** -- groesste Enterprise-KI-Deployment | Anthropic/Deloitte Partnerschaft |
| 14 | **Multi-Agent-System an eine Bank verkauft und deployed** -- Banking-Compliance bestanden | Thought2Action, 2026 |
| 15 | **EU AI Act: KI-Coding-Tools = "Minimal Risk"** -- keine Registrierung, keine Konformitaetsbewertung noetig | EU AI Act Portal |
| 16 | **Pentagon/DoD kauft KI-Coding-Tools** fuer Zehntausende Entwickler (GenAI.mil-Plattform) | DefenseScoop, Feb 2026 |
| 17 | **35% Leistungssteigerung** bei US State Government mit GitHub Copilot | KPMG Government Case Study |
| 18 | **Anthropic: SOC 2 Type II + ISO 27001 + ISO 42001** (als erstes grosses KI-Unternehmen) | Anthropic Trust Portal |
| 19 | **Hildesheim: 15,75 Mio. EUR Bundesfoerderung** im Programm "Modellprojekte Smart Cities" | smart-city-dialog.de |
| 20 | **KI-generierter Code hat 1.7x mehr Fehler** -- ABER: mit Review-Pipeline ist Endqualitaet vergleichbar | CodeRabbit State of AI Report, 2025 |

---

## 3. CASE STUDY: STRIPE (3-Minuten-Pitch-Version)

### Was ist Stripe?
Groesster Payment-Prozessor der Welt. $1T+ Zahlungsvolumen/Jahr. PCI-DSS Level 1, SOC 2, globale Finanzregulierung. Wenn IRGENDEIN Unternehmen einen Grund haette, KEINE KI in der Softwareentwicklung einzusetzen, waere es Stripe.

### Was machen sie?
**"Minions"** -- autonome KI-Coding-Agenten. Ein Ingenieur erstellt eine Aufgabe. Ein Minion startet eine isolierte VM, liest Docs, schreibt Code, fuehrt Tests durch, erstellt einen Pull Request. Ein Mensch prueft und genehmigt.

### Die Zahlen
- **1.300+ Pull Requests pro Woche** -- komplett KI-geschrieben, 0% menschlich geschrieben
- **30% Wachstum Woche-ueber-Woche**
- **3+ Millionen Tests** in der CI-Pipeline
- **500 interne MCP-Tools**, kuratiert auf ~15 pro Aufgabe
- Cursor-Adoption bei Stripe: **von einstellig auf ueber 80%**

### Das Sicherheitsmodell (die "Walls")

> "The model does not run the system. The system runs the model."

6 Schichten:
1. **Isolierte VM** -- kein Internet, keine Produktionsdaten, kein Kundenzugriff
2. **Lokales Linting** vor jedem Push (< 5 Sekunden)
3. **CI/CD** mit Hard Limit: max 2 Versuche, dann menschliche Uebergabe
4. **MCP-Zugriffskontrolle** -- kryptographisch gesperrt
5. **Obligatorisches menschliches Review** fuer jeden PR
6. **Self-Healing** -- automatische Terminierung bei anhaltendem Scheitern

### Der Killer-Satz fuer die Praesentation

> "Wenn das Unternehmen, das taeglich Milliarden Euro an Zahlungsvolumen abwickelt, KI-gestuetzte Entwicklung einsetzt -- mit den richtigen Leitplanken -- dann ist das auch fuer ein Smart-City-Projekt tragbar."

---

## 4. WALL OF CREDIBILITY (Enterprise Adoption)

| Unternehmen | Was sie mit KI machen | Ergebnis |
|-------------|----------------------|----------|
| **Stripe** | Autonome Coding-Agenten ("Minions") | 1.300+ PRs/Woche, $1T Zahlungsvolumen |
| **Google** | Gemini Code Assist intern | 30%+ des neuen Codes ist KI-generiert |
| **Microsoft** | GitHub Copilot (20M User) | 46% des Codes KI-generiert, PR-Zykluszeit -75% |
| **Amazon** | Q Developer intern | 4.500 Entwickler-Jahre gespart bei Java-Upgrades |
| **JPMorgan Chase** | KI-Coding fuer 60.000 Entwickler | 30% Velocity-Steigerung, volle regulatorische Compliance |
| **SAP** | Joule for Developers (40.000 Devs) | 7x-12x Produktivitaetsmultiplikator |
| **Shopify** | CEO-Mandat: KI-Nutzung ist Pflicht | 30% Umsatzwachstum auf $11,56B |
| **Databricks** | Coding Agents fuer 2.000+ Ingenieure | Zehntausende Traces pro Tag via MLflow |
| **Anthropic/Claude** | Claude Code fuer 70% der Fortune 100 | $2,5B annualisierter Umsatz |
| **Deloitte** | Claude fuer 470.000 Mitarbeiter | Groesste Enterprise-KI-Deployment weltweit |
| **Cursor** | AI-IDE Marktfuehrer | 2M+ Nutzer, $2B Umsatz, $29,3B Bewertung |
| **SAP+Telekom+Siemens** | Souveraene KI-Infrastruktur Deutschland | EUR 1 Mrd., ~10.000 NVIDIA GPUs in Muenchen |
| **Epic (Healthcare)** | Claude Code fuer Nicht-Entwickler | HIPAA-compliant, spontane Adoption |
| **Klarna** | KI fuer Kundenservice (Warnung!) | Musste Menschen wieder einstellen -- KI augmentiert, ersetzt nicht |

**Merksatz**: "KI-Entwicklung ist kein Experiment mehr. Es ist wie E-Mail in den 90ern -- wer es nicht nutzt, faellt zurueck."

---

## 5. SICHERHEIT & DATENSOUVERAENITAET (The Trust Block)

### BSI-Leitlinien
- **BSI-ANSSI Joint Paper (Sep 2024)**: Offizielle Empfehlungen fuer KI-Programmierassistenten. Kernaussage: KI-Coding ist erlaubt MIT systematischer Risikoanalyse und Sicherheitspruefungen.
- **BSI-Kriterienkatalog (Juni 2025)**: Mindestanforderungen fuer generative KI in der Bundesverwaltung. Derzeit unverbindlich, aber Richtschnur.
- **BSI AIC4**: Framework fuer Cloud-basierte KI-Services -- anwendbar auf Claude API.
- **Kernbotschaft: Das BSI verbietet KI-Coding nicht. Es gibt einen Rahmen fuer den sicheren Einsatz.**

### Anthropic Zertifizierungen
| Zertifizierung | Status |
|---------------|--------|
| SOC 2 Type I & II | Zertifiziert (trust.anthropic.com) |
| ISO 27001:2022 | Zertifiziert |
| ISO/IEC 42001:2023 | Zertifiziert (erstes grosses KI-Unternehmen!) |
| HIPAA | Ready (BAA verfuegbar) |
| Verschluesselung | TLS 1.2+ in Transit, AES-256 at Rest |

### DSGVO-Architektur

```
+------------------------------------------------------------------+
|                    UNSER DSGVO-SETUP                              |
+------------------------------------------------------------------+
|                                                                   |
|  Hosting: Supabase Frankfurt (eu-central-1)                       |
|    --> Daten verlassen Deutschland NICHT                           |
|    --> PostgreSQL mit Row-Level-Security                           |
|    --> SSL/TLS ueberall, HSTS-Header                              |
|                                                                   |
|  KI-Entwicklungswerkzeuge:                                        |
|    --> Training: DEAKTIVIERT (opt-out gesetzt)                    |
|    --> Telemetrie: DEAKTIVIERT (DISABLE_TELEMETRY=1)              |
|    --> Sehen NUR Quellcode, NIEMALS Produktionsdaten              |
|    --> NIEMALS Nutzerdaten, Kundendaten, personenbezogene Daten   |
|                                                                   |
|  Code-Pipeline:                                                   |
|    --> Linting + Type-Check + Tests + Human Review + E2E          |
|    --> Jede Aenderung in Git-Historie nachvollziehbar              |
|    --> Open Source: jederzeit auditierbar                          |
|                                                                   |
+------------------------------------------------------------------+
```

### EU AI Act Klassifizierung
- KI-Coding-Assistenten = **Minimal Risk** (keine Pflichten unter dem AI Act)
- Keine Registrierung, keine Konformitaetsbewertung, kein Risikomanagement noetig
- Oeffentlicher Sektor hat verlaengerte Frist bis **August 2030** fuer High-Risk-Systeme
- Falls die Plattform selbst KI-Features nutzt (z.B. KI-Moderation): Limited Risk, aber nicht High Risk

### opencode.de Compliance
- KfW-gefoerdertes Projekt MUSS Quellcode auf opencode.de veroffentlichen
- Empfohlene Lizenz: **EUPL 1.2** (EU-nativ, mehrsprachig, GPL-kompatibel) oder **OSC License 1.1** (spezifisch fuer deutsche Kommunen)
- Gesamter Stack ist OSS-kompatibel: Next.js (MIT), Supabase (Apache 2.0), shadcn/ui (MIT)

---

## 6. UNSER PROJEKT: DIE ZAHLEN

### Was wir gebaut haben

| Metrik | Wert |
|--------|------|
| Portale | 5 voll funktionsfaehig |
| Routen/Seiten | 38 eigenstaendige Pages |
| Shared Components | 99 wiederverwendbare Bausteine |
| TypeScript-Dateien | 256 |
| Codezeilen | ~28.800 |
| Commits | 202 |
| Pull Requests | 43+ merged |
| User Stories | 72 autonom implementiert |
| Kernentwicklungszeit | ~6 Stunden (autonom ueber Nacht) |
| Gesamte Timeline | 9 Kalendertage (08.03. bis 17.03.2026) |

### Was seit Meeting 1 (17.03.) passiert ist
- 14 gezielte Verbesserungen in 13 Tagen
- Pixel-genaues Redesign der Portal-Karten nach Kunden-Design-Template
- 2 neue Quizze (Job-Quiz + Studenten-Quiz)
- Mobile-Optimierung: Admin-Hamburger-Menu, Quiz-Ergebnisse, Overflow-Fixes
- Alle Demo-Warnungen bereinigt

### Sprint-Plan fuer Handoff (nach Zuschlag)

| Sprint | Dauer | Inhalt |
|--------|-------|--------|
| Sprint 1 | 2 Tage | Supabase Schema + Auth + Persistence ("Ohne Persistence ist alles Kulisse") |
| Sprint 2 | 1,5 Tage | Talentpool-Redesign als Arbeitgeber-Portal + Fachkraefte-Profile |
| Sprint 3 | 2 Tage | Wissenstransfer-Portal + Cross-Portal Event-Kalender |
| Sprint 4 | 1,5 Tage | Kommunikation + Benachrichtigungen (Postfach, Email, Merkliste) |
| Sprint 5 | 1 Tag | Admin-Ausbau + echte Analytics |
| Sprint 6 | 1 Tag | Polish + E2E-Test + Handoff-Dokumentation |
| **Gesamt** | **~9 Tage bei 3-4 parallelen Agents** | |

### 12-Monats-Timeline bis Go-Live

| Phase | Zeitraum | Inhalt |
|-------|----------|--------|
| Phase 1: Foundation | Monat 1-2 | BundID-Integration, Auth, DB-Schema, CI/CD |
| Phase 2: Core Portals | Monat 3-5 | HiArbeit + HiEngagement produktionsreif, API-Wrapper |
| Phase 3: Expansion | Monat 6-8 | HiGruendung + HiErleben + HiWissen, Praktikumsmatching |
| Phase 4: Admin & KI | Monat 9-10 | Admin, KI-Moderation, Reporting, Analytics |
| Phase 5: Launch | Monat 11-12 | UAT, Pen-Test, Performance-Tuning, Go-Live |

### Wie der Prototyp die Leistungsbeschreibung abdeckt
- **Plattformuebergreifende Kernfunktionen** (SSO, Navigation, Profile, Suche, Matching, Moderation, Barrierefreiheit): Alle architektonisch implementiert oder funktional
- **HiArbeit** (Talentpool, B2B, Praktikumsmatching, Job-Matching): Grundstruktur steht, Talentpool-Redesign eingeplant
- **HiEngagement** (Ehrenamts-Matching): Funktional mit Quiz + Match-Scores
- **HiGruendung** (Gruendungsplattform): 5-Phasen-Navigator, Beratung, Ressourcenkarte
- **HiErleben** (Quartiere, Leihothek): Nordstadt-Template, Leihothek mit BundID-Gate
- **HiWissen** (Wissenstransfer): Landing Page, Ausbau in Sprint 3
- **Hosting/Open Source**: Vercel Auto-Deploy, OSS-Stack, opencode.de-ready

---

## 7. FUER DEN SYSADMIN (Technical Insider Section)

### 5 Insider-Signale (natuerlich in die Konversation einstreuen)

1. **MCP-Server fuer Browser-Automation**: "Wir nutzen Chrome DevTools MCP fuer Screenshots nach jedem Merge -- Desktop und Mobile. Kein PR wird gemergt ohne visuelle Verifikation."

2. **Agent-Koordinations-Realitaet**: "Wir haben frueher 5-6 Agents parallel laufen lassen. Dann gelernt: Koordinations-Overhead waechst exponentiell. DeepMind quantifiziert das mit Exponent 1,724. Jetzt maximal 2-3 gleichzeitig."

3. **Context-Window-Engineering**: "PreCompact-Hook persistiert State zu JSON. SessionStart-Hook injiziert Regeln und probt alle tmux-Sessions. Agent ueberlebt Compaction automatisch."

4. **Kein Vibe-Coding**: "Unser Orchestrator hat 4 absolute Regeln. Die erste heisst woertlich 'DU BIST KEIN ENTWICKLER' -- er darf nur Workers spawnen, nie selbst Code schreiben."

5. **Praktiker-Details**: "`unset CLAUDECODE` vor Sub-Agent-Spawn, `tmux capture-pane` statt `sleep` fuer Monitoring, nur Opus-Agents fuer echte Arbeit (Sonnet bleibt stecken)."

### 5 erwartete Fragen + Antworten

**F: "Wie handhabt ihr Hallucinations im generierten Code?"**
> "Drei Ebenen. TypeScript-Compiler faengt Typ-Unsinn sofort. Jeder Worker muss `pnpm typecheck && pnpm build` bestehen. Orchestrator reviewed den PR-Diff vor dem Merge. Strukturierte Specs mit exakten Komponentennamen und Dateipfaden reduzieren Hallucination drastisch."

**F: "Was passiert bei unsicherem Code?"**
> "KI sieht nie Credentials -- `.env.local` ist gitignored. Supabase Row-Level-Security ist auf Datenbankebene erzwungen -- selbst bei einem App-Bug liefert die DB keine unautorisierten Daten. Moderations-Entscheidungen sind deterministisch, nicht LLM-basiert -- kein Hallucinations-Risiko im sicherheitskritischen Pfad."

**F: "Warum Supabase statt eigener Server?"**
> "Supabase IST ein eigener Server. PostgreSQL mit REST-API und Auth-Schicht. Volle Kontrolle: RLS, eigene Funktionen, SQL-Migrationen. Self-hosted-Option verfuegbar. Oder Migration auf nacktes PostgreSQL -- kein Lock-in."

**F: "Ist der Code wartbar ohne KI-Tools?"**
> "256 TypeScript-Dateien, ~29.000 Zeilen, Standard Next.js App Router Patterns. Ein React/TS-Entwickler navigiert sofort. Keine KI-spezifischen Abstraktionen. Ein neuer Entwickler wuerde am Code nicht erkennen, dass er KI-generiert ist -- und genau das ist der Punkt."

**F: "Vendor-Lock-in bei Anthropic?"**
> "Zwei Ebenen. Produkt: Null KI-Abhaengigkeiten im Production-Runtime. Reines Next.js + Supabase + TypeScript. Entwicklung: Orchestrator-Pattern ist modellagnostisch -- tmux-Management, State-Persistence, PR-Review, E2E-Gates funktionieren mit jedem CLI-basierten KI-Tool."

### Wow-Moment fuer den Sysadmin

**"Ein Entwickler. Neun Tage. Zweihundert Commits."**

Dann anbieten: "Wollen Sie sehen, wie der Orchestrator funktioniert? Ich kann Ihnen die tmux-Session zeigen -- Orchestrator in Window 0, Workers in 1-3, PRs werden automatisch erstellt und gemergt."

Er kennt Claude Code. Er hat wahrscheinlich versucht, etwas Aehnliches zu bauen. Er weiss, wie schwer das Koordinationsproblem ist. Das wird ihn faszinieren.

---

## 8. PRAESENTATION: SLIDE-BY-SLIDE CHEAT SHEET

16 Slides, 20 Minuten + 10 Min Q&A.

| # | Headline | 2 Key Points | Dauer |
|---|---------|-------------|-------|
| 1 | **OmniPort Hildesheim -- Vom Prototyp zur Plattform** | Markenfarben korrekt, "2. Vergaberunde" | 0:30 |
| 2 | **Was Sie bereits gesehen haben** | 5 Portale live, Shared-Component-Philosophie, API-Wrapper | 1:30 |
| 3 | **14 Verbesserungen in 13 Tagen** | Pixel-genaues Redesign nach Design-Template, 2 neue Quizze, Mobile-Optimierung | 2:00 |
| 4 | **Vorher/Nachher** (OPTIONAL) | Screenshots links/rechts, "Wir nehmen Ihr Feedback ernst" | 1:00 |
| 5 | **AI-Accelerated, Human-Governed** | KI = Werkzeug nicht Entscheider, jede Zeile menschlich reviewed | 2:00 |
| 6 | **Stripe Case Study** | $1T Zahlungsvolumen + KI-Agents, "Nicht OB, sondern WIE" | 2:00 |
| 7 | **Unsere 5 Guardrails** | Human Review, Tests, CI/CD Gates, Git-Historie, KI sieht keine Produktionsdaten | 2:00 |
| 8 | **Technische Architektur** | Next.js 16, Supabase (Open Source PostgreSQL), kein Vendor-Lock-in | 1:30 |
| 9 | **Shared Components** | Einmal bauen ueberall nutzen, Quiz-Stepper-Beispiel | 1:30 |
| 10 | **API-Wrapper** | Jede Quelle spricht unsere Sprache, Co-Entwicklung nahtlos | 1:00 |
| 11 | **Datensouveraenitaet** *(LANGSAM sprechen!)* | Frankfurt, Open Source, DSGVO by Design, KI sieht nie Nutzerdaten | 2:00 |
| 12 | **Open Source & Transparenz** | opencode.de-ready, kein Vendor-Lock-in, andere Staedte koennen adaptieren | 1:00 |
| 13 | **Sprint-Plan & Timeline** | 12 Monate bis Go-Live, 5 Phasen, regelmaessige Demos | 1:30 |
| 14 | **Risikomanagement** | Prototyp beweist Machbarkeit, KI ist Beschleuniger nicht Abhaengigkeit, Open-Source-Talentpool | 1:00 |
| 15 | **Warum wir** | Geschwindigkeit + Qualitaet + Innovation | 1:00 |
| 16 | **OmniPort gehoert Hildesheim -- nicht uns.** | Open Source, Live-Prototyp, modulare Architektur waechst mit | 1:00 |
| | **Q&A** | | 10:00 |

**Timing-Disziplin**: Slide 11 (Datensouveraenitaet) ist die Vertrauensfolie. LANGSAM sprechen. Bei "14 Verbesserungen in 13 Tagen" kurze Pause -- Zahl wirken lassen. Abschluss-Satz auswendig: "OmniPort gehoert Hildesheim -- nicht uns."

---

## 9. Q&A VORBEREITUNG (Top 15)

### Sicherheit & KI

**F1: "Wie stellen Sie sicher, dass KI-generierter Code sicher ist?"**
> "Drei Ebenen. Erstens: Die KI sieht niemals Produktionsdaten -- sie arbeitet nur mit Quellcode und Mock-Daten. Zweitens: Jeder Code durchlaeuft menschliches Review, automatisierte Tests und Type-Checking. Drittens: Der Code ist Open Source -- Sie koennen ihn jederzeit von einem unabhaengigen Sicherheitsberater auditieren lassen. Wir empfehlen das sogar."

**F2: "Wird unser Code fuer KI-Training verwendet?"**
> "Nein. Wir haben die Trainings-Option explizit deaktiviert. Fuer die Produktionsphase empfehlen wir den Wechsel auf den API-Plan, wo Training vertraglich ausgeschlossen ist und ein vollstaendiger Auftragsverarbeitungsvertrag besteht. Ausserdem: Anthropic ist SOC 2 und ISO 27001 zertifiziert."

**F3: "Was sagt das BSI dazu?"**
> "Das BSI hat gemeinsam mit der franzoesischen ANSSI offizielle Empfehlungen fuer KI-Programmierassistenten veroffentlicht. Kernaussage: KI-Coding ist erlaubt, mit systematischer Risikoanalyse und Sicherheitspruefungen. Genau das machen wir. Das BSI hat ausserdem einen Kriterienkatalog fuer generative KI in der Bundesverwaltung veroffentlicht -- auch den beachten wir."

### DSGVO & Datenschutz

**F4: "Wo liegen die Daten?"**
> "Die Produktionsdaten liegen in Frankfurt. AWS eu-central-1, deutsches Rechenzentrum. Die Daten verlassen Deutschland nicht. Supabase ist Open Source und self-hostable -- falls die Stadt es vorzieht, koennen wir die gesamte Infrastruktur auf eigene Server migrieren."

**F5: "Ist das DSGVO-konform?"**
> "Ja. DSGVO by Design von Tag 1. Die KI-Werkzeuge verarbeiten Code-Muster, keine personenbezogenen Daten. Kein Zugriff auf Produktionsdatenbanken oder Nutzerdaten. Row-Level-Security auf Datenbankebene. BundID fuer foederierte Authentifizierung -- keine eigene Passwort-Speicherung. Loeschkonzept und Datensparsamkeit sind eingeplant."

**F6: "Was ist mit dem EU AI Act?"**
> "KI-Coding-Tools fallen unter 'Minimal Risk' -- keine Registrierung, keine Konformitaetsbewertung noetig. Falls die Plattform selbst KI-Features einsetzt, wie unsere KI-Moderation, ist das hoechstens 'Limited Risk'. Der oeffentliche Sektor hat zudem eine verlaengerte Frist bis August 2030."

### Zuverlaessigkeit & Team

**F7: "Was passiert, wenn die KI-Tools wegfallen?"**
> "Dann entwickeln wir klassisch weiter. Die KI ist ein Beschleuniger, kein tragendes Element. Der Code ist normaler TypeScript/React-Code. Jeder Next.js-Entwickler kann damit arbeiten, mit oder ohne KI. Die Architektur, Tests, CI/CD -- alles voellig unabhaengig von KI."

**F8: "Wie gross ist Ihr Team?"**
> "Wir arbeiten mit einem kleinen, hocheffizienten Team. Unsere KI-gestuetzte Orchestrierung ermoeglicht es uns, die Leistung eines deutlich groesseren Teams zu erreichen. Das haben wir mit dem Prototyp bewiesen: 5 Portale in 9 Tagen. Nach Zuschlag koennen wir bei Bedarf skalieren."

**F9: "Wie laeuft die Zusammenarbeit mit uns?"**
> "Agile Sprints mit 2-Wochen-Zyklen. Regelmaessige Demos an die Stadt. Iterative Entwicklung, genau wie die Leistungsbeschreibung es fordert. Wir zeigen Ihnen alle zwei Wochen den Stand und holen Feedback ein."

### Open Source & Kosten

**F10: "Ist das wirklich Open Source?"**
> "Gesamter Stack: Next.js, Supabase, shadcn/ui, Tailwind -- alles MIT oder Apache 2.0 lizenziert. Keine proprietaeren Abhaengigkeiten. Wir sind bereit fuer opencode.de. Die Stadt kann jederzeit einen zweiten Dienstleister beauftragen -- der Code ist da, die Dokumentation ist da."

**F11: "Vendor-Lock-in?"**
> "Null. Das ist ein Designprinzip. PostgreSQL unter Supabase, Standard-Next.js-Patterns, Open-Source-Komponenten. Wenn Sie in fuenf Jahren den Dienstleister wechseln, nehmen Sie Ihren Code und Ihre Datenbank mit. Findet man ueberall Entwickler fuer."

**F12: "Was kostet das?"**
> "KI-gestuetzte Entwicklung heisst: mehr Features pro Sprint als ein gleich grosses klassisches Team. Sie bekommen mehr fuer Ihr Geld. Konkrete Zahlen besprechen wir gerne im Detail -- wir haben einen transparenten Sprint-basierten Abrechnungsmodus."

### Spezifisch

**F13: "Was ist mit der Barrierefreiheit (BITV 2.0)?"**
> "Von Tag 1 mitgedacht. Unsere UI-Komponenten basieren auf Radix UI -- barrierefrei by Design. ARIA-Labels, Tastaturnavigation, Screenreader-Kompatibilitaet, Barrierefreiheits-Toolbar auf jeder Seite. Fuer die Produktion planen wir einen vollstaendigen BITV-2.0-Audit mit einem spezialisierten Dienstleister."

**F14: "Koennen andere Staedte die Plattform nutzen?"**
> "Ja, das ist ein explizites Designziel. Modulare Architektur plus Open-Source-Lizenz -- jede Kommune kann den Code forken und anpassen. Shared Components sind generisch gebaut. Das passt zum EfA-Prinzip und zum opencode.de-Gedanken."

**F15: "Wie integriert ihr externe Partner (z.B. Praktikumsmatching)?"**
> "Ueber den API-Wrapper. Der externe Partner entwickelt unabhaengig mit eigener Technologie. Sobald eine API existiert, schreiben wir einen Wrapper -- 1-2 Wochen -- und die Daten erscheinen in unserem einheitlichen Design. Saubere Trennung. Haben wir am Beispiel HAZ-Jobportal demonstriert."

---

## 10. SOFORT-AKTIONEN VOR DEM MEETING

### HEUTE ABEND (Kritisch)

- [ ] **Training Opt-Out aktivieren**: claude.ai/settings/data-privacy-controls --> "Improve Claude with your conversations" AUS
- [ ] **Umgebungsvariablen setzen**: `DISABLE_TELEMETRY=1`, `DISABLE_ERROR_REPORTING=1`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`
- [ ] **Leistungsbeschreibung auf KI-Klauseln pruefen**: Gibt es explizite Verbote oder Disclosure-Pflichten?
- [ ] **4 kaputte Seiten**: Entweder fixen (Stellenmarkt, Stadt.Herz, Unternehmenslandschaft, Profil) ODER Demo-Route kennen, die diese Seiten vermeidet
- [ ] **Demo offline vorbereiten**: `cd omniport-hh && npm run dev` auf Port 3001 -- fuer den Fall, dass Vercel/WLAN ausfaellt
- [ ] **Prototyp durchklicken**: Alle 5 Portale, beide Quizze, Admin-Dashboard, Moderation -- auf Fehler pruefen
- [ ] **Abschluss-Satz auswendig**: "OmniPort gehoert Hildesheim -- nicht uns."

### MORGEN FRUEH

- [ ] **Laptop laden** (100%)
- [ ] **Browser-Tabs vorbereiten**: omniport-hh.vercel.app (alle 5 Portale + Admin)
- [ ] **Backup-Hotspot**: Falls WLAN im Rathaus ausfaellt
- [ ] **Stripe Blog-Tab**: stripe.dev/blog/minions (als Referenz, falls gefragt)
- [ ] **BSI-PDF**: BSI/ANSSI AI Coding Assistants auf dem Laptop haben

### FALLS ZEIT BLEIBT (Nice-to-Have)

- [ ] Vorher/Nachher-Screenshots fuer Slide 4 erstellen
- [ ] Orchestrator-Demo vorbereiten (tmux-Session fuer den Sysadmin)
- [ ] Sprint-Plan als 1-Pager drucken (Handout)

---

## 11. WARNUNG: KRITISCHE PUNKTE

### 1. Claude Max Training Policy -- MUSS gefixt werden

**Risiko**: Seit September 2025 wird Code auf Claude Max DEFAULT fuer Training verwendet. Wenn im Meeting die Frage kommt "Wird unser Code fuer KI-Training genutzt?" und die Antwort ist "Ja, default" -- das ist ein Dealbreaker.

**Fix**: Training OPT-OUT aktivieren HEUTE ABEND. Dann kann man ehrlich sagen: "Nein, wir haben das deaktiviert. Fuer die Produktionsphase empfehlen wir den API-Plan mit vertraglichem Ausschluss."

**Langfristig**: Wechsel auf API oder Team-Plan ist PFLICHT fuer oeffentlichen Sektor. Claude Max hat keinen formellen Auftragsverarbeitungsvertrag. Das ist ein DSGVO-Risiko.

### 2. Talentpool-Missverstaendnis

**Problem**: Im Prototyp ist Talentpool ein Studenten-Jobsuch-Portal. Laut Leistungsbeschreibung ist es die Arbeitgeber-Seite (Unternehmen finden Talente). Das wurde im 1. Meeting so gezeigt.

**Fix**: Proaktiv ansprechen. "Nach vertiefter Analyse der Leistungsbeschreibung haben wir festgestellt, dass Talentpool die Arbeitgeber-Perspektive ist. Das Redesign ist Sprint 2. Die Architektur steht -- es ist ein UI/UX-Umbau, kein technischer Neubau."

### 3. 404-Seiten

**Problem**: Stellenmarkt, Stadt.Herz, Unternehmenslandschaft, Profil geben 404 zurueck.

**Fix**: Entweder vorher fixen (mindestens Platzhalter-Seiten) oder Demo-Route so planen, dass diese Links nicht angeklickt werden. Falls der Sysadmin sie findet: "Diese Seiten sind in unserem Sprint-Plan -- Stellenmarkt und Profil sind P0, die anderen P1."

### 4. Copyright-Landmine

**Problem**: GEMA v. OpenAI (LG Muenchen, Nov 2025) hat entschieden, dass KI-Training Copyright verletzen kann. Falls jemand fragt: "Kann KI-generierter Code urheberrechtlich geschuetzte Fragmente enthalten?"

**Antwort**: "Theoretisch ja -- deshalb integrieren wir Lizenz-Scanning in unsere CI/CD-Pipeline. Wir behandeln KI-generierten Code wie Third-Party-Code: Pruefung auf Lizenz-Compliance vor jedem Merge."

### 5. Kein formeller DPA

**Problem**: Claude Max hat keinen formellen Auftragsverarbeitungsvertrag (AVV/DPA). Fuer oeffentlichen Sektor ist das ein formeller Mangel.

**Antwort**: "Wir sind uns bewusst, dass fuer die Produktionsphase ein formeller AVV noetig ist. Anthropic bietet das im Team- und Enterprise-Plan an. Der Wechsel ist fuer die Projektphase eingeplant."

### 6. "Wer hat das alles gebaut?"

**Problem**: Die Frage nach der Teamgroesse kann heikel sein. "Ein Entwickler mit KI" klingt duenn.

**Antwort**: "Unser Team nutzt KI-gestuetzte Orchestrierung -- mehrere KI-Agents arbeiten parallel an verschiedenen Modulen, koordiniert durch einen Orchestrator. Das ist der Grund fuer die Geschwindigkeit. Der menschliche Architekt steuert, prueft und entscheidet. Es ist wie ein Dirigent mit einem Orchester -- der Dirigent spielt nicht alle Instrumente, aber er steuert das Ergebnis."

---

## SCHNELLREFERENZ: KONVERSATIONSFLUSS

1. **Oeffnen mit Velocity**: "Vom leeren Repo zur funktionalen Plattform in 9 Tagen."
2. **Erklaren warum**: "Nicht Vibe-Coding -- ein engineered Orchestration-System mit Disziplin."
3. **Trust aufbauen**: BSI-Leitlinien, Stripe Case Study, Fortune 100 Adoption.
4. **Bedenken vorwegnehmen**: "Die KI sieht nie Produktionsdaten. Training ist deaktiviert. Alles Open Source und auditierbar."
5. **Schliessen**: "OmniPort gehoert Hildesheim -- nicht uns."

---

## NOTFALL-STRATEGIEN

| Situation | Reaktion |
|-----------|---------|
| Vercel ist down | Localhost vorbereitet: `npm run dev`, Port 3001 |
| WLAN im Rathaus faellt aus | Mobile Hotspot, Demo auf Localhost |
| Technische Frage, die man nicht beantworten kann | "Das pruefe ich und liefere die Antwort innerhalb von 24 Stunden." |
| Kritik an KI-Einsatz | Stripe Case Study + Guardrails + BSI-Leitlinien. "Die Frage ist nicht ob, sondern wie verantwortungsvoll." |
| 404-Seite wird entdeckt | "Diese Seiten sind in unserem Sprint-Plan eingeplant -- [P0/P1] Prioritaet." |
| "Das ist ja nur ein Prototyp" | "Korrekt -- und genau das ist der Punkt. Andere Bieter zeigen PowerPoints. Wir zeigen lauffaehigen Code." |

---

*Consolidated from 10 research documents. Erstellt 2026-03-30. Viel Erfolg morgen, Burak.*
