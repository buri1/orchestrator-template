---
title: "Parallel Computing Paradigms for Multi-Agent Orchestration"
date: 2026-04-12
topic: harness-architecture
angle: parallel-computing
relevance: high
---

# Parallel Computing Paradigms for Multi-Agent Orchestration

> Multi-agent systems are parallel computing. Anthropic's "maximize a single agent first" rule is not a stylistic preference -- it is a consequence of Amdahl's law applied to a workload whose serial coordination overhead is unusually large and whose parallel speedup is unusually hard to extract. This document takes the parallel-computing canon -- Flynn, Amdahl, Gustafson, Valiant, Hoare, Dean & Ghemawat, Blumofe & Leiserson -- and walks it through the harness question. The goal is a quantitative answer to "when does splitting work across agents actually help, and by how much."
>
> The short version of the answer, derived below: **for tasks with realistic coordination overhead and LLM handoff costs, the optimal team size is two or three agents, and only for workloads whose parallel fraction exceeds ~70%.** This is not an aesthetic claim; it falls out of minimizing a cost function whose exponent the DeepMind paper pegged at 1.724. The rest of this document shows the derivation and uses it to rank the existing multi-agent patterns from "robust to coordination overhead" to "structurally unsound."

## 1. Why Parallel Computing Is the Right Lens

The multi-agent debate keeps getting framed as philosophy -- teams versus solo, emergent versus coordinated, LangGraph versus the dumb loop. The interesting question is the one hardware architects have been asking since 1967: **when you split a problem across more workers, how much faster does it actually run, and what is the irreducible serial fraction?**

Framing multi-agent as parallel computing buys three things: closed-form speedup bounds from Amdahl and Gustafson, vocabulary for the failure modes (branch divergence, straggler effect, coordination overhead), and a catalogue of patterns whose winners and losers are already known. The rest of this document goes narrow on the parallelism axis: math of speedup, taxonomy of parallel patterns, coordination-cost optimization, and the quantitative answer to "how many agents is too many." Agent 1 covered the broader computer-architecture field; I will not re-relitigate dataflow, Harvard, or Von Neumann here.

## 2. Flynn's Taxonomy, Re-read for Agents

Flynn's 1966 paper "Very High-Speed Computing Systems" gave the field its most-cited classification: **SISD, SIMD, MISD, MIMD**, by the multiplicity of instruction and data streams. It is coarse, and 60 years later it is still the first slide of every parallel-computing class, because it forces an answer to *what is replicated and what is shared*.

**SISD** -- single instruction, single data. The single-agent baseline. Anthropic's "dumb loop" is SISD. The entire co-evolution argument -- models post-trained with a specific harness -- assumes SISD as the unit of training. "Maximize a single agent first" is really "make the case your model was optimized for work before you start replicating it."

**SIMD** -- one program, many operands, same op applied in parallel. Cray-1 was the canonical vector machine; modern GPUs inherit the logic at the warp level. The agent analogue is the **fan-out search pattern**: one prompt template, N inputs, one result per input. Claude Code subagents launched in parallel to grep N files, a RAG reranker scoring N candidate passages, batch classification of N tickets. The failure mode is the same as GPUs: **branch divergence**. If one sub-search escalates to a different tool, the "batch" stalls. Mitigations from the GPU literature -- coalesce by expected complexity, cap divergence depth, fall back to sequential for outliers -- transfer directly and are mostly unused in 2026 harnesses.

**MISD** -- multiple instructions, single data. Flynn's rarest quadrant in hardware (space-shuttle flight computers, some systolic-adjacent designs). For agents, MISD is the **review/voting/judge** pattern: one candidate answer, N independent evaluators (correctness, style, safety, performance), each emitting an isolated verdict. This is the quadrant where multi-agent is *structurally* most defensible: the judges don't talk to each other, coordination overhead approaches zero, and the quality gain is well-studied -- Triple Modular Redundancy (Lyons 1962) in hardware, ensembling in ML, self-consistency decoding (Wang et al. 2022) in LLMs. Anthropic's LLM-as-judge recommendation is a N=1 instance of MISD; generalizing to N=3 is the single cheapest multi-agent move available.

**MIMD** -- many operations, many data. Every modern multi-core CPU, and what people mean by "multi-agent" without qualification: N agents, different goals, different data, possibly communicating. MIMD gives you the highest parallelism ceiling and every hard problem parallel computing has catalogued: load balancing, deadlock, livelock, memory coherence, and the one that dominates LLM systems -- coordination overhead. The rest of this document is about how to tame MIMD without paying the coordination tax twice.

### Where the existing frameworks land

| Framework / pattern | Flynn quadrant |
|---|---|
| Claude Code default loop | SISD |
| Claude Code fan-out over files | SIMD |
| Claude Code Fork / Teammate / Worktree | MIMD |
| OpenAI Agents SDK handoffs & agents-as-tools | SISD with RPC (parent blocks) |
| LangGraph parallel edges | MIMD |
| CrewAI sequential crews | SISD pipeline |
| AutoGen group chat | MIMD with shared memory |
| AutoGen Magentic | MIMD with a scheduler |
| LLM-as-judge / self-consistency | MISD |

Two observations. First, most of what is marketed as "multi-agent" in 2026 is actually SISD-with-handoffs -- not parallel, merely *dispatched*. Second, the patterns that are genuinely MIMD are the ones where coordination cost is highest and speedup hardest to extract, while the most productive patterns (SIMD fan-out, MISD voting) are structurally the simpler ones. The literature has said this since the 1970s.

## 3. Amdahl's Law: The Ceiling on Multi-Agent Speedup

### 3.1 The formula

Amdahl, at AFIPS 1967 ("Validity of the Single Processor Approach to Achieving Large-Scale Computing Capabilities"), derived the most-quoted inequality in parallel computing. Decompose a task into a serial fraction *s* and a parallel fraction *p* = 1 − *s*. On *n* workers:

> T(n) = s + p/n
> S(n) = 1 / (s + p/n)
> S(∞) = 1 / s

**The speedup ceiling is the reciprocal of the serial fraction, regardless of how many workers you throw at it.** 80% parallel → at most 5x with infinite workers. 95% parallel → at most 20x. 50% parallel → at most 2x. The law is brutal at the low-parallelism end.

### 3.2 The multi-agent translation

In the agent setting, *s* bundles every cost that does not parallelize across sub-agents: context packaging by the parent, handoff marshaling, per-child system-prompt preamble, result merging, summarization on return, and replanning on conflict. None of these speed up with more children.

**What is *s* in practice?** A typical fan-out-then-gather in 2026:

- Parent spends ~5k tokens planning the fan-out.
- Each child spends ~20k tokens on its subtask.
- Parent spends ~3k tokens summarizing on return.

Measuring in token-time (the actual latency/cost bound), on a two-child fan-out:

> s ≈ (5 + 3) / (5 + 2·20 + 3) ≈ 8/48 ≈ 0.17
> S(∞) = 1 / 0.17 ≈ 5.9x

Realistic fan-out speedups: S(3) ≈ 1/(0.17 + 0.28) ≈ 2.2x; S(6) ≈ 3.2x. Beyond six, diminishing returns dominate even before coordination overhead is counted. That **2-3.5x ceiling** matches Anthropic's reported multi-agent research speedups and is the quantitative argument behind "maximize a single agent first": with a 17% irreducible serial fraction, three or four children already saturate the budget.

### 3.3 When Amdahl is cruel

Amdahl bites worst on tasks that *look* parallel but have a long serial merge. Classic hardware cases: parallel matrix factorizations with serial back-substitution, parallel sorts with serial merge. Agent analogues:

- **Deep research** where N children explore topics but the final synthesis is one narrative the parent must author. You can fan out the reading; you cannot fan out coherent writing. Anthropic's research-agent work parallelizes retrieval and serializes the write-up for exactly this reason.
- **Code refactors** with interdependent changes. Last commit wins or conflicts; serial fraction is effectively 100% per function.
- **Multi-step reasoning** where step N depends on step N-1. No parallelism available.

Diagnostic: *can I identify an independent parallel phase and a bounded merge?* If no, don't parallelize.

### 3.4 Amdahl refinements

Hill & Marty 2008 ("Amdahl's Law in the Multicore Era") factored in chip-area budgets and showed that a small number of **asymmetric** cores often beats many symmetric ones. Translated: a big-parent / small-worker harness beats peer-to-peer. Woo & Lee 2008 added energy and showed power-constrained speedups are tighter still; replace energy with tokens and you get the same curve. Amdahl's original pessimism is, if anything, *too generous* for agent harnesses, because the hardware tricks that let real CPUs beat Amdahl in practice (OoO execution, speculation, caching) have no direct agent analogue yet.

## 4. Gustafson's Law: The Optimistic Counterargument

Gustafson (Sandia, 1988, "Reevaluating Amdahl's Law") pointed out that Amdahl assumes a *fixed* problem size. Practitioners don't use extra cores to finish the same problem faster; they use them to solve **bigger** problems in the same wall-clock time.

Gustafson's **scaled speedup**, with *s* and *p* now fractions of the parallel execution time:

> S_scaled(n) = s + p·n = n − s(n − 1)

Speedup grows linearly in *n* with slope 1 − *s*. No asymptotic ceiling; the question is how fast you can grow the problem.

Agent reframing: not "how much faster with more agents?" but "how much *more* work in the same wall-clock?" This changes which patterns look good. A research sweep that reads 30 papers with one agent reads 90 with three; a codebase audit that scans 500 files with one agent scans 3000 with six. Coverage scales linearly.

**Amdahl applies to fixed-size, latency-bound tasks. Gustafson applies to scalable, throughput-bound tasks.** Confusing them misallocates agents in both directions: complaining that 10 agents only deliver 2x speedup on a latency-bound task (Amdahl was always going to win), or dismissing multi-agent on a coverage task because "we only got 3x speedup" (you got 3x *coverage*, which was the real metric). Diagnostic: would finishing twice as fast be useful, or would finishing twice as much be useful?

## 5. The Coordination-Cost Model

### 5.1 The DeepMind exponent

Amdahl assumes coordination is a fixed fraction of total work. In practice it grows with team size. Brooks's *Mythical Man-Month* (1975) noted the number of pairwise channels in a team of *n* is n(n−1)/2 ≈ n²/2: communication scales quadratically, and adding people to a late project makes it later.

A 2024 DeepMind paper on multi-agent LLM coordination (referenced in the user's project memory) measured coordination cost and fit an empirical exponent of **1.724** to the overhead: coordination_cost ∝ n^1.724. This sits between linear and Brooks's quadratic, consistent with hierarchical communication where each new agent adds a sub-linear number of direct partners but a super-linear count of indirect dependencies.

Total time for a task of size T with n agents:

> T_total(n) = T/n + C·n^1.724

where *C* is the per-agent coordination constant (tokens for handoffs, context packaging, merge sync).

### 5.2 Optimal team size, derived

Minimize T_total with respect to n:

> dT_total/dn = −T/n² + 1.724·C·n^0.724 = 0
> T = 1.724·C·n^2.724
> **n\* = (T / (1.724·C))^(1/2.724)**

The optimal team scales with the ~0.37 power of the task/coordination ratio:

| T/C | Optimal n | Comment |
|---|---|---|
| 10 | ~1.9 | Single agent still nearly optimal |
| 35 | ~3.0 | Sweet spot for typical fan-out |
| 100 | ~4.4 | Larger research-style work |
| 1,000 | ~10.3 | Only for unusually big, cleanly splittable tasks |
| 10,000 | ~24 | Rare in practice |

**Optimal team size grows very slowly with task size** -- a 10x bigger task only wants ~2.3x more agents. This is why real multi-agent systems converge on small teams across wildly different task types.

### 5.3 What T/C actually looks like

Estimate T (tokens of useful work if done serially) and C (per-worker handoff cost, typically 5-15k tokens of parent+child overhead per worker in a fan-out). For realistic 2026 LLM work, C is high relative to T:

- Research deep-dive: T ≈ 100k, C ≈ 10k → T/C ≈ 10 → n\* ≈ 1.9 agents
- Multi-source synthesis: T ≈ 300k, C ≈ 10k → T/C ≈ 30 → n\* ≈ 2.8 agents
- Codebase audit with N files: T ≈ 500k, C ≈ 15k → T/C ≈ 33 → n\* ≈ 2.9 agents
- Support triage: T ≈ 7k, C ≈ 10k → T/C ≈ 0.7 → don't parallelize

**The math agrees with the user's memory note: 2-3 agents is optimal for realistic work.** The constraint is not the task size; it is that C (per-handoff coordination cost) is large in LLM token economics. If handoffs were cheaper (smaller C), optimal teams would be larger. They are not, so they aren't.

### 5.4 When the exponent is different

The 1.724 is specific to DeepMind's measured workload. Different topologies give different exponents:

- **MISD voting** (judges on fixed input): exponent ≈ 1.0. No inter-agent comms; optimal bounded by diminishing quality returns (3-5 judges).
- **Independent fork-join**: exponent 1.0-1.2. Optimal teams of 6-10 when work is genuinely independent.
- **Shared-state group chat / democratic consensus**: exponent ~2.0, matching Brooks. Optimal team 1-2. The democratic-committee failure mode is the direct consequence.
- **Hierarchical manager + specialists**: exponent ~1.5. Optimal teams of 4-6.

Practical prescription: **choose your topology so the coordination exponent is as close to 1.0 as possible.** MISD voting and independent fan-out are cheapest. Shared-state group chat is the most expensive.

## 6. Data Parallelism vs Task Parallelism

Parallel computing distinguishes two orthogonal decompositions. Both apply to agents with different costs.

**Data parallelism** (SPMD) is same computation, different data. MPI, OpenMP `parallel for`, every GPU kernel. Agent examples: N agents each searching one of N repos, each summarizing one of N PDFs, each refactoring one of N files. Coordination is low -- no inter-agent comms, only a merge at the end. With the 1.724 exponent, optimal teams of 4-8 for typical data-parallel work. This is the easy case, and the only one where "more agents = more throughput" holds nearly linearly up to the merge ceiling.

**Task parallelism** is different computations, same or different data. OpenMP `sections`, Cilk `spawn`, Go goroutines. Agent examples: researcher retrieving while critic checks citations while writer drafts; security-review and perf-review agents running in parallel on the same diff. Coordination is higher because agents have different goals and may interact. If outputs are truly independent -- they only meet at the end -- task parallelism is roughly as cheap as data parallelism. If outputs are **coupled** (researcher's findings change what the writer drafts, and vice versa), feedback loops blow up the coordination exponent. The production fix is to **break the feedback**: freeze a spec, commit to a handoff, accept slightly worse quality for dramatically lower coordination.

Rule of thumb: prefer data-parallelism when data is heterogeneous and computation is uniform; prefer task-parallelism when computation is heterogeneous and data is shared. Both beat MIMD-with-shared-state. If you can't frame your workload as either, don't parallelize.

## 7. Pipeline Parallelism

Assembly-line parallelism: N stages, each running concurrently on a different item. CPU pipelines, Unix pipes, Apache Beam, Kafka Streams. **Latency unchanged, throughput multiplied.** A k-stage pipeline still takes k stages per item, but produces one completed item per stage-time -- k times the throughput. The speedup only shows up on a *stream*.

Agent examples: a content pipeline (research → outline → draft → edit → publish) with five articles in flight; a code-review pipeline (lint → test → security → human) with multiple PRs flowing; support triage (categorize → route → respond).

Pathologies are inherited from CPU pipelines: the slowest stage bottlenecks everything (no amount of extra workers in other stages fixes a slow stage); stage failures cause downstream bubbles (retry within the stage, don't bubble up); speculative cross-stage execution causes hazards (don't do it).

**Pipeline vs fan-out** have different speedup profiles. Fan-out reduces latency of a single task (good for Amdahl-bound work where one user waits). Pipeline multiplies throughput of a task stream (good for Gustafson-bound work where the metric is items-per-hour). A single user query gets nothing from a pipeline; a batch of 1000 gets near-linear throughput speedup up to the slowest-stage ceiling.

## 8. MapReduce

Dean & Ghemawat (OSDI 2004), the most-cited systems paper of the 2000s. Two-phase: a **map** applies a function to every input in parallel (no inter-worker comms), a **reduce** combines map outputs via associative reduction. MapReduce is a special case of fork-join with a committed shape: embarrassingly-parallel fork, associative-combiner join. That discipline is what made it scale to thousands of workers with automatic load balancing, fault tolerance, and straggler mitigation.

**Agent MapReduce.** Claude Code's Task tool subagents and OpenAI's agents-as-tools are MapReduce in disguise. Parent fans out (map), each child returns a condensed summary, parent folds summaries into a final response (reduce). Three failure modes are well-understood:

- **Straggler effect**. The map phase finishes when the slowest mapper finishes. Hadoop speculatively re-executes slow mappers; agent harnesses rarely do. Adding speculative re-execution (start a duplicate if one agent is lagging) is a cheap win.
- **Context rot at the reduce step**. Parent receives N summaries; if N is large or summaries are long, the parent's context bloats and quality degrades. This is the single biggest agent-MapReduce failure mode and the reason Claude Code limits subagent returns to 1-2k token summaries.
- **Non-associative reduce**. Classical MapReduce assumes associative combiners so partial reductions can happen in parallel. LLM summarization is *not* associative; merge order matters. Unfixed.

**The reduce step is where the engineering lives.** 20 years of Hadoop experience: the map is easy, every framework handles it; the reduce needs combiners, hierarchical reduction, spill-to-disk, skew handling. Agent harnesses have not internalized this. Most multi-agent research patterns do a hand-wavy "parent summarizes child outputs" that *is* the reduce, and it is where context rot and coordination overhead explode. Harnesses that work treat reduce as first class: **hierarchical summarization** (combine two at a time, not all-at-once), **rolling compaction** (summarize as children return), and **schema-constrained reduction** (force structured returns that merge mechanically rather than by LLM). Claude Code's "condensed summary" convention is Hadoop's combiner pattern by another name.

## 9. Fork-Join and Work-Stealing

Fork-join is MIMD divide-and-conquer without MapReduce's strict shape. From Cilk (Blumofe & Leiserson 1996), now in Java's ForkJoinPool, .NET TPL, and every modern concurrency library. Primitives: `fork(task)` spawns a concurrent task, `join(task)` waits for it.

Claude Code's three execution models are exactly three points on the fork-cost / join-cost / isolation tradeoff. **Fork** (byte-identical context clone) is cheap on fork, expensive on join (parent must reconcile changes). **Teammate** (separate pane with file-mailbox) is expensive on fork (child reloads context), cheap on join (mailbox is just a file). **Worktree** (own git worktree) is expensive on both sides but offers perfect isolation. Hardware has the same spectrum: shared-memory fork-join (Cilk) matches "Fork," distributed-memory fork-join (MPI) matches "Worktree."

**Work-stealing**, Blumofe & Leiserson's bigger contribution, is the key. Idle workers steal pending tasks from busy workers' queues; the result is provably good load balancing with bounded overhead even on irregular task trees. In 2026 almost no agent harness does this. Instead harnesses use static assignment (idle workers wait) or manager polling (extra coordination overhead).

Work-stealing for agents would look like: a shared task store (beads, GitHub issues, a database), workers pulling their next task on completion, no central manager. This is exactly what the user's `pi-orchestrator` does -- GitHub issues as the task store, workers pulling next task on PR merge. It is the cheapest way to load-balance multi-agent work, and the literature has said so since 1996.

## 10. CSP and Channel-Based Concurrency

Hoare, "Communicating Sequential Processes" (CACM 1978). The slogan: **"Don't communicate by sharing memory; share memory by communicating."** Independent processes with private state, connected by typed channels, coupled only through explicit message passing. Go goroutines, Erlang actors, Occam, and Rust mpsc channels are all descendants.

Multi-agent harnesses rediscover CSP in two forms. **Mailbox-based** (Claude Code Teammate, gascity's file-mailbox): each agent has a directory as its mailbox, others drop files in, the agent polls. Channels are filesystem directories, messages are files -- this is distributed CSP. **HTTP RPC** (OpenAI agents-as-tools, MCP servers): parent requests, child returns, synchronous.

The CSP vocabulary names failure modes:

- **Deadlock**: two agents each waiting on the other. Agent analogue: group chat where no one wants to take the lead. Mitigation: timeouts, designated leader, break the cycle architecturally.
- **Livelock**: infinite ping-pong without progress. Agents revising each other's drafts forever. Mitigation: iteration caps, a judge that can end the loop.
- **Channel saturation**: sender out-paces receiver. A research agent firing results at a slow writer. Mitigation: backpressure (bounded channels) or explicit buffering.

File-mailbox CSP has real advantages for agent systems: **durability** (mailboxes survive crashes, classical CSP processes don't), **inspectability** (a human can `ls` the queue), **language-neutrality**, and **replay** for debugging. The disadvantages are the classical ones: polling latency and filesystem overhead. For long-running multi-hour agent systems, durability dominates.

CSP also gives a formal composition algebra. Agent harnesses in 2026 are built by gut feel; formal CSP analysis could prove deadlock-freedom and check saturation. Open scientific opportunity.

## 11. Bulk Synchronous Parallel (BSP)

Valiant, "A Bridging Model for Parallel Computation" (CACM 1990). BSP builds parallelism around **supersteps**, each with three phases: local computation, communication, and a global **barrier** before the next superstep starts. The barrier is expensive (slowest worker sets the pace) but it makes reasoning enormously simpler: between barriers, workers are independent, and each superstep can be analyzed in isolation. BSP underlies Google Pregel, Apache Giraph, and Apache Hama.

**BSP is the model most multi-agent research workflows actually run on, even when they don't call it that.** The current conversation you are reading was produced by a BSP system: wave 1 of 10 agents explored independently, the user synthesized at a barrier, wave 2 of 10 agents explored the gaps with richer context from wave 1. Waves = supersteps. Research-wave patterns generalize to any {explore → barrier → review → explore} workflow.

BSP's advantages for agent work are substantial: simple reasoning about progress (between barriers, each agent is a self-contained SISD task with no interference), natural checkpointing (save at each barrier), explicit budget control (decide at each barrier whether to continue), clean cost accounting. The disadvantage is classical: the slowest agent sets the wave duration (the straggler problem), and no computation-communication overlap at superstep boundaries.

**The BSP cost model** makes multi-agent harnesses cost-predictable. For a superstep with *w* = max local compute, *h* = max message volume, *g* = per-message bandwidth cost, *l* = barrier latency:

> cost_superstep = w + g·h + l

For an agent harness: *w* is the slowest agent's LLM time, *h* is the largest child summary, *g* is per-token context-packaging cost, *l* is the fixed parent cost to launch the next wave. Total cost is the sum of supersteps. This is a predictable cost estimator you can compute before running -- almost nothing else in the 2026 harness literature has this property, and it is probably the most transferable piece of parallel-computing theory to agent harnesses today.

## 12. Speculative Parallelism

Hardware speculative execution (branch prediction, out-of-order, HTM) executes multiple branches before knowing which is needed and discards the wrong ones. The real-world speedup is 2-4x, paid in wasted energy. Agent analogue: run multiple candidate plans in parallel and keep the one that works.

The cost model: if *p* is the probability speculation is correct and *c* is the cost of the speculative path, expected speedup is roughly (1 − c)/(1 − p). You win only if *p* is high and *c* is low. For LLM harnesses *c* is high (every speculative path costs a full LLM pass), so *p* must be very close to 1. Full "run two candidate plans in parallel" speculation is almost always a loss in 2026 token economics. May become worth it as models get cheaper.

What *is* worth it: **cheap read-only speculation** -- precomputing RAG retrievals, warming sandboxes, prefetching file contents. The hardware rule applies directly: **speculate on reads, never on writes.** CPUs speculate loads (stored in a shadow register file, thrown away on mispredict) but not stores (they would need transactional memory to undo). Agents speculating reads are fine; agents speculatively editing files and rolling back will burn you every time.

## 13. When Multi-Agent Actively Hurts

The failure modes, catalogued:

- **Coordination dominates** (Amdahl violation). Task is less than ~70% parallel; coordination wipes out the benefit. Measure the serial fraction honestly; if >30%, don't split.
- **Context loss at handoffs**. Parent's context has information the child needs but can't afford to pass; the child re-derives it, badly. Most common production failure mode.
- **Lost tacit knowledge**. The main agent has built up session intuition the child can't inherit. The child makes choices the main agent would have known were wrong. Invisible in benchmarks, obvious in use.
- **Interference in shared state**. Group chat, shared files -- agents step on each other's work. Isolation fixes it but defeats the point.
- **Democratic consensus failure**. Peer agents negotiating to agreement converge slowly or not at all. Structural: agreement is a global property and global properties are expensive in distributed systems.
- **Straggler effect**. Slowest agent sets the wave duration.

Anthropic's "split only when tool overload exceeds ~10 overlapping tools or clearly separate domains" collapses to: split if *k > k_max* (where k_max ≈ 10-12 for 2026 frontier models) OR *d > 1* distinct domains. Both conditions are rare in real tasks; default answer is "don't split."

**Break-even conditions for going multi-agent:** serial fraction *s* < 0.3, task size T > 10·C, tool count > k_max OR domains ≥ 2, independent sub-tasks with minimal feedback, clear merge strategy. If all five hold, multi-agent is worth it and optimal team is 2-3. If any one fails, multi-agent is probably a loss. In practice the five rarely all hold, which is why most production harnesses are single-agent.

## 14. Patterns That Actually Work in 2026

Six patterns are grounded in parallel-computing theory and observed to work in real harnesses:

1. **Fan-out for independent reads** (SIMD). N agents each handle N files/sources/URLs; merge by summarization. Optimal n: 3-6. Stragglers are the main risk; pre-sort by expected size.
2. **MISD voting / LLM-as-judge**. N judges on one candidate; majority or weighted vote. Optimal n: 3 cheap, 5 important. Correlated errors are the main risk; diversify prompts and (if budget) models.
3. **BSP research waves**. Wave of N exploring, barrier, next wave with richer context. Optimal n per wave: 5-10 (Gustafson-bound). Reduce-step bloat is the main risk; structured returns + hierarchical combine.
4. **Pipeline for streams**. N stages concurrent on a stream. Optimal n = however many stages the task has. Slowest stage bottlenecks; measure and right-size.
5. **Work-stealing from a shared task store**. Workers pull next task from a central queue (issues, beads, database). Optimal n: bounded by token budget, not coordination. Small-task thrashing is the main risk; size tasks to ≥10 min of agent work each.
6. **Hierarchical (manager + specialists)**. Manager plans, specialists execute, manager integrates. Optimal team: 1 manager + 2-4 specialists. Manager context bottleneck is the main risk; keep specialist outputs short, write to files.

**Patterns to avoid**: democratic peer negotiation (too expensive), fully shared-state group chat without a lead (coordination explodes), deep bidirectional feedback loops (make iterative with bounds), speculative writes, N > 10 for latency-bound work.

## 15. Synthesis

Eighty years of parallel-computing literature give the harness field a clear set of conclusions:

- **Anthropic's "maximize a single agent first" is the right default**, not for philosophical reasons but because Amdahl plus realistic coordination costs put the break-even beyond most individual tasks. The math says so.
- **Optimal team size is 2-3 for latency-bound tasks, 5-10 for throughput-bound coverage tasks.** Not a heuristic -- the minimizer of T/n + C·n^1.724.
- **The cheapest multi-agent patterns are MISD voting and SIMD fan-out**, because both have near-zero inter-agent communication. Understood since the 1970s, work out of the box.
- **The most expensive are shared-state peer-to-peer collaboration** (group chat, democratic consensus), where coordination scales super-linearly. Appealing in principle, broken in practice.
- **BSP is the right model for multi-wave research**: predictable, checkpointable, cost-estimable. Most existing research-agent workflows are already BSP under other names.
- **Work-stealing is the right scheduler** for shared-backlog systems. Needs a central task store and stateless workers. The user's `pi-orchestrator` already does this.
- **The reduce step is where multi-agent systems die.** 20 years of Hadoop say the reducer is where the engineering lives. Any harness without a disciplined reduce strategy hits context rot at the merge.
- **Speculative parallelism rarely pays** in 2026 token economics. Speculate on reads, never on writes.
- **Static scheduling loses to dynamic scheduling** once variance is real. Plan-and-execute beats ReAct only for regular short-horizon tasks.

The single most actionable conclusion: **if you're going multi-agent at all, start with MISD voting at N=3.** Cheapest, safest, highest-quality pattern. Implied by LLM-as-judge, generalizes trivially, immediate quality gain for minimum coordination overhead. Then add SIMD fan-out for independent reads. Everything else -- group chat, democratic consensus, deep negotiation, speculative planning -- is research-grade and should not ship without explicit measurement that it beats the simpler patterns.

Parallel computing has a 60-year head start on multi-agent. Read Amdahl 1967, Gustafson 1988, Valiant 1990, Hoare 1978, Dean & Ghemawat 2004, Blumofe & Leiserson 1996. Each is under 20 pages. Together they tell you what will and will not work before you try it.

## 16. References

- Amdahl, G. M. (1967). "Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities." AFIPS Spring Joint Computer Conference.
- Backus, J. (1978). "Can Programming Be Liberated from the Von Neumann Style?" CACM 21(8). Turing Award lecture.
- Blumofe, R. D., & Leiserson, C. E. (1996). "Cilk: An Efficient Multithreaded Runtime System." Journal of Parallel and Distributed Computing.
- Brooks, F. P. (1975). *The Mythical Man-Month*. Addison-Wesley.
- Dean, J., & Ghemawat, S. (2004). "MapReduce: Simplified Data Processing on Large Clusters." OSDI.
- Dijkstra, E. W. (1975). "Guarded Commands, Nondeterminacy and Formal Derivation of Programs." CACM 18(8).
- Flynn, M. J. (1966). "Very High-Speed Computing Systems." Proceedings of the IEEE 54(12).
- Gustafson, J. L. (1988). "Reevaluating Amdahl's Law." CACM 31(5).
- Hill, M. D., & Marty, M. R. (2008). "Amdahl's Law in the Multicore Era." IEEE Computer 41(7).
- Hoare, C. A. R. (1978). "Communicating Sequential Processes." CACM 21(8).
- Kung, H. T., & Leiserson, C. E. (1978). "Systolic Arrays (for VLSI)." Sparse Matrix Proceedings.
- Lyons, R. E., & Vanderkulk, W. (1962). "The Use of Triple-Modular Redundancy to Improve Computer Reliability." IBM Journal of Research and Development.
- Valiant, L. G. (1990). "A Bridging Model for Parallel Computation." CACM 33(8).
- Wang, X., et al. (2022). "Self-Consistency Improves Chain of Thought Reasoning in Language Models." arXiv:2203.11171.
- Woo, D. H., & Lee, H.-H. S. (2008). "Extending Amdahl's Law for Energy-Efficient Computing in the Many-Core Era." IEEE Computer 41(12).

And (for the source material this research sprint is building on):
- Pachaar, A. (2026). "The Anatomy of an Agent Harness." X/Twitter, April 12, 2026.
- Millidge, B. (2023). "Scaffolded LLMs as Natural Language Computers." Blog essay.
- Hennessy, J., & Patterson, D. (2019). "A New Golden Age for Computer Architecture." CACM, February 2019. Turing lecture.
- DeepMind (2024). Multi-agent coordination cost paper (exponent 1.724). Reference from project memory; formal citation pending.
