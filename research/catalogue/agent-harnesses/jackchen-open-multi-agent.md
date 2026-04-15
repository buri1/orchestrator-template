# Open Multi-Agent (JackChen)

> **TypeScript multi-agent framework — one `runTeam()` call from goal to result. Auto task decomposition, parallel execution. 3 dependencies, deploys anywhere Node.js runs.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/JackChen-me/open-multi-agent](https://github.com/JackChen-me/open-multi-agent) |
| GitHub Stars | 5,596 (as of 2026-04-11) — repo created 2026-03-31, reached 5.6K stars in ~11 days |
| Publisher | Jack Chen (solo dev, @JackChen-me on GitHub) |
| License | MIT |
| Tech Stack | TypeScript, Node.js. Runtime deps: `@anthropic-ai/sdk`, `openai`, `zod`. Optional peer: `@google/genai` |
| Maturity | 🟡 Early — but viral trajectory (2,235 forks in first 11 days); 3 documented production deployments |
| Last Analyzed | 2026-04-11 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Same problem domain as our L-Thread orchestrator (multi-agent coordination with task DAG) but via an in-process TypeScript library, not tmux+Claude Code processes. Not our architecture, but a useful library for the Phase 3 business-line agents where we want embedded orchestration inside Node.js services (e.g., OmniPort back-office tasks) rather than spawning full Claude Code sessions. |
| **Novelty** | 7/10 | The "one `runTeam(goal)` call auto-decomposes into a DAG" framing is cleaner than OpenAI Agents SDK (which requires manual handoffs) and LangGraph JS (which requires explicit graph definition). The 3-runtime-dependency constraint is a genuine architectural decision, not marketing. Multi-provider heterogeneity (different agents, different LLMs, one team) is executed well. None of these are individually new, but the combination with a viral-grade API ergonomic is novel. |
| **Actionable** | 6/10 | We wouldn't replace L-Thread with this. But the `AgentPool.runParallel()` primitive, the task-queue-with-failure-cascading, and the `onTrace` span model are all ~1-day adaptation candidates if we ever expose an in-process orchestration API for business-line Node.js services. For the OmniPort-HH admin dashboard, this could wrap the "architect → developer (parallel) → reviewer → synthesis" flow without a tmux dependency. |

---

## Overview

Open Multi-Agent is a TypeScript framework published on 2026-03-31 by solo developer Jack Chen. It went from zero to **5,596 stars and 2,235 forks in 11 days** — one of the fastest-growing agent repos we've tracked since Hyperagent. The pitch is aggressive minimalism: **3 runtime dependencies, zero config, goal-to-result in one `runTeam()` call**.

The core design insight is that most multi-agent frameworks (LangGraph, AutoGen, CrewAI) require the user to pre-define a task graph or agent topology. Open Multi-Agent flips this: you define agents, give the team a natural-language goal, and a coordinator agent automatically decomposes the goal into a task DAG, fans out parallel tasks, cascades failures, and synthesizes a final result. This is conceptually aligned with the "Natural-Language Agent Harnesses (NLAHs)" trend we catalogued from @dair-ai — prompt-based orchestration replacing code-based graphs.

What makes it worth cataloguing despite being a competitor framework: (1) the API surface is the cleanest we've seen for in-process multi-agent orchestration, (2) multi-provider heterogeneity is first-class (different agents in one team can use different LLMs — Claude for reasoning, Gemma4 local for filtering, GPT for synthesis), (3) native local-model tool-calling via Ollama/vLLM/LM Studio/llama.cpp with automatic fallback text extraction, and (4) three documented production deployments including a cybersecurity SOC running fully offline on Qwen 2.5 + DeepSeek Coder via Ollama on Wazuh + Proxmox.

---

## Technical Architecture

```
OpenMultiAgent (root orchestrator)
├── createTeam(name, config)
│   └── Team
│       ├── agents: AgentConfig[]
│       ├── sharedMemory: boolean
│       ├── MessageBus (inter-agent comms)
│       ├── TaskQueue (DAG with failure cascading)
│       └── SharedMemory (agents observe each other's outputs)
│
├── Core Execution APIs
│   ├── runTeam(team, goal)       ← auto decomposition via coordinator agent
│   ├── runTasks(team, tasks)     ← manual task graph (user-defined DAG)
│   ├── runAgent(agent, prompt)   ← single-agent invocation
│   ├── AgentPool.runParallel()   ← MapReduce fan-out (no deps)
│   └── getStatus()               ← introspection
│
├── Agent
│   ├── run() / prompt() / stream()
│   ├── structured output via Zod
│   └── per-agent provider override
│
├── LLMAdapter (provider abstraction)
│   ├── anthropic   (claude-sonnet-4-6, etc.)
│   ├── openai      (also covers Ollama/vLLM/LM Studio/llama.cpp via baseURL)
│   ├── grok        (xAI)
│   ├── copilot     (GitHub Copilot)
│   └── gemini      (optional peer dep)
│
├── ToolRegistry
│   ├── bash          (stdout/stderr, timeout, cwd)
│   ├── file_read     (offset/limit for large files)
│   ├── file_write    (auto-creates parent dirs)
│   ├── file_edit     (exact string replace)
│   ├── grep          (ripgrep or Node.js fallback)
│   └── Tool Access Control
│       ├── Presets: readonly | readwrite | full
│       ├── Allowlist (intersect with preset)
│       └── Denylist (remove specific tools)
│
└── Observability
    ├── onProgress(event)   ← task lifecycle events
    └── onTrace(span)       ← LLM calls, tool calls, task spans
```

### AgentConfig Schema

```typescript
interface AgentConfig {
  name: string
  model: string
  systemPrompt?: string
  provider?: 'anthropic' | 'openai' | 'grok' | 'copilot' | 'gemini'
  tools?: string[]
  toolPreset?: 'readonly' | 'readwrite' | 'full'
  disallowedTools?: string[]
  baseURL?: string     // for Ollama/vLLM/LM Studio/llama.cpp
  apiKey?: string
  timeoutMs?: number
}
```

### Execution Model (runTeam flow)

1. User calls `runTeam(team, "Create a REST API for a todo list in /tmp/todo-api/")`.
2. Coordinator agent receives the goal and decomposes it into a task DAG (e.g., `architect → [developer, tester] → reviewer → synthesis`).
3. TaskQueue executes independent tasks in parallel via `AgentPool` semaphore.
4. Failed tasks cascade to dependents (dependents are marked failed, no retry by default).
5. Agents share observable context through `SharedMemory` when `sharedMemory: true`.
6. Final synthesis aggregates results and returns `{ success, totalTokenUsage, outputs }`.

### What the framework explicitly does NOT build
- **Mid-conversation handoffs** — redirected to OpenAI Agents SDK.
- **State persistence / checkpointing** — "runs in seconds to minutes, not hours." This is a critical architectural divergence from our L-Thread orchestrator, which explicitly targets long-running sessions with `_bmad/` state files and PreCompact hooks.
- **MCP** — "planned" but not shipped.
- **A2A** — "under observation."

---

## Publisher Background

Jack Chen (@JackChen-me) is a solo developer with limited prior public footprint. The repo was created 2026-03-31 and reached 5,596 stars in ~11 days — a viral trajectory comparable to Hyperagent's launch week. The README lists three documented production deployments:

1. **temodar-agent** (~50 stars) — WordPress security analysis via Docker using the built-in `bash`+`file_*`+`grep` tools.
2. **rentech-quant-platform** — Multi-agent quant trading research platform with MCP integrations (despite MCP being marked "planned" in core).
3. **Cybersecurity SOC deployment** — Fully offline, air-gapped setup running Qwen 2.5 + DeepSeek Coder via Ollama on Wazuh + Proxmox infrastructure.

The fact that a solo developer shipped a production-ready framework with 3 real deployments and hit 5.6K stars in 11 days suggests the API design genuinely solves a pain point for TypeScript developers who want multi-agent orchestration without the LangGraph ceremony or the Python ecosystem.

Credibility caveats: solo dev with no corporate backing, no funding, no public track record of maintaining long-lived OSS, early-stage repo (11 days old). The 2,235 forks are a strong signal but also a commitment risk — if Jack stops maintaining it, forks will fragment the ecosystem.

---

## What's Valuable for Us

1. **`runTeam(goal)` API ergonomic**: The "one call, goal-to-result, coordinator auto-decomposes" pattern is the cleanest we've seen. Our `/orchestrator` command does something similar at the Claude Code layer — but if we ever expose an in-process API for business-line Node.js services (Phase 3), this is the target ergonomic. Reference for the L-Thread TypeScript adapter.

2. **`AgentPool.runParallel()` primitive**: Semaphore-bounded parallel execution without task dependencies is exactly the MapReduce fan-out primitive we need for the OmniPort-HH research batch jobs (e.g., "scrape 50 competitor pages, extract design tokens, synthesize report"). Study the semaphore implementation for our own batch worker harness.

3. **TaskQueue with failure cascading**: The DAG-with-cascading-failures model is simpler than Temporal's retry-with-backoff and more appropriate for short-lived (seconds-to-minutes) orchestration. For business-line agents that don't need durable execution, this is a cleaner pattern than pulling in Temporal.

4. **Multi-provider heterogeneity in one team**: Different agents in one `createTeam()` call can use different LLMs. This validates a pattern we've been considering — Claude for reasoning-heavy agents, Gemma4 local for filtering/classification, GPT for synthesis. The per-agent `provider` + `baseURL` override makes this trivial.

5. **Native local-model tool-calling**: Full tool-calling support for Ollama/vLLM/LM Studio/llama.cpp with automatic fallback text extraction. This is relevant for cost control and privacy (German client work where DSGVO requires on-prem). The "openai + baseURL" pattern is the de-facto standard and worth cargo-culting.

6. **Three-tier tool access control (preset + allowlist + denylist)**: Cleaner than our current "every agent gets `--dangerously-skip-permissions`" approach. The `readonly | readwrite | full` preset maps directly to a capability-bounded sandbox model — which aligns with the AIE Europe 2026 thesis (capability-based security > ambient auth). Reference for our Deno-based capability-bounded worker sandbox prototype.

7. **`onTrace` span model**: Simpler than OpenTelemetry but covers LLM calls, tool calls, and task spans. Example 11 in the repo demonstrates a working trace pipeline. If we need lightweight tracing for L-Thread, this is a reference implementation.

8. **Zod-validated structured outputs from any agent**: Schema-enforced JSON returns mean downstream code doesn't need to regex-parse. This is the pattern we should adopt for our orchestrator's "agent reports status" flow instead of grepping tmux capture-pane output.

---

## What's NOT Relevant

- **In-process execution model**: Open Multi-Agent runs agents as TypeScript functions in the same Node.js process. Our L-Thread v3 architecture deliberately runs each worker as a separate Claude Code process in a separate tmux window for crash isolation, context isolation, and visual debuggability. These are fundamentally different architectures — we cannot "adopt" Open Multi-Agent without abandoning our design.
- **No state persistence**: The README explicitly says "runs in seconds to minutes, not hours" and refuses to build checkpointing. Our orchestrator targets long-running autonomous sessions with PreCompact hooks. Direct conflict with Rule #4 (AUTO-MODE) and our session registry.
- **Coordinator-agent decomposition**: The coordinator is itself an LLM call that decomposes the goal. This is a fragility point we've explicitly designed around in L-Thread — our orchestrator uses deterministic issue-queue polling (GitHub issues) as the source of truth, not an LLM-decomposed DAG. Stripe Minions 70/30 pattern (70% deterministic, 30% LLM) applies here.
- **No MCP, no A2A**: Both are roadmap items, not shipping features. Our direction is MCP-first (see Pi-orchestrator research). Adopting Open Multi-Agent would be a step backwards on protocol adoption.
- **No worktree/git integration**: Open Multi-Agent doesn't isolate agent filesystems. Our "git worktree per worker" rule (from `feedback_opus_only_agents.md` and the L-Thread v3 proven architecture) is non-negotiable for parallel safety.
- **Tool set too thin**: Only `bash`, `file_read`, `file_write`, `file_edit`, `grep`. No web, no browser, no MCP, no Chrome DevTools, no GitHub integration. Our agents need all of these daily. Adopting this framework would mean re-implementing the entire tool stack.

---

## Future Use Cases

- **Phase 2 (Days 4-60)** — **Study, don't adopt**: Use as a reference implementation for the "coordinator-decomposes-DAG" pattern when we design the business-line agent router. Steal the `AgentPool.runParallel()` semaphore pattern for our batch research jobs.
- **Phase 3 (Days 60-90)** — **In-process orchestration for business-line Node.js services**: If we embed orchestration inside the OmniPort-HH Next.js backend (e.g., background research tasks, lead enrichment, invoice classification), Open Multi-Agent is a viable library choice — specifically because it stays in-process and doesn't need tmux infrastructure. This is a complement to L-Thread, not a replacement.
- **Phase 4 (Day 90+)** — **Local-model offline deployments**: The cybersecurity SOC case study (offline Qwen 2.5 + DeepSeek via Ollama on air-gapped Proxmox) is directly relevant to German government/enterprise clients with strict DSGVO/BSI Grundschutz requirements. Keep this in the reference pile for Hildesheim-style public-sector pitches where "must run on-prem, zero external API calls" is a hard constraint.
- **Cross-reference**: Compare against [openai-agents-sdk.md](./openai-agents-sdk.md), [langgraph.md](../orchestration-platforms/langgraph.md), [crew-ai.md](../orchestration-platforms/crew-ai.md), [swarms.md](../orchestration-platforms/swarms.md), and our own Hermes/Symphony prototypes (pi-orchestrator research).

---

## Key Takeaway

> **5,596 stars in 11 days validates that TypeScript devs desperately want a `runTeam(goal)` one-call multi-agent primitive — the API ergonomic is the cleanest we've seen and the 3-dep + local-model-native + multi-provider-heterogeneous design is genuinely novel — but the in-process + no-state-persistence + no-worktree execution model is architecturally incompatible with L-Thread, so the value is reference-only for Phase 3 in-process business-line embedding, not replacement.**
