# Codebuff

> **Generate code from the terminal — multi-agent orchestration with model-per-task routing.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harness |
| Repository | [CodebuffAI/codebuff](https://github.com/CodebuffAI/codebuff) |
| Website | [codebuff.com](https://www.codebuff.com/) |
| GitHub Stars | 4,112 (as of 2026-03-08) |
| Publisher | Codebuff AI (startup, YC-backed; formerly "Manicode") |
| License | Apache-2.0 |
| Tech Stack | TypeScript (97%), Bun runtime, OpenRouter (multi-model), Tree-sitter, Relace AI (speculative decoding) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Agent harness competitor from Airtable research list. The multi-agent architecture with per-task model routing is the most interesting aspect — they independently arrived at a similar conclusion to our Master Blueprint's "70/30 deterministic/LLM" principle, but applied it as model-per-role specialization rather than deterministic-vs-LLM separation. The pricing at $50-200/mo positions it as a Claude Max competitor. Worth watching for their BuffBench evaluation framework and the best-of-N "Max mode" pattern.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Interesting multi-agent patterns and model routing, but it's a hosted service with vendor lock-in — we build our own orchestration layer |
| **Novelty** | 6/10 | Multi-agent pipeline with per-task model assignment is well-executed; Max mode (best-of-N) is a pattern we haven't catalogued elsewhere; BuffBench eval framework is notable |
| **Actionable** | 5/10 | Agent definition schema and model routing patterns are study-worthy; can't directly adopt since their orchestration is server-side and proprietary |

---

## Overview

Codebuff is a terminal-based AI coding assistant that uses a multi-agent orchestration pipeline rather than single-model inference. The system is built around a central orchestrator agent ("Buffy") running on Claude Opus 4.6 that reads user prompts, gathers context, and spawns specialized subagents — each running on a different LLM optimized for its task type.

The key architectural insight is **model-per-role specialization**: file discovery runs on Gemini Flash (fast, cheap), thinking/reasoning on GPT-5.x or Gemini 2.5 Pro, editing on Claude Opus 4.6 or GLM 4.7, reviewing on Claude Opus 4.6, and terminal commands on lighter models like Claude Haiku or Grok Fast. This mirrors the model tiering pattern we've seen in oh-my-claudecode, Mendral, and Kilo Code, but Codebuff pushes it further with 7 distinct agent roles.

Previously branded as "Manicode," the tool is YC-backed and open source under Apache-2.0. It offers both a CLI (`npm install -g codebuff`) and an SDK (`@codebuff/sdk`) for embedding agents in applications. The codebase uses Bun as runtime, Tree-sitter for code mapping, and Relace AI's speculative decoding for file rewrites. They also maintain a custom agent definition system (`.agents/` directory) that allows users to define custom agents with model selection, tool access, and programmatic control via generator functions.

---

## Technical Architecture

### Multi-Agent Pipeline (5 stages)

```
User Prompt → Buffy (Orchestrator, Claude Opus 4.6)
                │
                ├─→ 1. Indexing: Tree-sitter scans repo → code map (~2s)
                ├─→ 2. File Picker (Gemini Flash): Locates relevant files
                │   └─→ Code Searcher: Pattern matching via grep-style queries
                ├─→ 3. Thinker (GPT-5.x / Gemini 2.5 Pro): Problem decomposition
                ├─→ 4. Editor (Claude Opus 4.6 / GLM 4.7): Code modifications
                │   └─→ [Max Mode]: Multiple editors, different strategies → selector picks best
                └─→ 5. Reviewer (Claude Opus 4.6): Quality validation
                    └─→ Commander (Grok Fast / Claude Haiku): Runs tests
```

### Operating Modes

| Mode | Orchestrator Model | Behavior |
|------|-------------------|----------|
| **Default (base2)** | Claude Opus 4.6 | Single implementation pass |
| **Free (base2-free)** | MiniMax M2.5 | Faster, no credit cost, includes review |
| **Max (base2-max)** | Claude Opus 4.6 | Best-of-N: multiple editors + selector |
| **Plan (base2-plan)** | Claude Opus 4.6 | Analysis only, no file modifications |

### Agent Definition Schema

```typescript
{
  id: string,              // lowercase, hyphens only
  displayName: string,
  model: string,           // any OpenRouter model
  toolNames: string[],     // read_files, write_file, str_replace, code_search,
                           // run_terminal_command, spawn_agents, web_search,
                           // read_docs, browser_logs, end_turn
  instructionsPrompt: string,
  spawnerPrompt?: string,
  spawnableAgents?: string[],
  handleSteps?: AsyncGenerator  // programmatic control mixing AI + logic
}
```

### Key Technical Details

- **Context management**: Stateless server streams to model providers over WebSockets; code stays local, only relevant context sent
- **File operations**: Tree-sitter builds code map, `str_replace` for surgical edits, `write_file` for full rewrites
- **Speculative decoding**: File rewrites use Relace AI for faster generation
- **Configuration**: `knowledge.md` for project context, `.codebuffignore` for exclusions, reads `AGENTS.md` and `CLAUDE.md`
- **Testing**: Bun test runner; E2E tests require tmux for interactive terminal simulation
- **Evals**: BuffBench — 175+ real tasks from OSS repos, 5-turn conversations, 4-dimensional scoring

---

## Publisher Background

YC-backed startup, previously operating under the name "Manicode." The rebrand to Codebuff came with a significant product evolution from single-model to multi-agent architecture. Active development with 6,018 commits on main, 471 forks, 33 open issues. The team maintains a community showcase repo (`codebuff-community`) and a separate `.agents` template repo. Founded in 2024, the product has iterated rapidly through multiple architectural generations. Their BuffBench evaluation framework (175+ tasks) shows engineering rigor around measurement — not just vibes-based claims.

---

## What's Valuable for Us

1. **Model-per-role routing table**: Their 7-agent, 6-model routing is the most granular we've catalogued. The specific assignments (Gemini Flash for file picking, Grok Fast for terminal commands, Opus for editing/reviewing) validate that model tiering isn't just cost optimization — it's task-quality optimization. This maps to Master Blueprint Principle 2 (deterministic orchestration, LLM execution) — the routing decision is deterministic, model selection is a lookup table.

2. **Max Mode (best-of-N selection)**: Spawning multiple editors with different strategies and using a selector to pick the best output is a novel quality pattern. We could adopt this for high-stakes code generation tasks where the cost of multiple runs is justified by reduced review burden (Principle 5: human review is the binding constraint).

3. **`handleSteps` generator pattern**: The ability to mix AI reasoning with programmatic control via async generators is an elegant abstraction for hybrid workflows. This is more flexible than pure prompt-only or pure code-only orchestration.

4. **BuffBench evaluation methodology**: 175+ real tasks, 5-turn conversations, 4-dimensional scoring. Their eval repo is worth studying for our own quality gate design.

5. **Agent definition schema**: The `.agents/` convention with TypeScript definitions, `spawnerPrompt`, and `spawnableAgents` is a clean API for declarative multi-agent systems. Compare with our current pure-prompt approach in `.claude/agents/`.

---

## What's NOT Relevant

1. **Hosted service model**: Credits, subscriptions, server-side orchestration — we run everything local on Claude Max (Principle 7: build only what you need; we already have the harness). Their $100-500/mo pricing buys convenience, not capability we lack.

2. **OpenRouter dependency**: Multi-model routing via OpenRouter adds a third-party dependency and latency. Our architecture prefers direct provider APIs or LiteLLM as a self-hosted proxy (aligns with Principle 6: federated systems, thin meta-layer).

3. **SDK embedding pattern**: `@codebuff/sdk` for embedding agents in applications targets a different use case (SaaS builders) than our orchestrator-first architecture.

4. **WebSocket streaming architecture**: Their stateless server + WebSocket model is designed for a cloud product. We don't need this — our agents run in tmux sessions with direct file system access.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study BuffBench eval methodology for our quality gate pipeline. The 4-dimensional scoring (completion, efficiency, code quality, overall) could inform our E2E testing gates.
- **Phase 3 (Days 60-90)**: The `handleSteps` generator pattern could inspire a more flexible agent control mechanism if we move beyond pure prompt engineering. The model routing table could inform our LiteLLM configuration for cost-optimized multi-model dispatch.
- **Phase 4 (Days 90+)**: If building a SaaS product with agent capabilities, their SDK embedding pattern and agent definition schema become more relevant as reference architecture.

---

## Key Takeaway

> **Codebuff's 7-agent pipeline with per-task model routing is the most granular implementation of model tiering in our catalogue — study their routing table and Max Mode (best-of-N) pattern, but don't adopt the hosted service model.**
