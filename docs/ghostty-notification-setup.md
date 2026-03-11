# Ghostty Task Finish Notification — Setup Guide

Notification system for Ghostty on macOS. When a long-running command or AI coding agent finishes in any tab/split:

- **Ghostty not focused** → brings Ghostty to front + marks tab with 🔔
- **Ghostty already focused** → plays a sound + marks tab with 🔔
- The 🔔 disappears automatically when you click the tab or type in it

## Prerequisites

- **macOS** (uses `osascript`, `afplay`, `stat -f`)
- **Ghostty** terminal (any version with `bell-features` support, v1.2.0+)
- **zsh** as default shell (macOS default)
- **jq** — for parsing Claude Code hook payloads (`brew install jq`)
- **Claude Code** — optional, for Claude-specific hooks (`npm install -g @anthropic-ai/claude-code`)

> **First-time macOS permission:** When the notification first fires, macOS will ask for **Accessibility** permission for Ghostty (needed for `osascript` to query/activate apps via System Events). Grant it in System Settings → Privacy & Security → Accessibility.

## Coverage

| Scenario | Works? | Mechanism |
|---|---|---|
| Regular commands (`sleep`, `npm build`, etc.) | Yes | zsh `precmd` hooks |
| Claude Code finishes response mid-session | Yes | Claude Code Stop/Notification hooks |
| Exiting `claude` or `codex` entirely | Yes | zsh `precmd` hooks |
| `codex exec "..."` non-interactive | Yes | zsh `precmd` hooks |
| Any interactive agent via `agent-watch` | Yes | `script` + mtime silence watcher |

## Architecture

```
Layer 1: Ghostty config        → bell-features (🔔 on tab, dock bounce)
Layer 2: Zsh precmd/preexec    → regular shell commands (>10s)
Layer 3a: Claude Code hooks    → Claude finishing a response mid-session
Layer 3b: agent-watch wrapper  → ANY agent (codex, aider, etc.) via output silence detection
```

---

## Step-by-Step Setup

### Step 1: Ghostty Config

The Ghostty config path on macOS:

```
~/Library/Application Support/com.mitchellh.ghostty/config
```

Append the following to the end of your Ghostty config file:

```
# === Bell / Task Finish Notification ===
# attention: bounce dock icon when unfocused
# title: prepend 🔔 to tab title of the surface that triggered BEL
bell-features = attention,title
```

Or as a one-liner:

```bash
echo '\n# === Bell / Task Finish Notification ===\nbell-features = attention,title' >> ~/Library/Application\ Support/com.mitchellh.ghostty/config
```

Reload with `Cmd+Shift+,` or restart Ghostty.

### Step 2: Zsh Hooks + agent-watch

Append the following block to the **end** of `~/.zshrc`:

```zsh
# === Ghostty Task Finish Notifier ===
# When a long-running command finishes:
#   - Ghostty not focused → bring Ghostty to front + mark tab with 🔔
#   - Ghostty already focused → play sound + mark tab with 🔔
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

  # Run the command under `script` (preserves full TTY interactivity)
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
New tabs pick this up automatically.

### Step 3: Claude Code Hooks (optional — only if you use Claude Code)

Claude Code has its own hook system that fires on exact events (more precise than silence detection). This step is independent of Step 2.

#### 3a. Create the hook script

```bash
mkdir -p ~/.claude/hooks
```

Create `~/.claude/hooks/notify.sh` with the following content:

```bash
#!/bin/bash
# Claude Code Notification Hook
# Brings Ghostty to front (if unfocused) or plays sound (if focused)

NOTIFICATION=$(cat)
MESSAGE=$(echo "$NOTIFICATION" | jq -r '.message // empty' 2>/dev/null || echo "Claude is waiting for your input")
TITLE=$(echo "$NOTIFICATION" | jq -r '.title // empty' 2>/dev/null || echo "Claude Code")
[ -z "$MESSAGE" ] && MESSAGE="Claude is waiting for your input"
[ -z "$TITLE" ] && TITLE="Claude Code"

# BEL → Ghostty marks the tab with 🔔
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

> **Important:** The `command` path must be **absolute**. Replace `$HOME` with your actual home directory (e.g., `/Users/yourname/.claude/hooks/notify.sh`). If `settings.json` already exists, merge the `hooks` key — don't overwrite the entire file.

New Claude Code sessions will pick up the hooks automatically.

---

## Usage

```bash
# Claude Code — just run normally, hooks handle it:
claude

# Any other interactive agent — wrap with agent-watch:
agent-watch codex
agent-watch codex "fix the login bug"
agent-watch aider --model gpt-4
agent-watch opencode

# Regular shell commands — automatic (zsh hooks), no wrapper needed:
npm run build   # notifies if it takes >10s
```

## Customization

Set these in `~/.zshrc` (before the notifier block) or export in your shell:

```bash
GHOSTTY_NOTIFY_THRESHOLD=5                              # zsh hooks: notify after 5s instead of 10
AGENT_WATCH_IDLE=3                                       # agent-watch: notify after 3s of silence
GHOSTTY_NOTIFY_SOUND="/System/Library/Sounds/Ping.aiff"  # change notification sound
```

**Available macOS sounds** (in `/System/Library/Sounds/`):
Basso, Blow, Bottle, Frog, Funk, Glass, Hero, Morse, Ping, Pop, Purr, Sosumi, Submarine, Tink

## How It Works

### Layer 1: Ghostty bell-features
All notification layers send BEL (`\a`). Ghostty's `attention` feature bounces the dock icon, and `title` prepends 🔔 to the specific tab's title. The emoji clears when you focus the tab or type.

### Layer 2: Zsh precmd/preexec (regular commands)
`preexec` records the timestamp when any command starts. `precmd` fires when the shell prompt returns. If the elapsed time exceeds `GHOSTTY_NOTIFY_THRESHOLD`, it sends BEL and either brings Ghostty to front or plays a sound.

### Layer 3a: Claude Code hooks
Claude Code fires `Stop` when it finishes a response and `Notification` when it needs user input. Both trigger `notify.sh` which applies the same Ghostty logic. This is preferred over `agent-watch` for Claude because it's event-driven (no polling).

### Layer 3b: agent-watch (universal wrapper)
`script -q logfile <command>` runs the agent inside a pseudo-terminal (full colors, cursor, interactivity preserved). A background subshell polls the logfile's modification time every 2 seconds. When the file stops being written to for `AGENT_WATCH_IDLE` seconds after having been active, it triggers the notification. The temp file is cleaned up on exit.

## Troubleshooting

| Problem | Fix |
|---|---|
| No sound plays | Check System Settings → Sound → Alert volume is not muted |
| Ghostty doesn't come to front | Grant Accessibility permission: System Settings → Privacy & Security → Accessibility → Ghostty |
| `osascript` errors | First run may trigger a macOS permission dialog — approve it |
| `agent-watch` not found | Run `source ~/.zshrc` or open a new tab |
| BEL / 🔔 not appearing on tab | Ensure `bell-features = attention,title` is in Ghostty config and reload with `Cmd+Shift+,` |
| Claude Code hooks not firing | Check `~/.claude/settings.json` has the hooks section; start a **new** Claude session |
| `jq: command not found` | Install jq: `brew install jq` |

## Limitations

- No external API to programmatically **switch to** the finished tab — but the 🔔 emoji makes it visible which one completed
- `system` and `audio` Ghostty bell features are GTK-only (Linux); on macOS we use `afplay` instead
- `agent-watch` runs the agent in a pty-in-a-pty via `script` — very rare edge cases with some TUI apps
- The `script` log file grows during the session; automatically cleaned up on exit
- Codex CLI has no hook system, so you must use `agent-watch codex` for mid-session notifications

## Testing

```bash
# 1. Test zsh hooks (regular commands):
sleep 12
# → Switch to another app while waiting. Ghostty should come to front after 12s.
# → Stay in Ghostty on another tab. Should hear Glass sound + see 🔔.

# 2. Test agent-watch:
agent-watch sleep 8
# → Same behavior as above.

# 3. Test Claude Code hooks:
# Start claude in one tab, switch to another tab, ask Claude something.
# → When Claude responds, hear Glass sound + see 🔔 on the Claude tab.
```

## Quick Reference: All File Paths

| File | Purpose |
|---|---|
| `~/Library/Application Support/com.mitchellh.ghostty/config` | Ghostty bell-features config |
| `~/.zshrc` | Zsh hooks + agent-watch function |
| `~/.claude/settings.json` | Claude Code hook wiring |
| `~/.claude/hooks/notify.sh` | Shared notification script (Claude Code) |
