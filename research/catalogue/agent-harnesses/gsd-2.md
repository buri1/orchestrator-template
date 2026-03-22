# GSD 2 — Get Shit Done: Autonomous Coding Agent CLI

> **gsd-build — GitHub, 2025-2026 (active)**

| Field | Value |
|-------|-------|
| Source | https://github.com/gsd-build/gsd-2 |
| Author | gsd-build community |
| Type | Agent Harness / CLI |
| Runtime | Pi SDK (TypeScript) |
| Install | `npm install -g gsd-pi@latest` |
| Stars | 2.6K |
| License | MIT |
| Topics | autonomous-agents, pi-sdk, task-orchestration, crash-recovery, testing-gates, worktree-isolation |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this tool. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **File-driven state machine over prompt loops** — GSD's core innovation is replacing Claude Code's accumulated-context loop with a `.gsd/` file-based state machine. Every task gets a fresh 200K-token context with pre-inlined dispatch prompts. This is the same insight our orchestrator arrived at independently: context is a resource, not a conversation.

2. **Seven data protection guards against silent loss** — v2.41.0 codifies 7 specific failure modes that cause agents to silently lose work: hallucination (zero tool calls = fake completion), merge anchor drift, dirty tree conflicts, doctor timing races, root file loss on teardown, empty merge deletion, and orphaned checkboxes. Each has a deterministic guard. These map directly to our incident history.

3. **Verification command enforcement with auto-fix retries** — After every task, GSD runs configured verification commands (`npm run lint`, `npm run test`, etc.) and auto-retries with a fix prompt on failure. This is Huntley's Back Pressure Hierarchy implemented as a deterministic gate — the agent cannot advance until tests pass.

4. **Sliding-window stuck detection** — Detects repeated dispatch patterns (including multi-unit cycles) using a sliding window. On detection: retry once with deep diagnostic prompt. If still stuck: stop with exact file reference. Prevents the "loop of death" failure mode from our MAST taxonomy.

5. **Adaptive roadmap reassessment between slices** — After each slice completes, the roadmap is reassessed against new information. Slices can be reordered, added, or removed. This is spec-driven development (Huntley 3.2) with a feedback loop — the plan evolves based on what the agent learns.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Built on Pi SDK (our Day 60+ candidate). Solves the exact same orchestration problems we face: context management, crash recovery, testing gates, worktree isolation, stuck detection. Direct competitor/inspiration for our orchestrator. |
| **Actionable** | 9/10 | Seven data protection patterns are immediately adoptable. Verification enforcement pattern, stuck detection, and work hierarchy (Milestone → Slice → Task) are concrete architectural decisions we can evaluate against our current loop. |

---

## Summary

GSD 2 is the evolution of a popular Claude Code prompt framework ("Get Shit Done") into a standalone CLI built on the Pi SDK. It transforms agent-driven development from an interactive conversation into an autonomous state machine that manages context windows, git branches, token tracking, crash recovery, and task orchestration without human intervention.

The architecture centers on a **work hierarchy**: Milestone (shippable version, 4-10 slices) → Slice (demoable capability, 1-7 tasks) → Task (one context-window unit). Each task gets a fresh 200K-token context with pre-inlined dispatch prompts containing only the relevant files, eliminating the "accumulated garbage" problem where long agent sessions degrade as context fills with stale information.

GSD's most distinctive contribution is its **data protection layer** (v2.41.0), which codifies 7 specific silent-failure modes and adds deterministic guards for each. The hallucination guard rejects task completions with zero tool calls — an agent that produces a detailed summary without writing any code is flagged as fabricated (previously costing ~$25 per milestone). Merge anchor verification ensures code is actually on the integration branch before deleting worktrees. These guards address failure modes that are well-documented in our own incident history (INC-007 polite kill, L-INC-014 skipped testing).

The **verification command enforcement** pattern runs configured shell commands (lint, test, build) after every task with auto-fix retries before the agent can advance. This is Back Pressure Hierarchy (Huntley) implemented structurally — not as a prompt instruction but as a gate the state machine enforces. Combined with the **sliding-window stuck detection** (repeated dispatch patterns trigger diagnostic retry, then hard stop), GSD achieves a level of autonomous reliability that most prompt-based orchestrators cannot match.

Multi-terminal steering, headless mode for CI, a forensics debugger for failure investigation, and budget ceilings with per-unit cost tracking round out the developer experience. The system supports 20+ LLM providers with automatic model fallback chains (transient errors → delay → retry → switch model; permanent errors → pause for human review).

---

## Notable Quotes

> "One command. Walk away. Come back to a built project with clean git history."

> "Execute-task agents that complete with zero tool calls are now rejected as hallucinated."

> "v1 accumulated garbage in the context window. v2 gives each task a fresh 200k-token context."

---

## Architecture Patterns (Adoptable)

### 1. Hallucination Guard (Zero Tool Call Rejection)
If a worker completes a task with zero tool calls, reject the result as fabricated. Agent produced a summary without doing work.
- **Maps to**: Our REVIEW step — add check: "Did the worker actually modify files?"
- **Implementation**: After `cmux wait-for` / `tmux capture-pane`, verify `gh pr diff` shows actual changes. If PR is empty or branch has no commits, reject.
- **Priority**: High — prevents $25/milestone waste on fake completions.

### 2. Merge Anchor Verification
Before deleting a worktree/branch, verify the code is present on the integration branch.
- **Maps to**: Our CLOSE_WORKER step — add check before `git worktree remove`
- **Implementation**: `git log main --oneline | grep "<commit-hash>"` or `git branch --contains <hash>`
- **Priority**: High — prevents orphaning commits on squash-merge edge cases.

### 3. Verification Command Enforcement
Configured shell commands (lint, test, build) run after every task. Failures trigger auto-fix retries.
- **Maps to**: PreCompletionChecklist (ADOPTABLE-PATTERNS 2.1) + Back Pressure Hierarchy (3.1)
- **Implementation**: Worker prompt includes mandatory verification step. Orchestrator verifies CI status before accepting PR.
- **Priority**: High — already partially implemented, needs formalization.

### 4. Sliding-Window Stuck Detection
Track last N dispatch patterns. If same pattern repeats 3x (including multi-step cycles), inject diagnostic prompt. If still stuck after retry, stop with exact context.
- **Maps to**: LoopDetection Middleware (ADOPTABLE-PATTERNS 2.1). GSD's version is more sophisticated — handles multi-unit cycles, not just single-step repeats.
- **Implementation**: Add to orchestrator's `capture-pane` / `read-screen` polling. Parse for repeated error patterns.
- **Priority**: High — prevents loop-of-death (MAST failure mode).

### 5. Work Hierarchy (Milestone → Slice → Task)
Three-level decomposition ensures each context window gets exactly one task-sized unit.
- **Maps to**: Our Epic → Story → Task hierarchy. GSD's "Slice = demoable capability" maps to our Story.
- **Evaluation**: Our hierarchy is similar but less formalized. Consider adopting GSD's explicit "one context-window unit" sizing for tasks.

### 6. Crash-Safe Task Closeout
Orphaned checkboxes in plan files are unchecked on retry. Lock files track current state. Recovery synthesizes a briefing from surviving tool call records.
- **Maps to**: Our `orchestrator-state.json` + `session-start.sh` recovery. GSD's approach of synthesizing from tool call records is more sophisticated than our state file approach.
- **Priority**: Medium — our crash recovery works but could be enhanced.

### 7. Adaptive Roadmap Reassessment
After each slice completes, reassess the roadmap against new information. Plans evolve based on what the agent learned.
- **Maps to**: Not yet implemented in our orchestrator. Currently we execute stories linearly from epics.
- **Priority**: Medium — valuable for longer sprints where early stories reveal architectural changes needed.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/gsd-build/gsd-2/tree/main/docs | Full documentation covering auto mode, token optimization, CI/CD pipeline, team workflows | `/ingest-article` on specific docs pages |
| GSD v1 (original prompt framework) | Understanding the evolution from prompt → CLI helps evaluate our prompt-only approach | `/ingest-article` |
| GSD Discord | Community patterns and failure reports | Monitor |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| [Pi SDK](./pi/pi-agent.md) | Core runtime — GSD is built on Pi SDK's `createAgentSession()` | Yes — [pi-agent.md](./pi/pi-agent.md) |
| Pi Web (`pi --web`) | Browser-based dashboard via Pi's web mode | Yes — covered in Pi Agent entry |
| VS Code Extension | IDE integration for GSD workflows | Not yet catalogued — low priority (VS Code specific) |

---

## Comparison with L-Thread Orchestrator

| Dimension | GSD 2 | L-Thread Orchestrator (cmux v4.1) |
|-----------|-------|-----------------------------------|
| **Runtime** | Pi SDK (TypeScript CLI) | Claude Code + cmux (pure prompts) |
| **Context management** | Fresh 200K per task, pre-inlined files | Fresh per worker (worktree isolation) |
| **State** | `.gsd/` file-based state machine | `orchestrator-state.json` + sidebar metadata |
| **Worker signaling** | Lock files + PID liveness detection | Event-driven `cmux wait-for` (zero-polling) |
| **Stuck detection** | Sliding-window pattern matching | Nudge logic (less sophisticated) |
| **Crash recovery** | Session synthesis from tool call records | State file + latch files + session-start hook |
| **Testing gate** | Verification commands with auto-fix retries | E2E screenshot gate (structural, no auto-fix) |
| **Data protection** | 7 explicit guards (hallucination, merge anchor, etc.) | Not yet formalized |
| **Work hierarchy** | Milestone → Slice → Task (3 levels) | Epic → Story (2 levels, task implicit) |
| **Parallel workers** | Multi-worker with `.gsd/parallel/` IPC | 8+ workers via cmux workspaces + worktrees |
| **Cost tracking** | Per-unit ledger with budget ceilings | Not yet integrated (ccusage evaluated) |
| **Roadmap adaptation** | Reassesses after each slice | Linear execution from epics |
| **Observability** | Dashboard + forensics debugger | cmux sidebar (progress, status, logs) |
| **Headless/CI** | `gsd headless` with auto-restart + backoff | Not yet (manual `run.sh` launch) |

**Key advantages GSD has over us:** Hallucination guard, verification auto-fix retries, sliding-window stuck detection, roadmap reassessment, cost tracking with budget ceilings, headless CI mode.

**Key advantages we have over GSD:** Event-driven signaling (zero-polling vs lock files), native browser E2E (`cmux browser`), sidebar real-time observability, simpler architecture (prompts vs TypeScript CLI).

---

## Action Items

- [ ] Adopt hallucination guard: reject worker results with zero file changes (Pattern 1)
- [ ] Adopt merge anchor verification before worktree cleanup (Pattern 2)
- [ ] Formalize verification command enforcement in worker prompts (Pattern 3)
- [ ] Upgrade stuck detection from simple nudge to sliding-window pattern matching (Pattern 4)
- [ ] Evaluate GSD's 3-level work hierarchy vs our 2-level approach (Pattern 5)
- [ ] Add to ADOPTABLE-PATTERNS.md: Hallucination Guard, Merge Anchor Verification, Adaptive Roadmap Reassessment
- [ ] Consider `gsd headless` as reference for future CI/headless orchestrator mode
