# Discovery Master: Content Strategy + Voice AI + Personal Brand

**Datum:** 2026-04-05
**Status:** Comprehensive Discovery — alles was gefunden wurde
**Zweck:** Gesamtübersicht aller verstreuten Assets, Projekte, Dokumente und Pläne

---

## 1. BESTANDSAUFNAHME: Voice AI Projekte

### 1.1 ColdyAI — German AI Sales Platform
- **Pfad:** `/Users/buraksmac/Desktop/code/coldyAI/`
- **Stack:** Next.js + LiveKit + Resemble AI + Cartesia TTS + AssemblyAI STT + OpenAI GPT-4.1-mini
- **Status:** 95% fertig — Frontend komplett, Backend braucht nur ENV-Konfiguration
- **Features:**
  - Deutscher KI-Sales-Agent mit GDPR/UWG-Compliance
  - SIP-Trunk-Integration für echte Outbound-Calls
  - Human Escalation / Takeover
  - Call Tracking, Recording, Transcription
  - Real-time Call Monitoring Dashboard
  - Burak's echte Nummer (+4917682479575) als Test-Ziel konfiguriert
- **Was fehlt:** LiveKit Server URL, Twilio SIP Trunk Setup, API Keys
- **Letzter Commit:** Nov 2024
- **Potenzial:** Sofort deploybar mit API-Keys, könnte als Handover- oder Hosted-Solution verkauft werden

### 1.2 LivekitDemo — Client-spezifische Voice Agent Demos
- **Pfad:** `/Users/buraksmac/Desktop/code/LivekitDemo/`
- **Stack:** Python + LiveKit + OpenAI + Deepgram + Silero VAD + Noise Cancellation
- **Benannte Demos (= Kunden/Branchen):**
  - `main.py` — Fahrschule 123 (Termin-Buchung via Google Calendar)
  - `blitz.py`, `doll.py`, `erb.py`, `fpdemo.py` — weitere Client-Demos
  - `gvo.py`, `leitner.py`, `madia.py`, `rohrmann.py`, `rokis.py` — deutsche Unternehmen
  - `gemini.py`, `gemini_copy.py` — Gemini-basierte Varianten
  - `blitzrealtime.py` — Realtime-Variante
- **Features:** SIP Trunks (inbound + outbound), Dispatch Rules, Google Calendar Integration
- **Letzter Commit:** Sep-Okt 2025
- **Erkenntnis:** Burak hat bereits ~10 verschiedene Voice Agent Demos für unterschiedliche Branchen gebaut!

### 1.3 production-app — Voice AI SaaS (Monorepo)
- **Pfad:** `/Users/buraksmac/Desktop/code/production-app/`
- **Stack:** Next.js + Supabase + Twilio + shadcn/ui + Monorepo (apps/, packages/, scripts/)
- **BMAD-managed:** Stories, Sprints, Epics (Epic 3: Observation, Epic 4: Lead Management, Epic 5: Agent Config)
- **Features:** shadcn Theme, Mobile Sidebar, Agent Branch Assignments
- **Letzter Commit:** Nov-Dez 2025
- **Status:** Fortgeschrittenes SaaS-Projekt mit Sprint-Tracking

### 1.4 ultravox-demo + ultravox-incoming-calls
- **Pfad:** `/Users/buraksmac/Desktop/code/ultravox-demo/` + `ultravox-incoming-calls/`
- **Stack:** Ultravox + Twilio + MDX Docs
- **Letzter Commit:** Jan-März 2025
- **Status:** Demo/POC-Phase

### 1.5 craftcodedashboard — Dashboard mit Voice Hero
- **Pfad:** `/Users/buraksmac/Desktop/code/craftcodedashboard/with-supabase-app/`
- **Hat:** `voice-hero.tsx` Komponente
- **Stack:** Supabase-basiert

### 1.6 gptrealtime — GPT Realtime API
- **Pfad:** `/Users/buraksmac/Desktop/code/gptrealtime/`
- **Status:** Minimal — nur weather_agent.py
- **Letzter Commit:** Sep 2025

---

## 2. BESTANDSAUFNAHME: Content & Brand Projekte

### 2.1 CraftCode Website
- **Pfad:** `/Users/buraksmac/Desktop/code/CraftCodeWebsite/`
- **Zwei Versionen:**
  - `craftcodeaiwebsite/` — ältere Version
  - `craftcodewebsite-fromscratch/` — Neuaufbau mit Cal.com Booking-Integration
- **Brand:** CraftCode (AI Agency Branding)
- **Letzter Commit:** März-Mai 2025

### 2.2 MAYTT Content Engine
- **N8N Workflow:** `~/Downloads/My workflow 2 MAYTT N8n.json`
- **Airtable:** `appfov1BJeVyrojsi` (1.132 generierte Videos, 45 Influencer, 50 Produkte, 32 Overlays)
- **PRD:** `/Users/buraksmac/Desktop/code2/orchestrator/_bmad/MAYTT-PRD.md`
- **Product Brief:** `/Users/buraksmac/Desktop/code2/orchestrator/_bmad/MAYTT-PRODUCT-BRIEF.md`
- **Status:** N8N PoC funktioniert, Web App geplant (Remotion + Next.js + Supabase)
- **Partner:** Cousin Ali (non-technical, Content-Operator)
- **Revenue:** <€200 vor TikTok-Format-Restrictions
- **Modell:** Kombinatorisch: Influencer-Clips × Produkt-Clips × Overlays = Videos
- **Ziel-Stack:** Remotion (Video), Fal AI (Media Gen), AWS Lambda ($0.01-0.05/Render)
- **AI Media Landscape Research:** `/Users/buraksmac/Desktop/code2/orchestrator/_bmad/research/AI-MEDIA-API-PLATFORM-LANDSCAPE-2026.md`

---

## 3. BESTANDSAUFNAHME: Lead Gen & Sales

### 3.1 Lead-Listen (Desktop)
- **Solar Leads:** `~/Desktop/Desktop/leadlists/solar leads.csv` + `solar leads komplett.csv`
- **Kosmetik Leads:** `~/Desktop/Desktop/leadlists/Kosmetik Full.csv`
- **Schlüsseldienste:** `~/Desktop/Desktop/leadlists/Schlüsseldienste.csv` + `.numbers`
- **Company Export:** `~/Desktop/Desktop/leadlists/Find-Companies-Table-(3)-Default-view-export-1747411640356.csv`
- **GenMedia Automation:** `~/Desktop/Desktop/leadlists/genmedia_automation.json`
- **Bewilligungsbescheid:** `~/Desktop/Desktop/leadlists/20250206_095405_Bewilligungsbescheid.pdf`

### 3.2 Levenz Solar — Bachelorarbeit-Projekt
- **Pfad:** `/Users/buraksmac/Desktop/code/LEVENZ SOLAR/`
- **Stack:** Python + OpenAI (gpt-4o-mini) + Pandas + Pydantic
- **Zweck:** LLM-basierte Solarmodul-Klassifizierung aus CSV-Daten
- **Status:** MVP komplett, für Bachelorarbeit
- **PRD:** `~/Downloads/solar-classifier-prd.md`
- **Docs Ordner:** `~/Desktop/Desktop/Levenz Docs/`

---

## 4. BESTANDSAUFNAHME: Business-Dokumente

### 4.1 Geschäftspläne (Jobcenter/Gründung)
- `~/Desktop/Desktop/Geschäftsplan Burak Ertuerk 2. Revision.docx`
- `~/Desktop/Desktop/Geschäftsplan Burak Ertuerk Final.docx`
- `~/Desktop/Desktop/Geschäftsplan Burak Ertuerk Korrigiert.pdf`
- `~/Desktop/Desktop/Geschäftsplan Burak Ertuerk1.pages`
- `~/Desktop/Desktop/Geschäftsplan Burak Ertuerk11.docx`
- `~/Downloads/Geschäftsplan Burak Ertuerk.docx` + `.pdf` + `(1).pdf`
- `~/Downloads/Businessplan Vorlage.docx`
- `~/Downloads/Geschäftsplan - Vorlage.docx`

### 4.2 Planungstool Grone (Jobcenter)
- `~/Desktop/Desktop/Planungstool Grone - Burak Ertürk Final.xlsx`
- `~/Desktop/Desktop/Planungstool Grone - Burak Ertürk.xlsx` + `.numbers` + `.pdf`
- `~/Desktop/Desktop/Planungstool Grone Bearbeitet - Burak Ertürk.xlsx` + `.numbers`
- `~/Downloads/Planungstool Grone.xlsx`

### 4.3 Kooperationspläne
- `~/Downloads/20251015_114129_Mein_Kooperationsplan.pdf` (Okt 2025)
- `~/Downloads/20260216_102141_Mein_Kooperationsplan.pdf` (Feb 2026)

### 4.4 Voice AI Agency Dokumente
- `~/Downloads/Voice AI Agency Modelle.pdf` — **6 Business-Modelle** (Handover $1K-$30K+, Usage-Based $0.20-$3/min, Hosted $500-$3K/mo, Support $500-$3K/mo, Monitoring $1.5K-$3K/mo, Enterprise $10K+)
- `~/Downloads/Voice AI Agentur Angebote.pdf` — gleicher Inhalt
- `~/Downloads/Business Starter Setup Voice AI Bootcamp.pdf` — Bootcamp-Material
- `~/Downloads/$100M Branding Playbook.pdf` — **Hormozi!**

### 4.5 Client-Projekte
- `~/Downloads/Kälte Aktiv Team GmbH - Projektplan KI Chatbot.pdf`
- `~/Downloads/Projektplan - Voice Agent - Kälte Aktiv Team GmbH - - Google Docs.pdf`
- `~/Downloads/Projektplan Voice Agent Kälte Aktiv Team.pdf`
- **Erkenntnis:** Kälte Aktiv Team war ein echter Client für Voice Agent!

### 4.6 Weitere Downloads
- `~/Downloads/Labertaschi Voice-to-Text Tool.zip`
- `~/Downloads/n8n - VAPI_____Cal_com.json` — VAPI + Cal.com N8N Workflow
- `~/Downloads/n8n Gsheet Recording.json` (2 Versionen)
- `~/Downloads/My workflow 2 n8n generation agent.json`
- `~/Downloads/Invoice-8RAJAUMV-0004.pdf`

---

## 5. BESTANDSAUFNAHME: Research & Strategy (Orchestrator)

### 5.1 Hormozi Framework (komplett encoded)
- **Katalog:** `research/catalogue/reference/hormozi-framework-encoding.md`
- **Quelle:** `research/2026-03-06_research-hormozi-system-encoding.md`
- **$100M Branding Playbook:** `~/Downloads/$100M Branding Playbook.pdf`
- **Inhalt:**
  - Value Equation: `VALUE = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)`
  - Grand Slam Offer: 7-Step Process
  - CLOSER Sales Framework
  - Core Four Lead Generation (Warm Outreach, Cold Outreach, Free Content, Paid Ads)
  - 4-Agent Architecture (Offer Architect, Lead Machine, Sales Script Builder, Content Engine)
  - 5 Notion-Datenbank-Schemas (Offers, Leads, Content Calendar, Sales Scripts, Avatars)
  - Content Engine: Hook-Retain-Reward, 50-Hook Library, 5 Post Templates, 3.5:1 Give-to-Ask Ratio

### 5.2 Lead Gen Pipeline Architecture
- **Katalog:** `research/catalogue/reference/lead-gen-pipeline-architecture.md`
- **6-Stage Pipeline:** Discover → Qualify → Build → Outreach → Close → Deliver
- **UWG-Compliance:** Cold Email VERBOTEN, Physical Mail + Cold Calling ERLAUBT
- **Revenue-Projektion:** EUR 171K Year 1, Break-even bei 3 Deals/Monat
- **3-Tier Pricing:** Starter €499, Professional €149/mo, Wachstum €499/mo

### 5.3 Master Blueprint — 5 Business Lines
- **Katalog:** `research/catalogue/reference/master-blueprint.md`
- **Business Lines:**
  1. **Client Work** (Anchor Revenue) — L-Thread Orchestrator, €15K-50K Fixed-Price Sprints
  2. **SaaS Factory** — "12 in 12" Pattern, Kill bei <100 Users AND <$200 MRR @ Week 12
  3. **Lead Gen Swarm** — Scrape → Qualify → Demo Page → Briefpost → Convert
  4. **Finance Agent** (läuft bereits daily via LaunchAgent)
  5. **Marketing Engine** — Offer Architect, Lead Magnet Builder, Content Agent, Outreach Agent

### 5.4 IndyDevDan — Content-Vorbild
- **Katalog:** `research/catalogue/practitioners/indydevdan.md`
- **Relevanz:** Content-Format (kein Gesicht, nur Screen + Stimme + Hände)
- **Modell:** Weekly YouTube, 20+ Open-Source Repos, Paid Courses, Blog
- **Key Quote:** "Tools shape what you believe is possible"
- **Differences:** Dan optimiert für Solo-Practitioner, Burak für Multi-Agent Delivery

### 5.5 Greg Isenberg — Distribution-Strategien
- **Katalog:** `research/catalogue/talks/2026-03-30_greg-isenberg-stop-vibe-coding-distribution.md`
- **7 Strategien:** MCP as Distribution, Programmatic SEO, Free Tool Marketing, AEO, Viral Artifacts, Newsletter Acquisition, AI Content Repurposing
- **Key Quote:** "Distribution is the new moat — AI can build the product, but it can't build your audience"

### 5.6 AI Content Factory (TikTok Shop)
- **Katalog:** `research/catalogue/posts/2026-01/maverickecom-ai-content-factory-tiktok-shop.md`
- **Pattern:** Nano Banana + Fastmoss + Manus + Veo3 = Automated TikTok Shop Content
- **Multi-Platform Swarm (MPS):** Niche validieren → Hunderte Agents fluten mit Variationen
- **Kosten:** $300/mo Stack ersetzt $50K+ Budget

---

## 6. VOICE AI AGENCY BUSINESS MODELS (aus PDF)

| Modell | Pricing | Für Burak relevant? |
|--------|---------|---------------------|
| **Handover** | $1K-$30K+ | JA — bereits gemacht (Kälte Aktiv Team) |
| **Usage-Based** | $0.20-$3.00/min | MÖGLICH — erfordert eigene Plattform |
| **Hosted** | $500-$3K/mo | JA — recurring revenue, IP-Aufbau |
| **Support + Maintenance** | $500-$3K/mo | JA — einfacher Upsell |
| **Monitoring** | $1.5K-$3K/mo | SPÄTER — erfordert Prompt-Expertise |
| **Enterprise** | $10K+ | MÖGLICH — mit ColdyAI als Basis |

**Tools erwähnt:** Vapify.agency, Chat-Dash, GHL (GoHighLevel), Vocera, Hamming AI, Langfuse

---

## 7. ZUSAMMENFASSUNG: Was existiert bereits

### Code-Assets (nach Reife sortiert)
| Projekt | Reife | Stack | Nächster Schritt |
|---------|-------|-------|-----------------|
| ColdyAI | 95% | Next.js + LiveKit + Resemble | ENV-Config → Deploy |
| production-app | 70% | Next.js + Supabase + Twilio | Epics 3-5 fortsetzen |
| LivekitDemo | 100% (Demos) | Python + LiveKit | Als Content/Portfolio nutzen |
| CraftCode Website | 80% | Next.js + Cal.com | Aktualisieren + deployen |
| MAYTT | 40% (N8N PoC) | N8N + Airtable | Web App bauen (Remotion) |
| LEVENZ Solar | 100% (MVP) | Python + OpenAI | Bachelorarbeit |
| Ultravox Demos | POC | Ultravox + Twilio | Archiv / Reference |

### Content-Assets
| Asset | Wo | Status |
|-------|-----|--------|
| ~10 Voice Agent Demos (branchen-spezifisch) | LivekitDemo/ | Fertig, zeigbar |
| CraftCode Website | CraftCodeWebsite/ | Needs Update |
| Hormozi Framework (komplett encoded) | Research Katalog | Reference |
| Lead Gen Pipeline Design | Research Katalog | Reference |
| Master Blueprint (5 Business Lines) | Research Katalog | Strategic Reference |
| Voice AI Agency Models (PDF) | Downloads/ | Reference |
| Geschäftspläne (5+ Versionen) | Desktop/ | Historical |
| Client-Projektpläne (Kälte Aktiv) | Downloads/ | Portfolio |
| Solar Lead-Listen (2 CSVs) | Desktop/leadlists/ | Data |
| Kosmetik + Schlüsseldienste Leads | Desktop/leadlists/ | Data |

### Kontext-Assets (Wissen, nicht Code)
| Was | Wo | Wert |
|-----|-----|------|
| Hormozi Value Equation + Content Engine | Research Katalog | Framework für Content-Strategie |
| IndyDevDan Profil + Content-Format | Research Katalog | Vorbild für Burak's Format |
| Greg Isenberg Distribution-Strategien | Research Katalog | Playbook für Reichweite |
| AI Content Factory Pattern | Research Katalog | TikTok Shop Automation |
| UWG/DSGVO Legal Framework | Research Katalog | Compliance-Wissen |
| Voice AI Bootcamp Material | Downloads/ | Industry Knowledge |

---

## 8. CONTENT-STRATEGIE: Optionen & Richtungen

### Option A: "Agentic Engineering auf Deutsch" (IndyDevDan-Style)
- **Format:** Screen + Voice, kein Gesicht
- **Plattform:** YouTube (primär), Twitter/X, LinkedIn
- **USP:** Es gibt KEINEN deutschen Deep-Dive-Content zu Agent Engineering
- **Content-Typen:**
  - Build-Videos (Voice Agents bauen, live)
  - Orchestrator-Patterns erklären
  - Tool-Reviews (Claude Code, Pi Agent, etc.)
  - Behind-the-Scenes der eigenen Projekte
- **Frequenz:** 1x/Woche YouTube, 3-5x/Woche Shorts/Posts
- **Monetarisierung:** Course, Consulting, Client Akquise

### Option B: "Voice AI für deutsche Unternehmen"
- **Format:** Screen + Voice, Praxis-fokussiert
- **Plattform:** YouTube + LinkedIn
- **USP:** Voice AI für den DACH-Markt (UWG-compliant, deutsch, lokale Branchen)
- **Content-Typen:**
  - "Ich baue einen Voice Agent für [Branche]" (hat schon 10 Demos!)
  - DSGVO/UWG-Compliance-Guides
  - Voice AI vs. Chatbot Vergleiche
  - Client Case Studies (mit Erlaubnis)
- **Frequenz:** 1x/Woche YouTube, LinkedIn Posts daily
- **Monetarisierung:** Direkte Client-Akquise, Hosted Solution MRR

### Option C: Hybrid — "KI-Automatisierung für Unternehmer" (breiter)
- **Format:** Screen + Voice, gelegentlich Profilbild
- **Plattform:** YouTube + Twitter/X + LinkedIn
- **USP:** Practitioner der wirklich baut, nicht nur redet
- **Content-Typen:**
  - Voice Agent Builds (aus LivekitDemo Portfolio)
  - Orchestrator/Agent Engineering Insights
  - Business Automation (Hormozi + AI)
  - SaaS Build-in-Public
- **Frequenz:** 2x/Woche YouTube, Daily Social
- **Monetarisierung:** Multiple Revenue Streams

### Empfehlung: **Start mit Option B, evolve zu C**
**Warum:**
1. Du hast bereits 10+ Voice Agent Demos → sofort zeigbarer Content
2. Der deutsche Markt hat NULL Voice AI Content auf diesem Level
3. Voice Agents = direkter Revenue-Kanal (Client Work + Hosted Solution)
4. Kein Gesicht nötig = sofort startbar, kein Kamera-Blocker
5. AgentIC Engineering als zweiter Kanal kann organisch dazukommen

---

## 9. CODE-STRATEGIE: Was bauen, was droppen

### KEEP & CONTINUE
| Projekt | Warum | Nächster Schritt |
|---------|-------|-----------------|
| **ColdyAI** | 95% fertig, sofort deploybar | ENV-Config, Deploy, als Showcase nutzen |
| **LivekitDemo** | 10 Demos = Content-Goldmine | Videos daraus machen, Portfolio-Page |
| **production-app** | Fortgeschrittenes SaaS | Epics weiterführen wenn Revenue-relevant |
| **MAYTT** | Bewiesenes Modell, Partner Ali | Web App bauen wenn Zeit |

### ARCHIVE (nicht droppen, aber nicht aktiv)
| Projekt | Warum |
|---------|-------|
| ultravox-demo | Ultravox superseded by LiveKit |
| gptrealtime | Minimal, nur POC |
| craftcodedashboard | Veraltet, in production-app integriert |

### NEW (noch nicht gebaut)
| Projekt | Beschreibung | Priorität |
|---------|-------------|-----------|
| **Portfolio/Content Website** | Showcase aller Voice Agent Demos + Blog | HOCH |
| **Content Pipeline** | Automated Content Repurposing (1 Video → Multi-Format) | MITTEL |
| **Voice AI Hosted Platform** | ColdyAI → Multi-Tenant Hosted Solution | MITTEL-HOCH |

---

## 10. NÄCHSTE SCHRITTE (Priorisiert)

### Sofort (Diese Woche)
1. **ColdyAI deployen** — ENV-Keys eintragen, LiveKit Server aufsetzen, ersten echten Call machen
2. **Content-Format definieren** — Screen-Recording Setup, Audio-Setup, Thumbnail-Stil
3. **Erstes Video** — "Ich baue einen deutschen Voice Agent in 30 Minuten" (aus LivekitDemo)

### Kurzfristig (Nächste 2 Wochen)
4. **CraftCode Website aktualisieren** — Portfolio mit Voice Agent Demos
5. **LinkedIn Profil optimieren** — Voice AI / Agentic Engineering Positioning
6. **3 weitere Videos** aus bestehendem Demo-Material

### Mittelfristig (Nächster Monat)
7. **Hosted Solution MVP** — ColdyAI → Multi-Client fähig machen
8. **Content Calendar** — Hormozi Content Engine Pattern (3.5:1 Give-to-Ask)
9. **Lead Gen** — Deutsche Unternehmen ohne Voice Agent ansprechen

---

## 11. KRITISCHE NEUE FUNDE (von Background-Agents)

### 11.1 ContentOS — Komplette Content-Strategie existiert bereits!
- **Pfad:** `/Users/buraksmac/Desktop/code2/ContentOS/`
- **Dokument:** `docs/COMPLETE-CONTENT-BRAND-STRATEGY.md` (1.051 Zeilen!)
- **Erstellt:** 14.02.2026
- **Quellen:** Hormozi $100M Branding Playbook, $100M Hooks Playbook, **Javen Zhang** Masterclass
- **Inhalt:**
  - Fear Protocol ("Ship It Ugly" Rules, 90-Tage-Regel)
  - Brand Foundation (Positioning, Voice, Associations)
  - 4 Audience-Personas (AI-Curious Dev 40%, AI Builder 20%, Tech-Curious Pro 25%, Career Pivotter 15%)
  - 6 Content Pillars (Agent-Driven Dev, Model Benchmarks, Buzz Explainers, Tool Comparisons, Real Builds, Industry Analysis)
  - 5 Repeatable Formats (YouTube Long, Shorts, Twitter Threads, Blog, Live Streams)
  - Hook System (Hormozi Framework)
  - 12-Month Roadmap (Months 1-3: "Ship It Ugly", 4-6: Benchmark Series, 7-9: AI Model Explorer Tool, 10-12: Monetization)
  - Monetization (Courses $2K-10K, Consulting $500+/hr, 11x ROI branded vs unbranded)
- **Status:** KOMPLETT geschrieben, aber NIE gestartet!
- **Roadmap-Doku:** `docs/STRATEGIE-ROADMAP.md`
- **Hormozi PDFs:** `docs/Hormozi Playbooks/` (20+ PDFs)

### 11.2 CraftCode AI Airtable — 21 Companies in Sales Pipeline!
- **Base ID:** `appi9eWFJmE9XS1zM`
- **10 Tabellen:** Companies, Leads, Niches, Payments, Competition, Resources, Todos, Tools
- **21 qualifizierte Unternehmen** mit Call Notes und Follow-Up Dates
- **6 Inbound Leads** (minimal activity)
- **14 Target-Industrien:** Schlüsseldienst, Rohrreinigung, Umzugsfirma, etc.
- **Deal Size:** €1.5K-€5K
- **Pipeline Stages:** Contacted → Qualified → Scheduled → Proposal → Lost
- **Airtable Export:** `/Users/buraksmac/Desktop/code2/vault/40-resources/airtable-import/` (8 Markdown-Files)

### 11.3 Social Media Calendar Airtable
- **Base ID:** `appVNY2WKsqPEo0c3`
- **Status:** Inaktive Template — nie benutzt

### 11.4 RA Solar — 5 komplette N8N Workflows!
- Transcript Capture, Callback Requests, Appointment Setting, Lead Capture
- Integration mit **Bitrix24**, Google Sheets, Gmail
- N8N Instance: **n8n.craftcodeautomation.de**

### 11.5 Kälte-Aktiv Team GmbH — Echter Client
- **Budget:** €25.000
- **Zeitraum:** 60 Tage Development
- **Scope:** Voice Agent für Kundenservice

### 11.6 JobCenter Kooperationsplan
- Kooperation mit JobCenter Hannover (16.02.2026)
- **Ziel:** €8.000-15.000 MRR by Year 2

### 11.7 Vault (Obsidian)
- **Pfad:** `/Users/buraksmac/Desktop/code2/vault/`
- Knowledge Management System
- Airtable-Daten als Markdown exportiert

### 11.8 Weitere Repos gefunden (45+ total)
- **adwo-2** — Real-time Dashboard mit WebSocket
- **agenthub** — Agent Collaboration (Go)
- **ColdyAI Epic Branches:** auth, observation, lead-management, agent-config, analytics, sales-coach

---

## 12. CROSS-REFERENCES

| Dokument | Pfad |
|----------|------|
| **ContentOS Strategy (1.051 Zeilen!)** | `/Desktop/code2/ContentOS/docs/COMPLETE-CONTENT-BRAND-STRATEGY.md` |
| ContentOS Roadmap | `/Desktop/code2/ContentOS/docs/STRATEGIE-ROADMAP.md` |
| Hormozi Playbooks (20+ PDFs) | `/Desktop/code2/ContentOS/docs/Hormozi Playbooks/` |
| MAYTT PRD | `_bmad/MAYTT-PRD.md` |
| MAYTT Product Brief | `_bmad/MAYTT-PRODUCT-BRIEF.md` |
| Hormozi Framework Encoding | `research/catalogue/reference/hormozi-framework-encoding.md` |
| Lead Gen Pipeline | `research/catalogue/reference/lead-gen-pipeline-architecture.md` |
| Master Blueprint (5 Business Lines) | `research/catalogue/reference/master-blueprint.md` |
| IndyDevDan Profil | `research/catalogue/practitioners/indydevdan.md` |
| Greg Isenberg Distribution | `research/catalogue/talks/2026-03-30_greg-isenberg-stop-vibe-coding-distribution.md` |
| AI Media Platform Landscape | `_bmad/research/AI-MEDIA-API-PLATFORM-LANDSCAPE-2026.md` |
| Voice AI Agency Models PDF | `~/Downloads/Voice AI Agency Modelle.pdf` |
| $100M Branding Playbook PDF | `~/Downloads/$100M Branding Playbook.pdf` |
| CraftCode Airtable Export | `/Desktop/code2/vault/40-resources/airtable-import/` |
| Discovery: Desktop Docs | `_bmad/research/DISCOVERY-desktop-documents.md` |
| Discovery: Catalogue & Strategy | `_bmad/research/DISCOVERY-catalogue-content-strategy.md` |
| Discovery: Repos & Projects | `_bmad/research/DISCOVERY-repos-projects.md` |
| Discovery: External Tools & Data | `_bmad/research/DISCOVERY-external-tools-data.md` |
| Discovery: Memory & Business Context | `_bmad/research/DISCOVERY-memory-business-context.md` |

---

## 13. STRATEGISCHE NEUBEWERTUNG (nach vollständiger Discovery)

### Was sich durch ContentOS ändert:
Die Content-Strategie ist bereits **komplett durchdacht und geschrieben**. Das Problem war nie die Planung — es war die **Execution**. Die ContentOS-Strategie adressiert das sogar selbst ("Fear Protocol", "Ship It Ugly").

### Revidierte Empfehlung:

**Phase 1: Restart mit ContentOS** (Woche 1-2)
1. ContentOS Strategy nochmal lesen und validieren — ist sie nach 2 Monaten noch aktuell?
2. "Fear Protocol" ernst nehmen — die Strategie sagt selbst: 20 Videos vor jeder Bewertung
3. Screen-Recording + Audio Setup (kein Gesicht = sofort startbar)
4. **Erstes Video DIESE WOCHE** — aus LivekitDemo oder ColdyAI Material
5. Entscheidung: Deutsche Nische (Voice AI für DACH) vs. Englisch (global)

**Phase 2: Voice AI als Content-Thema UND Revenue-Kanal** (Woche 3-6)
1. ColdyAI deployen (nur API-Keys nötig)
2. "Ich baue einen Voice Agent" Video-Serie starten
3. CraftCode Website mit Portfolio aktualisieren
4. Lead Gen reaktivieren (21 Unternehmen in Airtable Pipeline!)

**Phase 3: Systematisieren** (Monat 2-3)
1. Hormozi Content Engine Pattern aktivieren (3.5:1 Give-to-Ask)
2. Content Calendar aus Social Media Airtable nutzen
3. MAYTT Web App parallel für Ali bauen
4. Hosted Voice AI Solution als MRR-Produkt

### Was NICHT tun:
- Nicht NOCHMAL planen — ContentOS hat 1.051 Zeilen Strategie, das reicht
- Nicht alles gleichzeitig starten — Voice AI Content ZUERST
- Nicht auf perfekte Conditions warten — "Ship It Ugly"
