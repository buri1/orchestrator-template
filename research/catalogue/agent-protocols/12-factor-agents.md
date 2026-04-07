# 12 Factor Agents

> **Principles for building reliable LLM applications — what are the principles we can use to build LLM-powered software that is actually good enough to put in the hands of production customers?**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocol / Design Methodology |
| Repository | [humanlayer/12-factor-agents](https://github.com/humanlayer/12-factor-agents) |
| GitHub Stars | 18,677 (as of 2026-03-12) |
| Publisher | HumanLayer Inc. (startup, YC X25) — Dex Horthy (James), solo primary author |
| License | Apache 2.0 (code) / CC BY-SA 4.0 (content) |
| Tech Stack | TypeScript (80%), Python, BAML; framework-agnostic principles |
| Maturity | 🟢 Production (widely adopted methodology; 18.7K stars, 1,419 forks) |
| Last Analyzed | 2026-03-12 |

---

## Burak's Notes

> We already have the article entry at `articles/2025-04/12-factor-agents.md` and HumanLayer at `developer-gui/humanlayer.md`. This entry focuses on the **repo as a living codebase** — the workshop, templates, `create-12-factor-agent` scaffolding, CLAUDE.md persona system, and the community contributions that have extended the original 12 factors. The article entry covers the intellectual content; this entry covers the repo as a tool, its code artifacts, and its architecture mapping to our system. The key delta is: the repo now includes a hands-on TypeScript workshop (`workshops/2025-05-17`), a scaffolding CLI (`packages/create-12-factor-agent`), BAML integration for structured outputs, and a promptx-based CLAUDE.md with 5 agent personas — all of which we should study. The `npx create-12-factor-agent` is particularly interesting as a template for how we might package our own orchestrator patterns.

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | The foundational design methodology for production agent engineering. Every single factor maps to a pattern we either already implement or should adopt. This is the "12 Factor App" of the agent era — the intellectual bedrock beneath our 70/30 split, state-in-JSON, and context separation principles. |
| **Novelty** | 7/10 | We already ingested the article version. The new value here is: the workshop code, the `create-12-factor-agent` scaffold, the CLAUDE.md persona system with 5 specialized agents, the BAML structured output examples, and Factor 13 (pre-fetch context). |
| **Actionable** | 9/10 | Directly implementable patterns: (1) stateless reducer for agent design, (2) pre-fetch context pattern, (3) XML-style custom context formats, (4) consecutive error counter with human escalation, (5) `create-12-factor-agent` as template for packaging our patterns. |

---

## Overview

12 Factor Agents is an open-source methodology guide — inspired by Heroku's "12 Factor App" — that codifies 12 (plus 1 bonus) engineering principles for building production-grade LLM-powered software. Created by Dex Horthy, co-founder of HumanLayer (YC X25), it emerged from interviewing 100+ startup founders and observing a universal pattern: teams reach 70-80% quality with agent frameworks, then hit a reliability ceiling that requires reverse-engineering and starting over.

The central thesis is radical: **the best production agents are mostly deterministic software with LLM steps sprinkled in at strategic points**. Rather than "here's your prompt, here's a bag of tools, loop until done" (the Anthropic/OpenAI canonical agent pattern), 12 Factor Agents advocates for small, focused micro-agents embedded as nodes in larger deterministic DAGs. The LLM handles natural language interpretation and decision-making; deterministic code handles control flow, state management, error recovery, and execution.

The repo has grown beyond the original essay into a full ecosystem: a hands-on TypeScript workshop with incremental build steps, a scaffolding CLI (`npx create-12-factor-agent`), BAML integration for structured outputs, and a CLAUDE.md persona system with 5 specialized agent types (Developer, Code Reviewer, Rebaser, Merger, Multiplan Manager). With 18.7K stars and 1,419 forks in under a year, it is the single most-starred agent methodology reference on GitHub.

---

## The 12 Factors (Deep Analysis)

### Factor 1: Natural Language to Tool Calls
**The Atomic Pattern.** Convert natural language input into structured JSON that deterministic code can execute. This is the irreducible building block of all agent behavior.

```python
nextStep = await llm.determineNextStep("create a payment link for $750 to Jeff")
if nextStep.function == 'create_payment_link':
    stripe.paymentlinks.create(nextStep.parameters)
```

**Mapping to our system**: This is exactly what our agent spawning does — task descriptions become Claude tool calls. No gap.

### Factor 2: Own Your Prompts
**Anti-framework principle.** Don't use `Agent(role="...", goal="...", tools=[])` black-box APIs. Treat prompts as first-class code with full control over every token. Use BAML or template engines, not framework abstractions.

Key benefits: full control, testability via evals, rapid iteration, transparency, role hacking (non-standard user/assistant usage).

**Mapping to our system**: Our `.claude/agents/orchestrator.md` and custom CLAUDE.md are exactly this — first-class prompt code. No gap.

### Factor 3: Own Your Context Window (Context Engineering)
**The factor that coined "context engineering."** Standard message arrays (`[{role, content}]`) are not the only format. Build custom context formats optimized for your use case — XML-style tags, YAML, whatever maximizes information density per token.

```xml
<slack_message>
    From: @alex
    Channel: #deployments
    Text: Can you deploy the backend?
</slack_message>

<list_git_tags_result>
    tags:
      - name: "v1.2.3"
        commit: "abc123"
</list_git_tags_result>
```

The `thread_to_prompt()` pattern: a `Thread` object containing typed `Event` objects, each serialized via `event_to_prompt()` into XML tags, concatenated into a single user message.

**Mapping to our system**: Our state files (`orchestrator-state.json`, `orchestrator-tmux-state.json`) are custom context. Gap: we don't use XML-style context formatting for agent prompts — worth experimenting with.

### Factor 4: Tools Are Just Structured Outputs
**Demystification principle.** Tool calls are JSON describing what code should execute, not magic. An LLM outputting `{intent: "deploy_backend", tag: "v1.2.3"}` is just structured output. Your switch statement decides what to do with it.

The key insight: "Just because an LLM called a tool doesn't mean you have to execute a specific corresponding function in the same way every time." Different tool calls can trigger different control flow (immediate execution vs. pause-for-human vs. long-running task).

**Mapping to our system**: Our orchestrator's deterministic routing is exactly this pattern. No gap.

### Factor 5: Unify Execution State and Business State
**Single source of truth.** Don't maintain separate execution state (current step, retry count, waiting status) and business state (what's happened so far). Engineer the application so execution state is **inferred from the context window**.

Benefits: simplicity, trivial serialization, complete debugging visibility, recovery from any point, thread forking.

**Mapping to our system**: `orchestrator-state.json` unifies both. No gap. This factor validates our approach.

### Factor 6: Launch/Pause/Resume with Simple APIs
**Lifecycle management.** Agents should be launchable, queryable, pausable, and resumable via straightforward APIs. External triggers (webhooks) should resume agents from where they left off without deep framework integration.

Critical: the ability to pause **between tool selection and tool execution** (not just between loop iterations). Most frameworks don't support this.

**Mapping to our system**: Tmux sessions + state persistence handle this. Gap: no webhook resume capability yet.

### Factor 7: Contact Humans with Tool Calls
**Humans as tools.** Define `request_human_input` as a structured tool call with urgency levels, response formats, and context. The agent always outputs JSON — "human contact" is just another structured output type.

```python
class RequestHumanInput:
    intent: "request_human_input"
    question: str
    context: str
    options: Options  # urgency, format (free_text/yes_no/multiple_choice)
```

This enables: outer-loop agents (Agent->Human, not just Human->Agent), multi-agent handoffs, durable reviewable workflows.

**Mapping to our system**: Our roadblock recovery + AUTO_MODE check implements this partially. Gap: not structured as formal tool calls with urgency/format metadata.

### Factor 8: Own Your Control Flow
**The deterministic backbone.** Build custom control structures per use case. Different tool calls warrant different handling:
- `request_clarification` -> break loop, send message, wait for webhook
- `fetch_open_issues` -> execute immediately, append result, continue loop
- `create_issue` -> break loop, request human approval, wait for webhook

The explicit switch statement pattern with `continue`/`break` per tool type is the core architecture.

**Mapping to our system**: Our orchestrator's routing logic is this pattern. "Don't use prompts for control flow if you can use control flow for control flow." No gap — this validates our Principle #2.

### Factor 9: Compact Errors into Context Window
**Self-healing pattern.** When a tool call fails, append the error to the context window and let the LLM try again. Implement a consecutive error counter (e.g., 3 max) to prevent spin-outs. When threshold is hit, escalate to human or reset context.

```python
consecutive_errors = 0
# ... on error:
consecutive_errors += 1
if consecutive_errors < 3:
    thread["events"].append({"type": "error", "data": format_error(e)})
else:
    break  # escalate to human
```

**Mapping to our system**: Agent retry logic + roadblock logging implement this. No gap.

### Factor 10: Small, Focused Agents
**The scalability principle.** Agents should handle 3-10 steps max (20 ceiling). As context grows, LLMs lose focus. Small agents = manageable context = better performance.

The "micro agent" pattern: individual focused agents composed as nodes in a larger deterministic DAG. As models improve, you can incrementally expand agent scope — but always find the boundary of model capability and stay just inside it.

The DeployBot example: a real production agent that manages deployment approvals in 5-10 steps, embedded in a larger deterministic CI/CD pipeline.

**Mapping to our system**: Our 2-3 agent team scoping, the DeepMind coordination overhead exponent (1.724), and our 5-6 PR/day human review ceiling all align. No gap.

### Factor 11: Trigger from Anywhere
**Meet users where they are.** Agents should be triggerable from Slack, email, SMS, crons, events, webhooks — not just a chat interface. Combined with Factor 6 (pause/resume) and Factor 7 (human contact), this enables outer-loop agents that work autonomously and reach out when needed.

**Mapping to our system**: Gap — we're CLI-only. No Slack/email/webhook triggers yet. Phase 2-3 priority.

### Factor 12: Make Your Agent a Stateless Reducer
**Functional programming paradigm.** An agent is a pure function: `(state, event) -> (state, effects)`. Like a Redux reducer or Haskell `foldl`. The agent takes accumulated context, produces new context + side effects. No hidden state.

This is the capstone principle: if you implement Factors 3, 5, and 8, your agent naturally becomes a stateless reducer.

**Mapping to our system**: Not explicitly implemented. Gap — worth evaluating for agent redesign to enable replay, testing, and forking.

### Factor 13 (Bonus): Pre-Fetch All Context You Might Need
**Eliminate unnecessary round trips.** If there's a high probability the model will request certain data (e.g., git tags for deployment), fetch it deterministically BEFORE the agent loop and include it in the initial context window. This saves token round trips and improves reliability.

> "If you already know what tools you'll want the model to call, just call them DETERMINISTICALLY and let the model do the hard part of figuring out how to use their outputs."

**Mapping to our system**: We do this partially with state file loading. Could be more systematic — pre-fetch relevant file contents, git status, etc. before spawning agents.

---

## Technical Architecture

### Core Abstraction: Thread + Events

```python
class Thread:
    events: List[Event]

class Event:
    type: str  # e.g., "slack_message", "deploy_backend", "error", "human_response"
    data: Any  # typed union per event type

def thread_to_prompt(thread: Thread) -> str:
    return '\n\n'.join(f"<{e.type}>\n{stringify(e.data)}\n</{e.type}>"
                       for e in thread.events)
```

### Core Loop

```python
while True:
    next_step = await determine_next_step(thread_to_prompt(thread))
    thread.events.append(next_step)

    if next_step.intent == "done":
        return next_step.final_answer

    match next_step.intent:
        case "request_human_input":
            await save_state(thread)
            await notify_human(next_step)
            break  # async — wait for webhook
        case "fetch_data":
            result = await execute(next_step)
            thread.events.append(result)
            continue  # sync — loop back
        case "high_stakes_action":
            await save_state(thread)
            await request_approval(next_step)
            break  # async — wait for approval
```

### Repo Structure

```
12-factor-agents/
├── content/                          # 12 factor markdown essays (the methodology)
│   ├── brief-history-of-software.md  # Prologue: DAGs -> ML DAGs -> Agents -> Micro Agents
│   ├── factor-01-*.md through factor-12-*.md
│   └── appendix-13-pre-fetch.md
├── packages/
│   ├── create-12-factor-agent/       # npx scaffold (BAML + TypeScript template)
│   │   └── template/                 # baml_src/, src/, package.json, tsconfig.json
│   └── walkthroughgen/               # Tool for generating workshop walkthroughs
├── workshops/
│   └── 2025-05-17/                   # Hands-on TypeScript workshop
│       ├── walkthrough.md            # Step-by-step build guide
│       ├── walkthrough.yaml          # Workshop configuration
│       ├── sections/                 # Individual workshop sections
│       └── walkthrough/              # Checkpoint files (00-package.json, etc.)
├── img/                              # Visual diagrams and GIF animations
├── CLAUDE.md                         # promptx-based persona system (5 agents)
└── README.md                         # The main guide / essay
```

### CLAUDE.md Persona System
The repo includes a promptx-based CLAUDE.md with 5 specialized agent personas:
1. **Developer Agent** — coding, debugging, implementation
2. **Code Reviewer Agent** — review and quality assurance
3. **Rebaser Agent** — git history cleaning
4. **Merger Agent** — branch merging
5. **Multiplan Manager Agent** — parallel work orchestration

Each persona has specific workflows, tools, success criteria, and commit cadence. Mandatory selection before any work begins.

### create-12-factor-agent Scaffold
A TypeScript project template using BAML for structured LLM outputs. The template includes:
- BAML source directory for prompt-as-code definitions
- TypeScript source with the core agent loop
- Package configuration with tsx for development

---

## Publisher Background

**Dex Horthy (James)** is the co-founder and primary author (248 of ~270 commits). He has been building in the AI agent space since August 2024 (humanlayer repo creation). He authored the original "12 Factor Agents" essay in March 2025, which is credited with coining the term "context engineering" approximately two months before it was popularized by Karpathy and Shopify CEO Tobi Lutke in June 2025.

**HumanLayer Inc.** is a YC X25 company. Their product ecosystem includes:
- **CodeLayer** (formerly HumanLayer): IDE for AI coding agents built on Claude Code (9.7K stars)
- **12 Factor Agents**: This methodology repo (18.7K stars)
- **Agent Control Plane (ACP)**: Kubernetes-native agent orchestrator (348 stars)
- **Advanced Context Engineering**: Guide (1.5K stars)

**Star Growth Trajectory**:
- Created: 2025-03-30
- First star: 2025-03-31
- Viral breakout: 2025-04-03 (multiple stars within minutes)
- Current: 18,677 stars (as of 2026-03-12)
- Growth rate: ~1,560 stars/month average over ~12 months
- 1,419 forks — indicating active community adoption and experimentation

---

## What's Valuable for Us

### 1. Stateless Reducer Pattern (Factor 12)
The capstone principle we haven't implemented. Agents as pure functions `(state, event) -> (state, effects)` enables: replay for debugging, deterministic testing, thread forking, undo/redo. This maps directly to functional programming best practices and would sharpen our agent design.

### 2. Pre-Fetch Context Pattern (Factor 13)
The most immediately actionable gap. Before spawning an agent, deterministically fetch everything it's likely to need (git status, file contents, relevant state). Saves token round trips, reduces agent spin-out risk, improves first-response quality. We should audit each agent spawn point and add pre-fetch logic.

### 3. XML-Style Custom Context Formatting (Factor 3)
The `thread_to_prompt()` pattern with XML tags (`<slack_message>`, `<deploy_result>`) is more information-dense and attention-efficient than standard message arrays. We could adopt this for our orchestrator-to-agent context passing.

### 4. Consecutive Error Counter + Human Escalation (Factor 9)
A concrete implementation pattern we should add to our agent retry logic: count consecutive errors per tool, threshold at 3, then deterministically escalate to human (our roadblock recovery) rather than letting the LLM decide when to give up.

### 5. Pause Between Selection and Execution (Factor 6+8)
The ability to pause the agent loop **after** the LLM selects a tool but **before** execution. This enables human approval of high-stakes actions. We partially do this with AUTO_MODE checks but should formalize it.

### 6. create-12-factor-agent as Template Reference
The scaffolding approach (`npx create-12-factor-agent`) is a model for how we could package our orchestrator patterns as a reusable starter template.

### 7. CLAUDE.md Persona System
The 5 specialized agent personas (Developer, Reviewer, Rebaser, Merger, Manager) with mandatory selection is a clean reference for how we structure our `.claude/agents/` directory. The "Multiplan Manager Agent" persona is particularly relevant as a parallel to our orchestrator.

---

## What's NOT Relevant

### Framework-Agnostic Positioning
The guide's strong anti-framework stance ("I've tried every agent framework... most successful founders are rolling the stack themselves") conflicts slightly with our use of Claude Code as a harness. However, the principles still apply — we're using Claude Code as a runtime, not as a black-box framework. Our CLAUDE.md/agents approach is the "own your prompts" pattern.

### TypeScript-First Workshop
The workshop is TypeScript-specific with BAML integration. While we could learn from the patterns, the actual code is not directly adoptable since we're Claude Code + prompt engineering, not building a custom TypeScript agent runtime.

### DeployBot Example
The specific DeployBot use case (CI/CD deployment with Slack approval) is not our use case. The architectural patterns it demonstrates are valuable; the domain is not.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [12 Factor Agents (Article)](../articles/2025-04/12-factor-agents.md) | Original article ingest — covers the intellectual content |
| [HumanLayer](../developer-gui/humanlayer.md) | Publisher's product; CRISPY pipeline builds on 12 Factor principles |
| [Dex RPI/CRISPY Talk](../talks/2026-03/dex-rpi-crispy-brownfield-agents.md) | Conference talk evolving 12 Factor into 7-phase CRISPY pipeline |
| [Stripe Minions](../orchestration-platforms/stripe-minions.md) | 70/30 deterministic/LLM split = Factor 8 (own your control flow) in practice |
| [Inngest](../orchestration-platforms/inngest.md) | Referenced in the guide as a modern DAG orchestrator; aligns with Factor 6 (pause/resume) |
| [AGENTS.md](./agents-md.md) | Convention file protocol; Factor 2 (own your prompts) in standardized form |
| [BAML (Boundary ML)](https://github.com/boundaryml/baml) | Referenced for Factor 4 (structured outputs); used in workshop code |
| [CASS Memory System](../agent-memory/cass-memory-system.md) | Factor 3 (context engineering) taken to its logical extreme with episodic memory |
| [Relay App](../orchestration-platforms/relay-app.md) | Implements Factors 6, 8 (pause/resume, own control flow) with Rust broker |
| [Trigger.dev](../infrastructure/trigger-dev.md) | Implements Factor 6 (durable pause/resume) at infrastructure level |

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Implement consecutive error counter (Factor 9) in agent retry logic. Add pre-fetch context (Factor 13) for common agent spawn points. Audit XML-style context formatting for orchestrator prompts.
- **Phase 2 (Days 4-60)**: Evaluate stateless reducer pattern (Factor 12) for agent redesign — enables replay, testing, forking. Formalize pause-between-selection-and-execution (Factor 6+8) for high-stakes agent actions.
- **Phase 3 (Days 60-90)**: Implement webhook resume (Factor 6+11) for Slack/email triggers. Study `create-12-factor-agent` scaffold as template for packaging our orchestrator patterns.
- **Phase 4 (Days 90+)**: Full Factor 11 (trigger from anywhere) — Slack, email, cron, webhook triggers for orchestrator. Consider publishing our own "N-factor orchestrator" methodology based on lessons learned.

---

## Key Takeaway

> **12 Factor Agents is the "12 Factor App" of the agent era — the single most influential methodology reference for production agent engineering (18.7K stars), codifying the principle that great agents are mostly deterministic software with LLM steps at strategic inflection points. Every factor either validates our existing architecture or identifies a concrete gap to close.**
