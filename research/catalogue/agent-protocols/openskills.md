# Agent Skills (Open Standard)

> **A simple, open format for giving agents new capabilities and expertise. Skills are folders of instructions, scripts, and resources that agents can discover and use to perform better at specific tasks.**

| Field | Value |
|-------|-------|
| Category | 🤝 Agent Protocols |
| Repository | [agentskills/agentskills](https://github.com/agentskills/agentskills) |
| GitHub Stars | 12,300 (as of 2026-03-08) |
| Publisher | Anthropic + community (bigtech — originally developed by Anthropic, now open standard) |
| License | Apache 2.0 (code) / CC-BY-4.0 (docs) |
| Tech Stack | Python (99.1%), SKILL.md (Markdown + YAML frontmatter) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | We already use a skills-like pattern (`.claude/commands/`, slash commands). Agent Skills formalizes this into a portable standard that 30+ agent products now support. Direct upgrade path for our existing infrastructure. |
| **Novelty** | 4/10 | We already do this informally. The formal SKILL.md spec with YAML frontmatter, discovery protocol, and cross-agent portability is the incremental value. |
| **Actionable** | 7/10 | Converting our existing `.claude/commands/` to SKILL.md format would be ~1 day of work and would make our skills portable across Claude Code, Codex, Cursor, Gemini CLI, and 25+ other agents. |

---

## Overview

Agent Skills is the **de facto open standard** for packaging agent capabilities as portable, discoverable skill folders. Originally developed by Anthropic, it has been adopted by an extraordinary breadth of agent products: Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Gemini CLI, VS Code, Amp, Goose, OpenHands, Roo Code, JetBrains Junie, Spring AI, Databricks, Snowflake, Mistral Vibe, and 15+ more.

A skill is a folder containing a `SKILL.md` file (required) with YAML frontmatter and Markdown instructions, plus optional `scripts/`, `references/`, and `assets/` directories. Agents discover skills in the project directory and load them on-demand based on the task at hand. The "write once, use everywhere" promise is genuinely delivered — the same skill folder works across 30+ agent products without modification.

The standard solves a real problem: agents are increasingly capable but lack domain-specific context. Skills package procedural knowledge, company-specific workflows, and specialized capabilities into portable, version-controlled units that agents can load as needed. This is essentially what we already do with our `.claude/commands/` directory, but formalized into a cross-platform standard.

---

## Technical Architecture

```
project-root/
├── .skills/                    # Skills directory (discoverable)
│   ├── my-skill/
│   │   ├── SKILL.md           # Required: YAML frontmatter + instructions
│   │   ├── scripts/           # Optional: executable scripts
│   │   ├── references/        # Optional: docs, examples
│   │   └── assets/            # Optional: images, data files
│   └── another-skill/
│       └── SKILL.md
└── ...

SKILL.md Structure:
┌─────────────────────────────┐
│  ---                        │
│  name: "skill-name"         │
│  description: "what it does"│
│  ...YAML frontmatter...     │
│  ---                        │
│                             │
│  ## Instructions             │
│  Markdown body with         │
│  procedural knowledge       │
│  and agent guidance         │
└─────────────────────────────┘
```

Key design decisions:
- **File-based discovery:** Agents scan for `SKILL.md` files in known directories — no registry, no API, no runtime
- **Progressive disclosure:** Agents only load skill content they need for the current task
- **Platform agnostic:** Works with any agent that reads Markdown files
- **Composable:** Skills can reference each other
- **Version controlled:** Skills live in git repos alongside code
- **33 contributors**, 48 commits, active development since December 2025
- **Reference library** available for validating skills and generating prompt XML

---

## Publisher Background

Developed by **Anthropic** and released as an open standard. The repository is maintained under the `agentskills` GitHub organization with 33 contributors. The specification lives at [agentskills.io](https://agentskills.io/) with comprehensive documentation.

Anthropic's backing gives this standard enormous credibility and staying power. The fact that competitors (OpenAI, Google, Microsoft, JetBrains, Databricks, Snowflake) have all adopted it is remarkable — it suggests this has become the HTTP of agent capability packaging. No other standard comes close to this level of adoption.

---

## What's Valuable for Us

1. **Direct Migration Path for Our Commands**

   Our `.claude/commands/` directory (orchestrator.md, orchestrator-teams.md, roadblock-recovery.md, tmux-recovery.md, tool-catalogue.md, ingest-*) already follows a skills-like pattern. Converting these to SKILL.md format would make them:
   - Portable across Claude Code, Codex, Cursor, and other agents
   - Discoverable by any skills-compatible agent
   - Standardized with proper metadata (name, description, dependencies)

2. **Cross-Agent Portability**

   As we evaluate different coding agents (Codex, Gemini CLI, OpenCode), having our orchestration skills in a portable format means we're not locked into Claude Code's proprietary command format. This directly supports our architecture principle of agent-agnostic orchestration.

3. **Organizational Knowledge Capture**

   The standard's vision of "capture organizational knowledge in portable, version-controlled packages" maps exactly to our knowledge catalogue system. Our research catalogue, templates, and scoring rubrics could all be packaged as skills.

4. **Official Skill Catalogues**

   Anthropic, OpenAI, Microsoft, Google, Vercel, Supabase, and Laravel all publish official skill catalogues. These are free, high-quality skills we can reference or adopt directly.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **Python reference library** | Our stack is TypeScript/shell. The validation library is Python-only. |
| **Enterprise skill distribution** | We're a small team, not distributing skills to hundreds of developers. |
| **Skills marketplace / registry** | We manage our own skills in-repo. External discovery doesn't add value yet. |

**No governing principle conflicts.** This standard actually reinforces our existing patterns.

---

## Future Use Cases

- **Phase 1 (Days 1–3):** Audit our `.claude/commands/` directory. Determine if converting to SKILL.md format is worth the effort.
- **Phase 2 (Days 4–60):** Convert high-value commands to SKILL.md format if we start using multiple coding agents. This makes our orchestration skills agent-agnostic.
- **Phase 3 (Days 60–90):** Package our orchestration patterns as a reusable skill set that could be shared across client projects.
- **Phase 4 (Days 90+):** Publish our orchestration skills as an open-source skill catalogue, building community around our L-Thread pattern.

---

## Key Takeaway

> **Agent Skills is the emerging universal standard for packaging agent capabilities — adopted by 30+ agent products including all major players. Our existing `.claude/commands/` pattern is already 80% there; converting to SKILL.md format is a low-effort, high-optionality move that makes our orchestration skills portable across any coding agent.**
