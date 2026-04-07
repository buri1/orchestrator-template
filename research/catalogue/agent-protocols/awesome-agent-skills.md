# Awesome Agent Skills

> **A curated collection of 549+ official Agent Skills from leading development teams and the community, compatible with Claude Code, Codex, Antigravity, Gemini CLI, Cursor, and more.**

| Field | Value |
|-------|-------|
| Category | 🔗 Agent Protocols |
| Repository | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) |
| GitHub Stars | 10,347 (as of 2026-03-09) |
| Publisher | VoltAgent (startup — also builds the VoltAgent TypeScript AI agent framework, 6.5K stars) |
| License | MIT |
| Tech Stack | Pure Markdown (no code — curated awesome-list) |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-09 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Comprehensive directory of the skills ecosystem across all major coding agents; maps the landscape we operate in; cross-harness path table is immediately useful |
| **Novelty** | 5/10 | Many of the individual skills and patterns are already catalogued (Superpowers, Koylan, OpenSkills, Playbooks); the value is the aggregation and cross-agent compatibility mapping |
| **Actionable** | 7/10 | Skills path reference table for 8 agents is directly usable; security scanner recommendations (Snyk, Agent Trust Hub) are new; quality criteria section codifies best practices for our own skill authoring |

---

## Overview

Awesome Agent Skills is the largest community-curated registry of agent skills (SKILL.md files and equivalent) for AI coding assistants. Unlike bulk-generated skill directories, this collection focuses on real-world skills published by actual engineering teams. It features official skills from Anthropic, Google Labs, Vercel, Stripe, Cloudflare, Netlify, Trail of Bits, Sentry, Expo, Hugging Face, Microsoft, OpenAI, and more, alongside a large and growing set of community-built skills.

The repository is purely a curated Markdown list — it contains no code. It organizes 549+ skills across categories: official Claude skills (17), vendor teams (30+ companies), community development/testing skills, context engineering skills, specialized domains (legal, scientific, security, genealogy, materials science), marketing skills, and n8n automation skills. Each entry links to the canonical skill source.

A key contribution is the cross-agent compatibility table documenting the skills path conventions for 8 major coding agents (Claude Code, Codex, Antigravity, Gemini CLI, Cursor, GitHub Copilot, OpenCode, Windsurf), making it a de facto reference for cross-harness skill portability.

---

## Technical Architecture

Not a software system — this is a curated awesome-list. Key structural elements:

- **Organization**: Skills grouped by publisher (official teams first) and category (community skills by domain)
- **Linking model**: Each entry links to the canonical source repo/directory — skills are not hosted here
- **Cross-agent paths table**: Documents project-level and global-level skill paths for 8 agents
- **Quality criteria**: Description standards, progressive disclosure (<100 token metadata, <500 line body), no absolute paths, scoped tool declarations
- **Security notice**: Recommends Snyk Agent Scan and Agent Trust Hub; explicit warning about prompt injection, tool poisoning, and malware payloads in skills
- **Contribution bar**: Explicitly rejects recently-created skills; requires community adoption and real-world usage

---

## Publisher Background

VoltAgent is a startup building the VoltAgent TypeScript AI Agent Engineering Platform (6.5K stars on the main framework repo, created April 2025). The awesome-agent-skills repo is their highest-traction project (10.3K stars, 910 forks). They also maintain a companion repo for AI agent research papers. The organization appears small but has successfully built significant community momentum — the skills repo is the most-contributed agent skills registry in the ecosystem.

**Star growth trajectory:**
- Created: 2025-10-28
- ~900 stars: 2025-12-07 (~40 days)
- ~5,000 stars: 2026-01-30 (~3 months)
- ~10,000 stars: 2026-03-07 (~4.3 months)
- Current: 10,347 (as of 2026-03-09)

---

## What's Valuable for Us

1. **Cross-agent skills path reference**: The table mapping `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, etc. for 8 agents is the most complete reference available. Directly useful if we ever publish skills or need multi-harness compatibility (aligns with our cross-harness parity interest from ECC catalogue entry).

2. **Skill quality standards**: The four criteria (description clarity, progressive disclosure, no absolute paths, scoped tools) codify what we should follow when writing our own `.claude/commands/` and skills. The 100-token metadata / 500-line body limits are concrete engineering constraints.

3. **Security tooling pointers**: Snyk Agent Scan (`snyk/agent-scan`) and Agent Trust Hub (`ai.gendigital.com/agent-trust-hub`) for auditing third-party skills — relevant for our agent security posture.

4. **Vendor skill discovery**: Identifies official skills from 30+ companies. Notable for us:
   - Stripe skills (best practices, SDK upgrade) — aligns with our Stripe Minions interest
   - Supabase, Vercel, Cloudflare, Neon skills — relevant to SaaS factory stack
   - obra/Superpowers skills (TDD, subagent-driven development, git worktrees, code review) — already catalogued as [Superpowers](../agent-harnesses/superpowers.md) but skills are individually linkable
   - NeoLab context engineering kit (sdd, reflexion, code-review, kaizen) — novel multi-plugin system
   - Corey Haines marketing skills (25+ SaaS marketing workflows) — directly relevant to our Hormozi-framework marketing line

5. **Context engineering skills** by Murat Can Koylan (the same author behind [Koylan Skills](./koylan-skills.md)): context degradation, compression, multi-agent patterns, memory systems, tool design, evaluation — these are structured learning materials for the patterns we already practice.

---

## What's NOT Relevant

- **Bulk vendor SDK skills** (Microsoft's 80+ Azure SDK skills, Google Workspace, WordPress): These are vendor-specific API references, not agent engineering patterns. We don't use Azure or WordPress.
- **The VoltAgent framework itself**: Their TypeScript agent framework is a separate product; this awesome-list is framework-agnostic.
- **Specialized domain skills** (genealogy, materials science, VMware AIOps, HomeAssistant): Irrelevant to our business lines.
- **Most community skills individually**: The majority are narrow utilities (PPT generation, WhatsApp integration, iOS simulator control) that don't intersect with multi-agent orchestration.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Reference the cross-agent skills path table if publishing any skills. Review quality criteria for our own `.claude/commands/` formatting.
- **Phase 2 (Days 4-60)**: Cherry-pick specific skills for our SaaS factory stack (Vercel deploy, Supabase, Stripe). Evaluate NeoLab's context engineering kit plugins for agent quality gates. Trial Corey Haines marketing skills for marketing agent line.
- **Phase 3 (Days 60-90)**: If publishing an open-source skill pack from our orchestrator, submit to this list for distribution.
- **Phase 4 (Days 90+)**: Monitor as the definitive index of the skills ecosystem. Watch for convergence on skill standards and security auditing practices.

---

## Key Takeaway

> **The most comprehensive cross-agent skills directory (549+ skills, 10K stars, 30+ vendor teams) — its primary value is not individual skills but the cross-harness compatibility table, quality standards, and security tooling pointers that codify the emerging skills ecosystem.**
