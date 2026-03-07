# Architecture Principles For Burak's Next System

## Thesis
Your next system should not be a giant autonomous AI company in a box. It should be a disciplined orchestration system with deterministic control planes, narrow agent responsibilities, hard quality gates, and explicit human review only where human judgment actually matters. The winning architecture is not "more agents." It is tighter boundaries.

The research points to five hard truths:
- Human review, not token cost, is the real bottleneck.
- Uncoordinated multi-agent systems degrade fast.
- Trust comes from observability and deterministic gates, not model cleverness.
- Past a modest agent count, coordination overhead and review load erase gains.
- The right path is modular compounding, not one monolithic platform built upfront.

## Deterministic Boundaries
The most important design decision is where the system must be deterministic.

Deterministic components should own:
- Task state, routing rules, retries, and escalation thresholds
- File and worktree isolation
- CI, lint, tests, typechecks, and security scans
- Merge criteria and deploy permissions
- Budget limits for tokens, runtime, and parallelism
- Logging, traces, and audit history

LLMs should not own:
- Source-of-truth task state
- Whether work is "done"
- Whether code is safe to merge
- Whether a deploy happens
- Cross-agent coordination policy
- Infinite retry behavior

In practice: use LLMs to generate options, code, analyses, summaries, and proposed plans. Use deterministic software to decide what runs, what blocks, what retries, and what escalates.

## Where LLMs Should Sit
LLMs belong inside bounded work cells, not at the foundation of the operating system.

Good places for LLMs:
- Spec expansion into scoped subtasks
- Implementation inside a single bounded task
- Test generation and bug-fix proposals
- Diff review, anomaly explanation, and summarization
- Drafting human-facing artifacts for approval

Bad places for LLMs:
- Global orchestration without hard guardrails
- Final authority over merges or deploys
- Long-lived shared memory that silently mutates system truth
- Regulatory, contractual, or financial sign-off
- High-coupling coordination between many concurrent workers

A useful mental model: the LLM is a probabilistic coprocessor inside a deterministic shell.

## Scaling Limits
Do not design around fantasy scale. Design around the points where the system actually breaks.

The practical limits from the research are clear:
- A solo operator can only deeply review a handful of meaningful change sets per day.
- Review capacity collapses long before agent generation capacity does.
- Small teams beat swarms. Hub-and-spoke beats bag-of-agents.
- Parallelism helps only when tasks are genuinely independent.
- Beyond roughly 3-5 active workers per coordination layer, management complexity rises sharply.
- Beyond roughly 10-15 agents, a solo operator needs confidence routing, exception-based review, and strong observability or the system outruns supervision.
- Beyond roughly 20-50 agents, the problem becomes operations and governance, not code generation.

This means your core scaling unit should be a small supervised cell:
- 1 orchestrator
- 2-5 workers
- deterministic gates
- 1 review queue

If you need more scale later, replicate cells. Do not start with a giant swarm.

## Quality Gates
Quality must be architectural, not cultural.

The system should assume that model output is useful but untrustworthy until it passes gates. That means:
- Every worker writes into isolated branches or worktrees.
- Every task produces explicit artifacts: diff, tests, summary, and status.
- Every merge candidate passes deterministic validation before human attention is spent.
- AI review can pre-screen, cluster, and prioritize, but not replace final responsibility.
- Human review should be exception-based for low-risk work and mandatory for high-blast-radius changes.

A strong gate stack is:
1. Static checks: lint, typecheck, build.
2. Automated validation: unit, integration, E2E where relevant.
3. Security checks: secret scanning, dependency and policy checks.
4. AI review: bug patterns, architectural drift, suspicious diffs.
5. Confidence routing: auto-merge only for very low-risk, high-confidence work.
6. Human review: architecture, business logic, customer-visible behavior, irreversible actions.

If a task cannot be validated deterministically, it is not ready for autonomy.

## Human Review Bottleneck
The review bottleneck is not a temporary inconvenience. It is the main limiting factor of the whole business model.

That changes the architecture:
- Optimize for fewer review surfaces, not more output.
- Force smaller diffs and narrower task scopes.
- Route routine fixes through automatic gates and exception triage.
- Reserve human attention for architecture, risk, and ambiguity.
- Track reversal rate, rework rate, and escaped defect rate as first-class metrics.

The mistake to avoid is building a machine that produces more code than you can absorb. Velocity without absorption creates trust collapse, hidden debt, and eventually a slower business.

## Observability And Trust
You should treat observability as part of the product, not internal plumbing.

Before increasing agent count, you need visibility into:
- who did what
- with which context
- at what cost
- with what result
- where failures cluster
- when an agent is stuck, drifting, or retrying too much

The minimum viable trust layer is:
- append-only event logs
- file-backed state
- per-task cost tracking
- per-agent heartbeats
- pass/fail history for each gate
- human override logs

If the system cannot explain how a change happened, it is not production-ready.

## Build One Big System Or Grow Modularly?
Grow modularly.

A single big platform is the wrong move for three reasons:
- You do not yet know which workflows deserve deep automation.
- The failure modes differ too much across planning, coding, review, merge, and deployment.
- Monoliths hide responsibility boundaries, which is exactly what agent systems cannot afford.

Build a thin core and add modules around it.

The core should do only a few things:
- maintain canonical task state
- spawn bounded workers
- enforce budgets and timeouts
- collect telemetry
- run gates
- route to humans when thresholds trip

Everything else should be replaceable modules:
- planner
- coder
- reviewer
- test runner
- security scanner
- model router
- notifier
- deploy controller

This gives you progressive deletability. As models improve, weak scaffolding can be removed without rewriting the operating system.

## Implications For Burak
You should resist the temptation to build the most impressive orchestrator. Build the most governable one.

Specific implications:
- Do not chase maximum agent count. Chase maximum trustworthy throughput.
- Do not let the orchestrator code. The orchestrator should manage work, not participate in it.
- Do not put shared mutable memory at the center. Put explicit files, logs, and state transitions there.
- Do not expand autonomy into areas you cannot deterministically validate.
- Do not productize broad autonomy first. Productize narrow loops with measurable success, especially maintenance and bug-fix flows.
- Do not merge review, planning, execution, and release authority into one agent role.
- Do invest early in confidence scoring, anomaly detection, and review triage. Those are not polish features; they are scaling prerequisites.
- Do structure the business around cells and service lines, not a universal agent swarm.

The best near-term wedge is not a general AI software company. It is a disciplined delivery and maintenance machine where each successful loop creates more reusable context, better routing rules, and lower oversight cost on the next loop.

## Recommended Build Order
1. Build the deterministic core.
Create canonical task state, event logging, budgets, timeouts, worktree isolation, and gate execution before adding more agent sophistication.

2. Add a single worker loop.
Run one bounded coder worker from scoped task to validated diff. Prove the system can complete small tasks repeatably.

3. Add review and confidence routing.
Introduce AI pre-review, risk scoring, and human escalation thresholds. Make review load measurable.

4. Add observability before parallelism.
Ship dashboards, heartbeats, stuck-task alerts, failure clustering, and cost-per-task reporting before you add more agents.

5. Add a second and third worker only for independent tasks.
Prove that parallelism improves throughput without increasing rework or merge pain.

6. Productize one narrow autonomous loop.
Prioritize something like sentry-to-fix, dependency updates, or maintenance patches where validation is strong and blast radius is contained.

7. Add model routing and retry policy.
Only after baseline reliability exists should you optimize cost, latency, and model selection.

8. Replicate cells, not complexity.
Scale by copying a proven orchestrator-plus-workers pattern into new domains instead of building a sprawling universal supervisor.

9. Expand human-offload only where metrics justify it.
Lower review intensity only after reversal rates, escaped defects, and rework stay low for a sustained period.

## Non-Negotiable Architecture Rules
- The orchestrator manages; workers execute; validators decide; humans own accountability.
- No agent may mark its own work complete without deterministic validation.
- No shared mutable state is authoritative unless it is file-backed, inspectable, and logged.
- Every loop has hard bounds: time, tokens, retries, and parallelism.
- Every agent action must be observable enough to reconstruct failures after the fact.
- Parallel work is allowed only for tasks with explicit dependency separation.
- Human review is reserved for high-risk, high-ambiguity, or high-blast-radius changes.
- Auto-merge is earned through measured confidence, not assumed from model performance.
- New autonomy is added only after the previous layer is instrumented and stable.
- System growth happens by modular replication, not by expanding one opaque super-system.
