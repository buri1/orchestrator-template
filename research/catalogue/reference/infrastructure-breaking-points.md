# Infrastructure Breaking Points

> **Quantified failure cascade for multi-agent coding fleets scaling from 5 to 50+ concurrent agents, ranked by onset order: API rate limits, context degradation, human review queues, disk I/O, git contention, and CI/CD saturation.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_PHASE2_research-infrastructure-breaking-points.md |
| Research Phase | Phase 2 |
| Last Updated | 2026-03-08 |

---

## Summary

This document maps the complete infrastructure failure cascade for multi-agent coding fleets. The research draws from Cursor's production experience (hundreds of concurrent agents), Factory.ai's compression benchmarks, Stripe's Minions architecture (1,300+ PRs/week), Faros AI's 10,000-developer telemetry study, Google DeepMind's 180-experiment scaling paper, and rate limit documentation from Anthropic, OpenAI, and Google.

The core finding is that a single human on a single Mac Studio can effectively orchestrate 10-15 concurrent coding agents. Beyond that, infrastructure itself becomes the product to build. Each bound is quantified with real numbers: API rate limits hit first at 10-20 agents (token throughput, not request count, is the wall), context degradation becomes insidious at 15-25 agents (performance drops >30% with lost-in-the-middle effect), the human review queue saturates at 20-30 agents (senior engineers spend 3.6x longer reviewing AI code than human code), disk/RAM constraints emerge at 30-50 agents (750MB-1.9GB per agent), and CI/CD pipelines saturate at 40-100 agents.

Stripe's Minions architecture is the only proven pattern at scale: isolated EC2 devboxes, deterministic context assembly, zero inter-agent coordination, hybrid blueprints with bounded agentic loops (max 2 CI rounds), and mandatory human review on every PR. Their insight -- "the walls matter more than the model" -- is the central engineering lesson.

---

## Key Findings

### Failure Cascade Ranking

| Rank | Failure | Onset (Agents) | Key Metric |
|------|---------|----------------|------------|
| 1 | API Rate Limits | 10-20 | ITPM wall before RPM wall; Tier 4 Sonnet sustains ~10-15 agents |
| 2 | Context Degradation | 15-25 | >30% performance drop (Chroma); orchestrator bottleneck at 10-20 agents consuming 40-50% execution time |
| 3 | Human Review Queue | 20-30 | 96% of devs don't trust AI code correctness; PR review time up 91% (Faros AI) |
| 4 | Disk I/O & RAM | 30-50 | 750MB-1.9GB per agent; Claude Code memory leaks up to 129GB documented |
| 5 | Git Contention | 30-50 | Ref lock contention with shared .git directory; FSMonitor essential |
| 6 | CI/CD Saturation | 40-100 | GitHub Actions: 20 concurrent (free), 500 (enterprise); queue time is the bottleneck |

### Rate Limit Vicious Cycle

Agent hits 429 -> retries with backoff -> context grows (retry adds to history) -> next call has MORE tokens -> hits ITPM limit faster -> more 429s -> cascade failure. Auto-compact retry loops and synchronized retry storms amplify this. Without randomized jitter, the entire fleet destabilizes.

### Machine Capacity

- **Mac Studio M3 Ultra 192GB**: Can host 50 worktrees but sustains only 15-25 actively computing agents (CPU bottleneck on concurrent builds)
- **Mac Studio M4 Max 128GB**: Practical for 20-30 agent worktrees (RAM constraint)
- **Hetzner AX102 128GB**: $122/mo, comparable to M4 Max but wins for distributed fleets
- **Stripe devbox pattern**: Each agent gets its own EC2 VM, eliminating all single-machine constraints

### Context Compaction

Factory.ai benchmark across 36,000+ messages: compression ratio is the wrong metric -- total tokens to complete a task matters more. Freeform summarization silently drops file paths, error codes, and architectural decisions. After 3-4 compaction cycles, orchestrators lose track of agent assignments. Mitigation: external state files as ground truth (exactly the L-Thread pattern).

### The Infrastructure Bound Map

```
AGENTS    FIRST WALL                    COST TO SOLVE
5-10      API rate limits (ITPM)        $0 (architecture)
10-15     Context degradation           $0 (engineering)
15-20     API rate limits (hard wall)   $50-200/mo (gateway)
20-30     Human review queue            $100-500/mo (tooling)
30-40     Machine RAM/CPU               $122-488/mo (infra)
40-50     Git ref contention            $0 (configuration)
50-100    CI/CD queue saturation        $300-600/mo (CI)
100+      Organizational complexity     $2,000+/mo (cloud)
```

---

## Actionable Insights

1. **Model tiering is the first mitigation**: Orchestrator on Opus (low throughput), code agents on Sonnet, scouts on Haiku. Each model class has independent rate limits.

2. **Prompt caching changes the math**: Cached tokens don't count against ITPM. With 70% cache hit rate, 50 Sonnet agents become feasible at Tier 4.

3. **Multi-provider load balancing requires affinity**: Use LiteLLM/Portkey but maintain provider affinity per agent -- load balancing destroys prompt caching.

4. **pnpm is non-negotiable at scale**: Reduces per-worktree dependency storage from ~500MB to ~50MB. 50 worktrees: 25GB vs 2.5GB.

5. **External state files survive compaction**: The L-Thread pattern of using `orchestrator-state.json` as ground truth is exactly the right architecture -- context memory is lossy.

6. **Progressive trust levels for review**: Auto-merge for low-risk changes, AI-assisted review for medium-risk, human review for high-risk. Stripe caps at 2 auto-fix CI attempts.

7. **Observability before scale**: Without dashboards tracking API usage per agent, context utilization, CI queue depth, and review backlog, scaling past 10 agents is blind scaling.

8. **Scaling path**: Phase 1 (3-5 agents, single Mac Studio) -> Phase 2 (10-15 agents + caching + model tiering) -> Phase 3 (30-50 agents + Hetzner fleet + AI gateway) -> Phase 4 (100+ agents, Stripe devbox pattern).

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Economic analysis of the infrastructure costs quantified here |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | "Observability before scale" principle; hook-based monitoring reference implementation |
| [practitioners/steipete.md](../practitioners/steipete.md) | tmuxwatch/CodexBar for quota tracking; practical 1-4 agent sweet spot on main branch |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Hit RAM wall at 4-5 agents on Mac Mini 16GB; upgraded to Mac Studio for 5+ agents |
| [reference/merge-conflicts-at-scale.md](../reference/merge-conflicts-at-scale.md) | Git contention and merge queue strategies that interact with CI saturation |
| [reference/observability-trust-kpis.md](../reference/observability-trust-kpis.md) | Monitoring frameworks for the infrastructure bounds documented here |
| [reference/human-review-bottleneck.md](../reference/human-review-bottleneck.md) | Deep dive on Rank 3 failure (human review queue saturation) |
