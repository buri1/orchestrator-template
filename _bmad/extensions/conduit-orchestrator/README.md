# Conduit Orchestrator Extension

> L-Thread Orchestrator for automated sequential agent spawning via Conduit CLI

## Status: IMPLEMENTIERT (v2.0 - L-Thread)

---

## Architecture: L-Thread with Conduit CRUD

Based on IndyDevDan's orchestrator pattern: **"Orchestrator Agent with CRUD for Agents"**

```
┌─────────────────────────────────────────────────────────────────┐
│                    L-THREAD ORCHESTRATOR                         │
│                    (runs in main terminal)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   LOOP {                                                         │
│     1. Get next story (GitHub Issues)                            │
│     2. SPAWN agent (Conduit CLI → real terminal)                 │
│     3. Wait for PR                                               │
│     4. User approval                                             │
│     5. DELETE agent (close pane)                                 │
│     6. Log to devlog                                             │
│     7. Continue                                                  │
│   }                                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ conduit pane-split (SPAWN)
         │ conduit pane-close (DELETE)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DEV AGENT                                     │
│                    (real terminal, visible)                      │
├─────────────────────────────────────────────────────────────────┤
│   - Full Claude session                                          │
│   - Implements story end-to-end                                  │
│   - Creates PR                                                   │
│   - Self-contained (no orchestrator involvement)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Concept | Implementation |
|---------|---------------|
| **L-Thread** | Orchestrator runs as continuous loop |
| **CRUD for Agents** | Create/Delete via Conduit CLI |
| **Real Terminals** | Not subagents - visible panes |
| **Sequential** | One agent at a time |
| **Human-in-Loop** | User approves each PR |
| **Observability** | Visible terminals + devlog |

---

## Quick Start

```bash
# 1. Open Conduit terminal
# 2. Start orchestrator
claude
/orchestrator

# 3. Say "start" to begin the L-Thread loop
> start

# 4. Watch the magic happen
#    - Orchestrator spawns Dev Agent in right pane
#    - Dev Agent implements story
#    - You review PR when notified
#    - Approve to continue
```

---

## How It Works

### The L-Thread Loop

```
┌─────────────────────────────────────────────────────────────┐
│ /orchestrator                                                │
│                                                              │
│  "start" ──▶ GET_NEXT_STORY ──▶ SPAWN_AGENT ──▶ WAIT_PR     │
│                    ▲                              │          │
│                    │                              ▼          │
│              CONTINUE ◀── LOG ◀── CLOSE ◀── USER_APPROVAL   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Agent CRUD via Conduit

**CREATE (Spawn Agent):**
```bash
PANE_ID=$(conduit pane-split right -t terminal --json | jq -r '.id')
conduit terminal-write -p $PANE_ID -e "claude --dangerously-skip-permissions"
conduit terminal-wait -p $PANE_ID -t 60  # Wait until claude started
conduit terminal-write -p $PANE_ID -e "/bmad_bmm_dev-story"
conduit terminal-wait -p $PANE_ID -t 30
conduit terminal-write -p $PANE_ID -e "3.5"  # Story number
```

**READ (Monitor Agent) - EVENT-DRIVEN:**
```bash
# DON'T poll! Use terminal-wait instead:
conduit terminal-wait -p $PANE_ID -t 1800  # Returns IMMEDIATELY when idle!
conduit terminal-read -p $PANE_ID          # Then read output
```

**DELETE (Close Agent):**
```bash
conduit pane-close -p $PANE_ID
```

---

## Event-Driven Architecture (v2.1)

### KRITISCH: Kein Polling!

| Pattern | Beispiel | Problem |
|---------|----------|---------|
| ❌ Polling | `sleep 60 && check` | Verschwendet 59 Sekunden wenn Agent nach 1s fertig |
| ✅ Event-Driven | `terminal-wait` | Returned SOFORT wenn Terminal idle |

### Die magischen Event-Driven Commands:

```bash
# 1. terminal-wait - Wartet bis Terminal IDLE wird
conduit terminal-wait -p <pane-id> -t 1800
# → Returned nach 5 Sekunden wenn Agent nach 5s fertig
# → Returned nach 25 Minuten wenn Agent 25 Min braucht
# → Timeout nur als Safety-Net!

# 2. gh pr checks --watch - Wartet auf CI
gh pr checks <pr-number> --watch --interval 10
# → Returned wenn alle Checks done (pass/fail)
# → Nicht alle 60s pollen!
```

### Optimaler Event-Driven Flow:

```
┌─────────────────────────────────────────────────────────────┐
│ EVENT-DRIVEN ORCHESTRATOR FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SPAWN ──▶ terminal-wait (instant when ready)            │
│                     │                                        │
│  2. WORK  ──▶ terminal-wait (instant when done)             │
│                     │                                        │
│  3. PR    ──▶ gh pr checks --watch (instant when CI done)   │
│                     │                                        │
│  4. MERGE ──▶ Continue to next story                        │
│                                                              │
│  KEINE sleep-Befehle! KEINE fixed-interval Polls!            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Files

| File | Purpose |
|------|---------|
| `.claude/commands/orchestrator.md` | L-Thread Orchestrator prompt |
| `.bmad/devlog.md` | Session log (stories, PRs, timing) |
| `justfile` | Command shortcuts |

---

## Devlog

The orchestrator maintains a development log at `.bmad/devlog.md`:

```markdown
# CityHub Development Log

## Session: 2024-01-29

### [10:15] Story 0.1 - Project Bootstrap
- Issue: #15
- PR: #42
- Duration: 45 minutes
- Status: Approved

### [11:00] Story 0.2 - Database Schema
- Issue: #16
- PR: #43
- Duration: 30 minutes
- Status: Approved
```

---

## Commands

| User Says | Orchestrator Does |
|-----------|------------------|
| `start` | Begin L-Thread loop |
| `status` | Show current state |
| `skip` | Skip current story, continue |
| `pause` | Pause loop, keep agent |
| `stop` | Close agent, end session |

---

## Why L-Thread + Conduit?

| vs Subagents | L-Thread + Conduit |
|--------------|-------------------|
| Hidden execution | Visible terminals |
| Context sharing issues | Isolated sessions |
| Hard to debug | Watch agent work |
| No true CRUD | Full Create/Delete |

| vs Parallel | Sequential L-Thread |
|-------------|---------------------|
| Complex coordination | Simple loop |
| Resource contention | One at a time |
| Hard to track | Clear devlog |
| Overwhelming | Manageable |

---

## Requirements

- **Conduit**: Must run inside Conduit terminal
- **GitHub CLI**: `gh` authenticated
- **Claude Code**: `claude` installed

---

## Setup: PreCompact Hook (WICHTIG!)

Nach einer Context-Compaction verliert der Orchestrator kritische Informationen (Rollen-Trennung, aktive Agents, etc.). Der **PreCompact Hook** stellt sicher, dass diese Informationen erhalten bleiben.

### 1. Hook-Konfiguration

Füge folgendes zu `.claude/settings.local.json` hinzu:

```json
{
  "permissions": {
    "allow": [
      "Bash(conduit:*)",
      "Bash(gh:*)",
      "Bash(git:*)"
    ]
  },
  "hooks": {
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat \"$CLAUDE_PROJECT_DIR/_bmad/orchestrator-post-compaction-briefing.md\""
          }
        ]
      }
    ]
  }
}
```

### 2. Briefing-Datei

Die Datei `_bmad/orchestrator-post-compaction-briefing.md` enthält Anweisungen, die der Orchestrator nach einer Compaction ausführen MUSS:

1. **Orchestrator-Persona laden** - Volle Skill-Definition lesen
2. **State prüfen** - `orchestrator-state.json` lesen
3. **GitHub prüfen** - Aktive PRs und Checks
4. **Agent-Panes prüfen** - Läuft noch ein Agent?

### 3. Warum das nötig ist

| Problem | Lösung |
|---------|--------|
| Nach Compaction: Agent vergisst Rollen-Trennung | Hook injiziert Briefing vor Compaction |
| Agent führt selbst Code-Reviews aus | Briefing erinnert: "NIEMALS selbst ausführen" |
| Agent weiß nicht ob Agent läuft | Briefing: "Prüfe State + Panes" |

### 4. Testen

```bash
# Manuell Compaction triggern
/compact

# Nach Compaction sollte der Agent:
# 1. Die Orchestrator-Persona lesen
# 2. Den State prüfen
# 3. Korrekt fortfahren (Agents spawnen, nicht selbst arbeiten)
```

Siehe auch: `decisions.md` Section 8 für die vollständige Architektur-Entscheidung.

---

## Thread Taxonomy (from IndyDevDan)

| Thread Type | Our Usage |
|-------------|-----------|
| **B-Thread** (Base) | Single prompt → work → review |
| **P-Thread** (Parallel) | Not used (too complex for now) |
| **C-Thread** (Chained) | Story phases if needed |
| **F-Thread** (Fusion) | Not used |
| **L-Thread** (Long) | **Our orchestrator** |
| **Z-Thread** (Zero-touch) | Future goal |

We chose L-Thread because:
- Long-running continuous loop
- High autonomy between checkpoints
- User shows up at key decision points
- Scales compute without scaling presence
