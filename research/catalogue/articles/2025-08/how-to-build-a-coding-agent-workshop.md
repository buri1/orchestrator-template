# How to Build a Coding Agent: Free Workshop

> **Geoffrey Huntley — ghuntley.com, August 24, 2025**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/agent/ |
| Author | Geoffrey Huntley — former tech lead for developer productivity at Canva; engineer at Sourcegraph building Amp |
| Publication | ghuntley.com |
| Date | 2025-08-24 (last modified 2025-10-10) |
| Topics | coding agents, agent engineering, LLM primitives, context engineering, tool calling, agent loop |
| Read Time | ~15 min |

---

## Burak's Notes

> *Deep dive candidate from the Ralph article. Huntley's workshop distillation of the 300-line agent concept he's been evangelizing. Covers the same ground as the Ralph loop articles but in a structured, pedagogical format with concrete code primitives.*

---

## Key Takeaways

1. **A coding agent is ~300 lines running in a loop** — The core architecture is trivially simple: user input enters a loop, gets sent for LLM inference, the model decides whether to call tools, tool results feed back into the loop. Every commercial agent (Claude Code, Cursor, Amp, Windsurf, Copilot) is fundamentally this same pattern.

2. **Five primitives are all you need** — Read File, List Files, Bash Execution, Edit File, and Code Search (ripgrep). With these five tools registered in the inference loop, you have a functional coding agent. Everything else is optimization on top.

3. **Model selection is a quadrant, not a spectrum** — LLMs are classified along two axes: safety (high/low) and mode (oracle/agentic). Agentic models (Claude Sonnet, Kimi K2) bias toward tool calls and incremental action. Oracles are for summarization and deep reasoning. Wire an Oracle as a callable tool inside your agentic loop for the best of both worlds (Amp's "Oracle" pattern).

4. **Context window pollution is the #1 agent failure mode** — The usable context window is ~176K not 200K (system prompt + harness overhead). Performance degrades as you fill it. Never reuse sessions across unrelated tasks. "Less is more" for MCP tool registration.

5. **Agent building is table-stakes professional knowledge for 2025** — Just as primary keys and cloud platforms became required knowledge, building agents is now a baseline expectation. The career cliff separates those automating with agents from those who aren't.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly maps to our L-Thread Orchestrator pattern; validates the loop architecture, context isolation principle, and multi-model strategy we already use; the five primitives are exactly what our agents expose |
| **Actionable** | 7/10 | The Oracle-as-tool pattern (wiring a reasoning model as a callable function inside an agentic loop) is immediately implementable; the MCP minimalism principle reinforces our existing approach; workshop repo provides a clean reference implementation |

---

## Summary

Geoffrey Huntley's workshop, delivered at two conferences and published as a comprehensive blog post, demystifies coding agent internals. The central thesis is that every commercial coding agent — Claude Code, Cursor, Amp, Windsurf, GitHub Copilot — is fundamentally 300 lines of code running in an inference loop with tool calls.

The workshop walks through five essential primitives: Read File (load content into context), List Files (navigate file structure), Bash Execution (run shell commands), Edit File (apply modifications), and Code Search (ripgrep pattern matching). Each primitive is demonstrated with working code from the companion GitHub repository.

Huntley introduces a quadrant model for LLM classification: high-safety vs. low-safety, and oracle vs. agentic. Claude Sonnet is characterized as a "robotic squirrel" biased toward action and tool calls rather than extended reasoning. For tasks requiring deeper analysis, Huntley advocates the Oracle pattern used at Amp/Sourcegraph: wire a reasoning-optimized model (like GPT) as a callable tool that the agentic model can invoke for guidance.

The article places heavy emphasis on context window discipline. The theoretical 200K token window shrinks to ~176K after system prompt and harness overhead. Performance degrades proportionally with context pollution. Huntley warns against reusing sessions across tasks and against registering excessive MCP tools — "less is more."

The professional development angle frames agent-building as mandatory 2025 knowledge, comparable to understanding primary keys or cloud infrastructure. Huntley argues that AI-related job displacement comes not from AI itself but from colleagues who adopt agent workflows while others don't.

---

## Notable Quotes

> "It's not that hard to build a coding agent. It's 300 lines of code running in a loop with LLM tokens."

> "Sonnet is a robotic squirrel that just wants to do tool calls. It doesn't spend too much time thinking; it biases towards action, which is what makes it agentic."

> "The more you allocate to a context window, the worse the performance of the context window will be, and your outcomes will deteriorate."

> "In my opinion, any disruption or job loss related to AI is not a result of AI itself, but rather a consequence of a lack of personal development and self-investment."

> "Less is more, folks. Less is more." (on MCP tool registration)

> "The next time you're on a Zoom call, consider that you could've had an agent building the work that you're planning to do during that Zoom call."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/allocations/ | Deep dive on MCP context allocation — "too many MCPs on the dance floor" | `/ingest-article` |
| https://ghuntley.com/amazon-kiro-source-code/ | Full source code analysis of Amazon Kiro as a coding agent case study | `/ingest-article` |
| https://ghuntley.com/secure-codegen/ | Secure code generation patterns — safety angle on agent tool use | `/ingest-article` |
| https://github.com/ghuntley/how-to-build-a-coding-agent | Workshop source code — reference implementation of the 5-primitive agent | `/tool-catalogue` |
| https://github.com/SWE-agent/mini-swe-agent | 100-line agent scoring 68% on SWE-bench — minimal viable agent reference | `/tool-catalogue` |
| https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools | Leaked system prompts from v0, Cursor, Manus, Augment, Devin, Replit, Windsurf, etc. | `/tool-catalogue` |
| https://ghuntley.com/pressure/ | Back pressure concept — complements the existing dont-waste-your-back-pressure article | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Amp Code | Huntley works at Sourcegraph building Amp; implements Oracle pattern | Yes — [amp-code.md](../agent-harnesses/amp-code.md) |
| Claude Code | Listed as a commercial agent built on the loop pattern | Yes (core tool) |
| Cursor | Listed as a commercial agent built on the loop pattern | Yes — [cursor.md](../developer-gui/cursor.md) |
| Windsurf | Listed as a commercial agent built on the loop pattern | Yes — referenced in catalogue |
| GitHub Copilot | Listed as a commercial agent built on the loop pattern | Yes — referenced in catalogue |
| OpenCode (SST) | Terminal-based AI coding agent; open source reference | Yes — [opencode.md](../agent-harnesses/opencode.md) |
| Kiro (Amazon) | Full source code analysis referenced as coding agent example | Yes — [kiro.md](../developer-gui/kiro.md) |
| Mini-SWE-Agent | 100-line agent scoring 68% on SWE-bench | Not yet catalogued — consider `/tool-catalogue` |
| Kimi K2 | Listed alongside Claude Sonnet as an agentic model | Not yet catalogued |
| ripgrep (rg) | "Nearly every coding tool uses ripgrep under the hood" for code search | Not catalogued (utility, not an agent tool) |
| how-to-build-a-coding-agent (repo) | Workshop companion code with all 5 primitives implemented | Not yet catalogued — consider `/tool-catalogue` |
| system-prompts-and-models-of-ai-tools | Leaked prompts from v0, Cursor, Manus, Devin, Replit, etc. | Not yet catalogued — consider `/tool-catalogue` |

---

## Action Items

- [ ] Review the Oracle-as-tool pattern from Amp — wire a reasoning model (e.g., Opus) as a callable tool inside our agentic Sonnet loops
- [ ] Catalogue mini-swe-agent as a minimal reference implementation
- [ ] Catalogue the leaked system prompts repo — gold mine for prompt engineering
- [ ] Audit our MCP tool count per agent against Huntley's "less is more" principle
