#!/bin/bash
# Orchestrator SessionStart Hook v3 (Mode-Agnostic)
# Called after EVERY session start, including after compaction.
# Outputs JSON with additionalContext to inject rules + state.
#
# Supports both Conduit Mode and Teams Mode.
# Mode detection happens at the agent level, not here -- this hook
# provides the same state injection regardless of mode.

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
AUTO_MODE_FILE="$PROJECT_DIR/.bmad/AUTO_MODE"

# === Determine which state file exists ===
CONDUIT_STATE="$PROJECT_DIR/_bmad/orchestrator-state.json"
TEAMS_STATE="$PROJECT_DIR/_bmad/orchestrator-teams-state.json"

# Prefer teams state if it exists and has active data, else conduit state
if [ -f "$TEAMS_STATE" ]; then
    STATE_FILE="$TEAMS_STATE"
    DETECTED_MODE="teams"
elif [ -f "$CONDUIT_STATE" ]; then
    STATE_FILE="$CONDUIT_STATE"
    DETECTED_MODE="conduit"
else
    STATE_FILE=""
    DETECTED_MODE="unknown"
fi

# === Read current state ===
if [ -n "$STATE_FILE" ] && [ -f "$STATE_FILE" ]; then
    PHASE=$(cat "$STATE_FILE" | jq -r '.phase // .current_session.phase // "idle"')
    MODE=$(cat "$STATE_FILE" | jq -r '.mode // "'"$DETECTED_MODE"'"')
    VERSION=$(cat "$STATE_FILE" | jq -r '.version // "2.0.0"')
    TARGET_BRANCH=$(cat "$STATE_FILE" | jq -r '.target_branch // "main"')

    # Conduit-specific fields
    STORY_ID=$(cat "$STATE_FILE" | jq -r '.current_story.id // "none"')
    PANE_ID=$(cat "$STATE_FILE" | jq -r '.current_agent.pane_id // "none"')
    PR_NUMBER=$(cat "$STATE_FILE" | jq -r '.current_session.current_pr.number // .current_story.pr_number // "none"')
    STORIES_DONE=$(cat "$STATE_FILE" | jq -r '.progress.stories_completed // .stories_completed // 0')

    # Teams-specific fields
    TEAM_NAME=$(cat "$STATE_FILE" | jq -r '.team_name // "none"')
    TASKS_TOTAL=$(cat "$STATE_FILE" | jq -r '.sprint_metrics.tasks_total // 0')
    TASKS_MERGED=$(cat "$STATE_FILE" | jq -r '.sprint_metrics.tasks_merged // 0')
else
    PHASE="idle"
    MODE="$DETECTED_MODE"
    VERSION="2.0.0"
    TARGET_BRANCH="main"
    STORY_ID="none"
    PANE_ID="none"
    PR_NUMBER="none"
    STORIES_DONE="0"
    TEAM_NAME="none"
    TASKS_TOTAL="0"
    TASKS_MERGED="0"
fi

# === Check AUTO_MODE ===
if [ -f "$AUTO_MODE_FILE" ] && grep -q "ENABLED" "$AUTO_MODE_FILE" 2>/dev/null; then
    AUTO_MODE="ENABLED"
else
    AUTO_MODE="DISABLED"
fi

# === Build the injection context ===
read -r -d '' CONTEXT << 'RULES' || true
ORCHESTRATOR SESSION CONTEXT (Tier 1 -- injected by SessionStart hook)

ABSOLUTE RULES (see .claude/agents/orchestrator.md for full details):

1. DU SCHREIBST NIEMALS CODE
   - NIEMALS Edit/Write auf Code-Dateien
   - Bei Bugs: Spawn Agent (Conduit CLI oder Teams SendMessage)
   - Einzige erlaubte Writes: State-Dateien, devlog.md

2. E2E TESTING IST GATE VOR DONE (INC-014, INC-015)
   - Chrome DevTools MCP PFLICHT (nicht nur curl)
   - NIEMALS Issues als Done OHNE E2E Test

3. NIEMALS BASH SLEEP (Conduit Mode)
   - conduit terminal-wait ist event-driven (returned sofort wenn idle)

4. STATE NACH JEDER PHASE UPDATEN
   - Write tool fuer State Updates (nicht bash heredoc)

RULES

# Add state info
CONTEXT="$CONTEXT

CURRENT STATE:
- Mode: $MODE (detected: $DETECTED_MODE)
- Phase: $PHASE
- Version: $VERSION
- Target Branch: $TARGET_BRANCH
- AUTO_MODE: $AUTO_MODE"

# Add mode-specific state
if [ "$DETECTED_MODE" = "conduit" ]; then
    CONTEXT="$CONTEXT
- Story: $STORY_ID
- Pane ID: $PANE_ID
- PR: $PR_NUMBER
- Stories done: $STORIES_DONE

If Phase != idle: Check if Pane still exists with 'conduit pane-list'.
Then continue work -- do NOT re-invoke /orchestrator!"
fi

if [ "$DETECTED_MODE" = "teams" ]; then
    CONTEXT="$CONTEXT
- Team: $TEAM_NAME
- Tasks total: $TASKS_TOTAL
- Tasks merged: $TASKS_MERGED

If Phase != idle: Check TaskList for active tasks.
Then continue work -- do NOT re-invoke /orchestrator-teams!"
fi

# Add FutureLearnings hint
CONTEXT="$CONTEXT

ROADBLOCK RECOVERY:
If you encounter errors, read memory/FutureLearnings.md for documented solutions.
Use /roadblock-recovery for structured incident lookup.
Key rules: prepare:false (INC-001), E2E before Done (INC-014/015), Chrome MCP retry 3x (INC-013)"

# Add briefing reference if exists
BRIEFING_FILE="$PROJECT_DIR/_bmad/overnight-orchestrator-briefing.md"
if [ -f "$BRIEFING_FILE" ]; then
    CONTEXT="$CONTEXT

BRIEFING AVAILABLE: Read _bmad/overnight-orchestrator-briefing.md for sprint context."
fi

TEAMS_BRIEFING="$PROJECT_DIR/_bmad/teams-fix-sprint-briefing.md"
if [ -f "$TEAMS_BRIEFING" ]; then
    CONTEXT="$CONTEXT

TEAMS BRIEFING AVAILABLE: Read _bmad/teams-fix-sprint-briefing.md for sprint context."
fi

# === Output JSON for Claude Code hook system ===
ESCAPED_CONTEXT=$(echo "$CONTEXT" | jq -Rs .)

echo "{\"additionalContext\": $ESCAPED_CONTEXT}"
