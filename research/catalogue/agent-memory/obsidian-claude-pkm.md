# Obsidian + Claude Code PKM

> **A complete starter kit for an Obsidian + Claude Code personal knowledge management system — an execution system that connects 3-year vision to daily action with AI accountability.**

| Field | Value |
|-------|-------|
| Category | 🧠 Agent Memory & Context |
| Repository | [ballred/obsidian-claude-pkm](https://github.com/ballred/obsidian-claude-pkm) |
| GitHub Stars | 1,324 (as of 2026-04-04) |
| Publisher | Bill Allred (ballred) — solo developer; 13 public repos; longstanding GitHub presence (since 2010) |
| License | MIT |
| Tech Stack | Shell (Bash), Markdown, Git, Claude Code CLI, Obsidian |
| Maturity | 🟢 Production (v3.1; active development; 92 forks; comprehensive docs) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *This is the most polished implementation of the "Obsidian as agent memory layer" pattern that Karpathy, Greg Isenberg, and the Icarus Memory Protocol have all independently converged on. The cascade system (Vision -> Yearly -> Projects -> Monthly -> Weekly -> Daily) is well-engineered and the zero-dependency pure-bash approach aligns with our simplicity-first principle. The 4 specialized agents (goal-aligner, weekly-reviewer, note-organizer, inbox-processor) with cross-session `memory: project` are a clean implementation of role-based memory personas. The PostToolUse auto-commit hook is a pattern we should study — it's our git-as-persistence principle applied to a knowledge vault. The `/adopt` command (scan existing vault structure, detect PARA/Zettelkasten/LYT, map interactively) is genuinely clever UX for onboarding. However, this is fundamentally a personal productivity tool, not a multi-agent coordination system — the "agents" are Claude Code subagents operating within a single vault, not independent workers communicating through shared state. For our purposes, the value is in the patterns (cascade context file, hook-driven automation, session-init priority surfacing) rather than the system itself.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves personal knowledge management, not multi-agent orchestration. The cascade design pattern (vision->goals->projects->daily) and hook automation patterns are transferable, but the system addresses a different problem domain than the Master Blueprint's agent coordination focus. |
| **Novelty** | 5/10 | Validates the Obsidian+Claude Code pattern we've seen in Karpathy's LLM Wiki, Icarus Memory Protocol, Greg Isenberg/Vin's "AI Second Brain", and Cole Medin's system. This is the best-packaged implementation but the core ideas are well-documented in our catalogue. The `/adopt` vault detection and the productivity coach output style are minor new touches. |
| **Actionable** | 6/10 | The hook patterns (PostToolUse auto-commit, session-init priority surfacing, skill-discovery on prompt) are directly adoptable. The CLAUDE.md structure and settings.json permission scoping are clean references. Could be installed and tested in 15 minutes. |

---

## Overview

Obsidian-Claude-PKM is a "starter kit" that transforms an Obsidian vault into an AI-powered execution system. The central innovation is the **cascade** — a hierarchical chain linking 3-year vision to yearly goals to active projects to monthly goals to weekly reviews to daily tasks. Every layer references the layers above it, so Claude Code can always trace a daily task back to its strategic purpose.

The system is built entirely on bash scripts and markdown files, with zero external dependencies beyond Obsidian, Claude Code CLI, and Git. This radical simplicity makes it immediately adoptable. The `.claude/` directory contains 4 specialized agents, 13 skills (slash commands), 3 automation hooks, 4 path-specific rule files, and a productivity coach output style — all pure markdown and shell.

The key design decision is using Claude Code's native `memory: project` setting for cross-session learning. The goal-aligner agent remembers recurring misalignment patterns, the weekly-reviewer learns which reflection questions resonate, and the note-organizer learns vault conventions. This is emergent procedural memory via Claude Code's built-in persistence, not a custom memory system — simpler than CASS/CM but less sophisticated.

---

## Technical Architecture

### Cascade Data Model

```
Goals/0. Three Year Goals.md    ← Vision layer (life areas, direction)
  └── Goals/1. Yearly Goals.md  ← Annual objectives + quarterly milestones
       └── Projects/*/CLAUDE.md ← Active initiatives (each project = folder + CLAUDE.md)
            └── Goals/2. Monthly Goals.md  ← Monthly rollup + quarterly check
                 └── Goals/3. Weekly Review.md  ← Reflect, realign, plan
                      └── Daily Notes/YYYY-MM-DD.md  ← Morning plan + evening reflection
```

### Hook Architecture

Three automation hooks wired via `.claude/settings.json`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-init.sh` | SessionStart | Export vault env vars, detect first run, surface ONE Big Thing from weekly review, show days since last review, count active projects |
| `auto-commit.sh` | PostToolUse (Write/Edit) | Git auto-commit with context-aware messages (detects Daily/Goals/Projects/Templates directory) |
| `skill-discovery.sh` | UserPrompt | Pattern-match user input for "skill"/"help" keywords, list available commands |

### Agent System

4 agents using Claude Code's `memory: project` for cross-session learning:

| Agent | Role | Memory Pattern |
|-------|------|----------------|
| `goal-aligner` | Audits activity against stated goals, flags misalignment | Remembers recurring misalignment patterns |
| `weekly-reviewer` | Facilitates 3-phase weekly review | Learns user's reflection style |
| `note-organizer` | Vault hygiene (broken links, duplicates) | Learns vault conventions |
| `inbox-processor` | GTD-style categorize/clarify/organize | Learns categorization preferences |

### Permissions Model (settings.json)

Bash commands restricted to: `git`, `ls`, `mkdir`, `date`, `wc`, `find`, `cp`, `mv`. Write access scoped to content directories only (Daily Notes, Goals, Projects, Archives, Templates, Inbox). Editing `.claude/` and `.git/` explicitly denied. `rm -rf` blocked.

---

## Publisher Background

Bill Allred (ballred) is a solo developer with a GitHub account dating to 2010 and 13 public repositories. The obsidian-claude-pkm project is his primary work with 1,324 stars and 92 forks, making it one of the most popular Obsidian + AI agent integrations. Two additional contributors (DavidROliverBA, eiszazel) have made minor contributions. The project has an active community (discussions, polls, 10 open issues, contributing guidelines). No visible corporate backing or funding — this is a passion project that found significant community traction.

---

## What's Valuable for Us

1. **PostToolUse auto-commit hook pattern**: The `auto-commit.sh` hook that fires on every Write/Edit operation with context-aware commit messages (detecting which directory was modified) is a clean pattern. We could adapt this for our orchestrator state files — auto-commit `orchestrator-tmux-state.json` and `devlog.md` changes without manual intervention.

2. **Session-init priority surfacing**: The `session-init.sh` hook that extracts the ONE Big Thing from the weekly review, shows days since last review, and counts active projects is an excellent UX pattern for our orchestrator startup. Our `orchestrator-session-start.sh` could surface current sprint priority, blocked agents, and pending PRs in the same way.

3. **CLAUDE.md cascade structure**: The hierarchical context file that maps vault structure, tag taxonomy, skill inventory, and workflow cadence in a single file is well-organized. The pattern of embedding the cascade visualization directly in CLAUDE.md so the agent always understands the hierarchy is worth studying.

4. **Permission scoping in settings.json**: The explicit deny list (`rm -rf`, `.claude/`, `.git/`) alongside scoped write access is a clean security model for agent sandboxing. Maps to our `--dangerously-skip-permissions` risk surface.

5. **`/adopt` command pattern**: Auto-detecting existing vault structure (PARA, Zettelkasten, LYT), mapping folders interactively, and generating config files scoped to the user's directory names. This "bring your own vault" pattern could inspire a "bring your own project" onboarding for our orchestrator.

---

## What's NOT Relevant

1. **Personal productivity focus**: This is a "second brain for one person" system. Our Master Blueprint governs multi-agent coordination across parallel workers writing code — fundamentally different problem domain. The cascade (vision -> daily tasks) doesn't map to our issue-driven task routing.

2. **Single-vault, single-user assumption**: Everything revolves around one Obsidian vault with one human operator. We need multi-project, multi-agent state that spans repos and worktrees.

3. **Claude Code `memory: project` as memory system**: Using Claude Code's built-in session memory is elegant for personal use but doesn't scale to our multi-agent scenario where workers need shared state. Our agents communicate through explicit state files (`orchestrator-tmux-state.json`, devlog, PR comments), not implicit LLM memory.

4. **No structured data model**: Everything is free-form markdown. No JSON schemas, no machine-parseable state, no robot-mode output. Our orchestrator requires deterministic state that can be programmatically read and updated.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Adopt the PostToolUse auto-commit hook pattern for orchestrator state files. Study the session-init priority surfacing pattern for our `orchestrator-session-start.sh` improvements.
- **Phase 3 (Days 60-90)**: If we build a "knowledge compounding" layer (per Karpathy's LLM Wiki pattern), this vault structure could serve as a reference implementation for the personal-context tier.
- **Phase 4 (Days 90+)**: The `/adopt` onboarding pattern becomes relevant if we productize the orchestrator for other teams — detect existing project structure, generate orchestrator config automatically.

---

## Key Takeaway

> **The best-packaged Obsidian+Claude Code PKM system (1.3K stars), valuable for its hook automation patterns (auto-commit, session-init, skill-discovery) and cascade context design, but fundamentally a personal productivity tool rather than a multi-agent coordination system.**
