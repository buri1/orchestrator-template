# zenthor-assist

> **AI-powered personal assistant monorepo — web app, Convex backend, and long-running agent workers with WhatsApp, Telegram, and code-awareness integrations.**

| Field | Value |
|-------|-------|
| Category | Agent Harnesses |
| Repository | [github.com/zenthor-hub/zenthor-assist](https://github.com/zenthor-hub/zenthor-assist) |
| GitHub Stars | 0 (as of 2026-04-04) |
| Publisher | zenthor-hub — GitHub organization |
| License | None specified |
| Tech Stack | TypeScript, Bun workspaces, Turborepo, Next.js 16, React 19, Convex, Clerk, AI SDK, Baileys (WhatsApp), TailwindCSS v4, shadcn/ui |
| Maturity | Early |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Multi-channel AI assistant with WhatsApp/Telegram workers and Convex real-time backend. The role-based worker architecture (core, whatsapp, whatsapp-cloud, telegram) and service authentication model are directly relevant to multi-agent deployment patterns. |
| **Novelty** | 4/10 | Standard monorepo structure with well-known stack (Next.js + Convex + Clerk). The code-awareness feature (injecting repo context into agent prompts) and role-scoped workers are mildly novel but not paradigm-shifting. |
| **Actionable** | 5/10 | The agent role system (AGENT_ROLE env var scoping workers by capability) and service auth pattern (AGENT_SECRET for trusted runtime calls) are reusable patterns. The code-awareness toggle (CODE_AWARENESS_ENABLED with configurable context files/max bytes) is a clean design for context injection. |

---

## Overview

zenthor-assist is a monorepo for a personal AI assistant that spans web, backend, and long-running agent workers. It uses Bun workspaces + Turborepo to manage three apps: a Next.js 16 web frontend with Clerk auth, a Convex backend with real-time functions and schema, and an agent runtime built on the AI SDK.

The agent runtime is the most interesting piece. It supports multiple deployment roles via a single `AGENT_ROLE` environment variable: `core` (main AI processing), `whatsapp` / `whatsapp-cloud` (WhatsApp integration via Baileys or Cloud API), and `telegram` (Telegram bot). Each role runs as an independent process with its own env scoping, meaning you can scale them separately on Railway or similar platforms.

The agent includes a code-awareness feature: when `CODE_AWARENESS_ENABLED=true`, the agent reads specified context files (AGENTS.md, CLAUDE.md, README.md, etc.) from a configurable workspace root and injects them into its prompt, up to a configurable byte limit. When `CODE_MAINTENANCE_MODE=true`, the agent can also write files and apply patches. This is essentially a lightweight code-agent mode bolted onto a chat assistant.

The auth model uses three tiers: authenticated user access (Clerk), admin-only access, and trusted service access via shared secret (AGENT_SECRET). This is a clean pattern for separating human users from agent workers accessing the same backend.

---

## Technical Architecture

```
zenthor-assist/
├── apps/
│   ├── web/          Next.js 16 + React 19 + TailwindCSS v4 + shadcn/ui + Clerk
│   ├── backend/      Convex functions/schema + Clerk sync + webhooks
│   │   └── convex/   TypeScript 7 native checks (tsgo)
│   └── agent/        Bun runtime + AI SDK
│       ├── AGENT_ROLE=core          Main AI processing
│       ├── AGENT_ROLE=whatsapp      WhatsApp via Baileys
│       ├── AGENT_ROLE=whatsapp-cloud WhatsApp Cloud API
│       └── AGENT_ROLE=telegram      Telegram bot
├── packages/
│   ├── config/          Shared configuration
│   ├── env/             Environment validation
│   ├── observability/   Telemetry (Axiom)
│   └── agent-plugins/   Plugin system
└── docs/ops/            Runtime topology + runbook
```

**Key design decisions:**
- **Role-scoped workers**: Single agent codebase, multiple deployment roles via AGENT_ROLE env var. Each role runs as a separate process with its own secrets.
- **Three-tier auth**: Clerk for users, admin wrappers for elevated access, AGENT_SECRET for service-to-service trust between agent workers and Convex backend.
- **Code-awareness toggle**: Agent can optionally read repo context files and inject them into prompts. Separate maintenance mode flag enables write access.
- **TypeScript 7 native**: Backend uses @typescript/native-preview with Convex's tsgo for type checking.
- **Railway deployment**: Each role deploys as a separate Railway service with per-service env scoping.

---

## Publisher Background

zenthor-hub is a GitHub organization with no stars on this repo and limited public visibility. The project appears to be a small team or solo developer building a production assistant product (deployed at zenthor-assist.vercel.app). The tech choices are modern and well-integrated (Next.js 16, React 19, Convex, TypeScript 7 native), suggesting experienced full-stack development. The repo was created 2026-01-31 and last pushed 2026-02-22.

---

## What's Valuable for Us

1. **Role-scoped agent workers**: The AGENT_ROLE pattern for deploying the same agent codebase with different capabilities (core processing vs. messaging channel workers) is a clean model for our orchestrator's worker specialization.

2. **Code-awareness injection**: The pattern of toggling context file injection via env vars (CODE_AWARENESS_ENABLED, CODE_CONTEXT_FILES, CODE_CONTEXT_MAX_BYTES) is a well-designed approach to making agents code-aware without hardcoding file paths.

3. **Three-tier auth model**: Separating user auth (Clerk), admin auth, and service auth (shared secret) is a pattern we'd need when our orchestrator workers need trusted access to shared backends.

4. **Convex real-time backend**: Convex's real-time subscription model could be interesting for agent state synchronization -- workers could subscribe to task updates instead of polling.

---

## What's NOT Relevant

- **WhatsApp/Telegram integrations**: Messaging channel code is specific to their product, not reusable for our orchestrator.
- **Clerk auth specifics**: We don't need user-facing auth for our headless orchestrator.
- **UI/frontend**: The Next.js web app is a standard dashboard, not relevant to our agent orchestration patterns.
- **Bun/Turborepo specifics**: Build tooling choices are orthogonal to our architecture.

---

## Key Takeaway

> **zenthor-assist's role-scoped worker pattern (single codebase, multiple deployment roles via env var) and code-awareness injection design (toggleable context files with byte limits) are clean, production-ready patterns worth noting for when we need to deploy specialized agent workers or add repo-aware context to agent prompts.**
