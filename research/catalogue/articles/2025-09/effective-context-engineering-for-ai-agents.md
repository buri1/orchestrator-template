# Effective Context Engineering for AI Agents

> **Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield — Anthropic Engineering Blog, 2025-09-29**

| Field | Value |
|-------|-------|
| Source | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents |
| Author | Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield (Anthropic Applied AI) |
| Publication | Anthropic Engineering Blog |
| Date | 2025-09-29 |
| Topics | context engineering, agent architecture, compaction, sub-agents, just-in-time retrieval, attention budget, tool design |
| Read Time | ~20 min |

---

## Burak's Notes

> *Deep dive candidate from Tool Search API article. Anthropic's official guide on context engineering for agents -- the theoretical foundation behind Claude Code's architecture. Directly validates our compaction, sub-agent, and structured note-taking patterns. The "attention budget" framing and context rot research are key mental models.*

---

## Key Takeaways

1. **Context engineering > prompt engineering** -- As agents run in loops generating ever-expanding data, the challenge shifts from writing good prompts to strategically curating the entire token set available at each inference step. The guiding principle: "find the smallest set of high-signal tokens that maximize the likelihood of your desired outcome."

2. **Context rot is real and measurable** -- Research shows LLMs have a finite "attention budget" analogous to human working memory. As token count increases, accuracy in recalling context information degrades. The transformer's n-squared pairwise attention relationships get "stretched thin" at longer contexts, creating a performance gradient rather than a hard cliff.

3. **Three mechanisms for long-horizon autonomy** -- Compaction (summarize + reinitiate), structured note-taking (persistent external memory like todo.md), and sub-agent architectures (parallel exploration with condensed summaries of 1-2K tokens from 10K+ token explorations). These are not alternatives -- they compose.

4. **Just-in-time retrieval beats pre-computed RAG** -- Rather than stuffing context with pre-retrieved data, agents should maintain lightweight identifiers and dynamically load data at runtime. Claude Code exemplifies this: CLAUDE.md loaded upfront, but glob/grep for everything else. This "effectively bypasses the issues of stale indexing and complex syntax trees."

5. **Tool design determines agent quality** -- Tools must be self-contained, robust to error, and extremely clear. "If a human engineer can't definitively say which tool should be used in a given situation, an AI agent can't be expected to do better." Bloated toolsets with overlapping functionality are a common failure mode.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Anthropic's official guide to the exact problem our orchestrator solves. Every section maps directly to L-Thread patterns: compaction = our handoff scripts, sub-agents = our tmux agent spawning, structured notes = our state JSON files, tool design = our MCP tool curation. |
| **Actionable** | 9/10 | Concrete patterns: tune compaction prompts for recall-first-then-precision, use tool result clearing to free context, implement progressive disclosure via metadata-first exploration, cap sub-agent output at 1-2K tokens. The "Goldilocks zone" for system prompts is immediately applicable to our agent prompts. |

---

## Summary

This article from Anthropic's Applied AI team establishes "context engineering" as the successor discipline to prompt engineering. While prompt engineering focused on crafting effective instructions, context engineering encompasses the strategic curation of ALL tokens available to an LLM during inference -- system prompts, tools, MCP connections, external data, and message history.

The theoretical foundation rests on two key insights. First, LLMs possess a finite "attention budget" analogous to human working memory. Research on "context rot" shows that as token count increases, models lose accuracy in recalling information. The transformer architecture's n-squared pairwise attention relationships degrade at scale, creating a performance gradient. Second, this means context must be treated as a precious finite resource with diminishing marginal returns -- every token added costs attention capacity somewhere else.

The article then provides practical guidance for three key context components. System prompts need the "right altitude" -- a Goldilocks zone between brittle hardcoded logic and vague high-level guidance. Tools should be self-contained, unambiguous, and token-efficient, with bloated overlapping toolsets identified as a common failure mode. Few-shot examples are described as "pictures worth a thousand words" for LLMs.

For runtime context retrieval, the authors advocate a shift from pre-computed RAG toward "just-in-time" strategies where agents maintain lightweight identifiers and dynamically load data using tools. Claude Code exemplifies this hybrid approach: CLAUDE.md files loaded upfront for speed, while glob and grep primitives enable runtime file discovery, "effectively bypassing the issues of stale indexing and complex syntax trees." Metadata (file names, folder hierarchies, timestamps) enables "progressive disclosure" -- incremental context discovery through exploration.

For long-horizon tasks spanning minutes to hours, three complementary mechanisms are presented: (1) Compaction -- summarizing conversation history while preserving architectural decisions and implementation details, retaining the five most recently accessed files; (2) Structured note-taking -- agents writing persistent external memory (todo lists, NOTES.md files), exemplified by Claude Playing Pokemon maintaining precise tallies across thousands of game steps; (3) Sub-agent architectures -- specialized agents with clean context windows exploring extensively (10K+ tokens) but returning condensed summaries (1-2K tokens) to a coordinating lead agent.

---

## Notable Quotes

> "Context engineering is the art and science of curating what will go into the limited context window."

> "Find the smallest set of high-signal tokens that maximize likelihood of your desired outcome."

> "LLMs, like humans, lose focus or experience confusion at a certain point."

> "Context, therefore, must be treated as a finite resource with diminishing marginal returns."

> "The right altitude strikes a balance: specific enough to guide behavior effectively, yet flexible enough to provide strong heuristics."

> "If a human engineer can't definitively say which tool should be used, an AI agent can't be expected to do better."

> "For an LLM, examples are the 'pictures' worth a thousand words."

> "Progressive disclosure allows agents to incrementally discover relevant context through exploration."

> "Do the simplest thing that works."

> "Treating context as a precious, finite resource will remain central to building reliable, effective agents."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.anthropic.com/engineering/writing-tools-for-agents | Anthropic's companion guide on tool design for agents -- directly extends the tool design section of this article | `/ingest-article` |
| https://www.anthropic.com/research/building-effective-agents | Anthropic's foundational agent architecture guide -- the predecessor to this article | `/ingest-article` |
| https://www.anthropic.com/engineering/multi-agent-research-system | Anthropic's multi-agent research system design -- validates sub-agent patterns discussed here | `/ingest-article` |
| https://research.trychroma.com/context-rot | Context rot research -- the empirical foundation for the "attention budget" concept | `/ingest-article` |
| https://www.anthropic.com/news/context-management | Context management feature announcement (tool result clearing) | `/ingest-article` |
| https://platform.claude.com/cookbook/tool-use-memory-cookbook | Memory and context management cookbook -- practical implementation guide | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary example throughout -- exemplifies just-in-time retrieval, compaction, progressive disclosure, hybrid context strategy | Not as standalone entry (referenced in many entries) |
| Model Context Protocol (MCP) | Listed as part of the context universe agents must manage | Referenced across catalogue (protocols, tools) |
| Sonnet 4.5 | Mentioned in context of memory tool launch | No |
| Claude Developer Platform | Memory tool and tool result clearing feature launched here | No |
| Claude Playing Pokemon | Case study for structured note-taking -- agent maintains precise tallies across thousands of game steps | No |
| CLAUDE.md | Example of upfront-loaded context in hybrid retrieval strategy | Yes -- [AGENTS.md](../agent-protocols/agents-md.md) covers the convention |

---

## Action Items

- [ ] Review our compaction prompts against the recall-first-then-precision methodology described here
- [ ] Implement tool result clearing in our agent loops (recently launched as Claude Developer Platform feature)
- [ ] Audit our agent tool definitions against the "Goldilocks zone" and unambiguity criteria
- [ ] Cap sub-agent output summaries at 1-2K tokens as recommended
- [ ] Ingest the 3 companion Anthropic articles (writing tools, building effective agents, multi-agent research system)
- [ ] Investigate the Chroma "context rot" research for empirical benchmarks on attention budget degradation
