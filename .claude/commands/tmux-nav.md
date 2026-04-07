# tmux Navigation & Management Reference

Quick-lookup guide for navigating the Ghostty + tmux orchestrator setup.

---

## 1. Session Layout

```
tmux session: "orchestrator"
├── Window 0: "orchestrator"  ← YOU ARE HERE (the coordinator)
├── Window 1: "worker-1"      ← Dev agent working on a story
├── Window 2: "worker-2"      ← Another dev agent (parallel)
├── Window 3: "devserver"     ← pnpm dev (for E2E screenshots)
└── Window N: "worker-N"      ← More workers as needed
```

---

## 2. Essential tmux Commands

### Navigate

```bash
# List all windows
tmux list-windows

# Switch to window (keyboard: Ctrl-b + window number)
tmux select-window -t "worker-1"

# Switch back to orchestrator
tmux select-window -t "orchestrator"
```

### Read Worker Output

```bash
# Last 50 lines of a worker
tmux capture-pane -t "worker-1" -p -S -50

# Last 100 lines (for more context)
tmux capture-pane -t "worker-1" -p -S -100

# Check if Claude is running in the worker
tmux list-panes -t "worker-1" -F '#{pane_current_command}'
```

### Spawn Worker

```bash
# Create new window for a worker
tmux new-window -n "worker-1"

# Start Claude in the worker (CRITICAL: unset CLAUDECODE!)
tmux send-keys -t "worker-1" "cd /path/to/project && unset CLAUDECODE && claude --dangerously-skip-permissions" Enter

# Wait for Claude to initialize
sleep 15

# Send the task
tmux send-keys -t "worker-1" "Your task: implement Story 1.3..." Enter
```

### Send Commands to Worker

```bash
# Send text input
tmux send-keys -t "worker-1" "some instruction" Enter

# Send interrupt (Ctrl-C)
tmux send-keys -t "worker-1" C-c

# Send escape
tmux send-keys -t "worker-1" Escape
```

### Kill Worker

```bash
# Graceful: tell Claude to exit
tmux send-keys -t "worker-1" "/exit" Enter
sleep 5

# Force kill if needed
tmux kill-window -t "worker-1" 2>/dev/null
```

### Dev Server (for E2E)

```bash
# Start
tmux new-window -n "devserver"
tmux send-keys -t "devserver" "cd /path/to/project && pnpm dev" Enter

# Stop
tmux kill-window -t "devserver"
```

---

## 3. Keyboard Shortcuts (Ghostty + tmux)

```
Ctrl-b + 0-9    → Switch to window by number
Ctrl-b + n      → Next window
Ctrl-b + p      → Previous window
Ctrl-b + w      → Window list (interactive)
Ctrl-b + d      → Detach (session survives!)
Ctrl-b + [      → Scroll mode (q to exit)
```

---

## 4. Session Recovery

```bash
# List existing sessions
tmux ls

# Reattach to existing session
tmux attach -t orchestrator

# If no session exists, create one
tmux new-session -s orchestrator -n orchestrator -c /path/to/orchestrator
```

---

## 5. Ghostty-Specific Notes

- tmux runs inside Ghostty terminal
- Ghostty notifications via `osascript -e 'display notification "text" with title "Orchestrator"'`
- Ghostty supports splits too, but we use tmux windows instead (simpler, session persistence)
