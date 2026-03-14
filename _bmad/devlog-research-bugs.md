# L-Thread Orchestrator — Bug & Incident Research Log

> Compiled: 2026-03-14
> Sources: `pi-orchestrator/_bmad/incidents.md`, `CHANGELOG.md`, git history,
>          `pi-orchestrator/.bmad/devlog.md`, `pi-orchestrator/_bmad/agent-activity.jsonl`,
>          `.claude/agents/orchestrator.md`, `.claude/commands/roadblock-recovery.md`,
>          and `supervisor.ts` inline comments.
>
> Two incident namespaces exist:
> - **INC-001–INC-008**: Pi Orchestrator incidents (live-test session 2026-03-12/14),
>   logged in `pi-orchestrator/_bmad/incidents.md`
> - **INC-001/INC-002/INC-004/INC-007/INC-009/INC-011/INC-013–INC-015**: L-Thread
>   Conduit-era incidents from the now-missing `memory/FutureLearnings.md` file,
>   referenced only via `roadblock-recovery.md` and research docs.
>
> **Naming collision note**: INC-001 and INC-007 appear in BOTH namespaces with
> completely different content. The Pi incidents take the authoritative numbering.

---

## Part 1 — Pi Orchestrator Incidents (2026-03-12 to 2026-03-14)

These were logged live during the first Pi supervisor test sessions and are
stored in `pi-orchestrator/_bmad/incidents.md`.

---

### INC-001 (Pi): Pi defaulted to amazon-bedrock instead of anthropic provider

**When:** 2026-03-12 17:58
**Component:** Pi Agent model routing / `.pi/settings.json`

**Description:** Pi started with `--model opus` but errored immediately with
"No API key found for amazon-bedrock." despite `.pi/settings.json` having
`"defaultProvider": "anthropic"`.

**Root cause:** Pi v0.56.1 resolves model IDs to providers using an
auto-generated internal model registry, not `settings.json`. The model
`claude-opus-4-6` was registered to `amazon-bedrock`. Claude Code uses OAuth,
not an API key, so no `ANTHROPIC_API_KEY` was present.

**Fix:** Switched to `openai-codex` provider with explicit `--provider
openai-codex` flag in `run.sh`. Bypasses model-routing ambiguity entirely.

**Commit:** Not isolated to a single commit — carried through all Pi commits.
`run.sh` in the repo uses `--provider openai-codex` as the default.

**Impact without fix:** Pi exits immediately at startup before any supervisor
logic runs. The entire orchestration session fails to launch.

**Lessons learned:** Never rely on Pi's auto-provider resolution. Always pass
`--provider` explicitly. The `defaultProvider` key in `settings.json` is
effectively non-functional for model-to-provider mapping.

---

### INC-002 (Pi): Pi routed gpt-5.4 to azure-openai-responses after /login

**When:** 2026-03-12 18:17
**Component:** Pi Agent model routing / auth

**Description:** After successfully running `/login` to authenticate with
"ChatGPT Plus/Pro (Codex Subscription)", Pi still errored "No API key found
for azure-openai-responses." The model `gpt-5.4` was being routed to
`azure-openai-responses` rather than `openai-codex`.

**Root cause:** `gpt-5.4` exists under multiple providers in Pi's internal
model registry (both `openai-codex` and `azure-openai-responses`). The
`defaultProvider` setting was not respected during model resolution, and Pi
picked the wrong provider variant.

**Fix:** Used explicit `--provider openai-codex --model "gpt-5.4:xhigh"` in
`run.sh`. This is now the hardcoded default.

**Commit:** Same as INC-001 — the fix is baked into `run.sh`.

**Impact without fix:** Session never starts. Wasted auth cycle. Confusing error
that doesn't mention the provider ambiguity.

**Lessons learned:** The `:xhigh` quality suffix also prevents routing
ambiguity. Always specify both `--provider` and a fully-qualified model ID.

---

### INC-003 (Pi): GPT-5.4 analyzed docs instead of calling supervisor_start

**When:** 2026-03-12 18:19
**Component:** supervisor.ts / Pi Agent prompt / `.pi/agents/supervisor.md`

**Description:** After receiving the task prompt, GPT-5.4 spent ~2 minutes
reading `CLAUDE.md`, analyzing project docs, writing notes — but never called
`supervisor_start` to launch Claude Code in the orchestrator pane. Required a
manual nudge ("Stop reading docs. Call supervisor_start right now.").

**Root cause:** GPT-5.4 has a more exploratory reasoning style than Claude
Opus. It wanted to "understand context" before acting. Neither
`supervisor.md` nor `CLAUDE.md` contained an explicit "call supervisor_start
FIRST" instruction.

**Fix (partial):** Manual nudge resolved the immediate instance. No code fix
applied. The incident note recommends adding an explicit instruction to
`supervisor.md`: "When you receive a task, call supervisor_start IMMEDIATELY."

**Commit:** Not yet fixed programmatically (as of 2026-03-14).

**Impact without fix:** Session delay of 2–10 minutes depending on how much
context GPT-5.4 wants to read. In AUTO-MODE this never self-resolves — the
supervisor would loop indefinitely in "analyzing docs" state.

**Lessons learned:** Model-specific prompt engineering matters. GPT-5.4 and
Claude Opus respond differently to the same instructions. Supervisor prompts
should specify action priority explicitly: "First: call supervisor_start.
Second: read docs."

---

### INC-004 (Pi): Pi v0.56.1 missing gpt-5.4 model

**When:** 2026-03-12 18:10
**Component:** Pi Agent model registry

**Description:** `pi --model gpt-5.4` returned "Model not found" on Pi v0.56.1.
The model was only available starting v0.57.1.

**Root cause:** Pi's model registry is auto-generated at build time from the
upstream APIs. v0.56.1 was built before GPT-5.4 was released. No minimum
version check existed in `run.sh`.

**Fix:** Updated Pi globally: `npm install -g @mariozechner/pi-coding-agent@latest`
(→ v0.57.1). Added an INC-004 guard to `run.sh`:

```bash
# Check model availability (INC-004 guard)
if ! pi --list-models "$MODEL" 2>&1 | grep -q "$MODEL"; then
    echo "ERROR: Model '$MODEL' not found in Pi Agent."
    pi --list-models 2>&1 | head -20
    exit 1
fi
```

**Commit:** Guard present in current `run.sh`. The Pi upgrade itself was
manual (no commit).

**Impact without fix:** `run.sh` would start Pi, which would immediately
exit with "Model not found". The supervisor pane would start and immediately
die. The heartbeat would detect this as a crash and keep restarting Pi in a
crash-loop.

**Lessons learned:** Always gate on model availability before launching. Version
mismatch errors are especially confusing because they look like provider auth
errors at first glance.

---

### INC-005 (Pi): tmux send-keys failed — pane in scroll/copy mode

**When:** 2026-03-12 18:19
**Component:** tmux / supervisor nudge mechanism

**Description:** `tmux send-keys -t %0` failed with "not in a mode" because the
user had scrolled up to read output (tmux copy mode was active). The supervisor's
nudge/send could not be delivered to the orchestrator pane.

**Root cause:** tmux `send-keys` silently fails when the target pane is in
copy mode. The user scrolling back in the terminal automatically activates
copy mode.

**Fix:** The pre-cmux fix was to always send a `q` key before any `send_keys`
to exit copy mode first. This was implemented in the `reduce()` function for
both the `manual_nudge` event and the auto-nudge event:

```typescript
// Defensive: exit copy mode before sending (INC-005 fix)
fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["q"] });
```

After the **cmux migration** (commit `915ec76`), this workaround became
irrelevant because cmux has no copy/scroll mode. The `q` send is now a no-op
guarded by a skip:

```typescript
case "send_control":
    for (const key of fx.keys) {
        // Skip "q" — was tmux copy-mode exit (INC-005), meaningless in cmux
        if (key === "q") continue;
```

The `send_control` reducer path still emits the `q` key (for backward compat)
but `executeEffects()` discards it in cmux mode.

**Commit:** Original fix in the tmux-era supervisor. cmux no-op guard added in
commit `bcd3757` (the cmux send/split bug fix commit). Also documented in
`supervisor.ts` line 2317 and `cmux-client.ts` line 43.

**Impact without fix (pre-cmux):** Nudges silently fail to reach the
orchestrator. The silence timer resets but the orchestrator never receives the
nudge. After 3 failed nudges, the supervisor escalates to restart, killing a
potentially healthy orchestrator session.

**Lessons learned:** Any send-keys operation against a user-facing terminal must
defensively handle scroll state. The INC-005 pattern (send exit-mode key before
payload) is now codified even though it's a no-op on cmux — future terminal
backends should be aware of this historical requirement.

---

### INC-006 (Pi): Orchestrator Claude Code resumed a different terminal's conversation

**When:** 2026-03-12 18:23
**Component:** supervisor.ts / Claude Code session management

**Description:** Claude Code launched in the orchestrator pane (omniport-hh
directory) picked up an existing active conversation from another terminal —
an epic planning session writing Stories 10-11. Instead of starting fresh,
it continued the unrelated work. The `initial_prompt` (sent 15 seconds after
launch) never overrode this.

**Root cause:** Claude Code stores conversations per-project at
`~/.claude/projects/<hash>/`. When launched in the same directory where another
Claude Code instance was actively running, it resumed the most recent
conversation rather than starting fresh. The `--dangerously-skip-permissions`
flag does not prevent conversation inheritance.

**Fix:** No programmatic fix yet. The recommended approach is to pass the task
via the `-p` flag (print mode) directly at launch time rather than sending
it as a delayed `initial_prompt` 15 seconds later. The 15-second gap is the
attack surface.

**Commit:** Not yet fixed. Tracked as an open issue in `incidents.md`.

**Impact without fix:** Orchestrator executes a completely different task from
the one assigned. If AUTO-MODE is on and the orphaned session creates PRs or
modifies code, those changes appear in the project under the wrong branch
context. Extremely confusing debugging situation.

**Lessons learned:** The 15-second delayed `initial_prompt` pattern is
fundamentally fragile. Claude Code has a greedy conversation-resume behavior.
The supervisor should pass tasks via `-p "..."` at launch time, not via delayed
`send_keys`. See `supervisor_start` tool implementation.

---

### INC-007 (Pi): supervisor_stop didn't kill Claude Code — wrong session kept running

**When:** 2026-03-12 18:25
**Component:** supervisor.ts / stop effect executor

**Description:** After discovering INC-006, `supervisor_stop` was called with
`kill: true`. The supervisor reported "Stopped. Claude killed." and transitioned
to `stopped`. However, Claude Code in pane %2 continued running (the epic
planning session consuming context down to 7%). The "kill" only sent
`Escape, C-c, C-c, C-c` — Claude Code catches these and continues.

**Root cause:** The original `stop` effect only used polite signal keys. Claude
Code is designed to catch `Ctrl+C` and prompt "are you sure?" rather than
exiting. The `close_worker` function already had the correct pattern (`tmux
kill-pane` after 2s) but `stop` did not.

**Fix:** Added a `hard_kill` effect to the stop path in the reducer:

```typescript
case "stop": {
    // Polite interrupt first
    fx.push({ type: "send_control", paneId: layout.orchestratorPaneId, keys: ["Escape", "C-c", "C-c", "C-c"] });
    // Hard kill after 3s if still alive (INC-007 fix)
    fx.push({ type: "hard_kill", paneId: layout.orchestratorPaneId, delayMs: 3000 });
```

The `hard_kill` effect calls `cmux close-surface --surface <id>` (previously
`tmux kill-pane -t <pane>`) after a 3-second delay, guaranteeing termination.

Also documented in supervisor system prompt (line 2318):
```
- Hard kill on stop -> polite C-c then kill -9 after 3s (INC-007)
```

**Commit:** `588b467` (supervisor mode — session registry, pause/resume,
hard kill). The hard kill was part of the initial supervisor implementation
following this incident.

**Impact without fix:** `supervisor_stop` is dishonest — it returns "stopped"
but Claude Code keeps running. Any subsequent `supervisor_start` will then
have two Claude Code instances in the same pane. The session registry shows
"stopped" but the terminal is still consuming API tokens.

**Lessons learned:** "Polite" process interruption (C-c) is not a kill. Any
`stop` command with `kill: true` must have a guaranteed hard-kill fallback.
The 3-second delay gives Claude Code time to checkpoint gracefully before
forced termination.

---

### INC-008 (Pi): Replacement orchestrator spawned in Claude Code's internal terminal

**When:** 2026-03-12 18:28
**Component:** Claude Code (parent) / tmux session management / visibility

**Description:** After INC-006/007, Claude Code (the parent agent assisting
the user) attempted to relaunch the orchestrator. Instead of opening in a
visible Ghostty window, it ran tmux commands in its own internal terminal.
The orchestrator was technically running but invisible to the user. Meanwhile
the old wrong Claude Code session continued uninterrupted.

**Root cause:** No session registry existed to track which sessions were
"ours" and which terminal/TTY they were launched from. Claude Code has no
awareness of whether its bash commands produce visible output — it can create
tmux sessions and processes that the user never sees.

**Fix:** Implemented the file-based session registry (`_bmad/session-registry.json`)
as a direct result of this incident. The registry tracks:
- `session_id`, `terminal_session`, `launched_at`, `status`, `task`
- `panes`: map of role → pane_id + pid
- `agents`: per-agent records with role, model, timestamps, status

`run.sh` writes the registry at launch, checks for existing active sessions
before starting, and guards against duplicate launches.

**Commit:** `588b467` (supervisor mode — session registry, pause/resume, hard kill).

**Impact without fix:** Phantom orchestrators running background work that the
user cannot observe, monitor, or kill. Multiple simultaneous orchestrators on
the same project creates race conditions on git branches and state files.

**Lessons learned:** Any system that spawns processes across multiple terminals
needs an external registry (not just process state). The registry must be
written before the session starts and checked before spawning a new one.

---

## Part 2 — CMUX-Era Bugs (2026-03-14, Pi Orchestrator)

These bugs were discovered during the cmux migration and live testing session.
They are documented in commit messages and MEMORY.md but not in a separate
incidents file.

---

### CMUX-BUG-01: cmux new-split returns "OK surface:N workspace:M" — not a bare ref

**When:** 2026-03-14 (cmux migration, commit `bcd3757`)
**Component:** supervisor.ts / run.sh / pane-workers.sh / cmux-client.ts

**Description:** Code that called `cmux new-split right --surface <id>` expected
the output to be a bare surface reference like `surface:5`. The actual output
format is `OK surface:N workspace:M` (e.g., `OK surface:9 workspace:1`). The
raw output was being stored as the `paneId`, causing all subsequent cmux
commands to fail silently (passing `"OK surface:9 workspace:1"` as a surface
ID is invalid).

This was confirmed from `agent-activity.jsonl` line 1:
```json
"surfaces": {
  "orchestrator": "OK surface:9 workspace:1",  ← the bug
  "workers": "OK surface:8 workspace:1"         ← the bug
}
```

**Root cause:** The cmux CLI uses a standardized `OK <result>` output format
for mutation commands. The code assumed the entire stdout was the new surface
ref, not a prefixed response.

**Fix:** Added regex extraction in all 6 call sites:

In `run.sh`:
```bash
parse_surface_ref() {
    echo "$1" | grep -o 'surface:[0-9]*'
}
WORKERS_RAW=$(cmux new-split right --surface "$SUPERVISOR_SURFACE" 2>&1 || true)
WORKERS_SURFACE=$(parse_surface_ref "$WORKERS_RAW")
```

In `supervisor.ts`:
```typescript
const newPaneRaw = cmux(`new-split up --surface "${topPaneId}"`);
const newPaneId = newPaneRaw.match(/surface:\d+/)?.[0] || newPaneRaw;
```

In `cmux-client.ts` (`splitSurface()` function):
```typescript
const raw = exec(`cmux new-split ${direction} --surface "${surfaceId}" 2>/dev/null`);
return raw.match(/surface:\d+/)?.[0] || raw;
```

**Commit:** `bcd3757`

**Impact without fix:** All surface IDs stored in `pane-layout.json` are
invalid. Every subsequent `cmux send`, `cmux read-screen`, `cmux rename-tab`
call silently fails. The supervisor cannot send nudges, read output, or
control any pane. The system appears to start successfully but all I/O is dead.

**Lessons learned:** When integrating a CLI tool, always check the exact output
format for mutation commands — many CLIs use `OK <result>` or `{"success": true,
"result": ...}` rather than returning the bare result. Test with `echo` before
integrating.

---

### CMUX-BUG-02: cmux send does not press Enter — requires separate send-key Enter

**When:** 2026-03-14 (cmux migration, commit `bcd3757`)
**Component:** supervisor.ts / run.sh / pane-workers.sh / cmux-client.ts (6 locations)

**Description:** `cmux send --surface <id> '<text>'` types the text into the
terminal but does NOT submit it (no Enter key press). This is by design in the
cmux API — `send` is a raw text injection, not a "type and submit" operation.
The original code only called `cmux send` and assumed the command would run,
which meant commands were typed but never executed. The orchestrator and
worker panes appeared to receive commands but nothing ran.

This is in contrast to the tmux equivalent `tmux send-keys ... Enter` which
appends the Enter key as part of the same call.

**Root cause:** API design difference between tmux and cmux. tmux `send-keys`
appends key names inline (e.g., `'text' Enter`). cmux separates text injection
(`send`) from key injection (`send-key`), requiring two separate calls.

**Fix:** All 6 call sites updated to follow `cmux send` with `cmux send-key Enter`:

In `supervisor.ts` (effect executor):
```typescript
case "send_keys": {
    const escaped = fx.text.replace(/'/g, "'\\''");
    cmux(`send --surface "${fx.paneId}" '${escaped}'`);
    cmux(`send-key --surface "${fx.paneId}" Enter`);
    break;
}
```

In `run.sh`:
```bash
cmux send --surface "$WORKERS_SURFACE" "echo '── Workers will appear here ──'" 2>/dev/null || true
cmux send-key --surface "$WORKERS_SURFACE" Enter 2>/dev/null || true
```

In `pane-workers.sh`:
```bash
cmux send --surface "$pane_id" "cd '$directory' && ... claude $flags" 2>/dev/null
cmux send-key --surface "$pane_id" Enter 2>/dev/null || true
```

In `cmux-client.ts` (`sendText()` function):
```typescript
export function sendText(surfaceId: string, text: string): boolean {
    const escaped = text.replace(/'/g, "'\\''");
    exec(`cmux send --surface "${surfaceId}" '${escaped}' 2>/dev/null`, 5000);
    exec(`cmux send-key --surface "${surfaceId}" Enter 2>/dev/null`, 5000);
    return true;
}
```

**Commit:** `bcd3757`

**Impact without fix:** All commands sent to orchestrator and worker panes are
typed but not executed. Panes show the typed text sitting at the prompt.
Workers never start. Claude Code is never launched. The supervisor sees all
panes as "idle" (nothing running) and immediately starts nudging/restarting
in a confused loop.

**Lessons learned:** When migrating between terminal multiplexers, verify the
exact semantics of the text-send primitive. "Type text" and "type text and
press Enter" are different operations and must be tested explicitly.

---

### CMUX-BUG-03: Registry scope in pure reducer — closure variable not accessible

**When:** 2026-03-14 (commit `6deff3b`)
**Component:** supervisor.ts / reduce() function

**Description:** The `reduce()` function in `supervisor.ts` is a pure function
that takes `(state, event, config)` and returns `[newState, effects]`. It
accesses no external I/O or closure variables by design. However, the code
inside the `heartbeat` → `silent` → nudge path referenced `registry` (a module-level
variable holding the session registry):

```typescript
// WRONG: registry is not in scope for a pure reducer
const task = registry?.session?.task;
```

This caused a ReferenceError at runtime when the nudge path was triggered.

**Root cause:** The `registry` variable is maintained in the module scope and
mutated by I/O functions (`loadRegistry`, `persistRegistry`). Because
`reduce()` is architecturally pure (takes only its arguments), it cannot
access module-level mutable state. The task information needed for smart nudge
context was already available via `s.task` (the state object) since
`supervisor_start` sets it, but the code incorrectly reached for the registry
instead.

**Fix:** Changed one line in the `heartbeat` event handler:

```typescript
// Was:
const task = registry?.session?.task;
// Fixed:
const task = s.task;
```

**Commit:** `6deff3b`

**Impact without fix:** Any heartbeat probe that finds the orchestrator in
`silent` state throws a ReferenceError. The error is caught by the try/catch
around the reducer, the heartbeat returns without emitting a nudge, and the
silence grows indefinitely. The supervisor never nudges a stuck orchestrator,
defeating the watchdog's primary function.

**Lessons learned:** Pure reducer functions must enforce their purity at the
type/lint level. TypeScript does not prevent closure access, so discipline is
required. All data needed by `reduce()` must be passed in via the state or
event objects. Regular audits should check for any accidental closure access.

---

### CMUX-BUG-04: Double-window bug — supervisor_start opens phantom cmux window

**When:** 2026-03-14 (identified, not yet fixed as of this writing)
**Component:** supervisor.ts / cmux workspace scoping

**Description:** When `supervisor_start` is called, the `send_keys` effect sends
a `cmux send` command to the orchestrator surface. In some conditions, instead
of typing into the existing orchestrator surface (bottom-left of current
workspace), cmux opens a new window or targets a surface in a different
workspace. The orchestrator appears to "not respond" when in fact it launched
in an invisible location.

**Root cause:** `cmux send --surface <id>` without `--workspace` scoping can
target a surface in a different workspace context if a surface with the same
short ref exists in another workspace. Short refs like `surface:5` are
workspace-scoped but `cmux` prior to v0.62 may resolve ambiguously if the
workspace context is missing.

**Fix (applied, CMUX-BUG-04):** Added automatic workspace scoping to all cmux
calls. A module-level `_cmuxWorkspaceId` variable is set during extension init
from `pane-layout.json`. The `cmux()` wrapper function appends
`--workspace <id>` to every command:

```typescript
let _cmuxWorkspaceId = "";

/** Execute a cmux command with automatic workspace scoping.
 *  Appends --workspace to prevent cross-workspace surface targeting
 *  which causes cmux to open phantom windows. */
function cmux(args: string, timeout = 5000): string {
    const ws = _cmuxWorkspaceId ? ` --workspace "${_cmuxWorkspaceId}"` : "";
    return exec(`cmux ${args}${ws} 2>/dev/null`, timeout);
}
```

Also documented in `supervisor.ts` line 554:
```
// All commands use explicit --workspace scoping to prevent phantom windows.
```

**Status:** Fix is in current `supervisor.ts`. The workspace ID is read from
`pane-layout.json.workspaceId` (written by `run.sh` from `$CMUX_WORKSPACE_ID`).
Whether this fully resolves the bug in all cases is not yet confirmed — MEMORY.md
still lists this as "NEXT" priority for validation.

**Impact without fix:** `supervisor_start` sends Claude Code's launch command to
a phantom/wrong surface. The orchestrator pane shows no activity. The supervisor
starts nudging "continue" to an empty pane, consuming nudge budget and
eventually triggering a forced restart, which also targets the wrong surface.
Complete loss of orchestration capability.

**Lessons learned:** Always scope cmux commands to a specific workspace ID.
Never rely on surface short refs without workspace context — they are only
unique within a workspace, not globally.

---

### CMUX-BUG-05: Google Antigravity provider — const schema incompatibility

**When:** 2026-03-14 (live testing, not in incidents.md — documented in MEMORY.md)
**Component:** Pi Agent / Google Antigravity provider / tool schema

**Description:** When running Pi with `--provider google-antigravity --model
claude-opus-4-6-thinking`, tool registration failed. Pi's tool definitions use
TypeBox schemas, which generate JSON Schema with `const` fields (used for
enum-like string literals). The Google Antigravity provider's API does not
support the `const` keyword in JSON Schema tool definitions, causing the
provider to reject all tool registrations.

**Root cause:** JSON Schema `const` is a newer keyword (draft-7+). Google's
Vertex AI / Antigravity proxy uses an older version of the JSON Schema
specification for function calling / tool definitions that does not recognize
`const`. TypeBox (used by Pi for schema generation) emits `const` for
TypeBox's `Type.Literal()` constructs. All Pi tool definitions use TypeBox,
so all 15 supervisor tools are incompatible.

**Fix:** No fix applied. Abandoned `google-antigravity` as a provider for the
supervisor. The system defaults to `openai-codex` with `gpt-5.4:xhigh`.

**Commit:** N/A (no code fix). Documented in `MEMORY.md` as a known limitation.

**Impact without fix:** All 15 supervisor tools fail to register. Pi starts but
cannot accept any tool calls. The supervisor is functionally inoperative on
the Antigravity provider.

**Lessons learned:** Before testing a new provider, verify its JSON Schema
version for tool definitions. `const` fields are the most common compatibility
issue. A future fix would be a schema transformer that converts `const: "value"`
to `enum: ["value"]` for providers with limited schema support.

---

## Part 3 — L-Thread Conduit-Era Incidents

These incidents predate the Pi Orchestrator. They were logged in
`memory/FutureLearnings.md` (no longer in this repo — the file existed in a
project-specific repo for the Lagerlink/OmniPort-HH gov SaaS work). They are
known only through the pattern table in
`.claude/commands/roadblock-recovery.md` and references in research docs.

---

### L-INC-001: Database connection hanging — postgres.js config

**Component:** Backend / Drizzle ORM / postgres.js

**Description:** Postgres connections hung indefinitely in serverless/edge
deployment (Vercel/Supabase). Dev agents reported DB queries timing out after
deploy even though the same queries worked in local development.

**Root cause:** postgres.js default behavior: pre-warms a connection pool on
startup, which is incompatible with serverless/edge environments that
freeze/unfreeze processes. The pre-warm hangs because there is no persistent
process to keep the pool alive.

**Fix:** Add `prepare: false` to the postgres.js connection config:
```typescript
const sql = postgres(connectionString, { prepare: false });
```

Also: use heredoc for curl to avoid shell-escaped JSON:
```bash
curl -d @- <<'EOF'
{ "key": "value with 'quotes'" }
EOF
```
(Shell-escaped JSON causes `SyntaxError: Bad escaped character` in Node.js
JSON.parse.)

**Impact without fix:** All database operations fail silently in production.
The app appears to load but any data fetch returns a timeout error.

---

### L-INC-002: Zod validation schema mismatch

**Component:** API routes / Zod schema / TypeScript types

**Description:** API agents returned 400 errors on seemingly valid requests.
Error message: `"invalid value, allowed: ..."`.

**Root cause:** TypeScript types and Zod runtime schemas drifted out of sync
during iterative development. The TypeScript type accepted a union of values
that the Zod schema did not include. Agents updated TypeScript types without
updating the paired Zod schema.

**Fix:** Update the Zod schema to match the TypeScript type. Create a
lint/test rule that verifies schema/type parity.

**Impact without fix:** Runtime validation failures on valid requests. Very
difficult to debug because the TypeScript type "looks correct" and the error
message is vague.

---

### L-INC-004: Tests pass locally, fail on deploy

**Component:** E2E testing / deployment

**Description:** Dev agents marked tasks as done because tests passed locally.
Tests failed after deploy.

**Root cause:** Tests were run against `localhost` rather than the deployed URL.
Environment-specific behaviors (SSL, CORS, auth redirects) only manifest against
the real deployment.

**Fix:** Always test against the deployed URL, not localhost. E2E scripts must
target the production/staging URL.

---

### L-INC-007 (L-Thread): XSS in markdown rendering

**Component:** Frontend / rehype-raw / markdown renderer

**Description:** User-supplied markdown content was being rendered with raw HTML
passthrough (`rehype-raw`), creating an XSS vulnerability. Malicious `<script>`
tags in markdown were executed in the browser.

**Root cause:** `rehype-raw` allows raw HTML through the markdown pipeline.
Without a sanitization step, this passes `<script>`, `<iframe>`, and event
handlers directly to the DOM.

**Fix:** Add `rehype-sanitize` alongside `rehype-raw` in the remark/rehype
pipeline. The sanitizer strips dangerous HTML while preserving benign formatting.

**Note:** This is the L-Thread Conduit-era INC-007, not to be confused with
the Pi Orchestrator INC-007 (supervisor_stop hard kill), which has the same
number in a different namespace.

---

### L-INC-009: N+1 query performance

**Component:** Backend API / database queries

**Description:** List endpoints were slow (100–500ms+) due to N+1 query patterns.

**Root cause:** Agent-written code fetched a list of records, then for each
record fetched related data in a loop. Each loop iteration issued a separate
DB query.

**Fix:** Replace loop-based fetching with JOIN queries that retrieve related
data in a single round-trip.

---

### L-INC-011: Pagination returning all results

**Component:** Backend API / pagination

**Description:** Pagination endpoints ignored the `page`/`limit` parameters
and returned all rows.

**Root cause:** Agent used JavaScript `.slice()` on an array that was already
fetched in full from the database. This means `limit` applied to the
JavaScript array but all rows were still transferred from the DB.

**Fix:** Use `LIMIT`/`OFFSET` in the SQL query, not post-fetch `.slice()`.

---

### L-INC-013: Chrome DevTools MCP instability / long prompts via terminal-write

**Component:** Conduit terminal-write / Chrome DevTools MCP

**Description (a):** Chrome DevTools MCP would become unresponsive after a series
of rapid tool calls, particularly after `navigate_page` or complex `evaluate_script`
operations. Recovery required re-opening the browser context.

**Description (b):** `conduit terminal-write -p <pane> -e "<prompt>"` failed
silently or truncated when the prompt exceeded ~2000 characters. Long E2E test
instructions were being silently dropped.

**Root cause (a):** The Chrome DevTools MCP server loses its WebSocket
connection to the browser tab under high load. No reconnect logic in the MCP
client.

**Root cause (b):** `conduit terminal-write` has an undocumented character limit
on the `-e` (execute) flag. Long strings are truncated at the shell level before
reaching the pane.

**Fix (a):** Retry Chrome DevTools operations up to 3 times before treating
as a failure.

**Fix (b):** Write the prompt to a temp file and pipe it in:
```bash
cat /tmp/e2e-prompt.txt | conduit terminal-write -p $pane_id -e "cat /tmp/e2e-prompt.txt"
# or:
conduit terminal-write -p $pane_id -e "$(cat /tmp/e2e-prompt.txt)"
```

**Impact without fix:** E2E tests fail non-deterministically (Chrome DevTools)
or receive truncated instructions (long prompts), causing agents to run
incomplete test suites and potentially marking incomplete work as done.

---

### L-INC-014: E2E tests skipped — tasks marked Done without verification

**When:** Pre-2026-02-07 (before v2.0)
**Component:** Orchestrator loop / issue tracking

**Description:** Dev agents (and sometimes the orchestrator itself) marked
GitHub/Linear issues as Done after PR merge without running any E2E test.
This caused regressions that were only discovered later when users reported
broken functionality.

**Root cause:** The orchestrator loop did not include an E2E testing step. The
rule "test before done" was in the instructions but not enforced by the loop
structure. Agents working autonomously in AUTO-MODE skipped the step because
there was no gate.

**Fix:** Added mandatory E2E step to the orchestrator loop between `AUTO_MERGE`
and `MARK_DONE`. The step is non-optional — if it fails, the task goes back
to `in_progress`. Encoded as Rule 2 in all orchestrator prompts. Added to
`CHANGELOG.md` as a breaking change in v2.0.

From `CHANGELOG.md`:
```
### Fixed
- INC-014: E2E Testing is now a GATE before marking issues as Done
- INC-015: Chrome DevTools MCP usage is mandatory and documented
```

**Commit:** `a49a337` (v2.0 — Custom Agent architecture) — the E2E gate was
part of the v2.0 rewrite.

**Impact without fix:** Broken features shipped to production. The orchestrator
claims "100% done" but the deployed app has regressions. Loss of user trust in
autonomous agents.

**Lessons learned:** Completeness criteria must be structural (loop gates), not
instructional (prompt text). Agents under token pressure, context compaction,
or AUTO-MODE skip instructional gates. Structural gates are skipped only by
intentional override.

---

### L-INC-015: Issues marked Done without testing — workflow enforcement gap

**When:** Pre-2026-02-07 (before v2.0)
**Component:** Orchestrator loop / workflow

**Description:** Related to INC-014. Even when E2E tests were mentioned, the
orchestrator would sometimes mark an issue as Done (via `gh issue close` or
Linear status update) immediately after merge — before the E2E test step had
run. The ordering was: merge → mark done → test → (too late).

**Root cause:** The orchestrator loop step ordering was ambiguous. "E2E test"
and "mark done" were both in the loop but their ordering was not enforced.
Under context pressure, the orchestrator would sometimes reorder them.

**Fix:** Explicit ordering in the orchestrator loop (both Conduit and Teams
commands):
```
7. AUTO_MERGE
8. E2E_TEST (MANDATORY)
9. MARK_DONE (ONLY after E2E passes)
```

The workflow is: `Fix → PR → Merge → E2E TEST → Done`. Never out of order.

**Commit:** `a49a337` (v2.0).

**Impact without fix:** Same as INC-014 — regressions ship. The additional
failure mode is that once an issue is marked Done, it is removed from the
orchestrator's task queue and never revisited, even if the E2E test fails
afterward.

---

## Supplementary Bug: Teams Mode / Tmux Priority Conflict

**When:** 2026-02-16
**Component:** Orchestrator mode detection / `.claude/agents/orchestrator.md`

**Description:** When both the Claude Code Teams tools (`SendMessage`, `TaskCreate`)
and `_bmad/orchestrator-tmux-state.json` were present, the orchestrator
defaulted to Teams Mode. Background Tasks (teams mode) share the same git
working directory, causing branch conflicts when multiple agents work in parallel.
Tmux sessions are separate processes with independent filesystem access and
should take priority.

**Root cause:** The original mode detection algorithm checked for `SendMessage`
first, then tmux state. The priority was wrong — tmux should win when its state
file exists.

**Fix:** Updated mode detection in `orchestrator.md`:

```
1. Check if _bmad/orchestrator-tmux-state.json exists AND tmux is available → Tmux Mode
   (Even if SendMessage/Task tools are available — tmux sessions preferred!)
2. Check if SendMessage tool exists AND no tmux state → Teams Mode
3. Else: conduit pane-list → Conduit Mode
4. Failure → ERROR
```

Added explicit warning: "CRITICAL: Do NOT use the Task tool (background agents)
in Tmux Mode. Background agents share the same git working directory and cause
conflicts."

**Commit:** `d04c254`

**Impact without fix:** Multiple parallel Task agents check out competing
branches in the same directory. `git checkout -b` calls collide. One agent's
`git add .` stages another agent's WIP files. The resulting PRs have mixed
content and tests fail in unpredictable ways.

**Lessons learned:** Mode detection priority must match resource isolation
guarantees. Tmux > Teams because tmux gives each worker true process isolation.
The presence of more powerful tools (Teams API) should not override a safer
execution model (tmux).

---

## Supplementary Bug: Clipboard Hook — Claude Code hooks don't expose response text

**When:** 2026-03-11
**Component:** Claude Code Stop/Notification hooks / Ghostty notification system

**Description:** A Claude Code `Stop` hook was configured to copy the last
response to the clipboard. The hook received only notification metadata (e.g.,
"Claude is waiting for your input"), not the actual response text. The
clipboard was being populated with useless metadata strings.

**Root cause:** Claude Code's hook payload for `Stop` and `Notification` events
does not include the assistant's response content. This is a deliberate design
decision by Anthropic — response text is not exposed in hook metadata. The
Codex CLI does expose `last_assistant_message` in its hook payload.

**Fix:** Removed clipboard copy from the Claude Code hook. The Codex CLI hook
retains clipboard copy. For Claude Code, the recommended workaround is
`agent-watch claude` (which monitors process output via `script`).

Updated the architecture note in `docs/ghostty-notification-setup.md`:
```
Layer 3a: Claude Code hooks → Claude response → notify only (no response in payload)
```

**Commit:** `cfe9e8e`

**Impact without fix:** Every time Claude Code finishes a response, the clipboard
is overwritten with "Claude is waiting for your input" (or similar metadata).
Any text the user had previously copied is lost.

---

## Summary Table

| ID | Namespace | Component | Fixed | Commit |
|----|-----------|-----------|-------|--------|
| INC-001 (Pi) | Pi Orchestrator | Pi model routing | Yes | run.sh default `--provider` |
| INC-002 (Pi) | Pi Orchestrator | Pi model routing | Yes | run.sh `--provider openai-codex` |
| INC-003 (Pi) | Pi Orchestrator | Supervisor prompt | Partial | Manual nudge; no code fix |
| INC-004 (Pi) | Pi Orchestrator | Pi version guard | Yes | run.sh `pi --list-models` pre-flight |
| INC-005 (Pi) | Pi Orchestrator | tmux copy mode | Yes (N/A in cmux) | `bcd3757` |
| INC-006 (Pi) | Pi Orchestrator | Claude Code session isolation | No | Open |
| INC-007 (Pi) | Pi Orchestrator | supervisor_stop hard kill | Yes | `588b467` |
| INC-008 (Pi) | Pi Orchestrator | Session registry | Yes | `588b467` |
| CMUX-BUG-01 | cmux migration | new-split output format | Yes | `bcd3757` |
| CMUX-BUG-02 | cmux migration | send needs send-key Enter | Yes | `bcd3757` |
| CMUX-BUG-03 | cmux migration | registry scope in reducer | Yes | `6deff3b` |
| CMUX-BUG-04 | cmux migration | phantom window / workspace scoping | Yes (unconfirmed) | Current `supervisor.ts` |
| CMUX-BUG-05 | cmux migration | Antigravity const schema | Abandoned | MEMORY.md |
| L-INC-001 | L-Thread Conduit | postgres.js prepare:false | Yes | FutureLearnings (project repo) |
| L-INC-002 | L-Thread Conduit | Zod schema drift | Yes | FutureLearnings |
| L-INC-004 | L-Thread Conduit | Test against deployed URL | Yes | FutureLearnings |
| L-INC-007 (L) | L-Thread Conduit | XSS / rehype-sanitize | Yes | FutureLearnings |
| L-INC-009 | L-Thread Conduit | N+1 queries | Yes | FutureLearnings |
| L-INC-011 | L-Thread Conduit | Pagination LIMIT/OFFSET | Yes | FutureLearnings |
| L-INC-013 | L-Thread Conduit | Chrome DevTools / long prompts | Yes | FutureLearnings |
| L-INC-014 | L-Thread Conduit | E2E gate before Done | Yes | `a49a337` (v2.0) |
| L-INC-015 | L-Thread Conduit | Issue ordering Fix→PR→Merge→E2E→Done | Yes | `a49a337` (v2.0) |
| Teams/Tmux priority | L-Thread | Mode detection priority | Yes | `d04c254` |
| Clipboard hook | L-Thread | Claude Code hook payload | Yes | `cfe9e8e` |

---

## Open Issues (as of 2026-03-14)

1. **INC-003 (Pi) — GPT-5.4 docs-first behavior**: Needs prompt engineering fix
   in `supervisor.md`. Add explicit "call supervisor_start FIRST" instruction.

2. **INC-006 (Pi) — Claude Code session inheritance**: Needs `-p <task>` flag
   in `supervisor_start` tool, removing the 15-second delayed `initial_prompt`
   anti-pattern.

3. **CMUX-BUG-04 — Double-window bug**: The workspace scoping fix is in place
   but unconfirmed as fully resolved. Needs a dedicated validation test session
   (was the planned `supervisor_start` validation session on 2026-03-14T17:32
   per devlog — partially executed but not reported as confirmed).

4. **CMUX-BUG-05 — Antigravity provider**: Blocked by Pi / Google API schema
   incompatibility. Requires either Pi to add a schema transformer or
   Google to support `const` in JSON Schema tool definitions.
