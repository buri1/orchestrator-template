# better-openclaw

> **Build your OpenClaw superstack in seconds — 94 services, 10 skill packs, 9 presets, one command.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [github.com/bidewio/better-openclaw](https://github.com/bidewio/better-openclaw) |
| GitHub Stars | 50 (as of 2026-03-12) |
| Publisher | bidew.io (bachir@bidew.io) — startup/org |
| License | AGPL-3.0 |
| Tech Stack | TypeScript 5.7, Node.js ≥22, pnpm workspaces + Turborepo, Hono (API), Next.js 16 (web), Commander + @clack/prompts (CLI), Zod OpenAPI, Vitest, Biome, Docker Compose |
| Maturity | 🟡 Early (created 2026-02-10, actively developed) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *This is the "create-t3-app" of self-hosted AI stacks. If we ever productize the orchestrator or spin up a SaaS factory node that needs a full self-hosted backend (vector DB + n8n + monitoring + AI coding agents + auth), better-openclaw replaces a week of Docker Compose hand-rolling. The MCP server is the most immediately useful surface — agents can call `suggest-services`, `resolve-dependencies`, and `generate` without touching YAML. The "Coding Team" preset (Claude Code + Codex + Redis + PostgreSQL) is directly relevant to our multi-agent setup. The AGPL license is a commercial use blocker for productized versions — flag this early.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Directly useful for SaaS factory infra standup (business line 3) and self-hosted toolchain for gov client environments. Not relevant to the orchestrator pattern itself. |
| **Novelty** | 7/10 | The MCP server exposing infrastructure generation as agent tools is genuinely novel in this catalogue — nothing else here does "agent-driven Docker Compose scaffolding." |
| **Actionable** | 7/10 | Three surfaces usable today: MCP server (agent tool), CLI `--preset coding-team` (bootstraps AI stack), REST API (CI/CD integration). Also references OpenClaw's SKILL.md format which our existing entry covers. |

---

## Overview

better-openclaw is a monorepo-based scaffold generator for production-ready Docker Compose stacks targeting OpenClaw-compatible AI deployments. It exposes the same generation capability through three surfaces: an interactive CLI wizard, a REST API (Hono + OpenAPI), and a Web UI (Next.js 16). The core abstraction is a **service registry** of 94 Docker services (pinned images, ports, volumes, health checks, env vars, resource limits, dependency declarations) organized into 21 categories — AI agents, databases, vector stores, monitoring, browser automation, reverse proxies, security, and more.

The generation pipeline is: select services → resolve transitive dependencies → apply preset or cherry-pick → choose proxy (Caddy/Traefik) → emit `docker-compose.yml` + `.env` (random secrets) + reverse proxy config + Grafana/Prometheus dashboards + agent SKILL.md files. It handles port conflict detection automatically (scans host, reassigns collisions). A bare-metal hybrid mode is also supported: services with native recipes (currently Redis; PostgreSQL/Caddy/Prometheus planned) run natively while the rest remain in containers.

The project is from **bidew.io** (bachir@bidew.io), an organization that appeared on GitHub in 2026. At 50 stars it is early but actively pushed (last push 2026-03-12, same day as analysis). It positions itself as a community-driven, AI-friendly project (CONTRIBUTING.md explicitly welcomes AI-assisted PRs). The AGPL-3.0 license means any derivative works must also be open-sourced — a blocker for productized forks.

---

## Technical Architecture

```
better-openclaw/
├── packages/
│   ├── core/             # Schemas (Zod), service registry, dependency resolver,
│   │                     # docker-compose composer, validators — the pure logic layer
│   ├── cli/              # Commander + @clack/prompts interactive wizard
│   │                     # + non-interactive flags (--preset, --yes, --json, --dry-run)
│   ├── api/              # Hono REST API, Zod OpenAPI, Redis rate limiting,
│   │                     # auto-generated Swagger at /api/v1/docs
│   ├── web/              # Next.js 16 + React 19 + Tailwind 4 + Framer Motion
│   │                     # visual stack builder with live preview + download
│   ├── db/               # Drizzle ORM schema + migrations (shared by API/auth)
│   ├── mcp/              # MCP server (stdio transport) for agent integrations
│   └── mission-control/  # Vite + Convex ops dashboard (monitoring + management)
├── skills/               # Agent SKILL.md files wired to their services
├── presets/              # Pre-configured stack JSON templates
├── turbo.json            # Turborepo pipeline
└── biome.json            # Biome linter/formatter
```

**Key design decisions:**

- `core` is the single source of truth — CLI, API, web, and MCP server all depend on it; never duplicate service definitions
- Service definitions are self-contained objects (image tag, ports, env, volumes, healthcheck, resource limits, dependencies) — no external config files
- MCP server uses `npx -y @better-openclaw/mcp` for zero-install agent integration
- API key auth via `X-API-Key` header; `API_KEYS` env var (comma-separated); Redis-backed distributed rate limiting for production
- Config versioning with forward-compatible migrations
- Biome (not ESLint/Prettier) for consistency in a fast-moving codebase

**MCP Tool Surface (12 tools across 3 categories):**

Discovery: `list-services`, `get-service`, `search-services`, `suggest-services`, `list-presets`, `get-preset`, `list-skill-packs`

Composition: `resolve-dependencies`, `validate-config`

Generation: `generate-stack`, `add-service`, `remove-service`

---

## Publisher Background

**bidew.io** is a small organization (bachir@bidew.io) that published the repo on 2026-02-10. No public funding information, team size unknown. The CONTRIBUTING.md and VISION.md reveal strong technical opinions: production-ready defaults, security by default, Docker Compose as primary target, with Kubernetes/Terraform/Nomad as long-term roadmap items. The short-term (Q1-Q2 2026) roadmap shows Mission Control and the MCP server as work-in-progress, with skill pack ecosystem and template marketplace planned.

The project is explicitly built on top of OpenClaw's concept — bidew.io appears to be building supplementary tooling for the OpenClaw ecosystem (271K stars), positioning better-openclaw as the "one-click infrastructure layer" that OpenClaw itself doesn't provide.

---

## What's Valuable for Us

**1. MCP Server for Agent-Driven Infra Scaffolding** (`packages/mcp/`): The most immediately useful surface. An agent can call `suggest-services "research agent with vector memory and web scraping"` and get back a dependency-resolved service list, then call `generate-stack` to emit the full Docker Compose + .env. This is the pattern for our SaaS factory line — no manual Docker Compose authoring.

**2. "Coding Team" Preset** (`--preset coding-team`): Emits Claude Code + Codex + Redis + PostgreSQL pre-wired. Directly relevant to spinning up a new client delivery environment. Estimated memory: ~3 GB — matches a standard VPS.

**3. "Researcher" Preset** (`--preset researcher`): Qdrant + SearXNG + Browserless + Redis — the exact stack we need for lead gen research agents (business line 2). One command, fully wired.

**4. Service Registry as Pinned Catalogue** (`packages/core/`): 94 services with pinned Docker image tags, health checks, and resource limits. This is a maintained, community-audited list of "what Docker images to use for X." Saves research time when evaluating toolchain components.

**5. Skill Pack Pattern** (`skills/`): SKILL.md files bundled with their required infrastructure services. Validates our `.claude/agents/*.md` pattern and shows how to co-locate capability declarations with infrastructure requirements — useful when productizing agent capabilities for clients.

**6. Deployment Bridge to Dokploy/Coolify**: The `deploy` command pushes generated stacks directly to self-hosted Dokploy or Coolify. Relevant if gov clients need on-premise deployments without Docker expertise on their side.

**7. REST API + `--json` flag for CI/CD**: `npx create-better-openclaw --preset minimal --yes --json` emits machine-readable output. Pluggable into our orchestrator's `spawn_worker` flows to auto-provision infrastructure before agent spawning.

---

## What's NOT Relevant

**The OpenClaw Gateway/Brain integration**: better-openclaw generates infrastructure for OpenClaw agents (Pi-based), not for Claude Code orchestrators. The generated SKILL.md files target the OpenClaw skill format, which is not our format. We use `.claude/agents/*.md` + `.claude/commands/*.md` — different structure.

**Mission Control dashboard**: A Vite + Convex operations dashboard for monitoring generated stacks. We have our own telemetry pipeline (`_bmad/telemetry/`) and the Pi supervisor TUI. Adding another monitoring layer would fragment observability.

**Web UI stack builder**: Interactive visual wizard is useful for humans who don't know what services they need. Our orchestrator agents can drive the CLI/API/MCP directly — no need for the Next.js frontend.

**AGPL-3.0 license for productized forks**: If we ship a client-facing product built on top of better-openclaw's core logic, we'd be forced to open-source our product. Use as a tool (call it via CLI/API/MCP), not as a library dependency in proprietary code.

**94-service breadth for Phase 1-2**: We don't need ComfyUI, Stable Diffusion, Remotion, Matrix Synapse, or the La Suite Meet stack right now. Start with targeted presets, ignore the full catalog.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Not applicable. Orchestrator standup doesn't require new Docker infrastructure.
- **Phase 2 (Days 4-60)**: Use `--preset researcher` to spin up the lead gen agent stack (Qdrant + SearXNG + Browserless). Use `--preset coding-team` as a reference for Claude Code + Codex multi-agent environments. Install MCP server in Claude Desktop for infra scaffolding during SaaS factory sprints.
- **Phase 3 (Days 60-90)**: If we productize the orchestrator as a SaaS, use better-openclaw's REST API to programmatically provision client environments. The `--json` output mode enables automated infrastructure-before-agent-spawn flows.
- **Phase 4 (Days 90+)**: If gov clients require on-premise AI stacks (audit trail, data sovereignty), better-openclaw's Dokploy/Coolify deployment bridge + pinned image registry becomes the handoff artifact. The MCP server integrates directly into client-side Claude Desktop configurations.

---

## Key Takeaway

> **better-openclaw is the missing "infrastructure scaffold" layer for OpenClaw stacks — its MCP server, "Coding Team" and "Researcher" presets, and Dokploy deployment bridge are directly usable for SaaS factory and lead gen agent standup, but the AGPL-3.0 license blocks productized forks and the OpenClaw-native skill format doesn't map to our Claude Code agent definitions.**
