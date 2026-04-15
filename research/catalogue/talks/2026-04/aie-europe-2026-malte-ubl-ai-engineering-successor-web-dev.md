# AI Engineering as the Successor to Web Development

> **Malte Ubl (CTO, Vercel) — AI Engineer Europe 2026 Opening Keynote, London, 2026-04-09**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=O_IMsEg91g8&t=1450s |
| Speaker | Malte Ubl — CTO of Vercel; 25+ years software engineering (ex-Google, now Vercel); previously ran JSConf Berlin; shipped Vercel AI SDK (10M+ weekly downloads), chat SDK, and "just bash" TypeScript bash interpreter for agent sandboxes |
| Event | AI Engineer Europe 2026 — Opening Keynote |
| Location | London |
| Duration | ~18 min |
| Date | 2026-04-09 |
| Topics | ai engineering, agent archetypes, saas apocalypse, engineer renaissance, agents as users, harness security, europe leadership, model commoditization, cli-first design, software economics, elasticity, vercel ai sdk, pi agent, openclaw |

---

## Burak's Notes

> *(Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours -- agents won't overwrite it.)*

---

## Main Thesis

> "AI engineering is the legitimate successor to web development as a really mainstream discipline of engineering that will shape the next decade of software development."

Web dev shaped 2005-2025. AI engineering will shape 2025-2035. This is Ubl's framing for the entire keynote -- not a niche, not a toolkit, but the dominant mainstream discipline for the next decade.

---

## Key Takeaways

1. **Agents are a new kind of software** — Not all automation was economically viable with traditional software. Agents change the math. The Venn diagram of "software that should exist" is far larger than "software that could exist". AI agents fill out that larger circle because the cost-per-automation collapses.

2. **SaaS Apocalypse vs Engineer Renaissance are two sides of the same coin** — "We are speedrunning an experiment in the economics of how elastic the software market is." The cheaper software is to make, the more of it we'll make. Demand for software engineers goes UP, not down, because elasticity dominates.

3. **Four agent archetypes are working in the wild today**:
   - **Agent-as-a-Service** (Sierra, Decagon): automate team support roles; sold as a service
   - **Compress the Research**: business event → research → human decision. Replace the research phase with an agent. Vercel runs two such agents internally (contact-sales routing at 75% auto-handled, abuse report analysis)
   - **Surface information that exists**: data is there but not actionable (issue trackers, Slack, Granola recordings). "Why doesn't an agent already have the updates?"
   - **"What do you hate most about your job"**: Vercel's in-house support agent hit 90% deflection rate; job satisfaction exploded because the team no longer does boring work

4. **The inversion: software itself is now used by agents** — "60%+ of page views on vercel.com in the last 7 days were AI agents." Usage is shifting from dashboard clicking to API/CLI consumption. Ubl's product heuristic: "Whenever I see a UI feature proposal, I ask: what's the CLI?"

5. **Security is a 1999-era nightmare again** — "It almost feels like 1999 where really everything can be hacked." Current agent harnesses combine the process running the harness with the process running the generated code. Wrong architecture. Anthropic's new agent product separates them -- that separation is the right pattern.

6. **Europe leads AI engineering (narrative violation)** — While Europe won't lead on the model side, it dominates the application/harness layer:
   - Vercel AI SDK led by Las GML (Berlin)
   - Pi coding agent by Mario Zechner (Austria)
   - OpenClaw by Peter Steinberger (Vienna)
   - "Europe won't play a major role on the MODEL side but doesn't need to"

7. **Two possible futures, one more likely**:
   - **Lab dominance**: Big model labs win → AI stays expensive → all value accrues to them → app engineers become forward-deployed engineers for the labs
   - **Commoditization (more likely)**: Models commoditize → Google plays amazing role with cheapest infra → application layer is where innovation happens → "Engineers are the powerful ones"

---

## The Four Agent Archetypes (Detailed)

### 1. Agent-as-a-Service
Sierra, Decagon and similar companies sell agents that replace entire team support functions (customer support, triage, ops). Sold as a service with SLAs. This is the most visible archetype publicly because it has clean go-to-market.

### 2. Compress the Research
The general pattern: **business event → research phase → human decision → action**. Traditional software can automate the "event" and "action" bookends but the research step requires judgment. Agents replace the research step -- the human still makes the decision but faster and on pre-digested inputs.

Vercel's own examples:
- **Contact sales routing**: 75% of incoming contact-sales events are auto-handled end-to-end by an agent that researches the lead, qualifies them, routes them, and sometimes closes without human intervention.
- **Abuse report analysis**: Incoming abuse reports are researched by an agent that surfaces the verdict for a human reviewer.

### 3. Surface Information That Exists
The data already exists -- issue trackers, Slack threads, Granola meeting recordings, wikis -- but it's not actionable without a human to go find it. Agents make it actionable proactively. Ubl's rhetorical question: "Why doesn't an agent already have the updates?" When someone asks "what's the status of X?", an agent should be able to answer without any human having to prepare anything.

### 4. "What do you hate most about your job?"
The cheapest, highest-leverage archetype. Walk up to employees, ask what they hate, automate that. Vercel's in-house support agent was built this way:
- **90% deflection rate** on inbound tickets
- **Job satisfaction exploded** because the team no longer does boring repetitive work
- The team now works on the interesting 10%

This is the "low-hanging fruit" path. Ubl closes with it: "Don't just automate the most advanced agents. There's so much low-hanging fruit to save millions/billions without massive changes."

---

## The Inversion: Agents Are Users Now

Ubl's concrete data point: **60%+ of page views on vercel.com over the last 7 days were AI agents.**

This is not theory. It is already happening. Consequences:
- Usage patterns shift from dashboard clicking to API and CLI consumption
- Documentation must be written for agent consumption (structured, machine-parseable, linkable)
- UI features increasingly need CLI equivalents because the "user" can't click
- **Product heuristic**: "Whenever I see a UI feature proposal, I ask: what's the CLI?"

This inverts a decade of web development assumptions. The web was built for humans; the web is now mostly used by agents.

---

## Security: 1999 All Over Again

> "It almost feels like 1999 where really everything can be hacked."

Ubl's architectural critique: **current agent harnesses co-locate the harness process and the generated-code execution process**. This means a prompt injection that causes the agent to write malicious code can immediately execute it in the same trust boundary as the harness itself. There is no isolation.

The correct pattern: **separate the harness process from the code execution process**. Anthropic's new agent product does this. Ubl holds it up as the example of what the industry should do.

Implications for our orchestrator: worker agents running `--dangerously-skip-permissions` in tmux share the user's full filesystem and credential scope. The harness (us) and the generated code (worker output) are not isolated. This is the exact architectural anti-pattern Ubl is calling out.

---

## Europe Leads AI Engineering

Ubl deliberately positions this as a "narrative violation" -- the common take is that Europe is behind in AI. His counter-claim: Europe is behind on the model side (which doesn't matter long-term) but is the leader on the engineering layer that will actually capture value.

Named examples:
- **Vercel AI SDK** (10M+ weekly downloads) led by Las GML in Berlin
- **Pi coding agent** by Mario Zechner in Austria
- **OpenClaw** by Peter Steinberger in Vienna
- Implicitly: the entire AI Engineer Europe conference itself, happening in London

Ubl's framing: "Europe won't play a major role on the MODEL side but doesn't need to" -- because the application layer is where innovation happens in the commoditization future (which he thinks is more likely).

This maps directly to our own positioning: we are European (DE/AT), we build on the harness layer, and we focus on application-layer value capture. Ubl is validating the strategic premise.

---

## The Two Futures

### Future A: Lab Dominance
- Big model labs (OpenAI, Anthropic, Google) keep winning
- AI stays expensive, prices don't come down
- All value accrues to the labs
- Application engineers become "forward deployed engineers" for the labs (glorified integrators)
- Less innovation at the app layer because the economics don't support it

### Future B: Commoditization (Ubl thinks this is more likely)
- Model companies commoditize (many good-enough models)
- Google plays an "amazing role" with the cheapest infrastructure
- Prices collapse; inference becomes a utility
- The application layer is where all innovation happens
- "Engineers are the powerful ones"
- Europe's harness/app focus becomes the winning position

Ubl is optimistic about Future B and frames the entire talk as preparation for it.

---

## Notable Quotes

> "AI engineering is the legitimate successor to web development as a really mainstream discipline of engineering that will shape the next decade of software development."

> "Agents are a new kind of software."

> "We are speedrunning an experiment in the economics of how elastic the software market is. The cheaper it is to make software, the more software we're going to make."

> "60%+ of page views on vercel.com in the last 7 days were AI agents."

> "Whenever I see a UI feature proposal, I ask: what's the CLI?"

> "It almost feels like 1999 where really everything can be hacked."

> "Europe is the leader in AI engineering innovation."

> "The next generation of junior engineers are going to be so much better at this discipline because they get molded in the AI world."

> "Don't just automate the most advanced agents. There's so much low-hanging fruit to save millions/billions without massive changes."

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 9/10 | Strategic framing talk from the CTO of Vercel validates our exact positioning: European, harness-layer focused, application-layer value capture, CLI-first design. The four agent archetypes give us a concrete product taxonomy for client work (OmniPort, ingestion, research). The harness security critique directly applies to our tmux+dangerously-skip-permissions architecture. The "agents as users" inversion affects how we think about devlog, state files, and worker outputs. The two-futures framing helps us decide where to invest (application layer, not model layer). |
| **Novelty** | 7/10 | Many points (agents as software, engineer renaissance, CLI-first) have been made before by others (Karpathy, Willison, Chase). What's novel: the 60%+ agent traffic data point, the four-archetype taxonomy is cleaner than most, the explicit "harness and code execution must be separated" security argument, and the Europe narrative violation with named examples. The compress-the-research archetype is the sharpest single insight. |
| **Actionable** | 8/10 | Immediately actionable: (1) use four-archetype taxonomy to classify and prioritize client opportunities, (2) audit our harness for harness/exec co-location (we have it -- this is a known weakness), (3) apply "what's the CLI?" heuristic to every UI feature in OmniPort and orchestrator dashboards, (4) apply the "what do you hate most" heuristic to identify low-hanging fruit for clients, (5) enforce agent-parseable output format in devlog.md and state files now that 60%+ of consumers are agents. |

---

## Adoptable Patterns for Orchestrator Research

| # | Pattern | Source | Effort | Impact |
|---|---------|--------|--------|--------|
| 1 | **Four-Archetype Client Intake Taxonomy** — When evaluating a client request, explicitly classify it as (a) agent-as-a-service, (b) compress-the-research, (c) surface-existing-info, or (d) automate-hated-work. Shapes pricing, scope, and architecture. | Ubl | S | High |
| 2 | **"What's the CLI?" Design Heuristic** — Every UI feature proposal in OmniPort, dashboards, or admin panels must have a CLI/API equivalent because agents will be the primary consumers. | Ubl | S | High |
| 3 | **Harness/Exec Process Separation** — Separate the process running the orchestrator from the process running worker-generated code. Our current tmux-in-same-trust-boundary model is the anti-pattern Ubl calls out. Candidate solutions: per-worker container, per-worker user account, or VM isolation. | Ubl + Anthropic | L | Critical |
| 4 | **Compress-the-Research as Product Template** — For client opportunities, look for "business event → research → human decision" flows and pitch agent replacement of the research phase only. Keeps humans in the loop for the decision, which is sellable to conservative buyers. | Vercel (contact sales routing, abuse reports) | M | High |
| 5 | **"What Do You Hate Most?" Client Discovery Question** — On every client call, ask the team what they hate most about their jobs. The answer is the highest-ROI agent target. Vercel's 90% deflection + exploding satisfaction is the proof point. | Vercel (in-house support agent) | S | High |
| 6 | **Agent-Parseable Devlog/State Files** — If 60%+ of consumers of vercel.com are agents, then 100% of consumers of our devlog.md and state JSON are agents. Optimize formatting, structure, and link density for agent consumption, not human reading. | Ubl (inversion principle) | S | Medium |
| 7 | **Europe Positioning as Strategic Asset** — Explicit DE/AT positioning in sales conversations; Ubl's narrative violation gives us permission to lead with location rather than hide it. Supports OmniPort-HH (Hildesheim/KfW) gov-sector pitch. | Ubl (Europe section) | S | Medium |
| 8 | **Track Elasticity Metric** — Measure the ratio of "software ideas proposed" to "software built" for clients. Ubl's thesis predicts this ratio will collapse; we should be able to observe it in our own pipeline. | Ubl (elasticity thesis) | M | Low |

---

## Connection to Other Catalogue Entries

| Related Entry | Connection |
|--------------|-----------|
| [Extreme Harness Engineering (Lopopolo)](./ryan-lopopolo-extreme-harness-engineering-openai.md) | Lopopolo proves the "harness is hard" engineering reality; Ubl frames the strategic/economic significance. Read together: Lopopolo = how, Ubl = why. |
| [Crashing Out at Anthropic and Getting Pi Pilled (Theo Browne)](./theo-browne-crashing-out-anthropic-pi-pilled.md) | Same named examples (Pi by Mario Zechner, OpenClaw by Peter Steinberger) as proof of European harness-layer leadership. |
| [Pi CEO Agents (IndyDevDan)](../2026-03/indydevdan-pi-ceo-agents-claude-1m-context.md) | Pi (Austria) is Ubl's marquee example of European AI engineering leadership. |
| [Jensen Huang Panel (NVIDIA GTC)](../2026-03/jensen-huang-panel-nvidia-gtc-2026.md) | Jensen: "harness engineering is the decisive capability factor" matches Ubl's Europe/application-layer thesis. |
| [Context Engineering (Harrison Chase)](../2026-03/harrison-chase-context-engineering-sequoia.md) | Chase's "everything is context engineering" = Ubl's "AI engineering as successor to web dev". Same discipline, different framings. |
| [23 AI Trends (Greg Isenberg)](./2026-04-01_greg-isenberg-23-ai-trends.md) | Isenberg's "Agent Economy replaces API Economy" directly supports Ubl's "agents are users now" inversion. |
| [Agentic Platform Engineering (Microsoft)](../../articles/2026-03/agentic-platform-engineering-github-copilot.md) | Another "application layer where innovation happens" validation. |
| [Orchestration > Autonomy (Pawel Huryn)](../../posts/2026-04/pawelhuryn-orchestration-over-autonomy.md) | Harness-layer focus = orchestration over raw autonomy. Same thesis. |

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://sdk.vercel.ai/ | Vercel AI SDK — the Las GML (Berlin) project Ubl cites as Europe's flagship | Tool catalogue entry |
| https://github.com/vercel/ai | AI SDK source; reference implementation for multi-provider TypeScript agent dev | Tool catalogue entry |
| https://vercel.com/blog (look for posts on contact-sales agent, abuse report agent) | Vercel's own case studies on compress-the-research archetype | `/ingest-article` |
| https://ai.engineer/europe-2026 | Conference index; other talks from AIE Europe 2026 likely relevant | Event tracking |
| Anthropic's "new agent product" (unnamed by Ubl, likely Claude Code cloud or Skills platform) | Concrete reference architecture for harness/exec separation | `/ingest-article` when identified |

---

## Key Numbers

- **~18 min** talk length
- **60%+** of vercel.com page views are AI agents (last 7 days)
- **75%** of Vercel contact-sales auto-handled by agent
- **90%** deflection rate on Vercel in-house support agent
- **10M+** weekly downloads of Vercel AI SDK
- **25+** years of software engineering experience (Ubl)
- **$5B-$50B** range of "low-hanging fruit" value Ubl alludes to
