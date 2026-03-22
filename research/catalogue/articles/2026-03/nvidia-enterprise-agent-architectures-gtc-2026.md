# NVIDIA Agent Toolkit: 12 Enterprise Agent Architectures at GTC 2026

> **NVIDIA — NVIDIA Newsroom, 2026-03-16**

| Field | Value |
|-------|-------|
| Source | [nvidianews.nvidia.com/news/ai-agents](https://nvidianews.nvidia.com/news/ai-agents) |
| Author | NVIDIA |
| Publication | NVIDIA Newsroom |
| Date | 2026-03-16 |
| Topics | agent-orchestration, enterprise-agents, multi-agent, agent-toolkit, infrastructure, partner-ecosystem |
| Read Time | 12 min |
| Complements | [nvidia-ai-agents-gtc-2026.md](./nvidia-ai-agents-gtc-2026.md) (platform overview) |

---

## Burak's Notes

> *This is the partner ecosystem companion to the general GTC announcement we already catalogued. The existing entry covers OpenShell/AI-Q/NemoClaw architecture. This entry catalogues HOW the 12+ biggest enterprise software companies are integrating agent patterns — the real signal is in the implementation architectures, not the NVIDIA platform itself.*

---

## Key Takeaways

1. **Conversational interface as orchestration layer is the dominant pattern** — Salesforce's Agentforce routes through Slack as primary agent interface, SAP through Joule Studio, Atlassian through Rovo. The enterprise pattern is: existing chat/collaboration surface becomes the agent control plane, NOT a separate agent dashboard.
2. **Domain-scoped autonomous workflows beat general-purpose agents** — Siemens (EDA design-to-manufacturing), Cadence (semiconductor verification), Synopsys (multi-agent chip design) all scope their agents to narrow domain workflows. None are building "general AI assistants" — they are automating specific multi-step professional workflows end-to-end.
3. **Security-as-infrastructure, not security-as-afterthought** — Cisco provides AI Defense for OpenShell, CrowdStrike embeds Falcon directly into NVIDIA agent architectures. Security is a horizontal layer injected into the agent runtime, not a wrapper around it. This validates the "policy engine in the runtime" pattern over "guardrails in the prompt."
4. **Hybrid model routing is now table stakes** — Frontier models (Claude/GPT) for orchestration, open models (Nemotron) for research/execution. Every implementation uses this pattern. Cost reduction is 50%+ with no accuracy loss on benchmarks.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | The 12 implementation patterns reveal how the largest companies structure agent workflows. The "chat surface as orchestration layer" pattern (Salesforce/Slack, SAP/Joule) validates our tmux-as-control-plane approach. Domain-scoped agents with narrow workflows match our single-issue-per-worker model. The hybrid model routing pattern (frontier orchestrator + cheap workers) is exactly what we do with Opus orchestrator + worker agents. |
| **Actionable** | 6/10 | Three patterns worth adopting: (1) Cisco/CrowdStrike security-as-runtime-layer — we could add policy enforcement to our tmux workers. (2) Siemens' domain-scoped workflow autonomy — validates scoping each worker to one issue. (3) ServiceNow's "Autonomous Workforce of AI Specialists" naming — each worker is a specialist, not a generalist. No direct integration points, but strong pattern validation. |

---

## Summary

This press release is the partner ecosystem companion to NVIDIA's Agent Toolkit platform announcement at GTC 2026. While the platform announcement (already catalogued) covers OpenShell, AI-Q, and NemoClaw, this page details how 13 enterprise companies are building agent architectures on top of the toolkit.

The implementations cluster into four architectural patterns:

**Pattern 1: Chat-Surface-as-Orchestrator.** Salesforce routes Agentforce agents through Slack as the "primary conversational interface and orchestration layer." SAP channels agents through Joule Studio on Business Technology Platform. Atlassian evolves Rovo AI across Jira and Confluence. The common thread: the existing collaboration tool becomes the agent control plane. No company is building a separate "agent dashboard."

**Pattern 2: Domain-Scoped Autonomous Workflows.** The semiconductor trio — Cadence (ChipStack AI SuperAgent), Siemens (Fuse EDA AI Agent), and Synopsys (AgentEngineer multi-agent framework) — all build agents scoped to specific professional workflows (design, verification, manufacturing sign-off). These agents "autonomously orchestrate domain-scoped workflows" end-to-end, not just answer questions. Dassault Systèmes' "Virtual Companions" are role-based agents, each scoped to a specific enterprise function.

**Pattern 3: Security-as-Infrastructure.** Cisco provides AI Defense for OpenShell with "controls and guardrails to govern agent and claw actions." CrowdStrike's Secure-by-Design AI Blueprint "embeds Falcon platform protection directly into NVIDIA AI agent architectures." Security is injected at the runtime level, not bolted on as a prompt wrapper. CrowdStrike integrates across AI-Q, OpenShell, Nemotron, and NeMo Data Designer — the deepest integration of any partner.

**Pattern 4: Proactive Issue Resolution.** Amdocs' Cognitive Core "continuously monitors customer interactions and billing data to proactively identify and resolve issues before customers are impacted." This shifts from reactive (user asks agent) to proactive (agent detects and acts). A pattern worth watching.

All implementations use the hybrid model routing pattern: frontier models (Claude, GPT) for orchestration decisions, NVIDIA Nemotron open models for research and execution workloads, achieving 50%+ cost reduction.

---

## Notable Quotes

> "Claude Code and OpenClaw have sparked the agent inflection." — Jensen Huang, NVIDIA CEO

> "The enterprise software industry will evolve into specialized agentic platforms." — Jensen Huang

---

## The 13 Enterprise Implementations

### Tier 1: Deep Multi-Component Integration

| Company | Product | Architecture Pattern | NVIDIA Stack |
|---------|---------|---------------------|-------------|
| **CrowdStrike** | Secure-by-Design AI Blueprint | Embeds Falcon security directly into NVIDIA agent runtime; reasoning models for investigative MDR workflows | AI-Q, OpenShell, Nemotron, NeMo Data Designer |
| **Salesforce** | Agentforce | Slack as conversational orchestration layer; agents in service/sales/marketing pull from on-prem + cloud data | Agent Toolkit, Nemotron, NVIDIA AI infra |
| **ServiceNow** | Autonomous Workforce of AI Specialists | Specialist agents on ServiceNow AI Platform using closed + open models | Agent Toolkit, AI-Q Blueprint, Nemotron, Apriel models |

### Tier 2: Domain-Scoped Agent Workflows

| Company | Product | Architecture Pattern | NVIDIA Stack |
|---------|---------|---------------------|-------------|
| **Cadence** | ChipStack AI SuperAgent | Engineers design + verify semiconductor designs with agent assistance | Agent Toolkit, Nemotron |
| **Siemens** | Fuse EDA AI Agent | Autonomously orchestrates design-through-manufacturing-signoff workflows | Nemotron |
| **Synopsys** | AgentEngineer (multi-agent framework) | Multi-agent coordination for semiconductor + systems design | Nemotron, NeMo Agent Toolkit |
| **Dassault Systèmes** | Virtual Companions | Role-based AI agents on enterprise platform | Agent Toolkit, Nemotron |

### Tier 3: Platform Integration

| Company | Product | Architecture Pattern | NVIDIA Stack |
|---------|---------|---------------------|-------------|
| **Adobe** | Hybrid creativity/productivity/marketing agents | Long-running personalized agents in secure environment | Agent Toolkit |
| **Atlassian** | Rovo AI | Agentic strategy across Jira + Confluence | Agent Toolkit, OpenShell |
| **SAP** | Joule Studio agents | Business-customized agents on BTP | Agent Toolkit, NeMo |
| **Palantir** | Sovereign AI agents | Agents on sovereign AI Operating System | Nemotron |

### Tier 4: Security Layer

| Company | Product | Architecture Pattern | NVIDIA Stack |
|---------|---------|---------------------|-------------|
| **Cisco** | AI Defense for OpenShell | Security controls + guardrails governing agent actions | OpenShell |

### Tier 5: Proactive Monitoring

| Company | Product | Architecture Pattern | NVIDIA Stack |
|---------|---------|---------------------|-------------|
| **Amdocs** | Cognitive Core | Continuously monitors interactions + billing to proactively resolve issues | AI-Q, Nemotron |

---

## Cross-Cutting Architecture Patterns

| Pattern | Companies Using It | Our Equivalent |
|---------|-------------------|----------------|
| Chat surface as orchestration layer | Salesforce (Slack), SAP (Joule), Atlassian (Rovo) | tmux as control plane |
| Domain-scoped autonomous workflows | Cadence, Siemens, Synopsys, Dassault | Single-issue-per-worker agents |
| Security injected at runtime | Cisco, CrowdStrike | (gap — no policy enforcement on workers) |
| Hybrid model routing (frontier + open) | All 13 companies | Opus orchestrator + worker agents |
| Proactive agent monitoring | Amdocs | (gap — agents are reactive only) |
| Role-based specialist agents | ServiceNow, Dassault | Worker specialization per issue type |
| Multi-agent coordination | Synopsys, CrowdStrike | Orchestrator + parallel workers |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://developer.nvidia.com/blog/run-autonomous-self-evolving-agents-more-safely-with-nvidia-openshell/ | OpenShell technical architecture — policy enforcement patterns | `/ingest-article` |
| https://developer.nvidia.com/blog/how-to-build-deep-agents-for-enterprise-search-with-nvidia-ai-q-and-langchain | AI-Q + LangChain hybrid routing implementation | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| NVIDIA Agent Toolkit | Umbrella platform for all 13 integrations | Yes — [nvidia-ai-agents-gtc-2026.md](./nvidia-ai-agents-gtc-2026.md) |
| NVIDIA OpenShell | Agent sandbox runtime | Yes — [nvidia-openshell.md](../../infrastructure/nvidia-openshell.md) |
| NVIDIA AI-Q | Hybrid research agent blueprint | Referenced in existing entry |
| NVIDIA Nemotron | Open models used by all 13 partners | Referenced in existing entry |
| Salesforce Agentforce | Slack-based agent orchestration | No |
| CrowdStrike Falcon | Security-as-infrastructure for agents | No |
| Cisco AI Defense | OpenShell security layer | No |
| ServiceNow Apriel | Open models for specialist agents | No |
| Synopsys AgentEngineer | Multi-agent chip design framework | No |
| Siemens Fuse EDA | Autonomous EDA workflow agent | No |
| Cadence ChipStack | Semiconductor design AI SuperAgent | No |

---

## Action Items

- [ ] Study Salesforce Agentforce/Slack orchestration pattern — "chat as control plane" maps to our tmux approach
- [ ] Evaluate CrowdStrike's "security injected at runtime" pattern — could we add policy enforcement to worker agents?
- [ ] Watch for Synopsys AgentEngineer details — multi-agent coordination patterns for semiconductor design may have transferable coordination primitives
- [ ] Track ServiceNow "Autonomous Workforce of AI Specialists" — the naming and scoping model (each agent = one specialist) validates our single-issue-per-worker architecture
