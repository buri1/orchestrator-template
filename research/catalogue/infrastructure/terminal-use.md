# Terminal Use

> **Infrastructure for background agents — the easiest way to deploy Claude Agent SDK and Codex agents with persistent filesystems and sandboxed compute.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [terminal-use](https://github.com/terminal-use) (org — 4 public repos, templates only) |
| GitHub Stars | N/A — no public core repo; template repos have 0 stars (as of 2026-03-08) |
| Publisher | Terminal Use (startup, YC W26 — 3 ex-Palantir founders) |
| License | Proprietary (platform); templates are public |
| Tech Stack | Python + TypeScript SDKs, Docker/Kubernetes, GCS, tar.zst compression, SSE streaming |
| Maturity | 🟡 Early (YC W26 batch, ~4 person team, pre-traction) |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Solves cloud deployment of agents, but we run local-first with tmux+worktree. Cloud hosting for agent workloads is a Phase 4+ concern. The persistent filesystem concept validates our stateful agent approach but offers nothing we can use today. |
| **Novelty** | 4/10 | "Vercel for background agents" is identical positioning to Warp/Oz (already catalogued at 8/10 with 26K stars). Terminal Use is essentially a narrower, earlier-stage version of the same thesis. The ADK decorator pattern (`@server.on_create`, `@server.on_event`) is clean but not novel. |
| **Actionable** | 3/10 | Proprietary cloud platform — no self-hosting, no open-source core. Cannot adopt code or patterns directly. Template repos are thin Docker+Python scaffolds with no reusable logic. |

---

## Overview

Terminal Use positions itself as "Vercel for background agents" — a hosted platform for deploying and running AI agents that need persistent filesystems, long-running execution, and production durability. Founded by three ex-Palantir engineers (Filip Balucha, Stavros Filosidis, Vivek Raja) and backed by Y Combinator (W26 batch, partner Gustaf Alstromer), the company directly addresses problems the founders experienced building agent infrastructure at Palantir: memory usage varying wildly with subagent count (risking OOMs), crashes requiring retry logic, and all state living in `~/.claude`.

The platform is framework-agnostic, supporting Claude Agent SDK, OpenAI Codex SDK, and custom agent implementations. The developer workflow is CLI-first: `tu init` creates a project, `tu deploy` builds a Docker image and pushes it to Terminal Use's registry, and Kubernetes handles scaling from 1-N replicas based on concurrent task load. Agents get persistent filesystems with manifest-based sync (checksums + tar.zst compression), secrets management, versioning with rollback, and observability via distributed tracing spans.

The Agent Development Kit (ADK) provides a decorator-based runtime (`@server.on_create`, `@server.on_event`) with pre-bound modules for messages, state, tasks, events, filesystem, and tracing. Frontend integration is supported via SSE streaming and Vercel AI SDK compatibility. The platform includes role-based access control, multi-tenant namespace isolation (dedicated Kubernetes namespaces, GCS buckets, service accounts per tenant), and API key scoping with sharing groups.

---

## Technical Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Terminal Use Platform                        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Kubernetes Orchestration                     │  │
│  │                                                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │ Agent Pod 1 │  │ Agent Pod 2 │  │ Agent Pod N │     │  │
│  │  │ (Docker)    │  │ (Docker)    │  │ (Docker)    │     │  │
│  │  │             │  │             │  │             │     │  │
│  │  │ ADK Runtime │  │ ADK Runtime │  │ ADK Runtime │     │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │  │
│  │         │                │                │             │  │
│  │  ┌──────▼────────────────▼────────────────▼──────────┐  │  │
│  │  │        Persistent Filesystem Layer                 │  │  │
│  │  │  Manifest-based sync │ Checksums │ tar.zst         │  │  │
│  │  │  Async downloads │ Sync uploads │ Multi-task share │  │  │
│  │  └──────────────────────┬────────────────────────────┘  │  │
│  │                         │                               │  │
│  │  ┌──────────────────────▼────────────────────────────┐  │  │
│  │  │             GCS (Google Cloud Storage)             │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Platform API│  │ Tracing /    │  │ RBAC + Namespaces    │  │
│  │ (REST)      │  │ Observability│  │ (Multi-tenant iso.)  │  │
│  └─────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
         │                    │
    ┌────▼──────┐    ┌───────▼──────────────────────┐
    │ tu CLI    │    │ SDKs (Python + TypeScript)    │
    │           │    │ ADK: messages, state, tasks,  │
    │ init      │    │      events, filesystem,      │
    │ deploy    │    │      tracing                   │
    │ logs      │    └──────────────────────────────┘
    │ rollback  │
    │ env       │
    └───────────┘
```

Key technical details:
- **Container deployment** — Docker images built locally, pushed to TU registry, deployed to Kubernetes with auto-scaling
- **Health probes** — Liveness and readiness checks before traffic routing (~2-5 second container startup)
- **Manifest-based filesystem sync** — Files tracked by checksum, only changed files transferred via compressed tar.zst
- **Branch-based deployments** — Git branch names normalized (slashes → hyphens, lowercased), independent version history per branch
- **Environment matching** — Exact, wildcard, and catch-all patterns for deployment targeting
- **Namespace isolation** — Dedicated Kubernetes namespace, GCS bucket, and service account per tenant
- **Auto-retry** — SDK retries on 408, 429, and 5xx errors with configurable retry count
- **SSE streaming** — Frontend integration via Server-Sent Events for real-time task updates

---

## Publisher Background

**Founders** (all ex-Palantir):
- **Filip Balucha** — Worked on Ontology at Palantir (Palantir's core data model/platform layer)
- **Stavros Filosidis** — Built coding infrastructure at Palantir; leading TU infrastructure
- **Vivek Raja** — Led technical delivery for major agent deployment across US hospitals at Palantir

**Team size:** 4 people (San Francisco)

**Backing:** Y Combinator Winter 2026 (partner: Gustaf Alstromer). No disclosed funding amount beyond YC standard deal.

**Credibility assessment:** Strong Palantir pedigree — Palantir is one of the few companies with genuine production experience running agent-like systems (Ontology, AIP) at enterprise scale in regulated environments (healthcare, defense, gov). The team has directly relevant experience with the exact problems they're solving. However, zero public traction (0 GitHub stars on all repos, no disclosed customers) and the platform is extremely early stage. They use their own platform internally ("dogfooding"), which is a positive signal.

---

## What's Valuable for Us

- **Problem validation**: The founders articulate exactly the problems we face — "memory usage varies wildly with subagent count (risking OOMs), crashes require retry logic for durability, and all state lives in `~/.claude`." This confirms our Master Blueprint's emphasis on crash recovery and state management is on target.
- **Manifest-based filesystem sync pattern**: Tracking files by checksum and only transferring deltas via compressed archives is a smart pattern we could adapt for our worktree sync or state backup mechanisms. More efficient than full git operations for agent workspace snapshots.
- **ADK module decomposition**: The clean separation into `messages`, `state`, `tasks`, `events`, `filesystem`, `tracing` is a useful reference for how to decompose our own agent communication interface. Each module is independently accessible via `TaskContext`.
- **Namespace isolation model**: Dedicated Kubernetes namespace + GCS bucket + service account per tenant maps to our Master Blueprint's "federated systems" principle (Governing Principle #6). If we ever move to cloud execution, this is the right isolation model for DSGVO-compliant multi-tenant agent hosting.
- **Branch-based deployment pattern**: Git branches as deployment units with independent version history is interesting for our agent configuration versioning.

---

## What's NOT Relevant

- **Cloud-only execution**: Terminal Use is a hosted platform with no self-hosting option. Our Master Blueprint Governing Principle #7 ("Build only what you have needed in the last 30 days") means we don't need cloud agent hosting — our local tmux+worktree+Claude Max setup works. Adding cloud round-trips would violate our zero-infrastructure approach.
- **Proprietary lock-in**: No open-source core, no self-hosting path. This directly conflicts with Governing Principle #6 (federated systems) where we need full control over execution environments, especially for gov/DSGVO work.
- **Kubernetes dependency**: Our architecture deliberately avoids Kubernetes complexity. We run 2-3 concurrent agents on a Mac with tmux. K8s is massive overkill and operational overhead we don't need.
- **Docker-based agent packaging**: We run agents as Claude Code sessions in tmux panes with direct filesystem access. Docker containerization adds build time, image management, and debugging friction that our prompt-engineering-only approach deliberately avoids.
- **Overlaps with Warp/Oz**: Terminal Use and Warp/Oz solve the same problem ("Vercel for cloud agents") but Oz is further along (26K stars, $73M funding, harness-agnostic, 5 clear orchestration primitives). If we ever need cloud agent infra, Oz is the more established option to evaluate first.

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: If client work requires demonstrating enterprise-grade agent deployment (not just local execution), Terminal Use's multi-tenant isolation model and observability could be a hosting option. But Warp/Oz or Daytona are more mature alternatives to evaluate first.
- **Phase 4 (Days 90+)**: If scaling beyond local Mac execution becomes necessary (e.g., running 10+ concurrent agent teams for SaaS Factory), a platform like Terminal Use could replace our tmux-based approach. The persistent filesystem feature specifically addresses what would break first — agent state management at scale.
- **Long-term watch**: The Palantir founders know regulated enterprise environments. If Terminal Use adds DSGVO-compliant European hosting or on-premise deployment, it could become relevant for our gov contract work. Monitor their progress.

---

## Key Takeaway

> **Terminal Use is an early-stage "Vercel for background agents" from strong Palantir alumni (YC W26), but with zero public traction, no open-source core, and identical positioning to the more established Warp/Oz — file under "watch" for Phase 4+, not act on today.**
