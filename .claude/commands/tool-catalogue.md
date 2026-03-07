---
name: 'tool-catalogue'
description: 'Analyze a tool/framework/platform and add it to the research catalogue with standardized scoring and categorization'
---

You are adding a new entry to the Tool Catalogue at `{project-root}/research/catalogue/`.

<steps CRITICAL="TRUE">
1. LOAD the template from `{project-root}/research/catalogue/_TEMPLATE.md`
2. READ the INDEX at `{project-root}/research/catalogue/INDEX.md` to understand existing categories and entries
3. FETCH and deeply analyze the repository/tool URL provided by the user
4. DETERMINE the correct category from the list below
5. CREATE the profile by filling the template — be thorough, opinionated, and reference our Master Blueprint at `{project-root}/research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md`
6. SAVE the profile to `{project-root}/research/catalogue/<category>/<tool-name>.md`
7. UPDATE the INDEX.md to include the new entry in the correct category table
</steps>

## Categories

| Category | Directory | Use When |
|----------|-----------|----------|
| 🧠 Agent Memory & Context | `agent-memory/` | Memory systems, context retrieval, knowledge stores, RAG platforms |
| 🎛️ Orchestration Platforms | `orchestration-platforms/` | Multi-agent coordination, task routing, governance, business orchestration |
| 🖥️ Developer GUI / IDE | `developer-gui/` | Desktop/web apps for managing agent sessions, IDE extensions |
| ⚙️ Agent Harnesses / SDKs | `agent-harnesses/` | CLI tools, SDKs, runtimes that execute agent tasks |
| 📚 Research & Academic | `research-academic/` | Papers, benchmarks, research systems (not production tools) |
| 🔍 Observability & Debugging | `observability/` | Tracing, monitoring, failure analysis, cost tracking |
| 🧬 Code Intelligence | `code-intelligence/` | Semantic code understanding, codebase search, knowledge graphs |

> If a tool doesn't fit any category, create a new one and add it to this list.

## Scoring Rubric

When scoring **Relevance to our vision** (0-10):
- 9-10: Directly solves a problem in our current roadmap phase
- 7-8: Solves a problem we'll face in the next 60 days
- 5-6: Interesting patterns we could adapt, but no immediate need
- 3-4: Tangentially related, maybe useful at Phase 4 (Day 90+)
- 1-2: Different problem domain, minimal overlap

When scoring **Novelty** (0-10):
- 9-10: Completely new approach we haven't seen in our research
- 7-8: Known concept but significantly better implementation
- 5-6: Validates patterns we've documented with minor new insights
- 3-4: Mostly covers ground we've already researched
- 1-2: Nothing new

When scoring **Actionable** (0-10):
- 9-10: Can directly adopt code/patterns this week
- 7-8: Clear adaptation path, ~1 day of work
- 5-6: Useful reference, needs significant adaptation
- 3-4: Interesting but requires substantial rethinking
- 1-2: Purely informational

## Quality Standards

- Always cross-reference with the Master Blueprint's governing principles
- Include specific file/schema/function references from the analyzed tool
- Be opinionated — state clearly whether to adopt, reference, or ignore
- Publisher background should assess credibility (track record, other projects, backing)
- Architecture section should include actual data model details, not just marketing copy
