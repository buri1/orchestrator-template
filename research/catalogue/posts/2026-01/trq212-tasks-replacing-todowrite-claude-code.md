# We're Turning Todos into Tasks in Claude Code

> **@trq212 — 2026-01-22**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/trq212/status/2014480496013803643) |
| Author | @trq212 — Thariq, Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-01-22 |
| Topics | Task Tool, TodoWrite deprecation, multi-agent coordination, inter-session persistence, Claude Code internals |
| Type | Article (X long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Task Tool replaces TodoWrite as models get smarter** — TodoWrite was a scaffolding tool that kept earlier models on track with structured checklists and periodic reminders. As models improved (particularly Opus 4.5+), the rigid todo structure became a constraint rather than a help — models stuck to the list even when the plan needed to change. Tasks are the evolutionary replacement: a higher-level primitive designed for inter-agent communication, dependency tracking, and shared state across subagents.

2. **Tasks enable multi-session and multi-agent collaboration** — Unlike Todos (which were single-session, single-agent checklists), Tasks can be shared across multiple sessions and multiple agents. They support dependencies between tasks, allow agents to alter or delete them dynamically, and provide shared updates visible to all participating subagents. This is the coordination primitive that makes Claude Code's Agent Teams pattern work.

3. **Tool evolution must track model capability** — The broader lesson: tools that help weaker models may actively constrain stronger ones. The transition from TodoWrite to Task Tool is a concrete example of Anthropic's "see like an agent" philosophy — observe what the model actually does with the tool, and redesign when the model outgrows it.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly from the Claude Code engineer who built both TodoWrite and its replacement. The Task Tool is a core primitive for multi-agent orchestration in Claude Code — understanding its design rationale informs our own orchestrator's agent coordination patterns. The TodoWrite-to-Task evolution validates the principle that agent tooling must evolve with model capabilities. Also relevant: Tasks as inter-session persistence mechanism aligns with our state management approach. |

---

## Full Content

**Title:** We're turning Todos into Tasks in Claude Code

**Engagement:** 324 replies, 438 reposts, 5,914 likes

The article announces the upgrade from Todos to Tasks in Claude Code. Key points from the available preview and cross-referenced context:

### The Problem with TodoWrite

TodoWrite was a structured checklist tool introduced to keep Claude on track during complex tasks. It worked by:
- Maintaining an ordered list of todo items with status tracking
- Providing system reminders every 5 turns to re-anchor the model
- Giving the model a structured way to plan and track progress

However, as models improved:
- The rigid checklist format made models stick to the plan even when the problem evolved
- System reminders reinforced the list rather than encouraging adaptive behavior
- Opus 4.5 got better at spawning subagents but couldn't coordinate shared Todo lists across them
- The tool was fundamentally single-agent, single-session

### Tasks: The Replacement

Tasks are a new primitive that addresses these limitations:
- **Inter-agent communication**: Tasks can be shared and updated across multiple subagents
- **Dependency tracking**: Tasks support dependencies, allowing complex project decomposition
- **Multi-session persistence**: Tasks persist across sessions, enabling long-running projects
- **Dynamic modification**: Models can alter, delete, and reorganize tasks — they're not locked into a rigid list
- **Shared updates**: All participating agents see task state changes

### Design Philosophy

The transition embodies Thariq's "see like an agent" design philosophy (elaborated in his [later article from 2026-02-27](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md)):
- Tools must be shaped to the model's abilities, not the developer's mental model
- What works for one model generation may constrain the next
- The bar to add new tools is high (~20 tools total); prefer evolving existing tools
- Progressive disclosure over system prompt bloat

---

## Notable Replies

*Note: X/Twitter content was not fully accessible via automated fetch. Replies could not be scraped. Given the high engagement (324 replies, 5.9K likes), this post likely generated significant discussion about the TodoWrite-to-Task transition. Manual review recommended.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/trq212/status/2027463795355095314 | Thariq's follow-up "Seeing like an Agent" article (already catalogued) — provides the full philosophical context for the Task Tool design | Already ingested: [trq212-lessons-building-claude-code-seeing-like-agent](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | The agent harness being upgraded | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md), [Claude Code Multi-Agent Architecture](../../reference/claude-code-multiagent-architecture.md) |
| Task Tool | The new primitive replacing TodoWrite — inter-agent communication with dependencies and multi-session persistence | Mentioned in [OpenCode](../../agent-harnesses/opencode.md) (TaskTool concept), internal Claude Code feature |
| TodoWrite | The deprecated checklist tool being replaced | Referenced in multiple catalogue entries; internal Claude Code feature |
| Agent Teams | The multi-agent pattern that Tasks enable | Yes — covered in [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
