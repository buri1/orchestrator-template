# Business Layer Architecture: Practitioner Systems and Context Separation

> **Comparative analysis of solo-founder agent systems (Elvis Sun's Zoe/OpenClaw, Jacob Bank's 40-agent marketing machine, Oguz Atalay's VPS fleet, IndyDevDan's multi-model orchestration) with deep treatment of context separation, model routing, knowledge store trade-offs, and adoptable architectural patterns.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_analysis-business-layer-systems.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

All successful solo-founder agent systems in 2026 converge on the same architectural skeleton: one human, one orchestrator (Business Brain) that holds ALL business context and NEVER writes code, and multiple worker agents with isolated code-only context reporting via PRs. The differences between practitioners are in implementation details (tmux vs. systemd, Obsidian vs. Notion, Mac vs. VPS), not in the fundamental pattern. The most validated insight across all practitioners is context separation: separate business context from code context at the architecture level, not the prompt level. Context windows are zero-sum -- fill it with code and there is no room for business context.

Elvis Sun's system has continued evolving: Zoe got her own database (beyond JSON state files), revenue stands at $420 MRR + $3,600/month agency work, and 200+ waitlist signups for medialyst.ai. His context separation diagram -- ZOE (business: CRM, meetings, competitors) vs CODEX (engineering: agents.md, design docs, codebase) -- articulates the key insight: "Specialization through context, not through different models." The same model becomes a fundamentally different agent depending on what fills its context window. The model is the commodity; the context is the differentiator; the orchestration layer that assembles the right context is the compounding asset.

---

## Key Findings

### The Convergent Architecture (All Practitioners)

```
Human (1 person)
  |
Orchestrator (Business Brain)
  - Holds ALL business context
  - Routes tasks to optimal agents
  - Monitors quality, logs patterns
  - NEVER writes code
  |
  +---> Coding Agents (isolated code context, own worktree/branch)
  +---> Marketing Agent (social content, competitive intel)
  +---> Support Agent (customer issues, CRM)
  +---> Review Agent (multi-model code review)
```

### Practitioner Systems Compared

**Elvis Sun (Zoe + OpenClaw)**
- Revenue: $420 MRR SaaS + $3,600/month agency
- Infrastructure: Mac Studio ($5K), $190/month API costs
- Key evolution: Zoe moved from JSON state to proper database for scale
- Context separation: Obsidian vault (business brain) in monorepo alongside codebase
- Model routing: Codex (~90% backend), Claude Code (frontend/git), Gemini (UI/security review)
- Proactive: morning Sentry scan, post-meeting feature spawn, evening changelog
- 200+ waitlist, VCs and job offers declined by Zoe based on strategic priorities

**Jacob Bank (Relay.app) -- 40-Agent Marketing Machine**
- Revenue: Million-dollar business run by one person
- Architecture: Agents organized by marketing channel, not by capability
- 6 core marketing functions: social media, blog/website, email, lead qualification, competitive intel, webinars
- Key difference from Elvis: workflow-based agents (trigger -> action chains), not coding agents
- Operates through APIs and integrations rather than code generation

**Oguz Atalay -- VPS Fleet Approach**
- Architecture: 6 agents as independent systemd services on single VPS
- Coordinator on most expensive model; specialists on faster models
- systemd provides: auto-restart after 30s, survives reboots, built-in logging
- Three-tier model fallback: primary -> secondary -> tertiary cheap model
- When specialist falls back to cheaper model, coordinator flags output for extra scrutiny
- Philosophy: "Treat distributed agent systems as infrastructure problems, not AI problems"

**IndyDevDan -- The Philosophical Framework**
- Thesis for 2026: "The Year of Trust" -- every decision comes down to trusting agents
- Three-tier progression: Custom Agents (highest ROI) -> Multi-Agent Orchestration -> Agent Sandboxes
- big-3-super-agent: Voice Conductor (OpenAI Realtime) + Code Executor (Claude Code) + Browser Agent (Gemini)
- Philosophy: "Custom Agents Above All," "Skills over MCP," "If I don't need it, it won't be built"

### Context Separation: The Core Principle

| Layer | Context Contents | Who Holds It |
|-------|-----------------|--------------|
| Business Brain | CRM, customer history, meetings, revenue goals, competitive intel, decisions | Orchestrator |
| Code Brain | Codebase, type definitions, test patterns, design docs, API schemas | Worker agents |

**Why it works** (evidence from production):
- Anthropic: Every token competes for model attention. Longer context often makes things worse.
- Manus AI: 100:1 input-to-output token ratio. KV-cache hit rate is the most important metric.
- Google ADK: Session is the fundamental unit of isolation -- data never bleeds between sessions.
- Martin Fowler/Thoughtworks: Context engineering replaces prompt engineering as the primary skill.

### Knowledge Store Trade-offs

| Factor | Obsidian | Notion | SQLite/Postgres |
|--------|----------|--------|-----------------|
| Agent access | Direct file read (instant) | API call (100-500ms) | Direct SQL (instant local) |
| Privacy | Full local control | Cloud-hosted | Full control |
| Structure | Freeform markdown + links | Databases + relations | Full relational schema |
| Vendor lock-in | None (plain markdown) | High (proprietary) | None (SQL standard) |
| Frontend | None (dev-facing only) | Built-in (pages, views) | Custom build needed |
| Cost | Free | $10-20/user/month | Free (SQLite) or hosting |

Elvis chose Obsidian (monorepo, instant reads, no API overhead), then evolved to database for scale. The recommended hybrid: markdown for human-readable notes and decision logs, SQLite/Postgres for structured data (agent state, task history, prompt performance), Notion as presentation layer for client-facing dashboards.

### Eight Adoptable Architectural Patterns

**1. Two-Brain Architecture**: Separate orchestrator context (business) from worker context (code). Never mix in same context window. Validated by Elvis Sun, Google ADK, Anthropic.

**2. Coordinator-on-Best-Model**: Orchestrator runs frontier model (decisions affect entire fleet). Workers run faster/cheaper models. Validated by Elvis Sun, Oguz Atalay, IndyDevDan.

**3. Systemd/Tmux as Agent Infrastructure**: Use OS-level process management instead of custom daemons. tmux on macOS, systemd on Linux/VPS. Battle-tested, auto-restart, built-in logging. Validated by Elvis Sun, Atalay, Agentic Coding Flywheel.

**4. Agent Mail for Coordination**: Asynchronous message passing between agents with file reservation to prevent merge conflicts. Advisory reservations with pre-commit guard. Validated by Agentic Coding Flywheel.

**5. Progressive Context Loading (Skills over Dump)**: Don't load all context upfront. Define Skills (named context bundles) that load on demand. Validated by Fowler/Thoughtworks, IndyDevDan, Obsidian Skills.

**6. Structured Progress Files**: Agents maintain `progress.md` or `todo.md`, updated after each step. Enables session recovery and attention management. Addresses "lost-in-the-middle" degradation. Validated by Anthropic (claude-progress.txt), Manus (todo.md).

**7. Multi-Model Review Gate**: Before PR is "done," review by multiple AI models catching different error classes. ~92% bug catch rate at ~$0.06/PR. Validated by Elvis Sun (triple-model), L-Thread (E2E gate).

**8. Failure-Informed Prompt Evolution**: Log prompt patterns with outcomes. Orchestrator reads log before generating prompts, applies accumulated lessons. Emergent learning at orchestrator level. Validated by Elvis Sun (pattern logging), Manus (error preservation).

### Macro Landscape: Solo-Founder Agent Systems (March 2026)

- 36.3% of new ventures are solo-founded (Scalable.news)
- 340% average revenue increase vs pre-agent operations, no increase in working hours (Indie Hackers survey)
- Sequoia/a16z adjusted underwriting to prioritize "agentic leverage" over team size
- Amodei prediction: first billion-dollar company with single human employee in 2026, 70-80% confidence
- Midjourney precedent: <15 people, $200M ARR, multi-billion valuation

### Unresolved Problems

1. **Scaling past 5-6 concurrent coding agents**: RAM bottleneck (~2GB/agent). VPS with 64GB = ~$40-56/month.
2. **Human review ceiling**: 5-6 PRs/day, 3-4 hours cognitive limit.
3. **Database architecture decisions**: Agents handle features well but struggle with schema design, migration planning, security architecture.
4. **Long-running context degradation**: Agents lose coherence on tasks exceeding ~50 tool calls.
5. **Business context freshness**: How to keep CRM/competitive intel up-to-date without manual sync.

---

## Actionable Insights

1. **Add `_bmad/business-context/` directory** with subdirectories for customers, decisions, failures, and prompts. This is the Business Brain.

2. **Add `_bmad/pattern-log.json`** to track prompt outcomes (task type, model, success/failure, lesson). Orchestrator reads this before generating prompts.

3. **Create Skills files in `.claude/skills/`** for major codebase modules. Load-on-demand context beats dumping everything upfront.

4. **Implement progress.md pattern**: Every spawned agent creates and updates a progress file in its worktree.

5. **Add multi-model review gate**: Before marking any task "done," run review through a second model.

6. **Graduate state to SQLite at scale**: `orchestrator-state.json` -> `orchestrator.db` for queryable history when agent registry exceeds ~50 entries.

7. **Model routing heuristic**: Backend -> Codex, Frontend -> Claude Code, Design -> Gemini. Run orchestrator on the most capable model.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Primary practitioner case study; Zoe/OpenClaw system analyzed in depth |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | IndyDevDan's philosophy and multi-model orchestration |
| [reference/master-blueprint.md](../reference/master-blueprint.md) | Master blueprint implements the two-brain architecture and model routing patterns |
| [reference/deterministic-llm-boundary.md](../reference/deterministic-llm-boundary.md) | Context separation is the mechanism that enforces the deterministic/LLM boundary |
| [reference/multi-business-control-plane.md](../reference/multi-business-control-plane.md) | Business Brain = control plane; Code Brain = execution plane |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Human review ceiling and agent cost economics from practitioner data |
| [orchestration-platforms/stripe-minions.md](../orchestration-platforms/stripe-minions.md) | Stripe's one-shot isolation validates the separation pattern at enterprise scale |
| [orchestration-platforms/openclaw.md](../orchestration-platforms/openclaw.md) | OpenClaw's gateway/heartbeat concepts adapted for Burak's system |
