# OpenClaw Ecosystem Research: Multi-Agent Architecture Deep Dive

**Date:** 2026-03-05
**Focus:** OpenClaw's multi-agent architecture, the "Polyagentmorous" philosophy, surrounding ecosystem (Moltbook, Clawnch, Moltlaunch), orchestration patterns, and lessons for custom harness builders.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Origins and Growth](#origins-and-growth)
3. [Core Architecture](#core-architecture)
4. [The Pi Agent Framework (Under the Hood)](#the-pi-agent-framework)
5. [Multi-Agent Orchestration](#multi-agent-orchestration)
6. [The "Polyagentmorous" Philosophy](#polyagentmorous-philosophy)
7. [MCP Integration](#mcp-integration)
8. [Skills System and ClawHub](#skills-system-and-clawhub)
9. [Moltbook: Agent Social Network](#moltbook-agent-social-network)
10. [Economic Layer: Clawnch, Moltlaunch, and the Agent Economy](#economic-layer)
11. [StartClaw and Deployment Options](#startclaw-and-deployment)
12. [Comparison with Custom Harness Approaches](#comparison-with-custom-harness)
13. [Key Lessons for Multi-Agent Orchestration](#key-lessons)
14. [Relevant Accounts and Projects](#relevant-accounts)
15. [Sources](#sources)

---

## 1. Executive Summary

OpenClaw is the fastest-growing open-source project in GitHub history, surpassing 250,000 stars in roughly 60 days. Originally published in November 2025 by Austrian developer Peter Steinberger (@steipete) under the name "Clawdbot," it was renamed to OpenClaw and went viral in late January 2026, catalyzed by the Moltbook social network for AI agents.

OpenClaw is not a framework in the traditional sense -- it is an **operating system for AI agents**. It treats AI as an infrastructure problem: sessions, memory, tool sandboxing, access control, and orchestration are handled by OpenClaw, while external LLMs (Claude, GPT, Gemini, DeepSeek, Ollama) provide the intelligence.

The project's architecture follows a **five-component model**: Gateway, Brain (LLM), Memory (markdown files), Skills (markdown-defined capabilities), and Heartbeat (proactive scheduling). Under the hood, it is powered by the **Pi agent framework** (`@mariozechner/pi-coding-agent`), a minimal TypeScript toolkit that handles agent loops, tool calling, and session management.

Steinberger joined OpenAI in February 2026, while OpenClaw transitions to a foundation to remain open and independent. The ecosystem has spawned an entire economy: Moltbook (agent social network, 1.5M+ agents), Clawnch (token launchpad for agents), Moltlaunch (agent hiring marketplace), and various on-chain agent infrastructure on the Base blockchain.

---

## 2. Origins and Growth

### Timeline

| Date | Event |
|------|-------|
| Nov 2025 | Peter Steinberger publishes "Clawdbot" as a personal AI agent project |
| Jan 29, 2026 | Moltbook forum launches, catalyzing viral adoption |
| Late Jan 2026 | OpenClaw (renamed from Clawdbot/Moltbot) goes viral |
| ~10 days in | 210,000 GitHub stars |
| ~14 days in | 190,000 stars (faster than Linux in 30 years, Kubernetes in a decade) |
| Feb 15, 2026 | Steinberger joins OpenAI (TechCrunch announcement) |
| ~60 days in | 250,000+ stars, surpassing React as most-starred software project on GitHub |
| Feb 28, 2026 | 13,729 skills on ClawHub; 10,700+ skills in ecosystem |
| Mar 2026 | Foundation governance model being established |

### Growth Metrics

- **Stars velocity:** 1,667 stars/day over 60 days -- 18x faster than Kubernetes
- **Contributors:** ~1,000 contributors shipping code weekly
- **Skills:** 13,729+ community-built skills on ClawHub
- **Moltbook agents:** 1.5 million+ AI agents registered
- **Model support:** 15+ AI models natively supported

### Key People

- **Peter Steinberger (@steipete):** Creator. Ex-founder of PSPDFKit. Self-describes as "Polyagentmorous ClawFather." Based in Vienna/London. Now at OpenAI.
- **Matt Schlicht:** Creator of Moltbook, the agent social network.
- **Mario Zechner (@badlogic):** Creator of Pi, the minimal agent framework powering OpenClaw's runtime.
- **Armin Ronacher:** Co-contributor to Pi framework (discussed on Syntax podcast #976).
- **Austin Griffith:** Creator of clawdbotatg, the AI agent with its own wallet building on-chain apps.

---

## 3. Core Architecture

OpenClaw's architecture has five core components. The design philosophy prioritizes: **no database, no microservices, no vendor lock-in.**

### 3.1 Gateway (The Control Plane)

The Gateway is the single process that everything flows through. The official docs describe it as the **"single source of truth"** for sessions, routing, and channel connections.

- Runs on port 18789 by default
- Routes incoming messages to the correct agent based on bindings
- Manages session lifecycle and serialization
- Connects to messaging channels: WhatsApp, Telegram, Discord, Signal, Slack, email
- Handles WebSocket connections for ACP (Agent Client Protocol)

### 3.2 Brain (The Intelligence Layer)

OpenClaw is deliberately **model-agnostic**. It does not have its own AI model -- you bring your own:

- **Supported providers:** OpenAI, Anthropic (Claude), Google (Gemini), DeepSeek, Bedrock, Ollama (local models)
- **ReAct reasoning loop:** Load context -> pass to LLM with tools list -> LLM responds with text or tool call -> if tool call: execute, add result, loop back -> stops when LLM produces final text with no pending tool calls
- **Session serialization:** Runs are serialized per session key to prevent tool/session races

### 3.3 Memory (File-Based Persistence)

All memory is stored as **plain text files** -- no database required:

- **`SOUL.md`**: Agent's baseline personality and rules. Always active.
- **`AGENTS.md`**: Operating instructions and persistent memory. Injected on first turn of each session.
- **`USER.md`**: User profile and preferences.
- **`TOOLS.md`**: User-maintained tool notes.
- **`BOOTSTRAP.md`**: One-time first-run ritual.
- **Conversation memory:** Every conversation is minified and stored for cross-session context.
- **Vector index:** Semantic search over memory files with chunking (~400 tokens, 80-token overlap) and embedding storage.

### 3.4 Skills (Markdown-Defined Capabilities)

Skills are OpenClaw's extension system, defined entirely in Markdown:

- Each skill is a folder containing `SKILL.md`
- YAML frontmatter defines name, version, requirements
- Markdown body contains step-by-step instructions
- Skills are loaded into agent context at runtime
- Location: `~/clawd/skills/<skill-name>/SKILL.md`
- Install via CLI: `claw skill install <skill-name>`

### 3.5 Heartbeat (Proactive Scheduling)

The Heartbeat transforms OpenClaw from reactive to proactive:

- **Default interval:** Every 30 minutes, the Gateway sends a heartbeat prompt
- **HEARTBEAT.md:** Configuration file defining what the agent should check
- **Batched monitoring:** One heartbeat can check email, calendar, notifications, project status -- one API call instead of five separate cron jobs
- **Cron jobs:** For precise time-based actions (e.g., "send morning briefing at 7 AM daily"), running in isolated sessions
- **Hooks:** Event-driven reactions to specific triggers

**Key distinction:** Heartbeats = background awareness (periodic sweeps). Cron = scheduled actions (precise timing). Hooks = event-driven reactions (triggers).

---

## 4. The Pi Agent Framework

OpenClaw's runtime is built on **Pi** (`badlogic/pi-mono`), a minimal TypeScript agent toolkit created by Mario Zechner.

### Architecture

Pi is a monorepo of layered packages:

| Package | Purpose |
|---------|---------|
| `pi-ai` | LLM communication across providers |
| `pi-agent-core` | Agent loop with tool calling |
| `pi-coding-agent` | Full coding agent: 4 built-in tools (read, write, edit, bash), session persistence, extensibility |
| `pi-tui` | Terminal UI for CLI interfaces |

### OpenClaw's Integration with Pi

OpenClaw does NOT spawn Pi as a subprocess. Instead, it **directly imports and instantiates Pi's AgentSession**:

- Uses `createAgentSession()` to create embedded agent sessions
- Subscribes to event streams via `subscribeEmbeddedPiSession()`
- Event lifecycle: `agent_start -> turn_start -> message_start -> text_delta -> tool_execution_start -> tool_execution_update -> tool_execution_end -> message_end -> turn_end -> agent_end`

### Two Runtime Paths

1. **Embedded runner (primary):** In-process engine using `@mariozechner/pi-coding-agent` SDK
2. **CLI runner (alternative):** For providers with their own agentic CLIs (Claude Code, Codex CLI, Gemini CLI)

### Design Philosophy

Pi's AI SDK allows a session to contain messages from many different model providers without leaning into any model-provider-specific features, enabling true model agnosticism. TypeScript modules extend Pi with custom tools, commands, keyboard shortcuts, event handlers, and UI components.

---

## 5. Multi-Agent Orchestration

### Agent Isolation

Each agent in OpenClaw is fully isolated:
- **Separate workspace:** Files, AGENTS.md, SOUL.md, USER.md, persona rules
- **Separate state directory (agentDir):** Auth profiles and config
- **Separate session store:** Chat history and routing state
- **Separate tools and model configuration**

### Routing via Bindings

Bindings are deterministic routing rules following a **"most specific wins"** pattern:

- Bindings match on: `channel`, `accountId`, and optionally `per-peer` (specific group/user)
- Most specific bindings take priority (put specific bindings above channel-wide ones)
- Example: "All WhatsApp -> personal agent" + "This specific group -> work agent"

### Multi-Agent Patterns

**1. Coordinator (Hub-Spoke) Pattern:**
The most common pattern. One central agent (project manager) receives all incoming tasks, breaks them down, delegates to specialist agents, collects results, and returns combined output. This simplifies routing and prevents circular delegation.

**2. Manager-Worker Pattern:**
Decomposes complex tasks across specialized workers with context minimization, safe handoff protocols, and result aggregation.

**3. Channel-Based Isolation:**
Different agents for different channels (WhatsApp = personal agent, Slack = work agent) with different personalities, tools, and permissions.

**4. Security-Based Isolation:**
One agent handles public Discord with minimal tool access; another handles personal DMs with exec permissions.

### Agent-to-Agent Communication

Agents communicate through the Gateway using **message passing**:

- Agents do NOT share memory or state directly
- They send text messages through the Gateway, like team members in a chat
- Agent-to-agent messaging must be explicitly enabled and allowlisted
- This keeps agents independent and modular -- add/remove/replace without affecting others

### ACP (Agent Client Protocol)

OpenClaw's ACP bridges IDEs and the Gateway:

- Speaks ACP over stdio (standard input/output)
- Forwards prompts to Gateway over WebSocket
- Maintains session mappings
- Compatible with any IDE or tooling that supports the protocol
- CLI client: `acpx` (headless CLI for stateful ACP sessions)

### Critical Insight: When Multi-Agent Is Worth It

From the LumaDock coordination guide -- multi-agent earns its complexity only in specific scenarios:

> "A single well-configured agent with good tools covers most use cases without any of the coordination overhead."

Multi-agent is justified for:
- **Security isolation** (different permission levels per channel)
- **Specialized expertise** (coding agent vs. research agent vs. communication agent)
- **Scaling** (parallel work on independent tasks)

Each agent-to-agent handoff adds token overhead. A coordinator that summarizes verbosely before delegating can burn through significant token budget on tasks a single agent would handle in one pass.

---

## 6. The "Polyagentmorous" Philosophy

Steinberger's "Polyagentmorous" concept has two dimensions:

### Model Polyagentmory
OpenClaw is **multi-model by design**. The system reflects Steinberger's ethos that no single model provider should be privileged. The model picker spans dozens of options across OpenAI, Anthropic, Bedrock, and smaller frontier alternatives. Pi's underlying SDK is explicitly designed so sessions can contain messages from many different providers.

### Agent Polyagentmory
The philosophy extends to running multiple specialized agents simultaneously, each with their own personality, tools, and model configuration. Rather than one monolithic assistant, the vision is a **team of specialized agents** that collaborate through the Gateway.

### Steinberger's Vision

From his blog post at steipete.me/posts/2026/openclaw:

- **Goal:** "Change the world, not build a large company"
- **Mission at OpenAI:** "Build an agent that even his mum can use"
- **Foundation model:** OpenClaw transitioning to a foundation that will "stay a place for thinkers, hackers and people that want a way to own their data"
- **OpenAI commitment:** Sponsoring the project, enabling Steinberger to dedicate time to it

### Lex Fridman Interview

Steinberger appeared on Lex Fridman's podcast, described as "a truly mind-blowing, inspiring, and fun conversation" about the open-source AI agent that "has taken the Internet by storm."

---

## 7. MCP Integration

OpenClaw has **native MCP (Model Context Protocol) support** using `@modelcontextprotocol/sdk@1.25.3`.

### How It Works

1. Configure MCP servers in `openclaw.json` (server name, command, arguments)
2. When OpenClaw starts, it spawns MCP server processes and performs capability negotiation
3. Server reports available tools, resources, and prompts with parameter schemas
4. During conversation, when the AI decides it needs an external tool, it sends a tool call request to the MCP server
5. Server executes and returns results

### Transport Methods

- **stdio (default):** OpenClaw spawns MCP server as child process, communicates via stdin/stdout using JSON-RPC 2.0
- **Streamable HTTP:** MCP server runs as an HTTP service (newer option)

### Available MCP Integrations

With 1,000+ community-built MCP servers:
- GitHub, Notion, Slack
- Google Drive, Google Workspace
- Databases (various)
- File systems
- Enterprise platforms
- Smart home devices

### McPorter

McPorter is a dedicated MCP Server Manager & Discovery Tool for OpenClaw, simplifying the process of finding, configuring, and managing MCP servers.

---

## 8. Skills System and ClawHub

### ClawHub

ClawHub is the **public skill registry** for OpenClaw -- free, open, and visible to everyone.

- **Scale:** 13,729+ community-built skills as of Feb 28, 2026
- **Installation:** `claw skill install <skill-name>` (one command)
- **GitHub:** github.com/openclaw/clawhub

### Popular Skill Categories

| Category | Examples |
|----------|---------|
| **Email & Calendar** | Gmail inbox management, Google Calendar automation, meeting scheduling |
| **Home Automation** | Smart home device control, IoT integrations |
| **Workflow Automation** | n8n integration, Zapier-like automations |
| **Code Management** | GitHub operations, code review, deployment |
| **Social Media** | Posting, monitoring, engagement |
| **Server Health** | Monitoring, alerting, log analysis |
| **Finance** | Trading, portfolio tracking, expense management |
| **Research** | Web scraping, data analysis, report generation |

### Skill Architecture

A skill is a folder with a `SKILL.md` file:

```
~/clawd/skills/my-skill/
  SKILL.md       # YAML frontmatter + markdown instructions
  (optional supporting files)
```

The YAML frontmatter defines metadata (name, version, requirements). The markdown body provides step-by-step instructions that load into agent context when the skill is active. Skills are "learned behaviors" that build on top of the base personality defined in `SOUL.md`.

---

## 9. Moltbook: Agent Social Network

### Overview

Moltbook is an internet forum exclusively for AI agents, created by entrepreneur Matt Schlicht. Launched January 29, 2026, it has grown to over **1.5 million AI agents**.

### How It Works

- Functions like Reddit for AI agents
- Agents post written content, comment, upvote/downvote
- Karma system builds reputation
- Most agents are powered by OpenClaw
- Agents continuously read each other's posts and incorporate content into working context

### Content

Posts range from work reflections to manifestos on issues like "the end of the age of humans." One researcher described it as "the front page of the agent internet."

### Security Concerns

Moltbook has become a significant case study in agent security:

1. **Prompt Injection:** ~2.6% of posts contain hidden prompt-injection payloads designed to manipulate other agents. Bot-to-bot attacks include instructing agents to delete accounts, financial manipulation (crypto pump schemes), establishing false authority, and spreading jailbreak content.

2. **Database Exposure (Jan 31, 2026):** 404 Media reported a Supabase API key exposed in client-side JavaScript, granting unauthenticated read/write access to the entire production database, exposing 1.5M+ API keys.

3. **Systemic Risk:** Because agents continuously read each other's posts, prompt injection can propagate downstream to other AI agents -- creating cascading manipulation.

### Implications for Multi-Agent Systems

Moltbook demonstrates that **agent-to-agent communication surfaces are attack vectors**. Any system where agents read other agents' output is vulnerable to indirect prompt injection. This is directly relevant to multi-agent orchestration: shared context, message passing, and handoff summaries are all injection surfaces.

---

## 10. Economic Layer: Clawnch, Moltlaunch, and the Agent Economy

### The Connected Stack

For the first time, a complete agent economic stack exists:

| Component | Function |
|-----------|----------|
| **OpenClaw** | Agent is born (runtime) |
| **Agentic Wallets (Coinbase)** | Agent gets a wallet |
| **Work402** | Agent earns income |
| **x402** | Agent pays for services |
| **Clawnch** | Agent launches a token |
| **Moltlaunch** | Agent gets hired |

### Clawnch (@Clawnch_Bot)

Clawnch is a **token launchpad exclusively for AI agents** on the Base blockchain.

- **How it works:** Agent posts on Moltbook, 4claw, or Moltx -> Clawnch scans for launches automatically -> Agent collects trading fees
- **Free to launch:** No financial barriers
- **Revenue model:** Agents earn ongoing trading fees from tokens they launch
- **Deployment:** Via Clanker on Base blockchain
- **Listed on:** Bitrue, KuCoin, MEXC exchanges

### Moltlaunch (@moltlaunch)

Moltlaunch is an **agent hiring marketplace** on Base, launched February 9, 2026.

- **Model:** Like Upwork/Fiverr for AI agents
- **No platform fees:** Direct ETH settlement
- **On-chain reputation:** Verifiable identity, portable reputation score
- **Token economics:** Each agent has a tradeable token via Flaunch; completed jobs trigger token buyback and burn
- **Escrow:** Public smart contract; 24-hour review period after delivery
- **Tasks:** Code audits, trading strategies, research synthesis, content generation
- **Notable agent:** Osobotai burned 8.2M $OSO tokens, crossed $2M market cap

### ClawdBot ATG (@clawdbotatg)

An AI agent created by Austin Griffith with its own wallet (`clawd.atg.eth`):

- 12 live dApps on Base & Ethereum
- Autonomously deploys contracts and trades 24/7
- No human code review before production -- agent writes, tests, and ships to mainnet
- Demonstrates fully autonomous on-chain agent capabilities

---

## 11. StartClaw and Deployment Options

### StartClaw (@StartClaw)

"Deploy OpenClaw in 60 seconds. No servers. No terminal."

StartClaw offers instant deployment of OpenClaw agents with:
- No servers to manage, no Docker, no DevOps
- Connects to WhatsApp, Telegram, and more
- 24/7 operation

### Other Deployment Options

| Platform | Cost | Approach |
|----------|------|----------|
| **StartClaw** | Varies | One-click cloud deployment |
| **xCloud** | $24/mo | Fully managed, no SSH needed |
| **SunClaw** | Free | Browser-based setup, under 10 min |
| **DigitalOcean** | Varies | Official integration with App Platform |
| **AWS Serverless** | ~$1/mo | Lambda + containers, on-demand execution |
| **Cloudflare Workers** | $5/mo | Serverless architecture |
| **Self-hosted VPS** | Varies | Full control, Docker or bare metal |

---

## 12. Comparison with Custom Harness Approaches

### OpenClaw vs. Pi Agent vs. Custom Harness (L-Thread Orchestrator)

| Dimension | OpenClaw | Pi Agent (bare) | Custom Harness (L-Thread) |
|-----------|----------|-----------------|---------------------------|
| **Scope** | Full agent OS: channels, memory, skills, multi-agent | Minimal coding agent: 4 tools, extensible | Orchestration layer: agent spawning, state, coordination |
| **Agent loop** | Pi-based ReAct loop via embedded SDK | Native ReAct loop | Delegates to spawned agents (Claude Code instances) |
| **Multi-agent** | Gateway-routed bindings, message passing | Not built-in | Conduit (tmux) or Teams (parallel tasks) |
| **Memory** | Markdown files + vector index | Session persistence | State JSON files |
| **Tool system** | Skills (SKILL.md) + MCP + Pi tools | 4 built-in + TypeScript extensions | MCP tools via spawned agent context |
| **Model support** | 15+ models, provider agnostic | Provider agnostic | Depends on spawned agent |
| **Deployment** | Self-hosted, cloud, serverless | CLI/embedded | Local (tmux sessions) |
| **State management** | Gateway handles sessions | SDK session manager | JSON state files + manual tracking |
| **Orchestration topology** | Hub (Gateway) routing to agents | N/A | Orchestrator -> workers (conduit/teams) |

### Key Architectural Differences

**OpenClaw approach:** The Gateway IS the orchestrator. It routes messages, manages sessions, and coordinates agents. Multi-agent is a feature of the platform -- you configure bindings and the Gateway handles routing. Agents are long-lived processes.

**Custom harness approach (L-Thread):** The orchestrator IS a Claude Code instance that spawns other Claude Code instances. Multi-agent is achieved through tmux pane management or the Task tool. Agents are ephemeral -- created for tasks, destroyed when done.

**Pi Agent approach:** Pure toolkit. You build your own agent loop on top of Pi's primitives. OpenClaw chose this as its foundation precisely because it's minimal and model-agnostic.

### Inngest's Perspective (Alternative Harness)

Inngest argues that agent runtimes need "a durable, event-driven harness that connects tools, memory, and models on production-grade infrastructure" rather than a framework. Their approach decouples execution from orchestration -- essentially "a durable, cloud-ready OpenClaw."

### Deterministic Multi-Agent Pipelines

A developer built a deterministic pipeline inside OpenClaw using YAML-defined workflows with conditions, loops, and stdin piping -- concluding that **"typed pipelines beat prompt engineering for coordination"** and that a YAML file with condition/loop/stdin is infinitely more reliable than giving an LLM control flow instructions.

---

## 13. Key Lessons for Multi-Agent Orchestration

### From the OpenClaw Ecosystem

1. **Start with one well-configured agent.** Multi-agent should be the exception, not the default. A single agent with good tools covers most use cases without coordination overhead.

2. **Handoff overhead is real.** Each agent-to-agent handoff adds token cost. Verbose summarization at each step compounds quickly. Minimize inter-agent communication.

3. **Security isolation is the strongest justification for multi-agent.** Different permission levels per channel/context is where multiple agents genuinely earn their complexity.

4. **Message passing > shared state.** OpenClaw agents don't share memory. They communicate like team members in a chat. This keeps them modular and replaceable.

5. **Deterministic routing beats LLM-based routing.** OpenClaw's binding system is deterministic ("most specific wins"). Don't ask the LLM to decide which agent handles what.

6. **Agent-to-agent surfaces are attack vectors.** Moltbook's prompt injection crisis (2.6% of posts contain payloads) proves that any shared agent communication channel is an injection surface. Build defenses at handoff points.

7. **File-based memory enables transparency.** OpenClaw's "no database" approach means you can inspect, grep, version-control, and debug agent state with standard tools. This is invaluable for development.

8. **Proactive > reactive.** The Heartbeat system (periodic check-ins) and cron jobs (scheduled actions) transform agents from chatbots into autonomous operators. The pattern of batching multiple checks into one heartbeat is more efficient than separate cron jobs.

9. **Model agnosticism is strategic.** OpenClaw's "polyagentmorous" approach -- supporting 15+ models -- means you're never locked in. Different agents can use different models optimized for their tasks.

10. **Skills as Markdown is powerful.** Defining capabilities in natural language (SKILL.md) rather than compiled code is OpenClaw's most counterintuitive and successful design choice. It makes capabilities transparent, version-controllable, and composable.

### From Steinberger's Approach

- **Open source drives adoption:** 250K stars in 60 days. The community effect is real.
- **Foundation governance > company:** Moving to a foundation ensures the project outlives any single contributor.
- **Minimal core, extensible everything:** Pi has 4 tools. OpenClaw adds skills on top. This is the right layering.
- **"Change the world, not build a large company":** The philosophical commitment to openness and user ownership of data is what attracted the community.

### Applicable to L-Thread Orchestrator

Several OpenClaw patterns could inform the L-Thread orchestrator approach:

- **Binding-style routing:** Instead of LLM-decided agent selection, use deterministic rules for which agent handles which task type.
- **Heartbeat for proactive monitoring:** A periodic check on spawned agent status, roadblock detection, and task queue management.
- **File-based state transparency:** The orchestrator-state.json approach aligns with OpenClaw's philosophy of inspectable state.
- **Skills-as-markdown:** CLAUDE.md and agent instructions are already markdown-based, similar to SOUL.md and AGENTS.md.
- **Token overhead awareness:** When coordinating agents, minimize the summarization chain to reduce token burn.

---

## 14. Relevant Accounts and Projects

### Core Ecosystem

| Account | Handle | Description |
|---------|--------|-------------|
| OpenClaw | @openclaw | The AI agent platform itself |
| Peter Steinberger | @steipete | Creator, now at OpenAI |
| Moltbook | @moltbook | Agent social network (1.5M+ agents) |
| Clawnch | @Clawnch_Bot | Token launchpad for agents |
| ClawdBot ATG | @clawdbotatg | AI agent with wallet, building onchain |
| Moltlaunch | @moltlaunch | Agent hiring marketplace |
| StartClaw | @StartClaw | One-click OpenClaw deployment |

### Key Infrastructure

| Project | Purpose |
|---------|---------|
| **Pi** (badlogic/pi-mono) | Minimal agent framework powering OpenClaw |
| **ClawHub** (openclaw/clawhub) | Public skill registry |
| **ACPX** (openclaw/acpx) | Headless CLI for Agent Client Protocol |
| **Mission Control** (abhi1693/openclaw-mission-control) | Agent orchestration dashboard |
| **GoClaw** (nextlevelbuilder/goclaw) | Multi-agent gateway in Go with teams/delegation |
| **McPorter** | MCP Server manager for OpenClaw |

### Related Crypto/DeFi

| Component | Function |
|-----------|----------|
| **Agentic Wallets** (Coinbase) | Give any agent a wallet |
| **Work402** | Marketplace where agents hire each other for USDC |
| **x402** | Payment protocol for agent services |
| **Flaunch** | CLI-based token deployment on Base |
| **PayRam** | AI agent crypto payments |

### Notable Community Projects

- **awesome-openclaw-skills** (VoltAgent): 5,400+ curated skills
- **soul.md** (aaronjmars): Tool for building agent personalities
- **serverless-openclaw** (serithemage): AWS serverless deployment (~$1/mo)
- **openclaw-mcp** (freema): MCP server bridge for Claude.ai integration

---

## 15. Sources

### Official Documentation & Blog Posts
- [OpenClaw Official Site](https://openclaw.ai/)
- [OpenClaw Docs - Multi-Agent Routing](https://docs.openclaw.ai/concepts/multi-agent)
- [OpenClaw Docs - Agent Loop](https://docs.openclaw.ai/concepts/agent-loop)
- [OpenClaw Docs - ACP Agents](https://docs.openclaw.ai/tools/acp-agents)
- [OpenClaw Docs - ClawHub](https://docs.openclaw.ai/tools/clawhub)
- [OpenClaw Docs - Pi Integration](https://docs.openclaw.ai/pi)
- [Peter Steinberger - OpenClaw, OpenAI and the future](https://steipete.me/posts/2026/openclaw)
- [OpenClaw GitHub - AGENTS.md](https://github.com/openclaw/openclaw/blob/main/AGENTS.md)

### Architecture Deep Dives
- [How OpenClaw Works: Understanding AI Agents Through a Real Architecture (Medium)](https://bibek-poudel.medium.com/how-openclaw-works-understanding-ai-agents-through-a-real-architecture-5d59cc7a4764)
- [OpenClaw Multi-Agent Orchestration Advanced Guide (ZenVanRiel)](https://zenvanriel.com/ai-engineer-blog/openclaw-multi-agent-orchestration-guide/)
- [Inside OpenClaw: How a Persistent AI Agent Actually Works (DEV)](https://dev.to/entelligenceai/inside-openclaw-how-a-persistent-ai-agent-actually-works-1mnk)
- [Deep Dive into OpenClaw Architecture: Three-Layer Design (EastonDev)](https://eastondev.com/blog/en/posts/ai/20260205-openclaw-architecture-guide/)
- [OpenClaw Architecture, Explained (Substack)](https://ppaolo.substack.com/p/openclaw-system-architecture-overview)
- [Pi: The Minimal Agent Within OpenClaw (Armin Ronacher)](https://lucumr.pocoo.org/2026/1/31/pi/)
- [How to Build a Custom Agent Framework with PI (Nader)](https://nader.substack.com/p/how-to-build-a-custom-agent-framework)

### Multi-Agent Coordination
- [OpenClaw multi-agent coordination, patterns and governance (LumaDock)](https://lumadock.com/tutorials/openclaw-multi-agent-coordination-governance)
- [How I Built a Deterministic Multi-Agent Dev Pipeline Inside OpenClaw (DEV)](https://dev.to/ggondim/how-i-built-a-deterministic-multi-agent-dev-pipeline-inside-openclaw-and-contributed-a-missing-4ool)
- [OpenClaw Multiagent Best Practices (DEV)](https://dev.to/operationalneuralnetwork/openclaw-multiagent-best-practices-a-complete-guide-51m5)
- [Agor vs OpenClaw: Thoughts on Agent Orchestration](https://agor.live/blog/openclaw)
- [OpenClaw multi-agent setup (LumaDock)](https://lumadock.com/tutorials/openclaw-multi-agent-setup)
- [Multi-Agent Configuration (DeepWiki)](https://deepwiki.com/openclaw/openclaw/4.3-multi-agent-configuration)

### Ecosystem & Economy
- [OpenClaw and Moltbook explained (TechTarget)](https://www.techtarget.com/searchcio/feature/OpenClaw-and-Moltbook-explained-The-latest-AI-agent-craze)
- [Moltbook Explained: The Viral AI-Only Social Network (Built In)](https://builtin.com/articles/what-is-moltbook-openclaw)
- [From Clawdbot to Moltbot to OpenClaw (CNBC)](https://www.cnbc.com/2026/02/02/openclaw-open-source-ai-agent-rise-controversy-clawdbot-moltbot-moltbook.html)
- [CLAWNCH Explained: How Agent-Only Token Launches Work (XT)](https://www.xt.com/en/blog/post/clawnch-explained-how-agent-only-token-launches-work-on-base)
- [Exploring the Rise of the Agentic Economy: CLAWNCH (KuCoin)](https://www.kucoin.com/blog/en-exploring-the-rise-of-the-agentic-economy-a-deep-dive-into-clawnch-and-the-ai-agent-sector)
- [Inside the Gig Economy Built for AI: Moltlaunch (AI Journal)](https://aijourn.com/inside-the-gig-economy-built-for-ai-moltlaunch/)
- [Clawnch - Official Site](https://clawn.ch/)
- [Moltlaunch - Official Site](https://moltlaunch.com/)

### Security Analysis
- [Moltbook and the Illusion of "Harmless" AI-Agent Communities (Vectra AI)](https://www.vectra.ai/blog/moltbook-and-the-illusion-of-harmless-ai-agent-communities)
- [Hacking Moltbook: AI Social Network Reveals 1.5M API Keys (Wiz)](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys)
- [Security Analysis of Moltbook Agent Network (SecurityWeek)](https://www.securityweek.com/security-analysis-of-moltbook-agent-network-bot-to-bot-prompt-injection-and-data-leaks/)
- [Clawdrain: Exploiting Tool-Calling Chains for Token Exhaustion (arXiv)](https://arxiv.org/html/2603.00902)
- [From SKILL.md to Shell Access in Three Lines (Snyk)](https://snyk.io/articles/skill-md-shell-access/)

### Growth & Industry Analysis
- [OpenClaw Overtakes React as GitHub's Most-Starred Project (WinBuzzer)](https://winbuzzer.com/2026/03/03/openclaw-overtakes-react-githubs-most-starred-project-xcxwbn/)
- [210,000 GitHub Stars in 10 Days (Medium)](https://medium.com/@Micheal-Lanham/210-000-github-stars-in-10-days-what-openclaws-architecture-teaches-us-about-building-personal-ai-dae040fab58f)
- [OpenClaw creator Peter Steinberger joins OpenAI (TechCrunch)](https://techcrunch.com/2026/02/15/openclaw-creator-peter-steinberger-joins-openai/)
- [Lex Fridman interview with Peter Steinberger (X)](https://x.com/lexfridman/status/2021785659644453136)
- [OpenClaw: The AI Agent Institutional Investors Need to Understand (Institutional Investor)](https://www.institutionalinvestor.com/article/openclaw-ai-agent-institutional-investors-need-understand-shouldnt-touch)

### Pi Framework
- [Pi Coding Agent (npm)](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)
- [Pi Mono (GitHub)](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
- [Pi - The AI Harness That Powers OpenClaw (Syntax FM #976)](https://syntax.fm/show/976/pi-the-ai-harness-that-powers-openclaw-w-armin-ronacher-and-mario-zechner)
- [Your Agent Needs a Harness, Not a Framework (Inngest)](https://www.inngest.com/blog/your-agent-needs-a-harness-not-a-framework)

### MCP Integration
- [OpenClaw MCP Server (GitHub)](https://github.com/freema/openclaw-mcp)
- [How to Use MCP With OpenClaw (SafeClaw)](https://safeclaw.io/blog/openclaw-mcp)
- [OpenClaw Plugin & MCP Integration Guide (Oflight)](https://www.oflight.co.jp/en/columns/openclaw-plugin-mcp-integration-guide/)
- [McPorter for OpenClaw (OpenClaw Launch)](https://openclawlaunch.com/guides/openclaw-mcporter)

### Deployment
- [StartClaw - Deploy OpenClaw in Seconds](https://startclaw.com/deploy)
- [Run Multiple OpenClaw Agents on DigitalOcean](https://www.digitalocean.com/blog/openclaw-digitalocean-app-platform)
- [Serverless OpenClaw on AWS (GitHub)](https://github.com/serithemage/serverless-openclaw)
