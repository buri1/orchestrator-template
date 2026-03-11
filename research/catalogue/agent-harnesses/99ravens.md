# 99Ravens

> **"We turn expert knowledge into AI. We work with senior practitioners to codify their tacit knowledge."**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Website | [99ravens.agency](https://www.99ravens.agency) / [99ravens.ai](https://www.99ravens.ai) |
| App | [app.99ravens.ai](https://app.99ravens.ai) |
| Open-Source Component | [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) (see [Koylan Skills](../agent-protocols/koylan-skills.md) entry) |
| GitHub Stars (OSS repo) | 13,594 (as of 2026-03-08) |
| Publisher | Fab Dolan (ex-Google, CEO) + Muratcan Koylan (AI Agent Systems Manager, now at Sully.ai) — startup |
| License | Platform: proprietary SaaS; OSS component: MIT |
| Tech Stack | SaaS platform (app.99ravens.ai); open-source skills: Markdown SKILL.md format, Python pseudocode |
| Maturity | 🟡 Early (platform); 🟢 Production (open-source skills) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 4/10 | 99Ravens is an expertise-codification agency, not an agent orchestration tool. The "turn expert knowledge into AI" model is tangentially related to how we codify orchestration patterns into agent prompts, but it's a different problem domain (knowledge capture vs. multi-agent coordination). The open-source skills repo (catalogued separately) is more directly useful. |
| **Novelty** | 3/10 | The "expertise is the algorithm" thesis is interesting philosophy, but the technical contribution is the Agent Skills repo which we've already catalogued as Koylan Skills. The platform itself reveals no novel architecture. |
| **Actionable** | 2/10 | No code, patterns, or architecture to adopt from the platform side. The open-source skills are already covered in our existing [Koylan Skills](../agent-protocols/koylan-skills.md) entry at 4/10 actionability. |

---

## Overview

99Ravens is a **commercial agency and SaaS platform** founded by Fab Dolan (ex-Google executive, now AI Fellow at Ivey Business School) that codifies expert tacit knowledge into AI tools. The thesis: the quality gap in AI isn't code, it's expertise. They work with senior practitioners to capture the unwritten judgment that defines how experts think, then convert that into proprietary AI systems.

The business operates across three segments: **For Experts** (codify what you know, own what you build), **For Enterprises** (build on methodology, not generic AI), and **For Developers** (open-source tools for expertise codification). The platform lives at app.99ravens.ai, though its UI and feature set are not publicly documented.

**Muratcan Koylan** served as AI Agent Systems Manager at 99Ravens (2024-2026) before moving to Sully.ai as a Context Engineer. During his time at 99Ravens, he created the [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) repository, which became the highest-profile open-source output of the company — 13.6K stars, 1K forks, cited in academic research from Peking University alongside Anthropic's own work. The skills repo is the "For Developers" leg of 99Ravens' three-segment model.

---

## Technical Architecture

### Platform (app.99ravens.ai)

The commercial platform's architecture is not publicly documented. What's visible:
- **Login/auth portal** at app.99ravens.ai
- **SaaS delivery model** — cloud-hosted, proprietary
- **No public API documentation** or developer docs
- **No GitHub repo** for the platform itself

### Open-Source Component (Agent Skills)

Already comprehensively catalogued in our [Koylan Skills](../agent-protocols/koylan-skills.md) entry. Key architecture:

```
Agent-Skills-for-Context-Engineering/
├── .claude-plugin/marketplace.json    # Claude Code plugin registration
├── SKILL.md                           # Root entry point
├── skills/                            # 13 skills across 5 categories
│   ├── context-fundamentals/          # Foundational
│   ├── context-degradation/
│   ├── context-compression/
│   ├── multi-agent-patterns/          # Architectural
│   ├── memory-systems/
│   ├── tool-design/
│   ├── filesystem-context/
│   ├── hosted-agents/
│   ├── context-optimization/          # Operational
│   ├── evaluation/
│   ├── advanced-evaluation/
│   ├── project-development/           # Development
│   └── bdi-mental-states/             # Cognitive
├── examples/                          # 5 example projects
│   ├── digital-brain-skill/
│   ├── llm-as-judge-skills/
│   ├── x-to-book-system/
│   ├── book-sft-pipeline/
│   └── interleaved-thinking/
└── template/                          # Skill authoring template
```

**Plugin bundles** (5): context-engineering-fundamentals, agent-architecture, agent-evaluation, agent-development, cognitive-architecture.

### Related Projects by Koylan

| Project | Stars | Description |
|---------|-------|-------------|
| AI-Investigator | 703 | Automated website content analysis with Claude 3.5 + Firecrawl |
| Ralph Wiggum Copywriter | 675+ | Multi-agent Claude Code plugin for autonomous copywriting |
| ActualCode | 11 | 7-agent code assessment platform using A2A protocol + Gemini |
| book-training | 32 | Author-style SFT with LoRA |

---

## Publisher Background

**Fab Dolan (CEO/Founder):** Ex-Google executive, now AI Fellow at Ivey Business School. Background in marketing and brand strategy. Publishes "X Becomes Software" on Substack — a newsletter about AI ownership, expertise codification, and the future of work. His framing is business/philosophical rather than technical. The thesis that "AI quality gap isn't code, it's expertise" positions 99Ravens as an advisory/agency play, not a developer tools company.

**Muratcan Koylan (Former AI Agent Systems Manager, 2024-2026):** Now Context Engineer at Sully.ai (clinical AI). Background in Communication Design (HCI) from Ozyegin University + 7 years in B2B marketing. The technical engine behind 99Ravens' open-source output. His Agent Skills repo (13.6K stars) puts him in the top tier of context engineering practitioners, cited alongside Anthropic in academic literature. Also created AI-Investigator (703 stars) and ActualCode (Google Cloud Hackathon 2nd place). Based in Toronto.

**Key observation:** Koylan has since left 99Ravens for Sully.ai. The open-source momentum (13.6K stars) belongs to his personal GitHub, not a 99Ravens org. The platform's continued technical velocity is unclear without him.

---

## What's Valuable for Us

1. **The Open-Source Skills Are Already Catalogued**

   Everything technically actionable from 99Ravens lives in the [Koylan Skills](../agent-protocols/koylan-skills.md) entry. The progressive disclosure pattern, filesystem-context management, context degradation model, and BDI mental states are covered there.

2. **"Expertise Is the Algorithm" as Business Model Validation**

   99Ravens' thesis maps loosely to what we do: our orchestration patterns, CLAUDE.md instructions, and agent personas ARE codified expert knowledge. The difference is we codify orchestration expertise, they codify domain expertise. This validates the general approach of knowledge-as-moat.

3. **Plugin Marketplace Pattern**

   The `.claude-plugin/marketplace.json` structure for registering skill bundles with Claude Code is a concrete implementation worth studying if we ever package our orchestration patterns as distributable skills. Five plugin bundles (fundamentals, architecture, evaluation, development, cognitive) show a clean taxonomy.

4. **Koylan as Practitioner**

   His trajectory (marketing -> HCI -> agent systems -> context engineering) and output (13.6K star repo, academic citations, multiple agent projects) make him a notable practitioner worth tracking. Consider adding to the practitioners section.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **The SaaS platform (app.99ravens.ai)** | Proprietary, undocumented, no public API. Nothing to inspect or adopt. |
| **Expertise codification model** | We don't capture domain expert knowledge — we build multi-agent orchestration. Different problem. |
| **"For Enterprises" offering** | Agency/consulting services, not tools or patterns. |
| **Newsletter ("X Becomes Software")** | Business philosophy, not technical content. |
| **Fab Dolan's vision** | Marketing/ownership thesis is interesting but irrelevant to our 70/30 deterministic/LLM architecture. |

**Governing Principle tensions:**
- **"Build only what you have needed in the last 30 days"** — 99Ravens solves a problem we don't have (domain knowledge codification).
- **Context separation principle** — 99Ravens' model of embedding business expertise into agents is the opposite of our approach, which explicitly separates business context from coding agents.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Nothing.
- **Phase 2 (Days 4-60):** Nothing from the platform. The Koylan Skills entry already maps Phase 2 actions for the open-source component.
- **Phase 3 (Days 60-90):** If packaging our orchestration patterns as distributable Claude Code plugins, study the `.claude-plugin/marketplace.json` structure and 5-bundle taxonomy.
- **Phase 4 (Days 90+):** If we ever offer "orchestration as a service" to other teams/agencies, the 99Ravens business model (expert knowledge -> AI tools) is a reference for go-to-market framing.

---

## Key Takeaway

> **99Ravens is a commercial expertise-codification agency whose only technically actionable output — the Agent Skills for Context Engineering repo — is already catalogued separately as Koylan Skills. The platform itself is proprietary and undocumented. Track Koylan as a practitioner, not 99Ravens as a tool.**
