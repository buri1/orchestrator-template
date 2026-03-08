# Agent Automation & Deployment Reference

> **Comprehensive guide to headless agent execution, event-driven orchestration with Trigger.dev, scheduling strategies, sandboxing with E2B/Daytona, VPS+tmux patterns, failure handling, and cost management for autonomous coding agents.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_pi-automation-deployment-guide.md |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

The practical question for coding agent automation in 2026 is no longer "can agents work autonomously?" but "how do I trigger them, where do I run them, and how do I manage cost and failure?" This document covers the full automation stack: execution modes (CLI headless, SDK/programmatic, Docker container), event-driven orchestration (Trigger.dev with checkpoint-resume and fan-out), scheduling (cron, GitHub Actions, specialized schedulers), deployment targets (VPS, serverless, Kubernetes, sandboxes), workflow frameworks (Temporal, Inngest, n8n), sandbox environments (E2B Firecracker microVMs, Daytona composable computers), the battle-tested VPS+tmux pattern, failure handling (exponential backoff, circuit breaker, multi-model fallback), and cost management strategies.

Gartner predicts 40% of enterprise applications will feature task-specific AI agents by end of 2026, up from <5% in 2025. The tools have matured: Trigger.dev pivoted to fully-managed AI agent workflows, E2B partnered with Docker for sandbox-as-a-service, and Daytona pivoted from dev environments to AI code execution infrastructure. The reference architectures range from solo developer (GitHub Actions + $0 infrastructure) through startup scale (Trigger.dev Cloud + $100-500/month) to enterprise (VPS cluster + Temporal + sandboxes + $500-5000/month).

For the L-Thread Orchestrator specifically, the existing `_bmad/orchestrator-tmux-state.json` state file and `orchestrator-handoff.sh` script are already the building blocks for automated deployment -- they need a triggering layer (cron, webhook, or Trigger.dev) on top.

---

## Key Findings

### Execution Modes

**CLI Headless (`--print` / `-p`):** Most fundamental pattern. Run non-interactively from any script, cron job, or CI pipeline with structured output formats (text, json, stream-json) and turn limits for cost control. Works with any deployment target.

**SDK/Programmatic Mode:** Full programmatic control via subprocess management. The Claude Agent SDK spawns a CLI process, providing inline subagent definition, lifecycle hooks, cost tracking, and permission mode control. Pi equivalent uses `createAgentSession()` for in-process embedding with zero serialization overhead.

**Docker Container Mode:** Agent in isolated container with full permissions. No official images exist yet; community projects (claudebox, klaude) provide production-ready containers. Foundational for all cloud deployment strategies.

### Trigger.dev: Primary Orchestration Platform

Trigger.dev is the strongest candidate for orchestrating agent runs at scale. Key features for agent automation:

| Feature | Agent Relevance |
|---------|----------------|
| No timeouts | Critical for long agent sessions (unlike Lambda 15 min, Vercel 60s) |
| Checkpoint-Resume | Handles agent interruptions gracefully |
| Fan-Out Pattern | Orchestrator spawns N child tasks in parallel, waits, aggregates |
| Retries with backoff | Automatic retry on failure |
| Queues | Rate-limit concurrent agents for cost control |
| Full observability | Logs, traces, metrics per agent run |
| Cron scheduling | Native cron for scheduled tasks |

Trigger.dev added "Agent Skills" standard in 2026 for Claude Code, Cursor, and Windsurf. Deployment options include Trigger.dev Cloud (managed) or self-hosted with Docker.

### Scheduling Approaches

| Approach | Best For | Limitations |
|----------|----------|-------------|
| System cron | Simple recurring tasks | No retry, no observability, no queues |
| GitHub Actions | Repo-scoped work | Container-based, per-minute cost, 6-hour max |
| claude-code-scheduler | Natural language scheduling | macOS-focused |
| claude-tasks | TUI scheduler with webhooks | Limited ecosystem |
| Trigger.dev | Production orchestration | Requires setup |

### Deployment Targets

| Target | Startup | Cost | Isolation | Best For |
|--------|---------|------|-----------|----------|
| Local machine | Instant | Free | None | Development |
| VPS + tmux | Seconds | $5-50/mo | OS-level | Always-on agents |
| Docker (self-hosted) | Seconds | $10-100/mo | Container | CI/CD, scheduled |
| E2B Sandbox | <200ms | Per-use | Firecracker VM | Untrusted code |
| Daytona Sandbox | <60ms | Per-use | VM-level | Long-running code exec |
| GitHub Actions | 30-60s | Per-minute | Container | Repo automation |
| Trigger.dev Cloud | Seconds | Per-use | Container | Event-driven |
| Kubernetes | Variable | Cluster | Pod-level | Enterprise scale |

Cloud functions face hard timeout limits (Lambda 15 min, Cloud Run 60 min). Workarounds: Cloud Run Jobs (no HTTP timeout), Trigger.dev checkpoint-resume.

### Sandbox Environments

**E2B:** Firecracker microVMs with <200ms startup, hardware-level isolation, Docker MCP Catalog (200+ tools). Available as Cloud, BYOC, or self-hosted with Python/TypeScript SDKs.

**Daytona:** "Composable computers for AI agents" with <60ms startup, emphasis on statefulness (sandboxes persist across runs for iterative workflows). Pivoted from dev environments to AI code execution in Feb 2025.

**When to sandbox:** Mandatory for untrusted/generated code execution. Recommended when agent has shell access or modifies files and runs tests. Optional for read-only analysis.

### VPS + tmux: The Battle-Tested Pattern

Architecture: VPS (4-8 CPU, 16-32GB RAM) running tmux sessions with orchestrator + agent workers + cron scheduler + webhook server + monitoring. The "Ralph Loop" pattern re-feeds agents with updated context until success criteria are met. The "Handoff Pattern" cycles workers onto new shifts, preserving state -- exactly what L-Thread's `orchestrator-handoff.sh` does.

Recommended VPS providers: Hetzner (~$5/mo, best value, EU), DigitalOcean (~$12/mo), Linode (~$12/mo), AWS Lightsail (~$10/mo).

### Workflow Orchestration Frameworks

| Framework | Language | Agent Fit | When to Use |
|-----------|----------|-----------|-------------|
| Trigger.dev | TypeScript | Purpose-built | Primary choice for agent orchestration |
| Temporal.io | Multi-lang | Enterprise durability | Mission-critical, multi-step workflows at scale |
| Inngest | TypeScript | Event-driven | Webhook-triggered runs, lower infrastructure overhead |
| Prefect | Python | ML/data pipelines | Python-native pipelines with agent steps |
| n8n | TypeScript | Visual workflows | Visual automation building, 1,236+ integrations |

### Failure Handling

**Error classification:** Rate limit (429, backoff), server error (500/502/503, retry), overloaded (529, switch models), auth failure (401/403, do not retry), context overflow (reduce prompt), agent stuck (kill + restart).

**Exponential backoff with jitter** prevents thundering herd. **Circuit breaker pattern** (CLOSED -> OPEN -> HALF_OPEN) prevents hammering failing APIs. **Multi-model fallback** (Opus -> Sonnet -> GPT-5-mini) with minimum-success threshold for partial results.

### Cost Management

| Model | Input/1M | Output/1M | Typical Session |
|-------|----------|-----------|-----------------|
| Claude Opus 4.6 | $15 | $75 | $5-25 per run |
| Claude Sonnet 4.6 | $3 | $15 | $1-5 per run |

Average: ~$6/developer/day, 90% below $12/day.

**Critical controls:** Use Sonnet for routine tasks (5x cheaper than Opus). Set `--max-turns` on every automated run (single most important cost control). Implement per-task spend limits. Queue concurrent runs (don't run 10 agents simultaneously). Clean up idle agents in Agent Teams (continue consuming tokens). Agent Teams use ~4x more tokens than single-agent runs.

### Reference Architectures

**Solo/Small Team:** GitHub Actions + cron -> claude-code-action -> Slack. Cost: ~$30-100/mo API, $0 infrastructure.

**Startup:** Trigger.dev Cloud -> scheduled + webhook tasks -> fan-out -> database + Slack. Cost: ~$100-500/mo API + Trigger.dev.

**Enterprise:** VPS cluster -> Temporal.io -> E2B/Daytona sandboxes -> Kubernetes -> Grafana monitoring -> circuit breakers -> cost tracking. Cost: $500-5000/mo.

**L-Thread Pattern:** Cron/webhook/Trigger.dev -> spawn orchestrator session (tmux) -> read task backlog -> spawn agent workers (Conduit or Teams) -> monitor -> handle roadblocks -> report results -> session persists via tmux.

---

## Actionable Insights

1. **Tier 1 (Day 1):** Start with cron + headless CLI with `--max-turns` and structured output. Add GitHub Actions for repo-scoped work. Zero infrastructure cost.

2. **Tier 2 (Week 2-4):** Move cron scripts to Trigger.dev for retries, queues, observability, and webhook triggers. Wrap agent setup in Dockerfile for portability.

3. **Tier 3 (Month 2+):** Deploy to Hetzner VPS with tmux persistence, mosh + Tailscale for remote access. Add E2B/Daytona sandboxes for untrusted execution. Implement cost monitoring and circuit breakers.

4. **Always set `--max-turns`** on automated runs. A runaway agent without turn limits can consume hundreds of dollars.

5. **Use Sonnet for routine tasks, Opus for complex work.** This single routing decision reduces cost by ~5x for the majority of agent runs.

6. **L-Thread already has the building blocks:** `orchestrator-tmux-state.json` + `orchestrator-handoff.sh` handle persistence and handoff. They need a triggering layer (cron/webhook/Trigger.dev) on top.

7. **Implement circuit breaker pattern** for production deployments. Track failure counts, open circuit when threshold exceeded, test recovery with half-open state.

8. **Queue concurrent agent runs** rather than launching all simultaneously. Use Trigger.dev queues or a simple semaphore to limit concurrency and control cost.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Primary agent harness for deployment |
| [agent-harnesses/pi-subagents.md](../agent-harnesses/pi-subagents.md) | Sub-agent extension for fan-out patterns |
| [agent-harnesses/oh-my-pi.md](../agent-harnesses/oh-my-pi.md) | Alternative harness with built-in deployment features |
| [agent-harnesses/pi-messenger.md](../agent-harnesses/pi-messenger.md) | Inter-agent communication in deployed environments |
| [reference/pi-agent-architecture-reference.md](pi-agent-architecture-reference.md) | Architecture underpinning deployment decisions |
| [reference/pi-sdk-internals.md](pi-sdk-internals.md) | SDK mode as primary headless execution interface |
| [reference/pi-mcp-adapter.md](pi-mcp-adapter.md) | MCP lifecycle management in deployed agents |
| [reference/lthread-pi-migration-guide.md](lthread-pi-migration-guide.md) | Migration context for deployment strategy changes |
| [reference/scaling-economics.md](scaling-economics.md) | Cost modeling for agent deployment at scale |
