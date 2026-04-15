# Orchestration > Autonomy: Move Known Logic Out of Agent Prompts

> **@PawelHuryn — 2026-04-01**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/PawelHuryn/status/2039049353977839932) |
| Author | @PawelHuryn — Pawel Huryn, product management thought leader |
| Date | 2026-04-01 |
| Topics | orchestration, autonomy, agent-design, deterministic-logic, harness-design |
| Type | Single post (Quote-thread of @omarsar0) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Autonomy without orchestration is expensive** — The core argument: giving agents full autonomy for tasks that have known control flow (if/then, loops, retries) wastes tokens and introduces non-determinism where none is needed. This is a direct restatement of our Principle #2 ("Deterministic orchestration, LLM execution").
2. **Move known logic into the orchestration layer** — If you know the branching logic, retry conditions, and sequencing ahead of time, encode it deterministically rather than prompting an LLM to figure it out each time. The LLM should handle only the genuinely ambiguous parts.
3. **References Stanford & MIT harness paper via omarsar0** — Links to academic validation of the orchestration-over-autonomy thesis, connecting the practitioner conversation to the NLAH (Natural Language Agent Harness) research stream.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is a near-verbatim restatement of our Master Blueprint Principle #2 — "Deterministic orchestration, LLM execution. Orchestrator never guesses." Validates our architectural thesis from a product management perspective. Low novelty (we already live this) but high signal that the industry is converging on this view. |

---

## Full Content

Autonomy without orchestration is expensive. Move known logic (if/then, loops, retries) out of agent prompts into orchestration layer.

*(Quotes @omarsar0's post referencing Stanford & MIT research on agent harness design, arguing that deterministic control flow should be separated from LLM decision-making.)*

---

## Notable Replies

*6 replies posted. Low engagement volume but the post's value is in crystallizing the orchestration-first thesis for a product management audience.*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Stanford & MIT harness paper (via omarsar0) | Academic validation of orchestration > autonomy thesis | `/ingest-article` (check if already ingested via NLAH research) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Stanford & MIT NLAH research | Referenced via omarsar0 quote | Partially — see DAIR.AI NLAH post in this batch |
