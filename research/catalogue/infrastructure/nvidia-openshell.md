# NVIDIA OpenShell

> **An open-source sandboxed execution environment for autonomous AI agents with out-of-process policy enforcement, declarative YAML security policies, and a Privacy Router for local vs. cloud inference routing.**

| Field | Value |
|-------|-------|
| Category | 🏗️ Infrastructure |
| Repository | [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell) |
| GitHub Stars | ~3,000 (as of 2026-03-22) |
| Publisher | NVIDIA — bigtech |
| License | Apache 2.0 |
| Tech Stack | Rust (core), Python 3.13, Node.js 22, K3s (Kubernetes-in-Docker), Docker |
| Maturity | 🟡 Early (Alpha — single-player mode, one developer/environment/gateway) |
| Last Analyzed | 2026-03-22 |

---

## Burak's Notes

> *This is the enterprise-grade answer to our `--dangerously-skip-permissions` problem. Right now every worker agent we spawn runs with full permissions because Claude Code's built-in permission system blocks autonomous operation. OpenShell flips this: instead of disabling all guardrails, you run the agent inside a sandbox with deny-by-default policies and selectively open capabilities via YAML. The K3s-in-Docker deployment is heavier than what we need today (we're tmux on bare metal), but the policy model itself — filesystem ACLs, network egress filtering, process restrictions, inference routing — is exactly the layered defense we should be building toward. The Privacy Router is interesting for client work: route sensitive prompts to local models, frontier requests to Claude. Alpha maturity means don't adopt yet, but this is the direction agent security is heading. Watch for v1.0.*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses the security gap created by `--dangerously-skip-permissions`. Our orchestrator spawns agents with zero guardrails — OpenShell provides the missing sandbox layer with policy enforcement at the environment level, not the prompt level. |
| **Novelty** | 7/10 | Out-of-process enforcement is fundamentally different from DCG's PreToolUse hook approach. The 4-layer policy model (filesystem, network, process, inference) and hot-reloadable dynamic policies are new patterns in our catalogue. Privacy Router for inference routing is unique. |
| **Actionable** | 4/10 | Alpha maturity, K3s dependency, single-player mode only. Not deployable in our tmux+bare-metal stack today. Policy YAML schema and 4-layer enforcement model are study-worthy for our own security roadmap. |

---

## Overview

NVIDIA OpenShell provides a sandboxed execution environment purpose-built for autonomous coding agents. The core architectural principle is **out-of-process policy enforcement**: rather than relying on behavioral prompts or agent-internal guardrails (which can be bypassed by prompt injection or self-modification), OpenShell enforces constraints at the environment level. This mirrors browser tab isolation applied to autonomous agents — the agent literally cannot access resources outside its policy-defined boundary.

The system runs as a K3s Kubernetes cluster inside a single Docker container, eliminating separate K8s installation requirements. Agents (Claude Code, Codex, OpenCode, GitHub Copilot CLI) run unmodified inside sandboxes. Policies are declared in YAML with static sections (locked at sandbox creation) and dynamic sections (hot-reloadable without restart). When an agent hits a policy boundary, rather than silently blocking, OpenShell communicates the constraint back to the agent, enabling it to reason about the restriction and propose a policy update for developer approval.

The **Privacy Router** component manages data flow based on cost and privacy policies: sensitive context routes to local open models while frontier requests (Claude, GPT) proceed only when policy permits. This creates organizational control over data flow that agents cannot override.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                    OpenShell Host                     │
│                                                       │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │ Gateway   │   │ Policy      │   │ Privacy      │  │
│  │ (Control  │◄──│ Engine      │◄──│ Router       │  │
│  │  Plane)   │   │ (4 layers)  │   │ (LLM calls)  │  │
│  └────┬──── ┘   └──────┬──────┘   └──────────────┘  │
│       │                 │                             │
│  ┌────▼─────────────────▼──────────────────────────┐ │
│  │              K3s Cluster (Docker)                │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │ │
│  │  │Sandbox 1│  │Sandbox 2│  │Sandbox N│  ...     │ │
│  │  │(Claude) │  │(Codex)  │  │(Custom) │         │ │
│  │  └─────────┘  └─────────┘  └─────────┘         │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Four Policy Layers

| Layer | Protection | Reload |
|-------|-----------|--------|
| **Filesystem** | Restricts reads/writes to allowed paths | Static (locked at creation) |
| **Network** | Blocks unauthorized outbound connections; L7 filtering at HTTP method+path level | Dynamic (hot-reloadable) |
| **Process** | Prevents privilege escalation, dangerous syscalls, unreviewed binary execution | Static (locked at creation) |
| **Inference** | Reroutes model API calls to controlled backends via Privacy Router | Dynamic (hot-reloadable) |

### Key Components

- **Gateway**: Control-plane API managing sandbox lifecycle, authentication boundaries, and credential injection
- **Policy Engine**: Evaluates actions at granular levels (binary name, destination, method, path); deny-by-default
- **Privacy Router**: Routes LLM API calls to managed backends; model-agnostic; keeps sensitive context on sandbox compute
- **Credential Providers**: Named credential bundles injected as env vars at runtime — never written to filesystem
- **Terminal UI**: Real-time `openshell term` (k9s-inspired) for monitoring gateways, sandboxes, and providers

### Supported Agents (Zero Code Changes Required)

- Claude Code (`ANTHROPIC_API_KEY`)
- OpenCode (`OPENAI_API_KEY` / `OPENROUTER_API_KEY`)
- Codex (`OPENAI_API_KEY`)
- GitHub Copilot CLI (`GITHUB_TOKEN`)
- Community images: OpenClaw, Ollama

---

## Publisher Background

NVIDIA. $3T+ market cap. The GPU computing company that now owns the AI infrastructure stack from silicon to software. OpenShell extends their AI enterprise portfolio (NIM, NeMo, RAPIDS) into agent security. The project includes agent skills in `.agents/skills/` and is itself developed using agent workflows with human approval gates — dogfooding their own sandbox. Apache 2.0 license signals genuine open-source intent, not just marketing.

---

## What's Valuable for Us

1. **Policy YAML schema as reference architecture**: The 4-layer (filesystem/network/process/inference) declarative policy model is the right abstraction for agent security. We should study the YAML schema for when we build our own security layer, even if we don't use OpenShell's K3s runtime.

2. **Out-of-process enforcement principle**: Validates that prompt-level safety ("DU SCHREIBST NIEMALS CODE") is insufficient. Real security must be enforced at the environment level where the agent cannot bypass it. This is complementary to DCG's PreToolUse hooks — defense in depth.

3. **Privacy Router pattern for client work**: The inference routing concept (sensitive data stays local, frontier requests go to cloud) maps directly to our DSGVO requirements for government clients. Even without OpenShell, we should implement this pattern in our LiteLLM proxy.

4. **Interactive policy negotiation**: When agents hit boundaries, they can propose policy updates rather than failing silently. This "communicate constraints, don't just block" pattern is better UX than DCG's hard denial and could inform our roadblock-recovery workflow.

5. **Credential injection model**: Named credential bundles as env vars (never on filesystem) is the right pattern for multi-tenant agent systems. Directly applicable when we scale beyond single-developer mode.

---

## What's NOT Relevant

- **K3s/Kubernetes runtime**: Our stack is tmux+bare-metal on macOS. Running a K3s cluster inside Docker to sandbox agents is massive overkill for our current 1-6 agent setup. The containerization overhead contradicts our "simplicity over ego" principle.

- **Single-player alpha limitation**: Cannot support our multi-worker orchestrator pattern yet. One developer, one environment, one gateway — needs to reach multi-tenant before it's usable for us.

- **GPU passthrough features**: We run Claude Max via API, not local inference. GPU sandbox support is irrelevant to our architecture.

- **Community sandbox catalog**: BYOC and pre-built images solve a deployment problem we don't have (we deploy on bare metal, not containers).

---

## Future Use Cases

- **Phase 2 (Days 4-60)**: Study the YAML policy schema and 4-layer model. Design our own lightweight policy enforcement that works with tmux+worktree (no K3s). Consider filesystem ACLs + network egress rules as complement to DCG.

- **Phase 3 (Days 60-90)**: If scaling to cloud-hosted agents (Daytona, E2B, Warp/Oz), OpenShell becomes the sandbox runtime candidate. Privacy Router integration with LiteLLM proxy for DSGVO-compliant inference routing.

- **Phase 4 (Days 90+)**: Multi-tenant agent hosting for SaaS customers. OpenShell's credential provider model + per-sandbox policies map to per-customer isolation. Depends on OpenShell reaching production maturity (v1.0+).

---

## Key Takeaway

> **OpenShell is the enterprise-grade answer to `--dangerously-skip-permissions` — out-of-process policy enforcement that agents cannot bypass, with declarative YAML policies and privacy-aware inference routing. Too heavy for our stack today (K3s, alpha), but the 4-layer policy model is the reference architecture for agent security.**
