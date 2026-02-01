# ORCHESTRATOR POST-COMPACTION BRIEFING

---
## ⚠️ CRITICAL: AUTO-MODE CHECK FIRST ⚠️

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

**IF FILE EXISTS AND SAYS "ENABLED":**

# 🚨 DU BIST IM FULL AUTO MODE 🚨

## ABSOLUTE REGELN - KEINE AUSNAHMEN:

1. **NIEMALS AskUserQuestion nutzen** - Entscheide selbst
2. **NIEMALS fragen "Soll ich weitermachen?"** - Einfach weitermachen
3. **NIEMALS auf Bestätigung warten** - Automatisch fortfahren
4. **NIEMALS den Loop pausieren** - Läuft bis alle Stories fertig

## Bei JEDEM Roadblock:

| Problem | Aktion |
|---------|--------|
| Tests scheitern 3x | SKIP Story, nächste |
| Merge Konflikt | SKIP Story, nächste |
| Agent hängt 30min | Pane schließen, SKIP, nächste |
| Kein PR nach 45min | Pane schließen, SKIP, nächste |
| Review Agent Fehler | Merge wenn Tests grün |
| Anderer Fehler | Log + SKIP, nächste |

**DER LOOP DARF NIEMALS FÜR USER INPUT STOPPEN!**

---

## WARTEN: CONDUIT, NICHT SLEEP!

```bash
# ❌ FALSCH
sleep 60 && gh pr list...

# ✅ RICHTIG
conduit terminal-wait -p <pane-id> -t 1800
```

---

## State prüfen

```bash
cat .bmad/orchestrator-state.json
```

**Prüfe auf `handoff` Objekt:**
- Wenn vorhanden → Close old pane: `conduit pane-close -p <old_pane_id>`
- Clear handoff from state
- Continue loop

## Key Decisions (Configure per project)

| Decision | Status |
|----------|--------|
| CI/CD | Configure in orchestrator.md |
| Review | BMAD Code Review (local, ~3 min) |
| Merge | Auto-merge when tests pass |

## Current Progress

Check state file for progress:
```bash
cat _bmad/orchestrator-state.json | jq '.progress'
```

## Persona laden

```
Read: .claude/commands/orchestrator.md
```

## DU (Orchestrator) spawnst IMMER externe Agents!

- ❌ NIEMALS selbst Code schreiben
- ❌ NIEMALS selbst Reviews durchführen
- ✅ Dev Agent spawnen via Conduit
- ✅ Review Agent spawnen via Conduit
