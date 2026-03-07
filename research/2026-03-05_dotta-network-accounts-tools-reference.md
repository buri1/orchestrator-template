# Dotta's Network: Accounts, Tools & Projects Reference

**Date:** 2026-03-05
**Source:** 107 multi-agent-relevant accounts from @dotta's X following (920/4,167 scraped)
**Research:** 19 parallel research agents + web search deep dives

---

## 1. Key People

| Name | X Handle | Followers | Role/Affiliation | Key Contribution | Pi Orchestration Relevance |
|------|----------|-----------|-----------------|------------------|---------------------------|
| Peter Steinberger | @steipete | 410K | Created OpenClaw, joined OpenAI Feb 2026 | "Polyagentmorous" — 3-8 agents in terminal grid, human-as-hub, CLIs over MCPs | Created the largest project built on Pi; proves Pi can scale to 250K+ star projects |
| Boris Cherny | @bcherny | 297K | Claude Code lead, Anthropic | /simplify, /batch, Agent Teams, worktree isolation | Defines the CC capabilities that a Pi harness must match or surpass |
| Mario Zechner | @badlogicgames | 27K | Creator of Pi Agent (badlogic/pi-mono) | 4-tool minimal agent, 300+ models, TypeScript extensions, libGDX creator | THE foundation — Pi is the harness. His anti-multi-agent stance means building against the grain |
| Geoffrey Huntley | @GeoffreyHuntley | 78K | Built Amp at Sourcegraph | Ralph Wiggum Loop, back pressure theory, "context = malloc without free" | Ralph Loop is THE primitive for iterative agent work; back pressure hierarchy directly applicable |
| dotta | @dotta | 47K | CEO Magic Machine, Forgotten Runes | Paperclip (zero-human companies), heartbeat execution, budget-as-safety | Target of this research; Paperclip's management-plane-on-top-of-Pi validates the harness approach |
| Nico Bailon | @nicopreme | 5K | OSS Pi extension builder | pi-messenger, pi-subagents, pi-mcp-adapter, Pi skills system | Most prolific Pi extension builder; his work IS the multi-agent layer for Pi |
| David Hill | @iamdavidhill | 17K | Building OpenCode, ex-Head of Design Larvel | OpenCode + Terminal Shop | OpenCode's architecture (100K+ stars, Go, HTTP+SSE) is the main OSS competitor to Pi |
| Rhys Sullivan | @RhysSullivan | 51K | Working on OpenCode | OpenCode development, community | Key voice in OSS coding agent community |
| Numman Ali | @nummanali | 9K | CTO RetailBook | OpenSkills (universal skills loader), AGENTS.md adoption (20K+ repos) | Agent-Native SDLC pipeline pattern directly maps to orchestrator phases |
| Koylan | @koylanai | 18K | Context Engineer, researcher | Context engineering framework (10K+ GitHub stars), progressive disclosure | Context budget management and progressive disclosure patterns for orchestrator |
| Alexander Wang | @alexandr_wang | 396K | Chief AI Officer Meta, founder Scale AI | Scale AI, AI infrastructure | Signals where enterprise AI agent infra is heading |
| Alex Finn | @AlexFinn | 429K | CEO Creator Buddy | $300K/year product built without writing code via vibe coding | Represents the single-agent-done-well pattern |
| @dmwlff | @dmwlff | 18K | Claude Code, Anthropic | CC development | Insider view on Claude Code direction |
| Jackson Kernion | @JacksonKernion | 6K | Finetuning at Anthropic | LLM finetuning research | Signals Anthropic's model-level improvements for agents |
| Kirill Neklyudov | @k_neklyudov | 2.6K | Technical Staff, Anthropic | AI research at Anthropic | Anthropic research direction |
| Benjamin Shafii | @benjaminshafii | 1.4K | Building notate.so / OpenWork | Open-source Claude Code desktop alternative wrapping OpenCode | Alternative harness approach — GUI-first instead of CLI-first |
| @ropirito | @ropirito | 22K | Agents at Nous Research | Deployed @god, @s8n, @jesuschrist as persistent AI personas | Agent-as-personality at scale; demonstrates persistent agent identity |
| Siddharth Ahuja | @sidahuj | 11K | Product at Moonlake | Blender MCP, Ableton MCP (2.5M+ users) | Socket-bridge MCP pattern; cross-tool orchestration via AI |
| @idosal1 | @idosal1 | 5.8K | AI lead | GitMCP, MCP Apps, MCP-UI (ui:// URI scheme) | MCP ecosystem tools; GitMCP turns any repo into remote MCP endpoint |
| Tomas Cupr | @tomcuprcz | 37K | Built Rohlik, building Duvo AI | Duvo AI — $15M seed, agentic AI for enterprise orchestration | Enterprise orchestration patterns with natural-language workflow definition |

---

## 2. Key Projects & Tools

### Coding Agents

| Project | Creator | GitHub Stars | Description | Relevance |
|---------|---------|-------------|-------------|-----------|
| **Pi Agent** | Mario Zechner | — | 4 tools, 300+ models, TypeScript extensions, MIT license | THE harness foundation |
| **OpenClaw** | steipete (on Pi) | 250K+ | Gateway/Brain/Memory/Skills/Heartbeat, embeds Pi via createAgentSession() | Validates Pi at massive scale |
| **OpenCode** | anomalyco | 100K+ | Go, HTTP+SSE, 75+ providers, TaskTool for subagents | Main OSS competitor, reference architecture |
| **Claude Code** | Anthropic | — | 3-tier multi-agent (Subagents, Teams, SDK), 18 hooks | Current L-Thread backend; migration source |
| **Jules** | Google Labs | — | Cloud VMs, Gemini 3 Pro, Critic-Augmented Generation | Patterns to steal: adversarial self-review |
| **Amp Code** | Sourcegraph | — | Multi-model, native subagent parallelization, Thread Map, headless-first | Patterns to steal: Thread Map viz, lazy MCP, hub-spoke |

### Pi Agent Extensions (Critical for Harness)

| Extension | Creator | Description | Priority |
|-----------|---------|-------------|----------|
| **pi-messenger** | nicopreme | File-based multi-agent coordination, Crew feature (PRDs to parallel task waves) | P0 — adopt or fork |
| **pi-subagents** | nicopreme | Async delegation with scout/planner/worker/reviewer agent roles | P0 — adopt or fork |
| **pi-mcp-adapter** | nicopreme | Lazy-loading MCP proxy, ~200 tokens vs 10K+ per server | P0 — adopt |
| **oh-my-pi** | can1357 | Full fork: LSP for 40+ languages, browser, subagents, git worktree isolation | P1 — reference patterns |
| **Overstory** | community | Cross-runtime orchestration (CC + Pi + Gemini) with SQLite mail | P1 — cross-runtime pattern |
| **pi-collaborating-agents** | community | File reservation system with agent callsigns and messaging | P2 — conflict avoidance |
| **pi-side-agents** | community | tmux/worktree/merge lifecycle automation | P1 — tmux patterns |
| **pi-web-access** | nicopreme | Web access for Pi agents | P2 |
| **pi-interactive-shell** | nicopreme | PTY emulation for interactive commands | P2 |
| **pi-foreground-chains** | nicopreme | Sequential workflow orchestration | P1 — pipeline pattern |

### Multi-Agent Frameworks

| Framework | Focus | Key Pattern | Overhead | Relevance |
|-----------|-------|------------|----------|-----------|
| **Swarms** | Scale (100+ agents) | 8+ topologies, AgentRearrange einsum syntax, SwarmRouter | Heavy | Topology patterns to reference |
| **DSPy** | Optimization | Programs over prompts, GEPA optimizer, 164% constraint compliance | 3.5ms | Prompt optimization for orchestrator |
| **LangGraph** | Production workflows | Graph-first, PostgresSaver, message bus, fault recovery | 14ms | Graph-based execution reference |
| **Letta AI** | Stateful memory | Core/Archival/Recall memory tiers, sleep-time compute | Medium | Memory architecture to adopt |
| **Agentica** | Minimal | TypeScript compiler extracts schemas, no explicit orchestration | Minimal | Anti-framework philosophy |
| **CrewAI** | Teams | Role-based agent teams, converging on graph execution | Medium | Team patterns |

### Protocols & Standards

| Protocol | Scope | Governance | Status | Relevance |
|----------|-------|-----------|--------|-----------|
| **MCP** | Agent-to-tool (vertical) | Linux Foundation / AAIF | Mature (97M+ monthly SDK downloads) | Pi uses pi-mcp-adapter bridge |
| **A2A** | Agent-to-agent (horizontal) | Linux Foundation | Growing (100+ enterprise backers) | Adopt task lifecycle as state model |
| **x402** | Agent payments | Coinbase/Cloudflare/Google | Live (50M+ transactions) | Future: agent-to-agent payment |
| **ERC-8004** | Agent identity | Ethereum | Draft | Tiered trust model applicable to verification |
| **AGENTS.md** | Project guidance | OpenAI | Adopted (60K+ repos) | Adopt alongside CLAUDE.md |
| **WebMCP** | Agent-to-website | W3C | Shipping in Chrome 146 | Future: web interaction |
| **ANP** | Decentralized agent discovery | Community | Early | Watch |

### Platforms & Infrastructure

| Platform | Creator | Description | Relevance |
|----------|---------|-------------|-----------|
| **Paperclip** | dotta | Orchestration for zero-human companies, heartbeat execution, budget-as-safety | Management plane on top of Pi |
| **Moltlaunch** | OpenClaw ecosystem | Agent marketplace, 21K+ agents on Base chain | Future: hire specialized agents |
| **Moltbook** | OpenClaw ecosystem | Agent social network, 770K+ agents, 93% non-response rate | Proof that orchestration is essential |
| **BridgeMCP** | BridgeMind | Shared memory + task orchestration across Cursor/CC/Windsurf via MCP | Cross-tool orchestration pattern |
| **Vibe Kanban** | BloopAI | OSS multi-agent orchestrator, Git worktree isolation | Vibe-world orchestrator reference |
| **MorphLLM** | @morphllm | Fast Apply (10,500 tok/s, 60x faster), WarpGrep (context rot -70%) | Speed layer for repetitive tasks |
| **AgentMail** | YC-backed | Email inboxes for AI agents as identity primitives | Agent communication/identity |
| **Sponge Wallet** | YC W26, ex-Stripe | Agent wallets with spending controls | Agent financial autonomy |
| **traces.com** | @tracesdotcom | Community platform for sharing agent execution traces | Observability and learning |
| **IronCurtain** | OSS | Prevention-first agent safety (gold standard) | Security model reference |
| **Hyperbrowser** | @hyperbrowser | Cloud browser-as-a-service with MCP interface | Browser infra for agent testing |
| **GitMCP** | @idosal1 | Turns any GitHub repo into remote MCP endpoint | Zero-install doc context |

### MCP Servers (Most Relevant for Orchestration)

| Server | Tokens | Use Case |
|--------|--------|----------|
| Chrome DevTools MCP | ~18K | E2E testing gate (critical for L-Thread) |
| GitHub MCP | ~23K | PR management (but `gh` CLI is zero-cost alternative per steipete) |
| Playwright MCP | ~12K | Browser automation (12K+ GitHub stars) |
| Filesystem MCP | ~2K | File operations |
| Sequential Thinking | ~1K | Reasoning chains |
| Blender MCP | varies | Creative tool integration (socket-bridge pattern) |

---

## 3. Must-Follow Accounts (Top 20)

| # | Handle | Why |
|---|--------|-----|
| 1 | @badlogicgames | Pi Agent creator — every decision he makes affects your harness |
| 2 | @nicopreme | Building THE multi-agent layer for Pi — pi-messenger, pi-subagents, pi-mcp-adapter |
| 3 | @steipete | OpenClaw creator, now at OpenAI — strongest signal on agent direction |
| 4 | @bcherny | Claude Code lead — defines what CC can/can't do natively |
| 5 | @GeoffreyHuntley | Ralph Loop, back pressure, "context = malloc without free" |
| 6 | @dotta | Paperclip orchestration, following list IS the agent space map |
| 7 | @opencode | Main OSS coding agent competitor, architectural reference |
| 8 | @claude_code | Community patterns, new features, ecosystem growth |
| 9 | @koylanai | Context engineering — the 2026 bottleneck is context, not capability |
| 10 | @Letta_AI | Stateful agents with tiered memory — pattern to adopt |
| 11 | @DSPyOSS | Prompt optimization that could 6-20% improve orchestrator quality |
| 12 | @swarms_corp | Topology patterns for scaling beyond 5 agents |
| 13 | @nummanali | OpenSkills, AGENTS.md, Agent-Native SDLC pipeline |
| 14 | @dmwlff | Claude Code internals, upcoming features |
| 15 | @morphllm | Speed layer for coding agents — Fast Apply + WarpGrep |
| 16 | @sidahuj | MCP patterns (Blender/Ableton), cross-tool orchestration |
| 17 | @idosal1 | GitMCP, MCP-UI — MCP ecosystem tools |
| 18 | @leodido | Agent security — "agents think around security tools" |
| 19 | @Voxyz_ai | Running a real business with 6 agents for $8/month |
| 20 | @julesagent | Google's agent — Critic-Augmented Generation pattern |

---

## 4. Hidden Gems (Under 5K Followers)

| Handle | Followers | Why They Matter |
|--------|-----------|----------------|
| @stoneforge_ai | 60 | Open-source dashboard for orchestrating AI coding agents — earliest stage but exact problem |
| @benjaminshafii | 1.4K | Building notate.so / OpenWork — desktop GUI wrapping OpenCode, alternative to Cowork |
| @agenticasdk | 1.9K | Agentica framework — TypeScript compiler auto-extracts function schemas, anti-framework bet |
| @StartClaw | 1.3K | Deploy OpenClaw in 60 seconds — one-click agent deployment |
| @typedotcom | 284 | "Agent-native team chat" — agents as first-class chat participants (unfilled gap) |
| @tracesdotcom | 413 | Share and discover agent traces — observability as community |
| @emergentvibe | 1.6K | "Agent whisperer" — prompt craft and agent behavior shaping |
| @morphllm | 2.2K | Ultra-fast models for coding agents — Fast Apply 10,500 tok/s |
| @dhruvbhatia0 | 422 | Core contributor to MorphLLM, ex-Arch/Neovim |
| @totheagi | 1.1K | Working on AI agents — early-stage but active |
| @thomasmustier | 266 | Bringing AI agents to freight — non-obvious vertical application |
| @sponge_wallet | 1.7K | YC W26, ex-Stripe — agent wallets with spending controls |
| @openforage | 1.9K | Agentic strategies for institutional yields — agent-managed DeFi |

---

## 5. Cross-Reference Map

```
FOUNDATIONS
    Pi Agent (Mario Zechner) ──powers──> OpenClaw (steipete)
                                            ├── Moltbook (agent social network)
                                            ├── Moltlaunch (agent marketplace)
                                            ├── Clawnch (agent token economy)
                                            └── StartClaw (one-click deploy)

    Pi Agent ──extensions by──> nicopreme
                                  ├── pi-messenger (multi-agent comms)
                                  ├── pi-subagents (agent delegation)
                                  ├── pi-mcp-adapter (MCP bridge)
                                  └── pi-foreground-chains (pipelines)

    Pi Agent ──community forks──> oh-my-pi (can1357)
                                  Overstory (cross-runtime)
                                  pi-collaborating-agents

CLAUDE CODE ORBIT
    Anthropic ── bcherny (CC lead)
              ── dmwlff (CC team)
              ── JacksonKernion (finetuning)
              ── k_neklyudov (research)
              └── claude_code (community)

THOUGHT LEADERS
    GeoffreyHuntley ──Ralph Loop──> inspired Gas Town (Yegge)
                                    formalized by Anthropic (ralph-wiggum plugin)
                     ──built──> Amp (Sourcegraph)

    steipete ──created──> OpenClaw
             ──built──> claude-code-mcp, Peekaboo, oracle
             ──joined──> OpenAI (Feb 2026)
             ──collaborates──> Armin Ronacher (mitsuhiko)

    dotta ──building──> Paperclip (management plane)
          ──endorses──> Pi Agent as "most interesting coding agent"
          ──co-founded──> Forgotten Runes (to AI pipeline)

OSS CODING AGENTS
    OpenCode ── RhysSullivan, iamdavidhill
    Pi Agent ── badlogicgames, nicopreme
    Jules ── Google Labs
    Amp ── Sourcegraph / GeoffreyHuntley

FRAMEWORKS
    Swarms ── swarms_corp (scale patterns)
    DSPy ── Stanford/Databricks (optimization)
    LangGraph ── LangChain / Vtrivedy10 (production workflows)
    Letta ── Letta_AI (stateful memory)

PROTOCOLS (all converging under Linux Foundation)
    MCP (vertical) + A2A (horizontal) + x402 (payments) + ERC-8004 (identity)
    ├── sidahuj (Blender/Ableton MCP)
    ├── idosal1 (GitMCP, MCP-UI)
    ├── shafu0x (x402 tooling)
    └── hyperbrowser (browser MCP)
```

---

*Compiled from 19 parallel research agents analyzing 107 accounts from @dotta's X following list. March 2026.*
