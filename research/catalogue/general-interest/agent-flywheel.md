# Agent Flywheel

> **One-liner VPS setup that provisions a full AI development environment with 3 agents, 30+ tools, and an interactive onboarding tutorial — your own cloud coding factory in 30 minutes.**

| Field | Value |
|-------|-------|
| Category | 🧩 General Interest |
| Website | [agent-flywheel.com](https://agent-flywheel.com/) |
| Publisher | Jeffrey Emanuel (solo developer) |
| License | Open-source (setup scripts and tools) |
| Tech Stack | Claude Code, Codex CLI, Gemini CLI, Bun, Rust, Go, tmux, zsh |
| Maturity | 🟢 Operational |
| Last Analyzed | 2026-04-04 |

---

## Burak's Notes

> *[Your personal observations, gut reactions, open questions, or ideas for how this tool connects to ongoing work. This section is yours — agents won't overwrite it.]*

---

## Relevance Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Relevance to our vision** | 6/10 | Same tmux + multi-agent + cloud VPS pattern. The "flywheel" framing (agents coding 24/7 on a remote server) aligns with our autonomous orchestration vision. The tooling ecosystem (NTM orchestration, Mail coordination, UBS bug scanning, BV task graph) is interesting. |
| **Novelty** | 5/10 | The core architecture (tmux + agents on a VPS) is well-known. The novelty is in the curated ecosystem of 20 interconnected tools and the interactive onboarding experience ("13 Steps to Liftoff"). |
| **Actionable** | 4/10 | Open-source scripts we could inspect, but the value is in the provisioning/onboarding UX, not in patterns we'd adopt. Our local-first approach (Ghostty + tmux) is deliberately different from cloud VPS. |

---

## Overview

Agent Flywheel is a one-liner installation system that transforms a cloud VPS (64GB RAM recommended) into a fully provisioned AI development environment. Within approximately 30 minutes, it configures three AI agents (Claude Code, OpenAI Codex, Google Gemini) alongside 30+ developer tools, all orchestrated through tmux.

The installation is idempotent and resumable with SHA256-verified security. It provisions a modern shell environment (zsh, oh-my-zsh, powerlevel10k, lsd, atuin, fzf, zoxide) and an interactive onboarding tutorial that walks users from Linux basics through agentic workflows.

The ecosystem includes 20 interconnected tools organized by function:
- **NTM**: Agent orchestration
- **Mail**: Agent coordination/communication
- **UBS**: Bug scanning
- **BV**: Task graph management

---

## Pricing

The platform itself is free (open-source), but the operational cost is substantial:

| Component | Monthly Cost |
|-----------|-------------|
| VPS hosting (64GB RAM) | $40-56 |
| Claude Max subscription | $200 |
| ChatGPT Pro subscription | $200 |
| **Total** | **$440-656** |

---

## What's Valuable for Us

1. **Curated tool ecosystem**: The idea of 20 purpose-built, interconnected tools (orchestration, coordination, bug scanning, task graph) is a more modular approach than our monolithic orchestrator. Worth examining which tool boundaries they chose.

2. **Interactive onboarding**: The "13 Steps to Liftoff" progressive tutorial is a strong UX pattern for getting new users productive with agent systems. Relevant if we ever productize our orchestrator.

3. **Idempotent provisioning**: The resumable, SHA256-verified installation pattern is good engineering for environment setup — our `run-tmux.sh` could benefit from similar robustness.

---

## What's NOT Relevant

- **Cloud VPS model**: We run locally on macOS. The cloud provisioning approach solves a different problem.
- **Multi-agent diversity**: Three different AI providers adds complexity we've avoided. We're Claude-only.
- **Subscription cost model**: $440-656/month for a full setup is high. We optimize for Claude Max $200/month alone.
- **Shell customization**: powerlevel10k, lsd, atuin are developer UX — not relevant to headless orchestration.

---

## Key Takeaway

> **Agent Flywheel validates the tmux + multi-agent pattern at VPS scale with a polished onboarding experience. The modular tool ecosystem (separate tools for orchestration, coordination, bug scanning, task graph) is an interesting architectural contrast to our monolithic orchestrator — worth studying for decomposition ideas.**
