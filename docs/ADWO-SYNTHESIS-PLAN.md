# ADWO Synthesis Plan: CLI Orchestrator als Basis

> **Status:** UPDATED - Siehe STRUCTURED-EVENTS-ARCHITECTURE.md für aktuelle Event-Architektur
> **Erstellt:** 2026-02-01
> **Aktualisiert:** 2026-02-01
> **Autor:** Burak + Claude Opus 4.5
> **Handoff:** Siehe `docs/HANDOFF-SM.md` für SM Agent

---

## Executive Summary

Dieses Dokument beschreibt den Plan, den funktionierenden CLI-basierten Orchestrator (CityHub Pattern) als neue Basis für ADWO (Agentic Development Workflow Orchestrator) zu verwenden.

**Kernproblem:**
- ADWO hat ~24.500 LOC, funktioniert aber nicht richtig
- Der CLI Orchestrator hat ~1.000 LOC und liefert echten Value
- Wir wollen das Beste aus beiden Welten kombinieren

**Lösung:**
- CLI Orchestrator = Backend/Runtime
- ADWO Dashboard = Observability/UI
- Event Bridge = Verbindung zwischen beiden (WebSocket + REST Hybrid)

**Entscheidungen (gelöst):**
- ✅ Kommunikation: WebSocket (Events) + REST API (Antworten) - ADWO Pattern
- ✅ Start-Mechanismus: Event Bridge spawnt Orchestrator via Conduit
- ✅ Cost Tracking: OpenTelemetry (`CLAUDE_CODE_ENABLE_TELEMETRY=1`)

---

## WICHTIG: Architektur-Update (2026-02-01)

Die Event-Erfassung wurde grundlegend vereinfacht. Statt `terminal-read` + OTEL verwenden wir jetzt:

```bash
claude -p "task" --output-format stream-json --verbose --include-partial-messages 2>&1 | tee /tmp/events-$PANE_ID.jsonl
```

**Vorteile:**
- Strukturierte NDJSON Events (kein Parsing von Raw Terminal Output)
- Kosten direkt im Stream (`total_cost_usd`) - **kein OTEL nötig**
- Alle Event-Typen verfügbar: TEXT, TOOL, HOOK, RESULT

**Details:** Siehe `docs/STRUCTURED-EVENTS-ARCHITECTURE.md`

---

## Teil 1: Ist-Zustand Analyse

### 1.1 ADWO (Was existiert, aber nicht funktioniert)

| Komponente | LOC | Status | Problem |
|------------|-----|--------|---------|
| O-Agent Service | ~3K | Gebaut | Instabil, komplexes Claude CLI Spawning |
| Workflow Engine | ~2K | Gebaut | Zu abstrakt, YAML-basiert |
| Dashboard | ~8K | Gebaut | Schön, zeigt aber nichts Nützliches |
| 6 Stuck Detectors | ~1K | Gebaut | Overengineered, nie getestet |
| Ralph Wiggum | ~500 | Gebaut | Abhängig von nicht-existentem Plugin |
| Checkpointing | ~1K | Gebaut | Komplexes 4-Layer System, nie validiert |
| Event Bridge | - | Nicht gebaut | Fehlt komplett |

**Fazit:** Viel Code, wenig Funktion. Die Vision ist gut, aber die Umsetzung funktioniert nicht.

### 1.2 CLI Orchestrator (Was funktioniert)

| Komponente | Status | Warum es funktioniert |
|------------|--------|----------------------|
| Conduit CLI | ✅ | Echte Terminal-Panes, sichtbar, kontrollierbar |
| SessionStart Hook | ✅ | Deterministisch - Regeln IMMER im Kontext |
| PreCompact Hook | ✅ | State-Persistenz über Compactions hinweg |
| CLAUDE.md | ✅ | Persistente Regeln, überlebt alles |
| Event-driven Waiting | ✅ | `terminal-wait` statt Polling |
| State JSON | ✅ | Einfach, lesbar, robust |

**Fazit:** Wenig Code, viel Funktion. Pragmatisch und funktioniert.

---

## Teil 2: Synthese-Architektur

### 2.1 Neue Architektur Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADWO 2.0                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DASHBOARD (von ADWO)                   │   │
│  │  - Event Stream Panel (Real-Time aus Conduit)             │   │
│  │  - Agent Pane Views (per Agent)                           │   │
│  │  - Cost Tracking (via OTEL Collector)                     │   │
│  │  - Phase Progress                                         │   │
│  │  - Question Handling UI (Modal + Chat)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                     ▲ WebSocket              │ REST              │
│                     │ (Events)               ▼ (Answers)         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EVENT BRIDGE (neu)                        │   │
│  │  - WebSocket Server (von ADWO übernommen)                │   │
│  │  - RingBuffer für Event-Persistenz                       │   │
│  │  - REST API für Antworten                                │   │
│  │  - Conduit Integration:                                   │   │
│  │    - terminal-read Loop (100-200ms)                      │   │
│  │    - terminal-write (Antworten)                          │   │
│  │    - pane-split/close (Orchestrator starten)             │   │
│  │  - OTEL Collector für Cost Tracking                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▲                                   │
│                              │ File Watch + Conduit CLI          │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           CLI ORCHESTRATOR (CityHub Pattern)              │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│  │  │ CLAUDE.md   │  │ SessionStart│  │ PreCompact  │       │   │
│  │  │ (Regeln)    │  │ Hook        │  │ Hook        │       │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │              CONDUIT CLI                         │     │   │
│  │  │  - pane-split (spawn agents)                     │     │   │
│  │  │  - terminal-wait (event-driven)                  │     │   │
│  │  │  - terminal-read (output capture)                │     │   │
│  │  │  - pane-close (cleanup)                          │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │           STATE (orchestrator-state.json)        │     │   │
│  │  │  - phase, story, pane_id, pr_number              │     │   │
│  │  │  - active_panes (Registry für Event Bridge)      │     │   │
│  │  │  - review_cycle, costs, errors                   │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Kommunikationsarchitektur (Option A - ADWO Pattern)

Die bidirektionale Kommunikation folgt dem bewährten ADWO-Pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│                    KOMMUNIKATIONSFLUSS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Dashboard                 Event Bridge              Conduit    │
│       │                         │                        │       │
│       │◄──── WebSocket ─────────┤◄── terminal-read ──────┤       │
│       │      (Real-Time)        │    (100-200ms Loop)    │       │
│       │      Events, Questions  │                        │       │
│       │                         │                        │       │
│       ├──── REST API ──────────►├── terminal-write ─────►│       │
│       │     POST /answer        │    (User Antwort)      │       │
│       │     POST /start         │                        │       │
│       │     POST /message       │                        │       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Warum Hybrid (WebSocket + REST)?**
- WebSocket: Schnell für Events (< 100ms Latenz)
- REST: Idempotent für Antworten (Retry-fähig, zuverlässig)

### 2.3 Question Flow

```
Claude Session              Event Bridge           Dashboard
      │                         │                       │
      │  AskUserQuestion()      │                       │
      │  (blockiert)            │                       │
      │                         │                       │
      │  Output im Terminal     │                       │
      │─────────────────────────►│                       │
      │                         │ terminal-read erkennt │
      │                         │ Question Pattern       │
      │                         │                       │
      │                         │  WS: question event   │
      │                         ├──────────────────────►│
      │                         │                       │ Modal zeigt
      │                         │                       │
      │                         │  POST /api/answer     │
      │                         │◄──────────────────────┤
      │                         │                       │
      │  terminal-write         │                       │
      │◄────────────────────────┤                       │
      │  (Antwort ins Terminal) │                       │
      │                         │                       │
      │  Weiter...              │                       │
```

### 2.4 Start-Mechanismus

```bash
# Event Bridge startet den Orchestrator:
1. Dashboard startet → Event Bridge startet
2. Event Bridge:
   conduit pane-split right -t terminal
   pane_id=$(conduit pane-list | jq -r '.[-1].id')
3. Event Bridge:
   conduit terminal-write -p $pane_id -e "cd /path/to/project && claude"
4. Event Bridge:
   conduit terminal-write -p $pane_id -e "/orchestrator"
5. Event Bridge beginnt terminal-read Loop für dieses Pane
6. Orchestrator registriert sich in orchestrator-state.json
7. Event Bridge liest State, kennt jetzt alle Panes
```

### 2.5 Cost Tracking via OpenTelemetry

```bash
# Claude Code mit Telemetry starten:
export CLAUDE_CODE_ENABLE_TELEMETRY=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
claude
```

**Verfügbare Metriken:**
- `claude_code.cost.usage` - Kosten in USD
- `claude_code.token.usage` - Input/Output/Cache Tokens
- `claude_code.session.count` - Sessions
- `claude_code.active_time.total` - Aktive Zeit

**Event Bridge sammelt diese Metriken und sendet sie ans Dashboard.**

### 2.6 State Schema Erweiterung

Das bestehende `orchestrator-state.json` wird erweitert um `active_panes`:

```json
{
  "version": "2.0.0",
  "phase": "dev",
  "current_story": {
    "id": "1.4",
    "issue_number": 12,
    "title": "User Authentication"
  },
  "current_agent": {
    "pane_id": "def-456",
    "type": "dev",
    "spawned_at": "2026-02-01T02:05:00Z"
  },

  "active_panes": {
    "abc-123": {
      "type": "orchestrator",
      "started_at": "2026-02-01T02:00:00Z"
    },
    "def-456": {
      "type": "dev_agent",
      "story_id": "1.4",
      "story_title": "User Authentication",
      "started_at": "2026-02-01T02:05:00Z"
    },
    "ghi-789": {
      "type": "review_agent",
      "pr_number": 42,
      "review_cycle": 1,
      "started_at": "2026-02-01T02:30:00Z"
    }
  },

  "progress": {
    "stories_completed": 5,
    "current_phase": "development"
  },

  "costs": {
    "session_total": 0.0,
    "tokens_in": 0,
    "tokens_out": 0
  }
}
```

---

## Teil 3: Wiederverwendbare ADWO-Komponenten

### 3.1 Komponenten-Matrix

| Komponente | Pfad | LOC | Status | Aktion |
|------------|------|-----|--------|--------|
| **WebSocket Broadcaster** | `orchestrator/src/websocket/broadcaster.ts` | 261 | ✅ Exzellent | As-is übernehmen |
| **Event Manager** | `orchestrator/src/websocket/eventManager.ts` | 76 | ✅ Exzellent | As-is übernehmen |
| **Ring Buffer** | `orchestrator/src/websocket/ringBuffer.ts` | 26 | ✅ Exzellent | As-is übernehmen |
| **Question Manager** | `orchestrator/src/services/o-agent/QuestionManager.ts` | 280 | ✅ Exzellent | As-is übernehmen |
| **Question Routes** | `orchestrator/src/routes/questions.ts` | ~100 | ✅ Gut | Pattern übernehmen |
| **WebSocket Hook** | `dashboard/src/hooks/use-websocket.ts` | 344 | ✅ Exzellent | As-is übernehmen |
| **useCountdown** | `dashboard/src/hooks/useCountdown.ts` | 88 | ✅ Gut | As-is übernehmen |
| **Question Store** | `dashboard/src/stores/question-store.ts` | 72 | ✅ Gut | As-is übernehmen |
| **Event Store** | `dashboard/src/stores/event-store.ts` | 146 | ✅ Gut | As-is übernehmen |
| **Connection Store** | `dashboard/src/stores/connection-store.ts` | 60 | ✅ Gut | As-is übernehmen |
| **Question Modal** | `dashboard/src/components/question/question-modal.tsx` | 298 | ✅ Gut | UI anpassen |

**Gesamt wiederverwendbar: ~1.751 LOC (85% Reusability Score)**

### 3.2 Was wir NICHT übernehmen

| Komponente | Grund |
|------------|-------|
| O-Agent Service | Ersetzt durch CLI Orchestrator + Conduit |
| Workflow Engine | Zu abstrakt, nicht nötig |
| Stuck Detectors | `terminal-wait` timeout reicht |
| Ralph Wiggum | Native Claude Code Skills |
| Supabase Checkpoints | State JSON + Devlog |
| YAML Parser | Nicht nötig für CLI-Ansatz |

### 3.3 Dependencies die mitkommen

**Backend:**
```json
{
  "ws": "^8.18.3",
  "express": "^4.21.0",
  "zod": "^4.3.4"
}
```

**Frontend:**
```json
{
  "zustand": "^5.0.9",
  "@radix-ui/react-dialog": "...",
  "@radix-ui/react-radio-group": "...",
  "lucide-react": "^0.562.0"
}
```

---

## Teil 4: Migration Plan (Aktualisiert)

### Phase 1: Foundation

**Ziel:** CLI Orchestrator + ADWO Infrastruktur zusammenführen

**Tasks:**
1. Neues Mono-Repo erstellen oder ADWO aufräumen
2. CLI Orchestrator Dateien kopieren
3. State Schema erweitern (active_panes)
4. Orchestrator Skill anpassen (Pane-Registry Management)

### Phase 2: Event Bridge

**Ziel:** Real-Time Event Streaming von Conduit zum Dashboard

**Tasks:**
1. Event Bridge Service erstellen
   - Conduit Integration (terminal-read Loop)
   - File Watch auf orchestrator-state.json
   - Delta-Detection für Terminal-Output
2. WebSocket Server (von ADWO übernehmen)
   - broadcaster.ts
   - eventManager.ts
   - ringBuffer.ts
3. REST API für Antworten
   - POST /api/questions/answer
   - POST /api/orchestrator/start
   - POST /api/orchestrator/message
4. Question Pattern Detection
   - Claude AskUserQuestion Output erkennen
   - Als Event ans Dashboard senden

### Phase 3: Dashboard Anpassung

**Ziel:** Dashboard zeigt Real-Time Events + Question Handling

**Tasks:**
1. WebSocket Hook integrieren (von ADWO)
2. Stores anpassen (question-store, event-store, connection-store)
3. Question Modal integrieren
4. Event Stream Panel anpassen
5. Alte Services entfernen

### Phase 4: Cost Tracking

**Ziel:** Token/Cost Tracking funktioniert

**Tasks:**
1. OTEL Collector aufsetzen
2. Claude Code mit Telemetry starten
3. Metriken an Dashboard weiterleiten
4. Cost Display im Dashboard

### Phase 5: Integration & Testing

**Ziel:** End-to-End Workflow funktioniert

**Tasks:**
1. Start-Mechanismus implementieren
2. Question-Answer-Loop testen
3. Multi-Agent Szenario testen
4. Compaction/Recovery testen
5. 4-Stunden Dauerlauf

---

## Teil 5: Finale Entscheidungen

> **Status:** ALLE ENTSCHEIDUNGEN GETROFFEN (2026-02-01)

### 5.1 Technische Entscheidungen ✅

| Frage | Entscheidung | Begründung |
|-------|--------------|------------|
| **Mono-Repo oder Multi-Repo?** | **Multi-Repo** | Orchestrator unabhängig, ADWO als separate Anwendung |
| **Question Detection** | **OTEL + Terminal Hybrid** | OTEL für WANN, Terminal für WAS |
| **Antwort-Injection** | **terminal-write via pane_id** | State JSON enthält aktive Panes |
| **Crash Recovery** | **SQLite mit WAL-Mode** | Persistenz + schnelle Writes |

### 5.2 Architektur-Entscheidungen ✅

| Frage | Entscheidung | Begründung |
|-------|--------------|------------|
| **Dashboard + Event Bridge** | **Gleicher Process (MVP)** | Einfacher, kein IPC nötig |
| **OTEL Collector** | **In Event Bridge integriert** | Kein externer Container |
| **Persistenz** | **SQLite** (nicht nur JSON) | Queries, History, Recovery |

### 5.3 UX-Entscheidungen ✅

| Frage | Entscheidung | Begründung |
|-------|--------------|------------|
| **Question Queue** | **Modal (wie ADWO)** | Bewährt, wiederverwendbar |
| **Terminal View** | **Nur Logs** | Einfacher, Conduit hat echte Terminals |
| **Start UI** | **Button + CLI** | Dashboard-Button für Convenience |

### 5.4 Scope-Entscheidungen ✅

| Feature | MVP | Post-MVP v1.1 |
|---------|-----|---------------|
| Single-Project Support | ✅ | ✅ |
| Multi-Project Support | ❌ (vorbereitet) | ✅ |
| Question Handling | ✅ | ✅ |
| Cost Tracking | ✅ | ✅ |
| SQLite Persistenz | ✅ | ✅ |
| User Authentication | ❌ | Optional |
| Workflow Templates | ❌ | ✅ |

**Multi-Project Vorbereitung im MVP:**
- `project_id` in State Schema
- SQLite: `project_id` Spalte
- API: `/api/projects/:id/...` Pattern (aber nur ein Project aktiv)

---

## Teil 6: Erfolgs-Kriterien

| Kriterium | Definition |
|-----------|------------|
| **Real-Time Events** | Dashboard zeigt Agent-Output < 500ms nach Entstehung |
| **Robuste Loops** | Orchestrator läuft 4+ Stunden ohne manuellen Eingriff |
| **Context Survival** | Nach Compaction: Agent weiß noch wer er ist und was er tut |
| **Sichtbarkeit** | Alle Agent-Panes in Conduit sichtbar + im Dashboard |
| **Question Handling** | User kann via Dashboard auf Fragen antworten |
| **Cost Tracking** | Token/Kosten werden korrekt angezeigt |
| **Weniger Code** | ADWO 2.0 hat < 10.000 LOC (vs. 24.500 jetzt) |

---

## Teil 7: Nächste Schritte

1. [x] Synthese-Plan erstellen
2. [x] Kommunikationsarchitektur entscheiden (Option A: WebSocket + REST)
3. [x] Cost Tracking Lösung finden (OpenTelemetry)
4. [x] Wiederverwendbare Komponenten identifizieren (~1.751 LOC)
5. [x] Alle Planungspunkte klären (Multi-Repo, SQLite, Hybrid Detection, etc.)
6. [x] Handoff-Prompt für SM erstellen (`docs/HANDOFF-SM.md`)
7. [ ] **SM: Entscheidungen reviewen**
8. [ ] **SM: Epics und Stories erstellen**
9. [ ] Implementierung starten

---

## Referenzen

- **Orchestrator Template Repo:** https://github.com/buri1/orchestrator-template
- **CityHub Repo:** https://github.com/buri1/CityHub
- **ADWO Repo:** /Users/buraksmac/Desktop/code/adwo/overspark
- **Conduit CLI Docs:** (in Conduit --help)
- **Claude Code Telemetry:** https://code.claude.com/docs/en/monitoring-usage.md
