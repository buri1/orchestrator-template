# Observability, Trust Metrics, and KPIs

> **Comprehensive framework for monitoring multi-agent coding fleets: IndyDevDan hook-based observability, steipete's three-tool stack, SRE adaptations (Golden Signals, RED, USE), DORA+SPACE+Judgment SLOs, and the observability maturity model from manual (1-3 agents) to autonomous (50+).**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_PHASE2_research-observability-trust-kpis.md |
| Research Phase | Phase 2 |
| Last Updated | 2026-03-08 |

---

## Summary

Observability in multi-agent AI coding systems is the prerequisite for trust, and trust is the prerequisite for scale. The central finding is that the practitioners who achieve the highest autonomous output -- Elvis Sun's 94 commits/day, Stripe's 1,300+ PRs/week -- all invested in observability infrastructure before scaling agent count. The specific metrics fall into three tiers: operational health (is the agent alive and making progress?), output quality (is the work correct and mergeable?), and economic efficiency (what does each outcome cost?).

IndyDevDan's `claude-code-hooks-multi-agent-observability` provides the reference architecture: Claude Agents -> Hook Scripts -> HTTP POST -> Bun Server -> SQLite -> WebSocket -> Vue Client, tracking every tool call, task handoff, and lifecycle event in real-time swim lanes. steipete's three-tool stack (tmuxwatch + CodexBar + VibeTunnel) demonstrates that observability can be layered as separate concerns. The KPI framework adapts DORA metrics (now five, with Rework Rate), SPACE dimensions, and introduces "Judgment SLOs" -- error budgets applied to agent decision quality rather than just uptime. The 2025 DORA Report's central paradox -- AI boosts individual throughput 21% but organizational delivery stays flat -- reinforces that metrics without observability are meaningless noise.

At scale (50+ agents), SQLite's single-writer lock becomes a bottleneck (WAL mode helps reads but not concurrent writes), Langfuse v3 on ClickHouse handles 100,000+ events/sec, and dashboard UX must shift from individual trace inspection to aggregate heatmaps and fleet-level health indicators.

---

## Key Findings

### Practitioner Observability Systems

**IndyDevDan: claude-code-hooks-multi-agent-observability**
- Architecture: Claude Agents -> Hook Scripts -> HTTP POST -> Bun Server -> SQLite (WAL) -> WebSocket -> Vue Client
- Hook events: PreToolUse, PostToolUse, PostToolUseFailure, UserPromptSubmit, Stop, SubagentStop, Notification, ConfigChange
- Features: Agent swim lanes, task lifecycle tracking (TaskCreate/Update/SendMessage), live pulse chart, event filtering, chat transcript replay
- Zero SDK integration -- uses Claude Code's native hook system
- Limitation: SQLite single-writer bottleneck at 50+ concurrent agents

**steipete: Three-Tool Stack**
- **tmuxwatch**: Charmbracelet TUI monitoring all tmux sessions/windows/panes. Polls hierarchy, shows capture-pane output. `--dump` flag outputs JSON for automation. Answers: are my agents alive?
- **CodexBar**: macOS menu bar showing Claude Code and Codex usage quotas. 5-hour session limit + weekly usage. Answers: am I about to hit a rate limit?
- **VibeTunnel**: Browser-based terminal controller (Swift + Bun + xterm.js, no SSH). Answers: can I monitor agents remotely?

**Elvis Sun: Zoe Orchestrator**
- Automated response, not dashboards: Sentry scan -> spawn bug-fix agents, meeting notes -> feature agents, git logs -> changelog updates
- Notification only on "definition of done" (CI green + multi-model review)
- 94 commits/day (peak), 50 average, 7 PRs in 30 minutes

### SRE Frameworks Adapted for Agent Fleets

**Four Golden Signals (Google SRE):**
| Signal | Agent Adaptation | Alert Threshold |
|--------|-----------------|-----------------|
| Latency | Task assignment to PR submission time | P95 > 2x historical median |
| Traffic | Active agents, tasks in flight, token burn rate | Queue depth > 3x agent count |
| Errors | Crashes, failed tool calls, rejected PRs | Error rate > 15% over 30 min |
| Saturation | CPU/RAM, API quota proximity, context window fill | RAM > 85%, API quota < 20%, context > 90% |

**Judgment SLOs (Novel Concept):**
- Traditional SLOs measure uptime. Judgment SLOs measure decision quality.
- Define reversal rate target: "human overrides agent decisions < 5% over 30 days"
- Every override counts against error budget
- When budget runs low: gate deployments, increase review rate, reduce autonomy scope, fall back to conservative models
- No ground truth needed -- human overrides are the signal
- Generates standard Prometheus alerting rules with burn-rate alerts

### KPI Framework

**DORA Metrics (2025 Five-Metric Framework):**

| Metric | Agent-Adapted Definition | Elite Benchmark |
|--------|------------------------|-----------------|
| Deployment Frequency | Agent-generated code deployment rate | Multiple times per day |
| Lead Time for Changes | Task assignment to merged PR time | < 1 hour |
| Failed Deployment Recovery | Time to fix agent-introduced regression | < 1 hour |
| Change Failure Rate | % of agent PRs causing incidents | < 5% |
| Rework Rate (NEW) | % of agent code requiring human correction post-merge | < 10% |

**Critical DORA 2025 finding**: AI boosts individual output (21% more tasks, 98% more PRs) but organizational delivery stays flat. Seven foundational capabilities must be in place for AI to amplify rather than destabilize. Rework Rate is "the single most important metric to baseline right now" for organizations using AI coding tools.

**Agent-Specific Metrics:**
- Agent Utilization: % time actively working vs idle (target >80%)
- AI Code Confidence: % passing review without changes (target >70%)
- Cost per PR: Total token cost / PRs merged
- Token waste rate: Tokens on failed tasks / total tokens
- Human reversal rate: Overridden decisions / total decisions (target <5%)

### Observability at Scale (50+ Agents)

**Tool Comparison:**

| Tool | 50-Agent Ready | Key Strength |
|------|---------------|-------------|
| Langfuse v3 | Yes (ClickHouse) | 100K+ events/sec, 10ms P50, self-hosted |
| AgentOps | Yes (cloud) | Session replay, recursive thought detection |
| Arize Phoenix | Yes (OTEL) | Drift detection, clustering |
| IndyDevDan Hooks | Partial | Zero SDK, native Claude Code |
| steipete tmuxwatch | Partial | Zero instrumentation needed |
| OpenTelemetry | Yes | Vendor-neutral, massive ecosystem |

**SQLite at 50+ agents**: No, not without mitigation. Single-writer lock. WAL mode helps reads but not concurrent writes. At 50 concurrent writers: ~5s busy timeout needed. Mitigation: single writer process, per-agent SQLite, or migrate to ClickHouse.

**Dashboard UX at scale**: Individual trace inspection breaks at ~10 agents. At 50+, shift to fleet health heatmap, aggregate metrics, exception-driven drill-down, hierarchical tree view, and cost waterfall. Default view: fleet-level green/yellow/red.

### Three-Tier Monitoring Framework

| Tier | Focus | Example Signals |
|------|-------|----------------|
| 1. Heartbeat | Is it alive? | Process alive (30s), progress (2min), API connectivity (5min), rate limit status (5min) |
| 2. Quality | Is the work good? | Tool error rate (<15%), PR rejection (<10%), lint pass rate (>90%), rework rate (<15%), reversal rate (<5%) |
| 3. Economics | Is it efficient? | Cost per PR (<2x rolling avg), token waste (<30%), idle time (<15min avg), context utilization (<90%), ROI (>3x) |

### Observability Maturity Model

| Stage | Agents | Requirement | Tools |
|-------|--------|-------------|-------|
| 1. Manual | 1-3 | Terminal watching | tmuxwatch, manual capture-pane |
| 2. Instrumented | 3-10 | Hook-based tracking | IndyDevDan hooks + SQLite + Vue |
| 3. Measured | 10-25 | SLOs, error budgets, alerting | Langfuse/Arize Phoenix, Prometheus |
| 4. Optimized | 25-50 | Fleet aggregates, judgment SLOs | Langfuse v3 + ClickHouse, OTEL |
| 5. Autonomous | 50+ | Self-healing, anomaly-driven | Full OTEL stack, ML anomaly detection |

---

## Actionable Insights

1. **Install IndyDevDan's hook-based observability now**: Zero SDK integration, works with any Claude Code instance. Provides swim lanes, event filtering, and transcript replay. The foundation for all further observability.

2. **Start with Judgment SLOs on two metrics**: Human reversal rate (<5%) and PR rejection rate (<10%). These require no infrastructure -- just track overrides in a spreadsheet. Error budget alerting comes later.

3. **Baseline Rework Rate immediately**: DORA 2025 calls this the single most important metric for AI-assisted development. Track: unplanned fix commits / total commits, rolling 7 days.

4. **Layer observability by concern**: Process health (tmuxwatch) + quota awareness (CodexBar/API headers) + event tracking (hooks) + state management (JSON files) + notification (Telegram/terminal). Each layer is independent.

5. **Plan for SQLite migration**: If scaling beyond 10 agents, either route all writes through single writer process (Bun server already does this) or plan migration to ClickHouse/Langfuse v3.

6. **Adopt aggregate-first dashboards early**: Build the habit of fleet-level thinking before you need it. Color-coded agent health grid, P50/P95 latency, error budget burn rate as default view.

7. **Cost tracking is non-negotiable**: Token consumption has 10x variance across runs for equivalent tasks (OpenReview). Without cost-per-outcome tracking, you cannot optimize or budget.

8. **Apply the DORA 2025 paradox**: Individual agent productivity gains do not automatically translate to organizational improvements. Measure organizational delivery (deployment frequency, change failure rate) alongside agent throughput.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Cost-per-outcome metrics and ROI calculations depend on observability data |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | Creator of hook-based observability system; "Year of Trust 2026" thesis; Benchy benchmarking |
| [practitioners/steipete.md](../practitioners/steipete.md) | tmuxwatch, CodexBar, VibeTunnel -- the three-tool observability stack |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Automated response monitoring (not dashboards); Zoe's cron-based health checks |
| [reference/infrastructure-breaking-points.md](../reference/infrastructure-breaking-points.md) | Observability dashboards required before scaling past 10 agents |
| [reference/autonomy-horizon-self-healing.md](../reference/autonomy-horizon-self-healing.md) | Agent drift detection requires the ASI metrics framework documented here |
| [reference/pricing-trust-architectures.md](../reference/pricing-trust-architectures.md) | Client-facing observability artifacts as trust infrastructure |
