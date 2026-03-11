# Proliferate

> **The open-source background agent — autonomous engineering platform with isolated cloud sandboxes, event-driven automations, and multiplayer collaboration.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [github.com/proliferate-ai/proliferate](https://github.com/proliferate-ai/proliferate) |
| GitHub Stars | 234 (as of 2026-03-08) |
| Publisher | Proliferate (YC W2026 startup) |
| License | MIT |
| Tech Stack | TypeScript, pnpm monorepo, Next.js (web), Docker Compose, Modal/E2B (sandboxes), LiteLLM (model proxy), Turbo |
| Maturity | 🟡 Early (active migration; repo note: "may be unstable") |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *YC W2026 company. Interesting overlap with our vision — they've built a hosted version of what we're building locally (orchestrator + sandboxed agents + event triggers). Their sandbox isolation + Docker mirroring is well-designed. The multiplayer/Slack-native workflow is compelling for team use. Key question: is anything here adoptable as infrastructure, or is it a competing product we should watch? The open-source MIT license means we could cherry-pick patterns. Their MCP server integration for actions is worth studying.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves similar problems (agent orchestration, sandbox isolation, event-driven triggers) but from a cloud-hosted SaaS angle that conflicts with our local-first, Claude Max arbitrage approach |
| **Novelty** | 5/10 | Sandbox isolation, event triggers, and multiplayer are patterns we've documented from Overstory, Manaflow, and Warp/Oz. The MCP-as-actions unification and Slack-as-client are incrementally new |
| **Actionable** | 4/10 | Self-hostable but adds significant infra (Modal/E2B, Docker Compose orchestration, Next.js frontend). Not a drop-in for our tmux+worktree pattern. Reference-only for now |

---

## Overview

Proliferate is an autonomous engineering platform that runs AI coding agents in isolated cloud sandboxes. Unlike local-first tools like Claude Code or Pi Agent, Proliferate's core value prop is that agents operate in fully containerized environments mirroring your actual Docker setup — complete with repo access, dependencies, secrets, and network connectivity. Work happens "in the background" and returns results (live preview URLs, PRs, command logs) for human review.

The platform operates across three interfaces: a web dashboard, a CLI, and Slack — all sharing the same session state. This "multi-client" architecture means a task started from Slack can be monitored from the web dashboard and reviewed from the CLI. Automations can be triggered by external events (Sentry errors, Linear tickets, GitHub PRs, PostHog replays, cron schedules) or manually kicked off by any team member.

The most architecturally interesting aspect is their action/permission framework: they treat native integrations (GitHub, Sentry, Linear, Slack) and user-connected MCP servers identically, with a unified permission layer (Allow / Require Approval / Deny) governing all agent actions. Secrets are encrypted at rest and injected fresh on sandbox start — never persisted in saved environments.

---

## Technical Architecture

```
┌──────────────────────────────────────────────┐
│           Web Dashboard / CLI / Slack         │  ← Multi-client interfaces
└──────────┬───────────────────────┬────────────┘
           │                       │
┌──────────▼───────────────────────▼────────────┐
│              Core Platform (Next.js)           │
│                                                │
│  Session Manager  │  Automation Engine         │
│  Permission Layer │  Integration Gateway       │
│  Model Proxy      │  Queue (packages/queue)    │
│  (LiteLLM)        │  Triggers (packages/       │
│                   │    triggers)               │
└──────────┬───────────────────────┬────────────┘
           │                       │
┌──────────▼──────────┐  ┌────────▼─────────────┐
│  Sandbox Provider   │  │  Actions / MCP        │
│  (Modal or E2B)     │  │                       │
│                     │  │  GitHub App           │
│  Docker-mirrored    │  │  Linear OAuth         │
│  environments       │  │  Sentry Integration   │
│  Secret injection   │  │  Slack Bot            │
│  24hr preview URLs  │  │  Custom MCP servers   │
│  VS Code in-browser │  │  (Neon, Stripe, etc.) │
└─────────────────────┘  └───────────────────────┘
```

**Key packages (monorepo structure):**
- `apps/` — Web frontend (Next.js)
- `packages/db` — Database layer with migrations
- `packages/gateway-clients` — Integration gateway for GitHub, Sentry, etc.
- `packages/sandbox-daemon` — Daemon running inside sandboxes
- `packages/sandbox-mcp` — MCP server exposed to agents in sandboxes
- `packages/modal-sandbox` — Modal cloud sandbox provider
- `packages/e2b-sandbox` — E2B cloud sandbox provider
- `packages/triggers` — Event trigger processing (Sentry, Linear, GitHub, PostHog, webhooks, cron)
- `packages/queue` — Job queue for background processing
- `packages/providers` — LLM provider abstraction (LiteLLM-based)
- `packages/services` — Core business logic
- `packages/environment` — Environment/config management
- `packages/shared` — Shared types and utilities
- `infra/` — Pulumi IaC for AWS EKS and GCP GKE deployment

**Deployment options:**
- Local: `docker compose up -d` (build from source)
- Production: `docker-compose.prod.yml` (pre-built images)
- AWS: EKS via Pulumi + Helm
- GCP: GKE via Pulumi + Helm

**Model support:** Claude Sonnet 4.6 (default), Claude Opus 4.6, GPT-5.2, Gemini 3.1 Pro, Gemini 3 Flash, DeepSeek V3/R1, Grok 4.1, Codestral. Any LiteLLM-compatible model for self-hosted deployments.

**Security model:** All external access is intermediated via the gateway — sandboxes never receive raw credentials. Secrets are encrypted at rest, injected fresh on start/resume, and never persisted in saved environments.

---

## Publisher Background

Proliferate is a YC W2026 company. Founding team includes Pablo (pablo@proliferate.com, listed as primary contact). They're actively hiring founding engineers via YC's job board. The repo was created on 2026-02-06 and has been actively developed (last push 2026-03-08). At 234 stars and 22 forks after ~1 month, traction is modest but the YC backing provides credibility. The product uses OpenCode (github.com/anomalyco/opencode) as its LLM coding engine.

---

## What's Valuable for Us

1. **MCP-as-actions unification pattern**: Treating native integrations and custom MCP servers identically through a single permission framework is elegant. Our Master Blueprint's Layer 3 (Shared Infrastructure) could adopt this pattern for the notification layer — a unified action/permission system across Telegram, Slack, macOS notifications, and custom MCP tools.

2. **Secret injection model**: "Encrypted at rest, injected fresh on start, never persisted in saved environments" is a clean pattern for our worktree-per-agent isolation. Currently we don't have a formal secret management approach for agent environments.

3. **Event-driven automation triggers**: Their trigger architecture (Sentry errors → agent investigation → PR) maps directly to our roadmap's Phase 2 goal of autonomous maintenance. The `packages/triggers` package is worth studying for the event schema design.

4. **Sandbox-daemon pattern**: The `packages/sandbox-daemon` concept — a lightweight process running inside each agent's environment that manages lifecycle, logging, and communication with the platform — could inform our tmux session monitoring approach.

5. **LiteLLM proxy integration**: They ship LiteLLM as the model proxy layer, validating our catalogue entry for LiteLLM (8/10 relevance). The `packages/providers` package shows a clean abstraction over it.

---

## What's NOT Relevant

1. **Cloud-first sandbox architecture**: Our Master Blueprint Principle 7 ("Build only what you have needed in the last 30 days") and our Claude Max $200/mo arbitrage model mean we run agents locally on tmux+worktree, not in cloud sandboxes (Modal/E2B). The infrastructure overhead (Pulumi, EKS/GKE, Docker Compose) is the opposite of our zero-infra approach.

2. **Next.js web dashboard**: We use Notion as our meta-layer (Blueprint Principle 6: "Federated systems, thin meta-layer"). Building a custom web frontend duplicates what Notion already provides and violates our "no custom UI in Phase 1-2" stance.

3. **Multi-model routing via LiteLLM**: We currently use Claude Max exclusively for the arbitrage advantage. Multi-model routing is a Phase 4 concern at earliest.

4. **Team/org collaboration features**: Our current operation is single-operator (Burak). Multiplayer session management, org-wide permissions, and Slack-as-client are enterprise features we don't need until we scale the team.

5. **OpenCode as LLM engine**: We use Claude Code directly. No reason to swap to a third-party coding engine.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study their `packages/triggers` event schema for inspiration when building our own event-driven automations (Sentry → auto-fix, GitHub issue → agent assignment). The trigger-instruction-action three-part automation config is a clean design pattern.
- **Phase 3 (Days 60-90)**: If we need cloud sandbox isolation for client demos or CI/CD integration, the Modal/E2B provider pattern gives us a reference implementation. The `sandbox-daemon` concept could be adapted for our tmux-based agent monitoring.
- **Phase 4 (Days 90+)**: If scaling to a team, their permission framework (Allow/Require Approval/Deny per action type) and multi-client session model become relevant. Their Slack bot architecture could inform our notification layer evolution.

---

## Key Takeaway

> **Proliferate is a well-engineered cloud-hosted version of our local-first agent orchestration pattern — useful as a reference implementation for event-driven automations and MCP-unified actions, but architecturally opposed to our zero-infra, Claude Max arbitrage approach.**
