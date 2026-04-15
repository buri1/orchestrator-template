# MAYTT Content Engine -- Product Requirements Document (PRD)

**Datum:** 2026-04-05
**Version:** 1.0
**Erstellt von:** BMAD PM Agent
**Basierend auf:** MAYTT Product Brief v1.0
**Status:** Draft

---

## Inhaltsverzeichnis

1. [Epics-Ubersicht](#1-epics-ubersicht)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [Datenmodell](#4-datenmodell)
5. [API-Integrations-Map](#5-api-integrations-map)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [MVP vs. Future Scope](#7-mvp-vs-future-scope)
8. [Risk Assessment](#8-risk-assessment)

---

## 1. Epics-Ubersicht

### Phase 1: Core Pipeline (Woche 1-2)

| Epic | Beschreibung | Prioritat |
|------|-------------|-----------|
| E1.1 | Supabase Setup (Schema, Auth, RLS) | P0 |
| E1.2 | Asset-Management (Google Drive Integration) | P0 |
| E1.3 | Remotion Template: TikTok-Kombi | P0 |
| E1.4 | Remotion Player Preview | P0 |
| E1.5 | Lambda-Rendering + S3 Output | P0 |
| E1.6 | Kombinations-Generator mit Dedup | P0 |
| E1.7 | Airtable-Datenmigration | P0 |

### Phase 2: Social Media Integration (Woche 3-4)

| Epic | Beschreibung | Prioritat |
|------|-------------|-----------|
| E2.1 | Social Account Management (OAuth) | P0 |
| E2.2 | TikTok Content Posting API | P0 |
| E2.3 | Instagram Graph API (Reels + Scheduling) | P1 |
| E2.4 | YouTube Data API (Shorts + Scheduling) | P1 |
| E2.5 | Post-Scheduling Queue (BullMQ) | P0 |
| E2.6 | Content Calendar UI | P1 |

### Phase 3: Dashboard & AI Studio (Woche 5-6)

| Epic | Beschreibung | Prioritat |
|------|-------------|-----------|
| E3.1 | Metriken-Dashboard | P1 |
| E3.2 | Performance-Vergleich (Overlay/Produkt/Influencer) | P1 |
| E3.3 | AI Generation Studio -- Explore Mode | P1 |
| E3.4 | AI Generation Studio -- Compare Mode | P1 |
| E3.5 | AI Generation Studio -- Benchmark Mode | P2 |
| E3.6 | ELO-Rating-System | P2 |

### Phase 4: Automation & Advanced (Woche 7-8)

| Epic | Beschreibung | Prioritat |
|------|-------------|-----------|
| E4.1 | Playwright TikTok Shop Product-Linking | P1 |
| E4.2 | Multi-Account-Isolation (Browser-Profile) | P1 |
| E4.3 | CPL-Monitoring Dashboard | P1 |
| E4.4 | AI Agent: NL -> Remotion Template-Anpassung | P2 |
| E4.5 | Kampagnen-System | P2 |

---

## 2. Functional Requirements

### FR-1: Kombinatorische Video-Pipeline

#### FR-1.1: Asset-Management

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-1.1.1 | System zeigt alle Influencer-Clips mit Thumbnail, Name, Setting, Engagement-Bait, Usage Count, Performance Score | P0 |
| FR-1.1.2 | System zeigt alle Produkt-Clips mit Thumbnail, Produktname, Kategorie, Video-Typ, Usage Count | P0 |
| FR-1.1.3 | System zeigt alle Overlay-Komponenten mit Vorschau-PNG, Text-Content, Scope (Generic/Product-Specific), Position | P0 |
| FR-1.1.4 | User kann neue Assets hochladen (Video-Upload oder Google Drive URL) | P0 |
| FR-1.1.5 | User kann Assets als aktiv/inaktiv markieren | P0 |
| FR-1.1.6 | User kann Assets mit Tags versehen und filtern | P1 |
| FR-1.1.7 | System importiert bestehende Assets aus Google Drive anhand von Drive-IDs | P0 |
| FR-1.1.8 | User kann neue Overlay-Texte erstellen; System rendert das Overlay als PNG via Remotion (statt Creatomate) | P0 |

#### FR-1.2: Kombinations-Generator

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-1.2.1 | User wahlt Influencer-Clip(s), Produkt-Clip(s) und Overlay(s) aus und generiert alle Kombinationen | P0 |
| FR-1.2.2 | System erzwingt UNIQUE Constraint auf (influencer_clip_id, product_clip_id, overlay_id) -- keine Duplikate | P0 |
| FR-1.2.3 | System zeigt Anzahl moglicher Kombinationen BEVOR generiert wird | P0 |
| FR-1.2.4 | User kann Generierungs-Modi wahlen: Auto Generate All, Manual Selection, Combine Influencer with All Products, Combine Product with All Influencers | P0 |
| FR-1.2.5 | User kann Overlay-Strategie wahlen: All Active, Generic Only, Product Specific Only | P0 |
| FR-1.2.6 | User kann Max-Videos-Limit setzen pro Batch | P0 |
| FR-1.2.7 | System zeigt Batch-Fortschritt (X von Y generiert) | P0 |

#### FR-1.3: Video-Preview (Remotion Player)

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-1.3.1 | User sieht Live-Preview einer Kombination im Browser bevor gerendert wird | P0 |
| FR-1.3.2 | Preview zeigt Influencer-Clip, Produkt-Clip und Overlay korrekt ubereinander im 9:16-Format (1080x1920) | P0 |
| FR-1.3.3 | Preview ist interaktiv: Play/Pause, Scrubben, Lautstarke | P0 |
| FR-1.3.4 | User kann Overlay-Position, Text und Timing im Preview anpassen (ohne Code) | P1 |
| FR-1.3.5 | Preview rendert in Echtzeit bei Parameter-Anderungen (kein Reload nohtig) | P0 |

#### FR-1.4: Rendering

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-1.4.1 | User kann einzelne Videos oder Batches zum Rendering queuen | P0 |
| FR-1.4.2 | System rendert uber AWS Lambda (Remotion Lambda) | P0 |
| FR-1.4.3 | Rendering-Output wird in S3 gespeichert und Download-URL in der DB hinterlegt | P0 |
| FR-1.4.4 | System zeigt Rendering-Fortschritt (Progress-Bar) pro Video | P0 |
| FR-1.4.5 | System tracked Render-Versuche und Fehler pro Video | P0 |
| FR-1.4.6 | Max Concurrent Renders konfigurierbar (5-100) | P1 |
| FR-1.4.7 | Render-Timeout konfigurierbar (Default: 5 min) | P1 |
| FR-1.4.8 | Fehlgeschlagene Renders konnen mit einem Klick erneut gestartet werden | P0 |

#### FR-1.5: Status-Pipeline

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-1.5.1 | Jedes generierte Video durchlauft: To Render -> Rendering -> Rendered -> Ready -> Scheduled -> Published -> Archived | P0 |
| FR-1.5.2 | Status-Ubergange werden automatisch getriggert (Rendering -> Rendered nach Lambda-Callback) | P0 |
| FR-1.5.3 | User kann Videos manuell auf "Ready" setzen (Quality Gate) | P1 |
| FR-1.5.4 | User kann Videos archivieren | P0 |
| FR-1.5.5 | Dashboard zeigt Statusverteilung (wie viele in welchem Status) | P0 |

---

### FR-2: Social Media Dashboard & Planner

#### FR-2.1: Account-Verwaltung

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-2.1.1 | User kann TikTok-Accounts uber OAuth 2.0 + PKCE verbinden | P0 |
| FR-2.1.2 | User kann Instagram Business/Creator Accounts uber Facebook Login verbinden | P1 |
| FR-2.1.3 | User kann YouTube-Channels uber Google OAuth verbinden | P1 |
| FR-2.1.4 | System refresht OAuth-Tokens automatisch (TikTok: 365d Refresh, IG: 60d Long-Lived, YT: Refresh Token) | P0 |
| FR-2.1.5 | User sieht alle verbundenen Accounts mit Status (aktiv/abgelaufen/Fehler) | P0 |
| FR-2.1.6 | User kann Accounts trennen (Disconnect) | P0 |

#### FR-2.2: Publishing

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-2.2.1 | User kann Videos direkt an TikTok publizieren (Content Posting API, Pull-from-URL-Methode) | P0 |
| FR-2.2.2 | User kann Videos an Instagram Reels publizieren (Graph API) | P1 |
| FR-2.2.3 | User kann Videos an YouTube Shorts publizieren (Data API, <60s, 9:16) | P1 |
| FR-2.2.4 | User kann Caption/Beschreibung pro Plattform individuell anpassen | P0 |
| FR-2.2.5 | System zeigt TikTok API-Disclosure-Badge Hinweis (Pflicht bei API-Posts) | P0 |
| FR-2.2.6 | System respektiert Rate Limits pro Plattform (TikTok: ~600 req/min, IG: 200 calls/user/hour, 25 posts/24h, YT: ~6 Uploads/Tag) | P0 |

#### FR-2.3: Scheduling

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-2.3.1 | User kann Videos fur einen zukunftigen Zeitpunkt planen | P0 |
| FR-2.3.2 | TikTok: System baut eigene Scheduling-Queue (BullMQ), da kein natives API-Scheduling | P0 |
| FR-2.3.3 | Instagram: System nutzt natives Scheduling (`published=false` + `scheduled_publish_time`, 10min-75d Vorlauf) | P1 |
| FR-2.3.4 | YouTube: System nutzt natives Scheduling (`status.publishAt` + `privacyStatus: private`) | P1 |
| FR-2.3.5 | Content Calendar zeigt alle geplanten Posts in Kalender-View (Tag/Woche/Monat) | P1 |
| FR-2.3.6 | User kann geplante Posts verschieben (Drag & Drop im Kalender) | P2 |
| FR-2.3.7 | System warnt bei Scheduling-Konflikten (zu viele Posts am gleichen Tag pro Account) | P1 |

#### FR-2.4: Metriken & Analytics

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-2.4.1 | System pollt Metriken automatisch pro publiziertem Video (Views, Likes, Comments, Shares) | P1 |
| FR-2.4.2 | Dashboard zeigt Metriken pro Account aggregiert | P1 |
| FR-2.4.3 | Dashboard zeigt Metriken pro Video mit Zeitverlauf (sofern API unterstutzt) | P1 |
| FR-2.4.4 | System berechnet Engagement Rate pro Video (Likes+Comments+Shares / Views) | P1 |
| FR-2.4.5 | Performance-Vergleich: "Welcher Overlay-Text performt am besten?" -- Aggregation uber Overlay-ID | P1 |
| FR-2.4.6 | Performance-Vergleich: "Welches Produkt performt am besten?" -- Aggregation uber Produkt-ID | P1 |
| FR-2.4.7 | Performance-Vergleich: "Welcher Influencer-Clip performt am besten?" -- Aggregation uber Influencer-Clip-ID | P1 |
| FR-2.4.8 | Export-Funktion fur Metriken (CSV) | P2 |

---

### FR-3: AI Generation Studio

#### FR-3.1: Explore Mode

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-3.1.1 | Two-Panel-Layout: Controls (links), Preview/Ergebnis (rechts) | P1 |
| FR-3.1.2 | User wahlt ein Modell aus einer Model-Card-Liste mit Starkenlabels ("Best for: Photorealism") | P1 |
| FR-3.1.3 | User gibt Prompt ein und kann "AI Enhance" nutzen (AI verbessert den Prompt automatisch) | P1 |
| FR-3.1.4 | Parameter-Controls: Aspect Ratio, Style Preset, Anzahl Bilder (Main Screen) | P1 |
| FR-3.1.5 | Advanced Controls (hinter Toggle): Seed, CFG Scale, Negative Prompt, Steps | P1 |
| FR-3.1.6 | Ergebnis wird in der rechten Spalte als 2x2-Grid angezeigt | P1 |
| FR-3.1.7 | Kostenanzeige (Cents) VOR dem Generieren | P1 |
| FR-3.1.8 | Generierungzeit-Schatzung VOR dem Generieren | P1 |
| FR-3.1.9 | Jede Generierung wird automatisch gespeichert (Prompt, Model, Params, Output, Kosten, Dauer) | P1 |
| FR-3.1.10 | User kann Ergebnisse als Favorit markieren, taggen und in Collections organisieren | P2 |

#### FR-3.2: Compare Mode

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-3.2.1 | User gibt einen Prompt ein und wahlt bis zu 5 Modelle gleichzeitig | P1 |
| FR-3.2.2 | System sendet Prompt parallel an alle gewahlten Modelle (via `fal.queue.submit()`) | P1 |
| FR-3.2.3 | Progressive Grid Loading: Jedes Modell-Ergebnis erscheint sobald fertig (kein Warten auf das langsamste) | P1 |
| FR-3.2.4 | Side-by-Side-Grid zeigt pro Modell: Ergebnis-Bild(er), Generierungszeit, Kosten | P1 |
| FR-3.2.5 | User kann "Winner" pro Vergleich markieren (fur ELO-Berechnung) | P2 |
| FR-3.2.6 | Kostenanzeige fur den gesamten Vergleich VOR dem Starten | P1 |

#### FR-3.3: Benchmark Mode

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-3.3.1 | User erstellt Benchmark-Suites: Name, Beschreibung, Set von Prompts, Set von Modellen | P2 |
| FR-3.3.2 | Suites sind re-runnable -- gleiche Prompts + Modelle erneut ausfuhren bei neuen Modell-Versionen | P2 |
| FR-3.3.3 | System tracked alle Runs einer Suite mit Gesamtkosten und Zeitstempel | P2 |
| FR-3.3.4 | Ergebnisse der Runs konnen Pairwise verglichen werden (A vs B: Wer ist besser?) | P2 |
| FR-3.3.5 | ELO-Score wird pro Modell berechnet und in einer Leaderboard-Ansicht dargestellt | P2 |

#### FR-3.4: Model Registry

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-3.4.1 | System halt eine Registry aller verfugbaren Fal-AI-Modelle mit: ID, Display Name, Media Type, Default-Params, Kosten pro Einheit, Starke-Labels | P1 |
| FR-3.4.2 | User kann Modelle nach Typ filtern (Image, Video, Audio, 3D) | P1 |
| FR-3.4.3 | User kann Modelle nach Starke filtern (Photorealism, Illustration, Speed, etc.) | P2 |
| FR-3.4.4 | User kann Favoriten-Modelle speichern fur schnellen Zugriff | P2 |

#### FR-3.5: History & Organisation

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-3.5.1 | Alle Generierungen werden automatisch persistiert (kein manuelles Speichern) | P1 |
| FR-3.5.2 | History-View mit Suche (nach Prompt-Text, Modell, Datum) | P1 |
| FR-3.5.3 | Favoriten-System (Star/Unstar) | P2 |
| FR-3.5.4 | Collections (User-definierte Gruppen von Generierungen) | P2 |
| FR-3.5.5 | Tags (User-definierte Labels) | P2 |

---

### FR-4: TikTok Shop Automation

#### FR-4.1: Video-Upload (offizielle API)

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-4.1.1 | System nutzt TikTok Content Posting API (`POST /v2/post/publish/video/init/`) fur Video-Upload | P0 (uber FR-2.2.1 abgedeckt) |

#### FR-4.2: Product-Linking (Browser-Automation)

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-4.2.1 | System verknupft Produkte an publizierte TikTok-Videos via Playwright Browser-Automation | P1 |
| FR-4.2.2 | Flow: TikTok Creator Center -> Video wahlen -> "Link Products" -> Produkt-URL eingeben -> Bestatigen | P1 |
| FR-4.2.3 | System nutzt Cookie-Auth + playwright-stealth fur Antidetection | P1 |
| FR-4.2.4 | System wartet human-like Delays zwischen Aktionen (randomisiert) | P1 |
| FR-4.2.5 | System logged jeden Linking-Versuch mit Ergebnis (Erfolg/Fehler/Grund) | P1 |
| FR-4.2.6 | Fehlgeschlagene Linkings konnen erneut gestartet werden | P1 |

#### FR-4.3: CPL-Monitoring

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-4.3.1 | System tracked pro Account: Anzahl Shop-Videos in den letzten 7 Tagen | P1 |
| FR-4.3.2 | System warnt, wenn ein Account das CPL-Limit erreicht (5 Videos/7 Tage bei <5K Followern) | P1 |
| FR-4.3.3 | System blockiert automatisiertes Publishing uber dem Limit | P1 |
| FR-4.3.4 | Dashboard zeigt CPL-Status aller Accounts auf einen Blick | P1 |

#### FR-4.4: Multi-Account-Isolation

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-4.4.1 | Jeder TikTok-Account hat ein separates Playwright-Browser-Profil | P1 |
| FR-4.4.2 | Jeder Account nutzt eine separate Cookie-Session | P1 |
| FR-4.4.3 | System unterstutzt unterschiedliche Proxy-Konfigurationen pro Account (optional) | P2 |

---

### FR-5: Zusatz-Features (Post-MVP)

#### FR-5.1: AI Agent fur Remotion

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-5.1.1 | User kann in Natural Language beschreiben, wie ein Remotion-Template geandert werden soll | P2 |
| FR-5.1.2 | Claude API + Remotion Skills ubersetzt die Beschreibung in Template-Props | P2 |
| FR-5.1.3 | Ergebnis wird im Remotion Player live angezeigt | P2 |

#### FR-5.2: Kampagnen-System

| ID | Requirement | Prioritat |
|----|------------|-----------|
| FR-5.2.1 | User kann Videos zu Kampagnen gruppieren | P2 |
| FR-5.2.2 | System aggregiert Metriken pro Kampagne | P2 |
| FR-5.2.3 | Kampagnen haben Start/End-Datum, Budget, Ziel-KPIs | P2 |

---

## 3. Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Zielwert |
|----|------------|---------|
| NFR-1.1 | Remotion Player Preview ladt innerhalb von 3 Sekunden | <3s |
| NFR-1.2 | Lambda-Rendering eines 15-30s Videos | <60s (Warm), <90s (Cold Start) |
| NFR-1.3 | Seiten-Ladezeit (First Contentful Paint) | <1.5s |
| NFR-1.4 | Fal AI Generierung: UI-Response nach Submit | <500ms (Queue-Bestatigung) |
| NFR-1.5 | Metriken-Dashboard ladt aggregierte Daten | <2s |
| NFR-1.6 | Kombinations-Generator berechnet mogliche Kombos | <1s fur 21.000 Kombinationen |

### NFR-2: Sicherheit

| ID | Requirement |
|----|------------|
| NFR-2.1 | Alle API-Keys (Fal AI, TikTok, IG, YT, AWS) werden serverseitig gespeichert -- niemals im Client |
| NFR-2.2 | Fal AI Key wird uber `@fal-ai/server-proxy` geroutet (Key bleibt auf dem Server) |
| NFR-2.3 | OAuth-Tokens werden verschlusselt in Supabase gespeichert |
| NFR-2.4 | Supabase RLS-Policies auf allen Tabellen (auth.uid() Pattern mit Subselect-Cache) |
| NFR-2.5 | Playwright Cookie-Daten verschlusselt at-rest |
| NFR-2.6 | Keine API-Keys oder Credentials in Git (Environment Variables) |
| NFR-2.7 | HTTPS fur alle externen Kommunikation |

### NFR-3: Skalierbarkeit

| ID | Requirement |
|----|------------|
| NFR-3.1 | System unterstutzt 10.000+ generierte Videos in der Datenbank ohne Performance-Einbruch |
| NFR-3.2 | Lambda-Rendering skaliert auf 100 parallele Renders |
| NFR-3.3 | BullMQ Job-Queue handelt 1.000+ geplante Posts pro Tag |
| NFR-3.4 | Fal AI Concurrency: System respektiert Provider-Limits und queued uberschussige Requests |
| NFR-3.5 | Datenbank-Indexes auf allen haufig abgefragten Spalten (status, user_id, model_id, created_at) |

### NFR-4: Verfugbarkeit & Reliability

| ID | Requirement |
|----|------------|
| NFR-4.1 | Scheduled Posts werden innerhalb von 5 Minuten um den geplanten Zeitpunkt publiziert |
| NFR-4.2 | Fehlgeschlagene Jobs (Render, Publish, Linking) werden automatisch bis zu 3x wiederholt (Exponential Backoff) |
| NFR-4.3 | System logged alle Fehler mit Kontext fur Debugging |
| NFR-4.4 | Supabase Realtime fur Live-Updates (Rendering-Fortschritt, Generierungs-Status) |

### NFR-5: Usability

| ID | Requirement |
|----|------------|
| NFR-5.1 | Ali kann den kompletten Workflow ohne Dokumentation bedienen (Self-Explanatory UI) |
| NFR-5.2 | Alle technischen Begriffe werden in user-freundliche Labels ubersetzt ("CFG Scale" -> "Kreativitat: Niedrig/Mittel/Hoch") |
| NFR-5.3 | Progressive Disclosure: Fortgeschrittene Controls hinter "Erweitert"-Toggle |
| NFR-5.4 | Responsive Design fur Metriken-Check auf Smartphone (Dashboard muss mobil funktionieren) |
| NFR-5.5 | Sprache: Deutsch (UI), Englisch (Code, API-Responses) |
| NFR-5.6 | Dark Mode (optional, P2) |

### NFR-6: Wartbarkeit

| ID | Requirement |
|----|------------|
| NFR-6.1 | Social-API-Integrationen folgen Provider-Pattern (neue Plattform = neuer Provider, kein Refactoring) |
| NFR-6.2 | Remotion-Templates sind JSON-konfigurierbar (neue Templates ohne Code-Deployment) |
| NFR-6.3 | Playwright-Selektoren sind modular ausgelagert (UI-Anderungen = Selektor-Update, kein Flow-Umbau) |
| NFR-6.4 | AI Model Registry ist daten-getrieben (neue Modelle = DB-Eintrag, kein Code) |

---

## 4. Datenmodell

### 4.1 Core Video Pipeline

```sql
-- Produkt-Katalog
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_url text,
  category text,
  brand text,
  tiktok_shop_url text,
  is_active boolean DEFAULT true,
  notes text,
  google_drive_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Influencer-Video-Clips
CREATE TABLE influencer_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_url text,               -- Google Drive oder S3 URL
  google_drive_id text,
  thumbnail_url text,
  influencer_type text,        -- z.B. "Redhead"
  content_type text,           -- z.B. "Intro"
  setting text,                -- z.B. "Schlafzimmer", "Kueche"
  engagement_bait text,        -- z.B. "unordentliches zimmer nach partynacht"
  duration_seconds numeric,
  performance_score integer,   -- 1-5 Sterne
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Produkt-Video-Clips
CREATE TABLE product_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_url text,
  google_drive_id text,
  thumbnail_url text,
  product_id uuid REFERENCES products(id),
  video_type text,             -- z.B. "Swipe"
  duration_seconds numeric,
  performance_score integer,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  notes text,
  folder_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Text/Grafik Overlays
CREATE TABLE overlays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'Text Overlay',  -- Text Overlay, WhatsApp Chat, Comment Bubble, etc.
  text_content text,
  asset_url text,              -- Gerenderte PNG URL
  scope text DEFAULT 'Generic', -- Generic, Product-Specific
  linked_product_id uuid REFERENCES products(id),
  position text DEFAULT 'Top-Center',
  animation_type text DEFAULT 'None',
  duration_seconds numeric,
  width integer,
  height integer,
  font_size integer,
  font_color text,
  performance_score integer,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Generierte Video-Kombinationen (Kerntabelle)
CREATE TABLE generated_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combination_fingerprint text UNIQUE,  -- "{influencer_id}-{product_clip_id}-{overlay_id}"
  influencer_clip_id uuid REFERENCES influencer_clips(id),
  product_clip_id uuid REFERENCES product_clips(id),
  overlay_id uuid REFERENCES overlays(id),
  product_id uuid REFERENCES products(id),
  status text DEFAULT 'To Render',
    -- To Render, Rendering, Rendered, Ready, Scheduled, Published, Archived
  video_file_url text,         -- S3 URL nach Rendering
  thumbnail_url text,
  duration_seconds numeric,
  render_attempts integer DEFAULT 0,
  last_rendered_at timestamptz,
  google_drive_id text,
  internal_notes text,
  campaign_id uuid,            -- FK zu campaigns (Phase 4)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (influencer_clip_id, product_clip_id, overlay_id)
);

-- Render-Jobs (Lambda-Tracking)
CREATE TABLE render_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_video_id uuid REFERENCES generated_videos(id),
  status text DEFAULT 'queued',  -- queued, processing, completed, failed
  lambda_request_id text,
  s3_output_url text,
  error_message text,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Remotion-Templates
CREATE TABLE templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_config jsonb NOT NULL,  -- Remotion-Props-Schema
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Batch-Generierungs-Konfigurationen (analog GENERATION_CONFIG)
CREATE TABLE generation_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generation_mode text NOT NULL,  -- auto_generate_all, manual_selection, etc.
  overlay_strategy text DEFAULT 'all_active',
  max_videos integer,
  max_concurrent_renders integer DEFAULT 5,
  poll_interval_seconds numeric DEFAULT 5.0,
  render_timeout_minutes numeric DEFAULT 5.0,
  selected_influencer_ids uuid[],
  selected_product_ids uuid[],
  selected_product_clip_ids uuid[],
  selected_overlay_ids uuid[],
  possible_combos integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4.2 Social Media & Publishing

```sql
-- Social Media Accounts
CREATE TABLE social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  platform text NOT NULL,        -- tiktok, instagram, youtube
  platform_user_id text,
  username text,
  display_name text,
  access_token text,             -- Encrypted
  refresh_token text,            -- Encrypted
  token_expires_at timestamptz,
  follower_count integer,
  is_active boolean DEFAULT true,
  metadata jsonb,                -- Platform-spezifische Daten
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Geplante/Publizierte Posts
CREATE TABLE scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_video_id uuid REFERENCES generated_videos(id),
  social_account_id uuid REFERENCES social_accounts(id),
  platform text NOT NULL,
  status text DEFAULT 'draft',   -- draft, scheduled, publishing, published, failed
  caption text,
  hashtags text[],
  scheduled_at timestamptz,
  published_at timestamptz,
  platform_post_id text,         -- TikTok/IG/YT Post-ID
  platform_post_url text,        -- TikTok URL, etc.
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post-Metriken (gepollt)
CREATE TABLE post_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id uuid REFERENCES scheduled_posts(id),
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  saves integer,
  engagement_rate numeric(5,4),
  avg_watch_time_seconds numeric,
  click_through_rate numeric(5,4),
  polled_at timestamptz DEFAULT now()
);

-- TikTok Shop Linking Logs
CREATE TABLE shop_linking_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id uuid REFERENCES scheduled_posts(id),
  product_id uuid REFERENCES products(id),
  social_account_id uuid REFERENCES social_accounts(id),
  status text DEFAULT 'pending',  -- pending, in_progress, success, failed
  error_message text,
  attempt_count integer DEFAULT 1,
  linked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- CPL-Tracking (Content Posting Limits)
CREATE TABLE cpl_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id uuid REFERENCES social_accounts(id),
  shop_videos_last_7d integer DEFAULT 0,
  follower_count integer,
  limit_threshold integer DEFAULT 5,
  is_at_limit boolean DEFAULT false,
  last_checked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
```

### 4.3 AI Generation Studio

```sql
-- AI-Generierungen (jede einzelne)
CREATE TABLE generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  model_id text NOT NULL,           -- 'fal-ai/flux/dev'
  model_version text,
  provider text DEFAULT 'fal',
  media_type text NOT NULL,         -- image, video, audio
  prompt text NOT NULL,
  enhanced_prompt text,             -- AI-enhanced Version
  negative_prompt text,
  parameters jsonb,                 -- Model-spezifische Params
  output_url text,
  output_metadata jsonb,            -- dimensions, duration, file_size, seed
  cost_cents integer,               -- Kosten in Cents
  status text DEFAULT 'queued',     -- queued, processing, completed, failed
  error_message text,
  fal_request_id text,
  duration_ms integer,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Benchmark-Suites
CREATE TABLE benchmark_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  prompt_set jsonb,                 -- [{prompt, negative_prompt, parameters}]
  target_models jsonb,              -- [model_ids]
  created_at timestamptz DEFAULT now(),
  last_run_at timestamptz
);

-- Benchmark-Runs
CREATE TABLE benchmark_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id uuid REFERENCES benchmark_suites(id),
  user_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',
  total_cost_cents integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Junction: Run -> Generations
CREATE TABLE benchmark_run_generations (
  benchmark_run_id uuid REFERENCES benchmark_runs(id),
  generation_id uuid REFERENCES generations(id),
  prompt_index integer,
  PRIMARY KEY (benchmark_run_id, generation_id)
);

-- Pairwise-Vergleiche (fur ELO)
CREATE TABLE comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  generation_a_id uuid REFERENCES generations(id),
  generation_b_id uuid REFERENCES generations(id),
  winner text CHECK (winner IN ('a', 'b', 'tie', 'both_bad')),
  benchmark_run_id uuid REFERENCES benchmark_runs(id),
  created_at timestamptz DEFAULT now()
);

-- ELO-Scores (precomputed)
CREATE TABLE model_elo_scores (
  model_id text PRIMARY KEY,
  model_name text NOT NULL,
  media_type text NOT NULL,
  elo_score numeric(8,2) DEFAULT 1500,
  total_votes integer DEFAULT 0,
  win_rate numeric(5,4),
  last_updated timestamptz DEFAULT now()
);

-- Model Registry
CREATE TABLE model_registry (
  id text PRIMARY KEY,              -- 'fal-ai/flux/dev'
  provider text NOT NULL,
  display_name text NOT NULL,
  media_type text NOT NULL,
  strengths text[],                 -- ['Photorealism', 'Speed', 'Portraits']
  default_parameters jsonb,
  cost_per_unit_cents integer,
  cost_unit text,                   -- 'image', 'second', 'megapixel'
  is_active boolean DEFAULT true,
  added_at timestamptz DEFAULT now()
);

-- Tags
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  color text
);

CREATE TABLE generation_tags (
  generation_id uuid REFERENCES generations(id),
  tag_id uuid REFERENCES tags(id),
  PRIMARY KEY (generation_id, tag_id)
);

-- Collections
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE collection_items (
  collection_id uuid REFERENCES collections(id),
  generation_id uuid REFERENCES generations(id),
  position integer,
  PRIMARY KEY (collection_id, generation_id)
);
```

### 4.4 Kampagnen (Phase 4+)

```sql
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date,
  end_date date,
  budget_cents integer,
  target_views integer,
  target_engagement_rate numeric(5,4),
  status text DEFAULT 'draft',     -- draft, active, paused, completed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4.5 Indexes

```sql
-- Core Pipeline
CREATE INDEX idx_gv_status ON generated_videos(status);
CREATE INDEX idx_gv_product ON generated_videos(product_id);
CREATE INDEX idx_gv_influencer ON generated_videos(influencer_clip_id);
CREATE INDEX idx_gv_fingerprint ON generated_videos(combination_fingerprint);
CREATE INDEX idx_gv_created ON generated_videos(created_at DESC);
CREATE INDEX idx_render_status ON render_jobs(status);
CREATE INDEX idx_render_video ON render_jobs(generated_video_id);

-- Social
CREATE INDEX idx_social_user ON social_accounts(user_id);
CREATE INDEX idx_sp_account ON scheduled_posts(social_account_id);
CREATE INDEX idx_sp_status ON scheduled_posts(status);
CREATE INDEX idx_sp_scheduled ON scheduled_posts(scheduled_at);
CREATE INDEX idx_metrics_post ON post_metrics(scheduled_post_id);

-- AI Generation
CREATE INDEX idx_gen_user ON generations(user_id);
CREATE INDEX idx_gen_model ON generations(model_id);
CREATE INDEX idx_gen_status ON generations(status);
CREATE INDEX idx_gen_created ON generations(created_at DESC);
CREATE INDEX idx_gen_params ON generations USING GIN (parameters);
```

### 4.6 Entity-Relationship-Diagramm (Ubersicht)

```
products ──┬──< product_clips ──< generated_videos >── influencer_clips
           │                          │  │
           └──< overlays ─────────────┘  │
                                         │
                              render_jobs >── (Lambda)
                                         │
                         scheduled_posts ─┘──> social_accounts
                              │
                         post_metrics
                              │
                     shop_linking_logs

campaigns ──< generated_videos (FK optional)

model_registry ──< generations >── benchmark_run_generations >── benchmark_runs >── benchmark_suites
                        │
                   comparisons ──> model_elo_scores
                        │
                generation_tags ──> tags
                        │
               collection_items ──> collections
```

---

## 5. API-Integrations-Map

### 5.1 Ubersicht

```
                              MAYTT Web App
                                   │
                    ┌──────────────┼──────────────────┐
                    │              │                   │
              ┌─────▼─────┐  ┌────▼──────┐   ┌───────▼───────┐
              │  Supabase  │  │  AWS      │   │  BullMQ       │
              │  ┌───────┐ │  │  ┌──────┐ │   │  + Redis      │
              │  │Postgres│ │  │  │Lambda│ │   │  (Upstash)    │
              │  │Auth   │ │  │  │S3    │ │   │               │
              │  │Realtime│ │  │  └──────┘ │   │  Scheduling   │
              │  └───────┘ │  │  Remotion  │   │  Render Queue │
              └────────────┘  └───────────┘   └───────┬───────┘
                                                       │
                    ┌──────────────┬──────────────┬─────┘
                    │              │              │
              ┌─────▼─────┐  ┌────▼─────┐  ┌────▼──────┐
              │ TikTok    │  │Instagram │  │ YouTube   │
              │           │  │          │  │           │
              │ Content   │  │ Graph    │  │ Data API  │
              │ Posting   │  │ API      │  │           │
              │ API       │  │          │  │ Upload +  │
              │           │  │ Reels +  │  │ Scheduling│
              │ OAuth 2.0 │  │ Schedule │  │           │
              │ + PKCE    │  │ + Insights│ │ Analytics │
              └─────┬─────┘  └──────────┘  └───────────┘
                    │
              ┌─────▼──────┐
              │ Playwright │
              │            │
              │ TikTok     │
              │ Creator    │
              │ Center     │
              │            │
              │ Product    │
              │ Linking    │
              └────────────┘

              ┌────────────┐   ┌──────────────┐
              │ Fal AI     │   │ Google Drive  │
              │            │   │              │
              │ 985+ Models│   │ Asset Import │
              │ Image/Video│   │ Video Files  │
              │ Audio/3D   │   │              │
              │            │   │ Drive API v3 │
              │ Queue API  │   └──────────────┘
              │ SSE/Webhook│
              └────────────┘

              ┌────────────┐
              │ Claude API │
              │            │
              │ AI Agent   │
              │ Remotion   │
              │ Skills     │
              │ (Phase 4)  │
              └────────────┘
```

### 5.2 API-Details

| API | Auth-Methode | Basis-URL | Kernoperationen | Rate Limits |
|-----|-------------|-----------|-----------------|-------------|
| **TikTok Content Posting** | OAuth 2.0 + PKCE | `https://open.tiktokapis.com/v2/` | Video Upload, Video Info, User Info | ~600 req/min |
| **Instagram Graph API** | Facebook OAuth | `https://graph.facebook.com/v21.0/` | Reels Upload, Scheduling, Insights | 200 calls/user/hr, 25 posts/24h |
| **YouTube Data API** | Google OAuth 2.0 | `https://www.googleapis.com/youtube/v3/` | Video Upload, Scheduling, Analytics | 10.000 units/Tag (Upload = 1.600) |
| **Fal AI** | API Key (Server-Side) | `https://fal.run/` | queue.submit(), subscribe(), status() | Start 2, skaliert bis 40 concurrent |
| **Google Drive API** | Service Account / OAuth | `https://www.googleapis.com/drive/v3/` | files.get, files.list, files.export | 12.000 queries/min |
| **Supabase** | Anon Key + Service Key | Projekt-spezifisch | CRUD, Auth, Realtime, Storage | Free Tier Limits |
| **AWS Lambda** | IAM Credentials | Region-spezifisch | Remotion renderMediaOnLambda() | Account-Limits |
| **Claude API** | API Key | `https://api.anthropic.com/v1/` | Messages (Remotion Agent) | Tier-abhangig |

### 5.3 Token-Refresh-Strategie

```
TikTok:    Access Token (24h) → Refresh Token (365d) → Auto-Refresh
Instagram: Short-lived (1h) → Long-lived (60d) → Refresh vor Ablauf
           System User Token → Lauft nie ab (fur Server-to-Server)
YouTube:   Access Token (1h) → Refresh Token (unlimitiert) → Auto-Refresh
Fal AI:    API Key (kein Expiry) → Server-side Proxy
```

### 5.4 Webhook-Architektur

```
Fal AI Webhook → Supabase Edge Function → UPDATE generations → Supabase Realtime → Client UI
Lambda Callback → API Route → UPDATE render_jobs + generated_videos → Supabase Realtime → Client UI
```

---

## 6. User Stories & Acceptance Criteria

### Epic E1.3: Remotion Template

**US-1: Als Ali mochte ich eine Live-Vorschau meiner Video-Kombination sehen, bevor ich rendern lasse.**

Acceptance Criteria:
- [ ] Player zeigt 9:16-Format (1080x1920)
- [ ] Influencer-Clip spielt als Hintergrund
- [ ] Produkt-Clip wird eingeblendet (Timing konfigurierbar)
- [ ] Overlay-Text wird an konfigurierter Position angezeigt
- [ ] Play/Pause und Scrubbing funktionieren
- [ ] Anderungen an der Kombination updaten den Player in <1s

### Epic E1.6: Kombinations-Generator

**US-2: Als Ali mochte ich mit wenigen Klicks hunderte Video-Kombinationen generieren, ohne jede einzeln manuell anzulegen.**

Acceptance Criteria:
- [ ] Formular zeigt verfugbare Influencer-Clips, Produkt-Clips und Overlays als selektierbare Listen
- [ ] "Alle generieren" berechnet alle moglichen Kombinationen und zeigt die Zahl an
- [ ] Nur neue Kombinationen (nicht bereits existierende) werden angelegt
- [ ] Fortschrittsanzeige wahrend der Generierung
- [ ] Jede Kombination hat Status "To Render"
- [ ] Dedup-Constraint verhindert Duplikate (DB-Ebene)

**US-3: Als Ali mochte ich einen Batch von Videos mit einem Klick rendern lassen.**

Acceptance Criteria:
- [ ] Button "Alle ungerenderten rendern" startet Batch-Rendering
- [ ] Max Concurrent Renders ist konfigurierbar (Default: 5)
- [ ] Jedes Video zeigt individuellen Rendering-Fortschritt
- [ ] Fehlgeschlagene Renders zeigen Fehlermeldung und "Erneut versuchen"-Button
- [ ] Status-Ubergang: To Render -> Rendering -> Rendered (automatisch)

### Epic E2.1: Social Account Management

**US-4: Als Ali mochte ich meine TikTok-, Instagram- und YouTube-Accounts verbinden, um Videos direkt aus der App zu publizieren.**

Acceptance Criteria:
- [ ] "Account verbinden"-Button fur jede Plattform
- [ ] OAuth-Flow offnet sich im Popup/neuen Tab
- [ ] Nach erfolgreicher Verbindung: Account erscheint in der Account-Liste
- [ ] Anzeige: Platform-Icon, Username, Status (aktiv/abgelaufen)
- [ ] "Trennen"-Button entfernt den Account
- [ ] Token-Refresh passiert automatisch im Hintergrund

### Epic E2.2: TikTok Publishing

**US-5: Als Ali mochte ich ein gerendertes Video mit einem Klick auf TikTok posten.**

Acceptance Criteria:
- [ ] Button "Auf TikTok posten" bei Videos mit Status "Ready"
- [ ] Dialog: TikTok-Account wahlen, Caption eingeben, Hashtags setzen
- [ ] Upload startet und zeigt Fortschritt
- [ ] Nach Erfolg: Video-Status wechselt zu "Published", TikTok-URL wird gespeichert
- [ ] Disclosure-Badge-Hinweis wird angezeigt
- [ ] Bei Fehler: Fehlermeldung + Retry-Option

### Epic E2.3: Scheduling

**US-6: Als Ali mochte ich Videos fur die nachsten Tage vorplanen, damit sie automatisch gepostet werden.**

Acceptance Criteria:
- [ ] Kalenderansicht zeigt alle geplanten Posts
- [ ] Datum + Uhrzeit auswahlen fur geplantes Publishing
- [ ] System postet automatisch zum geplanten Zeitpunkt (+-5 Min)
- [ ] Geplante Posts konnen bearbeitet oder abgebrochen werden
- [ ] Bei Fehler: Automatischer Retry (3x), dann Notification

### Epic E3.3: AI Generation Studio -- Explore

**US-7: Als Ali mochte ich ein AI-Bild generieren, indem ich einfach beschreibe was ich sehen will, ohne technische Details zu kennen.**

Acceptance Criteria:
- [ ] Prompt-Feld + "AI Enhance"-Button, der den Prompt automatisch verbessert
- [ ] Model-Karten zeigen: Name, Starkenlabels, Beispielbilder
- [ ] Kostenanzeige VOR dem Generieren (z.B. "~$0.03")
- [ ] Geschatzte Dauer VOR dem Generieren (z.B. "~5 Sekunden")
- [ ] Ergebnis erscheint im rechten Panel
- [ ] Generierung wird automatisch in History gespeichert
- [ ] Fortschrittsanzeige wahrend der Generierung

### Epic E3.4: AI Generation Studio -- Compare

**US-8: Als Burak mochte ich den gleichen Prompt an 5 verschiedene Modelle gleichzeitig schicken und die Ergebnisse nebeneinander vergleichen.**

Acceptance Criteria:
- [ ] Prompt eingeben + bis zu 5 Modelle auswahlen (Checkboxes)
- [ ] "Vergleich starten"-Button zeigt Gesamtkosten
- [ ] Progressive Grid: Jedes Ergebnis erscheint sobald fertig
- [ ] Pro Modell angezeigt: Ergebnis, Generierungszeit, Kosten
- [ ] "Winner"-Button pro Paar (fur ELO-Berechnung, P2)

### Epic E4.1: TikTok Shop Product-Linking

**US-9: Als Ali mochte ich, dass nach dem TikTok-Upload automatisch das richtige Produkt an das Video verknupft wird.**

Acceptance Criteria:
- [ ] Nach erfolgreichem TikTok-Upload: System startet automatisch Playwright-Flow
- [ ] Flow: Creator Center offnen -> Video finden -> "Link Products" -> Produkt-URL einfugen -> Bestatigen
- [ ] Ergebnis wird geloggt (Erfolg/Fehler)
- [ ] Bei Fehler: Benachrichtigung an Ali mit Fehlerbeschreibung
- [ ] Manuelle Retry-Option
- [ ] CPL-Check VOR dem Linking (kein Versuch bei erreichtem Limit)

### Epic E4.3: CPL-Monitoring

**US-10: Als Ali mochte ich auf einen Blick sehen, welche meiner Accounts noch Shop-Videos posten konnen.**

Acceptance Criteria:
- [ ] Dashboard-Widget zeigt pro Account: Name, Platform, Shop-Videos letzte 7 Tage, Limit, Ampel (grun/gelb/rot)
- [ ] Gelb: 3-4 von 5 genutzt
- [ ] Rot: 5 von 5 (Limit erreicht)
- [ ] System blockiert automatisiertes Publishing bei rotem Status
- [ ] Refresh-Button aktualisiert die Zahlen

---

## 7. MVP vs. Future Scope

### MVP (Phase 1 + 2, Woche 1-4)

**Enthalten:**
- Supabase-Schema + Auth + RLS
- Asset-Management mit Google Drive Import
- Remotion Player Preview
- Kombinations-Generator mit Dedup
- Lambda-Rendering mit Status-Tracking
- TikTok Content Posting API (Video-Upload)
- Post-Scheduling Queue (BullMQ)
- Basis-UI: Asset-Liste, Kombinations-Formular, Preview, Video-Liste mit Status

**NICHT im MVP:**
- Instagram / YouTube Integration
- Content Calendar
- Metriken-Dashboard
- AI Generation Studio
- TikTok Shop Automation
- Kampagnen-System
- AI Agent
- Multi-Tenancy
- Mobile-optimiertes Design

### Phase 3 Erweiterung (Woche 5-6)

- Instagram Graph API + YouTube Data API
- Metriken-Dashboard (Views, Likes, Engagement)
- Performance-Vergleich nach Overlay/Produkt/Influencer
- Content Calendar
- AI Generation Studio: Explore + Compare Mode

### Phase 4 Erweiterung (Woche 7-8)

- Playwright TikTok Shop Product-Linking
- Multi-Account-Isolation
- CPL-Monitoring
- AI Generation Studio: Benchmark Mode + ELO
- AI Agent (NL -> Remotion)

### Zukunft (Post-Phase 4)

- Kampagnen-System
- Multi-Tenancy / SaaS
- Voller Video-Editor (Twick oder DesignCombo)
- Computer-Use Agent fur erweiterte TikTok-Shop-Automation
- Multi-Format Content (YouTube Longs, IG Carousels)
- Community Gallery mit kopierbaren Prompts
- Personalization Profiles (Midjourney-Style)
- Mobile App
- Dark Mode

---

## 8. Risk Assessment

### 8.1 Technische Risiken

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|--------|-------------------|--------|------------|
| R1 | TikTok UI-Anderung bricht Playwright-Selektoren | Hoch | Hoch | Modulare Selektoren in separater Config-Datei, Weekly Smoke Tests, Fallback auf manuelle Anleitung |
| R2 | TikTok App Review dauert langer als 4 Wochen | Mittel | Hoch | Frueh beantragen (Woche 1), Screen-Recordings vorbereiten, Composio MCP als Fallback |
| R3 | YouTube Upload-Quota (6/Tag) reicht nicht | Mittel | Mittel | Quota-Erhohung beantragen, Content priorisieren, YouTube erst in Phase 3 |
| R4 | Remotion Lambda Cold Starts verlangsamen Batch-Rendering | Niedrig | Mittel | Warm-Up-Strategie (Provisioned Concurrency), Batch-Scheduling zu Off-Peak-Zeiten |
| R5 | Google Drive API-Limits bei grossem Asset-Import | Niedrig | Niedrig | Batch-Import mit Rate Limiting, einmaliger Vorgang |
| R6 | Supabase Free Tier Limits (DB-Size, Bandwidth) | Mittel | Mittel | Monitoring aufsetzen, auf Supabase Pro ($25/mo) upgraden bei Bedarf |
| R7 | Fal AI Modell-Preise andern sich | Mittel | Niedrig | Kosten-Estimates aus Model Registry, Budget Caps, Fallback auf gunstigere Modelle |

### 8.2 Business-Risiken

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|--------|-------------------|--------|------------|
| R8 | TikTok Account-Ban durch Automation | Mittel | Hoch | Cookie-Auth statt API-Token, playwright-stealth, human-like Delays (randomisiert 2-5s), Account-Warmup-Protokoll |
| R9 | TikTok Shadow Ban (reduzierte Reichweite) | Mittel | Mittel | View-Monitoring pro Video (erste 24h), bei Abweichung: Account pausieren und rotieren |
| R10 | CPL-Sperre bei unter 5K-Follower-Accounts | Hoch | Hoch | Multi-Account-Strategie, CPL-Dashboard mit automatischer Blockierung bei Limit, Account-Wachstum fokussieren |
| R11 | TOS-Verstoss durch Browser-Automation | Sicher | Mittel | Branchenubliches, akzeptiertes Risiko. Keine personlichen Daten Dritter betroffen. |
| R12 | Remotion-Lizenzkosten steigen bei Scale | Niedrig | Mittel | Twick als evaluierte Fallback-Alternative ($0 Lizenz, kein Remotion-Lock-in) |
| R13 | Ali findet das UI zu komplex | Mittel | Hoch | Usability Tests mit Ali ab Phase 1, Progressive Disclosure, gemeinsame Design-Reviews |

### 8.3 Projekt-Risiken

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|--------|-------------------|--------|------------|
| R14 | Airtable-Migration verliert Daten | Niedrig | Hoch | Vollstandiger Export vor Migration, Validierungs-Script, paralleler Betrieb wahrend Ubergang |
| R15 | Scope Creep durch Feature-Wunsche | Hoch | Mittel | Strenge Phasen-Grenzen, PRD als Referenz, neue Features erst nach Phase 4 |
| R16 | TikTok Content Posting API Disclosure-Badge reduziert Engagement | Mittel | Mittel | A/B-Test: API vs. manueller Upload, Engagement-Monitoring |

### 8.4 Risiko-Matrix

```
Impact
  Hoch  │  R5        │  R6,R7     │  R1,R2,R8,R10,R13,R14
        │            │            │
Mittel  │  R4        │  R3,R9,R12 │  R11,R15,R16
        │            │            │
Niedrig │            │            │
        └────────────┼────────────┼──────────────
          Niedrig      Mittel       Hoch
                    Wahrscheinlichkeit
```

---

## Anhang A: Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **Kombination** | Spezifische Zusammensetzung aus Influencer-Clip + Produkt-Clip + Overlay = ein TikTok Video |
| **Combination Fingerprint** | UNIQUE String `{influencer_id}-{product_clip_id}-{overlay_id}` zur Duplikatserkennung |
| **CPL** | Content Posting Limit -- TikToks Limit fur Shop-Videos (5/7 Tage bei <5K Followern) |
| **Lambda-Rendering** | Serverless Video-Rendering uber AWS Lambda mit Remotion |
| **Overlay** | Text- oder Grafik-Element, das uber das Video gelegt wird (z.B. "Ist das ein Preisfehler?") |
| **Provider-Pattern** | Architekturmuster: Jede Social-Plattform implementiert ein Interface (upload, schedule, getMetrics) |
| **Remotion Player** | React-Komponente die Videos im Browser als Live-Preview rendert (ohne Lambda) |
| **Template-Props** | JSON-Konfiguration die ein Remotion-Template akzeptiert (Clip-URLs, Text, Farben, Timing) |

---

## Anhang B: Referenz-Dokumente

| Dokument | Pfad |
|----------|------|
| N8N Workflow-Analyse | `~/Desktop/MAYTT-N8N-Workflow-Analyse.md` |
| Research-Report (komplett) | `~/Desktop/MAYTT-Research-Komplett.md` |
| AI Media API Landscape | `~/Desktop/code2/orchestrator/_bmad/research/AI-MEDIA-API-PLATFORM-LANDSCAPE-2026.md` |
| AI Generation App UX Research | `~/Desktop/code2/orchestrator/_bmad/research/AI-GENERATION-APP-UX-RESEARCH.md` |
| Product Brief | `~/Desktop/code2/orchestrator/_bmad/MAYTT-PRODUCT-BRIEF.md` |
