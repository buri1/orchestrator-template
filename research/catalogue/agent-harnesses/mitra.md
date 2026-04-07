# Mitra

> **A multi-agent collective intelligence system designed to facilitate collaborative problem-solving through specialized AI personas.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | [saeed-vayghan/mitra](https://github.com/saeed-vayghan/mitra) |
| GitHub Stars | 0 (as of 2026-03-08) |
| Publisher | Saeed Vayghani — solo developer, co-founder at Navaak (Sweden) |
| License | MIT |
| Tech Stack | Shell, XML (agent definitions), YAML (config), JSON (memory/state), Gemini CLI / Claude Code / Google AntiGravity |
| Maturity | 🟡 Early |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *Multi-harness consultancy-only agent system. Interesting "We Plan, You Build" philosophy that deliberately avoids code generation. The XML-as-source-of-truth synced to .gemini/ and .claude/ directories is a clean multi-harness portability pattern. Zero stars and solo developer make adoption risky, but the agent persona separation and Party Protocol (council brainstorming) are conceptually interesting. From Airtable research list.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 3/10 | Consultancy-only model is the opposite of our code-writing agent architecture; no orchestration layer, no CI/CD, no deterministic routing |
| **Novelty** | 4/10 | XML-as-source-of-truth for multi-harness sync is a minor insight; Party Protocol (multi-persona brainstorming) validates council patterns but nothing architecturally new |
| **Actionable** | 3/10 | Almost nothing directly adoptable — different philosophy, different use case, no production-grade infrastructure |

---

## Overview

Mitra (v2.0.0, January 2026) is a multi-agent "collective intelligence" system built around the philosophy "We Plan, You Build." It provides six specialized AI personas — Mitra (orchestrator), Sina (analyst), Zal (manager), Jamshid (architect), Kaveh (engineer), and Mani (designer) — that collaborate to produce consultancy artifacts (PRDs, architecture docs, API specs, sprint plans, UI mockups) without ever writing implementation code.

The system is platform-agnostic, running atop Gemini CLI, Google AntiGravity, or Claude Code. Agent definitions live in XML workflow files at `.agent/workflows/` as the source of truth, with mirrored copies synced to `.gemini/commands/` and `.claude/commands/` for cross-platform compatibility. The config is minimal: a `config.yaml` with `user_name`, `communication_language`, `project_name`, and `project_id`.

The key differentiator is the "Party Protocol" — a collaborative brainstorming mode where the orchestrator summons multiple agent personas to address a question collectively, each contributing domain-specific analysis. Sessions are persisted via `*save`/`*load` commands as JSON state files at `mitra/agents/{agent}/memory/state-{date}-{topic}.json`.

---

## Technical Architecture

```
mitra/
├── .agent/
│   ├── skills/
│   └── workflows/           # SOURCE OF TRUTH (XML agent definitions)
│       ├── mitra-orchestrator.md
│       ├── mitra-analyst.md
│       ├── mitra-architect.md
│       ├── mitra-designer.md
│       ├── mitra-engineer.md
│       └── mitra-manager.md
├── .claude/
│   ├── CLAUDE.md
│   ├── commands/             # Mirrored from .agent/workflows/
│   └── skills/
├── .gemini/
│   ├── GEMINI.md
│   ├── commands/             # Mirrored from .agent/workflows/
│   ├── settings.json
│   └── skills/
├── mitra/
│   └── agents/
│       ├── config.yaml       # Minimal project config
│       ├── registry.md       # Agent capability registry
│       ├── orchestrator/
│       │   └── persona.md
│       ├── analyst/
│       │   ├── persona.md
│       │   ├── memory/       # JSON state files
│       │   └── workflows/
│       ├── architect/
│       ├── designer/
│       ├── engineer/
│       └── manager/
├── AGENTS.md                 # Operational manual
├── GUIDE.md                  # User guide with Crypto-Tasker example
└── docs/consultancy/{project_id}/  # Output artifacts
```

**Key architectural decisions:**

- **XML as source of truth**: Agent workflows defined in XML at `.agent/workflows/`, then synced to `.gemini/commands/` and `.claude/commands/`. TOML wrappers handle the XML-in-prompt embedding.
- **JSON state persistence**: Memory schema includes `timestamp`, `context` object (topic, key decisions, variables), and `artifacts` array. Stored per-agent in `mitra/agents/{agent}/memory/`.
- **No infrastructure**: Pure prompt engineering — no server, no database, no CI, no git automation. Just files in a repo that the CLI tools read.
- **Consultancy-only output**: All artifacts routed to `docs/consultancy/{project_id}/`. Agents explicitly prohibited from writing application code.

---

## Publisher Background

**Saeed Vayghani** is a solo developer based in Sweden, co-founder at Navaak (navaak.com). His GitHub profile (created 2014, 26 public repos, 22 followers) shows modest community presence. His most-starred project is `gemini-agent-skills` (11 stars) — a collection of AI agent skills for Gemini CLI. The Mitra repository was created January 8, 2026, last updated January 29, 2026, with 0 stars and 1 fork.

Previously named "Simurgh" before renaming to Mitra. Also has a `file-search-rag-with-gemini` repo described as "architected, specified, and orchestrated by the Mitra Multi-Agent System."

**Credibility assessment**: Low community traction, no meaningful adoption signals. Solo developer without visible backing or production deployments beyond personal use. The gemini-agent-skills project shows deeper Gemini CLI expertise but limited broader reach.

---

## What's Valuable for Us

1. **Multi-harness sync pattern**: The `.agent/workflows/` → `.gemini/commands/` + `.claude/commands/` mirroring approach is a clean solution for maintaining agent definitions portable across CLI harnesses. We could adapt this concept if we ever need to run agents on both Claude Code and Gemini CLI simultaneously.

2. **AGENTS.md as operational manual**: Their AGENTS.md file serves as a comprehensive operational manual covering the agent roster, memory protocol, workflow rules, file structure, and guardrails — all in one document. Validates the AGENTS.md convention we already track (see `agent-protocols/agents-md.md`).

3. **Party Protocol concept**: The "summon the council" brainstorming mode where multiple persona viewpoints are collected on a single question is a minor but interesting UX pattern for our orchestrator's planning phase.

---

## What's NOT Relevant

1. **Consultancy-only philosophy**: The core "We Plan, You Build" doctrine — where AI never writes code — is diametrically opposed to our architecture where agents ARE the builders. Our Master Blueprint Principle #2 states agents execute (write code, diagnose failures, generate content) while the orchestrator routes deterministically. Mitra inverts this entirely.

2. **No deterministic orchestration layer**: There is no routing logic, no state machine, no health monitoring, no CI/CD integration. The "orchestrator" persona is just another LLM prompt, not deterministic code. This violates our Governing Principle #2 ("The orchestrator never guesses").

3. **No real coordination infrastructure**: No tmux sessions, no worktree isolation, no git automation, no quality gates, no merge queues. Agent coordination is purely via shared context in the LLM's conversation window — the opposite of our infrastructure-backed approach.

4. **Zero production signals**: 0 stars, 1 month of activity, solo developer. No evidence of production use, no community, no external validation.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Not applicable.
- **Phase 2 (Days 4-60)**: Not applicable.
- **Phase 3 (Days 60-90)**: If we ever need multi-harness portability (running the same agent definitions on Claude Code AND Gemini CLI), revisit the XML-source-of-truth-with-sync pattern.
- **Phase 4 (Days 90+)**: If we build a "consultant" agent class (non-coding, strategy-only), Mitra's persona definitions and Party Protocol could serve as a template for that specific agent type.

---

## Key Takeaway

> **Mitra is a consultancy-only multi-persona system that deliberately avoids code generation — interesting for its multi-harness sync pattern (XML definitions mirrored to .gemini/ and .claude/ directories) but architecturally irrelevant to our code-producing, deterministically-orchestrated agent system.**
