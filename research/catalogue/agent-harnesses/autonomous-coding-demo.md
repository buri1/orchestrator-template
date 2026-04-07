# Autonomous Coding Agent Demo

> **Anthropic's reference implementation for long-running autonomous coding with the Claude Agent SDK — a minimal two-agent harness that builds complete applications across multiple sessions with persistent progress tracking.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [anthropics/claude-quickstarts/autonomous-coding](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding) |
| GitHub Stars | 15,131 (parent repo `claude-quickstarts`, as of 2026-03-08) |
| Publisher | Anthropic (bigtech — official quickstart examples) |
| License | MIT |
| Tech Stack | Python 3 (orchestration), Claude Agent SDK (Python `anthropic`), Claude Code CLI (`@anthropic-ai/claude-code`), Node.js (generated apps), Puppeteer MCP (browser verification) |
| Maturity | 🟡 Early (demo/reference implementation, not production framework) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Anthropic's own reference for multi-session autonomous coding. The session continuation pattern (JSON state + git commits + fresh context window) directly validates our orchestrator's state persistence approach. The two-agent pattern (initializer + coder) maps to our planning/execution separation. |
| **Novelty** | 5/10 | The patterns (feature list as source-of-truth, defense-in-depth security, session-based continuation) are things we've independently arrived at. The specific implementation of command allowlisting and Puppeteer-based verification adds modest new detail. |
| **Actionable** | 7/10 | The `security.py` hook pattern (pre-tool-use interception for bash commands) is directly adoptable. The `feature_list.json` as immutable progress tracker is a clean pattern for our E2E test tracking. The Puppeteer MCP integration for visual verification is immediately reusable. |

---

## Overview

The Autonomous Coding Agent Demo is a minimal harness from Anthropic's official `claude-quickstarts` repository that demonstrates how to build applications autonomously across multiple sessions. It implements a **two-agent pattern**: an Initializer Agent (Session 1) that reads a specification and generates a structured feature list with 200 test cases, and a Coding Agent (Sessions 2+) that iteratively implements features, verifies them through browser automation, and marks them as passing.

The key architectural insight is **session-based continuation with fresh context windows**. Each session starts with a clean context but inherits state through three persistence mechanisms: `feature_list.json` (immutable source of truth — only the `passes` field can change), `claude-progress.txt` (session notes), and git commit history. This avoids context window bloat while maintaining cross-session continuity — a pattern directly aligned with our orchestrator's state file approach.

The harness implements defense-in-depth security with three layers: OS-level sandbox isolation, filesystem restrictions to the project directory, and a bash command allowlist enforced via pre-tool-use hooks in the Claude SDK. This is the most explicit reference implementation Anthropic has published for how to secure autonomous agent execution.

---

## Technical Architecture

```
autonomous_agent_demo.py          ← Entry point: arg parsing, async loop
        │
        ▼
    agent.py                      ← Session orchestration
        │
        ├── Session 1: Initializer Agent
        │   ├── Reads app_spec.txt
        │   ├── Creates feature_list.json (200 test cases)
        │   ├── Sets up project structure + init.sh
        │   └── Initializes git repo
        │
        └── Sessions 2+: Coding Agent
            ├── Reads feature_list.json (counts pending)
            ├── Picks highest-priority incomplete feature
            ├── Implements + verifies via Puppeteer screenshots
            ├── Updates feature_list.json (passes: false → true)
            ├── Commits to git
            └── Auto-continues (3s delay) or pauses (Ctrl+C)
        │
        ▼
    client.py                     ← Claude SDK configuration
        ├── ClaudeSDKClient (max 1000 turns)
        ├── Pre-tool-use hooks → security.py
        ├── Puppeteer MCP server (7 browser tools)
        └── Built-in tools: Read, Write, Edit, Glob, Grep, Bash
        │
        ▼
    security.py                   ← Defense-in-depth
        ├── ALLOWED_COMMANDS allowlist
        ├── bash_security_hook() → intercepts all bash calls
        ├── extract_commands() + split_command_segments()
        └── Specialized validators: pkill, chmod, init.sh
```

### Core Data Model

**`feature_list.json`** — Immutable source of truth:
```json
{
  "features": [
    {
      "id": "feature-001",
      "name": "Feature Name",
      "description": "...",
      "status": "pending|passing|failing",
      "passes": false
    }
  ]
}
```

Critical constraint: features can never be deleted, reordered, or have their descriptions modified. Only `passes` can transition from `false` to `true`. This creates an append-only progress log that survives across sessions.

### Security Model

| Layer | Mechanism | Implementation |
|-------|-----------|----------------|
| 1. OS Sandbox | Isolated bash environment | SDK sandbox config |
| 2. Filesystem | Restrict to project directory | `.claude_settings.json` + cwd lock |
| 3. Command Allowlist | Explicit whitelist | `security.py` hook on pre-tool-use |

Allowed commands: `ls`, `cat`, `head`, `tail`, `wc`, `grep`, `cp`, `mkdir`, `chmod` (+x only), `pwd`, `npm`, `node`, `git`, `ps`, `lsof`, `sleep`, `pkill` (dev processes only), `init.sh`.

### Session Lifecycle

1. **Fresh client** created per session (no context carry-over)
2. **Prompt selection**: `initializer_prompt.md` (Session 1) or `coding_prompt.md` (Session 2+)
3. **Progress check**: `count_passing_tests()` reads `feature_list.json`
4. **Execution**: Claude processes with tool calls, subject to security hooks
5. **Auto-continue**: 3-second delay between sessions, or Ctrl+C to pause
6. **Resume**: Re-run same command; picks up from `feature_list.json` state

---

## Publisher Background

Anthropic is the creator of Claude and the Claude Agent SDK. This demo lives in their official `claude-quickstarts` repository (15,131 stars), which serves as the canonical collection of reference implementations for building on the Claude API. The repo was created 2024-08-29 and has been actively maintained through 2026-02-05 (last push). It has 2,542 forks, indicating substantial community adoption as a starting point.

This specific demo is significant because it represents **Anthropic's own opinion on how autonomous coding should be structured** — two-agent separation, immutable progress tracking, defense-in-depth security, and session-based continuation. It is the reference implementation for the patterns described in their agent harnesses documentation.

---

## What's Valuable for Us

### 1. Pre-Tool-Use Security Hook Pattern (`security.py` + `client.py`)
The `bash_security_hook()` function intercepts every bash command before execution, validates against an allowlist, and blocks unauthorized commands. This is the most concrete example of how to use Claude SDK hooks for security enforcement. **Directly adoptable** for our agents — we currently rely on `--dangerously-skip-permissions` which bypasses all safety checks.

### 2. Immutable Progress Tracker (`feature_list.json`)
The constraint "only `passes` can change" creates a corruption-resistant state file that survives across sessions, agent crashes, and context window resets. Maps to **Master Blueprint Principle #2** (deterministic orchestration) — the progress tracker is purely deterministic; the LLM only writes code and flips boolean flags.

### 3. Two-Agent Separation (Initializer + Coder)
The Initializer generates the structured plan; the Coder executes against it without modifying the plan. This is **context separation** (Master Blueprint Principle #3) applied within a single project — planning context never competes with implementation context in the same window.

### 4. Puppeteer MCP for Visual Verification
Seven browser tools (navigate, screenshot, click, fill, select, hover, evaluate) integrated via MCP. The coding prompt mandates **screenshot-based verification** before marking features as passing. This validates our E2E testing approach (CLAUDE.md Rule #2: "Chrome DevTools MCP ist Pflicht").

### 5. Fresh-Context-Per-Session Pattern
Each session creates a new `ClaudeSDKClient`, preventing context bloat. State is persisted externally (JSON + git), not in the conversation. This is the same pattern our orchestrator uses with `orchestrator-state.json` — validation from Anthropic themselves.

### 6. Auto-Continue with Pause/Resume
The 3-second `AUTO_CONTINUE_DELAY_SECONDS` between sessions with Ctrl+C pause is a clean UX pattern for long-running autonomous work. More elegant than our tmux-based approach where pausing requires manual intervention.

---

## What's NOT Relevant

### 1. Single-Project Scope
This demo builds one application at a time. Our architecture is multi-project, multi-business-line, federated. The demo's single-directory filesystem restriction wouldn't work for our worktree-per-agent pattern.

### 2. API-Key-Based Execution
Requires `ANTHROPIC_API_KEY`, meaning it uses API tokens (not Claude Max subscription). Our system runs on Claude Max for the 18-36x cost arbitrage. The demo's architecture would be prohibitively expensive at our scale (200 features * 5-15 min/session = many hours of API billing).

### 3. Node.js-Only Generated Apps
The demo assumes generated applications are Node.js-based (`npm`, `node` in allowlist). Our client work spans multiple tech stacks.

### 4. No Parallel Agent Execution
The demo runs one agent at a time, serially. Our orchestrator runs 2-3 agents in parallel (Master Blueprint Principle #4: optimal team is 2-3 agents). There is no coordination mechanism between agents.

### 5. No Quality Gate Pipeline
No lint, SAST, unit tests, or multi-model review. The only quality check is Puppeteer screenshots. Our Master Blueprint specifies a full quality pipeline: `Lint → SAST/DAST → Unit Tests → E2E → Multi-Model Review → Confidence Score → Human Review`.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt the `bash_security_hook()` pattern to add command allowlisting to our spawned agents, reducing the risk of `--dangerously-skip-permissions`. The immutable progress tracker pattern could replace our current task status management in `orchestrator-state.json`.

- **Phase 3 (Days 60-90)**: When migrating to Claude Agent SDK (Python or TypeScript), this demo serves as the simplest working reference for SDK client setup, hook registration, and MCP server configuration. It is literally the minimal viable harness.

- **Phase 4 (Days 90+)**: The two-agent pattern (planner + executor) could be extended to a three-agent pattern (planner + executor + reviewer) matching our planned quality gate architecture. The `feature_list.json` schema could evolve into a more sophisticated task decomposition format.

---

## Key Takeaway

> **Anthropic's own reference for autonomous coding validates our core patterns (external state persistence, fresh-context-per-session, planning/execution separation) while providing the most concrete example of Claude SDK security hooks — the `bash_security_hook()` in `security.py` is the single most adoptable artifact for hardening our agent spawning.**
