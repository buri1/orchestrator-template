# Broomie

> **Open-source parallel agent management tool — worktree creation, agent status dashboard, automated merges and PR creation.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [broomie.org](https://broomie.org) (GitHub repo not yet publicly indexed) |
| GitHub Stars | Unknown (site live but repo not discoverable as of 2026-03-08) |
| Publisher | Rob — solo developer, presented at Coding Agents: AI Driven Dev Conference unconference (2026-03-08) |
| License | Open source (specific license TBD) |
| Tech Stack | Unknown (likely TypeScript/Node given Claude Code ecosystem; uses git worktrees) |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly addresses parallel agent management with worktree isolation, status tracking, and automated merges — all core problems in our L-Thread Orchestrator. Maps to Master Blueprint's shared infrastructure layer (git worktree isolation, health monitors). |
| **Novelty** | 6/10 | The agent status dashboard (working/blocked/help states) is a formalization we haven't seen cleanly packaged elsewhere. The combination of worktree creation + status + merge + PR in one tool is new as a cohesive product, though individual pieces exist (Overstory, ccswarm, etc.). |
| **Actionable** | 7/10 | If the repo becomes public: high adoption potential. The status states (working/blocked/help) and automated merge-to-PR pipeline are patterns we can adopt immediately regardless. |

---

## Overview

Broomie is Rob's open-source tool for managing multiple Claude Code agents working in parallel on the same codebase. It was presented at the community unconference session of the Coding Agents: AI Driven Dev Conference (March 2026), where Rob was one of the most active contributors with multiple high-value patterns.

The tool solves the core parallel agent workflow problem: how do you spin up multiple agents, give each one an isolated workspace, monitor their status, and cleanly merge their work back together? Broomie handles this by creating git worktrees for each agent (ensuring file-level isolation), providing a dashboard that shows each agent's current state (working, blocked, or requesting help), and automating the merge and pull request creation process when agents complete their tasks.

Rob's broader philosophy, also demonstrated at the unconference, emphasizes container-based execution ("if you run in a container, you can do dangerously skip permissions and it's not dangerous"), plan.md files over Claude Code's built-in plan mode, screenshot-based visual QA via Playwright, and agent-maintained documentation with validation skills at submission time. Broomie appears to be the management layer that ties these practices together.

---

## Technical Architecture

Based on unconference presentation details, Broomie's architecture includes:

```
┌────────────────────────────────────────┐
│          Agent Status Dashboard        │
│   ┌──────────┬──────────┬──────────┐   │
│   │ working  │ blocked  │  help    │   │
│   │ Agent A  │ Agent C  │ Agent E  │   │
│   │ Agent B  │          │          │   │
│   │ Agent D  │          │          │   │
│   └──────────┴──────────┴──────────┘   │
├────────────────────────────────────────┤
│        Worktree Management Layer       │
│   - Creates isolated git worktrees     │
│   - One worktree per agent             │
│   - Branch management                  │
├────────────────────────────────────────┤
│         Merge & PR Pipeline            │
│   - Automated merge on completion      │
│   - PR creation per agent/task         │
│   - Conflict handling                  │
├────────────────────────────────────────┤
│         Agent Lifecycle                │
│   - Spawn agents in worktrees          │
│   - Monitor status transitions         │
│   - Handle blocked/help escalation     │
└────────────────────────────────────────┘
```

**Key design decisions:**
- **Worktree-per-agent isolation**: Each agent operates in its own git worktree, preventing file conflicts during parallel execution
- **Three-state status model**: Agents report as `working` (progressing normally), `blocked` (stuck, needs intervention or dependency), or `help` (requesting human assistance) — a clean formalization of agent health
- **Automated merge pipeline**: When an agent completes, Broomie handles merging the worktree branch and creating a pull request, removing manual git ceremony
- **Container-friendly**: Rob advocates running agents in containers where `--dangerously-skip-permissions` becomes safe, suggesting Broomie is designed for containerized environments

---

## Publisher Background

Rob presented at the Coding Agents: AI Driven Dev Conference unconference (2026-03-08) and was one of the session's most prolific contributors, offering multiple battle-tested patterns beyond Broomie itself: plan.md over plan mode, screenshot-based visual QA with Playwright, container execution for safe permissions, and agent-maintained documentation with validation skills. This breadth of practical experience suggests a serious practitioner building tooling from real production workflows. Full name and other projects not yet publicly documented.

---

## What's Valuable for Us

1. **Three-state agent status model (working/blocked/help)**: Our current tmux-based monitoring uses `capture-pane` output parsing, which is fragile. Broomie's explicit state model maps cleanly to our orchestrator state files (`_bmad/orchestrator-tmux-state.json`). We should adopt these three states as our canonical agent health vocabulary.

2. **Automated worktree-to-PR pipeline**: We currently manage worktrees and PRs semi-manually through our orchestrator commands. An automated pipeline from worktree completion → merge → PR creation eliminates manual git ceremony and directly addresses Master Blueprint Principle #5 (reducing what the human needs to review).

3. **Rob's visual QA pattern**: While not part of Broomie itself, Rob's companion pattern of Playwright screenshot walkthroughs at release tags, with pixel diffs analyzed by sub-agents, is a concrete implementation of our E2E testing gate requirement (Rule #2: E2E Testing ist Gate).

4. **Container execution philosophy**: Running agents in containers where `--dangerously-skip-permissions` is safe aligns with Master Blueprint's infrastructure layer. This is a practical path to the sandboxing we need at scale.

---

## What's NOT Relevant

- **Dashboard UI**: Our orchestrator is headless by design — state files + tmux, not interactive UIs. A dashboard would add complexity counter to Principle #7 (build only what you've needed in the last 30 days). However, the status *data model* behind the dashboard is very relevant.
- **Standalone tool adoption**: We have a working orchestrator with tmux+worktree isolation already. Adopting Broomie wholesale would mean replacing proven infrastructure. The right approach is to study patterns and adopt selectively.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt the three-state status model (working/blocked/help) in our `orchestrator-tmux-state.json`. Implement automated merge-to-PR pipeline for agent-completed worktrees.
- **Phase 3 (Days 60-90)**: If scaling beyond 3-4 parallel agents, Broomie's dashboard concept becomes more relevant for fleet visibility. Consider the status model as input to our deterministic health monitoring.
- **Phase 4 (Days 90+)**: Container-based execution becomes essential at scale. Broomie's container-first philosophy is the right direction for the client work orchestrator where DSGVO sandboxing is mandatory.

---

## Key Takeaway

> **Broomie packages the worktree-per-agent + status dashboard + auto-merge-to-PR workflow into a cohesive tool — the three-state agent model (working/blocked/help) and automated PR pipeline are the two patterns to adopt immediately.**
