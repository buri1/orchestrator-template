---
title: "Distributed Systems Primitives for Multi-Agent Harnesses"
date: 2026-04-12
topic: harness-architecture
angle: distributed-systems
relevance: high
---

# Distributed Systems Primitives for Multi-Agent Harnesses

> **Thesis.** A multi-agent LLM harness is a distributed system. Not "like" one, not "metaphorically" one — structurally. It has independent processes (agents) with private state (context windows), partial failures (tool crashes, rate limits, non-determinism), asynchronous communication (tool outputs, file handoffs), and no perfect global clock (tokens stream from different model servers with independent latencies). Fifty years of distributed systems research produced a canon of primitives for exactly this regime. Most of that canon applies directly — some of it trivially, some of it with translation, and a small amount of it catastrophically ("let's implement Paxos for agent consensus"). This document catalogues the primitives that matter, points at the theory precisely, and rates which ones a builder should actually reach for.

> **Companion work.** Part 7 of the *Computer Architecture for Agents* series (`07-os-theory-for-agents.md`) already sketches CAP/Paxos/replication at the OS-theory level. This document goes deeper into the *distributed* half: it covers the primitives that live beyond a single machine's OS — CRDTs, event sourcing, actor model, vector clocks, sagas, gossip, failure detection, idempotency, backpressure, distributed tracing — and tries to earn its conclusions rather than assert them.

> **Editorial stance.** Burak's instruction stands: simplicity first. The temptation to ship a Raft implementation for a five-agent tmux fleet is real and it is wrong. Throughout this piece I mark each primitive with a relevance verdict — **adopt**, **translate**, **watch**, or **avoid** — against today's harness scale (2–6 agents, one machine, one human). Most fall into "translate" or "watch". Two fall into "adopt now": **event sourcing** and **idempotent tool calls**. One falls into "avoid": **true consensus protocols**.

---

## 1. CAP theorem (Brewer 2000; Gilbert & Lynch 2002)

### 1.1 The theory, precisely

Eric Brewer's conjecture at PODC 2000 — later proven by Seth Gilbert and Nancy Lynch ("Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services," *ACM SIGACT News* 33(2), 2002) — states that any shared-data system providing **Consistency** (every read reflects the most recent write), **Availability** (every non-failing node returns a response), and **Partition tolerance** (the system continues operating when messages between nodes are arbitrarily delayed or dropped) can simultaneously guarantee at most two of the three. Because real networks partition, the real choice is between CP and AP. Brewer's 2012 retrospective in *IEEE Computer* ("CAP Twelve Years Later: How the 'Rules' Have Changed") softened the framing: partitions are rare, so systems should optimize *during* a partition and reconcile *after*, rather than picking a single mode for all time.

The deeper version is **PACELC** (Daniel Abadi, 2012): *if Partitioned, choose between Availability and Consistency; else, choose between Latency and Consistency*. This matters for agents because the "else" branch is where most harness engineering actually lives — no partition, but a real tradeoff between fast eventual reads and expensive strongly-consistent reads.

### 1.2 The multi-agent analog

Map the three properties onto a harness state-store (task assignments, in-progress issues, file locks, memory files):

| CAP property | Agent meaning | Failure signature when violated |
|---|---|---|
| Consistency | Every agent sees the same task assignments, same memory, same file tree | Two agents start the same issue; one clobbers the other's edits |
| Availability | An agent can always read state and make progress | Worker blocks forever waiting for the orchestrator's lock |
| Partition tolerance | Agents keep working when the orchestrator is unreachable | Orchestrator crash wedges all workers |

The instructive observation from the question prompt is correct: **Anthropic's Worktree subagent model is effectively AP**. Each agent owns a private git worktree. There is no cross-agent consistency guarantee while agents are running — two agents can make conflicting claims about the same abstraction. Consistency is reconstructed *after the partition heals*, by git's three-way merge. Git itself, famously, is an AP system (Linus Torvalds, LinuxConf.au 2007: "Git does not really have a consistent view of the world. Every clone is its own universe.").

The **Fork** subagent model is different: it's effectively a *snapshot* — strong consistency at the moment of the fork, then divergence. Once forked, the parent and child share nothing.

The **Teammate** model (file-based mailbox, shared repo) is the dangerous one: it pretends to be CP (single shared file tree) but under concurrent writes it silently degenerates to AP with no reconciliation logic. This is where most multi-agent harnesses quietly lose work.

### 1.3 Current framework usage

- **Claude Code (Worktree)**: AP by construction. Resolution is deferred to git merge. Works because git is a battle-tested reconciliation engine.
- **LangGraph**: CP for the state graph (checkpointer is a single authoritative store). Acquires a Postgres or SQLite lock per super-step.
- **OpenAI Agents SDK (Sessions)**: CP via a single-writer SQLite/Redis session store. No partition tolerance: if the session backend goes down, the agent hangs.
- **AutoGen group chat**: Effectively CP via the chat-history-as-oracle pattern — one linear log, one writer at a time.
- **pi-orchestrator / tmux mode**: CP, with the orchestrator as the single writer to `orchestrator-tmux-state.json`. Loses availability when the orchestrator crashes (exactly the tradeoff the 2012 Brewer paper flags).

### 1.4 Verdict: **translate**

Practitioners should *name* their CAP choice. Stop pretending a shared JSONL is consistent. Concretely: if the design is "one writer, many readers" make that explicit and fail loud on second writers. If the design is "many writers, reconcile later" adopt the AP toolkit (CRDTs, git, event logs) rather than hoping for the best.

---

## 2. Consensus protocols: Paxos, Raft, Byzantine fault tolerance

### 2.1 The theory, precisely

- **Paxos** (Leslie Lamport, "The Part-Time Parliament," TOCS 1998; "Paxos Made Simple," 2001). Solves the consensus problem: a group of processes must agree on a single value even when some of them fail by crashing. Paxos has two roles (proposer, acceptor, and optionally learner) and guarantees safety (agreement, validity) but not liveness (FLP impossibility: Fischer, Lynch, Paterson 1985 prove no deterministic asynchronous consensus protocol can guarantee termination).
- **Raft** (Diego Ongaro & John Ousterhout, "In Search of an Understandable Consensus Algorithm," USENIX ATC 2014). Same safety guarantees, different decomposition: leader election, log replication, safety. Designed to be understandable; implementations exist in etcd, Consul, CockroachDB, TiKV.
- **Byzantine fault tolerance** (Lamport, Shostak, Pease, "The Byzantine Generals Problem," TOPLAS 1982; Castro & Liskov, "Practical Byzantine Fault Tolerance," OSDI 1999). Handles arbitrary (not just crash) failures. Requires 3f+1 nodes to tolerate f Byzantine faults.

The crucial constraint, stated plainly: consensus is expensive. Raft leader election in a healthy cluster takes one round-trip; a log append takes one round-trip to a majority. These costs are *sane* when a round-trip is 1 ms within a data center. They are *insane* when a "message" is a 30-second LLM inference.

### 2.2 The multi-agent analog

The question to actually answer is: *when do multiple agents need to agree on a single value*? Almost never in practice. The useful cases are:

1. **Which agent owns a task** — solved trivially by a single-writer queue (GitHub Issues, a JSONL work queue). This is not consensus; it is a distributed *lock*, which is strictly weaker.
2. **Which version of an artifact wins** — solved by git. Git uses content-addressing, not consensus.
3. **Which answer is "correct" when multiple agents disagree** — this is *not* consensus. It is **aggregation**. Consensus protocols require the nodes to have symmetric authority over the value; the LLM-as-judge pattern has an asymmetric judge.

The "LLM-as-judge as implicit consensus" framing from the prompt is appealing but wrong in the precise sense: LLM-as-judge is a **Byzantine-agreement-free** aggregator. It sidesteps consensus entirely by declaring one node (the judge) authoritative. That's primary-backup, not Paxos.

When might true Raft-like election matter? In a peer-to-peer agent swarm with no human orchestrator — e.g., a long-lived fleet where any member might need to become the coordinator because the old coordinator drifted or crashed. That's a real use case at the scale of AutoGPT-style 100-agent mesh, not at the scale of a 6-worker tmux fleet.

### 2.3 Current framework usage

- **None of the mainstream harnesses implement consensus**. What looks like consensus is almost always primary-backup (orchestrator is the primary) or leader-with-lease (one agent holds a file lock).
- **gascity's controller lock pattern** (see `research/catalogue/agent-harnesses/gascity.md`) is a *mutex* implementation — single-instance enforcement via a lock file. Calling it "consensus" would be a category error.
- **LangGraph supervisors**: primary-backup. The supervisor decides.
- **CrewAI hierarchical mode**: primary-backup with a manager agent.

### 2.4 Verdict: **avoid**

For today's harness scale, implementing Raft is a tarpit. The right primitives are: (1) a single-writer state file with an advisory lock (`flock(2)` is 50 years old and sufficient), (2) a distributed lock manager if you later need multi-machine (Postgres advisory locks or Redis Redlock — which Martin Kleppmann famously criticized, so use Postgres). If you genuinely need peer-to-peer consensus, first ask why you don't have a coordinator; the answer is usually "I can have one and should."

---

## 3. Two-phase commit vs the Saga pattern

### 3.1 The theory, precisely

- **Two-phase commit (2PC)** (Jim Gray, "Notes on Data Base Operating Systems," IBM RJ2188, 1978). A coordinator asks all participants to *prepare*; if all vote yes, coordinator sends *commit*; otherwise *abort*. Guarantees atomicity across multiple data stores. Fatal flaw: *blocking protocol*. If the coordinator fails after prepare but before commit, participants are stuck holding locks until the coordinator recovers. 3PC adds a pre-commit phase to reduce blocking but doesn't eliminate it under network partitions (Skeen & Stonebraker, 1983).
- **Saga pattern** (Héctor Garcia-Molina & Kenneth Salem, "Sagas," SIGMOD 1987). A long-running transaction decomposed into a sequence of local transactions T₁, T₂, ..., Tₙ, each with a compensating transaction C₁, C₂, ..., Cₙ. If Tₖ fails, run Cₖ₋₁, Cₖ₋₂, ..., C₁ to undo prior steps. Eventually consistent, non-blocking, but requires that compensations actually undo the effect — a hard requirement for real-world side effects.

The tradeoff is classic: 2PC gives atomicity at the cost of liveness; sagas give liveness at the cost of atomicity *and* require domain-specific compensation logic.

### 3.2 The multi-agent analog

A multi-agent task is almost always a saga. Consider a typical flow:

1. Agent A scaffolds a new React component (file writes)
2. Agent B wires it to the Supabase schema (DB migration)
3. Agent C adds tests (more file writes)
4. Agent D opens a PR (GitHub API call)

If step 3 discovers step 2's schema is wrong, what happens? In current harnesses: nothing principled. The agents either push forward with broken state, or a human intervenes. In saga terms: there are *no compensations defined*. The schema migration can be rolled back by a reverse migration, but no one wrote one.

The right model is: every agent-executed step should declare its compensating action as explicitly as the forward action. Git makes this free for file writes (`git revert`). Database migrations need reverse migrations. API calls need explicit undo paths (`DELETE` against the PR, `POST /refund` against the payment). Deployments need rollback.

The 2PC analog is even rarer in agent systems: you would need a "prepare" phase where all participants promise to commit a multi-step operation, then a coordinator vote. The closest anything comes is LangGraph's **checkpoint** mechanism — the state graph persists a consistent snapshot at super-step boundaries, which functions as a *savepoint* more than a 2PC commit.

### 3.3 Current framework usage

- **LangGraph**: Has checkpointers (MemorySaver, PostgresSaver, SqliteSaver) that snapshot state between super-steps. Enables resume and time-travel debugging. Functions as savepoint semantics, not 2PC.
- **Temporal** (used by some agent frameworks as a workflow backbone): Durable workflow engine with *activities* and *workflows*. Natively implements saga-like compensation via try/catch and compensation handlers. This is the most mature "saga for agents" substrate available off the shelf.
- **OpenAI Agents SDK**: No built-in saga support. Handoffs are one-way; there is no "unwind the handoff" primitive.
- **Claude Code**: No saga support. Git provides file-level compensation for free, but non-file side effects (API calls, DB writes) have no compensation framework.

### 3.4 Verdict: **translate**

Don't build 2PC. Do build saga semantics — *but only as deeply as your side effects demand*. For a harness that mostly edits files and runs tests, git is already your saga log. For a harness that talks to Stripe, ship, or a database, explicit compensations are mandatory. The heuristic: for every tool, ask "if this tool ran but the overall task failed, what's the undo?" If the answer is "nothing" or "the user will notice," you don't have a production harness.

---

## 4. Event sourcing and CQRS

### 4.1 The theory, precisely

- **Event sourcing** (Greg Young, 2006; Martin Fowler, "Event Sourcing," martinfowler.com 2005). Persist every state-changing event as an immutable append-only log. Current state is a fold over the event history: `state = events.reduce(apply, initial)`. Enables (a) time-travel to any past state, (b) rebuilding projections after bug fixes, (c) cheap audit.
- **CQRS — Command Query Responsibility Segregation** (Greg Young, 2010, building on Bertrand Meyer's command-query separation). Separate the write model (commands) from the read model (queries). Reads are served from precomputed projections optimized for their access pattern; writes append to the event log.

Event sourcing's hidden virtue is that **it aligns perfectly with append-only substrates** — filesystems, S3, Kafka, journaled databases. The hidden cost is projection maintenance: bugs in a projection mean rebuilding it from the event log, which must be replayable.

### 4.2 The multi-agent analog

Multi-agent systems produce events as their natural output: *agent spawned, tool called, tool returned, PR opened, review completed, E2E passed, task marked done*. These events form a natural timeline. The current state ("which agents are running, which issues are in flight") is a projection over the event log.

This is the one primitive from the distributed systems canon that is **outright correct** for multi-agent harnesses. The reasons:

1. **Events are naturally append-only.** Tool outputs can't be un-produced. LLM outputs are write-once. Commit hashes are immutable.
2. **Projections are cheap to rebuild.** If the state file gets corrupted (as happens after a crash), rebuilding it from an event log is a 5-line reduce.
3. **Time-travel debugging is the default mode for agent work.** "What did the agent see at the moment it made this wrong decision?" is answered directly by replaying the event log up to that point.
4. **Multi-writer events are safe.** Two agents appending to a JSONL file via `O_APPEND` are race-free on POSIX. You cannot say that about arbitrary shared state.
5. **The analytics use case comes for free.** Once you have an event log, telemetry, devlogs, and billing all become projections.

### 4.3 Current framework usage

- **pi-orchestrator**: JSONL telemetry at `pi-orchestrator/_bmad/telemetry/YYYY-MM-DD.jsonl`. Append-only. This is proto-event-sourcing and should be named as such.
- **gascity**: OpenTelemetry traces form an event log, but the "state" (current agent assignments) is *not* a projection over the trace log — it lives in a separate store. This is the usual anti-pattern: events and state coexist but are not linked by a reduce.
- **LangGraph checkpoints**: Closer to snapshot-based persistence than event sourcing. Each checkpoint is a full state dump, not an event delta. Replaying does work, but storage scales with state size rather than event count.
- **Claude Code**: Git commits *are* an event log. The "state" is "the current working tree," which is a projection (the HEAD commit is the fold). This is why Claude Code recovers so gracefully from crashes — git gave it event sourcing for free.
- **Temporal**: Explicit event-sourced history. Every workflow is replayable from its event log, which is what makes durable workflows possible.

### 4.4 Verdict: **adopt now**

This is the single highest-value distributed systems primitive for multi-agent harnesses, and it's already partially present in most serious systems. The concrete prescription:

1. **One JSONL file per day per agent fleet.** Append-only, `O_APPEND`, one JSON object per line.
2. **Every state transition is an event.** No silent updates. No "orchestrator quietly rewrote the state."
3. **The state file is a projection.** It can be deleted and regenerated from the event log at any time. Build the regenerator on day one — treat it as a smoke test.
4. **Queries hit the projection, not the log.** If you need a different view (which agents touched file X?), build a second projection. Don't query the log directly for interactive use.

This is simple. It's also the cleanest way to make a harness debuggable across crashes.

---

## 5. The actor model (Hewitt 1973; Erlang/OTP)

### 5.1 The theory, precisely

Carl Hewitt, Peter Bishop, and Richard Steiger ("A Universal Modular Actor Formalism for Artificial Intelligence," IJCAI 1973 — note the "AI" in the title; the connection to multi-agent is original, not retrofit) defined an **actor** as a computational entity that, in response to a message it receives, can concurrently (a) send messages to other actors, (b) create new actors, (c) designate the behavior to use for the next message. Crucially: no shared state, pure message passing, asynchronous delivery. The name "actor" comes from the acting metaphor — actors have *addresses* and *mailboxes*, messages are *scripts*, and behaviors are *roles*.

Joe Armstrong and Robert Virding formalized this into an industrial system with Erlang (1986) and OTP (Open Telecom Platform, 1998). Armstrong's 2003 PhD thesis — "Making reliable distributed systems in the presence of software errors" — is the *only* thesis I'd recommend reading cover-to-cover to a harness builder. Its core moves:

1. **"Let it crash."** Don't try to handle every error path in the actor itself. Let failures propagate to a supervisor, which restarts the actor to a known-good state.
2. **Supervision trees.** Actors are organized hierarchically; each supervisor defines a restart strategy (`one_for_one`, `one_for_all`, `rest_for_one`) and a restart intensity (max N crashes in T seconds before the supervisor itself fails upward).
3. **Isolation by construction.** Each actor has its own heap. No actor can corrupt another's memory. Garbage collection is per-actor, so GC pauses don't stall the system.
4. **OTP behaviors.** `gen_server` (request-reply), `gen_statem` (state machine), `gen_event` (event manager), `supervisor` (restart strategies). These are the "design patterns" of the actor model, codified into reusable skeletons.

### 5.2 The multi-agent analog

The fit is almost embarrassing. Every property Armstrong listed as necessary for reliable distributed systems maps 1:1 onto multi-agent LLM harnesses:

| Erlang/OTP property | Multi-agent analog |
|---|---|
| Processes are cheap (millions per node) | Agents are expensive, but the *primitive* is still "isolated message-handling unit" |
| Asynchronous message passing via mailboxes | Tool outputs, inter-agent messages, file handoffs |
| No shared mutable state | Each agent's context window is private |
| Let it crash | LLM returned garbage? Throw it away, restart with fresh context. This is already how we survive hallucinations. |
| Supervisor trees | The orchestrator-worker hierarchy — *already a supervision tree, informally* |
| Restart strategies | "Retry 3 times" (rest_for_one), "if the orchestrator crashes, restart everything" (one_for_all) |
| Hot code reload | Updating prompts without restarting the agent fleet |

The "let it crash" philosophy is especially apt. LLMs are non-deterministic, so every agent has a non-zero probability of producing garbage. Trying to handle every failure mode in-agent is the wrong shape; the right shape is: *fail loudly, let the supervisor restart to a known state, and record the failure in the event log for later analysis*. This is precisely what Claude Code's review-fix loop does, modulo the formalism.

OTP's `gen_server` maps onto a long-lived agent that handles requests. `gen_statem` maps onto an agent with an explicit state machine (SPAWNING → WORKING → REVIEWING → DONE). `supervisor` maps onto the orchestrator.

### 5.3 Why hasn't anyone built an Erlang-native multi-agent harness?

The prompt's question deserves a real answer. Three reasons:

1. **Talent pool.** Erlang is a niche language. The Python/TypeScript agent-dev ecosystem is where the LLM tooling lives. Elixir (Erlang on the BEAM with a Ruby-flavored syntax) has softened this, but the talent gap remains.
2. **LLM SDKs aren't BEAM-native.** Calling the Anthropic API from Elixir means going through HTTPoison or Finch — fine, but not ergonomic. The first-party SDKs are Python and TypeScript.
3. **Model costs dominate.** Erlang's killer feature is cheap processes (millions of actors on one node). When each "actor" costs $0.30 per run, the cheap-process advantage disappears. You're not running a million agents; you're running six. The supervision tree value remains, but the scale-out value evaporates.

That said: **`libcluster` + `:pg` (process groups) + `Horde` (distributed supervisor) on Elixir would be the cleanest substrate for a multi-machine agent harness**. It's the sweet spot where the BEAM primitives genuinely beat ad-hoc tmux scripting. If an agent harness ever needs to span three machines with live rebalancing, Elixir is the path of least pain. At single-machine scale, it's overkill.

### 5.4 Current framework usage

- **None of the mainstream harnesses are BEAM-based.** This is a genuine market gap.
- **Cognition's Devin architecture** (inferred from public posts) resembles a supervision tree conceptually but is implemented in Python.
- **Ray** (Anyscale) is the closest thing to an actor-model runtime used for agents at scale. It's Python-native, used by parts of the RL-training stack, and has a "Ray actors" primitive that is literally the Hewitt actor model. LangChain has experimented with Ray for parallel agents.
- **Akka** (JVM actor framework, Jonas Bonér et al.) is production-grade and could host agent workloads, but the JVM penalty on startup and the LLM SDK ergonomics push it out of the race.

### 5.5 Verdict: **translate now, adopt later**

Don't rewrite your harness in Elixir tomorrow. Do steal the *three load-bearing ideas* today:

1. **Supervision trees.** Make the orchestrator→worker hierarchy explicit. Declare restart strategies per worker type. Record restart counts. This is the single cheapest reliability upgrade.
2. **Let it crash.** Stop trying to recover agents in-place. If an agent is wedged, kill it and restart with fresh context. The pi-orchestrator `/roadblock-recovery` command is already moving this direction — formalize it.
3. **Typed mailboxes.** Inter-agent messages should have schemas. `gen_statem`-style state machines should describe agent lifecycles.

---

## 6. CSP — Communicating Sequential Processes (Hoare 1978)

Tony Hoare's 1978 CACM paper "Communicating Sequential Processes" proposed synchronous channels as an alternative to shared memory: processes do not share state, they synchronize on channel sends and receives. CSP influenced Occam (transputers), Go's goroutines and channels, Rust's Tokio channels, and the Clojure `core.async` library.

CSP differs from the actor model in two ways: (1) channels are first-class, actors are not — in Hoare's CSP you send on a channel, not to a named actor; (2) synchronization is blocking by default (rendezvous), not asynchronous mailboxes.

**Multi-agent analog.** Typed channels between agents express dataflow cleanly. A "research agent" writes to a `findings` channel; a "synthesizer" reads from it. The schema of the channel makes the contract explicit. Compared to file-based mailboxes or shared-repo handoffs, channels force the designer to name the dataflow.

**Current usage.** LangGraph's typed state graphs are close to CSP: edges between nodes are effectively typed channels. Ray's object store is more actor-flavored. Go-based harnesses (gascity, MetaGPT's Go port) naturally use channels for inter-agent messaging.

**Verdict: translate.** When designing inter-agent communication, ask "what is the type of this channel?" even if the channel is implemented as a JSONL file. The act of naming forces better factoring.

---

## 7. Gossip protocols and eventual consistency

### 7.1 The theory

Gossip protocols (also "epidemic protocols") propagate information by having each node periodically exchange state with a random peer. Originally described by Demers et al., "Epidemic Algorithms for Replicated Database Maintenance" (PODC 1987), and popularized by Amazon's Dynamo (DeCandia et al., SOSP 2007) and Cassandra. Convergence time is O(log N) in the number of nodes. Gossip is the canonical substrate for AP systems at scale.

SWIM (Scalable Weakly-consistent Infection-style Process Group Membership; Das, Gupta, Motivala, DSN 2002) uses gossip for failure detection at web scale — used by Hashicorp Serf, Consul, and Uber's Ringpop.

### 7.2 The multi-agent analog

When is gossip useful for agents? Only in the specific regime where:

- There are many agents (dozens+)
- They are exploring different subareas of a shared problem space
- They need to share findings but don't need strong consistency
- Centralized coordination would be a bottleneck

Research-style multi-agent systems (e.g., "swarm of agents exploring a codebase") fit this profile. Each agent publishes findings ("this file calls an unknown function foo()"); other agents periodically pull the peer's findings. Convergence is eventual.

For a 6-agent tmux fleet with a central orchestrator, gossip is overkill. The orchestrator *is* the communication backbone.

### 7.3 Current framework usage

None of the mainstream harnesses implement gossip. The closest analog is the *shared scratchpad* pattern (a file everyone reads and writes), which is technically simpler but has none of the anti-entropy guarantees.

### 7.4 Verdict: **watch**

Not useful today. Becomes interesting at 50+ agent scale or in peer-to-peer architectures.

---

## 8. Vector clocks and Lamport timestamps

### 8.1 The theory

- **Lamport timestamps** (Leslie Lamport, "Time, Clocks, and the Ordering of Events in a Distributed System," CACM 1978). A scalar counter incremented on each local event; on receiving a message, take max(local, received) + 1. Provides a *total* order consistent with causality but does not distinguish concurrent events.
- **Vector clocks** (Colin Fidge, 1988; Friedemann Mattern, 1989). Each process maintains an N-dimensional vector (one slot per process); increments its own slot on local events; on receive, takes pairwise max and increments its own slot. Two events are concurrent iff neither vector dominates the other. Enables *partial* order reflecting actual causality.

### 8.2 The multi-agent analog

The problem vector clocks solve — "which event happened before which, without a global clock" — is exactly the problem of interleaving tool calls and observations from multiple agents into a single coherent log.

Consider: Agent A reads file X at time T1 (wall clock). Agent B writes file X at time T2. Did A see B's write? Wall clocks can be off by seconds (and LLM inference adds 30-second delays), so wall-clock comparison is unreliable. A vector clock gives the definitive answer: if A's read happened before B's write in the causal order, A saw the old version.

For multi-agent harnesses on a single machine, monotonic clocks (`CLOCK_MONOTONIC`) and file system timestamps are usually adequate. Vector clocks become necessary only when agents run on different machines with independent clocks *and* causal order matters for correctness.

### 8.3 Current framework usage

- **None of the mainstream harnesses use vector clocks.**
- **Git commits form a DAG** that implicitly carries causal order — this is vector-clock-equivalent for file-level events. If you need "what did this agent know when it made this commit," git blame + git log --graph is the answer.
- **Event logs with monotonic sequence numbers** (one per writer) are the usual simplification — sufficient when there's one writer per stream.

### 8.4 Verdict: **watch**

Not needed today. File-system timestamps and git commits cover the common cases. If you build a multi-machine harness, reach for vector clocks (or hybrid logical clocks — Kulkarni et al. 2014 — which are the modern replacement).

---

## 9. Sharding and partitioning

### 9.1 The theory

- **Consistent hashing** (Karger et al., "Consistent Hashing and Random Trees," STOC 1997; Amazon Dynamo, SOSP 2007). Assign keys to nodes such that adding/removing a node only moves 1/N of the keys. Forms the substrate for Dynamo, Cassandra, Riak, memcached clusters.
- **Range partitioning** (Google Bigtable, Spanner). Keys are split into contiguous ranges; each range owned by one node. Enables range scans; rebalancing is harder.

### 9.2 The multi-agent analog

The load in a multi-agent harness isn't keys, it's *tasks*. Sharding becomes "how to divide the task space among agents." The shard key is the interesting question:

- **By tool**: one agent does file edits, another does shell execution. Bad — tools are not independent; edits and tests are tightly coupled.
- **By subtask**: one agent per GitHub issue. Good — issues are the natural unit of work. This is what every production orchestrator does.
- **By file**: one agent per subdirectory. Bad — forces artificial boundaries; cross-directory refactors become multi-agent handoffs.
- **By role**: researcher, coder, reviewer. Good for pipelined tasks, bad for bursty parallel work.

The orchestrator's job-assignment logic is already sharding by subtask. Making this explicit (and recording the sharding function in the event log) makes rebalancing possible.

### 9.3 Verdict: **translate**

Name your shard key. Pick "by subtask" unless you have a specific reason otherwise. Don't shard by file — it creates merge hell.

---

## 10. Replication strategies

### 10.1 The theory

- **Primary-backup** (Budhiraja, Marzullo, Schneider, Toueg, *Distributed Systems* 1993 chapter). One primary handles writes; backups take over on failure.
- **Multi-master**: multiple writers, conflicts resolved post-hoc. MySQL Galera, CouchDB.
- **Chain replication** (van Renesse & Schneider, OSDI 2004). Writes go through a chain of replicas, reads from the tail. Strong consistency with simple recovery.

### 10.2 The multi-agent analog

Replication of agents = running N agents on the same task. Three real modes:

1. **Active-active ("tournament")**: run 3 agents on the same task, take the majority vote or the best output. Useful for high-stakes, verifiable tasks (math problems, code with strong tests). Expensive. Corresponds to the *self-consistency* decoding strategy (Wang et al. 2022, "Self-Consistency Improves Chain of Thought Reasoning") at the agent level.
2. **Active-passive ("retry on failure")**: spawn a backup only if the primary fails. Standard pattern in every orchestrator.
3. **Shadow / canary**: run a new agent version alongside the stable one; compare outputs silently; promote if the new one matches or outperforms.

### 10.3 Verdict: **translate**

Tournament mode is genuinely useful for critical paths. Use it sparingly — the DeepMind coordination exponent (1.724 per Burak's memory) says multi-agent overhead scales super-linearly, so 3 agents is rarely 3x better. For reliability-critical work (security-sensitive refactors, migrations), the cost is worth it.

---

## 11. Failure detection

### 11.1 The theory

- **Heartbeat / timeout** — the crudest approach. Set a timer; if no heartbeat in T, declare dead. Suffers from the tradeoff between false positives (short timeout → dead under load spike) and slow detection (long timeout → takeover is slow).
- **Phi accrual failure detector** (Hayashibara et al., "The φ Accrual Failure Detector," SRDS 2004). Instead of a binary dead/alive, output a continuous *suspicion level* φ based on the distribution of past heartbeat intervals. Adapts to network conditions. Used in Cassandra, Akka.
- **SWIM** (Das et al., DSN 2002, cited above). Gossip-based, spreads membership information while piggybacking on application messages.

### 11.2 The multi-agent analog

An agent is "stuck" if it has stopped making forward progress. Forward progress signals include:

- Tool calls being issued
- Commits being made
- Token stream not being silent for N seconds
- Output file being updated

The pi-orchestrator's current approach — polling `tmux capture-pane` for pane content changes — is a crude heartbeat. It works for single-machine fleets; it doesn't distinguish "thinking hard" from "wedged on a rate limit" from "generated a hallucination and is now in a degenerate loop."

A phi-accrual-flavored approach would learn the distribution of inter-activity gaps for each agent type and flag anomalies. The precise mechanism isn't necessary for 6 agents on one machine — a flat timeout suffices — but the *idea* that some agents are expected to be silent for longer than others is already present (Opus can think for 2 minutes without output; Sonnet can't).

### 11.3 Current framework usage

- **pi-orchestrator**: polling via `tmux capture-pane`, flat timeout per worker type.
- **Ray**: heartbeats between worker nodes and the head node.
- **Akka**: phi-accrual failure detector, out of the box.
- **Claude Code fork subagents**: no failure detection — the parent just waits until the child returns or the parent itself crashes.

### 11.4 Verdict: **translate**

Don't overbuild. Do log agent-level "last activity" timestamps into the event log (see Section 4). Once you have that, detecting stuck agents is a one-line query over the projection. Phi accrual is a gift you can give yourself later.

---

## 12. Idempotency and exactly-once semantics

### 12.1 The theory

Exactly-once delivery is impossible in an asynchronous distributed system with failures (folklore result, rigorously: Kafka exactly-once semantics paper — Wang et al. 2018 — only achieves exactly-once *processing* by combining at-least-once delivery with idempotent consumers). The production pattern is **at-least-once delivery + idempotent operations**, sometimes called "effectively exactly-once."

An operation is idempotent if applying it N times has the same effect as applying it once. `SET x = 5` is idempotent; `INCREMENT x` is not. Idempotency keys (per-request nonces) are the standard tool: the server deduplicates on the key.

### 12.2 The multi-agent analog

Tool calls should be idempotent where possible. Concretely:

- **File writes are idempotent** — writing the same content twice is a no-op. Good.
- **Database migrations are not** — running a migration twice fails or corrupts. Bad. Solution: migration frameworks use a ledger (Flyway, Alembic, etc.) — a classic idempotency key pattern.
- **API calls are not, generally** — `POST /payments` twice charges twice. Solution: pass an idempotency key (Stripe's API is a textbook example — every write takes an `Idempotency-Key` header).
- **Git operations are mostly idempotent** — committing the same tree twice is a no-op, pushing the same commit is a no-op.
- **LLM inference is not idempotent** — two calls return two different answers. This is the primary source of multi-agent flakiness.

**Gascity's controller lock pattern** implements a primitive "fencing token" — a single-instance-enforcement mechanism that prevents two orchestrators from running simultaneously. The proper formalization is Kleppmann's fencing-token pattern ("How to do distributed locking," martinkleppmann.com 2016): every lock returns a monotonically increasing token; the resource rejects operations carrying an older token than the last one it saw. This is what you actually want if two orchestrators might race — a plain mutex has known failure modes under network partitions.

### 12.3 Verdict: **adopt now**

This is the second adopt-now primitive. Every tool in a production harness should be classified:

- Idempotent by nature (file writes, reads)
- Made idempotent via a key (API POSTs, migrations)
- Not idempotent and not made so (LLM inference, emails) — require retry-aware design

If you can't articulate this per tool, you don't have a production harness, you have a prototype that hasn't met a retry yet.

---

## 13. Backpressure and flow control

### 13.1 The theory

- **Reactive Streams** (Viktor Klang et al., 2013; JVM standard since Java 9 as `Flow`). A non-blocking backpressure protocol: the consumer signals demand (`request(n)`), the producer sends at most n items.
- **Netflix Hystrix** (deprecated but influential) — circuit breakers, bulkheads, fallbacks. Later absorbed into Resilience4j.
- **TCP's sliding window** — the original backpressure protocol, since 1974.

The failure mode backpressure prevents: a fast producer overwhelms a slow consumer, memory fills up, the system OOMs. The solution: explicit demand signaling. Pull-based, not push-based.

### 13.2 The multi-agent analog

Common multi-agent backpressure failures:

- **Research agent finds 50 papers; synthesizer can only digest 5 per cycle.** Without backpressure, the research agent either blocks (waste) or the synthesizer drops papers (silent data loss).
- **Coder produces faster than reviewer can review.** Classic producer-consumer. Review queue grows unboundedly.
- **Tool outputs fill the context window before the model can process them.** Context rot — not really network backpressure, but the same shape.

No mainstream framework handles this well. The usual pattern is a bounded work queue (orchestrator has N slots, refuses new tasks when full) which is effectively fixed-capacity backpressure.

### 13.3 Verdict: **translate**

Add bounded queues between agent stages. Refuse new work when the queue is full. Log the refusal as an event. This is 20 lines of code and it prevents the "everything-is-fine-until-it-suddenly-isn't" failure mode.

---

## 14. Distributed tracing

### 14.1 The theory

- **Google Dapper** (Sigelman et al., Google technical report 2010). Per-request trace IDs propagated through every service call; each span records start, end, metadata. Sampling is essential at scale.
- **OpenTelemetry** (CNCF, 2019 — merged OpenTracing and OpenCensus). The current standard. Exporters feed Jaeger, Tempo, Honeycomb, Datadog.

### 14.2 The multi-agent analog

A task that spawns 6 agents and 40 tool calls across them produces a natural trace tree. Without a trace, debugging a failed task means grepping logs by wall clock — a nightmare. With a trace, every tool call has (trace_id, parent_span_id, span_id) and you can visualize the whole task as a Gantt chart.

Gascity's OpenTelemetry integration is the reference implementation in the agent-harness space. Most harnesses have nothing.

### 14.3 Verdict: **adopt when you have >3 agents**

For a single-agent harness, tracing is overkill — the existing logs are linear. For a multi-agent harness, OpenTelemetry is nearly free (every LLM SDK already has OTel instrumentation available) and pays for itself the first time you debug a cross-agent failure. Start with trace IDs in the event log; upgrade to a real OTel pipeline when the fleet grows.

---

## 15. Coordination-avoidance patterns: CRDTs and OT

### 15.1 The theory

- **CRDTs — Conflict-free Replicated Data Types** (Shapiro, Preguiça, Baquero, Zawirski, INRIA research report 2011; "Conflict-free Replicated Data Types," SSS 2011). Data structures whose concurrent updates always converge without coordination. Examples: G-Counter (grow-only counter), PN-Counter (increment/decrement), OR-Set (observed-remove set), LWW-Element-Set (last-write-wins set), RGA (sequence CRDT for text). Two families: state-based (CvRDTs, merge via join semilattice) and operation-based (CmRDTs, merge via commutative operations).
- **Operational Transformation** (Ellis & Gibbs, SIGMOD 1989). The older approach, used by Google Docs. More flexible, harder to reason about.

CRDTs are the theoretical foundation of coordination-free collaborative editing. Figma, Linear, and Automerge are all built on CRDT principles.

### 15.2 The multi-agent analog

Shared agent state that multiple agents update concurrently is a CRDT-shaped problem. Concrete examples:

- **Shared fact set** — agents collectively discover facts about a codebase. Modeled as an OR-Set (observed-remove set): any agent can add a fact; a fact is removed only if all agents that added it also remove it.
- **Vote counter for LLM-as-judge tournaments** — PN-Counter.
- **Shared TODO list** — Two agents mark tasks done, neither overwrites the other. LWW-Map or OR-Set of (task_id, status) pairs.
- **Collaborative document editing** by multiple writer agents — Automerge's RGA.

The concrete payoff: multi-agent systems often want to converge to a shared answer without locking. CRDTs let them do that with no coordination overhead, because the data type itself guarantees convergence.

### 15.3 Current framework usage

- **None of the mainstream harnesses use CRDTs explicitly.**
- **Automerge** (Kleppmann et al., github.com/automerge) is a JS/Rust CRDT library that could back a collaborative-edit agent harness. Unexplored in practice.
- **Yjs** (similar space) powers Figma-like collaboration UIs. Could host multi-agent shared state.

### 15.4 Verdict: **watch**

CRDTs solve a problem most harnesses don't have yet — coordination-free shared state. Will become relevant when multi-agent harnesses routinely need live-collaborative state. For today's "one agent per task, merge via git" designs, they are over-engineered.

---

## 16. The CAP-equivalent for multi-agent systems

The prompt asks: what's the fundamental tradeoff specific to multi-agent harnesses? Here is a proposal.

**Claim.** A multi-agent harness must pick at most two of:

- **Autonomy**: agents can proceed without waiting for the orchestrator
- **Coherence**: agents' outputs combine into a single consistent result
- **Determinism**: the same task produces the same output across runs

Call this **ACD**. The intuition:

- **Autonomy + Coherence → sacrifice Determinism.** The system converges to a consistent answer, but the path is non-deterministic. Example: two agents collaboratively refactor a file, CRDTs merge the result, final state depends on message ordering.
- **Coherence + Determinism → sacrifice Autonomy.** The system produces the same output every run, but only because the orchestrator strictly sequences every decision. Example: LangGraph with a fixed state graph and deterministic routing.
- **Autonomy + Determinism → sacrifice Coherence.** Each agent runs independently on a sharded subtask; outputs are combined but may not be consistent. Example: worktree subagents that never see each other.

You cannot have all three because LLM outputs are non-deterministic by construction. Adding autonomy compounds the non-determinism (ordering matters); requiring coherence constrains autonomy (coordination is needed).

Most production harnesses today pick **Coherence + Determinism** (sacrifice Autonomy): a central orchestrator strictly sequences work. This is the right default for small fleets. Anthropic's worktree model picks **Autonomy + Coherence** (sacrifice Determinism): agents run independently, git merges reconcile, but rerunning produces different outputs. I am not aware of production systems picking **Autonomy + Determinism** except by giving up coherence entirely — which is what most "agent swarm" demos accidentally do.

ACD is less a theorem than a design checklist: name which two you are optimizing, and accept you are sacrificing the third.

---

## 17. Synthesis: what to actually adopt

Against Burak's simplicity constraint, here is the ranked adopt list for a 2–6 agent, single-machine harness today:

| Primitive | Verdict | Why | Cost |
|---|---|---|---|
| **Event sourcing (append-only JSONL)** | Adopt now | Free debuggability, crash recovery, telemetry for free | 1 day |
| **Idempotent tool design + fencing tokens** | Adopt now | Only way to survive retries safely | Per-tool audit: 0.5 day |
| **Supervision tree (formal orchestrator/worker hierarchy)** | Adopt soon | Let-it-crash reliability | 1 day |
| **Saga compensations (only for side-effect tools)** | Adopt soon | Required for non-file side effects | Per-tool: hours |
| **Bounded queues between agent stages** | Adopt soon | Prevents overflow, trivial to implement | Hours |
| **Distributed tracing (OpenTelemetry)** | Adopt at >3 agents | Debuggability across the fleet | 1 day |
| **Named CAP/ACD choice** | Translate | Forces explicit design tradeoffs | 0 days, writing only |
| **Typed inter-agent channels (even as JSONL schemas)** | Translate | Forces explicit dataflow | Per-channel: hours |
| **Active-active tournament mode for critical tasks** | Translate, use sparingly | Quality improvement, 2–3x cost | Case by case |
| **Vector clocks / hybrid logical clocks** | Watch | Not needed until multi-machine | — |
| **Gossip protocols** | Watch | Not needed until 50+ agents | — |
| **CRDTs** | Watch | Not needed until collaborative edit becomes central | — |
| **Paxos / Raft consensus** | Avoid | Consensus round-trips at LLM latency are absurd | — |
| **Two-phase commit** | Avoid | Blocking protocol, doesn't fit agent workloads | — |
| **BFT / PBFT** | Avoid | Solves a threat model we don't have | — |

The pattern: adopt the primitives that are cheap, transparent, and match append-only substrates. Avoid the primitives that require round-trip coordination. Watch the primitives that will matter at scale you don't have yet.

## 18. What we did not borrow, and why

Three primitives from the distributed systems canon are deliberately excluded above:

- **Distributed garbage collection** (cyclic references across nodes) — irrelevant because agent processes are explicitly lifecycled.
- **Byzantine fault tolerance** — the threat model is wrong. Our "faulty" actors are not malicious, they are non-deterministic. PBFT assumes adversarial failures; LLM hallucinations are *statistical*. The right tool is majority voting (a weak form of self-consistency), not BFT.
- **Distributed transactions across heterogeneous stores (XA)** — banned even in databases for good reason.

And three primitives from the canon are *overrated* for agents even though they sound relevant:

- **Exactly-once delivery** — impossible in theory, unnecessary in practice. At-least-once + idempotent is the right target (Section 12).
- **Global snapshots (Chandy-Lamport)** — useful for debugging distributed systems, but agents' "state" is fundamentally the context window plus the file tree, both of which git already snapshots.
- **Logical clocks over the entire fleet** — scalar sequence numbers per event log are sufficient at single-machine scale.

## 19. The meta-point

Most of distributed systems theory was developed under three assumptions that don't hold for multi-agent LLM harnesses:

1. **Nodes are cheap and numerous** (thousands). Agents cost pennies to dollars per invocation; fleets are tens, not thousands.
2. **Round trips are sub-millisecond.** LLM inference is seconds-to-minutes. Protocols that assume fast round-trips become absurd.
3. **Node failures are rare and stochastic.** LLM "failures" are frequent and correlated — the same prompt bug will fail every agent the same way. A single bad prompt can take down the entire fleet simultaneously, which primary-backup does not help with.

The primitives that survive the translation are the ones that don't assume any of the three: event sourcing, idempotency, supervision, backpressure, tracing. These are the boring ones. They are the ones that work.

The primitives that do not survive are the "clever" ones — Paxos, vector clocks, CRDTs — which assume fine-grained coordination at fast RTT. They will become relevant if and only if multi-agent harnesses move to fleet scales where human orchestration breaks down, which for most teams is years away.

For today, the correct posture is: **adopt the three boring ideas, name your tradeoffs explicitly, and keep the clever things on the shelf where Lamport put them.**

---

## References (selected, ordered by section)

- Brewer, E. "Towards Robust Distributed Systems." PODC keynote, 2000. [CAP conjecture]
- Gilbert, S. & Lynch, N. "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services." *ACM SIGACT News* 33(2), 2002.
- Brewer, E. "CAP Twelve Years Later: How the 'Rules' Have Changed." *IEEE Computer*, February 2012.
- Abadi, D. "Consistency Tradeoffs in Modern Distributed Database System Design: CAP is Only Part of the Story." *IEEE Computer*, February 2012. [PACELC]
- Lamport, L. "The Part-Time Parliament." *ACM TOCS* 16(2), 1998. [Paxos]
- Lamport, L. "Paxos Made Simple." *ACM SIGACT News*, 2001.
- Ongaro, D. & Ousterhout, J. "In Search of an Understandable Consensus Algorithm." USENIX ATC, 2014. [Raft]
- Lamport, L., Shostak, R., Pease, M. "The Byzantine Generals Problem." *ACM TOPLAS* 4(3), 1982.
- Castro, M. & Liskov, B. "Practical Byzantine Fault Tolerance." OSDI, 1999.
- Fischer, M., Lynch, N., Paterson, M. "Impossibility of Distributed Consensus with One Faulty Process." *JACM* 32(2), 1985. [FLP]
- Gray, J. "Notes on Data Base Operating Systems." IBM RJ2188, 1978. [2PC]
- Skeen, D. & Stonebraker, M. "A Formal Model of Crash Recovery in a Distributed System." *IEEE TSE* SE-9(3), 1983.
- Garcia-Molina, H. & Salem, K. "Sagas." SIGMOD, 1987.
- Young, G. "CQRS Documents," 2010. Fowler, M. "Event Sourcing," martinfowler.com, 2005.
- Hewitt, C., Bishop, P., Steiger, R. "A Universal Modular Actor Formalism for Artificial Intelligence." IJCAI, 1973.
- Armstrong, J. "Making reliable distributed systems in the presence of software errors." PhD thesis, KTH, 2003.
- Hoare, C.A.R. "Communicating Sequential Processes." *CACM* 21(8), 1978.
- Demers, A. et al. "Epidemic Algorithms for Replicated Database Maintenance." PODC, 1987.
- DeCandia, G. et al. "Dynamo: Amazon's Highly Available Key-value Store." SOSP, 2007.
- Das, A., Gupta, I., Motivala, A. "SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol." DSN, 2002.
- Lamport, L. "Time, Clocks, and the Ordering of Events in a Distributed System." *CACM* 21(7), 1978.
- Fidge, C. "Timestamps in Message-Passing Systems That Preserve the Partial Ordering." ACSC, 1988.
- Mattern, F. "Virtual Time and Global States of Distributed Systems." 1989.
- Kulkarni, S. et al. "Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases." 2014. [HLC]
- Karger, D. et al. "Consistent Hashing and Random Trees." STOC, 1997.
- van Renesse, R. & Schneider, F.B. "Chain Replication for Supporting High Throughput and Availability." OSDI, 2004.
- Hayashibara, N. et al. "The φ Accrual Failure Detector." SRDS, 2004.
- Kleppmann, M. "How to do distributed locking." martinkleppmann.com, 2016. [Fencing tokens]
- Wang, G. et al. "Building a Replicated Logging System with Apache Kafka." VLDB, 2018 and related exactly-once Kafka papers.
- Sigelman, B. et al. "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure." Google technical report, 2010.
- Shapiro, M., Preguiça, N., Baquero, C., Zawirski, M. "Conflict-free Replicated Data Types." INRIA research report + SSS 2011.
- Ellis, C. & Gibbs, S. "Concurrency Control in Groupware Systems." SIGMOD, 1989. [OT]
- Kleppmann, M. *Designing Data-Intensive Applications* (O'Reilly, 2017). General reference for most of the above; chapters 5–9 cover almost everything in this document.
- Wang, X. et al. "Self-Consistency Improves Chain of Thought Reasoning in Language Models." ICLR, 2023.
