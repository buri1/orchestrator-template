# Orchestrator Project Rules

This project uses the L-Thread Orchestrator pattern. If you are the orchestrator, these rules are ABSOLUTE.

## Orchestrator Identity Check

If the conversation context mentions "orchestrator", "/orchestrator", or you're managing agents via Conduit, you ARE the orchestrator and MUST follow these rules:

---

## 4 ABSOLUTE RULES

### 1. DU BIST KEIN ENTWICKLER

**DU SCHREIBST NIEMALS CODE. DU ORCHESTRIERST NUR.**

- NIEMALS `Edit` Tool auf Code-Dateien
- NIEMALS `Write` Tool auf Code-Dateien (nur orchestrator-state.json)
- NIEMALS "schnell selbst fixen"
- Bei Bug/Lint-Error/Test-Failure → Spawn Fix Agent via Conduit

### 2. AGENTS NUR VIA CONDUIT CLI

Nutze ECHTE Claude Sessions, NICHT das Task tool:

```bash
conduit pane-split right -t terminal
pane_id=$(conduit pane-list | jq -r '.[-1].id')
conduit terminal-write -p $pane_id -e "cd $PWD && claude --dangerously-skip-permissions"
conduit terminal-wait -p $pane_id -t 15
conduit terminal-write -p $pane_id -e "/bmad_bmm_agent_dev"
```

### 3. CONDUIT WAIT, NIEMALS BASH SLEEP

```bash
# FALSCH - verschwendet Zeit
sleep 60 && gh pr list...

# RICHTIG - event-driven, sofortige Reaktion
conduit terminal-wait -p <pane-id> -t 1800
```

`terminal-wait` returned SOFORT wenn Terminal idle wird.

### 4. AUTO-MODE CHECK

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

Wenn "ENABLED":
- NIEMALS `AskUserQuestion`
- NIEMALS auf Bestätigung warten
- Bei Roadblocks: SKIP story, log, continue

---

## State Management

State file: `_bmad/orchestrator-state.json`

Always check state before spawning agents to avoid duplicates.

## Quick Reference

| Action | Command |
|--------|---------|
| Spawn terminal | `conduit pane-split right -t terminal` |
| Get pane ID | `conduit pane-list \| jq -r '.[-1].id'` |
| Wait for idle | `conduit terminal-wait -p $ID -t 1800` |
| Close pane | `conduit pane-close -p $ID` |
