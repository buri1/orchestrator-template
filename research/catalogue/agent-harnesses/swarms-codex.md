# Swarms (am-will)

> **Multi-agent orchestration skills for Claude Code and Codex — plan with explicit dependencies, execute in parallel waves.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [github.com/am-will/swarms](https://github.com/am-will/swarms) |
| GitHub Stars | 120 (as of 2026-03-08) |
| Publisher | am-will (solo dev, "Context Engineer") |
| License | MIT |
| Tech Stack | Pure prompt engineering (no runtime code); skills distributed via `npx skills add`; optional Context7 MCP |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Dependency-aware wave execution maps to problems we've solved differently (tmux + state files). The plan-then-execute pattern validates our approach but doesn't advance it. Claude Code native, which is our stack, but we already have deeper orchestration. |
| **Novelty** | 4/10 | Wave-based parallel execution is well-documented in our catalogue (see @LLMJunky post, Overstory, pi-agent-teams). The plan-file-as-shared-state concept is straightforward. No new abstractions beyond what we've seen. |
| **Actionable** | 5/10 | The structured plan document format (task IDs, `depends_on`, status, log, files edited) is a clean reference for anyone starting from scratch. For us, our orchestrator-state.json already serves this function with more sophistication. Could study the plan format as a simpler alternative for one-off feature work. |

---

## Overview

Swarms (am-will) is a pair of installable "skills" for Claude Code and OpenAI Codex that implement a two-phase orchestration pattern: planning with explicit dependency graphs, then wave-based parallel execution. It is **not** related to the Python framework [kyegomez/swarms](./../../orchestration-platforms/swarms.md) (5.8K stars) — this is an entirely separate project by a different author.

The core insight is straightforward: instead of sequential agent loops where each session starts fresh, an orchestrator researches the codebase once, generates a structured plan document with task dependencies, then coordinates subagents to execute tasks in parallel "waves" — where each wave contains tasks whose dependencies are already satisfied. The orchestrator verifies completed work before advancing to the next wave.

The implementation is notable for being **pure prompt engineering** — no runtime code, no framework, no library. The skills are structured prompts that leverage Claude Code's native subagent spawning and Codex's `multi_agents` feature flag. This makes it extremely lightweight but also limits its sophistication compared to code-backed orchestrators.

---

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│              User Feature Request                 │
└─────────────────────┬────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│           /swarm-planner (Skill)                  │
│                                                   │
│  1. Research codebase structure                   │
│  2. Fetch library docs (Context7 MCP)             │
│  3. Ask clarifying questions                      │
│  4. Generate dependency-ordered plan              │
│  5. Spawn review subagent for gap analysis        │
│  6. Output: [feature]-plan.md                     │
└─────────────────────┬────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│         [feature]-plan.md (Shared State)          │
│                                                   │
│  T1: [depends_on: []] Create schema               │
│  T2: [depends_on: []] Install packages            │
│  T3: [depends_on: [T1]] Repository layer          │
│  T4: [depends_on: [T1]] Service interfaces        │
│  T5: [depends_on: [T3,T4]] Business logic         │
│  T6: [depends_on: [T2,T5]] API endpoints          │
│                                                   │
│  Each task: status | log | files edited/created   │
└─────────────────────┬────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│        /parallel-task [plan-file] (Skill)         │
│                                                   │
│  Wave 1: T1, T2 (no deps) → parallel subagents   │
│    ↓ verify → update plan                         │
│  Wave 2: T3, T4 (T1 done) → parallel subagents   │
│    ↓ verify → update plan                         │
│  Wave 3: T5 (T3,T4 done) → parallel subagent     │
│    ↓ verify → update plan                         │
│  Wave 4: T6 (T2,T5 done) → parallel subagent     │
│    ↓ verify → complete                            │
└──────────────────────────────────────────────────┘
```

**Core Abstractions:**
- **Plan document**: Markdown file with task IDs, `depends_on` arrays, locations, descriptions, validation criteria, and mutable status/log/files fields
- **Wave**: A set of tasks whose dependencies are all satisfied — executed in parallel
- **Verification step**: Orchestrator checks completed work between waves before unblocking dependents
- **Subagent context injection**: Each subagent receives the full plan, specific file locations, and information about adjacent tasks

**Key Design Decisions:**
- **File-as-state**: The plan markdown file IS the state store — no database, no JSON, no external persistence
- **No git push during execution**: Subagents commit but never push, preventing merge conflicts during parallel waves
- **Manual plan save**: User must manually save the plan file before execution begins (a deliberate human-in-the-loop gate)

**Infrastructure Requirements:**
- Claude Code or Codex CLI
- Codex requires `multi_agents = true` in `~/.codex/config.toml`
- Optional: Context7 MCP server for library documentation fetching

---

## Publisher Background

**am-will** describes himself as a "Context Engineer, Developer, Husband, Father." He's a solo developer with 23 public repositories and 62 followers on GitHub. His most popular project is `codex-skills` (483 stars), a broader collection of AI skills. Other projects include `snag` (screenshot-to-text via Gemini), `everymcp` (universal MCP server installer), and `taskery`. He appears to be an active builder in the Claude Code / Codex skills ecosystem, but is not a known figure in the broader agent engineering community. No VC backing, no team, no company affiliation visible. Credibility is moderate — the skills work but there's no production track record at scale.

---

## What's Valuable for Us

**Plan Document Format**: The task schema (`depends_on`, `status`, `log`, `files edited/created`, `validation`) is a clean, minimal specification for dependency-aware task tracking. While our `orchestrator-state.json` is more sophisticated, this format could be useful as a **human-readable companion artifact** — a plan.md that agents and humans can both read without parsing JSON. Aligns with the community consensus from our talks research that "plan.md > plan mode" (Community Unconference talk).

**Wave Verification Pattern**: The explicit verification step between waves — where the orchestrator checks completed work before unblocking dependents — is a pattern we implement implicitly but could make more explicit. Our Master Blueprint Principle #2 (deterministic orchestration) supports formalizing this as a gate.

**No-Push-During-Parallel Rule**: The decision to have subagents commit but never push during parallel execution is a practical solution to the merge conflict problem we documented in our research (19-20% conflict rate at scale). Simple and effective.

**Context7 Integration**: The use of Context7 MCP for fetching current library documentation during planning is a pattern worth noting. We have Context7 catalogued at 4/10 relevance, but seeing it used concretely for plan-time context assembly suggests it's more useful than initially assessed — at least for the planning phase.

---

## What's NOT Relevant

**Pure Prompt Engineering Without Runtime**: Our orchestrator has a real state management layer (JSON state files, tmux session management, health monitors, budget circuit breakers). A prompt-only approach can't implement crash recovery, cost tracking, or deterministic routing. Conflicts with Master Blueprint Principle #2 — the orchestrator should be deterministic code, not LLM-interpreted prompts.

**No Observability or Cost Tracking**: There's no token tracking, no cost-per-task attribution, no tracing. For our $50K contract work, we need audit trails. This tool provides none.

**Single Plan File as State**: A markdown file with no schema validation, no locking, no versioning beyond git is fragile. Multiple subagents updating the same markdown file concurrently is a race condition waiting to happen. Our JSON state + tmux isolation is more robust.

**Codex/Claude Code Lock-In**: The skills only work within Codex or Claude Code's skill system. No API, no SDK, no way to integrate into a broader automation pipeline. Conflicts with Master Blueprint Principle #6 (federated systems, thin meta-layer) — can't federate what has no integration points.

**Scale Limitations**: The wave model is fine for 4-8 tasks in a feature build. It has no concept of agent pools, budget constraints, health monitoring, or the coordination overhead concerns from our DeepMind research (Principle #4, exponent 1.724). It's a solo developer's tool, not a production orchestrator.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: No immediate use. We have more sophisticated orchestration.
- **Phase 2 (Days 4-60)**: Could study the plan document format as inspiration for a human-readable plan.md companion to our JSON state. Low priority.
- **Phase 3 (Days 60-90)**: If we build skill distribution for our orchestrator patterns (packaging them for others), the `npx skills add` distribution model is worth studying as a reference.
- **Phase 4 (Days 90+)**: If we productize our orchestrator as a service, understanding the simpler skill-based approach helps us position against it.

---

## Key Takeaway

> **A clean but shallow implementation of dependency-aware wave execution as pure prompt engineering skills — validates patterns we already use (plan-then-execute, wave parallelism, no-push-during-parallel) but lacks the runtime, state management, and observability needed for production orchestration.**
