# Part 7: Operating Systems Theory for Agent Harnesses

> **Series**: Computer Architecture for Agents (7 of 7)  
> **Thesis**: The agent harness IS the operating system. Every major OS subsystem has a direct, non-metaphorical counterpart in agent orchestration. Understanding these mappings is not academic decoration --- it is the fastest path to building harnesses that do not collapse under real workloads.

**Foundational reference**: Akshay's ".claude folder anatomy" post identifies the harness as the operating system for agents --- CLAUDE.md as kernel config, commands as syscalls, hooks as interrupt handlers. This part takes that observation literally and exhaustively.

**Prerequisites**: Parts 1-6 of this series. Part 4 (Memory Hierarchy) is especially relevant; this part summarizes memory management and points there for the deep dive.

---

## Table of Contents

1. [Process Management](#1-process-management)
2. [Memory Management](#2-memory-management)
3. [File Systems](#3-file-systems)
4. [I/O Management](#4-io-management)
5. [Security and Protection](#5-security-and-protection)
6. [Concurrency and Synchronization](#6-concurrency-and-synchronization)
7. [Distributed OS Concepts](#7-distributed-os-concepts)
8. [The Grand Mapping Table](#8-the-grand-mapping-table)
9. [Design Implications](#9-design-implications)

---

## 1. Process Management

### 1.1 Processes = Agent Sessions

In an OS, a **process** is a program in execution --- code loaded into memory, a program counter, registers, a stack, and an allocated address space. In agent land, a **process** is an agent session: a running LLM instance with a system prompt loaded, a conversation history (its "memory"), tool bindings (its "I/O devices"), and a working directory (its "address space").

The correspondence is structural, not poetic:

| OS Process Component | Agent Session Equivalent |
|---|---|
| Program code (text segment) | System prompt + CLAUDE.md + agent persona |
| Program counter | Current position in the agentic loop (fetch-decode-execute from Part 2) |
| Registers | Active working variables in the conversation context |
| Stack | Conversation history (grows with each turn) |
| Heap | Scratchpad files, intermediate artifacts the agent creates |
| Process ID (PID) | Session ID, tmux window name, or worktree branch name |
| Parent PID | The orchestrator session that spawned this agent |
| Process Control Block (PCB) | The state JSON entry for this agent (e.g., `orchestrator-tmux-state.json`) |

The **Process Control Block** deserves special attention. In an OS, the PCB stores everything needed to pause and resume a process: PID, state, program counter, CPU registers, memory limits, open files, I/O status. The agent equivalent is the state record that tracks:

```json
{
  "session_name": "worker-auth-fix",
  "state": "running",
  "purpose": "Fix OAuth token refresh bug",
  "spawned_at": "2026-04-04T10:30:00Z",
  "tmux_window": "worker-auth-fix",
  "working_directory": "/path/to/worktree",
  "assigned_issue": "#142",
  "branch": "fix/oauth-refresh",
  "last_seen_alive": "2026-04-04T10:45:00Z"
}
```

Without a PCB, the OS cannot do context switching. Without a state record, the orchestrator cannot recover crashed agents, avoid duplicate spawns, or know what work is in progress.

### 1.2 Process States

The classic five-state process model maps directly:

```
OS Process States:          Agent Session States:

    NEW ──────────────────> SPAWNING
     │                        │
     v                        v
   READY ─────────────────> QUEUED
     │                        │
     v                        v
  RUNNING ────────────────> EXECUTING
     │    \                   │    \
     v     v                  v     v
  WAITING  TERMINATED ────> BLOCKED  COMPLETED/FAILED
     │                        │
     v                        v
   READY ─────────────────> QUEUED (retry)
```

| OS State | Meaning | Agent State | Agent Meaning |
|---|---|---|---|
| **New** | Process being created, resources allocated | **Spawning** | tmux window created, Claude process starting, prompt loading |
| **Ready** | Process loaded and waiting for CPU time | **Queued** | Agent task defined but waiting for a slot (max 6 concurrent workers) |
| **Running** | Process actively executing on CPU | **Executing** | Agent actively processing, making tool calls, generating output |
| **Waiting/Blocked** | Process waiting for I/O or event | **Blocked** | Agent waiting for: human approval, CI pipeline, external API, another agent's output |
| **Terminated** | Process finished or killed | **Completed/Failed** | Agent finished task (PR merged) or crashed/timed out |

**Key insight**: In an OS, the transition from READY to RUNNING requires the scheduler to dispatch the process. In agent orchestration, the transition from QUEUED to EXECUTING requires the orchestrator to spawn a new agent into an available slot. The constraint is identical: finite execution resources (CPU cores vs. concurrent agent slots).

The WAITING/BLOCKED state is where most agent time is actually spent --- waiting for tool call results, CI pipelines, PR reviews, or human input. Just as OS designers optimize for I/O-bound workloads (most real processes spend most of their time waiting), agent harness designers should optimize for the blocked-to-ready transition.

### 1.3 Process Creation: fork(), exec(), and Agent Spawning

Unix creates processes via two primitives:

- **fork()**: Creates a child process that is an exact copy of the parent. The child inherits the parent's memory, file descriptors, and environment. It then diverges.
- **exec()**: Replaces the current process image with a new program. Often used after fork() to run a different program in the child.

Agent harnesses have direct equivalents:

| Unix Primitive | Claude Code Equivalent | Behavior |
|---|---|---|
| **fork()** | **Fork subagent** | Creates a child agent that inherits the parent's context (CLAUDE.md, project files, conversation summary). The child starts with the parent's "memory" and then diverges to work on a specific subtask. |
| **exec()** | **Dispatch with new persona** | The spawned agent loads a completely different system prompt / persona. Like exec() replacing the process image, the agent's "program" is entirely different from the parent's. |
| **fork() + exec()** | **Orchestrator spawning a worker** | The orchestrator creates a new tmux window (fork analog), then starts Claude with a specific task prompt (exec analog). The worker inherits project context but runs a different "program." |
| **vfork()** | **Lightweight inline subtask** | Parent suspends until child completes. Like an agent that calls a tool and blocks until the result returns --- no true parallelism. |
| **clone()** (Linux) | **Teammate / shared-worktree agent** | Fine-grained control over what is shared. Two agents sharing the same git repo but with separate conversation contexts --- like threads sharing an address space but with separate stacks. |

**Claude Code's three spawning modes** map to these primitives:

1. **Fork**: `fork()` --- child inherits parent context, works on subtask, returns result. Parent may block or continue.
2. **Teammate**: `clone()` with shared address space --- agents share the same working directory and can see each other's file changes. Requires synchronization (see Section 6).
3. **Worktree**: `fork() + exec()` with copy-on-write --- agent gets its own git worktree (separate address space), works independently, merges results back via PR. This is the safest parallelism model.

**The process tree**: Just as Unix maintains a process tree (init -> shell -> child processes), the orchestrator maintains an agent tree:

```
orchestrator (PID 1 / init)
├── worker-auth-fix (PID 2)
│   └── subtask-test-write (PID 5)    # fork() from worker
├── worker-ui-refactor (PID 3)
└── worker-api-migration (PID 4)
    ├── subtask-schema-gen (PID 6)
    └── subtask-endpoint-test (PID 7)
```

When the orchestrator dies, what happens to orphaned workers? In Unix, orphans are re-parented to init. In agent land, the recovery command (`/tmux-recovery`) scans for orphaned tmux windows and either re-adopts them or terminates them cleanly.

### 1.4 Process Scheduling

This is where the OS analogy becomes immediately actionable. An orchestrator with a backlog of 20 issues and 6 agent slots IS a scheduler with a ready queue and N CPUs.

#### FIFO (First Come, First Served)

**OS behavior**: Processes execute in arrival order. Simple, no starvation, but suffers from the **convoy effect** --- a long-running process blocks everything behind it.

**Agent equivalent**: Process GitHub issues in order of creation. Issue #101 (5-minute typo fix) waits behind Issue #87 (3-hour refactor).

**Verdict for agents**: Too naive. The convoy effect is devastating when one agent gets stuck on a complex task while trivial fixes pile up.

#### SJF (Shortest Job First)

**OS behavior**: Prioritize the process with the shortest expected execution time. Optimal for minimizing average waiting time. Problem: requires knowing job duration in advance (impossible in general).

**Agent equivalent**: Estimate task complexity ("t-shirt sizing") and prioritize quick wins. A label like `good-first-issue` or `complexity:low` acts as the duration estimate.

**Verdict for agents**: Useful heuristic. LLMs are surprisingly good at estimating their own task complexity from issue descriptions. An orchestrator could ask a lightweight model to estimate complexity before scheduling.

**Risk**: Starvation of complex tasks. Large refactors never get scheduled because quick fixes keep arriving. Must combine with aging.

#### Round Robin

**OS behavior**: Each process gets a fixed time quantum. After the quantum expires, the process is preempted and moved to the back of the queue.

**Agent equivalent**: Give each agent a time budget (e.g., 30 minutes). If the task is not complete, checkpoint the work (commit, push WIP branch), kill the agent, and re-queue the task.

**Verdict for agents**: Surprisingly relevant. Agents that run for hours often degrade in quality (context window fills up, the agent starts repeating itself). A time quantum forces checkpointing and fresh starts, which can actually improve quality.

**Implementation**: The orchestrator polls `tmux capture-pane` on intervals. If an agent has been running for >N minutes with no new commits, it triggers a preemption: sends a "wrap up and commit your progress" message, waits for the commit, then kills the window.

#### Priority Scheduling

**OS behavior**: Each process has a priority. Higher priority processes run first. Can be preemptive (interrupt a running low-priority process) or non-preemptive (wait for it to finish).

**Agent equivalent**: GitHub issue labels (`priority:critical`, `priority:high`, `priority:medium`, `priority:low`) or milestone assignments determine scheduling order.

**Verdict for agents**: Essential for production orchestrators. Customer-reported bugs (`priority:critical`) must preempt feature work. The question is whether to use preemptive or non-preemptive scheduling.

**Non-preemptive priority** (let the current agent finish): Simpler, no wasted work, but a high-priority bug waits until the current agent slot frees up.

**Preemptive priority** (kill a low-priority agent): Faster response to critical issues, but the killed agent's work may be lost. Mitigation: force a WIP commit before killing.

#### Multilevel Feedback Queue (MLFQ)

**OS behavior**: The most sophisticated general-purpose scheduler. Multiple queues with different priorities. New processes start in the highest-priority queue. If a process uses its full time quantum (CPU-bound), it gets demoted to a lower-priority queue. If a process frequently blocks on I/O (I/O-bound), it stays in a high-priority queue. Periodic **aging** boosts long-waiting processes to prevent starvation.

**Agent equivalent --- and this is the recommendation**:

- **Queue 1 (highest priority)**: Hotfix tasks, customer-reported bugs, CI-breaking changes. Short time quantum (15 min). If not done, agent is killed and task re-evaluated.
- **Queue 2 (medium priority)**: Standard feature work, refactors. Medium time quantum (45 min). If the agent runs out of time, checkpoint and demote to Queue 3.
- **Queue 3 (low priority)**: Tech debt, documentation, nice-to-haves. Long time quantum (2 hours). Only scheduled when Queues 1 and 2 are empty.
- **Aging**: Any task that has been queued for >24 hours gets promoted one level. Prevents starvation of tech debt work.
- **Demotion**: An agent that has been "retried" 3 times on the same task gets demoted and flagged for human review. This is the equivalent of a CPU-bound process being demoted --- the task is consuming resources without completing.

```
   ┌─────────────────────────────────────────────┐
   │  MLFQ for Agent Orchestration                │
   │                                               │
   │  Queue 1: CRITICAL    [15 min quantum]       │
   │  ┌──────┬──────┬──────┐                      │
   │  │Bug#99│Bug#98│      │ ◄── New critical     │
   │  └──────┴──────┴──────┘     issues enter here│
   │           │ timeout                           │
   │           v                                   │
   │  Queue 2: STANDARD    [45 min quantum]       │
   │  ┌──────┬──────┬──────┬──────┐               │
   │  │Feat#1│Feat#2│Bug#97│      │ ◄── Demoted   │
   │  └──────┴──────┴──────┴──────┘     from Q1   │
   │           │ timeout                           │
   │           v                                   │
   │  Queue 3: BACKGROUND  [2 hr quantum]         │
   │  ┌──────┬──────┬──────┬──────┬──────┐        │
   │  │Debt#1│Docs#3│Feat#2│      │      │        │
   │  └──────┴──────┴──────┴──────┴──────┘        │
   │                                               │
   │  ↑ Aging: +1 priority every 24 hours          │
   └─────────────────────────────────────────────┘
```

### 1.5 Context Switching

In an OS, a **context switch** saves the state of the running process (registers, program counter, stack pointer) and loads the state of the next process. It is pure overhead --- no useful work happens during the switch. Typical cost: 1-10 microseconds on modern hardware, but the indirect costs (cache invalidation, TLB flush, pipeline stalls) can be 10-100x higher.

In agent land, context switching is **catastrophically more expensive**:

| Dimension | OS Context Switch | Agent Context Switch |
|---|---|---|
| Direct cost | 1-10 us (save/restore registers) | 10-60 seconds (load new conversation, parse context) |
| Indirect cost | Cache/TLB invalidation | Loss of working memory, "forgetting" what was just figured out |
| Frequency tolerance | Thousands per second | A few per hour at most |
| State save fidelity | Perfect (registers are bits) | Lossy (summarization drops nuance, compaction loses detail) |
| Restore fidelity | Perfect | Imperfect (agent must re-derive context from files + summary) |

**The cost ratio is roughly 10^6 to 10^7** --- an agent context switch is a million to ten million times more expensive relative to useful work than a CPU context switch. This has profound implications:

1. **Minimize context switches**: Unlike an OS that can switch thousands of times per second, an agent orchestrator should let agents run to completion whenever possible. Preemptive scheduling must be used sparingly.

2. **Make state saves high-fidelity**: The OS equivalent of "save registers" is "commit work-in-progress to a branch with a detailed commit message." The commit message IS the saved program counter --- it tells the next agent exactly where to resume.

3. **Compaction is lossy compression**: When an agent's context window fills up and triggers compaction (Claude Code's automatic summarization), information is permanently lost. This is like a context switch where some registers get corrupted. Design for it: externalize important state to files, do not rely on conversation memory alone.

4. **Warm starts beat cold starts**: An agent resuming work on a branch it previously created (warm start) is far cheaper than a new agent picking up someone else's work (cold start). The OS analogy: re-scheduling the same process on the same CPU core (cache-warm) vs. migrating it to a different core (cache-cold).

### 1.6 Inter-Process Communication (IPC)

Processes need to communicate. So do agents. The OS provides several IPC mechanisms, each with agent equivalents:

#### Pipes (Unidirectional Byte Streams)

**OS**: One process writes, another reads. Simple, ordered, blocking. `ls | grep foo`.

**Agent equivalent**: **Sequential handoff**. Agent A completes work and writes results to a file. Agent B is spawned and reads that file as input. The file acts as the pipe. Strictly one-directional: A produces, B consumes.

**Example**: An orchestrator spawns Agent A to generate an API schema. When A finishes, the orchestrator reads the output file, spawns Agent B with "implement these endpoints based on the schema at `/path/to/schema.json`." The schema file is the pipe.

#### Named Pipes (FIFOs)

**OS**: Like pipes, but with a filesystem name. Any process that knows the name can connect.

**Agent equivalent**: **Convention-based file mailboxes**. Agents agree on a known file path (e.g., `_bmad/agent-mailbox/<agent-name>.md`). Any agent can write to another agent's mailbox. The orchestrator or the receiving agent polls the mailbox.

#### Message Queues

**OS**: Structured messages with types/priorities. Asynchronous. Sender does not block.

**Agent equivalent**: **GitHub Issues as a message queue**. Each issue is a message. Labels provide priority/type. The orchestrator dequeues issues and dispatches them to agents. Agents post results as comments. This is not a metaphor --- it is literally a message queue with persistence, ordering, and type tags.

Alternative: A JSONL file where each line is a message. Agents append messages. The orchestrator reads and processes them. This is the pattern used by `_bmad/agent-activity.jsonl`.

#### Shared Memory

**OS**: Fastest IPC. Multiple processes map the same physical memory page into their address spaces. Requires explicit synchronization (semaphores/mutexes) to avoid corruption.

**Agent equivalent**: **Shared git repository / working directory**. Multiple agents reading and writing to the same files. This is the fastest communication (no serialization, no message passing) but the most dangerous. Without synchronization, agents overwrite each other's changes.

**Critical rule from Part 5**: Use `git worktree` to give each agent its own working copy. This converts shared memory into message-passing (via git merge/PR). The performance cost is worth the safety.

#### Sockets

**OS**: Bidirectional communication, works across machine boundaries. TCP/IP for networked IPC.

**Agent equivalent**: **API calls between agent systems**. An orchestrator on one machine communicating with agents on another via HTTP/WebSocket. Also: MCP server connections, where the agent communicates with external tools via a socket-like protocol.

#### Mapping Summary

| IPC Mechanism | Speed | Complexity | Agent Equivalent | Agent Use Case |
|---|---|---|---|---|
| Pipe | Fast | Low | Sequential file handoff | A -> B task chains |
| Named pipe | Fast | Low | Convention-based mailbox files | Any-to-any async messaging |
| Message queue | Medium | Medium | GitHub Issues / JSONL log | Task dispatch, status reporting |
| Shared memory | Fastest | Highest (needs sync) | Shared git repo / directory | Dangerous; use worktrees instead |
| Socket | Variable | High | API calls, MCP connections | Cross-machine orchestration |
| Signal | Fast | Low | tmux send-keys (interrupt) | Orchestrator telling agent to stop/checkpoint |

---

## 2. Memory Management

> **Deep dive**: See Part 4 (Memory Hierarchy) for the complete treatment. This section provides the OS-theory framing and mapping.

In an OS, memory management solves the problem of multiple processes needing memory from a finite physical resource. The core abstractions:

### 2.1 Virtual Memory and Address Spaces

**OS**: Each process gets a virtual address space that appears contiguous and private. The MMU (Memory Management Unit) translates virtual addresses to physical addresses. Processes cannot access each other's memory without explicit sharing.

**Agent equivalent**: Each agent session has a **virtual context** that appears to be its own private workspace. The harness manages what is actually loaded into the context window (physical memory). The agent does not know or care about the physical layout --- it just sees "my system prompt, my conversation history, my file contents."

### 2.2 Paging and Page Replacement

**OS**: Memory is divided into fixed-size pages. When physical memory is full, the OS uses page replacement algorithms (LRU, FIFO, Clock) to evict pages to disk.

**Agent equivalent**: The context window is divided into segments (system prompt, conversation history, file contents, tool results). When the context window fills up:

- **Compaction** = page replacement. Older conversation turns are summarized (compressed) or evicted entirely.
- **LRU (Least Recently Used)** maps to: summarize the oldest, least-referenced parts of the conversation first.
- **Working set model** maps to: keep the files and context that the agent is actively referencing. Evict files the agent has not mentioned recently.
- **Thrashing** maps to: an agent that keeps needing context it already evicted, spending all its time re-reading files instead of making progress. This happens when the task is too complex for the context window --- the agent equivalent of a process whose working set exceeds physical memory.

### 2.3 Memory Protection

**OS**: The MMU enforces that Process A cannot read or write Process B's memory. Segmentation faults terminate violating processes.

**Agent equivalent**: **Worktree isolation**. Agent A working in `/worktrees/auth-fix` cannot accidentally modify files in Agent B's `/worktrees/ui-refactor`. Git worktrees provide hardware-level memory protection for agents --- separate directory trees that cannot interfere.

Without worktrees (agents sharing a directory), there is no memory protection. One agent's `git checkout` can blow away another agent's uncommitted work. This is the agent equivalent of a segmentation fault, except the OS (harness) does not catch it --- the damage just happens silently.

### 2.4 Segmentation

**OS**: Memory divided into logical segments (code, data, stack, heap) with different access permissions.

**Agent equivalent**: The context window has logical segments:

| OS Segment | Agent Context Segment | Access Pattern |
|---|---|---|
| Code segment (read-only) | System prompt, CLAUDE.md (read-only, set once) | Loaded at start, never modified |
| Data segment (read-write) | Working files, artifacts | Frequently read and modified |
| Stack (grows/shrinks) | Conversation history | Grows with each turn, may be compacted |
| Heap (dynamic allocation) | Tool results, search results | Allocated on demand, freed after use |

---

## 3. File Systems

### 3.1 Files, Directories, and Inodes

**OS**: A file system provides persistent, named, hierarchical storage. Files have content and metadata (inodes: size, permissions, timestamps, block pointers). Directories are just files that map names to inodes.

**Agent equivalent**: The project's file tree IS the agent's file system. But the mapping goes deeper:

| OS Concept | Agent Equivalent |
|---|---|
| File | Source file, config file, document --- any artifact |
| Directory | Project folder structure |
| Inode (metadata) | Git metadata: commit history, blame, diff stats |
| Superblock | `package.json`, `pyproject.toml` --- project-level metadata |
| Mount point | A submodule or linked repository |
| Home directory | The agent's assigned working directory |
| `/tmp` | Scratchpad files the agent creates and discards |
| `/etc` (config) | `.claude/`, `CLAUDE.md`, agent persona files |
| `/var/log` | `_bmad/devlog.md`, `agent-activity.jsonl` |
| `/proc` (virtual) | State files that reflect live agent status |

### 3.2 File Permissions (rwx)

**OS**: Every file has owner, group, and other permissions. Read (r), write (w), execute (x). Root can bypass all permissions.

**Agent equivalent**: **Tool permissions and capability models**.

| Permission | OS Meaning | Agent Meaning |
|---|---|---|
| Read (r) | Can read file contents | Agent can read files (always granted) |
| Write (w) | Can modify file contents | Agent can use Edit/Write tools on files |
| Execute (x) | Can run as program | Agent can execute bash commands, run scripts |
| No permission | Access denied | Tool not available in agent's permission set |
| Root / sudo | Bypass all restrictions | `--dangerously-skip-permissions` flag |
| setuid | Run with owner's permissions | An agent inheriting elevated permissions from the orchestrator |

The Claude Code permission model is directly analogous:

- **Default mode**: Agent must ask permission for each write/execute (like a normal user needing sudo)
- **`--dangerously-skip-permissions`**: Agent has root access. Can write any file, run any command. The orchestrator grants this to workers because it trusts them (they are its children, running in isolated worktrees).
- **Tool allow-lists**: Like `chmod` --- the harness explicitly grants specific tools. An agent with only `Read` and `Search` tools is a read-only process.

### 3.3 Journaling and Crash Recovery

**OS**: Journaling file systems (ext4, NTFS, APFS) write a log (journal) of intended changes BEFORE applying them. If the system crashes mid-write, the journal allows recovery to a consistent state.

**Agent equivalent**: **Git commits as journal entries**. Every meaningful state change should be committed before the agent moves on. If the agent crashes:

1. The orchestrator checks the git log for the agent's branch
2. The last commit represents the last consistent state
3. A new agent can be spawned from that commit, with the commit message serving as the journal entry that explains what was in progress

**Without journaling**: If an agent crashes with uncommitted changes, that work is lost. This is the equivalent of a non-journaling file system losing data in a power failure. The fix is the same: commit early, commit often.

**Write-ahead logging (WAL)**: In databases, the WAL records the intent before the action. Agent equivalent: writing a plan to a file before executing it. If the agent crashes, the recovery agent reads the plan and knows what was supposed to happen.

```
Agent Crash Recovery Protocol (Journaling):

1. Agent writes plan to _bmad/current-task.md        # WAL: record intent
2. Agent makes changes                                # Data write
3. Agent commits with descriptive message              # Journal commit
4. Agent updates state file                            # Metadata update

On crash, recovery reads:
  - _bmad/current-task.md (what was intended)
  - git log (what was actually committed)
  - git diff (what was changed but uncommitted)
  - State file (last known state)
```

### 3.4 File Locking

**OS**: Prevents concurrent processes from corrupting files. Advisory locks (processes cooperate voluntarily) vs. mandatory locks (kernel enforces).

**Agent equivalent**: Preventing two agents from editing the same file simultaneously.

| Lock Type | OS Mechanism | Agent Mechanism |
|---|---|---|
| Advisory lock | `flock()` | Convention: check a lock file before editing |
| Mandatory lock | Kernel-enforced | Git worktrees (physical separation of files) |
| Read lock (shared) | Multiple readers OK | Multiple agents can read the same file |
| Write lock (exclusive) | Only one writer | Only one agent should modify a given file |
| Deadlock from locks | Process A holds file1, wants file2; Process B holds file2, wants file1 | Agent A is editing `auth.ts` and needs `types.ts`; Agent B is editing `types.ts` and needs `auth.ts` |

**The practical solution**: Git worktrees provide mandatory locking by giving each agent its own copy of every file. Conflicts are resolved at merge time (PR review), not at edit time. This is optimistic concurrency control --- assume no conflicts, detect and resolve them later.

---

## 4. I/O Management

### 4.1 Device Drivers = Tool Adapters (MCP Servers)

**OS**: The kernel does not know how to talk to every hardware device. Instead, device drivers provide a standard interface (read, write, ioctl) that the kernel calls. The driver translates these generic calls into device-specific commands.

**Agent equivalent**: The LLM does not know how to talk to every external service. Instead, **MCP (Model Context Protocol) servers** provide a standard interface (tool schemas with name, description, parameters) that the LLM calls. The MCP server translates these generic tool calls into service-specific API calls.

| OS I/O Concept | Agent I/O Equivalent |
|---|---|
| Device driver | MCP server |
| Device file (`/dev/sda`) | Tool name (`browser_navigate`, `github_create_issue`) |
| Driver interface (read/write/ioctl) | Tool schema (name, description, input parameters) |
| Kernel I/O subsystem | Harness tool routing layer |
| Plug-and-play (PnP) | MCP server auto-discovery |
| Driver signing | MCP server trust/verification |
| DMA (Direct Memory Access) | Tools that write directly to agent's working directory |

The MCP-as-device-driver analogy is one of the most precise mappings in this entire document. MCP literally exists to solve the same problem device drivers solve: providing a uniform interface to heterogeneous external resources.

### 4.2 Buffering

**OS**: The kernel buffers I/O to reduce the number of actual device operations. Three types:

- **Single buffering**: One buffer. Device fills it, process reads it.
- **Double buffering**: Two buffers. Device fills one while process reads the other. Overlaps I/O and computation.
- **Circular buffering**: Multiple buffers in a ring. Handles bursty I/O.

**Agent equivalent**: **Batching tool results before feeding them to the agent**.

An agent that needs to read 10 files could either:
1. Make 10 separate tool calls (unbuffered --- 10 round trips, 10 context insertions)
2. Use a single bash command `cat file1 file2 ... file10` (buffered --- 1 round trip, 1 context insertion)

The buffered approach is dramatically more efficient. Each tool call result consumes context window space and incurs latency. Batching reduces both.

**Double buffering in agents**: While the agent is processing the results of one batch of file reads, the harness could pre-fetch the next likely batch. No current harness does this, but it is a clear optimization opportunity --- predict what the agent will need next based on its current task.

### 4.3 Spooling

**OS**: Spooling (Simultaneous Peripheral Operations On-Line) queues I/O operations for serial devices. The classic example: a print spooler queues documents so multiple processes can "print" without conflicting.

**Agent equivalent**: **Queuing tool calls for serial execution**. Some tools cannot handle concurrent access:

- **Browser**: Only one agent should control the browser at a time. A browser spooler would queue navigation requests from multiple agents.
- **Database migrations**: Must execute serially. A migration spooler ensures only one agent runs migrations at a time.
- **Git push**: Only one agent should push to a given branch at a time. A push spooler prevents force-push conflicts.

### 4.4 Interrupt-Driven I/O vs. Polling

**OS**: Two strategies for checking if I/O is complete:

- **Polling (busy-waiting)**: The CPU repeatedly checks the device status register. Simple but wastes CPU cycles.
- **Interrupt-driven**: The device sends an interrupt when I/O is complete. The CPU does other work in the meantime. More efficient but more complex (interrupt handlers, context saving).

**Agent equivalent**: How does the orchestrator know when a worker agent is done?

| I/O Strategy | OS Implementation | Agent Implementation |
|---|---|---|
| **Polling** | CPU reads status register in a loop | Orchestrator runs `tmux capture-pane` on intervals to check agent output |
| **Interrupt-driven** | Device sends hardware interrupt | Agent writes to a known file (e.g., `_bmad/done.flag`) or creates a PR, which triggers a webhook/event |
| **DMA + interrupt** | Device writes directly to memory, then interrupts | Agent commits and pushes to GitHub, which triggers CI, which notifies the orchestrator |

**Current state of the art**: Most agent orchestrators use polling because interrupt-driven architectures require infrastructure (webhooks, event buses) that adds complexity. The orchestrator in this project uses polling (`tmux capture-pane` + `gh pr list` on intervals).

**The efficiency argument for interrupts**: Polling wastes orchestrator context window on repeated "check status" operations. Each poll cycle consumes tokens and context. An interrupt-driven design ("agent writes a signal file when done") would be more efficient but requires the orchestrator to suspend and resume --- which is itself expensive (see Section 1.5 on context switching).

**Hybrid approach**: Poll at increasing intervals (exponential backoff). Check every 30 seconds initially, then every minute, then every 2 minutes. This balances responsiveness with efficiency --- similar to how some OS schedulers use adaptive polling intervals for devices that do not support interrupts.

---

## 5. Security and Protection

### 5.1 User Mode vs. Kernel Mode

**OS**: The CPU operates in (at least) two privilege levels:

- **User mode**: Restricted. Cannot directly access hardware, cannot execute privileged instructions. Must request services from the kernel via system calls.
- **Kernel mode**: Unrestricted. Full access to hardware, memory, and all instructions. Entered only via well-defined entry points (syscalls, interrupts).

**Agent equivalent**:

| Privilege Level | OS | Agent Harness |
|---|---|---|
| **Kernel mode** | OS kernel, device drivers | The harness itself (orchestrator, Claude Code runtime) |
| **User mode** | Application processes | Agent sessions (the LLM running inside the harness) |
| **System call** | `open()`, `read()`, `write()`, `fork()` | Tool calls: `Read`, `Write`, `Bash`, `spawn_agent` |
| **Syscall boundary** | Trap instruction, mode switch | Tool call approval prompt ("Allow this tool call? [y/n]") |
| **Privilege escalation** | `sudo`, setuid bit | `--dangerously-skip-permissions` flag |

The tool call approval prompt is LITERALLY a syscall boundary. The agent (user mode) requests an operation. The harness (kernel) validates the request and decides whether to execute it. In default mode, every write/execute is a permission check. In `--dangerously-skip-permissions` mode, the agent has been granted kernel privileges.

**Protection rings** (Ring 0 through Ring 3 on x86):

| Ring | OS Occupant | Agent Occupant |
|---|---|---|
| Ring 0 (kernel) | OS kernel | Harness runtime + orchestrator |
| Ring 1 (drivers) | Device drivers | MCP servers (trusted tool providers) |
| Ring 2 (privileged) | System services | Supervisor agents, reviewers |
| Ring 3 (user) | Applications | Worker agents |

### 5.2 Access Control Lists (ACLs)

**OS**: Fine-grained permissions beyond simple rwx. Specify which users/groups can perform which operations on which resources.

**Agent equivalent**: **Tool permission models**.

```
# OS ACL example:
file: /etc/shadow
  user:root    rwx
  group:shadow r--
  user:nobody  ---

# Agent ACL equivalent:
tool: Write
  role:orchestrator  DENY     (orchestrator must never write code)
  role:worker        ALLOW    (workers can write)
  role:reviewer      DENY     (reviewers can only read and comment)

tool: Bash(rm -rf)
  role:*            DENY     (nobody should run destructive commands)

tool: Bash(git push --force)
  role:worker       DENY     (workers push via PR, not force-push)
  role:orchestrator ALLOW    (orchestrator can force-push for recovery)
```

Claude Code's `.claude/settings.json` allows/denies specific tools and bash commands --- this IS an ACL system.

### 5.3 Sandboxing

**OS**: Restrict a process to a limited set of resources. Mechanisms: chroot, containers (Docker), VMs, seccomp, AppArmor.

**Agent equivalent**:

| OS Sandbox | Agent Sandbox | Isolation Level |
|---|---|---|
| chroot | Restrict agent to a subdirectory | Weak (can escape with enough cleverness) |
| Container (Docker) | Run agent in a Docker container | Strong (filesystem + network isolation) |
| VM | Run agent in a full virtual machine | Strongest (hardware-level isolation) |
| seccomp (syscall filter) | Tool allow-list (only specific tools available) | Medium (limits capabilities, not environment) |
| Worktree | Git worktree per agent | Medium (file isolation, shared repo) |

**gitagent** (from catalogue): Packages each agent in a Docker container with only the tools it needs. This is container-level sandboxing for agents --- the same security model that revolutionized server deployment applied to agent isolation.

### 5.4 Buffer Overflow = Prompt Injection

This is the most important security mapping in the entire document.

**OS buffer overflow**: A program writes data beyond the boundary of a buffer, overwriting adjacent memory. If the overwritten memory contains a return address, the attacker can redirect execution to arbitrary code. The fundamental flaw: **data and control information share the same memory space**, and the boundary is not enforced.

**Prompt injection**: An agent reads data (a file, a web page, a user message) that contains instructions. The LLM treats the data as instructions and follows them. The fundamental flaw: **data and instructions share the same context window**, and the boundary between them is not enforced.

| Buffer Overflow Concept | Prompt Injection Equivalent |
|---|---|
| Buffer (data area) | Context window segment for data (file contents, tool results) |
| Adjacent memory (return address, function pointers) | Context window segment for instructions (system prompt, tool definitions) |
| Overflow: data overwrites control info | Injection: data contains instructions that override the system prompt |
| NOP sled | Padding/filler text that gets the LLM into a compliant state |
| Shellcode | The injected instruction payload ("ignore previous instructions and...") |
| ASLR (Address Space Layout Randomization) | Randomizing prompt structure so attackers cannot predict where instructions live |
| DEP (Data Execution Prevention) | Marking data segments as non-executable (not yet possible in LLMs) |
| Stack canary | Sentinel tokens between data and instructions (emerging research) |
| Bounds checking | Input sanitization, stripping potential instructions from data |

**Why this analogy matters**: Buffer overflows took 20+ years to mitigate (from the Morris Worm in 1988 to widespread DEP/ASLR adoption in the 2010s). Prompt injection is at the "Morris Worm" stage --- we know it is a problem, mitigations are partial, and no complete solution exists. The OS security community's hard-won lessons apply:

1. **Defense in depth**: No single mitigation is sufficient. Layer them.
2. **Least privilege**: Agents should have the minimum permissions needed. An agent that only needs to read files should not have write access.
3. **Input validation**: Sanitize all external data before including it in the context window.
4. **Separation of concerns**: Keep instructions (system prompt) as far as possible from untrusted data. Some harnesses use separate "system" and "user" message types for this.

---

## 6. Concurrency and Synchronization

### 6.1 Mutexes and Semaphores

**OS**: Synchronization primitives that prevent concurrent access to shared resources.

- **Mutex (mutual exclusion)**: Binary lock. Only one process can hold it. Used to protect critical sections.
- **Semaphore**: Counting lock. Allows N concurrent accessors. Used to limit concurrency (e.g., connection pool of 10).

**Agent equivalent**:

| OS Primitive | Agent Equivalent | Example |
|---|---|---|
| Mutex | File lock / exclusive resource claim | Only one agent can edit `database/schema.prisma` at a time |
| Binary semaphore | Single-slot resource | Only one agent can run the test suite at a time (it uses a shared DB) |
| Counting semaphore (N) | Concurrency limit | Max 6 concurrent agent workers (agent slot pool) |
| Read-write lock | Multiple readers, single writer | Multiple agents can read docs; only one can update them |

**Implementation**: Since agents communicate via files, the simplest mutex is a lock file:

```bash
# Acquire lock (agent checks before editing)
if [ ! -f /tmp/schema.lock ]; then
  echo "worker-auth-fix" > /tmp/schema.lock
  # ... edit schema.prisma ...
  rm /tmp/schema.lock
else
  echo "Resource locked by $(cat /tmp/schema.lock), waiting..."
fi
```

But this has a TOCTOU (Time-Of-Check-Time-Of-Use) race condition --- two agents could check simultaneously, both see no lock, and both proceed. The OS solves this with atomic operations (test-and-set). The agent equivalent: use `mkdir` (which is atomic on most filesystems) instead of file creation:

```bash
# Atomic lock acquisition
if mkdir /tmp/schema.lock 2>/dev/null; then
  echo "worker-auth-fix" > /tmp/schema.lock/owner
  # ... edit schema.prisma ...
  rm -rf /tmp/schema.lock
else
  echo "Locked by $(cat /tmp/schema.lock/owner)"
fi
```

The MAX 6 WORKER LIMIT in the orchestrator is a counting semaphore with value 6. Before spawning a new worker, the orchestrator checks the count. If 6 slots are occupied, the new task is queued (blocked on the semaphore).

### 6.2 Deadlock

Deadlock occurs when processes are permanently blocked, each waiting for a resource held by another. The four **Coffman conditions** (all must hold simultaneously):

| Coffman Condition | OS Example | Agent Example |
|---|---|---|
| **1. Mutual exclusion** | Resource can only be held by one process | Only one agent can edit a given file |
| **2. Hold and wait** | Process holds one resource while waiting for another | Agent A holds the lock on `auth.ts` while waiting for Agent B to finish `types.ts` |
| **3. No preemption** | Resources cannot be forcibly taken from a process | The orchestrator cannot force an agent to release a file mid-edit |
| **4. Circular wait** | A waits for B, B waits for A | Agent A needs Agent B's output; Agent B needs Agent A's output |

**Agent deadlock scenario**:

```
Agent A (auth-service):      Agent B (user-service):
1. Editing auth.ts           1. Editing user.ts
2. Needs types from user.ts  2. Needs types from auth.ts
3. Waits for B to finish     3. Waits for A to finish
   ... DEADLOCK ...              ... DEADLOCK ...
```

**Prevention strategies** (break any one Coffman condition):

1. **Break mutual exclusion**: Use git worktrees so each agent has its own copy. No need for exclusive access. (This is the recommended approach.)
2. **Break hold and wait**: Require agents to declare ALL resources they need upfront. The orchestrator only schedules the agent if all resources are available. (Impractical --- agents discover needs dynamically.)
3. **Break no preemption**: Allow the orchestrator to kill a stuck agent and reassign its resources. (The `/roadblock-recovery` command does this.)
4. **Break circular wait**: Impose a total ordering on resources. Agents must acquire resources in alphabetical order. If Agent A needs `auth.ts` and `user.ts`, it must acquire `auth.ts` first. (Impractical for agents but theoretically sound.)

**Detection and recovery**: The orchestrator can detect deadlock by checking for agents that have been in BLOCKED state for too long with no progress. A timeout-based approach: if an agent makes no commits for 30 minutes, assume deadlock and kill it.

### 6.3 Race Conditions

**OS**: Two processes access shared data concurrently, and the final result depends on the timing of their execution.

**Agent race condition example**:

```
Time    Agent A                     Agent B
----    -------                     -------
t=0     Reads package.json          Reads package.json
        (version: "1.0.0")          (version: "1.0.0")
t=1     Adds dependency X           Adds dependency Y
t=2     Writes package.json         Writes package.json
        (version: "1.0.0" + X)      (version: "1.0.0" + Y)
        
Result: package.json has Y but NOT X. Agent A's change is lost.
```

This is a classic lost-update problem. Git mitigates it at merge time (merge conflicts), but only if agents are on separate branches. If two agents share a branch and working directory, the later write silently wins.

**Solutions (from OS theory)**:

| OS Solution | Agent Solution |
|---|---|
| Critical sections with mutex | File locking (see 6.1) |
| Atomic operations | Single-agent-per-file rule |
| Optimistic concurrency (compare-and-swap) | Git merge with conflict detection |
| Software transactional memory | Git branches as transactions (commit = transaction boundary) |
| Immutable data structures | Append-only files (JSONL logs) |

The git-worktree-per-agent pattern converts race conditions into merge conflicts, which are detectable and resolvable. This is optimistic concurrency control --- the same strategy used by databases and version control systems.

### 6.4 Producer-Consumer Pattern

**OS**: A producer process generates data and places it in a bounded buffer. A consumer process takes data from the buffer and processes it. The buffer must be synchronized: producer blocks if buffer is full, consumer blocks if buffer is empty.

**Agent equivalent**: The **orchestrator-worker pattern** IS producer-consumer.

```
Orchestrator (Producer)              Worker (Consumer)
──────────────────────               ─────────────────
Fetches GitHub issues                Receives task assignment
Adds tasks to the queue              Takes task from queue
Blocks if all 6 slots full           Blocks if no tasks available
Produces task assignments             Consumes tasks, produces PRs

Bounded buffer = 6 agent slots
Buffer full = all slots occupied (orchestrator waits)
Buffer empty = no pending tasks (orchestrator fetches more)
```

The 6-worker limit is literally a bounded buffer. The orchestrator cannot produce more work assignments than there are slots. Workers consume assignments and free slots when done. This is the same producer-consumer synchronization problem that OS textbooks have been teaching for 50 years.

---

## 7. Distributed OS Concepts

### 7.1 Consensus: Paxos, Raft, and Multi-Agent Agreement

**Distributed systems**: When multiple nodes must agree on a value (e.g., which node is the leader, what the current state is), they need a consensus protocol. Paxos and Raft guarantee agreement even if some nodes fail.

**Agent equivalent**: When multiple agents must agree on a design decision, an API schema, or a shared data format, they need a consensus mechanism.

| Consensus Concept | Distributed Systems | Agent Orchestration |
|---|---|---|
| Proposal | Node proposes a value | Agent proposes a design/schema |
| Voting | Nodes vote to accept/reject | Reviewer agents approve/reject PRs |
| Quorum | Majority must agree | Minimum number of reviewer approvals |
| Leader | One node coordinates | Orchestrator is the leader |
| Term/epoch | Leadership period | Orchestrator session (resets on crash) |
| Log replication | Leader replicates state to followers | Orchestrator pushes state to shared files |

**In practice**: Agent orchestration uses a simpler consensus model than Paxos/Raft because there is a clear, permanent leader (the orchestrator). Workers do not vote on what to do --- the orchestrator decides. This is more like a **primary-backup** model than true consensus.

However, in architectures without a central orchestrator (peer-to-peer agent swarms), consensus becomes critical. How do agents agree on task assignment, conflict resolution, or shared state without a coordinator? This is an open research problem.

### 7.2 CAP Theorem

**Distributed systems**: You can have at most two of three properties:

- **Consistency**: Every read returns the most recent write.
- **Availability**: Every request receives a response (not an error).
- **Partition tolerance**: The system continues operating despite network partitions.

**Agent equivalent**: For agent state (task assignments, progress tracking, shared artifacts):

| CAP Property | Agent Meaning | Example |
|---|---|---|
| **Consistency** | All agents see the same state | Every agent sees the same version of `orchestrator-state.json` |
| **Availability** | Agents can always read/write state | No agent is blocked waiting for state access |
| **Partition tolerance** | System works when agents cannot communicate | Agents on separate worktrees continue working even if the orchestrator crashes |

**Current orchestrator design** (CP --- consistent and partition-tolerant, sacrificing availability):

The orchestrator is the single source of truth. State is consistent (one file, one writer). The system tolerates partitions (agents work independently in worktrees). But availability suffers: if the orchestrator crashes, no new tasks are assigned (agents in progress continue, but the system cannot start new work).

**An AP design** (available and partition-tolerant, sacrificing consistency): Each agent maintains its own state and makes autonomous decisions. The system never blocks. But state may be inconsistent: two agents might work on the same issue, or an agent might start work on a task that was already completed.

**The practical tradeoff**: Most orchestrators should be CP. Consistency (no duplicate work, no conflicting changes) is more important than availability (agents can always get new tasks). The orchestrator is a single point of failure, but it is cheap to restart.

### 7.3 Replication

**Distributed systems**: Run multiple copies of a service for fault tolerance. If one replica fails, others continue serving.

**Agent equivalent**: **Running redundant agents for reliability**.

| Replication Strategy | Distributed Systems | Agent Orchestration |
|---|---|---|
| **Active-active** | All replicas process requests | Two agents work on the same task independently; take the better result |
| **Active-passive** | One processes, others wait | Primary agent works; if it fails, a backup agent is spawned |
| **Read replicas** | Replicas serve reads, primary handles writes | Multiple agents can read project state; only the assigned agent writes |

**Active-active replication for agents** ("tournament mode"): Spawn two agents for the same task on separate worktrees. Compare their outputs. Merge the better one. This is expensive (2x compute) but can improve quality for critical tasks. The DeepMind coordination paper suggests this can work if the overhead exponent (1.724) is accounted for.

**Active-passive replication** ("retry on failure"): The standard pattern. Agent crashes? Spawn a replacement. The "replication factor" is the maximum number of retries. Three retries = replication factor of 3.

### 7.4 Leader Election

**Distributed systems**: When the leader fails, remaining nodes must elect a new one. Algorithms: Bully algorithm, Ring algorithm, Raft leader election.

**Agent equivalent**: **Selecting the orchestrator**.

In the current architecture, the orchestrator is statically assigned (the human starts it). There is no election. If the orchestrator crashes, the human restarts it (`/tmux-recovery`).

In a more sophisticated system:

| Election Scenario | Distributed Systems | Agent Orchestration |
|---|---|---|
| Initial leader | First node to start | First agent session started with orchestrator persona |
| Leader failure | Nodes detect via heartbeat timeout | tmux session crash detected; recovery command invoked |
| Election process | Raft: candidate requests votes | Recovery: scan tmux sessions, identify the one with orchestrator state, restart it |
| Split brain | Two leaders simultaneously | Two orchestrator sessions both dispatching tasks --- catastrophic duplication |

**Split brain prevention**: The orchestrator state file (`orchestrator-tmux-state.json`) acts as a lock. Only the process that holds the lock (can write to the file) is the leader. If two orchestrators start, the second detects the lock and refuses to start --- or the human kills the duplicate.

---

## 8. The Grand Mapping Table

Every OS concept, its agent equivalent, and the design implication:

| # | OS Concept | Agent Equivalent | Design Implication |
|---|---|---|---|
| 1 | Process | Agent session | Each agent = isolated execution unit with its own state |
| 2 | Process Control Block | State JSON entry | Track every agent's state for recovery and scheduling |
| 3 | Process states (5-state) | Agent lifecycle states | Model SPAWNING/QUEUED/EXECUTING/BLOCKED/COMPLETED explicitly |
| 4 | fork() | Fork subagent | Child inherits parent context, diverges on subtask |
| 5 | exec() | Load new agent persona | Replace the agent's "program" with a different prompt |
| 6 | Process tree | Agent hierarchy | Orchestrator -> workers -> sub-workers; handle orphans |
| 7 | FIFO scheduling | Issue-order dispatch | Too naive; convoy effect wastes agent slots |
| 8 | SJF scheduling | Complexity-sorted dispatch | Good heuristic; risk of starvation for complex tasks |
| 9 | Round Robin | Time-budgeted agents | Force checkpointing; prevents runaway agents |
| 10 | Priority scheduling | Label-based priority | Essential for production; critical bugs preempt features |
| 11 | MLFQ | Multi-queue with aging | Recommended: 3 queues, demotion on timeout, aging on wait |
| 12 | Context switch | Agent task switch | 10^6x more expensive than CPU; minimize aggressively |
| 13 | Pipe | Sequential file handoff | A produces file, B consumes it |
| 14 | Named pipe | Convention-based mailbox | Known file path for async agent-to-agent messaging |
| 15 | Message queue | GitHub Issues / JSONL | Structured, typed, persistent task dispatch |
| 16 | Shared memory | Shared git repo | Fast but dangerous; use worktrees for isolation |
| 17 | Socket | API/MCP connection | Cross-machine agent communication |
| 18 | Signal | tmux send-keys | Interrupt an agent to checkpoint or stop |
| 19 | Virtual memory | Virtual context window | Agent sees private workspace; harness manages physical allocation |
| 20 | Paging / page replacement | Compaction / context eviction | LRU-like: summarize oldest context first |
| 21 | Thrashing | Context thrashing | Agent repeatedly re-reads evicted files; task too large for window |
| 22 | Memory protection | Worktree isolation | Prevent agents from corrupting each other's state |
| 23 | Segmentation | Context segments | System prompt (code), files (data), history (stack), tool results (heap) |
| 24 | File | Source file / artifact | Direct mapping |
| 25 | Inode | Git metadata | Commit history, blame, timestamps |
| 26 | File permissions (rwx) | Tool permissions (read/write/execute) | Least privilege: agents get minimum needed permissions |
| 27 | Journaling | Git commits | Commit before risky operations; enables crash recovery |
| 28 | File locking | Lock files or worktrees | Prevent concurrent edits; worktrees are mandatory locks |
| 29 | Device driver | MCP server | Standard interface to heterogeneous external resources |
| 30 | Buffering | Tool result batching | Batch reads/operations to reduce context consumption |
| 31 | Spooling | Serial tool queue | Queue access to exclusive resources (browser, DB, git push) |
| 32 | Interrupt vs polling | Event-driven vs poll loop | Polling is simpler; interrupts waste less orchestrator context |
| 33 | User/kernel mode | Agent/harness privilege | Tool calls = syscalls; approval prompt = mode switch boundary |
| 34 | Access Control Lists | Tool permission config | `.claude/settings.json` is literally an ACL |
| 35 | Sandboxing | Docker / worktree isolation | Container-level isolation for untrusted agents |
| 36 | Buffer overflow | Prompt injection | Data/instruction confusion; same fundamental flaw, same defense-in-depth |
| 37 | Mutex | File lock / exclusive claim | Protect critical resources from concurrent access |
| 38 | Counting semaphore | Worker slot limit (N=6) | Limit concurrent agents to prevent resource exhaustion |
| 39 | Deadlock (4 conditions) | Agent deadlock | Worktrees break mutual exclusion; timeouts break no-preemption |
| 40 | Race condition | Concurrent file edits | Git worktrees convert races into merge conflicts (detectable) |
| 41 | Producer-consumer | Orchestrator-worker | Bounded buffer = agent slot pool; orchestrator produces, workers consume |
| 42 | Consensus (Paxos/Raft) | Multi-agent agreement | Not needed with central orchestrator; critical for peer-to-peer |
| 43 | CAP theorem | State consistency tradeoffs | Prefer CP (consistent + partition-tolerant); accept orchestrator as SPOF |
| 44 | Replication | Redundant agents | Active-passive (retry) is standard; active-active for critical tasks |
| 45 | Leader election | Orchestrator selection | Static assignment with lock file; split brain = duplicate work |

---

## 9. Design Implications

### 9.1 The Harness MUST Be an OS

This is not an analogy. It is a requirements specification. If you are building an agent harness, you are building an operating system. Every harness that fails to manage processes, memory, files, I/O, security, concurrency, and distributed state will hit the same failure modes that OS designers solved decades ago.

The question is not WHETHER to implement these subsystems, but HOW WELL.

### 9.2 Where Current Harnesses Are

Mapping current maturity against OS subsystems:

| OS Subsystem | Current Harness Maturity | Gap |
|---|---|---|
| Process management | **Medium**. Basic spawn/kill. No sophisticated scheduling. | Need MLFQ-style scheduling, proper process states |
| Memory management | **Low**. Compaction is crude. No working set model. | Need predictive context management, anti-thrashing |
| File systems | **High**. Git provides journaling, versioning, permissions. | Already strong thanks to git |
| I/O management | **Low**. MCP exists but no buffering, spooling, or interrupt model. | Need tool result batching, resource queuing |
| Security | **Medium**. Permission models exist. No prompt injection defense. | Buffer overflow era: mitigations are partial |
| Concurrency | **Low-Medium**. Worktrees help. No formal synchronization. | Need explicit lock protocols, deadlock detection |
| Distributed | **Low**. Single orchestrator, no consensus, no replication. | Acceptable for now; needed for multi-machine scaling |

### 9.3 The Three Rules

From the 45 mappings above, three rules emerge:

**Rule 1: Isolate by default, share by choice.** The OS learned this with virtual memory, protected address spaces, and the principle of least privilege. Agents should get worktrees (separate address spaces) by default. Shared state should be explicit and synchronized.

**Rule 2: Every state transition must be logged.** Journaling, write-ahead logging, and process accounting all exist because crashes happen. Agent state transitions (spawned, running, blocked, completed, failed) must be recorded to a persistent log. Without this, crash recovery is guesswork.

**Rule 3: Context switches are the enemy.** The OS minimizes context switches because they are overhead. Agent context switches are a million times more expensive relative to useful work. Design for long-running, uninterrupted agent sessions. When a switch is unavoidable, make the state save as high-fidelity as possible (detailed commit messages, explicit handoff documents).

### 9.4 What to Build Next

Based on the gap analysis in 9.2, the highest-value improvements for agent harnesses:

1. **MLFQ scheduler** for the orchestrator (Section 1.4). Multiple priority queues with aging. This is immediately implementable and would dramatically improve task throughput.

2. **Deadlock detection** (Section 6.2). A simple timeout-based detector: if an agent makes no commits for N minutes, kill it and re-queue the task. This catches 90% of deadlocks.

3. **Tool result buffering** (Section 4.2). Batch file reads and tool calls to reduce context consumption. A single `cat file1 file2 file3` instead of three separate Read calls.

4. **Explicit process states** (Section 1.2). Model the 5-state lifecycle in the state JSON. Enable the orchestrator to query "which agents are BLOCKED?" and take action.

5. **Prompt injection defense** (Section 5.4). Input sanitization for all external data. Separate system/instruction context from data context. Defense in depth.

---

## Series Navigation

| Part | Title | Focus |
|---|---|---|
| [Part 1](./01-von-neumann-agents.md) | Von Neumann Architecture | Agent anatomy (CPU/memory/I-O split) |
| [Part 2](./02-instruction-cycle-agents.md) | The Instruction Cycle | Fetch-decode-execute for agents |
| [Part 3](./03-pipelining-agents.md) | Pipelining and Parallelism | Throughput optimization |
| [Part 4](./04-memory-hierarchy-agents.md) | Memory Hierarchy | Context window as memory system |
| [Part 5](./05-multiprocessor-agents.md) | Multiprocessor Architectures | Scaling agent teams |
| [Part 6](./06-reliability-agents.md) | Reliability and Fault Tolerance | Error detection and recovery |
| **Part 7** | **OS Theory for Agent Harnesses** | **This document** |

---

*The agent harness is the operating system. The context window is RAM. Tool calls are syscalls. Git is the file system. Worktrees are virtual address spaces. The orchestrator is the scheduler. Prompt injection is buffer overflow. These are not metaphors. They are the same problems, discovered independently, demanding the same solutions.*
