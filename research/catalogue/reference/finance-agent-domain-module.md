# Finance Agent as Domain Module

> **Architecture for evolving the Finance Agent from a standalone Notion-backed domain OS into a federated domain module within the multi-business meta-system, with a concrete migration path preserving production-proven logic.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-06_110029_codex-research-finance-agent-migration.md, 2026-03-06_research-finance-agent-migration.md |
| Research Phase | Phase 3 |
| Last Updated | 2026-03-08 |

---

## Summary

The Finance Agent is already a functioning domain operating system for debt management, deadline surveillance, and creditor negotiation. It has a deeply engineered persona ("Verhandlungsstratege, nicht Buchhalter"), 10 battle-tested slash commands, 7 Notion databases as its backend, a LaunchAgent scheduler running headless daily checks, and session-handoff memory via `agent-state.json`. The domain intelligence -- tone calibration per creditor type, strategic timing rules, writing style extracted from 700+ real emails -- is the primary value and must remain untouched.

The architectural problem is not that the Finance Agent is weak, but that the wrong layers own too much. Notion acts simultaneously as database, workflow store, review inbox, and dashboard. Business rules live in prose instructions the model must remember. The scheduler runs opaque prompt commands without typed workflows or durable retries. Cross-system communication is nonexistent -- the Orchestrator cannot know about approaching creditor deadlines, and the Finance Agent cannot know about incoming project payments.

The migration target is a three-layer design: Notion retained as the human workspace (Layer 1), orchestrator/business layer owning cross-domain prioritization, approval routing, and audit trails (Layer 2), and deterministic finance services handling ingestion, extraction, state transitions, and calculations with typed inputs/outputs (Layer 3). Finance becomes a control function -- one domain service stack inside the larger operating system -- not a standalone empire.

---

## Key Findings

### What Works Today (Preserve)

- **Domain-specific persona engineering (A+)**: The persona IS the product. Tone calibration per creditor type, strategic reasoning framework, escalation awareness -- all production-proven over 3+ weeks.
- **Command-as-skill architecture (A)**: 10 commands with consistent structure (Vorab-Checkliste, Ablauf, Fehlerbehandlung). `/check` runs headless daily, `/scan` handles PDF extraction, `/draft` produces Burak's writing style, `/triage` uses weighted scoring.
- **Notion as no-code backend (A)**: 7 interconnected databases (Glaubiger, Fristen, E-Mail Entwurfe, Posteingang, Finanzstatus, Abos, Private Schulden) accessed via MCP. Zero infrastructure cost.
- **Idempotency by design (A-)**: Composite key checking prevents duplicate notifications across repeated runs.
- **Headless scheduler compatibility (A-)**: LaunchAgent plist files trigger daily `/check` at 08:00 and weekly `/scan` Monday 09:00 via `claude --agent finance-agent --dangerously-skip-permissions -p "/$COMMAND"`.

### What Breaks at Scale

- **Notion overloaded**: Good as human workspace, weak as transactional backend, workflow engine, or durable event log.
- **Name-based joins**: Cross-DB lookup uses creditor name as de facto foreign key. Fragile under volume and parallelism.
- **Business rules in prose**: Idempotency, scan locking, escalation handling, notification limits exist as instructions the model must remember, not as deterministic code.
- **No cross-system communication**: Finance Agent and Orchestrator exist in complete isolation. No shared state, no unified notifications, no event bus.
- **Observability gaps**: Logs are local files. Notifications depend on environment-coupled hooks. No centralized audit trail.

### Migration Architecture (4 Steps)

**Step 1 -- Add shared state schema output** (2-3 hours): Finance Agent publishes a standardized `meta_handoff` object in `agent-state.json` after every `/check`, `/status`, and `/scan` run. Contains: timestamp, status summary, critical items as structured objects, financial snapshot, and health indicators. Zero impact on existing behavior.

**Step 2 -- Connect to shared notification layer** (3-4 hours): Critical Finance Agent alerts (ROT entries) additionally written to a new shared System Inbox Notion DB. Posteingang continues unchanged (backward compatibility). Idempotency enforced in both DBs.

**Step 3 -- Add finance metrics to portfolio dashboard** (2-3 hours): `/status` command writes aggregated KPIs (total debt, overdue amount, runway, expected income) to a shared Portfolio Metrics Notion DB. `/check` updates only health status and timestamps.

**Step 4 -- Enable cross-system queries** (4-5 hours): A dedicated `finance-snapshot.json` file serves as the Finance Agent's "public API" -- readable by the meta-system without loading full Finance Agent context. Contains: summary, next deadlines, expected income, cash position, pending actions, and health.

### Notion Boundary (What Stays vs. What Moves)

| Stay in Notion | Move to Orchestrator Layer | Refactor to Deterministic |
|----------------|---------------------------|--------------------------|
| Creditor master records | Global task routing | Document ingestion |
| Negotiation notes/playbooks | Cross-domain prioritization | OCR / structured extraction |
| Draft communications | Approval gates | Stable entity matching |
| Session summaries | Shared audit trail | Due-date / urgency calculation |
| Subscription records | Scheduler ownership | Idempotency / deduplication |
| Operator dashboards | Policy enforcement | Notification dispatch |

### DSGVO Isolation Requirement

Finance Agent context contains sensitive PII (Steuernummer, IdNr, Jobcenter contacts, account balances) in `context/burak.md`. This data must NEVER leak into other business line contexts. The federated architecture enforces this through hard isolation between domain modules.

---

## Actionable Insights

1. **Do not rewrite -- refactor boundaries.** The Finance Agent's domain logic, persona, commands, and Notion structure are production-proven. The migration adds shared interfaces alongside existing behavior, never replacing it.

2. **Start with `meta_handoff` (Step 1).** This single addition makes the Finance Agent visible to the meta-system with zero risk. Every subsequent integration builds on this structured output.

3. **Dual-write notifications, do not redirect.** Keep the existing Posteingang flow intact. Add System Inbox as a secondary write for critical items only. Rollback = remove the additional write.

4. **Finance snapshot as public API.** The `finance-snapshot.json` file pattern lets any system query "what's the current debt situation?" without invoking the Finance Agent or loading its full context.

5. **Keep the LLM where it is strongest.** Use the model for creditor-specific strategy, German-language draft generation, exception handling, and concise summaries. Move deterministic bookkeeping, task deduplication, and scheduler correctness out of prompt logic.

6. **One sentence architecture**: Keep finance conversational at the top, orchestrated in the middle, and deterministic at the bottom.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/master-blueprint.md](../reference/master-blueprint.md) | Finance Agent is one domain module within the master system blueprint |
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Token cost and scheduling economics apply to Finance Agent headless runs |
| [reference/existing-system-patterns.md](../reference/existing-system-patterns.md) | Shared architectural primitives between Finance Agent and Orchestrator |
| [reference/deterministic-llm-boundary.md](../reference/deterministic-llm-boundary.md) | Finance Agent has deterministic tasks (ingestion, dedup) currently handled by LLM |
| [reference/multi-business-control-plane.md](../reference/multi-business-control-plane.md) | Finance Agent as one spoke in the hub-and-spoke portfolio architecture |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Elvis Sun's context separation pattern directly informs Finance Agent isolation |
