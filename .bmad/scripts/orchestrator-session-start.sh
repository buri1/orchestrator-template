#!/bin/bash
# Orchestrator SessionStart Hook
# Called after EVERY session start, including after compaction
# Outputs JSON with additionalContext to inject rules + state DETERMINISTICALLY

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_FILE="$PROJECT_DIR/_bmad/orchestrator-state.json"
AUTO_MODE_FILE="$PROJECT_DIR/.bmad/AUTO_MODE"

# === Read current state ===
if [ -f "$STATE_FILE" ]; then
    PHASE=$(cat "$STATE_FILE" | jq -r '.current_session.phase // "idle"')
    STORY_ID=$(cat "$STATE_FILE" | jq -r '.current_story.id // "none"')
    PANE_ID=$(cat "$STATE_FILE" | jq -r '.current_agent.pane_id // "none"')
    PR_NUMBER=$(cat "$STATE_FILE" | jq -r '.current_session.current_pr.number // "none"')
    STORIES_DONE=$(cat "$STATE_FILE" | jq -r '.progress.stories_completed // 0')
else
    PHASE="idle"
    STORY_ID="none"
    PANE_ID="none"
    PR_NUMBER="none"
    STORIES_DONE="0"
fi

# === Check AUTO_MODE ===
if [ -f "$AUTO_MODE_FILE" ] && grep -q "ENABLED" "$AUTO_MODE_FILE" 2>/dev/null; then
    AUTO_MODE="ENABLED"
else
    AUTO_MODE="DISABLED"
fi

# === Build the injection context ===
# This is DETERMINISTIC - the agent CANNOT ignore this
read -r -d '' CONTEXT << 'RULES' || true
⛔⛔⛔ ORCHESTRATOR ABSOLUTE RULES ⛔⛔⛔

DU BIST DER ORCHESTRATOR. Diese Regeln sind NICHT optional:

1️⃣ DU SCHREIBST NIEMALS CODE
   - NIEMALS Edit/Write auf Code-Dateien
   - Bei Bugs → Spawn Agent via Conduit
   - Mental-Check: "Schreibe ich Code? → STOP → Agent spawnen"

2️⃣ NUR CONDUIT CLI FÜR AGENTS
   - NICHT das Task tool (subagents)
   - Echte Sessions: conduit pane-split → terminal-write → terminal-wait

3️⃣ NIEMALS BASH SLEEP
   - FALSCH: sleep 60 && ...
   - RICHTIG: conduit terminal-wait -p <pane-id> -t 1800
   - terminal-wait ist EVENT-DRIVEN (returned sofort wenn idle)

4️⃣ AUTO-MODE CHECK
   - Wenn AUTO_MODE=ENABLED: NIEMALS AskUserQuestion, NIEMALS pausieren
   - Bei Roadblocks: SKIP + log + continue

RULES

# Add state info
CONTEXT="$CONTEXT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AKTUELLER STATE (nach Compaction wiederhergestellt):
- Phase: $PHASE
- Story: $STORY_ID
- Pane ID: $PANE_ID
- PR: $PR_NUMBER
- Stories done: $STORIES_DONE
- AUTO_MODE: $AUTO_MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wenn Phase != idle: Prüfe ob Pane noch existiert mit 'conduit pane-list'
Dann setze die Arbeit fort - OHNE nochmal /orchestrator aufzurufen!
"

# === Output JSON for Claude Code hook system ===
# Escape the context for JSON
ESCAPED_CONTEXT=$(echo "$CONTEXT" | jq -Rs .)

echo "{\"additionalContext\": $ESCAPED_CONTEXT}"
