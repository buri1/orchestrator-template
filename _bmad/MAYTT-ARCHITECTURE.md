# MAYTT Content Engine — Architecture Document

**Datum:** 2026-04-05
**Version:** 1.0
**Erstellt von:** BMAD Architect Agent
**Basierend auf:** Product Brief v1.0, PRD v1.0, Research Report, N8N-Workflow-Analyse
**Status:** Draft

---

## Inhaltsverzeichnis

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Architecture](#4-database-architecture)
5. [Integration Architecture](#5-integration-architecture)
6. [Infrastructure](#6-infrastructure)
7. [Security Architecture](#7-security-architecture)
8. [Technical Decisions Log](#8-technical-decisions-log)
9. [Folder Structure](#9-folder-structure)
10. [Performance Considerations](#10-performance-considerations)

---

## 1. System Overview

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐ │
│  │  Video       │  │  Social     │  │  AI         │  │  Dashboard         │ │
│  │  Pipeline    │  │  Planner    │  │  Generation │  │  (Metriken +       │ │
│  │              │  │  + Calendar │  │  Studio     │  │   CPL-Monitoring)  │ │
│  │  ┌────────┐  │  │             │  │             │  │                    │ │
│  │  │Remotion│  │  │             │  │  Explore    │  │                    │ │
│  │  │Player  │  │  │             │  │  Compare    │  │                    │ │
│  │  └────────┘  │  │             │  │  Benchmark  │  │                    │ │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬──────────┘ │
│         │                 │                │                    │            │
│  ┌──────▼─────────────────▼────────────────▼────────────────────▼──────────┐ │
│  │                      Supabase Realtime (WebSocket)                      │ │
│  │              Status-Updates, Render-Progress, Generation-Status          │ │
│  └─────────────────────────────────┬───────────────────────────────────────┘ │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTPS
┌────────────────────────────────────┼────────────────────────────────────────┐
│                        VERCEL (Next.js 15)                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js API Routes (/api/*)                        │  │
│  │                                                                        │  │
│  │  /api/assets/*        Asset-CRUD, GDrive-Import                       │  │
│  │  /api/combinations/*  Generator, Batch-Ops                            │  │
│  │  /api/render/*        Lambda-Trigger, Status-Callbacks                │  │
│  │  /api/social/*        OAuth-Flows, Publishing, Metrics-Polling        │  │
│  │  /api/schedule/*      BullMQ Job-Management                           │  │
│  │  /api/ai/*            Fal AI Proxy, Generation-CRUD                   │  │
│  │  /api/tiktok-shop/*   Playwright-Job-Trigger                          │  │
│  │  /api/webhooks/*      Fal AI + Lambda Callbacks                       │  │
│  └───────┬──────────┬───────────┬──────────┬──────────┬─────────────────┘  │
└──────────┼──────────┼───────────┼──────────┼──────────┼─────────────────────┘
           │          │           │          │          │
     ┌─────▼────┐ ┌───▼────┐ ┌───▼─────┐ ┌──▼────┐ ┌──▼──────────┐
     │ Supabase │ │  AWS   │ │ BullMQ  │ │Fal AI │ │ Google Drive│
     │          │ │        │ │ + Redis │ │       │ │             │
     │ Postgres │ │ Lambda │ │(Upstash)│ │985+   │ │ Asset-      │
     │ Auth     │ │ S3     │ │         │ │Models │ │ Storage     │
     │ Realtime │ │        │ │Schedule │ │       │ │             │
     │ Storage  │ │Remotion│ │Render Q │ │Queue  │ │ Drive API   │
     └──────────┘ │Render  │ │Publish Q│ │SSE    │ │ v3          │
                  └────────┘ └─────────┘ │Webhook│ └─────────────┘
                                         └───────┘
                                    ┌──────────────────┐
                                    │  Social APIs      │
                                    │                    │
                                    │  TikTok Content    │
                                    │  Posting API       │
                                    │                    │
                                    │  Instagram Graph   │
                                    │  API               │
                                    │                    │
                                    │  YouTube Data      │
                                    │  API v3            │
                                    └────────┬───────────┘
                                             │
                                    ┌────────▼───────────┐
                                    │  Playwright        │
                                    │  (Containerized)   │
                                    │                    │
                                    │  TikTok Creator    │
                                    │  Center            │
                                    │  Product-Linking   │
                                    └────────────────────┘
```

### 1.2 Component Map

| Komponente | Verantwortung | Technologie |
|-----------|---------------|-------------|
| **Web App** | UI, Preview, Forms, Dashboards | Next.js 15 + React 19 + shadcn/ui + Tailwind v4 |
| **API Layer** | Business-Logik, Auth-Guards, Proxy | Next.js API Routes (App Router) |
| **Datenbank** | Persistence, RLS, Realtime | Supabase PostgreSQL |
| **Auth** | User-Management, Social OAuth | Supabase Auth |
| **Video Engine** | Preview + Rendering | Remotion Player (Client) + Lambda (Server) |
| **Job Queue** | Scheduling, Render-Queue, Retry | BullMQ + Redis (Upstash) |
| **AI Engine** | Bild/Video/Audio-Generierung | Fal AI (Server-Proxy) |
| **Social Publishing** | Multi-Plattform-Upload | Provider-Pattern (TikTok, IG, YT) |
| **Browser Automation** | TikTok Shop Product-Linking | Playwright + playwright-stealth |
| **File Storage** | Assets (Input) + Renders (Output) | Google Drive (Input) + Supabase Storage / S3 (Output) |

### 1.3 Data Flow Diagramme

#### Flow 1: Kombinatorische Video-Pipeline

```
Ali wählt Assets            Kombinations-           Remotion Player          Lambda
im Formular                 Generator               (Live-Preview)           (Render)
    │                           │                        │                      │
    │  Influencer + Produkt     │                        │                      │
    │  + Overlay auswählen      │                        │                      │
    ├──────────────────────────▶│                        │                      │
    │                           │  Dedup-Check           │                      │
    │                           │  (UNIQUE Constraint)   │                      │
    │                           │  INSERT generated_     │                      │
    │                           │  videos (status:       │                      │
    │                           │  To Render)            │                      │
    │                           ├───────────────────────▶│                      │
    │                           │                        │  Template-Props      │
    │                           │                        │  (clipURLs, text,    │
    │                           │                        │   timing)            │
    │  Ali klickt Preview       │                        │  ◀── React-Render    │
    │◀──────────────────────────┼────────────────────────│      im Browser      │
    │                           │                        │                      │
    │  Ali klickt "Render"      │                        │                      │
    ├──────────────────────────▶│                        │                      │
    │                           │  /api/render/start     │                      │
    │                           ├─────────────────────────────────────────────▶│
    │                           │                        │  renderMediaOn-      │
    │                           │                        │  Lambda()            │
    │                           │                        │                      │
    │                           │                        │  Progress via        │
    │  Supabase Realtime        │  UPDATE render_jobs    │  Callback            │
    │  (Progress-Bar)           │◀─────────────────────────────────────────────│
    │◀──────────────────────────│                        │                      │
    │                           │                        │  S3 URL              │
    │                           │  UPDATE generated_     │◀─────────────────────│
    │                           │  videos (status:       │                      │
    │  Status: Rendered ✓       │  Rendered, file_url)   │                      │
    │◀──────────────────────────│                        │                      │
```

#### Flow 2: Social Media Publishing

```
Ali wählt Video          API Route              BullMQ                Social API
(status: Ready)         /api/social/publish     Job Queue             (Provider)
    │                       │                      │                      │
    │  "Auf TikTok posten"  │                      │                      │
    │  + Caption + Account  │                      │                      │
    ├──────────────────────▶│                       │                      │
    │                       │  INSERT scheduled_    │                      │
    │                       │  post (status:        │                      │
    │                       │  scheduled)           │                      │
    │                       ├─────────────────────▶│                      │
    │                       │                      │  Job zum geplanten   │
    │                       │                      │  Zeitpunkt           │
    │                       │                      ├─────────────────────▶│
    │                       │                      │                      │
    │                       │                      │  TikTok:             │
    │                       │                      │  POST /v2/post/      │
    │                       │                      │  publish/video/init/ │
    │                       │                      │                      │
    │                       │                      │  IG: POST /{ig-id}/  │
    │                       │                      │  media               │
    │                       │                      │                      │
    │                       │                      │  YT: videos.insert() │
    │                       │                      │                      │
    │  Supabase Realtime    │  UPDATE scheduled_   │                      │
    │  (Status: Published)  │  post (status:       │◀─────────────────────│
    │◀──────────────────────│  published,          │                      │
    │                       │  platform_post_url)  │                      │
    │                       │                      │                      │
    │                       │  Optional: Trigger   │                      │
    │                       │  Playwright für      │                      │
    │                       │  Product-Linking      │                      │
```

#### Flow 3: AI Generation (Fal AI)

```
User gibt Prompt ein    API Route              Fal AI                Supabase
                        /api/ai/generate       Queue API             Realtime
    │                       │                      │                      │
    │  Prompt + Model +     │                      │                      │
    │  Params               │                      │                      │
    ├──────────────────────▶│                       │                      │
    │                       │  INSERT generation    │                      │
    │                       │  (status: queued)     │                      │
    │                       │  ─────────────────────┼─────────────────────▶│
    │                       │                       │                      │
    │                       │  fal.queue.submit()   │                      │
    │                       │  + webhookUrl         │                      │
    │                       ├──────────────────────▶│                      │
    │                       │                       │                      │
    │                       │  request_id           │                      │
    │◀──────────────────────│                       │                      │
    │                       │                       │                      │
    │  Client subscribed    │                       │  Processing...       │
    │  auf Realtime         │                       │  ─ ─ ─ ─ ─ ─ ─      │
    │                       │                       │                      │
    │                       │  Webhook POST         │                      │
    │                       │  /api/webhooks/fal    │                      │
    │                       │◀──────────────────────│                      │
    │                       │                       │                      │
    │                       │  UPDATE generation    │                      │
    │                       │  (status: completed,  │                      │
    │  UI zeigt Ergebnis    │  output_url, cost,    │                      │
    │◀──────────────────────┼──duration_ms)─────────┼─────────────────────▶│
    │                       │                       │                      │
```

#### Flow 4: TikTok Shop Product-Linking

```
Scheduled Post           API Route              Playwright            TikTok Creator
published                /api/tiktok-shop       Container             Center (Browser)
    │                       │                      │                      │
    │  Trigger nach         │                      │                      │
    │  erfolgreichem        │                      │                      │
    │  TikTok-Upload        │                      │                      │
    ├──────────────────────▶│                       │                      │
    │                       │  CPL-Check:           │                      │
    │                       │  shop_videos_last_7d  │                      │
    │                       │  < limit_threshold?   │                      │
    │                       │                       │                      │
    │                       │  INSERT shop_linking_ │                      │
    │                       │  log (status: pending)│                      │
    │                       │                       │                      │
    │                       │  BullMQ Job           │                      │
    │                       ├──────────────────────▶│                      │
    │                       │                       │  Cookie-Auth laden   │
    │                       │                       │  (verschlüsselt)     │
    │                       │                       │                      │
    │                       │                       │  Navigate:           │
    │                       │                       │  Creator Center      │
    │                       │                       ├─────────────────────▶│
    │                       │                       │                      │
    │                       │                       │  Video finden        │
    │                       │                       │  (platform_post_id)  │
    │                       │                       ├─────────────────────▶│
    │                       │                       │                      │
    │                       │                       │  "Link Products"     │
    │                       │                       │  klicken             │
    │                       │                       ├─────────────────────▶│
    │                       │                       │                      │
    │                       │                       │  Produkt-URL         │
    │                       │                       │  eingeben            │
    │                       │                       │  (human-like delay)  │
    │                       │                       ├─────────────────────▶│
    │                       │                       │                      │
    │                       │                       │  Bestätigen          │
    │                       │                       ├─────────────────────▶│
    │                       │                       │                      │
    │  Supabase Realtime    │  UPDATE linking_log   │                      │
    │  (Linking: Success)   │  (status: success)    │◀─────────────────────│
    │◀──────────────────────│                       │                      │
```

---

## 2. Frontend Architecture

### 2.1 Next.js App Router Struktur

Die App nutzt den Next.js 15 App Router mit React 19 Server Components wo möglich und Client Components für interaktive UI (Remotion Player, Formulare, Dashboards).

**Routing-Strategie:** File-based Routing mit Route Groups für logische Bereiche.

### 2.2 Page/Route Map

```
app/
├── (auth)/
│   ├── login/page.tsx                    # Supabase Auth UI
│   └── callback/page.tsx                 # OAuth Callback Handler
│
├── (app)/                                # Authenticated Layout (Sidebar + Header)
│   ├── layout.tsx                        # Shared Shell: Sidebar-Navigation
│   ├── page.tsx                          # Dashboard/Home (Status-Übersicht)
│   │
│   ├── assets/
│   │   ├── page.tsx                      # Asset-Übersicht (Tabs: Influencer, Produkte, Overlays)
│   │   ├── influencers/
│   │   │   ├── page.tsx                  # Influencer-Clip-Liste (Grid mit Thumbnails)
│   │   │   └── [id]/page.tsx             # Einzelansicht: Preview, Metriken, Usage
│   │   ├── products/
│   │   │   ├── page.tsx                  # Produkt-Clip-Liste
│   │   │   └── [id]/page.tsx             # Einzelansicht
│   │   ├── overlays/
│   │   │   ├── page.tsx                  # Overlay-Liste mit PNG-Vorschau
│   │   │   └── new/page.tsx              # Neues Overlay erstellen (Remotion-Rendering)
│   │   └── import/page.tsx               # Google Drive Batch-Import
│   │
│   ├── videos/
│   │   ├── page.tsx                      # Alle generierten Videos (Tabelle mit Status-Filter)
│   │   ├── [id]/page.tsx                 # Einzelansicht: Preview, Status, Metriken, Publishing
│   │   └── generate/page.tsx             # Kombinations-Generator (Formular + Preview)
│   │
│   ├── render/
│   │   └── page.tsx                      # Render-Queue (aktive Jobs, History, Batch-Start)
│   │
│   ├── publish/
│   │   ├── page.tsx                      # Publishing-Dashboard (Ready-Videos)
│   │   ├── calendar/page.tsx             # Content Calendar (Woche/Monat)
│   │   └── queue/page.tsx                # Scheduled Posts Queue
│   │
│   ├── accounts/
│   │   └── page.tsx                      # Social-Account-Verwaltung (Connect/Disconnect)
│   │
│   ├── analytics/
│   │   ├── page.tsx                      # Metriken-Dashboard (aggregiert)
│   │   ├── performance/page.tsx          # Performance-Vergleich (Overlay/Produkt/Influencer)
│   │   └── cpl/page.tsx                  # CPL-Monitoring (Ampel-Dashboard)
│   │
│   ├── ai/
│   │   ├── page.tsx                      # AI Studio Home (letzte Generierungen)
│   │   ├── explore/page.tsx              # Explore Mode (Two-Panel)
│   │   ├── compare/page.tsx              # Compare Mode (Multi-Model Grid)
│   │   ├── benchmark/
│   │   │   ├── page.tsx                  # Benchmark-Suites-Liste
│   │   │   └── [id]/page.tsx             # Suite-Detail + Runs
│   │   ├── leaderboard/page.tsx          # ELO-Ranking
│   │   └── history/page.tsx              # Generation History (Suche, Filter, Tags)
│   │
│   └── settings/
│       ├── page.tsx                      # Allgemeine Einstellungen
│       ├── templates/page.tsx            # Remotion-Template-Verwaltung
│       └── configs/page.tsx              # Generation-Configs (Batch-Konfigurationen)
│
├── api/                                  # API Routes (siehe Backend Architecture)
│   ├── assets/
│   ├── combinations/
│   ├── render/
│   ├── social/
│   ├── schedule/
│   ├── ai/
│   ├── tiktok-shop/
│   └── webhooks/
│
└── remotion/                             # Remotion-Bundle (separater Entry Point)
    ├── Root.tsx                           # Remotion Composition Root
    ├── TikTokCombi.tsx                   # Haupt-Template: Influencer + Produkt + Overlay
    └── components/
        ├── InfluencerLayer.tsx
        ├── ProductLayer.tsx
        └── OverlayLayer.tsx
```

### 2.3 Component Hierarchy

```
<RootLayout>
├── <AuthProvider>                        # Supabase Auth Context
│   ├── <QueryClientProvider>             # TanStack Query für Server-State
│   │   ├── <AppShell>                    # Sidebar + Header + Main Content
│   │   │   ├── <Sidebar>
│   │   │   │   ├── <NavGroup label="Pipeline">
│   │   │   │   │   ├── <NavItem to="/assets" icon="Layers" />
│   │   │   │   │   ├── <NavItem to="/videos" icon="Film" />
│   │   │   │   │   └── <NavItem to="/render" icon="Cpu" />
│   │   │   │   ├── <NavGroup label="Social">
│   │   │   │   │   ├── <NavItem to="/publish" icon="Send" />
│   │   │   │   │   ├── <NavItem to="/publish/calendar" icon="Calendar" />
│   │   │   │   │   └── <NavItem to="/accounts" icon="Users" />
│   │   │   │   ├── <NavGroup label="Analytics">
│   │   │   │   │   ├── <NavItem to="/analytics" icon="BarChart" />
│   │   │   │   │   └── <NavItem to="/analytics/cpl" icon="Shield" />
│   │   │   │   ├── <NavGroup label="AI Studio">
│   │   │   │   │   ├── <NavItem to="/ai/explore" icon="Sparkles" />
│   │   │   │   │   ├── <NavItem to="/ai/compare" icon="Columns" />
│   │   │   │   │   └── <NavItem to="/ai/history" icon="Clock" />
│   │   │   │   └── <NavGroup label="Settings">
│   │   │   │       └── <NavItem to="/settings" icon="Settings" />
│   │   │   │
│   │   │   └── <MainContent>
│   │   │       └── {children}            # Page-spezifischer Content
│   │   │
│   │   └── <Toaster />                   # Globale Notifications (sonner)
│   │
│   └── <RealtimeProvider>                # Supabase Realtime Subscriptions
```

**Kern-UI-Komponenten (shadcn/ui-basiert):**

| Komponente | Verwendung | shadcn-Basis |
|-----------|-----------|-------------|
| `<AssetGrid>` | Thumbnail-Grid für Influencer/Produkt-Clips | Card + AspectRatio |
| `<VideoPreview>` | Remotion Player Wrapper mit Controls | Custom (Remotion Player) |
| `<CombinationForm>` | Multi-Select für Kombinations-Generator | Command + Popover |
| `<StatusBadge>` | Video-Status-Anzeige (farbcodiert) | Badge |
| `<RenderProgress>` | Fortschrittsbalken pro Render-Job | Progress |
| `<ContentCalendar>` | Kalender-View für Scheduled Posts | Custom (date-fns) |
| `<MetricsCard>` | KPI-Widget (Views, Likes, etc.) | Card + Stat |
| `<CplAmpel>` | Grün/Gelb/Rot-Ampel pro Account | Custom |
| `<ModelCard>` | AI-Modell mit Stärken + Kosten | Card + Badge |
| `<GenerationGrid>` | 2x2 Grid für AI-Ergebnisse | AspectRatio Grid |
| `<CompareGrid>` | Side-by-Side Multi-Model-Vergleich | Custom Grid |

### 2.4 State Management Strategy

**Prinzip:** Server-State via TanStack Query, Client-State minimal via React useState/useReducer.

```
┌────────────────────────────────────────────────────────┐
│                   State Management                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ TanStack Query (Server-State)                    │   │
│  │                                                   │   │
│  │ • Asset-Listen (influencer_clips, product_clips) │   │
│  │ • Generated Videos + Status                       │   │
│  │ • Render-Jobs                                     │   │
│  │ • Scheduled Posts                                 │   │
│  │ • Post-Metriken                                   │   │
│  │ • AI-Generierungen                                │   │
│  │ • Social Accounts                                 │   │
│  │ • Model Registry                                  │   │
│  │                                                   │   │
│  │ Cache-Invalidation via Supabase Realtime:         │   │
│  │   Realtime-Event → queryClient.invalidateQueries()│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ React Context (Auth-State)                       │   │
│  │                                                   │   │
│  │ • session: User | null                            │   │
│  │ • isLoading: boolean                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ React useState / useReducer (lokaler UI-State)   │   │
│  │                                                   │   │
│  │ • Formular-State (Kombinations-Generator)         │   │
│  │ • Aktive Filter/Sortierung                        │   │
│  │ • Modal-Zustand                                   │   │
│  │ • Remotion Player Position                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ URL State (nuqs)                                 │   │
│  │                                                   │   │
│  │ • Aktive Tabs, Filter, Paginierung                │   │
│  │ • Shareable/Bookmarkable                          │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

**Warum TanStack Query statt Zustand/Redux:**
- MAYTT ist datenintensiv (1.132+ Videos, 50+ Produkte, laufende Metriken-Polls) -- Server-State dominiert
- TanStack Query bietet Caching, Deduplication, Background Refetching, Optimistic Updates
- Kein globaler Client-State-Store nötig -- die App liest/schreibt primär Server-Daten
- Supabase Realtime invalidiert Query-Caches automatisch bei DB-Änderungen

### 2.5 Remotion Player Integration

```typescript
// Beispiel: Video-Preview-Komponente
import { Player } from "@remotion/player";
import { TikTokCombi } from "~/remotion/TikTokCombi";

interface VideoPreviewProps {
  influencerClipUrl: string;
  productClipUrl: string;
  overlayText: string;
  overlayPosition: "Top-Center" | "Bottom-Center" | "Center";
}

export function VideoPreview(props: VideoPreviewProps) {
  return (
    <Player
      component={TikTokCombi}
      inputProps={props}
      durationInFrames={450}        // 15s bei 30fps
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      style={{ width: "100%", maxWidth: 360 }}
      controls
      autoPlay={false}
    />
  );
}
```

**Entscheidung:** Remotion Player wird als **Client Component** (`"use client"`) eingebunden. Das Remotion-Bundle wird separat gebundled und NICHT im Server-Bundle inkludiert. `@remotion/player` ist eine reine Client-Library.

**Remotion-Template-Architektur:**
- Templates sind React-Komponenten mit typisiertem `inputProps`-Schema (Zod)
- Templates werden in `/app/remotion/` definiert, nicht in `/components/`
- Für Lambda-Rendering wird das gleiche Template via `@remotion/lambda` deployed
- Template-Konfigurationen (Standard-Werte, Timing, etc.) werden in der `templates`-Tabelle gespeichert

---

## 3. Backend Architecture

### 3.1 Entscheidung: Next.js API Routes als primäres Backend

**Entscheidung:** Alle Business-Logik läuft in Next.js API Routes (App Router Route Handlers). Supabase Edge Functions werden NUR für Webhooks verwendet (Fal AI, Lambda-Callbacks).

**Begründung:**

| Kriterium | Next.js API Routes | Supabase Edge Functions |
|-----------|-------------------|----------------------|
| **Deployment** | Vercel (automatisch) | Supabase CLI (`supabase functions deploy`) |
| **Runtime** | Node.js (Vercel Serverless) | Deno (Supabase) |
| **npm Ecosystem** | Volles npm (`@remotion/lambda`, `bullmq`, `@fal-ai/client`) | Eingeschränkt (deno.land/x, npm: prefix) |
| **Cold Start** | ~100-300ms (Vercel) | ~200-500ms (Supabase) |
| **Timeout** | 60s (Hobby), 300s (Pro) | 150s (Free), 540s (Pro) |
| **Zugang zu Supabase** | Über `@supabase/supabase-js` (Service-Key) | Direkter DB-Zugang (lokal) |
| **BullMQ** | Nativ (Node.js) | Nicht möglich (Deno, kein ioredis) |
| **Remotion Lambda** | `@remotion/lambda` nativ | Nicht möglich (AWS SDK Abhängigkeiten) |

**Fazit:** Next.js API Routes sind der natürliche Ort, weil:
1. **BullMQ** erfordert Node.js + ioredis -- funktioniert nicht in Deno/Edge Functions
2. **@remotion/lambda** erfordert AWS SDK -- funktioniert nicht in Deno
3. **@fal-ai/server-proxy** ist als Next.js-Middleware designed
4. Ein einziges Deployment (Vercel) statt zwei (Vercel + Supabase)

**Ausnahme -- Supabase Edge Functions für Webhooks:**
- Webhook-Endpoints die von Fal AI und Lambda aufgerufen werden
- Grund: Diese brauchen direkten DB-Zugang und sollen Vercel-Cold-Starts umgehen
- Alternativ: Webhooks als Next.js API Routes (einfacher, ein Deploy-Target)
- **Finale Entscheidung: Alles in Next.js API Routes.** Webhooks brauchen keinen speziellen DB-Zugang -- sie gehen über `@supabase/supabase-js` mit dem Service-Key.

### 3.2 API Route Design (RESTful)

```
/api/
├── auth/
│   ├── callback/route.ts              # OAuth Callback (Supabase Auth)
│   └── session/route.ts               # GET: aktuelle Session
│
├── assets/
│   ├── influencers/
│   │   ├── route.ts                   # GET: Liste, POST: Create
│   │   └── [id]/route.ts             # GET, PATCH, DELETE
│   ├── products/
│   │   ├── route.ts                   # GET: Liste, POST: Create
│   │   └── [id]/route.ts             # GET, PATCH, DELETE
│   ├── product-clips/
│   │   ├── route.ts                   # GET, POST
│   │   └── [id]/route.ts             # GET, PATCH, DELETE
│   ├── overlays/
│   │   ├── route.ts                   # GET, POST (inkl. Remotion-PNG-Render)
│   │   └── [id]/route.ts             # GET, PATCH, DELETE
│   └── import/
│       └── gdrive/route.ts            # POST: Batch-Import aus Google Drive
│
├── combinations/
│   ├── route.ts                       # POST: Kombinationen generieren
│   ├── preview/route.ts               # POST: Kombinations-Vorschau (Anzahl berechnen)
│   └── configs/
│       ├── route.ts                   # GET, POST: Generation-Configs
│       └── [id]/route.ts             # GET, PATCH, DELETE
│
├── videos/
│   ├── route.ts                       # GET: Generated Videos (Filter, Pagination)
│   └── [id]/
│       ├── route.ts                   # GET, PATCH (Status-Update), DELETE
│       └── render/route.ts           # POST: Render starten
│
├── render/
│   ├── batch/route.ts                 # POST: Batch-Rendering starten
│   ├── jobs/route.ts                  # GET: Aktive Render-Jobs
│   └── callback/route.ts             # POST: Lambda Render-Callback
│
├── social/
│   ├── accounts/
│   │   ├── route.ts                   # GET, POST (OAuth initiate)
│   │   └── [id]/
│   │       ├── route.ts              # GET, DELETE (Disconnect)
│   │       └── refresh/route.ts      # POST: Token manuell refreshen
│   ├── publish/route.ts              # POST: Video sofort publizieren
│   └── metrics/
│       ├── route.ts                   # GET: Aggregierte Metriken
│       ├── poll/route.ts             # POST: Metriken-Polling triggern
│       └── performance/route.ts      # GET: Performance-Vergleich
│
├── schedule/
│   ├── route.ts                       # GET: Alle Scheduled Posts, POST: Neuen planen
│   ├── [id]/route.ts                 # PATCH (verschieben), DELETE (abbrechen)
│   └── calendar/route.ts            # GET: Calendar-View (Start/End-Range)
│
├── ai/
│   ├── generate/route.ts             # POST: Generation starten
│   ├── generations/
│   │   ├── route.ts                   # GET: History (Filter, Search, Pagination)
│   │   └── [id]/route.ts            # GET, PATCH (Favorite, Tags)
│   ├── models/route.ts               # GET: Model Registry
│   ├── compare/route.ts              # POST: Multi-Model-Vergleich starten
│   ├── benchmark/
│   │   ├── suites/
│   │   │   ├── route.ts              # GET, POST
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET, PATCH, DELETE
│   │   │       └── run/route.ts      # POST: Suite ausführen
│   │   └── runs/
│   │       └── [id]/route.ts         # GET: Run-Ergebnisse
│   ├── compare-vote/route.ts         # POST: Pairwise-Vergleich (ELO)
│   ├── collections/
│   │   ├── route.ts                   # GET, POST
│   │   └── [id]/route.ts            # GET, PATCH, DELETE, POST (Items hinzufügen)
│   └── tags/route.ts                 # GET, POST, DELETE
│
├── tiktok-shop/
│   ├── link/route.ts                  # POST: Product-Linking starten
│   ├── cpl/route.ts                   # GET: CPL-Status aller Accounts
│   └── logs/route.ts                 # GET: Linking-Logs
│
├── webhooks/
│   ├── fal/route.ts                   # POST: Fal AI Completion Webhook
│   └── render/route.ts               # POST: Lambda Render Completion
│
└── fal/proxy/route.ts                 # Fal AI Server Proxy (@fal-ai/server-proxy)
```

### 3.3 Authentication Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser   │     │   Next.js    │     │   Supabase   │
│   (Client)  │     │   (Server)   │     │   Auth       │
└──────┬──────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                     │
       │  1. Login-Button   │                     │
       │  (Email/Passwort   │                     │
       │   oder Social)     │                     │
       ├───────────────────▶│                     │
       │                    │                     │
       │  2. supabase.auth  │                     │
       │     .signInWith    │                     │
       │     Password()     │                     │
       │     oder           │                     │
       │     .signInWith    │                     │
       │     OAuth()        │                     │
       ├────────────────────┼────────────────────▶│
       │                    │                     │
       │  3. JWT (Access    │                     │
       │     + Refresh)     │                     │
       │◀───────────────────┼─────────────────────│
       │                    │                     │
       │  4. Jeder API-Call:│                     │
       │  Authorization:    │                     │
       │  Bearer <JWT>      │                     │
       ├───────────────────▶│                     │
       │                    │  5. supabase         │
       │                    │     .auth            │
       │                    │     .getUser(token)  │
       │                    ├────────────────────▶│
       │                    │                     │
       │                    │  6. User-Objekt     │
       │                    │◀────────────────────│
       │                    │                     │
       │                    │  7. RLS erzwingt    │
       │                    │     auth.uid()       │
       │                    │     auf alle Queries │
```

**Auth-Strategie für MVP:** Supabase Auth mit Email/Password Login. Kein Social Login für App-Auth nötig (Ali loggt sich per Email ein). Social OAuth (TikTok, IG, YT) wird separat über die Social-Account-Verwaltung gehandhabt -- das sind NICHT die App-Login-Credentials, sondern API-Zugangs-Tokens.

**Middleware-Pattern für API-Route-Protection:**

```typescript
// lib/auth.ts
import { createClient } from "@supabase/supabase-js";

export async function getAuthUser(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Unauthorized");

  return { user, supabase };
}
```

### 3.4 File Upload Flow (GDrive zu App)

```
┌───────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────┐
│   Browser     │     │  API Route    │     │ Google Drive  │     │ Supabase │
│               │     │ /api/assets/  │     │ API v3        │     │ DB       │
│               │     │ import/gdrive │     │               │     │          │
└───────┬───────┘     └───────┬───────┘     └──────┬────────┘     └─────┬────┘
        │                      │                    │                    │
        │  POST mit            │                    │                    │
        │  [drive_ids]         │                    │                    │
        ├─────────────────────▶│                    │                    │
        │                      │                    │                    │
        │                      │  files.get()       │                    │
        │                      │  pro Drive-ID      │                    │
        │                      ├───────────────────▶│                    │
        │                      │                    │                    │
        │                      │  File Metadata     │                    │
        │                      │  (name, mimeType,  │                    │
        │                      │   webContentLink)  │                    │
        │                      │◀───────────────────│                    │
        │                      │                    │                    │
        │                      │  INSERT assets     │                    │
        │                      │  mit GDrive-URL    │                    │
        │                      │  als file_url      │                    │
        │                      ├────────────────────┼───────────────────▶│
        │                      │                    │                    │
        │  Ergebnis:           │                    │                    │
        │  45 Influencer       │                    │                    │
        │  50 Produkt-Clips    │                    │                    │
        │  importiert          │                    │                    │
        │◀─────────────────────│                    │                    │
```

**Wichtige Entscheidung:** Videos werden NICHT von Google Drive nach S3/Supabase Storage kopiert. Stattdessen speichern wir die Google Drive Download-URL (`webContentLink`) als `file_url`. Ali behält seine gewohnte GDrive-Struktur. Nur Render-Output (Lambda-Ergebnisse) geht nach S3.

**Gründe:**
1. Ali kennt Google Drive und organisiert Assets dort
2. Kein doppelter Storage-Cost
3. Google Drive URLs sind stabil (solange die Datei nicht gelöscht wird)
4. Für Remotion Lambda-Rendering: Lambda holt das Video direkt per URL (GDrive oder S3 egal)

---

## 4. Database Architecture

### 4.1 Vollständiges ER-Diagramm

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         CORE VIDEO PIPELINE                                  │
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐              │
│  │  products     │      │ product_clips │      │influencer_   │              │
│  │──────────────│◀─────│──────────────│      │clips         │              │
│  │ id (PK)      │  1:N │ id (PK)      │      │──────────────│              │
│  │ name         │      │ name         │      │ id (PK)      │              │
│  │ product_url  │      │ file_url     │      │ name         │              │
│  │ category     │      │ google_drive_│      │ file_url     │              │
│  │ brand        │      │ id           │      │ google_drive_│              │
│  │ tiktok_shop_ │      │ thumbnail_url│      │ id           │              │
│  │ url          │      │ product_id   │──┐   │ thumbnail_url│              │
│  │ is_active    │      │ video_type   │  │   │ influencer_  │              │
│  │ google_drive_│      │ duration_s   │  │   │ type         │              │
│  │ id           │      │ performance_ │  │   │ content_type │              │
│  │ notes        │      │ score        │  │   │ setting      │              │
│  └──────┬───────┘      │ is_active    │  │   │ engagement_  │              │
│         │              │ usage_count  │  │   │ bait         │              │
│         │              └──────┬───────┘  │   │ duration_s   │              │
│         │                     │          │   │ performance_ │              │
│         │              ┌──────┘          │   │ score        │              │
│         │              │                 │   │ is_active    │              │
│         │  1:N         │                 │   │ usage_count  │              │
│  ┌──────▼───────┐      │                 │   └──────┬───────┘              │
│  │  overlays     │      │                 │          │                      │
│  │──────────────│      │                 │          │                      │
│  │ id (PK)      │      │                 │          │                      │
│  │ name         │      │                 │          │                      │
│  │ type         │      │                 │          │                      │
│  │ text_content │      │                 │          │                      │
│  │ asset_url    │      │                 │          │                      │
│  │ scope        │      │                 │          │                      │
│  │ linked_      │      │                 │          │                      │
│  │ product_id   │──┐   │                 │          │                      │
│  │ position     │  │   │                 │          │                      │
│  │ animation_   │  │   │                 │          │                      │
│  │ type         │  │   │                 │          │                      │
│  │ is_active    │  │   │                 │          │                      │
│  │ usage_count  │  │   │                 │          │                      │
│  └──────┬───────┘  │   │                 │          │                      │
│         │          │   │                 │          │                      │
│         │          │   │                 │          │                      │
│  ┌──────▼──────────▼───▼─────────────────▼──────────▼──────────────────┐   │
│  │                   generated_videos                                   │   │
│  │──────────────────────────────────────────────────────────────────── │   │
│  │ id (PK)                                                             │   │
│  │ combination_fingerprint (UNIQUE)                                    │   │
│  │ influencer_clip_id (FK) ──────────────────────────▶ influencer_clips│   │
│  │ product_clip_id (FK) ─────────────────────▶ product_clips           │   │
│  │ overlay_id (FK) ──────────────────▶ overlays                        │   │
│  │ product_id (FK) ──────▶ products                                    │   │
│  │ status (To Render|Rendering|Rendered|Ready|Scheduled|Published|Arch)│   │
│  │ video_file_url (S3)                                                 │   │
│  │ thumbnail_url                                                       │   │
│  │ duration_seconds                                                    │   │
│  │ render_attempts                                                     │   │
│  │ last_rendered_at                                                    │   │
│  │ google_drive_id                                                     │   │
│  │ campaign_id (FK, nullable) ──▶ campaigns                            │   │
│  │ UNIQUE (influencer_clip_id, product_clip_id, overlay_id)            │   │
│  └──────┬──────────────────────────────────────────────────────────────┘   │
│         │                                                                  │
│         │ 1:N                                                              │
│  ┌──────▼───────┐                                                          │
│  │ render_jobs   │                                                          │
│  │──────────────│                                                          │
│  │ id (PK)      │                                                          │
│  │ generated_   │                                                          │
│  │ video_id (FK)│                                                          │
│  │ status       │                                                          │
│  │ lambda_      │                                                          │
│  │ request_id   │                                                          │
│  │ s3_output_url│                                                          │
│  │ error_message│                                                          │
│  │ duration_ms  │                                                          │
│  └──────────────┘                                                          │
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐                                    │
│  │  templates    │      │ generation_  │                                    │
│  │──────────────│      │ configs      │                                    │
│  │ id (PK)      │      │──────────────│                                    │
│  │ name         │      │ id (PK)      │                                    │
│  │ description  │      │ name         │                                    │
│  │ template_    │      │ generation_  │                                    │
│  │ config (JSONB│      │ mode         │                                    │
│  │ is_default   │      │ overlay_     │                                    │
│  └──────────────┘      │ strategy     │                                    │
│                         │ max_videos   │                                    │
│                         │ max_conc_    │                                    │
│                         │ renders      │                                    │
│                         └──────────────┘                                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                       SOCIAL MEDIA & PUBLISHING                              │
│                                                                              │
│  ┌──────────────┐                                                            │
│  │social_accounts│                                                           │
│  │──────────────│                                                           │
│  │ id (PK)      │                                                           │
│  │ user_id (FK) │──▶ auth.users                                             │
│  │ platform     │                                                           │
│  │ platform_    │                                                           │
│  │ user_id      │                                                           │
│  │ username     │                                                           │
│  │ display_name │                                                           │
│  │ access_token │ (encrypted)                                               │
│  │ refresh_token│ (encrypted)                                               │
│  │ token_expires│                                                           │
│  │ _at          │                                                           │
│  │ follower_cnt │                                                           │
│  │ is_active    │                                                           │
│  │ metadata     │ (JSONB)                                                   │
│  └──────┬───────┘                                                           │
│         │                                                                    │
│         │ 1:N                                                                │
│  ┌──────▼──────────────────────────────┐                                    │
│  │        scheduled_posts               │                                    │
│  │──────────────────────────────────── │                                    │
│  │ id (PK)                              │                                    │
│  │ generated_video_id (FK) ──▶ gen_vid  │                                    │
│  │ social_account_id (FK) ──▶ soc_acc   │                                    │
│  │ platform                             │                                    │
│  │ status (draft|scheduled|publishing|  │                                    │
│  │         published|failed)            │                                    │
│  │ caption                              │                                    │
│  │ hashtags (text[])                    │                                    │
│  │ scheduled_at                         │                                    │
│  │ published_at                         │                                    │
│  │ platform_post_id                     │                                    │
│  │ platform_post_url                    │                                    │
│  │ error_message                        │                                    │
│  │ retry_count                          │                                    │
│  └──────┬───────────────────┬───────────┘                                    │
│         │ 1:N               │ 1:N                                            │
│  ┌──────▼───────┐    ┌──────▼──────────┐                                    │
│  │ post_metrics  │    │shop_linking_logs│                                    │
│  │──────────────│    │────────────────│                                    │
│  │ id (PK)      │    │ id (PK)        │                                    │
│  │ scheduled_   │    │ scheduled_     │                                    │
│  │ post_id (FK) │    │ post_id (FK)   │                                    │
│  │ views        │    │ product_id (FK)│                                    │
│  │ likes        │    │ social_account_│                                    │
│  │ comments     │    │ id (FK)        │                                    │
│  │ shares       │    │ status         │                                    │
│  │ saves        │    │ error_message  │                                    │
│  │ engagement_  │    │ attempt_count  │                                    │
│  │ rate         │    │ linked_at      │                                    │
│  │ avg_watch_s  │    └────────────────┘                                    │
│  │ ctr          │                                                           │
│  │ polled_at    │    ┌────────────────┐                                    │
│  └──────────────┘    │ cpl_tracking   │                                    │
│                       │────────────────│                                    │
│                       │ id (PK)        │                                    │
│                       │ social_account_│                                    │
│                       │ id (FK)        │                                    │
│                       │ shop_videos_   │                                    │
│                       │ last_7d        │                                    │
│                       │ follower_count │                                    │
│                       │ limit_threshold│                                    │
│                       │ is_at_limit    │                                    │
│                       │ last_checked_at│                                    │
│                       └────────────────┘                                    │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         AI GENERATION STUDIO                                 │
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐                                    │
│  │model_registry │      │  generations  │                                    │
│  │──────────────│      │──────────────│                                    │
│  │ id (PK, text)│◀─────│ id (PK)      │                                    │
│  │ provider     │      │ user_id (FK) │                                    │
│  │ display_name │      │ model_id (FK)│                                    │
│  │ media_type   │      │ provider     │                                    │
│  │ strengths[]  │      │ media_type   │                                    │
│  │ default_     │      │ prompt       │                                    │
│  │ parameters   │      │ enhanced_    │                                    │
│  │ cost_per_    │      │ prompt       │                                    │
│  │ unit_cents   │      │ negative_    │                                    │
│  │ cost_unit    │      │ prompt       │                                    │
│  │ is_active    │      │ parameters   │ (JSONB)                            │
│  └──────────────┘      │ output_url   │                                    │
│                         │ output_      │                                    │
│                         │ metadata     │ (JSONB)                            │
│                         │ cost_cents   │                                    │
│                         │ status       │                                    │
│                         │ error_message│                                    │
│                         │ fal_request_ │                                    │
│                         │ id           │                                    │
│                         │ duration_ms  │                                    │
│                         │ is_favorite  │                                    │
│                         └──────┬───────┘                                    │
│                                │                                             │
│                    ┌───────────┼───────────┐                                │
│                    │           │           │                                │
│             ┌──────▼──┐ ┌─────▼───┐ ┌─────▼──────────┐                    │
│             │ genera- │ │ collec- │ │ benchmark_run_ │                    │
│             │ tion_   │ │ tion_   │ │ generations    │                    │
│             │ tags    │ │ items   │ │────────────────│                    │
│             │─────────│ │─────────│ │ benchmark_run_ │                    │
│             │ genera- │ │ collec- │ │ id (FK)        │──▶ benchmark_runs  │
│             │ tion_id │ │ tion_id │ │ generation_    │                    │
│             │ tag_id  │ │ genera- │ │ id (FK)        │                    │
│             └────┬────┘ │ tion_id │ │ prompt_index   │                    │
│                  │      │ position│ └────────────────┘                    │
│           ┌──────▼──┐   └────┬────┘                                       │
│           │  tags    │   ┌───▼────────┐  ┌──────────────┐                 │
│           │─────────│   │collections │  │benchmark_runs│                 │
│           │ id (PK) │   │───────────│  │──────────────│                 │
│           │ user_id │   │ id (PK)   │  │ id (PK)      │                 │
│           │ name    │   │ user_id   │  │ suite_id (FK)│──▶ b_suites    │
│           │ color   │   │ name      │  │ user_id      │                 │
│           └─────────┘   │ descript. │  │ status       │                 │
│                          └───────────┘  │ total_cost   │                 │
│                                         └──────────────┘                 │
│  ┌──────────────┐      ┌──────────────┐                                  │
│  │benchmark_    │      │ comparisons   │                                  │
│  │suites        │      │──────────────│                                  │
│  │──────────────│      │ id (PK)      │                                  │
│  │ id (PK)      │      │ user_id      │                                  │
│  │ user_id      │      │ generation_  │                                  │
│  │ name         │      │ a_id (FK)    │──▶ generations                   │
│  │ description  │      │ generation_  │                                  │
│  │ prompt_set   │JSONB │ b_id (FK)    │──▶ generations                   │
│  │ target_models│JSONB │ winner       │                                  │
│  │ last_run_at  │      │ benchmark_   │                                  │
│  └──────────────┘      │ run_id (FK)  │                                  │
│                         └──────────────┘                                  │
│  ┌──────────────┐                                                         │
│  │model_elo_    │                                                         │
│  │scores        │                                                         │
│  │──────────────│                                                         │
│  │ model_id (PK)│                                                         │
│  │ model_name   │                                                         │
│  │ media_type   │                                                         │
│  │ elo_score    │ (default 1500)                                          │
│  │ total_votes  │                                                         │
│  │ win_rate     │                                                         │
│  └──────────────┘                                                         │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         KAMPAGNEN (Phase 4+)                                 │
│                                                                              │
│  ┌──────────────┐                                                           │
│  │  campaigns    │                                                           │
│  │──────────────│                                                           │
│  │ id (PK)      │◀──── generated_videos.campaign_id (optional)              │
│  │ name         │                                                           │
│  │ description  │                                                           │
│  │ start_date   │                                                           │
│  │ end_date     │                                                           │
│  │ budget_cents │                                                           │
│  │ target_views │                                                           │
│  │ target_      │                                                           │
│  │ engagement   │                                                           │
│  │ status       │                                                           │
│  └──────────────┘                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Tabellen-Übersicht (25 Tabellen)

| # | Tabelle | Bereich | Relationen | Phase |
|---|---------|---------|-----------|-------|
| 1 | `products` | Core | 1:N product_clips, 1:N overlays | P1 |
| 2 | `influencer_clips` | Core | 1:N generated_videos | P1 |
| 3 | `product_clips` | Core | N:1 products, 1:N generated_videos | P1 |
| 4 | `overlays` | Core | N:1 products, 1:N generated_videos | P1 |
| 5 | `generated_videos` | Core | N:1 influencer/product/overlay, 1:N render_jobs | P1 |
| 6 | `render_jobs` | Core | N:1 generated_videos | P1 |
| 7 | `templates` | Core | Standalone | P1 |
| 8 | `generation_configs` | Core | Standalone | P1 |
| 9 | `social_accounts` | Social | N:1 auth.users, 1:N scheduled_posts | P2 |
| 10 | `scheduled_posts` | Social | N:1 generated_videos, N:1 social_accounts | P2 |
| 11 | `post_metrics` | Social | N:1 scheduled_posts | P3 |
| 12 | `shop_linking_logs` | TikTok Shop | N:1 scheduled_posts, N:1 products | P4 |
| 13 | `cpl_tracking` | TikTok Shop | N:1 social_accounts | P4 |
| 14 | `generations` | AI Studio | N:1 auth.users, N:1 model_registry | P3 |
| 15 | `benchmark_suites` | AI Studio | N:1 auth.users | P3 |
| 16 | `benchmark_runs` | AI Studio | N:1 benchmark_suites | P3 |
| 17 | `benchmark_run_generations` | AI Studio | Junction (runs ↔ generations) | P3 |
| 18 | `comparisons` | AI Studio | N:1 generations (x2) | P3 |
| 19 | `model_elo_scores` | AI Studio | Precomputed Cache | P3 |
| 20 | `model_registry` | AI Studio | Referenced by generations | P3 |
| 21 | `tags` | AI Studio | N:1 auth.users | P3 |
| 22 | `generation_tags` | AI Studio | Junction (generations ↔ tags) | P3 |
| 23 | `collections` | AI Studio | N:1 auth.users | P3 |
| 24 | `collection_items` | AI Studio | Junction (collections ↔ generations) | P3 |
| 25 | `campaigns` | Kampagnen | 1:N generated_videos | P4 |

### 4.3 Index-Strategie

```sql
-- CORE PIPELINE: Häufigste Queries sind Status-Filterung und Asset-Lookups
CREATE INDEX idx_gv_status ON generated_videos(status);
CREATE INDEX idx_gv_product ON generated_videos(product_id);
CREATE INDEX idx_gv_influencer ON generated_videos(influencer_clip_id);
CREATE INDEX idx_gv_fingerprint ON generated_videos(combination_fingerprint);
CREATE INDEX idx_gv_created ON generated_videos(created_at DESC);
CREATE INDEX idx_gv_campaign ON generated_videos(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_render_status ON render_jobs(status);
CREATE INDEX idx_render_video ON render_jobs(generated_video_id);
CREATE INDEX idx_pc_product ON product_clips(product_id);
CREATE INDEX idx_ov_product ON overlays(linked_product_id) WHERE linked_product_id IS NOT NULL;

-- SOCIAL: Scheduling-Queries nach Zeit und Status
CREATE INDEX idx_social_user ON social_accounts(user_id);
CREATE INDEX idx_social_platform ON social_accounts(platform);
CREATE INDEX idx_sp_account ON scheduled_posts(social_account_id);
CREATE INDEX idx_sp_status ON scheduled_posts(status);
CREATE INDEX idx_sp_scheduled ON scheduled_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_sp_video ON scheduled_posts(generated_video_id);
CREATE INDEX idx_metrics_post ON post_metrics(scheduled_post_id);
CREATE INDEX idx_metrics_polled ON post_metrics(polled_at DESC);
CREATE INDEX idx_cpl_account ON cpl_tracking(social_account_id);

-- AI GENERATION: History-Suche, Modell-Filterung
CREATE INDEX idx_gen_user ON generations(user_id);
CREATE INDEX idx_gen_model ON generations(model_id);
CREATE INDEX idx_gen_status ON generations(status);
CREATE INDEX idx_gen_created ON generations(created_at DESC);
CREATE INDEX idx_gen_media ON generations(media_type);
CREATE INDEX idx_gen_favorite ON generations(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_gen_params ON generations USING GIN (parameters);
CREATE INDEX idx_gen_prompt ON generations USING GIN (to_tsvector('simple', prompt));
```

**Index-Prinzipien:**
- Partial Indexes (`WHERE`) für Status-Filter (z.B. nur `scheduled` Posts)
- GIN-Index auf `parameters` (JSONB) für flexible Modell-Parameter-Suche
- GIN-Index auf `prompt` (Full-Text-Search) für History-Suche
- Absteigend (`DESC`) auf `created_at` für neueste-zuerst-Abfragen

### 4.4 RLS Policies

```sql
-- Grundprinzip: Alle Tabellen mit user_id nutzen auth.uid() als Filter.
-- Core-Pipeline-Tabellen (products, clips, overlays, generated_videos) haben
-- KEINEN user_id -- sie gehören zum "Workspace" (aktuell 1 User: Ali).
-- Für spätere Multi-Tenancy: user_id oder workspace_id hinzufügen.

-- MVP: Einfache Authenticated-Only Policy für Core-Tabellen
-- (jeder eingeloggte User sieht alles -- Ali + Burak)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can modify products"
  ON products FOR ALL TO authenticated
  USING (true);

-- Gleiches Pattern für: influencer_clips, product_clips, overlays,
-- generated_videos, render_jobs, templates, generation_configs

-- Social Accounts: User sieht nur eigene
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own social accounts"
  ON social_accounts FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- AI Generations: User sieht nur eigene
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own generations"
  ON generations FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Performance-Pattern: auth.uid() IMMER in Subselect cachen
-- FALSCH (langsam, wird pro Row evaluiert):
--   USING (auth.uid() = user_id)
-- RICHTIG (einmal evaluiert, gecacht):
--   USING ((SELECT auth.uid()) = user_id)
```

**Multi-Tenancy-Vorbereitung (Post-MVP):**
- Core-Tabellen bekommen `workspace_id` Spalte
- RLS-Policy wird auf `workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = (SELECT auth.uid()))` umgestellt
- Keine strukturellen DB-Änderungen nötig, nur Spalte + Policy hinzufügen

### 4.5 Migration Strategy (Airtable nach Supabase)

```
┌─────────────────────────────────────────────────────────────┐
│                   MIGRATIONS-PLAN                            │
│                                                              │
│  Phase 1: Schema-Erstellung (automatisch via Supabase CLI)   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ supabase db reset                                       │ │
│  │ → Erstellt alle Tabellen, Indexes, RLS Policies         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Phase 2: Daten-Export aus Airtable                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Airtable API → JSON-Export pro Tabelle:                 │ │
│  │                                                          │ │
│  │ • PRODUCTS (50 Records)                                  │ │
│  │ • INFLUENCER_VIDEOS (45 Records)                         │ │
│  │ • PRODUCT_VIDEOS (50 Records)                            │ │
│  │ • OVERLAY_COMPONENTS (32 Records)                        │ │
│  │ • GENERATED_VIDEOS (1.132 Records)                       │ │
│  │ • GENERATION_CONFIG (26 Records)                         │ │
│  │                                                          │ │
│  │ Script: scripts/export-airtable.ts                      │ │
│  │ Output: data/airtable-export/*.json                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Phase 3: Transformation + Import                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ scripts/import-to-supabase.ts                           │ │
│  │                                                          │ │
│  │ Transformationen:                                        │ │
│  │ • Airtable Record IDs → Supabase UUIDs (Mapping-Table)  │ │
│  │ • Linked Records → Foreign Keys (UUID-Mapping)           │ │
│  │ • "Combination Fingerprint" beibehalten (UNIQUE)         │ │
│  │ • Creatomate PNG URLs → asset_url (bleiben, kein Re-Ren) │ │
│  │ • Google Drive IDs → google_drive_id Spalte              │ │
│  │ • GDrive Download URLs → file_url Spalte                 │ │
│  │ • Status-Werte 1:1 übernehmen (gleiche Enum-Werte)       │ │
│  │                                                          │ │
│  │ Reihenfolge (wegen FK-Constraints):                      │ │
│  │ 1. products                                              │ │
│  │ 2. influencer_clips                                      │ │
│  │ 3. product_clips (FK → products)                         │ │
│  │ 4. overlays (FK → products)                              │ │
│  │ 5. generated_videos (FK → clips + overlays + products)   │ │
│  │ 6. generation_configs                                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Phase 4: Validierung                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ scripts/validate-migration.ts                           │ │
│  │                                                          │ │
│  │ Checks:                                                  │ │
│  │ • Record-Count pro Tabelle (Airtable vs Supabase)        │ │
│  │ • Alle FK-Relationen intakt                              │ │
│  │ • UNIQUE Constraints halten                              │ │
│  │ • Stichproben-Vergleich (10 Random Records pro Tabelle)  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Phase 5: Parallelbetrieb (1 Woche)                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ • Airtable bleibt read-only aktiv                       │ │
│  │ • Neue Daten NUR in Supabase                            │ │
│  │ • Bei Problemen: Rollback zu Airtable möglich           │ │
│  │ • Nach 1 Woche ohne Probleme: Airtable abschalten      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Integration Architecture

### 5.1 Fal AI Integration (Queue + Webhook + SSE Pattern)

```typescript
// Architektur: Fal AI Request-Lifecycle

// 1. SUBMIT: API Route empfängt Generation-Request
// POST /api/ai/generate
export async function POST(req: Request) {
  const { modelId, prompt, parameters } = await req.json();

  // a) Generation in DB anlegen (status: queued)
  const { data: generation } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      model_id: modelId,
      prompt,
      parameters,
      status: "queued",
    })
    .select()
    .single();

  // b) Fal AI Queue Submit mit Webhook
  const result = await fal.queue.submit(modelId, {
    input: { prompt, ...parameters },
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/fal?generationId=${generation.id}`,
  });

  // c) Request-ID speichern
  await supabase
    .from("generations")
    .update({
      fal_request_id: result.request_id,
      status: "processing",
    })
    .eq("id", generation.id);

  return Response.json({ generationId: generation.id, requestId: result.request_id });
}

// 2. WEBHOOK: Fal AI ruft zurück wenn fertig
// POST /api/webhooks/fal
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const generationId = searchParams.get("generationId");
  const payload = await req.json();

  if (payload.status === "OK") {
    await supabase
      .from("generations")
      .update({
        status: "completed",
        output_url: payload.payload.images?.[0]?.url || payload.payload.video?.url,
        output_metadata: payload.payload,
        cost_cents: calculateCost(payload),
        duration_ms: payload.metrics?.inference_time,
        completed_at: new Date().toISOString(),
      })
      .eq("id", generationId);
  } else {
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: payload.error || "Unknown error",
      })
      .eq("id", generationId);
  }

  return new Response("OK", { status: 200 });
}

// 3. CLIENT: Supabase Realtime Subscription
// Im React-Component:
useEffect(() => {
  const channel = supabase
    .channel(`generation-${generationId}`)
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "generations",
      filter: `id=eq.${generationId}`,
    }, (payload) => {
      // UI-Update: Status, Output-URL, Kosten
      setGeneration(payload.new);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [generationId]);
```

**Fal AI Server-Proxy Setup:**

```typescript
// app/api/fal/proxy/route.ts
import { route } from "@fal-ai/server-proxy/nextjs";

// Dieser Proxy leitet Client-Requests an Fal AI weiter,
// fügt den API-Key serverseitig hinzu.
// Client ruft /api/fal/proxy/* auf, Key bleibt auf dem Server.
export const { GET, POST, PUT } = route;
```

### 5.2 Remotion Lambda Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    REMOTION RENDERING PIPELINE                   │
│                                                                  │
│  ┌──────────┐                                                    │
│  │ API Route │                                                    │
│  │ /api/     │                                                    │
│  │ render/   │                                                    │
│  │ start     │                                                    │
│  └─────┬─────┘                                                    │
│        │                                                          │
│        │  1. Render-Job in DB anlegen (status: queued)             │
│        │  2. renderMediaOnLambda() aufrufen                       │
│        │                                                          │
│        ▼                                                          │
│  ┌─────────────────────────────────────┐                         │
│  │         AWS Lambda (Remotion)        │                         │
│  │                                     │                         │
│  │  ┌────────────┐                     │                         │
│  │  │ Main       │  spawnt N parallele │                         │
│  │  │ Function   │──▶ Renderer         │                         │
│  │  └──────┬─────┘                     │                         │
│  │         │                           │                         │
│  │  ┌──────▼─────┐                     │                         │
│  │  │ Chrome     │  Rendert jeden      │                         │
│  │  │ Headless   │  Frame als PNG,     │                         │
│  │  │ (Renderer) │  encodiert zu       │                         │
│  │  └──────┬─────┘  MP4 (H.264)       │                         │
│  │         │                           │                         │
│  │  ┌──────▼─────┐                     │                         │
│  │  │ S3 Upload  │  Fertiges Video     │                         │
│  │  │            │  nach S3 Bucket     │                         │
│  │  └──────┬─────┘                     │                         │
│  └─────────┼───────────────────────────┘                         │
│            │                                                      │
│            │  3. Progress-Callback (optional, via getRenderProgress)
│            │  4. Completion: S3 URL zurück                       │
│            │                                                      │
│            ▼                                                      │
│  ┌──────────────┐                                                │
│  │ Callback     │                                                │
│  │ /api/render/ │                                                │
│  │ callback     │                                                │
│  │              │  5. UPDATE render_jobs (status: completed)     │
│  │              │  6. UPDATE generated_videos (video_file_url)   │
│  │              │  7. Supabase Realtime → Client-UI              │
│  └──────────────┘                                                │
└──────────────────────────────────────────────────────────────────┘
```

**Batch-Rendering-Strategie:**

```typescript
// Batch-Rendering mit konfigurierbarer Concurrency
async function startBatchRender(videoIds: string[], maxConcurrent: number = 5) {
  // BullMQ Jobs erstellen -- BullMQ managed die Concurrency
  const queue = new Queue("render-queue", { connection: redis });

  for (const videoId of videoIds) {
    await queue.add("render-video", { videoId }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
  }
}

// Worker verarbeitet Jobs
const worker = new Worker("render-queue", async (job) => {
  const { videoId } = job.data;

  // 1. Video-Daten laden
  const video = await supabase.from("generated_videos").select("*").eq("id", videoId).single();

  // 2. Template-Props zusammenbauen
  const inputProps = {
    influencerClipUrl: video.influencer_clip.file_url,
    productClipUrl: video.product_clip.file_url,
    overlayText: video.overlay.text_content,
    overlayPosition: video.overlay.position,
  };

  // 3. Lambda-Render starten
  const { renderId } = await renderMediaOnLambda({
    composition: "TikTokCombi",
    inputProps,
    codec: "h264",
    serveUrl: REMOTION_BUNDLE_URL,
    functionName: LAMBDA_FUNCTION_NAME,
    region: "eu-central-1",
  });

  // 4. Polling bis fertig
  let progress;
  do {
    progress = await getRenderProgress({ renderId, region: "eu-central-1", functionName: LAMBDA_FUNCTION_NAME });
    // Progress in DB speichern für Realtime-Updates
    await supabase.from("render_jobs").update({ progress: progress.overallProgress }).eq("generated_video_id", videoId);
    await new Promise(r => setTimeout(r, 2000));
  } while (!progress.done);

  // 5. Ergebnis speichern
  await supabase.from("generated_videos").update({
    status: "Rendered",
    video_file_url: progress.outputFile,
    last_rendered_at: new Date().toISOString(),
  }).eq("id", videoId);

}, { connection: redis, concurrency: maxConcurrent });
```

### 5.3 Social Media API Provider Pattern

```typescript
// Abstraktes Interface (Postiz-inspiriert)

interface SocialProvider {
  // Identifikation
  readonly platform: "tiktok" | "instagram" | "youtube";
  readonly displayName: string;

  // OAuth
  getAuthUrl(redirectUri: string, state: string): string;
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens>;
  refreshTokens(refreshToken: string): Promise<OAuthTokens>;

  // Publishing
  uploadVideo(params: VideoUploadParams): Promise<UploadResult>;
  schedulePost?(params: ScheduleParams): Promise<ScheduleResult>;  // optional (TikTok hat kein natives)

  // Metriken
  getVideoMetrics(platformVideoId: string): Promise<VideoMetrics>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
}

interface VideoUploadParams {
  videoUrl: string;          // S3 oder GDrive URL
  caption: string;
  hashtags?: string[];
  accessToken: string;
}

interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgWatchTimeSeconds?: number;
}

// Konkrete Implementierungen

class TikTokProvider implements SocialProvider {
  readonly platform = "tiktok";
  readonly displayName = "TikTok";

  async uploadVideo(params: VideoUploadParams): Promise<UploadResult> {
    // 1. Video-Init (Pull from URL)
    const initResponse = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: { Authorization: `Bearer ${params.accessToken}` },
      body: JSON.stringify({
        post_info: {
          title: params.caption,
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_duet: false,
          disable_stitch: false,
          disable_comment: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: params.videoUrl,
        },
      }),
    });
    // ...
  }

  // TikTok hat KEIN natives Scheduling → schedulePost ist undefined
  // → BullMQ übernimmt das Scheduling
}

class InstagramProvider implements SocialProvider {
  readonly platform = "instagram";

  async schedulePost(params: ScheduleParams): Promise<ScheduleResult> {
    // Instagram hat natives Scheduling
    const response = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
      method: "POST",
      body: JSON.stringify({
        video_url: params.videoUrl,
        caption: params.caption,
        media_type: "REELS",
        published: false,
        scheduled_publish_time: Math.floor(params.scheduledAt.getTime() / 1000),
      }),
    });
    // ...
  }
}

class YouTubeProvider implements SocialProvider {
  readonly platform = "youtube";

  async uploadVideo(params: VideoUploadParams): Promise<UploadResult> {
    // YouTube: Multipart Upload mit Scheduling via publishAt
    // ...
  }
}

// Provider-Registry
const providers: Record<string, SocialProvider> = {
  tiktok: new TikTokProvider(),
  instagram: new InstagramProvider(),
  youtube: new YouTubeProvider(),
};

// Nutzung: Einen Provider zu verwenden erfordert keinen plattform-spezifischen Code
const provider = providers[platform];
await provider.uploadVideo({ ... });
```

**Vorteil des Provider-Patterns:** Neue Plattformen (X/Twitter, LinkedIn, Threads) erfordern nur eine neue Provider-Klasse, keine Änderungen am Core-Code.

### 5.4 TikTok Shop Playwright Automation Flow

```typescript
// Architektur: Playwright-basierte Browser-Automation

// WICHTIG: Läuft NICHT in Vercel (keine persistente Browser-Instanz).
// Optionen:
// a) Separater Prozess auf EC2/Fly.io mit Playwright installiert
// b) BullMQ Worker der Playwright-Jobs verarbeitet (gleicher Server)
// c) AWS Lambda mit Playwright Layer (experimentell)
//
// ENTSCHEIDUNG: BullMQ Worker auf dediziertem Container (Fly.io oder Railway)
// Grund: Playwright braucht Chrome-Binary, Vercel hat die nicht.

interface PlaywrightJobData {
  scheduledPostId: string;
  productTikTokShopUrl: string;
  socialAccountId: string;
  platformPostId: string;  // TikTok Video-ID nach Upload
}

// Worker-Prozess (läuft auf Fly.io Container)
const playwrightWorker = new Worker("tiktok-shop-queue", async (job) => {
  const { scheduledPostId, productTikTokShopUrl, socialAccountId, platformPostId } = job.data;

  // 1. Cookie-Session laden (verschlüsselt aus DB)
  const account = await supabase.from("social_accounts").select("metadata").eq("id", socialAccountId).single();
  const cookies = decrypt(account.data.metadata.playwright_cookies);

  // 2. Browser mit isoliertem Profil starten
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: randomUserAgent(),
    viewport: { width: 1920, height: 1080 },
  });

  // 3. playwright-stealth anwenden
  await addStealth(context);

  // 4. Cookies injizieren (kein Login nötig)
  await context.addCookies(cookies);

  const page = await context.newPage();

  try {
    // 5. Creator Center navigieren
    await page.goto("https://www.tiktok.com/creator-center/content");
    await humanDelay(2000, 4000);

    // 6. Video finden (nach platformPostId)
    await page.click(`[data-video-id="${platformPostId}"]`);
    await humanDelay(1500, 3000);

    // 7. "Link Products" klicken
    await page.click(SELECTORS.linkProductsButton);
    await humanDelay(1000, 2000);

    // 8. Produkt-URL eingeben
    await page.fill(SELECTORS.productUrlInput, productTikTokShopUrl);
    await humanDelay(500, 1500);

    // 9. Bestätigen
    await page.click(SELECTORS.confirmButton);
    await humanDelay(2000, 3000);

    // 10. Erfolg loggen
    await supabase.from("shop_linking_logs").update({
      status: "success",
      linked_at: new Date().toISOString(),
    }).eq("scheduled_post_id", scheduledPostId);

  } catch (error) {
    await supabase.from("shop_linking_logs").update({
      status: "failed",
      error_message: error.message,
    }).eq("scheduled_post_id", scheduledPostId);
    throw error;  // BullMQ macht automatischen Retry
  } finally {
    await browser.close();
  }
}, {
  connection: redis,
  concurrency: 1,  // Nur 1 gleichzeitig pro Container (Browser-Ressourcen)
});

// Modulare Selektoren (leicht wartbar bei TikTok UI-Änderungen)
const SELECTORS = {
  linkProductsButton: '[data-e2e="link-product-btn"], .link-product-button',
  productUrlInput: '[data-e2e="product-url-input"], input[placeholder*="product"]',
  confirmButton: '[data-e2e="confirm-link-btn"], .confirm-button',
};

// Human-like Delay (randomisiert)
function humanDelay(min: number, max: number): Promise<void> {
  const delay = min + Math.random() * (max - min);
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

### 5.5 Google Drive Integration

```typescript
// Google Drive API v3 Integration für Asset-Import

import { google } from "googleapis";

// Auth: Service Account (Server-to-Server, kein User-Login nötig)
// Ali teilt seinen GDrive-Ordner mit dem Service Account.
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({ version: "v3", auth });

// Batch-Import: Alle Videos aus einem GDrive-Ordner
async function importFromDriveFolder(folderId: string, assetType: "influencer" | "product") {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'video/'`,
    fields: "files(id, name, mimeType, webContentLink, thumbnailLink, size)",
    pageSize: 100,
  });

  const assets = response.data.files?.map(file => ({
    name: file.name,
    file_url: `https://drive.google.com/uc?export=download&id=${file.id}`,
    google_drive_id: file.id,
    thumbnail_url: file.thumbnailLink,
  }));

  // Bulk-Insert in die jeweilige Tabelle
  const table = assetType === "influencer" ? "influencer_clips" : "product_clips";
  await supabase.from(table).upsert(assets, { onConflict: "google_drive_id" });

  return assets;
}

// Einzelne Datei per Drive-ID importieren
async function importSingleAsset(driveId: string) {
  const file = await drive.files.get({
    fileId: driveId,
    fields: "id, name, mimeType, webContentLink, thumbnailLink",
  });

  return {
    name: file.data.name,
    file_url: `https://drive.google.com/uc?export=download&id=${driveId}`,
    google_drive_id: driveId,
    thumbnail_url: file.data.thumbnailLink,
  };
}
```

---

## 6. Infrastructure

### 6.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    VERCEL (Frontend + API)                     │  │
│  │                                                                │  │
│  │  Next.js 15 App                                               │  │
│  │  ├── Static Pages (SSG)          → Vercel CDN (Edge)          │  │
│  │  ├── Server Components (SSR)     → Vercel Serverless (Node)   │  │
│  │  ├── API Routes (/api/*)         → Vercel Serverless Functions│  │
│  │  └── Remotion Bundle (static)    → Vercel CDN                 │  │
│  │                                                                │  │
│  │  Region: Frankfurt (fra1)                                     │  │
│  │  Plan: Pro ($20/mo)                                           │  │
│  │  Timeout: 300s (Pro)                                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐  │
│  │    SUPABASE           │  │         AWS                          │  │
│  │                       │  │                                      │  │
│  │  PostgreSQL 15        │  │  Lambda (eu-central-1)              │  │
│  │  Auth                 │  │  ├── Remotion Render Function       │  │
│  │  Realtime             │  │  └── 1024 MB RAM, 900s Timeout      │  │
│  │  Storage (Backups)    │  │                                      │  │
│  │                       │  │  S3 (eu-central-1)                  │  │
│  │  Region: Frankfurt    │  │  ├── maytt-renders (Render-Output)  │  │
│  │  Plan: Free → Pro     │  │  └── Lifecycle: Standard → IA 90d  │  │
│  │  ($25/mo bei Bedarf)  │  │                                      │  │
│  └──────────────────────┘  └──────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐  │
│  │    UPSTASH             │  │   FLY.IO (Playwright Container)     │  │
│  │    Redis               │  │                                      │  │
│  │                       │  │   Docker Container mit:              │  │
│  │  BullMQ Queues:       │  │   ├── Node.js Worker                │  │
│  │  ├── render-queue     │  │   ├── Playwright + Chromium          │  │
│  │  ├── publish-queue    │  │   ├── BullMQ Worker                  │  │
│  │  ├── metrics-poll     │  │   └── playwright-stealth             │  │
│  │  └── tiktok-shop      │  │                                      │  │
│  │                       │  │   Region: Frankfurt (fra)            │  │
│  │  Plan: Free (10K cmd) │  │   Plan: Shared 1x (256 MB, ~$3/mo)  │  │
│  │  → Pay-as-you-go      │  │   → Scale bei Bedarf                │  │
│  └──────────────────────┘  └──────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────┐                                            │
│  │  GOOGLE DRIVE         │                                            │
│  │  (bestehend)          │                                            │
│  │                       │                                            │
│  │  Service Account      │                                            │
│  │  Read-Only Access     │                                            │
│  └──────────────────────┘                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Environment Strategy

| Environment | Zweck | Infrastruktur | URL |
|-------------|-------|--------------|-----|
| **Development** | Lokale Entwicklung | `next dev` + Supabase Local (Docker) + Upstash Dev | `localhost:3000` |
| **Preview** | PR-Previews, Feature-Testing | Vercel Preview Deploy + Supabase Dev-Projekt | `*.vercel.app` |
| **Production** | Live-System für Ali | Vercel Prod + Supabase Prod + AWS Prod | `app.maytt.de` |

**Environment Variables:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Nur Server-Side!

# AWS (Remotion Lambda)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
REMOTION_AWS_REGION=eu-central-1
REMOTION_S3_BUCKET=maytt-renders
REMOTION_LAMBDA_FUNCTION=remotion-render-4-0

# Fal AI
FAL_KEY=fal-...                        # Nur Server-Side!

# Google Drive
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# BullMQ / Redis
UPSTASH_REDIS_URL=redis://...
UPSTASH_REDIS_TOKEN=...

# Social APIs
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...

# Encryption (für OAuth Tokens + Playwright Cookies)
ENCRYPTION_KEY=...                     # 32-byte hex string
```

### 6.3 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD (GitHub Actions)                     │
│                                                              │
│  Trigger: Push auf main oder Pull Request                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. LINT + TYPE-CHECK                                   │  │
│  │    npm run lint                                        │  │
│  │    npm run type-check (tsc --noEmit)                   │  │
│  │    Dauer: ~30s                                         │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                    │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ 2. UNIT TESTS                                          │  │
│  │    npm run test (Vitest)                               │  │
│  │    Tests: Provider-Pattern, Kombinations-Generator,    │  │
│  │           Dedup-Logic, Cost-Calculation                │  │
│  │    Dauer: ~60s                                         │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                    │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ 3. BUILD                                               │  │
│  │    npm run build (Next.js)                             │  │
│  │    Dauer: ~120s                                        │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                    │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │ 4. DEPLOY (nur bei Push auf main)                      │  │
│  │                                                        │  │
│  │    Vercel:     Auto-Deploy via Git Integration         │  │
│  │    Supabase:   supabase db push (Migrations)           │  │
│  │    Fly.io:     flyctl deploy (Playwright-Container)    │  │
│  │    AWS Lambda: npx remotion lambda deploy              │  │
│  │                (nur bei Remotion-Template-Änderungen)   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Supabase Migrations:                                        │
│  supabase/migrations/                                        │
│  ├── 20260405000000_initial_schema.sql                       │
│  ├── 20260405000001_rls_policies.sql                        │
│  ├── 20260412000000_social_accounts.sql                     │
│  ├── 20260419000000_ai_generation.sql                       │
│  └── 20260426000000_tiktok_shop.sql                         │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Monitoring & Logging

| Bereich | Tool | Was wird getrackt |
|---------|------|-------------------|
| **Application Errors** | Vercel Logs (built-in) | API-Fehler, Runtime Exceptions |
| **Render-Jobs** | `render_jobs` Tabelle | Status, Dauer, Fehler pro Video |
| **Publishing** | `scheduled_posts` Tabelle | Erfolg/Fehler pro Post, Retry-Count |
| **TikTok Shop** | `shop_linking_logs` Tabelle | Linking-Versuche, Fehler-Reasons |
| **Fal AI** | `generations` Tabelle | Dauer, Kosten, Fehler pro Generation |
| **Metriken-Polling** | BullMQ Dashboard | Job-Status, Queue-Länge, Failed Jobs |
| **Supabase** | Supabase Dashboard | DB-Size, API-Requests, Realtime-Connections |
| **Uptime** | Vercel Analytics (built-in) | Web Vitals, Page Load, Error Rate |
| **Kosten** | Custom Dashboard-Widget | AWS-Kosten (Lambda + S3), Fal AI Spend |

**MVP:** Kein externes Monitoring-Tool (kein Sentry, kein Datadog). Die DB-Tabellen (`render_jobs`, `shop_linking_logs`, `generations`) SIND das Logging-System. Jeder Job hat Status, Error-Message und Timestamps. Ein Admin-Dashboard-Widget aggregiert diese Daten.

**Post-MVP:** Bei Scale (10.000+ Videos): Sentry für Crash-Reporting, Upstash QStash Dashboard für Queue-Monitoring.

---

## 7. Security Architecture

### 7.1 Auth Flows

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTH ARCHITECTURE                          │
│                                                              │
│  ┌──────────────────────────────┐                           │
│  │ App-Login (Ali/Burak)        │                           │
│  │                              │                           │
│  │ Supabase Auth                │                           │
│  │ Email/Password               │                           │
│  │ → JWT (Access + Refresh)     │                           │
│  │ → RLS erzwingt auth.uid()    │                           │
│  └──────────────────────────────┘                           │
│                                                              │
│  ┌──────────────────────────────┐                           │
│  │ Social Platform OAuth        │                           │
│  │ (SEPARATE vom App-Login!)    │                           │
│  │                              │                           │
│  │ TikTok:                      │                           │
│  │ ├── OAuth 2.0 + PKCE         │                           │
│  │ ├── Scopes: video.upload,    │                           │
│  │ │   video.list, user.info    │                           │
│  │ ├── Access Token: 24h        │                           │
│  │ └── Refresh Token: 365d      │                           │
│  │                              │                           │
│  │ Instagram:                   │                           │
│  │ ├── Facebook Login OAuth     │                           │
│  │ ├── Long-lived Token: 60d    │                           │
│  │ └── System User Token: ∞     │                           │
│  │                              │                           │
│  │ YouTube:                     │                           │
│  │ ├── Google OAuth 2.0         │                           │
│  │ ├── Access Token: 1h         │                           │
│  │ └── Refresh Token: ∞         │                           │
│  │                              │                           │
│  │ Tokens werden AES-256        │                           │
│  │ verschlüsselt in             │                           │
│  │ social_accounts.access_token │                           │
│  │ gespeichert.                 │                           │
│  └──────────────────────────────┘                           │
│                                                              │
│  ┌──────────────────────────────┐                           │
│  │ Token-Refresh-Daemon          │                           │
│  │                              │                           │
│  │ BullMQ Repeatable Job:       │                           │
│  │ Alle 12h → prüfe alle       │                           │
│  │ social_accounts:             │                           │
│  │ IF token_expires_at < now()  │                           │
│  │    + 24h THEN refresh()      │                           │
│  └──────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 API Key Management

```
┌─────────────────────────────────────────────────────────────┐
│                API KEY SICHERHEIT                            │
│                                                              │
│  REGEL: KEIN API-Key darf jemals den Client erreichen.       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Server-Side Only (.env, Vercel Environment Variables) │   │
│  │                                                        │   │
│  │ • SUPABASE_SERVICE_ROLE_KEY                            │   │
│  │ • FAL_KEY                                              │   │
│  │ • AWS_ACCESS_KEY_ID + SECRET                           │   │
│  │ • GOOGLE_SERVICE_ACCOUNT_KEY                           │   │
│  │ • TIKTOK_CLIENT_SECRET                                 │   │
│  │ • INSTAGRAM_APP_SECRET                                 │   │
│  │ • YOUTUBE_CLIENT_SECRET                                │   │
│  │ • ENCRYPTION_KEY                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Client-Side erlaubt (NEXT_PUBLIC_*)                    │   │
│  │                                                        │   │
│  │ • NEXT_PUBLIC_SUPABASE_URL (Public, by Design)         │   │
│  │ • NEXT_PUBLIC_SUPABASE_ANON_KEY (Public, RLS schützt)  │   │
│  │ • NEXT_PUBLIC_APP_URL (eigene Domain)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Fal AI spezifisch:                                         │
│  @fal-ai/server-proxy leitet /api/fal/proxy/* Requests      │
│  an Fal AI weiter und fügt FAL_KEY serverseitig hinzu.      │
│  Client-Code ruft niemals fal.run direkt auf.               │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 RLS für Multi-User

Siehe [4.4 RLS Policies](#44-rls-policies) für die vollständige Implementierung.

**Zusammenfassung:**
- Core-Tabellen (products, clips, overlays, videos): `authenticated`-only (Ali + Burak sehen alles)
- User-bezogene Tabellen (social_accounts, generations): `auth.uid() = user_id`
- Supabase Service-Role-Key umgeht RLS für Server-to-Server-Operationen (Webhooks, BullMQ Workers)
- `auth.uid()` immer in Subselect cachen für Performance

### 7.4 Rate Limiting

```
┌─────────────────────────────────────────────────────────────┐
│                    RATE LIMITING STRATEGIE                    │
│                                                              │
│  Layer 1: Vercel (automatisch)                               │
│  ├── DDoS-Protection auf CDN-Level                          │
│  └── 1.000 Serverless-Invocations/s (Pro Plan)              │
│                                                              │
│  Layer 2: Applikation (Custom Middleware)                    │
│  ├── Fal AI: Max 40 concurrent Requests (Fal-Limit)        │
│  │   → Eigene Semaphore: Max 10 gleichzeitige Generierungen│
│  │     pro User (Kosten-Schutz)                             │
│  │                                                          │
│  ├── Social APIs (Provider respektiert Plattform-Limits):   │
│  │   TikTok: 600 req/min                                   │
│  │   Instagram: 200 calls/user/hour, 25 posts/24h          │
│  │   YouTube: 6 Uploads/Tag (10.000 units Quota)            │
│  │                                                          │
│  ├── Render-Queue: maxConcurrentRenders aus generation_config│
│  │   Default 5, konfigurierbar bis 100                     │
│  │                                                          │
│  └── TikTok Shop: 1 Playwright-Instanz gleichzeitig        │
│      + human-like Delays (2-5s zwischen Aktionen)           │
│                                                              │
│  Layer 3: Kosten-Caps                                       │
│  ├── Fal AI: Budget-Cap pro User pro Monat (konfigurierbar)│
│  ├── Lambda: Max Concurrent Lambdas (AWS Account-Limit)    │
│  └── Kostenanzeige VOR jeder AI-Generierung                │
└─────────────────────────────────────────────────────────────┘
```

### 7.5 Fal AI Proxy

Der `@fal-ai/server-proxy` wird als Next.js API Route eingebunden:

```typescript
// app/api/fal/proxy/[...path]/route.ts
import { route } from "@fal-ai/server-proxy/nextjs";

export const { GET, POST, PUT, DELETE } = route;

// Funktionsweise:
// 1. Client ruft /api/fal/proxy/fal-ai/flux/dev auf
// 2. server-proxy fügt FAL_KEY aus process.env hinzu
// 3. Request wird an https://fal.run/fal-ai/flux/dev weitergeleitet
// 4. Response wird an Client zurückgegeben
//
// → FAL_KEY verlässt NIEMALS den Server
```

### 7.6 Playwright Cookie-Verschlüsselung

```typescript
// OAuth-Tokens und Playwright-Cookies werden AES-256-GCM verschlüsselt

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex"); // 32 bytes

function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  // Format: iv:tag:ciphertext
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

function decrypt(ciphertext: string): string {
  const [ivHex, tagHex, encrypted] = ciphertext.split(":");
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

---

## 8. Technical Decisions Log

### TD-1: Supabase statt Firebase

| Kriterium | Supabase | Firebase |
|-----------|----------|---------|
| **Datenbank** | PostgreSQL (relational) | Firestore (NoSQL Document) |
| **Kombinations-Query** | `UNIQUE (a, b, c)` Constraint nativ | Kein UNIQUE-Constraint, Dedup in App-Code |
| **JOIN-Queries** | Nativ (FK-Relationen) | Denormalisierung nötig oder Cloud Functions |
| **RLS** | PostgreSQL Row Level Security | Firebase Security Rules (eigene DSL) |
| **Realtime** | PostgreSQL LISTEN/NOTIFY | Firestore onSnapshot (besser, aber an NoSQL gebunden) |
| **Preis** | Free Tier großzügig, Pro $25/mo | Spark Free, Blaze Pay-as-you-go |
| **Self-Host** | Möglich (Docker) | Nicht möglich |

**Entscheidung: Supabase.** Das Datenmodell ist stark relational (Produkte ↔ Clips ↔ Overlays ↔ Kombinationen). Ein UNIQUE Constraint auf drei FK-Spalten ist in PostgreSQL trivial, in Firestore eine Krücke. Die kombinatorischen Queries (21.000+ Kombinationen berechnen, Dedup) erfordern SQL.

### TD-2: Remotion statt Creatomate

| Kriterium | Remotion | Creatomate |
|-----------|----------|------------|
| **Rendering-Modell** | React-Komponenten = Frames | JSON API + Templates |
| **Preview** | Remotion Player (Browser, live) | Kein Live-Preview (erst nach Render) |
| **Kosten** | $0 (≤3 Personen) + Lambda ~$0.01-0.05/Render | Pro-Abo + Per-Render-Kosten |
| **Kontrolle** | Volle React/CSS/JS-Kontrolle | Template-Engine mit Einschränkungen |
| **AI Skills** | 150K+ Installs, Claude Code Plugin | Nicht vorhanden |
| **Lock-in** | Open Source Core | Proprietär |

**Entscheidung: Remotion.** Der kritischste Vorteil ist der Live-Preview im Browser VOR dem Rendern. Aktuell sind ~20% der Renders Fehl-Renders (Ali sieht das Ergebnis erst nach Creatomate-Rendering). Der Remotion Player eliminiert dieses Problem vollständig. Zusätzlich: $0 Lizenz für ≤3 Personen (Ali + Burak) vs. laufende Creatomate-Kosten.

### TD-3: Fal AI statt Replicate

| Kriterium | Fal AI | Replicate |
|-----------|--------|-----------|
| **Modell-Anzahl** | 985+ (406 Image, 450 Video, 59 Audio) | ~2.000+ (aber viele inaktiv) |
| **Pricing** | 30-50% günstiger als Replicate | Standard-Pricing |
| **Next.js Integration** | `@fal-ai/server-proxy` (offiziell) | Kein offizielles Proxy-Middleware |
| **Queue API** | Submit → Poll/SSE/Webhook | Predictions API (ähnlich) |
| **Concurrency** | Start 2, skaliert auf 40 | Start 1, skaliert langsamer |
| **Kling Direct** | $0.07/s (via Fal) | Nicht verfügbar |
| **Kling Direct** | vs. $4.200 Minimum Buy-in direkt | -- |

**Entscheidung: Fal AI.** Das Preismodell ist entscheidend -- bei einem Vergleich von 5 Modellen pro Session spart Fal 30-50% gegenüber Replicate. Die Next.js-Middleware (`@fal-ai/server-proxy`) löst das API-Key-im-Client-Problem elegant. Und das Modell-Angebot (Kling, Veo, Sora, Flux) deckt genau die Video- und Bild-Modelle ab, die für MAYTTs AI Studio relevant sind.

### TD-4: BullMQ statt Temporal

| Kriterium | BullMQ + Redis | Temporal |
|-----------|---------------|---------|
| **Infrastruktur** | Redis (Upstash Free Tier) | Temporal Server + DB (aufwändig) |
| **Setup** | `npm install bullmq`, 5 Zeilen Config | Docker Compose mit 4+ Services |
| **RAM** | ~0 (Upstash serverless) | Min 2-4 GB (Temporal Server) |
| **Learning Curve** | Einfach (Queue + Worker Pattern) | Komplex (Workflow DSL, Activity-Pattern) |
| **Feature-Fit** | Scheduling, Retry, Concurrency Limits | Overkill: Long-Running Workflows, Saga-Pattern |
| **Kosten** | $0 (Upstash Free: 10K Commands/Tag) | $20-50+/mo (Hosting) |

**Entscheidung: BullMQ.** MAYTTs Job-Anforderungen sind einfach: Schedule a post at time X, render video Y, retry on failure. Das ist ein klassischer Job-Queue-Use-Case, kein Workflow-Orchestration-Problem. Temporal löst Probleme, die MAYTT nicht hat (lange Sagas, Compensation, verteilte Transaktionen). BullMQ auf Upstash Redis kostet $0 und braucht 5 Zeilen Setup.

### TD-5: Provider-Pattern statt einzelne Integrationen

**Problem:** TikTok, Instagram und YouTube haben völlig unterschiedliche APIs, Auth-Flows und Capabilities. Ohne Abstraktion wird der Publishing-Code schnell unübersichtlich:
```typescript
// SCHLECHT: Plattform-spezifischer Code überall
if (platform === "tiktok") { ... }
else if (platform === "instagram") { ... }
else if (platform === "youtube") { ... }
```

**Lösung: Provider-Pattern (von Postiz übernommen)**
```typescript
// GUT: Einheitliches Interface, plattform-agnostischer Code
const provider = providers[platform];
await provider.uploadVideo({ videoUrl, caption, accessToken });
```

**Entscheidung: Provider-Pattern.** Gründe:
1. Neue Plattformen (X, LinkedIn) = neue Klasse, kein Refactoring
2. Testbarkeit: Provider einzeln testbar/mockbar
3. Wartbarkeit: TikTok UI-Änderungen betreffen NUR den TikTok-Provider
4. Von Postiz (27K Stars) bewährt -- gleiche Architektur, kein AGPL-Code übernommen

### TD-6: Next.js API Routes statt separates Backend

**Alternativen geprüft:**
- NestJS (wie Postiz) -- zu komplex, eigener Server nötig
- Express.js -- extra Hosting, kein Auto-Deploy
- Supabase Edge Functions -- Deno-Runtime, kein npm Ecosystem

**Entscheidung: Alles in Next.js.** Begründung:
1. Ein Deployment-Target (Vercel) statt zwei oder drei
2. Voller npm-Zugang (BullMQ, Remotion Lambda, Fal AI SDK)
3. Shared TypeScript Types zwischen Frontend und Backend
4. Vercel Serverless = Zero-Ops, Auto-Scaling
5. Für MAYTTs Scale (2 User, ~50 API-Calls/Minute) mehr als ausreichend

### TD-7: Single-App statt Monorepo

**Entscheidung: Single Next.js App (kein Monorepo).**

Postiz verwendet ein Monorepo (Turborepo) mit 8 Services -- das ist für ein Team mit 8+ Entwicklern sinnvoll. MAYTT hat 1 Entwickler (Burak) und 1 Operator (Ali). Ein Monorepo erzeugt Overhead ohne Nutzen:
- Keine shared Libraries nötig (alles im selben Repo)
- Kein Team-Coordination-Problem
- Playwright-Container ist die einzige separate Deployment-Unit, und die braucht kein Monorepo -- ein separates `Dockerfile` im `/playwright/` Ordner reicht

**Ausnahme:** Wenn der Playwright-Container wächst (Computer-Use-Agent in Phase 4+), kann er in ein separates Repo ausgelagert werden.

---

## 9. Folder Structure

```
maytt/
├── app/                                  # Next.js App Router
│   ├── (auth)/                           # Auth-Pages (Login, Callback)
│   ├── (app)/                            # Authenticated App (alle Features)
│   │   ├── assets/                       # Asset-Management
│   │   ├── videos/                       # Generated Videos
│   │   ├── render/                       # Render-Queue
│   │   ├── publish/                      # Publishing + Calendar
│   │   ├── accounts/                     # Social Account Management
│   │   ├── analytics/                    # Metriken + CPL
│   │   ├── ai/                           # AI Generation Studio
│   │   └── settings/                     # Einstellungen
│   ├── api/                              # API Route Handlers
│   │   ├── assets/
│   │   ├── combinations/
│   │   ├── render/
│   │   ├── social/
│   │   ├── schedule/
│   │   ├── ai/
│   │   ├── tiktok-shop/
│   │   ├── webhooks/
│   │   └── fal/proxy/
│   ├── remotion/                         # Remotion Compositions
│   │   ├── Root.tsx
│   │   ├── TikTokCombi.tsx
│   │   └── components/
│   ├── layout.tsx
│   ├── globals.css
│   └── not-found.tsx
│
├── components/                           # Shared React Components
│   ├── ui/                               # shadcn/ui Basis-Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                           # Layout-Komponenten
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── app-shell.tsx
│   ├── assets/                           # Asset-spezifische Components
│   │   ├── asset-grid.tsx
│   │   ├── asset-upload-dialog.tsx
│   │   └── gdrive-import-form.tsx
│   ├── video/                            # Video-Pipeline Components
│   │   ├── video-preview.tsx             # Remotion Player Wrapper
│   │   ├── combination-form.tsx
│   │   ├── status-badge.tsx
│   │   └── render-progress.tsx
│   ├── social/                           # Social Media Components
│   │   ├── account-connect-button.tsx
│   │   ├── publish-dialog.tsx
│   │   ├── content-calendar.tsx
│   │   └── cpl-ampel.tsx
│   ├── ai/                               # AI Studio Components
│   │   ├── model-card.tsx
│   │   ├── generation-grid.tsx
│   │   ├── compare-grid.tsx
│   │   ├── prompt-input.tsx
│   │   └── cost-estimate.tsx
│   └── dashboard/                        # Dashboard Components
│       ├── metrics-card.tsx
│       ├── performance-chart.tsx
│       └── status-overview.tsx
│
├── lib/                                  # Shared Utilities & Business Logic
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase Client
│   │   ├── server.ts                     # Server Supabase Client (Service Key)
│   │   └── types.ts                      # Generated Database Types
│   ├── auth.ts                           # Auth Helpers (getAuthUser)
│   ├── encryption.ts                     # AES-256-GCM Encrypt/Decrypt
│   ├── fal.ts                            # Fal AI Helpers
│   ├── remotion.ts                       # Remotion Lambda Helpers
│   ├── utils.ts                          # General Utilities
│   └── constants.ts                      # App-wide Constants
│
├── providers/                            # Social Media Provider Pattern
│   ├── base.ts                           # Abstract SocialProvider Interface
│   ├── tiktok.ts                         # TikTok Provider
│   ├── instagram.ts                      # Instagram Provider
│   ├── youtube.ts                        # YouTube Provider
│   └── index.ts                          # Provider Registry
│
├── hooks/                                # Custom React Hooks
│   ├── use-supabase.ts                   # Supabase Client Hook
│   ├── use-realtime.ts                   # Supabase Realtime Subscription
│   ├── use-generation.ts                 # AI Generation State
│   └── use-render-progress.ts            # Render Progress via Realtime
│
├── queues/                               # BullMQ Queue Definitions
│   ├── render.queue.ts                   # Render-Queue
│   ├── publish.queue.ts                  # Publishing-Queue
│   ├── metrics.queue.ts                  # Metrics-Polling-Queue
│   ├── tiktok-shop.queue.ts             # TikTok Shop Linking Queue
│   └── token-refresh.queue.ts           # OAuth Token Refresh
│
├── playwright/                           # Playwright Container
│   ├── Dockerfile                        # Chromium + Node.js Container
│   ├── worker.ts                         # BullMQ Worker für TikTok Shop
│   ├── selectors.ts                      # Modulare CSS-Selektoren
│   ├── stealth.ts                        # playwright-stealth Config
│   └── fly.toml                          # Fly.io Deployment Config
│
├── scripts/                              # CLI Scripts
│   ├── export-airtable.ts               # Airtable → JSON Export
│   ├── import-to-supabase.ts            # JSON → Supabase Import
│   ├── validate-migration.ts            # Migration-Validierung
│   ├── seed-model-registry.ts           # AI Model Registry Seeding
│   └── deploy-remotion-lambda.ts        # Lambda-Deployment
│
├── supabase/                             # Supabase CLI Projektstruktur
│   ├── config.toml                       # Supabase Local Dev Config
│   ├── migrations/                       # SQL Migrations
│   │   ├── 20260405000000_initial_schema.sql
│   │   ├── 20260405000001_rls_policies.sql
│   │   └── ...
│   └── seed.sql                          # Dev-Seed-Daten
│
├── public/                               # Static Assets
│   └── remotion-bundle/                  # Deployed Remotion Bundle (für Lambda)
│
├── types/                                # TypeScript Type Definitions
│   ├── database.ts                       # Supabase Generated Types
│   ├── social.ts                         # Social Provider Types
│   ├── ai.ts                             # AI Generation Types
│   └── remotion.ts                       # Remotion Template Props
│
├── .env.local                            # Environment Variables (NICHT in Git!)
├── .env.example                          # Template für .env
├── next.config.ts                        # Next.js Config
├── tailwind.config.ts                    # Tailwind CSS Config
├── tsconfig.json                         # TypeScript Config
├── package.json
└── CLAUDE.md                             # Projekt-Instruktionen für Claude Code
```

---

## 10. Performance Considerations

### 10.1 Video Rendering Queue Management

**Problem:** Bei Batch-Generierungen können 100+ Render-Jobs gleichzeitig entstehen. Lambda hat Account-Limits, und zu viele parallele Renders erhöhen Kosten durch Cold Starts.

**Lösung:**

```
┌─────────────────────────────────────────────────────────┐
│              RENDER QUEUE MANAGEMENT                     │
│                                                          │
│  BullMQ Queue: "render-queue"                           │
│                                                          │
│  Concurrency: Aus generation_config                     │
│  (Default: 5, Max: 100)                                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Strategie: FIFO mit Priority                     │   │
│  │                                                    │   │
│  │ Priority 1: Einzel-Renders (Ali hat "Render"       │   │
│  │             geklickt → erwartet sofort Ergebnis)    │   │
│  │                                                    │   │
│  │ Priority 2: Batch-Renders (können warten)           │   │
│  │                                                    │   │
│  │ Retry: 3 Versuche, Exponential Backoff             │   │
│  │ (5s → 25s → 125s)                                  │   │
│  │                                                    │   │
│  │ Timeout: 5 Minuten pro Render                      │   │
│  │ (konfigurierbar in generation_config)               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Lambda Warm-Up:                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Vor Batch-Start: 1 Dummy-Render starten            │   │
│  │ → Lambda-Instance ist warm für nachfolgende Jobs    │   │
│  │ → Cold Start nur 1x statt N-mal                    │   │
│  │ → Einsparung: ~11s → ~7.5s pro Render              │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Fal AI Concurrency Management

```
┌─────────────────────────────────────────────────────────┐
│              FAL AI CONCURRENCY                          │
│                                                          │
│  Fal Limits: Start 2 concurrent, skaliert auf 40         │
│                                                          │
│  Problem: Compare Mode sendet 5 Requests gleichzeitig.   │
│  Benchmark Mode kann 25+ Requests parallel starten.      │
│                                                          │
│  Lösung: Applikations-seitiges Concurrency-Limit        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Queue-basiert (nicht Promise.all!)                  │   │
│  │                                                    │   │
│  │ BullMQ Queue: "fal-generation"                     │   │
│  │ Concurrency: 5 (global)                            │   │
│  │ Per-User-Limit: 3 gleichzeitig                     │   │
│  │                                                    │   │
│  │ Compare Mode: 5 Jobs in Queue → 3 starten sofort   │   │
│  │               → 2 warten → Progressive Loading     │   │
│  │                                                    │   │
│  │ Benchmark: N Jobs → 3 gleichzeitig → Results       │   │
│  │            streamen über Supabase Realtime          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Budget-Schutz:                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ VOR jedem Submit:                                  │   │
│  │ 1. Kosten berechnen (aus model_registry)           │   │
│  │ 2. User-Budget prüfen (monthly_limit_cents)        │   │
│  │ 3. Bestätigung anzeigen (>$1)                      │   │
│  │ 4. Erst dann Queue-Submit                          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Supabase Realtime für Progress-Tracking

```
┌─────────────────────────────────────────────────────────┐
│           REALTIME PROGRESS TRACKING                     │
│                                                          │
│  Supabase Realtime Channels:                            │
│                                                          │
│  1. render_jobs Channel:                                │
│     ┌────────────────────────────────────────────────┐  │
│     │ Client subscribed auf:                          │  │
│     │ table: "render_jobs"                            │  │
│     │ event: "UPDATE"                                 │  │
│     │ filter: generated_video_id=eq.<id>              │  │
│     │                                                  │  │
│     │ Empfängt:                                        │  │
│     │ • progress (0-100%)                              │  │
│     │ • status (queued → processing → completed)       │  │
│     │ • s3_output_url (bei Completion)                 │  │
│     └────────────────────────────────────────────────┘  │
│                                                          │
│  2. generations Channel:                                │
│     ┌────────────────────────────────────────────────┐  │
│     │ Client subscribed auf:                          │  │
│     │ table: "generations"                            │  │
│     │ event: "UPDATE"                                 │  │
│     │ filter: id=eq.<generation_id>                   │  │
│     │                                                  │  │
│     │ Empfängt:                                        │  │
│     │ • status (queued → processing → completed)       │  │
│     │ • output_url (Ergebnis-Bild/Video)               │  │
│     │ • cost_cents + duration_ms                       │  │
│     └────────────────────────────────────────────────┘  │
│                                                          │
│  3. scheduled_posts Channel:                            │
│     ┌────────────────────────────────────────────────┐  │
│     │ Client subscribed auf:                          │  │
│     │ table: "scheduled_posts"                        │  │
│     │ event: "UPDATE"                                 │  │
│     │                                                  │  │
│     │ Empfängt:                                        │  │
│     │ • status (scheduled → publishing → published)    │  │
│     │ • platform_post_url (bei Erfolg)                 │  │
│     │ • error_message (bei Fehler)                     │  │
│     └────────────────────────────────────────────────┘  │
│                                                          │
│  Performance-Hinweis:                                    │
│  Supabase Free Tier: 200 concurrent Realtime connections │
│  MAYTT braucht: 2-3 Connections (Ali + Burak)            │
│  → Kein Problem. Erst bei SaaS (100+ User) relevant.    │
└─────────────────────────────────────────────────────────┘
```

### 10.4 Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  CACHING STRATEGY                        │
│                                                          │
│  Layer 1: TanStack Query (Client-Side)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ • staleTime: 5 Minuten (Assets, Model Registry)   │   │
│  │ • staleTime: 30 Sekunden (Render-Jobs, Scheduled)  │   │
│  │ • staleTime: 0 (Metriken -- immer frisch)          │   │
│  │                                                    │   │
│  │ Invalidation:                                      │   │
│  │ • Supabase Realtime → queryClient.invalidate()     │   │
│  │ • Mutation Success → automatische Invalidation      │   │
│  │ • Manual Refresh → refetchOnWindowFocus: true      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Layer 2: Next.js Cache (Server-Side)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ • Model Registry: revalidate: 3600 (1 Stunde)     │   │
│  │   → Modelle ändern sich selten                     │   │
│  │                                                    │   │
│  │ • Asset-Listen: revalidate: 0 (kein Cache)         │   │
│  │   → Daten ändern sich durch User-Aktionen          │   │
│  │                                                    │   │
│  │ • Static Pages (Login, etc.): ISR                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Layer 3: Fal AI Dedup-Cache                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Gleicher Prompt + Model + Params → aus DB holen    │   │
│  │ statt erneut generieren                            │   │
│  │                                                    │   │
│  │ Hash: SHA-256(model_id + prompt + JSON(params))    │   │
│  │ Lookup: generations WHERE hash = X AND status =    │   │
│  │         completed                                  │   │
│  │                                                    │   │
│  │ Einsparung: ~$0.03-0.60 pro duplizierte Request   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Layer 4: GDrive Thumbnail Cache                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Google Drive Thumbnails werden bei Import in       │   │
│  │ thumbnail_url gespeichert (direkte GDrive URL).    │   │
│  │                                                    │   │
│  │ Problem: GDrive Thumbnails können ablaufen.        │   │
│  │ Lösung: Bei 404 → erneut via Drive API laden       │   │
│  │         und URL updaten (lazy refresh).            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 10.5 Kombinations-Generator Performance

**Problem:** 45 Influencer x 50 Produkt-Clips x 32 Overlays = 72.000 theoretische Kombinationen. Davon müssen existierende Kombis (1.132) abgezogen und die Differenz in die DB geschrieben werden.

**Lösung:**

```sql
-- Berechnung der möglichen Kombos: SQL statt App-Code
-- (PostgreSQL kann das in <100ms für 72K Kombis)

WITH possible_combos AS (
  SELECT
    i.id AS influencer_clip_id,
    pc.id AS product_clip_id,
    o.id AS overlay_id,
    pc.product_id
  FROM influencer_clips i
  CROSS JOIN product_clips pc
  CROSS JOIN overlays o
  WHERE i.is_active = true
    AND pc.is_active = true
    AND o.is_active = true
    -- Overlay-Strategie-Filter
    AND (o.scope = 'Generic' OR o.linked_product_id = pc.product_id)
),
new_combos AS (
  SELECT pc.*
  FROM possible_combos pc
  LEFT JOIN generated_videos gv
    ON gv.influencer_clip_id = pc.influencer_clip_id
   AND gv.product_clip_id = pc.product_clip_id
   AND gv.overlay_id = pc.overlay_id
  WHERE gv.id IS NULL  -- Nur neue Kombis
)
INSERT INTO generated_videos (influencer_clip_id, product_clip_id, overlay_id, product_id, status)
SELECT influencer_clip_id, product_clip_id, overlay_id, product_id, 'To Render'
FROM new_combos
LIMIT $maxVideos;  -- Konfigurierbar
```

Die Kombinations-Berechnung wird vollständig in PostgreSQL durchgeführt (keine App-seitige Schleife). Das `CROSS JOIN` + `LEFT JOIN`-Pattern ist für diese Datenmengen (< 100K Rows) in < 1 Sekunde ausführbar.

---

## Anhang A: Referenz-Dokumente

| Dokument | Pfad |
|----------|------|
| Product Brief | `~/Desktop/code2/orchestrator/_bmad/MAYTT-PRODUCT-BRIEF.md` |
| PRD | `~/Desktop/code2/orchestrator/_bmad/MAYTT-PRD.md` |
| Research Report | `~/Desktop/MAYTT-Research-Komplett.md` |
| N8N Workflow-Analyse | `~/Desktop/MAYTT-N8N-Workflow-Analyse.md` |
| AI Media API Landscape | `~/Desktop/code2/orchestrator/_bmad/research/AI-MEDIA-API-PLATFORM-LANDSCAPE-2026.md` |
| AI Generation App UX Research | `~/Desktop/code2/orchestrator/_bmad/research/AI-GENERATION-APP-UX-RESEARCH.md` |

## Anhang B: Kosten-Zusammenfassung

| Phase | Monatliche Kosten |
|-------|------------------|
| **MVP (Phase 1-2)** | **$15-75** |
| Supabase Free Tier | $0 |
| Remotion (≤3 Personen) | $0 |
| AWS Lambda (1.000 Renders) | $10-50 |
| S3 Storage | ~$5 |
| Upstash Redis Free | $0 |
| Vercel Hobby → Pro | $0-20 |
| Fly.io (Playwright) | ~$3 |
| | |
| **Scale (10.000+ Videos/mo)** | **$250-650** |
| Remotion Automator | $100 |
| AWS Lambda (10K Renders) | $100-500 |
| Supabase Pro | $25 |
| Upstash Pay-as-you-go | ~$10 |
| Vercel Pro | $20 |
| Fly.io Scale | ~$10 |
