# Notion Portfolio Architecture: Multi-Business Agent Backend

**Date**: 2026-03-06
**Type**: Research + Architecture Design
**Status**: Complete

---

## Table of Contents

1. [Research: Notion as AI Agent Backend](#1-research-notion-as-ai-agent-backend)
2. [Research: Portfolio Management Patterns](#2-research-portfolio-management-patterns)
3. [Research: Notion MCP Integration with Claude Code](#3-research-notion-mcp-integration-with-claude-code)
4. [Research: API Limitations and Workarounds](#4-research-api-limitations-and-workarounds)
5. [Complete Database Schema](#5-complete-database-schema)
6. [Agent Interaction Patterns](#6-agent-interaction-patterns)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Research: Notion as AI Agent Backend

### Current State (March 2026)

Notion has evolved significantly as an agent backend:

- **Notion 3.0 (Sep 2025)**: Introduced native AI Agents capable of multi-step actions
- **Notion 3.2 (Jan 2026)**: Mobile AI, new models, people directory
- **Notion 3.3 (Feb 2026)**: Custom Agents -- fully autonomous, 24/7 operation based on triggers/schedules
- **Enhanced Markdown API**: Three new endpoints for creating, reading, and updating page content via markdown (POST, GET, PATCH on `/v1/pages`)

### How Practitioners Use Notion as Agent Data Layer

1. **Structured Task Queues**: Databases as work queues where agents pick up tasks with status filters
2. **Configuration Store**: Agent parameters, prompts, and settings stored in Notion pages
3. **Audit Trail**: Every agent action creates/updates a Notion page, providing full traceability
4. **Knowledge Graph**: Relations between databases create a navigable knowledge structure agents can traverse
5. **Human-in-the-Loop**: Notion's UI serves as the review/approval interface for agent outputs

### Performance Assessment

| Factor | Limit | Impact |
|--------|-------|--------|
| API Rate | 3 req/sec (180/min, 2700/15min) | Moderate -- sufficient for 1-3 agents, bottleneck at 5+ |
| Database Rows | 10,000 per DB | Moderate -- requires archival strategy for high-volume DBs |
| Columns per DB | 50 | Low -- sufficient for all use cases |
| Relations per DB | 100 | Low -- more than enough |
| Pagination | 100 items per response | Moderate -- requires cursor-based iteration for large queries |
| Rollup Performance | Degrades at 1000+ related items | High -- avoid deep rollup chains |

### Scalability Ceiling

Notion works well as a **meta-layer** and **human interface** but is NOT suitable as a high-frequency transactional database. The architecture should use Notion for:

- **Configuration and state** (low write frequency)
- **Dashboards and reporting** (read-heavy, cacheable)
- **Human review and approval** (interactive)
- **Knowledge base** (append-mostly)

And use local files / dedicated databases for:
- **Agent logs** (high write frequency)
- **Real-time metrics** (sub-second updates)
- **Large dataset processing** (bulk operations)

---

## 2. Research: Portfolio Management Patterns

### Best-Practice Structures

The most effective Notion portfolio systems use a **hub-and-spoke** model:

- **Hub**: A single Portfolio Dashboard database with rollups from all business lines
- **Spokes**: Business-line-specific databases that relate back to the hub

### Cross-Database Rollup Strategy

1. **Level 1 (Atomic)**: Tasks, Contacts, Transactions -- granular data
2. **Level 2 (Aggregate)**: Projects, Campaigns, Products -- group atomic items
3. **Level 3 (Portfolio)**: Business Lines, Revenue Summary -- rollups from Level 2
4. **Level 4 (Executive)**: Portfolio Dashboard -- rollups from Level 3

This hierarchy ensures each rollup only aggregates one level down, avoiding the deep-chain performance penalty.

### Key Template Patterns (2026)

- **Small Business OS**: All-in-one dashboard covering client management to finances
- **Portfolio Management Suite Pro**: Comprehensive project + portfolio views using Charts and AI
- **Sales CRM + Project Manager**: Combined pipeline and delivery tracking

---

## 3. Research: Notion MCP Integration with Claude Code

### Official Notion MCP Server

**Repository**: [github.com/makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server)

**Supported Tool Categories**:

| Category | Tools | Use Case |
|----------|-------|----------|
| Search | `notion-search` | Find pages/databases by query |
| Pages | `notion-create-pages`, `notion-update-page`, `notion-fetch` | CRUD on pages |
| Databases | `notion-create-database`, `notion-search` (filtered) | Create and query DBs |
| Comments | `notion-create-comment`, `notion-get-comments` | Collaboration |
| Users | `notion-get-users`, `notion-get-teams` | Team management |
| Navigation | `notion-move-pages`, `notion-duplicate-page` | Structure management |
| Data Sources | `notion-update-data-source` | External data sync |

### Authentication Modes

1. **OAuth (Official MCP)**: User-based, requires interactive login. Best for human-supervised workflows.
2. **Internal Integration Token**: API key-based. Works for automated/headless agent flows. Configure in Notion workspace settings.
3. **Composio Wrapper**: Handles OAuth flow with encrypted token storage, SOC 2 Type 2 compliant.

**Recommendation for Agent System**: Use Internal Integration Token for fully automated agents. OAuth for human-interactive sessions. The Claude Code MCP config uses the official `@notionhq/notion-mcp-server` package.

### Claude Code MCP Configuration

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer <NOTION_API_KEY>\", \"Notion-Version\": \"2022-06-28\"}"
      }
    }
  }
}
```

### Best Practices for Agent Writes

1. **Batch operations**: Group related writes (e.g., create project + all its tasks) into sequential calls with 300ms delays
2. **Idempotency**: Always check if item exists before creating (use `notion-search` first)
3. **Property validation**: Validate property types before write -- Notion silently drops invalid property values
4. **Markdown endpoints**: Prefer the new markdown API for page content (simpler than block-based writes)
5. **Error recovery**: Implement retry with exponential backoff on 429 responses

---

## 4. Research: API Limitations and Workarounds

### Rate Limit Architecture

```
Rate Budget: 2,700 requests / 15 minutes / integration token
             = 180 requests / minute
             = 3 requests / second (average)
             Burst: short bursts above 3/sec allowed
```

### Critical Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| 3 req/sec rate limit | Agent parallelism bottleneck | Request queue + backoff; use one token per agent if needed |
| 100 items per page | Slow for large DB reads | Cursor-based pagination with aggregation |
| 10,000 rows per DB | Data volume ceiling | Archive old records; split by time period |
| 50 columns per DB | Schema width limit | Use linked pages for overflow properties |
| No real-time webhooks | No push notifications | Poll with caching; use Notion Automations for triggers |
| Rollup on rollup | Not supported | Compute in agent code; store result as direct property |
| Formula complexity | Limited function set | Pre-compute in agent; write result to DB |
| No bulk write API | Slow for mass updates | Sequential writes with queuing; batch in agent |

### Caching Strategy for Agent Access

```
Layer 1: In-Memory Cache (agent process)
  - TTL: 30 seconds for active queries
  - Use: Repeated reads within a single agent task

Layer 2: Local File Cache (JSON)
  - TTL: 5 minutes for reference data (contacts, config)
  - TTL: 1 minute for active project data
  - Location: _bmad/notion-cache/

Layer 3: Notion API (source of truth)
  - Always write-through (cache + API)
  - Read-through on cache miss
```

### When to Use Notion vs Local Files

| Data Type | Notion | Local Files | Reason |
|-----------|--------|-------------|--------|
| Project status | Yes | No | Human visibility |
| Task tracking | Yes | No | Human interaction |
| Agent logs | No | Yes | High frequency |
| Revenue data | Yes | No | Dashboard/reporting |
| Config/prompts | Yes | Cache locally | Source of truth + speed |
| Research output | Yes (summary) | Yes (full) | Notion for discovery, local for detail |
| Metrics time-series | No | Yes/DB | Volume + query speed |
| Knowledge base | Yes | No | Searchable, shareable |

---

## 5. Complete Database Schema

### Schema Overview (22 Databases Total)

```
LEVEL 4 - EXECUTIVE
  Portfolio Dashboard (1 DB)

LEVEL 3 - BUSINESS LINES
  Business Lines (1 DB)

LEVEL 2 - OPERATIONAL (Cross-Cutting)
  Projects (1 DB)
  Tasks (1 DB)
  Contacts / CRM (1 DB)
  Revenue Tracking (1 DB)
  Knowledge Base (1 DB)
  Time Log (1 DB)

LEVEL 2 - BUSINESS-SPECIFIC
  Client Work: Contracts (1 DB), Deliverables (1 DB)
  SaaS Factory: Products (1 DB), Launches (1 DB)
  Lead Gen: Campaigns (1 DB), Leads (1 DB)
  Marketing: Offers (1 DB), Content Calendar (1 DB)

EXISTING - FINANCE AGENT (7 DBs, keep as-is)
  Glaubiger, Fristen, E-Mail Entwurfe, Posteingang,
  Finanzstatus, Abos, Private Schulden
```

### Relation Map

```
Portfolio Dashboard
  |-- rollup from --> Business Lines
       |-- relation --> Projects
       |    |-- relation --> Tasks
       |    |-- relation --> Deliverables
       |    |-- relation --> Contracts
       |    |-- relation --> Products
       |    |-- relation --> Launches
       |    |-- relation --> Campaigns
       |    |-- relation --> Content Calendar
       |-- relation --> Revenue Tracking
       |-- relation --> Contacts / CRM

Projects
  |-- relation --> Tasks (1:N)
  |-- relation --> Contacts / CRM (N:N, assigned + client)
  |-- relation --> Revenue Tracking (1:N)
  |-- relation --> Knowledge Base (N:N)
  |-- relation --> Business Lines (N:1)

Contacts / CRM
  |-- relation --> Projects (N:N)
  |-- relation --> Contracts (1:N)
  |-- relation --> Leads (1:N, converted leads)
  |-- relation --> Revenue Tracking (1:N)

Revenue Tracking
  |-- relation --> Projects (N:1)
  |-- relation --> Contacts / CRM (N:1)
  |-- relation --> Business Lines (N:1)
  |-- relation --> Contracts (N:1)

Finance Agent DBs
  |-- Finanzstatus rollup --> Revenue Tracking (bridged via agent sync)
```

---

### DB 1: Portfolio Dashboard

**Purpose**: Executive-level view of all business health metrics. Single source of truth for "how is the portfolio doing?"

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Dashboard entry name (e.g., "March 2026 Portfolio") |
| Period | Select | Monthly/Weekly/Quarterly |
| Period Start | Date | Start of reporting period |
| Period End | Date | End of reporting period |
| Total Revenue | Number (EUR) | Rollup: sum from Revenue Tracking |
| Total Pipeline | Number (EUR) | Rollup: sum of pipeline from Business Lines |
| Active Projects | Number | Rollup: count from Projects where Status != Done |
| Blocked Projects | Number | Rollup: count from Projects where Status = Blocked |
| Active Agents | Number | Manually updated or synced from orchestrator state |
| Burn Rate | Number (EUR) | Monthly operating costs |
| Net Profit | Formula | Total Revenue - Burn Rate |
| Health Score | Formula | Weighted composite (revenue growth + delivery rate + pipeline) |
| Business Lines | Relation | --> Business Lines DB |
| Notes | Rich Text | Executive summary, written by agent or human |
| Last Agent Sync | Date | Timestamp of last agent update |

**Views**:
- **Monthly Report** (Table): Filtered by current month, sorted by period
- **Trend Chart** (Chart): Revenue + Profit over time
- **Health Board** (Board): Grouped by Health Score ranges (Critical/Warning/Healthy/Thriving)

**Agent Interaction**:
- Agent WRITES: Total Revenue, Pipeline, Active/Blocked counts, Health Score inputs, Last Agent Sync
- Agent READS: Burn Rate (set by human), Notes
- Frequency: Daily sync (morning), on-demand after major events
- MCP Tools: `notion-create-pages` (new period), `notion-update-page` (refresh metrics)

---

### DB 2: Business Lines

**Purpose**: Top-level container for each business vertical.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Business line name |
| Slug | Rich Text | Short identifier (e.g., "client-work", "saas", "leadgen") |
| Status | Select | Active / Paused / Planning / Winding Down |
| Owner | Person | Responsible person |
| Revenue MTD | Number (EUR) | Rollup: sum from Revenue Tracking (current month) |
| Revenue Target | Number (EUR) | Monthly target |
| Target Hit % | Formula | Revenue MTD / Revenue Target * 100 |
| Pipeline Value | Number (EUR) | Rollup: sum of deal values from Contacts where Stage = Pipeline |
| Active Projects | Relation | --> Projects DB |
| Contacts | Relation | --> Contacts / CRM DB |
| Revenue Records | Relation | --> Revenue Tracking DB |
| Description | Rich Text | Business line description and strategy |
| KPIs | Rich Text | Key metrics to track |
| Created | Created Time | Auto |
| Last Edited | Last Edited Time | Auto |

**Fixed Entries** (5 business lines):
1. Client Work (Contracts & Deliverables)
2. Agent Swarm Experiments
3. SaaS Factory
4. Lead Generation
5. Marketing & Content

**Views**:
- **Overview** (Table): All lines with revenue and status
- **Revenue Board** (Board): Grouped by Target Hit % ranges
- **Active Only** (Gallery): Filtered to Active status

**Agent Interaction**:
- Agent WRITES: Revenue MTD (computed from Revenue Tracking), Pipeline Value
- Agent READS: Revenue Target, Status, KPIs
- Frequency: Daily sync
- MCP Tools: `notion-update-page` (refresh metrics), `notion-search` (find by slug)

---

### DB 3: Projects

**Purpose**: Unified project tracker across all business lines. Every piece of work that has a start, end, and deliverable.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Project name |
| Project ID | Rich Text | Unique identifier (e.g., "CW-2026-003") |
| Business Line | Relation | --> Business Lines DB |
| Status | Select | Backlog / Planning / In Progress / Review / Done / Blocked / Cancelled |
| Priority | Select | P0-Critical / P1-High / P2-Medium / P3-Low |
| Type | Select | Client Delivery / Internal / SaaS Build / Experiment / Marketing |
| Client | Relation | --> Contacts / CRM DB |
| Owner | Person | Project lead |
| Start Date | Date | Project start |
| Due Date | Date | Target completion |
| Actual End | Date | When actually completed |
| Budget | Number (EUR) | Total project budget |
| Revenue | Rollup | Sum from Revenue Tracking (related) |
| Margin | Formula | (Revenue - Budget) / Revenue * 100 |
| Completion % | Number | 0-100, updated by agents |
| Tasks | Relation | --> Tasks DB |
| Deliverables | Relation | --> Deliverables DB |
| Contract | Relation | --> Contracts DB |
| Knowledge Items | Relation | --> Knowledge Base DB |
| Revenue Records | Relation | --> Revenue Tracking DB |
| Sprint | Select | Current sprint/phase label |
| Blockers | Rich Text | Current blockers (agent-written) |
| Last Agent Update | Date | Timestamp of last agent touch |
| Notes | Rich Text | Free-form project notes |
| Created | Created Time | Auto |
| Last Edited | Last Edited Time | Auto |

**Views**:
- **Active Projects** (Table): Status != Done/Cancelled, sorted by Priority then Due Date
- **Kanban** (Board): Grouped by Status
- **Timeline** (Timeline/Gantt): Start Date to Due Date
- **By Business Line** (Board): Grouped by Business Line
- **Blocked** (Table): Filtered to Status = Blocked
- **My Projects** (Table): Filtered by Owner = me

**Agent Interaction**:
- Agent WRITES: Status, Completion %, Blockers, Last Agent Update, Sprint
- Agent READS: Priority, Due Date, Budget, Client, Owner
- Frequency: Per-task completion, daily summary
- MCP Tools: `notion-create-pages` (new project), `notion-update-page` (status change), `notion-search` (find by ID)

---

### DB 4: Tasks

**Purpose**: Granular work items. Every actionable unit across all projects.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Task description |
| Task ID | Rich Text | Unique identifier |
| Project | Relation | --> Projects DB |
| Business Line | Rollup | From Project -> Business Line |
| Status | Select | Todo / In Progress / In Review / Done / Blocked / Cancelled |
| Priority | Select | P0 / P1 / P2 / P3 |
| Assignee | Select | Agent name or person (e.g., "finance-agent", "Burak", "dev-agent-1") |
| Type | Select | Development / Research / Design / Admin / Review / Testing |
| Due Date | Date | Deadline |
| Estimated Hours | Number | Time estimate |
| Actual Hours | Number | Time spent |
| Dependencies | Relation | --> Tasks DB (self-relation) |
| Blocked By | Relation | --> Tasks DB (self-relation) |
| Output Link | URL | Link to deliverable/artifact |
| Agent Notes | Rich Text | Agent-written completion notes |
| Created | Created Time | Auto |
| Completed At | Date | When marked Done |

**Views**:
- **My Tasks** (Table): Filtered by Assignee, sorted by Priority + Due Date
- **Agent Queue** (Table): Filtered by Assignee contains "agent", Status = Todo, sorted by Priority
- **Kanban** (Board): Grouped by Status
- **Sprint Board** (Board): Current sprint tasks grouped by Status
- **Overdue** (Table): Due Date < Today AND Status != Done
- **By Project** (Board): Grouped by Project

**Agent Interaction**:
- Agent WRITES: Status, Actual Hours, Agent Notes, Completed At, Output Link
- Agent READS: Name, Priority, Dependencies, Blocked By, Due Date
- Agent CREATES: New tasks when decomposing project work
- Frequency: Real-time (on task start/complete)
- MCP Tools: `notion-create-pages` (new task), `notion-update-page` (status), `notion-search` (find by assignee + status)

---

### DB 5: Contacts / CRM

**Purpose**: All people and organizations across all business lines.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Contact name |
| Type | Select | Client / Lead / Partner / Vendor / Prospect / Personal |
| Company | Rich Text | Organization name |
| Email | Email | Primary email |
| Phone | Phone | Primary phone |
| Stage | Select | Cold / Warm / Hot / Qualified / Proposal / Negotiation / Won / Lost / Active Client / Churned |
| Deal Value | Number (EUR) | Potential or actual deal value |
| Business Line | Multi-Select | Which business lines this contact relates to |
| Projects | Relation | --> Projects DB |
| Contracts | Relation | --> Contracts DB |
| Revenue Records | Relation | --> Revenue Tracking DB |
| Leads Source | Relation | --> Leads DB |
| Tags | Multi-Select | Industry, size, tech stack, etc. |
| Last Contact | Date | Last interaction date |
| Next Follow-Up | Date | Scheduled follow-up |
| Notes | Rich Text | Interaction history, preferences |
| LinkedIn | URL | LinkedIn profile |
| Website | URL | Company website |
| Created | Created Time | Auto |
| Last Edited | Last Edited Time | Auto |

**Views**:
- **Pipeline** (Board): Grouped by Stage, filtered to active pipeline
- **All Contacts** (Table): Full list, searchable
- **Clients** (Table): Type = Active Client
- **Follow-Up Due** (Table): Next Follow-Up <= Today + 3 days
- **By Business Line** (Board): Grouped by Business Line
- **Recently Added** (Table): Sorted by Created desc, limit 20

**Agent Interaction**:
- Agent WRITES: Stage changes, Last Contact, Notes (append), Deal Value updates
- Agent READS: Email, Stage, Next Follow-Up, Business Line
- Agent CREATES: New contacts from lead gen campaigns
- Frequency: On interaction, daily pipeline sync
- MCP Tools: `notion-create-pages`, `notion-update-page`, `notion-search` (find by name/email)

---

### DB 6: Revenue Tracking

**Purpose**: Every financial transaction -- invoices, payments, MRR entries. Single source for revenue metrics.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Transaction description |
| Type | Select | Invoice / Payment Received / Subscription / Refund / Expense / Credit |
| Amount | Number (EUR) | Transaction amount (positive = income, negative = expense) |
| Status | Select | Draft / Sent / Paid / Overdue / Cancelled / Recurring |
| Date | Date | Transaction date |
| Due Date | Date | Payment due date |
| Paid Date | Date | Actual payment date |
| Business Line | Relation | --> Business Lines DB |
| Project | Relation | --> Projects DB |
| Client | Relation | --> Contacts / CRM DB |
| Contract | Relation | --> Contracts DB |
| Invoice Number | Rich Text | Invoice reference |
| Payment Method | Select | Bank Transfer / PayPal / Stripe / Crypto / Cash |
| Is Recurring | Checkbox | MRR/subscription flag |
| Recurrence | Select | Monthly / Quarterly / Annual / One-Time |
| Notes | Rich Text | Transaction notes |
| Created | Created Time | Auto |

**Views**:
- **All Transactions** (Table): Sorted by Date desc
- **Unpaid Invoices** (Table): Status = Sent, sorted by Due Date
- **Monthly Revenue** (Table): Filtered to current month, Type = Payment Received
- **MRR Tracker** (Table): Is Recurring = true, Status = Recurring
- **By Business Line** (Board): Grouped by Business Line
- **Overdue** (Table): Status = Overdue, highlighted

**Agent Interaction**:
- Agent WRITES: Status changes (Draft -> Sent -> Paid), Paid Date, Amount updates
- Agent READS: Due Date, Client, Amount for reporting
- Agent CREATES: Invoice drafts, recurring entries
- Frequency: On transaction events, daily reconciliation
- MCP Tools: `notion-create-pages`, `notion-update-page`, `notion-search`
- **Finance Agent Bridge**: Sync with Finanzstatus DB -- agent reads Revenue Tracking, writes summary to Finanzstatus

---

### DB 7: Knowledge Base

**Purpose**: Institutional memory. Learnings, patterns, decisions, research findings, post-mortems.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Knowledge item title |
| Category | Select | Decision / Learning / Pattern / Post-Mortem / Research / Playbook / Template |
| Domain | Multi-Select | Engineering / Business / Finance / Marketing / Operations / Legal |
| Business Line | Multi-Select | Applicable business lines |
| Projects | Relation | --> Projects DB |
| Status | Select | Draft / Published / Archived |
| Confidence | Select | Hypothesis / Tested / Proven / Deprecated |
| Tags | Multi-Select | Free-form tags for discovery |
| Summary | Rich Text | 2-3 sentence summary |
| Source | URL | Link to source material |
| Author | Select | Person or agent that created it |
| Reviewed By | Person | Human reviewer |
| Impact | Select | High / Medium / Low |
| Created | Created Time | Auto |
| Last Edited | Last Edited Time | Auto |

**Page Content** (in page body, not properties):
- Full knowledge item content
- Evidence / data
- Applicability notes
- Related items (inline links)

**Views**:
- **Published** (Gallery): Status = Published, sorted by Last Edited
- **By Category** (Board): Grouped by Category
- **By Domain** (Board): Grouped by Domain
- **Search** (Table): All items, title + tags searchable
- **Recent** (Table): Sorted by Created desc
- **High Impact** (Table): Impact = High, Confidence = Proven/Tested

**Agent Interaction**:
- Agent WRITES: New entries from research, post-mortems after project completion
- Agent READS: Published items for context before starting new work
- Frequency: On research completion, post-project
- MCP Tools: `notion-create-pages` (with markdown content), `notion-search` (context retrieval)

---

### DB 8: Time Log

**Purpose**: Track time spent across all activities for billing and productivity analysis.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Activity description |
| Project | Relation | --> Projects DB |
| Task | Relation | --> Tasks DB |
| Business Line | Rollup | From Project -> Business Line |
| Duration | Number (hours) | Time spent |
| Date | Date | When the work happened |
| Type | Select | Billable / Internal / Admin / Learning / Overhead |
| Worker | Select | Person or agent name |
| Hourly Rate | Number (EUR) | Applicable rate |
| Billable Amount | Formula | Duration * Hourly Rate (if Billable) |
| Created | Created Time | Auto |

**Views**:
- **Today** (Table): Date = Today
- **Weekly Summary** (Table): Current week, grouped by Project
- **Billable This Month** (Table): Type = Billable, current month
- **By Worker** (Board): Grouped by Worker
- **Revenue Calc** (Table): Billable Amount rollup by Project

**Agent Interaction**:
- Agent WRITES: Time entries for agent work (auto-logged)
- Agent READS: Billable totals for invoicing
- Frequency: Per-task completion
- MCP Tools: `notion-create-pages`

---

### DB 9: Contracts (Client Work)

**Purpose**: All client contracts, SOWs, and agreements.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Contract name |
| Contract ID | Rich Text | Unique reference |
| Client | Relation | --> Contacts / CRM DB |
| Project | Relation | --> Projects DB |
| Business Line | Relation | --> Business Lines DB |
| Type | Select | Fixed Price / Time & Materials / Retainer / Subscription / Outcome-Based |
| Status | Select | Draft / Sent / Negotiating / Active / Completed / Terminated |
| Value | Number (EUR) | Total contract value |
| Monthly Value | Number (EUR) | Monthly retainer/subscription amount |
| Start Date | Date | Contract start |
| End Date | Date | Contract end / renewal date |
| Payment Terms | Select | Net 14 / Net 30 / Net 60 / Prepaid / Milestone |
| Revenue Records | Relation | --> Revenue Tracking DB |
| Deliverables | Relation | --> Deliverables DB |
| Contract Doc | URL | Link to signed document |
| Auto Renew | Checkbox | Auto-renewal flag |
| Renewal Date | Date | Next renewal date |
| Notes | Rich Text | Key terms, special conditions |
| Created | Created Time | Auto |

**Views**:
- **Active Contracts** (Table): Status = Active, sorted by End Date
- **Expiring Soon** (Table): End Date within 30 days, Status = Active
- **Pipeline** (Board): Grouped by Status
- **By Client** (Board): Grouped by Client
- **Revenue Summary** (Table): Value rollup by Client

**Agent Interaction**:
- Agent WRITES: Status changes, Revenue records linkage
- Agent READS: End Date for renewal alerts, Value for revenue projections
- Agent CREATES: Draft contracts from templates
- Frequency: On contract events, weekly renewal check
- MCP Tools: `notion-create-pages`, `notion-update-page`

---

### DB 10: Deliverables (Client Work)

**Purpose**: Specific outputs owed to clients, tied to contracts and projects.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Deliverable description |
| Project | Relation | --> Projects DB |
| Contract | Relation | --> Contracts DB |
| Status | Select | Not Started / In Progress / In Review / Delivered / Accepted / Revision Needed |
| Priority | Select | P0 / P1 / P2 / P3 |
| Due Date | Date | Delivery deadline |
| Delivered Date | Date | Actual delivery date |
| Type | Select | Code / Document / Design / Report / Prototype / Deployment |
| Acceptance Criteria | Rich Text | What "done" looks like |
| Delivery Link | URL | Link to delivered artifact |
| Feedback | Rich Text | Client feedback |
| Tasks | Relation | --> Tasks DB (implementing tasks) |
| Created | Created Time | Auto |

**Views**:
- **Active** (Table): Status in [Not Started, In Progress, In Review], sorted by Due Date
- **Kanban** (Board): Grouped by Status
- **Overdue** (Table): Due Date < Today AND Status not in [Delivered, Accepted]
- **By Project** (Board): Grouped by Project

**Agent Interaction**:
- Agent WRITES: Status, Delivered Date, Delivery Link
- Agent READS: Acceptance Criteria, Due Date
- Frequency: On delivery events
- MCP Tools: `notion-update-page`

---

### DB 11: Products (SaaS Factory)

**Purpose**: SaaS products in the portfolio, from idea to live.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Product name |
| Slug | Rich Text | URL-safe identifier |
| Status | Select | Idea / Validating / Building / Beta / Live / Sunset |
| Business Line | Relation | --> Business Lines DB |
| MRR | Number (EUR) | Current monthly recurring revenue |
| Users | Number | Current active users |
| Churn Rate | Number (%) | Monthly churn |
| LTV | Number (EUR) | Average customer lifetime value |
| CAC | Number (EUR) | Customer acquisition cost |
| Tech Stack | Multi-Select | Technologies used |
| Repo URL | URL | GitHub/GitLab repository |
| Live URL | URL | Production URL |
| Projects | Relation | --> Projects DB |
| Revenue Records | Relation | --> Revenue Tracking DB |
| Launches | Relation | --> Launches DB |
| Description | Rich Text | Product description and positioning |
| Metrics Notes | Rich Text | Agent-written metrics analysis |
| Created | Created Time | Auto |
| Last Edited | Last Edited Time | Auto |

**Views**:
- **All Products** (Gallery): Card view with status badge
- **Live Products** (Table): Status = Live, sorted by MRR desc
- **Pipeline** (Board): Grouped by Status
- **Metrics Dashboard** (Table): MRR, Users, Churn, LTV, CAC columns

**Agent Interaction**:
- Agent WRITES: MRR, Users, Churn Rate (from Stripe/analytics APIs), Metrics Notes
- Agent READS: Status, Tech Stack for deployment decisions
- Frequency: Daily metrics sync
- MCP Tools: `notion-update-page`, `notion-search`

---

### DB 12: Launches (SaaS Factory)

**Purpose**: Product launch events -- planning, execution, post-mortem.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Launch name (e.g., "ProductX v2.0 Launch") |
| Product | Relation | --> Products DB |
| Status | Select | Planning / Pre-Launch / Launch Day / Post-Launch / Completed |
| Launch Date | Date | Target launch date |
| Actual Launch | Date | Actual launch date |
| Type | Select | Major / Minor / Patch / Soft Launch / Hard Launch |
| Channel | Multi-Select | ProductHunt / HackerNews / Twitter/X / Email / Direct |
| Projects | Relation | --> Projects DB |
| Tasks | Relation | --> Tasks DB (launch tasks) |
| Signups Day 1 | Number | First-day signups |
| Revenue Day 1 | Number (EUR) | First-day revenue |
| Post-Mortem | Rich Text | What worked, what didn't |
| Content Calendar | Relation | --> Content Calendar DB |
| Created | Created Time | Auto |

**Views**:
- **Upcoming** (Table): Launch Date > Today, sorted by Launch Date
- **Timeline** (Timeline): Launch Date view
- **By Product** (Board): Grouped by Product
- **Results** (Table): Completed launches with Signups + Revenue

**Agent Interaction**:
- Agent WRITES: Status, Signups/Revenue metrics post-launch, Post-Mortem
- Agent READS: Launch Date, Channel, Tasks
- Frequency: Daily during launch windows
- MCP Tools: `notion-update-page`, `notion-create-pages`

---

### DB 13: Campaigns (Lead Gen)

**Purpose**: Marketing and outreach campaigns for lead generation.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Campaign name |
| Business Line | Relation | --> Business Lines DB |
| Status | Select | Draft / Active / Paused / Completed / Analyzing |
| Type | Select | Cold Email / LinkedIn / Content / Paid Ads / Referral / Event |
| Channel | Multi-Select | Email / LinkedIn / Twitter/X / Google Ads / Meta / Direct |
| Start Date | Date | Campaign start |
| End Date | Date | Campaign end |
| Budget | Number (EUR) | Campaign budget |
| Spend | Number (EUR) | Actual spend |
| Leads Generated | Rollup | Count from Leads DB (related) |
| Cost Per Lead | Formula | Spend / Leads Generated |
| Conversion Rate | Number (%) | Leads -> Clients conversion |
| Leads | Relation | --> Leads DB |
| Content | Relation | --> Content Calendar DB |
| Revenue Attributed | Number (EUR) | Revenue traced to this campaign |
| ROI | Formula | (Revenue Attributed - Spend) / Spend * 100 |
| Notes | Rich Text | Campaign strategy and learnings |
| Created | Created Time | Auto |

**Views**:
- **Active** (Table): Status = Active
- **Performance** (Table): All campaigns with CPL, Conversion, ROI columns
- **By Channel** (Board): Grouped by Channel
- **Timeline** (Timeline): Start to End Date
- **ROI Ranking** (Table): Sorted by ROI desc

**Agent Interaction**:
- Agent WRITES: Spend, Leads Generated, Conversion Rate, Revenue Attributed, ROI
- Agent READS: Budget, Channel, Status
- Agent CREATES: New campaigns from templates
- Frequency: Daily metric updates for active campaigns
- MCP Tools: `notion-create-pages`, `notion-update-page`

---

### DB 14: Leads (Lead Gen)

**Purpose**: Individual leads captured from campaigns and other sources.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Lead name |
| Email | Email | Lead email |
| Company | Rich Text | Company name |
| Source | Relation | --> Campaigns DB |
| Status | Select | New / Contacted / Qualified / Proposal / Won / Lost / Nurture |
| Score | Number | Lead score (0-100) |
| Business Line | Multi-Select | Interested business line(s) |
| Deal Value | Number (EUR) | Estimated deal value |
| Contact | Relation | --> Contacts / CRM DB (when converted) |
| Last Interaction | Date | Last touchpoint |
| Next Action | Rich Text | Required next step |
| Channel | Select | How they came in |
| Notes | Rich Text | Interaction history |
| Created | Created Time | Auto |

**Views**:
- **New Leads** (Table): Status = New, sorted by Score desc
- **Pipeline** (Board): Grouped by Status
- **Hot Leads** (Table): Score >= 70
- **By Source** (Board): Grouped by Source campaign
- **Follow-Up Queue** (Table): Status in [Contacted, Qualified], sorted by Last Interaction asc

**Agent Interaction**:
- Agent WRITES: Score (auto-calculated), Status changes, Last Interaction, Notes
- Agent READS: Email, Company for outreach
- Agent CREATES: New leads from campaign data
- **Conversion**: When Status = Won, agent creates Contacts/CRM entry and links via Contact relation
- Frequency: On lead capture, daily scoring update
- MCP Tools: `notion-create-pages`, `notion-update-page`

---

### DB 15: Offers (Marketing)

**Purpose**: Products, services, and packages available for sale.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Offer name |
| Business Line | Relation | --> Business Lines DB |
| Status | Select | Draft / Active / Paused / Retired |
| Type | Select | Service Package / Product / Course / Consultation / Retainer |
| Price | Number (EUR) | Price point |
| Pricing Model | Select | Fixed / Hourly / Monthly / Outcome-Based / Tiered |
| Target Audience | Rich Text | Ideal customer profile |
| Value Proposition | Rich Text | Core offer promise |
| Campaigns | Relation | --> Campaigns DB |
| Content | Relation | --> Content Calendar DB |
| Conversions | Number | Total conversions |
| Revenue | Number (EUR) | Total revenue from this offer |
| Landing Page | URL | Offer page URL |
| Created | Created Time | Auto |

**Views**:
- **Active Offers** (Gallery): Status = Active
- **Performance** (Table): Sorted by Revenue desc
- **By Business Line** (Board): Grouped by Business Line

**Agent Interaction**:
- Agent WRITES: Conversions, Revenue
- Agent READS: Price, Target Audience, Value Proposition (for campaign copy)
- Frequency: Weekly metrics update
- MCP Tools: `notion-update-page`

---

### DB 16: Content Calendar (Marketing)

**Purpose**: All content across channels -- blog posts, social media, newsletters, videos.

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Content piece title |
| Type | Select | Blog Post / Tweet Thread / LinkedIn Post / Newsletter / Video / Lead Magnet / Case Study |
| Status | Select | Idea / Drafting / In Review / Scheduled / Published / Repurposed |
| Business Line | Relation | --> Business Lines DB |
| Publish Date | Date | Scheduled/actual publish date |
| Channel | Multi-Select | Blog / Twitter/X / LinkedIn / YouTube / Newsletter / ProductHunt |
| Offer | Relation | --> Offers DB |
| Campaign | Relation | --> Campaigns DB |
| Launch | Relation | --> Launches DB |
| Author | Select | Person or agent |
| SEO Keywords | Multi-Select | Target keywords |
| URL | URL | Published content URL |
| Impressions | Number | View/impression count |
| Engagement | Number | Likes/comments/shares |
| Leads Generated | Number | Attributed leads |
| Draft Link | URL | Link to draft document |
| Notes | Rich Text | Content brief / outline |
| Created | Created Time | Auto |

**Views**:
- **Calendar** (Calendar): By Publish Date
- **Pipeline** (Board): Grouped by Status
- **By Channel** (Board): Grouped by Channel
- **This Week** (Table): Publish Date within current week
- **Performance** (Table): Published content sorted by Leads Generated desc
- **By Business Line** (Board): Grouped by Business Line

**Agent Interaction**:
- Agent WRITES: Status, Impressions/Engagement/Leads (from analytics), URL after publishing
- Agent READS: Notes (content brief), SEO Keywords, Offer, Publish Date
- Agent CREATES: Content ideas, draft entries
- Frequency: Daily schedule check, weekly metrics update
- MCP Tools: `notion-create-pages`, `notion-update-page`

---

### Existing Finance Agent DBs (7 DBs -- Keep As-Is)

These databases remain unchanged. Integration via bridge patterns:

| DB Name | German | Purpose | Bridge to New Schema |
|---------|--------|---------|---------------------|
| Glaubiger | Creditors | Creditor management | -> Contacts/CRM (type=Vendor) |
| Fristen | Deadlines | Financial deadlines | -> Tasks (type=Finance) |
| E-Mail Entwurfe | Email Drafts | Outgoing email drafts | Standalone |
| Posteingang | Inbox | Incoming mail processing | -> Tasks (auto-create) |
| Finanzstatus | Financial Status | Overall financial health | <- Revenue Tracking (agent sync) |
| Abos | Subscriptions | Recurring payments | -> Revenue Tracking (type=Expense, recurring) |
| Private Schulden | Private Debts | Personal debt tracking | Standalone |

**Bridge Pattern**: A dedicated "finance-bridge-agent" runs nightly to:
1. Read new entries from Finanzstatus, sync to Revenue Tracking
2. Read Abos, ensure matching recurring entries in Revenue Tracking
3. Read Glaubiger, ensure matching Contacts/CRM entries
4. Read Fristen, ensure matching Tasks with type=Finance

---

## 6. Agent Interaction Patterns

### Pattern 1: Daily Portfolio Sync Agent

```
Trigger: Cron (08:00 daily) or manual
Steps:
  1. Query Revenue Tracking (current month, Status=Paid) -> sum by Business Line
  2. Query Projects (Status=Active) -> count by Business Line
  3. Query Projects (Status=Blocked) -> count total
  4. Query Leads (Status=New, created today) -> count
  5. Update Business Lines with computed metrics
  6. Update/Create Portfolio Dashboard entry for current period
  7. Log to Knowledge Base if anomalies detected
Rate Budget: ~20 API calls, well within limits
```

### Pattern 2: Lead Processing Agent

```
Trigger: New entry in Leads DB (polled every 5 min)
Steps:
  1. Search Leads (Status=New) -> get batch
  2. For each lead:
     a. Score based on Company, Channel, Deal Value
     b. Update Score and Status
     c. If Score >= 70: update Status to Qualified
     d. Create follow-up Task in Tasks DB
  3. Update Campaign metrics (Leads Generated count)
Rate Budget: ~5 calls per lead, batch of 10 = 50 calls (~17 seconds)
```

### Pattern 3: Invoice Generation Agent

```
Trigger: Project milestone or monthly billing cycle
Steps:
  1. Read Contract (payment terms, rates)
  2. Read Time Log (billable hours for period)
  3. Calculate invoice amount
  4. Create Revenue Tracking entry (Type=Invoice, Status=Draft)
  5. Update Project revenue rollup
  6. Create Task for human review
Rate Budget: ~8 calls per invoice
```

### Pattern 4: Content Publishing Agent

```
Trigger: Content Calendar item with Publish Date = Today, Status = Scheduled
Steps:
  1. Search Content Calendar (Publish Date=Today, Status=Scheduled)
  2. For each item:
     a. Read content brief (page body via markdown API)
     b. Publish to channel (external API)
     c. Update Status to Published
     d. Update URL with live link
  3. After 24h: fetch analytics, update Impressions/Engagement/Leads
Rate Budget: ~6 calls per content piece
```

### Pattern 5: Knowledge Capture Agent

```
Trigger: Project Status changed to Done
Steps:
  1. Read Project details + all related Tasks
  2. Analyze: what worked, what didn't, time vs estimate
  3. Create Knowledge Base entry (Category=Post-Mortem)
  4. Link to Project
  5. If patterns match existing knowledge, update Confidence
Rate Budget: ~10 calls per post-mortem
```

### Rate Budget Planning

```
Daily budget: 2,700 requests per 15 minutes = 259,200 per day

Estimated daily usage:
  Portfolio Sync:        20 calls x 1/day     =     20
  Lead Processing:       50 calls x 12/day    =    600
  Invoice Generation:     8 calls x 2/day     =     16
  Content Publishing:     6 calls x 3/day     =     18
  Knowledge Capture:     10 calls x 1/day     =     10
  Ad-hoc agent queries:                       =    200
  Finance Bridge:        30 calls x 1/day     =     30
  Metrics Sync:          40 calls x 2/day     =     80
                                        Total =   ~974 calls/day

Headroom: 259,200 - 974 = 258,226 calls unused
Conclusion: Rate limits are NOT a bottleneck for this architecture
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1)

**Create in order** (relations require target DBs to exist first):

1. Business Lines (seed with 5 entries)
2. Contacts / CRM
3. Knowledge Base
4. Revenue Tracking
5. Projects (relations to Business Lines, Contacts, Knowledge Base, Revenue)
6. Tasks (relations to Projects)
7. Time Log (relations to Projects, Tasks)
8. Portfolio Dashboard (relations to Business Lines)

**Configure**:
- Set up Notion MCP in Claude Code config
- Create Internal Integration with access to all DBs
- Test basic CRUD via MCP tools

### Phase 2: Client Work (Week 2)

1. Contracts (relations to Contacts, Projects, Business Lines, Revenue)
2. Deliverables (relations to Projects, Contracts, Tasks)
3. Migrate existing client data
4. Build Invoice Generation agent pattern
5. Test full client work workflow

### Phase 3: Lead Gen + Marketing (Week 3)

1. Leads (relations to Contacts, Campaigns)
2. Campaigns (relations to Business Lines, Leads, Content Calendar)
3. Offers (relations to Business Lines, Campaigns, Content Calendar)
4. Content Calendar (relations to Business Lines, Offers, Campaigns, Launches)
5. Build Lead Processing agent
6. Build Content Publishing agent

### Phase 4: SaaS Factory (Week 3-4)

1. Products (relations to Business Lines, Projects, Revenue, Launches)
2. Launches (relations to Products, Projects, Tasks, Content Calendar)
3. Build Metrics Sync agent (Stripe -> Products -> Revenue Tracking)

### Phase 5: Integration + Polish (Week 4)

1. Finance Bridge agent (sync existing 7 DBs with new schema)
2. Daily Portfolio Sync agent
3. Knowledge Capture agent
4. Dashboard views and charts
5. Load testing with realistic agent traffic

### Phase 6: Automation (Week 5+)

1. Notion Custom Agents for simple automations (in-Notion triggers)
2. Claude Code agents for complex multi-step workflows
3. Confidence-based auto-routing (high-confidence = auto-accept, low = human review)
4. Multi-model review layer (if warranted by volume)

---

## Appendix A: Property Type Reference

| Notion Type | Use For | Agent Writable | Notes |
|-------------|---------|----------------|-------|
| Title | Primary name | Yes | Required, one per DB |
| Rich Text | Descriptions, notes | Yes | Supports markdown |
| Number | Amounts, counts, % | Yes | Specify format (EUR, %, plain) |
| Select | Single-choice status | Yes | Must match existing options |
| Multi-Select | Tags, categories | Yes | Can create new options |
| Date | Timestamps | Yes | ISO 8601 format |
| Checkbox | Boolean flags | Yes | |
| URL | Links | Yes | |
| Email | Email addresses | Yes | |
| Phone | Phone numbers | Yes | |
| Relation | Cross-DB links | Yes | Must reference valid page IDs |
| Rollup | Computed from relations | No | Auto-computed by Notion |
| Formula | Computed from properties | No | Auto-computed by Notion |
| Person | Workspace members | Yes | Must be valid user ID |
| Created Time | Auto timestamp | No | Auto-set on creation |
| Last Edited Time | Auto timestamp | No | Auto-set on edit |

## Appendix B: MCP Tool Quick Reference

| Operation | MCP Tool | When to Use |
|-----------|----------|-------------|
| Find pages | `notion-search` | Before create (idempotency check) |
| Create page | `notion-create-pages` | New records in any DB |
| Update page | `notion-update-page` | Status changes, metric updates |
| Read page | `notion-fetch` | Get full page content |
| Move page | `notion-move-pages` | Reorganize structure |
| Duplicate | `notion-duplicate-page` | Create from template |
| Comment | `notion-create-comment` | Agent notes, review requests |
| List users | `notion-get-users` | Resolve Person properties |
| Teams | `notion-get-teams` | Multi-team assignment |
| Read comments | `notion-get-comments` | Check review feedback |

## Appendix C: Claude Code MCP Config Template

```jsonc
// Add to .claude/mcp.json or ~/.claude/mcp.json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_XXXXXXXXXXXX\", \"Notion-Version\": \"2022-06-28\"}"
      }
    }
  }
}
```

**Setup Steps**:
1. Go to notion.com/my-integrations
2. Create new Internal Integration
3. Grant access to all databases in workspace settings
4. Copy the integration token (starts with `ntn_`)
5. Replace `ntn_XXXXXXXXXXXX` in config above

---

## Sources

- [Notion 3.3: Custom Agents (Feb 2026)](https://www.notion.com/releases/2026-02-24)
- [Notion 3.0: Agents (Sep 2025)](https://www.notion.com/releases/2025-09-18)
- [13 Notion AI Agent Use Cases (2026)](https://thecrunch.io/notion-ai-agent/)
- [Notion MCP Supported Tools](https://developers.notion.com/docs/mcp-supported-tools)
- [Notion MCP Getting Started](https://developers.notion.com/docs/get-started-with-mcp)
- [Official Notion MCP Server (GitHub)](https://github.com/makenotion/notion-mcp-server)
- [Notion MCP Help Center](https://www.notion.com/help/notion-mcp)
- [Notion API Request Limits](https://developers.notion.com/reference/request-limits)
- [Understanding Notion API Rate Limits (2025)](https://www.oreateai.com/blog/understanding-notion-api-rate-limits-in-2025-what-you-need-to-know/50d89b885182f65117ff8af2609b34c2)
- [Pushing Notion to the Limits](https://notionmastery.com/pushing-notion-to-the-limits/)
- [Optimize Database Load Times & Performance](https://www.notion.com/help/optimize-database-load-times-and-performance)
- [How to Handle Notion API Request Limits (Thomas Frank)](https://thomasjfrank.com/how-to-handle-notion-api-request-limits/)
- [Notion API Cache (GitHub)](https://github.com/marc7806/notion-api-cache)
- [Post Database Query API](https://developers.notion.com/reference/post-database-query)
- [Notion CRM Use Case](https://www.notion.com/use-case/crm)
- [Project Portfolio Management Template](https://www.notion.com/templates/project-portfolio-management)
- [Project and Portfolio Management Suite Pro](https://www.notion.com/templates/project-and-portfolio-management-suite-pro)
- [Notion MCP Integration with Claude Code (Composio)](https://composio.dev/toolkits/notion/framework/claude-code)
- [Claude and Notion Product Workflow Automation (Improving)](https://www.improving.com/thoughts/claude-and-notion-product-workflow-automation/)
- [How to Set Up Notion MCP in Claude Code (Shinzo Labs)](https://shinzo.ai/blog/how-to-set-up-notion-mcp-in-claude-code)
- [Relations & Rollups (Notion Help)](https://www.notion.com/help/relations-and-rollups)
- [Overcoming Notion Database Limits](https://ones.com/blog/overcoming-notion-database-limits-scaling-strategies/)
