# Claws Out — Securing and Building with OpenClaw

> **Nick Taylor (Developer Advocate at Pomerium) — AI Engineer Europe 2026, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=14147s |
| Speaker | Nick Taylor — Developer Advocate at Pomerium ("the Pomeranian company" because nobody can pronounce Pomerium); Canadian, based in Montreal; GitHub Star, Microsoft MVP, AWS Community Builder; contributed the `trusted_proxy` auth mode to OpenClaw in February 2026 (Issue 1560) |
| Event | AI Engineer Europe 2026, London |
| Date | 2026-04-09 |
| Duration | ~18 min |
| Topics | openclaw, identity-aware-proxy, pomerium, trusted-proxy-auth, agent-security, zero-trust, reverse-proxy, mcp-apps, websocket-auth, device-pairing, phone-development, clawspace, mclaw, oss-contribution |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Speaker Biography

Nick Taylor is a Developer Advocate at **Pomerium**, an open-source identity-aware proxy ("the Pomeranian company" — his self-deprecating joke because people consistently mispronounce "Pomerium"). He is Canadian and lives in Montreal. His community credentials include GitHub Star, Microsoft MVP, and AWS Community Builder.

Nick is relevant to the OpenClaw ecosystem because he personally contributed the `trusted_proxy` auth mode to OpenClaw in February 2026 — a feature that eliminates the token-pasting friction of pairing OpenClaw to a remote/websocket client when it sits behind an identity-aware proxy. The PR was opened in the 1700s and, after he returned from vacation, had ballooned to the 16000s in rebase hell before being merged with help from **Peter Stipe**'s feedback. He wrote the feature primarily with **Opus**, although he complained that it was "a little too eager" on using the GitHub CLI and submitted the PR before it was actually ready.

He brought **Pomeranian stickers** to the talk instead of Pomerium stickers, leaning into the pronunciation joke.

---

## Key Takeaways

1. **Pomerium = Identity-Aware Proxy (IAP).** Three components bundled together: (1) identity provider integration, (2) policy engine, (3) reverse proxy. Conceptually similar to GCP's Identity-Aware Proxy (which originated inside Google as "BeyondCorp"), but open-source and self-hostable. Well-suited for gating internal tools and — crucially for this talk — local AI agent harnesses that you want to expose selectively.

2. **Before `trusted_proxy`, OpenClaw websocket auth was painful.** Even if your OpenClaw instance was fully gated by an IAP, you still had to paste an auth token into the UI every time you wanted a websocket connection to pair. The token was being stuck into the query string ("not safe beyond local mode"). You had to re-pair your device every single time. Annoying UX, despite the surrounding proxy already providing strong security.

3. **`trusted_proxy` auth mode eliminates the pairing friction.** Nick's contribution (Issue 1560, eventually merged after rebase hell). When OpenClaw is configured to trust a specific set of proxy IPs and to read identity claims from a proxy-injected JWT header, it no longer asks clients for a pairing token. Security is delegated upstream to the IAP; OpenClaw trusts the header because it trusts the proxy. Result: **no more token for websocket connections, no more device pairing**. Security posture is preserved (arguably improved — no token in query strings) and UX is dramatically better.

4. **The contribution story is a rebase-hell OSS parable.** Nick opened the issue, submitted a PR around #1700, went on vacation, came back, and the OpenClaw project had moved so fast that the PR was sitting around #16000. He cleaned up the conflicts, Peter Stipe gave feedback, and it merged. Meta-detail: he used **Opus** to write the feature, and Opus was "a little too eager on the GitHub CLI" — it submitted the PR before the work was actually finished. Cautionary tale on agents with write access to dev platforms.

5. **The bug-fix sub-plot (Anthony + Sid).** After merge, **Anthony** reported a bug that Nick couldn't reproduce because he already had a paired device (a classic "works on my machine"). **Sid** jumped in and fixed it quickly. Nick's takeaway: "OSS for the win" — this is the kind of distributed maintenance that foundation governance (see Peter Steinberger's State of the Claw) is trying to institutionalize.

6. **The "OpenClaw is not a security nightmare" framing.** Nick is direct: the widespread "OpenClaw is dangerous" narrative conflates default configuration with the technology itself. Configured properly — behind an identity-aware proxy, with `trusted_proxy` mode, with scoped permissions — it's safe. The nightmare is lazy deployment, not the project.

7. **His personal setup: Mclaw on Discord.** Nick runs an OpenClaw instance on his desk in Montreal and accesses it through **Discord** as the client. He tried **Telegram** first but a friend who is a CEO at a security company warned him that Telegram channels aren't end-to-end encrypted by default. Discord won on the encryption story (at least for his threat model) and the surface area it provides. He contributed the `trusted_proxy` feature via his own Mclaw instance — a meta-loop of dogfooding.

8. **Clawspace — his phone-native companion tool.** Nick built Clawspace, a small side project, on his phone over Discord ("personal software age"). It lets you browse and edit files in the workspace without SSHing into the box. Stated explicitly: "Made for myself, not for others." Representative of the broader trend of single-user "personal software" built with agents that would never have been worth writing by hand.

9. **Live demo: MCP + UI app built on his phone.** He walked through an MCP + UI app (using a template he keeps around) that exposed two tools: an `echo` tool and a `search_speakers` tool populated with AIE Europe speakers. The whole build was done from his phone via Mclaw + OpenClaw. Demo moments: (a) ask the agent to "change the echoed message to AIE EU" — live HMR (hot module reload) inside a ChatGPT MCP app context; (b) `search_speakers` returns a card grid UI with filtering plus a "More" button that calls back to the LLM for additional speaker context. The public URL for the ChatGPT MCP connection was being fronted by Pomerium with `trusted_proxy` gating.

10. **"I'm phone pilled now."** Nick's central productivity claim: because his OpenClaw sits behind an IAP, because `trusted_proxy` removed the device-pairing friction, and because Clawspace gives him a phone-native file browser/editor, **he builds apps while walking around**. He doesn't SSH. He doesn't need to be at a keyboard. The workflow is identity-aware proxy + public URL + OpenClaw + phone client. This is a real (if personal) blueprint for mobile agent development.

---

## Config Example — `trusted_proxy` Mode

The exact config shape shown on stage (paraphrased from the slide):

```yaml
gateway:
  mode: trusted_proxy
  trusted_proxies:
    - <IP of Pomerium / IAP frontend>
    # add additional trusted edge IPs here
  trusted_proxy:
    user_header: <JWT header the proxy injects, e.g. X-Pomerium-Jwt-Assertion>
    required_header:
      - <header the proxy MUST supply or the request is rejected>
      # add any additional required headers here
```

**How it works end-to-end:**

1. Client (Discord, ChatGPT, browser, Clawspace on phone) makes a request to the public URL.
2. Pomerium (or any IAP) authenticates the user against the identity provider, evaluates the policy engine, and if allowed reverse-proxies the request to the local OpenClaw gateway.
3. Pomerium injects a signed JWT header (`user_header`) carrying the authenticated identity and any other required headers.
4. OpenClaw sees the request is coming from a `trusted_proxies` IP, reads the user identity from `user_header`, verifies `required_header` is present, and skips the usual pairing-token flow.
5. Websocket session is established with identity delegated to the proxy. No query-string token, no device pairing.

**Security invariant:** OpenClaw only trusts the header because it trusts the source IP. If you misconfigure `trusted_proxies` (e.g. wildcard it, or list an IP that isn't actually your IAP), you defeat the whole model. The trust is transitive, and the weakest link is the IP allowlist.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 6/10 | Directly about OpenClaw deployment, which we are not currently running — but the identity-aware proxy pattern is immediately applicable the day we want to expose any tmux-orchestrator workload outside a local trust boundary. If we ever go multi-user (shared team orchestrator, enterprise POC, client access to a running orchestrator dashboard), this is the reference architecture. |
| **Novelty** | 6/10 | IAP pattern itself is not new (GCP BeyondCorp, Pomerium, Cloudflare Access have existed for years), but applying it specifically to a local AI agent harness with websocket auth delegation is the novel piece. The `trusted_proxy` auth mode is the first time we've seen an agent harness explicitly design for IAP front-ending as a first-class path. |
| **Actionable** | 6/10 | Concrete action items exist: (1) evaluate Pomerium (or Cloudflare Access / GCP IAP / oauth2-proxy) as the front door for any remote orchestrator instance; (2) adopt the `trusted_proxy`-style "delegate auth to a trusted upstream" pattern if we build our own exposed websocket endpoint; (3) never put auth tokens in query strings for local-mode fallback; (4) if we share an orchestrator across devices, follow Nick's "IAP + public URL" template instead of SSH/VPN. |

---

## Relevance for Orchestrator Research

**MEDIUM.** We are not currently deploying OpenClaw, and our tmux orchestrator runs locally with `--dangerously-skip-permissions` on a single trusted workstation. Today this talk is reference material, not adoption material.

It becomes **HIGH** the moment any of these triggers fire:

- **Multi-user orchestrator**: If more than one human (or more than one of Burak's devices) needs to hit the same orchestrator instance, we need identity at the edge, and IAP is the cleanest pattern.
- **Phone/mobile client for orchestrator**: If we ever want a "build while walking" workflow — opening a dashboard, spawning a worker, or reviewing a PR from a phone — we need something like Clawspace behind an IAP. Nick's template is directly usable.
- **Enterprise client pilot**: Any client POC that exposes an orchestrator over the internet will fail a basic security review without IAP. Pomerium is one of the cheapest ways to pass that review.
- **Sharing a running orchestrator across a team**: Even a two-person team instantly needs per-user identity so devlog/state changes are attributable and policy-gated.

Action: keep this talk bookmarked, do not adopt yet. When we hit any of the above triggers, this is the first reference to re-read.

---

## Summary

Nick Taylor, Developer Advocate at **Pomerium** ("the Pomeranian company"), delivered an 18-minute talk at AI Engineer Europe 2026 in London titled **Claws Out — Securing and Building with OpenClaw**. The central thesis: OpenClaw is not a security nightmare if you put a properly configured identity-aware proxy in front of it, and Nick's own `trusted_proxy` auth mode contribution (Issue 1560) eliminates the UX friction that previously made this approach annoying to use.

**Pomerium 101.** Pomerium is an open-source identity-aware proxy bundling an identity provider integration, a policy engine, and a reverse proxy into a single deployment. Conceptually similar to GCP's IAP or Cloudflare Access, but self-hostable. The mental model: put it in front of any internal service, let it handle auth + policy, and the service itself only has to trust signed headers from the proxy.

**The problem `trusted_proxy` solves.** Before Nick's contribution, even if your OpenClaw instance was fully IAP-gated, you still had to paste an auth token into the OpenClaw UI every time you wanted to open a websocket connection — and the token was shoved into the query string, which is unsafe beyond local-only deployments. You had to re-pair your device every time. Good security, awful UX.

**The feature.** `trusted_proxy` auth mode lets OpenClaw trust a specific set of upstream proxy IPs and read the authenticated user identity from a JWT header that the proxy injects. When those conditions are met, OpenClaw skips the pairing-token flow entirely. Websocket connections just work. Device pairing is gone. Tokens never touch the query string. Nick opened Issue 1560, submitted the initial PR in the 1700s, went on vacation, came back to find it at ~16000 in "rebasing hell," cleaned it up, got Peter Stipe's review, and shipped it. He wrote it with Opus, which he described as "a little too eager with the GitHub CLI" — it submitted the PR before the work was actually done. Classic agent-overreach tale.

**Bug-fix epilogue.** Anthony reported a bug that Nick couldn't reproduce because he already had a paired device. Sid fixed it quickly. "OSS for the win."

**Nick's personal setup: Mclaw on Discord.** Nick runs an OpenClaw instance (which he calls Mclaw) on his desk in Montreal. He accesses it from a Discord client. He originally tried Telegram but a CEO friend at a security company warned him that Telegram channels are not end-to-end encrypted by default, so he moved to Discord for the encryption story. He contributed the `trusted_proxy` feature via his own Mclaw instance — dogfooding the whole way.

**Clawspace: the phone-native side project.** Built on his phone, over Discord, in the "personal software age." Clawspace lets him browse and edit workspace files without SSHing into the box. Explicitly for himself, not a product. Representative of the broader trend where agents make it economical to build single-user tools that previously weren't worth writing by hand.

**Live demo: MCP + UI app built on his phone.** Nick walked through a small MCP + UI app he built earlier that day, entirely from his phone, using a template he keeps for MCP + UI projects. The app exposed two tools: an `echo` tool and a `search_speakers` tool backed by AIE Europe speaker data. On stage he asked the agent to "change the echoed message to AIE EU" and the edit live-HMR'd inside a ChatGPT MCP app context. He then demoed `search_speakers` returning a card-grid UI with filtering plus a "More" button that called the LLM for extra speaker context. The public URL that ChatGPT was hitting was fronted by Pomerium with `trusted_proxy` gating — demonstrating the full pattern: local MCP server, public URL via IAP, ChatGPT as the client, no pairing friction.

**"I'm phone pilled now."** The productivity claim is that because his OpenClaw is IAP-gated and `trusted_proxy` removes the pairing dance, he builds apps while walking around. No SSH, no keyboard, just a phone client hitting a public URL that's actually safe because of the proxy layer. It's a niche workflow but a real one, and the underlying architecture is reproducible by anyone willing to deploy Pomerium (or equivalent) and configure `trusted_proxy`.

**The closing frame.** OpenClaw is not inherently insecure; insecure deployments are insecure. Configure it properly and the horror stories go away. The talk is essentially a rebuttal to the "OpenClaw is dangerous" meme — delivered by someone who is actively contributing code to make the secure path easier.

---

## Notable Quotes

> "Only the person sleeping in the back is like 'oh what did he ask?'" — Nick, referring to someone in the audience not following along

> "OpenClaw is not that it's a security nightmare — just configure it properly." — Nick's central thesis

> "I find it useful because I don't need to SSH in to see workspace files." — on why Clawspace exists

> "I'm phone pilled now." — on his new mobile-first development workflow

> "It was a little too eager on the GitHub CLI — it submitted the PR before it was actually done." — on using Opus to write the feature

> "OSS for the win." — on Anthony finding the bug and Sid fixing it

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Pomerium | Speaker's employer; open-source identity-aware proxy Nick uses in front of OpenClaw | No — should add as infrastructure entry |
| OpenClaw | Subject of the contribution (`trusted_proxy` auth mode) | Yes — [orchestration-platforms/openclaw.md](../../orchestration-platforms/openclaw.md) |
| GCP Identity-Aware Proxy | Reference model for what Pomerium provides | No |
| Discord | Nick's chosen Mclaw client (chose over Telegram for encryption) | No |
| Telegram | Tried first; rejected because channels aren't E2E encrypted by default | No |
| Opus | Used to write the `trusted_proxy` feature; overeager on GitHub CLI | Yes — referenced across catalogue |
| GitHub CLI (`gh`) | Opus used it to submit PR prematurely | Yes — referenced in workflow entries |
| Clawspace | Nick's phone-native workspace browser/editor side project | No — niche, worth a mention |
| Mclaw | Nick's personal OpenClaw instance nickname | No |
| ChatGPT MCP apps | Demo target for his MCP + UI app | No — worth tracking |
| Chat SDK / echo tool template | MCP+UI scaffold Nick keeps around | No |

---

## Relevance / Novelty / Actionable

| Dimension | Score |
|-----------|-------|
| Relevance | 6/10 |
| Novelty | 6/10 |
| Actionable | 6/10 |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://www.pomerium.com/docs | Pomerium documentation — identity-aware proxy architecture, deployment guide, policy engine reference | `/ingest-article` |
| https://www.pomerium.com/docs/reference/gateway (best-guess path) | Gateway / `trusted_proxy` mode reference for OpenClaw integration | `/ingest-article` |
| https://github.com/openclaw/openclaw/issues/1560 | Nick's original issue for `trusted_proxy` auth mode | `/ingest-article` |
| https://github.com/openclaw/openclaw (trusted_proxy PR) | The actual merged PR (the "16000 rebase hell" one) — worth reading for the diff | `/ingest-article` |
| https://cloud.google.com/iap | GCP Identity-Aware Proxy — reference pattern Pomerium mirrors | `tool-catalogue` |
| https://www.cloudflare.com/zero-trust/products/access/ | Cloudflare Access — alternative IAP if we ever want to skip self-hosting Pomerium | `tool-catalogue` |
| https://oauth2-proxy.github.io/oauth2-proxy/ | oauth2-proxy — minimal-footprint IAP alternative for small self-hosted deployments | `tool-catalogue` |

---

## Connections to Existing Catalogue

- [talks/2026-04/aie-europe-2026-peter-steinberger-state-of-claw.md](./aie-europe-2026-peter-steinberger-state-of-claw.md) — Peter's state-of-the-project talk at the same event; Nick's talk is the practical "how to deploy it safely" companion piece
- [talks/2026-04/aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md) — Malte's "1999-era harness security hole" framing is the exact problem Nick's `trusted_proxy` mode partially addresses for OpenClaw specifically
- [talks/2026-04/aie-europe-2026-ryan-lopopolo-harness-engineering.md](./aie-europe-2026-ryan-lopopolo-harness-engineering.md) — harness engineering keynote at the same event; Nick's contribution is a worked example of harness-layer security hardening
- [talks/2026-04/theo-browne-crashing-out-anthropic-pi-pilled.md](./theo-browne-crashing-out-anthropic-pi-pilled.md) — context for the broader OpenClaw-vs-Anthropic drama Nick is pushing back against
- [orchestration-platforms/openclaw.md](../../orchestration-platforms/openclaw.md) — primary OpenClaw catalogue entry; should be updated with a reference to `trusted_proxy` mode
- [talks/2026-04-01_felixba-ki-leben-satire-openclaw.md](../2026-04-01_felixba-ki-leben-satire-openclaw.md) — Felixba's April Fools' satire about an OpenClaw agent going rogue; Nick's talk is the sober counterpoint about how to actually lock it down

---

## Action Items

- [ ] Evaluate Pomerium (or Cloudflare Access / GCP IAP / oauth2-proxy) as the front door if we ever expose the orchestrator outside the local machine
- [ ] Document the "IAP + `trusted_proxy`-style header delegation" pattern in our security playbook for the day we go multi-user
- [ ] Update [orchestration-platforms/openclaw.md](../../orchestration-platforms/openclaw.md) with a note about `trusted_proxy` auth mode as the recommended deployment pattern
- [ ] Read Issue 1560 and the merged PR for the actual config surface and gotchas
- [ ] Bookmark Clawspace as a reference for "phone-native orchestrator client" if we ever want a mobile surface for our own orchestrator
- [ ] Never put auth tokens in query strings — even in local mode — for anything we ship ourselves
- [ ] Cross-link this talk from the Peter Steinberger State of the Claw entry as the practical deployment counterpart
