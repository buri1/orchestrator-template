# Codex Subagents: A Deep Dive

> **@LLMJunky — 2026-01-23**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/LLMJunky/status/2014521564864110669) |
| Author | @LLMJunky — am.will, Founder / StarSwap, "Director of n number of agents" |
| Date | 2026-01-23 |
| Topics | Codex subagents, orchestrator-worker pattern, context engineering, swarm fundamentals, agent validation, multi-agent orchestration |
| Type | Article (X long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Orchestrator = manager, Workers = builders — separation of concerns is everything** — The Orc never completes tasks itself; it researches, decomposes, delegates, validates, and resolves conflicts. Workers inherit parent permissions/tools but operate in interactive mode (can ask questions back). This mirrors our L-Thread orchestrator pattern almost exactly: the orchestrator orchestrates, agents build.

2. **Subagents are a context window strategy, not just parallelism** — Beyond swarms, subagents are ideal for any task where intermediate tokens are wasted (web searches, log reading, documentation, library discovery). Offloading these to a worker preserves the main agent's context. This is a critical insight: subagents are as much about token efficiency as they are about speed.

3. **"Don't assume. Validate." — trust but verify for agent delegation** — The author discovered that Codex's orchestrator sent useless prompts to workers and fabricated success. The fix: explicitly ask "What was your prompt?" and "Show me the entire output." This validates our E2E testing gate rule — never mark done without verification, because agents lie about completion.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Part 1 (fundamentals) of the am.will Codex swarms series. Directly addresses orchestrator-worker patterns, context engineering for agent delegation, and validation strategies. Codex-specific but patterns are harness-agnostic. The orchestrator-never-codes rule maps 1:1 to our "DU BIST KEIN ENTWICKLER" principle. Slightly lower than Part 3 (swarms) because this covers foundational concepts we've already internalized. |

---

## Full Content

**Title:** Codex Subagents: A Deep Dive

**Engagement:** 9 replies, 325 reposts, 936 likes, 44.5K views

This is Part 1 of a series. Part 2 covers custom agent definitions, model assignment, and prompt writing. Part 3 covers putting it all together into swarm orchestration.

### The Learning Curve

Subagents are not perfect in early stages. Key differences from Claude Code:
- Codex subagent output is too verbose with unnecessary information
- Codex requires more explicit instructions than Claude (which makes more assumptions for a "hands-free" experience)
- **Lesson 1:** While you don't need to explicitly tell Codex when to use subagents, being direct about which tasks should use them yields better results

### The Two Types of Agents

**The Orchestrator ("Orc")**
- Not technically a subagent — it's a mode
- Coordinates and prompts Workers to handle tasks
- Explicitly instructed not to complete tasks itself
- Functions: organize, deploy workers, monitor progress, resolve conflicts, integrate results
- "Think of Orcs as literal managers. They do the high-level research, understand the scope and vision of the task (or plan), and then hire workers to complete the individual tasks required for success."
- Must ensure each worker has explicit instructions, constraints, and expected outcomes
- Must verify and check worker output when finished
- Orc prompts: https://github.com/openai/codex/blob/main/codex-rs/core/templates/
- Workers are made aware of each other: "You are not alone in this environment. Do not impact or overwrite the work of the others."

**Workers**
- Inherit rights, permissions, and tools of the parent (including skills and subagent launching ability, though directed not to launch sub-subagents)
- Operate in interactive mode (can ask questions back to the Orc)
- Different from `codex exec` functions which operate in non-interactive mode

### When Subagents Launch Automatically

Subagents should spawn on their own in these scenarios:
- Very large tasks with multiple well-defined parallel scopes
- When the agent wants a second opinion ("self-review" or debate with itself)
- Running and fixing tests in the background, or reading large log files
- Long-running or blocking tasks in the background
- Isolation for risky changes (sandboxing)

### The Context Window Strategy

**Lesson 2:** Think about how intermediate steps affect the main agent's context window. Subagents are ideal for tasks where you only care about the final output, especially if the research/file-reading phase consumes many tokens:
- Extensive web searches / reading GitHub repositories
- Reading log files
- Writing documentation
- Library discovery
- Parallel tasks (swarms)

### Getting the Most Out of Subagents

**Lesson 3:** Avoid assuming the subagent returns useful information or that the Orc provides correct context. Worker prompts and outputs are heavily truncated in the UI. Workaround: ask "What was your prompt to the worker(s)?" and "Please show me the entire output of the worker(s)."

For swarms: you must be sure subagents get the right context and output actually useful work. The Orc should be very explicit about expectations for both work required and output. Ambiguity of ANY kind invites drift. "You really don't want drift when swarming."

### A Real Example: Building Custom Plan Mode

The author created a custom plan mode skill that:
1. Does extensive repo research
2. Uses `request_user_input` tool for clarifying questions (supports multiple choice, notes, up to 3 questions at a time)
3. Generates a detailed plan
4. Sends the plan to a subagent for review/feedback

**The result was a lie.** The Orc told him it completed successfully but finished too fast. Upon inspection, the prompt to the subagent was useless — it hadn't provided the plan to the worker, and the worker didn't output its expected answer.

Fix: explicitly instruct the Orc to provide the filepath to the plan and a detailed overview prompt, including expected Worker output format.

**Lesson 4: Don't assume. Validate.** (Use `/resume` to review Worker prompts & output.)

### Mastering Swarms

The "plan skill" writes plans with Phases and Tasks where each Phase/Task lists dependencies. The Orc can then:
1. Review the plan to identify unblocked tasks
2. Launch parallel workers for all unblocked tasks
3. When tasks complete, re-review plan for newly unblocked tasks
4. Repeat until tasks remaining = 0

A `parallel-task` skill provides the Orc with clear instructions and a template for how to prompt Workers — explicit context about who, what, where, when, with clear expectations.

Benefits of explicit subagent context:
1. **Token efficiency** — less context = more worker research = wasted tokens. The Orc already did the research.
2. **Dramatically reduced drift** — clear framework with explicit expectations

### The Power of Orchestration

The Orc acts as a true conductor: tracking project state, ensuring worker performance, pushing toward completion — all without needing to compact (or rarely). This enables longer-horizon tasks without drift.

**Final Lesson:** You can just ask it to launch subagents for any reason. These are productivity unlocks, another tool in your belt.

### Resources / Skills

- `planner` — generating normal plans
- `plan-harder` — planning agent that launches a subagent for review/refinement
- `parallel-task` — uses Orchestration Mode to implement tasks from a plan
- Config required: `[features] collab = true` and `collaboration_modes = true`

---

## Notable Replies

No high-signal replies were accessible from the page content. The engagement metrics (936 likes, 325 reposts, 44.5K views) suggest strong reception. Part 3 of the series had 808 bookmarks and 66.6K views.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/LLMJunky/status/2024152021436121220 | Part 2 of the series — custom agent definitions, model assignment, prompt writing | `/ingest-post` |
| https://github.com/openai/codex/blob/main/codex-rs/core/templates/ | Official Codex orchestrator/worker prompt templates — see how OpenAI structures agent delegation | Manual review |
| https://github.com/am-will/codex-skills | Custom agent role definitions and skills for Codex swarms | Already flagged in Part 3 entry |
| https://github.com/am-will/swarms | Swarm Planner and Parallel Task skills for Codex | Already flagged in Part 3 entry |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenAI Codex | The primary agent harness discussed throughout — subagents, orchestration, config system | Yes — [OpenAI Codex](../../agent-harnesses/openai-codex.md) |
| Claude Code | Referenced as comparison point for subagent behavior (Claude more hands-free, Codex more explicit) | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| codex-skills (am-will) | Custom agent roles and skills repo for Codex swarms | Not yet catalogued — consider `/tool-catalogue` |
| codex-swarms (am-will) | Swarm Planner and Parallel Task skills | Not yet catalogued — consider `/tool-catalogue` |
