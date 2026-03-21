# Slate: moving beyond ReAct and RLM

> **Random Labs Team — randomlabs.ai, 2026-03-09**

| Field | Value |
|-------|-------|
| Source | [randomlabs.ai/blog/slate](https://randomlabs.ai/blog/slate) |
| Author | Random Labs Team |
| Publication | Random Labs Blog |
| Date | 2026-03-09 |
| Topics | agent architecture, thread weaving, episodic memory, context engineering, working memory, compaction, task decomposition, expressivity, single-threaded agents |
| Read Time | ~20 min |

---

## Burak's Notes

> *Shared via WhatsApp. This is a dense technical report from Random Labs introducing "Slate" -- a thread-based episodic memory architecture for single-threaded coding agents. The core insight is that frequent, bounded synchronization between an orchestrator thread and worker threads gives a usable balance of speed, latency, and intelligence. Their "thread weaving" pattern -- where an orchestrator dispatches bounded worker threads that return compressed "episodes" rather than raw message-passing -- is architecturally relevant to our L-Thread Orchestrator. The taxonomy comparing ReAct, Markdown Plans, Task Trees, RLM, Devin/Manus/Altera, Claude Code/Codex, and Slate across 8 dimensions is genuinely useful reference material. Their claim that "single-threaded agents have not been solved fully" and "we do not need to move on to teams just yet" is a strong counter-position to the multi-agent trend. Available as `npm i -g @randomlabs/slate`.*

---

## Key Takeaways

1. **Thread weaving as a new primitive** -- Slate introduces "threads" as bounded workers that execute one action at a time and return compressed "episodes" (episodic memory) to the orchestrator. Unlike subagents which use message passing and run in full isolation, threads explicitly share context -- the orchestrator passes context in, episodes come back out, and one thread's episode can become another thread's input. This composability distinguishes it from naive subagent designs.

2. **Episodic memory solves compaction naturally** -- Each thread's completed action sequence generates a compressed episode retaining only important results, not the full tactical trace. This built-in completion boundary makes compaction a natural architectural property rather than a lossy afterthought. Episodes can be composed as inputs to downstream threads, enabling context routing without degradation.

3. **The strategy vs. tactics spectrum maps to AlphaZero** -- The report draws a deep analogy between software engineering and game-playing AI. Just as AlphaZero's value network handles positional judgment (strategy) while the policy network handles move selection (tactics), agent harnesses must support both strategic planning and tactical execution. Tactical concepts (material value) are learned first; strategic concepts (king safety, mobility) emerge later -- suggesting agents need different scaffolding at different capability levels.

4. **Expressivity is the critical harness design constraint** -- A harness with high expressivity enables many possible end states with few output operations. Rigid task trees and fixed decomposition graphs constrain expressivity and reduce the system's ability to react to new information. The report argues that maintaining general expressivity during execution is "incredibly important" and that strict planner/implementer/reviewer pipelines "will sort of work, but you're going to hate its guts."

5. **Knowledge overhang explains why planning helps** -- Models have latent knowledge they can't access tactically without tricks like "think step by step" or planning in files. This "knowledge overhang" is why markdown plans and chain-of-thought improve outcomes -- they force the model into knowledge retrieval before execution. The overhang shrinks as models improve through RL, but will likely always exist.

6. **OS kernel framing for agent architecture** -- Mapping to Karpathy's LLM OS: the orchestrator is the kernel, threads are isolated processes, episodes are process return values committed back to working memory (RAM). The filesystem/terminal/web are peripherals. Instead of letting RAM fill until the process crashes, each thread return is a natural garbage-collection opportunity.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 8/10 | Directly addresses our core architectural concerns: context management across long-horizon tasks, compaction quality, and the balance between strategic planning and tactical execution. Slate's thread-weaving pattern is a formalization of what we're doing with tmux+worktree workers that return compressed summaries. The taxonomy table comparing 7 agent architectures across 8 dimensions is the most comprehensive comparison we've seen. Their "single-threaded agents first" stance validates our current approach. The episodic memory model is a cleaner framing of our devlog/state handoff pattern. |
| **Actionable** | 7/10 | Three immediately actionable insights: (1) Adopt episode-based compression at worker completion boundaries instead of lossy compaction mid-session -- our orchestrator-handoff.sh could generate structured episodes rather than free-form summaries. (2) The expressivity analysis suggests we should resist adding rigid task-tree scaffolding and keep our implicit decomposition approach. (3) Cross-model composition via episode boundaries (Sonnet workers + Opus orchestrator) is validated by their empirical observation that "using Sonnet and Codex together across the same task works well." |

---

## Summary

This technical report from Random Labs introduces Slate, a thread-based episodic memory architecture for single-threaded coding agents that aims to move beyond ReAct and RLM (Recursive Language Models). The report systematically examines three compounding problems in modern LLM agents: long-horizon task execution, the balance between strategic and tactical reasoning, and working memory management.

The background section establishes that models cannot attend uniformly across their context window -- the "Dumb Zone" (coined by Dex Horthy) causes performance degradation as context grows, supported by Chroma's "Context Rot" research showing all four frontier models degrade non-uniformly on even simple tasks. The strategy/tactics distinction is explored through the AlphaZero lens, where McGrath et al. (PNAS 2022) showed tactical concepts emerge first in training (piece value by 32K steps), followed by strategic concepts (king safety, mobility at 32K-64K), with long-horizon tradeoff reasoning developing last.

The prior approaches section provides a rigorous taxonomy: (1) Compaction is "largely unsolved" and "notoriously bad" in Claude Code, with Amp handoffs being the most interesting variant. (2) Subagents isolate context but fail to transfer information across boundaries since they only return a response message. (3) Markdown planning introduces three failure modes: underspecified plans, incomplete execution, and failure to adapt to new information. (4) Direct task decomposition (e.g., ADaPT) trades flexibility for thoroughness via rigid task trees. (5) RLM offers high expressivity via Python REPL but suffers from blind N-step execution without intermediate feedback. (6) Devin/Manus/Altera use strategize-delegate-compress cycles where every compress boundary risks dropping critical state. (7) Claude Code/Codex use simple subagent delegation with message passing, which the authors believe is "incorrect" for current model behavior (though models will improve through training).

Slate's solution is the "thread" primitive: a general worker that executes one bounded action and pauses, returning compressed "episodes" to the orchestrator. Unlike purpose-specific subagents, threads are general workers serving the system's current intent. The orchestrator uses threads by reference, enabling complex context routing similar to RLM's REPL but without the rigidity. Thread weaving -- the pattern of dispatching threads, executing episodes, and composing them -- produces implicit, adaptive task decomposition without static plans. The system maps to Karpathy's LLM OS framing where the orchestrator is the kernel, threads are processes, and episodes are return values.

Notable observations include massively parallel thread execution in practical workflows and successful cross-model composition (Sonnet + Codex) across the same task via episode boundaries. Slate is available as `npm i -g @randomlabs/slate` in open beta, with a dashboard at dashboard.randomlabs.ai and docs at docs.randomlabs.ai.

Random Labs describes itself as "building LLM based systems for end to end software engineering" with a mission to create "general software agents and interfaces that allow engineers to maximally leverage them." They are actively hiring.

---

## Notable Quotes

> "We think single threaded agents have not been solved fully. As an industry, we do not need to move on to teams just yet."

> "The real bottleneck in long-horizon agentic tasks is context management, not model intelligence."

> "As a harness builder, your job is to design a harness where the system naturally expresses the desired behaviors."

> "It will sort of work, but you're going to hate its guts while using it. It's slow, clunky, and has a ton of inertia while working."

---

## Agent Architecture Taxonomy (from report)

| Aspect | ReAct | Markdown Plan | Task Trees | RLM | Devin/Manus/Altera | Claude Code/Codex | Slate |
|--------|-------|---------------|------------|-----|---------------------|-------------------|-------|
| Planning | implicit | file | explicit | REPL | planning agent | plan mode | implicit |
| Decomposition | none | none | direct tree | REPL functions | task based | subagent delegation | implicit |
| Synchronization | single thread | single thread | gated steps | REPL return | reduce & return | message passing | episodes |
| Intermediate feedback | per step | per step | on task failure | on execution | after compress | message passing | per episode |
| Context isolation | N/A | N/A | per subtask | per subcall | subagent | subagent | per thread |
| Context compaction | N/A | N/A | task based | REPL slicing | subagent compress | compaction | episode compress |
| Parallel execution | N/A | N/A | N/A | in REPL | Altera only | native | native |
| Expressivity | high | high | low | high | medium | medium | high |
| Adaptability | yes | yes if plan updated | no | yes | yes | limited by message passing | yes |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://docs.randomlabs.ai/ | Full documentation for Slate agent -- implementation details, DSL, thread API | article or tool-catalogue |
| https://research.trychroma.com/context-rot | "Context Rot" research by Chroma -- quantifies how frontier models degrade with input length; cited as key evidence | article |
| https://alexzhang13.github.io/blog/2025/rlm/ | RLM blog post -- Recursive Language Models, the architecture Slate claims to move beyond | article |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Slate | Primary subject -- thread-based episodic memory agent architecture from Random Labs | No |
| Claude Code | Referenced for "notoriously bad" compaction and simple subagent delegation | Yes |
| Codex (OpenAI) | Referenced for subagent delegation pattern and cross-model composition with Sonnet | Yes |
| Devin (Cognition) | Referenced for strategize-delegate-compress cycle | Yes (referenced) |
| Manus | Referenced for context engineering and compress-return pattern | Yes (referenced) |
| Altera / Shortcut | Referenced for PIANO architecture, Project Sid, async parallel execution | No |
| RLM | Recursive Language Models -- Python REPL as composition layer | No |
| ADaPT | As-needed decomposition and planning framework | No |
| AlphaZero / AlphaGo | Analogy for strategy vs tactics separation in architecture | N/A |
| Amp | Referenced for handoff mechanism as "crowd favorite" compaction approach | No |
| TerminalBench | Referenced for benchmarking minimal harnesses (Terminus, Simple Codex) | No |
| Chroma (Context Rot) | Research on context window degradation across frontier models | No |

---

## Action Items

- [ ] Study Slate's episode compression format for potential adoption in our orchestrator-handoff.sh (replace free-form summaries with structured episodes)
- [ ] Reference the 7-architecture taxonomy table when evaluating orchestrator design decisions
- [ ] Test `npm i -g @randomlabs/slate` to evaluate thread weaving in practice
- [ ] Consider adopting "episode boundary" as cross-model handoff point (Sonnet workers + Opus orchestrator)
- [ ] Track Random Labs -- small team with strong architectural thinking, actively hiring, could become significant player in agent tooling
