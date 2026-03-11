# Ghostty Task Finish Notification Setup

When a long-running command or AI agent finishes in any Ghostty tab/split:

- **Ghostty not focused** → brings Ghostty to front + marks tab with 🔔
- **Ghostty already focused** → plays a sound + marks tab with 🔔
- The 🔔 disappears automatically when you click the tab or type in it

## Coverage

| Scenario | Works? | Mechanism |
|---|---|---|
| Regular commands (`sleep`, `npm build`, etc.) | Yes | zsh `precmd` hooks |
| Claude Code finishes response | Yes | Claude Code Stop/Notification hooks |
| Exiting `claude` or `codex` entirely | Yes | zsh `precmd` hooks |
| `codex exec "..."` non-interactive | Yes | zsh `precmd` hooks |
| Any interactive agent via `agent-watch` | Yes | `script` + mtime watcher |

## Architecture (3 layers)

```
Layer 1: Ghostty config        → bell-features (🔔 on tab, dock bounce)
Layer 2: Zsh precmd/preexec    → regular shell commands (>10s)
Layer 3a: Claude Code hooks    → Claude finishing a response mid-session
Layer 3b: agent-watch wrapper  → ANY agent (codex, aider, etc.) via output silence detection
```

## Files Modified (4 files)

### 1. Ghostty Config

**Path:** `~/Library/Application Support/com.mitchellh.ghostty/config`

```
# === Bell / Task Finish Notification ===
# attention: bounce dock icon when unfocused
# title: prepend 🔔 to tab title of the surface that triggered BEL
bell-features = attention,title
```

### 2. Zsh Hooks + agent-watch

**Path:** `~/.zshrc`

Handles regular shell commands (Layer 2) and the universal `agent-watch` wrapper (Layer 3b).

```zsh
# === Ghostty Task Finish Notifier ===
GHOSTTY_NOTIFY_THRESHOLD=${GHOSTTY_NOTIFY_THRESHOLD:-10}
GHOSTTY_NOTIFY_SOUND="${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}"

zmodload zsh/datetime 2>/dev/null

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
  printf '\a'
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
# Uses macOS `script` to preserve full TTY interactivity while monitoring
# the log file's mtime for output silence.
# Usage: agent-watch codex "fix the bug"
#        agent-watch aider
AGENT_WATCH_IDLE=${AGENT_WATCH_IDLE:-5}

agent-watch() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: agent-watch <command> [args...]"
    return 1
  fi

  local tmplog=$(mktemp /tmp/agent-watch.XXXXXX)

  (
    local was_active=false
    local notified=false
    while [[ -f "$tmplog" ]]; do
      sleep 2
      [[ -f "$tmplog" ]] || break
      local mtime=$(stat -f %m "$tmplog" 2>/dev/null || echo 0)
      local now=$(date +%s)
      local idle=$((now - mtime))
      if (( idle < 3 )); then
        was_active=true
        notified=false
      elif $was_active && ! $notified && (( idle >= AGENT_WATCH_IDLE )); then
        notified=true
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

### 3. Claude Code Hooks

**Path:** `~/.claude/settings.json`

Handles Claude Code finishing a response (within its interactive session). This is preferred over `agent-watch` for Claude Code because it's more precise (hook fires on exact events, not silence detection).

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/Users/buraksmac/.claude/hooks/notify.sh"
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
            "command": "/Users/buraksmac/.claude/hooks/notify.sh"
          }
        ]
      }
    ]
  }
}
```

### 4. Claude Code Hook Script

**Path:** `~/.claude/hooks/notify.sh`

```bash
#!/bin/bash
NOTIFICATION=$(cat)
MESSAGE=$(echo "$NOTIFICATION" | jq -r '.message // empty' 2>/dev/null || echo "Claude is waiting for your input")
TITLE=$(echo "$NOTIFICATION" | jq -r '.title // empty' 2>/dev/null || echo "Claude Code")
[ -z "$MESSAGE" ] && MESSAGE="Claude is waiting for your input"
[ -z "$TITLE" ] && TITLE="Claude Code"

printf '\a'

FRONTAPP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null)
if [ "$FRONTAPP" = "Ghostty" ]; then
  afplay "${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}" &>/dev/null &
else
  osascript -e 'tell application "Ghostty" to activate' &>/dev/null &
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"Glass\"" &
fi
exit 0
```

## How It Works

### Layer 2: Zsh Hooks (regular commands)
`preexec` records start time → `precmd` fires when shell prompt returns → if >10s elapsed → BEL + notify

### Layer 3a: Claude Code Hooks
Claude Code fires `Stop` when response finishes, `Notification` when it needs input → `notify.sh` → BEL + notify

### Layer 3b: agent-watch (universal)
`script -q logfile <agent>` runs the agent in a pty (full interactivity preserved) → background watcher polls the logfile's mtime every 2s → when output stops for 5s after being active → BEL + notify

### Layer 1: Ghostty bell-features
All layers send BEL (`\a`) → Ghostty's `attention` bounces dock icon, `title` marks the specific tab with 🔔

## Usage

```bash
# Claude Code: just run normally (hooks handle it)
claude

# Any other agent: wrap with agent-watch
agent-watch codex
agent-watch codex "fix the login bug"
agent-watch aider --model gpt-4
```

## Customization

```bash
# In ~/.zshrc or export in shell:
GHOSTTY_NOTIFY_THRESHOLD=5    # zsh hooks: trigger after 5s instead of 10
AGENT_WATCH_IDLE=3             # agent-watch: trigger after 3s of silence
GHOSTTY_NOTIFY_SOUND="/System/Library/Sounds/Ping.aiff"  # different sound
```

**Available macOS sounds:** Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink (all in `/System/Library/Sounds/`)

## Reload After Changes

- **Ghostty config:** Press `Cmd+Shift+,` or restart Ghostty
- **Zsh hooks / agent-watch:** Open a new tab or run `source ~/.zshrc`
- **Claude Code hooks:** Start a new Claude Code session

## Limitations

- No external API to programmatically **switch to** the finished tab — but 🔔 makes it visible
- `system` and `audio` bell features are GTK-only (Linux); on macOS we use `afplay`
- `agent-watch` adds a `script` layer (the agent runs in a pty-in-a-pty) — very rare edge cases with some TUI apps
- The `script` log file grows during the session; cleaned up on exit
- `osascript` adds ~50ms overhead per notification (negligible)

## Testing

```bash
# Test zsh hooks:
sleep 12

# Test agent-watch:
agent-watch sleep 12

# Test Claude Code hooks:
# Start claude in one tab, switch to another, ask something — hear Glass sound + 🔔
```
