# Observability & Trust Infrastructure Design for Multi-Agent Systems

**Date**: 2026-03-06
**Purpose**: Concrete observability architecture, metrics framework, dashboard designs, and client-facing trust artifacts for the L-Thread Orchestrator
**Audience**: Internal (Burak) + External (government clients)
**Foundation**: Phase 2 research on observability, trust KPIs, and practitioner systems

---

## Executive Summary

This document specifies the full observability and trust stack for a multi-agent coding operation targeting government clients. It covers six areas: (1) tool selection with compatibility analysis for Claude Code/Max, (2) a three-tier metrics framework spanning agent performance, system health, and business economics, (3) Notion-based dashboards for both internal operations and client-facing trust, (4) auto-generated trust artifacts designed for government procurement, (5) a structured logging architecture from JSON files through SQLite to Notion, and (6) cost attribution per client and project.

The core design principle: **every agent action produces a structured event that flows through a pipeline ending in both an operational dashboard (internal) and a trust artifact (client-facing).** This dual-use architecture means observability is not overhead -- it is the revenue lever.

---

## 1. Agent Observability Tools: Compatibility & Selection

### 1.1 Tool Comparison for Claude Code / Claude Max

Claude Code has **native OpenTelemetry support** (opt-in via `CLAUDE_CODE_ENABLE_TELEMETRY=1`). This is the primary integration point for all observability tools. Claude Code exports:
- **Metrics** as OTLP time series (token usage, latency, model info)
- **Events** as OTLP logs (tool calls, session lifecycle)
- Default export intervals: 60s for metrics, 5s for events
- Privacy: metadata only -- prompts are not exported

Additionally, Claude Code's **hook system** (PreToolUse, PostToolUse, Stop, SubagentStop, etc.) enables custom event capture without any SDK.

| Tool | Open Source | Self-Hosted | Claude Code Compatible | Claude Max Compatible | Cost (Self-Hosted) | Best For |
|------|-----------|------------|----------------------|---------------------|-------------------|---------|
| **Langfuse v3** | MIT | Yes (Docker/K8s) | Via OTEL or SDK | Yes (hooks + OTEL) | Infrastructure only | Full tracing, prompt management, evals |
| **Arize Phoenix** | Apache 2.0 | Yes (Docker) | Via OTEL (native) | Yes (hooks + OTEL) | Infrastructure only | Drift detection, clustering, OpenInference |
| **Helicone** | Apache 2.0 | Yes (Docker) | Proxy mode (API users) | No (Max = no API proxy) | Infrastructure only | Cost tracking, 300+ model pricing DB |
| **LangSmith** | Closed | No (SaaS only) | Limited (LangChain only) | No | $39/user/month | LangChain-only shops |
| **Braintrust** | Closed | No (SaaS only) | Via SDK | Partial | Volume pricing | Fast queries, Loop AI analysis |
| **SigNoz** | Apache 2.0 | Yes (Docker/K8s) | Via OTEL (native) | Yes (hooks + OTEL) | Infrastructure only | Full-stack OTEL observability |
| **IndyDevDan Hooks** | MIT | Yes (Bun + SQLite) | Native (hooks system) | Yes | Zero (runs locally) | Real-time swim lanes, 3-10 agents |
| **ccusage** | MIT | N/A (CLI tool) | Yes (reads JSONL) | Yes (reads local files) | Free | Token usage analysis, cost per session |
| **claude-code-otel** | MIT | Yes | Yes (OTEL wrapper) | Yes | Free | OTEL export for Claude Code |
| **claude_telemetry** | MIT | Yes | Yes (CLI wrapper) | Yes | Free | Drop-in replacement with OTEL export |

### 1.2 Recommended Stack (Phased)

**Phase 1 -- Immediate (Current: 3-10 agents, Claude Max)**

| Layer | Tool | Rationale |
|-------|------|-----------|
| Event capture | Claude Code hooks (JSON log) | Zero cost, native, no SDK needed |
| Usage analysis | ccusage CLI | Reads local JSONL files, shows cost/session/project |
| Real-time monitoring | IndyDevDan hooks + Bun + SQLite + Vue | Best Claude Code integration, proven at small scale |
| Process monitoring | tmux capture-pane polling | Already in orchestrator architecture |
| Cost tracking | ccusage + manual Notion entry | Sufficient for < 10 agents |

**Phase 2 -- Growth (10-25 agents)**

| Layer | Tool | Rationale |
|-------|------|-----------|
| Telemetry export | Claude Code native OTEL | Built-in, zero wrapper overhead |
| Event storage | Langfuse v3 self-hosted | ClickHouse backend, 100K events/sec |
| Dashboards | Grafana + Prometheus | OTEL-native, fleet-level aggregates |
| Cost tracking | Helicone (API users) + ccusage (Max users) | Per-project attribution |
| Alerting | Prometheus Alertmanager | SLO-based burn-rate alerts |

**Phase 3 -- Scale (25-50+ agents)**

| Layer | Tool | Rationale |
|-------|------|-----------|
| Distributed tracing | OpenTelemetry + Grafana Tempo | Fleet-wide correlation |
| Agent graphs | Langfuse v3 agent visualization | Execution flow analysis |
| Auto-remediation | Custom scripts + Prometheus webhooks | Self-healing restarts |
| Trust pipeline | Automated Notion + PDF export | Client-facing artifact generation |

### 1.3 Self-Hosted Cost Analysis

All recommended tools can run on a single Mac Studio M4 Max (128GB RAM) for Phase 1-2:

| Service | RAM | Disk | Notes |
|---------|-----|------|-------|
| Langfuse v3 (Docker) | 2-4 GB | 10 GB base | ClickHouse grows with event volume |
| Grafana + Prometheus | 1-2 GB | 5 GB base | Scales with metric cardinality |
| SigNoz (alternative) | 4-8 GB | 20 GB base | All-in-one OTEL backend |
| IndyDevDan hooks server | 256 MB | SQLite file | Minimal footprint |
| Total Phase 1 | ~500 MB | < 1 GB | Hooks + ccusage only |
| Total Phase 2 | ~6 GB | ~35 GB | Full Langfuse + Grafana stack |

---

## 2. Metrics Framework

### 2.1 Tier 1: Agent Performance Metrics

These metrics answer: "Is each agent doing its job well?"

| Metric | Definition | Formula | Collection Method | Target (Green) | Warning (Yellow) | Critical (Red) |
|--------|-----------|---------|-------------------|----------------|-----------------|----------------|
| **Task Completion Rate** | % of assigned tasks completed successfully | `completed_tasks / assigned_tasks` | State file + hook events | > 85% | 70-85% | < 70% |
| **Time to Completion** | Wall-clock time from assignment to PR/commit | `task_end_time - task_start_time` | State file timestamps | < 30 min (small), < 2h (medium) | 1.5x target | > 2x target |
| **First-Attempt CI Pass Rate** | % of PRs that pass CI on first push | `first_pass_prs / total_prs` | CI webhook / git hooks | > 80% | 60-80% | < 60% |
| **Retry Count** | Times an agent retried before succeeding | `count(retries_per_task)` | Hook events (SubagentStop + re-spawn) | < 2 avg | 2-4 avg | > 4 avg |
| **Token Usage Per Task** | Tokens consumed per completed task | `total_tokens / completed_tasks` | Claude OTEL metrics / ccusage | < 100K (small task) | 100-500K | > 500K |
| **Tool Call Error Rate** | % of tool calls that fail | `PostToolUseFailure / PreToolUse` | Hook events | < 3% | 3-10% | > 10% |
| **Rework Rate (DORA 5th)** | % of code requiring post-merge fixes | `fix_commits / total_commits` | Git log analysis | < 10% | 10-20% | > 20% |
| **Human Reversal Rate** | % of agent decisions overridden by human | `overrides / total_decisions` | Manual tracking / PR review data | < 5% | 5-15% | > 15% |

**Per-Agent Scorecard** (computed weekly):

```
Agent: feature-agent-01
Business Line: ContractX
Period: 2026-03-01 to 2026-03-07

Tasks Assigned:     12
Tasks Completed:    10  (83% completion)
Avg Time/Task:      47 min
First-Pass CI:      8/10 (80%)
Avg Retries:        1.3
Total Tokens:       847K
Avg Tokens/Task:    84.7K
Tool Error Rate:    2.1%
Rework Rate:        8%
Human Reversals:    0/10 (0%)

Overall Score: GREEN
```

### 2.2 Tier 2: System Health Metrics

These metrics answer: "Is the infrastructure stable?"

| Metric | Definition | Formula | Collection Method | Target | Alert Threshold |
|--------|-----------|---------|-------------------|--------|----------------|
| **Active Agent Count** | Agents currently processing tasks | `count(agents WHERE status='active')` | State file polling | Depends on workload | Sudden drop > 50% |
| **Agent Uptime** | % of time agent process is alive | `alive_time / scheduled_time` | tmux session monitoring | > 95% | < 90% |
| **State File Freshness** | Time since last state file update | `now() - state_file.mtime` | Filesystem watch | < 5 min | > 10 min |
| **Queue Depth** | Tasks waiting to be assigned | `count(tasks WHERE status='pending')` | State file | < 3x agent_count | > 5x agent_count |
| **Error Rate (Fleet)** | Aggregate error rate across all agents | `sum(errors) / sum(tool_calls)` | Hook events aggregated | < 5% | > 10% |
| **API Rate Limit Proximity** | % of rate limit consumed | `current_usage / limit` | OTEL metrics / CodexBar | < 60% | > 80% |
| **Context Window Utilization** | % of context window used on average | `avg(tokens_used / context_max)` | OTEL metrics | < 80% | > 90% |
| **Memory Utilization (Host)** | RAM usage of agent fleet | `total_agent_ram / total_ram` | System monitoring | < 70% | > 85% |

### 2.3 Tier 3: Business Metrics

These metrics answer: "Is this operation profitable and delivering value?"

| Metric | Definition | Formula | Frequency | Notes |
|--------|-----------|---------|-----------|-------|
| **Revenue Per Business Line** | Monthly revenue from each client contract | Manual entry / invoice data | Monthly | Track in Notion |
| **Cost Per Deliverable** | Total cost (compute + human time) per deliverable | `(token_cost + human_hours * rate) / deliverables` | Per sprint | Key profitability metric |
| **Delivery Velocity** | Stories/features completed per week | `completed_stories / week` | Weekly | Compare to contract SLA |
| **Revision Cycle Count** | Client revision requests per deliverable | `revision_requests / deliverables` | Per deliverable | Proxy for client satisfaction |
| **Cost Per Merged PR** | Token + compute cost per successfully merged PR | `total_cost / merged_prs` | Weekly | Track trend over time |
| **Token Waste Rate** | Tokens spent on failed/abandoned tasks | `failed_tokens / total_tokens` | Weekly | Should decrease over time |
| **ROI Per Agent** | Revenue generated vs compute cost | `attributable_revenue / agent_compute_cost` | Monthly | Target: > 10x on Max subscription |
| **Gross Margin Per Client** | Revenue minus all costs per client | `(revenue - costs) / revenue` | Monthly | Target: 46-83% per Phase 2 research |

### 2.4 Tier 4: Trust Metrics (Client-Facing)

These metrics answer: "Can you prove your agents produce quality work?"

| Metric | Definition | Collection | Client Visibility | Government Relevance |
|--------|-----------|-----------|-------------------|---------------------|
| **Code Quality Score** | Composite: linting + type safety + complexity | ESLint/Biome + TypeScript strict + SonarQube | Per-sprint report | Demonstrates engineering standards |
| **Test Coverage** | % of code covered by automated tests | Jest/Vitest coverage reports | Per-sprint report | Required by many gov RFPs |
| **Security Scan Results** | SAST/DAST findings count and severity | Semgrep/Snyk (SAST) + OWASP ZAP (DAST) | Per-sprint report | Critical for gov contracts |
| **Dependency Vulnerability Count** | Known CVEs in dependencies | npm audit / Snyk | Per-sprint report | Supply chain security |
| **Agent Audit Trail** | Complete log of what each agent did, when | Hook events + git commits | On-demand access | Accountability & traceability |
| **Human Review Rate** | % of agent output reviewed by human | `reviewed_prs / total_prs` | Per-sprint report | Demonstrates oversight |
| **Acceptance Test Pass Rate** | % of acceptance criteria verified | E2E test results (Playwright/Cypress) | Per-sprint report | Validates delivered functionality |
| **Mean Time to Remediation** | Time from vulnerability discovery to fix | Security scan timestamps | Per-sprint report | SLA compliance metric |

---

## 3. Notion Dashboard Architecture

### 3.1 Internal Operations Dashboard (Notion)

**Structure**: A single Notion workspace with linked databases feeding a master dashboard page.

#### Database Schema: Agent Activity Log

| Property | Type | Purpose |
|----------|------|---------|
| Agent ID | Title | Unique agent identifier |
| Task | Relation (to Tasks DB) | What it's working on |
| Status | Select (active/idle/error/complete) | Current state |
| Business Line | Select | Client attribution |
| Start Time | Date | Task start |
| End Time | Date | Task end |
| Tokens Used | Number | Token consumption |
| Estimated Cost | Formula | `Tokens Used * cost_per_token` |
| CI Result | Select (pass/fail/pending) | First-attempt CI |
| Retries | Number | Retry count |
| Error Count | Number | Failed tool calls |
| Outcome | Select (merged/rejected/abandoned) | Final result |

#### Database Schema: Daily Metrics

| Property | Type | Purpose |
|----------|------|---------|
| Date | Title | Reporting date |
| Active Agents | Number | Peak agent count |
| Tasks Completed | Number | Successfully finished tasks |
| Tasks Failed | Number | Abandoned or error tasks |
| Total Tokens | Number | Aggregate token usage |
| Total Cost | Number | Estimated $ cost |
| Fleet Error Rate | Number (%) | Aggregate tool error rate |
| CI Pass Rate | Number (%) | First-attempt pass rate |
| Revenue Attributed | Number | Work tied to revenue |
| Notes | Rich text | Anomalies, incidents |

#### Database Schema: Client Projects

| Property | Type | Purpose |
|----------|------|---------|
| Client Name | Title | Client identifier |
| Contract Value | Number | Total contract $ |
| Sprint | Relation (to Sprints DB) | Current sprint |
| Delivery Velocity | Number | Stories/week |
| Quality Score | Number | Composite code quality |
| Trust Score | Formula | Weighted average of trust metrics |
| Cost to Date | Rollup | Sum of attributed costs |
| Margin | Formula | `(Revenue - Cost) / Revenue * 100` |
| Status | Select (green/yellow/red) | Overall health |

#### Master Dashboard Layout

```
+------------------------------------------------------------------+
|  ORCHESTRATOR OPERATIONS DASHBOARD                    [Live Mode] |
+------------------------------------------------------------------+
|                                                                    |
|  FLEET STATUS          |  TODAY'S METRICS                         |
|  Active: 7/8           |  Tasks Done: 14    Tokens: 2.3M         |
|  Idle: 1               |  CI Pass: 86%      Cost: ~$18           |
|  Errors: 0             |  Error Rate: 1.8%  Waste: 12%           |
|                        |                                          |
+------------------------------------------------------------------+
|                                                                    |
|  AGENT ACTIVITY (last 24h)                                        |
|  [Filtered view of Agent Activity Log database]                   |
|  - Sorted by most recent                                          |
|  - Grouped by Business Line                                       |
|  - Color-coded by status                                          |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  CLIENT HEALTH          |  WEEKLY TRENDS                          |
|  ContractX: GREEN       |  [Notion chart: tasks/day trend]        |
|  ContractY: GREEN       |  [Notion chart: cost/day trend]         |
|  ContractZ: YELLOW      |  [Notion chart: error rate trend]       |
|                         |                                          |
+------------------------------------------------------------------+
|                                                                    |
|  ALERTS & INCIDENTS                                               |
|  [Filtered view: items where Status = red or error]               |
|                                                                    |
+------------------------------------------------------------------+
```

### 3.2 Client-Facing Trust Dashboard (Notion Shared Page)

Each government client gets a shared Notion page with read-only access. The page is updated automatically after each sprint.

#### Layout: Client Trust Portal

```
+------------------------------------------------------------------+
|  [CLIENT LOGO]  PROJECT TRUST DASHBOARD                           |
|  Contract: [Name]  |  Sprint: 14  |  Period: Mar 1-7, 2026       |
+------------------------------------------------------------------+
|                                                                    |
|  DELIVERY SUMMARY                                                 |
|  Stories Completed: 8/9 (89%)                                     |
|  Features Deployed: 3                                             |
|  Bug Fixes: 5                                                     |
|  PRs Merged: 14                                                   |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  CODE QUALITY METRICS                                             |
|  +-------------------+-------------------------------------------+
|  | Metric            | Score    | Trend  | Industry Benchmark    |
|  +-------------------+-------------------------------------------+
|  | Lint Score         | 98.2%   | UP     | > 95% = excellent     |
|  | Type Safety        | 100%    | STABLE | > 95% = excellent     |
|  | Test Coverage      | 82%     | UP     | > 80% = excellent     |
|  | Complexity (avg)   | 4.2     | STABLE | < 10 = good           |
|  | Duplication        | 1.3%    | DOWN   | < 3% = good           |
|  +-------------------+-------------------------------------------+
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  SECURITY POSTURE                                                 |
|  +-------------------+-------------------------------------------+
|  | Check             | Result   | Details                         |
|  +-------------------+-------------------------------------------+
|  | SAST Scan         | PASS     | 0 critical, 0 high, 2 low      |
|  | Dependency Audit  | PASS     | 0 CVEs found                   |
|  | Secret Scan       | PASS     | No secrets in codebase          |
|  | License Compliance| PASS     | All MIT/Apache/BSD              |
|  +-------------------+-------------------------------------------+
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  HUMAN OVERSIGHT                                                  |
|  Human Review Rate: 100% (all PRs reviewed before merge)          |
|  Reviewer: [Name]                                                 |
|  Automated QA: Playwright E2E suite (47 tests, all passing)       |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  ACCEPTANCE TESTS                                                 |
|  [Table: User Story | Acceptance Criteria | Test Status | Link]   |
|  US-101: Login flow     | 3/3 criteria met  | PASS |             |
|  US-102: Dashboard      | 5/5 criteria met  | PASS |             |
|  US-103: Export feature  | 2/3 criteria met  | PARTIAL |          |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  AUDIT TRAIL (summary)                                            |
|  Total commits: 47                                                |
|  Total PRs: 14 (all reviewed, all merged)                         |
|  Agent activity log: [Link to detailed log]                       |
|  Full git history: [Link to repo]                                 |
|                                                                    |
+------------------------------------------------------------------+
```

### 3.3 Automated Updates: Agent Systems to Notion

**Architecture**: Agent hook events flow through the logging pipeline and are pushed to Notion via API.

```
Agent Hook Events
       |
       v
JSON Log Files (local)
       |
       v
Aggregation Script (runs every 15 min or post-task)
       |
       v
Notion API (PATCH/POST)
       |
       +---> Internal Dashboard (Agent Activity Log DB)
       +---> Client Trust Dashboard (Sprint Metrics DB)
```

**Implementation: Notion Update Script**

The update script (Python or Node.js) performs these operations:

1. **Read** local JSON log files from `_bmad/logs/` directory
2. **Aggregate** metrics: tasks completed, tokens used, errors, CI results
3. **POST** to Notion API to create/update rows in the Agent Activity Log database
4. **PATCH** the Daily Metrics database with aggregated numbers
5. **Update** the Client Projects database with sprint progress

**Notion API Authentication**:
- Create internal integration at `https://www.notion.so/my-integrations`
- Store token as environment variable: `NOTION_API_TOKEN`
- Share target databases with the integration
- Use official SDK: `@notionhq/client` (JS) or `notion-client` (Python)

**Trigger Options**:
- **Cron job**: Every 15 minutes during business hours
- **Post-task hook**: Claude Code `Stop` hook triggers update
- **Post-sprint**: Manual or scheduled sprint summary generation
- **CI/CD webhook**: After each CI pipeline completion

**New Notion Feature (March 5, 2026)**: The "can create pages" database permission allows giving the integration write-only access to specific databases without exposing other content -- ideal for automated agent reporting.

---

## 4. Client-Facing Trust Artifacts

### 4.1 Sprint Report Template (Auto-Generated)

**Purpose**: Delivered to government client at end of each sprint (weekly or bi-weekly).
**Format**: Notion page (shareable) + PDF export for formal delivery.

```markdown
# Sprint Report: [Client Name] - Sprint [N]
**Period**: [Start Date] - [End Date]
**Prepared by**: [Your Name/Company]
**Date**: [Report Date]

## 1. Sprint Summary
- **Sprint Goal**: [One-sentence goal]
- **Status**: [On Track / At Risk / Behind]
- **Stories Planned**: [N]
- **Stories Completed**: [N] ([X]%)
- **Stories Carried Over**: [N] (reasons listed below)

## 2. Deliverables
| ID | Story | Priority | Status | Acceptance Tests | Notes |
|----|-------|----------|--------|-----------------|-------|
| US-101 | [Title] | High | Done | 3/3 PASS | |
| US-102 | [Title] | High | Done | 5/5 PASS | |
| US-103 | [Title] | Medium | Partial | 2/3 PASS | [Reason for partial] |

## 3. Code Quality Summary
| Metric | This Sprint | Previous Sprint | Trend |
|--------|------------|----------------|-------|
| Lint Score | 98.2% | 97.8% | Improving |
| Type Safety (strict) | 100% | 100% | Stable |
| Test Coverage | 82% | 79% | Improving |
| Avg Complexity | 4.2 | 4.5 | Improving |
| Code Duplication | 1.3% | 1.5% | Improving |

## 4. Security Report
| Check | Tool | Result | Findings |
|-------|------|--------|----------|
| Static Analysis (SAST) | Semgrep | PASS | 0 critical, 0 high |
| Dependency Vulnerabilities | npm audit + Snyk | PASS | 0 known CVEs |
| Secret Detection | gitleaks | PASS | No secrets detected |
| License Compliance | license-checker | PASS | All permissive licenses |
| OWASP Top 10 | Manual review | PASS | No violations |

## 5. Testing Results
- **Unit Tests**: [X] passing, [Y] failing, [Z]% coverage
- **Integration Tests**: [X] passing
- **E2E Tests (Playwright)**: [X] passing across [Y] browsers
- **Acceptance Tests**: [X/Y] criteria met ([Z]%)

## 6. Human Oversight Statement
All code produced during this sprint was:
- Generated by AI coding agents under human direction
- Reviewed by [Reviewer Name] before merge (100% review rate)
- Tested against automated quality gates (lint, type-check, tests)
- Verified against acceptance criteria by [Reviewer Name]

## 7. Activity Log Summary
- **Total Commits**: [N]
- **Total Pull Requests**: [N] ([X] merged, [Y] closed, [Z] open)
- **Human Review Turnaround**: [X] hours average
- **Revision Requests**: [N] ([Z]% rate)

## 8. Next Sprint Plan
| ID | Story | Priority | Estimate |
|----|-------|----------|----------|
| US-104 | [Title] | High | [X] points |
| US-105 | [Title] | Medium | [X] points |

## 9. Risks & Blockers
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk description] | [High/Med/Low] | [Mitigation plan] |

---
*This report was auto-generated from project telemetry and verified by [Name].*
*Full audit trail available on request.*
```

### 4.2 Code Quality Report Template

**Purpose**: Detailed code quality analysis, attached to sprint report or delivered standalone.
**Generation**: Automated from CI pipeline output.

```markdown
# Code Quality Report: [Project Name]
**Date**: [Date]
**Commit Range**: [SHA1]..[SHA2]
**Lines Changed**: +[N] / -[N]

## Static Analysis (Semgrep / ESLint / Biome)
- **Total Rules Evaluated**: [N]
- **Violations Found**: [N] ([breakdown by severity])
  - Critical: 0
  - High: 0
  - Medium: [N] (list each with file + line)
  - Low: [N]
  - Info: [N]
- **Auto-fixed**: [N] violations resolved automatically

## Type Safety
- **TypeScript Strict Mode**: Enabled
- **Type Errors**: 0
- **Any Usage**: [N] instances ([trend vs. previous])
- **Missing Return Types**: 0

## Test Coverage
| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| [module] | [X]% | [X]% | [X]% | [X]% |
| **Total** | **[X]%** | **[X]%** | **[X]%** | **[X]%** |

## Complexity Analysis (SonarQube / ESLint)
- **Average Cyclomatic Complexity**: [X]
- **Functions > 10 Complexity**: [N] (list each)
- **Files > 300 Lines**: [N] (list each)
- **Cognitive Complexity**: [X] average

## Dependency Health
- **Total Dependencies**: [N] (production) + [N] (dev)
- **Outdated (major)**: [N]
- **Outdated (minor)**: [N]
- **Known Vulnerabilities**: [N] (0 critical/high expected)
- **License Issues**: None

## Code Duplication
- **Duplicate Blocks**: [N]
- **Duplicate Lines**: [X]%
- **Files with Duplicates**: [list]

---
*Generated automatically from CI pipeline run #[N]*
```

### 4.3 Security Scan Report Template

**Purpose**: Demonstrates security due diligence. Critical for government contracts.
**Generation**: Automated from security tool output.

```markdown
# Security Assessment Report: [Project Name]
**Date**: [Date]
**Classification**: [Client-Sensitive / Internal]
**Assessor**: Automated toolchain + [Human Reviewer Name]

## Executive Summary
This assessment covers static analysis, dependency scanning, and
secret detection for the codebase as of [commit SHA]. No critical or
high-severity findings were identified.

## 1. Static Application Security Testing (SAST)
**Tool**: Semgrep (with OWASP, CWE rule packs)
**Rules Applied**: [N]
**Findings**:
| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | N/A |
| High | 0 | N/A |
| Medium | [N] | [Remediated / Accepted Risk / In Progress] |
| Low | [N] | [Status] |

**Detail per finding**:
| ID | CWE | Description | File:Line | Status | Remediation |
|----|-----|------------|-----------|--------|-------------|
| [ID] | CWE-[N] | [Desc] | [file:line] | Fixed | [What was done] |

## 2. Dependency Vulnerability Scan
**Tool**: npm audit + Snyk
**Total Dependencies Scanned**: [N]
**Findings**:
| Package | Version | CVE | Severity | Fix Available | Status |
|---------|---------|-----|----------|--------------|--------|
| (none found) | | | | | |

## 3. Secret Detection
**Tool**: gitleaks / trufflehog
**Scanned**: Full git history
**Findings**: 0 secrets detected

## 4. License Compliance
**Tool**: license-checker
**Policy**: Only permissive licenses (MIT, Apache 2.0, BSD, ISC)
**Violations**: None

## 5. OWASP Top 10 Review
| Risk | Status | Notes |
|------|--------|-------|
| A01 - Broken Access Control | PASS | [Evidence] |
| A02 - Cryptographic Failures | PASS | [Evidence] |
| A03 - Injection | PASS | [Evidence] |
| A04 - Insecure Design | PASS | [Evidence] |
| A05 - Security Misconfiguration | PASS | [Evidence] |
| A06 - Vulnerable Components | PASS | [Evidence] |
| A07 - Auth Failures | PASS | [Evidence] |
| A08 - Data Integrity Failures | PASS | [Evidence] |
| A09 - Logging Failures | PASS | [Evidence] |
| A10 - SSRF | N/A | No server-side requests |

## 6. Compliance Mapping
| Requirement | Framework | Status |
|------------|-----------|--------|
| Code review for all changes | SOC 2 CC8.1 | MET (100% review rate) |
| Vulnerability management | SOC 2 CC7.1 | MET (automated scanning) |
| Change management | SOC 2 CC8.1 | MET (PR-based workflow) |
| Access control | SOC 2 CC6.1 | MET (role-based access) |
| Audit trail | SOC 2 CC7.2 | MET (full git + agent logs) |

---
*This report was generated from automated security tooling and reviewed by [Name].*
```

### 4.4 Agent Activity Log (Human-Readable)

**Purpose**: Transparency artifact showing exactly what agents did. Addresses the government concern about AI accountability.
**Format**: Notion database view + exportable CSV/PDF.

```
AGENT ACTIVITY LOG - [Project Name]
Period: [Start] to [End]

+--------+-----+-------+------+--------+--------+--------+--------+
| Time   |Agent|Action |Tool  |Target  |Result  |Tokens  |Reviewer|
+--------+-----+-------+------+--------+--------+--------+--------+
|09:01:15|ag-01|Read   |Read  |src/    |OK      |1,247   |        |
|        |     |       |      |auth.ts |        |        |        |
|09:01:22|ag-01|Analyze|Think |auth    |OK      |3,891   |        |
|        |     |       |      |flow    |        |        |        |
|09:02:45|ag-01|Edit   |Edit  |src/    |OK      |2,103   |        |
|        |     |       |      |auth.ts |        |        |        |
|09:03:10|ag-01|Test   |Bash  |npm test|PASS    |892     |        |
|09:03:55|ag-01|Commit |Bash  |git     |OK      |445     |        |
|        |     |       |      |commit  |        |        |        |
|09:04:10|ag-01|PR     |Bash  |gh pr   |Created |612     |        |
|        |     |       |      |create  |#47     |        |        |
|09:15:00|     |Review |Human |PR #47  |Approved|        |Burak   |
|09:15:30|     |Merge  |Human |PR #47  |Merged  |        |Burak   |
+--------+-----+-------+------+--------+--------+--------+--------+

Summary: 6 agent actions, 1 PR created, 9,190 tokens, human-approved.
```

### 4.5 Acceptance Test Results Document

**Purpose**: Formal verification that delivered features meet acceptance criteria.
**Generation**: From Playwright/Cypress E2E test output + manual verification.

```markdown
# Acceptance Test Results: Sprint [N]
**Project**: [Client Name]
**Date**: [Date]
**Tester**: Automated (Playwright) + [Human Verifier Name]

## Summary
- **Total Acceptance Criteria**: [N]
- **Passed**: [N] ([X]%)
- **Failed**: [N]
- **Blocked**: [N]

## Detailed Results

### US-101: User Login Flow
**Priority**: High | **Status**: ACCEPTED

| # | Criterion | Method | Result | Evidence |
|---|-----------|--------|--------|----------|
| 1 | User can log in with valid credentials | Automated (Playwright) | PASS | Screenshot + test log |
| 2 | Invalid credentials show error message | Automated (Playwright) | PASS | Screenshot + test log |
| 3 | Session persists across page refresh | Automated (Playwright) | PASS | Screenshot + test log |

### US-102: Dashboard Display
**Priority**: High | **Status**: ACCEPTED

| # | Criterion | Method | Result | Evidence |
|---|-----------|--------|--------|----------|
| 1 | Dashboard loads within 3 seconds | Automated (Lighthouse) | PASS | LCP: 1.8s |
| 2 | All widgets display correct data | Manual verification | PASS | Verified by [Name] |
| 3 | Mobile responsive layout | Automated (Playwright) | PASS | Screenshots at 375px, 768px, 1024px |

### US-103: Data Export
**Priority**: Medium | **Status**: PARTIAL

| # | Criterion | Method | Result | Evidence |
|---|-----------|--------|--------|----------|
| 1 | Export to CSV works | Automated (Playwright) | PASS | File downloaded, verified |
| 2 | Export to PDF works | Automated (Playwright) | PASS | File downloaded, verified |
| 3 | Export includes all filters | Manual verification | FAIL | Date filter not applied to export |

**Remediation**: US-103 criterion 3 will be addressed in Sprint [N+1].

---
*Automated tests executed on [date] at [time]. Manual verification by [Name].*
*Full test logs and screenshots archived at [link].*
```

---

## 5. Logging Architecture

### 5.1 Structured JSON Event Schema

Every agent action produces a structured JSON event. This is the canonical event format used throughout the system.

```json
{
  "event_id": "evt_20260306_093015_ag01_001",
  "timestamp": "2026-03-06T09:30:15.123Z",
  "agent_id": "feature-agent-01",
  "session_id": "sess_abc123",
  "business_line": "contract-x",
  "project": "client-portal",
  "event_type": "PostToolUse",
  "tool": "Edit",
  "target": "src/components/Dashboard.tsx",
  "result": "success",
  "duration_ms": 1847,
  "tokens": {
    "input": 12450,
    "output": 3210,
    "cache_read": 8900,
    "cache_creation": 0
  },
  "cost_estimate_usd": 0.0043,
  "context": {
    "task_id": "TASK-047",
    "sprint": "sprint-14",
    "story_id": "US-102"
  },
  "error": null,
  "metadata": {
    "model": "claude-sonnet-4-6",
    "context_window_used_pct": 34.2,
    "retry_number": 0
  }
}
```

### 5.2 Event Types Enumeration

| Event Type | Source | Purpose | Frequency |
|-----------|--------|---------|-----------|
| `TaskAssigned` | Orchestrator state file | Agent received a task | Per task |
| `TaskCompleted` | Orchestrator state file | Agent finished a task | Per task |
| `TaskFailed` | Orchestrator state file | Agent failed a task | Per failure |
| `PreToolUse` | Claude Code hook | Tool call initiated | Very high (every tool call) |
| `PostToolUse` | Claude Code hook | Tool call succeeded | Very high |
| `PostToolUseFailure` | Claude Code hook | Tool call failed | Per failure |
| `UserPromptSubmit` | Claude Code hook | Prompt sent to agent | Per prompt |
| `Stop` | Claude Code hook | Agent finished responding | Per response |
| `SubagentStop` | Claude Code hook | Subagent completed | Per subagent |
| `CIResult` | CI webhook / git hook | Test/lint/build result | Per PR push |
| `PRCreated` | Git hook | Pull request opened | Per PR |
| `PRReviewed` | Git hook | Human reviewed PR | Per review |
| `PRMerged` | Git hook | PR merged to main | Per merge |
| `AgentSpawned` | Orchestrator | New agent process started | Per spawn |
| `AgentKilled` | Orchestrator | Agent process terminated | Per kill |
| `AlertTriggered` | Monitoring system | Threshold exceeded | Per alert |
| `HumanOverride` | Manual entry | Human overrode agent decision | Per override |

### 5.3 Log Storage Pipeline

```
Layer 1: JSON Log Files (Immediate)
    Location: _bmad/logs/{date}/{agent_id}.jsonl
    Format: Newline-delimited JSON (JSONL)
    Retention: 30 days on disk
    Size estimate: ~50 KB/agent/hour, ~1.2 MB/agent/day

Layer 2: SQLite (Queryable, Local)
    Location: _bmad/observability.db
    Schema: events table with indexed timestamp, agent_id, event_type, business_line
    Retention: 90 days
    Size estimate: ~200 MB/month at 10 agents
    Purpose: Post-mortem queries, trend analysis, report generation

Layer 3: Notion (Dashboard, Client-Facing)
    Updated: Every 15 min (cron) or post-task (hook)
    Content: Aggregated metrics, not raw events
    Retention: Permanent (client-visible history)
    Purpose: Internal dashboard + client trust portal

Layer 4: Archive (Long-term)
    Location: Compressed JSONL in _bmad/archive/{year}/{month}/
    Format: gzip compressed JSONL
    Retention: 1 year minimum (government compliance)
    Size estimate: ~20 MB/month compressed at 10 agents
```

### 5.4 SQLite Schema

```sql
CREATE TABLE events (
    event_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    session_id TEXT,
    business_line TEXT,
    project TEXT,
    event_type TEXT NOT NULL,
    tool TEXT,
    target TEXT,
    result TEXT,
    duration_ms INTEGER,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    tokens_cache_read INTEGER DEFAULT 0,
    tokens_cache_creation INTEGER DEFAULT 0,
    cost_estimate_usd REAL DEFAULT 0,
    task_id TEXT,
    sprint TEXT,
    story_id TEXT,
    error TEXT,
    model TEXT,
    context_window_pct REAL,
    retry_number INTEGER DEFAULT 0,
    raw_payload TEXT,  -- Full JSON for forensics
    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Performance indices
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_agent ON events(agent_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_business ON events(business_line);
CREATE INDEX idx_events_task ON events(task_id);
CREATE INDEX idx_events_sprint ON events(sprint);

-- Aggregation view: daily metrics per agent
CREATE VIEW daily_agent_metrics AS
SELECT
    date(timestamp) as day,
    agent_id,
    business_line,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_type = 'TaskCompleted' THEN 1 END) as tasks_completed,
    COUNT(CASE WHEN event_type = 'TaskFailed' THEN 1 END) as tasks_failed,
    COUNT(CASE WHEN event_type = 'PostToolUseFailure' THEN 1 END) as tool_errors,
    COUNT(CASE WHEN event_type IN ('PreToolUse', 'PostToolUse', 'PostToolUseFailure') THEN 1 END) as tool_calls,
    SUM(tokens_input + tokens_output) as total_tokens,
    SUM(cost_estimate_usd) as total_cost,
    AVG(duration_ms) as avg_duration_ms,
    AVG(context_window_pct) as avg_context_pct
FROM events
GROUP BY date(timestamp), agent_id, business_line;

-- Aggregation view: daily fleet metrics
CREATE VIEW daily_fleet_metrics AS
SELECT
    date(timestamp) as day,
    COUNT(DISTINCT agent_id) as active_agents,
    COUNT(*) as total_events,
    COUNT(CASE WHEN event_type = 'TaskCompleted' THEN 1 END) as tasks_completed,
    COUNT(CASE WHEN event_type = 'TaskFailed' THEN 1 END) as tasks_failed,
    ROUND(
        CAST(COUNT(CASE WHEN event_type = 'PostToolUseFailure' THEN 1 END) AS REAL) /
        NULLIF(COUNT(CASE WHEN event_type IN ('PreToolUse', 'PostToolUse', 'PostToolUseFailure') THEN 1 END), 0) * 100,
        2
    ) as error_rate_pct,
    SUM(tokens_input + tokens_output) as total_tokens,
    SUM(cost_estimate_usd) as total_cost
FROM events
GROUP BY date(timestamp);
```

### 5.5 Useful Queries for Post-Mortem Analysis

```sql
-- 1. What happened during an incident? (last 2 hours of a specific agent)
SELECT timestamp, event_type, tool, target, result, error, duration_ms
FROM events
WHERE agent_id = 'feature-agent-01'
  AND timestamp > datetime('now', '-2 hours')
ORDER BY timestamp;

-- 2. Which agents are consuming the most tokens this week?
SELECT agent_id, business_line,
       SUM(tokens_input + tokens_output) as total_tokens,
       SUM(cost_estimate_usd) as total_cost,
       COUNT(CASE WHEN event_type = 'TaskCompleted' THEN 1 END) as tasks_done
FROM events
WHERE timestamp > datetime('now', '-7 days')
GROUP BY agent_id, business_line
ORDER BY total_tokens DESC;

-- 3. Error rate by tool type (find problematic tools)
SELECT tool,
       COUNT(*) as total_calls,
       COUNT(CASE WHEN event_type = 'PostToolUseFailure' THEN 1 END) as failures,
       ROUND(CAST(COUNT(CASE WHEN event_type = 'PostToolUseFailure' THEN 1 END) AS REAL) /
             COUNT(*) * 100, 2) as error_rate_pct
FROM events
WHERE event_type IN ('PostToolUse', 'PostToolUseFailure')
  AND timestamp > datetime('now', '-7 days')
GROUP BY tool
ORDER BY error_rate_pct DESC;

-- 4. Cost per task by business line
SELECT business_line,
       COUNT(DISTINCT task_id) as tasks,
       SUM(cost_estimate_usd) as total_cost,
       ROUND(SUM(cost_estimate_usd) / COUNT(DISTINCT task_id), 4) as cost_per_task
FROM events
WHERE task_id IS NOT NULL
  AND timestamp > datetime('now', '-30 days')
GROUP BY business_line;

-- 5. Token waste: cost on failed tasks
SELECT
    ROUND(SUM(CASE WHEN task_id IN (
        SELECT DISTINCT task_id FROM events WHERE event_type = 'TaskFailed'
    ) THEN cost_estimate_usd ELSE 0 END), 4) as wasted_cost,
    ROUND(SUM(cost_estimate_usd), 4) as total_cost,
    ROUND(SUM(CASE WHEN task_id IN (
        SELECT DISTINCT task_id FROM events WHERE event_type = 'TaskFailed'
    ) THEN cost_estimate_usd ELSE 0 END) / SUM(cost_estimate_usd) * 100, 2) as waste_pct
FROM events
WHERE timestamp > datetime('now', '-7 days');

-- 6. Agent idle time analysis
WITH task_boundaries AS (
    SELECT agent_id,
           timestamp as end_time,
           LEAD(timestamp) OVER (PARTITION BY agent_id ORDER BY timestamp) as next_start
    FROM events
    WHERE event_type IN ('TaskCompleted', 'TaskFailed')
)
SELECT agent_id,
       AVG(CAST((julianday(next_start) - julianday(end_time)) * 24 * 60 AS REAL)) as avg_idle_minutes,
       MAX(CAST((julianday(next_start) - julianday(end_time)) * 24 * 60 AS REAL)) as max_idle_minutes
FROM task_boundaries
WHERE next_start IS NOT NULL
GROUP BY agent_id;

-- 7. Judgment SLO: human override tracking
SELECT
    strftime('%Y-%W', timestamp) as week,
    COUNT(*) as total_decisions,
    COUNT(CASE WHEN event_type = 'HumanOverride' THEN 1 END) as overrides,
    ROUND(CAST(COUNT(CASE WHEN event_type = 'HumanOverride' THEN 1 END) AS REAL) /
          COUNT(*) * 100, 2) as override_rate_pct
FROM events
WHERE event_type IN ('PRMerged', 'PRReviewed', 'HumanOverride')
GROUP BY week
ORDER BY week DESC;
```

### 5.6 Log Retention Policy

| Data Type | Hot (Full Detail) | Warm (Aggregated) | Cold (Archived) | Delete |
|-----------|------------------|-------------------|-----------------|--------|
| Raw JSONL events | 7 days | 30 days (in SQLite) | 1 year (gzip) | After 1 year |
| SQLite database | 90 days | N/A | Backup monthly | After 2 years |
| Notion dashboard data | Permanent | N/A | N/A | Never (client-facing) |
| CI/CD artifacts | 30 days | N/A | 1 year | After 1 year |
| Security scan reports | Permanent | N/A | N/A | Never (compliance) |

**Government compliance note**: Many government contracts require 1-3 year data retention. Default to 1 year for all logs, permanent for security artifacts. Document the retention policy in client contracts.

---

## 6. Cost Tracking Architecture

### 6.1 Cost Attribution Model

```
Token Usage (per agent, per session)
    |
    +-- ccusage reads ~/.claude/projects/<project>/<conversation>.jsonl
    |
    +-- Each conversation maps to a task_id (via orchestrator state)
    |
    +-- Each task_id maps to a business_line / client
    |
    v
Cost Per Task = tokens * cost_per_token (model-specific)
    |
    v
Cost Per Client = SUM(Cost Per Task WHERE business_line = client)
    |
    v
Margin Per Client = (Revenue - Cost Per Client) / Revenue
```

### 6.2 Claude Max Subscription Cost Attribution

With Claude Max ($100-200/mo flat rate), direct per-token costs are zero. The attribution model becomes:

**Method: Time-Weighted Allocation**

```
Total Subscription Cost: $200/month
Total Agent-Hours This Month: 400 hours (across all agents)
Cost Per Agent-Hour: $200 / 400 = $0.50/hour

Client A used 200 agent-hours = $100 attributed
Client B used 150 agent-hours = $75 attributed
Client C used 50 agent-hours = $25 attributed
```

**Method: Token-Weighted Allocation (more granular)**

```
Total Subscription Cost: $200/month
Total Tokens This Month: 50M tokens
Cost Per Token: $200 / 50M = $0.000004/token

Client A: 25M tokens = $100 attributed
Client B: 15M tokens = $60 attributed
Client C: 10M tokens = $40 attributed
```

### 6.3 API Cost Tracking (When Using API)

For API usage (not Max subscription), use one of these approaches:

| Approach | Tool | How It Works | Granularity |
|----------|------|-------------|-------------|
| **LiteLLM Proxy** | litellm | Proxy all API calls, tag with customer/project | Per-request |
| **Helicone Proxy** | helicone | One-line integration, 300+ model pricing DB | Per-request |
| **Claude OTEL** | Native | Export token counts via OTEL, compute cost externally | Per-session |
| **Anthropic Usage API** | Anthropic console | Pull usage data per workspace/API key | Daily aggregate |
| **ccusage** | ccusage CLI | Analyze local JSONL files | Per-session |

### 6.4 Cost Dashboard Design (Notion)

```
+------------------------------------------------------------------+
|  COST & REVENUE DASHBOARD                         March 2026      |
+------------------------------------------------------------------+
|                                                                    |
|  MONTHLY SUMMARY                                                  |
|  Subscription Cost: $200        API Cost: $0                      |
|  Human Hours: 40h ($4,000)      Total Cost: $4,200                |
|  Revenue: $12,500               Gross Margin: 66.4%               |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  PER-CLIENT BREAKDOWN                                             |
|  +-------+--------+--------+-------+--------+-------+            |
|  |Client |Revenue |Compute |Human  |Total   |Margin |            |
|  +-------+--------+--------+-------+--------+-------+            |
|  |Clt A  |$6,000  |$100    |$1,500 |$1,600  |73.3%  |            |
|  |Clt B  |$4,000  |$60     |$1,500 |$1,560  |61.0%  |            |
|  |Clt C  |$2,500  |$40     |$1,000 |$1,040  |58.4%  |            |
|  +-------+--------+--------+-------+--------+-------+            |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  TOKEN USAGE TREND (weekly)                                       |
|  [Notion chart: tokens consumed per week, colored by client]      |
|                                                                    |
|  COST PER DELIVERABLE TREND                                       |
|  [Notion chart: $/story or $/PR over time]                        |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  EFFICIENCY METRICS                                               |
|  Avg Cost/PR: $2.14        Token Waste Rate: 11%                 |
|  Avg Cost/Story: $8.50     Agent Utilization: 78%                 |
|  Cost Trend: DOWN 8%       ROI: 62x (on compute)                 |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 7. Implementation Roadmap

### Week 1: Foundation

| Task | Details | Output |
|------|---------|--------|
| Set up JSON logging | Create hook scripts that write JSONL events to `_bmad/logs/` | Working event pipeline |
| Configure ccusage | Install, run first analysis | Baseline cost data |
| Create SQLite database | Apply schema from section 5.4 | Queryable event store |
| Create Notion databases | Agent Activity Log, Daily Metrics, Client Projects | Dashboard skeleton |

### Week 2: Dashboards

| Task | Details | Output |
|------|---------|--------|
| Build internal dashboard | Notion master page with linked views | Operational visibility |
| Build client trust portal | First client's shared page | Client-facing trust |
| Write Notion update script | Python/Node script to push aggregated metrics | Automated updates |
| Set up cron job | Run update script every 15 min | Continuous refresh |

### Week 3: Automation

| Task | Details | Output |
|------|---------|--------|
| Auto-generate sprint report | Script that queries SQLite + formats markdown | Sprint report template |
| Integrate CI results | Webhook from CI to event pipeline | Quality metrics flowing |
| Add security scanning | Semgrep + npm audit in CI | Security data flowing |
| First client delivery | Complete trust portal with sprint report | Client trust established |

### Week 4: Refinement

| Task | Details | Output |
|------|---------|--------|
| Enable Claude OTEL | Set environment variables for telemetry export | Native telemetry |
| Set SLO thresholds | Configure alerts for metric thresholds | Proactive monitoring |
| Add cost attribution | Implement token-weighted allocation | Per-client cost tracking |
| Judgment SLO baseline | Start tracking human override rate | Trust calibration |

---

## 8. Key Design Decisions

### 8.1 Why Notion (Not Grafana) for Client Dashboards

| Factor | Notion | Grafana |
|--------|--------|---------|
| Client access | Share a page link, no account needed | Requires viewer account or public dashboard |
| Government clients | Familiar, non-technical interface | Technical, intimidating for non-engineers |
| Content richness | Mixed: text, databases, charts, files | Charts and metrics only |
| PDF export | Native, looks good | Possible but requires plugins |
| Automated updates | Via API (straightforward) | Via data source (more complex) |
| Internal use | Good for dashboards | Excellent for operational monitoring |
| Real-time | Updates on page refresh | True real-time streaming |

**Decision**: Notion for client-facing trust artifacts and business dashboards. Grafana for internal operational monitoring (Phase 2+). Separation of concerns: clients see polished reports, operators see raw telemetry.

### 8.2 Why SQLite Before Langfuse

At 3-10 agents on Claude Max:
- SQLite handles the write volume easily (< 100 events/min)
- Zero infrastructure cost
- ccusage already reads the native JSONL files
- IndyDevDan's hook architecture is proven at this scale
- Langfuse adds infrastructure complexity that is not yet justified

Migrate to Langfuse when: agent count exceeds 15, or when SQLite query latency becomes noticeable, or when multiple people need concurrent dashboard access.

### 8.3 Why Hooks Over OTEL (Phase 1)

Claude Code hooks provide richer context than OTEL telemetry:
- Hook events include tool names, targets, and full payloads
- OTEL exports metadata only (token counts, latency, model)
- Hooks can trigger actions (write to log, send to server, update Notion)
- OTEL is better for fleet-level aggregate monitoring (Phase 2+)

**Recommended approach**: Use hooks for event capture (Phase 1), add OTEL for aggregate metrics (Phase 2), run both in parallel for maximum visibility.

---

## 9. Government-Specific Considerations

### 9.1 Compliance Alignment

| Requirement | How This Design Addresses It |
|------------|------------------------------|
| **Audit trail** | Every agent action logged with timestamp, agent ID, and outcome |
| **Human oversight** | 100% human review rate tracked and reported |
| **Data retention** | 1-year minimum, permanent for security artifacts |
| **Access control** | Notion sharing with read-only client access |
| **Change management** | PR-based workflow, all changes tracked in git |
| **Vulnerability management** | Automated SAST/DAST in CI, reported per sprint |
| **Incident response** | SQLite queries for rapid post-mortem, alert escalation matrix |
| **Transparency about AI use** | Agent activity log explicitly shows AI involvement |

### 9.2 Colorado AI Act (June 2026) Preparation

The Phase 2 research flagged this as urgent. This observability design supports compliance by:
- Documenting AI system capabilities and limitations
- Maintaining audit trails of AI decision-making
- Providing human override mechanisms (tracked via Judgment SLOs)
- Enabling impact assessments with historical data

### 9.3 EU AI Act (August 2026) Preparation

For contracts with EU-adjacent requirements:
- Risk classification documentation (this system is low-risk: coding tool)
- Transparency: clients know AI is used, agents are identified in logs
- Human oversight: human review rate is a first-class metric
- Data governance: all data stays on infrastructure you control (self-hosted)

---

## Sources

### Observability Tools
- [Langfuse vs LangSmith Comparison](https://langfuse.com/faq/all/langsmith-alternative)
- [Langfuse Alternatives 2026 (Braintrust)](https://www.braintrust.dev/articles/langfuse-alternatives-2026)
- [8 AI Observability Platforms Compared](https://softcery.com/lab/top-8-observability-platforms-for-ai-agents-in-2025)
- [Best LLM Observability Tools 2026 (Firecrawl)](https://www.firecrawl.dev/blog/best-llm-observability-tools)
- [LLM Observability 2026 Comparison (LakeFS)](https://lakefs.io/blog/llm-observability-tools/)
- [Langfuse GitHub](https://github.com/langfuse/langfuse)
- [OpenLLMetry (Traceloop)](https://github.com/traceloop/openllmetry)
- [7 Open Source LLM Observability Tools (PostHog)](https://posthog.com/blog/best-open-source-llm-observability-tools)
- [Helicone Cost Tracking](https://docs.helicone.ai/guides/cookbooks/cost-tracking)
- [Helicone GitHub](https://github.com/Helicone/helicone)

### Claude Code Monitoring
- [Claude Code Monitoring Docs](https://code.claude.com/docs/en/monitoring-usage)
- [Claude Code + OpenTelemetry + Grafana (Quesma)](https://quesma.com/blog/track-claude-code-usage-and-limits-with-grafana-cloud/)
- [Claude Code Monitoring with OpenTelemetry (SigNoz)](https://signoz.io/blog/claude-code-monitoring-with-opentelemetry/)
- [claude-code-otel (GitHub)](https://github.com/ColeMurray/claude-code-otel)
- [claude_telemetry (GitHub)](https://github.com/TechNickAI/claude_telemetry)
- [Dev-Agent-Lens (Arize)](https://arize.com/blog/claude-code-observability-and-tracing-introducing-dev-agent-lens/)
- [Claude Code Metrics Dashboard (Sealos)](https://sealos.io/blog/claude-code-metrics/)

### Cost Tracking
- [Claude Code Cost Management Docs](https://code.claude.com/docs/en/costs)
- [LiteLLM Claude Code Customer Tracking](https://docs.litellm.ai/docs/tutorials/claude_code_customer_tracking)
- [ccusage CLI Tool](https://ccusage.com/)
- [ccusage GitHub](https://github.com/ryoppippi/ccusage)
- [Claude Code Usage Analyzer (GitHub)](https://github.com/aarora79/claude-code-usage-analyzer)
- [Claude Usage Monitor (GitHub)](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor)
- [Anthropic Usage and Cost API](https://platform.claude.com/docs/en/build-with-claude/usage-cost-api)
- [Datadog + Anthropic Cost Monitoring](https://www.datadoghq.com/blog/anthropic-usage-and-costs/)

### Notion Integration
- [Notion API Documentation](https://developers.notion.com)
- [Notion KPI Dashboard Blog](https://www.notion.com/blog/kpi-dashboard)
- [NotionMetrics](https://notionmetrics.com/)
- [Notion API Python Guide](https://www.python-engineer.com/posts/notion-api-python/)
- [Notion Database Automation (Apify)](https://apify.com/alizarin_refrigerator-owner/notion-api---database-page-automation)
- [New "can create pages" Permission (March 2026)](https://www.notion.com/releases/2026-03-05)

### Trust & Compliance
- [AI Audit Trails for Compliance (Cobbai)](https://cobbai.com/blog/ai-audit-trails-support)
- [AI Audit Trail: Compliance & Evidence (Swept AI)](https://www.swept.ai/ai-audit-trail)
- [Building Trustworthy AI Agents (IBM)](https://www.ibm.com/think/insights/building-trustworthy-ai-agents-compliance-auditability-explainability)
- [AI Agent Compliance (Zenity)](https://zenity.io/use-cases/business-needs/ai-agents-compliance)
- [FedRAMP AI](https://www.fedramp.gov/ai/)
- [Compliance in the Age of AI (DevOps.com)](https://devops.com/compliance-in-the-age-of-ai-why-strong-ci-cd-foundations-matter/)
- [Auditing Agentic AI (ISACA)](https://www.isaca.org/resources/news-and-trends/industry-news/2025/the-growing-challenge-of-auditing-agentic-ai)

### Logging & Architecture
- [Production Multi-Agent Communication (MarkTechPost)](https://www.marktechpost.com/2026/03/01/how-to-design-a-production-grade-multi-agent-communication-system-using-langgraph-structured-message-bus-acp-logging-and-persistent-shared-state-architecture/)
- [AI Agent Architecture 2026 (Redis)](https://redis.io/blog/ai-agent-architecture/)
- [Complete Guide to LLM Observability (Portkey)](https://portkey.ai/blog/the-complete-guide-to-llm-observability/)
- [AI Agents 2026 Architecture (Furmanets)](https://andriifurmanets.com/blogs/ai-agents-2026-practical-architecture-tools-memory-evals-guardrails)
