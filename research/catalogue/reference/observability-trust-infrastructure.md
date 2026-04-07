# Observability & Trust Infrastructure

> **Full observability and trust stack for multi-agent coding operations: tool selection (Langfuse, Arize Phoenix, ccusage), four-tier metrics framework, Notion dashboards, auto-generated government trust artifacts, structured logging pipeline (JSON->SQLite->Notion), and cost attribution per client.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-observability-trust-design.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document specifies the complete observability and trust infrastructure for an agent-augmented software delivery operation targeting government clients. The core design principle is dual-use: every agent action produces a structured event that flows through a pipeline ending in both an operational dashboard (internal) and a trust artifact (client-facing). This means observability is not overhead -- it is the revenue lever.

The architecture is built on six pillars: (1) tool selection with Claude Code/Max compatibility analysis across 10 tools, phased from hooks+ccusage (Phase 1, 3-10 agents) through Langfuse v3+Grafana (Phase 2, 10-25 agents) to full OpenTelemetry+distributed tracing (Phase 3, 25-50+ agents); (2) a four-tier metrics framework covering agent performance (task completion rate, CI pass rate, token usage), system health (uptime, queue depth, context window utilization), business economics (cost per deliverable, ROI per agent, gross margin per client), and client-facing trust metrics (code quality score, security scan results, human review rate); (3) Notion dashboards for internal operations and client-facing trust portals; (4) auto-generated trust artifacts (sprint reports, code quality reports, security assessments, acceptance test results, agent activity logs) in formats designed for German government procurement; (5) a four-layer logging pipeline (JSONL files -> SQLite -> Notion -> gzip archives) with structured JSON event schema; and (6) cost attribution models for both Claude Max subscription (time-weighted or token-weighted allocation) and API usage.

---

## Key Findings

### Tool Compatibility Analysis

Claude Code has native OpenTelemetry support (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) exporting metrics and events. The hook system (PreToolUse, PostToolUse, Stop, SubagentStop, etc.) enables custom event capture without SDK dependencies.

**Phase 1 (3-10 agents, current)**: Claude Code hooks for JSON log capture, ccusage CLI for usage analysis, IndyDevDan hooks (Bun+SQLite+Vue) for real-time monitoring, tmux capture-pane polling for process monitoring. Total overhead: ~500 MB RAM, <1 GB disk.

**Phase 2 (10-25 agents)**: Langfuse v3 self-hosted (ClickHouse backend, 100K events/sec), Grafana+Prometheus for fleet-level dashboards, Helicone for API cost tracking, Prometheus Alertmanager for SLO-based alerts. Total: ~6 GB RAM, ~35 GB disk.

**Phase 3 (25-50+ agents)**: OpenTelemetry+Grafana Tempo for distributed tracing, Langfuse v3 agent visualization, custom auto-remediation scripts, automated Notion+PDF trust pipeline.

### Four-Tier Metrics Framework

**Tier 1 - Agent Performance**: Task Completion Rate (target >85%), Time to Completion (<30min small/<2h medium), First-Attempt CI Pass Rate (>80%), Retry Count (<2 avg), Token Usage Per Task (<100K small), Tool Call Error Rate (<3%), Rework Rate (<10%), Human Reversal Rate (<5%). Weekly per-agent scorecards with GREEN/YELLOW/RED status.

**Tier 2 - System Health**: Active Agent Count, Agent Uptime (>95%), State File Freshness (<5min), Queue Depth (<3x agent count), Fleet Error Rate (<5%), API Rate Limit Proximity (<60%), Context Window Utilization (<80%), Memory Utilization (<70%).

**Tier 3 - Business Economics**: Revenue Per Business Line, Cost Per Deliverable, Delivery Velocity, Revision Cycle Count, Cost Per Merged PR, Token Waste Rate, ROI Per Agent (target >10x on Max), Gross Margin Per Client (target 46-83%).

**Tier 4 - Trust Metrics (Client-Facing)**: Code Quality Score (lint+type+complexity composite), Test Coverage, Security Scan Results (SAST/DAST), Dependency Vulnerability Count, Agent Audit Trail, Human Review Rate, Acceptance Test Pass Rate, Mean Time to Remediation.

### Trust Artifacts for Government

Five auto-generated report templates designed for German government procurement:

1. **Sprint Report**: Delivery summary, code quality table with trend arrows, security posture matrix, human oversight statement (100% review rate), acceptance test results per user story, next sprint plan, risks & blockers
2. **Code Quality Report**: Static analysis by severity, TypeScript strict mode compliance, test coverage by module, complexity analysis, dependency health, code duplication metrics
3. **Security Assessment Report**: SAST (Semgrep/CWE), dependency vulnerability scan (npm audit+Snyk), secret detection (gitleaks), license compliance, OWASP Top 10 mapping, SOC 2 compliance mapping
4. **Agent Activity Log**: Timestamped table of every agent action (tool, target, result, tokens, reviewer) -- addresses government AI accountability concerns
5. **Acceptance Test Results**: Per-user-story criterion breakdown with automated (Playwright) and manual verification, evidence links, remediation plan for partials

### Logging Architecture

Structured JSON event schema with 17 event types (TaskAssigned through HumanOverride). Each event includes agent_id, session_id, business_line, project, tool, tokens (input/output/cache_read/cache_creation), cost_estimate_usd, and context (task_id, sprint, story_id).

Four-layer storage: JSONL files (7 days hot, ~1.2 MB/agent/day), SQLite (90 days, indexed, with pre-built aggregation views for daily agent and fleet metrics), Notion (permanent, aggregated, client-visible), gzip archive (1 year, ~20 MB/month compressed at 10 agents). Government compliance requires minimum 1 year retention for all logs, permanent for security artifacts.

### Cost Attribution

**Claude Max ($200/mo)**: Time-weighted (cost per agent-hour = $200 / total agent-hours) or token-weighted (cost per token = $200 / total tokens) allocation across clients.

**API usage**: LiteLLM Proxy (per-request tagging), Helicone Proxy (300+ model pricing DB), Claude native OTEL, Anthropic Usage API, or ccusage CLI.

---

## Actionable Insights

- **Deploy Phase 1 immediately**: Claude Code hooks + ccusage requires zero infrastructure and provides per-session cost visibility today
- **The client-facing trust dashboard is a sales tool**: Share a read-only Notion page with each government client, updated automatically after each sprint -- this differentiates from competitors who cannot provide transparency
- **Sprint reports should be generated automatically from CI pipeline output**: The templates are designed to pull data from ESLint, TypeScript, Semgrep, Snyk, Playwright, and git log
- **SQLite is the queryable middle layer**: Six pre-built SQL queries for post-mortem analysis (incident timeline, token consumption ranking, error rate by tool, cost per task by business line, token waste calculation, agent idle time)
- **Log retention policy must be documented in client contracts**: Government contracts often require 1-3 year retention; default to 1 year for logs, permanent for security artifacts
- **The "Human Oversight Statement" in sprint reports is critical for government**: Explicitly state 100% review rate with reviewer name

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](master-blueprint.md) | Observability is the third pillar of the orchestrator architecture after coordination and execution |
| [reference/deterministic-harness-blueprint.md](deterministic-harness-blueprint.md) | Health monitoring scripts produce events consumed by the observability pipeline |
| [reference/german-government-compliance.md](german-government-compliance.md) | Trust artifacts designed specifically for government delivery compliance requirements |
| [reference/notion-as-agent-backend.md](notion-as-agent-backend.md) | Agent Activity Log and Daily Metrics databases in the Notion schema receive observability data |
| [reference/scaling-economics.md](scaling-economics.md) | Cost attribution models connect to the business economics metrics tier |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | IndyDevDan's hooks+Bun+SQLite+Vue dashboard is the recommended Phase 1 real-time monitoring solution |
