# Evals for Coding Agents — What They Are, Why They Matter

> **Jess (BrainTrust) — Coding Agents: AI Driven Dev Conference, 2026-03-08**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=99Kxkemj1g8 (01:11:45 - 01:40:09) |
| Speaker | Jess, Solutions Engineer @ BrainTrust |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | 00:28 |
| Date | 2026-03-08 |
| Topics | evals, coding agents, observability, vector search, agentic search, benchmarking, SWE-bench, BrainTrust |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.)*

---

## Key Takeaways

1. **Stop shipping on vibes — quantify with evals** — Teams frequently ship AI features based on gut feeling ("the engineer said it's ready" or "the PM tried a few prompts"). Evals replace this with measurable criteria: "We ran 200 test cases and 94% passed." This is table stakes for production AI.

2. **Four-part eval anatomy: Dataset + Task + Scorer + Experiment** — Every eval requires (1) a dataset of golden/edge/failure test cases, (2) a task definition (prompt + model), (3) a scoring system (deterministic, LLM-as-judge, or human review), and (4) experiment runs that compare configurations. This is the universal eval loop.

3. **Agentic search beats vector search for code — but the gap is nuanced** — In a head-to-head eval on SWE-bench (Django) and TypeScript-Go bugs, agentic search (Claude Code's grep/find/read approach) matched or outperformed vector search (embeddings + Pinecone) while being significantly cheaper. Vector search returns proximity to relevant code but lacks "connective tissue" — imports, type definitions, call chains — that agentic search follows naturally.

4. **Vector search's hidden cost: guess-and-check loops** — In one SWE-bench run, the vector-search agent made 26 separate search calls trying to locate a bug, burning tokens without finding the right code. Agentic search's chain-of-thought exploration (follow function -> read file -> trace import -> follow reference) converges faster and cheaper.

5. **Evals are a team sport requiring four roles** — AI engineer (data pipeline + code changes), product manager (hypotheses + success criteria), subject matter experts (data labeling + prompt tuning), and data analysts (scoring + analysis). Solo founders must wear all four hats.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly applicable to evaluating our orchestrator's agent performance, comparing tool configurations, and catching regressions. The agentic-vs-vector search eval is exactly the kind of experiment we should run on our own agent pipelines. BrainTrust itself is an observability platform worth evaluating alongside Langfuse. |
| **Actionable** | 7/10 | The four-part eval framework (dataset/task/scorer/experiment) is immediately adoptable. The production-logs-to-dataset flywheel pattern is actionable for any AI product. The Claude Code subprocess tracing fix (parent span IDs as env vars) is a concrete technique for our tmux agent observability. |

---

## Summary

Jess from BrainTrust presents a practitioner's guide to evaluating coding agents, splitting the talk into two halves: eval fundamentals and a real-world case study comparing agentic search vs. vector search for code bug-fixing.

The fundamentals section establishes that evals exist to prevent "vibe-based shipping" — deciding to deploy AI features because someone tried a few prompts and it "looked good." Jess references OpenAI's April 2025 model revert (where helpfulness training made the model too agreeable) as a cautionary tale. She breaks evals into four components: datasets (golden cases, edge cases, failure modes), tasks (prompt + model config), scorers (deterministic, LLM-as-judge, human review), and experiment runs. BrainTrust's "Loop" feature lets users query experiment results in natural language, which Jess endorses for debugging long multi-turn traces where manual inspection fails.

The case study compares agentic search (Claude Code's native grep/find/read tools) against vector search (embeddings stored in Pinecone, queried by similarity) on two datasets: 25 Django bugs from SWE-bench Verified and 10 TypeScript-Go bugs from Microsoft's repo. The experiment design is methodical — for TypeScript-Go, they pulled merged PRs with "fix" in the title, checked out parent commits to create known-buggy states, and used Claude to synthesize bug descriptions. Scoring was binary: did the fix pass the repo's test suite?

Results: agentic search scored 68% vs. vector search's 60% on SWE-bench, and both tied at 70% on TypeScript-Go — but vector search consumed dramatically more tokens and cost. The root cause: vector search returns code chunks without surrounding context (imports, type defs, call chains), forcing the agent into expensive guess-and-check loops. One vector-search run made 26 separate search calls. Agentic search follows references like a human developer — read function, trace imports, follow call chain — converging faster.

Jess is transparent about the eval's limitations: she'd want multiple trials per task (LLM non-determinism could swing results 10-15%), a better vector search implementation (chunk overlapping, retrieval models), a hybrid approach, and a larger dataset. She explicitly states she wouldn't publish a blog post about these results yet — modeling good eval hygiene.

---

## Notable Quotes

> "I have been in legitimate calls where teams have told me that they've shipped AI features either because the engineering team told them that it was ready or a PM tried a couple of prompts and they said it looked good. That's very problematic — you're essentially making ship decisions based off of vibes." — 01:12:28

> "Vector search gave the agent a lot of proximity to relevant code but didn't give the connective tissue between the code for it to actually implement a fix." — 01:33:02

> "I don't consider this eval close to being done at all. Like I would not publish a blog post about this yet. [...] I would not be surprised if I ran this eval multiple times with all the exact same criteria that it might have a difference of 10 to 15%." — 01:34:00

> "Evals are a team sport." — 01:20:24

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://braintrust.dev | BrainTrust platform — observability + eval tooling; competitor/complement to Langfuse in our stack | `/tool-catalogue` |
| Cursor article on semantic search (mentioned but URL not given) | Cursor's blog post about using semantic/agentic search to improve their coding agent — referenced as the inspiration for the eval | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| BrainTrust | Speaker's company; observability + eval platform with Loop (NL querying of experiments) and SDK for production logging | No — consider `/tool-catalogue https://braintrust.dev` |
| Claude Code | Used as the agentic search baseline; its grep/find/read tools = agentic search by default. `--disallow-tools` flag used to block agentic search in the vector variant | Referenced in multiple catalogue entries |
| SWE-bench Verified | Industry standard benchmark for coding agents; Django subset used as dataset | Referenced in [Augment Code](../../agent-harnesses/augment-code.md) |
| Pinecone | Vector database used for the vector search implementation | No |
| Langfuse | Not mentioned directly but BrainTrust is a direct competitor | Yes — [Langfuse](../../observability/langfuse.md) |
| Cursor | Referenced for their blog post about semantic search improving coding agent performance | Yes — [Cursor](../../developer-gui/cursor.md) |
| TypeScript-Go (Microsoft) | Microsoft's repo used as one of the two eval datasets | No (repo, not tool) |

---

## Action Items

- [ ] Evaluate BrainTrust as observability/eval platform alongside Langfuse — key differentiator is Loop (NL experiment querying) and native eval framework
- [ ] Adopt the four-part eval framework (dataset/task/scorer/experiment) for testing orchestrator agent configurations
- [ ] Investigate Claude Code's `--disallow-tools` flag for controlled agent experiments — useful for A/B testing different tool configurations
- [ ] Consider building a production-logs-to-dataset pipeline for any AI-facing product we ship
- [ ] The subprocess tracing pattern (passing parent span IDs as env vars) may solve our tmux agent trace orphaning problem
