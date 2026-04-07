# AI Agent Workflow Orchestration Guidelines

> **OmerFarukOruc — GitHub Gist, undated**

| Field | Value |
|-------|-------|
| Source | [GitHub Gist](https://gist.github.com/OmerFarukOruc/a02a5883e27b5b52ce740cadae0e4d60) |
| Author | OmerFarukOruc |
| Publication | GitHub Gist |
| Date | undated |
| Topics | claude.md, agent guidelines, workflow orchestration, AI coding agents, task management, error handling, engineering best practices |
| Read Time | 12 min |

---

## Burak's Notes

> *Community CLAUDE.md template — comprehensive but generic. Useful as a reference checklist for what a well-structured agent instruction set should cover. Compare against our existing orchestrator CLAUDE.md and agent persona files.*

---

## Key Takeaways

1. **Plan Mode as Default for Non-Trivial Work** — Any task with 3+ steps, multi-file changes, or architectural decisions should enter explicit plan mode first with verification steps built in, not as an afterthought. Aligns with our spec-first philosophy.

2. **Subagent Strategy with Focused Objectives** — Each subagent should get one focused objective with a concrete deliverable ("Find where X is implemented and list files + key functions" over "look around"). Outputs are merged into actionable synthesis before coding begins.

3. **Self-Improvement Loop via `tasks/lessons.md`** — After any correction or discovered mistake, the agent captures the failure mode, detection signal, and prevention rule. This file is reviewed at session start and before major refactors — a lightweight form of persistent agent memory.

4. **Stop-the-Line Error Handling** — When anything unexpected happens (test failures, build errors, regressions), the agent must stop adding features, preserve evidence, and return to diagnosis. Directly mirrors our E2E gate philosophy.

5. **File-Based Task Management as Audit Trail** — Using `tasks/todo.md` as the canonical tracking mechanism with acceptance criteria, checkpoint notes, and results sections provides auditability without external tooling.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Covers AI coding agent guidelines — directly in our space but at a generic/introductory level. No novel patterns beyond what established references (12 Factor Agents, Huntley corpus, Anthropic context engineering) already cover more deeply. |
| **Actionable** | 5/10 | Useful as a checklist/template for bootstrapping new agent instruction sets. The `tasks/lessons.md` self-improvement loop and stop-the-line pattern are concrete. However, most patterns are already implemented in our system or covered by higher-rated catalogue entries. |

---

## Summary

This gist presents a comprehensive `claude.md` template — a set of rules and guidelines for how an AI coding agent should plan, execute, verify, communicate, and recover when working in a real codebase. It is structured around seven core workflow sections: Operating Principles, Workflow Orchestration, Task Management, Communication Guidelines, Context Management, Error Handling, and Engineering Best Practices.

The Operating Principles establish a "correctness over cleverness" philosophy with emphasis on minimal changes, leveraging existing patterns, proving work via verification, and being explicit about uncertainty. These map well to established agent engineering wisdom but don't introduce novel framing.

The Workflow Orchestration section is the most substantive, covering plan-mode defaults, subagent parallelization strategy, incremental delivery via thin vertical slices, a self-improvement loop (`tasks/lessons.md`), verification gates before completion, and balanced elegance. The subagent guidance is practical: one focused objective per subagent, concrete deliverables, and synthesis before coding.

The Error Handling section introduces a "stop-the-line" rule (borrowed from Toyota lean manufacturing) and a six-step triage checklist (reproduce, localize, reduce, fix, guard, verify). The rollback strategy section recommends feature flags and disabled-by-default shipping for uncertain changes.

The document also includes template sections for plan mode and bugfix workflows that could be directly adopted as agent prompts. Overall, it is a well-organized community reference that synthesizes established patterns into a single usable template, though it does not push the frontier beyond what the existing catalogue already covers.

---

## Notable Quotes

> "Correctness over cleverness: Prefer boring, readable solutions that are easy to maintain."

> "Give each subagent one focused objective and a concrete deliverable: 'Find where X is implemented and list files + key functions' beats 'look around.'"

> "Would a staff engineer approve this diff and the verification story?"

> "If anything unexpected happens (test failures, build errors, behavior regressions): stop adding features, preserve evidence, return to diagnosis and re-plan."

---

## Deep Dive Candidates

*No external URLs referenced in this gist — it is a self-contained template document.*

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| — | — | — |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Feature flags | Recommended for incremental delivery and safe rollback | N/A (pattern, not tool) |
| `tasks/lessons.md` | Self-improvement loop — agent captures failure modes, detection signals, prevention rules | N/A (file convention) |
| `tasks/todo.md` | File-based task management with acceptance criteria and checkpoint notes | N/A (file convention) |

---

## Action Items

- [ ] Compare this template's sections against our existing CLAUDE.md and agent persona files to identify any gaps in our own instruction sets
- [ ] Consider adopting the `tasks/lessons.md` self-improvement loop pattern if not already present in our agent workflows
- [ ] Evaluate the bugfix template as a standard format for agent bug report handling
