# The Future Belongs to People Who Can Just Do Things

> **Geoffrey Huntley — ghuntley.com, February 2025**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/dothings |
| Author | Geoffrey Huntley (independent, .NET/DevOps background, AI agent thought leader) |
| Publication | ghuntley.com |
| Date | 2025-02-07 |
| Topics | AI coding economics, agent adoption curve, solo founders, execution vs ideas, organizational change |
| Read Time | ~10 min |

---

## Burak's Notes

> *Part of the complete Huntley collection. Referenced as deep dive candidate from the "screwed" article. This is the companion builder-mindset piece to the student career crisis article.*

---

## Key Takeaways

1. **Most software engineers won't be hand-coding by end of 2026** — Huntley provides concrete evidence via token counts across five Gumroad codebases (100K-2M tokens), arguing that 200K context windows from Claude 3.5 Sonnet and o3-mini already enable AI to write 100% of smaller codebases when prompted effectively.

2. **Six-stage corporate adoption curve for AI** — From detraction/disbelief through experimental usage, anxiety ("will I have a job?"), alarm, active engagement with tools like Cursor, to the advanced stage of "programming the LLMs themselves." Companies must actively manage employee anxiety and create space for experimentation.

3. **Back pressure infrastructure enables autonomous agents** — Strong type systems, compiler errors, test coverage, and fast compilation/test cycles provide reinforcement signals that let agents be driven harder. Developer onboarding friction should approach zero.

4. **"Execution is now cheap" — the inversion thesis** — The old startup maxim "ideas are cheap, execution is everything" has flipped. Now execution is cheap via AI agents, and what matters is brand, distribution, ideas, and retaining people who understand this shift.

5. **Solo founders can now compete at scale** — With AI agents, proficient engineers resemble Garry Brewer (BuiltWith: 1 employee, $14M ARR). The need for technical co-founders evaporates when individuals with unique insights can reach market rapidly by "programming the LLMs."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Core thesis article in the Huntley canon — directly validates our solo-operator model with agent swarms; the "execution is cheap" inversion maps to Burak's $50K-in-1-week delivery model; six-stage adoption curve useful for client conversations |
| **Actionable** | 6/10 | More thesis/vision than technical playbook; the back pressure and type system insights are actionable but covered in more depth in Huntley's later articles (stdlib, Ralph Wiggum, back pressure); the 1000-agent vision from Anni Betts is aspirational |

---

## Summary

Huntley opens with a provocative declaration: he can no longer see a path where the majority of software engineers are "doing artisanal hand-crafted commits" by end of 2026. He backs this with concrete data from Sahil Lavingia's Gumroad ecosystem — five codebases ranging from 100K to 2M tokens — arguing that current 200K context windows already encompass entire smaller codebases. Lavingia's new development process (discussion > AI specs > AI coding via Devin > QA > deploy) previews the post-manual-coding workflow.

The article frames AI coding as the latest abstraction layer in 43 years of software history — assemblers to compilers to programming LLMs. Huntley outlines a six-stage corporate adoption curve, from initial detraction through anxiety to the advanced stage of "programming the LLMs themselves." He emphasizes that companies must actively address employee anxiety, fund personal AI tool subscriptions, evolve training programs, and create dedicated experimentation time (monthly hackathons during business hours).

On the technical side, Huntley identifies the key enablers for autonomous agent productivity: strong type systems and compiler errors as reinforcement signals, test coverage as feedback loops, fast compilation cycles, and near-zero developer onboarding friction. These are the precursors to his later, more detailed "back pressure" thesis.

The article's most impactful claim is the "inversion thesis": the old startup maxim "ideas are cheap, execution is everything" has flipped. Execution is now cheap via AI agents. What matters is brand, distribution, ideas, and retaining people who understand this shift. Referencing Anni Betts (Anthropic), Huntley envisions deploying 1,000 AI agents simultaneously against entire issue backlogs. Proficient engineers can now become solo-founder successes like Garry Brewer (BuiltWith: 1 employee, $14M ARR).

---

## Notable Quotes

> "I seriously can't see a path forward where the majority of software engineers are doing artisanal hand-crafted commits by as soon as the end of 2026."

> "Execution is now cheap. All that matters now is brand, distribution, ideas and retaining people who get it."

> "no fam, what if you had *1000* AI coworkers that went ham on your entire issue backlog at once" — Anni Betts (Anthropic)

> "It won't be long until AI will be writing all the code for Helper, Flexile, and Gumroad."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/multi-boxing/ | Huntley's parallel agents thesis — already catalogued | Already ingested |
| https://ghuntley.com/stdlib/ | Programming LLMs / stdlib method — already catalogued | Already ingested |
| https://ghuntley.com/ngmi/ | "What do I mean by some software devs are ngmi" — completes the Huntley thesis arc | `/ingest-article` |
| https://ghuntley.com/oh-fuck/ | The "time to oh-fuck" moment + compiler error discussion | `/ingest-article` |
| https://ghuntley.com/anywhere/ | Developer environment automation / zero-friction onboarding | `/ingest-article` |
| https://www.colinkeeley.com/blog/the-story-of-builtwith-1-employee-14m-arr | BuiltWith solo-founder case study — 1 employee, $14M ARR | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude 3.5 Sonnet | 200K context window enabling full-codebase AI coding | Yes — core model |
| o3-mini | 200K context window, paired with Claude as evidence | No — OpenAI model, not a tool |
| Devin | Used in Lavingia's AI coding workflow for code generation | Yes — [Devin](../../../agent-harnesses/devin.md) |
| Cursor | Mentioned as stage 5 adoption tool | Yes — [Cursor](../../../developer-gui/cursor.md) |
| Gumroad | Sahil Lavingia's platform, used as token-count evidence | No — product platform, not relevant |
| BuiltWith | Solo-founder success story (Garry Brewer, 1 employee, $14M ARR) | No — not relevant to catalogue |

---

## Action Items

- [ ] Ingest remaining Huntley deep dive candidates: `/ngmi`, `/oh-fuck`, `/anywhere`
- [ ] Consider ingesting the BuiltWith/Colin Keeley article as a solo-founder economics case study
- [ ] Cross-reference this "execution is cheap" inversion thesis with the $10.42/hr economics article already in catalogue
