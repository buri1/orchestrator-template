# YC W2026 Batch: Agent Orchestration Relevant Companies

**Date:** 2026-03-05
**Source:** Airtable collection + web research
**Focus:** Infrastructure, tooling, and patterns relevant to agent orchestration

---

## Executive Summary

The YC Winter 2026 batch is overwhelmingly agent-centric -- nearly 50% of the batch comprises AI agent companies. The batch reveals a clear maturation of the agent ecosystem: companies are no longer just building agents, they are building the **infrastructure layer** that agents need to operate reliably at scale. This includes execution environments, context management, API payment rails, GPU inference, and orchestration platforms.

For the L-Thread Orchestrator project specifically, the most relevant companies fall into three tiers:

**Tier 1 -- Directly Applicable / Borrow Patterns:**
- **Compresr / Context-Gateway** -- Background context compaction (CRITICAL for Pi Agent)
- **Terminal Use** -- Vercel for background agents; harness-agnostic execution
- **1code.dev (21st.dev)** -- Parallel agent orchestration with worktree isolation
- **Orthogonal** -- Agent-to-API payment and discovery layer

**Tier 2 -- Infrastructure You Would Use:**
- **Cumulus Labs** -- Serverless GPU inference for self-hosted models
- **Proliferate** -- Cloud sandboxes mirroring real dev environments
- **RamAIn** -- Computer-use agent infrastructure

**Tier 3 -- Domain-Specific / Inspirational:**
- **Mendral** -- CI/CD agent pattern (always-on DevOps)
- **PatientDesk** -- Voice AI SaaS pattern (vertical agent)
- **Cardboard / Wideframe** -- Agentic video editing (agents beyond code)
- **Laurence** -- PPC optimization agent (quantitative models)

---

## Tier 1: Directly Applicable

### 1. Compresr / Context-Gateway -- CRITICAL: Instant Background Compaction

**URL:** [compresr.ai](https://compresr.ai/) | [GitHub: Compresr-ai/Context-Gateway](https://github.com/Compresr-ai/Context-Gateway)
**YC Page:** [Compresr on YC](https://www.ycombinator.com/companies/compresr)
**User Note:** "BORROW PATTERN FOR PI AGENT!!!!"

#### What They Built

Context Gateway is an **agentic proxy** that sits between your AI agent (Claude Code, Cursor, OpenClaw, Codex) and the LLM API. Its core innovation: **background compression of conversation history so you never wait for compaction**.

The system compresses:
- Conversation history
- Tool outputs (which are often massive)
- Lists of available tools (which bloat context)

They claim **up to 200x compression without quality loss**.

#### How Instant Compaction Works

The architecture is a **transparent proxy**:

1. **Intercept:** Context Gateway intercepts API calls between the agent and the LLM provider.
2. **Monitor:** It monitors conversation length and token usage in real-time.
3. **Background Compress:** When the conversation approaches context limits, it triggers compression **asynchronously** -- the agent never blocks, never waits, never knows compaction happened.
4. **Dynamic Summarization:** Maintains a "living summary" that updates continuously. The last N turns are kept in full; everything older is compressed into a continuously-rewritten compact summary.
5. **Tool Output Compression:** Large tool outputs (file reads, search results, etc.) are compressed while preserving the semantically important parts.

#### How to Adapt This for Pi / L-Thread Orchestrator

This is the most immediately actionable pattern in the entire batch. The key insight: **compaction should be a background proxy layer, not an in-agent blocking operation.**

Current L-Thread Orchestrator uses Claude Code's built-in `/compact` which:
- Blocks the agent during compaction
- Loses orchestration state if not carefully managed
- Is triggered manually or at arbitrary thresholds

**Adaptation strategy:**
1. **Proxy Layer:** Run Context Gateway (or a custom implementation) between orchestrator agents and the Anthropic API. Every sub-agent gets instant compaction for free.
2. **State Preservation:** The proxy can be configured to never compress orchestration state markers, ensuring that task assignments, agent status, and roadblock logs survive compaction.
3. **Tool Output Compression:** For the orchestrator specifically, tool outputs from `terminal-read`, `terminal-capture`, and file reads are the biggest context consumers. These should be compressed aggressively while preserving error messages and key results.
4. **Pre-Compact Hooks:** The existing `orchestrator-handoff.sh` pre-compact hook could be enhanced to work with the proxy -- writing state to disk before the proxy's background compression triggers.

**Technical integration path:**
- Context Gateway is open source and designed as a drop-in proxy
- Set `ANTHROPIC_BASE_URL` to point to the local Context Gateway proxy
- The proxy handles all compression transparently
- Works with Claude Code, which is the L-Thread Orchestrator's primary agent harness

**Founded by:** EPFL researchers with PhD-level expertise in LLM context compression.

---

### 2. Terminal Use -- Vercel for Background Agents

**URL:** [terminaluse.com](https://www.terminaluse.com/)
**YC Page:** [Terminal Use on YC](https://www.ycombinator.com/companies/terminal-use)

#### What They Built

Terminal Use is an all-in-one hosting infrastructure for long-running agents. Think "Vercel for background agents" -- purpose-built for agents that use filesystems.

#### Founders

The team consists of Vivek, Stavros, and Filip. Vivek and Filip worked together at **Palantir**, where Vivek led technical delivery of a large agent use case across US hospitals and Stavros worked on infrastructure for Palantir dev tooling. This Palantir background is significant -- they have production experience with agent orchestration at enterprise scale.

#### Core Philosophy

Their key thesis: **"Agent apps do not win on the model -- they win on having a great harness."**

This aligns perfectly with the L-Thread Orchestrator philosophy. They found that multi-agent configurations (like actor-critique loops) lead to higher quality code and reduce the need for human reviews.

#### Technical Details

Terminal Use solves specific production problems they identified:
- **Wildly varying memory usage** with sub-agent count
- **Crashes requiring retry logic** for durability
- **State living in `~/.claude` and the local filesystem** -- making recovery and persistence difficult

The platform is:
- **CLI-first** -- designed for terminal-native agent workflows
- **Framework agnostic** -- hosts agents built on Claude Agent SDK, Codex SDK, or custom frameworks
- **Filesystem-aware** -- understands that agents need real filesystem access, not just API calls

#### Relevance to L-Thread Orchestrator

Terminal Use validates several L-Thread Orchestrator design decisions:
1. **Tmux crash recovery** -- Terminal Use's durability layer solves the same problem as L-Thread's `tmux-recovery.md`
2. **State management** -- Their filesystem-aware approach mirrors the `_bmad/orchestrator-state.json` pattern
3. **Framework agnosticism** -- Supporting multiple agent frameworks is the same direction as L-Thread's model-agnostic design

**Potential use:** Could serve as the cloud execution environment for L-Thread agents, replacing local tmux sessions with managed cloud sessions that survive crashes automatically.

---

### 3. 1code.dev (21st.dev) -- Parallel Agent Orchestration

**URL:** [1code.dev](https://1code.dev/) | [GitHub: 21st-dev/1code](https://github.com/21st-dev/1code)
**YC Page:** [21st.dev on YC](https://www.ycombinator.com/companies/21stdev)
**Founded by:** Sergey Bunas and Serafim Korablev (2024, San Francisco)

#### What They Built

1Code is an open-source **orchestration layer for coding agents** (Claude Code, Codex). It provides a control panel to run multiple coding agents in parallel -- locally on Mac or in remote cloud sandboxes.

#### Key Architecture Patterns

**Parallel Execution with Worktree Isolation:**
- Each agent session runs in its own isolated Git worktree
- Agents work in background without touching the main branch
- Real-time diff previews show what each agent is changing

**Local + Remote Hybrid:**
- Local mode: Run on Mac with worktrees, zero cloud dependency
- Remote mode: Isolated cloud sandboxes with repo cloned and dependencies installed
- Agents commit, push branches, and open PRs automatically

**Integration Points:**
- Tag `@1code` in GitHub, Linear, or Slack to spawn an agent
- Auto-review PRs, fix CI failures, complete Linear tasks
- Built-in Git client for staging, committing, pushing

#### Relevance to L-Thread Orchestrator

1Code is essentially a **GUI-first** version of what L-Thread Orchestrator does in the terminal. The comparison is instructive:

| Feature | 1Code | L-Thread Orchestrator |
|---------|-------|----------------------|
| Agent spawning | GUI or @mention | Conduit/Teams/Tmux |
| Isolation | Git worktrees | Tmux panes/sessions |
| Parallelism | Multiple tabs | Multiple tmux panes |
| State tracking | Built-in UI | JSON state files |
| Recovery | Cloud persistence | Tmux recovery command |
| Open source | Yes | Yes |

**Borrow patterns:**
- Git worktree isolation is more robust than tmux pane isolation for code changes
- The `@mention` spawn pattern from GitHub/Linear/Slack is a better UX for triggering agents than manual orchestrator commands
- Remote sandbox fallback when local resources are exhausted

---

### 4. Orthogonal -- Agent-to-API Payment and Discovery

**URL:** [orthogonal.com](https://www.orthogonal.com/) | [Docs](https://docs.orthogonal.com)
**YC Page:** [Orthogonal on YC](https://www.ycombinator.com/companies/orthogonal)
**Founded by:** Christian (ex-Coinbase payments, ex-Vercel billing) and Bera (ex-Google reCAPTCHA/Maps)

#### What They Built

Orthogonal is **where agents go to find and pay for APIs**. It is a marketplace and payment rail for AI agents to discover, authenticate with, and pay for API services on a per-request basis.

#### The Problem They Solve

MCP standardized tool calling but created fragmentation:
- Some services have MCPs, others do not
- Some MCPs map to single APIs, others wrap entire workflows
- Agents end up with 30+ tools, bloating context
- Any MCP requiring identity or payment means managing accounts, API keys, billing, and auth across dozens of services

Orthogonal consolidates this: agents get instant access to hundreds of APIs through a single MCP or SDK, with pay-as-you-go billing, no API key management, and no subscription overhead.

#### How It Works

1. **For API Providers:** List your API once; it becomes instantly discoverable by every AI agent using the platform
2. **For Agent Developers:** Single integration point (MCP or SDK) to access hundreds of APIs with unified auth and billing
3. **Payment Model:** Per-request billing, no subscriptions, no invoices, no payment disputes

#### Relevance to L-Thread Orchestrator

As orchestrators spawn more agents that need external services (web search, database queries, SaaS integrations), Orthogonal's unified API access model would eliminate the current pain of configuring individual MCP servers for each service. An orchestrator agent could simply have access to Orthogonal's MCP and dynamically discover and use any API it needs.

---

## Tier 2: Infrastructure Components

### 5. Cumulus Labs -- Serverless GPU Inference

**URL:** [cumuluslabs.io](https://cumuluslabs.io/) | [Docs](https://docs.cumuluslabs.io/)
**YC Page:** [Cumulus Labs on YC](https://www.ycombinator.com/companies/cumulus-labs)
**Also:** NVIDIA Inception member

#### What They Built

Serverless GPU inference with **12.5-second cold starts**. Their proprietary engine **Ion** supports all major LLMs, VLMs, and MoE architectures.

#### Key Specs
- **50-70% cost savings** vs. traditional GPU cloud
- **Scale to zero** -- pay nothing when idle, billing by the second
- **No waitlists or approvals** -- instant provisioning
- On-premises GPU cluster OS with fleet management and Kubernetes-native orchestration

#### Relevance to Agent Orchestration

For orchestrators that need to self-host models (privacy, cost, latency), Cumulus provides the infrastructure layer. The scale-to-zero model is particularly relevant for agent orchestration where GPU usage is bursty -- agents may need inference capacity during active development but nothing overnight.

The on-premises cluster management could be relevant for enterprise deployments of agent orchestrators that cannot send code context to cloud APIs.

---

### 6. Proliferate -- Cloud Sandboxes for Coding Agents

**URL:** [docs.proliferate.com](https://docs.proliferate.com) | [GitHub: proliferate-ai/proliferate](https://github.com/proliferate-ai/proliferate)

#### What They Built

An open-source platform for building **company-specific background coding agents**. Every agent session runs in an **isolated cloud sandbox mirroring the actual Docker setup** of the team.

#### Key Architecture

- **Environment Mirroring:** Sandboxes replicate the exact Docker-based dev environment, so agents work with the same dependencies, configs, and constraints as human developers
- **Shared Tool Access:** Connect SaaS integrations (Sentry, GitHub, Slack), MCP servers, or custom internal APIs -- every engineer and every agent gets secure, standardized access
- **Output Format:** Each run produces a live preview URL showing the running app with the change applied, plus a command log and a PR ready to merge
- **Infinite Parallelism:** Agents can be parallelized across multiple sandboxes

#### Relevance to Agent Orchestration

Proliferate's sandbox model solves the "works on my machine" problem for agents. When an orchestrator spawns multiple agents, each one gets a pristine, identical environment. This is superior to the current tmux-based approach where agents share the host filesystem and can interfere with each other.

**Key pattern to borrow:** The live preview URL concept -- agents produce a running preview of their changes that can be inspected before merging.

---

### 7. RamAIn -- Computer-Use Agent Infrastructure

**URL:** [ramain.ai](https://ramain.ai/)
**YC Page:** [RamAIn on YC](https://www.ycombinator.com/companies/ramain)
**Founded by:** Shourya Vir Jain (San Francisco, 2 employees)

#### What They Built

RamAIn builds infrastructure to **pre-train computer-use agents (CUAs) on specific interfaces**. Unlike generic computer-use agents that reason about every action at execution time, RamAIn learns UI-policies and interface structures in advance, enabling **10x faster execution** with higher reliability.

#### Technical Approach

- **Pre-trained UI Policies:** Instead of having the agent figure out how to navigate a UI at runtime, RamAIn pre-learns the interface structure and optimal interaction patterns
- **GUI Automation:** Reads, writes, and performs tasks on local applications through intelligent GUI automation
- **Human-in-the-Loop:** Real-time control over every workflow step
- **No API Required:** "If you can see it, RamAIn can do it" -- operates on the visual layer

#### Relevance to Agent Orchestration

Computer-use is the bridge between agents and legacy systems. For orchestrators that need to interact with tools that lack APIs or MCP servers (enterprise apps, internal tools, legacy systems), RamAIn's pre-trained CUA approach provides a more reliable alternative to generic screenshot-based computer use.

The pre-training concept is particularly interesting: instead of paying the latency cost of an agent figuring out a UI at runtime, you invest upfront in teaching the agent the interface patterns.

---

## Tier 3: Domain-Specific / Inspirational

### 8. Mendral -- Always-On CI/CD Agent

**URL:** [mendral.com](https://www.mendral.com/)
**YC Page:** [Mendral on YC](https://www.ycombinator.com/companies/mendral)

#### What They Built

Mendral is an **always-on AI DevOps engineer** that diagnoses CI failures, catches flaky tests, and opens PRs with fixes. Currently managing CI/CD in production for 15 teams, with paying customers including PostHog.

#### Technical Architecture

- **Log Ingestion Pipeline:** Processes billions of CI log lines per week into ClickHouse, compressed at 35:1, queryable in milliseconds
- **Agent-Written SQL:** The agent writes its own SQL queries to investigate failures across the log database
- **Autonomous Fix PRs:** Identifies the root cause and opens a PR with the fix

#### Relevance to Agent Orchestration

Mendral validates the "always-on agent" pattern. Rather than spawning agents on demand, Mendral runs continuously, watching for events (CI failures) and acting autonomously. This is a different orchestration model than L-Thread's on-demand spawning -- more like a daemon than a job.

**Pattern to consider:** An always-on orchestrator agent that watches for GitHub events, CI failures, or Slack messages and autonomously spawns sub-agents to handle them.

---

### 9. RunCanary -- AI Code Review

**URL:** [runcanary.ai](https://runcanary.ai/) (limited public information available)

RunCanary appears to be positioned in the AI code review space alongside Greptile (YC W24, currently raising at $180M valuation), CodeRabbit, and Graphite. Limited public information was available at the time of research. The AI code review space is extremely competitive in 2026, with Greptile having processed millions of PRs and major players like CodeRabbit claiming 2M+ repositories connected.

The differentiation in this space typically comes from: depth of codebase indexing, speed of review, quality of suggestions, and integration breadth. Without more public information about RunCanary's specific approach, it is difficult to assess their competitive positioning.

---

### 10. PatientDesk -- Voice AI SaaS (INSPO)

**URL:** [patientdesk.ai](https://www.patientdesk.ai/)
**YC Page:** [PatientDesk on YC](https://www.ycombinator.com/companies/patientdeskai)
**Founded by:** Oncel Ozgul, San Koktas, Emre Kaplaner
**Funding:** $1M Pre-Seed led by YC and E2VC

#### What They Built

AI voice agent for dental clinic front desks. Handles calls, bookings, payments, and **real-time insurance verification during the call** (verifies insurance within seconds while the patient is still on the phone).

#### Traction

- Live in 60+ clinics across US, Australia, and UK
- One customer generated $350k in revenue from PatientDesk bookings in a single month
- Partnered with 3 major practice management systems

#### Why It Is Marked "INSPO"

PatientDesk demonstrates the **vertical agent SaaS** model executed well. The pattern:
1. Pick a specific, painful workflow (dental front desk)
2. Build an agent that handles the entire workflow end-to-end (not just one step)
3. Integrate deeply with domain-specific systems (practice management, insurance verification)
4. Measure in revenue generated, not tasks completed

This is the template for how agent orchestrators create value in specific verticals.

---

### 11. Cardboard -- Agentic Video Editor

**URL:** [usecardboard.com](https://www.usecardboard.com/)
**YC Page:** [Cardboard on YC](https://www.ycombinator.com/companies/cardboard)
**Founded by:** Saksham Aggarwal and Ishan Sharma

Cardboard is an agentic video editor for growth/marketing teams. Users give Cardboard footage and a goal ("3 variants", "30s hook", "testimonials") and get a strong first cut in minutes. The agent understands semantic meaning and maps requests to complex timeline operations automatically. Browser-based, no installs.

**Relevance:** Demonstrates agents moving beyond code into creative workflows. The "give a goal, get a result" pattern is the same orchestration model -- the difference is the domain (video vs. code).

---

### 12. Wideframe -- AI Agent for Video Work

**URL:** [wideframe.com](https://wideframe.com/)
**YC Page:** [Wideframe on YC](https://www.ycombinator.com/companies/wideframe)
**Founded by:** Daniel and Zack

Wideframe focuses on the **75% of video work that happens outside the NLE** (non-linear editor) -- search, organization, brief generation, b-roll selection, music selection. Users link their video libraries and work with a context-aware agent. The desktop app handles Adobe Premiere Pro files natively.

**Traction:** 50+ brands and agencies onboarded in first 75 days.

**Relevance:** The founders explicitly cite **coding agents** as their inspiration. They committed to "bringing the power of coding agents to video editing." This validates the thesis that the coding agent orchestration pattern is generalizable to other domains.

---

### 13. Laurence -- PPC Marketing Optimization

**URL:** [trylaurence.com](https://www.trylaurence.com/)
**YC Page:** [Laurence on YC](https://www.ycombinator.com/companies/laurence)
**Founded by:** Matthew Chen (ex-Google, ex-Meta) and Leo Gierhake

Laurence automates performance advertising with quantitative models, focused on Amazon Ads and Shopify. Sellers consistently see 30% ROAS improvement.

**Relevance:** Another vertical agent company demonstrating that AI agents optimizing continuous processes (ad spend) can deliver measurable ROI. The quantitative model approach (vs. pure LLM) is a pattern worth noting.

---

## Other Notable YC W26 Agent Companies Discovered

Beyond the user's Airtable list, the following YC W26 companies are relevant to agent orchestration:

### Emdash -- Open-Source Agentic Development Environment

[GitHub: generalaction/emdash](https://github.com/generalaction/emdash)

Run multiple coding agents in parallel, using any provider. Open source. Directly comparable to both 1Code and L-Thread Orchestrator.

### Castari -- Vercel for AI Agents (One-Click Deploy)

[Castari on YC](https://www.ycombinator.com/companies/castari)

Lets developers deploy AI agents in secure, autoscaling sandboxes with one command. Handles tool/MCP connectors, snapshots, and observability.

### Syntropy -- Spec-Driven Autonomous Development

Uses E2B for agentic code execution. You describe a feature and come back to a fully tested PR. Runs unit and integration tests that agents generate.

### Chamber -- AI Infrastructure Autopilot

Orchestrates, governs, and optimizes GPU infrastructure. Runs ~50% more workloads on the same GPUs by forecasting demand, detecting unhealthy nodes, and reallocating resources in real time.

### Modelence -- Batteries-Included Agent Platform

A production-ready platform for agentic development that abstracts away boilerplate: auth, database, hosting, AI integration (LLM observability, prompts), real-time events, cron jobs, monitoring.

### assistant-ui -- AI Chat Frontend Library

Open source TypeScript/React library for adding AI chat to apps. First-class integrations with LangGraph and Vercel AI SDK. Used by LangChain, Stack AI, Browser Use.

---

## Strategic Analysis: What This Batch Tells Us

### 1. The Infrastructure Layer Is Crystallizing

The W26 batch reveals that the agent infrastructure stack is settling into clear layers:

```
[Agent UI]          1Code, Emdash, Cardboard, Wideframe
[Orchestration]     Terminal Use, L-Thread Orchestrator, Composio
[Context Mgmt]      Compresr, Context-Gateway
[Execution]         Proliferate, Castari, E2B, Syntropy
[Inference]         Cumulus Labs, Chamber
[Tool Access]       Orthogonal, MCP ecosystem
[Payments]          Orthogonal, Stripe Agentic Commerce
```

### 2. Background Agents Are the New Default

Multiple companies (Terminal Use, Proliferate, 1Code) are built around the concept of agents running in the background -- "fire and forget, come back to a PR." This is a shift from interactive pair-programming to autonomous task completion.

### 3. Context Management Is a First-Class Problem

Compresr's existence as a standalone YC company validates that context management (compaction, compression, summarization) is a **hard enough and important enough problem** to sustain a company. This is not a feature -- it is infrastructure.

### 4. The Harness Matters More Than the Model

Terminal Use's thesis -- "agent apps win on the harness, not the model" -- is echoed across the batch. The companies that are thriving are not building better models; they are building better harnesses, better execution environments, better state management, and better recovery mechanisms.

### 5. Agent Payments Are an Emerging Layer

Orthogonal and the broader "agentic commerce" movement (Google's Agent Payments Protocol, Stripe's Agentic Commerce Suite) signal that agents will need payment infrastructure. As agents become autonomous consumers of APIs, the current human-centric subscription model breaks down.

---

## Priority Actions for L-Thread Orchestrator

Based on this research, the following actions are prioritized by impact:

1. **IMMEDIATE: Evaluate Compresr Context-Gateway** as a drop-in proxy for all L-Thread agent sessions. This could eliminate the blocking compaction problem and extend agent session length by 10x. Test with a single agent first, then roll out to all spawned agents.

2. **SHORT-TERM: Study Terminal Use's harness architecture** for inspiration on durability and crash recovery. Their Palantir-derived patterns for handling agent crashes and filesystem state are directly applicable to improving tmux recovery.

3. **SHORT-TERM: Adopt 1Code's worktree isolation pattern** for parallel agents. Currently, L-Thread agents in tmux panes share the same filesystem. Git worktree isolation would prevent interference between parallel agents.

4. **MEDIUM-TERM: Evaluate Orthogonal** as a unified tool access layer. Instead of configuring individual MCP servers for each external service, a single Orthogonal MCP could provide access to hundreds of APIs.

5. **MEDIUM-TERM: Consider Proliferate's sandbox model** for remote agent execution, especially for CI/CD integration where agents need clean environments.

---

## Sources

- [1Code on YC](https://www.ycombinator.com/companies/21stdev)
- [1Code GitHub](https://github.com/21st-dev/1code)
- [1Code on Product Hunt](https://www.producthunt.com/products/1code-cursor-like-ui-for-claude-code)
- [1Code on Hacker News](https://news.ycombinator.com/item?id=46637723)
- [Proliferate GitHub](https://github.com/proliferate-ai/proliferate)
- [Proliferate Docs](https://docs.proliferate.com)
- [Cumulus Labs](https://cumuluslabs.io/)
- [Cumulus Labs on YC](https://www.ycombinator.com/companies/cumulus-labs)
- [Cumulus Labs Docs](https://docs.cumuluslabs.io/)
- [RamAIn](https://ramain.ai/)
- [RamAIn on YC](https://www.ycombinator.com/companies/ramain)
- [Orthogonal](https://www.orthogonal.com/)
- [Orthogonal on YC](https://www.ycombinator.com/companies/orthogonal)
- [Orthogonal Docs](https://docs.orthogonal.com)
- [Compresr](https://compresr.ai/)
- [Compresr on YC](https://www.ycombinator.com/companies/compresr)
- [Context-Gateway GitHub](https://github.com/Compresr-ai/Context-Gateway)
- [Terminal Use](https://www.terminaluse.com/)
- [Terminal Use on YC](https://www.ycombinator.com/companies/terminal-use)
- [PatientDesk](https://www.patientdesk.ai/)
- [PatientDesk on YC](https://www.ycombinator.com/companies/patientdeskai)
- [Mendral](https://www.mendral.com/)
- [Mendral on YC](https://www.ycombinator.com/companies/mendral)
- [Mendral Blog: Anatomy of a Production AI Agent](https://www.mendral.com/blog/anatomy-of-a-production-ai-agent)
- [Mendral Blog: CI at Scale](https://www.mendral.com/blog/ci-at-scale)
- [Cardboard](https://www.usecardboard.com/)
- [Cardboard on YC](https://www.ycombinator.com/companies/cardboard)
- [Cardboard Launch HN](https://news.ycombinator.com/item?id=47170174)
- [Laurence](https://www.trylaurence.com/)
- [Laurence on YC](https://www.ycombinator.com/companies/laurence)
- [Wideframe](https://wideframe.com/)
- [Wideframe on YC](https://www.ycombinator.com/companies/wideframe)
- [E2B Blog: Where AI Agents Are Heading](https://e2b.dev/blog/yc-companies-ai-agents)
- [YC W26 Batch](https://www.ycombinator.com/companies?batch=Winter+2026)
- [TLDL: YC AI Startups 2026 Breakdown](https://www.tldl.io/blog/yc-ai-startups-2026)
- [Extruct: YC W26 Batch Data](https://www.extruct.ai/data-room/ycombinator-companies-w26/)
- [Greptile on YC](https://www.ycombinator.com/companies/greptile)
- [Castari on YC](https://www.ycombinator.com/companies/castari)
- [Emdash GitHub](https://github.com/generalaction/emdash)
- [Upshift on YC](https://www.ycombinator.com/companies/upshift)
- [Cardboard Review (OutlierKit)](https://outlierkit.com/resources/cardboard-review/)
- [Skills vs MCP Tools (LlamaIndex)](https://www.llamaindex.ai/blog/skills-vs-mcp-tools-for-agents-when-to-use-what)
- [Factory.ai: Compressing Context](https://factory.ai/news/compressing-context)
- [Claude Platform: Automatic Context Compaction Cookbook](https://platform.claude.com/cookbook/tool-use-automatic-context-compaction)
