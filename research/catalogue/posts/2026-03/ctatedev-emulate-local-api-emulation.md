# Introducing emulate: Local API Emulation for CI and No-Network Sandboxes

> **@ctatedev — 2026-03-20**

| Field | Value |
|-------|-------|
| Source | [x.com/ctatedev/status/2035063439001854227](https://x.com/ctatedev/status/2035063439001854227) |
| Author | [@ctatedev / Chris Tate — Creator of manaflow, json-render, emulate] |
| Date | 2026-03-20 |
| Topics | API emulation, CI/CD, sandbox, local development, mocks-free testing, Vercel, GitHub API, Google APIs, OAuth |
| Type | Single post with image |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this post. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **emulate provides mocks-free local API emulation for CI and sandboxed environments** — Instead of writing mock API responses, emulate runs stateful local replicas of production APIs (Vercel, GitHub, Google APIs). This means agents running in sandboxed/no-network environments can still interact with realistic API surfaces without actual network calls.
2. **Production-grade API simulation with OAuth and app registration** — The tool goes beyond simple mocking by supporting OAuth flows and app registration, making it suitable for testing complex multi-service integrations that agent workflows typically need.
3. **Chris Tate expanding his agent infrastructure portfolio** — This is the same developer behind manaflow (Claude Code web GUI, 5.3K stars) and json-render (12.1K stars). He's systematically building infrastructure for agent development workflows: GUI layer (manaflow), component rendering (json-render), and now testing infrastructure (emulate).

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Directly useful for our orchestrator's agent sandbox story. When agents run in isolated environments (tmux workers, worktrees), they often need API access for testing. emulate could replace real API calls in CI, reducing flakiness and network dependency. The Vercel/GitHub API emulation is particularly relevant since our OmniPort project deploys to Vercel and uses GitHub heavily. Chris Tate's track record (manaflow, json-render) suggests this will be well-maintained. Monitor for: agent-specific features, MCP integration, and whether it supports Supabase API emulation. |

---

## Full Content

Chris Tate announces "a new experiment" called emulate, describing it as local API emulation for CI and no-network sandboxes. Key features listed:

- Mocks-free operation
- Stateful functionality
- OAuth support
- App registration capabilities
- Production-grade API simulation
- Emulation of major platforms: Vercel, GitHub, and Google APIs

**Engagement:** 711 likes | 41 retweets | 30 replies

**Media:** 1 image (2056x2056) showing the emulate branding/features

---

## Notable Replies

*[Replies not accessible via API. 30 replies with 711 likes suggests strong engagement and likely technical discussion around supported APIs and use cases.]*

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| *(GitHub repo URL not yet available in post — monitor for release)* | emulate repo when published | `/tool-catalogue` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| emulate | Core subject — local API emulation tool | No — new, watch for repo |
| manaflow | Same author (ctatedev) | [Yes — developer-gui/manaflow.md](../developer-gui/manaflow.md) |
| json-render | Same author (ctatedev) | Referenced in ctatedev posts |
| Vercel | Emulated platform | N/A (cloud platform) |
| GitHub API | Emulated platform | N/A |
| Google APIs | Emulated platform | N/A |
