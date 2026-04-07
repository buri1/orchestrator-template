# Codex Multi Agent Playbook: Swarms Lvl. 1

> **@LLMJunky — 2026-02-26**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/LLMJunky/status/2027032974202421336) |
| Author | @LLMJunky — am.will, Founder / StarSwap, "Director of n number of agents" |
| Date | 2026-02-26 |
| Topics | multi-agent orchestration, OpenAI Codex, swarm patterns, context engineering, subagent prompting, dependency-driven parallelism |
| Type | Article (X long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Planning quality multiplies across agents** — Ambiguity in a single-agent session is annoying; ambiguity across a swarm of parallel agents is catastrophic. The author emphasizes spending the majority of time on a detailed spec with dependency maps (`depends_on: [T1, T2]`) before spawning any agents. This validates our plan-first approach and the importance of deterministic task decomposition.

2. **Two swarm strategies: Waves vs Super Swarms** — "Swarm Waves" launch one subagent per unblocked task respecting the dependency graph (accuracy-first), while "Super Swarms" launch all agents simultaneously regardless of dependencies (speed-first, with conflict resolution on the tail end). The tradeoff is accuracy vs speed, with the orchestrator handling conflict resolution in both modes.

3. **Front-loading subagent context is the key to quality** — The "secret sauce" is a structured prompt template that provides every subagent with full context (plan reference, goals, dependencies, related tasks, constraints, file paths, acceptance criteria, validation steps) upfront. This reduces tool calls, prevents drift, and is especially critical for smaller/faster models like Spark that have limited context windows (128K). This is essentially context engineering applied to agent-to-agent communication.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses multi-agent orchestration patterns (our core domain). The Swarm Waves pattern mirrors our wave-based agent spawning. The subagent prompt template is a concrete implementation of context engineering for agent delegation. The Plan.md-as-contract pattern validates our spec-driven approach. Although Codex-specific, the patterns are harness-agnostic. |

---

## Full Content

**Title:** CODEX MULTI AGENT PLAYBOOK: SWARMS LVL. 1

**Engagement:** 14 replies, 40 reposts, 370 likes, 808 bookmarks, 66.6K views

This is Part 3 of a series. Part 1 covered subagent fundamentals (orchestrators vs workers). Part 2 covered custom agent definitions, model assignment, and prompt writing. This part puts it all together into swarm orchestration.

### The Plan.md
Planning must be exceptional before launching swarms. Ambiguity multiplies across parallel agents. Key advice:
- Use a separate agent session to research tech stack decisions rather than blindly accepting defaults
- Build dependency maps into the plan (`depends_on: []` with explicit task IDs)
- "If you're running swarms, you are the architect. The agents are the builders."
- Provides a "swarm planner" skill that detects ambiguity and asks clarifying questions

### Orchestration
The orchestrator serves 6 critical functions:
1. Manage the state of plan implementation
2. Call subagents as needed
3. Provide subagents their prompt
4. Validate the subagents' work
5. Resolve conflicts
6. Ensure the project moves forward toward success

The orchestrator maintains full state in its context window: every agent's status, all file names/paths, and overall project state. Recommends NOT resetting context before implementation — use compaction only if below 40%.

### Swarm Waves (Accuracy-First)
Launches one subagent per unblocked task, in waves. If one task is unblocked, one agent launches. If eight are unblocked, eight launch. The orchestration layer loops over the plan looking for unblocked tasks, launching new agents as dependencies clear. Creates the fewest conflicts because tasks execute in dependency order.

### Super Swarms: Total Parallelism (Speed-First)
Launches as many subagents as the machine can handle simultaneously, regardless of dependencies. Skip the dependency map; explicitly guide the orchestrator to launch all agents. Codex has a base max of 6 parallel agents; increase via `max_threads` in config (example: `max_threads = 16`). Leads to more conflicts (files with unmet dependencies), but the orchestrator is "quite adept at identifying these conflicts in real time" and resolving them on the tail end. Risk of 429 errors if too many agents.

### The Secret Sauce: Context Engineering
The key to quality outcomes is front-loading subagent context. Rather than letting agents explore and discover context (expensive, ambiguous), provide a structured prompt template:

```
You are implementing a specific task from a development plan.

## Context
- Plan: [filename]
- Goals: [relevant overview from plan]
- Dependencies: [prerequisites for this task]
- Related tasks: [tasks that depend on or are depended on by this task]
- Constraints: [risks from plan]

## Your Task
**Task [ID]: [Name]**
Location: [File paths]
Description: [Full description]
Acceptance Criteria: [List from plan]
Validation: [Unit Tests or verification from plan]

## Instructions
1. Examine working plan and any relevant or dependent files
2. Implement changes for all acceptance criteria
3. Keep work atomic and committable
4. For each file: read first, edit carefully, preserve formatting
5. Run validation if feasible
6. Mark completed tasks in the plan file immediately
7. Commit your work (only stage your files, NEVER PUSH)
8. Double check plan update and commit
9. Return summary of files modified, changes, criteria satisfaction, validation
```

This template eliminates guessing and reduces tool calls in the exploration phase. Especially crucial for small/fast models like Spark (128K context). Spark excels at singular, well-defined tasks but struggles with long context and back-and-forth.

### Model & Reasoning Configuration
- Use larger models for orchestration (hard rule)
- Pro subs: Plan with GPT 5.2 High or 5.3-Codex High, Orchestrate with 5.3-Codex High, Subagents with Spark xHigh or 5.3-Codex High
- Plus/Business: Plan with 5.2/5.3-Codex High, Orchestrate with 5.3-Codex Medium, Subagents with 5.3-Codex Medium

Example config.toml:
```toml
model = "gpt-5.3-codex"
plan_mode_reasoning_effort = "xhigh"
model_reasoning_effort = "high"

[features]
collaboration_modes = true
multi_agent = true

[agents]
max_threads = 16

[agents.sparky]
config_file = "agents/sparky.toml"
description = "Use for executing implementation tasks from a structured plan."
```

### Demo: Kanban Built With Spark Swarms
Built a personal task manager (ClickUp clone) using Codex 5.3 High for planning/orchestration and Codex 5.3 Spark High for implementation across a 7-phase plan. Demonstrated real-time steering, including mid-run pivot to write tests BEFORE calling subagents (Test-First Driven Development). Both the human and Codex adapted on the fly.

### Resources
- Custom Agent Roles & Skills: https://github.com/am-will/codex-skills
- Swarm Planner & Parallel Task skills: https://github.com/am-will/swarms

---

## Notable Replies

The replies were largely appreciative with no high-signal technical contributions. The most notable exchange:

> **@adrianspeaking (Adrian Lu)**: "Reading through this now! Just heads up that the custom agents link to GitHub is broken."
> *Bug report on the GitHub link — author fixed it promptly. Shows the community is actively trying the approach.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/LLMJunky/status/2014521564864110669 | Part 1 of the series — subagent fundamentals, orchestrators vs workers | **DONE** — [Codex Subagents: A Deep Dive](../2026-01/llmjunky-codex-subagents-deep-dive.md) |
| https://x.com/LLMJunky/status/2024152021436121220 | Part 2 of the series — custom agent definitions, model assignment, prompt writing | `/ingest-post` |
| https://github.com/am-will/codex-skills | Custom agent role definitions and skills for Codex swarms | `/tool-catalogue` |
| https://github.com/am-will/swarms | Swarm Planner and Parallel Task skills for Codex | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenAI Codex | The primary agent harness discussed throughout — subagents, orchestration, config system | Yes — [OpenAI Codex](../agent-harnesses/openai-codex.md) |
| GPT 5.3-Codex | Model used for orchestration and subagents; reasoning levels (xHigh/High/Medium) | No — model, not tool |
| Spark (GPT) | Small/fast model used for subagent workers; 128K context window | No — model, not tool |
| codex-skills (am-will) | Custom agent roles and skills repo for Codex swarms | Not yet catalogued — consider `/tool-catalogue` |
| codex-swarms (am-will) | Swarm Planner and Parallel Task skills | Not yet catalogued — consider `/tool-catalogue` |
| DSPy | Mentioned briefly as "automatic prompt optimisation by using code" | Yes — [DSPy](../agent-harnesses/dspy.md) |
