# Pi Orchestrator — Incident Log

> Auto-generated during testing. Each incident = one learning for making the system more deterministic.
> Format optimized for quick logging, pattern detection, and reducer/hook improvements.

---

### INC-001: Pi defaulted to amazon-bedrock instead of anthropic provider

**When:** 2026-03-12 17:58
**Phase:** stopped (never started)
**Model:** claude-opus-4-6 (intended)
**Component:** Pi Agent | auth | .pi/settings.json

#### What Happened
Pi started with `--model opus` but errored with "No API key found for amazon-bedrock." despite `.pi/settings.json` having `"defaultProvider": "anthropic"`. Pi's model routing resolved `claude-opus-4-6` to bedrock instead of anthropic.

#### Expected Behavior
Pi should use the provider specified in settings.json, or at minimum the provider that has valid credentials.

#### Root Cause
Pi v0.56.1 model routing resolves model IDs to providers based on the auto-generated models list, not the settings file's `defaultProvider`. The model ID `claude-opus-4-6` was mapped to `amazon-bedrock` in Pi's internal model registry. No `ANTHROPIC_API_KEY` was set in the environment (Claude Code uses OAuth, not API keys).

#### Fix Applied
Switched to `openai-codex` provider with user's Codex CLI subscription. Used explicit `--provider openai-codex` flag to bypass model routing ambiguity.

#### Determinism Opportunity
**GUARD**: `run.sh` should pre-flight check that the intended provider has valid credentials before starting Pi. Add: `pi --provider $PROVIDER --model $MODEL --check-auth` or equivalent validation. If no auth, fail fast with a clear message instead of starting Pi and then erroring.

---

### INC-002: Pi model routing picked azure-openai-responses for gpt-5.4 after /login

**When:** 2026-03-12 18:17
**Phase:** stopped (never started)
**Model:** gpt-5.4 (intended via openai-codex)
**Component:** Pi Agent | auth | model routing

#### What Happened
After successful `/login` to "ChatGPT Plus/Pro (Codex Subscription)", Pi still errored with "No API key found for azure-openai-responses." The model `gpt-5.4` was being routed to `azure-openai-responses` instead of `openai-codex`.

#### Expected Behavior
After logging into `openai-codex`, models available under that provider should route there automatically.

#### Root Cause
Pi's model routing doesn't consider which providers have valid auth. `gpt-5.4` may exist under multiple providers internally, and Pi picked the wrong one. The `defaultProvider` in settings.json was set to `openai-codex` but wasn't respected for model resolution.

#### Fix Applied
Used explicit `--provider openai-codex --model gpt-5.4` CLI flags. This bypasses the ambiguous model routing entirely.

#### Determinism Opportunity
**CONFIG**: Always use `--provider` flag in `run.sh`, never rely on model-name-to-provider auto-resolution. Update run.sh to accept `--provider` arg and always pass it to Pi. Also: **GUARD** in run.sh — after starting Pi, probe within 5s if Pi actually started (check for error messages in pane output).

---

### INC-003: GPT-5.4 analyzed docs instead of calling supervisor_start

**When:** 2026-03-12 18:19
**Phase:** stopped → supervisor_status called (but no supervisor_start)
**Model:** gpt-5.4 via openai-codex
**Component:** supervisor.ts | CLAUDE.md | Pi Agent prompt

#### What Happened
After receiving the task prompt, GPT-5.4 spent ~2 minutes reading CLAUDE.md, analyzing project docs, writing notes about "feedback needs", and calling `supervisor_status` — but never called `supervisor_start` to actually launch Claude Code in the orchestrator pane. Required manual nudge to proceed.

#### Expected Behavior
Pi should call `supervisor_start` with the task as `initial_prompt` immediately — that's the primary action. Doc reading can happen after.

#### Root Cause
GPT-5.4's reasoning style is more exploratory than Claude Opus. It wanted to "understand context" before acting. The supervisor agent prompt (`.pi/agents/supervisor.md`) and CLAUDE.md don't explicitly say "call supervisor_start FIRST, analyze SECOND."

#### Fix Applied
Manual nudge: "Stop reading docs. Call supervisor_start right now." Pi immediately complied.

#### Determinism Opportunity
**PROMPT**: Add explicit instruction to `.pi/agents/supervisor.md`: "When you receive a task, call supervisor_start IMMEDIATELY. Do not analyze docs first. The orchestrator will read its own docs." Also: **HOOK** — add a `before_agent_start` hook that checks if the user's first message contains a task, and if so, auto-injects "Call supervisor_start with this as initial_prompt" into the system prompt. **REDUCER** — add a `task_received` event type that auto-dispatches `start` if phase is `stopped`.

---

### INC-004: Pi v0.56.1 missing gpt-5.4 model

**When:** 2026-03-12 18:10
**Phase:** N/A (CLI error before start)
**Model:** gpt-5.4 (not found)
**Component:** Pi Agent | model registry

#### What Happened
`pi --model gpt-5.4` returned "Model not found" on Pi v0.56.1. Model only available in v0.57.1.

#### Expected Behavior
Either the model should exist, or run.sh should check Pi version meets minimum requirements.

#### Root Cause
Pi's model registry is auto-generated at build time. v0.56.1 was built before GPT-5.4 was released.

#### Fix Applied
Updated Pi: `npm install -g @mariozechner/pi-coding-agent@latest` → v0.57.1.

#### Determinism Opportunity
**GUARD**: `run.sh` should validate that the requested model exists before creating the tmux session. Add: `pi --list-models 2>&1 | grep -q "$MODEL" || { echo "Model $MODEL not found"; exit 1; }`. Also check Pi version meets minimum: `pi --version` >= required.

---

### INC-005: tmux send-keys failed — pane in scroll/copy mode

**When:** 2026-03-12 18:19
**Phase:** running
**Model:** N/A (tmux issue)
**Component:** tmux | supervisor nudge mechanism

#### What Happened
`tmux send-keys -t %0` failed with "not in a mode" because the user had scrolled back in the pane (copy mode active). The nudge couldn't be delivered.

#### Expected Behavior
Nudges should be deliverable regardless of pane scroll state.

#### Root Cause
tmux `send-keys` fails when the target pane is in copy mode. The user scrolled up to read output, which activated copy mode.

#### Fix Applied
Sent `q` key first to exit copy mode, then retried the send-keys.

#### Determinism Opportunity
**REDUCER**: The `manual_nudge` effect executor should always send `q` or `Escape` before `send_keys` to exit any copy mode. Add to `executeEffects()`: before every `send_keys` effect, prepend `tmux send-keys -t <pane> q 2>/dev/null` to defensively exit copy mode. This is a zero-cost no-op if not in copy mode.

---

### INC-006: Orchestrator Claude Code resumed another terminal's conversation

**When:** 2026-03-12 18:23
**Phase:** running (orchestrator spawned)
**Model:** claude-opus-4-6 (in orchestrator pane)
**Component:** supervisor.ts | Claude Code session management

#### What Happened
Claude Code launched in the orchestrator pane (`omniport-hh` directory) picked up an EXISTING active conversation from another terminal — an epic planning session writing Stories 10-11. Instead of starting fresh with our mockup task, it continued the epic planning work. The `initial_prompt` (sent 15s after launch) never overrode this.

#### Expected Behavior
Orchestrator Claude Code should start a FRESH conversation with only our task. It should never share/resume conversations from other terminals.

#### Root Cause
Claude Code stores conversations per-project at `~/.claude/projects/<hash>/`. When launched in the same directory where another Claude Code instance is actively running (the epic planning session), it either: (a) resumed the most recent conversation, or (b) picked up shared project state. The `--dangerously-skip-permissions` flag does not prevent conversation inheritance.

#### Fix Applied
Kill orchestrator Claude Code. Relaunch with `--no-session-persistence` or by passing the task directly via `-p` (print mode). Or: use a different working directory (subdirectory) to isolate sessions.

#### Determinism Opportunity
**CONFIG**: The `start` event's send_keys command must include a session isolation flag. Options:
1. `claude --dangerously-skip-permissions -p "TASK..."` — print mode, non-interactive, task directly embedded
2. Use a unique subdirectory per orchestrator run to isolate Claude's project hash
3. Add `--resume false` or equivalent flag if available
4. **BEST**: Pass the task via stdin or `-p` flag, not as a delayed `initial_prompt` sent 15s later. The 15s gap allows Claude to start working on stale context before receiving the actual task.

---

### INC-007: supervisor_stop didn't actually kill Claude Code — wrong session kept running

**When:** 2026-03-12 18:25
**Phase:** stopped (supervisor believed it killed Claude)
**Model:** claude-opus-4-6 (in orchestrator pane %2)
**Component:** supervisor.ts | stop effect

#### What Happened
After discovering INC-006 (wrong session), `supervisor_stop` was called with `kill: true`. The supervisor reported "Stopped. Claude killed." and transitioned to `stopped`. However, Claude Code in pane %2 was **never actually killed** — it continued running the epic planning session (Implementation Readiness Check) and consumed context down to 7%. The supervisor's "kill" only sends `Escape, C-c, C-c, C-c` — Claude Code catches these interrupts and continues.

#### Expected Behavior
`supervisor_stop` with `kill: true` should guarantee Claude Code is terminated. The process should not be running after stop returns.

#### Root Cause
The `stop` effect in `supervisor.ts` (line 261) only sends control keys: `["Escape", "C-c", "C-c", "C-c"]`. This is a "polite" interrupt that Claude Code can catch and ignore. Compare to `close_worker` (line 745) which correctly uses `tmux kill-pane -t <paneId>` after a 2s timeout — a hard kill. The supervisor stop effect lacks this hard kill fallback.

#### Fix Applied
TBD — need to add `tmux kill-pane` or `kill -9 <PID>` as fallback to supervisor_stop.

#### Determinism Opportunity
**REDUCER**: Add a hard-kill fallback to the `stop` effect chain:
1. Send `Escape, C-c, C-c, C-c` (polite)
2. Wait 3s
3. Check if process still alive: `tmux list-panes -t <pane> -F '#{pane_pid}'`
4. If still alive: `kill -9 <pid>` or `tmux respawn-pane -k -t <pane>`
5. Verify: re-check process is dead
Also: **GUARD** — heartbeat probe after stop should verify Claude is actually dead. If not, escalate to hard kill.

---

### INC-008: Replacement orchestrator spawned in Claude Code's internal terminal, not Ghostty

**When:** 2026-03-12 18:28
**Phase:** running (from Claude Code's perspective) but invisible to user
**Model:** claude-opus-4-6 (spawned by Claude Code as parent agent)
**Component:** Claude Code (parent) | tmux session management | visibility

#### What Happened
After INC-006/007, Claude Code (the parent agent assisting the user) attempted to relaunch the orchestrator. Instead of opening a new Ghostty window and attaching to the `lthread` tmux session (which is visible to the user), it ran tmux commands in its own internal terminal. The orchestrator was technically running but completely invisible to the user. Meanwhile, the old (wrong) Claude Code in %2 continued uninterrupted, creating a ghost orchestrator situation.

#### Expected Behavior
Any orchestrator (re)launch MUST be visible to the user. tmux sessions created from Claude Code's internal terminal are invisible. The launch must happen in a Ghostty pane/window.

#### Root Cause
No session registry exists to track:
1. Which tmux sessions are "ours" (orchestrator-managed)
2. Which terminal/TTY they were launched from
3. Whether the user can actually see them
Claude Code has no awareness of whether its bash commands produce visible output — it can create tmux sessions, panes, and run processes that the user never sees.

#### Fix Applied
TBD — need file-based session registry.

#### Determinism Opportunity
**CONFIG + GUARD**: Create a **session registry** file (`_bmad/session-registry.json`) that tracks:
1. `session_id`: unique per orchestrator run (UUID or timestamp)
2. `tmux_session`: tmux session name
3. `pane_ids`: map of role → pane ID
4. `pids`: map of pane ID → process PID
5. `launched_from`: TTY/terminal that created the session (ghostty vs internal)
6. `launched_at`: timestamp
7. `status`: active | stopped | stale
8. `task`: the current task description

**GUARD rules:**
- Before any launch: check registry for existing active sessions → refuse if already running
- After any stop: verify processes are dead, update registry
- On heartbeat: validate panes exist and have expected PIDs
- On orchestrator (re)launch from Claude Code: MUST use `osascript` to open Ghostty window, NEVER internal bash
