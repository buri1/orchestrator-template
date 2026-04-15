---
title: "Computer Architecture: The Field and Its Landscape"
date: 2026-04-12
topic: harness-architecture
angle: field-overview
relevance: critical
---

# Computer Architecture: The Field and Its Landscape

> "What scientific branch is this?"
>
> The short answer: **Computer Architecture**, a subfield of **Computer Engineering** that sits at the seam between electrical engineering and computer science. It is the discipline that decides how a computing system's functional units are named, connected, scheduled, and exposed to software. When Millidge (2023) says LLM harnesses "reinvented the Von Neumann architecture," he is pointing to a body of knowledge that has been studied formally since the 1940s and taught as a canonical subject since Hennessy & Patterson's 1990 textbook. This document maps that territory.

---

## 1. Naming the Field(s)

The question "which science studies this?" has five overlapping, non-identical answers. They are not synonyms; each has a different granularity, audience, and set of standard questions.

| Field | Granularity | Core question | Where it lives academically |
|---|---|---|---|
| **Computer Architecture** | The programmer-visible machine (ISA + memory model + I/O model) | "What does the machine *look like* to software?" | CS departments, ACM SIGARCH, ISCA/MICRO/ASPLOS/HPCA |
| **Microarchitecture** | The gate/pipeline/cache realization of an architecture | "How do we actually build it out of transistors and cycles?" | EE/CS hybrid, MICRO, HPCA |
| **Computer Organization** | The textbook level: datapaths, control, buses | "How do the big blocks fit together?" | Undergraduate CS/ECE core |
| **Computer Engineering** | The full discipline spanning hardware + firmware + low-level software | "How do we build usable computing systems from physics up?" | ECE departments, IEEE Computer Society |
| **Systems Architecture** | Cross-cutting: hardware + OS + network + storage as one whole | "How does the *whole system* meet its workload?" | Industry + systems research (SOSP, OSDI, NSDI) |

These sit in a rough hierarchy of abstraction. A clean way to read it, due to Tanenbaum, is that a modern machine has six levels: digital logic, microarchitecture, instruction set architecture (ISA), operating system machine, assembly language, and problem-oriented language. Computer architecture proper lives at level 3 (the ISA); microarchitecture at level 2; organization spans 2-3; systems architecture cuts across 3-6; computer engineering owns everything from 0 to 2.

### Adjacent sciences

Computer architecture does not live alone. Four neighbors matter for the harness discussion.

- **Operating systems theory** (Dijkstra, Lampson, Saltzer, Liskov): schedulers, protection, virtualization, IPC, storage stacks. The OS is the software-side twin of the hardware memory model. Every question a harness asks ("when do I preempt an agent?", "how do I isolate a tool?", "how do I page state in and out?") has an answer already worked out in OS theory.
- **Compiler design** (Aho, Muchnick, Lattner): translation, optimization, scheduling, register allocation. Compilers are the artifact that *consumes* an architecture. The prompt-construction layer of a harness is structurally a compiler back-end: it lowers "intent" into an instruction stream the LLM can decode.
- **Distributed systems** (Lamport, Liskov, Brewer, Kleppmann): consensus, replication, failure models, clock skew, partial failure. Multi-agent harnesses inherit every hard problem this field has catalogued and then some, because LLM nodes are nondeterministic.
- **Programming language theory** (Landin, Milner, Plotkin): semantics, types, effects, continuations. Tool schemas are miniature type systems; the ReAct loop is a continuation-passing interpreter.

The key insight for the harness discussion: **the harness question is not a new branch of science**. It is a rediscovery of the intersection of computer architecture, OS theory, and compiler design, phrased in natural-language terms and running on a stochastic substrate.

---

## 2. Canonical Thinkers and Texts

A harness designer who wants to know "what does the field actually know?" can read a surprisingly small core. In rough order of how load-bearing each text is for our question:

| Work | Authors | Year | Why it matters for harnesses |
|---|---|---|---|
| *Computer Architecture: A Quantitative Approach* | Hennessy & Patterson | 1990 (6e 2017) | The bible. Defines Amdahl's law, pipelining, memory hierarchy, ISA design as *quantitative* tradeoffs. Every harness benchmark exercise is methodologically downstream of chapter 1. |
| *Computer Organization and Design* | Patterson & Hennessy | 1993 (6e 2020) | The undergraduate companion. MIPS/RISC-V as pedagogical ISA. If you've never built a pipeline, read this first. |
| *Structured Computer Organization* | Tanenbaum | 1976 (6e 2013) | The six-level abstraction model. The clearest defense of "architecture is about *layers*, not about chips." |
| "First Draft of a Report on the EDVAC" | von Neumann | 1945 | The original sin. Stored-program concept, single shared memory for code and data, sequential fetch-execute. The paper Millidge is invoking. |
| *The Mythical Man-Month* + "No Silver Bullet" | Brooks | 1975 / 1987 | Architecture-as-conceptual-integrity. A harness with conceptual integrity (Claude Code's "dumb loop") beats a harness with many clever features. |
| *Introduction to VLSI Systems* | Mead & Conway | 1980 | The text that enabled everyone to design chips. Proved that architectural experiments become possible when the design tooling catches up. Analogous to what Claude Code's SDK is doing for harness experimentation. |
| "Very High-Speed Computing Systems" | Flynn | 1966 | The taxonomy below (SISD/SIMD/MISD/MIMD). The single most quoted classification in the field. |
| "Design of Ion-Implanted MOSFETs" | Dennard et al. | 1974 | Dennard scaling. Tells us *why* Moore's law produced exponential performance for 30 years and why it stopped. |
| "Cramming More Components..." | Moore | 1965 | Moore's law. Relevant to harnesses because "scaling stops, we need architecture" is exactly the phase LLMs are entering. |
| "Validity of the Single Processor Approach..." | Amdahl | 1967 | Amdahl's law. Governs the upper bound on speedup from parallel sub-agents. |
| "Reevaluating Amdahl's Law" | Gustafson | 1988 | Gustafson's law. The optimistic counterpoint: problem size grows with resources. |
| "Can Programming Be Liberated from the Von Neumann Style?" | Backus | 1978 | Turing Award lecture. The original serious attack on Von Neumann. Argued for function-level programming. Every time someone says "the ReAct loop is wasteful," they are replaying Backus 1978. |
| "On the Cruelty of Really Teaching Computing Science" | Dijkstra | 1988 | A reminder that computation is a *mathematical* object. Harness engineers who ignore this get surprised by nondeterminism. |
| "End of the Line for Von Neumann?" | Hennessy & Patterson | CACM 2019 | The "golden age of computer architecture" Turing lecture. Explicitly argues that domain-specific architectures are the future. The harness field is one case of their thesis. |
| "Scaffolded LLMs as Natural Language Computers" | Millidge | 2023 | The pivot essay that drags all of the above into the LLM conversation. |

Three more names belong in any honest list: **Turing** (the theoretical ceiling of what any architecture can compute), **Mauchly and Eckert** (ENIAC, the physical birth of the field), and **Barbara Liskov** (substitutability, abstract data types, the thing every tool schema in a harness is silently relying on).

---

## 3. The Full Landscape of Architectures

The field's "periodic table." Each row: core idea, problem solved, failure modes, relevance to LLM agents. The taxonomy is not clean - most real machines are hybrids - but the archetypes are load-bearing.

### 3.1 Von Neumann

**Core idea.** One memory holds both instructions and data. A single CPU fetches instructions sequentially, decodes, executes, writes back. One program counter. Unified address space.

**Problem solved.** Self-modifying programs and universal computation in a physically realizable machine. Before EDVAC, machines were *wired* for a specific computation.

**Failure modes.** The **Von Neumann bottleneck** (Backus, 1978): the single bus between CPU and memory throttles the whole system. Sequential fetch-decode-execute imposes a hard data dependency. Modern CPUs hide this with caching, pipelining, and speculation, but the bottleneck is architectural, not implementational.

**LLM relevance.** This is the claim Millidge is making and that Agent 3 will unpack. The relevant feature is *unification*: the LLM's context window is a single shared memory for "instructions" (system prompt, tool schemas) and "data" (tool outputs, user messages). The relevant failure is the same: the context window is a single shared resource and a single bottleneck. Context rot is a natural-language version of cache thrashing.

### 3.2 Harvard & Modified Harvard

**Core idea.** *Separate* memories for instructions and data, with separate buses. Code can be fetched while data is read/written in the same cycle. Modified Harvard (what every modern CPU actually is) splits the L1 cache into L1i and L1d but unifies further down the hierarchy.

**Problem solved.** Doubles effective memory bandwidth for code-heavy workloads. Eliminates an entire class of self-modifying-code bugs. Makes security easier: executable and writable can be mutually exclusive pages (W^X).

**Failure modes.** You give up self-modifying code (often fine) and must deal with two address spaces or invalidation protocols between the split caches.

**LLM relevance.** Agent 2 will do the deep dive, but the headline: a harness that keeps *prompt and tool-output* in the same physical store (today's reality) is Von Neumann. A harness that keeps instructions in one store (system prompt + tool schemas, loaded read-only, cacheable at the KV layer) and data in another (scratchpad + tool outputs, mutable, bounded) is Harvard. Prompt caching is a crypto-Harvard move that the field has already accidentally reinvented.

### 3.3 Dataflow architectures

**Core idea.** No program counter. No imperative control flow. Instructions fire as soon as their operands are available. The program is a directed graph; tokens flow along edges; nodes execute when all inputs arrive. Manchester Dataflow Machine (Gurd & Watson, 1978), MIT Tagged-Token Dataflow (Arvind, 1983).

**Problem solved.** Maximum exposure of parallelism. Expresses pure data dependencies without imposing false sequential ordering. Natural fit for functional languages.

**Failure modes.** Token storage explosion. Matching tokens to waiting instructions is expensive. Hard to handle mutable state and I/O. Dataflow machines never became mainstream as pure designs, but the ideas survived: out-of-order execution in superscalar CPUs is microarchitectural dataflow; TensorFlow is application-level dataflow.

**LLM relevance.** LangGraph is a dataflow architecture. State graphs with nodes that fire when inputs arrive. This is not metaphorical - it is the same abstraction the 1978 Manchester team formalized. The failure modes are also the same: graph construction becomes a meta-programming problem, mutable state is awkward, token storage (i.e., intermediate node state) bloats. When Anthropic says they prefer a "dumb loop" over an explicit state graph, they are replaying the historical argument that won: Von Neumann beats pure dataflow for general workloads, dataflow wins for regular, predictable computations.

### 3.4 Systolic arrays

**Core idea.** Kung & Leiserson (1978). A regular grid of simple processing elements (PEs). Data "pulses" through the grid like blood through a heart (hence *systolic*). Each PE does a local op and passes partial results to its neighbors. No global control.

**Problem solved.** Maximum arithmetic intensity per unit of memory bandwidth. Perfect for linear algebra (matmul, convolution, FFT). Google's TPU is a systolic array.

**Failure modes.** Rigid topology. Only useful for workloads with regular data dependencies. Control flow and branching are unnatural. You have to *think in pipes*.

**LLM relevance.** Multi-agent harnesses with fixed roles ("researcher -> summarizer -> writer") are one-dimensional systolic arrays. AutoGen's sequential orchestration and CrewAI's task pipelines are structurally this. They inherit the strengths (high throughput on regular work, clean mental model) and the failure modes (rigid, bad at irregular tasks). The honest read of the Manus "rebuilt five times" story is that they kept discovering their systolic-shaped harnesses couldn't handle irregular work and had to go back toward Von Neumann generality.

### 3.5 VLIW and EPIC

**Core idea.** Very Long Instruction Word. Instead of the hardware figuring out what can run in parallel (out-of-order execution), the **compiler** packs multiple independent operations into one wide instruction. EPIC (Explicitly Parallel Instruction Computing), the philosophy behind Intel's Itanium, pushed this further.

**Problem solved.** Moves complexity from hardware to software. In principle, simpler, faster, more energy-efficient hardware; smarter compiler does the scheduling.

**Failure modes.** The compiler has to be psychic. Memory access times are unpredictable, so any static schedule eventually stalls. Itanium famously failed commercially against out-of-order x86. The lesson: **static scheduling cannot beat dynamic scheduling when the workload has real variance.**

**LLM relevance.** Plan-and-execute harnesses (LLMCompiler and friends) are VLIW. The planner compiles a static schedule of tool calls. When it works (regular workloads, short horizons), the 3.6x speedup is real - exactly analogous to VLIW's wins on DSPs. When it fails (a tool returns something unexpected mid-plan), the whole schedule is invalidated and you're back to replanning, which is slow. The Itanium lesson applies: static plans lose to dynamic ReAct loops when variance is high. This is not a new war; the field fought it in 1994-2005.

### 3.6 RISC vs CISC

**Core idea.** CISC (x86, VAX): many complex instructions, variable length, microcode-decoded, some instructions do a lot. RISC (MIPS, ARM, RISC-V, POWER): few simple instructions, fixed length, hardwired, load-store, pipeline-friendly.

**Problem solved.** RISC's insight (Patterson, Hennessy, Cocke in the late 70s / early 80s): simpler instructions clock faster and pipeline better, and the compiler can synthesize complex behaviors from simple primitives. The quantitative argument won. Modern x86 is CISC in name only - internally it decodes into RISC-like micro-ops.

**Failure modes.** RISC needs a good compiler. CISC can be seductive - "why not add an instruction for X?" - until the decode logic becomes a bottleneck.

**LLM relevance.** A tool library design question. **CISC-style tools**: one powerful tool like `run_shell(cmd)` or `apply_patch(diff)` that does a lot. **RISC-style tools**: many small tools like `read_file`, `write_file`, `grep`, `glob`. Anthropic's Manus rebuild story is a RISC-to-CISC collapse: "complex tool definitions became general shell execution." Vercel's "removed 80% of tools from v0" is the same move - fewer, more powerful tools. The emerging consensus (circa 2026) looks *more* like CISC at the tool level, which is historically unusual - and probably means the LLM is strong enough to be its own instruction scheduler, obviating the RISC-pipelining argument.

### 3.7 Vector / SIMD / GPU / SIMT

**Core idea.** Single Instruction, Multiple Data. One operation applied to a whole register full of values. Cray-1 (1976) was the canonical vector supercomputer. SSE/AVX are SIMD extensions to x86. GPUs are SIMT (Single Instruction, Multiple Threads) - a hybrid that looks like SIMD to the hardware but like many threads to the programmer.

**Problem solved.** Data parallelism. If you're doing the same op to a million numbers, amortize the instruction fetch across all of them. This is how we got modern ML.

**Failure modes.** Branch divergence (if different "lanes" take different paths, they serialize). Poor fit for irregular workloads. Memory layout matters enormously.

**LLM relevance.** Batched inference across many prompts is SIMD at the hardware level. At the harness level, the equivalent is fan-out parallelism: spawn N sub-agents, each does the same task on different data, gather results. Anthropic's "sub-agent delegation" pattern used for independent file searches is SIMT. The failure mode is the same as GPUs: branch divergence. If one sub-agent needs to do something different, the whole batch stalls or wastes work.

### 3.8 Domain-specific architectures (DSA)

**Core idea.** Instead of a general-purpose CPU, design silicon for one narrow workload: TPUs for matmul, DSPs for convolution, cryptographic ASICs, video codecs. Hennessy & Patterson's 2019 Turing lecture argued this is the future of hardware because general-purpose scaling has ended.

**Problem solved.** 10-100x perf/watt versus a CPU for the target workload. Enables workloads that would otherwise be economically impossible.

**Failure modes.** Lock-in to the workload. When the workload changes, the silicon is scrap. TPUs only became sensible because the transformer architecture stabilized.

**LLM relevance.** A "domain-specific harness" is a harness designed for one workload (code editing, research, customer support) instead of general agency. Claude Code is a DSA for software engineering. Its tool set, memory format, and verification loops are narrow and specialized. The Hennessy-Patterson 2019 argument - "general-purpose scaling is dead, DSAs are the future" - is the field's prediction that harnesses will fragment into workload-specific designs rather than converge on a single "agent OS."

### 3.9 Neuromorphic

**Core idea.** Build silicon that mimics biological neurons and synapses. Spiking neural networks, event-driven computation, no clock, massive parallelism at very low power. IBM TrueNorth, Intel Loihi, SpiNNaker.

**Problem solved.** Orders-of-magnitude power reduction for certain workloads (sensor fusion, always-on perception). Biological plausibility for neuroscience research.

**Failure modes.** Programming model is hostile. No one knows how to write general software for a spiking network. Mostly a research curio in 2026.

**LLM relevance.** Mostly none, directly. Indirectly: the neuromorphic community has worked out how to build useful systems out of nondeterministic, noisy, event-driven components - which is structurally what an LLM is. There is quiet work on "event-driven" harnesses where agents respond to filesystem and calendar events rather than running a polling loop. That is a neuromorphic stance dressed in Unix clothes.

### 3.10 In-memory / near-data computing

**Core idea.** Move the computation to the data instead of the data to the computation. Processing-in-Memory (PIM), Samsung's HBM-PIM, UPMEM. Puts small ALUs next to DRAM banks.

**Problem solved.** The Von Neumann bottleneck at the DRAM level: fetching data dominates energy cost. Doing the op *inside* the memory module avoids that.

**Failure modes.** Awkward programming model. Coherence with the main CPU is hard.

**LLM relevance.** RAG pipelines that do retrieval and filtering "close to" the vector store (server-side filters, hybrid BM25+vector) are near-data computing. The principle: don't drag all matching documents into the context window, do the filtering at the database. Every harness that uses just-in-time retrieval instead of loading full files is quietly practicing this.

### 3.11 Reconfigurable: FPGAs and CGRAs

**Core idea.** Hardware whose function is set at configuration time, not fabrication time. FPGAs (fine-grained, lookup-table level). CGRAs (coarse-grained, ALU-level).

**Problem solved.** Build a domain-specific architecture *without a foundry*. Useful when workload is narrow enough to beat CPUs but not stable enough to justify an ASIC.

**Failure modes.** Design tooling is notoriously hostile. Synthesis is slow. Clock speeds are lower than equivalent ASICs.

**LLM relevance.** Harnesses whose topology is determined per-task by the LLM itself are reconfigurable. AutoGen's Magentic orchestrator, which builds a task ledger and wires specialists together on the fly, is a coarse-grained reconfigurable architecture. The advantage is flexibility; the disadvantage is that "synthesizing" the harness (planning) is slow and error-prone.

### 3.12 Quantum (for completeness)

**Core idea.** Use superposition and entanglement to compute on amplitudes, not bits. Speedups for specific problem classes (factoring, search, simulation).

**LLM relevance.** None today. Listed for honesty.

### 3.13 Cellular automata and unconventional

**Core idea.** Computation as the evolution of a grid of simple local rules (Wolfram, Conway's Life, lattice gas automata). Or: billiard ball computers, chemical computers, DNA computers, reservoir computing.

**LLM relevance.** The honest read: these are mostly curiosities, but *reservoir computing* has one interesting hook. A reservoir is a fixed nonlinear dynamical system you perturb and read out. Treating a frozen LLM as a "reservoir" and training only a small readout layer is a real 2023-2026 research direction, and it recasts the harness as "the readout" rather than "the program." This is a radically different mental model than the Von Neumann one and may be a useful frame later.

---

## 4. The Science of the Field: Questions, Tradeoffs, Methods

Computer architecture is an unusual science because its object of study is largely built, not found. It has its own characteristic questions, tradeoffs, and methods.

### 4.1 The questions it asks

- **What is the right abstraction boundary between hardware and software?** (The ISA question.) Every harness component asks the software-side version: what is the right abstraction boundary between the LLM and the code around it?
- **What should be fast, what should be slow, what should not exist?** The memory hierarchy question. Harnesses ask: what should be in the prompt, what should be one tool call away, what should be three tool calls away, what should never be accessible?
- **Where should complexity live?** Hardware vs compiler vs runtime vs programmer. Harnesses: model vs harness vs prompt vs user.
- **How do we make the common case fast without making the rare case broken?** The canonical Hennessy-Patterson refrain. For harnesses: how do we make the 10-step task fast without the 200-step task becoming unusable?
- **How do we measure "better"?** The benchmarking question. The field's answer is one of its most important exports.

### 4.2 The tradeoffs it studies

The field is unusually disciplined about naming the tradeoff space. A partial list:

| Tradeoff | Hardware framing | Harness analogue |
|---|---|---|
| Latency vs throughput | Pipeline depth, batch size | Per-turn latency vs tasks-per-hour |
| Generality vs efficiency | CPU vs ASIC | Generic agent vs Claude Code-style DSA |
| Static vs dynamic scheduling | VLIW vs OoO | Plan-and-execute vs ReAct |
| Simplicity vs specialization | RISC vs CISC | Tool count and granularity |
| Hardware vs software | Microcode vs compiler | Harness thickness |
| Consistency vs performance | Cache coherence protocols | Memory verification before action |
| Predictability vs utilization | Real-time vs best-effort | Guardrails vs throughput |
| Power vs performance | Dennard scaling, DVFS | Cost (tokens) vs capability |
| Reliability vs speed | ECC, replication, voting | Verification loops, LLM-as-judge |

Every one of the "7 decisions" Akshay's article lists is a rediscovery of one of these hardware tradeoffs. That is not criticism. It is why the field's intellectual scaffolding transfers.

### 4.3 Characteristic methods

Five methodological commitments mark the field and are worth borrowing:

1. **Quantitative evaluation.** Hennessy & Patterson's "quantitative approach" is the founding move: no architectural claim is admissible without numbers on representative workloads. The harness equivalent is TerminalBench, SWE-bench, and the LangChain ranking exercises - these are the field's SPECint.

2. **Benchmarks as shared ground truth.** SPEC CPU, TPC, Linpack, MLPerf. Benchmarks are flawed but necessary: they force comparability. The harness field is still at the "everyone has their own eval" stage, which is exactly where CPU benchmarks were in 1988 before SPEC.

3. **Simulation.** Cycle-accurate simulators (gem5, Simics, SimpleScalar) let you study architectures that don't exist yet. The harness equivalent is replay-and-mutate: record a real agent trace, then perturb the harness and see what breaks. This is underdeveloped.

4. **Formal models.** Memory models (TSO, release consistency), cache coherence protocols (MESI, MOESI), queueing models for pipelines. Harnesses have almost nothing like this. There is no formal model of "context rot" that would let you prove a harness does not suffer from it. Filling this gap is probably the biggest scientific opportunity in the space.

5. **Design space exploration.** Systematic sweeps over parameters (cache size, issue width, pipeline depth). The harness analogue is sweeping over context-budget allocation, tool granularity, verification frequency. Done almost entirely by feel in 2026.

### 4.4 Characteristic laws and limits

The field has a small number of "laws" that keep being rediscovered in other domains:

- **Amdahl's law**: the maximum speedup from parallelizing a fraction p of a computation is 1/(1-p). Relevant every time someone assumes multi-agent = N times faster.
- **Gustafson's law**: for scalable workloads, problem size grows with resources, so speedup is nearly linear. The optimistic multi-agent story.
- **Little's law**: in a stable queue, L = lambda * W. Governs how many concurrent tool calls you can have in flight given per-call latency and throughput requirements.
- **Dennard scaling**: power density stayed constant as transistors shrank (until ~2006). Relevant because its end is exactly the condition that forced the field to switch from "faster chips" to "smarter architectures" - and LLM scaling laws are entering the analogous phase.
- **The memory wall**: CPU speed grew 50%/yr, DRAM 7%/yr, so memory dominated. The harness equivalent: context window capacity grows fast, context quality grows slowly, so context engineering dominates.
- **The roofline model**: performance is bounded by min(peak compute, operational intensity * memory bandwidth). Tells you when you are compute-bound vs memory-bound. A harness roofline would bound performance by min(model reasoning capacity, context retrieval quality * tool throughput). Nobody has drawn this yet.

---

## 5. Which Architectural Styles Have Been Borrowed?

Reading the 2026 harness landscape through the architecture lens:

### Clearly borrowed (conscious or not)

| Architectural idea | Harness instance | Evidence |
|---|---|---|
| **Von Neumann stored-program** | Context window as unified memory for prompt and data | Millidge 2023 explicit; universal |
| **Memory hierarchy** | Context (L1) / memory files (L2) / database (L3) / web (main memory) | Claude Code's three-tier memory is textbook hierarchy |
| **Microcode / dumb loop** | Anthropic's "intelligence in the model, harness is a dumb loop" | Direct quote from Anthropic docs; parallels hardwired-control philosophy |
| **Dataflow graphs** | LangGraph state graphs | Explicit in LangGraph docs |
| **Systolic pipelines** | CrewAI sequential pipelines, AutoGen sequential pattern | Structural match |
| **Out-of-order execution** | ReAct's dynamic tool dispatch | Same principle: fire when operands ready |
| **Speculation and rollback** | Git-commit checkpoints in Claude Code, LangGraph time-travel | Branch prediction with replay on misprediction |
| **Cache coherence / verification** | "Agent treats its memory as a hint and verifies against actual state" | Directly analogous to cache invalidation before use |
| **Protection rings / W^X** | Permission system in Claude Code (40+ gated capabilities) | Three-stage check: load-time, call-time, run-time |
| **Interrupt handling** | Input guardrails and tripwire mechanisms | Asynchronous interruption of the main loop |
| **Context switching** | Sub-agent spawning with condensed return summaries | Classic OS context switch, minus the registers |

### Not yet borrowed, but plausibly promising

| Idea | What it could give harnesses |
|---|---|
| **Modified Harvard split** | Physically separate code (prompt, schemas) from data (tool outputs) to eliminate a class of failures and enable aggressive caching. Today's KV caching is a degenerate case; full Harvard would be cleaner. (Agent 2 goes deep here.) |
| **Formal memory models** | A TSO-equivalent for context windows: what ordering guarantees does compaction preserve? Would let us reason about correctness instead of guessing. |
| **Roofline analysis** | A two-axis plot: reasoning intensity vs retrieval bandwidth. Would tell a harness designer where their bottleneck *is*. |
| **Near-data computation** | Structured database queries as tool calls, instead of "retrieve and reason." Some RAG systems already do this; most don't. |
| **ECC / replication / voting** | Run the same subtask on three sub-agents and majority-vote. Cheap fault tolerance against hallucination. Anthropic has experimented; not mainstream. |
| **Coarse-grained reconfigurable arrays** | Runtime-rewired harnesses that assemble specialist agents into a dataflow graph per-task. AutoGen's Magentic pattern is the prototype. |
| **DSA / workload-specific design** | Explicit commitment to "this harness is for software engineering / research / customer support," stripping generality. Claude Code is the proof this works. |
| **Branch prediction** | Speculative tool execution based on predicted paths, with cheap rollback. Present in research (Meta's Cicero, some LLMCompiler variants), almost absent in production. |
| **Memory barriers** | Explicit ordering points in the harness where "all prior tool calls must have completed and been reflected in context" before proceeding. Would prevent a whole class of subtle sub-agent races. |

### Architectures that probably don't map

- **Pure dataflow** (Manchester-style): too rigid, same reason it lost in hardware.
- **VLIW**: empirically bad at high-variance workloads, as LLMCompiler's limits are already showing.
- **Quantum**: no plausible bridge.
- **Neuromorphic**: no tooling; event-driven harnesses borrow the *stance* but not the substrate.

---

## 6. What the Field Knows That the Harness Field Is Still Learning

Four durable lessons from 80 years of computer architecture that the harness field has not yet internalized in 2026:

1. **Dynamic scheduling beats static scheduling in the long run, but only after hardware gets good enough to hide the complexity.** Translation: the current ReAct-vs-plan debate will end the same way the VLIW-vs-OoO debate ended, and by the same mechanism (the "hardware" - the model - gets smart enough that the schedule is better made dynamically). Anthropic's bet on thin harnesses is the field's historical favorite.

2. **The abstraction boundary matters more than the components.** ISA design is 90% picking the right boundary; once you pick it, the components fall out. The analogous question for harnesses is: what is the "ISA" between harness and model? Today it is messy and implicit. Whoever formalizes it first gets the RISC-V of agents.

3. **Benchmarks shape the field more than theory does.** SPEC CPU did more to direct architecture research than any paper. TerminalBench and SWE-bench are already doing the same for harnesses - and their biases are already baked into the designs of the winning harnesses. This is not a complaint, it is a pattern the field should notice.

4. **Scaling stops, then architecture starts.** The "golden age of computer architecture" (Hennessy & Patterson's 2019 Turing lecture) started when Dennard scaling ended. The analogous moment for LLMs - when raw parameter scaling stops paying its way and harness design becomes the primary driver of capability - may already be here. If it is, the playbook of the field (DSAs, quantitative benchmarks, tight hardware-software codesign, aggressive specialization) is the roadmap.

---

## 7. Reading List for the Curious Harness Designer

If you read only these, in order, you will understand the field well enough to design harnesses without reinventing its mistakes.

1. **Hennessy & Patterson**, *Computer Architecture: A Quantitative Approach*, chapters 1, 2, 5 (fundamentals, memory hierarchy, thread-level parallelism).
2. **Tanenbaum**, *Structured Computer Organization*, chapter 1 (the six-level model).
3. **von Neumann**, "First Draft of a Report on the EDVAC" (skim; it is short and historic).
4. **Backus**, "Can Programming Be Liberated from the Von Neumann Style?" (Turing lecture, 1978). The canonical attack, still instructive.
5. **Hennessy & Patterson**, "A New Golden Age for Computer Architecture" (CACM, February 2019). The thesis that DSAs are the future.
6. **Millidge**, "Scaffolded LLMs as Natural Language Computers" (2023). The pivot into the LLM conversation.
7. **Dennard et al.** (1974) and **Moore** (1965). Short. Read for context on why hardware scaling stopped.
8. **Amdahl** (1967) and **Gustafson** (1988). Two pages each. Read them side by side.
9. **Saltzer & Kaashoek**, *Principles of Computer System Design*, chapters on naming and modularity. The OS-theory bridge.
10. **Lamport**, "Time, Clocks, and the Ordering of Events in a Distributed System" (1978). The distributed-systems bridge; relevant the moment you have more than one agent.

---

## 8. TL;DR

The scientific field is **computer architecture**, an empirical-quantitative subdiscipline of computer engineering with a well-defined textbook canon, a shared benchmarking methodology, and a small set of load-bearing laws. Its central activity is naming tradeoffs and picking abstraction boundaries. It has been doing this continuously since 1945.

The LLM harness community in 2026 is in roughly the position hardware architects were in around 1975: the basic working pattern (Von Neumann) is clear, people are starting to notice its bottlenecks, a few specialists (systolic, dataflow, DSA) are making inroads, and the benchmarks are maturing. Everything from cache coherence to roofline analysis to RISC-vs-CISC is quietly re-occurring inside the harness conversation, usually without attribution.

The practical payoff of learning the field is not new gadgets. It is vocabulary and humility. Vocabulary, because the tradeoffs already have names. Humility, because most "novel" harness design choices are rediscoveries of decisions the field made (and sometimes un-made) decades ago. The scaffolding metaphor is exactly right: the harness is scaffolding. Computer architecture is the field that learned, the hard way, how to build scaffolding that holds.
