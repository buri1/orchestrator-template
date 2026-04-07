# dotta (cryppadotta)

> **Crypto-quant turned NFT co-founder turned AI agent orchestration builder — creator of Paperclip, the open-source orchestration layer for "zero-human companies."**

| Field | Value |
|-------|-------|
| Handle | [@dotta](https://x.com/dotta) |
| Role | CEO, Magic Machine (Forgotten Runes) / Creator of Paperclip |
| Known For | Paperclip (zero-human company orchestration), Forgotten Runes Wizard's Cult, `--dangerously-skip-permissions` philosophy |
| Platforms | [X (~47K followers)](https://x.com/dotta), [GitHub](https://github.com/cryppadotta), [Paperclip](https://paperclip.ing/), [Forgotten Runes](https://www.forgottenrunes.com/) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *(reserved)*

---

## Relevance to Our Work

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Paperclip's management-plane-on-top-of-agents thesis directly mirrors our orchestrator vision. His "company as orchestration" metaphor maps to our business-line isolation. However, adopting his platform wholesale violates 3 of our 7 principles (see Paperclip catalogue entry). The patterns to steal (cost tracking, session persistence, adapter interface) are high-value. |
| **Signal Quality** | 8/10 | Dotta ships real products across three technology eras (crypto tooling 2018, NFTs 2021, AI agents 2025). Not a commentator. Open-source code backs up claims. His following list (~4,167 accounts) is one of the best curated maps of the agent space. |

---

## Background & Track Record

Dotta is one of the rare builders who has shipped real products across three distinct eras of crypto/AI. In 2018, he created Dotlicense (ERC721-based software licensing, one of the earliest non-art uses of ERC721) and Dottabot (a cryptocurrency trailing-profit stop bot). In 2021, he co-founded Forgotten Runes Wizard's Cult alongside Elf J. Trul and Bearsnake through their company Magic Machine -- 10,000 on-chain wizard NFTs that expanded into an animated TV series (with Titmouse), an MMORPG (Forgotten Runiverse), and a massive community-driven lore ecosystem.

In 2023-2024, he bridged NFTs and AI by building The Loracle, a ChatGPT-powered creative assistant that draws from The Book of Lore (~4,500 entries) and Wizzypedia to help community members create stories. He discussed LLM agents, BabyAGI-style architectures, and the Westworld Paper on Wizard Wednesday shows. This was not a pivot -- it was an evolution. Managing thousands of community contributors creating lore in a shared universe gave him direct experience with the orchestration problems that Paperclip now solves.

In 2025-2026, he built and open-sourced Paperclip -- a full agent orchestration platform for autonomous businesses. He also built MCP servers (Wizzypedia, Scryfall/MTG) and became a vocal advocate for Pi/OpenClaw, autonomous coding agents, and the `--dangerously-skip-permissions` philosophy. He has ~47K X followers and is positioned as one of the most credible agent orchestration builders because he backs every claim with shipped code.

---

## System / Workflow

### Architecture: Paperclip

Paperclip is dotta's thesis in code. It is not a chatbot, agent framework, or workflow builder -- it is a **company operating system for AI agents**.

| Component | Description |
|-----------|-------------|
| **Org Charts** | Agents have a boss, title, and job description. Hierarchies and reporting lines via `reportsTo` relationships. |
| **Governance** | Board-level approval gates. Human = board of directors. CEO agent cannot execute unapproved strategies. Hiring new agents requires Board approval. |
| **Budget Management** | Monthly token budgets per agent. 80% = soft warning. 100% = auto-pause, new tasks blocked. Per-agent, per-task, per-project, per-goal cost tracking. |
| **Heartbeat Execution** | Agents do NOT run continuously. Short execution windows triggered by wakeup signals. Context resumes across heartbeats (not restart from scratch). |
| **Agent-Agnostic Adapters** | Supports Claude Code, OpenClaw, Python scripts, shell commands, HTTP webhooks. Adapters abstract the execution environment. |
| **Company Templates** | Pre-built org structures, agent configs, and skills. Export/import with secret scrubbing and collision handling (ClipMart). |
| **Rollback Safety** | Config changes are revisioned. Bad changes can be rolled back. |
| **Multi-Tenancy** | Every entity is company-scoped. One deployment can run many companies with separate data and audit trails. |

**Tech stack:** TypeScript monorepo (pnpm), Drizzle ORM, embedded PostgreSQL, Express server, React UI dashboard. 30+ PostgreSQL tables. ~600+ line heartbeat engine.

**Getting started:** `npx paperclipai onboard --yes` -- open source, self-hosted, no account required.

### Tool Stack

| Tool/Framework | How Dotta Uses It |
|----------------|-------------------|
| **Claude Code** | Primary coding agent. `--dangerously-skip-permissions` for full autonomy. |
| **Pi / OpenClaw** | Endorsed as "most interesting coding agent" for customizability. Paperclip supports OpenClaw bots via adapters. |
| **MCP** | Built MCP servers for [Wizzypedia](https://github.com/cryppadotta/mcp-wizzypedia) and [Scryfall/MTG](https://github.com/cryppadotta/scryfall-mcp). |
| **Node.js + React** | Paperclip's stack. |
| **Ethereum/Solidity** | Historical expertise from Dotlicense and Forgotten Runes smart contracts. |
| **ChatGPT / GPT-4** | Used for The Loracle (RAG over lore corpus). |

### Key Numbers

- **~47K** X followers, **~4,167** following (curated agent space map)
- **10,000** Forgotten Runes NFTs, **~4,500** Book of Lore entries
- **30+** PostgreSQL tables in Paperclip schema
- **4,167** accounts followed -- one of the densest signal networks in the agent space

### Unique Patterns

- **Company metaphor over pipeline metaphor:** Org charts, roles, budgets, governance instead of DAGs, queues, or message buses. Fundamentally different from LangGraph/CrewAI/Swarms approaches.
- **Budget as safety mechanism:** Instead of aligning agents through prompting alone, enforce hard resource caps. Direct response to the paperclip maximizer thought experiment (the name is intentionally ironic).
- **Human-as-Board-of-Directors:** Human does not micromanage agents (that is the CEO agent's job). Human operates at board level: approving strategies, setting budgets, hiring/firing agents, reviewing outcomes. Governance model, not supervision model.
- **Crypto governance applied to AI:** On-chain governance patterns (Dotlicense, NFT community management) directly inform Paperclip's approval gates, budget caps, and board-level controls.

---

## Key Insights

1. **Agent orchestration is the next value capture layer, not agent capability.** Dotta is not building better agents. He is building the management layer on top. Pi/OpenClaw for the runtime, Paperclip for the management plane. This implies agent capability is commoditizing and coordination is where value accrues.

2. **The company metaphor scales better than the pipeline metaphor.** As agent systems get more complex, you need organizational structures (roles, budgets, governance, reporting lines) not just technical routing (DAGs, message queues). Paperclip proves this approach is implementable, not just theoretical.

3. **Hard constraints beat soft constraints for agent safety.** The `--dangerously-skip-permissions` ethos combined with Paperclip's governance reveals a philosophy: let agents run free but build hard systemic constraints (budgets, approvals, rollbacks) rather than soft behavioral ones (prompting, RLHF). An agent that hits 100% budget auto-pauses regardless of its alignment.

4. **MCP is becoming the "HTTP of agents."** Dotta builds MCP servers (Wizzypedia, Scryfall) and Paperclip uses MCP adapters. MCP is the protocol that connects agents to data sources and tools -- building MCP servers is the equivalent of building REST APIs in 2010.

5. **AI as creative augmentation, not replacement.** From The Loracle: "We tried to make it automatically create lore, but it was kind of soulless. About 10% of the time, what The Loracle suggests is actually quite good." This informed Paperclip's human-in-the-loop design.

---

## What We Can Learn

- **Cost tracking schema:** Paperclip's `cost_events` table (provider, model, inputTokens, outputTokens, costCents, per-issue attribution) is a clean pattern to adopt for our state files. Priority: immediate.
- **Task-keyed session persistence:** `agent_task_sessions` with `taskKey` + `sessionParamsJson` allows agents to resume previous sessions for the same task. Maps to Claude Code's `--resume` flag. Priority: immediate.
- **Adapter interface for harness abstraction:** When we add Pi Agent or Codex support (Day 60+), Paperclip's `AdapterExecutionResult` and `AdapterSessionCodec` provide a reference contract for orchestrator-to-harness communication.
- **Run lifecycle tracking:** Heartbeat run records (queued -> running -> completed/failed, with stdout/stderr excerpts, exit codes, context snapshots) are a good model for enhancing our devlog/state files.
- **Workspace resolution pattern:** Project workspace -> task session workspace -> agent home workspace resolution is cleaner than ad-hoc worktree setup.
- **Following list as signal map:** Dotta's 4,167-account following list yielded 107 multi-agent-relevant accounts when we analyzed 920 of them. His network is a leading indicator for where the agent space is going.

---

## What Doesn't Apply

- **PostgreSQL in Phase 1:** Paperclip requires embedded PostgreSQL with 30+ tables. Our ADR-002 mandates JSON state files for Phase 1. The database layer is premature for us.
- **Massive surface area:** Paperclip includes issue boards, labels, org charts, ClipMart marketplace, meeting-like approvals, invites, brand colors -- enormous unused surface area. Violates our "build only what you need" principle.
- **Permissive heartbeat model:** Paperclip's heartbeat model lets agents decide what to do. Our architecture mandates deterministic routing and state transitions.
- **No context engineering infrastructure:** Paperclip has no tiers, budgets, progressive disclosure, or two-brain separation for context management. Our architecture treats context as zero-sum.
- **"Zero-human company" vision:** Paperclip's endgame is entire businesses run by AI agents with humans only at board level. Our architecture keeps humans firmly in the loop at the PR review and strategic level (5-6 PRs/day ceiling is the real bottleneck, not agent capability).
- **~20K+ LoC TypeScript dependency:** Adopting Paperclip means inheriting Drizzle, Express, embedded Postgres, React, and ongoing maintenance burden.

---

## Referenced Tools/Projects

| Tool/Project | How They Use It | In Our Catalogue? |
|-------------|-----------------|-------------------|
| Paperclip | Core project -- orchestration for zero-human companies | [Yes](../orchestration-platforms/paperclip.md) |
| Pi Agent | Endorsed as "most interesting coding agent," supported via Paperclip adapters | [Yes](../agent-harnesses/pi-agent.md) |
| Claude Code | Primary coding agent, run with `--dangerously-skip-permissions` | No (it is our current backend) |
| OpenClaw | Built on Pi, supported via Paperclip adapters | No |
| MCP-Wizzypedia | MCP server bridging Forgotten Runes wiki to AI agents | No |
| Scryfall MCP | MCP server for Magic: The Gathering card data | No |
| The Loracle | ChatGPT-powered creative assistant for Forgotten Runes lore | No |
| Forgotten Runes | NFT project that informed Paperclip's governance design | No |
| Dotlicense | ERC721 software licensing (2018) -- crypto governance roots | No |

---

## Network & Connections

Dotta's public interactions and endorsements reveal his signal-tracking priorities in the agent space:

| Person/Account | Connection |
|----------------|------------|
| **Mario Zechner** (@badlogicgames) | Creator of Pi Agent. Dotta endorsed his work publicly. |
| **Nico Bailon** (@nicopreme) | Most prolific Pi extension builder (pi-messenger, pi-subagents, pi-mcp-adapter). Dotta recommended following him. |
| **Peter Steinberger** (@steipete) | OpenClaw creator (250K+ stars, built on Pi). Joined OpenAI Feb 2026. |
| **Boris Cherny** (@bcherny) | Claude Code lead at Anthropic. Defines CC capabilities. |
| **Geoffrey Huntley** (@GeoffreyHuntley) | Ralph Wiggum Loop, back pressure theory, built Amp at Sourcegraph. |
| **Karthik Hariharan** (@hkarthik) | Discusses agent orchestration problems in OpenClaw community. |
| **Nader Dabit** | Web3-to-AI crossover, wrote about building custom agent frameworks with Pi. |
| **Armin Ronacher** | Flask creator, documented Pi's architecture. Part of Pi/OpenClaw ecosystem. |
| **Elf J. Trul & Bearsnake** | Forgotten Runes co-founders at Magic Machine. |

---

## Key Content & Sources

| Type | Title/Description | URL |
|------|-------------------|-----|
| Tweet thread | Paperclip open-source launch announcement | [x.com/dotta/status/2029239759428780116](https://x.com/dotta/status/2029239759428780116) |
| Tweet | Endorsement of Pi as most interesting coding agent | [x.com/dotta/status/2021345041005072778](https://x.com/dotta/status/2021345041005072778) |
| GitHub | Paperclip -- orchestration for zero-human companies | [github.com/paperclipai/paperclip](https://github.com/paperclipai/paperclip) |
| GitHub | MCP-Wizzypedia -- MCP server for Forgotten Runes wiki | [github.com/cryppadotta/mcp-wizzypedia](https://github.com/cryppadotta/mcp-wizzypedia) |
| GitHub | Scryfall MCP -- MCP server for Magic: The Gathering | [github.com/cryppadotta/scryfall-mcp](https://github.com/cryppadotta/scryfall-mcp) |
| GitHub | Dotlicense -- ERC721 software licensing (2018) | [github.com/cryppadotta/dotta-license](https://github.com/cryppadotta/dotta-license) |
| Article | NFT Now: "How Forgotten Runes Is Using ChatGPT to Build a Fantasy Empire" | [nftnow.com](https://nftnow.com/features/how-forgotten-runes-is-using-chatgpt-to-build-a-fantasy-empire/) |
| Medium | "What is Dottabot? A cryptocurrency trailing profit-stop bot" | [medium.com/@dotta](https://medium.com/@dotta/what-is-dottabot-a-cryptocurrency-trailing-profit-stop-bot-7748ed861f8c) |
| Wizard Wednesday | Recap discussing LLM agents, BabyAGI, and AI in Forgotten Runes | [Wizzypedia 2024-04-24](https://wizzypedia.forgottenrunes.com/Wizard_Wednesday_Recap,_2024-04-24) |
| Wizard Wednesday | Recap discussing Westworld Paper and AI agent iteration | [Wizzypedia 2023-05-17](https://wizzypedia.forgottenrunes.com/Wizard_Wednesday_Recap,_2023-05-17) |
| Product | The Loracle -- ChatGPT-powered Forgotten Runes creative assistant | [loracle.forgottenrunes.com](https://loracle.forgottenrunes.com/) |
| Product | Paperclip -- zero-human company orchestration | [paperclip.ing](https://paperclip.ing/) |
| Dune | On-chain analytics for Forgotten Runes | [dune.com/dotta](https://dune.com/dotta/Forgotten-Runes-Wizard%27s-Cult) |

---

## Key Takeaway

> **Dotta proves that agent orchestration should be modeled as organizational engineering (roles, budgets, governance, reporting lines) rather than pipeline engineering (DAGs, queues, routers) -- and his two immediately stealable patterns are per-token cost attribution and task-keyed session persistence.**
