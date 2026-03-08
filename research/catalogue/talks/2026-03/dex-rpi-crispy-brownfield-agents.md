# RPI to CRISPY — Reliable Process for High-Complexity Brownfield Agent Tasks

> **Dex (James) — Coding Agents: AI Driven Dev Conference 2026, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | [YouTube](https://www.youtube.com/watch?v=99Kxkemj1g8) (05:40:21 - 06:03:32) |
| Speaker | Dex (James), Co-founder @ HumanLayer |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~23 min |
| Date | 2026-03-08 |
| Topics | RPI, CRISPY, coding agents, brownfield development, context engineering, instruction budget, plan quality, vertical planning, agent alignment |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **RPI evolved into CRISPY (7 phases instead of 3)** — The original Research-Plan-Implement workflow was a single monolithic prompt with 85+ instructions. After observing thousands of engineers getting inconsistent results, they split it into: Questions, Research, Design, Structure/Outline, Plan, Worktree, Implement, PR. Each phase now has <40 instructions, dramatically improving instruction adherence.

2. **Instruction budget is real: ~150-200 max instructions per context window** — Citing an arXiv paper, frontier LLMs can only reliably follow 150-200 instructions. If your system prompt + CLAUDE.md + MCP tool definitions + workflow prompt exceeds this, you get partial/random adherence. The fix: split mega-prompts into focused micro-prompts connected by deterministic control flow.

3. **"Don't read the plans, read the code" — a reversal from August 2025** — Dex admits he was wrong when he previously said engineers don't need to read agent-generated code. After 6 months of not reading code, they had to rip out and replace large parts of their system. Plans and code tend to diverge, so reviewing a 1000-line plan and then still having to review the different 1000-line code output is not leverage.

4. **Vertical plans beat horizontal plans** — Models default to "do all the database, then all the services, then all the API, then all the frontend" (horizontal). This means you're 1200 lines deep before you can test anything. Vertical plans build thin slices end-to-end with checkpoints — mock API, wire frontend, mock services, database migration, integration — so you can catch errors at each phase.

5. **Design discussion as leverage: 200 lines vs. 1000** — By separating a "design discussion" phase (where are we going, patterns to follow, resolved decisions, open questions) into a ~200-line artifact, you get human-agent alignment before writing 1000+ lines of code. This is the highest-ROI review point — "brain surgery on the agent before proceeding downstream."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses the core challenge of our orchestrator: how to get reliable, high-quality output from coding agents on complex brownfield tasks. The instruction budget concept validates our approach of splitting orchestrator prompts into focused agent personas. The vertical planning pattern maps exactly to how we structure agent task decomposition. |
| **Actionable** | 8/10 | The CRISPY pipeline phases (especially separating questions/research from design/structure) are immediately adoptable. The instruction budget ceiling (~150-200) is a concrete engineering constraint to design around. The "hide the ticket from the research context window" technique to keep research objective is trivially implementable. |

---

## Summary

Dex (James), co-founder of HumanLayer and author of the "12 Factor Agents" paper, presents the evolution of the widely-adopted Research-Plan-Implement (RPI) methodology into a new 7-phase pipeline called CRISPY. The talk is a candid post-mortem of what went wrong with RPI when deployed to thousands of engineers at companies ranging from small startups to Fortune 500s.

The core problem: RPI worked brilliantly for experts who spent 70 hours/week with Claude and knew the "magic words" (e.g., "work back and forth with me, starting with your open questions and outline before writing the plan"), but failed for average team members who ran the prompts naively. Dex argues this is a tool design failure, not a user failure — if your tool requires hours of training to get good results, fix the tool.

The root cause analysis identified three failures: (1) research was contaminated with opinions because users told the model what they were building during the research phase, (2) the monolithic 85-instruction planning prompt exceeded the ~150-200 instruction budget that frontier LLMs can reliably follow, causing critical workflow steps to be skipped randomly, and (3) reviewing 1000-line plan files provided no real leverage since the resulting code would diverge from the plan anyway.

The solution is CRISPY: split the monolithic prompt into 7 focused phases (Questions, Research, Design, Structure, Plan, Worktree, Implement, PR), each with fewer than 40 instructions. Key innovations include deterministically hiding the ticket from the research context window (so research stays factual), introducing a "design discussion" artifact (~200 lines) that captures resolved decisions, patterns to follow, and open questions for human-agent alignment, and enforcing vertical (thin-slice) plans over horizontal (layer-by-layer) plans. The design discussion acts as the highest-leverage review point — you do "brain surgery on the agent" in 200 lines before it writes 1000+ lines of code.

Dex also makes a strong stand on code quality: "2026 is the year of no more slop." He cautions against agent swarms and excessive parallelism (referencing Gas Town), arguing that going 10x faster is pointless if you throw it all away in 6 months. The realistic target is 2-3x with near-human quality.

---

## Notable Quotes

> "If you built a tool that requires hours and hours of training and reps to get good results from, go fix the tool." — ~05:47:45

> "I was wrong. I am humble enough to admit when I was wrong. [...] Please, please read the code. We tried not reading the code for like six months. It did not end well." — ~05:49:37

> "This is the year 2026. No more slop." — ~05:43:00

> "Don't use prompts for control flow if you can use control flow for control flow." — ~05:54:37

> "You want to give the agent every single opportunity to show you what it's wrong about before you go write 2,000 lines of code." — ~05:56:45

> "I'm a little mid on agent swarms and the whole Gas Town thing because you still need to be able to ensure quality and going 10 times faster doesn't matter if you're going to throw it all away in 6 months." — ~05:50:47

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://humanlayer.dev | HumanLayer — Dex's company building an IDE that orchestrates CRISPY pipeline | `/tool-catalogue` |
| 12 Factor Agents paper (by Dex) | First formalization of "context engineering"; pre-dates RPI | `/ingest-article` |
| Kyle's blog post on instruction budgets (Nov/Dec 2025) | Cited arXiv paper on 150-200 instruction limit for frontier LLMs | `/ingest-article` |
| Drew Brunick's testing talk (same conference) | Dex explicitly deferred testing/verification discussion to this talk | `/ingest-talk` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| HumanLayer | Dex's company; building IDE that orchestrates CRISPY pipeline | Not yet catalogued — consider `/tool-catalogue` |
| RPI / CRISPY | The methodology itself; evolved from 3-phase to 7-phase | This entry |
| Claude Code | Primary coding agent platform discussed throughout | Referenced in many entries |
| Gas Town | Mentioned skeptically re: agent swarms and quality concerns | [Yes](../../orchestration-platforms/gas-town.md) |
| OpenClaw | Referenced as example of OSS project where "no one reads the code" | [Yes](../../orchestration-platforms/openclaw.md) |
| 12 Factor Agents | Dex's earlier paper; first to popularize "context engineering" | Not yet catalogued — consider `/ingest-article` |
| Beads (300K line project) | Referenced as example of large AI-generated codebase | Not yet catalogued |

---

## Action Items

- [ ] Audit our orchestrator agent prompts for instruction count — are any exceeding the 150-200 ceiling?
- [ ] Implement the "hide the ticket from research" pattern — use separate context windows for question generation vs. codebase research
- [ ] Add a "design discussion" phase to our agent task decomposition before plan generation
- [ ] Enforce vertical (thin-slice) planning in agent plan templates instead of horizontal (layer-by-layer)
- [ ] Evaluate HumanLayer IDE when available — could replace parts of our orchestrator workflow
- [ ] Find and ingest the 12 Factor Agents paper and Kyle's instruction budget blog post
