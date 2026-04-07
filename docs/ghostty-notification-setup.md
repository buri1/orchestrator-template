# Ghostty Task Finish Notification — Setup Guide

Notification system for Ghostty 1.3+ on macOS. When a long-running command or AI coding agent finishes in any tab/split:

- **Ghostty not focused** → brings Ghostty to front (focuses the exact split) + marks tab with 🔔
- **Ghostty already focused** → plays a sound + marks tab with 🔔
- The 🔔 disappears automatically when you click the tab or type in it
- **Last agent response is copied to clipboard** (available in Maccy history)

## Prerequisites

- **macOS** (uses `osascript`, `afplay`, `stat -f`, `pbcopy`)
- **Ghostty 1.3+** (for `notify-on-command-finish`, `bell-features` scrollbar, AppleScript per-split focus)
- **zsh** as default shell (macOS default)
- **jq** — for parsing hook payloads (`brew install jq`)
- **tmux** — optional, for multi-agent pane layouts (`brew install tmux`)
- **Maccy** — clipboard history manager (recommended, `brew install --cask maccy`)
- **Claude Code** — optional, for Claude-specific hooks (`npm install -g @anthropic-ai/claude-code`)
- **Codex CLI** — optional, v0.114.0+ for Codex hooks (`npm install -g @openai/codex`)

> **First-time macOS permission:** When the notification first fires, macOS will ask for **Accessibility** permission for Ghostty (needed for `osascript` to query/activate apps via System Events). Grant it in System Settings → Privacy & Security → Accessibility.

## Coverage

| Scenario | Works? | Mechanism | Clipboard? |
|---|---|---|---|
| Regular commands outside tmux (`sleep`, `npm build`, etc.) | Yes | Ghostty `notify-on-command-finish` (native) | No |
| Regular commands inside tmux | Yes | zsh `precmd` hooks (fallback) | No |
| Claude Code finishes response | Yes | Claude Code Stop/Notification hooks | No* |
| Codex CLI finishes response | Yes | Codex Stop hook | Yes |
| Exiting `claude` or `codex` entirely | Yes | Ghostty native / zsh hooks | No |
| `codex exec "..."` non-interactive | Yes | Ghostty native / zsh hooks | No |
| Any other interactive agent via `agent-watch` | Yes | `script` + mtime silence watcher | Noisy* |

> *\*Claude Code hooks don't expose response text (only metadata like "Claude is waiting for your input"). Manual `Cmd+C` is recommended for Claude Code. `agent-watch` captures raw terminal output (all tool calls, spinners, etc.) — not a clean response. Only Codex provides a clean `last_assistant_message` via hooks.*

## Architecture

```
Layer 1: Ghostty config         → bell-features + scrollbar markers
Layer 2: Ghostty NATIVE          → notify-on-command-finish (outside tmux only)
Layer 2b: tmux event-driven      → wait-for + monitor-silence (inside tmux)
Layer 3a: Claude Code hooks      → Stop/Notification → AppleScript focus + bell + sound
Layer 3b: Codex CLI hooks        → Stop → clipboard + AppleScript focus + bell
Layer 3c: agent-watch wrapper    → universal fallback (silence detection)
Layer 4: Ghostty AppleScript     → workspace launcher, per-split focus
```

---

## Step-by-Step Setup

### Step 1: Ghostty Config (Layer 1 + Layer 2)

The Ghostty config path on macOS:

```
~/Library/Application Support/com.mitchellh.ghostty/config
```

Append the following to the end of your Ghostty config file:

```
# === Bell / Task Finish Notification ===
# attention: bounce dock icon when unfocused
# title: prepend 🔔 to tab title of the surface that triggered BEL
# scrollbar: show a marker in the scrollbar at the BEL position (1.3+)
bell-features = attention,title,scrollbar

# === Native Command Finish Notification (1.3+) ===
# Ghostty detects command completion via OSC 133 shell integration.
# Only fires when Ghostty is NOT focused and command ran longer than threshold.
# NOTE: Does NOT work inside tmux (tmux consumes OSC 133 sequences).
notify-on-command-finish = unfocused
notify-on-command-finish-action = notify
notify-on-command-finish-after = 10s
```

Or as a one-liner:

```bash
printf '\n# === Bell / Task Finish Notification ===\nbell-features = attention,title,scrollbar\n\n# === Native Command Finish (1.3+) ===\nnotify-on-command-finish = unfocused\nnotify-on-command-finish-action = notify\nnotify-on-command-finish-after = 10s\n' >> ~/Library/Application\ Support/com.mitchellh.ghostty/config
```

Reload with `Cmd+Shift+,` or restart Ghostty.

> **Why `scrollbar`?** New in Ghostty 1.3, `scrollbar` leaves a visual marker in the scrollbar gutter at the exact position where BEL fired. When you scroll through long build output, the markers show you where each notification happened.

### Step 2: Zsh Hooks + agent-watch (Layer 2b fallback + Layer 3c)

Ghostty's native `notify-on-command-finish` handles most regular commands outside tmux. The zsh hooks below serve as a **fallback for commands running inside tmux** (where OSC 133 is consumed by tmux and never reaches Ghostty). The `agent-watch` function remains the universal wrapper for any interactive agent without native hook support.

Append the following block to the **end** of `~/.zshrc`:

```zsh
# === Ghostty Task Finish Notifier ===
# Fallback for commands inside tmux (Ghostty native notify doesn't work there).
# Also provides agent-watch for wrapping arbitrary interactive agents.
GHOSTTY_NOTIFY_THRESHOLD=${GHOSTTY_NOTIFY_THRESHOLD:-10}  # seconds
GHOSTTY_NOTIFY_SOUND="${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}"
AGENT_WATCH_IDLE=${AGENT_WATCH_IDLE:-5}  # seconds of silence for agent-watch

zmodload zsh/datetime 2>/dev/null  # provides EPOCHSECONDS

_ghostty_notify_preexec() {
  _ghostty_cmd_start=$EPOCHSECONDS
}

_ghostty_notify_precmd() {
  local elapsed=0
  if [[ -n "$_ghostty_cmd_start" ]]; then
    elapsed=$(( EPOCHSECONDS - _ghostty_cmd_start ))
    unset _ghostty_cmd_start
  fi
  (( elapsed < GHOSTTY_NOTIFY_THRESHOLD )) && return

  printf '\a'  # BEL → Ghostty marks this tab with 🔔

  # If inside tmux, also signal the tmux wait-for channel
  if [[ -n "$TMUX" && -n "$TMUX_PANE" ]]; then
    tmux wait-for -S "done${TMUX_PANE}" 2>/dev/null
  fi

  local frontapp
  frontapp=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null)
  if [[ "$frontapp" == "Ghostty" ]]; then
    afplay "$GHOSTTY_NOTIFY_SOUND" &>/dev/null &
  else
    osascript -e 'tell application "Ghostty" to activate' &>/dev/null &
  fi
}

autoload -Uz add-zsh-hook
add-zsh-hook preexec _ghostty_notify_preexec
add-zsh-hook precmd _ghostty_notify_precmd

# --- Universal Agent Wrapper ---
# Wraps any interactive agent and notifies when terminal output goes silent.
# Uses macOS `script` to preserve full TTY interactivity (colors, cursor, etc.)
# while monitoring the log file's modification time for silence detection.
#
# Usage:
#   agent-watch codex "fix the bug"
#   agent-watch aider
#   agent-watch opencode
agent-watch() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: agent-watch <command> [args...]"
    return 1
  fi

  local tmplog=$(mktemp /tmp/agent-watch.XXXXXX)

  # Background watcher: polls log mtime every 2s
  (
    local was_active=false
    local notified=false
    local active_start_size=0
    while [[ -f "$tmplog" ]]; do
      sleep 2
      [[ -f "$tmplog" ]] || break
      local mtime=$(stat -f %m "$tmplog" 2>/dev/null || echo 0)
      local now=$(date +%s)
      local idle=$((now - mtime))
      if (( idle < 3 )); then
        if ! $was_active; then
          active_start_size=$(stat -f %z "$tmplog" 2>/dev/null || echo 0)
        fi
        was_active=true
        notified=false
      elif $was_active && ! $notified && (( idle >= AGENT_WATCH_IDLE )); then
        notified=true
        local cur_size=$(stat -f %z "$tmplog" 2>/dev/null || echo 0)
        if (( cur_size > active_start_size )); then
          tail -c +$((active_start_size + 1)) "$tmplog" 2>/dev/null \
            | sed $'s/\x1b\[[0-9;]*[a-zA-Z]//g' \
            | sed $'s/\x1b\][^\x07]*\x07//g' \
            | sed $'s/\r//g' \
            | pbcopy 2>/dev/null
        fi
        printf '\a' > /dev/tty 2>/dev/null
        local frontapp=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null)
        if [[ "$frontapp" == "Ghostty" ]]; then
          afplay "${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}" &>/dev/null &
        else
          osascript -e 'tell application "Ghostty" to activate' &>/dev/null &
        fi
      fi
    done
  ) &
  local watcher_pid=$!

  script -q "$tmplog" "$@"
  local exit_code=$?

  kill $watcher_pid 2>/dev/null
  wait $watcher_pid 2>/dev/null
  rm -f "$tmplog"
  return $exit_code
}
# === End Ghostty Notifier ===
```

Activate in current session: `source ~/.zshrc`

### Step 3: Claude Code Hooks (Layer 3a)

Claude Code fires `Stop` when it finishes a response and `Notification` when it needs user input.

#### 3a. Create the hook script

```bash
mkdir -p ~/.claude/hooks
```

Create `~/.claude/hooks/notify.sh`:

```bash
#!/bin/bash
# Claude Code Notification Hook — Ghostty 1.3 AppleScript Split-Aware Focus
#
# Uses Ghostty 1.3's AppleScript API to focus the SPECIFIC terminal (split pane)
# where Claude finished, matched by working directory via $CLAUDE_PROJECT_DIR.
#
# Also signals tmux wait-for channels for event-driven orchestration.

set -euo pipefail

SOUND="${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}"

NOTIFICATION=$(cat)
MESSAGE=$(echo "$NOTIFICATION" | jq -r '.message // empty' 2>/dev/null || true)
TITLE=$(echo "$NOTIFICATION" | jq -r '.title // empty' 2>/dev/null || true)
[ -z "$MESSAGE" ] && MESSAGE="Claude is waiting for your input"
[ -z "$TITLE" ] && TITLE="Claude Code"

MATCH_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"

# BEL → Ghostty marks this tab with 🔔
printf '\a'

# Signal tmux wait-for channel (event-driven orchestration)
if [ -n "${TMUX:-}" ] && [ -n "${TMUX_PANE:-}" ]; then
  tmux wait-for -S "done${TMUX_PANE}" 2>/dev/null || true
fi

# Signal orchestrator latch + channel (if ORCHY_SESSION_NAME is set)
if [ -n "${ORCHY_SESSION_NAME:-}" ]; then
  LATCH="/tmp/orchy-${ORCHY_SESSION_NAME}.latch"
  cat > "${LATCH}.tmp" <<LATCH_EOF
{"session":"${ORCHY_SESSION_NAME}","stop_reason":"end_turn","timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
LATCH_EOF
  mv "${LATCH}.tmp" "$LATCH"
  tmux wait-for -S "orchy-${ORCHY_SESSION_NAME}-done" 2>/dev/null || true
  tmux wait-for -S "orchy-any-done" 2>/dev/null || true
fi

FRONTAPP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null || echo "")

if [ "$FRONTAPP" = "Ghostty" ]; then
  afplay "$SOUND" &>/dev/null &
else
  # Focus the specific Ghostty split matching this project directory
  osascript <<APPLESCRIPT &>/dev/null &
tell application "Ghostty"
    set matches to every terminal whose working directory is "$MATCH_DIR"
    if (count of matches) = 0 then
        set matches to every terminal whose working directory contains "$MATCH_DIR"
    end if
    if (count of matches) > 0 then
        focus (item 1 of matches)
    else
        activate
    end if
end tell
APPLESCRIPT
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"Glass\"" &>/dev/null &
fi
exit 0
```

Make it executable:

```bash
chmod +x ~/.claude/hooks/notify.sh
```

#### 3b. Wire up the hooks in Claude Code settings

Edit `~/.claude/settings.json` and add (or merge into) the `"hooks"` section:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.claude/hooks/notify.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.claude/hooks/notify.sh"
          }
        ]
      }
    ]
  }
}
```

> **Important:** Replace `$HOME` with your actual home directory (e.g., `/Users/yourname/.claude/hooks/notify.sh`).

### Step 4: Codex CLI Hooks (Layer 3b — optional, Codex v0.114.0+)

#### 4a. Enable hooks feature flag

Add to `~/.codex/config.toml`:

```toml
[features]
codex_hooks = true
```

#### 4b. Create the hooks config

Create `~/.codex/hooks.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.codex/hooks/notify.sh",
            "timeout": 10,
            "statusMessage": "Notifying..."
          }
        ]
      }
    ]
  }
}
```

#### 4c. Create the hook script

```bash
mkdir -p ~/.codex/hooks
```

Create `~/.codex/hooks/notify.sh`:

```bash
#!/bin/bash
# Codex CLI Notification Hook — Ghostty 1.3 Split-Aware Focus + Clipboard

set -euo pipefail

SOUND="${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}"

INPUT=$(cat)
LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty' 2>/dev/null || true)

if [ -n "$LAST_MSG" ]; then
  printf '%s' "$LAST_MSG" | pbcopy 2>/dev/null
fi

MATCH_DIR="${CODEX_PROJECT_DIR:-${CLAUDE_PROJECT_DIR:-$PWD}}"

printf '\a'

if [ -n "${TMUX:-}" ] && [ -n "${TMUX_PANE:-}" ]; then
  tmux wait-for -S "done${TMUX_PANE}" 2>/dev/null || true
fi

FRONTAPP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null || echo "")

if [ "$FRONTAPP" = "Ghostty" ]; then
  afplay "$SOUND" &>/dev/null &
else
  osascript <<APPLESCRIPT &>/dev/null &
tell application "Ghostty"
    set matches to every terminal whose working directory is "$MATCH_DIR"
    if (count of matches) = 0 then
        set matches to every terminal whose working directory contains "$MATCH_DIR"
    end if
    if (count of matches) > 0 then
        focus (item 1 of matches)
    else
        activate
    end if
end tell
APPLESCRIPT
  osascript -e "display notification \"Codex finished\" with title \"Codex CLI\" sound name \"Glass\"" &>/dev/null &
fi

echo '{}'
exit 0
```

Make it executable: `chmod +x ~/.codex/hooks/notify.sh`

### Step 5: tmux Integration (Layer 2b — for multi-agent pane layouts)

When running agents inside tmux, Ghostty's native `notify-on-command-finish` does **not** work because tmux consumes the OSC 133 shell integration sequences. This layer provides event-driven notification using `tmux wait-for` channels and `monitor-silence` as a fallback.

#### 5a. tmux.conf settings

A complete `.tmux.conf` optimized for agent orchestration is provided in this repo at `setup/tmux-agent.conf`. The key settings:

```tmux
# Bell passthrough: BEL in tmux pane → Ghostty
set-option -g bell-action any
set-option -g visual-bell off
set-option -g monitor-bell on

# Silence monitoring: fallback when agents don't use hooks
set-option -g monitor-silence 30

# OSC passthrough for Ghostty features
set-option -g allow-passthrough on
set-option -g set-clipboard on
```

Install: `cp setup/tmux-agent.conf ~/.tmux.conf && tmux source-file ~/.tmux.conf`

#### 5b. tmux wait-for event-driven pattern

`tmux wait-for` provides true event-driven signaling between panes. Zero CPU while waiting, instant wakeup on signal.

**How it works:**

1. The **watcher** blocks on the channel (zero CPU):
   ```bash
   tmux wait-for "done%3"  # blocks until pane %3 signals
   echo "Agent finished!"
   ```

2. The **agent pane** signals when done (wired into hooks above):
   ```bash
   tmux wait-for -S "done%3"  # unblocks all waiters instantly
   ```

3. The zsh hooks (Step 2) and Claude/Codex hooks (Steps 3-4) already include `tmux wait-for -S` — no extra setup needed.

**Orchestrator pattern with latch files** (handles signal-before-waiter race):

```bash
source .bmad/scripts/tmux-helpers.sh

# Clear latch, dispatch work, wait for completion
tmux_dispatch "autarkis1" "implement the login form"
tmux_wait_for_session "autarkis1"
echo "Agent done! Reading output..."
tmux_capture_output "autarkis1" 100

# Wait for ANY of multiple agents
tmux_dispatch "autarkis1" "task 1"
tmux_dispatch "cityhub" "task 2"
WINNER=$(tmux_wait_any autarkis1 cityhub)
echo "$WINNER finished first!"
```

See `.bmad/scripts/tmux-helpers.sh` for the full event-driven API.

#### 5c. monitor-silence as fallback

For agents without hooks, tmux's `monitor-silence` triggers after 30s of no output. Combined with `bell-action any`, BEL propagates to Ghostty for the 🔔 marker.

Per-pane silence thresholds:
```bash
tmux set-option -t %3 monitor-silence 10   # quick agent
tmux set-option -t %5 monitor-silence 60   # build process
```

### Step 6: Ghostty AppleScript (Layer 4 — workspace automation)

Ghostty 1.3 exposes AppleScript for window/split management. A workspace launcher is provided at `setup/ghostty-workspace.sh`.

Usage:
```bash
./setup/ghostty-workspace.sh
```

This creates a 4-pane Ghostty window with tmux crash protection:
- Top-left: Lagerlink Hildesheim (Claude Code)
- Top-right: CityHub (Claude Code)
- Bottom-left: Orchestrator (Claude Code)
- Bottom-right: Monitoring (htop)

For manual per-split focus from scripts:
```bash
osascript -e '
tell application "Ghostty"
    set matches to every terminal whose working directory contains "Lagerlink"
    if (count of matches) > 0 then focus (item 1 of matches)
end tell
'
```

---

## Clipboard Workflow with Maccy

**Workflow:**
1. Agent finishes in Tab A → response is auto-copied to clipboard
2. Switch to Tab B (another agent or editor)
3. `Cmd+V` to paste the response directly
4. If you've copied something else since, open **Maccy** (`Cmd+Shift+C`) to find the agent response in clipboard history

**Cross-agent sharing:**
- Claude finishes → response in Maccy → switch to Codex tab → paste as context
- Codex finishes → response in Maccy → switch to Claude tab → paste as context
- No files needed, pure clipboard

---

## Usage

```bash
# Claude Code — hooks handle notification + focus:
claude

# Codex CLI — hooks handle clipboard + notification:
codex

# Any other agent — wrap with agent-watch:
agent-watch aider --model gpt-4
agent-watch opencode

# Regular commands outside tmux — Ghostty native notify:
npm run build   # notifies if it takes >10s

# Regular commands inside tmux — zsh hooks fallback:
npm run build   # zsh precmd handles notification

# Launch multi-agent workspace:
./setup/ghostty-workspace.sh

# Event-driven wait for agent (from orchestrator):
source .bmad/scripts/tmux-helpers.sh
tmux_dispatch "autarkis1" "fix the login bug"
tmux_wait_for_session "autarkis1"
```

## Customization

```bash
# In ~/.zshrc (before the notifier block):
GHOSTTY_NOTIFY_THRESHOLD=5                              # zsh: notify after 5s
AGENT_WATCH_IDLE=3                                       # agent-watch: 3s silence
GHOSTTY_NOTIFY_SOUND="/System/Library/Sounds/Ping.aiff"  # change sound

# In Ghostty config:
notify-on-command-finish-after = 5s   # native notify threshold
```

**Available macOS sounds** (in `/System/Library/Sounds/`):
Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink

## How It Works

### Layer 1: Ghostty bell-features
All layers send BEL (`\a`). Ghostty's `attention` bounces the dock icon, `title` prepends 🔔, and `scrollbar` (1.3+) marks the scroll position. The 🔔 clears on focus or typing.

### Layer 2: Ghostty native notify-on-command-finish (1.3+)
Uses OSC 133 shell integration to detect command completion. Fires macOS notification if command took longer than threshold and Ghostty is unfocused. **Does NOT work inside tmux** (tmux consumes OSC 133).

### Layer 2b: tmux event-driven notification
Two mechanisms replace native Ghostty notify inside tmux:
1. **`tmux wait-for` channels** — True event-driven. Each pane gets channel `done%<pane_id>`. Hooks signal on completion. Orchestrator blocks with zero CPU.
2. **`monitor-silence` fallback** — After N seconds of no output, tmux alerts. Bell propagation (`bell-action any`) sends BEL to Ghostty.

### Layer 3a: Claude Code hooks
`Stop` fires on response completion, `Notification` on user input needed. Hook sends BEL, signals tmux channels (both per-pane and orchestrator latch), and uses Ghostty AppleScript to focus the specific split by matching `$CLAUDE_PROJECT_DIR`.

### Layer 3b: Codex CLI hooks
`Stop` fires with `last_assistant_message` in JSON payload. Hook copies to clipboard via `pbcopy`, signals tmux channels, and triggers Ghostty notification. Must output `{}` on stdout.

### Layer 3c: agent-watch (universal wrapper)
`script -q logfile <command>` runs agent in a PTY. Background subshell polls logfile mtime. On silence, strips ANSI codes, copies to clipboard, sends BEL.

### Layer 4: Ghostty AppleScript
Workspace launcher creates multi-agent Ghostty layouts. Per-split focus via `focus terminal N` (which activates window + tab + split in one command). Matches terminals by `working directory` property.

## Troubleshooting

| Problem | Fix |
|---|---|
| No sound plays | Check System Settings → Sound → Alert volume |
| Ghostty doesn't come to front | Grant Accessibility: System Settings → Privacy → Accessibility → Ghostty |
| `osascript` errors | First run triggers macOS permission dialog — approve it |
| BEL / 🔔 not appearing | Ensure `bell-features = attention,title,scrollbar` in Ghostty config, reload |
| Native notify not firing | Verify Ghostty 1.3+ (`ghostty --version`); check config |
| Native notify not firing in tmux | **Expected** — tmux consumes OSC 133. Use Layer 2b |
| `tmux wait-for` hangs forever | Agent pane never signaled. Check hooks include `tmux wait-for -S` |
| Bell not propagating through tmux | Ensure `bell-action any` and `visual-bell off` in `~/.tmux.conf` |
| Claude Code hooks not firing | Check `~/.claude/settings.json` has hooks; start new session |
| Codex hooks not firing | Check `codex_hooks = true` in `~/.codex/config.toml`; Codex v0.114.0+ |
| `jq: command not found` | `brew install jq` |
| Clipboard not updating | Test: `echo test \| pbcopy` then `Cmd+V` |

## Limitations

- `notify-on-command-finish` does **not** work inside tmux (OSC 133 consumed)
- Ghostty AppleScript cannot read terminal contents (security restriction)
- `agent-watch` clipboard content is raw terminal output (includes tool calls, spinners)
- `tmux wait-for` signals are fire-and-forget — use latch files for robustness
- Ghostty AppleScript is "preview" in 1.3 — may have breaking changes in 1.4
- Codex hooks are experimental (v0.114.0)

## Quick Reference: All File Paths

| File | Purpose |
|---|---|
| `~/Library/Application Support/com.mitchellh.ghostty/config` | Ghostty bell-features + native notify |
| `~/.tmux.conf` | tmux bell passthrough + monitor-silence |
| `~/.zshrc` | Zsh hooks (tmux fallback) + agent-watch |
| `~/.claude/settings.json` | Claude Code hook wiring |
| `~/.claude/hooks/notify.sh` | Claude Code notification + AppleScript focus |
| `~/.codex/config.toml` | Codex feature flags |
| `~/.codex/hooks.json` | Codex hook wiring |
| `~/.codex/hooks/notify.sh` | Codex notification + clipboard |
| `setup/tmux-agent.conf` | Complete tmux config for agent orchestration |
| `setup/ghostty-workspace.sh` | Multi-agent Ghostty workspace launcher |
| `.bmad/scripts/tmux-helpers.sh` | Event-driven tmux helper functions |
