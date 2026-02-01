# Handoff Prompt: ADWO Synthesis

> Dieser Prompt dient dazu, einen neuen Claude Agent in die aktuelle Arbeit einzuführen.

---

## Kontext

Wir arbeiten an der **Synthese von zwei Orchestrator-Projekten**:

1. **CLI Orchestrator** (funktioniert, ~1.000 LOC)
   - Repo: https://github.com/buri1/orchestrator-template
   - Lokal: `/Users/buraksmac/Desktop/code2/orchestrator`
   - Nutzt Conduit CLI für Agent-Spawning
   - Hat robuste Hooks (SessionStart, PreCompact)
   - Liefert echten Value

2. **ADWO** (Vision, aber funktioniert nicht, ~24.500 LOC)
   - Lokal: `/Users/buraksmac/Desktop/code/adwo/overspark`
   - Hat schönes Dashboard (React + Next.js)
   - Hat viele Services die nicht richtig funktionieren
   - Vision ist gut, Umsetzung problematisch

**Ziel:** Den funktionierenden CLI Orchestrator als Basis für ADWO nehmen. Das Dashboard für Observability behalten, aber das Backend durch den CLI Orchestrator ersetzen.

---

## Was bereits erledigt wurde

### 1. CLI Orchestrator Template erstellt
- CLAUDE.md mit 4 absoluten Regeln
- SessionStart Hook (injiziert Regeln nach Compaction)
- PreCompact Hook (speichert State)
- Orchestrator Skill (.claude/commands/orchestrator.md)
- GitHub Repo: https://github.com/buri1/orchestrator-template

### 2. CityHub Orchestrator aktualisiert
- Gleiche Hooks wie Template
- Gepusht nach GitHub

### 3. ADWO Analyse abgeschlossen
- Architektur verstanden
- Implementierung analysiert
- Schwachstellen identifiziert

### 4. Synthese-Plan erstellt
- Dokument: `/Users/buraksmac/Desktop/code2/orchestrator/docs/ADWO-SYNTHESIS-PLAN.md`
- Beschreibt die neue Architektur
- Definiert Migration in 4 Phasen

---

## Die neue Architektur (Kurzfassung)

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADWO 2.0                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   DASHBOARD (von ADWO behalten)                                 │
│   - Event Stream, Agent Views, Cost Tracking                    │
│                     ▲                                            │
│                     │ WebSocket                                  │
│                                                                  │
│   EVENT BRIDGE (neu zu bauen)                                   │
│   - Liest State JSON für Pane-Registry                          │
│   - Kontinuierliches terminal-read (100-200ms)                  │
│   - Delta-Detection, WebSocket Broadcast                        │
│                     ▲                                            │
│                     │ File Watch + Conduit CLI                   │
│                                                                  │
│   CLI ORCHESTRATOR (CityHub Pattern)                            │
│   - CLAUDE.md, SessionStart/PreCompact Hooks                    │
│   - Conduit CLI (pane-split, terminal-wait, etc.)               │
│   - State JSON mit active_panes Registry                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Kernkonzept: Event Bridge

Die Event Bridge ist das fehlende Stück. Sie verbindet den CLI Orchestrator mit dem Dashboard:

1. **File Watch** auf `orchestrator-state.json`
   - Erfährt welche Panes aktiv sind
   - Hat Metadaten (Agent-Typ, Story, etc.)

2. **Kontinuierliches Terminal-Lesen** (Real-Time)
   - `conduit terminal-read -p <pane-id>` alle 100-200ms
   - Delta-Detection (nur neuen Output senden)
   - Nicht `terminal-wait` - das blockiert und gibt kein Real-Time

3. **WebSocket Broadcast**
   - Strukturierte Events mit Metadaten
   - Dashboard abonniert und zeigt an

---

## State Schema Erweiterung

Das `orchestrator-state.json` braucht ein neues Feld `active_panes`:

```json
{
  "active_panes": {
    "abc-123": {
      "type": "orchestrator",
      "started_at": "2026-02-01T02:00:00Z"
    },
    "def-456": {
      "type": "dev_agent",
      "story_id": "1.4",
      "started_at": "2026-02-01T02:05:00Z"
    }
  }
}
```

Der Orchestrator muss dieses Feld updaten wenn er Panes spawnt/schließt.

---

## Offene Fragen (zu klären)

1. **Question Handling:** Wie antwortet der User auf CLI's AskUserQuestion via Dashboard?
2. **Start Mechanismus:** Wie startet das Dashboard den Orchestrator?
3. **Cost Tracking:** Woher Token-Zahlen bekommen?

---

## Nächste Schritte

1. **Synthese-Plan reviewen** (`docs/ADWO-SYNTHESIS-PLAN.md`)
2. **Entscheiden:** Fangen wir mit Event Bridge oder CLI Integration an?
3. **Implementieren:** Phase für Phase gemäß Plan

---

## Wichtige Dateien

| Datei | Zweck |
|-------|-------|
| `/Users/buraksmac/Desktop/code2/orchestrator/docs/ADWO-SYNTHESIS-PLAN.md` | Vollständiger Plan |
| `/Users/buraksmac/Desktop/code2/orchestrator/CLAUDE.md` | Absolute Regeln |
| `/Users/buraksmac/Desktop/code2/orchestrator/.claude/commands/orchestrator.md` | Orchestrator Skill |
| `/Users/buraksmac/Desktop/code/adwo/overspark/` | ADWO Projekt |
| `/Users/buraksmac/Desktop/code/adwo/overspark/apps/dashboard/` | Dashboard Code |
| `/Users/buraksmac/Desktop/code/adwo/overspark/apps/orchestrator/` | Alter Backend Code |

---

## Anweisung an neuen Agent

1. Lies zuerst `docs/ADWO-SYNTHESIS-PLAN.md` vollständig
2. Verstehe die Architektur und den Plan
3. Frage den User, womit er weitermachen möchte:
   - Plan weiter verfeinern?
   - Mit Implementierung beginnen (welche Phase)?
   - Offene Fragen klären?

**Wichtig:** Wir sind in der PLANUNGSPHASE. Nicht direkt implementieren ohne Rücksprache!
