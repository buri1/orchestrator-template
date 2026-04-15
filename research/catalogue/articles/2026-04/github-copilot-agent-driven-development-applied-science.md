# Agent-Driven Development in Copilot Applied Science

> **Tyler McGoffin — GitHub Blog, 2026-03-31**

| Field | Value |
|-------|-------|
| Source | https://github.blog/ai-and-ml/github-copilot/agent-driven-development-in-copilot-applied-science/ |
| Author | Tyler McGoffin (Sr. Applied Researcher, Copilot Applied Science team, GitHub) |
| Publication | GitHub Blog (AI & ML / GitHub Copilot) |
| Date | 2026-03-31 |
| Topics | agent-driven development, agent-first codebases, guardrails, Copilot CLI, Claude Opus 4.6, CI/CD for agents, prompt engineering |
| Read Time | 9 min |

---

## Burak's Notes

> *First-party GitHub write-up of what "harness engineering" looks like inside a Copilot research team. Interesting signal: McGoffin's team picked **Claude Opus 4.6** (not GPT) as the model behind Copilot CLI for their internal `eval-agents` project — matches our own Opus-only bias. His "blame process, not agents" framing is a cleaner version of Huntley's back-pressure doctrine and Lopopolo's harness keynote. The +28,858/-2,884 line metric in 3 days with 5 people is the kind of throughput number we want for our Meeting 2 slides without coming across as tool-bragging. Concrete pattern to steal: the `/plan` -> `/autopilot` -> automated review -> human review loop maps 1:1 to our spawn -> PR -> reviewer -> fixer sequence. Also, the "weekly routine: prompt Copilot for test coverage gaps, duplication, and doc drift" is a nice lightweight garbage-collection pattern we can bolt onto the orchestrator loop.*

---

## Key Takeaways

1. **Agent-first codebases are the new engineering discipline** — McGoffin argues that refactoring, documentation, strict typing, and linter coverage go from "cleanup work" to the single highest-leverage investment because they feed the agent's self-verification loop. "Delivering features with Copilot becomes trivial when you have a well-maintained, agent-first project."
2. **"Blame process, not agents"** — Shift from "trust but verify" to treating failed agent runs the same way SRE teams treat outages: blameless, process-fix-oriented. If an agent produced bad code, the guardrails (types, tests, linters, CI) were insufficient, not the agent.
3. **Conversational prompts beat terse specs** — McGoffin explicitly recommends stream-of-consciousness, verbose planning prompts over narrow problem statements, and leveraging planning mode before execution mode. Example: a prompt about regression test protection framed as an observed behavior ("I've recently observed Copilot happily updating tests to fit its new paradigms…") rather than a rule.
4. **Four-stage feature loop** — `/plan` (scoping + test + docs) -> `/autopilot` (implementation) -> Copilot Code Review agent (automated review with iterative refinement) -> human review (pattern enforcement). Plus weekly routines for coverage gaps, duplication, and doc drift.
5. **Throughput signal** — In 3 days, 5 team members created 11 new agents, 4 new skills, 1 new workflow concept, and shipped +28,858 / -2,884 lines across 345 files — all via Copilot CLI + Claude Opus 4.6 in VSCode.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | First-party GitHub validation of the harness-engineering thesis from the AIE Europe 2026 synthesis; confirms Claude Opus as the preferred model even inside Microsoft; four-stage loop is structurally identical to our orchestrator loop |
| **Actionable** | 8/10 | Directly adoptable: (1) "blame process not agents" doctrine, (2) `/plan` -> `/autopilot` -> review -> human sequence, (3) weekly garbage-collection prompts, (4) stream-of-consciousness prompt style |

---

## Summary

Tyler McGoffin, a Senior Applied Researcher on GitHub's Copilot Applied Science team, documents how he used AI coding agents to automate the analysis of coding agent "trajectories" — the JSON logs of agent decision-making produced by running evaluations like TerminalBench2 and SWEBench-Pro. Manual review of hundreds of thousands of lines across dozens of tasks was infeasible, so he built `eval-agents`, an internal framework that eventually enabled his entire team to author and share new analysis agents quickly.

The core argument of the article is that **the skills that make a strong human engineer are the same skills that make effective agent development**. McGoffin organizes his advice into three buckets: prompting strategies (conversational, verbose, planning-first), architectural strategies (refactoring, documentation, and code cleanup become top-priority work because they are what agents navigate), and iteration strategies (shift from "trust but verify" to "blame process, not agents"). The architectural argument is the most load-bearing: strict typing, robust linters, and comprehensive testing are reframed as tools the agent uses to verify its own work inside its development loop. In this framing, code-quality infrastructure is no longer deferrable — it is the precondition for agent productivity.

McGoffin then describes his concrete development workflow. Every feature begins with a `/plan` prompt in Copilot CLI, which the team uses to scope the work including its tests and documentation. Implementation runs via `/autopilot`. The Copilot Code Review agent then provides automated review with iterative refinement, and a human reviewer enforces team patterns at the end. On top of this per-feature loop, he runs weekly maintenance prompts for test coverage gaps, code duplication, and documentation drift. His stack is Copilot CLI + Claude Opus 4.6 in VSCode, with access to MCP servers and the Copilot SDK.

The throughput result is striking: in three days, five team members created 11 new agents, 4 new skills, and 1 new workflow concept, producing +28,858 / -2,884 lines of code across 345 files. McGoffin closes with an explicit recommendation to download Copilot CLI, enable it in any repository, and run `/plan` to assess the repository's readiness for agent-first development.

The piece functions as GitHub's own ratification of the "harness engineering" thesis — that the model is not the differentiator; what matters is the repository, the guardrails, and the loop. It also notably picks Claude Opus 4.6 (Anthropic) as the model behind Copilot CLI inside a GitHub/Microsoft research team, a data point worth tracking.

---

## Notable Quotes

> "The things that make human engineers the most effective...are the same things that make these agents effective."

> "When Copilot has these tools available in its development loop, it can check its own work. You're setting it up for success, much the same way you'd set up a junior engineer."

> "Gone are the days where deprioritizing this work over new feature work was necessary, because delivering features with Copilot becomes trivial when you have a well-maintained, agent-first project."

> "The skills that make you a great engineer and a great teammate are the same skills that make you great at building with Copilot."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.blog/ai-and-ml/github-copilot/ (Copilot Code Review agent) | Automated review stage of the four-stage loop; cross-references our /ui-review workflow | `/ingest-article` if a canonical page exists |
| GitHub Agentic Workflows (referenced as "broader agent ecosystem") | First-party GitHub agentic workflow primitive; likely competitor to Inngest/Trigger.dev in our catalogue | `/tool-catalogue` |
| TerminalBench2 benchmark | Referenced as the evaluation target; worth cataloguing alongside SWEBench-Pro for our harness benchmarking | `/tool-catalogue` |
| SWEBench-Pro benchmark | Same as above — already appears in multiple catalogue entries but not yet a first-class tool entry | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Copilot CLI | Primary coding agent used for `eval-agents`; `/plan` + `/autopilot` commands | Not yet catalogued — consider `/tool-catalogue` |
| Claude Opus 4.6 | Model behind Copilot CLI in this setup | Referenced extensively across catalogue; no standalone tool entry |
| VSCode | IDE for the workflow | Standard, not worth cataloguing |
| Copilot SDK | Used to build custom agents leveraging existing tools + MCP servers | Not yet catalogued — consider `/tool-catalogue` |
| Copilot Code Review agent | Automated review stage of the four-stage loop | Not yet catalogued — consider `/tool-catalogue` |
| GitHub Agentic Workflows | Referenced as part of GitHub's broader agent ecosystem | Not yet catalogued — consider `/tool-catalogue` |
| Copilot CLI "Rubber Duck" | Alternative-model perspective feature inside Copilot CLI | Not yet catalogued |
| TerminalBench2 | Evaluation benchmark whose trajectories were analyzed | No standalone entry |
| SWEBench-Pro | Evaluation benchmark whose trajectories were analyzed | No standalone entry |

---

## Action Items

- [ ] Add "blame process, not agents" as an adoptable pattern in `ADOPTABLE-PATTERNS.md` — SRE-style blameless culture for orchestrator failures
- [ ] Map McGoffin's four-stage loop (`/plan` -> `/autopilot` -> Code Review agent -> human) against our orchestrator loop step-by-step to identify missing stages (specifically the pre-human automated review gate)
- [ ] Add weekly garbage-collection prompts (coverage gaps, duplication, doc drift) to the orchestrator's scheduled cron tasks
- [ ] Catalogue Copilot CLI as a first-class tool entry — confirmed Claude Opus 4.6 backing is a noteworthy data point
- [ ] Cross-reference with Huntley's "Don't Waste Your Back Pressure" and Lopopolo's Codex harness-engineering article — McGoffin is the GitHub-internal synthesis of both
