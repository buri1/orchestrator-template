#!/bin/bash
# ==============================================================================
# Ghostty Multi-Agent Workspace Setup
# ==============================================================================
# Creates a 4-pane Ghostty workspace with tmux crash protection.
#
# Layout:
#   +---------------------------+---------------------------+
#   | TOP-LEFT                  | TOP-RIGHT                 |
#   | Lagerlink Hildesheim      | CityHub                   |
#   | Claude Code               | Claude Code               |
#   +---------------------------+---------------------------+
#   | BOTTOM-LEFT               | BOTTOM-RIGHT              |
#   | Orchestrator              | Monitoring / Logs         |
#   | Claude Code               | htop                      |
#   +---------------------------+---------------------------+
#
# Each pane runs inside a named tmux session for crash protection.
# If Ghostty crashes, reconnect with: tmux attach -t <session-name>
#
# Usage: chmod +x ghostty-workspace.sh && ./ghostty-workspace.sh
# ==============================================================================

set -euo pipefail

# --- Configuration ---
LAGERLINK_DIR="/Users/buraksmac/Desktop/code/Lagerlink Hildesheim"
CITYHUB_DIR="/Users/buraksmac/Desktop/code2/CityHub"
ORCHESTRATOR_DIR="/Users/buraksmac/Desktop/code2/orchestrator"
MONITOR_DIR="$HOME"

TMUX_SESSION_LAGERLINK="lagerlink"
TMUX_SESSION_CITYHUB="cityhub"
TMUX_SESSION_ORCHESTRATOR="orchestrator"
TMUX_SESSION_MONITOR="monitor"

STEP_DELAY=1.5

# --- Pre-flight: kill old sessions ---
for sess in "$TMUX_SESSION_LAGERLINK" "$TMUX_SESSION_CITYHUB" "$TMUX_SESSION_ORCHESTRATOR" "$TMUX_SESSION_MONITOR"; do
    tmux kill-session -t "$sess" 2>/dev/null || true
done

# --- Create tmux sessions (detached) ---
echo "[1/4] Creating tmux sessions..."

tmux new-session -d -s "$TMUX_SESSION_LAGERLINK" -c "$LAGERLINK_DIR"
tmux send-keys -t "$TMUX_SESSION_LAGERLINK" "export ORCHY_SESSION_NAME=$TMUX_SESSION_LAGERLINK && printf '\\033]0;Lagerlink Hildesheim\\007' && claude" Enter

tmux new-session -d -s "$TMUX_SESSION_CITYHUB" -c "$CITYHUB_DIR"
tmux send-keys -t "$TMUX_SESSION_CITYHUB" "export ORCHY_SESSION_NAME=$TMUX_SESSION_CITYHUB && printf '\\033]0;CityHub\\007' && claude" Enter

tmux new-session -d -s "$TMUX_SESSION_ORCHESTRATOR" -c "$ORCHESTRATOR_DIR"
tmux send-keys -t "$TMUX_SESSION_ORCHESTRATOR" "export ORCHY_SESSION_NAME=$TMUX_SESSION_ORCHESTRATOR && printf '\\033]0;Orchestrator\\007' && claude" Enter

tmux new-session -d -s "$TMUX_SESSION_MONITOR" -c "$MONITOR_DIR"
tmux send-keys -t "$TMUX_SESSION_MONITOR" "printf '\\033]0;Monitor\\007' && echo '=== MONITORING ===' && echo 'tmux ls       - list sessions' && echo 'htop          - system resources' && echo '' && htop" Enter

# --- Create Ghostty window with 4 splits ---
echo "[2/4] Creating Ghostty window..."

osascript <<'APPLESCRIPT'
tell application "Ghostty"
    activate
    delay 0.5
    tell application "System Events"
        tell process "Ghostty"
            click menu item "New Window" of menu "File" of menu bar 1
        end tell
    end tell
end tell
APPLESCRIPT

sleep "$STEP_DELAY"

# Top-left: attach to lagerlink
echo "[3/4] Setting up panes..."

osascript <<APPLESCRIPT
tell application "Ghostty"
    tell front window
        tell front surface
            input text "tmux attach -t ${TMUX_SESSION_LAGERLINK}"
            delay 0.1
        end tell
    end tell
end tell
APPLESCRIPT

osascript -e 'tell application "System Events" to tell process "Ghostty" to keystroke return'
sleep "$STEP_DELAY"

# Split right for top-right (CityHub)
osascript <<'APPLESCRIPT'
tell application "Ghostty"
    tell front window
        tell front surface
            split direction "right"
        end tell
    end tell
end tell
APPLESCRIPT

sleep "$STEP_DELAY"

osascript <<APPLESCRIPT
tell application "Ghostty"
    tell front window
        tell front surface
            input text "tmux attach -t ${TMUX_SESSION_CITYHUB}"
            delay 0.1
        end tell
    end tell
end tell
APPLESCRIPT

osascript -e 'tell application "System Events" to tell process "Ghostty" to keystroke return'
sleep "$STEP_DELAY"

# Split down for bottom-right (Monitor)
osascript <<'APPLESCRIPT'
tell application "Ghostty"
    tell front window
        tell front surface
            split direction "down"
        end tell
    end tell
end tell
APPLESCRIPT

sleep "$STEP_DELAY"

osascript <<APPLESCRIPT
tell application "Ghostty"
    tell front window
        tell front surface
            input text "tmux attach -t ${TMUX_SESSION_MONITOR}"
            delay 0.1
        end tell
    end tell
end tell
APPLESCRIPT

osascript -e 'tell application "System Events" to tell process "Ghostty" to keystroke return'
sleep "$STEP_DELAY"

# Navigate to top-left pane, then split down for bottom-left (Orchestrator)
osascript <<'APPLESCRIPT'
tell application "System Events"
    tell process "Ghostty"
        key code 123 using {control down, shift down}
        delay 0.3
        key code 123 using {control down, shift down}
    end tell
end tell
APPLESCRIPT

sleep "$STEP_DELAY"

osascript <<'APPLESCRIPT'
tell application "Ghostty"
    tell front window
        tell front surface
            split direction "down"
        end tell
    end tell
end tell
APPLESCRIPT

sleep "$STEP_DELAY"

osascript <<APPLESCRIPT
tell application "Ghostty"
    tell front window
        tell front surface
            input text "tmux attach -t ${TMUX_SESSION_ORCHESTRATOR}"
            delay 0.1
        end tell
    end tell
end tell
APPLESCRIPT

osascript -e 'tell application "System Events" to tell process "Ghostty" to keystroke return'

# --- Done ---
echo "[4/4] Workspace created!"
echo ""
echo "================================================================"
echo "  GHOSTTY MULTI-AGENT WORKSPACE"
echo "================================================================"
echo ""
echo "  +-----------------------------+-----------------------------+"
echo "  | Lagerlink Hildesheim        | CityHub                     |"
echo "  | tmux: $TMUX_SESSION_LAGERLINK               | tmux: $TMUX_SESSION_CITYHUB                 |"
echo "  +-----------------------------+-----------------------------+"
echo "  | Orchestrator                | Monitor                     |"
echo "  | tmux: $TMUX_SESSION_ORCHESTRATOR            | tmux: $TMUX_SESSION_MONITOR                 |"
echo "  +-----------------------------+-----------------------------+"
echo ""
echo "  Crash recovery:"
echo "    tmux attach -t lagerlink"
echo "    tmux attach -t cityhub"
echo "    tmux attach -t orchestrator"
echo "    tmux attach -t monitor"
echo ""
echo "================================================================"
