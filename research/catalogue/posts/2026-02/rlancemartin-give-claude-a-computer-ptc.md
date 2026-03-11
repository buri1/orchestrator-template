# Give Claude a Computer — Programmatic Tool Calling (PTC)

> **@RLanceMartin — 2026-02-27**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/RLanceMartin/status/2027450018513490419) |
| Author | [@RLanceMartin — Lance Martin, Anthropic (formerly LangChain), PhD Stanford](https://x.com/RLanceMartin) |
| Date | 2026-02-27 |
| Topics | programmatic tool calling, Claude API, agent architecture, tool use, web search, token efficiency, context engineering |
| Type | Article (X long-form) |

---

## Burak's Notes

> *Lance Martin (now at Anthropic, ex-LangChain) explains PTC — a paradigm shift in how Claude orchestrates tool calls. Instead of round-tripping each tool call through the context window, Claude writes code that runs in a container and calls tools programmatically. Intermediate results stay in the container, only final output reaches Claude's context. This is the "code as orchestration protocol" pattern taken to its logical extreme. Directly validates our 70/30 deterministic/LLM split — PTC is literally deterministic code (written by Claude) wrapping LLM tool calls.*

---

## Key Takeaways

1. **PTC eliminates the composition tax** — Instead of each tool call round-tripping through Claude's context window (costing latency, serializing full results, adding reasoning steps), Claude writes code that orchestrates tool calls inside a container. Intermediate results return to the running code, not to Claude's context. Only the final output reaches Claude.
2. **11% accuracy improvement + 24% fewer input tokens** — On BrowseComp and DeepsearchQA benchmarks, PTC improved accuracy by 11% average while using 24% fewer input tokens. Opus 4.6 with PTC is #1 on LMArena's Search Arena.
3. **Tools as control surface, code as composition** — PTC preserves the control benefits of tools (guardrails, observability, autonomy gating, concurrency control, UX rendering) while using code for composition. Tool handlers still sit in the middle of every call as an inspection/approval point, but Claude fluently orchestrates the sequence in code.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Core Claude API capability for agent engineering. PTC validates "code as orchestration protocol" — directly applicable to our agent harness architecture. The token efficiency gains (24% fewer input tokens) compound across multi-agent systems. Understanding when to use tools vs code for composition is fundamental to our 70/30 split. |

---

## Full Content

**Give Claude a computer**

TL;DR — [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) (PTC) is an interesting capability in Claude Opus/Sonnet 4.6. Instead of making tool calls that each round-trip through Claude's context, Claude writes code that can orchestrate tool calls directly inside a container. Intermediate tool results return to the code, not Claude's context window. This reduces token usage and improves performance on multi-step tasks like search. Opus 4.6 with PTC recently scored #1 on [LMArena's search benchmark](https://x.com/arena/status/2027095484834398512). See our docs to learn more about [PTC](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) and our new [web search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) tool that uses PTC by default.

Computer use is one of Claude's most central capabilities. Just giving Claude a [bash tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/bash-tool) opens up a broad action space and leads to a common question: [is bash all you need](https://x.com/trq212/status/2008278253799195042)? And how to decide what other tools to give an agent?

Actions are how Claude interacts with the world. Tools are a way to declaratively specify the actions that Claude can take. The API lets you add [tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) by giving Claude a tool name, description, and input arguments.

If Claude wants to call a tool, it will respond with a JSON object of tool arguments to run. A tool handler (e.g., [MCP server](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector), code you write, etc) runs the tool and passes back context. If you run this in a loop, you [have an agent](https://www.anthropic.com/engineering/building-effective-agents).

**When to use tools**

Claude with a bash tool running in a loop is a computer-use agent. This is central to Claude Code. But Claude Code doesn't *just* use bash. It uses tools as a *control surface* around certain actions. See @trq212's [breakdown on these points](https://x.com/trq212/status/2027463795355095314). Promoting an action to a tool can make sense in a few cases:

- **UX**: @trq212 talks about the AskUserQuestion tool. Tools are useful where specific actions need to be caught and rendered to the user in a particular way.
- **Guardrails**. Some actions need guardrails. For example, a file edit tool can run a staleness check to verify that the file hasn't changed since the model last read it.
- **Concurrency control**. Sometimes it's useful to group actions by concurrency safety (e.g., read-only tools can run in parallel).
- **Observability.** It can be useful to isolate specific actions for logging (e.g., measuring latency or token usage).
- **Autonomy**. You may want to group actions by autonomy-level. If the harness can undo an action, it can approve the action more freely.

**The problem with tools**

Tools trade-off control with composability. Consider three actions as tool calls. The context from each tool call is returned back to Claude. Each round trip costs latency, serializes the tool result into context (e.g., it will pass thousands of rows even if the next step only needs five), and introduces a reasoning step. The composition tax grows with the number of actions.

**Programmatic tool calling**

Claude can perform programmatic tool calling (PTC): you can define tools, as usual. But rather than calling them individually, Claude can compose them as functions and run them in a code execution container. The output of each function returns to the container rather than to Claude's context window.

When the code calls a tool (e.g., `await web_search(query)`) the container pauses. The call crosses the sandbox boundary as a typed tool-use event. It is fulfilled just as if the model directly called the tool (e.g., via a handler, an MCP server etc). But the result returns *to the running code*, not to Claude's context window. The code processes it following the control flow that Claude specified (e.g., calls another tool, filters the data, accumulates results). Only the final output reaches Claude.

With Opus 4.6, gains in token efficiency and performance on non-coding evals (e.g., BrowseComp and DeepsearchQA for web search) with PTC. For example, rather than pulling 50 raw search results into context for Claude to reason over, the code can parse, filter, and cross-reference results programmatically. This keeps what's relevant and discards the rest (e.g., dynamic filtering). Across BrowseComp and DeepsearchQA, it improved accuracy by an average of 11% while using 24% fewer input tokens. Opus 4.6 with PTC is currently #1 in LMarena's Search Arena.

PTC is now built into the web search tool on the API. Example usage:

```json
{
  "model": "claude-opus-4-6",
  "max_tokens": 4096,
  "tools": [
    {
      "type": "web_search_20260209",
      "name": "web_search"
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "<query>"
    }
  ]
}
```

PTC is a way to get the benefit of code execution (e.g., composability) while preserving the control surface of tools: tool implementations run on your side of the sandbox, not inside it. The tool handlers still sit in the middle of every call as a control surface, able to inspect, reject, log, or queue for human approval. But it allows Claude to fluently orchestrate actions in code.

---

## Notable Replies

> **@clwdbot (Vaclav Milize)**: "the 'is bash all you need' question answers itself once you look at the benchmark results: PTC + bash + web search beats every custom MCP integration on reliability. the implication nobody's saying out loud: half the MCP ecosystem is adding complexity that makes agents worse" (19 likes, 2 retweets)
> *Provocative take — argues PTC undermines the value proposition of many MCP servers. Worth monitoring.*

> **@Sarvesh_01X (Sarvesh Raut)**: "this is the unlock everyone's been waiting for. agent loops that were burning 50k tokens on tool calls can now run in 5k. the difference between agents that work in demos vs production."
> *Quantifies the magnitude of token savings — 10x reduction claim for production agent loops.*

> **@consolelogwill (will)**: "I don't totally get how the container calls more tools though? Is the container doing that programmatically or is claude writing its own llm calls inside of the container?"
> *Good clarifying question — Lance confirms it's Claude writing code that calls its own tools, not nested LLM calls.*

> **@geromi_ (Jeremy Russell)**: "Why not just delegate to subagents? Seems to accomplish the same thing and properly handles edge cases."
> *Valid architectural question — PTC is lighter-weight than subagents for composition, avoids spinning up separate agent contexts.*

> **@novaruntime (Nova)**: "the PTC framing is interesting. instead of roundtripping every tool call through the model you just let it write a script. basically admitting that natural language is a bad protocol for tool use"
> *Sharp insight — natural language as a tool-use protocol has overhead; code is the better composition layer.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling | Official PTC documentation — implementation details | `/ingest-article` |
| https://x.com/trq212/status/2027463795355095314 | @trq212's breakdown on Claude Code tool design (referenced by Lance) | `/ingest-post` |
| https://claude.com/blog/improved-web-search-with-dynamic-filtering | Dynamic filtering blog post — PTC applied to web search | `/ingest-article` |
| https://x.com/arena/status/2027095484834398512 | LMArena Search Arena results showing Opus 4.6 + PTC at #1 | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude API / PTC | Core subject — programmatic tool calling capability | No (API feature, not standalone tool) |
| Claude Code | Referenced as example of bash+tools agent loop | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) |
| Claude Opus 4.6 | Model version that enables PTC; #1 on Search Arena | No (model version, not tool) |
| MCP (Model Context Protocol) | Referenced as tool handler mechanism | Yes — [MCP Ecosystem Orchestration](../reference/mcp-ecosystem-orchestration.md) |
| LMArena / Search Arena | Benchmark where Opus 4.6 + PTC scored #1 | No — not yet catalogued |
| BrowseComp | OpenAI benchmark used to evaluate PTC gains | No — benchmark, not tool |
| DeepsearchQA | DeepMind benchmark used to evaluate PTC gains | No — benchmark, not tool |
