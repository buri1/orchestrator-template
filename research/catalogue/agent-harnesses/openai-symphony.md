# OpenAI Symphony

> **Symphony turns project work into isolated, autonomous implementation runs, allowing teams to manage work instead of supervising coding agents.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness (Orchestration-adjacent) |
| Repository | https://github.com/openai/symphony |
| GitHub Stars | 14,927 (as of 2026-04-11) |
| Publisher | OpenAI (bigtech) |
| License | Apache 2.0 |
| Tech Stack | Elixir (reference implementation), Codex app-server protocol, Linear GraphQL |
| Maturity | 🟡 Early — "low-key engineering preview for testing in trusted environments" |
| Last Analyzed | 2026-04-11 |

---

## Burak's Notes

> *OpenAI's official take on autonomous implementation — shipped as a spec-first project where the preferred adoption path is "ask your coding agent to build it from SPEC.md" rather than installing a binary. That alone is a philosophical statement: Symphony is less a product than a protocol for how to drive Codex (or any app-server compatible agent) from a Linear board. The reference implementation is in Elixir, which is weird for an OpenAI project until you realize this is exactly the pattern a long-running daemon needs (BEAM supervision trees, cheap concurrency, no GC pauses). For us, the SPEC is the valuable artifact — it formalizes the exact state machine, retry logic, and reconciliation model we're reinventing in L-Thread. Biggest delta vs our design: Symphony isolates via filesystem workspaces (persistent per issue), NOT git worktrees or containers. That's a deliberate choice — they want resumable context across attempts, which they get by reusing the same directory. Worth questioning whether we should adopt that for restart semantics.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Direct 1:1 match: Linear/tracker-driven orchestrator spawning isolated coding agents — this IS our L-Thread tmux orchestrator. OpenAI is validating our exact category. |
| **Novelty** | 8/10 | The SPEC.md-as-product approach is novel. Concrete novel patterns: stateless tracker polling, continuation turns, workspace persistence across attempts, dynamic WORKFLOW.md reload, run attempt phase enum, session_id = thread_id+turn_id. Validates 80% of our architecture but upgrades the formalism. |
| **Actionable** | 9/10 | SPEC.md is directly portable. We can lift: (a) phase enum for run state, (b) polling tick sequence, (c) reload-without-restart via file watch, (d) retry backoff formulas, (e) workspace-path containment check, (f) session_id scheme. ~1-2 days to integrate selectively. |

---

## Overview

Symphony is a **long-running orchestrator daemon** that reads a project tracker (Linear) for active work items, dispatches coding agents against them inside isolated filesystem workspaces, and reconciles runs against tracker state. It is shipped primarily as a **specification** (`SPEC.md`) with an experimental Elixir reference implementation — OpenAI's recommended install path is literally "point your coding agent at SPEC.md and have it build Symphony for your stack." This framing makes Symphony a protocol/contract rather than a binary.

The system has one authoritative orchestrator component holding all dispatch state in memory (no database), a workspace manager that guarantees per-issue filesystem isolation, and an agent runner that speaks a **JSON-RPC-like app-server protocol over subprocess stdio** (the same protocol Codex exposes). Governance lives entirely in a single `WORKFLOW.md` file: YAML front matter for config, Markdown body for the rendered prompt template. The file is watched at runtime — any change hot-reloads config (polling interval, concurrency caps, active/terminal states, hooks, prompt) without restarting the daemon.

Symphony's key design decisions converge almost exactly with the L-Thread orchestrator, with three sharp differences: (1) **no git worktrees** — isolation is via persistent per-issue filesystem workspaces that survive across attempts, letting agents resume context; (2) **tracker-driven reconciliation** — state is deliberately stateless in the orchestrator because the tracker IS the source of truth, so restarts just replay from Linear; (3) **agent does the ticket writes** — Symphony doesn't mutate Linear itself; it exposes an optional `linear_graphql` tool so the agent can post comments, move states, and attach PRs from inside its session.

---

## Technical Architecture

### Component Map

```
┌──────────────────────────────────────────────────────────┐
│                  Symphony Daemon (Elixir)                │
│                                                          │
│  ┌───────────────┐   ┌──────────────────┐                │
│  │ Workflow      │◀──│ WORKFLOW.md      │ (hot reload)   │
│  │ Loader        │   │ front-matter YAML│                │
│  └──────┬────────┘   │ + Markdown prompt│                │
│         │            └──────────────────┘                │
│         ▼                                                │
│  ┌───────────────┐   ┌──────────────────┐                │
│  │ Config Layer  │   │ Linear GraphQL   │                │
│  │ (typed getters│   │ Tracker Client   │                │
│  │  + env indir.)│   └────────┬─────────┘                │
│  └──────┬────────┘            │                          │
│         │                     │                          │
│         ▼                     ▼                          │
│  ┌─────────────────────────────────────┐                 │
│  │         ORCHESTRATOR                │                 │
│  │  - polling tick (30s default)       │                 │
│  │  - dispatch authority               │                 │
│  │  - in-memory state (no DB)          │                 │
│  │  - reconciliation (stall/terminal)  │                 │
│  └──────┬──────────────────────────────┘                 │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────┐    ┌─────────────────────┐         │
│  │ Workspace Mgr    │───▶│ Agent Runner        │         │
│  │ (per-issue dir,  │    │ (subprocess stdio   │         │
│  │  path containment│    │  app-server proto)  │         │
│  │  + sanitize)     │    │  → Codex/Claude/…   │         │
│  └──────────────────┘    └─────────────────────┘         │
│                                                          │
│  Optional: HTTP observability layer (loopback /api/v1)   │
└──────────────────────────────────────────────────────────┘
```

### Isolation Model (workspace, NOT worktree)

- Each Linear issue maps to `<workspace.root>/<sanitized_identifier>`.
- **Sanitization rule**: replace any char outside `[A-Za-z0-9._-]` with `_`.
- **Safety invariants** (enforced before subprocess launch):
  1. Subprocess `cwd` MUST be the workspace path.
  2. Workspace path MUST remain under configured root (path-containment check defends against `..` breakout).
  3. Workspaces PERSIST across runs for the same issue — this is intentional for context reuse.
- **No container or VM isolation mandated** — Symphony leaves the sandbox posture to the implementer. The spec explicitly refuses to prescribe a trust boundary.

### Task Lifecycle — Run Attempt Phase Enum

```
PreparingWorkspace
  → BuildingPrompt
  → LaunchingAgentProcess
  → InitializingSession
  → StreamingTurn
  → Finishing
  → {Succeeded | Failed | TimedOut | Stalled | CanceledByReconciliation}
```

### Issue Orchestration States

1. **Unclaimed**
2. **Claimed** (subtype: Running OR RetryQueued)
3. **Running**
4. **RetryQueued**
5. **Released**

### Polling Tick (every `polling.interval_ms`, default 30000)

1. **Reconcile** active runs — stall detection, tracker state refresh, cancel runs whose issue left active states.
2. **Validate** dispatch config (defensive re-validation even if hot-reload didn't fire).
3. **Fetch** candidate issues in `active_states`.
4. **Sort** by priority → creation time.
5. **Dispatch** while slots available.

### Concurrency Model

```
available_slots = max(max_concurrent_agents - running_count, 0)
```

Plus:
- `agent.max_concurrent_agents_by_state[state]` — normalized lowercase, per-state caps.
- `worker.max_concurrent_agents_per_host` — optional SSH host cap, shared across configured hosts.

### Agent Protocol (app-server over subprocess stdio)

Startup handshake (JSON-RPC-like):
1. `initialize` — client identity + capabilities.
2. `initialized` notification.
3. `thread/start` — approval policy, sandbox, workspace path.
4. `turn/start` — rendered prompt OR continuation guidance.

Key behaviors:
- **Continuation turns** reuse the same thread/workspace within a single worker lifetime.
- Up to `agent.max_turns` (default **20**) per worker run.
- After each turn, worker re-checks tracker state — if issue is still active, continue.
- Unsupported dynamic tool calls are **rejected without stalling**.
- **User-input requests hard-fail** the attempt (no human-in-the-loop mid-run).

### Optional `linear_graphql` Client-Side Tool

- Executes raw GraphQL against Linear using Symphony's configured auth.
- One operation per call — rejects multi-operation documents.
- Returns structured success/failure with the raw GraphQL response preserved.
- This is how the agent, not Symphony, mutates tickets.

### Governance Contract — `WORKFLOW.md`

```yaml
---
tracker:
  kind: linear
  endpoint: …
  api_key: …
  project_slug: …
  active_states: [Todo, In Progress]
  terminal_states: [Done, Canceled]
polling:
  interval_ms: 30000
workspace:
  root: /tmp/symphony
hooks:
  after_create: …
  before_run: …
  after_run: …
  before_remove: …
agent:
  max_concurrent_agents: 6
  max_retry_backoff_ms: 600000
  max_concurrent_agents_by_state:
    "in progress": 4
codex:
  command: codex
  approval_policy: on-failure
  thread_sandbox: workspace-write
  turn_sandbox_policy: workspace-write
  turn_timeout_ms: 900000
  read_timeout_ms: 60000
  stall_timeout_ms: 300000
---
# Prompt body (rendered per issue)

You are working on {{ issue.identifier }}: {{ issue.title }}.
...
```

**Dynamic reload**:
- Watch `WORKFLOW.md` → re-apply config without restart.
- Invalid reload → keep last known-good, emit operator-visible error.
- Defense: re-validate before each dispatch cycle (defeats watch misses).

**Prompt rendering**:
- **Strict** template engine — unknown variables/filters FAIL.
- Variables: `issue` (normalized), `attempt` (null on first run, int on retry).

### Key Data Schemas (in-memory)

**Issue (normalized domain model)**:
```
id, identifier, title, description, priority, state,
branch_name, url, labels, blocked_by, created_at, updated_at
```

**Live Session metadata**:
```
session_id (= thread_id + "-" + turn_id)
thread_id
turn_id
codex_app_server_pid
last_codex_event
last_codex_timestamp
token counters
turn_count
```

**Retry Entry**:
```
issue_id, identifier, attempt, due_at_ms, timer_handle, error
```

**Orchestrator runtime state (all in-memory, no DB)**:
```
running       : map issue_id → entry
claimed       : set
retry_attempts: map
completed     : set
codex_totals  : token aggregates
codex_rate_limits
```

### Recovery & Restart

**No persistent orchestrator database.** On restart:
1. **Startup terminal workspace cleanup** — query tracker for terminal issues, remove their workspaces.
2. **Fresh poll** of active issues.
3. **Re-dispatch** eligible work.

**Retry logic**:
- Continuation retries after normal exit: **1000 ms fixed delay**.
- Failure-driven retries: `min(10000 * 2^(attempt-1), agent.max_retry_backoff_ms)` (exponential with ceiling).
- If retry timer fires but issue no longer active → release claim.

### Optional HTTP Observability

- CLI `--port` overrides `server.port` from `WORKFLOW.md`.
- Loopback bind by default.
- `GET /api/v1/state` → running, retrying, aggregates.
- `GET /api/v1/<issue_identifier>` → issue detail.
- `POST /api/v1/refresh` → trigger immediate poll.
- `/` → optional dashboard.

---

## Publisher Background

**OpenAI** — unusual publication pattern here. This is not a product launch; it's a spec drop. No marketing, no blog post, no docs site. Apache 2.0, 14.9K stars in ~6 weeks (created 2026-02-26), 1,246 forks. The "engineering preview for trusted environments" framing and the "have your agent build it from SPEC" instruction signal that this is a reference pattern OpenAI wants the Codex ecosystem to absorb — most likely because they see Symphony as the canonical way to drive Codex's app-server protocol from a ticket tracker.

The Elixir reference implementation is a tell: BEAM is the ideal substrate for a polling daemon with many long-lived supervised processes and cheap concurrency. It's also distinctly NOT the default OpenAI stack — which suggests this came from someone internal who cared about correctness over house-style (likely the same reason Symphony has a formal SPEC rather than a README-and-source approach).

---

## What's Valuable for Us

### Directly adoptable now (Week 1)

1. **Run attempt phase enum** → adopt verbatim into `_bmad/orchestrator-tmux-state.json`. Replace our current ad-hoc status strings (`spawning`, `working`, `blocked`) with the Symphony enum. This gives us a language for worker state that maps 1:1 to tmux lifecycle events.

2. **Polling tick sequence** → codify into `.claude/agents/orchestrator.md`:
   - Reconcile BEFORE dispatch (our current loop dispatches first).
   - Defensive config re-validation even with hot reload.
   - Sort by priority→creation_time (we currently use only created_at).

3. **Workspace path containment check** → add as a PreToolUse hook. Before any agent launch, assert `realpath(cwd).startswith(realpath(workspace_root))`. Defeats `cd ..` breakout in --dangerously-skip-permissions mode. Pairs with our AgentShield research.

4. **session_id = thread_id-turn_id** → adopt for our session registry (`_bmad/session-registry.json`). Currently we key by tmux session name alone; adding thread/turn gives us per-attempt granularity.

5. **Retry backoff formula** → `min(10000 * 2^(attempt-1), max_retry_backoff_ms)`. Drop-in replacement for our current fixed retry delay.

6. **Strict prompt template rendering (fail on unknown vars)** → aligns with Burak's "no silent failures" principle. Our current prompt generation is string-template; switching to a strict engine catches orchestrator bugs at dispatch time, not runtime.

### Architectural patterns to study (Week 2-4)

7. **WORKFLOW.md governance model** → this is a better version of our CLAUDE.md + settings.local.json split. Single file with YAML front matter for orchestrator config + Markdown body for the prompt template. Hot reload without restart. Port to `WORKFLOW.md` at repo root for L-Thread; keep CLAUDE.md for agent-level instructions.

8. **Stateless orchestrator + tracker as source of truth** → validates our "trust GitHub Issues, not local state" intuition. Symphony takes it further: NO orchestrator database, period. Restart cost is one poll. For our Phase 2 (Days 4-60), this is the correct disaster recovery model — drop `_bmad/orchestrator-tmux-state.json` as the authority and treat it as a cache over `gh issue list`.

9. **Continuation turns within one worker lifetime** → explicit contract that a worker can do up to N turns on the same issue in the same workspace before exiting. Our tmux orchestrator implicitly does this (long-lived Claude session in a window), but Symphony formalizes the budget (`agent.max_turns = 20`) and the "re-check tracker before each turn" loop. Adopt the budget + re-check pattern to avoid runaway sessions.

10. **Active-run reconciliation every tick** → stop workers when issues transition to terminal states. We currently don't do this — if a human closes a GitHub issue mid-work, the worker keeps burning tokens. Add `gh issue view <n> --json state` check on every tick.

### Workspace persistence debate

Symphony's **workspace-persists-across-attempts** model is the opposite of our worktree-per-PR model. Trade-off:

| Dimension | Symphony (persistent workspace) | Ours (worktree-per-PR) |
|-----------|-------------------------------|----------------------|
| Context reuse across attempts | ✅ Free | ❌ Cold start each retry |
| Parallelism on same issue | ❌ One worker per issue | ✅ Multiple worktrees |
| Merge conflict exposure | Lower (single branch) | Higher (multiple branches) |
| Disk cost per issue | 1x repo | N x repo |
| Disaster recovery | ✅ Tracker replay | ✅ Git replay |

**Verdict**: keep worktrees for our parallel-worker default, but add a `--persistent-workspace` mode for issues marked `retry-heavy` where warm context is worth more than parallelism. Most useful for long-running refactors.

### Cross-links to catalogue

- **[AIE Europe 2026 Synthesis](../conference-reports/aie-europe-2026-synthesis.md)** — Vincent Kottsch's "swim lane 5-10-20 + clone-vs-worktree cap" pairs perfectly with Symphony's persistent workspace question. Symphony is the "clone" end of that spectrum.
- **[Code Mode (Sunil Pai)](../talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md)** — Symphony's app-server protocol is the exact substrate Code Mode would run on if OpenAI adopted capability-bounded sandboxes. Our Deno-based sandbox bet would slot under Symphony's agent runner.
- **[Overstory](./overstory.md)** — closest existing catalogue analog (tmux+worktree+SQLite), but Symphony beats it on formalism: explicit phase enum, strict reload, workspace invariants.
- **[Beads Viewer](./beads-viewer.md)** — Symphony's sort-by-priority could be upgraded to Beads' PageRank/critical-path. Combine: Symphony as orchestrator daemon, Beads as priority oracle.
- **[12 Factor Agents](../agent-protocols/12-factor-agents.md)** — Symphony hits most factors (stateless, deterministic-first, explicit config, own your control loop). Formalizes the "own your control loop" factor with the best concrete spec in the catalogue.
- **[Stripe Minions 70/30](../orchestration-platforms/stripe-minions.md)** — Symphony is ~80/20 deterministic/LLM (all orchestration logic is code, only the agent turn is LLM). More deterministic than Minions, validates the direction.

---

## What's NOT Relevant

1. **Elixir reference implementation** — we're not rewriting the orchestrator in BEAM. Read the Elixir code for behavior clarification but keep our Bash+Claude Code substrate. The SPEC is the artifact we care about.

2. **Linear-specific GraphQL client** — we use GitHub Issues. Port the `active_states`/`terminal_states` abstraction, skip the GraphQL adapter. Our equivalent is `gh issue list --state open --label …`.

3. **No mandated sandbox posture** — Symphony explicitly refuses to prescribe. We already decided (AIE Europe synthesis) that we want capability-bounded Deno sandbox. Symphony is silent here; we fill the gap ourselves.

4. **HTTP observability layer at `/api/v1/state`** — interesting but duplicated by our dashboard plan (`pi-orchestrator/dashboard.mjs`) and by cmux's socket API. Not a net-new pattern.

5. **"Ask your coding agent to build it from SPEC" adoption path** — cute, and we'll actually do it in spirit (adopt pieces), but we're not going to delegate the whole rebuild to an agent. The SPEC is dense enough to read and port by hand in 1-2 days.

6. **User-input requests hard-fail** — Symphony's choice to crash the attempt if the agent asks for human input. In our AUTO_MODE=ENABLED world this is already the rule, but we allow it for DISABLED mode. Keep our mode-aware behavior.

---

## Future Use Cases

- **Phase 1 (Days 1-3)** — lift SPEC patterns 1-6 (phase enum, polling tick sort, path containment, session_id scheme, retry formula, strict prompt render). Measurable impact on worker correctness within the week.

- **Phase 2 (Days 4-60)** — adopt WORKFLOW.md governance model as replacement for our CLAUDE.md+settings.local.json split. Hot reload without restart is a quality-of-life win for live-tweaking the orchestrator during a contract run. Also adopt stateless-tracker-as-truth model; drop `_bmad/orchestrator-tmux-state.json` to cache-only.

- **Phase 3 (Days 60-90)** — evaluate persistent-workspace mode for retry-heavy tasks. Build the `--persistent-workspace` flag path alongside the default worktree path. Measure: does warm context across attempts beat cold-start parallelism on issues that retry >2x?

- **Phase 4 (Day 90+)** — if Symphony's agent protocol stabilizes into a de facto standard (Codex + anything else that implements the app-server), consider making our orchestrator implement it as a compatibility shim so L-Thread workers can be driven by Symphony daemons and vice versa. This is the "harness-agnostic" play — same argument as Warp/Oz.

---

## Key Takeaway

> **Symphony is OpenAI's SPEC-first blessing of the tracker-driven, stateless, per-issue-workspace coding-agent orchestrator — the category we're already in — and its SPEC.md is the single highest-leverage document in the catalogue for upgrading L-Thread's state machine, retry logic, and reload semantics this week.**
