# Dash

> **Self-learning data agent that grounds its answers in 6 layers of context. Inspired by OpenAI's in-house implementation.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [github.com/agno-agi/dash](https://github.com/agno-agi/dash) |
| GitHub Stars | 1,761 (as of 2026-03-08) |
| Publisher | Agno (startup, formerly Phidata) |
| License | Apache-2.0 |
| Tech Stack | Python 3.12+, FastAPI, PostgreSQL, pgvector, SQLAlchemy, Agno SDK, OpenAI API, MCP |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *(Space for personal observations)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | Data analyst agent, not multi-agent orchestration — different problem domain. The self-learning pattern is interesting but tied to text-to-SQL, not code generation or business orchestration. |
| **Novelty** | 5/10 | The 6-layer context grounding and dual knowledge/learnings system is a clean formalization of patterns we already implement via CLAUDE.md + state files + memory. The "GPU-poor continuous learning" (no retraining) concept is validated independently here. |
| **Actionable** | 5/10 | The dual-knowledge-store pattern (static curated vs. dynamic discovered) is directly adaptable to our agent error recovery. The semantic model + business rules context injection pattern is a clean reference for how we structure agent instructions. |

---

## Overview

Dash is an open-source data agent built on the Agno SDK that converts natural language questions into SQL queries, returning business insights rather than raw data tables. It was explicitly inspired by [OpenAI's internal data agent blog post](https://openai.com/index/inside-our-in-house-data-agent/) and attempts to replicate the key insight: text-to-SQL systems fail because they lack semantic understanding of schemas, not because the LLM is bad at SQL.

The core innovation is the "6 layers of context" architecture. Rather than dumping a schema into a prompt and hoping for the best, Dash assembles context from six progressively more dynamic sources: table metadata, human-annotated business rules, validated SQL query patterns, external institutional knowledge (via MCP), automatically discovered error patterns (the "Learning Machine"), and live runtime schema introspection. Each layer addresses a specific failure mode of naive text-to-SQL.

The project ships as a Docker-composed FastAPI application with PostgreSQL (pgvector for embeddings) as the backing store. It includes an F1 racing dataset as a sample domain, a three-mode evaluation system (string matching, LLM grading, golden SQL comparison), and connects to the Agno cloud platform (os.agno.com) for a web interface. The codebase is compact (~39 commits, 174KB) and serves primarily as a reference implementation for the Agno SDK's learning capabilities.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Query (NL)                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  DASH AGENT                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │         6 LAYERS OF CONTEXT                 │    │
│  │                                             │    │
│  │  L1: Table Metadata (knowledge/tables/*.json)│   │
│  │  L2: Business Rules (knowledge/business/*.json)│ │
│  │  L3: Query Patterns (knowledge/queries/*.sql)│   │
│  │  L4: Institutional Knowledge (Exa MCP)      │    │
│  │  L5: Learnings (LearningMachine, pgvector)  │    │
│  │  L6: Runtime Schema (introspect_schema tool)│    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────┐  ┌──────────────────────────┐    │
│  │   KNOWLEDGE  │  │      LEARNINGS           │    │
│  │   (static)   │  │      (dynamic)           │    │
│  │              │  │                          │    │
│  │  Curated     │  │  Error patterns          │    │
│  │  schemas,    │  │  Type gotchas            │    │
│  │  validated   │  │  User corrections        │    │
│  │  queries,    │  │  Auto-discovered fixes   │    │
│  │  biz rules   │  │                          │    │
│  └──────┬───────┘  └──────────┬───────────────┘    │
│         │    PostgreSQL       │                     │
│         └──────(pgvector)─────┘                     │
│                                                     │
│  Tools: SQLTools, introspect_schema,               │
│         save_validated_query, MCPTools (Exa)        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           FastAPI + AgentOS Web Interface            │
└─────────────────────────────────────────────────────┘
```

**Key technical details:**

- **Agent runtime**: Built on `agno.agent.Agent` with `OpenAIResponses` model (GPT-5.2). The Agno SDK handles tool calling, memory, and learning machine orchestration.
- **Dual knowledge stores**: Both backed by PostgreSQL with pgvector embeddings. `dash_knowledge` holds curated content (table schemas, validated queries, business rules loaded from JSON/SQL files). `dash_learnings` holds dynamically discovered patterns via the `LearningMachine` with `LearningMode.AGENTIC`.
- **Context injection**: Layers 1-2 are injected directly into the system prompt as formatted strings (`SEMANTIC_MODEL_STR`, `BUSINESS_CONTEXT`). Layer 3 is loaded into the vector knowledge base. Layer 4 uses MCP (Exa API). Layer 5 is searched via `search_learnings`. Layer 6 is a runtime SQLAlchemy `inspect()` tool.
- **Self-learning loop**: When a SQL query fails (e.g., type mismatch), the agent calls `introspect_schema` to inspect the actual column types, fixes the query, and calls `save_learning` to persist the pattern. Future queries automatically retrieve relevant learnings via vector search.
- **Eval system**: `dash/evals/` contains test cases with expected strings and optional golden SQL. Three modes: string matching (default), LLM-based grading (`-g`), and result comparison against golden SQL output (`-r`).

---

## Publisher Background

**Agno** (formerly Phidata) is a VC-backed startup focused on agentic AI infrastructure. Their flagship product is the `agno` SDK (38,500 stars on GitHub), which bills itself as "the programming language for agentic software." The org has 57 public repos, 1,635 followers, and has been active since May 2022. They maintain a managed platform at agno.com and os.agno.com.

Other notable repos: `agno` (38.5K stars, the core SDK), `claude-os` (24 stars), `ai-cookbook` (65 stars), `phidata-docs` (51 stars). The organization is well-resourced and actively maintained. Dash is clearly a reference implementation / showcase for the Agno SDK's learning capabilities rather than a standalone product.

The "inspired by OpenAI's in-house data agent" positioning is legitimate — OpenAI published a detailed blog post about their internal data agent, and Dash implements several of the described patterns (contextual grounding, self-learning, insight generation over raw results).

---

## What's Valuable for Us

1. **Dual Knowledge Store Pattern** — The clean separation of `knowledge` (static, curated, human-authored) vs. `learnings` (dynamic, agent-discovered, error-driven) is a directly transferable pattern. Our orchestrator state files (`_bmad/orchestrator-state.json`) serve a similar purpose, but we don't have an equivalent of the automatic `save_learning` mechanism for persisting agent-discovered fixes. This maps to Master Blueprint Principle 1 ("the orchestration layer is the compounding asset") — learnings compound across sessions.

2. **6-Layer Context Assembly** — The explicit layering of context from most-static to most-dynamic is a clean formalization. Our current approach injects context via CLAUDE.md, `.claude/agents/`, and state files, but we haven't formalized the layers. The pattern of injecting structured metadata (Layers 1-2) directly into the system prompt while using vector search (Layer 3) and runtime tools (Layer 6) for dynamic content is sound architecture.

3. **Semantic Model as Code** — `dash/context/semantic_model.py` and `dash/context/business_rules.py` show how to load structured JSON metadata and format it for prompt injection. The `data_quality_notes` field in table metadata and `common_gotchas` in business rules are patterns we could adopt for documenting agent pitfalls.

4. **Eval Framework** — The three-mode evaluation system (string matching / LLM grading / golden result comparison) in `dash/evals/` is a clean reference for building agent evaluation pipelines.

---

## What's NOT Relevant

1. **OpenAI lock-in** — Dash requires `OPENAI_API_KEY` and uses `OpenAIResponses(id="gpt-5.2")`. Our architecture uses Claude exclusively. The Agno SDK presumably supports other models, but Dash is hardcoded to OpenAI. This conflicts with our model stack.

2. **Text-to-SQL focus** — The entire system is purpose-built for natural language to SQL translation. Our agents write code, manage orchestration, and handle business operations — not data analytics. The domain-specific patterns (schema introspection, SQL validation, F1 dataset) are not transferable.

3. **PostgreSQL + pgvector infrastructure** — Dash requires PostgreSQL with pgvector for both knowledge stores. This conflicts with Master Blueprint Principle 7 ("build only what you have needed") and our zero-infra approach. We use JSON state files and git for persistence.

4. **Agno SDK dependency** — The agent is tightly coupled to the Agno SDK (`agno.agent.Agent`, `agno.learn.LearningMachine`, `agno.tools.*`). We would only extract patterns, never the actual implementation.

5. **Single-agent architecture** — Dash is a single agent with tools, not a multi-agent system. No coordination, no task routing, no agent lifecycle management. This is fundamentally different from our orchestration problem.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: The dual knowledge/learnings pattern could inform how we build persistent agent memory that survives across sessions. When our coding agents repeatedly hit the same lint errors or test failures, a `save_learning` mechanism would prevent repeated mistakes.
- **Phase 3 (Days 60-90)**: If we build a Finance Agent data analysis capability or client reporting system, Dash's context-grounding patterns would be directly applicable as a reference architecture.
- **Phase 4 (Days 90+)**: The eval framework pattern (string matching + LLM grading + golden comparison) could become the basis for agent quality benchmarking across business lines.

---

## Key Takeaway

> **Dash's dual knowledge store (curated vs. discovered) and 6-layer context assembly are clean patterns for agent learning-that-compounds, but the tool itself is a single-purpose text-to-SQL agent with OpenAI lock-in — reference the architecture, don't adopt the code.**
