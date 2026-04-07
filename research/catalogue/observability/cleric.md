# Cleric

> **Self-learning AI SRE that investigates production incidents, identifies root causes, and builds compounding operational knowledge.**

| Field | Value |
|-------|-------|
| Category | 🔍 Observability & Debugging |
| Website | [cleric.ai](https://cleric.ai) |
| GitHub Stars | N/A (closed source, no public repos) |
| Publisher | Agentik, Inc. dba Cleric (startup, ~13 people) |
| License | Proprietary (SaaS) |
| Tech Stack | Closed source; integrates with Datadog, Grafana, Prometheus, Kubernetes, GitHub, Slack |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Different problem domain (SRE/ops), but the learning architecture patterns — persist/compound/visible corrections and ambient learning — are directly transferable to our orchestrator's knowledge compounding. We don't need an AI SRE; we need the learning loop design. |
| **Novelty** | 7/10 | The three-lesson learning framework (persist, compound, be visible) is the cleanest articulation of agent learning we've encountered. Achieving this through context engineering alone (no fine-tuning) validates our CLAUDE.md/MEMORY.md approach. |
| **Actionable** | 5/10 | Cannot adopt the product itself (closed source, wrong domain). The learning loop framework is a design checklist we can evaluate our orchestrator against today. |

---

## Overview

Cleric is a proprietary AI SRE platform that autonomously investigates production incidents, delivers root cause analysis in under 5 minutes, and builds persistent operational knowledge from every resolution. Founded in 2023 by Shahram Anver (CEO) and Willem Pienaar (CTO, creator of Feast — the open-source feature store with 6.8K GitHub stars), the company raised $9.8M in seed funding led by Vertex Ventures US with participation from Zetta Venture Partners. It was named a Gartner Cool Vendor 2025 in AI for SRE and Observability.

The core differentiator is not the incident investigation itself — that capability is increasingly commoditized — but the **self-learning loop**. As articulated by Aaron Ahmed (Head of Product) at the Coding Agents conference (2026-03-08), Cleric's learning architecture rests on three interdependent properties: corrections must (1) **persist** across sessions, (2) **compound** by generalizing to adjacent contexts, and (3) be **visible** so users can see knowledge being applied and correct errors. This is achieved entirely through context engineering — no model fine-tuning.

The platform connects to existing observability stacks (Datadog, Grafana, Prometheus), CI/CD tooling, and incident management systems. It delivers findings directly in Slack with supporting evidence links, and engineers can guide its reasoning through conversation or examine diagnostics via a web interface. Early adopters like BlaBlaCar report freeing 20-30% of engineering capacity previously lost to repetitive troubleshooting. The company claims 200,000+ production-grade investigations completed.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AMBIENT LEARNING LAYER                 │
│                                                         │
│  Monitors: Slack/PagerDuty channels, alert streams      │
│  Absorbs: Incident history, resolution patterns         │
│  Builds: Environment model (services, deps, ownership)  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              INVESTIGATION ENGINE                         │
│                                                         │
│  1. Alert intake → hypothesis generation                │
│  2. Parallel hypothesis testing (first-principles)      │
│  3. Cross-stack correlation (logs, metrics, config,     │
│     recent code changes)                                │
│  4. Root cause identification + confidence scoring      │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              KNOWLEDGE GRAPH (Production Memory)         │
│                                                         │
│  Stores: Environment topology, past outcomes,           │
│          user corrections, team workflow patterns        │
│  Properties:                                            │
│    - Persist: Same correction recalled in same context  │
│    - Compound: Corrections generalize to adjacent cases │
│    - Visible: Agent shows reasoning + knowledge applied │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              INTEGRATION LAYER                           │
│                                                         │
│  Observability: Datadog, Grafana, Prometheus            │
│  Infrastructure: Kubernetes                             │
│  CI/CD: GitHub                                          │
│  Delivery: Slack (findings + evidence links)            │
│  Human-in-loop: Web interface for diagnostic review     │
└─────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- **Read-only by default**: SOC 2 Type II compliance; the agent investigates but doesn't remediate unless explicitly authorized
- **No fine-tuning**: All learning achieved through context engineering — the knowledge graph feeds relevant context into the model's prompt window at investigation time
- **Parallel hypothesis testing**: Multiple root cause hypotheses tested concurrently rather than sequential tree-walking
- **Dynamic operational memory**: Not static runbooks but a continuously updated model of system behavior patterns

---

## Publisher Background

**Shahram Anver** (CEO) and **Willem Pienaar** (CTO) co-founded Cleric (legally Agentik, Inc.) in 2023. Pienaar is the creator of **Feast**, the dominant open-source feature store for ML (6.8K GitHub stars, originally built at Gojek, later adopted widely). This is significant — it demonstrates deep infrastructure/ML-ops credibility and experience shipping open-source tools that get real adoption.

**Aaron Ahmed** serves as Head of Product and is the public face for technical talks (presented at the Coding Agents conference 2026-03-08). The team is ~13 people, SF-based. $9.8M seed led by Vertex Ventures US with Zetta Venture Partners. Gartner Cool Vendor 2025 recognition adds enterprise credibility. BlaBlaCar is a named customer.

The team's pedigree (Feast) plus the "context engineering, not fine-tuning" philosophy suggests they understand the distinction between building infrastructure around models vs. trying to change models — aligned with our 70/30 deterministic/LLM split.

---

## What's Valuable for Us

1. **The persist/compound/visible framework as a design checklist.** This is the single most useful takeaway. We should evaluate every knowledge persistence mechanism in our system (MEMORY.md, orchestrator-state.json, CLAUDE.md) against these three properties:
   - Do corrections persist? (MEMORY.md — yes, within sessions; across conversations — partially via auto-memory)
   - Do corrections compound? (Weak — our learnings tend to stay siloed in the context where they were added)
   - Are corrections visible? (Weak — users don't see which past learnings influenced current decisions)

2. **Ambient learning as an architectural pattern.** Cleric doesn't wait for explicit invocation — it monitors channels, absorbs incident history, and builds context automatically. Our orchestrator's session-start hooks and pre-compact handoff scripts are a primitive version of this. The pattern to steal: place the agent "in the path of real work" so learning happens without user effort.

3. **Context engineering over fine-tuning validates our approach.** Cleric achieves sophisticated learning entirely through prompt engineering and knowledge graph retrieval. This is exactly what we do with CLAUDE.md + MEMORY.md + state files. Their success at scale (200K+ investigations) proves this approach works in production.

4. **Read-only-first security posture.** SOC 2 Type II with read-only default is a pattern we should adopt for gov client work — agents investigate and recommend, human approves execution.

5. **Confidence scoring on outputs.** Cleric attaches confidence metrics to its findings. We should consider adding confidence scores to agent task completions in our orchestrator.

---

## What's NOT Relevant

- **The product itself.** Cleric is a closed-source SaaS for SRE/ops teams. We don't have production infrastructure incidents to investigate. We build software, not run services. The product is irrelevant; the patterns are valuable.

- **SRE-specific integrations.** Datadog, Prometheus, Grafana, PagerDuty integration patterns are domain-specific. Our agents need code intelligence, not infrastructure monitoring.

- **Pricing/deployment model.** SaaS-only with no self-hosted option means DSGVO incompatibility for gov clients, even if we wanted the product.

- **The "AI SRE" category itself.** Per Master Blueprint Principle 7 ("Build only what you have needed in the last 30 days"), we have not needed incident investigation. This is a Phase 4+ concern at earliest.

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Apply the persist/compound/visible checklist to audit our MEMORY.md and state management. Identify gaps where learnings don't compound across contexts.
- **Phase 3 (Days 60-90)**: Implement ambient learning in the orchestrator — the agent should absorb context from completed tasks, PR reviews, and test results automatically, not just when explicitly told.
- **Phase 4 (Days 90+)**: If we're running SaaS products at scale, revisit Cleric as an actual product for infrastructure monitoring. The BlaBlaCar case study (20-30% engineering capacity freed) would be relevant at that point.

---

## Key Takeaway

> **Cleric's value to us is not the product but the learning architecture: the persist/compound/visible correction loop and ambient learning pattern are the cleanest framework we've found for evaluating whether our orchestrator's knowledge actually compounds — and right now, it mostly doesn't.**
