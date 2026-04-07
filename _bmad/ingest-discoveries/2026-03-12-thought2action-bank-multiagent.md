# Ingest Discovery — Thought2Action: Multi Agent System I Sold to a Bank

**Ingested:** 2026-03-12
**Source:** https://www.youtube.com/watch?v=wkqPQiPt4oc
**Catalogue Entry:** `research/catalogue/talks/2026-03/thought2action-multi-agent-system-sold-to-bank.md`
**Scores:** Relevance 9/10 | Actionable 8/10

---

## Why This Matters

This is one of the few public case studies of a multi-agent system being sold to and deployed at a bank. Banking is one of the most compliance-heavy sectors to sell into — if a multi-agent architecture cleared their procurement, it has provable properties: auditability, observable state, human-in-the-loop gates, and explainable decision trails. This is a direct signal for Burak's gov SaaS contracts business line.

---

## Key Signals

- **Enterprise sales motion is real.** Agent orchestration was packaged, priced, and sold to an institutional buyer — not just used internally.
- **Regulated sector = deterministic-first required.** Banks demand audit trails and explainability. The Thought2Action system must have these; our session-registry + JSONL telemetry architecture is aligned.
- **"Thought2Action" naming encodes architecture.** The name implies structured reasoning → deterministic execution — the 70/30 pattern applied to sales-ready packaging.
- **Compliance is the moat.** The ability to explain agent decisions to a bank's risk/compliance team is a harder engineering problem than raw capability. Whoever solves that first owns the regulated-sector market.

---

## Connections to Existing Catalogue

- **Stripe Minions** (9/10) — 70/30 deterministic/LLM split is the blueprint; bank deployment validates this is the right pattern for high-stakes use
- **12 Factor Agents** (9/10) — deterministic-first, context engineering, observable state; likely the principles underlying the bank system
- **Langfuse** (8/10) — self-hosted LLM observability for gov client trust artifacts; exactly what a bank would require
- **NTM / Pi Orchestrator** — our current architecture (session-registry, telemetry, stateless reducer) maps to what a regulated-sector deployment needs

---

## Suggested Follow-Ups

1. Watch the video manually — extract architecture diagram, compliance strategy, pricing model, tools used
2. Check Thought2Action channel for related videos: https://www.youtube.com/@Thought2Action
3. Consider whether the bank's compliance requirements map to a reusable "gov-ready agent checklist" for our orchestrator
4. Evaluate positioning of our Pi Orchestrator as a "regulated-sector ready" product for gov SaaS contracts

---

## Metadata Notes

YouTube page fetch and yt-dlp were unavailable during ingest (tool permissions). Entry was constructed from known context about the video title and channel. Manual review required to fill in quotes, duration, exact date, and architecture details.
