# Anatomy of the .claude/ folder

> **@akshay_pachaar — 2026-03-21**

| Field | Value |
|-------|-------|
| Source | https://x.com/akshay_pachaar/status/2035341800739877091 |
| Author | [@akshay_pachaar — Akshay, AI/ML educator & vibe coding practitioner] |
| Date | 2026-03-21 |
| Topics | Claude Code, .claude/ folder, CLAUDE.md, context engineering, agent configuration, commands, skills, agents, permissions |
| Type | X Article (long-form) |
| Stats | 127 replies · 1,439 reposts · 9,779 likes · 9.3M views |

---

## Burak's Notes

> *This is effectively an official field guide to Claude Code configuration. 9.3M views means this is the de facto community reference. The distinction between commands (slash-triggered) vs skills (auto-invoked by context match) is subtle but critical. The path-scoped rules via YAML frontmatter is something we should adopt immediately in CLAUDE.md overhaul. The two-folder model (project-level committed + global ~/.claude/) is exactly our setup.*

---

## Key Takeaways

1. **Two `.claude/` folders, not one** — project-level (committed to git, team-shared) and `~/.claude/` (personal preferences, session history, auto-memory); this dual-scope architecture is the foundation of Claude Code configuration.
2. **Commands vs Skills: different trigger models** — commands require explicit `/project:name` invocation; skills are auto-invoked when Claude recognizes context match from the `description` YAML frontmatter field; both can bundle supporting files.
3. **Path-scoped rules via YAML frontmatter** — rule files in `.claude/rules/` can specify `paths:` to only activate for matching file globs (e.g., only load API conventions when editing `src/api/**/*.ts`); unconditional rules load every session.
4. **Agents folder for isolated subagent personas** — `.claude/agents/` defines specialist subagents with their own system prompt, `tools:` restrictions, and `model:` preference; cheaper models (Haiku) for read-only tasks, save Sonnet/Opus for complex work.
5. **CLAUDE.md under 200 lines** — instruction adherence measurably drops beyond 200 lines; split into `rules/` files as the project grows; path-scope them aggressively.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 10/10 | Direct reference architecture for our Claude Code orchestration setup; covers every config primitive we use; 9.3M views = community standard |

---

## Full Content

*X Article published 2026-03-21 by @akshay_pachaar. Full text retrieved from https://x.com/akshay_pachaar/status/2035341800739877091.*

**Two folders, not one**

There are actually two `.claude` directories: one inside your project (committed to git, team-shared) and one at `~/.claude/` (personal preferences, session history, auto-memory across projects).

**CLAUDE.md: Claude's instruction manual**

Loaded straight into the system prompt at session start. Rules: keep under 200 lines (adherence drops beyond that). Write: build/test/lint commands, key architecture decisions, non-obvious gotchas, import conventions. Don't write: linter config, full docs, long theory paragraphs.

`CLAUDE.local.md` in project root holds personal overrides — auto-gitignored.

**The `rules/` folder: modular instructions that scale**

Every `.md` in `.claude/rules/` loads alongside CLAUDE.md. Split by concern (code-style.md, testing.md, api-conventions.md, security.md). Key feature: YAML frontmatter `paths:` field makes rules activate only for matching file globs:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/handlers/**/*.ts"
---
# API Design Rules
```

Rules without `paths:` load unconditionally every session.

**The `commands/` folder: custom slash commands**

Every `.md` in `.claude/commands/` becomes `/project:<filename>`. Use `!` backtick syntax to run shell commands and embed output. Use `$ARGUMENTS` to pass text after the command name.

- Project commands (`.claude/commands/`) → `/project:name`
- Personal commands (`~/.claude/commands/`) → `/user:name`

**The `skills/` folder: auto-invoked workflows**

Unlike commands (slash-triggered), skills are invoked automatically when Claude recognizes a context match from the `description` YAML frontmatter. Skills can bundle supporting files in their subdirectory.

```
.claude/skills/
├── security-review/
│   ├── SKILL.md
│   └── DETAILED_GUIDE.md
```

Can also be called explicitly with `/security-review`.

**The `agents/` folder: specialized subagent personas**

`.claude/agents/` defines subagent specialists. Fields: `name`, `description`, `model` (use cheaper models for read-only tasks), `tools` (restrict explicitly — a security auditor needs only Read/Grep/Glob). The agent spawns in its own isolated context window, compresses findings, reports back.

- Project agents: `.claude/agents/`
- Personal agents: `~/.claude/agents/` (available across all projects)

**`settings.json`: permissions and project config**

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git *)", "Read", "Write", "Edit"],
    "deny": ["Bash(rm -rf *)", "Bash(curl *)", "Read(./.env)"]
  }
}
```

`$schema` enables VS Code/Cursor autocomplete. `allow` = run without confirmation. `deny` = blocked entirely. Unlisted = Claude asks first. `settings.local.json` for personal permission overrides (auto-gitignored).

**The global `~/.claude/` folder**

- `~/.claude/CLAUDE.md` — loads into every session across all projects
- `~/.claude/projects/` — session transcripts and auto-memory per project; browse/edit with `/memory`
- `~/.claude/commands/` and `~/.claude/skills/` — personal commands/skills across all projects

**Practical setup progression**

1. Run `/init` — generates starter CLAUDE.md by reading your project
2. Add `settings.json` with allow/deny for your stack (minimum: allow run commands, deny .env reads)
3. Create 1-2 commands for most-used workflows (code review, fix-issue)
4. As CLAUDE.md grows crowded, split into `rules/` files with path scoping
5. Add `~/.claude/CLAUDE.md` for personal preferences

---

## Notable Replies

*(Article post — replies not paginated; stats show 127 replies but content not accessible in standard view)*

The quote-tweet at https://x.com/akshay_pachaar/status/2035706568142893229 (1.9M views, 1.5K likes) restates the article as a TL;DR thread: "The .claude/ folder is infrastructure. Treat it like one."

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://x.com/akshay_pachaar/status/2035706568142893229 | Quote-tweet TL;DR of this article with 1.9M views; contains the distilled 6-point summary useful as standalone reference | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary subject — the tool whose `.claude/` folder is being documented | Yes — central to our entire catalogue |
| CLAUDE.md | Core instruction file, highest-leverage config primitive | Yes — documented throughout catalogue; see [agent-protocols](../../agent-protocols/) |
| `/init` command | Auto-generates starter CLAUDE.md by reading project structure | Referenced in [@trq212 — New /init Version Testing](./trq212-new-init-testing.md) |
| SKILL.md standard | Skills architecture described here aligns with OpenSkills SKILL.md spec | Yes — [OpenSkills](../../agent-protocols/openskills.md) |
| settings.json | Permissions config with JSON Schema validation via schemastore.org | Not yet catalogued as standalone — consider adding to reference docs |
