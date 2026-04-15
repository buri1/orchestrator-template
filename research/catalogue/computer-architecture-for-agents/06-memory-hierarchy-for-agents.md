# Part 6: The Memory Hierarchy for Agents

> *Computer Architecture Principles Applied to AI Agent Harness Design*
> Series: Computer Architecture for Agents | Part 6 of N
> Date: 2026-04-04

---

## Preamble

Parts 1 through 5 of this series mapped the Von Neumann architecture, instruction sets, buses, interrupts, and pipelining onto agent systems. Each drew insight from hardware design. But no single hardware concept has more to teach agent harness designers than the **memory hierarchy**.

The memory hierarchy is the most over-engineered, deeply studied, and ruthlessly optimized subsystem in all of computing. Sixty years of research, billions of transistors, and entire careers have been devoted to one problem: **bridging the gap between what the processor needs and what storage can deliver**.

Agent systems face the exact same problem. The model (processor) is fast, capable, and hungry for context. The storage systems (files, databases, vector stores, conversation logs) are vast but slow. The context window (main memory) is the bottleneck that sits between them. Every design decision in an agent memory system is, whether the designer knows it or not, a re-derivation of principles that hardware architects discovered decades ago.

This installment maps the classical memory hierarchy onto agent systems with precision, then explores what the mapping reveals about cache policies, virtual memory, and the agent memory wall.

---

## 1. The Classical Memory Hierarchy

### 1.1 The Fundamental Tradeoff

Every memory technology in existence obeys the same constraint triangle:

```
        SPEED
        /    \
       /      \
      /        \
   SIZE ------  COST
```

You can have any two, but never all three. Fast and large is expensive. Large and cheap is slow. Fast and cheap is small. This is not a temporary engineering limitation -- it is a consequence of physics. Faster access requires closer proximity to the processor, which requires more expensive fabrication per bit, which limits how many bits you can afford.

The memory hierarchy exploits a statistical property of programs to make this tradeoff bearable.

### 1.2 The Principle of Locality

Programs do not access memory randomly. They exhibit two forms of locality:

**Temporal locality**: If a memory address was accessed recently, it is likely to be accessed again soon. A loop variable, a frequently called function, a hot data structure -- these are accessed over and over.

**Spatial locality**: If a memory address was accessed, nearby addresses are likely to be accessed soon. Array traversals, sequential instruction execution, struct field access -- these touch adjacent memory.

Locality is why caching works. If access patterns were truly random, no cache could help. But because programs are predictable in their access patterns, a small fast cache can serve the vast majority of requests, and the large slow backing store is rarely touched.

This insight is directly transferable to agent systems, where conversation patterns, file access, and context usage are far from random.

### 1.3 The Hierarchy in Numbers

The classical memory hierarchy, with approximate latencies as of 2025-era hardware:

| Level | Typical Size | Access Latency | Bandwidth | Cost/GB | Managed By |
|-------|-------------|----------------|-----------|---------|------------|
| **Registers** | ~1 KB (hundreds of registers) | <0.3 ns (~1 cycle) | N/A (on-die) | N/A | Compiler/ISA |
| **L1 Cache** | 32-96 KB per core | ~1 ns (~3-4 cycles) | ~1 TB/s | ~$10,000 | Hardware |
| **L2 Cache** | 256 KB - 2 MB per core | ~3-5 ns (~10-15 cycles) | ~500 GB/s | ~$1,000 | Hardware |
| **L3 Cache** | 8-256 MB shared | ~10-20 ns (~30-70 cycles) | ~200 GB/s | ~$100 | Hardware |
| **DRAM (RAM)** | 16-512 GB | ~50-100 ns | ~50-100 GB/s | ~$3-5 | OS |
| **SSD (NVMe)** | 1-8 TB | ~10-100 us | ~5-14 GB/s | ~$0.05-0.10 | OS/Filesystem |
| **HDD** | 2-20 TB | ~2-10 ms | ~100-250 MB/s | ~$0.01-0.03 | OS/Filesystem |
| **Tape/Archive** | Petabytes | seconds to minutes | ~300-400 MB/s (streaming) | ~$0.001 | Manual/Software |

The key ratios:
- L1 to DRAM: ~100x latency gap
- DRAM to SSD: ~1,000x latency gap
- SSD to HDD: ~100x latency gap
- Registers to tape: ~10,000,000,000x latency gap (ten billion)

Each level is roughly 10-1000x slower than the one above it, but 10-1000x larger and cheaper. The hierarchy exists because no single technology can be simultaneously fast, large, and affordable.

### 1.4 How Caching Bridges the Gaps

Caching is the mechanism that makes the hierarchy transparent to the processor. The CPU issues a memory request. If the data is in L1 cache (a **cache hit**), it arrives in ~1 ns. If not (a **cache miss**), the request falls through to L2, then L3, then DRAM, each level slower but more likely to contain the data.

The hit rate at each level determines effective latency. A 95% L1 hit rate means only 5% of accesses pay the L2 penalty. A 99% combined L1+L2 hit rate means only 1% of accesses touch DRAM. This multiplicative filtering is why a system with 100 ns DRAM can behave as if it has ~2 ns memory on average.

The cache line is the unit of transfer. When the CPU loads one byte from DRAM, the hardware actually fetches a 64-byte cache line containing that byte and its neighbors. This exploits spatial locality: if you touched byte N, you probably want bytes N+1 through N+63 as well.

---

## 2. The Agent Memory Hierarchy

Now we map each level of the classical hierarchy onto its agent equivalent. The mapping is not metaphorical -- it is structural. Agent systems face the same speed-size-cost tradeoffs, the same locality patterns, and the same caching challenges.

### 2.1 The Complete Mapping

| Hardware Level | Agent Equivalent | Size | Access Cost | Managed By |
|---------------|-----------------|------|-------------|------------|
| **Registers** | Attention heads / hidden state | Bytes | Instantaneous (sub-token) | Model architecture |
| **L1 Cache** | Last few messages in context | 1-5 KB | Highest attention weight | Attention mechanism |
| **L2 Cache** | Earlier context window content | 10-100 KB | Moderate attention weight | Attention mechanism |
| **L3 Cache** | Project files loaded into context (CLAUDE.md, state files) | 50-500 KB | Lower attention weight, may be "lost in the middle" | Harness design |
| **RAM** | Full context window | 100 KB - 1 MB (200K tokens ~= 800 KB) | Available but attention-diluted | Token limit |
| **SSD** | Local files, vector stores, bead summaries | MB - GB | Tool call required (~1-5 seconds) | Agent/Harness |
| **HDD** | Full conversation logs, git history, databases | GB - TB | Tool call + search/parse (~5-30 seconds) | Harness/Infrastructure |
| **Tape/Archive** | Archived sessions, old research, rarely accessed repos | TB+ | May require human intervention or special retrieval | Manual/Policy |

### 2.2 Level-by-Level Analysis

#### Registers: Attention Heads and Hidden State

In hardware, registers are the fastest storage -- a few hundred bytes directly wired into the ALU, accessed in a fraction of a nanosecond. The programmer cannot directly manage most registers; the compiler allocates them.

In an LLM, the equivalent is the model's internal hidden state during inference: the activations flowing through transformer layers, the intermediate computations in attention heads, the key-value representations being computed token by token. This "memory" is:

- Extremely fast (computed as part of the forward pass)
- Very small (ephemeral per-token state)
- Completely inaccessible to the harness
- Managed entirely by the model architecture

Just as a programmer cannot peek into register allocation at runtime, a harness designer cannot inspect or modify what an attention head is focusing on during inference. This level is below the harness abstraction boundary.

#### L1 Cache: The Last Few Messages

The L1 cache holds the most recently and frequently accessed data, serving it with minimal latency. Its defining characteristic is that the hit rate must be extremely high (>95%) because L1 misses are expensive relative to processor speed.

In agent context, the last few conversational turns function as L1 cache. Research on transformer attention patterns shows a strong **recency bias**: tokens appearing near the end of the context window receive disproportionately high attention weight. The 2023 paper "Lost in the Middle" by Liu et al. demonstrated this empirically -- models perform best when relevant information appears at the very beginning or very end of context, with a pronounced U-shaped attention curve.

The most recent user message, the most recent assistant response, and the immediately preceding exchange form the agent's L1 cache. This is where:

- The current task specification lives
- Immediate working state is tracked
- The model's "train of thought" resides
- Correction signals have maximum impact

**Key property**: Like hardware L1, this level is managed automatically (by the attention mechanism), not by the harness. But the harness can influence what is *in* L1 by controlling message ordering.

#### L2 Cache: Earlier Context Window Content

The L2 cache is larger than L1, slower, and serves as a backstop for L1 misses. In multi-core processors, L2 is typically per-core, sitting between the core's L1 and the shared L3.

In agent context, the earlier portions of the current conversation -- messages from 5, 10, 20 turns ago -- function as L2 cache. The information is present in the context window, so no tool call is needed to access it. But attention weight decays with distance, so this information is accessed with lower fidelity than L1 content.

This is where:

- Earlier task clarifications live
- Previous tool call results persist
- Reasoning chains from earlier in the conversation exist
- Established patterns and constraints remain available

**The L2 problem for agents**: Unlike hardware L2 which delivers data at full fidelity (just slower), agent L2 suffers from attention dilution. A fact stated 15 messages ago is not just *slower* to access -- it may be *less accurately* accessed due to the attention mechanism's positional biases. This is as if hardware L2 occasionally returned corrupted data, a situation no hardware designer would tolerate.

#### L3 Cache: Project Files Loaded Into Context

In hardware, L3 cache is shared across all cores, larger than per-core L2, and serves as the last line of defense before a (very expensive) DRAM access. It is typically managed by hardware, but OS-level policies can influence what stays resident.

In agent context, L3 corresponds to project-level files that the harness loads into context at session start or on demand: CLAUDE.md instructions, state files, configuration documents, bead summaries from previous sessions. These are not conversational -- they are structural context.

Properties matching hardware L3:

- **Shared across tasks**: Just as L3 is shared across cores, project files serve all tasks within a session
- **Loaded proactively**: The harness decides what to load, like hardware prefetching into L3
- **Larger but lower priority**: These files may be hundreds of kilobytes, and they sit in the middle of context where the "lost in the middle" effect is strongest
- **Eviction matters**: When context fills up, these are candidates for compaction or removal

**Critical harness decision**: What goes into L3 is one of the most impactful choices in agent design. Loading too much creates noise (polluting the cache). Loading too little means frequent cache misses (tool calls to read files). The CLAUDE.md file is the canonical L3 entry -- always loaded, always available, but with attention weight competing against recent conversation.

#### RAM: The Full Context Window

DRAM is the main memory of the system -- all running programs must fit in RAM (or be swapped to disk). It is the fundamental capacity constraint. When RAM fills up, the OS must either refuse new allocations or begin swapping, both of which degrade performance.

The context window is the agent's RAM. It has a hard capacity limit (128K, 200K, 1M tokens depending on the model). Everything the agent can reason about in a single inference call must fit in this window. It is:

- The hard boundary on working state
- Managed jointly by the model (attention) and the harness (what gets loaded)
- Subject to fragmentation (irrelevant content consuming space)
- The primary bottleneck for complex tasks

**The critical ratio**: In modern hardware, the ratio of L1 cache to RAM is roughly 1:1,000,000 (32 KB L1 vs 32 GB RAM). In agent systems, the ratio of effective L1 (last few messages, ~2K tokens) to full context (200K tokens) is roughly 1:100. This means the agent's memory hierarchy is much *flatter* than hardware's -- there are fewer levels and smaller ratios between them. This has profound implications for cache policy design.

#### SSD: Local Files and Vector Stores

SSDs provide the first level of persistent storage -- fast enough for interactive use, large enough for entire applications. Access requires a system call (crossing the user-kernel boundary), which adds overhead beyond the raw device latency.

For agents, the SSD equivalent is anything accessible via tool calls that does not require network round-trips or complex queries:

- Local filesystem reads (`cat`, `grep`, file read tools)
- Vector store queries (local embedding + similarity search)
- Bead summaries and session handoff files
- Local database queries (SQLite, etc.)

Access cost: 1-5 seconds (tool call overhead + file read + response incorporation). This is roughly 100-1000x slower than accessing in-context information, matching the DRAM-to-SSD ratio in hardware.

**The agent SSD innovation**: Unlike hardware SSDs which are passive storage, agent "SSD" is often *structured* -- bead summaries are pre-processed, vector stores are pre-indexed, CLAUDE.md files are pre-curated. This is analogous to hardware techniques like compression in SSDs or tiered caching in storage controllers. The harness can invest write-time computation to reduce read-time latency.

#### HDD: Full Logs, Git History, Databases

HDDs represent bulk storage -- vast capacity at low cost, but with high latency due to mechanical seek times. Reads are sequential-friendly but random-access-hostile.

The agent equivalent is deep storage that requires non-trivial retrieval:

- Full conversation logs from previous sessions
- Git history (commits, diffs, blame across a repository's lifetime)
- Large databases requiring complex queries
- Documentation repositories
- Full codebases (as opposed to specific files)

Access cost: 5-30 seconds (tool call + search + parse + potentially multiple round-trips). The analogy to HDD's sequential-vs-random characteristic holds: reading a specific git commit is relatively fast, but searching across all commits for a pattern is slow.

#### Tape/Archive: Archived Sessions and Old Research

Tape storage is for data that must be retained but is almost never accessed. Retrieval requires physically mounting tapes, which takes minutes. The cost per byte is the lowest of any tier.

For agents, tape-equivalent storage includes:

- Sessions from weeks or months ago
- Old research that may or may not be relevant
- Deprecated project documentation
- Historical decisions and their rationale (if not summarized)
- Other agents' session logs

Access cost: potentially minutes (requires knowing the archive exists, finding it, loading it, parsing it). May require human intervention ("which old session had that discussion about X?"). In the orchestrator system, this maps to old `_bmad/` session files, archived devlogs, and the research catalogue's deep history.

### 2.3 The Full Hierarchy Visualized

```
                    +---------------------------+
                    |    ATTENTION HEADS         |  <-- Registers
                    |   (hidden state, ~bytes)   |      <0.3 ns equivalent
                    +---------------------------+
                    |    LAST FEW MESSAGES       |  <-- L1 Cache
                    |  (high attention, ~2K tok)  |      ~1 ns equivalent
                    +---------------------------+
                    |  EARLIER CONVERSATION      |  <-- L2 Cache
                    |  (moderate attn, ~20K tok)  |      ~5 ns equivalent
                    +---------------------------+
                    | PROJECT FILES IN CONTEXT   |  <-- L3 Cache
                    | (CLAUDE.md, state, ~50K tok)|      ~20 ns equivalent
                    +---------------------------+
                    |   FULL CONTEXT WINDOW      |  <-- RAM
                    |    (all tokens, ~200K)      |      ~100 ns equivalent
                    +---------------------------+
                    |  LOCAL FILES / VECTOR DB   |  <-- SSD
                    |  (beads, summaries, ~MBs)   |      ~100 us equivalent
                    +---------------------------+
                    |  GIT HISTORY / FULL LOGS   |  <-- HDD
                    |  (conversations, ~GBs)      |      ~10 ms equivalent
                    +---------------------------+
                    |  ARCHIVED SESSIONS/REPOS   |  <-- Tape
                    |  (old research, ~TBs)       |      minutes equivalent
                    +---------------------------+
```

---

## 3. Cache Policies for Agents

Hardware cache policies determine what stays in cache and what gets evicted. These policies have direct, actionable analogs in agent harness design.

### 3.1 Eviction Policies

#### LRU (Least Recently Used)

**Hardware**: When a cache line must be evicted to make room for new data, LRU evicts the line that was accessed longest ago. This exploits temporal locality: recently used data is likely to be used again.

**Agent mapping**: LRU is the natural eviction policy for conversation context. When the context window fills, the oldest messages are compacted or removed first. This is what most agent systems do by default -- the sliding window approach where the earliest conversation turns are dropped or summarized.

**Where it works well**: Conversations that are progressive (each turn builds on the previous, older context becomes irrelevant). A coding task where early exploration messages are superseded by later, more refined approaches.

**Where it fails**: Conversations where early context contains critical constraints that were stated once and never repeated. If the user said "never use any external dependencies" in message 3, and it gets LRU-evicted at message 50, the agent may violate the constraint. This is the agent equivalent of a **cache invalidation bug** -- the most common and insidious class of agent failure.

**Mitigation**: Pin critical context. In hardware, this is analogous to cache line locking (some architectures allow specific lines to be marked non-evictable). In agent systems, this means extracting critical constraints into CLAUDE.md or state files that persist across compaction.

#### LFU (Least Frequently Used)

**Hardware**: LFU evicts the line that has been accessed the fewest times overall. This captures long-term access patterns rather than recency.

**Agent mapping**: Evict context that has been referenced or relevant the fewest times across the conversation. A tool call result that was used once and never referenced again is a prime eviction candidate. A constraint that has been re-invoked in 5 different reasoning steps should be retained.

**Where it works well**: Long sessions with recurring themes. If certain files or decisions keep coming up, LFU ensures they stay in context.

**Where it fails**: Cold-start problem. New information has zero frequency and would be immediately evictable. A freshly loaded file has never been "accessed" in the LFU sense, even though it may be about to be critical.

**Practical challenge**: Implementing LFU for agents requires tracking which context segments are actually influencing model outputs -- something that is not directly observable from outside the model. Hardware LFU uses physical access counters on cache lines. Agent systems would need proxy metrics like explicit references, tool call patterns, or attention scores (if available).

#### FIFO (First In, First Out)

**Hardware**: FIFO evicts in insertion order regardless of access patterns. Simpler than LRU or LFU, but ignores locality entirely.

**Agent mapping**: Simple sliding window compaction -- drop the oldest N messages when the context fills, regardless of their importance. This is the crudest and most common approach.

**Where it works well**: Short tasks where the entire conversation fits in context. Homogeneous conversations where all messages have roughly equal importance.

**Where it fails**: Almost everywhere in practice. FIFO has no mechanism to retain important early context, no way to prefer frequently-used information, and no ability to handle non-uniform message importance. It is the "no policy" policy.

**Why it persists**: Simplicity. FIFO is trivially implementable (just truncate from the front). For systems that compact before context fills, FIFO avoids the complexity of scoring and ranking messages. But it leaves significant performance on the table.

#### Adaptive Policies (ARC, LIRS)

In hardware, adaptive replacement policies like ARC (Adaptive Replacement Cache) combine LRU and LFU by maintaining two lists and dynamically adjusting the split based on observed access patterns.

**Agent mapping**: A compaction system that maintains both recency and frequency signals. Recent messages are retained (LRU component). Frequently-referenced context segments are also retained regardless of age (LFU component). The balance shifts based on task characteristics:

- In exploratory phases (lots of new tool calls, new files being read): favor LRU
- In iterative phases (refining a solution, repeatedly checking constraints): favor LFU

No major agent harness implements adaptive cache policies as of early 2026, but this is one of the clearest opportunities for improvement.

### 3.2 Write Policies

#### Write-Through: Eager State Persistence

**Hardware**: In write-through caching, every write to cache is simultaneously written to the backing store (DRAM). This ensures consistency -- the cache and main memory always agree -- but at the cost of write latency.

**Agent mapping**: After every significant state change (task completion, decision made, file modified), the agent immediately writes to persistent storage: updates the state file, appends to the devlog, commits to git.

In the orchestrator system, this is the current approach: `orchestrator-tmux-state.json` is updated after every phase transition, the devlog is appended after every task. Write-through.

**Advantages**:
- Crash recovery is clean -- persistent state is always current
- Other agents can read current state at any time
- No data loss on unexpected termination

**Disadvantages**:
- Write latency on every state change (tool call to write file)
- May be wasteful for intermediate states that are overwritten quickly
- Increases context consumption (each write is a tool call that appears in conversation)

#### Write-Back: Lazy State Persistence

**Hardware**: In write-back caching, writes go only to the cache. The backing store is updated later, when the cache line is evicted or when a flush is triggered. This reduces write traffic but creates a window where the cache and backing store are inconsistent.

**Agent mapping**: The agent tracks state changes in memory (conversation context) and batches writes to persistent storage -- updating state files only at major checkpoints (end of task, before compaction, before session end).

**Advantages**:
- Fewer tool calls spent on state management
- More context available for actual work
- Multiple rapid state changes are coalesced into one write

**Disadvantages**:
- Crash between writes loses uncommitted state
- Other agents see stale state
- Compaction may erase in-memory state before it is persisted

**The dirty bit analog**: In hardware, each cache line has a "dirty bit" indicating whether it has been modified since loading. In agent systems, the harness should track which state elements have changed since the last persist. On compaction or session end, only dirty state needs to be written.

#### The Right Policy for Agents

The answer, as in hardware, is a hybrid:

- **Critical state**: Write-through. Task completion, error conditions, blocking decisions -- these must be immediately persisted because crash recovery depends on them.
- **Working state**: Write-back. Intermediate progress, exploratory notes, tentative plans -- these can be batched and persisted at checkpoints.
- **Flush triggers**: Compaction events are the agent equivalent of cache eviction -- they MUST trigger a flush of all dirty state before context is truncated.

This maps precisely to how modern CPUs handle it: L1 is often write-through to L2 (because L1 evictions are frequent and cheap), while L2 is write-back to DRAM (because DRAM writes are expensive and should be batched).

### 3.3 Cache Coherence for Multi-Agent Systems

#### The Multi-Core Problem

In multi-core processors, each core has its own L1 and L2 caches. When core A writes to address X, core B's cached copy of X becomes stale. Cache coherence protocols ensure that all cores see a consistent view of memory.

The dominant protocol family is MESI (Modified, Exclusive, Shared, Invalid):

| State | Meaning |
|-------|--------|
| **Modified** | This cache has the only valid copy, and it has been changed from what is in main memory |
| **Exclusive** | This cache has the only copy, unchanged from main memory |
| **Shared** | Multiple caches may have copies, all identical to main memory |
| **Invalid** | This cache line is not valid (stale or empty) |

When core A writes to a Shared line, the protocol sends invalidation messages to all other cores holding that line, forcing them to re-read from memory on next access.

#### Agent Coherence Challenges

In a multi-agent orchestrator (like the tmux-based system in this project), multiple agents operate concurrently on shared state:

- The orchestrator state file (`orchestrator-tmux-state.json`)
- Shared git repositories
- Shared file systems
- Issue trackers and PR states

Each agent has its own "cache" (context window) of the shared state. When agent A modifies a file, agent B's in-context copy is immediately stale. There is no automatic invalidation protocol.

**The coherence gap**: Hardware cache coherence operates in nanoseconds and is invisible to software. Agent "cache coherence" operates in seconds to minutes and requires explicit coordination. This is the fundamental difference, and it is the source of most multi-agent coordination bugs:

1. Agent A reads file F into context (Shared state)
2. Agent B modifies file F (Agent B's copy becomes Modified)
3. Agent A reasons about file F using its stale in-context copy (Invalid, but agent does not know)
4. Agent A makes decisions based on stale data
5. Agent A writes changes that conflict with B's modifications

#### Agent Coherence Protocols

**MESI for agents** (the ideal, not yet implemented):

- **Modified**: Agent has made changes to a resource not yet committed/pushed. Other agents should not read or modify it.
- **Exclusive**: Agent has claimed exclusive access to a resource (file, module, feature branch). No other agent should touch it.
- **Shared**: Multiple agents may reference the resource but none are modifying it. Read-only access.
- **Invalid**: Agent's in-context copy is known to be stale. Must re-read from source before using.

**Practical implementations**:

1. **Git worktrees as cache partitioning**: Each agent works in its own worktree (like each core having its own cache). Merge operations serve as coherence synchronization points. This is the approach the orchestrator uses.

2. **File locks as exclusive states**: A lockfile or state-file field marks resources as "checked out" by a specific agent. Other agents skip or wait.

3. **Polling as snooping**: In hardware, cache coherence uses a snoop bus where caches monitor all memory transactions. In agents, periodic state file reads serve the same function -- agents check if shared state has changed.

4. **Invalidation via state file**: The orchestrator state file can include version numbers or timestamps for shared resources. Agents compare their in-context version with the file version to detect staleness.

**The unsolved problem**: Hardware coherence is automatic and precise. Agent coherence is manual and approximate. No existing agent harness implements anything close to MESI-level coherence. This is one of the largest gaps between hardware and agent architectures.

### 3.4 Prefetching: Speculative Context Loading

**Hardware prefetching**: The processor predicts which memory addresses will be needed next and begins fetching them into cache before they are requested. Stride prefetchers detect patterns like "accessing every 8th address" and prefetch ahead. Stream prefetchers detect sequential access and prefetch the next cache lines.

**Agent prefetching**: The harness predicts what context the agent will need for an upcoming task and loads it before the agent asks.

Examples:

- When an agent is assigned a bug fix, prefetch the relevant source file, the test file, recent commits touching that file, and the issue description -- all into context before the agent starts reasoning.
- When a coding task references a module, prefetch that module's imports and dependents.
- When switching to a review phase, prefetch the PR diff, the original issue, and the test results.

**Prefetch accuracy**: Incorrect prefetching wastes context space (cache pollution). Loading irrelevant files into context is worse than not loading them -- it dilutes attention from relevant content. The prefetching trade-off is:

```
Benefit of hit = (tool call latency saved) * (probability of correct prefetch)
Cost of miss = (context space consumed) * (attention dilution factor)
```

Prefetching should be conservative: only prefetch what is very likely to be needed. In the CLAUDE.md design pattern, this means curating the file carefully -- everything in it should be useful for the majority of tasks, not just occasionally relevant.

**Adaptive prefetching**: Over multiple sessions, the harness can learn access patterns. If every bug fix task starts by reading the same three files, those should be pre-loaded. This is the agent equivalent of hardware's stride prefetcher learning a program's access pattern.

---

## 4. Virtual Memory for Agents

Virtual memory is one of the most important abstractions in computing. It gives each process the illusion of having a large, contiguous, private memory space, even though physical RAM is shared, fragmented, and limited. The operating system and hardware cooperate to maintain this illusion through page tables, demand paging, and swapping.

The agent equivalent is a system that gives each agent the illusion of having unlimited context, even though the actual context window is limited. MemGPT (now Letta) was the first system to explicitly implement this abstraction.

### 4.1 Page Tables: The Index of What Is Where

**Hardware**: A page table maps virtual addresses to physical addresses. When the CPU accesses a virtual address, the Memory Management Unit (MMU) consults the page table to find the physical location. The page table also records whether each page is in RAM or has been swapped to disk.

**Agent mapping**: A page table for agents is an index that tracks what information is currently in the context window versus what is stored externally. It answers: "Is this knowledge in-context right now, or do I need to retrieve it?"

A concrete agent page table might look like:

```json
{
  "pages": [
    {"id": "task-spec", "status": "resident", "location": "context", "last_accessed": "turn_42"},
    {"id": "module-auth", "status": "swapped", "location": "file:///src/auth/mod.rs", "summary": "Auth module, JWT + sessions"},
    {"id": "session-history-1-20", "status": "swapped", "location": "bead://session-42-p1.md", "summary": "Initial exploration, 3 approaches tried"},
    {"id": "test-results", "status": "resident", "location": "context", "last_accessed": "turn_45"},
    {"id": "api-spec", "status": "swapped", "location": "file:///docs/api.yaml", "summary": "OpenAPI spec, 47 endpoints"}
  ]
}
```

The MemGPT/Letta system implements exactly this: it maintains an explicit table of what is in the LLM's context ("main memory") versus what is in external storage ("disk"), and it gives the LLM tools to page content in and out.

### 4.2 Page Faults: The Retrieval Trigger

**Hardware**: A page fault occurs when the CPU tries to access a virtual address whose page is not currently in physical RAM. The MMU raises an exception, the OS locates the page on disk, reads it into a free RAM frame, updates the page table, and resumes the instruction. This takes ~1-10 ms (millions of CPU cycles), making page faults extremely expensive.

**Agent mapping**: An agent page fault occurs when the agent needs information that is not in its context window. The symptoms are:

1. **Explicit request**: The agent says "I need to read file X" and issues a tool call. This is a *voluntary* page fault -- the agent knows it does not have the information.

2. **Hallucination**: The agent fabricates information that it does not actually have in context. This is an *involuntary* page fault that was not caught -- the agent did not realize the page was missing and generated plausible but incorrect content instead of faulting.

3. **Incorrect reasoning**: The agent proceeds with stale or incomplete information, producing subtly wrong outputs. This is a *silent* page fault -- the equivalent of accessing uninitialized memory.

The critical difference from hardware: in hardware, page faults are always detected and handled correctly (the MMU is deterministic). In agent systems, only explicit tool-call requests are reliable faults. Hallucination and silent faults are the agent equivalent of memory corruption -- the most dangerous class of error.

**Page fault handling for agents**:

```
1. Agent determines it needs information not in context
2. Agent issues tool call (file read, search, database query)
3. Harness retrieves the information from external storage
4. Information is loaded into context (paged in)
5. Context may need to make room (eviction/compaction)
6. Agent continues reasoning with the new information
```

**The TLB (Translation Lookaside Buffer) analog**: In hardware, the TLB is a small fast cache of recent page table entries, avoiding the overhead of a full page table walk for frequently accessed pages. For agents, a recent-files cache or a short memory of "I already know this file contains X" serves the same purpose -- it lets the agent skip tool calls for information it has recently accessed and can still reference in context.

### 4.3 Thrashing: The Death Spiral

**Hardware**: Thrashing occurs when the working set (the set of pages actively needed by a process) exceeds available physical RAM. The OS spends most of its time swapping pages in and out, and the process makes negligible forward progress. Each page brought in causes another needed page to be evicted, which is immediately needed again.

Thrashing was one of the first major crises in operating system design. Peter Denning's working set model (1968) provided the theoretical framework for understanding and preventing it.

**Agent thrashing**: This is one of the most recognizable failure modes in agent systems:

1. Agent reads file A into context to work on task T
2. Context is full, so earlier relevant context B is evicted (compacted)
3. Agent needs information from B, re-reads it
4. This evicts file A from context
5. Agent needs file A again, re-reads it
6. Cycle repeats with no progress

**Observable symptoms**:
- Repeated tool calls for the same files
- Agent "forgetting" decisions it made earlier in the conversation
- Compaction events happening frequently with the agent re-requesting context that was just compacted
- Context window utilization near 100% with rapid turnover
- The agent making contradictory statements across turns (reasoning based on different subsets of context)

**Thrashing in practice**: In the orchestrator system, thrashing manifests when a worker agent is given a task that requires simultaneous awareness of more files than fit in context. A refactoring task touching 15 files across 5 modules, where understanding any one file requires knowledge of several others, can trigger thrashing. The agent reads file 1, reasons about it, reads file 2, but now has forgotten details of file 1, reads file 1 again, and so on.

**Prevention strategies** (mapping Denning's working set model):

1. **Working set estimation**: Before assigning a task, estimate how much context it requires. If the working set exceeds context capacity, decompose the task into smaller subtasks.

2. **Degree of multiprogramming control**: In OS terms, do not run more processes than RAM can support. In agent terms, do not ask one agent to hold too many concerns simultaneously. This is why the orchestrator limits workers to focused, single-issue tasks.

3. **Selective summarization**: Instead of evicting entire files, create summaries that capture key facts in less space. This is like memory compression in hardware -- the working set fits, but at reduced fidelity.

4. **Working set pinning**: Identify the minimum set of files needed for the current task and pin them in context (do not evict during compaction). Like `mlock()` in POSIX systems.

### 4.4 The Working Set: Minimum Viable Context

**Hardware**: The working set at time t is the set of pages referenced in the last k time units. Denning's theorem states that if you give a process RAM equal to its working set, it will rarely fault. If you give it less, it will thrash.

**Agent working set**: The minimum context needed for the current task. This includes:

- The task specification (what to do)
- Relevant source code or data (what to work with)
- Constraints and requirements (what to respect)
- Current progress state (what has been done)
- Tool usage context (how to interact with the environment)

Estimating the working set is the most important capacity planning exercise in agent harness design. For a bug fix, the working set might be 10-20K tokens (issue description + one file + test file). For a large feature, it might be 50-100K tokens (multiple files + architecture docs + API specs + test suite). For a cross-cutting refactor, it might exceed any single context window, necessitating decomposition.

**Working set measurement**: Track which context segments the agent actually references (via tool calls, explicit mentions, or reasoning chains). Over time, this reveals the true working set for different task types, enabling better task decomposition and context loading.

### 4.5 Swapping: Moving Context Between Tiers

**Hardware**: When a page fault occurs and RAM is full, the OS must choose a victim page to swap out to disk. The victim's data is written to swap space, the page table is updated, and the requested page is loaded into the freed frame.

**Agent swapping**: When context is full and new information must be loaded, existing context must be evicted. The question is what to do with the evicted content:

1. **Discard**: Simply drop old messages. The context is gone. This is like a system with no swap -- when RAM fills, old data is lost. Simple but lossy.

2. **Summarize and retain**: Compact old messages into summaries that consume less context. This is like memory compression (hardware technique where pages are compressed before being stored, fitting more in the same space). Lossy compression, but the key information is retained.

3. **Write to external storage**: Save full conversation segments to files (bead patterns, session logs). This is true swapping -- the information is preserved on "disk" and can be paged back in later. Lossless but requires retrieval infrastructure.

The bead pattern used in some harness designs is a direct implementation of swap: conversation segments are summarized and written to files, with enough metadata to find and reload them when needed. The bead summary is the page table entry, and the full bead file is the swap page.

---

## 5. The Memory Wall for Agents

### 5.1 The Hardware Memory Wall

In 1995, Wulf and McKee published "Hitting the Memory Wall: Implications of the Obvious." Their observation was straightforward but devastating: processor speed was improving at ~60% per year (Moore's Law), while DRAM latency was improving at ~7% per year. The gap between what the processor could consume and what memory could deliver was growing exponentially.

```
Year    CPU Speed    DRAM Latency    Gap
1980    1 MHz        250 ns          250 cycles
1990    100 MHz      100 ns          10,000 cycles
2000    1 GHz        70 ns           70,000 cycles
2010    3 GHz        50 ns           150,000 cycles
2025    5+ GHz       40 ns           200,000+ cycles
```

The memory wall means that the processor is idle, waiting for data, for the vast majority of cycles. Despite extraordinary cache engineering, memory latency remains the dominant performance bottleneck in most workloads. The multi-level cache hierarchy is the engineering response to the memory wall -- it does not solve it, but it makes it tolerable.

### 5.2 The Agent Memory Wall

Agents face their own memory wall, and it is growing faster than hardware's:

**Model capability (processor speed) is improving rapidly**:
- Reasoning depth and accuracy increase with each generation
- Tool use sophistication is advancing (multi-step plans, complex queries)
- Multi-modal capabilities expand what the model can process
- Instruction following becomes more reliable

**Context management capability (memory bandwidth) is improving slowly**:
- Context windows have grown (4K to 8K to 32K to 128K to 200K to 1M), but this is like adding more RAM -- it does not solve the bandwidth problem
- Attention mechanisms have not fundamentally changed -- the "lost in the middle" problem persists even in larger windows
- Compaction and summarization techniques are still crude -- most systems use simple truncation or basic LLM-generated summaries
- Retrieval augmentation (RAG) hit rates are mediocre for complex tasks (typically 50-70% precision for nuanced queries)
- No agent system has automated cache coherence
- Prefetching is manual (CLAUDE.md curation) not adaptive

**The gap**:

```
Dimension              2023            2025            Growth Rate
Model reasoning        GPT-4           o3/Claude 4     ~10x improvement
Context window         32K tokens      200K-1M tokens  ~10-30x larger
Effective utilization  ~60% of window  ~60% of window  ~0% improvement
Retrieval precision    ~55%            ~65%            ~18% improvement
Coherence automation   0%              0%              No improvement
Adaptive caching       None            None            No improvement
```

The model is getting smarter faster than we are getting better at feeding it the right context. This is the agent memory wall.

### 5.3 Manifestations of the Agent Memory Wall

**The context utilization problem**: A 200K-token context window should, in theory, hold a substantial amount of a codebase. In practice, much of that context is:
- System prompts and instructions (5-20K tokens, often immutable)
- Conversation history of decreasing relevance (grows linearly with session length)
- Tool call results that are partially redundant (file reads that overlap)
- Formatting overhead (markdown, JSON, natural language wrapping)

Effective utilization -- the percentage of context tokens that are actively useful for the current reasoning step -- is rarely above 30-40% in long sessions. This is analogous to memory fragmentation in hardware.

**The retrieval accuracy problem**: Even with vector stores and semantic search, retrieving the *right* context at the *right* time is hard. A question about "the authentication flow" might retrieve the auth module's code but miss the critical comment in a config file that explains a non-obvious timeout value. Hardware memory never returns the wrong data (data integrity is guaranteed by ECC). Agent memory returns wrong or incomplete data routinely.

**The coherence problem**: In a multi-agent system, context divergence is the norm, not the exception. Each agent builds its own "view" of the world from its context window, and these views drift apart as agents make changes that other agents do not see. Hardware solved this with cache coherence protocols in the 1980s. Agent systems in 2026 have no equivalent.

### 5.4 Implications for Harness Design

The memory wall tells us that simply making context windows larger is necessary but not sufficient, just as adding more RAM does not solve the memory wall in hardware. The solutions must come from better caching, not just bigger memory:

1. **Invest in cache hit rates, not just cache size**: A 200K-token window with 95% effective utilization outperforms a 1M-token window with 30% utilization. The harness should optimize for loading the right context, not just more context.

2. **Build real eviction policies**: Replace FIFO truncation with importance-aware compaction that retains high-value context and evicts low-value content regardless of age.

3. **Implement prefetching based on task analysis**: Before an agent starts a task, analyze what files, docs, and state it will need. Load them proactively, reducing page faults during execution.

4. **Design for coherence from the start**: Multi-agent systems need explicit coherence protocols. Even simple ones (version numbers on shared state, mandatory re-reads before critical decisions) are vastly better than nothing.

5. **Measure and minimize thrashing**: Track context turnover rate. If the agent is spending more than 20% of its turns on context management (re-reading files, re-establishing state), the task is too large for a single agent's working set.

---

## 6. Practical Memory Architecture for Agent Harnesses

Given everything above, what should a well-designed agent memory system look like today?

### 6.1 Tier Design

A production agent harness should explicitly manage four tiers:

**Tier 0 -- Hot Context (L1/L2 analog)**
- Content: Current task spec, most recent tool results, active reasoning chain
- Size: 5-20K tokens
- Policy: Always resident, never evicted, refreshed every turn
- Implementation: Structured as the most recent messages plus pinned system content

**Tier 1 -- Warm Context (L3/RAM analog)**
- Content: Project configuration, loaded source files, earlier conversation relevant to current task
- Size: 20-100K tokens
- Policy: Managed by importance-weighted eviction. Evict when Tier 0 needs space.
- Implementation: CLAUDE.md, state files, recently read files. Compacted with summaries when space is tight.

**Tier 2 -- Cool Storage (SSD analog)**
- Content: Bead summaries, vector store entries, session handoff files, local docs
- Size: MB to GB
- Policy: Indexed, searchable, retrievable via tool calls in 1-5 seconds
- Implementation: Local files with metadata indexes. Pre-processed for fast retrieval.

**Tier 3 -- Cold Archive (HDD/Tape analog)**
- Content: Full conversation logs, old session data, complete git history, archived research
- Size: GB to TB
- Policy: Retained for compliance/reference. Retrieval may be slow and requires precise queries.
- Implementation: Git repos, log files, databases. Accessible but not optimized for speed.

### 6.2 Recommended Cache Policies

| Decision | Recommended Policy | Rationale |
|----------|-------------------|----------|
| Eviction from context | Weighted LRU (recency + importance scoring) | Pure LRU loses critical constraints; importance weights preserve them |
| Compaction trigger | At 70% context utilization | Leave 30% headroom for tool results and reasoning |
| Compaction method | Selective summarization (not truncation) | Preserve key facts in fewer tokens |
| State persistence | Write-through for critical state, write-back for working state | Balance durability with overhead |
| Multi-agent coherence | Version vectors on shared files + mandatory re-read before writes | Minimum viable coherence protocol |
| Prefetching | Task-type-based loading from a curated manifest | Conservative prefetching avoids cache pollution |
| Working set control | Decompose tasks that exceed 60% of context capacity | Prevent thrashing before it starts |

### 6.3 The Compaction Contract

Compaction is the most critical operation in agent memory management. It is the equivalent of the OS's page replacement algorithm -- get it wrong and the system thrashes. A well-designed compaction should:

1. **Flush dirty state** before discarding any context (write-back flush)
2. **Preserve pinned content** (working set protection)
3. **Summarize rather than discard** evicted content (lossy compression, not deletion)
4. **Update the page table** (record what was evicted and where the summary lives)
5. **Validate the post-compaction context** (ensure the agent can continue its current task)

```
Pre-compaction checklist:
[ ] All dirty state written to persistent storage
[ ] Current task specification preserved
[ ] Active constraints preserved
[ ] Key decisions and rationale preserved
[ ] Page table / bead index updated
[ ] Evicted content summarized and stored
[ ] Post-compaction context validated against working set
```

### 6.4 Anti-Patterns

**The "infinite context" fallacy**: "Context windows are getting larger, so we do not need memory management." This is equivalent to saying "RAM is getting cheaper, so we do not need caching." Larger context helps, but without effective management, larger windows just mean more noise, more attention dilution, and more fragmented utilization.

**Blind truncation**: Dropping the oldest N messages without analysis. Equivalent to discarding the first N pages of RAM with no page table. Simple but destructive.

**Over-prefetching (cache pollution)**: Loading every possibly-relevant file into context "just in case." Each unnecessary file dilutes attention from necessary ones. In hardware, this is called cache pollution -- filling the cache with data that displaces more useful data.

**No coherence protocol**: Running multiple agents against shared state with no synchronization. In hardware, this causes data races and corruption. In agents, it causes conflicting changes, duplicated work, and inconsistent reasoning.

**Ignoring the working set**: Assigning tasks without estimating context requirements. The equivalent of running a 16 GB program on a machine with 4 GB of RAM and no swap. The result is always thrashing.

### 6.5 Future Directions

The hardware memory hierarchy took decades to refine. Agent memory management is in its infancy. Key areas where hardware provides a roadmap:

**Hardware-managed TLBs led to software-managed TLBs**: Early systems did all address translation in hardware. Later MIPS and SPARC architectures used software-managed TLBs, giving the OS more control. Similarly, agent memory management is currently split between the model (attention mechanism, uncontrollable) and the harness (context loading, controllable). As models gain the ability to explicitly manage their own context (MemGPT-style), we will see a shift toward software-managed agent TLBs.

**Huge pages reduced TLB pressure**: When workloads needed large contiguous memory, huge pages (2 MB or 1 GB instead of 4 KB) reduced TLB miss rates. For agents, the equivalent is chunking context into larger semantic units (entire files or document sections rather than individual messages) to reduce the overhead of tracking and managing many small context fragments.

**NUMA (Non-Uniform Memory Access) awareness**: In multi-socket systems, memory attached to the local socket is faster than remote memory. NUMA-aware software places data near the processor that will use it. In multi-agent systems, NUMA-awareness means placing context (files, state) near the agent that will use it -- in its working directory, in its state files, not in a centralized store that all agents must query.

**Memory disaggregation (CXL)**: The emerging CXL standard allows memory to be shared across processors with fine-grained access control. The agent equivalent is a shared context pool that multiple agents can read/write with coherence guarantees -- a long-term vision for multi-agent systems.

---

## 7. Summary: What Hardware Teaches Us

The memory hierarchy exists because of a fundamental physical constraint: proximity implies speed, and speed implies expense. Agent systems face the same constraint: relevance implies attention, and attention is finite.

| Hardware Lesson | Agent Application |
|----------------|------------------|
| Locality of reference makes caching work | Agents revisit recent context and related files -- exploit this with intelligent caching |
| LRU is good but not sufficient | Age-based eviction loses critical constraints; add importance weighting |
| Write-back reduces overhead | Batch state persistence; flush on compaction |
| Cache coherence is mandatory for multi-core | Multi-agent systems need explicit coherence protocols |
| Prefetching improves performance when accurate | Task-aware context loading prevents page faults |
| The working set determines thrashing | Estimate context requirements before assigning tasks |
| The memory wall is real | Better caching, not just bigger context, is the solution |
| Virtual memory provides the illusion of unlimited space | Tiered storage with paging lets agents exceed context limits |
| Thrashing is a death spiral | Monitor context turnover; decompose tasks that cause thrashing |
| The hierarchy evolved over decades | Agent memory management is in its infancy; the roadmap exists |

The memory hierarchy is solved in hardware. It is unsolved in agent systems. Every agent harness designer would benefit from studying the sixty years of hardware solutions that already exist, because the problem is the same problem wearing different clothes.

---

## References and Further Reading

### Classical Memory Hierarchy
- Hennessy, J.L. & Patterson, D.A. *Computer Architecture: A Quantitative Approach* (6th ed.). Morgan Kaufmann, 2017.
- Wulf, W.A. & McKee, S.A. "Hitting the Memory Wall: Implications of the Obvious." ACM SIGARCH Computer Architecture News, 1995.
- Denning, P.J. "The Working Set Model for Program Behavior." Communications of the ACM, 1968.
- Jacob, B., Ng, S., & Wang, D. *Memory Systems: Cache, DRAM, Disk*. Morgan Kaufmann, 2007.

### Agent Memory Systems
- Packer, C., Wooders, S., Lin, K., Fang, V., Patil, S.G., Stoica, I., & Gonzalez, J.E. "MemGPT: Towards LLMs as Operating Systems." arXiv:2310.08560, 2023.
- Liu, N.F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. "Lost in the Middle: How Language Models Use Long Contexts." Transactions of the ACL, 2024.
- Zhang, Z., et al. "A Survey on the Memory Mechanism of Large Language Model based Agents." arXiv:2404.13501, 2024.
- Letta (formerly MemGPT). "Letta: Building Stateful LLM Applications." https://www.letta.com/, 2024-2025.

### Cache Coherence
- Sorin, D.J., Hill, M.D., & Wood, D.A. *A Primer on Memory Consistency and Cache Coherence* (2nd ed.). Morgan & Claypool, 2020.
- Martin, M.M.K., Hill, M.D., & Sorin, D.J. "Why On-Chip Cache Coherence Is Here to Stay." Communications of the ACM, 2012.

---

*Part 6 of the Computer Architecture for Agents series. Previous: [Part 5: Pipelining and Superscalar Execution](05-pipelining-and-superscalar.md). Next: Part 7 (forthcoming).*
