# NVIDIA NemoClaw + OpenShell

> **Open-source secure runtime and plugin for running autonomous AI agents (Claude Code, Codex, OpenClaw) in policy-enforced sandboxes**

| Field | Value |
|-------|-------|
| Category | Infrastructure |
| Repository | [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell), [NVIDIA/NemoClaw](https://github.com/NVIDIA/NemoClaw) |
| GitHub Stars | New (March 2026 launch) |
| Publisher | NVIDIA (bigtech) |
| License | Apache-2.0 |
| Tech Stack | Python, TypeScript, Docker, K3s (Kubernetes), YAML policies |
| Maturity | Early (alpha, single-player mode) |
| Last Analyzed | 2026-03-19 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours -- agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 7/10 | Directly addresses sandboxing for Claude Code agents; we currently run --dangerously-skip-permissions with no isolation |
| **Novelty** | 7/10 | Out-of-process policy enforcement + privacy router is a new architecture pattern vs. E2B/Daytona cloud sandboxes |
| **Actionable** | 4/10 | Alpha software, single-player only; not ready for our multi-agent tmux orchestrator today, but architecture is worth studying |

---

## Overview

NVIDIA NemoClaw is an open-source plugin that installs the NVIDIA OpenShell runtime to secure OpenClaw autonomous agents. OpenShell is the core technology: a sandboxed execution environment that sits between your AI agent and your infrastructure, enforcing security policies without modifying the agent itself.

The key innovation is **out-of-process policy enforcement** -- constraints are enforced at the environment level (kernel-level sandbox, deny-by-default networking, filesystem isolation) so that even a compromised agent cannot override them. This is fundamentally different from behavioral prompts or in-process guardrails. Policies are declarative YAML files that can be hot-reloaded without restarting the sandbox.

OpenShell supports Claude Code, Codex, and OpenClaw agents unmodified. It also includes a **Privacy Router** that determines whether inference calls stay on-device (local Nemotron models) or route to cloud models based on organizational policy -- useful for keeping sensitive context local while still leveraging frontier model capabilities.

---

## Technical Architecture

```
+------------------+     +-------------------+     +------------------+
|  Agent           |     |  OpenShell        |     |  Infrastructure  |
|  (Claude Code,   | --> |  Runtime          | --> |  (filesystem,    |
|   Codex, etc.)   |     |                   |     |   network, APIs) |
+------------------+     +-------------------+     +------------------+
                          |                   |
                          | Four Policy Layers|
                          | 1. Filesystem     |  (immutable: locked paths)
                          | 2. Network        |  (hot-reload: egress rules)
                          | 3. Process        |  (immutable: syscall filter)
                          | 4. Inference      |  (hot-reload: model routing)
                          +-------------------+
                          |                   |
                          | Three Components  |
                          | - Gateway         |  (control-plane API)
                          | - Policy Engine   |  (binary/path/method eval)
                          | - Privacy Router  |  (local vs cloud inference)
                          +-------------------+
```

**Key details:**
- Runs as K3s (lightweight Kubernetes) cluster inside a single Docker container
- Pre-installed tools in sandbox: Python 3.13, Node.js 22, Git, GitHub CLI
- Credentials injected as env vars at sandbox creation, never touch filesystem
- GPU support optional (requires NVIDIA drivers + Container Toolkit)
- Min requirements: 4 vCPU, 8 GB RAM, 20 GB disk

---

## Publisher Background

NVIDIA -- the dominant GPU manufacturer and increasingly an AI platform company. NemoClaw/OpenShell announced at GTC 2026 (March 16, 2026) as part of NVIDIA's broader Agent Toolkit. This is NVIDIA's play to become the runtime layer for autonomous agents, complementing their hardware dominance. The OpenClaw community (which NemoClaw wraps) is a separate open-source agent framework that NVIDIA is actively supporting.

---

## What's Valuable for Us

1. **Sandboxing pattern for Claude Code workers**: We currently run `claude --dangerously-skip-permissions` in tmux windows with zero isolation. OpenShell could wrap each worker in a policy-enforced container where filesystem writes are scoped to the project directory and network access is controlled. This is the right long-term architecture.

2. **Declarative YAML policy model**: The policy-as-code approach (filesystem rules, network egress rules, process restrictions) is a clean abstraction we could adopt even without OpenShell -- e.g., defining per-worker permissions in our orchestrator state.

3. **Credential management via providers**: OpenShell's pattern of injecting API keys as env vars without filesystem exposure is better than our current approach of inheriting the parent shell's environment.

4. **Privacy Router concept**: The idea of routing some inference locally (cheap/private) and some to cloud (complex reasoning) maps to our multi-model strategy. Worth studying even if we implement it differently.

---

## What's NOT Relevant

1. **K3s/Kubernetes overhead**: Running a Kubernetes cluster per sandbox is heavy for our use case. Our tmux-based orchestrator values simplicity (Rule: "simplicity over ego"). The Docker-in-K3s architecture adds significant resource overhead per worker.

2. **Single-player mode**: Currently designed for one developer, one environment. Our orchestrator runs 6 parallel workers -- OpenShell would need multi-tenant support to work for us.

3. **NVIDIA GPU dependency for inference routing**: The Privacy Router assumes NVIDIA hardware for local inference (Nemotron models on DGX/RTX). We use Claude Max subscriptions, not API keys with local model fallback.

4. **OpenClaw ecosystem focus**: NemoClaw specifically targets OpenClaw agents. We use Claude Code directly. OpenShell (the underlying runtime) is agent-agnostic, but NemoClaw adds OpenClaw-specific scaffolding we don't need.

---

## Future Use Cases

- **Phase 3 (Days 60-90)**: When OpenShell reaches beta/v1.0 with multi-sandbox support, evaluate replacing `--dangerously-skip-permissions` with OpenShell-wrapped Claude Code instances. This would give us proper isolation without changing the agent code.
- **Phase 4 (Days 90+)**: If we move to cloud-based agent execution (e.g., running workers on remote machines), OpenShell's security model becomes essential. The policy engine would protect against runaway agents in production.
- **Long-term**: The Privacy Router pattern could be valuable when we add local model support (e.g., running Nemotron or Llama locally for cheap tasks, Claude for complex reasoning).

---

## Key Takeaway

> **OpenShell is the right long-term architecture for sandboxing autonomous coding agents, but at alpha stage it's too heavy and immature for our lightweight tmux orchestrator -- watch for v1.0.**
