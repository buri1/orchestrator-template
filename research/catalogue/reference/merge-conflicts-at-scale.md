# Merge Conflicts at Scale

> **The single biggest barrier to agent parallelism: 19-20% empirical conflict rate with N(N-1)/2 combinatorial surface growth, assessed across Graphite partitioned queues, steipete's main-branch workflow, Gas Town's Refinery pattern, and AI-assisted resolution tools.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_PHASE2_research-merge-conflicts-at-scale.md |
| Research Phase | Phase 2 |
| Last Updated | 2026-03-08 |

---

## Summary

The merge problem is the fundamental tension between parallelism (speed) and consistency (correctness). With N parallel branches, the potential conflict surface grows as N(N-1)/2 -- every branch can conflict with every other branch. A study of 143 open-source projects found that almost 1 in 5 merges (19-20%) cause conflicts, and in 75% of those cases, a developer needed to reflect on program logic to resolve it. For AI agents, which produce changes 10-100x faster and have no cross-agent awareness, the base conflict rate likely understates reality: 30-50% of parallel agent time can be lost to conflict resolution without isolation (Dave Paola).

Five strategies exist along a parallelism-vs-conflict tradeoff spectrum: steipete's main-branch atomic commits (1-4 agents), git worktrees with integration branches (5-10 agents), directory/package partitioning (clear-boundary monorepos), Graphite's partitioned merge queues (large teams), and Gas Town's Refinery single-writer serialization (10+ agent swarms). AI-assisted merge resolution remains unreliable: the best tool (Harmony by Source.dev) achieves 88% on domain-specialized Android code using fine-tuned SLMs, while general-purpose LLMs cap around 50% (merde.ai). The optimal architecture layers prevention (partitioning), detection (Clash), resolution (domain-tuned SLMs), serialized merge (Refinery pattern), and human escalation for the 10-15% that remain unresolvable.

---

## Key Findings

### The Quadratic Conflict Surface

| Parallel Agents | Conflict Pairs N(N-1)/2 | Relative Growth |
|-----------------|-------------------------|-----------------|
| 2 | 1 | 1x |
| 4 | 6 | 6x |
| 8 | 28 | 28x |
| 10 | 45 | 45x |
| 16 | 120 | 120x |
| 20 | 190 | 190x |

Academic evidence from 143 OSS projects: 19-20% of merges cause conflicts. Developer roles matter: top contributors + occasional contributors yield 32.31% conflict rate. Raw developer count shows almost no correlation with conflict frequency (cor=0.08) -- what matters is branch divergence speed.

### Strategy Comparison

| Strategy | Parallelism | Conflict Risk | Best For |
|----------|------------|---------------|----------|
| All on main (steipete) | 1-4 agents | High | Solo dev, known codebase |
| Git worktrees + PRs | 5-10 agents | Medium | Teams, diverse tasks |
| Directory partitioning | Medium | Low | Monorepos, clear boundaries |
| Graphite partitioned queues | High | Low per partition | Large teams, CI-heavy |
| Gas Town Refinery | Very high | Absorbed by Refinery | Swarm-scale, 10+ agents |
| Container isolation | Very high | Very low | Infrastructure-ready teams |

### Graphite: Stack-Aware Merge Queues

Graphite built the first stack-aware merge queue with partitioned CI. Results from production customers:
- **+33%** PRs merged per developer (Shopify)
- **75%** of all Shopify PRs go through Graphite
- **2.5x** faster merges with stacked PRs
- **-60%** p95 merge time (Parallel CI customers)
- **7 hours/week** saved (Asana)
- Binary search algorithm isolates a failing PR in a 32-PR batch with just 5 CI runs
- Pricing: $40/user/month (Team), enterprise custom for partitioned queues

### steipete's Main-Branch Workflow

Peter Steinberger runs all agents directly on main without worktrees. Works because:
- Atomic commits listing each touched file explicitly
- "Blast radius" assessment before assigning work
- Sweet spot: 1-2 agents normally, ~4 for cleanup/tests/UI
- Speed-over-safety philosophy: git provides the safety net
- **Limitation**: Solo developer only, 1-4 agent ceiling, requires deep codebase knowledge

### Gas Town's Refinery Pattern (Steve Yegge)

Single-writer merge serialization: Polecats (workers) operate in parallel on separate worktrees, Refinery merges one at a time to main via rebasing. Key innovations:
- Shared `.repo.git` eliminates network latency from merge loop
- Backpressure awareness: throttles Mayor when queue grows too fast
- **Re-imagination**: when conflict is too complex, Refinery re-implements the change against new HEAD
- **Limitation**: Throughput bottleneck -- Refinery can only merge as fast as it can process

### AI-Assisted Merge Resolution

| Tool | Approach | Success Rate |
|------|----------|-------------|
| Harmony (Source.dev) | Fine-tuned SLMs (Llama-3.1-8B, Qwen3-4B) | 88% (Android/AOSP) |
| merde.ai (Sketch.dev) | LLM with extended context | ~50% |
| VS Code AI Merge | Chat-based with merge base context | Not published |
| LLMinus (Microsoft/NVIDIA) | Historical embeddings + LLM | In development |

ConGra benchmark (44,948 conflicts, 34 projects) counterintuitive findings: longer context does not help; general LLMs beat code LLMs; domain-specific fine-tuning massively outperforms prompting. No tool reliably resolves >90% of conflicts automatically.

### The Clash Tool

Rust CLI (open source) that detects merge conflicts between all worktree pairs during development. Integrates with Claude Code hooks for automatic detection before every file write. Converts the merge problem from "surprise at the end" to "continuous awareness."

---

## Actionable Insights

1. **Layer the defenses**: Prevention (directory partitioning + dependency-aware decomposition) to eliminate 70-80% of potential conflicts -> Detection (Clash) to catch conflicts early -> Resolution (domain-tuned SLMs) for remaining -> Serialized merge (Refinery pattern) as final gate -> Human escalation for 10-15% unresolvable.

2. **Partition by file pattern, not by developer**: Graphite's partitioned queues split repos so frontend changes don't wait for backend CI. This is the highest-leverage infrastructure investment for monorepos.

3. **Use "blast radius" thinking before assigning agent work**: steipete's approach of estimating overlap probability before parallelizing is implicit partitioning through human judgment. For orchestrators, make this explicit with dependency graph analysis.

4. **Adopt Clash for real-time conflict awareness**: Integrate with Claude Code hooks to detect conflicts before file writes, not after PR submission. This preserves agent work instead of wasting it.

5. **Don't trust general-purpose LLMs for merge resolution**: At best 50% success rate. If you need automated resolution, invest in domain-specific fine-tuned SLMs (Harmony pattern).

6. **The Refinery is architecturally sound but creates a bottleneck**: Use for swarm-scale operations (10+) where the alternative is chaos. For smaller fleets, prefer partitioning + worktrees.

7. **Key metric to track**: Conflicts per PR, resolution time, percentage resolved automatically. Without these, you cannot measure whether your merge strategy is working.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Merge conflict overhead is a direct cost multiplier on agent parallelism ROI |
| [practitioners/steipete.md](../practitioners/steipete.md) | Main-branch atomic commit workflow and blast radius assessment detailed here |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Separate worktree per agent approach; tmux-based agent isolation |
| [reference/infrastructure-breaking-points.md](../reference/infrastructure-breaking-points.md) | Git contention (Rank 5) and CI/CD saturation (Rank 6) directly interact with merge queue pressure |
| [reference/yegge-gas-town-thesis-analysis.md](../reference/yegge-gas-town-thesis-analysis.md) | Gas Town Refinery pattern analyzed in depth |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | "Observability before scale" -- Clash and merge metrics are prerequisites for scaling parallelism |
