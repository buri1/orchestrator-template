# PM Skills Marketplace

> **65 PM skills and 36 chained workflows across 8 plugins. Claude Code, Cowork, and more. From discovery to strategy, execution, launch, and growth.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocol / Skills |
| Repository | [phuryn/pm-skills](https://github.com/phuryn/pm-skills) |
| GitHub Stars | 6,053 (as of 2026-03-09) — 0→1K in 3 days, 1K→5K in 4 more days |
| Publisher | Pawel Huryn (solo / content creator — 400K+ followers, Product Compass newsletter) |
| License | MIT |
| Tech Stack | Pure Markdown (SKILL.md files + command .md files + plugin.json manifests); no runtime code |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Product management domain, not agent orchestration — but the skills/commands/plugins architecture is directly applicable to how we structure agent capabilities; GTM/pricing/strategy skills useful for SaaS factory launches |
| **Novelty** | 5/10 | Skills format is already known (OpenSkills, Koylan, ECC all catalogued); the PM domain content is the novel part — codified frameworks from Torres, Cagan, Savoia |
| **Actionable** | 7/10 | Install directly into Claude Code/Cowork for PM tasks; the plugin marketplace architecture (marketplace.json → plugin.json → skills/ + commands/) is a clean reference for how to package and distribute skill sets |

---

## Overview

PM Skills Marketplace is a pure-markdown skill and command library for product management, designed for Claude Code and Claude Cowork. It packages 65 domain-specific skills and 36 chained command workflows across 8 plugins covering the full PM lifecycle: discovery, strategy, execution, market research, data analytics, go-to-market, marketing/growth, and a general toolkit.

Each skill is a `SKILL.md` file that gives Claude domain knowledge and a guided workflow for a specific PM task (e.g., Opportunity Solution Trees, PRD creation, competitive battlecards). Commands chain multiple skills together into end-to-end processes — for example, `/discover` chains brainstorm-ideas → identify-assumptions → prioritize-assumptions → brainstorm-experiments. Skills load automatically when contextually relevant; commands are invoked explicitly via slash.

The marketplace leverages Claude Code's native plugin system (`claude plugin marketplace add`) and Cowork's plugin browser for one-click installation. Skills are also portable — the `SKILL.md` format works with Gemini CLI, OpenCode, Cursor, Codex CLI, and Kiro by copying skill folders into their respective config directories.

---

## Technical Architecture

```
pm-skills/
├── .claude-plugin/marketplace.json    # Marketplace manifest (8 plugins)
├── pm-product-discovery/              # Plugin 1: 13 skills, 5 commands
│   ├── .claude-plugin/plugin.json     # Plugin manifest
│   ├── commands/                      # Slash commands (chain skills)
│   │   ├── discover.md
│   │   ├── brainstorm.md
│   │   └── ...
│   └── skills/                        # Individual SKILL.md files
│       ├── opportunity-solution-tree/SKILL.md
│       ├── prioritize-features/SKILL.md
│       └── ...
├── pm-product-strategy/               # Plugin 2: 12 skills, 5 commands
├── pm-execution/                      # Plugin 3: 15 skills, 10 commands
├── pm-market-research/                # Plugin 4: 7 skills, 3 commands
├── pm-data-analytics/                 # Plugin 5: 3 skills, 3 commands
├── pm-go-to-market/                   # Plugin 6: 6 skills, 3 commands
├── pm-marketing-growth/               # Plugin 7: 5 skills, 2 commands
├── pm-toolkit/                        # Plugin 8: 4 skills, 5 commands
└── validate_plugins.py                # Plugin structure validator
```

**Key design decisions:**

- **No runtime code** — entirely Markdown-based. Skills are structured prompts with domain context, instructions, and process steps. Zero dependencies.
- **Three-layer hierarchy** — Marketplace → Plugin → Skill/Command. Plugins group by PM domain. Commands compose skills. Skills are atomic.
- **SKILL.md format** — YAML frontmatter (name, description) + structured markdown body (Domain Context, Instructions, Input Requirements, Process, Further Reading). Compatible with the emerging OpenSkills standard.
- **Command chaining** — Commands reference skills by name and chain them in sequence. After completion, each command suggests relevant next commands, creating natural workflow continuity.
- **Cross-tool portability** — The `skills/*/SKILL.md` convention works across Claude Code, Gemini CLI, OpenCode, Cursor, Codex CLI, and Kiro.

---

## Publisher Background

**Pawel Huryn** is a product management content creator and coach with 400K+ followers across platforms. He publishes the [Product Compass Newsletter](https://www.productcompass.pm) — one of the largest PM newsletters. Former CPO. The skills encode frameworks from established PM authors (Teresa Torres, Marty Cagan, Alberto Savoia, Dan Olsen, Roger Martin, Ash Maurya, Christina Wodtke, Sean Ellis, Maja Voje, and others).

The repo went from 0 to 6,000+ stars in 8 days (created 2026-03-01), suggesting strong distribution via his newsletter audience. 551 forks. 67 subscribers. The repo homepage links to a dedicated Product Compass article about the marketplace.

---

## What's Valuable for Us

1. **Plugin marketplace architecture** — The `marketplace.json` → `plugin.json` → `skills/` + `commands/` hierarchy is the cleanest reference for how to package and distribute skill bundles. If we ever publish our orchestrator skills or agent definitions as a marketplace plugin, this is the structural template.

2. **Command-as-skill-chain pattern** — Commands that compose multiple skills in sequence with suggested next-steps is a pattern we could adopt for our own agent workflows. The `/discover` flow (brainstorm → identify-assumptions → prioritize → experiment) is a good model for multi-step agent task decomposition.

3. **Direct PM utility for SaaS factory** — For our SaaS factory business line, the strategy, pricing, GTM, and discovery skills are immediately usable. Install into Claude Code and use for rapid product-market fit analysis on new SaaS ideas.

4. **Cross-harness portability pattern** — The copy-skill-folder approach for non-Claude tools (Gemini CLI, OpenCode, Cursor, Codex, Kiro) demonstrates how SKILL.md as a portable format works in practice across 6+ tools.

5. **SKILL.md authoring reference** — The 65 skills provide a large corpus of well-structured SKILL.md files to study for domain context, instructions, and process design. The opportunity-solution-tree skill is particularly well-crafted.

---

## What's NOT Relevant

- **Product management domain content** — The PM frameworks themselves (OSTs, SWOT, Porter's Five Forces, etc.) are business methodology, not agent engineering. Useful for our SaaS work but not for the orchestrator itself.
- **Cowork-specific installation** — The Cowork plugin browser and VM service instructions are irrelevant to our CLI-first approach.
- **No agent orchestration** — This is a skills library, not an orchestration system. It doesn't coordinate multiple agents, manage state, or handle parallel execution. It's a consumer of the skills standard, not a producer of agent infrastructure.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Install `pm-product-strategy` and `pm-go-to-market` plugins for immediate use in SaaS factory product analysis.
- **Phase 2 (Days 4-60)**: Study the marketplace architecture as a template if we want to publish our orchestrator skills/commands as a shareable plugin.
- **Phase 3 (Days 60-90)**: If building a skill marketplace or contributing to the OpenSkills ecosystem, use this as a reference for skill quality and structure.
- **Phase 4 (Days 90+)**: Consider contributing orchestration-focused skills back to the marketplace or creating our own marketplace following this pattern.

---

## Key Takeaway

> **PM Skills Marketplace is the largest and best-structured example of the SKILL.md plugin pattern in production, demonstrating how to package domain expertise as composable, cross-tool agent skills — immediately useful for our SaaS factory PM tasks, and a structural reference for any future skill distribution we build.**
