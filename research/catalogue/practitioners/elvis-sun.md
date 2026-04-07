# Elvis Sun

> **Solo founder running a production SaaS through an AI agent swarm orchestrated by "Zoe" on OpenClaw -- the setup Karpathy called "brilliant or severe AI psychosis."**

| Field | Value |
|-------|-------|
| Handle | [@elvissun](https://x.com/elvissun) |
| Role | Solo Founder / Serial Entrepreneur (ex-Google SWE) |
| Known For | Most publicly documented production-grade orchestrator-worker agent swarm; Karpathy direct endorsement |
| Platforms | [X](https://x.com/elvissun), [GitHub](https://github.com/elvisun), [Blog](https://www.elvis.so/), [LinkedIn](https://www.linkedin.com/in/elvissun/) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this practitioner. This section is yours -- agents won't overwrite it.]*

---

## Relevance to Our Work

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Elvis's architecture is the closest validated production system to what we're building with L-Thread Orchestrator. Same patterns: orchestrator never writes code, tmux session isolation, JSON state files, cron health monitoring, context separation between tiers. He is effectively running the same playbook on OpenClaw instead of Claude Code conduit/teams mode. |
| **Signal Quality** | 9/10 | Real revenue ($420 MRR SaaS + $3,600/mo agency contract), real commits (94/day peak, ~50/day sustained), real customer interactions, public daily build logs. Not a demo or tutorial -- production system serving paying customers. Karpathy engagement is the strongest possible external validation signal. |

---

## Background & Track Record

Elvis Sun is a serial entrepreneur based in Waterloo, Canada. He holds a degree from Ivey Business School (Western University) and worked as a software engineer at Google. His GitHub history shows cross-stack depth: Python ML projects (Snake-Game-AI, Chinese-poem-generator with LSTM), TypeScript/Angular (ngrx/platform contributor), and hardware projects (Raspberry Pi garage monitoring with Firebase AutoML). This is not a prompt engineer who discovered AI last month -- he has genuine ML and systems engineering background.

Before the agent swarm, Elvis built PressPulse, an AI-powered PR/media tool he scaled to $17K/month MRR before recognizing it was "the wrong business" built on someone else's land (HARO). He shut it down along with his agency in late 2025 to be present for his newborn. His current SaaS product is medialyst.ai, an agentic PR platform.

In early 2026, he rebuilt from scratch -- but instead of hiring a team, he built an agent swarm. On approximately February 24, 2026, his detailed thread showing the setup went mega-viral: Andrej Karpathy replied "Can't tell if brilliant or severe AI psychosis nice," the post received **2.9 million views**, and he gained **6,000 followers in a single day**. His wife's reaction to Karpathy's assessment: "it's both."

---

## System / Workflow

### Architecture: Two-Tier Orchestrator-Worker

**Tier 1 -- Zoe (The Orchestrator):**
- Runs on OpenClaw inside an Obsidian vault containing ALL business context
- Holds customer data, meeting notes, past decisions, what worked, what failed
- Translates business context into precise, actionable prompts for coding agents
- NEVER writes code directly -- only orchestrates
- Communicates with Elvis via Telegram (notifications only when PRs are merge-ready)
- Voice input via OpenAI Whisper for transcription
- Recently migrated from JSON state to her own database (full tweet archive, stats, follower list, agent tasks -- all queryable)

**Tier 2 -- Coding Agents (The Workers):**
- Spawned by Zoe into isolated git worktrees
- Each agent runs in its own tmux session with its own `node_modules` and build environment
- Agents stay focused on code; they have zero business context
- Task registry in `.clawdbot/active-tasks.json` (tmux session name, agent type, description, repo, worktree, branch, status)

### Model Routing

| Agent | Best For | Usage |
|-------|----------|-------|
| **Codex** | Backend logic, complex bugs, multi-file refactors, cross-codebase reasoning | ~90% of tasks, slower but comprehensive. Best code reviewer of the three. |
| **Claude Code** | Frontend work, git operations, fast iterations | Faster, fewer permission issues |
| **Gemini** | UI design, HTML/CSS specs, security/scalability reviews | Design generation, then Claude implements. Free + great for code review. |

Elvis noted GPT-5 is an excellent orchestrator model for multi-agent systems beyond coding.

### Health Monitoring (100% Deterministic -- Zero LLM)

**Every 10 minutes (cron):**
1. Reads the JSON task registry
2. Checks if tmux sessions are alive
3. Checks for open PRs on tracked branches
4. Checks CI status via `gh` CLI
5. Auto-respawns failed agents (max 3 attempts) with improved prompts

**Daily cron:**
- Removes orphaned worktrees
- Cleans stale entries from task registry

This is the Elvis Sun Principle in action: monitoring is 100% deterministic shell scripting (tmux, gh CLI, CI). Zero LLM involvement in the monitoring loop.

### Definition of Done (Multi-Model Review Gate)

Zoe only notifies Elvis when ALL of the following are true:
- PR created
- CI passing (lint, types, unit tests, E2E)
- Reviews passed by multiple AI models (Codex, Claude Code, Gemini -- they catch different error classes)
- Screenshots included for UI changes

### Intelligent Failure Recovery

When an agent fails, Zoe does NOT just respawn with the same prompt. She:
1. Examines the failure with full business context
2. Determines the failure mode (context exhaustion, wrong direction, missing clarification)
3. Uses knowledge the agents don't have (customer history, meeting notes, prior failures)
4. Writes a **better prompt** for the retry
5. Logs the pattern ("This prompt structure works for billing features", "Codex needs type definitions upfront")

Over time, Zoe's prompts improve through accumulated pattern knowledge. Emergent learning at the orchestrator level.

### Proactive Autonomous Behaviors

Zoe doesn't wait for Elvis to assign tasks:
- **Morning:** Scans Sentry for new errors and spawns fix agents. Generates content ideas and newsjacking opportunities (delivered at 7am).
- **After meetings:** Scans meeting notes for feature requests, spawns implementation agents.
- **Customer support:** Cross-references complaints with codebase and production data, pushes fixes, gives goodwill credits.
- **Growth:** Manages X posting and engagement, tracks follower analytics, handles waitlist signups.

### Key Numbers

| Metric | Value |
|--------|-------|
| Peak commits/day | 94 (3 client calls, never opened editor) |
| Average commits/day | ~50 |
| PRs in 30 minutes | 7 |
| SaaS MRR | $420 |
| Agency contract | $3,600/month |
| API costs | ~$190/month ($100 Claude + $90 Codex) |
| X payout | $1,505 for 9.3M impressions |
| Waitlist signups | 200+ |
| Hardware | Mac Studio M4 Max 128GB ($5,000) |
| Team size | 1 (Elvis) |

### Hardware Evolution

- Started on Mac Mini (16GB RAM) -- tops out at 4-5 concurrent agents before memory swapping
- Upgraded to Mac Studio ($5K) for more headroom
- RAM is the primary constraint, not CPU. Each worktree's `node_modules`, build tools, and test runners consume significant memory
- Five agents = five parallel TypeScript compilers and test runners

---

## Key Insights

1. **Context separation is architectural, not optional** -- Business context NEVER enters coding agents. Code context NEVER enters the orchestrator. "Specialization through context, not through different models." This is the single pattern that makes the whole system work. Without it, agents hallucinate business logic into code or waste tokens on irrelevant context.

2. **Monitoring must be 100% deterministic** -- Elvis's `check-agents.sh` uses tmux, gh CLI, and CI status checks. Zero LLM in the monitoring loop. This is critical: if your monitoring system is also an LLM, you have compounding unreliability. Shell scripts don't hallucinate.

3. **The orchestrator learns through pattern logging** -- Zoe doesn't just retry; she logs what worked and why. "This prompt structure works for billing features." "Codex needs type definitions upfront." Over time, prompt quality improves without explicit programming. The orchestrator becomes a knowledge accumulator.

4. **Proactive beats reactive** -- Morning Sentry scans, post-meeting feature spawn, evening changelog. The system finds work rather than waiting for assignments. This is the difference between a tool and a team member.

5. **Multi-model code review catches different error classes** -- Codex, Claude Code, and Gemini each find different categories of bugs. Elvis noted Codex is the best reviewer overall, Gemini Code Assist is "free and great," and Claude Code is "mostly useless" for review specifically. The combination matters more than any single model.

6. **Mid-task redirection via tmux send-keys** -- Don't kill agents and restart. Use `tmux send-keys` to redirect them mid-task. Cheaper, faster, preserves context.

7. **Security by least privilege, not by prompts** -- Move critical data to USB, unplug when sleeping. Billing caps on everything AI touches. Limit external data reads, wrap in `<UNTRUSTED_EXTERNAL_CONTEXT>`. He manually controls Stripe access ("declined her access to Stripe lol").

---

## What We Can Learn

**Directly adoptable patterns:**

- **Obsidian vault as context backbone.** We already have `_bmad/` state files and CLAUDE.md. Extending this to a structured knowledge store (meeting notes, customer data, decision history, failure patterns) that the orchestrator reads before generating any agent prompt would close the biggest gap.

- **Model routing per task type.** Not every task needs the same model. Billing bug -> Codex. Style fix -> Claude Code. Architecture review -> Opus. Simple formatting -> Haiku. The orchestrator should maintain a routing table.

- **Pattern logging for prompt improvement.** Add a `_bmad/pattern-log.json` recording: task type, prompt used, model chosen, success/failure, and lessons learned. The orchestrator should consult this before generating prompts.

- **Proactive task generation via cron.** Scan GitHub issues, Sentry errors, test coverage gaps, and open PRs. Generate tasks autonomously rather than waiting for human input.

- **Notification layer that respects attention.** Telegram bot or webhook that only fires on definition-of-done. Everything else is async. Reduce noise ruthlessly.

- **Three-model review pipeline.** After an agent completes work, have a second (and third) agent from different models review the PR before notifying the human.

---

## What Doesn't Apply

- **OpenClaw dependency.** Elvis's entire system runs on OpenClaw as the orchestration layer. We use Claude Code with conduit/teams/tmux modes. The patterns transfer; the platform doesn't. We don't need OpenClaw -- we need the patterns it enables.

- **Mac Studio hardware assumption.** Elvis runs 5 concurrent agents on a $5K Mac Studio with 128GB RAM. Our tmux mode works on any machine, and the DeepMind paper confirms 2-3 agents is optimal anyway. We don't need 5 concurrent agents.

- **Monorepo structure.** Elvis runs business docs + code in a single monorepo so Zoe has full context. Our architecture uses federated, independent business lines (DSGVO isolation mandatory for gov work). We achieve the same context separation through tiered context loading, not through monorepo proximity.

- **Revenue scale as validation.** $420 MRR + $3,600/mo agency is real but modest. The architecture is more impressive than the revenue. Don't conflate the two -- the patterns work regardless of current revenue.

- **GPT-5 as orchestrator model.** Elvis suggested GPT-5 is excellent for multi-agent orchestration. We're Claude-native and optimizing for Claude Max arbitrage ($200/mo = 18-36x vs API). Model switching at the orchestrator level would break our cost advantage.

---

## Referenced Tools/Projects

| Tool/Project | How They Use It | In Our Catalogue? |
|-------------|-----------------|-------------------|
| [OpenClaw](https://github.com/openclaw/openclaw) | Orchestration platform -- Zoe runs on it. 271K+ GitHub stars. | No (platform, not directly relevant) |
| Obsidian | Business context store / knowledge vault | No |
| tmux | Agent session isolation and management | N/A (infrastructure) |
| Codex (OpenAI) | Primary coding agent (~90% of tasks) | [Yes](../agent-harnesses/openai-codex.md) |
| Claude Code | Frontend work, git ops, fast iterations | N/A (our primary tool) |
| Gemini | UI design specs, code review | No |
| Telegram | Notification channel for merge-ready PRs | No |
| OpenAI Whisper | Voice input transcription | No |
| Perplexity + Brave API | Web search for agents ($5/mo) | No |
| Sentry | Error monitoring -- Zoe scans for proactive bug fixes | No |
| medialyst.ai | Elvis's agentic PR SaaS product | No |

---

## Key Takeaway

> **The orchestrator's power comes from strict context separation (business context never enters coding agents), 100% deterministic monitoring (shell scripts, not LLMs), and accumulated pattern knowledge that makes prompts better over time -- not from the number of agents or the speed of commits.**
