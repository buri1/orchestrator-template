# E2B

> **Open-source infrastructure for running AI-generated code in secure isolated sandboxes in the cloud**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [e2b-dev/E2B](https://github.com/e2b-dev/E2B) |
| GitHub Stars | 11,200 (as of 2026-03-08) |
| Publisher | E2B (startup, Series A — $35M total raised) |
| License | Apache-2.0 |
| Tech Stack | TypeScript, Python (SDKs), Firecracker microVMs, Supabase, Terraform |
| Maturity | 🟢 Production |
| Last Analyzed | 2026-03-08 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 5/10 | Same sandbox category as Daytona but less star traction; relevant at Phase 3+ for agent isolation, not now |
| **Novelty** | 5/10 | Firecracker microVMs is a known pattern (AWS Lambda uses them); E2B's contribution is the developer-friendly SDK layer on top |
| **Actionable** | 4/10 | Clean SDK, but we don't need cloud sandboxing yet. Apache-2.0 license is better than Daytona's AGPL though |

---

## Overview

E2B provides cloud-based sandboxed environments for AI agents to execute code safely. Built on Firecracker microVMs (the same technology behind AWS Lambda), E2B offers lightweight, secure isolation with fast spin-up times. The platform is designed as infrastructure that AI frameworks plug into — you bring your own LLM and agent logic, E2B provides the execution environment.

The developer experience centers on two SDKs: `@e2b/code-interpreter` (TypeScript/npm) and `e2b-code-interpreter` (Python/pip). A few lines of code create a sandbox, execute code, and retrieve results. The emphasis is on simplicity — E2B handles the infrastructure complexity while developers focus on agent logic.

E2B has achieved remarkable enterprise penetration: 88% of Fortune 100 companies have signed up, and the platform runs hundreds of millions of sandboxes monthly. Notable users include Hugging Face (reinforcement learning pipelines) and Groq (compound AI systems). With $35M in funding and Apache-2.0 licensing, it's the most enterprise-friendly option in the agent sandbox space.

---

## Technical Architecture

```
┌────────────────────────────────────────┐
│           E2B Cloud Platform           │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │     Firecracker microVM Layer    │  │
│  │  ┌────────┐  ┌────────┐         │  │
│  │  │Sandbox │  │Sandbox │  ...     │  │
│  │  │  VM 1  │  │  VM 2  │         │  │
│  │  └────────┘  └────────┘         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────┐  ┌──────────────────┐   │
│  │ Supabase │  │ Terraform Infra  │   │
│  │ (Auth/DB)│  │ (Provisioning)   │   │
│  └──────────┘  └──────────────────┘   │
└────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │  SDKs                         │
    │  @e2b/code-interpreter (TS)   │
    │  e2b-code-interpreter (Py)    │
    └───────────────────────────────┘
```

Key technical details:
- **Firecracker microVMs** — sub-second boot, strong isolation (same tech as AWS Lambda)
- **Ephemeral by default** — sandboxes are disposable, clean-slate execution environments
- **Custom templates** — pre-built environments with specific dependencies/tools installed
- **API key auth** — simple authentication model for programmatic access
- **1,800+ dependent repos** — significant ecosystem adoption as infrastructure dependency
- **Monorepo structure** — SDKs, web app, docs, and infra in single repo

---

## Publisher Background

Founded by **Vasek Mlejnsky** (CEO) and **Tomas Valenta** in 2023. Czech-founded, now operating globally.

Funding: $11.5M seed (Decibel Partners, Oct 2024), $21M Series A (Insight Partners, Jul 2025) with participation from Docker's former CEO Scott Johnston as angel investor. Total: $35M.

The Docker CEO angel investment is a strong signal — suggests E2B is seen as the next evolution of containerized execution. 88% Fortune 100 adoption validates enterprise readiness.

---

## What's Valuable for Us

- **Apache-2.0 license**: Unlike Daytona's AGPL, E2B's permissive license allows unrestricted commercial use, self-hosting, and modification. Better fit for our federated architecture where DSGVO compliance may require self-hosted components.
- **Firecracker isolation model**: If we need true security isolation between business lines (gov work vs. SaaS factory), Firecracker microVMs provide kernel-level separation — stronger than container isolation.
- **SDK simplicity**: The TypeScript SDK is minimal and focused — `Sandbox.create()`, `sandbox.runCode()`, `sandbox.close()`. Could wrap our tmux-based agent execution with minimal abstraction change.
- **Custom templates pattern**: Pre-baking environment dependencies into sandbox templates mirrors how we could standardize agent execution environments across business lines.

---

## What's NOT Relevant

- **Cloud-only execution**: E2B is a cloud service — no local execution mode. Our current architecture runs entirely on local macOS with tmux. Adding cloud round-trips to every agent operation adds latency and cost.
- **Code interpreter focus**: E2B's primary use case is running generated code snippets (data analysis, Jupyter-style execution). Our agents run full development workflows (git, npm, build tools), not isolated code snippets.
- **Ephemeral model**: E2B sandboxes are designed to be disposable. Our agent sessions are long-running and stateful (state files, git repos, node_modules). The impedance mismatch would require significant workarounds.
- **API-key-per-sandbox**: Doesn't map well to our orchestrator pattern where agents are managed via tmux sessions, not API calls.

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: If we need to execute untrusted client-submitted code or run agent-generated code in isolation, E2B's simple SDK and Apache-2.0 license make it the lower-friction choice vs. Daytona for quick integration.
- **Phase 4 (Days 90+)**: Multi-tenant execution for SaaS factory products. Each customer's agent workflows could run in isolated E2B sandboxes, preventing cross-contamination.
- **Code review automation**: Running agent-generated code in E2B sandboxes before committing — a safety net layer that catches runtime errors without risking the host environment.

---

## Key Takeaway

> **E2B is the most enterprise-adopted agent sandbox (88% Fortune 100, Apache-2.0), but its ephemeral/cloud-only model is a weaker fit than Daytona's stateful sandboxes for our long-running agent workflows — evaluate both at Phase 3.**
