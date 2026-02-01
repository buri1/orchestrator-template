# Structured Events Architecture

> **Status:** FINAL - Verifiziert durch Tests
> **Erstellt:** 2026-02-01
> **Aktualisiert:** 2026-02-01
> **Ersetzt:** Terminal-Read Ansatz aus ADWO-SYNTHESIS-PLAN.md

---

## 1. Problem Statement

Die ursprüngliche Architektur (ADWO-SYNTHESIS-PLAN.md) basierte auf:

```
Event Bridge ←── terminal-read (100-200ms) ←── Conduit Pane ←── Claude CLI
```

**Das Problem:**
- `terminal-read` erfasst **rohen Terminal-Output** (ANSI-Codes, formatierter Text)
- Parsing ist fragil und fehleranfällig
- Keine strukturierten Event-Types
- Keine reliable Question Detection
- OTEL nötig für Cost Tracking

**Die Lösung:**
- Claude Code bietet `--output-format stream-json` für strukturierte NDJSON Events
- Diese enthalten **alle** relevanten Informationen inkl. Kosten
- Kein OTEL, kein Parsing, kein Polling nötig

---

## 2. Claude Code Structured Output (Verifiziert)

### 2.1 Befehl

```bash
claude -p "task" \
  --output-format stream-json \
  --verbose \
  --include-partial-messages
```

### 2.2 Event-Typen (durch Tests verifiziert)

| Top-Level Type | Subtype/Event | Beschreibung | Key Fields |
|----------------|---------------|--------------|------------|
| `system` | `init` | Session-Start | `session_id`, `cwd`, `model`, `tools[]`, `mcp_servers[]`, `permissionMode` |
| `system` | `hook_started` | Hook wird ausgeführt | `hook_name`, `hook_event` |
| `system` | `hook_response` | Hook-Ergebnis | `output`, `exit_code`, `outcome` |
| `stream_event` | `message_start` | Nachricht beginnt | `message.model`, `message.usage` |
| `stream_event` | `content_block_start` | Content-Block | `content_block.type` ("text" oder "tool_use"), `content_block.name` |
| `stream_event` | `content_block_delta` | Streaming | `delta.type` ("text_delta" oder "input_json_delta"), `delta.text` |
| `stream_event` | `content_block_stop` | Block fertig | `index` |
| `stream_event` | `message_delta` | Usage Update | `usage.input_tokens`, `usage.output_tokens` |
| `stream_event` | `message_stop` | Nachricht fertig | - |
| `assistant` | - | Komplette Nachricht | `message.content[]`, `message.model` |
| `user` | - | User-Nachricht | `message.content` |
| `result` | `success` | Finale Ergebnis | `total_cost_usd`, `usage`, `duration_ms`, `num_turns`, `modelUsage` |

### 2.3 Beispiel-Output (echte Daten)

**Session Init:**
```json
{
  "type": "system",
  "subtype": "init",
  "cwd": "/Users/buraksmac/Desktop/code2/orchestrator",
  "session_id": "96178181-fa69-48c3-813d-6d6ddd6e2781",
  "tools": ["Task", "Bash", "Read", "Edit", "Write", ...],
  "model": "claude-opus-4-5-20251101",
  "permissionMode": "default"
}
```

**Tool-Aufruf:**
```json
{
  "type": "stream_event",
  "event": {
    "type": "content_block_start",
    "content_block": {
      "type": "tool_use",
      "id": "toolu_0179RVu4tMhSZ4iBj5MuuFrX",
      "name": "Read",
      "input": {}
    }
  },
  "session_id": "ac8afb61-0a2e-49c6-80bd-73d5dc28433b"
}
```

**Text Streaming:**
```json
{
  "type": "stream_event",
  "event": {
    "type": "content_block_delta",
    "delta": {"type": "text_delta", "text": "Hello! I'm Claude"}
  },
  "session_id": "96178181-fa69-48c3-813d-6d6ddd6e2781"
}
```

**Finale Result (MIT KOSTEN!):**
```json
{
  "type": "result",
  "subtype": "success",
  "duration_ms": 2568,
  "num_turns": 1,
  "total_cost_usd": 0.14999825,
  "usage": {
    "input_tokens": 3,
    "cache_creation_input_tokens": 23781,
    "output_tokens": 27
  },
  "modelUsage": {
    "claude-opus-4-5-20251101": {
      "inputTokens": 3,
      "outputTokens": 27,
      "costUSD": 0.14932125
    }
  }
}
```

### 2.4 jq Filtering für Dashboard

```bash
# Text-Deltas extrahieren (streaming output)
jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'

# Tool-Aufrufe extrahieren
jq 'select(.type == "stream_event" and .event.content_block.type? == "tool_use")'

# Kosten extrahieren
jq 'select(.type == "result") | {cost: .total_cost_usd, tokens: .usage}'

# Alle Event-Typen zählen
jq -c '.type' | sort | uniq -c
```

---

## 3. Gewählte Architektur: File-basiert mit tee

### Warum File-basiert?

Nach Analyse der Optionen ist **File-basiert mit `tee`** die beste Wahl:

1. **Einfachste Implementation** - Keine Hooks, keine Pipes, keine Subprocess-Verwaltung
2. **Terminal bleibt sichtbar** - `tee` schreibt sowohl ins Terminal als auch in die Datei
3. **Events persistiert** - JSONL-Dateien können bei Crash wiederhergestellt werden
4. **Bewährtes Pattern** - File-Watching ist gut verstanden und robust

### Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADWO 2.0 ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CONDUIT PANES                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  Orchestrator Pane (abc-123)          Agent Pane (def-456)         │ │
│  │  ┌─────────────────────────┐          ┌─────────────────────────┐  │ │
│  │  │ claude -p "$TASK" \     │          │ claude -p "$TASK" \     │  │ │
│  │  │   --output-format       │          │   --output-format       │  │ │
│  │  │   stream-json \         │          │   stream-json \         │  │ │
│  │  │   --verbose \           │          │   --verbose \           │  │ │
│  │  │   --include-partial \   │          │   --include-partial \   │  │ │
│  │  │   2>&1 | tee            │          │   2>&1 | tee            │  │ │
│  │  │   /tmp/abc-123.jsonl    │          │   /tmp/def-456.jsonl    │  │ │
│  │  └─────────────────────────┘          └─────────────────────────┘  │ │
│  │              │                                    │                 │ │
│  └──────────────┼────────────────────────────────────┼─────────────────┘ │
│                 │                                    │                   │
│                 ▼                                    ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                         EVENT BRIDGE                                 ││
│  │                                                                      ││
│  │  ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐ ││
│  │  │   File Watcher   │    │   NDJSON Parser  │    │  Pane Registry │ ││
│  │  │                  │───►│                  │◄───│                │ ││
│  │  │ fs.watch(/tmp/)  │    │ Zeile → Event    │    │ pane_id →      │ ││
│  │  │ *.jsonl          │    │ + Pane Metadaten │    │ agent_type,    │ ││
│  │  └──────────────────┘    └──────────────────┘    │ story_id, etc  │ ││
│  │                                   │              └────────────────┘ ││
│  │                                   ▼                                  ││
│  │  ┌──────────────────┐    ┌──────────────────┐                       ││
│  │  │     SQLite       │◄───│    Broadcaster   │                       ││
│  │  │                  │    │                  │───► WebSocket          ││
│  │  │ events.db        │    │ RingBuffer +     │    (Port 3001)        ││
│  │  │ (WAL mode)       │    │ WS Broadcast     │                       ││
│  │  └──────────────────┘    └──────────────────┘                       ││
│  │                                                                      ││
│  └──────────────────────────────────────────────────────────────────────┘│
│                                      │                                   │
│                                      ▼ WebSocket                         │
│  ┌──────────────────────────────────────────────────────────────────────┐│
│  │                           DASHBOARD                                   ││
│  │                                                                       ││
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       ││
│  │  │   Event Stream  │  │   Agent Cards   │  │   Cost Display  │       ││
│  │  │                 │  │                 │  │                 │       ││
│  │  │ Filter by:      │  │ Per Agent:      │  │ total_cost_usd  │       ││
│  │  │ - TOOL          │  │ - session_id    │  │ from result     │       ││
│  │  │ - TEXT          │  │ - model         │  │ events          │       ││
│  │  │ - HOOK          │  │ - tools used    │  │                 │       ││
│  │  │ - RESULT        │  │ - token usage   │  │                 │       ││
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       ││
│  │                                                                       ││
│  └───────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Verworfene Optionen

| Option | Grund für Ablehnung |
|--------|---------------------|
| Named Pipes (FIFO) | Komplexere Koordination, Reader muss vor Writer existieren |
| Hooks + HTTP | Unnötig - stream-json liefert bereits alles |
| Subprocess | Verliert Conduit-Pane-Sichtbarkeit |
| OTEL | Nicht nötig - `total_cost_usd` kommt im Stream |

---

## 4. Pane-zu-Session Zuordnung

### Problem

Wie weiß die Event Bridge, welches Event zu welchem Agent gehört?

### Lösung: session_id im Stream

Jedes Event im stream-json enthält bereits die `session_id`:

```json
{
  "type": "stream_event",
  "session_id": "96178181-fa69-48c3-813d-6d6ddd6e2781",
  ...
}
```

Die Zuordnung Pane → Session erfolgt durch:

1. **Dateiname**: `/tmp/events-{pane_id}.jsonl`
2. **Erstes Event**: `type: "system", subtype: "init"` enthält `session_id`

```bash
# Orchestrator spawnt Agent
pane_id=$(conduit pane-list | jq -r '.[-1].id')

# Claude mit Output in pane-spezifische Datei
conduit terminal-write -p $pane_id -e \
  "claude -p '\$TASK' --output-format stream-json --verbose --include-partial-messages 2>&1 | tee /tmp/events-$pane_id.jsonl"
```

### Pane Registry (orchestrator-state.json)

```json
{
  "active_panes": {
    "abc-123": {
      "type": "orchestrator",
      "session_id": "96178181-fa69-48c3-813d-6d6ddd6e2781",
      "started_at": "2026-02-01T12:00:00Z"
    },
    "def-456": {
      "type": "dev_agent",
      "story_id": "1.4",
      "session_id": "ac8afb61-0a2e-49c6-80bd-73d5dc28433b",
      "started_at": "2026-02-01T12:05:00Z"
    }
  }
}
```

---

## 5. Dashboard Features (aus stream-json)

### 5.1 Core 4 Visibility

| Metrik | Event-Quelle | Field |
|--------|--------------|-------|
| **Context Window** | `result` | `usage.input_tokens + usage.output_tokens` |
| **Model** | `system.init` oder `stream_event.message_start` | `model` |
| **Tools Used** | `stream_event.content_block_start` | `content_block.name` where `type: "tool_use"` |
| **Cost** | `result` | `total_cost_usd` |

### 5.2 Consumed/Produced Assets

Aus Tool-Events extrahieren:

```typescript
// Consumed (Read, Glob, Grep)
if (event.content_block?.name === 'Read') {
  consumed.push(event.content_block.input.file_path);
}

// Produced (Write, Edit)
if (event.content_block?.name === 'Write' || event.content_block?.name === 'Edit') {
  produced.push(event.content_block.input.file_path);
}
```

### 5.3 Event Filter UI

Filter by Event-Typ:
- **TEXT**: `stream_event` where `content_block.type === "text"`
- **TOOL**: `stream_event` where `content_block.type === "tool_use"`
- **HOOK**: `system` where `subtype === "hook_started"` oder `"hook_response"`
- **RESULT**: `result` events

---

## 6. MVP Scope

### Was gebaut wird

1. **Event Bridge**
   - File Watcher für `/tmp/events-*.jsonl`
   - NDJSON Line-by-Line Parser
   - WebSocket Broadcaster (Port 3001)
   - SQLite Persistenz (WAL mode)

2. **Dashboard**
   - Event Stream mit Filter (TEXT/TOOL/HOOK/RESULT)
   - Agent Cards mit Core 4 Metrics
   - Cost Display (aus `result.total_cost_usd`)
   - **Nur Observability** (kein Interaction)

### Was NICHT gebaut wird (MVP)

- ❌ Question Handling
- ❌ Orchestrator Start via Dashboard
- ❌ OTEL Integration (nicht nötig!)
- ❌ Multi-Project Support

---

## 7. Vergleich: Alt vs Neu

| Aspekt | Alt (ADWO-SYNTHESIS-PLAN) | Neu (stream-json) |
|--------|---------------------------|-------------------|
| Event-Quelle | `conduit terminal-read` | File watch auf JSONL |
| Parsing | Regex auf Raw Text | Native JSON |
| Cost Tracking | OTEL erforderlich | `total_cost_usd` im Stream |
| Question Detection | Terminal-Pattern-Matching | (noch zu verifizieren) |
| Polling | 100-200ms | Event-driven |
| Zuverlässigkeit | Fragil | Robust |

---

## 8. Nächste Schritte

1. [x] Verifizieren dass stream-json alle nötigen Events liefert
2. [ ] Event Bridge mit File Watcher implementieren
3. [ ] NDJSON Parser für Dashboard Events
4. [ ] WebSocket Broadcaster
5. [ ] Dashboard Event Stream UI mit Filtering
6. [ ] Agent Cards mit Core 4 Metrics
7. [ ] SQLite Persistenz

---

## Referenzen

- Claude Code CLI: `claude --help`
- Claude Code Docs: https://code.claude.com/docs/en/cli-reference
- Conduit CLI: `conduit --help`
