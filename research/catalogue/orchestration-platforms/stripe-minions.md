# Stripe Minions

> **Internal one-shot, end-to-end coding agents that produce 1,300+ merged PRs per week at Stripe — human-reviewed, zero human-written code.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | Not open-sourced (internal Stripe tooling). Built on fork of [block/goose](https://github.com/block/goose) (32.5K stars as of 2026-03-08) |
| GitHub Stars | N/A — proprietary. Foundation project Goose: ~32,500 (as of 2026-03-08) |
| Publisher | Stripe (bigtech, Leverage team, engineer Alistair Gray) |
| License | Proprietary (internal). Goose foundation: Apache 2.0 |
| Tech Stack | Goose fork (Rust/Python), MCP (400+ internal tools via Toolshed), isolated devboxes, Ruby/Sorbet codebase |
| Maturity | 🟢 Production (1,300+ PRs/week merged, Feb 2026) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *(empty — reserved for Burak)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Stripe's blueprint pattern is the canonical validation of our orchestrator-agent separation and the 70/30 deterministic/LLM split. Nearly 1:1 mapping to L-Thread architecture. |
| **Novelty** | 7/10 | The 70/30 split concept, context curation over maximization, and 2-round CI cap are patterns we identified independently but Stripe provides production-scale validation with hard numbers. |
| **Actionable** | 8/10 | Blueprint execution model, hard retry caps, tool curation (15 from 400), shift-feedback-left testing tiers, and one-shot task formulation are all directly implementable patterns. |

---

## Overview

Stripe Minions are the most detailed public case study of enterprise-grade, unattended coding agents deployed at scale. Built by Stripe's internal Leverage team and documented in a two-part blog series (February 9 and 19, 2026), the system produces over 1,300 merged pull requests per week — all human-reviewed but containing zero human-written code. This number was reported as growing rapidly (up from 1,000 just one week prior).

The system is built on a fork of Block's open-source Goose agent (Apache 2.0), with all customization focused on the orchestration layer rather than the agent core. The foundational architectural concept is "blueprints" — orchestration flows that alternate between deterministic code nodes (git, lint, CI, auto-fix) and agent loop nodes (code writing, reasoning, bug fixing). The LLM only gets invoked when creativity or judgment is needed; everything else is hardcoded. This maps directly to our 70/30 deterministic/LLM split principle.

The core thesis from Stripe's experience: **"The walls matter more than the model."** The quality of infrastructure surrounding the LLM — sandboxing, deterministic gates, context engineering, tool curation — determines success far more than which frontier model is used. This is validated across a codebase of hundreds of millions of lines (primarily Ruby with Sorbet typing), processing over $1 trillion in annual payment volume under strict regulatory and compliance obligations.

---

## Technical Architecture

### The Blueprint Execution Model (70/30 Split in Practice)

```
Slack / CLI / Web invocation
  → Task parsing                          [DETERMINISTIC]
  → Devbox provisioning (~10 seconds)     [DETERMINISTIC]
  → Context assembly via MCP              [DETERMINISTIC]
  → Code writing                          [AGENT LOOP — LLM]
  → Git push                              [DETERMINISTIC]
  → Local lint run (<5 seconds)           [DETERMINISTIC]
  → If lint fails: agent fix loop         [AGENT LOOP — LLM]
  → CI trigger                            [DETERMINISTIC]
  → If CI fails: agent fix loop (max 2)   [AGENT LOOP — LLM]
  → PR creation                           [DETERMINISTIC]
  → Human review notification             [DETERMINISTIC]
```

**Deterministic nodes (~70%):** Task parsing, devbox provisioning, context assembly, git operations, lint invocation, CI trigger, PR creation, notification routing. The LLM cannot skip these.

**Agent loop nodes (~30%):** Code writing, lint failure fixing, CI failure fixing. These are the only steps where the LLM reasons freely.

### Key Components

| Component | Function | Details |
|-----------|----------|---------|
| **Goose fork** | Base agent loop | File read/write, code execution, test running. Apache 2.0 foundation. |
| **Blueprints** | Orchestration engine | Alternates deterministic and agentic nodes. Core execution model. |
| **Toolshed** | Centralized MCP server | 400+ internal tools (docs, build status, CI, code search, dependency graphs, compliance checkers). |
| **Devboxes** | Sandboxed execution | Pre-warmed VMs, ~10s spin-up, isolated from production and internet, identical to human dev environments. |
| **Context assembly pipeline** | Pre-LLM context curation | Task analysis → conditional rule loading (directory-specific) → tool curation (15 from 400) → relevance scoring. |

### Three-Tier Testing Feedback Loop

| Tier | Mechanism | Speed | Action on Failure |
|------|-----------|-------|-------------------|
| **Tier 1** | Local linting (pre-push) | <5 seconds | Auto-fix (<1s) or agent fix loop |
| **Tier 2** | Selective CI (relevant tests only) | Minutes | Auto-fix where possible, else agent |
| **Tier 3** | Self-healing cap | Max 2 rounds | After 2 failures: STOP, surface to human |

### Devbox Isolation Model

- Every Minion run executes in an isolated, pre-warmed devbox
- Identical to human engineer environments
- Isolated from production AND the internet (prevents exfiltration, dependency confusion, accidental prod writes)
- Agents run with full permissions inside the sandbox — containment, not restriction
- Security model: maximize freedom within constrained blast radius

---

## Publisher Background

**Stripe** — a global payments infrastructure company processing over $1 trillion annually. 8,000+ employees. The Minions system was built by the internal **Leverage team**, with the two-part blog series authored by engineer **Alistair Gray**. Stripe has a strong engineering culture with a history of significant open-source contributions (stripe-ruby, stripe-node, Sorbet type checker for Ruby). However, Minions itself is internal tooling — not a product and not open-sourced.

The system is built on **Block's Goose** (32.5K GitHub stars, 55,000+ community, 373+ contributors), which provides the open-source foundation. Block (formerly Square) released Goose under Apache 2.0 in early 2025.

---

## What's Valuable for Us

### 1. The 70/30 Deterministic/LLM Split (Blueprint Pattern)

This is the single most important validated pattern. Stripe's blueprint model is production proof that:

- **Deterministic (70%):** routing, state management, git operations, CI/CD, linting, notification, scheduling, retry logic, lifecycle management — all hardcoded, no LLM discretion.
- **LLM (30%):** code writing, failure diagnosis, creative problem-solving — only invoked when judgment is needed.
- **Result:** 1,300+ PRs/week at enterprise scale with regulatory compliance.

**Direct application:** Our orchestrator already follows this split conceptually. Stripe validates pushing it further — the orchestrator should NEVER delegate deterministic steps to agents.

### 2. Context Curation Over Maximization

| Stripe Practice | Our Application |
|-----------------|-----------------|
| 15 tools selected from 400 per task | Curate MCP tool subsets per agent spawn — don't expose all tools |
| Directory-specific rules loaded conditionally | Extend CLAUDE.md hierarchy with task-type-specific rule loading |
| Relevance scoring and pruning | Add context budget tracking to orchestrator state |
| Zero token wastage on irrelevant context | Implement pre-spawn context assembly step |

Key insight: exposing all 400 tools causes "token paralysis" — the agent spends tokens reasoning about which tool to use rather than doing work.

### 3. Hard Retry Caps

| Failure Type | Stripe Cap | Suggested for L-Thread |
|--------------|-----------|----------------------|
| Lint/test failure | Max 2 CI rounds | 2 retries |
| Build failure | Not specified | 1 retry |
| Security/permission | Immediate escalation | 0 retries |

Add `max_retries` and `current_retry_count` to orchestrator state schema per agent task.

### 4. Shift Feedback Left (Three-Tier Testing)

Before expensive E2E testing, run cheap local checks first:
- Tier 1: lint/typecheck (<5 seconds, nearly free)
- Tier 2: selective test run (only affected tests)
- Tier 3: full E2E (expensive, only if Tiers 1-2 pass)

### 5. One-Shot Task Formulation

Minions are one-shot — they receive a complete task and produce a PR with no interaction. This reduces orchestrator overhead (no intermediate monitoring), is more robust to failures (restart fresh vs. resume conversation), and enables true parallelism (kick off 5 agents, review 5 PRs).

### 6. Infrastructure-First, Model-Second

> "The agent runtime is commodity; the orchestration and infrastructure are the value."

Stripe's competitive advantage is not a better agent loop — it's better walls, better context, and better workflow integration. This validates our architecture decision to remain agent-runtime-agnostic.

---

## What's NOT Relevant

| Aspect | Why Not Relevant |
|--------|-----------------|
| **Goose as agent runtime** | We use Claude Code as our agent harness. Goose solves a different layer (agent internals vs. orchestration). |
| **400+ tool Toolshed scale** | We operate with <20 tools. The curation pattern matters; the scale does not apply. |
| **Devbox VM isolation** | We use tmux pane isolation. Full VM isolation is enterprise infrastructure we don't need at our scale. Moving to devbox-level isolation is a Phase 4+ concern. |
| **Ruby/Sorbet specifics** | Language-specific patterns (Sorbet typing, Ruby linting) are not transferable. The architecture patterns above them are. |
| **Slack-first invocation** | Our orchestrator uses CLI/tmux invocation. The invocation surface is irrelevant; the execution model matters. |
| **Enterprise compliance layer** | Stripe's regulatory requirements (PCI DSS, SOX) drive specific security decisions that are overkill for our use case. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Implement hard retry caps (`max_retries: 2` for lint/test, `1` for build, `0` for security) in orchestrator state schema. Add pre-validation lint step before E2E gate.
- **Phase 2 (Days 4-60):** Build dynamic context assembly step in orchestrator — before spawning each agent, curate tool subset and load task-specific rules. Implement one-shot task formulation as default pattern.
- **Phase 3 (Days 60-90):** Add selective test running (only tests affected by changed files) to the testing tier. Implement context budget tracking.
- **Phase 4 (Days 90+):** Evaluate Goose as alternative agent runtime alongside Claude Code. Consider devbox-level isolation if scaling to multi-client deployments with data isolation requirements.

---

## Key Takeaway

> **Stripe Minions are production proof at $1T-scale that the 70/30 deterministic/LLM split works — hardcode routing, state, git, CI, and lifecycle; only invoke the LLM for code writing and failure diagnosis — and that "the walls matter more than the model."**
