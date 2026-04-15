# agentOS — Portable Operating System for AI Agents (WASM, V8, ~6ms Coldstarts)

> **@rivet_dev (Rivet) — 2026-04-02**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/rivet_dev/status/2039015678959853678) |
| Author | @rivet_dev — Rivet |
| Date | 2026-04-02 |
| Topics | agent infrastructure, WASM, V8, sandboxing, agent runtime, S3, SQLite, cold starts, agent OS |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Agent OS abstraction layer** — agentOS provides a portable operating system for AI agents built on WASM and V8, with ~6ms cold starts and S3/SQLite as the filesystem. This is a radical departure from the "tmux + CLI" approach — it treats agents as lightweight processes that need their own OS primitives.

2. **32x cheaper than traditional sandboxes** — The cost claim is significant. Traditional agent sandboxes (Docker, VMs) are expensive and slow to start. WASM-based isolation at 32x cost reduction could change the economics of running many parallel agents.

3. **Broad agent framework support** — Explicitly supports Pi, Claude Code, Codex, Amp, and OpenCode, suggesting this aims to be a universal runtime layer beneath any coding agent.

4. **Open-source** — Available as open-source, making it evaluable and adaptable.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly relevant to our agent infrastructure. We currently use tmux windows as agent isolation (each worker gets its own tmux window). agentOS represents an alternative isolation model with dramatically better cold starts (~6ms vs seconds for tmux + claude startup) and cost efficiency. The S3/SQLite filesystem abstraction could solve our git worktree contention issues. Supports Claude Code natively. Strongly aligns with Master Blueprint principles 1 (orchestration layer as compounding asset — the runtime layer is part of this), 4 (coordination overhead — lighter isolation reduces overhead), and 6 (federated systems — each agent gets its own OS environment). |

---

## Full Content

Introducing agentOS — a portable OS for AI agents.

Built on WASM and V8 with ~6ms cold starts. 32x cheaper than traditional sandboxes. Uses S3/SQLite as the filesystem.

Supports Pi, Claude Code, Codex, Amp, and OpenCode.

Open source.

---

## Notable Replies

[Replies not accessible via fetch — post had 57 replies, 100 reposts, 1,061 likes, 235K views at time of ingestion. High engagement suggests strong interest from the agent infrastructure community.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| (Rivet agentOS GitHub repo) | Open-source agent runtime with WASM isolation — direct alternative to our tmux-based agent isolation; needs thorough evaluation | Tool catalogue entry |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| agentOS (Rivet) | Portable agent OS with WASM/V8, 6ms cold starts, 32x cheaper sandboxes | No |
| Pi | Listed as supported agent framework | No |
| Claude Code | Listed as supported agent framework | Yes (multiple entries) |
| Codex (OpenAI) | Listed as supported agent framework | Yes |
| Amp | Listed as supported agent framework | No |
| OpenCode | Listed as supported agent framework | Yes — [opencode](../agent-harnesses/opencode.md) |
| WASM | Runtime technology for agent isolation | No |
| V8 | JavaScript engine used in agentOS | No |
