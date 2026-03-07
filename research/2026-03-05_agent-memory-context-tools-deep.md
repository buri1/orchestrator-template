# Agent Memory, Context Engineering, and Token Optimization: Deep Research

**Date:** 2026-03-05
**Focus:** Curated tools + broader landscape for Pi-based orchestrator memory architecture

---

## Table of Contents

1. [Tool-by-Tool Analysis](#1-tool-by-tool-analysis)
2. [Broader Landscape: State of the Art](#2-broader-landscape-state-of-the-art)
3. [Architectural Decisions for Pi Orchestrator](#3-architectural-decisions-for-pi-orchestrator)
4. [Context-Gateway Pattern: Borrowing for Pi](#4-context-gateway-pattern-borrowing-for-pi)
5. [Actionable Recommendations](#5-actionable-recommendations)

---

## 1. Tool-by-Tool Analysis

### 1.1 Mem0 (mem0.ai) -- Universal Memory Layer

**What it is:** A managed memory layer for AI agents that extracts, consolidates, and retrieves compact memory representations from conversations. YC-backed, raised $24M (Series A, Oct 2025). 26% higher response accuracy than OpenAI's built-in memory on the LOCOMO benchmark. 91% lower p95 latency and 90% token savings versus full-context approaches.

**Architecture -- Two-Phase Pipeline:**

- **Extraction Phase:** An LLM processes conversation messages, extracting entities, facts, and relation triplets. Each piece becomes a memory unit with metadata.
- **Update Phase:** New memories are reconciled against existing ones through conflict detection and resolution. Duplicate facts merge; contradictory facts trigger replacement with recency bias.

**Two Memory Variants:**

- **Mem0 (Vector):** Stores memories as vector embeddings. Semantic similarity search for retrieval. Fast, simple, good for fact lookup.
- **Mem0g (Graph):** Layers a knowledge graph on top. Entities become nodes; relationships become edges. Captures multi-session, multi-hop relationships. Available on Pro tier and above.

**Pricing:** Free tier: 10K memories. Pro: unlimited memories + graph. Enterprise: custom.

**Relevance to Pi Orchestrator:** Mem0's two-phase extraction/update pipeline is the pattern to study. The idea of automatically extracting salient facts from agent conversations and storing them in a persistent layer -- rather than relying on raw context windows -- is exactly what an orchestrator needs for cross-session memory. The graph variant (Mem0g) is particularly interesting for tracking relationships between agents, tasks, and codebase entities.

**Limitation:** Cloud-hosted. For a Pi orchestrator that values local-first operation, the open-source version would need self-hosting with a vector DB (Qdrant, Weaviate) and optionally Neo4j for graph.

---

### 1.2 Cognee (github.com/topoteretes/cognee) -- OSS Knowledge Engine

**What it is:** Open-source knowledge engine that transforms raw data into persistent, dynamic AI memory through knowledge graphs. Python-first, 1K+ GitHub stars, graduated from GitHub Secure Open Source Program.

**Architecture -- ECL Pipeline:**

1. **Extract (`cognee.add()`):** Ingests documents, conversations, files, images, audio transcriptions from 30+ data sources.
2. **Cognify (`cognee.cognify()`):** Generates knowledge graphs from source material. Creates interconnected data structures with entities, relationships, and metadata.
3. **Memify (`cognee.memify()`):** Applies algorithmic self-improvement to the graph. Optimizes for retrieval quality.
4. **Search (`cognee.search()`):** Retrieves results based on semantic meaning AND relationship mapping simultaneously.

**Tech Stack:** Neo4j for graph storage, pluggable vector DB, pluggable LLM provider (OpenAI default). Python 3.10-3.13. Includes MCP (Model Context Protocol) components for agent integration. Recent improvements include multiquery triplet search, usage frequency tracking for graph elements, and multi-tenant support.

**Relevance to Pi Orchestrator:** Cognee is the strongest OSS candidate for building a self-hosted memory layer. The ECL pipeline maps cleanly to an orchestrator's needs: ingest agent conversation logs (Extract), build a knowledge graph of codebase entities, tasks, and decisions (Cognify), optimize it over time (Memify), and let agents query it (Search). The MCP integration means Pi agents could access shared memory through a standard protocol.

**Key Advantage over Mem0:** Fully open-source, self-hostable, no cloud dependency. The graph-first approach (vs. Mem0's vector-first-with-optional-graph) may better capture the structured relationships in a codebase orchestration context.

---

### 1.3 Beads (github.com/steveyegge/beads) -- Agent Memory via Version-Controlled Graph

**What it is:** Steve Yegge's agent memory system from Gas Town. Endorsed by George Hotz. Replaces markdown task lists with a persistent, structured dependency graph backed by Dolt (version-controlled SQL database).

**Architecture:**

- **Storage:** Dolt database -- SQL with git-like branching, cell-level merges, and built-in sync via remotes. Full audit trail.
- **Data Model:** Tasks use hash-based IDs (`bd-a1b2`) to prevent merge collisions. Hierarchical: `bd-a3f8` (Epic) > `bd-a3f8.1` (Task) > `bd-a3f8.1.1` (Subtask).
- **Relationships:** Graph links between tasks via typed edges: `relates_to`, `duplicates`, `supersedes`, `replies_to`.
- **Agent Optimization:** JSON output format, atomic operations (`bd update <id> --claim` sets assignee + status atomically), auto-detection of ready tasks (all dependencies resolved via `bd ready`).

**Multi-Agent Coordination:** Hash-based IDs eliminate naming conflicts. Dolt's merge capability handles simultaneous modifications from multiple agents across branches without collisions. This is purpose-built for concurrent multi-agent workflows.

**Gas Town Integration:** Works with Gas Town (multi-agent workspace manager) which provides `gt feed` -- an interactive TUI dashboard combining beads activity, agent events, and merge queue updates.

**Relevance to Pi Orchestrator:** Beads solves a different problem than Mem0/Cognee. It is not about semantic memory or knowledge graphs -- it is about structured task state that survives across sessions, agents, and branches. The Dolt-backed version control is brilliant for orchestrator state: you get branching (experimental agent runs), merging (reconciling parallel work), and full history. The L-Thread orchestrator's `_bmad/orchestrator-state.json` is a primitive version of what Beads provides.

**Key Insight:** Beads + a semantic memory layer (Cognee or Mem0) would be complementary: Beads for structured task/work state, Cognee for semantic knowledge about the codebase and decisions.

---

### 1.4 OneContext (TheAgentContextLab/OneContext) -- Unified Context Hub

**What it is:** An agent self-managed context layer providing a unified context store loadable by any agent. Works in Node.js and Python. No cloud infrastructure required (runs as local library).

**Key Features:**

- **Unified Context Hub:** Single context store shared across agents, devices, and services.
- **Trajectory Recording:** Every interaction is logged with full history of how an agent reached its current state.
- **Session Recording:** Wrap agent calls with `onecontext-ai record` to automatically log prompts, completions, and metadata.
- **Export:** Context can be exported to disk or sent to Slack.

**Relevance to Pi Orchestrator:** OneContext is lightweight and local-first, which fits the Pi philosophy. The trajectory recording feature is valuable for debugging agent behavior and understanding why an agent made certain decisions. However, it is more of an observability/logging layer than a true memory system. Best used as a complement to a semantic memory layer, not a replacement.

**Limitation:** Less mature than Mem0 or Cognee. The "unified context hub" is essentially a shared JSON store without the intelligence of extraction/update pipelines.

---

### 1.5 Context-Gateway (Compresr-ai/Context-Gateway) -- CRITICAL FOR PI

**What it is:** An agentic proxy from Compresr (YC W2026) that sits between AI agents and LLM APIs. Provides instant history compaction through background pre-computation. Written in Go (96.2%) with TypeScript dashboard.

**How Background Compression Works -- THE KEY PATTERN:**

1. Context-Gateway intercepts all LLM API calls as a transparent proxy.
2. It monitors conversation length continuously.
3. When utilization reaches a configurable threshold (default: 75% of context window), it begins **asynchronously** pre-computing summaries of the conversation history in the background.
4. The agent continues working normally -- zero interruption.
5. When compaction is actually needed (context window nearly full), the pre-computed summary is swapped in **instantly** because the work was already done.
6. Result: The agent never experiences a compaction pause. From the agent's perspective, compaction is free.

**Supported Integrations:** Claude Code, Cursor, OpenClaw, custom agent configurations.

**Configuration:**
- Summarizer model selection (use a cheap, fast model for background summarization)
- Compression trigger threshold (configurable, default 75%)
- Slack notifications for compaction events
- Detailed logs at `logs/history_compaction.jsonl`

**Compresr API:** Up to 200x compression without quality loss. Drop-in for agents and RAG pipelines.

**HOW TO BORROW THIS PATTERN FOR PI AGENT:**

The core insight is **asynchronous pre-computation of compaction**. Currently, when Pi or any Claude Code agent hits context limits, compaction is synchronous -- the agent stops, summarizes, and resumes. This is a jarring interruption that can lose critical context.

**Implementation blueprint for Pi:**

1. **Proxy Layer:** Build a lightweight Go or Python proxy that sits between Pi's agents and the Anthropic API.
2. **Token Counter:** Track token usage per agent conversation in real-time.
3. **Background Summarizer:** When any agent hits 70% utilization, spawn a background process that:
   - Takes the current conversation
   - Uses a fast, cheap model (Haiku-class) to generate a compressed summary
   - Stores the summary keyed by conversation hash
4. **Instant Swap:** When the agent's next turn would exceed the context window, transparently inject the pre-computed summary in place of the raw history.
5. **State Integration:** Log all compaction events to `_bmad/orchestrator-tmux-state.json` or equivalent so the orchestrator knows which agents have been compacted and can adjust task assignment accordingly.

**Why this is critical:** Pi's orchestrator spawns multiple long-running agents via tmux. Each agent's context degrades over time. Background compaction means agents can run longer without quality loss, and the orchestrator never has to "baby-sit" context windows.

---

### 1.6 React Grab (react-grab.com) -- Frontend Token Optimization

**What it is:** A tool by Aiden Bai that embeds React component stack information (file paths, line numbers) directly in the DOM, allowing coding agents to locate the correct source file in O(1) instead of searching.

**How It Works:**

1. React's Fiber architecture stores debug info on each fiber: source file, line number, column.
2. React Grab reads this from the DOM when you click/select an element.
3. It walks up the fiber tree to capture the full component stack with exact source locations.
4. This context is sent directly to the coding agent (Claude Code, Cursor, etc.) along with the user's prompt.
5. The agent skips the entire "search for the right file" phase -- goes straight to editing.

**Performance Claims:** 3x faster frontend coding, up to 50% less token consumption (by eliminating search/grep tool calls).

**Relevance to Pi Orchestrator:** Limited to React frontends, but the underlying pattern is powerful: **embed navigational metadata in the artifact itself** so agents don't waste tokens searching. For a Pi orchestrator, this translates to: maintain a codebase index (file-to-purpose map, component-to-file map) that agents can consult instantly instead of grepping. This index could be part of the shared memory layer.

---

### 1.7 Agent Skills for Context Engineering (muratcankoylan)

**What it is:** A comprehensive collection of Agent Skills (12.9K+ GitHub stars) structured as a "Meta-Agent knowledge base" -- markdown + code skills that you feed to an agent so it understands context engineering principles. Works as a Claude Code Plugin Marketplace.

**Skill Categories:**

- **Foundational:** Context fundamentals, context degradation (lost-in-middle, U-shaped attention), context compression
- **Architectural:** Multi-agent patterns (orchestrator, peer-to-peer, hierarchical), memory systems (short-term, long-term, graph-based), tool design, filesystem context, hosted agents
- **Operational:** Context optimization (compaction, masking, caching), evaluation, advanced evaluation (LLM-as-Judge)
- **Cognitive Architecture (new):** BDI (Belief-Desire-Intention) mental states with RDF transformation

**Key Principles:**

- **Progressive Disclosure:** Skills load metadata first; full content activates contextually. This is itself a context engineering technique.
- **Minimum Viable Context:** Each agent sees only the minimum context required. Agents reach for more information explicitly via tools rather than being flooded by default.
- **Named, Ordered Processors:** Context is built through named, ordered processors rather than ad-hoc string concatenation.

**Relevance to Pi Orchestrator:** This is a reference architecture for how to structure the orchestrator's own context management. The "progressive disclosure" pattern directly maps to the tiered context system already in the L-Thread orchestrator. The BDI mental states skill is interesting for formalizing how the orchestrator reasons about agent states and intentions.

---

## 2. Broader Landscape: State of the Art

### 2.1 Memory Architecture Patterns (2026)

The field has converged on a **layered memory architecture** that mirrors human cognition:

| Layer | Duration | Implementation | Purpose |
|-------|----------|---------------|---------|
| Working Memory | Current turn | Context window | Immediate task execution |
| Short-Term Memory | Current session | In-memory store | Conversational continuity |
| Episodic Memory | Cross-session | Vector DB + timestamps | "What happened when" |
| Semantic Memory | Permanent | Knowledge graph | "What is true about the world" |
| Procedural Memory | Permanent | Tool definitions + skills | "How to do things" |

**Key 2026 developments:**
- **A-Mem (Agentic Memory):** Implements a Zettelkasten-like note system where memories are interconnected notes with rich metadata. Processes new interactions into notes, then uses an LLM to determine connections between new and historical memories.
- **GAM (General Agentic Memory):** Dual-agent architecture separating remembering from recalling. A "memorizer" agent captures every exchange as structured pages with metadata. A "researcher" agent plans search strategies combining vector retrieval, BM25 keyword matching, and direct lookups. Achieves 90%+ accuracy on RULER benchmark where conventional RAG fails.
- **Observational Memory:** Cuts agent costs 10x by having agents "observe" and selectively store only decision-relevant information rather than everything.

### 2.2 Context Rot: The Central Problem

Context rot is the degradation of an LLM's performance as its input context grows. Stanford research showed accuracy drops from 70-75% to 55-60% with just 20 retrieved documents (~4K tokens). This is caused by:

1. **Lost-in-the-Middle Effect:** LLMs attend strongly to the beginning and end of context, poorly to the middle.
2. **Signal Dilution:** As context grows, the ratio of relevant-to-irrelevant tokens decreases.
3. **Attention Saturation:** The model's attention mechanism spreads thin over more tokens.

**Prevention Techniques (2026 consensus):**

1. **Just-in-Time Context Retrieval:** Maintain lightweight references (file paths, DB queries); load information dynamically at runtime.
2. **Hierarchical Compaction:** Raw > Compaction > Summarization, applied progressively only when space demands it.
3. **Memory Decay Policies:** Reduce influence of old facts over time unless re-validated. Time-weighted relevance scoring.
4. **Multi-Agent Isolation (Manus Principle):** "Share memory by communicating, don't communicate by sharing memory." Each agent gets minimal, scoped context. Shared state goes through explicit message-passing.
5. **Memory Hygiene:** Regular pruning, updating, and verification of persistent context -- analogous to code refactoring.
6. **Modular Memory:** Separate memory stores per concern (task state, codebase knowledge, user preferences) so staleness in one module doesn't infect others.

### 2.3 Token Optimization and KV Cache

**Key metrics for 2026:**
- Cached tokens cost 10x less than uncached ($0.30 vs $3.00 per million on Anthropic's API).
- KV-cache hit rate is the single most important metric for production AI agents.

**Cutting-edge techniques:**

- **TRIM-KV:** Learns each token's intrinsic importance at creation time via a lightweight retention gate. Predicts a scalar retention score that decays over time. Automatically evicts low-value tokens from the cache.
- **SideQuest (Feb 2026):** Model-driven KV cache compression for agentic workflows. Leverages the LLM itself to reason about which tokens to keep. Reduces peak token usage by 65% with minimal accuracy loss. Frames cache compression as an auxiliary "side quest" executed in parallel to main reasoning.
- **Prompt Caching Best Practices:** Structure prompts with stable prefixes (system prompt, tool definitions) that remain constant across turns. Anthropic, OpenAI, and Google all offer prompt caching that reuses KV tensors from attention layers.

**Practical implication for Pi:** Structure agent prompts so the system prompt + tool definitions + CLAUDE.md content forms a stable prefix. Only the conversation history and current task vary. This maximizes KV cache hit rates across turns.

### 2.4 Multi-Agent Context Patterns

**Four foundational patterns (per LangChain/Google ADK):**

1. **Subagents:** Parent spawns children for specific tasks. Context flows down; results flow up.
2. **Skills:** Agents as reusable capabilities with typed interfaces.
3. **Handoffs:** Sequential agent-to-agent transfer with context passing.
4. **Routers:** Central dispatcher routes to specialized agents based on task type.

**Context architecture best practices (per Google ADK):**
- Tiered storage with compiled views
- Pipeline processing through named, ordered processors
- Strict scoping: each agent sees minimum required context
- Agents reach for more information via tools, not by default flooding

**Error characteristics:**
- Centralized orchestration: 4.4x error amplification (best)
- Independent multi-agent (no communication): 17.2x error amplification (worst)
- Centralized coordination improves performance by 80.9% on parallelizable tasks vs single agent

---

## 3. Architectural Decisions for Pi Orchestrator

### 3.1 Centralized vs Per-Agent Memory

**Recommendation: Hybrid -- Centralized Shared Memory + Per-Agent Working Memory**

| Aspect | Centralized (Shared) | Per-Agent (Local) |
|--------|---------------------|-------------------|
| Task state | Yes -- Beads-style graph DB | No |
| Codebase knowledge | Yes -- Cognee-style knowledge graph | No |
| Conversation history | No | Yes -- each agent owns its context |
| Agent decisions/reasoning | No | Yes -- local, ephemeral |
| Cross-session facts | Yes -- Mem0-style extraction | No |

**Why hybrid:**
- Centralized task state prevents conflicting work and enables dependency tracking.
- Centralized codebase knowledge prevents redundant exploration (Agent A already mapped the auth module -- Agent B should know).
- Per-agent conversation history avoids the "context pollution" problem (Manus Principle): each agent's context stays focused on its task.
- Cross-session facts (user preferences, project conventions, past decisions) belong in shared memory so all agents benefit.

### 3.2 What Persists Between Sessions vs What is Ephemeral

**Persists (stored in shared memory layer):**
- Task graph and completion status (Beads-like)
- Codebase entity map (file purposes, component relationships)
- Project conventions and decisions ("we use Tailwind, not CSS modules")
- Error patterns and resolutions ("this lint error means X, fix with Y")
- Agent performance metrics (which agents succeed at which tasks)

**Ephemeral (dies with the session):**
- Agent conversation context
- Working memory (current hypothesis, current file being edited)
- Tool call history for the current task
- Scratch computations and intermediate reasoning

**Semi-persistent (compressed cross-session):**
- Session summaries (what was accomplished, what remains)
- Compacted conversation highlights (extracted via Mem0-style pipeline)
- Failed approach records ("tried X, it didn't work because Y")

### 3.3 Preventing Context Rot

For the Pi orchestrator specifically:

1. **Background Compaction (Context-Gateway pattern):** Run a background summarizer for each active tmux agent. Pre-compute compaction at 70% utilization. Swap instantly when needed.

2. **Tiered Context Loading:** The orchestrator's CLAUDE.md already does this with progressive disclosure. Extend it: agents start with minimal context (task description + relevant file paths), and pull more via tools (MCP search over knowledge graph).

3. **Memory Decay for Task Context:** When an agent is working on Issue #5, facts about Issue #3 (completed yesterday) should decay in relevance. Time-weight the shared memory retrieval.

4. **Periodic Memory Hygiene:** After each sprint/batch of issues, run a "memory hygiene" pass: remove stale facts, merge duplicates, verify still-true assertions against the actual codebase.

5. **Structured Handoff Documents:** When the orchestrator compact (PreCompact hook), generate a structured handoff -- not a wall of text, but a typed document with sections: current_tasks, blocked_on, completed_since_last_handoff, key_decisions.

---

## 4. Context-Gateway Pattern: Borrowing for Pi

This section details the specific implementation blueprint for bringing Compresr's instant compaction to the Pi orchestrator.

### 4.1 The Problem

Pi's orchestrator spawns long-running agents in tmux sessions. Each agent accumulates context over time. When an agent hits context limits, Claude Code's built-in compaction fires synchronously -- the agent pauses, summarizes, and resumes. Problems:

- The agent loses nuance during compaction (context rot)
- The pause interrupts flow and can cause tmux session timeouts
- The orchestrator has no visibility into when/why compaction happened
- Post-compaction, the agent may "forget" critical task context

### 4.2 The Solution: Asynchronous Pre-Compaction

```
                    +------------------+
                    |   Pi Orchestrator |
                    +--------+---------+
                             |
                    +--------v---------+
                    | Context Monitor  |  <-- Runs as background process
                    | (token counter)  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
        +-----v-----+ +-----v-----+ +-----v-----+
        | Agent A    | | Agent B   | | Agent C   |
        | (tmux)     | | (tmux)    | | (tmux)    |
        +-----+------+ +-----+-----+ +-----+-----+
              |              |              |
        +-----v------+ +-----v-----+ +-----v-----+
        | Pre-Compact| | Pre-Compact| | Pre-Compact|
        | Worker A   | | Worker B  | | Worker C  |
        | (background| | (background| | (background|
        | Haiku call)| | Haiku call)| | Haiku call)|
        +------------+ +-----------+ +-----------+
```

### 4.3 Implementation Steps

**Step 1: Token Monitoring**
- Extend `_bmad/orchestrator-tmux-state.json` with per-agent token tracking:
  ```json
  {
    "agents": {
      "agent-issue-5": {
        "tmux_session": "agent-issue-5",
        "token_usage_pct": 0.62,
        "last_compaction": null,
        "pre_compaction_ready": false,
        "pre_compaction_summary": null
      }
    }
  }
  ```
- Use `tmux capture-pane` to estimate conversation length, or intercept API calls if using a proxy.

**Step 2: Background Pre-Compaction**
- When `token_usage_pct > 0.70`, spawn a background process:
  - Capture current agent conversation via `tmux capture-pane -S -`
  - Send to a fast model (Claude Haiku or a local model) with a structured extraction prompt
  - Store the result in `_bmad/compaction-cache/<agent-id>.json`
  - Update state: `pre_compaction_ready: true`

**Step 3: Compaction Injection**
- When `token_usage_pct > 0.90` and `pre_compaction_ready`, trigger compaction:
  - Replace the agent's history with the pre-computed summary
  - Or, if using Claude Code's built-in compaction, feed it the pre-computed summary as a "seed" to speed up the process

**Step 4: Orchestrator Awareness**
- Log all compaction events to `logs/compaction_events.jsonl`
- The orchestrator checks compaction state before assigning new tasks
- Heavily-compacted agents may be killed and restarted fresh with focused context rather than degraded context

### 4.4 Key Design Decisions

- **Use a cheap model for pre-compaction.** The summarizer does not need to be the same quality as the working model. Haiku-class is sufficient -- the goal is preserving facts, not reasoning.
- **Preserve structured data.** The pre-compaction summary should be structured (JSON with sections), not a narrative paragraph. Sections: `task_objective`, `progress_so_far`, `current_state`, `files_modified`, `decisions_made`, `blockers`.
- **Never compact tool definitions or system prompts.** These are the stable prefix that should always remain in full.
- **Compaction is lossy -- accept it.** The goal is graceful degradation, not perfection. A well-structured summary at 70% is better than a garbled full context at 100%.

---

## 5. Actionable Recommendations

### 5.1 Immediate Actions (This Sprint)

1. **Integrate Context-Gateway proxy** for all tmux-spawned agents. This is the highest-ROI change: zero code changes to agents, instant benefit.
   - Install: `git clone https://github.com/Compresr-ai/Context-Gateway && cd Context-Gateway && make install`
   - Configure: Point at Anthropic API, set threshold to 75%, enable logging
   - Result: All agents get background compaction for free

2. **Add token tracking to orchestrator state.** Extend `_bmad/orchestrator-tmux-state.json` with token usage estimates per agent.

3. **Install Koylan's Agent Skills** as reference context for the orchestrator agent itself. The context-fundamentals and multi-agent-patterns skills directly improve orchestrator decision-making.

### 5.2 Medium-Term (Next 2-4 Weeks)

4. **Stand up Cognee as shared memory layer.** Deploy locally with Neo4j + a vector DB. Feed it:
   - All completed task summaries
   - Codebase file-purpose mappings
   - Key architectural decisions
   - Error resolution patterns

5. **Expose Cognee via MCP** so all spawned agents can query shared memory. This replaces the current pattern of each agent independently re-discovering codebase structure.

6. **Evaluate Beads for task state.** Replace `_bmad/orchestrator-state.json` with a Dolt-backed Beads database. Benefits: branching for experimental runs, merge for parallel agents, full audit trail, dependency tracking.

### 5.3 Long-Term Architecture

7. **Build the hybrid memory stack:**
   ```
   +-----------------------------------------+
   |          Pi Orchestrator                 |
   |  +-----------------------------------+  |
   |  |  Working Memory (context window)  |  |
   |  +-----------------------------------+  |
   |  |  Session Memory (OneContext logs)  |  |
   |  +-----------------------------------+  |
   |  |  Task State (Beads/Dolt)          |  |
   |  +-----------------------------------+  |
   |  |  Semantic Memory (Cognee graph)   |  |
   |  +-----------------------------------+  |
   |  |  Compaction Layer (Context-GW)    |  |
   |  +-----------------------------------+  |
   +-----------------------------------------+
   ```

8. **Implement GAM-style dual-agent memory** for the orchestrator itself. The orchestrator is the longest-running agent and suffers the most from context rot. Separate its "memorizer" (captures all agent interactions) from its "researcher" (retrieves relevant history when making decisions).

9. **Apply React Grab's principle broadly:** Maintain a codebase navigation index (file-to-purpose, component-to-file, route-to-handler) in the shared Cognee memory. Agents consult this index before grepping, saving tokens and time.

10. **KV Cache Optimization:** Structure all agent system prompts to share a common stable prefix (project rules, tool definitions, coding conventions). This maximizes prompt cache hits across agent spawns. The SideQuest paper's finding -- 65% peak token reduction through model-driven cache management -- suggests investigating custom KV cache policies for long-running orchestrator agents.

### 5.4 Tool Selection Matrix

| Need | Best Tool | Alternative | Notes |
|------|-----------|-------------|-------|
| Instant compaction | Context-Gateway | Build custom proxy | Highest priority for Pi |
| Semantic memory | Cognee (OSS) | Mem0 (managed) | Cognee for self-hosted; Mem0 if speed matters |
| Task state | Beads + Dolt | Enhanced JSON state | Beads if multi-agent branching needed |
| Context logging | OneContext | Custom logging | Lightweight, good for debugging |
| Agent context skills | Koylan's Skills | -- | Reference material, not runtime |
| Frontend tokens | React Grab | -- | Only for React projects |
| Compression API | Compresr | LLMLingua, Compressly | For external compression; Context-GW uses this |

### 5.5 Anti-Patterns to Avoid

1. **Single global context store.** Sharing everything with every agent causes context pollution and exponential token costs.
2. **Synchronous compaction.** Always pre-compute. Never make agents wait for summarization.
3. **Full-history replay.** Never dump an entire conversation history into a new agent's context. Extract structured facts and load those instead.
4. **Ignoring the middle.** LLMs attend poorly to mid-context content. Place critical information at the start and end of prompts. This is non-negotiable.
5. **Treating memory as append-only.** Without decay, pruning, and conflict resolution, memory stores become noise generators. Implement memory hygiene as a scheduled process.

---

## Summary

The 2026 landscape has matured significantly. Memory is no longer "just vector DB" -- it is a layered system with working, episodic, semantic, and procedural tiers. Context rot is the central engineering challenge, and the best teams solve it with asynchronous pre-compaction (Context-Gateway), structured memory layers (Cognee/Mem0), and strict context scoping (minimum viable context per agent).

For the Pi orchestrator specifically, the highest-impact changes are:

1. **Context-Gateway proxy** for background compaction of all tmux agents (immediate, high ROI)
2. **Cognee as shared semantic memory** replacing ad-hoc codebase rediscovery (medium-term)
3. **Beads for structured task state** replacing flat JSON state files (medium-term)
4. **GAM-style dual memory for the orchestrator itself** to prevent orchestrator context rot (long-term)

The thread connecting all of these: **separate the act of remembering from the act of recalling**, pre-compute everything that can be pre-computed, and never put more into an agent's context window than it needs for its current task.

---

## Sources

- [Mem0 -- Universal Memory Layer for AI Agents](https://github.com/mem0ai/mem0)
- [Mem0 Platform](https://mem0.ai/)
- [Mem0 Graph Memory Architecture](https://mem0.ai/blog/graph-memory-solutions-ai-agents)
- [Mem0 Research: 26% Accuracy Boost](https://mem0.ai/research)
- [Mem0 arXiv Paper](https://arxiv.org/abs/2504.19413)
- [Cognee -- Knowledge Engine for AI Agent Memory](https://github.com/topoteretes/cognee)
- [How Cognee Builds AI Memory](https://www.cognee.ai/blog/fundamentals/how-cognee-builds-ai-memory)
- [Beads -- Memory Upgrade for Coding Agents](https://github.com/steveyegge/beads)
- [Gas Town -- Multi-Agent Workspace Manager](https://github.com/steveyegge/gastown)
- [OneContext -- Unified Context Layer](https://github.com/TheAgentContextLab/OneContext)
- [Context-Gateway -- Agentic Proxy](https://github.com/Compresr-ai/Context-Gateway)
- [Compresr -- LLM Context Compression (YC W26)](https://www.ycombinator.com/companies/compresr)
- [React Grab -- Select Context from Website](https://github.com/aidenybai/react-grab)
- [React Grab for Agents](https://www.react-grab.com/blog/agent)
- [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [AI Agents 2026: Practical Architecture](https://andriifurmanets.com/blogs/ai-agents-2026-practical-architecture-tools-memory-evals-guardrails)
- [AI Agent Architecture: Build Systems That Work](https://redis.io/blog/ai-agent-architecture/)
- [A-Mem: Agentic Memory for LLM Agents](https://arxiv.org/abs/2502.12110)
- [GAM: Dual-Agent Memory Architecture](https://venturebeat.com/ai/gam-takes-aim-at-context-rot-a-dual-agent-memory-architecture-that)
- [Memory for AI Agents: A New Paradigm](https://thenewstack.io/memory-for-ai-agents-a-new-paradigm-of-context-engineering/)
- [The State of Agent Memory 2026](https://blog.virenmohindra.me/p/the-state-of-agent-memory-2026)
- [Context Rot Explained (Redis)](https://redis.io/blog/context-rot/)
- [Fighting Context Rot (Inkeep/Anthropic)](https://inkeep.com/blog/fighting-context-rot)
- [Multi-Agent Workflows: How to Engineer Ones That Don't Fail (GitHub Blog)](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/)
- [Context Engineering for Multi-Agent Systems (Google ADK)](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)
- [SideQuest: Model-Driven KV Cache Management](https://arxiv.org/abs/2602.22603)
- [Don't Break the Cache: Prompt Caching for Agentic Tasks](https://arxiv.org/html/2601.06007v2)
- [LLM Token Optimization (Redis)](https://redis.io/blog/llm-token-optimization-speed-up-apps/)
- [Towards a Science of Scaling Agent Systems (Google Research)](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)
- [Memory in LLM-based Multi-Agent Systems (Survey)](https://www.techrxiv.org/users/1007269/articles/1367390/master/file/data/LLM_MAS_Memory_Survey_preprint_/LLM_MAS_Memory_Survey_preprint_.pdf)
- [Why Multi-Agent Systems Need Memory Engineering (O'Reilly)](https://www.oreilly.com/radar/why-multi-agent-systems-need-memory-engineering/)
