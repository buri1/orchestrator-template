# Alternative Computer Architectures Mapped to LLM Agent Harness Design

> **Date**: 2026-04-04
> **Status**: Exploratory Research
> **Thesis**: The Von Neumann model (sequential fetch-decode-execute with separate memory) is the implicit blueprint for nearly every agent harness today. This document explores 10 alternative architectures and asks: what would agent harnesses look like if they were built on fundamentally different computational models?

---

## Table of Contents

1. [Dataflow Architecture](#1-dataflow-architecture)
2. [RISC vs CISC](#2-risc-vs-cisc)
3. [Pipelining](#3-pipelining)
4. [Superscalar](#4-superscalar)
5. [VLIW (Very Long Instruction Word)](#5-vliw-very-long-instruction-word)
6. [Systolic Arrays](#6-systolic-arrays)
7. [Neuromorphic Computing](#7-neuromorphic-computing)
8. [Transport-Triggered Architecture](#8-transport-triggered-architecture)
9. [Reconfigurable Computing (FPGAs)](#9-reconfigurable-computing-fpgas)
10. [Quantum Computing Concepts](#10-quantum-computing-concepts)
11. [Synthesis: The Next Paradigm Shift](#synthesis-the-next-paradigm-shift)
12. [Feasibility Summary Matrix](#feasibility-summary-matrix)

---

## 1. Dataflow Architecture

### What It Is

Dataflow architecture abandons the program counter entirely. There is no sequential instruction stream. Instead, computation is represented as a directed graph of operations, and each operation fires the instant all of its input operands are available. The MIT Tagged-Token Dataflow Architecture (TTDA), designed by Arvind and others in the 1970s-80s, was the canonical research implementation. Data tokens flow through the graph carrying both values and tags; when all tokens for an operation have arrived at a "matching unit," the operation executes and produces new tokens that flow downstream.

### The Hardware Motivation

Von Neumann machines serialize naturally parallel work behind a single program counter. The "Von Neumann bottleneck" -- the narrow pipe between processor and memory -- limits throughput. Dataflow was designed to exploit implicit parallelism: if two operations have no data dependency, they execute simultaneously without any explicit threading or synchronization. The programmer never writes parallel code; the parallelism is a structural consequence of the data dependency graph.

### The Agent Mapping

**This is the single most promising alternative architecture for agent harnesses, and it is already partially implemented.**

A dataflow agent harness would work as follows:

- **The "program" is a dependency graph of tasks**, not a sequential plan. Each node is an operation (tool call, LLM inference, data transformation). Edges represent data dependencies.
- **No orchestrator loop.** There is no central controller that steps through tasks sequentially. Instead, a **firing rule** monitors each node: when all inputs are satisfied, the node executes.
- **Implicit parallelism.** If tasks A and B have no shared dependencies, they fire simultaneously. No explicit "spawn two workers" logic. The graph topology IS the parallelism specification.
- **Dynamic dataflow.** The graph can be modified at runtime -- an LLM can add new nodes to the graph based on intermediate results, creating a self-modifying program.

**Example**: An agent needs to (1) fetch a webpage, (2) fetch an API response, (3) compare both results. In a Von Neumann harness, this is: fetch webpage, wait, fetch API, wait, compare. In dataflow, (1) and (2) fire immediately in parallel, and (3) fires the instant both complete. No scheduling code needed.

**The deeper insight**: LangGraph's state-graph model is proto-dataflow. Nodes are operations, edges are conditional data flows, and execution follows the graph topology rather than a linear plan. But LangGraph still has Von Neumann residue -- it uses a single-threaded execution model internally and processes one node at a time along a path. A true dataflow agent harness would execute ALL ready nodes simultaneously.

### Current Implementations

| Framework | Dataflow-ness | Notes |
|-----------|--------------|-------|
| **LangGraph** | Partial (graph topology, but single-threaded execution) | Closest to dataflow in the agent ecosystem. State flows through nodes. Conditional edges. But execution is still sequential along paths. |
| **Prefect / Dagster** | High (for data pipelines, not agent-native) | Task DAGs with automatic parallelism. Could be adapted for agent orchestration. |
| **Temporal** | Medium (workflow-as-code with parallel activity support) | Durable execution with parallel activities, but imperative API. |
| **Apache Beam** | High (streaming dataflow for data processing) | Designed for exactly this model, but not agent-native. |

### What a True Dataflow Agent Harness Would Look Like

```
Agent receives task
  -> LLM generates dependency graph (not a plan list)
  -> Harness monitors all nodes
  -> Ready nodes fire immediately (parallel tool calls, parallel LLM inferences)
  -> Results flow as tokens to downstream nodes
  -> New nodes can be injected mid-execution
  -> Execution completes when all terminal nodes have fired
```

The key difference from current "plan-then-execute" agents: **the plan IS the execution specification.** There is no separate scheduling step.

### Feasibility Rating: 5/5

This is not speculative. The primitives exist today (LangGraph, Prefect, parallel tool calling in Claude and GPT). What is missing is a harness that treats the dependency graph as a first-class execution model rather than bolting parallelism onto a sequential loop. Someone will build this within 12 months.

---

## 2. RISC vs CISC

### What It Is

**RISC (Reduced Instruction Set Computer)** uses a small set of simple, uniform instructions that each execute in one clock cycle. Complex operations are composed from simple ones by the compiler. ARM, RISC-V, and MIPS are RISC architectures.

**CISC (Complex Instruction Set Computer)** provides a large library of specialized instructions, some of which perform multi-step operations in a single instruction. x86 is CISC. A single CISC instruction might load from memory, perform arithmetic, and store the result.

### The Hardware Motivation

RISC emerged from the observation that compilers rarely used most CISC instructions. David Patterson and John Hennessy showed that a simpler instruction set with uniform timing made pipelining easier, silicon cheaper, and overall throughput higher. CISC's advantage was programmer convenience and code density. The debate was largely resolved by the 2000s: modern x86 processors decode CISC instructions into RISC-like micro-ops internally, getting the best of both worlds.

### The Agent Mapping

This maps directly to the **tool set design problem** for LLM agents.

**RISC Agent (Minimal Tool Set)**:
- Few, general-purpose tools: `read_file`, `write_file`, `run_command`, `web_search`
- The LLM composes complex operations from simple primitives
- Smaller tool descriptions = less context window consumption
- Easier for the LLM to learn the full API surface
- Example: Claude Code with ~8 core tools

**CISC Agent (Rich Tool Library)**:
- Many specialized tools: `create_pull_request`, `run_pytest_with_coverage`, `deploy_to_staging`, `query_postgres_with_retry`
- One tool call does more work (fewer round-trips)
- But the LLM must choose from a huge menu, increasing selection errors
- Tool descriptions consume significant context
- Example: An agent with 200+ MCP tools loaded

**The Vercel RISC moment**: Vercel reported that removing 80% of their tools and keeping only the essential primitives dramatically improved agent performance. This is the RISC insight: the "compiler" (the LLM) is better at composing simple operations than navigating a complex instruction set. The cognitive load of tool selection is a real bottleneck, analogous to the silicon cost of a CISC decoder.

**But the CISC counterargument has merit too**: A single `deploy_to_production` tool call that handles 15 sub-steps is more token-efficient than 15 sequential primitive calls. Each round-trip costs latency and tokens. The question is whether the selection-error cost exceeds the round-trip cost.

### The Synthesis (Same as x86 Evolution)

The optimal architecture is **CISC on the outside, RISC on the inside**: present the LLM with a moderate number of well-named high-level tools, but implement each tool as a composition of simple primitives internally. This is exactly what modern MCP servers do -- a single `create_github_issue` tool internally performs authentication, API formatting, error handling, and retries.

### Current Implementations

| Approach | Framework | Notes |
|----------|-----------|-------|
| **RISC** | Claude Code (8 core tools) | Proven effective. The LLM composes bash commands, file edits, web search. |
| **CISC** | Heavily-loaded MCP servers (100+ tools) | Common but empirically worse. Tool selection degrades. |
| **Hybrid** | OpenAI Assistants API with function calling | Moderate tool counts (~20-30) with well-scoped functions. |

### Feasibility Rating: 5/5

Already proven. The industry is converging on a RISC-ish approach (10-20 well-chosen tools) with CISC-style internal composition. The remaining question is whether dynamic tool loading (loading only relevant tools for the current task) can give CISC breadth with RISC simplicity.

---

## 3. Pipelining

### What It Is

Pipelining overlaps the stages of instruction execution. While instruction N is being executed, instruction N+1 is being decoded, and instruction N+2 is being fetched from memory. A 5-stage pipeline (fetch, decode, execute, memory access, write-back) can theoretically achieve 5x throughput compared to non-pipelined execution, even though each individual instruction takes the same total time.

### The Hardware Motivation

Without pipelining, each instruction must complete all stages before the next begins. Most hardware resources sit idle most of the time. Pipelining keeps all stages busy simultaneously, like an assembly line in a factory. The challenge is **hazards**: data dependencies between instructions (data hazard), branch instructions that invalidate prefetched instructions (control hazard), and resource conflicts (structural hazard).

### The Agent Mapping

Agent pipelining means **overlapping the stages of task processing** so that no stage sits idle:

**Stage 1: Task Fetch** -- Identify the next task (query issue tracker, read backlog)
**Stage 2: Context Decode** -- Gather relevant context (read files, understand codebase)
**Stage 3: Execute** -- Perform the work (generate code, make API calls)
**Stage 4: Validate** -- Test the output (run tests, screenshot comparison)
**Stage 5: Commit** -- Persist the result (git commit, deploy, close issue)

In a non-pipelined agent, these stages happen sequentially for each task. In a pipelined agent:

```
Time ->  T1    T2    T3    T4    T5    T6    T7
Task A: Fetch  Decode Exec  Valid  Commit
Task B:        Fetch  Decode Exec   Valid  Commit
Task C:               Fetch  Decode Exec   Valid  Commit
```

While Task A is executing, Task B is already gathering context, and Task C is being identified. The throughput approaches one completed task per time unit instead of one per five time units.

**Agent Hazards (directly analogous to hardware hazards)**:

- **Data Hazard**: Task B depends on Task A's output. B's Decode stage stalls until A's Commit stage completes. Mitigation: dependency analysis before pipeline insertion, or "forwarding" (passing intermediate results between pipeline stages before formal commit).
- **Control Hazard**: A task's result changes the plan (e.g., a bug discovered during Task A means Task B is now irrelevant). Mitigation: speculative execution (proceed optimistically) or branch prediction (predict likely outcomes and pre-fetch context).
- **Structural Hazard**: Two tasks need the same resource simultaneously (e.g., both need to write to the same file). Mitigation: git worktrees (separate working directories), resource locking.

**Speculative Prefetching**: While an agent executes the current task, speculatively fetch context for the most likely next task. If the prediction is wrong, the prefetched context is discarded (like a pipeline flush). The cost of wrong speculation is wasted tokens, not incorrect results.

### Current Implementations

| Framework | Pipelining Level | Notes |
|-----------|-----------------|-------|
| **L-Thread Orchestrator v3** | Partial -- sequential task completion but spawns next worker while reviewing previous | Workers in tmux windows can overlap review/execution stages. |
| **GitHub Copilot Workspace** | Minimal -- sequential steps but speculative context loading | Pre-loads relevant files before the user makes a change. |
| **Devin** | Partial -- runs tests while continuing development in separate branches | Overlaps execution and validation stages. |

### What a Fully Pipelined Agent Would Look Like

The orchestrator maintains a pipeline of depth N (e.g., 5 tasks). At any moment, each task is in a different pipeline stage. The orchestrator's job is not to execute tasks but to **manage hazards**: detecting dependencies, stalling or forwarding when necessary, and flushing the pipeline when control flow changes.

This is a fundamentally different orchestrator design. Instead of a loop (get task -> do task -> next), it is a **pipeline manager** that continuously feeds tasks into the pipeline and resolves conflicts.

### Feasibility Rating: 4/5

Partially implemented in practice (overlapping review and execution). Full pipelining requires dependency analysis between tasks, which is itself an LLM inference problem. The speculative prefetching idea is highly actionable and could be implemented in existing harnesses within weeks.

---

## 4. Superscalar

### What It Is

A superscalar processor has multiple execution units (ALUs, FPUs, load/store units) and can issue multiple instructions per clock cycle. The hardware dynamically analyzes the instruction stream, identifies independent instructions, and dispatches them to different execution units simultaneously. Tomasulo's algorithm (1967) and its descendants handle register renaming and out-of-order execution to maximize instruction-level parallelism.

### The Hardware Motivation

Even with pipelining, a single-issue processor completes at most one instruction per cycle. Superscalar breaks this barrier by exploiting instruction-level parallelism (ILP): if two instructions in the stream are independent, they can execute simultaneously on separate execution units. Modern CPUs (Apple M-series, AMD Zen, Intel Core) are 4-8 wide superscalar, meaning they can issue 4-8 instructions per cycle.

### The Agent Mapping

Superscalar agents have **multiple execution units (agents/workers) operating simultaneously on a shared task stream**, with dynamic scheduling that identifies which tasks are independent and can be parallelized.

The key distinction from simple parallelism: **the harness itself performs dependency analysis and dynamic dispatch**, like a hardware scheduler. It does not rely on the planner to pre-identify parallelizable tasks. Instead, the scheduler examines the task queue and determines at runtime which tasks have no conflicts.

**Superscalar agent components**:

- **Dispatch unit**: Examines the task queue and identifies groups of independent tasks
- **Execution units**: Multiple agent workers (Claude instances, separate tmux windows)
- **Register renaming / Worktree isolation**: Each worker operates in its own git worktree to avoid "write-after-write" conflicts on the same files
- **Reorder buffer**: Results from out-of-order completion are committed (merged) in the original task order to maintain consistency
- **Shared state**: All workers read from the same codebase state but write to isolated branches

**Out-of-order execution for agents**: Tasks are issued out of order (whichever is ready runs next), but results are committed (merged to main) in order. This is exactly how modern CPUs work -- they execute out of order for performance but retire instructions in order for correctness.

### Current Implementations

| Framework | Superscalar-ness | Notes |
|-----------|-----------------|-------|
| **L-Thread Orchestrator v3** | Medium -- multiple tmux workers with git worktrees, but manual dispatch | Up to 6 parallel workers, orchestrator dispatches manually. Missing automatic dependency analysis. |
| **SWE-agent with parallel runs** | Low -- independent parallel runs, no shared state | Multiple agents on separate tasks, but no dynamic scheduling or shared context. |
| **OpenAI Codex** | Medium -- cloud-based parallel agent execution | Runs multiple agents in sandboxed environments, some parallel dispatch. |

### The Missing Piece: Dynamic Dependency Analysis

No current agent harness does automatic dependency analysis equivalent to hardware superscalar scheduling. An LLM call to "analyze these 10 tasks and identify which groups can execute in parallel" is the closest analog to a superscalar dispatch unit. This meta-inference (using the LLM to optimize the LLM's own execution schedule) is underexplored.

### Feasibility Rating: 4/5

The execution part (multiple parallel agents) exists. The scheduling part (automatic dependency analysis and dynamic dispatch) is feasible but requires a dedicated "scheduler agent" or a deterministic dependency graph. The reorder buffer (in-order merge of out-of-order completions) could be implemented with a merge queue.

---

## 5. VLIW (Very Long Instruction Word)

### What It Is

VLIW moves the parallelism detection burden from hardware to the compiler. A VLIW instruction word is very long (128-1024 bits) because it explicitly encodes multiple independent operations that should execute simultaneously. The compiler analyzes the program and bundles independent operations into each instruction word. The hardware is simple -- it just executes whatever the instruction word says in parallel, with no dynamic scheduling.

Intel's Itanium (IA-64 / EPIC -- Explicitly Parallel Instruction Computing) was the most ambitious VLIW-like commercial processor. It ultimately failed because compilers could not effectively exploit the parallelism in general-purpose code, though VLIW succeeded in DSP (digital signal processing) chips where code patterns are predictable.

### The Hardware Motivation

Superscalar hardware is expensive and power-hungry because it must dynamically detect parallelism at runtime. VLIW asks: why not do this analysis once, at compile time, and encode the result directly? The hardware becomes simpler, cheaper, and more power-efficient. The trade-off is that the "compiler" must be very smart.

### The Agent Mapping

VLIW maps to **prompts that explicitly bundle multiple independent tool calls into a single turn**. Instead of the agent deciding dynamically which tools to call in parallel, the prompt (or planning step) pre-computes which operations are independent and packages them together.

**VLIW-style agent prompt**:
```
Execute these operations in parallel:
  Slot 1: web_search("dataflow architecture")
  Slot 2: read_file("/docs/architecture.md")
  Slot 3: run_command("git log --oneline -10")
  Slot 4: NOP (no operation for this slot)
```

**This is already happening.** Claude's parallel tool use allows multiple tool calls in a single response. When the model outputs three tool_use blocks in one response, it is implicitly performing VLIW-style bundling: the model (acting as "compiler") has determined these operations are independent and bundles them into one "instruction word" (response).

**The Itanium lesson for agents**: VLIW failed for general-purpose computing because the compiler could not predict runtime behavior (cache misses, branch outcomes). Similarly, static pre-planning of parallel tool calls fails when tool results are unpredictable. If web_search returns an error, the other bundled operations may have been wasted. Dynamic (superscalar) scheduling adapts; static (VLIW) scheduling cannot.

**Where VLIW succeeds for agents** (same as DSP): When the task is **predictable and repetitive**. Batch processing (process 100 documents the same way), standardized workflows (CI/CD pipelines), template-driven tasks. In these cases, the "compilation" (planning) step can reliably pre-compute the parallel schedule.

### Current Implementations

| Feature | Framework | Notes |
|---------|-----------|-------|
| **Parallel tool calling** | Claude (Anthropic), GPT-4 (OpenAI) | Model bundles multiple tool calls in one response. This IS VLIW. |
| **Explicit parallel blocks** | LangGraph parallel nodes | Graph nodes marked as parallel execute together. |
| **Batch operations** | OpenAI Batch API | Explicitly parallel processing, but at the API level not the agent level. |

### Feasibility Rating: 4/5

Already partially implemented via parallel tool calling. The insight is that this approach works best for predictable, template-like workflows and poorly for exploratory, adaptive tasks. Agent harness designers should recognize when to use VLIW-style batching vs. dynamic scheduling.

---

## 6. Systolic Arrays

### What It Is

A systolic array is a grid of simple, identical processing elements (PEs) connected in a regular pattern (usually a mesh or linear array). Data flows rhythmically through the array like blood through the circulatory system (hence "systolic"). Each PE performs a simple operation (typically multiply-accumulate) on data as it passes through, then forwards the result to the next PE. No PE has global knowledge; each operates only on its local inputs.

Google's Tensor Processing Unit (TPU) uses systolic arrays for matrix multiplication. A 256x256 systolic array performs 65,536 multiply-accumulate operations per clock cycle.

### The Hardware Motivation

For regular, data-parallel computations (matrix multiplication, convolution), systolic arrays achieve massive throughput with minimal control overhead. There is no instruction fetch, no decode, no branch prediction -- just data flowing through a fixed computation pattern. The regularity makes the hardware simple, power-efficient, and easy to scale. The trade-off is inflexibility: a systolic array designed for matrix multiply cannot be repurposed for sorting.

### The Agent Mapping

Systolic arrays map to **linear or grid-arranged multi-agent pipelines where each agent performs one specific transformation and passes results to the next agent**. No agent has global context; each operates only on its local input.

**Linear Systolic Agent Pipeline (for document processing)**:
```
Document -> [Extract Agent] -> [Summarize Agent] -> [Classify Agent] -> [Store Agent]
              |                    |                    |                   |
         extracts text      summarizes content    assigns categories    writes to DB
```

Each agent is simple and specialized. Data flows through in one direction. The pipeline achieves throughput by processing multiple documents simultaneously -- while Document 3 is being extracted, Document 2 is being summarized, and Document 1 is being classified.

**Grid Systolic Agent Pipeline (for multi-dimensional analysis)**:
```
         Perspective 1    Perspective 2    Perspective 3
Source A  [Agent 1,1] -->  [Agent 1,2] -->  [Agent 1,3] --> Row synthesis
Source B  [Agent 2,1] -->  [Agent 2,2] -->  [Agent 2,3] --> Row synthesis
Source C  [Agent 3,1] -->  [Agent 3,2] -->  [Agent 3,3] --> Row synthesis
             |                |                |
          Col synth        Col synth        Col synth
```

Each agent receives input from its left neighbor and top neighbor, performs a local operation, and passes results right and down. This maps to multi-source, multi-perspective analysis where each cell combines one source with one analytical lens.

**The key property borrowed from systolic arrays: locality.** Each agent sees only its immediate inputs, not the full context. This is a feature, not a bug -- it means each agent can be simple, with a minimal prompt, reducing hallucination and improving reliability. The global computation emerges from the local interactions.

### Current Implementations

| Pattern | Framework | Notes |
|---------|-----------|-------|
| **Sequential agent chains** | LangChain LCEL, CrewAI sequential process | Linear data flow through agent stages. Proto-systolic but usually not parallelized across multiple data items. |
| **MapReduce agents** | Custom implementations | Map phase distributes work to parallel agents; reduce phase synthesizes. This is a degenerate 1-row systolic array. |
| **Google Chain of Agents** | Google Research (2024) | Sequential agents where each refines the previous agent's output. Linear systolic pattern. |

### The Insight

Systolic agents sacrifice flexibility for throughput and simplicity. They work when:
1. The task can be decomposed into a fixed sequence of transformations
2. Many data items need the same processing
3. Global context is not required at each step

They fail when tasks require adaptive, branching logic or when each item needs fundamentally different processing.

### Feasibility Rating: 3/5

The linear pipeline pattern is common. The grid pattern is rare in agent systems. The main barrier is that most agent tasks are not regular enough to benefit from systolic-style rigidity. Best suited for batch processing, ETL-like workflows, and multi-perspective analysis with fixed analytical dimensions.

---

## 7. Neuromorphic Computing

### What It Is

Neuromorphic computing architectures are inspired by biological neural networks. Key properties: (1) no separation between processor and memory -- computation happens where data is stored; (2) event-driven, not clock-driven -- neurons fire only when they receive sufficient input (spikes), consuming zero energy when idle; (3) massively parallel -- billions of neurons operate simultaneously; (4) learning is continuous and local -- synaptic weights update based on local spike timing (STDP), not global backpropagation.

Intel's Loihi 2, IBM's NorthPole, and SynSense's Xylo are neuromorphic chips. They excel at temporal pattern recognition, sparse sensor processing, and always-on inference with orders-of-magnitude better energy efficiency than GPUs.

### The Hardware Motivation

The Von Neumann bottleneck is fundamentally a memory wall problem: the processor and memory are separate, connected by a bus that limits throughput. Neuromorphic computing eliminates this by collocating processing and memory in every neuron. It also eliminates the clock: instead of running every transistor every cycle (whether or not it has work), neurons activate only when triggered by input events. For workloads with spatial and temporal sparsity (most real-world sensor data), this yields 100-1000x energy efficiency improvement.

### The Agent Mapping

**This is the most philosophically provocative mapping in this document.**

The LLM itself is already a form of neuromorphic computing. The transformer architecture processes all tokens in parallel, has no program counter, and the "processing" (attention, FFN layers) is inextricable from the "memory" (the weights). When we wrap an LLM in a Von Neumann-style harness (sequential loop, explicit memory store, program-counter-like task lists), **we may be regressing from a neuromorphic processor back to a Von Neumann one**.

Consider the mapping:

| Neuromorphic Property | LLM Equivalent | Von Neumann Harness (Regression?) |
|----------------------|----------------|----------------------------------|
| No processor/memory separation | Weights ARE both memory and computation | External memory (RAG, vector DB) re-introduces the memory wall |
| Event-driven | Autoregressive generation fires "when ready" | Polling loops, sequential orchestration impose artificial clocking |
| Massively parallel | Attention across all tokens simultaneously | Sequential tool calls serialize naturally parallel reasoning |
| Local learning | In-context learning updates "weights" locally | Fine-tuning requires separate, global training runs |
| Sparse activation | Mixture-of-experts (MoE) activates subset of parameters | Dense prompts activate all model capacity regardless of task |

**The provocative thesis**: The ideal agent harness might not be a harness at all. If the LLM is already a neuromorphic processor, the best "harness" would be one that:

1. **Eliminates the control loop** -- let the LLM generate a stream of actions and observations without a sequential orchestrator
2. **Removes the memory wall** -- instead of external vector DBs, encode knowledge directly in the context (or in fine-tuned weights)
3. **Operates event-driven** -- the LLM activates only when new data arrives, not on a polling schedule
4. **Supports sparse activation** -- route only relevant subsets of the task to the LLM, not the entire context every time

**The counterargument**: LLMs are not actually neuromorphic. They run on Von Neumann hardware (GPUs, which are SIMD, not truly neuromorphic). They do not have true continuous learning. Their "memory" (context window) is finite and must be managed externally. The harness exists precisely because the LLM cannot maintain persistent state, cannot trigger itself, and cannot interact with the outside world without mediation.

**The resolution**: The LLM's internal reasoning is proto-neuromorphic, but its interface to the world is Von Neumann. The harness should **minimize the Von Neumann impedance mismatch** by being as event-driven, parallel, and stateless as possible, rather than imposing more sequential structure than necessary.

### Current Implementations

| Approach | Framework | Notes |
|----------|-----------|-------|
| **Streaming tool use** | Claude with streaming responses | Partial -- actions emerge as the generation proceeds, not after. |
| **Event-driven agents** | Inngest, Trigger.dev for agent workflows | Agents activate on events, not polling. Closest to neuromorphic event-driven model. |
| **Always-on agents** | Devin, Claude computer use | Persistent agent sessions that respond to stimuli. |

### Feasibility Rating: 2/5 (for full neuromorphic harness), 4/5 (for neuromorphic-inspired principles)

A fully neuromorphic agent harness (no control loop, no external memory, pure event-driven) is not feasible today because LLMs require external state management and tool mediation. But neuromorphic principles (event-driven activation, minimize external memory, prefer streaming over batching, reduce sequential control) are highly actionable and should inform harness design.

---

## 8. Transport-Triggered Architecture (TTA)

### What It Is

In a Transport-Triggered Architecture, there are no explicit operation instructions (no ADD, no MULTIPLY). Instead, all operations are **side effects of data movement**. The processor has functional units (adder, multiplier, etc.) connected to a transport bus. To add two numbers, you MOVE data to the adder's input registers; the addition happens automatically as a side effect. To read the result, you MOVE data from the adder's output register. The only instruction is MOVE.

The TTA concept was developed in the 1990s, with the MOVE processor family and Tampere University's TTA-based Co-design Environment (TCE). TTA simplifies hardware by eliminating the instruction decoder -- everything is a transport operation.

### The Hardware Motivation

Traditional processors spend significant silicon and energy on instruction decoding and control logic. TTA reduces the instruction set to one instruction (MOVE), dramatically simplifying the hardware. The programmer/compiler has complete control over the data transport network and can exploit parallelism by scheduling independent moves on separate buses simultaneously.

### The Agent Mapping

TTA maps to **event-driven agent systems where actions are triggered automatically by data arrival**, not by explicit orchestrator commands.

In a TTA-style agent harness:
- There is no "execute tool X" command
- Instead, data is **routed to a tool's input channel**
- The tool executes automatically when its input is complete
- The result appears on the tool's output channel
- Another routing rule moves the output to the next destination

**Concrete example**:
```
ROUTE user_query -> search_tool.input          # search executes automatically
ROUTE search_tool.output -> summarizer.input   # summarizer executes automatically
ROUTE summarizer.output -> response_channel    # response delivered
```

The orchestrator does not say "run search" and "run summarizer." It only defines the routing. Execution is a side effect of data arriving at the right place.

**This is essentially a message-passing or pub/sub architecture**, and it maps closely to:
- **Kafka/event-streaming agent patterns**: Agents subscribe to topics, process incoming messages, produce to output topics
- **Unix pipes**: `cat file | grep pattern | sort | uniq` -- each tool executes when data arrives at stdin
- **Webhook chains**: Tool A's completion webhook triggers Tool B

**The deep insight**: The Unix pipe model (`agent1 | agent2 | agent3`) is TTA for agents. The shell does not "execute" each program sequentially -- it sets up the transport (pipes) and data flows trigger execution. This is why Claude Code's bash tool is so powerful: it naturally supports TTA-style composition without any agent framework.

### Current Implementations

| Pattern | Implementation | Notes |
|---------|---------------|-------|
| **Unix pipes** | Native shell | The original TTA for software. `curl | jq | agent` |
| **Event-streaming agents** | Kafka + agent consumers | Agents as stream processors. Pure TTA. |
| **Webhook chains** | Zapier, n8n, Inngest | Actions trigger on data events. |
| **MCP server triggers** | MCP with server-sent events | Tool results flow back and trigger next steps. |

### Feasibility Rating: 4/5

The TTA pattern is already widely implemented in software (event streaming, pub/sub, pipes). The agent-specific innovation would be making data routing the ONLY primitive the orchestrator uses, eliminating explicit "call tool X" commands. This would require agent frameworks to adopt a transport/routing abstraction rather than an imperative tool-calling abstraction.

---

## 9. Reconfigurable Computing (FPGAs)

### What It Is

FPGAs (Field-Programmable Gate Arrays) are chips whose hardware logic can be reprogrammed after manufacturing. Unlike a fixed CPU where the instruction set is baked into silicon, an FPGA's logic blocks, routing, and I/O can be reconfigured to implement ANY digital circuit. Partial reconfiguration allows changing part of the FPGA while the rest continues operating.

### The Hardware Motivation

ASICs (Application-Specific Integrated Circuits) are fast but inflexible -- once fabricated, they cannot be changed. CPUs are flexible but slow for specialized workloads. FPGAs occupy the middle ground: they can be specialized for a task (approaching ASIC performance) but reprogrammed when requirements change. They are used in telecom, defense, high-frequency trading, and prototyping.

### The Agent Mapping

FPGAs map to **agents that reconfigure their own behavior at runtime based on the task at hand**. The "hardware" (the agent's prompt, tools, and reasoning strategy) is reprogrammed for each task.

**FPGA-style agent reconfiguration**:

1. **Prompt reconfiguration**: The system prompt changes based on the task. For a coding task, the agent loads a "software engineer" prompt with code-specific tools. For a writing task, it loads a "technical writer" prompt with document tools. This is already common.

2. **Tool reconfiguration (partial reconfiguration)**: The available tool set changes dynamically. Instead of loading all 200 MCP tools at startup, the harness loads only the tools relevant to the current task phase, then swaps them when the phase changes. This is partial reconfiguration -- some tools remain active while others are replaced.

3. **In-context learning as bitstream loading**: When you provide few-shot examples in the prompt, you are "programming" the LLM's behavior for the specific task, like loading a bitstream onto an FPGA. The model's underlying weights (the silicon) do not change, but its effective behavior does.

4. **Runtime specialization**: An agent starts as a generalist, encounters a specific problem type, and dynamically specializes by loading relevant context, examples, and tools. After the task, it de-specializes and returns to generalist mode.

**The analogy to partial reconfiguration is particularly powerful**: An FPGA can reconfigure one region while another region continues processing. Similarly, an agent could reconfigure its tools and prompt for a new task while its background processes (monitoring, event listening) continue unchanged.

### Current Implementations

| Pattern | Implementation | Notes |
|---------|---------------|-------|
| **Dynamic system prompts** | Most agent frameworks | System prompt selected based on task type. |
| **Dynamic tool loading** | MCP with selective tool registration | Load only relevant MCP servers. Anthropic's tool filtering. |
| **Few-shot prompt engineering** | Universal | In-context learning as "bitstream loading." |
| **Agent mode switching** | Claude Code's agent modes, Cursor's agent/composer modes | Coarse-grained reconfiguration. |
| **LoRA adapter swapping** | Hugging Face PEFT, Ollama | Fine-grained weight reconfiguration at inference time. |

### The Underexplored Idea: Continuous Partial Reconfiguration

Current agents reconfigure at task boundaries. An FPGA-inspired agent would reconfigure **continuously during execution** -- as the task evolves, the agent's tools, prompt sections, and examples shift without restarting. For example:

1. Phase 1 (Research): Load web_search, read_file tools. Research-oriented system prompt section active.
2. Phase 2 (Implementation): Unload web_search, load code_edit, run_tests tools. Coding prompt section replaces research section.
3. Phase 3 (Testing): Unload code_edit, load browser_control, screenshot tools. QA prompt section active.

The agent never restarts; its capabilities morph as the task progresses. This is more efficient than spawning three separate agents.

### Feasibility Rating: 4/5

Dynamic prompts and tool loading are already implemented. Continuous partial reconfiguration (seamlessly changing tools and prompt sections mid-task) is feasible but not standardized. LoRA adapter swapping is technically possible but adds latency. The main innovation would be a formalized "reconfiguration protocol" that agent frameworks adopt, allowing smooth capability transitions within a single agent session.

---

## 10. Quantum Computing Concepts

### What It Is

Quantum computing exploits quantum mechanical phenomena -- superposition (a qubit exists in multiple states simultaneously until measured), entanglement (measuring one qubit instantly determines the state of another, regardless of distance), and interference (probability amplitudes that can reinforce or cancel) -- to perform certain computations exponentially faster than classical computers. Grover's algorithm searches unsorted databases in O(sqrt(N)) vs O(N). Shor's algorithm factors integers in polynomial vs exponential time.

### The Hardware Motivation

For specific problem classes (factoring, unstructured search, quantum simulation, optimization), quantum computers offer exponential or polynomial speedups. The key is that a quantum computer with N qubits can represent 2^N states simultaneously and operate on all of them in parallel via quantum gates. This "quantum parallelism" is fundamentally different from classical parallelism -- it is not N processors working in parallel, but one system encoding exponentially many states.

### The Agent Mapping

The quantum-to-agent mapping is the loosest of all architectures in this document. Most quantum analogies to classical computing are misleading, and quantum analogies to agent design are even more so. However, there are a few conceptual mappings worth considering:

**1. Superposition as Hypothesis Branching**

A quantum computer maintains multiple states simultaneously and collapses to one upon measurement. An agent could maintain multiple hypotheses simultaneously and "collapse" to the best one only when forced to commit:

```
Task: Debug failing test

Hypothesis 1: It's a race condition       (probability 0.4)
Hypothesis 2: It's a type error            (probability 0.3)
Hypothesis 3: It's a missing dependency    (probability 0.3)

Agent spawns 3 investigation threads simultaneously.
First thread to find definitive evidence "collapses" the superposition.
Other threads are abandoned.
```

This is just speculative execution / parallel hypothesis testing. The quantum analogy adds no computational advantage, but the FRAMING is useful: explicitly tracking probability-weighted hypotheses and deferring commitment.

**2. Entanglement as Coordinated Agent State**

Two entangled qubits have correlated states. Two "entangled" agents could maintain correlated beliefs: when Agent A updates its understanding of the codebase, Agent B's understanding automatically updates (via shared state or a synchronization protocol). This is just shared state with instant propagation -- no quantum mechanics needed.

**3. Grover's Search as Structured Exploration**

Grover's algorithm finds a needle in a haystack in O(sqrt(N)) queries by using quantum amplitude amplification. An agent analog would be: instead of randomly exploring solutions, use structured amplification to focus search effort on promising regions. This maps to:
- Monte Carlo Tree Search (MCTS) for agent planning
- Best-first search instead of breadth-first or depth-first
- "Amplitude amplification" as increasing the probability/priority of promising branches

**4. Quantum Annealing as Optimization**

D-Wave-style quantum annealing finds low-energy states of optimization problems. For agents, this maps to: instead of greedily optimizing each task, frame the entire workflow as an optimization problem and find the global optimum. This is planning-as-optimization rather than planning-as-search.

### Honest Assessment

These mappings are metaphorical rather than structural. Unlike the dataflow, RISC/CISC, or pipelining mappings (which directly correspond to implementable agent harness designs), the quantum mappings do not suggest specific, novel implementations. They are useful as thinking tools but should not be mistaken for actionable architectures.

The one genuinely useful quantum concept for agents is **deferred commitment**: maintain multiple possibilities as long as possible and commit only when forced. This is already practiced in A/B testing, multi-armed bandits, and MCTS, all without quantum mechanics.

### Current Implementations

| Concept | Implementation | Notes |
|---------|---------------|-------|
| **Parallel hypothesis testing** | Multi-agent parallel investigation | Common in debugging workflows. Not quantum, just parallel. |
| **Deferred commitment** | MCTS planners, tree-of-thought prompting | Maintain multiple reasoning paths, prune later. |
| **Shared state propagation** | Redis pub/sub, shared memory stores | Instant state synchronization between agents. |

### Feasibility Rating: 2/5

The metaphors are interesting but do not yield architecturally novel agent designs. Deferred commitment and parallel hypothesis testing are valuable patterns but do not require quantum framing to implement. Including this section for completeness but recommending focus on architectures 1-9 for practical innovation.

---

## Synthesis: The Next Paradigm Shift

### Where We Are Now

Almost every production agent harness in 2026 is a Von Neumann machine:
- **Sequential control flow**: A loop that fetches a task, plans, executes tools, observes results, repeats
- **Separate processor and memory**: The LLM (processor) reads from and writes to external stores (memory)
- **Single instruction stream**: One agent executes one action at a time, even in "parallel" setups that just run multiple Von Neumann agents simultaneously
- **Program counter**: The orchestrator maintains explicit state tracking of "where we are" in the plan

### The Three Most Promising Alternative Paradigms

**Tier 1: Immediately Actionable (6-12 months to mature implementations)**

1. **Dataflow** (Section 1): Replace the sequential task loop with a dependency graph. Operations fire when inputs are ready. This is the single highest-impact architectural change for agent harnesses. LangGraph is 60% of the way there.

2. **RISC Tool Design** (Section 2): Converge on 10-15 well-composed tools rather than hundreds of specialized ones. Implement complex operations as tool-internal compositions. Industry is already moving this direction.

3. **FPGA-style Continuous Reconfiguration** (Section 9): Agents that dynamically swap tools and prompt sections mid-task without restarting. Formalize this into a protocol.

**Tier 2: Architecturally Sound, Implementation Challenge (12-24 months)**

4. **Pipelining** (Section 3): Overlap task stages across multiple tasks in flight. Requires dependency analysis and hazard detection, which are themselves LLM inference problems.

5. **TTA / Transport-Triggered** (Section 8): Make data routing the only orchestration primitive. Adopt event-streaming patterns from the data engineering world. Unix pipes as the agent interaction model.

6. **Superscalar Dynamic Scheduling** (Section 4): Automatic parallelism detection and dispatch. Needs a "scheduler agent" that analyzes task dependencies at runtime.

**Tier 3: Specialized or Philosophical (24+ months or domain-specific)**

7. **VLIW Batching** (Section 5): Effective for predictable, template workflows. Already implemented via parallel tool calling.

8. **Systolic Agent Pipelines** (Section 6): Valuable for batch processing and document pipelines. Too rigid for general agent tasks.

9. **Neuromorphic Principles** (Section 7): Not a buildable architecture today, but the principles (event-driven, minimize external memory, streaming over batching) should inform all harness design.

10. **Quantum Concepts** (Section 10): Metaphorical value only. Deferred commitment is the one actionable takeaway.

### The Prediction

**The next paradigm shift in agent design will be the move from Von Neumann sequential control to dataflow-style dependency-graph execution.** This will happen in three stages:

**Stage 1 (Now -- mid 2026)**: Agent harnesses adopt explicit dependency graphs (LangGraph, Prefect-style DAGs) but still execute sequentially along paths. Tool parallelism via VLIW-style batching (parallel tool calls).

**Stage 2 (Late 2026 -- 2027)**: True dataflow execution: all ready nodes fire simultaneously. Superscalar-style dynamic dispatch with multiple agent workers. Pipelined task processing with hazard detection. FPGA-style continuous reconfiguration eliminates agent restarts.

**Stage 3 (2027+)**: Transport-triggered / event-driven architectures replace the orchestrator loop entirely. The "harness" becomes a routing fabric, not a controller. Neuromorphic principles (event-driven, stateless, streaming) become the default design philosophy. The Von Neumann orchestrator is recognized as a transitional artifact, like batch processing before time-sharing.

### The Meta-Insight

The LLM is NOT a Von Neumann processor. It is closer to a neuromorphic, dataflow processor that operates on all inputs simultaneously and produces outputs when ready. The Von Neumann harness imposes an artificial sequential structure on a fundamentally parallel computational substrate. Every architecture in this document that moves AWAY from sequential control and TOWARD data-driven, event-triggered, parallel execution is moving in the direction of the LLM's natural computational model.

The best harness is the one that creates the least impedance mismatch between the LLM's native computation model and the orchestration layer that connects it to the world.

---

## Feasibility Summary Matrix

| # | Architecture | Agent Mapping | Current State | Feasibility | Impact | Priority |
|---|-------------|---------------|---------------|-------------|--------|----------|
| 1 | **Dataflow** | Dependency graph execution, implicit parallelism | LangGraph (partial), Prefect | 5/5 | Very High | **Tier 1** |
| 2 | **RISC/CISC** | Minimal vs rich tool sets | Vercel's 80% tool reduction, Claude Code | 5/5 | High | **Tier 1** |
| 3 | **Pipelining** | Overlapped task stages, speculative prefetch | Partial in orchestrators | 4/5 | High | **Tier 2** |
| 4 | **Superscalar** | Multi-agent dynamic dispatch with dependency analysis | tmux workers, Codex parallel | 4/5 | High | **Tier 2** |
| 5 | **VLIW** | Prompt-bundled parallel tool calls | Claude parallel tool use | 4/5 | Medium | **Tier 2** |
| 6 | **Systolic Arrays** | Pipeline agent chains, grid analysis | CrewAI sequential, MapReduce | 3/5 | Medium | **Tier 3** |
| 7 | **Neuromorphic** | Event-driven, memory-processing colocation | Streaming agents, event triggers | 2/5 (full) / 4/5 (principles) | Very High (philosophical) | **Tier 3** |
| 8 | **TTA** | Data-routing-only orchestration, event triggers | Kafka agents, Unix pipes | 4/5 | High | **Tier 2** |
| 9 | **FPGA** | Dynamic prompt/tool reconfiguration mid-task | Dynamic prompts, MCP tool loading | 4/5 | High | **Tier 1** |
| 10 | **Quantum** | Deferred commitment, parallel hypothesis testing | MCTS, tree-of-thought | 2/5 | Low | **Tier 3** |

---

## Appendix: Recommended Reading

### Computer Architecture
- Hennessy & Patterson, *Computer Architecture: A Quantitative Approach* (6th ed.) -- The definitive reference for all architectures discussed.
- Arvind & Culler, "Dataflow Architectures" (1986) -- The foundational paper on tagged-token dataflow.
- Dennis, "First Version of a Data Flow Procedure Language" (1974) -- Where dataflow programming began.
- Kung, "Why Systolic Architectures?" (1982) -- The original systolic array paper.
- Mead, "Neuromorphic Electronic Systems" (1990) -- Carver Mead's vision that started neuromorphic computing.

### Agent Architecture
- Anthropic, "Building effective agents" (2025) -- Workflows vs agents, tool design patterns.
- LangGraph documentation -- The closest current implementation to dataflow agent execution.
- The Orchestrator v3 devlog -- Practical lessons from tmux-based multi-agent execution (superscalar-adjacent).
- DeepMind coordination overhead paper -- The 1.724 exponent that limits multi-agent parallelism (the superscalar width limit for agents).

---

*This document is exploratory research. The architectures described here are lenses for thinking about agent design, not rigid prescriptions. The most actionable insight is that the Von Neumann sequential loop is the default but not the inevitable architecture for agent harnesses, and alternatives from 50 years of computer architecture research offer concrete blueprints for the next generation of agent systems.*
