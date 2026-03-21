# Open SWE (LangChain)

> **An open-source asynchronous coding agent framework — multi-channel invocation (Slack/Linear/GitHub), cloud sandbox isolation, subagent spawning, and automatic PR creation.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [langchain-ai/open-swe](https://github.com/langchain-ai/open-swe) |
| GitHub Stars | 7,800 (as of 2026-03-21) |
| Publisher | LangChain / Harrison Chase — bigtech-backed startup ($240M+ raised, Sequoia/Benchmark) |
| License | MIT |
| Tech Stack | Python 98.4%, LangGraph, Deep Agents framework, Anthropic Claude (default: claude-opus-4-6), Modal/Daytona/Runloop/LangSmith (sandbox providers), Slack + Linear + GitHub (invocation channels) |
| Maturity | 🟢 Production (606 commits; 928 forks; 4 open issues; MIT; Docker deployment; INSTALLATION.md + CUSTOMIZATION.md) |
| Last Analyzed | 2026-03-21 |

---

## Burak's Notes

> *Open SWE is LangChain's productized version of the "enterprise internal coding agent" pattern pioneered by Stripe (Minions), Ramp (Inspect), and Coinbase (Cloudbot). It builds on top of their own Deep Agents framework (already catalogued at 10K stars) and adds the multi-channel invocation layer + sandbox isolation that makes it deployable as an always-on service rather than a CLI tool.*
>
> *The most interesting architectural choice is the middleware-driven safety net: three deterministic hooks (message queue injection, automatic PR creation, tool error handling) wrap the agent loop. This maps directly to our Master Blueprint Principle #2 (deterministic orchestration, LLM execution) — the deterministic middleware ensures critical operations happen regardless of LLM behavior. The `open_pr_if_needed` middleware is particularly clever: it acts as a backstop that prevents task abandonment by force-creating a PR even if the agent fails to do so.*
>
> *The multi-channel invocation (Slack mentions, Linear comments, GitHub PR tags) with thread-based routing to running agent instances is the feature our orchestrator lacks. We invoke via tmux send-keys; they invoke via Slack/Linear/GitHub with real-time follow-up messaging. For client-facing work, this pattern is more professional.*
>
> *Main concern: Python + LangChain + LangGraph stack lock-in. Same issue as Deep Agents itself. The patterns are excellent; the implementation is not portable to our TS-native architecture. Also, the sandbox dependency (Modal/Daytona/Runloop) adds infrastructure that conflicts with our local tmux+worktree approach.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | The multi-channel invocation + deterministic middleware + sandbox isolation pattern is exactly what a production enterprise coding agent needs. Thread-based follow-up routing and subagent spawning validate our orchestrator's worker management approach. Loses points: Python/LangChain lock-in, cloud sandbox dependency (we use local tmux+worktree), no tmux substrate. |
| **Novelty** | 6/10 | The three-middleware deterministic safety net (message queue + PR backstop + error handling) is a clean pattern we haven't seen codified this way. Thread-based routing of follow-up messages to running agents is novel. The AGENTS.md context injection and curated toolset philosophy echo patterns already catalogued from 12 Factor Agents and Deep Agents. The 7 architectural decisions document is well-structured but builds on known patterns. |
| **Actionable** | 5/10 | Three adoptable patterns: (1) Deterministic middleware hooks wrapping agent loops (our `.bmad/scripts/` could evolve into middleware), (2) Multi-channel invocation with thread-based routing (Phase 3+ when we add Slack/Linear triggers), (3) AGENTS.md as convention file for per-repo agent instructions (already catalogued, validates adoption). Direct code adoption blocked by Python/LangChain stack mismatch. |

---

## Overview

Open SWE is LangChain's open-source framework for building internal coding agents that operate asynchronously on software tasks. It replicates the architectural patterns used by elite engineering teams at Stripe (Minions), Ramp (Inspect), and Coinbase (Cloudbot) for their proprietary internal agents. Rather than being a CLI tool for individual developers, Open SWE is designed as an always-on service that responds to Slack mentions, Linear issue comments, and GitHub PR tags.

The framework builds on LangChain's own Deep Agents harness (already catalogued), adding three key layers: multi-channel invocation with real-time follow-up messaging, cloud sandbox isolation (one isolated Linux environment per task), and deterministic middleware hooks that ensure safety-critical operations execute regardless of LLM behavior.

Each task executes in a fully isolated cloud sandbox with shell access. The system supports pluggable sandbox providers (Modal, Daytona, Runloop, LangSmith). Sandboxes persist across follow-up messages and auto-recreate if unreachable. The agent receives approximately 15 curated tools following a "quality over quantity" philosophy: `execute`, `fetch_url`, `http_request`, `commit_and_open_pr`, `linear_comment`, `slack_thread_reply`, plus Deep Agents built-ins (`read_file`, `write_file`, `edit_file`, `ls`, `glob`, `grep`, `write_todos`, `task`).

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    INVOCATION CHANNELS                            │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐               │
│  │  Slack    │    │  Linear  │    │  GitHub PR   │               │
│  │  @openswe │    │ @openswe │    │  @openswe    │               │
│  │  + repo:  │    │  on issue│    │  in comments │               │
│  └─────┬────┘    └─────┬────┘    └──────┬───────┘               │
│        │               │                │                        │
│  ┌─────┴───────────────┴────────────────┴───────────────────┐   │
│  │          Deterministic Thread ID Router                    │   │
│  │  (routes follow-up messages to running agent instances)    │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│                    AGENT LOOP                                     │
│                          │                                        │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │              Deep Agents Framework                         │   │
│  │  (LangGraph state machine, claude-opus-4-6 default)     │   │
│  └───────────────────────┬──────────────────────────────────┘   │
│                          │                                        │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │           3 Deterministic Middleware Hooks                  │   │
│  │                                                            │   │
│  │  1. check_message_queue_before_model                       │   │
│  │     → injects follow-up messages mid-execution             │   │
│  │                                                            │   │
│  │  2. open_pr_if_needed                                      │   │
│  │     → safety net ensuring PR creation (backstop)           │   │
│  │                                                            │   │
│  │  3. ToolErrorMiddleware                                    │   │
│  │     → graceful error handling, prevents agent crashes      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ~15 Curated Tools                              │   │
│  │  execute, fetch_url, http_request, commit_and_open_pr,     │   │
│  │  linear_comment, slack_thread_reply,                       │   │
│  │  + Deep Agents built-ins (read/write/edit/ls/glob/grep,    │   │
│  │    write_todos, task [subagent spawning])                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Context Engineering                            │   │
│  │  AGENTS.md injection + full issue/thread pre-loading        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────────┐
│              SANDBOX ISOLATION (per task)                         │
│                          │                                        │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │              Pluggable Sandbox Providers                    │   │
│  │  ┌───────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │   │
│  │  │ Modal │  │ Daytona │  │ Runloop │  │  LangSmith   │  │   │
│  │  └───────┘  └─────────┘  └─────────┘  └──────────────┘  │   │
│  │  - Isolated cloud Linux per task                           │   │
│  │  - Full shell access                                       │   │
│  │  - Persist across follow-up messages                       │   │
│  │  - Auto-recreate if unreachable                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              OUTPUT: Draft PR + Channel Notifications       │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Composition over forking**: Builds on Deep Agents framework, not a fork of existing agents. Enables upgrade paths while maintaining customization flexibility.
2. **Sandbox-first isolation**: Each task gets its own cloud Linux environment with full permissions. Security comes from the sandbox boundary, not permission restrictions within the environment.
3. **Tool curation over quantity**: ~15 carefully selected tools. Follows the principle that "tool curation matters more than tool quantity."
4. **Deterministic middleware wrapping LLM loops**: Three hooks ensure safety-critical operations (message injection, PR creation, error handling) execute deterministically regardless of LLM behavior.
5. **Thread-based state routing**: Deterministic thread IDs route follow-up messages to the correct running agent instance. Enables real-time human-agent interaction during task execution.
6. **AGENTS.md context injection**: Repository-specific conventions loaded into system prompts, validating the AGENTS.md protocol convention.
7. **Source context pre-loading**: Full issue descriptions and thread histories are pre-loaded rather than forcing the agent to discover them.

### Invocation Patterns

- **Slack**: Mention `@openswe` with optional `repo:owner/name` syntax. Agent reacts with emoji, replies in thread.
- **Linear**: Comment `@openswe` on issues. Agent reacts with eye emoji, posts updates as Linear comments.
- **GitHub**: Tag `@openswe` in PR comments for review feedback addressing.
- **Follow-up**: Send additional messages in the same thread while agent is running — routed to the active instance via `check_message_queue_before_model` middleware.

### Validation Strategy

Prompt-driven validation: the agent is instructed to run linters, formatters, and tests as part of its workflow. The `open_pr_if_needed` middleware acts as a deterministic backstop — if the agent forgets or fails to create a PR, the middleware creates it automatically.

---

## Publisher Background

LangChain (Harrison Chase, CEO) is the most well-funded LLM application framework company ($240M+ raised from Sequoia/Benchmark). Their ecosystem includes LangChain (100K+ stars), LangGraph (10K+ stars), Deep Agents (10K stars), and LangSmith (commercial observability). Open SWE represents the productized deployment of their Deep Agents harness — showing how to turn an agent framework into an always-on enterprise service. The project references Stripe, Ramp, and Coinbase as architectural inspirations, positioning it as the open-source version of what these companies built internally.

---

## What's Valuable for Us

### 1. Deterministic Middleware Pattern (Adopt Concept)
The three middleware hooks wrapping the agent loop are a clean implementation of our Master Blueprint Principle #2. The `open_pr_if_needed` backstop is particularly valuable — our orchestrator should have equivalent deterministic safety nets that ensure critical operations (PR creation, state file updates, devlog entries) happen even when the LLM agent fails to trigger them.

### 2. Multi-Channel Invocation with Thread Routing (Phase 3+)
The pattern of receiving tasks from Slack/Linear/GitHub and routing follow-up messages to running agent instances via deterministic thread IDs is the professional interface our orchestrator currently lacks. When we add Slack/Linear triggers for client work, this architecture is the reference design.

### 3. Subagent Spawning via Deep Agents `task` Tool
The native subagent spawning (child agents for parallel subtask orchestration) validates our multi-worker approach. The key difference: they spawn subagents within the same sandbox; we spawn separate tmux windows with worktree isolation. Their approach is simpler; ours provides stronger isolation.

### 4. AGENTS.md Convention Validation
Open SWE's use of AGENTS.md files for per-repo agent instructions is another high-profile validation of this convention (already catalogued). 60K+ repos now use this pattern.

### 5. Curated Toolset Philosophy
The intentional limitation to ~15 tools echoes patterns from 12 Factor Agents. Worth studying their specific tool selection (especially `fetch_url`, `http_request` as additions to standard file/shell tools) for our worker agents.

---

## What's NOT Relevant

- **Python/LangChain/LangGraph stack**: Conflicts with our TypeScript-native architecture. Patterns are transferable; code is not.
- **Cloud sandbox providers (Modal/Daytona/Runloop)**: We use local tmux + git worktrees for agent isolation. Cloud sandboxes add infrastructure, cost, and latency.
- **LangSmith dependency**: Our observability is Langfuse + ccusage. LangSmith is LangChain's commercial platform.
- **Slack/Linear bot integration code**: We don't currently use these channels. The pattern is valuable; the Python implementation is not portable.
- **Deep Agents framework internals**: Already catalogued separately. Open SWE is a deployment/productization layer on top of Deep Agents, not a new harness.

---

## Competitive Comparison

| Feature | Open SWE | Deep Agents | Claude Code | Our L-Thread v3 |
|---------|----------|-------------|-------------|-----------------|
| Language | Python | Python | TypeScript | Bash/TS |
| Stars | 7,800 | 10,040 | N/A | N/A |
| Invocation | Slack/Linear/GitHub | CLI/ACP | CLI/SDK | tmux send-keys |
| Sandbox | Modal/Daytona/Runloop | Pluggable backend | Local FS | tmux + worktree |
| Subagents | Deep Agents `task` | Native | Agent Teams | tmux windows |
| Middleware | 3 deterministic hooks | 9 middleware layers | 18 hooks | 2 scripts |
| PR creation | Automatic + backstop | Manual | Manual | Agent-driven |
| Follow-up messaging | Thread-routed | N/A | N/A | tmux capture-pane |
| Model default | claude-opus-4-6 | Configurable | Claude | Claude |
| Headless/service mode | Yes (always-on) | CLI | CLI/SDK | tmux (headless) |

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the deterministic middleware pattern and implement equivalent safety nets in our orchestrator loop (PR backstop, state file backstop, devlog backstop). Low-effort, high-impact resilience improvement.
- **Phase 3 (Days 60-90)**: When adding Slack/Linear triggers for client-facing agent invocation, Open SWE's multi-channel architecture with thread-based routing is the reference design. The invocation layer is separable from the LangChain stack.
- **Phase 3 (Days 60-90)**: Evaluate the curated toolset (~15 tools) against our worker agent tool allowlist. Consider adding `fetch_url` and `http_request` for workers that need web access.
- **Phase 4 (Days 90+)**: If deploying agents as always-on services (SaaS factory pattern), Open SWE's architecture (channel → router → sandbox → PR) is the deployment blueprint.

---

## Key Takeaway

> **Open SWE is LangChain's productized enterprise coding agent — the open-source version of Stripe Minions/Ramp Inspect/Coinbase Cloudbot. Its three-middleware deterministic safety net (message queue + PR backstop + error handling) wrapping the LLM loop is a clean implementation of our 70/30 principle. The multi-channel invocation pattern (Slack/Linear/GitHub with thread-based routing) is the reference design for our Phase 3 client-facing agent interface. Study the architecture; don't adopt the Python/LangChain stack.**
