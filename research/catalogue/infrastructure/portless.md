# Portless

> **Replace port numbers with stable, named `.localhost` URLs for local development.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [vercel-labs/portless](https://github.com/vercel-labs/portless) |
| GitHub Stars | 4,800 (as of 2026-03-12) |
| Publisher | Vercel Labs (bigtech) |
| License | Apache-2.0 |
| Tech Stack | TypeScript (81%), JavaScript, Python; pnpm + Turborepo monorepo; Node.js 20+ |
| Maturity | 🟡 Early (v0.5.2, active development) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *Local dev proxy that gives named subdomains to services. Interesting for multi-service SaaS Factory setups where agents spawn multiple dev servers. The git worktree detection is relevant since we use worktree isolation heavily. Low priority — solves a convenience problem, not a core orchestration problem.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Solves local dev routing, not agent orchestration. Tangential to multi-service SaaS Factory. |
| **Novelty** | 4/10 | Named localhost subdomains and auto-worktree detection are mildly interesting patterns. |
| **Actionable** | 2/10 | No patterns or code to adopt for orchestrator work. Pure DX convenience tool. |

---

## Overview

Portless is a local development proxy by Vercel Labs that replaces `localhost:PORT` URLs with human-readable `.localhost` subdomains (e.g., `https://myapp.localhost`). It runs a central proxy on port 1355 that routes requests based on subdomain names to backend services running on ephemeral ports in the 4000-4999 range.

The tool automatically assigns ports via the `PORT` environment variable, generates self-signed HTTPS certificates, and supports HTTP/2. A notable feature is automatic git worktree detection — when a project uses git worktrees, Portless prepends the branch name as a subdomain for isolation (e.g., `feature-branch.myapp.localhost`).

Portless also provides agent integration via `.agents/skills/` and `.cursor/skills/` directories in the repo, indicating awareness of the AI-assisted development workflow. It supports framework auto-injection for Vite, Astro, Angular, and React Router, handling cases where frameworks don't respect the `PORT` environment variable.

---

## Technical Architecture

- **Central Proxy**: Single proxy server on port 1355 (configurable) receives all requests
- **Port Assignment**: Ephemeral ports 4000-4999 assigned via `PORT` env var to each service
- **Subdomain Routing**: Requests routed by `.localhost` subdomain to the correct backend
- **HTTPS/HTTP2**: Auto-generated CA certificates with one-time trust setup (`portless trust`)
- **Git Worktree Detection**: Automatically prepends branch name as subdomain for worktree isolation
- **Framework Injection**: Auto-injects `--port` and `--host` flags for frameworks that don't respect `PORT`
- **Static Aliases**: `portless alias` for Docker containers and external services
- **Host Sync**: `/etc/hosts` synchronization for Safari compatibility
- **Loop Detection**: Guards against misconfigured proxy setups

### CLI Commands
- `portless run` — Start a service with named subdomain
- `portless alias` — Create static route to external service
- `portless proxy` — Start the central proxy
- `portless hosts` — Sync /etc/hosts
- `portless trust` — Install CA certificate

---

## Publisher Background

Vercel Labs is the experimental/open-source arm of Vercel (Next.js, Turbopack). The `vercel-labs` org publishes experimental tools that may or may not become official Vercel products. Portless has 12 contributors and 11 releases as of March 2026, suggesting active but early-stage development. Vercel is a well-funded company ($3.3B+ valuation) with strong developer tooling pedigree.

---

## What's Valuable for Us

**Git worktree subdomain isolation pattern**: Portless automatically detects git worktrees and creates branch-specific subdomains. Since our architecture relies heavily on git worktree isolation for parallel agents, this pattern of automatically routing traffic based on worktree context is conceptually interesting — though we don't currently need it for backend service routing.

**Agent skills directory convention**: The repo includes `.agents/skills/` and `.cursor/skills/` directories, showing how tool authors are starting to include AI agent integration as first-class concerns. This is a small signal validating the AGENTS.md convention pattern.

---

## What's NOT Relevant

- **Core proxy functionality**: We don't run multiple local web services that need human-friendly URLs. Our agents interact with services programmatically, not via browser URLs.
- **HTTPS certificate management**: Not a problem we face in agent orchestration.
- **Framework auto-injection**: Irrelevant to our TypeScript/Node orchestration stack.
- **The entire tool**: This is a developer experience convenience tool. It does not address any of our governing principles (deterministic orchestration, context management, coordination overhead, human review bottleneck, or federated systems).

---

## Future Use Cases

- **Phase 3+ (Days 60-90)**: If the SaaS Factory launches multiple web services simultaneously during development, Portless could simplify the local dev workflow for human review of multi-service apps. Very low priority.
- **Phase 4+ (Days 90+)**: If agents need to interact with multiple locally-running web services during E2E testing, named subdomains could simplify service discovery. However, programmatic port management is likely sufficient.

---

## Key Takeaway

> **Portless is a polished DX tool for named localhost URLs with interesting git worktree awareness, but it solves a convenience problem orthogonal to agent orchestration — file under "nice to have for SaaS Factory multi-service dev."**
