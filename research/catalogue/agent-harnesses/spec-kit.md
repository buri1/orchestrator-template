# Spec Kit (Specify CLI)

> **Toolkit to help you get started with Spec-Driven Development**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github/spec-kit](https://github.com/github/spec-kit) |
| GitHub Stars | 75,010 (as of 2026-03-08) |
| Publisher | GitHub (bigtech) — lead dev Den Delimarsky (now at Anthropic) |
| License | MIT |
| Tech Stack | Python 3.11+ (Typer, Click, Rich, httpx), Markdown templates, bash/PowerShell scripts |
| Maturity | 🟢 Production (v0.1.13, 584 commits, 20+ agent integrations) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *GitHub's official take on spec-first development. 75K stars is insane traction. The core idea — specs generate code, not the other way around — is philosophically aligned with our CLAUDE.md / AGENTS.md prompt-engineering approach, but they go much further with a structured artifact pipeline (constitution → spec → plan → tasks → implement). The extension system is interesting for ecosystem play. Lead dev now at Anthropic, so expect this methodology to bleed into Claude Code natively. Worth studying the template engineering closely — their `/speckit.specify` constraint patterns (max 3 clarification markers, informed defaults over questions) are immediately stealable for our agent prompts.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Strong alignment on structured agent coordination via artifacts, but focuses on spec-to-code pipeline while we focus on multi-agent orchestration. Template engineering patterns are directly transferable. |
| **Novelty** | 6/10 | Validates our prompt-engineering-as-architecture approach with vastly more polish. The "constitution" concept maps to our CLAUDE.md. Extension system and multi-agent support (20+ agents) are new angles. |
| **Actionable** | 7/10 | Template patterns (clarification limits, checklist gates, phase enforcement) are adoptable this week. The constitutional articles pattern is worth studying for our agent definitions. |

---

## Overview

Spec Kit is GitHub's official framework for "Spec-Driven Development" (SDD) — a methodology that inverts the traditional development hierarchy by making specifications the primary artifact and code their generated expression. Instead of specs serving as advisory documentation, SDD treats them as executable sources that directly produce working implementations through AI agents.

The toolkit ships as a Python CLI (`specify`) that bootstraps projects with structured templates, slash commands, and a constitutional framework. It supports 20+ AI coding agents (Claude Code, Copilot, Cursor, Gemini, Codex, Windsurf, etc.) through a centralized `AGENT_CONFIG` system. The workflow follows a strict pipeline: constitution → specify → plan → tasks → implement, with quality gates at each stage.

What makes it architecturally interesting is the separation of concerns: specifications define WHAT and WHY (business context), while implementation plans and task breakdowns handle HOW (technical context). This mirrors our Master Blueprint's Governing Principle #3 (context is zero-sum) — business context stays out of coding agents. The extension system adds a plugin ecosystem with lifecycle hooks (`after_tasks`, `after_implement`, `before_commit`, `after_commit`) enabling third-party workflow augmentation.

---

## Technical Architecture

### Core Pipeline

```
Constitution (principles)
    ↓
/speckit.specify → spec.md (requirements, user stories, acceptance criteria)
    ↓
/speckit.plan → plan.md + data-model.md + contracts/ + research.md
    ↓
/speckit.tasks → tasks.md (phases, dependencies, [P] parallel markers)
    ↓
/speckit.implement → code (phase-by-phase, test-first, progress tracking)
    ↓
/speckit.checklist → quality validation
/speckit.analyze → cross-artifact consistency check
/speckit.clarify → resolve ambiguities
```

### Key Abstractions

- **Constitution** (`memory/constitution.md`): 9 articles defining architectural DNA — Library-First, CLI Mandate, Test-First Imperative, Simplicity Constraint, Anti-Abstraction, Integration-First Testing. Enforced through Phase -1 gates in plan templates.
- **AGENT_CONFIG** (`src/specify_cli/__init__.py`): Centralized dict mapping 17+ agents to their folder structures, command subdirectories, CLI requirements, and install URLs.
- **Extension System** (`.specify/extensions/`): YAML manifests (`extension.yml`), lifecycle hooks via `HookExecutor`, config cascade (extension defaults → project → local → env vars), CLI management (`specify extension add/remove/search`).
- **Task Parallelization**: Tasks marked `[P]` can execute concurrently. File-based coordination ensures tasks affecting the same files remain sequential. Sequential task failure halts; parallel task failure doesn't block others.

### File Structure (initialized project)

```
.specify/
  memory/constitution.md
  scripts/              # bash + PowerShell helpers
  extensions.yml        # installed extensions config
  extensions/           # extension directories
specs/
  {branch-name}/
    spec.md             # feature specification
    plan.md             # implementation plan
    data-model.md       # entity definitions
    contracts/          # API contracts
    research.md         # tech option analysis
    tasks.md            # executable task list
    checklists/         # quality validation
.claude/commands/       # (or agent-specific dir)
  speckit.specify.md
  speckit.plan.md
  speckit.tasks.md
  speckit.implement.md
  ...
```

### Template Engineering Patterns

The templates enforce several constraint patterns worth studying:

1. **Clarification Ceiling**: Max 3 `[NEEDS CLARIFICATION]` markers per spec — forces informed defaults over excessive questioning.
2. **Validation Loop Cap**: Max 3 iterations on checklist validation before documenting remaining issues.
3. **Phase -1 Gates**: Constitution articles enforced as pre-implementation gates (simplicity, anti-abstraction, integration-first) with required pass-or-justify documentation.
4. **Test-First Ordering**: File creation order enforces contracts → tests → implementation, making LLMs "think about testability before implementation."
5. **Speculative Feature Prevention**: Every feature must trace to concrete user stories with acceptance criteria.

---

## Publisher Background

**GitHub** (Microsoft subsidiary) — the dominant code hosting platform. This is GitHub's official, first-party framework for structured AI-assisted development.

**Lead Developer**: Den Delimarsky ([@localden](https://github.com/localden)) — 361 of 584 commits (62%). Previously at Microsoft/GitHub, now Member of Technical Staff at Anthropic. Maintains [den.dev](https://den.dev). His move to Anthropic suggests SDD methodology may influence Claude Code's roadmap.

**Other Contributors**: mnriem (22 commits), tinesoft (9), ahmet-cetinkaya (8), isdaniel (8). Community-driven with 6,397 forks and 638 open issues.

**Credibility**: Very high. GitHub's backing + MIT license + massive adoption (75K stars) + active development (last push 2026-03-05) + comprehensive documentation + extension ecosystem.

---

## What's Valuable for Us

### 1. Constitutional Framework Pattern
Their 9-article constitution (`memory/constitution.md`) is the most structured approach to constraining agent behavior we've seen. Our CLAUDE.md serves a similar purpose but is less formalized. Worth studying:
- **Article III (Test-First Imperative)**: Marked NON-NEGOTIABLE — tests must exist and FAIL before implementation. Directly maps to our E2E gate rule.
- **Article VIII (Anti-Abstraction)**: "Use framework features directly rather than wrapping them." Prevents over-engineering.
- **Phase -1 Gates**: Constitutional articles enforced through template structure, not post-hoc review.

### 2. Template Constraint Engineering
Their `/speckit.specify` template's patterns are immediately stealable for our agent `.md` definitions:
- Max 3 clarification markers (prevents agent question-loops)
- Informed defaults over asking (reduces human interrupt load — aligns with Principle #5)
- Checklist-based quality gates with iteration caps
- Persona injection ("think like a tester") for specification drafting

### 3. Task Parallelization Markers
The `[P]` marker system in `tasks.md` for parallel-safe tasks with file-based conflict detection is a clean pattern. We could adopt this in our orchestrator state to identify which agent tasks can run concurrently vs. must serialize.

### 4. Extension Lifecycle Hooks
The 4-hook system (`after_tasks`, `after_implement`, `before_commit`, `after_commit`) with conditional execution is a clean plugin architecture. Relevant when we build our harness's hook system.

### 5. Multi-Agent Configuration Registry
The `AGENT_CONFIG` dictionary pattern — centralizing agent folder paths, command subdirectories, and CLI requirements — is a useful reference for our federated harness configuration.

---

## What's NOT Relevant

### 1. Spec-First vs. Orchestration-First
Spec Kit assumes a single-developer, single-agent workflow: one person writes specs, one agent implements. It has no concept of multi-agent coordination, agent-to-agent communication, or orchestration. Our system is fundamentally about coordinating multiple agents on shared codebases. **Principle #1**: The orchestration layer is the compounding asset, not the specification pipeline.

### 2. Python CLI Dependency
The `specify` CLI is Python-based (Typer/Click). Our stack is pure prompt engineering + shell + JSON state. We don't need another CLI runtime — we need the *patterns* from their templates, not the tool itself.

### 3. No State Management
Spec Kit has no concept of agent state, session persistence, health monitoring, or recovery. Specifications are files in git, not state machines. Our orchestrator needs durable state (Principle #2: deterministic orchestration).

### 4. No Federated Architecture
Everything runs in a single project context. No support for multiple business lines, compliance isolation, or cross-project visibility. Conflicts with **Principle #6** (federated systems, thin meta-layer).

### 5. LLM-Heavy Routing
The specification → implementation pipeline relies heavily on LLM judgment for what to build and how. Our architecture mandates **70/30 deterministic/LLM split** (Principle #2) — routing and state are deterministic, only code writing is LLM.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Steal template constraint patterns (clarification limits, checklist gates, persona injection) for improving our `.claude/agents/*.md` definitions. Study their constitutional framework for formalizing our CLAUDE.md rules.

- **Phase 2 (Days 4-60)**: Adopt `[P]` parallelization markers in task decomposition for our orchestrator. Consider constitutional articles as a formal governance layer for agent behavior across business lines.

- **Phase 3 (Days 60-90)**: If building a proper harness, the extension system's lifecycle hooks (`after_tasks`, `after_implement`, `before_commit`, `after_commit`) are a good reference for plugin architecture.

- **Phase 4 (Days 90+)**: If spec-driven development becomes standard (given 75K stars and GitHub backing, it might), consider integrating the SDD pipeline as a pre-orchestration phase — specs feed into our orchestrator's task decomposition rather than going directly to agents.

---

## Key Takeaway

> **Spec Kit is GitHub's polished answer to "how do you structure AI-agent work" — its constitutional framework and template constraint engineering are immediately stealable patterns, but the tool itself solves a different problem (single-agent spec-to-code) than ours (multi-agent orchestration).**
