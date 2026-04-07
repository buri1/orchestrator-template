# "Are there any open source Claude Cowork clones?" — swyx crowdsources alternatives

> **@swyx — Mar 5, 2026**

| Field | Value |
|-------|-------|
| Source | [X post](https://x.com/swyx/status/2029616716440011046) |
| Author | [@swyx (Shawn Wang) — AI Engineer, founder of aidotengineer](https://x.com/swyx) |
| Date | 2026-03-05 |
| Topics | Claude Cowork, open-source alternatives, OSS desktop agents, agent harnesses, developer GUI |
| Type | Thread (crowdsourced — 59 replies) |

---

## Burak's Notes

> *Parent thread for the @aratahikaru0 reply we already ingested. 59 replies at 60K views makes this a goldmine for tool discovery — the OSS Cowork space exploded in early 2026 and this thread captured the moment. Cross-ref with our developer-gui catalogue category which already has OpenWork, Multica, Open Claude Cowork, AionUi, Goodable, Hello Halo catalogued. swyx's endorsement of Cowork ("can no longer function without it") plus threat to build his own signals the pattern is mature enough to become infrastructure.*

---

## Key Takeaways

1. **Cowork has become indispensable for power users** — swyx, one of the most influential AI engineering voices (146K followers), declares he "can no longer function without a cowork" — strong signal that desktop agent UIs have crossed from novelty to necessity for knowledge workers.
2. **OSS alternatives are demanded but none dominate** — 59 replies and 90 bookmarks show massive interest in open alternatives. The "pls recommend or i will build" framing confirms the space is immature — no single OSS project has earned the default recommendation yet.
3. **The thread is a tool discovery goldmine** — With 59 replies from the AI engineering community, this thread surfaced tools already in our catalogue (OpenWork, AionUi, Multica, etc.) plus additional ones worth tracking (Eigent, Kuse, DeepSeek-Cowork, Composio's open-claude-cowork, OpenClaw/NanoClaw as adjacent).

---

## Relevance to Our Interests

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly maps to our developer-gui research category and agent harness interests. This is THE signal thread for the OSS Cowork ecosystem — 60K views from the AI engineering community crowdsourcing alternatives. The demand pattern (desktop agent UI as infrastructure) validates our multi-agent GUI research direction. The fact that swyx (AI Engineer conference founder, Cognition advisor) finds Cowork indispensable signals these UIs are no longer toys. |

---

## Full Content

**Post by @swyx (Mar 5, 2026):**

> ok are there any open source Claude Cowork clones because I can no longer function without a cowork
>
> pls recommend or i will build
>
> [Screenshot attached]
>
> *59 replies, 3 reposts, 117 likes, 90 bookmarks, 60,646 views*

---

## Notable Replies

> **@aratahikaru0**: oss: AionUi, Goodable, Halo, Multica, Open Claude Cowork, OpenWork, mckaywrigley's (Claude Agent SDK-based). "pulled this list together around cowork release, so some of it might be outdated. no recs from me - cuz i'd rather build one myself."
> *Most comprehensive single reply — 7 OSS alternatives listed. Already ingested as [separate catalogue entry](./aratahikaru0-oss-cowork-clones.md). 72 bookmarks on the reply alone.*

> **@samrithshankar**: "Doesn't OpenCode also fall in this? Or is that a different category?"
> *Raises valid category question — OpenCode (117K stars) is in our catalogue as an agent harness but serves a similar desktop-agent role.*

> **@guohao_li**: Eigent — "Anthropic Claude Cowork just killed our startup product. So we did the most rational thing: open-sourced it."
> *Eigent pivoted from startup to OSS after Cowork launch. Available at eigent.ai. Not yet in our catalogue.*

> **@philhchen**: "I built a Claude Cowork clone in 3 days. It's not the future of knowledge work."
> *Contrarian take — signals low barrier to building Cowork clones, which explains the proliferation but also suggests most are thin wrappers without deep differentiation.*

> **Community consensus (from adjacent search results)**: Multiple replies reference Composio's open-claude-cowork (500+ SaaS integrations), OpenWork by different-ai (powered by opencode), and Kuse (Rust-native, local-first). The broader ecosystem article surveys identify 7-10 OSS alternatives as of March 2026.

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/eigent-ai/eigent | Startup-turned-OSS Cowork desktop; not yet catalogued | `/tool-catalogue` |
| https://github.com/accomplish-ai/openwork | Second OpenWork project (Accomplish); multi-provider, local-first, skill learning | `/tool-catalogue` |
| https://www.kuse.ai | Rust-native OSS Cowork desktop; not yet catalogued | `/tool-catalogue` |
| https://github.com/imjszhang/Deepseek-Cowork | Budget Cowork clone with DeepSeek; JS Eyes browser automation | `/tool-catalogue` |
| https://x.com/philhchen/status/2019832299861471276 | Contrarian take: "Cowork clone in 3 days, not the future" | `/ingest-post` |
| https://x.com/guohao_li/status/2010899322825744745 | Eigent open-source announcement thread | `/ingest-post` |
| https://www.scriptbyai.com/open-source-claude-cowork-alternatives/ | Comprehensive 7-tool comparison article | `/ingest-article` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Cowork | The proprietary product being cloned | Not catalogued (Anthropic product) |
| AionUi | OSS Cowork clone listed by @aratahikaru0 | Yes — [aionui.md](../developer-gui/aionui.md) |
| Goodable | OSS Cowork clone listed by @aratahikaru0 | Yes — [goodable.md](../developer-gui/goodable.md) |
| Hello Halo | OSS Cowork clone listed by @aratahikaru0 | Yes — [hello-halo.md](../developer-gui/hello-halo.md) |
| Multica | OSS Cowork clone listed by @aratahikaru0 | Yes — [multica.md](../developer-gui/multica.md) |
| Open Claude Cowork | OSS Cowork clone listed by @aratahikaru0 | Yes — [open-claude-cowork.md](../developer-gui/open-claude-cowork.md) |
| OpenWork | OSS Cowork clone listed by @aratahikaru0 | Yes — [openwork.md](../developer-gui/openwork.md) |
| mckaywrigley's Cowork app | Built on Claude Agent SDK, open-sourced | No — consider `/tool-catalogue` |
| Eigent | Startup-turned-OSS after Cowork launch | No — consider `/tool-catalogue` |
| Kuse | Rust-native OSS Cowork desktop | No — consider `/tool-catalogue` |
| DeepSeek-Cowork | Budget Cowork clone with browser automation | No — consider `/tool-catalogue` |
| Composio open-claude-cowork | OSS Cowork with 500+ SaaS integrations | No — consider `/tool-catalogue` |
| OpenCode | Mentioned as possible adjacent alternative | Yes — [opencode.md](../agent-harnesses/opencode.md) |
| OpenClaw | Adjacent: desktop agent, different category | Yes — [openclaw.md](../orchestration-platforms/openclaw.md) |
| Claude Agent SDK | Foundation for building Cowork-style apps | Yes — [claude-agent-sdk.md](../agent-harnesses/claude-agent-sdk.md) |
