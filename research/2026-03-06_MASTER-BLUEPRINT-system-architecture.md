# MASTER BLUEPRINT: Unified Multi-Business Agent System Architecture

**Date:** 2026-03-06
**Status:** Definitive Architecture Reference
**Evidence Base:** 104 Phase 1+2 research documents, 5 Phase 1 analysis documents, 67 research agents, production data from L-Thread Orchestrator and Finance Agent
**Author:** Chief Architect Synthesis

---

## 0. Governing Principles

Before any diagram or schema, these principles override all design decisions. They are derived from converging evidence across DeepMind scaling research, Stripe production data, Elvis Sun's system, IndyDevDan's philosophy, and 60+ days of L-Thread Orchestrator operation.

1. **The orchestration layer is the compounding asset.** Agents commoditize. Models improve. The wiring between them -- context assembly, routing, state management, knowledge compounding -- is what endures and appreciates.

2. **Deterministic orchestration, LLM execution.** The orchestrator never guesses. Routing, state transitions, health checks, CI triggers, git operations, scheduling -- all deterministic code or lookup tables. The LLM writes code, diagnoses failures, generates content. Nothing else.

3. **Context is zero-sum.** Every token in a context window competes for attention. Business context in a coding agent's window displaces code. Code in a business agent's window displaces strategy. Architectural separation of context is not optional.

4. **Coordination overhead scales at exponent 1.724.** Doubling agents more than triples coordination cost. The answer is not more agents but better context on fewer agents, supplemented by zero-coordination parallelism for decomposable tasks.

5. **Human review is the binding constraint.** 5-6 PRs/day, 3-4 hours cognitive ceiling. Every architectural decision must reduce what the human needs to review, not increase what agents produce.

6. **Federated systems, thin meta-layer.** Each business line runs its own agents, state, and compliance posture. The meta-layer provides cross-business visibility without cross-contamination. Monolithic unification is architecturally and legally wrong.

7. **Build only what you have needed in the last 30 days.** Not what the research says is frontier. Not what might be useful. What you have actually needed and did not have.

---

## 1. System Overview Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │            LAYER 1: META-LAYER (Notion)                 │
                    │                                                         │
                    │  Portfolio Dashboard  |  Knowledge Base  |  Clients CRM │
                    │  Business Lines DB    |  Offers DB       |  Finances DB │
                    │  Projects Tracker     |  Leads Pipeline   |  System Inbox│
                    │                                                         │
                    │  Cross-business roll-ups, Hormozi frameworks,           │
                    │  knowledge compounding, portfolio intelligence          │
                    └────────────┬──────────────────────┬─────────────────────┘
                                 │                      │
                    ┌────────────▼──────────────────────▼─────────────────────┐
                    │          PORTFOLIO ORCHESTRATOR (deterministic)          │
                    │                                                         │
                    │  Reads: Notion meta-layer (business context)            │
                    │  Decides: Which business line gets attention             │
                    │  Routes: Tasks to business-line orchestrators            │
                    │  Monitors: Cross-line health, budget, priorities         │
                    │  Writes: State updates, knowledge base entries           │
                    │  NEVER: Writes code, makes LLM calls for routing        │
                    └──┬──────────┬──────────┬──────────┬──────────┬──────────┘
                       │          │          │          │          │
          ┌────────────▼──┐ ┌────▼────────┐ ┌▼─────────┐ ┌──────▼───┐ ┌────▼──────┐
          │  CLIENT WORK  │ │ SaaS        │ │ LEAD GEN │ │ FINANCE  │ │ MARKETING │
          │  ORCHESTRATOR │ │ FACTORY     │ │ SWARM    │ │ AGENT    │ │ ENGINE    │
          │               │ │ ORCHESTRATOR│ │          │ │          │ │           │
          │ L-Thread      │ │ Per-product │ │ Pipeline │ │ Notion   │ │ Hormozi   │
          │ Conduit/Teams │ │ agent teams │ │ agents   │ │ workflows│ │ templates │
          │ BSI/DSGVO     │ │ Boilerplate │ │ Scrape   │ │ Scheduler│ │ Content   │
          │ compliance    │ │ + customize │ │ Qualify   │ │ P&L per  │ │ agents    │
          │               │ │             │ │ Build    │ │ line     │ │           │
          │ 2-3 coding    │ │ 2-3 coding  │ │ Outreach │ │ Tax prep │ │ Offer     │
          │ agents        │ │ agents      │ │ Convert  │ │          │ │ architect │
          └───────┬───────┘ └──────┬──────┘ └────┬─────┘ └──────┬──┘ └─────┬─────┘
                  │                │              │              │          │
          ┌───────▼────────────────▼──────────────▼──────────────▼──────────▼─────┐
          │               LAYER 3: SHARED INFRASTRUCTURE                          │
          │                                                                       │
          │  Deterministic Harness:                                               │
          │    State files (JSON)  |  Tmux session mgmt  |  LaunchAgent scheduler │
          │    Git worktree isolation  |  Health monitors  |  Budget circuit breakers│
          │                                                                       │
          │  Notification Layer:                                                  │
          │    Telegram/Slack webhook  |  macOS notifications  |  System Inbox DB  │
          │                                                                       │
          │  Observability:                                                       │
          │    Langfuse traces  |  Token tracking  |  Cost per task  |  Devlog    │
          │    healthchecks.io dead-man switch  |  tmuxwatch                      │
          │                                                                       │
          │  Quality Gates (deterministic, non-LLM):                              │
          │    Lint → SAST/DAST → Unit Tests → E2E → Multi-Model Review →        │
          │    Confidence Score → Human Review                                    │
          │                                                                       │
          │  Git/CI:                                                              │
          │    GitHub  |  GitHub Actions  |  Worktree-per-agent  |  PR pipeline   │
          │                                                                       │
          │  Legal Shield:                                                        │
          │    LLC  |  AI E&O Insurance  |  Process Warranties  |  AI Disclosure  │
          └───────────────────────────────────────────────────────────────────────┘
```

---

## 2. Three-Layer Architecture: Detailed Specification

### Layer 1: Meta-Layer (Notion + Portfolio Intelligence)

The meta-layer is the business brain. It holds everything agents do NOT need for code execution but DO need for strategic decisions. It lives in Notion because Notion provides relational databases, roll-ups, dashboards, and MCP access -- all without writing infrastructure code.

**Databases:**

| Database | Purpose | Key Fields | Relations |
|----------|---------|------------|-----------|
| **Business Lines** | Portfolio of all business lines | Name, Status, Priority, Monthly Revenue, Monthly Cost, Agent Budget % | -> Projects, Offers, Finances |
| **Projects** | All active projects across lines | Name, Business Line, Client, Status, Contract Value, COGS, Margin | -> Business Lines, Clients, Tasks |
| **Clients (CRM)** | Every client/customer | Name, Company, Contact, Deal Stage, Lifetime Value, Last Contact | -> Projects, Offers, Leads |
| **Offers (Hormozi)** | Structured offers per the Value Equation | Dream Outcome Score, Likelihood Score, Time Score, Effort Score, Offer Stack, Guarantee | -> Business Lines, Clients |
| **Leads Pipeline** | All leads from all channels | Business, Source, Channel, Status, Demo URL, Letter Sent Date, Opt-in Date | -> Clients, Business Lines |
| **Finances** | Revenue and cost records | Date, Business Line, Type (Rev/Cost), Amount, Category, Project, Recurring | -> Business Lines, Projects |
| **Knowledge Base** | Cross-business learnings | Title, Business Line (or Shared), Category, Content, Source, Tags | -> Business Lines |
| **System Inbox** | Unified notification queue | Source Agent, Urgency (Kritisch/Warnung/Info), Message, Read Status, Action Required | Independent |

**Hormozi Framework Integration:**

The Offers DB encodes Alex Hormozi's Value Equation directly as database fields. Every offer for every business line gets scored: Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort). Target score >25 for compelling, >50 for irresistible. Seven reusable Skills encode the frameworks: `offer-architect`, `value-equation-scorer`, `constraint-eliminator`, `lead-magnet-builder`, `closer-script`, `preframe-questions`, `guarantee-designer`.

**Portfolio Dashboard:**

A single Notion page showing: MRR per business line, active projects kanban, pipeline weighted value, agent budget utilization, SaaS portfolio status, experiment metrics, cash position and runway, prioritized next actions.

### Layer 2: Business Line Layer (Federated)

Each business line is an independent system with its own:
- CLAUDE.md (rules, config, context)
- Agent definitions (`.claude/agents/*.md`)
- State files (`_bmad/` or `memory/`)
- Compliance posture
- Git repos (separate or monorepo with worktrees)

**Business Line: Client Work**

| Aspect | Specification |
|--------|---------------|
| Orchestrator | L-Thread Orchestrator (existing, proven, earning $50K/week) |
| Agent team | 2-3 coding agents (Conduit or Teams mode) + 1 review agent |
| Compliance | BSI IT-Grundschutz, DSGVO, BSI C5 (if cloud), EU AI Act Art. 50 |
| State | `_bmad/orchestrator-state.json` (existing) |
| Quality gate | Lint -> SAST/DAST -> Unit Tests -> E2E -> Multi-Model Review -> Human |
| Pricing | Fixed-price sprints (EUR 15,000-50,000). Never hourly. |
| Trust artifacts | Sicherheitskonzept, DPIA, agent activity logs, AI disclosure, XRechnung |

**Business Line: SaaS Factory**

| Aspect | Specification |
|--------|---------------|
| Pattern | Pieter Levels "12 in 12" -- ship fast, kill ruthlessly |
| Agent team | 2-3 coding agents per product, sequential (not parallel products) |
| Stack | Next.js + Supabase + Stripe + Clerk + Vercel + shadcn/ui |
| Kill criteria | <100 users AND <$200 MRR at week 12 = kill |
| Maximum | 3 active products at any time |
| State | Per-product state file in `_bmad/portfolio/saas/{product}/` |

**Business Line: Lead Gen Swarm**

| Aspect | Specification |
|--------|---------------|
| Pipeline | Scrape -> Qualify -> Build demo page -> Physical letter (Briefpost) -> Convert |
| Legal | Cold email ILLEGAL in Germany (UWG Section 7). Physical mail is the only scalable legal first-contact channel. |
| Tools | LocalScraper/Apify (scrape), Clay (enrich), Next.js template (build), letterxpress.de (mail) |
| Budget | EUR 350-800/month for 500-1,000 letters |
| State | Leads Pipeline DB in Notion |

**Business Line: Finance Agent**

| Aspect | Specification |
|--------|---------------|
| System | Existing Finance Agent (proven, running daily via LaunchAgent) |
| Data | 7 Notion databases (Glaubiger, Fristen, E-Mail Entwurfe, Posteingang, Finanzstatus, Abos, Private Schulden) |
| Automation | Daily `/check` at 08:00, weekly `/scan` Mon 09:00 via LaunchAgent |
| Extension | Add Business Line field to finances, per-line P&L, XRechnung invoicing |
| State | `memory/agent-state.json` (existing) |

**Business Line: Marketing Engine**

| Aspect | Specification |
|--------|---------------|
| Nature | Service layer, not direct revenue line (unless Hormozi SaaS is built) |
| Agents | Offer Architect, Lead Magnet Builder, Content Agent, Outreach Agent |
| Skills | 7 Hormozi framework Skills (see Layer 1) |
| Output | Offers, lead magnets, sales scripts, content, landing page copy |
| Frequency | Per-proposal (client work), per-launch (SaaS), per-experiment (swarm), weekly (content) |

### Layer 3: Shared Infrastructure

**Deterministic Harness (scripts, state, scheduling):**

| Component | Implementation | Why Deterministic |
|-----------|---------------|-------------------|
| State management | JSON files with schema validation per business line | State must be exact. A wrong field breaks recovery. |
| Task routing | Lookup table: task type -> agent type -> model | Routing decisions must be auditable and consistent. |
| Health monitoring | `tmux has-session`, `pane_current_command`, exit codes | Health checks must be binary (alive/dead), no LLM latency. |
| Git operations | Shell commands: `git worktree add`, `git checkout -b`, `git merge` | A hallucinated branch name is catastrophic. |
| CI/CD triggers | `npm test`, `make lint`, CI API calls, exit code parsing | CI must produce exact pass/fail. |
| Scheduling | LaunchAgent (macOS) or cron for periodic tasks | Schedules must fire reliably without LLM inference. |
| Budget circuit breakers | Per-agent, per-session, daily, fleet-wide token limits with hard stops | 4 parallel sessions burn the weekly Claude Max budget in 4 hours. |
| Process cleanup | `pkill -f "vitest"` etc. after agent close | Prevents memory leaks from orphaned processes. |

**Notification Layer:**

One webhook endpoint. Format: `[system_name] [severity] [message]`. All business lines post to the same endpoint. The System Inbox DB in Notion is the persistent record. macOS notifications for critical alerts. Telegram/Slack for asynchronous.

**Observability:**

| Component | Tool | Cost |
|-----------|------|------|
| Trace capture | Langfuse | Free tier sufficient |
| Token tracking | Per-agent counters in state files | $0 |
| Cost per task | Derived from token tracking | $0 |
| Session monitoring | tmuxwatch | $0 |
| Dead-man switch | healthchecks.io | Free tier |
| Devlog | Append-only `_bmad/devlog.md` per system | $0 |
| Total | | **$0-30/month** |

**Quality Gates:**

```
Agent produces PR
  |
  v
[DETERMINISTIC] Lint (eslint/biome) ──── fail? ──> Agent fix (max 2 rounds)
  |
  v
[DETERMINISTIC] SAST/DAST (Semgrep, OWASP ZAP) ──── fail? ──> Agent fix
  |
  v
[DETERMINISTIC] Unit Tests (vitest/jest) ──── fail? ──> Agent fix (max 2 rounds)
  |
  v
[DETERMINISTIC] E2E Tests (Playwright + Chrome DevTools MCP) ──── fail? ──> Agent fix
  |
  v
[LLM] Multi-Model Review (2-3 models, catch different error classes)
  |                        ~92% bug catch rate at ~$0.06/PR
  v
[DETERMINISTIC] Confidence Score (from historical agent performance data)
  |             >=0.9: auto-accept    0.7-0.9: spot-check
  |             <0.7: full review     <0.5: reject
  v
[HUMAN] Review (only what survives all gates above)
  |     Target: 2-4 items/day, not 15-25
  v
MERGE
```

---

## 3. Deterministic vs. LLM Boundary

This is the most critical architectural decision. It is validated by Stripe (1,300+ PRs/week), OpenAI Codex (1M lines), Praetorian (39 agents), and QuantumBlack/McKinsey. The principle: **"The LLM is a nondeterministic kernel process wrapped in a deterministic runtime environment."**

### What Is Deterministic (Code, Scripts, Lookup Tables)

| Function | Why Not LLM |
|----------|-------------|
| Task routing/dispatch | Routing errors waste all downstream tokens. A lookup table never hallucinates. |
| State management | A single wrong field in state breaks recovery. JSON schema validation is exact. |
| Health monitoring | Health checks must be binary and timely. LLM adds latency and uncertainty. |
| Git operations | Branch names, merge targets, worktree paths must be exact. |
| CI/CD execution | `npm test` returns a pass/fail. Nothing to interpret. |
| Scheduling/cron | Schedules must fire reliably. No LLM inference in the critical path. |
| Budget enforcement | Hard token limits per agent/session/day. Arithmetic, not judgment. |
| Notification routing | Severity -> channel mapping is a lookup table. |
| File locking/reservation | Advisory locks with pre-commit guards. Exact protocol. |
| Context assembly | Which files to load for which agent type is a lookup, not a decision. |
| Log rotation/cleanup | `find ... -mtime +30 -delete`. Shell commands. |
| Session lifecycle hooks | SessionStart, PreCompact hooks fire deterministically on lifecycle events. |

### What Is LLM-Powered

| Function | Why Not Deterministic |
|----------|---------------------|
| Code writing | Requires understanding requirements, patterns, types. Creative synthesis. |
| Code review (judgment) | "Is this architecturally sound?" requires judgment, not rules. |
| Failure diagnosis | "Why did this test fail?" requires reading code, stack traces, context. |
| Task decomposition | Breaking a feature into sub-tasks requires understanding the codebase. |
| Content generation | Marketing copy, proposals, documentation -- creative output. |
| Prompt generation | The orchestrator generates agent prompts from business context -- synthesis. |
| Strategic decisions | "Should we prioritize Client A or B?" requires business context analysis. |
| Customer interaction | Email drafts, support responses -- require tone, context, judgment. |

### The Alternating Pattern (Stripe Model)

Every agent workflow alternates between deterministic and LLM steps:

```
DETERMINISTIC: Assemble context (load CLAUDE.md, state, relevant Skills)
   LLM:       Understand task, plan approach
DETERMINISTIC: Create git worktree, checkout branch
   LLM:       Write code
DETERMINISTIC: Run lint
   LLM:       Fix lint errors (if any)
DETERMINISTIC: Run tests
   LLM:       Fix test failures (max 2 rounds)
DETERMINISTIC: Run SAST/DAST scan
   LLM:       Fix security issues (if any)
DETERMINISTIC: Push, create PR, trigger CI
   LLM:       Fix CI failures (max 2 rounds)
DETERMINISTIC: Record outcome in state, notify
```

The LLM never decides whether to run lint. It never decides whether to push. It never interprets a pass/fail exit code. The deterministic harness makes those decisions. The LLM operates within walls it cannot see over or climb.

---

## 4. Context Architecture

### The Two-Brain Separation

```
┌──────────────────────────────────────┐    ┌──────────────────────────────────┐
│        BUSINESS BRAIN                │    │         CODE BRAIN               │
│     (Portfolio Orchestrator)         │    │      (Worker Agents)             │
│                                      │    │                                  │
│  Reads:                              │    │  Reads:                          │
│    Notion meta-layer                 │    │    AGENTS.md                     │
│    MEMORY.md                         │    │    Design docs                   │
│    Decision log                      │    │    src/, test/                   │
│    Customer data                     │    │    Type definitions              │
│    Revenue goals                     │    │    API schemas                   │
│    Competitive intel                 │    │    Style guides                  │
│    Pattern log                       │    │    Skills (on-demand)            │
│                                      │    │                                  │
│  Writes:                             │    │  Writes:                         │
│    Agent prompts                     │    │    Code changes                  │
│    Task assignments                  │    │    PRs                           │
│    State updates                     │    │    Test results                  │
│    Knowledge base entries            │    │    Progress files                │
│                                      │    │                                  │
│  NEVER sees:                         │    │  NEVER sees:                     │
│    Source code                        │    │    Customer data                 │
│    Type definitions                  │    │    Meeting notes                 │
│    Test files                        │    │    Revenue goals                 │
│    Node modules                      │    │    Competitive intel             │
└──────────────────────────────────────┘    └──────────────────────────────────┘
```

**Why this separation is non-negotiable:** Anthropic's research confirms every token competes for attention. Manus reports a 100:1 input-to-output ratio -- the vast majority of cost is processing context, not generating output. Fill the window with code and the model loses business awareness. Fill it with business context and the model loses code awareness. There is no middle ground at current context window sizes.

### Context Flow Between Layers

```
Layer 1 (Meta/Notion)                Layer 2 (Business Line)              Layer 3 (Agent)
┌──────────────┐
│ Business     │──── Business context ────►┌──────────────┐
│ Lines DB     │     (read via MCP)        │ Business Line │
│ Clients CRM  │                           │ Orchestrator  │
│ Projects     │                           │               │──── Agent prompt ────►┌──────────┐
│ Knowledge    │                           │ Assembles     │     (coding context    │ Worker   │
│ Base         │                           │ context per   │      ONLY)             │ Agent    │
└──────────────┘                           │ agent task    │                        │          │
       ▲                                   └───────┬───────┘                        │ Writes   │
       │                                           │                                │ code     │
       │                                           │                                └────┬─────┘
       │                                           │                                     │
       └────── Results, metrics ──────────────────────── Outcomes, PRs ──────────────────┘
              (state updates,                            (pass/fail, confidence
               knowledge entries)                         score, cost data)
```

**Context Assembly Protocol (deterministic):**

For each agent task, the business-line orchestrator assembles context using a lookup table:

| Task Type | Context Bundle |
|-----------|---------------|
| Backend feature | AGENTS.md + relevant src/ modules + type definitions + API schema + testing patterns |
| Frontend feature | AGENTS.md + relevant components/ + UI conventions skill + design doc |
| Bug fix | AGENTS.md + error log + relevant src/ file + test file + FutureLearnings (if related INC exists) |
| Security fix | AGENTS.md + SAST report + relevant src/ + security guidelines |
| Refactor | AGENTS.md + architecture doc + relevant src/ module + test coverage report |

The orchestrator selects the right bundle. The agent receives only what it needs. This is the "specialization through context, not through different models" principle from Elvis Sun.

### Tiered Context Loading

Proven pattern from the L-Thread Orchestrator, extended to all systems:

```
TIER 0: ALWAYS LOADED (in agent definition, ~500-1500 tokens)
  - Absolute rules (non-negotiable)
  - Core behavior definitions
  - Mode detection (if applicable)

TIER 1: INJECTED BY HOOK (SessionStart, ~300-600 tokens)
  - Current state summary
  - Environment/mode flags
  - AUTO_MODE status
  - Active task context

TIER 2: ON-DEMAND (loaded when relevant, variable)
  - Skills files (.claude/skills/*.md)
  - FutureLearnings / incident database
  - Sprint briefings
  - Domain-specific documentation
  - Template files
```

**Progressive Loading Rule:** Never dump all context at start. Start with Tier 0+1. Load Tier 2 only when the agent encounters a situation requiring it. Too much context degrades effectiveness (Anthropic, Martin Fowler, Manus -- all converge on this finding).

---

## 5. State Management

### State File Schema (Unified)

Every system in the portfolio uses this base schema. System-specific fields extend it.

```json
{
  "schema_version": "2.0",
  "system_name": "client-work | saas-factory | lead-gen | finance | marketing",
  "business_line": "string",
  "last_updated": "ISO-8601",
  "compaction_count": 0,

  "current_task": {
    "id": "string",
    "type": "feature | bugfix | refactor | content | outreach",
    "status": "queued | in-progress | review | done | failed | skipped",
    "assigned_agent": "string | null",
    "parent_project": "string | null",
    "created_at": "ISO-8601",
    "started_at": "ISO-8601 | null",
    "completed_at": "ISO-8601 | null",
    "outcome": {
      "success": "boolean",
      "confidence_score": "0.0-1.0 | null",
      "notes": "string",
      "pr_url": "string | null",
      "cost_tokens": "number | null"
    }
  },

  "session_handoff": {
    "completed_this_session": ["string"],
    "open_todos": ["string"],
    "next_action": "string",
    "blockers": ["string"]
  },

  "agents": {
    "agent_id": {
      "status": "running | idle | crashed | completed",
      "model": "string",
      "task_id": "string",
      "tmux_session": "string | null",
      "last_seen_alive": "ISO-8601",
      "token_budget_remaining": "number"
    }
  },

  "metrics": {
    "tasks_total": 0,
    "tasks_completed": 0,
    "tasks_failed": 0,
    "tasks_skipped": 0,
    "total_tokens_used": 0,
    "total_cost_usd": 0.0
  }
}
```

### State Flow

```
Session Start
  |
  v
[SessionStart Hook] ──> Reads state file ──> Injects into additionalContext
  |                                           (Tier 1 context injection)
  v
Agent operates, modifies in-memory state
  |
  v
[PreCompact Hook] ──> Writes state to file ──> Increments compaction_count
  |                    (survives context compaction)
  v
Session resumes post-compaction
  |
  v
[SessionStart Hook] ──> Re-reads state ──> Agent continues with full context
```

### Recovery Patterns

| Failure Mode | Detection | Recovery |
|-------------|-----------|---------|
| Agent crash (tmux) | `tmux has-session -t <name>` returns non-zero | Read state, identify last task, respawn agent with task context |
| Context compaction | PreCompact hook fires | State persisted. SessionStart hook restores on next cycle. |
| Orchestrator crash | tmux session survives. State file is on disk. | `/tmux-recovery` command: probe sessions, reconcile state, resume |
| State corruption | Schema validation on load | Fall back to last known good state (git versioned) |
| Duplicate agents | Check `agents` map in state before spawning | If agent for same task already running, skip spawn |
| Budget exhaustion | Circuit breaker: token count > daily limit | Hard stop. Notify. Resume next session. |

### State Graduation Path

| Phase | Storage | When |
|-------|---------|------|
| Now | JSON files per system (`_bmad/*.json`, `memory/*.json`) | Working. Simple. No infrastructure. |
| Day 60+ | SQLite for queryable history, JSON for active state | When you need "show me all failures in the last week for billing features" |
| Day 90+ | SQLite + Notion for client-facing views | When clients need dashboards |

Do not graduate to SQLite before you have 60 days of operational data showing that JSON is insufficient. JSON works. It is versioned in git. It is readable by humans and agents. The "proper database" instinct is premature optimization until proven otherwise.

---

## 6. Build Roadmap

### Phase 1: Thin Shared Layer (Days 1-3)

Build three things. Not four. Not a framework. Three things.

**1. Unified State Schema**

Create the JSON schema from Section 5. Make both existing systems (L-Thread Orchestrator, Finance Agent) write to this format. A simple aggregator script reads all state files and produces a portfolio summary.

Implementation:
- Create `_bmad/portfolio/` directory structure
- Create `_bmad/portfolio/schema.json` (the schema definition)
- Add state adapter to L-Thread Orchestrator's PreCompact hook (write to unified format)
- Add state adapter to Finance Agent's session handoff (write to unified format)
- Create `_bmad/scripts/portfolio-status.sh` that reads all state files and outputs summary

**2. Shared Notification Layer**

One webhook endpoint. All systems post to it. Format: `[system_name] [severity] [message]`.

Implementation:
- Create Telegram bot (or use existing Slack webhook)
- Create `_bmad/scripts/notify.sh` that accepts system, severity, message
- Wire into Finance Agent's notification hook
- Wire into L-Thread Orchestrator's devlog

**3. Shared Event Protocol**

A minimal event format for cross-system communication. Not an event bus. A file format.

```json
{
  "event_id": "uuid",
  "timestamp": "ISO-8601",
  "source_system": "string",
  "event_type": "milestone_hit | deadline_approaching | payment_received | budget_alert",
  "payload": {},
  "consumed_by": []
}
```

Implementation:
- Create `_bmad/portfolio/events/` directory
- Events are JSON files: `{timestamp}_{source}_{type}.json`
- Each system's SessionStart hook checks for unconsumed events
- After processing, system adds itself to `consumed_by`

**Total work: 1-2 days. Zero infrastructure. Zero databases. Zero abstractions.**

### Phase 2: Run Under Load (Days 4-60)

Keep L-Thread Orchestrator running client work. Keep Finance Agent running finances. Both emit through the thin shared layer. Observe:

- What events actually cross system boundaries?
- What state aggregation do you actually use?
- Where does the thin layer break?
- What manual steps keep recurring that should be automated?

During this phase, also:
- Build the Notion meta-layer databases (Week 1-2)
- Create the Portfolio Dashboard (Week 2)
- Wire Finance Agent to publish per-line P&L (Week 3)
- Add SessionStart hook to Finance Agent (currently manual loading -- this is an anti-pattern)
- Add PreCompact hook to Finance Agent (currently no compaction recovery)
- Build first SaaS experiment on the shared protocol (Week 4-8)
- Build demo page generator for Lead Gen experiment (Week 4-6)
- Create Hormozi framework Skills files (Week 2-4)
- Add observability: Langfuse traces, token tracking (Week 1-4)

**What NOT to build in Phase 2:**
- Cross-project knowledge graph
- Self-improving prompt system
- Confidence scoring engine
- Architecture search
- Learned routing model
- Custom task queue infrastructure

Every one of these requires operational data to be useful. Generate the data first.

### Phase 3: Informed Rebuild (Days 60-90)

After 60 days, you will know:
- Which of the 104 research findings actually matter in practice (not theory)
- What the real integration points between business lines are
- Where JSON state is sufficient and where it is not
- What your actual state management needs are

Rebuild the shared layer. Not the whole system -- just the shared layer. The existing modules keep running. The new shared layer replaces the thin one.

Specifically:
- Graduate state to SQLite if JSON proved insufficient
- Add confidence scoring (you now have 60 days of agent performance data)
- Add failure-informed prompt generation (read pattern log before generating prompts)
- Add multi-model review gate (if not already added in Phase 2)
- Add the Portfolio Orchestrator as a proper agent (not just a status script)

This rebuild should take 2-5 days with agents. The bottleneck is deciding, not coding.

### Phase 4: Scale and Compound (Days 90+)

With the informed shared layer in place:

- Strangler-fig migrate Finance Agent capabilities into shared layer
- Strangler-fig migrate Orchestrator capabilities into shared layer
- Each migration is a PR, tested, reversible
- Add cross-project knowledge transfer (Cognee or custom)
- Add self-improving prompts (DSPy or Skill Evolver pattern)
- Evaluate Pi Agent as primary harness (the tooling will have matured by then)
- Begin progressive deletability: as the orchestrator learns patterns, simplify the rules

---

## 7. Tech Stack Decisions

### Recommended Stack

| Component | Tool | Rationale | Cost |
|-----------|------|-----------|------|
| **LLM (orchestration)** | Claude Opus 4.6 via Claude Max | Frontier model for highest-leverage decisions. $200/mo is 18-36x cheaper than API. | $200/mo |
| **LLM (coding)** | Claude Code (Sonnet) via Claude Max | Fast, well-scoped coding tasks. Same subscription. | Included |
| **LLM (review)** | Gemini 2.5 (free API or paid) | Different blind spots than Claude. Vision for UI review. | $0-50/mo |
| **Agent harness** | Claude Code CLI + Custom Agents | Proven. Working. Earning revenue. Do not switch until Pi Agent is demonstrably better for YOUR workflow. | $0 |
| **Business brain** | Notion + MCP | Relational databases, dashboards, roll-ups, agent-accessible via MCP. Finance Agent already uses it. | $10-20/mo |
| **State persistence** | JSON files (Phase 1-2), SQLite (Phase 3+) | JSON is sufficient until you need historical queries. Git-versioned. Human-readable. | $0 |
| **Process management** | tmux (macOS), LaunchAgent (scheduling) | Battle-tested. Auto-restart. Log capture. Already working. | $0 |
| **Observability** | Langfuse + tmuxwatch + healthchecks.io | Full trace capture, session monitoring, dead-man switch. | $0-30/mo |
| **Security scanning** | Semgrep (SAST) + OWASP ZAP (DAST) | 45% of AI-generated code has vulnerabilities. Non-negotiable gate. | $0 (open source) |
| **CI/CD** | GitHub Actions | Standard. Free tier for private repos. | $0 |
| **Hosting (SaaS)** | Vercel | Next.js native. Free tier generous. | $0-20/mo |
| **Database (SaaS)** | Supabase | Postgres + auth + realtime. Free tier sufficient for MVPs. | $0-25/mo |
| **Payments** | Stripe | Industry standard. 2.9% + $0.30/txn. | Per-txn |
| **Auth (SaaS)** | Clerk or NextAuth | Clerk is faster to implement. NextAuth is free. | $0-25/mo |
| **Email** | Resend | Developer-friendly. Free tier: 100 emails/day. | $0-20/mo |
| **Physical mail** | letterxpress.de or Briefpost.de | German physical letter API. EUR 0.85-1.50/letter. | EUR 85-1500/mo |
| **Scraping** | LocalScraper + Apify | Google Maps, Yellow Pages DE. | $50-200/mo |
| **Lead enrichment** | Clay + Claygent | AI research agent. 150+ data sources. | $149-349/mo |
| **Legal** | LLC + Counterpart AI E&O insurance | Deployer bears primary liability for AI-generated work. | $3K-10K/year |

**Total monthly infrastructure cost: $200-800/month** (excluding legal setup and physical mail campaigns).

### Stack Decisions NOT to Make Yet

| Decision | Why Wait |
|----------|----------|
| Pi Agent vs. Claude Code | Pi Agent is evolving rapidly. Wait 60 days for it to stabilize. Keep Claude Code earning revenue. |
| TypeScript harness vs. shell scripts | Shell scripts work. A TypeScript rewrite is a "second system" risk. Wait for pain points. |
| LiteLLM / OpenRouter provider abstraction | Not needed until Claude Max arbitrage ends or you need multi-provider. |
| Kubernetes / Docker orchestration | You are one person on one Mac. tmux + LaunchAgent is sufficient. |
| Custom dashboard (React) | Notion dashboards are free and sufficient. Build custom only when clients need a branded portal. |

---

## 8. What NOT to Build

This list is as important as the architecture. Each item is a proven trap.

**1. A custom task queue / event bus infrastructure.**
Your agents communicate via tmux, file-based events, and Notion. Building a Redis/RabbitMQ/custom queue system is the inner platform anti-pattern. Claude Code already has Task tool and Agent Teams. Use what exists.

**2. A cross-project knowledge graph (Day 1).**
Cognee and similar tools require operational data to populate. A knowledge graph without data is an empty database with expensive infrastructure. Build the system that generates the data first. Add the graph at Day 90+ when you have data to graph.

**3. A self-improving prompt system (Day 1).**
DSPy, PromptBreeder, and Skill Evolver all require a stable system to improve. You cannot optimize prompts for a system that does not exist yet. Build the system. Run it for 60 days. THEN optimize.

**4. A confidence scoring engine (Day 1).**
Confidence scores require historical performance data. You need 60+ days of agent outcomes (success/failure by task type, model, prompt pattern) before a confidence score means anything. Until then, score manually: trust/don't trust.

**5. Architecture search (ADAS).**
Research-grade. Not production-ready. Not relevant until 2027 at earliest for a solo operator.

**6. A "unified agent platform" that abstracts away Claude Code, Pi, Codex, etc.**
This is the inner platform effect. Each tool has its own strengths. Use each for what it does best. A generic wrapper over all of them will be worse than any of them individually.

**7. Agent-to-agent communication via LLM.**
Agents should not "talk" to each other through natural language. The orchestrator routes. Agents execute. If Agent A's output is needed by Agent B, the orchestrator extracts the relevant output and includes it in Agent B's context. The orchestrator is the switchboard, not a translator.

**8. Premature multi-model routing.**
"Send backend to Codex, frontend to Claude, design to Gemini" sounds smart but requires data on which model actually performs better for which task type in YOUR codebase. Start with Claude for everything. Add model routing at Day 60+ based on measured performance differences.

**9. A custom CLI or TUI for the orchestrator.**
The orchestrator runs in Claude Code's terminal. Adding a custom interface is UI work that generates zero revenue. The terminal is the interface.

**10. Automated AI disclosure document generation.**
Write the AI disclosure document once, manually. Template it. Do not build a system to generate disclosure documents. This is a one-time legal document, not a recurring engineering problem.

---

## 9. Success Metrics

### Leading Indicators (measure weekly)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Revenue per agent-hour | >$500/hour of agent compute | Contract value / total agent hours |
| Human review time per PR | <30 minutes | Track review start/end timestamps |
| Items reaching human review per day | <5 | Count of PRs that pass all automated gates |
| Agent first-pass success rate | >70% | Tasks completed without retry / total tasks |
| Context utilization ratio | <60% of window | Monitor token count at task completion |
| Cross-system events processed | >0 per week | Count events in `_bmad/portfolio/events/` |
| Knowledge base entries added | >2 per week | Count new entries in Knowledge Base DB |

### Lagging Indicators (measure monthly)

| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) |
|--------|-------------------|-------------------|--------------------|
| Total MRR | EUR 41,500 | EUR 68,000 | EUR 120,000 |
| Client Work revenue | EUR 40,000 | EUR 60,000 | EUR 90,000 |
| SaaS MRR | EUR 500 | EUR 3,000 | EUR 15,000 |
| Lead Gen revenue | EUR 1,000 | EUR 5,000 | EUR 15,000 |
| Infrastructure cost | EUR 400 | EUR 600 | EUR 800 |
| Gross margin | >95% | >95% | >95% |
| Active SaaS products | 1 | 2-3 | 3-5 |
| Agent success rate (30d avg) | 60% | 75% | 85% |
| Pattern log entries | 50 | 200 | 500+ |
| FutureLearnings incidents | 20 | 50 | 100+ |

### Kill Signals (stop and reassess if)

- Agent first-pass success rate drops below 40% for two consecutive weeks
- Human review time exceeds 4 hours/day consistently
- Any business line operates at negative margin for 30+ days (excluding planned experiments)
- Claude Max subscription changes make the economics non-viable (>3x price increase)
- Legal/compliance event (lawsuit, Abmahnung, data breach) -- stop everything, assess

---

## 10. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|:-----------:|:------:|------------|
| R1 | **Claude Max price increase / rate limit tightening** | High (12-18 months) | Critical (economics collapse) | Build provider-agnostic from day one. Track API cost parity monthly. Have LiteLLM ready to deploy. Never architect exclusively for one provider. |
| R2 | **AI-generated code security breach** | Medium | Critical (liability, reputation) | SAST/DAST on every PR. Multi-model review. Security-specific Skills files. AI E&O insurance. Process warranties in contracts (warrant the process, not the output). |
| R3 | **Legal action (Abmahnung) from cold outreach** | Medium (if email used) / Low (if Briefpost only) | High (EUR 300K+ fines) | Physical mail ONLY for first contact in Germany. No cold email. Document consent chain. Legal review of outreach templates. |
| R4 | **EU AI Act / Colorado AI Act compliance failure** | Medium (by Aug 2026) | High (regulatory) | AI disclosure in all contracts by June 2026. Audit trail for all AI-generated work. LLC in place before any compliance deadline. |
| R5 | **Human review bottleneck at scale** | High (at >10 agents) | Medium (quality degradation) | Multi-model review gate reduces items reaching human by 85%. Confidence scoring automates low-risk acceptance. Hire first reviewer at 15+ agents. |
| R6 | **Context degradation in long-running agents** | High | Medium (quality) | Hard limit: 50 tool calls per agent session. Progress.md for session recovery. PreCompact hooks for state persistence. Fresh context on every new task. |
| R7 | **Second System Effect** | High (you have 104 research docs of ideas) | High (months wasted on over-engineering) | The "thin shared layer" approach explicitly prevents this. Build only what you need. Rebuild once at Day 60, not continuously. |
| R8 | **Revenue interruption during migration** | Medium | Critical (you depend on $50K/week) | L-Thread Orchestrator is NOT touched. It keeps running. All new work is additive. Strangler-fig migration only after replacement is proven. |
| R9 | **Coordination overhead exceeding value (>3-4 tightly-coupled agents)** | Medium | Medium (wasted tokens, worse output) | Cap coordinated teams at 3-4 agents. Use one-shot isolated pattern for parallelizable tasks. Monitor coordination overhead per sprint. |
| R10 | **Insurance coverage gap (carrier exclusions)** | Medium | Critical (uninsured liability) | Counterpart AI affirmative coverage (backed by Aspen/Markel/Westfield). Budget $3K-10K/year. Apply before claims data narrows the window. |
| R11 | **State file corruption / loss** | Low | High (lost progress) | State files in git. Commit on every PreCompact. Schema validation on load. Fallback to last known good. |
| R12 | **Notion API rate limits / downtime** | Low | Medium (Finance Agent blocked) | Add rate-awareness to Notion calls. Cache frequently-read data. Accept 100-500ms latency. Have local markdown fallback for critical context. |

---

## 11. Migration Plan: Finance Agent Integration

The Finance Agent is the first system to integrate with the meta-layer. This is a non-breaking, additive migration.

### Phase 1: Add Hooks (Non-Breaking, Week 1)

- Create `finance-session-start.sh` (reads state, injects context -- like Orchestrator's hook)
- Create `finance-handoff.sh` (persists state before compaction)
- Add to Finance Agent's `settings.local.json` hooks section
- Test: scheduler still works, hooks inject context, `/check` remains idempotent

### Phase 2: Add Event Publishing (Non-Breaking, Week 2)

- After `/check`: write event to `_bmad/portfolio/events/` if critical deadline found
- After `/income`: write event for revenue update
- After `/scan`: write event for new documents processed
- Test: existing commands still work, events appear in portfolio events directory

### Phase 3: Add Cross-System Reading (Non-Breaking, Week 3-4)

- `/status` reads from shared Projects DB in Notion (if it exists)
- `/triage` considers project milestones for runway calculation
- Test: `/status` shows project-linked income data alongside existing finance data

### Phase 4: Shared Notification (Week 4)

- Replace Finance Agent's direct `osascript` calls with shared `notify.sh`
- Finance Agent publishes to System Inbox DB in Notion
- Test: notifications still arrive on desktop AND appear in unified inbox

### What NOT to change:

- Do NOT merge Finance Agent repo into Orchestrator repo
- Do NOT rewrite the 10 Finance Agent commands
- Do NOT change Notion DB schemas (add new DBs, don't modify existing)
- Do NOT centralize state (each system keeps its own state file)

---

## 12. Architecture Decision Records

### ADR-001: Federated over Monolithic

**Decision:** Each business line runs as an independent system with its own agent configuration, state, and compliance posture. A thin meta-layer (Notion) provides cross-business visibility.

**Rationale:** Government client work requires DSGVO/BSI compliance isolation. An agent that holds Staatskanzlei project context must NEVER also hold scraped local business data from the Lead Gen swarm. Compliance isolation alone makes federation mandatory. Additionally, federated systems have linear complexity growth vs. exponential for monolithic. Each system can fail independently without taking down the portfolio.

**Consequences:** Cross-system communication requires explicit event publishing. Knowledge sharing requires explicit routing through the Knowledge Base DB. More initial setup, less ongoing complexity.

### ADR-002: JSON State Files over Database

**Decision:** Use JSON files for state management in Phase 1-2. Graduate to SQLite at Phase 3 (Day 60+) only if JSON proves insufficient.

**Rationale:** JSON files are: (a) readable by humans and agents without tools, (b) version-controlled in git with full history, (c) zero-infrastructure, (d) schema-validatable, (e) sufficient for current scale (5-10 agents, 3-5 business lines). SQLite adds complexity without current benefit. Elvis Sun started with JSON and graduated to a database only when his agent registry exceeded ~50 entries.

**Consequences:** No historical queries until Phase 3. No concurrent write safety (acceptable for single-orchestrator systems). Schema migration is manual.

### ADR-003: Notion as Business Brain, Not Code Brain

**Decision:** Notion is the data layer for business context (CRM, projects, finances, knowledge base, portfolio dashboard). Code context stays in the filesystem (CLAUDE.md, Skills files, src/).

**Rationale:** Notion MCP has 100-500ms latency per call -- too slow for code context that agents read dozens of times per session. Code context is filesystem-native (already in the working directory). Business context needs relational queries, dashboards, and human readability -- Notion provides all three. The Finance Agent already proves this pattern works.

**Consequences:** Two "truth" stores: Notion for business, filesystem for code. Updates between them are explicit (not synced automatically). Agent prompts reference both but load from different sources.

### ADR-004: Physical Mail for German Lead Gen

**Decision:** All initial cold outreach to German businesses uses physical mail (Briefpost), never email.

**Rationale:** Germany's UWG Section 7 effectively makes cold email to businesses illegal without explicit prior consent. Violations carry fines up to EUR 300,000 per violation plus competitor-initiated Abmahnungen. Physical B2B mail requires no prior consent. The conversion funnel is: letter with QR code -> demo page visit -> opt-in form -> NOW email is legal.

**Consequences:** Higher per-lead cost (EUR 0.85-1.50 vs. EUR 0.01). Lower volume. But zero legal risk. The demo-page-in-a-letter tactic is the highest-leverage compliant approach.

### ADR-005: Claude Code as Primary Harness (for now)

**Decision:** Continue using Claude Code CLI with Custom Agents as the primary agent harness. Do not migrate to Pi Agent, CrewAI, LangGraph, or any alternative harness in Phase 1-2.

**Rationale:** Claude Code is earning $50K/week. It works. Migrating a revenue-generating system to an unproven harness is risk without reward. Pi Agent is promising but evolving rapidly -- wait 60 days for it to stabilize. The "80/20 Pi/Claude Code" split that IndyDevDan recommends applies to greenfield work, not to migrating a working production system.

**Consequences:** Limited to Claude Code's feature set (no native multi-provider routing, no built-in observability). These gaps are filled by the deterministic harness layer (tmux, scripts, Langfuse).

---

## Appendix A: Key Numbers

| Metric | Value | Source |
|--------|-------|--------|
| Coordination overhead exponent | 1.724 (super-quadratic) | DeepMind/MIT, 180 experiments |
| Error amplification (uncoordinated) | 17.2x | DeepMind/MIT |
| Error amplification (centralized orchestrator) | 4.4x | DeepMind/MIT |
| Single-agent threshold | 45% accuracy | DeepMind/MIT |
| Optimal coordinated team size | 3-4 agents | DeepMind/MIT |
| Human review capacity | 5-6 PRs/day | SmartBear/Cisco, 3.2M LOC study |
| AI-generated PR review time | 4.6x longer | Opsera |
| Multi-model review bug catch rate | ~92% | Phase 2 research |
| Multi-model review cost | ~$0.06/PR | Phase 2 research |
| AI code vulnerability rate | 45% | Veracode 2025 |
| Claude Max arbitrage factor | 18-36x vs. API | Phase 2 research |
| Manus input-to-output token ratio | 100:1 | Manus blog |
| Cost-per-agent sweet spot | 5-10 agents, $130-200/mo each | Phase 2 scaling analysis |
| Agent delivery margins | 46-83% gross | Phase 2 business analysis |
| Token costs as % of revenue | <2% | Phase 2 business analysis |
| Context degradation threshold | ~50 tool calls | Anthropic, Manus |
| Stripe merged PRs/week | 1,300+ | Stripe engineering blog |
| RAM per agent | ~2GB | Agentic Coding Flywheel |

## Appendix B: File Structure

```
_bmad/
  portfolio/
    schema.json                      # Unified state schema definition
    events/                          # Cross-system event files
    client-work/
      orchestrator-state.json        # (existing, adapted to unified schema)
    saas-factory/
      {product}/
        orchestrator-state.json
    lead-gen/
      pipeline-state.json
    finance/
      agent-state.json               # (existing, adapted to unified schema)
    marketing/
      campaign-state.json
  scripts/
    portfolio-status.sh              # Reads all state files, outputs summary
    notify.sh                        # Shared notification endpoint
    orchestrator-session-start.sh    # (existing)
    orchestrator-handoff.sh          # (existing)
    finance-session-start.sh         # (new -- replaces manual loading)
    finance-handoff.sh               # (new -- adds compaction recovery)
    tmux-helpers.sh                  # (existing)
    health-check.sh                  # Probes all tmux sessions, reports status

.claude/
  agents/
    orchestrator.md                  # (existing) L-Thread Orchestrator persona
    finance-agent.md                 # Finance Agent persona (in its own repo)
    hormozi-offer-builder.md         # (new) Hormozi framework agent
    overseer.md                      # (existing) Meta-monitoring agent
  skills/
    billing-system.md                # Load when task involves billing
    auth-flow.md                     # Load when task involves auth
    ui-conventions.md                # Load when task involves frontend
    testing-patterns.md              # Load when task involves testing
    hormozi-value-equation.md        # Load when building offers
    hormozi-lead-magnet.md           # Load when building lead magnets
    hormozi-closer.md                # Load when building sales scripts
    bsi-grundschutz.md               # Load for government compliance work
    dsgvo-checklist.md               # Load for GDPR compliance

Notion (Meta-Layer):
  Business Lines DB
  Projects DB
  Clients CRM DB
  Offers DB (Hormozi)
  Leads Pipeline DB
  Finances DB
  Knowledge Base DB
  System Inbox DB
  SaaS Products DB
  Experiments DB
  + Existing Finance Agent DBs (7 databases, untouched)
```

## Appendix C: The One-Page Summary

For when you need the architecture in 60 seconds:

**Three layers:** Notion meta-layer (business brain) -> Federated business lines (each with own orchestrator) -> Shared infrastructure (deterministic harness, notifications, observability, quality gates).

**Five business lines:** Client Work (anchor revenue, do not touch), SaaS Factory (sequential launches, kill at week 12), Lead Gen Swarm (physical mail in Germany, never cold email), Finance Agent (existing, extend with per-line P&L), Marketing Engine (service layer, Hormozi frameworks as Skills).

**Core rules:** Deterministic orchestration, LLM execution. Context separation (business brain never sees code, code brain never sees customers). Max 3-4 coordinated agents. JSON state files, git versioned. Kill the "second system effect" by building thin and learning for 60 days before rebuilding.

**Build sequence:** Thin shared layer (Days 1-3) -> Run under load (Days 4-60) -> Informed rebuild (Days 60-90) -> Scale and compound (Days 90+).

**Success = fewer items reaching human review, not more items produced.**

---

*This document is the definitive architecture reference for the unified multi-business agent system. All implementation decisions should trace back to a principle, finding, or decision recorded here. When in doubt, refer to the governing principles in Section 0. When the evidence changes, update this document -- do not create a separate one.*
