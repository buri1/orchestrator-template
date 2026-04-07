# Notion as Agent Backend

> **Notion 3.3 custom agents as portfolio management backend: hub-and-spoke database architecture with 22 databases across 4 levels, MCP integration patterns, API rate limit strategies, and agent interaction blueprints for daily sync, lead processing, invoice generation, and content publishing.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-notion-portfolio-architecture.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document designs the complete Notion database architecture for a multi-business portfolio management system that serves as both the human interface and the agent data layer. It covers Notion's evolution through 3.0-3.3 (native AI agents, custom 24/7 autonomous agents, enhanced markdown API), MCP integration via the official `@notionhq/notion-mcp-server` package, API limitations (3 req/sec, 10K rows/DB, no real-time webhooks), and caching strategies.

The architecture follows a four-level hub-and-spoke model: Level 4 (Executive: Portfolio Dashboard), Level 3 (Business Lines), Level 2 (Operational: Projects, Tasks, CRM, Revenue, Knowledge Base, Time Log + Business-specific: Contracts, Deliverables, Products, Launches, Campaigns, Leads, Offers, Content Calendar), and 7 existing Finance Agent databases bridged via a nightly sync agent. Total: 22 databases with explicit relation maps, agent read/write permissions, MCP tool mappings, and update frequencies per database.

The core design principle is that Notion is a meta-layer and human interface, not a high-frequency transactional database. Agent logs, real-time metrics, and bulk operations should use local files or dedicated databases. Notion is used for configuration/state (low write frequency), dashboards/reporting (read-heavy, cacheable), human review/approval (interactive), and knowledge base (append-mostly). A three-layer caching strategy (in-memory 30s TTL, local file 1-5min TTL, Notion API as source of truth) manages the rate limit bottleneck.

---

## Key Findings

### Notion 3.3 State (March 2026)

- **Notion 3.0 (Sep 2025)**: Native AI agents with multi-step actions
- **Notion 3.2 (Jan 2026)**: Mobile AI, new models, people directory
- **Notion 3.3 (Feb 2026)**: Custom Agents -- fully autonomous, 24/7 operation based on triggers/schedules
- **Enhanced Markdown API**: Three new endpoints (POST/GET/PATCH on `/v1/pages`) for creating, reading, and updating page content via markdown, simpler than block-based writes
- **"can create pages" permission (March 5, 2026)**: Write-only access to specific databases without exposing other content -- ideal for automated agent reporting

### API Limitations and Mitigations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| 3 req/sec (2,700/15min) | Bottleneck at 5+ agents | Request queue + backoff; one token per agent if needed |
| 100 items per page | Slow for large reads | Cursor-based pagination with aggregation |
| 10,000 rows per DB | Data volume ceiling | Archive old records; split by time period |
| 50 columns per DB | Schema width limit | Linked pages for overflow properties |
| No real-time webhooks | No push notifications | Poll with caching; Notion Automations for triggers |
| Rollup on rollup not supported | Computation limit | Pre-compute in agent; store as direct property |

### Database Architecture (22 DBs, 4 Levels)

**Level 4 - Executive**: Portfolio Dashboard (health score formula, revenue trends, business line rollups)

**Level 3 - Business Lines**: 5 fixed entries (Client Work, Agent Swarm Experiments, SaaS Factory, Lead Generation, Marketing & Content) with revenue targets and pipeline tracking

**Level 2 - Operational Cross-Cutting**: Projects (unified tracker with Kanban/Timeline/Blocked views), Tasks (granular work items with self-referencing dependency relations), Contacts/CRM (full pipeline stages from Cold through Won/Lost/Churned), Revenue Tracking (every financial transaction with MRR flagging), Knowledge Base (institutional memory with confidence levels), Time Log (billable tracking)

**Level 2 - Business-Specific**: Contracts + Deliverables (client work), Products + Launches (SaaS factory), Campaigns + Leads (lead gen), Offers + Content Calendar (marketing)

**Existing Finance Agent**: 7 German-named DBs (Glaubiger, Fristen, E-Mail Entwurfe, Posteingang, Finanzstatus, Abos, Private Schulden) bridged via nightly sync agent

### Agent Interaction Patterns

Five documented patterns with rate budget estimates:
1. **Daily Portfolio Sync**: ~20 API calls, query revenue/projects/leads, update business lines and dashboard
2. **Lead Processing**: ~5 calls per lead (batch of 10 = 50 calls, ~17 seconds), score + qualify + create follow-up tasks
3. **Invoice Generation**: ~8 calls per invoice, read contract + time log, calculate amount, create draft
4. **Content Publishing**: ~6 calls per content piece, read brief, publish externally, update status + analytics
5. **Knowledge Capture**: Triggered on project completion, create post-mortem entry, link to project

### MCP Integration

Official server via `@notionhq/notion-mcp-server` with OAuth (human-supervised) or Internal Integration Token (automated agents). Best practices: batch operations with 300ms delays, idempotency checks before creates, property type validation before writes, exponential backoff on 429 responses.

---

## Actionable Insights

- **Each business line gets its own Level 2 databases with relations back to the hub**: This maintains data isolation while enabling portfolio-level aggregation
- **Rollups should only aggregate one level down**: Deep chains degrade performance; compute multi-level aggregations in agent code and store results as direct properties
- **Use Internal Integration Token for automated agents, OAuth for human sessions**: The Claude Code MCP config uses the official package with Bearer auth
- **Archive strategy is critical**: At 10K rows/DB ceiling, high-volume databases (Tasks, Revenue, Leads) need time-based archival; move completed records to archive databases quarterly
- **Finance Agent databases stay unchanged**: Bridge via nightly sync agent rather than migrating data, minimizing risk to the working finance system
- **The Knowledge Base is the compounding asset**: Every project post-mortem, research finding, and pattern captured here improves future agent performance through context retrieval

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](master-blueprint.md) | Notion as unified intelligence/frontend layer across federated business lines is a core architecture decision |
| [reference/hormozi-framework-encoding.md](hormozi-framework-encoding.md) | Offers, Leads, Content Calendar, Sales Scripts, Avatars databases integrate the Hormozi agent system |
| [reference/observability-trust-infrastructure.md](observability-trust-infrastructure.md) | Agent Activity Log and Daily Metrics databases connect to the observability pipeline |
| [reference/lead-gen-pipeline-architecture.md](lead-gen-pipeline-architecture.md) | Campaigns and Leads databases track the automated lead gen pipeline |
| [reference/saas-factory-infrastructure.md](saas-factory-infrastructure.md) | Products and Launches databases track the SaaS portfolio lifecycle |
| [practitioners/mario-zechner.md](../practitioners/mario-zechner.md) | Mario Zechner's Pi Agent SDK can interact with Notion via MCP adapter |
