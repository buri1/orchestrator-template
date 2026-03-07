# Master Synthesis: Dotta's Network & Multi-Agent Intelligence

**Date:** 2026-03-05
**Source:** 19 research agents analyzing 107 multi-agent-relevant accounts from @dotta's X following
**Scope:** Multi-agent orchestration landscape, Pi Agent migration strategy, protocol convergence
**Classification:** Strategic intelligence for L-Thread Orchestrator -> Pi Agent migration

---

## 1. Executive Summary

Dotta's X following list is not a social graph -- it is a live map of the multi-agent orchestration frontier in March 2026. Of the 107 accounts identified as relevant to multi-agent intelligence, clear convergence emerges across five axes: (1) the "harness over framework" consensus, (2) context window management as the central engineering challenge, (3) protocol stack convergence around MCP + A2A + x402 + ERC-8004, (4) the surprising cross-pollination between crypto-native agent economies and developer tooling, and (5) the philosophical split between single-agent maximalists and orchestration pragmatists.

Pi Agent, created by Mario Zechner (@badaboroc), sits at the epicenter of this landscape. With OpenClaw -- an ecosystem that has amassed 250K+ GitHub stars -- validating Pi as its core harness, Pi has become the de facto open-source alternative to Claude Code for custom agent development. Yet Mario is philosophically opposed to multi-agent orchestration, preferring single-agent workflows with better tooling. This creates a strategic tension: the community has already built 6+ multi-agent approaches on top of Pi despite Mario's stance, and dotta himself runs Paperclip -- a "zero-human company" framework built on orchestration principles that Pi does not natively support.

The data reveals that Andrej Karpathy's framing has won: "agentic engineering" has replaced "vibe coding" as the serious practitioner term. Geoffrey Huntley's insight that "the context window is malloc without free" captures the central technical challenge -- every agent framework that survives does so by solving context management. Steipete's principle of "CLIs over MCPs" (the gh CLI has zero context cost vs MCP's overhead) reflects the pragmatic optimization that separates production systems from demos.

Key quantitative signals: Pi's MCP adapter achieves ~200 tokens vs 18K+ for raw MCP tool descriptions (a 90x compression). MorphLLM's Fast Apply hits 10,500 tokens/second (60x faster than standard apply). DSPy's GEPA optimizer outperforms RL by 6-20% with 35x fewer rollouts. Moltbook's finding that 93% of agents fail to respond without orchestration proves that multi-agent coordination is not optional -- it is existential. VoxYZ demonstrated 6 agents generating $75K in consulting revenue in 3 hours at $8/month infrastructure cost.

For the L-Thread Orchestrator migration: Pi Agent is the correct bet, but it requires building an orchestration layer that Mario will not build himself. The path is clear -- use Pi as the single-agent harness, build the orchestration shim externally (following the "progressively deletable infrastructure" pattern), and leverage the protocol stack (MCP + A2A) for inter-agent communication. The OpenClaw ecosystem validates this architecture at scale.

---

## 2. The 10 Universal Laws of Multi-Agent Orchestration

These principles appear across 3+ independent sources in dotta's network.

| # | Law | Confirming Sources |
|---|-----|--------------------|
| 1 | **Harness Over Framework** -- Build thin, progressively deletable infrastructure around LLMs; never lock into a framework. | Karpathy ("agentic engineering"), steipete (custom tooling), Mario/Pi (minimal harness), Huntley (context-first), dotta (Paperclip) |
| 2 | **Context Window is the Bottleneck** -- "malloc without free" -- every token matters. The winning system is the one that wastes the fewest tokens on overhead. | Huntley (explicit malloc analogy), Pi MCP adapter (200 vs 18K tokens), steipete (CLIs over MCPs), OpenClaw (tiered context) |
| 3 | **Orchestration is Not Optional** -- Without explicit coordination, agents fail silently. 93% non-response rate without orchestration (Moltbook). | Moltbook (93% failure), dotta/Paperclip (heartbeat execution), L-Thread Orchestrator (state-driven), VoxYZ (6-agent coordination) |
| 4 | **Budget as Safety Rail** -- Financial limits are the most reliable safety mechanism for autonomous agents. Set spend caps, not just permission boundaries. | Dotta/Paperclip (budget-as-safety), OWASP (80% risky behaviors), x402 (payment protocol), ERC-8004 (on-chain budget enforcement) |
| 5 | **CLIs Over MCPs for Known Tools** -- When a CLI exists (gh, npm, git), use it directly. MCP adds latency and token overhead for no gain on stable interfaces. | Steipete (zero context cost), Pi (tool optimization), Huntley (minimize overhead) |
| 6 | **Event-Driven Over Polling** -- Never `sleep` and check. Use heartbeats, webhooks, or event streams. Polling wastes cycles and creates race conditions. | Dotta/Paperclip (heartbeat pattern), L-Thread (terminal-wait), OWASP (timing attacks via polling) |
| 7 | **Single Agent First, Orchestrate When Forced** -- Start with one agent doing everything. Split only when context limits, specialization needs, or parallelism demands it. | Mario/Pi (anti-multi-agent philosophy), Karpathy (agent maximalism), steipete (single-agent preference), community (pragmatic splitting) |
| 8 | **State Externalization is Mandatory** -- Agent memory is ephemeral. Persist state in JSON/DB outside the agent. Recovery = re-read state + resume. | L-Thread (JSON state files), Paperclip (persistent state), OpenClaw (tiered context), tmux recovery (session persistence) |
| 9 | **The Protocol Stack is Converging** -- MCP (tool calling) + A2A (agent-to-agent) + x402 (payment) + ERC-8004 (on-chain identity) form the complete stack. Fighting this convergence is wasted energy. | Google (A2A), Anthropic (MCP), Coinbase (x402), ERC-8004 (identity), dotta (all four) |
| 10 | **Test at the E2E Level** -- Unit tests for agents are nearly meaningless. Only end-to-end, in-browser, real-environment tests validate agent behavior. | L-Thread (Chrome DevTools gate), Huntley (E2E-first), OpenClaw (integration testing), OWASP (behavioral testing) |

---

## 3. The Landscape Map

```
                        MULTI-AGENT ORCHESTRATION LANDSCAPE (March 2026)
                        ================================================

    PHILOSOPHY AXIS
    Single-Agent Maximalist ◄──────────────────────────────► Multi-Agent Native

    Mario/Pi            Karpathy           steipete          dotta/Paperclip
    "One agent,         "Agentic eng,      "Pragmatic        "Zero-human
     better tools"       not vibes"         splitting"        companies"

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                          HARNESS LAYER                                 │
    │                                                                        │
    │   Pi Agent ◄───────── OpenClaw (250K+ stars) ──────► Claude Code       │
    │   (Mario)              (steipete → OpenAI)           (Anthropic)       │
    │     │                        │                            │            │
    │     │    OpenCode            │         Aider              │            │
    │     │    (community)         │         (Paul Gauthier)    │            │
    │     └────────┬───────────────┘                            │            │
    │              │                                            │            │
    │   ┌──────────▼──────────────────────────────────────────┐ │            │
    │   │           ORCHESTRATION LAYER                       │ │            │
    │   │                                                     │ │            │
    │   │  L-Thread        Paperclip       Gas Town           │ │            │
    │   │  Orchestrator    (dotta)         (dotta)            │ │            │
    │   │  [tmux/conduit]  [heartbeat]     [crypto agents]    │ │            │
    │   │                                                     │ │            │
    │   │  Swarms          LangGraph       DSPy               │ │            │
    │   │  (1000s agents)  (graph DAG)     (GEPA optimizer)   │ │            │
    │   └─────────────────────────────────────────────────────┘ │            │
    │                                                           │            │
    │   ┌───────────────────────────────────────────────────────▼──────────┐ │
    │   │                    PROTOCOL LAYER                               │ │
    │   │                                                                 │ │
    │   │  MCP (Tool Calling)  ◄──►  A2A (Agent-to-Agent, Google)        │ │
    │   │       │                           │                             │ │
    │   │       ▼                           ▼                             │ │
    │   │  x402 (Payment)  ◄──────►  ERC-8004 (On-Chain Identity)        │ │
    │   │       │                           │                             │ │
    │   │       └───────────┬───────────────┘                             │ │
    │   │                   ▼                                             │ │
    │   │           AGENTS.md (Discovery)                                 │ │
    │   └─────────────────────────────────────────────────────────────────┘ │
    │                                                                        │
    │   ┌────────────────────────────────────────────────────────────────┐   │
    │   │                   OPTIMIZATION LAYER                           │   │
    │   │                                                                │   │
    │   │  MorphLLM Fast Apply (10,500 tok/s)    Letta (memory mgmt)    │   │
    │   │  Pi MCP Adapter (~200 tok)             DSPy GEPA (6-20% ↑)   │   │
    │   │  Speculative Edits                     Context Compression     │   │
    │   └────────────────────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────────────────┘

    CRYPTO CROSSOVER:  Gas Town ←── ERC-8004 ←── x402 ←── Coinbase
                       Virtuals    ElizaOS      NEAR      Farcaster
```

---

## 4. Pi Agent as Custom Harness: Strengths & Risks

### Mario's Anti-Multi-Agent Stance

Mario Zechner is philosophically opposed to multi-agent orchestration. His position: a single agent with better tools, better context management, and better prompting outperforms any multi-agent system. Pi Agent reflects this -- it is designed as a single-agent harness with no native support for agent spawning, inter-agent communication, or shared state.

This is not ignorance. Mario has thought deeply about the problem and concluded that the complexity overhead of multi-agent coordination (context duplication, communication latency, state synchronization, error cascading) exceeds the benefits in most cases.

### Community Workarounds (6+ Approaches)

Despite Mario's stance, the community has built multi-agent patterns on top of Pi:

1. **tmux-based spawning** -- Run multiple Pi instances in tmux panes, coordinate via file system (L-Thread approach)
2. **Process-level orchestration** -- Shell scripts spawning Pi processes with shared working directories
3. **MCP bridge pattern** -- Use Pi's MCP adapter to expose one Pi instance as a tool to another
4. **Git-as-communication** -- Agents commit to branches, orchestrator merges (OpenClaw pattern)
5. **File-system mailbox** -- Agents read/write JSON files in a shared directory for async communication
6. **External orchestrator** -- Separate process (Python/Node) managing Pi instances via stdin/stdout

### OpenClaw Validation

OpenClaw's 250K+ GitHub stars represent the largest validation of Pi as a harness. Key architectural choices from OpenClaw that validate the Pi bet:

- **Tiered context management** -- OpenClaw solves Pi's context limitations through external context tiers
- **Community-driven extension** -- The ecosystem built what Mario would not, proving Pi is extensible
- **steipete's involvement** -- Before joining OpenAI, steipete was a core contributor, lending production-grade engineering sensibility
- **Scale proof** -- OpenClaw runs multi-agent workflows at scale, proving Pi can support them even without native multi-agent features

### The Strategic Tension

The tension is productive. Mario's minimalism means Pi stays lean and fast. The community builds orchestration externally. This mirrors the Unix philosophy: do one thing well, compose at the shell level. The risk is that Mario makes a breaking change that disrupts community patterns, or that a competitor (Claude Code, OpenCode) adds native multi-agent support that makes the external orchestration approach feel clunky.

---

## 5. The Top 20 Patterns to Steal

Ranked by impact for the Pi orchestrator migration.

| Rank | Pattern | Source | Description | Difficulty | Impact |
|------|---------|--------|-------------|------------|--------|
| 1 | **Heartbeat Execution** | Dotta/Paperclip | Agents emit heartbeats; orchestrator kills non-responsive agents after timeout. Solves the 93% non-response problem. | Medium | Critical |
| 2 | **Budget-as-Safety** | Dotta/Paperclip | Hard dollar caps per agent per task. Agent dies when budget exhausted. Most reliable safety mechanism. | Low | Critical |
| 3 | **MCP Token Compression** | Pi MCP Adapter | ~200 tokens vs 18K+ for raw MCP. Compress tool descriptions to minimum viable context. | Low | Critical |
| 4 | **CLI-First Tool Access** | Steipete | Use `gh`, `npm`, `git` directly instead of wrapping in MCP. Zero context overhead for known tools. | Low | High |
| 5 | **External State Files** | L-Thread | JSON state files outside agent memory. Agent crash = re-read state + resume. No lost progress. | Low | High |
| 6 | **Tiered Context** | OpenClaw | Layer 0: system prompt. Layer 1: task-specific. Layer 2: file-level. Layer 3: on-demand retrieval. Never load everything at once. | Medium | High |
| 7 | **Fast Apply** | MorphLLM | 10,500 tok/s speculative application of edits. 60x faster than standard. Critical for agent speed loops. | Medium | High |
| 8 | **Git-as-Communication** | OpenClaw | Agents work on branches. Orchestrator manages merges. Git history = audit trail. Conflict resolution = orchestrator responsibility. | Medium | High |
| 9 | **GEPA Optimization** | DSPy | Outperforms RL by 6-20% with 35x fewer rollouts. Use for prompt optimization in the orchestrator. | High | High |
| 10 | **tmux Session Persistence** | L-Thread | tmux sessions survive terminal crashes. State recovery via capture-pane + state files. | Low | Medium |
| 11 | **AGENTS.md Discovery** | Community | Place AGENTS.md at repo root describing available agents. Other agents/tools discover capabilities via this file. | Low | Medium |
| 12 | **Progressively Deletable Infra** | Karpathy/consensus | Build orchestration so any layer can be removed without breaking the system. No deep coupling. | Medium | Medium |
| 13 | **E2E Chrome DevTools Gate** | L-Thread | No task marked "done" without browser-level verification. Chrome DevTools MCP as testing oracle. | Medium | Medium |
| 14 | **Context Window Compaction** | Huntley | Pre-compact hooks that summarize conversation before context overflow. Handoff documents preserve essential state. | Medium | Medium |
| 15 | **A2A Protocol Bridge** | Google A2A | Use A2A for inter-agent communication when agents run on different machines or in different processes. | High | Medium |
| 16 | **x402 Payment Rails** | Coinbase | Agents pay for API calls and services via x402. Enables autonomous agent economies. | High | Medium |
| 17 | **Speculative Edits** | Multiple | Apply edits optimistically, verify after. Faster than confirm-before-apply in most cases. | Medium | Medium |
| 18 | **Error Cascade Breakers** | OWASP | When agent A fails, don't let the error propagate to B and C. Isolate failures. Log + skip + continue. | Medium | Medium |
| 19 | **Memory Externalization** | Letta | Long-term memory outside the context window. Retrieve relevant memories per task, not per conversation. | High | Low |
| 20 | **Multi-Model Routing** | VoxYZ | Route tasks to appropriate models (fast/cheap for simple, powerful for complex). Not all tasks need Opus. | Medium | Low |

---

## 6. Hidden Gems & Non-Obvious Connections

### Crypto Agents and Coding Orchestration: Convergent Evolution

The most surprising finding across the 19 research agents is the deep cross-pollination between crypto-native autonomous agents and developer coding orchestration. These communities independently converged on identical architectural patterns:

**Shared patterns discovered:**

- **Budget-as-safety** originated in crypto agents (where agents hold wallets) and migrated to coding agents (where agents consume API credits). Dotta bridges both worlds -- Paperclip uses budget limits from his Gas Town / crypto agent work.

- **Heartbeat monitoring** appears in both Ethereum validator monitoring and agent liveness checking. The mechanism is identical: emit a signal on a cadence, kill the process if signals stop.

- **State machines for workflow** -- Both DeFi transaction flows and multi-step coding tasks use finite state machines. The L-Thread JSON state file pattern maps directly to on-chain state transitions.

- **ERC-8004 agent identity** solves the same problem as AGENTS.md -- how does one agent discover another's capabilities? ERC-8004 does it on-chain; AGENTS.md does it on-filesystem. The abstraction is identical.

### The steipete -> OpenAI Pipeline

Steipete (Peter Steinberger) joined OpenAI after being a core contributor to the OpenClaw/Pi ecosystem. This is significant: OpenAI now has direct knowledge of the community's most successful open-source agent patterns. Expect OpenAI's agent tooling to incorporate lessons from Pi/OpenClaw within 6-12 months.

### Moltbook's 93% Failure Rate

Moltbook's research showing 93% agent non-response rates without orchestration is the single most important statistic in this synthesis. It mathematically proves that multi-agent orchestration is not a "nice to have" -- it is the difference between a working system and one that fails 93% of the time. This directly refutes the "just spawn agents and let them figure it out" approach.

### VoxYZ: The Economic Proof Point

VoxYZ's demonstration -- 6 agents, $8/month infrastructure, $75K consulting revenue in 3 hours -- provides the economic validation. The ROI on orchestration is not theoretical. At $8/month cost and $75K/3hr revenue, the question is not whether to orchestrate but how fast you can scale orchestration.

### Karpathy's Reframing

Andrej Karpathy's shift from "vibe coding" to "agentic engineering" is not just semantic. It signals that the field has matured past the experimental phase. "Engineering" implies reproducibility, testing, reliability -- exactly the properties that orchestration provides. This reframing gives institutional permission to invest seriously in agent infrastructure.

---

## 7. The Protocol Stack

```
    THE CONVERGING AGENT ECONOMY PROTOCOL STACK
    =============================================

    Layer 5: DISCOVERY
    ┌─────────────────────────────────────────┐
    │  AGENTS.md      ERC-8004 (On-Chain)     │
    │  (filesystem)   (blockchain identity)    │
    │                                          │
    │  "What can you do? How do I reach you?"  │
    └──────────────────┬──────────────────────┘
                       │
    Layer 4: COMMUNICATION
    ┌──────────────────▼──────────────────────┐
    │  A2A (Google Agent-to-Agent Protocol)    │
    │                                          │
    │  Agent cards, task lifecycle, streaming   │
    │  "I need X done. Here is the task spec." │
    └──────────────────┬──────────────────────┘
                       │
    Layer 3: TOOL USE
    ┌──────────────────▼──────────────────────┐
    │  MCP (Model Context Protocol)            │
    │                                          │
    │  Tool descriptions, invocations, results │
    │  "Call this function with these params."  │
    └──────────────────┬──────────────────────┘
                       │
    Layer 2: PAYMENT
    ┌──────────────────▼──────────────────────┐
    │  x402 (Coinbase HTTP Payment Protocol)   │
    │                                          │
    │  402 Payment Required → pay → access     │
    │  "This API call costs 0.001 USDC."       │
    └──────────────────┬──────────────────────┘
                       │
    Layer 1: EXECUTION
    ┌──────────────────▼──────────────────────┐
    │  Harness (Pi Agent / Claude Code / etc)  │
    │                                          │
    │  LLM ↔ Tool loop, context management,    │
    │  file I/O, terminal access               │
    └─────────────────────────────────────────┘
```

**Protocol maturity assessment:**

| Protocol | Maturity | Adoption | Risk |
|----------|----------|----------|------|
| MCP | Production | Wide (Anthropic, community) | Low -- already standard |
| A2A | Early Production | Growing (Google-backed) | Medium -- competing with MCP extensions |
| x402 | Beta | Narrow (crypto-adjacent) | High -- requires crypto infrastructure |
| ERC-8004 | Proposal | Minimal | High -- dependent on blockchain adoption |
| AGENTS.md | Convention | Growing | Low -- simple file, no infrastructure |

**Key insight:** MCP and A2A are complementary, not competing. MCP handles tool calling (agent-to-tool). A2A handles agent-to-agent delegation. Together they cover the full communication space. x402 and ERC-8004 add economic layers that enable autonomous agent economies but are not required for developer orchestration use cases.

**For the Pi orchestrator:** Implement MCP (via Pi's native adapter at ~200 tokens) and AGENTS.md (zero cost) immediately. Evaluate A2A when inter-process agent communication becomes a bottleneck. Defer x402/ERC-8004 unless building autonomous economic agents.

---

## 8. Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Mario makes breaking Pi change that disrupts orchestration patterns** | Medium | High | Pin Pi version. Maintain fork. Keep orchestration layer loosely coupled. |
| **Claude Code adds native multi-agent support** | High | Medium | If Anthropic builds it well, migrate. L-Thread patterns are framework-agnostic. The orchestration logic (state machines, heartbeats, budget) transfers to any harness. |
| **OpenClaw fragments or steipete's departure destabilizes ecosystem** | Medium | Medium | OpenClaw has 250K+ stars and broad contributor base. Single-person risk is mitigated by community size. |
| **Context window costs make multi-agent economically unfeasible** | Low | High | MCP compression (~200 tokens) and tiered context management keep costs manageable. Token costs trending down industry-wide. |
| **A2A vs MCP extension war creates protocol fragmentation** | Medium | Medium | Build on MCP (established) and treat A2A as optional upgrade path. Do not depend on either for core orchestration. |
| **OWASP-class security vulnerabilities in agent orchestration** | High | High | 80% of orgs report risky agent behaviors with only 21% visibility. Implement budget-as-safety, E2E testing gate, and error cascade breakers from day one. |
| **Pi ecosystem captured by competitor (OpenAI via steipete)** | Low | High | Pi is open source. Community fork is always possible. Maintain vendor-neutral orchestration layer. |
| **"Zero-human company" backlash causes regulatory pressure** | Medium | Low | Orchestrator is a developer tool, not an autonomous business. Regulatory risk affects Paperclip/Gas Town more than developer tooling. |
| **Agent non-response cascades (93% Moltbook rate)** | High (without mitigation) | Critical | Heartbeat execution + timeout kills + fallback routing. This is the #1 operational risk. |
| **Vendor lock-in to single LLM provider** | Medium | Medium | Pi supports multiple backends. Design orchestrator to be model-agnostic. Use multi-model routing (VoxYZ pattern). |

---

## 9. Recommended Architecture

### P0: Immediate (Week 1-2)

These are non-negotiable foundations.

1. **Pi Agent as single-agent harness** -- Install Pi, configure MCP adapter (~200 token compression), validate basic tool calling workflow.

2. **External state files** -- Port L-Thread JSON state pattern to Pi. `orchestrator-state.json` with task queue, agent status, progress tracking. Agent crash recovery = re-read state.

3. **Heartbeat execution** -- Every spawned Pi instance emits heartbeat to a shared file/socket. Orchestrator kills non-responsive agents after configurable timeout (start with 30 seconds). This alone addresses the 93% non-response problem.

4. **Budget-as-safety** -- Hard token/dollar cap per agent per task. Agent terminates when budget exhausted. Track via API usage logging.

5. **CLI-first tool access** -- Configure Pi to use `gh`, `git`, `npm` directly. Do not wrap stable CLIs in MCP. Reserve MCP for dynamic/custom tools only.

### P1: Core Orchestration (Week 3-4)

6. **tmux-based multi-agent spawning** -- Migrate L-Thread tmux patterns to Pi. Each agent = one tmux pane. Orchestrator reads pane output via `tmux capture-pane`.

7. **Tiered context management** -- Implement OpenClaw-style context tiers. System prompt (always loaded) -> task context (loaded per task) -> file context (loaded on demand) -> retrieval context (searched when needed).

8. **E2E testing gate** -- No task marked complete without Chrome DevTools MCP verification. Port L-Thread's E2E gate pattern.

9. **Error cascade breakers** -- When agent fails, log the failure, skip the task, continue with next. Never let one agent's failure cascade to the entire system.

10. **AGENTS.md discovery** -- Place AGENTS.md at repo root describing available agent roles and capabilities. Orchestrator reads this for task routing.

### P2: Advanced (Month 2+)

11. **A2A protocol bridge** -- When agents need cross-process communication (e.g., frontend agent talking to backend agent), implement A2A protocol for structured task delegation.

12. **Git-as-communication** -- For long-running multi-agent tasks, use git branches as agent workspaces. Orchestrator manages merge strategy.

13. **GEPA prompt optimization** -- Use DSPy's GEPA to optimize orchestrator and agent prompts. 6-20% improvement with 35x fewer rollouts is significant for production systems.

14. **MorphLLM Fast Apply integration** -- For file editing operations, route through MorphLLM for 10,500 tok/s apply speed. 60x improvement on the critical path.

15. **Multi-model routing** -- Route simple tasks (file listing, grep, status checks) to fast/cheap models. Reserve Opus-class models for reasoning-heavy tasks.

16. **Memory externalization** -- Implement Letta-style long-term memory for cross-session knowledge persistence. Agent learns from past tasks.

### Architecture Diagram

```
    PI ORCHESTRATOR TARGET ARCHITECTURE
    ====================================

    ┌─────────────────────────────────────────────┐
    │           ORCHESTRATOR PROCESS               │
    │                                              │
    │  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
    │  │ State    │  │ Heartbeat│  │ Budget    │  │
    │  │ Manager  │  │ Monitor  │  │ Enforcer  │  │
    │  │ (JSON)   │  │ (events) │  │ (caps)    │  │
    │  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
    │       │              │              │         │
    │  ┌────▼──────────────▼──────────────▼──────┐  │
    │  │         TASK ROUTER / SCHEDULER          │  │
    │  │   (reads AGENTS.md, assigns tasks)       │  │
    │  └────┬──────────┬──────────┬──────────┬──┘  │
    │       │          │          │          │      │
    └───────┼──────────┼──────────┼──────────┼──────┘
            │          │          │          │
    ┌───────▼──┐ ┌─────▼────┐ ┌──▼───────┐ ┌▼─────────┐
    │ Pi Agent │ │ Pi Agent │ │ Pi Agent │ │ Pi Agent │
    │ (tmux 1) │ │ (tmux 2) │ │ (tmux 3) │ │ (tmux 4) │
    │          │ │          │ │          │ │          │
    │ Frontend │ │ Backend  │ │ Testing  │ │ Review   │
    │ Tasks    │ │ Tasks    │ │ Tasks    │ │ Tasks    │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
         │            │            │            │
         └────────────┴─────┬──────┴────────────┘
                            │
                   ┌────────▼────────┐
                   │   Shared File   │
                   │   System +      │
                   │   Git Repo      │
                   │   (communication│
                   │    + state)      │
                   └─────────────────┘
```

---

## 10. Research Index

| # | Document | Topic | Key Finding |
|---|----------|-------|-------------|
| 1 | `2026-03-05_openclaw-ecosystem-research.md` | OpenClaw / Pi ecosystem | 250K+ GitHub stars; steipete joined OpenAI; tiered context as core pattern |
| 2 | `2026-03-05_pi-agent-mario-zechner-deepdive.md` | Pi Agent creator profile | Philosophically anti-multi-agent; community built 6+ workarounds anyway |
| 3 | `2026-03-05_steipete-agent-philosophy.md` | Peter Steinberger's approach | "CLIs over MCPs" -- gh CLI has zero context cost; pragmatic tool selection |
| 4 | `2026-03-05_dotta-agent-orchestrator-profile.md` | Dotta's orchestration work | Paperclip = zero-human companies; heartbeat execution; budget-as-safety |
| 5 | `2026-03-05_geoffrey-huntley-agent-practices.md` | Context management expert | "Context window = malloc without free"; compaction hooks; handoff documents |
| 6 | `2026-03-05_karpathy-agentic-engineering.md` | Industry framing | "Agentic engineering" replaces "vibe coding"; signals field maturation |
| 7 | `2026-03-05_mcp-protocol-landscape.md` | MCP ecosystem analysis | Pi MCP adapter: ~200 tokens vs 18K+ raw; 90x compression is transformative |
| 8 | `2026-03-05_a2a-google-protocol-analysis.md` | A2A protocol deep dive | Agent cards, task lifecycle, streaming; complementary to MCP, not competing |
| 9 | `2026-03-05_morphllm-fast-apply-research.md` | Code application speed | 10,500 tok/s Fast Apply; 60x improvement; critical for agent edit loops |
| 10 | `2026-03-05_dspy-gepa-optimizer-research.md` | Prompt optimization | GEPA outperforms RL by 6-20% with 35x fewer rollouts; applicable to agent prompts |
| 11 | `2026-03-05_moltbook-agent-failure-research.md` | Agent reliability data | 93% non-response rate without orchestration; mathematical proof orchestration is required |
| 12 | `2026-03-05_voxyz-multi-agent-economics.md` | Economic validation | 6 agents, $8/month, $75K in 3 hours; ROI proof for orchestration investment |
| 13 | `2026-03-05_owasp-agentic-security.md` | Security analysis | 80% risky behaviors, 21% visibility; budget-as-safety and E2E testing are non-negotiable |
| 14 | `2026-03-05_x402-payment-protocol.md` | Agent payment rails | HTTP 402-based payments; enables autonomous agent economies; crypto dependency is risk |
| 15 | `2026-03-05_erc8004-agent-identity.md` | On-chain agent identity | Agent discovery and capability advertisement on-chain; early stage but architecturally sound |
| 16 | `2026-03-05_gastown-crypto-agents.md` | Crypto x coding crossover | Budget-as-safety pattern originated here; convergent evolution with coding agents |
| 17 | `2026-03-05_swarms-framework-analysis.md` | Large-scale agent swarms | 1000+ agent coordination; relevant for scale but overkill for 2-5 agent developer workflows |
| 18 | `2026-03-05_langgraph-dspy-comparison.md` | Framework comparison | Graph DAGs vs prompt optimization; both useful at different layers of the stack |
| 19 | `2026-03-05_claude-code-gaps-analysis.md` | Claude Code limitations | No session resumption, no nesting, 10-agent cap; gaps that Pi orchestrator must fill |

---

## Appendix: Key Quotes

> "The context window is malloc without free." -- Geoffrey Huntley

> "CLIs over MCPs -- the gh CLI has zero context cost." -- steipete

> "Agentic engineering, not vibe coding." -- Andrej Karpathy

> "Harness over framework -- build progressively deletable infrastructure." -- Industry consensus

> "93% of agents fail to respond without orchestration." -- Moltbook research

> "Budget is the best safety rail." -- dotta (Paperclip)

---

*Synthesized from 19 research agents. 107 accounts analyzed from @dotta's X following. Research conducted 2026-03-05.*
*Master synthesis agent: Claude Opus 4.6*
