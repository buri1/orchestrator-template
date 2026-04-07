# My Plan to Automate 98% of My Business Using an Army of AI Corporate Zombies

> **Felix Tay — YouTube (Felix Tay / FTayAI), 2026-03-06**

| Field | Value |
|-------|-------|
| Source | https://www.youtube.com/watch?v=ak6bGRYm6Uk |
| Speaker | Felix Tay — Solopreneur, Creator of NEO & Nex |
| Event | YouTube Channel (Felix Tay) |
| Duration | 34:44 |
| Date | 2026-03-06 |
| Topics | business automation, solopreneur scaling, Claude Code wrapper, agentic pipelines, context amnesia, multi-agent loops, content automation, retention systems |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas triggered by this talk. This section is yours — agents won't overwrite it.]*

---

## Key Takeaways

1. **Three-pillar automation framework (Traffic/Sales, Retention, Product Development)** — Felix breaks his entire solopreneur business into exactly three operational domains and maps each to concrete agentic pipelines. This mirrors our federated business-line thinking but at the individual solopreneur scale. His target: automate from 80% to 98% of income-generating activities, leaving only "make videos" and "build cool stuff."

2. **Nex is a Claude Code wrapper (OpenClaw clone on Agent SDK)** — Felix is building "Nex," a Claude Code harness that uses Agent SDK (not Anthropic's AI SDK) to avoid the licensing issues OpenClaw ran into. He explicitly discusses model-agnostic design so he can switch to Codex if needed. This validates the harness-over-framework approach and the Claude Max arbitrage play.

3. **The Dojo: 5-agent recursive loop for curing Context Amnesia** — The most architecturally interesting concept. Five named agents (Neo, Trinity, Morpheus, Oracle, Smith) form a training loop: Trinity stress-tests Neo across thousands of conversation turns, Morpheus monitors quality, Oracle maintains prompt/architecture history and suggests improvements, Smith injects adversarial challenges. This is a self-improving system for long-context memory fidelity.

4. **Cron-driven agent pipelines with human-in-the-loop approval gates** — All automation pipelines (YouTube content, trending topics, lead magnets, sales campaigns, bug triage) follow the same pattern: agent does research/generation, presents output for human approval, then executes autonomously on approval. Cron-scheduled, not event-driven.

5. **Computer-use agents unlock previously impossible automations** — Felix specifically calls out that YouTube upload, Facebook posting to personal profiles (not pages), and cross-platform publishing were previously impossible because platforms blocked third-party tools. Computer-use agents bypass these restrictions entirely.

---

## Relevance to Our System

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance** | 7/10 | Direct parallel to our solopreneur scaling vision; validates Claude Code wrapper approach and multi-pipeline automation. Less technically deep than our architecture work, but strong validation of the business model and operational patterns. |
| **Actionable** | 5/10 | The Dojo concept is novel and worth studying for our own agent training/QA loops. Pipeline patterns are fairly standard (cron + approval gates). Nex/Agent SDK distinction is useful context for compliance positioning. |

---

## Summary

Felix Tay presents his roadmap to automate 98% of his solopreneur business operations by end of 2026 using what he calls "AI Corporate Zombies" — isolated Claude Code instances operating as departmental heads across his business.

The talk is structured around three operational pillars. **Traffic & Sales** encompasses four automated pipelines: (1) a YouTube content pipeline that fires 3x/week — agent does topic research, Felix shoots the video, agent handles transcription, thumbnails, titles, descriptions, timestamps, email newsletters, blog posts, social media repurposing, and ongoing performance optimization via A/B testing of thumbnails/titles/metadata; (2) a trending topics pipeline that fires daily, creating threads and long-form content in Felix's voice and philosophy for top-of-funnel discoverability; (3) a prospect/lead magnet pipeline that fires weekly, monitoring video performance and automatically building opt-in pages, delivery emails, and welcome sequences for high-performing topics; (4) a sales pipeline handling offer writing, campaign launches, email management, and follow-ups.

**Retention** covers four areas: pacing (showing members what's next), Q&A (agents presenting community questions directly via chat rather than requiring website navigation), adding value through content, and monthly workshops. Felix also describes an automated bug triage system for his NEO app where an agent lives in his WhatsApp group, compiles bug reports, performs automatic investigation, and presents an executive summary with proposed fixes each morning.

The most technically interesting section covers **Nex** (his Claude Code wrapper) and **The Dojo** (a 5-agent recursive training loop). Nex is positioned as an OpenClaw-style clone built on Claude's Agent SDK rather than the AI SDK, which Felix claims avoids the compliance issues that got OpenClaw flagged. He's designing it to be model-agnostic as a hedge. The Dojo is a self-improving system for training NEO's conversational abilities across thousands of turns — using Trinity (synthetic user/Karen), Morpheus (QC monitor), Oracle (system prompt historian/architect), and Smith (adversarial challenger) in a continuous loop that aims to solve "AI Context Amnesia" for very long conversations.

Felix is refreshingly honest about being in the planning/building phase rather than presenting completed work. He positions the channel as a documentation of his journey rather than a retrospective on proven systems. He currently has 80% AI-driven operations and is pushing toward 98%.

---

## Notable Quotes

> "The ability to scale a business without scaling headcount is now an engineering reality. It used to be that when you hit a revenue wall, you must hire humans to handle the operational drag. That just shrinks your margins and adds management complexity." — 0:00

> "I am building an AI Corporate Army. By using isolated Claude Code instances as departmental heads, I am automating 98% of my traffic, sales, and retention pipelines by December 2026." — 0:00

> "Agents can actually control the computer now. So I'm going to get my agent to control my computer and upload all of these things for me while I sleep." — ~8:00

> "The more websites that we actually have to navigate, the less focus that we have. So by having everything into one interface that I have in my AI, it's an incredible amount of relief that it brings to my attention span." — ~16:00

> "It's not just like 12 turns, 30 turns. It's not even 100 — it's thousands of turns. It's a very long single conversation. And as most context engineers know, very long conversations tend to make the AI not do very well." — ~26:00

> "Neo is going to be that person who you can depend on for the harsh truth. That is the entire basis of Neo." — ~25:00

---

## Deep Dive Candidates

| URL | Why | Suggested Ingest |
|-----|-----|-----------------|
| https://augmented-intelligence.app.clientclub.net/communities/groups/augmented-intelligence/ | Felix's free AI community — may contain implementation details and member discussions about Nex/Dojo patterns | `/ingest-article` |
| https://meetneo.app | NEO app itself — worth evaluating the memory architecture and coaching prompt patterns | `/tool-catalogue` |
| https://twitter.com/FTayAI | Felix's X account — may have additional technical threads about Nex and The Dojo | `/ingest-post` |

---

## Referenced Tools/Projects

| Tool/Project | Mentioned Context | In Our Catalogue? |
|-------------|-------------------|-------------------|
| Claude Code | Primary harness; "isolated Claude Code instances as departmental heads" | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) |
| OpenClaw | Referenced as inspiration for Nex; discussed compliance issues with AI SDK vs Agent SDK | Yes — [OpenClaw](../orchestration-platforms/openclaw.md) |
| Nex | Felix's Claude Code wrapper; OpenClaw clone on Agent SDK; model-agnostic design | No — not yet catalogued (proprietary, not OSS) |
| NEO | Felix's "thinking partner" app; memory-first architecture; coaching prompt system | No — not yet catalogued; see https://meetneo.app |
| The Dojo | 5-agent recursive training loop (Neo, Trinity, Morpheus, Oracle, Smith) for context amnesia | No — proprietary concept, not a standalone tool |
| Agent SDK (Anthropic) | Used by Nex instead of AI SDK to stay compliant with Anthropic's terms | Yes — [Claude Agent SDK](../agent-harnesses/claude-agent-sdk.md) |
| Notion | Used for content approval workflows | Yes — referenced in [Notion as Agent Backend](../reference/notion-as-agent-backend.md) |

---

## Action Items

- [ ] Study the Dojo's 5-agent recursive loop pattern — could inform our own agent quality/training systems
- [ ] Monitor Felix's channel for follow-up videos on Nex architecture details (Agent SDK compliance positioning)
- [ ] Evaluate whether the "agent lives in WhatsApp group" bug triage pattern could work for our client communication
- [ ] Consider adding Felix Tay as a practitioner entry if he releases more technical content about Nex/Dojo implementation
- [ ] Note the computer-use agent pattern for cross-platform automation (YouTube upload, Facebook personal profiles) — validates our E2E testing approach with Chrome DevTools MCP
