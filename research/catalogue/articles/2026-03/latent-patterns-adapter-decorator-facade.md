# Adapter, Decorator & Facade — Software Design & Systems

> **Geoffrey Huntley / Latent Patterns — latentpatterns.com, undated**

| Field | Value |
|-------|-------|
| Source | https://latentpatterns.com/courses/software-design-and-systems/structural-design-patterns/adapter-decorator-and-facade |
| Author | Geoffrey Huntley / Latent Patterns |
| Publication | latentpatterns.com (paid course) |
| Date | undated |
| Topics | structural design patterns, adapter pattern, decorator pattern, facade pattern, Python, software architecture |
| Read Time | ~10-15 min (estimated) |
| Access | Subscription required (https://latentpatterns.com/pricing) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this article. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

> **Note: Content is behind a paywall. Takeaways below are derived from visible metadata, course structure, and Geoffrey Huntley's known teaching philosophy. Full analysis requires subscription access.**

1. **Adapter pattern for interface translation** -- Adapters wrap incompatible interfaces to make them work together without modifying the original code. In agent systems, this pattern is directly applicable to MCP tool adapters, model API translation layers (e.g., LiteLLM), and harness-agnostic tool wrappers.

2. **Decorator pattern for behavior composition** -- Decorators add responsibilities to objects dynamically without subclassing. In agent orchestration, this maps to layered middleware: logging decorators on tool calls, retry decorators on API requests, token-counting decorators on model interactions, and permission-checking decorators on agent actions.

3. **Facade pattern for complexity hiding** -- Facades provide a simplified interface to a complex subsystem. Our orchestrator itself IS a facade -- it hides tmux session management, worktree isolation, state file management, and agent lifecycle behind a single loop abstraction.

4. **Python implementations** -- The course teaches these patterns in Python, consistent with Huntley's approach of teaching foundational CS through practical implementation. The learning objectives explicitly state "implement" for all three patterns, suggesting hands-on coding exercises.

5. **Part of a broader structural patterns curriculum** -- This lesson sits within the "Structural Design Patterns" module of Huntley's "Software Design & Systems" course, suggesting a systematic treatment of GoF patterns through a modern, AI-era lens.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 4/10 | Classic design patterns, not agent-specific content. However, these three patterns are foundational to how we build agent infrastructure: MCP adapters, tool decorators (logging/retry/auth), and the orchestrator facade itself. The value is in Huntley's teaching lens, not the patterns themselves. |
| **Actionable** | 3/10 | No immediately actionable items for our system. These patterns are already implicitly used throughout our architecture. The course is more valuable for team onboarding than for new architectural insights. Paywalled content limits deeper assessment. |

---

## Summary

This is a lesson within Geoffrey Huntley's "Software Design & Systems" course on the Latent Patterns platform. It covers three classic structural design patterns from the Gang of Four: Adapter, Decorator, and Facade, implemented in Python.

The content is behind a subscription paywall, so detailed analysis is not possible. Based on the visible metadata, the lesson focuses on practical implementation of these three patterns. The learning objectives are explicitly implementation-oriented: "Implement adapter pattern," "Implement decorator pattern," "Implement facade pattern."

While these are well-established software engineering patterns (not novel), Huntley's framing is noteworthy. Latent Patterns positions itself as a platform for AI-era software engineering education, and Huntley's other work (Ralph Wiggum loops, back pressure, multi-boxing) consistently reframes classical concepts through the lens of agent engineering. It is reasonable to expect this lesson connects these structural patterns to modern agent/LLM system design, though the paywall prevents confirmation.

For our catalogue, the significance is primarily as a tracking entry for Huntley's Latent Patterns platform output. The "Principles" article from the same platform (already catalogued at `articles/2026-03/ai-native-software-development-principles.md`) had more direct relevance to our architecture.

---

## Notable Quotes

> *Paywalled -- no quotes available.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://latentpatterns.com/courses/software-design-and-systems | Full course index for Huntley's Software Design & Systems curriculum -- may contain agent-relevant pattern lessons | Low priority -- assess when more lessons become available |
| https://latentpatterns.com/survey/ai-engineer-adoption-2026 | AI adoption survey for engineers -- potential data source for agent adoption trends | `/ingest-article` if survey results are published publicly |
| https://latentpatterns.com/survey/ai-leadership-adoption-2026 | AI adoption survey for leaders -- complementary data to engineer survey | `/ingest-article` if survey results are published publicly |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Latent Patterns | Platform hosting the course | Yes -- referenced in `articles/2026-03/ai-native-software-development-principles.md` |
| Geoffrey Huntley | Course author / platform founder | Yes -- `practitioners/geoffrey-huntley.md` |

---

## Action Items

- [ ] Re-evaluate if/when Latent Patterns offers a trial or makes this content publicly available
- [ ] Track the AI adoption survey results (engineer + leadership versions) for potential ingestion
- [ ] Consider bulk-ingesting the publicly accessible Latent Patterns course catalogue pages for completeness
