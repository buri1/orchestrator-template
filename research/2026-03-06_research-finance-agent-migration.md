# Finance Agent Migration Plan: Integration into Meta-System

> Migration architecture for connecting the Finance Agent to the federated meta-system while preserving its production-proven domain logic, Notion data layer, and autonomous scheduling.
>
> Date: 2026-03-06
> Architect: Systems Integration Agent
> Sources: Full analysis of Finance Agent codebase (10 commands, 7 Notion DBs, LaunchAgent scheduler, agent persona, state schema) + Phase 1 analysis (`2026-03-06_analysis-existing-system-patterns.md`) + multi-business architecture analysis

---

## Table of Contents

1. [What Stays Independent](#1-what-stays-independent)
2. [What Connects to the Shared Layer](#2-what-connects-to-the-shared-layer)
3. [Migration Steps (Specific)](#3-migration-steps-specific)
4. [Future Finance Agent Evolution](#4-future-finance-agent-evolution)
5. [Pi Agent Consideration](#5-pi-agent-consideration)
6. [Risk Assessment and Rollback Plan](#6-risk-assessment-and-rollback-plan)
7. [Timeline](#7-timeline)

---

## 1. What Stays Independent

### 1.1 Domain Logic (DO NOT TOUCH)

The Finance Agent's domain intelligence is its primary value. These elements must remain within the Finance Agent's own project boundary and under its exclusive control:

| Component | File(s) | Why Independent |
|-----------|---------|-----------------|
| **Agent Persona** | `.claude/agents/finance-agent.md` | Deeply engineered as "Verhandlungsstratege, nicht Buchhalter." The persona IS the product. Tone calibration per creditor type, strategic reasoning framework, escalation awareness -- all production-proven over 3+ weeks of active use. |
| **10 Command Definitions** | `.claude/commands/*.md` | Each has consistent structure (Vorab-Checkliste, Ablauf, Fehlerbehandlung). Battle-tested: `/check` runs daily headless, `/scan` handles PDF extraction, `/draft` produces Burak's writing style, `/triage` uses weighted scoring. Extend, never rewrite. |
| **Personal Context** | `context/burak.md` | Contains sensitive PII (Steuernummer, IdNr, Jobcenter contacts, account balances). Must never leak into other business line contexts (DSGVO compliance). |
| **Writing Style Reference** | `context/schreibstil.md` | Extracted from 700+ real emails. Finance-specific tone calibration per creditor type. No other system needs this. |
| **Stundungsantrag Template** | `templates/stundungsantrag-de.md` | German bureaucracy template with variables. Domain-specific. |
| **Tax Research** | `context/steuer-recherche-2025.md` | Domain knowledge for Finanzamt interactions. |
| **PDF Processing Pipeline** | `data/inbox/` -> `data/processed/` | File-based document intelligence with scan locking (`.scan.lock`). Self-contained workflow. |
| **Creditor Archive** | `data/glaeubiger/` + `data/glaeubiger/_UNSORTIERT/` | Physical document storage structure. |

### 1.2 Notion Database Structure (DO NOT MODIFY SCHEMAS)

All 7 existing databases remain under Finance Agent ownership. Schema changes are forbidden to avoid breaking production workflows.

| Database | DB ID | Purpose | Integration Policy |
|----------|-------|---------|-------------------|
| **Glaubiger** | `22cc7188...` | Creditor profiles, timing rules, playbooks | READ from shared layer; WRITE only by Finance Agent |
| **Fristen** | `1ebf37a5...` | Deadlines, payment schedules | READ from shared layer; WRITE only by Finance Agent |
| **E-Mail Entwurfe** | `74fa15e4...` | Draft queue for human review | Finance Agent exclusive |
| **Posteingang** | `7b1722c6...` | Notification inbox | READ from shared layer; WRITE by Finance Agent + shared notification layer |
| **Finanzstatus** | `d6675583...` | Cash position, runway, expected income | READ from shared layer (primary integration point) |
| **Abos & Subscriptions** | `20042167...` | Recurring cost tracker | Finance Agent exclusive |
| **Private Schulden** | `4ae15928...` | Informal debt tracker | Finance Agent exclusive (sensitive) |
| **Session Logs** | `109e7ae1...` | Operation audit trail | READ from shared layer for health monitoring |

### 1.3 Scheduling Infrastructure (KEEP AS-IS INITIALLY)

The LaunchAgent scheduler is production-critical:

- `com.burak.finance-agent.plist` -- daily `/check` at 08:00
- `com.burak.finance-agent-scan.plist` -- weekly `/scan` Monday 09:00
- `scheduler/finance-worker.sh` -- headless invocation via `claude --agent finance-agent --dangerously-skip-permissions -p "/$COMMAND"`
- `scheduler/manage.sh` -- install/uninstall/status management

These must continue functioning throughout every migration phase. Any shared scheduler comes later and coexists (does not replace).

---

## 2. What Connects to the Shared Layer

### 2.1 Revenue/Payment Data -> Portfolio Revenue DB

**Current state**: Expected income tracked in Finanzstatus DB as flat text fields ("Erwartetes Einkommen 1", "Erwartetes Einkommen 2", "Pipeline Notizen"). The `/income` command writes here.

**Integration**: A new shared **Portfolio Revenue DB** in Notion that both the Finance Agent and the Orchestrator can read/write:

```
New Notion DB: "Portfolio Revenue"
Fields:
  - Name (title): "Stadtwerk Munchen Q1 2026"
  - Amount (number): 15000
  - Source Business Line (select): "Client Work" | "SaaS" | "Agent Swarm" | "Other"
  - Source Project (text): Link to project/contract
  - Status (select): "Expected" | "Invoiced" | "Overdue" | "Received" | "Cancelled"
  - Expected Date (date): 2026-03-15
  - Received Date (date): null
  - Confidence (select): "Committed" | "Likely" | "Speculative"
  - Notes (text): Free-form context
```

**Data flow**:
- Orchestrator writes here when a project milestone triggers a payment event
- Finance Agent reads here during `/status` and `/triage` (replaces flat Finanzstatus fields for income)
- Finance Agent writes here via `/income` command (marks received, updates amounts)

### 2.2 Task Status -> Unified Task Tracking

**Current state**: Finance Agent tracks tasks implicitly via `session_handoff.open_todos` in `agent-state.json`. The Orchestrator tracks tasks via GitHub issues and sprint state.

**Integration**: A shared **System Tasks DB** in Notion:

```
New Notion DB: "System Tasks"
Fields:
  - Name (title): "Send Stundungsantrag to EOS/REWE"
  - Source Agent (select): "Finance Agent" | "Orchestrator" | "Meta-System" | "Manual"
  - Domain (select): "Finance" | "Development" | "Operations" | "Marketing"
  - Priority (select): "P0-Critical" | "P1-High" | "P2-Medium" | "P3-Low"
  - Status (select): "Open" | "In Progress" | "Blocked" | "Done" | "Skipped"
  - Due Date (date)
  - Assigned To (select): "Burak" | "Finance Agent" | "Orchestrator"
  - Completion Date (date)
  - Notes (text)
```

**Data flow**:
- Finance Agent `/check` writes critical action items here (in addition to Posteingang)
- Orchestrator can read Finance tasks to understand cross-domain priorities
- Meta-system uses this for unified daily briefing

### 2.3 Notifications -> Shared Notification Layer

**Current state**: Finance Agent writes to its Posteingang DB and sends macOS osascript notifications via `finance-notify.sh` (max 3 per `/check`). Orchestrator uses Conduit notify / tmux nudges.

**Integration**: A shared **System Inbox DB** in Notion (extends the Posteingang pattern, which is already well-designed):

```
New Notion DB: "System Inbox"
Fields:
  - Name (title): "[Finance] KSP/PayPal - EUR444 uberffallig seit 3 Tagen"
  - Source Agent (select): "Finance Agent" | "Orchestrator" | "Meta-System"
  - Urgency (select): "Critical" | "Warning" | "Info"
  - Domain (select): "Finance" | "Development" | "Operations"
  - Type (select): "Deadline Warning" | "Escalation Alert" | "Status Update" | "Action Required" | "System Event"
  - Details (text): Full context
  - Read (checkbox): false
  - Action Required (checkbox): true/false
  - Action Taken (text): What was done
  - Created (created_time)
```

**Data flow**:
- Finance Agent continues writing to its own Posteingang (backward compatibility)
- Finance Agent ALSO writes critical items (Kritisch + Warnung) to System Inbox
- Orchestrator writes to System Inbox for cross-domain notifications
- A unified daily briefing reads System Inbox for all domains
- `finance-notify.sh` continues for immediate desktop alerts; a shared `system-notify.sh` is added for cross-domain alerts

### 2.4 Session Handoff -> Shared State Schema

**Current state**: Finance Agent has `session_handoff` in `agent-state.json` with `completed_this_session`, `open_todos`, `next_action`. Orchestrator has per-mode state files.

**Integration**: Standardize the handoff schema so the meta-system can read any agent's last session state:

```json
// Shared session handoff schema (added to agent-state.json)
{
  "meta_handoff": {
    "schema_version": "1.0",
    "agent_id": "finance-agent",
    "timestamp": "2026-03-06T08:00:00Z",
    "status": "healthy",
    "last_command": "/check",
    "summary": "7 deadlines checked, 2 critical, 1 new escalation",
    "critical_items": [
      {
        "type": "deadline",
        "entity": "EOS/REWE",
        "amount": 386.97,
        "due": "2026-02-16",
        "urgency": "critical",
        "action_needed": "Send Stundungsantrag"
      }
    ],
    "financial_snapshot": {
      "total_debt": 3108,
      "overdue_amount": 1200,
      "next_deadline": "2026-03-07",
      "runway_weeks": null,
      "expected_income_next_30d": 15000
    },
    "health": {
      "last_successful_check": "2026-03-06T08:00:00Z",
      "last_successful_scan": "2026-02-13T19:45:00Z",
      "notion_accessible": true,
      "scheduler_active": true
    }
  }
}
```

**Data flow**:
- Finance Agent writes `meta_handoff` after every `/check` and `/status` run
- Meta-system reads `meta_handoff` from all registered agents
- Portfolio dashboard aggregates financial snapshots across business lines

---

## 3. Migration Steps (Specific)

### Step 1: Add Shared State Schema Output to Finance Agent

**Goal**: Finance Agent publishes a standardized `meta_handoff` object that the meta-system can consume, without changing any existing behavior.

**Effort**: 2-3 hours

**Files to change**:

1. **`/Users/buraksmac/Desktop/code2/Finance-agent/memory/agent-state.json`**
   - Add `meta_handoff` key alongside existing keys
   - Existing keys (`last_scan`, `last_check`, `session_handoff`, etc.) remain untouched

2. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/check.md`**
   - After existing Step 9 (Agent State aktualisieren), add Step 9b:
   ```
   ### Step 9b: Meta-Handoff aktualisieren

   Aktualisiere den `meta_handoff` Block in agent-state.json mit:
   - timestamp: jetzt
   - summary: Zusammenfassung dieses /check Durchlaufs
   - critical_items: Alle ROT-Eintraege als strukturierte Objekte
   - financial_snapshot: Aus Finanzstatus-DB (wenn geladen)
   - health.last_successful_check: jetzt
   ```

3. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/status.md`**
   - After existing Step 4 (Bericht in Posteingang speichern), add Step 4b:
   ```
   ### Step 4b: Meta-Handoff mit Finanzsnapshot aktualisieren

   Aktualisiere meta_handoff.financial_snapshot mit:
   - total_debt: Summe aller Glaubiger
   - overdue_amount: Summe uberfaelliger Fristen
   - runway_weeks: aus Finanzstatus berechnet
   - expected_income_next_30d: aus Finanzstatus/Portfolio Revenue
   ```

4. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/scan.md`**
   - After Step 6 (State aktualisieren), add:
   ```
   ### Step 6b: Meta-Handoff aktualisieren

   Aktualisiere meta_handoff mit:
   - last_command: "/scan"
   - summary: "X PDFs gescannt, Y Fristen angelegt, Z Eskalationen erkannt"
   - health.last_successful_scan: jetzt
   ```

5. **`/Users/buraksmac/Desktop/code2/Finance-agent/CLAUDE.md`**
   - Add to "State Persistenz" section:
   ```yaml
   # Meta-System Integration
   meta_handoff:
     description: "Standardisiertes Handoff-Objekt fuer das Meta-System"
     schema_version: "1.0"
     aktualisieren_bei: ["/check", "/status", "/scan", "/income"]
     pflicht_felder: ["timestamp", "status", "summary", "critical_items", "health"]
   ```

**Verification**: Run `/check` manually, then read `agent-state.json` and confirm `meta_handoff` exists alongside existing data. Run `/check` again and confirm existing behavior is unchanged (idempotent Posteingang entries, desktop notifications, etc.).

**Rollback**: Remove `meta_handoff` key from state file. Revert command .md changes. Zero impact on existing functionality.

---

### Step 2: Connect Finance Agent Notifications to Shared Notification Layer

**Goal**: Critical Finance Agent alerts appear in a unified System Inbox that any agent/system can read.

**Effort**: 3-4 hours

**Pre-requisite**: Create the System Inbox Notion DB (one-time setup).

**New Notion DB setup**:

```
1. Create "System Inbox" DB under a shared Notion parent page
2. Fields as specified in Section 2.3
3. Record the DB ID and data_source_id
```

**Files to change**:

1. **`/Users/buraksmac/Desktop/code2/Finance-agent/CLAUDE.md`**
   - Add to `datenbanken:` section:
   ```yaml
   system_inbox:
     db_id: "<NEW_DB_ID>"
     data_source_id: "<NEW_DATA_SOURCE_ID>"
     name: "System Inbox (Shared)"
   ```

2. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/check.md`**
   - After existing Step 6 (Benachrichtigungen erstellen), add Step 6b:
   ```
   ### Step 6b: Kritische Eintraege in System Inbox publizieren

   Fuer alle ROT-Eintraege: ZUSAETZLICH zu Posteingang auch in System Inbox schreiben:

   Tool: notion-create-pages
   parent: { "data_source_id": "<system_inbox_data_source_id>" }
   pages: [{
     "properties": {
       "Name": "[Finance] <glaeubiger> - EUR<betrag> <status>",
       "Source Agent": "Finance Agent",
       "Urgency": "Critical",
       "Domain": "Finance",
       "Type": "Deadline Warning",
       "Details": "<vollstaendige_details>",
       "Read": "__NO__",
       "Action Required": "__YES__"
     }
   }]

   GELB-Eintraege: Nur in lokalen Posteingang (nicht System Inbox).
   Idempotenz: Pruefe System Inbox genau wie Posteingang (gleicher Schluessel).
   ```

3. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/scan.md`**
   - After Step 4 (Zusammenfassung erstellen), add for escalation events:
   ```
   ### Step 4b: Eskalationen in System Inbox publizieren

   Wenn eine ESKALATION erkannt wurde (Stufe gestiegen):
   Zusaetzlich zum Posteingang-Eintrag auch in System Inbox schreiben mit:
   - Type: "Escalation Alert"
   - Urgency: "Critical"
   ```

4. **Create new file: `/Users/buraksmac/Desktop/code2/Finance-agent/.claude/hooks/system-notify.sh`** (optional, for shared desktop notifications)
   ```bash
   #!/bin/bash
   # Shared system notification hook
   # Reads JSON from stdin: {"title": "...", "message": "...", "urgency": "...", "source": "..."}
   # Forwards to system-level notification with source prefix

   INPUT=$(cat)
   TITLE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('title','Alert'))")
   MESSAGE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))")
   SOURCE=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('source','System'))")

   osascript -e "display notification \"[$SOURCE] $MESSAGE\" with title \"$TITLE\" sound name \"Glass\"" 2>/dev/null || true
   ```

**Verification**:
1. Run `/check` -- confirm entries still appear in Posteingang (backward compat)
2. Check System Inbox DB in Notion -- confirm critical entries also appear there
3. Run `/check` again -- confirm no duplicates in either DB (idempotency)

**Rollback**: Remove `system_inbox` from CLAUDE.md, revert command changes. System Inbox DB can remain (empty/unused). No impact on existing Posteingang flow.

---

### Step 3: Add Finance Agent Metrics to Portfolio Dashboard in Notion

**Goal**: A Portfolio Dashboard page in Notion that aggregates financial KPIs from the Finance Agent alongside other business line metrics.

**Effort**: 2-3 hours

**New Notion resources**:

```
1. Create "Portfolio Dashboard" page (or add to existing meta-system parent)
2. Create "Financial Overview" DB (or extend existing Finanzstatus with rollup fields)

New Notion DB: "Portfolio Metrics"
Fields:
  - Name (title): "Finance Agent - March 2026"
  - Agent (select): "Finance Agent" | "Orchestrator" | "Meta-System"
  - Period (date range): 2026-03-01 to 2026-03-31
  - Total Debt (number): 3108
  - Overdue Amount (number): 1200
  - Active Creditors (number): 9
  - Critical Deadlines (number): 4
  - Drafts Pending Review (number): 3
  - Expected Income Next 30d (number): 15000
  - Runway Weeks (number): null
  - Monthly Fixed Costs (number): from Finanzstatus
  - Monthly Abo Costs (number): from Abos DB
  - Last Check (date): 2026-03-06T08:00:00Z
  - Last Scan (date): 2026-02-13T19:45:00Z
  - Health Status (select): "Healthy" | "Warning" | "Error"
  - Snapshot Data (text): JSON blob from meta_handoff.financial_snapshot
```

**Files to change**:

1. **`/Users/buraksmac/Desktop/code2/Finance-agent/CLAUDE.md`**
   - Add to `datenbanken:` section:
   ```yaml
   portfolio_metrics:
     db_id: "<NEW_DB_ID>"
     data_source_id: "<NEW_DATA_SOURCE_ID>"
     name: "Portfolio Metrics (Shared)"
   ```

2. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/status.md`**
   - After Step 4b (Meta-Handoff), add Step 4c:
   ```
   ### Step 4c: Portfolio Metrics aktualisieren

   Suche in Portfolio Metrics DB nach bestehendem Eintrag fuer aktuellen Monat:
   - Wenn gefunden: Update mit aktuellen Zahlen
   - Wenn nicht gefunden: Neuen Eintrag erstellen

   Tool: notion-create-pages (oder notion-update-page)
   parent: { "data_source_id": "<portfolio_metrics_data_source_id>" }
   Properties: Alle berechneten Metriken aus dem /status Durchlauf
   ```

3. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/check.md`**
   - After Step 9b (Meta-Handoff), add Step 9c:
   ```
   ### Step 9c: Portfolio Metrics Health-Status aktualisieren

   Nur den Health-Status und Last-Check Zeitstempel im Portfolio Metrics
   Eintrag aktualisieren (kein vollstaendiger Metrics-Update bei /check,
   nur bei /status).
   ```

**Verification**:
1. Run `/status` -- confirm Portfolio Metrics entry created in Notion
2. Run `/status` again -- confirm entry updated (not duplicated)
3. Open Notion Portfolio Dashboard -- confirm financial KPIs visible

**Rollback**: Remove DB reference from CLAUDE.md, revert command changes. Portfolio Metrics DB remains with last-written data.

---

### Step 4: Enable Cross-System Queries

**Goal**: Any system in the meta-system can ask "when is the next payment due?" or "what's the current debt situation?" without invoking the Finance Agent directly.

**Effort**: 4-5 hours

This step has two parts: making Finance Agent data queryable, and providing a query interface.

#### Part A: Structured Data Export

The `meta_handoff` from Step 1 already provides a queryable snapshot. Step 4A extends this with a dedicated cross-system query file.

**New file: `/Users/buraksmac/Desktop/code2/Finance-agent/memory/finance-snapshot.json`**

This is a "public API" file that the meta-system can read without loading the full Finance Agent context:

```json
{
  "schema_version": "1.0",
  "last_updated": "2026-03-06T08:00:00Z",
  "updated_by": "/check",

  "summary": {
    "total_debt": 3108,
    "overdue_total": 1200,
    "active_creditors": 9,
    "critical_count": 4,
    "warning_count": 2
  },

  "next_deadlines": [
    {
      "creditor": "coeo/Swapfiets",
      "amount": 50,
      "due": "2026-03-07",
      "status": "overdue",
      "escalation": "Inkasso",
      "action": "Stundungsantrag senden"
    }
  ],

  "expected_income": [
    {
      "source": "Vertrag Land Berlin",
      "amount": 22000,
      "expected": "2026-04",
      "confidence": "committed"
    }
  ],

  "cash_position": {
    "balance": -5450,
    "monthly_fixed": null,
    "monthly_abos": null,
    "runway_weeks": null
  },

  "pending_actions": [
    {
      "type": "send_draft",
      "creditor": "coeo/Swapfiets",
      "draft_notion_id": "30774ccd-7c69-81ec-8fe8-e41ff68ff53c",
      "urgency": "critical"
    }
  ],

  "health": {
    "scheduler_status": "active",
    "last_check": "2026-03-06T08:00:00Z",
    "last_scan": "2026-02-13T19:45:00Z",
    "notion_status": "accessible"
  }
}
```

**Files to change**:

1. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/check.md`**
   - Add final step:
   ```
   ### Step 10b: Finance Snapshot aktualisieren

   Schreibe /Users/buraksmac/Desktop/code2/Finance-agent/memory/finance-snapshot.json
   mit allen berechneten Daten aus diesem /check Durchlauf.
   Schema: siehe CLAUDE.md "Cross-System Snapshot"
   ```

2. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/status.md`**
   - Add corresponding step after metrics update

3. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/income.md`**
   - Add step to update `expected_income` in snapshot after recording income

4. **`/Users/buraksmac/Desktop/code2/Finance-agent/CLAUDE.md`**
   - Add new section:
   ```yaml
   # Cross-System Snapshot
   cross_system:
     snapshot_file: "/Users/buraksmac/Desktop/code2/Finance-agent/memory/finance-snapshot.json"
     schema_version: "1.0"
     aktualisieren_bei: ["/check", "/status", "/income", "/triage"]
     lesbar_durch: ["Meta-System", "Orchestrator", "Portfolio Dashboard"]
     beschreibung: >
       Oeffentliche Schnittstelle fuer andere Systeme. Enthaelt aggregierte
       Finanzdaten ohne sensible PII (keine Steuernummern, keine Kontakte).
   ```

#### Part B: Query Interface via Meta-System

The meta-system (or any other agent) can now answer finance questions by reading the snapshot file:

```bash
# From any system:
cat /Users/buraksmac/Desktop/code2/Finance-agent/memory/finance-snapshot.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Next deadline: {data[\"next_deadlines\"][0][\"creditor\"]} - EUR{data[\"next_deadlines\"][0][\"amount\"]} due {data[\"next_deadlines\"][0][\"due\"]}')
"
```

For deeper queries that need live Notion data, the meta-system dispatches to the Finance Agent:

```bash
# Via tmux (if Finance Agent has a persistent session):
tmux send-keys -t finance-agent "/status" Enter

# Via CLI (headless invocation):
cd /Users/buraksmac/Desktop/code2/Finance-agent && \
  claude --agent finance-agent --dangerously-skip-permissions -p "/status"
```

**Verification**:
1. Run `/check` -- confirm `finance-snapshot.json` created
2. From orchestrator project: `cat /Users/buraksmac/Desktop/code2/Finance-agent/memory/finance-snapshot.json` -- confirm readable
3. Confirm snapshot contains no PII (no Steuernummer, no phone numbers, no addresses)

**Rollback**: Delete `finance-snapshot.json`. Revert command changes. No impact on core functionality.

---

### Step 5 (Future): Add SessionStart and PreCompact Hooks

**Goal**: Eliminate the manual "Vorab-Checkliste" pattern and add compaction recovery.

**Effort**: 3-4 hours

This step is listed separately because it changes the Finance Agent's lifecycle model. It is the highest-value internal improvement but does not directly affect meta-system integration.

**New files**:

1. **`/Users/buraksmac/Desktop/code2/Finance-agent/.bmad/scripts/finance-session-start.sh`**
   ```bash
   #!/bin/bash
   # Finance Agent SessionStart Hook
   # Injects critical context after every session start (including post-compaction)

   PROJECT_ROOT="/Users/buraksmac/Desktop/code2/Finance-agent"
   STATE_FILE="$PROJECT_ROOT/memory/agent-state.json"

   # Read current state
   LAST_CHECK=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('last_check','unknown'))" 2>/dev/null || echo "unknown")
   LAST_SCAN=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('last_scan','unknown'))" 2>/dev/null || echo "unknown")
   CRITICAL_COUNT=$(python3 -c "
   import json
   data = json.load(open('$PROJECT_ROOT/memory/finance-snapshot.json'))
   print(data.get('summary',{}).get('critical_count',0))
   " 2>/dev/null || echo "0")

   cat <<EOF
   {
     "additionalContext": "=== FINANCE AGENT SESSION CONTEXT ===\nLast check: $LAST_CHECK\nLast scan: $LAST_SCAN\nCritical items: $CRITICAL_COUNT\n\nABSOLUTE RULES:\n1. IMMER CLAUDE.md lesen fuer Notion DB IDs\n2. IMMER context/burak.md lesen fuer persoenlichen Kontext\n3. IDEMPOTENZ: Keine doppelten Benachrichtigungen\n4. DEUTSCH-FIRST: Alle Ausgaben auf Deutsch\n5. STATE PERSISTENZ: agent-state.json nach jeder Operation aktualisieren\n6. META-HANDOFF: finance-snapshot.json nach /check, /status, /income aktualisieren\n=== END SESSION CONTEXT ==="
   }
   EOF
   ```

2. **`/Users/buraksmac/Desktop/code2/Finance-agent/.bmad/scripts/finance-handoff.sh`**
   ```bash
   #!/bin/bash
   # Finance Agent PreCompact Hook
   # Persists state before context compaction

   PROJECT_ROOT="/Users/buraksmac/Desktop/code2/Finance-agent"
   STATE_FILE="$PROJECT_ROOT/memory/agent-state.json"

   # Update timestamp in state file
   python3 -c "
   import json
   from datetime import datetime
   with open('$STATE_FILE', 'r') as f:
       state = json.load(f)
   state['last_compaction'] = datetime.utcnow().isoformat() + 'Z'
   state['compaction_count'] = state.get('compaction_count', 0) + 1
   with open('$STATE_FILE', 'w') as f:
       json.dump(state, f, indent=2, ensure_ascii=False)
   " 2>/dev/null || true
   ```

3. **`/Users/buraksmac/Desktop/code2/Finance-agent/.claude/settings.local.json`**
   - Add hooks section:
   ```json
   {
     "hooks": {
       "SessionStart": [
         {
           "matcher": "",
           "hooks": [
             {
               "type": "command",
               "command": "/Users/buraksmac/Desktop/code2/Finance-agent/.bmad/scripts/finance-session-start.sh"
             }
           ]
         }
       ],
       "PreCompact": [
         {
           "matcher": "",
           "hooks": [
             {
               "type": "command",
               "command": "/Users/buraksmac/Desktop/code2/Finance-agent/.bmad/scripts/finance-handoff.sh"
             }
           ]
         }
       ]
     }
   }
   ```

**Verification**: Start a new Claude session with `--agent finance-agent`, confirm session context is injected. Trigger compaction, confirm state preserved and restored.

---

## 4. Future Finance Agent Evolution

### 4.1 Bank Account Integration (FinTS/HBCI)

**German Banking APIs**:

| Technology | Status | Feasibility | Notes |
|------------|--------|-------------|-------|
| **FinTS/HBCI** | Legacy but still supported by most German banks | Medium | Python library `python-fints` exists. Requires bank-specific configuration. Many banks moving away from it. |
| **PSD2 Open Banking** | EU-mandated, all banks must support | High | Via aggregators: Plaid (limited DE coverage), Tink (Visa-owned, good DE support), finAPI (German, Sparkasse/Volksbank focus), or direct bank APIs. |
| **Sparkasse API** | Sparkasse has own API program | Medium | Given Burak's Sparkasse Dispo, this is directly relevant. Requires developer registration. |
| **Kontist/Qonto API** | Business banking with developer-first APIs | Low priority | Relevant only if Burak switches business banking. |

**Recommended approach**:
1. **Short-term**: Manual balance updates via `/status` or a simple bank statement CSV import command (`/import-statement`)
2. **Medium-term**: Use **finAPI** (German aggregator) for read-only transaction access. They offer a sandbox for testing. PSD2-compliant, handles SCA (Strong Customer Authentication).
3. **Long-term**: Direct Sparkasse/Volksbank API integration once developer access is granted.

**New command**: `/balance` -- Fetches current account balance and recent transactions. Updates Finanzstatus DB automatically.

**Security considerations**:
- PSD2 requires SCA (2-factor auth) -- cannot be fully automated without bank-side approval
- Read-only access only (AISP, not PISP) -- the agent sees transactions but cannot initiate them
- Credentials stored in macOS Keychain, never in state files or Notion
- Tokens refreshed automatically (PSD2 tokens expire after 90 days)

### 4.2 Automated Payment Execution

**Feasibility assessment**:

| Aspect | Assessment |
|--------|------------|
| **Technical** | Possible via PSD2 PISP (Payment Initiation Service Provider). finAPI supports payment initiation for German banks. |
| **Legal** | PSD2 allows third-party payment initiation with explicit consent. No German-specific prohibition for personal use. |
| **Security** | SCA required for every payment initiation. Cannot bypass 2FA. Bank must approve the PISP. |
| **Practical** | Burak would need to approve each payment via his banking app (SCA). The agent can prepare/initiate, but Burak confirms. |
| **Risk** | HIGH. A misconfigured agent could drain an account. Requires hard limits, whitelisting, and human-in-the-loop. |

**Recommended architecture** (if pursued):
```
Finance Agent /triage generates payment plan
  -> Creates "Payment Queue" entries in Notion (status: "Pending Approval")
  -> Burak reviews in Notion, marks approved
  -> Agent reads approved entries, initiates payment via finAPI PISP
  -> Bank sends SCA push to Burak's phone
  -> Burak confirms on phone
  -> Agent verifies transaction, updates Fristen to "Bezahlt"
```

**Hard constraints**:
- Maximum single payment: EUR 500 (configurable)
- Maximum daily total: EUR 1000 (configurable)
- Whitelist-only recipients (from Glaubiger DB)
- Every payment requires Notion approval + bank SCA
- Agent NEVER stores banking credentials

**Verdict**: Technically feasible but should be Phase 3+ (after bank integration is stable and trusted). The human-in-the-loop via SCA provides a natural safety net.

### 4.3 Tax Preparation Agent (Steuererklarung)

**Architecture**: A new specialized sub-agent within the Finance Agent project, not a separate system.

```
Finance Agent (parent)
  ├── /check, /scan, /draft, etc. (existing)
  └── Tax Sub-Agent
      ├── /tax-status    -- Current tax situation overview
      ├── /tax-gather     -- Collect relevant documents for tax year
      ├── /tax-calculate  -- Estimate tax liability/refund
      ├── /tax-prepare    -- Generate ELSTER-compatible data
      └── /tax-deadlines  -- Tax-specific deadline tracking
```

**Data sources needed**:
- Existing Finanzstatus DB (income, expenses)
- Existing Abos DB (deductible business expenses)
- New: `Steuerbelege` Notion DB (receipts, invoices, bank statements per tax year)
- `context/steuer-recherche-2025.md` (already exists -- tax research)
- ELSTER XML schema reference (for electronic filing format)

**Key tax categories for Burak** (based on context):
- Einkommensteuer (EkSt) -- income tax, annual
- Umsatzsteuer (USt) -- VAT, quarterly for freelancers
- Gewerbesteuer (GewSt) -- trade tax, if applicable to CraftCode Solutions

**Feasibility**: Medium-high. ELSTER has a REST API (ERiC) for electronic filing, but it requires a registered software vendor certificate. More practical: generate the data and let Burak file via ELSTER online portal manually, or export to a Steuerberater-compatible format (DATEV).

**Effort**: 2-3 weeks for MVP tax agent. Builds on existing Finance Agent infrastructure.

### 4.4 Income Tracking from Client Contracts

**Current gap**: The `/income` command tracks expected revenue as flat text. There is no link between "Vertrag Land Berlin" in the Finance Agent and the actual project in the Orchestrator.

**Solution**: The Portfolio Revenue DB from Step 3 bridges this gap. Extended architecture:

```
Orchestrator manages project delivery
  -> Project milestone reached
  -> Orchestrator writes to Portfolio Revenue DB:
     "Milestone 2 complete, EUR 15000 invoiceable"
  -> Finance Agent /status reads Portfolio Revenue DB
  -> Runway calculation includes committed pipeline revenue
  -> /triage uses expected income dates for payment prioritization
```

**New command**: `/pipeline` -- Shows all expected revenue from Portfolio Revenue DB, grouped by business line and confidence level. Replaces the flat "Erwartetes Einkommen" fields in Finanzstatus.

**Files to change**:
- `/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/income.md` -- Extend to write to Portfolio Revenue DB instead of (or in addition to) flat Finanzstatus fields
- `/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/status.md` -- Read from Portfolio Revenue DB for income section
- `/Users/buraksmac/Desktop/code2/Finance-agent/.claude/commands/triage.md` -- Factor in Portfolio Revenue expected dates for runway calculation

### 4.5 Budget Forecasting with Expected Revenue

**New command**: `/forecast [months]` -- Projects cash position forward N months.

**Algorithm**:
```
For each future month M (1..N):
  starting_balance = current_balance (or previous month ending balance)

  income = sum(Portfolio Revenue entries where expected_date in month M
               AND confidence in ["committed", "likely"])

  fixed_costs = monthly_fixed_costs from Finanzstatus
  abo_costs = sum(active Abos)

  debt_payments = sum(Fristen entries due in month M
                      where status != "Bezahlt" AND status != "Erlassen")

  ending_balance = starting_balance + income - fixed_costs - abo_costs - debt_payments

  Output:
    Month M: +EUR income | -EUR costs | -EUR debt | = EUR balance
    Runway alert if balance goes negative
```

**Visualization**: Table in terminal output + Notion page with monthly breakdown.

**Value**: This answers the strategic question "Can I survive until the government payments arrive?" with specific numbers, not gut feeling.

---

## 5. Pi Agent Consideration

### 5.1 Should Finance Agent Migrate to Pi Agent?

**Pi Agent advantages**:
- Superior scheduling (cron-like with dependency chains)
- Built-in health monitoring and alerting
- Web dashboard for configuration
- Multi-model routing (could use cheaper models for `/check`, Opus for `/draft`)
- Event-driven architecture (natural fit for cross-system triggers)

**Pi Agent disadvantages**:
- Migration effort: All 10 command definitions would need adaptation to Pi's skill format
- Different MCP integration: Pi handles MCP differently than Claude Code's native integration
- Loss of Claude Code ecosystem patterns (CLAUDE.md, .claude/agents, .claude/commands, hooks)
- The Finance Agent persona engineering leverages Claude Code's context injection model
- Risk of regression during migration (production system with real deadlines)

### 5.2 Keep on Claude Code with LaunchAgent?

**Advantages**:
- Already working in production
- Zero migration risk
- LaunchAgent is reliable for daily/weekly schedules
- Claude Code's `--agent` + `-p` pattern is clean for headless execution
- All 10 commands are designed for this execution model

**Disadvantages**:
- No built-in health monitoring (must build separately)
- No event-driven triggers (only time-based scheduling)
- No web dashboard
- No multi-model routing

### 5.3 Recommendation: Minimal Change for Maximum Benefit

**Keep Claude Code + LaunchAgent as the execution runtime. Add a thin monitoring and event layer.**

The rationale:

1. **Risk/reward ratio**: Migrating a production system managing real debt deadlines to a new runtime is high-risk, moderate-reward. The Finance Agent works. Don't break it.

2. **The 80/20 move**: Add the four integration steps above (Steps 1-4). This gives you cross-system visibility, unified notifications, queryable financial data, and portfolio metrics -- all without touching the execution runtime.

3. **What Pi Agent would add that you actually need**:
   - **Health monitoring**: Solvable by adding a simple health check script to LaunchAgent (runs every 15 min, checks `finance-snapshot.json` freshness, alerts if stale)
   - **Event triggers**: Solvable by a file-watcher or Notion webhook that invokes `finance-worker.sh` on events
   - **Multi-model routing**: Not needed yet. The Finance Agent's context is well within Opus's window, and the quality of `/draft` output depends on Opus-level reasoning.

4. **When to reconsider Pi Agent**:
   - If you add 3+ more domain agents (tax, client CRM, marketing) and need unified scheduling
   - If LaunchAgent proves unreliable (e.g., missed schedules, macOS sleep/wake issues)
   - If Pi Agent adds native Notion MCP support that simplifies the integration
   - If you need sub-hourly scheduling (LaunchAgent's minimum practical interval is ~1 minute, but agents take 2-5 minutes to run)

### 5.4 Proposed Health Check Addition

**New LaunchAgent**: `com.burak.finance-agent-health.plist` -- runs every 15 minutes

**New script**: `scheduler/health-check.sh`
```bash
#!/bin/bash
# Quick health check -- no Claude invocation, just file freshness checks

SNAPSHOT="/Users/buraksmac/Desktop/code2/Finance-agent/memory/finance-snapshot.json"
STATE="/Users/buraksmac/Desktop/code2/Finance-agent/memory/agent-state.json"
MAX_CHECK_AGE_HOURS=26  # Daily check should be <24h old

if [ ! -f "$SNAPSHOT" ]; then
  osascript -e 'display notification "finance-snapshot.json missing!" with title "Finance Agent Health" sound name "Basso"'
  exit 1
fi

LAST_UPDATED=$(python3 -c "
import json
from datetime import datetime, timezone
data = json.load(open('$SNAPSHOT'))
last = datetime.fromisoformat(data['last_updated'].replace('Z','+00:00'))
age_hours = (datetime.now(timezone.utc) - last).total_seconds() / 3600
print(f'{age_hours:.1f}')
")

if (( $(echo "$LAST_UPDATED > $MAX_CHECK_AGE_HOURS" | bc -l) )); then
  osascript -e "display notification \"Last check was ${LAST_UPDATED}h ago (max: ${MAX_CHECK_AGE_HOURS}h)\" with title \"Finance Agent Stale\" sound name \"Basso\""
fi
```

**Effort**: 1 hour. Gives you health monitoring without Pi Agent.

---

## 6. Risk Assessment and Rollback Plan

### Migration Risk Matrix

| Step | Risk Level | Blast Radius | Rollback Complexity |
|------|-----------|--------------|---------------------|
| Step 1: Shared state schema | LOW | None (additive only) | Delete key from JSON |
| Step 2: System Inbox | LOW-MEDIUM | Slight performance (extra Notion write) | Remove DB reference, revert commands |
| Step 3: Portfolio Metrics | LOW | None (additive only) | Remove DB reference, revert commands |
| Step 4: Cross-system queries | LOW | None (additive only) | Delete snapshot file |
| Step 5: Hooks | MEDIUM | Could break session start if script errors | Remove hooks from settings.json |

### Critical Safety Rule

**Every migration step is additive.** No existing file is deleted or has its schema changed. New functionality is added alongside existing functionality. The Finance Agent's existing 10 commands must produce identical results before and after each step.

### Testing Protocol Per Step

```
Before step:
  1. Run /check -- save Posteingang state
  2. Run /status -- save output
  3. Note agent-state.json contents

After step:
  1. Run /check -- compare Posteingang state (must be identical or superset)
  2. Run /status -- compare output (must be identical or superset)
  3. Note agent-state.json (existing keys unchanged, new keys may be added)
  4. Check new integration point (System Inbox, Portfolio Metrics, snapshot file)

Headless test:
  ./scheduler/finance-worker.sh check
  -- Must complete without error
  -- Log file must show success
```

---

## 7. Timeline

### Phase 1: Foundation (Week 1)

| Day | Task | Effort | Dependency |
|-----|------|--------|------------|
| Day 1 | Step 1: Add meta_handoff to agent-state.json schema | 2h | None |
| Day 1 | Modify /check, /status, /scan commands for meta_handoff | 1h | Step 1 |
| Day 2 | Step 4A: Create finance-snapshot.json and update commands | 2h | Step 1 |
| Day 2 | Verify: headless /check produces both state + snapshot | 1h | Step 1 + 4A |

### Phase 2: Shared Notification Layer (Week 1-2)

| Day | Task | Effort | Dependency |
|-----|------|--------|------------|
| Day 3 | Create System Inbox Notion DB | 30min | None |
| Day 3 | Step 2: Modify /check and /scan for System Inbox writes | 2h | System Inbox DB |
| Day 4 | Create Portfolio Revenue Notion DB | 30min | None |
| Day 4 | Step 3: Modify /status for Portfolio Metrics | 2h | Portfolio Metrics DB |
| Day 5 | Integration testing: full /check + /status + /scan cycle | 2h | Steps 1-4 |

### Phase 3: Hooks and Health (Week 2)

| Day | Task | Effort | Dependency |
|-----|------|--------|------------|
| Day 6 | Step 5: Create SessionStart + PreCompact hooks | 3h | None |
| Day 6 | Add hooks to settings.local.json | 30min | Hook scripts |
| Day 7 | Create health-check.sh and LaunchAgent plist | 1h | Step 4A (snapshot) |
| Day 7 | End-to-end verification: fresh session, compaction recovery, health check | 2h | All steps |

### Phase 4: Future Evolution (Month 2+)

| Timeframe | Task | Effort |
|-----------|------|--------|
| Month 2 | `/pipeline` command (reads Portfolio Revenue DB) | 4h |
| Month 2 | `/forecast` command (cash projection) | 6h |
| Month 2 | Extend `/income` to write to Portfolio Revenue DB | 2h |
| Month 3 | Bank statement CSV import (`/import-statement`) | 8h |
| Month 3 | Tax sub-agent MVP (`/tax-status`, `/tax-deadlines`) | 2-3 weeks |
| Month 4+ | finAPI integration for read-only bank access | 1-2 weeks |
| Month 6+ | Payment initiation (if bank integration stable) | 2-3 weeks |

### Total Effort for Core Integration (Steps 1-5)

| Category | Hours |
|----------|-------|
| Code changes (command .md files) | 8-10h |
| New Notion DBs setup | 1-2h |
| New scripts (hooks, health) | 3-4h |
| Testing and verification | 4-5h |
| **Total** | **16-21 hours** |

Achievable in 1 week of focused work, or 2 weeks at 2 hours/day alongside other priorities.

---

## Appendix: New Notion DB Summary

| Database | Purpose | Created In Step | Parent Page |
|----------|---------|-----------------|-------------|
| **System Inbox** | Unified cross-agent notifications | Step 2 | Meta-System Hub |
| **Portfolio Revenue** | Expected and received revenue across all business lines | Step 3 (used in Step 4) | Meta-System Hub |
| **Portfolio Metrics** | Monthly KPI snapshots per agent/business line | Step 3 | Meta-System Hub |

These 3 new databases are created once in the shared Notion workspace. They are the thin shared layer that connects the federated systems.

## Appendix: New File Summary

| File | Purpose | Created In Step |
|------|---------|-----------------|
| `memory/finance-snapshot.json` | Public API for cross-system queries | Step 4A |
| `.bmad/scripts/finance-session-start.sh` | SessionStart hook | Step 5 |
| `.bmad/scripts/finance-handoff.sh` | PreCompact hook | Step 5 |
| `scheduler/health-check.sh` | Lightweight health monitoring | Section 5.4 |

## Appendix: Modified File Summary

| File | Changes | Steps |
|------|---------|-------|
| `CLAUDE.md` | Add system_inbox, portfolio_metrics, cross_system config sections | 2, 3, 4 |
| `memory/agent-state.json` | Add meta_handoff key | 1 |
| `.claude/commands/check.md` | Add Steps 6b, 9b, 9c, 10b | 1, 2, 3, 4 |
| `.claude/commands/status.md` | Add Steps 4b, 4c | 1, 3 |
| `.claude/commands/scan.md` | Add Steps 4b, 6b | 1, 2 |
| `.claude/commands/income.md` | Add snapshot update step | 4 |
| `.claude/settings.local.json` | Add hooks section | 5 |
