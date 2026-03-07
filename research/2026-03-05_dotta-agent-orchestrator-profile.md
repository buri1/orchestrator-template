# Deep Research: @dotta -- Agent Orchestrator, Forgotten Runes, Paperclip

**Date:** 2026-03-05
**Subject:** dotta (aka cryppadotta) -- Builder Profile & Agent Orchestration Research
**X handle:** [@dotta](https://x.com/dotta)
**GitHub:** [cryppadotta](https://github.com/cryppadotta)
**Bio:** "Forgotten Runes, Paperclip, Agent Orchestrator, --dangerously-skip-permissions"
**Followers:** ~47K | **Following:** ~4,167

---

## 1. Who Is Dotta?

Dotta is a **crypto-quant turned NFT co-founder turned AI agent orchestration builder**. His journey maps the entire arc from early crypto tooling to NFTs to AI agents:

- **2018:** Created [Dotlicense](https://github.com/cryppadotta/dotta-license) -- an ERC721-based software licensing framework. This was one of the earliest uses of ERC721 for non-art purposes (software licenses, subscriptions). He also built **Dottabot**, a cryptocurrency trailing-profit stop bot.
- **2021:** Co-founded [Forgotten Runes Wizard's Cult](https://www.forgottenrunes.com/) alongside Elf J. Trul and Bearsnake, through their company **Magic Machine**. 10,000 on-chain wizard NFTs that expanded into an animated TV series (with Titmouse), an MMORPG ([Forgotten Runiverse](https://runiverse.world/)), and a massive lore ecosystem.
- **2023-2024:** Pivoted into AI integration with Forgotten Runes -- built **The Loracle**, a ChatGPT-powered creative assistant that draws from The Book of Lore and Wizzypedia to help community members create stories. Discussed LLM agents and BabyAGI-style autonomous agent architectures on Wizard Wednesday shows.
- **2025-2026:** Built and open-sourced **Paperclip** -- a full agent orchestration platform for "zero-human companies." Built MCP servers. Became a vocal advocate for autonomous coding agents, Pi/OpenClaw, and the `--dangerously-skip-permissions` philosophy.

**Key identity:** Dotta is one of the rare builders who has shipped real products across crypto (Dotlicense, Dottabot), NFTs (Forgotten Runes), and now AI agent orchestration (Paperclip). He is not a commentator -- he builds.

---

## 2. What Is Paperclip?

**Paperclip** is dotta's flagship AI project: an open-source orchestration layer for "zero-human companies."

- **Website:** [paperclip.ing](https://paperclip.ing/)
- **GitHub:** [paperclipai/paperclip](https://github.com/paperclipai/paperclip)
- **Docs:** [paperclipai/docs](https://github.com/paperclipai/docs)
- **Launch tweet:** [dotta's announcement](https://x.com/dotta/status/2029239759428780116)

### Core Concept

Paperclip models entire companies -- with org charts, goals, budgets, and governance -- and then fills those roles with AI agents. It is NOT a chatbot, NOT an agent framework, and NOT a workflow builder. It is a **company operating system for AI agents**.

### Key Architecture

| Feature | Description |
|---------|-------------|
| **Org Charts** | Agents have a boss, a title, and a job description. Hierarchies and reporting lines. |
| **Governance** | Board-level approval gates. You (human) are the board of directors. CEO agent cannot execute unapproved strategies. Hiring new agents requires Board approval. |
| **Budget Management** | Monthly token budgets per agent. At 80% utilization: soft warning. At 100%: auto-pause, new tasks blocked. Cost tracking per agent, per task, per project, per goal. |
| **Heartbeat Architecture** | Agents do NOT run continuously. They run in heartbeats -- short execution windows triggered by wakeup signals. Agents resume task context across heartbeats (not restart from scratch). |
| **Agent-Agnostic Adapters** | Supports Claude Code sessions, OpenClaw bots, Python scripts, shell commands, HTTP webhooks. Adapters connect Paperclip to any execution environment. |
| **Company Templates** | Pre-built org structures, agent configs, and skills. Export/import with secret scrubbing and collision handling. |
| **Rollback Safety** | Config changes are revisioned. Bad changes can be rolled back. Approval gates enforced. |
| **Multi-Tenancy** | Every entity is company-scoped. One deployment can run many companies with separate data and audit trails. |

### Getting Started

```bash
npx paperclipai onboard --yes
```

Open source. Self-hosted. No account required.

### Name Reference

The name "Paperclip" is a deliberate reference to Nick Bostrom's **paperclip maximizer** thought experiment -- an AI given the goal of making paperclips that converts all matter in the universe into paperclips. It is a nod to alignment concerns: Paperclip (the platform) builds in governance, budget caps, and human-in-the-loop controls as a direct response to the runaway-agent problem the thought experiment describes.

---

## 3. How Does Forgotten Runes Connect to AI Agents?

Dotta's path from NFTs to agents is not a pivot -- it is an evolution:

### The Loracle (2023)
- A ChatGPT-powered tool that serves as a "collective consciousness" for the Forgotten Runes universe
- Draws from The Book of Lore (~4,500 entries) and Wizzypedia
- Functions as a librarian and creative partner -- not an auto-writer
- Dotta's key insight: "We tried to make it automatically create lore, but it was kind of soulless. About 10% of the time, what The Loracle suggests is actually quite good."
- URL: [loracle.forgottenrunes.com](https://loracle.forgottenrunes.com/)

### MCP-Wizzypedia (2025)
- Dotta built an [MCP server for Wizzypedia](https://github.com/cryppadotta/mcp-wizzypedia) -- a Model Context Protocol server that lets any MCP-enabled tool (Claude Desktop, Cursor) query or write to the Wizzypedia
- This bridges the Forgotten Runes knowledge base directly into AI coding agents

### Wizard Wednesday AI Discussions
- Dotta discussed LLM agents on Wizard Wednesday shows, referencing BabyAGI (putting ChatGPT in a loop to develop tasks and work toward goals)
- Explored how language models could serve as screenwriters, producers, or art directors for the Forgotten Runes IP
- Referenced the Westworld Paper on providing instructions to language models to iterate on tasks

### The Through-Line
Forgotten Runes gave dotta experience with:
1. **Community-driven content creation** at scale (thousands of lore entries)
2. **AI as creative augmentation** (The Loracle), not replacement
3. **On-chain governance and ownership** (NFT holders influencing story direction)
4. **The need for orchestration** when you have thousands of contributors (human or AI) working in the same universe

This directly informed Paperclip's design: org charts, governance, budgets, and human-in-the-loop controls.

---

## 4. What Has Dotta Posted About Multi-Agent Orchestration?

### Key Tweets and Positions

**On Pi and OpenClaw:**
> "Pi is the most interesting coding agent right now because you can customize it (It's what openclaw is built on). nico has some great repos that show the power. Worth a follow."
> -- [dotta on X](https://x.com/dotta/status/2021345041005072778)

Dotta endorsed Pi (by Mario Zechner) -- a minimal 4-tool coding agent that became the engine behind OpenClaw (145K+ GitHub stars in one week). He values **customizability** and **minimalism** in agent design.

**On Paperclip Launch:**
> "We just open-sourced Paperclip: the orchestration layer for zero-human companies. It's everything you need to run an autonomous business: org charts, goal alignment, task ownership, budgets, agent templates. Just run `npx paperclipai onboard`"
> -- [dotta on X](https://x.com/dotta/status/2029239759428780116)

**The `--dangerously-skip-permissions` Bio:**
Dotta's bio includes `--dangerously-skip-permissions` -- the Claude Code flag that lets AI run end-to-end without human approval. This is a philosophical statement: he believes in giving agents autonomy while building guardrails (budgets, governance, approval gates) into the orchestration layer rather than the agent itself. It is the Paperclip philosophy in three words.

---

## 5. Tools and Frameworks Dotta Uses

| Tool/Framework | How Dotta Uses It |
|----------------|-------------------|
| **Claude Code** | Primary coding agent. The `--dangerously-skip-permissions` flag in his bio signals he runs it autonomously. |
| **Pi / OpenClaw** | Endorsed as "most interesting coding agent" for its customizability. OpenClaw is built on Pi. |
| **MCP (Model Context Protocol)** | Built MCP servers for [Wizzypedia](https://github.com/cryppadotta/mcp-wizzypedia) and [Scryfall/MTG](https://github.com/cryppadotta/scryfall-mcp). |
| **Node.js + React** | Paperclip's stack: Node.js server + React UI dashboard. |
| **Ethereum/Solidity** | Historical expertise from Dotlicense and Forgotten Runes smart contracts. |
| **ChatGPT / GPT-4** | Used for The Loracle. Understanding RAG patterns for lore retrieval. |

---

## 6. Relationship to the OpenClaw Ecosystem

Dotta is an **early advocate and power user** of the OpenClaw ecosystem, not a core contributor:

- He publicly endorsed Pi (the minimal agent powering OpenClaw) as the "most interesting coding agent" due to its customizability
- Paperclip explicitly supports OpenClaw bots as one of its agent adapter types
- The OpenClaw community has been discussing agent orchestration challenges that Paperclip directly addresses (context window bloat, human-as-orchestrator-of-orchestrators problem)
- Karthik Hariharan noted on X that "AI agent orchestration is one of the more fascinating problems now getting discussed within the openclaw community" -- describing the exact problem Paperclip solves

Dotta's position: **OpenClaw/Pi for the agent runtime, Paperclip for the orchestration layer on top.** He is building the management plane, not the execution plane.

---

## 7. Who Does He Interact With Most in the Agent Space?

Based on tweets, endorsements, and project connections:

| Person/Account | Connection |
|----------------|------------|
| **Nico (Pi/OpenClaw contributor)** | Dotta specifically recommended following him for Pi customization repos |
| **Mario Zechner** | Creator of Pi (the minimal agent inside OpenClaw). Dotta endorsed his work. |
| **Armin Ronacher** | Flask creator who documented Pi's architecture. Part of the Pi/OpenClaw ecosystem. |
| **Nader Dabit** | Web3-to-AI crossover figure who wrote about building custom agent frameworks with Pi |
| **Karthik Hariharan (@hkarthik)** | Discusses agent orchestration problems in the OpenClaw community |
| **Forgotten Runes community** | ElfJTrul, Bearsnake, and the Magic Machine team |
| **The broader "vibe coding" community** | Claude Code power users, autonomous agent builders |

---

## 8. Orchestration Patterns and Approaches Dotta Has Discussed

### 8.1 The "Company as Orchestration" Pattern (Paperclip)
Rather than building orchestration as a technical routing layer, Paperclip uses the **metaphor of a company**: org charts, roles, reporting lines, budgets, governance. This is a fundamentally different approach from most agent orchestration frameworks that think in terms of DAGs, pipelines, or message queues.

### 8.2 Heartbeat-Based Execution
Agents don't run continuously. They execute in short "heartbeat" windows, resume context across heartbeats, and stop when budget is exhausted. This prevents runaway costs and context window bloat.

### 8.3 Human-as-Board-of-Directors
The human doesn't micromanage agents (that's the CEO agent's job). The human operates at the board level: approving strategies, setting budgets, hiring/firing agents, reviewing outcomes. This is a governance model, not a supervision model.

### 8.4 Agent-Agnostic Adapters
Paperclip is deliberately unopinionated about which agent runtime you use. Adapters abstract the execution environment. This means you can mix Claude Code agents, OpenClaw bots, Python scripts, and webhooks in the same "company."

### 8.5 Budget as Safety Mechanism
Rather than trying to align agents through prompting alone, Paperclip enforces hard budget constraints. An agent that hits 100% budget utilization auto-pauses. This is a direct response to the paperclip maximizer problem: you don't need to perfectly align the agent if you can simply cap its resource consumption.

---

## 9. What His Following List Tells Us About Where the Agent Space Is Going

Dotta follows 4,167 accounts. While we cannot enumerate the full list, his public interactions and endorsements reveal his signal-tracking priorities:

### Signals from Dotta's Positioning

1. **Agent orchestration > individual agents.** Dotta is not building better agents. He is building the management layer on top of agents. This suggests the next value capture is in coordination, not capability.

2. **Company metaphor > pipeline metaphor.** Paperclip's org-chart approach suggests that as agent systems get more complex, we will need organizational structures (roles, budgets, governance) not just technical routing.

3. **Pi/OpenClaw minimalism.** Dotta endorses the 4-tool minimal agent philosophy. The implication: agent capability is commoditizing; what matters is the orchestration layer.

4. **Crypto governance patterns applied to AI.** Dotta's background in on-chain governance (Dotlicense, Forgotten Runes DAO-like mechanics) directly informs Paperclip's approval gates, budget caps, and board-level controls. The crypto-to-AI pipeline is real.

5. **Autonomous operation with guardrails.** The `--dangerously-skip-permissions` ethos combined with Paperclip's governance suggests a philosophy: let agents run free but build hard constraints into the system (budgets, approvals, rollbacks) rather than soft constraints (prompting, RLHF).

6. **MCP as the connectivity layer.** Dotta builds MCP servers (Wizzypedia, Scryfall). MCP is becoming the "HTTP of agents" -- the protocol that connects agents to data sources and tools.

7. **Zero-human companies as the endgame.** Paperclip's tagline is not "AI-assisted companies" -- it is "zero-human companies." This is the maximalist vision: entire businesses run by AI agents, with humans operating only at the board level.

---

## 10. Talks, Threads, and Public Content

### Confirmed Public Content

| Type | Title/Description | URL |
|------|-------------------|-----|
| **Tweet thread** | Paperclip open-source launch announcement | [x.com/dotta/status/2029239759428780116](https://x.com/dotta/status/2029239759428780116) |
| **Tweet** | Endorsement of Pi as most interesting coding agent | [x.com/dotta/status/2021345041005072778](https://x.com/dotta/status/2021345041005072778) |
| **GitHub** | MCP-Wizzypedia -- MCP server for Forgotten Runes wiki | [github.com/cryppadotta/mcp-wizzypedia](https://github.com/cryppadotta/mcp-wizzypedia) |
| **GitHub** | Scryfall MCP -- MCP server for Magic: The Gathering | [github.com/cryppadotta/scryfall-mcp](https://github.com/cryppadotta/scryfall-mcp) |
| **GitHub** | Dotlicense -- ERC721 software licensing (2018) | [github.com/cryppadotta/dotta-license](https://github.com/cryppadotta/dotta-license) |
| **Article** | NFT Now: "How Forgotten Runes Is Using ChatGPT to Build a Fantasy Empire" | [nftnow.com](https://nftnow.com/features/how-forgotten-runes-is-using-chatgpt-to-build-a-fantasy-empire/) |
| **Medium** | "What is Dottabot? A cryptocurrency trailing profit-stop bot" | [medium.com/@dotta](https://medium.com/@dotta/what-is-dottabot-a-cryptocurrency-trailing-profit-stop-bot-7748ed861f8c) |
| **Wizard Wednesday** | Recap discussing LLM agents, BabyAGI, and AI in Forgotten Runes | [Wizzypedia 2024-04-24](https://wizzypedia.forgottenrunes.com/Wizard_Wednesday_Recap,_2024-04-24) |
| **Wizard Wednesday** | Recap discussing Westworld Paper and AI agent iteration | [Wizzypedia 2023-05-17](https://wizzypedia.forgottenrunes.com/Wizard_Wednesday_Recap,_2023-05-17) |
| **Product** | The Loracle -- ChatGPT-powered Forgotten Runes creative assistant | [loracle.forgottenrunes.com](https://loracle.forgottenrunes.com/) |
| **Product** | Paperclip -- Zero-human company orchestration | [paperclip.ing](https://paperclip.ing/) |
| **Dune Dashboard** | On-chain analytics for Forgotten Runes | [dune.com/dotta](https://dune.com/dotta/Forgotten-Runes-Wizard%27s-Cult) |

---

## Key Takeaways

1. **Dotta is one of the most credible agent orchestration builders** because he has shipped real products across three eras: crypto tooling (2018), NFTs/gaming (2021), and AI agents (2025-2026).

2. **Paperclip is his thesis in code:** agent orchestration should look like company management (org charts, budgets, governance), not like pipeline engineering.

3. **The name Paperclip is intentionally ironic** -- named after the AI alignment nightmare scenario, but built with hard safety constraints (budget caps, approval gates, rollbacks) as the answer.

4. **His `--dangerously-skip-permissions` bio is philosophical:** trust agents to operate autonomously, but build hard systemic constraints rather than soft behavioral ones.

5. **He bridges crypto and AI** in a substantive way: on-chain governance patterns (Dotlicense, NFT ownership) directly inform Paperclip's agent governance model.

6. **He is positioned at the orchestration layer** -- not competing with OpenClaw/Pi/Claude Code at the agent level, but building the management plane on top.

7. **Following dotta's trajectory and following list is a leading indicator** for where the agent space is going: from individual agents to orchestrated agent companies, from prompt engineering to organizational engineering.

---

## Sources

- [dotta on X](https://x.com/dotta)
- [cryppadotta on GitHub](https://github.com/cryppadotta)
- [Paperclip - Open-source orchestration for zero-human companies](https://paperclip.ing/)
- [Paperclip GitHub](https://github.com/paperclipai/paperclip)
- [Paperclip docs - agents-runtime.md](https://github.com/paperclipai/docs/blob/main/agents-runtime.md)
- [dotta Paperclip launch tweet](https://x.com/dotta/status/2029239759428780116)
- [dotta Pi endorsement tweet](https://x.com/dotta/status/2021345041005072778)
- [MCP-Wizzypedia GitHub](https://github.com/cryppadotta/mcp-wizzypedia)
- [Scryfall MCP GitHub](https://github.com/cryppadotta/scryfall-mcp)
- [Dotlicense GitHub](https://github.com/cryppadotta/dotta-license)
- [Forgotten Runes Wizard's Cult](https://www.forgottenrunes.com/)
- [The Loracle](https://loracle.forgottenrunes.com/)
- [Wizzypedia - Dotta](https://wizzypedia.forgottenrunes.com/Dotta)
- [Wizard Wednesday Recap 2024-04-24](https://wizzypedia.forgottenrunes.com/Wizard_Wednesday_Recap,_2024-04-24)
- [Wizard Wednesday Recap 2023-05-17](https://wizzypedia.forgottenrunes.com/Wizard_Wednesday_Recap,_2023-05-17)
- [NFT Now - How Forgotten Runes Is Using ChatGPT](https://nftnow.com/features/how-forgotten-runes-is-using-chatgpt-to-build-a-fantasy-empire/)
- [Dottabot - Medium](https://medium.com/@dotta/what-is-dottabot-a-cryptocurrency-trailing-profit-stop-bot-7748ed861f8c)
- [Dotta - CypherHunter](https://www.cypherhunter.com/en/p/cryppadotta/)
- [Pi: The Minimal Agent Within OpenClaw - Armin Ronacher](https://lucumr.pocoo.org/2026/1/31/pi/)
- [Karthik Hariharan on agent orchestration](https://x.com/hkarthik/status/2022786685894103053)
- [OpenClaw Multi-Agent Orchestration Guide](https://zenvanriel.com/ai-engineer-blog/openclaw-multi-agent-orchestration-guide/)
- [Forgotten Runiverse](https://runiverse.world/)
- [Dune Dashboard - Forgotten Runes](https://dune.com/dotta/Forgotten-Runes-Wizard%27s-Cult)
