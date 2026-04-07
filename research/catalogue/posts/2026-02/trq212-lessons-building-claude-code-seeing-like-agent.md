# Lessons from Building Claude Code: Seeing like an Agent

> **@trq212 — 2026-02-27**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/trq212/status/2027463795355095314) |
| Author | @trq212 — Thariq, Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-02-27 |
| Topics | agent tool design, context engineering, progressive disclosure, Claude Code internals, elicitation |
| Type | Article (X long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Design tools shaped to the model's abilities, not yours** — The core thesis: constructing an agent's action space is the hardest part. You must "see like an agent" by reading outputs, experimenting, and paying attention to what the model actually does with your tools. Tool design is art, not science.

2. **Progressive disclosure > system prompt bloat** — Instead of cramming capabilities into the system prompt or adding more tools, Claude Code uses layered discovery: skills files referencing other files, sub-agents for specialized queries (e.g., the Guide Agent for self-docs). This adds functionality without adding tools or context rot.

3. **Tools must evolve as models improve** — TodoWrite was replaced by the Task Tool because better models found Todos constraining rather than helpful. The AskUserQuestion tool went through 3 iterations (ExitPlanTool parameter, custom markdown format, dedicated tool). What works for one model generation may hamper the next — constantly revisit assumptions.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct from a Claude Code engineer. Covers tool design philosophy, progressive disclosure (skills), Task vs Todo evolution, RAG-to-Grep context shift, sub-agent patterns — all directly applicable to our orchestrator harness design. The "see like an agent" framing validates our empirical approach. |

---

## Full Content

**Title:** Lessons from Building Claude Code: Seeing like an Agent

**Engagement:** 220 replies, 1.4K reposts, 10K likes, 26K bookmarks, 3.5M views

The article covers five major sections on agent tool design lessons from building Claude Code:

### 1. Constructing the Action Space
The hardest part of building an agent harness is designing its tools. Thariq uses the analogy of solving a math problem: paper (minimum), calculator (better, requires knowledge), computer (most powerful, requires skill). You want tools shaped to the model's abilities, discovered through observation and experimentation.

### 2. Improving Elicitation — AskUserQuestion Tool
Three iterations:
- **Attempt 1:** Added question array parameter to ExitPlanTool — confused Claude (simultaneous plan + questions created conflicts)
- **Attempt 2:** Custom markdown output format for questions — Claude was inconsistent (appended extra sentences, omitted options, used different formats)
- **Attempt 3:** Dedicated AskUserQuestion tool — shows modal, blocks agent loop, prompts structured output with multiple options. Works because Claude "likes calling it" and outputs work well. Composable via Agent SDK and skills.

### 3. Tasks & Todos Evolution
- **Phase 1:** TodoWrite tool for keeping model on track + system reminders every 5 turns
- **Problem:** Reminders made Claude think it had to stick to the list. Opus 4.5 got better at subagents but couldn't coordinate on shared Todo lists.
- **Solution:** Replaced TodoWrite with Task Tool — Tasks focus on inter-agent communication (dependencies, shared updates across subagents, model can alter/delete them)
- **Lesson:** Tools that once helped may now constrain better models. Stick to a small set of models with similar capability profiles.

### 4. Designing a Search Interface
- **Phase 1:** RAG vector database for context — powerful but fragile, required indexing, and Claude was *given* context instead of *finding* it
- **Phase 2:** Grep tool — let Claude search and build its own context
- **Phase 3:** Agent Skills introduced progressive disclosure — skill files reference other files, Claude reads recursively. Common skill use: adding search capabilities (API instructions, database queries)
- **Result:** Over a year, Claude went from unable to build own context to performing nested search across several file layers

### 5. Progressive Disclosure — Guide Agent
- Claude Code has ~20 tools; bar to add new ones is high
- Problem: Claude didn't know enough about Claude Code itself
- System prompt approach rejected (context rot, users rarely ask)
- First try: Link to docs — Claude loaded too many results into context
- Solution: Built a Guide subagent with specialized doc-search instructions
- Result: Added to action space without adding a tool

### Conclusion
Tool design is art, not science. Depends on model, goal, and environment.

---

## Notable Replies

> **@andimarafioti (Andi Marafioti)**: "Very surprised to see that Claude code only has 20 tools and that they constantly try to reduce that number to keep the model from being confused"
> *Key signal — confirms the "less is more" tool philosophy. Validates our approach of minimal tool surface area.*

> **@kloss_xyz (kloss)**: "Anthropic rebuilt their tool system 3 times because their models outgrew it. The takeaway: design for how the models see, not how you see."
> *Good distillation of the core insight — tool design must track model capability evolution.*

> **@rohit4verse (Rohit)**: "Building an agent harness isn't about volume; it's about observation. You have to 'see like an agent': Watch the logs, Catch the loops, Tweak the tools."
> *Practical restatement of the core methodology.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/RLanceMartin/status/2027450018513490419 | Referenced article on programmatic tool calling in the Claude API — by LangChain's Lance Martin | `/ingest-post` or `/ingest-article` |
| https://x.com/trq212/status/2024574133011673516 | Thariq's earlier post on prompt caching and the ExitPlanTool design | Already ingested: [trq212-prompt-caching-is-everything](./trq212-prompt-caching-is-everything.md) |
| https://x.com/trq212/status/2014480496013803643 | Thariq's post on Tasks (the Task Tool that replaced TodoWrite) | Already ingested: [trq212-tasks-replacing-todowrite-claude-code](../2026-01/trq212-tasks-replacing-todowrite-claude-code.md) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | The agent harness being discussed — its tool design philosophy | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md), [Claude Code Multi-Agent Architecture](../reference/claude-code-multiagent-architecture.md) |
| AskUserQuestion Tool | Elicitation tool, 3 iterations to get right | No — internal Claude Code tool, not separately catalogueable |
| Task Tool (replaced TodoWrite) | Inter-agent communication with dependencies, shared updates | No — internal Claude Code feature |
| Agent Skills | Progressive disclosure system for context layering | Yes — [Agent Skills Systems](../reference/agent-skills-systems.md) |
| Claude Code Guide Agent | Subagent for self-documentation queries | No — internal Claude Code feature |
| ExitPlanTool | Plan mode tool, referenced re: prompt caching | No — internal Claude Code feature |
