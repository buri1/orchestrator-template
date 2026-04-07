# Codex Multi-Agent Playbook Part 1: Setup Guide

> **@LLMJunky — 2026-02-18**

| Field | Value |
|-------|-------|
| Source | [X post (Article)](https://x.com/LLMJunky/status/2024152021436121220) |
| Author | @LLMJunky — am.will, Founder / StarSwap, "Director of n number of agents" |
| Date | 2026-02-18 |
| Topics | OpenAI Codex, custom agents, multi-agent configuration, subagent roles, model tiering, MCP servers, TOML config |
| Type | Article (X long-form) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Custom multi-agent roles are now fully configurable in Codex** — With update 0.102.0, Codex moved beyond the three built-in roles (default, explorer, worker) to user-defined subagent roles with configurable models, reasoning levels, system prompts, permissions, MCP servers, ChatGPT Apps, verbosity, and personality. This mirrors what we do with `.claude/agents/` but in a TOML-based config system.

2. **Hidden thread limit is configurable** — The default cap of 6 parallel agents can be overridden via `max_threads` in config.toml (e.g., `max_threads = 12` or higher). This is undocumented but functional. Too many threads risk 429 errors.

3. **Hierarchical config scoping enables monorepo specialization** — Config files are loaded hierarchically from `~/.codex` (global) down to project-level and even subfolder-level `.codex/config.toml` files. This enables specialized agent roles per module in monorepos, similar to how AGENTS.md files cascade.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly relevant as a competitor's approach to multi-agent configuration. The TOML-based role definitions with model routing, per-agent permissions, and MCP server assignment are patterns worth comparing to our `.claude/agents/` approach. The hierarchical config scoping validates our cascading AGENTS.md pattern. Codex-specific but patterns are transferable. Part 1 of a 3-part series (Part 3 already catalogued as "Swarms Lvl. 1"). |

---

## Full Content

**Title:** CODEX MULTI-AGENT PLAYBOOK PART 1: SETUP GUIDE

**Engagement:** 27 replies, 61 reposts, 480 likes, 1,086 bookmarks, 125.1K views

This is Part 1 of a multi-part series. It covers the complete setup and configuration of custom multi-agent roles in OpenAI Codex.

### Series Overview
- **Part 1** (this post): Setup guide — custom agent definitions, model assignment, prompt writing, config system
- **Part 2** (next): Orchestration strategies, Spark implementation, swarm patterns
- **Part 3** (already catalogued): Swarm orchestration — Waves vs Super Swarms, context engineering

### What Are Custom Multi-Agent Roles?
User-defined subagents for repeatable tasks. Three built-in roles exist:
- **Default agent**: No defined role, inherits parent model/reasoning
- **Explorer agent**: Runs on 5.1-Codex-Mini, used for exploration
- **Worker agent**: Implements tasks, fixes tests, refactors code; inherits parent model/reasoning

### What Can You Configure?
- Model and reasoning level (e.g., Codex 5.3 Spark High, Codex 5.1 Mini Medium)
- Global or project-scoped roles
- System prompt via `developer_instructions`
- Description (controls when the role gets called)
- Per-role permissions (read-only, read/write)
- Features (memory, shell access, etc.)
- MCP Servers
- ChatGPT Apps (Notion, Linear, Monday, etc.)
- Verbosity and personality

### The Hidden Thread Limit
Default cap is 6 parallel agents, but configurable via:
```toml
[agents]
max_threads = 12
```
Too many threads risk 429 errors.

### Project vs Global Scope
Config files are hierarchical, loaded from `~/.codex` (global, lowest priority) upward through project-level and subfolder-level `.codex/config.toml` files. This enables monorepo specialization (e.g., a review agent scoped to `$HOME/repo/mobile-app/.codex/config.toml`).

### The Setup: Config.toml
Two required keys per agent: `description` (tells Codex when to use it) and `config_file` (points to the role definition TOML).

Example config.toml entries for security_auditor, performance, backend_arch, product_analyst, and frontend_arch agents are provided.

### Custom Role Definitions
The `config_file` TOML supports: model, model_reasoning_effort, model_reasoning_summary, model_verbosity, personality, developer_instructions (system prompt), sandbox_mode, network_access, writable_roots, web_search, feature toggles (memory_tool, shell_tool), MCP servers with tool allow/deny, and ChatGPT Apps enable/disable.

Key insight: role config data is not loaded unless the role is actually called, saving parent session tokens.

### Cross-Cutting Patterns
- Skills can be called from subagents, and subagents from skills
- Structured output can be requested via developer_instructions templates (not enforced, but reliably followed)
- Natural language invocation: "Use Sparky to implement plan.md"

### What's Next (Part 2 Preview)
- When to use subagents vs main session
- Orchestration strategies for parallel implementation with Spark
- Structuring plan files for subagent execution
- Prompt patterns for custom roles

### Resources
- 25 custom agent configs: https://github.com/am-will/codex-skills/tree/main/agents

---

## Notable Replies

Replies were not accessible in the article view format. The engagement (1,086 bookmarks, 480 likes) indicates high practical utility. Based on the existing Part 3 entry, the community response pattern is implementation-focused with active GitHub usage.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/LLMJunky/status/2014521564864110669 | Part 0 of the series — Codex subagent fundamentals intro | `/ingest-post` |
| https://github.com/am-will/codex-skills | 25 custom agent role definitions for Codex — reference configs | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenAI Codex | Primary agent harness — the entire config system being documented | Yes — [OpenAI Codex](../agent-harnesses/openai-codex.md) |
| GPT 5.3-Codex | Model used for orchestration; reasoning levels (xHigh/High/Medium) | No — model, not tool |
| GPT 5.1-Codex-Mini | Model used by the built-in Explorer role | No — model, not tool |
| Spark (GPT) | Small/fast model for subagent workers; previewed for Part 2 | No — model, not tool |
| codex-skills (am-will) | GitHub repo with 25 custom agent role configs | Not yet catalogued — consider `/tool-catalogue` |
| Notion | Referenced as a ChatGPT App connector for agents | Yes — referenced in [Notion as Agent Backend](../reference/notion-as-agent-backend.md) |
| Linear | Referenced as a ChatGPT App + MCP server for agents | No — not catalogued as standalone tool |
| AGENTS.md | Referenced for hierarchical config file analogy | Yes — [AGENTS.md](../agent-protocols/agents-md.md) |
