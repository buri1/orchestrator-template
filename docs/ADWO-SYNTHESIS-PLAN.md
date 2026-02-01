# ADWO Synthesis Plan: CLI Orchestrator als Basis

> **Status:** Planungsphase
> **Erstellt:** 2026-02-01
> **Autor:** Burak + Claude Opus 4.5

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
- Event Bridge = Verbindung zwischen beiden

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
│  │  - Cost Tracking                                          │   │
│  │  - Phase Progress                                         │   │
│  │  - Question Handling UI                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ▲                                   │
│                              │ WebSocket                         │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EVENT BRIDGE (neu)                        │   │
│  │  - Watched orchestrator-state.json für Pane-Registry     │   │
│  │  - Kontinuierliches terminal-read (100-200ms)            │   │
│  │  - Delta-Detection                                        │   │
│  │  - WebSocket Broadcast mit Metadaten                      │   │
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

### 2.2 Event Bridge Detail

Die Event Bridge ist das Herzstück der Integration. Sie verbindet den CLI Orchestrator mit dem Dashboard.

**Datenfluss:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         CONDUIT                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│   │ Orchestrator│    │  Dev Agent  │    │Review Agent │         │
│   │    Pane     │    │    Pane     │    │    Pane     │         │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│          │                  │                  │                 │
│          └──────────────────┼──────────────────┘                 │
│                    Terminal Outputs                              │
└─────────────────────────────┼────────────────────────────────────┘
                              │
            conduit terminal-read (alle 100-200ms)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT BRIDGE                                │
│                                                                  │
│   1. File Watch auf orchestrator-state.json                     │
│      → Erfährt welche Panes aktiv sind + Metadaten              │
│                                                                  │
│   2. Für jedes aktive Pane: Async Read Loop                     │
│      → conduit terminal-read -p <pane-id>                       │
│      → Delta-Detection (nur neuer Output)                       │
│      → Alle 100-200ms für Real-Time Feeling                     │
│                                                                  │
│   3. Event Parsing                                               │
│      → Klassifiziert Output (thinking, tool_call, output, etc.) │
│      → Reichert mit Metadaten an (agent_type, story, etc.)      │
│                                                                  │
│   4. WebSocket Broadcast                                         │
│      → Strukturierte Events an alle verbundenen Clients         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 State Schema Erweiterung

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

## Teil 3: Migration Plan

### Phase 1: Foundation (1-2 Tage)

**Ziel:** CLI Orchestrator in ADWO Repo integrieren

**Tasks:**
1. CLI Orchestrator Dateien in ADWO kopieren
   ```
   adwo/
   └── orchestrator-cli/           # NEU
       ├── CLAUDE.md
       ├── .claude/
       │   ├── commands/orchestrator.md
       │   └── settings.local.json
       ├── .bmad/
       │   └── scripts/
       │       ├── orchestrator-session-start.sh
       │       └── orchestrator-handoff.sh
       └── _bmad/
           └── orchestrator-state.template.json
   ```

2. State Schema erweitern (active_panes)

3. Orchestrator Skill anpassen:
   - Bei Pane-Spawn: `active_panes` updaten
   - Bei Pane-Close: `active_panes` bereinigen

### Phase 2: Event Bridge (2-3 Tage)

**Ziel:** Real-Time Event Streaming von Conduit zum Dashboard

**Tasks:**
1. Event Bridge Service erstellen (Node.js/TypeScript)
   ```typescript
   // packages/event-bridge/src/index.ts
   - ConduitEventBridge Klasse
   - PaneStream Klasse (kontinuierliches Lesen)
   - WebSocket Server
   - Delta-Detection
   - Event Parsing
   ```

2. Event Types definieren
   ```typescript
   interface PaneEvent {
     paneId: string;
     agentType: 'orchestrator' | 'dev_agent' | 'review_agent';
     storyId?: string;
     timestamp: Date;
     type: 'thinking' | 'tool_call' | 'output' | 'complete' | 'error';
     content: string;
   }
   ```

3. Integration Tests

### Phase 3: Dashboard Anpassung (2-3 Tage)

**Ziel:** Dashboard zeigt Real-Time Events aus CLI Orchestrator

**Tasks:**
1. Event Stream Panel anpassen
   - WebSocket Verbindung zu Event Bridge
   - Filtering nach Agent/Pane
   - Auto-Scroll

2. Agent Pane Views
   - Ein Panel pro aktivem Agent
   - Zeigt Terminal-Output in Echtzeit
   - Status-Indikator

3. Alte Services entfernen
   - O-Agent Service → Nicht mehr nötig
   - Stuck Detection → terminal-wait timeout reicht
   - Ralph Wiggum → Native Claude Code Loops

### Phase 4: Integration (2-3 Tage)

**Ziel:** End-to-End Workflow funktioniert

**Tasks:**
1. Workflow Start via Dashboard
   - API Endpoint zum Starten des CLI Orchestrators
   - Oder: Manuelle Start-Anweisung

2. Question Handling
   - CLI's AskUserQuestion → Event an Dashboard
   - Dashboard zeigt Modal
   - User antwortet → Antwort zurück an CLI (via Conduit?)

3. Cost Tracking Integration
   - Aus Claude Output parsen
   - In State JSON speichern
   - Dashboard zeigt an

---

## Teil 4: Was wir behalten/ersetzen

### 4.1 Von ADWO behalten

| Komponente | Warum behalten |
|------------|----------------|
| Dashboard Layout | Schöne 3-Panel UI, React + shadcn |
| Event Stream UI | Gute Komponenten, nur Datenquelle ändern |
| Cost Tracking UI | Visualisierung ist fertig |
| WebSocket Infra | Funktioniert, nur andere Events |
| ADW YAML Parser | Könnte später nützlich sein |
| Shared Types | TypeScript Types sind nützlich |

### 4.2 Ersetzen/Entfernen

| Alt (ADWO) | Neu (CLI Pattern) |
|------------|-------------------|
| O-Agent Service | CLI Orchestrator via Conduit |
| child_process.spawn('claude') | conduit pane-split + terminal-write |
| Ralph Wiggum Plugin | Native Claude Code Skills |
| 6 Stuck Detectors | terminal-wait timeout |
| Supabase Checkpoints | State JSON + Devlog |
| Complex Question Routing | AskUserQuestion oder AUTO_MODE |

---

## Teil 5: Offene Fragen

1. **Question Handling:** Wie bekommt der CLI Orchestrator Antworten vom Dashboard?
   - Option A: Dashboard schreibt in Datei, CLI liest
   - Option B: Dashboard sendet via Conduit terminal-write
   - Option C: Separater API Endpoint

2. **Start Mechanismus:** Wie startet das Dashboard den Orchestrator?
   - Option A: User startet manuell in Conduit
   - Option B: Dashboard spawnt Conduit Pane (wenn möglich)
   - Option C: CLI läuft immer, Dashboard verbindet sich

3. **Cost Tracking:** Woher bekommen wir Token-Zahlen?
   - Option A: Claude Output parsen
   - Option B: Claude API direkt (wenn verfügbar)
   - Option C: Schätzung basierend auf Output-Länge

4. **Multi-Project Support:** Ein Dashboard für mehrere Projekte?
   - Später - erstmal Single-Project fokussieren

---

## Teil 6: Erfolgs-Kriterien

| Kriterium | Definition |
|-----------|------------|
| **Real-Time Events** | Dashboard zeigt Agent-Output < 500ms nach Entstehung |
| **Robuste Loops** | Orchestrator läuft 4+ Stunden ohne manuellen Eingriff |
| **Context Survival** | Nach Compaction: Agent weiß noch wer er ist und was er tut |
| **Sichtbarkeit** | Alle Agent-Panes in Conduit sichtbar + im Dashboard |
| **Weniger Code** | ADWO 2.0 hat < 10.000 LOC (vs. 24.500 jetzt) |

---

## Nächste Schritte

1. [ ] Diesen Plan reviewen und finalisieren
2. [ ] ADWO Repo aufräumen (alte Services entfernen)
3. [ ] CLI Orchestrator in ADWO integrieren
4. [ ] Event Bridge implementieren
5. [ ] Dashboard anpassen
6. [ ] End-to-End testen

---

## Referenzen

- **Orchestrator Template Repo:** https://github.com/buri1/orchestrator-template
- **CityHub Repo:** https://github.com/buri1/CityHub
- **ADWO Repo:** /Users/buraksmac/Desktop/code/adwo/overspark
- **Conduit CLI Docs:** (in Conduit --help)
