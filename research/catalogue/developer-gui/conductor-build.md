# Conductor (by Melty Labs)

> **A Mac app for orchestrating teams of coding agents — create parallel Claude Code + Codex agents in isolated workspaces, review and merge their changes.**

| Field | Value |
|-------|-------|
| Category | 🖥️ Developer GUI / IDE |
| Website | https://www.conductor.build/ |
| Repository | Closed-source (releases only: [meltylabs/conductor-releases](https://github.com/meltylabs/conductor-releases)) |
| GitHub Stars | N/A (closed-source); predecessor [Melty](https://github.com/meltylabs/melty) has 5,445 (as of 2026-03-08) |
| Publisher | Melty Labs (startup) |
| License | Proprietary (free to use, no paid tiers announced) |
| Tech Stack | macOS native app, git worktrees, Claude Code CLI, OpenAI Codex, MCP, zsh |
| Maturity | 🟡 Early (launched ~mid-2025, active development) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Interesting GUI wrapper over Claude Code. The predecessor Melty was a "chat-first code editor" with 5.4K stars. They pivoted hard into multi-agent orchestration for macOS -- basically building a polished GUI over the same primitives we use (git worktrees + Claude Code + parallel agents). The conductor.json config is simple but the scripts concept (setup/run/archive lifecycle) is a clean pattern. Main limitation: Mac-only, closed-source, and wraps Claude Code rather than extending it. For our zero-infra, CLI-first approach this is a "watch, don't adopt" tool -- but the testimonials from Stripe/Notion/Vercel engineers suggest it's solving a real pain point for teams that want GUI oversight of parallel agents.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves the same problem (parallel agent orchestration with worktree isolation) but via GUI, not CLI/programmatic. We need headless orchestration, not desktop apps. |
| **Novelty** | 4/10 | Git worktree isolation, parallel agents, checkpoint/revert -- we've already validated all these patterns. The scripts lifecycle (setup/run/archive) is a minor addition. |
| **Actionable** | 3/10 | Closed-source, Mac-only GUI. No code to steal. The conductor.json schema and scripts lifecycle concept are the only transferable patterns, and both are trivial. |

---

## Overview

Conductor is a native macOS desktop application by Melty Labs that provides a GUI layer for orchestrating multiple AI coding agents working in parallel. It wraps Claude Code (and OpenAI Codex) agents, giving each its own isolated git worktree workspace, and provides a unified interface for monitoring progress, reviewing diffs, creating PRs, and merging results.

The core workflow is: add a repository, create workspaces (each backed by a git worktree on a separate branch), assign work to Claude Code agents, monitor them through a sidebar UI, review changes via a built-in diff viewer, and merge to main via GitHub. Conductor does not run its own AI -- it delegates entirely to Claude Code CLI and Codex, using the user's existing API keys or Claude Pro/Max subscription.

The tool also introduces a "Scripts" system with three lifecycle hooks (setup, run, archive) that can be shared across teams via a `conductor.json` committed to the repo. It supports MCP server integration (configured through Claude Code's own `claude mcp add` mechanism), checkpoint/revert for turn-by-turn undo, and multiple model providers (Anthropic direct, OpenRouter, AWS Bedrock, Google Vertex, Vercel AI Gateway, Azure AI Foundry).

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│           Conductor macOS App               │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Workspace 1│  │Workspace 2│  │Workspace N│ │
│  │ (worktree) │  │(worktree) │  │(worktree) │ │
│  │ Claude Code│  │Claude Code│  │  Codex   │ │
│  │  Agent     │  │  Agent    │  │  Agent   │ │
│  └─────┬─────┘  └─────┬────┘  └────┬─────┘ │
│        │              │             │       │
│  ┌─────┴──────────────┴─────────────┴─────┐ │
│  │         Git Repository (local)         │ │
│  │   main branch + N worktree branches    │ │
│  └────────────────┬───────────────────────┘ │
│                   │                         │
│  ┌────────────────┴───────────────────────┐ │
│  │  Diff Viewer / PR Creator / Merge UI   │ │
│  └────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────┘
                      │
              ┌───────┴────────┐
              │    GitHub      │
              │  (via gh CLI)  │
              └────────────────┘
```

**Key Components:**

- **Workspace isolation**: Each workspace = one git worktree on a dedicated branch. Agents cannot interfere with each other's changes.
- **Checkpoints**: Before each user message, a Claude Code hook commits the working state to a private git reference. Enables per-turn revert. Claude Code only (not Codex).
- **Scripts lifecycle**: Three hooks (`setup`, `run`, `archive`) configured per-repo or via `conductor.json`:
  - `setup` — runs on workspace creation (e.g., `npm install`)
  - `run` — triggered by Run button (e.g., `npm run dev`), supports nonconcurrent mode
  - `archive` — cleanup before workspace deletion
- **Process management**: Graceful shutdown via `SIGHUP` (200ms timeout) then `SIGKILL`.
- **Spotlight testing**: Syncs workspace changes back to repo root for testing against full build artifacts. Experimental, one workspace at a time.
- **Model providers**: Anthropic (direct), OpenRouter, AWS Bedrock, Google Vertex, Vercel AI Gateway, Azure AI Foundry, GLM.
- **MCP integration**: Passthrough to Claude Code's native MCP configuration (`claude mcp add`).
- **Data storage**: Chat history local at `~/Library/Application Support/com.conductor.app`. Account data on Fly-hosted Postgres. Telemetry to PostHog (disableable via `enterpriseDataPrivacy: true`).
- **Dependencies**: macOS only, GitHub CLI (`gh`), Claude Code CLI.

**conductor.json schema:**

```json
{
  "scripts": {
    "setup": "string",
    "run": "string",
    "archive": "string"
  },
  "runScriptMode": "concurrent | nonconcurrent",
  "enterpriseDataPrivacy": true
}
```

---

## Publisher Background

Melty Labs previously built **Melty**, a "chat-first code editor" (5,445 GitHub stars, MIT license, TypeScript). Melty was essentially a Cursor competitor. They pivoted to Conductor, repositioning from "AI code editor" to "AI agent orchestrator" -- a sign they recognized the market was shifting from single-agent copilots to multi-agent swarms.

Other repos in the Melty Labs org include **Chorus** (AI chat app for Mac, 709 stars), **DesktopCommanderMCP** (MCP server for terminal/filesystem control), and **conductor-tutorial**. The team appears small (startup-sized). They have testimonials from engineers at Stripe, Notion, Life360, Vercel, and Linear, suggesting meaningful traction among senior ICs at top companies.

No public funding information found. The product is currently free with no announced pricing tiers.

---

## What's Valuable for Us

1. **Scripts lifecycle pattern**: The three-hook model (setup/run/archive) is a clean abstraction for workspace lifecycle management. Our L-Thread Orchestrator could adopt similar per-workspace hooks, especially the `archive` cleanup hook which we currently lack.

2. **Checkpoint implementation**: Using Claude Code hooks to commit working state to private git refs before each turn is an elegant undo mechanism. This validates our own git-based state approach and suggests we should add per-turn checkpointing to our agent workflows.

3. **conductor.json as team config**: The idea of a repo-committed config file that standardizes agent workspace behavior across a team is worth noting for Phase 3+ when we consider multi-developer setups.

4. **`$CONDUCTOR_PORT` for concurrent testing**: Assigning unique ports per workspace for dev server isolation is a simple trick we could use when running multiple agents with local servers.

5. **Enterprise privacy toggle**: Single `enterpriseDataPrivacy: true` flag to kill all telemetry. Good pattern for our gov/DSGVO clients.

---

## What's NOT Relevant

- **GUI-first architecture**: We need headless, programmatic orchestration. A Mac desktop app cannot be part of an autonomous agent pipeline. Conflicts with Master Blueprint Principle 2 (deterministic orchestration) -- you can't have a human clicking buttons in an autonomous system.

- **Closed-source**: No code to study, adapt, or extend. Unlike Overstory, oh-my-claudecode, or Broomie which are all open source and give us actual implementation details.

- **Mac-only**: Platform lock-in. Our agents run on Linux (CI/CD) and macOS (dev). A Mac-only tool is not deployable.

- **Wrapper, not extension**: Conductor wraps Claude Code rather than extending it. It doesn't add new capabilities -- it adds a GUI over existing ones. Our approach (hooks, CLAUDE.md, custom commands) extends Claude Code's capabilities directly.

- **No task decomposition**: Unlike our orchestrator which decomposes tasks and routes them to specialized agents, Conductor leaves all decomposition to the human user. Each workspace requires manual creation and task assignment.

---

## Future Use Cases

- **Phase 1-2 (Days 1-60)**: Not useful. We operate headless with tmux-based orchestration.
- **Phase 3 (Days 60-90)**: Could be interesting as a **review interface** if we need non-technical stakeholders to review agent output. The diff viewer and PR creation flow are polished.
- **Phase 4 (Days 90+)**: If Conductor adds an API or CLI mode for programmatic workspace creation, it could become a frontend for our orchestrator. Worth monitoring their roadmap. The testimonials from Stripe/Notion engineers suggest they're building toward enterprise features.

---

## Key Takeaway

> **Conductor validates our git worktree + parallel agent architecture with a polished GUI, but as a closed-source Mac-only wrapper with no programmatic API, it's a "watch, don't adopt" tool -- the scripts lifecycle hooks and checkpoint pattern are the only transferable ideas.**
