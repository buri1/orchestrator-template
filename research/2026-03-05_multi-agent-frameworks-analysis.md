# Multi-Agent Frameworks & SDKs Analysis

**Date:** 2026-03-05
**Context:** Deep research on multi-agent frameworks followed by dotta -- assessing architectures, patterns, and portability to a lightweight prompt-engineering harness (Pi Agent / L-Thread Orchestrator).

---

## Table of Contents

1. [Swarms Framework](#1-swarms-framework)
2. [DSPy](#2-dspy)
3. [Agentica SDK](#3-agentica-sdk)
4. [LangChain / LangGraph](#4-langchain--langgraph)
5. [Letta AI (MemGPT)](#5-letta-ai-memgpt)
6. [Comparative Matrix](#6-comparative-matrix)
7. [Portable Patterns for Lightweight Harnesses](#7-portable-patterns-for-lightweight-harnesses)
8. [Heavy Frameworks vs Lightweight Harnesses: Trade-offs](#8-heavy-frameworks-vs-lightweight-harnesses-trade-offs)
9. [Recommendations for Pi Agent / L-Thread Orchestrator](#9-recommendations-for-pi-agent--l-thread-orchestrator)
10. [Sources](#10-sources)

---

## 1. Swarms Framework

**Creator:** Kye Gomez (@kyegomez) / @swarms_corp
**Stars:** 25K+ GitHub | **Followers:** 48K Twitter
**Tagline:** "Building The Infrastructure for The Agent Economy"

### Architecture Overview

Swarms is the heaviest-weight framework in this set -- a full enterprise-grade orchestration platform for managing dozens to hundreds of agents simultaneously. The core architectural insight is that different problems require different swarm topologies, so the framework provides a menu of pre-built orchestration patterns selectable via a single `SwarmRouter` abstraction.

```
                    +------------------+
                    |   SwarmRouter    |
                    | (Unified Entry)  |
                    +--------+---------+
                             |
          +------------------+------------------+
          |          |          |         |      |
    Sequential  Concurrent  MoA    Rearrange  GroupChat
      Flow        Flow     (Mix)   (einsum)   (Debate)
          |          |          |         |      |
     [A]->[B]->[C]  [A]       [A]    A->B,C   [A<->B]
                    [B]  =>   [B]  => D->A    [B<->C]
                    [C]       [C]              [A<->C]
                     |         |
                  concat   Aggregator
```

### Swarm Architectures

| Architecture | Pattern | Best For |
|---|---|---|
| **SequentialWorkflow** | A -> B -> C (linear chain) | Pipeline processing, ordered dependencies |
| **ConcurrentWorkflow** | A, B, C run in parallel | Independent analyses, speed-critical tasks |
| **MixtureOfAgents** | Parallel experts + aggregator | Synthesis from multiple perspectives |
| **AgentRearrange** | Einsum-inspired flow strings | Complex non-linear routing (e.g., "A->B,C") |
| **GroupChat** | Multi-way conversation | Debate, brainstorming, contract negotiation |
| **Hierarchical Swarm** | Boss delegates to sub-agents | Top-down task decomposition |
| **Council Pattern** | Peer review + synthesis | Collaborative answer quality |
| **SpreadSheetSwarm** | Tabular agent management | Batch operations across many agents |

### Agent Communication

- **Message passing** through shared communication layer
- **Shared memory** system for recording interactions/results across agents
- **Inter-agent wrappers** for Redis, DuckDB, Pulsar integration
- Communication modes: mesh (any-to-any), hierarchical (top-down), federated (independent systems sharing results)

### Error Handling & Scalability

- Built-in error handling, rate limiting, monitoring integration, audit logging
- Retry helpers for tool calls with structured error returns
- Thread-safe operations for concurrent swarm management
- Enterprise security features baked in

### Key Pattern: SwarmRouter as Universal Entry Point

```python
router = SwarmRouter(
    swarm_type="MixtureOfAgents",  # or Sequential, Concurrent, etc.
    agents=[agent1, agent2, agent3],
    aggregator_agent=synthesizer,
)
result = router.run(task="Analyze market trends")
```

One router class, many topologies. This is a powerful abstraction -- the caller doesn't need to understand the orchestration mechanics, just pick the right topology.

### Verdict

Swarms is maximally opinionated and maximally featured. It solves the "which orchestration pattern?" question by offering all of them behind a router. The cost is framework lock-in and a heavy dependency tree.

---

## 2. DSPy

**Creator:** Stanford NLP (Omar Khattab et al.) / @DSPyOSS
**Stars:** 20K+ GitHub | **Followers:** 12K Twitter
**Tagline:** "Programming -- not prompting -- language models"

### Architecture Overview

DSPy takes a fundamentally different approach: it treats LM interactions as **compilable programs** rather than prompt templates. Instead of writing prompts, you write Python modules with typed signatures, and DSPy's optimizers automatically generate the best prompts, few-shot examples, or fine-tuning data.

```
                 +------------------+
                 |   DSPy Program   |
                 |  (Python Code)   |
                 +--------+---------+
                          |
              +-----------+-----------+
              |                       |
        Modules (Logic)        Optimizers (Compile)
              |                       |
    +----+----+----+        +---------+---------+
    |    |    |    |        |         |         |
   CoT  ReAct Predict    MIPRO   Bootstrap   GEPA
   (reason) (tool) (basic)  (prompt)  (few-shot) (multi-agent)
```

### Core Concept: Signatures + Modules

```python
# Define WHAT, not HOW
class RAGAnswer(dspy.Signature):
    """Answer questions using retrieved context."""
    context: list[str] = dspy.InputField()
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()

# Use a module (the prompting strategy is abstracted)
cot = dspy.ChainOfThought(RAGAnswer)
result = cot(context=docs, question="What is X?")
```

### Multi-Agent via Composition

DSPy doesn't have an explicit "multi-agent" layer. Instead, modules compose:

- **ReAct agent** = reasoning + tool calling in a loop
- **Multi-agent RAG** = multiple ReAct sub-agents (each specialized) coordinated by a lead agent
- **GEPA optimizer** can optimize multi-agent pipeline prompts jointly

The key insight: in DSPy, the "orchestration" IS the program structure. You compose Python modules, and the framework optimizes the prompts for the composed system as a whole.

### Optimization / Compilation

This is DSPy's killer feature -- no other framework does this:

| Optimizer | What It Does |
|---|---|
| **BootstrapFewShot** | Generates few-shot examples from your data |
| **MIPROv2** | Jointly optimizes instructions + examples using Bayesian optimization |
| **GEPA** | Optimizes multi-agent pipelines (e.g., sub-agents + coordinator) |
| **BootstrapFinetune** | Generates training data for model fine-tuning |

The compilation step means: write your pipeline once, then DSPy finds the best prompts/weights automatically. Changing models? Re-compile. Changing metrics? Re-compile. No manual prompt engineering needed.

### Framework Overhead

DSPy has the **lowest framework overhead** measured at ~3.53ms, compared to LangChain (~10ms) and LangGraph (~14ms). It's lightweight by design because the complexity lives in the compile step, not the runtime.

### Verdict

DSPy is the most intellectually rigorous framework here. Its approach -- "programs over prompts, compilation over crafting" -- is philosophically aligned with the Bitter Lesson (scale computation, don't hand-craft). However, it requires ML thinking (metrics, optimization loops, training data) which makes it harder to adopt for pure software engineers.

---

## 3. Agentica SDK

**Creator:** Samchon (wrtnlabs) / @agenticasdk
**Stars:** ~2K GitHub | **Followers:** 1.9K Twitter
**Tagline:** "An agent framework for tool use and multi-agent"

### Architecture Overview

Agentica takes the most pragmatic approach: **if you can write TypeScript functions, you can build AI agents**. No graphs, no orchestration layers, no prompt engineering. The framework uses TypeScript's compiler and type system to automatically generate function calling schemas.

```
               +--------------------+
               |   @agentica/core   |
               +--------+-----------+
                        |
          +-------------+-------------+
          |             |             |
    TypeScript      Swagger/       MCP
    Classes        OpenAPI Docs   Servers
          |             |             |
   (Type inference)  (Schema parse) (Protocol)
          |             |             |
          +------+------+------+------+
                 |
          Function Calling
          (AI reads types,
           calls methods)
```

### How It Works

1. You bring TypeScript classes or Swagger/OpenAPI documents
2. Agentica's compiler extracts function signatures, parameter types, and documentation
3. The AI model receives these as available tools
4. The model calls the right functions based on conversation context

```typescript
import { Agentica } from "@agentica/core";

const agent = new Agentica({
    model: "chatgpt",
    functions: [MyService],  // Just pass your TypeScript class
});
```

### Multi-Agent Philosophy

Agentica's position: **you don't need complex agent graphs**. Instead of orchestrating agents, you orchestrate functions. The "multi-agent" aspect comes from:
- Connecting multiple backend services via their OpenAPI docs
- Composing function sets from different domains
- MCP integration for external tool connectivity

### Key Differentiator

Built on Samchon's **typia** library (20,000x faster JSON validation), Agentica uses compiler-level type analysis rather than runtime reflection. This means zero-overhead function schema generation.

### Verdict

Agentica is the anti-framework framework. It deliberately avoids orchestration complexity by betting that function calling + good types is sufficient. This is a bet on model capability -- as models get better at tool use, explicit orchestration becomes unnecessary. Aligns strongly with the Bitter Lesson.

---

## 4. LangChain / LangGraph

**Creator:** Harrison Chase / LangChain Inc.
**Key Person Followed:** @Vtrivedy10 (Virat Trivedy -- agents & evals @LangChain)
**Stars:** 100K+ GitHub | **Followers:** 2.9K (Virat)

### LangGraph Architecture (2026 Edition)

LangGraph has evolved significantly. In 2026, it's positioned as the **graph-first orchestration primitive** for building stateful, fault-tolerant multi-agent systems.

```
              +-------------------+
              |    StateGraph     |
              |  (Central State)  |
              +--------+----------+
                       |
          +------------+------------+
          |            |            |
       Node A      Node B      Node C
      (Agent)     (Agent)     (Agent)
          |            |            |
          +-----+------+------+-----+
                |             |
          Conditional     Checkpoint
            Edges          (Persist)
                |             |
          +-----+------+------+-----+
          |                         |
     Dynamic Routing          Fault Recovery
     (supervisor/handoff)    (resume from last OK)
```

### Key Patterns

**Supervisor Pattern:**
A central supervisor agent coordinates specialized workers. The supervisor decides which agent to invoke based on context, routes tasks, and aggregates results.

```
     +------------+
     | Supervisor |
     +-----+------+
           |
    +------+------+
    |      |      |
  Agent  Agent  Agent
  (SQL) (Search)(Code)
```

**Handoff Pattern:**
Agents dynamically pass control to each other via tool calls. Each agent has handoff tools that update state to activate the next agent. This enables fluid, context-aware transitions without a central coordinator.

```
  Agent A --handoff()--> Agent B --handoff()--> Agent C
     ^                                           |
     +------------handoff()----------------------+
```

**Message Bus Pattern (March 2026):**
New pattern where agents communicate via shared state rather than calling each other directly. Uses structured ACP-style message schemas for modularity and traceability.

```
  +--------+    +-------------+    +--------+
  |Planner | -> | Message Bus | -> |Executor|
  +--------+    | (Shared     | <- +--------+
  |Validator| <- | State)     |
  +---------+    +-------------+
```

### State Management & Checkpointing

This is LangGraph's strongest differentiator:

- **Checkpoints** saved at every super-step (graph execution boundary)
- **PostgresSaver** for production (data integrity through process restarts)
- **SqliteSaver** for local development/experimentation
- **Fault recovery:** if a node fails, resume from last successful step
- **Time travel:** replay past states for debugging non-deterministic agents
- **Human-in-the-loop:** pause at checkpoints for human approval

### Error Recovery

```
  Step 1 (OK) -> Step 2 (OK) -> Step 3 (FAIL)
                                    |
                          [Checkpoint at Step 2]
                                    |
                              Resume from Step 2
                              (skip re-running 1 & 2)
```

When a node fails mid-execution, LangGraph stores pending checkpoint writes from successfully completed nodes. On resumption, successful nodes aren't re-run.

### Verdict

LangGraph is the most mature production framework. Its checkpointing and fault recovery are unmatched. The trade-off: high abstraction overhead (~14ms per call), deep dependency tree, and API churn across versions. The framework's complexity grows with your use case -- simple tasks are simple, but production deployments require understanding StateGraph internals.

---

## 5. Letta AI (MemGPT)

**Creator:** Charles Packer et al. / @Letta_AI
**Stars:** 15K+ GitHub | **Followers:** 7.5K Twitter
**Tagline:** "Stateful agents that remember and learn"

### Architecture Overview

Letta solves a different problem than the others: **memory persistence**. While other frameworks focus on orchestration topology, Letta focuses on making agents that maintain state across sessions, learn from interactions, and improve over time.

```
              +-------------------+
              |    Letta Agent    |
              |  (Stateful Core)  |
              +--------+----------+
                       |
          +------------+------------+
          |            |            |
    Core Memory    Archival     Recall
    (In-Context)   Memory      Memory
    [~RAM]        [~Disk/VDB]  [~Log/Search]
          |            |            |
     Writeable     Vector DB    Conversation
     via tools    (long-term)    History
          |            |            |
          +------+-----+-----+-----+
                 |           |
          Context Window   Database
          Management      Persistence
```

### Memory Tier System

This is Letta's core innovation -- a tiered memory system inspired by computer architecture:

| Tier | Analogy | Description | Size | Access |
|---|---|---|---|---|
| **Core Memory** | RAM | Working context, key facts, user preferences | Fixed (in context window) | Read/write via tool calls |
| **Archival Memory** | Disk (SSD) | Long-term memories, external data, vector DB | Unlimited | Search via tool calls |
| **Recall Memory** | Log files | Full conversation history with date/text search | Unlimited | Query via tool calls |

The agent itself decides what to keep in-context vs. archive. This creates an **illusion of unlimited memory** within fixed context limits.

### Sleep-time Compute

Letta's most novel feature -- agents that work while "sleeping":

```
  User Conversation (Active)
         |
         | (every N steps)
         v
  +------------------+
  | Sleep-time Agent |  <-- Runs in background
  | (Shares memory)  |
  +--------+---------+
           |
     Memory Updates:
     - Consolidate fragments
     - Identify patterns
     - Deduplicate entries
     - Archive stale data
     - Pre-compute responses
```

Sleep-time agents share memory blocks with primary agents but run asynchronously. They can:
- Parse uploaded documents in the background
- Reorganize fragmented memories into coherent entries
- Identify patterns across conversations
- Pre-compute likely responses for common queries

### Agent File Format (.af)

Letta introduced an **open file format** for serializing stateful agents:

```json
{
  "system_prompt": "...",
  "memory": {
    "core": { "persona": "...", "human": "..." },
    "archival": [...],
    "recall": [...]
  },
  "tools": [...],
  "llm_config": {...}
}
```

This enables: portability (move agents between systems), collaboration (share agents), preservation (archive configurations), and versioning (track changes over time).

### Multi-Agent Collaboration

Letta supports agents calling each other directly (both centralized supervisor and distributed patterns). The key enabler is **shared memory blocks** -- multiple agents can read/write to the same memory, enabling implicit coordination without explicit message passing.

### Verdict

Letta is the only framework here that treats memory as a first-class architectural concern. Its tiered memory system and sleep-time compute are genuinely novel. The trade-off: it's opinionated about memory management (everything goes through the MemGPT protocol), which may not fit all use cases.

---

## 6. Comparative Matrix

### Agent Communication

| Framework | Communication Model | Topology Support | Real-time? |
|---|---|---|---|
| **Swarms** | Message passing + shared memory + Redis/Pulsar | All (mesh, hierarchical, federated) | Yes |
| **DSPy** | Module composition (function calls) | Linear, tree | No (batch) |
| **Agentica** | Function calling (implicit) | Flat (function pool) | Yes (WebSocket) |
| **LangGraph** | State graph + message bus + handoffs | DAG, cyclic, supervisor, handoff | Yes |
| **Letta** | Shared memory blocks + direct calls | Supervisor, distributed | Yes (async) |

### State Management

| Framework | State Persistence | Checkpoint/Resume | Cross-Session? |
|---|---|---|---|
| **Swarms** | Shared memory system, DB wrappers | Basic retry/error handling | Limited |
| **DSPy** | None (stateless modules) | N/A (compile-time optimization) | No |
| **Agentica** | None (stateless function calls) | N/A | No |
| **LangGraph** | PostgresSaver/SqliteSaver checkpoints | Full checkpoint-based resume | Yes |
| **Letta** | Database-persisted tiered memory | Full state persistence | Yes (core feature) |

### Error Recovery

| Framework | Strategy | Granularity | Production-Ready? |
|---|---|---|---|
| **Swarms** | Retry helpers, structured error returns | Per-agent | Emerging |
| **DSPy** | N/A (optimization handles robustness) | Per-module | Research-grade |
| **Agentica** | Standard try/catch | Per-function | Basic |
| **LangGraph** | Checkpoint-based resume from last OK step | Per-node (super-step) | Yes |
| **Letta** | DB persistence (state never lost) | Per-interaction | Yes |

### Scalability

| Framework | Max Agents (Practical) | Parallel Execution | Overhead |
|---|---|---|---|
| **Swarms** | 100+ (designed for it) | Yes (ConcurrentWorkflow) | Heavy |
| **DSPy** | ~10 (pipeline depth) | Limited | Minimal (~3.5ms) |
| **Agentica** | ~5 (function pools) | Via async TypeScript | Minimal |
| **LangGraph** | ~20 (graph complexity limit) | Yes (parallel nodes) | Medium (~14ms) |
| **Letta** | ~10 (memory overhead) | Yes (sleep-time async) | Medium |

### Framework Weight

| Framework | Dependencies | Lock-in Risk | Learning Curve |
|---|---|---|---|
| **Swarms** | Heavy (many integrations) | High | Medium |
| **DSPy** | Light (core) | Low | High (ML thinking) |
| **Agentica** | Light (TypeScript compiler) | Low | Low |
| **LangGraph** | Medium-Heavy | Medium-High | Medium |
| **Letta** | Medium | Medium | Medium |

---

## 7. Portable Patterns for Lightweight Harnesses

These patterns can be extracted from the frameworks above and implemented in a prompt-engineering harness without framework dependencies:

### Pattern 1: SwarmRouter Topology Selector (from Swarms)

**What it does:** A single entry point that selects the right orchestration topology based on the task.

**How to port:** Implement as a prompt-level decision:

```
TOPOLOGY_SELECTOR_PROMPT = """
Given this task, select the optimal agent topology:
- SEQUENTIAL: if steps have dependencies (A needs B's output)
- CONCURRENT: if analyses are independent (run all, merge)
- MIXTURE: if you need multiple expert perspectives + synthesis
- HIERARCHICAL: if the task decomposes into subtasks

Task: {task}
Selected topology:
"""
```

In a harness like L-Thread Orchestrator, this maps to: conduit mode (sequential) vs. teams mode (concurrent/mixture).

### Pattern 2: Checkpoint-Based Resume (from LangGraph)

**What it does:** Saves state at each step so work can resume after failures.

**How to port:** Already implemented in L-Thread as `orchestrator-state.json` and `orchestrator-tmux-state.json`. Enhance with:

```
STATE_FILE = {
  "current_step": 3,
  "completed_steps": [
    {"step": 1, "agent": "analyst", "status": "done", "output_hash": "abc123"},
    {"step": 2, "agent": "coder", "status": "done", "output_hash": "def456"},
    {"step": 3, "agent": "reviewer", "status": "in_progress"}
  ],
  "checkpoint_context": "summary of work so far for context recovery"
}
```

### Pattern 3: Tiered Memory (from Letta/MemGPT)

**What it does:** Manages what stays in-context vs. what gets archived.

**How to port:** Use file-based tiers:

```
MEMORY TIERS (file-based):
  Core Memory:    .claude/memory/core.md       (always in system prompt)
  Working Memory: .claude/memory/working.md    (current task context)
  Archival:       .claude/memory/archive/      (searchable via grep)
  Recall:         git log + session logs       (conversation history)
```

The orchestrator decides what to promote/demote between tiers at session boundaries (compact hooks).

### Pattern 4: Sleep-time Processing (from Letta)

**What it does:** Background agents consolidate and reorganize knowledge during idle time.

**How to port:** Use tmux sessions that run consolidation tasks between active work:

```bash
# After main task completes, spawn background consolidation
tmux send-keys -t consolidator \
  "claude --prompt 'Review _bmad/session-logs/ and update
   .claude/memory/core.md with key learnings. Remove stale entries.
   Consolidate duplicate findings.'" Enter
```

### Pattern 5: Handoff Protocol (from LangGraph)

**What it does:** One agent dynamically passes control to another based on context.

**How to port:** Define handoff as a tool/command pattern:

```
HANDOFF_PROTOCOL:
  When agent A determines task requires agent B's expertise:
  1. A writes handoff context to _bmad/handoffs/{ticket_id}.md
  2. A signals orchestrator: "HANDOFF_NEEDED: {agent_type} for {reason}"
  3. Orchestrator spawns B with handoff context
  4. B reads handoff file, executes, writes result
  5. Orchestrator routes result back to A or next agent
```

### Pattern 6: Automatic Prompt Optimization (from DSPy)

**What it does:** Automatically improves prompts based on success metrics.

**How to port (simplified):** Track prompt performance and iterate:

```
PROMPT_OPTIMIZATION_LOOP:
  1. Log each agent invocation: {prompt_version, task, success, tokens_used}
  2. After N runs, analyze: which prompt versions succeed most?
  3. Use a "meta-prompt" to generate improved versions
  4. A/B test new vs old prompts on next batch
  5. Promote winners to .claude/prompts/v{N+1}.md
```

This is a simplified version of DSPy's compilation -- manual where DSPy automates, but captures the core idea.

### Pattern 7: Topology-Aware Agent Spawning (from Swarms)

**What it does:** The orchestrator picks different spawn strategies based on task structure.

**How to port to L-Thread:**

```
if task.has_dependencies:
    # Sequential: conduit mode, pipe output between agents
    use_conduit_mode(agents_in_order)
elif task.needs_multiple_perspectives:
    # Mixture: teams mode, parallel + aggregator
    use_teams_mode(expert_agents, aggregator_agent)
elif task.is_debate:
    # GroupChat: tmux session with interleaved communication
    use_groupchat_mode(debater_agents, rounds=3)
```

---

## 8. Heavy Frameworks vs Lightweight Harnesses: Trade-offs

### The 2026 Consensus

The industry has converged on a clear distinction:

```
FRAMEWORKS (Swarms, LangGraph, CrewAI)
  |
  | "Compose an agent loop"
  | Give you: building blocks, orchestration primitives
  | Cost: dependency trees, API churn, lock-in
  |
  v
HARNESSES (Claude Code, Pi Agent, L-Thread Orchestrator)
  |
  | "Operate an agent loop"
  | Give you: prompt presets, lifecycle hooks, context management
  | Cost: less automation, more manual prompt engineering
  |
  v
THE BITTER LESSON
  |
  | "Scale computation, don't hand-craft"
  | Harness should get SIMPLER as models improve
  | Infrastructure you can progressively delete
```

### Detailed Trade-off Analysis

| Dimension | Heavy Framework | Lightweight Harness |
|---|---|---|
| **Time to first agent** | Hours (setup, config, learn API) | Minutes (write prompt, run) |
| **Scaling to 10+ agents** | Built-in (router, graph, state) | Manual (tmux, files, scripts) |
| **Error recovery** | Automatic (checkpoints, retries) | Manual (state files, re-run) |
| **Model portability** | Usually locked to specific LLM APIs | Model-agnostic (just prompts) |
| **Maintenance burden** | High (framework upgrades, API changes) | Low (prompts are stable) |
| **Debugging** | Complex (graph state, serialization) | Simple (read the prompt, read the output) |
| **Vendor lock-in** | High (business logic entangled with framework) | None (prompts are portable text) |
| **Production readiness** | Higher (monitoring, persistence built-in) | Lower (must build infra yourself) |
| **Cost per run** | Higher (framework overhead, token bloat) | Lower (minimal overhead) |
| **Future-proofing** | Risk: framework may become obsolete | Safe: prompts work with any model |

### The Bitter Lesson Applied to Agent Frameworks

From the 2026 discourse:

> "Capabilities that required complex, hand-coded pipelines in 2024 are now handled by a single context-window prompt in 2026."

> "If an agent harness primarily scales by adding more human-authored structure, it is fighting the Bitter Lesson by shifting complexity away from the part that scales (the model) into the part that doesn't (bespoke scaffolding)."

> "The harness should get simpler as models improve, not more complex -- build infrastructure that can be progressively deleted."

### When to Choose What

```
USE A FRAMEWORK WHEN:
  - You need 20+ agents with complex interdependencies
  - You need production-grade fault tolerance (checkpointing)
  - You have a team of engineers who can maintain the framework
  - The orchestration pattern is your competitive advantage
  - You need audit trails, compliance, enterprise security

USE A HARNESS WHEN:
  - You need 2-10 agents for focused tasks
  - Prompt quality matters more than orchestration complexity
  - You want to stay model-agnostic and future-proof
  - You're a solo developer or small team
  - You value simplicity and debuggability
  - You want to iterate fast without framework ceremony
```

---

## 9. Recommendations for Pi Agent / L-Thread Orchestrator

### High-Priority Ports (Implement Now)

1. **Tiered Memory System (Letta)** -- L-Thread already has state files; formalize into core/working/archival tiers with explicit promotion/demotion at compact boundaries.

2. **Checkpoint Resume Enhancement (LangGraph)** -- L-Thread already has state JSON; add output hashing and "resume from step N" capability for crash recovery beyond tmux persistence.

3. **Topology-Aware Routing (Swarms)** -- L-Thread already has conduit vs. teams mode; add a decision prompt that selects the right mode based on task analysis.

### Medium-Priority Ports (Implement When Needed)

4. **Handoff Protocol (LangGraph)** -- Formalize agent-to-agent handoff with context files. Currently implicit in L-Thread; make it explicit with structured handoff documents.

5. **Sleep-time Consolidation (Letta)** -- Use idle tmux sessions to run memory consolidation between active tasks. Novel for a harness architecture.

6. **Prompt Version Tracking (DSPy-inspired)** -- Track which prompt versions produce best results. Not full DSPy compilation, but the core feedback loop.

### Low-Priority / Watch (Interesting but Premature)

7. **GroupChat/Debate Mode (Swarms)** -- Multi-agent debate in a shared tmux session. Interesting for code review, but models aren't yet reliable enough for unmoderated debate.

8. **Agent File Format (Letta .af)** -- Serializable agent configs. Could be useful for sharing orchestrator configurations, but L-Thread's markdown-based approach is simpler and more portable.

9. **Full DSPy Compilation** -- Automatic prompt optimization is powerful but requires training data and metrics infrastructure. Wait until the harness has enough run data to optimize against.

### Architecture Principle

The L-Thread Orchestrator should follow the 2026 consensus:

```
+----------------------------------+
|  PROGRESSIVELY DELETABLE INFRA   |
|                                  |
|  Layer 1: Prompts (permanent)    |
|  Layer 2: State files (durable)  |
|  Layer 3: Lifecycle hooks (light)|
|  Layer 4: Tmux helpers (replace- |
|           able with better tools)|
|  Layer 5: Orchestration logic    |
|           (simplify as models    |
|            improve)              |
+----------------------------------+
```

As models get better at planning, tool use, and self-correction, the orchestration layer (Layer 5) should shrink. The prompts and state management (Layers 1-2) are the durable investment.

---

## 10. Sources

### Swarms
- [Swarms Multi-Agent Architectures](https://docs.swarms.world/en/latest/swarms/concept/swarm_architectures/)
- [Swarms GitHub Repository](https://github.com/kyegomez/swarms)
- [Understanding Swarms Architecture](https://docs.swarms.world/en/latest/swarms/concept/framework_architecture/)
- [AgentRearrange Documentation](https://docs.swarms.world/en/latest/swarms/structs/agent_rearrange/)
- [SwarmRouter Documentation](https://docs.swarms.world/en/latest/swarms/structs/swarm_router/)
- [SequentialWorkflow Documentation](https://docs.swarms.world/en/latest/swarms/structs/sequential_workflow/)
- [Choosing Multi-Agent Architecture](https://docs.swarms.world/en/latest/swarms/concept/how_to_choose_swarms/)

### DSPy
- [DSPy Official Site](https://dspy.ai/)
- [DSPy GitHub Repository](https://github.com/stanfordnlp/dspy)
- [DSPy Modules Documentation](https://dspy.ai/learn/programming/modules/)
- [DSPy ReAct Module](https://dspy.ai/api/modules/ReAct/)
- [DSPy ChainOfThought](https://dspy.ai/api/modules/ChainOfThought/)
- [DSPy Optimizers](https://dspy.ai/learn/optimization/optimizers/)
- [GEPA Optimizer Overview](https://dspy.ai/api/optimizers/GEPA/overview/)
- [MIPROv2 Optimizer](https://dspy.ai/api/optimizers/MIPROv2/)
- [Building Multi-Agent RAG with DSPy and GEPA](https://kargarisaac.medium.com/building-and-optimizing-multi-agent-rag-systems-with-dspy-and-gepa-2b88b5838ce2)
- [DSPy vs LangChain Comparison (Qdrant)](https://qdrant.tech/blog/dspy-vs-langchain/)

### Agentica
- [Agentica Guide Documents](https://wrtnlabs.io/agentica/)
- [Agentica Core Library](https://wrtnlabs.io/agentica/docs/core/)
- [Every TypeScript Developer is an AI Developer (DEV Community)](https://dev.to/samchon/every-typescript-developer-is-an-ai-developer-2kan)
- [Agentica Function Calling (DEV Community)](https://dev.to/samchon/agentica-do-you-know-function-then-youre-ai-developer-1d9d)

### LangChain / LangGraph
- [LangGraph Official Site](https://www.langchain.com/langgraph)
- [LangGraph Persistence (Checkpointing)](https://docs.langchain.com/oss/python/langgraph/persistence)
- [LangGraph Supervisor Pattern](https://github.com/langchain-ai/langgraph-supervisor-py)
- [Production Multi-Agent with LangGraph (Markaicode)](https://markaicode.com/langgraph-production-agent/)
- [LangGraph Message Bus Architecture (MarkTechPost, March 2026)](https://www.marktechpost.com/2026/03/01/how-to-design-a-production-grade-multi-agent-communication-system-using-langgraph-structured-message-bus-acp-logging-and-persistent-shared-state-architecture/)
- [LangGraph Explained 2026 Edition](https://medium.com/@dewasheesh.rana/langgraph-explained-2026-edition-ea8f725abff3)
- [How Agent Handoffs Work (Towards Data Science)](https://towardsdatascience.com/how-agent-handoffs-work-in-multi-agent-systems/)
- [Choosing the Right Multi-Agent Architecture (LangChain Blog)](https://blog.langchain.com/choosing-the-right-multi-agent-architecture/)
- [LangGraph Checkpoint Best Practices](https://sparkco.ai/blog/mastering-langgraph-checkpointing-best-practices-for-2025)

### Letta AI
- [Letta Official Site](https://www.letta.com/)
- [Letta GitHub Repository](https://github.com/letta-ai/letta)
- [Letta Memory Management Docs](https://docs.letta.com/advanced/memory-management/)
- [Letta Core Concepts](https://docs.letta.com/core-concepts/)
- [Intro to Letta / MemGPT](https://docs.letta.com/concepts/memgpt/)
- [Sleep-time Agents Documentation](https://docs.letta.com/guides/agents/architectures/sleeptime/)
- [Sleep-time Compute Blog Post](https://www.letta.com/blog/sleep-time-compute)
- [Agent File (.af) Format](https://github.com/letta-ai/agent-file)
- [Agent File Documentation](https://docs.letta.com/guides/agents/agent-file/)
- [Stateful AI Agents Deep Dive (Medium, Feb 2026)](https://medium.com/@piyush.jhamb4u/stateful-ai-agents-a-deep-dive-into-letta-memgpt-memory-models-a2ffc01a7ea1)
- [Agent Memory Blog Post](https://www.letta.com/blog/agent-memory)
- [The AI Agents Stack (Letta Blog)](https://www.letta.com/blog/ai-agents-stack)

### Harness vs Framework Discourse
- [Effective Harnesses for Long-Running Agents (Anthropic Engineering)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [The Importance of Agent Harness in 2026 (Phil Schmid)](https://www.philschmid.de/agent-harness-2026)
- [2025 Was Agents, 2026 Is Agent Harnesses (Aakash Gupta)](https://aakashgupta.medium.com/2025-was-agents-2026-is-agent-harnesses-heres-why-that-changes-everything-073e9877655e)
- [Your Agent Needs a Harness, Not a Framework (Inngest)](https://www.inngest.com/blog/your-agent-needs-a-harness-not-a-framework)
- [The Bitter Lesson of Agent Frameworks (Browser-Use)](https://browser-use.com/posts/bitter-lesson-agent-frameworks)
- [Agentic Frameworks in 2026: What Actually Works in Production (Zircon Tech)](https://zircon.tech/blog/agentic-frameworks-in-2026-what-actually-works-in-production/)
- [Orchestration Wars: LangChain vs Claude-Flow vs Custom (SitePoint)](https://www.sitepoint.com/agent-orchestration-framework-comparison-2026/)
- [Agentic AI: Why Prompt Engineering Delivers Better ROI (Caylent)](https://caylent.com/blog/agentic-ai-why-prompt-engineering-delivers-better-roi-than-orchestration)
- [Multi-Agent Frameworks Explained for Enterprise AI (Adopt AI)](https://www.adopt.ai/blog/multi-agent-frameworks)

### General
- [Top 5 Open-Source Agentic AI Frameworks in 2026 (AIM)](https://aimultiple.com/agentic-frameworks)
- [12 Best AI Agent Frameworks in 2026 (Data Science Collective)](https://medium.com/data-science-collective/the-best-ai-agent-frameworks-for-2026-tier-list-b3a4362fac0d)
- [Agentic AI Frameworks: Top 8 Options in 2026 (Instaclustr)](https://www.instaclustr.com/education/agentic-ai/agentic-ai-frameworks-top-8-options-in-2026/)
