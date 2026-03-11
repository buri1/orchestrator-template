# Arcade.dev

> **The best way to create, deploy, and share MCP Servers — a tool runtime for delegated agent authorization.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [ArcadeAI/arcade-mcp](https://github.com/ArcadeAI/arcade-mcp) |
| Website | [arcade.dev](https://arcade.dev) |
| GitHub Stars | 821 (as of 2026-03-08) |
| Publisher | Arcade AI (startup, VC-funded; CEO Alex Salazar ex-Okta VP / Stormpath founder) |
| License | MIT |
| Tech Stack | Python (core framework), TypeScript + Go (SDKs), MCP protocol, OAuth 2.0, JWT, httpx |
| Maturity | 🟢 Production (enterprise customers including LangChain, Snyk, Relevance AI, Prosus) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly solves the multi-user agent auth problem we'll face when deploying gov client agents. The delegated authorization model (per-user, per-service, per-action scoped tokens) is exactly the pattern we need for DSGVO-compliant multi-tenant agent deployment. Not needed today in Phase 1, but a hard requirement for Phase 3+ when agents act on behalf of multiple client users. |
| **Novelty** | 8/10 | The delegated subset token concept is genuinely new in our research. We've catalogued Composio (auth layer for agents) but Arcade's approach is architecturally distinct: it solves the *over-privileged service token* problem that blocks enterprise adoption, and it does so through a two-layer auth model (server-level JWT + tool-level OAuth) that CISOs already understand from web app security. Sam Partee's framing — "doing work *as* the user is much better than doing work *for* the user" — is a paradigm shift. |
| **Actionable** | 6/10 | The MIT-licensed MCP framework (`arcade-mcp`) can be used today to build custom MCP servers with built-in auth. The full delegated auth platform requires Arcade Cloud (SaaS dependency). For immediate value: study the two-layer auth pattern and the tool definition decorator model. For Phase 3+: evaluate the full platform for multi-user gov agent deployment. |

---

## Overview

Arcade.dev is a **tool runtime** — the infrastructure layer between an AI agent harness and the third-party services that agent needs to access. While agent harnesses like Claude Code, Deep Agents, or our L-Thread handle the LLM loop (planning, file access, sub-agents, context management), Arcade handles the problem that emerges when those agents need to interact with external services on behalf of *multiple users* with *proper authorization*.

The core insight, articulated by CTO Sam Partee in his conference talk with Harrison Chase, is that service tokens fail in enterprise settings in two predictable ways: they're either over-privileged (CISOs block adoption) or under-privileged (agents can't do useful work). Arcade's solution is **delegated agent authorization** — the agent receives a scoped token representing the *exact subset* of permissions authorized for that specific agent, at that specific time, for that specific user, for that specific service. This maps to the security model CISOs have already approved for web applications for 15+ years.

Beyond the auth runtime, Arcade provides an open-source MCP server framework (`arcade-mcp`, MIT licensed) for building custom tools with decorator-based definitions, built-in OAuth, secret injection, and support for both stdio and HTTP transports. They also operate a cloud platform with 100+ pre-built integrations (Gmail, Slack, Salesforce, GitHub, HubSpot, Stripe) and an MCP gateway for aggregating remote MCP servers.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Agent Harness Layer                            │
│  (Claude Code / Deep Agents / L-Thread / any MCP-capable agent) │
└───────────────────────┬──────────────────────────────────────────┘
                        │ MCP Protocol (stdio or HTTP)
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Arcade Tool Runtime                            │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │ LAYER 1:        │  │ LAYER 2:        │  │ MCP Gateway      │ │
│  │ Resource Server │  │ Tool-Level      │  │ (aggregates      │ │
│  │ Auth (JWT)      │  │ Auth (OAuth)    │  │  remote MCP      │ │
│  │                 │  │                 │  │  servers)         │ │
│  │ WHO calls the   │  │ WHAT the tool   │  │                  │ │
│  │ server          │  │ can access      │  │ Dashboard or     │ │
│  │                 │  │                 │  │ AI-assisted      │ │
│  │ Bearer token    │  │ Per-user,       │  │ configuration    │ │
│  │ validation      │  │ per-service,    │  │                  │ │
│  │                 │  │ per-scope       │  │                  │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬─────────┘ │
│           │                    │                     │           │
│  ┌────────▼────────────────────▼─────────────────────▼─────────┐ │
│  │              Tool Execution Engine                           │ │
│  │                                                              │ │
│  │  @app.tool(requires_auth=GitHub(scopes=["repo"]))           │ │
│  │  async def create_issue(context: Context, ...):             │ │
│  │      token = context.get_auth_token_or_empty()              │ │
│  │      # Token scoped to THIS user + THIS service only        │ │
│  │                                                              │ │
│  │  Pre/post-execution hooks for:                              │ │
│  │    - RBAC enforcement                                       │ │
│  │    - PII detection                                          │ │
│  │    - Named entity recognition                               │ │
│  │    - Entitlement system integration                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         External Services (100+ pre-built)                   │ │
│  │  Gmail, Slack, GitHub, Salesforce, HubSpot, Stripe,         │ │
│  │  Google Calendar, Google Drive, Firecrawl, Reddit, ...      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Two-Layer Auth Model (the key innovation):**

| Layer | Purpose | Mechanism | Analogy |
|-------|---------|-----------|---------|
| **Resource Server Auth** | Validates *who* calls your MCP server | JWT Bearer token on every HTTP request | API gateway authentication |
| **Tool-Level Auth** | Validates *what* the tool can access externally | Per-tool OAuth scopes declared via decorator; Arcade manages token lifecycle | Web app OAuth consent flow |

**Token isolation properties:**
- Tokens are never stored on the agent's server — Arcade manages the OAuth lifecycle
- Each user gets isolated tokens per service (no cross-user token reuse)
- Each tool declares only the OAuth scopes it needs (no over-privileging)
- LLMs and MCP clients cannot see or access OAuth tokens — they're injected into the context at runtime

**Tool definition model:**
```python
@app.tool(requires_auth=GitHub(scopes=["repo", "read:user"]))
async def create_issue(context: Context, repo: str, title: str):
    token = context.get_auth_token_or_empty()
    # Token scoped: only GitHub, only "repo" + "read:user", only this user
```

**Framework integrations:** LangChain, OpenAI Agents, CrewAI, Google ADK, Vercel AI SDK, Mastra, TanStack AI.

**SDKs:** Python (`arcade-py`, 50 stars), TypeScript (`arcade-js`, 32 stars), Go (`arcade-go`, 4 stars).

**Deployment options:** Arcade Cloud (managed), VPC, on-premises, air-gapped.

---

## Publisher Background

Arcade AI was founded by **Alex Salazar** (CEO) and **Sam Partee** (CTO). Salazar is the former VP at Okta and founder of Stormpath (identity-as-a-service startup acquired by Okta in 2017) — so the team's auth/identity DNA is not incidental; it's the entire thesis. Partee was Principal AI Engineer at Redis and a major open-source contributor. Founding engineer **Nate Barbettini** is an auth specialist who created "the world's most-watched OAuth training."

The team is approximately 20+ people. Enterprise customers include LangChain (Harrison Chase featured Sam in a joint conference talk), Snyk, Relevance AI, and Prosus. The team's track record in identity infrastructure (Okta/Stormpath lineage) gives them genuine credibility on the auth problem — this isn't an AI startup bolting on auth as an afterthought; it's an auth team building for the AI use case.

The partnership with LangChain (Deep Agents + Arcade as the "harness + tool runtime" stack) positions them as the de facto auth layer for the LangChain ecosystem. The Arcade Registry (beta) for publishing and monetizing agentic tools signals marketplace ambitions.

---

## What's Valuable for Us

| Pattern | Where in Arcade | How to Apply |
|---------|----------------|--------------|
| **Delegated subset tokens** | Two-layer auth model | The core pattern: agents get per-user, per-service, per-action scoped tokens instead of over-privileged service tokens. When we deploy gov client agents that need to access their systems, this is the auth model to implement — whether via Arcade or as a self-built pattern. Maps directly to Master Blueprint Principle 2 (deterministic orchestration) and Principle 6 (federated systems). |
| **Tool-level OAuth declaration** | `@app.tool(requires_auth=...)` decorator | Clean declarative model where each tool states exactly what auth it needs. Adopt this pattern for our custom MCP tools — even if we don't use Arcade's platform, the decorator pattern for auth declaration is worth stealing. |
| **Pre/post-execution hooks** | Entitlement system integration | RBAC checks, PII detection, NER before tool execution. Maps to our Quality Gates layer (Master Blueprint Layer 3). Deterministic pre-flight checks before LLM-driven tool execution = our 70/30 split in action. |
| **MCP server framework** | `arcade-mcp` (MIT) | Drop-in framework for building custom MCP servers with built-in auth. If we need to expose our own tools as MCP servers (e.g., for other agents to call our services), this is the fastest path. |
| **"Doing work AS the user"** | Delegated auth philosophy | Sam's key insight: service tokens mean agents work *for* the user (with the agent's permissions). Delegated auth means agents work *as* the user (with the user's permissions). This distinction matters for DSGVO compliance — data processing on behalf of the user with the user's own consent is legally cleaner than service-account access. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **SaaS dependency for full platform** | The delegated auth runtime (token management, OAuth lifecycle) requires Arcade Cloud or VPC deployment. For Phase 1-2 where we run local agents via tmux, we don't need this layer yet. The open-source `arcade-mcp` framework is useful standalone; the full platform is a Phase 3+ evaluation. |
| **100+ pre-built integrations** | We need 5-10 integrations max (Notion, GitHub, Slack). Same critique as Composio — breadth we don't need. The value is in the auth model, not the integration count. |
| **Python-first framework** | The core `arcade-mcp` framework is Python. Our stack leans TypeScript. The TypeScript SDK (`arcade-js`) exists for consuming Arcade as a client, but building custom tools requires Python. Not a dealbreaker, but adds friction. |
| **821 stars (relatively small)** | Compared to Composio (27K) or LiteLLM (30K+), Arcade is early in OSS traction. The enterprise customer list and Okta pedigree de-risk this, but community momentum is still building. |
| **Overlap with Composio** | Both solve auth-for-agents. Arcade's approach (delegated subset tokens, two-layer auth) is architecturally superior to Composio's (managed OAuth), but Composio has 33x the GitHub stars and broader framework support. Monitor both. |

---

## Comparison with Composio

| Dimension | Arcade.dev | Composio |
|-----------|-----------|----------|
| **Core thesis** | Delegated agent authorization (security-first) | Integration breadth (connectivity-first) |
| **Auth model** | Two-layer: server JWT + per-tool OAuth scopes | Managed OAuth per entity/connection |
| **Key differentiator** | Subset tokens solve over-privileged service token problem | 1000+ pre-built integrations |
| **Founder DNA** | Okta/Stormpath (identity infrastructure) | Integration/automation background |
| **OSS framework** | `arcade-mcp` (MIT) — build custom MCP servers | `composio-core` — consume pre-built tools |
| **GitHub Stars** | 821 | 27,300 |
| **Enterprise readiness** | Air-gapped + VPC deployment options | Cloud SaaS |
| **DSGVO compatibility** | Better (on-prem/air-gapped; user-controlled data residency) | Worse (cloud SaaS dependency) |

**Verdict:** For our gov client work requiring DSGVO compliance, Arcade's on-prem/air-gapped deployment and delegated auth model are architecturally superior. For rapid prototyping with many integrations, Composio wins on breadth.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No action needed. Study the two-layer auth pattern as a reference architecture for future multi-user agent deployment.
- **Phase 2 (Days 4-60):** Use `arcade-mcp` (MIT) as a reference for building custom MCP servers with auth. The decorator-based tool definition pattern is clean and worth adopting even without the full platform.
- **Phase 3 (Days 60-90):** Evaluate the full Arcade platform (VPC or on-prem) for gov client agents that need to access client systems with delegated authorization. This is where the over-privileged service token problem becomes real.
- **Phase 4 (Days 90+):** If building multi-tenant SaaS agents (SaaS Factory business line), Arcade's per-user token isolation maps directly to multi-tenant auth requirements. The MCP Gateway becomes valuable for aggregating multiple client-specific MCP servers.

---

## Key Takeaway

> **Arcade.dev is the most architecturally sound solution to the agent authorization problem — its delegated subset token model (per-user, per-service, per-action scoped) solves the over-privileged service token blocker that will gate our gov client multi-user agent deployment in Phase 3+, and its on-prem/air-gapped deployment options make it DSGVO-compatible unlike cloud-only alternatives.**
