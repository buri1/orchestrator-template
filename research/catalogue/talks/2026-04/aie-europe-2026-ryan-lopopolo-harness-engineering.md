# Harness Engineering: How to Build Software When Humans Steer and Agents Execute

> **Ryan Lopopolo (OpenAI, Member of Technical Staff) — AI Engineer Europe 2026, London, 9 April 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=4008s |
| Speaker | Ryan Lopopolo — Member of Technical Staff, OpenAI (Frontier / Symphony); prev. Snowflake, Brex, Stripe, Citadel; MIT CS&E 2012 |
| Event | AI Engineer Europe 2026, London (hosted by swyx / smol.ai) |
| Duration | ~18 min (conference keynote) |
| Date | 2026-04-09 |
| Related Talk | [Latent Space podcast (75 min) — Extreme Harness Engineering: 1M LOC, 1B toks/day, 0% Human Code or Review](./ryan-lopopolo-extreme-harness-engineering-openai.md) |
| Related Article | [Harness Engineering: Codex in an Agent-Centric World (OpenAI blog)](../../articles/2026-02/harness-engineering-codex-agent-centric-world.md) |
| Topics | harness engineering, prompts-as-lint, QA plans, code legibility, gray-box delegation, non-functional requirements, durable solutions, agents.md, staff engineer scaling, Zod, token economics, persona-oriented docs, GPT 5.2, isomorphic capability |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Speaker Biography

Ryan Lopopolo is a Member of Technical Staff at OpenAI, working on Frontier and Symphony -- OpenAI's agent orchestration and enterprise deployment platforms. He is the author of OpenAI's official "Harness Engineering" blog post and a self-described "token billionaire." For the last nine months, he has built software exclusively with agents and has banned his team from touching code editors directly: all work flows through models. His prior experience includes tech lead roles at Snowflake, Brex (40-person team), Stripe, and Citadel; he holds a CS&E degree from MIT (2012).

This is his keynote at AI Engineer Europe 2026 in London, delivered the week after his extended Latent Space podcast interview on the same topic. The London talk is a compressed, high-density version of the thesis, aimed at conference audiences, and emphasizes the "humans steer, agents execute" framing.

---

## Main Thesis

**Implementation is no longer the scarce resource. Code is free.** The scarce resources are now human time, human/model attention, and the context window. Your new job as an engineer is to make the codebase legible to agents so they can do the full job -- not just the typing, but the full end-to-end engineering work.

Three things converged in late 2025 to make this possible:

1. **Model capability crossed a threshold.** GPT 5.2 made models "isomorphic to humans" in software engineering capability. Anything Lopopolo can do as a senior engineer, the model can now do.
2. **Code became free to produce, refactor, and delete.** Infinitely parallel, infinitely patient.
3. **Every engineer now has 5, 50, or 5000 engineer-equivalents available 24/7.** The question is no longer "can I ship this?" but "do I have the attention and context to direct it?"

---

## Talking Points (All 8)

### 1. Three Things Happened in Late 2025

- **GPT 5.2 crossed the isomorphism line.** Models became isomorphic to humans in software engineering capability. This is not a comparative benchmark -- it is a personal observation from someone who has delegated all his work to agents for 9 months.
- **Code is free to produce.** It is also free to refactor, free to delete, and free to rewrite. "Infinitely parallel, infinitely patient."
- **Capacity explosion.** Each engineer has access to 5, 50, or 5000 engineers worth of capacity, 24/7.

### 2. The New Scarce Resources

The old scarce resource was implementation (how fast can you type, think, and debug). The new scarce resources are:

- **Human time and attention** — you only have so many hours and so much cognitive load budget.
- **Model context window** — the codebase must fit into attention efficiently, or agents thrash.
- **Role shift for engineers** — systems thinking, system design, and delegation are now the primary skills. Implementation is commoditized.

### 3. Code-Is-Cheap Changes the Economics

- **P3 bugs are no longer ignored.** Fire off 4 agents in parallel, pick the best patch, done. The tail of the backlog gets cleared.
- **Internal tools get i18n from day one.** Lopopolo's team has colleagues in Dublin, Paris, Brussels, Zurich, and Munich -- new internal tools ship with localization out of the gate because translation is free.
- **Large refactoring is free.** Migrations always finish. The traditional "half-done migration" anti-pattern disappears because an agent will patiently grind through 500 call sites overnight.
- **Authorship attachment evaporates.** "If I wrote the code myself, I have strong feelings about how it runs. If I didn't, I don't." Lopopolo has zero investment in authorship experience -- only in outcomes.

### 4. Make Codebases Legible to Agents

The codebase is now an interface for agents, not for humans reading it line by line. Four principles:

- **Structure native to agents.** Organize files, modules, and entry points so agents can navigate without human-oriented tacit knowledge.
- **Respect scarce context.** Every file read costs tokens. Small files, clear boundaries, no sprawl.
- **Make tokens predictable.** Make things the same. The more uniform the code, the less attention is needed for each new piece. Agents pattern-match.
- **Persona-oriented documentation.** ADRs, historical tickets, onboarding docs for "the backend agent" or "the frontend agent" -- not for a hypothetical human new hire.

### 5. Non-Functional Requirements Must Be Encoded in Writing

There are ~500 little decisions required to do a single patch well: naming conventions, error handling style, logging format, retry policy, testing depth, file size limits, comment style, import ordering, and on and on. Models have seen trillions of lines of every possible choice in training data. Without explicit guidance, they will pick *some* defensible choice -- but not necessarily yours.

- **You must specify your choices in writing.** Lint rules, docs, code review agents, agents.md files.
- **Explicit trumps implicit.** "You can simply say 'do not produce slop. Don't accept slop.' You won't get slop in your codebase." This is not a joke -- the instruction literally works because the model can tell what slop looks like and will avoid it if asked.

### 6. Build Durable Solutions to Classes of Failures

Stop remediating individual failures. Eliminate entire failure classes.

- **Example: network code without retry/timeout.** Instead of fixing one flaky fetch, write a lint rule that requires retry + timeout wrapping *every* fetch in the codebase. Then let an agent migrate every existing call site.
- **"Once and for all."** This works because code is free to migrate. Pre-2025, eliminating a failure class across a 1M LOC codebase was a quarter-long project. Now it is an overnight agent run.
- **The net effect:** your codebase monotonically improves. Every class of bug becomes impossible rather than rare.

### 7. Prompts Are Everywhere

Prompts are no longer a thing you put in a chat window. They live throughout the codebase and CI system:

- **agents.md files** — the project-level constitution for agents.
- **Powers / rules / skills files** — domain- and task-specific guidance.
- **Lint error messages** — rewrite them to tell the agent *exactly how to fix* the issue, not just what went wrong.
- **Review agents that comment on PRs** — automated reviewers that enforce non-functional requirements and post inline comments in the agent's own language.
- **Tests about the source code** — e.g., a test that asserts all files are <350 lines for context efficiency. The test file itself is a prompt about how the codebase should be organized.
- **Meta-prompting.** "I use cookbooks to generate skills to write prompts to write prompts." Prompt generation is recursive.

### 8. Gray-Box Delegation via QA Plans

The hardest part of delegating to agents is trust: how do you know the work is actually done? Lopopolo's answer is gray-box delegation via QA plans.

- **Document what a good QA plan looks like once.** A product-minded engineer writes the template and the quality bar.
- **Review agents assert every user-facing change has a QA plan.** No QA plan, no merge.
- **The QA plan specifies media attachments to prove work done.** Screenshots, screen recordings, before/after diffs, log excerpts. The agent must produce evidence, not assertions.
- **Effect:** "I trust the output more, need to shoulder surf less, remove myself from loop even more." Trust compounds. Delegation scales.

---

## Key Quotes

> "Every one of you is a staff engineer. You have as many team members as you can possibly drive concurrently and have tokens to support."

> "Zod is type load-bearing infrastructure for our AI future."

> "The models crave tokens. We can operationalize our codebase to give them tokens."

> "Just go build things. Do not hesitate to remove yourselves from the loop."

> "You can simply say 'do not produce slop. Don't accept slop.' You won't get slop in your codebase."

> "If I wrote the code myself, I have strong feelings about how it runs. If I didn't, I don't."

> "I use cookbooks to generate skills to write prompts to write prompts."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Direct hit on our tmux orchestrator thesis. We build multi-agent orchestrators with Claude Code, spawn workers as tmux windows, and delegate all development work. Lopopolo's patterns -- prompts-as-lint, QA plans, code legibility, gray-box delegation, non-functional requirements as lint rules -- are *exactly* what our orchestrator needs to enforce across worker output. His "humans steer, agents execute" framing is our 4 Absolute Rules in three words. |
| **Novelty** | 8/10 | The Latent Space podcast already covered the core thesis. What is new here: (1) the explicit "humans steer, agents execute" framing, (2) the "slop" prompt technique, (3) the gray-box QA plan pattern as the trust-scaling mechanism, (4) the concrete i18n-from-day-one and P3-in-parallel economic examples, (5) the "code is free" framing of refactoring migrations, (6) the "persona-oriented documentation" angle, (7) the prompts-everywhere enumeration including lint messages and test files. The 18-minute conference format forces density: every minute carries a directly adoptable idea. |
| **Actionable** | 10/10 | Every talking point maps to a concrete orchestrator change. See the adoptable patterns section below. |

---

## Adoptable Patterns for Orchestrator Research

These map directly to changes we should make in our tmux orchestrator and its worker agents.

### 1. Prompts-as-Lint (Encode NFRs in Lint Rules)

- **Today:** our orchestrator relies on worker agents reading `CLAUDE.md` and `.claude/agents/orchestrator.md` for conventions.
- **Adopt:** encode recurring agent mistakes as ESLint / ruff / gofmt / shellcheck custom rules with *instructional error messages*. When a worker gets a lint failure, the message itself should be a prompt: "Wrap this fetch in a retry helper from `lib/net/retry.ts`. Example: `retry(() => fetch(url))`."
- **Orchestrator hook:** add a pre-PR lint pass; if lint fails, the reviewer agent is spawned with the lint output as the prompt body.

### 2. QA Plan Gate (Gray-Box Delegation)

- **Today:** our orchestrator enforces Chrome DevTools MCP E2E tests as the done gate (Absolute Rule 2).
- **Adopt:** formalize the QA plan as a required artifact in every worker PR. The PR description must include a QA plan section with: (a) what was changed, (b) how to test it, (c) attached media (screenshots/recordings). A review agent asserts the QA plan exists and is non-empty before the orchestrator runs E2E.
- **Orchestrator hook:** add `QA_PLAN_CHECK` as a phase between `WAIT_FOR_PR` and `REVIEW-FIX LOOP`. No QA plan = auto-spawn fixer with "add QA plan" prompt.

### 3. Persona-Oriented Documentation

- **Today:** `CLAUDE.md` is a single document aimed at "Claude Code" generically.
- **Adopt:** split into persona-oriented docs: `CLAUDE-orchestrator.md`, `CLAUDE-worker-frontend.md`, `CLAUDE-worker-backend.md`, `CLAUDE-reviewer.md`. Each worker spawn reads only its persona doc -- saves context, reduces attention budget, and lets us encode role-specific non-functional requirements.
- **Orchestrator hook:** update `run-tmux.sh` and worker spawn prompts to inject the correct persona doc per role.

### 4. Durable Solutions to Failure Classes

- **Today:** our orchestrator has a 3-cycle review-fix loop with ad-hoc fixes per failure.
- **Adopt:** when the same failure pattern appears across 3+ worker sessions, spawn a "harness improvement" agent whose job is to add a lint rule, test, or documentation change that *prevents the class*. Record these in a `_bmad/harness-improvements.md` log.
- **Orchestrator hook:** pattern-match on `devlog.md` entries; when the same error surfaces repeatedly, queue a harness improvement task.

### 5. Tests About the Source Code (Structural Invariants)

- **Today:** we run unit/E2E tests on application behavior.
- **Adopt:** add structural tests that assert context-efficiency invariants: files <350 lines, no module exports >20 symbols, no folder depth >4, every file has a header comment with 1-line purpose. These tests are prompts about how the codebase should look.
- **Orchestrator hook:** add `STRUCTURAL_CHECK` as a CI step; failing structural tests trigger auto-refactor worker.

### 6. Anti-Slop Instruction

- **Today:** our worker prompts are polite and structured.
- **Adopt:** literally add "Do not produce slop. Do not accept slop." to the orchestrator and worker system prompts. Lopopolo claims this works because the model has a strong learned notion of what slop is.
- **Orchestrator hook:** add to `.claude/agents/orchestrator.md` and `.claude/commands/orchestrator.md`.

### 7. Parallel-Agents-for-P3s

- **Today:** we have a single worker lane per issue.
- **Adopt:** for P3 and P4 issues (or for ambiguous design choices), spawn N=4 worker agents in parallel on isolated git worktrees, then spawn a reviewer agent that picks the best patch. This only works because code is cheap -- we throw away 3 of 4 branches.
- **Orchestrator hook:** add `PARALLEL_SPAWN` mode for low-stakes issues; requires git worktree support (we already have this per MEMORY.md).

### 8. Remove Yourself from the Loop, Aggressively

- **Today:** AUTO_MODE already enforces no-user-input (Absolute Rule 4).
- **Adopt:** make the orchestrator's mission statement explicitly "remove human from loop" and add a metric: time-between-human-interventions. Track it in `devlog.md` and treat regressions as bugs in the harness.
- **Orchestrator hook:** add `human_interventions_count` to `orchestrator-tmux-state.json`.

---

## Comparison to the Latent Space Podcast Version

Both this talk and the [Latent Space podcast from April 7](./ryan-lopopolo-extreme-harness-engineering-openai.md) cover Lopopolo's core harness engineering thesis, but they serve different purposes and emphasize different aspects.

| Dimension | Latent Space Podcast (April 7) | AI Engineer Europe Keynote (April 9) |
|-----------|--------------------------------|--------------------------------------|
| **Format** | 75-min conversational interview with swyx + Alessio | 18-min conference keynote to live audience |
| **Audience** | Podcast listeners, AI engineering practitioners | AI Engineer Europe conference, London practitioners |
| **Density** | Slower, with detours into Symphony / Elixir / Codex history | Highly compressed; every minute carries an adoptable idea |
| **Core framing** | "Zero human code, zero human review at 1M LOC scale" | "Humans steer, agents execute" |
| **Central metrics** | 1M+ LOC, 1,500 PRs, 3-7 engineers, >1B tokens/day, sub-60s build loop, 3-10x engineer-equivalent scaling | Less number-heavy; focuses on the economic framing of "code is free" |
| **Technical depth** | Deep: Symphony (Elixir/OTP), ghost libraries, spec-driven distribution, CLI token efficiency, 7 Agent Legibility Metrics, session log distillation loop | Shallow but broad: 8 talking points covering the full methodology |
| **New material** | Symphony architecture, spec-driven distribution, session log self-improvement loop, sub-60s build loop discipline | "Humans steer, agents execute" framing, anti-slop prompt, QA plan gray-box pattern, persona-oriented docs, "prompts everywhere" enumeration (lint messages, test files), i18n-from-day-one and P3-in-parallel economic examples |
| **Debate context** | Sits at center of Big Model vs Big Harness debate (extensive in podcast follow-up) | Not mentioned; keynote stays on-thesis |
| **Quotable lines** | "Agents aren't hard; the Harness is hard." / "It's borderline negligent if you aren't using >1B tokens a day." | "Every one of you is a staff engineer." / "Do not produce slop. Don't accept slop." / "Just go build things." |

**Recommendation:** read both. The podcast gives depth and background; the keynote gives crisp adoptable patterns. For our orchestrator work, the keynote is arguably more directly actionable because its 8-point structure maps cleanly to concrete harness changes. The podcast remains the authoritative source for the Symphony architecture and the session log self-improvement loop.

**Shared thesis that remains stable across both:** the model is the easy part; the harness is the product. Every engineering hour should go into making the codebase legible to agents, encoding non-functional requirements in writing, and removing humans from the loop.

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Zod | "Type load-bearing infrastructure for our AI future" — runtime validation as the contract agents can rely on | No -- standard tooling, worth noting |
| agents.md | Project-level constitution file for agents | Referenced in multiple entries (cmux, Cursor, Claude Code) |
| Codex (OpenAI) | The underlying agent Lopopolo and his team use exclusively | Referenced in multiple entries |
| GPT 5.2 | "Crossed the isomorphism line" in software engineering capability | Referenced in multiple entries |
| ESLint / custom lint tooling | Vehicle for encoding non-functional requirements as instructional error messages | No -- standard tooling |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://openai.com/index/harness-engineering/ | OpenAI's official harness engineering manifesto by Lopopolo | Already catalogued as `articles/2026-02/harness-engineering-codex-agent-centric-world.md` |
| https://www.latent.space/p/harness-eng | Latent Space podcast with full transcript | Already catalogued |
| https://www.ai.engineer/europe | AI Engineer Europe 2026 conference page (other talks from the same event) | Practitioner tracking / conference series |

---

## Action Items

- [ ] Add "Do not produce slop. Do not accept slop." to `.claude/agents/orchestrator.md` and worker spawn prompts.
- [ ] Formalize QA plan as required PR artifact; add `QA_PLAN_CHECK` phase to the orchestrator loop.
- [ ] Split `CLAUDE.md` into persona-oriented docs per worker role.
- [ ] Encode recurring worker mistakes as custom lint rules with instructional error messages.
- [ ] Add structural tests (file size, folder depth, export count) as context-efficiency invariants.
- [ ] Implement `PARALLEL_SPAWN` mode for P3/P4 issues on isolated git worktrees.
- [ ] Track `human_interventions_count` in `orchestrator-tmux-state.json` as a regression metric.
- [ ] Add "humans steer, agents execute" as a one-line mission statement at the top of the orchestrator persona file.
- [ ] Audit `lint-errors` corpus in devlog for patterns repeating 3+ times; spawn harness-improvement agent per pattern.
