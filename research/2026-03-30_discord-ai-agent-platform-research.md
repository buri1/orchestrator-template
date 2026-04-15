# Discord as AI Agent Communication & Control Platform

**Date**: 2026-03-30
**Purpose**: Comprehensive research on using Discord as a hub for multiple AI agents

---

## Executive Summary

Discord has emerged as one of the most viable platforms for AI agent control in 2026, with both **official Anthropic support** (Claude Code Channels) and a rich ecosystem of community tools. The key revelation: **Anthropic shipped Claude Code Channels on March 20, 2026** -- a first-party Discord integration that connects Claude Code sessions to Discord via MCP servers. Combined with community projects like Disclaude and claudecode-discord, you can build a full multi-agent Discord server where each agent has its own channel, all controllable from your phone.

---

## 1. Official: Claude Code Channels (Anthropic First-Party)

### What It Is

Shipped March 20, 2026 as a research preview. Channels are **MCP servers that push events into a running Claude Code session** so Claude can react to things happening while you're not at the terminal.

### How It Works

1. Install the Discord channel plugin (runs as MCP server)
2. Launch Claude Code with `--channels` flag
3. MCP server connects to Discord via WebSocket
4. Messages arrive as `<channel>` events pushed into Claude Code session
5. Claude processes using full local environment (files, tools, git)
6. Claude replies through MCP tools: `reply`, `react`, `edit_message`

### Setup

```bash
# Requires Claude Code v2.1.80+ and Bun runtime
claude channels setup --platform discord
# Paste your bot token from Discord Developer Portal
# Use the generated invite link to add bot to your server
# Start session:
claude --channels plugin:discord@claude-plugins-official
```

### Key Details

- **Bun required**: The plugins are Bun scripts, not Node.js
- `--channels` flag required every session (not auto-activated from .mcp.json)
- Supports slash commands: `/claude-run`, `/claude-status`, `/claude-diff`
- Session must stay running -- close terminal = channel goes offline
- Discord queues messages via `fetch_messages` when bot comes back online
- **Multiple instances**: Set `DISCORD_STATE_DIR` to different directories per instance to run multiple bots on one machine
- Allowlist-based security, pairing-code auth, no inbound ports exposed

### Limitations

- No way to respond to permission prompts from Discord (if Claude hits a permission gate, it stops)
- Session-bound: must keep a terminal/process running
- Research preview: `--channels` flag syntax may change

### Source

Official docs: https://code.claude.com/docs/en/channels
Plugin repo: https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord

---

## 2. Best Discord Bot Frameworks for AI Agent Control

### Tier 1: Purpose-Built for Claude Code + Discord

| Project | Stars | Description | URL |
|---------|-------|-------------|-----|
| **Disclaude** | -- | Manages Claude Code sessions via tmux. Each session gets its own Discord channel. Sessions survive disconnects. | https://disclaude.com / https://github.com/disclaude/app |
| **claudecode-discord** (chadingTV) | -- | Multi-machine agent hub. No API key needed (runs on Claude Pro/Max). Start sessions from mobile, manage multiple machines. | https://github.com/chadingTV/claudecode-discord |
| **claude-code-discord** (zebbern) | 160 | Full SDK integration. Chat, shell/git, branch management from Discord. Works on local, VM, or Docker. | https://github.com/zebbern/claude-code-discord |
| **claude-code-discord-bot** (timoconnellaus) | 69 | Interact with Claude Code on personal projects via Discord. | https://github.com/timoconnellaus/claude-code-discord-bot |
| **claude-code-discord-bridge** (ebibibi) | -- | Discord threads with concurrency notices. Active session registry so sessions know about each other. Coordinate on same repo. | https://github.com/ebibibi/claude-code-discord-bridge |
| **codecast** (Chivier) | 6 | Bot-based system for interacting with Claude CLI on remote machines via Discord, Telegram, and Lark. | https://github.com/Chivier/codecast |
| **discord-agent-bridge** (DoBuDevel) | -- | Bridge AI agent CLIs (Claude Code, OpenCode) to Discord via tmux. Remote control of long-running AI tasks. | https://github.com/DoBuDevel/discord-agent-bridge |

### Tier 2: General AI Bot Frameworks with Discord Support

| Project | Stars | Description |
|---------|-------|-------------|
| **LangBot** | 15,700+ | Production-grade multi-platform IM bot platform. Discord, Slack, Telegram, LINE, QQ, WeChat. Plugin system, agent support, MCP protocol. Claude integration included. |
| **kirara-ai** | 18,600+ | Multi-modal AI chatbot. Supports Discord, WeChat, QQ, Telegram. Claude, DeepSeek, Grok, Gemini, OpenAI, Ollama. |
| **oh-my-claudecode** | -- | Teams-first multi-agent orchestration for Claude Code. 32 specialized agents, 40+ skills. Discord/Slack/Telegram webhook notifications. |

### Tier 3: MCP-Based Discord Integration

| Project | Description |
|---------|-------------|
| **Composio Discord MCP** | Pre-built MCP integration connecting Claude Code to Discord bot operations |
| **discord-mcp** (v-3) | Discord MCP Server for Claude integration -- full channel/server management |
| **discord-mcp** (SaseQ) | MCP server enabling AI assistants to interact with Discord programmatically |
| **n8n Claude + Discord** | No-code workflow automation connecting Claude and Discord |

---

## 3. The "5 Agents, 5 Channels, 1 Vault" Pattern

The most directly relevant pattern to your use case comes from **Artem Zhutov (artemxtech)**:

### Architecture

- **5 specialized agents**, each with their own Discord channel
- **1 Obsidian vault** as shared knowledge base (synced via Obsidian Sync)
- One Discord bot token, but an upgraded plugin filters messages per channel
- Each channel routes to its own Claude Code session

### The 5 Agents

1. **Research** -- literature and web research
2. **Therapy** -- personal reflection/coaching
3. **Daily Review** -- end-of-day synthesis
4. **Source Monitor** -- watches for new information
5. **Orchestrator** -- coordinates the others

### Key Features

- Each agent gets a **persona file** defining behavior, focus, and tools
- `/loop` skill enables periodic execution at intervals (scheduled tasks)
- Vault synced between MacBook and Android phone
- Can generate diagrams, read project files, etc. from phone
- Discord server = control center for your entire agent team

### Source

https://artemxtech.substack.com/p/5-claude-agents-5-discord-channels

---

## 4. Discord as "Company Communication Platform" for AI Agents

### Real-World Multi-Agent Discord Setups

**OpenClaw Multi-Agent Pattern** (documented at brainroad.com):
- Discord's multi-channel structure turns a single AI assistant into a team
- Typical setup:
  - **#coordinator** -- routes work between agents
  - **#research** -- pulls trending data every 2 hours
  - **#content** -- writes scripts from research output
  - **#coding** -- builds tools on demand
  - **#analytics** -- tracks performance
  - **#monitoring** -- watches everything
- All running inside one Discord server, handing work off on a schedule

**Northeastern Research Study** ("Agents of Chaos"):
- Researchers deployed 6 autonomous AI agents in a live Discord server
- Agents could communicate with each other and researchers
- Had access to email accounts and file systems
- Could install new tools and modify their own files
- Finding: agents can be manipulated into leaking private info, erasing email servers
- Important cautionary data for security planning

**yamakei Multi-Project Gateway**:
- Replaced SSH + tmux pane-juggling with Discord
- One Discord bot, multiple channels, each mapped to a project directory
- Message routing: channel ID -> project configuration
- Accessible from phone, laptop, anywhere Discord runs

### The "AI Company Discord" Template

Based on the research, a full AI company Discord would look like:

```
DISCORD SERVER: "My AI Company"

-- CATEGORY: ORCHESTRATION --
#orchestrator          (master orchestrator agent)
#task-queue            (incoming work items)
#status-dashboard      (agent status: green/yellow/red)

-- CATEGORY: DEVELOPMENT --
#frontend-agent        (UI/React work)
#backend-agent         (API/server work)
#devops-agent          (CI/CD, deployment)

-- CATEGORY: BUSINESS --
#research-agent        (market research, competitor analysis)
#content-agent         (blog posts, social media)
#lead-gen-agent        (outreach, prospecting)

-- CATEGORY: OPERATIONS --
#finance-agent         (invoicing, tracking)
#admin-agent           (scheduling, email)

-- CATEGORY: HUMAN --
#control-room          (your command channel)
#alerts                (agent notifications)
#review-queue          (items needing human approval)
```

---

## 5. Open-Source Discord-Claude Integrations

### Most Relevant to Your Setup

1. **Disclaude** (https://disclaude.com)
   - TypeScript, manages sessions via tmux
   - Each session = own Discord channel
   - Sessions survive disconnects and bot restarts
   - `tmux attach` for terminal access anytime
   - User whitelist security
   - No commands needed -- messages go straight to Claude, responses stream with ANSI colors
   - **Best match for your tmux-based orchestrator architecture**

2. **chadingTV/claudecode-discord**
   - Multi-machine hub
   - Runs on Claude Pro/Max subscription (no API key needed)
   - Status indicators per channel: working / waiting / idle / offline
   - Outbound WebSocket only (no inbound attack surface)
   - One channel = one Claude Code workspace with independent conversation history

3. **Official Anthropic Plugins** (https://github.com/anthropics/claude-plugins-official)
   - First-party Discord plugin
   - MCP server architecture
   - Supports multiple instances via `DISCORD_STATE_DIR`
   - Pairing-code authentication
   - Most stable and maintained option

4. **claude-obsidian-server** (jonathanglasmeyer)
   - Mobile access to Claude Code within Obsidian vault via Discord
   - Self-hosted bot using Claude Agent SDK

5. **slashbin-discord-bot** (xrgarcia)
   - Discord bot powered by Claude Code for product owner workflows

---

## 6. Discord vs Slack vs Telegram Comparison

### For AI Agent Control

| Feature | Discord | Slack | Telegram |
|---------|---------|-------|----------|
| **Claude Code Channels** | Yes (official) | Yes (separate feature: Claude Code in Slack) | Yes (official) |
| **Free tier** | Unlimited messages, channels, members | 90-day message history, limited integrations | Unlimited |
| **Bot API richness** | Excellent (WebSocket, slash commands, reactions, threads) | Excellent (Workflow Builder, interactive messages) | Good (polling or webhooks) |
| **Message limit** | 2,000 chars | 40,000 chars | 4,096 chars |
| **Voice channels** | Built-in | Huddles (limited) | Voice chats |
| **Max integrations** | 50 per server | 2,600+ | Unlimited bots |
| **Enterprise integrations** | Weak (no native GitHub, Jira, Figma) | Strong (native everything) | Weak |
| **Always-on/daemon** | WebSocket-based (low latency) | WebSocket-based | Polling-based |
| **Multi-agent channels** | Excellent (unlimited free channels) | Good (but hits paid tier fast) | Good (groups/channels) |
| **Mobile control** | Excellent native app | Excellent native app | Excellent native app |
| **Cost for team use** | Free / $9.99 Nitro | $8.75/user/month | Free |
| **Privacy/self-host** | No self-hosting | Enterprise only | Bot API only |

### Verdict for Your Use Case

**Discord wins for multi-agent orchestration because:**
- Unlimited free channels = one per agent, no cost scaling
- WebSocket-based = low latency real-time communication
- Rich bot API with slash commands, reactions, threads
- Official Claude Code Channels support
- Strong community ecosystem (Disclaude, claudecode-discord, etc.)
- Channel categories for organizing agent groups
- Status indicators via channel names/topics
- Voice channels for future voice-agent experiments

**Slack wins if:**
- You need enterprise integrations (GitHub, Jira, Figma natively)
- Workflow Builder matters (no-code automation)
- Team/client-facing communication (professional perception)
- 40K char message limit matters for long outputs

**Telegram wins if:**
- You want the simplest setup (polling, fewer moving parts)
- You're a solo operator (DM-based, no server needed)
- You want iMessage-like simplicity

---

## 7. Triggering Claude Code Remotely via Discord

### Method 1: Official Claude Code Channels

```bash
# On your machine (must stay running):
claude --channels plugin:discord@claude-plugins-official
```
Then message the bot in Discord from anywhere. Claude processes using your local environment.

### Method 2: Disclaude (tmux-based)

```bash
# Clone and configure disclaude
# Sessions run in tmux, survive disconnects
# Messages go straight to Claude, responses stream back
# tmux attach for terminal access anytime
```

### Method 3: chadingTV/claudecode-discord (daemon-based)

```bash
# Runs as a daemon process
# Creates Claude Code sessions per Discord channel
# Maps channels to project directories
# Status indicators per session
```

### Method 4: --dangerously-skip-permissions + Discord Bot

For fully autonomous operation:
```bash
# In the bot's session spawner:
unset CLAUDECODE && claude --dangerously-skip-permissions
```
**Warning**: Only in sandboxed/containerized environments. Anyone who can message your bot controls your machine.

### Method 5: Claude Agent SDK + Custom Bot

Build a custom Discord bot using the Claude Agent SDK for maximum control over session lifecycle, tool permissions, and multi-agent coordination.

---

## 8. Recommended Architecture for Your Orchestrator

Given your existing tmux-based orchestrator architecture, here is the recommended Discord integration path:

### Phase 1: Quick Win (1-2 hours)

Use **Claude Code Channels** (official) to get basic Discord control:

```bash
# Install Bun if not present
curl -fsSL https://bun.sh/install | bash

# Setup Discord channel
claude channels setup --platform discord

# Run with channels enabled
claude --channels plugin:discord@claude-plugins-official
```

### Phase 2: Multi-Agent Hub (half day)

Deploy **Disclaude** or **chadingTV/claudecode-discord** for per-agent channels:

```
Server: "Burak's Agent Hub"
├── #orchestrator     (main orchestrator session)
├── #worker-1         (spawned by orchestrator)
├── #worker-2         (spawned by orchestrator)
├── #worker-3         (spawned by orchestrator)
├── #alerts           (webhook notifications)
├── #devlog           (auto-posted summaries)
└── #control-room     (your commands)
```

Each channel maps to a tmux session + project directory. The Discord bot manages session lifecycle.

### Phase 3: Full Autonomous Company (weekend project)

Combine with your existing orchestrator:
- Orchestrator agent gets `#orchestrator` channel
- When it spawns tmux workers, it also creates Discord channels
- Workers report status via their channels
- You monitor/control everything from Discord mobile
- `oh-my-claudecode` for advanced orchestration metrics
- Webhook to `#alerts` for roadblocks, completions, PR merges

### Integration with Existing tmux Architecture

Your current flow:
```
tmux session -> tmux windows -> claude --dangerously-skip-permissions
```

Enhanced flow:
```
Discord channel -> Discord bot -> tmux session -> claude --channels
                                                  OR
Discord channel -> Disclaude -> tmux session -> claude (with Discord bridge)
```

The key advantage: **you can monitor and control all agents from your phone** while they run on your machine.

---

## Key Takeaways

1. **Claude Code Channels is the game-changer** -- official Anthropic support shipped March 20, 2026. This is not a hack; it is a supported feature.

2. **Disclaude is the best community match** for your tmux-based architecture -- it literally manages Claude Code sessions via tmux with Discord channels.

3. **The "5 agents, 5 channels" pattern** from artemxtech is proven and directly applicable to your multi-agent orchestrator.

4. **Discord beats Slack for this use case** due to unlimited free channels, WebSocket-based real-time communication, and the strongest Claude Code integration ecosystem.

5. **Security matters**: Use allowlists, pairing codes, and consider containerized environments for `--dangerously-skip-permissions` sessions.

6. **The ecosystem is exploding** -- 15+ dedicated Discord-Claude projects on GitHub, most updated in the last 2 weeks of March 2026.

---

## All Sources

### Official
- [Claude Code Channels Docs](https://code.claude.com/docs/en/channels)
- [Channels Reference](https://code.claude.com/docs/en/channels-reference)
- [Official Discord Plugin](https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord)
- [Claude Code in Slack](https://code.claude.com/docs/en/slack)

### Community Projects
- [Disclaude](https://disclaude.com/) / [GitHub](https://github.com/disclaude/app)
- [claudecode-discord (chadingTV)](https://github.com/chadingTV/claudecode-discord)
- [claude-code-discord (zebbern)](https://github.com/zebbern/claude-code-discord)
- [claude-code-discord-bot (timoconnellaus)](https://github.com/timoconnellaus/claude-code-discord-bot)
- [claude-code-discord-bridge (ebibibi)](https://github.com/ebibibi/claude-code-discord-bridge)
- [discord-agent-bridge (DoBuDevel)](https://github.com/DoBuDevel/discord-agent-bridge)
- [codecast (Chivier)](https://github.com/Chivier/codecast)
- [claude-obsidian-server](https://github.com/jonathanglasmeyer/claude-obsidian-server)
- [slashbin-discord-bot](https://github.com/xrgarcia/slashbin-discord-bot)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
- [LangBot](https://github.com/langbot-app/LangBot)
- [kirara-ai](https://github.com/lss233/kirara-ai)

### Articles & Guides
- [5 Claude Agents, 5 Discord Channels, 1 Obsidian Vault (artemxtech)](https://artemxtech.substack.com/p/5-claude-agents-5-discord-channels)
- [From tmux to Discord: Multi-Project Gateway (yamakei)](https://yamakei.info/essays/from-tmux-to-discord-building-a-multi-project-gateway-for-claude-code)
- [Claude Code Channels Setup Guide (DEV Community)](https://dev.to/ayyazzafar/claude-code-channels-control-your-ai-agent-from-discord-complete-setup-guide-4kd8)
- [Claude Code Channels Setup (DataCamp)](https://www.datacamp.com/tutorial/claude-code-channels)
- [Claude Code Channels vs OpenClaw (DEV Community)](https://dev.to/ji_ai/claude-code-channels-vs-openclaw-the-tradeoffs-nobodys-talking-about-2h5h)
- [Hands-On Claude Code Channels (MacStories)](https://www.macstories.net/stories/first-look-hands-on-with-claude-codes-new-telegram-and-discord-integrations/)
- [VentureBeat: Anthropic Ships OpenClaw Killer](https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels)
- [OpenClaw Multi-Agent Setup Guide](https://brainroad.com/how-to-set-up-a-multi-agent-team-using-openclaw-in-discord/)
- [Researchers: 6 AI Agents on Discord (Northeastern)](https://news.northeastern.edu/2026/03/09/autonomous-ai-agents-of-chaos/)
- [Slack vs Discord for AI (getclaw)](https://getclaw.sh/blog/telegram-slack-discord-ai-bot-comparison)
- [Discord vs Slack Comparison (Lovable)](https://lovable.dev/guides/slack-vs-discord-comparison)
