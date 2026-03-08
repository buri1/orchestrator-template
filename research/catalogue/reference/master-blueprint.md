# Master Blueprint: Unified Multi-Business Agent System Architecture

| Field | Value |
|-------|-------|
| **Source** | `research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md` |
| **Date** | 2026-03-06 |
| **Status** | Definitive Architecture Reference |
| **Evidence Base** | 104 Phase 1+2 research docs, 5 analysis docs, 67 research agents, production data |
| **Architecture** | Federated business lines + thin Notion meta-layer |
| **Build Strategy** | Thin layer (Days 1-3) -> Run under load (4-60) -> Informed rebuild (60-90) -> Scale (90+) |
| **Core Split** | 70% deterministic (routing, state, health, CI, scheduling) / 30% LLM (code, review, diagnosis) |
| **Monthly Infra Cost** | $200-800/mo |

---

## Governing Principles

Seven principles override all design decisions. Derived from DeepMind scaling research, Stripe production data, Elvis Sun's system, IndyDevDan's philosophy, and 60+ days of L-Thread Orchestrator operation.

1. **The orchestration layer is the compounding asset.** Agents commoditize. Models improve. The wiring (context assembly, routing, state, knowledge compounding) is what endures.
2. **Deterministic orchestration, LLM execution.** The orchestrator never guesses. Routing, state, health checks, CI, git, scheduling -- all deterministic. The LLM writes code, diagnoses failures, generates content. Nothing else.
3. **Context is zero-sum.** Every token competes for attention. Business context in a coding agent displaces code. Code in a business agent displaces strategy. Separation is non-negotiable.
4. **Coordination overhead scales at exponent 1.724.** Doubling agents more than triples coordination cost. Better context on fewer agents beats more agents.
5. **Human review is the binding constraint.** 5-6 PRs/day, 3-4 hours cognitive ceiling. Architecture must reduce what the human reviews, not increase what agents produce.
6. **Federated systems, thin meta-layer.** Each business line runs independently. The meta-layer provides cross-business visibility without cross-contamination.
7. **Build only what you have needed in the last 30 days.** Not frontier research. Not what might be useful. What you actually needed and did not have.

---

## Three-Layer Architecture

### Layer 1: Meta-Layer (Notion)
The business brain. Portfolio Dashboard, Knowledge Base, Clients CRM, Business Lines DB, Offers DB (Hormozi Value Equation), Leads Pipeline, Finances DB, System Inbox. Cross-business roll-ups, portfolio intelligence, Hormozi framework integration. Accessible to agents via Notion MCP.

### Layer 2: Business Line Layer (Federated)
Each business line is independent with its own CLAUDE.md, agent definitions, state files, compliance posture, and git repos. Five business lines defined (see below).

### Layer 3: Shared Infrastructure
Deterministic harness (JSON state, tmux session management, LaunchAgent scheduling, git worktree isolation, health monitors, budget circuit breakers). Notification layer (single webhook endpoint). Observability (Langfuse, tmuxwatch, healthchecks.io). Quality gates pipeline (Lint -> SAST/DAST -> Unit Tests -> E2E -> Multi-Model Review -> Confidence Score -> Human Review).

---

## Business Lines

### 1. Client Work (Anchor Revenue)
- **Orchestrator:** L-Thread Orchestrator (existing, proven, earning $50K/week)
- **Agents:** 2-3 coding agents (Conduit or Teams mode) + 1 review agent
- **Compliance:** BSI IT-Grundschutz, DSGVO, BSI C5 (cloud), EU AI Act Art. 50
- **Pricing:** Fixed-price sprints (EUR 15,000-50,000). Never hourly.
- **Isolation:** MANDATORY. Government project context must never touch other business line data.

### 2. SaaS Factory
- **Pattern:** Pieter Levels "12 in 12" -- ship fast, kill ruthlessly
- **Agents:** 2-3 coding agents per product, sequential (not parallel products)
- **Stack:** Next.js + Supabase + Stripe + Clerk + Vercel + shadcn/ui
- **Kill criteria:** <100 users AND <$200 MRR at week 12 = kill
- **Maximum:** 3 active products at any time

### 3. Lead Gen Swarm
- **Pipeline:** Scrape -> Qualify -> Build demo page -> Physical letter (Briefpost) -> Convert
- **Legal:** Cold email ILLEGAL in Germany (UWG Section 7). Physical mail is the only scalable legal first-contact channel.
- **Tools:** LocalScraper/Apify, Clay, Next.js template, letterxpress.de
- **Budget:** EUR 350-800/month for 500-1,000 letters

### 4. Finance Agent (Existing)
- **System:** Running daily via LaunchAgent. 7 Notion databases.
- **Automation:** Daily `/check` at 08:00, weekly `/scan` Mon 09:00
- **Extension:** Add per-line P&L, XRechnung invoicing

### 5. Marketing Engine
- **Nature:** Service layer, not direct revenue line
- **Agents:** Offer Architect, Lead Magnet Builder, Content Agent, Outreach Agent
- **Skills:** 7 Hormozi framework Skills (offer-architect, value-equation-scorer, constraint-eliminator, lead-magnet-builder, closer-script, preframe-questions, guarantee-designer)

---

## 70/30 Deterministic / LLM Split

The most critical architectural decision. Validated by Stripe (1,300+ PRs/week), OpenAI Codex, Praetorian (39 agents), QuantumBlack/McKinsey.

> "The LLM is a nondeterministic kernel process wrapped in a deterministic runtime environment."

### Deterministic (70%) -- Code, Scripts, Lookup Tables
Task routing/dispatch, state management, health monitoring, git operations, CI/CD execution, scheduling/cron, budget enforcement, notification routing, file locking, context assembly, log rotation, session lifecycle hooks.

### LLM-Powered (30%)
Code writing, code review (judgment), failure diagnosis, task decomposition, content generation, prompt generation, strategic decisions, customer interaction.

### Alternating Pattern (Stripe Model)
Every workflow alternates: deterministic context assembly -> LLM planning -> deterministic git worktree -> LLM coding -> deterministic lint -> LLM fix -> deterministic test -> LLM fix -> deterministic push/CI -> deterministic state update. The LLM never decides whether to run lint, push, or interpret exit codes.

---

## Context Architecture: Two-Brain Separation

| Business Brain (Portfolio Orchestrator) | Code Brain (Worker Agents) |
|-----------------------------------------|---------------------------|
| Reads: Notion meta-layer, MEMORY.md, decision log, customer data, revenue goals | Reads: AGENTS.md, design docs, src/, test/, type definitions, API schemas |
| Writes: Agent prompts, task assignments, state updates, knowledge base | Writes: Code changes, PRs, test results, progress files |
| NEVER sees: Source code, type definitions, test files | NEVER sees: Customer data, meeting notes, revenue goals |

**Context assembly is deterministic** -- a lookup table maps task type to context bundle. Tiered loading: Tier 0 (always loaded, ~500-1500 tokens), Tier 1 (injected by SessionStart hook), Tier 2 (on-demand Skills/docs).

---

## Build Strategy

### Phase 1: Thin Shared Layer (Days 1-3)
Build exactly three things:
1. **Unified State Schema** -- JSON schema, state adapters for L-Thread Orchestrator and Finance Agent, portfolio-status.sh aggregator
2. **Shared Notification Layer** -- One webhook endpoint, `notify.sh` script, wire into both systems
3. **Shared Event Protocol** -- Minimal JSON event format, `_bmad/portfolio/events/` directory, SessionStart hooks check for unconsumed events

Zero infrastructure. Zero databases. Zero abstractions.

### Phase 2: Run Under Load (Days 4-60)
Keep L-Thread Orchestrator and Finance Agent running. Both emit through the thin shared layer. Observe what actually crosses system boundaries. Build Notion meta-layer databases (Week 1-2), Portfolio Dashboard (Week 2), SaaS experiment (Week 4-8), Lead Gen demo page generator (Week 4-6), Hormozi Skills (Week 2-4), observability (Week 1-4).

**Do NOT build:** cross-project knowledge graph, self-improving prompts, confidence scoring, architecture search, learned routing, custom task queue.

### Phase 3: Informed Rebuild (Days 60-90)
Rebuild only the shared layer based on 60 days of operational data. Graduate state to SQLite if needed. Add confidence scoring (now have data). Add failure-informed prompt generation. Add Portfolio Orchestrator as a proper agent.

### Phase 4: Scale and Compound (Days 90+)
Strangler-fig migration of Finance Agent and Orchestrator capabilities into shared layer. Cross-project knowledge transfer (Cognee or custom). Self-improving prompts (DSPy or Skill Evolver). Evaluate Pi Agent. Progressive deletability.

---

## Key Numbers (Appendix)

| Metric | Value | Source |
|--------|-------|--------|
| Coordination overhead exponent | 1.724 (super-quadratic) | DeepMind/MIT |
| Error amplification (centralized) | 4.4x | DeepMind/MIT |
| Error amplification (uncoordinated) | 17.2x | DeepMind/MIT |
| Optimal coordinated team size | 3-4 agents | DeepMind/MIT |
| Human review capacity | 5-6 PRs/day | SmartBear/Cisco |
| Multi-model review bug catch rate | ~92% | Phase 2 research |
| Multi-model review cost | ~$0.06/PR | Phase 2 research |
| AI code vulnerability rate | 45% | Veracode 2025 |
| Claude Max arbitrage factor | 18-36x vs. API | Phase 2 research |
| Agent delivery margins | 46-83% gross | Phase 2 research |
| Token costs as % of revenue | <2% | Phase 2 research |
| Context degradation threshold | ~50 tool calls | Anthropic, Manus |
| RAM per agent | ~2GB | Agentic Coding Flywheel |

---

## Architecture Decision Records (Summary)

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | Federated over Monolithic | DSGVO compliance isolation mandatory for gov work. Linear vs. exponential complexity growth. |
| ADR-002 | JSON State over Database (Phase 1-2) | Human/agent readable, git versioned, zero infrastructure. Graduate to SQLite at Day 60+ if needed. |
| ADR-003 | Notion as Business Brain, Not Code Brain | 100-500ms latency too slow for code context. Business context needs relational queries + dashboards. |
| ADR-004 | Physical Mail for German Lead Gen | UWG Section 7 makes cold email illegal. Fines up to EUR 300K. Physical B2B mail needs no prior consent. |
| ADR-005 | Claude Code as Primary Harness (for now) | Earning $50K/week. Works. Do not migrate revenue-generating system to unproven harness. Re-evaluate at Day 60. |

---

## Top Risks

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Claude Max price increase | High (12-18mo) | Critical | Provider-agnostic design, LiteLLM ready |
| AI-generated code security breach | Medium | Critical | SAST/DAST every PR, multi-model review, E&O insurance |
| Legal action from cold outreach | Low (Briefpost only) | High | Physical mail only, document consent chain |
| EU AI Act compliance failure | Medium (by Aug 2026) | High | AI disclosure in all contracts by June 2026 |
| Second System Effect | High | High | Thin shared layer approach, 60-day learning period |
| Revenue interruption during migration | Medium | Critical | L-Thread Orchestrator untouched, all new work additive |

---

## What NOT to Build

1. Custom task queue / event bus infrastructure
2. Cross-project knowledge graph (before Day 90)
3. Self-improving prompt system (before Day 60)
4. Confidence scoring engine (before Day 60)
5. Architecture search (ADAS)
6. Unified agent platform abstracting away all tools
7. Agent-to-agent communication via LLM
8. Premature multi-model routing (before Day 60)
9. Custom CLI/TUI for the orchestrator
10. Automated AI disclosure document generation

---

## Burak's Notes

*(empty)*
