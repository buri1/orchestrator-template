# Obsidian CLI + Claude Code Integration

> **Official first-party CLI for Obsidian (100+ commands), enabling native integration with Claude Code and other AI coding agents.**

| Field | Value |
|-------|-------|
| Category | :wrench: Tools / CLI |
| Repository | [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) (skills package) |
| GitHub Stars | 3,000+ (mcp-obsidian), growing (obsidian-skills) |
| Publisher | Obsidian (Steph Ango / kepano) — startup, profitable indie |
| License | MIT (obsidian-skills), proprietary (Obsidian CLI itself, bundled with Obsidian Desktop) |
| Tech Stack | Electron, Node.js, local socket IPC, Markdown |
| Maturity | :green_circle: Production (shipped in Obsidian 1.12+, GA since Feb 27, 2026) |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 9/10 | Direct bridge between knowledge management and AI-assisted workflows. Obsidian as a structured knowledge layer for agents aligns with orchestrator architecture. |
| **Novelty** | 8/10 | First-party CLI is genuinely new (Feb 2026). Pre-CLI MCP approaches were known but limited. The kepano/obsidian-skills package as a skills distribution model is a novel pattern. |
| **Actionable** | 10/10 | Install today, use immediately. CLI commands via Bash, skills via `.claude/skills/`, zero custom code needed. |

---

## Overview

The Obsidian CLI is an official, first-party command-line interface that shipped with Obsidian Desktop 1.12+ (early access Feb 10, 2026; GA Feb 27, 2026). It is not a separate tool or plugin -- it ships bundled with the Obsidian desktop installer and acts as a remote control for a running Obsidian instance. Commands route through Obsidian's internal API via a local socket file, meaning file moves trigger automatic wikilink rewriting, property changes immediately update the vault index, and Unicode normalization is handled by the app.

The CLI exposes 100+ commands across file operations (`read`, `create`, `append`, `move`, `delete`), search (`search query="term" limit=10 format=json`), daily notes, frontmatter properties, tags, backlinks/graph analysis, plugin management, and developer tools (`eval`, `screenshot`, `errors`, `devtools`). Multi-vault support is built in via `vault="My Vault"`. Machine-parseable JSON output is available via `--format=json`.

Separately, Steph Ango (Obsidian CEO, kepano) published `kepano/obsidian-skills` -- an MIT-licensed skills package designed for Claude Code and Codex CLI. It teaches agents the full CLI syntax, Obsidian-flavored Markdown, Bases (structured data), JSON Canvas, and Defuddle (clean web extraction). Skills install via `/plugin marketplace add kepano/obsidian-skills` or by copying to `vault/.claude/skills/`.

---

## Technical Architecture

**CLI Architecture:**
- CLI binary ships inside Obsidian Desktop (not standalone)
- Communicates with running Obsidian instance via **local socket file** (hidden dotfile on macOS/Linux)
- If Obsidian isn't running, CLI auto-launches the app
- All operations route through Obsidian's internal API -- ensures index consistency, wikilink integrity, and plugin awareness
- Syntax: `obsidian <command> [param=value] [flag]`
- JSON output: `--format=json` for programmatic parsing

**Key Components:**
- **File operations:** CRUD with automatic wikilink updates on moves
- **Search engine:** Uses Obsidian's internal index (54x faster than grep for orphan detection, 6x faster for vault search)
- **Property system:** Frontmatter read/write with type validation
- **Plugin control:** Enable, disable, reload plugins from terminal
- **Developer tools:** `eval` runs arbitrary JS against `app.*` API, `dev:errors` shows console errors
- **Headless Sync:** Obsidian 1.12 also added headless sync (no GUI needed for Obsidian Sync)

**Integration Points:**
- Claude Code: Bash tool calls to `obsidian` binary
- Skills: Markdown files in `vault/.claude/skills/` auto-loaded by Claude Code
- MCP: Pre-CLI approaches still work as fallback (obsidian-claude-code-mcp via WebSocket, mcp-obsidian via REST API)

**macOS Setup:**
1. Settings -> General -> "Command line interface" -> "Register CLI path"
2. Adds to `~/.zprofile`, restart terminal
3. `obsidian` command available globally

---

## Publisher Background

**Obsidian** is a profitable, bootstrapped indie company founded by Steph Ango (kepano) and Shida Li. Known for a privacy-first, local-first philosophy. Obsidian has millions of users and a sustainable business model (one-time Catalyst purchases, optional Sync/Publish subscriptions). Steph Ango personally authored the `obsidian-skills` package, signaling that AI-agent integration is a first-party priority, not a community afterthought.

**Pre-CLI community efforts:**
- **MarkusPfundstein/mcp-obsidian** (3,000+ stars): Python MCP server using the Local REST API community plugin. 7 tools. The most established pre-CLI bridge.
- **iansinnott/obsidian-claude-code-mcp**: Obsidian plugin implementing MCP server directly inside Obsidian. WebSocket + HTTP/SSE dual transport. Auto-discovery via `/ide`.
- **pablo-mano/Obsidian-CLI-skill**: Community-maintained CLI skill alternative.
- **axtonliu/axton-obsidian-visual-skills**: Visual skills (Canvas, Excalidraw, Mermaid).

---

## What's Valuable for Us

1. **CLI-as-interface pattern:** The Obsidian CLI demonstrates that wrapping a rich app behind a Unix-style CLI with JSON output creates the ideal agent integration surface. No MCP server needed, no plugin dependencies -- just Bash calls. This pattern is directly applicable to how we think about tool integration in the orchestrator.

2. **Skills distribution model:** `kepano/obsidian-skills` shows how to package domain knowledge as Markdown skill files that Claude Code auto-loads from `.claude/skills/`. This is the exact pattern our orchestrator skills system uses. Study the `SKILL.md` format at `github.com/kepano/obsidian-skills/blob/main/skills/obsidian-cli/SKILL.md`.

3. **Obsidian as structured knowledge layer:** With CLI access, Obsidian vaults become queryable knowledge bases for agents. Properties (frontmatter), tags, backlinks, and full-text search are all accessible programmatically. This is relevant for any knowledge management integration in the orchestrator.

4. **Performance benchmarks:** CLI finds orphan notes 54x faster than grep, vault search 6x faster. These numbers validate routing through the app's internal index rather than raw filesystem operations.

5. **Concrete commands for immediate use:**
   - `obsidian search query="term" limit=10 format=json` -- structured search
   - `obsidian read file="Note"` -- read any note
   - `obsidian property:set name="status" value="done" file="Note"` -- update frontmatter
   - `obsidian backlinks file="Note"` -- graph queries
   - `obsidian daily:append content="- [ ] Task"` -- daily note automation

---

## What's NOT Relevant

- **Headless Sync feature:** Requires Obsidian Sync subscription. Not applicable unless we adopt Obsidian Sync as the sync mechanism (we likely won't -- git-based sync is more aligned with our architecture).
- **TUI mode:** Terminal UI with GUI-like operation. Interesting but not useful for agent workflows -- agents need JSON output, not interactive TUIs.
- **Pre-CLI MCP servers (mcp-obsidian, obsidian-claude-code-mcp):** These are now legacy approaches. The CLI supersedes them for same-machine usage. Only relevant as fallback when Obsidian isn't running or for remote vault access.
- **Claudian / Agent Client plugins (embedding Claude Code inside Obsidian):** Inverts the agent-first model. We want agents to control tools, not be embedded inside them.

---

## Future Use Cases

- **Phase 1 (Days 1-3):** Install `kepano/obsidian-skills` into any Obsidian vault used for project knowledge. Add CLI instructions to vault's `CLAUDE.md`. Immediate productivity gain for knowledge retrieval during agent sessions.
- **Phase 2 (Days 4-60):** Build orchestrator skills that wrap Obsidian CLI for knowledge base queries. Agent can search vault for context before executing tasks. Use `obsidian search format=json` for structured retrieval.
- **Phase 3 (Days 60-90):** Integrate Obsidian vault as a persistent knowledge layer in the orchestrator. Agents write research findings, session logs, and decision records directly to Obsidian via CLI. Property-based metadata enables structured queries.
- **Phase 4 (Days 90+):** Evaluate Obsidian as the primary knowledge management layer for multi-agent systems. Backlinks and graph queries could power agent memory and cross-reference systems. The `eval` command enables custom automation via Obsidian's full JS API.

---

## Sources

- [Obsidian CLI Official Page](https://obsidian.md/cli)
- [Obsidian CLI Help Documentation](https://obsidian.md/help/cli)
- [Obsidian 1.12 Changelog](https://obsidian.md/changelog/2026-02-27-desktop-v1.12.4/)
- [kepano/obsidian-skills on GitHub](https://github.com/kepano/obsidian-skills)
- [obsidian-cli SKILL.md](https://github.com/kepano/obsidian-skills/blob/main/skills/obsidian-cli/SKILL.md)
- [iansinnott/obsidian-claude-code-mcp on GitHub](https://github.com/iansinnott/obsidian-claude-code-mcp)
- [MarkusPfundstein/mcp-obsidian on GitHub](https://github.com/MarkusPfundstein/mcp-obsidian)
- [Obsidian's Official CLI Is Here -- DEV Community](https://dev.to/shimo4228/obsidians-official-cli-is-here-no-more-hacking-your-vault-from-the-back-door-3123)
- [Obsidian + Claude Code: Complete Integration Guide (starmorph.com)](https://blog.starmorph.com/blog/obsidian-claude-code-integration-guide)
- [3 Ways to Use Obsidian with Claude Code (Awesome Claude)](https://awesomeclaude.ai/how-to/use-obsidian-with-claude)
- [My Obsidian Evolved Again -- Obsidian CLI + Claude Code (Substack)](https://constructbydee.substack.com/p/my-obsidian-evolved-again-obsidian)
- [pablo-mano/Obsidian-CLI-skill on GitHub](https://github.com/pablo-mano/Obsidian-CLI-skill)

---

## Key Takeaway

> **The Obsidian CLI (1.12+) eliminates the need for MCP servers or plugins to connect Obsidian to Claude Code -- 100+ commands via Bash with JSON output, wikilink-safe operations, and an official skills package (kepano/obsidian-skills) that teaches agents the full syntax out of the box.**
