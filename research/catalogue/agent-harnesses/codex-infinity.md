# Codex Infinity

> **Infinite coding agent — autonomous AI development tool with auto-next-steps and self-improvement loops.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [lee101/codex-infinity](https://github.com/lee101/codex-infinity) |
| Homepage | [codex-infinity.com](https://codex-infinity.com/) |
| GitHub Stars | 41 (as of 2026-03-22) |
| Publisher | lee101 (solo developer); fork of openai/codex |
| License | Apache-2.0 |
| Tech Stack | Rust (95.3%), Python (2.3%), TypeScript (1.6%); Bazel build; npm/pnpm |
| Maturity | 🟡 Early (41 stars; fork of openai/codex; experimental features) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *Codex Infinity is an opinionated fork of OpenAI's Codex CLI that adds "infinite" autonomous loops: `--auto-next-steps` continues working through logical sequences, `--auto-next-idea` brainstorms and implements improvements. The `--yolo4` unrestricted execution mode is amusing but dangerous.*
>
> *At 41 stars, this is very early stage. The concept of "infinite coding agent" is relevant to our autonomous orchestration vision but the implementation is just Codex + auto-continue flags. Our orchestrator already achieves this pattern with its loop architecture. Not much new to learn here.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Auto-continuation concept aligns with our autonomous mode but implementation is trivial (Codex + flag); we already have more sophisticated orchestration |
| **Novelty** | 3/10 | `--auto-next-steps` and `--auto-next-idea` are thin wrappers around Codex; the concept of autonomous continuation is well-established in our architecture |
| **Actionable** | 2/10 | Nothing directly adoptable; our orchestrator loop is already more capable |

---

## Overview

Codex Infinity is a fork of OpenAI's Codex CLI that adds autonomous continuation capabilities. The key additions are `--auto-next-steps` (agent continues working through logical task sequences without human intervention) and `--auto-next-idea` (agent brainstorms and implements code enhancements autonomously). It supports multi-LLM backends (OpenAI, local providers via LM Studio/Ollama, custom endpoints) and offers execution modes ranging from sandboxed (`--full-auto`) to unrestricted (`--yolo4`).

The architecture inherits Codex's three-component structure: `codex-rs/` (core Rust implementation with TUI and sandbox), `codex-cli/` (npm package wrapper), and `sdk/` (TypeScript SDK).

---

## What's Valuable for Us

- The concept of explicit "auto-next-steps" as a flag rather than implicit behavior — good UX pattern for toggling autonomy levels

---

## What's NOT Relevant

- Codex-specific (we use Claude Code as primary harness)
- Very early stage (41 stars)
- Our orchestrator loop already implements more sophisticated autonomous continuation with roadblock detection, E2E testing gates, and recovery

---

## Key Takeaway

> **Codex Infinity adds auto-continuation flags to OpenAI's Codex CLI, but at 41 stars and with our orchestrator already implementing more sophisticated autonomous loops, there's little to adopt here.**
