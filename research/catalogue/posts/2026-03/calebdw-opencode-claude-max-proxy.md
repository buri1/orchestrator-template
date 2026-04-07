# opencode-claude-max-proxy — Use Claude Max Subscription with OpenCode

> **@calebdw — 2026-03-19**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/calebdw/status/2034751230975651988) |
| Author | @calebdw (Caleb White) — Developer, Texas |
| Date | 2026-03-19 |
| Topics | Claude Max, OpenCode, proxy, subscription arbitrage, Agent SDK, multi-model routing |
| Type | Single post (reply to @thdxr) |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Claude Max subscription proxy for OpenCode** — The `opencode-claude-max-proxy` project (314 stars, MIT) creates a transparent proxy that bridges Anthropic's Agent SDK with OpenCode, allowing developers to use their Claude Max $200/mo subscription instead of API credits. This is the same arbitrage strategy we rely on (18-36x cost advantage over API pricing).
2. **PreToolUse hook + maxTurns:1 interception pattern** — The proxy leverages the Agent SDK's `PreToolUse` hook with `maxTurns: 1` to intercept tool execution at a precise boundary. Claude generates tool-use blocks, the hook captures and blocks SDK-internal execution, then forwards the payload to OpenCode. This architecture keeps execution distributed across different agents/models.
3. **Multi-model routing preserved** — Unlike running everything through Claude directly, the proxy preserves OpenCode's ability to route different tasks to different AI models. The passthrough mode (recommended) forwards all tool execution to OpenCode, while internal mode uses MCP tools with SDK-managed agents.
4. **Per-terminal isolation** — Each terminal gets its own isolated proxy instance with session resume tracking across multiple requests. Configuration via environment variables (`CLAUDE_PROXY_PASSTHROUGH`, `CLAUDE_PROXY_PORT`, `CLAUDE_PROXY_HOST`, `CLAUDE_PROXY_WORKDIR`).

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly validates our Claude Max arbitrage strategy ($200/mo = 18-36x vs API). The PreToolUse hook interception pattern is a reusable technique for building proxies around Claude Max. However, we use Claude Code natively (not OpenCode), so the specific tool isn't immediately deployable. The hook-based architecture could be adapted for other proxy/routing scenarios in our orchestrator. The project's 314 stars + 223 bookmarks (very high bookmark-to-like ratio) signals strong practitioner intent — people are saving this for later use. |

---

## Full Content

@thdxr Just going to drop this here: https://github.com/rynfar/opencode-claude-max-proxy

**Engagement:** 162 likes, 4 retweets, 6 replies, 223 bookmarks, 29,858 views

---

## Linked Project: opencode-claude-max-proxy

| Field | Value |
|-------|-------|
| Repository | [github.com/rynfar/opencode-claude-max-proxy](https://github.com/rynfar/opencode-claude-max-proxy) |
| Stars | 314 |
| License | MIT |
| Tech Stack | TypeScript, Bun runtime, Anthropic Agent SDK |
| Install | `npm install -g opencode-claude-max-proxy` or Docker |

**How it works:**
1. Claude generates responses containing tool-use blocks
2. PreToolUse hook captures these calls and blocks SDK-internal execution
3. Proxy returns the payload to OpenCode as an Anthropic API response
4. OpenCode handles execution with full agent routing
5. Results resume the SDK session, allowing Claude to continue

**Modes:**
- **Passthrough mode** (recommended): Forwards all tool execution to OpenCode
- **Internal mode**: Uses MCP tools with SDK-managed agents

**Disclaimer:** Unofficial wrapper around Anthropic's publicly available Claude Agent SDK. Not affiliated with or endorsed by Anthropic. Users bear responsibility for ToS compliance.

---

## Notable Replies

[6 replies — low reply count suggests early-stage awareness; the 223 bookmarks vs 162 likes ratio (1.38:1) is the real signal — practitioners are saving this for personal use]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/rynfar/opencode-claude-max-proxy | Full proxy implementation — PreToolUse hook pattern, session management, multi-model routing | `/tool-catalogue` (infrastructure) |
| OpenCode itself (https://opencode.ai) | The target IDE this proxy bridges to — understanding its agent routing would contextualize the proxy's value | `/tool-catalogue` (developer-gui) |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Agent SDK | Core dependency — proxy built on top of its PreToolUse hook | Yes — [claude-agent-sdk](../../agent-harnesses/claude-agent-sdk.md) |
| OpenCode | Target IDE the proxy bridges Claude Max to | No |
| Claude Max | $200/mo subscription being proxied | Referenced throughout catalogue |
| Bun | Runtime used by the proxy | No |
