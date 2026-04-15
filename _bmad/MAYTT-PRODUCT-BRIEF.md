# MAYTT Content Engine -- Product Brief

**Datum:** 2026-04-05
**Version:** 1.0
**Erstellt von:** BMAD PM Agent
**Status:** Draft

---

## 1. Problem Statement

Ali und Burak betreiben ein TikTok-Content-Business ("MAYTT" / GenMedia), das auf kombinatorischer Video-Generierung basiert: Influencer-Clips + Produkt-Clips + Text-Overlays = fertige TikTok Shorts. Bisher lauft die gesamte Pipeline uber:

- **Airtable** als Datenbank UND UI (Buttons triggern Workflows)
- **N8N** als Workflow-Engine (Webhook-basiert, 3 Branches)
- **Creatomate** fur Overlay-PNG-Rendering
- **Google Drive** als Video-Storage

### Die Probleme

1. **Airtable ist kein App-Frontend.** Ali (non-technical) navigiert Airtable-Tabellen mit 1.132 Records, 50+ Spalten und verknupften Tabellen. Kein Mensch will so arbeiten.
2. **N8N ist fragil.** Webhook-basiert, keine Queue, kein Retry, kein Error-Handling. Creatomate-API-Key im Klartext.
3. **Kein Video-Preview.** Ali sieht erst nach dem Render, ob die Kombination funktioniert. Kein Live-Preview.
4. **Kein Social Media Management.** Publishing passiert manuell -- Video runterladen, TikTok offnen, hochladen, Produkt verknupfen.
5. **Kein Analytics-Dashboard.** Metriken (Views, Likes, Engagement) werden manuell in Airtable-Felder eingetragen.
6. **TikTok Shop Product-Linking hat kein API.** Der kritischste Schritt (Produkt an Video verknupfen) ist nur manuell oder per Browser-Automation moglich.
7. **Kein AI-Tool-Zugang fur Ali.** Burak testet AI-Modelle (Fal AI, Flux, Kling) individuell. Ali hat keinen Zugang zu diesen Tools und kann nicht selbst experimentieren.

### Was funktioniert

- Das **kombinatorische Modell** ist bewiesen: 1.132 Videos aus 45 Influencer-Clips x 50 Produkt-Clips x 32 Overlays.
- Die **"Ist das ein Preisfehler?"-Hook** funktioniert als Content-Format.
- **Google Drive** als Asset-Storage ist eingespielt (Ali kennt sich damit aus).
- **Mehrere TikTok-Accounts** sind aufgebaut (GenMedia-Okosystem).

---

## 2. Vision

**Eine einzige Web-Anwendung, in der Ali den gesamten Content-Workflow steuert** -- von der Video-Kombination uber Preview und Rendering bis zum geplanten Multi-Plattform-Publishing mit Analytics. Burak baut und wartet, Ali operiert.

Langfristig: Ein SaaS-Tool fur Content-Creator, die systematisch Short-Form-Content aus Bausteinen generieren und uber mehrere Plattformen publizieren wollen.

---

## 3. Zielgruppe & Personas

### Persona 1: Ali (Primar-Nutzer)

| Attribut | Details |
|----------|---------|
| **Rolle** | Content-Operator, Business-Partner |
| **Technisches Level** | Non-technical. Nutzt Airtable, Google Drive, TikTok-App. Kein Code. |
| **Tagesablauf** | Kombinationen erstellen, Videos rendern, auf TikTok publishen, Metriken checken |
| **Pain Points** | Airtable-Navigation komplex, kein Preview, manuelles Publishing, kein Analytics-Uberblick |
| **Motivation** | Mehr Videos pro Tag, weniger manuelle Arbeit, bessere Performance-Insights |
| **Gerate** | Desktop (primare Nutzung), Smartphone (Metriken-Check) |
| **Sprache** | Deutsch |

**Ali braucht:**
- Ein Formular (nicht eine Datenbank-Tabelle) zum Erstellen von Kombinationen
- Live-Preview bevor gerendert wird
- Ein Dashboard, das ihm sofort zeigt: "Welcher Content performt?"
- One-Click-Publishing (oder Scheduling) statt manueller Upload-Prozedur
- Zugang zu AI-Generierungs-Tools ohne technisches Wissen

### Persona 2: Burak (Sekundar-Nutzer)

| Attribut | Details |
|----------|---------|
| **Rolle** | Entwickler, System-Architekt, Business-Co-Owner |
| **Technisches Level** | Hoch. Claude Code, N8N, APIs, DevOps. |
| **Tagesablauf** | System bauen/warten, neue Features entwickeln, AI-Modelle evaluieren |
| **Pain Points** | N8N ist fragil, Airtable-Limits, kein systematisches AI-Modell-Benchmarking |
| **Motivation** | Skalierbare Infrastruktur, AI-Modelle systematisch vergleichen, SaaS-Potenzial |

**Burak braucht:**
- Admin-Zugang mit System-Monitoring
- AI Generation Studio mit Multi-Model-Vergleich und Benchmark-System
- Template-Editor fur Remotion-Konfigurationen
- Kampagnen-Management auf System-Ebene

### Persona 3: Zukunftige Content-Creator (Tertiar)

Potenzielle SaaS-Kunden, die ahnliche Content-Pipelines aufbauen wollen. Nicht im MVP-Scope, aber Architektur-Entscheidungen sollen Multi-Tenancy nicht ausschliessen.

---

## 4. Produktziele & Erfolgskriterien

### Ziele

| # | Ziel | Zeithorizont |
|---|------|-------------|
| Z1 | Ali kann den gesamten Workflow ohne Airtable/N8N bedienen | Phase 1 (Woche 1-2) |
| Z2 | Live-Preview vor dem Rendering eliminiert Fehl-Renders | Phase 1 |
| Z3 | Multi-Plattform-Publishing (TikTok, Instagram, YouTube) aus einer Oberflache | Phase 2 (Woche 3-4) |
| Z4 | Performance-Dashboard zeigt, welcher Content funktioniert | Phase 3 (Woche 5-6) |
| Z5 | TikTok Shop Product-Linking automatisiert | Phase 4 (Woche 7-8) |
| Z6 | AI Generation Studio als eigenstandiges Tool nutzbar | Phase 3+ |

### Erfolgskriterien

| Metrik | Baseline (heute) | Ziel (nach MVP) |
|--------|------------------|-----------------|
| Videos pro Tag (Ali) | ~10-20 (manuell) | 50+ (automatisiert) |
| Zeit pro Video (Kombination bis Publish) | ~15 min | <2 min |
| Fehl-Renders (ohne Preview) | ~20% | <5% |
| Plattformen pro Publish | 1 (TikTok manuell) | 3 (TikTok + IG + YT) |
| Metriken-Erfassung | Manuell in Airtable | Automatisch gepollt |
| AI-Modell-Vergleiche pro Woche | 0 (Ali hat keinen Zugang) | 10+ |

---

## 5. Feature-Ubersicht

### Kern-Feature 1: Kombinatorische Video-Pipeline

Migration der bestehenden N8N-Pipeline in die Web-App. Das Herzstuck des Geschafts.

| Komponente | Beschreibung |
|------------|-------------|
| Asset-Management | Influencer-Clips, Produkt-Clips, Overlays verwalten (Import aus Google Drive) |
| Kombinations-Generator | Influencer + Produkt + Overlay kombinieren mit UNIQUE Constraint (Dedup) |
| Remotion Player | Live-Preview der Kombination im Browser BEVOR gerendert wird |
| Lambda-Rendering | Serverless-Rendering uber AWS Lambda ($0.01-0.05/Video) |
| Batch-Generierung | Analog zu GENERATION_CONFIG: Auto Generate All, Manual Selection, etc. |
| Status-Pipeline | To Render -> Rendering -> Rendered -> Ready -> Scheduled -> Published -> Archived |

### Kern-Feature 2: Social Media Dashboard & Planner

Multi-Plattform Content-Management und Analytics.

| Komponente | Beschreibung |
|------------|-------------|
| Account-Verwaltung | TikTok, Instagram, YouTube Accounts verbinden (OAuth) |
| Content Calendar | Visuelle Kalenderansicht aller geplanten/publizierten Posts |
| Post-Queue | Automatisches Scheduling mit BullMQ + Redis |
| Publishing | Video-Upload uber offizielle APIs (TikTok, IG Graph API, YT Data API) |
| Metriken-Dashboard | Views, Likes, Comments, Engagement Rate pro Account und Video |
| Performance-Vergleich | Analyse nach Overlay/Produkt/Influencer: "Welcher Hook performt am besten?" |

### Kern-Feature 3: AI Generation Studio

Custom Frontend fur Fal AI -- schoner und einfacher als fal.ai direkt.

| Komponente | Beschreibung |
|------------|-------------|
| Explore Mode | Einzelne Modelle testen, Two-Panel-Design (Controls links, Preview rechts) |
| Compare Mode | Single Prompt -> bis 5 Modelle parallel -> Side-by-Side Grid |
| Benchmark Mode | Reusable Test-Suites, re-runnable bei neuen Modellen |
| ELO-Rating | Pairwise-Vergleich fur Modell-Ranking |
| Auto-Save | Jede Generierung gespeichert mit Tags, Collections, Suche |
| Model Cards | Human-readable Labels ("Stark bei: Photorealismus, Portraits") |
| Cost Estimates | Kostenanzeige VOR dem Generieren |
| AI Prompt Enhancement | User schreibt grobe Idee, AI verbessert den Prompt |

### Kern-Feature 4: TikTok Shop Automation

Browser-Automation fur den kritischen Schritt, den keine API bietet.

| Komponente | Beschreibung |
|------------|-------------|
| Video-Upload | Offizielle TikTok Content Posting API |
| Product-Linking | Playwright Browser-Automation (Post-Publication uber Creator Center) |
| CPL-Monitoring | Content Posting Limits pro Account tracken (max 5 Shop-Videos/7 Tage bei <5K Followern) |
| Multi-Account-Isolation | Separate Browser-Profile, Cookie-Auth, Fingerprinting |

### Zusatz-Features (Post-MVP)

| Feature | Beschreibung | Prioritat |
|---------|-------------|-----------|
| AI Agent | Natural Language -> Remotion Template-Anpassung (Claude API + Remotion Skills) | Hoch |
| Kampagnen-System | Videos gruppieren, Budget/Performance pro Kampagne tracken | Mittel |
| Computer-Use Agent | Erweiterte Browser-Automation fur TikTok Shop (jenseits Product-Linking) | Mittel |
| Multi-Format-Content | Nicht nur TikTok Shorts, auch YouTube Longs, Instagram Carousels | Niedrig |
| SaaS Multi-Tenancy | Weitere Content-Creator als Kunden onboarden | Zukunft |

---

## 6. Bestatigte Technologie-Entscheidungen

| Layer | Technologie | Begrundung |
|-------|------------|------------|
| **Frontend** | Next.js 15 + React 19 + shadcn/ui + Tailwind | Remotion Player nativ integrierbar, bewahrter Stack |
| **Auth** | Supabase Auth | OAuth fur Social Platforms, einfach fur Ali |
| **Datenbank** | Supabase PostgreSQL | Relationale Kombinations-Queries, UNIQUE Constraints |
| **File Storage** | Google Drive (Assets) + S3/R2 (Render-Output) | Ali behalt Google-Drive-Zugriff, S3 fur Lambda-Output |
| **Video Engine** | Remotion + AWS Lambda | Template-basiert, React-Komponenten, $0.01-0.05/Render |
| **Job Queue** | BullMQ + Redis (Upstash) | Post-Scheduling, Render-Queue |
| **Social APIs** | Provider-Pattern (Postiz-inspiriert) | TikTok, IG, YT abstrahiert hinter einheitlichem Interface |
| **TikTok Shop** | Playwright + Cookie-Auth + playwright-stealth | Einziger Weg fur Product-Linking (kein API) |
| **AI Generation** | Fal AI (unified API, 985+ Endpunkte) | 30-50% gunstiger als Alternativen, bestes Modell-Angebot |
| **AI Agent** | Claude API + Remotion AI Skills | Natural Language -> Video-Edits |

---

## 7. Kosten-Schatzung

### MVP Phase ($15-75/mo)

| Posten | Monatlich |
|--------|----------|
| Supabase Free Tier | $0 |
| Remotion Lizenz (<=3 Personen) | $0 |
| AWS Lambda (1.000 Renders) | $10-50 |
| S3 Storage (Render-Output) | ~$5 |
| Redis (Upstash Free Tier) | $0 |
| Vercel (Hobby -> Pro) | $0-20 |
| **Total MVP** | **$15-75/mo** |

### Scale Phase (10.000+ Videos/mo, $225-625/mo)

| Posten | Monatlich |
|--------|----------|
| Remotion Automator | $100 |
| AWS Lambda (10.000 Renders) | $100-500 |
| Supabase Pro | $25 |
| **Total Scale** | **$225-625/mo** |

### Vergleich mit Ist-Zustand

| Posten | Aktuell | MAYTT App |
|--------|---------|-----------|
| Airtable | $20+/mo (Pro) | $0 (ersetzt durch Supabase Free) |
| N8N (Self-Hosted) | Server-Kosten | $0 (ersetzt durch App-interne Logik) |
| Creatomate | Per-Render | $0 (ersetzt durch Remotion) |
| Manueller Aufwand (Ali) | ~4h/Tag | ~1h/Tag |

---

## 8. Competitive Landscape

### Direkte Wettbewerber (Kombinatorische Video-Pipeline)

Es gibt **keinen direkten Wettbewerber**, der alle vier Kern-Features kombiniert. Das ist eine Nische:

| Tool | Video-Pipeline | Social Planner | AI Studio | TikTok Shop |
|------|---------------|----------------|-----------|-------------|
| **MAYTT (unser Produkt)** | Ja | Ja | Ja | Ja |
| Postiz | Nein | Ja (30+ Plattformen) | Nein | Nein |
| Mixpost | Nein | Ja (begrenzt) | Nein | Nein |
| Creatomate | Ja (API-only) | Nein | Nein | Nein |
| Remotion Studio | Ja (Editor, kein Pipeline-Tool) | Nein | Nein | Nein |
| Leonardo.ai | Nein | Nein | Ja (Image-fokussiert) | Nein |
| Artificial Analysis | Nein | Nein | Teilweise (Vergleich) | Nein |

### Indirekte Wettbewerber

| Kategorie | Tools | Warum nicht ausreichend |
|-----------|-------|------------------------|
| Social Media Planner | Buffer, Hootsuite, Later, Postiz | Kein Video-Rendering, keine Video-Pipeline |
| Video-Rendering | Creatomate, Shotstack, Bannerbear | API-only, kein Social Planning, kein AI Studio |
| AI Generation | Runway, Kling, Freepik, Leonardo | Kein kombinatorisches Video-Modell, kein Publishing |
| TikTok Tools | TikTokAutoUploader, Composio | Kein Shop-Product-Linking, keine Pipeline |

### Marktlucke

Die Kombination aus **systematischer Video-Generierung aus Bausteinen** + **Multi-Plattform-Publishing** + **AI-Model-Exploration** existiert nicht als Produkt. Das ist MAYTTs Differenzierung.

---

## 9. Constraints & Risiken

### Technische Constraints

| Constraint | Impact | Mitigation |
|-----------|--------|------------|
| TikTok hat kein API fur Product-Linking | Playwright-Automation nohtig, fragil | Modulare Selektoren, regelmaessige Wartung, playwright-stealth |
| TikTok hat kein natives Scheduling-API | Queue selbst bauen (BullMQ) | Eigene Scheduling-Logik, zuverlassiger als API-Abhangigkeit |
| YouTube Upload-Quota: 6 Uploads/Tag | Skalierung limitiert | Quota-Erhohung beantragen, Content priorisieren |
| TikTok CPL: Max 5 Shop-Videos/7 Tage (<5K Follower) | Multi-Account-Strategie nohtig | Account-Rotation, CPL-Monitoring-Dashboard |
| TikTok App Review: 2-4 Wochen | Verzohgert Social-Integration | Frueh beantragen, parallel zum UI-Build |
| Fal AI File-Retention: 7 Tage | Generierungen mussen heruntergeladen werden | Auto-Download nach Generierung, in eigenen Storage speichern |

### Business-Risiken

| Risiko | Schwere | Mitigation |
|--------|---------|------------|
| TikTok Account-Ban durch Automation | Hoch | Cookie-Auth, human-like Delays, Account-Warmup |
| TikTok UI-Anderungen brechen Playwright-Automation | Hoch | Modulare Selektoren, Weekly-Check, Fallback auf manuell |
| Shadow Ban (reduzierte Reichweite) | Mittel | View-Monitoring pro Account, Rotation |
| TOS-Verstoss durch Browser-Automation | Sicher (akzeptiert) | Branchenuebliches Risiko, kein Unique-Risk |
| Remotion-Lizenz wird teurer | Niedrig | Twick als Fallback-Alternative evaluiert ($0 Lizenz) |

### Annahmen

1. Ali kann ein modernes Web-Interface bedienen (shadcn/ui, keine komplexe IDE)
2. Google Drive bleibt als Asset-Storage (keine Migration nohtig)
3. Das kombinatorische Video-Modell (Influencer + Produkt + Overlay) bleibt das Kern-Format
4. Fal AI bleibt verfugbar und preislich attraktiv (985+ Modelle, 30-50% gunstiger)
5. Remotion Lambda-Rendering bleibt stabil und kosteneffizient
6. TikTok Shop erlaubt weiterhin Affiliate/Product-Content (kein Platform-Policy-Shift)

---

## 10. Bestehende Assets (Migration)

| Asset | Menge | Speicherort | Migration |
|-------|-------|------------|-----------|
| Generierte Videos | 1.132 | Google Drive | GDrive-IDs in Supabase importieren |
| Influencer-Clips | 45 | Google Drive | Referenzen migrieren, alle "Redhead"-Persona |
| Produkt-Clips | 50 | Google Drive | Referenzen + Produkt-Verknupfung migrieren |
| Text-Overlays | 32 | Airtable + Creatomate | Texte migrieren, Rendering auf Remotion umstellen |
| Produkt-Katalog | 50 | Airtable | Nach Supabase migrieren |
| Batch-Configs | 26 | Airtable | GENERATION_CONFIG-Logik in App nachbauen |
| TikTok-Accounts | Mehrere | GenMedia-Okosystem | OAuth-Verbindung herstellen |

---

## 11. Phasenplan (High-Level)

| Phase | Zeitrahmen | Fokus | Deliverables |
|-------|-----------|-------|-------------|
| **Phase 1** | Woche 1-2 | Core Pipeline | Supabase-Schema, Asset-Management, Remotion Template, Player Preview, Lambda-Rendering, Kombinations-Generator |
| **Phase 2** | Woche 3-4 | Social Integration | TikTok/IG/YT API-Anbindung, Post-Scheduling, Publishing-Queue |
| **Phase 3** | Woche 5-6 | Dashboard & AI Studio | Metriken-Dashboard, Content Calendar, AI Generation Studio (Explore + Compare) |
| **Phase 4** | Woche 7-8 | Automation & Advanced | Playwright TikTok Shop, Multi-Account, CPL-Monitoring, AI Agent |

---

## 12. Offene Fragen

1. **Video-Editor in Phase 2+?** Remotion Player + Form reicht fur MVP. Soll spater ein voller Timeline-Editor (Twick, DesignCombo, Editor Starter Kit) integriert werden?
2. **Multi-Tenancy-Architektur von Anfang an?** Oder erst bei SaaS-Launch nachrustbar?
3. **Airtable-Migration: Big Bang oder schrittweise?** Airtable sofort abschalten oder parallel laufen lassen?
4. **Hosting: Vercel oder Self-Hosted?** Vercel fur Einfachheit vs. Self-Hosted fur Playwright-Container?
5. **Remotion vs. Twick langfristig?** Remotion hat Lizenzkosten bei Scale, Twick ist kostenlos aber weniger matur.
