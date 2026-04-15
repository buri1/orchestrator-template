# OpenHarness

> **Open Agent Harness: delivers core lightweight agent infrastructure -- tool-use, skills, memory, and multi-agent coordination.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [HKUDS/OpenHarness](https://github.com/HKUDS/OpenHarness) |
| GitHub Stars | 8,067 (as of 2026-04-04) |
| Publisher | HKUDS (Data Intelligence Lab @ HKU) — research group, 87 public repos, 9.4K org followers |
| License | MIT |
| Tech Stack | Python 3.10+ (core), React + Ink (terminal UI), Node.js 18+ (optional), uv package manager |
| Maturity | 🟡 Early (v0.1.2, released 2026-04-06; initial release 2026-04-01) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *This is essentially an open-source reimplementation of Claude Code's agent harness architecture in Python, coming from an HKU research lab. 8K stars in 3 days is impressive traction, but the project is 3 days old -- maturity is a question mark. The interesting angle: they've decomposed the harness into 12 discrete subsystems (engine, tools, skills, plugins, permissions, hooks, commands, memory, tasks, coordinator, prompts, UI) which serves as a clean architectural reference. The multi-provider support (Anthropic, OpenAI, Copilot OAuth, DeepSeek, Ollama) is more comprehensive than most competitors. The ohmo personal agent app is nascent but interesting as a "your own Claude Code" concept. However, there's nothing here we can't already do with our tmux+CC setup, and the coordinator/multi-agent piece is listed as "ClawTeam integration planned" -- meaning it's not built yet. Watch for evolution but don't adopt.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Covers agent harness fundamentals (tools, skills, memory, hooks) but doesn't address our core needs: tmux orchestration, worktree isolation, multi-agent coordination substrate. Their coordinator subsystem mentions ClawTeam integration as "planned" -- the multi-agent story is aspirational. |
| **Novelty** | 4/10 | The 12-subsystem decomposition is a clean reference taxonomy, and multi-provider profile-scoped credential management is well done. But the core patterns (CLAUDE.md discovery, markdown skills, PreToolUse/PostToolUse hooks, memory persistence) are all documented in our catalogue via Everything Claude Code, Claude Agent SDK, and others. |
| **Actionable** | 3/10 | Nothing immediately adoptable. Our CC+tmux stack already provides everything OpenHarness offers at the single-agent level, and our orchestrator handles multi-agent coordination that OpenHarness doesn't yet have. The provider abstraction layer is interesting if we ever need multi-provider routing, but LiteLLM already covers that. |

---

## Overview

OpenHarness is an open-source Python framework from the Data Intelligence Lab at the University of Hong Kong (HKUDS) that provides a modular agent harness infrastructure. The project positions itself as an educational and practical reference for "how production agent systems work" -- decomposing the agent harness into clearly separated subsystems rather than delivering a monolithic tool.

The architecture follows a clean equation: **Harness = Tools + Knowledge + Observation + Action + Permissions**. The framework wraps any LLM (via Anthropic-compatible or OpenAI-compatible APIs) with 43 built-in tools, 54 commands, a markdown-based skills system, persistent MEMORY.md storage, and a PreToolUse/PostToolUse hook lifecycle. The permission system provides multi-level safety modes with path and command granularity.

The project launched v0.1.0 on April 1, 2026 and reached 8K+ stars within 3 days, indicating strong community interest -- likely driven by the HKU research brand and the open-source-Claude-Code positioning. A companion app called "ohmo" provides a personal agent experience with workspace isolation at `~/.ohmo`.

---

## Technical Architecture

```
openharness/
├── engine/           # Agent loop: streaming, tool-calling, retries, token counting
├── tools/            # 43 built-in: file I/O, shell, search, web, MCP client
├── skills/           # On-demand markdown knowledge loading (CLAUDE.md discovery)
├── plugins/          # Custom commands, hooks, agents, MCP servers
├── permissions/      # Multi-level access control, path/command rules
├── hooks/            # PreToolUse/PostToolUse lifecycle events
├── commands/         # 54 commands (/help, /commit, /plan, /resume...)
├── memory/           # Persistent cross-session MEMORY.md storage
├── tasks/            # Background task lifecycle management
├── coordinator/      # Subagent spawning, team registry (ClawTeam planned)
├── prompts/          # System prompt assembly, context injection
├── config/           # Layered config with migrations, profile management
└── ui/               # React + Ink terminal interface
```

### Core Loop

```
query → stream → tool-call evaluation → permission check → pre-hook
  → execution → post-hook → result integration → continue/stop
```

### Provider Architecture

Profile-scoped credential management with 5 built-in workflows:
1. **Anthropic-Compatible API** -- Claude, Kimi, GLM, MiniMax
2. **Claude Subscription** -- bridges local `~/.claude/.credentials.json`
3. **OpenAI-Compatible API** -- OpenAI, OpenRouter, DashScope, DeepSeek, Groq, Ollama
4. **Codex Subscription** -- bridges local `auth.json`
5. **GitHub Copilot** -- OAuth device flow (no API key)

### Data Model

- **Profiles**: Named config objects storing provider, auth endpoint, model, and API key
- **Workspace**: `~/.openharness/` for global config; `~/.ohmo/` for personal agent
- **Memory**: MEMORY.md markdown format (cross-session persistence)
- **Context**: CLAUDE.md auto-discovery and injection into system prompt
- **Hooks**: JSON-configured lifecycle events (PreToolUse, PostToolUse)

### Test Coverage

- 114 pytest tests passing
- 6 E2E test suites
- Output modes: text, JSON, stream-JSON (for programmatic consumption)

---

## Publisher Background

**HKUDS** is the Data Intelligence Lab at the University of Hong Kong, led by Professor Chao Huang. The lab has 87 public repositories and 9.4K GitHub followers. They are a prolific research group with strong publication records in data science, recommender systems, and graph neural networks. Notable prior projects include LightGCN and various knowledge graph systems.

The top contributor (tjb-tech, 129 of 208 commits) drives most of the implementation. The project has 1,447 forks in 3 days, suggesting significant academic and developer interest -- though the fork-to-star ratio (18%) is unusually high, which may indicate academic citation/study patterns rather than production adoption.

The Feishu and WeChat community channels signal a primary audience in the Chinese developer ecosystem.

---

## What's Valuable for Us

1. **12-Subsystem Taxonomy**: The clean decomposition (engine, tools, skills, plugins, permissions, hooks, commands, memory, tasks, coordinator, prompts, UI) is a useful reference checklist for validating that our own harness coverage is complete. Cross-reference with Master Blueprint Principle 2 (deterministic orchestration, LLM execution).

2. **Profile-Scoped Provider Management**: The credential management approach (named profiles with separate API keys per provider) is a clean pattern if we ever need multi-provider model routing beyond what LiteLLM provides.

3. **Non-Interactive Output Modes**: `--output-format json` and `--output-format stream-json` for programmatic agent consumption. This maps to our robot-mode patterns (NTM's `--robot`, Beads Viewer's `--robot-triage`).

4. **Setup Workflow UX**: The `oh setup` interactive workflow (provider → auth → model → profile) is a good reference for onboarding flows if we ever package our orchestrator for external use.

---

## What's NOT Relevant

1. **Single-Agent Focus**: OpenHarness optimizes the individual agent experience. Our architecture is fundamentally multi-agent with tmux-based coordination, worktree isolation, and state tracking across workers. The coordinator subsystem is "planned" but not built -- this is where our system is already operational. Conflicts with Master Blueprint Principle 4 (coordination overhead at exponent 1.724 requires architectural solutions, not just "planned features").

2. **Python Runtime**: Our stack is tmux + Claude Code (TypeScript/Node.js internals) + shell scripts. Adding a Python runtime dependency for agent infrastructure creates unnecessary complexity. Per Master Blueprint Principle 7 (build only what you've needed in the last 30 days), we don't need another harness runtime.

3. **React Terminal UI**: We already have cmux (rated 10/10 in our catalogue) as our terminal solution. A React+Ink TUI is architecturally redundant.

4. **Chinese Developer Ecosystem Focus**: Feishu/WeChat community channels and Chinese-language provider integrations (Moonshot/Kimi, Zhipu/GLM, DashScope) are not relevant to our German client work (BSI/DSGVO compliance, opencode.de requirements).

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: If we need multi-provider model routing for cost optimization (e.g., DeepSeek for bulk tasks, Claude for reasoning), the profile-scoped credential pattern is a clean reference.
- **Phase 4 (Days 90+)**: If the coordinator/ClawTeam subsystem matures, revisit as a potential Python-based alternative for non-Claude agent coordination.
- **Academic Reference**: The clean subsystem decomposition makes this a useful teaching resource for explaining agent harness architecture to stakeholders or new team members.

---

## Key Takeaway

> **OpenHarness is a well-structured open-source reference implementation of the Claude Code agent harness pattern in Python, but at 3 days old with no multi-agent coordination and no features beyond what our existing stack provides, it's a watch-list item, not an adoption candidate.**
