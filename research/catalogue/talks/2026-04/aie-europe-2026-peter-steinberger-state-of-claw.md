# State of the Claw — OpenClaw Update

> **Peter Steinberger (Creator of OpenClaw, now at OpenAI) — AI Engineer Europe 2026, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=5100s |
| Speaker | Peter Steinberger (@steipete) — Creator of OpenClaw (formerly "cloudbot"), solo founder now at OpenAI; previously creator of PSPDFKit; prolific open-source maintainer; transitioning OpenClaw to foundation governance |
| Event | AI Engineer Europe 2026, London |
| Date | 2026-04-09 |
| Duration | ~17 min |
| Topics | openclaw, agent-security, supply-chain-attacks, lethal-trifecta, agent-foundation, open-source-sustainability, cvss-slop, nation-state-attacks, sandbox-escapes, foundation-governance, multi-agent-orchestration |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Key Takeaways

1. **OpenClaw is now the fastest-growing GitHub project ever launched** — 5 months old, largest number of GitHub stars for any non-educational software project, ~30,000 commits, closing in on 2,000 contributors, ~30,000 PRs. Growth chart is a "stripper pole" vertical line. Every day brings new technological advancement the maintainers barely keep up with.

2. **OpenAI did NOT buy OpenClaw** — The narrative that "OpenAI bought OpenClaw" is false. Peter joined OpenAI personally ("they might have bought my soul.md"), but OpenAI supports open source (Codex is open, Symphony orchestration layer released). The Open Claw Foundation is being built as "Switzerland" to stay neutral across all LLM providers.

3. **Security advisory volume dwarfs every OSS peer** — 1,142 advisories received in 5 months (~16.6/day), 99 classified critical. 469 published, 60% closed. For comparison: Linux kernel averages 8-9/day, curl has ~600 total in its lifetime. OpenClaw became "the insecure product everyone tried to break — hundreds of clankers firing at it."

4. **Most critical reports are AI-generated slop** — Peter's heuristic: "The higher they are screaming how critical they are, the more likely it's slop." One CVSS 10/10 submission about iPhone app permission escalation literally didn't apply in normal use (99.9% of installs unaffected). The CVSS scoring rulebook has no mechanism to account for context, enabling a tidal wave of overstated disclosures.

5. **Nation-state attacks already hit the supply chain** — "Ghost Claw" (attributed to North Korea) pushed a typosquatted NPM package with a rootkit. The Axios supply chain compromise didn't hit OpenClaw directly, but MS Teams and Slack dependencies pulled Axios unpinned. Lesson: pin transitive dependencies and audit integrations, not just first-party code.

6. **Unnerfed models are cybersec superweapons** — At Nvidia NemoClaw launch, Peter found 5 sandbox escapes in 30 minutes using Codex on the unnerfed model. His conclusion: "We're going to break all the software that exists." Agentic red-teaming with unnerfed models will surface deep exploits in every existing codebase.

7. **The Lethal Trifecta applies to every agentic system** — Any agent with (1) access to your data, (2) access to untrusted content, and (3) ability to communicate outward = exploitable by prompt injection. Not OpenClaw-specific. Recommended mitigations: personal agent = one user + sandboxing if in group chat; team agent = scoped to team data and no secrets; permissions tightly restricted. This is the core threat model for every multi-agent orchestrator.

8. **Academic fearmongering is a new attack surface** — The "Agents of Chaos" paper spent 4 pages explaining OpenClaw architecture in detail, ignored the project's security documentation page, and ran the system in "pseudo mode" (requires code changes to enable). Friction was deliberately added to the setup to generate fear-based conclusions. Lesson: publish machine-readable security docs and an "authoritative threat model" page so researchers can't plausibly ignore it.

9. **Open Claw Foundation is the sustainability play** — Inspired by the Ghostty foundation model. Goal: hire full-time maintainers, keep the project neutral across LLM providers, accept corporate support without corporate capture. Bank setup is almost done ("American banking is slow for non-Americans"). Quote: "Running a foundation is like running a company on hard mode."

10. **Corporate contributor stack is already massive** — Full-time support from Nvidia (hardening the codebase), Microsoft (Teams, Windows app), Red Hat (security, dockerization), Slack (plugin maintainer). Tencent and ByteDance operate "much larger users than any other continent." Contributor diversification is the hedge against any single provider trying to capture the project.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | OpenClaw is the most prominent peer/competitor pattern to our tmux-based multi-agent orchestrator. Understanding its architecture, sustainability model (foundation governance), security posture (lethal trifecta, supply chain attacks, CVSS slop filtering), and growth dynamics is directly relevant to every architectural decision we make. Peter's first-hand report on sandbox escapes found via unnerfed Codex is a concrete warning for our own sandbox design. The Open Claw Foundation model is a relevant template if we ever need to transition to neutral governance. |
| **Novelty** | 8/10 | New data points: concrete advisory volume comparison (16.6/day vs Linux 8-9/day vs curl 600 total), the "slop filter heuristic" for triage, Ghost Claw NPM typosquat + Axios unpinned transitive dep as real-world supply chain attacks on agentic systems, academic "pseudo mode" fearmongering pattern, unnerfed Codex finding 5 sandbox escapes in 30 min. Lethal trifecta itself is not new (Simon Willison), but seeing it validated at OpenClaw scale is. |
| **Actionable** | 8/10 | (1) Adopt CVSS-slop filter heuristic for any security reports we receive; (2) pin transitive deps and audit Axios-class libraries; (3) apply lethal trifecta permission matrix to our orchestrator: single-user sandbox for personal agents, scoped data for team agents, tightly restricted outbound comms; (4) publish a "security-docs.md" and authoritative threat model to pre-empt academic fearmongering; (5) watch the Open Claw Foundation blueprint for when we need neutral governance; (6) use unnerfed Codex (or equivalent) proactively to red-team our own sandbox before adversaries do. |

---

## Relevance for Orchestrator Research

**HIGH.** We are building tmux-based multi-agent orchestrators. OpenClaw is the direct peer pattern for what we are building, with a 5-month operational track record at a scale we will not hit for years. Every lesson Peter shares — security volume, CVSS noise, supply chain realities, governance sustainability, academic attack surface — is a lesson we will need to learn too, preferably by reading Peter's report rather than the hard way. The Lethal Trifecta framing is a direct input into our sandbox design. The foundation governance model is a template for when we scale past a single-person maintainer. The sandbox escape demonstration is a warning that every agentic system currently in production is one unnerfed-Codex session away from being broken open.

---

## Summary

Peter Steinberger, creator of OpenClaw (the fastest-growing GitHub project ever launched, now 5 months old) and recently joined at OpenAI, delivered a 17-minute state update at AI Engineer Europe 2026 in London. The talk covers OpenClaw's explosive growth, the security chaos that came with it, and the sustainability strategy now in motion via the Open Claw Foundation.

**Growth at uncomfortable velocity.** In 5 months OpenClaw has accumulated the largest GitHub star count of any non-educational software project, ~30,000 commits, nearly 2,000 contributors, and ~30,000 PRs. The growth curve is a vertical line. Peter's personal experience: "Every time I wake up there's a new technological advancement." The project moved from solo-maintained toy to global infrastructure in under half a year.

**OpenAI did not buy OpenClaw.** Peter clarifies the widely-circulated acquisition narrative is false. OpenAI supports open source (Codex is open, Symphony orchestration layer is public), and Peter joined OpenAI personally — "they might have bought my soul.md." The Open Claw Foundation is being spun up as a neutral "Switzerland" so no single LLM provider can capture the project. Bank setup is almost complete; American banking is slow for non-Americans.

**Corporate contributor stack.** Full-time dedicated engineering support from Nvidia (hardening the codebase), Microsoft (MS Teams integration + Windows app), and Red Hat (security + dockerization). Slack has a dedicated plugin maintainer. Chinese tech giants Tencent and ByteDance are running "much larger users than any other continent." Corporate diversification is the structural defense against any single actor's capture attempt.

**Security volume at impossible scale.** OpenClaw has received 1,142 security advisories in 5 months — 16.6 per day, 99 classified critical. 469 have been published, 60% closed. For comparison: Linux kernel averages 8-9/day; curl has received ~600 total across its entire lifetime. OpenClaw is "the insecure product everyone tried to break — hundreds of clankers firing at it."

**CVSS slop is the new noise floor.** Most critical reports are AI-generated, overstated, or context-blind. Peter's heuristic: "The higher they are screaming how critical they are, the more likely it's slop." His canonical example is a CVSS 10/10 report about iPhone app permission escalation that literally didn't apply in normal use — 99.9% of installations were unaffected. The CVSS rulebook has no mechanism to account for deployment context, enabling an inexhaustible tidal wave of misleading disclosures. Triage has to default to skepticism.

**Nation-state attacks are already here.** "Ghost Claw" (attributed to North Korea) pushed a typosquatted NPM package with an embedded rootkit targeting OpenClaw users. The Axios supply chain compromise didn't hit OpenClaw directly, but MS Teams and Slack dependencies pulled Axios unpinned, re-exposing the ecosystem indirectly. Transitive dependency hygiene is non-optional for any widely-deployed agentic framework.

**Unnerfed models break everything.** At the Nvidia NemoClaw launch, Peter pointed an unnerfed Codex model at the sandbox and found 5 sandbox escapes in 30 minutes. His extrapolation: "We're going to break all the software that exists." Unnerfed agentic red-teaming is notably more capable for cybersec than the consumer-tuned versions we normally think of. Every sandbox currently in production should be assumed brittle.

**The Lethal Trifecta.** Any agentic system combining (1) access to your data, (2) access to untrusted content, and (3) ability to communicate outward is exploitable by prompt injection. This isn't OpenClaw-specific — it applies to every multi-agent orchestrator, including ours. Recommended mitigations: personal agent = single user with sandboxing inside group chats; team agent = scoped to team data with no access to secrets; permissions tightly restricted along all three axes. The trifecta is the canonical threat model.

**Academic fearmongering as an attack surface.** A paper called "Agents of Chaos" devoted 4 pages to explaining OpenClaw's architecture in detail, then ignored OpenClaw's published security documentation and ran the system in "pseudo mode" — a mode that literally requires code changes to enable. Friction was deliberately added to the setup to manufacture fear-based conclusions. Takeaway for us: publish machine-readable security docs and an authoritative threat model page so researchers cannot plausibly ignore them.

**Foundation sustainability.** Inspired by the Ghostty foundation model, the Open Claw Foundation aims to hire full-time maintainers, keep the project neutral, and accept corporate support without corporate capture. Peter's summary: "Running a foundation is like running a company on hard mode."

**The emotional arc.** Peter's closing posture is resignation turned acceptance: "I stopped fighting this. I'm just letting people have fun now." The project has outgrown any single-person control loop; foundation governance is the only path forward that keeps it functional.

---

## Notable Quotes

> "Every time I wake up there's a new technological advancement." — on the pace of the project

> "They might have bought my soul.md." — on joining OpenAI (but not OpenClaw being acquired)

> "OpenClaw was the insecure product everyone tried to break — hundreds of clankers firing at it." — on the security volume

> "The higher they are screaming how critical they are, the more likely it's slop." — CVSS triage heuristic

> "We're going to break all the software that exists." — on unnerfed models finding deep exploits

> "Running a foundation is like running a company on hard mode." — on Open Claw Foundation setup

> "I stopped fighting this. I'm just letting people have fun now." — on letting go of single-maintainer control

---

## Key Metrics

| Metric | Value | Context |
|--------|-------|---------|
| Project age | 5 months | Started late 2025 |
| GitHub stars | Highest ever for non-educational project | Largest software OSS launch in GH history |
| Commits | ~30,000 | 5 months |
| Contributors | ~2,000 | Closing in on this number |
| Pull Requests | ~30,000 | 5 months |
| Security advisories received | 1,142 | 5 months |
| Advisories per day | ~16.6 | vs Linux kernel 8-9/day, curl ~600 lifetime |
| Critical classifications | 99 | ~9% of total |
| Published advisories | 469 | ~41% publication rate |
| Advisory closure rate | ~60% | Of published |
| Sandbox escapes found via unnerfed Codex | 5 | In 30 minutes at NemoClaw launch |
| Corporate full-time supporters | 3+ | Nvidia, Microsoft, Red Hat (+ Slack plugin maintainer) |

---

## Lethal Trifecta Warning

The canonical agent-security threat model (originally from Simon Willison) as Peter framed it at AIE Europe:

**Any agentic system with ALL THREE of the following is exploitable:**

1. **Access to your data** (filesystem, secrets, tokens, private docs)
2. **Access to untrusted content** (web pages, PDFs, email, user-supplied files)
3. **Ability to communicate outward** (network calls, API posts, MCP tools, chat replies)

**Attack pattern:** Untrusted content injects prompts -> agent reads private data -> agent exfiltrates via outbound channel. Classic prompt-injection-plus-exfil.

**Recommended mitigations:**

- **Personal agent:** Single user. Sandbox if inside group chat. No ambient group-chat access to private user data.
- **Team agent:** Knows team data only. Does NOT know secrets. Never reads credentials into context.
- **Permissions:** Restrict along all three axes simultaneously. Break at least one leg of the trifecta for any given capability.

**Implication for our orchestrator:** Our tmux workers check all three boxes by default (read project files, read web content, write back via PRs and shell). We need to apply the trifecta matrix to every worker role: which workers need outbound comms, which can see secrets, which can read untrusted input. Enforce the separation at the spawn layer, not at the prompt layer.

---

## Relevance / Novelty / Actionable

| Dimension | Score |
|-----------|-------|
| Relevance | 9/10 |
| Novelty | 8/10 |
| Actionable | 8/10 |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/openclaw/openclaw | Primary repo — 271K+ stars, 2K contributors, 30K PRs; already catalogued but needs re-analysis post-foundation transition | Refresh `orchestration-platforms/openclaw.md` |
| https://openclaw.org (Open Claw Foundation, when live) | Foundation site — governance model, full-time hire pipeline, corporate sponsorship structure | `/ingest-article` when live |
| https://ghostty.org/foundation | Ghostty foundation — the template Peter explicitly copied for Open Claw Foundation structure | `/ingest-article` |
| https://simonwillison.net/series/prompt-injection/ | Simon Willison's Lethal Trifecta series — original framing Peter cites | `/ingest-article` |
| Arxiv: "Agents of Chaos" OpenClaw paper (find exact ID) | The academic paper Peter criticizes — worth reading to understand what machine-readable threat docs should preempt | `/ingest-article` |
| https://github.com/openai/symphony | OpenAI's Symphony orchestration layer that Peter references as OpenAI's open-source contribution | Tool catalogue entry |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| OpenClaw | Subject of the talk | Yes — [orchestration-platforms/openclaw.md](../../orchestration-platforms/openclaw.md) (6/10, needs refresh) |
| Codex (OpenAI, unnerfed) | Used to find 5 sandbox escapes in 30 min at NemoClaw launch | Partially — referenced in other entries |
| Symphony (OpenAI) | Open orchestration layer released by OpenAI | No — should add |
| NemoClaw (Nvidia) | NemoClaw launch was where sandbox escapes were found | Yes — [articles/2026-03/nvidia-ai-agents-gtc-2026.md](../../articles/2026-03/nvidia-ai-agents-gtc-2026.md) |
| Axios (npm) | Supply chain compromise; MS Teams/Slack pulled it unpinned | No — dependency-level concern |
| Ghost Claw (NPM typosquat, DPRK) | Nation-state supply chain attack | No — should add as threat intel note |
| Ghostty Foundation | Template for Open Claw Foundation | No — governance model reference |
| "Agents of Chaos" (paper) | Academic fearmongering example | No — should add as counterpoint reference |

---

## Action Items

- [ ] Refresh [orchestration-platforms/openclaw.md](../../orchestration-platforms/openclaw.md) with foundation transition, growth metrics (1,142 advisories, 30K PRs, 2K contributors), and CVSS-slop lessons
- [ ] Add a CVSS-slop filter heuristic to any future security-reporting workflow ("higher scream = more likely slop")
- [ ] Audit our orchestrator worker dependencies — pin transitive deps, identify Axios-class unpinned vulnerabilities
- [ ] Apply Lethal Trifecta matrix to every worker role in `_bmad/orchestrator-tmux-state.json` — annotate which workers need outbound comms, which can read secrets, which handle untrusted input
- [ ] Publish an authoritative `SECURITY.md` + threat model page to preempt "Agents of Chaos"-style academic fearmongering
- [ ] Red-team our sandbox with an unnerfed Codex (or equivalent) proactively, before adversaries do
- [ ] Monitor Open Claw Foundation launch for governance template if we ever need neutral oversight
- [ ] Add Symphony (OpenAI) to tool catalogue as a referenced orchestration layer
- [ ] Track Ghost Claw supply chain attack details for our own supply-chain threat intel
- [ ] Cross-reference this talk with Theo Browne's "Crashing Out at Anthropic" (the "OpenClaw ban" episode) for the full OpenClaw-vs-Anthropic context
