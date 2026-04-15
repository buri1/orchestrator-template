# Adoptable Patterns Backlog

> **Living document.** Collects actionable patterns, ideas, and lessons from catalogue research that should be considered for the L-Thread Orchestrator. Updated by ingest agents and manual sessions.
>
> **Location rationale:** Top-level in `research/catalogue/` alongside `INDEX.md` so any agent reading the catalogue sees it immediately. Referenced from `CLAUDE.md` and `INDEX.md`.

| Field | Value |
|-------|-------|
| Type | Living Backlog |
| Created | 2026-03-21 |
| Last Updated | 2026-04-03 ("Engineered Enough" complexity gate added from Garry Tan post) |
| Status | Active — append new patterns as they're discovered |

---

## How to Use This Document

- **Ingest agents**: After creating a catalogue entry, if you identify a pattern scoring 7+ relevance with concrete implementation steps, append it here under the appropriate section.
- **Orchestrator sessions**: Reference this when planning implementation work or sprint priorities.
- **Format**: Each pattern gets a `###` heading with source link, one-line summary, implementation sketch, and priority tag.

---

## 1. Lessons from Pi Orchestrator v2 (2026-03-12 to 2026-03-14)

The Pi orchestrator was a 2-day experiment running Pi Agent as a deterministic watchdog over Claude Code workers. It produced 8 documented incidents (`pi-orchestrator/_bmad/incidents.md`) before being abandoned in favor of the simpler tmux v3 architecture.

### What Worked

- **Stateless reducer pattern** — externalizing all state to JSON files survived compaction perfectly. Carried forward to v3.
- **JSONL telemetry** — append-only event log was invaluable for debugging. Carried forward.
- **Deterministic watchdog polling** — heartbeat-based monitoring was reliable when it worked.
- **Incident logging discipline** — INC-001 through INC-008 created a learning corpus that directly informed v3 design.

### What Failed (8 Incidents)

#### INC-001 & INC-002: Pi model routing is non-deterministic
**Source**: `pi-orchestrator/_bmad/incidents.md`
Pi auto-resolved `claude-opus-4-6` to `amazon-bedrock` instead of `anthropic`, and `gpt-5.4` to `azure-openai-responses` instead of `openai-codex`, ignoring the `defaultProvider` setting. Model routing is based on an auto-generated registry, not user config.
**Lesson**: Never rely on auto-resolution. Always pass explicit `--provider` flags. Our v3 sidesteps this entirely by using Claude Code directly (no provider routing).

#### INC-003: GPT-5.4 analyzes docs instead of acting
**Source**: `pi-orchestrator/_bmad/incidents.md`
GPT-5.4 spent 2 minutes reading CLAUDE.md before calling `supervisor_start`. Required manual nudge.
**Lesson**: Non-Opus models are exploratory, not action-oriented. Validates our "Opus only" rule. Also: prompts must say "act FIRST, analyze SECOND" for any model.

#### INC-004: Pi version too old for requested model
**Source**: `pi-orchestrator/_bmad/incidents.md`
`pi --model gpt-5.4` failed on Pi v0.56.1 because the model registry was stale.
**Lesson**: Pre-flight validation. Check tool versions before starting sessions.

#### INC-005: tmux send-keys fails in copy/scroll mode
**Source**: `pi-orchestrator/_bmad/incidents.md`
Nudge delivery failed because user had scrolled up (copy mode active).
**Lesson**: Always send `q` or `Escape` before `send-keys` to defensively exit copy mode. Zero-cost no-op if not in copy mode. **Should be added to v3 orchestrator.**
**Priority**: Medium — implement in orchestrator agent prompt.

#### INC-006: Claude Code resumed wrong conversation
**Source**: `pi-orchestrator/_bmad/incidents.md`
Claude Code launched in the orchestrator pane picked up an existing conversation from another terminal running in the same directory. The `initial_prompt` (sent 15s after launch) couldn't override the resumed session.
**Lesson**: Use `git worktree` for session isolation (prevents shared project hash). This was the critical insight that shaped v3's worktree-per-worker design.

#### INC-007: supervisor_stop didn't actually kill Claude Code
**Source**: `pi-orchestrator/_bmad/incidents.md`
`supervisor_stop` with `kill: true` only sent `Escape, C-c, C-c, C-c`. Claude Code caught these and kept running. The process was "stopped" in state but alive in reality.
**Lesson**: Always follow polite kill with hard kill (`kill -9` or `tmux kill-pane`). Verify process is dead after stop. **Should be formalized in v3.**
**Priority**: High — orchestrator must verify worker death.

#### INC-008: Orchestrator spawned in invisible internal terminal
**Source**: `pi-orchestrator/_bmad/incidents.md`
Claude Code (parent) relaunched the orchestrator via its own internal bash, creating a tmux session invisible to the user. Ghost orchestrator situation.
**Lesson**: Need a session registry tracking which terminal launched each session. v3 solves this by having the user launch `run-tmux.sh` directly (no agent self-spawning).

### Overall Pi v2 Verdict

**Abandoned after 2 days.** The complexity of Pi Agent (model routing, provider auth, extension system, supervisor tools) added 10x failure surface for zero additional capability over "just use Claude Code in tmux." The v3 architecture (pure prompts + tmux + Claude Code) delivers the same orchestration with ~200 lines of markdown instead of ~1,200 lines of TypeScript extensions.

**The one thing Pi did better**: Programmatic rule enforcement via tool hooks (can't bypass by prompting). v3 relies on prompt discipline, which works but isn't provably enforced.

---

## 2. Patterns from Research Catalogue (Actionable)

### 2.1 HIGH PRIORITY — Implement Soon

#### Reasoning Sandwich (from LangChain/NVIDIA talk)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Use extended thinking for planning phase AND verification phase, with fast execution in between. Plan → Execute → Verify, where Plan and Verify both use deep reasoning.
**Implementation**: Add to orchestrator agent prompt: "Before spawning workers, use extended thinking to plan the task breakdown. After workers complete, use extended thinking to verify the output matches the plan."

#### LoopDetection Middleware (from DeepAgents/LangChain)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Sliding window of last N tool calls with loose argument hashing. If the same tool+args pattern repeats 3x, inject a "you appear stuck" message.
**Implementation**: Add to orchestrator's `capture-pane` polling: detect repeated output patterns (same error 3x = stuck). Already partially implemented via nudge logic, but not formalized as a named pattern.
**Priority**: High — our nudge system is the primitive, this formalizes it.

#### PreCompletionChecklist Middleware (from DeepAgents/LangChain)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Before a worker signals "done", force it through a checklist: tests pass? PR created? No uncommitted changes? Lint clean?
**Implementation**: Add to worker agent prompt: "Before creating the PR, verify: (1) all tests pass, (2) no lint errors, (3) git status is clean, (4) branch is up to date with main."
**Priority**: High — prevents sloppy PRs reaching review cycle.

#### Claude Code Channels (Telegram/Discord MCP)
**Source**: [posts/2026-03/trq212-claude-code-channels-telegram-discord.md](./posts/2026-03/trq212-claude-code-channels-telegram-discord.md), [infrastructure/claude-plugins-official.md](./infrastructure/claude-plugins-official.md)
Control Claude Code sessions from phone via Telegram/Discord. Install with `--channels plugin:discord@claude-plugins-official`.
**Implementation**: Add Discord channel to overnight orchestrator runs for remote monitoring and intervention.
**Priority**: High — enables mobile oversight of autonomous agents.

#### Defensive Copy-Mode Exit (from Pi INC-005)
**Source**: `pi-orchestrator/_bmad/incidents.md` INC-005
Always send `q` before `tmux send-keys` to exit copy mode.
**Implementation**: Update orchestrator agent prompt's tmux quick reference: all `send-keys` commands should be preceded by `tmux send-keys -t <name> q 2>/dev/null;` as a defensive no-op.
**Priority**: High — trivial fix, prevents silent nudge failures.

#### ccusage — Zero-Install Token & Cost Tracking
**Source**: [observability/ccusage.md](./observability/ccusage.md) | [ryoppippi/ccusage](https://github.com/ryoppippi/ccusage) (11.3K stars, MIT)
Zero-install Claude Max usage analytics from local JSONL conversation files. Per-session tracking, 5-hour billing window awareness, `--json` export for dashboards.
**Implementation**: `npx ccusage@latest` — immediate results. Baseline KPI: cost per merged PR. Phase 2: integrate `@ccusage/mcp` into orchestrator for auto-throttling.
**Priority**: High — zero cost, 2-minute install, validates the 18-36x cost arbitrage claim.

#### Beads — Agent-Native Work Tracking with Dependency Graphs
**Source**: [agent-memory/beads.md](./agent-memory/beads.md) | [steveyegge/beads](https://github.com/steveyegge/beads) (18.5K stars, MIT, Go)
Persistent issue tracker optimized for AI agents. `bd ready` returns unblocked tasks. Hash-based IDs (`bd-a1b2`) prevent merge conflicts. Semantic compaction summarizes closed tasks. Atomic claiming (`bd update --claim`) prevents duplicate work. JSONL-in-git storage (`.beads/beads.jsonl`). Claude plugin included.
**Implementation**: `go install github.com/steveyegge/beads/cmd/bd@latest && bd init`. Replace orchestrator GET_NEXT_TASK with `bd ready`. Workers create sub-tasks with `bd create`. Orchestrator marks done with `bd update --status done`.
**Priority**: High — solves the "50 First Dates" amnesia problem. Most aligned tool to our zero-infra philosophy.

#### remain-on-exit — tmux Pane Crash Forensics
**Source**: [orchestration-platforms/agent-of-empires.md](./orchestration-platforms/agent-of-empires.md) | [njbrake/agent-of-empires](https://github.com/njbrake/agent-of-empires) (1.1K stars, MIT, Rust)
Single tmux flag: `tmux set-option -t "$PANE" remain-on-exit on`. Crashed panes stay open for forensics instead of vanishing. Zero performance cost.
**Implementation**: Add to worker spawn step (1 line). Pairs with Worker Death Verification (2.3) for a complete crash lifecycle.
**Priority**: High — trivial implementation, immediate value for debugging.

#### DCG — Destructive Command Guard
**Source**: [infrastructure/destructive-command-guard.md](./infrastructure/destructive-command-guard.md) | [Dicklesworthstone/destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard) (MIT)
SIMD-accelerated PreToolUse hook that blocks destructive commands (`git push --force`, `rm -rf /`, `npm publish`). Sub-millisecond overhead. 49+ security packs. Fail-open design (blocks known-bad, allows everything else).
**Implementation**: `claude hook install dcg` or `--easy-mode` installer (2 minutes). Every spawned agent gets deterministic safety from day 1.
**Priority**: High — catches what prompts miss. Deterministic safety net for the 70% side of the 70/30 split.

#### Hallucination Guard — Zero Tool Call Rejection (from GSD 2)
**Source**: [agent-harnesses/gsd-2.md](./agent-harnesses/gsd-2.md) | [gsd-build/gsd-2](https://github.com/gsd-build/gsd-2) (2.6K stars, MIT, Pi SDK)
Workers that complete with zero tool calls are rejected as fabricated. Agent produced a detailed summary without writing any code — previously costing ~$25 per milestone in wasted inference.
**Implementation**: After worker signals done (`cmux wait-for` / `capture-pane`), verify `gh pr diff` shows actual file changes. If PR is empty or branch has no new commits beyond the base, reject and re-spawn. ~10 LOC in orchestrator REVIEW step.
**Priority**: High — prevents the most expensive silent failure mode (fake completions that pass review because the summary sounds plausible).

#### Merge Anchor Verification (from GSD 2)
**Source**: [agent-harnesses/gsd-2.md](./agent-harnesses/gsd-2.md) | [gsd-build/gsd-2](https://github.com/gsd-build/gsd-2) (2.6K stars, MIT, Pi SDK)
Before deleting a worktree/branch, verify the code is actually present on the integration branch. Prevents orphaning commits when squash-merge produces an empty diff.
**Implementation**: Before `git worktree remove` (cmux v4.1) or `tmux kill-window` + branch cleanup (v3), run `git log main --oneline | grep "<merge-commit>"` or `git branch --contains <last-commit-hash>`. If not found, preserve the branch and log a warning.
**Priority**: High — trivial check, prevents irreversible code loss on edge-case merge failures.

#### Verification Command Auto-Fix Retries (from GSD 2)
**Source**: [agent-harnesses/gsd-2.md](./agent-harnesses/gsd-2.md) | [gsd-build/gsd-2](https://github.com/gsd-build/gsd-2) (2.6K stars, MIT, Pi SDK)
Configured verification commands (lint, test, build) run after every task. Failures trigger auto-fix retries with a diagnostic prompt before the agent can advance. Auto-discovered checks from `package.json` run in advisory mode (warn but don't block on pre-existing errors).
**Implementation**: Extend PreCompletionChecklist (Section 2.1) with retry loop: run checks → if fail, inject "fix these errors" prompt → re-run checks → max N retries → if still failing, escalate. Configurable via `verification_commands`, `verification_auto_fix`, `verification_max_retries`.
**Priority**: High — formalizes Back Pressure Hierarchy (3.1) as a deterministic retry gate, not just a prompt instruction.

#### Adaptive Roadmap Reassessment (from GSD 2)
**Source**: [agent-harnesses/gsd-2.md](./agent-harnesses/gsd-2.md) | [gsd-build/gsd-2](https://github.com/gsd-build/gsd-2) (2.6K stars, MIT, Pi SDK)
After each slice/story completes, the roadmap is reassessed against new information. Slices can be reordered, added, or removed. The plan evolves based on what the agent learned during execution.
**Implementation**: After each story is Done, orchestrator reads remaining stories in the epic and asks: "Given what was learned in this story, should the remaining stories be reordered or modified?" Update epic file if needed.
**Priority**: Medium — valuable for longer sprints (5+ stories) where early stories reveal architectural changes.

#### "Engineered Enough" Complexity Gate (from Garry Tan / YC CEO)
**Source**: [posts/2026-04/amank1412-yc-ceo-claude-md-prompt.md](./posts/2026-04/amank1412-yc-ceo-claude-md-prompt.md) | [Original post](https://x.com/Amank1412/status/2023754885473394918)
Before writing code, force the agent to evaluate whether its plan is overbuilt, underbuilt, or "engineered enough." Structured review flow: architecture → code quality → tests → performance → tradeoff presentation → pause for feedback. Garry Tan ships 4K+ LOC features with full tests in ~1 hour using this pattern; it later evolved into gstack (23 skills, 600K+ LOC in 60 days).
**Implementation**: Add to worker spawn prompts: "Before implementing, assess: is this plan overbuilt (enterprise complexity for a simple feature), underbuilt (missing edge cases, no tests), or engineered enough? Present your assessment with tradeoffs. Then proceed only if engineered enough." Pairs with PreCompletionChecklist (Section 2.1) — this is the entry gate, that's the exit gate.
**Priority**: High — prevents the two most expensive failure modes: over-engineering simple features AND under-engineering complex ones. Zero-cost prompt addition.

### 2.2 MEDIUM PRIORITY — Next Sprint

#### Autonomous Context Compression (from LangChain/NVIDIA talk)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Let the model choose when to compact rather than hitting a hard token limit. The model can recognize "I won't need this conversation segment again" and proactively summarize.
**Implementation**: Enhance `orchestrator-handoff.sh` pre-compaction hook to give the orchestrator a chance to self-summarize before forced compaction.

#### ADK 5 Skill Design Patterns (from Google)
**Source**: [posts/2026-03/googlecloudtech-5-adk-skill-design-patterns.md](./posts/2026-03/googlecloudtech-5-adk-skill-design-patterns.md)
Five named patterns: Tool Wrapper, Generator, Reviewer, Inversion, Pipeline. Maps to our architecture:
- Our orchestrator loop = Pipeline pattern
- Our review gates = Reviewer pattern
- Our roadblock recovery should use Inversion pattern (agent asks for help instead of failing silently)
**Implementation**: Rename/formalize our existing patterns using these canonical names in documentation.

#### zmx run/wait/history API (from zmx tool)
**Source**: [infrastructure/zmx.md](./infrastructure/zmx.md)
zmx provides `run` (fire command), `wait` (block until done), `history` (full scrollback) — cleaner than our `tmux send-keys` + `capture-pane` approach. But v0.4.2 is immature (sessions killed on version upgrade).
**Implementation**: Watch for v1.0. If stable, evaluate replacing tmux with zmx for worker session management.
**Priority**: Medium — blocked by maturity.

#### Scoped Completion Aggregation (from OpenClaw)
**Source**: [OpenClaw architecture analysis (conversation 2026-03-21)]
Scope child completion announcements to the current requester run. Prevents stale outputs from previous orchestrator cycles leaking into current cycle.
**Implementation**: Add `cycle_id` to `orchestrator-tmux-state.json`. Workers tag output with their spawning cycle. Discard mismatched outputs.
**Priority**: Medium — prevents subtle bugs in long-running sessions.

#### Pre-Compaction Memory Flush (from OpenClaw)
**Source**: [OpenClaw architecture analysis (conversation 2026-03-21)]
Before compaction, run a "memory flush" step that promotes durable information into structured files.
**Implementation**: Already partially implemented via `orchestrator-handoff.sh`. Formalize: the hook should extract (1) current task state, (2) worker assignments, (3) any decisions made this cycle into the state JSON.
**Priority**: Medium — improves compaction survival.

#### Progressive Escalation — 4-Tier Watchdog
**Source**: [agent-harnesses/overstory.md](./agent-harnesses/overstory.md) | [jayminwest/overstory](https://github.com/jayminwest/overstory) (791 stars, MIT, TS/Bun)
Replace binary "nudge or kill" with a graduated response: (1) warn — log the stall, (2) nudge — inject "you appear stuck" text, (3) AI triage — one-shot diagnostic prompt, (4) hard kill — terminate and respawn. 60-second time-gating between tiers prevents restart storms.
**Implementation**: ~30 LOC in orchestrator wait loop. Extends existing nudge logic with formal escalation state machine.
**Priority**: Medium — eliminates the restart storm failure mode.

#### ZFC Principle — Observable State Overrides Stored State
**Source**: [agent-harnesses/overstory.md](./agent-harnesses/overstory.md), Pi Orchestrator SYNTHESIS Q2
Observable state (tmux pane liveness + PID check) ALWAYS overrides stored state JSON. If the registry says "running" but `tmux has-session` fails, force transition to "crashed." Never trust stored state over reality.
**Implementation**: ~15 LOC in state reconciliation step at orchestrator startup and before each phase transition.
**Priority**: Medium — eliminates stale state bugs that caused ghost worker issues.

#### Three-State Agent Status
**Source**: [agent-harnesses/broomie.md](./agent-harnesses/broomie.md) | [broomie-ai/broomie](https://github.com/broomie-ai/broomie) (MIT)
Workers report `working` / `blocked` / `help` status via structured output. Orchestrator prioritizes attention: `help` > `blocked` > `working`. Status parsed from worker screen output or latch files.
**Implementation**: Add status parsing to `read_worker_output`. Workers include status tag in prompt: "If you are stuck, output `STATUS: blocked <reason>`."
**Priority**: Medium — enables smarter orchestrator attention allocation.

#### Semgrep MCP — Inline SAST During Code Generation
**Source**: [code-intelligence/semgrep.md](./code-intelligence/semgrep.md) | [semgrep/semgrep](https://github.com/semgrep/semgrep) (14K stars, LGPL-2.1/MIT)
MCP server (`uvx semgrep-mcp`) gives agents inline access to 5,000+ security rules across 30+ languages. Zero-config for local use. Custom rules for orchestrator-specific anti-patterns.
**Implementation**: Install MCP server, add to `.claude/settings.json`. Agent scans code inline while writing — catches XSS, SQL injection, secrets before PR creation.
**Priority**: Medium — zero-cost quality gate for the 70% deterministic side.

#### Beads + Orchestrator Deep Integration
**Source**: [agent-memory/beads.md](./agent-memory/beads.md), [orchestration-platforms/mcp-agent-mail.md](./orchestration-platforms/mcp-agent-mail.md)
Full migration of task tracking from `orchestrator-state.json` to Beads. `bd ready` replaces manual task selection. `bd update --claim` provides atomic task locking. Bead IDs (`bd-123`) serve as shared thread identifiers with MCP Agent Mail for inter-agent messaging.
**Implementation**: 1-2 days. Phase B of Beads integration plan (see SYNTHESIS-REPORT.md section 5).
**Priority**: Medium — depends on successful Phase A trial.

#### CASS Memory System — Cognitive Memory with Confidence Decay
**Source**: [agent-memory/cass-memory-system.md](./agent-memory/cass-memory-system.md) | [Dicklesworthstone/cass_memory_system](https://github.com/Dicklesworthstone/cass_memory_system) (268 stars, TS/Bun)
3-layer cognitive memory: episodic (raw session logs) → working (structured diary) → procedural (distilled rules with 90-day confidence decay). Deterministic curation (LLM extracts, code curates). 4x harmful multiplier biases toward safety. MCP integration via `cm context`.
**Implementation**: 2-3 days setup. `cm onboard` against accumulated session history.
**Priority**: Medium — compound value increases over time.

#### dmux HTTP API — Programmatic tmux Management
**Source**: [orchestration-platforms/dmux.md](./orchestration-platforms/dmux.md) | [standardagents/dmux](https://github.com/standardagents/dmux) (1.2K stars, MIT, TypeScript)
HTTP REST API + SSE streaming replaces raw `tmux send-keys` / `capture-pane`. Agent Registry with typed prompt transport abstraction. 11 lifecycle hooks with 3-tier resolution (team > local > global). Two-phase merge with AI conflict resolution.
**Implementation**: `npm install -g dmux`. 1-2 days migration from raw tmux commands.
**Priority**: Medium — strongest candidate as programmatic substrate beneath L-Thread Orchestrator.

#### Langfuse Self-Hosted — LLM Observability & Trust Artifacts
**Source**: [observability/langfuse.md](./observability/langfuse.md) | [langfuse/langfuse](https://github.com/langfuse/langfuse) (22.8K stars, MIT, TS)
Full-stack LLM tracing (traces, spans, scores, sessions) with ClickHouse backend. Self-hosted via Docker = DSGVO compliant. Cost tracking per trace validates Claude Max arbitrage. Session grouping maps to L-Thread workers. OpenTelemetry-native.
**Implementation**: `docker compose up`. 2 hours setup. Phase 2 graduation when scaling past 10 agents.
**Priority**: Medium — government client trust artifact. Enables Judgment SLOs.

### 2.3 LOW PRIORITY — Track for Later

#### Thread-Based Episodic Memory (from Random Labs Slate)
**Source**: [articles/2026-03/random-labs-slate.md](./articles/2026-03/random-labs-slate.md)
Workers return compressed episodes (not full message history). Thread weaving compresses worker output into structured summaries that survive across sessions.
**Implementation**: After a worker completes, have the orchestrator summarize the worker's output into a structured episode before closing the tmux window. Store in `_bmad/episodes/`.
**Priority**: Low — our workers are short-lived enough that full capture-pane suffices.

#### AP2 Payment Mandates (from Google Agent Protocols)
**Source**: [articles/2026-03/google-developers-guide-ai-agent-protocols.md](./articles/2026-03/google-developers-guide-ai-agent-protocols.md)
Typed mandate model: IntentMandate → PaymentMandate → PaymentReceipt. For Finance Agent autonomous spending.
**Implementation**: Phase 3+ when Finance Agent gets autonomous purchasing capability.
**Priority**: Low — future.

#### Alibaba OpenSandbox (gVisor/Firecracker)
**Source**: [posts/2026-03/rohanpaul-alibaba-opensandbox.md](./posts/2026-03/rohanpaul-alibaba-opensandbox.md)
Isolated execution environments for untrusted agent code. 8.9K stars, Apache 2.0.
**Implementation**: Evaluate for SaaS factory when running customer-facing agents that execute untrusted code.
**Priority**: Low — our agents run trusted code in trusted environments.

#### Worker Death Verification (from Pi INC-007)
**Source**: `pi-orchestrator/_bmad/incidents.md` INC-007
After killing a worker, verify the process is actually dead. Don't trust "polite" kills.
**Implementation**: After `tmux kill-window`, verify with `tmux has-session` or `tmux list-windows`. Add to orchestrator's CLOSE_WORKER step.
**Priority**: Low — tmux kill-window is already a hard kill (unlike Pi's polite C-c approach).

---

## 3. Testing & Quality Patterns for Autonomous Agent Systems

> **Context**: Comprehensive analysis from 5 parallel research agents (2026-03-21, updated 2026-03-22) covering: catalogue entries on testing, G. Huntley's methodology, IndyDevDan's principles, past orchestrator incidents, existing TEA infrastructure, and browser automation research. Goal: prevent the planning and testing failures that plagued previous sprints.
>
> **Applies to both orchestrator modes:**
> - **cmux v4.1** (ACTIVE) — event-driven via `cmux wait-for`, worktree-isolated workers, `cmux browser` for E2E, sidebar metadata for observability. Hook chain: SessionStart → PreCompact → Stop.
> - **tmux v3** (LEGACY) — polling via `tmux capture-pane`, shared or worktree dirs, Chrome DevTools MCP for E2E. Hook chain: SessionStart → PreCompact.
>
> Implementation notes below include both `cmux:` and `tmux:` variants where commands differ.

### Evidence Base (Why This Matters)

| Metric | Source | Number |
|--------|--------|--------|
| Error amplification (uncoordinated agents) | DeepMind/MIT, 180 configs | **17.2x** baseline |
| Error amplification (centralized orchestrator) | DeepMind/MIT, 180 configs | **4.4x** baseline |
| Issues per AI-generated PR | CodeRabbit, 470 PRs | **10.83** vs 6.45 human |
| AI code security failure rate | Veracode | **45%** fail basic security |
| Security findings growth (enterprise) | Apiiro, Fortune 50 | **10x** in 6 months |
| Developer speed perception gap | METR study | Believe 20% faster, actually **19% slower** |
| Code duplication growth | GitClear, 211M lines | **8x** increase |
| Context reduction via agent-browser | Vercel Labs benchmark | **93%** savings vs Chrome DevTools MCP |
| Year 2+ maintenance cost multiplier | Codebridge | **4x** higher than traditional code |

**Bottom line**: Centralized orchestration + mandatory testing gates = 4.4x error rate. Without = 17.2x. This is not a trade-off — it's an existential requirement.

### 3.1 FOUNDATIONAL — Back Pressure Hierarchy (G. Huntley)

The single most validated reliability principle across the catalogue. Every layer of automated feedback you add increases the autonomy you can safely grant.

**Source**: [practitioners/geoffrey-huntley.md](./practitioners/geoffrey-huntley.md), [articles/2025-07/ralph-wiggum-agent-loop.md](./articles/2025-07/ralph-wiggum-agent-loop.md), [articles/2026-01/everything-is-a-ralph-loop.md](./articles/2026-01/everything-is-a-ralph-loop.md)

```
Priority (strongest → weakest signal):
1. Type System     — compiler errors (Rust/Elm strongest; TypeScript strict mode for us)
2. Test Suites     — failing tests apply direct pressure to the generative loop
3. Linters         — automated style/quality enforcement (ESLint, Biome, etc.)
4. Build System    — agent reads errors, self-corrects iteratively
5. UI Verification — cmux browser / Chrome DevTools MCP / agent-browser E2E screenshots
6. Git History     — previous commits as implicit guidance
```

**Implementation for orchestrator**:
- Worker agent prompts must enforce this stack top-down: typecheck → test → lint → build → E2E
- If any layer fails, the worker loops on THAT layer before proceeding (not skip to next)
- The orchestrator's REVIEW step (Phase 7 in both v3 and v4.1) should verify all 6 layers passed before accepting a PR
- `cmux:` E2E via `cmux browser screenshot` (native, zero-config)
- `tmux:` E2E via Chrome DevTools MCP or agent-browser CLI
**Priority**: FOUNDATIONAL — this frames everything below.

### 3.2 FOUNDATIONAL — Specs as Source of Truth (G. Huntley)

**Source**: [articles/2025-07/ralph-wiggum-agent-loop.md](./articles/2025-07/ralph-wiggum-agent-loop.md)

> "Specifications replace prompts as the primary control surface. The specs ARE the source of truth; if the agent builds the wrong thing, the specs are wrong."

A spec that defined a keyword twice for opposing scenarios created "significant waste." Tests should document their own "why" — future loops won't have the reasoning in their context window.

**Implementation**:
- Every GitHub issue assigned to a worker must have a spec (acceptance criteria, expected behavior, edge cases)
- If the worker produces wrong output, the orchestrator's FIRST action is: "Is the spec ambiguous?" — fix spec, then re-spawn
- Tests must include comments explaining WHY each assertion exists
**Priority**: FOUNDATIONAL — prevents the "bad planning" root cause from incident history.

### 3.3 FOUNDATIONAL — 70/30 Deterministic-LLM Boundary

**Source**: [reference/deterministic-llm-boundary.md](./reference/deterministic-llm-boundary.md) — validated across Stripe, OpenAI Codex, Praetorian, DeepMind

70% of the system must be deterministic engineering; only 30% should be LLM-powered.

| Layer | Deterministic (70%) | LLM (30%) |
|-------|---------------------|-----------|
| Task routing | State machine transitions, retry limits | Task decomposition |
| Quality gates | Lint, typecheck, test pass/fail | Code generation |
| Budget | Token limits, runtime caps, parallelism caps | Reasoning about priority |
| Security | Allowlists, schema filtering, hook gates | Anomaly explanation |
| Merge | CI status checks, branch protection | PR description |

**Implementation**: Audit every orchestrator decision point. If it's currently LLM-decided (prompt-based), ask: "Can this be a deterministic rule?" If yes, make it one.
**Priority**: FOUNDATIONAL — the architectural frame for all testing patterns below.

### 3.4 HIGH PRIORITY — TDD Enforcement ("First Run the Tests")

**Source**: [articles/2026-02/agentic-engineering-patterns.md](./articles/2026-02/agentic-engineering-patterns.md) (Simon Willison)

> "Red/Green TDD is the highest-leverage agent pattern. 'First run the tests' — a 4-word prompt — establishes testing mindset for the entire session."

Agents understand "red/green TDD" as shorthand. Confirm test failure BEFORE implementation. Tests serve triple duty: verify code works, help agents understand codebases, influence testing discipline.

**Implementation**:
- Add to ALL worker agent prompts: `"First run the existing tests. Then write a failing test for the new behavior. Only then implement."`
- Superpowers (Jesse Vincent) enforces: "If code appears before tests, delete it and restart"
- Our TEA ATDD workflow (`/bmad-tea-testarch-atdd`) already implements this — ACTIVATE IT
**Priority**: High — 4-word prompt change, massive impact.

#### Existing TEA Infrastructure to Activate

We have 190+ testing knowledge files and 9 workflows sitting unused:

| Command | Use When | Status |
|---------|----------|--------|
| `/bmad-tea-testarch-framework` | Sprint kickoff — initialize Playwright + fixtures | EXISTS, UNUSED |
| `/bmad-tea-testarch-atdd` | Every story — failing acceptance tests before code | EXISTS, UNUSED |
| `/bmad-tea-testarch-automate` | After each epic — expand test coverage | EXISTS, UNUSED |
| `/bmad-tea-testarch-trace` | Before Done — map requirements → tests, gate decision | EXISTS, UNUSED |
| `/bmad-tea-testarch-ci` | Once early — scaffold CI pipeline with burn-in | EXISTS, UNUSED |
| `/bmad-tea-testarch-test-review` | PR review — validate test quality | EXISTS, UNUSED |
| `/bmad-tea-testarch-nfr` | Before release — non-functional requirements check | EXISTS, UNUSED |

**Priority**: High — zero implementation cost, just activation.

### 3.5 HIGH PRIORITY — E2E Browser Strategy (cmux browser / agent-browser / Chrome DevTools MCP)

**Source**: [agent-harnesses/agent-browser.md](./agent-harnesses/agent-browser.md), [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md), cmux-orchestrator v4.1 docs

**Current state by orchestrator mode:**
- `cmux v4.1:` Native `cmux browser` integration — `cmux browser open`, `cmux browser screenshot`, `cmux browser eval`. Zero-config, already in the orchestrator loop (Phase 10 E2E_TEST). Lightweight but limited to screenshots + JS eval.
- `tmux v3:` Chrome DevTools MCP — full DOM inspection but high token overhead, WebSocket instability (L-INC-013).

**Upgrade path — agent-browser (Vercel):**
Achieves **93% context reduction** via "Snapshot + Refs" — semantic locators (ARIA roles, text content) with compact element references (`@e1`, `@e2`) instead of full DOM/accessibility trees. Rust CLI + Node daemon architecture. 108+ commands — navigation, form interaction, network interception, screenshots, PDF generation, multi-tab, iframe, auth state persistence, mock API responses for deterministic E2E.

**Implementation**:
- `cmux:` For basic screenshot gates, `cmux browser` is sufficient and already integrated. Upgrade to agent-browser when needing: form interaction testing, network mocking, auth persistence, or multi-page user flow validation.
- `tmux:` Replace Chrome DevTools MCP with agent-browser (solves L-INC-013 instability + 93% context savings).
- Both modes: Auth state persistence eliminates re-login overhead per test run. Network interception enables mocking external APIs for deterministic tests.
- 93% context savings → enables 10 parallel agents within budget previously supporting 3
**Priority**: High for tmux (replaces fragile Chrome DevTools MCP). Medium for cmux (enhances already-working `cmux browser`).

**Alternatives evaluated**:
- **dev-browser** (Sawyer Hood, 4K stars, MIT): NEW — "let agents write code" paradigm. Agent generates sandboxed Playwright scripts (QuickJS WASM) instead of multi-turn MCP calls. Benchmarks: 14% faster, 39% cheaper, 43% fewer turns than Playwright MCP at 100% success rate. `snapshotForAI()` for compact page representation. CLI-first (`npm i -g dev-browser`). No 93% context reduction like agent-browser, no per-worktree isolation like Rodney. Best as Playwright MCP replacement for Claude Code users wanting simplest CLI path. [Source](./posts/2026-03/sawyerhood-dev-browser-cli.md)
- **Rodney** (G. Huntley / Simon Willison): Go CLI + headless Chrome, 50+ commands, shell-native assertions (exit code 1), accessibility audit commands (`ax-tree`, `ax-find`). Zero infrastructure overhead but no context compression. Good for lightweight smoke tests.
- **Bowser** (IndyDevDan): Four-layer composable architecture (Skills → Subagents → Commands → Justfile), YAML user story format, both headless Playwright and real Chrome with cookies. Good for authenticated testing.

### 3.6 HIGH PRIORITY — Property-Based Testing (fast-check)

**Source**: [articles/2025-09/swebench-pro-raising-the-bar-for-agentic-coding.md](./articles/2025-09/swebench-pro-raising-the-bar-for-agentic-coding.md), [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

Breaks the **"cycle of self-deception"** where the same agent writes both code AND tests — of course the tests pass, the agent wrote them to match its own implementation.

**Pattern**: Generator agent writes code, Tester agent validates with fast-check properties (random input generation, invariant checking). The Tester doesn't know the implementation details, only the spec.

**Implementation**:
- Add `fast-check` to project dependencies
- Worker agents write implementation + unit tests; a SEPARATE reviewer agent writes property-based tests
- Property tests catch edge cases that unit tests miss (boundary values, empty inputs, overflow)
- Already supported by TEA knowledge base (`_bmad/tea/testarch/knowledge/`)
**Priority**: High — directly addresses the self-deception failure mode.

### 3.7 HIGH PRIORITY — Deterministic Middleware Hooks

**Source**: [agent-harnesses/open-swe.md](./agent-harnesses/open-swe.md), [agent-harnesses/opendev.md](./agent-harnesses/opendev.md), [agent-harnesses/everything-claude-code.md](./agent-harnesses/everything-claude-code.md)

Three patterns for wrapping agent loops with deterministic safety:

**Open SWE's 3 middleware hooks**:
```
Hook 1: check_message_queue_before_model  — inject follow-up mid-execution
Hook 2: open_pr_if_needed                 — force-create PR if agent fails to
Hook 3: ToolErrorMiddleware               — graceful error handling
```

**OpenDev's 5 composable safety layers**:
```
1. Prompt guardrails          (security-policy.md, action-safety.md)
2. Schema filtering           (allowed_tools — LLM never sees forbidden tools)
3. Runtime approval gates     (manual/semi-auto with persistent patterns)
4. Tool-level validation      (DANGEROUS_PATTERNS blocklist)
5. Lifecycle hooks            (exit code 2 = rejection)
```

**ECC's hook-based gating**:
- `ECC_HOOK_PROFILE` (minimal/standard/strict) controls which hooks fire
- PostToolUse hooks run formatters + 20 linters on every file edit (Plankton pattern)
- AgentShield: 1,282 security tests, 102 static analysis rules

**Implementation for orchestrator**:
- PR creation backstop: if worker exits without PR, orchestrator creates one from the branch
- State file update backstop: always persist state after every phase transition
- Devlog entry backstop: always record result even on failure
- Escalation trigger: if quality dips (3+ review cycles), flag for human review

**Existing hook chain by mode:**
- `cmux v4.1:` 3-hook lifecycle already implemented — `session-start.sh` (inject state), `handoff.sh` (pre-compaction survival), `cmux-stop-hook.sh` (signal orchestrator via `cmux wait-for`). The Stop hook is the key innovation: event-driven completion detection, zero polling. Extend by adding quality checks inside Stop hook (verify PR exists, tests passed) before signaling completion.
- `tmux v3:` 2-hook lifecycle — `session-start.sh`, `handoff.sh`. No Stop hook — relies on polling via `tmux capture-pane`. Worker completion detected by parsing output or checking `gh pr list`.

**Gap analysis:** Both modes lack a **PreToolUse hook** for inline quality enforcement (linting on every file edit, blocking dangerous commands). This is where Pi Agent's 25+ lifecycle events or ECC's Plankton pattern would add value. Consider adding Claude Code's native PreToolUse hooks to worker `.claude/settings.local.json` for both modes.
**Priority**: High — these are the deterministic safety nets that catch what prompts miss.

### 3.8 HIGH PRIORITY — Feature-Based Regression Suite

**Source**: Incident analysis (INC-014, L-INC-014), [articles/2026-02/agentic-engineering-patterns.md](./articles/2026-02/agentic-engineering-patterns.md)

INC-014 and L-INC-014 both document the same failure: tasks marked Done without E2E verification, regressions found by users. The fix isn't "remember to test" — it's structural.

**Pattern**: Every feature gets a persistent E2E test that runs on EVERY future PR. Not just screenshot-on-merge, but a regression suite that grows with the product.

**Implementation**:
- After each story is Done + E2E verified, the worker writes a Playwright test covering the user flow
- These tests accumulate in `e2e/` and run in CI on every PR
- The orchestrator's REVIEW step (Phase 7 in both v3/v4.1) checks: "Did the worker add/update the E2E test for this feature?"
- `cmux v4.1:` Workers in isolated worktrees can run Playwright tests independently (no port conflicts). E2E gate uses `cmux browser` for screenshot verification, Playwright for automated regression.
- `tmux v3:` Workers share filesystem — coordinate dev server port. E2E gate uses Chrome DevTools MCP.
- TEA workflow `/bmad-tea-testarch-automate` generates these tests — ACTIVATE IT
**Priority**: High — directly prevents the #1 recurring incident.

### 3.9 HIGH PRIORITY — One-Task-Per-Context Discipline (G. Huntley)

**Source**: [articles/2025-07/ralph-wiggum-agent-loop.md](./articles/2025-07/ralph-wiggum-agent-loop.md)

> "If the bowling ball is in the gutter, there's no saving it."

Context windows are memory allocation: reading files = `malloc()`, there is no `free()`. If an agent's context becomes polluted (derailed, wrong path, accumulated errors), don't try to salvage — kill and restart fresh.

**Implementation**:
- Workers get ONE task. If stuck after 3 retry cycles, kill and re-spawn fresh
- The orchestrator NEVER sends a second task to the same worker context
- If a test fails, the agent must confront the failure in a fresh context (the loop itself IS the error recovery)
- `cmux v4.1:` Each worker gets its own workspace + worktree — kill via `cmux close-workspace` + `git worktree remove`. Clean isolation by design. Max 8 parallel workers.
- `tmux v3:` Each worker gets its own tmux window — kill via `tmux kill-window`. Shared filesystem may leave artifacts; worktree variant mitigates this. Max ~3 parallel workers.
- Both modes: Formalize as an absolute rule in the orchestrator agent prompt
**Priority**: High — prevents context pollution cascades.

### 3.10 HIGH PRIORITY — Failure Domain Logging & Loop Observation

**Source**: [articles/2026-01/everything-is-a-ralph-loop.md](./articles/2026-01/everything-is-a-ralph-loop.md), [practitioners/indydevdan.md](./practitioners/indydevdan.md)

> "Watch the loop for engineering growth. The key practice is observing agent loops for failure domains, then engineering solutions so those failures never recur. This is the human's actual job: not writing code, but programming the system that writes code."

IndyDevDan's principle: **"Observability before scale"** — invest in tracing tool calls, task handoffs, agent lifecycle events before adding more agents.

**Implementation**:
- Track recurring worker failures in `_bmad/failure-domains.jsonl` (append-only)
- When an error recurs 3x, the response is NOT "test it better" but "fix the prompt/spec so the error becomes impossible"
- Workers update their own instructions (AGENT.md pattern) with learned build/run commands
- Rolling TODO list (`fix_plan.md`) survives context resets
- `cmux v4.1:` Leverage sidebar observability — `cmux log --level error --source orchestrator "failure domain: <pattern>"` makes failure patterns visible in real-time. `cmux set-status` can flag workers hitting known failure domains.
- `tmux v3:` Log to devlog.md + JSONL telemetry (already proven from Pi v2 era). No live sidebar.
**Priority**: High — the meta-pattern that improves all other patterns over time.

### 3.11 MEDIUM PRIORITY — CodeRabbit Automated PR Review

**Source**: [agent-harnesses/coderabbit.md](./agent-harnesses/coderabbit.md)

Most-installed AI code review app (2M+ repos, 13M+ PRs). 46% accuracy detecting real-world runtime bugs. Multi-layered: AST + 40 SAST/linter scanners + semantic code understanding + generative AI.

**Implementation**:
- Install as GitHub App on target repos (zero config needed)
- `.coderabbit.yaml` for project-specific review rules
- Incremental review (only changed files) — no re-reviewing entire PRs
- Code graph analysis for cross-file impact
- SOC 2 Type II certified, GDPR compliant, zero data retention
**Priority**: Medium — easy install, catches bugs before orchestrator review cycle.

### 3.12 MEDIUM PRIORITY — Risk-Based Shipping Gates (G. Huntley)

**Source**: [posts/2026-03/geoffreyhuntley-embedded-software-factory-rad-is-back.md](./posts/2026-03/geoffreyhuntley-embedded-software-factory-rad-is-back.md)

> "Instead of manual code review for everything, I just ship it. If something is high enough on the risk matrix — for example, a database schema migration — it halts shipping and I do manual review. I'm on the loop, not in the loop."

**Implementation**: Define a risk matrix for the orchestrator:

| Risk Level | Examples | Gate |
|------------|----------|------|
| Auto-ship | UI text changes, style fixes, documentation | CI pass → auto-merge |
| Light review | Feature additions, new components | CI pass + E2E screenshot → auto-merge |
| Manual gate | DB schema changes, auth logic, payment code | CI + E2E + human review required |
| Hard block | Credential handling, deployment config, security policy | Human approval + security scan |

**Priority**: Medium — reduces review bottleneck while protecting high-risk changes.

### 3.13 MEDIUM PRIORITY — CI Burn-In & Quality Pipeline

**Source**: TEA knowledge base (`_bmad/tea/testarch/knowledge/ci-burn-in.md`), [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

Recommended 4-stage quality pipeline:

```
Stage 1: Code Generation
  └─ Sandbox isolation (E2B) + property-based testing (fast-check)

Stage 2: Code Review (Pre-Merge)
  └─ Automated review (CodeRabbit) + merge management (Graphite) + security scan (Shannon)

Stage 3: CI/CD
  └─ CI monitoring (Mendral) + E2E testing (agent-browser) + burn-in loops

Stage 4: Production Monitoring
  └─ Error tracking (Sentry) + analytics (PostHog)
```

**Implementation**: `/bmad-tea-testarch-ci` scaffolds most of this. Run it at sprint kickoff.
**Priority**: Medium — Stage 1-2 are high priority; Stage 3-4 are medium.

### 3.14 MEDIUM PRIORITY — Requirements Traceability Matrix

**Source**: TEA workflow `/bmad-tea-testarch-trace`, [reference/observability-trust-kpis.md](./reference/observability-trust-kpis.md)

Map every requirement to its test(s). Quality gate decision: PASS / CONCERNS / FAIL / WAIVED. Prevents the "we thought it was tested" failure.

**Implementation**:
- Run `/bmad-tea-testarch-trace` after each epic
- Generates a matrix: requirement → test file → last pass date → coverage status
- The orchestrator checks this matrix before marking an epic Done
- Gap analysis reveals untested requirements before they become bugs
**Priority**: Medium — complements feature-based regression suite.

### 3.15 MEDIUM PRIORITY — Context Compaction with Artifact Survival

**Source**: [agent-harnesses/opendev.md](./agent-harnesses/opendev.md)

OpenDev's 5-stage compaction thresholds:

| Stage | Threshold | Action |
|-------|-----------|--------|
| WARNING | 70% | Log warning, tracking begins |
| MASK | 80% | Replace old tool results with refs (keep recent 6) |
| PRUNE | 85% | Strip old outputs (protect recent 40K tokens) |
| AGGRESSIVE | 90% | Minimal refs (keep only recent 3 results) |
| COMPACT | 99% | LLM-powered summarization + artifact index + history archival |

**Critical**: Files touched by agents survive compaction (artifact index pattern). Prevents losing track of what was changed.

**Implementation**:
- `cmux v4.1:` Enhance `handoff.sh` (PreCompact hook) with these thresholds. Currently outputs a survival briefing at compaction time. Add: artifact index (files touched), worker assignments, current phase. The sidebar metadata (`cmux set-progress`, `cmux set-status`) persists independently of context — provides external state recovery.
- `tmux v3:` Enhance `orchestrator-handoff.sh` similarly. No sidebar — rely entirely on `orchestrator-tmux-state.json` + devlog for recovery.
- Both: Currently only have the 99% forced compaction. Adding intermediate stages (70/80/85/90%) would catch issues earlier.
**Priority**: Medium — prevents context loss in long sessions.

### 3.16 MEDIUM PRIORITY — Accessibility Testing (BITV 2.0)

**Source**: [agent-harnesses/rodney.md](./agent-harnesses/rodney.md)

Rodney's accessibility commands (`ax-tree`, `ax-find`, `ax-node`) enable BITV 2.0 compliance testing as part of E2E gate. ARIA-based semantic locators (agent-browser) are more resilient to UI changes than CSS selectors.

**Implementation**: Add accessibility checks to E2E screenshot gate for customer-facing projects (OmniPort-HH especially — public sector requires BITV 2.0).
**Priority**: Medium — required for public sector contracts.

### 3.17 LOW PRIORITY — Graphite Stacked PRs for Multi-Agent Merge Safety

**Source**: [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

When multiple workers create PRs simultaneously, merge conflicts are inevitable. Graphite's stacked PR pattern + merge queue solves this by sequencing dependent changes.

**Implementation**:
- `cmux v4.1:` Supports 8+ parallel workers with worktree isolation — merge conflicts become real at this scale. Graphite's merge queue would sequence PRs automatically. **Priority escalates to MEDIUM for cmux v4.1.**
- `tmux v3:` Limited to ~3 parallel workers — merge conflicts rare. **Stays LOW for tmux v3.**
**Priority**: Medium (cmux v4.1) / Low (tmux v3).

### 3.18 LOW PRIORITY — Shannon Autonomous Security Gate

**Source**: [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

96.15% exploit detection rate. Claude Agent SDK foundation. Autonomous pentesting post-deployment.

**Implementation**: Add as post-merge gate for security-sensitive changes (auth, payments, user data).
**Priority**: Low — high value but requires setup investment.

### 3.19 LOW PRIORITY — Mendral Autonomous CI Diagnosis

**Source**: [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

AI DevOps engineer. 75% PR fix acceptance rate for CI failures. YC W26.

**Implementation**: Integrate when CI pipeline is stable and producing failures worth auto-fixing.
**Priority**: Low — need CI pipeline first (see 3.13).

### 3.20 LOW PRIORITY — Sentry + PostHog Production Monitoring

**Source**: [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

Sentry AI Agent Monitoring: complete traces, OpenTelemetry, 94.5% root cause accuracy (Seer). PostHog: LLM analytics, feature flags for agent behavior control, A/B testing.

**Implementation**: Phase 3+ when products are in production with real users.
**Priority**: Low — needs production traffic to be useful.

---

### Testing Incident History (Cross-Reference)

Incidents directly caused by testing gaps:

| Incident | Root Cause | What Would Have Caught It |
|----------|-----------|---------------------------|
| INC-014 (E2E skipped) | No structural E2E gate | Feature-based regression suite (3.8) |
| L-INC-001 (Postgres hang) | No serverless integration test | Property-based testing of DB layer (3.6) |
| L-INC-002 (Zod/TS drift) | No schema parity check | Type system back pressure (3.1) |
| L-INC-007 (XSS in markdown) | No security scanning | Shannon security gate (3.18) or CodeRabbit (3.11) |
| L-INC-009 (N+1 queries) | No performance testing | NFR assessment workflow (3.14) |
| L-INC-011 (Pagination broken) | No integration test for pagination | ATDD — failing test before code (3.4) |
| L-INC-013 (Chrome DevTools instability) | Fragile E2E infrastructure | `cmux browser` (v4.1 native) or agent-browser (3.5) |
| CMUX-BUG-01 (output format parsing) | Assumed bare result from cmux CLI | Deterministic output parsing + integration tests |
| CMUX-BUG-02 (send without Enter) | cmux `send` ≠ tmux `send-keys` semantics | Fixed in 6820cf5: always follow with `cmux send-key Enter` |
| CMUX-BUG-04 (cross-workspace targeting) | Missing `--workspace` scope | Fixed in 6820cf5: all sidebar commands scoped to `$ORCH_WORKSPACE` |
| MAST taxonomy (1,642 traces) | 14 failure modes across 4 categories | Deterministic middleware hooks (3.7) |

### Sprint Activation Checklist

**Day 0 (before any code)**:
- [ ] Run `/bmad-tea-testarch-framework` — initialize Playwright + fixtures
- [ ] Run `/bmad-tea-testarch-ci` — scaffold CI quality pipeline
- [ ] Write specs for every planned feature (3.2)
- [ ] Define risk matrix for auto-ship vs manual review (3.12)
- [ ] `cmux:` Verify Stop hook installed in target project's `.claude/settings.local.json`
- [ ] `tmux:` Verify `run-tmux.sh` creates windows with `remain-on-exit on` (Section 2.1)

**Every story**:
- [ ] Run `/bmad-tea-testarch-atdd` — failing acceptance tests before code
- [ ] Worker prompt includes "first run the tests" (3.4)
- [ ] One task per context, kill on 3rd retry (3.9)
- [ ] `cmux:` Worker spawned in isolated worktree + separate workspace
- [ ] `tmux:` Worker spawned in dedicated window (worktree variant preferred)

**Every PR**:
- [ ] PreCompletionChecklist: tests pass, lint clean, git status clean (Section 2.1)
- [ ] E2E gate: `cmux browser screenshot` (v4.1) or Chrome DevTools MCP / agent-browser (v3) — (3.5)
- [ ] Worker adds/updates Playwright regression test (3.8)
- [ ] `cmux:` Sidebar shows worker status transition to "done" via Stop hook signal

**Every epic completion**:
- [ ] Run `/bmad-tea-testarch-trace` — requirements traceability (3.14)
- [ ] Run `/bmad-tea-testarch-automate` — expand coverage gaps
- [ ] Log failure domains to `_bmad/failure-domains.jsonl` (3.10)
- [ ] `cmux:` Review sidebar logs for recurring error patterns
- [ ] Update specs with lessons learned
- [ ] `cmux:` Clean up stale worktrees: `git worktree list` + `git worktree prune`

---

## 5. Patterns from Wave 2-3 Catalogue Ingestion (2026-03-22)

> **Synthesis of 100 patterns from 5 parallel analysis agents** scanning 33 catalogue entries across: LangChain context engineering, Vercel filesystem agents, NVIDIA enterprise security, GSD-2/Google ADK harnesses, and Siemens/Adobe/Atlassian industrial agents. After deduplication against Sections 2 and 3 above, **42 new patterns** survived (20 HIGH, 18 MEDIUM, 4 LOW).

### 5.1 HIGH PRIORITY

#### Event-Sourced Orchestration State (from T3 Code)
**Source**: [developer-gui/t3code.md](./developer-gui/t3code.md) | T3 Code v0.2.77
Replace imperative `orchestrator-tmux-state.json` mutation with append-only JSONL event log. Events: `worker.spawned`, `pr.created`, `pr.merged`, `e2e.passed`, `task.done`. Current state = fold over events. Crash recovery = replay log.
**Implementation**: `_bmad/agent-activity.jsonl` is already halfway there. Formalize it as source of truth; derive state JSON from it.
- `tmux v3:` Replace JSON writes with JSONL appends. State reconstruction in `session-start.sh`.
- `cmux v4.1:` Same pattern. Event log feeds both state projection and dashboard.
**Priority**: High — eliminates "state file corrupted" failures. Gives crash recovery and time-travel debugging for free.

#### Decider + Projector / CQRS (from T3 Code)
**Source**: [developer-gui/t3code.md](./developer-gui/t3code.md)
Separate command validation (decider: command + state -> events) from state projection (projector: events -> state). Decider is a pure function that validates invariants (max workers, no duplicates) before emitting events.
**Implementation**: ~20 command types in T3 Code map 1:1 to our loop phases. Implement as `decider.sh` that gates every action.
**Priority**: High — makes orchestrator state transitions testable and auditable.

#### CI Fix-Push Loop (from Ghostling/Hashimoto)
**Source**: [agent-harnesses/ghostling.md](./agent-harnesses/ghostling.md) | mitchellh
Dedicated CI-fixer agent that: watches `gh run watch`, reads `gh run view --log-failed`, fixes, pushes, loops until CI passes. Hashimoto: "the only way I stay sane."
**Implementation**: After PR creation, spawn a specialized CI-fixer worker instead of running the full REVIEW-FIX cycle for lint/type/test failures.
- `tmux v3:` Dedicated tmux window for CI fixing per PR.
- `cmux v4.1:` Background workspace that auto-responds to CI events.
**Priority**: High — CI failures are the most common blocker. Specialized agent handles them faster than general reviewer.

#### Git-Based Checkpointing (from T3 Code)
**Source**: [developer-gui/t3code.md](./developer-gui/t3code.md)
Git commits as session checkpoints at orchestrator-defined milestones (task assigned, implementation done, PR created, review passed). Crashed workers resume from last checkpoint instead of restarting.
**Implementation**: Workers commit at milestones. New worker on crash does `git log --oneline` to find checkpoint and continues.
**Priority**: High — saves 30-60 minutes per crashed task by enabling resume-from-last-good-state.

#### Three-Tier Progressive Compression (from LangChain)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Three tiers of increasing lossiness: (1) offload tool results >20K tokens to filesystem, (2) truncate old write/edit inputs at 85% fill, (3) only then summarize. Each tier defers to the cheapest mechanism first.
**Implementation**: Tier 1 is free — add to worker CLAUDE.md: "Save large tool results to file, reference path." Tier 2: workers reference files by path. Tier 3: existing compaction. Complements Section 3.15's threshold stages.
**Priority**: High — Tier 1 has zero information loss since full content stays on disk.

#### Goal Drift Detection Post-Compaction (from LangChain)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
After summarization, agents lose original intent — "the most insidious failure mode." Fix: re-inject the original task/sprint goal in `session-start.sh` after every compaction.
**Implementation**: Current hook injects phase and state but NOT the original goal. Add: `ORIGINAL GOAL: <from state file>` + self-check instruction.
- `tmux v3:` Add to `orchestrator-session-start.sh`.
- `cmux v4.1:` Same hook + sidebar `cmux set-status` with goal summary.
**Priority**: High — our hook injects WHAT (phase, PR number) but not WHY (original goal).

#### Place Critical Instructions Early / Position Effect (from Chroma)
**Source**: [articles/chroma-context-rot-llm-degradation.md](./articles/chroma-context-rot-llm-degradation.md)
Accuracy highest for information near the beginning of context. Proven across 18 frontier models. Place task objective FIRST, then background.
**Implementation**: Review `orchestrator-session-start.sh` output order. Lead with goal + immediate action, then supplementary details. Ensure worker prompts put task objective before background context.
**Priority**: High — prompt reordering, zero code changes.

#### Minimize Distractors in Context Assembly (from Chroma)
**Source**: [articles/chroma-context-rot-llm-degradation.md](./articles/chroma-context-rot-llm-degradation.md)
Semantically-related but irrelevant content compounds degradation multiplicatively across all 18 models tested. A worker given 3 paragraphs of unrelated features performs measurably worse.
**Implementation**: Workers get ONLY task description, relevant file paths, and acceptance criteria. Strip sprint backlog, other workers' status, and orchestrator internals from worker prompts.
**Priority**: High — scoping worker context is a prompt change, not an architectural change.

#### On-Demand Context Loading (from Vercel)
**Source**: [articles/vercel-agents-filesystems-bash.md](./articles/vercel-agents-filesystems-bash.md)
Never front-load large contexts. Give workers the issue number and let them `gh issue view` + explore. Vercel achieved 75% cost reduction ($1.00 to $0.25/call).
**Implementation**: Stop embedding full issue bodies in worker prompts. Provide WHAT + WHERE, not the full context. Workers that know HOW to find context survive compaction better than workers GIVEN context upfront.
**Priority**: High — cost reduction proven at Vercel scale.

#### Directory Conventions Documentation (from Vercel)
**Source**: [articles/vercel-agents-filesystems-bash.md](./articles/vercel-agents-filesystems-bash.md)
Add `## Directory Map` to CLAUDE.md listing every significant directory and its purpose. Agents waste 2-5 tool calls exploring structure they could have upfront.
**Implementation**: 30 min. Add to CLAUDE.md: `_bmad/` = state, `research/catalogue/` = knowledge base, `.claude/` = agent config, etc.
**Priority**: High — trivial to implement, immediate reduction in wasted tool calls.

#### Out-of-Process Policy Enforcement (from NVIDIA OpenShell)
**Source**: [infrastructure/nvidia-openshell.md](./infrastructure/nvidia-openshell.md)
Enforce constraints at the environment level, not prompt level. Prompt injection can override prompt-level rules but cannot override filesystem ACLs. "Real security must be enforced at the environment level."
**Implementation**: Use macOS `sandbox-exec` profiles or filesystem ACLs to restrict each tmux pane's process tree to its worktree. PF firewall rules for network egress. Our Rule 1 ("DU SCHREIBST NIEMALS CODE") is currently prompt-level only.
- `tmux v3:` Script in `run-tmux.sh` when spawning workers.
- `cmux v4.1:` Investigate Ghostty's process isolation capabilities.
**Priority**: High — prompt-level rules are bypassable. Environment-level rules are not.

#### Policy-as-Code (from ServiceNow + NVIDIA OpenShell)
**Source**: [articles/servicenow-nvidia-governing-autonomous-workforce.md](./articles/servicenow-nvidia-governing-autonomous-workforce.md)
Convert prose rules (CLAUDE.md "4 Absolute Rules") to machine-readable `agent-policy.yaml`. Machine-enforceable, version-controlled, testable.
**Implementation**: Create `agent-policy.yaml` defining: `tools_denied`, `max_parallel_workers`, `e2e_required`, `auto_mode_source`. Orchestrator reads and enforces programmatically.
**Priority**: High — low effort, converts the weakest enforcement form (prose) to the strongest (code).

#### Runtime Action Logging for Post-Hoc Audit (from CrowdStrike + Cisco)
**Source**: [articles/crowdstrike-nvidia-secure-agent-blueprint.md](./articles/crowdstrike-nvidia-secure-agent-blueprint.md)
All agent actions logged in structured JSONL for forensic audit. Fields: `timestamp`, `worker_id`, `action_type`, `target_file`, `summary`.
**Implementation**: Extend `capture-pane` polling to parse tool invocations and write to `_bmad/agent-actions.jsonl`. Devlog = human summary, action log = machine audit trail.
**Priority**: High — low effort, answers "what exactly did worker-3 do between 14:00 and 14:30?"

#### PageRank-Based Task Selection (from Beads Viewer)
**Source**: [agent-harnesses/beads-viewer.md](./agent-harnesses/beads-viewer.md)
Replace linear task picking with graph-theoretic dependency analysis. PageRank identifies tasks that unblock the most downstream work. `bv --robot-next --format toon` outputs token-optimized JSON.
**Implementation**: Phase 1: GitHub Issues -> Beads JSONL adapter. Phase 2: `--robot-next` replaces GET_NEXT_TASK. Phase 3: `--robot-plan` drives parallel track allocation.
**Priority**: High — a "medium" task blocking 15 others outranks a "high" task blocking zero.

#### Parallel Track Planning (from Beads Viewer)
**Source**: [agent-harnesses/beads-viewer.md](./agent-harnesses/beads-viewer.md)
`bv --robot-plan` outputs groups of tasks that can safely run simultaneously (no inter-dependencies). Maps directly to multi-worker spawning.
**Implementation**: Parse track-grouped JSON, spawn workers per independent track (up to max limit). Sequential tracks run after previous completes.
**Priority**: High — we currently process stories sequentially even when they have no dependencies.

#### Sliding-Window Stuck Detection (from GSD-2)
**Source**: [agent-harnesses/gsd-2.md](./agent-harnesses/gsd-2.md)
Track last N dispatch patterns. If the same pattern repeats 3+ times (including multi-step cycles A->B->A->B), inject diagnostic prompt. More sophisticated than time-based stuck detection.
**Implementation**: During WAIT_FOR_PR, maintain sliding window of last 5 captured states. Pattern-match for repeated errors. Nudge on 3+ repetitions, kill+respawn on 10-minute stall.
- `tmux v3:` Parse `tmux capture-pane` for repeated patterns.
- `cmux v4.1:` Emit `stuck-detected` event from `cmux read-screen` pattern matching.
**Priority**: High — catches fast-cycling doom loops that time-based detection misses.

#### Progressive Skill Loading L1/L2/L3 (from Google ADK)
**Source**: [agent-harnesses/google-adk.md](./agent-harnesses/google-adk.md)
Three tiers: L1 (name + one-line, ~10 tokens), L2 (full instructions, ~200 tokens), L3 (reference docs, 1000+ tokens). Only L1 in initial context. L2/L3 load on-demand.
**Implementation**: Restructure `.claude/commands/` with frontmatter. Orchestrator prompt only includes L1 for all skills. Example: `/tmux-recovery` L1 = "Recover crashed tmux sessions" (12 tokens vs ~500 for full content).
**Priority**: High — directly reduces context waste in orchestrator prompt.

#### Hallucination-Aware Input Sanitization (from Agentic Security Guide)
**Source**: [posts/2026-03/affaanmustafa-shorthand-guide-agentic-security.md](./posts/2026-03/affaanmustafa-shorthand-guide-agentic-security.md)
Every input channel (GitHub PRs, MCP responses, file contents) is a prompt injection surface. CVE-2025-59536 and CVE-2026-21852 are real Claude Code vulnerabilities.
**Implementation**: Audit all MCP servers in `settings.json`. Remove MCPs that accept arbitrary external input. Run AgentShield scanner (`ecc-agentshield`) as one-time audit. Validate `/tmp/cmux.sock` inputs.
**Priority**: High — workers with `--dangerously-skip-permissions` + prompt injection = full execution capability.

#### Agent Skills as Executable Playbooks (from Siemens Fuse EDA)
**Source**: [articles/2026-03/nvidia-gtc-industrial-eda-agent-partners.md](./articles/2026-03/nvidia-gtc-industrial-eda-agent-partners.md)
Decompose complex stories into sequenced playbook steps with focused, minimal prompts per step. Workers load only the skill file relevant to their current step, not the entire project context.
**Implementation**: Write `.md` playbook files per task type (`skills/implement-feature.md`, `skills/fix-bug.md`, `skills/review-pr.md`). Orchestrator selects and injects per worker.
**Priority**: High — directly combats context window saturation, our #1 worker failure mode.

#### Long-Running Loops with Persistent Isolation (from Adobe/NVIDIA)
**Source**: [articles/2026-03/adobe-nvidia-partnership-agentic-workflows.md](./articles/2026-03/adobe-nvidia-partnership-agentic-workflows.md)
Workers must be recoverable across orchestrator restarts (`tmux has-session` + state file recovery). Add per-worker token budgets to prevent runaway agents.
**Implementation**: Add `token_budget` field to state per session. Estimate usage via output length heuristic. Kill workers exceeding budget. Re-attach to surviving workers on restart.
**Priority**: High — worker persistence across orchestrator crashes is our #2 failure mode.

#### Harness-Only Benchmarking / Isolate Harness vs Model Delta (from Jensen Huang GTC panel)
**Source**: [talks/2026-03/jensen-huang-panel-nvidia-gtc-2026.md](./talks/2026-03/jensen-huang-panel-nvidia-gtc-2026.md)
Harrison Chase demonstrated a 13.7-point benchmark improvement from harness changes alone (no model changes). Track merged PR quality metrics before/after prompt or harness changes, holding the model constant. Proves whether improvements come from harness engineering or model upgrades.
**Implementation**: After each orchestrator prompt change, compare the next 5 PRs against the previous 5 on: review cycles needed, CI pass rate on first push, time-to-merge. Log to `_bmad/harness-benchmarks.jsonl`. Never change model AND harness simultaneously.
**Priority**: High — without this, we can't attribute improvements and risk losing gains on prompt rewrites.

### 5.2 MEDIUM PRIORITY

#### Post-Training Specialist Scouting (from Jensen Huang GTC panel)
**Source**: [talks/2026-03/jensen-huang-panel-nvidia-gtc-2026.md](./talks/2026-03/jensen-huang-panel-nvidia-gtc-2026.md)
Jensen predicted post-training will dominate compute (pre-training shrinks from 90% to a fraction). Specialized post-trained models will beat frontier generalists on specific tasks. Distinct from Complexity Router (5.2) which routes for cost — this is about quality: a fine-tuned coding model may produce fewer review cycles than Opus on lint-fix or test-writing tasks.
**Implementation**: Monthly check: scan HuggingFace Open LLM Leaderboard + SWE-bench for specialist models outperforming Opus on coding. Trial by spawning one worker with the specialist for 5 identical tasks alongside an Opus worker. Compare review cycles and CI pass rate. Note: Claude Max makes cost irrelevant; only route if quality improves.
**Priority**: Medium — blocked until specialist models demonstrably beat Opus on our task types.

#### Filesystem as Infinite External Memory (from LangChain + Harrison Chase)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Before any compaction, write full pre-compaction state to `_bmad/compaction-history/<timestamp>.md`. Makes compaction reversible — agent recovers full context from disk.
**Implementation**: Extend `orchestrator-handoff.sh` to dump complete conversation summary before compacting. Add recovery instruction: "Check `_bmad/compaction-history/` for full pre-compaction records."
**Priority**: Medium — safety net for aggressive compaction.

#### Recent-10% Preservation Ratio (from LangChain)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
Default compaction: retain most recent 10% verbatim, summarize preceding content into: (1) session intent, (2) artifacts created/modified, (3) current state, (4) next steps.
**Implementation**: Modify compaction prompt to require structured summary format. Prevents vague summaries that cause goal drift.
**Priority**: Medium — improves compaction quality over current default.

#### Trace Analyzer Meta-Loop / Sleep-Time Compute (from LangChain + Harrison Chase)
**Source**: [talks/2026-03/open-models-runtime-harness-langchain-nvidia.md](./talks/2026-03/open-models-runtime-harness-langchain-nvidia.md)
After failed runs, capture full traces, spawn analysis agents, synthesize findings, propose harness changes. Similar to ML boosting — focus improvement on previous mistakes. "Send us a trace" replaces "show me the code."
**Implementation**: Build a `/reflect` command that reads `_bmad/traces/` since last reflection, identifies patterns, proposes orchestrator prompt changes, writes to `_bmad/reflection/<date>.md`.
**Priority**: Medium — creates supervised self-improvement loop.

#### Complexity Router / Model Tiering (from Vercel + NVIDIA Enterprise)
**Source**: [articles/vercel-knowledge-agents-without-embeddings.md](./articles/vercel-knowledge-agents-without-embeddings.md)
Classify tasks by complexity; route simple tasks (lint fixes, typos) to cheaper models. All 13 enterprise implementations at GTC 2026 use frontier for orchestration + cheap for execution.
**Implementation**: Heuristic on issue labels. NOTE: MEMORY.md says "Sonnet gets stuck, Opus only" — start with truly trivial tasks only. At Claude Max $200/mo cost is fixed, but pattern matters at API scale.
**Priority**: Medium — test carefully given past Sonnet failures.

#### Provider Adapter Registry (from T3 Code)
**Source**: [developer-gui/t3code.md](./developer-gui/t3code.md)
Define `WorkerAdapter` interface: `spawn(task)`, `sendPrompt(text)`, `captureOutput()`, `isAlive()`, `kill()`. Current tmux = `TmuxWorkerAdapter`. Enables future: `CmuxWorkerAdapter`, `DockerWorkerAdapter`, `SDKWorkerAdapter`.
**Implementation**: Abstract tmux-specific code behind an interface. Orchestration loop stays unchanged when swapping runtimes.
**Priority**: Medium — our orchestrator is currently hardcoded to tmux.

#### Minimal Worker CLAUDE.md (from Ghostling/Hashimoto)
**Source**: [agent-harnesses/ghostling.md](./agent-harnesses/ghostling.md)
For focused tasks, minimal config (build instructions + 3 conventions) outperforms verbose multi-page config. Hashimoto's 10-line AGENTS.md produced "code I'd accept as a PR from a colleague."
**Implementation**: Create task-specific mini-CLAUDE.md for workers. A lint-fix worker needs build commands and style rules, not the full orchestrator architecture.
**Priority**: Medium — reduces context waste in workers.

#### Pragmatic Quality Bar (from Ghostling/Hashimoto)
**Source**: [agent-harnesses/ghostling.md](./agent-harnesses/ghostling.md)
"If an engineer I worked with PRed all this, I would've accepted it." Stop REVIEW-FIX loop when: tests pass + lint clean + implements spec. Don't iterate for cosmetic elegance.
**Implementation**: Define explicit "done" criteria per task type. Terminate review loop on quality criteria, not just max-cycle count.
**Priority**: Medium — prevents burning 3 review cycles on cosmetic improvements.

#### Intent-Aware Blast Radius Containment (from CrowdStrike)
**Source**: [articles/crowdstrike-nvidia-secure-agent-blueprint.md](./articles/crowdstrike-nvidia-secure-agent-blueprint.md)
Constrain damage radius, not capability. Workers do anything within their worktree but cannot touch other worktrees or main tree. Network: GitHub API + Anthropic API only.
**Implementation**: Filesystem ACLs per worktree. Network egress filtering per process.
- `tmux v3:` Script isolation in `run-tmux.sh`.
- `cmux v4.1:` Extend workspace isolation with explicit deny rules.
**Priority**: Medium — preserves full autonomy within bounded scope.

#### Deny-by-Default Tool Access (from Cisco/NVIDIA)
**Source**: [articles/cisco-nvidia-securing-enterprise-agents.md](./articles/cisco-nvidia-securing-enterprise-agents.md)
Agents start with zero permissions; access explicitly granted per-tool. All MCP calls inspected at gateway level. Trust verified continuously.
**Implementation**: Create tool whitelists per worker type (code-worker: Edit/Write/Bash; reviewer: Read/Bash only). Log all MCP invocations to audit trail.
**Priority**: Medium — zero-trust model for agent tooling.

#### Three-Layer Governance: Deploy / Operate / Comply (from ServiceNow)
**Source**: [articles/servicenow-nvidia-governing-autonomous-workforce.md](./articles/servicenow-nvidia-governing-autonomous-workforce.md)
Deploy: validate worktree, policy, credentials before spawn. Operate: poll every 30s, detect anomalies. Comply: verify PR, E2E, devlog after completion.
**Implementation**: Formalize as three explicit gates in the orchestrator loop. We have partial implementations of all three — formalizing them creates a governance framework that scales.
**Priority**: Medium — structures what we already partially do.

#### Credential Injection via Environment Variables (from NVIDIA OpenShell)
**Source**: [infrastructure/nvidia-openshell.md](./infrastructure/nvidia-openshell.md)
Inject API keys via env vars at runtime, never write to filesystem. Each worker gets only needed credentials. Clear on window kill.
**Implementation**: Modify `run-tmux.sh` to inject credentials via `tmux send-keys` exports. Never write `.env` inside worktrees.
**Priority**: Medium — workers can currently read `.env`, `.git/config`, shell history.

#### Proactive Issue Detection (from Amdocs/NVIDIA)
**Source**: [articles/nvidia-enterprise-agent-architectures-gtc-2026.md](./articles/nvidia-enterprise-agent-architectures-gtc-2026.md)
Background monitor agent that periodically scans for: failing CI, stale PRs, dependency vulnerabilities, test coverage regression. Creates GitHub issues automatically.
**Implementation**: Spawn a persistent monitoring worker that runs scans and feeds discovered issues into the backlog. Transforms orchestrator from reactive to proactive.
**Priority**: Medium — significant value increase for client work where uptime matters.

#### Procedural Memory in Persistent Objects (from Palantir)
**Source**: [articles/palantir-nvidia-enterprise-agents.md](./articles/palantir-nvidia-enterprise-agents.md)
Project-scoped structured learnings from previous agent sessions. When a worker discovers a pattern (e.g., "this project uses Vitest not Jest"), it writes to procedural memory. Subsequent workers read at startup.
**Implementation**: Create `worker-memory/` per project with JSONL entries: `{"pattern": "...", "learned_from": "issue-42", "confidence": "high"}`. Differs from CASS Memory (2.2) by being project-scoped and code-discovery-focused.
**Priority**: Medium — reduces worker ramp-up time on recurring projects.

#### Crash-Safe Task Closeout with Orphan Detection (from GSD-2)
**Source**: [agent-harnesses/gsd-2.md](./agent-harnesses/gsd-2.md)
On crash recovery, verify claimed phase outcomes actually happened. If state says "merging", check `gh pr list --state merged`. If state says "waiting_for_pr", check if worker window still exists.
**Implementation**: Add outcome verification to `/tmux-recovery`. Don't trust state file — verify against observable reality (extends ZFC Principle from 2.2).
**Priority**: Medium — catches state/reality divergence from mid-crash writes.

#### Domain-Constrained Agent Grounding via Test Suites (from Dassault/NVIDIA)
**Source**: [articles/2026-03/nvidia-gtc-industrial-eda-agent-partners.md](./articles/2026-03/nvidia-gtc-industrial-eda-agent-partners.md)
Inject test suite results as a constraint BEFORE the worker starts coding. Run `npm test` in target project, include output in worker prompt as "current ground truth." Include TypeScript type definitions for files the worker will modify.
**Implementation**: Before spawning worker, run `tsc --noEmit` + `npm test`, inject results. Worker prompt: "Your changes must not break these passing tests."
**Priority**: Medium — workers that know the test suite write better code. #3 failure mode (breaking existing tests) addressed.

#### Hybrid Retrieval for Agent Context (from Atlassian Rovo)
**Source**: [articles/2026-03/atlassian-rovo-semantic-search-agents.md](./articles/2026-03/atlassian-rovo-semantic-search-agents.md)
Combine structured signals (file recency via `git log`, issue labels, PR status) with keyword search to prioritize context injection. No embeddings needed — "hybrid" means structured signals weight alongside textual match. 26-40% retrieval quality uplift.
**Implementation**: Before constructing worker prompts, read `git log --since` + issue metadata. Enrich prompt with recency-weighted context.
**Priority**: Medium — reduces hallucination and stale-context bugs.

#### Token-Optimized Tool Output (from Beads Viewer)
**Source**: [agent-harnesses/beads-viewer.md](./agent-harnesses/beads-viewer.md)
When piping CLI output into agent prompts, prefer compressed formats. `bv --format toon`, `gh pr diff --stat` first, `--patch` only if needed. Apply to own state files: compact read format for context injection.
**Implementation**: Audit all tool outputs entering agent context. Prefer `--stat` over `--patch`, `--oneline` over verbose.
**Priority**: Medium — context is zero-sum; every verbose token wastes reasoning budget.

#### Consistency Hashing for State Drift Detection (from Beads Viewer)
**Source**: [agent-harnesses/beads-viewer.md](./agent-harnesses/beads-viewer.md)
Add `data_hash` to `orchestrator-tmux-state.json`. Workers verify they're operating on current state. If hash mismatch on PR review, re-read state.
**Implementation**: Hash current epic + story states. Workers include hash in their result. Orchestrator rejects stale-state results.
**Priority**: Medium — catches silent state drift deterministically.

### 5.3 LOW PRIORITY

#### Programmatic VT Parsing for Agent Output (from libghostty)
**Source**: [developer-gui/libghostty.md](./developer-gui/libghostty.md)
Use libghostty-vt (WASM or C FFI) to parse full VT stream. Distinguish "agent is thinking" from "agent is stuck" with certainty. Replaces heuristic pattern matching on captured text.
**Implementation**: Build Node.js helper using libghostty-vt. Dramatically improves stuck-detection accuracy.
**Priority**: Low — current heuristics work; this is an accuracy upgrade.

#### L4 Autonomy Level Framing (from Synopsys/NVIDIA)
**Source**: [articles/2026-03/nvidia-gtc-industrial-eda-agent-partners.md](./articles/2026-03/nvidia-gtc-industrial-eda-agent-partners.md)
Redefine AUTO_MODE as autonomy levels: L3 = pause at roadblocks, L4 = skip and continue (current ENABLED), L5 = auto-merge without review. Industry-standard taxonomy from Samsung/TSMC.
**Implementation**: Rename flag semantics. Documentation-only change. Useful for enterprise client pitches.
**Priority**: Low — costs nothing, improves client communication.

#### Four-Tier Agent Maturity Model (from Palantir AIP)
**Source**: [articles/palantir-nvidia-enterprise-agents.md](./articles/palantir-nvidia-enterprise-agents.md)
Maturity ladder: Tier 1 (manual, DONE), Tier 2 (single-issue workers, DONE), Tier 3 (orchestrator with state machine, IN PROGRESS), Tier 4 (event-driven, zero human initiation, FUTURE).
**Implementation**: Use as internal roadmap vocabulary. "We're at Tier 3, targeting Tier 4" is more precise than "making it more automated."
**Priority**: Low — planning/communication framework, not implementation.

#### Agent-Buildable Terminal UIs via libghostty (from Hashimoto demo)
**Source**: [posts/2026-03/mitchellh-libghostty-empty-repo-standalone-terminal.md](./posts/2026-03/mitchellh-libghostty-empty-repo-standalone-terminal.md)
Empty repo to working terminal emulator using libghostty C API. Validates that agents can build custom terminal UIs. Future orchestrator dashboard could be libghostty-native.
**Priority**: Low — cmux already covers our needs; this is a future capability signal.

---

## 6. Appendix: Pattern Sources by Relevance

| Score | Count | Sources |
|-------|-------|---------|
| FOUNDATIONAL | 3 | Back Pressure Hierarchy (Huntley), Specs as Truth (Huntley), 70/30 Deterministic-LLM Boundary |
| 9/10 | 8 | Agentic Engineering Patterns (Willison), Everything Claude Code, IndyDevDan practitioner profile, Browser E2E Testing Tools reference, Measuring AI Agent Autonomy (Anthropic), Claude Code Channels, ccusage, Beads |
| 8/10 | 11 | Superpowers (Jesse Vincent), SWE-Bench Pro, Google ADK Patterns, Google Agent Protocols, Random Labs Slate, LangChain/NVIDIA talk, Autonomous Coding Demo (Anthropic), DCG, Agent of Empires, Semgrep, Langfuse |
| 7/10 | 12 | agent-browser, Rodney, Bowser, zmx, Open-SWE, OpenSandbox, CLIProxyAPI, Claude Plugins, Overstory, Broomie, dmux, CASS Memory System |
| Testing infra | 9 | TEA framework (190+ knowledge files), 9 TEA workflows, 11 testing commands |
| Incidents | 8+ | Pi INC-001–008, L-INC-001–015, CMUX-BUG-01–05, MAST taxonomy (1,642 traces) |
| Synthesis | 30 | Full catalogue analysis (2026-03-21): 11 agents, 344 entries → SYNTHESIS-REPORT.md |
| Wave 2-3 | 33 | LangChain context eng. (6), Vercel/Ghostty (7), NVIDIA enterprise security (7), GSD-2/ADK/security harnesses (6), Siemens/Adobe/Atlassian industrial (7) — 100 patterns analyzed, 42 new after dedup |
| Wave 4 (2026-04-11) | 5 | Harness Convergence wave — see section 7 below |

---

## 7. Wave 4 — 2026-04-11 Harness Convergence Wave

> **Source**: [Harness Convergence Wave Synthesis](./reference/synthesis-2026-04-11-harness-convergence-wave.md) — 16 entries analyzed across OpenAI Symphony, Google Scion, Microsoft Aspire, GitHub Copilot Applied Science, AutoAgent, AutoKernel, ACPX, Hermes-Wiki, Karpathy LLM Wiki, Jack Chen open-multi-agent, and 6 more.
>
> The week the "general harness" stopped being a category pitch and became shipped industry consensus.

### Pattern W4-1 — Event-Driven Agent Loop (retire capture-pane polling)
**Sources**: [Noah Zweben Monitor tool](./practitioners/x-activity/noahzweben/2026-04.json) + [openclaw/acpx](./agent-harnesses/openclaw-acpx.md)
Replace all `tmux capture-pane -p -S -50` polling in the orchestrator loop with two event sources: (1) Anthropic's Monitor tool (shipped 2026-04-09) for in-process events (file changes, PR status, log errors) that wake the agent inside its own Claude Code session; (2) ACPX `--format json` NDJSON event stream for out-of-process agent lifecycle events (`turn_end`, `tool_call`, `diff`, `session/cancel`). The orchestrator stops polling; it waits on stdin for events. Retires the fragility of ANSI-escape scraping. Pairs directly with Vincent Kottsch's 2026 token-efficiency thesis ("2025 was token maxing, 2026 is about not wasting them — agent in the loop").
**Implementation**: Replace `tmux capture-pane` reads in `.claude/agents/orchestrator.md` Rule #3 with `acpx claude --format json -s <issue-id>` + `jq -c 'select(.type == "turn_end")'`. Wire Noah's Monitor tool into Claude Code worker sessions as the in-process event stream.
**Priority**: **CRITICAL** — highest-ROI change in the catalogue this month. 2-day effort.

### Pattern W4-2 — Run-Attempt Phase Enum (Symphony)
**Source**: [OpenAI Symphony](./agent-harnesses/openai-symphony.md)
Replace ad-hoc status strings (`spawning`, `working`, `blocked`) in `_bmad/orchestrator-tmux-state.json` with Symphony's run-attempt phase enum: `PreparingWorkspace` → `BuildingPrompt` → `LaunchingAgentProcess` → `InitializingSession` → `StreamingTurn` → `Finishing` → `{Succeeded | Failed | TimedOut | Stalled | CanceledByReconciliation}`. Gives us a formal language for worker state aligned with OpenAI's public specification. Enables precise recovery dispatch — `/tmux-recovery` can branch on `Stalled` vs `TimedOut` vs `CanceledByReconciliation`.
**Implementation**: Schema upgrade to `orchestrator-tmux-state.template.json`; migration script for existing state.
**Priority**: **HIGH** — foundational schema change. 1-day effort.

### Pattern W4-3 — ACPX Capability-Scoped Permissions (retire --dangerously-skip-permissions)
**Sources**: [openclaw/acpx](./agent-harnesses/openclaw-acpx.md) + [AIE Europe 2026 Synthesis — Sunil Pai Code Mode](./conference-reports/aie-europe-2026-synthesis.md)
Replace `claude --dangerously-skip-permissions` with `acpx claude --approve-reads -s <issue-id>` for reviewer workers (read-only) and `acpx claude --approve-all -s <issue-id>` for fixer workers (write allowed). Per-call capability scoping instead of ambient "allow everything". First layer of the capability-based sandbox bet from AIE Europe 2026; intermediate step before the Deno capability-bounded worker sandbox prototype. Plugs directly into AgentShield's 102-rule scanner primary attack surface.
**Implementation**: Update `run-tmux.sh` worker launch to use `acpx` wrapper with permission flag per worker role (reviewer vs fixer vs orchestrator).
**Priority**: **HIGH** — security + AgentShield-alignment. 1-day effort.

### Pattern W4-4 — AutoAgent 3-File Meta-Harness Architecture
**Sources**: [AutoAgent (MarkTechPost)](./articles/2026-04/marktechpost-autoagent-self-optimizing-harness.md) + [AutoKernel (MarkTechPost)](./articles/2026-04/marktechpost-autokernel-gpu-kernel-agent.md)
Structure the orchestrator prompt layer as a three-file contract: (1) `agent.md` — the mutable harness (prompts, tools, rules) the orchestrator actually runs; (2) `program.md` — human-authored, natural-language optimization directive ("minimize human interventions", "maximize E2E pass rate", "never produce slop"); (3) `tasks/` — directory of scorable task definitions (omniport-hh E2E suite is the obvious candidate). Makes the harness introspectable and creates substrate on which AutoAgent-style meta-optimization could actually run against our orchestrator overnight. Adjacent win: forces explicit definition of what "good orchestrator run" means as a scoring function.
**Implementation**: Split `.claude/agents/orchestrator.md` into `orchestrator-agent.md` + `orchestrator-program.md`; define initial 5 task scorers (E2E pass, PR merge, review-fix cycles, token cost, human-intervention count).
**Priority**: **MEDIUM** — foundational for Phase-3 self-optimization. 3-day effort. Blocker: needs omniport-hh E2E stable for scoring substrate.

### Pattern W4-5 — Spike-then-Harden Pivot Workflow (Cody Seibert uncertainty gate)
**Source**: [Cody Seibert — 2 AI Coding Strategies](./talks/2026-04/web-dev-cody-2-ai-coding-strategies.md)
Add an explicit **uncertainty gate** at issue intake. Well-defined acceptance criteria → route to plan-mode + deterministic gates (current path). Exploratory / uncertain → route to prototype-mode (vibes + parallel agent windows, no plan doc). When uncertain-mode discovers the true requirements, workflow transitions: `UNCERTAIN_PROTOTYPE` → `DISCOVERED_REQUIREMENTS` → `DISCARD_PROTOTYPE` → `PLAN_MODE_RESTART`. Stop treating prototype code as final. Cody's quote: "Sometimes you start adding more slop into your code base" — iterative mode is for discovery only. Pairs with Matt Pocock's "bad code is more expensive than ever" thesis.
**Implementation**: Add pre-flight intake check to orchestrator loop; add `UNCERTAIN_PROTOTYPE` state to phase enum; devlog tagging for mode transitions.
**Priority**: **MEDIUM** — addresses real failure mode in single-track flow. 2-day effort.

### Honorable Mentions from Wave 4

- **Amdahl's-law target ranking** (AutoKernel) — Profile orchestrator loop, rank targets by time share, optimize where the numbers say. More principled than our current fixed retry counts.
- **5-stage correctness harness** (AutoKernel) — smoke → shape sweep → adversarial → determinism → edge cases. Adapt to UI/E2E gate as a staged pattern.
- **Workflow.md governance model** (Symphony) — Single file with YAML front matter + Markdown body for orchestrator config + prompt template. Hot reload without restart. Better than our CLAUDE.md + settings.local.json split.
- **Model empathy** (AutoAgent) — Same-model pairing beats cross-model for meta-level optimization. Reinforces "Opus only" memory rule; the rule does NOT weaken just because cheaper models exist.
- **Karpathy Lint operation** (LLM Wiki) — The third leg of Ingest/Query/Lint. `/catalogue-lint` skill for weekly health checks on orphan pages, stale claims, missing cross-references. 1-day build; closes Karpathy's triangle for our catalogue.
- **Isolation over constraints** (Google Scion) — Philosophical summary of our own architecture in four words; good client-pitch language.
- **Dual-surface content pattern** (KarpathyTalk) — HTML + Markdown + JSON per URL; content negotiation by suffix, not `Accept` header. Our catalogue already does this; Karpathy is independent validation.
