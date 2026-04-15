# Talking Points: Sysadmin (Claude Code User)

**Meeting**: OmniPort Hildesheim — Smart City Bid
**Audience**: Experienced sysadmin, personal Claude Code / AI prototyping experience
**Goal**: Technical credibility + responsible engineering reassurance

---

## 1. Technical Credibility Points

### Orchestrator Architecture — "We don't vibe-code, we engineer"

- We built a custom **agent orchestration system** (L-Thread Orchestrator v3) that manages parallel Claude Code workers via tmux sessions
- The orchestrator itself **never writes code** — it only delegates, reviews, and coordinates. Strict separation of concerns between controller and workers
- Workers are spawned as isolated Claude Code processes in separate tmux windows, each with their own task prompt, branch, and lifecycle
- State is persisted to JSON after every phase transition — if the orchestrator crashes or its context compacts, it reads the state file and resumes exactly where it left off
- We use **git worktrees** for parallel agent development — multiple workers on different feature branches simultaneously without working-directory conflicts
- The system has a 10-phase loop: task assignment, worker spawn, PR polling, code review, fix cycles (max 3), merge, E2E test, mark done, devlog, auto-continue
- **SessionStart and PreCompact hooks** that inject orchestrator rules and probe tmux session state — context survives compaction automatically

### Matching Engine — Not a ChatGPT Wrapper

- The matching system uses **deterministic algorithmic scoring**, not LLM-based matching
- Multi-factor scoring: Studiengang, Standort, Faehigkeiten, Verfuegbarkeit, Branche, Erfahrungslevel — each contributes weighted points
- Scores are reproducible and explainable — every match comes with human-readable reasons ("Studiengang passt", "Standort Hildesheim") and actionable improvement suggestions
- The architecture is designed for a real scoring engine (Supabase queries, weighted vectors) — the demo uses deterministic mock data to show the UX flow, and production will plug in the real data layer

### KI-Moderation System — Layered, Not Naive

- **Three-tier traffic-light system**: Gruen (auto-approve), Gelb (manual review), Rot (auto-flag)
- Current implementation: **deterministic pre-screening** — title quality, description depth, tag coverage, contact info presence, flag-word detection (spam/werbung/gratis etc.)
- Scoring is transparent: every decision comes with a human-readable reason string ("Titel aussagekraeftig. Beschreibung ausfuehrlich. Gute Verschlagwortung.")
- Architecture is ready for LLM upgrade path (Groq/Llama for speed, <3s SLA per item) but the deterministic layer stays as a fast first-pass filter
- Key principle: **AI pre-screens, humans approve** — the system reduces moderator workload but never replaces human judgment

### Stack Choice Rationale

- **Next.js 16** (App Router): Server components, streaming, edge-ready — the framework the Vercel/React ecosystem is converging on
- **Supabase**: Open-source Firebase alternative, Postgres underneath, Row Level Security for DSGVO, self-hostable in Frankfurt
- **shadcn/ui**: Not a component library — it's copy-paste components you own. No vendor lock-in, full control, accessible by default (WCAG)
- **TypeScript end-to-end**: Type safety from database schema to UI props. Catches bugs at compile time, not in production

---

## 2. Security & Responsibility Points

### Code Quality Gates

- **All AI-generated code goes through PR review** — the orchestrator runs `gh pr diff` and inspects every change before merging
- Fix cycles: if review finds issues, a fix worker is spawned with specific feedback, up to 3 cycles. If it still fails, the story is skipped and flagged for manual attention
- `pnpm typecheck && pnpm build` must pass before any PR is created — type errors and build failures are caught at the worker level
- 19 test files with unit tests for matching, moderation, branding, routing, and demo auth

### No Credentials in AI Context

- AI agents never see production API keys, database credentials, or user data
- Environment variables are managed through `.env.local` (gitignored) — agents work with mock data and demo fixtures
- The orchestrator itself only reads/writes state JSON files and devlog entries — never application code or config

### DSGVO-Compliant Hosting

- Supabase self-hosted option with **Frankfurt (eu-central-1)** region — data never leaves Germany
- Row Level Security (RLS) at the Postgres level — access control is enforced by the database, not just the application
- BundID integration path for identity verification (already prototyped in the Leihothek module)
- All user-facing data flows are designed for DSGVO compliance from day one, not retrofitted

### Open-Source Compliance

- Stack is 100% OSS-compatible: Next.js (MIT), Supabase (Apache 2.0), shadcn/ui (MIT), Tailwind (MIT)
- No proprietary runtime dependencies — the app can be deployed on any Node.js hosting
- AI tooling (Claude Code) is used in development only — zero AI dependencies in the production runtime

### E2E Testing Gate

- **Chrome DevTools MCP** for automated visual testing — not just API-level tests
- Every story must pass desktop AND mobile (iPhone 14 Pro, 390x844) screenshot verification before being marked done
- Console error checking is part of the gate — no silent JavaScript errors in production
- If E2E fails, a fix worker is automatically spawned — the loop does not continue until visual quality is confirmed

### Moderation Pipeline

- AI pre-screening produces a confidence score and category, but **final approval is always human**
- Traffic-light system means moderators focus their attention on Gelb/Rot items — Gruen items can be bulk-reviewed
- Flag-word detection is deterministic (not LLM-based) — no hallucination risk in the safety-critical path
- Full audit trail: every moderation decision is timestamped with reason strings

---

## 3. "Insider" Signals

These are details that only someone who actually builds with Claude Code would recognize. Drop them naturally in conversation:

### MCP Servers for Browser Automation
- "We use Chrome DevTools MCP to take screenshots after every merge — desktop and mobile viewports. It's wired into the orchestrator loop so no PR gets merged without visual verification."
- This tells him: we know what MCP servers are, we've integrated them into our workflow, and we use them for quality assurance — not just demos.

### Agent Orchestration Patterns
- "We tried multi-agent setups early on — spawning 5-6 agents in parallel. Learned fast that coordination overhead grows exponentially. There's a DeepMind paper that quantifies it at exponent 1.724. We settled on 2-3 concurrent workers max."
- "Each worker gets its own feature branch and git worktree. We learned the hard way that shared working directories cause merge conflicts between agents."
- This tells him: we've hit the real scaling walls and solved them, not just read about it.

### Context Window Management
- "The orchestrator has PreCompact and SessionStart hooks. Before context compaction, it persists all state to JSON. After compaction, the SessionStart hook re-injects the absolute rules and probes all tmux sessions. The agent resumes without losing track of where it was."
- "We use structured handoff prompts — when an agent's context fills up, the next one gets a condensed briefing with the exact phase, branch, PR number, and remaining tasks."
- This tells him: we understand the 200K token limit is real, and we've engineered around it.

### "Vibe Coding" vs. Engineered AI Development
- "There's a big difference between prompting Claude to 'build me an app' and engineering a system where Claude workers operate within strict constraints — typed specs, branch isolation, PR review, E2E gates, automatic rollback on failure."
- "Our orchestrator has 4 absolute rules, and the first one is literally 'DU BIST KEIN ENTWICKLER' — the orchestrator is forbidden from writing code. It can only spawn workers to do it. That constraint is what makes it reliable."
- This tells him: we know the difference between a toy demo and a production-grade workflow.

### Practical Details Only a Practitioner Would Know
- "`unset CLAUDECODE` before spawning sub-agents — otherwise the child process thinks it's already inside Claude Code and behaves differently"
- "We poll with `tmux capture-pane`, never `sleep` — event-driven monitoring, not hope-based"
- "Sonnet gets stuck on complex tasks, so we only spawn Opus agents for real work"
- These small details are impossible to fake. They signal hands-on experience.

---

## 4. Potential Questions & Answers

### "How do you handle hallucinations in generated code?"

**Answer**: "Three layers. First, TypeScript — the compiler catches type-level nonsense immediately. Second, every worker must pass `pnpm typecheck && pnpm build` before creating a PR. Third, the orchestrator reviews the PR diff before merging. If the code looks wrong, a fix worker gets spawned with specific feedback. We've also found that giving agents structured specs with exact component names, file paths, and expected behavior dramatically reduces hallucination compared to open-ended prompts."

### "What happens when the AI generates insecure code?"

**Answer**: "The AI never touches production credentials — those live in `.env.local` which is gitignored. Agents work with mock data. For security-critical paths like authentication and authorization, we use Supabase Row Level Security which is enforced at the database level — even if the application code has a bug, the database won't serve unauthorized data. And the moderation system is deliberately deterministic for safety-critical decisions — we don't use LLMs where false positives or false negatives could cause harm."

### "How do you ensure consistency across AI-generated modules?"

**Answer**: "Shared component architecture. We have 27 shared component directories — matching, moderation, navigation, filters, map, portal-shell, etc. Every new page reuses these building blocks. The agents are given explicit specs that reference existing components by name and file path. TypeScript interfaces enforce the contracts between modules. And the CLAUDE.md file in every project contains the architectural rules — every agent reads it on startup."

### "What's your testing strategy for AI-generated code?"

**Answer**: "Unit tests for business logic — matching scoring, moderation classification, route resolution, branding colors. E2E visual testing via Chrome DevTools MCP for every merged PR — desktop and mobile viewports. Console error detection. And human review of every PR diff before merge. We don't trust AI output — we verify it at multiple levels."

### "How do you handle context limits / lost context?"

**Answer**: "Engineered around it from day one. PreCompact hooks persist state to JSON before every compaction. SessionStart hooks re-inject absolute rules and probe all running sessions after compaction. The orchestrator state file has the current phase, active workers, story ID, branch name, PR number — everything needed to resume. We've had compactions mid-sprint and the system recovered automatically. Compaction count is tracked in the state file so we can monitor how often it happens."

### "What about vendor lock-in with Anthropic?"

**Answer**: "Two angles. For the product: zero AI dependencies in production runtime. The app is pure Next.js + Supabase + TypeScript. No Anthropic API calls in the deployed code. For development: Claude Code is our primary tool, but the orchestrator pattern is model-agnostic. The workers are Claude Code processes, but the orchestration logic — tmux management, state persistence, PR review, E2E gates — would work with any CLI-based AI coding tool. The prompts would need adaptation, but the architecture transfers."

### "Is the generated code maintainable by developers who don't use AI tools?"

**Answer**: "Yes — that's a design constraint. The codebase is 256 TypeScript files, ~29,000 lines, with standard Next.js App Router patterns, shadcn/ui components, and Supabase queries. A developer who knows React and TypeScript can navigate it immediately. We don't use AI-specific abstractions or meta-programming. The shared component library has clear interfaces. Every page follows the same layout/data-fetching pattern. A new developer would look at the code and not know it was AI-generated — and that's the point."

---

## 5. The "Wow Moment"

### Sprint Velocity Data Point

**"We built the entire OmniPort prototype in 9 days."**

Specifics to drop:
- 204 commits, 48 merged PRs
- 38 pages across 6 portals (HiArbeit, HiEngagement, HiGruendung, Leihothek, Quartiere, Wissenstransfer)
- Full admin dashboard with moderation workstation, analytics, taxonomy management, audit log, trend reports, verification workflows
- Matching engine with explainable scores
- KI-Moderation system with traffic-light classification
- Interactive Hildesheim map with district views
- BundID authentication prototype
- Mobile-responsive across all pages
- Deployed live on Vercel, connected to Supabase

**"One developer. Nine days. Two hundred commits."**

Then pause. Let that land.

### Follow-Up: Show the Orchestrator

If he's interested (and he will be), offer to show the orchestrator in action:
- "Want to see how it actually works? I can show you the tmux session — the orchestrator in window 0, workers spawning in windows 1-3, PRs being created and merged automatically."
- Show the state JSON file updating in real-time
- Show a worker receiving a task prompt and producing a PR
- Show the E2E screenshot gate catching a visual regression

This is the kind of thing a sysadmin who uses Claude Code will find genuinely fascinating — because he's probably tried to build something similar and knows how hard the coordination problem is.

---

## Quick-Reference: Conversation Flow

1. **Open with velocity**: "We prototyped the full platform in 9 days — 38 pages, 6 portals, admin dashboard, matching, moderation."
2. **Explain why**: "Not by vibe-coding — we built an orchestration system that manages AI workers with the same discipline you'd apply to a CI/CD pipeline."
3. **Drop insider signals**: MCP servers, context compaction, worktree isolation, capture-pane polling
4. **Address his concerns before he raises them**: "All AI code is PR-reviewed. No production creds in agent context. Deterministic moderation, not LLM hallucination. DSGVO-compliant hosting in Frankfurt."
5. **Offer the demo**: "I can show you the orchestrator running live if you're curious."
