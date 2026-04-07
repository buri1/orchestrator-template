# Commander

> **Native macOS interface for Claude Code and Codex with built-in diffs, git workflow, and worktrees — prompt, review, and commit without context switching.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Repository | [CommanderApp/commander](https://github.com/CommanderApp/commander) (issue tracker only; closed-source) |
| Website | [thecommander.app](https://thecommander.app/) |
| GitHub Stars | 40 (as of 2026-03-08) |
| Publisher | Marcin Krzyzanowski (@krzyzanowskim) — solo |
| License | Proprietary (free, no subscription) |
| Tech Stack | Swift / SwiftUI / AppKit (native macOS), Git worktrees |
| Maturity | 🟡 Early (Public Beta) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 2/10 | Human-operated GUI; our architecture is autonomous orchestration. Same fundamental mismatch as Jean but even more focused on the single-developer use case. |
| **Novelty** | 3/10 | Prompt→diff→commit loop is clean UX but not architecturally novel. Multi-agent switching (Claude/Codex/OpenCode/Pi) across a single interface is mildly interesting. We already have the worktree pattern. |
| **Actionable** | 1/10 | Closed-source, no code to study. No patterns we don't already have from Jean, Overstory, and our own architecture. |

---

## Overview

Commander is a **native macOS desktop application** that wraps Claude Code, Codex, OpenCode, and Pi CLIs into a single GUI with built-in diff viewing, git workflow management, and worktree-based project isolation. It positions itself as the "review-first" alternative to working purely in the terminal — the developer selects a repo/branch, prompts an agent, reviews inline diffs with syntax highlighting, and commits from within the app.

The key design decision is that Commander is a **thin UI shell** around existing CLI tools. It doesn't run its own LLM calls — credentials stay in the user's CLI installation, and code context sent to AI providers depends on which CLI the user selects. This means Commander adds zero intelligence; it's purely a visual workflow wrapper. The app is free with no subscription model, suggesting it's either a passion project or a trojan horse for future monetization.

Commander is **closed-source** — the GitHub repository is only an issue tracker with no source code. This makes it impossible to study implementation details, data models, or architecture decisions beyond what's visible in the marketing site. It requires macOS 15.0+ (Sequoia), which limits adoption.

---

## Technical Architecture

```
┌──────────────────────────────────────┐
│        Commander (SwiftUI App)       │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Diff Viewer   │  │ Git Manager  │ │
│  │ (inline,      │  │ (branches,   │ │
│  │  syntax hl)   │  │  worktrees,  │ │
│  │               │  │  commits)    │ │
│  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Agent Router  │  │ Accessibility│ │
│  │ (CC/Codex/   │  │ (VoiceOver,  │ │
│  │  OpenCode/Pi) │  │  keyboard)   │ │
│  └──────┬───────┘  └──────────────┘ │
│         │                            │
│  ┌──────▼───────────────────────┐   │
│  │  CLI Process Manager         │   │
│  │  (spawns local CLI sessions) │   │
│  └──────┬───────────────────────┘   │
└─────────┼────────────────────────────┘
          │
    ┌─────▼──────┐  ┌──────────┐  ┌──────────┐  ┌─────┐
    │ Claude Code │  │ Codex    │  │ OpenCode │  │ Pi  │
    │ CLI         │  │ CLI      │  │ CLI      │  │ CLI │
    └────────────┘  └──────────┘  └──────────┘  └─────┘
```

Key architectural points:
- **Pure UI wrapper:** No backend server, no cloud component. Local-only operation.
- **Process spawning:** Each agent session is a local CLI process managed by Commander.
- **Git integration:** Native git operations (branch, worktree, diff, commit) without shelling out to a separate tool.
- **Worktree isolation:** Projects are isolated via git worktrees, one per agent task.
- **Analytics:** TelemetryDeck (anonymized, no PII, no cookies) — the only external communication.

---

## Publisher Background

**Marcin Krzyzanowski** is a well-known Swift/iOS developer with strong open-source credentials:

- **CryptoSwift** (10.6K stars) — the most popular pure-Swift cryptography library
- **STTextView** (1.5K stars) — performant TextKit 2 text view component
- **ObjectivePGP** (715 stars) — OpenPGP for iOS/macOS
- 95 public repositories, 1,800+ GitHub followers
- Associated with GoodNotes and objc.io organizations
- Active in the Swift community since at least 2014

His background is heavily macOS/iOS native development, which explains the SwiftUI-first approach. CryptoSwift's longevity (10+ years of maintenance) suggests he ships and maintains. However, Commander is his first foray into AI tooling — no prior AI/agent track record.

Commander is a solo effort with no visible funding or corporate backing. The "free, no subscription" model is either sustainable as a reputation play or unsustainable long-term.

---

## What's Valuable for Us

**Almost nothing.** The honest assessment:

1. **Multi-harness switching pattern** — Commander's ability to switch between Claude Code, Codex, OpenCode, and Pi in a single interface is a minor UX validation. Our architecture already accounts for harness-agnostic design (Master Blueprint Layer 3: shared infrastructure). The idea of a unified interface across harness CLIs is sound, but we achieve this through tmux sessions + state files, not a GUI.

2. **Worktree-as-project-isolation** — Commander uses git worktrees for project isolation, which independently validates our architecture (and Overstory's, and Jean's, and pi-side-agents'). At this point, worktree isolation is a consensus pattern, not a novel insight.

3. **Prompt→diff→commit as atomic loop** — The structured workflow of "prompt agent, review diff, commit or reject" is a good formalization of the human review step. However, we've already formalized this in our quality gate pipeline (lint → SAST → unit tests → E2E → multi-model review → confidence score → human review).

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **SwiftUI desktop GUI** | Governing Principle #9: "The terminal is the interface." Building a native GUI is UI work that generates zero revenue. |
| **Human-operated workflow** | Governing Principle #5: Human review is the binding constraint. Commander *increases* human involvement at every step. |
| **Closed-source** | Cannot study internals, adapt code, or learn implementation patterns. Zero extraction value. |
| **macOS 15.0+ requirement** | Platform lock-in to latest macOS; our agents run on any machine with tmux + bash. |
| **Accessibility features** | Admirable engineering, but irrelevant to autonomous agent orchestration. |
| **Free pricing model** | No business model means uncertain longevity. |

**Governing Principle conflicts:**
- **#2 (Deterministic orchestration):** Commander has no orchestration at all — the human manually prompts each agent.
- **#3 (Context is zero-sum):** Commander doesn't manage context separation; it's just a pass-through to whichever CLI you select.
- **#5 (Human review is binding constraint):** Commander's entire value proposition is making the human review loop prettier, not eliminating it.
- **#7 (Build only what you've needed):** We have never needed a GUI wrapper around our CLI agents.

---

## Future Use Cases

- **Phase 1 (Days 1–3):** None.
- **Phase 2 (Days 4–60):** None.
- **Phase 3 (Days 60–90):** None.
- **Phase 4 (Days 90+):** If we ever need a client-facing demo interface for agent work (unlikely), Commander's prompt→diff→commit UX is a reference for what that could look like. But we'd use Notion dashboards instead.

---

## Key Takeaway

> **Commander is a polished macOS GUI for human-operated agent sessions — the exact opposite of autonomous orchestration. It validates worktree isolation (consensus pattern) and multi-harness switching (already in our architecture), but being closed-source with no novel architectural patterns makes it the lowest-value entry in the Developer GUI category.**
