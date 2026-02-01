# Orchestrator Workflow Diagramm

## High-Level Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATOR AGENT                                  │
│                        (Main Claude Session)                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ User: "Starte Story 0.2"
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: STORY START                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. conduit pane-split right -t terminal                                       │
│ 2. conduit terminal-write -e "cd /project && claude"                          │
│ 3. conduit terminal-wait -t 10                                                │
│ 4. conduit terminal-write -e "/bmad_bmm_agent_dev"                            │
│ 5. conduit terminal-wait -t 5                                                 │
│ 6. conduit terminal-write -e "0.2"                                            │
│ 7. Speichere pane-id für später                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Dev Agent arbeitet...
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: PR WATCH                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Loop every 30s:                                                               │
│   pr_data=$(gh pr list --head "feature/story-0.2" --json number,state)        │
│   if pr_data not empty:                                                       │
│     PR_NUMBER = extract number                                                │
│     conduit notify "PR #$PR_NUMBER erstellt!"                                 │
│     → PHASE 3                                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ PR existiert
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: REVIEW WATCH                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Loop every 60s:                                                               │
│   review=$(gh pr view $PR_NUMBER --json reviews,comments)                     │
│   if new review exists:                                                       │
│     Parse review content                                                      │
│     if CodeRabbit/AI review:                                                  │
│       conduit notify "Code Review ist da!"                                    │
│       → PHASE 4                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Review da
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: REVIEW ANALYSIS                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1. Hole PR description (AI summary)                                           │
│ 2. Hole Comments vom letzten Commit:                                          │
│    latest_commit=$(gh pr view --json commits -q '.commits[-1].oid')           │
│    comments=$(gh api pulls/$PR_NUMBER/comments)                               │
│    filter: original_commit_id == latest_commit                                │
│ 3. Analysiere:                                                                │
│    - Critical: Security, Breaking, Bugs                                       │
│    - Important: Performance, Best Practices                                   │
│    - Nice-to-have: Style, Nitpicks                                            │
│ 4. Frage User: "Review analysiert. Soll ich Fixes starten?"                   │
│    - Ja → PHASE 5                                                             │
│    - Nein / Skip → PHASE 6                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│ PHASE 5: FIX AGENT              │ │ PHASE 6: NEXT STORY             │
├─────────────────────────────────┤ ├─────────────────────────────────┤
│ 1. Spawne neuen Dev Agent       │ │ 1. Merge PR (wenn approved)     │
│ 2. Sende "PR" command           │ │ 2. Frage: "Nächste Story?"      │
│ 3. Agent analysiert + fixt      │ │ 3. User gibt Story-ID           │
│ 4. Nach Push → PHASE 3          │ │ 4. → PHASE 1                    │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

---

## Detaillierte Phasen

### Phase 1: Story Start

```bash
# Input: story_id (e.g. "0.2")
# Output: pane_id

spawn_dev_agent() {
    local story_id=$1

    # Split pane
    conduit pane-split right -t terminal
    sleep 0.5

    # Get new pane ID
    local pane_id=$(conduit pane-list --json | jq -r '.[-1].id')

    # Setup
    conduit terminal-write -p "$pane_id" -e "cd $(pwd)"
    conduit terminal-wait -p "$pane_id" -t 5

    conduit terminal-write -p "$pane_id" -e "claude"
    conduit terminal-wait -p "$pane_id" -t 10

    conduit terminal-write -p "$pane_id" -e "/bmad_bmm_agent_dev"
    conduit terminal-wait -p "$pane_id" -t 5

    conduit terminal-write -p "$pane_id" -e "$story_id"

    echo "$pane_id"
}
```

### Phase 2: PR Watch

```bash
# Input: branch_name (e.g. "feature/story-0.2")
# Output: pr_number when PR created

watch_for_pr() {
    local branch=$1
    local timeout=${2:-1800}  # 30 min default
    local interval=30
    local elapsed=0

    while [ $elapsed -lt $timeout ]; do
        local pr=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null)

        if [ -n "$pr" ]; then
            conduit notify "PR #$pr erstellt für $branch"
            echo "$pr"
            return 0
        fi

        sleep $interval
        elapsed=$((elapsed + interval))
    done

    return 1  # timeout
}
```

### Phase 3: Review Watch

```bash
# Input: pr_number
# Output: returns when new review detected

watch_for_review() {
    local pr_number=$1
    local last_review_count=0
    local interval=60

    while true; do
        # Get review count
        local review_count=$(gh pr view "$pr_number" --json reviews --jq '.reviews | length')

        # Get comment count (AI reviews often in comments)
        local comment_count=$(gh api "repos/{owner}/{repo}/pulls/$pr_number/comments" --jq 'length')

        local total=$((review_count + comment_count))

        if [ $total -gt $last_review_count ]; then
            conduit notify "Neue Review-Aktivität auf PR #$pr_number"
            last_review_count=$total
            return 0
        fi

        sleep $interval
    done
}
```

### Phase 4: Review Analysis

```bash
# Input: pr_number
# Output: categorized findings

analyze_review() {
    local pr_number=$1

    # Get PR body (often contains AI summary)
    local pr_body=$(gh pr view "$pr_number" --json body --jq '.body')

    # Get latest commit
    local latest_commit=$(gh pr view "$pr_number" --json commits --jq '.commits[-1].oid')

    # Get comments for latest commit only
    local comments=$(gh api "repos/{owner}/{repo}/pulls/$pr_number/comments" \
        --jq "[.[] | select(.original_commit_id == \"$latest_commit\")]")

    # Output for Claude to analyze
    echo "=== PR BODY ==="
    echo "$pr_body"
    echo ""
    echo "=== LATEST COMMIT COMMENTS ==="
    echo "$comments"
}
```

---

## User Interaction Points

Der Orchestrator fragt den User bei:

1. **Story Start:** "Welche Story soll ich starten?"
2. **Review da:** "Review ist da. Analysieren?"
3. **Nach Analyse:** "X Critical, Y Important. Fixes starten?"
4. **Komplexe Fixes:** "Dieser Fix ist komplex: [details]. Soll ich trotzdem?"
5. **PR Approved:** "PR approved! Mergen oder warten?"
6. **Nächste Story:** "Story 0.2 fertig. Nächste Story?"

---

## Error Handling

| Situation | Aktion |
|-----------|--------|
| Claude startet nicht | Retry 3x, dann User notifizieren |
| PR Watch timeout | User fragen ob weiter warten |
| Review parsing failed | Raw output zeigen, User entscheiden lassen |
| Merge conflict | User notifizieren, nicht auto-resolven |
| Tests failing | User notifizieren, Dev Agent bleibt offen |
