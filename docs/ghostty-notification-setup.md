# Ghostty Task Finish Notification — Setup Guide

Notification system for Ghostty on macOS. When a long-running command or AI coding agent finishes in any tab/split:

- **Ghostty not focused** → brings Ghostty to front + marks tab with 🔔
- **Ghostty already focused** → plays a sound + marks tab with 🔔
- The 🔔 disappears automatically when you click the tab or type in it
- **Last agent response is copied to clipboard** (available in Maccy history)

## Prerequisites

- **macOS** (uses `osascript`, `afplay`, `stat -f`, `pbcopy`)
- **Ghostty** terminal (any version with `bell-features` support, v1.2.0+)
- **zsh** as default shell (macOS default)
- **jq** — for parsing hook payloads (`brew install jq`)
- **Maccy** — clipboard history manager (recommended, `brew install --cask maccy`)
- **Claude Code** — optional, for Claude-specific hooks (`npm install -g @anthropic-ai/claude-code`)
- **Codex CLI** — optional, v0.114.0+ for Codex hooks (`npm install -g @openai/codex`)

> **First-time macOS permission:** When the notification first fires, macOS will ask for **Accessibility** permission for Ghostty (needed for `osascript` to query/activate apps via System Events). Grant it in System Settings → Privacy & Security → Accessibility.

## Coverage

| Scenario | Works? | Mechanism | Clipboard? |
|---|---|---|---|
| Regular commands (`sleep`, `npm build`, etc.) | Yes | zsh `precmd` hooks | No |
| Claude Code finishes response | Yes | Claude Code Stop/Notification hooks | Yes |
| Codex CLI finishes response | Yes | Codex Stop hook | Yes |
| Exiting `claude` or `codex` entirely | Yes | zsh `precmd` hooks | No |
| `codex exec "..."` non-interactive | Yes | zsh `precmd` hooks | No |
| Any other interactive agent via `agent-watch` | Yes | `script` + mtime silence watcher | Yes |

## Architecture

```
Layer 1: Ghostty config        → bell-features (🔔 on tab, dock bounce)
Layer 2: Zsh precmd/preexec    → regular shell commands (>10s)
Layer 3a: Claude Code hooks    → Claude response → clipboard + notify
Layer 3b: Codex CLI hooks      → Codex response → clipboard + notify
Layer 3c: agent-watch wrapper  → ANY other agent → clipboard + notify via output silence
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
    local active_start_size=0
    while [[ -f "$tmplog" ]]; do
      sleep 2
      [[ -f "$tmplog" ]] || break
      local mtime=$(stat -f %m "$tmplog" 2>/dev/null || echo 0)
      local now=$(date +%s)
      local idle=$((now - mtime))
      if (( idle < 3 )); then
        if ! $was_active; then
          # Mark where this output burst started
          active_start_size=$(stat -f %z "$tmplog" 2>/dev/null || echo 0)
        fi
        was_active=true
        notified=false
      elif $was_active && ! $notified && (( idle >= AGENT_WATCH_IDLE )); then
        notified=true
        # Copy the last output burst to clipboard (strip ANSI escape codes)
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

Claude Code has its own hook system that fires on exact events (more precise than silence detection). The hook also copies Claude's response to the system clipboard so it's available in Maccy.

#### 3a. Create the hook script

```bash
mkdir -p ~/.claude/hooks
```

Create `~/.claude/hooks/notify.sh` with the following content:

```bash
#!/bin/bash
# Claude Code Notification Hook
# 1. Copies last response to system clipboard (available in Maccy history)
# 2. Brings Ghostty to front (if unfocused) or plays sound (if focused)

NOTIFICATION=$(cat)
MESSAGE=$(echo "$NOTIFICATION" | jq -r '.message // empty' 2>/dev/null || echo "Claude is waiting for your input")
TITLE=$(echo "$NOTIFICATION" | jq -r '.title // empty' 2>/dev/null || echo "Claude Code")
[ -z "$MESSAGE" ] && MESSAGE="Claude is waiting for your input"
[ -z "$TITLE" ] && TITLE="Claude Code"

# Copy response to clipboard (Maccy picks this up automatically)
if [ -n "$MESSAGE" ]; then
  printf '%s' "$MESSAGE" | pbcopy 2>/dev/null
fi

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

### Step 4: Codex CLI Hooks (optional — only if you use Codex CLI v0.114.0+)

Codex CLI added an experimental hooks engine in v0.114.0. The `Stop` hook fires when the agent finishes a response and receives `last_assistant_message` on stdin — perfect for clipboard integration.

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

> **Important:** Replace `$HOME` with your actual home directory (e.g., `/Users/yourname/.codex/hooks/notify.sh`).

#### 4c. Create the hook script

```bash
mkdir -p ~/.codex/hooks
```

Create `~/.codex/hooks/notify.sh` with the following content:

```bash
#!/bin/bash
# Codex CLI Notification Hook (Stop event)
# 1. Copies last assistant message to system clipboard (Maccy picks it up)
# 2. Brings Ghostty to front (if unfocused) or plays sound (if focused)

# Read hook data from stdin (Codex passes JSON with last_assistant_message)
INPUT=$(cat)

# Extract the last assistant message
LAST_MSG=$(echo "$INPUT" | jq -r '.last_assistant_message // empty' 2>/dev/null)

# Copy to system clipboard if we have content (Maccy history picks this up)
if [ -n "$LAST_MSG" ]; then
  printf '%s' "$LAST_MSG" | pbcopy 2>/dev/null
fi

# Send BEL to mark the Ghostty tab with 🔔
printf '\a'

# Check if Ghostty is the frontmost app
FRONTAPP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null)

if [ "$FRONTAPP" = "Ghostty" ]; then
  afplay "${GHOSTTY_NOTIFY_SOUND:-/System/Library/Sounds/Glass.aiff}" &>/dev/null &
else
  osascript -e 'tell application "Ghostty" to activate' &>/dev/null &
  osascript -e "display notification \"Codex finished\" with title \"Codex CLI\" sound name \"Glass\"" &
fi

# Must output valid JSON for Codex Stop hook (empty = allow stop)
echo '{}'
exit 0
```

Make it executable:

```bash
chmod +x ~/.codex/hooks/notify.sh
```

New Codex sessions will pick up the hooks automatically.

---

## Clipboard Workflow with Maccy

Both Claude Code and Codex hooks automatically copy the agent's last response to the system clipboard. Maccy keeps a history of all clipboard entries.

**Workflow:**
1. Agent finishes in Tab A → response is auto-copied to clipboard
2. Switch to Tab B (another agent or editor)
3. `Cmd+V` to paste the response directly
4. If you've copied something else since, open **Maccy** (`Cmd+Shift+C` by default) to find the agent response in clipboard history

**Cross-agent sharing:**
- Claude finishes → response in Maccy → switch to Codex tab → paste as context
- Codex finishes → response in Maccy → switch to Claude tab → paste as context
- No files needed, pure clipboard

---

## Usage

```bash
# Claude Code — just run normally, hooks handle notification + clipboard:
claude

# Codex CLI — just run normally (with hooks enabled), same behavior:
codex

# Any other interactive agent — wrap with agent-watch (notification + clipboard):
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
Claude Code fires `Stop` when it finishes a response and `Notification` when it needs user input. Both trigger `notify.sh` which copies the response to clipboard via `pbcopy` and applies the Ghostty notification logic.

### Layer 3b: Codex CLI hooks
Codex fires `Stop` when the agent finishes a response. The hook receives `last_assistant_message` in the JSON payload, copies it to clipboard via `pbcopy`, and triggers the same Ghostty notification. Must output `{}` on stdout (Codex requires valid JSON response from Stop hooks).

### Layer 3c: agent-watch (universal wrapper)
`script -q logfile <command>` runs the agent inside a pseudo-terminal (full colors, cursor, interactivity preserved). A background subshell polls the logfile's modification time every 2 seconds. When the file stops being written to for `AGENT_WATCH_IDLE` seconds after having been active, it extracts the last output burst from the log, strips ANSI escape codes, copies it to clipboard via `pbcopy`, and triggers the notification. The temp file is cleaned up on exit.

## Troubleshooting

| Problem | Fix |
|---|---|
| No sound plays | Check System Settings → Sound → Alert volume is not muted |
| Ghostty doesn't come to front | Grant Accessibility permission: System Settings → Privacy & Security → Accessibility → Ghostty |
| `osascript` errors | First run may trigger a macOS permission dialog — approve it |
| `agent-watch` not found | Run `source ~/.zshrc` or open a new tab |
| BEL / 🔔 not appearing on tab | Ensure `bell-features = attention,title` is in Ghostty config and reload with `Cmd+Shift+,` |
| Claude Code hooks not firing | Check `~/.claude/settings.json` has the hooks section; start a **new** Claude session |
| Codex hooks not firing | Check `codex_hooks = true` in `~/.codex/config.toml` [features]; verify Codex v0.114.0+ (`codex --version`) |
| `jq: command not found` | Install jq: `brew install jq` |
| Clipboard not updating | Verify `pbcopy` works: `echo test \| pbcopy` then `Cmd+V` |
| Maccy not showing entries | Ensure Maccy is running; check Maccy preferences for clipboard monitoring |

## Limitations

- No external API to programmatically **switch to** the finished tab — but the 🔔 emoji makes it visible which one completed
- `system` and `audio` Ghostty bell features are GTK-only (Linux); on macOS we use `afplay` instead
- `agent-watch` runs the agent in a pty-in-a-pty via `script` — very rare edge cases with some TUI apps
- The `script` log file grows during the session; automatically cleaned up on exit
- Codex hooks are experimental (v0.114.0) — schema may change in future versions
- Clipboard copies may be truncated for very long responses (system clipboard has no hard limit, but Maccy may truncate display)

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
# → Open Maccy (Cmd+Shift+C) — Claude's response should be in clipboard history.

# 4. Test Codex hooks:
# Start codex in one tab, switch to another tab, ask Codex something.
# → When Codex responds, hear Glass sound + see 🔔 on the Codex tab.
# → Open Maccy — Codex's response should be in clipboard history.
```

## Quick Reference: All File Paths

| File | Purpose |
|---|---|
| `~/Library/Application Support/com.mitchellh.ghostty/config` | Ghostty bell-features config |
| `~/.zshrc` | Zsh hooks + agent-watch function |
| `~/.claude/settings.json` | Claude Code hook wiring |
| `~/.claude/hooks/notify.sh` | Claude Code notification + clipboard script |
| `~/.codex/config.toml` | Codex feature flags (`codex_hooks = true`) |
| `~/.codex/hooks.json` | Codex hook wiring |
| `~/.codex/hooks/notify.sh` | Codex notification + clipboard script |
