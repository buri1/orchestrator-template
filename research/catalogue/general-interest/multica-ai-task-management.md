# Multica

> **Open-source platform that turns coding agents into real teammates — assign tasks to agents in the same UI you use for humans.**

| Field | Value |
|-------|-------|
| Category | 🧩 General Interest |
| Website | [multica.ai](https://multica.ai/) |
| Publisher | Multica (team unknown) |
| License | Open-source (self-hostable) |
| Tech Stack | Docker Compose / Kubernetes, WebSocket, CLI |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses the "agents as teammates" framing — task lifecycle management (enqueue/claim/start/complete/fail) mirrors our orchestrator loop. The "Autonomous Skills" concept (packaged capability definitions) is close to our command/prompt pattern. |
| **Novelty** | 6/10 | The human-agent unified assignee model and reusable skill packaging are differentiated. WebSocket-based live progress streaming is a nice touch vs. our tmux capture-pane polling. |
| **Actionable** | 5/10 | Open-source and self-hostable, so we could inspect the skill packaging pattern. However, adopting the full platform would replace our orchestrator rather than augment it — more useful as a design reference. |

---

## Overview

Multica is an open-source project management platform purpose-built for mixed human-AI teams. Agents appear as first-class teammates in the same UI — they show up in assignee dropdowns, maintain profiles, report status updates, create issues, and participate in activity feeds alongside humans.

The platform manages the full task lifecycle through discrete stages: enqueue, claim, start, complete/fail. Agents proactively report blockers and stream real-time progress via WebSocket. This is more structured than the typical "fire a prompt and wait" pattern — it gives agents agency to report status, create sub-issues, and flag problems.

The "Autonomous Skills" system packages reusable capability definitions — including code, configuration, and context — that any team member (human or agent) can execute. Examples include deploy operations, SQL migrations, and code review tasks. This is conceptually similar to our `.claude/commands/` pattern but with a more formal packaging and discovery mechanism.

Runtime orchestration provides a unified dashboard managing local daemons and cloud runtimes with real-time monitoring, usage charts, and auto-detection of available CLIs.

---

## Supported Agents

- Claude Code
- Codex
- OpenClaw
- OpenCode
- Additional backends addable (open-source)

---

## Deployment

- Self-hostable via Docker Compose, single binary, or Kubernetes
- Code never passes through Multica servers — execution occurs locally or on user infrastructure
- Managed cloud version also available
- Free to start

---

## What's Valuable for Us

1. **Task lifecycle stages**: The enqueue/claim/start/complete/fail model is more granular than our binary "spawned/done" tracking. Adding intermediate states (claimed, blocked, failed) to our orchestrator state would improve observability.

2. **Autonomous Skills packaging**: Bundling code + config + context into a reusable, discoverable unit is a formalization of what we do ad-hoc with command files. Could inform a more structured approach to our prompt/command library.

3. **WebSocket progress streaming**: Real-time progress updates vs. our polling-based tmux capture-pane. Not urgent but a better UX pattern if we ever build a dashboard.

4. **Agent-as-teammate UX**: The unified assignee model where agents and humans are interchangeable in the UI is a strong design pattern for client-facing demos.

---

## What's NOT Relevant

- **Full platform adoption**: Would replace our orchestrator rather than complement it. We're committed to tmux + Claude Code.
- **Cloud-hosted version**: We run everything locally for cost and control reasons.
- **Multi-agent diversity**: We're Claude-only by design choice.

---

## Key Takeaway

> **Multica's task lifecycle stages (enqueue/claim/start/complete/fail) and Autonomous Skills packaging pattern are design references worth studying — they formalize patterns we do informally. The platform itself is a competitor, not a tool we'd adopt.**
