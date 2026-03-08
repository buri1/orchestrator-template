# Knowledge Catalogue

> A categorized reference of all tools, frameworks, platforms, practitioners, articles, talks, and posts analyzed during research.

**Last updated:** 2026-03-08
**Total entries:** 202 (104 tools, 7 practitioners, 81 reference docs, 0 articles, 10 talks, 0 posts)
**Templates:** [Tool](./_TEMPLATE.md) | [Practitioner](./_TEMPLATE-PRACTITIONER.md) | [Article](./_TEMPLATE-ARTICLE.md) | [Talk](./_TEMPLATE-TALK.md) | [Post](./_TEMPLATE-POST.md)

---

## Quick Reference — Top Tier (8+ Relevance)

| Tool | Category | Relevance | Verdict |
|------|----------|-----------|---------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | ⚙️ Harness | 9/10 | Primary harness — SDK, Agent Teams, 18 hooks, subagents |
| [Oh-My-Pi](./agent-harnesses/pi/oh-my-pi.md) | ⚙️ Harness | 9/10 | Pi fork with worktree isolation, hash state, model routing |
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 🎛️ Orchestration | 9/10 | The 70/30 deterministic/LLM blueprint pattern |
| [Overstory](./agent-harnesses/overstory.md) | ⚙️ Harness | 9/10 | Validates our tmux+worktree+SQLite arch; AgentRuntime adapter + 4-tier merge queue |
| [AGENTS.md](./agent-protocols/agents-md.md) | 🔗 Protocol | 9/10 | Convention file for agent capabilities; 60K+ repos; adopt today |
| [pi-side-agents](./agent-harnesses/pi/pi-side-agents.md) | ⚙️ Pi | 9/10 | Independently arrived at our tmux+worktree pattern; cleanest migration target |
| [ccusage](./observability/ccusage.md) | 🔍 Observability | 9/10 | Zero-install Claude Max usage tracking; highest-ROI tool in catalogue |
| [Pi Agent](./agent-harnesses/pi/pi-agent.md) | ⚙️ Harness | 8/10 | Primary Day 60+ harness candidate |
| [Inngest](./orchestration-platforms/inngest.md) | 🎛️ Orchestration | 8/10 | TypeScript-native, deterministic routing default, durable execution — most aligned framework |
| [Gas Town](./orchestration-platforms/gas-town.md) | 🎛️ Orchestration | 8/10 | Yegge's actor model; git worktree isolation + bead tracking are transferable |
| [A2A Protocol](./agent-protocols/a2a-protocol.md) | 🔗 Protocol | 8/10 | Google's de facto standard for agent-to-agent communication; 22K stars |
| [Graphite](./code-intelligence/graphite.md) | 🧬 Code Intel | 8/10 | Stack-aware merge queue solves our 19-20% conflict rate; acquired by Cursor for >$290M |
| [Langfuse](./observability/langfuse.md) | 🔍 Observability | 8/10 | Self-hosted LLM observability for gov client trust artifacts |
| [LiteLLM](./infrastructure/litellm.md) | 🏗️ Infrastructure | 8/10 | Unified API proxy addressing 378x pricing spread; deploy as model router |
| [Trigger.dev](./infrastructure/trigger-dev.md) | 🏗️ Infrastructure | 8/10 | TypeScript-native durable execution; strongest tmux crash recovery replacement |
| [oh-my-claudecode](./agent-harnesses/oh-my-claudecode.md) | ⚙️ Harness | 8/10 | Closest competitor; same stack; steal model routing + staged pipeline |
| [Superpowers](./agent-harnesses/superpowers.md) | ⚙️ Harness | 8/10 | obra's TDD enforcement + two-stage review; adopt patterns immediately |
| [pi-mcp-adapter](./agent-harnesses/pi/pi-mcp-adapter.md) | ⚙️ Pi | 8/10 | 50-100x token reduction via single proxy tool; mandatory for Pi+MCP |
| [pi-agent-teams](./agent-harnesses/pi/pi-agent-teams.md) | ⚙️ Pi | 8/10 | Most feature-complete Pi coordination: dependency tasks, quality gates, auto-claim |
| [pi-interactive-shell](./agent-harnesses/pi/pi-interactive-shell.md) | ⚙️ Pi | 8/10 | PTY emulation eliminates tmux dependency; three autonomy modes; most-starred Pi ext |

---

## Categories

### 🎛️ Orchestration Frameworks
Multi-agent coordination, task routing, governance, business orchestration.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 9/10 | 70/30 deterministic/LLM split — the blueprint pattern for production agent systems |
| [Inngest](./orchestration-platforms/inngest.md) | 8/10 | TypeScript-native, deterministic routing default, durable execution — most architecturally aligned |
| [Gas Town](./orchestration-platforms/gas-town.md) | 8/10 | Yegge's actor model; git worktree isolation and bead-based work tracking |
| [Temporal](./orchestration-platforms/temporal.md) | 7/10 | Gold standard durable execution; workflow=deterministic/activity=agent maps to our 70/30 |
| [Relay App](./orchestration-platforms/relay-app.md) | 7/10 | TypeScript-native, Claude-first, sub-5ms messaging; tmux replacement candidate |
| [Agent-MCP](./orchestration-platforms/agent-mcp.md) | 6/10 | MCP-as-coordination-protocol; expose create_agent/assign_task as MCP tools |
| [Composio](./orchestration-platforms/composio.md) | 6/10 | Auth/integration layer (not orchestrator); TypeScript SDK for Notion/Airtable connectivity |
| [Shannon](./orchestration-platforms/shannon.md) | 6/10 | Token budget with automatic model fallback — deterministic cost control pattern |
| [ccswarm](./orchestration-platforms/ccswarm.md) | 6/10 | Rust-based Claude Code swarm; validates worktree isolation independently |
| [OpenClaw](./orchestration-platforms/openclaw.md) | 6/10 | 271K stars; lane queuing, context checkpoints, stuck-loop detection |
| [Paperclip](./orchestration-platforms/paperclip.md) | 6/10 | Per-token cost attribution + task-keyed session persistence |
| [LangGraph](./orchestration-platforms/langgraph.md) | 5/10 | Graph-based state machines validate our approach; Python/LangChain lock-in |
| [Swarms](./orchestration-platforms/swarms.md) | 5/10 | Topology taxonomy + AgentRearrange syntax; Python-only, fragile |
| [OpenAI Agents SDK](./orchestration-platforms/openai-agents-sdk.md) | 5/10 | Manager/Handoff two-pattern taxonomy validates our architecture |
| [Conductor](./orchestration-platforms/conductor.md) | 5/10 | Netflix-born heavyweight (31K stars); wrong stack (Java) but good workflow reference |
| [NVIDIA Orchestrator-8B](./orchestration-platforms/nvidia-orchestrator-8b.md) | 5/10 | 8B model beating GPT-5 at orchestration; validates separation-of-concerns |
| [n8n](./orchestration-platforms/n8n.md) | 4/10 | 178K stars; webhook/resilience patterns but not multi-agent native |
| [CrewAI](./orchestration-platforms/crew-ai.md) | 4/10 | Python-only, LLM-heavy role-play paradigm; opposite of deterministic routing |
| [AutoGen](./orchestration-platforms/autogen.md) | 4/10 | 55K stars but conversation-centric + API instability; wrong language |
| [Prefect](./orchestration-platforms/prefect.md) | 4/10 | Python workflow orchestration; infrastructure patterns only |
| [DyLAN](./orchestration-platforms/dylan.md) | 4/10 | Academic "LLM-as-neuron" metaphor; Agent Importance Score concept |
| [HyperAgent](./orchestration-platforms/hyperagent.md) | 3/10 | SWE-Bench research; tiered model assignment is useful cost pattern |
| [Dify](./orchestration-platforms/dify.md) | 3/10 | 131K stars but GUI-first LLM app builder; different problem domain |
| [BridgeMCP](./orchestration-platforms/bridgemcp.md) | 3/10 | Proprietary cloud SaaS; DSGVO incompatible |
| [ElizaOS](./orchestration-platforms/elizaos.md) | 3/10 | Web3/chatbot DNA; Evaluator post-action reflection only |

---

### ⚙️ Agent Harnesses
CLI tools, SDKs, runtimes, and frameworks that execute agent tasks.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | 9/10 | SDK + Agent Teams + 18 hooks + subagents — our primary harness |
| [Overstory](./agent-harnesses/overstory.md) | 9/10 | Validates our tmux+worktree+SQLite arch; AgentRuntime adapter + 4-tier merge queue |
| [oh-my-claudecode](./agent-harnesses/oh-my-claudecode.md) | 8/10 | Same stack (CC + tmux); steal model routing (Haiku/Opus) + staged pipeline |
| [Superpowers](./agent-harnesses/superpowers.md) | 8/10 | obra's 73K stars; TDD enforcement + two-stage review + brainstorm-before-code |
| [agent-browser](./agent-harnesses/agent-browser.md) | 7/10 | 93% context reduction via Snapshot+Refs; drop-in E2E testing candidate |
| [agtx](./agent-harnesses/agtx.md) | 7/10 | Per-phase agent assignment + TOML plugin lifecycle hooks |
| [Bowser](./agent-harnesses/bowser.md) | 7/10 | IndyDevDan's browser automation; YAML user stories + Justfile patterns |
| [CodeMachine-CLI](./agent-harnesses/codemachine-cli.md) | 7/10 | Closest OSS competitor to L-Thread; Sustaina 60K LOC case study |
| [Goose](./agent-harnesses/goose.md) | 7/10 | Block's MCP-first agent; Rust core, custom distributions for federated vision |
| [OpenCode](./agent-harnesses/opencode.md) | 7/10 | Go+TS hybrid, 117K stars, TaskTool, Teams — alternative architecture reference |
| [CodeRabbit](./agent-harnesses/coderabbit.md) | 6/10 | Install today as quality gate for agent-generated PRs |
| [Augment Code](./agent-harnesses/augment-code.md) | 6/10 | Context Engine MCP usable with CC today; $977M valuation, #1 SWE-bench |
| [Mendral](./agent-harnesses/mendral.md) | 6/10 | Docker founders' agent; model tiering (Opus/Sonnet/Haiku) pattern |
| [Roo Code](./agent-harnesses/roo-code.md) | 6/10 | Cline fork with custom modes + MCP support |
| [DSPy](./agent-harnesses/dspy.md) | 5/10 | Declarative paradigm, GEPA optimizer, typed contracts — Phase 3+ |
| [Aider](./agent-harnesses/aider.md) | 5/10 | Repo-map algorithm for context selection; Python-based |
| [Bridle](./agent-harnesses/bridle.md) | 5/10 | Rust-based config manager; profile switching for multi-harness |
| [Cline CLI](./agent-harnesses/cline-cli.md) | 5/10 | 58K stars; MCP auto-config reference |
| [oh-my-opencode](./agent-harnesses/oh-my-opencode.md) | 5/10 | 38K stars; Hashline (content-hash editing) is novel |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | 5/10 | Open-source terminal agent from major lab; Phase 3+ adapter |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | 4/10 | Microsoft's platform play; MCP-by-default validates protocol adoption |
| [Amp Code](./agent-harnesses/amp-code.md) | 4/10 | Proprietary; multi-model sub-agent dispatching (Oracle/Librarian/Painter/Task) |
| [Devin](./agent-harnesses/devin.md) | 4/10 | Proprietary black box; market benchmark only |
| [Gemini CLI](./agent-harnesses/gemini-cli.md) | 4/10 | 96K stars; Google's CC competitor, free tier notable |
| [Manus AI](./agent-harnesses/manus-ai.md) | 4/10 | CodeAct paradigm; acquired by Meta for ~$2-3B |
| [ADAS](./agent-harnesses/adas.md) | 3/10 | ICLR 2025; meta-agent that designs better agents; academic only |
| [Qwen-Agent](./agent-harnesses/qwen-agent.md) | 3/10 | Python/Qwen-coupled; DeepPlanning benchmark |
| [Intercom Fin](./agent-harnesses/intercom-fin.md) | 2/10 | Customer support agent; outcome-based pricing ($0.99/resolution) |

#### Pi Ecosystem Extensions

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Oh-My-Pi](./agent-harnesses/pi/oh-my-pi.md) | 9/10 | Worktree isolation, hash-anchored state, MCP pooling, model routing, LSP feedback |
| [pi-side-agents](./agent-harnesses/pi/pi-side-agents.md) | 9/10 | Independently arrived at tmux+worktree pattern; cleanest migration target |
| [Pi Agent](./agent-harnesses/pi/pi-agent.md) | 8/10 | Token efficiency, `context` event, SDK embeddability — Day 60+ candidate |
| [pi-mcp-adapter](./agent-harnesses/pi/pi-mcp-adapter.md) | 8/10 | 50-100x token reduction via single proxy tool; mandatory for Pi+MCP |
| [pi-agent-teams](./agent-harnesses/pi/pi-agent-teams.md) | 8/10 | Dependency-aware tasks, quality gate hooks, auto-claim |
| [pi-interactive-shell](./agent-harnesses/pi/pi-interactive-shell.md) | 8/10 | PTY emulation eliminates tmux dependency; 287 stars, most-starred Pi ext |
| [Pi Subagents](./agent-harnesses/pi/pi-subagents.md) | 7/10 | Role-based delegation, chain pipelines, observability for Pi |
| [pi-collaborating-agents](./agent-harnesses/pi/pi-collaborating-agents.md) | 7/10 | File reservation pattern (tool-level edit blocking) |
| [pi-foreground-chains](./agent-harnesses/pi/pi-foreground-chains.md) | 7/10 | Scout-Planner-Worker-Reviewer as pure prompt engineering |
| [Pi Messenger](./agent-harnesses/pi/pi-messenger.md) | 6/10 | File-based comms, steering injection, wave execution |
| [pi-web-access](./agent-harnesses/pi/pi-web-access.md) | 6/10 | Smart fallback chains, GitHub clone-not-scrape, zero-config Chrome cookies |
| [pi-agent-scip](./agent-harnesses/pi/pi-agent-scip.md) | 5/10 | Archived (merged into rhubarb-pi); SCIP code intelligence concept |

---

### 🧠 Agent Memory & Context
Memory systems, context retrieval, knowledge stores, RAG platforms.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Context-Gateway](./agent-memory/context-gateway.md) | 7/10 | YC W26; zero-infra Go proxy for Claude Code context compression; trial this week |
| [Beads](./agent-memory/beads.md) | 7/10 | Yegge's zero-infra git-backed task memory with dependency graphs + semantic compaction |
| [Letta / MemGPT](./agent-memory/letta.md) | 6/10 | "LLM-as-OS" self-editing memory; git-based Context Repositories validate approach |
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 6/10 | Consolidation-as-sleep pattern for knowledge compounding |
| [Cognee](./agent-memory/cognee.md) | 5/10 | Knowledge graph memory; Neo4j+vector DB infra conflicts with zero-infra approach |
| [Context7](./agent-memory/context7.md) | 4/10 | MCP server for fresh library docs; 48K stars by Upstash; nice-to-have for workers |
| [Mem0](./agent-memory/mem0.md) | 4/10 | 49K stars but built for SaaS multi-user personalization, not agent-to-agent |
| [Dolt](./agent-memory/dolt.md) | 4/10 | Git-for-data primitive; our JSON-in-git already provides sufficient versioning |
| [Airweave](./agent-memory/airweave.md) | 3/10 | Enterprise retrieval layer; overkill for Phase 1-2 |

---

### 🔗 Agent Protocols
Standards and interoperability specifications for agent communication and trust.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [AGENTS.md](./agent-protocols/agents-md.md) | 9/10 | Convention file for agent capabilities; 18.6K stars, 60K+ repos; adopt today |
| [A2A Protocol](./agent-protocols/a2a-protocol.md) | 8/10 | Google's de facto A2A standard; 22K stars; absorbed ACP; Phase 3-4 for federation |
| [x402](./agent-protocols/x402.md) | 7/10 | Coinbase's HTTP 402 micropayments; most novel payment protocol; Phase 4 |
| [OpenSkills](./agent-protocols/openskills.md) | 7/10 | SKILL.md standard; our .claude/commands/ are 80% compatible; portability play |
| [AAIF](./agent-protocols/aaif.md) | 6/10 | Linux Foundation consortium housing MCP, goose, AGENTS.md — the CNCF of agentic AI |
| [Koylan Skills](./agent-protocols/koylan-skills.md) | 6/10 | Best public reference for context engineering; validates our approach |
| [ACP](./agent-protocols/acp.md) | 5/10 | Dead (archived Aug 2025, merged into A2A); design patterns worth studying |
| [ANP](./agent-protocols/anp.md) | 4/10 | Three-layer architecture; lacks industry backing to compete with A2A |

---

### 💰 Agent Economy
Payment infrastructure, token standards, and financial primitives for autonomous agent transactions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [ERC-8004](./agent-economy/erc-8004.md) | 4/10 | Three-registry trust layer (Identity/Reputation/Validation); mainnet since Jan 2026 |
| [Coinbase Agentic Wallets](./agent-economy/coinbase-agentic-wallets.md) | 4/10 | Most production-ready agent wallet infra; x402 + MCP; regulated public company |
| [MoonPay Agents](./agent-economy/moonpay-agents.md) | 3/10 | Full fiat-to-crypto-to-fiat lifecycle; 17 skills/54 tools; closed-source |

---

### 🧬 Code Intelligence
Semantic code understanding, codebase search, knowledge graphs.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Graphite](./code-intelligence/graphite.md) | 8/10 | Stack-aware merge queue + stacked PRs; solves 19-20% conflict rate; Anthropic investor |

---

### 🔍 Observability & Debugging
Tracing, monitoring, failure analysis, cost tracking.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [ccusage](./observability/ccusage.md) | 9/10 | Zero-install, TypeScript-native Claude Max usage tracking; highest-ROI tool |
| [Langfuse](./observability/langfuse.md) | 8/10 | Self-hosted LLM observability for gov client trust artifacts; 22.8K stars |
| [AgentRR](./observability/agentrr.md) | 6/10 | Research paper; check functions as deterministic validators map to 70/30 split |
| [Arize Phoenix](./observability/arize-phoenix.md) | 6/10 | Redundant given Langfuse; Python-first; study evaluation framework only |
| [CodexBar](./observability/codexbar.md) | 3/10 | macOS menu bar for Claude Max limit visibility; by PSPDFKit founder |
| [Assail](./observability/assail.md) | 3/10 | Pre-seed security assessment; 9 stars; watch, don't use |

---

### 🏗️ Infrastructure
Sandboxes, hosting, compute, model routing.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [LiteLLM](./infrastructure/litellm.md) | 8/10 | Unified API proxy for 100+ providers; deploy for cost visibility + model routing |
| [Trigger.dev](./infrastructure/trigger-dev.md) | 8/10 | TypeScript-native durable execution; strongest tmux crash recovery replacement |
| [MorphLLM](./infrastructure/morphllm.md) | 7/10 | Context compression; value diminished by Claude Max flat rate |
| [DBOS](./infrastructure/dbos.md) | 7/10 | Postgres-backed durable workflows; Stonebraker + Zaharia; Phase 3 crash recovery |
| [Daytona](./infrastructure/daytona.md) | 6/10 | 63K stars; most popular sandbox; AGPL license friction |
| [E2B](./infrastructure/e2b.md) | 5/10 | 88% Fortune 100 adoption; Apache-2.0; Phase 3+ sandbox |
| [Hyperbrowser](./infrastructure/hyperbrowser.md) | 4/10 | Cloud browser infra; two-tier action model (deterministic-first, AI-fallback) |

---

### 🖥️ Developer GUI / IDE
Desktop/web apps for managing agent sessions, IDE extensions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Vibe Kanban](./developer-gui/vibe-kanban.md) | 5/10 | 22.6K stars; validates git worktree isolation; human-operated not autonomous |
| [Factory IDE](./developer-gui/factory-ide.md) | 4/10 | Validates autonomous agent thesis at enterprise scale; Droid specialization |
| [Cursor](./developer-gui/cursor.md) | 3/10 | $29.3B gorilla; Automations (trigger-based agents) worth watching |
| [Jean](./developer-gui/jean.md) | 3/10 | Execution modes (Plan/Build/Yolo) concept |
| [T3 Code](./developer-gui/t3code.md) | 2/10 | Market signal for GUI demand, but architecturally irrelevant |

---

### 👤 Practitioners
Key people in the AI agent space — their workflows, philosophies, and systems.

| Practitioner | Focus Area | Key Insight |
|-------------|------------|-------------|
| [Elvis Sun](./practitioners/elvis-sun.md) | Orchestrator-Worker Swarm | Context separation + deterministic monitoring = compounding intelligence |
| [IndyDevDan](./practitioners/indydevdan.md) | Pi Ecosystem, YouTube | "Customization as moat" — 80/20 Claude Code/Pi portfolio |
| [Steve Yegge](./practitioners/steve-yegge.md) | Gas Town, Wasteland Thesis | 8-stage developer evolution, federation scaling, Absorption Problem |
| [Steipete](./practitioners/steipete.md) | OpenClaw, Multi-Agent | CLI-first, blast radius scaling, Oracle cross-model consultation |
| [Geoffrey Huntley](./practitioners/geoffrey-huntley.md) | Specs-Driven Dev | Ralph Wiggum loop, back pressure hierarchy, kill polluted contexts |
| [Mario Zechner](./practitioners/mario-zechner.md) | Pi Agent Creator | Minimalism thesis — 200-token advantage, "bash is all you need" |
| [Dotta](./practitioners/dotta.md) | Crypto→Agents, Paperclip | Agent org charts with budgets, heartbeats, governance |

---

### 📚 Reference Documents
Internal syntheses, landscape overviews, strategy documents, and architecture blueprints.

#### Landscape & Synthesis

| Document | Key Insight |
|----------|-------------|
| [Phase 1 Landscape Overview](./reference/phase1-landscape-overview.md) | Meta-synthesis: 30 agents, 70+ docs, 10 universal laws |
| [Phase 2 Landscape Overview](./reference/phase2-landscape-overview.md) | 15 universal findings from 104 documents and 67 agents |
| [Phase 1 Synth: Alternative Harnesses](./reference/phase1-synth-alternative-harnesses.md) | Seven harness suitability verdicts |
| [Phase 1 Synth: Deep Dives](./reference/phase1-synth-deep-dives.md) | Stripe + Elvis Sun + framework verdicts + YC signals |
| [Phase 1 Synth: Pi Ecosystem](./reference/phase1-synth-pi-ecosystem.md) | Pi's 5 structural advantages, 50-80 extensions, 8 production patterns |
| [Phase 1 Synth: Tools Landscape](./reference/phase1-synth-tools-landscape.md) | Six Tier-1 tools, six-layer memory architecture, deployment stack |
| [Phase 1 Synth: Vision Strategy](./reference/phase1-synth-vision-strategy.md) | Seven universal principles, build-vs-hybrid verdict |
| [Dotta Network Intelligence Map](./reference/dotta-network-intelligence-map.md) | 107 X accounts analyzed, 10 universal orchestration laws |
| [Agentic Engineering Landscape](./reference/agentic-engineering-landscape.md) | Vibe coding → agentic engineering transition + 28 builder profiles |

#### Architecture & Strategy

| Document | Key Insight |
|----------|-------------|
| [Master Blueprint](./reference/master-blueprint.md) | Federated + thin meta-layer; 70/30 deterministic/LLM split |
| [Deterministic/LLM Boundary](./reference/deterministic-llm-boundary.md) | Complete component classification with 5 production system evidence |
| [Build Strategy Analysis](./reference/build-strategy-analysis.md) | Thin shared layer → grow by absorption → informed rebuild |
| [Build vs Buy Strategy](./reference/build-vs-buy-strategy.md) | "Harness over framework" thesis; four case studies |
| [Multi-Business Control Plane](./reference/multi-business-control-plane.md) | Federated hub-and-spoke for 5 business lines |
| [Finance Agent Domain Module](./reference/finance-agent-domain-module.md) | Finance Agent as domain OS; 4-step migration path |
| [Existing System Patterns](./reference/existing-system-patterns.md) | 11 shared primitives between Finance Agent and Orchestrator |
| [Business Layer Systems](./reference/business-layer-systems.md) | 4 practitioner systems; context separation as core principle |
| [Orchestrator Topology Patterns](./reference/orchestrator-topology-patterns.md) | 6 topologies, 8 anti-patterns, scaling tiers |
| [Orchestration Patterns 2026](./reference/orchestration-patterns-2026.md) | Duvo, KRNL, verifiable orchestration, error recovery |
| [Multi-Agent Frameworks Landscape](./reference/multi-agent-frameworks-landscape.md) | Swarms, DSPy, Agentica, LangGraph, Letta — 7 portable patterns |
| [Multi-Agent Orchestration Comparison](./reference/multi-agent-orchestration-comparison.md) | Gas Town vs L-Thread vs Pi three-way; five universal laws |
| [Workflow Engines](./reference/workflow-engines.md) | 9 engines; JSON → SQLite → cloud durable three-tier |

#### Harness & Tool Analysis

| Document | Key Insight |
|----------|-------------|
| [Harness Comparison Matrix](./reference/harness-comparison-matrix.md) | 10 harnesses scored across 20 dimensions |
| [OSS Harness Landscape](./reference/oss-harness-landscape.md) | 40+ OSS agents consolidated; pattern convergence |
| [Claude Code Multi-Agent Architecture](./reference/claude-code-multiagent-architecture.md) | Agent Teams, 18-event hooks, SDK, native vs custom gaps |
| [Harness-Agnostic Tools](./reference/harness-agnostic-tools.md) | MCP bridges, Overstory, Vibe Kanban, cross-runtime tools |
| [Hook Event System Comparison](./reference/hook-event-system-comparison.md) | Pi hooks vs Claude Code hooks vs Gas Town actor model |
| [MCP Ecosystem Orchestration](./reference/mcp-ecosystem-orchestration.md) | MCP maturity (97M+ monthly SDK downloads), key servers |
| [Model Agnosticism Strategy](./reference/model-agnosticism-strategy.md) | 378x pricing spread; 3-8x cost savings from model routing |
| [Durability Analysis](./reference/durability-analysis.md) | Pi LOW risk, CC MEDIUM, GT HIGH; hedging is rational |
| [Corporate Coding Agents](./reference/corporate-coding-agents.md) | Google Jules, Amp Code; 13 patterns worth stealing |
| [Agent Skills Systems](./reference/agent-skills-systems.md) | SKILL.md standard, 11 extractable patterns |
| [Agent Communication Protocols](./reference/agent-communication-protocols.md) | A2A, MCP, ACP, ANP, WebMCP protocol stack |

#### Pi Agent Deep Dives

| Document | Key Insight |
|----------|-------------|
| [Pi Agent Architecture Reference](./reference/pi-agent-architecture-reference.md) | 200-token system prompt, 4-tool philosophy, extension composability |
| [Pi SDK Internals](./reference/pi-sdk-internals.md) | Four-layer SDK stack, createAgentSession factory, RPC protocol |
| [Pi MCP Adapter](./reference/pi-mcp-adapter.md) | 50-100x token reduction; lazy lifecycle; direct-tool escape hatch |
| [Pi Orchestrator Blueprint](./reference/pi-orchestrator-blueprint.md) | 8-layer extension stack; 3-phase/8-week implementation |
| [Pi Future Direction](./reference/pi-future-direction.md) | Zechner's minimalism; bus factor HIGH; competition CRITICAL |
| [Pi Production Systems](./reference/pi-production-systems.md) | 12+ orchestration systems surveyed; five universal primitives |
| [Pi Extensions Map](./reference/pi-extensions-map.md) | Pi Agent extension ecosystem and integration points |
| [Pi vs Claude Code Decision](./reference/pi-vs-claude-code-decision.md) | Head-to-head comparison; hybrid architecture decision |
| [L-Thread → Pi Migration Guide](./reference/lthread-pi-migration-guide.md) | 16/16 pattern mapping (0 blockers); 8-week migration path |
| [Agent Automation & Deployment](./reference/agent-automation-deployment.md) | Headless execution, Trigger.dev, sandboxing, tmux patterns |

#### Yegge / Gas Town

| Document | Key Insight |
|----------|-------------|
| [Yegge Gas Town Thesis Analysis](./reference/yegge-gas-town-thesis-analysis.md) | Gas Town vision, philosophy comparison, actionable insights |
| [Gas Town Complexity Critique](./reference/gas-town-complexity-critique.md) | 189K LOC bloat; 43:1 code reduction vs Pi extensions |
| [Gas Town vs Pi Master Verdict](./reference/gas-town-vs-pi-master-verdict.md) | Final three-way comparison; Pi wins on economics and durability |

#### Economics & Business

| Document | Key Insight |
|----------|-------------|
| [Scaling Economics](./reference/scaling-economics.md) | Coordination overhead exponent 1.724; three scaling regimes |
| [Agent Delivery Economics](./reference/agent-delivery-economics.md) | 60-90% margins on $10K contracts; $6/day token average |
| [Autonomous Revenue Case Studies](./reference/autonomous-revenue-case-studies.md) | 8 solo operator cases; revenue model taxonomy |
| [Claude Max Economics](./reference/claude-max-economics.md) | 18-36x subscription advantage; 5-hour rolling window |
| [Phase 2 Revenue Economics](./reference/phase2-revenue-economics.md) | Fully-loaded P&L; regulatory timeline; 12-month business plan |
| [Pricing & Trust Architectures](./reference/pricing-trust-architectures.md) | Hybrid pricing winning; EU AI Act Aug 2026 |
| [Agent Scale Production Examples](./reference/agent-scale-production-examples.md) | Gas Town 50 agents; enabling technologies for next 10x |
| [Agent Marketplace Economy](./reference/agent-marketplace-economy.md) | ERC-8004, x402 payments, Moltlaunch marketplace |
| [Agentic Finance Patterns](./reference/agentic-finance-patterns.md) | x402 payments, agentic wallets, autonomous trading |
| [SaaS Factory Infrastructure](./reference/saas-factory-infrastructure.md) | Turborepo monorepo, MakerKit, $12 launch cost |
| [Lead Gen Pipeline Architecture](./reference/lead-gen-pipeline-architecture.md) | 6-stage pipeline for DACH; EUR 171K Year 1 projection |
| [Hormozi Framework Encoding](./reference/hormozi-framework-encoding.md) | 7-step Grand Slam Offer for marketing agents |
| [Notion as Agent Backend](./reference/notion-as-agent-backend.md) | 22-database hub-and-spoke; API limits; MCP integration |

#### Quality, Reliability & Security

| Document | Key Insight |
|----------|-------------|
| [Human Review Bottleneck](./reference/human-review-bottleneck.md) | 5-6 PRs/day cognitive ceiling; AI PRs take 4.6x longer |
| [Code Quality Failure Taxonomy](./reference/code-quality-failure-taxonomy.md) | AI code 1.7x more issues; 17.2x multi-agent error amplification |
| [Merge Conflicts at Scale](./reference/merge-conflicts-at-scale.md) | 19-20% conflict rate; N(N-1)/2 surface; Graphite queues |
| [Infrastructure Breaking Points](./reference/infrastructure-breaking-points.md) | API rate limits at 10-20 agents; ranked failure cascade |
| [Autonomy Horizon & Self-Healing](./reference/autonomy-horizon-self-healing.md) | METR autonomy doubles/7mo; Agent Drift taxonomy |
| [Agent Security Models](./reference/agent-security-models.md) | OWASP Agentic Top 10; permission models; sandboxing |
| [Browser & E2E Testing Tools](./reference/browser-e2e-testing-tools.md) | agent-browser (93% context reduction); 11-tool priority order |

#### Knowledge, Memory & Intelligence

| Document | Key Insight |
|----------|-------------|
| [Agent Memory Deep Landscape](./reference/agent-memory-deep-landscape.md) | Letta, Mem0, Cognee, Beads; tiered memory architectures |
| [Knowledge Compounding & Transfer](./reference/knowledge-compounding-transfer.md) | Augment, xgmem, MUSE; post-mortem replay; semantic models |
| [Emergent Intelligence](./reference/emergent-intelligence.md) | MoA +7.6%, adversarial +12.5%; emergence vs aggregation |

#### Observability & Mastery

| Document | Key Insight |
|----------|-------------|
| [Observability & Trust KPIs](./reference/observability-trust-kpis.md) | DORA+SPACE+Judgment SLO framework; three-tier monitoring |
| [Observability Trust Infrastructure](./reference/observability-trust-infrastructure.md) | Langfuse, Arize Phoenix, ccusage; trust artifacts for gov clients |
| [Top Practitioner Workflows](./reference/top-practitioner-workflows.md) | Elvis Sun, IndyDevDan, Steipete, Yegge workflow synthesis |
| [Phase 2 Mastery Frontier](./reference/phase2-mastery-frontier.md) | Top 0.1% characteristics; 14-20 week mastery path |

#### Frontier Research

| Document | Key Insight |
|----------|-------------|
| [Phase 2 Bleeding Edge & Meta-Agency](./reference/phase2-bleeding-edge-meta-agency.md) | ADAS, MetaAgent, MAS-ZERO; NVIDIA Orchestrator-8B |
| [Phase 2 Scaling Bottlenecks](./reference/phase2-scaling-bottlenecks.md) | Coordination exponent 1.724; U-shaped cost curve |
| [Phase 2 Vision Feasibility](./reference/phase2-vision-feasibility.md) | Proven vs theoretical; trust gap as binding constraint |
| [Nous Research Ecosystem](./reference/nous-research-ecosystem.md) | Hermes Agent, Atropos RL, Psyche; Web3 agent protocols |
| [YC W2026 Agent Companies](./reference/yc-w2026-agent-companies.md) | 18+ YC W26 batch; Compresr Context-Gateway is critical |

#### Compliance & Legal

| Document | Key Insight |
|----------|-------------|
| [Legal Compliance Framework](./reference/legal-compliance-framework.md) | EU PLD, DSGVO, insurance bifurcation, liability framework |
| [German Government Compliance](./reference/german-government-compliance.md) | DSGVO, BSI IT-Grundschutz, BITV 2.0, EVB-IT contracts |
| [Deterministic Harness Blueprint](./reference/deterministic-harness-blueprint.md) | check-agents.sh, state machine routing, health monitoring |

---

## 🎤 Recent Talks & Videos

| Title | Speaker | Date | Relevance | Key Insight |
|-------|---------|------|-----------|-------------|
| [Fireside Chat: Claude Code, AI Development](./talks/2026-03/sid-anthropic-fireside-chat-claude-code.md) | Sid (Anthropic) | 2026-03 | 9/10 | Skills + MCP = everything; adversarial review agents; plan mode as highest-ROI practice; quick remediation > proactive prevention |
| [Lightning Talk: Building Production Agents — Lessons from Cleric](./talks/2026-03/aaron-cleric-building-production-agents.md) | Aaron Ahmed (Cleric) | 2026-03-08 | 8/10 | Persist/compound/visible correction loop + ambient learning = the learning agent trifecta |
| [Lightning Talk: Agent Infrastructure Challenges](./talks/2026-03/milan-simgrip-agent-infrastructure-challenges.md) | Milan Williams (Semgrep) | 2026-03-08 | 7/10 | Three practical agent security tips: downscope tokens, hook-based audit logging, deterministic code scanning |
| [Lightning Talk: How to Productionize Sub-Agents for LM Post-Training](./talks/2026-03/fay-productionize-subagents-post-training.md) | Fay (Pinterest) | 2026-03-08 | 7/10 | Sub-agents beat swarms for ML post-training; "Tool Calling 2.0" cuts tokens 50-70%; hot celebrity problem validates coordination overhead concerns |
| [SWEBench Pro — Evolving Coding Agent Benchmarks](./talks/2026-03/swebench-pro-evolving-coding-agent-benchmarks.md) | Jiannis Hood (Scale AI) | 2026-03-08 | 7/10 | Issue resolution is only 25% of SE work; new multi-stage benchmark for understanding, validation, and improvement of real codebases |

| [Lightning Talk: Choosing the Right Model for Coding Agents](./talks/2026-03/ash-choosing-right-model-coding-agents.md) | Ash (Fino Labs) | 2026-03-08 | 5/10 | Deploy open-source models first, fine-tune from inference logs; partition usage across task-specific model instances |
| [Agent Orchestration — Running Multiple Agents at Scale](./talks/2026-03/zach-lloyd-agent-orchestration-at-scale.md) | Zach Lloyd (Warp) | 2026-03-08 | 9/10 | Five cloud orchestration primitives (environments, hosting, tracking, handoff, programmability); Oz as "Vercel for cloud agents" |
| [Evals for Coding Agents — What They Are, Why They Matter](./talks/2026-03/jess-braintrust-evals-for-coding-agents.md) | Jess (BrainTrust) | 2026-03-08 | 8/10 | Four-part eval framework (dataset/task/scorer/experiment); agentic search beats vector search for code bugs — more accurate and cheaper due to "connective tissue" advantage |
| [The Orchestration Stack for Observable, Debuggable, and Durable Agents](./talks/2026-03/neils-orchestration-stack-observable-debuggable-durable-agents.md) | Neils Bentilan (Union / Flyte) | 2026-03-08 | 8/10 | Replay logs + global caching + infrastructure-as-context = self-healing agents; Dragonfly case study: 250K products, 2000+ concurrent runs |

---

| [AI-Driven Development Transformation at Kilo](./talks/2026-03/scott-kilo-ai-driven-dev-transformation.md) | Scott (Kilo) | 2026-03 | 8/10 | Trust Ladder (autocomplete->chat->agent->orchestration); anti-collaboration + N=1 ownership; 80% thinking / 20% coding shift; model routing by task type |
| [Infrastructure for Coding Agents at Scale — MCPs and Beyond](./talks/2026-03/infrastructure-for-coding-agents-at-scale.md) | Ankit Mathur (Databricks) | 2026-03-08 | 8/10 | "Agent sprawl" solved via Coding Agent Gateway; MCP token governance; code review = #1 bottleneck at 2K+ engineers |
| [General Purpose Agents — The Agent Harness and Tool Runtime](./talks/2026-03/general-purpose-agents-harness-tool-runtime.md) | Harrison Chase (LangChain) & Sam Partee (Arcade.dev) | 2026-03-08 | 9/10 | Harness + tool runtime = general purpose agent; delegated agent authorization (subset tokens per user/service/action); virtual FS for remote agents; agent identity as emerging paradigm |
| [Community Unconference — Agent Tools, Workflows & Best Practices](./talks/2026-03/community-unconference-agent-tools-workflows.md) | Various (Rob, Raphael, Josh, Yari, Chad, Tevia, Jeremy, Kareem) | 2026-03-08 | 9/10 | Plan.md over plan mode; hooks as enforcement layer; screenshot-based visual QA via Playwright diffs; skills as latent-space priming; three-layer memory; critique-revise loops |
| [RPI to CRISPY — Reliable Process for High-Complexity Brownfield Agent Tasks](./talks/2026-03/dex-rpi-crispy-brownfield-agents.md) | Dex / James (HumanLayer) | 2026-03-08 | 9/10 | RPI evolved to 7-phase CRISPY; instruction budget ceiling ~150-200; "don't read plans, read code"; vertical plans beat horizontal; design discussion = highest-leverage review point |

---

## 📝 Recent Articles

| Title | Author | Date | Relevance | Key Insight |
|-------|--------|------|-----------|-------------|
| *No entries yet* | | | | |

---

## 🐦 Notable Posts

| Author | Date | Key Insight |
|--------|------|-------------|
| *No entries yet* | | |

---

## How to Add New Entries

| Content Type | Command | Template |
|-------------|---------|----------|
| Tool/Framework | `/tool-catalogue <repo-url>` | `_TEMPLATE.md` |
| Practitioner | Manual (use `_TEMPLATE-PRACTITIONER.md`) | `_TEMPLATE-PRACTITIONER.md` |
| Talk / YouTube Video | `/ingest-talk <youtube-url>` | `_TEMPLATE-TALK.md` |
| Blog Post / Article | `/ingest-article <url>` | `_TEMPLATE-ARTICLE.md` |
| X Post / Thread | `/ingest-post <url>` | `_TEMPLATE-POST.md` |
| Batch from bookmarks | `/ingest-bookmarks` | Auto-routes to appropriate template |
| Reference Document | Manual (convert from research/) | N/A — freeform |

Or manually: copy the appropriate template, fill it in, save to the correct directory, and update this INDEX.
