# Beads Viewer: PageRank-Based DAG Task Prioritization Demo

> **@doodlestein — 2026-03-22**

| Field | Value |
|-------|-------|
| Source | [x.com/doodlestein/status/2035483415613468858](https://x.com/doodlestein/status/2035483415613468858) |
| Author | Jeffrey Emanuel (@doodlestein / Dicklesworthstone) — Solo developer, 7-tool agent flywheel builder |
| Date | 2026-03-22 |
| Topics | beads-viewer, PageRank, DAG, task-prioritization, graph-theory, agent-tooling, robot-mode |
| Type | Single post (with video demo) |

---

## Burak's Notes

> *This post was flagged as particularly interesting by Burak. Jeffrey is demonstrating the visual DAG + PageRank task prioritization in action. The video shows how beads_viewer renders a project's task dependency graph and uses PageRank scores to highlight which tasks are most critical to unblock downstream work. This is exactly the missing intelligence layer our orchestrator needs.*
>
> *The demo appears to show the interactive TUI mode with real-time graph rendering and metric overlays. Combined with the robot-mode JSON API for headless use, this tool bridges human understanding and agent consumption of project state.*

---

## Key Takeaways

1. **Visual proof of graph-based prioritization** — The video demonstrates PageRank scores visually overlaid on a dependency DAG, showing how foundational tasks "glow" with higher importance based on how many downstream tasks they unblock.
2. **From visual to headless** — The same graph analysis that powers the visual demo is available via `--robot-triage` and `--robot-next` for agent consumption, making the demo a proof-of-concept for our orchestrator integration.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct demonstration of the tool we're evaluating for orchestrator task selection; video proof validates the graph-theoretic approach to task prioritization; Jeffrey's 7-tool flywheel aligns with our multi-tool orchestration vision |

---

## Full Content

Jeffrey Emanuel (@doodlestein) shared a video demonstration of Beads Viewer (bv), his graph-aware TUI for the Beads issue tracker. The post shows the tool visualizing project tasks as a dependency DAG with PageRank-based importance scoring, critical path highlighting, and interactive navigation.

The key insight from the demo: task prioritization should not be based on arbitrary human-assigned priority labels but on graph-theoretic analysis of dependency structure. A task that blocks 15 downstream tasks (even if labeled "medium priority") should be worked on before a task that blocks nothing (even if labeled "high priority").

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/Dicklesworthstone/beads_viewer | Full repository analysis | `/tool-catalogue` |
| https://jeffreyemanuel.com/projects/beads-viewer | Portfolio page with additional context | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Beads Viewer (bv) | Primary subject of the post | Yes — [agent-harnesses/beads-viewer.md](../agent-harnesses/beads-viewer.md) |
| beads_rust (br) | Underlying issue tracker CLI | No |
| MCP Agent Mail | Part of Jeffrey's 7-tool flywheel | Yes — [orchestration-platforms/mcp-agent-mail.md](../../orchestration-platforms/mcp-agent-mail.md) |
