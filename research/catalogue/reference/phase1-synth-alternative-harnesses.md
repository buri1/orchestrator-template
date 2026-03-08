# Phase 1 Synthesis: Alternative Harnesses & Orchestration Tools

> **Seven competing agent harnesses evaluated with suitability verdicts, plus four harness-agnostic tools and the five-layer convergence pattern defining the orchestration landscape in March 2026.**

| Field | Value |
|-------|-------|
| Type | Reference Document |
| Original Source | `research/2026-03-05_SYNTHESIS_alternative-harnesses.md` |
| Research Phase | Phase 1 |
| Last Updated | 2026-03-08 |

---

## Burak's Notes

> *(empty -- reserved for Burak)*

---

## Summary

This synthesis evaluates seven viable alternatives to Claude Code as orchestration harnesses: OpenCode, Goose, Aider, Cline CLI 2.0, Codex CLI, Roo Code, and the Claude Agent SDK. Each occupies a distinct architectural niche -- from OpenCode's HTTP+SSE platform (100K+ stars, 650K MAU) to Goose's MCP-native Rust runtime (27K stars, Linux Foundation AAIF) to Aider's git-native single-agent approach (30K+ stars). The harness landscape is mature enough that there is no single "best" choice -- only a best choice for a given set of constraints.

Beyond the harnesses themselves, four harness-agnostic tools emerged as significant: Vibe Kanban (Rust backend supporting 10+ agents with git worktree isolation), Overstory (the purest adapter-pattern implementation with SQLite mail), agtx (spec-driven per-phase agent mixing via TOML), and Bridle (configuration normalization across 7+ harnesses). The synthesis also identifies a clear five-layer convergence pattern across all enterprise and production-grade systems: protocol decoupling, MCP as tool lingua franca, git worktrees for isolation, event-driven coordination, and deterministic routing with LLM fallback.

The verdict for Claude-committed, local-first, human-in-the-loop orchestration: Claude Code remains the pragmatic choice, with the Claude Agent SDK as the recommended evolution path. For model agnosticism, OpenCode's SDK or Goose's Goosetown are frontrunners.

---

## Key Findings

### Harness Suitability Verdicts

| Harness | Verdict | Key Strength | Key Weakness |
|---------|---------|-------------|-------------|
| **OpenCode** | Strongest OSS orchestration *platform* | HTTP server + SDK + event bus; multi-model Teams | Permission propagation bugs in nested subagents |
| **Goose** | Strongest for *self-contained* orchestration | MCP-native, Beads crash recovery, model-agnostic | Rust codebase raises contribution barrier |
| **Aider** | Best *agent runtime* to wrap inside an orchestrator | Python API, `--message` batch, tree-sitter repo map | No multi-agent support whatsoever |
| **Cline CLI 2.0** | Best *programmatic building block* | gRPC API with Protocol Buffers, cleanest typed interface | Must build all orchestration logic yourself |
| **Codex CLI** | Most *production-ready* multi-agent system | App Server protocol, native worktree isolation | OpenAI model lock-in |
| **Roo Code** | Most mature *in-IDE* orchestration | Orchestrator mode + Boomerang Tasks | No headless/CLI mode, unusable as substrate |
| **Claude Agent SDK** | Path of least resistance for Claude teams | Typed AgentDefinition, lifecycle hooks, session persistence | Total Claude lock-in, loss of terminal visibility |

### Harness-Agnostic Tools

- **Vibe Kanban** (9.4K stars): Kanban board as orchestration surface. Supports 10+ agents with git worktree per agent. Limited to task-board orientation (no dependency graphs or inter-agent communication).
- **Overstory**: Pluggable `AgentRuntime` interface with SQLite WAL-mode mail (~1-5ms per query), FIFO merge queue with 4-tier conflict resolution. Most architecturally complete but early-stage.
- **agtx**: TOML-based spec-driven workflows enabling per-phase agent mixing (Gemini for planning, Claude for implementation, Codex for review). Unique cross-model capability.
- **Bridle**: Auto-translates configuration formats across Amp, Claude Code, OpenCode, Goose, Copilot CLI, Crush, and Droid. Essential infrastructure for harness-agnostic orchestrators.

### Five-Layer Convergence Pattern

1. **Protocol decoupling** -- Agent logic separated from client surfaces via stable API
2. **MCP as tool lingua franca** -- AAIF (Anthropic + OpenAI + Block under Linux Foundation) cements MCP as universal
3. **Git worktrees for isolation** -- Consensus pattern for parallel work on same repository
4. **Event-driven coordination** -- File-based polling being replaced by event buses, SSE, SQLite mail
5. **Deterministic routing with LLM fallback** -- Code-defined routing for predictable coordination, LLM only for ambiguous cases

### Patterns to Steal

| Source | Pattern | Application |
|--------|---------|-------------|
| OpenCode | HTTP+SSE transport | Replace terminal emulation with structured event streams |
| Goose | Beads crash recovery | Git-backed atomic work units with status tracking |
| Aider | Tree-sitter repo map | PageRank-weighted symbol extraction for context injection |
| Codex CLI | Git worktree per agent | Eliminates file-level conflicts between parallel agents |
| Roo Code | Mode-scoped tool permissions | Per-role tool whitelisting prevents scope creep |
| Cline | gRPC protocol decoupling | Typed programmatic control, network-distributable |
| Claude Agent SDK | PreCompact hooks | Preserve critical state during context compaction |
| Overstory | Pluggable runtime adapters | `AgentRuntime` interface for harness-agnostic expansion |
| Gas Town MEOW | JSONL write-ahead log | Crash recovery without dependencies |
| agtx | Per-phase agent mixing | Different agents for different workflow phases via TOML |

---

## Actionable Insights

1. **Immediate zero-cost improvements** regardless of harness choice: add JSONL write-ahead logging for crash recovery, adopt git worktrees for agent isolation, and scope tool permissions per agent role.
2. **The model lock-in split is real** -- the industry divides between model-locked ecosystems (Claude Agent SDK, Codex CLI) and model-agnostic platforms (OpenCode, Goose, Pi). Choosing a harness implies choosing a model ecosystem.
3. **Terminal emulation is a dead end** -- the industry is moving from `tmux send-keys` to HTTP APIs and gRPC. Plan the migration path.
4. **Adapter pattern is insurance** -- Build an `AgentRuntime` interface (Overstory pattern) so the orchestration layer survives any individual harness change.
5. **Community orchestration is a signal** -- oh-my-opencode (46 hooks, 26 tools), swarm-tools (40+ coordination tools) indicate where the ecosystem energy is concentrating.

---

## Cross-References

| Entry | Relationship |
|-------|-------------|
| [reference/harness-comparison-matrix.md](../reference/harness-comparison-matrix.md) | Detailed quantitative scoring of 10 harnesses across 20 dimensions |
| [agent-harnesses/pi-agent.md](../agent-harnesses/pi-agent.md) | Primary harness choice with orchestration extension ecosystem |
| [agent-harnesses/opencode.md](../agent-harnesses/opencode.md) | Top alternative platform with HTTP+SSE architecture |
| [agent-harnesses/claude-agent-sdk.md](../agent-harnesses/claude-agent-sdk.md) | Recommended Claude-native evolution path |
| [practitioners/dotta.md](../practitioners/dotta.md) | Paperclip orchestrator validates harness-agnostic patterns |
| [practitioners/indydevdan.md](../practitioners/indydevdan.md) | "Tools shape beliefs" -- custom harness development philosophy |
| [reference/phase1-synth-pi-ecosystem.md](phase1-synth-pi-ecosystem.md) | Pi Agent ecosystem detail with 50-80 extensions |
| [reference/phase1-synth-vision-strategy.md](phase1-synth-vision-strategy.md) | Build vs. buy verdict and hybrid recommendation |
