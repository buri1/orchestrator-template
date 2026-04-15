# OpenClaw AMA — Deep Dive with Creator Peter Steinberger

> **Peter Steinberger (Creator of OpenClaw, now at OpenAI) × Swyx (Shawn Wang, AI Engineer conference founder) — AI Engineer Europe 2026 AMA, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=8807s |
| Format | AMA / fireside conversation |
| Speakers | Peter Steinberger (Creator of OpenClaw; founder of PSPDFKit; now at OpenAI); Swyx / Shawn Wang (founder of the AI Engineer conference series) |
| Event | AI Engineer Europe 2026 — OpenClaw AMA |
| Location | London |
| Duration | ~25 min |
| Date | 2026-04-09 |
| Topics | openclaw, open source philosophy, local models, european sovereignty, coding workflow, dark factory, taste, soul.md, personality in agents, prompt injection, dual-llm, dreaming, plugin architecture, ubiquitous agents, future skills, system design, saying no, memory reconciliation |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Context

On-stage AMA at AI Engineer Europe 2026 in London. Swyx interviews Peter Steinberger — creator of OpenClaw, the European consumer-agent harness that the conference (and Malte Ubl's opening keynote) repeatedly named as the European flagship of the harness layer. Peter recently joined OpenAI but keeps OpenClaw independent. The conversation spans sustainability of open source under a big-lab employer, why personality matters for consumer agents, Peter's own coding workflow at peak concurrency, the "iterative > dark factory" debate, taste as the lowest-level quality gate, prompt injection mitigations, Peter's dream "ubiquitous agents" stack, and the skills engineers will need next.

This is the companion piece to Peter's State of Claw talk at the same conference — where State of Claw was the product/architecture update, this AMA is the philosophy and operator-experience deep dive from the same speaker.

---

## Main Thesis

> "Everyone in the industry wins if more people spend time with AI. European at heart — you want to own your data."

Peter's throughline: OpenClaw exists because large US labs and enterprises will structurally never build it. The architecture that consumer agents actually need — personality, local-model friendliness, plugin-replaceable memory, silo bypass via a "clanker" that clicks through CAPTCHAs — could only come from a small European operator with nothing to lose. Sustainability comes from breadth of sponsorship and plugin extensibility, not a single owner. Taste, not scale, is the quality gate. The next engineer skill stack is taste + system design + saying no.

---

## All 12 Talking Points

### 1. Closed Claw concerns — Peter at OpenAI

> "OpenAI wasn't always amazing with open source — but Codex is now open, Symphony was released."

Swyx opens on the obvious tension: Peter joined OpenAI, so does OpenClaw become Closed Claw? Peter's answer:

- OpenAI as an employer provides resources but Peter deliberately limits that involvement to avoid even the appearance of a takeover
- Diversifies deliberately: has brought in Nvidia, Microsoft, Telegram, Salesforce, Tencent, ByteDance, Alibaba, MiniMax, Kim, and others as sponsors or integration partners
- Frames it as industry-wide positive sum: **"Everyone in the industry wins if more people spend time with AI"**
- Cites OpenAI's improving open-source track record as evidence the environment is compatible: Codex is now open, Symphony is released
- Keeps OpenClaw independent from OpenAI's product org

This is important for our own positioning: a single-vendor anchor does not kill an open project as long as governance is distributed and no single sponsor can veto direction.

### 2. Local and open models importance

> "European at heart. You want to own your data."

Peter makes the sovereignty case forcefully:

- OpenClaw is built to run on local models when the user wants privacy or control
- "European-hearted" as a values statement: data ownership is a user right, not a nice-to-have
- **Silo bypass insight**: enterprise integrations (Gmail example) take half a year of legal + API work for any one big company. Consumer OpenClaw can bypass silos entirely because it runs as the user — its "clanker" can click through any "I'm not a bot" verification like a human would
- This unlocks **"much cooler automation use cases that large companies can never do"** — the consumer-as-user agent has zero enterprise-integration friction because it uses the same surfaces humans use
- Implication: the long tail of automation belongs to consumer-agent harnesses, not enterprise agent platforms, because the unit economics of per-integration deals kill enterprise coverage

This maps directly to our OmniPort client work: where enterprise integration is impossible or 6-month blocked, a user-mode agent is the fallback.

### 3. Peter's coding workflow — "prompt request not pull request"

- **Peak parallelism**: 10 simultaneous sessions at one point
- **Current**: ~5-6 sessions in parallel as models and loops get faster
- **The workaround framing**: *"At some point this is not natural that you work on 6 things at the same time. It's a workaround until tokens are faster."*
- Calls his own approach "prompt request not pull request" — he submits prompts to running agents the way others submit PRs to a codebase
- Doesn't view concurrency as an end goal — the goal is low latency on one session, and concurrency is just compensating for current token speeds

Direct implication for our orchestrator: our own 6-worker ceiling is a **transitional architecture**, not a permanent design point. As models get faster, optimal concurrency drops, not rises. Coordination overhead (1.724 exponent) compounds this — Peter's own trajectory (10 → 5-6) is data that the direction of travel is downward, not upward.

### 4. Dark Factory vs Iterative — why full automation is the wrong ambition

> "I don't think you can build good software by specifying everything up front. The way to the mountain is usually never a straight line."

Peter's rejection of the dark-factory / fully-autonomous development vision:

- You cannot build good software by specifying everything up front
- **"The way to the mountain is usually never a straight line"** — the path is curved, shortcuts emerge along the way that you couldn't have seen at planning time
- **"First idea about a project is very unlikely to be the final project"**
- Therefore: iterative development with a human in the loop is not a concession to weak models; it's the correct epistemology
- **Taste is the bottleneck**, not token speed or model capability

This is a direct counter-claim to the Ryan Lopopolo / OpenAI Frontier "1M LOC 0% human review" pitch. Peter is explicitly saying the opposite: the iterative loop is load-bearing and the human in it is load-bearing.

### 5. Taste definition — two levels

**Lowest level: "doesn't stink like AI"**
- Immediately recognizable from UI, writing style, and interaction patterns
- Was purple gradient + corporate tone, now more subtle but still visible
- Your first job is to produce output that doesn't read as AI-generated

**Higher level: delightful details**
- Things AI cannot produce with a high-level prompt alone
- Requires thousands of micro-decisions informed by the product's intent
- Example: **OpenClaw roasts people in startup messages** — a delightful personality detail that you can't prompt into existence; it's the accumulated fingerprint of a maker

Taste isn't a single check; it's a quality filter applied repeatedly at ever-finer grain. The low bar is anti-slop. The high bar is earned personality.

### 6. Soul.md — the key innovation

> "Claude Code already had personality but didn't fit how people would write to you on WhatsApp."

Peter's narrative for why soul.md became load-bearing for OpenClaw:

- **Old paradigm**: chatbots rebuilt Google. No one expected personality from a chatbot because you talked to it like a search engine.
- **New paradigm**: agents arrive via WhatsApp, Telegram, SMS — channels where humans expect other humans, and personality is assumed
- OpenClaw started on WhatsApp specifically because that's where personality matters most
- Claude Code had personality but it was the wrong personality for WhatsApp — it read like a developer tool, not a friend
- **soul.md** encodes the operator's intended personality in a single file that agents read like a system prompt — "**madness with a touch of science fiction**" is the example character brief
- It's how he runs AI projects across all his harness work: define the soul first, the behavior follows

This is why soul.md patterns are spreading across catalogue entries (Cole Medin second brain, felixba tutorial, accomplish.ai) — Peter is the origin point and the mechanism is "surface channel demands personality, files encode personality."

### 7. OpenClaw could only come from someone like Peter

> "Nothing in my personal email would completely kill me... if your company is different, it requires a different approach."

Why a big-US-lab project couldn't ship this:

- **Legal would kill it**: the consumer-clanker-clicks-through-captcha model is legally precarious for any company with enterprise customers to lose
- The core safety problems (prompt injection, exfiltration, unlimited access) aren't *solved* as an industry — but *mitigations* exist that are good enough for a solo operator's personal risk surface
- Peter's personal email contents are his own gamble: nothing in it would "completely kill him" if compromised
- This risk tolerance is impossible for a company with enterprise obligations — liability and reputational risk scale faster than product value
- Therefore the category of "consumer agent with unrestricted user-scope access" is structurally a solo-operator / small-team opportunity

The inversion: OpenClaw's moat isn't technology; it's **Peter's willingness to accept the personal risk** that no company can.

### 8. Dream stack — Ubiquitous agents

Star Trek "computer" is Peter's north star:

- Talk to your agent from anywhere in your home
- **Little iPads in every room**, each a conversational endpoint
- The agent uses OpenClaw's **canvas feature** to project structured output, media, and UI onto the nearest screen
- Phone is the convenient input device but you actually want to talk from anywhere without reaching for it
- Ambient input, ambient output, one continuous agent identity

**Future split — work vs home**:
- `work.openclaw` — enterprise mode, stricter identity, audit logs, tied to employer policies
- `home.openclaw` — personal mode, maximum capability, user-owned data
- These should be able to **talk to each other securely** — a federation protocol between home and work instances so that the work agent can request data from the home agent under explicit user-controlled policy

Map to our work: ambient-everywhere agents + home/work identity split + explicit inter-instance federation is a 2-year roadmap slot. The canvas-on-any-screen idea alone is a product concept.

### 9. Prompt injection — state of the art

- **Frontier models are now good at detecting** random instructions embedded in websites, emails, and document content — a year ago this was trivial to exploit, now it's hard
- **Tagging untrusted content** as such is a working mitigation: mark it, never act on its imperative-mood text without a human confirm for sensitive ops, exfiltration becomes hard
- **The remaining hard problem is unlimited-access surfaces**: group chats, inbound message floods, any channel the operator doesn't control — these still bypass the detection heuristics by sheer volume and novelty
- **Small local models are problematic**: a 20B-parameter model will obediently follow any instruction in its context because it lacks the adversarial training to refuse — OpenClaw **warns the user explicitly** if they point it at a small local model
- Peter cites **Simon Willison's dual-LLM approach** as a smart architecture pattern — have one privileged model that never sees untrusted content, mediated by a quarantined model that does
- Peter has his own ideas on the topic but has not announced them yet

### 10. Future skills for engineers

Peter's ranked list, most important first:

1. **Taste** — the ability to recognize good output from slop, at every level of abstraction. The foundational skill.
2. **System design** — *"If you don't think about boundaries, you swipe yourself into a corner."* Understanding module boundaries, interfaces, and where to cut the system so that each piece is prompt-addressable.
3. **Saying NO** — *"Even the wildest idea is a prompt away. But this + this + this + this fitting together is the problem."* The scarce resource is not implementation time anymore; it's the judgment to **not** build things that would break the system's coherence.
4. **Big picture thinking, sync, understanding** — keeping the whole product model in your head as the AI expands the surface area faster than you can read

Note the inversion from classical SWE skill lists: no coding, no debugging, no algorithms. Those are prompt-addressable now. What's left is what can't be delegated — aesthetic judgment, architecture sense, and the willpower to refuse features.

### 11. Dreaming — memory reconciliation

Peter's "dreaming" feature, already live in OpenClaw and reportedly being built by Anthropic too (per the source-code leak):

- At rest, the agent **reconciles memories** from its session logs
- Produces a **dream log** — a structured summary of what happened, what mattered, what contradicts what
- **Analogous to biological sleep**: brain garbage collection, consolidating short-term to long-term, pruning everything that didn't rise to significance
- Converts ephemeral session logs into long-term memory in a background pass, rather than on-demand
- Drops memories that didn't survive the reconciliation pass

Pattern match: this is exactly the episodic → working → procedural compaction loop in CASS Memory System (catalogue). Peter converges on the same architecture independently. If Anthropic is also building it (source leak confirms), expect this to become the default memory pattern across harnesses within 2 quarters.

### 12. Plugin architecture — everything is replaceable

> "Like Linux — you install your own parts."

The governance + extensibility argument:

- **Memory is a plugin**. Wiki is a plugin. Dreaming is a plugin. Personality is a plugin (soul.md). Connector is a plugin.
- Users can swap any of these without touching core
- **Don't need to send PRs for experiments** — experiments live in plugins, not in the trunk
- The Linux analogy is explicit: OpenClaw is a kernel + package manager, not a monolith
- This makes OpenClaw a substrate for community experimentation, not a product

Why this matters for sustainability: the contributor economics improve by an order of magnitude when experiments don't require core-commit access. Peter doesn't have to review every idea. Users don't have to wait. The trunk stays small and auditable.

---

## Notable Quotes

> "Everyone in the industry wins if more people spend time with AI."

> "European at heart. You want to own your data."

> "Much cooler automation use cases that large companies can never do."

> "At some point this is not natural that you work on 6 things at the same time. It's a workaround until tokens are faster."

> "I don't think you can build good software by specifying everything up front."

> "The way to the mountain is usually never a straight line."

> "First idea about a project is very unlikely to be the final project."

> "Doesn't stink like AI."

> "Madness with a touch of science fiction."

> "Saying no is becoming more and more important."

> "If you don't think about boundaries you swipe yourself into a corner."

> "Even the wildest idea is a prompt away. But this + this + this + this fitting together is the problem."

> "I still remember Simon Willison saying he's been doing it 2 years and still figuring out what works."

> "Understanding the theory will not make you better at using the tools."

> "Like Linux — you install your own parts."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | This is the closest thing we have to a manifesto from the creator of the European harness-layer flagship, given on the same stage where Malte Ubl's opening keynote explicitly named OpenClaw as the European leader. Peter's iterative-over-dark-factory stance, 10→5-6 concurrency trajectory, soul.md origin story, dreaming memory pattern, and plugin governance all map directly onto decisions we are making right now in the orchestrator. The "saying NO" skill ranking is the most pointed advice for our own backlog discipline. |
| **Novelty** | 7/10 | Individual points appear elsewhere (soul.md from felixba/Cole Medin, dreaming from CASS, plugin-everything from Letta, taste-as-bottleneck from obra Superpowers). What's novel: all of these being the consistent worldview of one operator, the explicit "10→5-6 is a workaround until tokens are faster" data point, the "big US labs structurally can't ship this" governance insight, the clanker-clicks-through-captcha silo-bypass framing, and the Star Trek work/home federation dream stack. |
| **Actionable** | 8/10 | Immediate actions: (1) audit our own worker-count ceiling against Peter's 10→5-6 trajectory — we may be over-provisioned; (2) treat soul.md as load-bearing for WhatsApp/Telegram client touchpoints in OmniPort; (3) mark untrusted content in ingest pipeline inputs (articles, social posts) explicitly before any agent acts on them; (4) apply "saying NO" as an explicit orchestrator gate before spawning new workers; (5) adopt plugin governance framing for our skills/hooks/commands — reduce trunk commits, route experiments to plugin dirs; (6) schedule dreaming / memory reconciliation as a SessionEnd hook using our existing devlog and state files as the raw session log input. |

---

## Adoptable Patterns for Orchestrator Research

| # | Pattern | Source | Effort | Impact |
|---|---------|--------|--------|--------|
| 1 | **Concurrency as Workaround, Not Goal** — Document the 6-worker ceiling in the orchestrator as a transitional architecture explicitly tied to current token speeds. Expect optimal concurrency to decrease, not increase, as models get faster. Review ceiling quarterly. | Peter (10→5-6 trajectory) | S | High |
| 2 | **Saying NO Gate Before Spawn** — Add an explicit "should we build this at all?" check in the orchestrator loop before GET_NEXT_TASK → SPAWN_WORKER. Implement as a roadblock-style question against the project-dna.yaml and current backlog coherence. | Peter (saying NO skill) | M | High |
| 3 | **Untrusted Content Tagging in Ingest Pipeline** — Mark article body text, social post text, and any scraped content as untrusted in the ingestion discovery sidecars. Downstream agents must not act on imperative-mood text from untrusted regions without operator confirmation. | Peter (prompt injection mitigations) + Simon Willison dual-LLM | M | High |
| 4 | **Small-Model Warning Banner** — When an operator points the orchestrator at a small local model (20B or below), emit a loud warning about prompt-injection susceptibility and refuse certain high-risk tool classes by default. | Peter (OpenClaw small-model warning) | S | Medium |
| 5 | **Soul.md per Client Channel** — For OmniPort WhatsApp/Telegram touchpoints (and any future consumer-surface agent), author a soul.md per channel encoding the voice, refusal style, and personality. Separate from technical system prompts. | Peter (soul.md origin story) | S | High |
| 6 | **Dreaming as SessionEnd Hook** — Schedule a memory reconciliation pass on SessionEnd / PreCompact that reads devlog.md and the day's state diff, produces a dream log with what-mattered / what-conflicted / what-to-drop, and appends to long-term memory. | Peter (dreaming feature) + CASS + Anthropic leak | M | High |
| 7 | **Plugin Directory with Lower Bar for Experiments** — Formalize `.claude/plugins/` (or equivalent) as an experimentation surface where new hooks, skills, and commands can live without trunk-level review. Only promote to trunk after observed use. | Peter (plugin architecture) | M | Medium |
| 8 | **Iterative-Over-Dark-Factory Positioning** — In client conversations and the pi-orchestrator public framing, explicitly reject "full automation" marketing and lead with "iterative with taste as the bottleneck" as the credible pitch. Aligns with German enterprise buyer skepticism. | Peter (iterative thesis) | S | Medium |
| 9 | **Work/Home Federation Thought Experiment** — Document a future state where the orchestrator exposes a `work.orchestrator` vs `home.orchestrator` split with explicit federation boundaries for cross-context memory sharing. Not immediate, but earmark for 2-year roadmap. | Peter (dream stack) | L | Low |
| 10 | **Canvas Output Surface** — Investigate an OpenClaw-style canvas pattern where structured agent output is routed to the nearest available screen (cmux tab, Chrome DevTools panel, Obsidian note) instead of terminal scrollback. | Peter (ubiquitous agents dream) | M | Medium |

---

## Connection to Other Catalogue Entries

| Related Entry | Connection |
|--------------|-----------|
| [State of the Claw (Peter Steinberger, AIE Europe 2026)](./aie-europe-2026-peter-steinberger-state-of-claw.md) | **Direct pair.** Same speaker, same conference, same day. State of Claw = product/architecture update; this AMA = philosophy/operator worldview. Read as one unit. |
| [AI Engineering as the Successor to Web Development (Malte Ubl)](./aie-europe-2026-malte-ubl-ai-engineering-successor-web-dev.md) | Ubl's opening keynote at the same conference names OpenClaw/Peter as the European flagship. This AMA is the deep dive from the speaker Ubl cited. Read together: Ubl = strategic framing, Peter = operator worldview. |
| [Frontier AI (Raia Hadsell, DeepMind)](./aie-europe-2026-raia-hadsell-frontier-ai-deepmind.md) | Same conference, same day. Hadsell is frontier-research; Peter is operator-harness. Two sides of the same AIE Europe 2026 stage. |
| [OpenClaw (orchestration-platforms)](../../orchestration-platforms/openclaw.md) | Core platform entry. This AMA provides the "why" behind the architectural decisions cataloged there. |
| [Peter Steinberger / steipete (practitioner)](../../practitioners/steipete.md) | Speaker profile. This AMA is the richest single source for Peter's worldview in the catalogue. |
| [Crashing Out at Anthropic and Getting Pi Pilled (Theo Browne)](./theo-browne-crashing-out-anthropic-pi-pilled.md) | Theo's talk at the same conference discusses Anthropic's OpenClaw ban as part of the disaster week. Peter's AMA is from the other side of that ban. |
| [Extreme Harness Engineering (Ryan Lopopolo, OpenAI Frontier)](./ryan-lopopolo-extreme-harness-engineering-openai.md) | **Direct counter-thesis**. Lopopolo = 1M LOC with 0% human review (dark factory). Peter = iterative with taste as the bottleneck, human in the loop. Same industry, same period, opposite conclusions. |
| [Mattshumer Memory Systems (OpenClaw + Hermes)](../../posts/2026-04/mattshumer-memory-systems-openclaw-hermes.md) | Independent confirmation of OpenClaw's memory system innovations. |
| [Felixba KI Leben Satire (OpenClaw rogue agent)](../2026-04-01_felixba-ki-leben-satire-openclaw.md) | Satirical German tutorial that accidentally validates Peter's "unlimited access is the hard problem" point by showing the failure mode. |
| [Elvissun OpenClaw Codex Swarm Setup](../../posts/2026-03/elvissun-openclaw-codex-claude-agent-swarm-setup.md) | Concrete community setup of OpenClaw + Codex + Claude agents. Shows the plugin architecture in practice. |
| [CASS Memory System](../../agent-memory/cass-memory-system.md) | Three-layer episodic→working→procedural reconciliation. Peter's dreaming feature is the same architecture reached independently. |
| [Superpowers (obra)](../../agent-harnesses/superpowers.md) | Taste-as-quality-gate thesis. obra = TDD enforcement + two-stage review; Peter = "doesn't stink like AI" + delightful details. Different enforcement mechanisms, same ethic. |
| [Cole Medin AI Second Brain](./cole-medin-ai-second-brain-claude-code.md) | SOUL.md/USER.md/MEMORY.md layering. Cole's layering and Peter's soul.md converge — this AMA is the origin story. |
| [Dual-LLM pattern (Simon Willison)](../2026-03/simon-willison-agentic-engineering-pragmatic-summit.md) | Peter cites Simon's dual-LLM approach by name as a smart mitigation. |
| [Orchestration > Autonomy (Pawel Huryn)](../../posts/2026-04/pawelhuryn-orchestration-over-autonomy.md) | Same thesis from a different angle: orchestration beats pure autonomy, iterative beats dark factory. |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| [State of the Claw (already catalogued)](./aie-europe-2026-peter-steinberger-state-of-claw.md) | Companion product/architecture talk at the same conference — already ingested; read as a pair with this AMA | Already catalogued |
| https://simonwillison.net/2023/Apr/25/dual-llm-pattern/ | Simon Willison's dual-LLM pattern that Peter cites | Reference doc — may already be catalogued |
| Anthropic source code leak coverage (dreaming feature) | Peter cites the leak as confirmation that Anthropic is building memory reconciliation | Cross-reference to latentspacepod leak compilation |
| OpenClaw plugin directory / marketplace (if public) | Concrete examples of the plugin architecture Peter describes | Tool catalogue entry |
| soul.md specification (if authored anywhere) | The origin artefact for the spreading soul.md pattern | Reference doc |
| work.openclaw / home.openclaw federation (future) | 2-year roadmap artefact worth tracking | Watchlist |

---

## Key Numbers

- **~25 min** AMA duration
- **10** peak simultaneous sessions in Peter's coding workflow
- **5-6** current simultaneous sessions
- **20B** parameter threshold below which OpenClaw warns about prompt injection
- **10+** named sponsors/partners (Nvidia, Microsoft, Telegram, Salesforce, Tencent, ByteDance, Alibaba, MiniMax, Kim, OpenAI, ...)
- **6 months** typical legal+API lead time for an enterprise Gmail-class integration (Peter's example of what the clanker bypasses)
- **2 years** Simon Willison has been doing agentic engineering and still figuring out what works (Peter's reference)

---

## Cross-Reference: State of Claw

Peter gave two talks at AI Engineer Europe 2026 in London on 2026-04-09: **[State of the Claw](./aie-europe-2026-peter-steinberger-state-of-claw.md)** (product/architecture update) and this **OpenClaw AMA** (philosophy/operator worldview) moderated by Swyx. They should be read as a pair:

- **State of Claw** — what shipped, what's next, what the architecture looks like today. Covers: 30K PRs + 2K contributors in 5 months, 1,142 security advisories (16.6/day), Ghost Claw DPRK supply chain attack, 5 sandbox escapes via unnerfed Codex, Lethal Trifecta, Open Claw Foundation (Ghostty-modeled governance), "OpenAI bought my soul.md, not OpenClaw".
- **OpenClaw AMA (this entry)** — why the architecture is that way, what the tradeoffs were, where the worldview comes from. Covers: iterative > dark factory, taste-as-bottleneck, 10→5-6 concurrency trajectory, soul.md origin story, "saying NO" as top engineer skill, dreaming memory reconciliation, plugin-everything governance, Star Trek dream stack.

The two talks share the same speaker and the same governance thesis (solo-operator risk tolerance + broad sponsorship + plugin extensibility) but State of Claw is the **product receipts** and this AMA is the **operator manifesto**.
