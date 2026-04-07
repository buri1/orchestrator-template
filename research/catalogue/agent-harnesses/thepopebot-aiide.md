# ThePope Bot (AIIDE)

> **An autonomous AI agent framework that runs 24/7 via Docker containers and GitHub Actions, supporting both Claude Code and Pi Agent backends with web chat, Telegram, cron scheduling, cluster-based multi-agent teams, and a skill system.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [stephengpope/thepopebot](https://github.com/stephengpope/thepopebot) |
| GitHub Stars | 1,149 (as of 2026-03-12) |
| Publisher | Stephen G. Pope (solo — entrepreneur, content automation, Skool investor) |
| License | MIT |
| Tech Stack | JavaScript (95%), Node.js 18+, Next.js, Drizzle ORM, Docker + Docker Compose, GitHub Actions, xterm.js, ttyd |
| Maturity | 🟢 Production (v1.2.73, 82 releases, 775 commits, active daily) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves a different problem than L-Thread: it is a cloud-first autonomous agent deployment platform (GitHub Actions as execution substrate), not a local-first orchestrator. However, the dual-backend pattern (Claude Code + Pi), cluster architecture, and skill system have transferable ideas for our Day 60+ multi-harness migration. |
| **Novelty** | 7/10 | The "GitHub-as-runtime" pattern (branch creation triggers Docker agent via Actions) is genuinely novel. Cluster system with shared folders, webhook/cron/file-watch triggers, and template variables is the most complete open-source multi-agent deployment we have catalogued. Code Workspaces (browser-based Claude Code sessions via ttyd+xterm.js) is a unique approach. |
| **Actionable** | 5/10 | The dual-backend switching (`AGENT_BACKEND=claude-code|pi`) validates our harness-agnostic architecture. Skill system (SKILL.md + bash scripts) is directly compatible with Pi skills ecosystem. Cluster prompt architecture (system prompt + role prompt with template variables) is stealable for our agent definitions. But the GitHub Actions substrate is orthogonal to our tmux/local-first approach. |

---

## Overview

ThePope Bot is a full-stack autonomous agent platform built around a two-layer architecture: a **Next.js Event Handler** that manages jobs, chat, and scheduling, and **Docker Agent containers** that execute coding tasks using either Claude Code CLI or Pi Agent. The key architectural insight is using GitHub as the coordination backbone -- job creation happens by pushing a `job/*` branch, GitHub Actions detects it and spins up a Docker container, the agent works autonomously, commits results, opens a PR, and an auto-merge workflow handles the rest.

The system supports three execution modes: (1) **Jobs** -- one-off tasks triggered via web chat, Telegram, webhooks, or cron that create PRs, (2) **Code Workspaces** -- interactive browser-based Claude Code sessions with ttyd terminal streaming, and (3) **Clusters** -- multi-role agent teams where Docker containers share workspace directories and coordinate via shared folders, webhooks, and file-watch triggers. The cluster system is the most architecturally interesting component for our purposes, as it implements a form of multi-agent orchestration without requiring a dedicated orchestrator process.

The platform is notably harness-agnostic -- switching between Claude Code and Pi Agent is a single environment variable (`AGENT_BACKEND`). Both backends share the same skill activation directory (`skills/active/`), meaning skills work across harnesses without modification. This validates the "thin shared layer" pattern from our Master Blueprint and demonstrates that Claude Code and Pi Agent can coexist in the same deployment with minimal friction.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GITHUB (Coordination Backbone)                  │
│  job/* branches → Actions triggers → PRs → auto-merge → main       │
└────────┬───────────────────────────────┬────────────────────────────┘
         │                               │
         ▼                               ▼
┌─────────────────────┐    ┌──────────────────────────────────────┐
│   Event Handler     │    │        Docker Agents                  │
│   (Next.js)         │    │                                       │
│                     │    │  ┌─────────────┐  ┌────────────────┐ │
│  - Web Chat UI      │    │  │ Claude Code │  │   Pi Agent     │ │
│  - Telegram Bot     │    │  │   Job       │  │    Job         │ │
│  - Cron Scheduler   │    │  └─────────────┘  └────────────────┘ │
│  - Webhook Handler  │    │  ┌─────────────┐  ┌────────────────┐ │
│  - Cluster Manager  │    │  │ CC Headless │  │ CC Workspace   │ │
│  - Code Workspace   │    │  │   (no PR)   │  │ (interactive)  │ │
│  - API Keys + Auth  │    │  └─────────────┘  └────────────────┘ │
│                     │    │  ┌──────────────────────────────────┐ │
│  Drizzle ORM DB     │    │  │  Cluster Workers (per-role)      │ │
│  Session Logs       │    │  │  Shared folders + webhooks       │ │
│                     │    │  └──────────────────────────────────┘ │
└─────────────────────┘    └──────────────────────────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │    Skills Layer      │
                            │  skills/active/      │
                            │  (SKILL.md + bash)   │
                            │  Shared across both  │
                            │  backends             │
                            └──────────────────────┘
```

### Key Components

- **Event Handler** (`app/api/[...thepopebot]/`): Next.js catch-all route providing REST API, Telegram webhooks, GitHub webhook receiver, chat streaming, cluster management
- **Docker Containers**: 6 container types -- pi-job, claude-code-job, claude-code-headless, claude-code-workspace, claude-code-cluster-worker, event-handler
- **GitHub Actions Workflows**: 6 workflows (`run-job.yml`, `auto-merge.yml`, `rebuild-event-handler.yml`, `notify-pr-complete.yml`, `notify-job-failed.yml`, `upgrade-event-handler.yml`)
- **Config Layer** (`config/`): SOUL.md (agent identity), JOB_PLANNING.md, JOB_AGENT.md, CLUSTER_SYSTEM_PROMPT.md, CLUSTER_ROLE_PROMPT.md, CRONS.json, TRIGGERS.json
- **Skill System** (`skills/active/`): SKILL.md frontmatter + bash/Node.js scripts; progressive disclosure (name+description at startup, full instructions on-demand)
- **Security**: API key auth (SHA-256 hashed), env-sanitizer extension filters `AGENT_*` secrets from LLM bash, auto-merge restricted to `ALLOWED_PATHS`, WebSocket session validation

### Data Flow (Job Execution)

1. Event handler receives task (chat/webhook/cron/Telegram)
2. Creates `job/{uuid}` branch via GitHub API
3. GitHub Actions triggers `run-job.yml`
4. Docker container: clones branch, runs agent (Claude Code or Pi) with SOUL.md + job.md
5. Agent works, commits changes, creates PR
6. `auto-merge.yml` checks ALLOWED_PATHS policy, squash-merges (or leaves for human review)
7. `notify-pr-complete.yml` sends completion notification back to event handler

### Cluster Architecture (Multi-Agent)

- **Roles**: Named agent types (e.g., "Researcher", "Writer") with per-role prompts, triggers, and concurrency limits
- **Shared Folders**: Cross-role data exchange via `shared/` directories
- **Triggers**: Manual, Webhook (POST with payload), Cron (node-cron), File Watch (chokidar with 5s debounce)
- **Template Variables**: `{{CLUSTER_HOME}}`, `{{SELF_ROLE_NAME}}`, `{{SELF_WORKER_ID}}`, `{{WORKSPACE}}`, `{{WEBHOOK_PAYLOAD}}` -- resolved at container launch
- **Concurrency Gate**: `canRunRole()` enforces maxConcurrency across all trigger types
- **Logs**: Per-run directories with system-prompt.md, user-prompt.md, meta.json, trigger.json, stdout.jsonl, stderr.txt

---

## Publisher Background

**Stephen G. Pope** is an entrepreneur, software developer, and content creator focused on AI automation. He runs the "AI Architects" community on Skool.com (a platform he has invested in). He has 407 GitHub followers and 6 public repositories. His primary focus appears to be building and teaching autonomous AI agent deployment rather than traditional developer tooling.

The project has significant traction for a solo developer: 1,149 stars, 518 forks (high fork ratio suggests active community building), 82 releases in ~6 weeks (extremely rapid iteration), and a structured community via Skool for premium support. The high fork count relative to stars suggests a "build-along" community where users fork and customize rather than just star.

The project has a notable relationship with **Mario Zechner** (badlogic), the creator of Pi Agent -- thepopebot's skill format is directly compatible with Pi's `pi-skills` repository, and the SKILL.md format is explicitly shared between both projects. This cross-pollination validates the Pi ecosystem's interoperability thesis.

---

## What's Valuable for Us

### 1. Dual-Backend Pattern (Steal This)
The `AGENT_BACKEND` environment variable that switches between Claude Code and Pi Agent is the simplest harness-agnostic implementation we have catalogued. Our Day 60+ migration plan needs exactly this: a configuration-level switch, not an architectural rewrite. Key files: `docker/claude-code-job/entrypoint.sh` vs `docker/pi-coding-agent-job/entrypoint.sh`.

### 2. Cluster Prompt Architecture (Adapt This)
The two-prompt system (system prompt for shared context + user prompt for task-specific instructions) with template variable resolution (`{{CLUSTER_HOME}}`, `{{SELF_ROLE_NAME}}`, `{{WORKSPACE}}`) is a clean pattern for our agent definitions. We already use `CLAUDE.md` for shared context and agent-specific `.md` files -- the template variable system could formalize our dynamic context injection.

### 3. Skill System Portability (Reference This)
Skills work across both Claude Code and Pi because they are just SKILL.md + bash scripts. Progressive disclosure (load name+description at startup, full instructions on-demand) reduces token waste. The skill activation via symlinks (`skills/active/`) is elegant. Cross-references: [OpenAI Skills](../agent-protocols/openai-skills.md), [SkillKit](./skillkit.md), [PM Skills Marketplace](../agent-protocols/pm-skills.md).

### 4. GitHub-as-Runtime Pattern (Study This)
Using git branches as job queues and GitHub Actions as the execution substrate is a zero-infrastructure orchestration pattern. Every action produces an auditable commit trail. Auto-merge with path restrictions is a good safety model. However, this trades latency for simplicity -- GitHub Actions cold-start is 30-60s vs our tmux instant-spawn.

### 5. Claude Code Comparison Document
The `CLAUDE_CODE_VS_PI.md` comparison, while brief, confirms: (a) Claude Code = Anthropic-only models, Pi = 324+ models; (b) Claude Code = subscription billing, Pi = API credits; (c) both can coexist in the same project. This validates our Phase 3 migration architecture where we keep Claude Code for revenue-generating work while evaluating Pi for cost-optimized batch tasks.

---

## What's NOT Relevant

### Cloud-First Execution Model
ThePope Bot's entire architecture assumes GitHub Actions as the compute substrate. Our L-Thread Orchestrator is local-first (tmux, worktrees, LaunchAgent) per Master Blueprint Principle §7 (build what you've needed in the last 30 days). We don't need cloud containers for coding agents -- we need faster local spawn and better context management.

### Web Chat UI / Telegram Integration
The Next.js frontend, Telegram bot, and web-based Code Workspaces solve a different problem (remote access to agents). Our interface is the terminal. We don't need a browser-based IDE when we have direct tmux access. Per Master Blueprint Principle §3 (context is zero-sum), adding a web layer would dilute architectural focus.

### Content Creator Orientation
SOUL.md and the personality/identity configuration layer is oriented toward building "assistant bots" for non-technical users. Our agents are coding-focused with strict separation of concerns (Principle §3). Agent identity for us is defined by CLAUDE.md and agent `.md` files, not personality templates.

### Auto-Merge Defaults
ALLOWED_PATHS defaulting to `/logs` with everything else requiring manual review is too restrictive for our autonomous pipeline. Our quality gate chain (lint -> SAST -> unit -> E2E -> multi-model review -> human) provides sufficient safety without path-based restrictions.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: No direct adoption. Study the skill format for cross-harness portability -- our `.claude/commands/` are already 80% compatible with SKILL.md.
- **Phase 3 (Days 60-90)**: The dual-backend pattern becomes directly relevant when we evaluate Pi Agent for cost-optimized batch work. ThePope Bot's `AGENT_BACKEND` switch is the reference implementation for how to make harness switching transparent to the rest of the system.
- **Phase 4 (Days 90+)**: If we need remote/cloud agent execution (e.g., for client demos, scaling beyond local hardware), the GitHub Actions substrate pattern could complement our local tmux orchestration. The cluster system's shared-folder coordination could inform how we design cross-agent data exchange in a federated deployment.

---

## Deep Dive Candidates

| URL | Context | Suggested Type |
|-----|---------|---------------|
| https://github.com/badlogic/pi-skills | External skills repository referenced by thepopebot; shared SKILL.md format across Pi and Claude Code | tool |
| https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md | Canonical SKILL.md format specification from Pi Agent's monorepo | article |
| https://skool.com/ai-architects | Stephen Pope's AI Architects community; potential source for practitioner patterns and use cases | post |

---

## Key Takeaway

> **ThePope Bot is the best reference implementation for dual-harness deployment (Claude Code + Pi Agent) with a shared skill layer -- study the `AGENT_BACKEND` switch and SKILL.md portability for our Day 60+ migration, but ignore the GitHub Actions execution substrate which trades latency for cloud accessibility.**
