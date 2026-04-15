---
title: "CPU Microarchitecture Techniques Applied to Agent Harnesses"
date: 2026-04-12
topic: harness-architecture
angle: cpu-microarchitecture
relevance: high
---

# CPU Microarchitecture Techniques Applied to Agent Harnesses

## Premise

Beren Millidge's 2023 "Scaffolded LLMs as Natural Language Computers" made the analogy precise: an LLM is a CPU, the context window is RAM, vector stores are disk, tools are device drivers, the harness is the OS. If the analogy is literal — and the empirical evidence from LLMCompiler (3.6x speedup from reordering), prefix caching (10x throughput), and speculative decoding (2x latency) suggests it is — then seventy years of CPU microarchitecture research is a cheat sheet we have not finished reading.

This document walks technique by technique. For each: the CPU version with a historical anchor, the LLM analog, a note on who (if anyone) has implemented it, and a relevance rating. The closing section documents which techniques do **not** transfer and why, because knowing the boundary of an analogy is as valuable as knowing its interior.

A warning up front: the analogy breaks down at the substrate. A MIPS R2000 instruction is deterministic, cheap, idempotent, and has a fixed latency. An LLM "instruction" — a token, a turn, a tool call — is stochastic, expensive, often side-effecting, and has latency that varies by two orders of magnitude. Every technique below is bent by this mismatch. The ones that survive the bending are the interesting ones.

---

## 1. Pipelining

**CPU version.** The MIPS R2000 (1986, Hennessy's original RISC design) formalized the classic five-stage pipeline: Instruction Fetch, Decode, Execute, Memory, Writeback. Each stage took one cycle, and a new instruction entered the pipeline every cycle. The IBM Stretch (1961) had pioneered the idea; MIPS made it teachable. The payoff: 5x theoretical throughput from overlap, modulo hazards.

**LLM analog.** An agent turn decomposes naturally into stages: Prompt Assembly → LLM Inference → Output Parse → Tool Dispatch → Result Integration → Context Update. Today these run strictly serially per turn. A pipelined harness could overlap them: while the tool runs, start assembling the prompt for the next turn (predicted next user message, or next step in a planned sequence); while the model is generating tokens, begin speculatively fetching context that the model is likely to ask for.

**Current practice.** Token streaming is a crude pipelining hint: the first tokens of the model output start executing in downstream code while the tail is still being generated. Claude Code uses this for progressive rendering. LangGraph has no true pipelining; turns are synchronous barriers. Anthropic's recent async tool use (multiple tools launched in parallel while the model continues generating) is the closest thing to pipelined execution in production.

**Hazards.** The canonical RAW (read-after-write) hazard maps perfectly: if turn N+1 depends on the result of turn N's tool call, you can't usefully speculate on N+1. This creates a pipeline stall. The same hazard taxonomy transfers — RAW, WAR, WAW — and so does the same mitigation: forwarding (pipe tool results directly to the next prompt assembly without waiting for a full commit) and bypass networks. The deeper observation is that most agent workloads are highly dependent; branch-heavy, pointer-chasing code stalled classic pipelines badly too, which is why Pentium 4's 31-stage pipeline was a dead end.

**Relevance: HIGH.** This is where the single biggest latency win probably lives, and nobody is doing it systematically yet.

---

## 2. Cache Hierarchies

**CPU version.** Maurice Wilkes proposed the "slave memory" in 1965, later renamed cache. The IBM System/360 Model 85 (1968) shipped it first. By the 2020s every server CPU had L1 (~32 KB, 1 cycle), L2 (~256 KB, 10 cycles), L3 (~32 MB shared, 40 cycles), and DRAM (100+ cycles). The hierarchy exists because you cannot simultaneously have large, fast, and cheap memory — you fake it by making the common case hit the small fast tier.

**LLM analog.** The hierarchy is already visible in every production harness, though nobody calls it that:

- **L0 — Attention KV cache.** Per-request, sub-millisecond. Exists only during one inference call.
- **L1 — Prompt prefix cache.** Anthropic's cached system prompts, OpenAI's cached inputs, DeepSeek's explicit prefix cache. Survives across requests within a session, ~10x cheaper, minutes of TTL. This is the equivalent of an L1 data cache.
- **L2 — In-context working set.** The current conversation history in the model's context window. Seconds-to-minutes lifetime, full-speed access (it's literally what the model is conditioned on).
- **L3 — On-disk memory files.** Claude Code's CLAUDE.md, AGENTS.md, MEMORY.md, progress files. Pulled in lazily via grep/head. ~10-100 ms access via filesystem.
- **L4 — Vector store / RAG index.** Pinecone, Turbopuffer, embeddings. ~100 ms to seconds, unbounded capacity.
- **L5 — Raw filesystem and web.** Unbounded, expensive, needs explicit tool call. The analog of spinning disk or cold storage.

**Cache lines and prefetching.** A "cache line" in LLM terms is a chunk of context that moves together: a file, a section of a document, a tool result block. Prefetching is RAG prefetch — loading related chunks before the model asks. Claude Code's three-tier memory (150-char index always loaded, topic files on demand, raw transcripts via search) is a textbook direct-mapped-cache-with-eviction policy.

**Write policies.** CPUs distinguish write-through (every store updates L1 and backing store immediately) from write-back (dirty line written only on eviction). The LLM equivalent question: when a tool produces a result, should the harness immediately persist it to L3 (disk, memory file), or keep it only in L2 (transient context) and let it evaporate? Most frameworks default to write-through for state-like things (LangGraph checkpoints every super-step) and write-back for exploratory things (Claude Code keeps tool outputs in context and only persists what the model decides to save via a Write call). The write-back strategy is more token-efficient but has the classic problem: on crash, you lose dirty lines. Claude Code's git-commit-as-checkpoint is an explicit write-back barrier.

**Cache coherence between tiers.** See section 11.

**Relevance: HIGH.** This model is the cleanest transfer in the entire document. Every harness designer is implicitly reinventing it; making it explicit would clarify trade-offs that are currently hand-wavy.

---

## 3. Branch Prediction

**CPU version.** The 2-bit saturating counter (Jim Smith, 1981) was the first dynamic predictor. Yeh and Patt's two-level adaptive predictor (1991) used global history to capture patterns. McFarling's gshare (1993) XORed the global history with the PC to index the prediction table. Perceptron predictors (Jiménez and Lin, 2001) applied single-layer neural nets to the problem. Modern CPUs hit 97%+ prediction accuracy on SPEC workloads. The payoff: on deep pipelines, a mispredict costs 15-20 cycles, so every 1% accuracy gain matters.

**LLM analog.** Predict which tool the model will call next, and prefetch the context that tool will need, in parallel with inference. This is almost completely absent from production harnesses.

The prediction signal is there: tool-call sequences have strong Markov structure. After `Grep`, the next call is almost always `Read`. After `Read`, it's often `Edit`. After `Edit`, it's often `Bash` (run tests). A simple 2-bit counter per (previous-tool, next-tool) transition would capture most of the value. A gshare-style predictor keyed on the last 3-4 tools would do better. Nothing prevents training a perceptron predictor on aggregate telemetry.

**Proposal.** Maintain a (tool_n-1, tool_n) transition table per project or per agent type. Before the model even finishes generating, speculatively launch the top-1 (or top-2) predicted next tool with the predicted arguments derived from the current context. On a correct prediction, the tool result is already warm when the model commits to it. On a mispredict, throw away the speculative work.

**Risks.** Tool calls are side-effecting, so speculation is dangerous (see section 4 and section 13). Prediction has to be restricted to read-only tools, or to tools whose speculative execution is provably safe (pure queries, cache warmers).

**Relevance: MEDIUM-HIGH.** The payoff depends on how expensive a single prefetch is versus the context-assembly latency it saves. For Claude Code-style workflows with many small reads, likely a real win.

---

## 4. Speculative Execution

**CPU version.** Tomasulo's algorithm (IBM 360/91, 1967) introduced dynamic scheduling. The Intel Pentium Pro (1995, P6 microarchitecture) made speculative out-of-order execution mainstream: instructions after a predicted branch execute immediately, results are held in a Reorder Buffer (ROB), and committed to architectural state only when the branch resolves. Mispredicted paths are squashed.

**LLM analog.** Speculate entire tool-call paths. If the agent's intent is ambiguous ("find the bug in this module" — is it in file A or file B?), launch tool calls for both possibilities in parallel. When the model disambiguates, keep the matching branch's results in context and discard the others.

**Existing hints.** Self-consistency decoding (Wang et al., 2022) is a speculative technique at the token level: sample multiple reasoning paths, keep the one whose answer wins a majority vote. Tree-of-Thoughts generalizes to branching exploration. LLMCompiler speculatively launches independent tool calls but does not actually speculate across branches — it just parallelizes what is already provably independent.

**Security implications.** This is the Spectre/Meltdown territory for LLMs and it is genuinely scary. Transient execution attacks on CPUs leak data through microarchitectural side channels — cache state, branch predictor state, timing. The LLM analogs are disturbing:

- **Cache-state leaks.** If a speculative tool call reads a file the model is not supposed to see, does it leave a trace in the prompt cache that a later attacker prompt can detect? Prompt caches are usually per-session, which helps, but shared caches (for billing-discount purposes) are a real attack surface.
- **Timing leaks.** Speculative execution latency depends on the speculated branch. A prompt-injection attacker could probe timings to exfiltrate data.
- **Prompt-injection-driven speculation.** A malicious document in context tricks the model into speculatively calling a tool that leaks data. Even if the model later "corrects" itself, the side effect already happened.

Simon Willison's "dual LLM" pattern and the CaMeL architecture (Debenedetti et al., 2025) are the closest things to mitigations: isolate untrusted content to a quarantined LLM that cannot directly call privileged tools. This is structurally the same as Intel's post-Spectre fix of adding speculation barriers (`LFENCE`) and kernel page-table isolation. The CPU world took two years and multiple microarchitecture generations to patch; the LLM world has barely started.

**Relevance: MEDIUM for speculation itself, HIGH for the security implications.** The speedup is real but bounded; the attack surface is large and underexplored.

---

## 5. Out-of-Order Execution

**CPU version.** Tomasulo's 1967 algorithm for the IBM 360/91 dynamically scheduled floating-point instructions using reservation stations and a common data bus, letting instructions execute as soon as their operands were ready rather than in program order. The Pentium Pro (1995) brought this to mainstream x86. Modern CPUs have 200+ in-flight instructions and reorder windows of hundreds of instructions deep.

**LLM analog.** Given a set of tool calls, execute them in dependency order rather than token order. A tool call DAG is exactly what a dataflow scheduler consumes. LLMCompiler (Kim et al., 2023) does this explicitly: a Planner produces a DAG of tool calls, a Task Fetching Unit dispatches them as soon as their dependencies resolve, a Joiner reasons over the results. The reported 3.6x speedup over ReAct is in the ballpark of the speedups that out-of-order brought x86 in the 1990s — not a coincidence.

**Identifying dependencies.** The CPU has it easy: dependencies are encoded as register reads and writes, visible in the instruction encoding. The LLM harness has to infer dependencies from tool arguments. The Planner prompt must be structured so the model produces DAG edges explicitly (LLMCompiler does this by asking the model to emit `$1`, `$2` style placeholders for "the result of task 1"). ReWOO uses a similar variable-substitution scheme. Dependency detection in free-form tool calls is an unsolved problem and usually conservative (assume dependency if in doubt → serialize).

**Relevance: HIGH, but already in production.** LLMCompiler is the poster child. The open question is how far this scales: CPUs get linear speedup up to ~4 ILP (instruction-level parallelism) and then the dependency graph starves them. Agent workloads probably hit similar limits, and the "memory wall" analog (tool latency dominating) kicks in around there.

---

## 6. Register Renaming

**CPU version.** Tomasulo's original contribution (1967) and the heart of every modern OoO core. The x86 ISA has 16 architectural registers; the Skylake physical register file has 180. Renaming eliminates WAR and WAW false dependencies by giving every write a fresh physical register; two instructions that both write `rax` don't actually serialize because they get different underlying physical registers.

**LLM analog.** Versioned variables in tool-call chains. When the model writes "save the result as `user_list`," the harness should treat `user_list_v1`, `user_list_v2`, etc. as distinct immutable snapshots. Consumers referencing `user_list` resolve to whichever version was current at their reference site. This eliminates false dependencies in tool DAGs.

**Why it matters.** Consider: `read(file) → analyze → edit(file) → test → edit(file) → test`. The two `edit` calls have a WAW dependency only if the harness treats "the file" as a single mutable resource. If the harness versions file snapshots, the second edit depends on the first via the test observation, not directly, and the second test can overlap with the second edit's execution.

**Existing analogs.** Git does this naturally (every commit is a new snapshot). LangGraph's state reducers are a limited form (state updates are functional, not in-place). But few harnesses maintain an explicit version namespace. Claude Code's git-commits-as-checkpoints comes closest; worktree-based subagents get it for free.

**Relevance: MEDIUM.** Mostly subsumed by out-of-order execution in practice. The explicit value is when you're running many parallel workers: versioning lets you detect and resolve "two agents edited the same file" without a serializing lock.

---

## 7. Superscalar

**CPU version.** The IBM 801 (1975, John Cocke) was arguably the first superscalar prototype. Intel's Pentium (1993) was the first mainstream x86 superscalar: two integer pipelines (U and V), dispatching up to two instructions per cycle. Modern cores dispatch 6-8 instructions per cycle.

**LLM analog.** Emit multiple tool calls in a single model turn, dispatch them in parallel. This is directly supported by Anthropic's tool-use API (`tool_calls` array), OpenAI's function calling, and basically every modern model. Claude Code, OpenAI Agents SDK, LangGraph — all support parallel tool calls. This is the one microarchitecture technique that is already fully productized.

**The gotcha.** The model has to decide to emit parallel calls. Smaller models tend to emit one tool at a time even when independent tools are available. Anthropic's post-training explicitly includes parallelism examples; Claude 3.5 Sonnet and later are noticeably better at this than earlier models. So "superscalar width" is effectively a model capability, not a harness capability.

**Relevance: HIGH, already productized.** The marginal design work is in tool definitions — making tools that are obviously independent (separate namespaces, no shared mutable state) so the model is more willing to parallelize them.

---

## 8. VLIW / EPIC

**CPU version.** Very Long Instruction Word, pioneered by Josh Fisher (Trace Scheduling, 1981) and commercialized in Itanium (Intel/HP, 2001). The compiler packs multiple independent operations into a single wide instruction; the CPU just executes them in lockstep, with no dynamic reordering hardware. The bet: the compiler has a whole-program view and can find more parallelism than runtime hardware. The result: Itanium was a commercial disaster, out-classed by aggressively OoO x86 designs (Opteron, Core 2) that discovered parallelism dynamically.

Why did VLIW lose? Three reasons:

1. **Memory latency is unpredictable.** Static schedules assume fixed latencies; real cache misses stall the whole wide instruction.
2. **Control flow is hard to schedule statically.** Branches, indirect calls, and loops fight static scheduling.
3. **Binary compatibility.** Recompilation burden on every ISA change.

**LLM analog.** Plan-and-execute agents (LLMCompiler, ReWOO) are VLIW. The Planner is the compiler; it lays out a static DAG of tool calls; the Executor dispatches without dynamic replanning. ReAct is OoO: every step is planned dynamically based on the latest observation.

**Does Itanium's lesson apply?** Partly, but with a twist. The first two VLIW failure modes transfer directly:

- **Tool latency is unpredictable.** A static plan that assumes `Grep` takes 100 ms breaks when `Grep` takes 10 s on a large repo. The planner has no way to reschedule.
- **Dynamic control flow is hard to plan.** "If the grep finds X, do A; otherwise do B" requires branches in the plan, which drag planners back toward dynamic replanning.

But the third failure mode (binary compatibility) does **not** transfer — LLM "binaries" are prompts, recompilable for free. And the LLMCompiler numbers (3.6x) are real. The synthesis: VLIW-style plan-and-execute works when tool latencies are reasonably uniform and the control flow is shallow. Deep conditional flows push you back toward ReAct. This matches the empirical finding that LLMCompiler beats ReAct on embarrassingly-parallel workloads and is roughly tied on branchy ones.

**The Mill CPU is the interesting cousin.** Ivan Godard's Mill architecture (2010s) is "exposed-pipeline" with a belt instead of a register file. It's VLIW-like but with aggressive static scheduling tools. For LLMs, the equivalent would be a planner that exposes the full latency model of each tool and schedules around it. Nobody does this yet.

**Relevance: MEDIUM.** Plan-and-execute is not a dominant paradigm, and Itanium's ghost is a real warning. Thick static planning is probably not where harnesses should invest; Anthropic's thin-harness bet is the RISC counter (see section 14).

---

## 9. SIMD / Vectorization

**CPU version.** The Cray-1 (1976) was the first commercially successful vector machine: 64-element vector registers, single vector instructions applying an operation to all elements. Intel SSE (1999) and ARM NEON (2005) brought packed SIMD to commodity CPUs: one instruction adds four floats at once.

**LLM analog.** Batch similar tool calls. If the agent needs to read 20 files, issue them as a single vectorized `Read` call rather than 20 separate tool calls. Same for `Grep` across N patterns, `Bash` across N commands (caveat: side effects), or API calls across N IDs.

**Current state.** Most harnesses don't explicitly vectorize. A few exceptions:

- **Claude Code's `Read`** accepts a path but not a list of paths. You get parallelism only by emitting multiple tool calls (superscalar-style).
- **`Grep`** is already internally vectorized (one pattern across many files), but not across multiple patterns.
- **LangChain's bulk operations** and Databricks' Mosaic batch APIs are closer to explicit vectorization but intended for batch inference, not agent turns.

**Proposal.** Expose explicit batch tools in the harness: `ReadBatch(paths)`, `GrepBatch(patterns)`, `FetchBatch(urls)`. The model learns to call these when it has homogeneous work. The payoff is not speed (a parallel dispatch already gets that) but tokens: one tool call invocation costs ~50 tokens of overhead in schema headers and result framing; 20 individual calls cost ~1000 tokens just in framing. Vectorization amortizes framing.

**Cray-style gather/scatter.** The most powerful vector operations read non-contiguous memory into a dense vector register. The LLM analog: a tool that takes a list of (file, line-range) tuples and returns a single packed result. Claude Code's multi-file search is close; nothing is fully general.

**Relevance: MEDIUM.** Nice to have, mostly a token-cost optimization. The engineering cost of adding batch tools is low; the payoff is predictable.

---

## 10. Hyperthreading / SMT

**CPU version.** Dean Tullsen et al. formalized SMT in 1995; DEC's Alpha 21464 was the first design (never shipped); Intel Pentium 4 (2002) brought it to market as "Hyper-Threading." The insight: a single OoO core has lots of execution units sitting idle waiting for cache misses. Give it two thread contexts, and you can usefully dispatch work from the second thread while the first is stalled. Typical speedup: 15-30%.

**LLM analog.** Multiplex multiple user conversations onto a single warm KV cache. When one conversation is waiting on a tool result, start processing the next conversation's next turn. The shared "execution resource" is the inference engine and the prompt cache.

**Current state.** vLLM's continuous batching does this at the token level: partially-complete generation requests and newly-arrived requests share the same model forward pass, with padding and attention masking to keep them isolated. This is effectively SMT for inference serving. It's production-grade on vLLM, TensorRT-LLM, SGLang.

**At the harness level,** however, conversations are usually serialized. One user, one agent, one loop. If you have a single warm model server and ten users, you want a hyperthreaded harness that interleaves their turns on the same cache-warm model. Beyond vLLM's server-side batching, the harness-level equivalent would be: multiple user sessions sharing a cached system prompt, dispatched to the inference engine in an interleaved schedule.

**Relevance: MEDIUM for single-user harnesses, HIGH for multi-tenant.** For Burak's orchestrator, where one user runs one agent at a time, this is irrelevant. For a SaaS agent product with many users, it's the difference between 1x and 4x throughput.

---

## 11. Cache Coherence / NUMA / MESI

**CPU version.** Multi-socket SMP systems need cache coherence: if CPU 0's L1 has line X and CPU 1's L1 also has line X, a write from either must be visible to the other. The MESI protocol (Modified, Exclusive, Shared, Invalid; IBM, 1983) encodes each cache line's state and implements coherence via snoop traffic on a shared bus. MOESI adds Owned for direct transfer between caches. NUMA complicates this further: memory closer to one socket is faster; pages have to be placed and migrated carefully.

**LLM analog.** Multi-agent systems with shared state are distributed caches. If agent A and agent B are both working on a shared codebase, both have cached context from the same files. When agent A edits a file, agent B's context becomes stale. Without a coherence protocol, agent B continues reasoning over a stale snapshot.

**The subtle failure mode.** Two agents both open the same file, both edit it, both commit. Classic write-write conflict. Git surfaces this as a merge conflict, but only at commit time — the agents have already burned tokens reasoning over stale state.

**Coherence strategies that could transfer:**

- **Invalidation protocols.** When agent A writes to file X, broadcast an invalidation to all other agents' context caches. Each agent must re-read file X on next access. Expensive (requires inter-agent messaging) but correct.
- **Write-update protocols.** Broadcast the new content, not just the invalidation. More bandwidth but avoids the re-read latency.
- **Directory-based coherence.** A central "file owner" directory tracks which agent has which file in its context. Writes go through the directory. Scales better than broadcast snooping.
- **Optimistic concurrency.** Let agents work on stale state, detect conflicts at commit time, roll back and retry. This is how Git, databases, and most distributed systems actually do it — and it's what cmux worktree isolation with beads is converging on.

**NUMA analog.** Subagent delegation with separate context pools. Each subagent has "local memory" (its own context window) that is cheap; accessing another subagent's state requires an explicit cross-call that is expensive. Proper NUMA-aware scheduling would assign subtasks to whichever subagent already has the relevant context cached, just as NUMA schedulers assign threads to sockets whose memory they've already touched.

**Relevance: HIGH.** Multi-agent coordination is the obvious growth area and nobody has a good coherence story. Git-based optimistic concurrency is the current state of the art, and it's exactly the same solution databases converged on in the 1980s.

---

## 12. TLB and Virtual Memory

**CPU version.** The IBM 801 (1975) and Intel 386 (1985) formalized paged virtual memory. The Translation Lookaside Buffer is a small, fast cache of recent virtual-to-physical page translations, typically 64-1024 entries, 1-cycle access. A TLB miss triggers a page table walk that takes 10-100 cycles. Skylake has four TLB levels.

**LLM analog.** Claude Code's ~150-character-per-entry memory index **is** a TLB. It maps from "topic name" (virtual address) to "memory file path or inline summary" (physical location). The model consults the index first — always in context, zero-cost lookup — and only pulls the full file on a hit. A miss forces a full grep-and-read walk, which is the equivalent of a page table walk.

The analogy goes further than metaphor:

- **TLB associativity.** Claude Code's index is associative by topic keyword. Direct-mapped (one entry per slot) is simpler but collisions hurt; fully associative is expensive. Real indexes tend to be set-associative.
- **Page sizes.** CPUs have 4 KB pages by default, 2 MB and 1 GB huge pages for large contiguous regions. LLM equivalent: small memory entries for fine-grained facts, large entries (whole architectural docs) for coherent topics. Mixing them (huge pages) reduces TLB pressure.
- **TLB shootdown.** When a mapping changes, all TLBs must be invalidated — expensive in SMP. Multi-agent equivalent: when memory files update, all agents' in-context indexes are stale. Same problem, same solution (invalidation messaging or short-lived caches).
- **Prefetching.** Hardware page walkers prefetch adjacent pages on sequential access. The LLM analog: when an agent reads one file, prefetch adjacent files (same directory, same import graph).

**The really interesting angle.** The CPU TLB is so critical to performance that entire generations of x86 architecture fights have been about TLB coverage. If the memory index in an LLM harness is similarly central, it deserves the same level of engineering attention — explicit hit rates, miss penalties, eviction policies, and tuning per workload. Today nobody treats it this way; it's just "a file called CLAUDE.md."

**Relevance: HIGH.** The analogy is tight, the engineering is underdeveloped, and the payoff is immediate (every memory miss costs tokens and latency).

---

## 13. Spectre / Meltdown Analogs

**CPU version.** Spectre (Kocher et al., 2018) exploited branch predictors to trick speculative execution into reading out-of-bounds memory, then leaked the result through cache timing side channels. Meltdown broke user/kernel isolation via speculative loads that bypassed permission checks. The fixes required kernel page-table isolation (KPTI), microcode updates, and new speculation-barrier instructions. Some performance was permanently lost.

**LLM equivalents.** Every speculative technique in this document opens a potential side channel:

- **Speculative tool calls + prompt cache side channel.** If the harness speculatively executes a tool call on behalf of the current prompt, the tool result may enter the prompt cache. A later adversarial prompt can detect cache hits via latency or token-billing differences.
- **Prompt-injection-induced speculation.** A malicious document in context convinces the model to speculatively call a tool that exfiltrates data. By the time the harness's safety layer checks the tool call, the side effect has already happened. This is the LLM equivalent of Spectre-v1.
- **Transient access via subagents.** A subagent with elevated permissions runs speculatively, reads a secret, writes it into a "returned summary" that looks benign. The parent agent's safety check sees a clean summary and accepts it. This is Meltdown-style privilege bypass.
- **Shared KV cache leaks.** Multi-tenant inference servers share KV cache structures. Recent papers (Song et al., 2024; Zhang et al., 2024) show that timing attacks on shared prompt caches can leak another tenant's prompt content. This is a real, demonstrated vulnerability class.

**Mitigation patterns and their CPU analogs:**

- **Dual LLM pattern** (Simon Willison, 2023): untrusted content goes to a quarantined LLM that cannot call privileged tools; only sanitized outputs reach the trusted LLM. Analog: KPTI, which isolates user and kernel address spaces so speculative kernel reads can't leak.
- **CaMeL** (Debenedetti et al., 2025): capabilities-based model execution with a separate privileged planner. Analog: ARM TrustZone — separate world with its own register set and memory.
- **Speculation barriers.** Explicit "do not speculate past this point" markers in agent plans. Analog: `LFENCE` on x86.
- **Cache partitioning.** Per-tenant isolated prompt caches. Analog: Intel Cache Allocation Technology (CAT) for L3 partitioning.

**Relevance: HIGH for security-conscious deployments, LOW if you're a solo operator running your own agents on your own code.** But the pattern is worth knowing because prompt-injection attacks are already in the wild and the attack surface grows quadratically with every new speculative optimization.

---

## 14. RISC vs CISC Philosophy

**CPU version.** CISC (VAX, x86, 68k) ships complex instructions — `POLY` on VAX computed a polynomial in one instruction — implemented via microcode. Compiler writers love it (one instruction per source construct!) but the implementation is a nightmare. RISC (IBM 801, MIPS, ARM) ships simple instructions with fixed encoding and single-cycle execution; the compiler has to string many of them together, but each is easy to pipeline, cache, and optimize. The 1990s RISC-vs-CISC debate was settled pragmatically: internally, modern x86 CPUs translate CISC instructions to RISC-like micro-ops at decode time, then feed those into a RISC-style backend. The ISA is CISC-flavored for compatibility; the microarchitecture is RISC. The lesson: what matters is not the interface but whether the underlying engine is uniform and predictable.

**LLM analog.** Thick harness vs thin harness. LangGraph, CrewAI, AutoGen define complex orchestration primitives — graph nodes, handoffs, group chats, role-based agents — equivalent to CISC "macro-instructions." The harness interprets the user's intent through these primitives. Anthropic's Claude Code takes the opposite approach: a "dumb loop" with a small fixed set of tools, and the model itself decides how to compose them. That's RISC.

**Anthropic's bet.** Explicitly articulated in "The Anatomy of an Agent Harness": models get smarter, so harness complexity should go down over time. Planning steps that used to be in the harness (decomposing goals, tracking todos) are being deleted as new model versions internalize them. This is the co-evolution principle. The harness becomes a thinner substrate; the model becomes the optimizer.

**Does the RISC lesson apply?** Three reasons to believe yes:

1. **Uniformity wins at scale.** RISC beat CISC partly because uniform instructions are easier to pipeline and predict. A uniform harness (tools are simple, loop is simple) is easier to observe, debug, and tune than a thick one.
2. **Microcode is expensive to rewrite.** CISC microcode was frozen at manufacture; rewriting it required new silicon. Thick harnesses are similarly sticky: once you've encoded planning logic in Python, changing it is painful. Thin harnesses push planning into prompts, which are cheap to rewrite.
3. **Compilers and models both got smart enough.** In the 1990s, compilers got good enough that CISC's "one instruction per source construct" advantage stopped mattering — compilers could generate RISC sequences that were just as fast. The analog: as models get smart enough to plan multi-step tool sequences natively, harnesses that pre-build those sequences stop adding value.

**Three reasons to believe no:**

1. **The CISC-inside-RISC synthesis.** Modern x86 is both: CISC interface, RISC backend. The LLM equivalent might be a thick planning layer for UX, thin executor underneath. CrewAI Flows (deterministic backbone with intelligent nodes) is gesturing at this.
2. **Non-determinism breaks the analogy.** RISC won because simpler instructions were more predictable and easier to pipeline. LLM "instructions" are never predictable regardless of harness thickness. The predictability argument is weaker.
3. **Co-training coupling.** If a model is post-trained with a specific thick harness in the loop, it actively learns to rely on that harness's primitives. The harness is no longer just scaffolding; it's part of the model's effective ISA. You can't just delete LangGraph nodes from a model that was trained with them.

**Relevance: HIGH.** This is the deepest architectural question in the entire harness space, and the CPU history is a genuine prior. Anthropic's RISC bet looks right if you believe models are still getting rapidly smarter; it looks wrong if you believe we're near a plateau and harness engineering is where the next few x of performance live.

---

## 15. Techniques That Do Not Transfer

Equally important: knowing the boundary.

**Out-of-order retirement.** CPUs execute instructions out of order, but **retire** them (commit results to architectural state) in program order. This preserves the illusion of sequential execution and enables precise exceptions. There is no LLM analog because there is no canonical "program order" for agent actions, and exceptions (errors) are recovered semantically by the model rather than rolled back to a precise instruction boundary. The Reorder Buffer has no equivalent. The closest thing — git transaction boundaries — is coarser by orders of magnitude.

**The architectural register file.** A CPU register file is a small, fixed set of named storage slots. Attention heads already function as a kind of distributed register file: each head specializes in tracking some aspect of the input, and the residual stream passes values between layers. Trying to bolt an "LLM register file" on top of this would be pointless; the model already has one, implemented in trained weights.

**Microcode.** CISC microcode translates complex instructions into micro-ops. In the LLM analogy, **the model weights are the microcode** — the layer between the "instruction" (prompt) and the underlying silicon (matmul hardware). But unlike CPU microcode, model weights cannot be rewritten at runtime. You can fine-tune, but that's offline, expensive, and changes the model's identity. There is no hot-patchable microcode layer in LLMs.

**The MMU / paged virtual memory.** The TLB analog (section 12) is real, but the full MMU is not. Virtual memory provides isolation (each process has its own address space) and overcommitment (map more virtual memory than you have physical RAM). Natural language has no distinction between "virtual" and "physical" address; a token either is in the context or isn't. There's no page fault mechanism that can demand-page a missing word into attention. RAG is gestured at this, but it operates at chunk granularity, not token granularity, and it cannot be invisible to the model.

**Precise exceptions.** The CPU's guarantee: on a fault, architectural state is exactly what it would have been if execution had stopped at the faulting instruction. This is what makes debugging possible. LLMs have no such guarantee — when an agent "faults," the state is whatever the model last produced, which is only approximately where the conceptual failure happened. This is why agent debugging is so much harder than program debugging, and why verification loops (section 10 of the source article) have to substitute for precise exception handling.

**Store buffers and memory ordering.** x86's Total Store Order vs ARM's weak ordering is a rich topic with no LLM analog. Tool-call effects are either visible to the next turn (via context) or not; there is no subtler ordering question. This is one of the few places where LLM systems are genuinely simpler than CPUs.

**Cache replacement policies (LRU, CLOCK, ARC).** These do transfer loosely (context compaction is essentially a cache eviction policy), but the LLM version is semantic rather than positional — you evict based on "what matters for the current goal," not based on recency. So the algorithms themselves don't transfer even though the problem shape does.

---

## Synthesis: Which Transfers Matter Most

If you had to pick the three highest-leverage transfers for a pragmatic harness builder in 2026:

1. **Cache hierarchies (section 2).** Make the L0-L5 hierarchy explicit in your harness design. Measure hit rates. Tune eviction. This is the single clearest win and almost nobody does it rigorously.

2. **Out-of-order execution (section 5).** LLMCompiler already proved the 3.6x. Every harness should have a planner-executor split for workloads with parallelism, falling back to ReAct for serialized ones.

3. **TLB / memory index (section 12).** Claude Code's index is a TLB. Treating it as such — with hit rate metrics, set-associativity tuning, and prefetching — is low-cost and high-return.

The three highest-leverage transfers on a longer time horizon:

4. **Branch prediction of tool sequences (section 3).** Easy to prototype, real speedups, nobody is doing it.

5. **Cache coherence for multi-agent (section 11).** Unavoidable once you have more than two workers touching shared state. Git-based optimistic concurrency is the current default; directory-based coherence is probably the next step.

6. **RISC-style thin harness (section 14).** Not a technique, an architectural bet. Anthropic is already making it. The historical prior says it's the right bet if models keep improving; hedge accordingly.

And the one transfer that is **seductive but dangerous**:

7. **Speculative execution (section 4).** The speedup is real, the attack surface is enormous, and the LLM security community has not yet lived through its Spectre moment. Wait for CaMeL-style capability systems to mature before betting on speculative optimizations in production.

---

## Closing: The Analogy's Expiration Date

Historical analogies age. The CPU analogy worked for Millidge in 2023 because early harnesses were genuinely sequential, tool-poor, and RAM-limited (context windows of 8K tokens). As of 2026 we have million-token contexts, native parallel tool calls, and models that plan multi-step sequences unprompted. Several of the analogies in this document are already softening: register files are subsumed by attention, VLIW is contested by thick-vs-thin harness debates, precise exceptions never transferred cleanly in the first place.

The long-term bet is that the analogy breaks down specifically where it becomes useful — the places where LLM architecture is genuinely new and has no CPU precedent. Those places are, roughly: (a) semantic memory systems that have no physical-address analog, (b) verification loops that substitute for the precision-exception model, (c) co-evolution between model and harness that CPUs never experienced because ISAs are frozen at tape-out. Watch those frontiers. Everything else in this document is engineering — useful, transferable, pragmatic, but not where the real novelty lives.

MIPS R2000 taught us that simplicity beats cleverness when the underlying substrate is fast enough. If that lesson transfers, then the most important thing a harness builder can do in 2026 is stay boring and wait for the model to eat everything that looks like sophistication.
