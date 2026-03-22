# cmux (craigsc)

> **cmux: tmux for Claude Code — a shell-based tmux wrapper that simplifies multi-agent Claude Code sessions.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI |
| Repository | [craigsc/cmux](https://github.com/craigsc/cmux) |
| GitHub Stars | 414 (as of 2026-03-22) |
| Publisher | craigsc (solo) |
| License | MIT |
| Tech Stack | Shell/Bash |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *DIFFERENT from the manaflow-ai/cmux which is the Ghostty-based terminal we use. This is a pure shell/tmux wrapper that simplifies Claude Code multi-session management. 414 stars. The naming collision is confusing but this one is much simpler — basically what our run-tmux.sh does but packaged as a standalone tool. Topics: claude, claude-code, git, terminal.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves the same problem as our run-tmux.sh but as a packaged tool |
| **Novelty** | 3/10 | We already have this pattern; it's a tmux wrapper |
| **Actionable** | 4/10 | Could compare their session management patterns with ours |

---

## Overview

This cmux (by craigsc) is a shell-based tmux wrapper designed specifically for running multiple Claude Code sessions. It provides a simplified interface for creating, managing, and monitoring tmux windows with Claude Code agents. Unlike the manaflow-ai/cmux which is a full native macOS terminal, this is a lightweight shell script approach.

The tool handles common tmux operations like session creation, pane management, and output capture with Claude-Code-specific defaults (e.g., auto-unsetting CLAUDECODE env var, passing --dangerously-skip-permissions).

---

## What's Valuable for Us

- **Session management patterns**: Their approach to tmux window lifecycle could improve our run-tmux.sh
- **Git integration**: Topics suggest git-aware session management

---

## What's NOT Relevant

- **Replaced by manaflow cmux**: The native macOS cmux terminal is strictly superior for our use case
- **Shell-only approach**: Limited extensibility compared to a native app or TypeScript solution

---

## Key Takeaway

> **A lightweight shell tmux wrapper for Claude Code (414 stars) — naming collision with manaflow's cmux; useful reference for tmux patterns but superseded by our native cmux setup.**
