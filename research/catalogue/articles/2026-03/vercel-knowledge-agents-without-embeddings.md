# Build Knowledge Agents Without Embeddings

> **Ben Sabic & Hugo Richard — Vercel Engineering Blog, March 19, 2026**

| Field | Value |
|-------|-------|
| Source | https://vercel.com/blog/build-knowledge-agents-without-embeddings |
| Author | Ben Sabic & Hugo Richard (Vercel) |
| Publication | Vercel Engineering Blog |
| Date | 2026-03-19 |
| Topics | knowledge-agents, filesystem-search, embeddings-alternative, AI SDK, Chat SDK, Vercel Sandbox, multi-platform-agents |
| Read Time | 8 min |

---

## Burak's Notes

> *Filesystem-first retrieval is exactly what our orchestrator already does -- agents grep/find/cat through codebases rather than querying vector stores. Vercel productizing this pattern into a deployable template validates the approach. The complexity router (fast model for simple Qs, powerful for complex) maps to our tiered model routing. Chat SDK's adapter pattern for multi-platform deployment is worth tracking for the OmniPort bot layer.*

---

## Key Takeaways

1. **Filesystem beats embeddings for knowledge agents** — Replacing a vector DB + chunking pipeline with bash commands (grep, find, cat) in an isolated sandbox reduced costs by 75% ($1.00 to $0.25/call) while improving output quality and debuggability. Embeddings create "silent failure modes" with untraceable reasoning.

2. **LLMs are native filesystem navigators** — Models have been trained on massive codebases; they already know how to navigate directories, grep through files, and manage state. Giving them filesystem access leverages existing capabilities rather than adding an abstraction layer (embeddings) they weren't trained on.

3. **Deterministic retrieval > semantic similarity** — When you need a specific value from structured data, embedding-based semantic similarity falls short. Filesystem commands produce deterministic, explainable, reproducible results. Debugging means tracing exact commands, not analyzing opaque embedding scores.

4. **One agent, every platform via adapter pattern** — Chat SDK enables deploying a single agent across web, GitHub, Discord, Slack, Teams, and Google Chat through platform-specific adapters. Agent logic stays unchanged; only authentication and event formats differ per platform.

5. **Smart complexity routing saves cost** — The @savoir/sdk classifies incoming questions by complexity and routes to appropriate models (cheap/fast for simple, powerful for complex) via Vercel AI Gateway. This is automatic model tiering without manual configuration.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Validates our filesystem-first agent architecture; we already use grep/find/cat as primary tools. The multi-platform adapter pattern is interesting for future bot deployments. Complexity routing maps to our model tiering aspirations. |
| **Actionable** | 5/10 | We already do filesystem search natively. The Chat SDK adapter pattern is adoptable if we build customer-facing bots. The template itself is Vercel-locked but the architectural pattern is universal. |

---

## Summary

Vercel's engineering team argues that the standard knowledge agent architecture -- vector database + embedding model + chunking pipeline -- creates unnecessary complexity and "silent failure modes" where agents confidently return wrong information without traceable reasoning. Their alternative: give agents filesystem access and bash commands inside an isolated sandbox (Vercel Sandbox).

The approach works because LLMs have been trained on massive amounts of code and already understand how to navigate directories, grep through files, and manage state across complex codebases. By storing knowledge as files in a snapshot filesystem and letting agents use bash/grep/find/cat as tools, retrieval becomes deterministic, explainable, and debuggable. When an agent gives a wrong answer, you can trace the exact commands it executed rather than trying to interpret embedding similarity scores.

Their Knowledge Agent Template packages this into a deployable product: sources are added via an admin interface, stored in Postgres, synced via Vercel Workflow to a snapshot repository, then loaded into Vercel Sandbox when agents search. The template ships with Chat SDK for multi-platform deployment (web, GitHub bot, Discord bot, Slack, Teams) and @savoir/sdk for integrating the knowledge base into any AI SDK-powered agent. A built-in complexity router automatically classifies questions and routes to appropriate models.

The practical result: their sales call summarization agent went from ~$1.00 to ~$0.25 per call (75% cost reduction) with improved output quality after replacing the embedding pipeline with filesystem access.

---

## Notable Quotes

> "Most knowledge agents start the same way. You pick a vector database, then build a chunking pipeline."

> "The embedding stack works for semantic similarity, but it falls short when you need a specific value from structured data."

> "Results are deterministic, explainable, and fast."

> "LLMs already understand filesystems. They've been trained on massive amounts of code: navigating directories, grepping through files, managing state across complex codebases."

> "You don't need a vector database, an embedding model, or a chunking pipeline to build a working knowledge agent. You need a filesystem, bash, and a way to put your agent where your users already are."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash | Deeper technical dive on filesystem-based agents (the sales call agent that proved 75% cost reduction) | DONE -- [ingested](./vercel-agents-filesystems-bash.md) |
| https://chat-sdk.dev | Multi-platform agent deployment SDK with adapter pattern | Bookmark |
| https://ai-sdk.dev | Vercel's AI SDK — LLM integration framework | Bookmark |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Vercel Sandbox | Isolated execution environment for filesystem agent operations | No |
| AI SDK | LLM integration framework powering the agent | No |
| Chat SDK | Multi-platform chat deployment with adapter pattern (Slack, Discord, GitHub, Teams, Google Chat) | No |
| Vercel Workflow | Content synchronization from sources to snapshot repository | No |
| @savoir/sdk | SDK to connect any AI SDK agent to the knowledge base | No |
| Vercel AI Gateway | Model provider abstraction enabling complexity routing | No |

---

## Action Items

- [ ] Track Chat SDK adapter pattern for future OmniPort bot deployment (Telegram, Discord)
- [x] Evaluate Vercel's filesystem agent blog post for deeper technical patterns — [ingested](./vercel-agents-filesystems-bash.md)
- [ ] Consider complexity routing pattern for our model tiering (cheap model for simple queries, Opus for complex)
