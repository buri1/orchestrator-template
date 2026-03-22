# Beads Viewer (bv)

> **Graph-aware TUI for the Beads issue tracker: PageRank, critical path, kanban, dependency DAG visualization, and robot-mode JSON API.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [Dicklesworthstone/beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) |
| GitHub Stars | 1,400 (as of 2026-03-22) |
| Publisher | Jeffrey Emanuel (@doodlestein / Dicklesworthstone) — solo developer; also created MCP Agent Mail, beads_rust (br); part of 7-tool flywheel for agent coding |
| License | MIT + OpenAI/Anthropic Rider |
| Tech Stack | Go 1.21+, Bubble Tea (TUI), WASM graph bindings, JSONL data model, Graphviz/Mermaid export |
| Maturity | 🟢 Production (1,129 commits; brew installable; cross-platform; active development) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *This is the missing piece in our agent orchestration: deterministic, graph-theoretic task prioritization. Instead of our orchestrator naively picking the next GitHub issue by label/priority, we could use bv's PageRank + critical path analysis to identify which tasks unblock the most downstream work. The robot-mode JSON API (`--robot-triage`, `--robot-next`, `--robot-plan`) is designed exactly for headless agent consumption — no TUI needed.*
>
> *The `--robot-plan` parallel execution tracks feature is directly relevant: it could tell our orchestrator which tasks can run in parallel vs. which are sequential blockers. Combined with our tmux+worktree architecture, this enables dependency-aware parallel agent spawning.*
>
> *Jeffrey Emanuel (Dicklesworthstone) is one of the most prolific tool builders in this space. His 7-tool flywheel (beads_rust + beads_viewer + mcp_agent_mail + others) is the closest anyone has come to building a complete agent-native project management stack. We already have MCP Agent Mail in the catalogue — bv completes the picture.*
>
> *The `--format toon` (token-optimized) output is clever: reduces JSON verbosity for LLM context efficiency. The time-travel diffing across git revisions is unique — no other tool in the catalogue does this.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Directly addresses task prioritization gap in our orchestrator; robot-mode JSON API maps perfectly to headless consumption; PageRank-based dependency analysis could replace our naive issue-picking; parallel track planning maps to our tmux multi-agent spawning; integrates with MCP Agent Mail (already in catalogue) |
| **Novelty** | 9/10 | Nine graph metrics applied to task prioritization is unprecedented in agent tooling; PageRank for issue importance, betweenness for gatekeepers, HITS for hub/authority duality, critical path for execution order — no other tool combines graph theory with agent-ready JSON output; time-travel diffing unique |
| **Actionable** | 9/10 | `brew install dicklesworthstone/tap/bv` then `bv --robot-triage` — immediate integration; robot-mode flags are designed for piping into agent prompts; `--format toon` for token-efficient output; AGENTS.md auto-injection for new projects; can replace our Step 1 (GET_NEXT_TASK) with graph-aware selection |

---

## Overview

Beads Viewer (bv) is a graph-aware terminal UI for the Beads issue tracker that treats projects as dependency DAGs rather than flat lists. While traditional project management tools present issues as linear backlogs, bv computes nine graph-theoretic metrics (PageRank, betweenness centrality, HITS, critical path, eigenvector, degree, density, cycles, topological sort) to surface hidden project dynamics and identify the highest-impact tasks.

The tool operates in two modes: an interactive TUI with split-view dashboard, kanban board, dependency graph visualization, and insights panel; and a robot mode that outputs structured JSON for headless agent consumption. The robot mode is the key differentiator — commands like `--robot-triage` (comprehensive analysis with recommendations), `--robot-next` (single top pick with claim command), and `--robot-plan` (parallel execution tracks) make bv the first project management tool designed specifically for AI agent orchestrators.

Data lives in `.beads/beads.jsonl` (JSONL issue store), processed through a pipeline: Loader -> Graph Builder -> Metrics Engine -> TUI/JSON outputs. All robot commands include `data_hash` for consistency verification, `status` per-metric (computed/approx/timeout/skipped), and `as_of` for historical point-in-time analysis.

---

## Technical Architecture

### Core Pipeline
```
.beads/beads.jsonl → Loader → Graph Builder → Metrics Engine → {TUI, Robot JSON}
```

### Nine Graph Metrics
1. **PageRank** — Recursive dependency authority; identifies foundational blockers
2. **Betweenness Centrality** — Shortest-path traffic; identifies gatekeepers
3. **HITS (Hub/Authority)** — Duality scoring; epics vs. utility tasks
4. **Critical Path** — Longest DAG chain; keystones with zero slack
5. **Eigenvector Centrality** — Influential neighbor scoring; strategic dependencies
6. **Degree** — Direct connection counts
7. **Density** — Edge-to-node ratio (project coupling health)
8. **Cycles** — Circular dependency detection (structural errors)
9. **Topological Sort** — Valid execution order

### Robot Mode Commands
| Flag | Purpose | Output |
|------|---------|--------|
| `--robot-triage` | Full analysis with recommendations, quick wins, blocker analysis | Comprehensive JSON |
| `--robot-next` | Minimal top pick + claim command | Single task JSON |
| `--robot-plan` | Parallel execution tracks | Track-grouped JSON |
| `--robot-insights` | Full metrics suite | Metrics JSON |
| `--robot-label-health` | Per-label health scores | Health JSON |
| `--robot-graph` | Dependency export | JSON/DOT/Mermaid |
| `--format toon` | Token-optimized output for LLM context efficiency | Compressed JSON |

### Two-Phase Analysis
- Phase 1: Instant (cached metrics, sub-second)
- Phase 2: Async with 500ms timeout (heavy graph computations)

---

## Publisher Background

Jeffrey Emanuel (GitHub: Dicklesworthstone, X: @doodlestein) is a prolific solo developer building a 7-tool flywheel for agent-native development. His notable projects include:
- **beads_rust (br)** — The Beads issue tracker CLI (Rust)
- **beads_viewer (bv)** — This tool (Go)
- **mcp_agent_mail** — Async coordination layer for AI coding agents (already in our catalogue at 8/10 relevance)
- Multiple other agent-focused tools

He's one of the few developers building end-to-end agent-native project management infrastructure rather than just another IDE wrapper.

---

## What's Valuable for Us

1. **Replace naive issue picking with PageRank-based selection**: Our orchestrator's Step 1 (GET_NEXT_TASK) currently queries GitHub issues by label. `bv --robot-next` would give us dependency-aware task selection that unblocks the most downstream work.

2. **Parallel track planning for multi-agent spawning**: `bv --robot-plan` outputs parallel execution tracks — directly maps to our tmux multi-window agent spawning. Instead of sequential issue processing, we could spawn agents for all tasks in a parallel track simultaneously.

3. **Robot-mode JSON for headless orchestration**: Every robot command outputs structured JSON with `data_hash` consistency verification — designed for piping into agent prompts or orchestrator state machines.

4. **Token-optimized output**: `--format toon` reduces JSON verbosity for LLM context windows — immediately useful for our agent prompts.

5. **AGENTS.md auto-injection**: bv auto-injects a blurb into AGENTS.md/CLAUDE.md explaining scope boundaries and jq snippets — pattern worth adopting for our tools.

6. **Integration with MCP Agent Mail**: bv + mcp_agent_mail form a complete agent coordination stack (task prioritization + async messaging).

---

## What's NOT Relevant

- **Interactive TUI mode**: We need the headless robot mode, not the interactive dashboard (though it's useful for human debugging)
- **Kanban board view**: Our task state lives in GitHub Issues, not Beads JSONL
- **Beads JSONL format dependency**: We'd need to either convert GitHub Issues to JSONL or build a GitHub-to-Beads adapter

---

## Future Use Cases

- **Phase 1 (Now)**: Evaluate `bv --robot-triage` output quality against our current issue set; test PageRank-based prioritization vs. manual priority labels
- **Phase 2 (Days 4-60)**: Integrate `bv --robot-plan` into orchestrator loop for dependency-aware parallel spawning; build GitHub Issues -> Beads JSONL adapter
- **Phase 3 (Days 60-90)**: Full bv integration: `bv --robot-next` replaces GET_NEXT_TASK; `bv --robot-plan` drives parallel agent allocation; combined with mcp_agent_mail for inter-agent coordination
- **Phase 4 (Days 90+)**: Custom metrics engine for our specific workflow patterns; contribute upstream

---

## Key Takeaway

> **Beads Viewer is the first tool that applies graph-theoretic analysis (PageRank, critical path, betweenness) to agent task prioritization, with a robot-mode JSON API designed specifically for headless orchestrator consumption — it could transform our orchestrator from naive sequential issue processing to dependency-aware parallel execution.**
