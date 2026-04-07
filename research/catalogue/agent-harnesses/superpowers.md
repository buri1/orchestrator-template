# Superpowers

> **An agentic skills framework & software development methodology that works.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [obra/superpowers](https://github.com/obra/superpowers) |
| GitHub Stars | 73,600 (as of 2026-03-08) |
| Publisher | Jesse Vincent / obra (solo developer, veteran open-source maintainer) |
| License | MIT |
| Tech Stack | Shell (76.4%), JavaScript (12.4%), Python (5.7%), TypeScript (4.3%) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Superpowers encodes best practices for coding agent workflows. The TDD enforcement, subagent delegation, and two-stage review patterns are directly applicable to how our orchestrator spawns and governs coding agents. |
| **Novelty** | 6/10 | We already use skills, subagents, and structured workflows. But Superpowers formalizes patterns we do informally — the brainstorm-before-code rule, strict TDD enforcement (deleting code that appears before tests), and the two-stage review are sharper implementations. |
| **Actionable** | 7/10 | We can adopt specific skills (TDD enforcement, debugging methodology, code review checklist) directly into our orchestrator's agent instructions. The "skills auto-trigger based on context" pattern is immediately useful. |

---

## Overview

Superpowers is a software development methodology encoded as composable "skills" — Markdown files that guide coding agents through structured workflows. Created by Jesse Vincent (best known for Request Tracker, K-9 Mail/Thunderbird for Android, and Keyboardio), the framework enforces discipline that coding agents typically lack: brainstorming before coding, test-driven development, systematic debugging, and multi-stage code review.

The core insight is that coding agents produce better results when given explicit workflow constraints rather than open-ended instructions. Superpowers encodes these constraints as skills that auto-trigger based on context — the agent doesn't need to be told "use TDD," the TDD skill activates automatically when implementation begins. If code appears before tests, the framework deletes it and forces a restart with the RED-GREEN-REFACTOR cycle.

With 73.6k stars and active multi-platform support (Claude Code, Cursor, Codex, OpenCode), Superpowers has become the de facto standard for structured coding agent workflows. Version 4.1.1 (January 2026) with 286 commits shows steady, disciplined development — fitting for a framework about discipline.

---

## Technical Architecture

**Workflow Pipeline:**
```
Brainstorm → Plan → Implement (TDD) → Review (2-stage) → Finish
```

- **Brainstorm Skill**: Socratic questioning to refine requirements before any code. Explores alternatives, presents design in sections, requires human validation.
- **Planning Skill**: Creates bite-sized tasks (2-5 minutes each) with exact file paths and verification steps. Git worktree isolation per task.
- **Implementation Skill**: Strict RED-GREEN-REFACTOR TDD. Anti-patterns reference built in. Code without tests is deleted.
- **Subagent Delegation**: Individual tasks dispatched to specialized subagents. Each subagent works in isolation with its own git worktree.
- **Review Skill (2-stage)**: Stage 1 checks spec compliance, Stage 2 checks code quality. Prevents drift during extended autonomous sessions.
- **Debugging Skill**: Systematic root-cause analysis methodology (not just "try fixing it").

**Key Design Decisions:**
- Skills are Markdown files — no compiled code, no dependencies
- Auto-triggering based on context (not explicit invocation)
- Git worktree isolation per task (clean separation, easy rollback)
- Platform-agnostic (works across Claude Code, Cursor, Codex, OpenCode)
- 2+ hour autonomous sessions reported by users

---

## Publisher Background

Jesse Vincent is a veteran open-source developer with a 30-year track record:
- **Request Tracker (RT)**: Created in 1994 at Wesleyan University — one of the most widely-used ticket tracking systems, still in production today
- **Best Practical Solutions**: Founded 2001, company behind RT
- **K-9 Mail**: Founded the popular Android email app, later acquired by Mozilla and rebranded as Thunderbird for Android
- **Keyboardio**: Co-founded in 2014, designing ergonomic keyboards (Model 01, Model 100)
- **VaccinateCA**: Co-founded in 2021, helping Americans find COVID vaccines

This is not a weekend project from an unknown developer. Jesse has repeatedly built tools that achieve massive adoption and long-term sustainability. His track record strongly suggests Superpowers will be maintained and evolved.

---

## What's Valuable for Us

- **TDD enforcement pattern**: The rule "if code appears before tests, delete it" is a brutally effective constraint. We should encode this in our orchestrator's agent instructions for coding agents.
- **Two-stage review**: Separating spec compliance review from code quality review is directly adoptable. Our orchestrator could enforce this as a gate before marking issues Done (aligned with Rule 2: E2E TESTING IST GATE).
- **Brainstorm-before-code**: Adding a mandatory brainstorming phase before implementation would reduce wasted agent cycles. Our orchestrator currently lets agents jump straight into coding.
- **Git worktree isolation**: Each task in its own worktree prevents agent interference. We already use separate directories, but worktrees are cleaner — they share the repo history while providing full isolation.
- **Skills auto-triggering**: Instead of explicit "use skill X" instructions, skills activate based on context. This is a more elegant approach than our current explicit command invocation.
- **Debugging methodology**: The systematic root-cause analysis skill is better than our current approach of "agent, fix this error."

---

## What's NOT Relevant

- **Multi-platform support**: We don't need Cursor, Codex, or OpenCode compatibility. This is nice for adoption but irrelevant for our Claude-first stack.
- **Superpowers as a complete replacement**: The framework encodes a specific methodology. Our orchestrator needs to remain methodology-agnostic at the orchestration layer — but we should adopt individual skills as agent-level instructions.
- **Human checkpoint pattern**: Superpowers includes "collaborative planning with human checkpoints." When AUTO_MODE is ENABLED in our system, we explicitly skip human interaction. The checkpoint pattern conflicts with our fully autonomous operation mode.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Immediately adopt TDD enforcement and two-stage review patterns in our agent instruction templates.
- **Phase 2 (Days 4-60)**: Integrate the brainstorm skill and debugging methodology. Study git worktree isolation for our agent workspace management.
- **Phase 3 (Days 60-90)**: Consider building a "skills registry" similar to Superpowers' platform marketplace integration — a catalogue of reusable agent skills that can be installed into our orchestrator.
- **Phase 4 (Days 90+)**: If we productize, Superpowers' approach to auto-triggering skills based on context should inform our skills execution model.

---

## Key Takeaway

> **The gold standard for structured coding agent workflows — the TDD enforcement, two-stage review, and brainstorm-before-code patterns should be directly adopted into our orchestrator's agent instructions.**
