# pi-foreground-chains

> **Multi-agent workflow orchestration skill for Pi — sequential Scout-Planner-Worker-Reviewer chains with file-based handoff, observable execution, and auto-continue support.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses / Pi Extensions |
| Repository | [nicobailon/pi-foreground-chains](https://github.com/nicobailon/pi-foreground-chains) |
| GitHub Stars | 27 (as of 2026-03-08) |
| Publisher | nicobailon (community contributor, solo) |
| License | MIT (stated in README) |
| Tech Stack | Markdown (Skill file), depends on pi-interactive-shell |
| Maturity | 🟡 Early (single-commit skill, minimal codebase) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | The Scout-Planner-Worker-Reviewer chain maps to task decomposition patterns we need. File-based handoff is a proven deterministic pattern. Observable execution aligns with our E2E testing requirements. |
| **Novelty** | 5/10 | Sequential agent chains are well-documented in our research. The innovation is packaging it as a Pi skill with file-based handoff, not the concept itself. |
| **Actionable** | 6/10 | Simple installation (one SKILL.md file), but depends on pi-interactive-shell. The chain concept is immediately adaptable even without the specific skill. |

---

## Overview

pi-foreground-chains is a Pi skill (not a TypeScript extension) that teaches Pi how to orchestrate sequential multi-agent workflows. It implements a Scout-Planner-Worker-Reviewer pipeline where each step runs in a "hands-free overlay" (provided by pi-interactive-shell), allowing users to monitor execution in real-time and intervene at any point.

The chain operates through file-based handoff: each agent writes its output to a markdown file (context.md, plan.md, impl.md) that becomes the input for the next agent in the chain. A progress.md file maintains the complete workflow history. The `/chain` command separates steps with `->` delimiters, and each step can have its own task description.

This is notable as a **pure prompt engineering solution** — the entire implementation is a single SKILL.md file that teaches Pi the chain workflow via natural language instructions, with no TypeScript code. The skill leverages pi-interactive-shell's hands-free mode for the actual agent execution.

---

## Technical Architecture

```
/chain "scan auth module" -> "plan refactor" -> "implement" -> "review"
    │
    ├── Step 1: Scout
    │   ├── Runs in hands-free overlay
    │   ├── Outputs: context.md (codebase analysis)
    │   └── Auto-continues past prompts
    │
    ├── Step 2: Planner
    │   ├── Reads: context.md
    │   ├── Outputs: plan.md (implementation plan)
    │   └── Auto-continues past prompts
    │
    ├── Step 3: Worker
    │   ├── Reads: plan.md
    │   ├── Outputs: impl.md (implementation)
    │   └── Auto-continues past prompts
    │
    └── Step 4: Reviewer
        ├── Reads: impl.md + context.md
        ├── Validates results, fixes issues
        └── Outputs: review notes in progress.md

Handoff files: context.md, plan.md, impl.md, progress.md
Execution: pi-interactive-shell (hands-free mode)
```

**Key Design Decisions:**
- **File-based handoff:** Deterministic context passing via markdown files. No message bus, no shared memory — just files. Aligns with the 70/30 split (file I/O is deterministic).
- **Observable by default:** Every step runs in a visible overlay. The user sees exactly what each agent does. No black-box execution.
- **Auto-continue:** Automatically advances agents past confirmation prompts ("Do you want to proceed?"), enabling unattended execution.
- **User takeover:** User can interrupt at any point and take manual control of the current step.

**Dependency:** Requires pi-interactive-shell for the hands-free overlay execution.

---

## Publisher Background

nicobailon (also behind pi-mcp-adapter, pi-interactive-shell, pi-web-access, pi-subagents) is one of the most prolific Pi extension developers. This skill has 27 stars despite being a single-file implementation — the concept resonates. The minimal implementation (one SKILL.md file) is consistent with Pi's philosophy of prompt engineering over code engineering.

---

## What's Valuable for Us

1. **File-Based Handoff Pattern:** context.md → plan.md → impl.md is a clean, debuggable, deterministic chain handoff. We can inspect any intermediate state. This is superior to in-memory message passing for our use case where auditability matters.

2. **Observable Execution:** Every step runs visually in the terminal. Critical for our E2E testing gate (INC-014, INC-015) — we can watch each agent step and verify correctness.

3. **Pure Prompt Engineering:** The entire implementation is a SKILL.md file — no TypeScript, no build step, no dependencies beyond pi-interactive-shell. Validates that sophisticated agent workflows can be pure prompt engineering, aligning with our L-Thread approach.

4. **Role-Based Chain:** Scout-Planner-Worker-Reviewer is a proven decomposition. Maps to our pattern of separating analysis from implementation from validation.

5. **Auto-Continue:** Eliminates the most common blocker in agent workflows — agents stopping to ask for confirmation. Deterministic forwarding.

---

## What's NOT Relevant

| Concern | Details |
|---------|---------|
| **Sequential only** | Chains are strictly sequential. No parallel execution within a chain. For parallel work, combine with pi-side-agents. |
| **pi-interactive-shell dependency** | Requires pi-interactive-shell installed. This is a hard dependency — the skill is useless without it. |
| **Single-commit repo** | Only 1 commit. No iteration, no bug fixes, no refinement. The concept is solid but the implementation may need polishing. |
| **No error recovery** | If a step fails, the chain stops. No retry logic, no rollback, no alternative path. Our orchestrator needs robust error handling. |

---

## Future Use Cases

- **Phase 2 (Days 4-60):** Adapt the file-based handoff pattern for our Claude Code orchestrator. We can implement context.md → plan.md → impl.md chains without Pi using our existing agent spawning.
- **Phase 3 (Days 60-90):** Use directly as our standard workflow template for feature implementation tasks. Scout-Planner-Worker-Reviewer is our baseline decomposition pattern.
- **Phase 4 (Days 90+):** Extend with parallel execution (fan-out at Worker step) and error recovery (retry failed steps, alternative paths). Potentially combine with pi-agent-teams for dependency-aware chains.

---

## Key Takeaway

> **pi-foreground-chains demonstrates that sophisticated multi-agent orchestration (Scout-Planner-Worker-Reviewer with file-based handoff) can be pure prompt engineering in a single skill file — validating our L-Thread approach and providing an immediately adoptable workflow template.**
