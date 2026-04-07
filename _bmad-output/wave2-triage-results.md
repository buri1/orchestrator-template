# Wave 2 Triage Results — Tool Extraction Pipeline

> **Generated:** 2026-03-08
> **Input:** 9 Wave 1 agents scanning 81 reference docs
> **Raw extractions:** ~536 total mentions (with heavy duplication)
> **After dedup + filtering:** 139 unique tools

## Exclusions Applied
- **19 existing catalogue entries** (Claude Agent SDK, Copilot SDK, DSPy, OpenAI Codex, OpenCode, Qwen-Agent, Oh-My-Pi, Pi Agent, Pi Messenger, Pi Subagents, ElizaOS, OpenClaw, Paperclip, Stripe Minions, Airweave, Always-On Memory Agent, Factory IDE, Jean, T3 Code)
- **Generic infrastructure** (Calendly, PandaDoc, pnpm, GitHub Actions, tmux, SQLite, Bun, jiti, libGDX, Turborepo, Cloudflare Pages, Vercel, Clerk, Supabase, Neon, Obsidian, Ghostty, Mollie, letterxpress.de, Bonterms, Counterpart Insurance, BOXX Insurance, Clay, Chargebee, Instantly, Landingi, Outscraper, Coolify, Resend, Typst, Stripe — generic billing not Stripe Minions)
- **MCP thin wrappers** (Chrome DevTools MCP, Playwright MCP, Sequential Thinking MCP, GitMCP, Notion MCP Server)
- **Pure research papers/benchmarks** (MAST, ConGra, CVCP, MapCoder, BlueCodeAgent, AgentCoder, CER, SICA, Skill Evolver, Voyager, LATM, PromptBreeder)
- **Well-known models** (DeepSeek V3.2, GLM-5, Kimi K2.5, Hermes 4, NousCoder-14B, Whisper API)
- **Well-known generic dev tools** (Playwright, Grafana, Prometheus, Semgrep, Snyk, Neo4j, ClickHouse, Tree-sitter, gitleaks, Sentry — generic APM, PostHog — generic analytics, Linear — generic PM)
- **Generic cloud/hosting** (Modal, Ollama, vLLM, LM Studio — model serving not orchestration)

---

## Final Deduplicated Tool Table

| # | Tool Name | Category | One-Line Description | Mentioned In (count) | Priority |
|---|-----------|----------|---------------------|----------------------|----------|
| 1 | A2A Protocol (Google) | Protocol | Google's Agent-to-Agent protocol for cross-platform agent communication | 6 | HIGH |
| 2 | ACP (Agent Communication Protocol) | Protocol | Standardized agent-to-agent messaging protocol | 5 | HIGH |
| 3 | Aider | Harness | Terminal-based AI coding assistant with git integration and multi-file editing | 5 | HIGH |
| 4 | agent-browser | Harness | Browser agent with 93% context reduction for web automation | 3 | HIGH |
| 5 | AGENTS.md | Protocol/Standard | Convention file for declaring agent capabilities in repos | 5 | HIGH |
| 6 | Cognee | Memory | Knowledge graph memory layer for agents with structured reasoning | 6 | HIGH |
| 7 | CodeRabbit | Harness | AI code review agent with PR analysis and automated feedback | 7 | HIGH |
| 8 | Cline CLI 2.0 | Harness | VS Code extension / CLI for autonomous coding with multi-model support | 4 | HIGH |
| 9 | Composio | Orchestration | Agent orchestrator with 250+ tool integrations and auth management | 5 | HIGH |
| 10 | Context-Gateway / Compresr | Memory | YC W26; context compression and retrieval gateway for agent memory | 4 | HIGH |
| 11 | CrewAI | Orchestration | Multi-agent orchestration framework with role-based agent teams | 6 | HIGH |
| 12 | Daytona | Infrastructure | Cloud development environment / sandbox for agent execution | 4 | HIGH |
| 13 | Devin | Harness | Autonomous AI software engineer by Cognition Labs | 5 | HIGH |
| 14 | Dolt | Memory/Infra | Git-for-data versioned database; agent state versioning primitive | 4 | HIGH |
| 15 | E2B | Infrastructure | Cloud sandboxed code execution environments for AI agents | 5 | HIGH |
| 16 | Gas Town | Orchestration | Steve Yegge's agent orchestration platform with actor model | 4 | HIGH |
| 17 | Goose | Harness | Block's open-source AI developer agent with extensible MCP tools | 4 | HIGH |
| 18 | Graphite | DevOps | AI-native code review with merge queue, stacking, conflict prevention | 7 | HIGH |
| 19 | Inngest | Orchestration | Event-driven durable workflow engine with AgentKit for AI agents | 5 | HIGH |
| 20 | Langfuse | Observability | Open-source LLM observability, tracing, and evaluation platform | 6 | HIGH |
| 21 | LangGraph | Orchestration | Graph-based multi-agent orchestration from LangChain | 7 | HIGH |
| 22 | Letta / MemGPT | Memory | Stateful agent framework with persistent memory management | 4 | HIGH |
| 23 | LiteLLM | Infrastructure | Unified API proxy for 100+ LLM providers; model routing layer | 5 | HIGH |
| 24 | Mem0 | Memory | Memory layer for AI agents with automatic learning and retrieval | 5 | HIGH |
| 25 | MorphLLM | Infrastructure | Context compression / token optimization for LLM calls | 3 | HIGH |
| 26 | n8n | Orchestration | Open-source workflow automation with AI agent capabilities | 3 | HIGH |
| 27 | Overstory | Harness | Cross-harness agent management layer; harness-agnostic tooling | 4 | HIGH |
| 28 | Roo Code | Harness | AI coding agent (Cline fork) with custom modes and MCP support | 4 | HIGH |
| 29 | Shannon | Orchestration | Multi-agent coordination framework with consensus mechanisms | 3 | HIGH |
| 30 | Swarms | Orchestration | Multi-agent orchestration framework for swarm-based agent systems | 4 | HIGH |
| 31 | Temporal / Temporal.io | Orchestration | Durable execution engine for long-running agent workflows | 5 | HIGH |
| 32 | Trigger.dev | Infrastructure | Open-source background job framework adapted for AI agent execution | 5 | HIGH |
| 33 | x402 | Protocol | HTTP 402 payment protocol for agent-to-agent micropayments | 5 | HIGH |
| 34 | AAIF (Agent AI Framework) | Protocol | Standardized framework for agent interoperability | 4 | MEDIUM |
| 35 | ADAS | Research/Tool | Automated Design of Agentic Systems; meta-agent architecture search | 3 | MEDIUM |
| 36 | AG-UI (Agent-User Interface) | Protocol | Protocol for agent-to-user interface communication | 1 | MEDIUM |
| 37 | Agent Deck | Orchestration | Dashboard/management layer for multi-agent deployments | 1 | MEDIUM |
| 38 | Agent Protocol | Protocol | Open standard for agent communication interfaces | 1 | MEDIUM |
| 39 | Agent-MCP | Orchestration | MCP-based agent coordination layer | 2 | MEDIUM |
| 40 | AgentFS / Turso | Memory | Agent-native filesystem abstraction backed by Turso edge DB | 1 | MEDIUM |
| 41 | AgentMail | Protocol | Email-based agent communication protocol | 1 | MEDIUM |
| 42 | AgentOps | Observability | Agent observability and monitoring platform | 1 | MEDIUM |
| 43 | AgentRR | Memory | Agent replay and recovery system for debugging agent runs | 2 | MEDIUM |
| 44 | Agentica | Orchestration | Multi-agent orchestration framework | 1 | MEDIUM |
| 45 | Agentrooms | Orchestration | Multi-agent collaboration rooms/spaces | 1 | MEDIUM |
| 46 | agtx | Harness | Agent execution framework with terminal management | 3 | MEDIUM |
| 47 | Amazon Bedrock AgentCore | Orchestration | AWS managed service for building and deploying AI agents | 1 | MEDIUM |
| 48 | Amp Code | Harness | Google/Sourcegraph AI coding agent | 3 | MEDIUM |
| 49 | ANP (Agent Network Protocol) | Protocol | Agent networking protocol for discovery and communication | 2 | MEDIUM |
| 50 | Arize Phoenix | Observability | LLM observability and evaluation platform | 2 | MEDIUM |
| 51 | assistant-ui | Developer GUI | React UI components for building AI assistant interfaces | 1 | MEDIUM |
| 52 | Assail | Security | AI agent security assessment tool | 2 | MEDIUM |
| 53 | Atropos | Research/Tool | RL training framework from Nous Research for agent behavior | 1 | MEDIUM |
| 54 | Augment Code / Context Engine | Harness | AI coding agent with proprietary context engine for large codebases | 2 | MEDIUM |
| 55 | AutoGen (Microsoft) | Orchestration | Microsoft's multi-agent conversation framework | 5 | MEDIUM |
| 56 | Beads | Memory | Structured memory unit format for agent knowledge transfer | 3 | MEDIUM |
| 57 | Blaxel | Infrastructure | Agent deployment and hosting platform | 1 | MEDIUM |
| 58 | Blitzy OS | Orchestration | AI-native operating system for agent orchestration | 1 | MEDIUM |
| 59 | BMAD Method | Methodology | Business-driven Multi-Agent Development methodology | 2 | MEDIUM |
| 60 | Bowser | Harness | Browser automation agent | 2 | MEDIUM |
| 61 | BridgeMCP / BridgeMind | Orchestration | MCP bridge for cross-agent context sharing | 2 | MEDIUM |
| 62 | Bridle | Harness | Agent constraint/governance framework | 2 | MEDIUM |
| 63 | ccswarm | Orchestration | Claude Code swarm orchestration tool | 2 | MEDIUM |
| 64 | ccusage | Observability | Claude Code usage tracking and cost monitoring | 2 | MEDIUM |
| 65 | claude-code-action | Harness | GitHub Action for running Claude Code in CI/CD pipelines | 1 | MEDIUM |
| 66 | claude-code-mcp | Harness | MCP server exposing Claude Code as a tool for other agents | 1 | MEDIUM |
| 67 | claude-code-scheduler | Harness | Scheduled task execution for Claude Code agents | 1 | MEDIUM |
| 68 | claude-flow | Orchestration | Multi-agent flow orchestration for Claude Code | 1 | MEDIUM |
| 69 | claude-tasks | Harness | Task management extension for Claude Code | 1 | MEDIUM |
| 70 | claudebox | Harness | Sandboxed Claude Code execution environment | 1 | MEDIUM |
| 71 | CodeMachine-CLI | Harness | CLI tool for automated code generation workflows | 2 | MEDIUM |
| 72 | CodexBar | Observability | Code agent progress bar / execution monitoring | 2 | MEDIUM |
| 73 | Coinbase Agentic Wallets | Finance/Protocol | Wallet infrastructure for autonomous agent transactions | 2 | MEDIUM |
| 74 | Conductor / Conductor.build | Orchestration | Workflow orchestration engine / agent conductor | 2 | MEDIUM |
| 75 | Context7 | Memory | Context management tool for AI development | 2 | MEDIUM |
| 76 | Cursor | Developer GUI | AI-native code editor with multi-model agent support | 5 | MEDIUM |
| 77 | DBOS | Infrastructure | Database-oriented operating system for durable agent execution | 2 | MEDIUM |
| 78 | Decagon | Harness | Enterprise AI agent for customer support | 1 | MEDIUM |
| 79 | Dify.ai | Orchestration | Open-source LLM app development platform with agent workflows | 3 | MEDIUM |
| 80 | dmux | Harness | Terminal multiplexer adapted for multi-agent development | 1 | MEDIUM |
| 81 | Duvo AI | Orchestration | Verifiable orchestration platform for agent pipelines | 1 | MEDIUM |
| 82 | DyLAN | Orchestration | Dynamic LLM-Agent Network for adaptive multi-agent teams | 2 | MEDIUM |
| 83 | ERC-8004 | Protocol | Ethereum standard for agent-to-agent token interactions | 3 | MEDIUM |
| 84 | Falco | Security | Runtime security for containerized agent environments | 1 | MEDIUM |
| 85 | Firecrawl | Infrastructure | Web scraping API designed for LLM/agent consumption | 1 | MEDIUM |
| 86 | Gemini CLI | Harness | Google's CLI for Gemini-based coding agents | 2 | MEDIUM |
| 87 | Google ADK (Agent Development Kit) | Orchestration | Google's SDK for building and orchestrating AI agents | 1 | MEDIUM |
| 88 | Google Jules | Harness | Google's autonomous AI coding agent | 1 | MEDIUM |
| 89 | Graphiti | Memory | Temporal knowledge graph for agent memory by Zep | 1 | MEDIUM |
| 90 | Harmony | Orchestration | Multi-agent harmonization / coordination framework | 1 | MEDIUM |
| 91 | Helicone | Observability | LLM proxy with observability, caching, and rate limiting | 1 | MEDIUM |
| 92 | Hermes Agent | Orchestration | Nous Research's agent framework built on Hermes models | 1 | MEDIUM |
| 93 | HumanLayer | Orchestration | Human-in-the-loop approval layer for autonomous agents | 1 | MEDIUM |
| 94 | HyperAgent | Orchestration | Dynamic multi-agent system for adaptive task execution | 2 | MEDIUM |
| 95 | Hyperbrowser | Infrastructure | Cloud browser infrastructure for AI agent web access | 2 | MEDIUM |
| 96 | Intercom Fin | Harness | AI agent for customer support by Intercom | 2 | MEDIUM |
| 97 | IronCurtain | Security | Security isolation layer for AI agent execution | 1 | MEDIUM |
| 98 | Kilo Code | Harness | AI coding agent (Cline/Roo fork family) | 1 | MEDIUM |
| 99 | Kiro | Developer GUI | AI-native IDE with spec-driven development | 2 | MEDIUM |
| 100 | klaude | Harness | Kagi-powered Claude Code alternative/wrapper | 1 | MEDIUM |
| 101 | Kong AI Gateway | Infrastructure | API gateway with AI-specific features for agent traffic management | 1 | MEDIUM |
| 102 | Koylan Skills / Agent Skills | Methodology | Skill-based agent capability framework (SKILL.md standard) | 3 | MEDIUM |
| 103 | KRNL | Orchestration | Kernel-based verifiable orchestration for agent systems | 1 | MEDIUM |
| 104 | LangSmith | Observability | LangChain's agent tracing, evaluation, and monitoring platform | 1 | MEDIUM |
| 105 | LightRAG | Memory | Lightweight RAG framework for agent knowledge retrieval | 1 | MEDIUM |
| 106 | Manus AI | Harness | Autonomous AI agent for complex multi-step tasks | 3 | MEDIUM |
| 107 | MAS-ZERO | Research/Tool | Zero-shot multi-agent system generation | 1 | MEDIUM |
| 108 | mcp-agent | Orchestration | MCP-native agent orchestration framework | 1 | MEDIUM |
| 109 | MCPay | Protocol | Payment protocol for MCP-based agent tool usage | 1 | MEDIUM |
| 110 | MemoryGraft | Memory | Memory injection/grafting system for agent knowledge | 1 | MEDIUM |
| 111 | Mendral | Harness | AI agent for enterprise workflows | 3 | MEDIUM |
| 112 | MetaAgent | Research/Tool | Meta-learning agent that designs other agents | 1 | MEDIUM |
| 113 | MetaMCP | Orchestration | Meta-layer for managing multiple MCP servers | 1 | MEDIUM |
| 114 | METR | Benchmark/Tool | AI agent evaluation and safety benchmarks | 1 | MEDIUM |
| 115 | Microsoft Agent Framework | Orchestration | Microsoft's enterprise multi-agent framework | 1 | MEDIUM |
| 116 | Moltbook | Marketplace | Agent marketplace / launchpad companion to Moltlaunch | 2 | MEDIUM |
| 117 | Moltlaunch | Marketplace | Agent launch marketplace platform | 1 | MEDIUM |
| 118 | MoonPay Agents | Finance | Crypto on/off-ramp with agent transaction support | 2 | MEDIUM |
| 119 | NVIDIA Orchestrator-8B | Orchestration | Small model fine-tuned specifically for agent orchestration | 2 | MEDIUM |
| 120 | obra/superpowers | Harness | Agent capabilities/superpowers framework | 2 | MEDIUM |
| 121 | oh-my-claudecode | Harness | Claude Code enhancement/extension framework | 2 | MEDIUM |
| 122 | oh-my-opencode | Harness | OpenCode enhancement/extension framework | 2 | MEDIUM |
| 123 | OpenAI Agents SDK | Orchestration | OpenAI's SDK for building multi-agent systems | 2 | MEDIUM |
| 124 | OpenAI Swarm | Orchestration | OpenAI's experimental lightweight multi-agent framework | 1 | MEDIUM |
| 125 | OpenRouter | Infrastructure | Unified API router for multiple LLM providers | 2 | MEDIUM |
| 126 | OpenSkills | Methodology | Open standard for agent skill definitions | 2 | MEDIUM |
| 127 | OpenTelemetry GenAI | Observability | OpenTelemetry extensions for AI/agent observability | 1 | MEDIUM |
| 128 | Pipedream | Infrastructure | Serverless workflow/integration platform with AI agent support | 1 | MEDIUM |
| 129 | PraisonAI | Orchestration | Multi-agent AI framework for automated workflows | 1 | MEDIUM |
| 130 | Prefect | Orchestration | Python workflow orchestration with AI agent task support | 2 | MEDIUM |
| 131 | Psyche | Research/Tool | Decentralized training framework from Nous Research | 1 | MEDIUM |
| 132 | PydanticAI | Harness | Agent framework with Pydantic-based structured outputs | 1 | MEDIUM |
| 133 | Relay.app / AgentWorkforce | Orchestration | Agent workforce management and relay coordination | 2 | MEDIUM |
| 134 | Strands Agents (AWS) | Orchestration | AWS open-source SDK for building AI agents | 1 | MEDIUM |
| 135 | Vibe Kanban | Developer GUI | Kanban board designed for AI agent task management | 3 | MEDIUM |
| 136 | WebMCP | Protocol | Web-based MCP protocol extension for browser agents | 1 | MEDIUM |
| 137 | Windsurf | Developer GUI | AI-native code editor (Codeium) | 1 | MEDIUM |
| 138 | XState | Orchestration | State machine library applicable to agent workflow orchestration | 1 | MEDIUM |
| 139 | xgmem | Memory | Cross-generation memory system for agent knowledge transfer | 1 | MEDIUM |
| 140 | Activepieces | Orchestration | Open-source workflow automation alternative with AI features | 1 | LOW |
| 141 | Agent Flywheel | Methodology | Pattern for self-improving agent systems | 1 | LOW |
| 142 | Agent Trust Protocol | Protocol | Trust verification protocol for agent interactions | 1 | LOW |
| 143 | Agentic Neural Network | Research/Tool | Neural network architecture designed for agentic behavior | 1 | LOW |
| 144 | Agyn | Harness | Autonomous agent framework | 1 | LOW |
| 145 | AOI (Agent Operating Interface) | Protocol | Operating interface standard for agent systems | 1 | LOW |
| 146 | Apify | Infrastructure | Web scraping and automation platform with agent integrations | 1 | LOW |
| 147 | BabyAGI | Orchestration | Lightweight autonomous agent task management system | 1 | LOW |
| 148 | Bankrbot | Finance | Banking-focused AI agent | 1 | LOW |
| 149 | Bifrost | Infrastructure | Model bridge/adapter layer | 1 | LOW |
| 150 | Byreal | Observability | Agent semantic layer / analytics | 1 | LOW |
| 151 | Cardboard / Wideframe | Developer GUI | Wireframing/prototyping tool with AI features | 1 | LOW |
| 152 | Castari | Orchestration | Agent platform / studio | 1 | LOW |
| 153 | Chamber | Orchestration | Agent isolation/environment framework | 1 | LOW |
| 154 | ChatDev | Orchestration | Multi-agent software development simulation | 1 | LOW |
| 155 | Clanker | Finance | Token/agent deployment tool on crypto rails | 1 | LOW |
| 156 | Clash | Infrastructure | LLM conflict resolution / model comparison tool | 1 | LOW |
| 157 | Claude Multi-Agent Quickstart | Orchestration | Reference implementation for Claude multi-agent setups | 1 | LOW |
| 158 | Cloudflare Code Mode | Infrastructure | Cloudflare's AI coding agent feature | 1 | LOW |
| 159 | Codebuff | Harness | AI coding assistant | 1 | LOW |
| 160 | codemap | Harness | Codebase mapping/visualization for agent context | 1 | LOW |
| 161 | Codified Context | Memory | Structured context format for agent consumption | 1 | LOW |
| 162 | Confluent / Kafka (Agent patterns) | Infrastructure | Event streaming for agent communication patterns | 1 | LOW |
| 163 | ContextForge | Memory | Context engineering tool for agent prompts | 1 | LOW |
| 164 | Continue | Harness | Open-source AI code assistant (VS Code/JetBrains) | 2 | LOW |
| 165 | Cosine Genie | Harness | AI coding agent by Cosine | 1 | LOW |
| 166 | Crush | Harness | AI agent tool | 1 | LOW |
| 167 | Cumulus Labs | Orchestration | Agent infrastructure platform | 1 | LOW |
| 168 | DGM | Research/Tool | Dynamic Graph Model for agent systems | 1 | LOW |
| 169 | Droid (Factory.ai) | Harness | Factory.ai's specialized coding agent | 2 | LOW |
| 170 | Emdash | Developer GUI | AI-native writing/development tool | 1 | LOW |
| 171 | Emergent / Vibecodeapp | Developer GUI | Vibe coding app for rapid development | 1 | LOW |
| 172 | Faros AI | Observability | Engineering intelligence platform | 1 | LOW |
| 173 | fast-check | Infrastructure | Property-based testing with AI integration | 1 | LOW |
| 174 | filter-output | Harness | Output filtering tool for agent responses | 1 | LOW |
| 175 | Fintool | Finance | Financial analysis AI agent | 1 | LOW |
| 176 | Flowise | Orchestration | Drag-and-drop AI agent builder | 1 | LOW |
| 177 | gob | Harness | Go-based agent tool | 1 | LOW |
| 178 | gondolin | Harness | Agent development framework | 1 | LOW |
| 179 | Goosetown | Orchestration | Goose-based multi-agent orchestration | 1 | LOW |
| 180 | Greptile | Harness | AI code understanding and search agent | 1 | LOW |
| 181 | gVisor | Security | Container runtime sandbox for agent isolation | 1 | LOW |
| 182 | handoff | Orchestration | Agent-to-agent task handoff protocol/tool | 1 | LOW |
| 183 | healthchecks.io | Observability | Cron/heartbeat monitoring adapted for agent health | 2 | LOW |
| 184 | HormoziGPT | Harness | Alex Hormozi framework-trained AI agent | 1 | LOW |
| 185 | Ink | Developer GUI | AI-native markdown/writing tool | 1 | LOW |
| 186 | Jina Reader | Infrastructure | Web content reader/parser for LLM consumption | 1 | LOW |
| 187 | Laurence | Harness | AI agent tool | 1 | LOW |
| 188 | LinearB | Observability | Engineering metrics platform | 1 | LOW |
| 189 | LLM Council | Orchestration | Multi-model deliberation pattern for agent consensus | 1 | LOW |
| 190 | LLMinus | Infrastructure | Minimal LLM abstraction layer | 1 | LOW |
| 191 | Lobster | Harness | AI coding agent | 1 | LOW |
| 192 | MakerKit | SaaS Infra | SaaS boilerplate with AI agent integration patterns | 1 | LOW |
| 193 | merde.ai | Infrastructure | AI development tool | 1 | LOW |
| 194 | Microsoft MCP Gateway | Infrastructure | Microsoft's gateway for MCP server management | 1 | LOW |
| 195 | Mission Control | Orchestration | Agent fleet management dashboard | 2 | LOW |
| 196 | Mixture-of-Agents / MoA | Research/Tool | Multi-model ensemble pattern (+7.6% accuracy) | 1 | LOW |
| 197 | Modelence | Orchestration | Agent model orchestration platform | 1 | LOW |
| 198 | multi-agent-workflow-kit | Orchestration | Toolkit for building multi-agent workflows | 1 | LOW |
| 199 | neuro-san | Orchestration | Neural-based agent orchestration | 1 | LOW |
| 200 | nono | Harness | Agent tool from Pi ecosystem | 1 | LOW |
| 201 | Notion Custom Agents | Orchestration | Custom AI agents within Notion workspace | 1 | LOW |
| 202 | nsjail | Security | Lightweight process isolation for agent sandboxing | 1 | LOW |
| 203 | OCX | Harness | OpenCode extension framework | 1 | LOW |
| 204 | opencode-workspace | Harness | Multi-workspace support for OpenCode | 1 | LOW |
| 205 | OpenSage | Research/Tool | Open-source agent evaluation framework | 1 | LOW |
| 206 | OpenSpec | Methodology | Spec-driven development tool for agent projects | 1 | LOW |
| 207 | oracle (Pi) | Harness | Pi ecosystem cross-model consultation tool | 1 | LOW |
| 208 | Orthogonal | Harness | AI development tool | 2 | LOW |
| 209 | Ox Security | Security | Software supply chain security with AI features | 1 | LOW |
| 210 | parallel-code | Harness | Parallel code execution framework for agents | 1 | LOW |
| 211 | PatientDesk | Harness | Healthcare-focused AI agent platform | 1 | LOW |
| 212 | Perplexity API | Infrastructure | Search API for agent web access | 1 | LOW |
| 213 | Playbooks.com | Orchestration | Playbook-driven agent orchestration | 1 | LOW |
| 214 | Polymarket | Finance | Prediction market with agent trading support | 1 | LOW |
| 215 | Polytrader | Finance | Multi-exchange trading agent | 1 | LOW |
| 216 | Portkey | Infrastructure | AI gateway with guardrails and routing for agent systems | 1 | LOW |
| 217 | Praetorian MANIFEST | Security | AI security assessment platform | 1 | LOW |
| 218 | Privy | Finance/Protocol | Web3 auth/wallet infrastructure for agent identity | 1 | LOW |
| 219 | Proliferate | Orchestration | Agent proliferation/scaling platform | 1 | LOW |
| 220 | Quoracle | Orchestration | Multi-model oracle/consultation system | 1 | LOW |
| 221 | RamAIn | Harness | AI agent tool | 1 | LOW |
| 222 | Roam-code | Harness | AI coding agent with codebase roaming | 1 | LOW |
| 223 | Ruflo | Orchestration | Agent workflow orchestration tool | 2 | LOW |
| 224 | Sana | Orchestration | Enterprise AI platform | 1 | LOW |
| 225 | SemanticLayer | Observability | Semantic abstraction for agent data access | 1 | LOW |
| 226 | Senpi | Finance | AI trading agent | 1 | LOW |
| 227 | Serena MCP | Harness | Code-aware MCP server for AI development | 1 | LOW |
| 228 | ShipFast | SaaS Infra | SaaS starter kit with AI features | 1 | LOW |
| 229 | SideQuest | Harness | Background task agent for side-quests during development | 1 | LOW |
| 230 | Sierra | Harness | Enterprise conversational AI agent platform | 2 | LOW |
| 231 | Simbian | Security | AI-native security operations agent | 1 | LOW |
| 232 | SkillKit | Methodology | Toolkit for building agent skills | 2 | LOW |
| 233 | spec-kit | Methodology | Specification toolkit for agent projects | 1 | LOW |
| 234 | Speakeasy Dynamic Toolsets | Infrastructure | Dynamic tool generation for agent APIs | 1 | LOW |
| 235 | Sponge Wallet | Finance | Agent-native crypto wallet | 1 | LOW |
| 236 | StarSling | Security | AI security testing / red team tool | 2 | LOW |
| 237 | StateFlow | Orchestration | State machine-based agent workflow engine | 1 | LOW |
| 238 | Stately Studio | Developer GUI | Visual state machine editor (XState companion) | 1 | LOW |
| 239 | Stitch | Orchestration | Agent integration/stitching framework | 1 | LOW |
| 240 | Stripe Agentic Commerce | Finance | Stripe's agent-to-agent commerce protocol | 1 | LOW |
| 241 | Supastarter | SaaS Infra | SaaS starter with AI/agent capabilities | 1 | LOW |
| 242 | Syntropy | Orchestration | Agent coordination/synthesis platform | 1 | LOW |
| 243 | t54 Labs | Research/Tool | Agent research lab tools | 1 | LOW |
| 244 | Tailscale (agent networking) | Infrastructure | VPN/mesh for agent-to-agent secure networking | 1 | LOW |
| 245 | task-factory | Orchestration | Agent task generation and management factory | 1 | LOW |
| 246 | Terminal Use | Harness | Terminal-based AI agent interaction framework | 2 | LOW |
| 247 | Terra Security | Security | AI-powered security agent | 2 | LOW |
| 248 | tmuxwatch | Observability | Tmux session monitoring for agent health checks | 3 | LOW |
| 249 | toolwatch | Observability | Agent tool usage monitoring | 1 | LOW |
| 250 | TradingAgents | Finance | Multi-agent trading system | 1 | LOW |
| 251 | TRIM-KV | Memory | KV cache trimming for efficient agent context | 1 | LOW |
| 252 | TypeBox | Infrastructure | JSON Schema / TypeScript type builder | 1 | LOW |
| 253 | typia | Infrastructure | TypeScript runtime validator with AI integration | 1 | LOW |
| 254 | Veracode | Security | Application security platform with AI code review | 2 | LOW |
| 255 | Verdent AI | Memory | AI memory/knowledge management platform | 1 | LOW |
| 256 | VibeTunnel | Developer GUI | Vibe coding tunnel / development environment | 2 | LOW |
| 257 | VoxYZ | Orchestration | Agent communication / coordination platform | 2 | LOW |
| 258 | Wasteland Protocol | Orchestration | Steve Yegge's protocol for post-vibe-coding agent governance | 2 | LOW |
| 259 | workmux | Harness | Work multiplexer for multi-agent terminal sessions | 1 | LOW |

---

## Pi Ecosystem Extensions (Individual npm Packages)

These are standalone Pi Agent extensions, each warranting its own entry:

| # | Tool Name | Category | One-Line Description | Mentioned In (count) | Priority |
|---|-----------|----------|---------------------|----------------------|----------|
| 260 | pi-mcp-adapter | Harness/Pi | MCP protocol adapter for Pi Agent (50-100x token reduction) | 4 | HIGH |
| 261 | pi-side-agents | Harness/Pi | Side agent spawning for Pi Agent | 3 | MEDIUM |
| 262 | pi-collaborating-agents | Harness/Pi | Multi-agent collaboration framework for Pi | 2 | MEDIUM |
| 263 | pi-agent-teams | Harness/Pi | Team-based agent management for Pi | 1 | MEDIUM |
| 264 | pi-foreground-chains | Harness/Pi | Foreground chain execution for Pi agents | 1 | MEDIUM |
| 265 | pi-web-access | Harness/Pi | Web access capability for Pi agents | 2 | MEDIUM |
| 266 | pi-interactive-shell | Harness/Pi | Interactive shell mode for Pi Agent | 2 | MEDIUM |
| 267 | pi-agent-scip | Harness/Pi | SCIP (Source Code Intelligence) integration for Pi | 1 | MEDIUM |
| 268 | pi-canvas | Harness/Pi | Canvas/visual interface for Pi Agent | 1 | LOW |
| 269 | pi-sketch | Harness/Pi | Sketch/wireframe tool for Pi Agent | 1 | LOW |
| 270 | pi-gui | Harness/Pi | GUI interface for Pi Agent | 1 | LOW |
| 271 | agent-desktop | Harness/Pi | Desktop agent interface for Pi ecosystem | 1 | LOW |
| 272 | pi-mobile | Harness/Pi | Mobile interface for Pi Agent | 1 | LOW |
| 273 | pi-dcp | Harness/Pi | Distributed compute protocol for Pi | 1 | LOW |
| 274 | pi-cost-dashboard | Observability/Pi | Cost tracking dashboard for Pi Agent usage | 1 | LOW |
| 275 | pi-rewind-hook | Harness/Pi | Rewind/undo hook for Pi Agent sessions | 1 | LOW |
| 276 | pi-ssh-remote | Harness/Pi | SSH remote execution for Pi Agent | 1 | LOW |
| 277 | pi-synthetic | Harness/Pi | Synthetic data/test generation for Pi | 1 | LOW |
| 278 | pi-acp | Protocol/Pi | ACP protocol implementation for Pi Agent | 1 | LOW |
| 279 | PiSwarm | Orchestration/Pi | Swarm orchestration for Pi Agent teams | 1 | LOW |
| 280 | pi-hooks | Harness/Pi | Hook system for Pi Agent lifecycle events | 1 | LOW |
| 281 | pi-ds | Harness/Pi | Data science tooling for Pi Agent | 1 | LOW |
| 282 | Pi Agent Rust | Harness/Pi | Rust implementation/port of Pi Agent | 1 | LOW |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **HIGH priority** | 34 |
| **MEDIUM priority** | 106 |
| **LOW priority** | 142 |
| **Total unique tools** | 282 |
| **Pi ecosystem extensions** | 23 |
| **Core tools (non-Pi)** | 259 |

### Category Breakdown (HIGH priority only)

| Category | Tools |
|----------|-------|
| Orchestration | CrewAI, Gas Town, Inngest, LangGraph, n8n, Shannon, Swarms, Temporal, Composio |
| Harness | Aider, agent-browser, CodeRabbit, Cline CLI, Devin, Goose, Overstory, Roo Code |
| Memory | Cognee, Context-Gateway/Compresr, Dolt, Letta/MemGPT, Mem0 |
| Protocol | A2A, ACP, AGENTS.md, x402 |
| Infrastructure | Daytona, E2B, LiteLLM, MorphLLM, Trigger.dev |
| Observability | Langfuse |
| DevOps | Graphite |

### Recommended Wave 3 Approach
- **Wave 3a (HIGH, ~15 agents):** Create entries for all 34 HIGH priority tools — these are the most impactful and well-documented
- **Wave 3b (MEDIUM, ~15 agents):** Create entries for the top ~50 MEDIUM priority tools — focus on those with 2+ mentions
- **Wave 3c (Pi extensions, ~5 agents):** Create entries for the 23 Pi ecosystem extensions
- **Wave 3d (LOW, optional):** Only if time permits, cherry-pick LOW tools that turn out to be hidden champions

**Estimated final catalogue size:** 19 existing + 34 HIGH + 50 MEDIUM + 23 Pi = **~126 tool entries** (conservative), up to **~280+** if all LOWs are included.
