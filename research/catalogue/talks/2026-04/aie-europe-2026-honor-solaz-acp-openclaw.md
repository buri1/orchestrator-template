# Building on ACP at OpenClaw — Agent-Client Protocol and Orchestration

> **Honor Solaz (Founding Engineer, Text Cortex; OpenClaw maintainer) — AI Engineer Europe 2026, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=20502s |
| Speaker | Honor Solaz — Founding Engineer at Text Cortex (startup), OpenClaw (formerly "cloudbot") maintainer since day one, MS Teams integration author, author of ACPX Swiss-army-knife CLI for Agent-Client Protocol |
| Event | AI Engineer Europe 2026, London |
| Date | 2026-04-09 |
| Duration | ~20 min |
| Topics | acp, agent-client-protocol, openclaw, orchestration, interoperability, sops, swiss-army-knife-cli, discord-driven-development, spritz, kubernetes-agents, firecracker, disposable-agents, slack-teams-multi-agent, workflow-engine, codex-adapter, zed, text-cortex |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Speaker Biography

Honor Solaz is a founding engineer at **Text Cortex**, a startup building AI tooling and a custom coding harness that has been evolving since before ChatGPT launched. He started building coding harnesses in 2022 by writing a **Jupyter Lab extension over the original Codex (Davinci Code 2)** — what he calls "OG Codex" — and that early tool evolved over several years into Text Cortex's current production harness (Ship-of-Theseus style: every part replaced over time, still the same system).

He has followed Peter Steinberger's work since the famous **"Cloud Code is my computer"** article, and joined **OpenClaw (originally "Cloudbot") on day one**. He installed it at his company cluster, became a maintainer, and contributed the **MS Teams integration**. His focus as a maintainer has been **agent interoperability and orchestration** — specifically, making OpenClaw-style agents talk to each other across editor plugins, chat platforms, and CLI tools without requiring every platform to rebuild the wheel.

At AIE Europe 2026 he presented his work on **ACPX**, a Swiss-army-knife CLI that wraps the **Agent-Client Protocol (ACP)** from Zed, plus a broader thesis about **Standard Operating Procedures (SOPs) for agents** and **enterprise dispatch patterns** (via Spritz, Text Cortex's open-source Kubernetes operator for on-demand disposable agents).

---

## Key Takeaways

1. **ACP is the "build once, ship everywhere" protocol for coding agents** — The Agent-Client Protocol comes from Zed (Rust editor) and standardizes how an agent talks to its host client (editor, chat platform, CLI). It is explicitly **not** MCP (which standardizes agent-to-tool calls). Without ACP, every time you use Codex in VS Code, Zed, Claude Code, or OpenClaw, each host rebuilds its own plugin — "huge wasted work." With ACP, one adapter ships to every ACP-compatible client.

2. **Zed was the first mover — picked ACP over Agent Protocol for that reason** — There are two competing standards: **Agent Protocol** (agent-to-agent) and **ACP / Agent-Client Protocol** (human-to-agent, but agents can also use it for agent-to-agent). Honor chose ACP because **Zed already built ACP adapters for Codex and Claude Code first** — adoption momentum matters more than protocol purity.

3. **ACPX is a Swiss army knife that lets any agent call any other agent over CLI** — Honor's flagship contribution. OpenClaw extends functionality primarily by exposing new CLI commands, so ACPX bridges that model: Discord message → bind channel to a Codex session over ACP → full agent-to-agent orchestration from inside a chat platform. It also speaks the **Codex app-server protocol** (contributed by a maintainer named Herald) as an alternative transport.

4. **Discord-Driven Development via Codex — because Opus was unreliable for complex coding** — Honor's first big PR to OpenClaw was **Telegram-driven development (TDD)**. Then he hit a wall: OpenClaw + Opus was unreliable for hard coding tasks, so he played a telephone game — OpenClaw Opus forwards to Codex via CLI, Codex does the actual work, answer comes back. That hack became the motivation to bring **Codex natively into Discord over ACP** via ACPX. Real story-driven engineering.

5. **OpenClaw's PR firehose (60K+ PRs, 300-500/day) forced him to build SOP tooling** — Tens of thousands of stakeholders want features. Peter Steinberger's workflow — ask the agent "is this the best possible fix?" before merging — works manually but scales only with automation. 90% of the time an incoming PR is "AI-generated description of slop code." You can't merge (quality), you can't fully discard (buried user feedback). Categorizing, binning, and identifying broken code **by hand is impossible at this volume**; it must be automated end-to-end.

6. **Standard Operating Procedures (SOPs) for agents — "automating the automator"** — Honor's thesis: at scale we need **SOPs for agents** the same way humans do. Abstract workflow for an incoming PR: **item comes → find intent → judge impl → look for conflicts → CI feedback → review feedback → make CI pass.** "All this mechanical work should be resolved by the time the PR is in front of you." The punchline: the **shameful Ralph Wiggum "Review / Refactor" loops** are actually useful — not for design, but for **uncovering shallow bugs** and making CI green. ACPX lets this workflow run against any Codex or Claude Code session.

7. **Workflow engine demo — programmatic parts around agent calls** — Honor showed a live ACPX workflow: reproduce bug → judge current state → refactor → review loop. The review loop "didn't bring anything new" on that particular run (honest result reporting), but the overall workflow produced **structured JSON output** that can plug into any ATL-style (Activity Template Language / Argo / Temporal) workflow engine. ACPX is positioned as **a general-purpose workflow engine for agent calls**, not just a chat bridge.

8. **On-demand disposable agents on Slack/Teams/Discord — one app per agent is the blocker** — Current chat platforms only support **one instance per installed app**. If you want multiple agents in Slack, you must register a separate Slack app with its own manifest for every agent — painful, and platforms "don't support multi-agent provisioning." Until that changes, Honor uses a **different UI** for multi-agent work. This is a real constraint on "chat-native multi-agent" patterns.

9. **Spritz — Text Cortex's open-source Kubernetes operator for dispatchable agents** — To work around the one-app-per-agent problem at enterprise scale, Honor and Text Cortex built **Spritz**, a Go operator for Kubernetes that handles a **concierge agent on Slack** plus **dispatch agents for specific tasks**. User experience: "I want to debug X" → concierge spawns a new agent → returns a **website link** to a fresh agent session. Currently used for error reporting. Each agent runs in a **full Kubernetes pod** (wasteful but "better abstraction — OpenClaw showed the power of giving the agent a full computer"). Under the hood: **Firecracker / microVMs**.

10. **Personal agent → enterprise agent spectrum is where the money is** — Honor's framing: agents span from **personal** to **enterprise**. Enterprise = more inference spend = more revenue opportunity. Text Cortex and OpenClaw both aim at that spectrum, and ACP/ACPX/Spritz are the **connective tissue** that lets a personal agent harness scale up to a fleet without rewriting everything for the enterprise layer.

11. **"AI as ointment" philosophy — apply generously, take yourself out of the loop** — His design aesthetic: "I see AI as ointment that you apply generously on any problem that can be solved with agents." The engineering discipline: **take yourself out of the loop** and solve the problem **with agents**. But with a caveat — "if you give a sandwich generously, it's going to be a weird sandwich." The sum of small decisions matters; generous application without taste produces slop. The craft is knowing where to apply and where to refuse.

---

## ACP vs MCP vs Agent Protocol — Comparison

| Protocol | Layer | Direction | Origin | Purpose | Honor's Take |
|----------|-------|-----------|--------|---------|--------------|
| **MCP** (Model Context Protocol) | Agent ↔ Tool | Agent calls external tools/resources | Anthropic | Standardize how agents invoke tools, file systems, APIs | Not ACP's problem — MCP owns this space |
| **ACP** (Agent-Client Protocol) | Client ↔ Agent | Human client (editor/chat) drives agent | Zed (Rust) | Standardize how editors, chat, IDEs and CLIs host agents | Honor's pick — Zed built Codex + Claude Code adapters first, momentum matters |
| **Agent Protocol** | Agent ↔ Agent | Agent-to-agent orchestration | Community | Standardize agent-to-agent message passing | Valid design, but lost the race on adapter availability |
| **ACPX** (Honor's work) | CLI ↔ ACP | CLI tools drive agents, agents drive agents | Text Cortex / OpenClaw | Swiss army knife: any agent calls any other agent over command line, plus workflow engine | The main output of this talk |

**Key insight:** ACP was *designed* for human-to-agent but ACPX proves it can be **bent into agent-to-agent** by treating the CLI as a synthetic client. This is how OpenClaw Opus can hand off to Codex from inside a Discord channel without Agent Protocol.

---

## Notable Quotes

> "I see AI as ointment that you apply generously on any problem that can be solved with agents." — design philosophy

> "You need to take yourself out of the loop and solve it with agents." — on orchestration discipline

> "If you give a sandwich generously, it's going to be a weird sandwich. The sum of these decisions is important." — caveat to "apply generously"

> "All this mechanical work should be resolved by the time the PR is in front of you." — on SOPs for agents

> "Build once, ship everywhere." — on why ACP matters

> "OpenClaw showed the power of giving the agent a full computer." — justifying full Kubernetes pods per dispatch agent

> "We played a telephone game: Opus to Codex via CLI, because Opus wasn't reliable enough for complex coding." — the Discord-driven-development origin story

> "90% of the time, it's an AI-generated description of slop code. Can't merge, can't fully discard." — on the OpenClaw PR firehose

---

## Relevance / Novelty / Actionable

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Directly applicable to our tmux-based orchestrator. ACP is the emerging standard for agent-client interop and we should know it. SOPs-for-agents matches what we already do manually in our review/fix loop. Enterprise dispatch (Spritz) is the exact pattern we'd need if we scale past a single operator. OpenClaw context throughout is the direct peer system to ours. |
| **Novelty** | 8/10 | ACP as a protocol is known but the ACPX CLI approach to making **any agent call any other agent over command line** is new. Honor's framing of **SOPs as "automating the automator"** is a crisp reframing of workflow engines for the agent era. Spritz as a public open-source Kubernetes operator for disposable dispatchable agents is a new data point in the "how do you run fleets of agents" space. The Discord-driven-development → Codex via ACP story is a concrete working example of agent-to-agent over a human protocol. |
| **Actionable** | 9/10 | (1) Try ACPX as a replacement for our ad-hoc `tmux send-keys` worker handoff; (2) define explicit SOPs for our orchestrator's review/fix loop matching Honor's abstract workflow (intent → judge → conflicts → CI → review → make CI pass); (3) evaluate Spritz as a model for if/when we need multi-user dispatch of our orchestrator (e.g., multiple clients running in parallel); (4) adopt ACP client adapters rather than hand-building plugin code per platform; (5) use the "AI as ointment, but watch the sandwich" heuristic as a team-level design principle. |

---

## Relevance for Orchestrator Research

**HIGH.** Our tmux orchestrator is exactly the kind of system Honor is building tooling around. Three direct adoption candidates:

1. **ACP/ACPX as the handoff layer.** Today we use `tmux send-keys` to forward commands between workers. That's brittle and platform-specific. ACPX with ACP under it would let our orchestrator call Codex, Claude Code, or OpenClaw workers through one uniform protocol. This is the same interop layer Zed, VS Code, and Cursor are converging on.

2. **SOPs as explicit state machines.** Our review/fix loop is currently an imperative prompt: "review the PR, spawn a fixer if needed, max 3 cycles." Honor's framing — **item comes in → find intent → judge impl → look for conflicts → CI feedback → review feedback → make CI pass** — is a better mental model, and we should encode it as an explicit SOP (JSON or YAML) that our orchestrator agent executes step-by-step. This would also fix the "max 3 cycles" heuristic by grounding it in actual state transitions.

3. **Spritz as the enterprise dispatch template.** If we ever run the orchestrator for multiple OmniPort clients in parallel, we need on-demand disposable agents. Spritz already solves: concierge on chat → dispatch agent per task → full Kubernetes pod with Firecracker isolation. That's the template we'd copy rather than invent.

**The PR firehose anecdote is also a direct warning:** OpenClaw hit 60K+ PRs with 300-500/day and had to automate triage. Our orchestrator will not hit that scale, but the lesson — **"the mechanical work should be resolved by the time the PR is in front of you"** — applies the day we get our second client.

---

## Summary

Honor Solaz, founding engineer at Text Cortex and day-one maintainer of OpenClaw, delivered a ~20-minute AIE Europe 2026 talk on **agent interoperability and orchestration via ACP**. The throughline: at scale, agents need **Standard Operating Procedures** the same way humans do, and ACP (the Agent-Client Protocol from Zed) is the emerging substrate that makes those SOPs portable across editors, chat platforms, and CLIs.

**From Jupyter-over-OG-Codex to OpenClaw maintainer.** Honor started building coding harnesses in 2022 — a Jupyter Lab extension over the original Codex (Davinci Code 2) — and that tool Ship-of-Theseus'd into Text Cortex's current production harness. He followed Peter Steinberger since the "Cloud Code is my computer" era, installed OpenClaw at his cluster on day one, and became a maintainer. His first big PR was **Telegram-driven development**, and his current focus is agent interoperability.

**ACP is the "build once, ship everywhere" layer.** The Agent-Client Protocol comes from Zed (Rust editor) and standardizes how a host client (editor, chat, CLI) talks to an agent. It is deliberately **not MCP** — MCP is agent-to-tool, ACP is client-to-agent. Without ACP, every client rebuilds its own plugin for every agent. With ACP, one adapter ships everywhere. Honor chose ACP over the alternative **Agent Protocol** (agent-to-agent) because Zed already had **Codex and Claude Code adapters shipping** — adoption wins over purity.

**ACPX is Honor's Swiss army knife.** A CLI that wraps ACP (and the Codex app-server protocol contributed by Herald) and lets **any agent call any other agent over command line**. The concrete win: **Codex in Discord**. OpenClaw Opus was unreliable for complex coding, so Honor played a telephone game — Opus forwards to Codex via CLI — and then upgraded that hack into a full ACP-backed Discord ↔ Codex bridge. Now a Discord channel binds to a Codex session and the handoff is protocol-native instead of a CLI hack.

**The OpenClaw PR firehose (60K+ PRs, 300-500/day) forced SOP automation.** Peter Steinberger's manual workflow — "is this the best possible fix?" — works but can't scale. 90% of incoming PRs are AI-generated slop descriptions you **can't merge and can't fully discard** (buried feedback). Honor's thesis: abstract the workflow into an explicit SOP — **item comes in → find intent → judge impl → look for conflicts → CI feedback → review feedback → make CI pass** — and **"all this mechanical work should be resolved by the time the PR is in front of you."** Ralph-Wiggum review/refactor loops are shameful-but-useful at surfacing shallow bugs. ACPX's workflow engine runs that SOP against any Codex or Claude Code session and emits structured JSON.

**Disposable agents on Slack/Teams/Discord are blocked by platform design.** Chat platforms allow **one app instance** per installed app, so to run multiple agents you'd need a Slack manifest per agent — painful and unsupported. Until platforms add multi-agent provisioning, Honor uses a different UI for multi-agent work, and at the enterprise tier he built **Spritz**.

**Spritz is Text Cortex's open-source Kubernetes operator for on-demand disposable agents.** A Go operator that runs a concierge agent on Slack plus dispatch agents for tasks. User says "I want to debug X" → concierge spawns a new agent → user gets a website link to the fresh session. Each dispatch agent runs in a **full Kubernetes pod** — "wasteful but better abstraction, because OpenClaw showed the power of giving the agent a full computer." Firecracker / microVMs sit under the pods for isolation. Currently used for error reporting; architecturally it's the enterprise analog of ACPX.

**The personal-to-enterprise agent spectrum is where the inference spend lives.** Honor's closing business framing: personal agents are hobby tooling; enterprise agents are where real inference budgets and revenue sit. ACP, ACPX, and Spritz are the connective tissue from one end of the spectrum to the other — and OpenClaw's architecture is what makes them tractable across both ends.

**Design philosophy — "AI as ointment, but the sum of decisions matters."** Honor frames AI as an ointment you apply generously to any agent-solvable problem, with the self-discipline to take yourself out of the loop. But the caveat: "If you give a sandwich generously, it's going to be a weird sandwich." Taste and judgment about **where not to apply** matters as much as the generous application.

---

## Key Projects / Tools Referenced

| Tool/Project | Context | In Our Catalogue? |
|-------------|---------|-------------------|
| **ACPX** (Honor's CLI) | Swiss-army-knife CLI for ACP — lets any agent call any other agent over command line | No — should add to tool catalogue |
| **ACP (Agent-Client Protocol)** | Zed's protocol for client-to-agent; the foundation of ACPX | No — should add under interop standards |
| **Agent Protocol** | Competing standard for agent-to-agent; Honor passed on it for ACP | No — should add as comparison reference |
| **MCP (Model Context Protocol)** | Anthropic's agent-to-tool protocol; Honor explicitly distinguishes ACP from MCP | Yes — multiple entries |
| **Spritz** (Text Cortex OSS) | Go Kubernetes operator for on-demand disposable dispatchable agents | No — should add to infrastructure/orchestration-platforms |
| **OpenClaw / Cloudbot** | Subject peer project; Honor is a maintainer | Yes — `orchestration-platforms/openclaw.md` |
| **Zed editor** | Origin of ACP; shipped Codex + Claude Code adapters first | No — should add as editor reference |
| **Codex (OpenAI)** | Target of Honor's ACP adapter; the "reliable coder" end of his telephone game | Referenced in other entries |
| **Codex app-server protocol** | Alternative transport ACPX supports; contributed by Herald | No — should add as protocol reference |
| **Text Cortex** | Honor's startup; builder of the Ship-of-Theseus harness and Spritz | No — should add as company reference |
| **Firecracker / microVMs** | Under-the-hood isolation for Spritz dispatch agents | Partially referenced elsewhere |
| **Jupyter Lab + OG Codex (Davinci Code 2)** | Honor's 2022 starting point; pre-ChatGPT coding harness | Historical reference |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://github.com/zed-industries/agent-client-protocol | ACP spec + reference implementation from Zed | `/ingest-article` |
| https://github.com/textcortex/spritz (or similar — verify exact org) | Spritz open-source Kubernetes operator for dispatchable agents | Tool catalogue entry under `infrastructure/` |
| https://github.com/textcortex/acpx (or wherever ACPX is hosted — verify) | ACPX CLI source — the Swiss army knife | Tool catalogue entry |
| https://zed.dev/docs/agent-panel | Zed's agent panel docs — the canonical ACP host example | `/ingest-article` |
| https://github.com/openclaw/openclaw | OpenClaw repo — context for the PR firehose and ACP adapter work | Refresh `orchestration-platforms/openclaw.md` |
| https://textcortex.com | Text Cortex company page — context for the personal-to-enterprise spectrum framing | Company reference |
| Discord-driven development writeup (find if published) | Honor's original Telegram-then-Discord agent channel experiment | `/ingest-article` when found |
| "Cloud Code is my computer" (Peter Steinberger, original article Honor cited) | The founding text for this whole thread of work | `/ingest-article` |

---

## Action Items

- [ ] Add ACPX tool catalogue entry (once repo URL is confirmed) — track as candidate replacement for our tmux-based worker handoff
- [ ] Add ACP (Zed Agent-Client Protocol) under interop standards in the catalogue
- [ ] Add Spritz tool catalogue entry under `infrastructure/` or `orchestration-platforms/` — enterprise dispatch template
- [ ] Encode our orchestrator's review/fix loop as an explicit SOP matching Honor's abstract workflow (intent → judge → conflicts → CI → review → make CI pass); store as `.bmad/sops/review-fix-loop.yaml`
- [ ] Evaluate whether ACP adapter for our tmux orchestrator would replace the `tmux send-keys` handoff layer with a protocol-native one
- [ ] Cross-reference this talk with Peter Steinberger's "State of the Claw" (same conference, same day) — both reference the OpenClaw PR firehose from different angles
- [ ] Cross-reference with Ryan Lopopolo's harness engineering talk (same conference) — SOPs-for-agents is a direct parallel to Lopopolo's "prompts as lint" framing
- [ ] Track Agent Protocol vs ACP adoption over the next 6 months — winner likely decides the agent interop standard

---

## Related Catalogue Entries

- [State of the Claw — OpenClaw Update (Peter Steinberger)](./aie-europe-2026-peter-steinberger-state-of-claw.md) — Same conference, same day. Peter gives the platform-level view; Honor gives the interop-tooling view. Read together.
- [Harness Engineering: Humans Steer, Agents Execute (Ryan Lopopolo)](./aie-europe-2026-ryan-lopopolo-harness-engineering.md) — "Prompts as lint" and "do not produce slop" are sister concepts to Honor's "SOPs for agents."
- [Extreme Harness Engineering (Ryan Lopopolo, OpenAI Frontier)](./ryan-lopopolo-extreme-harness-engineering-openai.md) — Symphony orchestrator is the OpenAI-internal analog of what ACPX/Spritz aim to do in open source.
- [From Chaos to Choreography (Sandipan Bhaumik, Databricks)](./sandipan-bhaumik-chaos-to-choreography-multi-agent-orchestration.md) — Different angle on the same problem: choreography vs orchestration decision matrix.
- [Crashing Out at Anthropic and Getting Pi Pilled (Theo Browne)](./theo-browne-crashing-out-anthropic-pi-pilled.md) — Same conference day; Theo's "less context = better agent" is the Pi-side counterpoint to Honor's SOP-heavy ACPX workflow engine.
