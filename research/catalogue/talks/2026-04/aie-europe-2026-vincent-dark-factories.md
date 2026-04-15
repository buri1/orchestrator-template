# Dark Factories — How OpenClaw Ships Faster Than You Can Read the Diff

> **Vincent Kottsch (OpenClaw Core Maintainer, Research Engineer/DevRel at Comet) — AI Engineer Europe 2026, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=10491s |
| Speaker | Vincent Kottsch — OpenClaw core maintainer (one of ~10-15 with day jobs); Research Engineer / DevRel at Comet working in the eval space; 3.5-4 years industry; born London, resident Australia |
| Event | AI Engineer Europe 2026 |
| Location | London |
| Duration | ~18 min |
| Date | 2026-04-09 |
| Topics | dark factories, swim lanes, commit maxing, bart looping, codex sessions, git worktrees, git clones, matrix intuition, agent development environment, skills gym, recursive skills, semantic PR graphing, eval infrastructure, fake slack, token efficiency, agent in the loop, soft skills, openclaw, ralph wiggum loop, great refactor, nvidia, peter steinberger, plugin architecture |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Main Thesis

> "We are in a new industrial revolution for software. Massive commit velocity is not luck, it is not Ralph looping — it is actual engineering work with process, intuition, and orchestration patterns. 2025 was about token maxing. 2026 is about not wasting them."

Vincent's entire talk reframes the "dark factory" metaphor for software: continuous autonomous production lines where the human is a floor manager, not a line worker. The velocity numbers are legit engineering, not stunt hacking — and the industry is already in the same denial phase it was in during the early ChatGPT era.

---

## Speaker Biography

Vincent Kottsch is one of roughly 10-15 core maintainers of **OpenClaw** who still hold day jobs alongside maintainer duties. His day job is at **Comet**, where he works as a Research Engineer / DevRel in the eval space. He has 3.5-4 years of industry experience. He was born in London and now lives in Australia (he jokes about the accent mixup). He is active in the OpenClaw community on the PR / plugin architecture / skills side and has directly collaborated with Peter Steinberger during the March 2026 "Great Refactor" inside NVIDIA's office.

---

## The 11 Talking Points

### 1. Velocity Metrics — "This is going to be the norm everywhere else"

- **OpenClaw peak**: 800 commits/day collective across the maintainer group
- **Vincent's personal peak**: 3,000 commits in a single day (2026-03-15)
- **Sleep tracking**: Commits stop when he sleeps. You can literally reconstruct his sleep schedule from git history.
- **Framing**: This is not an outlier. "This is going to be the norm everywhere else" — a claim that dark-factory-style commit velocity will become a table-stakes expectation for serious open-source maintainers by end of 2026.

### 2. Denial Phase Parallel to the ChatGPT Era

Vincent explicitly compares 2026 autonomous agent usage to 2023 ChatGPT usage:

- Early ChatGPT era: everyone publicly denied using it while using it in secret
- Early autonomous-agents-at-scale era (now): same denial pattern
- **Organizations openly admitting scale use**:
  - **Anthropic** — using agents to write their C compiler
  - **Spotify** — reports of "no hand coding" internal mandate
  - **Steve Yegge** — 50 PRs/day openly
  - **OpenClaw** — the maintainer collective itself, openly
- The point: within a year, this will be the default and the denial will look quaint.

### 3. Commit Maxing vs Intelligent Automation ("Bart Looping")

- Naive approach: Ralph loop for 8-9 hours. Works but is dumb — produces noise-grade commits.
- Better approach: **"Bart Looping"** — an opinionated reward mechanism on top of the loop that steers the agent.
- The model is not starving for tokens; it is starving for **structured context about what is actually happening** in the broader project state.
- Implication: raw loop time is not the bottleneck. Reward shaping and context injection are.

### 4. The Great Refactor (NVIDIA session with Peter Steinberger)

The canonical war story of the talk. In March 2026, Vincent and Peter Steinberger were working together in the NVIDIA office. At 2am they made a call to do a full plugin-architecture refactor of OpenClaw.

- **2,700 commits** executed through the refactor
- **~1M lines changed**
- **82% of the core codebase touched**
- **Outcome**: plugin architecture launched — every provider now owns their own plugin code rather than living in the core
- Vincent's self-critique: *"Was Icarus — did I fly too close to the sun?"*
- **Saving grace**: they were able to verify the refactor because they had previously **overfit AI-generated unit tests** on the old code paths. The tests caught the refactor deltas and made it shippable.
- Lesson: aggressive AI-generated test overfitting, normally an anti-pattern, becomes a load-bearing safety net during agent-driven refactors.

### 5. "My Factory" — Swim Lane Architecture

Vincent's mental model for managing his own autonomous agent fleet:

- **5-10-20 swim lanes** — parallel Codex sessions at any time (5 on calm days, 10-20 during pushes)
- **Lane specialization**:
  - One lane for CI triage/fixes
  - Lanes for individual features
  - Lanes for bugs (split by severity)
  - Lanes for P0/P1 hotfixes
  - Lanes for exploratory/new investigations
- **The real bottleneck**: *"Tokens are NOT the problem — raw compute and brain space are."*
  - Tokens are cheap at scale.
  - The constraint is host-machine compute (disk I/O, file watchers, build caches) plus human working memory (how many parallel threads a brain can actually supervise).
- **Mantra**: *"In harness we trust."* The harness is the factory floor; you trust it to keep the lines running while you float between them.

### 6. Git Worktrees vs Clones — Anti-Pattern Warning

Vincent explicitly warns against the git-worktree pattern he himself adopted and now regrets.

- He scaled up to **70-80 active git worktrees** simultaneously
- **Result**: the worktree count nukes the machine — file watchers, inode pressure, tool caches, build systems collapse
- **Peter Steinberger's alternative**: clone the repo **10 times**, point 10 Codex sessions at the 10 clones
  - Heavier on disk, lighter on everything else
  - No shared-state pathologies (the whole reason worktrees exist)
- **Self-heal requirement**: Vincent had to build custom **Codex session awareness of worktrees** so that sessions self-heal on crash rather than leaving orphaned worktree state
- Direct implication for our orchestrator (which relies on `git worktree` heavily): this scales worse than expected past ~20 parallel workers.

### 7. Matrix Intuition — Reading Reasoning Tokens

The most vivid metaphor of the talk. Vincent describes monitoring 10-20 concurrent agents as being Neo in The Matrix:

> "I can see woman in red dress, guy walking dog."

- He scans reasoning-token streams across multiple sessions in parallel
- He can sense when a session is going off-rails — not from **what** it is doing, but from **how** it is explaining
- **Kill signals**: waffling, over-hedging, not making sense, filler reasoning → **nuke the session**
- **Analogue**: managing humans. A bullshitting employee triggers the same alarm. This is not a new paradigm for anyone who has managed people.

### 8. Agent Development Environment (ADE) + Recursive Skills

Vincent runs his own personal Agent Development Environment:

- **Skills repo**: Vincent's personal `dots/skills` repo on GitHub (partially private)
- **Skills gym**: nicknamed "ager" — a sandboxed environment where candidate skills are evaluated
- **The recursive loop**:
  1. Ask Codex to go through Codex session transcripts
  2. Identify patterns that could become skills
  3. Iterate and improve existing skills
  4. Deploy refined skills back into OpenClaw
- **Automation loop**: he uses **Vercel's skills.sh** to orchestrate the loop
- **Philosophy**: *"Scoping to reuse patterns in agents who are agents"* — the fractal recursion of agents improving the agents that improve the agents.

### 9. PR Management Challenges at 6000+ PR Scale

OpenClaw has 6000+ open PRs. Every new maintainer tries the same thing and fails.

- **Common failure mode**: new maintainers attempt to cluster / tag / organize the backlog. It never works because contributors send their own flavors of PR structure.
- **Vincent's approach**: **semantic graphing + vector embeddings** over the entire PR graph
  - One PR had **106 edges** to other PRs via semantic similarity
  - Reveals hidden duplicates and related-work clusters invisible to label-based triage
- **Triage signal**: *"Pressure on one issue = signal it's big enough to address."* Social pressure (comments, reactions, repeated PRs) is treated as a load-bearing ranking feature.

### 10. Evaluation Infrastructure — Fake Slack

Post-Great-Refactor, Vincent built a dedicated eval infrastructure to verify every provider and channel.

- **"Fake Slack"**: a synthetic messaging environment populated with both real and synthetic LLM actors
- Runs continuous evaluation loops exercising every provider (OpenAI, Anthropic, Mistral, etc.) and every channel (Slack, Discord, CLI, etc.)
- Catches provider regressions and plugin-level bugs before they hit the live user base
- This is Comet eval experience applied to an open-source harness.

### 11. Soft Skills Are the Real Moat — 2025 → 2026 Shift

The closing thesis.

- Common audience question: *"How do you manage 10 agents?"*
- Vincent's counter-question: *"How do you manage 10 staff?"* (audience has no answer)
- His background: managed 30-40 people in airlines and in prior AI teams
- **Claim**: multi-agent management is not a new paradigm. It is classical people management with faster feedback loops.
- **The shift he names explicitly**:
  - **2025 = token maxing** (get as many tokens into as many loops as possible)
  - **2026 = not wasting them — token efficiency — agent in the loop**
- *"Agent in the loop"* deliberately echoes "human in the loop" but inverted: the agent is the steady state, the human is the intermittent quality signal.

---

## Key Quotes

> "In harness we trust."

> "Imagine you're a factory manager and you have a production line blow."

> "This feels a lot like how I would manage people."

> "2025 was about token maxing. 2026 is about not wasting them."

> "Tokens are not the problem — raw compute and brain space are."

> "I can see woman in red dress, guy walking dog."

> "Was Icarus — did I fly too close to the sun?"

> "Pressure on one issue = signal it's big enough to address."

> "Scoping to reuse patterns in agents who are agents."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Direct peer testimony. Vincent is a core OpenClaw maintainer describing exactly the multi-agent orchestration patterns we are building on tmux. Every single talking point maps to a concrete part of our L-Thread architecture: swim lanes = tmux windows, harness trust = our state-machine + hooks, matrix intuition = our roadblock-recovery skill, clones-vs-worktrees = our `git worktree` design decision (which he now regrets at scale). This is the highest-signal-per-minute peer talk we have logged for 2026-04. |
| **Novelty** | 8/10 | The core concepts (swim lanes, recursive skills, agent-in-the-loop) are independently covered in other catalogue entries, but several specific points are genuinely novel to our catalogue: (1) the **70-80 worktree collapse threshold** with the clones-instead-of-worktrees remediation from Peter Steinberger, (2) the **semantic PR graphing with 106-edge clusters** as a triage heuristic, (3) **"Bart Looping"** as a named alternative to Ralph looping, (4) the **overfit-unit-tests-as-refactor-safety-net** pattern, and (5) **"fake Slack"** eval infrastructure for multi-provider regression testing. |
| **Actionable** | 9/10 | Immediately actionable: (1) audit our worktree count cap and add a hard limit <20 with clone-based fallback for scale-out, (2) adopt the 5-10-20 swim-lane sizing target for our tmux window policy, (3) build a reasoning-token waffle detector into our roadblock-recovery loop, (4) add the "pressure on one issue" signal to our GitHub issue ranking, (5) run an eval loop over every provider/model we support (our version of fake Slack), (6) rename/repurpose our "Ralph loop" references to "Bart loop" with explicit reward shaping, (7) commit to the 2026 framing of token efficiency as an OKR, not raw token volume. |

---

## Adoptable Patterns for Orchestrator Research

| # | Pattern | Source | Effort | Impact |
|---|---------|--------|--------|--------|
| 1 | **Swim Lane Architecture (5-10-20 sizing)** — Formally divide tmux windows into labeled swim lanes: CI, features, bugs, P0/P1, exploration. Enforce a 5 (calm) / 10 (normal) / 20 (push) parallelism ceiling. Each lane owns a distinct class of work with its own spawn policy, timeout, and success criteria. Maps directly onto our existing tmux window model with a thin labeling layer. | Vincent (My Factory) | S | High |
| 2 | **Matrix Intuition for Agent Monitoring** — Add a reasoning-token "waffle detector" to our roadblock-recovery skill. Scan capture-pane output for filler reasoning, repeated phrasing, unjustified hedging. Trigger session kill + respawn. Mirrors Vincent's Neo-scanning-the-Matrix pattern and his "bullshitting employee" heuristic from people management. | Vincent (Matrix Intuition) | M | High |
| 3 | **Clone-vs-Worktree Scale Policy** — Hard cap worktree count at ~20 per machine (Vincent hit collapse at 70-80). Beyond that, switch to full clones-per-session à la Peter Steinberger (clone the repo 10x, point 10 Codex sessions at the 10 clones). Build crash-self-heal logic so dead sessions clean up their clone/worktree on respawn. Critical warning for our orchestrator since we already lean on git worktrees. | Vincent + Peter Steinberger | L | Critical |
| 4 | **Recursive Skills Improvement Loop (ADE)** — Point our orchestrator at its own session transcripts (`_bmad/agent-activity.jsonl`, `_bmad/telemetry/*`) nightly. Ask Claude to extract reusable skill patterns, propose skill updates, and deploy candidates to a skills gym ("ager"-equivalent) before promotion into the live orchestrator. Vercel's `skills.sh` is the reference automation. | Vincent (ADE) | M | High |
| 5 | **"Bart Loop" with Opinionated Reward Shaping** — Replace raw Ralph loops with structured loops that inject broader project-state context on every iteration (last PR state, issue backlog delta, recent failures). Reward = forward progress on labeled objectives, not tokens burned. | Vincent (Commit Maxing vs Intelligent Automation) | M | High |
| 6 | **Overfit Unit Tests as Refactor Safety Net** — Before any planned large refactor, generate and deliberately overfit AI-authored unit tests on current code paths. Use them as a change detector during the refactor. Normally an anti-pattern; load-bearing during agent-driven megacommit passes. Vincent credits this as the only reason the Great Refactor shipped. | Vincent (Great Refactor) | S | Medium |
| 7 | **Semantic PR Graphing for Backlog Triage** — Build vector embeddings over every issue and PR. Rank by cluster density and "pressure on one issue" (comment count, reactions, cross-references). Surface high-edge-count nodes as likely real work, not noise. Vincent hit 106 edges on a single PR. | Vincent (PR Management) | L | Medium |
| 8 | **Fake Slack Eval Infrastructure** — Build a synthetic multi-provider eval harness that exercises every provider/model we support on a fixed set of agent scenarios. Run it nightly. Catches provider regressions (Anthropic rate limit changes, OpenAI tool-call schema drift) before they reach production runs. | Vincent (Eval Infrastructure) | L | Medium |
| 9 | **2026 = Token Efficiency, Not Token Maxing** — Strategic reframing. Kill OKRs that track raw token burn. Add OKRs that track commits-per-token, PRs-merged-per-token, and agent-session waste rate. Align with Vincent's explicit 2025→2026 shift. | Vincent (Closing Thesis) | S | High |
| 10 | **Sleep Schedule as Legitimacy Signal** — The fact that Vincent's commit stream literally stops when he sleeps is what proves it is not a botnet. We should preserve similar legibility in our own commit history (clear on/off pauses) as evidence for client trust conversations. | Vincent (Velocity Metrics) | S | Low |

---

## Connection to Other Catalogue Entries

| Related Entry | Connection |
|--------------|-----------|
| [OpenClaw](../../orchestration-platforms/openclaw.md) | Vincent is a core maintainer of OpenClaw; this talk is first-hand insider testimony about the maintainer workflow behind the 271K-star project. |
| [Steipete (Practitioner)](../../practitioners/steipete.md) | Peter Steinberger is Vincent's direct collaborator on the Great Refactor and the source of the clone-vs-worktree counter-pattern. |
| [Extreme Harness Engineering (Lopopolo)](./ryan-lopopolo-extreme-harness-engineering-openai.md) | Lopopolo's OpenAI Symphony experience is the closest parallel: 1M LOC, autonomous PR lifecycle, self-improvement from session logs. Vincent is the open-source / single-maintainer analogue of what Lopopolo describes at OpenAI scale. |
| [AI Engineering as Successor to Web Dev (Malte Ubl)](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md) | Same conference, same day. Ubl cites OpenClaw as the European harness-layer leader; Vincent is the ground-truth account of what building that harness looks like. Read together: Ubl = strategic frame, Vincent = operator diary. |
| [Crashing Out at Anthropic and Getting Pi Pilled (Theo Browne)](./theo-browne-crashing-out-anthropic-pi-pilled.md) | Same conference. Theo's talk covers the OpenClaw ban/DMCA drama; Vincent's talk is the maintainer-side view of operating through that week. |
| [Jensen Huang Panel (NVIDIA GTC 2026)](../2026-03/jensen-huang-panel-nvidia-gtc-2026.md) | Jensen declared OpenClaw the "ChatGPT moment for agents"; Vincent's talk supplies the engineering substance behind that claim. |
| [Context Engineering (Harrison Chase)](../2026-03/harrison-chase-context-engineering-sequoia.md) | Chase's "traces replace code as source of truth" aligns with Vincent's ADE recursive-skills loop (mine the traces, promote patterns back to the harness). |
| [Orchestration > Autonomy (Pawel Huryn)](../../posts/2026-04/pawelhuryn-orchestration-over-autonomy.md) | Vincent's "In harness we trust" + swim-lane architecture is a direct endorsement of orchestration over raw autonomy. |
| [Yegge Gas Town](../../orchestration-platforms/gas-town.md) | Steve Yegge's 50 PRs/day is named by Vincent as one of the organizations openly operating at dark-factory scale. |
| [Ironclaw](../../agent-harnesses/ironclaw.md) | Rust OpenClaw rewrite; Vincent's plugin-architecture refactor is what Ironclaw inherits and extends with WASM sandboxing. |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/openclaw/openclaw/pulls | OpenClaw PR graph — target for replicating Vincent's semantic graphing experiment | `/ingest-tool` follow-up |
| Vincent's `dots/skills` repo (GitHub, partially private) | Reference implementation of the ADE recursive skills loop | Research Librarian follow-up once URL confirmed |
| Vercel `skills.sh` | Automation layer Vincent uses to drive the recursive skills loop | `/ingest-tool` |
| https://www.comet.com/site/ | Comet eval platform (Vincent's day job) — likely source for fake-Slack pattern | `/ingest-tool` |
| OpenClaw Great Refactor PR series (March 2026, ~2,700 commits, plugin architecture launch) | Post-mortem target — how the refactor was staged and verified | `/ingest-article` |
| https://github.com/openai/codex | Codex session lifecycle referenced for clone-based parallelism | `/ingest-tool` follow-up |

---

## Key Numbers

- **~18 min** talk length
- **800 commits/day** OpenClaw collective peak
- **3,000 commits** Vincent's personal peak in one day (2026-03-15)
- **2,700 commits** in the Great Refactor
- **~1M lines changed** in the Great Refactor
- **82%** of the OpenClaw core codebase touched by the Great Refactor
- **70-80 git worktrees** — the count at which the machine collapses
- **10 clones** — Peter Steinberger's alternative scaling pattern
- **5-10-20** swim-lane parallelism envelope
- **6000+** open PRs in OpenClaw
- **106 edges** on one PR in the semantic graph
- **50 PRs/day** Steve Yegge's publicly reported rate
- **10-15** OpenClaw core maintainers with day jobs
- **3.5-4 years** Vincent's industry experience
- **30-40** people Vincent managed in pre-AI airline / AI team roles
