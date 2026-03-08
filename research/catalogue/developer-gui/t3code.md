# T3 Code

> **A minimal web GUI for coding agents — currently Codex-first, with Claude Code support coming soon.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [pingdotgg/t3code](https://github.com/pingdotgg/t3code) |
| Publisher | Ping.gg / Theo Browne (solo creator — t3.gg, Uploadthing) |
| License | Open Source |
| Tech Stack | TypeScript monorepo (Turbo), Tauri (desktop app), React |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | Same category as Jean but less mature. A web/desktop GUI for managing agent sessions — the opposite of our terminal-first, autonomous orchestration approach. |
| **Novelty** | 2/10 | Nothing architecturally new beyond what Jean already covers. Codex-first focus is a minor data point. |
| **Actionable** | 1/10 | No patterns or ideas we can directly use. |

---

## Overview

T3 Code is Theo Browne's web GUI wrapper around coding agents, primarily OpenAI's Codex CLI. It provides a visual interface for interacting with coding agents, installable as a desktop app (Tauri) or run via `npx t3`. The project is very early stage — the README explicitly states "We are very very early in this project. Expect bugs. We are not accepting contributions yet."

The tool is comparable to Jean but less mature and with a narrower initial scope (Codex-only at launch, Claude Code support planned). It lacks Jean's git worktree automation, multi-harness support, and the rich execution modes concept.

---

## Technical Architecture

**Monorepo structure:** TypeScript monorepo managed by Turbo, with a Tauri desktop app component for native distribution. The app wraps Codex CLI interactions in a React-based UI.

**Key architectural notes:**
- Desktop app via Tauri (like Jean)
- Codex CLI as the primary harness (no multi-agent support yet)
- Early-stage — architecture not yet solidified
- 17 releases, 10 contributors, actively developing

---

## Publisher Background

Built by Theo Browne ([@theo](https://twitter.com/t3dotgg)), known for creating the T3 stack (create-t3-app), t3.gg, and Uploadthing. Theo is a prominent figure in the TypeScript/Next.js community with a large YouTube following. Ping.gg is his company. His projects tend to be developer-focused tools with strong community adoption. However, T3 Code is a side project — not a venture-backed product — and the "not accepting contributions" stance suggests it may remain a personal tool.

---

## What's Valuable for Us

Nothing directly actionable. T3 Code operates at the developer GUI layer, which conflicts with our Governing Principle #9 ("The terminal is the interface") and ADR-005. It's worth tracking as a market signal — the fact that Theo built this confirms growing demand for agent management GUIs — but there are no patterns or code to adopt.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Web GUI for agent sessions** | We don't want a custom UI (ADR, Section 8.9) |
| **Codex-first design** | We're Claude Code-first; Codex is a possible Phase 3+ addition |
| **Desktop app (Tauri)** | Terminal is our interface |
| **Manual session interaction** | We need autonomous orchestration, not interactive GUIs |

---

## Future Use Cases

- **Phase 1–4:** No future relevance. Same problem space as Jean, less mature, and Jean is already catalogued as low-relevance.

---

## Key Takeaway

> **T3 Code is a market signal confirming demand for agent management GUIs, but has zero architectural relevance to our autonomous orchestration vision — same category as Jean but less mature.**
