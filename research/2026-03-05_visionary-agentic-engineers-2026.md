# Visionary Practical Agentic Engineers (March 2026)

**Date:** 2026-03-05
**Research method:** 30+ web searches across YouTube, X/Twitter, GitHub, Substack, and general web
**Focus:** People who actually BUILD working multi-agent systems and share practical insights

---

## The Landscape

The term "agentic engineering" was coined by Andrej Karpathy on February 5, 2026, marking the one-year anniversary of "vibe coding" and signaling a shift toward structured, professional approaches to AI-assisted development. As of March 2026, the field has bifurcated into two camps: those who talk about agents and those who build orchestration systems that actually work. This document focuses exclusively on the latter.

Out of one hundred engineers entering 2026, ninety-eight will use AI coding tools, a handful will build custom agents, and only two will build the system that builds the systems. These are those two percent.

---

## Tier 1: The Architects (Building foundational systems others build on)

### 1. IndyDevDan (Dan Disler)
- **Handles:** @IndyDevDan (X/YouTube), [agenticengineer.com](https://agenticengineer.com), [github.com/disler](https://github.com/disler)
- **Key Projects:** Tactical Agentic Coding (TAC) course, IndyDevTools (agentic toolbox), single-file-agents
- **Core Philosophy:** "The prompt is the new fundamental unit of knowledge work & programming." Building systems that build systems. Agents should be useful abstractions chained into autonomous workflows.
- **What to Learn:** TAC goes beyond coding -- it teaches agent orchestration, parallel execution, and production deployment. His YouTube channel delivers practical techniques weekly (Mondays 8am CST). His "State of AI Coding" series tracks the exponential curve of capability.
- **Pi Orchestration Relevance:** His single-file-agents pattern maps directly to lightweight agent definitions. His TAC framework for chaining agents is conceptually aligned with the L-Thread orchestrator approach. His emphasis on Claude Code hooks is directly applicable.
- **Dotta Network Cross-ref:** Not found in dotta's following list, but operates in the same ecosystem.

### 2. Geoffrey Huntley
- **Handles:** @GeoffreyHuntley (X), [ghuntley.com](https://ghuntley.com)
- **Key Projects:** Ralph Wiggum Loop, Gas Town inspiration, Amp (Sourcegraph)
- **Core Philosophy:** "Context = malloc without free." Back pressure theory -- agents must have bounded context windows, and the orchestrator's job is managing that scarcity. Progress lives in files and git history, not in the LLM's memory.
- **What to Learn:** The Ralph Loop is THE primitive for iterative agent work -- a bash loop that feeds an AI's output back into itself until correct. Anthropic released an official Ralph Wiggum plugin for Claude Code. His back pressure hierarchy (system prompt > tools > conversation history) is fundamental to context engineering.
- **Pi Orchestration Relevance:** Ralph Loop is already the heartbeat pattern used in L-Thread orchestration. His back pressure framework directly informs how orchestrator agents manage context budgets.
- **Dotta Network Cross-ref:** YES -- in dotta's top 20 must-follow list.

### 3. Steve Yegge
- **Handles:** @Steve_Yegge (X), [steve-yegge.medium.com](https://steve-yegge.medium.com), [github.com/steveyegge/gastown](https://github.com/steveyegge/gastown)
- **Key Projects:** Gas Town (multi-agent orchestrator, ~189K LOC Go), Beads issue-tracking
- **Core Philosophy:** "Developer as factory operator managing agent swarms." Seven distinct agent roles (Mayor, Polecats, Refinery, Witness, Deacon, Dogs, Crew) working in parallel on rigs. Uses "Molecular Expression of Work" (MEOW) for granular task decomposition.
- **What to Learn:** Gas Town manages 20-30 parallel AI coding agents through structured hierarchy. His role-based architecture (7 roles) is the most ambitious public multi-agent coding system. Released January 1, 2026 -- the year's opening salvo.
- **Pi Orchestration Relevance:** Gas Town's role hierarchy (Mayor = orchestrator, workers = specialized agents) is directly analogous to the L-Thread pattern. MEOW task decomposition parallels the orchestrator's issue breakdown approach.
- **Dotta Network Cross-ref:** Not found in dotta's following, but heavily discussed in the same circles.

### 4. Peter Steinberger (steipete)
- **Handles:** @steipete (X, 410K followers), [github.com/steipete](https://github.com/steipete)
- **Key Projects:** OpenClaw (250K+ stars, built on Pi Agent), VibeTunnel, Peekaboo, claude-code-mcp. Joined OpenAI February 2026.
- **Core Philosophy:** "Polyagentmorous" -- 3-8 agents running in a terminal grid, human-as-hub, CLIs over MCPs. Keep it minimal, keep it fast, let the human be the orchestrator.
- **What to Learn:** Created the largest project built on Pi Agent, proving it can scale. His preference for CLIs over heavy MCP setups challenges the framework-heavy approach. His agent-scripts/AGENTS.MD is a reference for guiding agent behavior.
- **Pi Orchestration Relevance:** OpenClaw IS the proof that Pi Agent + orchestration works at massive scale. His Gateway/Brain/Memory/Skills/Heartbeat architecture validates the harness approach.
- **Dotta Network Cross-ref:** YES -- #3 in dotta's top 20.

### 5. Boris Cherny
- **Handles:** @bcherny (X, 297K followers), [howborisusesclaudecode.com](https://howborisusesclaudecode.com)
- **Key Projects:** Created Claude Code at Anthropic, Agent Teams, subagent architecture, /simplify and /batch commands
- **Core Philosophy:** "Subagents are about protecting context." Vanilla setups work; don't over-customize. Agent Teams remove the bottleneck of single-session communication -- teammates message each other directly.
- **What to Learn:** His workflow reveals that the creator of Claude Code uses a surprisingly vanilla setup. Key insight: subagents for side effects and context isolation, Teams for collaborative work. Code Simplifier subagent runs post-completion to clean up.
- **Pi Orchestration Relevance:** Defines what Claude Code can/can't do natively. Agent Teams (Opus 4.6) is the native competitor to external orchestration -- understanding its strengths and limitations is essential for knowing when to use L-Thread vs native.
- **Dotta Network Cross-ref:** YES -- #4 in dotta's top 20.

### 6. Mario Zechner
- **Handles:** @badlogicgames (X, 27K followers), [mariozechner.at](https://mariozechner.at), [github.com/badlogic/pi-mono](https://github.com/badlogic/pi-mono)
- **Key Projects:** Pi Agent (4 tools, 300+ models, TypeScript extensions), libGDX
- **Core Philosophy:** "If I don't need a feature, I won't build it." Minimal agent with only read/write/edit/bash tools + shortest system prompt. Anti-multi-agent by design -- no sub-agents baked in, everything via extensions.
- **What to Learn:** The power of constraint. Pi proves that a 4-tool agent can power a 250K-star project. His extensibility-via-TypeScript approach means the community builds multi-agent on top, not into the core.
- **Pi Orchestration Relevance:** Pi IS the foundation. Every orchestrator decision must respect Pi's minimalism. Building multi-agent orchestration on top of (not inside) Pi is the correct architectural choice.
- **Dotta Network Cross-ref:** YES -- #1 in dotta's top 20.

---

## Tier 2: The Orchestration Builders (Building specific orchestration tools and frameworks)

### 7. Nico Bailon (nicopreme)
- **Handles:** @nicopreme (X, 5K followers), [github.com/nicobailon](https://github.com/nicobailon)
- **Key Projects:** pi-messenger (multi-agent chat rooms), pi-subagents (async delegation), pi-mcp-adapter (lazy-loading proxy), pi-foreground-chains, pi-web-access, pi-interactive-shell
- **Core Philosophy:** Agents should talk to each other like in a chat room -- join, see who's online, reserve files, message in real-time. PRDs become dependency graphs executed in parallel waves.
- **What to Learn:** The most prolific Pi extension builder. His Crew feature turns PRDs into dependency graphs with parallel task waves. Status indicators (active/idle/away/stuck) with auto-generated status messages.
- **Pi Orchestration Relevance:** pi-messenger IS the multi-agent coordination layer for Pi. His work is the closest thing to what the L-Thread orchestrator does, but built as Pi extensions. P0 priority to adopt or fork.
- **Dotta Network Cross-ref:** YES -- #2 in dotta's top 20.

### 8. Charlie Holtz & Jackson de Campos
- **Handles:** @charliebholtz (X), @jacksondecampos
- **Key Projects:** Conductor (macOS app, YC S24), formerly Melty Labs
- **Core Philosophy:** "Building the human interface to AI organizations." Treat AI agents like a real engineering team -- parallel threads, automatic git worktree isolation, review by diff.
- **What to Learn:** Conductor is the polished commercial take on parallel coding agents. Used by engineers at Linear, Vercel, Notion, Stripe, and YC. Their UX for managing multiple agent sessions (scanning which are pending, complete, or stuck) is the reference for orchestrator dashboards.
- **Pi Orchestration Relevance:** Conductor's architecture (isolated worktrees per agent, review-by-diff) validates the same patterns used in L-Thread orchestration. Their commercial success proves the market.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 9. Prateek Karnal
- **Handles:** [pkarnal.com](https://pkarnal.com), Composio team
- **Key Projects:** Agent Orchestrator (open-sourced by Composio, Feb 2026)
- **Core Philosophy:** "You automated engineering and replaced it with bad project management." The orchestrator itself should be an AI agent that reads the codebase, decomposes features, assigns tasks, monitors progress, reads PRs, and makes routing decisions.
- **What to Learn:** Built 40K lines of TypeScript, 17 plugins, 3,288 tests in 8 days -- mostly by the agents the system orchestrates. Dual-layered architecture: Planner (decomposition) + Executor (tool interaction). Managed Toolsets dynamically route only necessary tool definitions per step.
- **Pi Orchestration Relevance:** The Planner/Executor split maps directly to the orchestrator/agent split in L-Thread. Managed Toolsets (dynamic tool routing) is a pattern to adopt for context efficiency.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 10. Reuven Cohen (ruvnet/Ruv)
- **Handles:** @ruvnet (GitHub), [claude-flow.ruv.io](https://claude-flow.ruv.io)
- **Key Projects:** Ruflo (formerly Claude Flow) -- 5,800+ commits, 55 alpha iterations, 215 MCP tools, 60+ agents, 8 AgentDB controllers
- **Core Philosophy:** Self-learning multi-agent systems. WASM kernels in Rust for policy engine and embeddings. "Ru" (from Ruv) + "flo" (from flow) = Ruflo.
- **What to Learn:** The most feature-dense agent orchestrator for Claude Code. v3.5 claims 84.8% SWE-Bench, 352x faster WASM execution, 75% API cost savings. SONA self-learning and RuVector vector DB. Anti-drift defaults prevent agents from going off-task.
- **Pi Orchestration Relevance:** Ruflo's anti-drift patterns, cost tracking, and self-learning capabilities are features to reference. The sheer scale (215 tools, 60+ agents) shows what maximum ambition looks like.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 11. can1357
- **Handles:** [github.com/can1357/oh-my-pi](https://github.com/can1357/oh-my-pi)
- **Key Projects:** oh-my-pi -- full Pi fork with LSP for 40+ languages, browser, subagents, git worktree isolation, memory system
- **Core Philosophy:** "Batteries-included" Pi. Agents should have built-in memory that extracts durable knowledge from past sessions. Includes 6 bundled agents: explore, plan, designer, reviewer, task, quick_task.
- **What to Learn:** oh-my-pi's memory pipeline runs in the background without blocking. Session management via /branch and /fork. The fork() function duplicates sessions while keeping the current conversation -- a compaction alternative.
- **Pi Orchestration Relevance:** oh-my-pi's 6-agent architecture (explore/plan/designer/reviewer/task/quick_task) is a reference for role definitions. Memory pipeline pattern is directly applicable to orchestrator state management.
- **Dotta Network Cross-ref:** Not found in dotta's following but referenced as a key Pi fork.

---

## Tier 3: The Thinkers Who Also Build (Frameworks, patterns, and codified knowledge)

### 12. Simon Willison
- **Handles:** @simonw (X), [simonwillison.net](https://simonwillison.net), [simonw.substack.com](https://simonw.substack.com)
- **Key Projects:** Agentic Engineering Patterns guide (Feb 2026), Datasette, llm CLI tool
- **Core Philosophy:** Document patterns as evergreen "guides" -- collections of chapters designed to be updated over time. Anti-patterns matter as much as patterns (e.g., "Inflicting unreviewed code on collaborators").
- **What to Learn:** His Agentic Engineering Patterns guide is the most systematic public documentation of what works and what doesn't. Published as living documents, not frozen blog posts. His systematic approach to knowledge capture is itself a pattern worth adopting.
- **Pi Orchestration Relevance:** His patterns directly inform how orchestrator agents should structure work. Anti-patterns provide guardrails for what the orchestrator should prevent.
- **Dotta Network Cross-ref:** Not found in dotta's following but universally cited.

### 13. Addy Osmani
- **Handles:** @addyosmani (X), [addyosmani.com](https://addyosmani.com), [addyo.substack.com](https://addyo.substack.com)
- **Key Projects:** "Conductors to Orchestrators" essay (Feb 2026, published by O'Reilly), "The Next Two Years of Software Engineering"
- **Core Philosophy:** Engineers evolve from Conductor (directing one agent sequentially) to Orchestrator (defining tasks for a fleet working in parallel). Human effort is front-loaded (writing specs) and back-loaded (reviewing output), not needed in the middle.
- **What to Learn:** The Conductor-to-Orchestrator framework is the clearest mental model for the evolution of AI-assisted development. His distinction between where human effort belongs (spec writing + review, not middle) directly informs orchestrator design.
- **Pi Orchestration Relevance:** The front-loaded/back-loaded effort model is exactly how L-Thread orchestration works: heavy planning phase, autonomous execution, review gate.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 14. Nicholas Zakas
- **Handles:** @slicknet (X), [humanwhocodes.com](https://humanwhocodes.com)
- **Key Projects:** ESLint creator, "From Coder to Orchestrator" essay (Jan 2026)
- **Core Philosophy:** The software engineering job of the future won't involve writing code; it will involve orchestrating AI agents. Single engineers will guide agents producing output equivalent to multiple engineers, creating "minimum viable engineering teams" (MVET).
- **What to Learn:** His MVET concept is critical: the smallest possible team where each engineer orchestrates multiple agents. IDEs evolve to manage agents, not edit code. His progression (2024: autocomplete, 2025: conductor, 2026: orchestrator) is the clearest timeline.
- **Pi Orchestration Relevance:** MVET validates the orchestrator pattern -- one human managing multiple agents. His prediction that IDEs become agent management interfaces aligns with where orchestration dashboards are heading.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 15. Harrison Chase
- **Handles:** @hwchase17 (X), [blog.langchain.com](https://blog.langchain.com)
- **Key Projects:** LangChain, LangGraph (24.8K GitHub stars, 34.5M monthly downloads), LangSmith, Deep Agents, Ambient Agents
- **Core Philosophy:** Three layers: LangChain (components), LangGraph (runtime with persistence/memory/human-in-loop), Deep Agents (orchestration above both). Ambient Agents listen to event streams and act on multiple events simultaneously.
- **What to Learn:** His "Ambient Agents" concept -- agents that listen to event streams rather than being explicitly invoked -- is a paradigm shift. LangGraph's approach to persistence and checkpointing is the most battle-tested in production. The Deep Agent concept (above both framework and runtime) maps to orchestrator-level thinking.
- **Pi Orchestration Relevance:** LangGraph's PostgresSaver and message bus patterns are reference architectures for orchestrator state management. Ambient Agent pattern could transform how orchestrator agents monitor codebases.
- **Dotta Network Cross-ref:** Not found in dotta's following directly, but LangGraph is referenced in the frameworks section.

### 16. Dexter Horthy (dex)
- **Handles:** @dexhorthy (X), [github.com/humanlayer](https://github.com/humanlayer)
- **Key Projects:** HumanLayer (YC F24), Advanced Context Engineering for Coding Agents, CodeLayer IDE, 12 Factor Agents
- **Core Philosophy:** "Everything is context engineering." Research - Plan - Implement pattern where each step provides the subsequent step with only the exact context needed. "Frequent intentional compaction" -- design entire workflow around context management, keep utilization at 40-60%.
- **What to Learn:** His techniques handle 300K LOC Rust codebases, ship a week's worth of work in a day, and maintain quality that passes expert review. The 40-60% context utilization target is a concrete, actionable metric. His spec-first development approach eliminates the back-and-forth prompting trap.
- **Pi Orchestration Relevance:** Context engineering IS the bottleneck for multi-agent orchestration. His 40-60% utilization rule should be built into orchestrator agent spawning logic. Frequent intentional compaction maps to the orchestrator's handoff/compact patterns.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 17. Muratcan Koylan
- **Handles:** @koylanai (X, 18K followers), [muratcankoylan.com](https://muratcankoylan.com)
- **Key Projects:** Agent Skills for Context Engineering (10K+ GitHub stars), three-tier context framework, progressive disclosure patterns
- **Core Philosophy:** Context windows are constrained by attention mechanics, not raw token capacity. The goal is finding the smallest possible set of high-signal tokens. Three tiers of increasing complexity for skill organization.
- **What to Learn:** His modular approach teaches agents to manage attention budgets across system prompts, tools, history, and documents. Progressive disclosure minimizes context pollution -- skills are referenced by name but loaded only when invoked.
- **Pi Orchestration Relevance:** Progressive disclosure pattern is directly applicable to orchestrator tool loading. Attention budget management across tiers maps to how the orchestrator should allocate context to spawned agents.
- **Dotta Network Cross-ref:** YES -- #9 in dotta's top 20.

---

## Tier 4: The Framework Visionaries (Pushing boundaries of multi-agent architecture)

### 18. Joao Moura
- **Handles:** @joaborai (X), [github.com/joaomdmoura](https://github.com/joaomdmoura)
- **Key Projects:** CrewAI (44.3K GitHub stars, 5.2M monthly downloads, 60% of US Fortune 500)
- **Core Philosophy:** Role-based agent teams with clear task ownership. Moving from open-source framework to enterprise platform for managing "crews" of agents carrying out routine workflows.
- **What to Learn:** CrewAI proved that role-based multi-agent systems work at enterprise scale. The agent-as-crew-member metaphor resonates because it maps to how humans already think about teamwork. His transition from OSS to enterprise platform shows the commercialization path.
- **Pi Orchestration Relevance:** CrewAI's role definitions (with backstory, goal, and tools per agent) are a reference pattern for orchestrator agent configurations.
- **Dotta Network Cross-ref:** Not found in dotta's following directly.

### 19. Kye Gomez
- **Handles:** @KyeGomezB (X), [github.com/kyegomez/swarms](https://github.com/kyegomez/swarms), [swarms.ai](https://swarms.ai)
- **Key Projects:** Swarms framework (enterprise multi-agent orchestration), 8+ agent topologies, AgentRearrange with einsum-like syntax
- **Core Philosophy:** Scale-first thinking -- 45 million agents operated. 8+ topologies (sequential, parallel, hierarchical, mesh, etc.) with a SwarmRouter that selects the right topology per task. Dropped out of high school, built it in 3 years.
- **What to Learn:** Swarms' topology catalog is the most comprehensive reference for multi-agent coordination patterns. AgentRearrange syntax (einsum-inspired) for specifying agent coordination is uniquely expressive. The SwarmRouter concept (auto-selecting topology) is ahead of the curve.
- **Pi Orchestration Relevance:** When scaling beyond 5 agents, Swarms' topology patterns become essential reference material. The SwarmRouter auto-selection concept could evolve into orchestrator-level intelligence about which agent configuration to use.
- **Dotta Network Cross-ref:** Referenced as @swarms_corp in dotta's top 20 (#12).

### 20. Victor Dibia
- **Handles:** [victordibia.com](https://victordibia.com), [github.com/victordibia](https://github.com/victordibia)
- **Key Projects:** AutoGen (54.6K GitHub stars), AutoGen Studio, LIDA, Microsoft Agent Framework (AutoGen + Semantic Kernel merger), "Designing Multi-Agent Systems" book
- **Core Philosophy:** "10 Reasons Your Multi-Agent Workflows Fail" -- production multi-agent systems need explicit failure mode cataloging. The merger of AutoGen + Semantic Kernel into Microsoft Agent Framework represents the convergence of simple abstractions with enterprise features.
- **What to Learn:** His "10 reasons multi-agent workflows fail" talk is essential viewing for anyone building production systems. AutoGen Studio (low-code prototyping) demonstrates that orchestration needs visual tools, not just code. His book is the most comprehensive treatment of multi-agent system design.
- **Pi Orchestration Relevance:** His failure mode catalog should be built into orchestrator guardrails. The AutoGen + Semantic Kernel merger pattern (simple abstractions + enterprise features) parallels how L-Thread sits on top of Pi.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 21. Matt Shumer
- **Handles:** @MattShumer_ (X), [shumer.dev](https://shumer.dev)
- **Key Projects:** HyperWrite/OthersideAI, Shumer Capital (angel investor in AI infra), "Something Big Is Happening" viral essay (20M+ views, Feb 2026)
- **Core Philosophy:** February 5, 2026 was a "psychological breakpoint" -- GPT-5.3-Codex and Claude Opus 4.6 changed what agents can reliably attempt. "GPT-5.3-Codex is our first model that was instrumental in creating itself." Ships fast, shares what he learns, invests in what he builds.
- **What to Learn:** His viral essay crystallized the moment when agent capability crossed a threshold. His angel investing portfolio in AI infra, dev tools, and agent-native products at pre-seed/seed signals where the market is heading.
- **Pi Orchestration Relevance:** His thesis that February 2026 models fundamentally changed agent reliability is the backdrop for all orchestration work. If agents are now reliable enough, orchestration becomes the bottleneck, not capability.
- **Dotta Network Cross-ref:** Not found in dotta's following.

### 22. Yohei Nakajima
- **Handles:** @yaborat (X), [yoheinakajima.com](https://yoheinakajima.com), [github.com/yoheinakajima](https://github.com/yoheinakajima)
- **Key Projects:** BabyAGI (first open-source autonomous agent with task planning, 2023), BabyAGI-2o (self-building agent), Untapped Capital (VC)
- **Core Philosophy:** Autonomous agents should plan, execute, and prioritize in a loop using LLMs + vector memory. The simplest self-building general autonomous agent. Started the entire wave in March 2023.
- **What to Learn:** BabyAGI's architecture (task creation, execution, prioritization loop) is foundational to every orchestrator built since. His VC perspective means he evaluates agent systems from both builder and investor angles.
- **Pi Orchestration Relevance:** BabyAGI's loop is the ancestor of every Ralph Loop and heartbeat pattern. Understanding the origin illuminates the design space.
- **Dotta Network Cross-ref:** Not found in dotta's following.

---

## Tier 5: Rising Builders and Specialists

### 23. Xiao Hong (Manus AI)
- **Handles:** Manus.im, Butterfly Effect Pte Ltd
- **Key Projects:** Manus (general AI agent, acquired by Meta for ~$2B), Monica.ai (10M+ users)
- **Core Philosophy:** Multi-agent architecture with specialized sub-agents (planning, retrieval, code generation, tool execution, verification) coordinated by an orchestration layer. Context engineering is THE discipline -- published "Context Engineering for AI Agents: Lessons from Building Manus."
- **Relevance:** Manus's context engineering lessons are directly applicable. Their multi-agent coordination patterns at production scale with millions of users prove these architectures work.

### 24. Numman Ali
- **Handles:** @nummanali (X, 9K followers), [github.com/numman-ali](https://github.com/numman-ali)
- **Key Projects:** OpenSkills (universal skills loader, works across Claude Code/Cursor/Codex), n-skills marketplace, AGENTS.md adoption champion (20K+ repos)
- **Core Philosophy:** Vendor-agnostic skill formats. SKILL.md as universal skill format, AGENTS.md as universal discovery file, OpenSkills as universal installer. Progressive disclosure to minimize context pollution.
- **Relevance:** OpenSkills infrastructure enables agent-native development across platforms. Progressive disclosure (skills referenced by name, loaded only when invoked) is a core pattern for orchestrator efficiency.
- **Dotta Network Cross-ref:** YES -- #13 in dotta's top 20.

### 25. Armin Ronacher (mitsuhiko)
- **Handles:** @maboroshi (X), [lucumr.pocoo.org](https://lucumr.pocoo.org), [github.com/mitsuhiko](https://github.com/mitsuhiko)
- **Key Projects:** Flask creator, left Sentry after a decade, "A Language For Agents" essay (Feb 2026), Syntax podcast on Pi with Mario Zechner
- **Core Philosophy:** Agents need their own language -- not just prompts but structured interaction patterns. Pi is "a glimpse into the future of software."
- **Relevance:** His essay on agent languages pushes thinking beyond prompts toward structured agent communication protocols. His collaboration with Mario Zechner on Pi gives insider perspective.
- **Dotta Network Cross-ref:** Referenced in steipete's collaborator network.

### 26. dotta
- **Handles:** @dotta (X, 47K followers)
- **Key Projects:** Paperclip (open-source orchestration for zero-human companies), Forgotten Runes, Magic Machine
- **Core Philosophy:** Orchestrate agents into a company -- org charts, budgets, goals, governance, accountability. Heartbeat execution. Budget-as-safety (token budgets throttle agents). Board approval gates for hiring new agents.
- **Relevance:** Paperclip is the management plane on top of Pi. His approach (governance, cost tracking, board approval for new agents) is the most mature thinking about agent safety in orchestration.
- **Dotta Network Cross-ref:** IS the reference network. His following list maps the entire agent space.

### 27. Swyx (Shawn Wang)
- **Handles:** @swyx (X), [swyx.io](https://swyx.io), [latent.space](https://latent.space)
- **Key Projects:** Latent Space podcast (10M+ readers/listeners in 2025), AI Engineer conference series (7+ events in 2026), Cognition
- **Core Philosophy:** Fostering the "Rise of the AI Engineer." Foundation models change every domain. The podcast is the connective tissue of the entire AI engineering community.
- **Relevance:** Not a builder of orchestration tools, but the most important curator and amplifier of builder insights. His podcast guests ARE the people on this list. His "Scaling without Slop" thesis for 2026 addresses quality at scale.

### 28. Andrej Karpathy
- **Handles:** @karpathy (X), OpenAI cofounder
- **Key Projects:** Coined "vibe coding" (Feb 2025) then "agentic engineering" (Feb 2026)
- **Core Philosophy:** "You are not writing the code directly 99% of the time... you are orchestrating agents who do and acting as oversight." The shift from vibes to structure marks the maturation of AI-assisted development.
- **Relevance:** Sets the conceptual vocabulary. When Karpathy names something, the industry organizes around it. His framing of "agentic engineering" as orchestration + oversight is the philosophical foundation for all orchestrator work.

---

## Cross-Reference with Dotta's Network

Of the 28 people documented above, the following appear in dotta's following/network (from the existing research at `research/2026-03-05_dotta-network-accounts-tools-reference.md`):

| Person | Dotta's Top 20 Rank | Overlap |
|--------|---------------------|---------|
| Mario Zechner (@badlogicgames) | #1 | Pi Agent creator -- foundational |
| Nico Bailon (@nicopreme) | #2 | Pi multi-agent extensions |
| Peter Steinberger (@steipete) | #3 | OpenClaw, now at OpenAI |
| Boris Cherny (@bcherny) | #4 | Claude Code creator |
| Geoffrey Huntley (@GeoffreyHuntley) | #5 | Ralph Loop originator |
| Muratcan Koylan (@koylanai) | #9 | Context engineering |
| Kye Gomez (Swarms) | #12 | Scale-first multi-agent |
| Numman Ali (@nummanali) | #13 | OpenSkills, AGENTS.md |
| dotta himself | #6 | Paperclip orchestration |

Nine of the 28 visionaries (32%) appear in dotta's network, concentrated in the Pi Agent ecosystem and foundational layer. The ones NOT in dotta's network tend to be framework builders (LangChain, CrewAI, AutoGen), commercial product builders (Conductor, Composio), or independent thinkers (Simon Willison, Addy Osmani, Nicholas Zakas).

---

## Synthesis: What These Builders Agree On

Despite different approaches, these builders converge on several principles:

1. **Context is the bottleneck, not capability.** (Huntley, Koylan, Horthy, Manus) -- Models are good enough; managing what they see is the hard problem.

2. **Orchestration, not autonomy.** (Mason, Osmani, Zakas) -- Fully autonomous agents fail; structured orchestration with human review gates succeeds.

3. **Isolation per agent.** (Conductor, Composio, Gas Town, L-Thread) -- Each agent needs its own git worktree, branch, and PR. Shared state is the enemy.

4. **Role-based specialization.** (Gas Town's 7 roles, CrewAI's crews, oh-my-pi's 6 agents, Composio's Planner/Executor) -- Generalist agents underperform specialist teams.

5. **Progress lives in files, not context.** (Huntley's Ralph Loop, Yegge's Gas Town) -- When context fills, spawn fresh. Git history is the real memory.

6. **Front-load specs, back-load review.** (Osmani, Horthy) -- Human effort belongs at the beginning (planning) and end (review), not the middle.

7. **Budget as safety.** (dotta's Paperclip, Composio's CI monitoring) -- Token budgets, spending controls, and governance gates prevent runaway agents.

---

## Recommended Action: Who to Follow First

**For immediate practical value to L-Thread orchestration:**

1. **IndyDevDan** -- His TAC course and weekly YouTube are the most directly applicable to building orchestration systems
2. **Steve Yegge** -- Gas Town's architecture is the closest public analog to L-Thread
3. **Dexter Horthy** -- Context engineering mastery is the #1 skill gap for orchestrator builders
4. **Prateek Karnal** -- Composio's agent orchestrator is the newest open-source reference implementation
5. **Simon Willison** -- His patterns guide is the canonical reference for agentic engineering practices

**For ecosystem awareness:**

6. **Charlie Holtz** -- Conductor's commercial success shows where the market is going
7. **Harrison Chase** -- Ambient Agents concept is the next paradigm shift
8. **Joao Moura** -- CrewAI's enterprise adoption validates role-based multi-agent at scale

---

## Sources

- [Agentic Engineer - agenticengineer.com](https://agenticengineer.com/)
- [IndyDevDan - indydevdan.com](https://indydevdan.com/)
- [Simon Willison - Agentic Engineering Patterns](https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/)
- [Addy Osmani - Conductors to Orchestrators](https://addyosmani.com/blog/future-agentic-coding/)
- [Geoffrey Huntley - Everything is a Ralph Loop](https://ghuntley.com/loop/)
- [Steve Yegge - Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Steve Yegge - The Future of Coding Agents](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c)
- [Mike Mason - AI Coding Agents in 2026](https://mikemason.ca/writing/ai-coding-agents-jan-2026/)
- [Nicholas Zakas - From Coder to Orchestrator](https://humanwhocodes.com/blog/2026/01/coder-orchestrator-future-software-engineering/)
- [Conductor - conductor.build](https://www.conductor.build/)
- [Composio Agent Orchestrator - GitHub](https://github.com/ComposioHQ/agent-orchestrator)
- [Prateek Karnal - Open-Sourcing Agent Orchestrator](https://pkarnal.com/blog/open-sourcing-agent-orchestrator)
- [Ruflo/Claude Flow - GitHub](https://github.com/ruvnet/ruflo)
- [Paperclip - GitHub](https://github.com/paperclipai/paperclip)
- [dotta on X - Paperclip announcement](https://x.com/dotta/status/2029239759428780116)
- [oh-my-pi - GitHub](https://github.com/can1357/oh-my-pi)
- [Pi Messenger - GitHub](https://github.com/nicobailon/pi-messenger)
- [Pi Subagents - GitHub](https://github.com/nicobailon/pi-subagents)
- [OpenSkills - GitHub](https://github.com/numman-ali/openskills)
- [Boris Cherny - How Boris Uses Claude Code](https://howborisusesclaudecode.com/)
- [Boris Cherny - Agent Teams announcement](https://x.com/bcherny/status/2019472394696683904)
- [Mario Zechner - What I learned building a coding agent](https://mariozechner.at/posts/2025-11-30-pi-coding-agent/)
- [Armin Ronacher - A Language For Agents](https://lucumr.pocoo.org/2026/2/9/a-language-for-agents/)
- [Harrison Chase - Deep Agents](https://opendatascience.com/harrison-chase-on-deep-agents-the-next-evolution-in-autonomous-ai/)
- [Harrison Chase - Ambient Agents (Sequoia podcast)](https://sequoiacap.com/podcast/training-data-harrison-chase-2/)
- [Matt Shumer - Something Big Is Happening](https://fortune.com/2026/02/11/something-big-is-happening-ai-february-2020-moment-matt-shumer/)
- [HumanLayer - Advanced Context Engineering](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents)
- [Dexter Horthy - YC profile](https://www.ycombinator.com/companies/humanlayer)
- [Muratcan Koylan - Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [CrewAI - State of Agentic AI 2026](https://www.crewai.com/blog/the-state-of-agentic-ai-in-2026)
- [Swarms - GitHub](https://github.com/kyegomez/swarms)
- [Victor Dibia - 10 Reasons Multi-Agent Workflows Fail](https://www.infoq.com/presentations/multi-agent-workflow/)
- [Manus AI - Context Engineering Lessons](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)
- [Yohei Nakajima - Birth of BabyAGI](https://yoheinakajima.com/birth-of-babyagi/)
- [Karpathy - Vibe Coding is Passe](https://thenewstack.io/vibe-coding-is-passe/)
- [Anthropic - 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [Agor - agor.live](https://agor.live)
- [Code-Conductor - GitHub](https://github.com/ryanmac/code-conductor)
- [Jake Handy - Agent Orchestration Substack](https://handyai.substack.com/p/agent-orchestration-isnt-just-for)
- [Latent Space - latent.space](https://www.latent.space/)
- [calv.info - Coding Agents Feb 2026](https://calv.info/agents-feb-2026)

---

*Compiled from 30+ web searches across X/Twitter, YouTube, GitHub, Substack, Medium, and general web. March 2026.*
