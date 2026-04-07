# Composio

> **Powers 1000+ toolkits, tool search, context management, authentication, and a sandboxed workbench to help you build AI agents that turn intent into action.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [ComposioHQ/composio](https://github.com/ComposioHQ/composio) |
| GitHub Stars | 27,300 (as of 2026-03-08) |
| Publisher | Composio HQ (startup, VC-funded) |
| License | MIT |
| Tech Stack | Python + TypeScript (dual SDK), polyglot integrations, OAuth/API key management, sandboxed execution |
| Maturity | 🟢 Production (1000+ tool integrations, active enterprise customers) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | The authentication management and tool integration layer solve a real problem we'll face when connecting agents to external services (Notion, Airtable, Gmail, Slack). Not an orchestrator competitor — it's a tool layer. |
| **Novelty** | 5/10 | Managed OAuth/auth lifecycle for AI agents is genuinely useful — most frameworks punt on this. The 1000+ pre-built tool catalog is impressive breadth. |
| **Actionable** | 5/10 | TypeScript SDK exists and is first-class. Could plug into our agents as a tool provider for external service integrations. The auth management alone could save days of OAuth plumbing. |

---

## Overview

Composio is not an orchestration framework — it's an **integration and authentication layer** for AI agents. While it's often mentioned alongside CrewAI and LangGraph, its actual function is different: it provides 1000+ pre-built tool integrations (Gmail, Slack, GitHub, Notion, Jira, Salesforce, etc.) with managed authentication (OAuth flows, API keys, refresh tokens) so that agents from any framework can interact with external services without building custom integrations.

The key value proposition is solving the "last mile" problem of agent-to-service connectivity. When your agent needs to send an email, create a Jira ticket, or read a Notion page, Composio handles the authentication lifecycle, API call formatting, error handling, and response parsing. It's framework-agnostic — works with OpenAI, Anthropic, LangChain, CrewAI, AutoGen, Vercel AI SDK, Google ADK, and more.

Composio also provides a sandboxed execution environment (workbench) for agents to run code safely, and a tool search capability that lets agents discover and select relevant tools dynamically based on natural language descriptions.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  Your Agent                      │
│  (Claude Code / CrewAI / LangChain / any)       │
└──────────────────┬──────────────────────────────┘
                   │ Composio SDK (TS or Python)
                   ▼
┌─────────────────────────────────────────────────┐
│              Composio Platform                   │
│                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Tool       │  │ Auth         │  │ Context  │ │
│  │ Registry   │  │ Manager      │  │ Manager  │ │
│  │ (1000+     │  │ (OAuth,      │  │ (tool    │ │
│  │  tools)    │  │  API keys,   │  │  search, │ │
│  │            │  │  refresh)    │  │  select) │ │
│  └─────┬──────┘  └──────┬───────┘  └────┬─────┘ │
│        │               │               │        │
│  ┌─────▼───────────────▼───────────────▼──────┐  │
│  │         Sandboxed Workbench                 │  │
│  │  (code execution, file ops, browser)       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │     External Services (500+ apps)          │  │
│  │  Gmail, Slack, GitHub, Notion, Jira,       │  │
│  │  Salesforce, HubSpot, Airtable, ...        │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Core abstractions:**

| Concept | Description |
|---------|-------------|
| **Toolkit** | Collection of related tools for a service (e.g., GitHub toolkit: create issue, create PR, list repos) |
| **Action** | Individual API operation within a toolkit |
| **Entity** | End-user whose credentials are managed (multi-tenant auth) |
| **Connection** | Authenticated link between an entity and a service |
| **Trigger** | Event-driven webhook from external services to agents |

**Auth management lifecycle:** Composio handles the full OAuth dance — redirect URL generation, token exchange, refresh token rotation, credential storage per entity. This is the hardest part of external service integration and the most valuable feature.

**Framework adapters:** Separate packages for each framework integration (`composio-openai`, `composio-langchain`, `composio-crewai`, etc.) that convert Composio tools into framework-native tool definitions.

---

## Publisher Background

Composio HQ is a VC-funded startup focused on the agent tooling layer. They've grown rapidly (27K+ stars) by solving a genuine pain point — the authentication and integration gap in the agent ecosystem. Their strategy is to be the "Zapier for AI agents" — framework-agnostic, sitting between any agent and any external service. The dual Python/TypeScript SDK approach shows they understand the market is split. Blog content is marketing-heavy ("2026 Guide to AI Agent Builders") but the underlying product solves a real technical problem. The team appears to be well-funded and growing.

---

## What's Valuable for Us

| Pattern | Where in Composio | How to Apply |
|---------|-------------------|--------------|
| **Managed OAuth for agents** | Auth Manager / Entity system | When our agents need to interact with Notion, Airtable, Gmail, or Slack (all in our roadmap), Composio's auth management could save significant integration time. Instead of building OAuth flows ourselves, use their SDK. |
| **Tool search by description** | Context Manager | Dynamic tool discovery — agent describes what it needs, gets relevant tools. Interesting for Phase 4 when agents need to self-select integrations. |
| **Multi-tenant auth** | Entity + Connection model | Each business line (DSGVO isolation) gets its own entity with separate credentials. Maps well to our federated architecture. |
| **TypeScript SDK** | `composio-core` npm package | First-class TypeScript support means we can actually use this. Check compatibility with our Claude Code agent spawning pattern. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Not an orchestrator** | Composio doesn't replace our L-Thread orchestrator — it's a tool layer. Don't confuse the categories. |
| **SaaS dependency** | Composio Platform is a hosted service. Adding it means runtime dependency on their infrastructure. For gov/DSGVO work, this may be a blocker. |
| **1000 tools we don't need** | We need maybe 5-10 integrations (Notion, Airtable, Gmail, Slack, GitHub). The other 990+ are noise. Building 5 custom integrations might be simpler than adopting a platform. |
| **Framework adapter overhead** | Their adapter pattern (`composio-openai`, etc.) adds dependency weight. We'd need to check if the raw SDK can be used with Claude Code directly. |
| **Pricing model** | As a VC-funded startup, expect the pricing to become aggressive once free tier users convert. Factor in long-term cost. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Evaluate Composio's TypeScript SDK for Notion and Airtable integration — compare effort vs. building custom OAuth flows. If DSGVO compliance allows, this could accelerate external service connectivity.
- **Phase 3 (Days 60-90):** If multiple business lines need different external service integrations, the multi-tenant Entity model maps cleanly to our federated architecture.
- **Phase 4 (Days 90+):** Tool search capability becomes interesting when agents need to self-select integrations dynamically based on task requirements.

---

## Key Takeaway

> **Composio is not an orchestrator but an authentication/integration layer — evaluate the TypeScript SDK for Notion/Airtable connectivity in Phase 2, but weigh the SaaS dependency against building 5 custom OAuth flows ourselves.**
