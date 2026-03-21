# Adoptable Patterns Backlog

> **Living document.** Collects actionable patterns, ideas, and lessons from catalogue research that should be considered for the L-Thread Orchestrator. Updated by ingest agents and manual sessions.
>
> **Location rationale:** Top-level in `research/catalogue/` alongside `INDEX.md` so any agent reading the catalogue sees it immediately. Referenced from `CLAUDE.md` and `INDEX.md`.

| Field | Value |
|-------|-------|
| Type | Living Backlog |
| Created | 2026-03-21 |
| Last Updated | 2026-03-21 (testing section added) |
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

> **Context**: Comprehensive analysis from 5 parallel research agents (2026-03-21) covering: catalogue entries on testing, G. Huntley's methodology, IndyDevDan's principles, past orchestrator incidents, existing TEA infrastructure, and browser automation research. Goal: prevent the planning and testing failures that plagued previous sprints.

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
5. UI Verification — Chrome/agent-browser E2E screenshots
6. Git History     — previous commits as implicit guidance
```

**Implementation for orchestrator**:
- Worker agent prompts must enforce this stack top-down: typecheck → test → lint → build → E2E
- If any layer fails, the worker loops on THAT layer before proceeding (not skip to next)
- The orchestrator's REVIEW step should verify all 6 layers passed before accepting a PR
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

### 3.5 HIGH PRIORITY — Replace Chrome DevTools MCP with agent-browser

**Source**: [agent-harnesses/agent-browser.md](./agent-harnesses/agent-browser.md), [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

Vercel's agent-browser achieves **93% context reduction** via "Snapshot + Refs" — semantic locators (ARIA roles, text content) with compact element references (`@e1`, `@e2`) instead of full DOM/accessibility trees. Rust CLI + Node daemon architecture.

**Capabilities**: 108+ commands — navigation, form interaction, network interception, screenshots, PDF generation, multi-tab, iframe, auth state persistence, mock API responses for deterministic E2E.

**Implementation**:
- Install agent-browser alongside Chrome DevTools MCP
- Update E2E screenshot gate (`e2e-screenshots.md`) to use agent-browser commands
- 93% context savings → enables 10 parallel agents within budget previously supporting 3
- Auth state persistence eliminates re-login overhead per test run
- Network interception enables mocking external APIs for deterministic tests
**Priority**: High — single highest-impact testing infrastructure change.

**Alternatives evaluated**:
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
- State file update backstop: always persist state after every phase transition (already in v3, formalize)
- Devlog entry backstop: always record result even on failure
- Escalation trigger: if quality dips (3+ review cycles), flag for human review
**Priority**: High — these are the deterministic safety nets that catch what prompts miss.

### 3.8 HIGH PRIORITY — Feature-Based Regression Suite

**Source**: Incident analysis (INC-014, L-INC-014), [articles/2026-02/agentic-engineering-patterns.md](./articles/2026-02/agentic-engineering-patterns.md)

INC-014 and L-INC-014 both document the same failure: tasks marked Done without E2E verification, regressions found by users. The fix isn't "remember to test" — it's structural.

**Pattern**: Every feature gets a persistent E2E test that runs on EVERY future PR. Not just screenshot-on-merge, but a regression suite that grows with the product.

**Implementation**:
- After each story is Done + E2E verified, the worker writes a Playwright test covering the user flow
- These tests accumulate in `e2e/` and run in CI on every PR
- The orchestrator's REVIEW step checks: "Did the worker add/update the E2E test for this feature?"
- TEA workflow `/bmad-tea-testarch-automate` generates these tests — ACTIVATE IT
**Priority**: High — directly prevents the #1 recurring incident.

### 3.9 HIGH PRIORITY — One-Task-Per-Context Discipline (G. Huntley)

**Source**: [articles/2025-07/ralph-wiggum-agent-loop.md](./articles/2025-07/ralph-wiggum-agent-loop.md)

> "If the bowling ball is in the gutter, there's no saving it."

Context windows are memory allocation: reading files = `malloc()`, there is no `free()`. If an agent's context becomes polluted (derailed, wrong path, accumulated errors), don't try to salvage — kill and restart fresh.

**Implementation**:
- Workers get ONE task. If stuck after 3 retry cycles, kill the window and re-spawn fresh
- The orchestrator NEVER sends a second task to the same worker context
- If a test fails, the agent must confront the failure in a fresh context (the loop itself IS the error recovery)
- Already aligned with v3 architecture (worker per tmux window) — formalize as a rule
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

**Implementation**: Enhance `orchestrator-handoff.sh` with these thresholds. Currently we only have the 99% forced compaction.
**Priority**: Medium — prevents context loss in long sessions.

### 3.16 MEDIUM PRIORITY — Accessibility Testing (BITV 2.0)

**Source**: [agent-harnesses/rodney.md](./agent-harnesses/rodney.md)

Rodney's accessibility commands (`ax-tree`, `ax-find`, `ax-node`) enable BITV 2.0 compliance testing as part of E2E gate. ARIA-based semantic locators (agent-browser) are more resilient to UI changes than CSS selectors.

**Implementation**: Add accessibility checks to E2E screenshot gate for customer-facing projects (OmniPort-HH especially — public sector requires BITV 2.0).
**Priority**: Medium — required for public sector contracts.

### 3.17 LOW PRIORITY — Graphite Stacked PRs for Multi-Agent Merge Safety

**Source**: [reference/browser-e2e-testing-tools.md](./reference/browser-e2e-testing-tools.md)

When multiple workers create PRs simultaneously, merge conflicts are inevitable. Graphite's stacked PR pattern + merge queue solves this by sequencing dependent changes.

**Implementation**: Evaluate when running 4+ parallel workers regularly. Current 2-3 worker limit makes this less urgent.
**Priority**: Low — becomes High at 4+ parallel workers.

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
| L-INC-013 (Chrome DevTools instability) | Fragile E2E infrastructure | agent-browser replacement (3.5) |
| MAST taxonomy (1,642 traces) | 14 failure modes across 4 categories | Deterministic middleware hooks (3.7) |

### Sprint Activation Checklist

**Day 0 (before any code)**:
- [ ] Run `/bmad-tea-testarch-framework` — initialize Playwright + fixtures
- [ ] Run `/bmad-tea-testarch-ci` — scaffold CI quality pipeline
- [ ] Write specs for every planned feature (3.2)
- [ ] Define risk matrix for auto-ship vs manual review (3.12)

**Every story**:
- [ ] Run `/bmad-tea-testarch-atdd` — failing acceptance tests before code
- [ ] Worker prompt includes "first run the tests" (3.4)
- [ ] One task per context, kill on 3rd retry (3.9)

**Every PR**:
- [ ] PreCompletionChecklist: tests pass, lint clean, git status clean (Section 2.1)
- [ ] E2E screenshot gate with agent-browser (3.5)
- [ ] Worker adds/updates Playwright regression test (3.8)

**Every epic completion**:
- [ ] Run `/bmad-tea-testarch-trace` — requirements traceability (3.14)
- [ ] Run `/bmad-tea-testarch-automate` — expand coverage gaps
- [ ] Log failure domains to `_bmad/failure-domains.jsonl` (3.10)
- [ ] Update specs with lessons learned

---

## 4. Appendix: Pattern Sources by Relevance

| Score | Count | Sources |
|-------|-------|---------|
| FOUNDATIONAL | 3 | Back Pressure Hierarchy (Huntley), Specs as Truth (Huntley), 70/30 Deterministic-LLM Boundary |
| 9/10 | 6 | Agentic Engineering Patterns (Willison), Everything Claude Code, IndyDevDan practitioner profile, Browser E2E Testing Tools reference, Measuring AI Agent Autonomy (Anthropic), Claude Code Channels |
| 8/10 | 7 | Superpowers (Jesse Vincent), SWE-Bench Pro, Google ADK Patterns, Google Agent Protocols, Random Labs Slate, LangChain/NVIDIA talk, Autonomous Coding Demo (Anthropic) |
| 7/10 | 8 | agent-browser, Rodney, Bowser, zmx, Open-SWE, OpenSandbox, CLIProxyAPI, Claude Plugins |
| Testing infra | 9 | TEA framework (190+ knowledge files), 9 TEA workflows, 11 testing commands |
| Incidents | 8+ | Pi INC-001–008, L-INC-001–015, CMUX-BUG-01–05, MAST taxonomy (1,642 traces) |
