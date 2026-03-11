# MCP Agent Mail

> **Asynchronous coordination layer for AI coding agents: identities, inboxes, searchable threads, and advisory file leases over FastMCP + Git + SQLite.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Frameworks |
| Repository | [Dicklesworthstone/mcp_agent_mail](https://github.com/Dicklesworthstone/mcp_agent_mail) |
| GitHub Stars | 1,780 (as of 2026-03-08) |
| Publisher | Jeffrey Emanuel (Dicklesworthstone) — solo, PE/hedge fund consulting background |
| License | NOASSERTION (described as free and open-source) |
| Tech Stack | Python 3.14, FastMCP (HTTP-only), SQLite + FTS5, Git, Uvicorn/FastAPI, uv |
| Maturity | 🟢 Production (719 commits, actively used by creator for consulting; part of 29-tool Agent Flywheel ecosystem) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *This is the standalone deep-dive for the highest-starred component (1,780 stars) of Jeffrey Emanuel's Agent Flywheel ecosystem, which is already catalogued at [Agent Flywheel](../agent-harnesses/agent-flywheel.md). The file reservation (advisory lease) pattern is the single most relevant feature — it directly solves the multi-agent edit conflict problem we've been documenting since Phase 1. The dual persistence model (Git for auditability + SQLite for speed) is exactly aligned with our Master Blueprint's deterministic infrastructure layer. The Beads integration (task graph with `bd-123` as shared thread ID) is a clean implementation of the "task-keyed session persistence" pattern we scored Paperclip for. Worth evaluating as a coordination layer for our tmux multi-agent setup.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Directly addresses our documented gap: no coordination mechanism preventing simultaneous file edits in multi-agent tmux setup. Advisory file leases, agent identity registry, and async messaging map cleanly to Master Blueprint Layer 3 (Shared Infrastructure). The dual Git+SQLite persistence model aligns with Governing Principle #2 (deterministic orchestration). |
| **Novelty** | 6/10 | File reservation pattern was already identified in our Agent Flywheel analysis. The deeper insight here is the *implementation details*: glob-pattern leases with TTL auto-expiry, optional pre-commit guard enforcement, and the macro system that bundles reserve-work-release into atomic cycles. The cross-project AgentLink handshake is new. |
| **Actionable** | 7/10 | HTTP-only MCP server means it works with Claude Code today (no Pi dependency). Install script auto-detects Claude Code. Could be running in our tmux setup within an hour. The main adaptation needed is wiring file reservation checks into our orchestrator state management. |

---

## Overview

MCP Agent Mail is "Gmail for coding agents" — a lightweight HTTP server that gives each AI coding agent a persistent identity, an inbox, threaded conversations, and advisory file reservations. It runs as a FastMCP server on localhost (default port 8765) and exposes MCP tools that agents call to register themselves, send messages, reserve files, and search conversation history.

The core insight is the **dual persistence model**: every artifact (messages, agent profiles, file reservations) is written to both a Git repository (human-auditable, version-controlled) and a SQLite database with FTS5 (fast queries, full-text search). This means a human can `git log` the entire coordination history while agents get sub-millisecond search performance. Messages are stored as YAML-frontmatter Markdown files under `messages/YYYY/MM/`, making them readable in any editor or GitHub UI.

The system is deliberately **advisory, not enforced** — file reservations signal intent but don't hard-lock files. An optional pre-commit hook can block commits that violate active reservations (when `AGENT_NAME` env var is set), but the default is trust-based coordination. This matches our Master Blueprint's philosophy: deterministic infrastructure providing guardrails, not gatekeeping.

---

## Technical Architecture

### Dual Persistence Model

```
┌──────────────────────────────────────────────────────────┐
│                  MCP Agent Mail Server                    │
│              (FastMCP HTTP-only, port 8765)               │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  Identity   │  │  Messaging │  │  File Reservations │  │
│  │  Registry   │  │  & Threads │  │  (Advisory Leases) │  │
│  │            │  │            │  │                    │  │
│  │ register   │  │ send_msg   │  │ reserve_paths      │  │
│  │ get_agents │  │ fetch_inbox│  │ release_paths      │  │
│  │            │  │ ack_msg    │  │ conflict_detect    │  │
│  └─────┬──────┘  └─────┬──────┘  └────────┬───────────┘  │
│        │               │                  │              │
│  ┌─────▼───────────────▼──────────────────▼───────────┐  │
│  │              Dual Write Layer                       │  │
│  │                                                     │  │
│  │  Git Repository          SQLite + FTS5              │  │
│  │  (human-auditable)       (fast queries)             │  │
│  │                                                     │  │
│  │  agents/profile.json     Full-text search index     │  │
│  │  agents/mailboxes/       Directory/LDAP queries     │  │
│  │  messages/YYYY/MM/       Reservation tracking       │  │
│  │  file_reservations/                                 │  │
│  │  attachments/                                       │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### File Reservation Data Model

```json
{
  "agent_name": "GreenCastle",
  "paths": ["src/api/**", "src/models/user.ts"],
  "ttl_seconds": 3600,
  "exclusive": true,
  "reason": "bd-123",
  "created_at": "2026-03-08T12:00:00Z",
  "expires_at": "2026-03-08T13:00:00Z"
}
```

- **Glob patterns**: `src/**`, `frontend/**/*.tsx` — not file-level, pattern-level
- **TTL auto-expiry**: No manual cleanup; leases self-destruct
- **Exclusive flag**: `true` = no other agent can reserve overlapping patterns; `false` = concurrent reads allowed
- **Reason field**: Maps to task/issue ID (e.g., `bd-123` from Beads)
- **Conflict response**: `FILE_RESERVATION_CONFLICT` error with overlap details

### Git Repository Structure

```
agents/
  profile.json                    # Agent registry (name, model, last activity)
  mailboxes/{agent}/
    inbox/                        # Unacknowledged messages
    outbox/                       # Sent messages
messages/
  YYYY/MM/
    {id}.md                       # YAML frontmatter + GFM body
file_reservations/
  {sha1}.json                     # Active lease declarations
attachments/
  xx/{sha1}.webp                  # Content-addressed images
```

### MCP Tools Exposed

**Granular tools:**
- `ensure_project(project_key)` — initialize project (project_key = absolute path)
- `register_agent(project_key, agent_name)` — get memorable identity (e.g., "GreenCastle")
- `get_agents(project_key)` — directory listing with last activity timestamps
- `send_message(project_key, from_agent, to_recipients[], thread_id, subject, body, importance, ack_required, attachments[])` — GFM body, To/Cc/Bcc, importance levels, optional ack
- `fetch_inbox(project_key, agent_name, limit=20)` — unacknowledged messages
- `acknowledge_message(project_key, agent_name, message_id)` — mark read
- `file_reservation_paths(project_key, agent_name, paths[], ttl_seconds, exclusive, reason)` — advisory lease
- `release_file_reservations(project_key, agent_name, paths=[])` — explicit release
- `search_threads(project_key, query, limit)` — FTS5/BM25 search
- `request_contact(from_agent, to_agent, ...)` / `respond_contact(...)` — cross-project linking

**Macros (bundled flows):**
- `macro_start_session(...)` — register + announce arrival
- `macro_prepare_thread(...)` — setup conversation context
- `macro_file_reservation_cycle(...)` — reserve → work → release as atomic unit
- `macro_contact_handshake(...)` — cross-project agent linking

**Resources:**
- `resource://inbox/{Agent}?project=<path>&limit=20`
- `resource://thread/{id}?project=<path>&include_bodies=true`

### Web UI

- `/mail` — unified inbox across projects, project directory
- `/mail/{project}` — FTS search, agent panel, file reservations view
- `/mail/{project}/inbox/{agent}` — reverse-chronological inbox
- `/mail/{project}/message/{id}` — full message with thread context
- Search: `subject:foo`, `body:"multi word"`, BM25 scoring via FTS5

---

## Publisher Background

**Jeffrey Emanuel** (GitHub: Dicklesworthstone) is a solo developer from a quantitative finance / PE / hedge fund consulting background. He built the entire 29-tool Agent Flywheel ecosystem for his own consulting practice, claiming 20,000+ lines of production Go code shipped in a single day using this infrastructure. MCP Agent Mail is his most successful individual tool by star count (1,780). His broader ecosystem includes NTM (tmux orchestrator, 175 stars), CASS (session search, 307 stars), BV/Beads Viewer (task graph, 891 stars), CM (memory system, 152 stars), and DCG (command guard, 89 stars). No VC funding — this is practitioner-built tooling from actual revenue needs, directly paralleling our own origin story with the L-Thread Orchestrator. Credibility is high: sustained commit velocity (719 commits), tools used in production, and growing community adoption.

---

## What's Valuable for Us

1. **Advisory File Leases with Glob Patterns and TTL Auto-Expiry** — This is the single most immediately useful pattern. Our tmux multi-agent setup currently has zero coordination to prevent two agents editing the same file simultaneously. Agent Mail's approach — glob-pattern reservations with self-expiring TTLs and optional pre-commit guard enforcement — is lightweight enough to adopt without architectural disruption. The `macro_file_reservation_cycle` (reserve → work → release) is directly mappable to our agent spawn → work → PR lifecycle.

2. **Dual Persistence (Git + SQLite)** — Writing every coordination artifact to both Git (human-auditable) and SQLite (fast queries) is a pattern worth stealing. It satisfies Governing Principle #2 (deterministic infrastructure) while providing the audit trail we need for gov/DSGVO work. Our current `orchestrator-state.json` is single-file JSON — this dual approach scales better.

3. **Task-Keyed Threading via Beads Integration** — Using the task/issue ID (`bd-123`) as both the Mail `thread_id` and the Beads issue key creates a single identifier that links task definition, agent messaging, and file reservations. Our orchestrator-state.json already tracks tasks; adding this correlation would unify our coordination artifacts.

4. **Agent Identity Registry** — The auto-generated memorable names (GreenCastle, SwiftRaven) with activity timestamps and model metadata is a simple but effective pattern for multi-agent observability. Currently our tmux agents are tracked by pane ID — named identities would improve debugging significantly.

5. **Pre-Commit Guard** — The optional pre-commit hook that blocks commits violating active file reservations (when `AGENT_NAME` is set) is a clean, non-intrusive enforcement mechanism. It can be enabled per-agent without global impact — exactly the kind of graduated enforcement our gov work needs.

6. **Macro System for Common Patterns** — The bundled macros (`macro_start_session`, `macro_file_reservation_cycle`) reduce multi-step coordination to single tool calls, which matters for token efficiency. Each macro eliminates 3-5 individual tool calls.

---

## What's NOT Relevant

1. **Cross-Project Agent Linking (AgentLink)** — The `request_contact`/`respond_contact` handshake for cross-project messaging is over-engineered for our use case. Our federated architecture (Governing Principle #6) explicitly keeps business lines isolated. Cross-project agent communication is an anti-pattern for us, especially with DSGVO constraints.

2. **Web UI** — The `/mail` web interface is a nice demo but irrelevant for our headless tmux-based workflow. We already have Notion as our human-facing dashboard (Master Blueprint Layer 1). Adding another UI creates context fragmentation, not value.

3. **Related Projects Discovery (AI-powered)** — The LLM-based sibling repository suggestion system (`LLM_ENABLED=true`) adds infrastructure complexity and LLM calls for a problem we don't have. Our business lines are manually defined and don't need auto-discovery.

4. **Beads/BV Integration (as a package)** — While the *pattern* of task-keyed threading is valuable (see "What's Valuable" #3), actually adopting Beads Rust + Beads Viewer as our task system conflicts with Governing Principle #7 ("build only what you have needed"). Our existing task tracking in orchestrator-state.json and Notion covers current needs.

5. **HTTP-Only FastMCP Requirement** — Agent Mail runs as a persistent HTTP server, adding a daemon to manage. Our current system is zero-daemon (tmux + filesystem + state files). Adding a server process increases operational complexity and creates a single point of failure. For file reservations alone, a simpler file-based approach (like pi-messenger's filesystem IPC) might suffice.

6. **Python 3.14 Dependency** — Bleeding-edge Python version requirement adds installation friction. Most systems ship 3.11-3.12; requiring 3.14 via `uv` is a non-trivial dependency for a coordination layer that could be implemented with simpler primitives.

---

## Future Use Cases

- **Phase 2 (Days 4-60):** **Adopt the file reservation pattern** — not necessarily Agent Mail itself, but implement advisory file leases (glob patterns + TTL + optional pre-commit guard) in our tmux orchestrator. This could be a lightweight JSON-in-git implementation inspired by Agent Mail's data model without requiring the full server. Alternatively, install Agent Mail as-is if the HTTP daemon tradeoff is acceptable.

- **Phase 2 (Days 4-60):** **Evaluate as coordination layer for 3+ agent scenarios** — When running 3 parallel coding agents on the same repo, Agent Mail's messaging + file reservation combo becomes more valuable than ad-hoc coordination via orchestrator-state.json. Trial it on a non-gov project first.

- **Phase 3 (Days 60-90):** **Agent identity and thread search** — As our agent session count grows, the FTS5-powered search across threaded conversations becomes useful for debugging and knowledge extraction. The Git-backed message history becomes an audit artifact.

- **Phase 4 (Days 90+):** **Full coordination layer** — If scaling to 6+ parallel agents (per Emanuel's claimed setup), the full Agent Mail stack (identity, messaging, file leases, thread search, macros) becomes justified. At this scale, the HTTP daemon overhead is amortized across many agents.

---

## Key Takeaway

> **MCP Agent Mail's advisory file lease pattern (glob-pattern reservations with TTL auto-expiry, optional pre-commit enforcement, and Git-auditable history) directly solves our documented multi-agent edit conflict gap — adopt the pattern immediately, evaluate the full server for Phase 2+ scaling.**
