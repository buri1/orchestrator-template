# Agent Orchestration — Running Multiple Agents at Scale

> **Zach Lloyd (Warp, Founder/CEO) — Coding Agents: AI Driven Dev Conference 2026**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=99Kxkemj1g8 (04:07:22 - 04:34:42) |
| Speaker | Zach Lloyd — Founder & CEO, Warp (ex-Principal Engineer, Google) |
| Event | Coding Agents: AI Driven Dev Conference 2026 |
| Duration | ~27 min |
| Date | 2026-03-08 |
| Topics | agent orchestration, cloud agents, multi-agent parallelism, team visibility, agent-as-primitive, Warp Oz |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.)*

---

## Key Takeaways

1. **2026 is the year of agent orchestration** — The transition from hand-coding (pre-2025) to interactive prompting (2025) is now giving way to orchestrated multi-agent workflows (2026). The bottleneck has shifted from "can agents code?" to "how do you manage many agents at once?"

2. **Laptop limits are the forcing function for cloud agents** — Running 4-5 agents concurrently on a million-line Rust codebase literally maxes out local hardware. Agents also can't run when the laptop sleeps. Cloud hosting is not optional — it's a prerequisite for scale.

3. **Two classes of orchestration problems are emerging** — (a) Long single-threaded agents that exceed context windows and need durable primitives for hard tasks; (b) Multi-agent teams where agents coordinate on a shared task. Both need new infrastructure.

4. **Agents are a new programming primitive** — Beyond interactive coding and automations, agents are becoming embeddable intelligence features inside apps (e.g., Warp's Powerfixer TUI for GitHub issue triage that can launch fix-agents directly from the triage UI).

5. **Five cloud orchestration primitives** — Zach identifies the building blocks: (1) Environments (toolchain + code access definition), (2) Hosting (cloud sandboxes — Daytona, E2B, Docker, Namespace), (3) Tracking/observability (auto-tracking of all agent runs across a team), (4) Handoff (human-in-the-loop for the 80% → 100% gap), (5) Full programmability (API/SDK/CLI to launch, configure, and retrieve artifacts).

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly addresses multi-agent orchestration, cloud agent execution, team-wide agent visibility — all core to our L-Thread architecture and roadmap. Zach's 5 primitives map almost 1:1 to what we're building. |
| **Actionable** | 7/10 | The primitives framework is highly validating but Oz is a proprietary product. The architectural patterns (autotracking, named agents/skills, handoff) are directly applicable. Powerfixer pattern (TUI + embedded agent launch) is a concrete pattern we could adopt. |

---

## Summary

Zach Lloyd, founder and CEO of Warp (an agentic terminal), presents his thesis that 2026 will be the year agent orchestration becomes critical infrastructure. He starts from the concrete pain point that his own team at Warp — working on a million-line Rust codebase — is hitting physical laptop limits running 4-5 agents concurrently. This is not a theoretical problem; it's happening now across the industry as developers shift from hand-coding to prompt-driven multi-agent workflows.

He identifies two emerging classes of problems that need new infrastructure: (1) long-running single agents that exceed context windows and lose coherence after compaction, and (2) multi-agent teams that need to coordinate on shared tasks. Both require moving agents off laptops and into the cloud, with proper orchestration primitives.

Zach outlines five key primitives for cloud agent systems: environment definitions (toolchains and code access), hosting (cloud sandboxes via Daytona, E2B, Docker, Namespace), tracking/observability (auto-recording of all agent runs across a team), handoff (human-in-the-loop when agents only get 80% of the way), and full programmability (API/SDK/CLI for launching and managing agents). He explicitly notes the value of harness-agnostic infrastructure — the ability to run any coding agent (Claude Code, Codex, Warp's own agent) through the same orchestration layer.

He demos three use cases through Warp's new product Oz: (1) massively parallel cloud agent runs (launching agents A through E on different spreadsheet formula implementations simultaneously), (2) named agents with scheduled automations (e.g., weekly feature-flag dead-code cleanup, release-triggered documentation updates), and (3) agents embedded as intelligence features in apps (Powerfixer, an open-source TUI for GitHub issue triage that can spawn fix-agents). He references Stripe Minions and Ramp as companies that have built internal agent orchestration systems, positioning Oz as the off-the-shelf alternative.

The overall vision is making agent work a "team sport" — moving from invisible individual laptop sessions to shared, tracked, steerable cloud-based agent runs with access control and artifact tracing.

---

## Notable Quotes

> "I haven't written code in the last six months." — 04:10:15

> "2026 will be the year of agent orchestration." — 04:08:46

> "Agents are a new programming primitive." — 04:16:04

> "Building with agents becomes a team sport." — 04:27:54

> "You want the ability to see what these agents are doing when they run in the cloud... you can guide them, you can step in if they only do 80% of the work." — 04:19:20

> "The existing systems for doing this tend to be very rigid — like you have to set up a Docker environment and run it on some cloud host — and so we're really trying to lean into: you can bring the agent into your own infrastructure." — 04:34:25

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| Warp Oz product page (search: warp.dev/oz) | Cloud agent orchestration product with API/SDK — direct competitor/complement to our approach | `/tool-catalogue` |
| Powerfixer (open-source, mentioned as available) | TUI app for GitHub issue triage with embedded agent launch — concrete pattern for agent-in-app | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Warp | Agentic terminal with built-in coding agents, basis for Oz | No — consider `/tool-catalogue` |
| Warp Oz | Cloud agent orchestration platform ("Vercel for cloud agents") | No — consider `/tool-catalogue` |
| Stripe Minions | Referenced as example of internal corporate agent orchestration | Yes — [stripe-minions.md](../orchestration-platforms/stripe-minions.md) |
| Ramp | Mentioned as another company launching internal agent orchestration | No |
| Daytona | Listed as cloud sandbox provider for agent hosting | Yes — [daytona.md](../infrastructure/daytona.md) |
| E2B | Listed as cloud sandbox provider for agent hosting | Yes — [e2b.md](../infrastructure/e2b.md) |
| Docker Sandboxes | Listed as hosting option for cloud agents | No (generic) |
| Namespace | Listed as cloud sandbox provider | No — consider `/tool-catalogue` |
| Claude Code | Mentioned as comparable coding agent | No (our own stack) |
| OpenAI Codex | Mentioned as comparable coding agent (transcribed as "codeex") | Yes — [openai-codex.md](../agent-harnesses/openai-codex.md) |
| GitHub Agents | Mentioned in Q&A as similar cloud-based coding agent concept | No |
| Powerfixer | Open-source TUI for GitHub issue triage with agent launch capability | No — consider `/tool-catalogue` |
| Google Docs | Zach's former product at Google; also used as analogy ("Google Docs for agents") | N/A |

---

## Action Items

- [ ] Evaluate Warp Oz as a cloud agent runtime — could it replace our tmux+worktree approach for cloud execution?
- [ ] Study Powerfixer (open-source) as a pattern for embedding agent launch into TUI/app workflows
- [ ] Compare Oz's "autotracking" feature against our orchestrator-state.json tracking — are we missing team-wide visibility?
- [ ] Research Namespace as a cloud sandbox provider (not yet catalogued)
- [ ] Validate our primitives list against Zach's 5 primitives — do we have gaps in environment definition or handoff?
- [ ] Consider the "named agents" / skill-based scheduled automation pattern for our own system (weekly maintenance agents)
