# oh-my-pi

> **AI Coding agent for the terminal — hash-anchored edits, optimized tool harness, LSP, Python, browser, subagents, and more.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [can1357/oh-my-pi](https://github.com/can1357/oh-my-pi) |
| GitHub Stars | 1,760 (as of 2026-03-08) |
| Publisher | Can Boluk (can1357) — solo (security researcher / reverse engineer) |
| License | MIT |
| Tech Stack | TypeScript, Rust (N-API native addon ~7,500 LOC), Node.js |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-05 |

---

## Burak's Notes

> *(empty)*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Worktree isolation, subagent system, and model routing map directly to the Master Blueprint's federated multi-agent architecture |
| **Novelty** | 8/10 | Hashline editing is genuinely new; LSP-as-feedback-loop and fuse-overlay isolation are not seen elsewhere in agent harnesses |
| **Actionable** | 8/10 | Worktree isolation pattern is immediately adoptable; MCP connection pooling and model routing are short-term wins |

---

## Overview

oh-my-pi is a batteries-included fork of Pi Agent (by Mario Zechner), created and maintained by Can Boluk. It re-engineers the agent harness at the systems level, with performance-critical paths written in Rust and compiled to native N-API addons. The core thesis is that the harness — the interface between model output and workspace changes — is a bigger bottleneck than the model itself, validated by benchmarks showing 10x task success improvements on some models purely from harness changes.

The project is a monorepo of six packages: `pi-coding-agent` (CLI), `pi-ai` (provider abstraction), `pi-agent-core` (agent loop), `pi-tui` (terminal UI), `pi-natives` (Rust addon), and `pi-utils`. It ships with hash-anchored editing, LSP integration for 40+ languages, built-in headless browser with 14 stealth plugins, in-process subagents with worktree isolation, a persistent IPython kernel, and a memory pipeline. Mario Zechner himself endorses it as "the batteries included version of pi."

At v13.9.2 with ~1,300 commits and 134 forks, the project iterates aggressively. A secondary fork (az9713/oh-my-pi) adds telemetry, MCP resilience, and test infrastructure, indicating the project is becoming a platform for further extension.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│                   omp CLI                        │
│              (pi-coding-agent)                   │
├──────────┬───────────┬───────────┬───────────────┤
│  pi-ai   │ pi-agent  │  pi-tui   │   pi-utils    │
│ (LLM     │   -core   │ (Terminal │   (Logging)   │
│ provider │ (Agent    │    UI)    │               │
│ abstrac- │  loop +   │           │               │
│  tion)   │  tools)   │           │               │
├──────────┴───────────┴───────────┴───────────────┤
│              pi-natives (Rust N-API)             │
│   hashline · diffing · hot-path ops · AVX2/ARM  │
└──────────────────────────────────────────────────┘
```

**Key components:**

- **Hashline Engine (Rust):** Every line tagged with a content hash. Edits reference hashes instead of text, eliminating whitespace errors, "string not found" failures, and ambiguous matches. Stale-file detection rejects edits if file changed since last read.
- **LSP Client:** Process-level JSON-RPC runtime supporting 11 operations (diagnostics, definition, references, hover, rename, etc.) across 40+ languages. Uses `lspmux` multiplexer for sharing a single language server across multiple clients. Auto-discovers project-local LSP servers.
- **Browser Automation:** Chromium-based headless browser with accessibility tree snapshots, 14 stealth plugins (WebGL, audio, fonts, user agent, etc.), and runtime headless/visible toggle.
- **Subagent System:** In-process via `createAgentSession()`. MCP proxy inheritance lets children reuse parent MCP connections. Concurrency-limited batch processing. Role-based model selection (`pi/smol`, `pi/slow`, `pi/plan`).
- **Worktree Isolation:** Three backends — git worktrees, Unix fuse-overlay, Windows ProjFS. Two merge strategies — patch (direct apply) and branch (cherry-pick for clean history).
- **Provider Discovery:** Auto-discovers config from `.omp/`, `.claude/`, `.codex/`, `.gemini/`, `.opencode/`, cursor, vscode, windsurf, and more.
- **Session Management:** Two-phase compaction (cut-point detection + LLM summarization), session branching/forking, overflow recovery.
- **Memory Pipeline:** Two-phase extraction of durable knowledge from sessions into reusable skills. SQLite-backed job queues.
- **TTSR:** Time Traveling Streamed Rules — injects AI rules based on output patterns just-in-time, not upfront in system prompt.

---

## Publisher Background

Can Boluk (can1357) is a security researcher and reverse engineer with deep expertise in Windows kernel development, application security, and low-level systems programming. This background is visible in the project's systems-level approach: Rust native addons, fuse-overlay filesystem isolation, CPU microarchitecture-aware builds (AVX2 detection), and lspmux integration. The project is a solo effort with ~1,300 commits. The fork originates from pi-mono by Mario Zechner (badlogicgames), creator of Pi Agent, who publicly endorses oh-my-pi.

---

## What's Valuable for Us

**HIGH PRIORITY:**

1. **Worktree Isolation Per Agent** — The orchestrator currently shares a filesystem across tmux-spawned agents, creating race conditions. oh-my-pi's pattern: `git worktree add` before spawning, agent works in isolation, `captureDeltaPatch()` on completion, `git worktree remove` cleanup. Branch merge strategy preserves atomic commits per task. The `EnterWorktree` tool already exists in Claude Code.

2. **Hash-Anchored State Integrity** — While we cannot change Claude Code's edit tool, the content-hash verification principle applies to orchestrator state file management (`_bmad/orchestrator-state.json`). Hash-verify before writing to prevent corruption from concurrent agent access.

**MEDIUM PRIORITY:**

3. **MCP Connection Pooling** — oh-my-pi's `createMCPProxyTools()` lets subagents reuse parent MCP connections. The orchestrator should maintain a shared Chrome DevTools browser instance (one browser, multiple pages/tabs) instead of each agent launching its own.

4. **Model Routing by Role** — Route scout agents (exploration) to cheap models, implementation agents to frontier models, review agents to mid-tier. Direct cost optimization without quality loss.

5. **LSP as Agent Feedback Loop** — Instant diagnostics after every edit eliminates slow build-fail-retry cycles. Practical path: LSP MCP server + `lspmux` for sharing across agent worktrees.

---

## What's NOT Relevant

- **Full fork adoption** — oh-my-pi is a Pi Agent fork, not a Claude Code extension. We cannot run it as our primary harness since the orchestrator is built on Claude Code. The value is in extracting patterns, not switching tools.
- **Browser stealth plugins** — The 14 bot-detection evasion plugins are irrelevant for E2E testing against our own applications. Only relevant if agents need to scrape third-party services.
- **TTSR (Time Traveling Streamed Rules)** — High implementation complexity, marginal benefit for orchestrator-managed agents that already have focused system prompts.
- **Python kernel integration** — We use TypeScript/Node.js. The persistent IPython kernel pattern is interesting but not applicable to our stack.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Adopt worktree isolation for every spawned agent using `git worktree add` / `EnterWorktree`. Apply hash-verification to state file writes.
- **Phase 2 (Days 4-60):** Implement model routing (scout/implementer/reviewer roles). Pool MCP connections (single Chrome DevTools instance, shared pages).
- **Phase 3 (Days 60-90):** Integrate LSP MCP server with `lspmux` for instant type-checking feedback across agent worktrees.
- **Phase 4 (Days 90+):** Build memory/learning system tracking task outcomes across orchestration runs. Feed successful patterns back as agent instructions (inspired by oh-my-pi's memory pipeline).

---

## Key Takeaway

> **The harness matters more than the model — oh-my-pi's benchmarks prove that 10x task success improvements can come purely from better tooling around the model, and its worktree isolation pattern is the single most directly adoptable feature for multi-agent orchestration.**
