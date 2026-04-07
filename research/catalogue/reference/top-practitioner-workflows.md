# Top Practitioner Workflows -- Reference

**Type:** Reference / Comparison
**Source:** Phase 2 Research (2026-03-05)
**Practitioners:** IndyDevDan, Elvis Sun, steipete, Geoffrey Huntley, Steve Yegge

---

## Practitioner Profiles

| Practitioner | Background | Philosophy | Archetype |
|---|---|---|---|
| IndyDevDan (Dan Disler) | 10+ yr engineer, 20+ GitHub repos, 2 courses | "Knowing is engineering; not knowing is vibe coding" | Spec-First Architect |
| Elvis Sun (@elvissun) | 8 yr Google/Firebase, solo founder, father of 2 | "An AI orchestrator as an extension of yourself" | Voice-First Delegator |
| steipete (Peter Steinberger) | Ex-PSPDFKit founder, 410K followers | "Just talk to it. Play with it. Develop intuition." | Chaos-Engineering Pragmatist |
| Geoffrey Huntley | Ex-Canva, now Sourcegraph/Amp | "Sit ON the loop, not IN it" | Overnight Autonomy Maximizer |
| Steve Yegge | Ex-Google/Amazon, Sourcegraph | "AI agents are ephemeral. Work context should be permanent." | Factory Operator |

---

## Tool Stacks Compared

| Tool Category | IndyDevDan | Elvis Sun | steipete | Huntley | Yegge |
|---|---|---|---|---|---|
| Primary agent | Claude Code (80%) | Routed by Zoe (Codex/Claude/Gemini) | Claude Code | Claude Code in bash loops | Polecats (Claude Code) |
| Orchestrator | Infinite Agentic Loop | Zoe (OpenClaw) | None (manual) | Ralph Wiggum Loop | Gas Town (189K LOC Go) |
| State system | Hooks + files | Obsidian vault | CLAUDE.md (living doc) | IMPLEMENTATION_PLAN.md + git | Beads + Dolt |
| Terminal | Standard | Standard | Ghostty | Headless (NixOS) | Not disclosed |
| Observability | Custom hooks dashboard (Vue + SQLite + WebSocket) | Telegram notifications | GPT-5 plan review | AI supervisor + git history | Witness/Deacon patrol agents |
| Voice/visual | Standard text | Voice via Whisper API | Screenshots (50% of prompts) | Text only | Text via Mayor |
| Review tool | Real-time observability | Telegram PR alerts | GPT-5/Codex | Morning git log review | Witness reports |
| Secondary agents | Gemini CLI, Codex CLI | Codex, Claude Code, Gemini | GPT-5/Codex (review only) | None | Dogs (maintenance) |

---

## Daily Routines Compared

### IndyDevDan
| Phase | Activities |
|---|---|
| Morning | Agentic Drop Zones process overnight files; review observability dashboards |
| Core work | Write spec prompts with embedded tests; deploy agents via slash commands |
| Monitoring | Hooks dashboard (swim lanes, pulse charts, failure events) |
| Evening | YouTube content, course updates |

### Elvis Sun
| Phase | Activities |
|---|---|
| 2:00 AM (cron) | Zoe spawns 4 Codex agents for security sweeps |
| 7:00 AM (cron) | Automated morning briefing + Sentry scan + feature detection |
| Morning | Review briefing; merge 7 PRs in 30 min; client calls |
| After meetings | Voice delegation via phone -> Whisper -> Obsidian -> Zoe |
| Continuous | Zoe routes tasks, babysits failing agents, rewrites prompts |

### steipete
| Phase | Activities |
|---|---|
| Morning | Launch Claude Code in Ghostty; assess blast radius; check CLAUDE.md |
| Core work | 1-2 agents (features) or ~4 agents (cleanup/tests); work on main branch |
| Prompting | Concise 1-2 sentence prompts + screenshots; /clear often |
| Review | GPT-5 for plans; visual inspection of output |
| Refactoring | Dedicated 20% phases; entirely agent-executed |

### Geoffrey Huntley
| Phase | Activities |
|---|---|
| Daytime | Write PROMPT.md + IMPLEMENTATION_PLAN.md; tune prompts based on failures |
| Evening | Launch Ralph loops: `while :; do cat PROMPT.md \| claude-code ; done` |
| Overnight | Fully autonomous, headless, push to master, AI supervisor corrects errors |
| Morning | Review git history; analyze failure patterns; adjust prompts |

### Steve Yegge
| Phase | Activities |
|---|---|
| Morning | Mayor status report; review Witness/Deacon patrol results |
| Active work | Dispatch Convoys; Mayor routes to Polecats for execution |
| Review | Check Polecat MRs; Witness flags stuck agents; Deacon triggers recovery |
| Evening | Wasteland federation work; community coordination |

---

## Attention Allocation

| Activity | IndyDevDan | Elvis Sun | steipete | Huntley | Yegge | Average |
|---|---|---|---|---|---|---|
| Spec/context engineering | 25% | -- | -- | 35% | -- | ~20% |
| Active orchestration | 10% | 15% | 20% | 10% | 20% | ~15% |
| Review/verification | 25% | 25% | 30% | 25% | 25% | ~26% |
| Learning/tooling | 20% | -- | 15% | 15% | -- | ~17% |
| Strategy/business | -- | 20% | -- | -- | 20% | ~13% |
| Content/teaching | 20% | -- | 15% | 15% | 20% | ~14% |
| Client/sales/family | -- | 40% | -- | -- | -- | -- |
| Code writing | 0% | 0% | 0% | 0% | 0% | 0% |

---

## Key Numbers

| Metric | Value | Practitioner |
|---|---|---|
| Peak commits/day | 94 (during 3 client calls, no editor) | Elvis Sun |
| Average commits/day | ~50 | Elvis Sun |
| PRs merged in 30 min | 7 | Elvis Sun |
| Repos built overnight | 6 (for $297 API cost) | Huntley (YC hackathon) |
| Longest autonomous loop | 3 months (built a full programming language) | Huntley |
| Gas Town codebase | ~189K LOC Go, 100% vibecoded | Yegge |
| Max parallel agents | 20-50+ | Yegge |
| Sweet spot agents | 1-4 | steipete |
| Monthly API cost (Elvis) | ~$190 ($100 Claude + $90 Codex) | Elvis Sun |
| Hardware investment | $3,500 Mac Studio M4 Max 128GB | Elvis Sun |
| Time to initial setup | ~3 hours (Obsidian + Zoe) | Elvis Sun |
| Deployment speed | <30 seconds with self-healing | Huntley |
| X impressions payout | $1,505 for 9.3M impressions | Elvis Sun |
| Current MRR | $420+ | Elvis Sun |

---

## Hardware & Infrastructure

| Practitioner | Machine | Monitor | Agent Capacity | Always-On | OS |
|---|---|---|---|---|---|
| IndyDevDan | Not disclosed | Standard | Moderate (hooks-monitored) | No | Standard dev |
| Elvis Sun | Mac Studio M4 Max 128GB ($3,500) | Not disclosed | 10+ agents | Yes, 24/7 | macOS |
| steipete | Mac | Dell UltraSharp U4025QW (3840x1620) | 4 (sweet spot) | Work hours | macOS + Ghostty |
| Huntley | Hetzner bare metal | Headless | Unlimited (overnight) | Yes, 24/7 | NixOS + ZFS/LUKS |
| Yegge | Not disclosed | Not disclosed | 20-50+ | Yes (Deacon patrol) | Go runtime |

---

## Branch & Git Strategy

| Practitioner | Strategy | Notes |
|---|---|---|
| IndyDevDan | Varies | Hooks-based observability |
| Elvis Sun | PR-based | Agent-submitted PRs, human merges |
| steipete | Direct to main | Most controversial; no branches, no worktrees |
| Huntley | Push to master | No branches at all; overnight autonomous |
| Yegge | Refinery-managed merges | Merge coordination across Rigs |

---

## Failure Recovery Patterns

| Practitioner | Pattern | Mechanism |
|---|---|---|
| IndyDevDan | Observability-first | Real-time event stream; PostToolUseFailure surfaced immediately; deny_tool() guards |
| Elvis Sun | Context-enriched retry | Zoe analyzes failure, enriches prompt with business context, may reroute to different model |
| steipete | Chaos tolerance | Careful area separation; GPT-5 plan review; file size limits (<500 LOC); rule-based guardrails |
| Huntley | Prompt evolution | Failures become prompt tuning data; AI supervisor corrects in headless mode; deployment self-heals |
| Yegge | Organizational recovery | Witness detects stuck agents; Deacon triggers recovery; Dogs handle cleanup; `gt seance` queries dead agents |

---

## Convergent Patterns (All Five Share)

1. **Zero production code written by human** -- 100% delegated to agents
2. **Persistent state survives agent death** -- files, git, vaults, databases
3. **Context engineering > prompt engineering** -- the "soil" matters more than the seed
4. **CLI tools over GUI/MCP** -- all practitioners favor CLIs; steipete removed all MCPs
5. **Cost is secondary to velocity** -- $190/mo to "expensive as hell"; no one optimizes tokens
6. **Review is the bottleneck** -- 25-30% of time across all five
7. **Custom infrastructure is the moat** -- hooks, Zoe, Gas Town, Ralph loops, AGENTS.MD

---

## Divergent Patterns (Spectrum)

| Dimension | Minimalist | Maximalist |
|---|---|---|
| Agent count | steipete (1-4) | Yegge (20-50+) |
| Autonomy | steipete (supervised, interactive) | Huntley (overnight, unsupervised) |
| Framework size | steipete (zero framework, anti-framework) | Yegge (189K LOC Gas Town) |
| State system | steipete (CLAUDE.md text file) | Yegge (Beads + Dolt database) |
| Review timing | IndyDevDan (real-time dashboard) | Huntley (next morning git log) |
| Sleep utilization | IndyDevDan/steipete (none) | Elvis (2AM cron) + Huntley (overnight loops) |
| Input modality | Text-only (Huntley) | Voice (Elvis) / Screenshots (steipete) |
| Org model | Huntley (flat, single process) | Yegge (hierarchy: Mayor > Polecats > Dogs) |

---

## Time Allocation Models

| Model | Build | Learn | Ship | Other |
|---|---|---|---|---|
| IndyDevDan: "Learn by Building, Teach by Shipping" | 40% | 30% | 30% (teaching = shipping) | -- |
| Elvis Sun: "Automate Yourself Out of the Loop" | 20% | 10% | 40% (via agents) | 30% business/family |
| steipete: "Develop Intuition Through Reps" | 50% | 15% | 20% (refactoring) | 15% community |
| Huntley: "Engineer the Environment, Ship Overnight" | 35% | 35% (tuning) | 15% (review) | 15% teaching |
| Yegge: "Build the Factory, Then Operate It" | 30% | 10% | 20% (via agents) | 40% operating + community |

---

## Mastery Levels

| Level | Description | Representative |
|---|---|---|
| Level 1: Tool User (98%) | AI as autocomplete; writes code, asks AI for help | -- |
| Level 2: Agent Operator (top 2%) | Multiple agents; CLAUDE.md; context management; stays in loop | steipete |
| Level 3: System Builder (top 0.1%) | Builds orchestration layer; writes specs not code; 24/7 autonomous | Elvis/Yegge/Huntley/IndyDevDan |

---

## Anti-Patterns (Consensus)

1. Do not optimize tokens when you should optimize velocity
2. Do not build frameworks before you have intuition
3. Do not treat learning and building as separate activities
4. Do not stay in the loop when you can sit on the loop
5. Do not manually transfer context when you can encode it
6. Do not use MCP when CLI exists
7. Do not run more agents than you can review

---

## Burak's Notes

*(empty)*
