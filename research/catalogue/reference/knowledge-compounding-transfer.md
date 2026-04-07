# Knowledge Compounding and Cross-Project Transfer

> **The single largest untapped leverage point in agentic coding: systems that accumulate and transfer knowledge across projects, covering Augment Context Engine, xgmem, Cognee, MUSE, SkillOrchestra, post-mortem replay, semantic codebase models, and orchestrator meta-context management.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | 2026-03-05_PHASE2_research-knowledge-compounding-transfer.md |
| Research Phase | Phase 2 |
| Last Updated | 2026-03-08 |

---

## Summary

Every orchestrator currently starts from scratch on each project. The system that accumulates and transfers knowledge across projects has a permanent, growing advantage that compounds exponentially. This research maps four dimensions of the knowledge compounding frontier: cross-project transfer, post-mortem replay, semantic codebase models, and orchestrator meta-context management.

The pieces exist but nobody has integrated them. Augment Code's Context Engine handles 400K+ files across dozens of repos. MUSE demonstrates zero-shot improvement on new tasks through accumulated experience. SkillOrchestra achieves 700x learning cost reduction through transferable Skill Handbooks. AgentRR introduces classical record-and-replay for agents. Roam-code provides architectural governance across 26 languages. AOI achieves 72.4% context compression with 92.8% information retention. But no production system combines architectural pattern extraction, failure mode cataloging, convention transfer, domain knowledge accumulation, and agent performance optimization across projects.

The critical gaps are: cross-project architectural pattern transfer (same auth/payment patterns reimplemented from scratch), automated failure prevention from historical data (same mistakes repeated), unified record-replay-learn-prevent pipelines (fragments exist separately), orchestrator self-optimizing context (no system treats its own context as a first-class optimization problem), and strategic vs tactical context auto-classification (manual classification doesn't scale).

---

## Key Findings

### Cross-Project Transfer (Q19)

**Production systems:**
- **Augment Code Context Engine**: 200K-token engine processing 400K+ files across dozens of repos with cross-service dependency awareness. ISO/IEC 42001 certified. Limitation: works within one organization, not across independent clients.
- **xgmem**: MCP server for cross-project knowledge graphs. Per-project storage with cross-project migration. Limitation: requires manual curation of what transfers.
- **Cognee**: Knowledge graphs from code repos via Graph-RAG. Finds hidden connections across ingested data. Limitation: primarily single-repo.
- **Mem0**: AWS's exclusive memory provider ($24M Series A). 26% higher accuracy, 91% lower p95 latency, 90%+ token savings. SOC 2 compliant.

**Research breakthroughs:**
- **MUSE** (SOTA, Oct 2025): Hierarchical memory with experience distillation after each sub-task. 51.78% on TAC benchmark (20% leap). Knowledge stored in natural language is LLM-agnostic -- transfers across models.
- **SkillOrchestra** (Feb 2026): Learns reusable Skill Handbooks from execution. 22.5% gain over SOTA RL-based orchestrators. 700x learning cost reduction vs Router-R1. Transfers across LLM backbones without retraining.
- **Contextual Experience Replay** (ACL 2025): Training-free agent self-improvement. 51% relative improvement on WebArena. Applies RL experience replay to language agents.
- **Evolving Orchestration** (NeurIPS 2025): RL-trained orchestrator policy that improves at the meta-level of coordination. Dynamically suppresses unhelpful agents based on cross-task experience.

### Post-Mortem Replay (Q20)

- **AgentRR**: Classical record-and-replay for agents with multi-level experience (low-level action sequences for replay, high-level summaries for transfer).
- **AgentDebug**: Failure taxonomy across 5 categories (memory, reflection, planning, action, system). 24% higher accuracy vs baseline. Key finding: early-step errors cascade disproportionately.
- **MAST** (Berkeley): 1,600+ annotated traces, 14 unique failure modes, kappa=0.88 inter-annotator agreement. Key finding: improvement headrooms from better MAS design are substantial.
- **Zalando**: 2+ years of AI-powered postmortem analysis across 5 datastore types. Strategic insights that manual review misses.

### Semantic Codebase Models (Q21)

- **Theory of Code Space** (Feb 2026): F1 range 0.129-0.646 for architectural understanding. Even frontier models struggle to maintain coherent architectural beliefs during exploration.
- **Roam-code**: Pre-indexes into semantic graphs with architectural governance through budget gates. 94 commands, 26 languages. Can enforce constraints like "this module must never call that service directly."
- **Serena MCP**: Symbol-level navigation via LSP across 30+ languages. Token-efficient.
- **Code-Graph-RAG**: Multi-repository knowledge graphs with UniXcoder embeddings and cross-repo connection discovery.

### Orchestrator Meta-Context (Q22)

- **AOI**: 72.4% context compression, 92.8% critical information retention, O(log t) memory growth. Three-layer memory: Working, Episodic, Semantic.
- **Google Context Engineering Whitepaper** (70 pages, Nov 2025): Definitive taxonomy. "The true intelligence of an agent doesn't come from the model -- it comes from how context is managed."
- **Codified Context**: 108K LOC built in 70 days by single developer with tiered architecture (hot constitution + specialist agents + cold knowledge base). 29% runtime reduction, 17% output token reduction.
- **Ralph Orchestrator finding**: MCP servers alone can consume 100K tokens (half Claude Code's window) before first prompt. Some users at 175% of context capacity before first interaction.

### Architectural Patterns for Knowledge Compounding

1. **Three-Layer Memory Stack**: Working (ephemeral, per-task) -> Episodic (session-scoped, per-project) -> Semantic (permanent, cross-project)
2. **Experience Loop**: Execute -> Record -> Reflect -> Extract -> Store -> Transfer -> Apply (with feedback loop for prevention)
3. **Skill Handbook**: Persistent registry of agent skill profiles, failure catalogs, and agent selection policies that evolve with accumulated data
4. **Semantic Architecture Graph**: Per-project graph with cross-project transferable patterns, constraints, and governance rules
5. **Context Budget Strategy**: 10-20K strategic (always loaded) + 50-100K tactical (per-task) + 30-50K tool/MCP overhead + 30-50K reasoning reserve

---

## Actionable Insights

1. **Start a failure catalog now**: After each agent failure, append to `_bmad/failure-catalog.json` with agent role, task type, MAST error category, resolution, and prevention rule. Load at task assignment time.

2. **Track agent performance profiles**: Record success/failure rates per agent role per task type in `_bmad/agent-profiles.json`. Use for smarter agent assignment across sessions.

3. **Build a convention library**: Extract coding conventions, architectural decisions, and testing patterns from completed projects into transferable `_bmad/conventions/` templates.

4. **Implement AOI-style context budgeting**: Strategic context (5-10% of window, always loaded) vs tactical context (25-50%, rotating). Compress at 80% utilization, not 95%.

5. **Store experience in natural language**: MUSE proves that natural language experience is LLM-agnostic and transfers across models. Don't use structured schemas for experience -- use prose.

6. **Integrate Roam-code or Serena MCP**: Pre-index project architecture for constraint enforcement. These are production-ready tools that provide the semantic layer agents need.

7. **The integration is the opportunity**: AgentRR (recording) + AgentDebug (classification) + Langfuse (tracing) + CER (learning) + SkillOrchestra (transfer) need to be connected into a single pipeline. First to do this has a permanent compounding advantage.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/scaling-economics.md](../reference/scaling-economics.md) | Knowledge compounding reduces per-project costs through transfer |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | "Context is the highest leverage" principle; hook-based observability enables the record phase |
| [practitioners/elvis-sun.md](../practitioners/elvis-sun.md) | Obsidian vault for business context + failure-aware respawning = partial knowledge compounding |
| [reference/observability-trust-kpis.md](../reference/observability-trust-kpis.md) | Observability infrastructure provides the recording substrate for post-mortem replay |
| [reference/autonomy-horizon-self-healing.md](../reference/autonomy-horizon-self-healing.md) | Agent drift and failure modes that knowledge compounding aims to prevent |
| [reference/infrastructure-breaking-points.md](../reference/infrastructure-breaking-points.md) | Context degradation (Rank 2 failure) directly addressed by meta-context management |
