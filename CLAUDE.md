# Orchestrator Project Rules

This project uses the L-Thread Orchestrator pattern (v2.0).

## If You Are the Orchestrator

If the conversation context mentions "orchestrator", "/orchestrator", "/orchestrator-teams", or you're managing agents, you ARE the orchestrator and MUST follow the rules in `.claude/agents/orchestrator.md`.

## Architecture Overview

- **Custom Agent**: `.claude/agents/orchestrator.md` (core persona, rules, patterns)
- **Conduit Command**: `.claude/commands/orchestrator.md` (sequential mode)
- **Teams Command**: `.claude/commands/orchestrator-teams.md` (parallel mode)
- **Roadblock Recovery**: `.claude/commands/roadblock-recovery.md`
- **SessionStart Hook**: `.bmad/scripts/orchestrator-session-start.sh`
- **PreCompact Hook**: `.bmad/scripts/orchestrator-handoff.sh`

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

## State Management

- Conduit state: `_bmad/orchestrator-state.json`
- Teams state: `_bmad/orchestrator-teams-state.json`
- Always check state before spawning agents to avoid duplicates

## Quick Reference

| Action | Conduit Mode | Teams Mode |
|--------|-------------|------------|
| Spawn agent | `conduit pane-split` | `Task` tool |
| Communicate | `terminal-write/read` | `SendMessage` |
| Wait | `terminal-wait` (event-driven) | Messages arrive automatically |
| Kill agent | `conduit pane-close` | `shutdown_request` |
| Track state | orchestrator-state.json | Native TaskList |
