# Git-Ape

> **Platform engineering framework on GitHub Copilot — multi-agent system for planning, validating, and deploying Azure infrastructure with security gates, cost analysis, and CI/CD integration.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness (vertical — Azure platform engineering) |
| Repository | https://github.com/Azure/git-ape |
| GitHub Stars | 173 (as of 2026-04-17) |
| Publisher | Microsoft / Azure (official org) |
| License | MIT |
| Tech Stack | Shell + GitHub Copilot agents/skills + Azure MCP server + ARM templates |
| Maturity | 🟡 Early — marked "EXPERIMENTAL, not production-ready" in README; created 2026-04-02 |
| Last Analyzed | 2026-04-17 |

---

## Burak's Notes

> *(Reserved for your observations — agents won't overwrite this section.)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Validates the orchestrator + subagent + gated-pipeline pattern we already run (cf. Stripe Minions 70/30, Overstory 4-tier merge queue). Azure-specific verticalization is the interesting angle — it shows how a bigtech vendor packages "platform engineering" as an agent harness. Not directly adoptable (Copilot-bound, not Claude Code), but useful as a comparison point when Burak pitches a similar pattern on top of Claude Code + MCP for German KfW/Azure-heavy clients. |
| **Novelty** | 4/10 | The architecture (orchestrator → subagents → skills → blocking security gate → WAF review → user confirmation → deploy → validate) is the same shape as Symphony, Stripe Minions, and Lopopolo's QA-plan-gate pattern already catalogued. The novelty is the explicit **deployment-domain** framing (CAF naming, SKU validation, cost preflight, WAF 5-pillar review, RBAC role selector, drift detector) — domain-specific skills packaged as a Copilot plugin marketplace entry. |
| **Actionable** | 5/10 | Concrete and copyable: the 11-skill taxonomy split across Pre-Deploy / Post-Deploy / Operations is a clean ontology for any infra-as-code agent. The interactive-vs-headless mode duality (same agents, different execution context — chat vs GitHub Actions) is directly reusable for our orchestrator modes. The blocking "Security Gate" + "User Confirmation" nodes in the Mermaid flow are prompt-engineerable in any harness. Not adopting the plugin itself — we don't use Copilot — but stealing the skill split and the dual-mode pattern is a few-hour exercise. |

---

## Overview

Git-Ape is Microsoft's official example of packaging **platform engineering as an agent harness** on top of GitHub Copilot. The central `@git-ape` orchestrator coordinates a four-stage deployment pipeline — Requirements → Template & Analysis → Deploy → Validate — with a blocking security gate, a WAF (Well-Architected Framework) 5-pillar review, and mandatory user confirmation before any Azure resource changes. Subagents (Requirements Gatherer, Template Generator, Resource Deployer, Principal Architect, IaC Exporter, Onboarding) are specialized Copilot agents invoked at specific stages; **skills** are narrower one-task modules (naming research, resource availability, security analyzer, preflight, role selector, cost estimator, integration tester, resource visualizer, drift detector, onboarding).

The README positions Git-Ape as a **Copilot plugin marketplace** distribution (`copilot plugin marketplace add Azure/git-ape`) — not a framework to fork, but a curated set of agents + skills you install alongside the Azure CLI, `gh`, `jq`, and the Azure MCP server. Deployment artifacts are saved under `.azure/deployments/` for audit and reuse, and a future "agentic drift detector" workflow is mentioned but not yet shipped.

Two execution modes are documented: **Interactive** (VS Code / Chat with `az login` session, real-time Q&A, direct `@git-ape deploy …` and `@git-ape destroy …` invocations) and **Headless** (coding-agent / GitHub Actions). Same agents, same skills, different context — a clean separation that maps to our `orchestrator-tmux` vs `orchestrator-cmux` duality.

---

## Technical Architecture

### Stage pipeline

```
Stage 1: Requirements Gatherer  → interviews user, CAF naming, SKU validation
Stage 2: Template Generator     → ARM template + arch diagram + cost + security report
Gate:    Security Gate          → BLOCKING; failure → Fix loop → back to Stage 2
Stage 2.75: Principal Architect → WAF 5-pillar scoring
Gate:    User Confirmation      → chat approval or PR approval
Stage 3: Resource Deployer      → az deployment, monitor, retry, integration tests
Stage 4: Validation             → health checks, endpoint tests, Mermaid diagram
```

### Skills taxonomy (11 skills)

| Phase | Skill | Purpose |
|-------|-------|---------|
| Pre-Deploy | `/azure-naming-research` | CAF abbreviation lookup, naming constraint validation |
| Pre-Deploy | `/azure-resource-availability` | SKU restrictions, version support, API compatibility, quota |
| Pre-Deploy | `/azure-security-analyzer` | Per-resource security assessment with blocking gate |
| Pre-Deploy | `/azure-deployment-preflight` | What-if analysis + permission checks |
| Pre-Deploy | `/azure-role-selector` | Least-privilege RBAC role recommendations |
| Pre-Deploy | `/azure-cost-estimator` | Real-time cost via Azure Retail Prices API |
| Pre-Deploy | `/prereq-check` | Verify `az`, `gh`, `jq`, `git` and auth sessions |
| Post-Deploy | `/azure-integration-tester` | Health checks + endpoint tests |
| Post-Deploy | `/azure-resource-visualizer` | Mermaid diagrams from live Azure resources |
| Operations | `/azure-drift-detector` | Config drift between live Azure and stored state |
| Operations | `/git-ape-onboarding` | OIDC + RBAC + GitHub envs + secrets setup |

### Integration points

- **Host**: GitHub Copilot (VS Code chat + Copilot CLI)
- **Authentication**: Azure CLI (`az login`) + OIDC for GitHub Actions
- **Tools**: Azure MCP server, Azure Retail Prices API, `az deployment`, `gh` CLI
- **State**: `.azure/deployments/` artifact directory for audit and reuse
- **Testing**: Documented as BASH-only (git-bash on Windows)

---

## Publisher Background

Published by the `Azure` GitHub organization — Microsoft's official org for Azure tooling. The repo was created 2026-04-02 and was most recently pushed on 2026-04-10. Small contributor base (25 forks, 173 stars at time of cataloguing). The project is flagged as **experimental** in a prominent warning block and scoped to "local development, demos, sandbox subscriptions, and learning only" — consistent with other Azure-org incubations that eventually graduate into Azure Developer CLI (`azd`) extensions or standalone Azure services.

---

## What's Valuable for Us

1. **11-skill domain ontology**: The Pre-Deploy / Post-Deploy / Operations split is a clean information architecture for any IaC agent harness. If we ever pitch an orchestrator variant to a German Azure-heavy buyer (Ausschreibungen, OmniPort partners), this skill split is directly copyable — rename to our domain, same shape.
2. **Interactive vs Headless mode duality**: Same agents + skills, different execution context (chat vs Actions). Mirrors our `orchestrator-tmux` vs `orchestrator-cmux` modes. Git-Ape's explicit documentation of this pattern is cleaner than anything we've written — steal the framing.
3. **Blocking-gate + WAF-review + user-confirmation Mermaid**: The README's stage diagram is a reference for documenting our own orchestrator loop. Shows that "security gate before generation finalization" can be ungraduated back to "Fix loop" — architectural pattern for retry-with-context we don't currently enforce.
4. **Copilot plugin distribution as precedent**: Validates that bigtech is packaging agent harnesses as plugin marketplace entries (not CLIs, not frameworks). Matches the Claude Plugins Official direction we've already catalogued. If we eventually ship a public product, plugin-marketplace distribution is the 2026 default.

---

## What's NOT Relevant

- **Copilot dependency**: Git-Ape is a Copilot plugin, not a Claude Code harness. We don't run Copilot in production; Claude Max + Claude Code is the stack. Nothing here runs on our harness without a full port.
- **Azure-specific verticalization**: OmniPort-HH is on Vercel, MAYTT is on Supabase, MC is local-first SQLite. Azure ARM templates / CAF naming / WAF pillars don't map to any of our current client work. Useful if a Kälte Aktiv-style client lands on Azure, not before.
- **ARM templates as the artifact format**: 2026 infra-as-code has largely migrated to Bicep, Pulumi, or Terraform for anyone not already locked to ARM. ARM template generation is a lagging choice and suggests Git-Ape is optimizing for existing Azure enterprise customers, not modern IaC.
- **Experimental status + BASH-only testing**: README explicitly says "not production-ready" and only tested on BASH shells — not a stack we can depend on for client delivery.

---

## Future Use Cases

- **Phase 3 (Day 60-90)**: If Burak wins an Ausschreibung with a German public-sector buyer that mandates Azure (common for KfW, Bundesbehörden), the 11-skill pattern + dual-mode pattern is a 1-day port onto our Claude Code orchestrator — rename skills, rewrite as slash commands, use Azure MCP server directly.
- **Phase 4 (Day 90+)**: If the L-Thread orchestrator ever ships as a public product, revisit Git-Ape's README as the reference for how Microsoft frames "platform engineering framework" to its buyer segment. The language ("platform engineering framework for the agentic age") is pitch-ready.

---

## Key Takeaway

> **Microsoft's Copilot-native Azure deployment harness is the same orchestrator+subagents+gated-pipeline shape we already run — the interesting asset is the 11-skill domain ontology and the explicit interactive-vs-headless mode duality, both 1-day ports onto any Claude Code harness.**
