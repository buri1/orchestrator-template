# Orchestrator State Machine

## States

```
┌─────────────┐
│    IDLE     │ ←───────────────────────────────────────┐
└──────┬──────┘                                         │
       │ user: "story X"                                │
       ▼                                                │
┌─────────────┐                                         │
│  SPAWNING   │ → spawn dev agent                       │
└──────┬──────┘                                         │
       │ agent ready                                    │
       ▼                                                │
┌─────────────┐                                         │
│   WORKING   │ → dev agent implementing                │
└──────┬──────┘                                         │
       │ PR created                                     │
       ▼                                                │
┌─────────────┐                                         │
│ PR_WATCHING │ → polling for reviews                   │
└──────┬──────┘                                         │
       │ review detected                                │
       ▼                                                │
┌─────────────┐                                         │
│  ANALYZING  │ → parse review, categorize              │
└──────┬──────┘                                         │
       │                                                │
       ├─── no fixes needed ───────────────────────────►│
       │                                                │
       │ fixes needed                                   │
       ▼                                                │
┌─────────────┐                                         │
│   FIXING    │ → spawn fix agent                       │
└──────┬──────┘                                         │
       │ fixes pushed                                   │
       │                                                │
       └─────────────────► PR_WATCHING ─────────────────┘
```

---

## State Definitions

### IDLE
```yaml
state: IDLE
description: Orchestrator wartet auf User-Input
allowed_inputs:
  - story_id: "Start Story X.Y"
  - pr: "PR Review für aktuelle PR"
  - status: "Zeige aktuellen Status"
  - help: "Zeige verfügbare Commands"
transitions:
  story_id → SPAWNING
  pr → ANALYZING (skip to PR review)
```

### SPAWNING
```yaml
state: SPAWNING
description: Dev Agent wird in neuem Pane gestartet
actions:
  - conduit pane-split
  - conduit terminal-write "claude"
  - conduit terminal-write "/bmad_bmm_agent_dev"
  - conduit terminal-write "{story_id}"
context:
  story_id: string
  pane_id: string (after spawn)
transitions:
  success → WORKING
  failure → IDLE (notify user)
timeout: 60s
```

### WORKING
```yaml
state: WORKING
description: Dev Agent arbeitet an Story
monitoring:
  - Poll pane output for errors
  - Watch for PR creation
context:
  story_id: string
  pane_id: string
  branch: "feature/story-{story_id}"
transitions:
  pr_created → PR_WATCHING
  error → IDLE (notify user)
  user_abort → IDLE
```

### PR_WATCHING
```yaml
state: PR_WATCHING
description: Wartet auf Code Review
actions:
  - Poll: gh pr view {number} --json reviews,comments
  - Every 60 seconds
context:
  pr_number: int
  last_review_count: int
transitions:
  new_review → ANALYZING
  pr_merged → IDLE (success!)
  user_abort → IDLE
timeout: 2h (then ask user)
```

### ANALYZING
```yaml
state: ANALYZING
description: Review wird analysiert
actions:
  - Fetch PR body
  - Fetch comments (latest commit only)
  - Categorize: Critical/Important/Nice-to-have
  - Present to user
context:
  pr_number: int
  review_findings: object
user_decision_required: true
transitions:
  user_fix → FIXING
  user_skip → PR_WATCHING (or IDLE if approved)
  user_manual → IDLE (user handles it)
```

### FIXING
```yaml
state: FIXING
description: Fix Agent arbeitet an Review-Findings
actions:
  - Spawn new Dev Agent (or reuse pane)
  - Send "PR" command
  - Wait for fixes + push
context:
  pr_number: int
  fix_pane_id: string
  findings_to_fix: array
transitions:
  fixes_pushed → PR_WATCHING
  error → IDLE (notify user)
```

---

## Context Store

Der Orchestrator muss State zwischen Commands speichern:

```typescript
interface OrchestratorContext {
  // Current state
  state: State;

  // Active story
  currentStory?: {
    id: string;          // "0.2"
    paneId: string;      // Conduit pane ID
    branch: string;      // "feature/story-0.2"
    startedAt: Date;
  };

  // Active PR
  currentPR?: {
    number: number;
    url: string;
    lastReviewCount: number;
    lastCheckedAt: Date;
  };

  // Review findings
  reviewFindings?: {
    critical: Finding[];
    important: Finding[];
    niceToHave: Finding[];
    analyzedAt: Date;
  };

  // History
  completedStories: string[];
}
```

---

## Commands

### User Commands

| Command | From State | Action |
|---------|------------|--------|
| `story X.Y` | IDLE | Start story implementation |
| `status` | ANY | Show current state + context |
| `pr` | IDLE | Jump to PR review for current branch |
| `skip` | ANALYZING | Skip fixes, continue watching |
| `fix` | ANALYZING | Start fix agent |
| `abort` | ANY | Stop current operation, return to IDLE |
| `next` | IDLE | Suggest next story based on dependencies |

### Internal Triggers

| Trigger | Detection | Action |
|---------|-----------|--------|
| PR Created | `gh pr list` returns result | → PR_WATCHING |
| Review Added | review/comment count increased | → ANALYZING |
| Fixes Pushed | new commit on PR | → PR_WATCHING |
| PR Merged | PR state = "merged" | → IDLE + celebrate |

---

## Persistence

Für Session-übergreifenden State (optional):

```bash
# State file
~/.bmad/orchestrator-state.json

# Or project-local
.bmad/orchestrator-state.json
```

Ermöglicht:
- Orchestrator neustarten ohne Context-Verlust
- Mehrere Orchestrators für verschiedene Projekte
