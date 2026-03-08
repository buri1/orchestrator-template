# Agent Memory & Context Engineering: Deep Landscape

> **Comprehensive analysis of memory architectures (Letta, Mem0, Cognee, Beads), context engineering frameworks (Koylan, Manus AI), token optimization techniques, and state persistence patterns for multi-agent orchestration systems.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `2026-03-05_agent-memory-context-engineering.md`, `2026-03-05_agent-memory-context-tools-deep.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Summary

The 2026 agent memory landscape has matured beyond "just vector DB" into a layered system mirroring human cognition: working memory (context window), short-term (session), episodic (cross-session), semantic (knowledge graph), and procedural (skills/tools). The field converges on three architectural pillars: tiered memory with progressive disclosure, asynchronous pre-compaction to prevent context rot, and strict context isolation per agent. Context rot -- performance degradation as context grows -- is the central engineering challenge, caused by lost-in-the-middle attention patterns, signal dilution, and attention saturation.

Seven tools were deeply analyzed. Letta (formerly MemGPT) provides the production-grade reference for database-backed, self-editing tiered memory. Mem0 delivers a managed extraction/update pipeline with 26% accuracy improvement over OpenAI's built-in memory and 90% token savings. Cognee is the strongest OSS candidate for self-hosted knowledge graph memory. Beads (Steve Yegge, endorsed by George Hotz) solves structured task state with Dolt-backed version-controlled SQL. Context-Gateway (Compresr, YC W2026) provides the critical pattern of asynchronous background compaction -- pre-computing summaries at 75% context utilization so agents never experience compaction pauses.

The research also covers context engineering as a discipline distinct from prompt engineering. Koylan's framework (10K+ GitHub stars) establishes progressive disclosure, explicit context budget allocation, and append-only JSONL memory as foundational patterns. Manus AI contributes six context strategies (offloading, reduction, retrieval, isolation, KV-cache optimization, model orthogonality), with KV-cache hit rate identified as the single most important metric for production agents. MorphLLM demonstrates that specialized subagents (10,500 tokens/sec code merging, 70% context rot reduction via WarpGrep) preserve context window budget for reasoning.

---

## Key Findings

### Memory Architecture Tiers (Industry Consensus)

| Layer | Duration | Implementation | Purpose |
|-------|----------|---------------|---------|
| Working Memory | Current turn | Context window | Immediate task execution |
| Short-Term Memory | Current session | In-memory store | Conversational continuity |
| Episodic Memory | Cross-session | Vector DB + timestamps | "What happened when" |
| Semantic Memory | Permanent | Knowledge graph | "What is true about the world" |
| Procedural Memory | Permanent | Tool definitions + skills | "How to do things" |

### Tool Comparison Matrix

| Tool | Type | Key Strength | Limitation |
|------|------|-------------|------------|
| **Letta/MemGPT** | Self-editing tiered memory | DB-backed persistence, shared memory blocks, self-editing core memory | PostgreSQL dependency for production |
| **Mem0** | Managed memory layer | 26% accuracy boost, 90% token savings, graph variant (Mem0g) | Cloud-hosted; OSS version needs self-hosting |
| **Cognee** | OSS knowledge engine | Graph-first, ECL pipeline, MCP integration, 30+ data sources | Neo4j + vector DB infrastructure |
| **Beads** | Version-controlled task state | Dolt SQL with git branching, hash-based IDs, atomic ops | Different concern than semantic memory |
| **Context-Gateway** | Async compaction proxy | Background pre-computation at 75% utilization, zero agent interruption | Requires proxy layer deployment |
| **MorphLLM** | Specialized subagents | 10,500 tok/s code merge, WarpGrep 70% context rot reduction | Separate service to manage |
| **Koylan Skills** | Context engineering framework | Progressive disclosure, 12 skills, JSONL memory | Reference material, not runtime |

### Context Rot: The Central Problem

Stanford research showed accuracy drops from 70-75% to 55-60% with just 20 retrieved documents (~4K tokens). Prevention techniques (2026 consensus):

1. **Just-in-Time Context Retrieval** -- maintain lightweight references, load dynamically
2. **Hierarchical Compaction** -- raw > compaction > summarization, progressively applied
3. **Memory Decay Policies** -- time-weighted relevance scoring
4. **Multi-Agent Isolation (Manus Principle)** -- "Share memory by communicating, don't communicate by sharing memory"
5. **Memory Hygiene** -- regular pruning, updating, verification
6. **Modular Memory** -- separate stores per concern

### Token Optimization and KV Cache

- Cached tokens cost 10x less ($0.30 vs $3.00 per million on Anthropic API)
- **TRIM-KV**: Learns per-token retention scores with lightweight gate, auto-evicts low-value tokens
- **SideQuest (Feb 2026)**: Model-driven KV cache compression, 65% peak token reduction
- **Best practice**: Structure prompts with stable prefixes (system prompt + tool definitions) to maximize cache hits

### State Persistence Patterns

| Pattern | Best For | Key Trade-off |
|---------|----------|---------------|
| JSON files | Small state, single-writer | No concurrent access, no querying |
| JSONL (append-only) | Decision logs, event streams | Grows unbounded, no random access |
| SQLite | Agent state, indexes, checkpoints | Single-writer limitation |
| PostgreSQL | Production multi-agent platforms | Infrastructure overhead |
| Git + SQLite hybrid | Multi-agent coordination with history | Complexity |

### Context-Gateway Pattern (Critical for Long-Running Agents)

The asynchronous pre-compaction blueprint:
1. Monitor token usage per agent continuously
2. At 70% utilization, spawn background summarizer (Haiku-class model)
3. Pre-compute structured summary (JSON: task_objective, progress, state, files, decisions, blockers)
4. At 90% utilization, swap in pre-computed summary instantly
5. Log all compaction events for orchestrator awareness

Result: agents run longer without quality loss; compaction is invisible to the agent.

### Multi-Agent Context Patterns

Four foundational patterns (per LangChain/Google ADK):
1. **Subagents** -- parent spawns children, context flows down, results flow up
2. **Skills** -- agents as reusable capabilities with typed interfaces
3. **Handoffs** -- sequential agent-to-agent transfer with context passing
4. **Routers** -- central dispatcher routes to specialized agents

Error characteristics from DeepMind research:
- Centralized orchestration: 4.4x error amplification (best)
- Independent multi-agent: 17.2x error amplification (worst)
- Centralized coordination: 80.9% performance improvement on parallelizable tasks vs single agent

---

## Actionable Insights

### Immediate (Low Effort, High Impact)

1. **Add JSONL decision logs** alongside JSON state files for crash-safe audit trail and pattern mining
2. **Implement context budgets** -- explicit token allocation per tier (Tier 0 < 2K, Tier 1 < 8K tokens)
3. **Structured agent context handoff** -- task description (always), relevant state (filtered), project context (Tier 0 only), history (never)
4. **Structure agent prompts with stable prefixes** to maximize KV cache hit rates

### Medium-Term

5. **Adopt self-editing memory pattern** (Letta-inspired) -- `remember(key, value)`, `forget(key)`, `search(query)` for orchestrator state
6. **Implement skill learning** -- after successful runs, extract reusable orchestration patterns
7. **Evaluate Context-Gateway proxy** for all tmux-spawned agents (background compaction)
8. **Stand up Cognee as shared memory layer** for codebase knowledge that prevents redundant agent exploration

### Long-Term

9. **SQLite state backend** when concurrent tmux agents need shared state and crash recovery
10. **GAM-style dual-agent memory** for the orchestrator itself -- separate memorizer (captures) from researcher (retrieves)
11. **Memory type differentiation** -- procedural (skills), episodic (logs), semantic (architecture), core (identity/rules)

### Anti-Patterns to Avoid

- Single global context store (causes context pollution)
- Synchronous compaction (always pre-compute)
- Full-history replay into new agents (extract structured facts instead)
- Ignoring the middle (LLMs attend poorly to mid-context; place critical info at start/end)
- Treating memory as append-only without decay/pruning

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [agent-memory/always-on-memory-agent.md](../agent-memory/always-on-memory-agent.md) | Validates consolidation-as-sleep pattern and SQLite-over-vector-DB approach documented here |
| [agent-memory/airweave.md](../agent-memory/airweave.md) | Enterprise-scale retrieval layer; represents the heavy-infrastructure end of the spectrum vs. lightweight patterns in this reference |
| [orchestration-platforms/stripe-minions.md](../orchestration-platforms/stripe-minions.md) | Stripe's tool curation (15 from 400+) validates the progressive disclosure and minimum viable context patterns |
| [reference/orchestration-patterns-2026.md](orchestration-patterns-2026.md) | Complementary: this doc covers memory/context, that doc covers orchestration patterns and error recovery |
| [reference/agent-security-models.md](agent-security-models.md) | ASI06 (Memory & Context Poisoning) from OWASP directly threatens the memory architectures described here |
