# Extreme Harness Engineering: 1M LOC, 1B toks/day, 0% Human Code or Review

> **Ryan Lopopolo (OpenAI Frontier & Symphony) — Latent Space Podcast, April 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=CeOXx-XTYek |
| Speaker | Ryan Lopopolo — Product Exploration Lead, OpenAI Frontier (prev. Snowflake Tech Lead, Brex Group Tech Lead 40-person team, Stripe Tech Lead, Citadel; MIT CS&E 2012) |
| Hosts | swyx (Shawn Wang) — Latent Space co-host, founder of smol.ai & AI Engineer conference; Alessio Fanelli — Latent Space co-host, investor at Decibel |
| Channel | Latent Space (@LatentSpacePod) |
| Duration | ~75 min (podcast interview) |
| Date | 2026-04-07 |
| Transcript | https://www.latent.space/p/harness-eng |
| Related | https://openai.com/index/harness-engineering/ (OpenAI blog post by Lopopolo) |
| Topics | harness engineering, agent-first development, zero human code, autonomous PR lifecycle, Symphony orchestration, Elixir, ghost libraries, spec-driven software, skill distillation, observability-first design, build system discipline, token economics, dark factory, Codex agents, context engineering, agent legibility |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **"Agents aren't hard; the Harness is hard"** — The defining insight of the entire talk. Building the structure, guardrails, documentation, automated checks, and feedback loops that enable agents to operate reliably IS the engineering challenge. The model is the easy part; the harness is the product.

2. **Zero human-written code at 1M+ LOC scale is achievable today** — Lopopolo's team built and shipped an internal beta product over 5 months with every line of code (application logic, tests, CI config, docs, observability, internal tooling) written by Codex. 3 engineers initially, scaling to 7, averaging 3.5 PRs per engineer per day across ~1,500 total PRs.

3. **Human attention is the bottleneck, not model capability** — As models improved through GPT 5.1 to 5.4, the real constraint shifted from token availability to synchronous human review. The response: build systems that let agents review, fix, and merge autonomously, with humans sampling post-merge rather than blocking.

4. **Sub-60-second build loop is non-negotiable** — The team maintained a one-minute inner loop ceiling, aggressively refactoring build systems (make -> Bazel -> Turbo -> NX) whenever they approached the limit. This forced architectural decisions that benefited agent productivity.

5. **Observability replaces scaffolding** — Rather than placing agents in predefined scaffolds, give them access to observability stacks (traces, metrics, logs) and let reasoning models choose how to proceed. This fundamentally differs from earlier rule-based agent frameworks.

6. **Ghost libraries distribute software as specs, not source** — Symphony is distributed as a high-fidelity specification that agents can reproduce locally, rather than as shared source code. This enables knowledge transfer without traditional code sharing or dependency management.

7. **Skill distillation creates self-improving loops** — The team points Codex at its own session logs to learn how to use tools better. They collect session logs for the entire team into blob storage and run agent loops daily to identify systemic improvement opportunities.

8. **>1B tokens/day is the operational baseline** — Lopopolo calls it borderline "negligent" to use less, equating to roughly $2-3K/day in token spend. This frames agent engineering as a throughput game, not a cost-minimization game.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | This is the single most relevant talk in the catalogue for our orchestrator. Lopopolo's team independently arrived at almost identical patterns: autonomous PR lifecycle, build-system discipline, observability-first design, agents handling review+merge+CI, human sampling post-merge. The ghost library / spec-driven distribution concept directly maps to our CLAUDE.md + agent prompt approach. The Symphony orchestrator (Elixir-based process supervision) validates our tmux process supervision model. The skill distillation loop (agent analyzing its own session logs) is immediately adoptable. The 1-minute build loop ceiling is a concrete operational metric we should enforce. |
| **Actionable** | 9/10 | Immediately actionable: (1) enforce sub-60s build loop, (2) implement session log analysis for self-improvement, (3) adopt the 7 Agent Legibility Metrics as a repo audit checklist, (4) shift from pre-merge human review to post-merge sampling, (5) encode team knowledge into lint rules rather than docs, (6) track tokens/day as a productivity KPI. The Symphony open-source repo (github.com/openai/symphony) provides reference implementation patterns. |

---

## Summary

Ryan Lopopolo, Product Exploration Lead at OpenAI Frontier with deep infrastructure experience (Snowflake, Brex, Stripe, Citadel, MIT), joins swyx and Alessio on Latent Space to detail the most extreme agent-first software development experiment publicly documented. His central claim: over five months, a team of 3-7 engineers built a >1M LOC internal beta product with zero lines of manually-written code, zero human code review before merge, and ~1,500 PRs merged autonomously.

**The Zero-Code Constraint.** Lopopolo imposed a self-constraint: he wouldn't write code himself. If the goal is making agents deployable to enterprises, the team should do everything agents will eventually do. After 6-7 months working with Codex, he found the models and harnesses "isomorphic to me in capability." Early Codex Mini limitations actually drove better task decomposition and tooling, creating a virtuous cycle.

**Three Development Phases.** The talk maps the evolution: (1) autocomplete/ghost text, (2) pair programming in IDEs, (3) agent delegation where engineers manage multiple agents across large workflows. Phase 3 is the current frontier and requires fundamentally different engineering.

**Human Attention as Bottleneck.** As model capability improved across GPT 5.1 through 5.4, the constraint shifted from tokens to synchronous human review. Lopopolo's response: build systems that let agents review, fix, and merge autonomously. Humans review post-merge via statistical sampling rather than blocking deployment.

**Build System Discipline.** The team maintained a strict one-minute inner loop ceiling. When builds approached 60 seconds, they aggressively refactored (make -> Bazel -> Turbo -> NX). This forced clean architectural decisions (separation of concerns, isolated components) that benefited agent productivity -- agents work within limited context windows and benefit from modular structure.

**Observability-First Design.** Instead of predefined scaffolds, agents get access to full observability stacks (traces, metrics, logs) and reasoning models decide how to proceed. This is a fundamental departure from the rule-based agent framework paradigm.

**Skills, Specs, and Guardrails.** Engineers encode non-functional requirements into: markdown documentation, quality score tables, custom linting rules (ESLint), reliability documentation, and code review agent policies. When Codex repeatedly created duplicate helper functions, they deployed a lint rule banning the function from appearing anywhere except its official location. Knowledge consolidates into the codebase itself, not tribal knowledge in Slack.

**Autonomous PR Workflow.** Agents handle the complete PR lifecycle: authoring, responding to code review feedback, resolving merge conflicts, waiting for CI, fixing flakes, and merging. This removes humans from the critical path.

**Ghost Libraries and Spec Distribution.** Symphony (the orchestration layer, built in Elixir by Alex Kotliarskyi) is distributed as a high-fidelity specification rather than shared source code. Agents can reproduce complex systems from detailed specs, enabling knowledge transfer without traditional dependency management. Medium-complexity libraries (2K-5K LOC) can be reimplemented locally, reducing external maintenance burden.

**Symphony Orchestration.** Built in Elixir specifically for its process supervision capabilities (GenServers, supervisors). It spawns agents per task, supervises execution, and escalates only when human judgment is needed. The Erlang/OTP model of process supervision maps naturally to agent orchestration.

**Skill Distillation and Self-Improvement.** The team points Codex at its own session logs and asks "how can you use the tool better?" They collect session logs across the entire team into blob storage and run agent loops over them daily to identify systemic improvements. This creates compound learning.

**CLI Design and Token Efficiency.** Structured command outputs for token efficiency; suppress passing tests (only show failures); design tools for text consumption, not human readability. "The models fundamentally crave text. My job is funneling text between agents."

**Agent Legibility Metrics.** Seven dimensions for evaluating repo readiness: (1) bootstrap self-sufficiency, (2) task entry points (build/test/lint/run), (3) validation harness, (4) linting and formatting, (5) codebase map, (6) documentation structure, (7) decision records.

**Productivity Scaling.** Team throughput scaled from ~0.25 engineer-equivalents per person initially to 3-10 engineer-equivalents per person, demonstrating compound leverage as encoded expertise multiplied across the entire agent fleet.

**Current Model Gaps.** Zero-to-one ideation (translating design mocks to playable prototypes) and complex structural refactoring still require human steering. Both gaps are shrinking with each model release.

**Enterprise Vision (Frontier).** The platform aims to deploy "highly observable, safe, controlled, identifiable agents" across enterprises by integrating with existing security, workspace, and identity tools -- abstracting implementation while enforcing governance.

---

## Notable Quotes

> "The models are isomorphic to me in capability. The only thing's different now." -- on reaching agent-human parity

> "I become more latency insensitive. I have zero investment in authorship experience." -- on the shift in engineering identity

> "When tokens are cheap and agents are parallel, code is essentially disposable." -- on the economic logic of agent-generated code

> "The models fundamentally crave text. My job is funneling text between agents." -- on CLI design philosophy

> "Ghost libraries mean we distribute software as specs agents can reproduce locally." -- on Symphony distribution

> "Zero-to-one products and gnarly refactorings -- that's where I spend synchronous time." -- on remaining human-required work

> "Agents aren't hard; the Harness is hard." -- the defining thesis

> "It's borderline negligent if you aren't using >1B tokens a day." -- on operational baselines

---

## The Big Model vs. Big Harness Debate

This talk sits at the center of a major industry debate documented in Latent Space's follow-up "[AINews] Is Harness Engineering real?":

**Big Model camp** (minimal harness): Boris Cherny (Claude Code) says "all the secret sauce, it's all in the model" with thinnest possible wrapper. Noam Brown (OpenAI reasoning) argues scaffolds "will be replaced by reasoning models becoming more capable." METR finds Claude Code and Codex don't decisively beat "a basic scaffold."

**Big Harness camp** (Lopopolo's position): Jerry Liu argues "the Model Harness is Everything -- the biggest barrier to getting value from AI is your own ability to context and workflow engineer." Pi research showed optimizing harness alone improved 15 different LLMs in one afternoon. Scale AI's SWE-Atlas muddied the picture: Opus outperformed in Claude Code but underperformed in generic frameworks, while GPT 5.2 showed the reverse, suggesting model-harness coupling matters more than either in isolation.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://openai.com/index/harness-engineering/ | OpenAI's official blog post by Lopopolo; the written manifesto of harness engineering with implementation details | `/ingest-article` |
| https://github.com/openai/symphony | Symphony open-source repo; reference Elixir implementation of agent orchestration with process supervision | Tool catalogue entry |
| https://www.latent.space/p/ainews-is-harness-engineering-real | The Big Model vs Big Harness debate roundup; counterarguments and industry reactions | `/ingest-article` |
| https://www.theneuron.ai/explainer-articles/openais-harness-engineering-playbook-how-to-ship-1m-lines-of-code-without-writing-any/ | Detailed explainer with the 7 Agent Legibility Metrics and implementation roadmap | `/ingest-article` |
| https://tessl.io/speaker/ryanlopopolo/ | Lopopolo's speaker profile for upcoming talks | Practitioner tracking |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Symphony | OpenAI's Elixir-based agent orchestration layer; process supervision for Codex agent fleets | No -- should add (github.com/openai/symphony) |
| Codex (OpenAI) | The underlying coding agent that wrote all 1M+ LOC | Partially -- referenced in other entries |
| Frontier (OpenAI) | Enterprise agent deployment platform; the product being built | No -- enterprise platform |
| Elixir/OTP | Chosen for Symphony because GenServers + supervisors map naturally to agent orchestration | No -- language/framework |
| ESLint | Used to encode team knowledge as lint rules that prevent agent mistakes | No -- standard tooling |
| NX (Nrwl) | Final build system choice after make -> Bazel -> Turbo migration | No -- standard tooling |

---

## Action Items

- [ ] Enforce sub-60-second build loop ceiling in all orchestrator-managed projects
- [ ] Implement session log analysis: collect agent session logs -> run daily analysis loop for systemic improvements
- [ ] Audit our repos against the 7 Agent Legibility Metrics (bootstrap, entry points, validation, linting, codebase map, docs, decision records)
- [ ] Evaluate shifting from pre-merge review to post-merge statistical sampling
- [ ] Encode recurring agent mistakes as lint rules rather than documentation
- [ ] Explore Symphony repo (github.com/openai/symphony) for Elixir process supervision patterns applicable to our tmux orchestration
- [ ] Track tokens/day as a productivity KPI alongside PR throughput
- [ ] Consider ghost library pattern: distribute orchestrator knowledge as specs rather than shared code
