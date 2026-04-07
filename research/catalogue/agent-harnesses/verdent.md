# Verdent

> **Agentic coding suite with multiple parallel agents, git worktree isolation, and multi-model routing.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [github.com/verdentAI](https://github.com/verdentAI) (org — only a docs repo public) |
| GitHub Stars | 1 (docs repo only, as of 2026-03-08) |
| Publisher | Verdent AI — startup (Zhijie Chen, ex-TikTok Head of Algorithms + Xiaochun Liu, ex-Baidu Head of Tech & Product) |
| License | Proprietary (closed-source) |
| Tech Stack | Unknown backend; VS Code extension + macOS desktop app (Verdent Deck); multi-model (Claude Sonnet 4.5, GPT-5, GPT-5-Codex, Gemini 3 Pro) |
| Maturity | 🟡 Early (launched Sep 2025, no funding disclosed) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Validates git worktree isolation and multi-model routing patterns we already use; proprietary so cannot adopt code; credit-based pricing incompatible with Claude Max arbitrage model |
| **Novelty** | 4/10 | Git worktree isolation, plan-code-verify workflow, subagent system — all patterns we've documented extensively from Overstory, Broomie, oh-my-claudecode, and the Master Blueprint |
| **Actionable** | 3/10 | Closed-source proprietary product. Subagent markdown definition pattern (`~/.verdent/subagents/`) is mildly interesting but we already have `.claude/agents/`. No code to study or adapt. |

---

## Overview

Verdent is a proprietary agentic coding platform from a Chinese AI startup founded by Zhijie Chen (ex-TikTok Head of Algorithms at ByteDance) and Xiaochun Liu (ex-Baidu Head of Tech & Product). It launched in September 2025 and offers two products: **Verdent for VS Code** (an extension) and **Verdent Deck** (a standalone macOS desktop app). The core value proposition is parallel AI agent execution with git worktree isolation, plan-before-code workflows, and built-in code review.

The platform routes tasks to multiple frontier models (Claude Sonnet 4.5, GPT-5, GPT-5-Codex, Gemini 3 Pro) based on task requirements — a multi-model routing approach similar to what oh-my-claudecode and Kilo Code implement. Verdent claims 76.1% single-attempt resolution on SWE-bench Verified, which would place it among the top production coding agents.

The business model is credit-based subscriptions ($19-$179/month) with unpredictable per-task credit consumption (3-5 credits for simple tasks, 30-50+ for complex refactors). This is the Windsurf "flow credits" model — fundamentally at odds with our Claude Max flat-rate arbitrage approach where we get 18-36x value versus API pricing.

---

## Technical Architecture

### Core Execution Model

```
User Input → Planning Mode → Agent Mode (parallel) → Verification → Human Review
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Git Worktree 1  Git Worktree 2  Git Worktree N
              (Agent A)       (Agent B)       (Agent N)
                    │               │               │
                    └───────┬───────┘───────────────┘
                            │
                    Multi-Model Router
                    (Sonnet/GPT-5/Gemini)
```

### Key Components

1. **Workspace Isolation**: Git worktrees per task — each workspace has its own working files but shares git history with the main repository. Prevents agent conflicts during parallel execution.

2. **Multi-Model Routing**: Automatic model dispatching based on task type. Available models include Claude Sonnet 4.5, GPT-5, GPT-5-Codex, and Gemini 3 Pro.

3. **Subagent System**: Custom subagents defined as Markdown files in `~/.verdent/subagents/` with system prompts, invocation policies, and tool scopes. Built-in subagents include `@Verifier`, `@Explorer`, and `@Code-reviewer`.

4. **Three-Phase Workflow**:
   - **Plan Mode**: Read-only analysis, requirement clarification, implementation planning
   - **Agent Mode**: Autonomous execution with full file modification
   - **Verification**: Change summary + diff report before commit/PR

5. **Review Subagent**: Cross-validates results using three frontier models simultaneously (multi-model consensus).

6. **MCP Support**: Documented but details sparse.

### Pricing / Credit System

| Tier | Monthly Cost | Credits | Effective Cost |
|------|-------------|---------|----------------|
| Starter | $19 | 340 (680 promo) | ~$0.03-6.33/task |
| Pro | $59 | 1,000 (2,000 promo) | ~$0.03-1.97/task |
| Max | $179 | 3,000 (6,000 promo) | ~$0.03-5.97/task |

Credit consumption is unpredictable: 3-5 credits for simple tasks, 30-50+ for complex refactors.

---

## Publisher Background

**Zhijie Chen** — CEO. Previously Head of Algorithms at ByteDance/TikTok, with senior roles at Baidu. Strong ML/algorithms background from two of China's largest tech companies.

**Xiaochun Liu** — Co-founder. Previously Head of Tech & Product at Baidu.

The company was founded in 2025, has no disclosed funding according to Tracxn. The GitHub organization has only a single public docs repository (1 star). The product is entirely proprietary and closed-source.

The pedigree is notable (TikTok + Baidu leadership), but the company is pre-funding with a credit-based revenue model competing against well-funded players like Cursor (Anysphere, $900M+ raised), Augment Code ($977M valuation), and Cognition/Devin.

---

## What's Valuable for Us

**1. Subagent definition as Markdown files** — Their `~/.verdent/subagents/` pattern with per-subagent system prompts, invocation policies, and tool scopes is conceptually similar to our `.claude/agents/` directory. Minor validation that the "agent persona as markdown file" pattern is converging across tools.

**2. Multi-model review consensus** — The Review Subagent cross-validates using three models simultaneously. This is a stronger version of our Master Blueprint's "Multi-Model Review" quality gate (Section 2, Layer 3). Worth noting as implementation evidence, though we can build this ourselves with LiteLLM + deterministic routing.

**3. Plan-Code-Verify as enforced workflow** — Not novel (Superpowers, oh-my-claudecode, and our own orchestrator all do this), but Verdent's productization of this as a first-class UX validates the pattern's market value.

**4. SWE-bench positioning** — 76.1% on SWE-bench Verified is a useful competitive benchmark. Augment Code claims #1 on the same benchmark. These numbers are useful for client conversations about agent code quality.

---

## What's NOT Relevant

**1. Proprietary closed-source** — Violates our Governing Principle #7 ("Build only what you have needed"). We cannot inspect, adapt, or learn from their actual implementation. Everything we know is marketing-level.

**2. Credit-based pricing model** — Fundamentally incompatible with our Claude Max $200/mo flat-rate arbitrage model. Their $179/month Max tier gives 3,000-6,000 credits; our Claude Max gives unlimited usage at the same price point with 18-36x arbitrage.

**3. GUI-first approach** — Desktop app + VS Code extension. Our architecture is CLI-first (Claude Code + tmux + worktrees). Verdent Deck is a walled garden that cannot be orchestrated programmatically.

**4. No self-hosting / DSGVO concerns** — All code runs through Verdent's cloud. No on-prem option. Disqualified for gov contract work where BSI/DSGVO compliance is mandatory (Master Blueprint, Governing Principle #6: Federated systems).

**5. Vendor lock-in risk** — Pre-funding startup with proprietary platform. High risk of pricing changes, pivots, or shutdown. Contradicts our principle of building on open, composable primitives.

---

## Future Use Cases

- **Phase 1-3 (Days 1-90)**: No use case. We already have superior tooling for parallel agent execution (tmux + worktrees + Claude Max flat rate).
- **Phase 4 (Days 90+)**: Potential competitive benchmark reference only. If Verdent achieves significant market share, their subagent marketplace ("Skills") could be worth monitoring as a distribution model for our own agent skills.

---

## Key Takeaway

> **Verdent validates patterns we already use (git worktree isolation, plan-code-verify, multi-model routing, subagents-as-markdown) but as a proprietary, credit-based, GUI-first product it offers nothing we can adopt — our open-source CLI stack with Claude Max flat-rate pricing is architecturally superior for our use case.**
