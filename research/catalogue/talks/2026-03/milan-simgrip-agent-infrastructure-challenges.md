# Lightning Talk: Agent Infrastructure Challenges

> **Milan Williams (Semgrep) — Coding Agents: AI Driven Dev Conference 2026**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (05:00:32 - 05:06:51) |
| Speaker | Milan Williams, Product Manager at Semgrep |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~6 min (lightning talk) |
| Date | 2026-03 |
| Topics | agent security, permissions scoping, audit logging, code scanning, hooks, blast radius |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.)*

---

## Key Takeaways

1. **Minimally scoped permissions are non-negotiable** — Don't give agents your personal token or admin-level access. Create downscoped tokens limited to exactly what the agent needs. Every major SCM and cloud provider supports this. If an agent gets confused or hijacked, the blast radius stays limited to what you scoped.

2. **Wire up an audit trail using hooks** — Most agents support deterministic hooks that run after every action. A 4-line hook that logs every shell command with a timestamp is enough to answer "what happened?" in a postmortem. Claude Code gets a specific shout-out for good out-of-the-box session logging. For teams, distribute hooks via MDM so every developer has them automatically.

3. **Scan agent-generated code before it ships** — Manual code review doesn't scale with long-running autonomous sessions generating thousands of lines. Use deterministic security scanning (linters, SAST tools) that runs automatically on every generated line, regardless of which agent the developer uses.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly addresses agent security hygiene — maps to our `agent-security-models.md` reference and the seven-layer security architecture. The "hooks as audit trail" pattern validates our deterministic harness approach. |
| **Actionable** | 6/10 | Three concrete tips that are immediately implementable. We already have most of this thinking in our security reference doc, but the hooks-based audit logging pattern is a good reminder to actually wire up `_bmad/orchestrator-audit.jsonl`. Semgrep MCP server is worth evaluating as a quality gate. |

---

## Summary

Milan Williams, a product manager at Semgrep, delivered a lightning talk on the security challenges introduced by coding agents. The core observation: agents now generate hundreds of thousands of lines of code in long autonomous sessions while running shell commands, touching file systems, and operating with elevated credentials — yet most developers spend only 5-10 minutes configuring agent access and never revisit it.

The talk offers three practical tips implementable "this afternoon": (1) downscope access tokens to the minimum the agent needs, treating agents like interns who shouldn't get production access on day one; (2) set up audit logging via hooks — even a 4-line script logging shell commands with timestamps is sufficient for postmortems; and (3) scan generated code with deterministic security tools before shipping, since manual review can't keep pace with autonomous generation.

Williams specifically promotes Semgrep's MCP server, which integrates with Cursor, Claude Code, and Windsurf to provide agent-agnostic security scanning that runs automatically on every line of generated code. The tool is free and provides a deterministic security layer regardless of which coding agent a team uses.

---

## Notable Quotes

> "If you go viral on Twitter, it's for what you built and not for getting hacked." — 05:02:35

> "Most of us wouldn't hand a new intern all of our production systems on day one. And my view is that we should provide the same guardrails to agents." — 05:02:54

> "In every postmortem I've been in, the first question is always the same — what happened? And if you don't have a record, it is very, very difficult to figure out what the agent did." — 05:03:40

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Semgrep MCP server docs (semgrep.dev) | Agent-agnostic security scanning via MCP; integrates with Claude Code, Cursor, Windsurf | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Semgrep | Speaker's company; MCP server for agent-agnostic code scanning | Mentioned in passing in AGENTS.md and observability docs, but no dedicated entry |
| Claude Code | Praised for good out-of-the-box session logging | Yes — [claude-code-multiagent-architecture](../reference/claude-code-multiagent-architecture.md) |
| Cursor | Listed as integration target for Semgrep MCP | Yes — [cursor](../developer-gui/cursor.md) |
| Windsurf | Listed as integration target for Semgrep MCP | No dedicated entry |
| GitHub (fine-grained tokens) | Shown on screen for downscoped permissions | N/A |

---

## Action Items

- [ ] Evaluate Semgrep MCP server as a quality gate for agent-generated code (`/tool-catalogue`)
- [ ] Verify our hooks-based audit logging is actually wired up (check `_bmad/orchestrator-audit.jsonl`)
- [ ] Review agent token scoping — ensure spawned agents use downscoped credentials, not personal tokens
