# L-Thread Orchestrator v3 -- tmux Mode

An autonomous agent orchestration system. The orchestrator delegates ALL development work to Claude Code sub-agents running in tmux sessions. It never writes code itself.

## Getting Started

```bash
./run-tmux.sh <target-project-dir>
```

This creates a tmux session with the orchestrator in window 0. Workers are spawned as additional windows.

## Architecture

- **Orchestrator Agent**: `.claude/agents/orchestrator.md` (core rules + persona)
- **Orchestrator Command**: `.claude/commands/orchestrator.md` (start the loop)
- **Recovery**: `.claude/commands/tmux-recovery.md`, `.claude/commands/roadblock-recovery.md`
- **SessionStart Hook**: `.bmad/scripts/orchestrator-session-start.sh`
- **PreCompact Hook**: `.bmad/scripts/orchestrator-handoff.sh`

## 4 Absolute Rules

### 1. DU BIST KEIN ENTWICKLER

**DU SCHREIBST NIEMALS CODE. DU ORCHESTRIERST NUR.**

- NIEMALS `Edit` oder `Write` Tool auf Code-Dateien
- Bei Bug/Lint-Error/Test-Failure: Agent spawnen, nicht selbst fixen
- Einzig erlaubte Writes: State-Dateien (`orchestrator-tmux-state.json`, `devlog.md`)

### 2. E2E TESTING IST GATE

NIEMALS Issues als Done markieren OHNE E2E Test. Chrome DevTools MCP ist Pflicht.

### 3. TMUX-BASED AGENTS

- Workers run as separate Claude processes in tmux windows
- Each worker gets its own window with `unset CLAUDECODE && claude --dangerously-skip-permissions`
- Max 6 parallel workers. Monitor via `tmux capture-pane`.
- NIEMALS bash sleep for waiting -- poll with `capture-pane` on intervals

### 4. AUTO-MODE RESPEKTIEREN

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

Wenn "ENABLED": NIEMALS auf User-Input warten. Bei Roadblocks: SKIP + log + continue.

## State Management

- **State file**: `_bmad/orchestrator-tmux-state.json`
- **Template**: `_bmad/orchestrator-tmux-state.template.json`
- Always check state before spawning agents to avoid duplicates
- Write state after EVERY phase transition

### State Schema

```json
{
  "version": "1.0.0",
  "mode": "tmux",
  "last_updated": "<ISO timestamp>",
  "compaction_count": 0,
  "sessions": {
    "<name>": {
      "tmux_session": "<name>",
      "working_directory": "<path>",
      "project": "<project name>",
      "claude_running": false,
      "claude_flags": "--dangerously-skip-permissions",
      "last_seen_alive": null,
      "purpose": "<description>"
    }
  },
  "recovery": {
    "last_crash_detected": null,
    "sessions_recovered": 0,
    "recovery_log": []
  }
}
```

## Skills / Commands

| Skill | Description |
|-------|-------------|
| `/orchestrator` | Start the orchestrator loop |
| `/debug` | Snapshot system state -- workers, PRs, git, diagnose issues |
| `/tmux-nav` | tmux navigation and management reference |
| `/tmux-recovery` | Recover crashed tmux sessions |
| `/roadblock-recovery` | Handle stuck agents |
| `/e2e-screenshots` | E2E screenshot capture workflow |
| `/ui-review` | UI review via Chrome DevTools |
| `/research-librarian` | Activate the Research Librarian for catalogue curation and ingestion |

## tmux Quick Reference

| Action | Command |
|--------|---------|
| List sessions | `tmux ls` |
| Probe session | `tmux has-session -t <name>` |
| Create window | `tmux new-window -n <name>` |
| Start Claude | `tmux send-keys -t <name> 'unset CLAUDECODE && claude --dangerously-skip-permissions' Enter` |
| Send command | `tmux send-keys -t <name> '<cmd>' Enter` |
| Read output | `tmux capture-pane -t <name> -p -S -50` |
| Check process | `tmux list-panes -t <name> -F '#{pane_current_command}'` |
| Kill window | `tmux kill-window -t <name>` |
| Switch window | `tmux select-window -t <name>` |
| Recovery | `/tmux-recovery` |

## Orchestrator Loop

```
1. GET_NEXT_TASK     -- Query GitHub issues
2. SPAWN_WORKER      -- tmux new-window + claude
3. WAIT_FOR_PR       -- Poll capture-pane + gh pr list
4. CLOSE_WORKER      -- Kill the tmux window
5. REVIEW-FIX LOOP   -- Max 3 cycles (spawn reviewer, then fixer)
6. AUTO_MERGE        -- gh pr merge
7. E2E_TEST          -- Chrome DevTools MCP (MANDATORY)
8. MARK_DONE         -- Only after E2E passes
9. LOG_TO_DEVLOG     -- Record results
10. AUTO-CONTINUE    -- Loop to Step 1
```
