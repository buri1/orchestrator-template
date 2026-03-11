# OneContext

> **An Agent Self-Managed Context layer — unified context for ALL AI Agents, so anyone/any agent can pick up from the same point.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | [LastPieceAI/OneContext](https://github.com/LastPieceAI/OneContext) (formerly TheAgentContextLab/OneContext) |
| GitHub Stars | 9 (as of 2026-03-08) |
| Publisher | LastPieceAI / Jiayuan Zhu — startup/solo |
| License | Not specified |
| Tech Stack | Python 3.11+ (core CLI), Node.js wrapper (npm), Slack integration |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Agent context continuity tool. Records agent trajectories, makes them shareable via Slack, and lets other agents/humans resume from the same context. The "import past Codex/Claude sessions" feature (v0.8.3) is the most interesting angle — cross-session, cross-device, cross-agent continuity. Very early stage (9 stars, minimal docs, no license declared). The org also has an "OpenContext" repo ("share your AI history to the internet") which suggests they're exploring the context-sharing space broadly. NOTE: There is a completely different project also called "OneContext" by robinfaraj (31 stars, Apache-2.0) that is a personal AI identity/profile platform — do not confuse the two.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Addresses agent context continuity which we solve differently (JSON state files + git + CLAUDE.md). Our orchestrator already persists state deterministically. |
| **Novelty** | 5/10 | The "record agent trajectories and let others resume" concept is interesting but not new — our orchestrator-state.json + tmux-state.json already accomplish this. The Slack sharing angle is novel for team collaboration. |
| **Actionable** | 3/10 | Too early-stage (9 stars, no license, minimal docs). Our existing state management is more mature and fits our architecture better. |

---

## Overview

OneContext is a CLI tool that wraps around AI coding agents (Claude Code, OpenAI Codex) to automatically record their working trajectories — essentially capturing what the agent did, in what order, and what the resulting context looks like. It then provides mechanisms to share that recorded context with team members via Slack or shareable links, and to load that context into new agent sessions so work can continue seamlessly.

The tool operates through an npm-installed CLI (`onecontext-ai`, alias `oc`) that proxies to an underlying Python package. It introduces the concept of "Contexts" (logical groupings of related work) containing "Sessions" (individual agent work periods). When you run agents "with OneContext," it captures session summaries automatically and aggregates them into context summaries.

The v0.8.3 release (Feb 14, 2026) added the ability to import past Codex and Claude sessions as context, enabling cross-session, cross-device, and cross-agent continuity — essentially letting you resume work started in one tool from another.

---

## Technical Architecture

```
┌──────────────────────────────┐
│     OneContext CLI (oc)      │
│  npm wrapper → Python core   │
└──────┬──────────┬────────────┘
       │          │
┌──────▼──────┐  ┌▼────────────────┐
│  Context    │  │  Session         │
│  Manager    │  │  Recorder        │
│             │  │  (trajectory     │
│ - Create    │  │   capture)       │
│ - Archive   │  │                  │
│ - Restore   │  │ - Auto-summary   │
│ - Share     │  │ - Import past    │
└──────┬──────┘  │   sessions       │
       │         └─────────────────┘
       │
┌──────▼──────────────────────┐
│  Sharing Layer              │
│  - Shareable links          │
│  - Slack integration        │
│  - Context chat (Q&A)       │
└─────────────────────────────┘
```

**Key abstractions:**
- **Context**: A named grouping of related agent work (like a project or feature). Has short and detailed summaries.
- **Session**: A single agent work period under a Context, tied to a working path. Automatically summarized.
- **Share**: Generates a link + message. Recipients can ask questions about the context or import it locally.
- **Archive/Restore**: Contexts and sessions can be archived and later restored with full state.

**Data model details are opaque** — the README and Documentation.md focus on UI workflows (screenshots of a terminal GUI) rather than storage format, API surface, or internal architecture. No schema documentation, no API reference, no configuration format beyond CLI commands.

---

## Publisher Background

**Jiayuan Zhu** is the sole committer. The organization "LastPieceAI" was created Feb 26, 2026, and has two repos: OneContext (9 stars) and OpenContext (0 stars, described as "share your AI history to the internet"). The repo was originally under "TheAgentContextLab" org (image URLs in Documentation.md still reference that org), then transferred to LastPieceAI.

Very early-stage, solo developer, no visible funding, no track record of other projects. The project has been active for about one month (first release Feb 7, 2026).

---

## What's Valuable for Us

1. **Agent trajectory recording concept**: The idea of automatically capturing what an agent did (not just the final state but the trajectory) is worth noting. Our `orchestrator-state.json` captures agent status but not the sequence of actions. However, our tmux `capture-pane` already provides a form of trajectory recording for individual agents.

2. **Cross-agent context import**: The v0.8.3 feature of importing past Claude/Codex sessions is conceptually interesting — if we ever need to hand off work between different agent types (e.g., Claude Code to Pi Agent), having a standardized context export format would help. But we're not there yet.

3. **Slack-based context sharing**: The pattern of making agent context queryable via Slack could be useful for the Marketing Engine or Client Work business lines where non-technical team members need to understand what agents are doing.

---

## What's NOT Relevant

1. **Replaces our existing state management**: Our `orchestrator-state.json` + `orchestrator-tmux-state.json` + git-backed state files are deterministic, version-controlled, and integrated into our orchestration loop. OneContext would be an additional layer with no clear benefit — violating Governing Principle #7 ("Build only what you have needed in the last 30 days").

2. **SaaS/cloud dependency unclear**: The sharing features (shareable links, Slack integration) likely require a cloud backend, which conflicts with our zero-infra, git-backed approach and DSGVO requirements for client work.

3. **No license declared**: Cannot be used in production or gov client work without a clear license. Apache-2.0 or MIT would be required.

4. **Opaque architecture**: No documentation on data format, storage, or APIs means we can't evaluate whether the underlying patterns are adoptable even if the tool itself isn't.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Not applicable. Our state management works.
- **Phase 2 (Days 4-60)**: Not applicable. Focus is on deterministic harness and quality gates.
- **Phase 3 (Days 60-90)**: **Watch only.** If the project matures and gains a clear license, the agent trajectory recording could be interesting for debugging multi-agent coordination failures. The Slack sharing pattern could feed into the Marketing Engine's team collaboration needs.
- **Phase 4 (Days 90+)**: If cross-agent-type handoffs become a requirement (Claude Code <-> Pi Agent <-> Codex), a standardized context export format would be valuable. But by then, better-established solutions will likely exist.

---

## Key Takeaway

> **OneContext solves agent context continuity for team collaboration (shareable agent trajectories via Slack), but is too early-stage (9 stars, no license, opaque architecture) to act on — our git-backed state files already provide stronger deterministic context persistence.**
