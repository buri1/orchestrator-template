# Inside OpenAI's In-House Data Agent

> **Bonnie Xu, Aravind Suresh & Emma Tang — OpenAI Blog, 2026-01-30**

| Field | Value |
|-------|-------|
| Source | https://openai.com/index/inside-our-in-house-data-agent/ |
| Author | Bonnie Xu, Aravind Suresh, Emma Tang (Head of Data Infrastructure) |
| Publication | OpenAI Blog |
| Date | 2026-01-30 |
| Topics | data agents, context engineering, enterprise AI, SQL generation, six-layer context, MCP, Codex, internal tooling |
| Read Time | ~12 min |

---

## Burak's Notes

> *OpenAI's internal data agent "Aardvark" — context: user-provided relevance 7/10. The six-layer context architecture is the real takeaway here. The "Codex Enrichment" pattern (using an LLM to analyze pipeline code and extract metadata automatically) is a novel approach to the table discovery problem. Two engineers + 70% AI-written code in three months is a strong signal for the "solo builder" thesis. The "dumb guardrails" security model (inherit user permissions, restrict writes to temp schema) validates our deterministic-first approach.*

---

## Key Takeaways

1. **Six-Layer Context Architecture** — OpenAI engineered six distinct context layers (schema metadata, expert descriptions, Codex Enrichment, institutional knowledge, learning memory, live query fallback) to ground the agent in organizational reality. Curated, smaller context windows outperformed large, noisy ones.
2. **Two Engineers, 70% AI-Written Code, Three Months** — The entire production system serving 4,000+ employees was built by two engineers in ~3 months with 70% of the codebase written by Codex. Validates the solo/micro-team thesis for production agent systems.
3. **Codex Enrichment as Novel Pattern** — A daily async process where Codex inspects important data tables and their pipeline code, inferring dependencies, ownership, granularity, and join keys. "Meaning lives in code" — the enrichment layer extracts what schema metadata cannot.
4. **"Dumb Guardrails" Security Model** — Agent inherits user permissions via personal token, restricted to authorized data, writes only to temporary test schemas (periodically wiped), excluded from public channels. Simple deterministic rules over complex AI safety.
5. **Context Gap as Primary Failure Mode** — ~95% of production AI agents fail due to the "context gap" — the space between what AI knows and what humans know but haven't documented. Data governance is the unsexy prerequisite.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Enterprise data agent, not multi-agent orchestration — but the six-layer context architecture, "Codex Enrichment" pattern, and micro-team building approach are directly transferable to our system |
| **Actionable** | 6/10 | The context engineering patterns (curated > noisy, memory corrections, code-level enrichment) and the "dumb guardrails" security model are immediately applicable. The SQL/data-analysis domain is tangential |

---

## Summary

OpenAI built a bespoke internal data agent serving 4,000+ of its ~5,000 employees, enabling them to query 600 petabytes of data across 70,000 datasets using natural language. The agent, powered by GPT-5.2 (without fine-tuning), covers the full analytics workflow: discovering data, running SQL, and publishing notebooks and reports.

The core innovation is a six-layer context architecture. Beyond standard schema metadata, the system incorporates curated expert descriptions, institutional knowledge mined from Slack/Docs/Notion, a learning memory that stores corrections from prior conversations, and a live query fallback for when documentation is stale. The most novel layer is "Codex Enrichment" — a daily async process where Codex analyzes pipeline code to infer table dependencies, ownership, granularity, and join keys, persisting this metadata into a vector database.

The agent is available wherever employees already work: as a Slack agent, through a web interface, inside IDEs, in the Codex CLI via MCP, and directly in OpenAI's internal ChatGPT app through an MCP connector. The system was built by just two engineers in three months, with approximately 70% of its code written by AI (Codex itself).

Security follows a "dumb guardrails" model (Emma Tang's term): the agent inherits user permissions via personal tokens, can only access authorized data, is excluded from public channels, and write access is restricted to temporary test schemas that are periodically wiped. The system includes continuous evaluation using the Evals API, testing generated queries against golden SQL question-answer pairs with a deployment threshold of 80% accuracy and 70% consistency.

Internal estimates suggest two to four hours saved per query, with one test case reducing analysis time from 22 minutes to 1 minute 22 seconds. OpenAI emphasizes the system uses only publicly available APIs (Responses API, Evals API) and standard GPT-5.2 with no fine-tuning, meaning others "can definitely build this."

---

## Notable Quotes

> "Table discovery is the biggest problem with this agent." — Emma Tang, Head of Data Infrastructure

> "Meaning lives in code." — On the Codex Enrichment pattern extracting metadata from pipeline code

> "This is not sexy." — Emma Tang on data governance being the prerequisite for agent success

> "Dumping everything in degraded performance." — On curated, smaller context windows outperforming large, noisy ones

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://openai.com/index/openai-contract-data-agent/ | **INGESTED** — [Turning Contracts into Searchable Data at OpenAI](../2025-09/turning-contracts-into-searchable-data-openai.md) | Done |
| https://github.com/agno-agi/dash | Open-source "self-learning data agent" inspired by OpenAI's implementation — six layers of context grounding | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| GPT-5.2 | Foundation model powering the agent (no fine-tuning) | No — model, not tool |
| OpenAI Codex | Three roles: user access layer via MCP, code generation (70% of agent), daily Codex Enrichment process | Yes — [OpenAI Codex](../agent-harnesses/openai-codex.md) |
| MCP (Model Context Protocol) | Primary access protocol — agent available in Codex CLI via MCP connector | Yes — referenced across catalogue |
| OpenAI Responses API | Publicly available API used by the agent | No — API, not tool |
| OpenAI Evals API | Used for continuous evaluation against golden SQL pairs | No — API, not tool |
| OpenAI Frontier | Enterprise platform for building custom agents; signed McKinsey, BCG, Accenture, Capgemini | No — not yet catalogued |
| Slack | Integration point — agent operates as Slack agent | No — commodity tool |
| Notion | Part of institutional knowledge layer (Slack, Docs, Notion) | No — commodity tool |
| Dash (agno-agi/dash) | Open-source agent inspired by this implementation | No — not yet catalogued, consider `/tool-catalogue` |

---

## Action Items

- [ ] Study the six-layer context architecture for applicability to our orchestrator's agent context management
- [ ] Evaluate the "Codex Enrichment" pattern — could a similar async process enrich our catalogue/research docs with LLM-extracted metadata?
- [ ] Apply the "dumb guardrails" security model (inherit permissions, restrict writes) to our DSGVO-compliant agent architecture
- [ ] Note the "curated < noisy" finding for context engineering — validates our approach of structured catalogue entries over raw doc dumps
- [ ] Investigate Dash (agno-agi/dash) as an open-source reference implementation
