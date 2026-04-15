# The Harness Convergence Wave — 2026-04-11 Ingest Synthesis

> **Sixteen catalogue entries ingested 2026-04-11 across articles, posts, talks, harnesses, and an orchestration platform — read together they describe a single architectural moment: every serious lab and every serious open-source contributor converged on the same general-harness shape in the eight weeks since AIE Europe.**

| Field | Value |
|-------|-------|
| Synthesis author | L-Thread Research Librarian (synthesis pass) |
| Synthesis date | 2026-04-11 |
| Wave window | 2026-03-27 to 2026-04-11 (dominant dates 2026-04-01 to 2026-04-11) |
| Entries analyzed | 16 (7 articles + 3 posts + 1 talk + 4 harnesses + 1 orchestration platform) |
| X-activity scans | 8 practitioners (ctatedev, doodlestein, jennyzhangzt, mitchellh, noahzweben, omarsar0, scobleizer, trq212) |
| Companion sidecars | `_bmad/ingest-discoveries/*.json` (wave-tagged) |
| Word count target | ~4,200 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Wave Manifest](#2-wave-manifest)
3. [Thematic Analysis — The Great Convergence](#3-thematic-analysis--the-great-convergence)
4. [Contradictions and Design Tensions](#4-contradictions-and-design-tensions)
5. [Validation Hits](#5-validation-hits)
6. [New Adoptable Patterns (Top 5)](#6-new-adoptable-patterns-top-5)
7. [Cross-References Map](#7-cross-references-map)
8. [Strategic Implications for Burak's Stack](#8-strategic-implications-for-buraks-stack)
9. [Action Items](#9-action-items)
10. [Next Ingest Candidates](#10-next-ingest-candidates)

---

## 1. Executive Summary

If the AIE Europe 2026 synthesis was the conference that named "harness engineering" as a discipline, the 2026-04-11 wave is the week the rest of the industry shipped it. Sixteen catalogue entries — released within eleven days of each other — describe four different labs (OpenAI, Google, Microsoft, GitHub), two open-source meta-harnesses (AutoAgent, AutoKernel), a viral TypeScript multi-agent library (Jack Chen's open-multi-agent), Anthropic's Claude Code Monitor tool, OpenClaw's ACPX session client, and Karpathy's wiki-as-programming-language pattern deployed independently three times (his own gist, Elvis Saravia's diagram, Hermes-Wiki). Nichochar named the moment in one sentence: "very different companies have started moving towards the same product shape." The shape is a **general harness — a looping model with tools, plus self-improvement via code and context edits, plus capability-bounded isolation, plus wiki-as-memory** — and the evidence in this wave is that the harness is no longer contested. It is the industry's shared primitive.

For us the implication is clean: the L-Thread v3 architecture (tmux + worktrees + Claude Opus 4.6 + prompt-driven orchestrator) is now the open-source consensus position rather than a personal preference. The work shifts from inventing the pattern to porting the best versions of each substrate — Symphony's phase enum, ACPX's NDJSON session protocol, Noah Zweben's event-driven Monitor tool, AutoAgent's meta-harness loop, AutoKernel's five-stage correctness gate, Karpathy's Raw/Wiki/Schema split applied to our own research catalogue. This document maps which pieces go where, surfaces three live contradictions the wave created inside our architecture (persistent vs ephemeral workspaces, deterministic gates vs iterative pivot, Opus-only vs model empathy), and prioritizes ten action items we can take in the next two weeks without client-work disruption. The wave's most important single sentence is still Nichochar's — "The prize is enterprise knowledge work" — because it reframes the commoditization risk: the harness layer is converging, but the domain layer (German KMU compliance, EUPL/opencode.de, DSGVO-safe deployment) is where the moat has to live.

---

## 2. Wave Manifest

| # | Type | Entry | Relevance | One-line takeaway |
|---|------|-------|-----------|-------------------|
| 1 | Article | [GitHub Copilot Applied Science](../articles/2026-04/github-copilot-agent-driven-development-applied-science.md) | 9/10 | GitHub's Copilot research team picked Claude Opus 4.6 as their internal agent model; "blame process, not agents"; `/plan` -> `/autopilot` -> review -> human four-stage loop maps 1:1 to our orchestrator steps |
| 2 | Article | [AutoAgent (MarkTechPost)](../articles/2026-04/marktechpost-autoagent-self-optimizing-harness.md) | 10/10 | First open-source meta-harness; 3-file architecture (`agent.py` + `program.md` + `tasks/`); 10M-token diagnostic context per iteration; "model empathy" — same-model pairing beats cross-model |
| 3 | Article | [AutoKernel (MarkTechPost)](../articles/2026-04/marktechpost-autokernel-gpu-kernel-agent.md) | 9/10 | Ralph Wiggum loop transplanted into GPU kernel optimization; 5-stage correctness gate; Amdahl's-law target ranking; beats torch.compile on 12/16 H100 configs |
| 4 | Article | [Microsoft Aspire 13.2](../articles/2026-04/microsoft-aspire-agentic-dev-aspirations.md) | 9/10 | First Big-Tech platform product launch framed explicitly as harness engineering; "Markdown is not the answer, force AI through deterministic gates"; `--isolated` mode for parallel-agent port-conflict avoidance |
| 5 | Article | [Google Scion (InfoQ)](../articles/2026-04/infoq-google-scion-agent-testbed.md) | 9/10 | Google open-sources "hypervisor for agents"; "isolation over constraints" philosophy; AgentHarness adapter model; tmux+worktree architecture validated at Google scale |
| 6 | Article | [AgentCraft Side Panel Docs](../articles/2026-04/agentcraft-side-panel-docs.md) | 7/10 | Reference UX for per-agent IDE: Chat/Git/Files tabs, color-coded context bar (green/yellow/red at 70/90), plan-mode full-screen takeover, yellow-glow + Y/N permission prompts |
| 7 | Article | [x-tweet-fetcher CLI](../articles/2026-04/x-tweet-fetcher-python-script.md) | 9/10 | Login-free 3-backend Python CLI (FxTwitter -> Nitter -> Camofox); incremental `--monitor` mode with cron-standard exit codes (0/1/2); directly unblocks our X virtualized-DOM ingest pain |
| 8 | Post | [Karpathy LLM Wiki Knowledge Bases](../posts/2026-04/karpathy-llm-wiki-knowledge-bases.md) | 10/10 | "Markdown is the programming language of the AI era"; 3-layer (Raw/Wiki/Schema) + 3-op (Ingest/Query/Lint) pattern; RAG rediscovers, wiki compounds |
| 9 | Post | [omarsar0 LLM KB Diagram](../posts/2026-04/omarsar0-llm-knowledge-base-diagram.md) | 9/10 | Elvis's one-image distillation of Karpathy's pattern; 2,535 bookmarks / 1,643 likes (1.54:1 = strong practitioner save-for-later) |
| 10 | Post | [nichochar "The Great Convergence"](../posts/2026-04/nichochar-the-great-convergence.md) | 9/10 | "Very different companies have started moving towards the same product shape"; Linear, OpenAI, Anthropic, Notion, Google, Microsoft, Meta all converge on general harness for enterprise knowledge work |
| 11 | Talk | [Cody Seibert — 2 AI Coding Strategies](../talks/2026-04/web-dev-cody-2-ai-coding-strategies.md) | 6/10 | Single uncertainty axis (well-known vs uncertain requirements); spike-then-harden pivot (stash prototype, restart in plan mode); parallel agent windows during play-testing |
| 12 | Harness | [OpenAI Symphony](../agent-harnesses/openai-symphony.md) | 9/10 | SPEC-first tracker-driven orchestrator daemon; run-attempt phase enum; persistent per-issue workspaces (NOT worktrees); stateless tracker-as-truth; WORKFLOW.md hot reload |
| 13 | Harness | [Hermes-Wiki](../agent-harnesses/hermes-wiki.md) | 8/10 | Line-by-line source-verified documentation of Hermes Agent; 36 concept pages + SCHEMA.md governance + append-only log.md; Karpathy's wiki pattern deployed as skill pack |
| 14 | Harness | [openclaw/acpx](../agent-harnesses/openclaw-acpx.md) | 9/10 | Headless JSON-RPC session client for ACP; replaces `tmux capture-pane` polling with NDJSON events; queue-aware prompts; session soft-close; capability-scoped `--approve-reads`/`--approve-all` flags |
| 15 | Harness | [Jack Chen — open-multi-agent](../agent-harnesses/jackchen-open-multi-agent.md) | 6/10 | Viral TypeScript library; 5,596 stars in 11 days; `runTeam(goal)` one-call auto-decomposition; 3 runtime deps; multi-provider heterogeneity in one team |
| 16 | Orchestration | [KarpathyTalk](../orchestration-platforms/karpathytalk.md) | 6/10 | Karpathy's second agent-infrastructure experiment (after AgentHub); Go + SQLite + single binary + goldmark markdown; dual-surface pattern (HTML/MD/JSON per URL) |

---

## 3. Thematic Analysis — The Great Convergence

Nichochar's post is the framing thesis for the wave. Six weeks ago his claim — "everyone is building the same agentic product" — would have read as an overreach. The 2026-04-11 wave is the evidence that makes it load-bearing. Four independent converging tracks appear in the entries.

### 3.1 The general harness is the winning architecture

Symphony, Scion, Aspire, and Jack Chen's open-multi-agent all ship in the same week from four different vendors with four different stacks, and they describe the same three primitives in nearly identical language.

**OpenAI Symphony** formalizes the primitive as a SPEC.md contract: one long-running daemon polls a tracker (Linear), dispatches coding agents into per-issue workspaces, and reconciles runs against tracker state. Phase enum, strict WORKFLOW.md reload, stateless orchestrator, exponential retry backoff, session_id = thread_id + turn_id. The Elixir reference implementation is a tell — BEAM supervision trees are ideal for a long-lived polling daemon with many concurrent supervised agents. The adoption instruction is literally "point your coding agent at SPEC.md and have it build Symphony for your stack."

**Google Scion** (released the same week) describes the same shape as a "hypervisor for agents." Every agent gets its own container, its own git worktree, its own credential set, and runs in `--yolo` (unfettered) mode while isolation is enforced *externally* at the container, network policy, and worker layer. The AgentHarness adapter abstraction manages lifecycle, auth, and config per harness (Claude Code, Gemini CLI, Codex, OpenCode), which is the exact adapter pattern Overstory and pi-side-agents already use in our catalogue. Google's phrase — **"isolation over constraints"** — is our operating philosophy in four words.

**Microsoft Aspire 13.2** is the Big-Tech platform-vendor version of the same thesis delivered in .NET vocabulary. Maddy Montaquila opens the post with Burke Holland's "Markdown is not the answer to your AI problems — we need to force AI through deterministic gates," which is no longer community folklore — it is now the framing of a Microsoft product launch. Aspire's TypeScript/C# AppHost replaces YAML, the compiler becomes the verification gate, `aspire start` consolidates process orchestration with `--isolated` mode for parallel-agent port-conflict avoidance, and `aspire init` ships MCP + skills by default. Three independent instantiations (OpenAI, Google, Microsoft) of the same general-harness architecture within one eleven-day window.

**Jack Chen's open-multi-agent** is the bottom-up community version. A solo developer shipped a TypeScript library on 2026-03-31 and hit 5,596 stars in eleven days. The API surface — `createTeam()` / `runTeam(goal)` — is the most aggressively minimal version of the pattern: one call, auto-decomposed DAG, parallel task execution, three runtime dependencies. Multi-provider heterogeneity (Claude for reasoning, Gemma4 for filtering, GPT for synthesis) is first-class. It runs in-process (not per-worker tmux), which makes it incompatible with L-Thread but directly adoptable for Phase-3 embedded business-line agents. The viral velocity is itself signal: the TypeScript community was starving for this primitive.

**Thematic synthesis.** Same week, same shape, four different ecosystems. The differences are useful mostly as an architectural palette:

| Dimension | Symphony | Scion | Aspire | open-multi-agent |
|-----------|----------|-------|--------|-------------------|
| Lang | Elixir | Go (GCP) | C#/TS | TypeScript |
| Isolation | Persistent per-issue workspace | Container + worktree + creds | `--isolated` port-scoped | None (in-process) |
| Concurrency model | Daemon-polled tracker | K8s + named profiles | `aspire start` unified | `AgentPool.runParallel()` |
| Source of truth | Linear tracker | Local DB | WORKFLOW.md | Coordinator LLM |
| Tooling | Agent spawns subprocess | Agent containers | OTel via CLI | Built-in tools |
| Adoption slope | SPEC.md self-build | `kubectl apply` | `aspire init` | `npm install` |

None of these is architecturally novel compared to L-Thread — but each of them is more formalized on one axis than we are, and the convergence itself is the valuable signal.

### 3.2 Self-engineering harnesses

AutoAgent (Kevin Gu, ThirdLayer YC W25) and AutoKernel (RightNow AI) are both "Ralph Wiggum loop" applications — write candidate, benchmark, keep if better, revert if worse, repeat — aimed at entirely different substrates. AutoAgent targets the harness itself: a meta-agent edits its own `agent.py` overnight against benchmark tasks. AutoKernel targets GPU kernels: a meta-agent writes Triton or CUDA C++ kernels and benchmarks them against torch.compile. Both are open-source, both run overnight on one machine, both descend directly from Karpathy's `autoresearch` (his 630-line agent that discovers LLM training optimizations in a keep/revert loop). Both cite the Stanford/MIT Meta-Harness paper as their intellectual parent.

The shared architecture is striking when you read them side-by-side:

- **Both use a 3-file contract**: AutoAgent has `agent.py` (mutable harness) + `program.md` (human-authored directive in natural language) + `tasks/` (scoring substrate). AutoKernel has `kernel.py` (mutable candidate) + 909-line `program.md` (6-tier optimization playbook) + `results.tsv` (append-only benchmark log).
- **Both use git as a state machine**: keep = commit, revert = `git reset`. State transitions are atomic filesystem operations, not database rows.
- **Both prioritize correctness before speed**: AutoAgent runs agent-authored unit tests and forced verification loops; AutoKernel runs a five-stage correctness harness (smoke -> shape sweep -> adversarial numerical stability -> determinism via 3 bitwise-identical runs -> non-power-of-two edge cases) before a single speedup is recorded.
- **Both discovered the same emergent strategies** that human harness practitioners (Lopopolo, HumanLayer CRISPY, Anthropic Harness Design) had independently converged on: spot-checking via isolated tasks, budgeted correction turns, progressive disclosure (dump large data to files rather than context), task-specific subagent orchestration, pre-execution environment snapshots.

Kevin Gu's most important finding is the one this team should internalize: **"model empathy"** — a Claude meta-agent optimizing a Claude task agent diagnoses failure modes more accurately than cross-model pairings because shared architecture gives it implicit understanding of its own failure patterns. This directly validates our "Opus only" memory rule (even when it costs more), and it creates a principled reason to resist cost-optimization pressure that routes cheaper models to leaf tasks when the leaf tasks feed back into orchestrator-level decisions.

AutoKernel's second-most-important finding is Amdahl's-law target selection. Rather than grade kernels in isolation (like KernelBench does), AutoKernel profiles a whole PyTorch model and ranks optimization targets by runtime share. A 1.5x speedup on a 60%-of-runtime kernel = 1.25x end-to-end; the same speedup on a 5% kernel = 1.03x. Effort allocation follows the math, not vibes. This is directly portable as a pattern for our own orchestrator: profile the orchestrator loop, rank targets by time share, optimize where the numbers say to optimize.

### 3.3 Markdown is the programming language of the AI era

Karpathy's LLM Wiki Knowledge Bases gist is the wave's philosophical anchor. Three-layer architecture (`raw/` immutable human-curated sources + `wiki/` LLM-owned knowledge layer + `schema` co-evolved structure), three operations (Ingest / Query / Lint), and a categorical rejection of RAG: "The wiki is a persistent, compounding artifact. The cross-references are already there. The contradictions have already been flagged. The synthesis already reflects everything you've read." RAG rediscovers knowledge every query; the wiki pattern compiles it once and keeps it maintained.

The pattern appears three times in this wave:

1. **Karpathy's gist itself** (2026-04-03) — the 3,500-word canonical reference.
2. **Elvis Saravia's diagram** (omarsar0, 2026-04-03) — a one-image distillation that's been bookmarked 2,535 times with a 1.54:1 bookmark-to-like ratio (unusually high practitioner save-for-later signal). The distillation is designed to be *fed directly to an agent as a build spec*: "Feed this to your favorite agent and get your own LLM knowledge base going."
3. **Hermes-Wiki** (cclank, 2026-04-08) — independently arrived-at deployment of the same pattern as a 36-page Obsidian vault reverse-engineering Nous Research's Hermes Agent. The SCHEMA.md enforces a 5-type page ontology (entity | concept | comparison | query | summary), an 11-tag taxonomy, a 200-line page-split threshold, and a mandatory append-only log.md audit. **Critically, the wiki is dual-use**: human-readable in Obsidian AND agent-consumable via `skills.config.wiki.path: ~/Hermes-Wiki`. One markdown repo, two readers, same substrate.

This closes a loop for us. Our `research/catalogue/` already follows this architecture — we just never formalized it as the pattern Karpathy named. The three operations map directly: our `/ingest-*` commands are Ingest, the `Query` operation is implicit in how we reference catalogue entries during orchestrator sessions, and `Lint` is the one we have not formalized. Adding a `/catalogue-lint` skill that runs weekly and flags orphan pages, stale claims, missing cross-references, and contradictions is a one-day build and closes the third leg of Karpathy's triangle.

KarpathyTalk reinforces the same philosophy from a second angle. Karpathy's second agent-infrastructure experiment (after AgentHub) is a Twitter-like developer community built as a Go single binary + SQLite + goldmark where **every content surface has three parallel representations**: HTML for humans, Markdown (`.md` suffix) for humans and agents, JSON (`/api/*`) for programmatic consumption. Content negotiation happens by URL suffix, not HTTP `Accept` header, because agents are easier to point at `.md` URLs than to configure content negotiation. We already do this with our JSON sidecars in `_bmad/ingest-discoveries/` paired with Markdown entries in `research/catalogue/`. Karpathy independently arrived at the same approach. This is confirmation, not novelty — which is itself the signal.

### 3.4 Session primitives, not process primitives

The wave's most operationally important entry is **openclaw/acpx**. Peter Steinberger's OpenClaw org shipped a headless TypeScript CLI that speaks the Agent-Client Protocol (ACP, from Zed) — one JSON-RPC session client that drives Codex, Claude Code, Gemini, Pi, OpenClaw, Cursor, Copilot, Droid, and ten other coding agents identically. ACPX replaces terminal scraping with structured NDJSON events: `stream/turn`, `tool_call`, `thinking`, `diff`, `session/set_mode`, `session/set_config_option`. Sessions persist under `~/.acpx/sessions/` keyed by `(agent, cwd, name)`. Prompts queue when one is in flight. Dead agent processes trigger transparent session reload with fallback recovery. Soft-close preserves conversation history across process death. Cancel is a cooperative `session/cancel` RPC, not SIGKILL.

This is the first time every operational pain point in L-Thread v3 has been addressed by one tool. Our `.claude/agents/orchestrator.md` rules mandate "NIEMALS bash sleep for waiting — poll with capture-pane on intervals." That rule is correct but fragile (ANSI escape sequences, scrollback truncation, tmux status line pollution). ACPX's `--format json` emits one deterministic JSON event per turn. Pipe into `jq -c 'select(.type == "turn_end")'` and polling disappears as a category. Combine with **Noah Zweben's Monitor tool** (shipped 2026-04-09, 1.08M views, 5,100 bookmarks — the highest-signal x-activity post in the wave) and polling dies at the Anthropic product layer too: Monitor lets Claude create background scripts that *wake the agent up* when something of interest happens, replacing the polling idiom entirely inside Claude Code itself.

Taken together the two tools retire the entire `capture-pane` polling discipline that Rule #3 currently mandates. The replacement is event-driven: Monitor for in-process events, ACPX for out-of-process session events, both landing in the orchestrator as structured data instead of scraped strings. For us this is the single highest-ROI change available in the catalogue this month.

---

## 4. Contradictions and Design Tensions

The wave surfaces three contradictions worth reconciling before we ship anything.

### 4.1 Persistent workspaces vs git-worktree-per-attempt

Symphony's deliberate design is the opposite of ours: workspaces persist across retry attempts so the agent resumes warm context. Our L-Thread v3 rule (proven after pi-orchestrator INC-006) is one git worktree per worker, cold-start on every retry to guarantee isolation. Each is right for a different trade-off:

| Dimension | Symphony (persistent workspace) | L-Thread (worktree-per-PR) |
|-----------|-------------------------------|----------------------------|
| Context reuse across attempts | Free | Cold start each retry |
| Parallelism on same issue | One worker per issue | Multiple worktrees possible |
| Merge conflict exposure | Lower (single branch) | Higher (multiple branches) |
| Disk cost per issue | 1x repo | N x repo |
| Disaster recovery | Tracker replay | Git replay |

**Verdict**: keep worktrees as the default for parallel work, but add a `--persistent-workspace` mode for retry-heavy or long-horizon refactor tasks where warm context beats parallelism. Make the switch explicit so we know which pattern is running. Symphony's ban on persistent orchestrator databases ("tracker as source of truth, no DB, restart cost is one poll") is separately correct and we should adopt it: drop `_bmad/orchestrator-tmux-state.json` to cache-only over `gh issue list`.

### 4.2 Deterministic gates vs iterative pivot

Burke Holland's "Markdown is not the answer — force AI through deterministic gates" (quoted at the top of Microsoft Aspire 13.2) is the straight-line industrial framing: compilers as verification gates, OpenTelemetry as agent feedback, YAML out / code in, everything converges to a pass/fail. Cody Seibert's 10-minute video argues the opposite: some tasks live on the uncertain end of the requirements axis and plan mode is fictional until you've prototyped enough to discover the real requirements. His recommended workflow is **spike-then-harden**: prototype with vibes and play-testing, then stash everything and restart in plan mode with the newly-discovered requirements.

These are not actually in conflict. Aspire's framing is right for well-known-requirements work (production features with acceptance criteria); Cody's framing is right for uncertain-requirements work (discovery, prototypes, products-without-shape). The synthesis is to make the *choice of mode* itself a state machine transition in our orchestrator: an uncertainty gate at issue intake routes the work to plan-mode + deterministic gates, or to prototype-mode + spike-then-harden. We do not have that gate today; we treat every issue as if it were well-known. Formalizing the gate as a pre-flight check on the orchestrator loop is low-effort and avoids burning hours running plan mode on tasks where no plan can be written.

### 4.3 Opus-only vs model empathy

Our memory rule ("Only spawn Opus agents — Sonnet gets stuck") is one of Burak's feedback items. AutoAgent's "model empathy" finding reinforces it *and* complicates it: same-model pairing beats cross-model pairing because shared architecture gives the meta-agent implicit understanding of its own failure modes. This validates Opus-only for the meta-level (reviewer, orchestrator) and for the task level simultaneously — but it also creates a tension with cost optimization. If we pair Opus meta-agent with Sonnet leaf agents to save tokens, the meta-agent diagnoses its leaf-agent failures less accurately than it would with Opus-Opus. The implication is that the "mixed model" cost-saving pattern (Opus planner + cheap executor) is actually worse than pure Opus for meta-level optimization loops.

For normal L-Thread operation (orchestrator + worker + reviewer) this is already resolved: we use Opus across the board. For AutoAgent-style meta-optimization of our own orchestrator prompts (which we should consider running against our omniport-hh test suite), the rule becomes explicit: the meta-agent MUST be the same model family as the agent it is optimizing. We cannot save tokens here. This is a "when model empathy applies" footnote rather than a bare policy change, but it should go into `ADOPTABLE-PATTERNS.md` as a named pattern.

---

## 5. Validation Hits

The wave is unusually validating for our current architecture. Four entries match patterns we arrived at independently from a different direction.

**omarsar0 CMU CAID async git-worktree** (existing catalogue entry, cross-referenced in this wave via the omarsar0 diagram post cluster): Carnegie Mellon's coding-agents work describes the exact pattern we settled on after pi-orchestrator INC-006 — async git-worktree isolation for parallel coding agents. Elvis's post surfaces the CMU paper's structured representations work in the same week as the LLM Wiki diagram, so the two converge: structured representations + worktree isolation + wiki-as-memory is the L-Thread v3 recipe, now with academic backing.

**Noah Zweben Monitor tool** (x-activity scan, highest-signal post of the wave): Claude Code's official 2026-04-09 launch of background scripts that wake the agent up on events. Noah Zweben is the Claude Code PM. 1.08M views, 5,100 bookmarks. Anthropic's product framing: "big token saver and great way to move away from polling in the agent loop." This is Anthropic-blessed permission to drop our `capture-pane` polling in favor of event-driven waking — *and* it maps exactly to Vincent Kottsch's AIE Europe thesis that "2025 was token maxing, 2026 is token efficiency." When your architecture and the model vendor's product direction align in the same month, the rule becomes: adopt it now and burn the old path.

**OpenClaw acpx** (wave harness entry): Replaces `--dangerously-skip-permissions` with `--approve-reads` / `--approve-all` / `--deny-all` per-call permission modes, which is the capability-scoped identity layer we've been deferring. Honor Solaz (the author) is the AIE Europe speaker whose ACP-at-OpenClaw talk we already catalogued at 9/10. ACPX is the artifact from that talk. The AIE Europe synthesis flagged Sunil Pai's capability-based sandbox as a 3-6 month roadmap item; ACPX is the 1-day adoption path to the first layer of that architecture (permission-scoped sessions) without touching the sandbox layer. Do this first, then layer Deno capability-bounded worker sandbox on top.

**Honor Solaz / capability-based permissions convergence**: same direction as Matt Pocock's software fundamentals talk, Sunil Pai's Code Mode, and the AgentShield 102-rule scanner. The capability-based-security thesis is now the non-controversial default.

---

## 6. New Adoptable Patterns (Top 5)

Each pattern is formatted to append directly to `ADOPTABLE-PATTERNS.md`.

### Pattern 1 — Event-Driven Agent Loop (replace capture-pane polling)

**Source**: [Noah Zweben Monitor tool](../practitioners/x-activity/noahzweben/2026-04.json) + [openclaw/acpx](../agent-harnesses/openclaw-acpx.md)

**Description**: Replace all `tmux capture-pane -p -S -50` polling in the orchestrator loop with two event sources: (1) Anthropic's Monitor tool for in-process events (file changes, PR status, log errors) that wake the agent inside its own Claude Code session; (2) ACPX `--format json` NDJSON event stream for out-of-process agent lifecycle events (`turn_end`, `tool_call`, `diff`, `session/cancel`). The orchestrator stops polling entirely; it waits on stdin for events. Pairs directly with Vincent Kottsch's 2026 token-efficiency thesis. Removes the fragility of ANSI-escape scraping and eliminates one of Rule #3's worst sub-rules.

**Adoption effort**: 2 days (1 day ACPX integration + 1 day Monitor tool wiring).

**Priority**: **CRITICAL** — highest-ROI change in the catalogue this month.

### Pattern 2 — Run-Attempt Phase Enum (Symphony)

**Source**: [OpenAI Symphony](../agent-harnesses/openai-symphony.md)

**Description**: Replace our ad-hoc status strings (`spawning`, `working`, `blocked`) in `_bmad/orchestrator-tmux-state.json` with Symphony's run-attempt phase enum: `PreparingWorkspace` -> `BuildingPrompt` -> `LaunchingAgentProcess` -> `InitializingSession` -> `StreamingTurn` -> `Finishing` -> `{Succeeded | Failed | TimedOut | Stalled | CanceledByReconciliation}`. Gives us a language for worker state that maps 1:1 to tmux lifecycle events and is aligned with OpenAI's public specification. Enables precise recovery hooks — `/tmux-recovery` can dispatch differently on `Stalled` vs `TimedOut` vs `CanceledByReconciliation`.

**Adoption effort**: 1 day.

**Priority**: **HIGH** — foundational schema change.

### Pattern 3 — ACPX Capability-Scoped Permissions (retire `--dangerously-skip-permissions`)

**Source**: [openclaw/acpx](../agent-harnesses/openclaw-acpx.md) + [AIE Europe synthesis — Sunil Pai Code Mode](../conference-reports/aie-europe-2026-synthesis.md)

**Description**: Replace `claude --dangerously-skip-permissions` with `acpx claude --approve-reads -s <issue-id> --format json` for reviewer workers (read-only) and `acpx claude --approve-all -s <issue-id> --format json` for fixer workers (write allowed). Per-call capability scoping instead of ambient "allow everything." This is the first layer of the capability-based sandbox bet from AIE Europe 2026 and plugs directly into the AgentShield 102-rule scanner's primary attack surface. Does NOT replace the Deno-sandbox ambition — it is the fastest-available intermediate step.

**Adoption effort**: 1 day.

**Priority**: **HIGH** — security + AgentShield-alignment.

### Pattern 4 — AutoAgent 3-File Meta-Harness Architecture

**Source**: [AutoAgent (MarkTechPost)](../articles/2026-04/marktechpost-autoagent-self-optimizing-harness.md) + [AutoKernel (MarkTechPost)](../articles/2026-04/marktechpost-autokernel-gpu-kernel-agent.md)

**Description**: Structure the orchestrator prompt layer as a three-file contract. (1) `agent.md` is the mutable harness (prompts, tools, rules) the orchestrator actually runs. (2) `program.md` is a human-authored, natural-language optimization directive ("minimize human interventions", "maximize E2E pass rate", "never produce slop") that guides meta-level refactoring. (3) `tasks/` is a directory of scorable task definitions (our omniport-hh E2E suite is an obvious candidate). This three-file split makes the harness introspectable and creates a substrate on which AutoAgent-style meta-optimization could actually run against our orchestrator overnight. Adjacent win: forces us to be explicit about what "good orchestrator run" means as a scoring function.

**Adoption effort**: 2-3 days (mostly defining scoring functions for our tasks).

**Priority**: **MEDIUM** — foundational for Phase-3 self-optimization work; can run as a spike.

### Pattern 5 — Spike-then-Harden Pivot Workflow (Cody Seibert)

**Source**: [Cody Seibert — 2 AI Coding Strategies](../talks/2026-04/web-dev-cody-2-ai-coding-strategies.md)

**Description**: Add an explicit **uncertainty gate** at issue intake. If acceptance criteria are well-defined: route to plan-mode + deterministic gates (the current path). If exploratory or uncertain: route to prototype-mode (vibes + parallel agent windows, no plan doc). When the uncertain-mode path discovers the true requirements, the workflow transitions: `UNCERTAIN_PROTOTYPE` -> `DISCOVERED_REQUIREMENTS` -> `DISCARD_PROTOTYPE` -> `PLAN_MODE_RESTART`. Stop treating prototype code as final. "Sometimes you start adding more slop into your code base" (Cody's direct quote); iterative mode is for discovery only. Pairs with Matt Pocock's "bad code is more expensive than ever" thesis.

**Adoption effort**: 1 day (intake gate) + 1 day (state transition + devlog tagging).

**Priority**: **MEDIUM** — addresses a real failure mode in our current single-track flow.

---

## 7. Cross-References Map

| Wave entry | Existing catalogue link(s) | Relationship |
|------------|---------------------------|--------------|
| GitHub Copilot Applied Science | [AIE Europe Lopopolo](../talks/2026-04/aie-europe-2026-ryan-lopopolo-harness-engineering.md), [Everything Claude Code](../agent-harnesses/everything-claude-code.md) | McGoffin is GitHub-internal synthesis of Huntley + Lopopolo |
| AutoAgent | [AIE Europe synthesis](../conference-reports/aie-europe-2026-synthesis.md), [lioronai automate harness engineering](../posts/2026-04/lioronai-automate-harness-engineering.md), [omarsar0 Meta-Harness](../posts/2026-04/omarsar0-meta-harness-stanford-mit.md) | First open-source operationalization of Stanford/MIT Meta-Harness paper |
| AutoKernel | [Superpowers (obra)](../agent-harnesses/superpowers.md), Ralph Wiggum pattern entries | Same loop, systems-engineering substrate |
| Microsoft Aspire 13.2 | [AIE Europe Ubl](../talks/2026-04/aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md), [AgentShield](../code-intelligence/agentshield.md) | First Big-Tech platform-vendor harness-engineering product |
| Google Scion | [Overstory](../agent-harnesses/overstory.md), [Gas Town](../orchestration-platforms/gas-town.md), [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) | Google-scale validation of tmux+worktree+isolated-credentials pattern |
| AgentCraft Side Panel | [AgentCraft homepage](../agent-harnesses/automaker.md) (Automaker cluster), [Broomie](../agent-harnesses/broomie.md) | Reference UX for multi-agent dashboard |
| x-tweet-fetcher | [Akshay Claude folder anatomy](../posts/2026-03/akshay-claude-folder-anatomy.md), [OpenClaw](../orchestration-platforms/openclaw.md), existing x-activity sidecars | Directly unblocks X virtualized-DOM ingest pain |
| Karpathy LLM Wiki | [AgentHub Karpathy](../orchestration-platforms/agenthub-karpathy.md), [Karpathy Idea Files](../posts/2026-04/2026-04-04_karpathy-idea-files-concept.md), [omarsar0 Personal KB](../posts/2026-04/omarsar0-personal-knowledge-base-agents-obsidian.md) | Philosophical anchor for our entire `research/catalogue/` |
| omarsar0 LLM KB Diagram | Same cluster + [dair-ai NLAH](../posts/2026-04/dair-ai-natural-language-agent-harnesses.md) | Visual spec version of Karpathy gist |
| nichochar Great Convergence | [AIE Europe Lopopolo](../talks/2026-04/aie-europe-2026-ryan-lopopolo-harness-engineering.md), [Sunil Pai Code Mode](../talks/2026-04/aie-europe-2026-sunil-pai-code-mode.md) | Market thesis for orchestrator business |
| Cody Seibert | [Automaker](../agent-harnesses/automaker.md), [Matt Pocock fundamentals](../talks/2026-04/aie-europe-2026-matt-pocock-software-fundamentals.md) | Operationalizes plan-vs-vibe decision rule |
| OpenAI Symphony | [Overstory](../agent-harnesses/overstory.md), [Beads Viewer](../agent-harnesses/beads-viewer.md), [Stripe Minions](../orchestration-platforms/stripe-minions.md), [12 Factor Agents](../agent-protocols/12-factor-agents.md) | OpenAI blessing of tracker-driven orchestrator daemon pattern |
| Hermes-Wiki | [Hermes Function Calling](../agent-protocols/hermes-function-calling.md), [Mattshumer memory systems](../posts/2026-04/mattshumer-memory-systems-openclaw-hermes.md), [HermesAgent Workspace Dashboard](../posts/2026-04/outsource-hermesagent-workspace-dashboard.md) | Karpathy's wiki pattern deployed as skill pack |
| openclaw/acpx | [OpenClaw](../orchestration-platforms/openclaw.md), [Ironclaw](../agent-harnesses/ironclaw.md), [AIE Europe Honor Solaz](../talks/2026-04/aie-europe-2026-honor-solaz-acp-openclaw.md), [AIE Europe Steinberger](../talks/2026-04/aie-europe-2026-peter-steinberger-state-of-claw.md) | The talk's artifact; Phase-2 adoption candidate |
| Jack Chen open-multi-agent | [OpenAI Agents SDK](../agent-harnesses/openai-codex.md), [LangGraph](../orchestration-platforms/langgraph.md), [CrewAI](../orchestration-platforms/crew-ai.md), [Swarms](../orchestration-platforms/swarms.md) | Reference pattern for Phase-3 embedded business-line agents |
| KarpathyTalk | [AgentHub Karpathy](../orchestration-platforms/agenthub-karpathy.md), [AGENTS.md](../agent-protocols/agents-md.md), [Karpathy LLM Wiki](../posts/2026-04/karpathy-llm-wiki-knowledge-bases.md) | Go + SQLite + single-binary convergence |

---

## 8. Strategic Implications for Burak's Stack

### L-Thread Orchestrator v3 (tmux mode)

**Port these first, in this order**:
1. ACPX + Monitor tool (Pattern 1) — retire `capture-pane` polling, retire `--dangerously-skip-permissions`, retire all three in one week.
2. Symphony phase enum (Pattern 2) — schema upgrade for `_bmad/orchestrator-tmux-state.json`.
3. Workflow.md governance pattern — lift Symphony's single-file YAML-front-matter + Markdown-body config-plus-prompt into a `WORKFLOW.md` at repo root. Hot reload without restart.
4. Karpathy Lint operation — add `/catalogue-lint` skill that flags orphan pages, stale claims, missing cross-references in `research/catalogue/`. Closes the Ingest/Query/Lint triangle.
5. AutoAgent 3-file architecture — restructure `.claude/agents/orchestrator.md` + `CLAUDE.md` + our prompt library as the three-file contract (`agent.md` + `program.md` + `tasks/`). Even if we never run AutoAgent over it, the discipline clarifies what we're optimizing.

### pi-orchestrator

Pi-orchestrator is the aspirational architecture, not the shipped one. The wave's relevance is what we should *not* reinvent when we eventually reactivate Pi. Symphony's stateless-tracker-as-truth model is the correct disaster recovery posture; drop any in-memory authoritative state. The Hermes-Wiki SCHEMA.md + log.md pair is the governance primitive to adopt for the Pi research catalogue layer. Do NOT reinvent the monitor-polling loop — ACPX + Monitor are the answer.

### OmniPort-HH client work (German conservative buyer framing)

The wave has three entries that are directly quotable in German enterprise pitches:
- **Microsoft Aspire 13.2**: Burke Holland's "deterministic gates" line is now official Microsoft framing. This is exactly the conservative language German CIOs want to hear — "Microsoft agrees: Markdown ist nicht die Antwort." Citable in the Hildesheim slides as industry consensus.
- **Google Scion**: "Hypervisor for agents" framing gives us a Big-Tech-grade reference architecture for tmux+worktree isolation. For KMU pitches where the buyer wants to know "does a hyperscaler do this?", Scion is the answer.
- **Nichochar Great Convergence**: The entire article is a public framing source for "this is not optional — Linear, Notion, OpenAI, Google, Microsoft, Meta are all rebuilding around agents for enterprise knowledge work." Good for the "why now" slide in any Ausschreibung.

Do *not* use the Ralph Wiggum / AutoAgent framing in German pitches — it reads as reckless-cowboy in German enterprise vocabulary even when it's technically correct.

### BuriClaw / CEO agent positioning

Nichochar's "prize is enterprise knowledge work" line reframes the BuriClaw thesis. The harness layer is commoditizing; the moat has to be the domain layer (German KMU compliance, EUPL/opencode.de, DSGVO, conservative enterprise delivery). BuriClaw's positioning should explicitly contrast against the convergence: "Everyone is building the same general harness. We wrap it in German compliance, deliver it as a service, and ship it on hardware the client trusts." The wave gives us the "everyone is building the same thing" half of that contrast for free.

The Karpathy wiki pattern applied to BuriClaw is interesting: the CEO-agent persona can be literally a wiki — `BuriClaw-Wiki/raw/` (client notes, proposals, contracts) + `BuriClaw-Wiki/wiki/` (LLM-curated entity pages per client, opportunity, project) + a `SCHEMA.md` governance layer. This maps 1:1 to the Hermes-Wiki model and is a 1-2 day build on top of the existing `research/catalogue/` infrastructure.

---

## 9. Action Items

Prioritized; Critical/High/Medium. Owner + effort + blocker flag per item.

| # | Priority | Item | Owner | Effort | Blocker? |
|---|----------|------|-------|--------|----------|
| 1 | CRITICAL | Adopt ACPX + Monitor tool — retire `capture-pane` polling in `.claude/agents/orchestrator.md` Rule #3; replace `--dangerously-skip-permissions` with `--approve-reads` / `--approve-all` scoped permissions | claude | 2d | no |
| 2 | HIGH | Adopt Symphony run-attempt phase enum in `_bmad/orchestrator-tmux-state.json`; update `_bmad/orchestrator-tmux-state.template.json` to match | claude | 1d | no |
| 3 | HIGH | Add `/catalogue-lint` skill to close the Ingest/Query/Lint triangle; weekly cron via launchd | claude | 1d | no |
| 4 | HIGH | Port Workflow.md governance pattern from Symphony — single-file YAML-front-matter + Markdown-body config+prompt at repo root; hot reload without restart | claude | 2d | no |
| 5 | HIGH | Run `x-tweet-fetcher --monitor` against our 8 tracked handles on cron; diff results into `_bmad/x-activity/*.json` sidecars; replace manual Chrome ingest | claude | 1d | no |
| 6 | MEDIUM | Restructure orchestrator prompts as AutoAgent 3-file architecture (`agent.md` + `program.md` + `tasks/`); define scoring functions for omniport-hh E2E suite | claude | 3d | needs omniport-hh E2E stable |
| 7 | MEDIUM | Add spike-then-harden pivot as an explicit state transition in orchestrator loop; add uncertainty gate at issue intake | claude | 2d | no |
| 8 | MEDIUM | Run AutoKernel 5-stage correctness gate adaptation as template for E2E gate in `/e2e-screenshots` workflow — staged validation (smoke -> shape sweep -> adversarial -> determinism -> edge cases) | claude | 2d | no |
| 9 | MEDIUM | Add `--persistent-workspace` mode alongside default worktree mode for retry-heavy / long-horizon refactor tasks; explicit flag, not automatic | claude | 2d | no |
| 10 | MEDIUM | Quote Burke Holland "deterministic gates" + Nichochar "Great Convergence" in BuriClaw meta-layer positioning doc; update client-pitch framing library | burak | 0.5d | no |

No roadblocks identified; every item is decoupled and can run in parallel. Item #1 is the single highest-ROI change and should be sequenced first.

---

## 10. Next Ingest Candidates

Top URLs from the discovery sidecars / wave entries that are worth ingesting in the next cycle:

1. **https://arxiv.org/abs/2603.28052** — Stanford/MIT Meta-Harness paper. Scientific backing for AutoAgent's 6x harness-change performance swing claim. Currently only covered via the omarsar0 summary post.
2. **https://github.com/kevinrgu/autoagent** — AutoAgent reference implementation. Tool-catalogue entry needed; MIT license; ~500 lines of Python.
3. **https://github.com/karpathy/autoresearch** — Karpathy's 630-line ancestor of both AutoAgent and AutoKernel. Architectural parent; not yet in catalogue.
4. **https://github.com/GoogleCloudPlatform/scion** — Scion source. AgentHarness adapter abstraction, containerization profile system, and chatroom/memory module interfaces. Tool-catalogue entry needed.
5. **https://github.com/openai/symphony** — Symphony SPEC.md + Elixir reference implementation. Already catalogued as harness entry; the SPEC itself should be ingested as standalone reference doc for phase enum, retry formulas, polling tick sequence.
6. **https://x.com/noahzweben/status/2042332268450963774** — Monitor tool launch post (Noah Zweben, 1.08M views, 5,100 bookmarks). High-signal x-activity post needs a standalone `/ingest-post` entry.
7. **https://x.com/trq212/status/2042671370186973589** — Claude Code `/ultraplan` launch (trq212, 765K views, 4,926 bookmarks). Cloud-based planning handoff from local CLI to web running in plan mode. Maps to our PLAN vs WORKER split.
8. **https://x.com/ctatedev/status/2037599050112160165** — agent-browser dashboard (ctatedev, Mar 27, 93K views, 1,662 bookmarks). Real-time headless browser viewer + session manager — direct parallel to our own dashboard work.
9. **https://x.com/mitchellh/status/2041253090205249584** — libghostty full Kitty Graphics Protocol support. Unicode-placeholder support means tmux-based agentic workflows can render charts/diagrams/screenshots inline. Direct relevance for our cmux + tmux orchestrator.
10. **https://github.com/rvk7895/llm-knowledge-bases** — Claude Code plugin implementing Karpathy's full Ingest/Query/Lint pattern. Reference implementation of `/catalogue-lint` we're about to build.

---

## Key Takeaway

> **The 2026-04-11 wave is the week the "general harness" stopped being a category pitch and became a shipped industry consensus — OpenAI, Google, Microsoft, GitHub, Karpathy, Peter Steinberger, Kevin Gu (ThirdLayer), and a solo TypeScript dev independently converged on the same architecture in eleven days. Our L-Thread v3 is on the right side of the convergence; the work is now porting the best-of-breed substrate (Symphony phase enum + ACPX session protocol + Monitor event loop + Karpathy Lint + AutoAgent 3-file contract) into the orchestrator this month while defending the domain moat (German compliance, EUPL/opencode.de, DSGVO) at the BuriClaw layer where commoditization has not yet landed.**
