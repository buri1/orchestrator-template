# Graphite

> **AI-native code review platform with stacked PRs, merge queue, and AI reviewer — built for teams shipping at high velocity on GitHub.**

| Field | Value |
|-------|-------|
| Category | 🧬 Code Intelligence |
| Repository | [github.com/withgraphite](https://github.com/withgraphite) (CLI closed-source since 2023; docs repo public) |
| GitHub Stars | N/A (CLI moved to private monorepo; public repos are forks/docs only) |
| Publisher | Graphite, Inc. (startup — acquired by Cursor Dec 2025) |
| License | Proprietary (CLI was open-source until July 2023, then closed) |
| Tech Stack | TypeScript (CLI), React (web dashboard), GitHub API integration |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly addresses our 19-20% merge conflict rate with multi-agent development. Stacked PRs + stack-aware merge queue is exactly the tool for our bottleneck. The Cursor acquisition makes this even more relevant since we're Claude-first but may interact with Cursor-using teams. |
| **Novelty** | 6/10 | Stacked diffs are a known pattern (Phabricator, Gerrit). Graphite's innovation is making it work natively on GitHub + adding AI review. The merge queue being stack-aware is the genuinely novel piece. |
| **Actionable** | 8/10 | Can sign up and start using immediately. CLI installs via npm/brew. 30-day free trial. Could integrate into our agent workflow today — agents create stacked PRs instead of monolithic ones. |

---

## Overview

Graphite is an AI-powered code review platform built on top of GitHub that introduces three key capabilities: **stacked pull requests** (break large changes into small, dependent PR chains), a **stack-aware merge queue** (automatically manages merge ordering, conflict prevention, and CI validation for PR stacks), and **AI code review** ("Diamond" — an AI reviewer that scans for bugs, logical errors, and suggests fixes pre-merge).

The platform was founded in 2020 by Tomas Reimers (ex-Facebook), Greg Foster (ex-Airbnb/Google), and Merrill Lutsky (founder of Posmetrics). Graphite raised $20M Series A from a16z in 2022, then $52M Series B from Accel/Anthropic/Shopify/a16z in March 2025, reaching a $290M valuation. In December 2025, **Cursor acquired Graphite** for undisclosed terms (reportedly "way over" the $290M valuation). Graphite continues to operate independently with the same team and product, with plans to deeply integrate into Cursor's AI coding workflow throughout 2026.

The platform serves tens of thousands of engineers at 500+ companies including Shopify, Snowflake, Figma, and Perplexity. Revenue grew 20x in 2024.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Developer Workflow                 │
│                                                      │
│  ┌────────────┐   ┌────────────┐   ┌──────────────┐ │
│  │ Graphite    │   │ VS Code    │   │ Web Dashboard │ │
│  │ CLI (gt)    │   │ Extension  │   │ (PR Inbox)   │ │
│  └─────┬──────┘   └─────┬──────┘   └──────┬───────┘ │
│        └────────────┬────┘                 │         │
│                     ▼                      │         │
│           ┌──────────────────┐             │         │
│           │  Graphite API     │◄────────────┘         │
│           └────────┬─────────┘                       │
│                    │                                  │
│      ┌─────────────┼──────────────┐                  │
│      ▼             ▼              ▼                  │
│ ┌─────────┐ ┌───────────┐ ┌──────────────┐          │
│ │ Stacked  │ │  Merge    │ │  Diamond AI  │          │
│ │ PR Mgmt  │ │  Queue    │ │  Reviewer    │          │
│ │          │ │ (stack-   │ │ (bugs, logic │          │
│ │ gt create│ │  aware)   │ │  errors)     │          │
│ │ gt stack │ │           │ │              │          │
│ └─────────┘ └───────────┘ └──────────────┘          │
│                    │                                  │
│                    ▼                                  │
│           ┌──────────────────┐                       │
│           │    GitHub API     │                       │
│           └──────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

- **CLI (`gt`)**: Installed via `npm install -g @withgraphite/graphite-cli` or `brew install withgraphite/tap/graphite`. Commands: `gt create` (create PR), `gt stack` (manage stack), `gt submit` (push stack to GitHub)
- **Stacked PRs**: Each PR in a stack targets the previous PR's branch, not main. Graphite auto-rebases the entire stack when any PR is updated or merged.
- **Merge Queue**: Stack-aware — if an entire stack is ready, it processes all PRs in parallel with fast-forward merges (no redundant CI runs). Keeps main branch green by testing before merge.
- **Diamond AI**: Automated code reviewer that runs on every PR. Scans for bugs, logical errors, and security issues. Provides suggested fixes. "Graphite Chat" allows interactive follow-up.
- **CI Optimizer**: Stack-integrated CI that only runs tests affected by each PR's changes
- **Slack integration**: Actionable notifications for review requests and merge status

---

## Publisher Background

Graphite was founded by three experienced engineers: **Tomas Reimers** (ex-Facebook), **Greg Foster** (ex-Airbnb, ex-Google), and **Merrill Lutsky** (previously founded Posmetrics). The company is based in NYC with ~30 employees.

**Funding history**: $9M seed (2021) → $20M Series A from a16z (2022) → $52M Series B from Accel + Anthropic Anthology Fund + Shopify Ventures + Figma Ventures + a16z (March 2025). Total raised: ~$81M.

**Acquisition**: In December 2025, **Cursor** (valued at $29B) acquired Graphite for terms reportedly above its $290M valuation. This was part of Cursor's acquisition spree as AI coding competition intensified. Graphite continues operating independently.

**Credibility**: Very high. Anthropic as an investor is notable for us given our Claude-first stack. Shopify as both investor and customer validates the product for high-velocity engineering teams. The Cursor acquisition positions Graphite as the code review layer for the dominant AI coding tool.

---

## What's Valuable for Us

- **Stack-aware merge queue solves our #1 scaling bottleneck**: Our 19-20% merge conflict rate with multi-agent development is a documented problem. Graphite's merge queue is specifically designed to prevent conflicts by testing and merging PRs in order, with stack awareness ensuring dependent changes land correctly. This is the most directly relevant tool we've catalogued for this problem.
- **Stacked PRs for agent workflow**: Instead of having agents create large, monolithic PRs (which are hard to review and conflict-prone), we could have agents create stacked PRs — small, incremental changes that can be reviewed and merged independently. The orchestrator could map task decomposition directly to PR stacks.
- **AI review as quality gate**: Diamond AI review could serve as an automated quality gate in our pipeline, complementing our E2E testing requirement. Agent writes code → Diamond reviews for bugs → E2E tests pass → merge via queue.
- **CLI is scriptable**: `gt create`, `gt submit`, `gt stack` commands can be called from our orchestrator's terminal-write pattern. No API integration needed — just shell commands.
- **Human review ceiling management**: Our research identified 5-6 PRs/day as the human review ceiling. Graphite's AI review + stacked small PRs could push this limit higher by making each review faster and catching bugs before human eyes see the code.

---

## What's NOT Relevant

- **Proprietary / closed-source CLI**: Can't study internals or fork. Must rely on Graphite as a service. If they change pricing or Cursor changes strategy, we're locked in.
- **Web dashboard / PR Inbox**: Our orchestrator is terminal-first. The web dashboard is useful for Burak's manual review but not for automated agent workflows.
- **Cursor integration trajectory**: Post-acquisition, Graphite may increasingly optimize for Cursor users. We're Claude Code + terminal. If features become Cursor-exclusive, that's a risk.
- **Pricing uncertainty**: Free for 30 days, then paid. The organization-level pricing and paywall (10 open stacks for free) could be a constraint at scale.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Install CLI, set up Graphite on the orchestrator repo. Start using stacked PRs manually to validate the workflow before automating.
- **Phase 2 (Days 4-60)**: Integrate `gt` commands into agent spawning. When an agent completes a task, it creates a stacked PR via CLI. Merge queue manages ordering. Diamond AI provides first-pass review.
- **Phase 3 (Days 60-90)**: Full automation — orchestrator decomposes features into task stacks, maps each task to a PR in a stack, agents create stacked PRs, merge queue handles conflicts, AI review catches bugs, human review is final gate only for complex changes.
- **Phase 4 (Days 90+)**: Multi-repo stacking across business lines. Each business line repo has its own merge queue, with the orchestrator managing cross-repo coordination.

---

## Key Takeaway

> **Graphite is the most directly actionable tool for our merge conflict problem — its stack-aware merge queue, stacked PR workflow, and AI code review are purpose-built for the exact bottleneck (19-20% conflict rate) we face with multi-agent development, and the CLI is scriptable from our terminal-first orchestrator.**
