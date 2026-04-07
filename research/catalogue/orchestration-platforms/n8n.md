# n8n

> **Fair-code workflow automation platform with native AI capabilities. Combine visual building with custom code, self-host or cloud, 400+ integrations.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [github.com/n8n-io/n8n](https://github.com/n8n-io/n8n) |
| GitHub Stars | 178,077 (as of 2026-03-08) |
| Publisher | n8n GmbH (startup, Berlin-based, VC-backed) |
| License | Sustainable Use License / n8n Enterprise License (fair-code, source-available) |
| Tech Stack | TypeScript (91.4%), Vue (7.2%), SCSS, JavaScript, Python |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Visual workflow builder solves a different problem than our terminal-first, prompt-engineered orchestration. AI agent features are bolted-on LangChain wrappers, not native multi-agent coordination. |
| **Novelty** | 3/10 | Well-known platform. LangChain-based AI agent nodes add nothing we haven't seen. The visual canvas paradigm is orthogonal to our approach. |
| **Actionable** | 3/10 | Could theoretically wrap n8n as a deterministic routing layer for webhook-triggered workflows, but our shell-based approach is lighter and more controllable. No patterns to extract. |

---

## Overview

n8n is a massively popular workflow automation platform that bridges the gap between no-code and full-code development. With 178K+ GitHub stars, it has become one of the most adopted open-source automation tools, offering a visual canvas for building workflows combined with the ability to drop into JavaScript or Python when needed. The platform supports 400+ integrations out of the box, from CRMs to databases to messaging platforms.

The AI agent capabilities were added via LangChain integration, providing an "AI Agent" node that can reason about tool selection, maintain memory across interactions, and chain multiple LLM calls together. However, these are fundamentally single-agent workflows with sequential execution — n8n's multi-agent support is limited to spawning sub-workflows via the Execute Workflow node, which is a far cry from true multi-agent orchestration.

n8n positions itself as "fair-code" — source-available but with commercial restrictions. Self-hosting is free for most use cases, but the license prohibits offering n8n as a service. The cloud offering provides managed hosting with additional enterprise features like SSO and audit logs.

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│              n8n Server                  │
│  ┌──────────┐  ┌───────────────────┐    │
│  │ Workflow  │  │  Execution Engine │    │
│  │  Editor   │  │  (Node Runner)    │    │
│  │  (Vue)    │  │                   │    │
│  └──────────┘  └───────────────────┘    │
│       │              │                   │
│  ┌──────────┐  ┌───────────────────┐    │
│  │ REST API │  │  Queue (Bull/Redis)│    │
│  └──────────┘  └───────────────────┘    │
│       │              │                   │
│  ┌──────────────────────────────────┐   │
│  │     Database (SQLite/Postgres)    │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Core Abstractions:**
- **Workflow**: Directed graph of nodes with connections
- **Node**: Single execution unit (trigger, action, or AI agent)
- **Execution**: A single run of a workflow with input/output data per node
- **Credentials**: Encrypted storage for API keys and OAuth tokens

**AI Agent Architecture:**
- LangChain-powered AI Agent node as orchestration layer
- Sub-nodes for LLM selection, memory (buffer/window/vector), and tools
- Tools connect to any n8n integration (HTTP, database, API nodes)
- Sequential execution by default; parallel via Execute Sub-workflow node

**Infrastructure:**
- Self-hosted via Docker or npm, or managed cloud
- Queue-based execution with Bull/Redis for horizontal scaling
- SQLite for single-instance, PostgreSQL for production
- 620+ contributors, v2.10.4 (March 2026)

---

## Publisher Background

n8n GmbH is a Berlin-based startup founded by Jan Oberhauser in 2019. The company raised a $12M Series A led by Sequoia Capital in 2022 and has continued growing since. The team has 50+ employees and 620+ open-source contributors. Oberhauser previously worked at various startups before building n8n as an open-source alternative to Zapier/Make. The company generates revenue through n8n Cloud (managed hosting) and enterprise licenses. With 178K GitHub stars, it's one of the most starred open-source projects globally.

---

## What's Valuable for Us

**Webhook + Event Triggers as Deterministic Entry Points**: n8n's trigger node catalog (webhooks, cron, email, database changes, etc.) is the most comprehensive collection of event-driven entry points available. If we ever need to bridge external events into our orchestrator, referencing n8n's trigger implementations could save time.

**Queue-Based Execution Model**: n8n's Bull/Redis queue architecture for scaling workflow execution horizontally is a well-proven pattern. Our orchestrator could adopt a similar queue-based approach for the deterministic 70% of our routing layer if we need to scale beyond single-machine tmux sessions.

**Credential Management**: The encrypted credential store with OAuth flow support is a mature implementation worth studying if we ever need to manage API credentials across multiple business lines in our federated architecture.

---

## What's NOT Relevant

**Visual Canvas / No-Code Paradigm**: Our architecture is terminal-first, prompt-engineered. A visual workflow editor adds latency, UI complexity, and constrains the flexibility that makes our L-Thread pattern powerful. Directly conflicts with our "thin shared layer" principle.

**LangChain-Based AI Agents**: n8n's AI agent implementation is a thin wrapper around LangChain's agent executor. We've deliberately chosen pure prompt engineering over framework-dependent approaches. LangChain adds abstraction layers that obscure control flow — the opposite of our 70/30 deterministic/LLM split.

**Single-Agent Sequential Model**: n8n workflows are fundamentally single-threaded per execution. Their "multi-agent" approach (sub-workflows) lacks the true parallel coordination, shared state, and inter-agent communication that define our orchestrator. Conflicts with our 2-3 agent optimal team pattern.

**Fair-Code License Restrictions**: The license prohibits offering n8n as a service, which could constrain future SaaS plays. Not MIT/Apache, so less flexible for commercial reuse.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Could serve as a webhook receiver layer if we need to bridge Notion/Airtable/Slack events into the orchestrator without building custom webhook handlers
- **Phase 4 (Days 90+)**: If we build a client-facing automation product, n8n's plugin architecture could be a reference for building a marketplace of deterministic workflow components

---

## Key Takeaway

> **n8n is the gold standard for visual workflow automation and a reference implementation for webhook/event routing, but its bolted-on LangChain AI agents are toy-level compared to purpose-built multi-agent orchestration — study it for infrastructure patterns, not agent architecture.**
