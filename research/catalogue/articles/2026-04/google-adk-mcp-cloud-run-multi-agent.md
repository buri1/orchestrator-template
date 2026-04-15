# Build a Multi-Agent System for Expert Content with Google ADK, MCP, and Cloud Run

> **Google Cloud Blog — Developers & Practitioners, 2026-04-12**

| Field | Value |
|-------|-------|
| Source | https://cloud.google.com/blog/topics/developers-practitioners/build-a-multi-agent-system-for-expert-content-with-google-adk-mcp-and-cloud-run-part-1 |
| Author | Google Cloud (Developers & Practitioners) |
| Publication | Google Cloud Blog |
| Date | 2026-04-12 |
| Topics | Google ADK, MCP, Cloud Run, multi-agent orchestration, Vertex AI Memory Bank, serverless agent deployment, content generation pipeline |
| Read Time | 15 min (Part 1 of 4-part series) |
| Series | Part 1: Tools & Capabilities · Part 2: Multi-Agent Architecture & Long-Term Memory · Part 3: Local Testing · Part 4: Production Deployment |

---

## Burak's Notes

> *This is Google's reference implementation for their ADK + MCP + Cloud Run triad. The architecture mirrors our orchestrator pattern almost exactly: a Root Orchestrator that delegates to specialist agents (Reddit Scanner, GCP Expert, Blog Drafter) in a sequential pipeline. The key insight is McpToolset as a universal adapter — it wraps any MCP server into a plug-and-play module with a common interface, decoupling integration from intelligence. That's the same principle behind our worker agents receiving tools via prompts. The dual-layered memory system (short-term state transfer between agents + Vertex AI Memory Bank for long-term persistence) is directly relevant for orchestrator session continuity across compactions. Cloud Run as serverless agent host is interesting but we get the same isolation cheaper with tmux + worktrees.*

---

## Key Takeaways

1. **Root Orchestrator + Specialist Agents Pattern** — The system ("Dev Signal") uses a Root Orchestrator that manages three specialist agents: a Reddit Scanner for trend discovery, a GCP Expert for technical grounding, and a Blog Drafter for content creation. The orchestrator serves as the system's strategist — at conversation start, it retrieves memory to establish context (past interests, preferred topics, previous projects) before delegating to specialists. This is a sequential agent transfer pattern, not parallel fan-out.

2. **MCP as Universal Tool Abstraction via McpToolset** — Google ADK's `McpToolset` class acts as a universal wrapper that standardizes connections to any MCP-compliant server. Complex API logic (Reddit API, Google Cloud documentation search, image generation) is abstracted into simple plug-and-play modules. The critical design principle: tools share a common interface that **decouples integration from intelligence**. The agent doesn't need to know API specifics — it only sees MCP tool descriptions and invokes them by name.

3. **Three MCP Toolsets for Three Capabilities** — The system configures three distinct MCP servers: (1) a Reddit MCP server as a bridge to the Reddit API for discovering trending posts and analyzing engagement, (2) the Google Cloud Developer Knowledge MCP Server for grounding answers in official documentation, and (3) a custom Nano Banana MCP server for multimodal image generation. Each capability is a separate, independently deployable MCP server.

4. **Dual-Layered Memory: Short-Term State + Long-Term Persistence** — Short-term state uses an `add_info_to_state` function that serves as working memory, allowing the GCP Expert to reliably hand off findings to the Blog Drafter within the same session. Long-term memory uses Vertex AI Memory Bank with two built-in ADK tools: `PreloadMemoryTool` (proactively brings in context at session start) and `LoadMemoryTool` (fetches specific memories on demand). This enables the agent to learn from feedback and remember writing styles across conversations.

5. **Cloud Run as Serverless Agent Host** — MCP servers deploy as containerized services on Cloud Run with authentication enforcement (OIDC tokens, `--no-allow-unauthenticated`). Cloud Run provides serverless scaling — no infrastructure management, automatic scale-to-zero, and secure inter-service communication. The entire multi-agent system was built and deployed in two days.

6. **GCP Expert as "Technical Authority" Pattern** — The GCP Expert agent triangulates facts by synthesizing three sources: official documentation (Google Cloud Developer Knowledge MCP), community sentiment (Reddit), and broader context (Google Search). This multi-source triangulation pattern produces more reliable technical content than single-source retrieval.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Root Orchestrator + specialist agents pattern validates our architecture; MCP-as-universal-adapter is directly applicable; but the content generation use case is tangential to our DevOps orchestration focus |
| **Actionable** | 5/10 | McpToolset wrapper pattern for standardizing tool access is adoptable; dual-layered memory (short-term state transfer + long-term persistence) maps to our compaction/session-continuity problem; Cloud Run deployment model is less relevant since we use tmux + worktrees |
| **Novelty** | 4/10 | Well-executed reference implementation of known patterns (orchestrator + specialists, MCP for tools, serverless hosting); the memory architecture is the most novel contribution |

---

## Summary

Google's "Dev Signal" project is a four-part reference implementation demonstrating how to build a production multi-agent system using three core Google technologies: the Agent Development Kit (ADK) for agent orchestration, the Model Context Protocol (MCP) for standardized tool integration, and Cloud Run for serverless deployment.

The system's purpose is to automate technical blog creation: it scans Reddit for trending questions, researches answers using official Google Cloud documentation, and drafts detailed technical blog posts with generated images. While the use case is content generation, the architectural patterns are broadly applicable.

Part 1 focuses on establishing agent capabilities through MCP. Three separate MCP servers provide distinct capabilities: Reddit API access for trend discovery, Google Cloud documentation search for technical grounding, and a custom Nano Banana server for image generation. The ADK's `McpToolset` class wraps each MCP server into a uniform interface, so agents interact with all tools through the same abstraction regardless of the underlying API complexity. This is the article's core architectural insight: MCP decouples the "what tools can do" from "how tools work," allowing agents to focus purely on intelligence and decision-making.

Part 2 introduces the multi-agent architecture. A Root Orchestrator manages three specialist agents (Reddit Scanner, GCP Expert, Blog Drafter) in a sequential pipeline. The orchestrator retrieves user memory at conversation start, then delegates tasks to specialists in sequence. Short-term state transfer between agents uses an explicit function (`add_info_to_state`) that acts as working memory within a session, while long-term memory uses Vertex AI Memory Bank with proactive preloading (`PreloadMemoryTool`) and on-demand retrieval (`LoadMemoryTool`). The session transcript and working memory are managed by Vertex AI Session Service.

The GCP Expert agent demonstrates a "triangulation" pattern: it synthesizes information from official docs, community sentiment, and web search to produce grounded technical answers. This multi-source verification is a pattern worth noting for any agent that needs factual reliability.

Parts 3 and 4 cover local testing and production deployment to Cloud Run, respectively. Cloud Run provides containerized, serverless hosting with built-in authentication, automatic scaling, and secure inter-service communication via OIDC tokens.

---

## Notable Quotes

> "The McpToolset abstracts away complex API logic into simple, plug-and-play modules, ensuring tools share a common interface that decouples integration from intelligence."

> "The GCP Expert serves as 'The Technical Authority,' triangulating facts by synthesizing official documentation, community sentiment from Reddit, and broader context from Google Search."

> "The add_info_to_state function serves as the agent's short-term working memory, allowing the gcp_expert to reliably hand off its detailed findings to the blog_drafter within the same session."

---

## Architecture

```
┌─────────────────────────────────────────────┐
│            Root Orchestrator                │
│  (strategist, memory retrieval, delegation) │
│                                             │
│  PreloadMemoryTool ←→ Vertex AI Memory Bank │
│  LoadMemoryTool   ←→ (long-term persistence)│
└──────────┬──────────┬──────────┬────────────┘
           │          │          │
    sequential agent transfer
           │          │          │
    ┌──────▼──┐ ┌─────▼────┐ ┌──▼──────────┐
    │ Reddit  │ │   GCP    │ │    Blog     │
    │ Scanner │ │  Expert  │ │   Drafter   │
    └────┬────┘ └────┬─────┘ └──────┬──────┘
         │          │ │             │
    ┌────▼────┐ ┌───▼─▼───┐ ┌──────▼──────┐
    │ Reddit  │ │GCP Docs │ │ Nano Banana │
    │MCP Srvr │ │MCP Srvr │ │  MCP Srvr   │
    └─────────┘ │+ Search │ │(img gen)    │
                └─────────┘ └─────────────┘
                    ▲
          McpToolset (universal wrapper)
```

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://cloud.google.com/blog/topics/developers-practitioners/multi-agent-architecture-and-long-term-memory-with-adk-mcp-and-cloud-run/ | Part 2: full multi-agent architecture + Vertex AI Memory Bank integration — the memory system is the most novel pattern | `/ingest-article` |
| https://google.github.io/adk-docs/tools-custom/mcp-tools/ | ADK official docs on MCP tool integration — McpToolset API reference | `/ingest-article` |
| https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/ | ADK launch announcement — framework design philosophy and multi-agent patterns | `/ingest-article` |
| https://codelabs.developers.google.com/codelabs/cloud-run/use-mcp-server-on-cloud-run-with-an-adk-agent | Hands-on codelab: deploy ADK agent with MCP server on Cloud Run — step-by-step implementation | `/ingest-article` |
| https://caseywest.com/building-scalable-ai-agents-a-deep-dive-into-decoupled-tools-with-adk-mcp-and-cloud-run/ | Deep dive on decoupled tool architecture with ADK+MCP+Cloud Run — likely has implementation insights | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Google ADK (Agent Development Kit) | Core agent orchestration framework; provides McpToolset, agent definitions, multi-agent management | Not yet catalogued |
| MCP (Model Context Protocol) | Universal tool integration layer; McpToolset wraps MCP servers into common interface | Protocol referenced in adjacent entries |
| Cloud Run | Serverless container platform for deploying MCP servers and agent hosts | Not yet catalogued |
| Vertex AI Memory Bank | Long-term memory persistence; PreloadMemoryTool + LoadMemoryTool for cross-session recall | Not yet catalogued |
| Vertex AI Session Service | Manages session transcripts and working memory for agent state transfer | Not yet catalogued |
| Reddit MCP Server | Bridge to Reddit API for trend discovery and engagement analysis | Not yet catalogued |
| Google Cloud Developer Knowledge MCP Server | Official GCP documentation search for technical grounding | Not yet catalogued |
| Nano Banana MCP Server | Custom MCP server for multimodal image generation | Not yet catalogued — project-specific |
| Gemini (implied) | Underlying LLM for agent reasoning (ADK default model) | Not yet catalogued |

---

## Action Items

- [ ] Study the `McpToolset` wrapper pattern for potential adoption — if we ever standardize tool access for workers, wrapping MCP servers into a uniform interface is the right abstraction
- [ ] Evaluate Vertex AI Memory Bank's dual-tool approach (PreloadMemoryTool + LoadMemoryTool) as a model for orchestrator session continuity — proactive context loading at session start maps directly to our compaction recovery flow
- [ ] Note the `add_info_to_state` pattern for explicit inter-agent state transfer — this is cleaner than relying on conversation context alone for handoffs between sequential agents
