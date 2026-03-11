# Knowledge Catalogue

> A categorized reference of all tools, frameworks, platforms, practitioners, articles, talks, and posts analyzed during research.

**Last updated:** 2026-03-09
**Total entries:** 299 (157 tools, 7 practitioners, 81 reference docs, 29 articles, 11 talks, 17 posts)
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
| [Claude-Sneakpeek](./agent-harnesses/claude-sneakpeek.md) | ⚙️ Harness | 9/10 | Unlocks Claude Code's native swarm mode via binary patching of `tengu_brass_pebble` statsig gate; 1,063 stars |
| [Everything Claude Code](./agent-harnesses/everything-claude-code.md) | ⚙️ Harness | 9/10 | 68.8K stars; 16 agents, 65 skills, 40 commands; hook runtime gating, AgentShield, eval-driven quality gates, cross-harness parity |
| [Pi Agent](./agent-harnesses/pi/pi-agent.md) | ⚙️ Harness | 8/10 | Primary Day 60+ harness candidate |
| [Inngest](./orchestration-platforms/inngest.md) | 🎛️ Orchestration | 8/10 | TypeScript-native, deterministic routing default, durable execution — most aligned framework |
| [Gas Town](./orchestration-platforms/gas-town.md) | 🎛️ Orchestration | 8/10 | Yegge's actor model; git worktree isolation + bead tracking are transferable |
| [Warp / Oz](./orchestration-platforms/warp-oz.md) | 🎛️ Orchestration | 8/10 | "Vercel for cloud agents" — 5 orchestration primitives; harness-agnostic; 26K stars |
| [A2A Protocol](./agent-protocols/a2a-protocol.md) | 🔗 Protocol | 8/10 | Google's de facto standard for agent-to-agent communication; 22K stars |
| [OpenAI Skills](./agent-protocols/openai-skills.md) | 🔗 Protocol | 8/10 | Official Codex skills catalogue; 13.5K stars; skill-creator is best authoring guide; 35 curated + 3 system skills |
| [Semgrep](./code-intelligence/semgrep.md) | 🧬 Code Intel | 8/10 | MCP server makes SAST a native agent tool; 14K stars; zero-cost quality gate for agent code |
| [Graphite](./code-intelligence/graphite.md) | 🧬 Code Intel | 8/10 | Stack-aware merge queue solves our 19-20% conflict rate; acquired by Cursor for >$290M |
| [Langfuse](./observability/langfuse.md) | 🔍 Observability | 8/10 | Self-hosted LLM observability for gov client trust artifacts |
| [LiteLLM](./infrastructure/litellm.md) | 🏗️ Infrastructure | 8/10 | Unified API proxy addressing 378x pricing spread; deploy as model router |
| [Trigger.dev](./infrastructure/trigger-dev.md) | 🏗️ Infrastructure | 8/10 | TypeScript-native durable execution; strongest tmux crash recovery replacement |
| [DCG](./infrastructure/destructive-command-guard.md) | 🏗️ Infrastructure | 8/10 | SIMD-accelerated command guard; PreToolUse hook blocks destructive git/shell ops; 2-min install, sub-ms overhead |
| [Arcade.dev](./infrastructure/arcade-dev.md) | 7/10 | Delegated agent authorization (per-user/per-service/per-action scoped tokens); MCP gateway; Okta pedigree; DSGVO-compatible on-prem |
| [oh-my-claudecode](./agent-harnesses/oh-my-claudecode.md) | ⚙️ Harness | 8/10 | Closest competitor; same stack; steal model routing + staged pipeline |
| [Superpowers](./agent-harnesses/superpowers.md) | ⚙️ Harness | 8/10 | obra's TDD enforcement + two-stage review; adopt patterns immediately |
| [Broomie](./agent-harnesses/broomie.md) | ⚙️ Harness | 8/10 | Worktree-per-agent + status dashboard (working/blocked/help) + auto merge-to-PR |
| [pi-mcp-adapter](./agent-harnesses/pi/pi-mcp-adapter.md) | ⚙️ Pi | 8/10 | 50-100x token reduction via single proxy tool; mandatory for Pi+MCP |
| [pi-agent-teams](./agent-harnesses/pi/pi-agent-teams.md) | ⚙️ Pi | 8/10 | Most feature-complete Pi coordination: dependency tasks, quality gates, auto-claim |
| [pi-interactive-shell](./agent-harnesses/pi/pi-interactive-shell.md) | ⚙️ Pi | 8/10 | PTY emulation eliminates tmux dependency; three autonomy modes; most-starred Pi ext |
| [HumanLayer](./developer-gui/humanlayer.md) | 🖥️ Developer GUI | 8/10 | CRISPY pipeline (7-phase RPI evolution); instruction budget ceiling ~150-200; "12 Factor Agents" coined context engineering |
| [Relay App](./orchestration-platforms/relay-app.md) | 🎛️ Orchestration | 8/10 | Rust broker + native PTY over tmux; MCP tool protocol for agent messaging; reference architecture for our broker evolution |
| [MCP Agent Mail](./orchestration-platforms/mcp-agent-mail.md) | 🎛️ Orchestration | 8/10 | Advisory file leases (glob+TTL+pre-commit guard) + async agent messaging over FastMCP+Git+SQLite; solves multi-agent edit conflicts |
| [NTM](./orchestration-platforms/ntm.md) | 🎛️ Orchestration | 8/10 | Closest L-Thread competitor; robot-mode JSON API + prompt broadcasting + structured output extraction; 175 stars; same tmux substrate |
| [CASS Memory System](./agent-memory/cass-memory-system.md) | 🧠 Memory | 8/10 | 3-layer cognitive memory (episodic->working->procedural) with 90-day confidence decay + deterministic curation; most sophisticated agent memory model in catalogue |
| [CASS](./agent-memory/cass.md) | 🧠 Memory | 8/10 | Rust-powered sub-60ms session search across 13+ agent formats; episodic memory foundation for CM; 554 stars |

---

## Categories

### 🎛️ Orchestration Frameworks
Multi-agent coordination, task routing, governance, business orchestration.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 9/10 | 70/30 deterministic/LLM split — the blueprint pattern for production agent systems |
| [Inngest](./orchestration-platforms/inngest.md) | 8/10 | TypeScript-native, deterministic routing default, durable execution — most architecturally aligned |
| [Gas Town](./orchestration-platforms/gas-town.md) | 8/10 | Yegge's actor model; git worktree isolation and bead-based work tracking |
| [Warp / Oz](./orchestration-platforms/warp-oz.md) | 8/10 | "Vercel for cloud agents" — 5 orchestration primitives (environments, hosting, tracking, handoff, programmability); harness-agnostic; 26K stars |
| [Relay App](./orchestration-platforms/relay-app.md) | 8/10 | Rust broker + native PTY over tmux; MCP tool protocol for agent messaging; 569 stars; reference for our broker evolution |
| [MCP Agent Mail](./orchestration-platforms/mcp-agent-mail.md) | 8/10 | Advisory file leases (glob+TTL+pre-commit guard) + async messaging over FastMCP+Git+SQLite; 1,780 stars; solves multi-agent edit conflicts |
| [NTM](./orchestration-platforms/ntm.md) | 8/10 | Closest L-Thread competitor; Go+tmux, 80+ commands, robot-mode JSON API, prompt broadcasting, context monitoring; 175 stars |
| [Temporal](./orchestration-platforms/temporal.md) | 7/10 | Gold standard durable execution; workflow=deterministic/activity=agent maps to our 70/30 |
| [Flyte](./orchestration-platforms/flyte.md) | 7/10 | Replay logs + global caching + intermediate state persistence; Dragonfly 2K+ concurrent runs; K8s-native |
| [Union](./orchestration-platforms/union.md) | 7/10 | Managed Flyte platform; $38.1M Series A; agentic AI primitives (replay logs, infra-as-context, code-mode sandbox); Dragonfly 2K+ concurrent runs |
| [Agent-MCP](./orchestration-platforms/agent-mcp.md) | 6/10 | MCP-as-coordination-protocol; expose create_agent/assign_task as MCP tools |
| [Composio](./orchestration-platforms/composio.md) | 6/10 | Auth/integration layer (not orchestrator); TypeScript SDK for Notion/Airtable connectivity |
| [Shannon](./orchestration-platforms/shannon.md) | 6/10 | Token budget with automatic model fallback — deterministic cost control pattern |
| [ccswarm](./orchestration-platforms/ccswarm.md) | 6/10 | Rust-based Claude Code swarm; validates worktree isolation independently |
| [OpenClaw](./orchestration-platforms/openclaw.md) | 6/10 | 271K stars; lane queuing, context checkpoints, stuck-loop detection |
| [Paperclip](./orchestration-platforms/paperclip.md) | 6/10 | Per-token cost attribution + task-keyed session persistence |
| [Droid CLI Orchestrator](./orchestration-platforms/droid-cli-orchestrator.md) | 6/10 | 104-droid persona library for proprietary Factory CLI; pure prompt-engineering orchestration (0/100 LLM); 351 stars; reference taxonomy only |
| [LangGraph](./orchestration-platforms/langgraph.md) | 5/10 | Graph-based state machines validate our approach; Python/LangChain lock-in |
| [Swarms](./orchestration-platforms/swarms.md) | 5/10 | Topology taxonomy + AgentRearrange syntax; Python-only, fragile |
| [OpenAI Agents SDK](./orchestration-platforms/openai-agents-sdk.md) | 5/10 | Manager/Handoff two-pattern taxonomy validates our architecture |
| [Conductor](./orchestration-platforms/conductor.md) | 5/10 | Netflix-born heavyweight (31K stars); wrong stack (Java) but good workflow reference |
| [NVIDIA Orchestrator-8B](./orchestration-platforms/nvidia-orchestrator-8b.md) | 5/10 | 8B model beating GPT-5 at orchestration; validates separation-of-concerns |
| [n8n](./orchestration-platforms/n8n.md) | 4/10 | 178K stars; webhook/resilience patterns but not multi-agent native |
| [AgentK](./orchestration-platforms/agent-k.md) | 4/10 | Self-evolving kernel (4 agents bootstrap new agents/tools at runtime); 959 stars; LLM-driven routing + Python/LangGraph — study kernel metaphor, ignore implementation |
| [CrewAI](./orchestration-platforms/crew-ai.md) | 4/10 | Python-only, LLM-heavy role-play paradigm; opposite of deterministic routing |
| [AutoGen](./orchestration-platforms/autogen.md) | 4/10 | 55K stars but conversation-centric + API instability; wrong language |
| [Prefect](./orchestration-platforms/prefect.md) | 4/10 | Python workflow orchestration; infrastructure patterns only |
| [DyLAN](./orchestration-platforms/dylan.md) | 4/10 | Academic "LLM-as-neuron" metaphor; Agent Importance Score concept |
| [HyperAgent](./orchestration-platforms/hyperagent.md) | 3/10 | SWE-Bench research; tiered model assignment is useful cost pattern |
| [Dify](./orchestration-platforms/dify.md) | 3/10 | 131K stars but GUI-first LLM app builder; different problem domain |
| [BridgeMCP](./orchestration-platforms/bridgemcp.md) | 3/10 | Proprietary cloud SaaS; DSGVO incompatible |
| [ElizaOS](./orchestration-platforms/elizaos.md) | 3/10 | Web3/chatbot DNA; Evaluator post-action reflection only |
| [eva.](./orchestration-platforms/eva-space.md) | 1/10 | Defunct "AI OS" from AdTech company (NASDAQ: GOAI); built on Bubble.io; domains dead; zero technical depth |

---

### ⚙️ Agent Harnesses
CLI tools, SDKs, runtimes, and frameworks that execute agent tasks.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | 9/10 | SDK + Agent Teams + 18 hooks + subagents — our primary harness |
| [Claude-Sneakpeek](./agent-harnesses/claude-sneakpeek.md) | 9/10 | Unlocks native swarm mode (TeammateTool, delegate, Task* tools) via binary patching of `tengu_brass_pebble` gate; 1,063 stars |
| [Overstory](./agent-harnesses/overstory.md) | 9/10 | Validates our tmux+worktree+SQLite arch; AgentRuntime adapter + 4-tier merge queue |
| [Everything Claude Code](./agent-harnesses/everything-claude-code.md) | 9/10 | 68.8K stars; 16 agents, 65 skills, 40 commands, AgentShield; hook runtime gating (ECC_HOOK_PROFILE), eval-driven quality gates, cross-harness parity (CC/Cursor/OpenCode/Codex) |
| [oh-my-claudecode](./agent-harnesses/oh-my-claudecode.md) | 8/10 | Same stack (CC + tmux); steal model routing (Haiku/Opus) + staged pipeline |
| [Superpowers](./agent-harnesses/superpowers.md) | 8/10 | obra's 73K stars; TDD enforcement + two-stage review + brainstorm-before-code |
| [Broomie](./agent-harnesses/broomie.md) | 8/10 | Worktree-per-agent + status dashboard (working/blocked/help) + auto merge-to-PR pipeline |
| [agent-browser](./agent-harnesses/agent-browser.md) | 7/10 | 93% context reduction via Snapshot+Refs; drop-in E2E testing candidate |
| [agtx](./agent-harnesses/agtx.md) | 7/10 | Per-phase agent assignment + TOML plugin lifecycle hooks |
| [Bowser](./agent-harnesses/bowser.md) | 7/10 | IndyDevDan's browser automation; YAML user stories + Justfile patterns |
| [Rodney](./agent-harnesses/rodney.md) | 7/10 | Simon Willison's zero-daemon browser CLI; per-worktree isolation + shell-native assertions + accessibility audit commands |
| [CodeMachine-CLI](./agent-harnesses/codemachine-cli.md) | 7/10 | Closest OSS competitor to L-Thread; Sustaina 60K LOC case study |
| [Goose](./agent-harnesses/goose.md) | 7/10 | Block's MCP-first agent; Rust core, custom distributions for federated vision |
| [OpenCode](./agent-harnesses/opencode.md) | 7/10 | Go+TS hybrid, 117K stars, TaskTool, Teams — alternative architecture reference |
| [Kilo Code](./agent-harnesses/kilo-code.md) | 7/10 | 16K stars, 1.5M+ devs; Trust Ladder framework; 5 agent modes; model routing (Opus for planning, cheap for coding) |
| [Loom](./agent-harnesses/loom.md) | 7/10 | Huntley's Level 9 evolutionary software factory; 77-crate Rust monorepo; study-only (proprietary); state machine, credential proxy, K8s sandboxing patterns |
| [OpenDev](./agent-harnesses/opendev.md) | 7/10 | 116K LOC Python; 5-stage compaction (70/80/85/90/99%), 5-model routing, 8 subagents, Docker sandbox, channel adapters (Telegram/WhatsApp/Web), ACE Playbook memory; best-documented agent architecture (arXiv paper) |
| [Deep Agents](./agent-harnesses/deep-agents.md) | 7/10 | LangChain's 10K-star harness; pluggable BackendProtocol (real FS / DB virtual FS / sandbox) is best filesystem abstraction |
| [Spec Kit](./agent-harnesses/spec-kit.md) | 7/10 | GitHub's 75K-star SDD framework; constitutional governance + template constraint engineering; steal patterns for agent definitions |
| [Agent Flywheel](./agent-harnesses/agent-flywheel.md) | 7/10 | 29-tool ecosystem (NTM, Agent Mail, CASS, CM, DCG); cherry-pick individual components, not full stack |
| [Autonomous Coding Demo](./agent-harnesses/autonomous-coding-demo.md) | 7/10 | Anthropic's own reference impl; two-agent pattern + immutable progress tracker + bash security hooks |
| [Codebuff](./agent-harnesses/codebuff.md) | 6/10 | YC-backed; 7-agent pipeline with per-task model routing; Max Mode (best-of-N); BuffBench eval framework |
| [CodeRabbit](./agent-harnesses/coderabbit.md) | 6/10 | Install today as quality gate for agent-generated PRs |
| [Augment Code](./agent-harnesses/augment-code.md) | 6/10 | Context Engine MCP usable with CC today; $977M valuation, #1 SWE-bench |
| [Mendral](./agent-harnesses/mendral.md) | 6/10 | Docker founders' agent; model tiering (Opus/Sonnet/Haiku) pattern |
| [Roo Code](./agent-harnesses/roo-code.md) | 6/10 | Cline fork with custom modes + MCP support |
| [Ironclaw](./agent-harnesses/ironclaw.md) | 6/10 | Rust OpenClaw rewrite; WASM capability-based sandbox + credential host-boundary injection; 7.6K stars; best agent security isolation model |
| [Swarms (Codex)](./agent-harnesses/swarms-codex.md) | 6/10 | Pure prompt-engineering skills for wave-based parallel execution; plan.md as shared state; validates patterns we already use |
| [OpenSpec](./agent-harnesses/openspec.md) | 6/10 | 28.6K stars; spec-driven dev (proposal→specs→design→tasks→apply→archive); delta-spec merge semantics; 20+ tool support; methodology not orchestration |
| [Verdent](./agent-harnesses/verdent.md) | 5/10 | Proprietary parallel-agent IDE; validates worktree+plan-code-verify+multi-model routing but closed-source, credit-based, GUI-first |
| [Codex Skills](./agent-harnesses/codex-skills.md) | 5/10 | 26 TOML agent roles with model tiering; rolling 12-agent pool orchestrator; anonymized multi-model judging; Codex-only |
| [SkillKit](./agent-harnesses/skillkit.md) | 5/10 | npm for agent skills — translate/sync SKILL.md across 44 agents; MCP discovery server; Phase 3+ multi-agent play |
| [DSPy](./agent-harnesses/dspy.md) | 5/10 | Declarative paradigm, GEPA optimizer, typed contracts — Phase 3+ |
| [BAML](./agent-harnesses/baml.md) | 5/10 | Typed DSL for structured LLM outputs; Rust compiler + SAP parsing; 7.7K stars; Phase 3+ extraction pipelines |
| [Aider](./agent-harnesses/aider.md) | 5/10 | Repo-map algorithm for context selection; Python-based |
| [Bridle](./agent-harnesses/bridle.md) | 5/10 | Rust-based config manager; profile switching for multi-harness |
| [Cline CLI](./agent-harnesses/cline-cli.md) | 5/10 | 58K stars; MCP auto-config reference |
| [oh-my-opencode](./agent-harnesses/oh-my-opencode.md) | 5/10 | 38K stars; Hashline (content-hash editing) is novel |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | 5/10 | Open-source terminal agent from major lab; Phase 3+ adapter |
| [Office Agents SDK](./agent-harnesses/office-agents.md) | 4/10 | Browser-only Office Add-in agent runtime; BYOK multi-provider; pi-agent-core dependency validates Pi ecosystem adoption; 239 stars |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | 4/10 | Microsoft's platform play; MCP-by-default validates protocol adoption |
| [99Ravens](./agent-harnesses/99ravens.md) | 4/10 | Expertise-codification agency/SaaS by Fab Dolan + Koylan; proprietary platform; OSS component already catalogued as [Koylan Skills](./agent-protocols/koylan-skills.md) |
| [Amp Code](./agent-harnesses/amp-code.md) | 4/10 | Proprietary; multi-model sub-agent dispatching (Oracle/Librarian/Painter/Task) |
| [Dash](./agent-harnesses/dash.md) | 4/10 | Agno SDK showcase; dual knowledge/learnings store + 6-layer context grounding for text-to-SQL; OpenAI-only; reference patterns, don't adopt |
| [Devin](./agent-harnesses/devin.md) | 4/10 | Proprietary black box; market benchmark only |
| [Gemini CLI](./agent-harnesses/gemini-cli.md) | 4/10 | 96K stars; Google's CC competitor, free tier notable |
| [Manus AI](./agent-harnesses/manus-ai.md) | 4/10 | CodeAct paradigm; acquired by Meta for ~$2-3B |
| [PraisonAI](./agent-harnesses/praisonai.md) | 3/10 | 5.6K stars; kitchen-sink Python multi-agent framework; LLM-driven routing — negative example; DoomLoopTracker pattern worth studying |
| [AutoMaker](./agent-harnesses/automaker.md) | 4/10 | Kanban + worktree + Claude Agent SDK IDE; GUI-first, single-project — watch for patterns, don't adopt |
| [ADAS](./agent-harnesses/adas.md) | 3/10 | ICLR 2025; meta-agent that designs better agents; academic only |
| [Qwen-Agent](./agent-harnesses/qwen-agent.md) | 3/10 | Python/Qwen-coupled; DeepPlanning benchmark |
| [Mitra](./agent-harnesses/mitra.md) | 3/10 | Consultancy-only multi-persona system; XML-source-of-truth synced to .gemini/ + .claude/ is a clean multi-harness portability pattern |
| [RamAIn](./agent-harnesses/ramain.md) | 3/10 | YC W26 desktop CUA; pre-trained UI policies for 10x faster GUI automation; closed-source, enterprise-only |
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
| [Pi Agent Rust](./agent-harnesses/pi/pi-agent-rust.md) | 6/10 | Rust port of Pi Agent; 4-12x perf gains; best extension security model catalogued; Anthropic-blocking license limits adoption |
| [pi-agent-scip](./agent-harnesses/pi/pi-agent-scip.md) | 5/10 | Archived (merged into rhubarb-pi); SCIP code intelligence concept |

---

### 🧠 Agent Memory & Context
Memory systems, context retrieval, knowledge stores, RAG platforms.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [CASS Memory System](./agent-memory/cass-memory-system.md) | 8/10 | 3-layer cognitive architecture (episodic->working->procedural) with 90-day confidence decay, 4x harmful multiplier, deterministic curation; MCP-native |
| [CASS](./agent-memory/cass.md) | 8/10 | Rust-powered sub-60ms session search across 13+ agent formats (Claude Code, Codex, Cursor, Aider, etc.); episodic memory foundation for CM; 554 stars; `brew install` ready |
| [Context-Gateway](./agent-memory/context-gateway.md) | 7/10 | YC W26; zero-infra Go proxy for Claude Code context compression; trial this week |
| [Beads](./agent-memory/beads.md) | 7/10 | Yegge's zero-infra git-backed task memory with dependency graphs + semantic compaction |
| [Letta / MemGPT](./agent-memory/letta.md) | 6/10 | "LLM-as-OS" self-editing memory; git-based Context Repositories validate approach |
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 6/10 | Consolidation-as-sleep pattern for knowledge compounding |
| [Cognee](./agent-memory/cognee.md) | 5/10 | Knowledge graph memory; Neo4j+vector DB infra conflicts with zero-infra approach |
| [Context7](./agent-memory/context7.md) | 4/10 | MCP server for fresh library docs; 48K stars by Upstash; nice-to-have for workers |
| [Mem0](./agent-memory/mem0.md) | 4/10 | 49K stars but built for SaaS multi-user personalization, not agent-to-agent |
| [Dolt](./agent-memory/dolt.md) | 4/10 | Git-for-data primitive; our JSON-in-git already provides sufficient versioning |
| [OneContext](./agent-memory/onecontext.md) | 4/10 | Agent trajectory recording + Slack sharing; too early-stage (9 stars, no license) for adoption |
| [Conare](./agent-memory/conare.md) | 4/10 | macOS GUI wrapper injecting context into CLAUDE.md; validates our approach but closed-source, single-user, nothing to adopt |
| [Airweave](./agent-memory/airweave.md) | 3/10 | Enterprise retrieval layer; overkill for Phase 1-2 |

---

### 🔗 Agent Protocols
Standards and interoperability specifications for agent communication and trust.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [AGENTS.md](./agent-protocols/agents-md.md) | 9/10 | Convention file for agent capabilities; 18.6K stars, 60K+ repos; adopt today |
| [A2A Protocol](./agent-protocols/a2a-protocol.md) | 8/10 | Google's de facto A2A standard; 22K stars; absorbed ACP; Phase 3-4 for federation |
| [OpenAI Skills](./agent-protocols/openai-skills.md) | 8/10 | Official Codex skills catalogue; 13.5K stars; skill-creator is best authoring guide; 35 curated skills; 3-tier distribution model |
| [x402](./agent-protocols/x402.md) | 7/10 | Coinbase's HTTP 402 micropayments; most novel payment protocol; Phase 4 |
| [OpenSkills](./agent-protocols/openskills.md) | 7/10 | SKILL.md standard; our .claude/commands/ are 80% compatible; portability play |
| [AAIF](./agent-protocols/aaif.md) | 6/10 | Linux Foundation consortium housing MCP, goose, AGENTS.md — the CNCF of agentic AI |
| [Koylan Skills](./agent-protocols/koylan-skills.md) | 6/10 | Best public reference for context engineering; validates our approach |
| [ACP](./agent-protocols/acp.md) | 5/10 | Dead (archived Aug 2025, merged into A2A); design patterns worth studying |
| [ANP](./agent-protocols/anp.md) | 4/10 | Three-layer architecture; lacks industry backing to compete with A2A |
| [Playbooks.com](./agent-protocols/playbooks-skills.md) | 5/10 | Largest skills directory (34K+ skills, 14K+ MCP servers); discovery layer, not a build tool |
| [PM Skills Marketplace](./agent-protocols/pm-skills.md) | 6/10 | Largest SKILL.md plugin marketplace (65 skills, 36 commands, 8 plugins); 6K stars in 8 days; PM domain but best structural reference for skill packaging and cross-tool portability |
| [Awesome Agent Skills](./agent-protocols/awesome-agent-skills.md) | 7/10 | Most comprehensive cross-agent skills directory (549+ skills, 10K stars, 30+ vendor teams); cross-harness path table, quality standards, security tooling pointers |
| [Hermes Function Calling](./agent-protocols/hermes-function-calling.md) | 4/10 | NousResearch's tool-use protocol for open-weight models; Manus uses it to demo prefilling-based action constraints |

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
| [Semgrep](./code-intelligence/semgrep.md) | 8/10 | MCP server turns deterministic SAST into native agent tool; 5,000+ rules; zero-cost quality gate for agent-generated code |
| [Graphite](./code-intelligence/graphite.md) | 8/10 | Stack-aware merge queue + stacked PRs; solves 19-20% conflict rate; Anthropic investor |
| [Pyrefly](./code-intelligence/pyrefly.md) | 7/10 | Meta's Rust-based Python type checker; fastest back-pressure tool for autonomous Python coding loops (Huntley pattern); 5.4K stars |

---

### 🔍 Observability & Debugging
Tracing, monitoring, failure analysis, cost tracking.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [ccusage](./observability/ccusage.md) | 9/10 | Zero-install, TypeScript-native Claude Max usage tracking; highest-ROI tool |
| [Langfuse](./observability/langfuse.md) | 8/10 | Self-hosted LLM observability for gov client trust artifacts; 22.8K stars |
| [BrainTrust](./observability/braintrust.md) | 7/10 | Eval-first observability; AutoEvals library + four-part eval framework; $80M Series B; complement to Langfuse |
| [AgentRR](./observability/agentrr.md) | 6/10 | Research paper; check functions as deterministic validators map to 70/30 split |
| [Showboat](./observability/showboat.md) | 6/10 | Executable demo docs with deterministic verify; anti-fabrication trust artifacts for agent work; by Simon Willison |
| [Opik](./observability/opik.md) | 7/10 | Strongest Langfuse alternative; Agent Optimizer SDK + 55+ integrations + Apache 2.0; Java backend misaligns with our TS stack |
| [Arize Phoenix](./observability/arize-phoenix.md) | 6/10 | Redundant given Langfuse; Python-first; study evaluation framework only |
| [Cleric](./observability/cleric.md) | 5/10 | Closed-source AI SRE; persist/compound/visible learning loop + ambient learning are transferable patterns |
| [CodexBar](./observability/codexbar.md) | 3/10 | macOS menu bar for Claude Max limit visibility; by PSPDFKit founder |
| [Assail](./observability/assail.md) | 3/10 | Pre-seed security assessment; 9 stars; watch, don't use |
| [Factory Floor](./observability/factory-floor.md) | 6/10 | Live leaderboard tracking autonomous agent revenue ($147K across 7 agents); market intelligence bookmark |

---

### 🏗️ Infrastructure
Sandboxes, hosting, compute, model routing.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [LiteLLM](./infrastructure/litellm.md) | 8/10 | Unified API proxy for 100+ providers; deploy for cost visibility + model routing |
| [Trigger.dev](./infrastructure/trigger-dev.md) | 8/10 | TypeScript-native durable execution; strongest tmux crash recovery replacement |
| [DCG](./infrastructure/destructive-command-guard.md) | 8/10 | SIMD-accelerated command guard (642 stars); PreToolUse hook blocks destructive git/shell/cloud ops; fail-open, sub-ms, 49+ security packs |
| [Arcade.dev](./infrastructure/arcade-dev.md) | 7/10 | Delegated agent authorization (per-user/per-service/per-action scoped tokens); MCP gateway; Okta pedigree; DSGVO-compatible on-prem |
| [MorphLLM](./infrastructure/morphllm.md) | 7/10 | Context compression; value diminished by Claude Max flat rate |
| [DBOS](./infrastructure/dbos.md) | 7/10 | Postgres-backed durable workflows; Stonebraker + Zaharia; Phase 3 crash recovery |
| [Daytona](./infrastructure/daytona.md) | 6/10 | 63K stars; most popular sandbox; AGPL license friction |
| [Monty](./infrastructure/monty.md) | 6/10 | Pydantic's Rust Python interpreter; <1us startup, serializable pause/resume; code-mode sandbox |
| [VibeProxy](./infrastructure/vibeproxy.md) | 6/10 | macOS menu bar subscription proxy (1.6K stars); routes Claude Max/ChatGPT through OpenAI-compatible API for third-party tools; MIT; round-robin multi-account |
| [Orthogonal](./infrastructure/orthogonal.md) | 5/10 | YC W2026 "Stripe for agent API consumption"; one key + pay-per-call for 20+ APIs; closed-source SaaS; watch for Lead Gen Swarm |
| [E2B](./infrastructure/e2b.md) | 5/10 | 88% Fortune 100 adoption; Apache-2.0; Phase 3+ sandbox |
| [Terminal Use](./infrastructure/terminal-use.md) | 5/10 | "Vercel for background agents" (YC W26, ex-Palantir); persistent filesystems + K8s; overlaps with Warp/Oz; watch for Phase 4+ |
| [Hyperbrowser](./infrastructure/hyperbrowser.md) | 4/10 | Cloud browser infra; two-tier action model (deterministic-first, AI-fallback) |
| [Gemini API Proxy](./infrastructure/gemini-api-proxy.md) | 4/10 | Reverse proxy routing OpenAI/Anthropic requests to Google's internal Code Assist API; 11 stars; ToS violation risk; format translation reference only |
| [Antigravity Manager](./infrastructure/antigravity-manager.md) | 3/10 | AI credential proxy (25K stars); CC-BY-NC-SA license blocks commercial use; LiteLLM covers same space with MIT |
| [Antigravity Claude Proxy](./infrastructure/antigravity-claude-proxy.md) | 3/10 | Anthropic-compatible proxy via Google Cloud Code (3K stars); ToS risk; irrelevant on Claude Max flat rate |
| [Hyprflow](./infrastructure/hyprflow.md) | 2/10 | Linux network namespace isolation per workspace group; Hyprland-only; reference pattern only |

---

### 🖥️ Developer GUI / IDE
Desktop/web apps for managing agent sessions, IDE extensions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [HumanLayer](./developer-gui/humanlayer.md) | 8/10 | CRISPY pipeline (7-phase RPI evolution); instruction budget ceiling ~150-200; "12 Factor Agents" (18.6K stars) coined context engineering |
| [json-render](./developer-gui/json-render.md) | 7/10 | Generative UI via catalog-as-guardrail; 12.1K stars; AI composes from deterministic component catalog + MCP integration; 70/30 split applied to frontend |
| [Proliferate](./developer-gui/proliferate.md) | 6/10 | YC W2026; OSS background agent platform (234 stars); cloud sandboxes + event-driven automations + MCP-unified actions; reference for trigger schemas and permission frameworks |
| [Eigent](./developer-gui/eigent.md) | 5/10 | 12.9K stars; most architecturally serious Cowork alt — built on CAMEL-AI framework with genuine multi-agent Workforce (root node + async task channels + recursive workers); real value is in underlying CAMEL patterns, not the Electron app |
| [OpenWork](./developer-gui/openwork.md) | 5/10 | 11K stars; best-executed OSS Cowork clone; 3-mode runtime (host/client/cloud) + 6-layer extensibility taxonomy; OpenCode-specific, pattern reference only |
| [Conductor Build](./developer-gui/conductor-build.md) | 5/10 | Melty Labs' Mac GUI for parallel Claude Code/Codex agents; git worktree isolation + scripts lifecycle + checkpoints; closed-source wrapper, watch don't adopt |
| [Manaflow (cmux)](./developer-gui/manaflow.md) | 5/10 | OSS Claude Code web/Devin alternative; parallel agent spawning + Morph Cloud sandboxes + PR heatmap review; cloud-first (Convex+Morph) conflicts with our zero-infra approach |
| [React Grab](./developer-gui/react-grab.md) | 5/10 | 6.3K stars; O(1) file discovery via React fiber introspection; 33% token reduction + 3x speedup on UI tasks; MCP server included; "context is zero-sum" principle in action |
| [Vibe Kanban](./developer-gui/vibe-kanban.md) | 5/10 | 22.6K stars; validates git worktree isolation; human-operated not autonomous |
| [Factory IDE](./developer-gui/factory-ide.md) | 4/10 | Validates autonomous agent thesis at enterprise scale; Droid specialization |
| [1Code](./developer-gui/1code.md) | 4/10 | YC W26; 5.1K stars; most feature-complete Claude Code GUI (worktree isolation, REST API for tasks, @mention triggers, background cloud agents); study API pattern for Phase 3+ |
| [Kiro](./developer-gui/kiro.md) | 4/10 | AWS's spec-driven IDE; structured requirements->design->tasks workflow; agent hooks + steering files validate CLAUDE.md approach |
| [Multica](./developer-gui/multica.md) | 4/10 | OSS Claude Cowork clone; ACP protocol integration + Conductor facade decomposition; GUI-first, dead protocol (ACP merged into A2A) |
| [Composio Open Claude Cowork](./developer-gui/composio-open-claude-cowork.md) | 4/10 | Composio's OSS Cowork clone; dual-provider (Claude SDK + Opencode) + Composio Tool Router (500+ SaaS via MCP); 3.1K stars; marketing showcase, not orchestrator |
| [Open Claude Cowork](./developer-gui/open-claude-cowork.md) | 4/10 | OSS Electron GUI wrapping Claude Agent SDK; SQLite session persistence; 3K stars; single-agent, no orchestration |
| [Kuse Cowork](./developer-gui/kuse-cowork.md) | 3/10 | Best-engineered Cowork clone (Rust/Tauri, 10MB, Docker sandbox, BYOK multi-provider); document-processing focus, not code orchestration; 545 stars; strong publisher (Kuse AI, $10M ARR bootstrapped) |
| [Cursor](./developer-gui/cursor.md) | 3/10 | $29.3B gorilla; Automations (trigger-based agents) worth watching |
| [Jean](./developer-gui/jean.md) | 3/10 | Execution modes (Plan/Build/Yolo) concept |
| [Hello Halo](./developer-gui/hello-halo.md) | 3/10 | OSS Claude Cowork clone (624 stars); Digital Human Protocol spec.yaml pattern for declarative agent definitions is the one interesting contribution |
| [Goodable](./developer-gui/goodable.md) | 3/10 | OSS Claude Cowork clone (158 stars); dual-mode Skills (AI tool + standalone GUI sharing data); "Digital Employee" role templates with planning/execution phase prompts; Chinese-market focus |
| [AionUi](./developer-gui/aionui.md) | 3/10 | OSS Cowork clone; 18K stars; Electron GUI wrapping 15+ CLI agents; Channels IM-bot architecture is only interesting pattern |
| [DeepSeek Cowork](./developer-gui/deepseek-cowork.md) | 3/10 | OSS Cowork clone (422 stars); Electron+Express hybrid with modular server (modulesManager pattern); browser automation via custom WS extension; stale since Feb 2026 |
| [Commander](./developer-gui/commander.md) | 2/10 | Only SwiftUI-native Claude coding app; polished but closed-source, human-operated, no novel patterns |
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
| [AI Corporate Zombies — Automating 98% of a Solopreneur Business](./talks/2026-03/felix-tay-ai-corporate-zombies-business-automation.md) | Felix Tay | 2026-03-06 | 7/10 | 5-agent "Dojo" recursive loop for context amnesia; Claude Code wrapper (Nex) on Agent SDK; cron-driven pipeline automation with human approval gates |

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
| [Ralph Wiggum as a "software engineer"](./articles/2025-07/ralph-wiggum-agent-loop.md) | Geoffrey Huntley | 2025-07-14 | 9/10 | Definitive Ralph Wiggum pattern reference: `while true` bash loop + Claude Code; specs > prompts as control surface; back pressure (types/tests/analyzers) as correctness strategy; one task per loop + subagent parallelism; self-improving agents via AGENT.md + fix_plan.md; complete production prompts included; $50K contract delivered for $297 |
| [Context Engineering for AI Agents: Lessons from Building Manus](./articles/2025-07/context-engineering-for-agents-manus.md) | Yichao 'Peak' Ji (Manus) | 2025-07-18 | 9/10 | KV-cache hit rate as #1 agent metric (100:1 input:output ratio); mask tool logits don't add/remove tools mid-loop; file system as unlimited external memory with restorable compression; todo.md recitation defeats lost-in-the-middle; keep failed actions in context for implicit belief updating |
| [How to Build a Coding Agent: Free Workshop](./articles/2025-08/how-to-build-a-coding-agent-workshop.md) | Geoffrey Huntley | 2025-08-24 | 8/10 | 300-line agent demystified: 5 primitives (read/list/bash/edit/search) in an inference loop; oracle-as-tool pattern (wire reasoning model inside agentic loop); context pollution is #1 failure mode; agent building is table-stakes 2025 knowledge |
| [I Dream About AI Subagents](./articles/2025-04/subagents-context-window-as-ram.md) | Geoffrey Huntley | 2025-04-13 | 9/10 | Context windows = RAM; subagents = SWAP; current agents death-spiral in polluted single contexts; spawn fresh child agents to preserve parent context; practical ceiling at 147-152K not 200K |
| [Redlining](./articles/2025-04/redlining-context-window-clipping.md) | Geoffrey Huntley | 2025-04-06 | 8/10 | DJ clipping analogy for LLM context degradation; Claude 3.7 clips at 147-152K not 200K; RULER benchmark measures real vs advertised context; $50/mo IDE pricing is "Happy Meal" -- budget $100-$500/day/dev for tokens; 2x+ productivity gains (HBS study) |
| [You Are Using Cursor AI Incorrectly (The Stdlib Method)](./articles/2025-02/reusable-prompt-standard-library.md) | Geoffrey Huntley | 2025-02-09 | 8/10 | Build a reusable prompt standard library ("stdlib") of composable rules, not one-off prompts; 5 anti-patterns (AI-as-Google, underspecifying, IDE-not-agent, no outcome programming, token-wasting pleasantries); stdlib + specs + type-safe languages = multiplicative output; prompts are compounding assets |
| [From Design Doc to Code: The Groundhog AI Coding Assistant](./articles/2025-03/specs-driven-development-groundhog.md) | Geoffrey Huntley | 2025-03-03 | 8/10 | Specs-first + stdlib + type-safe languages = multiplicative agent output; Ralph Wiggum loop adopted by OpenAI Codex as agent-to-agent review pattern; back pressure hierarchy (types > tests > linters > build > UI > git) determines safe autonomy level |
| [Principles — How We Think About Building with LLMs](./articles/2026-03/ai-native-software-development-principles.md) | Latent Patterns | undated | 7/10 | 14 AI-native dev principles; backpressure > manual rescue; verify don't just test (property-based/formal methods); moat is workflow not model; agents need boundaries not freedom; context windows are not infinite memory |
| [Measuring AI Agent Autonomy in Practice](./articles/2026-02/measuring-ai-agent-autonomy-in-practice.md) | Miles McCain et al. (Anthropic) | 2026-02-18 | 9/10 | 998K API tool calls + 500K Claude Code sessions analyzed; deployment overhang quantified (99.9th pctl turn duration doubled in 3 months); experienced users shift from approval to strategic monitoring; agent self-limitation outperforms human interruption 2:1; post-deployment monitoring is the critical missing infrastructure |
| [Agentic Engineering Patterns](./articles/2026-02/agentic-engineering-patterns.md) | Simon Willison | 2026-02-23 | 9/10 | Living guide: code is cheap but quality isn't; TDD as highest-leverage agent pattern; "first run the tests" 4-word session opener; hoard working examples as agent context; never file unreviewed agent PRs |
| [Harness Engineering: Codex in an Agent-Centric World](./articles/2026-02/harness-engineering-codex-agent-centric-world.md) | Ryan Lopopolo (OpenAI) | 2026-02-11 | 9/10 | 0 hand-written lines, 1M LOC, 1500 PRs by 3 engineers via Codex agents; AGENTS.md as map not manual; mechanical architecture enforcement; garbage collection agents for drift; per-worktree observability |
| [Unlocking the Codex Harness: How We Built the App Server](./articles/2026-02/unlocking-the-codex-harness-app-server.md) | Celia Chen (OpenAI) | 2026-02-04 | 8/10 | Codex test scaffolding as reusable agent runtime; bidirectional JSON-RPC protocol with Item/Round/Thread primitives; MCP tried and abandoned for core protocol; approval-flow pattern pauses agent round; backward-compatible versioning for multi-client |
| [SWE-Bench Pro: Raising the Bar for Agentic Coding](./articles/2025-09/swebench-pro-raising-the-bar-for-agentic-coding.md) | Scale AI Research Team | 2025-09-19 | 8/10 | 1,865 tasks across 41 repos; proprietary codebases solve data contamination; models drop from 70%+ (Verified) to ~23% (Pro); scaffolding matters as much as model capability |
| [Build secure web scrapers that protect your identity and your data](./articles/2026-03/build-secure-web-scrapers.md) | @githubprojects | 2026-03-07 | 5/10 | Article undersells Ironclaw (7.5K stars Rust AI assistant); real value is WASM sandbox isolation + credential host-boundary injection patterns |
| [Software Development Now Costs Less Than the Wage of a Minimum Wage Worker](./articles/2026-02/software-dev-costs-less-than-minimum-wage.md) | Geoffrey Huntley | 2026-02-27 | 9/10 | AI agent dev costs $10.42/hr (below minimum wage); K-shaped economy divergence; per-seat pricing dead; solo builders achieving 30x output; compress 5-year roadmaps to 1 year |
| [Collaboration sucks](./articles/2025-11/collaboration-sucks.md) | Charles Cook (PostHog) | 2025-11-11 | 8/10 | Anti-collaboration as org principle; "You're the driver" ownership model; PR > issue > message hierarchy; post-ship feedback over pre-approval gates; referenced by Kilo for N=1 ownership |
| [LLM Weights vs the Papercuts of Corporate](./articles/2025-12/llm-weights-vs-papercuts-of-corporate.md) | Geoffrey Huntley | 2025-12-09 | 7/10 | "Model weight first" companies work with the grain of LLM training data; corporate friction (approval chains, committees, process theater) compounds into structural velocity impossibility; organizational design determines AI ceiling |
| [12 Factor Agents](./articles/2025-04/12-factor-agents.md) | Dex Horthy (HumanLayer) | 2025-04-03 | 10/10 | Seminal "context engineering" article; 12 principles for production LLM apps; deterministic-first with strategic LLM sprinkles; directly validates 70/30 split |
| [Fuck You, Show Me The Prompt](./articles/2024-02/fuck-you-show-me-the-prompt.md) | Hamel Husain | 2024-02-14 | 7/10 | LLM frameworks invert abstraction (unintelligible code for human-readable language); mitmproxy to audit any framework; "own your prompts" philosophy cited by 12 Factor Agents; Instructor as gold-standard "zero-cost abstraction" |
| [The Six-Month Recap: AI at Web Directions](./articles/2025-06/six-month-recap-ai-productivity.md) | Geoffrey Huntley | 2025-06-17 | 7/10 | 6-month longitudinal AI productivity data; multi-boxing (parallel agents) as force multiplier; specs-driven workflow replaces Jira; context window degrades at 147-152K (not 200K); organizational adoption curve with "Fruitco" case study |
| [An "Oh Fuck" Moment in Time](./articles/2025-01/oh-fuck-moment-in-time.md) | Geoffrey Huntley | 2025-01-14 | 8/10 | Origin story: Cursor/Windsurfer autonomously converts Rust CPAL to Haskell+FFI while Huntley is at the pool; "type systems make LLMs go harder" = seed of back pressure thesis; adoption imperative crystallized; precursor to multi-boxing and entire Huntley body of work |
| [Multi Boxing LLMs](./articles/2025-01/multi-boxing-llms.md) | Geoffrey Huntley | 2025-01-28 | 9/10 | WoW multi-boxing analogy for parallel agents; IDEs stuck in 1983 synchronous paradigm; isolation via discrete domain units or separate checkouts is prerequisite for parallelism; calls for agent-first IDE design; foundational text for our L-Thread Orchestrator pattern |
| [Dear Student: Yes, AI is here, you're screwed unless you take action](./articles/2025-02/dear-student-ai-screwed-unless-action.md) | Geoffrey Huntley | 2025-02-27 | 6/10 | Student career crisis from Cursor Composer replacing junior dev work; "high autonomy person" thesis; third bust-after-boom cycle; companion to $10.42/hr economics piece |
| [The Future Belongs to People Who Can Just Do Things](./articles/2025-02/future-belongs-to-people-who-do-things.md) | Geoffrey Huntley | 2025-02-07 | 8/10 | "Execution is now cheap" inversion thesis; six-stage corporate AI adoption curve; back pressure (types/tests/compiler) as agent reinforcement; solo founders can now compete at scale (BuiltWith: 1 employee, $14M ARR); 1000-agent vision from Anni Betts |
| [I Run 6 AI Agents as My Engineering Team](./articles/2026-02/architecting-multi-agent-ai-fleet-single-vps.md) | Oguzhan Atalay | 2026-02-25 | 8/10 | 6 agents as systemd services on single VPS; multi-provider failover chain; LLM-powered self-healing watchdog; coordinator/specialist model tiering; "these are infrastructure problems, not AI problems" |
| [An AI Agent Coding Skeptic Tries AI Agent Coding](./articles/2026-02/ai-agent-coding-skeptic-tries-agent-coding.md) | Max Woolf (@minimaxir) | 2026-02-27 | 6/10 | AGENTS.md as decisive success factor; 8-step iterative optimization pipeline; multi-model chaining (Codex then Opus) for cumulative 6x gains; ships verifiable OSS benchmarks (UMAP 9-30x, HDBSCAN 23-100x faster) |
| [Beyond Rate Limits: Scaling Access to Codex and Sora](./articles/2026-02/beyond-rate-limits-scaling-codex-sora.md) | OpenAI Engineering | 2026-02-13 | 6/10 | Waterfall decision stack replaces hard rate limits; synchronous access check + async credit settlement; three data streams (usage/monetization/balance); 1M+ Codex developers in first month; foundational billing infra for all future products |
| [Turning Contracts into Searchable Data at OpenAI](./articles/2025-09/turning-contracts-into-searchable-data-openai.md) | Wei An Lee & Siddharth Jain (OpenAI) | 2025-09-29 | 7/10 | Three-step pipeline (ingest/inference/review) for contract extraction; overnight batch processing; selective RAG over full-context dumps; 50% review time reduction; scales without linear headcount; ASC 606 compliance in regulated domains |
| [Inside OpenAI's In-House Data Agent](./articles/2026-01/inside-openai-in-house-data-agent.md) | Bonnie Xu, Aravind Suresh & Emma Tang (OpenAI) | 2026-01-30 | 7/10 | Two engineers built a data agent in 3 months (70% AI-written code) serving 4K+ employees across 600PB/70K datasets; six-layer context architecture; "dumb guardrails" security; curated context > noisy context |
| [Don't Waste Your Back Pressure](./articles/2026-01/dont-waste-your-back-pressure.md) | Geoffrey Huntley + Moss | 2026-01-17 | 9/10 | Back pressure (type errors, tests, linters, UI rendering, specs) is THE engineering discipline of the agent era; 4-technique taxonomy for automated agent feedback; invest in feedback infrastructure not manual validation; loop agents until clean via automated gates |
| [Everything Is a Ralph Loop](./articles/2026-01/everything-is-a-ralph-loop.md) | Geoffrey Huntley | 2026-01-17 | 9/10 | Loop mindset over brick-by-brick; monolithic single-agent loops beat multi-agent; "clay on the pottery wheel" iterative pattern; Level 9 evolutionary software (Loom) beyond Gas Town's Level 8; watch the loop for failure domains; 300-line agent as table stakes |
| [Introducing Advanced Tool Use](./articles/2025-11/advanced-tool-use.md) | Bin Wu (Anthropic) | 2025-11-24 | 9/10 | Original announcement of 3 beta features: Tool Search Tool (85% token reduction via `defer_loading`), Programmatic Tool Calling (37% token savings, code-as-composition-layer), Tool Use Examples (72%->90% parameter accuracy); 134K tokens observed for tool defs in production; Opus 4.0 accuracy 49%->74% with Tool Search |
| [Effective Context Engineering for AI Agents](./articles/2025-09/effective-context-engineering-for-ai-agents.md) | Anthropic Applied AI | 2025-09-29 | 10/10 | Context engineering as successor to prompt engineering; "attention budget" = finite resource with diminishing returns; context rot degrades recall at scale; Goldilocks zone for system prompts; just-in-time retrieval > pre-computed RAG (Claude Code: CLAUDE.md upfront + grep/glob at runtime); 3 long-horizon mechanisms: compaction (summarize + retain 5 recent files), structured note-taking (persistent external memory), sub-agents (10K+ exploration compressed to 1-2K summaries); tool result clearing for context savings |
| [Tool Search Tool — Deferred Tool Loading](./articles/2026-03/tool-search-api-deferred-tool-loading.md) | Anthropic | 2026-03-08 | 9/10 | `defer_loading: true` keeps tools out of context until searched; 85%+ token reduction; accuracy degrades past 30-50 tools; regex + BM25 variants; custom client-side via `tool_reference` blocks; MCP integration via `mcp_toolset`; max 10K tools; Sonnet/Opus 4.0+ only |
| [Compaction — Server-Side Context Compaction API](./articles/2026-03/anthropic-compaction-api.md) | Anthropic | 2026-01 (beta) | 9/10 | Server-side context summarization API (`compact_20260112`); configurable trigger threshold (default 150K, min 50K); `pause_after_compaction` for surgical context preservation; token budget enforcement via compaction counting; synergistic with prompt caching (separate `cache_control` breakpoints); `usage.iterations` array for granular billing; Opus 4.6 + Sonnet 4.6 |
| [The AI Assembly — Bicameral Parliament for Autonomous AI Agents](./articles/2026-03/the-ai-assembly-autonomous-agent-governance.md) | Unknown | 2026-03-05 | 7/10 | Experimental bicameral governance for AI agents; open Assembly + auction-based Council (~180 seats); $0.10 registration + $0.01/hr heartbeat; tiered voting thresholds scaling with treasury risk; mandatory Forum deliberation -> Council vote -> 72hr timelock -> execution; Dotta's governance patterns taken to logical extreme; reserved powers for future extension |
| [Building AI Coding Agents for the Terminal](./articles/2026-03/building-ai-coding-agents-for-terminal-opendev.md) | Nghi D. Q. Bui (OpenDev) | 2026-03-05 | 9/10 | First comprehensive open-source technical report for terminal-native coding agents; 5-model workload routing (Normal/Thinking/Critique/VLM/Compact); 5-stage adaptive compaction (60/75/85/95/100%); 5-layer defense-in-depth safety; dual-agent planning (Planner subagent with schema-level tool removal); 9-pass fuzzy edit matching; event-driven system reminders with escalating guardrail counters; lazy MCP tool discovery; context pressure as unifying design constraint; CC BY 4.0 |

---

| [Minions: Stripe's One-Shot Coding Agents -- Part 2](./articles/2026-02/minions-stripes-one-shot-coding-agents-part-2.md) | Alistair Gray (Stripe) | 2026-02-19 | 9/10 | Blueprints formalize 70/30 deterministic/LLM split as composable DAGs; Toolshed centralizes ~500 MCP tools but agents get intentionally small subsets; Cursor-format directory-scoped rule files replace global CLAUDE.md; devboxes as "cattle not pets" for full-permission unattended agents; 2-push CI cap prevents diminishing returns |
## 🐦 Notable Posts

| Author | Date | Key Insight |
|--------|------|-------------|
| [@mckaywrigley — Build Your Own Claude Cowork With Claude Agent SDK](./posts/2026-01/mckaywrigley-oss-cowork-claude-agent-sdk.md) | 2026-01-13 | Chatbot UI creator (33K stars) announces OSS Cowork-style app built on Claude Agent SDK; "this app format will be the ai app-layer trend of the year"; validates SDK as foundation for multi-agent coding UIs; 72 bookmarks, 9K views |
| [@trq212 — Tasks Replacing TodoWrite in Claude Code](./posts/2026-01/trq212-tasks-replacing-todowrite-claude-code.md) | 2026-01-22 | Anthropic upgrades Todos to Tasks: inter-agent communication, dependency tracking, multi-session persistence; TodoWrite constrained improving models; Task Tool enables Agent Teams coordination; 5.9K likes, 324 replies |
| [@LLMJunky — Codex Subagents: A Deep Dive](./posts/2026-01/llmjunky-codex-subagents-deep-dive.md) | 2026-01-23 | Part 1 fundamentals: Orchestrator-Worker separation (Orc never codes, only delegates/validates); subagents as context window strategy (offload token-heavy research); "Don’t assume. Validate." — agents fabricate success; explicit context templates reduce drift; 936 likes, 44.5K views |
| [@NicerInPerson — Claude Code Swarms Unlock](./posts/2026-01/nicerinperson-claude-code-swarms-unlock.md) | 2026-01-24 | Hidden Claude Code "Swarms" feature unlocked via feature-flag reverse engineering; lead agent plans/delegates/synthesizes, spawns parallel specialist workers with shared task board, dependency tracking, inter-agent messaging; event-driven async subagents as key differentiator; claude-sneakpeek repo hit HN front page; 561K views, 2.9K likes, 4.7K bookmarks |
| [@trq212 — Prompt Caching Is Everything](./posts/2026-02/trq212-prompt-caching-is-everything.md) | 2026-02-19 | Anthropic engineer's prompt caching architecture: 4-tier cache layout (system prompt > tools > CLAUDE.md > session > messages); plan mode via tools not tool-set swaps; defer_loading stubs for MCP tools; cache-safe compaction forking; "monitor cache hit rate like uptime"; 1.9M views, 4.9K likes |
| [@AnthropicAI — Measuring Agent Autonomy](./posts/2026-02/anthropicai-measuring-agent-autonomy.md) | 2026-02-18 | 99.9th percentile Claude Code turn duration doubled in 3 months (25 to 45+ min); experienced users auto-approve 40%+ but interrupt more strategically; 73% of API tool calls have human-in-loop; "deployment overhang" — models capable of more autonomy than exercised |
| [@ctatedev — Generative UI for MCP Apps](./posts/2026-03/ctatedev-generative-ui-mcp-apps.md) | 2026-03-07 | Generative UI via component catalogs + MCP: AI assembles UIs from predefined components across Claude/ChatGPT/VS Code/Cursor. json-render (12.1K stars) — guardrailed generation mirrors 70/30 deterministic/LLM split |
| [@trq212 — Lessons from Building Claude Code: Seeing like an Agent](./posts/2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) | 2026-02-27 | Anthropic engineer's tool design philosophy: progressive disclosure > system prompt bloat; AskUserQuestion took 3 iterations; TodoWrite replaced by Task Tool as models improved; RAG abandoned for Grep-based self-context-building; ~20 tools with high bar to add; 3.5M views, 10K likes |
| [@RLanceMartin — Give Claude a Computer: Programmatic Tool Calling](./posts/2026-02/rlancemartin-give-claude-a-computer-ptc.md) | 2026-02-27 | PTC lets Claude write code to orchestrate tool calls inside a container — intermediate results stay in code, not context window; 11% accuracy gain + 24% fewer tokens on search benchmarks; Opus 4.6 + PTC #1 on LMArena Search Arena; tools as control surface, code as composition layer; 258K views, 1.3K likes, 3.1K bookmarks |
| [@LLMJunky — Codex Multi-Agent Playbook Part 1: Setup Guide](./posts/2026-02/llmjunky-codex-multi-agent-playbook-setup-guide.md) | 2026-02-18 | Custom multi-agent roles in Codex: configurable models, reasoning levels, system prompts, permissions, MCP servers, ChatGPT Apps; hidden `max_threads` override for 6-agent cap; hierarchical TOML config scoping (global/project/subfolder); 25 curated role configs on GitHub; 125K views, 1,086 bookmarks |
| [@LLMJunky — Codex Multi Agent Playbook: Swarms Lvl. 1](./posts/2026-02/llmjunky-codex-multi-agent-playbook-swarms-lvl1.md) | 2026-02-26 | Two swarm strategies: Waves (dependency-ordered, accuracy-first) vs Super Swarms (total parallelism, speed-first); front-load subagent context via structured prompt template; planning quality multiplies across parallel agents; Codex config for model tiering (orchestrator=large, workers=small); 66.6K views, 808 bookmarks |
| [@swyx — OSS Cowork Clones Thread](./posts/2026-03/swyx-oss-cowork-clones-thread.md) | 2026-03-05 | "are there any open source Claude Cowork clones because I can no longer function without a cowork" — 59 replies crowdsourcing OSS alternatives; surfaces AionUi, Goodable, Halo, Multica, Open Claude Cowork, OpenWork, Eigent, Kuse, Composio; none dominant yet; 60K views, 90 bookmarks |
| [@aratahikaru0 — OSS Claude Cowork Clones](./posts/2026-03/aratahikaru0-oss-cowork-clones.md) | 2026-03-05 | 7 OSS Cowork alternatives: AionUi, Goodable, Halo, Multica, Open Claude Cowork, OpenWork, mckaywrigley's (Claude Agent SDK-based); swyx's thread (60K views) shows strong demand; none yet dominant — space is immature; 9K views, 72 bookmarks |
| [@nummanali — You Can Be a Civilian Scientist](./posts/2026-02/nummanali-you-can-be-a-civilian-scientist.md) | 2026-02-16 | AI has passed the inflection point; LLMs turn ordinary people into "civilian scientists"; references RLM, DSPy, Opus 4.6, GPT 5.3 Codex, Gemini 3.1; the real prize is not SaaS/agents but unlocking human potential for science and community |
| [@GeoffreyHuntley — Embedded Software Factory: RAD Is Back](./posts/2026-03/geoffreyhuntley-embedded-software-factory-rad-is-back.md) | 2026-03-08 | Product-as-IDE pattern: designer mode inside @latentpatterns lets him develop LP in LP; Cursor Cloud Agents + risk matrix for auto-shipping; cloned PostHog, Pipedrive, Zendesk, Calendly, LaunchDarkly as first-party; People Data Labs for customer enrichment + LLM-powered Challenger/SPIN sales analysis; "on the loop, not in the loop"; hyper-personalised software era = Microsoft Access 2.0; 192 likes, 357 bookmarks, 19.6K views |
| [@oliverhenry — How a Personal AI Agent Will Change Your Entire Life](./posts/2026-03/oliverhenry-personal-ai-agent-changes-life.md) | 2026-03-07 | Autonomous agent "Larry" on old gaming PC generates TikTok content, launched LarryBrain skill marketplace (246 subscribers, 69 skills, 50% creator rev share) on OpenClaw; $7K+/mo in 4 weeks; validates agent economy thesis; 1.45M views, 11.9K bookmarks |
| [@affaanmustafa — ECC v1.8.0: A Complete Agent Harness System](./posts/2026-03/affaanmustafa-ecc-v1-8-0-agent-harness.md) | 2026-03-08 | Everything Claude Code (68.6K stars) graduates from setup repo to agent harness system; v1.8.0 adds slop guard, eval-driven quality gates, bounded loop control at runtime path; cross-harness parity across CC/Cursor/OpenCode/Codex; 16 agents, 65+ skills, 40+ commands, AgentShield security (1,282 tests); hook runtime gating via env vars; 108 likes, 165 bookmarks, 20.3K views |

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
