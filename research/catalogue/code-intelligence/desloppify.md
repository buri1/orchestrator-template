# Desloppify

> **Agent harness to make your slop code well-engineered and beautiful.**

| Field | Value |
|-------|-------|
| Category | 🧬 Code Intelligence |
| Repository | [peteromallet/desloppify](https://github.com/peteromallet/desloppify) |
| GitHub Stars | 2,002 (as of 2026-03-12) |
| Publisher | Peter O'Malley (@peteromallet) — solo/indie |
| License | MIT |
| Tech Stack | Python 3.11+, tree-sitter, bandit, Pillow, PyYAML |
| Maturity | 🟡 Early (v0.9.5, beta) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> *TODO — first impressions after trying it on a project.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses agent-generated code quality — the "slop problem" that compounds when agents produce code at scale. Quality gate for our agent pipeline. |
| **Novelty** | 8/10 | Anti-gaming scoring is genuinely new. Combines mechanical detection (dead code, duplication, complexity) with LLM-based subjective review (naming, abstractions, module boundaries) — no other tool in the catalogue does this hybrid approach. |
| **Actionable** | 8/10 | `pip install` + paste prompt into agent = immediate value. update-skill command supports Claude, Cursor, Codex, Copilot, Windsurf, Gemini. The "loop" pattern (scan -> next -> fix -> resolve -> next) is agent-native by design. |

---

## Overview

Desloppify is a codebase health scanner and technical debt tracker designed to be driven by AI coding agents. It identifies quality issues through two complementary detection methods: mechanical analysis (dead code, duplication, complexity, import cycles) and LLM-based subjective review (naming quality, abstraction boundaries, error handling consistency, module structure). Issues are scored, prioritized into a living plan with an execution queue, and tracked through a persistent state that survives across sessions.

The core workflow is a tight loop: `scan` the codebase, review the plan, execute `next` to get the highest-priority fix, resolve it, repeat. The scoring system is explicitly designed to resist gaming — improving the number requires genuinely making the code better, not just suppressing warnings or hitting lint thresholds. A "strict score" above 98 should correlate with code that a seasoned engineer would consider beautiful.

The tool supports 28 languages with full plugin depth for TypeScript, Python, C#, Dart, GDScript, and Go, plus generic linter + tree-sitter support for 22 more. It ships as a PyPI package with optional extras (tree-sitter, bandit security scanning, scorecard badge generation, YAML plan export).

---

## Technical Architecture

```
desloppify/
├── engine/                 # Core analysis engine
│   ├── detectors/          # Mechanical issue detectors (dead code, duplication, complexity)
│   ├── planning/           # Plan generation and queue management
│   ├── policy/             # Scoring policies and anti-gaming rules
│   ├── _concerns/          # Issue classification and tracking
│   ├── _plan/              # Plan state management
│   ├── _scoring/           # Score calculation with anti-gaming
│   ├── _state/             # Persistent state across sessions
│   ├── _work_queue/        # Execution queue (the "next" command)
│   ├── hook_registry.py    # Plugin hooks for language-specific detectors
│   ├── plan_ops.py         # Plan manipulation operations
│   ├── plan_queue.py       # Priority queue for execution
│   ├── plan_state.py       # Plan persistence
│   ├── plan_triage.py      # Automated triage with subagent runners
│   └── scoring.py          # Core scoring engine
├── intelligence/           # LLM-powered analysis
│   ├── integrity.py        # Anti-gaming integrity checks
│   ├── narrative/          # Natural language issue descriptions
│   └── review/             # Subjective LLM review (naming, abstractions, boundaries)
├── languages/              # 28 language plugins
├── app/                    # Web/API layer
├── state.py                # Global state management
├── state_io.py             # State serialization/persistence
├── state_scoring.py        # Score state tracking
└── cli.py                  # CLI entry point
```

Key architectural decisions:
- **Persistent state**: Issues, scores, and plan survive across sessions. The agent chips away over time rather than needing to rescan from scratch.
- **Anti-gaming scoring**: The `intelligence/integrity.py` module ensures score improvements correspond to genuine quality gains, not metric manipulation.
- **Agent-native AGENTS.md**: Ships an AGENTS.md file with full skill definition, allowed tools, and 3-phase workflow (scan/plan/execute). Agents can self-onboard.
- **Subagent triage**: `plan triage --run-stages --runner claude` orchestrates multi-stage analysis (observe, reflect, organize, complete) using the host agent as a subagent runner.
- **Language plugins via hook_registry**: Each language registers detectors through a hook system, enabling tree-sitter AST analysis where available and generic linting as fallback.

---

## Publisher Background

**Peter O'Malley** (@peteromallet) is an indie developer with 34 public repos, 202 followers. His other notable project is **dataclaw** (1.9K stars, 232 forks), suggesting experience building developer tools. Email domain is `banodoco.ai`, indicating involvement in an AI company. Active development: 636 commits on main, v0.9.5 released March 11, 2026, pushed to less than 24 hours before analysis. 94 open issues suggest rapid community adoption outpacing resolution.

---

## What's Valuable for Us

1. **Agent quality gate for our pipeline**: After agents generate code, run `desloppify scan` + `desloppify next` as a quality loop. This is a concrete implementation of the back-pressure pattern (Huntley thesis) applied specifically to agent-generated code quality.

2. **Anti-gaming scoring methodology**: Our agents could game lint scores. Desloppify's `intelligence/integrity.py` approach to resistant scoring is a pattern we should study for any quality metric we expose to agents.

3. **The "loop" pattern**: `next -> fix -> resolve -> next` is structurally identical to our orchestrator's task queue. The execution queue with persistent state across sessions maps to our `_bmad/orchestrator-state.json` pattern.

4. **Subagent triage architecture**: The `plan triage --run-stages --runner claude` command orchestrates multi-stage analysis using the agent itself as the execution runtime. This is a clean pattern for agent-driven multi-phase analysis without spawning separate processes.

5. **AGENTS.md skill definition**: The repo's AGENTS.md is one of the best examples of the convention — complete with allowed-tools restriction (`Bash(desloppify *)`), phased workflow, and detailed agent instructions. Study as a reference for our own agent skill definitions.

6. **Hybrid mechanical + LLM detection**: The split between deterministic detectors (engine/detectors/) and LLM-based review (intelligence/review/) mirrors our 70/30 deterministic/LLM principle. Mechanical detection handles what rules can catch; LLM handles subjective quality (naming, abstractions, boundaries).

---

## What's NOT Relevant

- **Python-only runtime**: We're TypeScript-native. Cannot embed desloppify into our orchestrator pipeline natively — must shell out to it as a CLI tool.
- **Scorecard badge generation**: Vanity metric for READMEs. Not relevant to our production quality pipeline.
- **"Vibe engineering" community/branding**: Marketing framing. The tool's technical design is what matters.
- **Web app layer** (`desloppify/app/`): We don't need a web UI for code quality. CLI integration only.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Not applicable — we're past this.
- **Phase 2 (Days 4-60)**: Install today. Add `desloppify scan` + quality loop to agent post-commit hooks. Use as back-pressure signal in the orchestrator — if strict score drops, the agent that caused the regression gets a remediation task.
- **Phase 3 (Days 60-90)**: Integrate score tracking into our observability pipeline (Langfuse traces). Track quality scores per agent, per business line. Use as one input to agent performance evaluation.
- **Phase 4 (Days 90+)**: Study anti-gaming scoring methodology for our own quality metrics. Build similar resistant scoring for non-code domains (marketing copy quality, financial report accuracy).

---

## Deep Dive Candidates

| URL | Context | Suggested Type |
|-----|---------|---------------|
| https://github.com/peteromallet/dataclaw | Author's other major project (1.9K stars); may reveal patterns in their tool-building approach | tool |
| https://discord.gg/aZdzbZrHaY | Desloppify community Discord — potential source of workflow patterns and agent integration examples | community |
| https://pypi.org/project/desloppify/ | PyPI package page — check download counts for adoption signal | reference |

---

## Key Takeaway

> **Desloppify is the first tool purpose-built to close the quality loop on agent-generated code, combining mechanical detection with LLM-based subjective review and anti-gaming scoring — install it as a back-pressure gate in any agent coding pipeline.**
