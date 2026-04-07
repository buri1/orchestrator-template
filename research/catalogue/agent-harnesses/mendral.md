# Mendral

> **Always-on AI DevOps engineer that investigates every failure, finds the root cause, and opens a pull request with the fix.**

| Field | Value |
|-------|-------|
| Category | ⚙️ Agent Harnesses |
| Repository | Proprietary — [GitHub App](https://github.com/apps/mendral-app), no public source repo |
| GitHub Stars | N/A (closed-source, SaaS product) |
| Publisher | Mendral (YC-backed startup, founded by Sam Alba & Andrea Luzzardi) |
| License | Proprietary / SaaS |
| Tech Stack | Go (custom agent loop), ClickHouse (log storage), Inngest (durable execution), Firecracker microVMs (sandboxed execution), Claude API (Opus/Sonnet/Haiku tiering) |
| Maturity | 🟢 Production (managing CI/CD for 15 teams, 5 paying customers incl. PostHog) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | The model tiering (Opus/Sonnet/Haiku) and deterministic-vs-LLM split patterns are highly relevant to our architecture. The CI/CD focus itself is less relevant — we're not building a DevOps agent. |
| **Novelty** | 7/10 | The multi-model tiering strategy (Opus for reasoning, Sonnet for evidence, Haiku for parsing) is the best concrete implementation of model selection we've seen. The Go-based custom agent loop (avoiding LangChain) validates our "no frameworks" philosophy. The ClickHouse log pipeline at 35:1 compression is impressive infrastructure. |
| **Actionable** | 5/10 | The model tiering pattern is directly adoptable in our orchestrator. The Inngest durable execution pattern is interesting for our crash-protection layer. But the core product (CI/CD failure remediation) isn't what we're building. |

---

## Overview

Mendral is a production AI DevOps agent built by the founders of Docker's engineering team (Sam Alba, Docker's first hire who led engineering to 100+ engineers; Andrea Luzzardi, who wrote Docker's first lines of code and led architecture). Both later co-founded Dagger (CI/CD pipeline platform, $20M funding). This pedigree is exceptional — these are builders who've operated at massive scale in exactly the DevOps domain Mendral targets.

The agent operates as a GitHub App that monitors CI/CD pipelines 24/7, automatically investigating failures, diagnosing root causes, and opening PRs with fixes. Internally, it coordinates a team of specialized agents using Claude's model family with intelligent tiering: Opus handles complex root cause analysis, Sonnet collects evidence and writes queries, and Haiku handles log parsing and classification. This is the 70/30 deterministic/LLM split in action — Go functions handle deterministic operations while LLM calls handle the reasoning that requires intelligence.

The system processes billions of CI log lines per week through a ClickHouse pipeline with 35:1 compression, queryable in milliseconds. Typical investigations scan 335K rows; P95 investigations scan 940 million rows. This is real infrastructure at scale, not a demo.

---

## Technical Architecture

**Agent System:**
- **Custom Agent Loop**: Go-based, deliberately avoiding LangChain/LangGraph frameworks
- **Model Tiering**:
  - Opus: Root cause analysis, complex reasoning about test interactions
  - Sonnet: Evidence collection, SQL queries, repository data gathering, failure correlation
  - Haiku: Log parsing, failure type classification, structured data extraction
- **Tool Architecture**: Pure Go functions for deterministic operations (GitHub queries, metadata lookups) + Firecracker microVMs for untrusted code execution

**Data Infrastructure:**
- **Log Pipeline**: Billions of CI log lines/week → ClickHouse (35:1 compression)
- **Query Performance**: Typical 335K rows scanned per investigation; P95 at 940M rows
- **Domain Knowledge**: Encoded expertise for race conditions, shared state failures, infrastructure variance, dependency resolution, cache invalidation

**Execution Engine:**
- **Inngest**: Durable execution with step-level retry (not full workflow restart)
- **Firecracker microVMs**: Hardware-level tenant isolation via Blaxel
  - Boot time: <125ms
  - Resume time: <25ms
  - Suspend/resume capability for state persistence across LLM reasoning cycles

**Integration:**
- GitHub App (zero-config install)
- Slack integration for notifications
- Triggers: CI failures, Slack messages, scheduled analyses

---

## Publisher Background

Sam Alba and Andrea Luzzardi are among the most credible founders in the DevOps infrastructure space:
- **Docker**: Sam was the first hire and VP of Engineering, scaling the team to 100+. Andrea wrote Docker's first lines of code and served as Lead Architect. They built the tool that changed how the entire industry deploys software.
- **Dagger**: Both co-founded Dagger with Solomon Hykes (Docker's original founder), raising $20M to build a CI/CD pipeline platform.
- **Mendral**: YC-backed. Already in production managing CI/CD for 15 teams with 5 paying customers including PostHog.

This is not a side project. These are repeat founders with deep domain expertise, institutional backing, and production validation.

---

## What's Valuable for Us

- **Model tiering strategy**: The Opus/Sonnet/Haiku tiering is the most concrete example we've seen of intelligent model selection within a single agent system. We should adopt this pattern: use expensive models (Opus) only for complex reasoning, mid-tier (Sonnet) for structured work, and cheap models (Haiku) for parsing/classification. This directly reduces our Claude Max token burn.
- **Custom agent loop over frameworks**: Mendral deliberately avoided LangChain/LangGraph, building a custom Go agent loop. This validates our "pure prompt engineering" approach — frameworks add overhead and constraints that production systems don't need.
- **Durable execution pattern (Inngest)**: Step-level retry instead of full workflow restart is relevant to our crash-protection layer. When a tmux session dies, we should be able to resume from the last completed step, not restart the entire workflow.
- **Deterministic tool architecture**: Pure Go functions for deterministic operations, LLM only for reasoning. This is the 70/30 split we advocate, implemented cleanly in production.
- **Domain knowledge encoding**: Mendral encodes domain expertise (race conditions, flaky tests, cache invalidation) into its agent system. We should similarly encode domain-specific knowledge into our orchestrator's agent instructions.

---

## What's NOT Relevant

- **CI/CD focus**: We're not building a DevOps agent. Mendral solves a specific problem (CI failure remediation) that's orthogonal to our multi-business orchestration system.
- **Proprietary/SaaS model**: We can't inspect the code, fork it, or adapt it. We can only learn from their public writings about architecture.
- **ClickHouse infrastructure**: We don't process billions of log lines. The data infrastructure is impressive but irrelevant to our scale.
- **Firecracker microVMs**: We run agents in tmux sessions on a single machine. Hardware-level isolation is enterprise infrastructure we don't need at our current scale.
- **GitHub App deployment model**: We're a self-hosted orchestrator, not a SaaS product that installs into other people's repos.

---

## Future Use Cases

- **Phase 1 (Days 1-3)**: Adopt model tiering pattern — assign Haiku to parsing tasks, Sonnet to structured work, Opus only to complex reasoning.
- **Phase 2 (Days 4-60)**: Study Inngest's durable execution model for improving our tmux crash-protection. Implement step-level resume.
- **Phase 3 (Days 60-90)**: If we add CI/CD automation to the orchestrator, Mendral's approach (install as GitHub App, monitor CI, auto-fix) is the reference architecture.
- **Phase 4 (Days 90+)**: If we productize, Mendral is a potential integration partner or competitor in the "autonomous DevOps" space.

---

## Key Takeaway

> **Built by Docker's original engineering leaders with YC backing — the model tiering strategy (Opus/Sonnet/Haiku for reasoning/evidence/parsing) and the custom-agent-loop-over-frameworks philosophy are the two most actionable patterns to adopt from this tool.**
