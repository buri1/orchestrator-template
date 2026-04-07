# Koylan Skills (Agent Skills for Context Engineering)

> **A comprehensive, open collection of Agent Skills focused on context engineering principles for building production-grade AI agent systems.**

| Field | Value |
|-------|-------|
| Category | 🤝 Agent Protocols |
| Repository | [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) |
| GitHub Stars | 13,600 (as of 2026-03-08) |
| Publisher | Muratcan Koylan (solo — Context Engineer at Sully.ai, background in HCI + B2B marketing) |
| License | MIT |
| Tech Stack | Markdown (SKILL.md format), Python pseudocode examples |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Context engineering is core to our work, and several skills (multi-agent-patterns, memory-systems, filesystem-context) map to problems we actively solve. But this is reference material, not a tool. |
| **Novelty** | 5/10 | Validates patterns we've already documented (context degradation, compression, multi-agent coordination). The "lost-in-the-middle" formalization and BDI mental states for agents are the new insights. |
| **Actionable** | 4/10 | Useful as a reference library to cross-check our context management approach. The progressive disclosure pattern for skill loading is directly applicable. But no code to adopt — it's a knowledge library. |

---

## Overview

This is not a tool or framework — it's a **curated library of Agent Skills** (in the SKILL.md format) focused specifically on context engineering for multi-agent systems. Created by Muratcan Koylan, it packages hard-won knowledge about managing LLM context windows into portable, agent-loadable skill files.

The library covers four tiers: **Foundational** (context fundamentals, degradation patterns, compression strategies), **Architectural** (multi-agent patterns, memory systems, tool design, filesystem-based context, hosted agents), **Operational** (context optimization, evaluation, advanced evaluation with LLM-as-judge), and **Development/Cognitive** (project development workflows, BDI mental states for deliberative reasoning).

The key design philosophy is **progressive disclosure** — agents only load the skill content they need for the current task, preventing context window pollution. Skills are deliberately platform-agnostic, working with Claude Code, Cursor, or any framework that supports custom instructions. Skills cross-reference each other, building a connected knowledge graph rather than isolated documents. The project has been cited in academic research from Peking University, putting it alongside Anthropic's own work in scholarly recognition.

---

## Technical Architecture

```
Agent-Skills-for-Context-Engineering/
├── SKILL.md                           # Root skill (entry point)
├── skills/
│   ├── context-fundamentals/          # Foundational
│   │   └── SKILL.md
│   ├── context-degradation/           # "Lost-in-the-middle" patterns
│   │   └── SKILL.md
│   ├── context-compression/           # Compression strategies
│   │   └── SKILL.md
│   ├── multi-agent-patterns/          # Multi-agent coordination
│   │   └── SKILL.md
│   ├── memory-systems/                # Memory architectures
│   │   └── SKILL.md
│   ├── tool-design/                   # Tool/function calling design
│   │   └── SKILL.md
│   ├── filesystem-context/            # File-system-based context mgmt
│   │   └── SKILL.md
│   ├── hosted-agents/                 # Cloud/hosted agent patterns
│   │   └── SKILL.md
│   ├── context-optimization/          # Operational optimization
│   │   └── SKILL.md
│   ├── evaluation/                    # Eval frameworks
│   │   └── SKILL.md
│   ├── advanced-evaluation/           # LLM-as-judge patterns
│   │   └── SKILL.md
│   ├── project-development/           # Development workflow
│   │   └── SKILL.md
│   └── bdi-mental-states/             # BDI reasoning model
│       └── SKILL.md
└── scripts/                           # Optional automation
```

Key design decisions:
- **No runtime dependencies:** Pure Markdown + YAML, no code to install
- **Progressive disclosure:** Root SKILL.md acts as index, individual skills load on demand
- **Cross-referencing:** Skills reference each other (e.g., compression references degradation patterns)
- **Portable pseudocode:** Examples use Python-like pseudocode that translates to any language
- **122 commits** on main, actively maintained, single author

---

## Publisher Background

**Muratcan Koylan** is a Context Engineer and Researcher at Sully.ai (healthcare AI startup). His background is in Communication Design (HCI) from Ozyegin University plus 7 years in B2B marketing — an unusual combination that explains his focus on the human-AI interaction patterns rather than raw engineering. Previously AI Agent Systems Manager at 99Ravens.

His open-source work has achieved remarkable traction (13.6K stars) and academic citations alongside Anthropic's own research. He also created AI-Investigator (automated web research) and The-Rosetta-Prompt (cross-provider prompt adaptation). His work is more practitioner-knowledge than production code — think "patterns and principles" rather than "libraries and frameworks."

---

## What's Valuable for Us

1. **Context Degradation Patterns (Validation)**

   The "lost-in-the-middle" formalization — where LLMs attend less to information in the middle of long context windows — validates our approach of keeping agent context focused and using context separation (Elvis Sun principle). Worth cross-checking our current prompt designs against these documented patterns.

2. **Filesystem-Based Context Management**

   The `filesystem-context` skill documents patterns for using the filesystem as a context management layer — exactly what we do with our `_bmad/` state files, `orchestrator-state.json`, and the knowledge catalogue itself. Good reference for formalizing our approach.

3. **Progressive Disclosure for Skill Loading**

   The pattern of having a root SKILL.md that acts as an index, with individual skills loaded on demand, maps to how we could restructure our `.claude/commands/` — an index file that helps agents discover which command to load rather than requiring the human to specify.

4. **BDI Mental States for Agents**

   The Belief-Desire-Intention model applied to agent reasoning is a novel frame. Our agents currently operate in a simple task → execute → report model. BDI could inform more sophisticated agent behavior in Phase 3+.

---

## What's NOT Relevant

| Feature | Why Not |
|---------|---------|
| **HCI/marketing framing** | The communication design background shows — some content is more conceptual than engineering-practical. |
| **Hosted agents skill** | We run local agents via Claude Code CLI, not cloud-hosted agent platforms. |
| **Advanced evaluation / LLM-as-judge** | We use E2E testing as our quality gate, not LLM-based evaluation. Our principle: deterministic verification over probabilistic assessment. |
| **Python pseudocode** | Our stack is TypeScript/shell. The pseudocode requires mental translation. |

**Governing Principle tension:**
- **70/30 Deterministic/LLM split:** The evaluation skills push toward LLM-heavy quality assessment. We prefer deterministic E2E tests.

---

## Future Use Cases

- **Phase 1 (Days 1–3):** Nothing to adopt immediately.
- **Phase 2 (Days 4–60):** Read `context-degradation` and `context-compression` skills to validate our prompt architecture. Cross-check `filesystem-context` against our state management patterns.
- **Phase 3 (Days 60–90):** Consider the BDI model for more sophisticated agent reasoning. Study `multi-agent-patterns` when formalizing our agent team coordination.
- **Phase 4 (Days 90+):** If we open-source our orchestration patterns, this library's structure is a good template for how to package them as Agent Skills.

---

## Key Takeaway

> **Koylan's skills library is the best publicly available reference for context engineering patterns in multi-agent systems — it validates much of what we already do and adds the "lost-in-the-middle" degradation model and BDI reasoning framework as new concepts worth studying. It's a knowledge library, not a tool: read it, don't install it.**
