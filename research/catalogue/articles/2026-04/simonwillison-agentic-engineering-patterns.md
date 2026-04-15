# Agentic Engineering Patterns

> **Simon Willison — simonwillison.net, 2026-02-23**

| Field | Value |
|-------|-------|
| Source | https://simonwillison.net/guides/agentic-engineering-patterns/ |
| Author | Simon Willison |
| Publication | Simon Willison's Weblog |
| Date | 2026-02-23 |
| Topics | agentic engineering, coding agents, Claude Code, vibe coding, TDD, subagents, token caching, tool-calling, code quality, prompt engineering |
| Read Time | 15 min (guide hub — links to 20+ sub-pages) |

---

## Burak's Notes

> *This is the definitive practitioner's guide to working with coding agents, written by one of the most credible voices in the space. The key distinction Simon draws — agentic engineering vs. vibe coding — is exactly the line we walk with the orchestrator. Vibe coding is throwing prompts at an LLM and hoping; agentic engineering is structured, test-driven, review-gated agent work. The "knowledge hoarding" principle (accumulate reusable patterns that agents recombine) maps directly to our CLAUDE.md and agent persona file approach. The subagent patterns (parallel and specialist) are what our tmux worker model implements. The red/green TDD pattern for agents is something we should enforce more rigorously in our worker prompts.*

---

## Key Takeaways

1. **Agentic Engineering vs. Vibe Coding** — Simon draws a sharp distinction between disciplined agent-assisted development (agentic engineering) and undirected prompt-and-pray coding (vibe coding). Agentic engineering is a deliberate methodology with structure, testing, and review gates. This framing legitimizes the practice while setting quality expectations.

2. **"Writing Code Is Cheap Now"** — The economics of code production have shifted. The scarce resource is no longer typing speed or syntax knowledge — it's judgment about what to build, code review quality, and architectural decisions. Developers must build new habits focused on quality over quantity.

3. **Knowledge Hoarding as a Core Practice** — Developers should accumulate reusable techniques, code patterns, and prompt strategies that agents can recombine effectively. This is the human-side moat: the accumulated library of patterns and context that makes agent output high-quality rather than generic.

4. **Subagent Architecture (Parallel + Specialist)** — The guide covers subagent patterns including parallel execution (multiple agents working simultaneously on independent tasks) and specialist configurations (agents with focused domain expertise). This validates multi-agent orchestration as a recognized pattern.

5. **Red/Green TDD for Agents** — Run tests first, let the agent see them fail, then have it write code until tests pass. This is the most reliable quality gate for agent-generated code. The test suite becomes the specification language that agents understand better than prose requirements.

6. **Anti-Pattern: Inflicting Unreviewed Code** — Simon explicitly warns against pushing agent-generated code without review. The social contract of collaborative development still applies — code review is non-negotiable regardless of whether a human or agent wrote the code.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly describes the patterns our orchestrator implements — subagents, parallel workers, test-driven quality gates, structured prompting. Simon's framework is the theoretical backing for our tmux-based agent orchestration. |
| **Actionable** | 8/10 | Knowledge hoarding principle should inform our CLAUDE.md and agent prompt structure. Red/green TDD pattern should be enforced in worker agent prompts. The guide's 20+ sub-pages contain implementable techniques. |

---

## Summary

Simon Willison's guide is structured as a hub page linking to 20+ detailed sub-pages covering the full spectrum of working with coding agents. Rather than a single linear article, it's a living reference organized into five major sections: Principles, Working with Coding Agents, Testing & Quality, Code Understanding, and Annotated Prompts.

The Principles section establishes the philosophical foundation. "Agentic engineering" is positioned as a deliberate discipline distinct from "vibe coding" — the former involves structured prompting, test-driven development, and rigorous review; the latter is undirected experimentation. The key economic insight is that writing code is now cheap, so the value shifts to judgment, architecture, and quality control. Simon introduces "knowledge hoarding" — the practice of building a personal library of reusable patterns, techniques, and prompt strategies that make agent output consistently better.

The technical sections cover LLM architecture fundamentals (chat templates, token caching, tool-calling), git integration strategies for agent workflows, and subagent patterns. Subagents are categorized as parallel (multiple independent workers) and specialist (domain-focused agents with tailored context). This maps directly to multi-agent orchestration systems.

Testing receives dedicated treatment. The red/green TDD methodology — let the agent see failing tests, then iterate until they pass — is presented as the most reliable quality gate. The guide also covers agentic manual testing with browser automation, bridging the gap between unit tests and visual/integration verification.

Code understanding techniques include linear walkthroughs (using tools like Showboat and Present) and interactive explanation sessions. The annotated prompts section provides concrete examples, including a GIF optimization tool built with WebAssembly/Gifsicle.

The guide is intentionally a living document that grows as patterns mature, making it a long-term reference rather than a snapshot.

---

## Notable Quotes

> "Writing code is cheap now." — on the fundamental economic shift

> Warns against "inflicting unreviewed code on collaborators" — the social contract of code review applies regardless of code origin

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/ | The introductory blog post that launched the guide — contains Simon's framing and motivation | `/ingest-article` |
| https://simonwillison.net/tags/ai-assisted-programming/ | Simon's full archive of AI-assisted programming posts — rich source of practitioner patterns | `/practitioner-profile` |
| https://simonwillison.net/tags/claude-code/ | Simon's Claude Code-specific posts — likely contains direct experience reports relevant to our stack | `/practitioner-profile` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary coding agent platform discussed throughout the guide | Referenced across catalogue |
| OpenAI Codex | Alternative coding agent covered alongside Claude Code | Not yet catalogued |
| Showboat | Documentation and code walkthrough tool; used for linear explanations and testing | Not yet catalogued |
| Present | Code explanation tool; used for interactive understanding sessions | Not yet catalogued |
| Gifsicle (WebAssembly) | Used in annotated prompt example for GIF optimization | Not yet catalogued |

---

## Action Items

- [ ] Enforce red/green TDD pattern in orchestrator worker prompts — agents should always see failing tests before writing implementation code
- [ ] Adopt "knowledge hoarding" principle: systematically extract reusable patterns from successful agent sessions into CLAUDE.md or dedicated pattern files
- [ ] Deep-read the subagent sub-pages for parallel and specialist patterns that could improve our tmux worker spawning strategy
- [ ] Review the annotated prompts section for concrete prompt engineering techniques applicable to our worker agent instructions
