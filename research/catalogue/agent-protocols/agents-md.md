# AGENTS.md

> **A simple, open format for guiding coding agents — a README for AI.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [github.com/agentsmd/agents.md](https://github.com/agentsmd/agents.md) |
| GitHub Stars | 18,600 (as of 2026-03-08) |
| Publisher | Agentic AI Foundation / Linux Foundation (collaborative — OpenAI, Google, Sourcegraph, Cursor, Factory) |
| License | MIT |
| Tech Stack | TypeScript (94.3%), Markdown convention |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | We already use CLAUDE.md for exactly this purpose. AGENTS.md is the industry-standard version. As we open-source or share orchestrator patterns, AGENTS.md is the convention. We should adopt it NOW. |
| **Novelty** | 3/10 | We've been doing this with CLAUDE.md since day one. The concept is not new to us — but the standardization and cross-tool compatibility is. |
| **Actionable** | 9/10 | Drop an AGENTS.md in our repo today. Takes 10 minutes. Instantly makes our project compatible with Codex, Jules, Copilot, Cursor, and every major coding agent. |

---

## Overview

AGENTS.md is a convention file — a standardized Markdown document placed at the root of a repository (or in subdirectories for monorepos) that provides AI coding agents with the context they need to work effectively on a project. Think of it as a README.md specifically written for AI agents rather than human developers.

The format emerged from collaborative efforts between OpenAI (Codex), Google (Jules), Sourcegraph, Cursor, and Factory in mid-2025. By late June 2025, major tools adopted the plural `AGENTS.md` naming convention (as opposed to the earlier `AGENT.md` singular). It's now used by over 60,000 open-source projects and is supported by virtually every major AI coding tool.

AGENTS.md is intentionally simple — it's just Markdown with no mandatory fields or rigid schema. Common sections include project context, build/test commands, code style conventions, security constraints, and workflow preferences. Agents discover the nearest AGENTS.md in the directory hierarchy and use it to guide their work. Nested files in subdirectories override parent files, enabling monorepo support.

---

## Technical Architecture

AGENTS.md has no technical architecture in the traditional sense — it's a file convention, not a protocol or framework.

**File Resolution:**
```
project-root/
├── AGENTS.md              ← Global agent instructions
├── src/
│   ├── AGENTS.md          ← Overrides for src/ subtree
│   └── components/
│       └── AGENTS.md      ← Overrides for components/
└── tests/
    └── AGENTS.md          ← Overrides for tests/
```

**Priority Order (highest to lowest):**
1. Explicit user chat prompts (always win)
2. Nearest AGENTS.md in directory hierarchy
3. Parent AGENTS.md files (inherited)
4. Agent's built-in defaults

**Common Sections:**
- Project overview and architecture
- Build commands (`npm run build`, `make`, etc.)
- Test commands and testing conventions
- Code style and linting rules
- Commit message format
- Security boundaries and constraints
- Workflow preferences (PR conventions, review process)

**Supported Tools (as of 2026):**
OpenAI Codex, Google Jules, GitHub Copilot, Cursor, Zed, Windsurf, Devin, Aider, Factory, goose, RooCode, Semgrep, Warp, Amp, opencode, UiPath Autopilot, Kilo Code, Phoenix, and many more.

---

## Publisher Background

AGENTS.md is a genuine multi-vendor collaboration — rare in tech. OpenAI secured the `agents.md` domain and led initial standardization. Sourcegraph proposed the original `AGENT.md` concept. Google (Jules team), Cursor, and Factory contributed to the specification. In 2025, the project was placed under the Agentic AI Foundation within the Linux Foundation for vendor-neutral governance. The broad coalition backing (competitors collaborating on a shared standard) gives AGENTS.md strong staying power.

---

## What's Valuable for Us

1. **Immediate adoption**: We already have `CLAUDE.md` doing exactly this job. Adding an `AGENTS.md` takes minutes and makes our repo compatible with every major coding agent. This is a no-brainer.

2. **Monorepo pattern**: The nested AGENTS.md approach for subdirectories is useful for our federated architecture — each business line's directory could have its own AGENTS.md with line-specific conventions while inheriting shared standards from the root.

3. **Agent boundary enforcement**: AGENTS.md can specify what agents should NOT do — constraints and security boundaries. This aligns with our "DU BIST KEIN ENTWICKLER" rule and context separation principle. We can codify these boundaries in a format every agent understands.

4. **Cross-tool compatibility**: As we scale, we might not always use Claude. AGENTS.md ensures any agent we bring in can understand our project conventions immediately.

5. **Convention over configuration**: The simplicity of "just a Markdown file" fits our thin shared layer philosophy perfectly. No infrastructure, no schema validation, no overhead.

---

## What's NOT Relevant

- **The TypeScript website code**: The `agents.md` repo is primarily the marketing website. The actual "protocol" is just the convention of having the file — no code to adopt.
- **v1.1 schema proposals**: There are proposals to add structured metadata to AGENTS.md. We don't need formalization — the freeform Markdown format is sufficient and more flexible.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Add AGENTS.md to the orchestrator repo root. Mirror key content from CLAUDE.md in a tool-agnostic format.
- **Phase 2 (Days 4-60)**: Add nested AGENTS.md files per business line directory as we federate.
- **Phase 3 (Days 60-90)**: Use AGENTS.md as the standard way to onboard new coding agents to any project in the SaaS factory pipeline.
- **Phase 4 (Days 90+)**: AGENTS.md becomes part of our project template for rapid SaaS launches — every new project gets one from day one.

---

## Key Takeaway

> **AGENTS.md is the industry-standard convention we're already doing with CLAUDE.md — we should add one to our repo immediately for cross-tool compatibility, and it costs essentially nothing.**
