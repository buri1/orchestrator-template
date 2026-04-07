# Orchestrator Debug

> Snapshot the entire orchestrator system: state, workers, PRs, git, and diagnose issues.
> Run this when something feels off, or before/after major phase transitions.

---

## STEP 1: READ STATE FILE

```bash
cat _bmad/orchestrator-state.json 2>/dev/null || echo "No state file found"
```

Parse and display: current phase, current story, active workers, stats (stories completed, PRs merged, etc.).

If no state file exists, note it as an issue and continue.

---

## STEP 2: CHECK AUTO_MODE

```bash
cat .bmad/AUTO_MODE 2>/dev/null || echo "NOT SET"
```

Record whether AUTO_MODE is ENABLED or DISABLED.

---

## STEP 3: CHECK TMUX WINDOWS

```bash
tmux list-windows -F '#{window_index}: #{window_name} (active=#{window_activity_flag})' 2>/dev/null || echo "No tmux session"
```

List all windows. Identify which are orchestrator vs worker windows.

---

## STEP 4: READ WORKER OUTPUT

For each worker window (any window NOT named "orchestrator"):

```bash
for win in $(tmux list-windows -F '#{window_name}' 2>/dev/null | grep -v orchestrator); do
  echo "=== $win ==="
  tmux capture-pane -t "$win" -p -S -30
  echo ""
done
```

Summarize the last meaningful output from each worker (last command, errors, waiting state).

---

## STEP 5: CHECK GITHUB PR STATUS

```bash
gh pr list --state all --limit 10
```

List recent PRs with their state (OPEN, MERGED, CLOSED).

---

## STEP 6: CHECK GIT STATUS

```bash
git status --short
git log --oneline -5
```

Note any uncommitted changes or divergence from remote.

---

## STEP 7: DIAGNOSE ISSUES

Cross-reference ALL collected data and check for these common problems:

| Condition | Diagnosis |
|-----------|-----------|
| Worker window exists but `pane_current_command` is `zsh`/`bash` (not `claude`) | Worker crashed -- needs restart |
| State says `waiting_for_pr` but a matching PR already exists on GitHub | Stale state -- advance phase to `e2e_testing` or `merging` |
| State says `merging` but the PR is already MERGED | Stale state -- advance phase to next story or `idle` |
| No worker windows but phase is not `idle` | Orphaned state -- reset to `idle` or spawn workers |
| AUTO_MODE is ENABLED but orchestrator is idle with pending stories | Orchestrator stuck -- needs kick |
| Git has uncommitted changes in the target project | Dirty working tree -- commit or stash before next phase |
| Multiple PRs open for the same story | Duplicate work -- close the stale PR |

---

## STEP 8: OUTPUT REPORT

Present a clean markdown summary combining everything:

```
## Orchestrator Debug Report

### State
- Phase: <phase>
- Story: <story_id> -- <story_title>
- Branch: <branch>
- PR: #<number>
- AUTO_MODE: ENABLED|DISABLED

### Workers
| Window | Process | Last Output (summary) |
|--------|---------|----------------------|
| worker-1 | claude | "Running tests..." |
| worker-2 | zsh | (idle -- no claude running) |

### GitHub PRs
| PR | Title | State |
|----|-------|-------|
| #4 | Portal Homepage | OPEN |
| #3 | Navigation Baseline | MERGED |

### Git
- Branch: feature/1.3-portal-homepage
- Clean: yes|no
- Last 3 commits: ...

### Issues Detected
- <issue 1 with explanation>
- <issue 2 with explanation>
(or "No issues detected" if everything looks healthy)

### Suggested Actions
1. <specific actionable step>
2. <specific actionable step>
(or "System is healthy -- no action needed")
```

---

## NOTES

- This command is READ-ONLY. It does not modify state or take corrective action.
- To fix detected issues, use `/tmux-recovery` (for crashed sessions) or `/roadblock-recovery` (for stuck agents).
- If AUTO_MODE is ENABLED and the orchestrator is stuck, the suggested action should include the exact command to resume.
