# Principles — How We Think About Building with LLMs

> **Latent Patterns — latentpatterns.com, undated**

| Field | Value |
|-------|-------|
| Source | https://latentpatterns.com/principles |
| Author | Latent Patterns (org/collective) |
| Publication | latentpatterns.com |
| Date | undated |
| Topics | AI-native development, agent engineering, context engineering, deterministic constraints, observability, LLM economics |
| Read Time | ~10 min |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Backpressure > manual rescue** — Every time a human manually fixes agent output is an anti-pattern. Engineer constraints (type systems, tests, linters, schema validation) that prevent failure autonomously. Directly validates our 70/30 deterministic/LLM split.
2. **Verify, don't just test** — Traditional unit tests are insufficient for agent-generated code. Formal methods, property-based tests, and deterministic simulation testing are the future. Stronger verification must outpace generative capability.
3. **The moat is in the workflow, not the model** — Models commoditize rapidly. Durable competitive advantage lives in data pipelines, evaluation frameworks, feedback loops, and domain expertise encoded in prompts and tooling. Confirms our "harness over framework" thesis.
4. **Agents need boundaries, not freedom** — Unconstrained autonomy produces unpredictable, expensive, fragile systems. Clear tool definitions, explicit action spaces, well-defined termination conditions, and budget constraints are essential. Echoes our minimal tool philosophy.
5. **Context windows are not infinite memory** — Large windows create diminishing returns (attention degrades, retrieval accuracy drops, latency climbs, cost scales linearly). Surgical token inclusion beats context stuffing.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Strong alignment with our deterministic-first architecture, agent boundary design, and context engineering discipline. No novel frameworks or tools, but excellent principle articulation. |
| **Actionable** | 6/10 | Principles are sound but mostly confirm existing patterns (70/30 split, backpressure, context discipline). The verification > testing principle is the most actionable new idea — property-based testing for agent-generated code. |

---

## Summary

Latent Patterns presents 14 principles for building AI-native software. The article argues against treating LLMs as bolt-on features and instead advocates treating them as a material with known failure modes, flex points, and grain. The core thesis: sustainable advantage comes not from model access (which commoditizes) but from the surrounding workflow — evaluation frameworks, feedback loops, deployment pipelines, and encoded domain expertise.

The most architecturally significant principles concern agent boundaries and deterministic constraints. The "Capture Your Backpressure" principle argues that every manual agent rescue is an anti-pattern — teams should engineer constraints (type systems, linters, schema validation) that prevent failure without human intervention. This maps directly to the 70/30 deterministic/LLM split pattern. Similarly, "Agents Need Boundaries, Not Freedom" advocates minimal tool sets, explicit action spaces, and budget constraints over unconstrained autonomy.

The article also makes a strong case for verification over traditional testing when agents generate code. Formal methods and property-based testing must be stronger than the generative process itself. The "Humans on the Loop, Agents in the Loop" framing cleanly separates the human role (architect, accountability, quality framework design) from the agent role (execution within those frameworks), echoing the context separation principle from Elvis Sun's work.

The economic argument — "Tokens Are Cheaper Than People" — advocates spending liberally on evaluation, retries, and backpressure rather than rationing tokens, noting that open-source models make this increasingly viable. The "Build Where the Puck Is Going" principle challenges teams to question inherited processes designed for human operators, since agents are becoming the primary operators.

---

## Notable Quotes

> "No agent has skin in the game. No model cares whether the customer is happy."

> "The team that ships ten imperfect versions while their competitor architects one perfect version will win every time."

> "If an agent can't observe the state of your system, it can't debug it, it can't improve it, and it can't close the loop."

> "Models are commoditising. The model you're using today will be surpassed within months."

> "Formal methods, type theory, property-based tests, and deterministic simulation testing are the future."

> "AI stands for Amplified Intelligence — it amplifies what you know."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| — | No significant external links referenced in the article | — |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Property-based testing | Cited as future of agent code verification (no specific tool named) | No — consider exploring Hypothesis (Python) or fast-check (TS) |
| Formal methods / type theory | Named as verification approach stronger than unit tests | No — general concept, not a specific tool |

---

## Action Items

- [ ] Investigate property-based testing frameworks for TypeScript (fast-check) as quality gate for agent-generated code
- [ ] Review our agent tool definitions against the "minimal tool set + explicit action space + budget constraints" principle
- [ ] Consider adding deterministic simulation testing to our E2E gate pipeline
