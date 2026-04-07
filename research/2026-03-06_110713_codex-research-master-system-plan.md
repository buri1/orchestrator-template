# Codex Master System Plan For Burak

**Date:** 2026-03-06  
**Basis:** Phase 2 research, current `orchestrator`, current `Finance-agent`, and the Elvis/OpenClaw pattern adapted to Burak's actual goals.

## Bottom Line
Do **not** build one giant omniscient system.
Do **not** keep building isolated agents forever.

Build a **shared deterministic control substrate** that powers several **bounded operating cells**:
- client delivery cell
- product launch cell
- growth experiment cell
- finance/admin cell

That gives you one real system at the infrastructure level and many small systems at the workflow level.

## The Core Thesis
Your compounding asset is not "more agents."
It is a system that can repeatedly do this loop:

```text
business intent -> scoped project -> bounded task -> agent execution -> deterministic validation -> human approval when needed -> shipped result -> learning captured
```

The architecture should therefore be:
- **deterministic at the control plane**
- **LLM-heavy inside execution cells**
- **human-owned at legal, financial, and client-risk boundaries**

## Direct Answers

### Should you build one big system?
Yes at the **substrate** level.
No at the **workflow** level.

Meaning:
- one task model
- one event model
- one policy model
- one audit log
- one approval framework
- one model routing layer
- one observability stack

But separate operating cells for each business domain.

### Should you build incrementally or rebuild from scratch?
Build a **new thin spine** and migrate incrementally.

Do not do a blank rewrite.
Do not keep patching the current shape forever.

The right move is a **foundational refactor**:
- preserve what already works
- extract shared primitives
- re-home each domain onto the new substrate one by one

### What is Notion's role?
Notion stays, but its role shrinks.

Notion should be:
- operator UI
- human dashboard
- editable knowledge surface
- approvals and review inbox
- CRM / playbook / notes surface

Notion should **not** be:
- workflow engine
- transactional source of truth
- idempotency layer
- retry system
- canonical event log
- coordination backbone

### What belongs in Pi vs ClaudeCode/Codex/orchestrator?
Use a **hybrid split**.

**Pi-style / control-plane layer should own:**
- business memory
- goals, projects, and cross-domain context
- heartbeat / proactive scans
- skills / playbooks / knowledge retrieval
- model routing strategy
- command surface for Burak
- high-level task decomposition

**Claude Code / Codex execution layer should own:**
- coding work in isolated worktrees
- implementation PRs
- code review loops
- tests, fixes, and E2E runs
- repo-local execution
- narrow task completion artifacts

**Deterministic services should own:**
- task state
- retries / timeouts / budgets
- task routing
- event capture
- approval policies
- due dates / urgency / billing math / finance math
- lead dedupe / entity IDs / sync jobs

So the real answer is:
- **Pi or a Pi-inspired thin gateway for the business-facing top layer**
- **your orchestrator as the deterministic execution substrate**
- **Claude Code/Codex as swappable workers, not the system itself**

## Recommended Architecture

```text
Burak
  |
  v
Portfolio Layer
businesses | offers | constraints | goals | risk | economics
  |
  v
Project Layer
business -> product -> project -> task -> run -> artifact -> verdict
  |
  v
Control Plane (deterministic)
registry | scheduler | policy engine | budgets | approvals | event log | observability
  |
  +------------------+------------------+------------------+
  |                  |                  |                  |
  v                  v                  v                  v
Client Cell      Growth Cell       Product Cell       Finance Cell
  |                  |                  |                  |
  v                  v                  v                  v
Execution Workers (LLM)
coder | reviewer | e2e | design | copy | research | outreach draft
  |
  v
Validation Layer (deterministic)
CI | lint | tests | E2E | screenshots | policy checks | confidence routing
  |
  v
Human Approval Layer
client-facing | financial | legal | high-blast-radius actions
```

## The Four Real Systems You Need

### 1. Portfolio OS
This is the missing layer Elvis-style systems get right.
It should track:
- businesses
- offers
- pipelines
- goals
- experiments
- product bets
- recurring revenue lines
- risk class per domain

This is where Hormozi knowledge belongs as structured playbooks, not as a giant chat memory dump.

### 2. Delivery OS
This is where your current orchestrator is strongest.
It should become the industrial execution layer for:
- client work
- SaaS feature work
- maintenance
- incident response
- PR shipping

This is the part you already understand best. Do not replace it. Harden it.

### 3. Growth OS
This is for the local-business landing-page swarm and future launch experiments.
It should run deterministic pipelines like:
- lead source ingest
- qualification
- asset generation
- landing page generation
- offer generation
- personalized email draft creation
- approval / send / tracking

Important: sending and CRM updates should be deterministic and permissioned. LLMs only write drafts and suggestions.

### 4. Finance OS
Keep Finance-agent as a domain module, not a side project and not the whole system.
It should provide:
- cash / runway view
- obligations and deadlines
- risk alerts
- draft creditor communication
- subscription pressure
- payment priority recommendations

Finance should inform every other system, but it should not own orchestration.

## The Main Boundary: Control Plane vs Execution Plane
This is the most important decision in the whole architecture.

### Control Plane
Long-lived. Deterministic. Portfolio-aware.

It decides:
- what matters now
- which project cell wakes up
- which worker gets which task
- what budget applies
- what approval is required
- whether something is allowed to proceed
- what gets logged and escalated

### Execution Plane
Ephemeral. Narrow. Replaceable.

It does:
- code
- copy
- design specs
- research memos
- test generation
- review comments
- implementation proposals

The execution plane should never become the home of business truth.

## The Build Doctrine

### Rule 1
The orchestrator never owns code changes.

### Rule 2
No LLM decides final completion without deterministic validation.

### Rule 3
Every domain gets a small bounded cell before it gets automation at scale.

### Rule 4
Every important action leaves evidence: event, artifact, verdict, approval.

### Rule 5
Shared infrastructure first, domain complexity second.

## What To Build First
Build the **shared substrate** and one **revenue-aligned cell**.

My recommendation:

### First sellable slice
**Client Delivery / Maintenance Control Tower**

Why this first:
- closest to your current orchestrator strength
- trustable and auditable
- easier to validate than growth automation
- aligned with your governmental/state client ambition
- creates recurring leverage faster than a general venture OS

V1 loop:
```text
intake -> scoped task -> coder -> reviewer -> e2e -> PR/report -> Burak approval -> ship
```

This slice should force you to build the substrate correctly:
- project registry
- task schema
- run/event schema
- approval model
- evidence model
- observability dashboard
- cost tracking

Once that exists, the same substrate can power the growth cell and finance cell.

## Immediate Execution Sequence
Ignore calendar time. Follow sequence.

### Step 1. Freeze the canonical data model
Create the core entities:
- `Business`
- `Offer`
- `Project`
- `Task`
- `Run`
- `Artifact`
- `Verdict`
- `Approval`
- `Learning`
- `Policy`

### Step 2. Build the deterministic spine
Implement:
- append-only event log
- state snapshots
- task registry
- scheduler
- budget tracking
- retry/timeouts
- approval rules
- notifications

### Step 3. Standardize the project cell
A project cell should always have:
- context pack
- backlog
- allowed tools
- concurrency cap
- validation stack
- escalation policy

### Step 4. Turn the current orchestrator into the execution engine
Keep the current discipline:
- orchestrator never codes
- bounded workers
- E2E gate
- worktree/session isolation
- structured events

Then expose it through the new control plane.

### Step 5. Add Notion sync, not Notion ownership
Sync selected objects into Notion dashboards and review queues.
Do not let Notion remain the system backbone.

### Step 6. Migrate Finance-agent onto the substrate
Move finance-specific deterministic logic into services.
Keep Notion as the finance UI.
Keep LLMs for strategy, drafts, and summarization.

### Step 7. Launch the Growth cell second
Only after the control substrate exists.
That cell can then reuse:
- project/task model
- approvals
- run logging
- lead/entity IDs
- draft generation and review
- analytics and learning capture

## Where Hormozi Fits
Do not dump the books into one global memory blob.
Turn them into reusable assets:
- offer design playbooks
- lead qualification rubrics
- objection-handling trees
- pricing templates
- guarantee frameworks
- funnel teardown checklists
- outreach hooks and angles

These should be structured as:
- skills
- scoring rubrics
- prompt templates
- decision checklists
- campaign playbooks

That makes the knowledge reusable across growth, sales, delivery, and product.

## What Not To Build Yet
Do not build these first:
- giant universal memory graph
- marketplace of agents
- 10+ worker swarms
- autonomous sending without approval boundaries
- custom distributed message broker
- fully generic agent OS
- big polished UI before the substrate is right
- portfolio-wide automation loops before one cell is trustworthy

## Final Recommendation
Your system should look like this:

**One portfolio-aware control plane.**  
**Multiple bounded operating cells.**  
**A deterministic substrate underneath all of them.**  
**LLMs concentrated in execution, not governance.**

If reduced to one line:

**Build a business-aware deterministic operating system that delegates execution to disposable agent cells.**

## The Decision I Would Make Now
If I were choosing the immediate path from this research session:

1. Keep `orchestrator` and evolve it into the execution substrate.
2. Build a thin portfolio/control layer above it, Pi-inspired but not framework-dependent.
3. Use Notion as operator UI and knowledge surface only.
4. Migrate Finance-agent into a finance cell on the shared substrate.
5. Productize the client delivery/maintenance cell first.
6. Clone the same pattern into growth experiments second.

## Related Codex Research Notes
- `research/2026-03-06_110029_codex-research-phase2-architecture-principles.md`
- `research/2026-03-06_110029_codex-research-finance-agent-migration.md`
- `research/2026-03-06_110029_codex-research-multi-business-system-blueprint.md`
