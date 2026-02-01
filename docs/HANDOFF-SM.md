# Handoff Prompt: ADWO 2.0 - Epic & Story Erstellung

> **Für:** SM Agent (Scrum Master)
> **Von:** Analyst Agent
> **Datum:** 2026-02-01
> **Status:** Bereit für Epic/Story-Erstellung

---

## 1. Projekt-Überblick

### Was ist ADWO 2.0?

ADWO (Agentic Development Workflow Orchestrator) 2.0 ist eine Synthese aus zwei existierenden Projekten:

1. **CLI Orchestrator** (~1.000 LOC, funktioniert)
   - Nutzt Conduit CLI für Agent-Spawning in echten Terminal-Panes
   - Hat robuste Hooks (SessionStart, PreCompact)
   - State-Persistenz via JSON
   - Repo: https://github.com/buri1/orchestrator-template

2. **ADWO 1.0** (~24.500 LOC, funktioniert NICHT)
   - Schönes React Dashboard
   - Viele Services die nicht richtig funktionieren
   - Gute UI-Komponenten die wiederverwendbar sind

### Das Ziel

```
CLI Orchestrator (Backend) + ADWO Dashboard (UI) = ADWO 2.0
                            ↑
                    Event Bridge (neu)
```

**Kernidee:** Den funktionierenden CLI Orchestrator als Runtime behalten, das Dashboard für Observability nutzen, und eine Event Bridge als Verbindung bauen.

---

## 2. Architektur-Entscheidungen (FINAL)

Diese Entscheidungen wurden mit dem User getroffen und sind bindend:

### 2.1 Multi-Repo Struktur ✅

**Entscheidung:** Multi-Repo statt Mono-Repo

**Begründung:**
- CLI Orchestrator soll unabhängig bleiben (ist bereits ein Template-Repo)
- ADWO 2.0 ist eine Anwendung die den Orchestrator nutzt
- Ermöglicht: Andere Projekte nutzen denselben Orchestrator

**Struktur:**
```
Repo 1: orchestrator-template (existiert bereits)
  └── CLI Orchestrator, Hooks, CLAUDE.md
  └── URL: https://github.com/buri1/orchestrator-template

Repo 2: adwo-2 (neu zu erstellen)
  ├── packages/
  │   ├── event-bridge/     # Conduit Integration
  │   └── shared/           # Types
  └── apps/
      └── dashboard/        # React Dashboard
```

### 2.2 Kommunikationsarchitektur ✅

**Entscheidung:** WebSocket + REST Hybrid (ADWO Pattern)

```
Dashboard ◄──WebSocket── Event Bridge ◄──terminal-read── Conduit
    │                         │
    └──REST API──────────────►│──terminal-write──────────► Conduit
```

**Begründung:**
- WebSocket: Schnell für Real-Time Events (< 100ms)
- REST: Idempotent für Antworten (Retry-fähig, zuverlässig)
- Bewährtes Pattern aus ADWO 1.0

### 2.3 Question Detection ✅

**Entscheidung:** Hybrid-Ansatz (OTEL + Terminal)

| Datenquelle | Was |
|-------------|-----|
| **OTEL** | WANN eine Frage gestellt wurde (`tool_result` Event) |
| **Terminal** | WAS gefragt wurde (Parsing für Details) |

**Begründung:**
- OTEL allein liefert nicht den Frage-Text
- Terminal allein ist fragil bei Format-Änderungen
- Hybrid kombiniert Vorteile beider

### 2.4 Persistenz ✅

**Entscheidung:** SQLite mit WAL-Mode

**Begründung:**
- Zero externe Dependencies
- WAL-Mode = schnelle Writes + Crash Recovery
- Queries für History, Filtering
- Für Multi-Project später: Separate DBs pro Projekt

**Schema-Konzept:**
```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  project_id TEXT,  -- Vorbereitung für Multi-Project
  pane_id TEXT,
  type TEXT,
  content TEXT,
  timestamp INTEGER,
  synced INTEGER DEFAULT 0
);
```

### 2.5 Dashboard + Event Bridge ✅

**Entscheidung:** Gleicher Process für MVP

**Begründung:**
- Einfacher zu deployen (ein `npm start`)
- Kein IPC nötig
- Next.js API Routes rufen Event Bridge direkt auf
- Für Multi-Project später: Dann separieren

**Architektur:**
```
apps/dashboard/
├── src/
│   ├── app/              # Next.js Pages
│   ├── api/              # Next.js API Routes
│   └── lib/
│       └── event-bridge/ # Event Bridge als Library
```

### 2.6 OTEL Collector ✅

**Entscheidung:** In Event Bridge integriert

**Begründung:**
- Kein externer Container nötig
- Event Bridge ist der OTEL Receiver (Port 4317)
- Direkte Integration mit Dashboard

### 2.7 Datenquellen ✅

**Entscheidung:** Hybrid

| Daten | Quelle |
|-------|--------|
| Cost/Tokens | OTEL (strukturiert) |
| Tool Calls | OTEL (strukturiert) |
| Agent Output | Terminal (real-time) |
| Question Details | Terminal (parsing) |

### 2.8 Scope ✅

**MVP:**
- Single Project
- Question Handling
- Cost Tracking
- Event Streaming
- SQLite Persistenz

**Post-MVP (v1.1):**
- Multi-Project Support
- Workflow Templates
- Optional: Auth

**Multi-Project Vorbereitung im MVP:**
- `project_id` in State Schema
- SQLite: `project_id` Spalte
- API: `/api/projects/:id/...` Pattern (aber nur ein Project aktiv)

---

## 3. Wiederverwendbare Komponenten

Diese Komponenten aus ADWO 1.0 können as-is oder mit minimalen Änderungen übernommen werden:

### 3.1 Backend (von ADWO Orchestrator)

| Komponente | Pfad | LOC | Aktion |
|------------|------|-----|--------|
| WebSocket Broadcaster | `orchestrator/src/websocket/broadcaster.ts` | 261 | As-is |
| Event Manager | `orchestrator/src/websocket/eventManager.ts` | 76 | As-is |
| Ring Buffer | `orchestrator/src/websocket/ringBuffer.ts` | 26 | As-is |
| Question Manager | `orchestrator/src/services/o-agent/QuestionManager.ts` | 280 | As-is |
| Question Routes | `orchestrator/src/routes/questions.ts` | ~100 | Pattern übernehmen |

### 3.2 Frontend (von ADWO Dashboard)

| Komponente | Pfad | LOC | Aktion |
|------------|------|-----|--------|
| WebSocket Hook | `dashboard/src/hooks/use-websocket.ts` | 344 | As-is |
| useCountdown | `dashboard/src/hooks/useCountdown.ts` | 88 | As-is |
| Question Store | `dashboard/src/stores/question-store.ts` | 72 | As-is |
| Event Store | `dashboard/src/stores/event-store.ts` | 146 | As-is |
| Connection Store | `dashboard/src/stores/connection-store.ts` | 60 | As-is |
| Question Modal | `dashboard/src/components/question/question-modal.tsx` | 298 | UI anpassen |

**Gesamt wiederverwendbar: ~1.751 LOC (85% Reusability)**

### 3.3 Was NICHT übernommen wird

| Komponente | Grund |
|------------|-------|
| O-Agent Service | Ersetzt durch CLI Orchestrator + Conduit |
| Workflow Engine | Zu abstrakt, nicht nötig |
| Stuck Detectors | `terminal-wait` timeout reicht |
| Ralph Wiggum | Native Claude Code Skills |
| Supabase Checkpoints | SQLite stattdessen |

---

## 4. Technische Details

### 4.1 CLI Orchestrator (unverändert beibehalten)

Der CLI Orchestrator bleibt wie er ist. Er nutzt:

- **Conduit CLI** für Agent-Spawning:
  ```bash
  conduit pane-split right -t terminal
  conduit terminal-write -p $pane_id -e "claude"
  conduit terminal-wait -p $pane_id -t 1800
  conduit terminal-read -p $pane_id
  ```

- **State JSON** (`orchestrator-state.json`):
  ```json
  {
    "phase": "dev",
    "current_story": { "id": "1.4", "title": "..." },
    "active_panes": {
      "abc-123": { "type": "orchestrator", "started_at": "..." },
      "def-456": { "type": "dev_agent", "story_id": "1.4", "..." }
    }
  }
  ```

- **Hooks:**
  - SessionStart: Injiziert Regeln nach Compaction
  - PreCompact: Speichert State

### 4.2 Event Bridge (neu zu bauen)

Die Event Bridge verbindet CLI Orchestrator mit Dashboard:

**Funktionen:**
1. **Conduit Integration**
   - `terminal-read` Loop (100-200ms) für alle aktiven Panes
   - `terminal-write` für User-Antworten
   - `pane-split` zum Starten des Orchestrators

2. **File Watch**
   - Beobachtet `orchestrator-state.json`
   - Erfährt welche Panes aktiv sind + Metadaten

3. **Delta Detection**
   - Nur neuen Terminal-Output senden
   - Verhindert Duplikate

4. **WebSocket Server**
   - Broadcast Events an Dashboard
   - RingBuffer für Reconnect-Recovery

5. **REST API**
   - `POST /api/questions/answer`
   - `POST /api/orchestrator/start`
   - `POST /api/orchestrator/message`

6. **OTEL Receiver**
   - Port 4317 für Claude Code Metriken
   - Cost/Token Tracking

7. **SQLite Persistenz**
   - Event History
   - Crash Recovery

### 4.3 Dashboard (angepasst)

Das Dashboard aus ADWO 1.0 wird angepasst:

**Behalten:**
- React + Next.js + Tailwind
- shadcn/ui Komponenten
- Event Stream Panel
- Question Modal
- Cost Display

**Ändern:**
- WebSocket Endpoint → Event Bridge
- API Endpoints → Event Bridge REST API
- Alte O-Agent Integration → Entfernen

### 4.4 Start-Flow

```
1. User: `npm start` (startet Dashboard + Event Bridge)
2. Dashboard zeigt "Start Orchestrator" Button
3. User klickt → POST /api/orchestrator/start
4. Event Bridge:
   - conduit pane-split right -t terminal
   - conduit terminal-write "cd /project && claude"
   - conduit terminal-write "/orchestrator"
5. Event Bridge startet terminal-read Loop
6. Dashboard zeigt Real-Time Events
```

### 4.5 Question-Answer Flow

```
1. Claude ruft AskUserQuestion Tool auf
2. Terminal zeigt Frage
3. Event Bridge:
   - terminal-read erkennt Question Pattern
   - Broadcast via WebSocket
4. Dashboard:
   - Question Store empfängt Frage
   - Modal zeigt Optionen
5. User antwortet
6. Dashboard: POST /api/questions/answer
7. Event Bridge: conduit terminal-write (Antwort ins richtige Pane)
8. Claude fährt fort
```

---

## 5. Erfolgs-Kriterien

| Kriterium | Definition | Messbar |
|-----------|------------|---------|
| **Real-Time Events** | Dashboard zeigt Output < 500ms nach Entstehung | Timestamp-Diff |
| **Robuste Loops** | Orchestrator läuft 4+ Stunden ohne Eingriff | Dauerlauf-Test |
| **Context Survival** | Agent weiß nach Compaction noch wer er ist | Manueller Test |
| **Question Handling** | User kann via Dashboard antworten | E2E Test |
| **Cost Tracking** | Token/Kosten korrekt angezeigt | Vergleich mit /cost |
| **Crash Recovery** | Event Bridge Restart verliert keine Events | Crash-Test |
| **Code Reduktion** | < 10.000 LOC (vs. 24.500 in ADWO 1.0) | LOC Count |

---

## 6. Phasen-Übersicht (aus Synthese-Plan)

### Phase 1: Foundation
- Neues Repo erstellen (adwo-2)
- Projekt-Struktur aufsetzen
- CLI Orchestrator als Dependency/Submodule
- State Schema erweitern

### Phase 2: Event Bridge
- Conduit Integration (terminal-read/write)
- File Watch auf State JSON
- Delta Detection
- WebSocket Server (von ADWO übernehmen)
- REST API für Antworten
- Question Pattern Detection

### Phase 3: Dashboard Anpassung
- WebSocket Hook integrieren
- Stores anpassen
- Question Modal integrieren
- Event Stream Panel anpassen
- Alte Services entfernen

### Phase 4: Cost Tracking
- OTEL Receiver in Event Bridge
- Metriken an Dashboard weiterleiten
- Cost Display anpassen

### Phase 5: Integration & Testing
- E2E Start-Mechanismus
- Question-Answer Loop
- Multi-Agent Szenario
- Crash Recovery
- 4-Stunden Dauerlauf

---

## 7. Relevante Dateien

| Datei | Beschreibung |
|-------|--------------|
| `/Users/buraksmac/Desktop/code2/orchestrator/docs/ADWO-SYNTHESIS-PLAN.md` | Vollständiger Synthese-Plan |
| `/Users/buraksmac/Desktop/code2/orchestrator/CLAUDE.md` | Orchestrator Regeln |
| `/Users/buraksmac/Desktop/code2/orchestrator/.claude/commands/orchestrator.md` | Orchestrator Skill |
| `/Users/buraksmac/Desktop/code/adwo/overspark/` | ADWO 1.0 Codebase |
| `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/` | Dashboard Code |
| `/Users/buraksmac/Desktop/code/adwo/overspark/apps/orchestrator/src/websocket/` | Wiederverwendbare WebSocket-Komponenten |

---

## 8. Aufgabe für den SM

### 8.1 Review der Entscheidungen

Bitte überprüfe die Architektur-Entscheidungen in Abschnitt 2:

1. **Multi-Repo:** Macht die Trennung Sinn? Gibt es Dependency-Probleme?
2. **Gleicher Process für Dashboard + Event Bridge:** Ist das für MVP vertretbar?
3. **SQLite Persistenz:** Reicht das für die Anforderungen?
4. **Hybrid Question Detection:** Ist OTEL + Terminal zu komplex?
5. **Scope:** Ist das MVP realistisch? Fehlt etwas Kritisches?

Falls du Bedenken hast oder etwas unklar ist, bitte mit dem User klären bevor du fortfährst.

### 8.2 Epic & Story Erstellung

Nach dem Review, erstelle Epics und Stories für ADWO 2.0:

**Erwartete Epics (Vorschlag):**

1. **Epic 1: Projekt-Setup**
   - Repo erstellen, Struktur, Dependencies

2. **Epic 2: Event Bridge Core**
   - Conduit Integration, File Watch, Delta Detection

3. **Epic 3: WebSocket & Kommunikation**
   - WebSocket Server, RingBuffer, REST API

4. **Epic 4: Question Handling**
   - Question Detection, Modal, Answer Flow

5. **Epic 5: Dashboard Integration**
   - UI Anpassung, Stores, Event Stream

6. **Epic 6: Cost Tracking**
   - OTEL Integration, Cost Display

7. **Epic 7: Persistenz & Recovery**
   - SQLite, Crash Recovery

8. **Epic 8: Integration & Testing**
   - E2E Tests, Dauerlauf

**Hinweis:** Die Phasen im Synthese-Plan sind technisch gruppiert. Die Epics sollten nach User-Value gruppiert sein (vertikale Slices wo möglich).

### 8.3 Output

Erstelle:
1. Epic-Dateien im BMAD-Format
2. Stories mit Akzeptanzkriterien
3. Story Map oder Dependency Graph
4. MVP-Scope Definition

---

## 9. Offene Fragen (optional zu klären)

Falls der SM diese klären möchte:

1. **Wie genau sieht das Question Pattern im Terminal aus?**
   - Muss für Detection-Regex analysiert werden

2. **Wie wird der Orchestrator-Prozess beendet?**
   - Via Dashboard Button? Automatisch? SIGTERM?

3. **Was passiert bei mehreren gleichzeitigen Questions?**
   - Queue wie in ADWO 1.0? Priority?

4. **Wie wird das Projekt initial konfiguriert?**
   - Config File? Environment Variables? UI?

---

## 10. Kontext für Codebase-Zugriff

Der SM hat Zugriff auf:

```
CLI Orchestrator:
/Users/buraksmac/Desktop/code2/orchestrator/

ADWO 1.0:
/Users/buraksmac/Desktop/code/adwo/overspark/
```

Bei Bedarf können spezifische Dateien gelesen werden um die Stories zu detaillieren.

---

**Ende des Handoff-Prompts**
