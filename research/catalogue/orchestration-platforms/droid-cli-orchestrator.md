# Droid CLI Orchestrator

> **An intelligent AI orchestration system for coordinating specialized droids to accomplish complex development tasks.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [aeitroc/Droid-CLI-Orchestrator](https://github.com/aeitroc/Droid-CLI-Orchestrator) |
| GitHub Stars | 351 (as of 2026-03-09) |
| Publisher | Besi S (aeitroc / Masteralb) — solo developer |
| License | MIT |
| Tech Stack | Shell (100%); Markdown-based droid definitions; JSON config; "Factory CLI" runtime |
| Maturity | 🟡 Early (created 2025-10-16, last pushed 2025-10-19; 9 commits total; homepage factory.ai) |
| Last Analyzed | 2026-03-09 |

### Star History

| Period | Stars | Cumulative |
|--------|-------|-----------|
| 2025-10 (launch) | +122 | 122 |
| 2025-11 | +81 | 203 |
| 2025-12 | +64 | 267 |
| 2026-01 | +42 | 309 |
| 2026-02 | +31 | 340 |
| 2026-03 (partial) | +11 | 351 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Solves the same problem space (multi-agent coordination for software development) but from a fundamentally different angle: prompt-engineering-only with zero actual orchestration code. No tmux, no worktrees, no state machine, no deterministic routing. It's closer to a curated collection of role-play system prompts + JSON task patterns than a real orchestrator. The "Factory CLI" runtime it depends on is not open-source. |
| **Novelty** | 4/10 | The 104-droid specialist library is the only genuinely novel contribution -- having pre-written personas for 104+ development roles (from backend-architect to seo-snippet-hunter) is a useful pattern library. The memory system (success_patterns.json, failure_patterns.json, learning_metrics.json) is an interesting self-improvement concept but the JSON files are static templates, not runtime-learned. Everything else (task planning, phased execution, quality gates) is standard prompt engineering we already do. |
| **Actionable** | 3/10 | Limited direct utility. The droid persona library could serve as reference when writing new agent definitions, and the task-patterns.json execution templates (full-stack-feature, bug-fix, performance-optimization with phased droid assignment) are a clean schema for pre-defined workflows. But there's no executable code to adapt -- it's all Markdown and JSON configuration for the proprietary Factory CLI. |

---

## Overview

Droid CLI Orchestrator is a pure prompt-engineering orchestration system that coordinates "droids" (specialized AI agent personas defined as Markdown files) to accomplish complex development tasks. It runs on top of "Factory CLI" (factory.ai), a proprietary runtime that provides the actual agent execution infrastructure. The open-source repo contains only the configuration layer: 104 droid definitions, orchestrator prompts, task pattern templates, and quality gate documentation.

The system works by copying droid definitions and orchestrator config into a project directory, then invoking `@orchestrator` within Factory CLI. The orchestrator droid analyzes the project (auto-detecting tech stack from package.json, requirements.txt, etc.), creates a phased execution plan, selects specialist droids based on expertise rankings, and delegates work using Factory's `Task` tool for parallel execution. It claims to learn from project outcomes via a memory system that stores success/failure patterns in JSON files.

The architecture is notable for its ambition (104 specialist roles, adaptive execution strategies, proactive problem solving, continuous learning) versus its implementation reality (9 total commits, all Shell/Markdown, no actual orchestration code). The documentation describes many features ("Real-time bottleneck detection," "Dynamic scheduling," "Auto-diagnoses execution failures") that are aspirational rather than implemented -- they depend entirely on the LLM's ability to follow the orchestrator prompt instructions. The "how-orchestrator-actually-works.md" file candidly admits that documented commands like `@orchestrator run-verification` were "conceptual architecture" showing what an ideal system "could have."

---

## Technical Architecture

### Core Components

```
~/.factory/
├── droids/                    # 104 specialist Markdown personas
│   ├── orchestrator.md        # Master coordinator (Claude Sonnet 4.5)
│   ├── backend-architect.md   # Backend design specialist
│   ├── frontend-developer.md  # Frontend specialist
│   ├── security-auditor.md    # Security review
│   └── ... (100+ more)
├── orchestrator/
│   ├── orchestrator-config.json   # Quality gates, timeouts, governance
│   ├── task-patterns.json         # Pre-defined execution templates
│   ├── context-manager.md         # Context management strategies
│   ├── memory/
│   │   ├── success_patterns.json  # Learned success patterns
│   │   ├── failure_patterns.json  # Anti-patterns to avoid
│   │   ├── project_templates.json # Starter templates
│   │   └── learning_metrics.json  # Performance tracking
│   └── *.md                       # Documentation for various subsystems
├── commands/
│   └── orchestrator.md        # Smart orchestrator command definition
├── docs/                      # User guides and references
├── bin/                       # Utility scripts (verify/fix droids)
└── tasks/                     # Per-project task tracking
    ├── backend/DD-MM-YYYY/project/
    ├── frontend/DD-MM-YYYY/project/
    └── general/DD-MM-YYYY/project/
```

### Execution Flow

1. **Project Analysis**: Orchestrator scans for package.json, requirements.txt, Dockerfile, etc.
2. **Pattern Matching**: Matches request against task-patterns.json templates (full-stack-feature, bug-fix, etc.)
3. **Droid Selection**: Ranks specialists by expertise, success history, and project characteristics
4. **Phased Delegation**: Uses Factory CLI's `Task` tool to spawn parallel specialist droids
5. **Quality Gates**: Checks defined in orchestrator-config.json (security review required for auth/payment, etc.)
6. **Memory Update**: Stores outcomes in success/failure pattern files

### Key Design Decisions

- **No code**: Entire system is Markdown prompts + JSON config. Zero executable orchestration logic.
- **Proprietary runtime**: Depends on "Factory CLI" (factory.ai) for actual execution -- this is not open-source.
- **Prompt-as-orchestrator**: The orchestrator.md droid definition IS the orchestrator -- all planning, delegation, and coordination happens via LLM prompt following.
- **Task documentation**: Each task creates research.md, plan.md, files-edited.md, verification.md -- a structured paper trail.

---

## Publisher Background

**Besi S** (GitHub: aeitroc, Twitter: @aeitroc) operates as "Masteralb" from Tirana, Albania. Self-described as "a coder for fun" with 16 public repositories and 29 followers. The repo has a single contributor (aeitroc) with 9 commits, all pushed within a 3-day window (2025-10-16 to 2025-10-19). No subsequent development activity despite 351 stars. The homepage links to factory.ai, which appears to be the proprietary Factory CLI product.

The rapid star accumulation (122 stars in the first 2 weeks) relative to the repo's content (9 commits of Markdown/Shell) suggests potential promotional activity or community interest driven by the Factory CLI brand rather than the open-source content itself. Stars have been declining month-over-month since launch.

---

## What's Valuable for Us

### 1. 104-Droid Specialist Library (Reference Only)

The collection of 104 role-specific Markdown personas is a comprehensive taxonomy of development specializations. While we don't use this format, the categorization is useful as a reference when designing new agent roles:

- **Specialized security roles**: backend-security-coder, frontend-security-coder, mobile-security-coder, blue-team-specialist, red-team-specialist
- **SEO-specific agents**: 10 separate SEO roles (keyword-strategist, content-auditor, snippet-hunter, cannibalization-detector, etc.)
- **Language-specific experts**: Per-language pros (python-pro, rust-pro, golang-pro, etc.) alongside language experts (python-expert, rust-expert, etc.)

### 2. Task Patterns Schema

The `task-patterns.json` defines pre-configured execution templates with explicit phases, droid assignments, parallel/sequential flags, dependencies, and expected outputs. This is a clean declarative schema for workflow templates:

```json
{
  "id": "full-stack-feature",
  "phases": [
    { "id": "phase-1", "parallel": false, "droids": ["backend-architect"] },
    { "id": "phase-2", "parallel": false, "droids": ["security-auditor"], "dependencies": ["phase-1"] },
    { "id": "phase-3", "parallel": true, "droids": ["backend-typescript-architect", "frontend-developer"], "dependencies": ["phase-2"] }
  ]
}
```

We could adapt this pattern for defining reusable orchestration templates in our system.

### 3. Memory System Concept

The 4-file memory system (success_patterns, failure_patterns, project_templates, learning_metrics) with explicit read-at-start/update-at-end lifecycle is a simple but useful pattern for agent self-improvement. The concept of tracking success rates per architectural pattern and cross-referencing failure modes is worth studying.

### 4. Quality Gate Configuration

The orchestrator-config.json encodes domain-specific quality requirements:
- Security review mandatory for authentication, payment, and sensitive data tasks
- Performance review mandatory for payment, API refactoring, and performance-critical tasks
- Minimum code review for all tasks

This declarative quality gate approach is compatible with our E2E testing gate philosophy.

---

## What's NOT Relevant

### 1. No Actual Orchestration Code

The fundamental limitation: there is zero executable orchestration logic. No state machine, no event-driven waiting, no structured agent lifecycle management. Everything depends on the LLM's ability to follow Markdown instructions. This violates our Governing Principle #2 (deterministic routing for 70% of operations). Our L-Thread Orchestrator has actual tmux management scripts, state files, and event-driven patterns -- Droid CLI Orchestrator has none of this.

### 2. Proprietary Runtime Dependency

The system requires "Factory CLI" (factory.ai) to function. Without it, the droid definitions are inert Markdown files. This makes the open-source repo essentially documentation for a proprietary product, not a standalone tool.

### 3. No Worktree Isolation

Like NTM, there is no git worktree-per-agent isolation. Multiple droids work in the same directory, relying entirely on the LLM to avoid file conflicts. Our architecture requires worktree isolation as infrastructure (Master Blueprint Layer 3).

### 4. LLM-Heavy Orchestration (0/100 Split)

Where our architecture targets 70/30 deterministic/LLM, Droid CLI Orchestrator is effectively 0/100 -- all orchestration decisions are LLM-driven. Planning, scheduling, error recovery, quality gates, context management -- all prompt-instructed, none deterministic. This creates brittleness: if the LLM ignores or misinterprets the orchestrator prompt, there's no fallback.

### 5. Stale Development

9 commits over 3 days, then no activity for 5 months despite 351 stars. No issues resolved (4 open). This suggests the project may be abandoned or that active development happens in the proprietary Factory CLI rather than the open-source layer.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: No adoption path. The system depends on proprietary infrastructure we don't use.
- **Phase 2 (Days 4-60)**: Reference the 104-droid taxonomy when designing new agent roles. Study task-patterns.json schema for reusable workflow templates if we build a template system.
- **Phase 3 (Days 60-90)**: The memory system concept (success/failure pattern tracking with explicit lifecycle) could inform our agent learning infrastructure if we add self-improvement capabilities.
- **Phase 4 (Days 90+)**: No long-term relevance. The approach is architecturally opposite to our deterministic-first design.

---

## Key Takeaway

> **Droid CLI Orchestrator is a 104-persona prompt library for a proprietary runtime, not a true orchestration system -- it validates the multi-agent coordinator concept and provides a useful specialist role taxonomy, but its 0/100 LLM-heavy approach with zero executable orchestration code, proprietary Factory CLI dependency, and stale development (9 commits, then abandoned) make it a reference-only entry with limited actionable value.**
