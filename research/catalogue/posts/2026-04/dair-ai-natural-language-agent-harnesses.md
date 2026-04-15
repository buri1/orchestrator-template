# Natural-Language Agent Harnesses (NLAHs): Harness as Prompt, Not Code

> **@dair_ai — 2026-04-01**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/dair_ai/status/2038968068706390117) |
| Author | @dair_ai — DAIR.AI, AI research curation & community |
| Date | 2026-04-01 |
| Topics | NLAH, agent-harness, natural-language, harness-design, LLM-interpreted, orchestration |
| Type | Single post |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Agent harnesses are too restrictive because they're still code** — Current harnesses (LangChain, CrewAI, etc.) force agent behavior into programmatic constructs. DAIR.AI argues this is fundamentally limiting — the harness itself should be written in natural language and interpreted by an LLM.
2. **NLAH = Natural Language Agent Harness** — A paradigm where the orchestration logic is expressed as natural language instructions rather than code. The LLM interprets the harness specification at runtime, enabling more flexible and adaptive agent behavior.
3. **Tension with deterministic orchestration** — This directly challenges our Principle #2 ("Deterministic orchestration, LLM execution"). NLAHs push orchestration INTO the LLM, which we've explicitly argued against. However, it may be appropriate for genuinely ambiguous coordination tasks where the optimal control flow isn't known ahead of time.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | High relevance as a counterpoint to our architectural thesis. Our CLAUDE.md and agent prompts ARE effectively natural-language harnesses — the orchestrator prompt IS the harness, interpreted by Claude. We're already doing NLAH in practice (markdown agent specs, CLAUDE.md rules), even though our orchestration loop is deterministic. The NLAH framing gives vocabulary to what we've built. This is also the research stream referenced in Huryn's "orchestration > autonomy" post. |

---

## Full Content

Agent harnesses are too restrictive because they're still designed as code. What if the harness was written in natural language and interpreted by an LLM?

*(Introduces the NLAH (Natural Language Agent Harness) concept: instead of encoding agent orchestration in Python/TypeScript frameworks, express the harness specification in natural language that an LLM interprets and executes at runtime.)*

---

## Notable Replies

*21 replies posted. Likely debate between "NL harnesses are too unpredictable" (our position) and "NL harnesses are more expressive" (the NLAH thesis), with practitioners sharing their own NL-first orchestration experiences.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| NLAH research paper (Stanford/MIT) | Foundational research for the NLAH paradigm — high relevance as counterpoint to our deterministic approach | `/ingest-article` (check if already in catalogue via anthropic harness design entries) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| NLAH concept | The paradigm being introduced | Partially — related to anthropic harness design article in catalogue |
| LangChain | Implied as example of "code harness" being challenged | Yes — referenced in multiple entries |
| CrewAI | Implied as example of "code harness" being challenged | Yes — [CrewAI](../../orchestration-platforms/crewai.md) |
