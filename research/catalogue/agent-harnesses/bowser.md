# Bowser

> **Agentic browser automation and UI testing system — built with composable skills, subagent, command, and justfile layered architecture for repeatable, deployable browser use.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [disler/bowser](https://github.com/disler/bowser) |
| GitHub Stars | 184 (as of 2026-03-08) |
| Publisher | Dan Disler / IndyDevDan (solo practitioner) |
| License | Not specified |
| Tech Stack | Markdown (skills/agents), Shell/Justfile, Playwright CLI, Claude Code |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Browser automation is directly relevant — we use Chrome DevTools MCP for E2E testing (Rule 2). Bowser's composable architecture aligns with our skills-based orchestration. |
| **Novelty** | 6/10 | The four-layer composable stack (Skill → Subagent → Command → Just) is a clean formalization of patterns we use informally. The dual-mode (Claude-Bowser vs Playwright-Bowser) is a useful distinction. |
| **Actionable** | 6/10 | We could adopt the YAML-based user story validation and the justfile recipe pattern. The Playwright CLI integration is immediately useful for our E2E testing gate. |

---

## Overview

Bowser is a browser automation framework designed to run inside Claude Code, created by Dan Disler (IndyDevDan) — a practitioner Burak already tracks as a benchmark person. It provides a structured way to automate browser interactions using a four-layer composable architecture that separates concerns between raw browser capabilities, agent orchestration, workflow coordination, and CLI invocation.

The tool operates in two modes: **Claude-Bowser** for personal workflow automation (using Claude Code's native capabilities) and **Playwright-Bowser** for scalable UI testing (using Playwright CLI for headless browser control). This dual-mode approach lets developers use the same skill definitions for both ad-hoc automation and repeatable CI/CD test suites.

The architecture is intentionally minimal — skills are Markdown files, workflows are YAML, and the glue layer is Justfile recipes. This "pure prompt engineering" approach mirrors our own L-Thread Orchestrator philosophy of keeping orchestration lightweight and deterministic.

---

## Technical Architecture

**Four-Layer Composable Stack:**

```
Layer 4: Justfile     — CLI entry points, one-command execution
Layer 3: Command      — Orchestration, story discovery, result aggregation
Layer 2: Subagent     — Parallel execution with isolated browser sessions
Layer 1: Skill        — Raw browser capabilities (Playwright CLI or Chrome MCP)
```

- **Skills**: Markdown files defining browser interaction capabilities (click, navigate, screenshot, form fill)
- **Subagents**: Isolated Claude Code instances with their own browser sessions for parallel execution
- **Commands**: Orchestration layer that discovers YAML user stories and dispatches subagents
- **Justfile**: Recipes that wire everything together for single-command invocation
- **User Stories**: YAML files defining test scenarios with steps, assertions, and expected outcomes
- **Screenshot Audit Trail**: Captures screenshots at each step for visual verification

---

## Publisher Background

Dan Disler (IndyDevDan) is a well-known AI agent practitioner who has "bet the next 10 years of his career on agentic software." He's active on YouTube and GitHub with numerous projects including single-file-agents, big-3-super-agent (Gemini + OpenAI + Claude multi-agent experiment), nano-agent (MCP server for small-scale agents), and indydevtools. Burak already tracks him as a benchmark person. His work emphasizes practical, deployable agent patterns over theoretical frameworks.

---

## What's Valuable for Us

- **Four-layer architecture pattern**: The Skill → Subagent → Command → Just layering is a clean reference for how to structure our own browser automation. We could adopt this for organizing our Chrome DevTools MCP E2E tests.
- **YAML user story format**: Defining test scenarios as YAML stories with steps and assertions is more maintainable than our current ad-hoc E2E test approach.
- **Justfile as orchestration glue**: Using Justfile recipes for repeatable agent workflows is a lightweight alternative to complex shell scripts. Worth considering for our orchestrator's task dispatch.
- **Playwright CLI integration**: Direct CLI-based browser control (no SDK dependency) aligns with our terminal-first, 70/30 deterministic/LLM split. Playwright CLI is the deterministic layer; Claude Code provides the LLM reasoning.
- **Dual-mode pattern**: The Claude-Bowser / Playwright-Bowser distinction maps well to our need for both interactive browser debugging and headless CI testing.

---

## What's NOT Relevant

- **Claude Code dependency for orchestration**: Bowser assumes Claude Code is the orchestration layer. We already have our own L-Thread Orchestrator for this — we'd want the browser skills and YAML patterns, not the orchestration wrapper.
- **Low star count / early maturity**: At 184 stars and 3 commits, this is more of a reference architecture than a production tool. We'd adopt patterns, not the tool itself.
- **Vision mode**: Optional screenshot-based visual testing is interesting but not our current priority — we use Chrome DevTools MCP for DOM-level interaction.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt YAML user story format for our E2E testing gate (INC-014, INC-015). Study the Justfile pattern for task dispatch.
- **Phase 3 (Days 60-90)**: If we formalize browser automation as a reusable skill set, Bowser's four-layer architecture is the reference design.
- **Phase 4 (Days 90+)**: Could inform a "browser agent" persona in our federated system — a dedicated agent that handles all browser-based tasks across business lines.

---

## Key Takeaway

> **IndyDevDan's clean four-layer browser automation architecture is a strong reference for structuring our E2E testing, particularly the YAML user story format and Justfile recipe pattern — adopt the patterns, not the tool.**
