# Knowledge Catalogue

> A categorized reference of all tools, frameworks, platforms, practitioners, articles, talks, and posts analyzed during research.

**Last updated:** 2026-03-08
**Total entries:** 107 (19 tools, 7 practitioners, 81 reference docs, 0 articles, 0 talks, 0 posts)
**Templates:** [Tool](./_TEMPLATE.md) | [Practitioner](./_TEMPLATE-PRACTITIONER.md) | [Article](./_TEMPLATE-ARTICLE.md) | [Talk](./_TEMPLATE-TALK.md) | [Post](./_TEMPLATE-POST.md)

---

## Quick Reference — Tools & Frameworks

| Tool | Category | Relevance | Verdict |
|------|----------|-----------|---------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | ⚙️ Harness | 9/10 | Primary harness — SDK, Agent Teams, 18 hooks, subagents |
| [Oh-My-Pi](./agent-harnesses/oh-my-pi.md) | ⚙️ Harness | 9/10 | Pi fork with worktree isolation, hash state, model routing |
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 🎛️ Orch. Framework | 9/10 | The 70/30 deterministic/LLM blueprint pattern |
| [Pi Agent](./agent-harnesses/pi-agent.md) | ⚙️ Harness | 8/10 | Primary Day 60+ harness candidate |
| [OpenCode](./agent-harnesses/opencode.md) | ⚙️ Harness | 7/10 | Go+TS hybrid, 117K stars, TaskTool + Teams |
| [Pi Subagents](./agent-harnesses/pi-subagents.md) | ⚙️ Harness | 7/10 | Nico Bailon's role-based delegation for Pi |
| [OpenClaw](./orchestration-platforms/openclaw.md) | 🎛️ Orch. Framework | 6/10 | 271K stars, lane queuing, context checkpoints |
| [Paperclip](./orchestration-platforms/paperclip.md) | 🎛️ Orch. Framework | 6/10 | Reference cost tracking + session persistence |
| [Pi Messenger](./agent-harnesses/pi-messenger.md) | ⚙️ Harness | 6/10 | Multi-agent comms for Pi, steering injection |
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 🧠 Memory | 6/10 | Consolidation-as-sleep pattern |
| [DSPy](./agent-harnesses/dspy.md) | ⚙️ Harness | 5/10 | Declarative agent paradigm, GEPA optimizer |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | ⚙️ Harness | 5/10 | Open-source; Phase 3+ adapter candidate |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | ⚙️ Harness | 4/10 | Proprietary; competitive intelligence only |
| [Factory IDE](./developer-gui/factory-ide.md) | 🖥️ GUI | 4/10 | Proprietary; competitive reference only |
| [Airweave](./agent-memory/airweave.md) | 🧠 Memory | 3/10 | Too heavy; Phase 4+ |
| [ElizaOS](./orchestration-platforms/elizaos.md) | 🎛️ Orch. Framework | 3/10 | Web3/chatbot DNA; evaluator pattern only |
| [Qwen-Agent](./agent-harnesses/qwen-agent.md) | ⚙️ Harness | 3/10 | Qwen-coupled; low relevance |
| [Jean](./developer-gui/jean.md) | 🖥️ GUI | 3/10 | Not relevant; different layer |
| [T3 Code](./developer-gui/t3code.md) | 🖥️ GUI | 2/10 | Market signal only |

---

## Categories

### 🎛️ Orchestration Frameworks
Multi-agent coordination, task routing, governance, business orchestration.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Stripe Minions](./orchestration-platforms/stripe-minions.md) | 9/10 | 70/30 deterministic/LLM split — the blueprint pattern for production agent systems |
| [OpenClaw](./orchestration-platforms/openclaw.md) | 6/10 | 271K stars; lane queuing, context checkpoints, stuck-loop detection |
| [Paperclip](./orchestration-platforms/paperclip.md) | 6/10 | Per-token cost attribution + task-keyed session persistence |
| [ElizaOS](./orchestration-platforms/elizaos.md) | 3/10 | Web3/chatbot DNA; Evaluator post-action reflection is the only portable pattern |

---

### ⚙️ Agent Harnesses
CLI tools, SDKs, runtimes, and frameworks that execute agent tasks.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Claude Agent SDK](./agent-harnesses/claude-agent-sdk.md) | 9/10 | SDK + Agent Teams + 18 hooks + subagents — our primary harness |
| [Oh-My-Pi](./agent-harnesses/oh-my-pi.md) | 9/10 | Worktree isolation, hash-anchored state, MCP pooling, model routing, LSP feedback |
| [Pi Agent](./agent-harnesses/pi-agent.md) | 8/10 | Token efficiency, `context` event, SDK embeddability — Day 60+ candidate |
| [Pi Subagents](./agent-harnesses/pi-subagents.md) | 7/10 | Role-based delegation, chain pipelines, observability for Pi |
| [OpenCode](./agent-harnesses/opencode.md) | 7/10 | Go+TS hybrid, 117K stars, TaskTool, Teams — alternative architecture reference |
| [Pi Messenger](./agent-harnesses/pi-messenger.md) | 6/10 | File-based comms, steering injection, wave execution — validates Teams mode patterns |
| [DSPy](./agent-harnesses/dspy.md) | 5/10 | Declarative paradigm, GEPA optimizer, typed contracts — Phase 3+ patterns |
| [OpenAI Codex](./agent-harnesses/openai-codex.md) | 5/10 | Only open-source terminal agent from a major lab; credible second adapter |
| [Copilot SDK](./agent-harnesses/copilot-sdk.md) | 4/10 | Microsoft's platform play; MCP-by-default validates protocol adoption |
| [Qwen-Agent](./agent-harnesses/qwen-agent.md) | 3/10 | Python/Qwen-coupled; DeepPlanning benchmark is the notable output |

---

### 🧠 Agent Memory & Context
Memory systems, context retrieval, knowledge stores, RAG platforms.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Always-On Memory Agent](./agent-memory/always-on-memory-agent.md) | 6/10 | Consolidation-as-sleep pattern for knowledge compounding |
| [Airweave](./agent-memory/airweave.md) | 3/10 | Enterprise retrieval layer; overkill for Phase 1-2 |

---

### 🖥️ Developer GUI / IDE
Desktop/web apps for managing agent sessions, IDE extensions.

| Tool | Relevance | Key Insight |
|------|-----------|-------------|
| [Factory IDE](./developer-gui/factory-ide.md) | 4/10 | Validates autonomous agent thesis at enterprise scale; Droid specialization pattern |
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
| *No entries yet* | | | | |

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
