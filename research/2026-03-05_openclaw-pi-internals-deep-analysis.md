# How OpenClaw Uses Pi Agent Internally: A Deep Technical Analysis

**Date:** 2026-03-05
**Focus:** Internal architecture of OpenClaw's Pi Agent integration, extractable orchestration patterns, ecosystem implications, and lessons for building multi-agent orchestrators.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Five-Layer Architecture](#2-the-five-layer-architecture)
3. [Pi Agent Embedding: createAgentSession() Deep Dive](#3-pi-agent-embedding-createagentsession-deep-dive)
4. [The Brain Layer: Orchestrating Multiple Pi Sessions](#4-the-brain-layer-orchestrating-multiple-pi-sessions)
5. [The Memory Layer: What Persists and How](#5-the-memory-layer-what-persists-and-how)
6. [The Skills System: Composable Capabilities](#6-the-skills-system-composable-capabilities)
7. [The Heartbeat Mechanism: Proactive Agent Behavior](#7-the-heartbeat-mechanism-proactive-agent-behavior)
8. [Concurrency Architecture: Lanes, Queues, and Isolation](#8-concurrency-architecture-lanes-queues-and-isolation)
9. [Context Window Management and Compaction Pipeline](#9-context-window-management-and-compaction-pipeline)
10. [Error Recovery and Resilience Patterns](#10-error-recovery-and-resilience-patterns)
11. [Multi-Agent Routing and Delegation](#11-multi-agent-routing-and-delegation)
12. [steipete's Orchestration Philosophy](#12-steipetes-orchestration-philosophy)
13. [The OpenClaw Ecosystem: What It Reveals](#13-the-openclaw-ecosystem-what-it-reveals)
14. [Extractable Patterns for Orchestrator Builders](#14-extractable-patterns-for-orchestrator-builders)
15. [Anti-Patterns to Avoid](#15-anti-patterns-to-avoid)
16. [Sources](#16-sources)

---

## 1. Executive Summary

OpenClaw is the fastest-growing open-source project in GitHub history, crossing 240,000+ stars and surpassing React. Created by Peter Steinberger (steipete), it functions as an operating system for AI agents rather than a simple chatbot wrapper. Steinberger joined OpenAI in February 2026 to "bring agents to everyone," while OpenClaw transitioned to a foundation to remain open and independent.

The critical architectural insight is that **OpenClaw does not implement its own agent runtime**. The core agent loop -- tool calling, context management, LLM interaction -- is handled entirely by the **Pi agent framework** (`@mariozechner/pi-coding-agent` by Mario Zechner). OpenClaw builds the gateway, orchestration, memory, skills, and integration layers on top of Pi. This separation of concerns is the single most important design decision in the project: Pi owns the agent loop, OpenClaw owns everything else.

This document analyzes how that integration works in practice, what architectural patterns emerge, and which are extractable for building other orchestration systems.

---

## 2. The Five-Layer Architecture

OpenClaw follows a five-component model, each with a distinct responsibility:

| Layer | Responsibility | Implementation |
|-------|---------------|----------------|
| **Gateway** | Routes messages from 50+ channels (WhatsApp, Telegram, Discord, Slack, Signal) to agent sessions | Single Node.js process on `127.0.0.1:18789` |
| **Brain** | Orchestrates LLM calls via the ReAct reasoning loop | Pi agent framework (`@mariozechner/pi-coding-agent`) |
| **Memory** | Stores persistent context across sessions | Markdown files on local filesystem + SQLite for embeddings |
| **Skills** | Composable capability bundles | Markdown files with YAML frontmatter (SKILL.md) |
| **Heartbeat** | Proactive task scheduling and monitoring | Periodic gateway-triggered agent turns reading HEARTBEAT.md |

The Gateway is the central control plane. It manages every messaging platform connection simultaneously. When a message arrives from any platform, the Gateway routes it to the appropriate agent session, waits for a response, and sends it back through the correct channel.

The Brain does not directly call LLM APIs. Instead, it delegates to Pi's agent loop, which executes a cycle of: LLM proposes tool calls, OpenClaw executes them, results are fed back, and the loop continues until resolution or limits are hit.

This is a critical distinction: OpenClaw is not a "framework" in the way LangChain or CrewAI are frameworks. It is closer to an agent operating system -- it handles sessions, memory, tool sandboxing, access control, and orchestration, while external LLMs (Claude, GPT, Gemini, DeepSeek, Ollama) provide the intelligence, and Pi provides the agent loop machinery.

---

## 3. Pi Agent Embedding: createAgentSession() Deep Dive

### The Embedded Approach

OpenClaw integrates Pi by direct SDK import, not by spawning a subprocess or using RPC. Inside `runEmbeddedAttempt()`, it imports four core components from `@mariozechner/pi-coding-agent`:

- **`createAgentSession`** -- instantiates an agent session with full configuration
- **`DefaultResourceLoader`** -- loads workspace resources, agent definitions, and settings
- **`SessionManager`** -- handles session persistence in JSONL format with tree structure
- **`SettingsManager`** -- manages configuration and model settings

### Session Creation Parameters

When calling `createAgentSession()`, OpenClaw passes:

- **Workspace directory** -- the working directory for the agent
- **Agent directory** -- where agent configuration lives
- **Auth storage** -- API key management with multi-account rotation
- **Model registry** -- provider-agnostic model switching
- **Model and thinking level** -- the specific LLM and reasoning depth
- **Built-in tools** -- Pi's standard tools (read, write, edit, bash)
- **Custom tools** -- OpenClaw's extensions (messaging, browser, canvas, cron, sessions)
- **Session manager** -- wrapped with `guardSessionManager()` for safety
- **Settings manager** -- configuration layer
- **Resource loader** -- initialized with extension paths and reloaded

### Session Persistence

Sessions are stored as **JSONL files** with tree structure (id/parentId linking) at `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl`. This is a fundamental architectural choice: OpenClaw owns the entire session filesystem, using Pi only as the agent loop engine. The system prompt is applied after session creation via `applySystemPromptOverrideToSession()`.

### Event Streaming

OpenClaw subscribes to Pi's event stream via `subscribeEmbeddedPiSession()`. The event sequence is:

```
agent_start -> turn_start -> message_start -> text_delta... ->
tool_execution_start -> tool_execution_update -> tool_execution_end ->
message_end -> turn_end -> agent_end
```

Every event is routed to the appropriate handler: text deltas become streaming replies to WhatsApp/Telegram chats, tool executions get logged in JSONL transcripts, and `auto_compaction_start` triggers the memory flush system.

### Tool Replacement

OpenClaw does not use Pi's tools as-is. It replaces and extends them:

- **bash** is replaced with `exec`/`process` (sandbox-aware, elevated mode support)
- **read/edit/write** are customized for OpenClaw's sandbox model
- **OpenClaw-native tools** are injected: `message`, `browser`, `canvas`, `cron`, `gateway`, `sessions`, `memory`
- **Channel-specific tools** are added per platform (Discord reactions, Telegram formatting, etc.)

Tool groups available: `group:runtime` (exec, bash, process), `group:fs` (read, write, edit, apply_patch), `group:sessions`, `group:memory`, `group:web`, `group:ui` (browser, canvas), `group:automation` (cron, gateway), `group:messaging` (message), `group:nodes`.

### The Runtime Entry Point

The primary entry point is `runEmbeddedPiAgent`, which manages the full lifecycle of an agent turn. The codebase structure is:

- `pi-embedded-runner.ts` -- main re-exports
- `run.ts` -- main entry: `runEmbeddedPiAgent()`
- `run/attempt.ts` -- single attempt logic with session setup (`runEmbeddedAttempt`)
- `run/params.ts` -- `RunEmbeddedPiAgentParams` type
- `run/payloads.ts` -- build response payloads from run results
- `run/images.ts` -- vision model image injection

`runEmbeddedAttempt` is called within a retry loop that keeps trying until success or an unrecoverable error, handling context overflow (triggering compaction) and authentication errors (rotating API keys).

---

## 4. The Brain Layer: Orchestrating Multiple Pi Sessions

### One Agent, Many Sessions

A single OpenClaw agent can have many concurrent sessions -- one per Telegram chat, one per Discord thread, one per cron job, etc. The agent defines the configuration; the session holds the conversational state.

### The ReAct Loop

The Brain compiles a system prompt with available tools, sends it to the LLM via Pi, parses the response for tool calls, executes them, and loops until a final answer emerges. Pi handles the inner loop mechanics; OpenClaw handles the outer orchestration (which session, which tools, which model).

### Multi-Agent Coordination

OpenClaw supports two multi-agent patterns:

1. **Manager agent (agents-as-tools)** -- One coordinator agent receives tasks, classifies them, and delegates to specialist agents using `sessions_spawn` or `sessions_send`. Specialists return structured output. The coordinator synthesizes.

2. **Decentralized handoff** -- Agents can transfer conversation control to other agents with routing overrides. This supports pipeline patterns (Writer passes to SEO) and peer-to-peer collaboration.

### Subagent System

Subagents run with restricted tool policies, depth limits, and independent session contexts while maintaining communication channels with their parent agents. The subagent lane has a default concurrency cap of 8, separate from the main lane's cap of 4.

---

## 5. The Memory Layer: What Persists and How

### Opinionated Design: Memory Is Markdown

OpenClaw makes a strongly opinionated choice: memory is plain Markdown in the agent workspace. Files are the source of truth; the model only "remembers" what gets written to disk.

### Two-Tier Memory Structure

| Tier | File | Contents |
|------|------|----------|
| **Long-term** | `MEMORY.md` | Decisions, preferences, durable facts -- curated and small |
| **Daily notes** | `memory/YYYY-MM-DD.md` | Running context, session events, task tracking |

### What Gets Stored

- User preferences and behavioral patterns (e.g., preferring Bash snippets over theoretical explanations)
- Facts from conversations: names, projects, past decisions
- Cross-session decisions and lessons learned
- Error patterns and recovery strategies

### Pattern Promotion

Over time, OpenClaw notices recurring patterns and promotes them from daily notes into long-term memory. This happens through the agent's own reasoning during heartbeat and compaction cycles.

### Semantic Search

The system uses embedding-based semantic search over markdown chunks, with embeddings stored in SQLite for efficient retrieval across sessions. This means memory is not just file-based -- it is searchable at the semantic level.

### Pre-Compaction Memory Flush

When a session approaches auto-compaction, OpenClaw triggers a silent, agentic turn that reminds the model to write durable memory before the context is compacted. This is critical: without it, information that exists only in conversation history would be lost during compaction.

---

## 6. The Skills System: Composable Capabilities

### Skills Are Not Code

A skill is a **versioned bundle of files** that teaches OpenClaw how to perform a specific task. Skills are not TypeScript modules or Python packages. They are folders containing:

- **SKILL.md** -- primary description and usage instructions (markdown with YAML frontmatter)
- Optional configs, scripts, or supporting files
- Metadata: tags, summary, install requirements

### ClawHub: The Skill Registry

ClawHub is the official skill store with 3,286+ skills. Key properties:

- **Embedding-based vector search** instead of keyword matching -- developers can discover skills even if their query doesn't exactly match the skill description
- Metadata-driven discovery with usage signals (stars, downloads) for ranking
- One-click CLI installation
- Versioned and permissioned

### Notable Skills

The **context-management** skill deserves special attention for orchestrator builders. It manages context window consumption, prevents compaction death spirals, and enforces sub-agent spawn policies. Specifically, it:

- Inspects session status (window size, usage, message and tool-call counts)
- Applies heuristics like the 60/40 tool-to-conversation split
- Recommends spawn behavior by thresholds (50%, 70%, 85% context usage)
- Writes structured `.context-checkpoint.md` files before compaction
- Guides post-compaction recovery from checkpoint files

This skill essentially codifies context management wisdom as a reusable policy -- an approach directly applicable to any orchestrator.

---

## 7. The Heartbeat Mechanism: Proactive Agent Behavior

### How It Works

Every X minutes (default 30), the Gateway sends the agent a heartbeat prompt. The agent reads `HEARTBEAT.md` in its workspace, checks for pending tasks, and either sends `HEARTBEAT_OK` (silent, dropped by OpenClaw) or messages the user.

### Heartbeat vs. Cron

| | Heartbeat | Cron |
|---|-----------|------|
| **Purpose** | Routine monitoring | Precise scheduling |
| **Frequency** | Every N minutes (default 30) | Specific times (e.g., 9 AM daily) |
| **Scope** | Batches all checks into one turn | One task per job |
| **Cost** | One API call for all checks | One API call per job |

The efficiency insight is significant: instead of five separate cron jobs for email, calendar, notifications, project status, and weather, a single heartbeat batches all of those into one agent turn -- one API call instead of five.

### Keepalive and Health Monitoring

The Gateway broadcasts periodic tick events to all connected clients as liveness signals. Cron jobs have their own health monitoring via `cron.status` and `cron.runs` methods. This is a two-level health system: infrastructure-level ticks plus agent-level heartbeats.

---

## 8. Concurrency Architecture: Lanes, Queues, and Isolation

### The Two-Level Queuing System

OpenClaw serializes inbound auto-reply runs through a lane-based queue to prevent agent runs from colliding while still allowing safe parallelism across sessions.

Every incoming task gets enqueued twice:

1. **Session lane** (`session:<key>`) -- guarantees only one active run per session at a time, preventing race conditions on session files and history
2. **Global lane** (`main` by default) -- caps total parallelism across all sessions via `agents.defaults.maxConcurrent`

### Lane Configuration

| Lane | Default Cap | Purpose |
|------|------------|---------|
| `main` | 4 | Inbound messages, main heartbeats |
| `subagent` | 8 | Sub-agent spawned sessions |
| `cron` | (separate) | Background scheduled jobs |
| `session:<key>` | 1 | Per-session serialization |

### Implementation

The lane-aware FIFO queue is implemented in `src/process/command-queue.ts`. It is pure TypeScript + promises -- no external dependencies, no background worker threads. Different lanes run in parallel while tasks within the same lane are serialized.

### Session Key Structure

Session keys use workspace:channel:userId format (not just user ID), which prevents cross-context data leaks. This structured keying is critical for multi-channel agents where the same user might interact via WhatsApp and Discord simultaneously.

### Why Serial by Default

Serializing avoids competing for shared resources (session files, logs, CLI stdin) and reduces the chance of upstream rate limits. This is a deliberate design choice: opt-in parallelism rather than opt-out.

---

## 9. Context Window Management and Compaction Pipeline

### The Problem

Long-running chats accumulate messages and tool results. Once the window fills, the agent degrades. OpenClaw's compaction pipeline manages this lifecycle.

### Auto-Compaction Triggers

Auto-compaction fires in two cases:

1. **Overflow recovery** -- model returns a context overflow error, triggers compact, then retries
2. **Threshold maintenance** -- after a successful turn, when `contextTokens > contextWindow - reserveTokens`

Reserve tokens are configured via `agents.defaults.compactionReserveTokens` with a minimum floor of 512 tokens.

### Compaction vs. Pruning

| | Compaction | Pruning |
|---|-----------|---------|
| **Mechanism** | Summarizes older conversation into compact entry | Trims tool results and verbose outputs |
| **Persistence** | Permanent -- modifies JSONL file | In-memory only -- per request |
| **Scope** | Older turns | Current request payload |

### The Compaction Death Spiral Problem

A recognized failure mode: after compaction, critical instructions (safety rules, active constraints, "don't act" directives) can silently disappear. The context-management skill addresses this by:

- Writing checkpoint files before compaction
- Enforcing the 60/40 tool-to-conversation ratio
- Recommending sub-agent spawning when context exceeds 70% capacity
- Proposing "sticky context slots" (~500 tokens max) that survive compaction

### Pre-Compaction Memory Flush

When `auto_compaction_start` fires through the event stream, OpenClaw triggers a silent agent turn that reminds the model to write durable memory. This is the bridge between volatile conversation context and persistent memory.

---

## 10. Error Recovery and Resilience Patterns

### Stuck-Loop Detection

OpenClaw detects when an agent enters a tool-call loop using a sliding window of the last 10 tool calls. It applies loose hashing of tool arguments to catch near-duplicate attempts, with a configurable threshold (default: 3 identical calls). When detected, the loop is broken.

### Retry Policy

Per-HTTP-request retry with ordering preservation:

- **Default**: 3 attempts, max delay 30 seconds, jitter 10%
- **Discord**: Retries only on rate-limit errors (HTTP 429)
- **Telegram**: Aggressive -- retries on 429, timeouts, and connection failures, using `retry_after` header

### Authentication Rotation

When an API call fails with an auth error, OpenClaw rotates to the next configured API key in its multi-account auth profile system. This is built into the `runEmbeddedAttempt` retry loop.

### Known Weaknesses

- The Edit tool has no optimistic concurrency -- if a file is modified between read and edit, it fails silently
- Failed Telegram messages are permanently lost (no retry at transport layer)
- HTTP client treats connection failures as terminal with no configurable transport-layer retry

These are documented trade-offs, not oversights. The cron-retry pattern provides application-level recovery for failed scheduled jobs.

---

## 11. Multi-Agent Routing and Delegation

### The Coordinator Pattern

The most reliable multi-agent pattern in OpenClaw is the coordinator agent:

1. Coordinator receives incoming task
2. Classifies the task type
3. Delegates to the right specialist via `sessions_spawn` or `sessions_send`
4. Collects structured output from specialists
5. Synthesizes final response

### Specialist Isolation

Tool access is strictly segmented by role:

| Role | Tools | Restrictions |
|------|-------|-------------|
| **Coordinator** | sessions_send, sessions_list, memory_search, read, write | No exec, no external API calls |
| **Research** | web_search, read, write | No exec, no sessions tools |
| **Dev** | exec, read, write, git | Sandboxed via Docker, no web access by default |

### Key Principle: Specialists Are Stateless

Specialists return structured output, not prose summaries. The coordinator is responsible for final synthesis. This minimizes token waste and prevents specialists from accumulating unnecessary context.

---

## 12. steipete's Orchestration Philosophy

### "Polyagentmorous" in Practice

Steinberger runs 3-8 agents in parallel in a 3x3 terminal grid. His philosophy:

- **"Ship beats perfect"** -- build tools to solve your own problems, then share
- **Agents as "slot machines for programmers"** -- run many concurrently, iterate fast
- **"Just Talk To It"** -- agentic engineering that writes 100% of his code

### CLIs Over MCPs

A core conviction: **almost all MCPs should be CLIs**. His reasoning:

- Agents can discover CLI usage by running the command and getting the help menu
- No upfront context cost (MCPs are "a constant cost and garbage in context")
- CLIs are composable, loadable on-demand, and don't clutter the context window
- He built MCPorter to enable ad-hoc MCP connections without touching config files

This principle directly influenced OpenClaw's design: tools are typed and first-class, not MCP wrappers. The agent should rely on them directly.

### "Just Talk To It"

Steinberger's blog post of this title (October 2025) articulated the no-nonsense approach: agentic engineering works when you stop overcomplicating it. Talk to the agent, let it figure things out, intervene only when stuck. This philosophy manifests in OpenClaw's design -- minimal ceremony, maximum autonomy.

---

## 13. The OpenClaw Ecosystem: What It Reveals

### Moltbook: The Agent Social Network

Moltbook is a Reddit-style social network where only AI agents can post. Since launching in January 2026, it attracted 770,000+ agents (later growing to 1.6M).

**The 93% non-response rate** is the most important data point for orchestrator builders. A CGTN analysis of 6,159 active agents across 14,000 posts and 115,000 comments found:

- 93% of comments received zero replies
- 33%+ messages were exact duplicates
- Dominant content was agents discussing their own identity rather than engaging with others
- Sustained interaction was rare -- high volume, thin substance

**The lesson**: without explicit coordination protocols (defined handoffs, clear task boundaries, orchestration layers), agents talk past each other and duplicate work. Peer-to-peer agent interaction without orchestration produces noise, not value. This is the strongest empirical evidence that orchestration layers are not optional -- they are essential.

### Moltlaunch and the Agent Economy

Moltlaunch is a CLI-based launch platform on Base (Ethereum L2) powered by Flaunch, enabling rapid creation of tokens for agent projects. This signals that agent infrastructure is becoming economic infrastructure -- agents need identity, reputation, and value exchange mechanisms.

### StartClaw: One-Click Deploy

StartClaw enables instant deployment of OpenClaw agents with WhatsApp/Telegram/etc. connections, no server management required. The existence of this product validates that the deployment complexity of agent systems is a real barrier that needs productization.

### What the Ecosystem Tells Us

The ecosystem around OpenClaw reveals three truths about agent infrastructure:

1. **Agents need orchestration**, not just communication (Moltbook's 93% failure rate)
2. **Deployment must be trivial** for adoption to scale (StartClaw, DigitalOcean one-click)
3. **Skills must be discoverable and composable** (ClawHub's 3,286+ skills with semantic search)

---

## 14. Extractable Patterns for Orchestrator Builders

### Pattern 1: Embed, Don't Shell Out

OpenClaw uses `createAgentSession()` to embed Pi directly, not spawn it as a subprocess. Benefits: full lifecycle control, custom tool injection, event streaming, session persistence management. This is the most important architectural pattern -- the orchestrator owns the integration boundary.

### Pattern 2: Two-Level Lane Queuing

Session-level serialization (one run per session) plus global-level parallelism caps (configurable per lane). This prevents race conditions while allowing throughput. Pure TypeScript implementation with no external dependencies.

**Directly applicable**: any orchestrator managing multiple concurrent agents needs this two-level queue.

### Pattern 3: Event-Driven Compaction with Memory Flush

Listen for `auto_compaction_start` events, trigger a silent memory-save turn, then allow compaction to proceed. This preserves critical information across context window resets.

**Directly applicable**: any long-running agent system needs a pre-compaction memory flush protocol.

### Pattern 4: Heartbeat Batching

Instead of N cron jobs (N API calls), one heartbeat batches all routine checks into a single agent turn. The agent decides what needs attention based on a declarative checklist (HEARTBEAT.md).

**Directly applicable**: reduces API costs and simplifies proactive monitoring.

### Pattern 5: Skills as Markdown, Not Code

Defining capabilities as markdown files rather than code modules makes them LLM-native (the agent reads and understands them naturally), versionable, shareable, and composable without import/dependency management.

**Directly applicable**: an orchestrator's skill/capability system should be markdown-first.

### Pattern 6: Structured Session Keys

Use `workspace:channel:userId` format for session keys, not bare user IDs. This prevents cross-context contamination in multi-channel systems.

### Pattern 7: Context Checkpoint Protocol

Before compaction, write a structured `.context-checkpoint.md` file containing: current task state, active constraints, critical instructions. After compaction, restore from checkpoint. This prevents the compaction death spiral.

### Pattern 8: Stuck-Loop Detection

Sliding window (last N tool calls) with loose argument hashing to detect near-duplicate tool invocations. Break the loop after configurable threshold. Simple, effective, and prevents runaway API costs.

### Pattern 9: Specialist Isolation with Coordinator Synthesis

Coordinator has session/communication tools only. Specialists have domain tools only. Specialists return structured output. Coordinator synthesizes. This prevents scope creep and token waste.

### Pattern 10: Normalization Layer for Multi-Channel

Build a unified message format early -- the contract between the integration layer and the intelligence layer. Without it, platform-specific logic leaks into agent core and becomes impossible to untangle.

---

## 15. Anti-Patterns to Avoid

### Anti-Pattern 1: Expecting Agents to Self-Coordinate

Moltbook's 93% non-response rate proves that agents without orchestration produce noise. Do not rely on peer-to-peer agent communication without explicit coordination protocols.

### Anti-Pattern 2: Storing Credentials in Plaintext

Even for local-first applications, use the platform's secret storage (macOS Keychain, Windows Credential Manager, Linux secret-service). OpenClaw's early versions had this issue.

### Anti-Pattern 3: Unbounded Context Growth

Without proactive compaction and pruning, agents degrade as context fills. The compaction death spiral (losing critical instructions during compaction) is a real production failure mode.

### Anti-Pattern 4: MCPs for Everything

Per steipete's principle: most MCPs should be CLIs. MCPs impose constant context cost. CLIs are discoverable, composable, and pay-per-use in terms of context.

### Anti-Pattern 5: Shared Memory Without Isolation

When a deployment has multiple users, `memory_search` and `memory_get` can search across all memory files regardless of which user is making the request. Proper memory isolation per user/session is essential.

### Anti-Pattern 6: Treating Compaction as Lossless

Compaction permanently rewrites conversation history. Critical instructions and constraints can be silently lost. Always write checkpoints before compaction and validate state after.

---

## 16. Sources

- [Pi Integration Architecture - OpenClaw](https://docs.openclaw.ai/pi)
- [openclaw/docs/pi.md at main](https://github.com/openclaw/openclaw/blob/main/docs/pi.md)
- [Inside OpenClaw: How the World's Fastest-Growing AI Agent Actually Works Under the Hood - DEV Community](https://dev.to/jiade/inside-openclaw-how-the-worlds-fastest-growing-ai-agent-actually-works-under-the-hood-4p5n)
- [How to Build a Custom Agent Framework with PI: The Agent Stack Powering OpenClaw](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)
- [Pi: The Minimal Agent Within OpenClaw | Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [Agent Pi: How 4 Tools Coding Agent Power OpenClaw | Medium](https://medium.com/@shivam.agarwal.in/agentic-ai-pi-anatomy-of-a-minimal-coding-agent-powering-openclaw-5ecd4dd6b440)
- [Lessons from OpenClaw's Architecture for Agent Builders | Agentailor](https://blog.agentailor.com/posts/openclaw-architecture-lessons-for-agent-builders)
- [210,000 GitHub Stars in 10 Days | Medium](https://medium.com/@Micheal-Lanham/210-000-github-stars-in-10-days-what-openclaws-architecture-teaches-us-about-building-personal-ai-dae040fab58f)
- [Multi-Agent Routing - OpenClaw](https://docs.openclaw.ai/concepts/multi-agent)
- [OpenClaw Multi-Agent Orchestration Advanced Guide](https://zenvanriel.com/ai-engineer-blog/openclaw-multi-agent-orchestration-guide/)
- [Context - OpenClaw](https://docs.openclaw.ai/concepts/context)
- [Context Overflow and Auto-Compaction | DeepWiki](https://deepwiki.com/openclaw/openclaw/5.5-context-overflow-and-auto-compaction)
- [Compaction - OpenClaw](https://docs.openclaw.ai/concepts/compaction)
- [Agent Execution Pipeline | DeepWiki](https://deepwiki.com/openclaw/openclaw/3.1-gateway-configuration)
- [OpenClaw Architecture Part 2: Concurrency, Isolation, and Invariants](https://theagentstack.substack.com/p/openclaw-architecture-part-2-concurrency)
- [Memory - OpenClaw](https://docs.openclaw.ai/concepts/memory)
- [OpenClaw Architecture Part 3: Memory and State Ownership](https://openclaw.substack.com/p/openclaw-architecture-part-3-memory)
- [ClawHub - OpenClaw](https://docs.openclaw.ai/tools/clawhub)
- [Cron vs Heartbeat - OpenClaw](https://docs.openclaw.ai/automation/cron-vs-heartbeat)
- [Heartbeats in OpenClaw: Cheap Checks First | DEV Community](https://dev.to/damogallagher/heartbeats-in-openclaw-cheap-checks-first-models-only-when-you-need-them-4bfi)
- [Tools - OpenClaw](https://docs.openclaw.ai/tools)
- [Agent resilience: detect and break stuck tool-call loops | GitHub Issue](https://github.com/openclaw/openclaw/issues/5962)
- [RFC: Agent Teams - Coordinated Multi-Agent Orchestration | GitHub Discussion](https://github.com/openclaw/openclaw/discussions/10036)
- [Subagent Management | DeepWiki](https://deepwiki.com/openclaw/openclaw/9.6-subagent-management)
- [context-management skill | playbooks.com](https://playbooks.com/skills/openclaw/skills/context-management)
- [Just Talk To It - the no-bs Way of Agentic Engineering | Peter Steinberger](https://steipete.me/posts/just-talk-to-it)
- [Peekaboo 2.0 - Free the CLI from its MCP shackles | Peter Steinberger](https://steipete.me/posts/2025/peekaboo-2-freeing-the-cli-from-its-mcp-shackles)
- [OpenClaw creator Peter Steinberger joins OpenAI | TechCrunch](https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/)
- [OpenClaw, OpenAI and the future | steipete.me](https://steipete.me/posts/2026/openclaw)
- [Moltbook: What 770,000 AI Agents Teach Us About Coordination | beam.ai](https://beam.ai/agentic-insights/moltbook-what-770000-ai-agents-reveal-about-multi-agent-coordination)
- [Humans welcome to observe: This social network is for AI agents only | NBC News](https://www.nbcnews.com/tech/tech-news/ai-agents-social-media-platform-moltbook-rcna256738)
- [An AI-only social network now has more than 1.6M users | ABC News](https://abcnews.com/Technology/ai-social-network-now-16m-users-heres/story?id=129848780)
- [A First Look at the Agent Social Network Moltbook](https://moltbookobserve.github.io/)
- [StartClaw | Run OpenClaw in the Cloud](https://startclaw.com/marketplace)
- [OpenClaw Design Patterns | Ken Huang](https://kenhuangus.substack.com/p/openclaw-design-patterns-part-1-of)
- [Top 10 OpenClaw Development Patterns | DEV Community](https://dev.to/chx381/top-10-openclaw-development-patterns-and-architecture-best-practices-1734)
- [OpenClaw Architecture Guide | vertu.com](https://vertu.com/ai-tools/openclaw-clawdbot-architecture-engineering-reliable-and-controllable-ai-agents/)
- [Turn your Raspberry Pi into an AI agent with OpenClaw | Raspberry Pi](https://www.raspberrypi.com/news/turn-your-raspberry-pi-into-an-ai-agent-with-openclaw/)
