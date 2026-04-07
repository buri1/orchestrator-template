# Claude Plugins Official

> **Anthropic's official curated directory of Claude Code plugins — includes Discord and Telegram channel plugins that enable controlling Claude Code sessions from messaging platforms via MCP servers.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) |
| GitHub Stars | 13,700 (as of 2026-03-21) |
| Publisher | Anthropic (official) |
| License | Per-plugin (see individual LICENSE files) |
| Tech Stack | TypeScript, Python, Bun, MCP (Model Context Protocol), Shell |
| Maturity | 🟢 Production (180+ commits, 32 internal + 15 external plugins) |
| Last Analyzed | 2026-03-21 |

---

## Burak's Notes

> *This is THE official Anthropic plugin directory for Claude Code. The Discord and Telegram plugins are the high-relevance items here — they expose MCP servers that bridge messaging platforms to Claude Code sessions. This directly enables our remote orchestration use case: control agents from your phone via Discord/Telegram DMs. The `--channels` flag + pairing flow is clean. Discord gives you `reply`, `react`, `edit_message`, `fetch_messages`, `download_attachment` — full bidirectional control. Telegram is slightly more limited (no `fetch_messages`, no historical attachment downloads — bot API limitation). Both use Bun runtime + TypeScript MCP servers. The plugin system itself (`/plugin install`, plugin.json, .mcp.json, commands/, agents/, skills/) is the official extensibility model for Claude Code — understanding this is table stakes. The 32 internal plugins include 12 LSP integrations, code review tools, PR review toolkit, and a skill-creator. External plugins include Slack, GitHub, GitLab, Linear, Firebase, Supabase, Playwright — basically the integration ecosystem. For our orchestration, the Discord plugin is the immediate win: spawn agent, monitor from Discord, get notifications on completion, send commands mid-task. The pairing + allowlist access control means we can lock it down to just our user.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Discord/Telegram plugins enable remote agent monitoring and control — critical for autonomous overnight operations. The plugin system itself is the official Claude Code extensibility model. |
| **Novelty** | 6/10 | Channel plugins (MCP bridge to messaging platforms) are a clean pattern. Plugin directory structure (plugin.json + .mcp.json + commands/ + agents/ + skills/) codifies Claude Code's extension model. |
| **Actionable** | 8/10 | Install Discord plugin today for remote agent monitoring. Telegram plugin as secondary channel. Study plugin.json schema for building custom plugins. |

---

## Overview

claude-plugins-official is Anthropic's curated marketplace for Claude Code plugins. It contains 32 internal plugins (maintained by Anthropic) and 15 external plugins (from partners and community). Plugins extend Claude Code with slash commands, MCP servers, agent definitions, and skill definitions.

The two plugins most relevant to our orchestration work are the **Discord** and **Telegram** channel plugins, which bridge messaging platforms to Claude Code sessions via MCP servers.

### Plugin System Architecture

Each plugin follows a standardized structure:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata (REQUIRED)
├── .mcp.json                # MCP server configuration (OPTIONAL)
├── commands/                # Slash commands (OPTIONAL)
├── agents/                  # Agent definitions (OPTIONAL)
├── skills/                  # Skill definitions (OPTIONAL)
└── README.md
```

**Installation:** `/plugin install {name}@claude-plugins-official` or via GUI discovery.

### Notable Internal Plugins (32 total)

- **12 LSP integrations**: TypeScript, Python (Pyright), Rust (rust-analyzer), Go (gopls), C# (OmniSharp), Java (jdtls), Kotlin, Ruby, PHP, Lua, Swift, C/C++ (clangd)
- **code-review** / **pr-review-toolkit**: Code and PR review assistance
- **skill-creator**: Tool for authoring new skills
- **plugin-dev** / **mcp-server-dev**: Plugin and MCP server development tools
- **agent-sdk-dev**: Agent SDK development tools
- **hookify**: Hook management utilities
- **security-guidance**: Security best practices

### Notable External Plugins (15 total)

- **discord** / **telegram** / **slack**: Messaging platform integrations (channel plugins)
- **github** / **gitlab** / **linear**: Issue tracker integrations
- **firebase** / **supabase**: Backend integrations
- **playwright**: Browser automation
- **greptile**: Code search/analysis
- **context7**: Context management (Upstash)

---

## Discord Plugin — Deep Dive

The Discord plugin connects a Discord bot to Claude Code via an MCP server, enabling bidirectional messaging.

### Setup Flow

1. Create Discord Application + Bot in Developer Portal
2. Enable **Message Content Intent**
3. Invite bot to server with permissions (View Channels, Send Messages, Read History, Attach Files, Add Reactions)
4. `/plugin install discord@claude-plugins-official`
5. `/discord:configure <bot-token>` (writes to `~/.claude/channels/discord/.env`)
6. `claude --channels plugin:discord@claude-plugins-official`
7. DM bot on Discord → receive pairing code → `/discord:access pair <code>`
8. `/discord:access policy allowlist` (lock down)

### MCP Tools Exposed

| Tool | Purpose |
|------|---------|
| `reply` | Send to channel. `chat_id` + `text`, optional `reply_to` for threading, `files` for attachments (max 10, 25MB each). Auto-chunks long messages. Returns message ID(s). |
| `react` | Add emoji reaction (Unicode or custom `<:name:id>`). |
| `edit_message` | Edit bot's own messages (progress updates). |
| `fetch_messages` | Pull recent channel history (up to 100, oldest-first). Each line includes message ID for `reply_to`. |
| `download_attachment` | Download attachments from message by ID to `~/.claude/channels/discord/inbox/`. |

### Key Behaviors

- Automatic typing indicator while processing
- Attachments NOT auto-downloaded (explicit `download_attachment` call required)
- Access control: DM policies (pairing/allowlist/blocklist) + guild channel opt-in per channel ID
- Multi-instance support via `DISCORD_STATE_DIR` env var
- IDs are Discord snowflakes (numeric)

---

## Telegram Plugin — Deep Dive

The Telegram plugin connects a Telegram bot to Claude Code via an MCP server.

### Setup Flow

1. Chat with @BotFather → `/newbot` → receive token
2. `/plugin install telegram@claude-plugins-official`
3. `/telegram:configure <token>` (writes to `~/.claude/channels/telegram/.env`)
4. `claude --channels plugin:telegram@claude-plugins-official`
5. DM bot → receive 6-char pairing code → `/telegram:access pair <code>`
6. `/telegram:access policy allowlist`

### MCP Tools Exposed

| Tool | Purpose |
|------|---------|
| `reply` | Send messages. Images render as photos, others as documents. Max 50MB each. Auto-chunks. |
| `react` | Add emoji reaction (Telegram's fixed whitelist only). |
| `edit_message` | Edit bot's own messages. |

### Limitations vs Discord

- **No `fetch_messages`**: Bot API doesn't expose message history
- **No `download_attachment`**: Photos eagerly downloaded on arrival to `~/.claude/channels/telegram/inbox/`
- **No historical attachment access**: Bot only sees messages as they arrive
- Telegram compresses photos (use "Send as File" for originals)

---

## Technical Architecture

```
┌─────────────────────────────────────────┐
│             Discord / Telegram          │
│           (Messaging Platform)          │
└───────────────┬─────────────────────────┘
                │ WebSocket / Bot API
┌───────────────▼─────────────────────────┐
│           server.ts (Bun runtime)       │
│         MCP Server Implementation       │
│                                         │
│  - Bot event handling                   │
│  - Tool definitions (reply/react/edit)  │
│  - Message forwarding to Claude         │
│  - State mgmt (pairings/access)         │
│  - Access control (pairing/allowlist)   │
└───────────────┬─────────────────────────┘
                │ MCP Protocol
┌───────────────▼─────────────────────────┐
│          Claude Code Session            │
│    (launched with --channels flag)      │
│                                         │
│  Inbound messages → channel events      │
│  Tools available → reply/react/edit     │
│  Skills → /discord:configure, etc.      │
└─────────────────────────────────────────┘
```

**State storage:** `~/.claude/channels/{discord,telegram}/`
- `.env` — bot token
- `access.json` — pairing and allowlist state
- `inbox/` — downloaded attachments

---

## What's Valuable for Us

1. **Remote agent monitoring via Discord** — Spawn orchestrator agents overnight, monitor and control them from Discord on your phone. The `reply` + `fetch_messages` tools give full bidirectional communication. This solves the "is my agent stuck?" problem without needing to SSH into the machine.

2. **Notification channel for agent completions** — When an agent finishes a task or hits a roadblock, it can `reply` to a Discord channel. Combined with our orchestrator's devlog, this creates a real-time feed of agent activity.

3. **Mid-task intervention** — Send commands to a running Claude Code session via Discord DM. The agent receives the message as a channel event and can act on it. This enables "FULL AUTO MODE" with an escape hatch.

4. **Plugin system as extensibility model** — The plugin.json + .mcp.json + commands/ + skills/ structure is the canonical Claude Code extension format. Understanding this is prerequisite for building any custom orchestration plugins.

5. **Multi-instance pattern** — `DISCORD_STATE_DIR` / `TELEGRAM_STATE_DIR` env vars enable running multiple bot instances. One bot per orchestrator session, each with its own state directory.

6. **Access control model** — The pairing → allowlist flow is a clean pattern for securing bot access. Reusable for any messaging bridge we build.

---

## What's NOT Relevant

- **LSP plugins**: We don't need language server integrations — agents handle their own tooling.
- **Slack plugin**: We use Discord/Telegram, not Slack.
- **Most external plugins**: GitHub/GitLab/Linear/Supabase/Firebase integrations are useful but not novel — these are standard MCP server wrappers.
- **Plugin marketplace governance**: The submission form and approval process are irrelevant to us as consumers.

---

## Orchestration Use Cases

### Immediate (Phase 1)

1. **Install Discord plugin** on orchestrator machine
2. Configure dedicated Discord server with channels: `#agent-status`, `#agent-errors`, `#commands`
3. Each orchestrator run launches Claude Code with `--channels plugin:discord@claude-plugins-official`
4. Agent posts status updates to `#agent-status`, errors to `#agent-errors`
5. Human sends commands to agent via DM (pause, skip, focus on specific issue)

### Near-term (Phase 2)

1. **Multi-agent Discord server**: Each agent gets its own channel, orchestrator posts summary to `#overview`
2. **Telegram as mobile fallback**: Secondary channel for critical alerts (agent crash, PR merge failures)
3. **Custom plugin**: Build an orchestrator-specific plugin that exposes tmux session management as MCP tools

### Future (Phase 3+)

1. **Client-facing Discord channels**: Per-client Discord servers where agents post progress updates
2. **Voice channel integration**: Agent posts audio summaries of completed work
3. **Webhook-triggered agent spawning**: Discord slash commands that trigger orchestrator to spawn new agents

---

## Key Takeaway

> **claude-plugins-official is Anthropic's official extension ecosystem for Claude Code. The Discord and Telegram channel plugins are immediately actionable — they enable remote monitoring and control of agent sessions from messaging platforms via MCP servers. Install the Discord plugin today for overnight agent monitoring. The plugin system structure (plugin.json + .mcp.json + commands/ + skills/) is the canonical Claude Code extensibility model.**
