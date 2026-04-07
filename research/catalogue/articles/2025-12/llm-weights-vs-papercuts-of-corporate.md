# LLM Weights vs the Papercuts of Corporate

> **Geoffrey Huntley -- ghuntley.com, 2025-12-09**

| Field | Value |
|-------|-------|
| Source | https://ghuntley.com/papercuts |
| Author | Geoffrey Huntley (Engineer at Sourcegraph/Amp, independent researcher) |
| Publication | ghuntley.com (personal blog) |
| Date | 2025-12-09 (modified 2026-02-27) |
| Topics | model-weight-first companies, corporate friction, AI velocity, LLM grain, organizational impedance, code generation economics |
| Read Time | ~8 min (estimated) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **"Model weight first" companies are a new category** -- Huntley defines companies founded in the past year where the majority of software infrastructure is code-generated as "model weight first." These companies build with the grain of LLM training data, not against it. This is a structural advantage, not a productivity hack.

2. **Working with the grain vs against the grain** -- The woodworking analogy is the core thesis: LLMs produce output shaped by their training data (the "grain"). Companies that align their development patterns with what LLMs already know (popular frameworks, well-documented APIs, standard patterns) get dramatically better results than those fighting against the model weights.

3. **Corporate friction is the anti-grain** -- Traditional enterprise processes (approval chains, committee reviews, compliance theater, meeting-heavy cultures, waterfall planning) create "papercuts" that compound into massive velocity drains. Each individual friction point seems minor, but collectively they make it impossible to move at the speed AI enables.

4. **The velocity gap is widening exponentially** -- Model-weight-first companies iterate at AI speed while traditional organizations are still debating adoption policies. The papercuts of corporate process don't just slow teams down -- they make AI adoption structurally impossible because the feedback loops are too slow to benefit from agent-driven development.

5. **Organizational design determines AI ceiling** -- The argument extends beyond tooling: no amount of AI tooling can overcome an organization designed around human-speed processes. The bottleneck has shifted from "can we build it?" to "can our organization absorb the output?"

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly validates the solo operator / small team thesis. Burak's orchestrator operates without corporate friction by design -- no approval chains, no committees, no process theater. The "model weight first" framing is useful for positioning client pitches. The grain metaphor explains why standard tech stacks (Next.js, TypeScript, Postgres) work better with agents than exotic choices. |
| **Actionable** | 6/10 | More strategic/philosophical than tactical. The key actionable insight is stack selection: choose technologies that are well-represented in LLM training data ("work with the grain"). Also useful for gov contract positioning: frame our speed advantage as structural (no papercuts), not just technological. |

---

## Summary

Geoffrey Huntley borrows from woodworking to frame a thesis about AI-driven development: just as a carpenter must work with the grain of the wood, developers and companies must work with the grain of LLM training data -- the model weights.

He introduces the concept of "model weight first" companies -- a new category of startups founded in the past year where the majority of software was code-generated. These companies succeed because they build with patterns, frameworks, and architectures that are deeply embedded in LLM training data. They choose popular, well-documented tech stacks not out of convention but because that is where the model weights are strongest.

The "papercuts of corporate" are the accumulated friction points in traditional organizations: approval workflows, committee structures, waterfall planning, compliance theater, and meeting cultures. Each individual friction point seems trivial, but they compound into an organizational structure that is fundamentally incompatible with AI-speed development. A Ralph loop can ship working software in hours, but if the organization requires three rounds of review, a security audit, and a change advisory board meeting, the speed advantage evaporates.

The thesis connects to Huntley's broader body of work on AI economics ($10.42/hr development costs, K-shaped economic divergence) and the Ralph Wiggum loop methodology. The papercuts article explains the organizational dimension of why some companies capture AI value and others don't -- it is not about the tools, but about the friction surrounding them.

This framing has particular resonance for solo operators and small teams who have zero corporate friction by default, giving them a structural advantage that scales with AI capability improvements.

---

## Notable Quotes

> "In woodworking, there's a saying that you should work with the grain, not against the grain and I've been thinking about how this concept may apply to large language models."

> "These large language models are built by training on existing data. This data forms the backbone which creates output based upon the preferences of the underlying model weights."

> "We are now one year in where a new category of companies has been founded whereby the majority of the software behind that company was code-generated."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ghuntley.com/pressure/ | "Don't waste your back pressure" -- companion piece on feedback mechanisms as the control layer for AI velocity | `/ingest-article` |
| https://ghuntley.com/loop/ | "Everything is a Ralph loop" -- the technical methodology that papercuts companies use to achieve AI velocity | `/ingest-article` |
| https://ghuntley.com/teleport/ | "Teleporting into the future and robbing yourself of retirement projects" -- implications of AI-speed development on long-term planning | `/ingest-article` |
| https://ghuntley.com/cursed/ | "I ran Claude in a loop for three months" -- 3-month autonomous loop case study validating the model-weight-first thesis | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Large Language Models (general) | Core subject -- training data as "grain" that shapes output quality | N/A |
| Claude Code | Implied runtime for Ralph-style agent loops | Referenced across catalogue |
| Ralph Wiggum Loop | Underlying methodology enabling model-weight-first velocity | Referenced in [Geoffrey Huntley](../../practitioners/geoffrey-huntley.md) practitioner profile |

---

## Action Items

- [ ] Use "model weight first" framing when evaluating tech stack choices for SaaS factory launches -- choose frameworks with the deepest LLM training data representation
- [ ] Apply the "papercuts" diagnostic to client organizations: map their approval chains and process overhead as a velocity impedance assessment
- [ ] Consider the grain metaphor for agent prompt design: agents produce better code when working with popular patterns vs. exotic architectures
- [ ] Review the 3 companion articles (pressure, loop, teleport) to complete the Huntley thesis picture
