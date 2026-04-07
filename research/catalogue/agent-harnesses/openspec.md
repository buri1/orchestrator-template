# OpenSpec

> **Spec-driven development (SDD) for AI coding assistants.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) |
| Website | [openspec.dev](https://openspec.dev/) |
| GitHub Stars | 28,576 (as of 2026-03-08) |
| Publisher | Fission AI / TabishB (startup, 50 contributors, lead maintainer @TabishB) |
| License | MIT |
| Tech Stack | TypeScript (98.7%), Node.js >=20.19.0, Commander.js, Zod, Vitest |
| Maturity | 🟢 Production (v1.2.0, 34 releases, 540 commits) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | OpenSpec addresses context engineering for coding agents — a real problem we face — but at the wrong layer. Our Master Blueprint governs via deterministic orchestration (70/30 split), and OpenSpec adds an LLM-heavy spec-generation layer that would increase, not decrease, coordination overhead. The artifact workflow (proposal → specs → design → tasks → apply → archive) is structured, but it's a workflow methodology, not an orchestration primitive. |
| **Novelty** | 5/10 | The "spec-before-code" pattern is well-documented across our research (Geoffrey Huntley's specs-driven dev, Superpowers' brainstorm-before-code). OpenSpec's contribution is a polished CLI that makes this practical across 20+ tools. The change/archive lifecycle and delta-spec merge semantics are more formalized than anything else we've catalogued. |
| **Actionable** | 5/10 | The artifact structure (proposal.md → specs/ → design.md → tasks.md) and delta-spec merge semantics (ADDED/MODIFIED/REMOVED/RENAMED) are patterns we could adapt into our orchestrator's task decomposition. However, adopting OpenSpec itself would add a dependency and workflow layer that conflicts with our "build only what you've needed in the last 30 days" principle (Governing Principle #7). |

---

## Overview

OpenSpec is a CLI tool and development methodology that inserts a "lightweight spec layer" between human intent and AI code generation. The core thesis: AI coding assistants produce better results when they first agree on requirements (specs) before writing code. Rather than sending agents straight to implementation, OpenSpec structures work into a proposal → specification → design → tasks → apply → archive pipeline, where each phase produces versioned Markdown artifacts that persist in the repository.

The tool works across 20+ AI coding assistants (Claude Code, Cursor, VS Code Copilot, Codex, Pi, Kiro, and others) via slash commands (`/opsx:propose`, `/opsx:apply`, `/opsx:archive`). It ships as a global npm package that initializes an `openspec/` directory in your project root, containing `specs/` (master specifications), `changes/` (active work with delta specs), and `config.yaml` (schema and context configuration). The philosophy is explicitly "fluid not rigid" — artifacts can be updated at any phase without strict gate enforcement.

At 28.6K stars with 540 commits and 34 releases, OpenSpec has significant traction. It was created in August 2025 and reached v1.2.0 by February 2026, adding profile support, Pi integration, and Kiro support. The project is primarily maintained by @TabishB (463 of 540 commits), making it effectively a solo project with community contributions.

---

## Technical Architecture

**Artifact Lifecycle:**
```
User Intent
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  proposal.md │────▶│   specs/     │────▶│  design.md   │────▶│   tasks.md   │
│              │     │  *.md        │     │              │     │              │
│  WHY this    │     │  WHAT the    │     │  HOW to      │     │  Numbered    │
│  change      │     │  system does │     │  implement   │     │  checkboxes  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │  /opsx:apply │
                                                               │  Execute     │
                                                               │  tasks       │
                                                               └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │ /opsx:archive│
                                                               │ Merge deltas │
                                                               │ to master    │
                                                               └──────────────┘
```

**Directory Structure (per-project):**
```
openspec/
├── config.yaml          # Schema selection, tech context, rules
├── specs/               # Master specs (canonical, post-archive)
│   ├── auth/spec.md
│   ├── payments/spec.md
│   └── ...
├── changes/             # Active work (one folder per change)
│   ├── add-oauth/
│   │   ├── proposal.md
│   │   ├── design.md
│   │   ├── tasks.md
│   │   └── specs/       # Delta specs (ADDED/MODIFIED/REMOVED)
│   │       ├── auth/spec.md
│   │       └── checkout/spec.md
│   └── archive/         # Completed changes (historical record)
└── explorations/        # Free-form research docs
```

**Schema System (`schemas/spec-driven/schema.yaml`):**
- Defines artifact dependency graph: `proposal` → `specs` (requires proposal) → `design` (requires proposal) → `tasks` (requires specs + design)
- Each artifact has an `instruction` field — the prompt template given to the AI assistant
- `apply` phase reads `tasks.md`, tracks checkbox completion, and executes sequentially
- Delta spec operations use explicit headers: `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`, `## RENAMED Requirements`

**Spec Format (normative):**
- Requirements use `### Requirement: <name>` headers
- SHALL/MUST for normative requirements (not should/may)
- Every requirement must have at least one scenario: `#### Scenario: <name>` with WHEN/THEN format
- Modified requirements must include full updated content (not partial diffs)

**Config System:**
- Two layers: global (`~/.config/openspec/`) + project (`openspec/config.yaml`)
- Profiles: `core` (propose/apply/archive) or `extended` (adds explore, verify, sync, etc.)
- Delivery modes: `skills` (slash commands), `commands` (CLI), or `both`
- Context injection: `config.yaml` includes `context:` field with tech stack, rules, and conventions

**Core CLI Commands:**
- `openspec init` — Initialize project with `openspec/` directory
- `openspec config profile` — Interactive profile picker
- `openspec change` — Create/manage changes
- `openspec spec` — Create/manage specs
- `openspec validate` — Validate artifact structure against schema
- `openspec show` / `openspec view` — Display change status and artifacts
- `openspec schema` — Manage schema definitions (fork, init, validate, which)

**Source Architecture (`src/`):**
```
src/
├── cli/            # Commander.js CLI entry
├── commands/       # change, completion, config, feedback, schema, show, spec, validate, workflow/
├── core/           # Business logic
│   ├── archive.ts          # Delta merge into master specs
│   ├── artifact-graph/     # Dependency resolution between artifacts
│   ├── config.ts           # Config loading and resolution
│   ├── schemas/            # Schema parsing and validation
│   ├── specs-apply.ts      # Task execution engine
│   ├── templates/          # Artifact template generation
│   ├── validation/         # Spec format validation
│   └── profiles.ts         # Core/extended profile management
├── prompts/        # Interactive prompts (searchable multi-select)
├── telemetry/      # PostHog analytics
├── ui/             # Dashboard rendering
└── utils/          # Shared utilities
```

---

## Publisher Background

**Fission AI** is a startup behind OpenSpec. The project is overwhelmingly maintained by **@TabishB** (463 of 540 commits, 85.7%). The remaining contributions come from bots (github-actions, release-bot) and a handful of community contributors (fsilvaortiz: 3, harikrishnan83: 2). This is effectively a solo project with strong execution velocity — 34 releases in 7 months, from creation (Aug 2025) to v1.2.0 (Feb 2026).

The project has notable traction: 28.6K stars, 1.9K forks, 272 open issues, 50 listed contributors. Community access is via Discord and team Slack. TabishB is active on X as @0xTab.

No public funding information found. The `.dev` domain and polished documentation suggest serious investment, but the bus factor of 1 is a risk signal for production adoption.

---

## What's Valuable for Us

1. **Delta-spec merge semantics**: The `ADDED/MODIFIED/REMOVED/RENAMED` headers with explicit merge rules (`archive.ts`) is the most formalized spec-diffing system we've seen. If we ever need structured change tracking for our orchestrator's task definitions, this is the reference implementation.

2. **Artifact dependency graph** (`core/artifact-graph/`): The schema-driven DAG that determines which artifacts can be generated based on what exists mirrors how our orchestrator could manage task decomposition dependencies deterministically.

3. **Config philosophy**: Two-layer config (global + project, no workspace layer) aligns with our "zero-infra" approach. Their explicit rejection of cascading config (citing ESLint's cautionary tale) validates our own simplicity-first decisions.

4. **Spec format as context engineering**: The structured spec format (Requirement → Scenario → WHEN/THEN) is a concrete implementation of context engineering for coding agents. This could improve how our orchestrator's task descriptions are structured when passed to coding agents.

5. **Cross-tool portability**: OpenSpec works across 20+ tools via slash commands. The `command-generation/` and `instruction-loader/` modules show how to generate tool-specific instruction formats from a single source — relevant if we ever need our orchestrator to work with multiple agent harnesses.

6. **Workspace architecture exploration** (`openspec/explorations/workspace-architecture.md`): Their deep analysis of monorepo/multi-repo spec organization, including DDD bounded contexts, protobuf patterns, and 4 candidate models, is excellent reference material for our federated architecture.

---

## What's NOT Relevant

1. **LLM-heavy spec generation conflicts with 70/30 split**: OpenSpec uses LLM calls to generate proposals, specs, designs, and tasks. In our Master Blueprint, the orchestrator layer is deterministic — it routes and manages, never generates. Adding an LLM-powered spec generation step between the orchestrator and coding agents would violate Governing Principle #2 (deterministic orchestration, LLM execution).

2. **Per-change folder approach adds coordination overhead**: Each change creates a folder with 4+ artifacts. With multiple agents working in parallel (our typical setup), this creates merge conflicts and state management complexity. Our JSON state files + tmux approach is lighter weight for parallel agent coordination.

3. **Methodology over infrastructure**: OpenSpec is a development methodology tool, not an orchestration primitive. It doesn't solve routing, health monitoring, agent lifecycle, or any of the deterministic infrastructure problems our Master Blueprint prioritizes. It's what agents use to structure their work, not what manages agents.

4. **Single-tool assumption**: OpenSpec assumes one AI assistant works on one change at a time. Our architecture spawns 2-3 parallel coding agents on different tasks. OpenSpec has no concept of agent coordination, conflict resolution, or work distribution.

5. **Telemetry concern**: PostHog telemetry is included (`posthog-node` dependency, `src/telemetry/`). For gov/DSGVO work, this would need to be audited and potentially stripped.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the delta-spec merge semantics and artifact dependency graph as reference patterns. No direct adoption needed.
- **Phase 3 (Days 60-90)**: If we formalize how our orchestrator decomposes tasks for coding agents, the proposal → specs → tasks pipeline could inform our task template format. The structured Requirement/Scenario format could improve agent instruction quality.
- **Phase 4 (Days 90+)**: If we build a multi-repo federated architecture, their workspace exploration document (`workspace-architecture.md`) with its 4 candidate models (flat root, nested specs, distributed, hybrid) is the best reference we've found for cross-repo spec organization.

---

## Key Takeaway

> **OpenSpec is the most polished implementation of spec-driven development for coding agents (28.6K stars, 20+ tool support), with genuinely novel delta-spec merge semantics and artifact dependency graphs — but it operates at the wrong layer for our architecture: it's a methodology tool for individual coding agents, not an orchestration primitive for managing them.**
