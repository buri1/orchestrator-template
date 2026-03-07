# Phase 2 Research: Top Practitioner Workflows & Mastery Patterns

**Research Date:** 2026-03-05
**Research Agent:** Phase 2 - Deep Workflow Analysis (Updated)
**Lens:** IndyDevDan ("Tools shape what you believe is possible"; "Knowing is engineering")

---

## Executive Summary

This document reconstructs the daily workflows, tool setups, and attention-allocation patterns of the five most influential agentic engineering practitioners as of early 2026. These are not theoretical framework designers -- they are production practitioners shipping real code with AI agent swarms daily. Each has developed a distinctive workflow philosophy, and the patterns that emerge across all five reveal a new discipline: **the engineer as orchestrator, not coder**.

**Key finding**: The top practitioners have converged on a common meta-pattern despite radically different implementations: (1) context engineering before code, (2) persistent state that survives agent death, (3) human attention reserved exclusively for architecture and review, and (4) aggressive automation of everything else. The specific tools differ, but the attention allocation is remarkably similar: ~20% setup/context, ~10% active orchestration, ~30% review/verification, ~20% learning/tooling, ~20% strategy/business.

---

## 1. Daily Workflows of Top Harness Engineers

### 1.1 IndyDevDan (Dan Disler) -- The Spec-First Architect

**Core Philosophy:** "Build the system that builds the system." / "Knowing is engineering; not knowing is vibe coding."

Dan Disler is a seasoned software engineer with 10+ years experience, betting the next decade on agentic software. He maintains 20+ GitHub repos, publishes weekly YouTube content, runs two courses (Principled AI Coding + Tactical Agentic Coding), and has formalized a philosophy centered on the Context/Prompt/Model/Tools tetrad. He does not write code in the traditional sense -- he writes *specifications*. His daily workflow revolves around crafting spec prompts that encode the full intent of what he wants built, then delegating execution entirely to Claude Code agents.

**Daily Workflow Pattern:**

**Morning Phase: Context Loading & Drop Zones**
- Uses his **Agentic Drop Zones** system: automated file processing that monitors directories and triggers agents (Claude Code, Gemini CLI, Codex CLI) when files are dropped
- **Morning Debrief Zone**: transcribes audio recordings of morning debriefs and analyzes content for engineering ideas and priorities. Output goes to `morning_debrief_zone/debrief_output/<date_time>/`
- Reviews overnight agent output, checks observability dashboards

**Core Work Phase: Spec Writing & Agent Deployment**
- Primary tool split: **80% Claude Code / Pi, 20% exploration of competing tools** (Gemini, Codex, etc.)
- Follows his own **Context/Prompt/Model/Tools tetrad**: context is highest leverage, prompt engineering is the differentiator, model selection matches task complexity, tools extend capabilities
- Spends the majority of time writing specification prompts -- not casual prompts but detailed documents with embedded test commands that create closed-loop self-validation. The spec is the artifact, not the code
- "I spend most of my time writing specs and plans for my AI Coding instead of iterative AI Coding"
- Uses **single-file agents** pattern: each agent is a self-contained Python file with a single purpose, precise prompt, and clear boundaries
- **Infinite Agentic Loop**: a two-prompt system using Claude Code for continuous autonomous development. The orchestrator assesses current output state, plans waves of agents based on remaining context capacity, assigns increasingly sophisticated creative directions, launches parallel sub-agent waves, monitors completion, and updates directory state snapshots via custom slash commands (e.g., `/project:infinite specs/ui_component_spec.md src_agent_4 infinite`)

**Observability Phase: Monitoring & Verification**
- Runs his **Claude Code Hooks Multi-Agent Observability** system via a web dashboard
- Architecture: Claude Agents --> Hook Scripts --> HTTP POST --> Bun Server --> SQLite --> WebSocket --> Vue Client
- Session tracking across multiple concurrent agents with swim lane filtering
- Event filtering and live updates via pulse charts
- Blocks dangerous commands (rm -rf) via deny_tool() patterns
- Prevents access to sensitive files (.env, private keys)
- Guards against infinite hook loops with stop_hook_active guards
- PostToolUseFailure events surfaced immediately for rapid response

**Content & Education Phase**
- Weekly YouTube videos documenting patterns, techniques, and new experiments
- Maintains two courses: Tactical Agentic Coding (implementation skills) and Principled AI Coding (architectural understanding)
- Each new repo is simultaneously a learning exercise, a teaching artifact, and a production tool

**Compute Advantage Equation**: Disler formalized his philosophy into a mathematical framework: `Compute Advantage = (Compute Scaling x Autonomy) / Costs`. Every tool decision is evaluated through this lens. The higher the compute scaling and autonomy, and the lower the time/effort/money costs, the greater the advantage.

**Key Tools:**

| Tool | Role |
|------|------|
| Claude Code | Primary coding agent (80% of work) |
| Gemini CLI | Secondary agent, exploration |
| Codex CLI | Secondary agent, exploration |
| Agentic Drop Zones | Automated file processing triggers |
| Single-File Agents | Task-specific Python agents |
| Claude Code Hooks | Real-time observability dashboard |
| Infinite Agentic Loop | Continuous development cycles |
| Big 3 Super Agent | Multi-provider agent experiment (Gemini CU + OpenAI Realtime + Claude Code) |
| Pi (planned) | Future primary harness |

**Attention Allocation:**

| Activity | Time % | Notes |
|----------|--------|-------|
| Spec writing / context engineering | 25% | Drop zones, CLAUDE.md, spec prompts with embedded tests |
| Active agent orchestration | 10% | Launching, monitoring, redirecting via slash commands |
| Review & verification | 25% | Observability dashboards, output validation |
| Learning & experimentation | 20% | New tools, competing models (20% exploration budget) |
| Content creation / teaching | 20% | YouTube, courses, blog, GitHub repos |

**Key Philosophy Points:**
- "Knowing is engineering; not knowing is vibe coding" -- understanding agent internals separates engineers from vibe coders
- **Observability before scale**: you cannot orchestrate what you cannot observe
- **Skills over MCP** for context preservation: Skills are reusable, filesystem-based resources; MCPs are ephemeral and pollute context
- **Three-tier progression**: reliable harness --> intelligent orchestration --> meta-agency
- Spend 20% of time exploring competing tools, 80% building core competency
- Tools change; principles endure
- "Year of Trust 2026" -- do you trust your agents?

**Sources:**
- [IndyDevDan GitHub](https://github.com/disler)
- [IndyDevDan Blog](https://indydevdan.com/)
- [Agentic Drop Zones](https://github.com/disler/agentic-drop-zones)
- [Claude Code Hooks Multi-Agent Observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)
- [Infinite Agentic Loop](https://github.com/disler/infinite-agentic-loop)
- [Single File Agents](https://github.com/disler/single-file-agents)
- [Principled AI Coding Course](https://agenticengineer.com/principled-ai-coding)
- [Tactical Agentic Coding Course](https://agenticengineer.com/tactical-agentic-coding)
- [Big 3 Super Agent](https://github.com/disler/big-3-super-agent)
- [Install and Maintain](https://github.com/disler/install-and-maintain)
- [State of AI Coding - Engineering with Exponentials](https://agenticengineer.com/state-of-ai-coding/engineering-with-exponentials)
- [Compute Advantage Calculator](https://agenticengineer.com/compute-advantage-equation)

---

### 1.2 Elvis Sun -- The Voice-First Delegator

**Core Philosophy:** "An AI orchestrator as an extension of yourself."

Elvis Sun spent 8 years at Google building Firebase and is now a generalist solo founder running a B2B SaaS with AI agents doing all implementation. He represents the most radical departure from traditional engineering: he rarely opens a code editor. His primary interface is *voice* -- talking to his phone while pushing a stroller, during walks, or between client meetings. He manages an autonomous assistant named "Zoe" that orchestrates a fleet of coding agents. Father of two. Achieved 94 commits in one day while attending 3 client calls without opening his editor.

**Daily Workflow Pattern:**

**7:00 AM -- Automated Morning Briefing (runs via cron)**
- Zoe generates a structured daily briefing automatically
- Written to Obsidian vault at `/Daily/YYYY-MM-DD-briefing.md`
- Proactively scans Sentry for overnight errors and spawns agents to investigate/fix -- no human initiation required
- Scans meeting notes synced to Obsidian vault to flag feature requests
- Spawns Codex agents for identified feature work

**Morning -- Human Review Phase**
- Elvis reviews Zoe's morning briefing
- Checks Telegram notifications for completed PRs
- Reviews and merges agent-submitted PRs (sometimes 7 PRs in 30 minutes)
- Handles client calls (does NOT open code editor)
- Meeting notes auto-sync to Obsidian vault -- zero manual context transfer

**After Client Meetings -- Voice Delegation**
- Elvis talks through requests with Zoe via voice notes on his phone
- Voice is transcribed with OpenAI Whisper API and routed to Zoe through Obsidian vault
- Zoe automatically receives meeting notes, scans for feature requests, and spawns agents
- "Most productive Saturday morning in months -- me: pushing a stroller, baby asleep -- also me: voice-directing zoe and 5 coding agents"

**Continuous Agent Operation -- Zoe as Meta-Orchestrator**
- Zoe picks the right agent and model for each task: billing bugs go to Codex, UI fixes to Claude Code, design starts with Gemini
- When an agent fails, Zoe doesn't restart with the same prompt -- she analyzes the failure context, determines what went wrong, and rewrites the prompt with additional context. She babysits agents through to completion
- OpenClaw holds all business context (customer data, meeting minutes, historical decisions, successes, failures) in Obsidian Vault and translates into precise prompts for each agent
- Telegram notifications when PRs are ready to merge

**2:00 AM -- Autonomous Security Sweeps (runs via cron)**
- Zoe spawns 4 Codex agents to find and fix security bugs
- Results: 4 PRs with clean 5-hour execution windows
- Elvis is asleep during this

**Daily Cron Jobs:**
- Morning briefing generation (7:00 AM)
- Security sweeps (2:00 AM)
- Orphaned worktree cleanup
- Task registry JSON cleanup
- New follower detection and outreach

**Architecture Stack:**

| Component | Detail |
|-----------|--------|
| Orchestrator | Zoe (built on OpenClaw), running 24/7 |
| Hardware | Mac Studio M4 Max 128GB RAM ($3,500) |
| Context Store | Obsidian vault (monorepo with code + knowledge base) |
| Voice Interface | Phone --> Whisper API --> Obsidian --> Zoe |
| Notification | Telegram for PR alerts and status updates |
| Agent Fleet | Codex, Claude Code, Gemini -- routed by Zoe based on task type |
| Database | Zoe's SQLite DB with tweet archive, follower list, agent tasks |
| Connected Accounts | X and Google for GTM automation |
| Previous Hardware | Mac Mini 16GB (topped out at 4-5 agents) |

**Performance Metrics:**

| Metric | Value |
|--------|-------|
| Peak commits/day | 94 (during 3 client calls, no editor opened) |
| Average commits/day | ~50 |
| PRs in 30 minutes | 7 |
| Monthly cost (Claude) | ~$100 |
| Monthly cost (Codex) | ~$90 |
| Mac Studio cost | $3,500 (one-time) |
| X payout (9.3M impressions) | $1,505 |
| Current MRR | $420+ |
| Most complex system built | Agent swarm powered media database |
| Setup time | ~3 hours for initial Obsidian + Zoe connection |

**Attention Allocation:**

| Activity | Time % | Notes |
|----------|--------|-------|
| PR review & merging | 25% | Primary human-in-the-loop touchpoint |
| Client calls & sales | 30% | Founder-led sales, feature request intake, voice delegation |
| Agent orchestration oversight | 15% | Reviewing Zoe's decisions, adjusting prompts |
| Strategy & business | 20% | Growth, content, X engagement |
| Family / personal | 10% | Father of two; agents run while he's with family |

**Key Philosophy Points:**
- Agent orchestration scales with **business context**, not engineering time. The Obsidian vault is the competitive moat
- "There will be a ton of one-person million-dollar companies starting in 2026, with massive leverage for those who understand how to build recursively self-improving agents"
- The initial investment in Zoe's setup was substantial but compounds -- each improvement to the orchestrator improves ALL future work
- Voice-first interaction eliminates the desk-bound bottleneck

**Sources:**
- [Elvis Sun Website](https://www.elvis.so/)
- [Elvis Sun X - Agent Swarm Setup](https://x.com/elvissun/status/2025920521871716562)
- [Elvis Sun X - Building with OpenClaw Day 24-33](https://x.com/elvissun/status/2027578655569023338)
- [OpenClaw Agent Swarm Full Setup (DailyKoin)](https://dailykoin.com/ai-agent-swarm/)
- [OpenClaw Agent Swarm (Followin)](https://followin.io/en/feed/23522502)

---

### 1.3 steipete (Peter Steinberger) -- The Chaos-Engineering Pragmatist

**Core Philosophy:** "Just talk to it. Play with it. Develop intuition."

Peter Steinberger, ex-PSPDFKit founder, now full-time "polyagentmorous builder." 410K followers. Creator of OpenClaw ("the AI that actually does things"), tmuxwatch, CodexBar, VibeTunnel. Runs Claude Code Anonymous meetups worldwide. Self-described "Claudoholic" who struggles with "slot machine addiction." The most prolific blogger of the five, with detailed workflow posts updated monthly. Rejects framework complexity in favor of raw terminal interaction.

**Daily Workflow Pattern:**

**Physical Setup:**
- **Dell UltraSharp U4025QW** (3840x1620 resolution)
- Layout: 4 Claude Code instances + Chrome, all visible simultaneously without window management
- Primary terminal: **Ghostty** (switched back from VS Code due to freezes when pasting large text; "nothing beats Ghostty")
- VS Code on the side for code lookup only
- Cursor/GPT-5 for reviews

**Morning: Launch & Assess**
- Opens Ghostty, launches Claude Code instances
- Assesses current project state, reviews overnight changes
- Checks CLAUDE.md (living document that agents also write to -- it evolves with the project)
- Determines **blast radius** of today's work to decide agent count

**Core Work: Parallel Agent Management**
- **1-2 agents** for focused feature work (non-refactoring)
- **~4 agents** for cleanup/tests/UI work (sweet spot for parallel)
- Works **directly on main branch** with multiple agents simultaneously -- his most controversial practice
- Agents work on different areas carefully to avoid cross-pollination
- Explicitly rejected git worktrees: "I tried the whole worktree setup but found it just slows me down"
- Separates commits cleanly despite working on main

**Prompting Style: "Just Talk To It"**
- Concise prompts, often 1-2 sentences
- **Screenshots compose up to 50% of his prompts** -- visual context is faster than describing UI issues
- Prefers "many small bombs" (small, isolated changes) over "Fat Man" (large sweeping changes)
- Think about "blast radius" before every prompt
- Does NOT use RAG, subagents, or elaborate frameworks
- "Don't waste your time on stuff like RAG, subagents, Agents 2.0 or other things that are mostly just charade"
- Uses /clear frequently to prevent context drift

**Review Cycle:**
- Uses GPT-5/Codex for reviewing plans (finds it more thorough than Gemini)
- Codex is "more eager to actually read the codebase" while Claude "often tries random things"
- With Claude: plan first, then execute. With GPT: let it read and reason
- When Claude ignored CLAUDE.md rules, he asked Claude to *rewrite the rules in a way it would follow* -- emphatic language like "VIOLATION MEANS IMMEDIATE FAILURE" improved adherence

**Refactoring (20% of time in dedicated phases):**
- Cyclical: rapid iteration followed by dedicated refactoring phases
- Entirely performed by agents
- Includes: dead code removal, code duplication detection, linting, API consolidation, documentation, file restructuring, test addition, dependency updates
- Uses ast-grep rules as codebase linter with git hooks

**MCP Philosophy: Radical Minimalism**
- Removed his last MCP server because Claude would unnecessarily spin up Playwright when it could simply read the code ("faster and pollutes context less")
- Picks services with CLIs (vercel, psql, gh, axiom) and documents them minimally in CLAUDE.md
- "Nothing beats a good CLI"

**Sustainability Awareness:**
- Added session time to Claude's status line as a reminder that "time flies when in the flow"
- Acknowledges the addictive nature: "Any of you feeling the same kind of urgent addiction at the moment?"
- Created Claude Code Anonymous meetups (London, Vienna, Berlin, Cologne, SF, Delft) as community support

**Context Management:**
- AGENTS.MD file acts as shared guardrails across all repositories -- every consuming repo's AGENTS.MD reduced to a single pointer: `READ ~/Projects/agent-scripts/AGENTS.MD BEFORE ANYTHING`
- CLAUDE.md as living document agents read AND write to
- File size limits (<500 LOC) to keep changes reviewable
- Conventional Commits for traceable history

**Key Tools:**

| Tool | Role |
|------|------|
| Ghostty | Primary terminal |
| Claude Code | Primary coding agent |
| GPT-5/Codex | Plan review, codebase analysis ("more eager to read") |
| Cursor | Secondary review |
| VS Code | Code lookup (not primary editor) |
| tmuxwatch | Charmbracelet TUI dashboard for monitoring tmux sessions |
| CodexBar | Agent token limit monitor ("may your tokens never run out") |
| VibeTunnel | Browser-to-terminal bridge ("command agents from the road") |
| OpenClaw | "The AI that actually does things" |
| Dell UltraSharp U4025QW | 4-agent + Chrome visible simultaneously |

**Attention Allocation:**

| Activity | Time % | Notes |
|----------|--------|-------|
| Prompting & orchestrating | 20% | Concise prompts, screenshots, blast radius planning |
| Reviewing agent output | 30% | GPT-5 for plan review, visual inspection |
| Refactoring cycles | 20% | Dedicated phases, entirely agent-executed |
| Tooling & ecosystem | 15% | Building tmuxwatch, CodexBar, VibeTunnel, OpenClaw |
| Community & content | 15% | Blog posts, meetups, Essential Reading monthly series |

**Key Philosophy Points:**
- **Blast radius thinking**: before every change, assess how many files/systems it touches. Scale agent count accordingly
- **Screenshots are prompts**: visual context is faster and more precise than text descriptions
- **Work on main**: branches and worktrees add overhead; careful agent allocation on main is faster
- **Living CLAUDE.md**: agents read AND write to it; it evolves with the project
- **Intuition over frameworks**: develop a feel for what each model does well through volume, not study

**Sources:**
- [Peter Steinberger Blog](https://steipete.me/)
- [My Current AI Dev Workflow](https://steipete.me/posts/2025/optimal-ai-development-workflow)
- [Just Talk To It](https://steipete.me/posts/just-talk-to-it)
- [Commanding Your Claude Code Army](https://steipete.me/posts/2025/commanding-your-claude-code-army)
- [Command Your Claude Code Army, Reloaded](https://steipete.me/posts/command-your-claude-code-army-reloaded)
- [Claude Code Anonymous](https://steipete.me/posts/2025/claude-code-anonymous)
- [Essential Reading for Agentic Engineers - August 2025](https://steipete.me/posts/2025/essential-reading-august-2025)
- [Essential Reading - July 2025](https://steipete.me/posts/2025/essential-reading-july-2025)
- [Just One More Prompt](https://steipete.me/posts/just-one-more-prompt)
- [You Can Just Do Things (Eleanor Berger)](https://elite-ai-assisted-coding.dev/p/you-can-just-do-things-steipete)
- [The Creator of Clawd (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/the-creator-of-clawd-i-ship-code)
- [steipete GitHub](https://github.com/steipete)
- [tmuxwatch](https://github.com/steipete/tmuxwatch)
- [agent-rules](https://github.com/steipete/agent-rules)

---

### 1.4 Geoffrey Huntley -- The Overnight Autonomy Maximizer

**Core Philosophy:** "Sit ON the loop, not IN it." / "The future belongs to people who can just do things."

Geoffrey Huntley, former Canva engineer, now at Sourcegraph building Amp. Creator of the Ralph Wiggum Loop technique -- the most widely adopted autonomous agent pattern in the ecosystem. Ran a 3-month autonomous loop that built a complete programming language with PostgreSQL and MySQL adapters from zero training data. Advocates for overnight autonomous agent operation. Runs headless agents on NixOS bare metal. The most radical autonomy-maximizer of the five practitioners.

**Daily Workflow Pattern:**

Huntley's workflow is unique because his **agents run while he sleeps**. His daily cycle is inverted: setup and review during waking hours, execution overnight.

**Daytime: Setup & Specification Phase**
- Writes PROMPT.md files with precise specifications
- Creates IMPLEMENTATION_PLAN.md as persistent state between loop iterations
- Designs the **Ralph funnel: 3 Phases, 2 Prompts, 1 Loop**:
  - **PLANNING prompt**: does gap analysis (specs vs code), outputs prioritized TODO list -- no implementation, no commits
  - **BUILDING prompt**: assumes plan exists, picks tasks from plan, implements, runs tests (backpressure), commits
- At Canva, his team adopted a spec-based workflow for AI tools, requiring clear boundaries because "AI can complete tasks so quickly" that thinly sliced work allocations cause overlap
- Tunes prompts based on observed failure patterns: "Tune it like a guitar -- instead of prescribing everything upfront, observe and adjust reactively"
- "The prompts you start with won't be the prompts you end with -- they evolve through observed failure patterns"

**Evening: Launch Autonomous Loops**
- Starts Ralph loops on bare metal NixOS machine
- Core pattern: `while :; do cat PROMPT.md | claude-code ; done`
- Progress persists in files and git history, NOT in LLM context window
- IMPLEMENTATION_PLAN.md acts as shared state between otherwise isolated loop executions
- Each loop iteration is independent -- "a dumb bash loop that keeps restarting the agent"
- Ralph works as a single process performing one task per loop -- "to get good outcomes with Ralph, you need to ask Ralph to do one thing per loop"

**Overnight: Fully Autonomous Operation**
- Agents run headless, no human supervision
- Built an AI supervisor to programmatically correct errors, enabling headless automation
- Agents autonomously push to master with no branches
- Deployment in under 30 seconds with feedback loops that feed back into the active session for self-repair if something goes wrong
- Has cloned 4 products autonomously overnight: Tailscale, HashiCorp Nomad, Infisical, and others

**Morning: Review & Iterate**
- Reviews overnight git history
- Analyzes failure patterns
- Adjusts prompts for next cycle
- Shares findings via blog posts, workshops, conference talks

**The Ralph Loop Architecture:**

```
Phase 1: PLANNING
  Input: PROMPT.md (specification)
  Action: Gap analysis (spec vs current code)
  Output: Prioritized TODO list in IMPLEMENTATION_PLAN.md
  Rule: No implementation, no commits

Phase 2: BUILDING
  Input: IMPLEMENTATION_PLAN.md + codebase
  Action: Pick task, implement, run tests (backpressure), commit
  Output: Working code + updated plan
  Rule: One task per loop iteration

Phase 3: LOOP
  Pattern: while true: restart from Phase 1
  State: Lives in files + git history, NOT in context window
  Recovery: Deployment feedback loops feed back for self-repair
```

**Real-World Results:**
- 3-month loop built a complete programming language (with PostgreSQL and MySQL adapters, no prior training data)
- YC hackathon teams shipped 6+ repos overnight for $297 in API costs
- Ralph Wiggum technique now an official Claude Code plugin

**Infrastructure:**

| Component | Detail |
|-----------|--------|
| Hardware | Bare metal NixOS server (Hetzner) |
| OS | NixOS with ZFS encryption (LUKS) |
| Agent runtime | Claude Code in bash loops |
| State persistence | Files + git history (IMPLEMENTATION_PLAN.md) |
| Deployment | <30 seconds, self-healing feedback |
| Branch strategy | Push to master, no branches |
| Supervisor | Custom AI supervisor for error correction |

**Attention Allocation:**

| Activity | Time % | Notes |
|----------|--------|-------|
| Prompt/spec engineering | 35% | The highest-leverage activity; tunes "like a guitar" |
| Review & failure analysis | 25% | Morning review of overnight runs |
| Infrastructure & tooling | 15% | NixOS, deployment pipelines, supervisors |
| Teaching & advocacy | 15% | Blog posts, workshops, conference talks |
| Active monitoring | 10% | During daytime runs; overnight is fully autonomous |

**Key Philosophy Points:**
- **Everything is a Ralph loop**: the pattern is GENERIC and applies to ALL TASKS, not just coding
- **Sit ON the loop, not IN it**: engineer the environment, not the code
- **Prompts evolve through failure**: observe and adjust reactively, don't prescribe upfront
- **KTLO (Keep The Lights On) automation**: dreams of "thousands of automated AI roombas that autonomously maintain codebases"
- **"The future belongs to people who can just do things"**: AI collapses the expertise barrier
- **"Simple bash loops and deterministic context allocation are fundamentally changing the unit economics of code"**
- Named after Ralph Wiggum: homage to 1980s slang for vomiting AND the Simpsons character's "combination of ignorance, persistence, and optimism"
- "I seriously can't see a path forward where the majority of software engineers are doing artisanal hand-crafted commits by as soon as the end of 2026"

**Sources:**
- [Geoffrey Huntley Blog](https://ghuntley.com/)
- [Autoregressive Queens of Failure](https://ghuntley.com/gutter/)
- [Everything is a Ralph Loop](https://ghuntley.com/loop/)
- [Ralph Wiggum as a Software Engineer](https://ghuntley.com/ralph/)
- [The Future Belongs to People Who Can Just Do Things](https://ghuntley.com/dothings/)
- [I Dream of Roombas](https://ghuntley.com/ktlo/)
- [Six-Month Recap: Web Directions Melbourne](https://ghuntley.com/six-month-recap/)
- [How to Build a Coding Agent (Workshop)](https://ghuntley.com/agent/)
- [How to Ralph Wiggum (GitHub)](https://github.com/ghuntley/how-to-ralph-wiggum)
- [Inventing the Ralph Wiggum Loop (Dev Interrupted)](https://devinterrupted.substack.com/p/inventing-the-ralph-wiggum-loop-creator)
- [Mastering Ralph Loops (LinearB)](https://linearb.io/blog/ralph-loop-agentic-engineering-geoffrey-huntley)
- [Ralph Wiggum Plugin (Claude Code)](https://github.com/anthropics/claude-code/blob/main/plugins/ralph-wiggum/README.md)
- [Inventing the Ralph Wiggum Loop Podcast (LinearB)](https://linearb.io/dev-interrupted/podcast/inventing-the-ralph-wiggum-loop)
- [A Brief History of Ralph (HumanLayer)](https://www.humanlayer.dev/blog/brief-history-of-ralph)

---

### 1.5 Steve Yegge -- The Factory Operator

**Core Philosophy:** "AI agents are ephemeral. But work context should be permanent."

Steve Yegge, former Google/Amazon engineer, is the most ambitious scaler of any practitioner. Creator of Gas Town (multi-agent workspace manager, ~189K LOC in Go, 100% vibecoded) and Beads (agent memory system). Released January 1, 2026. Describes Gas Town as "Kubernetes mated with Temporal" for agent orchestration. Runs 20-50+ parallel agents through a Mad Max-themed hierarchy. Most recently launched The Wasteland -- a federation layer linking thousands of Gas Towns.

**Daily Workflow Pattern:**

**Morning: Town-Level Operations**
- Communicates with the **Mayor** agent (chief-of-staff AI)
- Mayor provides status report across all active **Rigs** (projects under development)
- Reviews overnight **Patrol** results from automated monitoring agents:
  - **Deacon** (daemon beacon): continuous monitoring, health checks, recovery triggers
  - **Witness**: oversees Polecats and Refinery within each Rig, detects stuck agents
  - **Refinery**: manages merge coordination
- Checks the **Wanted Board** for new work items

**Active Work Phase: Convoy Dispatch**
- Mayor initiates **Convoys** (coordinated work dispatches)
- Mayor can file and fix issues itself, OR sling work to **Polecats** (ephemeral worker agents)
- Polecats pick up work, execute tasks, submit MRs without human intervention
- All agents create **wisp molecules** (audit trail entries) for every patrol or workflow run
- Uses **gt seance** to allow current agents to query predecessors: the current Mayor can talk to the last Mayor via Claude Code's /resume feature

**Review Phase:**
- Reviews Polecat-submitted MRs
- Checks Witness reports for stuck agents
- Deacon triggers recovery when agents become unresponsive
- **Dogs** (Deacon's crew): handle background maintenance (cleanup, health checks)

**State Management:**
- **Beads** (`bd` CLI tool): agents store tasks as issues in `.beads` directory in each project folder
- Git-backed ledgers: all state persists in version control
- Migrating to **Dolt** (Git-for-databases) for richer agentic memory
- Task graphs replace linear TODO lists
- "Dolt is so perfect for agentic memory, Beads is migrating to Dolt"

**Evening: Federation & Community**
- **The Wasteland** (March 2026): federation layer linking thousands of Gas Towns in a trust network
- Shared Wanted Board across federated users
- RPG elements: stamps, leaderboards, character sheets
- gastownhall.ai for community coordination
- "You federate a hundred Gas Town users together to build stuff. Your biggest problem will be ideas."

**Agent Role Hierarchy:**

| Role | Type | Function |
|------|------|----------|
| Mayor | Persistent | Chief-of-staff, work distribution, user communication, Convoy initiation |
| Polecats | Ephemeral | Task execution, MR submission, unsupervised workers |
| Refinery | Patrol | Merge coordination across a Rig |
| Witness | Patrol | Monitors Polecats and Refinery, detects stuck agents |
| Deacon | Patrol | Daemon beacon, continuous health monitoring, recovery triggers |
| Dogs | Maintenance | Deacon's crew: cleanup, health checks, background tasks |
| Crew | Workers | Rig-level feature and bug fix execution |

**Gas Town Command Set:**

| Command | Function |
|---------|----------|
| gt seance | Query predecessor agents for historical context via /resume |
| gt patrol | Run monitoring/maintenance cycles |
| wl join | Join the Wasteland federation |
| bd | Beads CLI for task/issue management |

**Attention Allocation:**

| Activity | Time % | Notes |
|----------|--------|-------|
| Mayor communication | 20% | High-level direction, Convoy initiation |
| MR review | 25% | Reviewing Polecat output, Refinery merges |
| Architecture & design | 20% | "100% vibecoded" but all design is human |
| Patrol monitoring | 15% | Witness/Deacon reports, stuck agent recovery |
| Community & writing | 20% | Medium essays, Wasteland federation, SE Daily podcast |

**Key Philosophy Points:**
- **Persistent memory is the moat**: Beads/Dolt solve the context loss problem that kills all other multi-agent approaches
- **Mad Max organizational theory**: agents need hierarchy, roles, and accountability -- not flat swarms
- **100% vibecoded**: "I've never seen the code, and I never care to" -- the human role is architecture and product
- **"Expensive as hell"**: Gas Town is optimized for speed, not cost. Token economics are secondary to velocity. "You won't like Gas Town if you ever have to think, even for a moment, about where money comes from"
- **Seance for continuity**: current agents querying dead agents' context via /resume is a breakthrough pattern
- **The Wasteland vision**: from individual Gas Towns to federated networks; from developer tool to multiplayer RPG-like collaboration

**Sources:**
- [Welcome to Gas Town (Medium)](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Gas Town Emergency User Manual (Medium)](https://steve-yegge.medium.com/gas-town-emergency-user-manual-cf0e4556d74b)
- [Welcome to the Wasteland: A Thousand Gas Towns (Medium)](https://steve-yegge.medium.com/welcome-to-the-wasteland-a-thousand-gas-towns-a5eb9bc8dc1f)
- [The Future of Coding Agents (Medium)](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c)
- [Gas Town GitHub](https://github.com/steveyegge/gastown)
- [A Day in Gas Town (DoltHub Blog)](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/)
- [Gas Town Agent Patterns (Maggie Appleton)](https://maggieappleton.com/gastown)
- [Gas Town SE Daily Podcast (Feb 2026)](https://softwareengineeringdaily.com/2026/02/12/gas-town-beads-and-the-rise-of-agentic-development-with-steve-yegge/)
- [Gas Town Multi-Agent Framework Analysis](https://reading.torqsoftware.com/notes/software/ai-ml/agentic-coding/2026-01-15-gas-town-multi-agent-orchestration-framework/)
- [Gas Town Decoded (ASCII News)](https://ascii.co.uk/news/article/news-20260118-4f2079f3/steve-yegges-gas-town-ai-agent-orchestration-system-decoded)
- [GasTown and Two Kinds of Multi-Agent](https://paddo.dev/blog/gastown-two-kinds-of-multi-agent/)
- [Gas Town is a Glimpse Into the Future](https://johncodes.com/archive/2026/01-16-a-glimpse-into-the-future/)
- [Gas Town Hall](https://gastownhall.ai/)
- [The AI Vampire (Hanselminutes Podcast)](https://hanselminutes.com/1035/the-ai-vampire-with-gas-towns-steve-yegge)
- [Steve Yegge on AI Agents (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/steve-yegge-on-ai-agents-and-the)

---

## 2. Cross-Practitioner Pattern Analysis

### 2.1 Common Patterns (All Five Share)

| Pattern | IndyDevDan | Elvis | steipete | Huntley | Yegge |
|---------|-----------|-------|----------|---------|-------|
| Human writes ZERO production code | Yes | Yes | Yes (100% agent-written) | Yes | Yes ("never seen the code") |
| Persistent state survives agent death | Hooks/files | Obsidian vault | CLAUDE.md | IMPLEMENTATION_PLAN.md + git | Beads/Dolt |
| Context engineering > prompt engineering | Context/Prompt/Model/Tools tetrad | Obsidian vault with full business context | CLAUDE.md + AGENTS.MD | PROMPT.md + spec-based | Beads + Git-backed ledgers |
| CLI tools over GUI/MCP | Yes | Yes (cron, CLI) | Yes (removed all MCPs) | Yes (bash loops) | Yes (gt, bd CLIs) |
| Agents push to main/master | Varies | Yes (via PR) | Yes (controversial, direct) | Yes (no branches at all) | Via Refinery merge |
| Failure recovery is automated | Hook guards + deny_tool() | Zoe re-prompts with context | Manual + GPT review | AI supervisor | Witness/Deacon patrol |
| Hardware investment matters | Standard | Mac Studio M4 Max 128GB | Dell UltraSharp monitor | Hetzner bare metal NixOS | Not disclosed |
| Cost is secondary to velocity | Yes | $190/mo total | Not optimized | $297 for 6 repos overnight | "Expensive as hell" |

### 2.2 Divergent Patterns

| Dimension | Minimalist Pole | Maximalist Pole |
|-----------|----------------|-----------------|
| Agent count | steipete (1-4 sweet spot) | Yegge (20-50+) |
| Autonomy level | steipete (supervised, "just talk to it") | Huntley (overnight unsupervised, push to master) |
| Framework complexity | steipete ("just talk to it", anti-framework) | Yegge (Gas Town, ~189K LOC Go framework) |
| Review approach | Huntley (review git history next morning) | IndyDevDan (real-time observability dashboard) |
| State system | steipete (CLAUDE.md text file) | Yegge (Beads + Dolt database) |
| Branch strategy | Huntley/steipete (main only, no branches) | Elvis (PR-based, agent-submitted) |
| Sleep-time utilization | IndyDevDan/steipete (none) | Elvis (2AM cron) + Huntley (overnight Ralph loops) |
| Input modality | steipete (screenshots 50% of prompts) | Elvis (voice-first via Whisper) |
| Organizational model | Huntley (flat, single process) | Yegge (hierarchy: Mayor > Polecats > Dogs) |

### 2.3 The Attention Hierarchy (Synthesized)

Across all five practitioners, human attention follows a consistent hierarchy from highest to lowest leverage:

1. **Architecture & Strategy** (highest leverage): what to build, why, in what order
2. **Context Engineering**: CLAUDE.md, PROMPT.md, Obsidian vaults, Beads -- the "soil" agents grow in
3. **Review & Verification**: checking agent output, merge decisions, failure analysis
4. **Orchestration**: launching agents, routing work, managing parallelism
5. **Code Writing**: ZERO -- this is 100% delegated to agents across all five practitioners

### 2.4 The Tool vs. Principle Spectrum

| Practitioner | Primary Competitive Advantage | Tool-Dependent? |
|-------------|-------------------------------|-----------------|
| IndyDevDan | Observability + spec engineering + teaching flywheel | Moderate (hooks system is custom but principles transfer) |
| Elvis Sun | Obsidian vault with accumulated business context | High (Zoe + OpenClaw + Obsidian is a custom stack) |
| steipete | Intuition from thousands of prompts + minimalist tooling | Low (Ghostty + Claude Code, could swap tools) |
| Huntley | PROMPT.md engineering + autonomous overnight operation | Low (bash loop, works with any agent) |
| Yegge | Gas Town hierarchy + Beads persistent memory | High (189K LOC custom framework) |

---

## 3. How Top Practitioners Handle Debugging and Failure

### 3.1 The Observability-First Approach (IndyDevDan)

Dan Disler's debugging philosophy is codified in his observability dashboard. Rather than debugging after failure, the system provides continuous visibility:

- **Real-time event stream:** Every tool call, task handoff, and agent lifecycle event is captured via Claude Code hooks
- **Swim lane filtering:** Inspect individual agent behavior in isolation
- **Failure detection:** PostToolUseFailure and PermissionRequest events surfaced immediately
- **Throughput measurement:** Live pulse charts show agent activity patterns
- **Session tracking:** Full history of what each agent did, enabling replay analysis

This aligns with his core thesis: "Observability before scale."

### 3.2 The Chaos-Tolerance Approach (steipete)

Steinberger embraces "chaos engineering" -- running multiple agents on main without traditional safeguards:

- **Pick work areas carefully** to minimize cross-pollination between parallel agents
- **Custom CLIs** for quick verification and state inspection
- **Rule-based guardrails** in AGENTS.MD (destructive git ops forbidden unless explicit)
- **File size limits** (<500 LOC) to keep changes reviewable
- **Conventional Commits** for traceable history
- **GPT-5 for plan review** catches errors Claude would miss

### 3.3 The Context-Enriched Retry (Elvis Sun)

When an agent fails in Elvis's system, Zoe doesn't restart with the same prompt:

1. **Failure analysis:** Zoe examines the error context
2. **Context enrichment:** Zoe possesses context agents lack -- customer history, meeting minutes, past attempts, and why they failed
3. **Prompt rewriting:** Uses accumulated context to write a more precise prompt for the retry
4. **Model routing:** May reassign the task to a different model better suited for the failure type

### 3.4 The Prompt Evolution Approach (Geoffrey Huntley)

Huntley treats failures as data for prompt tuning:

- Progress lives in files and git, not in context -- so context loss is not a failure mode
- AI supervisor programmatically corrects errors in headless operation
- Deployment feedback loops feed back into the active session for self-repair
- "Tune it like a guitar" -- observe failure patterns and adjust prompts reactively
- Failure patterns become training data for the next iteration of PROMPT.md

### 3.5 The Organizational Recovery (Steve Yegge)

Gas Town has dedicated agent roles for failure detection and recovery:

- **Witness** monitors Polecats and Refinery, detects stuck agents
- **Deacon** runs continuous patrol cycles, triggers recovery when agents become unresponsive
- **Dogs** (Deacon's crew) handle cleanup and health maintenance
- **gt seance** allows successor agents to query predecessors about what went wrong
- All agents create wisp molecules (audit trails) for forensic analysis

---

## 4. Specific Technical Knowledge That Separates the Top 0.1%

### 4.1 IndyDevDan's TAC Competency Framework

The Tactical Agentic Coding course is built for mid-to-senior engineers actively shipping production code. Prerequisites: Git, GitHub CLI, Node.js 18+, Python 3.10+, package managers, build tools, testing frameworks, Bash.

**The 8 Tactics of Agentic Coding:**

1. **Leverage Point Stacking:** Mastering in-agent and through-agent leverage points. Stack stdout, types, tests, architecture for "inevitable agentic success"
2. **Autonomy Progression:** From "In the Loop" prompting to fully autonomous "Out of the Loop" systems
3. **Tool Call Awareness:** Only 15% of output tokens are tool calls; 85% is text. Top engineers maximize the tool-call ratio
4. **The Context/Prompt/Model/Tools Tetrad:** Context remains highest leverage
5. **Spec Prompts as First-Class Citizens:** Composable artifacts passed into other prompts, creating chains of deterministic + LLM execution
6. **Closed-Loop Validation:** Embedding test commands directly into spec prompts for self-validation
7. **Multi-Agent Orchestration:** Spawning, monitoring, coordinating parallel swarms via hooks
8. **Engineering with Exponentials:** Value scales with compute you can harness

### 4.2 What Companies Test For (Emerging Agentic Interviews)

- **Goal decomposition** with recursive structures, dependency tracking, conflict resolution
- **Meta-prompting** -- asking an LLM to write system prompts for another LLM
- **Few-shot tooling** -- embedding tool usage examples in prompts
- **Prompt chaining** -- composable prompt sequences
- **Failure mode discussion** -- candidates must describe trade-offs encountered in practice

---

## 5. Building vs. Learning vs. Shipping: Time Allocation Frameworks (Q7)

### 5.1 The IndyDevDan Model: "Learn by Building, Teach by Shipping"

IndyDevDan balances open-source (20+ repos), education (courses, YouTube), AND production work through a **single flywheel**:

1. **Build** a new pattern/tool as an experiment (single-file agent, drop zone, hooks system)
2. **Learn** by analyzing what works and what fails (observability-first)
3. **Ship** the result as both a GitHub repo AND educational content (YouTube video, course module)
4. **Teach** the pattern, which deepens understanding and generates audience
5. **Repeat** with the next pattern

**Key insight**: He never treats learning and shipping as separate activities. Every repo is simultaneously a learning exercise, a teaching artifact, and a production tool.

**Time split**: ~40% building, ~30% learning/experimenting, ~30% teaching/shipping

### 5.2 The Elvis Sun Model: "Automate Yourself Out of the Loop"

Elvis balances agent orchestration with raising two children by **maximizing agent autonomy**:

1. **Build** the orchestration layer (Zoe + OpenClaw + Obsidian) thoroughly upfront
2. **Automate** everything: morning briefings, security sweeps, error detection, feature implementation
3. **Ship** continuously via agents (50 commits/day average without touching editor)
4. **Learn** from agent failures and edge cases (Zoe's failure recovery improves over time)
5. **Live** -- the freed-up time goes to family, sales calls, and strategy

**Key insight**: The initial investment in Zoe's setup was substantial, but it compounds. Each improvement to the orchestrator improves ALL future work. The Obsidian vault accumulates business context that makes every future agent interaction more effective.

**Time split**: ~20% building orchestrator, ~10% learning, ~40% shipping (via agents), ~30% business/family

### 5.3 The steipete Model: "Develop Intuition Through Reps"

steipete balances building, learning, and community through **rapid iteration with reflection**:

1. **Build** rapidly with minimal tooling (Ghostty + Claude Code + screenshots)
2. **Learn** by doing thousands of prompts and developing intuition for model strengths/weaknesses
3. **Refactor** in dedicated phases (20% of time), entirely agent-executed
4. **Share** findings via blog posts and Essential Reading monthly compilations
5. **Community**: Claude Code Anonymous meetups worldwide for peer learning

**Key insight**: "Play with it. Develop intuition." Learning happens through volume, not study. The blog posts are retrospective analysis, not prescriptive planning. He explicitly warns against "spending time on RAG, subagents, or Agents 2.0" -- just do the work.

**Time split**: ~50% building/shipping, ~20% refactoring (agent-executed), ~15% learning via experimentation, ~15% community/content

### 5.4 The Huntley Model: "Engineer the Environment, Ship Overnight"

Geoffrey Huntley separates learning from execution by **time-shifting**:

1. **Learn** (daytime): study failure patterns, adjust prompts, tune specifications
2. **Build** (daytime): write PROMPT.md and IMPLEMENTATION_PLAN.md
3. **Ship** (overnight): Ralph loops execute while he sleeps
4. **Review** (morning): analyze overnight results, identify new failure patterns
5. **Teach** (ongoing): blog posts, workshops, conference talks

**Key insight**: The learning/shipping separation is temporal, not conceptual. Days are for thinking; nights are for executing. This is only possible because execution is fully autonomous and costs are minimal ($297 for 6 repos overnight at a YC hackathon).

**Time split**: ~35% learning/tuning, ~35% shipping (autonomous overnight), ~15% review, ~15% teaching

### 5.5 The Yegge Model: "Build the Factory, Then Operate It"

Steve Yegge invested heavily in building Gas Town (~189K LOC, 100% vibecoded) before using it for production work:

1. **Build** the orchestration system (months of investment)
2. **Learn** from operating it at scale (20-50+ agents reveal emergent patterns)
3. **Ship** through the Mayor -> Polecat pipeline
4. **Evolve** the system based on operational experience (Beads -> Dolt, Gas Town -> Wasteland)
5. **Federate** by sharing the system with others (Wasteland trust network, RPG gamification)

**Key insight**: The factory metaphor is central. You don't learn metalworking while running a factory. You build the factory, then you operate it, then you improve it based on operational data. "The core challenge in software development is shifting away from writing code and toward orchestrating work, managing context, and maintaining shared understanding across fleets of agents."

**Time split**: ~30% building/improving Gas Town, ~25% operating (agent management), ~20% shipping via agents, ~15% writing/community, ~10% learning

### 5.6 Synthesis: Recommended Time Allocation by Experience Level

Based on all five practitioners, here is a recommended allocation framework:

**Beginner (Month 1-3):**

| Activity | % | Focus |
|----------|---|-------|
| Learning | 50% | Understand one harness deeply (Claude Code recommended) |
| Building | 40% | Small projects, single agents, develop prompt intuition |
| Shipping | 10% | Low stakes, personal projects |

**Intermediate (Month 3-6):**

| Activity | % | Focus |
|----------|---|-------|
| Learning | 25% | Explore competing tools (20% budget), observability patterns |
| Building | 35% | Multi-agent setups, persistent state, CLAUDE.md evolution |
| Shipping | 40% | Client work, real projects with agent assistance |

**Advanced (Month 6-12):**

| Activity | % | Focus |
|----------|---|-------|
| Learning | 15% | Edge cases, failure patterns, model-specific strengths |
| Building | 25% | Orchestration layer, automation, cron-based workflows |
| Shipping | 60% | Autonomous agents shipping while you do other things |

**Expert (12+ months):**

| Activity | % | Focus |
|----------|---|-------|
| Learning | 10% | Meta-patterns, federated systems, frontier research |
| Building | 20% | Improving the orchestrator itself |
| Shipping | 70% | Agents ship autonomously; human focus on architecture + review |

### 5.7 The Anti-Pattern: What NOT to Do

All five practitioners converge on what to avoid:

1. **Do not optimize for tokens when you should optimize for velocity** (Yegge: "expensive as hell" is fine)
2. **Do not build elaborate frameworks before you have intuition** (steipete: "just talk to it" first)
3. **Do not treat learning and building as separate activities** (IndyDevDan: every repo teaches)
4. **Do not stay in the loop when you can sit on the loop** (Huntley: Ralph loops run overnight)
5. **Do not manually transfer context when you can encode it** (Elvis: Obsidian vault auto-syncs meeting notes)
6. **Do not use MCP when CLI exists** (steipete: removed all MCPs, pollute context)
7. **Do not run more agents than you can review** (coordination overhead scales super-quadratically per Phase 2 findings)

---

## 6. Hardware & Infrastructure Comparison

| Practitioner | Primary Machine | Monitor | Agent Capacity | Always-On | OS/Environment |
|-------------|----------------|---------|----------------|-----------|----------------|
| IndyDevDan | Not disclosed | Standard | Moderate (hooks-monitored) | No | Standard dev setup |
| Elvis Sun | Mac Studio M4 Max 128GB ($3,500) | Not disclosed | 10+ agents | Yes, 24/7 | macOS |
| steipete | Mac + Dell UltraSharp U4025QW | 3840x1620 (4 agents + Chrome visible) | 4 agents (sweet spot) | During work hours | macOS + Ghostty |
| Huntley | Hetzner bare metal server | Headless (no monitor) | Unlimited (overnight) | Yes, 24/7 | NixOS with ZFS/LUKS |
| Yegge | Not disclosed | Not disclosed | 20-50+ agents | Yes (Deacon patrol) | Go runtime |

---

## 7. Key Takeaways for the L-Thread Orchestrator

1. **Context engineering is the highest-leverage skill**: All five practitioners invest more in CLAUDE.md, PROMPT.md, Obsidian vaults, and Beads than in agent orchestration logic itself

2. **Persistent state is non-negotiable**: Whether it's files, git history, Obsidian, or Dolt -- state that survives agent death is what separates toy setups from production systems

3. **The orchestrator is the product**: Elvis's Zoe, Yegge's Gas Town, and IndyDevDan's hooks system ARE the competitive moat. The code agents produce is a commodity

4. **Sleep-time utilization separates tiers**: Elvis (cron at 2AM) and Huntley (overnight Ralph loops) get 8 extra productive hours by running agents while sleeping

5. **Review capacity is the bottleneck**: All five practitioners spend 25-30% of their time reviewing agent output. This is the last human-in-the-loop activity and the hardest to automate

6. **Cost is irrelevant at the frontier**: Yegge calls Gas Town "expensive as hell." Elvis spends $190/month. Huntley spent $297 for 6 repos overnight. None optimize for tokens -- they optimize for velocity

7. **The tools will change; the principles won't**: IndyDevDan's philosophy. Build intuition, not tool-specific muscle memory

8. **Two valid paths to scale**: Minimalist (steipete: 4 agents, no framework, "just talk to it") vs. Maximalist (Yegge: 50+ agents, 189K LOC framework). Both work. Choose based on your coordination capacity

9. **Agent hierarchy matters at scale**: Yegge's Mad Max roles (Mayor > Polecats > Dogs) and Elvis's Zoe meta-orchestrator prove that flat agent swarms break down. Someone/something must be the manager

10. **Voice and visual input are underexploited**: Elvis uses voice-first via Whisper; steipete uses screenshots for 50% of prompts. Text-only interaction is a bottleneck most practitioners have not yet solved

---

## 8. The Workflow IS the Skill (Synthesis)

Through IndyDevDan's lens of "Tools shape what you believe is possible," the workflows of the top practitioners reveal a clear hierarchy of mastery:

### Level 1: Tool User (Bottom 98%)
Uses AI coding tools as autocomplete. Writes code, asks AI for help. Linear workflow.

### Level 2: Agent Operator (Top 2%)
Runs multiple agents in parallel. Has CLAUDE.md rules, custom commands. Understands context management. Delegates execution but stays in the loop. (steipete's "just talk to it" approach)

### Level 3: System Builder (Top 0.1%)
Builds the orchestration layer itself. Writes specs, not code. Agents find work proactively. 24/7 autonomous operation. The human is the strategic brain; the system is the execution engine. (Elvis's Zoe, Yegge's Gas Town, Huntley's Ralph loops, IndyDevDan's hooks ecosystem)

### The Five Convergent Patterns

Across all top practitioners, five patterns emerge:

1. **Plan Before Execute:** Every practitioner uses some form of specification/planning before agent execution. IndyDevDan writes spec prompts with embedded tests. steipete reviews plans with GPT-5. Elvis scopes with Zoe via voice. Huntley writes PROMPT.md. Yegge communicates strategy to the Mayor.

2. **Parallel by Default:** No top practitioner runs a single agent. Range: 4 (steipete) to 50+ (Yegge). Parallelism is not optional -- it is the foundational multiplier.

3. **Verification as Architecture:** Not an afterthought. Test suites, browser automation, self-validation, Witness patrols, and observability dashboards are embedded in the workflow.

4. **Institutional Memory:** CLAUDE.md, Obsidian vaults, IMPLEMENTATION_PLAN.md, Beads/Dolt, event logs, Skills. Knowledge compounds across sessions. Every interaction teaches the system something.

5. **Custom Infrastructure:** All top practitioners build custom tooling -- CLIs, dashboards, hooks, slash commands, agent hierarchies. Off-the-shelf tools are starting points, not destinations. The custom layer is where competitive advantage lives.

### The IndyDevDan Conclusion

> "Of 100 engineers entering 2026, 98 will use AI coding tools, a handful will build custom agents, and only two will build the system that builds systems."

The workflow is not a set of tool choices. It is a *stance toward computation*. The top 0.1% treat every action through the Compute Advantage Equation: how do I maximize compute scaling and autonomy while minimizing costs? The answer is always: build the system, not the feature.

---

## Complete Source Index

### IndyDevDan (Dan Disler)
- [IndyDevDan GitHub](https://github.com/disler)
- [IndyDevDan Blog](https://indydevdan.com/)
- [Agentic Engineer (agenticengineer.com)](https://agenticengineer.com/)
- [Principled AI Coding Course](https://agenticengineer.com/principled-ai-coding)
- [Tactical Agentic Coding Course](https://agenticengineer.com/tactical-agentic-coding)
- [Agentic Drop Zones](https://github.com/disler/agentic-drop-zones)
- [Claude Code Hooks Multi-Agent Observability](https://github.com/disler/claude-code-hooks-multi-agent-observability)
- [Infinite Agentic Loop](https://github.com/disler/infinite-agentic-loop)
- [Single File Agents](https://github.com/disler/single-file-agents)
- [Big 3 Super Agent](https://github.com/disler/big-3-super-agent)
- [Install and Maintain](https://github.com/disler/install-and-maintain)
- [State of AI Coding - Engineering with Exponentials](https://agenticengineer.com/state-of-ai-coding/engineering-with-exponentials)
- [Compute Advantage Calculator](https://agenticengineer.com/compute-advantage-equation)
- [Top 2% Agentic Engineering Roadmap](https://agenticengineer.com/top-2-percent-agentic-engineering)

### Elvis Sun
- [Elvis Sun Website](https://www.elvis.so/)
- [Elvis Sun X - Agent Swarm Setup](https://x.com/elvissun/status/2025920521871716562)
- [Elvis Sun X - Building with OpenClaw Day 24-33](https://x.com/elvissun/status/2027578655569023338)
- [OpenClaw Agent Swarm Full Setup (DailyKoin)](https://dailykoin.com/ai-agent-swarm/)
- [OpenClaw Agent Swarm (Followin)](https://followin.io/en/feed/23522502)

### steipete (Peter Steinberger)
- [Peter Steinberger Blog](https://steipete.me/)
- [My Current AI Dev Workflow](https://steipete.me/posts/2025/optimal-ai-development-workflow)
- [Just Talk To It](https://steipete.me/posts/just-talk-to-it)
- [Commanding Your Claude Code Army](https://steipete.me/posts/2025/commanding-your-claude-code-army)
- [Command Your Claude Code Army, Reloaded](https://steipete.me/posts/command-your-claude-code-army-reloaded)
- [Claude Code Anonymous](https://steipete.me/posts/2025/claude-code-anonymous)
- [Essential Reading for Agentic Engineers - August 2025](https://steipete.me/posts/2025/essential-reading-august-2025)
- [Essential Reading - July 2025](https://steipete.me/posts/2025/essential-reading-july-2025)
- [Just One More Prompt](https://steipete.me/posts/just-one-more-prompt)
- [You Can Just Do Things (Eleanor Berger)](https://elite-ai-assisted-coding.dev/p/you-can-just-do-things-steipete)
- [The Creator of Clawd (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/the-creator-of-clawd-i-ship-code)
- [steipete GitHub](https://github.com/steipete)
- [tmuxwatch](https://github.com/steipete/tmuxwatch)
- [agent-rules](https://github.com/steipete/agent-rules)

### Geoffrey Huntley
- [Geoffrey Huntley Blog](https://ghuntley.com/)
- [Autoregressive Queens of Failure](https://ghuntley.com/gutter/)
- [Everything is a Ralph Loop](https://ghuntley.com/loop/)
- [Ralph Wiggum as a Software Engineer](https://ghuntley.com/ralph/)
- [The Future Belongs to People Who Can Just Do Things](https://ghuntley.com/dothings/)
- [I Dream of Roombas](https://ghuntley.com/ktlo/)
- [Six-Month Recap: Web Directions Melbourne](https://ghuntley.com/six-month-recap/)
- [How to Build a Coding Agent (Workshop)](https://ghuntley.com/agent/)
- [How to Ralph Wiggum (GitHub)](https://github.com/ghuntley/how-to-ralph-wiggum)
- [Inventing the Ralph Wiggum Loop (Dev Interrupted)](https://devinterrupted.substack.com/p/inventing-the-ralph-wiggum-loop-creator)
- [Inventing the Ralph Wiggum Loop Podcast (LinearB)](https://linearb.io/dev-interrupted/podcast/inventing-the-ralph-wiggum-loop)
- [Mastering Ralph Loops (LinearB Blog)](https://linearb.io/blog/ralph-loop-agentic-engineering-geoffrey-huntley)
- [A Brief History of Ralph (HumanLayer)](https://www.humanlayer.dev/blog/brief-history-of-ralph)
- [Ralph Wiggum Plugin (Claude Code)](https://github.com/anthropics/claude-code/blob/main/plugins/ralph-wiggum/README.md)

### Steve Yegge
- [Welcome to Gas Town (Medium)](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04)
- [Gas Town Emergency User Manual (Medium)](https://steve-yegge.medium.com/gas-town-emergency-user-manual-cf0e4556d74b)
- [Welcome to the Wasteland: A Thousand Gas Towns (Medium)](https://steve-yegge.medium.com/welcome-to-the-wasteland-a-thousand-gas-towns-a5eb9bc8dc1f)
- [The Future of Coding Agents (Medium)](https://steve-yegge.medium.com/the-future-of-coding-agents-e9451a84207c)
- [Gas Town GitHub](https://github.com/steveyegge/gastown)
- [A Day in Gas Town (DoltHub Blog)](https://www.dolthub.com/blog/2026-01-15-a-day-in-gas-town/)
- [Gas Town Agent Patterns (Maggie Appleton)](https://maggieappleton.com/gastown)
- [Gas Town SE Daily Podcast (Feb 2026)](https://softwareengineeringdaily.com/2026/02/12/gas-town-beads-and-the-rise-of-agentic-development-with-steve-yegge/)
- [Gas Town Multi-Agent Framework Analysis](https://reading.torqsoftware.com/notes/software/ai-ml/agentic-coding/2026-01-15-gas-town-multi-agent-orchestration-framework/)
- [Gas Town Decoded (ASCII News)](https://ascii.co.uk/news/article/news-20260118-4f2079f3/steve-yegges-gas-town-ai-agent-orchestration-system-decoded)
- [GasTown and Two Kinds of Multi-Agent](https://paddo.dev/blog/gastown-two-kinds-of-multi-agent/)
- [Gas Town is a Glimpse Into the Future](https://johncodes.com/archive/2026/01-16-a-glimpse-into-the-future/)
- [Gas Town Hall](https://gastownhall.ai/)
- [The AI Vampire (Hanselminutes Podcast)](https://hanselminutes.com/1035/the-ai-vampire-with-gas-towns-steve-yegge)
- [Steve Yegge on AI Agents (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/steve-yegge-on-ai-agents-and-the)

### Anthropic Official Sources
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Writing Tools for Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Building Agents with Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)

### General / Cross-Cutting
- [METR Study: AI Impact on Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [How Agentic AI Will Reshape Engineering (CIO)](https://www.cio.com/article/4134741/how-agentic-ai-will-reshape-engineering-workflows-in-2026.html)
- [12-Factor Agents (GitHub)](https://github.com/humanlayer/12-factor-agents)
- [Advanced Context Engineering for Coding Agents (GitHub)](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents)
