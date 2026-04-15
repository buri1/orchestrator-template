# hermes-agent

> **The self-improving AI agent built by Nous Research -- autonomous skill creation, persistent memory, multi-platform messaging, and six terminal backends from a $5 VPS to GPU clusters.**

| Field | Value |
|-------|-------|
| Category | Agent Harnesses |
| Repository | [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) |
| GitHub Stars | 71,075 (as of 2026-04-04) |
| Publisher | Nous Research -- AI research lab, known for Hermes fine-tuned models |
| License | MIT |
| Tech Stack | Python, uv, TUI (terminal UI), Telegram/Discord/Slack/WhatsApp/Signal gateways, FTS5 (SQLite), Honcho (dialectic user modeling), MCP, cron scheduler |
| Maturity | Established |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | The closed learning loop (autonomous skill creation, self-improving skills, persistent memory, cross-session search) is exactly the kind of agent self-improvement we want. Multi-platform gateway and subagent delegation are directly relevant. |
| **Novelty** | 8/10 | The skill self-improvement loop (skills get better during use, not just at creation time) and periodic memory nudges (agent reminds itself to persist knowledge) are genuinely novel patterns not seen in other harnesses. agentskills.io open standard for portable skills is forward-thinking. |
| **Actionable** | 7/10 | The memory architecture (FTS5 session search + LLM summarization), skill creation pipeline, and subagent delegation pattern are all adoptable. Python codebase means we can study patterns but not directly import code. |

---

## Overview

Hermes Agent is Nous Research's open-source autonomous AI agent -- the successor/rebrand of OpenClaw. With 71K+ GitHub stars and 9.4K forks, it's one of the most popular agent frameworks in the ecosystem. Its defining feature is a closed learning loop: the agent autonomously creates skills from complex tasks, those skills self-improve during subsequent use, and the agent periodically nudges itself to persist important knowledge to long-term memory.

The agent is model-agnostic: it works with Nous Portal, OpenRouter (200+ models), OpenAI, Anthropic, GLM/Z.AI, Kimi/Moonshot, MiniMax, and custom endpoints. Model switching is a single CLI command (`hermes model`) with no code changes.

The multi-platform gateway is a single process that connects to Telegram, Discord, Slack, WhatsApp, Signal, and Email simultaneously, with voice memo transcription and cross-platform conversation continuity. This means you can start a conversation on Telegram, continue it on Discord, and the agent maintains context.

Six terminal backends provide deployment flexibility: local, Docker, SSH, Daytona, Singularity, and Modal. Daytona and Modal offer serverless persistence -- the agent's environment hibernates when idle and wakes on demand. This makes it practical to run agents that cost nearly nothing between sessions.

The agent can spawn isolated subagents for parallel workstreams and write Python scripts that call tools via RPC, collapsing multi-step pipelines into zero-context-cost turns. The cron scheduler supports natural-language scheduled automations with delivery to any connected platform.

---

## Technical Architecture

```
hermes-agent
├── CLI / TUI
│   ├── Multiline editing, slash-command autocomplete
│   ├── Conversation history, interrupt-and-redirect
│   └── Streaming tool output
├── Learning Loop
│   ├── Skill Creation    -- auto-creates skills after complex tasks
│   ├── Skill Improvement -- skills self-improve during use
│   ├── Memory Nudges     -- periodic prompts to persist knowledge
│   ├── FTS5 Search       -- full-text search across past sessions
│   ├── LLM Summarization -- cross-session recall via search + summarize
│   └── Honcho            -- dialectic user modeling across sessions
├── Multi-Platform Gateway
│   ├── Telegram, Discord, Slack, WhatsApp, Signal, Email
│   ├── Voice memo transcription
│   └── Cross-platform conversation continuity
├── Terminal Backends
│   ├── Local, Docker, SSH
│   ├── Daytona (serverless persistence)
│   ├── Singularity (HPC)
│   └── Modal (serverless GPU)
├── Subagent Delegation
│   ├── Isolated parallel workstreams
│   └── Python RPC scripts (zero-context-cost tool calls)
├── Cron Scheduler
│   └── Natural language scheduling with platform delivery
├── 40+ Tools + MCP Integration
└── Model Providers
    ├── Nous Portal, OpenRouter (200+)
    ├── OpenAI, Anthropic, DeepSeek
    ├── GLM/Z.AI, Kimi, MiniMax
    └── Custom endpoints
```

**Key design decisions:**
- **Closed learning loop**: Skills are not just created -- they self-improve during use based on outcomes. This is a genuinely recursive improvement mechanism.
- **Memory nudges**: The agent periodically reminds itself to persist important information, rather than relying on explicit save commands. This mimics how humans consolidate memory.
- **agentskills.io standard**: Skills follow an open standard, making them portable across agent implementations.
- **Zero-context-cost delegation**: Subagent Python scripts call tools via RPC without consuming the parent agent's context window.
- **Serverless persistence**: Daytona and Modal backends let the agent's environment hibernate when idle, combining always-available with near-zero idle cost.

---

## Publisher Background

Nous Research is a well-known AI research lab that produces the Hermes series of fine-tuned language models. They have significant community presence with the main hermes-agent repo at 71K+ stars. The project evolved from OpenClaw (with a built-in migration path: `hermes claw migrate`). The team actively maintains the project with 3,600+ open issues and regular pushes. Their research focus (Atropos RL environments, trajectory compression) positions this as both a user-facing agent and a research platform for training better tool-calling models.

---

## What's Valuable for Us

1. **Skill self-improvement loop**: The pattern where skills get better during use (not just at creation time) is a higher-order learning mechanism. Our orchestrator could adopt this -- agent prompts/strategies that evolve based on task outcomes.

2. **Memory nudge pattern**: Periodic self-reminders to persist knowledge is a simple but powerful pattern for long-running agents. Better than relying on explicit memory writes at task completion.

3. **FTS5 session search + LLM summarization**: Full-text search across past sessions with LLM-generated summaries for cross-session recall. This is a practical implementation of agent long-term memory we could adopt.

4. **Zero-context-cost subagent delegation**: Spawning Python scripts that call tools via RPC without consuming parent context is an elegant way to parallelize without context window bloat.

5. **Serverless persistence backends**: The Daytona/Modal pattern of hibernating agent environments between sessions is relevant for our cost optimization -- agents that sleep when not needed.

6. **OpenClaw migration path**: The `hermes claw migrate` command shows how to handle backward compatibility when evolving an agent framework. Useful reference for our own version transitions.

---

## What's NOT Relevant

- **TUI / interactive CLI**: We're headless. The multiline editing, slash-command autocomplete, and interactive features are for human users, not agent orchestrators.
- **Multi-platform messaging gateway**: We don't need Telegram/Discord/Slack integration for our orchestrator. The gateway pattern is interesting but not actionable for us.
- **Model provider diversity**: We're Claude-first. The 200+ model support via OpenRouter is irrelevant to our architecture.
- **Voice memo transcription**: Audio processing is outside our scope.
- **RL training integration**: The Atropos/trajectory compression features are research-focused, not operational.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the skill self-improvement mechanism. Can our orchestrator prompts/strategies evolve based on task success rates? Even a simple feedback loop (skill X succeeded 8/10 times, skill Y failed 6/10) would be valuable.
- **Phase 3 (Days 60-90)**: Implement FTS5-based session search for our orchestrator's devlog. Cross-session recall would help agents learn from past task patterns.
- **Phase 4 (Days 90+)**: Consider serverless persistence for idle workers. If our orchestrator has workers that run infrequently, Daytona/Modal-style hibernation could reduce costs significantly.

---

## Key Takeaway

> **Hermes Agent's closed learning loop -- where skills autonomously self-improve during use and the agent nudges itself to persist knowledge -- represents the most mature implementation of agent self-improvement in the open-source ecosystem. The skill improvement pattern and FTS5 session search are the two most actionable ideas for our orchestrator.**
