# Definitive Synthesis Report: Building a Visible Multi-Agent Orchestrator

> **Source base:** 344-entry AI agent knowledge catalogue, 9 research agents, 81 reference docs, 7 practitioners, 176 tools analyzed
> **Date:** 2026-03-21
> **Purpose:** Comprehensive architecture and adoption plan for L-Thread Orchestrator v4 — full-visibility multi-agent system using tmux + Claude Code + Beads
> **Author:** Research synthesis from Waves 1-3 (15 agents total)

---

## 1. Executive Summary

The 344-entry catalogue reveals a convergent industry consensus: production multi-agent systems succeed with a **70/30 deterministic/LLM architecture** (Stripe, OpenAI Codex, Praetorian, DeepMind all independently validated this), **tmux + git worktree** as the isolation substrate (5+ projects independently converged: AoE, dmux, Overstory, Broomie, oh-my-pi), and **deterministic monitoring with bounded escalation** rather than LLM-driven supervision. The L-Thread Orchestrator v3 already implements the correct architectural skeleton. The path forward is not a rewrite but a **progressive hardening**: adopt Beads as the agent-native work tracking layer, install a 6-stage deterministic quality gate pipeline, layer visibility through ccusage + JSONL telemetry + failure-domain logging, and enforce TDD and spec-first discipline on all worker agents. The total implementation effort for Phase 1 (immediate) is approximately 15 hours of orchestrator prompt and script changes, zero new infrastructure, and three tool installations (`bd`, `ccusage`, `agent-browser`). The single highest-leverage change is a 4-word addition to every worker prompt: **"First run the tests."**

---

## 2. Architecture Blueprint

### Target Architecture: L-Thread Orchestrator v4

```
┌─────────────────────────────────────────────────────────────────────┐
│                     HUMAN OPERATOR (Burak)                          │
│  Morning: review devlog + ccusage + failure-domains.jsonl           │
│  Active: observe tmux, intervene on HARD_BLOCK only                 │
│  Evening: launch overnight loops, set AUTO_MODE=ENABLED             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                    ORCHESTRATOR (Claude Opus)                        │
│  tmux window 0 | CLAUDE.md rules | never writes code                │
│                                                                      │
│  State:  _bmad/orchestrator-tmux-state.json                          │
│  Work:   .beads/beads.jsonl (bd ready → next task)                   │
│  Log:    _bmad/devlog.md + _bmad/failure-domains.jsonl               │
│  Obs:    _bmad/telemetry/YYYY-MM-DD.jsonl                            │
│                                                                      │
│  Loop: GET_TASK → SPAWN → WAIT_PR → REVIEW → E2E → MERGE → LOG     │
└────┬──────────┬──────────┬──────────┬───────────────────────────────┘
     │          │          │          │
┌────▼────┐┌───▼────┐┌────▼────┐┌────▼────┐
│Worker 1 ││Worker 2││Worker 3 ││Reviewer │   (max 6 parallel)
│tmux w:1 ││tmux w:2││tmux w:3 ││tmux w:4 │
│worktree ││worktree││worktree ││worktree │
│branch   ││branch  ││branch   ││branch   │
│  │      ││  │     ││  │      ││  │      │
│  └→ PR  ││  └→ PR ││  └→ PR  ││  └→ ✓/✗│
└─────────┘└────────┘└─────────┘└─────────┘
```

### The Five Laws (derived from 344 entries)

Sourced from `reference/master-blueprint.md`, validated across Stripe, DeepMind, Anthropic, Huntley, Yegge:

1. **The orchestrator never writes code.** It routes, monitors, escalates, merges. Workers execute. (`CLAUDE.md` rule 1)
2. **State persists in files, not in context.** JSON state files + JSONL logs + Beads survive compaction, crashes, and session restarts. (`reference/deterministic-llm-boundary.md`)
3. **Quality is gated, not suggested.** Every PR passes a deterministic pipeline: typecheck -> test -> lint -> E2E -> review. No exceptions. (`ADOPTABLE-PATTERNS.md` section 3.1)
4. **Communication is structured.** Workers signal via PR creation + latch files. No free-form chat between agents. (`agent-protocols/12-factor-agents.md`)
5. **Everything has hard bounds.** Max 3 review cycles. Max 6 workers. Max 30min per worker task. Kill and restart beats debugging. (`reference/deterministic-llm-boundary.md`)

### Control Plane vs Execution Plane

| Layer | Tool | Role |
|-------|------|------|
| Control Plane | Orchestrator (Opus in tmux w:0) | Task routing, state management, PR review decisions, merge authority |
| Execution Plane | Workers (Opus in tmux w:1-6) | Code generation, test writing, bug fixing, PR creation |
| Visibility Plane | ccusage + telemetry JSONL + devlog + failure-domains | Token tracking, cost monitoring, pattern detection, learning capture |
| Work Tracking | Beads (.beads/beads.jsonl) | Persistent task graph, dependency resolution, agent-native work discovery |
| Quality Plane | DCG + Semgrep + tests + E2E | Deterministic safety gates wrapping every agent action |

---

## 3. Top 30 Adoptable Patterns

### IMMEDIATE (This Week — Days 1-3)

| # | Pattern | What It Does | Source | GitHub/URL | Effort | Why It Matters |
|---|---------|-------------|--------|------------|--------|----------------|
| 1 | **"First Run the Tests" TDD** | 4-word prompt addition forces red/green TDD discipline on every worker | `ADOPTABLE-PATTERNS.md` section 3.4; `articles/2026-02/agentic-engineering-patterns.md` | Simon Willison, Jesse Vincent (Superpowers) | 1-line prompt edit | Single highest-leverage change. Prevents the "agent writes code that passes its own tests" self-deception cycle. |
| 2 | **ccusage Install** | Zero-install Claude Max usage tracking from local JSONL files | `observability/ccusage.md` | [ryoppippi/ccusage](https://github.com/ryoppippi/ccusage) | `npx ccusage@latest` (2 min) | Validates the 18-36x cost arbitrage claim. Tracks billing windows. Baseline KPI: cost per merged PR. |
| 3 | **Beads Init** | Persistent agent-native issue tracker with dependency graph, `bd ready` for automatic work discovery | `agent-memory/beads.md` | [steveyegge/beads](https://github.com/steveyegge/beads) | `go install` + `bd init` (10 min) | Solves the "50 First Dates" problem — agents resume where the last session left off. Hash-based IDs prevent merge conflicts. |
| 4 | **Defensive Copy-Mode Exit** | Send `q` before every `tmux send-keys` to exit copy/scroll mode | `ADOPTABLE-PATTERNS.md` section 2.1; `pi-orchestrator/_bmad/incidents.md` INC-005 | N/A (1-line bash) | 1-line in orchestrator prompt | Prevents silent nudge/command delivery failures. Zero-cost no-op when not in copy mode. |
| 5 | **remain-on-exit** | tmux panes survive command exit for crash forensics | `orchestration-platforms/agent-of-empires.md` | [njbrake/agent-of-empires](https://github.com/njbrake/agent-of-empires) | 1-line: `tmux set-option -t "$PANE" remain-on-exit on` | When a worker crashes, the pane stays for forensics instead of vanishing. |
| 6 | **PreCompletionChecklist** | Force workers through checklist before signaling done: tests pass, lint clean, git clean, PR created | `ADOPTABLE-PATTERNS.md` section 2.1; `talks/2026-03/open-models-runtime-harness-langchain-nvidia.md` | LangChain/NVIDIA talk | 5-line prompt addition | Prevents sloppy PRs reaching review cycle. Deterministic enforcement of quality minimum. |
| 7 | **Failure Domain Logging** | Append-only `_bmad/failure-domains.jsonl` tracking recurring worker failures | `ADOPTABLE-PATTERNS.md` section 3.10; `practitioners/indydevdan.md` | IndyDevDan "Observability before scale" | Create file + prompt instruction | The meta-pattern that improves all other patterns. When error recurs 3x, fix the prompt/spec, not the code. |
| 8 | **DCG (Destructive Command Guard)** | SIMD-accelerated PreToolUse hook blocks `git push --force`, `rm -rf /`, `npm publish` | `infrastructure/destructive-command-guard.md` | [DCG](https://github.com/anthropics/dcg) | 2-minute install | Sub-ms overhead. Deterministic safety net that catches what prompts miss. |
| 9 | **One-Task-Per-Context** | Workers get ONE task. If stuck after 3 retries, kill and re-spawn fresh | `ADOPTABLE-PATTERNS.md` section 3.9; `articles/2025-07/ralph-wiggum-agent-loop.md` | Geoffrey Huntley | Prompt rule | "If the bowling ball is in the gutter, there's no saving it." Context pollution cascades are unrecoverable. |
| 10 | **Worker Death Verification** | After killing worker, verify process is actually dead (`tmux has-session`) | `ADOPTABLE-PATTERNS.md` section 2.3; `pi-orchestrator/_bmad/incidents.md` INC-007 | N/A | 2-line bash | Prevents ghost workers consuming resources. Polite kill + hard kill + verify. |

### SHORT-TERM (Week 2-3 — Days 4-14)

| # | Pattern | What It Does | Source | GitHub/URL | Effort | Why It Matters |
|---|---------|-------------|--------|------------|--------|----------------|
| 11 | **agent-browser E2E** | 93% context reduction via Snapshot+Refs for E2E testing gate | `agent-harnesses/agent-browser.md`; `reference/browser-e2e-testing-tools.md` | [ArcadeAI/agent-browser](https://github.com/ArcadeAI/agent-browser) | npm install + config (2 hrs) | Replaces Chrome DevTools MCP for functional E2E. Enables 10 parallel E2E agents within budget that previously supported 3. |
| 12 | **Spec-Driven Development** | Every GitHub issue must have acceptance criteria, edge cases, expected behavior before worker starts | `ADOPTABLE-PATTERNS.md` section 3.2; `articles/2025-07/ralph-wiggum-agent-loop.md` | Geoffrey Huntley | Process discipline | "If the agent builds the wrong thing, the specs are wrong." Prevents the #1 waste mode: building to ambiguous requirements. |
| 13 | **Progressive Escalation** | 4-tier watchdog: warn (log) -> nudge (text) -> AI triage (one-shot) -> hard kill. 60s time-gating between tiers | `agent-harnesses/overstory.md`; `pi-orchestrator/_bmad/research/SYNTHESIS.md` Q1 | [jayminwest/overstory](https://github.com/jayminwest/overstory) | ~30 LOC in orchestrator | Eliminates restart storms. Current nudge system is the primitive; this formalizes it with proper escalation. |
| 14 | **ZFC Principle** | Observable state (tmux pane liveness + PID) ALWAYS overrides stored state JSON | `agent-harnesses/overstory.md`; `pi-orchestrator/_bmad/research/SYNTHESIS.md` Q2 | [jayminwest/overstory](https://github.com/jayminwest/overstory) | ~15 LOC in state reconciliation | Eliminates stale state bugs. If registry says "running" but pane is dead, force transition to "crashed". |
| 15 | **LoopDetection** | Sliding window of last N captured outputs. If same error pattern repeats 3x, inject "you appear stuck" | `ADOPTABLE-PATTERNS.md` section 2.1; `talks/2026-03/open-models-runtime-harness-langchain-nvidia.md` | LangChain/NVIDIA | ~20 LOC | Catches infinite retry loops that waste tokens and time. |
| 16 | **Reasoning Sandwich** | Extended thinking for planning AND verification, fast execution in between | `ADOPTABLE-PATTERNS.md` section 2.1; `talks/2026-03/open-models-runtime-harness-langchain-nvidia.md` | LangChain/NVIDIA | Prompt addition | Plan -> Execute -> Verify pattern. Both plan and verify use deep reasoning. |
| 17 | **Three-State Agent Status** | Workers report working/blocked/help status via structured output | `agent-harnesses/broomie.md` | [broomie](https://github.com/broomie-ai/broomie) | ~15 LOC status parsing | Enables the orchestrator to prioritize attention: help > blocked > working. |
| 18 | **Risk-Based Shipping Gates** | Auto-ship UI changes, light review features, hard block DB/auth/security changes | `ADOPTABLE-PATTERNS.md` section 3.12; `posts/2026-03/geoffreyhuntley-embedded-software-factory-rad-is-back.md` | Geoffrey Huntley | Risk matrix definition | "On the loop, not in the loop." Reduces human review bottleneck from 5-6 PRs/day to only the high-risk ones. |
| 19 | **Semgrep MCP** | Inline SAST scanning as native agent tool during code generation | `code-intelligence/semgrep.md` | [semgrep](https://github.com/returntocorp/semgrep) | MCP install (30 min) | 14K stars. Zero-cost quality gate. Catches security issues before PR creation. |
| 20 | **5-Stage Context Compaction** | WARNING(70%) -> MASK(80%) -> PRUNE(85%) -> AGGRESSIVE(90%) -> COMPACT(99%) with artifact survival | `ADOPTABLE-PATTERNS.md` section 3.15; `agent-harnesses/opendev.md` | OpenDev | ~40 LOC in handoff hook | Currently we only have forced 99% compaction. Progressive compaction preserves more useful context. |

### MEDIUM-TERM (Week 4-8 — Days 15-60)

| # | Pattern | What It Does | Source | GitHub/URL | Effort | Why It Matters |
|---|---------|-------------|--------|------------|--------|----------------|
| 21 | **Beads + Orchestrator Integration** | Replace `orchestrator-tmux-state.json` task tracking with `bd ready` for work discovery | `agent-memory/beads.md` | [steveyegge/beads](https://github.com/steveyegge/beads) | 1-2 days | Full dependency graph means orchestrator no longer computes task ordering manually. |
| 22 | **CASS Memory System** | 3-layer cognitive memory: procedural (CLAUDE.md) -> working (Beads) -> episodic (git + session search) | `agent-memory/cass-memory-system.md`; `agent-memory/cass.md` | [cass](https://github.com/cass-community/cass) | 2-3 days | 90-day confidence decay prevents stale knowledge. Sub-60ms search across 13+ agent formats. |
| 23 | **dmux HTTP API** | Replace raw tmux send-keys/capture-pane with HTTP REST API + SSE streaming | `orchestration-platforms/dmux.md` | [standardagents/dmux](https://github.com/standardagents/dmux) | 1-2 days migration | 11 lifecycle hooks with 3-tier resolution. AI-assisted merge conflict resolution. Most feature-complete tmux wrapper. |
| 24 | **Graphite Stacked PRs** | Stack-aware merge queue for multi-agent PR sequencing | `code-intelligence/graphite.md` | [graphite.dev](https://graphite.dev) | 1 day setup | Solves the 19-20% merge conflict rate when running 4+ parallel workers. |
| 25 | **Property-Based Testing** | Separate reviewer agent writes fast-check properties against spec (not implementation) | `ADOPTABLE-PATTERNS.md` section 3.6 | [fast-check](https://github.com/dubzzz/fast-check) | npm install + prompt rules | Breaks the "cycle of self-deception" where the same agent writes both code and tests. |
| 26 | **Langfuse Self-Hosted** | LLM tracing + cost analytics + evaluation framework | `observability/langfuse.md` | [langfuse](https://github.com/langfuse/langfuse) | Docker compose (2 hrs) | Government client trust artifact. Self-hosted = DSGVO compliant. Enables Judgment SLOs. |
| 27 | **Feature-Based Regression Suite** | Every completed feature gets a persistent Playwright E2E test that runs on all future PRs | `ADOPTABLE-PATTERNS.md` section 3.8 | Playwright | Process + CI config | Directly prevents the #1 recurring incident (INC-014, L-INC-014): tasks marked Done without E2E verification. |
| 28 | **Discord/Telegram Channels** | Remote monitoring and intervention for overnight autonomous runs | `ADOPTABLE-PATTERNS.md` section 2.1; `infrastructure/claude-plugins-official.md` | Claude Plugins Official | Plugin install (15 min) | Enables mobile oversight. Critical for overnight AUTO_MODE sessions. |
| 29 | **CodeRabbit PR Review** | Automated multi-layer PR review (AST + 40 SAST scanners + semantic AI) | `agent-harnesses/coderabbit.md` | [coderabbit.ai](https://coderabbit.ai) | GitHub App install (10 min) | 46% accuracy on real-world runtime bugs. Zero config needed. SOC 2 certified. |
| 30 | **Hook Runtime Gating** | `ECC_HOOK_PROFILE` (minimal/standard/strict) controls which hooks fire per environment | `agent-harnesses/everything-claude-code.md` | [Everything Claude Code](https://github.com/anthropics/ecc) | 1-2 hrs config | PostToolUse hooks run formatters + linters on every file edit. AgentShield: 1,282 security tests. |

---

## 4. Tech Stack Recommendations

### Phase 1: NOW (Days 1-3) — Zero Infrastructure

| Tool | Install | Purpose | Source |
|------|---------|---------|--------|
| **ccusage** | `npx ccusage@latest` | Token/cost tracking | `observability/ccusage.md` |
| **Beads** | `go install github.com/steveyegge/beads/cmd/bd@latest && bd init` | Agent work tracking | `agent-memory/beads.md` |
| **DCG** | `claude hook install dcg` | Destructive command guard | `infrastructure/destructive-command-guard.md` |

**Plus prompt changes (zero install):**
- TDD enforcement in worker prompts
- PreCompletionChecklist in worker prompts
- `remain-on-exit` in tmux session creation
- Defensive `q` before `send-keys`
- failure-domains.jsonl creation

### Phase 2: HARDEN (Days 4-14) — Deterministic Quality

| Tool | Install | Purpose | Source |
|------|---------|---------|--------|
| **agent-browser** | `npm install -g @anthropic/agent-browser` | E2E testing (93% context savings) | `agent-harnesses/agent-browser.md` |
| **Semgrep** | MCP server install | Inline SAST | `code-intelligence/semgrep.md` |
| **Desloppify** | npm install | Agent code quality scanner | `code-intelligence/desloppify.md` |

**Quality gate pipeline activation:**
```
DCG → Semgrep → typecheck → test → lint → Desloppify → E2E → review → merge
```

### Phase 3: SCALE (Days 15-60) — Multi-Agent Infrastructure

| Tool | Install | Purpose | Source |
|------|---------|---------|--------|
| **dmux** | `npm install -g dmux` | HTTP API + SSE for programmatic tmux | `orchestration-platforms/dmux.md` |
| **Graphite** | CLI install + GitHub App | Stacked PRs, merge queue | `code-intelligence/graphite.md` |
| **Langfuse** | `docker compose up` | Self-hosted LLM observability | `observability/langfuse.md` |
| **CASS** | `cargo install cass` | Episodic memory search | `agent-memory/cass.md` |
| **CodeRabbit** | GitHub App install | Automated PR review | `agent-harnesses/coderabbit.md` |
| **fast-check** | `npm install fast-check` | Property-based testing | `ADOPTABLE-PATTERNS.md` 3.6 |

### Phase 4: MATURE (Days 60+) — Production Observability

| Tool | Install | Purpose | Source |
|------|---------|---------|--------|
| **Grafana + Prometheus** | Docker stack | Metrics dashboards | `observability/langfuse.md` (companion) |
| **Sentry** | SaaS or self-hosted | Production error tracking | `ADOPTABLE-PATTERNS.md` 3.20 |
| **LiteLLM** | Docker | Model routing gateway | `infrastructure/litellm.md` |
| **Trigger.dev** | npm or Docker | Durable execution for crash recovery | `infrastructure/trigger-dev.md` |

### Tools to WATCH but NOT install yet

| Tool | Why Wait | Source |
|------|----------|--------|
| **zmx** | v0.4.2 too immature (sessions killed on version upgrade). Watch for v1.0. | `infrastructure/zmx.md` |
| **Agent Relay** | Rust PTY broker replacing tmux. Promising but pre-production. | `orchestration-platforms/relay-app.md` |
| **claude-sneakpeek** | Unlocks native swarm mode but depends on binary patching — fragile across updates. | `agent-harnesses/claude-sneakpeek.md` |

---

## 5. Beads Integration Plan

### Why Beads

Beads solves the **"50 First Dates" problem** (Yegge's framing): every new agent session starts with amnesia. Current state: our orchestrator tracks tasks in `_bmad/orchestrator-tmux-state.json`, which is a flat JSON blob with no dependency graph, no semantic compaction, and no cross-session persistence beyond what the JSON file captures.

Source: `agent-memory/beads.md` | GitHub: [steveyegge/beads](https://github.com/steveyegge/beads) | 18,500 stars | MIT

### Integration Phases

**Phase A: Parallel Trial (Days 1-7)**

```bash
# Install
go install github.com/steveyegge/beads/cmd/bd@latest

# Initialize in target project
cd /Users/buraksmac/Desktop/code2/omniport-hh
bd init

# Create initial task structure from existing GitHub issues
bd create "HiArbeit page complete" -p 0 --epic
bd create "Stellenmarkt sub-page" -p 1 --parent bd-XXXX
bd create "Fix 4 sub-pages returning 404" -p 0
```

Keep `orchestrator-tmux-state.json` running in parallel. Orchestrator uses both: JSON for phase tracking, Beads for task discovery.

**Phase B: Work Discovery Migration (Days 7-14)**

Replace the orchestrator's `GET_NEXT_TASK` step:

```
# Before (v3)
1. Query GitHub issues
2. Pick highest priority unassigned
3. Write to state JSON

# After (v4 with Beads)
1. Run `bd ready` → get unblocked, unclaimed tasks
2. Run `bd update <id> --claim` → atomically claim for this session
3. Dispatch worker with task context from `bd show <id>`
```

Key advantage: `bd ready` automatically resolves the dependency graph. The orchestrator no longer needs to compute task ordering.

**Phase C: Worker Integration (Days 14-30)**

Workers use Beads for sub-task management within their feature work:

```bash
# Worker creates sub-tasks as it discovers work
bd create "Add TypeScript types for API response" -p 2 --parent bd-XXXX
bd create "Write tests for pagination edge case" -p 1 --parent bd-XXXX

# Worker updates status as it completes sub-tasks
bd update bd-XXXX.1 --status done
bd update bd-XXXX.2 --status done

# Orchestrator checks completion
bd show bd-XXXX  # All sub-tasks done → parent is completable
```

**Phase D: Cross-Repo Coordination (Days 30+)**

Each business line repo gets its own `.beads/beads.jsonl`. The orchestrator queries multiple repos:

```bash
bd --dir /path/to/omniport-hh ready
bd --dir /path/to/lagerlink ready
```

### Beads + MCP Agent Mail Integration

Source: `orchestration-platforms/mcp-agent-mail.md` | Bead IDs as thread identifiers in agent-to-agent messages:

```
# Agent Mail message referencing a Beads task
{
  "thread": "bd-a1b2",
  "from": "worker-1",
  "to": "orchestrator",
  "body": "PR #42 ready for review. Blocked on bd-c3d4 (API endpoint not deployed)."
}
```

### What Beads Does NOT Replace

| Concern | Keep Using | Why |
|---------|-----------|-----|
| Phase tracking | `orchestrator-tmux-state.json` | Beads tracks WHAT to do; state JSON tracks WHERE we are in the loop |
| Telemetry | `_bmad/telemetry/*.jsonl` | Beads is task-level; telemetry is event-level |
| Devlog | `_bmad/devlog.md` | Human-readable narrative; Beads is structured data |
| Failure domains | `_bmad/failure-domains.jsonl` | Pattern-level learning; Beads is task-level |

---

## 6. Visibility Stack

### The Problem

"Headless" multi-agent systems are undebuggable in production. When an agent goes off-rails at 3 AM, you need to see what it did, why, and what to fix — without having been watching live.

### Visibility at Each Scale Tier

**Tier 1: Solo Developer (1-3 agents) — NOW**

| Layer | Tool | What You See |
|-------|------|-------------|
| Terminal | tmux with `remain-on-exit` | Live worker output in split panes |
| Token costs | ccusage (`npx ccusage daily`) | Daily/monthly token usage and cost estimates |
| Task state | Beads (`bd ready`, `bd show`) | What's done, what's blocked, what's next |
| Event stream | `_bmad/telemetry/YYYY-MM-DD.jsonl` | Every tool call, phase transition, error |
| Failure patterns | `_bmad/failure-domains.jsonl` | Recurring errors and their fixes |
| Session narrative | `_bmad/devlog.md` | Human-readable session summaries |
| Worker output | `tmux capture-pane -t <name> -p -S -50` | Last 50 lines of any worker |

**3 KPIs to baseline NOW** (from `reference/observability-trust-kpis.md`):
1. **Rework Rate**: PRs requiring >1 review cycle / total PRs
2. **Human Reversal Rate**: PRs reverted by human within 24h (<5% target)
3. **Cost per Merged PR**: ccusage cost / PRs merged per billing window

**Tier 2: Small Team (4-6 agents) — Days 15-60**

Add to Tier 1:

| Layer | Tool | What You See |
|-------|------|-------------|
| HTTP API | dmux REST + SSE | Programmatic pane creation, streaming status updates |
| LLM tracing | Langfuse (self-hosted) | Full trace trees per agent session, cost attribution |
| PR analytics | CodeRabbit + Graphite | Issue density per PR, merge queue position |
| Remote access | Discord/Telegram channels | Mobile monitoring and intervention |

**Tier 3: Production (6+ agents, overnight runs) — Days 60+**

Add to Tier 2:

| Layer | Tool | What You See |
|-------|------|-------------|
| Metrics | Grafana + Prometheus | Time-series dashboards: throughput, error rates, latency |
| Error tracking | Sentry | Production runtime errors with AI root cause (Seer) |
| Audit trail | Langfuse + OpenTelemetry | Full distributed traces across agent interactions |
| Model routing | LiteLLM | Cost-per-model visibility, automatic fallback routing |

### The Observability Triplet (Per Agent)

Every agent, at every tier, produces three artifacts (from `agent-harnesses/pi/pi-side-agents.md`):

```
agent-name/
  status.json     # Current state: working | blocked | help | done | error
  events.jsonl    # Append-only event stream: tool calls, errors, phase changes
  log.md          # Human-readable narrative of what happened and why
```

---

## 7. Quality Gate Pipeline

### The Complete Deterministic Chain

Derived from `reference/deterministic-llm-boundary.md`, `ADOPTABLE-PATTERNS.md` section 3, and Huntley's Back Pressure Hierarchy (`practitioners/geoffrey-huntley.md`):

```
Code Generation (Worker)
  │
  ▼
Stage 1: SAFETY (deterministic, pre-execution)
  ├─ DCG blocks destructive commands (git push --force, rm -rf, npm publish)
  ├─ Semgrep MCP inline SAST during generation
  └─ Path boundary checks (no writes outside project dir)
  │
  ▼
Stage 2: CORRECTNESS (deterministic, pre-PR)
  ├─ TypeScript strict mode / compiler errors
  ├─ Test suite (existing tests must pass)
  ├─ New tests for new behavior (TDD: red before green)
  ├─ Linter (ESLint/Biome, zero warnings policy)
  └─ Build succeeds
  │
  ▼
Stage 3: QUALITY (deterministic + LLM, pre-merge)
  ├─ Desloppify agent code quality scan
  ├─ PreCompletionChecklist verification
  ├─ E2E gate: agent-browser snapshot + functional verification
  ├─ Property-based tests (fast-check, written by reviewer, not author)
  └─ CodeRabbit automated review
  │
  ▼
Stage 4: REVIEW (LLM + deterministic, merge decision)
  ├─ Orchestrator review cycle (max 3 rounds)
  ├─ Risk matrix gate (auto-ship / light review / manual / hard block)
  ├─ Regression test added for the feature
  └─ Confidence score threshold
  │
  ▼
Stage 5: MERGE (deterministic)
  ├─ CI passes (all stages above)
  ├─ Graphite merge queue (sequenced, no conflicts)
  ├─ Auto-merge or human approval (based on risk level)
  └─ Post-merge E2E smoke test
  │
  ▼
Stage 6: RECORD (deterministic)
  ├─ Devlog entry
  ├─ Beads task status update (bd update --status done)
  ├─ Failure domain log (if any issues encountered)
  └─ ccusage cost attribution
```

### Gate Enforcement Points

| Gate | Enforcement Mechanism | Bypass Allowed? |
|------|----------------------|-----------------|
| DCG | Claude Code PreToolUse hook (binary) | Never |
| Tests pass | Exit code check (deterministic) | Never |
| Lint clean | Exit code check (deterministic) | Never |
| E2E pass | agent-browser snapshot comparison | Never for UI changes |
| Review cycle | Orchestrator prompt + max 3 rounds | After 3 rounds: escalate to human |
| Risk gate | Risk matrix lookup (deterministic) | Human override only |

### Incident Cross-Reference

Every gate in this pipeline maps to a past incident it would have prevented:

| Gate | Prevents | Incident |
|------|----------|----------|
| TDD enforcement | Regressions from untested code | INC-014, L-INC-014 |
| E2E gate | UI changes shipped without visual verification | INC-014 |
| DCG | Destructive git/shell commands | INC-007 |
| Type checking | Zod/TS schema drift | L-INC-002 |
| Semgrep | XSS in markdown rendering | L-INC-007 |
| Property testing | N+1 queries, pagination bugs | L-INC-009, L-INC-011 |
| agent-browser | Chrome DevTools MCP instability | L-INC-013 |

---

## 8. Practitioner Patterns We Should Adopt

### From Geoffrey Huntley (Overnight Autonomy Maximizer)

Source: `practitioners/geoffrey-huntley.md`; `articles/2025-07/ralph-wiggum-agent-loop.md`; `articles/2026-01/everything-is-a-ralph-loop.md`

1. **Back Pressure Hierarchy**: Type system > Tests > Linters > Build > E2E > Git history. Each layer applies direct corrective pressure to the generative loop. **Adopt**: enforce this ordering in every worker prompt.

2. **"On the loop, not in the loop"**: Define risk matrix. Auto-ship low-risk. Manual gate high-risk. Human reviews only what needs human judgment. **Adopt**: the risk-based shipping gates from pattern #18.

3. **Specs replace prompts**: The spec IS the source of truth. If the agent builds wrong, the spec is wrong, not the agent. **Adopt**: every issue must have acceptance criteria before a worker starts.

4. **"If it's in the gutter, start fresh"**: Don't salvage polluted contexts. Kill and restart. **Adopt**: one-task-per-context discipline, max 3 retries then fresh spawn.

5. **Ralph Loop for overnight**: `while :; do cat PROMPT.md | claude-code; done`. Simple, durable, restartable. **Adopt**: our v3 orchestrator loop is already this pattern — formalize it.

### From Steve Yegge (Factory Operator)

Source: `practitioners/steve-yegge.md`; `agent-memory/beads.md`; `orchestration-platforms/gas-town.md`

6. **Beads as agent-git**: Persistent work tracking that survives session restarts. `bd ready` for automatic work discovery. **Adopt**: Phase A-D integration plan above.

7. **GUPP Principle (Gas Town Unified Prompt Protocol)**: Every agent gets the same structured prompt format with role, constraints, tools, and task. No ad-hoc prompting. **Adopt**: standardize worker prompt template.

8. **Mayor/Polecat hierarchy**: One coordinator (Mayor) dispatches to multiple executors (Polecats). Coordinator never writes code. **Adopt**: already our architecture — validates it.

### From Elvis Sun (Voice-First Delegator)

Source: `practitioners/elvis-sun.md`; `reference/top-practitioner-workflows.md`

9. **Context separation is THE master pattern**: Business context and code context NEVER share a context window. Customer data never enters a coding agent. Code never enters a business agent. **Adopt**: enforce via separate CLAUDE.md files per business line, separate repos, separate worktrees.

10. **94 commits/day at $190/mo**: Proof that Claude Max + orchestration produces 10-50x throughput vs manual coding. **Adopt**: track our commits/day as a North Star metric via ccusage + git log.

### From IndyDevDan (Spec-First Architect)

Source: `practitioners/indydevdan.md`; `pi-orchestrator/_bmad/research/indydevdan-patterns.md`

11. **"Observability before scale"**: Invest in tracing tool calls, task handoffs, lifecycle events BEFORE adding more agents. **Adopt**: failure-domains.jsonl + telemetry JSONL + ccusage BEFORE scaling to 6 agents.

12. **"Shell scripts don't hallucinate"**: Deterministic monitoring only. Never trust an LLM to report its own status. Read tmux output, check PID liveness, parse exit codes. **Adopt**: ZFC principle from Overstory.

### From steipete (Chaos-Engineering Pragmatist)

Source: `practitioners/steipete.md`; `reference/top-practitioner-workflows.md`

13. **Work on main branch**: For solo developer, branch-per-feature is overhead. Ship direct to main with good tests. **Adopt**: ONLY for low-risk auto-ship tier. High-risk changes still get branches + PRs.

14. **Screenshots are 50% of prompts**: Visual context is worth 1000 words of text description. **Adopt**: E2E screenshots as mandatory review artifact (already in our E2E gate).

---

## 9. What NOT to Adopt

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoid | Source | What To Do Instead |
|--------------|-----------|--------|-------------------|
| **LLM-driven routing** | Non-deterministic. Wrong routing wastes all downstream work. DeepMind showed 17.2x error amplification | `reference/deterministic-llm-boundary.md` | Deterministic state machine routing |
| **LLM drift detection** | Expensive ($0.02/check), over-engineered when timer-based detection catches 95% of stalls | `pi-orchestrator/_bmad/research/SYNTHESIS.md` Q1 | Progressive escalation with time-gating |
| **SQLite for orchestrator state** | Over-engineered for single-writer scenario. We have ONE writer. | `pi-orchestrator/_bmad/research/SYNTHESIS.md` Q2 | Keep JSON files with ZFC reconciliation |
| **FUSE overlay isolation** | Requires macOS FUSE kernel extension, Rust build dependency, fragile on macOS updates | `agent-harnesses/pi/oh-my-pi.md` | Git worktrees (proven, zero dependencies) |
| **Conversation-centric frameworks** (CrewAI, AutoGen) | LLM-heavy role-play paradigm. Opposite of deterministic routing. Python-only. | `orchestration-platforms/crew-ai.md`, `orchestration-platforms/autogen.md` | tmux + prompt engineering |
| **Shared mutable state** | Race conditions, stale reads, merge conflicts | Every incident involving state corruption | File-per-concern, append-only JSONL, Beads hash IDs |
| **More than 6 parallel agents** | Coordination overhead scales at exponent 1.724 (DeepMind). 8 agents = 3.3x coordination cost of 4 agents | `reference/master-blueprint.md` | 2-3 agents for most work; 6 max for cleanup/tests |
| **Agent self-assessment** | "The same agent writes both code AND tests — of course the tests pass" | `ADOPTABLE-PATTERNS.md` section 3.6 | Separate reviewer/tester agent with property-based tests |
| **Full Pi orchestrator migration** | Abandoned after 2 days. 10x failure surface for zero additional capability. 8 documented incidents. | `ADOPTABLE-PATTERNS.md` section 1 | Stay on tmux + Claude Code + prompts |
| **Overnight runs without channels** | No way to intervene if something goes catastrophically wrong at 3 AM | `ADOPTABLE-PATTERNS.md` section 2.1 | Discord/Telegram channels for mobile monitoring |

### Tools Explicitly Rejected

| Tool | Stars | Why Skip | Source |
|------|-------|----------|--------|
| **LangGraph** | 15K+ | Python/LangChain lock-in. Graph-based validation is useful; implementation is not | `orchestration-platforms/langgraph.md` |
| **Swarms** | 25K+ | Python-only, fragile, LLM-heavy routing | `orchestration-platforms/swarms.md` |
| **Dify** | 131K | GUI-first LLM app builder, different problem domain | `orchestration-platforms/dify.md` |
| **n8n** | 178K | Webhook/resilience patterns useful but not multi-agent native | `orchestration-platforms/n8n.md` |
| **BridgeMCP** | N/A | Proprietary cloud SaaS, DSGVO incompatible | `orchestration-platforms/bridgemcp.md` |
| **Gas Town** (full adoption) | N/A | 189K LOC Go codebase. Study patterns (Beads, GUPP), don't adopt the system | `orchestration-platforms/gas-town.md` |
| **claude-sneakpeek** | 1,063 | Binary patching of `tengu_brass_pebble` statsig gate. Will break on any Claude update | `agent-harnesses/claude-sneakpeek.md` |

### The "Shiny Object" Rule

From `reference/master-blueprint.md`, Governing Principle #7:

> **"Build only what you have needed in the last 30 days."** Not frontier research. Not what might be useful. What you actually needed and did not have.

Before adopting ANY tool from this catalogue, ask:
1. Did we hit a problem in the last 30 days that this tool solves?
2. Can we solve it with a prompt change or 20 lines of bash instead?
3. Does the tool add a new dependency that could fail?

If the answer to #1 is "no" or #2 is "yes", skip it.

---

## 10. Risk Assessment

### Risk 1: Beads Version Instability (MEDIUM)

**What could go wrong:** Beads is v0.59.0, rapidly iterating, solo-maintained. Breaking changes could corrupt `.beads/beads.jsonl` or change CLI semantics.

**Mitigation:** Pin version. Keep `orchestrator-tmux-state.json` running in parallel during Phase A-B. Beads data is in git — can always `git checkout` to recover. Run `bd init --stealth` for minimal footprint.

**Source:** `agent-memory/beads.md` (maturity: "Early, rapidly iterating")

### Risk 2: Context Window Exhaustion in Long Sessions (HIGH)

**What could go wrong:** Orchestrator runs for 4+ hours, context fills to 95%, compaction loses critical state, agent makes wrong decisions post-compaction.

**Mitigation:** 5-stage compaction thresholds (pattern #20). Pre-compaction memory flush to state files (`orchestrator-handoff.sh`). One-task-per-context discipline means workers never accumulate unbounded context. Artifact index survives compaction.

**Source:** `ADOPTABLE-PATTERNS.md` section 3.15; `agent-harnesses/opendev.md`

### Risk 3: Quality Gate Overhead Slowing Throughput (MEDIUM)

**What could go wrong:** 6-stage quality pipeline adds 10-15 minutes per PR. At 5 PRs/day, that's 1-1.25 hours of gate time. Could reduce throughput by 20-30%.

**Mitigation:** Risk-based gates. Auto-ship for low-risk changes (skip stages 3-4). Light review for medium-risk. Full pipeline only for high-risk. Most PRs should auto-ship or get light review.

**Source:** `ADOPTABLE-PATTERNS.md` section 3.12; `posts/2026-03/geoffreyhuntley-embedded-software-factory-rad-is-back.md`

### Risk 4: Agent Coordination Overhead at 4+ Workers (HIGH)

**What could go wrong:** DeepMind research shows coordination overhead at exponent 1.724. Doubling from 3 to 6 agents increases coordination cost by 3.3x, not 2x. Merge conflicts, stale branches, duplicate work.

**Mitigation:** Max 3 agents for feature work. 6 agents only for independent cleanup/test tasks. Beads atomic claiming (`bd update --claim`) prevents duplicate work. Graphite merge queue (pattern #24) at 4+ agents. Worktree isolation eliminates file conflicts.

**Source:** `reference/master-blueprint.md` (Principle 4); `reference/deterministic-llm-boundary.md`

### Risk 5: Overnight Autonomous Runs Going Off-Rails (HIGH)

**What could go wrong:** AUTO_MODE=ENABLED, no human watching. Agent enters infinite loop, merges broken code, corrupts production database, exceeds Claude Max billing window.

**Mitigation:** Hard bounds on everything: max 6 PRs per overnight session, max 30 min per worker, max 3 review cycles per PR. DCG blocks destructive commands. Discord/Telegram channels for alerting. Circuit breaker: if 2 consecutive PRs fail review, stop and alert. Budget cap via ccusage monitoring.

**Source:** `reference/deterministic-llm-boundary.md` (Principle 3: "Every loop has hard bounds"); `ADOPTABLE-PATTERNS.md` section 2.1

### Risk 6: Tool Dependency Chain Fragility (LOW)

**What could go wrong:** ccusage, Beads, agent-browser, Semgrep — each adds a dependency that could break, update incompatibly, or get abandoned.

**Mitigation:** Every tool is optional and additive. The orchestrator works without any of them (v3 proves this). Beads data is in git. ccusage reads local files. agent-browser has Chrome DevTools MCP as fallback. Semgrep is optional quality gate. No tool is load-bearing for core orchestration.

**Source:** `reference/master-blueprint.md` (Principle 7: "Build only what you needed in the last 30 days")

### Risk 7: DSGVO/BSI Compliance for Government Projects (MEDIUM)

**What could go wrong:** Government client discovers that AI agents process sensitive data, context windows contain PII, or observability tools send data to external services.

**Mitigation:** Context separation is non-negotiable (business brain never sees code, code brain never sees customer data). Langfuse self-hosted (no data leaves the machine). ccusage reads local files only. All state files are in git (auditable). EU AI Act Art. 50 transparency requirements met via telemetry JSONL + devlog.

**Source:** `reference/master-blueprint.md` (Business Line 1: "Government project context must never touch other business line data"); `reference/legal-compliance-framework.md`

---

## Appendix A: Source Index

All 344 catalogue entries are indexed at:
- **Main index:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/INDEX.md`
- **Adoptable patterns backlog:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/ADOPTABLE-PATTERNS.md`
- **Prior synthesis (Pi-era):** `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/_bmad/research/SYNTHESIS.md`
- **IndyDevDan deep-dive:** `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/_bmad/research/indydevdan-patterns.md`
- **Pi ecosystem deep-dive:** `/Users/buraksmac/Desktop/code2/orchestrator/pi-orchestrator/_bmad/research/pi-ecosystem-phase2.md`
- **Master blueprint:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/reference/master-blueprint.md`
- **Deterministic-LLM boundary:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/reference/deterministic-llm-boundary.md`
- **Top practitioner workflows:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/reference/top-practitioner-workflows.md`
- **Timeline view:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/TIMELINE.md`
- **Interactive UI:** `/Users/buraksmac/Desktop/code2/orchestrator/research/catalogue/catalogue-explorer.html`

## Appendix B: The 3 Foundational Principles

These override everything else. From `ADOPTABLE-PATTERNS.md` section 3:

1. **Back Pressure Hierarchy** (Huntley): Type System > Tests > Linters > Build > E2E > Git History. Each layer applies corrective pressure. More layers = more autonomy you can safely grant.

2. **Specs as Source of Truth** (Huntley): Specifications replace prompts as the primary control surface. If the agent builds wrong, the spec is wrong.

3. **70/30 Deterministic-LLM Boundary** (Stripe/DeepMind/Praetorian/OpenAI): 70% of the system is deterministic engineering; 30% is LLM-powered. The LLM generates; deterministic code decides what runs, what blocks, what retries, what escalates.

## Appendix C: The Quick-Start Checklist

**Right now, today, in 2 hours:**

- [ ] `npx ccusage@latest` — see your actual token costs
- [ ] Add to ALL worker prompts: `"First run the existing tests. Then write a failing test for the new behavior. Only then implement."`
- [ ] Add to ALL worker prompts: `"Before creating the PR, verify: (1) all tests pass, (2) no lint errors, (3) git status is clean, (4) branch is up to date with main."`
- [ ] Add `tmux set-option -t "$PANE" remain-on-exit on` to worker spawn
- [ ] Add defensive `q` before every `tmux send-keys` in orchestrator
- [ ] Create `_bmad/failure-domains.jsonl` (empty file, append-only)
- [ ] Install DCG: `claude hook install dcg`
- [ ] `go install github.com/steveyegge/beads/cmd/bd@latest && bd init`

**Cost of these changes: $0. Time: 2 hours. Expected impact: 30-50% reduction in rework rate.**

---

*End of synthesis. 344 entries analyzed. 30 patterns ranked. 7 practitioners distilled. Zero hand-waving.*
