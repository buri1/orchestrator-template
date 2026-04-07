# Agentic Engineering & Multi-Agent Systems in Practice

> **Jonas & Jörg — YouTube Live Session, 2026-03**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=SC5EI2_Sgvw |
| Speaker | Jonas & Jörg |
| Event | YouTube Live Session / Podcast |
| Duration | ~02:11:00 |
| Date | 2026-03 |
| Topics | Agentic Engineering, Vibe Coding, Multi-Agent Systems, Claude Code, Codex, Local LLMs |

---

## Burak's Notes

> *Great real-world comparison of Claude Code vs Codex workflows. The discussion on using "Gadget" (project management wrapper for Claude Code) vs "Superpowers" (TDD framework for Codex) validates our architectural focus on structured backpressure and task decomposition. Their observation that "Vibe Coding" breaks down due to context loss and data drift perfectly aligns with our findings on the necessity of multi-agent architectures and strict context boundaries.*

---

## Key Takeaways

1. **Agentic Engineering > Vibe Coding**: Real software requires separating tasks into distinct lifecycle phases (planning, research, execution, verification). Letting a single agent do everything leads to context pollution and "data drift".
2. **Frameworks Provide Necessary Structure**: Tools like the "Gadget" skill for Claude Code enforce Agile/Scrum-like project planning (creating markdown backlogs and step-by-step roadmaps) *before* writing code, which prevents hallucinations and lost requirements.
3. **Local Compute is Viable but Slow**: Apple Silicon (Mac Studio / MacBook with 64GB+ RAM) enables running models like Qwen 3.5 or DeepSeek locally for privacy and cost savings, but token throughput (~60-80 tokens/sec) limits swarm scalability compared to cloud APIs.
4. **Context Windows are the Primary Bottleneck**: Even with massive context windows (like Claude's 200k+), agents degrade ("data drift") if the context isn't periodically cleared. Best practice is to save state to the filesystem and restart the agent context per phase.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly discusses multi-agent orchestration, Claude Code vs Codex harness patterns, and context engineering to solve data drift. |
| **Actionable** | 8/10 | Validates the use of explicit state-saving (markdown plans) and specialized sub-agents. The "Superpowers" TDD approach is highly relevant for our implementation strategy. |

---

## Summary

In this live coding podcast, Jonas and Jörg compare their approaches to building AI-generated software. They demonstrate building a local energy price dashboard, using this practical example to contrast two multi-agent setups: Claude Code augmented with project-management skills (like "Gadget") and OpenAI Codex augmented with TDD-focused skills ("Superpowers").

A major theme of the discussion is the transition from simple "vibe coding" to true "agentic engineering." They identify that the biggest point of failure in current AI development is context loss and "data drift"—where a single agent running in a long loop forgets earlier architectural decisions or hallucinates due to a polluted context window. To solve this, they advocate for a multi-agent approach where specific sub-agents (e.g., Researcher, Planner, Developer, Verifier) are spawned with narrow, specialized prompts.

They also touch on the economics and infrastructure of AI engineering. While cloud APIs are incredibly fast, flat-rate subscriptions (like Claude Max) provide massive cost advantages for heavy daily users (processing millions of tokens). Alternatively, they explore the viability of local execution on high-RAM Apple Silicon devices, concluding that while it offers unmatched privacy and zero operational cost, the token throughput currently limits the speed of highly parallelized "swarm" execution.

---

## Notable Quotes

> "Agentic Engineering kommt dem eigentlichen Softwareentwicklungsprozess relativ nahe. Der große Unterschied dabei ist aber, dass nicht ein oder mehrere Entwicklungsteams die Software umsetzen und bauen, sondern eben Agenten... Multiagentensysteme." — 02:41

> "Das Hauptproblem beim Vibecoding... ist halt dieser Kontextverlust. Ja, also auch bei den größten, besten, tollsten Modellen vergisst du dann irgendwann, wie er die Architektur baut." — 01:59:15

> "Und das sind so bewährte Methoden... So klassische Sachen aus dem Software Engineering wie Test Driven Development, CICD Pipelines, Integration Tests bis hin zu End Tests mit UI Validierung. M LMMs zwar immer noch Fehler, aber über die Pipeline fange ich diese Fehler ab, bevor sie Schaden anrichten." — 02:04:25

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| N/A | No external URLs were provided in the transcript snippet. | N/A |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Used by Jonas as the primary base CLI for his agentic workflow. | [Yes](./../agent-harnesses/everything-claude-code.md) |
| OpenAI Codex | Used by Jörg as his primary development harness. | [Yes](./../agent-harnesses/openai-codex.md) |
| "Gadget" / gadget-done | A skill used with Claude Code that enforces project planning and agile methodologies before coding. | Not yet catalogued — consider /tool-catalogue |
| Superpowers | A skill/framework used with Codex that enforces Test-Driven Development (TDD) and iterative review. | [Yes](./../agent-harnesses/superpowers.md) |
| OpenClaw | Mentioned as an orchestration framework. | [Yes](./../orchestration-platforms/openclaw.md) |
| Qwen 3.5 | Run locally by Jonas for zero-cost, private AI tasks. | Not yet catalogued |

---

## Action Items

- [ ] Evaluate the `gadget-done` (or similar project management) skill for Claude Code to see if it improves our planning phase reliability.
- [ ] Experiment with explicitly clearing the context window between planning and execution phases in our orchestrator to prevent data drift.
- [ ] Review the `Superpowers` TDD patterns for integration into our own testing pipelines.
