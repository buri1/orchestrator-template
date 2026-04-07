# MCP vs CLI: Benchmarking Tools for Coding Agents

> **Mario Zechner — mariozechner.at, 2025-08-15**

| Field | Value |
|-------|-------|
| Source | https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/ |
| Author | Mario Zechner — creator of Pi Agent (badlogic) |
| Publication | mariozechner.at |
| Date | 2025-08-15 |
| Topics | MCP, CLI tools, benchmarking, coding agents, token efficiency, tool design, terminal control, Claude Code |
| Read Time | ~15 min |

---

## Burak's Notes

> *This is Mario Zechner's own empirical answer to the MCP vs CLI debate — the Pi Agent creator with skin in the game. The headline finding is counterintuitive: MCP and CLI performance is nearly identical when both tools are well-designed. The real finding buried in the data is about WHY they differ — MCP bypasses Claude Code's malicious command detection (Haiku security checks), saving 1.3-2M tokens per run versus CLI. That's the architectural insight. The implication for our Pi-based supervisor: well-designed single-tool MCP servers (like terminalcp's unified `terminalcp` action parameter pattern) are dramatically more efficient than multi-tool MCP dumping JSON everywhere. Also note: terminalcp is directly relevant to our tmux dependency — it's a less-capable tmux alternative with PTY emulation. Worth tracking as a potential pi-interactive-shell companion.*

---

## Key Takeaways

1. **MCP vs CLI is a wash — tool design is the real lever** — Both terminalcp MCP and terminalcp CLI achieved 100% success on all three tasks. The MCP was 23% faster (51m vs 66m total) and marginally cheaper ($19.45 vs $19.95). The protocol choice matters far less than how well the tool is designed.

2. **MCP bypasses Haiku security checks — 35-55x fewer tokens** — CLI tools trigger Claude Code's malicious command detection on every bash invocation (using Haiku as a security scanner). The MCP terminalcp used ~35K Haiku tokens total; the CLI version used 1.3-2M Haiku tokens. This is the most significant architectural difference between the two protocols.

3. **Task complexity determines which CLI tool wins** — For simple tasks (LLDB debug, Python REPL), tmux beats terminalcp MCP by 10-22% on cost due to training-data familiarity. For complex tasks (OpenCode TUI navigation), terminalcp's cleaner output beats tmux by 39%. Screen failed entirely on TUI tasks (0/10 on project analysis).

4. **Single unified tool beats per-command tools** — terminalcp exposes one `terminalcp` tool with an `action` parameter rather than one tool per command. This follows Anthropic's (now-removed) documentation warning about tool count limits degrading agent performance.

5. **Good CLI + add MCP on top** — Zechner's recommendation: start with a well-designed CLI (simpler, portable, pipeable for token filtering). Once the CLI works, adding an MCP server is trivial since MCP servers are stateful by default.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct empirical data from Pi Agent creator on a question we face constantly; Haiku security bypass insight changes how we think about MCP vs CLI tool routing; validates our tmux usage but shows terminalcp as a cleaner alternative for complex TUI tasks |
| **Actionable** | 8/10 | Haiku security check bypass is immediately usable for designing Pi extensions; single-tool MCP pattern applies to our pi-mcp-adapter design; terminalcp itself may replace or complement our tmux dependency for terminal control tasks |

---

## Summary

Mario Zechner, creator of the Pi Agent, set out to empirically test whether coding agents perform better with MCP servers or CLI tools. He built `terminalcp` — a less-capable tmux alternative with PTY support — exposing the same functionality as both an MCP server and a CLI, then ran 120 evaluation runs (3 tasks × 4 tools × 10 repetitions) with a hacky evaluation framework using Claude Code.

The three tasks tested increasingly complex terminal interactions: debugging a crashing binary with LLDB, running a Python REPL through multi-step computations, and navigating OpenCode's TUI to switch models. Four tools were compared: terminalcp MCP, terminalcp CLI, tmux, and GNU screen.

The headline result is that MCP and CLI achieved identical success rates (100% each), with MCP being 23% faster overall. But the most important finding is buried in the Haiku token counts: CLI tools trigger Claude Code's malicious command detection on every bash invocation, consuming 1.3-2 million Haiku tokens across 10 runs. The MCP server uses ~35K Haiku tokens because it bypasses the bash tool entirely. This overhead explains why MCP has a small but consistent cost advantage at scale.

Screen failed completely on the project analysis task (0/10) because it couldn't handle OpenCode's TUI model-switching dialog — a reminder that not all terminal multiplexers are equivalent for complex interactive applications.

Zechner's architectural recommendation: build the CLI first (simpler, portable, and can be piped for additional token filtering), then layer an MCP server on top since MCP servers are stateful by default and the incremental effort is small. The key design principle from the terminalcp implementation: one unified tool with an `action` parameter, not one tool per command.

---

## Notable Quotes

> "Just like a lot of meetings could have been emails, a lot of MCPs could have been CLI invocations."

> "The lower Haiku token usage for terminalcp MCP (35k vs 1.3-2M) reveals that CLI tools trigger Claude Code's malicious command detection on every bash invocation. MCP bypasses this overhead entirely."

> "Maybe instead of arguing about MCP vs CLI, we should start building better tools. The protocol is just plumbing. What matters is whether your tool helps or hinders the agent's ability to complete tasks."

> "Once you have a well-designed, token-efficient CLI tool, adding an MCP server on top of it is very straightforward."

> "The output of your CLI can be further filtered and massaged just by piping it into another CLI tool, which can increase token efficiency at the cost of additional instructions. That's not possible with MCPs."

---

## Benchmark Results (Summary)

### Success Rates
| Tool | Debug LLDB | Project Analysis | Python REPL | Overall |
|------|-----------|-----------------|-------------|---------|
| terminalcp MCP | 10/10 | 10/10 | 10/10 | 100% |
| terminalcp CLI | 10/10 | 10/10 | 10/10 | 100% |
| tmux | 10/10 | 10/10 | 10/10 | 100% |
| screen | 10/10 | 0/10 | 10/10 | 67% |

### Total Cost (120 runs)
| Tool | Debug LLDB | Project Analysis | Python REPL | Total |
|------|-----------|-----------------|-------------|-------|
| terminalcp MCP | $4.80 | $6.71 | $7.94 | $19.45 |
| terminalcp CLI | $3.86 | $7.91 | $8.18 | $19.95 |
| tmux | $3.73 | $11.05 | $7.16 | $21.93 |
| screen | $6.00 | $14.74 | $17.09 | $37.83 |

### Total Time
| Tool | Total |
|------|-------|
| terminalcp MCP | 51m 1s |
| terminalcp CLI | 65m 55s |
| tmux | 73m 6s |
| screen | 79m 6s |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/badlogic/terminalcp | terminalcp source — PTY-based tmux alternative with MCP + CLI; directly relevant to our tmux dependency | `/ingest-article` |
| https://eugeneyan.com | Eugene Yan's eval blog referenced by Zechner as the gold standard for scientific evaluations | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| terminalcp | Zechner's own tool — PTY-based tmux alternative with unified MCP + CLI; node-pty + xterm.js; single-tool MCP design | No — candidate for Pi ecosystem section |
| Pi Agent | Zechner is the Pi Agent creator; terminalcp is his side project | Yes — [pi-agent.md](../agent-harnesses/pi/pi-agent.md) |
| tmux | Used as baseline CLI tool in benchmark; 100% success rate; cheapest for simple tasks | Referenced throughout catalogue (not a dedicated entry) |
| GNU screen | Used as baseline CLI tool; 0% success on TUI task (OpenCode model switching); avoid for TUI agent tasks | Not catalogued |
| OpenCode | Used in "project analysis" task — agent must navigate its TUI and switch models | Yes — [opencode.md](../agent-harnesses/opencode.md) |
| Claude Code | Used as the coding agent running all 120 evaluation runs | Yes (core tool) |
| Context7 | Cited as example of poorly designed MCP (useless code snippets) | Yes — [context7.md](../agent-memory/context7.md) |
| GitHub MCP Server | Cited as MCP that reimplements functionality already in GitHub CLI with worse results | Not catalogued (not in our stack) |
| node-pty | Underlying PTY library used in terminalcp's TerminalManager | Not catalogued (utility) |
| xterm.js | ANSI sequence renderer used in terminalcp | Not catalogued (utility) |

---

## Action Items

- [ ] Design all Pi MCP extensions as single-tool (one `action` parameter) to avoid tool-count degradation — Zechner pattern validated empirically
- [ ] Track terminalcp as a potential pi-interactive-shell companion or replacement — PTY-based, avoids tmux dependency, handles TUI apps
- [ ] Factor in Haiku security bypass when comparing MCP vs bash tool in Pi supervisor cost models — 35-55x token difference is architecturally significant
- [ ] Apply Zechner's CLI-first recommendation: design good CLIs first, then wrap in MCP for stateful use cases
