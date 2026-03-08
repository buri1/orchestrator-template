# Deterministic Harness Blueprint

> **Complete implementation blueprints for the 70% deterministic layer of the L-Thread Orchestrator: shell script harnesses, state machine routing, scheduling, worktree management, and health monitoring.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_research-deterministic-harness-design.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

This document provides the concrete, implementable specifications for the deterministic infrastructure layer that underpins the L-Thread Orchestrator. Following the 70/30 deterministic/LLM boundary established in Phase 1 analysis, it delivers production-ready shell scripts, JSON configuration schemas, and macOS LaunchAgent schedules that compose the "Elvis Sun pattern" of 100% deterministic agent supervision into a full operational system.

The architecture centers on five pillars: (1) `check-agents.sh`, a health check script that probes tmux sessions, inspects PR/CI status, and auto-respawns crashed agents with circuit breaker protection; (2) a pure-lookup task router (`task-router.json` + `route-task.sh`) that applies the DeepMind 45% rule to decide single-agent vs multi-agent vs human routing without any LLM involvement; (3) a macOS LaunchAgent schedule (health every 10 min, morning scan at 07:30, cleanup at 23:00, weekly maintenance Monday 06:00); (4) git worktree management scripts for agent isolation; and (5) a multi-channel notification dispatcher (Telegram for critical, macOS notification for warnings, log-only for info).

The design draws from seven evidence sources including the Praetorian MANIFEST pattern, Stripe's deterministic blueprints, StateFlow FSM paper (EMNLP 2024: 13-28% higher success rates vs ReAct at 3-5x less cost), and the existing Finance-agent scheduler pattern already proven in production.

---

## Key Findings

### check-agents.sh: The Core Health Loop

The central script implements a 6-step decision loop per tmux session: (1) check if session is alive, (2) check if claude is running in the session, (3) detect stale sessions via timestamp comparison against a configurable threshold (default 60 min), (4) check git/PR/CI status for the project, (5) decide action (respawn / restart-for-CI-fix / escalate / notify-stale / idle-ok / healthy), (6) execute action and update state. Exit codes: 0=healthy, 1=recovery performed, 2=unrecoverable. A circuit breaker extension prevents respawn thrashing with CLOSED/OPEN/HALF_OPEN states and 30-minute cooldown periods.

### State Machine Task Routing

The task router is a pure JSON lookup table with zero LLM involvement. Eight task types (lint-fix, bug-fix, feature-small, feature-large, e2e-test, ci-fix, refactor, research, documentation) map to agent configurations specifying model tier, retry count, timeout, tool set, context tier, and estimated token budget. The DeepMind 45% rule is applied: if historical single-agent success rate exceeds 45%, route to single agent; below 30%, recommend multi-agent; below 15%, require human. Five business lines each have daily token budgets and priority boosts.

### LaunchAgent Scheduling

Five scheduled jobs use macOS launchd (not cron) because launchd handles sleep/wake correctly, logs failures, and survives reboots. The morning scan script checks GitHub for failing CI, stale PRs (no updates in 3+ days), and auto-queues tasks. The daily cleanup prunes orphaned worktrees, resets respawn counters, archives completed tasks, and checks disk space. The scheduler manager script (`scheduler/manage.sh`) provides install/uninstall/status/test commands following the proven Finance-agent pattern.

### Git Worktree Management

A comprehensive worktree script handles create (with automatic base branch fetch, env file copying, and dependency installation), cleanup (with merge verification before deletion), list (across all projects), prune-all, and status commands. Worktrees are stored under a shared `.worktrees/` directory with `{project}--{branch}` naming convention.

### Notification Dispatcher

Urgency-based routing across three channels: critical alerts trigger both Telegram bot messages and macOS notifications with Basso sound; warnings use macOS Ping sound; info messages use Glass sound and log-only. All notifications are logged to `_bmad/logs/notifications.log`.

---

## Actionable Insights

- **Immediate implementation**: `check-agents.sh` + LaunchAgent health check can be deployed today with the existing tmux-based orchestrator, providing crash recovery without any architecture changes
- **Circuit breaker is essential**: Without it, a fundamentally broken agent will thrash through respawn attempts every 10 minutes, consuming resources and generating noise
- **The task router replaces all LLM-based routing decisions**: Every task type maps to a deterministic configuration; the orchestrator reads the config, not interprets intent
- **Token budget enforcement via the router prevents runaway costs**: Each business line has a daily ceiling; the dispatch script checks remaining budget before assignment
- **Worktree isolation eliminates the #1 source of agent conflicts**: Each agent gets its own filesystem, preventing the "last write wins" problem entirely
- **The morning scan creates a self-feeding task pipeline**: GitHub state automatically becomes queued tasks, reducing the orchestrator's LLM work to pure coordination

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](master-blueprint.md) | Parent architecture; this document implements the deterministic 70% layer specified there |
| [reference/pi-orchestrator-blueprint.md](pi-orchestrator-blueprint.md) | Pi Agent extensions that invoke these shell scripts as the infrastructure layer |
| [reference/observability-trust-infrastructure.md](observability-trust-infrastructure.md) | Observability stack consumes events produced by these scripts |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Elvis Sun's check-agents.sh pattern is the direct inspiration for the health loop |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Pi Agent's RPC/SDK modes interface with the dispatch and routing scripts |
| [reference/scaling-economics.md](scaling-economics.md) | Token budgets and cost tracking originate from the task router configuration |
