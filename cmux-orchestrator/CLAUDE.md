# L-Thread Orchestrator v4 — cmux Mode

An autonomous agent orchestration system built natively on cmux. The orchestrator delegates ALL development work to Claude Code agents running in visible cmux panes. It never writes code itself.

## Getting Started

```bash
./run.sh <target-project-dir>
```

This opens a cmux workspace with the orchestrator in the left pane. Workers are spawned as split panes on the right.

## Architecture

- **Orchestrator Agent**: `.claude/agents/orchestrator.md` (core rules + persona)
- **Overseer Agent**: `.claude/agents/overseer.md` (meta-monitor, nudges orchestrator)
- **Orchestrator Command**: `.claude/commands/orchestrator.md` (startup sequence)
- **cmux Helpers**: `scripts/cmux-helpers.sh` (CRUD for agents)
- **Stop Hook**: `scripts/cmux-stop-hook.sh` (signals `wait-for` on agent completion)
- **SessionStart Hook**: `scripts/session-start.sh`
- **PreCompact Hook**: `scripts/handoff.sh`

## 4 Absolute Rules

### 1. DU BIST KEIN ENTWICKLER

**DU SCHREIBST NIEMALS CODE. DU ORCHESTRIERST NUR.**

- NIEMALS `Edit` oder `Write` Tool auf Code-Dateien
- Bei Bug/Lint-Error/Test-Failure: Agent spawnen, nicht selbst fixen
- Einzig erlaubte Writes: State-Dateien (`_bmad/orchestrator-state.json`, `_bmad/devlog.md`)

### 2. E2E TESTING IST GATE

NIEMALS Stories als Done markieren OHNE E2E Test. cmux browser automation ist Pflicht.

### 3. CMUX-BASED AGENTS — EVENT-DRIVEN

- Workers run as visible Claude processes in cmux split panes
- Each worker gets its own surface via `cmux new-split`
- Completion signaled via `cmux wait-for -S "agent-<name>-done"` (Claude Code Stop hook)
- Orchestrator blocks on `cmux wait-for "agent-<name>-done"` — ZERO POLLING
- Max 8 parallel workers (configurable)
- NIEMALS `sleep` zum Warten — IMMER `wait-for` verwenden

### 4. AUTO-MODE RESPEKTIEREN

```bash
cat .bmad/AUTO_MODE 2>/dev/null
```

Wenn "ENABLED": NIEMALS auf User-Input warten. Bei Roadblocks: SKIP + log + continue.

## State Management

- **State file**: `_bmad/orchestrator-state.json`
- **Template**: `_bmad/orchestrator-state.template.json`
- Always check state before spawning agents to avoid duplicates
- Write state after EVERY phase transition

## cmux Quick Reference

| Action | Command |
|--------|---------|
| Split pane | `cmux new-split right` |
| Send text | `cmux send --surface <ref> "text\n"` |
| Send key | `cmux send-key --surface <ref> enter` |
| Read output | `cmux read-screen --surface <ref> --scrollback --lines 50` |
| Close pane | `cmux close-surface --surface <ref>` |
| Wait for signal | `cmux wait-for "signal-name" --timeout 1800` |
| Signal done | `cmux wait-for -S "signal-name"` |
| Notify | `cmux notify --title "Title" --body "Body"` |
| Set status | `cmux set-status <key> "value" --icon hammer --workspace "$ORCH_WORKSPACE"` |
| Set progress | `cmux set-progress 0.5 --label "Story 1.3" --workspace "$ORCH_WORKSPACE"` |
| Log | `cmux log --level info --source orchestrator "message" --workspace "$ORCH_WORKSPACE"` |
| Browser open | `cmux browser open http://localhost:3000` |
| Browser screenshot | `cmux browser screenshot --out /tmp/e2e.png` |
| Browser snapshot | `cmux browser snapshot --interactive` |
| Pipe output | `cmux pipe-pane --surface <ref> --command "cat > /tmp/agent-output.log"` |

## Orchestrator Loop

```
 1. GET_NEXT_TASK     — Query GitHub issues / epics file
 2. SPAWN_WORKER      — cmux new-split + claude (visible pane!)
 3. WAIT_FOR_DONE     — cmux wait-for "agent-<name>-done" (event-driven, instant)
 4. CHECK_PR          — gh pr list / read-screen for PR URL
 5. CLOSE_WORKER      — cmux close-surface
 6. REVIEW-FIX LOOP   — Max 3 cycles (spawn reviewer, then fixer)
 7. AUTO_MERGE        — gh pr merge
 8. E2E_TEST          — cmux browser automation (MANDATORY)
 9. MARK_DONE         — Only after E2E passes
10. LOG_TO_DEVLOG     — Record results + update sidebar
11. AUTO-CONTINUE     — Loop to Step 1
```

## Skills / Commands

| Skill | Description |
|-------|-------------|
| `/orchestrator` | Start the orchestrator loop |
| `/status` | Show current state, workers, progress |

## Output Format

When creating `.md` files, provide the cmux open command:
```
cmux markdown open ~/Desktop/code2/orchestrator/cmux-orchestrator/<path>
```
