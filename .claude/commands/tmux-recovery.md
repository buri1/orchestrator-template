# Tmux Session Recovery

> Detects crashed tmux sessions and restores them to their expected state.
> Run this after a Conduit crash, system restart, or whenever sessions are missing.

---

## STEP 1: READ EXPECTED STATE

```bash
cat _bmad/orchestrator-tmux-state.json
```

If no state file exists, create one from the template:
```bash
cp _bmad/orchestrator-tmux-state.template.json _bmad/orchestrator-tmux-state.json
```

---

## STEP 2: PROBE LIVE SESSIONS

For each session in the state file:

```bash
tmux has-session -t <session_name> 2>/dev/null && echo "ALIVE" || echo "DEAD"
```

If alive, check what is running:
```bash
tmux list-panes -t <session_name> -F '#{pane_current_command} #{pane_current_path}'
```

---

## STEP 3: RECOVER DEAD SESSIONS

For each session that should exist but does not:

```bash
tmux new-session -d -s <session_name> -c "<working_directory>"
```

If the session should have claude running:
```bash
tmux send-keys -t <session_name> 'unset CLAUDECODE && claude <claude_flags>' Enter
```

Wait a few seconds for claude to start, then verify:
```bash
sleep 3
tmux list-panes -t <session_name> -F '#{pane_current_command}'
```

---

## STEP 4: UPDATE STATE

Update the state file with current probe results using the Write tool.
Set `claude_running` and `last_seen_alive` for each session.

Log the recovery event:
```json
{
  "timestamp": "2026-02-16T...",
  "sessions_recovered": ["autarkis1", "cityhub"],
  "sessions_already_alive": ["orchy", "finance"],
  "action": "full_recovery"
}
```

---

## STEP 5: REPORT

Display a summary:

```
Tmux Session Recovery Complete

Session      | Status    | Claude  | Directory
-------------|-----------|---------|----------
autarkis1    | RECOVERED | Running | /Users/.../Lagerlink Hildesheim
autarkis2    | ALIVE     | Running | /Users/.../Lagerlink Hildesheim
orchy        | ALIVE     | Running | /Users/.../orchestrator
cityhub      | RECOVERED | Running | /Users/.../CityHub
finance      | ALIVE     | Running | /Users/.../Finance-agent
contentos    | ALIVE     | Running | /Users/.../ContentOS

Recovered: 2 sessions
Already alive: 4 sessions
```
