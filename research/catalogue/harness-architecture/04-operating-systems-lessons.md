---
title: "What Operating Systems Theory Tells Us About Agent Harnesses"
date: 2026-04-12
topic: harness-architecture
angle: os-lessons
relevance: critical
---

# What Operating Systems Theory Tells Us About Agent Harnesses

> **Series note**: This is the OS-lessons angle on the harness-architecture series. A prior companion piece (`computer-architecture-for-agents/07-os-theory-for-agents.md`) already maps the full surface of OS subsystems to agent concepts in a "grand mapping table." This article does not re-run that mapping. Instead it asks a sharper question: given sixty years of OS research --- Multics, Unix, Mach, Linux, Plan 9, seL4, Erlang/OTP, systemd, eBPF --- which *lessons* should harness authors actually borrow, which *mistakes* should they refuse to repeat, and where does the analogy stop being useful?

Millidge's 2023 framing (the LLM as a CPU, context as RAM, tools as device drivers, harness as OS) is now formalized in Akshay Pachaar's "agent harness" article. Treating it as a metaphor is fine for marketing. Treating it as a *spec* is more interesting: if the harness is literally the OS for an LLM, then every subsystem the OS community spent decades arguing about has a direct counterpart we have not yet decided on. Most harnesses today are roughly at the "1975 Unix" level --- a scheduler that is really just a loop, memory management that is really just truncation, an IPC layer that is really just files on disk, a security model that is really a y/n prompt. The good news is that we do not have to guess what comes next. The OS community has already run the experiments.

## 1. Process model: what exactly is a "process" in an agent harness?

A process in Unix is defined operationally by its Process Control Block (PCB): program counter, register file, memory map, file descriptor table, signal mask, parent PID, scheduling priority, credential set. A "process" is whatever the OS needs to be able to suspend, resume, kill, and account for.

Most current harnesses conflate three distinct things into one "process":

1. **The agent session** (a running LLM instance with its persona and conversation history)
2. **The turn** (one request/response cycle inside the session)
3. **The tool call** (one syscall made during a turn)

Unix learned the hard way that these are different objects. A process is not a system call. A system call is not a thread. A thread is not a signal. Harnesses are currently making the same category mistake that pre-Mach monolithic kernels made: everything is "the process." Anthropic's Fork/Teammate/Worktree trichotomy is the first serious attempt at a proper typology:

- **Fork** is closest to Unix `fork()`: the child starts as a byte-identical copy of the parent's context and then diverges. Copy-on-write is emulated by sharing prefixes in the prompt cache. This is what you want for speculative exploration ("let a sub-agent try this and return only a summary").
- **Teammate** is closer to POSIX threads (`pthread_create`): multiple agents sharing an address space (a working directory) with cooperative synchronization via a file-based mailbox. As with pthreads, the speed is great and the footguns are legion.
- **Worktree** is a real `fork() + exec()` with a fresh address space (a new git worktree), isolated state, and merge-at-the-end semantics. This is the only mode that provides something like memory protection.

What is missing from every harness I know of is an explicit **PCB for agents**. The state file in this project (`_bmad/orchestrator-tmux-state.json`) is a PCB in everything but name, but it only tracks session metadata. A real agent PCB would record: current turn index, token budget consumed so far, last tool call and its status, pending human approvals, parent session ID, an open-file table (files this agent has read and considers "in context"), and an explicit *state* field from a finite state machine. Classical process states --- NEW, READY, RUNNING, BLOCKED, TERMINATED --- map cleanly to SPAWNING, QUEUED, EXECUTING, BLOCKED (waiting for tool/CI/human), COMPLETED. Most harnesses today conflate RUNNING and BLOCKED and then wonder why they cannot tell if an agent is stuck.

The concrete lesson: write down the PCB schema before anything else. Everything downstream --- scheduling, recovery, observability --- becomes trivial once you have one and impossible if you do not.

## 2. Scheduling: FCFS is the bare minimum, and we are mostly there

The scheduling literature is enormous and depressingly relevant. Orchestrators today almost all implement FCFS (first-come-first-served) over a GitHub issue queue or a task list, with occasional priority labels. That is where Unix V6 was in 1975.

The lessons that matter:

**Convoy effect is real.** A three-hour refactor in front of a one-minute typo fix wastes a slot for three hours. Pure FCFS punishes you for every slow task. SJF (shortest-job-first) is optimal for mean waiting time but requires an oracle; the LLM itself is a decent oracle, and "ask a cheap model to estimate complexity before scheduling" is a free win nobody implements.

**Non-preemptive priority scheduling starves low-priority work.** If `priority:critical` always preempts, then `priority:low` tech debt never runs. Unix solved this in the 1980s with **aging**: every N minutes, bump unscheduled jobs up one priority level. Apply directly to issue queues and your backlog stops rotting.

**Preemption is almost always the wrong call for agents.** Linux's CFS (Completely Fair Scheduler) preempts thousands of times per second because a context switch costs about a microsecond. An agent context switch costs tens of seconds of wall clock and --- worse --- is lossy: summarization drops nuance, compaction loses detail, warm caches evaporate. The cost ratio between a CPU context switch and an agent context switch is about 10^6 to 10^7. **A harness that preempts agents the way Linux preempts processes will destroy its own work.** The right default is non-preemptive with a round-robin time *budget* (not quantum) that forces an agent to commit a WIP checkpoint before being killed. That is closer to a cooperative multitasking system like the classic Mac OS than to Linux.

**Multilevel feedback queue (MLFQ) is the sweet spot.** This is what Windows NT, Solaris, and Mach all converged on. Three queues:

- Q1 (hotfix / customer bug): short budget, preempt-and-requeue only if it blows the budget, aging guaranteed
- Q2 (feature work): medium budget, demote on second timeout
- Q3 (tech debt / docs): long budget, only runs when Q1 and Q2 are empty

Add aging to prevent starvation, add *demotion* for agents that have been retried 3+ times on the same task (they are CPU-bound in the OS sense; they are burning tokens without making progress), and you have a scheduler that beats every orchestrator I have seen in the wild.

**The thing nobody schedules yet: token budget, not time.** Linux schedules CPU time because CPU time is the scarce resource. For an agent, the scarce resource is context window + cost. A Claude Max subscription has a rolling 5-hour message cap; API plans have per-token cost. The right scheduler is not `round_robin_by_wall_clock` --- it is `earliest-deadline-first over token budget`. Real-time OS theory (rate monotonic, earliest deadline first) has exactly the right vocabulary: each task has a worst-case execution time (WCET, measured in tokens) and a deadline. EDF is optimal on a single resource. The lesson: borrow the real-time scheduling literature, not the general-purpose one.

## 3. Memory management: the one area where theory already changed practice

Compaction, retrieval, and memory files are the areas where harness authors have been best served by OS theory, mostly because they already know the vocabulary. The mapping is so close it almost disappears:

- **Fixed partitioning** → context-window segment layout (system / tools / memory / history / user)
- **Segmentation** → the explicit hierarchy Codex uses (system > tools > developer > user > history)
- **Paging** → compaction and retrieval
- **Virtual memory** → RAG and memory files; the agent sees a private workspace, the harness decides what is resident
- **TLB** → the Claude Code ~150-char-per-entry memory index (a small, always-resident cache of where things live, pointing to larger files fetched on demand)

The concepts that actually sharpen design:

**Working set theory (Denning, 1968).** A process has a working set W(t, tau) --- the set of pages it has touched in the last tau time units. Thrashing happens when the sum of working sets exceeds physical memory: every page fault evicts a page that will be needed again immediately. The agent analogue: at any point in a task, an agent has a working set of files/facts it is actively reasoning over. If that working set exceeds the context window, the agent thrashes --- re-reading the same files every few turns because compaction keeps evicting them. The lesson is *not* "make the context window bigger." The lesson is: *measure the working set* and, if it is too large, split the task. Working set size is the single best indicator of whether a task should be handed to one agent or decomposed.

**Belady's anomaly.** For FIFO page replacement, adding more physical memory can increase the page fault rate. This sounds impossible and then you work the example. The agent analogue is real and worse: adding more context can make performance *worse*, not better. Chroma's context-rot work, Stanford's "Lost in the Middle," and Anthropic's own 30%+ degradation numbers on mid-window recall are Belady's anomaly in neural form. A harness that automatically "gives the agent more context to be safe" is committing the same mistake FIFO commits. LRU does not suffer Belady; neither does careful curation. Lesson: **least-recently-used curation beats bigger windows**. The "smallest set of high-signal tokens" heuristic from Anthropic's context engineering guide is just LRU replacement phrased as advice.

**Thrashing has a treatment.** Peter Denning's answer was the working set *model*: if a process's working set does not fit, do not try harder, *suspend the process*. In agent terms: if an agent keeps re-reading the same files (detectable from the tool-call log), do not raise its token budget, *stop it*, decompose the task, and respawn. This is the one piece of OS memory theory that should be in every harness and is in none of them.

**Page tables for prompt caches.** Anthropic's prompt caching is pure hardware paging. A cached prefix is a resident page; a cache miss is a page fault that costs real money. The harness should know its page table --- which prefixes are cached, which have expired --- and schedule accordingly. "Cache-aware scheduling" is a solved problem (Linux NUMA, CFS cache-aware placement); the same algorithms apply directly to prompt-cache-aware scheduling of sub-agents. Nobody does this yet.

## 4. File systems: git already gave us journaling, inodes, and COW for free

This is the area where agent harnesses accidentally inherited 30 years of filesystem research by sitting on top of git. Git commits are journal entries. Git objects are inodes. Git trees are directories. Git branches are snapshots. `git worktree` is literally a copy-on-write clone of the address space.

The real lessons to borrow live further up the stack:

**VFS (Virtual File System) is what MCP wishes it was.** Linux's VFS is the abstraction layer between the kernel and dozens of actual filesystems (ext4, xfs, btrfs, NFS, procfs, sysfs). A process does not know or care which FS a file lives on; it just calls `read()`. MCP aspires to the same role for external services but has not yet committed to the full VFS discipline: a tiny set of operations, a required implementation contract, mount namespaces, and inode-like handles. A mature MCP would let a harness "mount" a memory backend (SQLite, Redis, Obsidian vault, S3) at a well-known namespace and route all memory operations through it uniformly. Today's MCP is closer to the pre-VFS Unix of the 1970s: every tool has its own idiomatic interface, and the harness has to know which is which.

**Mount points are namespace discipline.** When MCP servers are registered today, they drop tools into a flat namespace with semi-conventional prefixes. Plan 9 showed the better way: every service mounts at an explicit path, the path is *hierarchical*, and two instances of the same service can mount at different paths without collision. Apply this to harnesses: `mount github://buri1/omniport-hh at /gh`, `mount obsidian:///vault at /notes`, `mount chrome-devtools at /browser`. Now a tool call is just a path. This also makes capability scoping trivial: you revoke permission by unmounting a subtree.

**Snapshots and COW are for speculation.** btrfs and ZFS snapshots exist so you can roll back. `git worktree` does the same job for agents. The lesson here is that *speculative execution* --- "let me try this change, and if it breaks, throw away the whole worktree" --- is cheap when it is COW and expensive otherwise. Harnesses that do not use worktrees (most of them) are paying full cost for every experiment, which makes speculation psychologically and financially expensive, which makes agents risk-averse, which makes them worse. Cheap speculation is a harness property, not a model property.

## 5. IPC: we have pipes and shared memory; we do not yet have D-Bus

Inter-process communication is where current harnesses are poorest. The typology from Unix is surprisingly complete:

- **Pipes** → sequential file handoffs between stages
- **Named pipes (FIFOs)** → convention-based mailbox files, as in gascity's agent mailbox pattern
- **Message queues** → JSONL task logs, GitHub Issues as a persistent queue
- **Shared memory** → shared git working directory (dangerous without locks)
- **Signals** → `tmux send-keys` interrupts, cancellation tokens
- **Sockets** → MCP server connections

The two mechanisms we lack entirely:

**D-Bus / service discovery.** Linux desktops solved "how does app A find out that service B exists" via D-Bus: a well-known bus with type-safe method calls, signal broadcast, and dynamic discovery. A harness has exactly this problem --- an agent should be able to ask "which tools are available right now for editing Python?" and get a typed answer without the tool list needing to be hardcoded. MCP could grow into this; it currently does not. A proper `introspect` operation over MCP that returns tool schemas, current availability, and rate-limit state would be the D-Bus for agent harnesses.

**Futexes / efficient blocking.** When a Unix thread waits on a mutex, it parks in the kernel and burns zero CPU until woken. When an agent "waits" for a tool result, it burns context tokens polling. The current orchestrator in this project polls `tmux capture-pane` every few seconds --- that is the equivalent of user-space busy-waiting, which Linux abandoned for futexes in 2003. The lesson: harnesses need an async "park until event" primitive that does not consume orchestrator tokens. This is probably the most impactful small change a harness author can make. Today on manual tmux I poll; on any programmatic harness I would wire PR merges through a webhook that wakes the scheduler.

## 6. Kernel vs userspace: the permission prompt is a syscall boundary

The most important insight from the Mach / L4 / seL4 lineage is that **the boundary between privileged and unprivileged code must be architecturally enforced, not just documented.** seL4 is the only OS kernel with a full formal correctness proof precisely because the authors refused to put anything above 9,000 lines of C into ring 0 and then proved that the boundary holds.

Agent harnesses today have the right *structure* --- the LLM is unprivileged, the tool layer is privileged, a tool call is a syscall, the permission prompt is the mode switch --- but the enforcement is weak. The system prompt and the tool output live in the same flat token sequence, so the "kernel/user" boundary is about as strong as 1970s DOS where any program could write to any memory.

Capability-based security (EROS, KeyKOS, seL4) is the right model. A capability is an unforgeable handle that both *names* a resource and *authorizes* access to it. The rule is: no ambient authority. You cannot open a file because "you are root"; you can open it because you hold a capability to it. Transferred to harnesses: a sub-agent does not have "write access" in general; it holds a capability that authorizes exactly `Edit(/path/to/file.ts)` for exactly the next N turns. Anthropic's ~40-capability permission gating is already capability-flavored; the missing piece is *delegation*. A parent agent should be able to mint a restricted capability and hand it to a child, and the child should not be able to escalate. seL4 solved this in 2009. We can copy the algorithm.

The subtler seL4 lesson: **proof-carrying code** is the right endgame for harness safety. A harness should be able to say "this tool call cannot possibly violate these invariants" and mean it formally. We are nowhere near this, but the target exists.

## 7. Device drivers: tool schemas are drivers, and blocking/non-blocking matters

Every MCP server is a device driver in the strict technical sense: it exposes a uniform interface (`list_tools`, `call_tool`) that hides a heterogeneous backend (a browser, a database, a REST API). The lessons from Unix driver history are directly applicable:

**Blocking vs non-blocking I/O.** Tools today are mostly synchronous: the agent calls, the harness waits, the result comes back. For tools that take seconds (web search, CI runs, long database queries), this blocks the entire turn. Unix solved this with non-blocking I/O (`O_NONBLOCK`) and `select()`/`poll()`/`epoll()`: a process can issue many I/O requests and then wait on all of them. Claude Code already does this for parallel read-only tool calls (`concurrent tool calls`), but the model has to ask for it explicitly. A harness should be able to speculatively issue several likely tool calls in parallel, cache results, and hand them back as needed. This is `readahead` and `prefetch` applied to tool invocation, and it is nearly free.

**DMA (Direct Memory Access)**: the big lesson. In an OS, a disk does not shovel bytes through the CPU; it writes directly into RAM and signals when done. The agent analogue is: do not pass large payloads through the LLM. A 50 KB CSV should never enter the context window in full. The harness should give the tool a capability to write directly to a file, and give the agent a *handle* (path, row count, schema) that is 200 tokens instead of 50,000. Claude Code's grep/head/tail discipline is DMA in spirit. Every harness should adopt it as a *principle*: large data flows around the model, not through it.

**Interrupt handling.** When a long-running tool finishes, the harness needs a way to notify the waiting agent without busy-polling. Unix signals are the model. Webhooks are the agent equivalent. A harness that exposes "sleep until webhook X fires" as a first-class tool gives up nothing and buys back a lot of orchestrator context.

## 8. Init systems and supervision: Erlang/OTP is the right answer

systemd, SysV init, runit, and Erlang/OTP all solve the same problem: what do you do when a long-running service crashes? The OTP answer is the most sophisticated and the most directly applicable to agents.

**OTP supervision trees.** Erlang's philosophy is "let it crash." Processes are cheap; failures are expected; the whole system is a tree of supervisors, each of which has a restart *strategy*: `one_for_one` (restart just the dead child), `one_for_all` (restart all siblings), `rest_for_one` (restart dead child and everything started after it), `simple_one_for_one` (dynamic children). Each supervisor has restart *intensity* limits --- no more than 3 restarts in 5 seconds --- otherwise the supervisor itself crashes and escalates up the tree.

Apply this to an orchestrator with N workers. Today, when a worker gets stuck, the usual response is ad-hoc: notice via `capture-pane`, run `/roadblock-recovery`, decide what to do. An OTP-style supervisor would be declarative:

```
orchestrator (supervisor, rest_for_one)
├── worker-pool (supervisor, simple_one_for_one, max 3 restarts / 10 min)
│   ├── worker-auth-fix
│   ├── worker-ui-refactor
│   └── worker-api-migration
└── reviewer-pool (supervisor, one_for_one, max 5 restarts / 10 min)
    └── reviewer-pr-42
```

Crashed worker? Automatic restart. Crashes too often? Escalate to the parent supervisor, which decides whether the whole workflow is toast and should be torn down. This is exactly the behaviour you want from an autonomous loop at 3am. It is also exactly what a manual tmux + Claude Code setup *cannot* do today, which is one of the reasons the author's pi-agent programmatic harness is not yet usable as a drop-in --- restart semantics are hard.

**Declarative unit files.** systemd's `.service` files are the right format for agent definitions. Declarative (not imperative), versioned, diff-able, with dependencies, environment, limits, and restart policy. Compare to today's reality where agent definitions are markdown files, YAML frontmatter, CLI flags, and environment variables in uneasy combination. A harness should have a single "unit file" format: `name`, `persona`, `tools`, `budget`, `depends_on`, `restart_policy`, `stop_when`. Then `systemctl start worker-auth-fix` is just `spawn_unit worker-auth-fix.agent`.

**`/etc/rc.local` for agents** is the project's `.claude/` directory. CLAUDE.md is `/etc/profile`. Slash commands are `/etc/init.d/` scripts. Hooks are `/etc/cron.d/`. The question "what do you want on boot?" translates cleanly to "what do you want loaded into every session by default?"

## 9. POSIX for agents: MCP is the candidate, and it is not there yet

POSIX is 30+ years of agreement on a small set of interfaces (`open`, `read`, `write`, `fork`, `exec`, signals, pipes) that make programs portable across Unix variants. Every serious OS implements it, even the ones that disagree about everything else. POSIX is the reason a C program written in 1995 still compiles on a 2026 Linux box.

Is there a POSIX for agent harnesses? Not yet, but there are candidates. MCP is the most serious: it standardizes tool invocation, resource access, and prompt templates across backends. What is missing from "POSIX-grade" MCP:

- A **process API** (`spawn_subagent`, `wait`, `kill`, `signal`)
- A **memory API** (`store`, `retrieve`, `list`, `delete` with TTLs and namespaces)
- A **credentials / capability API** (mint, delegate, revoke)
- A **scheduling hook** (a way for a harness to say "call me back when this token budget elapses")
- A **standard error taxonomy** (transient, retryable, permanent, user-fixable --- LangGraph has this internally; it should be in the protocol)
- An **introspection API** (list available tools, memory backends, sub-agent types, with schemas)

Until MCP (or a competitor) absorbs these, every harness will keep reinventing them incompatibly. The lesson from POSIX is not "write a spec." It is "write the spec *and then submit a suite of compliance tests that everybody runs*." POSIX without the conformance tests would be just IEEE folklore.

## 10. Microkernel vs monolithic, applied to harnesses

The old debate --- Tanenbaum vs Torvalds, microkernel vs monolithic --- has a clean agent analogue:

**Microkernel (Mach, L4, seL4, QNX, MINIX):** a minimal trusted core that only provides IPC, address spaces, and scheduling. Everything else --- file systems, networking, drivers --- runs in unprivileged userspace. The advantage: tiny TCB, formal verification tractable, services are restartable. The classical disadvantage: IPC overhead. The agent analogue is **Anthropic's "dumb loop + smart model"**: the harness does almost nothing; the model does almost everything; tool servers run as isolated MCP processes. Claude Code *is* a microkernel architecture.

**Monolithic (Linux):** the kernel does everything. Drivers, file systems, networking, scheduling --- all one address space, all privileged. The advantage: speed (no IPC), tight integration, decades of optimization. The disadvantage: one bug in any subsystem crashes the whole kernel, and the codebase becomes unreviewable. The agent analogue is **LangGraph's explicit state graph harness**: the framework owns control flow, state, routing, error handling, and retries in one unified object graph.

**Hybrid (XNU/Darwin, Windows NT):** pragmatic mix. The kernel is monolithic in structure but carves out user-mode services where safety matters. This is where most real harnesses will end up. CrewAI and AutoGen sit here already: explicit framework logic for routing and coordination, plus delegating the hard thinking to the model.

**Which wins?** The Linus argument --- "microkernels are beautiful on paper and slow in practice" --- does not translate, because the overhead equation is inverted. For an OS, IPC is slow relative to local function calls, so monolithic wins on performance. For an agent, *the model call dominates everything*; IPC overhead is negligible next to a 30-second LLM turn. This means the usual microkernel penalty does not apply, and the usual microkernel advantages (minimal TCB, restartable services, formal verification) apply in full force. **Microkernel-style harnesses should win on merit over the long run.** The co-evolution principle (models post-trained to drive a specific harness) reinforces this: if you train the model to be the brain, you do not want the framework fighting it with its own opinions.

Monolithic graph frameworks will keep their niche for workloads where determinism matters more than capability --- compliance, regulated industries, anything that needs to be auditable step-by-step. But the general direction is Anthropic's: thinner harness, smarter model.

## 11. Specific OS concepts worth borrowing, in priority order

A checklist of techniques that are known-good in OS practice, directly applicable, and mostly missing from today's harnesses:

1. **Copy-on-write for checkpoints.** Every non-trivial action should be preceded by a cheap snapshot. `git worktree add` + `git commit` is the poor-person's version. A harness should make this automatic, not a worker's responsibility.

2. **`fork()` semantics for speculative exploration.** The ability to say "split here, try both branches, discard the loser" should be a first-class operation, not a construction project. Prompt-cache prefix sharing already makes this cheap on the compute side; the missing bit is the API.

3. **cgroups and namespaces for resource isolation.** Every agent should run in a constraint box: max tokens, max wall clock, max files, max network requests, max money. Linux cgroups do this for processes; a harness should do it for sub-agents. Today, most limits are implicit ("the model will probably stop eventually"), which is the agent equivalent of `while(1) malloc(1MB)`.

4. **systemd units for declarative agent definitions** (see Section 8).

5. **eBPF-style hot-patchable policies.** eBPF lets you attach code to kernel events without recompiling. A harness should let you attach a small policy snippet --- "before every `Write` tool call, if the path matches `**/production/**`, require explicit approval" --- without restarting the orchestrator. Hooks are a blunt version of this. eBPF-style policies would be sharper, safer (verified before load), and composable.

6. **seccomp filters for tool permission narrowing.** `seccomp-bpf` lets a process voluntarily drop the ability to make certain syscalls. The agent version: a sub-agent voluntarily (or under orchestrator compulsion) drops the ability to use certain tools *for the rest of its lifetime*. This is the right primitive for "a reviewer agent should not be able to write code under any circumstances." Today you enforce that by convention; you should enforce it by structural impossibility.

7. **Capability delegation** (EROS/KeyKOS/seL4, see Section 6). Fine-grained, unforgeable, revocable.

8. **Plan 9's "everything is a file."** Plan 9 took Unix's informal "most things are files" and made it absolute: processes are files, network connections are files, the window system is files, graphics are files. Everything is namespaced under `/proc`, `/net`, `/dev`, and accessed through read/write. The agent analogue: **everything is a tool**. Memory access is a tool call. Spawning a sub-agent is a tool call. Reading the scheduler state is a tool call. Setting a timer is a tool call. This gives you a single uniform API surface that the LLM is already good at, and it subsumes most of the other primitives in this list. Of all the OS ideas worth borrowing, this one is the cheapest and the most radical.

## What this means for a solo operator with a manual tmux harness

A word against over-selling: the project this article lives in is a manual tmux + Claude Code setup run by one person. There is no production scheduler. The "pi-agent programmatic harness" referenced in the memory is aspirational; it does not yet work end-to-end. The OS lessons above are not a roadmap to ship tomorrow --- they are a grammar for thinking about what the next harness should look like.

What a solo operator can borrow *today*, ranked by effort:

- **Write the PCB schema** (one JSON file, one afternoon). It gives you recovery and observability for free.
- **Stop preempting.** Use time *budgets* that force a WIP commit before killing, not mid-turn interruption.
- **Move everything to worktrees.** This is COW, memory protection, and speculation in one change. The author already learned this; the note is to never regress.
- **Measure working sets.** A simple "which files has this agent read in the last N turns" log catches thrashing before it costs an hour.
- **Declarative units.** Even a markdown-with-frontmatter "unit file" per persona beats argv-flag spelunking.
- **Capability hygiene.** Do not pass `--dangerously-skip-permissions` to an agent that only needs to read. Even a 10-line allow-list is better than nothing.

What no solo operator should try to build from scratch: consensus protocols, real microkernels, full capability systems, eBPF-style policy engines. These are the "2030 harness" layer. They are worth reading about so you know what to buy or borrow when somebody ships them.

## The thing the OS analogy does not capture

Every analogy has a boundary. The places where "harness == OS" breaks down, and where naively applying OS lessons will bite:

- **The LLM is not deterministic.** A syscall with the same arguments returns the same answer. A tool-call-plus-LLM-reasoning does not. Cache semantics, retry semantics, and idempotency all become harder.
- **The LLM is a probabilistic oracle, not a CPU.** You cannot treat the model as a dumb executor; it has opinions, can refuse, and improves over time. This is why "dumb loop + smart model" beats "smart framework + dumb model": the probabilistic component should not be inside the deterministic plumbing.
- **Co-evolution makes portability harder than POSIX.** If a model is post-trained against a specific harness, then moving it to a different harness is not just recompiling C for a new arch; it is asking a trained musician to play a different instrument. MCP cannot fully solve this; it can only reduce it.
- **Context is not memory.** RAM is random-access, uniformly indexed, and homogeneous. A context window has positional effects (Lost in the Middle), attention anisotropy, and order-dependent semantics. Paging algorithms designed for uniform memory need to be rethought for non-uniform context.
- **The scaffolding should shrink.** No OS kernel ever got smaller on purpose. Every harness *should*. The co-evolution principle points to thinner harnesses as models improve; the OS instinct is the opposite. Build to delete.

## Closing: read the OS textbook, delete half of it

The reason OS theory is such a rich source of lessons is that OS authors were forced to think carefully about resources, failure, isolation, and abstraction under hostile constraints. Those constraints (finite memory, flaky hardware, adversarial users, hard real-time deadlines) are back, in a different shape, in every production agent harness. We do not get to re-run the 60-year experiment.

But we also do not have to run the whole thing. A lot of what OS design fought over --- microsecond scheduling, lock-free data structures, NUMA affinity, page coloring --- is irrelevant to agents, where the LLM call dominates everything. The parts worth borrowing are the *architectural* parts: capability security, supervision trees, journaling, working sets, COW, VFS, declarative units. The parts worth skipping are the microoptimizations.

Millidge was right in 2023 and Pachaar's 2026 formalization confirms it: the harness is an operating system in everything but name. The useful follow-up question is not "what should the OS look like" --- that is answered well enough by the above --- but "which OS lesson will still be true when the model is a year smarter?" The honest answer is: the ones about *isolation, recovery, and least privilege*. Performance micro-optimizations evaporate with the next model release. Architectural invariants do not. Write the harness that will survive being half-deleted every six months, and borrow from OS theory accordingly.

---

**See also (same series):** `00-source-article.md` (Pachaar, "The Anatomy of an Agent Harness"). **Companion piece with the exhaustive OS-to-agent mapping table:** `computer-architecture-for-agents/07-os-theory-for-agents.md` --- this article deliberately does not duplicate its grand mapping and instead focuses on lessons, named systems, and what to build next.
