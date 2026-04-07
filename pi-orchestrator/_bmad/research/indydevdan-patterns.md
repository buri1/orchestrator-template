# IndyDevDan pi-vs-claude-code — Pattern Analysis

> Created: 2026-03-12
> Purpose: Capture all findings from the IndyDevDan pi-vs-claude-code repo for integration into
> the pi-orchestrator supervisor architecture.

---

## Source

- **Repo**: `/Users/buraksmac/Desktop/code2/pi/pi-vs-claude-code/`
- **Author**: Dan Disler (IndyDevDan / @indydevdan)
- **Companion**: Tactical Agentic Coding course at agenticengineer.com
- **Pi Agent**: `@mariozechner/pi-coding-agent` by Mario Zechner

---

## Repo Structure Overview

| Category | Count |
|----------|-------|
| TypeScript extensions | 16 |
| Agent definitions | 11 (+ 9 pi-pi expert agents) |
| Teams in teams.yaml | 6 |
| Chain pipelines in agent-chain.yaml | 5 |
| Custom themes | 11 |
| Bash safety patterns in damage-control-rules.yaml | 60+ |
| Playwright browser automation skill | bowser |

---

## Extension Catalog (all 16)

### TUI / Footer / Widget Extensions

**1. minimal.ts** — Simplest possible footer implementation.
- Reads `ctx.getContextUsage()` for percentage
- Renders 10-block bar: `[###-------] 30%`
- Appends model name
- Use case: low-overhead presence indicator

**2. pure-focus.ts** — Intentionally empty footer (zero UI chrome).
- Removes all visual decoration
- Maximum focus mode
- Pattern: explicit opt-out of UI overhead

**3. tool-counter.ts** — Two-line footer with rich data.
- Line 1: tool call counts (Bash N, Read N, Write N, Edit N...)
- Line 2: token usage + cost from `ctx.sessionManager.getBranch()` + git branch via `footerData.getGitBranch()`
- Uses `visibleWidth()` for ANSI-safe padding
- Uses `truncateToWidth()` for terminal-safe truncation
- Most complete single-file reference for footer implementation

**4. tool-counter-widget.ts** — Above-editor floating widget variant.
- ANSI 24-bit RGB background per tool type
- Format: `Tools (N): [Bash 3] [Read 7] [Edit 2]`
- Positioned above editor, not in footer
- Demonstrates `ctx.ui.setWidget()` vs `ctx.ui.setFooter()`

**5. theme-cycler.ts** — Interactive theme management.
- Ctrl+X / Ctrl+Q to cycle themes forward/backward
- `/theme` slash command opens select picker
- 3-second auto-dismiss color swatch widget preview
- Reads from `themeMap.ts` for extension-default theme assignments
- Pattern: slash commands + interactive widget popups

---

### Gate / Focus / Context Extensions

**6. purpose-gate.ts** — Blocking input gate until purpose declared.
- Intercepts `input` event: blocks all input
- Shows `ctx.ui.input()` dialog asking for session purpose
- On confirmation: injects `<purpose>USER_STATEMENT</purpose>` into system prompt via `before_agent_start`
- Pattern: session intention enforcement before any work begins
- **Direct applicability**: inject scribe summaries or task context into every session start

**7. tilldone.ts** — Task manager with blocking gate.
- Blocks `tool_call` if no tasks exist or all tasks are marked done
- Auto-nudges via `pi.sendMessage({ triggerTurn: true })` when tasks remain
- Reconstructs full task state from session history via `ctx.sessionManager.getBranch()`
- No external state file needed — derives state from conversation replay
- Pattern: derive-don't-store (avoids state file drift)

**8. damage-control.ts** — YAML-driven safety interception.
- Loads `.pi/damage-control-rules.yaml` on session start
- Intercepts every `tool_call` event
- Checks command/path against 60+ bash patterns and 30+ zero-access paths
- Returns `{ block: true, reason: "..." }` to prevent execution
- Uses `pi.appendEntry()` for native audit trail (survives session restarts, queryable via getBranch())
- Full rule catalog:
  - Bash: `rm -rf`, `git push --force`, `dd if=`, `curl | bash`, `chmod 777`, `sudo rm`...
  - Paths: `~/.ssh/`, `~/.gnupg/`, `/etc/`, `/usr/`, `~/.aws/credentials`...
- Pattern: declarative safety rules, no code changes needed to update policy

---

### Cross-Agent / System Prompt Extensions

**9. cross-agent.ts** — Cross-ecosystem command discovery.
- Scans `.claude/`, `.gemini/`, `.codex/` for commands, skills, agent definitions
- Registers each discovered entity as a Pi slash command
- Supports template variable expansion: `$ARGUMENTS`, `$@`, `$1`, `$2`...
- Pattern: unified command surface across multiple AI tool ecosystems

**10. system-select.ts** — Runtime system prompt switching.
- `/system` slash command opens picker
- Lists all agent definitions from all ecosystems (Pi, Claude, Gemini, Codex)
- Switches system prompt mid-session without restart
- Pattern: dynamic persona switching for multi-role agents

---

### Multi-Agent Extensions

**11. subagent-widget.ts** — Headless subagent spawner with live widget.
- Spawn pattern: `pi --mode json -p --no-extensions --session <file> <task>`
- Parses JSONL stdout in real time:
  - `message_update` (text_delta) → accumulates output text
  - `tool_execution_start` → increments tool counter
  - `message_end` → captures usage stats (tokens, cost)
  - `agent_end` → marks completion
- Line-buffered parsing: `buffer += chunk; lines = buffer.split("\n")`
- Results injected back via `pi.sendMessage({ deliverAs: "followUp", triggerTurn: true })`
- Slash commands: `/sub <task>`, `/subcont <id> <followup>`, `/subrm <id>`, `/subclear`
- Pattern: background async subagents with automatic result delivery to main session

**12. agent-team.ts** — Dispatcher-only orchestrator with grid dashboard.
- Grid layout: auto-sized bordered agent cards
- Column sizing rule: `size <= 3 ? size : size === 4 ? 2 : 3`
- Each card shows 5 rows: name (bold accent), status icon + elapsed time, context bar `[###--]`, last work output line
- `setInterval(1000)` drives elapsed timer updates
- `pi.setActiveTools(["dispatch_agent"])` — enforces delegation-only mode (orchestrator cannot use other tools)
- Teams loaded from YAML configuration
- Pattern: dashboard + tool restriction = pure coordinator mode

**13. agent-chain.ts** — Sequential pipeline orchestrator.
- Chain definitions loaded from YAML
- Template variables in prompts: `$INPUT` (previous step output), `$ORIGINAL` (original user input)
- Visual pipeline widget with arrow diagram: `Step1 → Step2 → Step3`
- Each step result feeds as input to next step
- Pattern: deterministic multi-step pipelines, output chaining

**14. pi-pi.ts** — Meta-agent for building Pi components (expert panel).
- 9 expert agents queried in parallel via `Promise.allSettled()`
- Each expert: ephemeral `--no-session` subprocess (pure function invocation)
- Each expert assigned unique RGB background color for card differentiation
- Grid display with bordered cards showing each expert's output as it streams
- **Key insight**: `--no-session` flag = stateless function call (validates our "scribe is a function" architectural decision)
- Pattern: parallel expert consultation, no persistent state

---

### Utility Extensions

**15. themeMap.ts** — Shared configuration module.
- Maps extension names to their default themes
- `applyExtensionDefaults()` function called by every extension on init
- Pattern: centralized defaults to ensure visual consistency across extensions

**16. session-replay.ts** — Session history viewer.
- `/replay` command opens full-screen overlay
- Scrollable timeline of all session messages
- Arrow key navigation through history
- Markdown rendering of message content
- Pattern: audit/debug overlay, no external tooling needed

---

## Key Pi Extension APIs Discovered

```typescript
// ── UI Surfaces ──────────────────────────────────────────
ctx.ui.setFooter(factory)             // custom footer renderer (bottom of terminal)
ctx.ui.setWidget(key, factory)        // above/below editor widget area
ctx.ui.setStatus(key, text)           // status line text
ctx.ui.setHeader(...)                 // custom header area
ctx.ui.custom(factory, { overlay })   // full overlay dialog (blocks input)
ctx.ui.select()                       // interactive selection picker
ctx.ui.confirm()                      // yes/no confirmation dialog
ctx.ui.input()                        // text input dialog
ctx.ui.notify(text, severity)         // chat area notification
ctx.ui.setTheme(name)                 // set active theme
ctx.ui.getAllThemes()                  // enumerate available themes
ctx.ui.setTitle(text)                 // set terminal/tab title

// ── Context & State ──────────────────────────────────────
ctx.getContextUsage()                 // { percent, used, total }
ctx.sessionManager.getBranch()        // full message history for state reconstruction
ctx.model?.contextWindow              // total context window size in tokens

// ── Agent Control ────────────────────────────────────────
pi.setActiveTools(["tool1", "tool2"]) // restrict which tools agent can call
pi.sendMessage(msg, opts)             // inject message into conversation
pi.appendEntry(type, data)            // write native audit trail entry
pi.registerTool({ name, handler })    // register custom tool
pi.registerCommand(name, handler)     // register slash command

// ── Event Hooks ──────────────────────────────────────────
session_start                         // fired on session initialization
session_shutdown                      // fired on graceful exit
session_switch                        // fired when switching sessions
session_fork                          // fired on session fork
session_tree                          // fired on tree operations
before_agent_start                    // system prompt injection point (fires before every turn)
agent_end                             // post-turn hook (after agent response completes)
tool_call                             // interception point (can block with { block: true, reason })
tool_execution_end                    // tool completed (counting/tracking)
input                                 // user input interception (can block)
model_select                          // model changed
```

### Subagent Spawn Pattern (from subagent-widget.ts + pi-pi.ts)

```typescript
// Headless invocation with session persistence
spawn("pi", [
  "--mode", "json",
  "-p",                   // print mode (non-interactive)
  "--no-extensions",      // clean environment, no UI
  "--model", model,
  "--session", sessionFile,
  task
])

// Stateless function invocation (no session)
spawn("pi", [
  "--mode", "json",
  "-p",
  "--no-extensions",
  "--no-session",          // ephemeral — pure function
  "--model", model,
  "--max-turns", "1",      // cost cap
  task
])

// JSONL event stream parsing
let buffer = ""
process.stdout.on("data", (chunk) => {
  buffer += chunk
  const lines = buffer.split("\n")
  buffer = lines.pop() ?? ""            // keep incomplete line
  for (const line of lines) {
    if (!line.trim()) continue
    const event = JSON.parse(line)
    if (event.type === "message_update") { /* text_delta */ }
    if (event.type === "tool_execution_start") { /* tool invoked */ }
    if (event.type === "message_end") { /* usage: tokens, cost */ }
    if (event.type === "agent_end") { /* subagent finished */ }
  }
})
```

---

## Patterns Directly Applicable to Our Supervisor

### Pattern 1 — Agent Grid Cards (from agent-team.ts)

Implement bordered agent cards in the supervisor footer/widget for the orchestrator + workers.

Card structure (5 rows per agent):
```
┌────────────────────────┐
│ ORCHESTRATOR           │  ← bold accent color
│ running  0:04:23       │  ← status icon + elapsed HH:MM:SS
│ [########--] 80%       │  ← context bar
│ Reviewing PR #42...    │  ← last captured output line (truncated)
└────────────────────────┘
```

Column auto-sizing rule: `size <= 3 ? size : size === 4 ? 2 : 3`

`setInterval(1000)` for elapsed timer updates — drives widget re-render independently of agent turns.

**Implementation target**: supervisor.ts `setWidget("agent-grid", ...)` in `before_agent_start` hook.

---

### Pattern 2 — Ephemeral Subagent as Function (from pi-pi.ts)

`--no-session` flag = pure function call. No state leakage between invocations.

Validates our architectural decision: **"The scribe is a function, not an agent."**

```bash
pi --print --provider antigravity --model gemini-3-flash \
   --no-extensions --no-session --max-turns 1 \
   "Summarize: $(cat _bmad/telemetry/$(date +%Y-%m-%d).jsonl | tail -100)"
```

`Promise.allSettled()` pattern for parallel expert calls — use in pi-pi.ts style if we ever need multi-model consensus.

---

### Pattern 3 — JSONL Event Streaming (from subagent-widget.ts)

Pi's `--mode json` outputs structured events to stdout. Line-buffered parsing is reliable.

Critical: keep the incomplete last line in `buffer` across chunks:
```typescript
const lines = buffer.split("\n")
buffer = lines.pop() ?? ""  // preserve partial last line
```

Event types to handle for scribe implementation:
- `message_update` → accumulate text_delta for live output
- `message_end` → capture final token/cost usage
- `agent_end` → trigger result injection

---

### Pattern 4 — Native Audit Trail (from damage-control.ts)

`pi.appendEntry(type, data)` is better than our current manual JSONL append:
- Pi-native: survives session restarts
- Queryable via `ctx.sessionManager.getBranch()`
- No file path management needed
- Integrated with session replay (session-replay.ts can show it)

**Consider**: replace `appendFileSync` calls in supervisor.ts with `pi.appendEntry()` for
supervisor events (supervisor_start, supervisor_stop, worker_spawn, etc.).

---

### Pattern 5 — Context Seeding via before_agent_start (from purpose-gate.ts)

`before_agent_start` fires before every agent turn — ideal for injecting ambient context.

```typescript
ctx.on("before_agent_start", async (event) => {
  const lastReport = readLatestScribeReport()  // read from _bmad/scribe-reports/
  event.systemPrompt += `\n\n<ambient_context>\n${lastReport}\n</ambient_context>`
})
```

**Implementation target**: supervisor.ts should seed the orchestrator's system prompt with
the last scribe micro-report, so it has ambient awareness of session trends without explicit
file reads.

---

### Pattern 6 — Follow-up Message Injection (from subagent-widget.ts)

```typescript
pi.sendMessage(
  { customType: "subagent_result", content: result },
  { deliverAs: "followUp", triggerTurn: true }
)
```

`deliverAs: "followUp"` + `triggerTurn: true` = scribe results auto-trigger a new supervisor turn.

**Use case**: when scribe completes a report, auto-inject summary into supervisor conversation
without waiting for user input. Supervisor reacts to trend anomalies automatically.

---

### Pattern 7 — Declarative Safety Interception (from damage-control.ts)

YAML-driven rules for blocking destructive operations at the `tool_call` level.

```typescript
ctx.on("tool_call", async (event) => {
  const rule = findMatchingRule(event.tool, event.args, rules)
  if (rule) return { block: true, reason: rule.reason }
})
```

**Implementation target**: supervisor.ts should block workers from:
- `git push --force` / `git push --force-with-lease`
- `rm -rf` on any path outside the project directory
- `kubectl delete` / `terraform destroy` without explicit approval
- Direct `npm publish` without human review gate

Load rules from `.pi/damage-control-rules.yaml` (reuse IndyDevDan's catalog as starting point).

---

### Pattern 8 — Footer Context Bar (from tool-counter.ts)

The tool-counter.ts footer is the cleanest reference for our supervisor footer.

Key functions used:
- `visibleWidth(str)` — measure ANSI string width correctly (strips escape codes)
- `truncateToWidth(str, width)` — safe truncation for terminal fitting

Our supervisor footer should show (single line):
```
[supervisor] claude-opus-4-6  |  running 0:04:23  |  workers: 2/3  |  [########--] 80%  |  last: Reviewing PR #42
```

---

### Pattern 9 — Tool Restriction for Pure Coordinator Mode (from agent-team.ts)

```typescript
pi.setActiveTools(["supervisor_start", "supervisor_stop", "supervisor_nudge",
                   "supervisor_status", "supervisor_config",
                   "spawn_worker", "close_worker"])
```

Calling `pi.setActiveTools()` in `before_agent_start` enforces that the supervisor can ONLY
use supervisor tools — prevents it from going rogue and writing code directly.

This is the Pi equivalent of our CLAUDE.md rule "DU BIST KEIN ENTWICKLER."

---

## Tiered Scribe Architecture (our design, validated by pi-pi.ts patterns)

The `--no-session` + `--max-turns 1` pattern from pi-pi.ts validates our scribe design.

### Tier 1 — Micro-Reports (every 5 minutes)

Trigger: `setInterval(5 * 60 * 1000)` in supervisor extension.

```typescript
const scribeInterval = setInterval(async () => {
  const lines = readTelemetryFromOffset(lastOffset)
  if (lines.length === 0) return
  const summary = await runScribe(lines, lastMicroReport)
  writeFile(`_bmad/scribe-reports/micro/${timestamp}.md`, summary)
  lastOffset += lines.length
  lastMicroReport = summary
}, 5 * 60 * 1000)
```

Scribe invocation:
```bash
pi --print \
   --provider antigravity \
   --model gemini-3-flash \
   --no-extensions \
   --no-session \
   --max-turns 1 \
   "$(cat <<PROMPT
Analyze the last $(N) telemetry events from a multi-agent orchestrator session.
Prior summary: ${lastMicroReport}

Events:
${events}

Output a concise markdown report covering:
1. Phase transitions (what changed)
2. Anomalies (stuck agents, errors, unexpected patterns)
3. Worker lifecycle (spawned/closed)
4. Context usage trends
5. Any actionable alerts for the supervisor
PROMPT
)"
```

Output: `_bmad/scribe-reports/micro/YYYY-MM-DD-HH-MM.md`

### Tier 2 — Session Reports (every 1 hour + session end)

Trigger: `setInterval(60 * 60 * 1000)` + `session_shutdown` event.

Consolidates all Tier 1 micro-reports since last session report into a structured JSON:

```json
{
  "session_id": "lthread-1741794000",
  "task": "Implement feature X",
  "model": "claude-opus-4-6",
  "duration_minutes": 60,
  "phases": ["stopped", "running", "running"],
  "agents": {
    "orchestrator": { "turns": 12, "context_peak": 0.88 },
    "workers": { "spawned": 3, "completed": 2, "failed": 1 }
  },
  "tools": {
    "total_calls": 147,
    "by_type": { "Bash": 43, "Read": 61, "Write": 12, "Edit": 31 }
  },
  "context": {
    "orchestrator_peak_pct": 88,
    "compactions": 1
  },
  "nudges": { "auto": 3, "manual": 1 },
  "incidents": []
}
```

Output: `_bmad/scribe-reports/session/YYYY-MM-DD-HH-MM.json`

### Context Seeding

```typescript
ctx.on("before_agent_start", async () => {
  const report = readLatestMicroReport()  // last micro-report
  // Inject as ephemeral system prompt addition — not persisted in conversation
  return {
    systemPromptAddition: `<session_trends>\n${report}\n</session_trends>`
  }
})
```

Supervisor gains ambient awareness: phase trends, anomalies, context pressure — without
explicitly reading files each turn.

---

## Pi vs Claude Code — Comparison Verdict (from COMPARISON.md)

### Pi Advantages
- **Model-agnostic**: 324+ models across all providers
- **Minimal system prompt**: ~200 tokens (vs Claude Code's ~5000+)
- **Full transparency**: all prompts and events visible
- **In-process TypeScript extensions**: zero IPC overhead, full Node.js access
- **Richer event system**: 25 events (vs Claude Code's ~14)
- **Custom tools with TUI rendering**: tool results can have rich visual output
- **Deep TUI customization**: footer, widgets, headers, overlays, themes
- **$0 MIT license**: no usage costs for the orchestration layer itself

### Claude Code Advantages
- **Built-in sub-agents / teams**: native Task tool, no extension needed
- **MCP first-class**: Model Context Protocol integrations out of the box
- **IDE integration**: Cursor, VS Code, JetBrains
- **Enterprise features**: audit logs, permissions, SSO
- **Built-in web tools**: WebFetch, WebSearch without extensions
- **Safety permissions by default**: confirms destructive operations
- **Glob tool**: fast file search without bash

### Verdict
Pi for power users wanting control + customization + model diversity.
Claude Code for accessibility, enterprise deployment, and ecosystem integration.
**Our stack**: Pi Supervisor (control plane) + Claude Code Orchestrator (execution plane).

---

## Unimplemented Specs Worth Watching

### agent-forge (not yet built)
- **Concept**: Runtime tool generation
- **Key feature**: `jiti` dynamic TypeScript loading — compile and load new tools at runtime
- **Self-healing**: pass stack traces back to agent to fix its own tools
- **Why it matters**: Pi agent can extend its own capabilities mid-session without restart

### agent-workflow / Chronicle (not yet built)
- **Concept**: State-machine orchestrator for multi-session workflows
- **Persistent Ledger**: survives restarts, tracks progress across days
- **Anti-loop detection**: detects and breaks infinite retry cycles
- **Resource budgeting**: token/cost budgets per workflow step
- **Why it matters**: long-running orchestrations (days, weeks) with guaranteed progress

---

## Tools to Catalogue (from memory + research agents)

Pending ingestion into research/catalogue:

| Tool | Author | Key Feature | Priority |
|------|--------|-------------|----------|
| ccusage | - | JSONL reader + MCP server for Claude usage stats | HIGH |
| pi-side-agents (pasky) | - | agent-start / check / wait-any / send primitives | HIGH |
| amux | - | Web dashboard + tmux + self-healing watchdog | HIGH |
| multi-agent-shogun | - | YAML inbox + inotifywait, zero-polling IPC | MEDIUM |
| Cleric | - | Ambient learning pattern (observes, never acts) | MEDIUM |
| claude_code_agent_farm | Dicklesworthstone | 20-50 agents, heartbeat, lock-based coordination | LOW |
| marcus/sidecar | marcus | TUI dashboard as passive observer (read-only) | LOW |

---

## Integration Checklist for supervisor.ts

Items to implement based on this analysis:

- [ ] **Agent grid widget** — `ctx.ui.setWidget("agent-grid", ...)` with bordered cards per agent
- [ ] **Tool restriction** — `pi.setActiveTools([...supervisor tools only])` in before_agent_start
- [ ] **Safety interception** — YAML rules blocking destructive worker operations
- [ ] **Context seeding** — `before_agent_start` injects latest scribe micro-report
- [ ] **Scribe Tier 1** — `setInterval(5min)` ephemeral Gemini invocation via `--no-session`
- [ ] **Scribe Tier 2** — hourly JSON session reports for BI ingestion
- [ ] **Native audit trail** — evaluate `pi.appendEntry()` vs current `appendFileSync`
- [ ] **Follow-up injection** — scribe results trigger new supervisor turns automatically
- [ ] **JSONL streaming parser** — line-buffered parsing for scribe output

---

## Notes on Current supervisor.ts State (as of 2026-03-12)

The current implementation (1202 lines) already has:
- Stateless reducer architecture (Probe → Event → Reduce → Effects → Execute)
- 10 tools: start, stop, pause, resume, nudge, observe, status, config, spawn_worker, close_worker
- Session registry (`_bmad/session-registry.json`)
- Hard kill on stop (INC-007 fix): polite C-c then kill -9 after 3s
- Copy mode protection: defensive `q` before every send_keys (INC-005 fix)
- Activity log: `_bmad/agent-activity.jsonl`
- Telemetry: `_bmad/telemetry/YYYY-MM-DD.jsonl`

The IndyDevDan patterns add the **UI layer** (grid cards, footer), **safety layer**
(declarative YAML rules), and **intelligence layer** (scribe ambient context) on top of
the existing deterministic control plane.

---

*End of analysis. Cross-reference with `_bmad/incidents.md` for field-validated learnings.*
