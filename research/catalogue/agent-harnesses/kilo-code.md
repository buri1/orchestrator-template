# Kilo Code

> **The all-in-one agentic engineering platform — #1 coding agent on OpenRouter with 1.5M+ developers and 25T+ tokens processed.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [Kilo-Org/kilocode](https://github.com/Kilo-Org/kilocode) |
| GitHub Stars | 16,385 (as of 2026-03-08) |
| Publisher | Kilo (startup, Amsterdam HQ, SOC 2 Type II certified) |
| License | MIT |
| Tech Stack | TypeScript (94.5%), Rust, CSS; VSCode + JetBrains extensions; CLI (`@kilocode/cli`); Bun + Turbo monorepo |
| Maturity | 🟢 Production (16K stars, 1.5M+ users, enterprise adoption at Meta/Amazon/Airbnb) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Their Trust Ladder framework and model routing philosophy (Opus for planning, cheap models for coding) directly validates our 70/30 split. The 5-agent architecture (orchestrator, architect, code, ask, debug) is a production proof point for agent specialization. However, Kilo is a GUI-first IDE extension -- we are CLI-first orchestrator. Different delivery surface, overlapping architectural ideas. |
| **Novelty** | 6/10 | Trust Ladder as a formalized progression framework is genuinely useful. Anti-collaboration / N=1 ownership is a strong org pattern but not technically novel. Model routing is a pattern we have already documented across oh-my-claudecode, Mendral, and LiteLLM. The 80/20 thinking/coding flip is an insight, not a feature. |
| **Actionable** | 5/10 | We cannot directly adopt Kilo -- it is a competing IDE extension, not a library or pattern we can import. Value is in studying their agent mode architecture (Orchestrator, Architect, Code, Debug, Ask, Custom), their model routing implementation, and their Memory Bank for cross-session persistence. The CLI (`npx @kilocode/cli`) with `--auto` flag is interesting for CI/CD integration patterns. |

---

## Overview

Kilo Code (formerly Roo Code fork lineage, now independent) is a VSCode/JetBrains extension and CLI that positions itself as an "all-in-one agentic engineering platform." Unlike single-purpose autocomplete tools (Copilot, Tabnine), Kilo ships with multiple built-in agent modes -- Orchestrator, Architect, Code, Debug, Ask, and Custom -- each with distinct system prompts, tool access, and model routing. This multi-mode approach makes it one of the few IDE-embedded tools that explicitly models the agent specialization pattern we use in our orchestrator.

The platform's scale is notable: 25+ trillion tokens processed and 1.5M+ developers since launching in May 2025, making it one of the fastest-growing open-source coding agents. Their Gateway API provides access to 500+ models from 60+ providers at cost pricing (no markup), which doubles as both their monetization strategy and a model routing infrastructure. The Gateway daily leaderboard showing real-world model usage patterns across their 1.5M user base is a unique data asset.

What makes Kilo architecturally interesting is not the extension itself but the philosophy behind it, as articulated by CEO Scott in his conference talk: the Trust Ladder framework (autocomplete -> chat -> single agent -> orchestration), where each level requires progressively more context depth and trust. At the orchestration level, agents need access to all repos across an organization. This maps directly to our context separation principle -- the insight that context requirements scale non-linearly with autonomy level.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Kilo Platform                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │        IDE Extension (VSCode / JetBrains)     │   │
│  │                                               │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────────┐ │   │
│  │  │ Inline  │ │  Agent   │ │  Agent Manager │ │   │
│  │  │ Auto-   │ │  Modes   │ │  (multi-agent  │ │   │
│  │  │ complete│ │          │ │   coordination)│ │   │
│  │  └─────────┘ └──────────┘ └────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
│                        │                             │
│  ┌─────────────────────▼────────────────────────┐   │
│  │              Agent Mode Router                │   │
│  │                                               │   │
│  │  Orchestrator ──► plans multi-agent workflows │   │
│  │  Architect ──────► designs, no code writes    │   │
│  │  Code ───────────► implementation             │   │
│  │  Debug ──────────► failure diagnosis + fix    │   │
│  │  Ask ────────────► Q&A, incident triage       │   │
│  │  Custom ─────────► user-defined modes         │   │
│  └──────────────────────────────────────────────┘   │
│                        │                             │
│  ┌─────────────────────▼────────────────────────┐   │
│  │            Model Routing Layer                 │   │
│  │                                               │   │
│  │  Planning/Architecture ──► Opus-class models  │   │
│  │  Coding/Debugging ──────► Cost-effective       │   │
│  │                           (Qwen, MiniMax, GLM)│   │
│  │  Autocomplete ──────────► Fastest available   │   │
│  └──────────────────────────────────────────────┘   │
│                        │                             │
│  ┌─────────────────────▼────────────────────────┐   │
│  │         Gateway API (500+ models)             │   │
│  │                                               │   │
│  │  60+ providers │ Cost pricing │ No markup     │   │
│  │  Daily leaderboard │ BYOK support             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Cross-cutting:                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Memory Bank ── persistent architectural      │   │
│  │                  decisions across sessions     │   │
│  │  MCP Marketplace ── external tool integration │   │
│  │  Cloud Agents ── isolated container execution │   │
│  │  Security Agent ── vulnerability analysis     │   │
│  │  Code Indexing ── managed semantic search      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

Trust Ladder (context depth per level):
  Level 1: Autocomplete ── current file only
  Level 2: Chat ────────── related files + docs
  Level 3: Agent ─────────  full repo + dependencies
  Level 4: Orchestration ── all repos across org
```

**Key architectural decisions:**

| Decision | Detail |
|----------|--------|
| **Multi-mode agent architecture** | 5 built-in modes + custom; each mode has distinct prompt, tool access, and model assignment |
| **Model routing by task type** | Expensive models (Opus) for planning/architecture, cost-effective models (Qwen/MiniMax/GLM) for coding/debugging |
| **Gateway as model proxy** | 500+ models from 60+ providers at cost; no markup; daily usage leaderboard |
| **Memory Bank** | Persistent storage for architectural decisions that survives across sessions |
| **MCP marketplace** | External tool integration via Model Context Protocol servers |
| **Cloud Agents** | Long-running tasks in isolated containers (not local compute) |
| **CLI with --auto flag** | Headless operation for CI/CD pipelines; disables all permission checks |
| **BYOK + local models** | Ollama, LM Studio, OpenRouter, Vercel gateway support |

---

## Publisher Background

Kilo is a startup headquartered in Amsterdam. Co-founded by Scott (CEO), who articulated the platform vision at the Coding Agents: AI Driven Dev Conference 2026. The company practices its own anti-collaboration philosophy internally: ~15 engineers, 1 PM for the entire company, N=1 feature ownership (each engineer owns a feature from conception through deployment and user feedback). They ship 1-2 features per week.

The codebase has origins in the Roo Code / Cline lineage (VSCode extension ecosystem), but has diverged significantly with proprietary additions (Gateway, Cloud Agents, Agent Manager, Memory Bank). SOC 2 Type II certified, with enterprise adoption at Meta, Amazon, Airbnb, PayPal, Square, Red Hat, and Grafana Labs. The 16K GitHub stars, 2,100+ forks, and 30+ contributors indicate strong community traction. They claim 43% of their users migrated from Cursor, positioning them as the open-source alternative to proprietary coding agents.

---

## What's Valuable for Us

| Pattern | Where in Kilo | How to Apply |
|---------|---------------|--------------|
| **Trust Ladder framework** | Scott's conference talk; implicit in mode progression | Use as a mental model for our orchestrator's autonomy levels. Map our current system: we are at Level 3 (single agent orchestration) moving to Level 4 (multi-repo orchestration). Trust breakdowns (latency, wrong edits, permission spam) are measurable -- monitor acceptance rates. |
| **Model routing by task type** | Gateway + mode-specific model assignment | Validates our 70/30 split. Apply directly: use Opus for orchestrator planning/architecture decisions, cheaper models (Sonnet/Haiku or open-source) for coding agents. LiteLLM can implement this pattern for us without Kilo's Gateway. |
| **5-agent specialization** | Orchestrator, Architect, Code, Debug, Ask modes | Our L-Thread already separates orchestrator from worker, but we lack a dedicated Architect mode (plan-only, no code writes) and a dedicated Debug mode. Consider adding these as agent personas in our prompt engineering. |
| **Anti-collaboration + N=1 ownership** | Kilo's internal org structure | Strong org pattern for client engagements: one engineer owns the full feature lifecycle. Reduces coordination overhead (exponent 1.724 per Master Blueprint Principle 4). |
| **Memory Bank** | Cross-session persistent storage for architectural decisions | Our `CLAUDE.md` + `MEMORY.md` serve this purpose. Kilo's Memory Bank validates the pattern. Consider formalizing what goes in memory vs. what is ephemeral. |
| **CLI --auto flag for CI/CD** | `npx @kilocode/cli --auto` | Our orchestrator already uses `--dangerously-skip-permissions` for tmux agents. Kilo's approach of a dedicated `--auto` flag with explicit documentation about trust implications is cleaner. |
| **80/20 thinking/coding flip** | Scott's talk: 80% thinking, 20% coding in AI era | Reframe our orchestrator work: the orchestrator IS the 80% thinking layer. Budget human time for architecture/review, not code writing. "Supporting 200 hours a week of agent coding" is the mental model. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **IDE extension delivery** | Kilo is a VSCode/JetBrains extension. We are CLI-first, tmux-based. The extension UX is irrelevant to our architecture. |
| **Gateway monetization model** | Their pay-as-you-go 500+ model gateway is a SaaS business model, not an architectural pattern. We use Claude Max flat rate, which makes per-token gateway economics irrelevant (Master Blueprint: 18-36x subscription advantage). |
| **Cloud Agents** | Isolated container execution is their SaaS upsell. Our tmux + worktree isolation achieves the same outcome without cloud dependency (Governing Principle 7: build only what you have needed). |
| **Inline autocomplete** | Copilot-style tab completion is a different product category. Our orchestrator dispatches multi-file, multi-step tasks -- not single-line suggestions. |
| **Proprietary features** | Agent Manager, Security Agent, managed code indexing are closed-source cloud features. Cannot study implementation, only conceptual patterns. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** No direct adoption. Extract the Trust Ladder as a conceptual framework for evaluating our orchestrator's autonomy progression. Apply the 5-agent specialization (especially Architect and Debug as distinct modes) to our agent persona prompts.
- **Phase 2 (Days 4-60):** Study Kilo's model routing implementation (if open-sourced in the extension code) for inspiration on routing Opus vs. Sonnet/Haiku in our system. Their CLI `--auto` flag pattern is worth studying for our CI/CD integration.
- **Phase 3 (Days 60-90):** If we need a model gateway, evaluate Kilo's Gateway API vs. LiteLLM. Their daily leaderboard data (real-world model performance across 1.5M users) could inform our model selection decisions.
- **Phase 4 (Days 90+):** Monitor Kilo's Agent Manager (multi-agent coordination) for patterns. If they open-source the orchestration layer, it could be a reference implementation for IDE-integrated multi-agent workflows.

---

## Key Takeaway

> **Kilo validates our core architectural bets -- agent specialization, model routing by task type, context separation scaling with autonomy -- at 1.5M-user production scale, but delivers them as an IDE extension rather than a CLI orchestrator; study the Trust Ladder framework and 5-agent mode architecture as conceptual references, not adoption targets.**
