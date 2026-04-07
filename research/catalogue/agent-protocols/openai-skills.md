# OpenAI Skills (Official Codex Skills Catalogue)

> **Skills Catalog for Codex — OpenAI's official curated collection of agent skills defining how Codex discovers, installs, and executes modular capabilities.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [openai/skills](https://github.com/openai/skills) |
| GitHub Stars | 13,568 (as of 2026-03-09) |
| Publisher | OpenAI (bigtech — 10+ internal contributors with `-openai` suffixed GitHub handles) |
| License | Per-skill (Apache 2.0 / MIT — varies by skill; no repo-level license) |
| Tech Stack | Python (primary), Markdown (SKILL.md format), Bash scripts |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 8/10 | OpenAI's official reference implementation of Agent Skills — defines the skill format that Codex uses, including the 3-tier system (.system/.curated/.experimental), installer/creator meta-skills, and progressive disclosure pattern. Directly informs how we'd package our orchestration commands as portable skills. |
| **Novelty** | 7/10 | We already catalogued the open standard (openskills.md) and community collections (koylan-skills, codex-skills). This adds: official skill anatomy (SKILL.md + agents/openai.yaml + scripts/ + references/ + assets/), the skill-creator meta-skill with its complete authoring guide, the skill-installer distribution model, and 35 curated production skills covering CI fixing, PR review, Playwright testing, Notion workflows, deployment, and more. |
| **Actionable** | 8/10 | The skill-creator SKILL.md is the most comprehensive skill-authoring guide available — progressive disclosure patterns, naming conventions, validation scripts, and the "Codex is already smart, only add what it doesn't know" principle. Directly applicable to converting our .claude/commands/ into portable SKILL.md format. The gh-fix-ci and gh-address-comments skills are immediately adoptable workflow patterns. |

---

## Overview

This is **OpenAI's official skills repository** for Codex — the canonical collection of curated agent skills that ship with or are installable into Codex. Unlike community skill collections (codex-skills by am-will, koylan-skills), this is the first-party reference implementation that defines what a production-quality Codex skill looks like.

The repository contains three tiers of skills: **`.system`** (3 skills: openai-docs, skill-creator, skill-installer — auto-installed in every Codex instance), **`.curated`** (35 skills covering CI, PR review, deployment, Playwright testing, Notion workflows, multimedia, and security), and **`.experimental`** (community contributions under development). The skill-creator meta-skill is particularly valuable — it's a 400+ line guide to authoring skills that embodies OpenAI's philosophy of "context window as public good" and progressive disclosure.

The repository was created 2025-11-25, with 77 commits, 761 forks, and 13.5K+ stars. The first star was recorded 2025-12-18, suggesting 3+ weeks of private development before public release. Active development continues with weekly commits as of March 2026. The README references the [Agent Skills open standard](https://agentskills.io), confirming alignment with the broader cross-platform skills ecosystem already catalogued in our `openskills.md` entry.

---

## Technical Architecture

```
openai/skills/
├── skills/
│   ├── .system/                           # Auto-installed in Codex
│   │   ├── openai-docs/                   # OpenAI API documentation skill
│   │   ├── skill-creator/                 # Meta-skill: authoring guide
│   │   │   ├── SKILL.md                   # 400+ line comprehensive guide
│   │   │   ├── scripts/
│   │   │   │   ├── init_skill.py          # Scaffold new skill directories
│   │   │   │   ├── quick_validate.py      # YAML/structure validation
│   │   │   │   └── generate_openai_yaml.py
│   │   │   └── references/
│   │   │       └── openai_yaml.md         # UI metadata spec
│   │   └── skill-installer/               # Meta-skill: install from GitHub
│   │       ├── SKILL.md
│   │       └── scripts/
│   │           ├── list-skills.py
│   │           └── install-skill-from-github.py
│   ├── .curated/                          # 35 vetted skills
│   │   ├── gh-fix-ci/                     # Debug failing PR checks
│   │   ├── gh-address-comments/           # Address PR review comments
│   │   ├── playwright/                    # E2E test writing
│   │   ├── playwright-interactive/        # Interactive browser testing
│   │   ├── notion-spec-to-implementation/ # PRD → tasks → tracking
│   │   ├── notion-knowledge-capture/      # Knowledge capture workflow
│   │   ├── notion-meeting-intelligence/   # Meeting notes → actions
│   │   ├── notion-research-documentation/ # Research → docs
│   │   ├── cloudflare-deploy/             # Deploy to Cloudflare
│   │   ├── vercel-deploy/                 # Deploy to Vercel
│   │   ├── netlify-deploy/               # Deploy to Netlify
│   │   ├── render-deploy/                # Deploy to Render
│   │   ├── security-best-practices/       # Security audit
│   │   ├── security-ownership-map/        # Code ownership mapping
│   │   ├── security-threat-model/         # Threat modeling
│   │   ├── figma/                         # Figma integration
│   │   ├── figma-implement-design/        # Design → code
│   │   ├── linear/                        # Linear issue management
│   │   ├── sentry/                        # Error tracking
│   │   ├── imagegen/                      # Image generation
│   │   ├── sora/                          # Video generation
│   │   ├── speech/                        # Speech synthesis
│   │   ├── transcribe/                    # Audio transcription
│   │   ├── pdf/                           # PDF processing
│   │   ├── slides/                        # Presentation creation
│   │   ├── spreadsheet/                   # Spreadsheet operations
│   │   ├── screenshot/                    # Screen capture
│   │   ├── jupyter-notebook/              # Notebook operations
│   │   ├── doc/                           # Document processing
│   │   ├── develop-web-game/              # Web game development
│   │   ├── chatgpt-apps/                  # ChatGPT app building
│   │   ├── aspnet-core/                   # ASP.NET Core projects
│   │   ├── winui-app/                     # WinUI desktop apps
│   │   ├── yeet/                          # Quick deploy/ship
│   │   └── openai-docs/                   # OpenAI API docs
│   └── .experimental/                     # (404 — may be private or gated)

Skill Anatomy (per skill):
├── SKILL.md                # Required: YAML frontmatter + Markdown instructions
├── agents/
│   └── openai.yaml         # Recommended: UI metadata (display_name, icon, etc.)
├── scripts/                # Optional: deterministic helper scripts
├── references/             # Optional: domain docs loaded on demand
├── assets/                 # Optional: templates, images, fonts
├── examples/               # Optional: end-to-end walkthroughs
├── evaluations/            # Optional: quality benchmarks
└── LICENSE.txt             # Required: per-skill license
```

Key design decisions:
- **Three-tier distribution**: .system (always present) > .curated (opt-in install by name) > .experimental (opt-in with explicit path)
- **`$skill-installer` meta-skill**: Codex installs skills via a skill — recursion as architecture
- **YAML frontmatter triggers**: `name` + `description` are the ONLY fields Codex reads to decide whether to activate a skill. The body loads only after triggering.
- **Progressive disclosure**: Metadata (~100 words always in context) → SKILL.md body (on trigger, <5K words) → bundled resources (on demand, unlimited)
- **Scripts as token optimization**: Python/Bash scripts execute without loading into context window
- **`agents/openai.yaml`**: UI metadata (display_name, short_description, default_prompt, icon) — recommended but not required
- **Per-skill licensing**: No repo-level license; each skill directory contains its own LICENSE.txt

---

## Publisher Background

**OpenAI** — the company behind GPT-4, Codex, and ChatGPT. This repository is maintained by a team of 10+ OpenAI engineers (identifiable by `-openai` suffixed GitHub handles: gverma-openai, dkundel-openai, vb-openai, ae-openai, etraut-openai, cching-openai, lukeqin-oai, cguo-oai, bschoepke-openai). Top contributor gverma-openai has 17 commits, dkundel-openai has 13.

The repository explicitly links to [agentskills.io](https://agentskills.io), the open standard we already catalogued as `openskills.md`. This means OpenAI has adopted the same SKILL.md format that Anthropic originated and that 30+ agent products now support — further validation of the standard's cross-platform status.

---

## What's Valuable for Us

1. **Skill-Creator Meta-Skill = Best Authoring Guide Available**

   The `skill-creator` SKILL.md is the most comprehensive guide to writing agent skills we've seen. Key principles we should adopt:
   - "Context window is a public good" — only add what the agent doesn't already know
   - "Degrees of freedom" framework — match specificity to task fragility (narrow bridge = low freedom, open field = high freedom)
   - Progressive disclosure patterns: Pattern 1 (high-level guide + references), Pattern 2 (domain-specific organization), Pattern 3 (conditional details)
   - SKILL.md body should stay under 500 lines
   - "When to use" triggers belong in frontmatter `description`, NOT in body

2. **gh-fix-ci and gh-address-comments = Adoptable Workflows**

   These two skills demonstrate production-quality CI fixing and PR review workflows using `gh` CLI. The gh-fix-ci skill bundles a `scripts/inspect_pr_checks.py` script that handles field drift, job-log fallbacks, and external provider scoping. Directly applicable to our agent workflow automation.

3. **Notion Skills = Reference for Our Notion Integration**

   Four Notion skills (spec-to-implementation, knowledge-capture, meeting-intelligence, research-documentation) show how OpenAI structures Notion MCP integration. The spec-to-implementation skill is particularly relevant — it's the PRD-to-task pipeline pattern we want for our business line workflows.

4. **Skill-Installer Distribution Model**

   The `$skill-installer` meta-skill that installs skills from GitHub by name or URL is an elegant distribution pattern. Could inform how we share orchestration skills across client projects: `$skill-installer l-thread-orchestrator` from a public repo.

5. **Three-Tier Maturity Model**

   .system → .curated → .experimental maps cleanly to our own skill maturity path: core commands that always load, tested commands available on demand, and experimental commands under development.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **OpenAI-specific API skills** (openai-docs, imagegen, sora, speech, transcribe) | These are for OpenAI API consumers. We use Claude/Anthropic APIs. |
| **Platform-specific deployment** (vercel-deploy, cloudflare-deploy, render-deploy, netlify-deploy) | Our deployment is via gov-specific infrastructure, not PaaS. |
| **Codex-specific UI metadata** (agents/openai.yaml) | The openai.yaml format is Codex-only; Claude Code uses .claude/ conventions. |
| **WinUI/ASP.NET skills** | Windows-specific; we're macOS/Linux. |
| **ChatGPT Apps skill** | Specific to OpenAI's app platform. |

**Governing principle tension:** None. This reinforces our existing patterns and the cross-platform skills standard.

---

## GitHub Star Milestones

| Date | Stars | Notes |
|------|-------|-------|
| 2025-11-25 | 0 | Repo created |
| 2025-12-18 | ~1 | First recorded star (3+ weeks private development) |
| 2026-03-09 | 13,568 | Current count — rapid adoption (~5K/month) |

---

## Cross-References

- **[OpenSkills (Agent Skills Standard)](./openskills.md)** — The open standard this repo implements. OpenAI's README explicitly links to agentskills.io.
- **[Koylan Skills](./koylan-skills.md)** — Community skill collection for context engineering (13.6K stars). Knowledge library, not a tool.
- **[Codex Skills (am-will)](../agent-harnesses/codex-skills.md)** — Community TOML-based agent roles for Codex. Different format (TOML roles vs SKILL.md skills).
- **[Everything Claude Code](../agent-harnesses/everything-claude-code.md)** — Analogous ecosystem for Claude Code (65 skills, 40 commands). Uses .claude/ format rather than SKILL.md.
- **[Playbooks.com](./playbooks-skills.md)** — Discovery layer aggregating 34K+ skills including from this repo.
- **[AGENTS.md](./agents-md.md)** — Complementary convention (project-level agent config vs. portable skills).

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Read the `skill-creator` SKILL.md as an authoring guide before converting any of our `.claude/commands/` to SKILL.md format. Study `gh-fix-ci` as a template for bundling scripts with skills.
- **Phase 2 (Days 4-60):** Evaluate adopting the three-tier model (.system/.curated/.experimental) for organizing our own skills. Convert our highest-value commands (orchestrator, tool-catalogue, ingest-*) to SKILL.md format for cross-agent portability.
- **Phase 3 (Days 60-90):** Study `notion-spec-to-implementation` as a reference for building our own Notion-integrated business workflows. Package our L-Thread orchestration patterns as installable skills.
- **Phase 4 (Days 90+):** Publish our orchestration skills to a public repo. Use the skill-installer pattern to distribute them across client projects.

---

## Key Takeaway

> **OpenAI's official skills repo is the reference implementation of what production-quality Agent Skills look like at scale — its skill-creator meta-skill is the best authoring guide available, its three-tier distribution model (.system/.curated/.experimental) is an elegant maturity framework, and its 35 curated skills demonstrate how to bundle scripts, references, and progressive disclosure into portable agent capabilities.**
