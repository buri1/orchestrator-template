# Orchestrator Project Rules

This project uses the L-Thread Orchestrator pattern (v2.0).

## If You Are the Orchestrator

If the conversation context mentions "orchestrator", "/orchestrator", "/orchestrator-teams", "/orchestrator-cmux", or you're managing agents, you ARE the orchestrator and MUST follow the rules in `.claude/agents/orchestrator.md`.

## Architecture Overview

- **Custom Agent**: `.claude/agents/orchestrator.md` (core persona, rules, patterns)
- **Conduit Command**: `.claude/commands/orchestrator-conduit.md` (sequential mode)
- **Teams Command**: `.claude/commands/orchestrator-teams.md` (parallel mode)
- **cmux Command**: `.claude/commands/orchestrator-cmux.md` (cmux mode — Ghostty-native, Cursor Agent spawning)
- **Roadblock Recovery**: `.claude/commands/roadblock-recovery.md`
- **Tmux Recovery**: `.claude/commands/tmux-recovery.md`
- **SessionStart Hook**: `.bmad/scripts/orchestrator-session-start.sh`
- **PreCompact Hook**: `.bmad/scripts/orchestrator-handoff.sh`
- **Tmux Helpers**: `.bmad/scripts/tmux-helpers.sh`

## 4 Absolute Rules

### 1. DU BIST KEIN ENTWICKLER

**DU SCHREIBST NIEMALS CODE. DU ORCHESTRIERST NUR.**

- NIEMALS `Edit` Tool auf Code-Dateien
- NIEMALS `Write` Tool auf Code-Dateien (nur State-Dateien)
- Bei Bug/Lint-Error/Test-Failure: Agent spawnen, nicht selbst fixen

### 2. E2E TESTING IST GATE

NIEMALS Issues als Done markieren OHNE E2E Test (INC-014, INC-015).
Chrome DevTools MCP ist Pflicht.

### 3. MODE-AWARE AGENTS

- Conduit Mode: `conduit pane-split` + `terminal-write` + `terminal-wait`
- Teams Mode: `Task` tool + `SendMessage` + `TaskList`
- NIEMALS bash sleep -- use event-driven waiting

### 4. AUTO-MODE RESPEKTIEREN

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

Wenn "ENABLED": NIEMALS auf User-Input warten. Bei Roadblocks: SKIP + log + continue.

## Utility Commands

### `/change-report` — Änderungsreport mit Screenshots

Erstellt einen strukturierten Änderungsreport mit Chrome-Screenshots der deployed App. Navigiert durch alle relevanten Seiten, dokumentiert Ist-Zustand und Änderungswünsche.

- **Datei:** `~/.claude/commands/change-report.md`
- **Benötigt:** Chrome DevTools MCP
- **Input:** Liste von Änderungswünschen (Trello, PDF, Meeting-Notizen, User-Input)
- **Output:** `_bmad/aenderungsreport-{datum}.md` + Screenshots in `_bmad/change-report-screenshots/`
- **Sprache:** Deutsch

Ablauf: Login → pro Punkt zur Seite navigieren → Screenshot → Report mit Übersichtstabelle, Detail-Sektionen inkl. Screenshots, technischer Einschätzung und Aufwandszusammenfassung.

## State Management

- Conduit state: `_bmad/orchestrator-state.json`
- Teams state: `_bmad/orchestrator-teams-state.json`
- **Tmux State**: `_bmad/orchestrator-tmux-state.json`
- Always check state before spawning agents to avoid duplicates

## Quick Reference

| Action | Conduit Mode | Teams Mode | cmux Mode |
|--------|-------------|------------|-----------|
| Spawn agent | `conduit pane-split` | `Task` tool | `cmux new-split right` |
| Communicate | `terminal-write/read` | `SendMessage` | `cmux send --surface <ref>` |
| Wait | `terminal-wait` | Messages auto | `cmux wait-for` / poll `read-screen` |
| Kill agent | `conduit pane-close` | `shutdown_request` | `cmux close-surface --surface <ref>` |
| Track state | orchestrator-state.json | Native TaskList | orchestrator-state.json |
| Read output | `terminal-read` | Messages auto | `cmux read-screen --surface <ref> --scrollback` |

## Tmux Quick Reference

| Action | Command |
|--------|---------|
| Probe session | `tmux has-session -t <name>` |
| Check claude | `tmux list-panes -t <name> -F '#{pane_current_command}'` |
| Send command | `tmux send-keys -t <name> '<cmd>' Enter` |
| Read output | `tmux capture-pane -t <name> -p -S -50` |
| Create session | `tmux new-session -d -s <name> -c <dir>` |
| Start claude | `tmux send-keys -t <name> 'unset CLAUDECODE && claude --dangerously-skip-permissions' Enter` |
| Recovery | `/tmux-recovery` |
| State file | `_bmad/orchestrator-tmux-state.json` |
| Template | `_bmad/orchestrator-tmux-state.template.json` |
