# The Three Core Components of an AI Agent: Planner, Evaluator, Executor

> **@svpino — 2026-04-11**

| Field | Value |
|-------|-------|
| Source | https://x.com/svpino/status/2042986795210805352 |
| Author | @svpino — Santiago Valdarrama (Computer Scientist, runs ml.school — "hard-core AI/ML Engineering" cohort) |
| Date | 2026-04-11 |
| Topics | agent-architecture, planner-evaluator-executor, cohort-promotion, ml-school |
| Type | Single post (educational + cohort promo) |
| Engagement | 24.5K views, 324 likes, 371 bookmarks (1.14:1), 57 retweets, 29 replies |

---

## Burak's Notes

> Santiago's a respected ML educator — but this "three core components" framing is a textbook flattening of what actually ships. Compare to Akshay Pachaar's Von Neumann anatomy (12 components, already catalogued) or the Harness Convergence Wave synthesis. The Planner/Evaluator/Executor triad is a valid reductive view that shows up in DSPy, LangGraph, and CAMEL — but in 2026 the interesting question isn't "what are the components" but "how do they share context without thrashing" (see coordination overhead exponent 1.724). **Novelty low, audience reach high.** Useful as a teaching frame for a client pitch; not actionable for our roadmap. The cohort sell ($ lifetime access, May 4th start) is the real payload of this post.

---

## Key Takeaways

1. **Three-role decomposition** — Planner breaks task into steps + accepts feedback + regenerates; Evaluator scores the plan and task-result-vs-plan alignment; Executor runs individual steps. This is a classic Plan/Reflect/Act triad (variant of ReAct + Reflexion).
2. **Shared tools + memory for all three** — No role is sandbox-isolated at the capability level; separation is semantic, not infrastructural. Contrast with Sunil Pai's Deno-capability-scoped worker model.
3. **Promotion for ml.school cohort (May 4 start)** — "Lifetime access to the best engineering program you'll take online." This post is top-of-funnel content marketing disguised as educational decomposition.
4. **Feedback loop inside Planner is the load-bearing claim** — "capable of taking feedback on the plan and generating a new version" encodes the iterative-refinement pattern Lopopolo and Matt Pocock both defend as the real unit of quality.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 4/10 | Teaching frame only. We already operate a deterministic orchestrator (not LLM planner) + LLM executor + human evaluator — Santiago's triad collapses our hard-won separation. Useful as a client-explainer diagram, not as architecture guidance. |
| **Novelty** | 2/10 | Plan/Evaluate/Act is 2023 vintage (ReAct, Reflexion, AutoGen). No new mechanism proposed. |
| **Actionable** | 3/10 | Could borrow the triad as a pedagogical slide for OmniPort-HH or voice-AI client pitches. Nothing to implement. |

---

## Full Content

> Here is the inside of an AI Agent:
>
> Three core components:
>
> 1. **Planner** - Takes care of breaking down a task into individual steps. It's capable of taking feedback on the plan and generating a new version.
>
> 2. **Evaluator** - Takes care of evaluating a plan and providing feedback about it to the Planner component. It can also check the results of a task to determine whether they align with the plan.
>
> 3. **Executor** - Takes care of executing individual steps of a plan.
>
> All three components have access to tools and memory to do their job.
>
> I'm covering all of this in my cohort. It starts on May 4th. You can join at https://ml.school for lifetime access to the best engineering program you'll take online.

*Post includes a single diagram image (1053x502) showing the Planner/Evaluator/Executor architecture with shared Tools + Memory blocks.*

---

## Notable Replies

Not captured in fxtwitter payload — would need deeper scrape. 29 replies total, mostly promotional / cohort-curious per engagement shape.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|------------------|
| https://ml.school | Santiago's cohort landing page; curriculum might include non-trivial harness patterns worth extracting | Low priority — marketing site; evaluate only if we want a "competing educator landscape" pass |
| https://youtube.com/@underfitted | Santiago's YouTube channel; might contain talk-level content worth `/ingest-talk` | Medium — sample 1-2 videos for talk-catalogue fit |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| ml.school (Santiago's cohort) | Promoted as source for deeper coverage of the triad | No — not a tool; educator platform |

---

## Cross-References

- **Akshay Pachaar — Anatomy of an Agent Harness** (`computer-architecture-for-agents/04-akshay-anatomy-of-agent-harness.md`): 12-component harness taxonomy supersedes Santiago's 3-role frame.
- **Harness Convergence Wave Synthesis** (`reference/synthesis-2026-04-11-harness-convergence-wave.md`): documents the 2026-04-11 industry consensus that models have commoditized and harness structure is the moat — Santiago's post is an artifact of the popularizing layer, not the leading edge.
- **Master Blueprint Principle #2** (Deterministic orchestration, LLM execution): our design explicitly REJECTS putting the Planner inside an LLM. Santiago's framing assumes LLM-planner; we have found that decision is load-bearing against it.
