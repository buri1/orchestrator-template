# OpenClaw

> **Your own personal AI assistant. Any OS. Any Platform. The lobster way.**

| Field | Value |
|-------|-------|
| Category | :control_knobs: Orchestration Frameworks |
| Repository | [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) |
| GitHub Stars | 271,000 (as of 2026-03-08) |
| Publisher | Peter Steinberger (@steipete) — solo creator, now at OpenAI; transitioning to foundation governance |
| License | MIT |
| Tech Stack | TypeScript (Node.js), Pi agent framework (`@mariozechner/pi-coding-agent`), SQLite (embeddings), Markdown (memory/skills) |
| Maturity | :green_circle: Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *(reserved for personal observations)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves a different problem (personal AI assistant OS with channel routing) than what we need (dev-workflow orchestration of Claude Code instances). The Gateway/binding architecture is elegant but targets consumer messaging, not code-shipping pipelines. |
| **Novelty** | 4/10 | Most patterns already documented in our Phase 2/3 research. The ecosystem scale (250K+ stars, 13K+ skills, Moltbook) is impressive but not architecturally novel for us. |
| **Actionable** | 7/10 | Several concrete patterns are directly extractable: two-level lane queuing, heartbeat batching, pre-compaction memory flush, stuck-loop detection, context checkpoint protocol. These translate 1:1 to L-Thread improvements. |

---

## Overview

OpenClaw is an open-source agent operating system — not a framework — that treats AI agents as infrastructure. Originally published in November 2025 by Peter Steinberger as "Clawdbot," it exploded to 271K GitHub stars in ~60 days after the Moltbook agent social network catalyzed viral adoption in late January 2026. It is the fastest-growing open-source project in GitHub history, surpassing React.

The core architectural decision is separation of concerns: OpenClaw handles sessions, memory, tool sandboxing, access control, channel routing, and orchestration, while the **Pi agent framework** (`badlogic/pi-mono` by Mario Zechner) handles the actual agent loop — tool calling, LLM communication, and ReAct reasoning. OpenClaw embeds Pi via `createAgentSession()`, subscribes to its event stream, and replaces/extends Pi's default tools with its own sandboxed variants.

The system follows a five-component model: **Gateway** (control plane, message routing across 50+ channels), **Brain** (Pi-powered ReAct loop, model-agnostic across 15+ LLMs), **Memory** (markdown files on disk + SQLite vector index), **Skills** (markdown-defined capabilities via ClawHub's 13,700+ community skills), and **Heartbeat** (proactive scheduling and monitoring). The design philosophy is explicitly anti-database, anti-microservices, anti-vendor-lock-in.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Gateway                            │
│  Port 18789 · Session routing · Channel connections     │
│  WhatsApp │ Telegram │ Discord │ Slack │ Signal │ Email │
└──────────────────────┬──────────────────────────────────┘
                       │ Bindings ("most specific wins")
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌─────────┐ ┌─────────┐ ┌─────────┐
     │ Agent A │ │ Agent B │ │ Agent C │   (fully isolated)
     │ SOUL.md │ │ SOUL.md │ │ SOUL.md │
     │AGENTS.md│ │AGENTS.md│ │AGENTS.md│
     └────┬────┘ └────┬────┘ └────┬────┘
          │            │            │
          ▼            ▼            ▼
     ┌────────────────────────────────────┐
     │    Pi Agent Framework (embedded)   │
     │  createAgentSession() + events     │
     │  ReAct loop · Tool execution       │
     │  Session persistence (JSONL)       │
     └────────────┬───────────────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
  Memory       Skills      Heartbeat
  MEMORY.md    SKILL.md    HEARTBEAT.md
  daily notes  ClawHub     cron jobs
  SQLite vec   13,700+     hooks
```

**Key components:**

- **Gateway**: Single Node.js process. Routes messages via deterministic bindings (channel + accountId + per-peer). Session keys use `workspace:channel:userId` format to prevent cross-context leaks.
- **Brain (Pi)**: Embedded via `createAgentSession()`. Event stream: `agent_start -> turn_start -> message_start -> text_delta -> tool_execution_* -> message_end -> turn_end -> agent_end`. Two runtime paths: embedded (primary) and CLI runner (for Claude Code/Codex/Gemini CLI).
- **Memory**: Two-tier — `MEMORY.md` (long-term, curated) + `memory/YYYY-MM-DD.md` (daily notes). Pattern promotion from daily to long-term. Semantic search via embeddings in SQLite.
- **Concurrency**: Two-level lane queuing — session lane (1 run/session) + global lane (default cap: 4 main, 8 subagent). Pure TypeScript promises, no external deps.
- **Compaction**: Auto-triggers on context overflow or threshold. Pre-compaction memory flush via silent agent turn on `auto_compaction_start` event. Context checkpoint files prevent death spirals.

---

## Publisher Background

**Peter Steinberger (@steipete)**: Austrian developer, ex-founder of PSPDFKit (PDF SDK company, well-known in iOS ecosystem). Created OpenClaw as a personal project in November 2025. Joined OpenAI in February 2026 to "build an agent that even his mum can use." OpenClaw is transitioning to foundation governance.

**Mario Zechner (@badlogic)**: Creator of the Pi agent framework that powers OpenClaw's runtime. Also known for libGDX (popular Java game framework). Pi is a minimal TypeScript monorepo: `pi-ai` (LLM comms), `pi-agent-core` (agent loop), `pi-coding-agent` (4 tools + extensibility), `pi-tui` (terminal UI).

**Armin Ronacher**: Co-contributor to Pi. Creator of Flask (Python web framework) and Sentry's SDK architecture. Discussed Pi's design on Syntax FM podcast #976.

**Ecosystem builders**: Matt Schlicht (Moltbook), Austin Griffith (ClawdBot ATG on-chain agent), StartClaw team (one-click deployment).

The project has ~1,000 weekly contributors, 13,700+ community skills on ClawHub, and Moltbook hosts 1.5M+ registered AI agents.

---

## What's Valuable for Us

**1. Two-Level Lane Queuing** (`src/process/command-queue.ts`): Session-level serialization (1 run/session) + global parallelism cap (configurable per lane). Pure TypeScript + promises. This pattern maps directly to L-Thread's need to manage concurrent tmux agents without race conditions. Our `orchestrator-state.json` already tracks agents — adding lane-based queuing would prevent the duplicate-spawn issues we've hit.

**2. Pre-Compaction Memory Flush**: When `auto_compaction_start` fires, a silent agent turn writes durable memory before context is compacted. We should implement this in our `orchestrator-handoff.sh` — before Claude Code compacts, force a state dump to `_bmad/orchestrator-state.json`.

**3. Context Checkpoint Protocol**: Writing `.context-checkpoint.md` files containing current task state, active constraints, and critical instructions before compaction. This directly addresses our INC-014/INC-015 concerns about losing orchestration context mid-task.

**4. Stuck-Loop Detection**: Sliding window of last 10 tool calls with loose argument hashing. Breaks loops after 3 identical calls. Simple to implement in our tmux monitoring (check `tmux capture-pane` output for repeated patterns).

**5. Heartbeat Batching**: Instead of N separate health checks (N tmux reads), one batched heartbeat turn checks all agents. Our `check-agents.sh` pattern already does this deterministically — but the batching insight reinforces the Elvis Sun approach of zero-LLM monitoring.

**6. Skills-as-Markdown Pattern**: Validates our CLAUDE.md / `.claude/agents/*.md` approach. OpenClaw's `SKILL.md` with YAML frontmatter + markdown instructions is architecturally identical to our agent persona files.

**7. Deterministic Routing Over LLM Routing**: OpenClaw's binding system ("most specific wins") is pure deterministic routing. Reinforces our 70/30 principle — routing decisions should never go through an LLM.

---

## What's NOT Relevant

**Channel/Messaging Integration**: OpenClaw's primary value prop is connecting to WhatsApp, Telegram, Discord, Slack, Signal, email. We don't need this — our agents are Claude Code instances in tmux panes, not chat bots on messaging platforms.

**Moltbook / Agent Economy / Crypto Layer**: The entire Clawnch/Moltlaunch/agent-token ecosystem is irrelevant to our dev-workflow orchestration. The Moltbook 93% non-response rate is interesting data (validates that orchestration is mandatory) but the social network itself has no bearing on our work.

**Pi Agent Framework as Runtime**: We use Claude Code as our agent runtime, not Pi. Embedding Pi via `createAgentSession()` is elegant but we already have our harness (tmux + Claude Code + conduit). Replacing our runtime with Pi would be a lateral move, not an upgrade.

**Gateway as Orchestrator**: OpenClaw's Gateway is a long-running Node.js server managing persistent agent processes. Our orchestrator is an ephemeral Claude Code instance that spawns and monitors other Claude Code instances. Fundamentally different topology.

**Model Agnosticism**: OpenClaw supports 15+ models. We're Claude-native by design (Claude Max arbitrage). Multi-model support adds complexity we don't need.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Not applicable. OpenClaw solves a different problem than rapid orchestrator standup.
- **Phase 2 (Days 4-60)**: Extract the **two-level lane queuing** pattern for managing concurrent tmux agents. Implement **stuck-loop detection** in our tmux monitoring. Add **context checkpoint protocol** to our handoff scripts.
- **Phase 3 (Days 60-90)**: If we build a persistent orchestration daemon (moving beyond ephemeral Claude Code orchestrator), OpenClaw's Gateway architecture becomes a reference implementation for session management and deterministic routing.
- **Phase 4 (Days 90+)**: If client-facing agent deployment becomes a business line (agents connected to Slack/Teams for gov clients), OpenClaw's channel integration and deployment model (StartClaw, DigitalOcean one-click) become directly relevant. Also relevant if we productize the orchestrator as a SaaS.

---

## Key Takeaway

> **OpenClaw is an agent OS for consumer messaging channels, not a dev-workflow orchestrator — but its concurrency model (two-level lane queuing), resilience patterns (pre-compaction memory flush, stuck-loop detection, context checkpoints), and deterministic routing philosophy contain directly extractable engineering that would harden the L-Thread orchestrator.**
