# Hermes Fly

> **Deploy Hermes Agent to Fly.io with a single command — an interactive CLI wizard that provisions, configures, and manages a Hermes instance on Fly.io.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [alexfazio/hermes-fly](https://github.com/alexfazio/hermes-fly) |
| GitHub Stars | 30 (as of 2026-03-12) |
| Publisher | alexfazio (solo) |
| License | MIT |
| Tech Stack | Bash (primary), TypeScript (migration in progress), flyctl CLI, OpenRouter API |
| Maturity | 🟡 Early (v0.1.20, created 2026-03-06, 6 days old at analysis time) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *Companion to hermes-function-calling.md — this is the deployment layer for the NousResearch Hermes Agent stack. Low relevance to our current work (we run Claude Code on Claude Max, not self-hosted open-weight models on Fly.io). The interesting parts are the CLI wizard patterns (preflight → provision → configure → verify), the OpenRouter model picker with provider-first grouping, and the release channel system (stable/preview/edge with `curl | bash` installation). The Bash modular architecture with explicit exit code constants (EXIT_SUCCESS/ERROR/AUTH/NETWORK/RESOURCE) is a clean reference for shell tooling. TypeScript migration scaffolding with a `HERMES_FLY_IMPL_MODE` feature flag (legacy/hybrid/ts) is textbook progressive migration — could reference if we ever need to migrate a shell tool.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | We use Claude Max flat-rate, not self-hosted Hermes models on Fly.io. Deployment tooling for an unrelated stack. |
| **Novelty** | 4/10 | OpenRouter dynamic model fetching with provider-first grouping is a clean pattern. The `HERMES_FLY_IMPL_MODE` feature-flag migration is textbook. 370+ tests with edge case validation is unusually thorough for a 6-day-old Bash tool. |
| **Actionable** | 2/10 | No immediate adoption path. Reference only if we ever ship a Fly.io deployment wizard or need an OpenRouter provider-picker pattern. |

---

## Overview

hermes-fly is a Bash CLI that automates deploying [Hermes Agent](https://github.com/NousResearch/hermes-agent) (NousResearch's open-weight function-calling model) to [Fly.io](https://fly.io). It provides a guided deployment wizard for first-time setup and subcommands for ongoing management (status, logs, diagnostics, teardown, resume). Secrets are stored via `fly secrets set` and never written to disk — injected as environment variables at runtime.

The tool is unusually well-tested for its age: 57 edge case tests and 370+ total tests covering platform detection, PATH safety, signal handling, CI/CD bypass, binary output edge cases, and permission errors. A TypeScript migration is scaffolded but not yet active — a feature flag (`HERMES_FLY_IMPL_MODE`) controls dispatch (legacy/hybrid/ts) with allowlisted commands, falling back to bash if the TS runtime is absent.

The deployment wizard walks through: preflight checks → Fly.io auth → app/region/VM/volume config → OpenRouter API key + model selection → optional Telegram/Discord messaging setup → Dockerfile + fly.toml generation → deploy + health verification. The OpenRouter integration fetches live models from the OpenRouter `/models` API and groups them by provider (openai, anthropic, google, meta-llama, deepseek, etc.) for selection.

---

## Technical Architecture

```
hermes-fly/
├── hermes-fly              # Entry point: set -euo pipefail, sources all lib/*.sh, cmd dispatch
├── lib/
│   ├── ui.sh               # Exit code constants, colors, prompts, spinner, logging
│   ├── config.sh           # ~/.hermes-fly/config.yaml app registry
│   ├── fly-helpers.sh      # flyctl wrappers + exponential backoff retry
│   ├── docker-helpers.sh   # Template substitution → Dockerfile + fly.toml
│   ├── openrouter.sh       # Live /models fetch, provider-first picker, 30min cache
│   ├── reasoning.sh        # Reasoning model support
│   ├── deploy.sh           # Main wizard orchestrator
│   ├── status.sh           # App state + cost estimation
│   ├── logs.sh             # fly_logs wrapper
│   ├── doctor.sh           # Diagnostic checks (app, machine, volume, secrets, process, API)
│   ├── destroy.sh          # Teardown: volumes + app + config cleanup
│   └── list.sh             # Multi-app listing
├── templates/
│   ├── Dockerfile.template # {{HERMES_VERSION}} placeholder
│   └── fly.toml.template   # app/region/VM/volume placeholders
├── src/                    # TypeScript migration (inactive, behind HERMES_FLY_IMPL_MODE flag)
│   ├── contexts/           # DDD bounded contexts: deploy, diagnostics, messaging, release, runtime
│   ├── commands/           # TS command implementations
│   └── shared/
└── scripts/
    └── install.sh          # curl | bash installer with stable/preview/edge channels
```

**Data flow (deploy):**
```
Preflight (platform + flyctl + auth + network)
  → Interactive prompts (app name, region, VM size, volume)
  → OpenRouter model picker (live fetch + provider-first grouping)
  → Messaging setup (Telegram/Discord, optional)
  → Template generation (Dockerfile + fly.toml)
  → Fly resource creation (app + volume + secrets)
  → Deploy + health poll
  → Summary
```

**Config storage:** `~/.hermes-fly/config.yaml` — tracks deployed app names, current app.

**Release channels:** `HERMES_FLY_CHANNEL=stable|preview|edge` at install time. Edge installs from moving `main`.

---

## Publisher Background

[alexfazio](https://github.com/alexfazio) is a solo developer, also the publisher of [hermes-function-calling](../agent-protocols/hermes-function-calling.md) — the reference implementation for NousResearch's Hermes tool-use protocol. This repo appears to be his deployment companion for running Hermes Agent in production. Created 2026-03-06, so effectively brand-new at time of analysis. No affiliation with OpenClaw (confirmed per Burak's notes in MEMORY.md: "Elvis Sun (@elvissun — NOT connected to OpenClaw)").

---

## What's Valuable for Us

1. **OpenRouter provider-first model picker** (`lib/openrouter.sh`): Live `/models` fetch with curated provider ordering (openai → anthropic → google → meta-llama → deepseek → mistralai), 30-min local cache, graceful fallback to a static curated list if the API is unreachable. If we ever need a dynamic model picker in our CLI tooling, this is a clean reference.

2. **Feature-flag migration pattern** (`HERMES_FLY_IMPL_MODE`): Allows progressive migration from Bash to TypeScript at the command level, with allowlisted commands and silent fallback when the TS runtime is absent. Reference pattern for migrating shell tools without breaking users.

3. **Exit code taxonomy** (`lib/ui.sh`): `EXIT_SUCCESS=0`, `EXIT_ERROR=1`, `EXIT_AUTH=2`, `EXIT_NETWORK=3`, `EXIT_RESOURCE=4` — clean structured exit codes for shell tooling that downstream scripts can branch on.

4. **Modular Bash architecture**: Each command lives in a dedicated `lib/*.sh` module, all sourced at entry point startup. No global state — config accessed via explicit functions. Clean reference for any future Bash tooling we write.

5. **Edge case test density**: 370+ tests in 6 days covering platform detection, PATH safety, SIGTERM/SIGINT/SIGKILL cleanup, binary/malformed output, CI=true bypass, command injection prevention, long paths, special chars, permission errors. Good benchmark for test rigor on shell tools.

---

## What's NOT Relevant

- **Fly.io deployment**: We run on local machines + Claude Max. No need for container-based cloud deployment of agents.
- **Hermes Agent runtime**: We use Claude (Claude Code / Claude API). The underlying model this deploys is orthogonal to our stack.
- **Telegram/Discord messaging setup**: Our notification layer is different.
- **TypeScript DDD migration**: Still inactive (behind a feature flag), and bounded-context DDD for a deploy CLI is over-engineered for our purposes.

---

## Future Use Cases

- **Phase 3+ (Days 60-90):** If we ever ship a SaaS product that requires deploying open-weight model instances for clients (e.g., a custom Hermes-based function-calling endpoint), this is the reference deployment pattern.
- **Phase 4 (Days 90+):** If we build a multi-model routing layer that includes open-weight models on Fly.io, the OpenRouter model picker and provider-first grouping from `openrouter.sh` are directly reusable.

---

## Key Takeaway

> **hermes-fly is a well-engineered deployment CLI for NousResearch's Hermes Agent on Fly.io — notable primarily for its OpenRouter provider-first model picker and feature-flag Bash→TypeScript migration pattern, but not relevant to our Claude Max + local-execution stack.**
