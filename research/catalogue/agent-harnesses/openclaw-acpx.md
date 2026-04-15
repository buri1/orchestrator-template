# openclaw/acpx

> **Headless CLI client for stateful Agent Client Protocol (ACP) sessions — one tool to drive Codex, Claude Code, Gemini, Pi, OpenClaw, Cursor, Copilot, Droid, and 10+ other coding agents over a structured protocol instead of PTY scraping.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/openclaw/acpx](https://github.com/openclaw/acpx) |
| GitHub Stars | 2,079 (as of 2026-04-11) |
| Publisher | OpenClaw org (Peter Steinberger) — primary author Honor Solaz (Text Cortex founding engineer, OpenClaw maintainer since day one, MS Teams integration author) |
| License | MIT |
| Tech Stack | TypeScript / Node.js (npm `acpx`); JSON-RPC over stdio; Zed ACP (Agent-Client Protocol) + Codex app-server protocol as transports |
| Maturity | 🟡 Early (alpha — CLI/runtime interfaces explicitly marked subject to change; 277 commits, ~2 months old, created 2026-02-17) |
| Last Analyzed | 2026-04-11 |

---

## Burak's Notes

> *(reserved for personal observations — this is the CLI primitive that turns `run-tmux.sh` into a protocol-driven worker pool without giving up the orchestrator's auto-mode posture)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Direct solution to our #1 Phase-2 pain: we drive every worker by scraping `tmux capture-pane` output and detecting idle via heuristics. ACPX replaces that with structured JSON-RPC events (`stream/turn`, `tool_call`, `thinking`, `diff`, `session/set_mode`, `session/set_config_option`) and a persistent `~/.acpx/sessions/` store keyed by repo + name. Honor Solaz is the AIE Europe 2026 speaker whose ACP-at-OpenClaw talk we already catalogued at 9/10 — this is the artefact from that talk. |
| **Novelty** | 8/10 | Known concept (ACP from Zed, 2025) but the first headless, multi-agent, queue-aware, reconnecting, flow-runnable CLI implementation we've seen. Novel pieces: **named parallel sessions per repo** (`-s backend` / `-s frontend`), **queue-aware prompts with TTL queue-owner**, **soft-close lifecycle** that preserves history across process death, **cooperative cancel via `session/cancel` RPC** (not SIGKILL), and **Flows** as a TypeScript-authored multi-step workflow engine compiled from a DAG schema. |
| **Actionable** | 9/10 | Zero-install via `npx acpx@latest`. We can adopt in one day as a drop-in replacement for direct `claude --dangerously-skip-permissions` spawning: `tmux new-window` → `npx acpx claude "$(cat prompt.md)" --format json` and parse NDJSON instead of `capture-pane`. The `agents/` adapter folder has a ready-made Codex/Claude/Gemini/Pi/Copilot/Droid/Cursor/Qwen/Kimi/Kiro/OpenCode/Qoder/Trae/Iflow/Kilocode template library — we inherit 15+ agents for free. |

---

## Overview

**acpx** is a headless TypeScript CLI that speaks the **Agent-Client Protocol (ACP)** — an open, JSON-RPC-based protocol originally shipped by Zed (Rust editor) to let a single agent adapter plug into many host clients without each host rebuilding its own plugin. ACP is explicitly **not MCP**: MCP standardizes how an agent calls tools, while ACP standardizes how a host drives an agent (new session, prompt, cancel, set-mode, tool-approval callbacks, diff/thinking/tool-call events). acpx turns that protocol into a Unix-style CLI so any script, bash pipeline, Discord bot, Slack handler, or orchestrator can drive any ACP-compatible coding agent identically.

The tool's core value proposition — quoting the README — is: *"Your agents love acpx! They hate having to scrape characters from a PTY session."* It replaces terminal scraping with **structured NDJSON events** and replaces ad-hoc `spawn claude` with a persistent, directory-scoped session model stored under `~/.acpx/sessions/`. Each session is a full multi-turn conversation keyed by (agent, working directory, optional session name), with queueing semantics when a new prompt arrives while one is in flight, **auto-reconnection** when the underlying agent process dies, and **soft-close** which terminates the process but preserves conversation history.

Above the session layer sits a second-order primitive: **Flows**, a TypeScript-authored multi-step workflow engine (`src/flows/` — `definition.ts`, `graph.ts`, `schema.ts`, `store.ts`, `executors/`). A flow is a DAG of prompts and agent calls you author as a `.ts` file, run with `acpx flow run <file.ts> --input-file <json>`, and execute deterministically against any mix of configured agents. This is the concrete realization of Honor Solaz's AIE Europe talk thesis on **SOPs for Agents** (Standard Operating Procedures as code) and his workflow-engine demo — reproduce-bug → judge → refactor → review loops run identically over Codex or Claude Code via the same binary.

---

## Technical Architecture

### Process Model

```
┌──────────────────────────────────────────────────────────────┐
│                       acpx CLI (Node.js)                     │
│  src/cli.ts → cli-core.ts → cli-public.ts                    │
│                                                              │
│  ┌────────────────┐   ┌────────────────┐   ┌──────────────┐  │
│  │ Session Store  │   │ ACP Client     │   │ Runtime      │  │
│  │ ~/.acpx/       │   │ JSON-RPC/stdio │   │ Engine       │  │
│  │ sessions/      │◄──┤ src/acp/       │◄──┤ src/runtime/ │  │
│  │ src/session/   │   │ client.ts      │   │ engine/      │  │
│  │ persistence.ts │   │ jsonrpc.ts     │   │              │  │
│  │ event-log.ts   │   │ codex-compat.ts│   │              │  │
│  └────────────────┘   └────────┬───────┘   └──────────────┘  │
│                                │                             │
│                                ▼                             │
│              ┌──────────────────────────────┐                │
│              │ client-process.ts            │                │
│              │ spawns + supervises agent    │                │
│              └───────────────┬──────────────┘                │
└──────────────────────────────┼───────────────────────────────┘
                               │ stdio JSON-RPC
                               ▼
              ┌────────────────────────────────┐
              │ ACP-compatible coding agent    │
              │ (codex, claude, gemini, pi,    │
              │  openclaw, cursor, copilot,    │
              │  droid, qwen, kimi, kiro, ...) │
              └────────────────────────────────┘
```

### Directory Layout

```
acpx/
├── src/
│   ├── acp/                       # Protocol implementation
│   │   ├── client.ts              # ACP JSON-RPC client
│   │   ├── jsonrpc.ts             # Transport
│   │   ├── codex-compat.ts        # Alt Codex app-server protocol
│   │   ├── client-process.ts      # Agent process supervision
│   │   ├── agent-command.ts       # Per-agent spawn recipes
│   │   ├── terminal-manager.ts    # Embedded terminal tool handling
│   │   ├── error-shapes.ts        # Typed error taxonomy
│   │   └── session-control-errors.ts
│   ├── session/                   # Stateful session model
│   │   ├── session.ts             # Session lifecycle
│   │   ├── conversation-model.ts  # Multi-turn conversation
│   │   ├── event-log.ts           # Append-only event log
│   │   ├── persistence.ts         # ~/.acpx/sessions/ on disk
│   │   ├── mode-preference.ts     # session/set_mode persistence
│   │   └── runtime-session-id.ts  # Stable IDs across reconnect
│   ├── runtime/                   # Execution runtime
│   │   ├── engine/                # Core state machine
│   │   └── public/                # Stable public API surface
│   ├── flows/                     # Workflow engine (THE interesting bit)
│   │   ├── definition.ts          # Flow type definitions
│   │   ├── schema.ts              # JSON schema validation
│   │   ├── graph.ts               # DAG representation
│   │   ├── authoring.ts           # TS authoring API
│   │   ├── executors/             # Step executors
│   │   ├── runtime.ts             # Flow interpreter
│   │   ├── store.ts               # Flow persistence
│   │   └── cli.ts                 # `acpx flow run` command
│   ├── cli/                       # CLI subcommand plumbing
│   ├── agent-registry.ts          # Built-in agent catalog
│   ├── async-control.ts           # Cancel/timeout/abort plumbing
│   ├── mcp-servers.ts             # MCP server passthrough
│   ├── perf-metrics.ts            # Session-level perf tracking
│   ├── permission-prompt.ts       # --approve-all/-reads/-deny-all
│   ├── permissions.ts             # Permission resolution
│   ├── persisted-key-policy.ts    # API key redaction
│   ├── prompt-content.ts          # stdin/file/argv prompt sources
│   ├── filesystem.ts              # Safe fs operations
│   └── runtime.ts                 # Top-level runtime entry
├── agents/                        # Per-agent adapter docs (15+)
│   ├── Codex.md
│   ├── Claude.md (implicit via openclaw)
│   ├── Gemini.md
│   ├── Cursor.md
│   ├── Copilot.md
│   ├── Droid.md                   # Factory
│   ├── Iflow.md
│   ├── Kilocode.md
│   ├── Kimi.md
│   ├── Kiro.md
│   ├── OpenCode.md
│   ├── Qoder.md
│   ├── Qwen.md
│   └── Trae.md
├── skills/                        # acpx-as-a-skill reference
├── flows/ (examples/flows/)       # Multi-step workflow examples
├── conformance/                   # ACP conformance tests
├── references/                    # Protocol reference artifacts
├── docs/                          # Full CLI docs
└── test/
```

### Session Model (the killer feature for us)

- **Scoping**: `(agent, cwd, session_name?)` — multiple named parallel sessions per repo, e.g. `acpx claude -s backend "…"` and `acpx claude -s frontend "…"` are independent conversations in the same working directory.
- **Queue-aware prompts**: if a prompt arrives while another is in flight, it queues automatically; `--ttl <seconds>` controls queue owner idle lifetime.
- **Auto-reconnection**: dead agent processes trigger transparent session reload with fallback recovery — conversation history survives `SIGKILL`, laptop sleep, tmux pane crash.
- **Soft-close**: `acpx <agent> sessions close [name]` terminates the underlying process **but keeps history**, so the next prompt reopens the same multi-turn context.
- **Cooperative cancel**: `acpx <agent> cancel` sends an ACP `session/cancel` RPC — not SIGKILL — giving the agent a chance to commit partial state.
- **Persistence layer**: `src/session/persistence.ts` writes conversation, event log, and mode preference under `~/.acpx/sessions/<agent>/<cwd-hash>/<name>/`.

### CLI Surface

```bash
# Session management
acpx <agent> sessions new [--name <name>]
acpx <agent> sessions ensure [--name <name>]
acpx <agent> sessions close [name]
acpx <agent> sessions show|history|list

# Prompting (four input modes)
acpx <agent> "<prompt>"                   # implicit positional
acpx <agent> prompt "<prompt>"            # explicit subcommand
acpx <agent> --file <path> "<prompt>"     # from file
echo "text" | acpx <agent>                # from stdin
acpx <agent> --no-wait "<prompt>"         # fire-and-forget (queue owner TTL)
acpx <agent> cancel                       # cooperative cancel

# Control plane (passthroughs to ACP RPCs)
acpx <agent> set-mode <mode>              # session/set_mode
acpx <agent> set <key> <value>            # session/set_config_option
acpx <agent> status                       # local process status

# One-shot stateless
acpx <agent> exec "<prompt>"

# Multi-step workflows
acpx flow run <file.ts> --input-file <json>

# Config
acpx config show|init

# Global flags
--approve-all | --approve-reads | --deny-all    # permission policy
--cwd <path>                                    # override working dir
--format text | json | quiet                    # output format
--json-strict                                   # suppress non-JSON stderr
--timeout <seconds>                             # execution timeout
--ttl <seconds>                                 # queue owner idle lifetime
--suppress-reads                                # hide file-read payloads
--verbose                                       # debug logging
--agent <command>                               # custom agent binary
```

### Built-in Agent Adapters

`agents/` ships with ready-to-use adapter docs for: **codex, claude, gemini, pi, openclaw, cursor, copilot, droid (Factory), iflow, kilocode, kimi, kiro, opencode, qoder, qwen, trae**. Custom agents plug in via `--agent <command>`.

### Config

- Global: `~/.acpx/config.json`
- Project: `.acpxrc.json`
- CLI flags override file config. `acpx config init` scaffolds.

### Distribution

```bash
npm install -g acpx@latest
# or zero-install:
npx acpx@latest <command>
```

---

## Publisher Background

**Authoring org**: The `openclaw/` GitHub organization is Peter Steinberger's (ex-PSPDFKit founder, now at OpenAI) neutral home for the OpenClaw ecosystem, the fastest-growing open-source project in GitHub history (~271K stars, ~30K PRs, ~2K contributors in ~5 months per his State of the Claw keynote at AIE Europe 2026). OpenClaw itself ships MIT, is transitioning to foundation governance modeled on Ghostty, and powers multi-channel "personal AI" deployments across WhatsApp/Telegram/Discord/Slack/Signal/Email.

**Primary author**: **Honor Solaz** — founding engineer at **Text Cortex** (Vienna-based AI startup), OpenClaw maintainer "since day one" (when it was still called "Cloudbot"), and author of the MS Teams integration. His background is unusually relevant: he started building coding harnesses in 2022 with a **Jupyter Lab extension over OG Codex (DaVinci Code 2)** that evolved Ship-of-Theseus-style into Text Cortex's current production harness. At AIE Europe London 2026 (2026-04-09) he presented the exact thesis behind acpx: ACP as "build once, ship everywhere" protocol for coding agents, SOPs-for-agents as scalable workflow automation, and a live demo of acpx as workflow engine. See our catalogued talk: [Building on ACP at OpenClaw](../talks/2026-04/aie-europe-2026-honor-solaz-acp-openclaw.md) (9/10 relevance).

**Protocol lineage**: ACP itself is from **Zed** (Rust editor, by the ex-Atom/Tree-sitter team). Zed picked ACP over the competing Agent Protocol (A2A) because Zed had already built first-mover ACP adapters for Codex and Claude Code. Honor explicitly notes acpx *also* speaks the Codex app-server protocol (contributed by a maintainer named Herald) as an alternative transport — so it's not locked into ACP purity.

**Maturity signals**: 2,079 stars + 191 forks in ~2 months, 277 commits, TypeScript first-class, README explicitly flags "alpha — CLI/runtime interfaces subject to change." Direct association with Peter Steinberger's org gives it trust inheritance from OpenClaw.

---

## What's Valuable for Us

This is a **Phase-2 adoption candidate**, not a Phase-4 watch-list item. Concretely:

1. **Replace `tmux capture-pane` polling with NDJSON event streams.** Our `.claude/agents/orchestrator.md` rules mandate "NIEMALS bash sleep for waiting — poll with `capture-pane` on intervals". That works but is fragile (ANSI escape sequences, scrollback truncation, status line pollution). `acpx --format json` emits one JSON event per turn/tool-call/thinking-block/diff. Pipe `acpx claude "$(cat prompt.md)" --format json | jq -c 'select(.type == "turn_end")'` and we get deterministic completion detection, no more `capture-pane -S -50` heuristics.

2. **Stateful sessions survive tmux pane crashes.** Today, if a tmux window gets killed (OOM, supervisor glitch, accidental `kill-window`), the Claude process dies and its conversation history evaporates. acpx's auto-reconnection + `~/.acpx/sessions/` persistence means `acpx claude sessions ensure -s issue-123` reopens the exact conversation, including prior tool calls and diffs. This directly slots into our **`.bmad/scripts/orchestrator-session-start.sh`** recovery hook — replace "spawn fresh Claude" with "ensure acpx session" and we get resume-on-crash for free. See `src/session/persistence.ts` + `src/session/event-log.ts`.

3. **Queue-aware prompts solve our multi-worker race condition.** Our state file `_bmad/orchestrator-tmux-state.json` tracks "claude_running: false" but has no way to enqueue a follow-up without waiting. acpx queueing means reviewer and fixer prompts for the same issue can land on the same session without extra orchestration — `--ttl` governs idle lifetime so we don't leak sessions.

4. **Cooperative cancel (`session/cancel` RPC) instead of `tmux kill-window`.** Today our roadblock-recovery path SIGKILLs the whole window, losing partial state. acpx sends a protocol-level cancel the agent can respond to — agents typically flush partial diffs and commit history. Cleaner teardown for the REVIEW-FIX LOOP (max 3 cycles).

5. **Flows engine (`src/flows/`) is the SOP-for-agents primitive we've been planning to build.** The `acpx flow run <file.ts>` command executes a deterministic DAG of agent calls authored in TypeScript. This is exactly our "70/30 deterministic/LLM split" pattern from [Stripe Minions](../orchestration-platforms/stripe-minions.md) — deterministic routing around LLM steps, encoded as code, not prompt chains. We can move the orchestrator loop's Steps 1-10 from `.claude/commands/orchestrator.md` prose into a real `orchestrator.flow.ts` and run it under acpx instead of reasoning about it each time.

6. **The `agents/` adapter library is a free harness-agnostic upgrade.** Our architecture is Claude-Code-first but we've been pressured to also support Pi (oh-my-pi), Codex, Gemini CLI, Droid, and OpenCode for specific tasks. acpx gives us a uniform CLI over 15+ agents — swap `claude` for `codex` in one bash variable and the same orchestrator loop routes work through a different model. Directly supports model routing from [oh-my-claudecode](./oh-my-claudecode.md) and [Oh-My-Pi](./pi/oh-my-pi.md) insights.

7. **Permission policy flags (`--approve-all`/`--approve-reads`/`--deny-all`) are a cleaner alternative to `--dangerously-skip-permissions`.** Our current setup uses `--dangerously-skip-permissions` blanket-allow, which [AgentShield](../code-intelligence/agentshield.md) flags as highest-risk (102 Semgrep rules scan exactly this surface). acpx exposes a per-call permission mode — we can run `--approve-reads` for reviewers (read-only) and `--approve-all` only for fixers, matching the capability-based-security principle from the [AIE Europe 2026 Conference Synthesis](../conference-reports/aie-europe-2026-synthesis.md) and [Sunil Pai's Code Mode talk](../talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md) (10/10 — capability scoping > ambient auth).

8. **Direct connection to existing catalogue entries.** Don't rebuild from scratch — this is the adapter layer that makes our catalogued harnesses interoperable:
   - [OpenClaw](../orchestration-platforms/openclaw.md) — parent ecosystem, Peter Steinberger's org
   - [Ironclaw](./ironclaw.md) — Rust OpenClaw rewrite with capability sandbox; both drive agents over ACP
   - [Honor Solaz's AIE Europe talk](../talks/2026-04/aie-europe-2026-honor-solaz-acp-openclaw.md) — the design rationale
   - [Peter Steinberger's State of the Claw](../talks/2026-04/aie-europe-2026-peter-steinberger-state-of-claw.md) — ecosystem context
   - [Code Mode (Sunil Pai)](../talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md) — capability-based security principle acpx operationalizes

**Concrete adoption path (1-day spike):**
- Day 0: `npm install -g acpx` on the mac, add to `run-tmux.sh`.
- Day 0: Replace `tmux send-keys -t <w> 'unset CLAUDECODE && claude --dangerously-skip-permissions' Enter` with `acpx claude --approve-reads -s issue-<n> --format json`.
- Day 0: Pipe the NDJSON to a tiny jq filter that updates `_bmad/orchestrator-tmux-state.json` on every `turn_end`.
- Day 1: Author the orchestrator loop as `flows/orchestrator.flow.ts` and run via `acpx flow run`.

---

## What's NOT Relevant

1. **Don't adopt acpx as an orchestrator replacement.** It's a session client, not a supervisor. Our L-Thread architecture (tmux + worktrees + state file + hooks) stays exactly as-is. acpx plugs in *inside* the worker window, not around it.

2. **Flows engine is not a Temporal/Inngest replacement.** For our Phase-3 durable-execution needs, [Inngest](../orchestration-platforms/inngest.md) (8/10) and [Trigger.dev](../infrastructure/trigger-dev.md) (8/10) remain the right answer — they have durable state, at-least-once semantics, retries, and schedules. acpx flows are ephemeral DAG execution scoped to a single invocation.

3. **Alpha status means we should not wire it into gov-client-facing code without pinning.** `npm install -g acpx@<commit>` or vendored dependency — not `@latest`. README explicitly says interfaces may break.

4. **TypeScript / npm dependency adds a new runtime to an otherwise bash+tmux+Claude stack.** Trade-off: we inherit the npm supply-chain surface that Peter Steinberger's State of the Claw talk specifically warned about (Ghost Claw DPRK NPM typosquat, Axios unpinned transitive dep). Mitigation: pin + `npm audit` hook + prefer `npx` over global install.

5. **Codex app-server protocol compat is fine but not a feature we need.** We're Claude-Code primary. Nice to have, ignore for now.

6. **Built-in agent adapters for agents we don't plan to use** (Qoder, Kilocode, Iflow, Kiro, Trae, Kimi) are dead weight in our setup — but zero-cost dead weight since we only invoke what we need.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Replace `tmux send-keys` worker launch with `acpx claude --format json -s <issue>` in `run-tmux.sh`. Parse NDJSON for deterministic turn-end detection. **Highest-ROI change in the catalogue this month.**
- **Phase 2 (Days 4-60)**: Author `flows/orchestrator.flow.ts` as a deterministic DAG replacing the prose loop in `.claude/commands/orchestrator.md`. Use `--approve-reads` for reviewers, `--approve-all` for fixers. Wire session soft-close into recovery hooks so crashed workers resume their conversation automatically.
- **Phase 3 (Days 60-90)**: Multi-harness routing — `acpx pi` for deep planning, `acpx claude` for coding, `acpx gemini` for free-tier E2E test generation, same orchestrator loop. Matches [oh-my-claudecode](./oh-my-claudecode.md) + [Oh-My-Pi](./pi/oh-my-pi.md) model routing patterns.
- **Phase 4 (Day 90+)**: When we stand up the Deno capability-bounded worker sandbox from the [AIE Europe synthesis](../conference-reports/aie-europe-2026-synthesis.md) "Code Mode" bet, acpx's permission flags become the top-level capability declaration. ACP becomes the bridge between our sandbox layer and whichever frontier agent is cheapest this quarter.

---

## Key Takeaway

> **acpx is the one-day-adoption CLI primitive that replaces every brittle `tmux capture-pane` polling loop and `--dangerously-skip-permissions` spawn in our orchestrator with stateful, queue-aware, reconnecting, permission-scoped JSON-RPC sessions over ACP — and the `src/flows/` engine is the SOP-for-agents primitive we were about to build ourselves.**
