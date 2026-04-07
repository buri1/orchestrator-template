# Warp / Oz

> **The agentic development environment, built for coding with multiple AI agents — combining a modern Rust terminal with Oz, a cloud agent orchestration platform.**

| Field | Value |
|-------|-------|
| Category | 🎛️ Orchestration Platforms |
| Repository | [warpdotdev/Warp](https://github.com/warpdotdev/Warp) (issues-only), [warpdotdev/oz-agent-action](https://github.com/warpdotdev/oz-agent-action), [warpdotdev/oz-skills](https://github.com/warpdotdev/oz-skills) |
| GitHub Stars | 26,096 (as of 2026-03-08) |
| Publisher | Warp (startup, VC-funded ~$73M total — Figma, Dylan Field, Jeff Weiner, Elad Gil, Neo) |
| License | Proprietary (client open-sourcing planned; themes/workflows community-driven) |
| Tech Stack | Rust (terminal core), WebAssembly, Tokio, NuShell, TypeScript (CLI/SDK), multi-model (Claude, GPT, Gemini) |
| Maturity | 🟢 Production (terminal, 26K stars) / 🟡 Early (Oz platform, launched Feb 2026) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | Oz's 5 cloud orchestration primitives (environments, hosting, tracking, handoff, programmability) map almost 1:1 to what we're building. Harness-agnostic approach validates our architecture. Named agents with scheduled automations are exactly the pattern we need for maintenance agents. |
| **Novelty** | 7/10 | "Vercel for cloud agents" framing is new — nobody else is packaging these 5 primitives as a cohesive platform. Powerfixer (TUI + embedded agent launch) is a genuinely novel agent-as-primitive pattern. Mobile steering of cloud agents is unique. |
| **Actionable** | 5/10 | Proprietary platform — we can't adopt the code directly. But the architectural patterns (autotracking, named/scheduled agents, harness-agnostic orchestration, API/SDK/CLI programmability) are directly transferable to our L-Thread system. The oz-agent-action GitHub Action pattern is immediately usable. |

---

## Overview

Warp is an agentic development environment that has evolved from a modern Rust-built terminal into a full cloud agent orchestration platform. Founded by Zach Lloyd (ex-Principal Engineer, Google — led Google Docs), Warp addresses two converging problems: terminals haven't evolved with modern development, and agentic tools don't scale beyond individual laptops. The company's million-line Rust codebase and their own experience running 4-5 agents concurrently hitting physical hardware limits drove the creation of Oz.

**Oz** is Warp's cloud agent orchestration platform, positioned as "Vercel for cloud agents." It is harness-agnostic — meaning it can run Warp's built-in agent, Claude Code, Codex, Gemini CLI, or any CLI-based coding agent through the same orchestration layer. This is a critical design decision: Oz doesn't compete with individual agent harnesses but provides the infrastructure layer on top of them. Zach Lloyd identifies five cloud orchestration primitives that Oz implements: (1) **Environments** — defining toolchains and code access, (2) **Hosting** — cloud sandboxes via partners like Daytona, E2B, Docker, Namespace, (3) **Tracking/Observability** — auto-recording of all agent runs across a team, (4) **Handoff** — human-in-the-loop for the 80% → 100% gap, and (5) **Programmability** — full API/SDK/CLI to launch, configure, name, schedule, and retrieve artifacts from agents.

Key differentiating features include named agents with scheduled automations (e.g., weekly feature-flag dead-code cleanup, release-triggered documentation updates), mobile steering of cloud agents, Warp Drive for shared team knowledge, and MCP server support across both local and cloud agents. The platform scored 75.8% on SWE-bench Verified. Warp also open-sourced **Powerfixer**, a TUI application for GitHub issue triage that can launch fix-agents directly from the triage UI — demonstrating the "agent as programming primitive" thesis.

---

## Technical Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Warp Terminal (Rust)                        │
│                                                               │
│  Modern UI ─── Block-based editing ─── LSP support            │
│  Agent Modality (conversation view) ─── Voice input           │
│  @-selection ─── File tree ─── Syntax highlighting            │
│                                                               │
│  Local Agents: real-time code, debug, command execution        │
│  Integrations: Claude Code, Codex, Gemini CLI                 │
└────────────────────────┬──────────────────────────────────────┘
                         │ seamless handoff
┌────────────────────────▼──────────────────────────────────────┐
│                     Oz Platform (Cloud)                        │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Environments │  │   Hosting    │  │ Tracking/Observability│ │
│  │ toolchain    │  │ Daytona/E2B  │  │ auto-record all runs  │ │
│  │ code access  │  │ Docker       │  │ team-wide visibility  │ │
│  │ MCP servers  │  │ Namespace    │  │ shareable sessions    │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                               │
│  ┌──────────────┐  ┌───────────────────────────────────────┐  │
│  │   Handoff    │  │         Programmability               │  │
│  │ HITL for     │  │ API + SDK + CLI                       │  │
│  │ 80%→100% gap │  │ Named agents + scheduled automations  │  │
│  │ mobile       │  │ Triggers: Slack, Linear, GitHub, cron │  │
│  │ steering     │  │ oz-agent-action (GitHub Actions)      │  │
│  └──────────────┘  │ oz-skills (reusable skill library)    │  │
│                     │ JSON output format for pipelines      │  │
│                     └───────────────────────────────────────┘  │
│                                                               │
│  Shared Resources: Warp Drive, Rules, MCP servers             │
│  Models: Multi-model (Claude, GPT, Gemini) — SOC 2, ZDR      │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                  Powerfixer (Open Source TUI)                  │
│                                                               │
│  GitHub issue triage ──► embedded agent launch                │
│  Demonstrates "agent as programming primitive" pattern         │
└───────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

| Decision | Detail |
|----------|--------|
| **Harness-agnostic** | Oz runs any CLI coding agent (Claude Code, Codex, Gemini CLI, Warp's own) through the same orchestration layer — not locked to one model or harness |
| **Local ↔ Cloud handoff** | Seamless context transfer between terminal-local and cloud-hosted agents; shared Warp Drive, Rules, MCP servers |
| **Multi-model by design** | Curated LLM selection with SOC 2 compliance and zero data retention with providers |
| **Event-driven triggers** | Agents triggered by Slack messages, Linear tickets, GitHub events, webhooks, or cron schedules |
| **Skills system** | Reusable skill definitions (`oz-skills` repo) that provide base context; combinable with prompts |
| **API-first programmability** | CLI (`warp`/`oz` CLI), API keys, GitHub Actions integration, JSON output mode for pipeline integration |

**Oz CLI / GitHub Actions interface:**
```yaml
# oz-agent-action usage pattern
- uses: warpdotdev/oz-agent-action@v1
  with:
    prompt: "..."           # Task description
    skill: "skill_name"    # OR reusable skill (repo:skill_name format)
    model: "<model-id>"    # Multi-model selection
    name: "Agent Name"     # Named agent for tracking
    mcp: |                 # MCP server configuration
      {"mcpServers": {...}}
    warp_api_key: ${{ secrets.WARP_API_KEY }}
```

---

## Publisher Background

**Zach Lloyd** founded Warp after serving as Principal Engineer at Google, where he led Google Docs. This background in collaborative real-time editing directly informs Oz's "team sport" thesis — making agent work visible, shared, and steerable across engineering teams, much like Google Docs made document editing collaborative.

Warp has raised approximately **$73M** in total funding from notable investors including Figma CEO Dylan Field, Jeff Weiner (LinkedIn), Elad Gil, and Neo. The company is based in San Francisco with an engineering-heavy team. The terminal product has been in production since 2022 with 26K+ GitHub stars (issues-only repo, code is proprietary). Warp's Rust engineering DNA is genuine — they maintain forks of core-foundation-rs, font-kit, cosmic-text, winit, and other Rust ecosystem crates, demonstrating deep systems-level expertise.

The Oz platform launched in February 2026, positioning Warp's pivot from "better terminal" to "agent orchestration platform." This timing coincides with the broader industry shift from individual agent tools to multi-agent infrastructure, putting Warp in a strong competitive position with existing distribution (26K stars, established user base).

---

## What's Valuable for Us

| Pattern | Where in Warp/Oz | How to Apply |
|---------|------------------|--------------|
| **5 orchestration primitives** | Oz architecture | Validate our L-Thread architecture against these 5 primitives. We have environments (tmux+worktree), hosting (local), and tracking (orchestrator-state.json) — but we're weak on handoff (HITL) and programmability (no API/CLI). Add a formal handoff protocol and consider exposing an API for agent management. |
| **Named agents + scheduled automations** | Oz named agents, cron triggers | Implement named persistent agents in our system — e.g., "weekly-lint-agent", "release-doc-updater". Currently our agents are ephemeral. Named agents with schedules would enable maintenance automation. Map to LaunchAgent/cron in our infra. |
| **Harness-agnostic orchestration** | Oz supporting Claude Code, Codex, Gemini CLI | Our L-Thread system is Claude-Code-only. Designing the orchestrator to be harness-agnostic (even if we only use CC now) future-proofs against model/harness commoditization. Aligns with Master Blueprint Principle 1: "The orchestration layer is the compounding asset." |
| **Agent-as-primitive (Powerfixer)** | Powerfixer TUI | Study Powerfixer's pattern of embedding agent launch into a non-agent TUI. This is the "agent as programming primitive" thesis — agents become callable components within larger applications, not standalone tools. |
| **Autotracking / team visibility** | Oz tracking layer | Our orchestrator-state.json is a manual tracking mechanism. Oz auto-records every agent run with session sharing. Consider adding automatic trace logging for every agent spawn — who, what, when, outcome, cost. |
| **Skills as reusable definitions** | oz-skills repo, skill parameter | Their skill system (repository-scoped, combinable with prompts) validates our `.claude/commands/` approach. The `repo:skill_name` format for cross-repo skills is an interesting pattern for our federated architecture. |
| **GitHub Actions integration** | oz-agent-action | The pattern of wrapping agent CLI in a GitHub Action for CI/CD integration is immediately adoptable. We could create a similar action for our L-Thread agents. |

---

## What's NOT Relevant

| Concern | Detail |
|---------|--------|
| **Proprietary platform lock-in** | Oz is a closed-source cloud platform. Using it means depending on Warp's infrastructure and pricing. Conflicts with Master Blueprint Principle 7 ("Build only what you have needed") — we don't need hosted cloud agents yet; tmux+worktree works. |
| **Cloud-first model** | Oz requires agents to run on Warp's cloud infrastructure. Our gov contracts require DSGVO compliance with data sovereignty. Running client code through a US cloud platform is a non-starter for gov work. Conflicts with Principle 6 (federated systems). |
| **Team collaboration features** | Shared sessions, team-wide visibility, access control — these are designed for 10+ engineer teams. We're a solo operator. Overkill at our scale. |
| **Terminal replacement** | Warp terminal itself is impressive (Rust, modern UI) but replacing our terminal is not on the roadmap. We're focused on orchestration, not terminal UX. |
| **Mobile steering** | Novel feature but not aligned with our autonomous agent philosophy. Our agents should complete tasks without human steering. Conflicts with AUTO_MODE design. |

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Study the 5 primitives framework and audit our L-Thread architecture for gaps. Validate that we have adequate coverage of environments, hosting, tracking, handoff, and programmability. Implement named agent tracking in orchestrator-state.json.
- **Phase 2 (Days 4-60):** Implement scheduled maintenance agents (weekly lint cleanup, dependency updates) inspired by Oz's named/scheduled agent pattern. Create a GitHub Action wrapper for our orchestrator (inspired by oz-agent-action). Study Powerfixer source for the embedded-agent-launch pattern.
- **Phase 3 (Days 60-90):** If scaling beyond single-machine, evaluate Oz as a cloud execution layer for non-gov workloads (SaaS factory, lead gen). Its harness-agnostic design means we wouldn't need to rewrite agents. The handoff (HITL) and tracking features would add value at scale.
- **Phase 4 (Days 90+):** Consider Oz for the SaaS factory business line where DSGVO constraints don't apply. The trigger-based agents (Slack, Linear, GitHub events) would integrate well with client-facing automation. Evaluate Warp's API for programmatic agent management in our federated architecture.

---

## Key Takeaway

> **Warp Oz validates our architectural intuitions with a well-funded, production-quality implementation of the "5 orchestration primitives" (environments, hosting, tracking, handoff, programmability) — study the patterns aggressively, but don't adopt the platform until cloud execution and DSGVO compliance become compatible.**
