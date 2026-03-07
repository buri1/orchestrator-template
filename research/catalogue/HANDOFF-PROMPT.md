# Tool Catalogue: Build & Populate

## Context

You are a Senior Developer working on the L-Thread Orchestrator project. A previous agent session has:

1. Created the catalogue directory structure at `research/catalogue/` with 4 category subdirectories
2. Created 4 standardized templates:
   - `research/catalogue/_TEMPLATE.md` (tools/frameworks)
   - `research/catalogue/_TEMPLATE-TALK.md` (conference talks / YouTube videos)
   - `research/catalogue/_TEMPLATE-ARTICLE.md` (blog posts / articles)
   - `research/catalogue/_TEMPLATE-POST.md` (X posts / threads)
3. Created a master INDEX at `research/catalogue/INDEX.md`
4. Created 4 Claude Code slash commands:
   - `.claude/commands/tool-catalogue.md` → `/tool-catalogue <repo-url>`
   - `.claude/commands/ingest-talk.md` → `/ingest-talk <youtube-url>`
   - `.claude/commands/ingest-article.md` → `/ingest-article <url>`
   - `.claude/commands/ingest-post.md` → `/ingest-post <url>`
5. Placed 3 draft analysis files (`.draft.md`) as seeds — these need to be converted to the template format

Your job is to **complete the catalogue** by converting drafts and creating all missing tool profiles.

---

## References

| Document | Path |
|----------|------|
| **Tool Template** | `research/catalogue/_TEMPLATE.md` |
| **Talk Template** | `research/catalogue/_TEMPLATE-TALK.md` |
| **Article Template** | `research/catalogue/_TEMPLATE-ARTICLE.md` |
| **Post Template** | `research/catalogue/_TEMPLATE-POST.md` |
| **INDEX** | `research/catalogue/INDEX.md` |
| **Master Blueprint** | `research/2026-03-06_MASTER-BLUEPRINT-system-architecture.md` |

### Draft Seeds (convert to template format, then delete .draft.md)

| Draft | Path |
|-------|------|
| Always-On Memory Agent | `research/catalogue/agent-memory/always-on-memory-agent.draft.md` |
| Paperclip | `research/catalogue/orchestration-platforms/paperclip.draft.md` |
| Jean | `research/catalogue/developer-gui/jean.draft.md` |

---

## Tasks

### Phase 1: Convert Draft Seeds (3 files)

For each `.draft.md` file:
1. Read the draft analysis
2. Read `_TEMPLATE.md`
3. Create a new file (without `.draft` in the name) using the template structure
4. Populate all sections from the draft content + add the "Burak's Notes" section (leave it as the placeholder)
5. Delete the `.draft.md` file

Files to create:
- `research/catalogue/agent-memory/always-on-memory-agent.md`
- `research/catalogue/orchestration-platforms/paperclip.md`
- `research/catalogue/developer-gui/jean.md`

### Phase 2: Create Missing Profiles from Prior Analysis (2 files)

These tools were analyzed in conversation but not written to files. Fetch from GitHub and create profiles:

- **T3 Code** → `research/catalogue/developer-gui/t3code.md`
  - Repo: https://github.com/pingdotgg/t3code
  - Key facts: Theo's web GUI for Codex CLI, Tauri desktop app, TypeScript monorepo (Turbo), early stage, not accepting contributions. Same category as Jean but less mature. Relevance: 2/10.

- **Airweave** → `research/catalogue/agent-memory/airweave.md`
  - Repo: https://github.com/airweave-ai/airweave
  - Key facts: Enterprise context retrieval layer (FastAPI + Vespa + Temporal + Redis + PostgreSQL + Docker/K8s). 50+ connectors, MCP server, SDK. Overkill for Phase 1-2, potential Phase 4+ (Day 90+). Relevance: 3/10.

### Phase 3: Create Profiles from Prior Conversations (5 files)

Fetch each repo from GitHub, analyze deeply, cross-reference with the Master Blueprint, and create full profiles:

- **Qwen-Agent** → `research/catalogue/orchestration-platforms/qwen-agent.md`
  - Repo: https://github.com/QwenLM/Qwen-Agent

- **Factory IDE** → `research/catalogue/developer-gui/factory-ide.md`
  - Repo: Search for "Factory IDE" / factory.ai — analyze their architecture and fit

- **Pi Agent** → `research/catalogue/agent-harnesses/pi-agent.md`
  - Repo: https://github.com/AbanteAI/mentat or https://github.com/badlogic/pi-agent
  - NOTE: There are 15+ existing research docs about Pi Agent in `research/`. Do a brief summary profile that REFERENCES these docs rather than duplicating them. Key docs: `2026-03-05_pi-agent-architecture-deep-dive.md`, `2026-03-05_pi-core-sdk-deep-architecture.md`, `2026-03-05_pi-orchestrator-architecture-blueprint.md`

- **GitHub Copilot SDK** → `research/catalogue/agent-harnesses/copilot-sdk.md`
  - Focus on the extensibility SDK (hooks, events, context handling), not the Copilot product itself

- **OpenAI Codex** → `research/catalogue/agent-harnesses/openai-codex.md`
  - Repo: https://github.com/openai/codex
  - Focus on the CLI tool and its architecture, compare to Claude Code

### Phase 4: Finalize INDEX.md

After all profiles are created:
1. Update `research/catalogue/INDEX.md` with correct relevance scores for all entries
2. Remove all "Pending" markers
3. Ensure all links resolve correctly

---

## Quality Checklist

- [ ] Every profile follows `_TEMPLATE.md` structure exactly
- [ ] Every profile has "Burak's Notes" section (with placeholder text)
- [ ] Every profile cross-references the Master Blueprint
- [ ] Every profile has concrete relevance/novelty/actionable scores with reasoning
- [ ] Publisher Background is filled for every entry
- [ ] INDEX.md has no broken links
- [ ] All `.draft.md` files have been deleted
