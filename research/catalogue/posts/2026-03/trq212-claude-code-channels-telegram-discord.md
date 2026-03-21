# Claude Code Channels: Control Claude Code from Telegram and Discord via MCP

> **@trq212 — 2026-03-19**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/trq212/status/2034761016320696565) |
| Author | @trq212 — Thariq, Claude Code engineer at Anthropic (prev YC W20, MIT Media Lab) |
| Date | 2026-03-19 |
| Topics | Claude Code channels, MCP, Telegram, Discord, mobile agent control, remote orchestration, plugin architecture |
| Type | Product announcement (X post + demo video) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Push events into a running session, not a new one** — Channels are MCP servers that push events into your *already-running* local Claude Code session. Unlike Claude Code on the web (fresh cloud sandbox) or Remote Control (you drive from claude.ai), channels let external systems and chat platforms inject messages into your active terminal session where Claude already has your files and conversation context.

2. **Telegram + Discord as first-class chat bridges** — Send a message from your phone via Telegram or Discord bot, and Claude Code processes it against your real local files, then replies back in the same chat. Telegram uses long-polling, Discord uses WebSocket. Both require a pairing flow (bot sends code, you approve in terminal) + sender allowlist for security.

3. **Built on MCP plugin architecture — community-extensible** — Channels are installed as plugins from `anthropics/claude-plugins-official`. The architecture is open: because it's MCP, the community can build connectors for Slack, WhatsApp, webhooks, CI pipelines, error trackers, or any event source. Custom channels can be tested with `--dangerously-load-development-channels`.

4. **Webhook receiver pattern unlocks autonomous agent loops** — Beyond chat, channels can receive webhooks from CI, deploy pipelines, error trackers, and monitoring — Claude reacts in-session with full file context. This is the missing piece for truly autonomous agent loops: external events trigger agent work without human intervention.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is a MAJOR capability for our orchestration architecture. Channels solve the "remote agent control" problem — control agents from mobile while they run on your machine. The webhook receiver pattern is directly applicable to our autonomous orchestrator loop (CI results triggering next steps). The MCP plugin architecture means we can build custom channels for our specific workflows. Combined with `--dangerously-skip-permissions` and persistent terminal sessions, this enables true 24/7 autonomous agent operation with mobile oversight. |

---

## Full Content

**Title:** Claude Code Channels announcement

**Engagement:** 1,586 replies, 2,271 reposts, 24,868 likes, 17,662 bookmarks, 6.79M views

> "We just released Claude Code channels, which allows you to control your Claude Code session through select MCPs, starting with Telegram and Discord. Use this to message Claude Code directly from your phone."

The post includes a 17-second demo video showing the channel in action.

### Architecture

- **Channel = MCP server** that pushes `<channel source="...">` events into a running Claude Code session
- **Two-way**: Claude reads the event and replies back through the same channel (reply appears on the external platform, not in terminal)
- **Session-bound**: events only arrive while the session is open — for always-on, run Claude in a background process or persistent terminal (tmux)
- **Plugin system**: install via `/plugin install telegram@claude-plugins-official`, configure credentials, restart with `--channels` flag

### Setup Flow (Telegram)

1. Create bot via BotFather, get token
2. `/plugin install telegram@claude-plugins-official`
3. `/telegram:configure <token>`
4. Restart: `claude --channels plugin:telegram@claude-plugins-official`
5. Pair: send message to bot, get code, run `/telegram:access pair <code>`
6. Lock down: `/telegram:access policy allowlist`

### Setup Flow (Discord)

1. Create bot in Discord Developer Portal, enable Message Content Intent
2. Invite bot with View Channels, Send Messages, Read Message History, Attach Files, Add Reactions
3. `/plugin install discord@claude-plugins-official`
4. `/discord:configure <token>`
5. Restart: `claude --channels plugin:discord@claude-plugins-official`
6. Pair via DM + allowlist

### Security Model

- Sender allowlist per channel (only paired IDs can push messages)
- Being in `.mcp.json` is NOT enough — server must also be named in `--channels` flag
- Enterprise/Team plans: disabled by default, admin must enable `channelsEnabled` in managed settings

### Research Preview Limitations

- Requires Claude Code v2.1.80+
- Requires claude.ai login (no Console/API key auth)
- `--channels` only accepts plugins from Anthropic-maintained allowlist during preview
- Flag syntax and protocol contract may change

### How Channels Compare

| Feature | What it does | Good for |
|---------|-------------|----------|
| Claude Code on the web | Fresh cloud sandbox, cloned from GitHub | Delegating self-contained async work |
| Claude in Slack | Spawns web session from @Claude mention | Starting tasks from team conversation |
| Standard MCP server | Claude queries it during a task (pull) | On-demand read/query access |
| Remote Control | Drive local session from claude.ai/mobile | Steering in-progress session remotely |
| **Channels** | **Push events from external sources into running session** | **Chat bridge, webhook receiver, CI integration** |

### Official Resources

- **Docs**: https://code.claude.com/docs/en/channels
- **Plugin repo**: https://github.com/anthropics/claude-plugins-official
- **Telegram plugin source**: https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/telegram
- **Discord plugin source**: https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/discord
- **Channels reference (build your own)**: https://code.claude.com/docs/en/channels-reference

---

## Notable Replies

> *[To be filled — the post has 1,586 replies; high-signal replies to be curated on next pass]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/anthropics/claude-plugins-official | Official Anthropic plugin repo — Telegram, Discord, fakechat channel source code | `/tool-catalogue` |
| https://code.claude.com/docs/en/channels-reference | Build-your-own-channel reference — protocol spec for custom channels | `/ingest-article` |
| https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels | VentureBeat coverage comparing channels to OpenClaw | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | The agent harness receiving channel events | Yes — [Claude Agent SDK](../../agent-harnesses/claude-agent-sdk.md) |
| claude-plugins-official | Official Anthropic plugin repo (Telegram, Discord, fakechat) | No — **INGEST** |
| Telegram Bot API | Polling-based channel transport | No — external platform |
| Discord Bot API | WebSocket-based channel transport | No — external platform |
| OpenClaw | Compared to by VentureBeat as competitor | Yes — [OpenClaw](../../orchestration-platforms/openclaw.md) |
| Bun | Required runtime for channel plugins | No — JS runtime |

---

## Cross-References (Other @trq212 Posts)

| Post | Date | Connection |
|------|------|-----------|
| [Tasks Replacing TodoWrite](../2026-01/trq212-tasks-replacing-todowrite-claude-code.md) | 2026-01-22 | Inter-agent communication evolution — channels extend this to external platforms |
| [Prompt Caching Is Everything](../2026-02/trq212-prompt-caching-is-everything.md) | 2026-02-19 | Cache architecture matters more with channels — incoming messages must not bust prompt cache |
| [Lessons from Building Claude Code](../2026-02/trq212-lessons-building-claude-code-seeing-like-agent.md) | 2026-02-27 | Tool design philosophy — channels add capability without adding tools (progressive disclosure pattern) |
