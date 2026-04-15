# How I Use Obsidian + Claude Code to Run My Life

> **Greg Isenberg + Internet Vin — The Startup Ideas Podcast, 2026-02-23**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=6MBq1paspVU |
| Speaker | Greg Isenberg (host, Late Checkout) + Internet Vin (guest) |
| Event | The Startup Ideas Podcast (YouTube) |
| Duration | 00:59 |
| Date | 2026-02-23 |
| Topics | obsidian, claude-code, second-brain, slash-commands, vault-architecture |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.]*

---

## Key Takeaways

1. **The golden rule: never let the agent write into your vault** -- Vin was emphatic that only he writes into Obsidian. The agent reads and generates outputs separately, ensuring pattern detection always reflects his own authentic thinking, not the AI's interpolations.
2. **Context is the bottleneck, not the model** -- "The whole game is feeding the beast good context." The quality of AI output is directly proportional to the quality of notes, structure, and linking discipline you maintain in your vault.
3. **Custom slash commands turn a vault into an interactive thinking partner** -- Commands like /context, /today, /trace, /connect, /ideas, /ghost, /drift, and /challenge automate PKM review processes (weekly reviews, idea evolution tracking, cross-domain synthesis) that are traditionally manual and time-consuming.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Direct blueprint for our orchestrator architecture: CLAUDE.md as operating manual, vault-index as live dashboard, SessionStart hook for context loading, slash commands as skill entry points. Maps almost 1:1 to how we structure project memory. |
| **Actionable** | 9/10 | Slash command patterns (/context, /trace, /connect, /ideas) are immediately implementable. The read-only agent principle validates our approach. VAULT-INDEX.md pattern is a concrete artifact we can adopt. |

---

## Summary

Greg Isenberg interviews Internet Vin in a hands-on, 59-minute walkthrough of how Vin uses Obsidian paired with Claude Code as a personal operating system for creativity, productivity, self-reflection, and AI delegation. The core thesis: the model is not the bottleneck -- your context is.

Vin demonstrates that Obsidian's local-first, markdown-based architecture makes it the ideal backbone for AI integration. Notes are stored as plain `.md` files on disk (not locked in someone else's cloud), and the Obsidian CLI (released February 2026) serves as the bridge that gives Claude Code access to the vault's full relationship graph -- backlinks, orphan notes, tag counts, and link structure. Claude Code runs from the vault root directory, reading all files natively.

The centerpiece of the workflow is a set of custom slash commands that Vin built: `/context` loads his full life and work state; `/today` pulls calendar, tasks, and daily notes into a prioritized plan; `/trace` tracks how an idea evolved over time; `/connect` bridges two domains using the vault's link graph; `/ideas` scans 30 days of notes and produces tools to build, people to meet, and essays to write; `/ghost` answers questions the way Vin himself would; `/drift` surfaces latent patterns and contradictions; and `/challenge` pressure-tests current beliefs. A `/graduate` command promotes daily thoughts into structured assets.

The memory layer consists of three key files: CLAUDE.md (the operating manual loaded every session), VAULT-INDEX.md (a live dashboard Claude reads first), and a SessionStart hook that automatically bootstraps the vault structure into each session. Vin stresses that developing a writing habit is the prerequisite -- the more you write, the more useful the AI becomes, creating a positive feedback loop.

The most critical principle: never let the agent write into your vault. Vin was emphatic -- "I don't want an agent to write into the files... I always want it to pull from what I think about things, not what it thinks about things." The vault must contain only what you think. Agent outputs go elsewhere.

---

## Notable Quotes

> "The whole game is feeding the beast good context." -- Greg Isenberg

> "I don't want an agent to write into the files... I always want it to pull from what I think about things, not what it thinks about things." -- Internet Vin

> "Build the slash graduate command." -- Vin, ~47:11

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://ccforeveryone.com/mini-lessons/vin-obsidian-workflows | Interactive lesson breaking down Vin's exact slash command implementations | `/ingest-article` |
| https://blog.starmorph.com/blog/obsidian-claude-code-integration-guide | Complete integration guide for Obsidian + Claude Code setup | `/ingest-article` |
| https://recapio.com/digest/how-i-use-obsidian-claude-code-to-run-my-life-by-greg-isenberg | Full transcript with AI-generated summary and chat | `/ingest-article` |
| https://github.com/SizzleTheWizzle/obsidian-claude-code | Obsidian vault template with Claude Code integration and slash commands | `/ingest-post` |
| https://www.gregisenberg.com/obsidian-codes | Greg's companion page with setup resources | `/ingest-article` |
| https://aimaker.substack.com/p/para-method-tiago-forte-claude-code-obsidian-ai-productivity-os | PARA method adapted for Claude Code + Obsidian | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Obsidian | Core note-taking app -- local-first, markdown-based vault with bidirectional linking | No |
| Obsidian CLI | Official CLI released Feb 2026 -- bridge giving Claude Code access to vault relationships | No |
| Claude Code | Anthropic's CLI agent that reads/operates on the working directory | No |
| CLAUDE.md | Project-level instruction file that serves as operating manual for Claude | No |
| VAULT-INDEX.md | Live dashboard file Claude reads first each session | No |
| SessionStart hook | Automatic bootstrap that loads vault structure into each Claude session | No |

---

## Action Items

- [ ] Evaluate VAULT-INDEX.md pattern for orchestrator -- live dashboard file read at session start
- [ ] Implement /context and /trace as orchestrator slash commands
- [ ] Test read-only agent principle: agent reads vault, outputs go to separate staging area
- [ ] Review Vin's slash command implementations via CC for Everyone lesson
- [ ] Explore Obsidian CLI for vault graph traversal capabilities
- [ ] Consider /ideas pattern: scan N days of notes, produce actionable output categories
- [ ] Assess /ghost command pattern for persona-based reasoning in our system
