#!/bin/bash
# ============================================================================
# L-Thread Pi Supervisor — Launch Script (cmux)
# ============================================================================
# Creates a 3-pane split layout within the current cmux workspace:
#
#   +──────────────────────────+──────────────────────────+
#   │ Pi Supervisor            │ Worker N (newest, top)   │
#   │ (top-left, this pane)    ├──────────────────────────┤
#   ├──────────────────────────┤ Worker 2                 │
#   │ Opus Orchestrator        ├──────────────────────────┤
#   │ (bottom-left)            │ Worker 1 (first, bottom) │
#   +──────────────────────────+──────────────────────────+
#
# Pi runs in the top-left pane. The supervisor extension manages the
# orchestrator pane (bottom-left) and spawns workers (right side).
#
# MUST BE RUN FROM INSIDE A CMUX TERMINAL.
#
# Usage:
#   ./run.sh                                  # Start supervisor (default)
#   ./run.sh --model gemini-3-flash           # Override model
#   ./run.sh --provider antigravity           # Override provider
#   ./run.sh --auto                           # Auto-mode (no user prompts)
#   ./run.sh --orch-dir /path/to/dir          # Orchestrator working directory
#
# Prerequisites:
#   - Pi Agent: npm install -g @mariozechner/pi-coding-agent
#   - cmux: https://github.com/manaflow-ai/cmux (must be running)
#   - Claude Code: npm install -g @anthropic-ai/claude-code
# ============================================================================

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# ── Check cmux environment ────────────────────────
if [[ -z "${CMUX_SURFACE_ID:-}" ]]; then
    echo "ERROR: Not running inside cmux."
    echo "Open cmux app, create a workspace, then run this script."
    exit 1
fi

if ! command -v cmux &>/dev/null; then
    echo "ERROR: cmux CLI not in PATH."
    echo "Ensure cmux shell integration is loaded (should be automatic inside cmux)."
    exit 1
fi

# ── Parse args ──────────────────────────────────────────
MODEL="gpt-5.4:xhigh"
PROVIDER="openai-codex"
AUTO_MODE="DISABLED"
ORCH_DIR="$(dirname "$DIR")"  # Default: parent dir (orchestrator repo root)

while [[ $# -gt 0 ]]; do
    case $1 in
        --auto)
            AUTO_MODE="ENABLED"
            shift
            ;;
        --model)
            MODEL="$2"
            shift 2
            ;;
        --provider)
            PROVIDER="$2"
            shift 2
            ;;
        --orch-dir)
            ORCH_DIR="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./run.sh [--model <model>] [--provider <name>] [--auto] [--orch-dir <path>]"
            exit 1
            ;;
    esac
done

# ── Build Pi command ──────────────────────────────────
PI_CMD="pi"
[[ -n "$PROVIDER" ]] && PI_CMD="$PI_CMD --provider $PROVIDER"
PI_CMD="$PI_CMD --model $MODEL -e extensions/telemetry.ts -e extensions/supervisor.ts"

# ── Pre-flight checks ──────────────────────────────────
if ! command -v pi &>/dev/null; then
    echo "ERROR: Pi Agent not installed. Run: npm install -g @mariozechner/pi-coding-agent"
    exit 1
fi

# Check Pi version
PI_VERSION=$(pi --version 2>/dev/null || echo "unknown")
echo "Pi Agent version: $PI_VERSION"

# Check model availability (INC-004 guard)
if ! pi --list-models "$MODEL" 2>&1 | grep -q "$MODEL"; then
    echo "ERROR: Model '$MODEL' not found in Pi Agent."
    echo "Available models:"
    pi --list-models 2>&1 | head -20
    exit 1
fi

# ── Setup state dirs ───────────────────────────────────
mkdir -p "$DIR/_bmad" "$DIR/.bmad"
echo "$AUTO_MODE" > "$DIR/.bmad/AUTO_MODE"

# ── Check for existing active session ──────────────────
REGISTRY_FILE="$DIR/_bmad/session-registry.json"
if [[ -f "$REGISTRY_FILE" ]]; then
    EXISTING_STATUS=$(python3 -c "
import json, sys
try:
    r = json.load(open('$REGISTRY_FILE'))
    s = r.get('session')
    if s and s.get('status') in ('active', 'paused'):
        print(f\"{s['status']}:{s['id']}:{s.get('task','')[:60]}\")
    else:
        print('none')
except:
    print('none')
" 2>/dev/null || echo "none")

    if [[ "$EXISTING_STATUS" != "none" ]]; then
        IFS=: read -r STATUS SID TASK <<< "$EXISTING_STATUS"
        echo ""
        echo "WARNING: Active session found!"
        echo "  Session: $SID"
        echo "  Status:  $STATUS"
        echo "  Task:    $TASK"
        echo ""
        read -p "  Start fresh? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 0
        fi
    fi
fi

# ── Generate session ID ───────────────────────────────
SESSION_ID="lthread-$(date +%s)"

# ── Create 3-pane layout in current cmux workspace ─────
echo "Creating 3-pane layout in current cmux workspace..."

# Current surface = supervisor pane (top-left after splits)
SUPERVISOR_SURFACE="$CMUX_SURFACE_ID"
WORKSPACE_ID="${CMUX_WORKSPACE_ID:-}"

# Helper: extract surface ref from cmux output (e.g. "OK surface:19 workspace:1" → "surface:19")
parse_surface_ref() {
    echo "$1" | grep -o 'surface:[0-9]*'
}

# Split right: workers area (right half)
WORKERS_RAW=$(cmux new-split right --surface "$SUPERVISOR_SURFACE" 2>&1 || true)
WORKERS_SURFACE=$(parse_surface_ref "$WORKERS_RAW")
if [[ -z "$WORKERS_SURFACE" ]]; then
    echo "ERROR: Failed to create workers pane (cmux new-split right)"
    echo "  Raw output: $WORKERS_RAW"
    echo "  Hint: Close existing split panes and retry, or open a fresh cmux workspace."
    exit 1
fi

# Split supervisor pane down: orchestrator (bottom of left half)
ORCHESTRATOR_RAW=$(cmux new-split down --surface "$SUPERVISOR_SURFACE" 2>&1 || true)
ORCHESTRATOR_SURFACE=$(parse_surface_ref "$ORCHESTRATOR_RAW")
if [[ -z "$ORCHESTRATOR_SURFACE" ]]; then
    echo "ERROR: Failed to create orchestrator pane (cmux new-split down)"
    echo "  Raw output: $ORCHESTRATOR_RAW"
    echo "  Hint: Close existing split panes and retry, or open a fresh cmux workspace."
    exit 1
fi

# ── Label surfaces ────────────────────────────────────
cmux rename-tab --surface "$SUPERVISOR_SURFACE" "Pi Supervisor" 2>/dev/null || true
cmux rename-tab --surface "$WORKERS_SURFACE" "Workers" 2>/dev/null || true
cmux rename-tab --surface "$ORCHESTRATOR_SURFACE" "Orchestrator" 2>/dev/null || true

# ── Write pane layout for supervisor extension ─────────
cat > "$DIR/_bmad/pane-layout.json" << EOF
{
  "session": "lthread",
  "workspaceId": "$WORKSPACE_ID",
  "supervisorPaneId": "$SUPERVISOR_SURFACE",
  "orchestratorPaneId": "$ORCHESTRATOR_SURFACE",
  "workersPaneId": "$WORKERS_SURFACE",
  "orchestratorDir": "$ORCH_DIR",
  "workerPanes": []
}
EOF

# ── Write initial session registry ────────────────────
cat > "$REGISTRY_FILE" << EOF
{
  "version": 1,
  "session": {
    "id": "$SESSION_ID",
    "terminal_session": "lthread",
    "launched_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "active",
    "task": null,
    "panes": {
      "supervisor": { "pane_id": "$SUPERVISOR_SURFACE", "pid": null },
      "orchestrator": { "pane_id": "$ORCHESTRATOR_SURFACE", "pid": null },
      "workers_base": { "pane_id": "$WORKERS_SURFACE", "pid": null }
    },
    "agents": [
      {
        "role": "supervisor",
        "pane_id": "$SUPERVISOR_SURFACE",
        "model": "$MODEL",
        "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "stopped_at": null,
        "status": "running"
      }
    ]
  },
  "history": []
}
EOF

# ── Write initial activity log entry ──────────────────
echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"epoch\":$(date +%s)000,\"session\":\"lthread\",\"session_id\":\"$SESSION_ID\",\"event\":\"session_created\",\"phase\":\"stopped\",\"task\":null,\"model\":\"$MODEL\",\"provider\":\"${PROVIDER:-auto}\",\"surfaces\":{\"supervisor\":\"$SUPERVISOR_SURFACE\",\"orchestrator\":\"$ORCHESTRATOR_SURFACE\",\"workers\":\"$WORKERS_SURFACE\"}}" >> "$DIR/_bmad/agent-activity.jsonl"

# ── Display welcome in workers surface ────────────────
cmux send --surface "$WORKERS_SURFACE" "echo '── Workers will appear here ──'" 2>/dev/null || true
cmux send-key --surface "$WORKERS_SURFACE" Enter 2>/dev/null || true

# ── Display welcome in orchestrator surface ───────────
cmux send --surface "$ORCHESTRATOR_SURFACE" "echo '── Orchestrator will start here ──'" 2>/dev/null || true
cmux send-key --surface "$ORCHESTRATOR_SURFACE" Enter 2>/dev/null || true

# ── Set cmux sidebar status ────────────────────────────
cmux set-status "supervisor" "Starting" --icon "bolt.fill" --color "#4C8DFF" 2>/dev/null || true

# ── Print info ────────────────────────────────────────
echo ""
echo "================================================"
echo "  L-THREAD SUPERVISOR (cmux)"
echo "================================================"
echo ""
echo "  Session:     lthread ($SESSION_ID)"
echo "  Model:       $MODEL"
echo "  Provider:    ${PROVIDER:-auto}"
echo "  Auto-Mode:   $AUTO_MODE"
echo "  Orch Dir:    $ORCH_DIR"
echo "  Pi Version:  $PI_VERSION"
echo ""
echo "  Workspace:   $WORKSPACE_ID"
echo "  Surface IDs:"
echo "    Supervisor:   $SUPERVISOR_SURFACE"
echo "    Orchestrator: $ORCHESTRATOR_SURFACE"
echo "    Workers:      $WORKERS_SURFACE"
echo ""
echo "  Registry:    $REGISTRY_FILE"
echo "  Activity:    $DIR/_bmad/agent-activity.jsonl"
echo ""

# ── Start Pi in supervisor surface (this terminal) ────
echo "Starting Pi supervisor..."
exec $PI_CMD
