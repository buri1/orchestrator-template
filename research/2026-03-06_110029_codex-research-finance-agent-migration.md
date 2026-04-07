# Finance-agent as a Domain OS

## Executive Summary
The existing Finance-agent is already a real domain OS for Burak's financial life, especially debt management, deadline surveillance, and creditor negotiation. `CLAUDE.md` provides the operating rules and database map, `.claude/agents/finance-agent.md` defines the domain command surface and behavior, `agent-state.json` preserves working memory and handoff context, and the scheduler scripts provide a heartbeat.

That is the good news. The architectural issue is not that Finance-agent is weak; it is that the wrong layers currently own too much. Notion is acting as database, workflow store, review inbox, and dashboard at the same time. Prompt instructions are carrying business rules that should become deterministic. The worker scripts can trigger the agent, but they do not yet provide typed workflows, durable retries, or shared observability across Burak's broader business system.

The right migration is not to kill Finance-agent. The right migration is to keep it as a finance domain module, narrow its responsibilities, and move orchestration and deterministic execution into the broader orchestrator/business layer.

## What Works Today
The current design works because it has the essential primitives of a domain operating system:

- It has a clear domain boundary. This is not generic "personal admin"; it is specifically creditor management, deadlines, payment pressure, deferral strategy, subscriptions, and cash status.
- It has a strong domain model in Notion. The current databases cover creditors, deadlines, email drafts, inbox notifications, finance status, subscriptions, private debts, and session logs.
- It has a usable human operating surface. Notion is a good place for Burak to inspect obligations, review drafts, and update facts without touching code.
- It has a real command surface. `/check`, `/scan`, `/draft`, `/status`, `/triage`, and `/log` are already the beginnings of a finance shell.
- It has memory continuity. `agent-state.json` shows actual handoff behavior: prior scans, prior checks, draft statuses, open todos, and the next action.
- It has scheduling. `finance-worker.sh` and `manage.sh` turn the agent into a recurring process rather than a one-shot chat utility.
- It has the right strategic framing. The agent is explicitly positioned as a negotiation strategist, not a passive bookkeeper. That is correct for Burak's situation because timing, escalation risk, and creditor-specific playbooks matter more than accounting purity.

For one operator managing a messy but bounded financial reality, this is enough to create leverage quickly. It already behaves like a domain OS more than a toy prompt.

## What Breaks At Scale
The current system will start breaking as soon as finance needs to integrate tightly with the rest of Burak's multi-business operations.

- Notion is overloaded. It is good as a human-readable workspace, but weak as a transactional backend, workflow engine, or durable event log.
- Record linking is brittle. `CLAUDE.md` explicitly relies on creditor-name lookup across databases. Name-based joins are fragile and become failure-prone once volume and parallelism increase.
- Core rules live in prose, not code. Idempotency, scan locking, escalation handling, and notification limits are written as instructions the model must remember. That is acceptable for a prototype and risky for an operating system.
- `agent-state.json` is useful as a handoff file, but it is not a proper state machine. It mixes timestamps, narrative notes, and todos. That makes it hard to query, validate, replay, or audit.
- The scheduler runs opaque prompt commands. `finance-worker.sh` executes `claude --agent finance-agent --dangerously-skip-permissions -p "/$COMMAND"`. That is enough for personal automation, but it is not a strong execution contract for a larger orchestrated business stack.
- Observability is shallow. Logs are local files. Notifications depend on local hooks. The state file already records a broken desktop hook. This is exactly the kind of environment-coupled failure that accumulates quietly.
- Deterministic tasks are still agent tasks. File movement, dedupe, due-date calculation, urgency scoring, and reminder generation should not rely on a general-purpose model run every time.
- The current agent is finance-aware, not business-aware. It can reason about creditors and deadlines, but it does not naturally arbitrate between personal obligations, tax risk, subscription spend, client delivery cash flow, and operating runway across multiple businesses.
- The architecture is not yet aligned with the research direction from the orchestrator notes: orchestration is the asset, observability builds trust, event-driven systems beat polling, and long-running workflows need durable recovery.

In short: the current Finance-agent is a good domain cockpit, but not yet a durable finance substrate for a broader multi-business system.

## Migration Target
The migration target should be a simple three-layer design.

Layer 1 is Notion as the human workspace.
Notion should remain where Burak reviews creditor profiles, sees deadlines, reads summaries, approves drafts, and maintains qualitative playbooks.

Layer 2 is the orchestrator/business layer.
This layer should own cross-domain prioritization, approval routing, scheduling, audit trails, shared state, and the interface between finance and the rest of Burak's businesses.

Layer 3 is deterministic finance services.
These services should handle ingestion, extraction, state transitions, calculations, notifications, and sync jobs with typed inputs and outputs.

That gives finance a clean role inside the broader system without overcomplicating it:

- Finance is not the whole company.
- Finance is not just a Notion workspace.
- Finance is one domain service stack inside Burak's larger operating system.

In practical terms, finance should feed the broader business layer with a few stable outputs:

- current cash and runway snapshot
- urgent obligations and next deadlines
- tax and compliance risks
- subscription and recurring-cost pressure
- recommended payment or deferral actions

That is how finance fits into the multi-business system. It is a control function, not a standalone empire. Burak's delivery work and products generate revenue. The finance domain protects runway, avoids escalation, and helps decide where money should go next. It should inform business decisions every day, but it should not absorb unrelated planning, sales, or product workflows.

The research notes point in the same direction: the orchestration layer is the compounding asset, and the realistic pattern is agents as departments with human oversight, not agents as an entire autonomous company. Finance should therefore become a department with strong service boundaries.

## Notion Boundary
What should stay in Notion:

- creditor master records
- qualitative negotiation notes and timing rules
- human-editable playbooks by creditor type
- draft communications waiting for review or approval
- session summaries and operator-facing dashboards
- subscription and debt records that Burak may edit manually

What should move into the orchestrator/business layer:

- global task routing across finance, delivery, operations, and other businesses
- cross-domain prioritization of cash, deadlines, and attention
- approval gates and escalation workflows
- shared audit trail and observability
- scheduler ownership and job coordination
- policy enforcement around what the finance module may do automatically versus what requires review

What should be refactored into deterministic services:

- document ingestion from inbox and email sources
- OCR and structured field extraction
- stable entity matching and ID assignment
- due-date and urgency calculation
- idempotency and deduplication
- reminder generation and notification dispatch
- escalation state transitions
- derived finance snapshot calculations
- sync from service state back into Notion views

The main rule is simple: Notion should hold records Burak wants to read and edit. It should not be the place where critical workflow guarantees live.

## Immediate Refactor Path
1. Freeze the backend boundary.
Treat Notion as a read/write operator surface, not as the only source of truth for workflow execution. Add stable internal IDs for creditors, deadlines, and drafts so the system stops relying on name-based joins.

2. Split handoff memory from operational state.
Keep a human-readable session summary, but move workflow state into an append-only event log plus derived snapshots managed by the orchestrator. `agent-state.json` can then become a summary artifact instead of the state machine itself.

3. Turn `/check` into a typed pipeline.
Make `/check` call deterministic steps: load obligations, compute urgency, dedupe alerts, create or update tasks, sync the results to Notion, then ask the LLM only for narrative summary or negotiation advice.

4. Move scanning and extraction out of prompt logic.
PDF and email ingestion should become service jobs with retry semantics, locking, and structured outputs. The LLM can still help classify ambiguous documents, but the pipeline should not depend on unstructured agent reasoning for routine extraction.

5. Keep the LLM where it is strongest.
Use the model for creditor-specific strategy, German-language draft generation, exception handling, and concise summaries. Do not use it for deterministic bookkeeping, task dedupe, or scheduler correctness.

6. Add a supervisor boundary.
Any action that sends a message, updates a high-risk status, or changes payment priority should pass through an explicit review or approval rule. Finance needs the equivalent of a risk-control layer.

7. Expose finance to the rest of the business system through a small interface.
Do not let every other domain read raw Notion tables directly. Give the orchestrator a narrow finance contract such as "get urgent items," "get runway," "propose payment ordering," and "create draft reply."

## Recommendation
Finance should live in a hybrid model.

Not inside `pi-agent` alone, because finance has too many deterministic workflows, recovery requirements, and policy constraints to be buried inside a general conversational layer.

Not inside ClaudeCode/Codex orchestration alone, because Burak still needs a human-facing workspace for review, editing, and day-to-day operational visibility.

The right answer is: finance as a domain module under ClaudeCode/Codex orchestration, surfaced through `pi-agent`, with Notion retained as the operator UI.

If reduced to one sentence: keep finance conversational at the top, orchestrated in the middle, and deterministic at the bottom.
