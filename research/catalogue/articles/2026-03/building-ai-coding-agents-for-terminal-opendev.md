# Building AI Coding Agents for the Terminal: Scaffolding, Harness, Context Engineering, and Lessons Learned

> **Nghi D. Q. Bui (OpenDev) — arXiv, 2026-03-05**

| Field | Value |
|-------|-------|
| Source | [arxiv.org/abs/2603.05344](https://arxiv.org/abs/2603.05344) |
| Author | Nghi D. Q. Bui (OpenDev) |
| Publication | arXiv (cs.AI) |
| Date | 2026-03-05 |
| Topics | terminal-native agents, context engineering, compound AI systems, multi-model routing, safety architecture, adaptive compaction, dual-memory, subagent orchestration, MCP, lazy tool discovery |
| Read Time | 60+ min (full technical report with 11 appendices) |
| License | CC BY 4.0 |
| GitHub | [github.com/opendev-to/opendev](https://github.com/opendev-to/opendev) |

---

## Burak's Notes

> *First comprehensive open-source technical report documenting the full architecture of a terminal-native coding agent. This is the missing "how Claude Code works under the hood" paper -- OpenDev reverse-engineers and openly documents every pattern Claude Code uses but never published. Pure gold for validating and refining our L-Thread architecture. The 5-stage compaction, 5-model routing, 5-layer safety, and dual-agent planning/execution split are all directly applicable.*

---

## Key Takeaways

1. **Context pressure is THE central design constraint** -- Every architectural decision (compaction, model routing, tool discovery, subagent isolation, memory) exists to manage finite context windows. The paper frames this as the unifying principle behind all terminal-agent engineering, not just a concern to address.

2. **Five-model workload-specialized routing is production-proven** -- OpenDev assigns 5 distinct model roles (Normal, Thinking, Critique, VLM, Compact) with per-role fallback chains. This validates and extends our model routing patterns from oh-my-claudecode and Kilo Code. Each cognitive phase gets the optimal cost/capability model.

3. **Dual-agent planning/execution beats mode-switching state machines** -- OpenDev abandoned a 4-tool plan-mode state machine (enter/exit/create/edit) because agents got stuck in read-only mode. Replaced with Planner subagent that has write tools physically removed from its schema. Schema-level enforcement > runtime permission checks.

4. **Five-stage adaptive compaction at 60/75/85/95/100% thresholds** -- Progressive context reduction built into Phase 0 of the ReAct loop. Stage 1 (no action) through Stage 5 (compress everything to summary + goal + recent decisions). Each stage carefully preserves task continuity while reclaiming tokens.

5. **Event-driven system reminders with escalating guardrail counters defeat instruction fade-out** -- Reminders injected as role:"user" (not role:"system") because models pay more attention to user messages. Escalation: gentle -> strong -> veto. This is the most practical anti-drift mechanism documented.

6. **Nine-pass fuzzy edit matching for robustness** -- edit_file uses 9 progressively lenient passes: exact -> whitespace-normalized -> comment-stripped -> fuzzy token -> context expansion -> multi-candidate -> AI-assisted -> line-range -> direct line-number. Solves the #1 failure mode of agent code editing.

7. **Lazy MCP tool discovery via search_tools reduces schema bloat** -- Instead of loading all MCP tools into context at startup, agents call search_tools with keywords. Only top-K relevant tools loaded on demand. Directly validates Anthropic's defer_loading pattern we catalogued.

8. **Defense-in-depth: 5 independent safety layers** -- Prompt guardrails -> Schema filtering -> Runtime approval (Manual/Semi-Auto/Auto with persistent patterns) -> Tool-level validation (DANGEROUS_PATTERNS blocklist) -> Lifecycle hooks (exit code 2 = rejection). No single point of failure. Each layer operates independently.

9. **Subagent isolation via schema filtering, not runtime checks** -- Subagents are the same MainAgent class but constructed with filtered tool allowlists. The LLM never sees tools it cannot use. Construction-time isolation is cheaper and more reliable than runtime enforcement.

10. **Compound AI System architecture is mandatory, not optional** -- Explicitly frames terminal agents as compound AI systems (Zaharia et al.): multiple models + retrievers + tools composed together. Single-model approaches cannot handle the cost/capability/context tradeoffs of long-horizon terminal work.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly documents the architecture patterns underlying Claude Code and every terminal-native agent we use. Validates our compound AI system approach, model routing, subagent isolation, and context engineering. The most architecturally complete open paper on how to build what we already build. |
| **Actionable** | 8/10 | 5-stage compaction thresholds, 5-model routing roles, escalating system reminders, 9-pass fuzzy editing, and schema-level subagent isolation are all immediately adoptable patterns. The dual-memory architecture (episodic + working) maps to our CASS Memory System integration path. |

---

## Summary

This paper presents OPENDEV, the first comprehensive open-source technical report for a terminal-native, interactive coding agent. While the tool itself (Python-based, CC BY 4.0) is interesting, the real value is the documented architecture -- it serves as a de facto blueprint for how to build systems like Claude Code, with full design rationale and evolution history for every decision.

The architecture organizes into four layers: Entry/UI (CLI + TUI + Web), Agent (5-model routing + extended ReAct loop + subagent orchestration), Tool/Context (registry + MCP discovery + compaction + memory + reminders), and Persistence (sessions + undo + config). The paper's central thesis is that **context pressure** is the single unifying design constraint -- every other architectural decision exists to manage finite context windows effectively.

The context engineering layer is the paper's strongest contribution. It introduces a 5-stage adaptive compaction system triggered at 60/75/85/95/100% token usage, a dual-memory architecture (episodic for cross-session knowledge, working for intra-session state), event-driven system reminders that escalate from gentle to veto, and a 4-layer context retrieval pipeline (anchor-based tool selection -> multi-step Code Explorer search -> context assembly -> optimization). Reminders are injected as role:"user" messages because empirically models attend to them more than system messages -- a practical insight we should adopt.

The agent scaffolding design is unusually well-documented. All agents are the same MainAgent class, differentiated only by construction parameters (allowed_tools, system_prompt, model override). This eliminates diamond inheritance problems and ensures behavioral variation through composition, not inheritance. The factory assembly is a 3-phase pipeline: Skills -> Subagents -> Main Agent, with an ordering constraint that subagent registration must complete before main agent construction (because spawn_subagent tool descriptions are built from registered agents).

The paper also documents three pivotal design evolutions that serve as anti-patterns: (1) class hierarchies for agent types create diamond problems -- use parameterized single class instead, (2) lazy prompt building introduces race conditions with MCP discovery -- use eager construction, (3) state-machine plan modes get stuck -- use subagent delegation with schema-level enforcement. These "what we tried and why it failed" sections are arguably more valuable than the final architecture.

The safety architecture (5 independent layers), tool system (9-pass fuzzy edit, 6-stage shell execution with server detection, LSP-backed semantic code analysis), and MCP lazy discovery patterns round out a comprehensive engineering reference for anyone building terminal-native coding agents.

---

## Notable Quotes

> "The landscape of AI coding assistance is undergoing a fundamental shift from complex IDE plugins to versatile, terminal-native agents."

> "Context pressure [is] the central design constraint driving architecture."

> "Each [safety] layer operates independently; failure of any single layer does not compromise remaining four. No single point of failure."

> "Planning delegated to Planner with read-only schema. Enforcement at schema level rather than runtime permission checks. Planner cannot write because write tools don't exist in its schema."

> "Reminders injected with role: 'user' rather than role: 'system' -- prevents models from ignoring them as meta-instructions. Treats reminders as user feedback, which receives more attention. Empirically improves reminder effectiveness."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/opendev-to/opendev | The actual implementation -- examine prompt templates, compaction code, safety layers | `/tool-catalogue` |
| Terminal-Bench (benchmark cited) | Benchmark revealing frontier models struggle with continuous terminal operation | `/ingest-article` |
| LongCLI-Bench (benchmark cited) | Long-horizon CLI agent benchmark | `/ingest-article` |
| Zaharia et al. "Compound AI Systems" | Foundational paper for the compound AI architecture framing | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | "Led the shift" to terminal-native agents; primary reference system | Yes (implicit -- it's our harness) |
| Aider | Early CLI agent; listed as "CLI agent without report" | Yes - [aider.md](../../agent-harnesses/aider.md) |
| Goose | OSS terminal agent alternative | Yes - [goose.md](../../agent-harnesses/goose.md) |
| OpenCode | OSS terminal agent alternative | Yes - [opencode.md](../../agent-harnesses/opencode.md) |
| OpenHands | Browser-based system, contrasted with CLI-native | No |
| SWE-Agent | Benchmark-oriented framework, not interactive | No |
| Crush | CLI agent alternative | No |
| Gemini CLI | CLI agent from Google | Yes - [gemini-cli.md](../../agent-harnesses/gemini-cli.md) |
| MCP (Model Context Protocol) | Used for lazy external tool discovery | Yes (multiple entries) |
| Playwright/Selenium | Headless browser for web interaction tools | No (infra dependency) |
| pyright, pylsp, gopls, rust-analyzer, clangd | LSP servers for semantic code analysis | No (infra dependencies) |

---

## Architectural Pattern Mapping to Our System

| OpenDev Pattern | Our Equivalent | Gap/Opportunity |
|----------------|----------------|-----------------|
| 5-model routing (Normal/Thinking/Critique/VLM/Compact) | Model routing in oh-my-claudecode | We lack explicit Critique and Compact model roles -- adopt |
| 5-stage compaction (60/75/85/95/100%) | Anthropic Compaction API (server-side) | Client-side compaction gives finer control -- study thresholds |
| Dual-memory (episodic + working) | CASS Memory System (3-layer) | CASS is more sophisticated but same principle validated |
| Schema-level subagent isolation | Our agent spawning via tmux | We enforce via prompt, not schema -- schema filtering is stronger |
| Event-driven system reminders | Our event-driven waiting patterns | We lack escalating guardrail counters -- adopt |
| Defense-in-depth 5-layer safety | DCG + hooks + prompt guards | We have layers 1, 4, 5 -- missing explicit schema gating (layer 2) and persistent approval patterns (layer 3) |
| 9-pass fuzzy edit | Claude Code's Edit tool | Study for custom edit tool if we ever need one |
| Eager agent construction | N/A | Consider for agent factory if we build custom harness |
| Lazy MCP tool discovery | Tool Search / defer_loading | Already catalogued -- validates approach |
| Subagent-based planning (no state machine) | Our /plan command | Consider eliminating mode-switching in favor of subagent delegation |
| Priority-ordered conditional prompt composition | Our CLAUDE.md + commands | Their system is more granular (priority 10-95 sections) -- study |
| Provider-conditional prompt sections | N/A | Useful if we go multi-model (Claude vs GPT vs Gemini sections) |
| Prompt caching (static + dynamic boundary) | Anthropic prompt caching | Their 90% cache hit rate target matches our catalogued patterns |
| Per-tool-type output summarization | N/A | We rely on Claude's built-in truncation -- explicit strategies could help |
| Shadow git snapshots for undo | Our git-based state | Same approach validated |

---

## Key Numbers

| Metric | Value | Context |
|--------|-------|---------|
| Model roles | 5 | Normal, Thinking, Critique, VLM, Compact |
| Safety layers | 5 | Prompt, Schema, Runtime Approval, Tool Validation, Hooks |
| Compaction stages | 5 | Triggered at 60%, 75%, 85%, 95%, 100% token usage |
| Fuzzy edit passes | 9 | From exact match to AI-assisted to line-number fallback |
| Shell execution stages | 6 | Validation, Approval, Preparation, Execution, Post-Processing, Response |
| Default iteration cap | 32 | Per conversation |
| Message injection queue | 10 | Max items, bounded, thread-safe |
| Approval levels | 3 | Manual, Semi-Auto, Auto |
| Config hierarchy levels | 4 | Built-in defaults -> env vars -> user global -> project-local |
| Skill tiers | 3 | Built-in, user global, project-local |
| Prompt caching savings | up to 90% | Token cost reduction on cache hits |
| GitHub Copilot adoption | 15M+ developers | Context for market size |

---

## Action Items

- [ ] Adopt 5-stage compaction thresholds (60/75/85/95/100%) as reference for our context management strategy
- [ ] Implement escalating system reminder pattern (gentle -> strong -> veto) with guardrail counters
- [ ] Evaluate schema-level subagent isolation (remove tools from schema) vs our current prompt-level enforcement
- [ ] Add explicit Critique and Compact model roles to our model routing taxonomy
- [ ] Study the dual-agent planning approach (Planner subagent with read-only schema) as replacement for mode-switching
- [ ] Catalogue OpenDev tool itself via `/tool-catalogue https://github.com/opendev-to/opendev`
- [ ] Review their prompt composition priority system (10-95 ranges) for our CLAUDE.md structure
- [ ] Test role:"user" injection for system reminders in our event-driven patterns
- [ ] Investigate provider-conditional prompt sections for future multi-model support
