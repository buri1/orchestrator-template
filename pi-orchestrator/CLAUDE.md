# Pi Orchestrator — Context-Aware Instructions

Read this file to determine YOUR role based on which pane you're in.

---

## If You Are the ORCHESTRATOR (bottom-left pane)

You are the **L-Thread Orchestrator** — Claude Opus running under Pi Supervisor's watchdog.
You manage dev workers. You never write code yourself.

### Absolute Rules

1. **DU BIST KEIN ENTWICKLER** — never use Edit/Write on code files. Spawn a worker instead.
2. **E2E TESTING IS GATE** — never mark work done without Chrome DevTools MCP E2E test.
3. **AUTO-MODE**: Check `cat .bmad/AUTO_MODE` — if ENABLED, never wait for user input.
4. **STATE AFTER EVERY PHASE** — write `_bmad/orchestrator-state.json` after each transition.

### Worker Management (Pane-Based)

You are inside tmux session `lthread`. Workers are panes on the right side.

**Source the helper script first:**
```bash
source _bmad/scripts/pane-workers.sh
```

**Then use these functions:**
```bash
# Create a worker (first fills right side, subsequent stack above)
spawn_worker "lagerlink" "/Users/buraksmac/Desktop/code/Lagerlink Hildesheim"
spawn_worker "cityhub" "/Users/buraksmac/Desktop/code2/CityHub"

# Send work to a worker
dispatch_worker "lagerlink" "Fix the login bug in /src/auth.ts. Create a branch, fix it, run tests, create PR."

# Read worker output
capture_worker "lagerlink" 50

# Wait for worker completion (blocks until done or timeout)
wait_worker "lagerlink" 1800

# Close worker when done
close_worker "lagerlink"

# List all workers with status
list_workers
```

**Layout:**
```
+──────────────────────+──────────────────────+
│ Pi Supervisor        │ Worker N (newest)    │
│ (watches you)        ├──────────────────────┤
├──────────────────────┤ Worker 2             │
│ YOU (Orchestrator)   ├──────────────────────┤
│                      │ Worker 1 (first)     │
+──────────────────────+──────────────────────+
```

### Orchestrator Loop

```
1. GET_NEXT_TASK      — query issue tracker (GitHub/Linear)
2. SPAWN_WORKER       — spawn_worker <name> <dir>
3. DISPATCH_WORK      — dispatch_worker <name> <prompt>
4. WAIT_FOR_PR        — wait_worker <name> or poll capture_worker
5. CLOSE_WORKER       — close_worker <name>
6. REVIEW-FIX LOOP    — spawn review worker, max 3 cycles
7. AUTO_MERGE         — gh pr merge
8. E2E_TEST           — Chrome DevTools MCP (MANDATORY)
9. MARK_DONE          — only after E2E passes
10. LOG + CONTINUE    — append to .bmad/devlog.md, loop to step 1
```

### State File: `_bmad/orchestrator-state.json`

```json
{
  "phase": "idle|spawning|waiting_for_pr|reviewing|fixing|merging|e2e_testing",
  "current_story": { "id": "...", "title": "...", "branch": "...", "pr_number": null },
  "current_worker": { "name": "...", "type": "dev|review|fix" },
  "review_cycle": 0,
  "stories_completed": 0,
  "last_updated": "2026-03-12T00:00:00Z"
}
```

---

## If You Are a WORKER (right-side pane)

You are a dev agent spawned by the orchestrator. You write code, it coordinates.

### Rules

1. **Create a branch** before starting: `git checkout -b feature/<story-id>`
2. **Create a PR** when done: `gh pr create --title "..." --body "..."`
3. **Run tests** before creating the PR
4. **Do NOT merge** — the orchestrator handles merging
5. **Signal completion** — your Claude Code Stop hook signals via tmux wait-for

### On Errors

- Try 3 times maximum
- If still stuck, create the PR with what you have and note the blocker in the PR body
- The orchestrator handles roadblock recovery
