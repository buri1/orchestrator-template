# Introducing the Letta Code App

> **Letta (@letta-ai) — YouTube, 2026-04-06**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=oet9f6d5g_k |
| Speaker | Letta team (Charles Packer et al.) |
| Event | Letta YouTube Channel |
| Duration | ~10:00 (estimated) |
| Date | 2026-04-06 |
| Topics | agent-memory, stateful-agents, model-agnostic-harness, coding-agent, memory-first, terminal-bench, skill-learning, context-engineering |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **Memory-first architecture decouples identity from model provider** -- Letta Code persists agent memory, personality, and learned context independently of the LLM backend. You can switch between Claude Opus, GPT/Codex, Gemini, GLM, and Kimi mid-session without losing any context. This is the inverse of Claude Code / Codex CLI where memory is tied to the provider's session model.

2. **Persistent agents that learn across sessions replace disposable conversations** -- Instead of starting fresh each time, each Letta Code session attaches to a long-lived agent that accumulates codebase knowledge. The `/init` command does deep codebase research and forms initial memory; `/remember` triggers explicit reflection and learning. Memory subagents periodically review sessions to refactor and refine stored information.

3. **Skill learning creates reusable agent capabilities** -- Agents can extract patterns from coached experiences into versioned, reusable skills (e.g., DB migrations, API change best practices, PostHog CLI dashboards). Users can also install skills from external links. This is a formalized version of the progressive-disclosure skill pattern.

4. **#1 on Terminal-Bench among model-agnostic open-source harnesses** -- Letta Code's performance is comparable to provider-specific harnesses (Claude Code, Gemini CLI, Codex CLI) while being fully model-agnostic. It significantly outperforms Terminus 2, the previous leading model-agnostic option. This validates that harness engineering can close the gap with provider-native tools.

5. **Import from existing Claude Code / Codex sessions** -- The `/init` command can load memory from past Claude Code or Codex sessions, creating a migration path rather than a cold start. This lowers switching cost and positions Letta Code as a unifying layer on top of existing agent workflows.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses agent memory persistence, multi-model portability, and harness engineering -- all core to our orchestrator vision. The model-agnostic approach validates our architecture principle of separating orchestration from model provider. Skill learning and memory subagents are patterns we should evaluate. The Terminal-Bench benchmarking approach is useful for comparing our own harness performance. |
| **Actionable** | 7/10 | The `/init` codebase research pattern, skill extraction workflow, and memory subagent concept are immediately evaluable. The model-portability claim needs validation against our multi-provider routing needs. Installation is trivial (`npm install -g @letta-ai/letta-code`). Apache-2.0 license allows commercial use. However, dependency on Letta API server introduces an external service dependency we'd need to evaluate. |

---

## Summary

This video introduces Letta Code, a terminal-based coding agent harness built on the principle that agent memory should be a first-class, persistent concern rather than an afterthought. The core thesis is that coding agents should be "long-lived" -- accumulating codebase knowledge, learned skills, and personality across sessions rather than starting from scratch each time.

Letta Code is built on top of the Letta API (evolved from the MemGPT project, which pioneered the "LLM operating system" concept with self-editing memory blocks). The harness decouples agent identity and memory from the underlying model provider, enabling users to switch between Claude Sonnet/Opus, GPT/Codex, Gemini, GLM, Kimi, and other models -- even mid-session -- without losing context. This is architecturally distinct from provider-specific harnesses like Claude Code or Codex CLI.

The memory system uses agentic context engineering: memory blocks that agents rewrite as system prompts, with memory subagents that periodically review and refine stored information. The `/init` command performs deep codebase analysis to bootstrap agent knowledge, while `/remember` triggers explicit reflection. The `/doctor` command allows users to organize and clean up accumulated memories. Skills are extractable, versioned, and installable from external sources.

On benchmarks, Letta Code ranks #1 among model-agnostic open-source coding harnesses on Terminal-Bench, with performance comparable to provider-specific tools. The application is available as a desktop app (macOS, Windows, Linux) and as an npm CLI package. The GitHub repo has 2.1K stars (letta-code) with the parent Letta platform at 19K stars. Licensed under Apache-2.0.

---

## Notable Quotes

> "Rather than working in independent sessions, each session is tied to a persisted agent that learns." -- Core product thesis

> "Letta Code decouples your agent's memory and identity from the underlying model provider." -- On model portability

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/letta-ai/letta-code | 2.1K stars; Apache-2.0 memory-first coding harness; TypeScript; reference implementation of persistent agent memory | `/ingest-post` |
| https://www.letta.com/blog/letta-code | Technical deep dive on memory architecture, skill learning, and Terminal-Bench results | `/ingest-article` |
| https://www.letta.com/blog/letta-v1-agent | "Rearchitecting Letta's Agent Loop: Lessons from ReAct, MemGPT, & Claude Code" -- agent loop design lessons | `/ingest-article` |
| https://www.tbench.ai/ | Terminal-Bench -- the benchmark used to evaluate coding harnesses across model providers | `/ingest-post` |
| https://docs.letta.com/letta-code | Official documentation for Letta Code setup, memory commands, skill learning | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Letta / MemGPT | Parent platform; "LLM-as-OS" self-editing memory architecture | Yes -- [agent-memory/letta.md](../agent-memory/letta.md) (6/10) |
| Claude Code | Referenced as provider-specific harness comparison; `/init` can import Claude Code sessions | Yes -- extensively catalogued |
| Codex CLI | Referenced as provider-specific comparison; import path supported | Yes -- catalogued |
| Gemini CLI | Referenced as provider-specific benchmark comparison | Yes -- catalogued |
| Terminal-Bench | Benchmark used to rank coding harnesses across model providers | Not yet catalogued -- consider `/tool-catalogue` |
| Terminus 2 | Previous leading model-agnostic harness; significantly outperformed by Letta Code | Not yet catalogued |

---

## Action Items

- [ ] Install Letta Code (`npm install -g @letta-ai/letta-code`) and test the `/init` command on a real project
- [ ] Evaluate the memory subagent pattern -- can we adopt periodic memory refactoring in our orchestrator?
- [ ] Compare Letta Code's model-agnostic performance claims against our own multi-model routing results
- [ ] Investigate Terminal-Bench as a benchmark for evaluating our harness configurations
- [ ] Assess the Letta API dependency -- is self-hosting viable for production use?
- [ ] Review the skill extraction workflow for potential adoption in our skill/command architecture
- [ ] Update our existing Letta catalogue entry (agent-memory/letta.md) to reflect Letta Code as a major evolution
