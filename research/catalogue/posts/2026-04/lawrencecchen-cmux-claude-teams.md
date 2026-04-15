# cmux claude-teams: Teamwork Between Multiple Claude Code Agents

> **@lawrencecchen — 2026-04-02**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/lawrencecchen/status/2039284294682870052) |
| Author | @lawrencecchen — Lawrence Chen, developer & cmux contributor |
| Date | 2026-04-02 |
| Topics | cmux, multi-agent, orchestration, claude-code, shared-files, teamwork |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **cmux now supports claude-teams mode** — Multiple Claude Code agents can work together with shared file access and orchestration, turning cmux from a single-agent terminal into a multi-agent coordination layer. This is a significant evolution of the tool.
2. **Shared files as coordination primitive** — Rather than message-passing or complex protocols, the teamwork model uses shared filesystem access as the coordination mechanism. This aligns with the "deterministic orchestration, LLM execution" principle where the file system is the deterministic shared state.
3. **Massive engagement signals market demand** — 1,269 likes and 138K views on a multi-agent orchestration post indicates the practitioner community is actively seeking tooling for agent teamwork, not just single-agent workflows.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses our core problem — multi-agent orchestration via Claude Code. cmux is already in our catalogue and this feature (claude-teams) is exactly the kind of multi-agent coordination we build with our tmux orchestrator. Could inform or replace parts of our approach. |

---

## Full Content

cmux claude-teams: Teamwork between multiple Claude Code agents with shared files and orchestration.

*(Post announces the cmux claude-teams feature enabling coordinated multi-agent Claude Code workflows with shared filesystem access.)*

---

## Notable Replies

*95 replies were posted. Given the 1,269 likes and 138K views, high-signal replies likely include implementation details, comparisons with other multi-agent approaches (tmux-based, Claude Teams API), and practitioner experience reports. Worth revisiting for community feedback on shared-file coordination patterns.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| cmux claude-teams documentation | New multi-agent feature in a tool already central to our stack | `/tool-catalogue` (update existing cmux entry) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| cmux | Core tool being extended with claude-teams | Yes — [cmux](../../developer-gui/cmux.md) |
| Claude Code | Agent runtime for the teamwork feature | Yes — referenced across catalogue |
