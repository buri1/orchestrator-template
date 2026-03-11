# Manaflow (cmux)

> **Open source Claude Code web/Codex Cloud/Devin alternative — spawns multiple coding agent CLIs in parallel with isolated VS Code workspaces.**

| Field | Value |
|-------|-------|
| Category | Developer GUI / IDE |
| Repository | [github.com/ctate/manaflow](https://github.com/ctate/manaflow) |
| GitHub Stars | 1 (as of 2026-03-08) |
| Homepage | [cmux.dev](https://cmux.dev) |
| Publisher | Chris Tate (@ctatedev) — solo dev at Vercel, creator of json-render (12.1K stars), agent-browser (20K stars) |
| License | MIT |
| Tech Stack | TypeScript (69.8%), Rust (17.3%), React, Convex (real-time DB), Hono (API), TanStack Router/Query, Shadcn UI, Tailwind CSS, Bun, Docker, Morph Cloud (sandboxes), libghostty (native terminal) |
| Maturity | Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves "visual dashboard for parallel agents" which is nice-to-have, not on our critical path. We run headless tmux agents; a GUI layer adds overhead without improving agent throughput. |
| **Novelty** | 6/10 | Heatmap-based PR review and Morph snapshot-based sandbox isolation are novel. Multi-agent parallel spawning pattern is well-covered by Broomie, Overstory, Vibe Kanban. |
| **Actionable** | 4/10 | Cloud-first architecture (Convex, Morph) conflicts with our zero-infra, tmux-native approach. The PR heatmap concept is the most extractable idea. |

---

## Overview

Manaflow (internally called **cmux**) is a web application that spawns Claude Code, Codex CLI, Gemini CLI, Amp, OpenCode, and other coding agent CLIs in parallel across multiple tasks. For each run, it provisions an isolated OpenVSCode instance via Docker or Morph Cloud sandboxes. Each workspace opens with a git diff UI and a terminal running the dev server (configurable via devcontainer.json).

The project has two faces: (1) the **web app** (`apps/www`) which is the orchestration dashboard for spawning, monitoring, and reviewing parallel agent runs, and (2) the **native macOS terminal** (`cmux.dev`) built on libghostty (Ghostty's rendering engine) with vertical tabs showing git branch, working directory, ports, and notification rings when agents need attention.

The architecture is cloud-native: Convex provides the real-time database layer, Hono serves the API with OpenAPI client generation, and Morph Cloud handles VM-level sandbox isolation where RAM state is snapshotted (running processes survive snapshots). This is a fundamentally different design philosophy from our tmux+worktree local-first approach.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  cmux Web App                    │
│  (React + TanStack Router + Shadcn UI)          │
├─────────────────────────────────────────────────┤
│  Hono API (apps/www/lib/routes/*)               │
│  + OpenAPI client auto-generation               │
├──────────────┬──────────────────────────────────┤
│  Convex DB   │  Morph Cloud Sandboxes           │
│  (real-time  │  (VM-level isolation,            │
│   schema in  │   RAM snapshots,                 │
│   packages/  │   VNC + VS Code + xterm)         │
│   convex/)   │                                  │
├──────────────┴──────────────────────────────────┤
│  Worker (apps/worker) — agent lifecycle mgmt    │
│  Edge Router (apps/edge-router)                 │
│  Preview Proxy (apps/preview-proxy)             │
│  Global Proxy (apps/global-proxy)               │
├─────────────────────────────────────────────────┤
│  Rust Crates: cmux-env, cmux-proxy,             │
│               cmux-pty, cmux-terminal           │
│  (native terminal via libghostty)               │
└─────────────────────────────────────────────────┘
```

**Key components:**

- **`apps/www`** — Main web dashboard (React + TanStack Router + Hono backend)
- **`apps/worker`** — Agent lifecycle management, Docker/Morph sandbox provisioning
- **`apps/server`** — Native desktop server (Vite + Rust FFI)
- **`apps/client`** — Native desktop client
- **`apps/edge-router`** / **`apps/global-proxy`** / **`apps/preview-proxy`** — Routing infrastructure
- **`packages/convex`** — Real-time database schema and mutations (schema in `convex/schema.ts`)
- **`packages/sandbox`** — Sandbox abstraction layer
- **`packages/cmux`** — Core shared library
- **`packages/vscode-extension`** — VS Code integration
- **`crates/cmux-pty`** / **`crates/cmux-terminal`** — Rust PTY and terminal emulation (libghostty)
- **`prompts/`** — Agent instruction templates (dev-sandbox, environment versions, task runs)
- **`evals/screenshot`** — Screenshot-based evaluation tests
- **`.beads`** — Uses Yegge's beads pattern for task tracking

**Data model:** Convex real-time database with sessions, tasks, and workspace state. OpenAPI auto-generated client ensures type-safe frontend-backend communication.

**Sandbox providers:** Docker (local) or Morph Cloud (remote VMs with RAM snapshotting). Sandbox choice is configurable, with Morph as the primary cloud option.

---

## Publisher Background

**Chris Tate** (@ctatedev) is a developer at Vercel with a strong track record in the AI tooling space:

- **agent-browser** — 20K stars, Rust-based browser automation CLI for AI agents (we already catalogue this at 7/10 relevance)
- **json-render** — 12.1K stars, "Generative UI framework" for rendering JSON specs to React/Vue/Svelte/PDF/etc. (we covered his Generative UI MCP post)
- **ralph-loop-agent** — 694 stars, continuous autonomy loop for AI SDK
- **opensrc** — 1.1K stars, fetch npm package source code for AI context
- **SpecUI** — UI specification framework (specui.org)

1,000 GitHub followers. Austin, TX. His Vercel affiliation gives him insider knowledge of deployment infrastructure, and his agent-browser project shows deep understanding of agent-browser interaction patterns. He has endorsements from Mitchell Hashimoto (Ghostty/HashiCorp) and Nick Schrock (Dagster). Despite the strong personal brand, manaflow itself has only 1 star — this is a very new project (created 2026-02-14).

---

## What's Valuable for Us

1. **PR Heatmap Review Pattern** — The AI-powered diff visualization using `generateObject` (Vercel AI SDK) to score each changed line with `shouldBeReviewedScore` and `shouldReviewWhy` is a genuinely useful concept. This could be adapted as a post-agent-PR quality gate in our pipeline without any of cmux's infrastructure. The per-file parallel AI calls with concurrency limiting (approx. 3) is a clean implementation pattern.

2. **Morph Cloud Snapshot Architecture** — RAM-state snapshotting where running processes survive snapshot/restore cycles is interesting for crash recovery. Different from our tmux approach but worth understanding for Phase 3+ when we may need cloud sandbox providers.

3. **Beads Integration** — The `.beads` directory indicates adoption of Yegge's bead-based work tracking pattern, which we've already catalogued via Gas Town. Seeing it in another project validates the pattern's portability.

4. **Agent-Agnostic CLI Spawning** — Supports Claude Code, Codex, Gemini CLI, Amp, OpenCode, and others. The harness-agnostic approach aligns with our "harness over framework" principle from the Master Blueprint.

5. **Notification Ring UX** — The native terminal's visual notification system (rings on vertical tabs when processes need attention) is a clean pattern for our tmux-based agent monitoring dashboard concept.

---

## What's NOT Relevant

1. **Cloud-First Architecture** — Convex (managed real-time DB) + Morph Cloud (managed VMs) is the opposite of our zero-infra, local-first, tmux+worktree approach. This introduces external dependencies and costs that conflict with our Claude Max flat-rate economics (Master Blueprint governing principle: minimize infrastructure overhead).

2. **GUI-Centric Workflow** — We operate headless agents via tmux. A web dashboard for visual workspace monitoring adds latency and complexity without improving agent throughput. Our orchestrator reads tmux pane output directly -- no GUI needed.

3. **Docker/VM Isolation** — Our worktree-per-agent pattern achieves filesystem isolation without container overhead. Docker/Morph VMs are heavyweight for our use case.

4. **OpenVSCode Instances** — Spawning full VS Code instances per agent is resource-intensive. Our agents don't need IDEs -- they operate via CLI tools directly.

5. **Convex Real-Time DB** — Vendor lock-in to a proprietary real-time database. Our JSON-in-git state management is sufficient and portable.

---

## Future Use Cases

- **Phase 3 (Days 60-90):** If we build a visual dashboard for agent monitoring, the notification ring UX and workspace layout patterns from cmux are worth referencing as design inspiration.
- **Phase 4 (Days 90+):** The PR heatmap review concept could be extracted as a standalone quality gate for agent-generated PRs. The `generateObject` + structured scoring schema is immediately adaptable.
- **Phase 4 (Days 90+):** If we ever need cloud sandbox providers (for client demos or multi-tenant SaaS), Morph Cloud's RAM snapshotting approach is the most interesting option seen so far.

---

## Deep Dive Candidates

- [Morph Cloud](https://morphcloud.dev) — VM sandbox provider with RAM state snapshots; used as primary sandbox backend
- [ralph-loop-agent](https://github.com/ctate/ralph-loop-agent) — Continuous autonomy loop for AI SDK (694 stars)
- [cmux native terminal](https://cmux.dev) — Swift+libghostty terminal with agent-aware vertical tabs

---

## Key Takeaway

> **Manaflow is an ambitious cloud-native alternative to our tmux-based orchestration, but its GUI+Convex+Morph stack is architecturally misaligned with our zero-infra approach -- the PR heatmap review pattern is the single most extractable idea.**
