# Introducing Advanced Tool Use on the Claude Developer Platform

> **Bin Wu (with Adam Jones, Artur Renault, Henry Tay, Jake Noble, Nathan McCandlish, Noah Picard, Sam Jiang, and the Claude Developer Platform team) — Anthropic Engineering Blog, November 24, 2025**

| Field | Value |
|-------|-------|
| Source | https://www.anthropic.com/engineering/advanced-tool-use |
| Author | Bin Wu + Claude Developer Platform team |
| Publication | Anthropic Engineering Blog |
| Date | 2025-11-24 |
| Topics | tool use, context engineering, token optimization, programmatic tool calling, tool search, agent engineering |
| Read Time | ~14 min |

---

## Burak's Notes

> *Deep dive candidate from the Tool Search API article. This is the original announcement that introduced all three advanced tool use features. The Tool Search Tool article (2026-03) and RLanceMartin PTC post (2026-02) are follow-ups that go deeper on individual features. This article is the comprehensive overview.*

---

## Key Takeaways

1. **Three features solve three distinct bottlenecks** — Tool Search Tool tackles context bloat from tool definitions (85% token reduction), Programmatic Tool Calling eliminates intermediate result pollution (37% token savings + 19+ inference passes saved), and Tool Use Examples fix parameter ambiguity (72% to 90% accuracy jump). Each targets a different failure mode; layer them based on your biggest bottleneck.

2. **Tool definitions alone can consume 134K tokens** — Anthropic observed real production systems where tool definitions consumed 134K tokens before the agent even read a request. A 5-server MCP setup (GitHub, Slack, Sentry, Grafana, Splunk) burns 55K tokens on definitions alone. Adding Jira pushes past 100K. The `defer_loading: true` flag keeps tools out of context until explicitly searched.

3. **Programmatic Tool Calling is the code-as-composition-layer pattern** — Instead of individual API round-trips (each requiring full inference), Claude writes Python that orchestrates tools, processes results in a sandbox, and returns only the final output to context. A 20-person expense audit drops from 200KB of raw data to 1KB of results. This is the same insight as the RLanceMartin post: tools as control surface, code as composition layer.

4. **Tool Use Examples teach through demonstration, not schema** — JSON Schema can express types and required fields but cannot express conventions (date formats, ID patterns, when to include optional fields). 1-5 realistic examples per tool dramatically improve parameter accuracy. The three-example ticket pattern (critical bug with full escalation, feature request with reporter only, internal task with title only) teaches inclusion patterns implicitly.

5. **Accuracy benchmarks are substantial** — Tool Search Tool improved Opus 4.0 from 49% to 74% and Opus 4.5 from 79.5% to 88.1%. Programmatic Tool Calling improved GIA benchmarks from 46.5% to 51.2%. Tool Use Examples improved complex parameter handling from 72% to 90%. These are production-meaningful gains.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly applies to our MCP-heavy orchestrator with 50+ tools across multiple servers; all three features are immediately actionable for L-Thread agents |
| **Actionable** | 9/10 | `defer_loading`, `allowed_callers: ["code_execution"]`, and `input_examples` are API flags we can enable today; the Tool Search article (already catalogued) has more implementation detail |

---

## Summary

Anthropic released three complementary beta features for the Claude Developer Platform that address the core scaling bottlenecks when agents work with large tool libraries.

**Tool Search Tool** solves the context bloat problem. Instead of loading all tool definitions into the prompt (which can consume 55K-134K tokens for real MCP setups), tools are marked with `defer_loading: true` and discovered on-demand via a search tool. Claude searches for relevant tools by name/description, and only the matching definitions enter context. This achieves an 85% token reduction while preserving full access to the tool library. It also improves tool selection accuracy significantly — Opus 4.0 jumped from 49% to 74% when similar tool names no longer competed for attention in a bloated context.

**Programmatic Tool Calling** solves the intermediate result pollution problem. Traditional agentic loops require a full inference pass for every tool call, and all intermediate results enter Claude's context window regardless of relevance. With PTC, Claude writes Python code that orchestrates multiple tool calls, processes outputs in a sandboxed environment, and returns only the final result to context. The article's budget compliance example is illustrative: querying 20 employees' expenses traditionally floods context with 2,000+ line items (200KB); with PTC, Claude writes a Python script that fetches, aggregates, and filters in the sandbox, returning only the 2-3 names that exceeded budget (1KB). This eliminates 19+ inference passes and saves 37% on tokens.

**Tool Use Examples** solve the parameter ambiguity problem. JSON Schema defines structure but cannot express usage patterns — date formats, ID conventions, when to include optional fields, how parameters correlate. By adding 1-5 realistic `input_examples` to tool definitions, Claude learns conventions by demonstration. The article shows a ticket API where three examples (critical bug, feature request, internal task) implicitly teach escalation patterns, ID formats (USR-XXXXX), date conventions (YYYY-MM-DD), and inclusion rules. This improved complex parameter handling accuracy from 72% to 90%.

The article recommends layering features based on your biggest bottleneck rather than enabling all three at once. All features are available via the `advanced-tool-use-2025-11-20` beta header.

---

## Notable Quotes

> "Agent tool definitions can sometimes consume 50,000+ tokens before an agent reads a request."

> "This represents an 85% reduction in token usage while maintaining access to your full tool library."

> "Production workflows involve messy data, conditional logic, and operations that need to scale."

> "The future of AI agents is one where models work seamlessly across hundreds or thousands of tools."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.anthropic.com/research/building-effective-agents | Anthropic's foundational agent engineering guide; referenced as prerequisite reading; not yet in catalogue | `/ingest-article` |
| https://www.anthropic.com/engineering/code-execution-with-mcp | Deep dive on code execution + MCP integration; extends PTC concepts | `/ingest-article` |
| https://github.com/anthropics/claude-cookbooks/blob/main/tool_use/tool_search_with_embeddings.ipynb | Official cookbook: embedding-based tool search implementation | `/tool-catalogue` |
| https://github.com/anthropics/claude-cookbooks/blob/main/tool_use/programmatic_tool_calling_ptc.ipynb | Official cookbook: PTC implementation patterns | `/tool-catalogue` |
| https://github.com/9600dev/llmvm | Joel Pobar's LLMVM — cited as inspiration for PTC; code-as-tool-orchestration | `/tool-catalogue` |
| https://blog.cloudflare.com/code-mode/ | Cloudflare's Code Mode — cited as inspiration for PTC approach | `/ingest-article` |
| https://arxiv.org/abs/2311.12983 | GIA Benchmarks paper — evaluation framework used for PTC results | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Tool Search Tool | Core feature — deferred tool loading via `defer_loading: true` | Yes — [Tool Search Tool article](../2026-03/tool-search-api-deferred-tool-loading.md) |
| Programmatic Tool Calling (PTC) | Core feature — code-as-composition-layer for tool orchestration | Yes — [RLanceMartin PTC post](../../posts/2026-02/rlancemartin-give-claude-a-computer-ptc.md) |
| Tool Use Examples | Core feature — `input_examples` for parameter disambiguation | Not yet catalogued as standalone entry |
| LLMVM (Joel Pobar) | Cited as inspiration for PTC approach | Not yet catalogued — consider `/tool-catalogue` |
| Cloudflare Code Mode | Cited as inspiration for PTC approach | Not yet catalogued — consider `/ingest-article` |
| Claude for Excel | Mentioned as integration benefiting from PTC | Not yet catalogued |
| GitHub MCP Server | Example: 35 tools, ~26K tokens | Not yet catalogued as standalone |
| Slack MCP Server | Example: 11 tools, ~21K tokens | Not yet catalogued as standalone |
| Sentry MCP Server | Example: 5 tools, ~3K tokens | Not yet catalogued as standalone |

---

## Action Items

- [ ] Enable `defer_loading: true` on low-frequency MCP tools in our orchestrator setup
- [ ] Test PTC (`allowed_callers: ["code_execution"]`) for multi-step data processing workflows
- [ ] Add `input_examples` to our most complex tool definitions (especially those with nested schemas)
- [ ] Ingest "Building Effective Agents" (Anthropic) — foundational guide, not yet in catalogue
- [ ] Evaluate LLMVM as potential tool-orchestration reference implementation
