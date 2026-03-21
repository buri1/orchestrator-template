# CLIProxyAPI: Route CLI Agents Through Proxy API

> **@0oAstro -- 2026-03-19**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/i/status/2034735318952464737) |
| Author | @0oAstro (Shaurya) |
| Date | 2026-03-19 |
| Topics | proxy-api, CLI-agents, Claude-Max, multi-model, load-balancing, infrastructure, OpenAI-compatible |
| Type | Single post (reply to @thdxr) |

---

## Burak's Notes

> *(Personal observations go here.)*

---

## Key Takeaways

1. **OpenAI/Gemini/Claude/Codex-compatible proxy server for CLI agents** -- CLIProxyAPI (18.8K stars, Go, MIT) provides standardized API endpoints that let CLI coding agents (Claude Code, Codex CLI, Amp, etc.) route through a single proxy without individual API keys. This is the infrastructure layer that makes the "Claude Max $200/mo = 18-36x arbitrage vs API" pattern programmable and scalable.
2. **Multi-account load balancing with round-robin** -- supports multiple accounts with automatic round-robin distribution, streaming + non-streaming responses, function calling, tool support, and multimodal input. This directly enables the pattern of running multiple CLI agents against a single subscription, which is the economic foundation of our orchestrator.
3. **Massive ecosystem validates the proxy pattern** -- 15+ derivative applications (desktop managers, web dashboards, browser extensions, VSCode integrations) built on CLIProxyAPI demonstrate that the CLI-agent-through-proxy pattern has become a de facto infrastructure layer. The 18.8K stars and v6.8.55 release maturity make this the most battle-tested option in the space.

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly relevant to our infrastructure layer -- we run multiple Claude Code agents via tmux and Claude Max subscription. CLIProxyAPI formalizes the proxy routing pattern we implicitly rely on. Multi-account load balancing could solve rate-limit issues during parallel agent spawns. OAuth flow support means we could potentially add Codex/Gemini workers alongside Claude without separate API key management. Not relevant to orchestration logic itself, but high-value infrastructure plumbing. Compare with LiteLLM (already in catalogue at 8/10) -- CLIProxyAPI is CLI-agent-native where LiteLLM is API-call-native. |

---

## Full Content

@thdxr time to drop this in here. https://github.com/router-for-me/CLIProxyAPI

---

## Notable Replies

[6 replies recorded; the post is a reply to @thdxr (SST/Terminal creator) in a thread about CLI agent infrastructure. No additional high-signal replies accessible via API.]

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/router-for-me/CLIProxyAPI | Primary repo -- 18.8K stars, MIT, Go; full proxy server with multi-provider support, OAuth flows, load balancing, model mapping; worth a dedicated tool catalogue entry | `/tool-catalogue` |
| https://help.router-for.me/ | Official documentation -- management API, Go SDK, Docker deployment, YAML config examples | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| CLIProxyAPI | Main subject -- Go proxy server for CLI agents (18.8K stars) | No -- consider adding as infrastructure entry |
| LiteLLM | Related proxy pattern (API-call-native vs CLI-agent-native) | Yes -- [infrastructure/litellm.md](../../infrastructure/litellm.md) |
| Claude Code | Primary target CLI agent for the proxy | Yes -- multiple entries |
| Codex CLI | Supported CLI agent | Yes -- multiple entries |
| Amp CLI | Supported CLI agent integration | No |
