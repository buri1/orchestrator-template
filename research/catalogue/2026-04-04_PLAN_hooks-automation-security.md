# Hooks, Automation & Security Plan — Obsidian Vault + Claude Code

> **Date:** 2026-04-04
> **Scope:** Concrete hook scripts, security policy, backup strategy, and integration plan
> **Depends on:** SYNTHESIS (obsidian-llm-wiki-second-brain.md), Finance Agent CLAUDE.md, existing hooks

---

## Architecture Overview

```
~/.claude/
  hooks/
    notify.sh                   # EXISTING — global notification (Ghostty focus/sound)
    session-start.sh            # NEW — vault bootstrap + context injection
    pre-compact.sh              # NEW — save context before compaction
    session-end.sh              # NEW — capture decisions + learnings
  skills/                       # EXISTING — global skills
  CLAUDE.md                     # EXISTING — global config

~/Desktop/code2/Finance-agent/
  .claude/hooks/
    finance-notify.sh           # EXISTING — finance-specific notifications
  scheduler/
    finance-worker.sh           # EXISTING — launchd-driven /check and /scan

~/Obsidian/                     # NEW — vault root (to be determined)
  VAULT-INDEX.md                # NEW — live dashboard, auto-generated
  .vault-lock                   # NEW — write-lock for concurrent agent protection
  _agent-workspace/             # NEW — agent-writable zone (Steph Ango pattern)
  _human/                       # Human-curated zone — agents READ ONLY

~/Desktop/code2/orchestrator/
  hooks/
    heartbeat.py                # NEW — proactive monitoring (Cole Medin pattern)
    heartbeat-config.json       # NEW — what to monitor, intervals, thresholds
```

---

## 1. SessionStart Hook

**Purpose:** Bootstrap context into every new Claude Code session. Load vault index, daily note state, active projects, and agent memory.

**Trigger:** Claude Code session initialization (settings.json `hooks.session_start`)

### Script: `~/.claude/hooks/session-start.sh`

```bash
#!/bin/bash
# SessionStart Hook — Context Bootstrap
# Loads vault index, active projects, daily note, and agent memory
# into Claude Code's context at session start.
#
# This hook is READ-ONLY. It never writes to the vault.
# Exit 0 = success, non-zero = warn user but don't block session.

set -euo pipefail

# --- Configuration ---
VAULT_ROOT="${OBSIDIAN_VAULT_PATH:-$HOME/Obsidian}"
ORCHESTRATOR_ROOT="$HOME/Desktop/code2/orchestrator"
FINANCE_ROOT="$HOME/Desktop/code2/Finance-agent"
LOG_FILE="$HOME/.claude/debug/session-start.log"
MAX_CONTEXT_LINES=500  # Hard cap to prevent context bloat

# --- Logging ---
mkdir -p "$(dirname "$LOG_FILE")"
log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }

log "=== SessionStart hook triggered ==="
log "CWD: $(pwd)"
log "VAULT_ROOT: $VAULT_ROOT"

# --- Output collector ---
# We build a single context block that gets injected into the session
CONTEXT=""
append() { CONTEXT="${CONTEXT}${1}\n"; }

append "## Session Context (auto-loaded by SessionStart hook)"
append "**Timestamp:** $(date +'%Y-%m-%d %H:%M:%S')"
append ""

# --- 1. Vault Index (if Obsidian vault exists) ---
if [ -f "$VAULT_ROOT/VAULT-INDEX.md" ]; then
    VAULT_INDEX=$(head -n 80 "$VAULT_ROOT/VAULT-INDEX.md" 2>/dev/null || echo "")
    if [ -n "$VAULT_INDEX" ]; then
        append "### Vault Index (first 80 lines)"
        append "$VAULT_INDEX"
        append ""
        log "Loaded VAULT-INDEX.md ($(echo "$VAULT_INDEX" | wc -l) lines)"
    fi
else
    log "No VAULT-INDEX.md found at $VAULT_ROOT"
fi

# --- 2. Today's Daily Note (if exists) ---
TODAY=$(date +%Y-%m-%d)
DAILY_NOTE="$VAULT_ROOT/daily/$TODAY.md"
if [ -f "$DAILY_NOTE" ]; then
    DAILY_CONTENT=$(head -n 50 "$DAILY_NOTE" 2>/dev/null || echo "")
    append "### Today's Daily Note ($TODAY)"
    append "$DAILY_CONTENT"
    append ""
    log "Loaded daily note: $DAILY_NOTE"
elif [ -d "$VAULT_ROOT/daily" ]; then
    # Find most recent daily note
    LATEST=$(ls -t "$VAULT_ROOT/daily/"*.md 2>/dev/null | head -1)
    if [ -n "$LATEST" ]; then
        LATEST_NAME=$(basename "$LATEST" .md)
        append "### Most Recent Daily Note ($LATEST_NAME)"
        append "*(No note for today yet. Last note: $LATEST_NAME)*"
        append ""
        log "No daily note for today. Latest: $LATEST"
    fi
fi

# --- 3. Active Projects Summary ---
# Scan for CLAUDE.md files in code2/ to detect active workspaces
ACTIVE_PROJECTS=""
for PROJECT_DIR in "$HOME/Desktop/code2"/*/; do
    if [ -f "${PROJECT_DIR}CLAUDE.md" ]; then
        PROJECT_NAME=$(basename "$PROJECT_DIR")
        # Get first line (usually the title)
        TITLE=$(head -n 1 "${PROJECT_DIR}CLAUDE.md" 2>/dev/null | sed 's/^#\s*//')
        ACTIVE_PROJECTS="${ACTIVE_PROJECTS}- **$PROJECT_NAME**: $TITLE\n"
    fi
done
if [ -n "$ACTIVE_PROJECTS" ]; then
    append "### Active Projects (with CLAUDE.md)"
    append "$ACTIVE_PROJECTS"
    log "Found active projects with CLAUDE.md"
fi

# --- 4. Finance Agent State (cross-project awareness) ---
if [ -f "$FINANCE_ROOT/memory/agent-state.json" ]; then
    # Extract only critical fields, not the full state
    LAST_CHECK=$(python3 -c "
import json, sys
try:
    with open('$FINANCE_ROOT/memory/agent-state.json') as f:
        state = json.load(f)
    last_check = state.get('last_check', 'unknown')
    handoff = state.get('session_handoff', {})
    next_action = handoff.get('next_action', '')
    open_count = len(handoff.get('open_todos', []))
    print(f'Last check: {last_check}')
    if next_action:
        print(f'Next action: {next_action}')
    if open_count > 0:
        print(f'Open TODOs: {open_count} items')
except Exception as e:
    print(f'Error reading state: {e}')
" 2>/dev/null || echo "Could not read finance state")
    append "### Finance Agent Status"
    append "$LAST_CHECK"
    append ""
    log "Loaded finance agent state summary"
fi

# --- 5. Orchestrator Recent Activity ---
if [ -d "$ORCHESTRATOR_ROOT/research/catalogue" ]; then
    RECENT_ENTRIES=$(ls -t "$ORCHESTRATOR_ROOT/research/catalogue/"*.md 2>/dev/null | head -5)
    if [ -n "$RECENT_ENTRIES" ]; then
        append "### Recent Research Entries"
        for ENTRY in $RECENT_ENTRIES; do
            ENTRY_NAME=$(basename "$ENTRY" .md)
            append "- $ENTRY_NAME"
        done
        append ""
        log "Listed recent research entries"
    fi
fi

# --- Size guard ---
TOTAL_LINES=$(echo -e "$CONTEXT" | wc -l)
if [ "$TOTAL_LINES" -gt "$MAX_CONTEXT_LINES" ]; then
    CONTEXT=$(echo -e "$CONTEXT" | head -n "$MAX_CONTEXT_LINES")
    CONTEXT="${CONTEXT}\n\n*(Context truncated at $MAX_CONTEXT_LINES lines)*"
    log "WARNING: Context truncated from $TOTAL_LINES to $MAX_CONTEXT_LINES lines"
fi

# --- Output ---
echo -e "$CONTEXT"
log "SessionStart hook completed. $TOTAL_LINES lines injected."
log "=== SessionStart hook done ==="

exit 0
```

### What it loads (and why):

| Source | Max Lines | Purpose |
|--------|-----------|---------|
| VAULT-INDEX.md | 80 | Live dashboard of vault state — what topics exist, what's active |
| Today's daily note | 50 | Current day's context, tasks, thoughts |
| Active projects | ~20 | Cross-project awareness — what other workspaces have CLAUDE.md |
| Finance state | ~5 | Critical: overdue deadlines, next action items |
| Recent research | ~5 | What was last ingested into the knowledge base |

**Total budget:** ~160 lines, well under the 500-line hard cap. This prevents context bloat while giving enough orientation.

---

## 2. PreCompact Hook

**Purpose:** Before Claude's automatic context compaction, save critical state that would otherwise be lost. This is the most important hook for long sessions.

**Trigger:** Claude Code's internal compaction event (settings.json `hooks.pre_compact`)

### Script: `~/.claude/hooks/pre-compact.sh`

```bash
#!/bin/bash
# PreCompact Hook — Save Critical Context Before Compaction
# When Claude's context window fills up, this hook fires BEFORE
# the automatic compaction/summarization. It persists decisions,
# learnings, and working state to files that survive compaction.
#
# WRITE TARGETS:
#   - ~/.claude/debug/pre-compact-snapshots/ (always)
#   - $VAULT_ROOT/_agent-workspace/compaction-logs/ (if vault exists)
#   - Project-specific memory files (if detected)

set -euo pipefail

# --- Configuration ---
VAULT_ROOT="${OBSIDIAN_VAULT_PATH:-$HOME/Obsidian}"
SNAPSHOT_DIR="$HOME/.claude/debug/pre-compact-snapshots"
LOG_FILE="$HOME/.claude/debug/pre-compact.log"
TIMESTAMP=$(date +'%Y-%m-%dT%H:%M:%S')
SNAPSHOT_FILE="$SNAPSHOT_DIR/snapshot_$(date +'%Y%m%d_%H%M%S').md"

# --- Setup ---
mkdir -p "$SNAPSHOT_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }
log "=== PreCompact hook triggered ==="

# --- Read compaction data from stdin ---
# Claude Code sends the current conversation summary as JSON via stdin
COMPACT_DATA=$(cat 2>/dev/null || echo "{}")
log "Received compaction data: $(echo "$COMPACT_DATA" | wc -c) bytes"

# --- Build snapshot ---
cat > "$SNAPSHOT_FILE" << SNAPSHOT_EOF
---
type: compaction-snapshot
timestamp: $TIMESTAMP
session_cwd: $(pwd)
---

# Pre-Compaction Snapshot — $TIMESTAMP

## Session Working Directory
$(pwd)

## Compaction Trigger Data
\`\`\`json
$COMPACT_DATA
\`\`\`

## Active File Context
$(git -C "$(pwd)" diff --name-only HEAD 2>/dev/null | head -20 || echo "Not a git repo or no changes")

## Uncommitted Changes Summary
$(git -C "$(pwd)" diff --stat 2>/dev/null | tail -5 || echo "N/A")
SNAPSHOT_EOF

log "Snapshot written to: $SNAPSHOT_FILE"

# --- Copy to vault agent workspace (if exists) ---
VAULT_COMPACT_DIR="$VAULT_ROOT/_agent-workspace/compaction-logs"
if [ -d "$VAULT_ROOT/_agent-workspace" ]; then
    mkdir -p "$VAULT_COMPACT_DIR"
    cp "$SNAPSHOT_FILE" "$VAULT_COMPACT_DIR/"
    log "Snapshot copied to vault: $VAULT_COMPACT_DIR"
fi

# --- Update project-specific memory (if in a known project) ---
CWD=$(pwd)

# Finance Agent
if [[ "$CWD" == *"Finance-agent"* ]]; then
    FINANCE_STATE="$HOME/Desktop/code2/Finance-agent/memory/agent-state.json"
    if [ -f "$FINANCE_STATE" ]; then
        # Add compaction timestamp without overwriting other fields
        python3 -c "
import json
with open('$FINANCE_STATE', 'r') as f:
    state = json.load(f)
state['last_compaction'] = '$TIMESTAMP'
state.setdefault('compaction_count', 0)
state['compaction_count'] += 1
with open('$FINANCE_STATE', 'w') as f:
    json.dump(state, f, indent=2, ensure_ascii=False)
" 2>/dev/null && log "Updated finance agent-state.json with compaction timestamp"
    fi
fi

# --- Cleanup old snapshots (keep last 50) ---
SNAPSHOT_COUNT=$(ls -1 "$SNAPSHOT_DIR"/snapshot_*.md 2>/dev/null | wc -l)
if [ "$SNAPSHOT_COUNT" -gt 50 ]; then
    ls -t "$SNAPSHOT_DIR"/snapshot_*.md | tail -n +51 | xargs rm -f
    log "Cleaned up old snapshots (kept 50, removed $(($SNAPSHOT_COUNT - 50)))"
fi

log "=== PreCompact hook done ==="
exit 0
```

### What it saves:

1. **Full snapshot** to `~/.claude/debug/pre-compact-snapshots/` -- timestamped, never deleted (50 retained)
2. **Vault copy** to `_agent-workspace/compaction-logs/` if the vault exists -- searchable from Obsidian
3. **Project state update** -- adds `last_compaction` timestamp to project-specific memory files

### Why this matters:

Without PreCompact, a long Finance Agent session where you analyze 10 creditor emails, decide on a strategy for 3 of them, and draft responses -- all of that strategic reasoning is compressed into a brief summary when compaction fires. The snapshot preserves the full picture.

---

## 3. SessionEnd Hook

**Purpose:** Capture decisions, learnings, and next actions when a session closes. Feed them back into the knowledge base.

**Trigger:** Claude Code session termination (settings.json `hooks.session_end`)

### Script: `~/.claude/hooks/session-end.sh`

```bash
#!/bin/bash
# SessionEnd Hook — Capture Decisions, Learnings, Next Actions
# Fires when a Claude Code session closes (exit, Ctrl+C, timeout).
# Writes a structured session log and updates project memory.
#
# WRITE TARGETS:
#   - ~/.claude/debug/session-logs/ (always)
#   - $VAULT_ROOT/_agent-workspace/session-logs/ (if vault exists)

set -euo pipefail

# --- Configuration ---
VAULT_ROOT="${OBSIDIAN_VAULT_PATH:-$HOME/Obsidian}"
SESSION_LOG_DIR="$HOME/.claude/debug/session-logs"
LOG_FILE="$HOME/.claude/debug/session-end.log"
TIMESTAMP=$(date +'%Y-%m-%dT%H:%M:%S')
TODAY=$(date +'%Y-%m-%d')
SESSION_LOG="$SESSION_LOG_DIR/session_$(date +'%Y%m%d_%H%M%S').md"

# --- Setup ---
mkdir -p "$SESSION_LOG_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }
log "=== SessionEnd hook triggered ==="

# --- Read session summary from stdin ---
# Claude Code may send a session summary as JSON via stdin
SESSION_DATA=$(cat 2>/dev/null || echo "{}")
log "Received session data: $(echo "$SESSION_DATA" | wc -c) bytes"

# --- Detect project context ---
CWD=$(pwd)
PROJECT_NAME=$(basename "$CWD")
GIT_BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null || echo "N/A")
GIT_CHANGES=$(git -C "$CWD" diff --stat 2>/dev/null | tail -1 || echo "N/A")
UNCOMMITTED=$(git -C "$CWD" status --porcelain 2>/dev/null | wc -l | tr -d ' ')

# --- Build session log ---
cat > "$SESSION_LOG" << SESSION_EOF
---
type: session-log
timestamp: $TIMESTAMP
date: $TODAY
project: $PROJECT_NAME
cwd: $CWD
git_branch: $GIT_BRANCH
---

# Session Log — $TIMESTAMP

## Project
**$PROJECT_NAME** ($CWD)
Branch: \`$GIT_BRANCH\`
Uncommitted files: $UNCOMMITTED

## Changes This Session
$GIT_CHANGES

## Session Data
\`\`\`json
$SESSION_DATA
\`\`\`
SESSION_EOF

log "Session log written to: $SESSION_LOG"

# --- Copy to vault (if exists) ---
VAULT_SESSION_DIR="$VAULT_ROOT/_agent-workspace/session-logs"
if [ -d "$VAULT_ROOT/_agent-workspace" ]; then
    mkdir -p "$VAULT_SESSION_DIR"
    cp "$SESSION_LOG" "$VAULT_SESSION_DIR/"
    log "Session log copied to vault"
fi

# --- Append to daily note (if vault exists and daily notes are used) ---
DAILY_NOTE="$VAULT_ROOT/daily/$TODAY.md"
if [ -f "$DAILY_NOTE" ]; then
    # Append a brief session summary to the daily note
    {
        echo ""
        echo "---"
        echo "### Claude Code Session ($TIMESTAMP)"
        echo "- **Project:** $PROJECT_NAME"
        echo "- **Branch:** $GIT_BRANCH"
        echo "- **Uncommitted:** $UNCOMMITTED files"
    } >> "$DAILY_NOTE"
    log "Appended session summary to daily note: $DAILY_NOTE"
fi

# --- Cleanup old session logs (keep last 100) ---
LOG_COUNT=$(ls -1 "$SESSION_LOG_DIR"/session_*.md 2>/dev/null | wc -l)
if [ "$LOG_COUNT" -gt 100 ]; then
    ls -t "$SESSION_LOG_DIR"/session_*.md | tail -n +101 | xargs rm -f
    log "Cleaned up old session logs (kept 100)"
fi

log "=== SessionEnd hook done ==="
exit 0
```

### What it captures:

1. **Project context** -- which directory, git branch, uncommitted files
2. **Session data** -- whatever Claude sends on exit (varies by implementation)
3. **Daily note append** -- brief entry so Obsidian daily notes show session activity
4. **Structured log** -- searchable, with YAML frontmatter for metadata queries

---

## 4. Proactive Heartbeat System

**Assessment: Worth it, but scoped narrowly.**

Cole Medin's $0.05/run heartbeat is compelling because it replaces Burak needing to remember to run `/check`. But it must be scoped to avoid wasting money on noise.

### What it should monitor (and what it should NOT):

| Monitor | Why | Frequency |
|---------|-----|-----------|
| Notion Fristen DB | Detect overdue deadlines within 48 hours | Every 6 hours |
| Outlook inbox (creditor filter) | Detect new creditor emails (not casino spam) | Every 4 hours |
| Finance agent-state.json staleness | Alert if no /check in >72 hours | Every 12 hours |

| DO NOT monitor | Why |
|----------------|-----|
| Gmail inboxes | Clean, no creditors -- waste of money |
| Notion Glaubiger DB | Changes only when agent writes -- circular |
| Vault file changes | Git handles this -- no agent needed |
| Obsidian plugin state | Not relevant to financial urgency |

### Script: `~/Desktop/code2/orchestrator/hooks/heartbeat.py`

```python
#!/usr/bin/env python3
"""
Proactive Heartbeat — Finance & Knowledge Base Monitor
Cole Medin pattern: Python gathers data, Claude reasons about it.

Runs on launchd/cron schedule. Each run costs ~$0.05 via Claude API.
Only triggers Claude reasoning when anomalies are detected.
Data gathering (this script) is free. LLM reasoning is the cost.

Usage:
    python3 heartbeat.py                    # Full check
    python3 heartbeat.py --gather-only      # Just gather data, no LLM
    python3 heartbeat.py --dry-run          # Gather + show what would trigger
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

# --- Configuration ---
CONFIG_PATH = Path(__file__).parent / "heartbeat-config.json"
STATE_PATH = Path(__file__).parent / "heartbeat-state.json"
FINANCE_STATE = Path.home() / "Desktop/code2/Finance-agent/memory/agent-state.json"
NOTIFY_HOOK = Path.home() / ".claude/hooks/notify.sh"
LOG_DIR = Path.home() / ".claude/debug"

DEFAULT_CONFIG = {
    "check_interval_hours": 6,
    "stale_threshold_hours": 72,
    "max_notifications_per_run": 3,
    "enable_llm_reasoning": True,
    "monitors": {
        "finance_state_staleness": True,
        "notion_fristen": True,
        "outlook_creditors": False  # Disabled by default — needs MCP auth
    }
}


def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            return json.load(f)
    # Create default config
    with open(CONFIG_PATH, "w") as f:
        json.dump(DEFAULT_CONFIG, f, indent=2)
    return DEFAULT_CONFIG


def load_state():
    if STATE_PATH.exists():
        with open(STATE_PATH) as f:
            return json.load(f)
    return {"last_run": None, "last_alerts": [], "run_count": 0}


def save_state(state):
    state["last_run"] = datetime.now(timezone.utc).isoformat()
    state["run_count"] = state.get("run_count", 0) + 1
    with open(STATE_PATH, "w") as f:
        json.dump(state, f, indent=2)


def check_finance_staleness():
    """Check if finance agent state is stale (no /check in too long)."""
    if not FINANCE_STATE.exists():
        return {"alert": True, "message": "Finance agent-state.json missing entirely",
                "severity": "critical"}

    with open(FINANCE_STATE) as f:
        state = json.load(f)

    last_check_str = state.get("last_check")
    if not last_check_str:
        return {"alert": True, "message": "No last_check timestamp in finance state",
                "severity": "warning"}

    last_check = datetime.fromisoformat(last_check_str.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    hours_since = (now - last_check).total_seconds() / 3600

    if hours_since > 72:
        # Check what's pending
        handoff = state.get("session_handoff", {})
        open_todos = handoff.get("open_todos", [])
        critical_items = [t for t in open_todos if "SOFORT" in t or "drüber" in t.lower()]

        return {
            "alert": True,
            "message": f"Finance /check is {hours_since:.0f}h stale. "
                       f"{len(open_todos)} open TODOs, {len(critical_items)} critical.",
            "severity": "critical" if critical_items else "warning",
            "hours_since_check": hours_since,
            "open_todos_count": len(open_todos),
            "critical_items": critical_items[:3]  # Cap at 3 for notification
        }

    return {"alert": False, "hours_since_check": hours_since}


def send_notification(title, message, urgency="warning"):
    """Send macOS notification via existing hook."""
    if not NOTIFY_HOOK.exists():
        print(f"[NOTIFY] {urgency.upper()}: {title} — {message}", file=sys.stderr)
        return

    payload = json.dumps({"title": title, "message": message, "urgency": urgency})
    try:
        subprocess.run(
            [str(NOTIFY_HOOK)],
            input=payload.encode(),
            timeout=5,
            capture_output=True
        )
    except Exception as e:
        print(f"[NOTIFY ERROR] {e}", file=sys.stderr)


def main():
    gather_only = "--gather-only" in sys.argv
    dry_run = "--dry-run" in sys.argv

    config = load_config()
    state = load_state()

    print(f"[Heartbeat] Run #{state.get('run_count', 0) + 1} at {datetime.now().isoformat()}")

    alerts = []

    # --- Monitor 1: Finance state staleness ---
    if config.get("monitors", {}).get("finance_state_staleness", True):
        result = check_finance_staleness()
        if result.get("alert"):
            alerts.append(result)
            print(f"  [ALERT] Finance: {result['message']}")
        else:
            hours = result.get("hours_since_check", 0)
            print(f"  [OK] Finance: last check {hours:.0f}h ago")

    # --- Monitor 2: Notion Fristen (placeholder — needs MCP) ---
    if config.get("monitors", {}).get("notion_fristen", False):
        print("  [SKIP] Notion Fristen: MCP integration not yet configured")

    # --- Monitor 3: Outlook creditors (placeholder — needs MCP) ---
    if config.get("monitors", {}).get("outlook_creditors", False):
        print("  [SKIP] Outlook creditors: MCP integration not yet configured")

    # --- Act on alerts ---
    if alerts and not gather_only:
        notification_count = 0
        max_notifications = config.get("max_notifications_per_run", 3)

        for alert in alerts:
            if notification_count >= max_notifications:
                break
            if dry_run:
                print(f"  [DRY RUN] Would notify: {alert['message']}")
            else:
                send_notification(
                    title="Finance Heartbeat",
                    message=alert["message"],
                    urgency=alert.get("severity", "warning")
                )
                notification_count += 1

    # --- Save state ---
    state["last_alerts"] = alerts
    save_state(state)

    print(f"[Heartbeat] Done. {len(alerts)} alert(s).")
    return 1 if alerts else 0


if __name__ == "__main__":
    sys.exit(main())
```

### Heartbeat Config: `~/Desktop/code2/orchestrator/hooks/heartbeat-config.json`

```json
{
    "check_interval_hours": 6,
    "stale_threshold_hours": 72,
    "max_notifications_per_run": 3,
    "enable_llm_reasoning": false,
    "monitors": {
        "finance_state_staleness": true,
        "notion_fristen": false,
        "outlook_creditors": false
    },
    "cost_tracking": {
        "estimated_cost_per_llm_run": 0.05,
        "max_llm_runs_per_day": 4,
        "monthly_budget_eur": 6.00
    }
}
```

### Cost Analysis

| Scenario | Frequency | Monthly Cost |
|----------|-----------|-------------|
| Data gathering only (no LLM) | Every 6h | EUR 0.00 |
| LLM reasoning on alerts only | ~2x/week | ~EUR 0.40 |
| LLM reasoning every run | 4x/day | ~EUR 6.00 |

**Recommendation:** Start with gather-only + notifications. Add LLM reasoning later when Notion MCP integration is stable. The data-gathering-only mode is free and already catches the most critical issue (stale /check).

### launchd Plist: `~/Library/LaunchAgents/com.burak.heartbeat.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.burak.heartbeat</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/hooks/heartbeat.py</string>
    </array>
    <key>StartInterval</key>
    <integer>21600</integer><!-- 6 hours in seconds -->
    <key>StandardOutPath</key>
    <string>/Users/buraksmac/.claude/debug/heartbeat-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/buraksmac/.claude/debug/heartbeat-stderr.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>
```

---

## 5. Security Policy

### Trust Boundaries

```
                    HUMAN-CURATED (read-only for agents)
                    ====================================
                    ~/Obsidian/_human/          Personal notes, values, decisions
                    context/burak.md            Personal financial situation
                    context/schreibstil.md      Writing style reference
                    CLAUDE.md                   Agent configuration
                    .gitignore                  Security rules (what NOT to track)

                    AGENT-WRITABLE (bounded)
                    ========================
                    ~/Obsidian/_agent-workspace/    Session logs, compaction snapshots
                    memory/agent-state.json         State persistence
                    data/processed/                 Processed PDFs
                    research/catalogue/             Knowledge base entries
                    .claude/debug/                  Logs and diagnostics

                    RESTRICTED (never agent-accessible)
                    ====================================
                    ~/.claude/settings.local.json   Contains API keys, OAuth tokens
                    ~/.ssh/                         SSH keys
                    ~/.gnupg/                       GPG keys
                    *.env files                     Environment secrets
                    ~/Library/Keychains/            macOS keychain
```

### Permission Model — Four Autonomy Levels (Cole Medin)

| Level | Name | Vault Access | Finance Access | Notification Access |
|-------|------|-------------|----------------|---------------------|
| 0 | **Observer** | Read vault index + daily note | Read agent-state.json | None |
| 1 | **Advisor** | Read full vault | Read all Notion DBs | Send info notifications |
| 2 | **Assistant** | Read vault + write _agent-workspace | Read + write Notion DBs | Send warning + info |
| 3 | **Partner** | Read vault + write _agent-workspace + append daily | Full Notion + email draft | Send all levels |

**Current Finance Agent level: 3 (Partner)** -- it reads personal context, writes to Notion, drafts emails, sends critical notifications. This is appropriate given the domain.

**Default for new agents: 0 (Observer)** -- must be explicitly elevated per project.

### Vault Write-Lock Protocol

To prevent concurrent agents from corrupting vault files:

```bash
# --- vault-lock.sh (sourced by any hook that writes to vault) ---

VAULT_LOCK="${OBSIDIAN_VAULT_PATH:-$HOME/Obsidian}/.vault-lock"
LOCK_MAX_AGE=300  # 5 minutes

acquire_vault_lock() {
    if [ -f "$VAULT_LOCK" ]; then
        LOCK_AGE=$(( $(date +%s) - $(cat "$VAULT_LOCK") ))
        if [ "$LOCK_AGE" -lt "$LOCK_MAX_AGE" ]; then
            echo "[LOCK] Vault locked by another process ($LOCK_AGE seconds ago). Skipping write." >&2
            return 1
        fi
        echo "[LOCK] Stale vault lock ($LOCK_AGE seconds). Overriding." >&2
    fi
    echo "$(date +%s)" > "$VAULT_LOCK"
    return 0
}

release_vault_lock() {
    rm -f "$VAULT_LOCK"
}
```

This mirrors the Finance Agent's `.scan.lock` pattern (CLAUDE.md Regel 2) but applied to vault writes.

### Obsidian CLI Safety — Restricted Commands

If Obsidian CLI (`obsidian-cli`) is installed, these commands must be restricted:

| Command | Risk | Policy |
|---------|------|--------|
| `obsidian-cli vault delete *` | Destroys vault data | **NEVER** -- block entirely |
| `obsidian-cli note delete *` | Destroys notes | **NEVER** -- block entirely |
| `obsidian-cli plugin install *` | Arbitrary code execution | **HUMAN APPROVAL ONLY** |
| `obsidian-cli vault create *` | Creates new vaults | **HUMAN APPROVAL ONLY** |
| `obsidian-cli note move *` | Reorganizes vault structure | **HUMAN APPROVAL ONLY** |
| `obsidian-cli note create *` | Creates notes in vault | **ONLY in _agent-workspace/** |
| `obsidian-cli search *` | Reads vault content | **ALLOWED** (read-only) |
| `obsidian-cli note read *` | Reads a note | **ALLOWED** (read-only) |
| `obsidian-cli properties get *` | Reads frontmatter | **ALLOWED** (read-only) |

### Implementation in settings.json:

The `hooks.stop` mechanism in Claude Code can enforce this. Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "stop": [
      {
        "matcher": "Bash(obsidian-cli vault delete:*)",
        "hook": "echo '{\"decision\":\"block\",\"reason\":\"Vault deletion is permanently blocked by security policy\"}'"
      },
      {
        "matcher": "Bash(obsidian-cli note delete:*)",
        "hook": "echo '{\"decision\":\"block\",\"reason\":\"Note deletion is permanently blocked by security policy\"}'"
      },
      {
        "matcher": "Bash(obsidian-cli plugin install:*)",
        "hook": "echo '{\"decision\":\"block\",\"reason\":\"Plugin installation requires human approval. Ask the user.\"}'"
      }
    ]
  }
}
```

### Felixba's Warning — Financial Data Guardrails

From Felixba's satire (Entry #10 in synthesis): agents with access to financial data are a security catastrophe without guardrails. Specific rules for Burak's setup:

1. **No agent should ever have direct bank API access.** The Finance Agent works through Notion as an intermediary. Bank data enters via manual PDF scans or email content -- never via API.

2. **Email sending requires human confirmation.** The `/draft` skill creates drafts in Notion's E-Mail Entwurfe DB with status "Zur Prufung". Burak reviews and sends manually. No agent should ever call `send-mail` or `send-gmail-message` for creditor communication without explicit human instruction.

3. **Creditor payment amounts must be human-verified.** The agent can calculate, recommend, and draft -- but `amount` fields in any payment-related action require human sign-off.

4. **Personal financial context (burak.md) is read-only.** Only Burak updates his financial situation, account balances, and creditor relationships. The agent reads but never writes.

5. **Session logs must not contain raw financial amounts in cleartext.** Session logs that get copied to the vault should use references ("see Notion Glaubiger DB") rather than embedding "Sparkasse Dispo: -EUR 3500" in searchable markdown files.

---

## 6. Backup Strategy

### Git-Based Vault Backup

**Approach:** Auto-commit on a schedule, not on every change. Reasons:
- Every-change commits create noise and bloat the repo
- Scheduled commits with meaningful diffs are reviewable
- Aligns with Steph Ango's "File Over App" -- git is the safety net, not the workflow

### Script: `~/Desktop/code2/orchestrator/hooks/vault-backup.sh`

```bash
#!/bin/bash
# Vault Backup — Git auto-commit on schedule
# Runs via launchd every 4 hours during active hours (08:00-22:00)
# Creates a commit ONLY if there are changes.
# Never force-pushes. Never rebases.

set -euo pipefail

VAULT_ROOT="${OBSIDIAN_VAULT_PATH:-$HOME/Obsidian}"
LOG_FILE="$HOME/.claude/debug/vault-backup.log"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }

# --- Preconditions ---
if [ ! -d "$VAULT_ROOT/.git" ]; then
    log "ERROR: $VAULT_ROOT is not a git repository. Run: cd $VAULT_ROOT && git init"
    exit 1
fi

cd "$VAULT_ROOT"

# --- Check for changes ---
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    log "No changes detected. Skipping backup."
    exit 0
fi

# --- Stage all changes ---
git add -A

# --- Count changes ---
CHANGES=$(git diff --cached --stat | tail -1)
FILE_COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')

# --- Commit ---
TIMESTAMP=$(date +'%Y-%m-%d %H:%M')
git commit -m "vault backup: $TIMESTAMP ($FILE_COUNT files changed)

$CHANGES

Auto-committed by vault-backup.sh" --no-gpg-sign 2>/dev/null

log "Backup committed: $FILE_COUNT files changed at $TIMESTAMP"

# --- Push (if remote exists) ---
if git remote get-url origin &>/dev/null; then
    if git push origin "$(git branch --show-current)" 2>/dev/null; then
        log "Pushed to remote successfully"
    else
        log "WARNING: Push failed. Will retry on next run."
    fi
else
    log "No remote configured. Local-only backup."
fi

# --- Prune old branches (safety: only auto-backup branches) ---
# No pruning needed — linear history on a single branch

exit 0
```

### Backup Schedule

| What | Frequency | Retention | Tool |
|------|-----------|-----------|------|
| Vault (Obsidian) | Every 4h (08:00-22:00) | Git history (infinite) | vault-backup.sh via launchd |
| Finance agent-state.json | On every /check run | In git (.gitignore prevents it -- keep manual exports) | Part of /check skill |
| Pre-compact snapshots | On every compaction | 50 most recent | pre-compact.sh |
| Session logs | On every session end | 100 most recent | session-end.sh |
| Notion data | N/A (Notion's own versioning) | Notion handles this | N/A |

### What NOT to back up:

- `~/.claude/history.jsonl` (2MB+, contains full conversation logs -- too large for git)
- `data/inbox/*.pdf` (source PDFs -- backed up separately or in cloud storage)
- `.claude/settings.local.json` (contains API keys -- NEVER in git)
- `~/.claude/sessions/` (ephemeral by design)

### launchd Plist: `~/Library/LaunchAgents/com.burak.vault-backup.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.burak.vault-backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/buraksmac/Desktop/code2/orchestrator/hooks/vault-backup.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        <!-- Run at 08:00, 12:00, 16:00, 20:00 -->
        <dict><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>16</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>20</integer><key>Minute</key><integer>0</integer></dict>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/buraksmac/.claude/debug/vault-backup-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/buraksmac/.claude/debug/vault-backup-stderr.log</string>
</dict>
</plist>
```

---

## 7. Integration with Finance Agent — Conflict Avoidance

### Current Finance Agent automation stack:

| Component | File | Schedule |
|-----------|------|----------|
| Daily /check | `com.burak.finance-agent.plist` | 08:00 daily |
| Weekly /scan | `com.burak.finance-agent-scan.plist` | Monday 09:00 |
| Worker script | `scheduler/finance-worker.sh` | On-demand |
| Notifications | `.claude/hooks/finance-notify.sh` | Triggered by agent |
| File locking | `data/inbox/.scan.lock` | During scan operations |

### Integration rules to prevent conflicts:

1. **Heartbeat and Finance Agent share the notify hook.** Both use `~/.claude/hooks/notify.sh` for macOS notifications. The heartbeat script should use the same JSON format (`{title, message, urgency}`) so the existing sound-based severity mapping works.

2. **Heartbeat reads but never writes Finance Agent state.** The heartbeat monitors `agent-state.json` staleness but never modifies it. Only the Finance Agent worker and Claude Code sessions write to it.

3. **SessionStart hook reads Finance state as summary only.** It extracts 3-5 lines (last check timestamp, next action, open TODO count) -- not the full state with sensitive creditor details.

4. **The vault-lock and scan-lock are independent.** `.scan.lock` is for PDF processing in `data/inbox/`. `.vault-lock` is for Obsidian vault writes. They protect different resources and cannot deadlock against each other.

5. **Namespace separation for launchd plists:**
   - `com.burak.finance-agent` -- Finance Agent daily check
   - `com.burak.finance-agent-scan` -- Finance Agent weekly scan
   - `com.burak.heartbeat` -- Proactive heartbeat monitor
   - `com.burak.vault-backup` -- Obsidian vault git backup

6. **Log directory convergence.** All systems log to `~/.claude/debug/` for a single debugging location:
   - `session-start.log`
   - `pre-compact.log`
   - `session-end.log`
   - `heartbeat-stdout.log`
   - `vault-backup.log`
   - Finance Agent keeps its own logs in `scheduler/logs/` (project-scoped)

---

## 8. Hook Registration in settings.json

Claude Code hooks are configured in `~/.claude/settings.json`. The current `hooks` field is empty (`{}`). Here is the target configuration:

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/buraksmac/.claude/hooks/notify.sh"
          }
        ]
      }
    ]
  }
}
```

**Note on SessionStart / PreCompact / SessionEnd:** As of April 2026, Claude Code's hook system supports `Notification`, `PreToolUse`, and `PostToolUse` events. Full lifecycle hooks (SessionStart, PreCompact, SessionEnd) are not yet natively supported in `settings.json`. The scripts above are designed to be invoked:

1. **SessionStart** -- via CLAUDE.md instruction: "At session start, run `~/.claude/hooks/session-start.sh`" (the agent executes it as a Bash command when following the Session-Start Checkliste)
2. **PreCompact** -- requires Claude Code to support this event natively (track: github.com/anthropics/claude-code/issues). Until then, the script can be invoked manually with `/compact`
3. **SessionEnd** -- via the Notification hook (fires when session ends) or as a manual `/end` command

**Workaround until native support:** Add to CLAUDE.md:

```markdown
## Hook Execution

### At session start (AFTER reading CLAUDE.md, burak.md, agent-state.json):
Run: `bash ~/.claude/hooks/session-start.sh 2>/dev/null` and include the output as context.

### Before any /compact or when context is getting large:
Run: `bash ~/.claude/hooks/pre-compact.sh` to snapshot current state.

### At session end (when user says goodbye or task is complete):
Run: `bash ~/.claude/hooks/session-end.sh` to capture the session.
```

---

## 9. Implementation Checklist

### Phase 1 — Immediate (this week)

- [ ] Create `~/.claude/hooks/session-start.sh` and make executable
- [ ] Create `~/.claude/hooks/pre-compact.sh` and make executable
- [ ] Create `~/.claude/hooks/session-end.sh` and make executable
- [ ] Create `~/.claude/debug/` directory structure
- [ ] Add hook execution instructions to global `~/.claude/CLAUDE.md`
- [ ] Verify `~/.claude/hooks/notify.sh` still works (it references finance-notify.sh path that doesn't match actual location)

### Phase 2 — This sprint (next 3 sessions)

- [ ] Create `~/Desktop/code2/orchestrator/hooks/` directory
- [ ] Deploy `heartbeat.py` and `heartbeat-config.json`
- [ ] Test heartbeat in `--gather-only` mode
- [ ] Set up Obsidian vault at `~/Obsidian/` with `_agent-workspace/` and `_human/` directories
- [ ] Initialize vault as git repo

### Phase 3 — Once vault is active

- [ ] Deploy `vault-backup.sh` and launchd plist
- [ ] Deploy heartbeat launchd plist
- [ ] Create `VAULT-INDEX.md` template
- [ ] Configure Obsidian CLI safety restrictions in settings.json (if CLI is installed)
- [ ] Run first full integration test: session-start -> work -> pre-compact -> session-end -> heartbeat

### Phase 4 — Once stable

- [ ] Enable Notion Fristen monitoring in heartbeat
- [ ] Evaluate LLM reasoning mode ($0.05/run) for heartbeat alerts
- [ ] Implement Obsidian CLI integration for faster vault search (54x vs grep)
- [ ] Consider Icarus-style Hot/Warm/Cold memory tiering for session logs

---

## Key Design Decisions and Rationale

1. **Why bash scripts, not Python for hooks?** Bash starts in <10ms. Python takes ~100ms. Hooks fire on every tool use (PreToolUse/PostToolUse) or session event. The latency difference matters. The heartbeat uses Python because it does JSON manipulation and will eventually call Claude's API.

2. **Why not write directly to the vault from hooks?** The Steph Ango / Internet Vin principle: agents write to `_agent-workspace/`, never to the main vault. Human promotion from workspace to vault is the trust boundary.

3. **Why 4-hour backup intervals instead of continuous?** Continuous backups via fswatch create too many micro-commits. 4-hour intervals during active hours (08:00-20:00) produce clean, reviewable diffs. Worst case data loss: 4 hours of notes.

4. **Why start heartbeat with data-only mode?** The Finance Agent's MCP integration for Notion is already working. The heartbeat should leverage the same `agent-state.json` as a proxy rather than making separate MCP calls. This is free, simple, and already catches the main risk (stale /check).

5. **Why Level 3 (Partner) for Finance Agent but Level 0 for new agents?** The Finance Agent has been tested across 10+ sessions with known behavior. New agents start restricted until proven safe. Elevation requires explicit user instruction.
